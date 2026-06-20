using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class SchoolYearsApiService : ISchoolYearsApiService
{
    private readonly ApiClient _client;

    public SchoolYearsApiService(ApiClient client) { _client = client; }

    public async Task<ApiResponse<PaginatedResponse<object>>?> GetAll(string schoolId, int page = 1, int pageSize = 50)
        => await _client.GetAsync<PaginatedResponse<object>>($"school-years?schoolId={schoolId}&page={page}&pageSize={pageSize}");

    public async Task<ApiResponse<object>?> GetById(string id)
        => await _client.GetAsync<object>($"school-years/{id}");

    public async Task<ApiResponse<object>?> Create(CreateSchoolYearRequest request)
        => await _client.PostAsync<object>("school-years", request);

    public async Task<ApiResponse<object>?> Update(string id, CreateSchoolYearRequest request)
        => await _client.PutAsync<object>($"school-years/{id}", request);

    public async Task<ApiResponse<object>?> Delete(string id)
        => await _client.DeleteAsync<object>($"school-years/{id}");
}
