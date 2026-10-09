import { Component } from "react";
import "./ResetScores.css"

// reset
export class ResetScores extends Component {
    render() {
        return (
            <div className="ResetScoresDiv" onClick={this.props.reset}>
                Reset Scores
            </div>
        );
    }
}