import "./PlayerList.css"

import { Component } from "react";
import { Player } from "./Player";

// players
export class PlayerList extends Component {
    constructor(props) {
        super();
    }

    render() {
        const players = this.props.players;
        const remove_player = this.props.remove_player;
        const select_player = this.props.select_player;

        return (
            <div className="PlayerListDiv">
                
                {Object.keys(players)
                    .sort((a, b) => players[b] - players[a])
                    .map((name) => (
                        <Player name={name} score={players[name]} remove_player={remove_player} select_player={select_player} />
                    )
                )}
            </div>
        );
    }
}