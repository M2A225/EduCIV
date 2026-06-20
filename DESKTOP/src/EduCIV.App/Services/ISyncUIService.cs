using EduCIV.Sync.Models;

namespace EduCIV.App.Services;

public interface ISyncUIService
{
    SyncStatus CurrentStatus { get; }
    event EventHandler<SyncStatus>? StatusChanged;
    Task StartAsync();
    Task StopAsync();
    Task TriggerSyncAsync();
    Task<int> GetPendingCountAsync();
    Task ClearFailedAsync();
}

