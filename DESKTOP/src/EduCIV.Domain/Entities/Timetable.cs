namespace EduCIV.Domain.Entities;
public class Timetable : MultiTenantEntity
{
    public int ClassId { get; set; }
    public Class? Class { get; set; }
    public int TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    public int SubjectId { get; set; }
    public Subject? Subject { get; set; }
    public string Slot { get; set; } = string.Empty;
    public ICollection<AttendanceSession> AttendanceSessions { get; set; } = new List<AttendanceSession>();
}
