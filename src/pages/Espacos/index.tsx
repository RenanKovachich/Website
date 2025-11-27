import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useForm, FieldValues, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FormField } from '../../components/FormField';
import { FormSelect } from '../../components/FormSelect';

type SpaceFormData = {
  name: string;
  type: string;
  capacity: number;
  location: string;
  status: 'ativo' | 'inativo';
  description: string;
};

const spaceSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  type: yup.string().required('Tipo é obrigatório'),
  capacity: yup.number().required('Capacidade é obrigatória').min(1, 'Capacidade deve ser maior que 0'),
  location: yup.string().required('Localização é obrigatória'),
  status: yup.string().oneOf(['ativo', 'inativo'] as const).required('Status é obrigatório'),
  description: yup.string().required('Descrição é obrigatória'),
}).required();

const tiposEspaco = [
  { value: 'sala', label: 'Sala de Reunião' },
  { value: 'auditorio', label: 'Auditório' },
  { value: 'escritorio', label: 'Escritório' },
  { value: 'laboratorio', label: 'Laboratório' },
];

const statusEspaco = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
];

const Espacos: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<SpaceFormData | null>(null);

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<SpaceFormData>({
    resolver: yupResolver(spaceSchema),
    defaultValues: {
      name: '',
      type: '',
      capacity: 0,
      location: '',
      status: 'ativo',
      description: '',
    },
  });

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSpace(null);
    reset();
  };

  const handleEdit = (space: SpaceFormData) => {
    setSelectedSpace(space);
    reset(space);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    // Implementar lógica de exclusão
    console.log('Excluir espaço:', id);
  };

  const onSubmit = async (data: SpaceFormData) => {
    try {
      if (selectedSpace) {
        // Implementar lógica de atualização
        console.log('Atualizar espaço:', data);
      } else {
        // Implementar lógica de criação
        console.log('Criar espaço:', data);
      }
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar espaço:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Espaços
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Novo Espaço
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {/* Implementar lista de espaços */}
        </Grid>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedSpace ? 'Editar Espaço' : 'Novo Espaço'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormField<SpaceFormData>
                  name="name"
                  control={control}
                  label="Nome do Espaço"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormSelect<SpaceFormData>
                  name="type"
                  control={control}
                  label="Tipo"
                  options={tiposEspaco}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormField<SpaceFormData>
                  name="capacity"
                  control={control}
                  label="Capacidade"
                  type="number"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormSelect<SpaceFormData>
                  name="status"
                  control={control}
                  label="Status"
                  options={statusEspaco}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormField<SpaceFormData>
                  name="location"
                  control={control}
                  label="Localização"
                />
              </Grid>
              <Grid item xs={12}>
                <FormField<SpaceFormData>
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
          <Button onClick={handleClose}>Cancelar</Button>
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

export default Espacos; 