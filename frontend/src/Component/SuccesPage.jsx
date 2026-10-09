import { Component } from "react";
import "./SuccesPage.css"
import { getSucces } from "../succes";

// history, on_back
export class SuccesPage extends Component {
    render() {
        return (
            <div className="SuccesPageDiv">
                <span className='TitrePage'>Succès</span>
                <div className="SuccesListDiv">
                    {getSucces(this.props.history).map((succes) => (
                        <div className={succes.type === undefined ? "SuccesDiv" : "SuccesDiv Succes" + succes.type} key={succes.title}>
                            <div className="SuccesTexte">
                                <span className="SuccesTitre">{succes.title}</span>
                                <span className="SuccesJoueurs">{succes.players.join(" & ")}</span>
                            </div>
                            {succes.value !== undefined && <span className="SuccesValeur">{succes.value}</span>}
                        </div>
                    ))}
                </div>
                <div className="RetourSuccesDiv" onClick={this.props.on_back}>
                    Retour
                </div>
            </div>
        );
    }
}
