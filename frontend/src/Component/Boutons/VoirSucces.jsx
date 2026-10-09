import { Component } from "react";
import "./VoirSucces.css"

// show
export class VoirSucces extends Component {
    render() {
        return (
            <div className="VoirSuccesDiv" onClick={this.props.show}>
                Succès
            </div>
        );
    }
}
