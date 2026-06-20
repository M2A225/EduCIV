-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('PARENT', 'TEACHER', 'DIRECTOR', 'BACKOFFICE', 'ACCOUNTANT', 'CASHIER', 'EDUCATOR', 'STUDENT');

-- CreateEnum
CREATE TYPE "user_school_scope" AS ENUM ('SCHOOL', 'GROUP', 'PRIMARY');

-- CreateEnum
CREATE TYPE "grade_status" AS ENUM ('EN_ATTENTE', 'VALIDE', 'REJETE');

-- CreateEnum
CREATE TYPE "grade_type" AS ENUM ('INTERROGATION', 'DEVOIR', 'EXAMEN');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('VALIDE', 'ANNULE');

-- CreateEnum
CREATE TYPE "payment_type" AS ENUM ('SCOLARITE', 'CANTINE', 'INSCRIPTION', 'TRANSPORT', 'AUTRE');

-- CreateEnum
CREATE TYPE "incident_status" AS ENUM ('EN_COURS', 'RESOLU', 'IGNORE');

-- CreateEnum
CREATE TYPE "incident_type" AS ENUM ('RETARD', 'ABSENCE_NON_JUSTIFIEE', 'COMPORTEMENT', 'AUTRE');

-- CreateEnum
CREATE TYPE "attendance_status" AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- CreateEnum
CREATE TYPE "sexe" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "decision_vote" AS ENUM ('ADMIS', 'REDOUBLE', 'ABSTENTION');

-- CreateEnum
CREATE TYPE "decision_finale" AS ENUM ('ADMIS', 'REDOUBLE', 'TRANSFERE', 'EXCLU', 'ABANDON');

-- CreateEnum
CREATE TYPE "target_type" AS ENUM ('PARENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "period_type" AS ENUM ('TRIMESTRE_1', 'TRIMESTRE_2', 'TRIMESTRE_3', 'SEMESTRE_1', 'SEMESTRE_2', 'COMPOSITION_1', 'COMPOSITION_2', 'COMPOSITION_3', 'COMPOSITION_4', 'PASSAGE', 'EXAMEN_BLANC');

-- CreateEnum
CREATE TYPE "school_type" AS ENUM ('PRIMAIRE', 'SECONDAIRE', 'LYCEE_TECHNIQUE', 'LYCEE_PROFESSIONNEL', 'GROUPE_SCOLAIRE');

-- CreateEnum
CREATE TYPE "sync_entity" AS ENUM ('STUDENT', 'GRADE', 'PAYMENT', 'ATTENDANCE', 'INCIDENT', 'TEACHER', 'CLASS', 'SUBJECT', 'TIMETABLE');

-- CreateTable
CREATE TABLE "cities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city_id" INTEGER NOT NULL,

    CONSTRAINT "communes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT,
    "city" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "type" TEXT,
    "school_type" "school_type",
    "school_group_id" INTEGER,
    "school_id" INTEGER NOT NULL,
    "director_setup_at" TIMESTAMP(3),
    "accountant_setup_at" TIMESTAMP(3),
    "setup_completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "avatar_url" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'PARENT',
    "school_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_schools" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "scope" "user_school_scope" NOT NULL DEFAULT 'SCHOOL',
    "role" "user_role" NOT NULL,

    CONSTRAINT "user_schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT,
    "section" TEXT,
    "capacity" INTEGER,
    "classroom" TEXT,
    "grade_total_max" DOUBLE PRECISION,
    "grade_avg_scale" DOUBLE PRECISION,
    "school_id" INTEGER NOT NULL,
    "next_class_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "matricule" TEXT,
    "dob" TIMESTAMP(3),
    "place_birth" TEXT,
    "sexe" "sexe",
    "nationality" TEXT,
    "is_repeater" BOOLEAN NOT NULL DEFAULT false,
    "regime" TEXT,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "is_affected" BOOLEAN NOT NULL DEFAULT true,
    "avatar_url" TEXT,
    "parent_name" TEXT,
    "parent_phone" TEXT,
    "user_id" INTEGER,
    "class_id" INTEGER,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "grade" TEXT,
    "specialty" TEXT,
    "hire_date" TIMESTAMP(3),
    "address" TEXT,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "coefficient" INTEGER NOT NULL,
    "max_score" DOUBLE PRECISION,
    "level_group" TEXT NOT NULL DEFAULT '',
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_subjects" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_years" (
    "id" SERIAL NOT NULL,
    "year_range" TEXT NOT NULL,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "closed_at" TIMESTAMP(3),
    "closed_by" INTEGER,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "school_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_periods" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "period_type" "period_type",
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "school_year_id" INTEGER,
    "school_id" INTEGER NOT NULL,

    CONSTRAINT "academic_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grades" (
    "id" SERIAL NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "type" "grade_type" NOT NULL,
    "comment" TEXT,
    "max_score" DOUBLE PRECISION,
    "status" "grade_status" NOT NULL DEFAULT 'EN_ATTENTE',
    "validated_by" INTEGER,
    "validated_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "period_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_cards" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "period_id" INTEGER NOT NULL,
    "year" TEXT NOT NULL,
    "average" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "total_points" DOUBLE PRECISION NOT NULL,
    "total_coef" DOUBLE PRECISION NOT NULL,
    "appreciation" TEXT,
    "decision" TEXT,
    "is_annual" BOOLEAN NOT NULL DEFAULT false,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_tuitions" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "level_tuitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "amount_fcfa" INTEGER NOT NULL,
    "payment_type" "payment_type" NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "receipt_hash" TEXT,
    "status" "payment_status" NOT NULL DEFAULT 'VALIDE',
    "student_id" INTEGER NOT NULL,
    "plan_id" INTEGER,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_audit_logs" (
    "id" SERIAL NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "data" JSONB,
    "old_data" JSONB,
    "new_data" JSONB,
    "performed_by" INTEGER,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetables" (
    "id" SERIAL NOT NULL,
    "class_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "slot" TEXT NOT NULL,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timetables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_sessions" (
    "id" SERIAL NOT NULL,
    "class_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "timetable_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" SERIAL NOT NULL,
    "session_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "status" "attendance_status" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incidents" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "teacher_id" INTEGER,
    "type" "incident_type" NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "incident_status" NOT NULL DEFAULT 'EN_COURS',
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_operations" (
    "id" SERIAL NOT NULL,
    "client_operation_id" TEXT NOT NULL,
    "entity" "sync_entity" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_parents" (
    "student_id" INTEGER NOT NULL,
    "parent_user_id" INTEGER NOT NULL,
    "relation" TEXT,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_parents_pkey" PRIMARY KEY ("student_id","parent_user_id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "school_id" INTEGER,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "token" TEXT,
    "target_type" "target_type" NOT NULL,
    "target_ids" TEXT NOT NULL,
    "school_id" INTEGER NOT NULL,
    "max_uses" INTEGER NOT NULL DEFAULT 2,
    "current_uses" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "created_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_filieres" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "filiere" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_filieres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "school_levels" (
    "id" SERIAL NOT NULL,
    "school_id" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "school_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_progression_options" (
    "id" SERIAL NOT NULL,
    "from_class_level" TEXT NOT NULL,
    "from_section" TEXT,
    "to_class_level" TEXT NOT NULL,
    "to_section" TEXT,

    CONSTRAINT "class_progression_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_progression_votes" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "school_year_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "decision" "decision_vote" NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_progression_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_progressions" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "school_year_id" INTEGER NOT NULL,
    "class_id" INTEGER,
    "average" DOUBLE PRECISION,
    "rank" INTEGER,
    "final_decision" "decision_finale" NOT NULL,
    "next_class_id" INTEGER,
    "decided_by" INTEGER,
    "comment" TEXT,
    "applied_at" TIMESTAMP(3),
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "school_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_progressions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cities_name_key" ON "cities"("name");

-- CreateIndex
CREATE INDEX "communes_city_id_idx" ON "communes"("city_id");

-- CreateIndex
CREATE UNIQUE INDEX "communes_name_city_id_key" ON "communes"("name", "city_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_groups_name_key" ON "school_groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "schools_school_id_key" ON "schools"("school_id");

-- CreateIndex
CREATE INDEX "schools_school_group_id_idx" ON "schools"("school_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_school_id_idx" ON "users"("school_id");

-- CreateIndex
CREATE INDEX "user_schools_school_id_idx" ON "user_schools"("school_id");

-- CreateIndex
CREATE INDEX "user_schools_user_id_idx" ON "user_schools"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_schools_user_id_school_id_role_key" ON "user_schools"("user_id", "school_id", "role");

-- CreateIndex
CREATE INDEX "classes_school_id_idx" ON "classes"("school_id");

-- CreateIndex
CREATE INDEX "classes_next_class_id_idx" ON "classes"("next_class_id");

-- CreateIndex
CREATE INDEX "classes_level_idx" ON "classes"("level");

-- CreateIndex
CREATE INDEX "classes_section_idx" ON "classes"("section");

-- CreateIndex
CREATE UNIQUE INDEX "classes_school_id_name_key" ON "classes"("school_id", "name");

-- CreateIndex
CREATE INDEX "students_user_id_idx" ON "students"("user_id");

-- CreateIndex
CREATE INDEX "students_school_id_idx" ON "students"("school_id");

-- CreateIndex
CREATE INDEX "students_class_id_idx" ON "students"("class_id");

-- CreateIndex
CREATE INDEX "students_school_id_name_idx" ON "students"("school_id", "name");

-- CreateIndex
CREATE INDEX "students_class_id_is_affected_idx" ON "students"("class_id", "is_affected");

-- CreateIndex
CREATE UNIQUE INDEX "students_school_id_matricule_key" ON "students"("school_id", "matricule");

-- CreateIndex
CREATE INDEX "teachers_school_id_idx" ON "teachers"("school_id");

-- CreateIndex
CREATE INDEX "teachers_school_id_name_idx" ON "teachers"("school_id", "name");

-- CreateIndex
CREATE INDEX "subjects_school_id_idx" ON "subjects"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_school_id_name_level_group_key" ON "subjects"("school_id", "name", "level_group");

-- CreateIndex
CREATE INDEX "teacher_subjects_teacher_id_class_id_subject_id_school_id_idx" ON "teacher_subjects"("teacher_id", "class_id", "subject_id", "school_id");

-- CreateIndex
CREATE INDEX "teacher_subjects_school_id_idx" ON "teacher_subjects"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_subjects_teacher_id_class_id_subject_id_key" ON "teacher_subjects"("teacher_id", "class_id", "subject_id");

-- CreateIndex
CREATE INDEX "school_years_school_id_idx" ON "school_years"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_years_school_id_year_range_key" ON "school_years"("school_id", "year_range");

-- CreateIndex
CREATE INDEX "academic_periods_school_id_idx" ON "academic_periods"("school_id");

-- CreateIndex
CREATE INDEX "academic_periods_school_year_id_idx" ON "academic_periods"("school_year_id");

-- CreateIndex
CREATE UNIQUE INDEX "academic_periods_school_year_id_period_type_key" ON "academic_periods"("school_year_id", "period_type");

-- CreateIndex
CREATE INDEX "grades_student_id_idx" ON "grades"("student_id");

-- CreateIndex
CREATE INDEX "grades_subject_id_idx" ON "grades"("subject_id");

-- CreateIndex
CREATE INDEX "grades_period_id_idx" ON "grades"("period_id");

-- CreateIndex
CREATE INDEX "grades_student_id_period_id_idx" ON "grades"("student_id", "period_id");

-- CreateIndex
CREATE INDEX "grades_school_id_student_id_period_id_idx" ON "grades"("school_id", "student_id", "period_id");

-- CreateIndex
CREATE INDEX "grades_status_idx" ON "grades"("status");

-- CreateIndex
CREATE INDEX "grades_school_id_idx" ON "grades"("school_id");

-- CreateIndex
CREATE INDEX "grades_school_id_status_idx" ON "grades"("school_id", "status");

-- CreateIndex
CREATE INDEX "grades_student_id_subject_id_idx" ON "grades"("student_id", "subject_id");

-- CreateIndex
CREATE UNIQUE INDEX "grades_student_id_subject_id_period_id_key" ON "grades"("student_id", "subject_id", "period_id");

-- CreateIndex
CREATE INDEX "report_cards_student_id_idx" ON "report_cards"("student_id");

-- CreateIndex
CREATE INDEX "report_cards_period_id_idx" ON "report_cards"("period_id");

-- CreateIndex
CREATE INDEX "report_cards_school_id_idx" ON "report_cards"("school_id");

-- CreateIndex
CREATE INDEX "report_cards_student_id_period_id_year_idx" ON "report_cards"("student_id", "period_id", "year");

-- CreateIndex
CREATE UNIQUE INDEX "report_cards_student_id_period_id_year_key" ON "report_cards"("student_id", "period_id", "year");

-- CreateIndex
CREATE INDEX "payment_plans_school_id_idx" ON "payment_plans"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_plans_school_id_name_key" ON "payment_plans"("school_id", "name");

-- CreateIndex
CREATE INDEX "level_tuitions_school_id_idx" ON "level_tuitions"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "level_tuitions_school_id_level_key" ON "level_tuitions"("school_id", "level");

-- CreateIndex
CREATE UNIQUE INDEX "payments_receipt_number_key" ON "payments"("receipt_number");

-- CreateIndex
CREATE INDEX "payments_student_id_idx" ON "payments"("student_id");

-- CreateIndex
CREATE INDEX "payments_school_id_idx" ON "payments"("school_id");

-- CreateIndex
CREATE INDEX "payments_plan_id_idx" ON "payments"("plan_id");

-- CreateIndex
CREATE INDEX "payments_payment_date_idx" ON "payments"("payment_date");

-- CreateIndex
CREATE INDEX "payments_student_id_payment_date_idx" ON "payments"("student_id", "payment_date");

-- CreateIndex
CREATE INDEX "payments_school_id_payment_type_idx" ON "payments"("school_id", "payment_type");

-- CreateIndex
CREATE INDEX "payments_school_id_status_idx" ON "payments"("school_id", "status");

-- CreateIndex
CREATE INDEX "payments_student_id_status_idx" ON "payments"("student_id", "status");

-- CreateIndex
CREATE INDEX "payment_audit_logs_payment_id_idx" ON "payment_audit_logs"("payment_id");

-- CreateIndex
CREATE INDEX "payment_audit_logs_school_id_idx" ON "payment_audit_logs"("school_id");

-- CreateIndex
CREATE INDEX "timetables_school_id_idx" ON "timetables"("school_id");

-- CreateIndex
CREATE INDEX "timetables_class_id_idx" ON "timetables"("class_id");

-- CreateIndex
CREATE INDEX "timetables_teacher_id_idx" ON "timetables"("teacher_id");

-- CreateIndex
CREATE INDEX "timetables_subject_id_idx" ON "timetables"("subject_id");

-- CreateIndex
CREATE INDEX "timetables_school_id_slot_idx" ON "timetables"("school_id", "slot");

-- CreateIndex
CREATE INDEX "timetables_teacher_id_school_id_idx" ON "timetables"("teacher_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "timetables_class_id_slot_key" ON "timetables"("class_id", "slot");

-- CreateIndex
CREATE INDEX "attendance_sessions_school_id_idx" ON "attendance_sessions"("school_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_class_id_idx" ON "attendance_sessions"("class_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_subject_id_idx" ON "attendance_sessions"("subject_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_timetable_id_idx" ON "attendance_sessions"("timetable_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_date_idx" ON "attendance_sessions"("date");

-- CreateIndex
CREATE INDEX "attendance_sessions_date_school_id_idx" ON "attendance_sessions"("date", "school_id");

-- CreateIndex
CREATE INDEX "attendance_sessions_teacher_id_date_idx" ON "attendance_sessions"("teacher_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_sessions_class_id_timetable_id_date_key" ON "attendance_sessions"("class_id", "timetable_id", "date");

-- CreateIndex
CREATE INDEX "attendances_session_id_idx" ON "attendances"("session_id");

-- CreateIndex
CREATE INDEX "attendances_session_id_student_id_idx" ON "attendances"("session_id", "student_id");

-- CreateIndex
CREATE INDEX "attendances_student_id_idx" ON "attendances"("student_id");

-- CreateIndex
CREATE INDEX "attendances_school_id_idx" ON "attendances"("school_id");

-- CreateIndex
CREATE INDEX "attendances_school_id_student_id_idx" ON "attendances"("school_id", "student_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_session_id_student_id_key" ON "attendances"("session_id", "student_id");

-- CreateIndex
CREATE INDEX "incidents_student_id_idx" ON "incidents"("student_id");

-- CreateIndex
CREATE INDEX "incidents_teacher_id_idx" ON "incidents"("teacher_id");

-- CreateIndex
CREATE INDEX "incidents_type_idx" ON "incidents"("type");

-- CreateIndex
CREATE INDEX "incidents_status_idx" ON "incidents"("status");

-- CreateIndex
CREATE INDEX "incidents_school_id_idx" ON "incidents"("school_id");

-- CreateIndex
CREATE INDEX "incidents_student_id_date_idx" ON "incidents"("student_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "sync_operations_client_operation_id_key" ON "sync_operations"("client_operation_id");

-- CreateIndex
CREATE INDEX "sync_operations_school_id_idx" ON "sync_operations"("school_id");

-- CreateIndex
CREATE INDEX "sync_operations_client_operation_id_idx" ON "sync_operations"("client_operation_id");

-- CreateIndex
CREATE INDEX "student_parents_student_id_idx" ON "student_parents"("student_id");

-- CreateIndex
CREATE INDEX "student_parents_parent_user_id_idx" ON "student_parents"("parent_user_id");

-- CreateIndex
CREATE INDEX "student_parents_school_id_idx" ON "student_parents"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_school_id_idx" ON "refresh_tokens"("school_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- CreateIndex
CREATE INDEX "password_reset_tokens_token_idx" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expires_at_idx" ON "password_reset_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_code_key" ON "invitations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_code_idx" ON "invitations"("code");

-- CreateIndex
CREATE INDEX "invitations_school_id_idx" ON "invitations"("school_id");

-- CreateIndex
CREATE INDEX "school_filieres_school_id_idx" ON "school_filieres"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_filieres_school_id_filiere_key" ON "school_filieres"("school_id", "filiere");

-- CreateIndex
CREATE INDEX "school_levels_school_id_idx" ON "school_levels"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "school_levels_school_id_level_key" ON "school_levels"("school_id", "level");

-- CreateIndex
CREATE INDEX "class_progression_options_from_class_level_from_section_idx" ON "class_progression_options"("from_class_level", "from_section");

-- CreateIndex
CREATE INDEX "teacher_progression_votes_teacher_id_idx" ON "teacher_progression_votes"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_progression_votes_school_year_id_idx" ON "teacher_progression_votes"("school_year_id");

-- CreateIndex
CREATE INDEX "teacher_progression_votes_class_id_idx" ON "teacher_progression_votes"("class_id");

-- CreateIndex
CREATE INDEX "teacher_progression_votes_school_id_idx" ON "teacher_progression_votes"("school_id");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_progression_votes_student_id_teacher_id_school_year_key" ON "teacher_progression_votes"("student_id", "teacher_id", "school_year_id");

-- CreateIndex
CREATE INDEX "student_progressions_student_id_idx" ON "student_progressions"("student_id");

-- CreateIndex
CREATE INDEX "student_progressions_school_year_id_idx" ON "student_progressions"("school_year_id");

-- CreateIndex
CREATE INDEX "student_progressions_school_id_idx" ON "student_progressions"("school_id");

-- CreateIndex
CREATE INDEX "student_progressions_class_id_idx" ON "student_progressions"("class_id");

-- CreateIndex
CREATE INDEX "student_progressions_next_class_id_idx" ON "student_progressions"("next_class_id");

-- CreateIndex
CREATE INDEX "student_progressions_applied_at_idx" ON "student_progressions"("applied_at");

-- CreateIndex
CREATE UNIQUE INDEX "student_progressions_student_id_school_year_id_key" ON "student_progressions"("student_id", "school_year_id");

-- AddForeignKey
ALTER TABLE "communes" ADD CONSTRAINT "communes_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_school_group_id_fkey" FOREIGN KEY ("school_group_id") REFERENCES "school_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_schools" ADD CONSTRAINT "user_schools_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_schools" ADD CONSTRAINT "user_schools_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_next_class_id_fkey" FOREIGN KEY ("next_class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_subjects" ADD CONSTRAINT "teacher_subjects_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_years" ADD CONSTRAINT "school_years_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_periods" ADD CONSTRAINT "academic_periods_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "school_years"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_periods" ADD CONSTRAINT "academic_periods_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "academic_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_cards" ADD CONSTRAINT "report_cards_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "academic_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_plans" ADD CONSTRAINT "payment_plans_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_tuitions" ADD CONSTRAINT "level_tuitions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "payment_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_audit_logs" ADD CONSTRAINT "payment_audit_logs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetables" ADD CONSTRAINT "timetables_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_timetable_id_fkey" FOREIGN KEY ("timetable_id") REFERENCES "timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_sessions" ADD CONSTRAINT "attendance_sessions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_parents" ADD CONSTRAINT "student_parents_parent_user_id_fkey" FOREIGN KEY ("parent_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_filieres" ADD CONSTRAINT "school_filieres_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_levels" ADD CONSTRAINT "school_levels_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_progression_votes" ADD CONSTRAINT "teacher_progression_votes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_progression_votes" ADD CONSTRAINT "teacher_progression_votes_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_progression_votes" ADD CONSTRAINT "teacher_progression_votes_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progressions" ADD CONSTRAINT "student_progressions_next_class_id_fkey" FOREIGN KEY ("next_class_id") REFERENCES "classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progressions" ADD CONSTRAINT "student_progressions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progressions" ADD CONSTRAINT "student_progressions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_progressions" ADD CONSTRAINT "student_progressions_school_year_id_fkey" FOREIGN KEY ("school_year_id") REFERENCES "school_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

