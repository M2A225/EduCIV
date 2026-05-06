# 🔴 CORE RULES – EDUCIV v35

## MULTI-TENANT ABSOLU
- Toute table contient `school_id`
- Toute requête est filtrée par `school_id`
- `school_id` vient UNIQUEMENT du JWT
- Jamais depuis le client

## BASE REPOSITORY OBLIGATOIRE
Toute entité multi-tenant doit utiliser BaseRepository
avec injection automatique du filtre school_id.

## SÉCURITÉ AUTH
- JWT access token : 15 min
- Refresh token : 7 jours (opaque)
- max 5 sessions par user
- blocage login par email (5 essais → 15 min)

## AUDIT & LOGS
- payment_audit_log est append-only
- jamais de suppression physique sur données critiques

## SYNC OFFLINE
- client_operation_id obligatoire
- idempotence serveur
- conflits → serveur prioritaire
- suppression serveur override client

## RÔLES
- Teacher limité à ses classes/matières (teacher_subjects obligatoire)

## INTERDICTIONS
- logique métier dans controllers
- accès DB sans repository
- BullMQ pour paiements ou logique critique
- confiance dans horloge client