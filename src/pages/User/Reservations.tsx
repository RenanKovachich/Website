import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Chip,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { apiService } from '../../services/api';
import { Reservation, Space } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const UserReservations: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user, loading } = useAuth();
  const { spaceId } = useParams<{ spaceId: string }>();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState({
    spaceId: spaceId || '',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '10:00',
    participants: 1,
    description: '',
  });

  useEffect(() => {
    if (!loading && user?.id) {
      loadData();
    }
  }, [user?.id, loading]);

  const loadData = async () => {
    try {
      const [reservationsData, spacesData] = await Promise.all([
        apiService.getReservations(),
        apiService.getSpaces(),
      ]);
      
      // Filtrar apenas as reservas do usuário logado
      const userReservations = reservationsData.filter(
        (reservation) => reservation.userId === user?.id
      );
      
      setReservations(userReservations);
      setSpaces(spacesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleOpenDialog = (reservation?: Reservation) => {
    if (reservation) {
      setSelectedReservation(reservation);
      const startDateTime = new Date(reservation.startDate);
      const endDateTime = new Date(reservation.endDate);
      setFormData({
        spaceId: reservation.spaceId,
        startDate: startDateTime.toISOString().split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5),
        endDate: endDateTime.toISOString().split('T')[0],
        endTime: endDateTime.toTimeString().slice(0, 5),
        participants: reservation.participants,
        description: reservation.description,
      });
    } else {
      setSelectedReservation(null);
      setFormData({
        spaceId: spaceId || '',
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '10:00',
        participants: 1,
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    // Forçar fechamento imediato do diálogo
    setOpenDialog(false);
    setSelectedReservation(null);
    
    // Limpar formulário
    setTimeout(() => {
      setFormData({
        spaceId: spaceId || '',
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '10:00',
        participants: 1,
        description: '',
      });
    }, 100);
  };

  const handleSubmit = async () => {
    // Validação básica mais robusta
    const description = formData.description?.trim() || '';
    const startDate = formData.startDate?.trim() || '';
    const endDate = formData.endDate?.trim() || '';
    const spaceId = formData.spaceId?.trim() || '';
    const participants = Number(formData.participants) || 0;

    if (!description) {
      enqueueSnackbar('Título é obrigatório', { variant: 'error' });
      return;
    }
    if (!startDate) {
      enqueueSnackbar('Data de início é obrigatória', { variant: 'error' });
      return;
    }
    if (!endDate) {
      enqueueSnackbar('Data de fim é obrigatória', { variant: 'error' });
      return;
    }
    if (!spaceId) {
      enqueueSnackbar('Espaço é obrigatório', { variant: 'error' });
      return;
    }
    if (participants <= 0) {
      enqueueSnackbar('Número de participantes deve ser maior que zero', { variant: 'error' });
      return;
    }

    // Validação de datas e horas - combinar data e hora
    const startDateTime = new Date(startDate + 'T' + formData.startTime + ':00');
    const endDateTime = new Date(endDate + 'T' + formData.endTime + ':00');
    if (endDateTime <= startDateTime) {
      enqueueSnackbar('A data/hora de fim deve ser posterior à data/hora de início', { variant: 'error' });
      return;
    }

    try {
      if (selectedReservation) {
        await apiService.updateReservation(selectedReservation.id, {
          spaceId,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          participants,
          description,
          status: selectedReservation.status,
          userId: selectedReservation.userId,
        });
        enqueueSnackbar('Reserva atualizada com sucesso!', { variant: 'success' });
      } else {
        const newReservation = await apiService.createReservation({
          spaceId,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          participants,
          description,
          status: 'pendente',
          userId: user?.id || '',
        });
        enqueueSnackbar('Reserva criada com sucesso!', { variant: 'success' });
      }
      
      // Fechar diálogo e recarregar dados imediatamente
      setOpenDialog(false);
      setSelectedReservation(null);
      setFormData({
        spaceId: spaceId || '',
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '10:00',
        participants: 1,
        description: '',
      });
      
      // Recarregar dados
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
      enqueueSnackbar('Erro ao salvar reserva', { variant: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta reserva?')) {
      try {
        await apiService.updateReservation(id, { status: 'cancelada' });
        loadData();
      } catch (error) {
        console.error('Erro ao excluir reserva:', error);
      }
    }
  };

  const handleCancelReservation = async (id: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      try {
        await apiService.cancelReservation(id);
        enqueueSnackbar('Reserva cancelada com sucesso!', { variant: 'success' });
        await loadData();
      } catch (error) {
        console.error('Erro ao cancelar reserva:', error);
        enqueueSnackbar('Erro ao cancelar reserva', { variant: 'error' });
      }
    }
  };

  const handleConfirmReservation = async (id: string) => {
    if (window.confirm('Tem certeza que deseja confirmar esta reserva?')) {
      try {
        await apiService.approveReservation(id);
        enqueueSnackbar('Reserva confirmada com sucesso!', { variant: 'success' });
        await loadData();
      } catch (error) {
        console.error('Erro ao confirmar reserva:', error);
        enqueueSnackbar('Erro ao confirmar reserva', { variant: 'error' });
      }
    }
  };

  const statusMap = {
    pendente: { label: 'Pendente', color: 'warning' },
    confirmada: { label: 'Confirmada', color: 'success' },
    cancelada: { label: 'Cancelada', color: 'error' },
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      field: 'spaceName',
      headerName: 'Espaço',
      width: 200,
      valueGetter: (value, row: Reservation) => {
        if (!row) return 'Espaço não encontrado';
        
        // Primeiro tenta usar o objeto space já populado
        if (row.space && row.space.name) {
          return row.space.name;
        }
        
        // Se não tiver, busca no array spaces
        if (row.spaceId) {
          const space = spaces.find((s) => s.id === row.spaceId);
          return space ? space.name : 'Espaço não encontrado';
        }
        
        return 'Espaço não encontrado';
      },
    },
    {
      field: 'userName',
      headerName: 'Usuário',
      width: 200,
      valueGetter: (value, row: Reservation) => {
        if (!row) return 'Usuário não encontrado';
        
        if (row.user && row.user.name) {
          return row.user.name;
        }
        
        return 'Usuário não encontrado';
      },
    },
    {
      field: 'startDate',
      headerName: 'Data/Hora Início',
      width: 180,
      valueGetter: (value, row: Reservation) => {
        if (!row || !row.startDate) return '-';
        try {
          const date = new Date(row.startDate);
          return date.toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (e) {
          return '-';
        }
      },
    },
    {
      field: 'endDate',
      headerName: 'Data/Hora Fim',
      width: 180,
      valueGetter: (value, row: Reservation) => {
        if (!row || !row.endDate) return '-';
        try {
          const date = new Date(row.endDate);
          return date.toLocaleString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (e) {
          return '-';
        }
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: any) => {
        if (!params || !params.value) return null;
        const status = statusMap[params.value as keyof typeof statusMap];
        return (
          <Chip
            label={status.label}
            color={status.color as any}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 320,
      renderCell: (params: any) => {
        if (!params || !params.row) return null;
        return (
          <Box>
            {params.row.status === 'pendente' && (
              <Button
                size="small"
                color="success"
                onClick={() => handleConfirmReservation(params.row.id)}
                sx={{ mr: 1 }}
              >
                Confirmar
              </Button>
            )}
            <Button
              size="small"
              onClick={() => handleOpenDialog(params.row)}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
            {params.row.status === 'pendente' && (
              <Button
                size="small"
                color="warning"
                onClick={() => handleCancelReservation(params.row.id)}
                sx={{ mr: 1 }}
              >
                Cancelar
              </Button>
            )}
            <Button
              size="small"
              color="error"
              onClick={() => handleDelete(params.row.id)}
            >
              Excluir
            </Button>
          </Box>
        );
      },
    },
  ];

  // Mostrar loading enquanto o contexto de autenticação está carregando
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  // Se não há usuário logado, não renderizar a página
  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Usuário não encontrado</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" data-testid="user-res-title">Minhas Reservas</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpenDialog()}
          data-testid="btn-new-reservation"
        >
          Nova Reserva
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%', boxShadow: 3 }}>
        <DataGrid
          rows={reservations}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          data-testid="grid-reservations"
          sx={{
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedReservation ? 'Editar Reserva' : 'Nova Reserva'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              id="res-title"
              label="Título"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                id="res-start-date"
                label="Data de Início"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                id="res-start-time"
                label="Hora"
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                id="res-end-date"
                label="Data de Fim"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                id="res-end-time"
                label="Hora"
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
            </Box>
            <TextField
              id="res-space"
              select
              label="Espaço"
              value={formData.spaceId}
              onChange={(e) =>
                setFormData({ ...formData, spaceId: e.target.value })
              }
              fullWidth
              required
            >
              {spaces.map((space) => (
                <MenuItem key={space.id} value={space.id}>
                  {space.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Número de Participantes"
              type="number"
              value={formData.participants || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({
                  ...formData,
                  participants: value === '' ? 1 : Math.max(1, parseInt(value) || 1),
                });
              }}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserReservations; 