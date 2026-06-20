
using Newtonsoft.Json;

namespace EduCIV.Api.Models;

public class LoginRequest
{
    [JsonProperty("identifier")]
    public string Identifier { get; set; } = string.Empty;

    [JsonProperty("password")]
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    [JsonProperty("accessToken")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonProperty("user")]
    public UserDto? User { get; set; }
}

public class UserDto
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("email")]
    public string Email { get; set; } = string.Empty;

    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("phone")]
    public string? Phone { get; set; }

    [JsonProperty("role")]
    public string Role { get; set; } = string.Empty;

    [JsonProperty("schoolIds")]
    public List<string> SchoolIds { get; set; } = new();

    [JsonProperty("primarySchoolId")]
    public string? PrimarySchoolId { get; set; }

    [JsonProperty("roles")]
    public List<string> Roles { get; set; } = new();
}

public class SwitchRoleRequest
{
    [JsonProperty("role")]
    public string Role { get; set; } = string.Empty;
}

public class ForgotPasswordRequest
{
    [JsonProperty("email")]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    [JsonProperty("token")]
    public string Token { get; set; } = string.Empty;

    [JsonProperty("password")]
    public string Password { get; set; } = string.Empty;
}

public class CreateStudentRequest
{
    [JsonProperty("firstName")]
    public string FirstName { get; set; } = string.Empty;

    [JsonProperty("lastName")]
    public string LastName { get; set; } = string.Empty;

    [JsonProperty("email")]
    public string? Email { get; set; }

    [JsonProperty("phone")]
    public string? Phone { get; set; }

    [JsonProperty("dateOfBirth")]
    public DateTime? DateOfBirth { get; set; }

    [JsonProperty("classId")]
    public string? ClassId { get; set; }

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class CreateClassRequest
{
    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("level")]
    public string Level { get; set; } = string.Empty;

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class CreateTeacherRequest
{
    [JsonProperty("firstName")]
    public string FirstName { get; set; } = string.Empty;

    [JsonProperty("lastName")]
    public string LastName { get; set; } = string.Empty;

    [JsonProperty("email")]
    public string Email { get; set; } = string.Empty;

    [JsonProperty("phone")]
    public string? Phone { get; set; }

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class CreateSubjectRequest
{
    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("code")]
    public string? Code { get; set; }

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class CreateTeacherSubjectRequest
{
    [JsonProperty("teacherId")]
    public string TeacherId { get; set; } = string.Empty;

    [JsonProperty("subjectId")]
    public string SubjectId { get; set; } = string.Empty;

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class CreateTimetableSlotRequest
{
    [JsonProperty("dayOfWeek")]
    public int DayOfWeek { get; set; }

    [JsonProperty("startTime")]
    public string StartTime { get; set; } = string.Empty;

    [JsonProperty("endTime")]
    public string EndTime { get; set; } = string.Empty;

    [JsonProperty("classId")]
    public string ClassId { get; set; } = string.Empty;

    [JsonProperty("teacherId")]
    public string TeacherId { get; set; } = string.Empty;

    [JsonProperty("subjectId")]
    public string SubjectId { get; set; } = string.Empty;

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class CreateAttendanceSessionRequest
{
    [JsonProperty("classId")]
    public string ClassId { get; set; } = string.Empty;

    [JsonProperty("date")]
    public DateTime Date { get; set; }

    [JsonProperty("startTime")]
    public string StartTime { get; set; } = string.Empty;

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class MarkAttendanceRequest
{
    [JsonProperty("sessionId")]
    public string SessionId { get; set; } = string.Empty;

    [JsonProperty("studentId")]
    public string StudentId { get; set; } = string.Empty;

    [JsonProperty("status")]
    public string Status { get; set; } = string.Empty;

    [JsonProperty("remark")]
    public string? Remark { get; set; }
}

public class CreateGradeRequest
{
    [JsonProperty("studentId")]
    public string StudentId { get; set; } = string.Empty;

    [JsonProperty("subjectId")]
    public string SubjectId { get; set; } = string.Empty;

    [JsonProperty("value")]
    public double Value { get; set; }

    [JsonProperty("coefficient")]
    public double Coefficient { get; set; } = 1;

    [JsonProperty("type")]
    public string Type { get; set; } = string.Empty;

    [JsonProperty("comment")]
    public string? Comment { get; set; }

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class BulkGradeRequest
{
    [JsonProperty("grades")]
    public List<CreateGradeRequest> Grades { get; set; } = new();
}

public class CreatePaymentRequest
{
    [JsonProperty("studentId")]
    public string StudentId { get; set; } = string.Empty;

    [JsonProperty("amount")]
    public decimal Amount { get; set; }

    [JsonProperty("type")]
    public string Type { get; set; } = string.Empty;

    [JsonProperty("dueDate")]
    public DateTime? DueDate { get; set; }

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class CreateIncidentRequest
{
    [JsonProperty("studentId")]
    public string StudentId { get; set; } = string.Empty;

    [JsonProperty("type")]
    public string Type { get; set; } = string.Empty;

    [JsonProperty("description")]
    public string Description { get; set; } = string.Empty;

    [JsonProperty("date")]
    public DateTime Date { get; set; }

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class CreatePeriodRequest
{
    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("startDate")]
    public DateTime StartDate { get; set; }

    [JsonProperty("endDate")]
    public DateTime EndDate { get; set; }

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class CreateSchoolYearRequest
{
    [JsonProperty("label")]
    public string Label { get; set; } = string.Empty;

    [JsonProperty("startDate")]
    public DateTime StartDate { get; set; }

    [JsonProperty("endDate")]
    public DateTime EndDate { get; set; }

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class CreatePaymentPlanRequest
{
    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("totalAmount")]
    public decimal TotalAmount { get; set; }

    [JsonProperty("installments")]
    public int Installments { get; set; }

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class LevelTuitionRequest
{
    [JsonProperty("level")]
    public string Level { get; set; } = string.Empty;

    [JsonProperty("amount")]
    public decimal Amount { get; set; }

    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class CompleteSetupRequest
{
    [JsonProperty("schoolId")]
    public string SchoolId { get; set; } = string.Empty;
}

public class SyncPushRequest
{
    [JsonProperty("operations")]
    public List<SyncOperationDto> Operations { get; set; } = new();
}

public class SyncOperationDto
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("entity")]
    public string Entity { get; set; } = string.Empty;

    [JsonProperty("action")]
    public string Action { get; set; } = string.Empty;

    [JsonProperty("payload")]
    public string Payload { get; set; } = string.Empty;

    [JsonProperty("timestamp")]
    public DateTime Timestamp { get; set; }
}

public class SyncPullResponse
{
    [JsonProperty("operations")]
    public List<SyncOperationDto> Operations { get; set; } = new();

    [JsonProperty("lastSyncTimestamp")]
    public DateTime? LastSyncTimestamp { get; set; }
}

public class SchoolInfoDto
{
    [JsonProperty("id")]
    public string Id { get; set; } = string.Empty;

    [JsonProperty("name")]
    public string Name { get; set; } = string.Empty;

    [JsonProperty("address")]
    public string? Address { get; set; }

    [JsonProperty("phone")]
    public string? Phone { get; set; }

    [JsonProperty("email")]
    public string? Email { get; set; }

    [JsonProperty("logoUrl")]
    public string? LogoUrl { get; set; }

    [JsonProperty("setupStatus")]
    public SchoolSetupStatus SetupStatus { get; set; }
}

public class SchoolStatsDto
{
    [JsonProperty("totalStudents")]
    public int TotalStudents { get; set; }

    [JsonProperty("totalTeachers")]
    public int TotalTeachers { get; set; }

    [JsonProperty("totalClasses")]
    public int TotalClasses { get; set; }

    [JsonProperty("totalSubjects")]
    public int TotalSubjects { get; set; }

    [JsonProperty("totalUsers")]
    public int TotalUsers { get; set; }
}

