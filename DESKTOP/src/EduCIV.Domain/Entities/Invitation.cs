using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class Invitation : MultiTenantEntity
{
    public string Code { get; set; } = string.Empty;
    public string? Token { get; set; }
    public TargetType TargetType { get; set; }
    public string TargetIds { get; set; } = string.Empty;
    public int MaxUses { get; set; } = 2;
    public int CurrentUses { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public int? CreatedBy { get; set; }
}
