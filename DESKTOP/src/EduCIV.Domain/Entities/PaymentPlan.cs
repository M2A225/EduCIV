namespace EduCIV.Domain.Entities;
public class PaymentPlan : MultiTenantEntity
{
    public string Name { get; set; } = string.Empty;
    public int TotalAmount { get; set; }
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
