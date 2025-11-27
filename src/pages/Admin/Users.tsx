import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { apiService } from '../../services/api';
import { User } from '../../types';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  profile: 'admin' | 'usuario';
  empresaId: string;
  status: 'active' | 'inactive';
}

const AdminUsers: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    profile: 'usuario',
    empresaId: currentUser?.empresaId || '',
    status: 'active',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const usersData = await apiService.getUsers();
      setUsers(usersData.filter(user => user.status === 'active'));
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        profile: user.profile,
        empresaId: user.empresaId,
        status: user.status,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        profile: 'usuario',
        empresaId: currentUser?.empresaId || '', // Define automaticamente a empresa do usuário logado
        status: 'active',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      profile: 'usuario',
      empresaId: currentUser?.empresaId || '', // Define automaticamente a empresa do usuário logado
      status: 'active',
    });
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await apiService.updateUser(selectedUser.id, {
          name: formData.name,
          email: formData.email,
          profile: formData.profile,
          empresaId: formData.empresaId,
          status: formData.status,
          ...(formData.password && { password: formData.password }),
        });
        enqueueSnackbar('Usuário atualizado com sucesso!', { variant: 'success' });
      } else {
        await apiService.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          profile: formData.profile,
          status: formData.status,
        });
        enqueueSnackbar('Usuário criado com sucesso!', { variant: 'success' });
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      enqueueSnackbar('Erro ao salvar usuário', { variant: 'error' });
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await apiService.updateUser(userId, { status: 'inactive' });
        enqueueSnackbar('Usuário excluído com sucesso!', { variant: 'success' });
        loadData();
      } catch (error) {
        enqueueSnackbar('Erro ao excluir usuário', { variant: 'error' });
      }
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Nome', width: 200 },
    { field: 'email', headerName: 'E-mail', width: 200 },
    { field: 'empresaId', headerName: 'Empresa ID', width: 200 },
    {
      field: 'profile',
      headerName: 'Perfil',
      width: 130,
      valueFormatter: (params: { value: 'admin' | 'usuario' }) =>
        params.value === 'admin' ? 'Administrador' : 'Usuário',
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
        <Typography variant="h4">Usuários</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Novo Usuário
        </Button>
      </Box>

      <Paper sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={users}
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
          {selectedUser ? 'Editar Usuário' : 'Novo Usuário'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="ID da Empresa"
              value={formData.empresaId}
              onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}
              fullWidth
              required
              disabled={!selectedUser} // Desabilita apenas para criação de novos usuários
              helperText={!selectedUser ? "ID da empresa do administrador logado" : "ID da empresa do usuário"}
            />
            <TextField
              label="Senha"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              fullWidth
              required={!selectedUser}
              helperText={selectedUser ? 'Deixe em branco para manter a senha atual' : ''}
            />
            <TextField
              select
              label="Perfil"
              value={formData.profile}
              onChange={(e) => setFormData({ ...formData, profile: e.target.value as 'admin' | 'usuario' })}
              fullWidth
              required
            >
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="usuario">Usuário</MenuItem>
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

export default AdminUsers; 