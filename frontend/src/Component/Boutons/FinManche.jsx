import { Component } from "react";
import "./FinManche.css"

// select_player
export class FinManche extends Component {
    render() {
        return (
            <div className="FinMancheDiv" onClick={this.props.select_player}>
                Fin manche
            </div>
        );
    }
}