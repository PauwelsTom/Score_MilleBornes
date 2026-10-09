import './App.css';

import { Component } from 'react';
import { PlayerList } from './Component/PlayerList';
import { AddPlayer } from './Component/Boutons/AddPlayer';
import { PlayerManager } from './Component/PlayerManager';
import { ResetScores } from './Component/Boutons/ResetScores';
import { FinManche } from './Component/Boutons/FinManche';

export default class App extends Component {
  constructor(props) {
    super(props);
    const players = this.loadPlayers();
    this.state = {
      players: players,
      selectedPlayer: [],
      inGame: Object.values(players).some(score => score !== 0),
    };
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

  // Change de page pour un joueur
  select_player = () => {
    if (Object.keys(this.state.players).length === 0)
      return;

    document.getElementById("MainPage").style.transform = "translateX(-100vw)";
    document.getElementById("PlayerPage").style.transform = "translateX(-100vw)";
    this.setState({selectedPlayer: Object.keys(this.state.players)});
  }

  remove_seleceted = (toRemove) => {
    let res = [...this.state.selectedPlayer];
    for (const rem of toRemove) {res = res.filter(name => name !== rem);}
    this.setState({selectedPlayer: res});
    return res.length;
  }

  // Ajoute une valeur a un score
  add_score = (name, add, capot) => {
    const updatedPlayers = { ...this.state.players };
    for (const n of name) {updatedPlayers[n] += add;}

    if (capot) {
      for (const n of Object.keys(updatedPlayers)) {
       // Si n n'est pas present dans la liste name, alors on ajoute 500
        if (!name.includes(n))
          updatedPlayers[n] += 500;
      }
    }
    this.updatePlayer(updatedPlayers);
    this.setState({ inGame: true });
  }

  // Remet les scores a 0
  resetScores = () => {
    setTimeout(() => {
      if (!window.confirm("Voulez-vous remettre a 0 les scores ?"))
        return;
      
      const updatedPlayers = { ...this.state.players };
      for (const player of Object.keys(updatedPlayers)) {
        updatedPlayers[player] = 0;
      }
      this.updatePlayer(updatedPlayers);
      this.setState({ inGame: false });
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
    return (
      <div className="App">
        <div id="MainPage">
          <span className='TitrePage'>1000 Bornes</span>
          {
            this.gameFinished()?
              <ResetScores reset={this.resetScores}/>
              :<FinManche select_player={this.select_player}/>
          }
          <span className="ListeJoueurTitre">Liste des joueurs</span>
          <PlayerList players={this.state.players} remove_player={this.remove_player} inGame={this.state.inGame} />
          { 
            this.state.inGame ?
              <ResetScores reset={this.resetScores}/>
              : <AddPlayer add_player={this.add_player} />
          }
        </div>
        <div id="PlayerPage">
          <PlayerManager name={this.state.selectedPlayer} add_score={this.add_score} remove_seleceted={this.remove_seleceted} number_player={Object.keys(this.state.players).length} players={this.state.players}/>
        </div>
      </div>
    );
  }
}
