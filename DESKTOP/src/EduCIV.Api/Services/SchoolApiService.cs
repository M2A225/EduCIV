
using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class SchoolApiService : ISchoolApiService
{
    private readonly ApiClient _client;

    public SchoolApiService(ApiClient client)
    {
        _client = client;
    }

    public async Task<ApiResponse<SchoolInfoDto>?> GetInfo(string schoolId)
    {
        return await _client.GetAsync<SchoolInfoDto>($"schools/{schoolId}");
    }

    public async Task<ApiResponse<SchoolStatsDto>?> GetStats(string schoolId)
    {
        return await _client.GetAsync<SchoolStatsDto>($"schools/{schoolId}/stats");
    }

    public async Task<ApiResponse<SchoolSetupStatus>?> GetSetupStatus(string schoolId)
    {
        return await _client.GetAsync<SchoolSetupStatus>($"schools/{schoolId}/setup-status");
    }

    public async Task<ApiResponse<object>?> CompleteSetup(CompleteSetupRequest request)
    {
        return await _client.PostAsync<object>("schools/complete-setup", request);
    }
}

