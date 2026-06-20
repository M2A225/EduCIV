using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class AcademicPeriod : MultiTenantEntity
{
    public string Name { get; set; } = string.Empty;
    public PeriodType? PeriodType { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int? SchoolYearId { get; set; }
    public SchoolYear? SchoolYear { get; set; }
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
    public ICollection<ReportCard> ReportCards { get; set; } = new List<ReportCard>();
}
