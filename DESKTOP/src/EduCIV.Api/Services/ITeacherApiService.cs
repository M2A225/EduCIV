using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public interface ITeacherApiService
{
    Task<ApiResponse<object>?> Create(CreateTeacherRequest request);
    Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50);
    Task<ApiResponse<object>?> GetById(string id);
    Task<ApiResponse<object>?> Update(string id, CreateTeacherRequest request);
    Task<ApiResponse<object>?> Delete(string id);
    Task<ApiResponse<object>?> GetBySubject(string subjectId);
}
