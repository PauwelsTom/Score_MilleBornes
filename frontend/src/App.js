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
    this.state = {
      players: JSON.parse(localStorage.getItem('players')) || {},
      selectedPlayer: [],
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
    this.setState({selectedPlayer: Object.keys(this.state.players)});
  }

  remove_seleceted = (toRemove) => {
    let res = [...this.state.selectedPlayer];
    for (const rem of toRemove) {res = res.filter(name => name !== rem);}
    this.setState({selectedPlayer: res});
    return res.length;
  }

  // Ajoute une valeur a un score
  add_score = (name, add) => {
    const updatedPlayers = { ...this.state.players };
    for (const n of name) {updatedPlayers[n] += add;}
    this.updatePlayer(updatedPlayers);
    if (!this.state.inGame)
      this.setState({ inGame: true });
    
    this.inGameVisibility();
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
      this.inGameVisibility();
    }, 200);
  }

  // Cache / affiche les elements si on est en partie
  inGameVisibility = () => {
    setTimeout(() => {
      const elements = Array.from(document.getElementsByClassName('SupprPlayerDiv'));
      elements.forEach((element) => {
        element.style.visibility = this.state.inGame? "hidden": "visible";
      });

      const images = Array.from(document.getElementsByClassName('IconeClassement'));
      images.forEach((image) => {
        image.style.visibility = this.state.inGame? "visible": "hidden";
      });

      const scores = Array.from(document.getElementsByClassName('ScorePlayer'));
      scores.forEach((image) => {
        image.style.visibility = this.state.inGame? "visible": "hidden";
      });
    }, 10);
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
          {
            this.gameFinished()?
              <ResetScores reset={this.resetScores}/>
              :<FinManche select_player={this.select_player}/>
          }
          <span className="ListeJoueurTitre">Liste des joueurs</span>
          <PlayerList players={this.state.players} remove_player={this.remove_player} />
          { 
            this.state.inGame ?
              <ResetScores reset={this.resetScores}/>
              : <AddPlayer add_player={this.add_player} />
          }
        </div>
        <div id="PlayerPage">
          <PlayerManager name={this.state.selectedPlayer} add_score={this.add_score} remove_seleceted={this.remove_seleceted} number_player={Object.keys(this.state.players).length}/>
        </div>
      </div>
    );
  }
}
