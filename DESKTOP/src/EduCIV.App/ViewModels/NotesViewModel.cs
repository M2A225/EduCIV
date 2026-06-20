using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;
using EduCIV.Api.Models;
using EduCIV.Api.Services;
using System.Collections.ObjectModel;
using System.Windows;

namespace EduCIV.App.ViewModels;

public partial class NotesViewModel : ObservableObject
{
    private readonly IAuthService _auth;
    private readonly INotesApiService _notesApi;

    [ObservableProperty] private ObservableCollection<object> _grades = new();
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string? _searchQuery;
    [ObservableProperty] private object? _selectedGrade;
    [ObservableProperty] private bool _isEditMode;
    [ObservableProperty] private string? _filterStudentId;
    [ObservableProperty] private string? _filterSubjectId;

    public NotesViewModel(IAuthService auth, INotesApiService notesApi)
    {
        _auth = auth;
        _notesApi = notesApi;
    }

    [RelayCommand]
    private async Task LoadGrades()
    {
        IsLoading = true;
        try
        {
            var schoolId = _auth.CurrentSchoolId ?? string.Empty;
            var response = await _notesApi.GetAll(schoolId, 1, 100, FilterStudentId, FilterSubjectId);
            if (response?.Success == true && response.Data?.Items != null)
            {
                Grades.Clear();
                foreach (var g in response.Data.Items)
                    Grades.Add(g);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erreur chargement notes: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void AddGrade()
    {
        SelectedGrade = null;
        IsEditMode = true;
    }

    [RelayCommand]
    private void EditGrade(object? grade)
    {
        SelectedGrade = grade;
        IsEditMode = true;
    }

    [RelayCommand]
    private async Task SaveGrade()
    {
        if (SelectedGrade == null) return;

        IsLoading = true;
        try
        {
            var request = new CreateGradeRequest
            {
                SchoolId = _auth.CurrentSchoolId ?? string.Empty,
                StudentId = GetProperty(SelectedGrade, "StudentId") ?? string.Empty,
                SubjectId = GetProperty(SelectedGrade, "SubjectId") ?? string.Empty,
                Value = Convert.ToDouble(GetProperty(SelectedGrade, "Value") ?? "0"),
                Coefficient = Convert.ToDouble(GetProperty(SelectedGrade, "Coefficient") ?? "1"),
                Type = GetProperty(SelectedGrade, "Type") ?? "INTERROGATION",
                Comment = GetProperty(SelectedGrade, "Comment") as string,
            };

            ApiResponse<object>? response;
            if (IsEditMode && GetProperty(SelectedGrade, "Id") is string id && !string.IsNullOrEmpty(id))
                response = await _notesApi.Update(id, request);
            else
                response = await _notesApi.Create(request);

            if (response?.Success == true)
            {
                IsEditMode = false;
                await LoadGrades();
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
    private async Task DeleteGrade(object? grade)
    {
        if (grade == null) return;
        var id = GetProperty(grade, "Id") as string;
        if (string.IsNullOrEmpty(id)) return;

        if (MessageBox.Show("Supprimer cette note ?", "Confirmation", MessageBoxButton.YesNo, MessageBoxImage.Question) != MessageBoxResult.Yes)
            return;

        IsLoading = true;
        try
        {
            var response = await _notesApi.Delete(id);
            if (response?.Success == true)
                await LoadGrades();
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
        SelectedGrade = null;
    }

    private static string? GetProperty(object obj, string name)
    {
        return obj.GetType().GetProperty(name)?.GetValue(obj)?.ToString();
    }
}
