import "./RetourMainPage.css"

import { Component } from "react";
import { iconeChevron } from "../../Data";

// raz
export class RetourMainPage extends Component {
    constructor(porps) {
        super();
    }

    handleClick = () => {
        document.getElementById("MainPage").style.transform = "translateX(0vw)";
        document.getElementById("PlayerPage").style.transform = "translateX(100vw)";
        this.props.raz();
    }

    render() {
        return (
            <div className="RetourMainPageDiv" id="RetourMainPageDiv" onClick={this.handleClick}>
                <img className="IconeRetour" src={iconeChevron} alt="<" height="90%"/>
            </div>
        );
    }
}