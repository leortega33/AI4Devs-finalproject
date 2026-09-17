import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@mui/material';
import { SnackbarProvider, useSnackbar } from './SnackbarProvider';

function Trigger() {
  const { notify } = useSnackbar();
  return <Button onClick={() => notify('Guardado', 'success')}>Notificar</Button>;
}

describe('SnackbarProvider / useSnackbar', () => {
  it('shows a message when notify is called', async () => {
    const user = userEvent.setup();
    render(
      <SnackbarProvider>
        <Trigger />
      </SnackbarProvider>,
    );

    expect(screen.queryByText('Guardado')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Notificar' }));

    expect(await screen.findByText('Guardado')).toBeInTheDocument();
  });

  it('can be dismissed', async () => {
    const user = userEvent.setup();
    render(
      <SnackbarProvider>
        <Trigger />
      </SnackbarProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Notificar' }));
    await screen.findByText('Guardado');
    await user.click(screen.getByRole('button', { name: /close/i }));

    await waitForElementToBeRemoved(() => screen.queryByText('Guardado'));
    expect(screen.queryByText('Guardado')).not.toBeInTheDocument();
  });
});
