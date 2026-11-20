import { useState } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '@ex/27-modal-dialog/Modal.jsx';

// A typical parent: owns isOpen and passes a new inline onClose every render.
function App({ onClose = () => {}, label = 'x' }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-testid="app" data-label={label}>
      <button onClick={() => setOpen(true)}>Open settings</button>
      <Modal
        isOpen={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="Settings"
      >
        <p>Change your preferences.</p>
        <label>
          Nickname <input />
        </label>
      </Modal>
    </div>
  );
}

async function setup() {
  const user = userEvent.setup();
  const onClose = vi.fn();
  const utils = render(<App onClose={onClose} />);
  await user.click(screen.getByRole('button', { name: 'Open settings' }));
  return { user, onClose, ...utils };
}

const dialog = () => screen.queryByRole('dialog');

afterEach(() => {
  document.body.style.overflow = '';
});

describe('27 · Modal dialog', () => {
  test('renders nothing while closed', () => {
    render(<App />);
    expect(dialog()).not.toBeInTheDocument();
    expect(screen.queryByText('Change your preferences.')).not.toBeInTheDocument();
  });

  test('opens a dialog named by its title, with its children', async () => {
    await setup();
    const d = screen.getByRole('dialog', { name: 'Settings' });
    expect(d).toHaveAttribute('aria-modal', 'true');
    expect(within(d).getByRole('heading', { level: 2, name: 'Settings' })).toBeInTheDocument();
    expect(within(d).getByText('Change your preferences.')).toBeInTheDocument();
  });

  test('is rendered into document.body through a portal', async () => {
    await setup();
    expect(screen.getByTestId('app')).not.toContainElement(dialog());
    expect(screen.getByTestId('app')).not.toContainElement(screen.getByTestId('modal-backdrop'));
    expect(screen.getByTestId('modal-backdrop')).toContainElement(dialog());
  });

  test('focus moves to the Close button when it opens', async () => {
    await setup();
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus();
  });

  test('the Close button closes it and focus returns to the trigger', async () => {
    const { user, onClose } = await setup();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog()).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open settings' })).toHaveFocus();
  });

  test('Escape closes it', async () => {
    const { user, onClose } = await setup();
    await user.click(screen.getByLabelText('Nickname'));
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog()).not.toBeInTheDocument();
  });

  test('clicking the backdrop closes it; clicking inside does not', async () => {
    const { user, onClose } = await setup();
    await user.click(screen.getByText('Change your preferences.'));
    await user.click(dialog());
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog()).not.toBeInTheDocument();
  });

  test('locks page scroll while open and restores the previous value', async () => {
    document.body.style.overflow = 'scroll';
    const { user } = await setup();
    expect(document.body.style.overflow).toBe('hidden');
    await user.keyboard('{Escape}');
    expect(document.body.style.overflow).toBe('scroll');
  });

  test('leaves no Escape listener behind once closed', async () => {
    const { user, onClose } = await setup();
    await user.keyboard('{Escape}');
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);

    const lonely = vi.fn();
    render(
      <Modal isOpen={false} onClose={lonely} title="Hidden">
        hi
      </Modal>
    );
    await user.keyboard('{Escape}');
    expect(lonely).not.toHaveBeenCalled();
  });

  test('cleans up when unmounted while open', async () => {
    const { unmount } = await setup();
    unmount();
    expect(document.body.style.overflow).toBe('');
    expect(dialog()).not.toBeInTheDocument();
  });

  test('a parent re-render with a new onClose does not move focus', async () => {
    const { user, rerender, onClose } = await setup();
    const input = screen.getByLabelText('Nickname');
    await user.click(input);
    await user.keyboard('Ada');
    rerender(<App onClose={onClose} label="y" />);
    expect(input).toHaveFocus();
    expect(input).toHaveValue('Ada');
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
