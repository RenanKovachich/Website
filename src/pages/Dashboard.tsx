import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import {
  MeetingRoom as MeetingRoomIcon,
  Event as EventIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Espaços Ativos',
      value: '12',
      icon: <MeetingRoomIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
      title: 'Reservas do Mês',
      value: '48',
      icon: <EventIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    },
    {
      title: 'Faturamento',
      value: 'R$ 15.750,00',
      icon: <AttachMoneyIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
    },
    {
      title: 'Usuários Ativos',
      value: '156',
      icon: <PeopleIcon sx={{ fontSize: 40, color: 'info.main' }} />,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Cards de Estatísticas */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>{stat.icon}</Box>
                <Typography variant="h5" component="div">
                  {stat.value}
                </Typography>
                <Typography color="text.secondary">{stat.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Gráfico de Ocupação */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <CardHeader title="Ocupação dos Espaços" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Gráfico de ocupação será implementado aqui
              </Typography>
            </CardContent>
          </Paper>
        </Grid>

        {/* Próximas Reservas */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <CardHeader title="Próximas Reservas" />
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Lista de próximas reservas será implementada aqui
              </Typography>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 