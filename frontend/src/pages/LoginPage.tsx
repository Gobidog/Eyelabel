import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { AppDispatch, RootState } from '@/store';
import { login, clearAuthError } from '@/store/authSlice';

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const state = location.state as LocationState | undefined;
      const redirectTo = state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardHeader title="Sign in to Label Creation Tool" subheader="Enter your company credentials" />
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
              autoComplete="email"
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
              autoComplete="current-password"
            />

            <Button type="submit" variant="contained" disabled={isLoading} fullWidth>
              {isLoading ? 'Signing in…' : 'Sign In'}
            </Button>

            <Typography variant="body2" color="text.secondary" align="center">
              Use the credentials provisioned by EYE Lighting Australia.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
