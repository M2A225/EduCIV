using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;
using EduCIV.Api.Models;
using EduCIV.Api.Services;
using System.Collections.ObjectModel;
using System.Windows;

namespace EduCIV.App.ViewModels;

public partial class StudentViewModel : ObservableObject
{
    private readonly IAuthService _auth;
    private readonly IStudentApiService _studentApi;

    [ObservableProperty] private ObservableCollection<object> _students = new();
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string? _searchQuery;
    [ObservableProperty] private object? _selectedStudent;
    [ObservableProperty] private bool _isEditMode;

    public StudentViewModel(IAuthService auth, IStudentApiService studentApi)
    {
        _auth = auth;
        _studentApi = studentApi;
    }

    [RelayCommand]
    private async Task LoadStudents()
    {
        IsLoading = true;
        try
        {
            var schoolId = _auth.CurrentSchoolId ?? string.Empty;
            var response = await _studentApi.GetAll(schoolId);
            if (response?.Success == true && response.Data?.Items != null)
            {
                Students.Clear();
                foreach (var s in response.Data.Items)
                    Students.Add(s);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erreur chargement élèves: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
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
            await LoadStudents();
            return;
        }

        IsLoading = true;
        try
        {
            var schoolId = _auth.CurrentSchoolId ?? string.Empty;
            var response = await _studentApi.Search(schoolId, SearchQuery!);
            if (response?.Success == true && response.Data != null)
            {
                Students.Clear();
                foreach (var s in (System.Collections.IEnumerable)response.Data)
                    Students.Add(s);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erreur recherche: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void AddStudent()
    {
        SelectedStudent = null;
        IsEditMode = true;
    }

    [RelayCommand]
    private void EditStudent(object? student)
    {
        SelectedStudent = student;
        IsEditMode = true;
    }

    [RelayCommand]
    private async Task SaveStudent()
    {
        if (SelectedStudent == null) return;

        IsLoading = true;
        try
        {
            var request = new CreateStudentRequest
            {
                SchoolId = _auth.CurrentSchoolId ?? string.Empty,
                FirstName = GetProperty(SelectedStudent, "FirstName") ?? string.Empty,
                LastName = GetProperty(SelectedStudent, "LastName") ?? string.Empty,
                Email = GetProperty(SelectedStudent, "Email") as string,
                Phone = GetProperty(SelectedStudent, "Phone") as string,
                ClassId = GetProperty(SelectedStudent, "ClassId") as string,
            };

            ApiResponse<object>? response;
            if (IsEditMode && GetProperty(SelectedStudent, "Id") is string id && !string.IsNullOrEmpty(id))
                response = await _studentApi.Update(id, request);
            else
                response = await _studentApi.Create(request);

            if (response?.Success == true)
            {
                IsEditMode = false;
                await LoadStudents();
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
    private async Task DeleteStudent(object? student)
    {
        if (student == null) return;
        var id = GetProperty(student, "Id") as string;
        if (string.IsNullOrEmpty(id)) return;

        if (MessageBox.Show("Supprimer cet élève ?", "Confirmation", MessageBoxButton.YesNo, MessageBoxImage.Question) != MessageBoxResult.Yes)
            return;

        IsLoading = true;
        try
        {
            var response = await _studentApi.Delete(id);
            if (response?.Success == true)
                await LoadStudents();
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
        SelectedStudent = null;
    }

    private static string? GetProperty(object obj, string name)
    {
        return obj.GetType().GetProperty(name)?.GetValue(obj)?.ToString();
    }
}
