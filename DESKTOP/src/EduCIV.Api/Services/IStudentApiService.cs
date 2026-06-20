
using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public interface IStudentApiService
{
    Task<ApiResponse<object>?> Create(CreateStudentRequest request);
    Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50);
    Task<ApiResponse<object>?> GetById(string id);
    Task<ApiResponse<object>?> Update(string id, CreateStudentRequest request);
    Task<ApiResponse<object>?> Delete(string id);
    Task<ApiResponse<object>?> GetByClass(string classId);
    Task<ApiResponse<object>?> Search(string schoolId, string query);
}

