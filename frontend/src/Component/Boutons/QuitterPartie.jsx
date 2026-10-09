import { Component } from "react";
import "./QuitterPartie.css"

// quit
export class QuitterPartie extends Component {
    render() {
        return (
            <div className="QuitterPartieDiv" onClick={this.props.quit}>
                Quitter partie
            </div>
        );
    }
}