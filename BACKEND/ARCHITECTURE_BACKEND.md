# Architecture Backend EduCIV v35 (implémentation)

Résumé de l'architecture implémentée dans `/BACKEND` — version de travail destinée à respecter les documents `context/`.

Principes clés
- Multi-tenant strict : chaque entité doit contenir `school_id` et toutes les requêtes serveur sont filtrées par `school_id` provenant uniquement du JWT.
- 1 module = 1 domaine métier (auth, users, schools, students, payments, notes, attendance, timetables, sync).
- Respect du format API : réponses standardisées `{ success, data, error }`.
- Validation DTO obligatoire via `class-validator` et `ValidationPipe` global.

Stack technique (scaffold)
- NestJS (module par domaine)
- JWT pour access tokens (15 min) et refresh tokens (7d) — mechanismes en place (à remplacer par stockage persistant pour refresh opaque en prod).
- Persistence : actuellement en mémoire pour scaffolding (`BaseRepository` / classes in-memory). Migration recommandée vers PostgreSQL (TypeORM/Prisma) avec `school_id` au niveau DB.
- Jobs/Queue : BullMQ prévu (non actif dans scaffold)
- Cache : Redis prévu (non actif dans scaffold)

Composants réalisés
- `core/base.repository.ts`: repository de base enforcing `school_id` et opérations in-memory.
- `common/dto/pagination.dto.ts`: pagination standard.
- `common/interceptors/response.interceptor.ts`: assure le format de réponse `{ success, data, error }`.
- Modules implémentés (controllers, services, DTOs): `auth`, `users`, `schools`, `students`, `payments`, `notes`, `attendance`, `timetables`, `sync`.

Sécurité et règles
- `school_id` injecté et validé via DTOs et payload JWT (auth service signe les tokens avec `school_id`).
- Aucun logique métier dans controllers — services centralisent la logique (respect partiel : scaffold minimal en mémoire).
- Transactions : opérations critiques (paiements) simulent des transactions et audit append-only.

Tests et qualité
- Tests unitaires basiques présents pour certains controllers/services (scaffold). Exécution des tests recommandée localement et CI.

Prochaines migrations / améliorations nécessaires (prioritaires)
1. Remplacer stockage en mémoire par PostgreSQL (Prisma ou TypeORM), créer migrations et constraints multi-tenant.
2. Hasher mots de passe (bcrypt) et stocker refresh tokens opaques en DB (max 5 sessions/user).
3. Mettre en place Redis + BullMQ pour jobs et cache.
4. Ajouter tests e2e et CI, vérifier performance et résilience offline-first.

Fichier de référence : les documents originaux `context/*.md` (API_SPEC.md, CORE_RULES.md, etc.) ont été suivis pour ce scaffold initial.
