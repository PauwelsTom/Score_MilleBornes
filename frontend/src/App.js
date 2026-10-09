import './App.css';

import { Component } from 'react';
import { PlayerList } from './Component/PlayerList';
import { AddPlayer } from './Component/Boutons/AddPlayer';
import { PlayerManager } from './Component/PlayerManager';
import { QuitterPartie } from './Component/Boutons/QuitterPartie';
import { DebutPartie } from './Component/Boutons/DebutPartie';
import { FinManche } from './Component/Boutons/FinManche';
import { Confettis } from './Component/Confettis';
import { SuccesPage } from './Component/SuccesPage';
import { VoirSucces } from './Component/Boutons/VoirSucces';

// Animation des scores en fin de manche (en ms)
const ANIMATION_DELAY = 300; // Le temps de revenir sur la page principale
const ANIMATION_DURATION = 3000;
const CONFETTIS_DURATION = 6000;

// Verifie si un joueur a atteint les 5000 points
const hasWinner = (players) => Object.values(players).some(score => score >= 5000);

export default class App extends Component {
  constructor(props) {
    super(props);
    const players = this.loadPlayers();
    this.state = {
      players: players,
      inGame: localStorage.getItem('inGame') === 'true' || Object.values(players).some(score => score !== 0),
      teams: this.loadTeams(),
      history: this.loadHistory(), // Details de chaque manche, pour les succès
      succes: false, // true quand on est sur la page des succès
      gains: this.loadGains(), // Points gagnés a la derniere manche ({nom: points})
      displayedPlayers: null, // Scores affichés pendant l'animation de fin de manche
      confettis: false,
      scoring: false, // true quand on est sur la page de saisie des scores
      round: 0,
      roundDone: false,
    };
  }

  // Recupere les equipes de la derniere manche
  loadTeams = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('teams'));
      if (Array.isArray(saved) && saved.every(team => Array.isArray(team)))
        return saved;
    } catch (error) {
      // Sauvegarde illisible, on repart sans equipes
    }
    return [];
  }

  // Recupere les details des manches de la partie
  loadHistory = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('history'));
      const isRound = (round) => round !== null && typeof round === 'object' && Object.keys(round).length > 0
        && Object.values(round).every(player => player !== null && Number.isFinite(player.points));
      if (Array.isArray(saved) && saved.every(isRound))
        return saved;
    } catch (error) {
      // Sauvegarde illisible, on repart sans historique
    }
    return [];
  }

  // Recupere les points gagnés a la derniere manche
  loadGains = () => {
    const gains = {};
    try {
      const saved = JSON.parse(localStorage.getItem('gains'));
      if (saved !== null && typeof saved === 'object' && !Array.isArray(saved)) {
        for (const name of Object.keys(saved)) {
          if (Number.isFinite(saved[name]))
            gains[name] = saved[name];
        }
      }
    } catch (error) {
      // Sauvegarde illisible, on n'affiche pas les gains
    }
    return gains;
  }

  // Recupere les joueurs sauvegardés (en ignorant les donnees invalides)
  loadPlayers = () => {
    const players = {};
    try {
      const saved = JSON.parse(localStorage.getItem('players'));
      if (saved !== null && typeof saved === 'object' && !Array.isArray(saved)) {
        for (const name of Object.keys(saved)) {
          players[name] = Number.isFinite(saved[name]) ? saved[name] : 0;
        }
      }
    } catch (error) {
      // Sauvegarde illisible, on repart d'une liste vide
    }
    return players;
  }

  // Met a jour la liste des joueurs
  updatePlayer = (players_) => {
    this.setState({players: players_});
    localStorage.setItem('players', JSON.stringify(players_));
  }

  // Met a jour l'etat de la partie (en cours ou non)
  updateInGame = (inGame) => {
    this.setState({inGame: inGame});
    localStorage.setItem('inGame', inGame);
  }

  // Met a jour les details des manches
  updateHistory = (history) => {
    this.setState({history: history});
    localStorage.setItem('history', JSON.stringify(history));
  }

  // Met a jour les equipes
  updateTeams = (teams) => {
    this.setState({teams: teams});
    localStorage.setItem('teams', JSON.stringify(teams));
  }

  // Met a jour les points gagnés a la derniere manche
  updateGains = (gains) => {
    this.setState({gains: gains});
    localStorage.setItem('gains', JSON.stringify(gains));
  }

  // Ajoute un joueur a la liste
  add_player = () => {
    const input = window.prompt("Nom du nouveau joueur:");
    const name = input == null ? "" : input.trim();
    if (name !== "" && !(name in this.state.players)) {
      const updatedPlayers = { ...this.state.players, [name]: 0 };
      this.updatePlayer(updatedPlayers);
    }
  }

  // Retire un joueur de la liste
  remove_player = (name) => {
    const updatedPlayers = { ...this.state.players };
    delete updatedPlayers[name];
    this.updatePlayer(updatedPlayers);
  }

  // Termine la selection des joueurs
  start_game = () => {
    if (Object.keys(this.state.players).length < 2) {
      window.alert("Il faut au moins 2 joueurs pour commencer une partie.");
      return;
    }
    this.updateInGame(true);
  }

  // Va sur la page de saisie des scores
  select_player = () => {
    if (Object.keys(this.state.players).length === 0)
      return;

    this.stopAnimation();

    // Apres une manche validée, on repart d'une saisie vide
    this.setState((prevState) => ({
      scoring: true,
      round: prevState.roundDone ? prevState.round + 1 : prevState.round,
      roundDone: false,
    }));
  }

  // Revient sur la page principale sans valider les scores
  back_to_main = () => {
    this.setState({scoring: false});
  }

  // Ajoute les scores de la manche (scores: {nom: points})
  add_scores = (scores, teams, details) => {
    const updatedPlayers = { ...this.state.players };
    for (const name of Object.keys(scores)) {
      if (name in updatedPlayers)
        updatedPlayers[name] += scores[name];
    }
    this.animateScores(this.state.players, updatedPlayers);
    this.updatePlayer(updatedPlayers);
    this.updateGains(scores);
    this.updateTeams(teams);
    this.updateHistory([...this.state.history, details]);
    this.setState({scoring: false, roundDone: true});
  }

  // Fait monter les scores affichés des anciens vers les nouveaux
  animateScores = (from, to) => {
    this.stopAnimation();
    this.setState({displayedPlayers: from});

    let start = null;
    const step = () => {
      const now = performance.now();
      if (start === null)
        start = now + ANIMATION_DELAY;

      const progress = Math.min(Math.max((now - start) / ANIMATION_DURATION, 0), 1);
      if (progress === 1) {
        this.stopAnimation();
        return;
      }

      const displayed = {};
      for (const name of Object.keys(to)) {
        displayed[name] = Math.round(from[name] + (to[name] - from[name]) * progress);
      }
      this.setState({displayedPlayers: displayed});
      this.animationFrame = requestAnimationFrame(step);
    };
    this.animationFrame = requestAnimationFrame(step);
  }

  // Arrete l'animation et affiche les vrais scores
  stopAnimation = () => {
    cancelAnimationFrame(this.animationFrame);
    this.setState({displayedPlayers: null});
  }

  // Renvoie les vainqueurs : ceux qui ont le plus de points, une fois les scores figés
  getWinners = (state) => {
    if (state.displayedPlayers !== null || !hasWinner(state.players))
      return [];

    const best = Math.max(...Object.values(state.players));
    return Object.keys(state.players).filter(name => state.players[name] === best);
  }

  // Lance les confettis au moment ou le vainqueur est connu
  componentDidUpdate(prevProps, prevState) {
    const hadWinner = this.getWinners(prevState).length > 0;
    const winner = this.getWinners(this.state).length > 0;
    if (winner && !hadWinner) {
      clearTimeout(this.confettisTimeout);
      this.setState({confettis: true});
      this.confettisTimeout = setTimeout(() => this.setState({confettis: false}), CONFETTIS_DURATION);
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.animationFrame);
    clearTimeout(this.confettisTimeout);
  }

  // Quitte la partie et remet les scores a 0
  quitGame = () => {
    setTimeout(() => {
      if (!window.confirm("Voulez-vous quitter la partie ? Les scores seront remis a 0."))
        return;
      
      const updatedPlayers = { ...this.state.players };
      for (const player of Object.keys(updatedPlayers)) {
        updatedPlayers[player] = 0;
      }
      this.stopAnimation();
      this.updatePlayer(updatedPlayers);
      this.updateGains({});
      this.updateHistory([]);
      this.updateTeams([]);
      this.updateInGame(false);
      this.setState({scoring: false, succes: false});
    }, 200);
  }

  // Verifie si une partie est finie
  gameFinished = () => {
    return hasWinner(this.state.players);
  }

  render() {
    const inGame = this.state.inGame;
    const winners = this.getWinners(this.state);
    const shown = (visible) => ({ transform: visible ? "translateX(-100vw)" : "translateX(0vw)" });

    return (
      <div className="App">
        <div id="MainPage" style={shown(this.state.scoring || this.state.succes)}>
          <span className='TitrePage'>1000 Bornes</span>
          {
            inGame ?
              <QuitterPartie quit={this.quitGame}/>
              : <AddPlayer add_player={this.add_player} />
          }
          <span className="ListeJoueurTitre">Liste des joueurs</span>
          <PlayerList players={this.state.displayedPlayers || this.state.players} remove_player={this.remove_player} inGame={inGame} gains={this.state.gains} winners={winners} />
          { !inGame && <DebutPartie start={this.start_game}/> }
          { inGame && !this.gameFinished() && <FinManche select_player={this.select_player}/> }
          { winners.length > 0 && this.state.history.length > 0 && <VoirSucces show={() => this.setState({succes: true})}/> }
        </div>
        { this.state.confettis && <Confettis /> }
        <div id="PlayerPage" style={shown(this.state.scoring)}>
          {
            inGame &&
              <PlayerManager key={this.state.round} players={Object.keys(this.state.players)} teams={this.state.teams}
                on_back={this.back_to_main} on_confirm={this.add_scores}/>
          }
        </div>
        <div id="SuccesPage" style={shown(this.state.succes)}>
          <SuccesPage history={this.state.history} on_back={() => this.setState({succes: false})}/>
        </div>
      </div>
    );
  }
}
