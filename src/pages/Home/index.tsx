import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate(user.profile === 'admin' ? '/admin/dashboard' : '/usuario/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            LinkSpace
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            Gerencie e reserve espaços compartilhados de forma simples e eficiente
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleGetStarted}
            sx={{ mt: 4 }}
          >
            Começar Agora
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Recursos
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Reservas Simplificadas
              </Typography>
              <Typography>
                Faça reservas de espaços de forma rápida e intuitiva, com confirmação imediata.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Gestão Eficiente
              </Typography>
              <Typography>
                Gerencie seus espaços e reservas com facilidade, mantendo tudo organizado.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h5" component="h3" gutterBottom>
                Notificações em Tempo Real
              </Typography>
              <Typography>
                Receba atualizações sobre suas reservas e espaços em tempo real.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'grey.100',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Pronto para começar?
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Junte-se a nós e comece a gerenciar seus espaços de forma mais eficiente.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGetStarted}
            sx={{ mt: 2 }}
          >
            Criar Conta
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 