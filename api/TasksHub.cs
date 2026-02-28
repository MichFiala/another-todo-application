using System.Threading.Channels;

namespace api;

public class TasksHub
{
    private readonly Dictionary<string, (List<Channel<InvalidateTasksCache>> Channels, DateTime Time)> _subscribers = [];
    private readonly Lock _lock = new();

    public ChannelReader<InvalidateTasksCache> Subscribe(string userId)
    {
        var channel = Channel.CreateUnbounded<InvalidateTasksCache>();

        lock (_lock)
        {
            if (!_subscribers.ContainsKey(userId))
                _subscribers.TryAdd(userId, ([], DateTime.Now));

            _subscribers[userId].Channels.Add(channel);
        }

        return channel.Reader;
    }

    public (int cleaned, int remaining) Cleanup()
    {
        var inActiveUsers = new List<string>();

        foreach (string userId in _subscribers.Keys)
        {
            if (DateTime.Now - _subscribers[userId].Time > TimeSpan.FromMinutes(10))
                inActiveUsers.Add(userId);
        }

        lock (_lock)
        {
            foreach (string userId in inActiveUsers)
            {
                foreach (var channel in _subscribers[userId].Channels)
                {
                    channel.Writer.TryComplete();
                }

                _subscribers.Remove(userId);
            }
        }

        return (inActiveUsers.Count, _subscribers.Keys.Count);
    }

    public void Unsubscribe(string userId, ChannelReader<InvalidateTasksCache> reader)
    {
        lock (_lock)
        {
            if (!_subscribers.TryGetValue(userId, out var channels))
                return;
            Channel<InvalidateTasksCache>? channel = channels.Channels.FirstOrDefault(c => c.Reader == reader);

            if (channel is null) return;

            channel.Writer.TryComplete();
            channels.Channels.Remove(channel);
        }
    }

    public void Notify(string userId)
    {

        lock (_lock)
        {

            if (!_subscribers.TryGetValue(userId, out var channels))
                return;
            channels.Time = DateTime.Now;
            channels.Channels.ForEach(channel =>
            {
                channel.Writer.TryWrite(new InvalidateTasksCache());
                Console.WriteLine("Notified reader");
            });
        }
    }
}

public class TasksHubBackgroundCleanService(TasksHub tasksHub, ILogger<TasksHubBackgroundCleanService> logger) : BackgroundService
{

    private readonly TimeSpan _period = TimeSpan.FromMinutes(5);

    protected async override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using PeriodicTimer timer = new PeriodicTimer(_period);

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                logger.LogInformation("Triggering tasks hub cleanup");

                (int cleaned, int remaining) =  tasksHub.Cleanup();

                logger.LogInformation("Tasks hub cleanup cleaned: {0}, remaining: {1}", cleaned, remaining);
            }
            catch (Exception ex)
            {
                logger.LogInformation(
                    $"Failed to execute PeriodicHostedService with exception message {ex.Message}. Good luck next round!");
            }
        }
    }
}
