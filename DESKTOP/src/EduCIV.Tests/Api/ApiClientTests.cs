using EduCIV.Api;
using EduCIV.Api.Models;
using FluentAssertions;
using Xunit;

namespace EduCIV.Tests.Api;

public class ApiClientTests
{
    private readonly ApiClient _apiClient;

    public ApiClientTests()
    {
        _apiClient = new ApiClient(new HttpClient());
    }

    [Fact]
    public void GetAccessToken_ShouldDefaultToNull()
    {
        _apiClient.GetAccessToken().Should().BeNull();
    }

    [Fact]
    public void SetTokens_ShouldStoreTokens()
    {
        _apiClient.SetTokens("access-123", "refresh-456");

        _apiClient.GetAccessToken().Should().Be("access-123");
    }

    [Fact]
    public void ClearTokens_ShouldRemoveTokens()
    {
        _apiClient.SetTokens("access-123", "refresh-456");

        _apiClient.ClearTokens();

        _apiClient.GetAccessToken().Should().BeNull();
    }

    [Fact]
    public void SetSchoolId_ShouldNotThrow()
    {
        var act = () => _apiClient.SetSchoolId("42");
        act.Should().NotThrow();
    }

    [Fact]
    public void BaseUrl_ShouldBeSettable()
    {
        _apiClient.BaseUrl = "https://api.example.com";
        _apiClient.BaseUrl.Should().Be("https://api.example.com");
    }

    [Fact]
    public void SessionExpired_ShouldBeSubscribable()
    {
        var invoked = false;
        _apiClient.SessionExpired += (_, _) => invoked = true;

        invoked.Should().BeFalse();
    }

    [Fact]
    public void ApiResponse_ShouldDeserializeSuccess()
    {
        var json = "{\"success\":true,\"data\":{\"name\":\"test\"}}";
        var response = Newtonsoft.Json.JsonConvert.DeserializeObject<ApiResponse<object>>(json);

        response.Should().NotBeNull();
        response!.Success.Should().BeTrue();
    }

    [Fact]
    public void ApiResponse_Error_ShouldDeserialize()
    {
        var json = "{\"success\":false,\"error\":{\"code\":\"NOT_FOUND\",\"message\":\"Not found\"}}";
        var response = Newtonsoft.Json.JsonConvert.DeserializeObject<ApiResponse<object>>(json);

        response.Should().NotBeNull();
        response!.Success.Should().BeFalse();
        response.Error.Should().NotBeNull();
    }
}
