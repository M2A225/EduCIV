
using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public interface IAuthApiService
{
    Task<ApiResponse<LoginResponse>?> Login(LoginRequest request);
    Task<ApiResponse<RefreshTokenResponse>?> Refresh(string refreshToken);
    Task<ApiResponse<UserDto>?> GetMe();
    Task<ApiResponse<UserDto>?> SwitchRole(SwitchRoleRequest request);
    Task<ApiResponse<object>?> Logout();
    Task<ApiResponse<object>?> ForgotPassword(ForgotPasswordRequest request);
    Task<ApiResponse<object>?> ResetPassword(ResetPasswordRequest request);
}

