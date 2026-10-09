import { Component } from "react";
import "./DebutPartie.css"

// start
export class DebutPartie extends Component {
    render() {
        return (
            <div className="DebutPartieDiv" onClick={this.props.start}>
                Début partie
            </div>
        );
    }
}
