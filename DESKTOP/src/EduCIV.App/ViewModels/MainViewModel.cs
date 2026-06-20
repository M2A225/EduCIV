using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using EduCIV.App.Services;

namespace EduCIV.App.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly INavigationService _navigation;
    private readonly IAuthService _auth;
    private readonly ISyncUIService _syncUI;
    private readonly ThemeManager _themeManager;
    private readonly LoginViewModel _loginViewModel;
    private readonly DashboardViewModel _dashboardViewModel;
    private readonly SetupWizardViewModel _setupWizardViewModel;
    private readonly StudentViewModel _studentViewModel;
    private readonly TeacherViewModel _teacherViewModel;
    private readonly NotesViewModel _notesViewModel;
    private readonly AttendanceViewModel _attendanceViewModel;
    private readonly PaymentsViewModel _paymentsViewModel;
    private readonly ClassViewModel _classViewModel;
    private readonly SubjectViewModel _subjectViewModel;
    private readonly TimetableViewModel _timetableViewModel;
    private readonly IncidentViewModel _incidentViewModel;
    private readonly SchoolYearViewModel _schoolYearViewModel;
    private readonly PeriodViewModel _periodViewModel;
    private readonly ProgressionViewModel _progressionViewModel;
    private readonly InvitationViewModel _invitationViewModel;
    private readonly UserViewModel _userViewModel;

    [ObservableProperty] private object? _currentPage;
    [ObservableProperty] private bool _isLoggedIn;
    [ObservableProperty] private string? _currentUserName;
    [ObservableProperty] private string? _currentUserRole;
    [ObservableProperty] private string? _currentUserInitials;
    [ObservableProperty] private string? _syncStatusText = "Offline";
    [ObservableProperty] private int _pendingOperations;
    [ObservableProperty] private string _currentPageTitle = "Tableau de bord";
    [ObservableProperty] private bool _isSidebarCollapsed;
    [ObservableProperty] private bool _isDarkMode;
    [ObservableProperty] private bool _isNavStudentsVisible;
    [ObservableProperty] private bool _isNavTeachersVisible;
    [ObservableProperty] private bool _isNavClassesVisible;
    [ObservableProperty] private bool _isNavSubjectsVisible;
    [ObservableProperty] private bool _isNavNotesVisible;
    [ObservableProperty] private bool _isNavAttendanceVisible;
    [ObservableProperty] private bool _isNavTimetablesVisible;
    [ObservableProperty] private bool _isNavPaymentsVisible;
    [ObservableProperty] private bool _isNavIncidentsVisible;
    [ObservableProperty] private bool _isNavSchoolYearsVisible;
    [ObservableProperty] private bool _isNavPeriodsVisible;
    [ObservableProperty] private bool _isNavProgressionVisible;
    [ObservableProperty] private bool _isNavInvitationsVisible;
    [ObservableProperty] private bool _isNavUsersVisible;

    public MainViewModel(INavigationService navigation, IAuthService auth, ISyncUIService syncUI,
        LoginViewModel loginViewModel, DashboardViewModel dashboardViewModel, SetupWizardViewModel setupWizardViewModel,
        StudentViewModel studentViewModel, TeacherViewModel teacherViewModel, NotesViewModel notesViewModel,
        AttendanceViewModel attendanceViewModel, PaymentsViewModel paymentsViewModel,
        ClassViewModel classViewModel, SubjectViewModel subjectViewModel, TimetableViewModel timetableViewModel,
        IncidentViewModel incidentViewModel, SchoolYearViewModel schoolYearViewModel, PeriodViewModel periodViewModel,
        ProgressionViewModel progressionViewModel, InvitationViewModel invitationViewModel, UserViewModel userViewModel,
        ThemeManager themeManager)
    {
        _navigation = navigation;
        _auth = auth;
        _syncUI = syncUI;
        _themeManager = themeManager;
        _loginViewModel = loginViewModel;
        _dashboardViewModel = dashboardViewModel;
        _setupWizardViewModel = setupWizardViewModel;
        _studentViewModel = studentViewModel;
        _teacherViewModel = teacherViewModel;
        _notesViewModel = notesViewModel;
        _attendanceViewModel = attendanceViewModel;
        _paymentsViewModel = paymentsViewModel;
        _classViewModel = classViewModel;
        _subjectViewModel = subjectViewModel;
        _timetableViewModel = timetableViewModel;
        _incidentViewModel = incidentViewModel;
        _schoolYearViewModel = schoolYearViewModel;
        _periodViewModel = periodViewModel;
        _progressionViewModel = progressionViewModel;
        _invitationViewModel = invitationViewModel;
        _userViewModel = userViewModel;

        IsDarkMode = _themeManager.IsDarkMode;
        _loginViewModel.LoginSucceeded += OnLoginSucceeded;
        _navigation.NavigationChanged += (_, page) => CurrentPage = page;
        _auth.AuthStateChanged += (_, _) => UpdateAuthState();
        _syncUI.StatusChanged += (_, status) =>
        {
            SyncStatusText = status.ConnectionStatus.ToString();
            PendingOperations = status.PendingOperations;
        };

        _navigation.NavigateTo(_loginViewModel);
    }

    private void OnLoginSucceeded(object? sender, EventArgs e)
    {
        UpdateNavigationVisibility();
        _navigation.NavigateTo(_dashboardViewModel);
    }

    private void UpdateAuthState()
    {
        IsLoggedIn = _auth.IsLoggedIn;
        if (_auth.CurrentUser != null)
        {
            CurrentUserName = _auth.CurrentUser.Name;
            CurrentUserRole = _auth.CurrentUser.Role;
            var name = _auth.CurrentUser.Name ?? "";
            var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            CurrentUserInitials = parts.Length >= 2
                ? $"{parts[0][0]}{parts[1][0]}".ToUpper()
                : name.Length >= 2 ? name[..2].ToUpper() : name.ToUpper();
            UpdateNavigationVisibility();
        }
    }

    private void UpdateNavigationVisibility()
    {
        var role = _auth.CurrentUser?.Role?.ToUpper() ?? "";
        var roles = _auth.CurrentUser?.Roles?.Select(r => r.ToUpper()).ToList() ?? new();
        bool HasRole(string r) => role == r || roles.Contains(r);

        IsNavStudentsVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE") || HasRole("TEACHER") || HasRole("EDUCATOR") || HasRole("CASHIER") || HasRole("ACCOUNTANT");
        IsNavTeachersVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE");
        IsNavClassesVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE") || HasRole("TEACHER");
        IsNavSubjectsVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE") || HasRole("TEACHER");
        IsNavNotesVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE") || HasRole("TEACHER");
        IsNavAttendanceVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE") || HasRole("TEACHER") || HasRole("EDUCATOR");
        IsNavTimetablesVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE") || HasRole("TEACHER");
        IsNavPaymentsVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE") || HasRole("ACCOUNTANT") || HasRole("CASHIER");
        IsNavIncidentsVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE") || HasRole("TEACHER") || HasRole("EDUCATOR");
        IsNavSchoolYearsVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE");
        IsNavPeriodsVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE");
        IsNavProgressionVisible = HasRole("DIRECTOR") || HasRole("TEACHER");
        IsNavInvitationsVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE");
        IsNavUsersVisible = HasRole("DIRECTOR") || HasRole("BACKOFFICE");
    }

    [RelayCommand]
    private void ToggleSidebar() => IsSidebarCollapsed = !IsSidebarCollapsed;

    [RelayCommand]
    private void ToggleTheme()
    {
        _themeManager.ToggleTheme();
        IsDarkMode = _themeManager.IsDarkMode;
    }

    [RelayCommand]
    private async Task Logout()
    {
        await _auth.LogoutAsync();
        IsLoggedIn = false;
        CurrentUserName = null;
        CurrentUserRole = null;
        CurrentUserInitials = null;
        _navigation.NavigateTo(_loginViewModel);
    }

    [RelayCommand]
    private void NavigateToDashboard() { CurrentPageTitle = "Tableau de bord"; _navigation.NavigateTo(_dashboardViewModel); }

    [RelayCommand]
    private void NavigateToStudents() { CurrentPageTitle = "Eleves"; _navigation.NavigateTo(_studentViewModel); }

    [RelayCommand]
    private void NavigateToTeachers() { CurrentPageTitle = "Enseignants"; _navigation.NavigateTo(_teacherViewModel); }

    [RelayCommand]
    private void NavigateToNotes() { CurrentPageTitle = "Notes"; _navigation.NavigateTo(_notesViewModel); }

    [RelayCommand]
    private void NavigateToAttendance() { CurrentPageTitle = "Presences"; _navigation.NavigateTo(_attendanceViewModel); }

    [RelayCommand]
    private void NavigateToPayments() { CurrentPageTitle = "Paiements"; _navigation.NavigateTo(_paymentsViewModel); }

    [RelayCommand]
    private void NavigateToClasses() { CurrentPageTitle = "Classes"; _navigation.NavigateTo(_classViewModel); }

    [RelayCommand]
    private void NavigateToSubjects() { CurrentPageTitle = "Matieres"; _navigation.NavigateTo(_subjectViewModel); }

    [RelayCommand]
    private void NavigateToTimetables() { CurrentPageTitle = "Emplois du temps"; _navigation.NavigateTo(_timetableViewModel); }

    [RelayCommand]
    private void NavigateToIncidents() { CurrentPageTitle = "Incidents"; _navigation.NavigateTo(_incidentViewModel); }

    [RelayCommand]
    private void NavigateToSchoolYears() { CurrentPageTitle = "Annees scolaires"; _navigation.NavigateTo(_schoolYearViewModel); }

    [RelayCommand]
    private void NavigateToPeriods() { CurrentPageTitle = "Periodes"; _navigation.NavigateTo(_periodViewModel); }

    [RelayCommand]
    private void NavigateToProgression() { CurrentPageTitle = "Progression"; _navigation.NavigateTo(_progressionViewModel); }

    [RelayCommand]
    private void NavigateToInvitations() { CurrentPageTitle = "Invitations"; _navigation.NavigateTo(_invitationViewModel); }

    [RelayCommand]
    private void NavigateToUsers() { CurrentPageTitle = "Utilisateurs"; _navigation.NavigateTo(_userViewModel); }
}
