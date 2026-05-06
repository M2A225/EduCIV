# 🌐 API EDUCIV

## AUTH
POST /auth/login
POST /auth/refresh
POST /auth/logout

## PAYMENTS
POST /payments
GET /payments
POST /payments/:id/void

## NOTES
POST /notes
PATCH /notes/:id

## ATTENDANCE
POST /attendance/session
POST /attendance
GET /attendance/session/:id

## SYNC
POST /sync/push
GET /sync/pull

## RULE
- pagination obligatoire
- format standard:
{ success, data, error }