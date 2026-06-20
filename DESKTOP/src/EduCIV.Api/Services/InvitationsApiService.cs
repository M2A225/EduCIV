using EduCIV.Api.Models;

namespace EduCIV.Api.Services;

public class InvitationsApiService : IInvitationsApiService
{
    private readonly ApiClient _client;

    public InvitationsApiService(ApiClient client) { _client = client; }

    public async Task<ApiResponse<object>?> Generate(string targetType)
        => await _client.PostAsync<object>("invitations/generate", new { targetType });

    public async Task<ApiResponse<object>?> GenerateTeacher()
        => await _client.PostAsync<object>("invitations/generate-teacher", new { });
}
