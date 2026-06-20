namespace EduCIV.Domain.Entities;
public class Class : MultiTenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Level { get; set; }
    public string? Section { get; set; }
    public int? Capacity { get; set; }
    public string? Classroom { get; set; }
    public float? GradeTotalMax { get; set; }
    public float? GradeAvgScale { get; set; }
    public int? NextClassId { get; set; }
    public Class? NextClass { get; set; }
    public ICollection<Class> PrevClasses { get; set; } = new List<Class>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<Timetable> Timetables { get; set; } = new List<Timetable>();
    public ICollection<AttendanceSession> AttendanceSessions { get; set; } = new List<AttendanceSession>();
    public ICollection<TeacherSubject> TeacherSubjects { get; set; } = new List<TeacherSubject>();
    public ICollection<StudentProgression> StudentProgressions { get; set; } = new List<StudentProgression>();
}
