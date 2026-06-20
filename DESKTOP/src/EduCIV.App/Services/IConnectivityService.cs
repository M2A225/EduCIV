namespace EduCIV.App.Services;

public interface IConnectivityService
{
    bool IsOnline { get; }
    event EventHandler<bool>? ConnectivityChanged;
    Task<bool> CheckConnectionAsync();
}

