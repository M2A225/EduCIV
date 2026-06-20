using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace EduCIV.App.Services;

public static class CryptoKeyService
{
    private const int KeyLength = 32;

    public static string GetOrCreateEncryptionKey()
    {
        var keyDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "EduCIV", "keys");
        Directory.CreateDirectory(keyDir);

        var keyFile = Path.Combine(keyDir, "db.key");

        if (File.Exists(keyFile))
        {
            var existing = File.ReadAllText(keyFile).Trim();
            if (existing.Length > 0)
                return existing;
        }

        var machineId = Environment.MachineName + Environment.UserName;
        using var deriveBytes = new Rfc2898DeriveBytes(
            machineId,
            Encoding.UTF8.GetBytes("EduCIV-2026-Salt"),
            100_000,
            HashAlgorithmName.SHA256);
        var key = Convert.ToHexString(deriveBytes.GetBytes(KeyLength));

        File.WriteAllText(keyFile, key);
        try
        {
            File.SetAttributes(keyFile, File.GetAttributes(keyFile) | FileAttributes.Hidden);
        }
        catch { }

        return key;
    }
}
