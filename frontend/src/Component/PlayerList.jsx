import "./PlayerList.css"

import { Component, createRef } from "react";
import { Player } from "./Player";

// players, remove_player, inGame, gains, winners
export class PlayerList extends Component {
    listRef = createRef();

    // Noms des joueurs triés par score décroissant
    sortedNames = (players) => {
        return Object.keys(players).sort((a, b) => players[b] - players[a]);
    }

    // Avant un changement de classement, retient la position a l'ecran de chaque joueur
    getSnapshotBeforeUpdate(prevProps) {
        const before = this.sortedNames(prevProps.players);
        const after = this.sortedNames(this.props.players);
        if (this.listRef.current === null || before.join("\n") === after.join("\n")) {
            return null;
        }

        const positions = {};
        Array.from(this.listRef.current.children).forEach((element, index) => {
            positions[before[index]] = element.getBoundingClientRect().top;
        });
        return positions;
    }

    // Fait glisser les joueurs de leur ancienne place vers la nouvelle
    componentDidUpdate(prevProps, prevState, positions) {
        if (positions === null) { return; }

        const names = this.sortedNames(this.props.players);
        Array.from(this.listRef.current.children).forEach((element, index) => {
            const before = positions[names[index]];
            if (before === undefined || typeof element.animate !== "function") { return; }

            element.getAnimations().forEach((animation) => animation.cancel());
            const delta = before - element.getBoundingClientRect().top;
            if (delta !== 0) {
                element.animate(
                    [{ transform: `translateY(${delta}px)` }, { transform: "translateY(0px)" }],
                    { duration: 300, easing: "ease" }
                );
            }
        });
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
            <div className="PlayerListDiv" ref={this.listRef}>
                
                {this.sortedNames(players)
                    .map((name) => (
                        <Player key={name} name={name} score={players[name]} remove_player={remove_player} inGame={this.props.inGame} gain={this.props.gains[name]} winner={this.props.winners.includes(name)} finished={this.props.winners.length > 0 && players[name] >= 5000} rank={this.get_rank(name)}/>
                    )
                )}
            </div>
        );
    }
}