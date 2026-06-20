using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace EduCIV.Data;

public class DatabaseInitializer
{
    private readonly string _connectionString;

    public DatabaseInitializer(string connectionString)
    {
        _connectionString = connectionString;
    }

    public void Initialize()
    {
        using var sqlite = new SqliteConnection(_connectionString);
        sqlite.Open();

        using var walCmd = sqlite.CreateCommand();
        walCmd.CommandText = "PRAGMA journal_mode=WAL;";
        walCmd.ExecuteNonQuery();

        using var cipherCmd = sqlite.CreateCommand();
        cipherCmd.CommandText = "PRAGMA cipher_memory_security = OFF;";
        try { cipherCmd.ExecuteNonQuery(); } catch { }

        sqlite.Close();

        var options = new DbContextOptionsBuilder<EduCIVContext>()
            .UseSqlite(_connectionString)
            .Options;

        using var context = new EduCIVContext(options);
        context.Database.EnsureCreated();
    }
}
