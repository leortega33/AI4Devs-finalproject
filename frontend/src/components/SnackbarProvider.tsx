import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Alert, Snackbar, type AlertColor } from '@mui/material';

interface SnackbarContextValue {
  notify: (message: string, severity?: AlertColor) => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

/** Global provider that renders a single snackbar for action feedback. */
export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('success');

  const notify = useCallback((msg: string, sev: AlertColor = 'success') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpen(false)} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

/** Access the global snackbar. Falls back to a no-op if no provider is mounted. */
export function useSnackbar(): SnackbarContextValue {
  const ctx = useContext(SnackbarContext);
  return ctx ?? { notify: () => undefined };
}
