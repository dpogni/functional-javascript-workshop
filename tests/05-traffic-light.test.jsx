import { render, screen } from '@testing-library/react';
import TrafficLight from '@ex/05-traffic-light/TrafficLight.jsx';
import { useFakeTimers, advance, pendingTimers } from './helpers.js';

const active = () =>
  ['red', 'green', 'yellow'].filter(
    (c) => screen.getByTestId(`light-${c}`).getAttribute('data-active') === 'true'
  );

beforeEach(() => useFakeTimers());

describe('05 · Self-cycling traffic light', () => {
  test('starts on red with exactly one active light', () => {
    render(<TrafficLight />);
    expect(active()).toEqual(['red']);
  });

  test('red lasts 4000ms by default, then green', () => {
    render(<TrafficLight />);
    advance(3999);
    expect(active()).toEqual(['red']);
    advance(1);
    expect(active()).toEqual(['green']);
  });

  test('cycles red → green → yellow → red with default durations', () => {
    render(<TrafficLight />);
    advance(4000);
    expect(active()).toEqual(['green']);
    advance(2999);
    expect(active()).toEqual(['green']);
    advance(1);
    expect(active()).toEqual(['yellow']);
    advance(999);
    expect(active()).toEqual(['yellow']);
    advance(1);
    expect(active()).toEqual(['red']);
  });

  test('keeps cycling for many rounds without drifting', () => {
    render(<TrafficLight />);
    for (let i = 0; i < 5; i++) {
      advance(4000);
      advance(3000);
      advance(1000);
    }
    expect(active()).toEqual(['red']);
    advance(4000);
    expect(active()).toEqual(['green']);
  });

  test('uses custom durations', () => {
    const durations = { red: 100, green: 200, yellow: 50 };
    render(<TrafficLight durations={durations} />);
    advance(100);
    expect(active()).toEqual(['green']);
    advance(200);
    expect(active()).toEqual(['yellow']);
    advance(50);
    expect(active()).toEqual(['red']);
  });

  test('never has more than one pending timer', () => {
    const { rerender } = render(<TrafficLight />);
    expect(pendingTimers()).toBeLessThanOrEqual(1);
    for (let i = 0; i < 12; i++) {
      advance(1000);
      rerender(<TrafficLight />);
      expect(pendingTimers()).toBeLessThanOrEqual(1);
    }
  });

  test('clears its timer on unmount', () => {
    const { unmount } = render(<TrafficLight />);
    advance(5000);
    unmount();
    expect(pendingTimers()).toBe(0);
  });
});
