import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import { useSnackbar } from 'notistack';
import { apiService } from '../../services/api';
import { Space } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ReservationFormData {
  startDate: Date | null;
  endDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  participants: number;
  description: string;
}

const UserSpaces: React.FC = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [openReservationDialog, setOpenReservationDialog] = useState(false);
  const [formData, setFormData] = useState<ReservationFormData>({
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    participants: 1,
    description: '',
  });

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      const spacesData = await apiService.getSpaces();
      setSpaces(spacesData.filter(space => space.status === 'active'));
    } catch (error) {
      console.error('Erro ao carregar espaços:', error);
    }
  };

  const handleOpenReservationDialog = (space: Space) => {
    setSelectedSpace(space);
    setFormData({
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      participants: 1,
      description: '',
    });
    setOpenReservationDialog(true);
  };

  const handleCloseReservationDialog = () => {
    setOpenReservationDialog(false);
    setSelectedSpace(null);
    setFormData({
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      participants: 1,
      description: '',
    });
  };

  const handleSubmitReservation = async () => {
    try {
      if (!formData.startDate || !formData.endDate || !formData.startTime || !formData.endTime) {
        enqueueSnackbar('Por favor, preencha todos os campos obrigatórios', { variant: 'error' });
        return;
      }

      if (!selectedSpace || !user) return;

      // Combinar data e hora
      const startDateTime = new Date(formData.startDate);
      startDateTime.setHours(formData.startTime.getHours());
      startDateTime.setMinutes(formData.startTime.getMinutes());

      const endDateTime = new Date(formData.endDate);
      endDateTime.setHours(formData.endTime.getHours());
      endDateTime.setMinutes(formData.endTime.getMinutes());

      await apiService.createReservation({
        spaceId: selectedSpace.id,
        userId: user.id,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        participants: formData.participants,
        description: formData.description,
        status: 'pendente',
      });

      enqueueSnackbar('Reserva solicitada com sucesso! Aguarde a confirmação.', { variant: 'success' });
      handleCloseReservationDialog();
    } catch (error) {
      enqueueSnackbar('Erro ao solicitar reserva', { variant: 'error' });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sala de reunião':
        return 'primary';
      case 'auditório':
        return 'secondary';
      case 'coworking':
        return 'success';
      case 'laboratório':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Espaços Disponíveis
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        Explore nossos espaços e faça sua reserva
      </Typography>

      <Grid container spacing={3}>
        {spaces.map((space) => (
          <Grid item xs={12} sm={6} md={4} key={space.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {space.image && (
                <CardMedia
                  component="img"
                  height="200"
                  image={space.image}
                  alt={space.name}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {space.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BusinessIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Chip
                    label={space.type}
                    color={getTypeColor(space.type) as 'primary' | 'secondary' | 'success' | 'warning' | 'default'}
                    size="small"
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Capacidade: {space.capacity} pessoas
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {space.description}
                </Typography>

                {space.amenities && space.amenities.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Comodidades:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {space.amenities.map((amenity: string, index: number) => (
                        <Chip key={index} label={amenity} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleOpenReservationDialog(space)}
                  sx={{ mt: 'auto' }}
                >
                  Reservar Espaço
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {spaces.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum espaço disponível no momento
          </Typography>
        </Box>
      )}

      {/* Dialog de Reserva */}
      <Dialog 
        open={openReservationDialog} 
        onClose={handleCloseReservationDialog}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Reservar: {selectedSpace?.name}
            <IconButton onClick={handleCloseReservationDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <DatePicker
                label="Data de Início"
                value={formData.startDate}
                onChange={(date) => setFormData({ ...formData, startDate: date })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
                minDate={new Date()}
              />
              
              <TimePicker
                label="Hora de Início"
                value={formData.startTime}
                onChange={(time) => setFormData({ ...formData, startTime: time })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />

              <DatePicker
                label="Data de Fim"
                value={formData.endDate}
                onChange={(date) => setFormData({ ...formData, endDate: date })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
                minDate={formData.startDate || new Date()}
              />
              
              <TimePicker
                label="Hora de Fim"
                value={formData.endTime}
                onChange={(time) => setFormData({ ...formData, endTime: time })}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />

              <TextField
                label="Número de Participantes"
                type="number"
                value={formData.participants}
                onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) || 1 })}
                fullWidth
                required
                inputProps={{ 
                  min: 1, 
                  max: selectedSpace?.capacity || 1 
                }}
                helperText={`Máximo: ${selectedSpace?.capacity} pessoas`}
              />

              <TextField
                label="Descrição/Motivo da Reserva"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
                placeholder="Descreva o propósito da reserva..."
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReservationDialog}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitReservation} 
            variant="contained"
          >
            Solicitar Reserva
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserSpaces;