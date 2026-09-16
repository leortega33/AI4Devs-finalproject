import axios from 'axios';
import { paymentService } from './paymentService';

vi.mock('axios', () => {
  const instance = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() };
  return { default: { create: vi.fn(() => instance) } };
});

// The two axios instances in the service share this mocked instance.
const api = (axios.create as unknown as () => { get: ReturnType<typeof vi.fn> })();

describe('paymentService.exportPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();
  });

  it('requests the export as a blob and triggers a download', async () => {
    api.get.mockResolvedValue({ data: new Blob(['%PDF-'], { type: 'application/pdf' }) });
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    await paymentService.exportPdf(3, 'en');

    expect(api.get).toHaveBeenCalledWith('/3/payments/export', {
      params: { lang: 'en' },
      responseType: 'blob',
    });
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    clickSpy.mockRestore();
  });
});
