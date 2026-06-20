namespace EduCIV.App.Services;

public interface INavigationService
{
    event EventHandler<object?>? NavigationChanged;
    object? CurrentPage { get; }
    void NavigateTo(object? page, object? parameter = null);
    object? GetParameter();
    void GoBack();
    bool CanGoBack { get; }
}

