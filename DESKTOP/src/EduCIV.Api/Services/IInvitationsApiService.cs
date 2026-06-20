using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public interface IInvitationsApiService
{
    Task<ApiResponse<object>?> Generate(string targetType);
    Task<ApiResponse<object>?> GenerateTeacher();
}
