using EduCIV.Domain.Entities;
using FluentAssertions;
using Xunit;
using static EduCIV.Domain.Enums.AllEnums;

namespace EduCIV.Tests.Domain;

public class EntityExtendedTests
{
    [Fact]
    public void Teacher_DefaultValues_ShouldBeCorrect()
    {
        var teacher = new Teacher();
        teacher.Name.Should().Be(string.Empty);
        teacher.Subjects.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void School_DefaultValues_ShouldBeCorrect()
    {
        var school = new School();
        school.Name.Should().Be(string.Empty);
        school.Students.Should().NotBeNull().And.BeEmpty();
        school.Classes.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void Payment_ShouldHaveDefaultValues()
    {
        var payment = new Payment();
        payment.Amount.Should().Be(0);
        payment.Method.Should().Be(PaymentMethod.CASH);
        payment.Status.Should().Be(PaymentStatus.PENDING);
    }

    [Fact]
    public void AcademicPeriod_ShouldHaveDefaultValues()
    {
        var period = new AcademicPeriod();
        period.Name.Should().Be(string.Empty);
        period.IsActive.Should().BeFalse();
    }

    [Fact]
    public void SchoolYear_ShouldHaveDefaultValues()
    {
        var year = new SchoolYear();
        year.Name.Should().Be(string.Empty);
        year.IsCurrent.Should().BeFalse();
    }

    [Fact]
    public void Incident_ShouldHaveDefaultValues()
    {
        var incident = new Incident();
        incident.Description.Should().Be(string.Empty);
        incident.Severity.Should().Be(IncidentSeverity.LOW);
    }

    [Fact]
    public void Attendance_ShouldHaveDefaultValues()
    {
        var attendance = new Attendance();
        attendance.Status.Should().Be(AttendanceStatus.PRESENT);
    }

    [Fact]
    public void AttendanceSession_ShouldHaveDefaultValues()
    {
        var session = new AttendanceSession();
        session.Date.Should().Be(default(DateTime));
        session.IsLocked.Should().BeFalse();
    }

    [Fact]
    public void Subject_ShouldHaveDefaultValues()
    {
        var subject = new Subject();
        subject.Name.Should().Be(string.Empty);
        subject.Code.Should().Be(string.Empty);
    }

    [Fact]
    public void Class_ShouldHaveDefaultValues()
    {
        var @class = new Class();
        @class.Name.Should().Be(string.Empty);
        @class.capacity.Should().Be(0);
    }

    [Fact]
    public void GradeStatus_ShouldHaveAllValues()
    {
        var statuses = Enum.GetValues<GradeStatus>();
        statuses.Should().Contain(GradeStatus.VALIDE);
        statuses.Should().Contain(GradeStatus.REJETE);
        statuses.Should().Contain(GradeStatus.EN_ATTENTE);
    }

    [Fact]
    public void PaymentStatus_ShouldHaveAllValues()
    {
        var statuses = Enum.GetValues<PaymentStatus>();
        statuses.Should().Contain(PaymentStatus.PENDING);
        statuses.Should().Contain(PaymentStatus.COMPLETED);
        statuses.Should().Contain(PaymentStatus.CANCELLED);
    }

    [Fact]
    public void IncidentSeverity_ShouldHaveAllValues()
    {
        var severities = Enum.GetValues<IncidentSeverity>();
        severities.Should().HaveCount(3);
        severities.Should().Contain(IncidentSeverity.LOW);
        severities.Should().Contain(IncidentSeverity.MEDIUM);
        severities.Should().Contain(IncidentSeverity.HIGH);
    }

    [Fact]
    public void PaymentMethod_ShouldHaveAllValues()
    {
        var methods = Enum.GetValues<PaymentMethod>();
        methods.Should().Contain(PaymentMethod.CASH);
        methods.Should().Contain(PaymentMethod.MOBILE_MONEY);
        methods.Should().Contain(PaymentMethod.BANK_TRANSFER);
    }

    [Fact]
    public void User_ShouldHaveRolesCollection()
    {
        var user = new User();
        user.UserSchools.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void ReportCard_ShouldHaveDefaultValues()
    {
        var reportCard = new ReportCard();
        reportCard.StudentId.Should().Be(0);
        reportCard.SchoolYearId.Should().Be(0);
    }

    [Fact]
    public void Invitation_ShouldHaveDefaultValues()
    {
        var invitation = new Invitation();
        invitation.Email.Should().Be(string.Empty);
        invitation.Role.Should().Be(UserRole.TEACHER);
    }

    [Fact]
    public void PaymentPlan_ShouldHaveDefaultValues()
    {
        var plan = new PaymentPlan();
        plan.Name.Should().Be(string.Empty);
        plan.Amount.Should().Be(0);
    }

    [Fact]
    public void StudentProgression_ShouldHaveDefaultValues()
    {
        var progression = new StudentProgression();
        progression.IsRepeater.Should().BeFalse();
        progression.IsAffected.Should().BeTrue();
    }

    [Fact]
    public void SyncOperation_ShouldHaveAllEntityTypes()
    {
        var entities = Enum.GetValues<SyncEntity>();
        entities.Should().Contain(SyncEntity.STUDENT);
        entities.Should().Contain(SyncEntity.TEACHER);
        entities.Should().Contain(SyncEntity.GRADE);
        entities.Should().Contain(SyncEntity.PAYMENT);
        entities.Should().Contain(SyncEntity.CLASS);
    }
}
