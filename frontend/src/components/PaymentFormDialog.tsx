import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Payment, PaymentFormData, PaymentMethod } from '../services/paymentService';

interface PaymentFormDialogProps {
  open: boolean;
  payment: Payment | null;
  onCancel: () => void;
  onSave: (data: PaymentFormData) => Promise<void>;
}

const now = new Date();

function emptyForm(): PaymentFormData {
  return {
    amount: 0,
    paymentDate: now.toISOString().slice(0, 10),
    method: 'cash',
    periodMonth: now.getMonth() + 1,
    periodYear: now.getFullYear(),
  };
}

export function PaymentFormDialog({ open, payment, onCancel, onSave }: PaymentFormDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<PaymentFormData>(emptyForm());
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      payment
        ? {
            amount: payment.amount,
            paymentDate: payment.paymentDate.slice(0, 10),
            method: payment.method,
            periodMonth: payment.periodMonth,
            periodYear: payment.periodYear,
          }
        : emptyForm(),
    );
  }, [open, payment]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.amount || form.amount <= 0 || !form.paymentDate || !form.method) {
      setError(t('payments.form.requiredFields'));
      return;
    }
    setSubmitting(true);
    try {
      await onSave(form);
    } catch {
      setError(t('payments.form.saveFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm">
      <DialogTitle>{payment ? t('payments.form.editTitle') : t('payments.form.newTitle')}</DialogTitle>
      <form noValidate onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('payments.form.amount')}
                type="number"
                fullWidth
                required
                inputProps={{ min: 0, step: '0.01' }}
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('payments.form.paymentDate')}
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={form.paymentDate}
                onChange={(e) => setForm((p) => ({ ...p, paymentDate: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('payments.form.method')}
                select
                fullWidth
                required
                value={form.method}
                onChange={(e) => setForm((p) => ({ ...p, method: e.target.value as PaymentMethod }))}
              >
                <MenuItem value="cash">{t('payments.methodCash')}</MenuItem>
                <MenuItem value="bank_transfer">{t('payments.methodTransfer')}</MenuItem>
                <MenuItem value="card">{t('payments.methodCard')}</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label={t('payments.form.periodMonth')}
                type="number"
                fullWidth
                required
                inputProps={{ min: 1, max: 12 }}
                value={form.periodMonth}
                onChange={(e) => setForm((p) => ({ ...p, periodMonth: Number(e.target.value) }))}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label={t('payments.form.periodYear')}
                type="number"
                fullWidth
                required
                inputProps={{ min: 2000, max: 2100 }}
                value={form.periodYear}
                onChange={(e) => setForm((p) => ({ ...p, periodYear: Number(e.target.value) }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>{t('common.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
