# 📂 DATA MODEL EDUCIV

## CORE ENTITIES

users, schools, students, classes

## TEACHER CONTROL
teacher_subjects:
- teacher_id
- subject_id
- class_id
- school_id

## ATTENDANCE
attendance_sessions:
- id
- school_id
- class_id
- subject_id
- teacher_id
- timetable_id
- date
- start_time
- end_time

attendances:
- student_id
- status (PRESENT, ABSENT, LATE)
- version
- session_id

## PAYMENTS
payments:
- amount_fcfa
- receipt_number
- receipt_hash
- status

payment_audit_log:
- append-only
- old_data/new_data JSON

## SYNC
sync_operations:
- client_operation_id

sync_conflicts:
- entity
- entity_id