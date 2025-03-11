import React from 'react';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import QRCode from 'qrcode.react';

interface QRCodeViewProps {
  qrCode: string;
}

const QRCodeView: React.FC<QRCodeViewProps> = ({ qrCode }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: 'calc(100vh - 64px)',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography variant="h5" gutterBottom>
        Connect to WhatsApp
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, maxWidth: 500 }}>
        To use WhatsApp LLM Assistant, scan this QR code with your phone's WhatsApp app.
        Open WhatsApp on your phone, tap Menu or Settings and select WhatsApp Web.
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, bgcolor: 'white' }}>
        {qrCode ? (
          <QRCode value={qrCode} size={256} />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: 256, width: 256, justifyContent: 'center' }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Initializing WhatsApp...
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              This may take a few seconds
            </Typography>
          </Box>
        )}
      </Paper>
      
      <Typography variant="body2" color="text.secondary" sx={{ mt: 4, maxWidth: 500 }}>
        This will link your WhatsApp account to this application.
        All your messages will remain private and secure.
      </Typography>
    </Box>
  );
};

export default QRCodeView;