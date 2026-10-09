import { Component } from "react";
import "./Confettis.css"

const couleurs = ["var(--bleu-fonce)", "var(--vert)", "var(--rouge)", "gold"];

// Pluie de confettis par dessus la page
export class Confettis extends Component {
    constructor(props) {
        super(props);

        // Position, taille et vitesse au hasard pour chaque confetti
        this.confettis = Array.from({ length: 120 }, (_, i) => ({
            left: Math.random() * 100 + "vw",
            width: 0.8 + Math.random() * 0.8 + "vh",
            height: 1.5 + Math.random() * 1.5 + "vh",
            backgroundColor: couleurs[i % couleurs.length],
            animationDelay: Math.random() * 1.5 + "s",
            animationDuration: 2.5 + Math.random() * 2 + "s",
            "--derive": Math.random() * 30 - 15 + "vw",
            "--rotation": (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 720) + "deg",
        }));
    }

    render() {
        return (
            <div className="ConfettisDiv">
                {this.confettis.map((style, i) => (
                    <div key={i} className="Confetti" style={style}></div>
                ))}
            </div>
        );
    }
}
