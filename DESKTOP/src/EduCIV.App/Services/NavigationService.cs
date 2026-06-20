using System.Collections.Generic;

namespace EduCIV.App.Services;

public class NavigationService : INavigationService
{
    private readonly Stack<object?> _backStack = new();
    private object? _currentPage;
    private object? _currentParameter;

    public event EventHandler<object?>? NavigationChanged;
    public object? CurrentPage => _currentPage;
    public bool CanGoBack => _backStack.Count > 0;

    public void NavigateTo(object? page, object? parameter = null)
    {
        if (_currentPage != null)
            _backStack.Push(_currentPage);
        _currentPage = page;
        _currentParameter = parameter;
        NavigationChanged?.Invoke(this, page);
    }

    public object? GetParameter() => _currentParameter;

    public void GoBack()
    {
        if (_backStack.Count > 0)
        {
            _currentPage = _backStack.Pop();
            _currentParameter = null;
            NavigationChanged?.Invoke(this, _currentPage);
        }
    }
}
