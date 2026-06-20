namespace EduCIV.Domain.Entities;
public class StudentParent : MultiTenantEntity
{
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public int ParentUserId { get; set; }
    public User? Parent { get; set; }
    public string? Relation { get; set; }
}
