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
        teacher.Assignments.Should().NotBeNull().And.BeEmpty();
    }

    [Fact]
    public void School_DefaultValues_ShouldBeCorrect()
    {
        var school = new School();
        school.Name.Should().Be(string.Empty);
    }

    [Fact]
    public void Payment_ShouldHaveDefaultValues()
    {
        var payment = new Payment();
        payment.AmountFcfa.Should().Be(0);
        payment.PaymentType.Should().Be(PaymentType.SCOLARITE);
        payment.Status.Should().Be(PaymentStatus.VALIDE);
    }

    [Fact]
    public void AcademicPeriod_ShouldHaveDefaultValues()
    {
        var period = new AcademicPeriod();
        period.Name.Should().Be(string.Empty);
    }

    [Fact]
    public void SchoolYear_ShouldHaveDefaultValues()
    {
        var year = new SchoolYear();
        year.YearRange.Should().Be(string.Empty);
        year.Closed.Should().BeFalse();
    }

    [Fact]
    public void Incident_ShouldHaveDefaultValues()
    {
        var incident = new Incident();
        incident.Description.Should().Be(string.Empty);
        incident.Status.Should().Be(IncidentStatus.EN_COURS);
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
    }

    [Fact]
    public void Subject_ShouldHaveDefaultValues()
    {
        var subject = new Subject();
        subject.Name.Should().Be(string.Empty);
        subject.Coefficient.Should().Be(0);
    }

    [Fact]
    public void Class_ShouldHaveDefaultValues()
    {
        var @class = new Class();
        @class.Name.Should().Be(string.Empty);
        @class.Capacity.Should().Be(0);
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
        statuses.Should().Contain(PaymentStatus.VALIDE);
        statuses.Should().Contain(PaymentStatus.ANNULE);
    }

    [Fact]
    public void IncidentType_ShouldHaveAllValues()
    {
        var types = Enum.GetValues<IncidentType>();
        types.Should().Contain(IncidentType.RETARD);
        types.Should().Contain(IncidentType.ABSENCE_NON_JUSTIFIEE);
        types.Should().Contain(IncidentType.COMPORTEMENT);
    }

    [Fact]
    public void PaymentType_ShouldHaveAllValues()
    {
        var types = Enum.GetValues<PaymentType>();
        types.Should().Contain(PaymentType.SCOLARITE);
        types.Should().Contain(PaymentType.CANTINE);
        types.Should().Contain(PaymentType.INSCRIPTION);
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
        reportCard.PeriodId.Should().Be(0);
    }

    [Fact]
    public void Invitation_ShouldHaveDefaultValues()
    {
        var invitation = new Invitation();
        invitation.Code.Should().Be(string.Empty);
    }

    [Fact]
    public void PaymentPlan_ShouldHaveDefaultValues()
    {
        var plan = new PaymentPlan();
        plan.Name.Should().Be(string.Empty);
        plan.TotalAmount.Should().Be(0);
    }

    [Fact]
    public void StudentProgression_ShouldHaveDefaultValues()
    {
        var progression = new StudentProgression();
        progression.FinalDecision.Should().Be(DecisionFinale.ADMIS);
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
