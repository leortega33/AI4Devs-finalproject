import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface DeactivateClientDialogProps {
  open: boolean;
  clientName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeactivateClientDialog({ open, clientName, onCancel, onConfirm }: DeactivateClientDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{t('clients.deactivateDialog.title')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('clients.deactivateDialog.message', { name: clientName })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('common.cancel')}</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          {t('clients.deactivateDialog.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
