import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  Event as EventIcon,
  Room as RoomIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', reservas: 40 },
  { name: 'Fev', reservas: 30 },
  { name: 'Mar', reservas: 45 },
  { name: 'Abr', reservas: 50 },
  { name: 'Mai', reservas: 35 },
  { name: 'Jun', reservas: 60 },
];

const statsCards = [
  {
    title: 'Total de Reservas',
    value: '156',
    icon: <EventIcon sx={{ fontSize: 40 }} />,
    trend: '+12%',
    color: 'primary.main',
  },
  {
    title: 'Espaços Disponíveis',
    value: '8',
    icon: <RoomIcon sx={{ fontSize: 40 }} />,
    trend: '+2',
    color: 'success.main',
  },
  {
    title: 'Usuários Ativos',
    value: '324',
    icon: <GroupIcon sx={{ fontSize: 40 }} />,
    trend: '+5%',
    color: 'secondary.main',
  },
  {
    title: 'Taxa de Ocupação',
    value: '78%',
    icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
    trend: '+8%',
    color: 'info.main',
  },
];

export default function Dashboard() {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {statsCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="neutral.500">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ my: 1 }}>
                      {card.value}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon
                        sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }}
                      />
                      <Typography variant="caption" color="success.main">
                        {card.trend}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: `${card.color}15`,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="h6">Reservas por Mês</Typography>
                <IconButton onClick={handleClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleClose}>Últimos 6 meses</MenuItem>
                  <MenuItem onClick={handleClose}>Último ano</MenuItem>
                  <MenuItem onClick={handleClose}>Exportar dados</MenuItem>
                </Menu>
              </Box>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="reservas"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
} 