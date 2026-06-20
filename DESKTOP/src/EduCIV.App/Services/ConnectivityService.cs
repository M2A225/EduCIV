using EduCIV.Api;

namespace EduCIV.App.Services;

public class ConnectivityService : IConnectivityService, IDisposable
{
    private readonly ApiClient _apiClient;
    private readonly Timer _timer;
    private bool _isOnline;

    public event EventHandler<bool>? ConnectivityChanged;
    public bool IsOnline => _isOnline;

    public ConnectivityService(ApiClient apiClient)
    {
        _apiClient = apiClient;
        _timer = new Timer(async _ => await CheckConnectionAsync(), null, TimeSpan.Zero, TimeSpan.FromSeconds(30));
    }

    public async Task<bool> CheckConnectionAsync()
    {
        try
        {
            var result = await _apiClient.GetAsync<object>("health");
            _isOnline = result?.Success == true;
        }
        catch
        {
            _isOnline = false;
        }
        ConnectivityChanged?.Invoke(this, _isOnline);
        return _isOnline;
    }

    public void Dispose()
    {
        _timer.Dispose();
    }
}

