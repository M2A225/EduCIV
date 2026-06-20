using EduCIV.Domain.Entities;

namespace EduCIV.Data.Repositories;

public interface IMultiTenantRepository<T> : IRepository<T> where T : MultiTenantEntity
{
    Task<IEnumerable<T>> GetBySchoolIdAsync(int schoolId);
    Task<T?> GetByIdAndSchoolAsync(int id, int schoolId);
    Task<IEnumerable<T>> FindBySchoolAsync(int schoolId, System.Linq.Expressions.Expression<Func<T, bool>> predicate);
    Task<bool> AnyBySchoolAsync(int schoolId, System.Linq.Expressions.Expression<Func<T, bool>> predicate);
    Task<int> CountBySchoolAsync(int schoolId, System.Linq.Expressions.Expression<Func<T, bool>>? predicate = null);
    Task<IEnumerable<T>> GetPagedBySchoolAsync(int schoolId, int page, int pageSize, System.Linq.Expressions.Expression<Func<T, bool>>? filter = null, System.Linq.Expressions.Expression<Func<T, object>>? orderBy = null, bool descending = false);
}
