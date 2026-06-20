
using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public interface ISchoolApiService
{
    Task<ApiResponse<SchoolInfoDto>?> GetInfo(string schoolId);
    Task<ApiResponse<SchoolStatsDto>?> GetStats(string schoolId);
    Task<ApiResponse<SchoolSetupStatus>?> GetSetupStatus(string schoolId);
    Task<ApiResponse<object>?> CompleteSetup(CompleteSetupRequest request);
}

