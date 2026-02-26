namespace api;

public class TodoTask
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required int EstimatedTime { get; set; }
    public TaskState State { get; set; } = TaskState.Active;
    public DateTime CreatedAt { get; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? FinishedAt { get; set; }
    public required string UserId { get; set; }
    /// <summary>
    /// 0 is on top, highest is on the bottom
    /// </summary>
    public required int Order {get; set; }  
}

public enum TaskState
{
    Active,
    Finished
}
