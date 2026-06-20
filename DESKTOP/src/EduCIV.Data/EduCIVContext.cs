using Microsoft.EntityFrameworkCore;
using EduCIV.Domain.Entities;
using static EduCIV.Domain.Enums.AllEnums;

namespace EduCIV.Data;

public class EduCIVContext : DbContext
{
    public EduCIVContext(DbContextOptions<EduCIVContext> options) : base(options) { }

    public DbSet<School> Schools => Set<School>();
    public DbSet<SchoolGroup> SchoolGroups => Set<SchoolGroup>();
    public DbSet<SchoolLevel> SchoolLevels => Set<SchoolLevel>();
    public DbSet<SchoolFiliere> SchoolFilieres => Set<SchoolFiliere>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserSchool> UserSchools => Set<UserSchool>();
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Class> Classes => Set<Class>();
    public DbSet<Teacher> Teachers => Set<Teacher>();
    public DbSet<Subject> Subjects => Set<Subject>();
    public DbSet<TeacherSubject> TeacherSubjects => Set<TeacherSubject>();
    public DbSet<SchoolYear> SchoolYears => Set<SchoolYear>();
    public DbSet<AcademicPeriod> AcademicPeriods => Set<AcademicPeriod>();
    public DbSet<Grade> Grades => Set<Grade>();
    public DbSet<ReportCard> ReportCards => Set<ReportCard>();
    public DbSet<PaymentPlan> PaymentPlans => Set<PaymentPlan>();
    public DbSet<LevelTuition> LevelTuitions => Set<LevelTuition>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PaymentAuditLog> PaymentAuditLogs => Set<PaymentAuditLog>();
    public DbSet<Timetable> Timetables => Set<Timetable>();
    public DbSet<AttendanceSession> AttendanceSessions => Set<AttendanceSession>();
    public DbSet<Attendance> Attendances => Set<Attendance>();
    public DbSet<Incident> Incidents => Set<Incident>();
    public DbSet<Invitation> Invitations => Set<Invitation>();
    public DbSet<StudentParent> StudentParents => Set<StudentParent>();
    public DbSet<ClassProgressionOption> ClassProgressionOptions => Set<ClassProgressionOption>();
    public DbSet<TeacherProgressionVote> TeacherProgressionVotes => Set<TeacherProgressionVote>();
    public DbSet<StudentProgression> StudentProgressions => Set<StudentProgression>();
    public DbSet<SyncOperation> SyncOperations => Set<SyncOperation>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    public DbSet<Commune> Communes => Set<Commune>();
    public DbSet<City> Cities => Set<City>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<School>(e =>
        {
            e.ToTable("schools");
            e.HasIndex(s => s.SchoolGroupId);
            e.Property(s => s.SchoolType).HasConversion<string>().HasMaxLength(50);
        });

        modelBuilder.Entity<SchoolGroup>(e =>
        {
            e.ToTable("school_groups");
        });

        modelBuilder.Entity<SchoolLevel>(e =>
        {
            e.ToTable("school_levels");
            e.HasIndex(sl => sl.SchoolId);
            e.HasOne(sl => sl.School)
                .WithMany()
                .HasForeignKey(sl => sl.SchoolId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SchoolFiliere>(e =>
        {
            e.ToTable("school_filieres");
            e.HasIndex(sf => sf.SchoolId);
            e.HasOne(sf => sf.School)
                .WithMany()
                .HasForeignKey(sf => sf.SchoolId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");
            e.HasIndex(u => u.Email);
            e.HasIndex(u => u.Phone);
            e.HasIndex(u => u.SchoolId);
            e.Property(u => u.Role).HasConversion<string>().HasMaxLength(50);
            e.HasOne(u => u.School)
                .WithMany()
                .HasForeignKey(u => u.SchoolId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<UserSchool>(e =>
        {
            e.ToTable("user_schools");
            e.HasIndex(us => new { us.UserId, us.SchoolId });
            e.Property(us => us.Scope).HasConversion<string>().HasMaxLength(50);
            e.Property(us => us.Role).HasConversion<string>().HasMaxLength(50);
            e.HasOne(us => us.User)
                .WithMany(u => u.UserSchools)
                .HasForeignKey(us => us.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(us => us.School)
                .WithMany()
                .HasForeignKey(us => us.SchoolId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Student>(e =>
        {
            e.ToTable("students");
            e.HasIndex(s => s.Matricule);
            e.HasIndex(s => s.ClassId);
            e.HasIndex(s => s.UserId);
            e.Property(s => s.Sexe).HasConversion<string>().HasMaxLength(10);
            e.HasOne(s => s.User)
                .WithMany(u => u.Students)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(s => s.Class)
                .WithMany(c => c.Students)
                .HasForeignKey(s => s.ClassId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Class>(e =>
        {
            e.ToTable("classes");
            e.HasIndex(c => c.NextClassId);
            e.HasOne(c => c.NextClass)
                .WithMany(c => c.PrevClasses)
                .HasForeignKey(c => c.NextClassId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Teacher>(e =>
        {
            e.ToTable("teachers");
        });

        modelBuilder.Entity<Subject>(e =>
        {
            e.ToTable("subjects");
        });

        modelBuilder.Entity<TeacherSubject>(e =>
        {
            e.ToTable("teacher_subjects");
            e.HasIndex(ts => new { ts.TeacherId, ts.SubjectId, ts.ClassId }).IsUnique();
            e.HasOne(ts => ts.Teacher)
                .WithMany(t => t.Assignments)
                .HasForeignKey(ts => ts.TeacherId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ts => ts.Subject)
                .WithMany(s => s.Assignments)
                .HasForeignKey(ts => ts.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(ts => ts.Class)
                .WithMany(c => c.TeacherSubjects)
                .HasForeignKey(ts => ts.ClassId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SchoolYear>(e =>
        {
            e.ToTable("school_years");
        });

        modelBuilder.Entity<AcademicPeriod>(e =>
        {
            e.ToTable("academic_periods");
            e.HasIndex(ap => ap.SchoolYearId);
            e.Property(ap => ap.PeriodType).HasConversion<string>().HasMaxLength(50);
            e.HasOne(ap => ap.SchoolYear)
                .WithMany(sy => sy.Periods)
                .HasForeignKey(ap => ap.SchoolYearId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Grade>(e =>
        {
            e.ToTable("grades");
            e.HasIndex(g => g.StudentId);
            e.HasIndex(g => g.PeriodId);
            e.HasIndex(g => g.SubjectId);
            e.Property(g => g.Type).HasConversion<string>().HasMaxLength(50);
            e.Property(g => g.Status).HasConversion<string>().HasMaxLength(50);
            e.HasOne(g => g.Period)
                .WithMany(ap => ap.Grades)
                .HasForeignKey(g => g.PeriodId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(g => g.Student)
                .WithMany(s => s.Grades)
                .HasForeignKey(g => g.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(g => g.Subject)
                .WithMany(s => s.Grades)
                .HasForeignKey(g => g.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ReportCard>(e =>
        {
            e.ToTable("report_cards");
            e.HasIndex(rc => rc.StudentId);
            e.HasIndex(rc => rc.PeriodId);
            e.HasOne(rc => rc.Student)
                .WithMany(s => s.ReportCards)
                .HasForeignKey(rc => rc.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(rc => rc.Period)
                .WithMany(ap => ap.ReportCards)
                .HasForeignKey(rc => rc.PeriodId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PaymentPlan>(e =>
        {
            e.ToTable("payment_plans");
        });

        modelBuilder.Entity<LevelTuition>(e =>
        {
            e.ToTable("level_tuitions");
        });

        modelBuilder.Entity<Payment>(e =>
        {
            e.ToTable("payments");
            e.HasIndex(p => p.StudentId);
            e.HasIndex(p => p.PlanId);
            e.Property(p => p.PaymentType).HasConversion<string>().HasMaxLength(50);
            e.Property(p => p.Status).HasConversion<string>().HasMaxLength(50);
            e.HasOne(p => p.Student)
                .WithMany(s => s.Payments)
                .HasForeignKey(p => p.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(p => p.Plan)
                .WithMany(pp => pp.Payments)
                .HasForeignKey(p => p.PlanId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<PaymentAuditLog>(e =>
        {
            e.ToTable("payment_audit_logs");
            e.HasIndex(pal => pal.PaymentId);
            e.HasOne(pal => pal.Payment)
                .WithMany(p => p.AuditLogs)
                .HasForeignKey(pal => pal.PaymentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Timetable>(e =>
        {
            e.ToTable("timetables");
            e.HasIndex(t => t.ClassId);
            e.HasIndex(t => t.TeacherId);
            e.HasIndex(t => t.SubjectId);
            e.HasOne(t => t.Class)
                .WithMany(c => c.Timetables)
                .HasForeignKey(t => t.ClassId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(t => t.Teacher)
                .WithMany(tc => tc.Timetables)
                .HasForeignKey(t => t.TeacherId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(t => t.Subject)
                .WithMany(s => s.Timetables)
                .HasForeignKey(t => t.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AttendanceSession>(e =>
        {
            e.ToTable("attendance_sessions");
            e.HasIndex(att => att.ClassId);
            e.HasIndex(att => att.SubjectId);
            e.HasIndex(att => att.TimetableId);
            e.HasIndex(att => att.TeacherId);
            e.HasOne(att => att.Class)
                .WithMany(c => c.AttendanceSessions)
                .HasForeignKey(att => att.ClassId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(att => att.Subject)
                .WithMany(s => s.AttendanceSessions)
                .HasForeignKey(att => att.SubjectId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(att => att.Timetable)
                .WithMany(t => t.AttendanceSessions)
                .HasForeignKey(att => att.TimetableId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(att => att.Teacher)
                .WithMany(tc => tc.AttendanceSessions)
                .HasForeignKey(att => att.TeacherId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Attendance>(e =>
        {
            e.ToTable("attendances");
            e.HasIndex(a => a.SessionId);
            e.HasIndex(a => a.StudentId);
            e.Property(a => a.Status).HasConversion<string>().HasMaxLength(50);
            e.HasOne(a => a.Session)
                .WithMany(s => s.Attendances)
                .HasForeignKey(a => a.SessionId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(a => a.Student)
                .WithMany(s => s.Attendances)
                .HasForeignKey(a => a.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Incident>(e =>
        {
            e.ToTable("incidents");
            e.HasIndex(i => i.StudentId);
            e.HasIndex(i => i.TeacherId);
            e.Property(i => i.Type).HasConversion<string>().HasMaxLength(50);
            e.Property(i => i.Status).HasConversion<string>().HasMaxLength(50);
            e.HasOne(i => i.Student)
                .WithMany(s => s.Incidents)
                .HasForeignKey(i => i.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(i => i.Teacher)
                .WithMany(tc => tc.Incidents)
                .HasForeignKey(i => i.TeacherId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Invitation>(e =>
        {
            e.ToTable("invitations");
            e.HasIndex(i => i.Code);
            e.Property(i => i.TargetType).HasConversion<string>().HasMaxLength(50);
        });

        modelBuilder.Entity<StudentParent>(e =>
        {
            e.ToTable("student_parents");
            e.HasIndex(sp => sp.StudentId);
            e.HasIndex(sp => sp.ParentUserId);
            e.HasOne(sp => sp.Student)
                .WithMany(s => s.ParentLinks)
                .HasForeignKey(sp => sp.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(sp => sp.Parent)
                .WithMany(u => u.ParentLinks)
                .HasForeignKey(sp => sp.ParentUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ClassProgressionOption>(e =>
        {
            e.ToTable("class_progression_options");
        });

        modelBuilder.Entity<TeacherProgressionVote>(e =>
        {
            e.ToTable("teacher_progression_votes");
            e.HasIndex(v => v.StudentId);
            e.HasIndex(v => v.TeacherId);
            e.HasIndex(v => v.SchoolYearId);
            e.Property(v => v.Decision).HasConversion<string>().HasMaxLength(50);
            e.HasOne(v => v.Student).WithMany().HasForeignKey(v => v.StudentId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(v => v.Teacher)
                .WithMany(tc => tc.ProgressionVotes)
                .HasForeignKey(v => v.TeacherId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(v => v.SchoolYear)
                .WithMany(sy => sy.Votes)
                .HasForeignKey(v => v.SchoolYearId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<StudentProgression>(e =>
        {
            e.ToTable("student_progressions");
            e.HasIndex(sp => sp.StudentId);
            e.HasIndex(sp => sp.SchoolYearId);
            e.HasIndex(sp => sp.NextClassId);
            e.Property(sp => sp.FinalDecision).HasConversion<string>().HasMaxLength(50);
            e.HasOne(sp => sp.Student)
                .WithMany(s => s.Progressions)
                .HasForeignKey(sp => sp.StudentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(sp => sp.SchoolYear)
                .WithMany(sy => sy.Progressions)
                .HasForeignKey(sp => sp.SchoolYearId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(sp => sp.NextClass)
                .WithMany(c => c.StudentProgressions)
                .HasForeignKey(sp => sp.NextClassId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<RefreshToken>(e =>
        {
            e.ToTable("refresh_tokens");
            e.HasIndex(rt => rt.UserId);
            e.HasIndex(rt => rt.Token);
            e.HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PasswordResetToken>(e =>
        {
            e.ToTable("password_reset_tokens");
            e.HasIndex(prt => prt.UserId);
            e.HasIndex(prt => prt.Token);
            e.HasIndex(prt => prt.Email);
            e.HasOne(prt => prt.User)
                .WithMany(u => u.PasswordResetTokens)
                .HasForeignKey(prt => prt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<SyncOperation>(e =>
        {
            e.ToTable("sync_operations");
            e.HasIndex(so => so.SchoolId);
            e.Property(so => so.Entity).HasConversion<string>().HasMaxLength(50);
            e.Property(so => so.Status).HasConversion<string>().HasMaxLength(50);
        });

        modelBuilder.Entity<Commune>(e =>
        {
            e.ToTable("communes");
            e.HasIndex(c => c.CityId);
            e.HasOne(c => c.City)
                .WithMany(ct => ct.Communes)
                .HasForeignKey(c => c.CityId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<City>(e =>
        {
            e.ToTable("cities");
        });
    }
}

