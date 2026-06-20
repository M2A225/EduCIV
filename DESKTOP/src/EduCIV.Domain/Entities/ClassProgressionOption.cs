namespace EduCIV.Domain.Entities;
public class ClassProgressionOption : EntityBase
{
    public string FromClassLevel { get; set; } = string.Empty;
    public string? FromSection { get; set; }
    public string ToClassLevel { get; set; } = string.Empty;
    public string? ToSection { get; set; }
}
