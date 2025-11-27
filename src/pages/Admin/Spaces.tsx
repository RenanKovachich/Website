import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { apiService } from '../../services/api';
import { Space, SpaceFormValues } from '../../types';
import { useSnackbar } from 'notistack';

const spaceTypes = [
  { value: 'sala_reuniao', label: 'Sala de Reunião' },
  { value: 'auditorio', label: 'Auditório' },
  { value: 'escritorio', label: 'Escritório' },
  { value: 'coworking', label: 'Coworking' },
] as const;

interface FormData extends SpaceFormValues {
  status: 'active' | 'inactive';
}

const AdminSpaces: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    capacity: 0,
    type: 'sala_reuniao',
    status: 'active',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const spacesData = await apiService.getSpaces();
      setSpaces(spacesData.filter(space => space.status === 'active'));
    } catch (error) {
      console.error('Erro ao carregar espaços:', error);
    }
  };

  const handleOpenDialog = (space?: Space) => {
    if (space) {
      setSelectedSpace(space);
      setFormData({
        name: space.name,
        description: space.description,
        capacity: space.capacity,
        type: space.type,
        status: space.status,
      });
    } else {
      setSelectedSpace(null);
      setFormData({
        name: '',
        description: '',
        capacity: 0,
        type: 'sala_reuniao',
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    // Forçar fechamento imediato do diálogo
    setOpenDialog(false);
    setSelectedSpace(null);
    
    // Limpar formulário
    setTimeout(() => {
      setFormData({
        name: '',
        description: '',
        capacity: 0,
        type: 'sala_reuniao',
        status: 'active',
      });
    }, 100);
  };

  const handleSubmit = async () => {
    // Validação básica mais robusta
    const name = formData.name?.trim() || '';
    const description = formData.description?.trim() || '';
    const capacity = Number(formData.capacity) || 0;

    if (!name) {
      enqueueSnackbar('Nome é obrigatório', { variant: 'error' });
      return;
    }
    if (!description) {
      enqueueSnackbar('Descrição é obrigatória', { variant: 'error' });
      return;
    }
    if (capacity <= 0) {
      enqueueSnackbar('Capacidade deve ser maior que zero', { variant: 'error' });
      return;
    }

    try {
      if (selectedSpace) {
        await apiService.updateSpace(selectedSpace.id, {
          name,
          description,
          capacity,
          type: formData.type,
          status: formData.status,
        });
        enqueueSnackbar('Espaço atualizado com sucesso!', { variant: 'success' });
      } else {
        await apiService.createSpace({
          name,
          description,
          capacity,
          type: formData.type,
          status: formData.status,
        });
        enqueueSnackbar('Espaço criado com sucesso!', { variant: 'success' });
      }
      
      // Forçar fechamento do diálogo
      setTimeout(() => {
        setOpenDialog(false);
        setSelectedSpace(null);
        setFormData({
          name: '',
          description: '',
          capacity: 0,
          type: 'sala_reuniao',
          status: 'active',
        });
      }, 100);
      
      // Recarregar dados
      setTimeout(() => {
        loadData();
      }, 200);
    } catch (error) {
      console.error('Erro ao salvar espaço:', error);
      enqueueSnackbar('Erro ao salvar espaço', { variant: 'error' });
    }
  };

  const handleDelete = async (spaceId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este espaço?')) {
      try {
        await apiService.updateSpace(spaceId, { status: 'inactive' });
        enqueueSnackbar('Espaço excluído com sucesso!', { variant: 'success' });
        loadData();
      } catch (error) {
        enqueueSnackbar('Erro ao excluir espaço', { variant: 'error' });
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nome', width: 200 },
    { field: 'description', headerName: 'Descrição', width: 300 },
    { field: 'capacity', headerName: 'Capacidade', width: 130 },
    {
      field: 'type',
      headerName: 'Tipo',
      width: 150,
      valueFormatter: (params: { value: Space['type'] }) => {
        const types = {
          sala_reuniao: 'Sala de Reunião',
          auditorio: 'Auditório',
          escritorio: 'Escritório',
          coworking: 'Coworking',
        };
        return types[params.value] || params.value;
      },
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 200,
      renderCell: (params) => (
        <Box>
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
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" data-testid="admin-spaces-title">Espaços</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleOpenDialog()}
          data-testid="btn-new-space"
        >
          Novo Espaço
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={spaces}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 5, page: 0 },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          data-testid="grid-spaces"
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedSpace ? 'Editar Espaço' : 'Novo Espaço'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              id="space-name"
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              id="space-desc"
              label="Descrição"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              required
              multiline
              rows={3}
            />
            <TextField
              id="space-capacity"
              label="Capacidade"
              type="number"
              value={formData.capacity || ''}
              onChange={(e) => {
                const value = e.target.value;
                setFormData({ 
                  ...formData, 
                  capacity: value === '' ? 0 : Math.max(1, parseInt(value) || 1)
                });
              }}
              fullWidth
              required
              inputProps={{ min: 1 }}
            />
            <TextField
              id="space-type"
              select
              label="Tipo"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Space['type'] })}
              fullWidth
              required
            >
              {spaceTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
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

export default AdminSpaces; 