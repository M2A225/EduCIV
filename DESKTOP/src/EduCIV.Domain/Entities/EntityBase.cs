using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Runtime.CompilerServices;

namespace EduCIV.Domain.Entities;

public abstract class EntityBase : INotifyPropertyChanged
{
    private int _id;
    public int Id
    {
        get => _id;
        set { _id = value; OnPropertyChanged(); }
    }

    private DateTime _createdAt = DateTime.UtcNow;
    public DateTime CreatedAt
    {
        get => _createdAt;
        set { _createdAt = value; OnPropertyChanged(); }
    }

    private DateTime _updatedAt = DateTime.UtcNow;
    public DateTime UpdatedAt
    {
        get => _updatedAt;
        set { _updatedAt = value; OnPropertyChanged(); }
    }

    public string? ClientOperationId { get; set; }
    public bool IsSynced { get; set; } = true;

    [ConcurrencyCheck]
    public int SyncVersion { get; set; } = 1;

    public bool IsDeleted { get; set; }

    public event PropertyChangedEventHandler? PropertyChanged;
    protected void OnPropertyChanged([CallerMemberName] string name = "")
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}
