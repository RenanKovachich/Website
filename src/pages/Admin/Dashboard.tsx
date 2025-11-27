import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { User, Space, Reservation } from '../../types';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, spacesData, reservationsData] = await Promise.all([
          apiService.getUsers(),
          apiService.getSpaces(),
          apiService.getReservations(),
        ]);

        setUsers(usersData);
        setSpaces(spacesData);
        setReservations(reservationsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, []);

  const stats = [
    {
      title: 'Total de Usuários',
      value: users.length,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
    },
    {
      title: 'Total de Espaços',
      value: spaces.length,
      icon: <BusinessIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
    },
    {
      title: 'Total de Reservas',
      value: reservations.length,
      icon: <EventIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Últimas Reservas
            </Typography>
            {reservations.slice(0, 5).map((reservation) => (
              <Box key={reservation.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  {reservation.space?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(reservation.startDate).toLocaleDateString()} -{' '}
                  {new Date(reservation.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {reservation.user?.name}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Espaços Mais Populares
            </Typography>
            {spaces.slice(0, 5).map((space) => (
              <Box key={space.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle1">{space.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Capacidade: {space.capacity} pessoas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tipo: {space.type}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 