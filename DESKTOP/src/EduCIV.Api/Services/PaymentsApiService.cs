using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class PaymentsApiService : IPaymentsApiService
{
    private readonly ApiClient _client;

    public PaymentsApiService(ApiClient client)
    {
        _client = client;
    }

    public async Task<ApiResponse<object>?> Create(CreatePaymentRequest request)
    {
        return await _client.PostAsync<object>("payments", request);
    }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50, string? studentId = null, string? status = null)
    {
        var query = $"payments?schoolId={schoolId}&page={page}&pageSize={pageSize}";
        if (!string.IsNullOrEmpty(studentId)) query += $"&studentId={studentId}";
        if (!string.IsNullOrEmpty(status)) query += $"&status={status}";
        return await _client.GetAsync<PaginatedResponse<object>>(query);
    }

    public async Task<ApiResponse<object>?> GetById(string id)
    {
        return await _client.GetAsync<object>($"payments/{id}");
    }

    public async Task<ApiResponse<object>?> Update(string id, CreatePaymentRequest request)
    {
        return await _client.PutAsync<object>($"payments/{id}", request);
    }

    public async Task<ApiResponse<object>?> Delete(string id)
    {
        return await _client.DeleteAsync<object>($"payments/{id}");
    }

    public async Task<ApiResponse<object>?> GetByStudent(string studentId)
    {
        return await _client.GetAsync<object>($"payments/student/{studentId}");
    }

    public async Task<ApiResponse<object>?> GetByPlan(string planId)
    {
        return await _client.GetAsync<object>($"payments/plan/{planId}");
    }
}
