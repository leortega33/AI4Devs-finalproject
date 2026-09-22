import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import HistoryIcon from '@mui/icons-material/History';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { clientService, type Client } from '../services/clientService';
import {
  nutritionService,
  type NutritionMeal,
  type NutritionPlanVersion,
} from '../services/nutritionService';

/** A meal in the editor's local state. */
interface MealDraft {
  name: string;
  note: string;
  items: { description: string; quantity: string }[];
}

function toDraft(meals: NutritionMeal[]): MealDraft[] {
  return meals.map((meal) => ({
    name: meal.name,
    note: meal.note ?? '',
    items: meal.items.map((item) => ({ description: item.description, quantity: item.quantity ?? '' })),
  }));
}

export function ClientNutritionPage() {
  const { clientId } = useParams();
  const { t, i18n } = useTranslation();
  const [client, setClient] = useState<Client | null>(null);
  const [dailyCalories, setDailyCalories] = useState('');
  const [proteinTargetG, setProteinTargetG] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [meals, setMeals] = useState<MealDraft[]>([]);
  const [versions, setVersions] = useState<NutritionPlanVersion[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) return;
    try {
      const plan = await nutritionService.getPlan(Number(clientId));
      setDailyCalories(plan.dailyCalories == null ? '' : String(plan.dailyCalories));
      setProteinTargetG(plan.proteinTargetG == null ? '' : String(plan.proteinTargetG));
      setGeneralNotes(plan.generalNotes ?? '');
      setMeals(toDraft(plan.meals));
    } catch {
      setError(t('nutrition.loadFailed'));
    }
  }, [clientId, t]);

  useEffect(() => {
    if (!clientId) return;
    clientService.get(Number(clientId)).then(setClient).catch(() => undefined);
    load();
  }, [clientId, load]);

  const addMeal = () => setMeals((prev) => [...prev, { name: '', note: '', items: [] }]);
  const removeMeal = (index: number) => setMeals((prev) => prev.filter((_, i) => i !== index));
  const moveMeal = (index: number, delta: number) =>
    setMeals((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  const setMealField = (index: number, field: 'name' | 'note', value: string) =>
    setMeals((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  const addItem = (mealIndex: number) =>
    setMeals((prev) =>
      prev.map((m, i) => (i === mealIndex ? { ...m, items: [...m.items, { description: '', quantity: '' }] } : m)),
    );
  const removeItem = (mealIndex: number, itemIndex: number) =>
    setMeals((prev) =>
      prev.map((m, i) => (i === mealIndex ? { ...m, items: m.items.filter((_, j) => j !== itemIndex) } : m)),
    );
  const setItemField = (mealIndex: number, itemIndex: number, field: 'description' | 'quantity', value: string) =>
    setMeals((prev) =>
      prev.map((m, i) =>
        i === mealIndex
          ? { ...m, items: m.items.map((it, j) => (j === itemIndex ? { ...it, [field]: value } : it)) }
          : m,
      ),
    );

  const handleSave = async () => {
    if (!clientId) return;
    setSubmitting(true);
    setError('');
    try {
      await nutritionService.savePlan(Number(clientId), {
        dailyCalories: dailyCalories.trim() === '' ? null : Number(dailyCalories),
        proteinTargetG: proteinTargetG.trim() === '' ? null : Number(proteinTargetG),
        generalNotes: generalNotes.trim() || null,
        meals: meals.map((meal) => ({
          name: meal.name.trim(),
          note: meal.note.trim() || null,
          items: meal.items.map((item) => ({
            description: item.description.trim(),
            quantity: item.quantity.trim() || null,
          })),
        })),
      });
      setSaved(t('nutrition.saved'));
      if (showHistory) loadVersions();
    } catch {
      setError(t('nutrition.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const loadVersions = useCallback(async () => {
    if (!clientId) return;
    try {
      setVersions(await nutritionService.getVersions(Number(clientId)));
    } catch {
      setError(t('nutrition.historyFailed'));
    }
  }, [clientId, t]);

  const toggleHistory = () => {
    const next = !showHistory;
    setShowHistory(next);
    if (next) loadVersions();
  };

  const clientName = client ? `${client.firstName} ${client.lastName}` : '';
  const canSave = meals.every((m) => m.name.trim() !== '' && m.items.every((it) => it.description.trim() !== ''));

  return (
    <div>
      <BackButton to="/clients" />
      <Typography variant="h4" gutterBottom>
        {t('nutrition.title')}
      </Typography>
      {clientName && (
        <Typography color="text.secondary" gutterBottom>
          {t('nutrition.subtitle', { name: clientName })}
        </Typography>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4}>
              <TextField
                label={t('nutrition.dailyCalories')}
                type="number"
                inputProps={{ min: 0 }}
                value={dailyCalories}
                onChange={(e) => setDailyCalories(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label={t('nutrition.proteinTarget')}
                type="number"
                inputProps={{ min: 0 }}
                value={proteinTargetG}
                onChange={(e) => setProteinTargetG(e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('nutrition.generalNotes')}
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        {meals.map((meal, mealIndex) => (
          <Card key={mealIndex} variant="outlined" data-testid="meal-card">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TextField
                  label={t('nutrition.mealName')}
                  value={meal.name}
                  onChange={(e) => setMealField(mealIndex, 'name', e.target.value)}
                  size="small"
                  sx={{ flex: 1 }}
                />
                <Tooltip title={t('nutrition.moveUp')}>
                  <span>
                    <IconButton size="small" aria-label={t('nutrition.moveUp')} disabled={mealIndex === 0} onClick={() => moveMeal(mealIndex, -1)}>
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t('nutrition.moveDown')}>
                  <span>
                    <IconButton size="small" aria-label={t('nutrition.moveDown')} disabled={mealIndex === meals.length - 1} onClick={() => moveMeal(mealIndex, 1)}>
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={t('nutrition.removeMeal')}>
                  <IconButton size="small" color="error" aria-label={t('nutrition.removeMeal')} onClick={() => removeMeal(mealIndex)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <TextField
                label={t('nutrition.mealNote')}
                value={meal.note}
                onChange={(e) => setMealField(mealIndex, 'note', e.target.value)}
                size="small"
                fullWidth
                sx={{ mb: 1 }}
              />
              <Divider sx={{ my: 1 }} />
              <Stack spacing={1}>
                {meal.items.map((item, itemIndex) => (
                  <Stack key={itemIndex} direction="row" spacing={1} alignItems="center">
                    <TextField
                      label={t('nutrition.foodDescription')}
                      value={item.description}
                      onChange={(e) => setItemField(mealIndex, itemIndex, 'description', e.target.value)}
                      size="small"
                      sx={{ flex: 2 }}
                    />
                    <TextField
                      label={t('nutrition.foodQuantity')}
                      value={item.quantity}
                      onChange={(e) => setItemField(mealIndex, itemIndex, 'quantity', e.target.value)}
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Tooltip title={t('nutrition.removeItem')}>
                      <IconButton size="small" color="error" aria-label={t('nutrition.removeItem')} onClick={() => removeItem(mealIndex, itemIndex)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ))}
              </Stack>
              <Button size="small" startIcon={<AddIcon />} onClick={() => addItem(mealIndex)} sx={{ mt: 1 }}>
                {t('nutrition.addItem')}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick={addMeal}>
          {t('nutrition.addMeal')}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={submitting || !canSave}>
          {t('common.save')}
        </Button>
        <Button startIcon={<HistoryIcon />} onClick={toggleHistory}>
          {t('nutrition.history')}
        </Button>
      </Stack>
      {!canSave && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {t('nutrition.validationHint')}
        </Typography>
      )}

      {showHistory && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t('nutrition.history')}
          </Typography>
          {versions.length === 0 ? (
            <Typography color="text.secondary">{t('nutrition.historyEmpty')}</Typography>
          ) : (
            <Stack spacing={1}>
              {versions.map((version) => (
                <Card key={version.id} variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2">
                      {new Date(version.createdAt).toLocaleString(i18n.language)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('nutrition.historyMealCount', { count: version.snapshot.meals.length })}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>
      )}

      <Snackbar open={Boolean(saved)} autoHideDuration={3000} onClose={() => setSaved('')} message={saved} />
    </div>
  );
}
