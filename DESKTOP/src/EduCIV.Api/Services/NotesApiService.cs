using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class NotesApiService : INotesApiService
{
    private readonly ApiClient _client;

    public NotesApiService(ApiClient client)
    {
        _client = client;
    }

    public async Task<ApiResponse<object>?> Create(CreateGradeRequest request)
    {
        return await _client.PostAsync<object>("notes", request);
    }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50, string? studentId = null, string? subjectId = null)
    {
        var query = $"notes?schoolId={schoolId}&page={page}&pageSize={pageSize}";
        if (!string.IsNullOrEmpty(studentId)) query += $"&studentId={studentId}";
        if (!string.IsNullOrEmpty(subjectId)) query += $"&subjectId={subjectId}";
        return await _client.GetAsync<PaginatedResponse<object>>(query);
    }

    public async Task<ApiResponse<object>?> GetById(string id)
    {
        return await _client.GetAsync<object>($"notes/{id}");
    }

    public async Task<ApiResponse<object>?> Update(string id, CreateGradeRequest request)
    {
        return await _client.PutAsync<object>($"notes/{id}", request);
    }

    public async Task<ApiResponse<object>?> Delete(string id)
    {
        return await _client.DeleteAsync<object>($"notes/{id}");
    }

    public async Task<ApiResponse<object>?> GetByStudent(string studentId)
    {
        return await _client.GetAsync<object>($"notes/student/{studentId}");
    }

    public async Task<ApiResponse<object>?> BulkCreate(BulkGradeRequest request)
    {
        return await _client.PostAsync<object>("notes/bulk", request);
    }
}
