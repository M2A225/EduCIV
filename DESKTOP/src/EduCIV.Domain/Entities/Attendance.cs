using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class Attendance : MultiTenantEntity
{
    public int SessionId { get; set; }
    public AttendanceSession? Session { get; set; }
    public int StudentId { get; set; }
    public Student? Student { get; set; }
    public AttendanceStatus Status { get; set; }
    public int Version { get; set; } = 1;
    public bool Archived { get; set; }
    public DateTime? ArchivedAt { get; set; }
}
