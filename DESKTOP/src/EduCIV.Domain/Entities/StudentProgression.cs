using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class StudentProgression : MultiTenantEntity
{
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public int SchoolYearId { get; set; }
    public SchoolYear? SchoolYear { get; set; }
    public DecisionFinale FinalDecision { get; set; }
    public int? NextClassId { get; set; }
    public Class? NextClass { get; set; }
    public string? Comment { get; set; }
    public DateTime? AppliedAt { get; set; }
}
