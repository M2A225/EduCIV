using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class SubjectsApiService : ISubjectsApiService
{
    private readonly ApiClient _client;

    public SubjectsApiService(ApiClient client) { _client = client; }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50)
        => await _client.GetAsync<PaginatedResponse<object>>($"subjects?schoolId={schoolId}&page={page}&pageSize={pageSize}");

    public async Task<ApiResponse<object>?> GetById(string id)
        => await _client.GetAsync<object>($"subjects/{id}");

    public async Task<ApiResponse<object>?> Create(CreateSubjectRequest request)
        => await _client.PostAsync<object>("subjects", request);

    public async Task<ApiResponse<object>?> BulkCreate(List<CreateSubjectRequest> requests)
        => await _client.PostAsync<object>("subjects/bulk", requests);

    public async Task<ApiResponse<object>?> Update(string id, CreateSubjectRequest request)
        => await _client.PutAsync<object>($"subjects/{id}", request);

    public async Task<ApiResponse<object>?> Delete(string id)
        => await _client.DeleteAsync<object>($"subjects/{id}");
}
