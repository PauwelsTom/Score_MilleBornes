import { Component } from "react";
import "./FinManche.css"

// select_player
export class FinManche extends Component {
    constructor(props) {
        super();
    }

    render() {
        return (
            <div className="FinMancheDiv" onClick={this.props.select_player}>
                FinManche
            </div>
        );
    }
}