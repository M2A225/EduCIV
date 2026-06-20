using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;
using EduCIV.Api.Models;
using EduCIV.Api.Services;
using System.Collections.ObjectModel;
using System.Windows;

namespace EduCIV.App.ViewModels;

public partial class AttendanceViewModel : ObservableObject
{
    private readonly IAuthService _auth;
    private readonly IAttendanceApiService _attendanceApi;

    [ObservableProperty] private ObservableCollection<object> _sessions = new();
    [ObservableProperty] private ObservableCollection<object> _records = new();
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private bool _isLoadingRecords;
    [ObservableProperty] private object? _selectedSession;
    [ObservableProperty] private bool _isEditMode;

    public AttendanceViewModel(IAuthService auth, IAttendanceApiService attendanceApi)
    {
        _auth = auth;
        _attendanceApi = attendanceApi;
    }

    [RelayCommand]
    private async Task LoadSessions()
    {
        IsLoading = true;
        try
        {
            var schoolId = _auth.CurrentSchoolId ?? string.Empty;
            var response = await _attendanceApi.GetSessions(schoolId);
            if (response?.Success == true && response.Data?.Items != null)
            {
                Sessions.Clear();
                foreach (var s in response.Data.Items)
                    Sessions.Add(s);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erreur chargement sessions: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsLoading = false;
        }
    }

    partial void OnSelectedSessionChanged(object? value)
    {
        if (value != null)
            _ = LoadRecordsForSession(value);
    }

    [RelayCommand]
    private async Task LoadRecordsForSession(object? session)
    {
        if (session == null) return;
        var sessionId = GetProperty(session, "Id") as string;
        if (string.IsNullOrEmpty(sessionId)) return;

        IsLoadingRecords = true;
        try
        {
            var response = await _attendanceApi.GetAttendanceBySession(sessionId);
            if (response?.Success == true && response.Data?.Items != null)
            {
                Records.Clear();
                foreach (var r in response.Data.Items)
                    Records.Add(r);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erreur chargement appels: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsLoadingRecords = false;
        }
    }

    [RelayCommand]
    private void AddSession()
    {
        SelectedSession = null;
        IsEditMode = true;
    }

    [RelayCommand]
    private void EditSession(object? session)
    {
        SelectedSession = session;
        IsEditMode = true;
    }

    [RelayCommand]
    private async Task SaveSession()
    {
        if (SelectedSession == null) return;

        IsLoading = true;
        try
        {
            var request = new CreateAttendanceSessionRequest
            {
                SchoolId = _auth.CurrentSchoolId ?? string.Empty,
                ClassId = GetProperty(SelectedSession, "ClassId") ?? string.Empty,
                Date = DateTime.TryParse(GetProperty(SelectedSession, "Date"), out var d) ? d : DateTime.Today,
                StartTime = GetProperty(SelectedSession, "StartTime") ?? "08:00",
            };

            ApiResponse<object>? response;
            if (IsEditMode && GetProperty(SelectedSession, "Id") is string id && !string.IsNullOrEmpty(id))
                response = await _attendanceApi.CreateSession(request); // API should support update
            else
                response = await _attendanceApi.CreateSession(request);

            if (response?.Success == true)
            {
                IsEditMode = false;
                await LoadSessions();
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
    private async Task MarkAttendance(object? record)
    {
        if (record == null || SelectedSession == null) return;
        var sessionId = GetProperty(SelectedSession, "Id") as string;
        var studentId = GetProperty(record, "StudentId") as string;
        var status = GetProperty(record, "Status") as string ?? "PRESENT";

        if (string.IsNullOrEmpty(sessionId) || string.IsNullOrEmpty(studentId)) return;

        try
        {
            var request = new MarkAttendanceRequest
            {
                SessionId = sessionId,
                StudentId = studentId,
                Status = status,
            };

            var response = await _attendanceApi.MarkAttendance(request);
            if (response?.Success == true)
                await LoadRecordsForSession(SelectedSession);
            else
                MessageBox.Show($"Erreur: {response?.Error?.ToString() ?? "Inconnue"}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erreur appel: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
    }

    [RelayCommand]
    private void Cancel()
    {
        IsEditMode = false;
        SelectedSession = null;
    }

    private static string? GetProperty(object obj, string name)
    {
        return obj.GetType().GetProperty(name)?.GetValue(obj)?.ToString();
    }
}
