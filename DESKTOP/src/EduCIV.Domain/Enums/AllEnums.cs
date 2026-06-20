namespace EduCIV.Domain.Enums;

public static class AllEnums
{
    public enum UserRole
    {
        PARENT, TEACHER, DIRECTOR, BACKOFFICE, ACCOUNTANT, CASHIER, EDUCATOR, STUDENT
    }

    public enum UserSchoolScope
    {
        SCHOOL, GROUP, PRIMARY
    }

    public enum GradeStatus
    {
        EN_ATTENTE, VALIDE, REJETE
    }

    public enum GradeType
    {
        INTERROGATION, DEVOIR, EXAMEN
    }

    public enum PaymentStatus
    {
        VALIDE, ANNULE
    }

    public enum PaymentType
    {
        SCOLARITE, CANTINE, INSCRIPTION, TRANSPORT, AUTRE
    }

    public enum IncidentStatus
    {
        EN_COURS, RESOLU, IGNORE
    }

    public enum IncidentType
    {
        RETARD, ABSENCE_NON_JUSTIFIEE, COMPORTEMENT, AUTRE
    }

    public enum AttendanceStatus
    {
        PRESENT, ABSENT, LATE
    }

    public enum Sexe
    {
        M, F
    }

    public enum DecisionVote
    {
        ADMIS, REDOUBLE, ABSTENTION
    }

    public enum DecisionFinale
    {
        ADMIS, REDOUBLE, TRANSFERE, EXCLU, ABANDON
    }

    public enum TargetType
    {
        PARENT, TEACHER
    }

    public enum PeriodType
    {
        TRIMESTRE_1, TRIMESTRE_2, TRIMESTRE_3,
        SEMESTRE_1, SEMESTRE_2,
        COMPOSITION_1, COMPOSITION_2, COMPOSITION_3, COMPOSITION_4,
        PASSAGE, EXAMEN_BLANC
    }

    public enum SchoolType
    {
        PRIMAIRE, SECONDAIRE, LYCEE_TECHNIQUE, LYCEE_PROFESSIONNEL, GROUPE_SCOLAIRE
    }

    public enum SyncEntity
    {
        STUDENT, GRADE, PAYMENT, ATTENDANCE, INCIDENT, TEACHER, CLASS, SUBJECT, TIMETABLE
    }

    public enum SyncOperationStatus
    {
        PENDING, SYNCING, SYNCED, FAILED
    }
}
