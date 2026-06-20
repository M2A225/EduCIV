
using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class StudentApiService : IStudentApiService
{
    private readonly ApiClient _client;

    public StudentApiService(ApiClient client)
    {
        _client = client;
    }

    public async Task<ApiResponse<object>?> Create(CreateStudentRequest request)
    {
        return await _client.PostAsync<object>("students", request);
    }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50)
    {
        return await _client.GetAsync<PaginatedResponse<object>>($"students?schoolId={schoolId}&page={page}&pageSize={pageSize}");
    }

    public async Task<ApiResponse<object>?> GetById(string id)
    {
        return await _client.GetAsync<object>($"students/{id}");
    }

    public async Task<ApiResponse<object>?> Update(string id, CreateStudentRequest request)
    {
        return await _client.PutAsync<object>($"students/{id}", request);
    }

    public async Task<ApiResponse<object>?> Delete(string id)
    {
        return await _client.DeleteAsync<object>($"students/{id}");
    }

    public async Task<ApiResponse<object>?> GetByClass(string classId)
    {
        return await _client.GetAsync<object>($"students/class/{classId}");
    }

    public async Task<ApiResponse<object>?> Search(string schoolId, string query)
    {
        return await _client.GetAsync<object>($"students/search?schoolId={schoolId}&q={Uri.EscapeDataString(query)}");
    }
}

