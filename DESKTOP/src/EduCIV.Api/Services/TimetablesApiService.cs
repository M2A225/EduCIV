using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class TimetablesApiService : ITimetablesApiService
{
    private readonly ApiClient _client;

    public TimetablesApiService(ApiClient client) { _client = client; }

    public async Task<ApiResponse<object>?> GetAll(string schoolId, string? classId = null, string? teacherId = null)
    {
        var query = $"timetables?schoolId={schoolId}";
        if (!string.IsNullOrEmpty(classId)) query += $"&classId={classId}";
        if (!string.IsNullOrEmpty(teacherId)) query += $"&teacherId={teacherId}";
        return await _client.GetAsync<object>(query);
    }

    public async Task<ApiResponse<object>?> Create(CreateTimetableSlotRequest request)
        => await _client.PostAsync<object>("timetables", request);
}
