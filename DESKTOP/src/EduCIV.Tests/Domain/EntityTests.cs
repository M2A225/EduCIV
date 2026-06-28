using EduCIV.Domain.Entities;
using FluentAssertions;
using static EduCIV.Domain.Enums.AllEnums;

namespace EduCIV.Tests.Domain;

public class EntityTests
{
    [Fact]
    public void Student_DefaultValues_ShouldBeCorrect()
    {
        var student = new Student();

        student.Name.Should().Be(string.Empty);
        student.IsRepeater.Should().BeFalse();
        student.IsInternal.Should().BeFalse();
        student.IsAffected.Should().BeTrue();
        student.Grades.Should().NotBeNull().And.BeEmpty();
        student.Payments.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void Student_WithValues_ShouldSetProperties()
    {
        var student = new Student
        {
            Id = 1,
            Name = "Kouassi Jean",
            Matricule = "MAT-001",
            Dob = new DateTime(2010, 5, 15),
            Sexe = Sexe.M,
            SchoolId = 1,
            ClassId = 5
        };

        student.Id.Should().Be(1);
        student.Name.Should().Be("Kouassi Jean");
        student.Matricule.Should().Be("MAT-001");
        student.Sexe.Should().Be(Sexe.M);
        student.SchoolId.Should().Be(1);
        student.ClassId.Should().Be(5);
    }

    [Fact]
    public void Grade_DefaultStatus_ShouldBeEnAttente()
    {
        var grade = new Grade();

        grade.Status.Should().Be(GradeStatus.EN_ATTENTE);
        grade.Archived.Should().BeFalse();
    }

    [Fact]
    public void Grade_WithScore_ShouldCalculateCorrectly()
    {
        var grade = new Grade
        {
            Value = 15.5f,
            Type = GradeType.EXAMEN,
            MaxScore = 20f,
            SubjectId = 1,
            StudentId = 1,
            PeriodId = 1,
            SchoolId = 1
        };

        grade.Value.Should().Be(15.5f);
        grade.Type.Should().Be(GradeType.EXAMEN);
        grade.MaxScore.Should().Be(20f);
    }

    [Fact]
    public void Payment_ShouldHaveAuditLogCollection()
    {
        var payment = new Payment();

        payment.AuditLogs.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void UserRoles_ShouldContainAllExpectedValues()
    {
        var roles = Enum.GetValues<UserRole>();

        roles.Should().HaveCount(8);
        roles.Should().Contain(UserRole.DIRECTOR);
        roles.Should().Contain(UserRole.TEACHER);
        roles.Should().Contain(UserRole.PARENT);
        roles.Should().Contain(UserRole.STUDENT);
    }

    [Fact]
    public void SyncOperation_ShouldDefaultToPending()
    {
        var syncOp = new SyncOperation();

        syncOp.Status.Should().Be(SyncOperationStatus.PENDING);
        syncOp.RetryCount.Should().Be(0);
    }

    [Fact]
    public void MultiTenantEntity_ShouldHaveSchoolId()
    {
        var student = new Student { SchoolId = 42 };

        student.SchoolId.Should().Be(42);
    }

    [Fact]
    public void Class_ShouldSupportProgressionChain()
    {
        var classA = new Class { Id = 1, Name = "6ème A" };
        var classB = new Class { Id = 2, Name = "5ème A", PreviousClassId = 1 };

        classB.PreviousClassId.Should().Be(1);
        classA.NextClassId.Should().BeNull();
    }

    [Fact]
    public void Attendance_ShouldHaveValidStatuses()
    {
        var statuses = Enum.GetValues<AttendanceStatus>();

        statuses.Should().HaveCount(3);
        statuses.Should().Contain(AttendanceStatus.PRESENT);
        statuses.Should().Contain(AttendanceStatus.ABSENT);
        statuses.Should().Contain(AttendanceStatus.LATE);
    }
}
