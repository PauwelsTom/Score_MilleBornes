import { Component, createRef } from "react";
import "./PlayerManager.css";
import { clickAnimation } from "../fonctions";
import { iconeMille } from "../Data";

// Valeurs de depart pour la saisie d'un onglet
const initialValues = {
    kilometres: 0,
    kmText: null, // Texte affiché pendant la saisie des kilometres (null = pas en cours de saisie)
    botte: 0,
    cf: 0,
    allonge: false,
    couronnement: false,
    pas200: false,
};

// Cree un onglet pour un joueur ou une equipe
const newTab = (members) => ({ members: members, ...initialValues });

// Calcule le score d'un onglet
const getScore = (tab) => {
    const { kilometres, botte, cf, allonge, couronnement, pas200 } = tab;
    return kilometres + 100 * botte + 300 * cf +
           400 * (kilometres === 1000 ? 1 : 0) + 300 * (pas200 ? 1 : 0)
           + 300 * (couronnement ? 1 : 0)
           + (botte === 4 ? 1 : 0) * 700 + (allonge ? 1 : 0) * 200;
}

// Calcule les points gagnés par chaque joueur sur la manche, capot compris ({nom: points})
const getRoundScores = (tabs, players) => {
    const scores = {};
    for (const name of players) { scores[name] = 0; }

    for (const tab of tabs) {
        const score = getScore(tab);
        for (const name of tab.members) { scores[name] += score; }

        // Capot : les autres joueurs gagnent 500
        if (tab.kilometres === 0) {
            for (const name of players) {
                if (!tab.members.includes(name)) { scores[name] += 500; }
            }
        }
    }
    return scores;
}

// players (liste des noms), teams, on_back, on_confirm
export class PlayerManager extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabs: this.createTabs(),
            current: 0,
            animated: true,
        };

        this.ongletsRef = createRef();
    }

    // Cree les onglets en reprenant les equipes de la manche precedente
    createTabs = () => {
        const names = this.props.players;
        const partners = {};
        for (const team of this.props.teams) {
            if (team.length === 2) { partners[team[0]] = team[1]; }
        }

        const tabs = [];
        const used = [];
        for (const name of names) {
            if (used.includes(name)) { continue; }

            const partner = partners[name];
            if (partner !== undefined && partner !== name && names.includes(partner) && !used.includes(partner)) {
                tabs.push(newTab([name, partner]));
                used.push(name, partner);
            } else if (!Object.values(partners).includes(name)) {
                tabs.push(newTab([name]));
                used.push(name);
            }
        }

        // Joueurs dont l'equipier n'existe plus
        for (const name of names) {
            if (!used.includes(name)) { tabs.push(newTab([name])); }
        }
        return tabs;
    }

    // Garde l'onglet actif visible dans la barre des onglets
    componentDidUpdate(prevProps, prevState) {
        const onglets = this.ongletsRef.current;
        if (onglets === null || prevState.current === this.state.current) { return; }

        const active = onglets.children[this.state.current];
        if (active !== undefined) {
            onglets.scrollLeft = active.offsetLeft - (onglets.clientWidth - active.offsetWidth) / 2;
        }
    }

    // Modifie les valeurs d'un onglet
    updateTab = (index, changes) => {
        this.setState((prevState) => {
            const tabs = [...prevState.tabs];
            tabs[index] = { ...tabs[index], ...(typeof changes === "function" ? changes(tabs[index]) : changes) };
            return { tabs: tabs };
        });
    }

    // Change d'onglet
    selectTab = (index) => {
        this.setState({ current: index, animated: true });
    }

    // Gere quand on clique sur un bouton chiffre
    handleClickBouton = (index, event) => {
        const { value, idTemplate } = event.currentTarget.dataset;
        const number = parseInt(value, 10);

        this.updateTab(index, (tab) => {
            const botte = idTemplate === "Botte" ? number : tab.botte;
            const cf = idTemplate === "CF" ? number : tab.cf;

            // On ne peut pas avoir plus de coup-fourrés que de bottes
            return { botte: botte, cf: Math.min(cf, botte) };
        });
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
    handleNumberChange = (index, event) => {
        const value = event.target.value;
        const kilometres = this.parseKilometres(value);
        this.updateTab(index, { kilometres: kilometres, kmText: value === "" ? "" : kilometres.toString() });
    }

    // Quand on quitte la zone des kilomtres
    onBlurNumber = (index) => {
        this.updateTab(index, (tab) => ({
            kilometres: tab.kilometres - (tab.kilometres % 25),
            kmText: null,
        }));
    }

    // Gere le changement des equipiers
    handleEquipierChange = (index, event) => {
        const equipier = event.target.value; // "" = Aucun

        this.setState((prevState) => {
            let tabs = [...prevState.tabs];
            const tab = tabs[index];
            const [name, oldEquipier] = tab.members;
            if ((oldEquipier === undefined ? "" : oldEquipier) === equipier) {
                return null;
            }

            const hadTeams = tabs.some((t) => t.members.length > 1);
            tabs[index] = { ...tab, members: equipier === "" ? [name] : [name, equipier] };

            // Le nouvel equipier quitte son onglet, et l'ancien equipier y prend sa place.
            // Sinon l'ancien equipier retrouve son propre onglet
            const other = tabs.findIndex((t, i) => i !== index && t.members.includes(equipier));
            if (other !== -1) {
                const remaining = tabs[other].members.filter((member) => member !== equipier);
                if (oldEquipier === undefined && remaining.length === 0) {
                    tabs[other] = null;
                } else if (remaining.length === 0) {
                    tabs[other] = newTab([oldEquipier]);
                } else {
                    tabs[other] = { ...tabs[other], members: oldEquipier === undefined ? remaining : [...remaining, oldEquipier] };
                }
                tabs = tabs.filter((t) => t !== null);
            } else if (oldEquipier !== undefined) {
                tabs.splice(index + 1, 0, newTab([oldEquipier]));
            }

            // A la premiere equipe formée, on propose les suivantes avec les joueurs restants
            if (equipier !== "" && !hadTeams) {
                const paired = [];
                let waiting = null;
                for (const t of tabs) {
                    if (t.members.length > 1 || waiting === null) {
                        if (t.members.length === 1) { waiting = paired.length; }
                        paired.push(t);
                    } else {
                        paired[waiting] = { ...paired[waiting], members: [paired[waiting].members[0], t.members[0]] };
                        waiting = null;
                    }
                }
                tabs = paired;
            }

            return {
                tabs: tabs,
                current: tabs.findIndex((t) => t.members[0] === name),
                animated: false,
            };
        });
    }

    // Gere quand on clique sur le bouton suivant / confirmer
    handleValidate = () => {
        const { tabs, current } = this.state;
        clickAnimation("BoutonValiderManager");

        if (current < tabs.length - 1) {
            this.selectTab(current + 1);
            return;
        }

        // Dernier onglet : on envoie tous les scores en une fois
        const rounded = tabs.map((tab) => ({ ...tab, kilometres: tab.kilometres - (tab.kilometres % 25) }));
        const scores = getRoundScores(rounded, this.props.players);

        this.props.on_confirm(scores, tabs.map((tab) => tab.members));
    }

    // Affiche la saisie d'un onglet
    renderPanneau = (tab, index) => {
        const { tabs, current } = this.state;
        const [name, equipier] = tab.members;
        const score = getScore(tab);
        const capot = getRoundScores(tabs, this.props.players)[name] - score;
        const equipiers = this.props.players.filter((playerName) => playerName !== name);

        return (
            <div className="Panneau" key={name} inert={index !== current}>
                <span className="PlayerNameManager">{tab.members.join(" & ")}</span>
                <span className="PlayerScoreManager">{"+ " + score}</span>
                <span className="PlayerCapotManager" style={{ visibility: capot > 0 ? "visible" : "hidden" }}>
                    {"+" + capot + " (capot)"}
                </span>

                <div className="ManagerCategory">
                    <span className="CategoryName">Kilomètres</span>
                    <div className="kmDiv">
                        <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={tab.kmText === null ? tab.kilometres : tab.kmText}
                            onChange={(event) => this.handleNumberChange(index, event)}
                            onFocus={() => this.updateTab(index, { kmText: "" })}
                            onBlur={() => this.onBlurNumber(index)}
                            min="0"
                            max="1000"
                            step="25"
                            className="CategoryInput"
                            />
                        <img src={iconeMille} alt="1000" className="milleBornes"
                            onClick={() => this.updateTab(index, { kilometres: 1000, kmText: null })}/>
                    </div>
                </div>

                <div className="ManagerCategory">
                    <span className="CategoryName">Bottes</span>
                    {Array.from({ length: 5 }, (_, i) => (
                        <div
                            key={`Botte${i}`}
                            data-value={i}
                            data-id-template="Botte"
                            className={`BoutonNumero ${tab.botte === i ? 'active' : ''}`}
                            onClick={(event) => this.handleClickBouton(index, event)}
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
                            data-value={i}
                            data-id-template="CF"
                            className={`BoutonNumero ${tab.cf === i ? 'active' : ''}`}
                            onClick={(event) => this.handleClickBouton(index, event)}
                        >
                            {i}
                        </div>
                    ))}
                </div>

                {
                    this.props.players.length === 4?
                    <div></div>
                    :<div className="ManagerCategory">
                        <span className="CategoryName">Allonge</span>
                        <input
                            type="checkbox"
                            checked={tab.allonge}
                            onChange={(event) => this.updateTab(index, { allonge: event.target.checked })}
                            className="CategoryCheckbox"
                        />
                    </div>
                }

                <div className="ManagerCategory">
                    <span className="CategoryName">Couronnement</span>
                    <input
                        type="checkbox"
                        checked={tab.couronnement}
                        onChange={(event) => this.updateTab(index, { couronnement: event.target.checked })}
                        className="CategoryCheckbox"
                    />
                </div>

                <div className="ManagerCategory">
                    <span className="CategoryName">Pas de 200</span>
                    <input
                        type="checkbox"
                        checked={tab.pas200}
                        onChange={(event) => this.updateTab(index, { pas200: event.target.checked })}
                        className="CategoryCheckbox"
                    />
                </div>

                <div className="ManagerCategory">
                    <span className="CategoryName">Equipier</span>
                    <select className="EquipierSelect" value={equipier === undefined ? "" : equipier}
                        onChange={(event) => this.handleEquipierChange(index, event)}>
                        <option value="">Aucun</option>
                        {equipiers.map((playerName) => (
                            <option key={playerName} value={playerName}>{playerName}</option>
                        ))}
                    </select>
                </div>
            </div>
        );
    }

    render() {
        const { tabs, current, animated } = this.state;
        const trackStyle = {
            transform: `translateX(${-100 * current}vw)`,
            transition: animated ? undefined : "none",
        };

        return (
            <div className="PlayerManagerDiv">
                <div className="OngletsDiv" ref={this.ongletsRef}>
                    {tabs.map((tab, index) => (
                        <div
                            key={tab.members[0]}
                            className={`Onglet ${index === current ? 'active' : ''}`}
                            onClick={() => this.selectTab(index)}
                        >
                            {tab.members.join(" & ")}
                        </div>
                    ))}
                </div>

                <div className="PanneauxDiv">
                    <div className="PanneauxTrack" style={trackStyle}>
                        {tabs.map(this.renderPanneau)}
                    </div>
                </div>

                <div className="BoutonsManager">
                    <div className="BoutonRetourManager" onClick={this.props.on_back}>Retour</div>
                    <div className="BoutonValiderManager" id="BoutonValiderManager" onClick={this.handleValidate}>
                        {current < tabs.length - 1 ? "Suivant >" : "Confirmer"}
                    </div>
                </div>
            </div>
        );
    }
}
