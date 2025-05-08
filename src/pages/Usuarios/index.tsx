import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  status: string;
  avatar: string;
}

const usuariosIniciais: Usuario[] = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao.silva@empresa.com',
    cargo: 'Gerente',
    departamento: 'Vendas',
    status: 'Ativo',
    avatar: 'JS',
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria.santos@empresa.com',
    cargo: 'Analista',
    departamento: 'RH',
    status: 'Ativo',
    avatar: 'MS',
  },
  {
    id: 3,
    nome: 'Pedro Costa',
    email: 'pedro.costa@empresa.com',
    cargo: 'Desenvolvedor',
    departamento: 'TI',
    status: 'Inativo',
    avatar: 'PC',
  },
];

const cargos = ['Gerente', 'Analista', 'Desenvolvedor', 'Coordenador', 'Assistente'];
const departamentos = ['Vendas', 'RH', 'TI', 'Marketing', 'Financeiro'];
const statusOptions = ['Ativo', 'Inativo'];

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Partial<Usuario> | null>(null);
  const [busca, setBusca] = useState('');

  const handleDialogOpen = (usuario?: Usuario) => {
    if (usuario) {
      setUsuarioEditando(usuario);
    } else {
      setUsuarioEditando({
        status: 'Ativo',
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setUsuarioEditando(null);
  };

  const handleSalvarUsuario = () => {
    if (
      usuarioEditando &&
      usuarioEditando.nome &&
      usuarioEditando.email &&
      usuarioEditando.cargo &&
      usuarioEditando.departamento
    ) {
      if (usuarioEditando.id) {
        // Editando usuário existente
        setUsuarios(
          usuarios.map((u) => (u.id === usuarioEditando.id ? { ...u, ...usuarioEditando } : u))
        );
      } else {
        // Criando novo usuário
        const novoUsuario: Usuario = {
          id: Math.max(...usuarios.map((u) => u.id)) + 1,
          nome: usuarioEditando.nome,
          email: usuarioEditando.email,
          cargo: usuarioEditando.cargo,
          departamento: usuarioEditando.departamento,
          status: usuarioEditando.status || 'Ativo',
          avatar: usuarioEditando.nome
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase(),
        };
        setUsuarios([...usuarios, novoUsuario]);
      }
      handleDialogClose();
    }
  };

  const handleDeletarUsuario = (id: number) => {
    setUsuarios(usuarios.filter((u) => u.id !== id));
  };

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nome.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.email.toLowerCase().includes(busca.toLowerCase()) ||
      usuario.departamento.toLowerCase().includes(busca.toLowerCase())
  );

  const columns: GridColDef[] = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <Avatar sx={{ bgcolor: 'primary.main' }}>{params.value}</Avatar>
      ),
    },
    {
      field: 'nome',
      headerName: 'Nome',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'email',
      headerName: 'E-mail',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'cargo',
      headerName: 'Cargo',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'departamento',
      headerName: 'Departamento',
      flex: 1,
      minWidth: 150,
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 1,
            bgcolor: params.value === 'Ativo' ? 'success.soft' : 'error.soft',
            color: params.value === 'Ativo' ? 'success.main' : 'error.main',
          }}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleDialogOpen(params.row)}
            sx={{ mr: 1 }}
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDeletarUsuario(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">Usuários</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen()}
        >
          Novo Usuário
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Buscar usuários..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'neutral.500' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />
          <DataGrid
            rows={usuariosFiltrados}
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
        <DialogTitle>
          {usuarioEditando?.id ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome"
                  value={usuarioEditando?.nome || ''}
                  onChange={(e) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      nome: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="E-mail"
                  type="email"
                  value={usuarioEditando?.email || ''}
                  onChange={(e) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      email: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Cargo</InputLabel>
                  <Select
                    value={usuarioEditando?.cargo || ''}
                    label="Cargo"
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        cargo: e.target.value,
                      })
                    }
                  >
                    {cargos.map((cargo) => (
                      <MenuItem key={cargo} value={cargo}>
                        {cargo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Departamento</InputLabel>
                  <Select
                    value={usuarioEditando?.departamento || ''}
                    label="Departamento"
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        departamento: e.target.value,
                      })
                    }
                  >
                    {departamentos.map((departamento) => (
                      <MenuItem key={departamento} value={departamento}>
                        {departamento}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={usuarioEditando?.status || 'Ativo'}
                    label="Status"
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        status: e.target.value,
                      })
                    }
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
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
          <Button variant="contained" onClick={handleSalvarUsuario}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 