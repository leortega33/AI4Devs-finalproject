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
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { exerciseService, type Exercise, type ExerciseCategory } from '../services/exerciseService';

interface ExercisePickerDialogProps {
  open: boolean;
  onCancel: () => void;
  onChoose: (exercise: Exercise) => void;
}

type CategoryFilter = 'all' | ExerciseCategory;

export function ExercisePickerDialog({ open, onCancel, onChoose }: ExercisePickerDialogProps) {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('all');

  useEffect(() => {
    if (!open) return;
    const params: { search?: string; category?: ExerciseCategory } = {};
    if (search) params.search = search;
    if (category !== 'all') params.category = category;
    exerciseService.list(params).then(setExercises);
  }, [open, search, category]);

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{t('routines.picker.title')}</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 2 }}>
          <TextField
            label={t('routines.picker.search')}
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            label={t('routines.picker.category')}
            size="small"
            select
            sx={{ minWidth: 150 }}
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryFilter)}
          >
            <MenuItem value="all">{t('routines.picker.categoryAll')}</MenuItem>
            <MenuItem value="mobility">{t('routines.picker.categoryMobility')}</MenuItem>
            <MenuItem value="activation">{t('routines.picker.categoryActivation')}</MenuItem>
            <MenuItem value="main">{t('routines.picker.categoryMain')}</MenuItem>
          </TextField>
        </Stack>
        <List dense>
          {exercises.map((exercise) => (
            <ListItemButton key={exercise.id} onClick={() => onChoose(exercise)}>
              <ListItemText primary={exercise.name} secondary={exercise.muscleGroup} />
            </ListItemButton>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('routines.picker.cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
}
