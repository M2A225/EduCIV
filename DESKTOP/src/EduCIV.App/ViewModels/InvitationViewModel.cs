using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.Api.Services;
using System.Windows;

namespace EduCIV.App.ViewModels;

public partial class InvitationViewModel : ObservableObject
{
    private readonly IInvitationsApiService _invitationsApi;

    [ObservableProperty] private string? _generatedCode;
    [ObservableProperty] private bool _isLoading;

    public InvitationViewModel(IInvitationsApiService invitationsApi)
    {
        _invitationsApi = invitationsApi;
    }

    [RelayCommand]
    private async Task GenerateParent()
    {
        IsLoading = true;
        try
        {
            var r = await _invitationsApi.Generate("PARENT");
            if (r?.Success == true && r.Data != null)
                GeneratedCode = GetProp(r.Data, "Code") ?? "Généré";
            else MessageBox.Show("Erreur de génération", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        catch (Exception ex) { MessageBox.Show($"Erreur: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error); }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private async Task GenerateTeacher()
    {
        IsLoading = true;
        try
        {
            var r = await _invitationsApi.GenerateTeacher();
            if (r?.Success == true && r.Data != null)
                GeneratedCode = GetProp(r.Data, "Code") ?? "Généré";
            else MessageBox.Show("Erreur de génération", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        catch (Exception ex) { MessageBox.Show($"Erreur: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error); }
        finally { IsLoading = false; }
    }

    private static string? GetProp(object obj, string name) => obj.GetType().GetProperty(name)?.GetValue(obj)?.ToString();
}
