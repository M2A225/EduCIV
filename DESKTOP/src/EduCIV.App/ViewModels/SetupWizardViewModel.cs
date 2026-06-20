using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;
using EduCIV.Api.Models;
using EduCIV.Api.Services;

namespace EduCIV.App.ViewModels;

public partial class SetupWizardViewModel : ObservableObject
{
    private readonly IAuthService _auth;
    private readonly ISchoolApiService _schoolApi;

    [ObservableProperty] private int _currentStep = 1;
    [ObservableProperty] private int _maxSteps = 6;

    [ObservableProperty] private string _schoolName = string.Empty;
    [ObservableProperty] private string _schoolAddress = string.Empty;
    [ObservableProperty] private string _schoolPhone = string.Empty;
    [ObservableProperty] private string _schoolEmail = string.Empty;

    [ObservableProperty] private string _directorFirstName = string.Empty;
    [ObservableProperty] private string _directorLastName = string.Empty;
    [ObservableProperty] private string _directorEmail = string.Empty;
    [ObservableProperty] private string _directorPassword = string.Empty;

    public event Action? Completing;

    public SetupWizardViewModel(IAuthService auth, ISchoolApiService schoolApi)
    {
        _auth = auth;
        _schoolApi = schoolApi;
    }

    [RelayCommand]
    private void Next()
    {
        if (CurrentStep < MaxSteps)
        {
            CurrentStep++;
        }
    }

    [RelayCommand]
    private void Back()
    {
        if (CurrentStep > 1)
        {
            CurrentStep--;
        }
    }

    [RelayCommand]
    private async Task Complete()
    {
        Completing?.Invoke();
        await _schoolApi.CompleteSetup(new CompleteSetupRequest { SchoolId = _auth.CurrentSchoolId ?? string.Empty });
    }
}


