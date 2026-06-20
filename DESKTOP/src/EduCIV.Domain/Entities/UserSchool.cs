using static EduCIV.Domain.Enums.AllEnums;
namespace EduCIV.Domain.Entities;
public class UserSchool : EntityBase
{
    public int UserId { get; set; }
    public User? User { get; set; }
    public int SchoolId { get; set; }
    public School? School { get; set; }
    public UserSchoolScope Scope { get; set; } = UserSchoolScope.SCHOOL;
    public UserRole Role { get; set; }
}
