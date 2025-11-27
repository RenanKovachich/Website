import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
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
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Add as AddIcon } from '@mui/icons-material';
import { FormField } from '../../components/FormField';
import { FormSelect } from '../../components/FormSelect';
import { FormDateTimePicker } from '../../components/FormDateTimePicker';
import { reservationSchema } from '../../schemas/validationSchemas';
import { mockReservations } from '../../services/mockData';

interface Reservation {
  id: string;
  spaceId: string;
  userId: string;
  startDate: string;
  endDate: string;
  participants: number;
  description: string;
  status: 'pendente' | 'confirmada' | 'cancelada';
  space?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
  };
}

interface ReservationFormData {
  spaceId: string;
  startDate: Date;
  endDate: Date;
  participants: number;
  description: string;
  status: 'pendente' | 'confirmada' | 'cancelada';
}

const statusReserva = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'cancelada', label: 'Cancelada' },
];

export const Reservas = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reservaEditando, setReservaEditando] = useState<Reservation | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 10,
    page: 0,
  });

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<ReservationFormData>({
    resolver: yupResolver(reservationSchema),
    defaultValues: {
      spaceId: '',
      startDate: new Date(),
      endDate: new Date(),
      participants: 1,
      description: '',
      status: 'pendente'
    },
  });

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setReservaEditando(null);
    reset();
  };

  const onSubmit: SubmitHandler<ReservationFormData> = async (data) => {
    try {
      // TODO: Implementar criação/edição de reserva
      console.log('Form submitted:', data);
      handleDialogClose();
    } catch (error) {
      console.error('Erro ao salvar reserva:', error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'spaceName',
      headerName: 'Espaço',
      flex: 1,
      minWidth: 180,
      valueGetter: (params: { row: Reservation }) => params.row.space?.name || '',
    },
    {
      field: 'responsible',
      headerName: 'Responsável',
      flex: 1,
      minWidth: 150,
      valueGetter: (params: { row: Reservation }) => params.row.user?.name || '',
    },
    {
      field: 'startDate',
      headerName: 'Início',
      flex: 1,
      minWidth: 180,
      valueFormatter: (params: { value: string }) =>
        new Date(params.value).toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
    },
    {
      field: 'endDate',
      headerName: 'Fim',
      flex: 1,
      minWidth: 180,
      valueFormatter: (params: { value: string }) =>
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
        const status = statusReserva.find((s) => s.value === params.value);
        const color =
          params.value === 'confirmada'
            ? 'success'
            : params.value === 'pendente'
            ? 'warning'
            : 'error';
        return <Chip label={status?.label || params.value} color={color} size="small" />;
      },
    },
    {
      field: 'participants',
      headerName: 'Participantes',
      flex: 1,
      minWidth: 130,
      type: 'number',
    },
    {
      field: 'description',
      headerName: 'Descrição',
      flex: 1,
      minWidth: 200,
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
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
            rows={mockReservations}
            columns={columns}
            autoHeight
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10]}
            disableRowSelectionOnClick
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {reservaEditando ? 'Editar Reserva' : 'Nova Reserva'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormSelect
                  name="spaceId"
                  control={control}
                  label="Espaço"
                  options={[]} // TODO: Carregar espaços disponíveis
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormDateTimePicker
                  name="startDate"
                  control={control}
                  label="Data e Hora de Início"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormDateTimePicker
                  name="endDate"
                  control={control}
                  label="Data e Hora de Fim"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormField
                  name="participants"
                  control={control}
                  label="Número de Participantes"
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormSelect
                  name="status"
                  control={control}
                  label="Status"
                  options={statusReserva}
                />
              </Grid>
              <Grid item xs={12}>
                <FormField
                  name="description"
                  control={control}
                  label="Descrição"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 