using System.IO;
using System.Net.Http;
using System.Windows;
using EduCIV.App.Services;
using EduCIV.App.ViewModels;
using EduCIV.App.Views;
using EduCIV.Api;
using EduCIV.Api.Services;
using EduCIV.Data;
using EduCIV.Sync;
using Microsoft.EntityFrameworkCore;
using SQLitePCL;

namespace EduCIV.App;

public partial class App : Application
{
    protected override async void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);
        try
        {
            Batteries_V2.Init();

            var updateService = new UpdateService();
            _ = updateService.CheckForUpdatesAsync();

            var dbDir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "EduCIV");
            Directory.CreateDirectory(dbDir);

            var dbPath = Path.Combine(dbDir, "educiv.db");
            var encryptionKey = CryptoKeyService.GetOrCreateEncryptionKey();
            var connectionString = $"Data Source={dbPath};Password={encryptionKey}";

            var dbInit = new DatabaseInitializer(connectionString);
            dbInit.Initialize();

            var dbOptions = new DbContextOptionsBuilder<EduCIVContext>()
                .UseSqlite(connectionString)
                .Options;

            var httpClient = new HttpClient();
            var apiClient = new ApiClient(httpClient);
            apiClient.BaseUrl = "http://localhost:3000/api";

            var authApi = new AuthApiService(apiClient);
            var schoolApi = new SchoolApiService(apiClient);
            var studentApi = new StudentApiService(apiClient);
            var teacherApi = new TeacherApiService(apiClient);
            var notesApi = new NotesApiService(apiClient);
            var attendanceApi = new AttendanceApiService(apiClient);
            var paymentsApi = new PaymentsApiService(apiClient);
            var classesApi = new ClassesApiService(apiClient);
            var subjectsApi = new SubjectsApiService(apiClient);
            var timetablesApi = new TimetablesApiService(apiClient);
            var incidentsApi = new IncidentsApiService(apiClient);
            var schoolYearsApi = new SchoolYearsApiService(apiClient);
            var periodsApi = new PeriodsApiService(apiClient);
            var progressionApi = new ProgressionApiService(apiClient);
            var invitationsApi = new InvitationsApiService(apiClient);
            var usersApi = new UsersApiService(apiClient);

            var syncEngine = new SyncEngine(apiClient, dbOptions);
            var authService = new AuthService(authApi, apiClient, syncEngine);
            var navigationService = new NavigationService();
            var connectivityService = new ConnectivityService(apiClient);
            var syncUIService = new SyncUIService(syncEngine);
            var themeManager = new ThemeManager();
            themeManager.Initialize();

            var loginViewModel = new LoginViewModel(authService);
            var dashboardViewModel = new DashboardViewModel(authService, schoolApi);
            var setupWizardViewModel = new SetupWizardViewModel(authService, schoolApi);
            var studentViewModel = new StudentViewModel(authService, studentApi);
            var teacherViewModel = new TeacherViewModel(authService, teacherApi);
            var notesViewModel = new NotesViewModel(authService, notesApi);
            var attendanceViewModel = new AttendanceViewModel(authService, attendanceApi);
            var paymentsViewModel = new PaymentsViewModel(authService, paymentsApi);
            var classViewModel = new ClassViewModel(authService, classesApi);
            var subjectViewModel = new SubjectViewModel(authService, subjectsApi);
            var timetableViewModel = new TimetableViewModel(authService, timetablesApi);
            var incidentViewModel = new IncidentViewModel(authService, incidentsApi);
            var schoolYearViewModel = new SchoolYearViewModel(authService, schoolYearsApi);
            var periodViewModel = new PeriodViewModel(authService, periodsApi);
            var progressionViewModel = new ProgressionViewModel(authService, progressionApi);
            var invitationViewModel = new InvitationViewModel(invitationsApi);
            var userViewModel = new UserViewModel(authService, usersApi);

            var mainViewModel = new MainViewModel(navigationService, authService, syncUIService,
                loginViewModel, dashboardViewModel, setupWizardViewModel,
                studentViewModel, teacherViewModel, notesViewModel,
                attendanceViewModel, paymentsViewModel,
                classViewModel, subjectViewModel, timetableViewModel,
                incidentViewModel, schoolYearViewModel, periodViewModel,
                progressionViewModel, invitationViewModel, userViewModel,
                themeManager);

            var mainWindow = new MainWindow();
            mainWindow.DataContext = mainViewModel;
            mainWindow.Show();

            var hasUpdate = await updateService.CheckForUpdatesAsync();
            if (!hasUpdate) return;
            var result = MessageBox.Show(
                $"Une mise a jour est disponible (v{updateService.UpdateVersion}).\nVoulez-vous l'installer maintenant ?",
                "Mise a jour disponible",
                MessageBoxButton.YesNo,
                MessageBoxImage.Information);
            if (result == MessageBoxResult.Yes)
            {
                await updateService.ApplyUpdateAsync();
            }
        }
        catch (Exception ex)
        {
            MessageBox.Show(
                $"Erreur au demarrage :\n{ex.GetType().Name}\n{ex.Message}\n\n{ex.StackTrace}",
                "EduCIV - Erreur",
                MessageBoxButton.OK,
                MessageBoxImage.Error);
            Shutdown();
        }
    }
}
