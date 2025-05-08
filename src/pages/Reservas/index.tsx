import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Add as AddIcon } from '@mui/icons-material';

interface Reserva {
  id: number;
  espaco: string;
  responsavel: string;
  inicio: Date;
  fim: Date;
  status: string;
  participantes: number;
  descricao: string;
}

const reservasIniciais: Reserva[] = [
  {
    id: 1,
    espaco: 'Sala de Reunião A',
    responsavel: 'João Silva',
    inicio: new Date('2024-03-12T09:00:00'),
    fim: new Date('2024-03-12T10:00:00'),
    status: 'Confirmada',
    participantes: 6,
    descricao: 'Reunião de projeto',
  },
  {
    id: 2,
    espaco: 'Auditório Principal',
    responsavel: 'Maria Santos',
    inicio: new Date('2024-03-12T14:00:00'),
    fim: new Date('2024-03-12T17:00:00'),
    status: 'Pendente',
    participantes: 50,
    descricao: 'Workshop de inovação',
  },
];

const espacosDisponiveis = [
  'Sala de Reunião A',
  'Sala de Reunião B',
  'Auditório Principal',
  'Sala de Treinamento',
];

const statusReserva = ['Confirmada', 'Pendente', 'Cancelada'];

export const Reservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>(reservasIniciais);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [novaReserva, setNovaReserva] = useState<Partial<Reserva>>({
    inicio: new Date(),
    fim: new Date(),
    status: 'Pendente',
  });

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setNovaReserva({
      inicio: new Date(),
      fim: new Date(),
      status: 'Pendente',
    });
  };

  const handleSalvarReserva = () => {
    if (novaReserva.espaco && novaReserva.responsavel && novaReserva.inicio && novaReserva.fim) {
      const novaReservaCompleta: Reserva = {
        id: Math.max(...reservas.map((r) => r.id)) + 1,
        espaco: novaReserva.espaco,
        responsavel: novaReserva.responsavel,
        inicio: novaReserva.inicio,
        fim: novaReserva.fim,
        status: novaReserva.status || 'Pendente',
        participantes: novaReserva.participantes || 0,
        descricao: novaReserva.descricao || '',
      };

      setReservas([...reservas, novaReservaCompleta]);
      handleDialogClose();
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'espaco',
      headerName: 'Espaço',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'responsavel',
      headerName: 'Responsável',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'inicio',
      headerName: 'Início',
      flex: 1,
      minWidth: 180,
      valueFormatter: (params: { value: Date | string }) =>
        new Date(params.value).toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
    },
    {
      field: 'fim',
      headerName: 'Fim',
      flex: 1,
      minWidth: 180,
      valueFormatter: (params: { value: Date | string }) =>
        new Date(params.value).toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => {
        const color =
          params.value === 'Confirmada'
            ? 'success'
            : params.value === 'Pendente'
            ? 'warning'
            : 'error';
        return <Chip label={params.value} color={color} size="small" />;
      },
    },
    {
      field: 'participantes',
      headerName: 'Participantes',
      flex: 1,
      minWidth: 130,
      type: 'number',
    },
    {
      field: 'descricao',
      headerName: 'Descrição',
      flex: 1,
      minWidth: 200,
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Reservas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleDialogOpen}
        >
          Nova Reserva
        </Button>
      </Box>

      <Card>
        <CardContent>
          <DataGrid
            rows={reservas}
            columns={columns}
            autoHeight
            pageSizeOptions={[5, 10, 25]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            sx={{
              '& .MuiDataGrid-cell': {
                borderColor: 'neutral.200',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'neutral.50',
                borderColor: 'neutral.200',
              },
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Nova Reserva</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Espaço</InputLabel>
                  <Select
                    value={novaReserva.espaco || ''}
                    label="Espaço"
                    onChange={(e) =>
                      setNovaReserva({ ...novaReserva, espaco: e.target.value })
                    }
                  >
                    {espacosDisponiveis.map((espaco) => (
                      <MenuItem key={espaco} value={espaco}>
                        {espaco}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Responsável"
                  value={novaReserva.responsavel || ''}
                  onChange={(e) =>
                    setNovaReserva({ ...novaReserva, responsavel: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Data e Hora de Início"
                  value={novaReserva.inicio}
                  onChange={(newValue) =>
                    setNovaReserva({ ...novaReserva, inicio: newValue || new Date() })
                  }
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Data e Hora de Fim"
                  value={novaReserva.fim}
                  onChange={(newValue) =>
                    setNovaReserva({ ...novaReserva, fim: newValue || new Date() })
                  }
                  sx={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Número de Participantes"
                  type="number"
                  value={novaReserva.participantes || ''}
                  onChange={(e) =>
                    setNovaReserva({
                      ...novaReserva,
                      participantes: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={novaReserva.status || 'Pendente'}
                    label="Status"
                    onChange={(e) =>
                      setNovaReserva({ ...novaReserva, status: e.target.value })
                    }
                  >
                    {statusReserva.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  multiline
                  rows={3}
                  value={novaReserva.descricao || ''}
                  onChange={(e) =>
                    setNovaReserva({ ...novaReserva, descricao: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSalvarReserva}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 