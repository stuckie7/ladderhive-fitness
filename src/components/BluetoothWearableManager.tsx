import React, { useState, useEffect } from 'react';
import { useBluetoothWearable } from '../hooks/useBluetoothWearable';
import { WearableDevice, FitnessData } from '../types/wearable';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Divider,
  Chip,
  Snackbar,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import {
  Bluetooth as BluetoothIcon,
  BluetoothConnected as BluetoothConnectedIcon,
  BluetoothDisabled as BluetoothDisabledIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const BluetoothWearableManager: React.FC = () => {
  const {
    isSupported,
    status,
    error,
    devices,
    connectedDevice,
    fitnessData,
    requestDevice,
    connect,
    disconnect,
    refreshDevices,
    clearError,
  } = useBluetoothWearable();
  
  const [showConnectSuccess, setShowConnectSuccess] = useState(false);
  const [showDisconnectSuccess, setShowDisconnectSuccess] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<WearableDevice | null>(null);
  
  // Auto-select the connected device
  useEffect(() => {
    if (connectedDevice) {
      setSelectedDevice(connectedDevice);
    }
  }, [connectedDevice]);
  
  // Handle device selection
  const handleDeviceSelect = (device: WearableDevice) => {
    setSelectedDevice(device);
  };
  
  // Handle connect button click
  const handleConnect = async () => {
    if (!selectedDevice) return;
    
    try {
      if (selectedDevice.connected) {
        await disconnect(selectedDevice.id);
        setShowDisconnectSuccess(true);
      } else {
        await connect(selectedDevice.id);
        setShowConnectSuccess(true);
      }
    } catch (err) {
      console.error('Error toggling device connection:', err);
    }
  };
  
  // Handle request new device
  const handleRequestDevice = async () => {
    try {
      await requestDevice();
      await refreshDevices();
    } catch (err) {
      console.error('Error requesting device:', err);
    }
  };
  
  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'success.main';
      case 'connecting':
      case 'searching':
        return 'info.main';
      case 'error':
        return 'error.main';
      case 'disconnected':
        return 'warning.main';
      default:
        return 'text.secondary';
    }
  };
  
  // Get status icon
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <BluetoothConnectedIcon color="success" />;
      case 'connecting':
      case 'searching':
        return <CircularProgress size={20} />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'disconnected':
        return <BluetoothDisabledIcon color="warning" />;
      default:
        return <BluetoothIcon color="action" />;
    }
  };
  
  // Format last sync time
  const formatLastSync = (date?: Date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };
  
  // Get device type label
  const getDeviceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'heart_rate_monitor': 'Heart Rate Monitor',
      'fitness_band': 'Fitness Band',
      'smartwatch': 'Smartwatch',
      'smart_scale': 'Smart Scale',
      'cycling_sensor': 'Cycling Sensor',
      'running_pod': 'Running Pod',
      'strength_trainer': 'Strength Trainer',
    };
    return labels[type] || type;
  };
  
  // Get latest fitness data
  const getLatestData = (): Partial<FitnessData> => {
    if (fitnessData.length === 0) return {};
    return fitnessData[fitnessData.length - 1];
  };
  
  // Render device list item
  const renderDeviceItem = (device: WearableDevice) => (
    <ListItem
      key={device.id}
      onClick={() => handleDeviceSelect(device)}
      sx={{ 
        cursor: 'pointer',
        bgcolor: selectedDevice?.id === device.id ? 'action.selected' : 'transparent'
      }}
    >
      <ListItemText
        primary={device.name || 'Unknown Device'}
        secondary={
          <>
            <span>{getDeviceTypeLabel(device.type)}</span>
            {device.connected && (
              <Chip 
                label="Connected" 
                size="small" 
                color="success" 
                sx={{ ml: 1 }} 
              />
            )}
          </>
        }
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" onClick={() => handleDeviceSelect(device)}>
          {device.id === selectedDevice?.id ? <CheckCircleIcon color="primary" /> : null}
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
  
  // Render fitness metrics
  const renderMetrics = () => {
    const data = getLatestData();
    
    if (Object.keys(data).length === 0) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No data available. Connect a device to see metrics.
          </Typography>
        </Box>
      );
    }
    
    return (
      <Grid container spacing={2} sx={{ p: 2 }}>
        {data.heartRate !== undefined && (
          <Grid sx={{ gridTemplateColumns: { xs: 6, sm: 4 } }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {data.heartRate}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Heart Rate (BPM)
              </Typography>
            </Paper>
          </Grid>
        )}
        
        {data.steps !== undefined && (
          <Grid sx={{ gridTemplateColumns: { xs: 6, sm: 4 } }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4">
                {data.steps.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Steps
              </Typography>
            </Paper>
          </Grid>
        )}
        
        {data.caloriesBurned !== undefined && (
          <Grid sx={{ gridTemplateColumns: { xs: 6, sm: 4 } }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4">
                {data.caloriesBurned}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Calories Burned
              </Typography>
            </Paper>
          </Grid>
        )}
        
        {data.distance !== undefined && (
          <Grid sx={{ gridTemplateColumns: { xs: 6, sm: 4 } }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">
                {(data.distance / 1000).toFixed(2)} km
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Distance
              </Typography>
            </Paper>
          </Grid>
        )}
        
        {data.bloodOxygen !== undefined && (
          <Grid sx={{ gridTemplateColumns: { xs: 6, sm: 4 } }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">
                {data.bloodOxygen}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Blood Oxygen
              </Typography>
            </Paper>
          </Grid>
        )}
        
        {data.weight !== undefined && (
          <Grid sx={{ gridTemplateColumns: { xs: 6, sm: 4 } }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">
                {data.weight} kg
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Weight
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  };
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <BluetoothIcon sx={{ mr: 1 }} />
            <Typography variant="h5" component="h2">
              Bluetooth Wearable Manager
            </Typography>
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
              <Box sx={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                bgcolor: getStatusColor(),
                mr: 1 
              }} />
              <Typography variant="body2" color="text.secondary">
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Typography>
            </Box>
          </Box>
          
          {!isSupported ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Web Bluetooth is not supported in your browser. Please use Chrome for Android, 
              Chrome OS, macOS, or Windows 10 (with flags).
            </Alert>
          ) : (
            <>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<BluetoothIcon />}
                  onClick={handleRequestDevice}
                  disabled={status === 'searching' || status === 'connecting'}
                >
                  {status === 'searching' ? 'Searching...' : 'Pair New Device'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={refreshDevices}
                  disabled={status === 'searching' || status === 'connecting'}
                >
                  Refresh
                </Button>
                
                {selectedDevice && (
                  <Button
                    variant={selectedDevice.connected ? "outlined" : "contained"}
                    color={selectedDevice.connected ? "error" : "primary"}
                    startIcon={
                      selectedDevice.connected ? (
                        <BluetoothConnectedIcon />
                      ) : (
                        <BluetoothIcon />
                      )
                    }
                    onClick={handleConnect}
                    disabled={
                      status === 'searching' || 
                      status === 'connecting' ||
                      (status === 'connected' && !selectedDevice.connected)
                    }
                    sx={{ ml: 'auto' }}
                  >
                    {selectedDevice.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                )}
              </Box>
              
              <Grid container spacing={3}>
                <Grid sx={{ gridTemplateColumns: { xs: 12, md: 4 } }}>
                  <Card variant="outlined">
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'background.default',
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}>
                      <Typography variant="subtitle1">Paired Devices</Typography>
                    </Box>
                    <List dense disablePadding>
                      {devices.length === 0 ? (
                        <ListItem>
                          <ListItemText 
                            primary="No devices found" 
                            secondary="Pair a device to get started"
                          />
                        </ListItem>
                      ) : (
                        devices.map(renderDeviceItem)
                      )}
                    </List>
                  </Card>
                </Grid>
                
                <Grid sx={{ gridTemplateColumns: { xs: 12, md: 8 } }}>
                  <Card variant="outlined">
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: 'background.default',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="subtitle1">
                        {selectedDevice ? selectedDevice.name : 'No device selected'}
                      </Typography>
                      {selectedDevice?.lastSync && (
                        <Chip 
                          size="small"
                          label={`Last sync: ${formatLastSync(selectedDevice.lastSync)}`}
                          icon={<InfoIcon fontSize="small" />}
                        />
                      )}
                    </Box>
                    
                    <Box sx={{ minHeight: 200 }}>
                      {selectedDevice ? (
                        <>
                          <Box sx={{ p: 2 }}>
                            <Grid container spacing={2}>
                              <Grid sx={{ gridTemplateColumns: { xs: 6 } }}>
                                <Typography variant="body2" color="text.secondary">
                                  Type
                                </Typography>
                                <Typography>
                                  {getDeviceTypeLabel(selectedDevice.type)}
                                </Typography>
                              </Grid>
                              
                              <Grid sx={{ gridTemplateColumns: { xs: 6 } }}>
                                <Typography variant="body2" color="text.secondary">
                                  Status
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {getStatusIcon()}
                                  <Typography sx={{ ml: 1 }}>
                                    {selectedDevice.connected ? 'Connected' : 'Disconnected'}
                                  </Typography>
                                </Box>
                              </Grid>
                              
                              {selectedDevice.batteryLevel !== undefined && (
                                <Grid sx={{ gridTemplateColumns: { xs: 12 } }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Battery Level
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                      <Box 
                                        sx={{
                                          height: 8,
                                          width: '100%',
                                          backgroundColor: 'divider',
                                          borderRadius: 4,
                                          overflow: 'hidden'
                                        }}
                                      >
                                        <Box 
                                          sx={{
                                            height: '100%',
                                            width: `${selectedDevice.batteryLevel}%`,
                                            backgroundColor: selectedDevice.batteryLevel < 20 
                                              ? 'error.main' 
                                              : selectedDevice.batteryLevel < 50 
                                                ? 'warning.main' 
                                                : 'success.main',
                                            transition: 'width 0.3s ease-in-out'
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      {selectedDevice.batteryLevel}%
                                    </Typography>
                                  </Box>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                          
                          <Divider />
                          
                          <Box>
                            <Typography variant="subtitle2" sx={{ p: 2, pb: 1 }}>
                              Fitness Metrics
                            </Typography>
                            {renderMetrics()}
                          </Box>
                        </>
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          p: 4,
                          textAlign: 'center',
                          height: '100%',
                          color: 'text.secondary'
                        }}>
                          <BluetoothIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                          <Typography variant="body1">
                            Select a device to view details
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Or pair a new device to get started
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Connection Status Snackbars */}
      <Snackbar
        open={showConnectSuccess}
        autoHideDuration={3000}
        onClose={() => setShowConnectSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          variant="filled" 
          onClose={() => setShowConnectSuccess(false)}
          icon={<CheckCircleIcon fontSize="inherit" />}
        >
          Successfully connected to {selectedDevice?.name}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={showDisconnectSuccess}
        autoHideDuration={3000}
        onClose={() => setShowDisconnectSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="info" 
          variant="filled" 
          onClose={() => setShowDisconnectSuccess(false)}
          icon={<InfoIcon fontSize="inherit" />}
        >
          Successfully disconnected from {selectedDevice?.name}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          variant="filled" 
          onClose={clearError}
          icon={<WarningIcon fontSize="inherit" />}
        >
          {error?.message || 'An unknown error occurred'}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BluetoothWearableManager;
