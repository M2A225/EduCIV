import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/app_theme.dart';
import 'data/repositories/auth_provider.dart';
import 'data/models/user.dart';
import 'presentation/auth/login_screen.dart';
import 'presentation/director/director_home.dart';
import 'presentation/teacher/teacher_home.dart';
import 'presentation/parent/parent_home.dart';
import 'presentation/student/student_home.dart';
import 'presentation/accountant/accountant_home.dart';
import 'presentation/cashier/cashier_home.dart';
import 'presentation/educator/educator_home.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: EduCIVApp()));
}

class EduCIVApp extends ConsumerWidget {
  const EduCIVApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return MaterialApp(
      title: 'EduCIV',
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      home: authState == AuthState.initial
          ? const Scaffold(body: Center(child: CircularProgressIndicator()))
          : authState == AuthState.authenticated
              ? const RoleRouter()
              : const LoginScreen(),
    );
  }
}

class RoleRouter extends ConsumerWidget {
  const RoleRouter({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);

    if (user == null) return const LoginScreen();

    switch (user.role) {
      case UserRole.director:
        return const DirectorHome();
      case UserRole.teacher:
        return const TeacherHome();
      case UserRole.parent:
        return const ParentHome();
      case UserRole.student:
        return const StudentHome();
      case UserRole.accountant:
        return const AccountantHome();
      case UserRole.cashier:
        return const CashierHome();
      case UserRole.educator:
        return const EducatorHome();
      default:
        return const LoginScreen();
    }
  }
}
