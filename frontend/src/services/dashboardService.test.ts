import axios from 'axios';
import { dashboardService } from './dashboardService';

vi.mock('axios', () => {
  const instance = { get: vi.fn() };
  return { default: { create: vi.fn(() => instance) } };
});

const api = (axios.create as unknown as () => { get: ReturnType<typeof vi.fn> })();

describe('dashboardService.get', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns the four alert groups from the API', async () => {
    api.get.mockResolvedValue({
      data: {
        data: {
          overduePayments: [{ clientId: 1, clientName: 'John Doe', periodMonth: 8, periodYear: 2026 }],
          paymentsDueSoon: [],
          noPayments: [],
          expiringRoutines: [],
        },
      },
    });

    const result = await dashboardService.get();

    expect(api.get).toHaveBeenCalledWith('/');
    expect(result.overduePayments).toHaveLength(1);
    expect(result.noPayments).toEqual([]);
  });
});
