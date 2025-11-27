import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleBack = () => {
    signOut();
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
          Acesso Negado
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Você não tem permissão para acessar esta página.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleBack}
          sx={{ mt: 3 }}
        >
          Voltar para o Login
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized; 