import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { Provider, useDispatch } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import { store, AppDispatch } from './store';
import { theme } from './theme';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { initializeAuth } from './store/authSlice';

// Lazy load page components for code splitting
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductImportPage = lazy(() => import('./pages/ProductImportPage'));
const LabelsPage = lazy(() => import('./pages/LabelsPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const TemplateEditorPage = lazy(() => import('./pages/TemplateEditorPage'));
const LabelEditorPage = lazy(() => import('./pages/KonvaLabelEditor'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

// Loading fallback component
const PageLoader = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

const AppShell = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/products"
            element={
              <PrivateRoute>
                <Layout>
                  <ProductsPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/products/import"
            element={
              <PrivateRoute>
                <Layout>
                  <ProductImportPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/labels"
            element={
              <PrivateRoute>
                <Layout>
                  <LabelsPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/labels/create"
            element={
              <PrivateRoute>
                <Layout>
                  <LabelEditorPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/labels/edit/:labelId"
            element={
              <PrivateRoute>
                <Layout>
                  <LabelEditorPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route path="/labels/batch" element={<Navigate to="/products/import" replace />} />

          <Route
            path="/templates"
            element={
              <PrivateRoute>
                <Layout>
                  <TemplatesPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/templates/create"
            element={
              <PrivateRoute>
                <Layout>
                  <TemplateEditorPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/templates/edit/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <TemplateEditorPage />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </PrivateRoute>
            }
          />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
      >
        <AppShell />
      </SnackbarProvider>
    </Provider>
  );
}

export default App;
