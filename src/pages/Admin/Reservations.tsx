import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Chip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { apiService } from '../../services/api';
import { Reservation, Space, User } from '../../types';
import { useSnackbar } from 'notistack';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';

interface ReservationFormData {
  spaceId: string;
  userId: string;
  startDate: Date | null;
  startTime: string;
  endDate: Date | null;
  endTime: string;
  participants: number;
  description: string;
  status: 'pendente' | 'confirmada' | 'cancelada';
}

const AdminReservations: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState<ReservationFormData>({
    spaceId: '',
    userId: '',
    startDate: null,
    startTime: '09:00',
    endDate: null,
    endTime: '10:00',
    participants: 0,
    description: '',
    status: 'pendente',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reservationsData, spacesData, usersData] = await Promise.all([
        apiService.getReservations(),
        apiService.getSpaces(),
        apiService.getUsers(),
      ]);
      
      setReservations(reservationsData);
      setSpaces(spacesData);
      setUsers(usersData);
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
        userId: reservation.userId,
        startDate: startDateTime,
        startTime: startDateTime.toTimeString().slice(0, 5),
        endDate: endDateTime,
        endTime: endDateTime.toTimeString().slice(0, 5),
        participants: reservation.participants,
        description: reservation.description,
        status: reservation.status,
      });
    } else {
      setSelectedReservation(null);
      setFormData({
        spaceId: '',
        userId: '',
        startDate: null,
        startTime: '09:00',
        endDate: null,
        endTime: '10:00',
        participants: 0,
        description: '',
        status: 'pendente',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedReservation(null);
    setFormData({
      spaceId: '',
      userId: '',
      startDate: null,
      startTime: '09:00',
      endDate: null,
      endTime: '10:00',
      participants: 0,
      description: '',
      status: 'pendente',
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.startDate || !formData.endDate) {
        enqueueSnackbar('Por favor, selecione as datas de início e fim', { variant: 'error' });
        return;
      }

      // Combinar data e hora
      const startDateTime = new Date(formData.startDate);
      const [startHour, startMinute] = formData.startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);

      const endDateTime = new Date(formData.endDate);
      const [endHour, endMinute] = formData.endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);

      if (selectedReservation) {
        await apiService.updateReservation(selectedReservation.id, {
          spaceId: formData.spaceId,
          userId: formData.userId,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          participants: formData.participants,
          description: formData.description,
          status: formData.status,
        });
        enqueueSnackbar('Reserva atualizada com sucesso!', { variant: 'success' });
      } else {
        await apiService.createReservation({
          spaceId: formData.spaceId,
          userId: formData.userId,
          startDate: startDateTime.toISOString(),
          endDate: endDateTime.toISOString(),
          participants: formData.participants,
          description: formData.description,
          status: formData.status,
        });
        enqueueSnackbar('Reserva criada com sucesso!', { variant: 'success' });
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      enqueueSnackbar('Erro ao salvar reserva', { variant: 'error' });
    }
  };

  const handleDelete = async (reservationId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta reserva?')) {
      try {
        await apiService.updateReservation(reservationId, { status: 'cancelada' });
        enqueueSnackbar('Reserva cancelada com sucesso!', { variant: 'success' });
        loadData();
      } catch (error) {
        enqueueSnackbar('Erro ao cancelar reserva', { variant: 'error' });
      }
    }
  };

  const handleApprove = async (reservationId: string) => {
    if (window.confirm('Tem certeza que deseja aprovar esta reserva?')) {
      try {
        await apiService.approveReservation(reservationId);
        enqueueSnackbar('Reserva aprovada com sucesso!', { variant: 'success' });
        loadData();
      } catch (error) {
        enqueueSnackbar('Erro ao aprovar reserva', { variant: 'error' });
      }
    }
  };

  const handleExportCSV = () => {
    try {
      // Criar cabeçalho CSV
      const headers = ['ID', 'Espaço', 'Usuário', 'Data Início', 'Data Fim', 'Participantes', 'Descrição', 'Status'];
      const csvData = [headers];

      // Adicionar dados das reservas
      reservations.forEach((reservation) => {
        const space = spaces.find((s) => s.id === reservation.spaceId);
        const user = users.find((u) => u.id === reservation.userId);
        
        csvData.push([
          reservation.id,
          space ? space.name : 'N/A',
          user ? user.name : 'N/A',
          new Date(reservation.startDate).toLocaleDateString('pt-BR'),
          new Date(reservation.endDate).toLocaleDateString('pt-BR'),
          reservation.participants.toString(),
          reservation.description,
          reservation.status,
        ]);
      });

      // Converter para string CSV
      const csvString = csvData.map(row => row.join(',')).join('\n');

      // Criar blob e fazer download
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `reservas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      enqueueSnackbar('Relatório exportado com sucesso!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Erro ao exportar relatório', { variant: 'error' });
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
        
        // Primeiro tenta usar o objeto user já populado
        if (row.user && row.user.name) {
          return row.user.name;
        }
        
        // Se não tiver, busca no array users
        if (row.userId) {
          const user = users.find((u) => u.id === row.userId);
          return user ? user.name : 'Usuário não encontrado';
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
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return null;
        const status = statusMap[params.value as keyof typeof statusMap];
        return (
          <Chip
            label={status.label}
            color={status.color as 'warning' | 'success' | 'error'}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 280,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.row) return null;
        return (
          <Box>
            {params.row.status === 'pendente' && (
              <Button
                size="small"
                color="success"
                onClick={() => handleApprove(params.row.id)}
                sx={{ mr: 1 }}
              >
                Aprovar
              </Button>
            )}
            <Button
              size="small"
              onClick={() => handleOpenDialog(params.row)}
              sx={{ mr: 1 }}
            >
              Editar
            </Button>
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Reservas</Typography>
        <Box>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleExportCSV}
            sx={{ mr: 2 }}
          >
            Exportar CSV
          </Button>
          <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
            Nova Reserva
          </Button>
        </Box>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
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
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedReservation ? 'Editar Reserva' : 'Nova Reserva'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              select
              label="Espaço"
              value={formData.spaceId}
              onChange={(e) => setFormData({ ...formData, spaceId: e.target.value })}
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
              select
              label="Usuário"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              fullWidth
              required
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Data de Início"
                  value={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
                <TextField
                  label="Hora"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  fullWidth
                  required
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker
                  label="Data de Fim"
                  value={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  slotProps={{ textField: { fullWidth: true, required: true } }}
                />
                <TextField
                  label="Hora"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 300 }}
                  fullWidth
                  required
                />
              </Box>
            </LocalizationProvider>
            <TextField
              label="Participantes"
              type="number"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: parseInt(e.target.value) })}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              required
              multiline
              rows={3}
            />
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'pendente' | 'confirmada' | 'cancelada' })}
              fullWidth
              required
            >
              <MenuItem value="pendente">Pendente</MenuItem>
              <MenuItem value="confirmada">Confirmada</MenuItem>
              <MenuItem value="cancelada">Cancelada</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminReservations; 