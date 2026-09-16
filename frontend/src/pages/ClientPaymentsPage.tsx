import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { PaymentFormDialog } from '../components/PaymentFormDialog';
import { clientService, type Client } from '../services/clientService';
import {
  paymentService,
  type Payment,
  type PaymentFormData,
  type PaymentStatus,
} from '../services/paymentService';

const STATUS_LABELS: Record<PaymentStatus, { key: string; color: 'success' | 'error' | 'default' }> = {
  up_to_date: { key: 'payments.statusUpToDate', color: 'success' },
  overdue: { key: 'payments.statusOverdue', color: 'error' },
  no_payments: { key: 'payments.statusNone', color: 'default' },
};

const METHOD_LABELS: Record<string, string> = {
  cash: 'payments.methodCash',
  bank_transfer: 'payments.methodTransfer',
  card: 'payments.methodCard',
};

export function ClientPaymentsPage() {
  const { clientId } = useParams();
  const { t } = useTranslation();
  const [client, setClient] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [status, setStatus] = useState<PaymentStatus>('no_payments');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!clientId) return;
    try {
      const result = await paymentService.list(Number(clientId));
      setPayments(result.payments);
      setStatus(result.status);
    } catch {
      setError(t('payments.loadFailed'));
    }
  }, [clientId, t]);

  useEffect(() => {
    if (!clientId) return;
    clientService.get(Number(clientId)).then(setClient).catch(() => undefined);
    load();
  }, [clientId, load]);

  const save = async (data: PaymentFormData) => {
    if (!clientId) return;
    if (editing) {
      await paymentService.update(editing.id, data);
    } else {
      await paymentService.create(Number(clientId), data);
    }
    setDialogOpen(false);
    setEditing(null);
    load();
  };

  const remove = async (id: number) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(t('payments.deleteConfirm'))) return;
    await paymentService.remove(id);
    load();
  };

  const columns: GridColDef<Payment>[] = [
    {
      field: 'period',
      headerName: t('payments.columns.period'),
      width: 120,
      valueGetter: (_v, row) => `${String(row.periodMonth).padStart(2, '0')}/${row.periodYear}`,
    },
    { field: 'amount', headerName: t('payments.columns.amount'), width: 120 },
    {
      field: 'method',
      headerName: t('payments.columns.method'),
      width: 150,
      valueGetter: (_v, row) => t(METHOD_LABELS[row.method]),
    },
    {
      field: 'paymentDate',
      headerName: t('payments.columns.date'),
      width: 130,
      valueGetter: (_v, row) => row.paymentDate.slice(0, 10),
    },
    {
      field: 'actions',
      headerName: t('payments.columns.actions'),
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row">
          <IconButton
            size="small"
            aria-label={t('payments.edit')}
            onClick={() => {
              setEditing(params.row);
              setDialogOpen(true);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label={t('payments.delete')} onClick={() => remove(params.row.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    },
  ];

  const clientName = client ? `${client.firstName} ${client.lastName}` : '';
  const statusMeta = STATUS_LABELS[status];

  return (
    <Box>
      <BackButton to="/clients" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4">{t('payments.title')}</Typography>
        <Button
          variant="contained"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          {t('payments.register')}
        </Button>
      </Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        {clientName && <Typography color="text.secondary">{t('payments.subtitle', { name: clientName })}</Typography>}
        <Chip label={t(statusMeta.key)} color={statusMeta.color} size="small" />
      </Stack>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {payments.length === 0 ? (
        <Alert severity="info">{t('payments.empty')}</Alert>
      ) : (
        <div style={{ width: '100%' }}>
          <DataGrid
            autoHeight
            rows={payments}
            columns={columns}
            disableRowSelectionOnClick
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
          />
        </div>
      )}

      <PaymentFormDialog
        open={dialogOpen}
        payment={editing}
        onCancel={() => {
          setDialogOpen(false);
          setEditing(null);
        }}
        onSave={save}
      />
    </Box>
  );
}
