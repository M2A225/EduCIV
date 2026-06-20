import React, { useState, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSchools } from '../../hooks/useSchools';
import { Building2, ChevronDown } from 'lucide-react';

export function SchoolSwitcher() {
  const { schoolIds, currentSchoolId, setCurrentSchoolId } = useAuth();
  const { data: schools } = useSchools();
  const [open, setOpen] = useState(false);

  const schoolMap = useMemo(() => {
    const map: Record<number, string> = {};
    if (Array.isArray(schools)) {
      schools.forEach(s => { map[s.id] = s.name; });
    }
    return map;
  }, [schools]);

  const currentName = currentSchoolId ? schoolMap[currentSchoolId] : null;

  if (schoolIds.length <= 1) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 border border-primary/10 text-sm font-medium text-text hover:bg-white/80 transition-colors w-full"
      >
        <Building2 className="w-4 h-4 text-primary shrink-0" />
        <span className="truncate">{currentName || `École #${currentSchoolId}`}</span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-primary/10 z-20 py-1">
            {schoolIds.map(id => {
              const name = schoolMap[id];
              return (
                <button
                  key={id}
                  onClick={() => { setCurrentSchoolId(id); setOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                    id === currentSchoolId
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text hover:bg-primary/5'
                  }`}
                >
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">{name || `École #${id}`}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}