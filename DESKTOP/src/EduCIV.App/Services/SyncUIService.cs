using EduCIV.Sync;
using EduCIV.Sync.Models;

namespace EduCIV.App.Services;

public class SyncUIService : ISyncUIService
{
    private readonly SyncEngine _engine;
    private SyncStatus _currentStatus;

    public event EventHandler<SyncStatus>? StatusChanged;
    public SyncStatus CurrentStatus => _currentStatus;

    public SyncUIService(SyncEngine engine)
    {
        _engine = engine;
        _currentStatus = new SyncStatus();
        _engine.StatusChanged += OnEngineStatusChanged;
        _engine.ProgressChanged += OnEngineProgressChanged;
    }

    private void OnEngineStatusChanged(object? sender, SyncStatus status)
    {
        _currentStatus = status;
        StatusChanged?.Invoke(this, _currentStatus);
    }

    private void OnEngineProgressChanged(object? sender, SyncProgress progress)
    {
        StatusChanged?.Invoke(this, _currentStatus);
    }

    public Task StartAsync()
    {
        return _engine.CheckConnectivityAsync();
    }

    public Task StopAsync()
    {
        return Task.CompletedTask;
    }

    public async Task TriggerSyncAsync()
    {
        await _engine.TriggerSyncAsync();
    }

    public async Task<int> GetPendingCountAsync()
    {
        return await _engine.CountPendingAsync();
    }

    public async Task ClearFailedAsync()
    {
        await _engine.ClearFailedOperationsAsync();
    }
}

