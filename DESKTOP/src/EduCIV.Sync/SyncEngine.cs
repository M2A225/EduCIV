using System.Threading.Channels;
using EduCIV.Api;
using EduCIV.Api.Models;
using EduCIV.Data;
using EduCIV.Domain.Entities;
using EduCIV.Sync.Models;
using static EduCIV.Domain.Enums.AllEnums;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace EduCIV.Sync;

public class SyncEngine : IDisposable
{
    private readonly ApiClient _apiClient;
    private readonly DbContextOptions<EduCIVContext> _dbOptions;
    private readonly Channel<SyncOperation> _queue;
    private readonly ChannelWriter<SyncOperation> _writer;
    private readonly ChannelReader<SyncOperation> _reader;
    private readonly System.Timers.Timer _syncTimer;
    private readonly SemaphoreSlim _syncLock;
    private readonly CancellationTokenSource _cts;
    private SyncStatus _currentStatus;

    public const int MaxBatchSize = 50;
    public const int MaxRetries = 3;

    public event EventHandler<SyncStatus>? StatusChanged;
    public event EventHandler<SyncProgress>? ProgressChanged;

    public bool IsAuthenticated { get; set; }

    public SyncEngine(ApiClient apiClient, DbContextOptions<EduCIVContext> dbOptions)
    {
        _apiClient = apiClient;
        _dbOptions = dbOptions;
        _cts = new CancellationTokenSource();
        _queue = Channel.CreateBounded<SyncOperation>(new BoundedChannelOptions(1000)
        {
            FullMode = BoundedChannelFullMode.Wait
        });
        _writer = _queue.Writer;
        _reader = _queue.Reader;
        _syncLock = new SemaphoreSlim(1, 1);
        _syncTimer = new System.Timers.Timer(30000);
        _syncTimer.Elapsed += async (_, _) => await ProcessQueueAsync();
        _syncTimer.AutoReset = true;
        _syncTimer.Enabled = false;
        _currentStatus = new SyncStatus();
    }

    public void Start()
    {
        _syncTimer.Enabled = true;
    }

    public async Task EnqueueOperationAsync(SyncOperation operation)
    {
        await _writer.WriteAsync(operation);
        _currentStatus.PendingOperations = await CountPendingAsync();
        StatusChanged?.Invoke(this, _currentStatus);
    }

    public async Task EnqueueBatchAsync(IEnumerable<SyncOperation> operations)
    {
        foreach (var op in operations)
            await _writer.WriteAsync(op);
        _currentStatus.PendingOperations = await CountPendingAsync();
        StatusChanged?.Invoke(this, _currentStatus);
    }

    private EduCIVContext CreateContext()
    {
        return new EduCIVContext(_dbOptions);
    }

    public async Task ProcessQueueAsync()
    {
        if (!await _syncLock.WaitAsync(0)) return;
        try
        {
            _currentStatus.ConnectionStatus = SyncConnectionStatus.Connecting;
            StatusChanged?.Invoke(this, _currentStatus);

            _currentStatus.IsOnline = await CheckConnectivityAsync();
            if (!_currentStatus.IsOnline)
            {
                _currentStatus.ConnectionStatus = SyncConnectionStatus.Offline;
                StatusChanged?.Invoke(this, _currentStatus);
                return;
            }

            _currentStatus.ConnectionStatus = SyncConnectionStatus.Syncing;
            StatusChanged?.Invoke(this, _currentStatus);

            if (IsAuthenticated)
            {
                await PushPendingOperationsAsync();
                await PullRemoteChangesAsync();
            }

            _currentStatus.ConnectionStatus = SyncConnectionStatus.Connected;
            _currentStatus.LastSuccessfulSync = DateTime.UtcNow;
            _currentStatus.LastErrorMessage = null;
            _currentStatus.PendingOperations = await CountPendingAsync();
            StatusChanged?.Invoke(this, _currentStatus);
        }
        catch (Exception ex)
        {
            _currentStatus.ConnectionStatus = SyncConnectionStatus.Error;
            _currentStatus.LastErrorMessage = ex.Message;
            StatusChanged?.Invoke(this, _currentStatus);
        }
        finally
        {
            _syncLock.Release();
        }
    }

    private async Task PushPendingOperationsAsync()
    {
        List<SyncOperation> pendingOps;
        using (var ctx = CreateContext())
        {
            pendingOps = await ctx.SyncOperations
                .Where(o => o.Status == SyncOperationStatus.PENDING)
                .OrderBy(o => o.CreatedAt)
                .Take(MaxBatchSize)
                .ToListAsync();
        }

        if (pendingOps.Count == 0) return;

        var progress = new SyncProgress
        {
            Total = pendingOps.Count,
            Completed = 0,
            CurrentOperation = "Pushing pending operations"
        };
        ProgressChanged?.Invoke(this, progress);

        var request = new SyncPushRequest
        {
            Operations = pendingOps.Select(o => new SyncOperationDto
            {
                Id = o.ClientOperationId.ToString(),
                Entity = o.Entity.ToString(),
                Action = o.Action,
                Payload = o.Payload,
                Timestamp = o.CreatedAt
            }).ToList()
        };

        try
        {
            var response = await _apiClient.PostAsync<SyncPullResponse>("sync/push", request);
            if (response?.Success == true && response.Data?.Operations != null)
            {
                using (var ctx = CreateContext())
                {
                    foreach (var remoteOp in response.Data.Operations)
                    {
                        var local = pendingOps.FirstOrDefault(o =>
                            o.ClientOperationId.ToString() == remoteOp.Id);
                        if (local != null)
                        {
                            local.Status = SyncOperationStatus.SYNCED;
                            
                            ctx.SyncOperations.Update(local);
                        }
                    }
                    try
                    {
                        await ctx.SaveChangesAsync();
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        foreach (var entry in ctx.ChangeTracker.Entries<SyncOperation>())
                        {
                            entry.State = EntityState.Unchanged;
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            using (var ctx = CreateContext())
            {
                foreach (var op in pendingOps)
                {
                    op.RetryCount++;
                    op.LastError = ex.Message;
                    if (op.RetryCount >= MaxRetries)
                        op.Status = SyncOperationStatus.FAILED;
                    ctx.SyncOperations.Update(op);
                }
                await ctx.SaveChangesAsync();
            }
        }

        progress.Completed = pendingOps.Count;
        ProgressChanged?.Invoke(this, progress);

        using (var countCtx = CreateContext())
        {
            _currentStatus.FailedOperations = await countCtx.SyncOperations
                .CountAsync(o => o.Status == SyncOperationStatus.FAILED);
        }
    }

    private async Task PullRemoteChangesAsync()
    {
        ApiResponse<SyncPullResponse>? response;
        try
        {
            response = await _apiClient.GetAsync<SyncPullResponse>("sync/pull");
        }
        catch
        {
            return;
        }

        if (response?.Success != true || response.Data?.Operations == null || response.Data.Operations.Count == 0)
            return;

        var progress = new SyncProgress
        {
            Total = response.Data.Operations.Count,
            Completed = 0,
            CurrentOperation = "Applying remote changes"
        };
        ProgressChanged?.Invoke(this, progress);

        foreach (var dto in response.Data.Operations)
        {
            await ApplyRemoteOperationAsync(dto);
            progress.Completed++;
            ProgressChanged?.Invoke(this, progress);
        }
    }

    private async Task ApplyRemoteOperationAsync(SyncOperationDto dto)
    {
        if (string.IsNullOrEmpty(dto.Payload)) return;

        using var ctx = CreateContext();
        try
        {
            switch (dto.Action)
            {
                case "CREATE":
                case "UPDATE":
                    var entity = DeserializeEntity(dto.Entity, dto.Payload);
                    if (entity == null) return;
                    var existing = await ctx.FindAsync(entity.GetType(), ((EntityBase)entity).Id);
                    if (existing != null)
                    {
                        var existingVersion = ((EntityBase)existing).SyncVersion;
                        var incomingVersion = ((EntityBase)entity).SyncVersion;
                        if (incomingVersion < existingVersion)
                            return;
                        ctx.Entry(existing).CurrentValues.SetValues(entity);
                        ((EntityBase)existing).SyncVersion = existingVersion + 1;
                    }
                    else
                    {
                        ((EntityBase)entity).SyncVersion = 1;
                        ctx.Entry(entity).State = EntityState.Added;
                    }
                    break;
                case "DELETE":
                    var deleteEntity = DeserializeEntity(dto.Entity, dto.Payload);
                    if (deleteEntity == null) return;
                    var existingDelete = await ctx.FindAsync(deleteEntity.GetType(), ((EntityBase)deleteEntity).Id);
                    if (existingDelete != null)
                        ctx.Entry(existingDelete).State = EntityState.Deleted;
                    break;
            }
            await ctx.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException ex)
        {
            foreach (var entry in ex.Entries)
            {
                entry.State = EntityState.Unchanged;
            }
        }
    }

    private object? DeserializeEntity(string entityType, string payload)
    {
        return entityType switch
        {
            "STUDENT" => JsonConvert.DeserializeObject<Student>(payload),
            "GRADE" => JsonConvert.DeserializeObject<Grade>(payload),
            "PAYMENT" => JsonConvert.DeserializeObject<Payment>(payload),
            "ATTENDANCE" => JsonConvert.DeserializeObject<Attendance>(payload),
            "INCIDENT" => JsonConvert.DeserializeObject<Incident>(payload),
            "TEACHER" => JsonConvert.DeserializeObject<Teacher>(payload),
            "CLASS" => JsonConvert.DeserializeObject<Domain.Entities.Class>(payload),
            "SUBJECT" => JsonConvert.DeserializeObject<Subject>(payload),
            "TIMETABLE" => JsonConvert.DeserializeObject<Timetable>(payload),
            _ => null
        };
    }

    public async Task<bool> CheckConnectivityAsync()
    {
        try
        {
            var result = await _apiClient.GetAsync<object>("health");
            return result?.Success == true;
        }
        catch
        {
            return false;
        }
    }

    public async Task TriggerSyncAsync()
    {
        await ProcessQueueAsync();
    }

    public async Task<int> CountPendingAsync()
    {
        using var ctx = CreateContext();
        return await ctx.SyncOperations.CountAsync(o => o.Status == SyncOperationStatus.PENDING);
    }

    public async Task ClearFailedOperationsAsync()
    {
        using var ctx = CreateContext();
        var failed = await ctx.SyncOperations
            .Where(o => o.Status == SyncOperationStatus.FAILED)
            .ToListAsync();
        ctx.SyncOperations.RemoveRange(failed);
        await ctx.SaveChangesAsync();
        _currentStatus.FailedOperations = 0;
        _currentStatus.PendingOperations = await CountPendingAsync();
        StatusChanged?.Invoke(this, _currentStatus);
    }

    public void Dispose()
    {
        _cts.Cancel();
        _cts.Dispose();
        _syncTimer.Stop();
        _syncTimer.Dispose();
        _syncLock.Dispose();
        _writer.TryComplete();
        GC.SuppressFinalize(this);
    }
}

