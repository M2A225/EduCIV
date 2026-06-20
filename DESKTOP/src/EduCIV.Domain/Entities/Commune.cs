namespace EduCIV.Domain.Entities;
public class Commune : EntityBase
{
    private string _name = string.Empty;
    public string Name { get => _name; set { _name = value; OnPropertyChanged(); } }
    public int CityId { get; set; }
    public City? City { get; set; }
}
