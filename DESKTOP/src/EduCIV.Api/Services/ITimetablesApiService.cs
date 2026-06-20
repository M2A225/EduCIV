using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public interface ITimetablesApiService
{
    Task<ApiResponse<object>?> GetAll(string schoolId, string? classId = null, string? teacherId = null);
    Task<ApiResponse<object>?> Create(CreateTimetableSlotRequest request);
}
