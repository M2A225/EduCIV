using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using EduCIV.Domain.Entities;

namespace EduCIV.Data.Repositories;

public class MultiTenantRepository<T> : Repository<T>, IMultiTenantRepository<T> where T : MultiTenantEntity
{
    public MultiTenantRepository(DbContext context) : base(context) { }

    public virtual async Task<IEnumerable<T>> GetBySchoolIdAsync(int schoolId)
        => await _dbSet.Where(e => e.SchoolId == schoolId).ToListAsync();

    public virtual async Task<T?> GetByIdAndSchoolAsync(int id, int schoolId)
        => await _dbSet.FirstOrDefaultAsync(e => e.Id == id && e.SchoolId == schoolId);

    public virtual async Task<IEnumerable<T>> FindBySchoolAsync(int schoolId, Expression<Func<T, bool>> predicate)
        => await _dbSet.Where(e => e.SchoolId == schoolId).Where(predicate).ToListAsync();

    public virtual async Task<bool> AnyBySchoolAsync(int schoolId, Expression<Func<T, bool>> predicate)
        => await _dbSet.AnyAsync(e => e.SchoolId == schoolId && predicate.Compile()(e));

    public virtual async Task<int> CountBySchoolAsync(int schoolId, Expression<Func<T, bool>>? predicate = null)
    {
        if (predicate == null)
            return await _dbSet.CountAsync(e => e.SchoolId == schoolId);
        return await _dbSet.CountAsync(e => e.SchoolId == schoolId && predicate.Compile()(e));
    }

    public virtual async Task<IEnumerable<T>> GetPagedBySchoolAsync(int schoolId, int page, int pageSize, Expression<Func<T, bool>>? filter = null, Expression<Func<T, object>>? orderBy = null, bool descending = false)
    {
        var query = _dbSet.Where(e => e.SchoolId == schoolId).AsQueryable();
        if (filter != null) query = query.Where(filter);
        if (orderBy != null) query = descending ? query.OrderByDescending(orderBy) : query.OrderBy(orderBy);
        return await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
    }
}
