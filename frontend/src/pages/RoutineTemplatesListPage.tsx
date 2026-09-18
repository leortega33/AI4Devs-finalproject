import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Box, Button, IconButton, Stack, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import {
  routineTemplateService,
  type RoutineTemplateSummary,
} from '../services/routineTemplateService';
import { PageHeader } from '../components/PageHeader';

export function RoutineTemplatesListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [templates, setTemplates] = useState<RoutineTemplateSummary[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setTemplates(await routineTemplateService.list());
    } catch {
      setError(t('routines.loadFailed'));
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const duplicate = async (id: number) => {
    setError('');
    try {
      await routineTemplateService.duplicate(id);
      load();
    } catch {
      setError(t('routines.duplicateFailed'));
    }
  };

  const columns: GridColDef<RoutineTemplateSummary>[] = [
    { field: 'name', headerName: t('routines.columns.name'), flex: 1 },
    { field: 'objective', headerName: t('routines.columns.objective'), width: 180 },
    { field: 'sessionCount', headerName: t('routines.columns.sessions'), width: 110 },
    {
      field: 'actions',
      headerName: t('routines.columns.actions'),
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('common.edit')}>
            <IconButton size="small" aria-label={t('common.edit')} onClick={() => navigate(`/routines/${params.row.id}/edit`)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('routines.actions.duplicate')}>
            <IconButton size="small" aria-label={t('routines.actions.duplicate')} onClick={() => duplicate(params.row.id)}>
              <ContentCopyOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title={t('routines.title')}
        backTo="/"
        actions={
          <Button variant="contained" onClick={() => navigate('/routines/new')}>
            {t('routines.new')}
          </Button>
        }
      />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={templates}
          columns={columns}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        />
      </div>
    </Box>
  );
}
