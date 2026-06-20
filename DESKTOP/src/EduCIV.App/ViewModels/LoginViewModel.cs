using System.Windows;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;

namespace EduCIV.App.ViewModels;

public partial class LoginViewModel : ObservableObject
{
    private readonly IAuthService _auth;

    [ObservableProperty] private string _identifier = string.Empty;
    [ObservableProperty] private string _password = string.Empty;
    [ObservableProperty] private string? _errorMessage;
    [ObservableProperty] private bool _isLoading;

    public event EventHandler? LoginSucceeded;

    public Visibility ErrorMessageVisibility =>
        string.IsNullOrEmpty(ErrorMessage) ? Visibility.Collapsed : Visibility.Visible;

    public Visibility LoadingVisibility =>
        IsLoading ? Visibility.Visible : Visibility.Collapsed;

    partial void OnErrorMessageChanged(string? value)
    {
        OnPropertyChanged(nameof(ErrorMessageVisibility));
    }

    partial void OnIsLoadingChanged(bool value)
    {
        OnPropertyChanged(nameof(LoadingVisibility));
    }

    public LoginViewModel(IAuthService auth)
    {
        _auth = auth;
    }

    [RelayCommand]
    private async Task Login()
    {
        ErrorMessage = null;
        IsLoading = true;

        try
        {
            var success = await _auth.LoginAsync(Identifier, Password);
            if (success)
            {
                LoginSucceeded?.Invoke(this, EventArgs.Empty);
            }
            else
            {
                ErrorMessage = "Identifiant ou mot de passe incorrect.";
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = ex.Message;
        }
        finally
        {
            IsLoading = false;
        }
    }
}
