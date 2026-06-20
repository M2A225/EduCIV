namespace EduCIV.Domain.Entities;

public abstract class MultiTenantEntity : EntityBase
{
    private int _schoolId;
    public int SchoolId
    {
        get => _schoolId;
        set { _schoolId = value; OnPropertyChanged(); }
    }
}
