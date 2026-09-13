import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button, Container, Grid, TextField, Typography } from '@mui/material';
import { clientService, type ClientFormData } from '../services/clientService';

const EMPTY_FORM: ClientFormData = {
  firstName: '',
  lastName: '',
  dni: '',
  phone: '',
  email: '',
  birthDate: '',
  address: '',
  goal: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
};

function validate(form: ClientFormData): string | null {
  if (!form.firstName || !form.lastName || !form.dni || !form.phone || !form.email || !form.birthDate) {
    return 'Please fill in all required fields.';
  }
  if (!/^\d{7,8}$/.test(form.dni)) {
    return 'DNI must be 7 or 8 digits.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    return 'Please enter a valid email.';
  }
  return null;
}

export function ClientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState<ClientFormData>(EMPTY_FORM);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    clientService.get(Number(id)).then((c) => {
      setForm({
        firstName: c.firstName,
        lastName: c.lastName,
        dni: c.dni,
        phone: c.phone,
        email: c.email,
        birthDate: c.birthDate.slice(0, 10),
        address: c.address ?? '',
        goal: c.goal ?? '',
        emergencyContactName: c.emergencyContactName ?? '',
        emergencyContactPhone: c.emergencyContactPhone ?? '',
        emergencyContactRelationship: c.emergencyContactRelationship ?? '',
      });
    });
  }, [id]);

  const setField = (field: keyof ClientFormData) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (isEdit) {
        await clientService.update(Number(id), form);
      } else {
        await clientService.create(form);
      }
      navigate('/clients');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(status === 409 ? 'A client with this DNI already exists.' : 'Could not save the client.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isEdit ? 'Edit client' : 'New client'}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField label="First name" fullWidth required value={form.firstName} onChange={setField('firstName')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Last name" fullWidth required value={form.lastName} onChange={setField('lastName')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="DNI" fullWidth required value={form.dni} onChange={setField('dni')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Phone" fullWidth required value={form.phone} onChange={setField('phone')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField label="Email" type="email" fullWidth required value={form.email} onChange={setField('email')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Birth date"
              type="date"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              value={form.birthDate}
              onChange={setField('birthDate')}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Address" fullWidth value={form.address} onChange={setField('address')} />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Goal / notes" fullWidth value={form.goal} onChange={setField('goal')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Emergency contact" fullWidth value={form.emergencyContactName} onChange={setField('emergencyContactName')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Emergency phone" fullWidth value={form.emergencyContactPhone} onChange={setField('emergencyContactPhone')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Relationship" fullWidth value={form.emergencyContactRelationship} onChange={setField('emergencyContactRelationship')} />
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="text" onClick={() => navigate('/clients')}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
