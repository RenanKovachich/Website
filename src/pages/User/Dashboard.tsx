import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Reservation, Space } from '../../types';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [reservationsResponse, spacesResponse] = await Promise.all([
          apiService.getReservations(),
          apiService.getSpaces(),
        ]);

        const userReservations = reservationsResponse.filter(
          (r: Reservation) => r.userId === user?.id
        );
        setReservations(userReservations);
        setSpaces(spacesResponse);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadData();
  }, [user?.id]);

  const upcomingReservations = reservations
    .filter((r) => new Date(r.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const popularSpaces = spaces
    .sort((a, b) => b.capacity - a.capacity)
    .slice(0, 5);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bem-vindo, {user?.name}!
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Próximas Reservas
              </Typography>
              <List>
                {upcomingReservations.map((reservation) => (
                  <React.Fragment key={reservation.id}>
                    <ListItem>
                      <ListItemText
                        primary={spaces.find((s) => s.id === reservation.spaceId)?.name}
                        secondary={`${new Date(reservation.startDate).toLocaleDateString()} - ${new Date(
                          reservation.startDate
                        ).toLocaleTimeString()}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
                {upcomingReservations.length === 0 && (
                  <ListItem>
                    <ListItemText primary="Nenhuma reserva agendada" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Espaços Populares
              </Typography>
              <List>
                {popularSpaces.map((space) => (
                  <React.Fragment key={space.id}>
                    <ListItem>
                      <ListItemText
                        primary={space.name}
                        secondary={`Capacidade: ${space.capacity} pessoas`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserDashboard; 