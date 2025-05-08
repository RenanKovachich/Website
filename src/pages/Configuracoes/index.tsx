import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Switch,
  Divider,
  TextField,
  Button,
  Alert,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

interface ConfiguracoesState {
  notificacoesEmail: boolean;
  notificacoesApp: boolean;
  tempoAntecedencia: number;
  formatoData: string;
  temaEscuro: boolean;
  idioma: string;
  fuso: string;
}

const fusos = [
  'America/Sao_Paulo',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
];

const idiomas = [
  { codigo: 'pt-BR', nome: 'Português (Brasil)' },
  { codigo: 'en-US', nome: 'English (US)' },
  { codigo: 'es', nome: 'Español' },
];

export const Configuracoes = () => {
  const [configuracoes, setConfiguracoes] = useState<ConfiguracoesState>({
    notificacoesEmail: true,
    notificacoesApp: true,
    tempoAntecedencia: 30,
    formatoData: 'dd/MM/yyyy',
    temaEscuro: false,
    idioma: 'pt-BR',
    fuso: 'America/Sao_Paulo',
  });

  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(
    null
  );

  const handleSwitchChange = (campo: keyof ConfiguracoesState) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfiguracoes((prev) => ({
      ...prev,
      [campo]: event.target.checked,
    }));
  };

  const handleNumberChange = (campo: keyof ConfiguracoesState) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setConfiguracoes((prev) => ({
      ...prev,
      [campo]: parseInt(event.target.value) || 0,
    }));
  };

  const handleSelectChange = (campo: keyof ConfiguracoesState) => (
    event: SelectChangeEvent
  ) => {
    setConfiguracoes((prev) => ({
      ...prev,
      [campo]: event.target.value,
    }));
  };

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      // Simula uma chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMensagem({
        tipo: 'success',
        texto: 'Configurações salvas com sucesso!',
      });
    } catch (error) {
      setMensagem({
        tipo: 'error',
        texto: 'Erro ao salvar as configurações. Tente novamente.',
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Configurações
      </Typography>

      {mensagem && (
        <Alert
          severity={mensagem.tipo}
          sx={{ mb: 3 }}
          onClose={() => setMensagem(null)}
        >
          {mensagem.texto}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Notificações
              </Typography>
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configuracoes.notificacoesEmail}
                      onChange={handleSwitchChange('notificacoesEmail')}
                    />
                  }
                  label="Receber notificações por e-mail"
                />
                <Typography variant="body2" color="neutral.500" sx={{ mt: 0.5 }}>
                  Receba atualizações sobre reservas e alterações por e-mail
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configuracoes.notificacoesApp}
                      onChange={handleSwitchChange('notificacoesApp')}
                    />
                  }
                  label="Notificações no aplicativo"
                />
                <Typography variant="body2" color="neutral.500" sx={{ mt: 0.5 }}>
                  Receba notificações em tempo real no aplicativo
                </Typography>
              </Box>
              <TextField
                fullWidth
                type="number"
                label="Tempo de antecedência para notificações (minutos)"
                value={configuracoes.tempoAntecedencia}
                onChange={handleNumberChange('tempoAntecedencia')}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Preferências
              </Typography>
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configuracoes.temaEscuro}
                      onChange={handleSwitchChange('temaEscuro')}
                    />
                  }
                  label="Tema escuro"
                />
              </Box>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Idioma</InputLabel>
                <Select
                  value={configuracoes.idioma}
                  label="Idioma"
                  onChange={handleSelectChange('idioma')}
                >
                  {idiomas.map((idioma) => (
                    <MenuItem key={idioma.codigo} value={idioma.codigo}>
                      {idioma.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Fuso horário</InputLabel>
                <Select
                  value={configuracoes.fuso}
                  label="Fuso horário"
                  onChange={handleSelectChange('fuso')}
                >
                  {fusos.map((fuso) => (
                    <MenuItem key={fuso} value={fuso}>
                      {fuso}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Formato de Data e Hora
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Formato de data</InputLabel>
                <Select
                  value={configuracoes.formatoData}
                  label="Formato de data"
                  onChange={handleSelectChange('formatoData')}
                >
                  <MenuItem value="dd/MM/yyyy">DD/MM/AAAA</MenuItem>
                  <MenuItem value="MM/dd/yyyy">MM/DD/AAAA</MenuItem>
                  <MenuItem value="yyyy-MM-dd">AAAA-MM-DD</MenuItem>
                </Select>
                <Typography variant="body2" color="neutral.500" sx={{ mt: 1 }}>
                  Este formato será usado em todo o sistema
                </Typography>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSalvar}
          disabled={salvando}
        >
          {salvando ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </Box>
    </Box>
  );
}; 