import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { schoolService } from '../services/schools';
import { extractData } from '../lib/utils';
import type { SetupStatus } from '../types';

export const useSetup = () => {
  const { activeRole } = useAuth();
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!activeRole || !['DIRECTOR', 'ACCOUNTANT'].includes(activeRole)) {
      setSetupStatus({ completed: true, completed_at: null, director_completed: true, accountant_completed: true, wizard_steps: 0, current_step: 0 });
      setLoading(false);
      return;
    }
    try {
      const res = await schoolService.getSetupStatus();
      setSetupStatus(extractData<SetupStatus>(res));
    } catch {
      setSetupStatus(null);
    } finally {
      setLoading(false);
    }
  }, [activeRole]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    refresh();
  }, [refresh]);

  return { setupStatus, loading, refresh };
};
