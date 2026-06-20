using System.Text;
using System.Text.Json;
using EduCIV.Api;
using EduCIV.Api.Models;
using EduCIV.Api.Services;
using EduCIV.Sync;

namespace EduCIV.App.Services;

public class AuthService : IAuthService
{
    private readonly AuthApiService _authApi;
    private readonly ApiClient _apiClient;
    private readonly SyncEngine _syncEngine;
    private UserDto? _currentUser;

    public event EventHandler? AuthStateChanged;
    public bool IsLoggedIn => _currentUser != null;
    public UserDto? CurrentUser => _currentUser;
    public string? CurrentSchoolId => _currentUser?.PrimarySchoolId;

    public AuthService(AuthApiService authApi, ApiClient apiClient, SyncEngine syncEngine)
    {
        _authApi = authApi;
        _apiClient = apiClient;
        _syncEngine = syncEngine;
    }

    public async Task<bool> LoginAsync(string identifier, string password)
    {
        var request = new LoginRequest { Identifier = identifier, Password = password };
        var response = await _authApi.Login(request);
        if (response?.Success == true && response.Data != null)
        {
            _apiClient.SetTokens(response.Data.AccessToken, null);
            _currentUser = response.Data.User ?? DecodeJwtUser(response.Data.AccessToken);
            if (_currentUser != null)
            {
                if (!string.IsNullOrEmpty(_currentUser.PrimarySchoolId))
                    _apiClient.SetSchoolId(_currentUser.PrimarySchoolId);
                _syncEngine.IsAuthenticated = true;
                _syncEngine.Start();
                AuthStateChanged?.Invoke(this, EventArgs.Empty);
                return true;
            }
        }
        return false;
    }

    private static UserDto? DecodeJwtUser(string token)
    {
        try
        {
            var parts = token.Split('.');
            if (parts.Length < 2) return null;
            var payload = parts[1];
            var len = payload.Length % 4;
            var padded = len == 2 ? payload + "==" : len == 3 ? payload + "=" : payload;
            var base64 = padded.Replace('-', '+').Replace('_', '/');
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(base64));
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            var user = new UserDto();
            if (root.TryGetProperty("sub", out var sub)) user.Id = sub.GetRawText();
            if (root.TryGetProperty("name", out var name)) user.Name = name.GetString() ?? string.Empty;
            if (root.TryGetProperty("email", out var email)) user.Email = email.GetString() ?? string.Empty;
            if (root.TryGetProperty("phone", out var phone)) user.Phone = phone.GetString();
            if (root.TryGetProperty("role", out var role)) user.Role = role.GetString() ?? string.Empty;
            if (root.TryGetProperty("roles", out var roles))
                user.Roles = roles.EnumerateArray().Select(r => r.GetString() ?? string.Empty).Where(s => s.Length > 0).ToList();
            if (root.TryGetProperty("school_ids", out var sids))
                user.SchoolIds = sids.EnumerateArray().Select(s => s.GetRawText()).ToList();
            if (root.TryGetProperty("primary_school_id", out var psid) && psid.ValueKind != System.Text.Json.JsonValueKind.Null)
                user.PrimarySchoolId = psid.GetRawText();
            return user;
        }
        catch
        {
            return null;
        }
    }

    public async Task LogoutAsync()
    {
        try { await _authApi.Logout(); } catch { }
        _apiClient.ClearTokens();
        _currentUser = null;
        AuthStateChanged?.Invoke(this, EventArgs.Empty);
    }

    public async Task<bool> RefreshSessionAsync()
    {
        var response = await _authApi.GetMe();
        if (response?.Success == true && response.Data != null)
        {
            _currentUser = response.Data;
            AuthStateChanged?.Invoke(this, EventArgs.Empty);
            return true;
        }
        var token = _apiClient.GetAccessToken();
        if (!string.IsNullOrEmpty(token))
        {
            _currentUser = DecodeJwtUser(token);
            if (_currentUser != null)
            {
                AuthStateChanged?.Invoke(this, EventArgs.Empty);
                return true;
            }
        }
        return false;
    }

    public async Task<bool> SwitchRoleAsync(string role)
    {
        var request = new SwitchRoleRequest { Role = role };
        var response = await _authApi.SwitchRole(request);
        if (response?.Success == true && response.Data != null)
        {
            _currentUser = response.Data;
            if (!string.IsNullOrEmpty(_currentUser.PrimarySchoolId))
                _apiClient.SetSchoolId(_currentUser.PrimarySchoolId);
            AuthStateChanged?.Invoke(this, EventArgs.Empty);
            return true;
        }
        return false;
    }
}

