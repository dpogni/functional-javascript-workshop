import { render, screen, fireEvent } from '@testing-library/react';
import Accordion, { AccordionItem } from '@ex/04-lifting-state/Accordion.jsx';

const ITEMS = [
  { id: 'a', title: 'What is React?', content: 'A UI library.' },
  { id: 'b', title: 'What is JSX?', content: 'Syntax sugar for createElement.' },
  { id: 'c', title: 'What is a hook?', content: 'A function that taps into React features.' },
];

const header = (name) => screen.getByRole('button', { name });
const openContents = () => ITEMS.filter((i) => screen.queryByText(i.content)).map((i) => i.id);

describe('04 · Lifting state up: AccordionItem (controlled child)', () => {
  test('shows content only when isOpen, and reflects it in aria-expanded', () => {
    const { rerender } = render(
      <AccordionItem title="Title" content="Body" isOpen={false} onToggle={() => {}} />
    );
    expect(header('Title')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
    rerender(<AccordionItem title="Title" content="Body" isOpen={true} onToggle={() => {}} />);
    expect(header('Title')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  test('clicking calls onToggle', () => {
    const onToggle = vi.fn();
    render(<AccordionItem title="Title" content="Body" isOpen={false} onToggle={onToggle} />);
    fireEvent.click(header('Title'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  test('has no state of its own: stays closed if the parent says closed', () => {
    render(<AccordionItem title="Title" content="Body" isOpen={false} onToggle={() => {}} />);
    fireEvent.click(header('Title'));
    fireEvent.click(header('Title'));
    fireEvent.click(header('Title'));
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
    expect(header('Title')).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('04 · Lifting state up: Accordion (parent owns the state)', () => {
  test('renders every title, all closed', () => {
    render(<Accordion items={ITEMS} />);
    for (const item of ITEMS) {
      expect(header(item.title)).toHaveAttribute('aria-expanded', 'false');
    }
    expect(openContents()).toEqual([]);
  });

  test('clicking a title opens it', () => {
    render(<Accordion items={ITEMS} />);
    fireEvent.click(header('What is JSX?'));
    expect(openContents()).toEqual(['b']);
    expect(header('What is JSX?')).toHaveAttribute('aria-expanded', 'true');
  });

  test('opening another item closes the previous one', () => {
    render(<Accordion items={ITEMS} />);
    fireEvent.click(header('What is React?'));
    fireEvent.click(header('What is a hook?'));
    expect(openContents()).toEqual(['c']);
    expect(header('What is React?')).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking the open item closes it', () => {
    render(<Accordion items={ITEMS} />);
    fireEvent.click(header('What is React?'));
    fireEvent.click(header('What is React?'));
    expect(openContents()).toEqual([]);
    fireEvent.click(header('What is React?'));
    expect(openContents()).toEqual(['a']);
  });
});
