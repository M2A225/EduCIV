using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class Grade : MultiTenantEntity
{
    public float Value { get; set; }
    public GradeType Type { get; set; }
    public string? Comment { get; set; }
    public float? MaxScore { get; set; }
    public GradeStatus Status { get; set; } = GradeStatus.EN_ATTENTE;
    public int? ValidatedBy { get; set; }
    public DateTime? ValidatedAt { get; set; }
    public string? RejectionReason { get; set; }
    public bool Archived { get; set; }
    public DateTime? ArchivedAt { get; set; }
    public int PeriodId { get; set; }
    public AcademicPeriod? Period { get; set; }
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public int SubjectId { get; set; }
    public Subject? Subject { get; set; }
}
