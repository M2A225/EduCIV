using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace EduCIV.App.Converters;

public class InverseBoolToWidthConverter : IValueConverter
{
    public double CollapsedWidth { get; set; } = 64;
    public double ExpandedWidth { get; set; } = 280;

    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        return value is true ? CollapsedWidth : ExpandedWidth;
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}

public class InverseBooleanToVisibilityConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        return value is true ? Visibility.Collapsed : Visibility.Visible;
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
    {
        return value is Visibility.Visible;
    }
}
