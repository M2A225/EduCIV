using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class TeacherApiService : ITeacherApiService
{
    private readonly ApiClient _client;

    public TeacherApiService(ApiClient client)
    {
        _client = client;
    }

    public async Task<ApiResponse<object>?> Create(CreateTeacherRequest request)
    {
        return await _client.PostAsync<object>("teachers", request);
    }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50)
    {
        return await _client.GetAsync<PaginatedResponse<object>>($"teachers?schoolId={schoolId}&page={page}&pageSize={pageSize}");
    }

    public async Task<ApiResponse<object>?> GetById(string id)
    {
        return await _client.GetAsync<object>($"teachers/{id}");
    }

    public async Task<ApiResponse<object>?> Update(string id, CreateTeacherRequest request)
    {
        return await _client.PutAsync<object>($"teachers/{id}", request);
    }

    public async Task<ApiResponse<object>?> Delete(string id)
    {
        return await _client.DeleteAsync<object>($"teachers/{id}");
    }

    public async Task<ApiResponse<object>?> GetBySubject(string subjectId)
    {
        return await _client.GetAsync<object>($"teachers/subject/{subjectId}");
    }
}
