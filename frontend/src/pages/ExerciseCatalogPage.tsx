import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, MenuItem, Stack, TextField } from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { exerciseService, type Exercise, type ExerciseCategory } from '../services/exerciseService';
import { PageHeader } from '../components/PageHeader';

type CategoryFilter = 'all' | ExerciseCategory;

const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  mobility: 'exercises.categoryMobility',
  activation: 'exercises.categoryActivation',
  main: 'exercises.categoryMain',
};

export function ExerciseCatalogPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const load = useCallback(async () => {
    const params: { search?: string; category?: ExerciseCategory } = {};
    if (search) params.search = search;
    if (categoryFilter !== 'all') params.category = categoryFilter;
    setExercises(await exerciseService.list(params));
  }, [search, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: GridColDef<Exercise>[] = [
    { field: 'name', headerName: t('exercises.columns.name'), flex: 1 },
    { field: 'muscleGroup', headerName: t('exercises.columns.muscleGroup'), width: 180 },
    {
      field: 'category',
      headerName: t('exercises.columns.category'),
      width: 150,
      renderCell: (params) => (
        <Chip label={t(CATEGORY_LABELS[params.value as ExerciseCategory])} size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: t('exercises.columns.actions'),
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Button size="small" onClick={() => navigate(`/exercises/${params.row.id}/edit`)}>
          {t('common.edit')}
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('exercises.title')}
        backTo="/"
        actions={
          <Button variant="contained" onClick={() => navigate('/exercises/new')}>
            {t('exercises.new')}
          </Button>
        }
      />
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label={t('exercises.search')}
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          label={t('exercises.category')}
          size="small"
          select
          sx={{ minWidth: 160 }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
        >
          <MenuItem value="all">{t('exercises.categoryAll')}</MenuItem>
          <MenuItem value="mobility">{t('exercises.categoryMobility')}</MenuItem>
          <MenuItem value="activation">{t('exercises.categoryActivation')}</MenuItem>
          <MenuItem value="main">{t('exercises.categoryMain')}</MenuItem>
        </TextField>
      </Stack>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={exercises}
          columns={columns}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        />
      </div>
    </Box>
  );
}
