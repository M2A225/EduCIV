# 🤖 GEMINI PLAYBOOK

## PROCESS
1. Lire tous les .md dans le dossier context 
2. Construire architecture mentale
3. Générer module par module
4. Valider chaque module avant suivant

## MODULE ORDER
auth → users → schools → students → payments → notes → attendance → timetables → sync

## RULES
- pas de simplification
- pas de logique dans controllers
- pas de contournement BaseRepository
- respecter multi-tenant strict

## THINKING MODEL
- réseau instable
- erreurs humaines fréquentes
- concurrence de requêtes possible
- système école réel Afrique

# 🎨 EduCIV – UI Web

Spécification complète des interfaces utilisateur (web) par rôle.

## 🎯 Objectif
Permettre à un agent de code de générer un frontend complet (Next.js / React).

## 🧠 Philosophie UI
- Simple
- Rapide
- Mobile-friendly
- Tolérant aux erreurs
- Adapté aux connexions faibles

## 📚 Organisation
Chaque fichier correspond à un rôle métier :

- UI_DIRECTOR.md
- UI_TEACHER.md
- UI_ACCOUNTANT.md
- UI_CASHIER.md
- UI_EDUCATOR.md
- UI_PARENT.md
- UI_STUDENT.md
- UI_BACKOFFICE.md

Lire d’abord `UI_GLOBAL.md`.