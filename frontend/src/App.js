import './App.css';

import { Component } from 'react';
import { PlayerList } from './Component/PlayerList';
import { AddPlayer } from './Component/Boutons/AddPlayer';
import { PlayerManager } from './Component/PlayerManager';
import { QuitterPartie } from './Component/Boutons/QuitterPartie';
import { DebutPartie } from './Component/Boutons/DebutPartie';
import { FinManche } from './Component/Boutons/FinManche';

export default class App extends Component {
  constructor(props) {
    super(props);
    const players = this.loadPlayers();
    this.state = {
      players: players,
      inGame: localStorage.getItem('inGame') === 'true' || Object.values(players).some(score => score !== 0),
      teams: this.loadTeams(),
      gains: this.loadGains(), // Points gagnés a la derniere manche ({nom: points})
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
  add_scores = (scores, teams) => {
    const updatedPlayers = { ...this.state.players };
    for (const name of Object.keys(scores)) {
      if (name in updatedPlayers)
        updatedPlayers[name] += scores[name];
    }
    this.updatePlayer(updatedPlayers);
    this.updateGains(scores);
    this.updateTeams(teams);
    this.setState({scoring: false, roundDone: true});
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
      this.updatePlayer(updatedPlayers);
      this.updateGains({});
      this.updateTeams([]);
      this.updateInGame(false);
      this.setState({scoring: false});
    }, 200);
  }

  // Verifie si une partie est finie
  gameFinished = () => {
    const players = this.state.players;
    for (const p of Object.keys(players)) {
      if (players[p] >= 5000)
        return true;
    }
    return false;
  }

  render() {
    const inGame = this.state.inGame;
    const pageStyle = { transform: this.state.scoring ? "translateX(-100vw)" : "translateX(0vw)" };

    return (
      <div className="App">
        <div id="MainPage" style={pageStyle}>
          <span className='TitrePage'>1000 Bornes</span>
          {
            inGame ?
              <QuitterPartie quit={this.quitGame}/>
              : <AddPlayer add_player={this.add_player} />
          }
          <span className="ListeJoueurTitre">Liste des joueurs</span>
          <PlayerList players={this.state.players} remove_player={this.remove_player} inGame={inGame} gains={this.state.gains} />
          { !inGame && <DebutPartie start={this.start_game}/> }
          { inGame && !this.gameFinished() && <FinManche select_player={this.select_player}/> }
        </div>
        <div id="PlayerPage" style={pageStyle}>
          {
            inGame &&
              <PlayerManager key={this.state.round} players={Object.keys(this.state.players)} teams={this.state.teams}
                on_back={this.back_to_main} on_confirm={this.add_scores}/>
          }
        </div>
      </div>
    );
  }
}
