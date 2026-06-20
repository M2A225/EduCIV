using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public interface IPaymentsApiService
{
    Task<ApiResponse<object>?> Create(CreatePaymentRequest request);
    Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50, string? studentId = null, string? status = null);
    Task<ApiResponse<object>?> GetById(string id);
    Task<ApiResponse<object>?> Update(string id, CreatePaymentRequest request);
    Task<ApiResponse<object>?> Delete(string id);
    Task<ApiResponse<object>?> GetByStudent(string studentId);
    Task<ApiResponse<object>?> GetByPlan(string planId);
}
