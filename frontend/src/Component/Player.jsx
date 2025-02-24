import { Component } from "react";
import "./Player.css"
import { iconeChevron, iconeCroix } from "../Data";

// name, score, remove_player, select_player
export class Player extends Component {
    constructor(props) {
        super();
    }

    render() {
        const name = this.props.name;
        const score = this.props.score;
        const remove_player = this.props.remove_player;
        const select_player = this.props.select_player;

        return (
            <div className="PlayerDiv">
                <div className="SupprPlayerDiv">
                    <img src={iconeCroix} alt="X" className="IconeCroixPlayer" 
                        onClick={() => {remove_player(name)}}/>
                </div>
                <div className="PlayerInfos">
                    <span className="PlayerName">{name}</span>
                    <span className="ScorePlayer">{score}</span>
                    <div className="BoutonModifier" onClick={() => {select_player(name)}}>
                        <img src={iconeChevron} alt="Modifier" height="90%"/>
                    </div>
                </div>
            </div>
        );
    }
}