import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { redisMock } from '../setup/test-env';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { TEST_CONFIG } from '../setup/test-env';

// Logger para testes
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// Middleware de autenticação JWT
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, TEST_CONFIG.JWT_SECRET) as any;
    
    // Verificar se o token está na blacklist
    const isBlacklisted = await redisMock.get(`blacklist:${decoded.jti}`);
    
    if (isBlacklisted) {
      return res.status(401).json({ error: 'Token revogado' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware de autorização RBAC
const requireRole = (role: 'admin' | 'user') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    next();
  };
};

// Middleware de isolamento multi-tenant
const requireEmpresaAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  const empresaId = req.params.empresaId || req.body.empresa_id || req.query.empresa_id;
  
  if (empresaId && empresaId !== req.user.empresa_id) {
    return res.status(403).json({ error: 'Acesso negado: recurso pertence a outra empresa' });
  }

  next();
};

// Rate limiter para login
const loginRateLimit = rateLimit({
  windowMs: TEST_CONFIG.RATE_LIMIT_WINDOW_MS,
  max: TEST_CONFIG.RATE_LIMIT_MAX_REQUESTS,
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 1 minuto.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const reservationSchema = z.object({
  space_id: z.string(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  participants: z.number().min(1),
  description: z.string().min(1),
});

// Factory da aplicação Express
export function createTestApp(): Express {
  const app = express();

  // Middlewares básicos
  app.use(helmet());
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json());
  app.use(pinoHttp({ logger }));

  // Rotas de autenticação
  app.post('/auth/login', loginRateLimit, async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Simular verificação de credenciais
      const user = {
        id: 'user-1',
        email,
        empresa_id: TEST_CONFIG.EMPRESA_ID_1,
        role: 'admin' as const,
      };

      // Log de auditoria
      logger.info({
        event: 'login_attempt',
        user_id: user.id,
        empresa_id: user.empresa_id,
        ip: req.ip,
        user_agent: req.get('User-Agent'),
      });

      const accessToken = jwt.sign(
        {
          sub: user.id,
          empresa_id: user.empresa_id,
          role: user.role,
          jti: 'jti-' + Date.now(),
          iat: Math.floor(Date.now() / 1000),
        },
        TEST_CONFIG.JWT_SECRET,
        { expiresIn: TEST_CONFIG.JWT_ACCESS_EXPIRES_IN }
      );

      const refreshToken = jwt.sign(
        {
          sub: user.id,
          empresa_id: user.empresa_id,
          role: user.role,
          jti: 'refresh-' + Date.now(),
          iat: Math.floor(Date.now() / 1000),
        },
        TEST_CONFIG.JWT_SECRET,
        { expiresIn: TEST_CONFIG.JWT_REFRESH_EXPIRES_IN }
      );

      res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        user,
      });
    } catch (error) {
      logger.error({ event: 'login_error', error: error.message });
      res.status(400).json({ error: 'Credenciais inválidas' });
    }
  });

  app.post('/auth/refresh', async (req: Request, res: Response) => {
    try {
      const { refresh_token } = req.body;
      const decoded = jwt.verify(refresh_token, TEST_CONFIG.JWT_SECRET) as any;

      const newAccessToken = jwt.sign(
        {
          sub: decoded.sub,
          empresa_id: decoded.empresa_id,
          role: decoded.role,
          jti: 'jti-' + Date.now(),
          iat: Math.floor(Date.now() / 1000),
        },
        TEST_CONFIG.JWT_SECRET,
        { expiresIn: TEST_CONFIG.JWT_ACCESS_EXPIRES_IN }
      );

      res.json({ access_token: newAccessToken });
    } catch (error) {
      res.status(401).json({ error: 'Refresh token inválido' });
    }
  });

  app.post('/auth/logout', authenticateToken, async (req: Request, res: Response) => {
    try {
      // Adicionar token à blacklist
      await redisMock.setex(`blacklist:${req.user.jti}`, 900, '1'); // 15 minutos

      logger.info({
        event: 'logout',
        user_id: req.user.sub,
        empresa_id: req.user.empresa_id,
      });

      res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Rotas protegidas
  app.get('/me', authenticateToken, (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  app.get('/admin/dashboard', authenticateToken, requireRole('admin'), (req: Request, res: Response) => {
    res.json({ message: 'Dashboard administrativo' });
  });

  app.get('/empresas/:empresaId/reservas', authenticateToken, requireEmpresaAccess, (req: Request, res: Response) => {
    res.json({ 
      message: 'Reservas da empresa',
      empresa_id: req.params.empresaId,
      user_empresa_id: req.user.empresa_id,
    });
  });

  app.post('/reservas', authenticateToken, async (req: Request, res: Response) => {
    try {
      const reservationData = reservationSchema.parse(req.body);
      
      // Simular verificação de conflito
      const hasConflict = Math.random() > 0.7; // 30% chance de conflito
      
      if (hasConflict) {
        logger.warn({
          event: 'conflict_detected',
          user_id: req.user.sub,
          empresa_id: req.user.empresa_id,
          reservation_data: reservationData,
        });
        
        return res.status(409).json({ 
          error: 'Conflito de horário detectado',
          details: 'O espaço já está reservado neste período',
        });
      }

      logger.info({
        event: 'reservation_created',
        user_id: req.user.sub,
        empresa_id: req.user.empresa_id,
        reservation_id: 'res-' + Date.now(),
        reservation_data: reservationData,
      });

      res.status(201).json({
        id: 'res-' + Date.now(),
        ...reservationData,
        status: 'confirmada',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          details: error.errors,
        });
      }
      
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Middleware de tratamento de erros
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error({
      event: 'server_error',
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
    });

    res.status(500).json({ error: 'Erro interno do servidor' });
  });

  return app;
}

// Extensão do tipo Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
