# 🧱 ARCHITECTURE EDUCIV v35

## STACK
- NestJS backend
- PostgreSQL (Supabase)
- Redis (Upstash)
- BullMQ (jobs non critiques)
- Cloudflare R2 (storage)

## STRUCTURE
- 1 module = 1 domaine métier
- séparation stricte des responsabilités

## MODULES
- auth
- users
- schools
- students
- payments
- notes
- attendance
- timetables
- sync

## PRINCIPES
- stateless API
- multi-tenant strict
- offline-first mobile support
- performance < 5s API max

## FAILSAFE
- DB down → 503
- Redis down → fallback DB
- sync retry exponential