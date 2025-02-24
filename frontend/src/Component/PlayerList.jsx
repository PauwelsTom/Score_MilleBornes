import "./PlayerList.css"

import { Component } from "react";
import { Player } from "./Player";

// players, remove_player
export class PlayerList extends Component {
    constructor(props) {
        super();
    }

    get_rank = (rank) => {
        const players = this.props.players;
        const playerNames = Object.keys(players);

        let cpt = 1;
        let ret = false;
        while (rank > 0 && players[playerNames[rank]] === players[playerNames[rank - cpt]]) {
            ret = true;
            cpt += 1;
        }
        if (ret)
            return (rank + 1) - (cpt - 1);

        if ((rank + 1) === Object.keys(players).length && Object.keys(players).length > 3)
            return "last";
        
        return rank + 1;
    }

    render() {
        const players = this.props.players;
        const remove_player = this.props.remove_player;

        return (
            <div className="PlayerListDiv">
                
                {Object.keys(players)
                    .sort((a, b) => players[b] - players[a])
                    .map((name, rank) => (
                        <Player name={name} score={players[name]} remove_player={remove_player} rank={this.get_rank(rank)}/>
                    )
                )}
            </div>
        );
    }
}