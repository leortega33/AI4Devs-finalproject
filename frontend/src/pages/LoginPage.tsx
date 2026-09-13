import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('auth.login.requiredFields'));
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError(t('errors.INVALID_CREDENTIALS'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 8 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {t('auth.login.title')}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          label={t('auth.login.email')}
          type="email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label={t('auth.login.password')}
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={{ mt: 2 }}>
          {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
        </Button>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link to="/forgot-password">{t('auth.login.forgotPassword')}</Link>
        </Box>
      </Box>
    </Container>
  );
}
