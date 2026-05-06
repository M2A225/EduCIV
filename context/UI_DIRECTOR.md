# 🧑‍💼 DIRECTEUR – UI WEB (v1 COMPLET)

## 🎯 Objectif
Permettre au directeur de piloter l’école :
- suivre activité globale
- contrôler enseignants (appels)
- superviser paiements
- gérer utilisateurs

Interface :
- simple
- rapide
- non technique

---

# 🧱 LAYOUT GLOBAL

## Structure
- Sidebar gauche (navigation principale)
- Header top (profil, notifications)
- Zone contenu (pages)

---

## Sidebar

- Dashboard
- Élèves
- Classes
- Emploi du temps
- Enseignants
- Paiements
- Absences ⭐
- Bulletins
- Notifications
- Paramètres

---

## Header

- 🔔 Notifications
- 👤 Profil
- 🔄 Switch école (si multi)

---

# 🏠 1. DASHBOARD

## Objectif
Vue globale en 10 secondes

---

## UI

### Stats cards

- 👨‍🎓 Élèves total
- 🏫 Classes
- 💰 Paiements aujourd’hui
- 📊 Taux présence

---

### Graphiques

- Paiements (7 jours)
- Absences (7 jours)

---

### Alertes

- ⚠️ Appels non faits
- ⚠️ Paiements en retard
- ⚠️ Bulletins non générés

---

### Actions rapides

- ➕ Ajouter élève
- 💰 Encaisser
- 📄 Générer bulletin

---

# 👨‍🎓 2. ÉLÈVES

---

## Page : Liste élèves

### UI

Table :
- Nom
- Classe
- Parent
- Statut paiement

Filtres :
- Classe
- Recherche nom

---

## Actions

- ➕ Ajouter élève
- 👁️ Voir détail
- ✏️ Modifier

---

## Page : Détail élève

### Sections

#### Infos
- Nom
- Classe
- Parent

#### Notes (lecture seule)
- moyenne
- liste notes

#### Absences
- historique

#### Paiements
- liste

---

# 🏫 3. CLASSES

---

## Liste classes

- Nom
- Effectif
- Enseignant principal

---

## Actions

- ➕ Créer classe
- 👁️ Voir

---

## Détail classe

### Sections

- Liste élèves
- Moyenne classe
- Emploi du temps

---

# 📅 4. EMPLOI DU TEMPS

---

## Vue

- planning semaine
- grille horaire

---

## Actions

- ➕ Ajouter séance
- ✏️ Modifier

---

## Règle

- chaque séance = base appel prof

---

# 👨‍🏫 5. ENSEIGNANTS

---

## Liste

- Nom
- Matière
- Classes

---

## Actions

- ➕ Ajouter
- ✏️ Modifier

---

## Détail

- classes assignées
- matière

---

# 💰 6. PAIEMENTS

---

## Liste paiements

Table :
- Élève
- Montant
- Date
- Mode

Filtres :
- date
- classe

---

## Actions

- 👁️ Voir reçu

---

## Règles

- lecture seule (directeur)
- pas modification

---

# 📅 7. ABSENCES (TRÈS IMPORTANT)

---

## Page : Suivi appels ⭐

### UI

Table :

- Classe
- Heure
- Prof
- Statut

Statut :
- ✅ fait
- ❌ non fait

---

## Action

- 👁️ Voir détail appel

---

## Page : Détail appel

- liste élèves
- statut présence

---

## Objectif

- contrôler enseignants
- détecter problèmes

---

# 📊 8. BULLETINS

---

## Page

- Liste élèves
- filtre période

---

## Actions

- 📄 Générer bulletin
- 👁️ Voir PDF

---

# 🔔 9. NOTIFICATIONS

---

## Page

- envoyer message

---

## UI

- cible :
  - classe
  - parents
- message

---

## Action

- envoyer

---

# ⚙️ 10. PARAMÈTRES

---

## Sections

### Profil
- nom
- email

### Sécurité
- mot de passe
- sessions

---

# 🔒 RÈGLES UI IMPORTANTES

---

## 1. Simplicité

- éviter écrans complexes
- pas de jargon technique

---

## 2. Contrôle enseignants

- page absences = prioritaire

---

## 3. Lecture globale

- directeur voit tout
- mais ne modifie pas tout

---

## 4. Performance

- pagination obligatoire
- max 50 lignes

---

## 5. États UI

- loading
- empty
- error

---

# ⚡ UX CRITIQUE

Le directeur doit pouvoir :

1. Voir si les profs font les appels
2. Voir les paiements
3. Générer bulletins

en < 1 minute

---

# 🚀 NOTES POUR AGENT

- utiliser tables paginées
- modals pour actions rapides
- éviter navigation profonde
- privilégier dashboard + drill-down