import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

/** Placeholder landing page for the authenticated admin (real dashboard comes in US-009). */
function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Gym Management
      </Typography>
      <Typography>Logged in as {user?.email}</Typography>
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={() => logout()}>
          Log out
        </Button>
      </Box>
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
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
