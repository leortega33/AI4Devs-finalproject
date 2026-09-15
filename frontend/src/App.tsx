import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ClientsListPage } from './pages/ClientsListPage';
import { ClientFormPage } from './pages/ClientFormPage';
import { MedicalRecordPage } from './pages/MedicalRecordPage';

/** Placeholder landing page for the authenticated admin (real dashboard comes in US-009). */
function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <Stack spacing={2} alignItems="flex-start">
      <Typography variant="h4">{t('auth.dashboard.title')}</Typography>
      <Typography>{t('auth.dashboard.loggedInAs', { email: user?.email })}</Typography>
      <Button variant="contained" onClick={() => navigate('/clients')}>
        {t('auth.dashboard.clients')}
      </Button>
    </Stack>
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
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientsListPage />} />
              <Route path="/clients/new" element={<ClientFormPage />} />
              <Route path="/clients/:id/edit" element={<ClientFormPage />} />
              <Route path="/clients/:clientId/medical-record" element={<MedicalRecordPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
