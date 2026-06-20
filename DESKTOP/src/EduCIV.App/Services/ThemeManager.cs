using System.Windows;
using System.Windows.Media;

namespace EduCIV.App.Services;

public enum AppTheme
{
    Light,
    Dark,
    System
}

public class ThemeManager
{
    private const string LightThemeUri = "/Resources/Themes/LightTheme.xaml";
    private const string DarkThemeUri = "/Resources/Themes/DarkTheme.xaml";

    private ResourceDictionary _currentTheme = new();
    private ResourceDictionary _baseTheme = new();

    public AppTheme CurrentTheme { get; private set; } = AppTheme.Light;
    public bool IsDarkMode => CurrentTheme == AppTheme.Dark ||
        (CurrentTheme == AppTheme.System && GetSystemIsDark());

    public event EventHandler? ThemeChanged;

    public void Initialize()
    {
        ApplyTheme();
    }

    public void SetTheme(AppTheme theme)
    {
        CurrentTheme = theme;
        ApplyTheme();
        ThemeChanged?.Invoke(this, EventArgs.Empty);
    }

    public void ToggleTheme()
    {
        SetTheme(IsDarkMode ? AppTheme.Light : AppTheme.Dark);
    }

    private void ApplyTheme()
    {
        var app = Application.Current;
        if (app == null) return;

        var toRemove = app.Resources.MergedDictionaries
            .Where(d => d.Source != null && d.Source.OriginalString.Contains("Theme"))
            .ToList();

        foreach (var dict in toRemove)
            app.Resources.MergedDictionaries.Remove(dict);

        var uri = IsDarkMode ? DarkThemeUri : LightThemeUri;
        _currentTheme = new ResourceDictionary { Source = new Uri(uri, UriKind.Relative) };
        app.Resources.MergedDictionaries.Add(_currentTheme);
    }

    private static bool GetSystemIsDark()
    {
        try
        {
            var key = Microsoft.Win32.Registry.GetValue(
                @"HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize",
                "AppsUseLightTheme", 1);
            return key is int val && val == 0;
        }
        catch { return false; }
    }
}
