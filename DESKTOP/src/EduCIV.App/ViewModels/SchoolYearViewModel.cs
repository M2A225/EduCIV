using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;
using EduCIV.Api.Models;
using EduCIV.Api.Services;
using System.Collections.ObjectModel;
using System.Windows;

namespace EduCIV.App.ViewModels;

public partial class SchoolYearViewModel : ObservableObject
{
    private readonly IAuthService _auth;
    private readonly ISchoolYearsApiService _schoolYearsApi;

    [ObservableProperty] private ObservableCollection<object> _items = new();
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private object? _selectedItem;
    [ObservableProperty] private bool _isEditMode;

    public SchoolYearViewModel(IAuthService auth, ISchoolYearsApiService schoolYearsApi)
    {
        _auth = auth;
        _schoolYearsApi = schoolYearsApi;
    }

    [RelayCommand]
    private async Task LoadItems()
    {
        IsLoading = true;
        try
        {
            var schoolId = _auth.CurrentSchoolId ?? string.Empty;
            var response = await _schoolYearsApi.GetAll(schoolId);
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
    private void AddItem() { SelectedItem = null; IsEditMode = true; }

    [RelayCommand]
    private void EditItem(object? item) { SelectedItem = item; IsEditMode = true; }

    [RelayCommand]
    private async Task SaveItem()
    {
        if (SelectedItem == null) return;
        IsLoading = true;
        try
        {
            var request = new CreateSchoolYearRequest
            {
                Label = GetProp(SelectedItem, "Label") ?? string.Empty,
                StartDate = DateTime.TryParse(GetProp(SelectedItem, "StartDate"), out var s) ? s : DateTime.Now,
                EndDate = DateTime.TryParse(GetProp(SelectedItem, "EndDate"), out var e) ? e : DateTime.Now.AddYears(1),
                SchoolId = _auth.CurrentSchoolId ?? string.Empty
            };
            ApiResponse<object>? response;
            if (IsEditMode && GetProp(SelectedItem, "Id") is string id && !string.IsNullOrEmpty(id))
                response = await _schoolYearsApi.Update(id, request);
            else
                response = await _schoolYearsApi.Create(request);
            if (response?.Success == true) { IsEditMode = false; await LoadItems(); }
            else MessageBox.Show($"Erreur: {response?.Error}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        catch (Exception ex) { MessageBox.Show($"Erreur: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error); }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private async Task DeleteItem(object? item)
    {
        if (item == null) return;
        var id = GetProp(item, "Id");
        if (string.IsNullOrEmpty(id)) return;
        if (MessageBox.Show("Supprimer ?", "Confirmation", MessageBoxButton.YesNo, MessageBoxImage.Question) != MessageBoxResult.Yes) return;
        IsLoading = true;
        try { var r = await _schoolYearsApi.Delete(id); if (r?.Success == true) await LoadItems(); }
        catch (Exception ex) { MessageBox.Show($"Erreur: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error); }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private void Cancel() { IsEditMode = false; SelectedItem = null; }

    private static string? GetProp(object obj, string name) => obj.GetType().GetProperty(name)?.GetValue(obj)?.ToString();
}
