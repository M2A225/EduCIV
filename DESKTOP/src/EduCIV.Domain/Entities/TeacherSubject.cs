namespace EduCIV.Domain.Entities;
public class TeacherSubject : MultiTenantEntity
{
    public int TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    public int SubjectId { get; set; }
    public Subject? Subject { get; set; }
    public int ClassId { get; set; }
    public Class? Class { get; set; }
}
