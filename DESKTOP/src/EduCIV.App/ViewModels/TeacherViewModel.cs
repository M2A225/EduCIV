using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;
using EduCIV.Api.Models;
using EduCIV.Api.Services;
using System.Collections.ObjectModel;
using System.Windows;

namespace EduCIV.App.ViewModels;

public partial class TeacherViewModel : ObservableObject
{
    private readonly IAuthService _auth;
    private readonly ITeacherApiService _teacherApi;

    [ObservableProperty] private ObservableCollection<object> _teachers = new();
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string? _searchQuery;
    [ObservableProperty] private object? _selectedTeacher;
    [ObservableProperty] private bool _isEditMode;

    public TeacherViewModel(IAuthService auth, ITeacherApiService teacherApi)
    {
        _auth = auth;
        _teacherApi = teacherApi;
    }

    [RelayCommand]
    private async Task LoadTeachers()
    {
        IsLoading = true;
        try
        {
            var schoolId = _auth.CurrentSchoolId ?? string.Empty;
            var response = await _teacherApi.GetAll(schoolId);
            if (response?.Success == true && response.Data?.Items != null)
            {
                Teachers.Clear();
                foreach (var t in response.Data.Items)
                    Teachers.Add(t);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erreur chargement enseignants: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private async Task Search()
    {
        if (string.IsNullOrWhiteSpace(SearchQuery))
        {
            await LoadTeachers();
            return;
        }
        // Search not implemented in API yet, fallback to load all
        await LoadTeachers();
    }

    [RelayCommand]
    private void AddTeacher()
    {
        SelectedTeacher = null;
        IsEditMode = true;
    }

    [RelayCommand]
    private void EditTeacher(object? teacher)
    {
        SelectedTeacher = teacher;
        IsEditMode = true;
    }

    [RelayCommand]
    private async Task SaveTeacher()
    {
        if (SelectedTeacher == null) return;

        IsLoading = true;
        try
        {
            var request = new CreateTeacherRequest
            {
                SchoolId = _auth.CurrentSchoolId ?? string.Empty,
                FirstName = GetProperty(SelectedTeacher, "FirstName") ?? string.Empty,
                LastName = GetProperty(SelectedTeacher, "LastName") ?? string.Empty,
                Email = GetProperty(SelectedTeacher, "Email") ?? string.Empty,
                Phone = GetProperty(SelectedTeacher, "Phone") as string,
            };

            ApiResponse<object>? response;
            if (IsEditMode && GetProperty(SelectedTeacher, "Id") is string id && !string.IsNullOrEmpty(id))
                response = await _teacherApi.Update(id, request);
            else
                response = await _teacherApi.Create(request);

            if (response?.Success == true)
            {
                IsEditMode = false;
                await LoadTeachers();
            }
            else
            {
                MessageBox.Show($"Erreur: {response?.Error?.ToString() ?? "Inconnue"}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erreur sauvegarde: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private async Task DeleteTeacher(object? teacher)
    {
        if (teacher == null) return;
        var id = GetProperty(teacher, "Id") as string;
        if (string.IsNullOrEmpty(id)) return;

        if (MessageBox.Show("Supprimer cet enseignant ?", "Confirmation", MessageBoxButton.YesNo, MessageBoxImage.Question) != MessageBoxResult.Yes)
            return;

        IsLoading = true;
        try
        {
            var response = await _teacherApi.Delete(id);
            if (response?.Success == true)
                await LoadTeachers();
            else
                MessageBox.Show($"Erreur: {response?.Error?.ToString() ?? "Inconnue"}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erreur suppression: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void Cancel()
    {
        IsEditMode = false;
        SelectedTeacher = null;
    }

    private static string? GetProperty(object obj, string name)
    {
        return obj.GetType().GetProperty(name)?.GetValue(obj)?.ToString();
    }
}
