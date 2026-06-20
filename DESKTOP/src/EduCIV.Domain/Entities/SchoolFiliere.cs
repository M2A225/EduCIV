namespace EduCIV.Domain.Entities;
public class SchoolFiliere : MultiTenantEntity
{
    public new int SchoolId { get; set; }
    public School? School { get; set; }
    public string Filiere { get; set; } = string.Empty;
}
