import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  FormControl,
  FormControlLabel,
  TextField,
  Switch,
  Button,
  Select,
  MenuItem,
  InputLabel,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Slider,
  FormHelperText
} from '@mui/material';
import { AppSettings, LLMSettings } from '../../shared/types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, maxHeight: '80vh', overflow: 'auto' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const SettingsView: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [llmSettings, setLLMSettings] = useState<LLMSettings | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [testing, setTesting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const app = await window.api.settings.getAppSettings();
        const llm = await window.api.settings.getLLMSettings();
        
        setAppSettings(app);
        setLLMSettings(llm);
      } catch (error) {
        console.error('Error loading settings:', error);
        setSnackbar({
          open: true,
          message: 'Error loading settings',
          severity: 'error'
        });
      }
    };
    
    loadSettings();
  }, []);
  
  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Save application settings
  const saveAppSettings = async () => {
    if (!appSettings) return;
    
    try {
      await window.api.settings.setAppSettings(appSettings);
      
      setSnackbar({
        open: true,
        message: 'Application settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving app settings:', error);
      setSnackbar({
        open: true,
        message: 'Error saving application settings',
        severity: 'error'
      });
    }
  };
  
  // Save LLM settings
  const saveLLMSettings = async () => {
    if (!llmSettings) return;
    
    try {
      await window.api.settings.setLLMSettings(llmSettings);
      
      setSnackbar({
        open: true,
        message: 'LLM settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving LLM settings:', error);
      setSnackbar({
        open: true,
        message: 'Error saving LLM settings',
        severity: 'error'
      });
    }
  };
  
  // Test LLM settings
  const testLLMSettings = async () => {
    if (!llmSettings) return;
    
    setTesting(true);
    
    try {
      const result = await window.api.settings.testLLM(llmSettings);
      
      setSnackbar({
        open: true,
        message: result.message,
        severity: result.success ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Error testing LLM settings:', error);
      setSnackbar({
        open: true,
        message: 'Error testing LLM settings',
        severity: 'error'
      });
    } finally {
      setTesting(false);
    }
  };
  
  // Update app setting
  const updateAppSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (!appSettings) return;
    
    setAppSettings({
      ...appSettings,
      [key]: value
    });
  };
  
  // Update LLM setting
  const updateLLMSetting = <K extends keyof LLMSettings>(key: K, value: LLMSettings[K]) => {
    if (!llmSettings) return;
    
    setLLMSettings({
      ...llmSettings,
      [key]: value
    });
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };
  
  // Handle WhatsApp logout
  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out of WhatsApp? You will need to scan the QR code again to reconnect.')) {
      setLoggingOut(true);
      
      try {
        const result = await window.api.whatsapp.logout();
        
        if (result.success) {
          setSnackbar({
            open: true,
            message: 'Logged out successfully. Please refresh the app to reconnect.',
            severity: 'success'
          });
          
          // Reload the app after 2 seconds
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setSnackbar({
            open: true,
            message: `Logout failed: ${result.message}`,
            severity: 'error'
          });
        }
      } catch (error: any) {
        console.error('Error during logout:', error);
        setSnackbar({
          open: true,
          message: `Logout error: ${error?.message || 'Unknown error'}`,
          severity: 'error'
        });
      } finally {
        setLoggingOut(false);
      }
    }
  };
  
  // Loading state
  if (!appSettings || !llmSettings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <Paper sx={{ width: '100%', height: '100%', overflow: 'auto', maxHeight: '100vh' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          centered
        >
          <Tab label="Application" />
          <Tab label="LLM Configuration" />
        </Tabs>
        
        {/* Application Settings Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom sx={{ color: 'red', fontWeight: 'bold' }}>
            APPLICATION SETTINGS - UPDATED VERSION
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={appSettings.startMinimized}
                  onChange={(e) => updateAppSetting('startMinimized', e.target.checked)}
                />
              }
              label="Start application minimized"
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={appSettings.enableNotifications}
                  onChange={(e) => updateAppSetting('enableNotifications', e.target.checked)}
                />
              }
              label="Enable desktop notifications"
            />
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={appSettings.autoReplyToAll}
                  onChange={(e) => updateAppSetting('autoReplyToAll', e.target.checked)}
                />
              }
              label="Auto-reply to all chats (override individual settings)"
            />
          </Box>
          
          <Box sx={{ mt: 4, border: '2px dashed #1976d2', padding: 2, borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Reply Delay Settings
            </Typography>
            <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
              <InputLabel id="reply-delay-label">Reply Delay Mode</InputLabel>
              <Select
                labelId="reply-delay-label"
                value={appSettings.replyDelay || 'instant'}
                label="Reply Delay Mode"
                onChange={(e) => updateAppSetting('replyDelay', e.target.value as 'instant' | 'fixed' | 'random')}
              >
                <MenuItem value="instant">Instant Reply</MenuItem>
                <MenuItem value="fixed">Fixed Delay</MenuItem>
                <MenuItem value="random">Random Delay</MenuItem>
              </Select>
              <FormHelperText>Controls how the assistant delays responses to seem more human-like</FormHelperText>
            </FormControl>
          
            {appSettings.replyDelay === 'fixed' && (
              <Box sx={{ mt: 2, display: 'block' }}>
                <Typography gutterBottom>
                  Fixed Delay: {appSettings.fixedDelaySeconds || 0} seconds
                </Typography>
                <Slider
                  value={appSettings.fixedDelaySeconds || 0}
                  onChange={(_, value) => updateAppSetting('fixedDelaySeconds', value as number)}
                  step={1}
                  marks
                  min={0}
                  max={30}
                  valueLabelDisplay="auto"
                />
                <FormHelperText>
                  Wait this many seconds before sending each auto-reply
                </FormHelperText>
              </Box>
            )}
            
            {appSettings.replyDelay === 'random' && (
              <>
                <Box sx={{ mt: 2, display: 'block' }}>
                  <Typography gutterBottom>
                    Minimum Delay: {appSettings.minDelaySeconds || 0} seconds
                  </Typography>
                  <Slider
                    value={appSettings.minDelaySeconds || 0}
                    onChange={(_, value) => updateAppSetting('minDelaySeconds', value as number)}
                    step={1}
                    marks
                    min={0}
                    max={30}
                    valueLabelDisplay="auto"
                  />
                </Box>
                <Box sx={{ mt: 2, display: 'block' }}>
                  <Typography gutterBottom>
                    Maximum Delay: {appSettings.maxDelaySeconds || 10} seconds
                  </Typography>
                  <Slider
                    value={appSettings.maxDelaySeconds || 10}
                    onChange={(_, value) => updateAppSetting('maxDelaySeconds', value as number)}
                    step={1}
                    marks
                    min={1}
                    max={60}
                    valueLabelDisplay="auto"
                  />
                  <FormHelperText>
                    Wait a random amount of time between min and max seconds before sending each auto-reply
                  </FormHelperText>
                </Box>
              </>
            )}
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={appSettings.startupOnBoot}
                  onChange={(e) => updateAppSetting('startupOnBoot', e.target.checked)}
                />
              }
              label="Start application on system boot"
            />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
              <InputLabel id="theme-label">Theme</InputLabel>
              <Select
                labelId="theme-label"
                value={appSettings.theme}
                label="Theme"
                onChange={(e) => updateAppSetting('theme', e.target.value as 'light' | 'dark' | 'system')}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="system">System</MenuItem>
              </Select>
              <FormHelperText>Theme changes will take effect after restart</FormHelperText>
            </FormControl>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Media Download Path"
              variant="outlined"
              value={appSettings.mediaDownloadPath}
              onChange={(e) => updateAppSetting('mediaDownloadPath', e.target.value)}
              helperText="Path where media files will be saved"
            />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={appSettings.debugMode}
                  onChange={(e) => updateAppSetting('debugMode', e.target.checked)}
                />
              }
              label="Debug Mode"
            />
            <FormHelperText>Toggle developer tools and enable detailed logging</FormHelperText>
          </Box>
          
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={saveAppSettings}
            >
              Save Settings
            </Button>
            
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleLogout}
              disabled={loggingOut}
              startIcon={loggingOut ? <CircularProgress size={20} color="error" /> : undefined}
            >
              {loggingOut ? 'Logging Out...' : 'Logout from WhatsApp'}
            </Button>
            
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={() => {
                console.log('Current app settings:', appSettings);
                alert(JSON.stringify(appSettings, null, 2));
              }}
            >
              Debug Settings
            </Button>
          </Box>
        </TabPanel>
        
        {/* LLM Settings Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            LLM Configuration
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="provider-label">LLM Provider</InputLabel>
              <Select
                labelId="provider-label"
                value={llmSettings.provider}
                label="LLM Provider"
                onChange={(e) => updateLLMSetting('provider', e.target.value as 'openai' | 'local' | 'custom')}
              >
                <MenuItem value="openai">OpenAI</MenuItem>
                <MenuItem value="local">Local (Ollama)</MenuItem>
                <MenuItem value="custom">Custom Endpoint</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          {llmSettings.provider === 'openai' && (
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="OpenAI API Key"
                variant="outlined"
                type="password"
                value={llmSettings.apiKey || ''}
                onChange={(e) => updateLLMSetting('apiKey', e.target.value)}
                helperText="Enter your OpenAI API key"
              />
            </Box>
          )}
          
          {(llmSettings.provider === 'local' || llmSettings.provider === 'custom') && (
            <Box sx={{ mt: 3 }}>
              <TextField
                fullWidth
                label="API Endpoint"
                variant="outlined"
                value={llmSettings.apiEndpoint || ''}
                onChange={(e) => updateLLMSetting('apiEndpoint', e.target.value)}
                helperText={
                  llmSettings.provider === 'local' 
                    ? "For Ollama, typically http://localhost:11434/v1/chat/completions" 
                    : "Enter the full URL to the API endpoint"
                }
              />
            </Box>
          )}
          
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Model"
              variant="outlined"
              value={llmSettings.model}
              onChange={(e) => updateLLMSetting('model', e.target.value)}
              helperText={
                llmSettings.provider === 'openai' 
                  ? "For example: gpt-3.5-turbo, gpt-4" 
                  : llmSettings.provider === 'local'
                    ? "For example: llama2, mistral, etc."
                    : "The model identifier for your custom endpoint"
              }
            />
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>Temperature: {llmSettings.temperature}</Typography>
            <Slider
              value={llmSettings.temperature}
              onChange={(_, value) => updateLLMSetting('temperature', value as number)}
              step={0.1}
              marks
              min={0}
              max={2}
              valueLabelDisplay="auto"
            />
            <FormHelperText>
              Lower values (0-0.3) are more deterministic, higher values (0.7-1.0) are more creative
            </FormHelperText>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <FormControl fullWidth>
              <TextField
                fullWidth
                label="System Prompt"
                multiline
                rows={4}
                variant="outlined"
                value={llmSettings.systemPrompt}
                onChange={(e) => updateLLMSetting('systemPrompt', e.target.value)}
                helperText="Instructions that define how the AI assistant should behave"
              />
            </FormControl>
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <Typography gutterBottom>
              Message History Length: {llmSettings.maxHistoryLength} messages
            </Typography>
            <Slider
              value={llmSettings.maxHistoryLength}
              onChange={(_, value) => updateLLMSetting('maxHistoryLength', value as number)}
              step={1}
              marks
              min={1}
              max={20}
              valueLabelDisplay="auto"
            />
            <FormHelperText>
              Number of recent messages to include in conversation context
            </FormHelperText>
          </Box>
          
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={saveLLMSettings}
            >
              Save Settings
            </Button>
            
            <Button 
              variant="outlined" 
              color="secondary"
              onClick={testLLMSettings}
              disabled={testing}
              startIcon={testing ? <CircularProgress size={20} /> : undefined}
            >
              {testing ? 'Testing...' : 'Test Settings'}
            </Button>
          </Box>
        </TabPanel>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsView;