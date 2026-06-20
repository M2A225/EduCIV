using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;
using EduCIV.Api.Services;
using System.Collections.ObjectModel;
using System.Windows;

namespace EduCIV.App.ViewModels;

public partial class ProgressionViewModel : ObservableObject
{
    private readonly IAuthService _auth;
    private readonly IProgressionApiService _progressionApi;

    [ObservableProperty] private ObservableCollection<object> _items = new();
    [ObservableProperty] private ObservableCollection<object> _votes = new();
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string? _selectedClassId;
    [ObservableProperty] private string? _selectedYearId;

    public ProgressionViewModel(IAuthService auth, IProgressionApiService progressionApi)
    {
        _auth = auth;
        _progressionApi = progressionApi;
    }

    [RelayCommand]
    private async Task LoadItems()
    {
        if (string.IsNullOrEmpty(SelectedClassId) || string.IsNullOrEmpty(SelectedYearId)) return;
        IsLoading = true;
        try
        {
            var students = await _progressionApi.GetStudentsByClass(SelectedClassId, SelectedYearId);
            if (students?.Success == true && students.Data is System.Collections.IEnumerable enumerable)
            {
                Items.Clear();
                foreach (var item in enumerable) Items.Add(item);
            }
            var votesResp = await _progressionApi.GetVotes(SelectedClassId, SelectedYearId);
            if (votesResp?.Success == true && votesResp.Data is System.Collections.IEnumerable voteEnum)
            {
                Votes.Clear();
                foreach (var v in voteEnum) Votes.Add(v);
            }
        }
        catch (Exception ex) { MessageBox.Show($"Erreur: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error); }
        finally { IsLoading = false; }
    }

    [RelayCommand]
    private async Task Vote(object? parameter)
    {
        if (parameter is not object[] args || args.Length < 2) return;
        var studentId = args[0]?.ToString();
        var decision = args[1]?.ToString();
        if (string.IsNullOrEmpty(studentId) || string.IsNullOrEmpty(decision)) return;
        try
        {
            var r = await _progressionApi.Vote(studentId, SelectedYearId ?? string.Empty, decision, null);
            if (r?.Success == true) await LoadItems();
        }
        catch (Exception ex) { MessageBox.Show($"Erreur: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error); }
    }

    [RelayCommand]
    private async Task Decide(object? parameter)
    {
        if (parameter is not object[] args || args.Length < 2) return;
        var studentId = args[0]?.ToString();
        var decision = args[1]?.ToString();
        if (string.IsNullOrEmpty(studentId) || string.IsNullOrEmpty(decision)) return;
        try
        {
            var r = await _progressionApi.Decide(studentId, decision, null);
            if (r?.Success == true) await LoadItems();
        }
        catch (Exception ex) { MessageBox.Show($"Erreur: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error); }
    }
}
