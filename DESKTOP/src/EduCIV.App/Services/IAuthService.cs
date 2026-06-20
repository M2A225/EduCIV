using EduCIV.Api.Models;

namespace EduCIV.App.Services;

public interface IAuthService
{
    Task<bool> LoginAsync(string identifier, string password);
    Task LogoutAsync();
    Task<bool> RefreshSessionAsync();
    bool IsLoggedIn { get; }
    UserDto? CurrentUser { get; }
    string? CurrentSchoolId { get; }
    event EventHandler? AuthStateChanged;
    Task<bool> SwitchRoleAsync(string role);
}

