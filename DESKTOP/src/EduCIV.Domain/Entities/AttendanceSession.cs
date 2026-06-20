namespace EduCIV.Domain.Entities;
public class AttendanceSession : MultiTenantEntity
{
    public int ClassId { get; set; }
    public Class? Class { get; set; }
    public int SubjectId { get; set; }
    public Subject? Subject { get; set; }
    public int TimetableId { get; set; }
    public Timetable? Timetable { get; set; }
    public int TeacherId { get; set; }
    public Teacher? Teacher { get; set; }
    public DateTime Date { get; set; }
    public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
}
