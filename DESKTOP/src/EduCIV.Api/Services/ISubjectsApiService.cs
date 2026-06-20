using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public interface ISubjectsApiService
{
    Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50);
    Task<ApiResponse<object>?> GetById(string id);
    Task<ApiResponse<object>?> Create(CreateSubjectRequest request);
    Task<ApiResponse<object>?> BulkCreate(List<CreateSubjectRequest> requests);
    Task<ApiResponse<object>?> Update(string id, CreateSubjectRequest request);
    Task<ApiResponse<object>?> Delete(string id);
}
