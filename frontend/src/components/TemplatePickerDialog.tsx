import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  routineTemplateService,
  type RoutineTemplateSummary,
} from '../services/routineTemplateService';

interface TemplatePickerDialogProps {
  open: boolean;
  onCancel: () => void;
  onChoose: (template: RoutineTemplateSummary) => void;
}

export function TemplatePickerDialog({ open, onCancel, onChoose }: TemplatePickerDialogProps) {
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<RoutineTemplateSummary[]>([]);

  useEffect(() => {
    if (!open) return;
    routineTemplateService.list().then(setTemplates);
  }, [open]);

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{t('clientRoutine.picker.title')}</DialogTitle>
      <DialogContent>
        {templates.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>
            {t('clientRoutine.picker.empty')}
          </Typography>
        ) : (
          <List dense>
            {templates.map((template) => (
              <ListItemButton key={template.id} onClick={() => onChoose(template)}>
                <ListItemText primary={template.name} secondary={template.objective ?? ''} />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('clientRoutine.picker.cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
}
