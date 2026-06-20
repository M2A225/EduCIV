using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class School : EntityBase
{
    public string Name { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? City { get; set; }
    public string? Type { get; set; }
    public SchoolType? SchoolType { get; set; }
    public int? SchoolGroupId { get; set; }
    public SchoolGroup? SchoolGroup { get; set; }
    public int SchoolId { get; set; }
    public DateTime? DirectorSetupAt { get; set; }
    public DateTime? AccountantSetupAt { get; set; }
    public DateTime? SetupCompletedAt { get; set; }
    public int WizardSteps { get; set; } = 6;
    public int CurrentStep { get; set; }
}
