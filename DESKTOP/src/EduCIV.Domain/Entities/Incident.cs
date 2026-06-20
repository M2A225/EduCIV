using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class Incident : MultiTenantEntity
{
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public int? TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    public IncidentType Type { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateTime Date { get; set; } = DateTime.UtcNow;
    public IncidentStatus Status { get; set; } = IncidentStatus.EN_COURS;
}
