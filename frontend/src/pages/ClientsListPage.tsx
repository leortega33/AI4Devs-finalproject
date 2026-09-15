import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { clientService, type Client, type ClientStatus } from '../services/clientService';
import { DeactivateClientDialog } from '../components/DeactivateClientDialog';
import { BackButton } from '../components/BackButton';

type StatusFilter = 'all' | ClientStatus;

export function ClientsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [toDeactivate, setToDeactivate] = useState<Client | null>(null);

  const load = useCallback(async () => {
    const params: { search?: string; status?: ClientStatus } = {};
    if (search) params.search = search;
    if (statusFilter !== 'all') params.status = statusFilter;
    setClients(await clientService.list(params));
  }, [search, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDeactivate = async () => {
    if (!toDeactivate) return;
    await clientService.setStatus(toDeactivate.id, 'inactive');
    setToDeactivate(null);
    load();
  };

  const reactivate = async (client: Client) => {
    await clientService.setStatus(client.id, 'active');
    load();
  };

  const columns: GridColDef<Client>[] = [
    { field: 'fullName', headerName: t('clients.columns.name'), flex: 1, valueGetter: (_v, row) => `${row.firstName} ${row.lastName}` },
    { field: 'dni', headerName: t('clients.columns.dni'), width: 120 },
    { field: 'phone', headerName: t('clients.columns.phone'), width: 160 },
    {
      field: 'status',
      headerName: t('clients.columns.status'),
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'active' ? t('clients.statusActive') : t('clients.statusInactive')}
          color={params.value === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'hasActiveRoutine',
      headerName: t('clients.columns.routine'),
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value ? t('clients.routineAssigned') : t('clients.routineNone')}
          color={params.value ? 'primary' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: t('clients.columns.actions'),
      width: 460,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => navigate(`/clients/${params.row.id}/edit`)}>
            {t('common.edit')}
          </Button>
          <Button size="small" onClick={() => navigate(`/clients/${params.row.id}/medical-record`)}>
            {t('clients.actions.medicalRecord')}
          </Button>
          <Button size="small" onClick={() => navigate(`/clients/${params.row.id}/routine`)}>
            {t('clients.actions.routine')}
          </Button>
          {params.row.status === 'active' ? (
            <Button size="small" color="error" onClick={() => setToDeactivate(params.row)}>
              {t('clients.actions.deactivate')}
            </Button>
          ) : (
            <Button size="small" onClick={() => reactivate(params.row)}>
              {t('clients.actions.reactivate')}
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <BackButton to="/" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">{t('clients.title')}</Typography>
        <Button variant="contained" onClick={() => navigate('/clients/new')}>
          {t('clients.new')}
        </Button>
      </Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label={t('clients.search')}
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          label={t('clients.status')}
          size="small"
          select
          sx={{ minWidth: 140 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <MenuItem value="all">{t('clients.statusAll')}</MenuItem>
          <MenuItem value="active">{t('clients.statusActive')}</MenuItem>
          <MenuItem value="inactive">{t('clients.statusInactive')}</MenuItem>
        </TextField>
      </Stack>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={clients}
          columns={columns}
          disableRowSelectionOnClick
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        />
      </div>
      <DeactivateClientDialog
        open={Boolean(toDeactivate)}
        clientName={toDeactivate ? `${toDeactivate.firstName} ${toDeactivate.lastName}` : ''}
        onCancel={() => setToDeactivate(null)}
        onConfirm={confirmDeactivate}
      />
    </Box>
  );
}
