import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MedicalInformationOutlinedIcon from '@mui/icons-material/MedicalInformationOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import MonitorWeightOutlinedIcon from '@mui/icons-material/MonitorWeightOutlined';
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { clientService, type Client, type ClientStatus, type ClientPaymentStatus } from '../services/clientService';
import { DeactivateClientDialog } from '../components/DeactivateClientDialog';
import { PageHeader } from '../components/PageHeader';

type StatusFilter = 'all' | ClientStatus;
type PaymentFilter = 'all' | ClientPaymentStatus;

export function ClientsListPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
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
      field: 'paymentStatus',
      headerName: t('clients.columns.payment'),
      width: 120,
      renderCell: (params) => {
        const value = params.value as string | undefined;
        const label =
          value === 'up_to_date'
            ? t('clients.paymentUpToDate')
            : value === 'overdue'
              ? t('clients.paymentOverdue')
              : t('clients.paymentNone');
        const color = value === 'up_to_date' ? 'success' : value === 'overdue' ? 'error' : 'default';
        return <Chip label={label} color={color} variant={value ? 'filled' : 'outlined'} size="small" />;
      },
    },
    {
      field: 'actions',
      headerName: t('clients.columns.actions'),
      width: 325,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title={t('common.edit')}>
            <IconButton size="small" aria-label={t('common.edit')} onClick={() => navigate(`/clients/${params.row.id}/edit`)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('clients.actions.medicalRecord')}>
            <IconButton size="small" aria-label={t('clients.actions.medicalRecord')} onClick={() => navigate(`/clients/${params.row.id}/medical-record`)}>
              <MedicalInformationOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('clients.actions.routine')}>
            <IconButton size="small" aria-label={t('clients.actions.routine')} onClick={() => navigate(`/clients/${params.row.id}/routine`)}>
              <FitnessCenterOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('clients.actions.payments')}>
            <IconButton size="small" aria-label={t('clients.actions.payments')} onClick={() => navigate(`/clients/${params.row.id}/payments`)}>
              <PaymentsOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('clients.actions.attendance')}>
            <IconButton size="small" aria-label={t('clients.actions.attendance')} onClick={() => navigate(`/clients/${params.row.id}/attendance`)}>
              <EventAvailableOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('clients.actions.progress')}>
            <IconButton size="small" aria-label={t('clients.actions.progress')} onClick={() => navigate(`/clients/${params.row.id}/progress`)}>
              <MonitorWeightOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('clients.actions.nutrition')}>
            <IconButton size="small" aria-label={t('clients.actions.nutrition')} onClick={() => navigate(`/clients/${params.row.id}/nutrition`)}>
              <RestaurantOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.status === 'active' ? (
            <Tooltip title={t('clients.actions.deactivate')}>
              <IconButton size="small" color="error" aria-label={t('clients.actions.deactivate')} onClick={() => setToDeactivate(params.row)}>
                <PersonOffOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title={t('clients.actions.reactivate')}>
              <IconButton size="small" aria-label={t('clients.actions.reactivate')} onClick={() => reactivate(params.row)}>
                <HowToRegOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      ),
    },
  ];

  // The payment-status filter is applied client-side over the already-loaded list.
  const rows = clients.filter((c) => paymentFilter === 'all' || c.paymentStatus === paymentFilter);

  return (
    <Box>
      <PageHeader
        title={t('clients.title')}
        backTo="/"
        actions={
          <Button variant="contained" onClick={() => navigate('/clients/new')}>
            {t('clients.new')}
          </Button>
        }
      />
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
        <TextField
          label={t('clients.paymentFilter')}
          size="small"
          select
          sx={{ minWidth: 160 }}
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value as PaymentFilter)}
        >
          <MenuItem value="all">{t('clients.statusAll')}</MenuItem>
          <MenuItem value="up_to_date">{t('clients.paymentUpToDate')}</MenuItem>
          <MenuItem value="overdue">{t('clients.paymentOverdue')}</MenuItem>
          <MenuItem value="no_payments">{t('clients.paymentNone')}</MenuItem>
        </TextField>
      </Stack>
      <div style={{ width: '100%' }}>
        <DataGrid
          autoHeight
          rows={rows}
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
