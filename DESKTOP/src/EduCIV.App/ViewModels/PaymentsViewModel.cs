using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;
using EduCIV.Api.Models;
using EduCIV.Api.Services;

using System.Collections.ObjectModel;
using System.Windows;

namespace EduCIV.App.ViewModels;

public partial class PaymentsViewModel : ObservableObject
{
    private readonly IAuthService _auth;
    private readonly IPaymentsApiService _paymentsApi;

    [ObservableProperty] private ObservableCollection<object> _payments = new();
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private string? _searchQuery;
    [ObservableProperty] private string? _filterStudentId;
    [ObservableProperty] private string? _filterStatus;
    [ObservableProperty] private object? _selectedPayment;
    [ObservableProperty] private bool _isEditMode;

    public PaymentsViewModel(IAuthService auth, IPaymentsApiService paymentsApi)
    {
        _auth = auth;
        _paymentsApi = paymentsApi;
    }

    [RelayCommand]
    private async Task LoadPayments()
    {
        IsLoading = true;
        try
        {
            var schoolId = _auth.CurrentSchoolId ?? string.Empty;
            var response = await _paymentsApi.GetAll(schoolId, 1, 100, FilterStudentId, FilterStatus);
            if (response?.Success == true && response.Data?.Items != null)
            {
                Payments.Clear();
                foreach (var p in response.Data.Items)
                    Payments.Add(p);
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show($"Erreur chargement paiements: {ex.Message}", "Erreur", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void AddPayment()
    {
        SelectedPayment = null;
        IsEditMode = true;
    }

    [RelayCommand]
    private void EditPayment(object? payment)
    {
        SelectedPayment = payment;
        IsEditMode = true;
    }

    [RelayCommand]
    private async Task SavePayment()
    {
        if (SelectedPayment == null) return;

        IsLoading = true;
        try
        {
            var request = new CreatePaymentRequest
            {
                SchoolId = _auth.CurrentSchoolId ?? string.Empty,
                StudentId = GetProperty(SelectedPayment, "StudentId") ?? string.Empty,
                Amount = Convert.ToDecimal(GetProperty(SelectedPayment, "Amount") ?? "0"),
                Type = GetProperty(SelectedPayment, "Type") ?? "SCOLARITE",
                DueDate = DateTime.TryParse(GetProperty(SelectedPayment, "DueDate"), out var d) ? d : null,
            };

            ApiResponse<object>? response;
            if (IsEditMode && GetProperty(SelectedPayment, "Id") is string id && !string.IsNullOrEmpty(id))
                response = await _paymentsApi.Update(id, request);
            else
                response = await _paymentsApi.Create(request);

            if (response?.Success == true)
            {
                IsEditMode = false;
                await LoadPayments();
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
    private async Task DeletePayment(object? payment)
    {
        if (payment == null) return;
        var id = GetProperty(payment, "Id") as string;
        if (string.IsNullOrEmpty(id)) return;

        if (MessageBox.Show("Supprimer ce paiement ?", "Confirmation", MessageBoxButton.YesNo, MessageBoxImage.Question) != MessageBoxResult.Yes)
            return;

        IsLoading = true;
        try
        {
            var response = await _paymentsApi.Delete(id);
            if (response?.Success == true)
                await LoadPayments();
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
        SelectedPayment = null;
    }

    private static string? GetProperty(object obj, string name)
    {
        return obj.GetType().GetProperty(name)?.GetValue(obj)?.ToString();
    }
}
