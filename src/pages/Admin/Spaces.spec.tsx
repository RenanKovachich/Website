import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { theme } from '../../theme';
import { AuthProvider } from '../../contexts/AuthContext';
import AdminSpaces from './Spaces';
import { apiService } from '../../services/api';

// Mock do apiService
vi.mock('../../services/api', () => ({
  apiService: {
    getSpaces: vi.fn(),
    createSpace: vi.fn(),
    updateSpace: vi.fn(),
  },
}));

const mockSpaces = [
  {
    id: '1',
    name: 'Sala de Reunião 1',
    type: 'sala_reuniao' as const,
    capacity: 10,
    status: 'active' as const,
    description: 'Sala de reunião para pequenos grupos',
    empresaId: '1',
    empresa: undefined,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <AuthProvider>
            {component}
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('AdminSpaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getSpaces).mockResolvedValue(mockSpaces);
    vi.mocked(apiService.createSpace).mockResolvedValue({
      id: '3',
      name: 'Nova Sala',
      type: 'sala_reuniao',
      capacity: 15,
      status: 'active',
      description: 'Nova sala criada',
      empresaId: '1',
      empresa: undefined,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    });
  });

  it('deve renderizar a página corretamente', async () => {
    renderWithProviders(<AdminSpaces />);

    expect(screen.getByTestId('admin-spaces-title')).toHaveTextContent('Espaços');
    expect(screen.getByTestId('btn-new-space')).toBeInTheDocument();
    expect(screen.getByTestId('grid-spaces')).toBeInTheDocument();

    await waitFor(() => {
      expect(apiService.getSpaces).toHaveBeenCalled();
    });
  });

  it('deve exibir a lista de espaços', async () => {
    renderWithProviders(<AdminSpaces />);

    await waitFor(() => {
      expect(screen.getByText('Sala de Reunião 1')).toBeInTheDocument();
    });
  });

  it('deve abrir o diálogo de novo espaço', async () => {
    renderWithProviders(<AdminSpaces />);

    await waitFor(() => {
      expect(screen.getByTestId('btn-new-space')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('btn-new-space'));

    expect(screen.getByRole('heading', { name: 'Novo Espaço' })).toBeInTheDocument();
  });

  it('deve fechar o diálogo ao cancelar', async () => {
    renderWithProviders(<AdminSpaces />);

    await waitFor(() => {
      expect(screen.getByTestId('btn-new-space')).toBeInTheDocument();
    });

    // Abre o diálogo
    fireEvent.click(screen.getByTestId('btn-new-space'));

    expect(screen.getByRole('heading', { name: 'Novo Espaço' })).toBeInTheDocument();

    // Cancela
    fireEvent.click(screen.getByText('Cancelar'));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Novo Espaço' })).not.toBeInTheDocument();
    });
  });
});