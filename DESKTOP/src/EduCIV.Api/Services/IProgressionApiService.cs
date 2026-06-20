using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public interface IProgressionApiService
{
    Task<ApiResponse<object>?> GetStudentsByClass(string classId, string yearId);
    Task<ApiResponse<object>?> GetVotes(string classId, string yearId);
    Task<ApiResponse<object>?> Vote(string studentId, string yearId, string decision, string? comment);
    Task<ApiResponse<object>?> Decide(string studentId, string decision, string? comment);
    Task<ApiResponse<object>?> GetOptions(string classId);
    Task<ApiResponse<object>?> GetStats(string yearId);
}
