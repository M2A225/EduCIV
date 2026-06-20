using System.Windows.Controls;
using EduCIV.App.ViewModels;

namespace EduCIV.App.Views;

public partial class DashboardPage : UserControl
{
    public DashboardPage()
    {
        InitializeComponent();
        if (DataContext is DashboardViewModel vm)
        {
            vm.LoadCommand.Execute(null);
        }
    }
}
