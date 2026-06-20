using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;
using EduCIV.Api.Services;

namespace EduCIV.App.ViewModels;

public partial class DashboardViewModel : ObservableObject
{
    private readonly IAuthService _auth;
    private readonly ISchoolApiService _schoolApi;

    [ObservableProperty] private string _welcomeMessage = string.Empty;
    [ObservableProperty] private string _schoolInfo = string.Empty;
    [ObservableProperty] private int _totalStudents;
    [ObservableProperty] private int _totalTeachers;
    [ObservableProperty] private int _totalClasses;
    [ObservableProperty] private int _totalSubjects;

    public DashboardViewModel(IAuthService auth, ISchoolApiService schoolApi)
    {
        _auth = auth;
        _schoolApi = schoolApi;

        if (_auth.CurrentUser != null)
        {
            WelcomeMessage = $"Bonjour, {_auth.CurrentUser.Name}";
        }
    }

    [RelayCommand]
    private async Task Load()
    {
        var sid = _auth.CurrentSchoolId ?? string.Empty;
        var info = await _schoolApi.GetInfo(sid);
        if (info?.Success == true && info.Data != null)
            SchoolInfo = $"{info.Data.Name} - {info.Data.Address}";

        var stats = await _schoolApi.GetStats(sid);
        if (stats?.Success == true && stats.Data != null)
        {
            TotalStudents = stats.Data.TotalStudents;
            TotalTeachers = stats.Data.TotalTeachers;
            TotalClasses = stats.Data.TotalClasses;
            TotalSubjects = stats.Data.TotalSubjects;
        }
    }
}
