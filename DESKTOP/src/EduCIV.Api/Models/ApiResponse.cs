
using Newtonsoft.Json;

namespace EduCIV.Api.Models;

public class ApiResponse<T>
{
    [JsonProperty("success")]
    public bool Success { get; set; }

    [JsonProperty("data")]
    public T? Data { get; set; }

    [JsonProperty("error")]
    public ErrorDetail? Error { get; set; }
}

public class ErrorDetail
{
    [JsonProperty("code")]
    public string Code { get; set; } = string.Empty;

    [JsonProperty("message")]
    public string Message { get; set; } = string.Empty;

    [JsonProperty("details")]
    public string? Details { get; set; }
}

public class RefreshTokenResponse
{
    [JsonProperty("accessToken")]
    public string AccessToken { get; set; } = string.Empty;

    [JsonProperty("refreshToken")]
    public string? RefreshToken { get; set; }
}

public enum SchoolSetupStatus
{
    NotStarted,
    InProgress,
    Completed
}

public class PaginatedResponse<T>
{
    [JsonProperty("items")]
    public List<T> Items { get; set; } = new();

    [JsonProperty("totalCount")]
    public int TotalCount { get; set; }

    [JsonProperty("page")]
    public int Page { get; set; }

    [JsonProperty("pageSize")]
    public int PageSize { get; set; }

    [JsonProperty("hasNextPage")]
    public bool HasNextPage => Page * PageSize < TotalCount;
}

