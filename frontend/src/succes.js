// Calcul des succès de fin de partie
// history : liste des manches, chaque manche = {nom: {points, bottes, cf, capot, couronnement}}

// Joueurs ayant la plus grande valeur (aucun si personne n'est au dessus de 0)
const best = (totals) => {
    const value = Math.max(0, ...Object.values(totals));
    return { players: value === 0 ? [] : Object.keys(totals).filter((name) => totals[name] === value), value: value };
}

// Additionne une statistique sur toutes les manches pour chaque joueur
const total = (history, stat) => {
    const totals = {};
    for (const round of history) {
        for (const name of Object.keys(round)) {
            totals[name] = (totals[name] || 0) + Number(round[name][stat]);
        }
    }
    return totals;
}

// Renvoie la liste des succès : [{title, players, value, type}]
export function getSucces(history) {
    if (history.length === 0) {
        return [];
    }

    // Points gagnés sur chaque manche, et joueurs toujours premiers / toujours derniers
    const points = [];
    let alwaysFirst = null;
    let alwaysLast = null;
    for (const round of history) {
        const names = Object.keys(round);
        const roundPoints = names.map((name) => round[name].points);
        points.push(...roundPoints);

        // Une manche ou tout le monde est a egalité n'a ni vainqueur ni perdant
        const max = Math.max(...roundPoints);
        const min = Math.min(...roundPoints);
        const first = names.filter((name) => max !== min && round[name].points === max);
        const last = names.filter((name) => max !== min && round[name].points === min);
        alwaysFirst = alwaysFirst === null ? first : alwaysFirst.filter((name) => first.includes(name));
        alwaysLast = alwaysLast === null ? last : alwaysLast.filter((name) => last.includes(name));
    }

    const maxPoints = Math.max(...points);
    const minPoints = Math.min(...points);
    const withPoints = (value) => {
        const players = [];
        for (const round of history) {
            for (const name of Object.keys(round)) {
                if (round[name].points === value && !players.includes(name)) { players.push(name); }
            }
        }
        return players;
    }

    // Succès affichés en premier, et seulement si quelqu'un les a obtenus
    const succes = [];
    if (alwaysFirst.length > 0) {
        succes.push({ title: "Que des victoires", players: alwaysFirst, type: "victoire" });
    }
    if (alwaysLast.length > 0) {
        succes.push({ title: "Que des défaites", players: alwaysLast, type: "defaite" });
    }

    succes.push(
        { title: "Le plus de points en une manche", players: withPoints(maxPoints), value: maxPoints },
        { title: "Le moins de points en une manche", players: withPoints(minPoints), value: minPoints },
    );

    // Les statistiques a 0 (obtenues par personne) ne sont pas affichées
    const stats = [
        { title: "Le plus de bottes", ...best(total(history, "bottes")) },
        { title: "Le plus de coups fourrés", ...best(total(history, "cf")) },
        { title: "Le plus souvent fini capot", ...best(total(history, "capot")) },
        { title: "Le plus de couronnements", ...best(total(history, "couronnement")) },
    ];
    succes.push(...stats.filter((stat) => stat.value > 0));
    return succes;
}
