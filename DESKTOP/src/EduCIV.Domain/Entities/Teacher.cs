namespace EduCIV.Domain.Entities;
public class Teacher : MultiTenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Grade { get; set; }
    public string? Specialty { get; set; }
    public DateTime? HireDate { get; set; }
    public string? Address { get; set; }
    public ICollection<TeacherSubject> Assignments { get; set; } = new List<TeacherSubject>();
    public ICollection<Timetable> Timetables { get; set; } = new List<Timetable>();
    public ICollection<AttendanceSession> AttendanceSessions { get; set; } = new List<AttendanceSession>();
    public ICollection<TeacherProgressionVote> ProgressionVotes { get; set; } = new List<TeacherProgressionVote>();
    public ICollection<Incident> Incidents { get; set; } = new List<Incident>();
}
