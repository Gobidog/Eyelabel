import { AppBar, Toolbar, Typography, Button, Box, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/authSlice';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{ gap: 2 }}>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            Label Creation Tool
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Button color="inherit" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button color="inherit" onClick={() => navigate('/products')}>
              Products
            </Button>
            <Button color="inherit" onClick={() => navigate('/labels')}>
              Labels
            </Button>
            <Button color="inherit" onClick={() => navigate('/labels/batch')}>
              Batch Labels
            </Button>
            <Button color="inherit" onClick={() => navigate('/templates')}>
              Templates
            </Button>
            {user?.role === 'admin' && (
              <Button color="inherit" onClick={() => navigate('/settings')}>
                Settings
              </Button>
            )}
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ ml: 3 }}>
            {user && (
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {user.firstName} {user.lastName} ({user.role})
              </Typography>
            )}
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: '#f5f5f5' }}>
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 2,
          px: 3,
          mt: 'auto',
          backgroundColor: '#f5f5f5',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} EYE LIGHTING AUSTRALIA - Label Creation Tool
        </Typography>
      </Box>
    </Box>
  );
};
