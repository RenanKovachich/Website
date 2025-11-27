import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    empresaId: user?.empresaId || '',
    password: '',
  });

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiService.updateUser(user?.id || '', {
        name: formData.name,
        email: formData.email,
        empresaId: formData.empresaId,
      });

      enqueueSnackbar('Perfil atualizado com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      enqueueSnackbar('Erro ao atualizar perfil', { variant: 'error' });
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password) {
      enqueueSnackbar('A senha é obrigatória', { variant: 'error' });
      return;
    }

    try {
      await apiService.updateUser(user?.id || '', {
        password: formData.password,
      });

      setFormData((prev) => ({
        ...prev,
        password: '',
      }));

      enqueueSnackbar('Senha atualizada com sucesso', { variant: 'success' });
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      enqueueSnackbar('Erro ao atualizar senha', { variant: 'error' });
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Meu Perfil
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informações Pessoais
              </Typography>
              <form onSubmit={handleUpdateProfile}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nome"
                      value={formData.name}
                      onChange={handleChange('name')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="E-mail"
                      type="email"
                      value={formData.email}
                      onChange={handleChange('email')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="ID da Empresa"
                      value={formData.empresaId}
                      onChange={handleChange('empresaId')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained">
                      Atualizar Perfil
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Alterar Senha
              </Typography>
              <form onSubmit={handleUpdatePassword}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nova Senha"
                      type="password"
                      value={formData.password}
                      onChange={handleChange('password')}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button type="submit" variant="contained">
                      Atualizar Senha
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile; 