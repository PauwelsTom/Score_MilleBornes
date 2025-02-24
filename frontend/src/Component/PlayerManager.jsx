import { Component } from "react";
import "./PlayerManager.css";

// name, add_score
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
        this.couronnement = false;
        this.pas200 = false;
        this.capot = false;
    }

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

            default:
                break;
        }

        this.updateScore();
    }

    handleNumberChange = (event) => {
        const { _, value } = event.target;
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
                   400 * (this.manche ? 1 : 0) + 300 * (this.pas200 ? 1 : 0) + 500 * (this.capot ? 1 : 0) + 300 * this.couronnement
        });
    }

    handleValidate = () => {
        this.props.add_score(this.props.name, this.state.score);
        this.raz();
        document.getElementById("RetourMainPageDiv").click();
    }

    raz = () => {
        document.getElementById('kilometres').value = 0;
        document.getElementById('Botte0').click();
        document.getElementById('CF0').click();
        document.getElementById('manche').checked = false;
        document.getElementById('couronnement').checked = false;
        document.getElementById('pas200').checked = false;
        document.getElementById('capot').checked = false;
        
        this.kilometres = 0;
        this.botte = 0;
        this.cf = 0;
        this.manche = false;
        this.couronnement = false;
        this.pas200 = false;
        this.capot = false;

        this.setState({
            score: 0,
            activeBotte: "Botte0",
            activeCF: "CF0",
        });
    }

    render() {
        const name = this.props.name;
        const { activeBotte, activeCF } = this.state;

        return (
            <div className="PlayerManagerDiv">
                <span className="PlayerNameManager">{name}</span>
                <span className="PlayerScoreManager">{"+ " + this.state.score}</span>

                <div className="ManagerCategory">
                    <span className="CategoryName">Kilomètres</span>
                    <input
                        type="number"
                        value={this.state.kilometres}
                        onChange={this.handleNumberChange}
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
                        checked={this.state.manche}
                        onChange={this.handleCheckboxChange}
                        className="CategoryCheckbox"
                        id="manche"
                    />
                </div>

                <div className="ManagerCategory">
                    <span className="CategoryName">Couronnement</span>
                    <input
                        type="checkbox"
                        checked={this.state.couronnement}
                        onChange={this.handleCheckboxChange}
                        className="CategoryCheckbox"
                        id="couronnement"
                    />
                </div>

                <div className="ManagerCategory">
                    <span className="CategoryName">Pas de 200</span>
                    <input
                        type="checkbox"
                        checked={this.state.pas200}
                        onChange={this.handleCheckboxChange}
                        className="CategoryCheckbox"
                        id="pas200"
                    />
                </div>

                <div className="ManagerCategory">
                    <span className="CategoryName">Capot</span>
                    <input
                        type="checkbox"
                        checked={this.state.capot}
                        onChange={this.handleCheckboxChange}
                        className="CategoryCheckbox"
                        id="capot"
                    />
                </div>

                <div className="BoutonValiderManager" onClick={this.handleValidate}>Valider</div>
            </div>
        );
    }
}
