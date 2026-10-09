import { render, screen, fireEvent, within, act } from '@testing-library/react';
import App from './App';
import { getSucces } from './succes';

const savedPlayers = () => JSON.parse(localStorage.getItem('players'));

// Lance l'application avec une partie en cours et ouvre la saisie des scores
const startRound = (players) => {
  localStorage.setItem('players', JSON.stringify(players));
  localStorage.setItem('inGame', 'true');
  const view = render(<App />);
  fireEvent.click(screen.getByText('Fin manche'));
  return view.container;
};

// Renvoie la saisie affichée (les autres onglets sont inertes)
const panneau = (container) => container.querySelector('.Panneau:not([inert])');
const onglets = (container) => Array.from(container.querySelectorAll('.Onglet')).map((o) => o.textContent);

beforeEach(() => {
  localStorage.clear();
  window.alert = jest.fn();
  window.prompt = jest.fn();
  window.confirm = jest.fn(() => true);
  jest.useRealTimers();
});

test('player selection shows Add Player and Début partie', () => {
  render(<App />);
  expect(screen.getByText('1000 Bornes')).toBeInTheDocument();
  expect(screen.getByText('Add Player')).toBeInTheDocument();
  expect(screen.getByText('Début partie')).toBeInTheDocument();
  expect(screen.queryByText('Fin manche')).toBeNull();
  expect(screen.queryByText('Quitter partie')).toBeNull();
});

test('a game needs at least 2 players to start', () => {
  window.prompt.mockReturnValueOnce('Alice');
  render(<App />);
  fireEvent.click(screen.getByText('Add Player'));
  fireEvent.click(screen.getByText('Début partie'));
  expect(window.alert).toHaveBeenCalled();
  expect(screen.getByText('Add Player')).toBeInTheDocument();
});

test('Début partie switches to the in-game buttons and survives a reload', () => {
  localStorage.setItem('players', JSON.stringify({ Alice: 0, Bob: 0 }));
  const { unmount } = render(<App />);
  fireEvent.click(screen.getByText('Début partie'));
  expect(screen.getByText('Quitter partie')).toBeInTheDocument();
  expect(screen.getByText('Fin manche')).toBeInTheDocument();
  expect(screen.queryByText('Add Player')).toBeNull();

  unmount();
  render(<App />);
  expect(screen.getByText('Fin manche')).toBeInTheDocument();
});

test('Quitter partie resets the scores and goes back to player selection', () => {
  jest.useFakeTimers();
  localStorage.setItem('players', JSON.stringify({ Alice: 1200, Bob: 300 }));
  localStorage.setItem('gains', JSON.stringify({ Alice: 900, Bob: 300 }));
  render(<App />);
  expect(screen.getByText('(+900)')).toBeInTheDocument();
  fireEvent.click(screen.getByText('Quitter partie'));
  act(() => { jest.runAllTimers(); });
  expect(savedPlayers()).toEqual({ Alice: 0, Bob: 0 });
  expect(screen.queryByText('(+900)')).toBeNull();
  expect(screen.getByText('Début partie')).toBeInTheDocument();
});

test('ignores unreadable saved data', () => {
  localStorage.setItem('players', '{"Alice": null, "Bob": 200');
  render(<App />);
  expect(screen.getByText('Add Player')).toBeInTheDocument();
});

test('Retour keeps the scores being entered and sends nothing', () => {
  const container = startRound({ Alice: 0, Bob: 0 });
  fireEvent.click(panneau(container).querySelector('.milleBornes'));
  fireEvent.click(within(container.querySelector('#PlayerPage')).getByText('Retour'));
  expect(container.querySelector('#MainPage').style.transform).toBe('translateX(0vw)');
  expect(savedPlayers()).toEqual({ Alice: 0, Bob: 0 });

  fireEvent.click(screen.getByText('Fin manche'));
  // Le capot (Bob est a 0 km) est affiché a part
  expect(within(panneau(container)).getByText('+ 1400')).toBeInTheDocument();
  expect(within(panneau(container)).getByText('+500 (capot)')).toBeVisible();
});

test('scores are sent all at once on the last tab', () => {
  const container = startRound({ Alice: 0, Bob: 0, Chloe: 0 });
  expect(onglets(container)).toEqual(['Alice', 'Bob', 'Chloe']);

  // Alice : champ kilometres laissé vide -> 0 km (capot)
  const kilometres = panneau(container).querySelector('.CategoryInput');
  fireEvent.focus(kilometres);
  fireEvent.blur(kilometres);
  // Bob et Chloe sont encore a 0 km : 2 capots en direct
  expect(within(panneau(container)).getByText('+ 0')).toBeInTheDocument();
  expect(within(panneau(container)).getByText('+1000 (capot)')).toBeVisible();
  fireEvent.click(screen.getByText('Suivant >'));

  // Bob : 430 km arrondis a 425, 2 bottes dont 1 coup-fourré
  expect(within(panneau(container)).getByText('Bob')).toBeInTheDocument();
  const kmBob = panneau(container).querySelector('.CategoryInput');
  fireEvent.focus(kmBob);
  fireEvent.change(kmBob, { target: { value: '430' } });
  fireEvent.blur(kmBob);
  expect(kmBob.value).toBe('425');
  const [bottes, coupFourres] = panneau(container).querySelectorAll('.ManagerCategory:has(.BoutonNumero)');
  fireEvent.click(within(bottes).getByText('2'));
  fireEvent.click(within(coupFourres).getByText('2'));
  fireEvent.click(within(bottes).getByText('1'));
  expect(within(panneau(container)).getByText('+ 825')).toBeInTheDocument();
  expect(within(panneau(container)).getByText('+1000 (capot)')).toBeVisible();
  fireEvent.click(screen.getByText('Suivant >'));
  expect(savedPlayers()).toEqual({ Alice: 0, Bob: 0, Chloe: 0 });

  // On revient sur Alice par son onglet, puis on va au dernier
  fireEvent.click(within(container.querySelector('.OngletsDiv')).getByText('Alice'));
  expect(screen.getByText('Suivant >')).toBeInTheDocument();
  fireEvent.click(within(container.querySelector('.OngletsDiv')).getByText('Chloe'));
  fireEvent.click(panneau(container).querySelector('.milleBornes'));
  expect(within(panneau(container)).getByText('+ 1400')).toBeInTheDocument();
  expect(within(panneau(container)).getByText('+500 (capot)')).toBeVisible();

  // Le capot de Chloe a disparu des autres onglets
  fireEvent.click(within(container.querySelector('.OngletsDiv')).getByText('Bob'));
  expect(within(panneau(container)).getByText('+ 825')).toBeInTheDocument();
  expect(within(panneau(container)).getByText('+500 (capot)')).toBeVisible();
  fireEvent.click(within(container.querySelector('.OngletsDiv')).getByText('Chloe'));
  fireEvent.click(screen.getByText('Confirmer'));

  expect(savedPlayers()).toEqual({ Alice: 0, Bob: 1325, Chloe: 1900 });

  // Les points gagnés sur la manche sont affichés sous les scores
  const mainPage = within(container.querySelector('#MainPage'));
  expect(mainPage.getByText('(+1325)')).not.toHaveClass('GainFaible');
  expect(mainPage.getByText('(+1900)')).not.toHaveClass('GainFaible');
  expect(mainPage.getByText('(+0)')).toHaveClass('GainFaible');
  expect(container.querySelector('#MainPage').style.transform).toBe('translateX(0vw)');

  // La manche suivante repart d'une saisie vide
  fireEvent.click(screen.getByText('Fin manche'));
  expect(within(panneau(container)).getByText('Alice')).toBeInTheDocument();
  expect(within(panneau(container)).getByText('+ 0')).toBeInTheDocument();
});

test('tabs follow the teams and teams are kept for the next round', () => {
  const container = startRound({ Alice: 0, Bob: 0, Chloe: 0, David: 0 });

  // Alice + Chloe -> Bob + David proposés automatiquement
  fireEvent.change(panneau(container).querySelector('.EquipierSelect'), { target: { value: 'Chloe' } });
  expect(onglets(container)).toEqual(['Alice & Chloe', 'Bob & David']);

  // Retour a "Aucun" : Chloe retrouve son onglet et le score n'est compté qu'une fois
  fireEvent.change(panneau(container).querySelector('.EquipierSelect'), { target: { value: '' } });
  expect(onglets(container)).toEqual(['Alice', 'Chloe', 'Bob & David']);
  fireEvent.change(panneau(container).querySelector('.EquipierSelect'), { target: { value: 'Chloe' } });
  expect(onglets(container)).toEqual(['Alice & Chloe', 'Bob & David']);

  fireEvent.click(panneau(container).querySelector('.milleBornes'));
  fireEvent.click(screen.getByText('Suivant >'));
  const kilometres = panneau(container).querySelector('.CategoryInput');
  fireEvent.change(kilometres, { target: { value: '200' } });
  fireEvent.click(screen.getByText('Confirmer'));
  expect(savedPlayers()).toEqual({ Alice: 1400, Bob: 200, Chloe: 1400, David: 200 });

  fireEvent.click(screen.getByText('Fin manche'));
  expect(onglets(container)).toEqual(['Alice & Chloe', 'Bob & David']);
});

test('picking a player already in a team rearranges the teams', () => {
  localStorage.setItem('teams', JSON.stringify([['Alice', 'Chloe'], ['Bob', 'David']]));
  const container = startRound({ Alice: 0, Bob: 0, Chloe: 0, David: 0, Emma: 0 });
  expect(onglets(container)).toEqual(['Alice & Chloe', 'Bob & David', 'Emma']);

  // Alice prend David (equipier de Bob) : Chloe va avec Bob
  fireEvent.change(panneau(container).querySelector('.EquipierSelect'), { target: { value: 'David' } });
  expect(onglets(container)).toEqual(['Alice & David', 'Bob & Chloe', 'Emma']);

  // Alice prend Bob (premier de son equipe) : David va avec Chloe
  fireEvent.change(panneau(container).querySelector('.EquipierSelect'), { target: { value: 'Bob' } });
  expect(onglets(container)).toEqual(['Alice & Bob', 'Chloe & David', 'Emma']);

  // Alice prend Emma (seule) : Bob se retrouve seul
  fireEvent.change(panneau(container).querySelector('.EquipierSelect'), { target: { value: 'Emma' } });
  expect(onglets(container)).toEqual(['Alice & Emma', 'Chloe & David', 'Bob']);

  // Depuis le dernier onglet, Bob prend Emma : Alice se retrouve seule et on reste sur Bob
  fireEvent.click(within(container.querySelector('.OngletsDiv')).getByText('Bob'));
  fireEvent.change(panneau(container).querySelector('.EquipierSelect'), { target: { value: 'Emma' } });
  expect(onglets(container)).toEqual(['Alice', 'Chloe & David', 'Bob & Emma']);
  expect(within(panneau(container)).getByText('Bob & Emma')).toBeInTheDocument();
});

test('scores count up for 3 seconds after a round', () => {
  jest.useFakeTimers();
  const container = startRound({ Alice: 100, Bob: 0 });
  const names = () => Array.from(container.querySelectorAll('.PlayerName')).map((n) => n.textContent);
  const scores = () => Array.from(container.querySelectorAll('.ScorePlayer')).map((s) => Number(s.textContent));

  // Bob fait 1000 km (+1400), Alice fait 25 km
  fireEvent.click(screen.getByText('Suivant >'));
  fireEvent.click(panneau(container).querySelector('.milleBornes'));
  fireEvent.click(within(container.querySelector('.OngletsDiv')).getByText('Alice'));
  fireEvent.change(panneau(container).querySelector('.CategoryInput'), { target: { value: '25' } });
  fireEvent.click(screen.getByText('Suivant >'));
  fireEvent.click(screen.getByText('Confirmer'));
  expect(savedPlayers()).toEqual({ Alice: 125, Bob: 1400 });

  // Au depart les anciens scores sont affichés, dans l'ancien ordre
  expect(names()).toEqual(['Alice', 'Bob']);
  expect(scores()).toEqual([100, 0]);

  // A mi-parcours Bob est passé devant
  act(() => { jest.advanceTimersByTime(1800); });
  expect(names()).toEqual(['Bob', 'Alice']);
  expect(scores()[0]).toBeGreaterThan(400);
  expect(scores()[0]).toBeLessThan(1000);

  act(() => { jest.advanceTimersByTime(2000); });
  expect(scores()).toEqual([1400, 125]);
});

test('confettis fall when a player reaches 5000', () => {
  jest.useFakeTimers();
  const container = startRound({ Alice: 4000, Bob: 0 });
  fireEvent.click(panneau(container).querySelector('.milleBornes'));
  fireEvent.click(screen.getByText('Suivant >'));
  fireEvent.change(panneau(container).querySelector('.CategoryInput'), { target: { value: '25' } });
  fireEvent.click(screen.getByText('Confirmer'));

  // Pas de vainqueur tant que les scores ne sont pas figés, meme au dessus de 5000
  act(() => { jest.advanceTimersByTime(3000); });
  expect(Number(container.querySelector('.ScorePlayer').textContent)).toBeGreaterThan(5000);
  expect(container.querySelector('.ConfettisDiv')).toBeNull();
  expect(container.querySelector('.PlayerWin')).toBeNull();

  act(() => { jest.advanceTimersByTime(500); });
  expect(container.querySelector('.ConfettisDiv')).not.toBeNull();
  expect(within(container.querySelector('.PlayerWin')).getByText('Alice')).toBeInTheDocument();

  act(() => { jest.advanceTimersByTime(6000); });
  expect(container.querySelector('.ConfettisDiv')).toBeNull();
});

const stats = (points, bottes = 0, cf = 0, capot = false, couronnement = false) =>
  ({ points, bottes, cf, capot, couronnement });
const succesOf = (history) => Object.fromEntries(getSucces(history).map((s) => [s.title, s]));

test('achievements are computed from the rounds of the game', () => {
  const succes = succesOf([
    { Alice: stats(1900, 2, 1, false, true), Bob: stats(200, 1), Chloe: stats(0, 0, 0, true) },
    { Alice: stats(1500, 1, 1), Bob: stats(600, 3), Chloe: stats(100) },
  ]);

  expect(succes['Le plus de points en une manche']).toMatchObject({ players: ['Alice'], value: 1900 });
  expect(succes['Le moins de points en une manche']).toMatchObject({ players: ['Chloe'], value: 0 });
  expect(succes['Le plus de bottes']).toMatchObject({ players: ['Bob'], value: 4 });
  expect(succes['Le plus de coups fourrés']).toMatchObject({ players: ['Alice'], value: 2 });
  expect(succes['Le plus souvent fini capot']).toMatchObject({ players: ['Chloe'], value: 1 });
  expect(succes['Le plus de couronnements']).toMatchObject({ players: ['Alice'], value: 1 });
  expect(succes['Que des victoires'].players).toEqual(['Alice']);
  expect(succes['Que des défaites'].players).toEqual(['Chloe']);
});

test('conditional achievements are hidden when nobody earned them', () => {
  const succes = succesOf([
    { Alice: stats(1900), Bob: stats(200) },
    { Alice: stats(100), Bob: stats(600) },
  ]);

  expect(succes['Que des victoires']).toBeUndefined();
  expect(succes['Que des défaites']).toBeUndefined();
  // Personne n'a de botte : la statistique n'est pas affichée
  expect(succes['Le plus de bottes']).toBeUndefined();
  expect(succes['Le plus de points en une manche']).toMatchObject({ players: ['Alice'], value: 1900 });
});

test('the achievements page opens once the game is finished', () => {
  jest.useFakeTimers();
  const container = startRound({ Alice: 4000, Bob: 0 });
  expect(screen.queryByText('Succès', { selector: '.VoirSuccesDiv' })).toBeNull();

  // Alice : 1000 km, 1 botte en coup-fourré, couronnement. Bob : capot
  const [bottes, coupFourres] = panneau(container).querySelectorAll('.ManagerCategory:has(.BoutonNumero)');
  fireEvent.click(panneau(container).querySelector('.milleBornes'));
  fireEvent.click(within(bottes).getByText('1'));
  fireEvent.click(within(coupFourres).getByText('1'));
  fireEvent.click(panneau(container).querySelectorAll('.CategoryCheckbox')[1]);
  fireEvent.click(screen.getByText('Suivant >'));
  fireEvent.click(screen.getByText('Confirmer'));
  act(() => { jest.advanceTimersByTime(4000); });
  expect(savedPlayers()).toEqual({ Alice: 6600, Bob: 0 });

  fireEvent.click(screen.getByText('Succès', { selector: '.VoirSuccesDiv' }));
  expect(container.querySelector('#SuccesPage').style.transform).toBe('translateX(-100vw)');
  const cards = Array.from(container.querySelectorAll('.SuccesDiv')).map((card) => card.textContent);
  expect(cards).toEqual([
    'Que des victoiresAlice',
    'Que des défaitesBob',
    'Le plus de points en une mancheAlice2600',
    'Le moins de points en une mancheBob0',
    'Le plus de bottesAlice1',
    'Le plus de coups fourrésAlice1',
    'Le plus souvent fini capotBob1',
    'Le plus de couronnementsAlice1',
  ]);
  expect(container.querySelectorAll('.SuccesDiv')[0]).toHaveClass('Succesvictoire');
  expect(container.querySelectorAll('.SuccesDiv')[1]).toHaveClass('Succesdefaite');

  fireEvent.click(within(container.querySelector('#SuccesPage')).getByText('Retour'));
  expect(container.querySelector('#MainPage').style.transform).toBe('translateX(0vw)');
});

test('Fin manche is hidden once a player reaches 5000', () => {
  localStorage.setItem('players', JSON.stringify({ Alice: 5200, Bob: 300, Chloe: 5600 }));
  const { container } = render(<App />);
  expect(container.querySelector('.ConfettisDiv')).toBeNull();

  // Seul le joueur avec le plus de points est vainqueur
  const winners = container.querySelectorAll('.PlayerWin');
  expect(winners).toHaveLength(1);
  expect(within(winners[0]).getByText('Chloe')).toBeInTheDocument();

  // Les autres joueurs a 5000 ou plus sont en vert clair
  const finished = container.querySelectorAll('.PlayerFinished');
  expect(finished).toHaveLength(1);
  expect(within(finished[0]).getByText('Alice')).toBeInTheDocument();
  expect(screen.getByText('Quitter partie')).toBeInTheDocument();
  expect(screen.queryByText('Fin manche')).toBeNull();
});
