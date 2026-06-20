using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using EduCIV.Api.Models;

namespace EduCIV.Api;

public class ApiClient
{
    private readonly HttpClient _httpClient;
    private readonly SemaphoreSlim _refreshLock = new(1, 1);
    private string? _accessToken;
    private string? _refreshToken;
    private string? _schoolId;
    private bool _isRefreshing;
    private readonly Queue<TaskCompletionSource<bool>> _retryQueue = new();

    private static readonly JsonSerializerSettings JsonSettings = new()
    {
        NullValueHandling = NullValueHandling.Ignore,
        ContractResolver = new CamelCasePropertyNamesContractResolver()
    };

    public string? BaseUrl { get; set; }

    public event EventHandler? SessionExpired;

    public ApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public string? GetAccessToken() => _accessToken;

    public void SetTokens(string? accessToken, string? refreshToken)
    {
        _accessToken = accessToken;
        _refreshToken = refreshToken;
    }

    public void SetSchoolId(string? schoolId)
    {
        _schoolId = schoolId;
    }

    public void ClearTokens()
    {
        _accessToken = null;
        _refreshToken = null;
        _schoolId = null;
    }

    private void ApplyHeaders(HttpRequestMessage request)
    {
        if (!string.IsNullOrEmpty(_accessToken))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _accessToken);
        }
        if (!string.IsNullOrEmpty(_schoolId))
        {
            request.Headers.Remove("x-school-id");
            request.Headers.Add("x-school-id", _schoolId);
        }
    }

    public async Task<ApiResponse<T>?> GetAsync<T>(string endpoint)
    {
        return await SendAsync<T>(HttpMethod.Get, endpoint);
    }

    public async Task<ApiResponse<T>?> PostAsync<T>(string endpoint, object? body = null)
    {
        return await SendAsync<T>(HttpMethod.Post, endpoint, body, isWrite: true);
    }

    public async Task<ApiResponse<T>?> PutAsync<T>(string endpoint, object? body = null)
    {
        return await SendAsync<T>(HttpMethod.Put, endpoint, body, isWrite: true);
    }

    public async Task<ApiResponse<T>?> DeleteAsync<T>(string endpoint)
    {
        return await SendAsync<T>(HttpMethod.Delete, endpoint, isWrite: true);
    }

    private async Task<ApiResponse<T>?> SendAsync<T>(HttpMethod method, string endpoint, object? body = null, bool isWrite = false)
    {
        var url = $"{BaseUrl?.TrimEnd('/')}/{endpoint}";
        var request = new HttpRequestMessage(method, url);

        ApplyHeaders(request);

        if (isWrite)
        {
            request.Headers.Remove("X-Client-Operation-Id");
            request.Headers.Add("X-Client-Operation-Id", Guid.NewGuid().ToString());
        }

        if (body != null)
        {
            var json = JsonConvert.SerializeObject(body, JsonSettings);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");
        }

        var response = await _httpClient.SendAsync(request);

        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
        {
            var retryResult = await TryRefreshAndRetry();
            if (retryResult)
            {
                return await SendAsync<T>(method, endpoint, body, isWrite);
            }
            return null;
        }

        var content = await response.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<ApiResponse<T>>(content, JsonSettings);
    }

    private async Task<bool> TryRefreshAndRetry()
    {
        var tcs = new TaskCompletionSource<bool>();

        if (_isRefreshing)
        {
            _retryQueue.Enqueue(tcs);
            return await tcs.Task;
        }

        await _refreshLock.WaitAsync();
        try
        {
            if (_isRefreshing)
            {
                _retryQueue.Enqueue(tcs);
                return await tcs.Task;
            }

            _isRefreshing = true;

            if (string.IsNullOrEmpty(_refreshToken))
            {
                SessionExpired?.Invoke(this, EventArgs.Empty);
                return false;
            }

            var refreshUrl = $"{BaseUrl?.TrimEnd('/')}/auth/refresh";
            var refreshRequest = new HttpRequestMessage(HttpMethod.Post, refreshUrl);
            refreshRequest.Content = new StringContent(
                JsonConvert.SerializeObject(new { refreshToken = _refreshToken }, JsonSettings),
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.SendAsync(refreshRequest);

            if (!response.IsSuccessStatusCode)
            {
                SessionExpired?.Invoke(this, EventArgs.Empty);
                NotifyQueue(false);
                return false;
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<ApiResponse<RefreshTokenResponse>>(responseContent, JsonSettings);

            if (result?.Success == true && result.Data != null)
            {
                _accessToken = result.Data.AccessToken;
                if (!string.IsNullOrEmpty(result.Data.RefreshToken))
                {
                    _refreshToken = result.Data.RefreshToken;
                }
                NotifyQueue(true);
                return true;
            }

            SessionExpired?.Invoke(this, EventArgs.Empty);
            NotifyQueue(false);
            return false;
        }
        finally
        {
            _isRefreshing = false;
            _refreshLock.Release();
        }
    }

    private void NotifyQueue(bool success)
    {
        while (_retryQueue.Count > 0)
        {
            if (_retryQueue.TryDequeue(out var tcs))
            {
                tcs.TrySetResult(success);
            }
        }
    }
}
