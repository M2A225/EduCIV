using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class TeacherProgressionVote : MultiTenantEntity
{
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public int TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    public int SchoolYearId { get; set; }
    public SchoolYear? SchoolYear { get; set; }
    public DecisionVote Decision { get; set; }
    public string? Comment { get; set; }
}
