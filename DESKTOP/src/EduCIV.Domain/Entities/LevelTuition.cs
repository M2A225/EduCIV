namespace EduCIV.Domain.Entities;
public class LevelTuition : MultiTenantEntity
{
    public string Level { get; set; } = string.Empty;
    public int Amount { get; set; }
}
