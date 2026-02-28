namespace api;

public class InvalidateTasksCache
{
    public string Message {get;set;} = "Collection Modified";
}

public class TasksCollectionModified
{
    public required string UserId {get; set;}
}


