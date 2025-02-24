import { Component } from "react";
import "./Player.css"
import { iconeCroix, iconeRank } from "../Data";

// name, score, remove_player, select_player, rank
export class Player extends Component {
    constructor(props) {
        super();
    }

    render() {
        const name = this.props.name;
        const score = this.props.score;
        const remove_player = this.props.remove_player;
        const image = iconeRank[this.props.rank] == null? iconeRank["other"]: iconeRank[this.props.rank];


        const playerClass = score > 5000 ? "PlayerDiv PlayerWin" : "PlayerDiv";

        return (
            <div className={playerClass}>
                <div className="SupprPlayerDiv">
                    <img src={iconeCroix} alt="X" className="IconeCroixPlayer" 
                        onClick={() => {remove_player(name)}}/>
                </div>
                <div className="PlayerInfos">
                    <span className="PlayerName">{name}</span>
                    <span className="ScorePlayer">{score}</span>
                    <img src={image} alt="Classement" height="90%"/>
                </div>
            </div>
        );
    }
}