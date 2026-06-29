import 'package:flutter/material.dart';

class EducatorHome extends StatelessWidget {
  const EducatorHome({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Éducateur'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {},
          ),
        ],
      ),
      body: const Center(
        child: Text('Educator Dashboard - Coming Soon'),
      ),
      bottomNavigationBar: NavigationBar(
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Accueil',
          ),
          NavigationDestination(
            icon: Icon(Icons.people_outlined),
            selectedIcon: Icon(Icons.people),
            label: 'Élèves',
          ),
          NavigationDestination(
            icon: Icon(Icons.warning_outlined),
            selectedIcon: Icon(Icons.warning),
            label: 'Incidents',
          ),
        ],
        onDestinationSelected: (index) {},
      ),
    );
  }
}
