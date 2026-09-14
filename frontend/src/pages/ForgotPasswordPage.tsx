import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import { PreLoginHeader } from '../components/PreLoginHeader';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authService.requestPasswordReset(email);
      setSubmitted(true);
    } catch {
      setError(t('auth.forgot.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 6 }}>
        <PreLoginHeader />
      </Box>
      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('auth.forgot.title')}
        </Typography>
        {submitted ? (
          <Alert severity="success">{t('auth.forgot.sent')}</Alert>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <TextField
              label={t('auth.forgot.email')}
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={{ mt: 2 }}>
              {submitting ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
