using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class UsersApiService : IUsersApiService
{
    private readonly ApiClient _client;

    public UsersApiService(ApiClient client) { _client = client; }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50)
        => await _client.GetAsync<PaginatedResponse<object>>($"users?schoolId={schoolId}&page={page}&pageSize={pageSize}");

    public async Task<ApiResponse<object>?> GetById(string id)
        => await _client.GetAsync<object>($"users/{id}");

    public async Task<ApiResponse<object>?> Update(string id, object request)
        => await _client.PutAsync<object>($"users/{id}", request);

    public async Task<ApiResponse<object>?> Delete(string id)
        => await _client.DeleteAsync<object>($"users/{id}");
}
