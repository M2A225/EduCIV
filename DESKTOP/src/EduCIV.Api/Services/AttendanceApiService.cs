using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class AttendanceApiService : IAttendanceApiService
{
    private readonly ApiClient _client;

    public AttendanceApiService(ApiClient client)
    {
        _client = client;
    }

    public async Task<ApiResponse<object>?> CreateSession(CreateAttendanceSessionRequest request)
    {
        return await _client.PostAsync<object>("attendance/sessions", request);
    }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetSessions(string schoolId, int page = 1, int pageSize = 50, string? classId = null)
    {
        var query = $"attendance/sessions?schoolId={schoolId}&page={page}&pageSize={pageSize}";
        if (!string.IsNullOrEmpty(classId)) query += $"&classId={classId}";
        return await _client.GetAsync<PaginatedResponse<object>>(query);
    }

    public async Task<ApiResponse<object>?> GetSessionById(string id)
    {
        return await _client.GetAsync<object>($"attendance/sessions/{id}");
    }

    public async Task<ApiResponse<object>?> MarkAttendance(MarkAttendanceRequest request)
    {
        return await _client.PostAsync<object>("attendance/mark", request);
    }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetAttendanceBySession(string sessionId)
    {
        return await _client.GetAsync<PaginatedResponse<object>>($"attendance/sessions/{sessionId}/records");
    }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetAttendanceByStudent(string studentId)
    {
        return await _client.GetAsync<PaginatedResponse<object>>($"attendance/student/{studentId}");
    }
}
