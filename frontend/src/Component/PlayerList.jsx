import "./PlayerList.css"

import { Component } from "react";
import { Player } from "./Player";

// players, remove_player
export class PlayerList extends Component {
    constructor(props) {
        super();
    }

    get_rank = (name) => {
        const players = this.props.players;
        const sortedPlayers = Object.entries(players)
            .sort((a, b) => b[1] - a[1]); // Trier par score décroissant
    
        let rank = 1;
        let prevScore = null;
        let playerRanks = {};
    
        for (let i = 0; i < sortedPlayers.length; i++) {
            const [playerName, score] = sortedPlayers[i];
    
            if (score !== prevScore) {
                rank = i + 1; // Ajuster le rang réel
            }
            prevScore = score;
    
            playerRanks[playerName] = rank;
        }
    
        // Si 4 joueurs ou plus, vérifier le dernier rang
        if (sortedPlayers.length >= 4) {
            const lastRank = playerRanks[sortedPlayers[sortedPlayers.length - 1][0]];
            const secondLastRank = playerRanks[sortedPlayers[sortedPlayers.length - 2][0]];
    
            if (lastRank === secondLastRank) {
                // Si le dernier joueur est à égalité avec un autre, on garde leur rang
            } else {
                // Sinon, on met "last" uniquement pour le dernier joueur
                playerRanks[sortedPlayers[sortedPlayers.length - 1][0]] = "last";
            }
        }
    
        return playerRanks[name] || null; // Retourne le rang ou null si joueur non trouvé
    };
    
    

    render() {
        const players = this.props.players;
        const remove_player = this.props.remove_player;

        return (
            <div className="PlayerListDiv">
                
                {Object.keys(players)
                    .sort((a, b) => players[b] - players[a])
                    .map((name, rank) => (
                        <Player key={rank} name={name} score={players[name]} remove_player={remove_player} rank={this.get_rank(name)}/>
                    )
                )}
            </div>
        );
    }
}