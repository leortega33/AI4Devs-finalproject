import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface DeactivateClientDialogProps {
  open: boolean;
  clientName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeactivateClientDialog({ open, clientName, onCancel, onConfirm }: DeactivateClientDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Deactivate client</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Deactivate {clientName}? Their history is preserved and they can be reactivated later.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Deactivate
        </Button>
      </DialogActions>
    </Dialog>
  );
}
