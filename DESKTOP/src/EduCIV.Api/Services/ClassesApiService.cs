using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class ClassesApiService : IClassesApiService
{
    private readonly ApiClient _client;

    public ClassesApiService(ApiClient client) { _client = client; }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50)
        => await _client.GetAsync<PaginatedResponse<object>>($"classes?schoolId={schoolId}&page={page}&pageSize={pageSize}");

    public async Task<ApiResponse<object>?> GetById(string id)
        => await _client.GetAsync<object>($"classes/{id}");

    public async Task<ApiResponse<object>?> Create(CreateClassRequest request)
        => await _client.PostAsync<object>("classes", request);

    public async Task<ApiResponse<object>?> Update(string id, CreateClassRequest request)
        => await _client.PutAsync<object>($"classes/{id}", request);

    public async Task<ApiResponse<object>?> Delete(string id)
        => await _client.DeleteAsync<object>($"classes/{id}");
}
