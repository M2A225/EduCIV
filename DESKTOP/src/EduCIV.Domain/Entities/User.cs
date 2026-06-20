using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class User : EntityBase
{
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; } = UserRole.PARENT;
    public int? SchoolId { get; set; }
    public School? School { get; set; }
    public ICollection<UserSchool> UserSchools { get; set; } = new List<UserSchool>();
    public ICollection<Student> Students { get; set; } = new List<Student>();
    public ICollection<StudentParent> ParentLinks { get; set; } = new List<StudentParent>();
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public ICollection<PasswordResetToken> PasswordResetTokens { get; set; } = new List<PasswordResetToken>();
}
