import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Button, Container, Stack, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ClientsListPage } from './pages/ClientsListPage';
import { ClientFormPage } from './pages/ClientFormPage';

/** Placeholder landing page for the authenticated admin (real dashboard comes in US-009). */
function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Gym Management
      </Typography>
      <Typography gutterBottom>Logged in as {user?.email}</Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={() => navigate('/clients')}>
          Clients
        </Button>
        <Button variant="outlined" onClick={() => logout()}>
          Log out
        </Button>
      </Stack>
    </Container>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsListPage />} />
            <Route path="/clients/new" element={<ClientFormPage />} />
            <Route path="/clients/:id/edit" element={<ClientFormPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
