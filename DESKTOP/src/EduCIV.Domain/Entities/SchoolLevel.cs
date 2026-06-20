namespace EduCIV.Domain.Entities;
public class SchoolLevel : MultiTenantEntity
{
    public new int SchoolId { get; set; }
    public School? School { get; set; }
    public string Level { get; set; } = string.Empty;
}
