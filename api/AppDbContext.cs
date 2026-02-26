using Microsoft.EntityFrameworkCore;

namespace api;

internal class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
    }

    public DbSet<TodoTask> TodoTasks { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("task");

        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TodoTask>().Property(e => e.State).HasConversion<string>();
    }
}