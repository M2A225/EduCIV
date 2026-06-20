namespace EduCIV.Domain.Entities;
public class ReportCard : MultiTenantEntity
{
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public int PeriodId { get; set; }
    public AcademicPeriod? Period { get; set; }
    public string Year { get; set; } = string.Empty;
    public float Average { get; set; }
    public int Rank { get; set; }
    public float TotalPoints { get; set; }
    public float TotalCoef { get; set; }
    public string? Appreciation { get; set; }
    public string? Decision { get; set; }
    public bool IsAnnual { get; set; }
}
