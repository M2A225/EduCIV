using EduCIV.Data;
using EduCIV.Data.Repositories;
using EduCIV.Domain.Entities;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace EduCIV.Tests.Data;

public class RepositoryTests : IDisposable
{
    private readonly DbContextOptions<EduCIVContext> _dbOptions;
    private readonly EduCIVContext _context;
    private readonly Repository<Student> _repository;

    public RepositoryTests()
    {
        _dbOptions = new DbContextOptionsBuilder<EduCIVContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _context = new EduCIVContext(_dbOptions);
        _repository = new Repository<Student>(_context);
    }

    public void Dispose() => _context.Dispose();

    [Fact]
    public async Task AddAsync_ShouldAddEntity()
    {
        var student = new Student { Name = "Test", SchoolId = 1 };

        var result = await _repository.AddAsync(student);

        result.Name.Should().Be("Test");
        result.Id.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetByIdAsync_ShouldReturnEntity()
    {
        var student = new Student { Name = "Find Me", SchoolId = 1 };
        await _repository.AddAsync(student);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(student.Id);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Find Me");
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnAll()
    {
        await _repository.AddRangeAsync(new[]
        {
            new Student { Name = "A", SchoolId = 1 },
            new Student { Name = "B", SchoolId = 1 },
        });
        await _context.SaveChangesAsync();

        var result = await _repository.GetAllAsync();

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task FindAsync_ShouldFilterByPredicate()
    {
        await _repository.AddRangeAsync(new[]
        {
            new Student { Name = "Alice", SchoolId = 1 },
            new Student { Name = "Bob", SchoolId = 1 },
        });
        await _context.SaveChangesAsync();

        var result = await _repository.FindAsync(s => s.Name == "Alice");

        result.Should().HaveCount(1);
        result.First().Name.Should().Be("Alice");
    }

    [Fact]
    public async Task CountAsync_ShouldReturnCount()
    {
        await _repository.AddRangeAsync(new[]
        {
            new Student { Name = "A", SchoolId = 1 },
            new Student { Name = "B", SchoolId = 1 },
            new Student { Name = "C", SchoolId = 1 },
        });
        await _context.SaveChangesAsync();

        var count = await _repository.CountAsync();

        count.Should().Be(3);
    }

    [Fact]
    public async Task DeleteAsync_ShouldRemoveEntity()
    {
        var student = new Student { Name = "Delete Me", SchoolId = 1 };
        await _repository.AddAsync(student);
        await _context.SaveChangesAsync();

        await _repository.DeleteAsync(student);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(student.Id);
        result.Should().BeNull();
    }

    [Fact]
    public async Task UpdateAsync_ShouldUpdateEntity()
    {
        var student = new Student { Name = "Original", SchoolId = 1 };
        await _repository.AddAsync(student);
        await _context.SaveChangesAsync();

        student.Name = "Updated";
        await _repository.UpdateAsync(student);
        await _context.SaveChangesAsync();

        var result = await _repository.GetByIdAsync(student.Id);
        result!.Name.Should().Be("Updated");
    }

    [Fact]
    public async Task GetPagedAsync_ShouldReturnPage()
    {
        var students = Enumerable.Range(1, 10)
            .Select(i => new Student { Name = $"Student {i}", SchoolId = 1 })
            .ToList();
        await _repository.AddRangeAsync(students);
        await _context.SaveChangesAsync();

        var page = await _repository.GetPagedAsync(2, 3);

        page.Should().HaveCount(3);
    }
}
