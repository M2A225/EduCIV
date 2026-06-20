namespace EduCIV.Domain.Entities;
public class SchoolYear : MultiTenantEntity
{
    public string YearRange { get; set; } = string.Empty;
    public bool Closed { get; set; }
    public DateTime? ClosedAt { get; set; }
    public int? ClosedBy { get; set; }
    public ICollection<AcademicPeriod> Periods { get; set; } = new List<AcademicPeriod>();
    public ICollection<TeacherProgressionVote> Votes { get; set; } = new List<TeacherProgressionVote>();
    public ICollection<StudentProgression> Progressions { get; set; } = new List<StudentProgression>();
}
