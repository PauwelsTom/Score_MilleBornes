import { Component } from "react";
import "./PlayerManager.css";
import { clickAnimation } from "../fonctions";

// name, add_score, remove_seleceted, number_player
export class PlayerManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            score: 0,
            activeBotte: "Botte0",
            activeCF: "CF0",
        };

        this.kilometres = 0;
        this.botte = 0;
        this.cf = 0;
        this.manche = false;
        this.allonge = false;
        this.couronnement = false;
        this.pas200 = false;
        this.capot = false;
        this.equipier = "Aucun";
    }

    // Gere quand on clique sur un bouton chiffre
    handleClickBouton = (event) => {
        const { id, value, idTemplate } = event.target.dataset;

        this.setState((prevState) => {
            const currentActive = prevState[`active${idTemplate}`];
            if (currentActive === id) {
                return null; // Le bouton est déjà actif, on ne fait rien
            }

            // Mettre à jour le bouton actif pour la catégorie et les variables this.botte et this.cf
            const updatedState = {
                [`active${idTemplate}`]: id,
                [`${idTemplate.toLowerCase()}`]: parseInt(value),
            };

            if (idTemplate === "Botte") {
                this.botte = parseInt(value);
            } else if (idTemplate === "CF") {
                this.cf = parseInt(value);
            }

            if (this.botte < this.cf) 
                document.getElementById("CF" + this.botte.toString()).click();

            this.updateScore();

            return updatedState;
        });
    }

    handleCheckboxChange = (event) => {
        const { id, checked } = event.target;
        switch(id) {
            case "manche":
                this.manche = checked;
                break;

            case "couronnement":
                this.couronnement = checked;
                break;

            case "pas200":
                this.pas200 = checked;
                break;

            case "capot":
                this.capot = checked;
                break;

            default:
                break;
        }

        this.updateScore();
    }

    handleNumberChange = (event) => {
        const value = event.target.value;
        if (value > 1000) {
            event.target.value = 1000;
            return this.handleNumberChange(event);
        }
        this.kilometres = parseInt(value);
        this.updateScore();
    }

    updateScore = () => {
        this.setState({
            score: this.kilometres + 100 * this.botte + 300 * this.cf +
                   400 * (this.manche ? 1 : 0) + 300 * (this.pas200 ? 1 : 0) 
                   + 500 * (this.capot ? 1 : 0) + 300 * this.couronnement
                   + (this.botte === 4? 1 : 0) * 700 + (this.allonge? 1 : 0) * 200
        });
    }

    handleEquipierChange = (event) => {
        this.equipier = event.target.value;
    }


    handleValidate = () => {
        const players = [this.props.name[0]];
        if (this.equipier !== "Aucun") { players.push(this.equipier); }
        this.props.add_score(players, this.state.score);
        const playerRemaining = this.props.remove_seleceted(players);
        this.raz();
        if (playerRemaining === 0)
            this.retourMainPage();
        clickAnimation("BoutonValiderManager");
    }

    // Remet a zero toutes les valeurs
    raz = () => {
        document.getElementById('kilometres').value = 0;
        document.getElementById('Botte0').click();
        document.getElementById('CF0').click();
        document.getElementById('manche').checked = false;
        this.props.number_player === 4 ? this.allonge = false : document.getElementById('allonge').checked = false;
        document.getElementById('couronnement').checked = false;
        document.getElementById('pas200').checked = false;
        document.getElementById('capot').checked = false;
        document.getElementById('equipierSelect').value = "Aucun"; // Corrected line
        this.kilometres = 0;
        this.botte = 0;
        this.cf = 0;
        this.manche = false;
        this.allonge = false;
        this.couronnement = false;
        this.pas200 = false;
        this.capot = false;
        this.equipier = "Aucun"; // Reset equipier state
        this.setState({ score: 0, activeBotte: "Botte0", activeCF: "CF0" });
    }
    

    retourMainPage = () => {
        document.getElementById("MainPage").style.transform = "translateX(0vw)";
        document.getElementById("PlayerPage").style.transform = "translateX(100vw)";
        this.raz();
    }

    onFocusNumber = (event) => {
        event.target.value = "";
    }

    onBlurNumber = (event) => {
        if (event.target.value % 25 !== 0) {
            event.target.value = event.target.value - (event.target.value % 25);
        }
        this.handleNumberChange(event);
    }

    render() {
        const name = this.props.name[0];
        const { activeBotte, activeCF } = this.state;

        return (
            <div className="PlayerManagerDiv">
                <span className="PlayerNameManager">{name}</span>
                <span className="PlayerScoreManager">{"+ " + this.state.score}</span>

                <div className="ManagerCategory">
                    <span className="CategoryName">Kilomètres</span>
                    <input
                        type="number"
                        value={this.kilometres}
                        onChange={this.handleNumberChange}
                        onFocus={this.onFocusNumber}
                        onBlur={this.onBlurNumber}
                        min="0"
                        max="1000"
                        step="25"
                        className="CategoryInput"
                        id="kilometres"
                    />
                </div>

                <div className="ManagerCategory">
                    <span className="CategoryName">Bottes</span>
                    {Array.from({ length: 5 }, (_, i) => (
                        <div
                            key={`Botte${i}`}
                            id={`Botte${i}`}
                            data-id={`Botte${i}`}
                            data-value={i}
                            data-id-template="Botte"
                            className={`BoutonNumero ${activeBotte === `Botte${i}` ? 'active' : ''}`}
                            onClick={this.handleClickBouton}
                        >
                            {i}
                        </div>
                    ))}
                </div>

                <div className="ManagerCategory">
                    <span className="CategoryName">Coup-Fourré</span>
                    {Array.from({ length: 5 }, (_, i) => (
                        <div
                            key={`CF${i}`}
                            id={`CF${i}`}
                            data-id={`CF${i}`}
                            data-value={i}
                            data-id-template="CF"
                            className={`BoutonNumero ${activeCF === `CF${i}` ? 'active' : ''}`}
                            onClick={this.handleClickBouton}
                        >
                            {i}
                        </div>
                    ))}
                </div>

                <div className="ManagerCategory">
                    <span className="CategoryName">Manche</span>
                    <input
                        type="checkbox"
                        checked={this.manche}
                        onChange={this.handleCheckboxChange}
                        className="CategoryCheckbox"
                        id="manche"
                    />
                </div>

                {
                    this.props.number_player === 4?
                    <div></div>
                    :<div className="ManagerCategory">
                        <span className="CategoryName">Allonge</span>
                        <input
                            type="checkbox"
                            checked={this.allonge}
                            onChange={this.handleCheckboxChange}
                            className="CategoryCheckbox"
                            id="allonge"
                        />
                    </div>
                }

                <div className="ManagerCategory">
                    <span className="CategoryName">Couronnement</span>
                    <input
                        type="checkbox"
                        checked={this.couronnement}
                        onChange={this.handleCheckboxChange}
                        className="CategoryCheckbox"
                        id="couronnement"
                    />
                </div>

                <div className="ManagerCategory">
                    <span className="CategoryName">Pas de 200</span>
                    <input
                        type="checkbox"
                        checked={this.pas200}
                        onChange={this.handleCheckboxChange}
                        className="CategoryCheckbox"
                        id="pas200"
                    />
                </div>

                <div className="ManagerCategory">
                    <span className="CategoryName">Capot</span>
                    <input
                        type="checkbox"
                        checked={this.capot}
                        onChange={this.handleCheckboxChange}
                        className="CategoryCheckbox"
                        id="capot"
                    />
                </div>

                <div className="ManagerCategory">
                    <span className="CategoryName">Equipier</span>
                    <select id="equipierSelect" className="EquipierSelect" onChange={this.handleEquipierChange}>
                        {this.props.name.map((playerName, index) => (
                            <option key={index} value={playerName}>{playerName === name? "Aucun": playerName}</option>
                        ))}
                    </select>
                </div>


                <div className="BoutonValiderManager" id="BoutonValiderManager" onClick={this.handleValidate}>Valider</div>
            </div>
        );
    }
}
