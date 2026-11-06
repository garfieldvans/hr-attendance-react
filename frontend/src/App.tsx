import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './hooks/use-auth';
import { AttendancePage } from './pages/AttendancePage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { MonitoringPage } from './pages/MonitoringPage';

export const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route
              path="absensi"
              element={
                <ProtectedRoute roles={['EMPLOYEE']}>
                  <AttendancePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="monitoring"
              element={
                <ProtectedRoute roles={['HRD']}>
                  <MonitoringPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="karyawan"
              element={
                <ProtectedRoute roles={['HRD']}>
                  <EmployeesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="karyawan/:id"
              element={
                <ProtectedRoute roles={['HRD']}>
                  <EmployeeDetailPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
