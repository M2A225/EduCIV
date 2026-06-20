namespace EduCIV.Domain.Entities;
public class SchoolGroup : EntityBase
{
    public string Name { get; set; } = string.Empty;
    public string? Abbreviation { get; set; }
    public string? City { get; set; }
    public ICollection<School> Schools { get; set; } = new List<School>();
}
