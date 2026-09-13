import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import { authService } from '../services/authService';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await authService.requestPasswordReset(email);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 8 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Forgot your password?
        </Typography>
        {submitted ? (
          <Alert severity="success">
            If that email matches an account, a reset link was sent.
          </Alert>
        ) : (
          <>
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="contained" fullWidth disabled={submitting} sx={{ mt: 2 }}>
              {submitting ? 'Sending...' : 'Send reset link'}
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
