namespace EduCIV.Sync.Models;

public enum SyncConnectionStatus
{
    Disconnected,
    Connecting,
    Connected,
    Syncing,
    Error,
    Offline
}

public class SyncStatus
{
    public SyncConnectionStatus ConnectionStatus { get; set; } = SyncConnectionStatus.Disconnected;
    public int PendingOperations { get; set; }
    public int FailedOperations { get; set; }
    public DateTime? LastSuccessfulSync { get; set; }
    public string? LastErrorMessage { get; set; }
    public bool IsOnline { get; set; }
}

public class SyncProgress
{
    public int Total { get; set; }
    public int Completed { get; set; }
    public string? CurrentOperation { get; set; }
    public double Percentage => Total > 0 ? Math.Round((double)Completed / Total * 100, 2) : 0;
}
