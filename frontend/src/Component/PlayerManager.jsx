import { Component } from "react";
import "./PlayerManager.css";
import { clickAnimation } from "../fonctions";
import { iconeMille } from "../Data";

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
        this.allonge = false;
        this.couronnement = false;
        this.pas200 = false;
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

    handleMilleBornes = () => {
        this.kilometres = 1000;
        this.updateScore();
    }

    // Gere le changement dans les checkbox
    handleCheckboxChange = (event) => {
        const { id, checked } = event.target;
        switch(id) {
            case "couronnement":
                this.couronnement = checked;
                break;

            case "pas200":
                this.pas200 = checked;
                break;

            case "allonge":
                this.allonge = checked;
                break;

            default:
                break;
        }

        this.updateScore();
    }

    // Gere le changement du nombre de kilometres
    handleNumberChange = (event) => {
        const value = event.target.value;
        if (value > 1000) {
            event.target.value = 1000;
            return this.handleNumberChange(event);
        }
        this.kilometres = parseInt(value);
        this.updateScore();
    }

    // Calcule et met a jour le score
    updateScore = () => {
        this.setState({
            score: this.kilometres + 100 * this.botte + 300 * this.cf +
                   400 * (this.kilometres === 1000 ? 1 : 0) + 300 * (this.pas200 ? 1 : 0) 
                   + 300 * this.couronnement
                   + (this.botte === 4? 1 : 0) * 700 + (this.allonge? 1 : 0) * 200
        });
    }

    // Gere le changement des equipiers
    handleEquipierChange = (event) => {
        this.equipier = event.target.value;
    }

    // Gere quand on clique sur le bouton valider
    handleValidate = () => {
        const players = [this.props.name[0]];
        console.log(this.props.name);
        if (this.equipier !== "Aucun") { players.push(this.equipier); } // OK
        this.props.add_score(players, this.state.score, this.kilometres === 0);
        const playerRemaining = this.props.remove_seleceted(players);
        this.raz();
        if (playerRemaining === 0) {
            this.retourMainPage();
            this.equipier = "Aucun";
        }
        clickAnimation("BoutonValiderManager");
    }

    // Remet a zero toutes les valeurs
    raz = () => {
        document.getElementById('kilometres').value = 0;
        document.getElementById('Botte0').click();
        document.getElementById('CF0').click();
        this.props.number_player === 4 ? this.allonge = false : document.getElementById('allonge').checked = false;
        document.getElementById('couronnement').checked = false;
        document.getElementById('pas200').checked = false;
        
        this.kilometres = 0;
        this.botte = 0;
        this.cf = 0;
        this.allonge = false;
        this.couronnement = false;
        this.pas200 = false;
    
        // Si le joueur validé avait un équipier, mettre le prochain joueur avec le premier de la liste
        if (this.equipier === undefined) {
            this.equipier = "Aucun"
        }
        if (this.equipier !== "Aucun") {
            setTimeout(() => {
                this.equipier = this.props.name[1]; // Prend le premier joueur de la liste comme équipier
                if (this.equipier === undefined) { this.equipier = "Aucun"; }
                document.getElementById('equipierSelect').value = this.equipier;
            }, 10);
        } else {
            this.equipier = "Aucun";
        }
    
        this.setState({ score: 0, activeBotte: "Botte0", activeCF: "CF0" });
    }
    
    
    // Fonction pour retourner a la page principale
    retourMainPage = () => {
        document.getElementById("MainPage").style.transform = "translateX(0vw)";
        document.getElementById("PlayerPage").style.transform = "translateX(100vw)";
        this.raz();
    }

    // Quand on clique sur les kilometres
    onFocusNumber = (event) => {
        event.target.value = "";
    }

    // Quand on quitte la zone des kilomtres
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
                    <div className="kmDiv">
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
                        <img src={iconeMille} alt="1000" id="milleBornes" onClick={this.handleMilleBornes}/>
                    </div>
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
