import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Event as EventIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Group as GroupIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: <BusinessIcon sx={{ fontSize: 40, color:'white' }} />,
      title: 'Espaços Flexíveis',
      description:
        'Encontre o espaço perfeito para suas necessidades, desde salas de reunião até escritórios compartilhados.',
    },
    {
      icon: <EventIcon sx={{ fontSize: 40, color:'white' }} />,
      title: 'Reservas Simples',
      description:
        'Reserve espaços com apenas alguns cliques e gerencie suas reservas de forma eficiente.',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color:'white' }} />,
      title: 'Segurança Garantida',
      description:
        'Sistema seguro e confiável para gerenciar seus espaços e reservas.',
    },
  ];

  const benefits = [
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color:'white' }} />,
      title: 'Agilidade',
      description: 'Reservas instantâneas e gestão eficiente dos espaços.',
    },
    {
      icon: <GroupIcon sx={{ fontSize: 40, color:'white' }} />,
      title: 'Organização',
      description: 'Controle total sobre a utilização dos espaços da sua empresa.',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color:'white' }} />,
      title: 'Escalabilidade',
      description: 'Solução que cresce junto com sua empresa.',
    },
  ];

  const testimonials = [
    {
      name: 'Ana Silva',
      role: 'Gerente de Operações',
      empresa: 'TechCorp',
      avatar: 'A',
      text: 'O LinkSpace revolucionou a forma como gerenciamos nossos espaços. Agora tudo é mais organizado e eficiente.',
    },
    {
      name: 'Carlos Santos',
      role: 'Diretor de RH',
      empresa: 'Inovação SA',
      avatar: 'C',
      text: 'A plataforma é intuitiva e nos ajudou a otimizar o uso dos espaços da empresa.',
    },
    {
      name: 'Mariana Costa',
      role: 'CEO',
      empresa: 'StartupXYZ',
      avatar: 'M',
      text: 'Uma solução completa que resolveu nossos problemas de gestão de espaços.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                transition={{ duration: 0.5 }}
              >
                <Typography
                  variant="h2"
                  component="h1"
                  gutterBottom
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                  }}
                >
                  Transforme a Gestão dos Seus Espaços
                </Typography>
                <Typography
                  variant="h5"
                  paragraph
                  sx={{ mb: 4, opacity: 0.9 }}
                >
                  Uma plataforma completa para gerenciar e reservar espaços
                  compartilhados de forma inteligente.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 2,
                    }}
                  >
                    Começar Agora
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 2,
                    }}
                  >
                    Fazer Login
                  </Button>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Box
                  component="img"
                  src="/hero-image.svg"
                  alt="LinkSpace Platform"
                  sx={{
                    width: '100%',
                    maxWidth: 600,
                    height: 'auto',
                    display: { xs: 'none', md: 'block' },
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Como Funciona Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600 }}
          >
            Como Funciona
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  variants={fadeIn}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      p: 3,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          color: 'primary.main',
                          mb: 2,
                          p: 2,
                          borderRadius: '50%',
                          bgcolor: 'primary.light',
                          display: 'inline-flex',
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="h5"
                        component="h3"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Benefícios Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 6, fontWeight: 600 }}
            >
              Benefícios
            </Typography>
            <Grid container spacing={4}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    variants={fadeIn}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        p: 3,
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        bgcolor: 'white',
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            color: 'secondary.main',
                            mb: 2,
                            p: 2,
                            borderRadius: '50%',
                            bgcolor: 'secondary.light',
                            display: 'inline-flex',
                          }}
                        >
                          {benefit.icon}
                        </Box>
                        <Typography
                          variant="h5"
                          component="h3"
                          gutterBottom
                          sx={{ fontWeight: 600 }}
                        >
                          {benefit.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {benefit.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Depoimentos Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 600 }}
          >
            O que Dizem Nossos Clientes
          </Typography>
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  variants={fadeIn}
                  transition={{ delay: index * 0.2 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 56,
                            height: 56,
                            mr: 2,
                          }}
                        >
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.role} • {testimonial.empresa}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="body1" color="text.secondary">
                        &quot;{testimonial.text}&quot;
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 2, fontWeight: 600 }}
            >
              Pronto para Começar?
            </Typography>
            <Typography
              variant="h6"
              align="center"
              paragraph
              sx={{ mb: 4, opacity: 0.9 }}
            >
              Crie sua conta agora e comece a gerenciar seus espaços e reservas de
              forma eficiente.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/register')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                }}
              >
                Criar Conta
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  borderRadius: 2,
                }}
              >
                Fazer Login
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'white',
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                LinkSpace
              </Typography>
              <Typography variant="body2" color="grey.400">
                A solução completa para gestão de espaços compartilhados.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Links Úteis
              </Typography>
              <Typography
                variant="body2"
                component="a"
                href="#"
                sx={{
                  display: 'block',
                  color: 'grey.400',
                  textDecoration: 'none',
                  mb: 1,
                  '&:hover': { color: 'white' },
                }}
              >
                Sobre Nós
              </Typography>
              <Typography
                variant="body2"
                component="a"
                href="#"
                sx={{
                  display: 'block',
                  color: 'grey.400',
                  textDecoration: 'none',
                  mb: 1,
                  '&:hover': { color: 'white' },
                }}
              >
                Termos de Uso
              </Typography>
              <Typography
                variant="body2"
                component="a"
                href="#"
                sx={{
                  display: 'block',
                  color: 'grey.400',
                  textDecoration: 'none',
                  mb: 1,
                  '&:hover': { color: 'white' },
                }}
              >
                Política de Privacidade
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Contato
              </Typography>
              <Typography variant="body2" color="grey.400" paragraph>
                contato@linkspace.com
              </Typography>
              <Typography variant="body2" color="grey.400">
                São Paulo, SP - Brasil
              </Typography>
            </Grid>
          </Grid>
          <Box
            sx={{
              mt: 4,
              pt: 4,
              borderTop: '1px solid',
              borderColor: 'grey.800',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="grey.400">
              © {new Date().getFullYear()} LinkSpace. Todos os direitos reservados.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 