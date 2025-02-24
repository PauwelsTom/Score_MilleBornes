import './App.css';

import { Component } from 'react';
import { PlayerList } from './Component/PlayerList';
import { AddPlayer } from './Component/Boutons/AddPlayer';
import { RetourMainPage } from './Component/Boutons/RetourMainPage';
import { PlayerManager } from './Component/PlayerManager';
import { ResetScores } from './Component/Boutons/ResetScores';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      players: JSON.parse(localStorage.getItem('players')) || {},
      selectedPlayer: "",
      inGame: false,
    };

    this.add_player = this.add_player.bind(this);
  }

  // Met a jour la liste des joueurs
  updatePlayer = (players_) => {
    this.setState({players: players_});
    localStorage.setItem('players', JSON.stringify(players_));
  }

  // Ajoute un joueur a la liste
  add_player = () => {
    const name = window.prompt("Nom du nouveau joueur:");
    if (name != null && name !== "") {
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
  select_player = (name) => {
    document.getElementById("MainPage").style.transform = "translateX(-100vw)";
    document.getElementById("PlayerPage").style.transform = "translateX(-100vw)";
    this.setState({selectedPlayer: name});
  }

  // Ajoute une valeur a un score
  add_score = (name, add) => {
    const updatedPlayers = { ...this.state.players };
    updatedPlayers[name] += add;
    this.updatePlayer(updatedPlayers);
    if (!this.state.inGame)
      this.setState({ inGame: true });
    
    this.inGameVisibility();
  }

  // Remet les scores a 0
  resetScores = () => {
    const updatedPlayers = { ...this.state.players };
    for (const player of Object.keys(updatedPlayers)) {
      updatedPlayers[player] = 0;
    }
    this.updatePlayer(updatedPlayers);
    this.setState({ inGame: false });
    this.inGameVisibility();
  }

  // Cache / affiche les elements si on est en partie
  inGameVisibility = () => {
    setTimeout(() => {
      document.getElementById("AddPlayerDiv").style.visibility = this.state.inGame? "hidden": "visible";
  
      const elements = Array.from(document.getElementsByClassName('SupprPlayerDiv'));
      elements.forEach((element) => {
        element.style.visibility = this.state.inGame? "hidden": "visible";
      });
    }, 10);
  }

  componentDidMount() {
    for (const player of Object.keys(this.state.players)) {
      if (this.state.players[player] !== 0)
          this.setState({ inGame: true })
    }
    setTimeout(() => {
      this.inGameVisibility();
    }, 10);
  }

  render() {
    return (
      <div className="App">
        <div id="MainPage">
          <span className='TitrePage'>1000 Bornes</span>
          <AddPlayer add_player={this.add_player} />
          <span className="ListeJoueurTitre">Liste des joueurs</span>
          <PlayerList players={this.state.players} remove_player={this.remove_player} select_player={this.select_player} inGame={this.state.inGame}/>
          <ResetScores reset={this.resetScores}/>
        </div>
        <div id="PlayerPage">
          <RetourMainPage />
          <PlayerManager name={this.state.selectedPlayer} add_score={this.add_score}/>
        </div>
      </div>
    );
  }
}
