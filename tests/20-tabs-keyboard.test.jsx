import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Tabs from '@ex/20-tabs-keyboard/Tabs.jsx';

const TABS = [
  { id: 'html', label: 'HTML', content: 'Structure of the page' },
  { id: 'css', label: 'CSS', content: 'Style of the page' },
  { id: 'js', label: 'JavaScript', content: 'Behaviour of the page' },
];

const tab = (name) => screen.getByRole('tab', { name });
const selected = () =>
  screen.getAllByRole('tab').filter((t) => t.getAttribute('aria-selected') === 'true').map((t) => t.textContent);
const panel = () => screen.getByRole('tabpanel').textContent;

describe('20 · Refs to many elements: keyboard-navigable tabs', () => {
  test('renders a tablist with one tab per item; first is selected', () => {
    render(<Tabs tabs={TABS} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual(['HTML', 'CSS', 'JavaScript']);
    expect(selected()).toEqual(['HTML']);
    expect(panel()).toBe('Structure of the page');
  });

  test('only the selected content is rendered', () => {
    render(<Tabs tabs={TABS} />);
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
    expect(screen.queryByText('Style of the page')).not.toBeInTheDocument();
  });

  test('clicking a tab selects it', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={TABS} />);
    await user.click(tab('JavaScript'));
    expect(selected()).toEqual(['JavaScript']);
    expect(panel()).toBe('Behaviour of the page');
  });

  test('selected tab has tabIndex 0, the others -1', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={TABS} />);
    expect(screen.getAllByRole('tab').map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    await user.click(tab('CSS'));
    expect(screen.getAllByRole('tab').map((t) => t.tabIndex)).toEqual([-1, 0, -1]);
  });

  test('ArrowRight selects the next tab and moves focus to it', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={TABS} />);
    await user.click(tab('HTML'));
    await user.keyboard('{ArrowRight}');
    expect(selected()).toEqual(['CSS']);
    expect(tab('CSS')).toHaveFocus();
    expect(panel()).toBe('Style of the page');
    await user.keyboard('{ArrowRight}');
    expect(selected()).toEqual(['JavaScript']);
    expect(tab('JavaScript')).toHaveFocus();
  });

  test('ArrowLeft selects the previous tab and moves focus to it', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={TABS} />);
    await user.click(tab('JavaScript'));
    await user.keyboard('{ArrowLeft}');
    expect(selected()).toEqual(['CSS']);
    expect(tab('CSS')).toHaveFocus();
  });

  test('arrows wrap around at both ends', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={TABS} />);
    await user.click(tab('HTML'));
    await user.keyboard('{ArrowLeft}');
    expect(selected()).toEqual(['JavaScript']);
    expect(tab('JavaScript')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(selected()).toEqual(['HTML']);
    expect(tab('HTML')).toHaveFocus();
  });

  test('other keys do nothing', async () => {
    const user = userEvent.setup();
    render(<Tabs tabs={TABS} />);
    await user.click(tab('CSS'));
    await user.keyboard('{ArrowDown}x');
    expect(selected()).toEqual(['CSS']);
  });
});
