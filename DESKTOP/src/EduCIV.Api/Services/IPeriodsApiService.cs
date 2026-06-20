using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public interface IPeriodsApiService
{
    Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50);
    Task<ApiResponse<object>?> GetById(string id);
    Task<ApiResponse<object>?> Create(CreatePeriodRequest request);
    Task<ApiResponse<object>?> Update(string id, CreatePeriodRequest request);
    Task<ApiResponse<object>?> Delete(string id);
}
