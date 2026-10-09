import { Component } from "react";
import "./Player.css"
import { iconeCroix, iconeRank } from "../Data";

// name, score, remove_player, rank, inGame, gain, winner, finished
export class Player extends Component {
    render() {
        const name = this.props.name;
        const score = this.props.score;
        const remove_player = this.props.remove_player;
        const gain = this.props.gain;
        const image = iconeRank[this.props.rank] == null? iconeRank["other"]: iconeRank[this.props.rank];
        
        // Cache / affiche les elements si on est en partie
        const inGameStyle = { visibility: this.props.inGame ? "visible" : "hidden" };
        const notInGameStyle = { visibility: this.props.inGame ? "hidden" : "visible" };

        // Le vainqueur en vert, les autres joueurs a 5000 ou plus en vert clair
        let playerClass = "PlayerDiv";
        if (this.props.winner) { playerClass = "PlayerDiv PlayerWin"; }
        else if (this.props.finished) { playerClass = "PlayerDiv PlayerFinished"; }

        return (
            <div className={playerClass}>
                <div className="SupprPlayerDiv" style={notInGameStyle}>
                    <img src={iconeCroix} alt="X" className="IconeCroixPlayer" 
                        onClick={() => {remove_player(name)}}/>
                </div>
                <div className="PlayerInfos">
                    <span className="PlayerName">{name}</span>
                    <div className="ScorePlayerDiv" style={inGameStyle}>
                        <span className="ScorePlayer">{score}</span>
                        {gain !== undefined && <span className={gain <= 100 ? "GainPlayer GainFaible" : "GainPlayer"}>{"(+" + gain + ")"}</span>}
                    </div>
                    <img src={image} alt="Classement" height="90%" className="IconeClassement" style={inGameStyle}/>
                </div>
            </div>
        );
    }
}