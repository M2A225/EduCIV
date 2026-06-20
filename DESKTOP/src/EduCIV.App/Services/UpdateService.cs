using System;
using System.Threading.Tasks;
using System.Windows;
using Velopack;

namespace EduCIV.App.Services;

public class UpdateService
{
    private readonly UpdateManager _updateManager;

    public bool IsUpdateAvailable { get; private set; }
    public string? UpdateVersion { get; private set; }

    public UpdateService()
    {
        _updateManager = new UpdateManager("https://github.com/anice-edu/educiv-desktop-releases");
    }

    public async Task<bool> CheckForUpdatesAsync()
    {
        try
        {
            var info = await _updateManager.CheckForUpdatesAsync();
            if (info != null)
            {
                IsUpdateAvailable = true;
                UpdateVersion = info.TargetFullRelease?.Version.ToString() ?? "inconnue";
                return true;
            }
            return false;
        }
        catch
        {
            return false;
        }
    }

    public async Task ApplyUpdateAsync()
    {
        try
        {
            var info = await _updateManager.CheckForUpdatesAsync();
            if (info == null) return;

            await _updateManager.DownloadUpdatesAsync(info);
            _updateManager.ApplyUpdatesAndRestart(info.TargetFullRelease!);
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                $"Erreur lors de la mise a jour :\n{ex.Message}",
                "Mise a jour",
                MessageBoxButton.OK,
                MessageBoxImage.Warning);
        }
    }
}
