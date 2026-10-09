import { Component } from "react";
import "./PlayerManager.css";
import { clickAnimation } from "../fonctions";
import { iconeMille } from "../Data";

// Valeurs de depart pour la saisie d'un joueur
const initialValues = {
    kilometres: 0,
    kmText: null, // Texte affiché pendant la saisie des kilometres (null = pas en cours de saisie)
    botte: 0,
    cf: 0,
    allonge: false,
    couronnement: false,
    pas200: false,
};

// name, add_score, remove_seleceted, number_player
export class PlayerManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...initialValues,
            equipier: "", // "" = Aucun
        };
    }

    // Gere quand on clique sur un bouton chiffre
    handleClickBouton = (event) => {
        const { value, idTemplate } = event.currentTarget.dataset;
        const number = parseInt(value, 10);

        this.setState((prevState) => {
            const botte = idTemplate === "Botte" ? number : prevState.botte;
            const cf = idTemplate === "CF" ? number : prevState.cf;

            // On ne peut pas avoir plus de coup-fourrés que de bottes
            return { botte: botte, cf: Math.min(cf, botte) };
        });
    }

    handleMilleBornes = () => {
        this.setState({ kilometres: 1000, kmText: null });
    }

    // Gere le changement dans les checkbox
    handleCheckboxChange = (event) => {
        const { id, checked } = event.target;
        switch(id) {
            case "couronnement":
            case "pas200":
            case "allonge":
                this.setState({ [id]: checked });
                break;

            default:
                break;
        }
    }

    // Convertit la saisie en un nombre de kilometres entre 0 et 1000
    parseKilometres = (value) => {
        const kilometres = parseInt(value, 10);
        if (isNaN(kilometres)) {
            return 0;
        }
        return Math.min(Math.max(kilometres, 0), 1000);
    }

    // Gere le changement du nombre de kilometres
    handleNumberChange = (event) => {
        const value = event.target.value;
        const kilometres = this.parseKilometres(value);
        this.setState({ kilometres: kilometres, kmText: value === "" ? "" : kilometres.toString() });
    }

    // Calcule le score
    getScore = () => {
        const { kilometres, botte, cf, allonge, couronnement, pas200 } = this.state;
        return kilometres + 100 * botte + 300 * cf +
               400 * (kilometres === 1000 ? 1 : 0) + 300 * (pas200 ? 1 : 0)
               + 300 * (couronnement ? 1 : 0)
               + (botte === 4 ? 1 : 0) * 700 + (allonge ? 1 : 0) * 200;
    }

    // Renvoie l'equipier selectionné, ou "" s'il n'y en a pas
    getEquipier = () => {
        const equipier = this.state.equipier;
        return this.props.name.slice(1).includes(equipier) ? equipier : "";
    }

    // Gere le changement des equipiers
    handleEquipierChange = (event) => {
        this.setState({ equipier: event.target.value });
    }

    // Gere quand on clique sur le bouton valider
    handleValidate = () => {
        const name = this.props.name[0];
        if (name === undefined) {
            return;
        }

        const equipier = this.getEquipier();
        const players = equipier === "" ? [name] : [name, equipier];
        this.props.add_score(players, this.getScore(), this.state.kilometres === 0);

        const playerRemaining = this.props.name.filter((n) => !players.includes(n));
        this.props.remove_seleceted(players);

        // Si le joueur validé avait un équipier, on propose au prochain joueur le suivant de la liste
        const nextEquipier = equipier !== "" && playerRemaining.length > 1 ? playerRemaining[1] : "";
        this.setState({ ...initialValues, equipier: nextEquipier });

        if (playerRemaining.length === 0) {
            this.retourMainPage();
        }
        clickAnimation("BoutonValiderManager");
    }

    // Fonction pour retourner a la page principale
    retourMainPage = () => {
        document.getElementById("MainPage").style.transform = "translateX(0vw)";
        document.getElementById("PlayerPage").style.transform = "translateX(100vw)";
    }

    // Quand on clique sur les kilometres
    onFocusNumber = () => {
        this.setState({ kmText: "" });
    }

    // Quand on quitte la zone des kilomtres
    onBlurNumber = () => {
        this.setState((prevState) => ({
            kilometres: prevState.kilometres - (prevState.kilometres % 25),
            kmText: null,
        }));
    }

    render() {
        const name = this.props.name[0];
        const { kilometres, kmText, botte, cf } = this.state;

        return (
            <div className="PlayerManagerDiv">
                <span className="PlayerNameManager">{name}</span>
                <span className="PlayerScoreManager">{"+ " + this.getScore()}</span>

                <div className="ManagerCategory">
                    <span className="CategoryName">Kilomètres</span>
                    <div className="kmDiv">
                        <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={kmText === null ? kilometres : kmText}
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
                            data-value={i}
                            data-id-template="Botte"
                            className={`BoutonNumero ${botte === i ? 'active' : ''}`}
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
                            data-value={i}
                            data-id-template="CF"
                            className={`BoutonNumero ${cf === i ? 'active' : ''}`}
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
                            checked={this.state.allonge}
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
                    <span className="CategoryName">Equipier</span>
                    <select id="equipierSelect" className="EquipierSelect" value={this.getEquipier()} onChange={this.handleEquipierChange}>
                        <option value="">Aucun</option>
                        {this.props.name.slice(1).map((playerName) => (
                            <option key={playerName} value={playerName}>{playerName}</option>
                        ))}
                    </select>
                </div>

                <div className="BoutonValiderManager" id="BoutonValiderManager" onClick={this.handleValidate}>Valider</div>
            </div>
        );
    }
}
