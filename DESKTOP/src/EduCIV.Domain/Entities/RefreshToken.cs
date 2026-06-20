namespace EduCIV.Domain.Entities;
public class RefreshToken : EntityBase
{
    public string Token { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User? User { get; set; }
    public int SchoolId { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
