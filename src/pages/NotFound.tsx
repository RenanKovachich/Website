import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography component="h1" variant="h4" color="error" gutterBottom>
          404
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Página não encontrada
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          A página que você está procurando não existe ou foi movida.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBack}
          sx={{ mt: 3 }}
        >
          Voltar
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound; 