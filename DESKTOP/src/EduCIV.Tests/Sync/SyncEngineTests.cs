using EduCIV.Api;
using EduCIV.Data;
using EduCIV.Domain.Entities;
using EduCIV.Sync;
using EduCIV.Sync.Models;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;
using static EduCIV.Domain.Enums.AllEnums;

namespace EduCIV.Tests.Sync;

public class SyncEngineTests : IDisposable
{
    private readonly ApiClient _apiClient;
    private readonly DbContextOptions<EduCIVContext> _dbOptions;
    private readonly SyncEngine _syncEngine;

    public SyncEngineTests()
    {
        _apiClient = new ApiClient(new HttpClient());
        _dbOptions = new DbContextOptionsBuilder<EduCIVContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _syncEngine = new SyncEngine(_apiClient, _dbOptions);
    }

    public void Dispose()
    {
        _syncEngine.Dispose();
    }

    [Fact]
    public void SyncEngine_Constants_ShouldHaveCorrectValues()
    {
        SyncEngine.MaxBatchSize.Should().Be(50);
        SyncEngine.MaxRetries.Should().Be(3);
    }

    [Fact]
    public void SyncEngine_InitialStatus_ShouldBeDisconnected()
    {
        var status = new SyncStatus();

        status.ConnectionStatus.Should().Be(SyncConnectionStatus.Disconnected);
        status.PendingOperations.Should().Be(0);
        status.FailedOperations.Should().Be(0);
        status.LastSuccessfulSync.Should().BeNull();
        status.IsOnline.Should().BeFalse();
    }

    [Fact]
    public void SyncProgress_Percentage_WhenTotalIsZero_ShouldReturnZero()
    {
        var progress = new SyncProgress { Total = 0, Completed = 0 };

        progress.Percentage.Should().Be(0);
    }

    [Fact]
    public void SyncProgress_Percentage_WhenHalfComplete_ShouldReturn50()
    {
        var progress = new SyncProgress { Total = 10, Completed = 5 };

        progress.Percentage.Should().Be(50);
    }

    [Fact]
    public void SyncProgress_Percentage_WhenAllComplete_ShouldReturn100()
    {
        var progress = new SyncProgress { Total = 20, Completed = 20 };

        progress.Percentage.Should().Be(100);
    }

    [Fact]
    public async Task EnqueueOperationAsync_ShouldAcceptOperation()
    {
        var operation = new SyncOperation
        {
            ClientOperationId = Guid.NewGuid().ToString(),
            Entity = SyncEntity.STUDENT,
            Action = "CREATE",
            Payload = "{}",
            Status = SyncOperationStatus.PENDING,
            CreatedAt = DateTime.UtcNow
        };

        var act = async () => await _syncEngine.EnqueueOperationAsync(operation);

        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task EnqueueBatchAsync_ShouldAcceptMultipleOperations()
    {
        var operations = Enumerable.Range(1, 5).Select(i => new SyncOperation
        {
            ClientOperationId = Guid.NewGuid().ToString(),
            Entity = SyncEntity.GRADE,
            Action = "UPDATE",
            Payload = $"{{\"id\":{i}}}",
            Status = SyncOperationStatus.PENDING,
            CreatedAt = DateTime.UtcNow
        }).ToList();

        var act = async () => await _syncEngine.EnqueueBatchAsync(operations);

        await act.Should().NotThrowAsync();
    }

    [Fact]
    public void SyncEngine_ShouldFireStatusChangedEvent()
    {
        var eventFired = false;
        _syncEngine.StatusChanged += (_, _) => eventFired = true;

        var operation = new SyncOperation
        {
            ClientOperationId = Guid.NewGuid().ToString(),
            Entity = SyncEntity.STUDENT,
            Action = "CREATE",
            Payload = "{}",
            Status = SyncOperationStatus.PENDING,
            CreatedAt = DateTime.UtcNow
        };

        _syncEngine.EnqueueOperationAsync(operation).Wait();

        eventFired.Should().BeTrue();
    }

    [Fact]
    public void SyncEngine_IsAuthenticated_ShouldDefaultToFalse()
    {
        _syncEngine.IsAuthenticated.Should().BeFalse();
    }

    [Fact]
    public void SyncEngine_Dispose_ShouldNotThrow()
    {
        var engine = new SyncEngine(_apiClient, _dbOptions);

        var act = () => engine.Dispose();

        act.Should().NotThrow();
    }
}
