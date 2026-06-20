using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class SyncOperation
{
    public int Id { get; set; }
    public string ClientOperationId { get; set; } = Guid.NewGuid().ToString();
    public SyncEntity Entity { get; set; }
    public string? EntityId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Payload { get; set; }
    public int SchoolId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int RetryCount { get; set; }
    public string? LastError { get; set; }
    public SyncOperationStatus Status { get; set; } = SyncOperationStatus.PENDING;
}
