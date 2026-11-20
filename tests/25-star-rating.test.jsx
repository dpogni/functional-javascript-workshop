import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StarRating from '@ex/25-star-rating/StarRating.jsx';

const star = (n) => screen.getByRole('button', { name: n === 1 ? '1 star' : `${n} stars` });
const stars = () => screen.getAllByRole('button').filter((b) => b.hasAttribute('data-filled'));
const filled = () => stars().filter((b) => b.getAttribute('data-filled') === 'true').length;
const label = () => screen.getByTestId('rating-label').textContent.trim();
const group = () => screen.getByRole('group', { name: 'Rating' });

function setup(props = {}) {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<StarRating onChange={onChange} {...props} />);
  return { user, onChange };
}

describe('25 · Star rating', () => {
  test('renders 5 labelled stars in a Rating group, none filled', () => {
    setup();
    expect(group()).toBeInTheDocument();
    expect(stars()).toHaveLength(5);
    expect(star(1)).toBeInTheDocument();
    expect(star(5)).toBeInTheDocument();
    expect(filled()).toBe(0);
    expect(label()).toBe('No rating');
  });

  test('renders `max` stars', () => {
    setup({ max: 10 });
    expect(stars()).toHaveLength(10);
    expect(star(10)).toBeInTheDocument();
  });

  test('starts at initialRating', () => {
    setup({ initialRating: 3 });
    expect(filled()).toBe(3);
    expect(star(3)).toHaveAttribute('data-filled', 'true');
    expect(star(4)).toHaveAttribute('data-filled', 'false');
    expect(label()).toBe('3 out of 5');
  });

  test('clicking a star sets the rating and calls onChange', async () => {
    const { user, onChange } = setup();
    await user.click(star(4));
    expect(filled()).toBe(4);
    expect(label()).toBe('4 out of 5');
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(4);
    await user.click(star(2));
    await user.unhover(group());
    expect(filled()).toBe(2);
    expect(onChange).toHaveBeenLastCalledWith(2);
  });

  test('clicking the current rating clears it', async () => {
    const { user, onChange } = setup({ initialRating: 3 });
    await user.click(star(3));
    expect(label()).toBe('No rating');
    expect(onChange).toHaveBeenLastCalledWith(0);
    await user.unhover(group());
    expect(filled()).toBe(0);
  });

  test('hovering previews without changing the rating', async () => {
    const { user, onChange } = setup({ initialRating: 1 });
    await user.hover(star(4));
    expect(filled()).toBe(4);
    expect(label()).toBe('1 out of 5');
    expect(onChange).not.toHaveBeenCalled();
    await user.unhover(group());
    expect(filled()).toBe(1);
  });

  test('the hover preview can be lower than the rating', async () => {
    const { user } = setup({ initialRating: 5 });
    await user.hover(star(2));
    expect(filled()).toBe(2);
    await user.hover(star(3));
    expect(filled()).toBe(3);
    await user.unhover(group());
    expect(filled()).toBe(5);
  });

  test('works with the keyboard', async () => {
    const { user, onChange } = setup();
    await user.tab();
    expect(star(1)).toHaveFocus();
    await user.tab();
    await user.tab();
    expect(star(3)).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(label()).toBe('3 out of 5');
    await user.tab();
    await user.keyboard(' ');
    expect(label()).toBe('4 out of 5');
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
