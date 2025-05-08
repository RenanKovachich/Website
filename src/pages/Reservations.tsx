import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  RemoveRedEye as ViewIcon,
} from '@mui/icons-material';

const Reservations: React.FC = () => {
  const reservations = [
    {
      id: '1',
      space: 'Sala de Reunião A',
      date: '15/03/2024',
      startTime: '09:00',
      endTime: '11:00',
      status: 'confirmed',
      user: 'João Silva',
      price: 160.0,
    },
    {
      id: '2',
      space: 'Escritório Compartilhado',
      date: '16/03/2024',
      startTime: '14:00',
      endTime: '18:00',
      status: 'pending',
      user: 'Maria Santos',
      price: 200.0,
    },
    {
      id: '3',
      space: 'Auditório Principal',
      date: '17/03/2024',
      startTime: '10:00',
      endTime: '12:00',
      status: 'cancelled',
      user: 'Pedro Oliveira',
      price: 400.0,
    },
  ];

  const getStatusChip = (status: string) => {
    const statusConfig = {
      confirmed: { color: 'success', label: 'Confirmada' },
      pending: { color: 'warning', label: 'Pendente' },
      cancelled: { color: 'error', label: 'Cancelada' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Chip
        label={config.label}
        color={config.color as 'success' | 'warning' | 'error'}
        size="small"
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Reservas
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Espaço</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Horário</TableCell>
              <TableCell>Usuário</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>{reservation.space}</TableCell>
                <TableCell>{reservation.date}</TableCell>
                <TableCell>{`${reservation.startTime} - ${reservation.endTime}`}</TableCell>
                <TableCell>{reservation.user}</TableCell>
                <TableCell>R$ {reservation.price.toFixed(2)}</TableCell>
                <TableCell>{getStatusChip(reservation.status)}</TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Tooltip title="Visualizar">
                      <IconButton
                        size="small"
                        onClick={() => console.log('Visualizar', reservation.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {reservation.status === 'pending' && (
                      <>
                        <Tooltip title="Confirmar">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => console.log('Confirmar', reservation.id)}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancelar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => console.log('Cancelar', reservation.id)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Reservations; 