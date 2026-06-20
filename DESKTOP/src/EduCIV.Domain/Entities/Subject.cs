namespace EduCIV.Domain.Entities;
public class Subject : MultiTenantEntity
{
    public string Name { get; set; } = string.Empty;
    public int Coefficient { get; set; }
    public float? MaxScore { get; set; }
    public string LevelGroup { get; set; } = string.Empty;
    public ICollection<Grade> Grades { get; set; } = new List<Grade>();
    public ICollection<TeacherSubject> Assignments { get; set; } = new List<TeacherSubject>();
    public ICollection<Timetable> Timetables { get; set; } = new List<Timetable>();
    public ICollection<AttendanceSession> AttendanceSessions { get; set; } = new List<AttendanceSession>();
}
