using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class PeriodsApiService : IPeriodsApiService
{
    private readonly ApiClient _client;

    public PeriodsApiService(ApiClient client) { _client = client; }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50)
        => await _client.GetAsync<PaginatedResponse<object>>($"periods?schoolId={schoolId}&page={page}&pageSize={pageSize}");

    public async Task<ApiResponse<object>?> GetById(string id)
        => await _client.GetAsync<object>($"periods/{id}");

    public async Task<ApiResponse<object>?> Create(CreatePeriodRequest request)
        => await _client.PostAsync<object>("periods", request);

    public async Task<ApiResponse<object>?> Update(string id, CreatePeriodRequest request)
        => await _client.PutAsync<object>($"periods/{id}", request);

    public async Task<ApiResponse<object>?> Delete(string id)
        => await _client.DeleteAsync<object>($"periods/{id}");
}
