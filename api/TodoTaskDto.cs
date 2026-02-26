using System.Text.Json.Serialization;

namespace api;

public class TodoTaskDto
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required int EstimatedTime { get; set; }
}

public enum TodoTaskOrder {
    MoveFirst,
    MoveLast
}

public class TodoTaskDtoRecord
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required int EstimatedTime { get; set; }
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public required TaskState State { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
    public required int Order {get; set; }
    public DateTime? FinishedAt { get; set; }
}