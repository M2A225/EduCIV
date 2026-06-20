using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class IncidentsApiService : IIncidentsApiService
{
    private readonly ApiClient _client;

    public IncidentsApiService(ApiClient client) { _client = client; }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50)
        => await _client.GetAsync<PaginatedResponse<object>>($"incidents?schoolId={schoolId}&page={page}&pageSize={pageSize}");

    public async Task<ApiResponse<object>?> GetById(string id)
        => await _client.GetAsync<object>($"incidents/{id}");

    public async Task<ApiResponse<object>?> Create(CreateIncidentRequest request)
        => await _client.PostAsync<object>("incidents", request);

    public async Task<ApiResponse<object>?> Update(string id, CreateIncidentRequest request)
        => await _client.PutAsync<object>($"incidents/{id}", request);

    public async Task<ApiResponse<object>?> Delete(string id)
        => await _client.DeleteAsync<object>($"incidents/{id}");
}
