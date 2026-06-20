using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;
using EduCIV.Api.Services;
using System.Collections.ObjectModel;
using System.Windows;

namespace EduCIV.App.ViewModels;

public partial class UserViewModel : ObservableObject
{
    private readonly IAuthService _auth;
    private readonly IUsersApiService _usersApi;

    [ObservableProperty] private ObservableCollection<object> _items = new();
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private object? _selectedItem;
    [ObservableProperty] private bool _isEditMode;

    public UserViewModel(IAuthService auth, IUsersApiService usersApi)
    {
        _auth = auth;
        _usersApi = usersApi;
    }

    [RelayCommand]
    private async Task LoadItems()
    {
        IsLoading = true;
        try
        {
            var schoolId = _auth.CurrentSchoolId ?? string.Empty;
            var response = await _usersApi.GetAll(schoolId);
            if (response?.Success == true && response.Data?.Items != null)
            {
                Items.Clear();
                foreach (var item in response.Data.Items) Items.Add(item);
            }
        }
        catch (Exception ex) { MessageBox.Show($"Erreur: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error); }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private void EditItem(object? item) { SelectedItem = item; IsEditMode = true; }

    [RelayCommand]
    private async Task DeleteItem(object? item)
    {
        if (item == null) return;
        var id = GetProp(item, "Id");
        if (string.IsNullOrEmpty(id)) return;
        if (MessageBox.Show("Supprimer cet utilisateur ?", "Confirmation", MessageBoxButton.YesNo, MessageBoxImage.Question) != MessageBoxResult.Yes) return;
        IsLoading = true;
        try { var r = await _usersApi.Delete(id); if (r?.Success == true) await LoadItems(); }
        catch (Exception ex) { MessageBox.Show($"Erreur: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error); }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private void Cancel() { IsEditMode = false; SelectedItem = null; }

    private static string? GetProp(object obj, string name) => obj.GetType().GetProperty(name)?.GetValue(obj)?.ToString();
}
