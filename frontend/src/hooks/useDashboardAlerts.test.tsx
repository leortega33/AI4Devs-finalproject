import { renderHook, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useDashboardAlerts } from './useDashboardAlerts';
import { dashboardService, type Dashboard } from '../services/dashboardService';

vi.mock('../services/dashboardService', () => ({
  dashboardService: { get: vi.fn() },
}));

const wrapper = ({ children }: { children: ReactNode }) => <MemoryRouter>{children}</MemoryRouter>;

function dashboard(overrides: Partial<Dashboard> = {}): Dashboard {
  return { overduePayments: [], paymentsDueSoon: [], noPayments: [], expiringRoutines: [], ...overrides };
}

describe('useDashboardAlerts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exposes the dashboard and the total alert count', async () => {
    vi.mocked(dashboardService.get).mockResolvedValue(
      dashboard({
        overduePayments: [{ clientId: 1, clientName: 'A' }],
        noPayments: [{ clientId: 2, clientName: 'B' }],
        expiringRoutines: [{ clientId: 3, clientName: 'C', endDate: '2026-01-01', expired: true }],
      }),
    );

    const { result } = renderHook(() => useDashboardAlerts(), { wrapper });

    await waitFor(() => expect(result.current.total).toBe(3));
    expect(result.current.dashboard.overduePayments).toHaveLength(1);
  });

  it('falls back to an empty state on error', async () => {
    vi.mocked(dashboardService.get).mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useDashboardAlerts(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.total).toBe(0);
  });
});
