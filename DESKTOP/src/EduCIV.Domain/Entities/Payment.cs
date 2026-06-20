using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class Payment : MultiTenantEntity
{
    public int AmountFcfa { get; set; }
    public PaymentType PaymentType { get; set; }
    public DateTime PaymentDate { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public string? ReceiptHash { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.VALIDE;
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public int? PlanId { get; set; }
    public PaymentPlan? Plan { get; set; }
    public ICollection<PaymentAuditLog> AuditLogs { get; set; } = new List<PaymentAuditLog>();
}
