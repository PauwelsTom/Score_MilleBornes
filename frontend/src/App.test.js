import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

const savedPlayers = () => JSON.parse(localStorage.getItem('players'));

beforeEach(() => {
  localStorage.clear();
});

test('renders the main page', () => {
  render(<App />);
  expect(screen.getByText('1000 Bornes')).toBeInTheDocument();
  expect(screen.getByText('Liste des joueurs')).toBeInTheDocument();
});

test('ends a round without any player without creating one', () => {
  render(<App />);
  fireEvent.click(screen.getByText('FinManche'));
  fireEvent.click(screen.getByText('Valider'));
  expect(savedPlayers()).toBeNull();
});

test('ignores unreadable saved data', () => {
  localStorage.setItem('players', '{"Alice": null, "Bob": 200');
  render(<App />);
  expect(screen.getByText('Add Player')).toBeInTheDocument();
});

test('leaving the kilometres empty counts as 0', () => {
  localStorage.setItem('players', JSON.stringify({ Alice: 0, Bob: 0 }));
  const { container } = render(<App />);
  fireEvent.click(screen.getByText('FinManche'));

  const kilometres = container.querySelector('#kilometres');
  fireEvent.focus(kilometres);
  fireEvent.blur(kilometres);
  expect(screen.getByText('+ 0')).toBeInTheDocument();

  fireEvent.click(screen.getByText('Valider'));
  expect(savedPlayers()).toEqual({ Alice: 0, Bob: 500 });
});

test('scores a round played in teams', () => {
  localStorage.setItem('players', JSON.stringify({ Alice: 0, Bob: 0, Chloe: 0, David: 0 }));
  const { container } = render(<App />);
  fireEvent.click(screen.getByText('FinManche'));

  const kilometres = container.querySelector('#kilometres');
  const equipier = container.querySelector('#equipierSelect');

  // Alice + Chloe : 1000 km, 2 bottes, 1 coup-fourré
  fireEvent.click(container.querySelector('#milleBornes'));
  fireEvent.click(container.querySelector('#Botte2'));
  fireEvent.click(container.querySelector('#CF2'));
  fireEvent.click(container.querySelector('#Botte1'));
  expect(screen.getByText('+ 1800')).toBeInTheDocument();
  fireEvent.change(equipier, { target: { value: 'Chloe' } });
  fireEvent.click(screen.getByText('Valider'));

  // Bob + David proposés automatiquement
  expect(equipier.value).toBe('David');
  fireEvent.focus(kilometres);
  fireEvent.change(kilometres, { target: { value: '430' } });
  fireEvent.blur(kilometres);
  expect(kilometres.value).toBe('425');
  fireEvent.click(screen.getByText('Valider'));

  expect(savedPlayers()).toEqual({ Alice: 1800, Bob: 425, Chloe: 1800, David: 425 });
  expect(screen.getAllByText('Reset Scores')).toHaveLength(1);
});

test('selecting "Aucun" again does not count the score twice', () => {
  localStorage.setItem('players', JSON.stringify({ Alice: 0, Bob: 0 }));
  const { container } = render(<App />);
  fireEvent.click(screen.getByText('FinManche'));

  const equipier = container.querySelector('#equipierSelect');
  fireEvent.click(container.querySelector('#milleBornes'));
  fireEvent.change(equipier, { target: { value: 'Bob' } });
  fireEvent.change(equipier, { target: { value: '' } });
  fireEvent.click(screen.getByText('Valider'));

  expect(savedPlayers()).toEqual({ Alice: 1400, Bob: 0 });
});
