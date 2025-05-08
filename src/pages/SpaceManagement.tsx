import React from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

const SpaceManagement: React.FC = () => {
  const spaces = [
    {
      id: '1',
      name: 'Sala de Reunião A',
      description: 'Sala equipada com projetor e videoconferência',
      capacity: 8,
      price: 80.0,
      image: 'https://source.unsplash.com/random/800x600/?meeting-room',
    },
    {
      id: '2',
      name: 'Escritório Compartilhado',
      description: 'Espaço de coworking com 10 estações de trabalho',
      capacity: 10,
      price: 50.0,
      image: 'https://source.unsplash.com/random/800x600/?coworking',
    },
    {
      id: '3',
      name: 'Auditório Principal',
      description: 'Auditório com capacidade para 100 pessoas',
      capacity: 100,
      price: 200.0,
      image: 'https://source.unsplash.com/random/800x600/?auditorium',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Gerenciamento de Espaços
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => console.log('Adicionar novo espaço')}
        >
          Novo Espaço
        </Button>
      </Box>

      <Grid container spacing={3}>
        {spaces.map((space) => (
          <Grid item xs={12} sm={6} md={4} key={space.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={space.image}
                alt={space.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {space.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {space.description}
                </Typography>
                <Typography variant="body2">
                  Capacidade: {space.capacity} pessoas
                </Typography>
                <Typography variant="body2">
                  Preço: R$ {space.price.toFixed(2)}/hora
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Tooltip title="Visualizar">
                  <IconButton
                    size="small"
                    onClick={() => console.log('Visualizar', space.id)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton
                    size="small"
                    onClick={() => console.log('Editar', space.id)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton
                    size="small"
                    onClick={() => console.log('Excluir', space.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SpaceManagement; 