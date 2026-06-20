using System.Collections.ObjectModel;
namespace EduCIV.Domain.Entities;
public class City : EntityBase
{
    private string _name = string.Empty;
    public string Name { get => _name; set { _name = value; OnPropertyChanged(); } }
    public ICollection<Commune> Communes { get; set; } = new List<Commune>();
}
