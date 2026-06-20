using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public interface INotesApiService
{
    Task<ApiResponse<object>?> Create(CreateGradeRequest request);
    Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50, string? studentId = null, string? subjectId = null);
    Task<ApiResponse<object>?> GetById(string id);
    Task<ApiResponse<object>?> Update(string id, CreateGradeRequest request);
    Task<ApiResponse<object>?> Delete(string id);
    Task<ApiResponse<object>?> GetByStudent(string studentId);
    Task<ApiResponse<object>?> BulkCreate(BulkGradeRequest request);
}
