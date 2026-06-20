using System.Windows;
using System.Windows.Controls;
using EduCIV.App.ViewModels;

namespace EduCIV.App.Views;

public partial class LoginPage : UserControl
{
    private bool _isPasswordVisible;

    public LoginPage()
    {
        InitializeComponent();
    }

    private void LoginButton_Click(object sender, RoutedEventArgs e)
    {
        if (DataContext is LoginViewModel vm)
        {
            vm.Password = _isPasswordVisible ? PasswordVisibleBox.Text : PasswordBox.Password;
            vm.LoginCommand.Execute(null);
        }
    }

    private void TogglePassword_Click(object sender, RoutedEventArgs e)
    {
        _isPasswordVisible = !_isPasswordVisible;
        if (_isPasswordVisible)
        {
            PasswordVisibleBox.Text = PasswordBox.Password;
            PasswordBox.Visibility = Visibility.Collapsed;
            PasswordVisibleBox.Visibility = Visibility.Visible;
            TogglePasswordBtn.Content = "Masquer";
        }
        else
        {
            PasswordBox.Password = PasswordVisibleBox.Text;
            PasswordVisibleBox.Visibility = Visibility.Collapsed;
            PasswordBox.Visibility = Visibility.Visible;
            TogglePasswordBtn.Content = "Afficher";
        }
    }
}
