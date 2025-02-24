import { Component } from "react";
import "./AddPlayer.css"

// add_player, inGame
export class AddPlayer extends Component {
    constructor(porps) {
        super();
    }

    render() {
        return (
            <div id="AddPlayerDiv" className="AddPlayerDiv" onClick={this.props.add_player}>
                Add Player
            </div>
        );
    }
}