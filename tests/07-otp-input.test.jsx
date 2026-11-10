import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OtpInput from '@ex/07-otp-input/OtpInput.jsx';

const boxes = () => screen.getAllByRole('textbox');
const values = () => boxes().map((b) => b.value).join('|');

function setup(props = {}) {
  const user = userEvent.setup();
  const onComplete = vi.fn();
  render(<OtpInput onComplete={onComplete} {...props} />);
  return { user, onComplete };
}

describe('07 · OTP input', () => {
  test('renders 6 labelled boxes by default, and `length` boxes when given', () => {
    const { unmount } = render(<OtpInput />);
    expect(boxes()).toHaveLength(6);
    expect(screen.getByLabelText('Digit 1 of 6')).toBeInTheDocument();
    expect(screen.getByLabelText('Digit 6 of 6')).toBeInTheDocument();
    unmount();
    render(<OtpInput length={4} />);
    expect(boxes()).toHaveLength(4);
    expect(screen.getByLabelText('Digit 4 of 4')).toBeInTheDocument();
  });

  test('typing a digit fills the box and advances focus', async () => {
    const { user } = setup();
    await user.click(boxes()[0]);
    await user.keyboard('1');
    expect(boxes()[0]).toHaveValue('1');
    expect(boxes()[1]).toHaveFocus();
    await user.keyboard('2');
    expect(boxes()[1]).toHaveValue('2');
    expect(boxes()[2]).toHaveFocus();
  });

  test('non-digit characters are ignored', async () => {
    const { user } = setup();
    await user.click(boxes()[0]);
    await user.keyboard('a');
    await user.keyboard(' ');
    await user.keyboard('-');
    expect(boxes()[0]).toHaveValue('');
    expect(boxes()[0]).toHaveFocus();
  });

  test('typing all digits calls onComplete once with the code; focus stays on the last box', async () => {
    const { user, onComplete } = setup();
    await user.click(boxes()[0]);
    await user.keyboard('123456');
    expect(values()).toBe('1|2|3|4|5|6');
    expect(boxes()[5]).toHaveFocus();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  test('typing into a filled box replaces its digit', async () => {
    const { user } = setup();
    await user.click(boxes()[0]);
    await user.keyboard('123');
    await user.click(boxes()[1]);
    await user.keyboard('9');
    expect(boxes()[1]).toHaveValue('9');
    expect(boxes()[2]).toHaveFocus();
    expect(values()).toBe('1|9|3|||');
  });

  test('Backspace on a filled box clears it and keeps focus', async () => {
    const { user } = setup();
    await user.click(boxes()[0]);
    await user.keyboard('12');
    await user.click(boxes()[1]);
    await user.keyboard('{Backspace}');
    expect(boxes()[1]).toHaveValue('');
    expect(boxes()[1]).toHaveFocus();
    expect(boxes()[0]).toHaveValue('1');
  });

  test('Backspace on an empty box moves to the previous box and clears it', async () => {
    const { user } = setup();
    await user.click(boxes()[0]);
    await user.keyboard('123');
    expect(boxes()[3]).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(boxes()[2]).toHaveFocus();
    expect(values()).toBe('1|2||||');
    await user.keyboard('{Backspace}');
    expect(boxes()[1]).toHaveFocus();
    expect(values()).toBe('1|||||');
    await user.keyboard('{Backspace}');
    expect(boxes()[0]).toHaveFocus();
    expect(values()).toBe('|||||');
  });

  test('Backspace on the first empty box does nothing harmful', async () => {
    const { user } = setup();
    await user.click(boxes()[0]);
    await user.keyboard('{Backspace}');
    expect(boxes()[0]).toHaveFocus();
    expect(values()).toBe('|||||');
  });

  test('ArrowLeft / ArrowRight move focus', async () => {
    const { user } = setup();
    await user.click(boxes()[2]);
    await user.keyboard('{ArrowLeft}');
    expect(boxes()[1]).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(boxes()[3]).toHaveFocus();
  });

  test('pasting a full code fills every box and calls onComplete', async () => {
    const { user, onComplete } = setup();
    await user.click(boxes()[0]);
    await user.paste('123456');
    expect(values()).toBe('1|2|3|4|5|6');
    expect(boxes()[5]).toHaveFocus();
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  test('paste strips non-digits and drops overflow', async () => {
    const { user, onComplete } = setup();
    await user.click(boxes()[0]);
    await user.paste('12-34 5678');
    expect(values()).toBe('1|2|3|4|5|6');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  test('pasting in a middle box fills from that box and focuses the next empty one', async () => {
    const { user, onComplete } = setup();
    await user.click(boxes()[1]);
    await user.paste('78');
    expect(values()).toBe('|7|8|||');
    expect(boxes()[3]).toHaveFocus();
    expect(onComplete).not.toHaveBeenCalled();
  });

  test('onComplete is not called while the code is incomplete', async () => {
    const { user, onComplete } = setup();
    await user.click(boxes()[0]);
    await user.keyboard('12345');
    expect(onComplete).not.toHaveBeenCalled();
  });
});
