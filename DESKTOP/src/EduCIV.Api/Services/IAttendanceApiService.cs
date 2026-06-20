using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public interface IAttendanceApiService
{
    Task<ApiResponse<object>?> CreateSession(CreateAttendanceSessionRequest request);
    Task<ApiResponse<PaginatedResponse<object>>?> GetSessions(string schoolId, int page = 1, int pageSize = 50, string? classId = null);
    Task<ApiResponse<object>?> GetSessionById(string id);
    Task<ApiResponse<object>?> MarkAttendance(MarkAttendanceRequest request);
    Task<ApiResponse<PaginatedResponse<object>>?> GetAttendanceBySession(string sessionId);
    Task<ApiResponse<PaginatedResponse<object>>?> GetAttendanceByStudent(string studentId);
}
