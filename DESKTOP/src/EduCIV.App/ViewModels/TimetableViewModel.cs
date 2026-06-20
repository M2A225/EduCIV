using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;
using EduCIV.Api.Models;
using EduCIV.Api.Services;
using System.Collections.ObjectModel;
using System.Windows;

namespace EduCIV.App.ViewModels;

public partial class TimetableViewModel : ObservableObject
{
    private readonly IAuthService _auth;
    private readonly ITimetablesApiService _timetablesApi;

    [ObservableProperty] private ObservableCollection<object> _items = new();
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string? _selectedClassId;
    [ObservableProperty] private object? _selectedItem;
    [ObservableProperty] private bool _isEditMode;

    public TimetableViewModel(IAuthService auth, ITimetablesApiService timetablesApi)
    {
        _auth = auth;
        _timetablesApi = timetablesApi;
    }

    [RelayCommand]
    private async Task LoadItems()
    {
        IsLoading = true;
        try
        {
            var schoolId = _auth.CurrentSchoolId ?? string.Empty;
            var response = await _timetablesApi.GetAll(schoolId, SelectedClassId);
            if (response?.Success == true)
            {
                Items.Clear();
                if (response.Data is System.Collections.IEnumerable enumerable)
                    foreach (var item in enumerable) Items.Add(item);
            }
        }
        catch (Exception ex) { MessageBox.Show($"Erreur: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error); }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private void AddItem() { SelectedItem = null; IsEditMode = true; }

    [RelayCommand]
    private async Task SaveItem()
    {
        if (SelectedItem == null) return;
        IsLoading = true;
        try
        {
            var request = new CreateTimetableSlotRequest
            {
                ClassId = GetProp(SelectedItem, "ClassId") ?? string.Empty,
                TeacherId = GetProp(SelectedItem, "TeacherId") ?? string.Empty,
                SubjectId = GetProp(SelectedItem, "SubjectId") ?? string.Empty,
                SchoolId = _auth.CurrentSchoolId ?? string.Empty
            };
            if (int.TryParse(GetProp(SelectedItem, "DayOfWeek"), out var dow)) request.DayOfWeek = dow;
            var start = GetProp(SelectedItem, "StartTime");
            if (!string.IsNullOrEmpty(start)) request.StartTime = start;
            var end = GetProp(SelectedItem, "EndTime");
            if (!string.IsNullOrEmpty(end)) request.EndTime = end;
            var response = await _timetablesApi.Create(request);
            if (response?.Success == true) { IsEditMode = false; await LoadItems(); }
            else MessageBox.Show($"Erreur: {response?.Error}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        catch (Exception ex) { MessageBox.Show($"Erreur: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error); }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private void Cancel() { IsEditMode = false; SelectedItem = null; }

    private static string? GetProp(object obj, string name) => obj.GetType().GetProperty(name)?.GetValue(obj)?.ToString();
}
