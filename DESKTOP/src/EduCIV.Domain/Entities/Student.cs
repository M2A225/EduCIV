using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class Student : MultiTenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Matricule { get; set; }
    public DateTime? Dob { get; set; }
    public string? PlaceBirth { get; set; }
    public Sexe? Sexe { get; set; }
    public string? Nationality { get; set; }
    public bool IsRepeater { get; set; }
    public string? Regime { get; set; }
    public bool IsInternal { get; set; }
    public bool IsAffected { get; set; } = true;
    public string? AvatarUrl { get; set; }
    public string? ParentName { get; set; }
    public string? ParentPhone { get; set; }
    public int? UserId { get; set; }
    public User? User { get; set; }
    public int? ClassId { get; set; }
    public Class? Class { get; set; }
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
    public ICollection<ReportCard> ReportCards { get; set; } = new List<ReportCard>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<StudentParent> ParentLinks { get; set; } = new List<StudentParent>();
    public ICollection<Incident> Incidents { get; set; } = new List<Incident>();
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    public ICollection<StudentProgression> Progressions { get; set; } = new List<StudentProgression>();
}
