import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsListPage } from './pages/ClientsListPage';
import { ClientFormPage } from './pages/ClientFormPage';
import { MedicalRecordPage } from './pages/MedicalRecordPage';
import { ClientRoutinePage } from './pages/ClientRoutinePage';
import { ClientPaymentsPage } from './pages/ClientPaymentsPage';
import { ClientAttendancePage } from './pages/ClientAttendancePage';
import { ClientProgressPage } from './pages/ClientProgressPage';
import { ClientNutritionPage } from './pages/ClientNutritionPage';
import { ExerciseCatalogPage } from './pages/ExerciseCatalogPage';
import { ExerciseFormPage } from './pages/ExerciseFormPage';
import { RoutineTemplatesListPage } from './pages/RoutineTemplatesListPage';
import { RoutineTemplateBuilderPage } from './pages/RoutineTemplateBuilderPage';

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
              <Route path="/clients/:clientId/routine" element={<ClientRoutinePage />} />
              <Route path="/clients/:clientId/payments" element={<ClientPaymentsPage />} />
              <Route path="/clients/:clientId/attendance" element={<ClientAttendancePage />} />
              <Route path="/clients/:clientId/progress" element={<ClientProgressPage />} />
              <Route path="/clients/:clientId/nutrition" element={<ClientNutritionPage />} />
              <Route path="/exercises" element={<ExerciseCatalogPage />} />
              <Route path="/exercises/new" element={<ExerciseFormPage />} />
              <Route path="/exercises/:id/edit" element={<ExerciseFormPage />} />
              <Route path="/routines" element={<RoutineTemplatesListPage />} />
              <Route path="/routines/new" element={<RoutineTemplateBuilderPage />} />
              <Route path="/routines/:id/edit" element={<RoutineTemplateBuilderPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
