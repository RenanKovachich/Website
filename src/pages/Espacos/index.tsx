import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

interface Espaco {
  id: number;
  nome: string;
  capacidade: number;
  tipo: string;
  status: string;
  recursos: string[];
}

const espacosIniciais: Espaco[] = [
  {
    id: 1,
    nome: 'Sala de Reunião A',
    capacidade: 10,
    tipo: 'Sala de Reunião',
    status: 'Disponível',
    recursos: ['Projetor', 'Wi-Fi', 'Ar Condicionado'],
  },
  {
    id: 2,
    nome: 'Auditório Principal',
    capacidade: 100,
    tipo: 'Auditório',
    status: 'Ocupado',
    recursos: ['Som', 'Projetor', 'Wi-Fi', 'Ar Condicionado'],
  },
  {
    id: 3,
    nome: 'Sala de Treinamento',
    capacidade: 30,
    tipo: 'Sala de Treinamento',
    status: 'Manutenção',
    recursos: ['Computadores', 'Projetor', 'Wi-Fi'],
  },
];

const tiposEspaco = ['Sala de Reunião', 'Auditório', 'Sala de Treinamento', 'Escritório'];
const statusEspaco = ['Disponível', 'Ocupado', 'Manutenção'];
const recursosDisponiveis = [
  'Projetor',
  'Wi-Fi',
  'Ar Condicionado',
  'Som',
  'Computadores',
  'Quadro Branco',
  'TV',
];

export const Espacos = () => {
  const [espacos, setEspacos] = useState<Espaco[]>(espacosIniciais);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [espacoEditando, setEspacoEditando] = useState<Espaco | null>(null);

  const handleBuscaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBusca(event.target.value);
  };

  const handleFiltroTipoChange = (event: SelectChangeEvent) => {
    setFiltroTipo(event.target.value);
  };

  const handleFiltroStatusChange = (event: SelectChangeEvent) => {
    setFiltroStatus(event.target.value);
  };

  const handleDialogOpen = (espaco?: Espaco) => {
    if (espaco) {
      setEspacoEditando(espaco);
    } else {
      setEspacoEditando(null);
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEspacoEditando(null);
  };

  const espacosFiltrados = espacos.filter((espaco) => {
    const matchBusca = espaco.nome.toLowerCase().includes(busca.toLowerCase());
    const matchTipo = filtroTipo ? espaco.tipo === filtroTipo : true;
    const matchStatus = filtroStatus ? espaco.status === filtroStatus : true;
    return matchBusca && matchTipo && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponível':
        return 'success';
      case 'Ocupado':
        return 'error';
      case 'Manutenção':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Espaços</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen()}
        >
          Novo Espaço
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar espaços..."
                value={busca}
                onChange={handleBuscaChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'neutral.500', mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Tipo</InputLabel>
                <Select
                  value={filtroTipo}
                  label="Tipo"
                  onChange={handleFiltroTipoChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {tiposEspaco.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtroStatus}
                  label="Status"
                  onChange={handleFiltroStatusChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {statusEspaco.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {espacosFiltrados.map((espaco) => (
          <Grid item xs={12} sm={6} md={4} key={espaco.id}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">{espaco.nome}</Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleDialogOpen(espaco)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="neutral.500" sx={{ mb: 1 }}>
                  {espaco.tipo} • {espaco.capacidade} pessoas
                </Typography>

                <Chip
                  label={espaco.status}
                  color={getStatusColor(espaco.status)}
                  size="small"
                  sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {espaco.recursos.map((recurso) => (
                    <Chip
                      key={recurso}
                      label={recurso}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {espacoEditando ? 'Editar Espaço' : 'Novo Espaço'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Espaço"
                  defaultValue={espacoEditando?.nome}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select defaultValue={espacoEditando?.tipo || ''} label="Tipo">
                    {tiposEspaco.map((tipo) => (
                      <MenuItem key={tipo} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Capacidade"
                  type="number"
                  defaultValue={espacoEditando?.capacidade}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select defaultValue={espacoEditando?.status || ''} label="Status">
                    {statusEspaco.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Recursos</InputLabel>
                  <Select
                    multiple
                    defaultValue={espacoEditando?.recursos || []}
                    label="Recursos"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                  >
                    {recursosDisponiveis.map((recurso) => (
                      <MenuItem key={recurso} value={recurso}>
                        {recurso}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleDialogClose}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 