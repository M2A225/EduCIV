using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class ProgressionApiService : IProgressionApiService
{
    private readonly ApiClient _client;

    public ProgressionApiService(ApiClient client) { _client = client; }

    public async Task<ApiResponse<object>?> GetStudentsByClass(string classId, string yearId)
        => await _client.GetAsync<object>($"progression/class/{classId}/year/{yearId}");

    public async Task<ApiResponse<object>?> GetVotes(string classId, string yearId)
        => await _client.GetAsync<object>($"progression/votes/class/{classId}/year/{yearId}");

    public async Task<ApiResponse<object>?> Vote(string studentId, string yearId, string decision, string? comment)
        => await _client.PostAsync<object>("progression/vote", new { studentId, yearId, decision, comment });

    public async Task<ApiResponse<object>?> Decide(string studentId, string decision, string? comment)
        => await _client.PostAsync<object>("progression/decide", new { studentId, decision, comment });

    public async Task<ApiResponse<object>?> GetOptions(string classId)
        => await _client.GetAsync<object>($"progression/options/{classId}");

    public async Task<ApiResponse<object>?> GetStats(string yearId)
        => await _client.GetAsync<object>($"progression/stats/{yearId}");
}
