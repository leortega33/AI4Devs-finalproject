import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { clientService, type Client, type ClientStatus } from '../services/clientService';
import { DeactivateClientDialog } from '../components/DeactivateClientDialog';

type StatusFilter = 'all' | ClientStatus;

export function ClientsListPage() {
  const navigate = useNavigate();
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
    { field: 'fullName', headerName: 'Name', flex: 1, valueGetter: (_v, row) => `${row.firstName} ${row.lastName}` },
    { field: 'dni', headerName: 'DNI', width: 120 },
    { field: 'phone', headerName: 'Phone', width: 160 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value} color={params.value === 'active' ? 'success' : 'default'} size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 240,
      sortable: false,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" onClick={() => navigate(`/clients/${params.row.id}/edit`)}>
            Edit
          </Button>
          {params.row.status === 'active' ? (
            <Button size="small" color="error" onClick={() => setToDeactivate(params.row)}>
              Deactivate
            </Button>
          ) : (
            <Button size="small" onClick={() => reactivate(params.row)}>
              Reactivate
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Clients</Typography>
        <Button variant="contained" onClick={() => navigate('/clients/new')}>
          New client
        </Button>
      </Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search by name"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          label="Status"
          size="small"
          select
          sx={{ minWidth: 140 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
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
    </Container>
  );
}
