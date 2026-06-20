namespace EduCIV.Domain.Entities;
public class PaymentAuditLog : MultiTenantEntity
{
    public int PaymentId { get; set; }
    public Payment? Payment { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? Data { get; set; }
    public string? OldData { get; set; }
    public string? NewData { get; set; }
    public int? PerformedBy { get; set; }
}
