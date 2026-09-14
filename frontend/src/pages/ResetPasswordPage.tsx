import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import { PreLoginHeader } from '../components/PreLoginHeader';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError(t('auth.reset.tooShort'));
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword(token, newPassword);
      navigate('/login');
    } catch {
      setError(t('auth.reset.invalidToken'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 6 }}>
        <PreLoginHeader />
      </Box>
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('auth.reset.title')}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label={t('auth.reset.newPassword')}
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={{ mt: 2 }}>
          {submitting ? t('auth.reset.submitting') : t('auth.reset.submit')}
        </Button>
      </Box>
    </Container>
  );
}
