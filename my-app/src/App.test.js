import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Fetching contact data', () => {
  render(<App />);
  const linkElement = screen.getByText(/Fetching contact data.../i);
  expect(linkElement).toBeInTheDocument();
});

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});