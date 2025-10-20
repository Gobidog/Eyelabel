import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '@/store';
import {
  fetchOpenAIKeyStatus,
  updateOpenAIKey,
  testAIConnection,
  clearStatus,
} from '@/store/settingsSlice';
import { useNotifications } from '@/utils/notifications';

export default function SettingsPage() {
  const notifications = useNotifications();
  const dispatch = useDispatch<AppDispatch>();
  const { keyStatus, testResult, isLoading, error, successMessage } = useSelector(
    (state: RootState) => state.settings
  );

  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    dispatch(fetchOpenAIKeyStatus());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        dispatch(clearStatus());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error, dispatch]);

  const handleUpdateKey = async () => {
    if (!apiKey) {
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      notifications.warning('Invalid OpenAI API key format. Keys should start with "sk-"');
      return;
    }

    await dispatch(updateOpenAIKey(apiKey));
    setApiKey('');
    dispatch(fetchOpenAIKeyStatus());
  };

  const handleTestConnection = async () => {
    await dispatch(testAIConnection());
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearStatus())}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => dispatch(clearStatus())}>
          {successMessage}
        </Alert>
      )}

      {/* OpenAI Configuration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">OpenAI API Configuration</Typography>
            {keyStatus?.configured && (
              <Chip
                label="Configured"
                color="success"
                size="small"
                icon={<CheckIcon />}
              />
            )}
            {keyStatus && !keyStatus.configured && (
              <Chip
                label="Not Configured"
                color="error"
                size="small"
                icon={<CloseIcon />}
              />
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure your OpenAI API key for AI-powered label generation features.
            The key is encrypted and stored securely in the database.
          </Typography>

          {keyStatus?.maskedKey && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Current API Key: <code>{keyStatus.maskedKey}</code>
            </Alert>
          )}

          <TextField
            fullWidth
            label="OpenAI API Key"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowKey(!showKey)}
                    edge="end"
                  >
                    {showKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleUpdateKey}
              disabled={isLoading || !apiKey}
            >
              {keyStatus?.configured ? 'Update API Key' : 'Save API Key'}
            </Button>

            {keyStatus?.configured && (
              <Button
                variant="outlined"
                onClick={handleTestConnection}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={20} /> : 'Test Connection'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Connection Test Results */}
      {testResult && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Connection Test Results
            </Typography>

            {testResult.success ? (
              <Alert severity="success">
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {testResult.message}
                </Typography>
                {testResult.details && (
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    Available Models: {testResult.details.models_count || 'N/A'}
                  </Typography>
                )}
              </Alert>
            ) : (
              <Alert severity="error">
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Connection Failed
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  {testResult.message}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Getting an OpenAI API Key
          </Typography>

          <Typography variant="body2" color="text.secondary" paragraph>
            1. Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Platform</a>
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            2. Sign in or create an account
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            3. Click "Create new secret key"
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            4. Copy the key and paste it above (keys start with "sk-")
          </Typography>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Security Note:</strong> Your API key is encrypted using AES-256-GCM encryption before
              being stored in the database. Never share your API key with anyone.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
