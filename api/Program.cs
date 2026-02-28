using System.Security.Claims;
using System.Threading.Channels;
using api;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("CorsPolicy", options =>
        {
            options.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins("http://localhost:3000");
        });
    });
// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSingleton<TasksHub>();
builder.Services.AddSingleton<TasksHubBackgroundCleanService>();
builder.Services.AddHostedService(provider => provider.GetRequiredService<TasksHubBackgroundCleanService>());


string? connectionString = builder.Configuration["ConnectionStrings:Default"];

Console.WriteLine($"Connection String: {connectionString?.Substring(0, 10)}...");

builder.Services.AddDbContextFactory<AppDbContext>(options =>
    options.UseNpgsql(connectionString), ServiceLifetime.Scoped);


string? auth0Domain = builder.Configuration["Auth0:Domain"];
string? auth0Audience = builder.Configuration["Auth0:Audience"];
string? auth0Issuer = builder.Configuration["Auth0:Issuer"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
     .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
     {
         options.Authority = $"https://{auth0Domain}";
         options.Audience = auth0Audience;
         options.TokenValidationParameters = new TokenValidationParameters
         {
             ValidateIssuer = true,
             ValidateIssuerSigningKey = true,
             ValidateAudience = true,
             ValidAudiences = [auth0Audience],
             ValidIssuers = [auth0Issuer]
         };
     });
builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

if (app.Environment.IsDevelopment())
{
    app.UseCors("CorsPolicy");
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();


app.MapPost("/tasks", async (TodoTaskDto task, ClaimsPrincipal user, TasksHub tasksHub, IDbContextFactory<AppDbContext> dbContextFactory) =>
{
    string? userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(userId))
        return Results.Unauthorized();

    AppDbContext context = await dbContextFactory.CreateDbContextAsync();

    await context.TodoTasks.Where(t => t.UserId == userId && t.State == TaskState.Active)
                           .ExecuteUpdateAsync(setPropertyCalls => setPropertyCalls.SetProperty(t => t.Order, t => t.Order + 1));

    TodoTask todoTask = new()
    {
        Name = task.Name,
        Description = task.Description,
        EstimatedTime = task.EstimatedTime,
        State = TaskState.Active,
        UserId = userId,
        Order = 0
    };

    context.TodoTasks.Add(todoTask!);

    await context.SaveChangesAsync();

    tasksHub.Notify(userId);

    return Results.Ok(todoTask);
}).RequireAuthorization();

app.MapGet("/tasks",
    async Task<Ok<List<TodoTaskDtoRecord>>>
    (ClaimsPrincipal user, IDbContextFactory<AppDbContext> dbContextFactory) =>
{
    string? userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(userId))
        return TypedResults.Ok(new List<TodoTaskDtoRecord>());

    var context = await dbContextFactory.CreateDbContextAsync();
    var tasks = await context.TodoTasks.Where(t => t.UserId == userId && (t.FinishedAt == null || t.FinishedAt.Value.Date == DateTime.UtcNow.Date)).ToListAsync();

    var taskRecords = tasks.Select(t => new TodoTaskDtoRecord
    {
        Id = t.Id,
        Name = t.Name,
        Description = t.Description,
        EstimatedTime = t.EstimatedTime,
        State = t.State,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt,
        FinishedAt = t.FinishedAt,
        Order = t.Order
    }).ToList();

    return TypedResults.Ok(taskRecords);
}).RequireAuthorization();

app.MapDelete("/tasks/{id}", async (int id, ClaimsPrincipal user, TasksHub tasksHub, IDbContextFactory<AppDbContext> dbContextFactory) =>
{
    string? userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(userId))
        return TypedResults.Ok(new List<TodoTaskDtoRecord>());

    var context = await dbContextFactory.CreateDbContextAsync();
    var task = await context.TodoTasks.Where(t => t.Id == id && t.UserId == userId).ExecuteDeleteAsync();

    tasksHub.Notify(userId);

    return Results.NoContent();
}).RequireAuthorization();

app.MapPut("/tasks/{id}/state", async (int id, TaskState state, ClaimsPrincipal user, TasksHub tasksHub, IDbContextFactory<AppDbContext> dbContextFactory) =>
{
    string? userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(userId))
        return TypedResults.Ok(new List<TodoTaskDtoRecord>());

    AppDbContext context = await dbContextFactory.CreateDbContextAsync();

    if (state == TaskState.Active)
    {
        int maxOrder = await context.TodoTasks.Where(t => t.UserId == userId && t.State == TaskState.Active).MaxAsync(t => (int?)t.Order) ?? -1;

        await context.TodoTasks.Where(t => t.Id == id && t.UserId == userId).ExecuteUpdateAsync(setPropertyCalls => setPropertyCalls.SetProperty(t => t.Order, t => maxOrder + 1)
                                                                                                              .SetProperty(t => t.UpdatedAt, DateTime.UtcNow));
    }
    else if (state == TaskState.Finished)
    {
        await context.TodoTasks.Where(t => t.Id == id && t.UserId == userId).ExecuteUpdateAsync(propertyCalls => propertyCalls
                    .SetProperty(t => t.State, state)
                    .SetProperty(t => t.UpdatedAt, DateTime.UtcNow)
                    .SetProperty(t => t.FinishedAt, DateTime.UtcNow));
    }
    tasksHub.Notify(userId);

    return Results.NoContent();
}).RequireAuthorization();

app.MapPut("/tasks/shuffle", async (
    ClaimsPrincipal user,
    TasksHub tasksHub,
    IDbContextFactory<AppDbContext> dbContextFactory) =>
{
    string? userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(userId))
        return TypedResults.Ok(new List<TodoTaskDtoRecord>());

    AppDbContext context = await dbContextFactory.CreateDbContextAsync();

    List<TodoTask> activeTasks = await context.TodoTasks.Where(t => t.UserId == userId && t.State == TaskState.Active)
                                                        .AsTracking()
                                                        .ToListAsync();

    var random = new Random();

    activeTasks = activeTasks.OrderBy(_ => random.Next()).ToList();

    for (int i = 0; i < activeTasks.Count; i++)
    {
        activeTasks[i].Order = i;
        activeTasks[i].UpdatedAt = DateTime.UtcNow;
    }

    await context.SaveChangesAsync();

    tasksHub.Notify(userId);

    return Results.NoContent();
}).RequireAuthorization();

app.MapGet("/tasks/invalidate", (
    TasksHub tasksHub,
    ClaimsPrincipal user,
    CancellationToken cancellationToken) =>
{
    string? currentUserId = user.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(currentUserId))
        return TypedResults.Ok();

    ChannelReader<InvalidateTasksCache> reader = tasksHub.Subscribe(currentUserId);

    // cancellationToken.Register(() => tasksHub.Unsubscribe(currentUserId, reader));

    return Results.ServerSentEvents(
        reader.ReadAllAsync(cancellationToken));
}).RequireAuthorization();

app.MapFallbackToFile("index.html");

using var scope = app.Services.CreateScope();
var contextFactory = scope.ServiceProvider.GetRequiredService<IDbContextFactory<AppDbContext>>();
using var context = contextFactory.CreateDbContext();

try
{
    await context.Database.MigrateAsync();
}
catch (Exception ex)
{
    Console.WriteLine($"Error applying migrations: {ex.Message}");
    throw;
}

app.Run();