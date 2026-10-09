import { Component } from "react";
import "./Player.css"
import { iconeCroix, iconeRank } from "../Data";

// name, score, remove_player, rank, inGame
export class Player extends Component {
    render() {
        const name = this.props.name;
        const score = this.props.score;
        const remove_player = this.props.remove_player;
        const image = iconeRank[this.props.rank] == null? iconeRank["other"]: iconeRank[this.props.rank];
        
        // Cache / affiche les elements si on est en partie
        const inGameStyle = { visibility: this.props.inGame ? "visible" : "hidden" };
        const notInGameStyle = { visibility: this.props.inGame ? "hidden" : "visible" };

        const playerClass = score >= 5000 ? "PlayerDiv PlayerWin" : "PlayerDiv";

        return (
            <div className={playerClass}>
                <div className="SupprPlayerDiv" style={notInGameStyle}>
                    <img src={iconeCroix} alt="X" className="IconeCroixPlayer" 
                        onClick={() => {remove_player(name)}}/>
                </div>
                <div className="PlayerInfos">
                    <span className="PlayerName">{name}</span>
                    <span className="ScorePlayer" style={inGameStyle}>{score}</span>
                    <img src={image} alt="Classement" height="90%" className="IconeClassement" style={inGameStyle}/>
                </div>
            </div>
        );
    }
}