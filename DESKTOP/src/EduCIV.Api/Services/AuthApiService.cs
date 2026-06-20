
using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class AuthApiService : IAuthApiService
{
    private readonly ApiClient _client;

    public AuthApiService(ApiClient client)
    {
        _client = client;
    }

    public async Task<ApiResponse<LoginResponse>?> Login(LoginRequest request)
    {
        return await _client.PostAsync<LoginResponse>("auth/login", request);
    }

    public async Task<ApiResponse<RefreshTokenResponse>?> Refresh(string refreshToken)
    {
        return await _client.PostAsync<RefreshTokenResponse>("auth/refresh", new { refreshToken });
    }

    public async Task<ApiResponse<UserDto>?> GetMe()
    {
        return await _client.GetAsync<UserDto>("auth/me");
    }

    public async Task<ApiResponse<UserDto>?> SwitchRole(SwitchRoleRequest request)
    {
        return await _client.PostAsync<UserDto>("auth/switch-role", request);
    }

    public async Task<ApiResponse<object>?> Logout()
    {
        return await _client.PostAsync<object>("auth/logout");
    }

    public async Task<ApiResponse<object>?> ForgotPassword(ForgotPasswordRequest request)
    {
        return await _client.PostAsync<object>("auth/forgot-password", request);
    }

    public async Task<ApiResponse<object>?> ResetPassword(ResetPasswordRequest request)
    {
        return await _client.PostAsync<object>("auth/reset-password", request);
    }
}

