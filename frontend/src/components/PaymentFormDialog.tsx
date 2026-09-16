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

// Numeric fields are kept as strings so the inputs can be cleared (an empty
// field is not coerced back to 0); they are parsed to numbers on submit.
interface FormState {
  amount: string;
  paymentDate: string;
  method: PaymentMethod;
  periodMonth: string;
  periodYear: string;
}

function emptyForm(): FormState {
  return {
    amount: '',
    paymentDate: now.toISOString().slice(0, 10),
    method: 'cash',
    periodMonth: String(now.getMonth() + 1),
    periodYear: String(now.getFullYear()),
  };
}

export function PaymentFormDialog({ open, payment, onCancel, onSave }: PaymentFormDialogProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      payment
        ? {
            amount: String(payment.amount),
            paymentDate: payment.paymentDate.slice(0, 10),
            method: payment.method,
            periodMonth: String(payment.periodMonth),
            periodYear: String(payment.periodYear),
          }
        : emptyForm(),
    );
  }, [open, payment]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    const amount = Number(form.amount);
    const periodMonth = Number(form.periodMonth);
    const periodYear = Number(form.periodYear);
    if (
      form.amount.trim() === '' ||
      Number.isNaN(amount) ||
      amount <= 0 ||
      !form.paymentDate ||
      !form.method ||
      !Number.isInteger(periodMonth) ||
      periodMonth < 1 ||
      periodMonth > 12 ||
      !Number.isInteger(periodYear) ||
      periodYear < 2000 ||
      periodYear > 2100
    ) {
      setError(t('payments.form.requiredFields'));
      return;
    }
    setSubmitting(true);
    try {
      await onSave({
        amount,
        paymentDate: form.paymentDate,
        method: form.method,
        periodMonth,
        periodYear,
      });
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
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
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
                onChange={(e) => setForm((p) => ({ ...p, periodMonth: e.target.value }))}
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
                onChange={(e) => setForm((p) => ({ ...p, periodYear: e.target.value }))}
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
