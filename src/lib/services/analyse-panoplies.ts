import { getEquipementParNom, getPanoplieParNom } from '$lib/services/base-de-donnees';
import type {
        DetailPrixEquipement,
        EtatEquipementUtilisateur,
        IntervalleEffet,
        SynthesePanoplie,
        ValeurEffet
} from '$lib/types';

function versIntervalle(valeur: ValeurEffet): IntervalleEffet {
        if (Array.isArray(valeur)) {
                return { min: valeur[0], max: valeur[1] };
        }

        return { min: valeur, max: valeur };
}

function additionnerIntervalle(
        cumul: IntervalleEffet | undefined,
        ajout: IntervalleEffet
): IntervalleEffet {
        if (!cumul) {
                return { ...ajout };
        }

        return {
                min: cumul.min + ajout.min,
                max: cumul.max + ajout.max
        };
}

function additionnerEffets(
        effetsSource: Record<string, ValeurEffet>,
        cumul: Record<string, IntervalleEffet>
) {
        for (const [effet, valeur] of Object.entries(effetsSource)) {
                const intervalle = versIntervalle(valeur);
                cumul[effet] = additionnerIntervalle(cumul[effet], intervalle);
        }
}

function fusionnerEffets(
        base: Record<string, IntervalleEffet>,
        bonus: Record<string, IntervalleEffet>
): Record<string, IntervalleEffet> {
        const resultat: Record<string, IntervalleEffet> = { ...base };

        for (const [effet, intervalle] of Object.entries(bonus)) {
                resultat[effet] = additionnerIntervalle(resultat[effet], intervalle);
        }

        return resultat;
}

export function calculerSynthesePanoplie(
        panoplieNom: string,
        etatEquipements: Record<string, EtatEquipementUtilisateur>
): SynthesePanoplie | null {
        const panoplie = getPanoplieParNom(panoplieNom);
        if (!panoplie) {
                return null;
        }

        const equipements = panoplie.composition
                .map((nom) => getEquipementParNom(nom))
                .filter((equipement): equipement is NonNullable<typeof equipement> => Boolean(equipement));

        const effetsEquipements: Record<string, IntervalleEffet> = {};
        const effetsBonus: Record<string, IntervalleEffet> = {};
        const prixDetails: DetailPrixEquipement[] = [];
        const prixManquants: string[] = [];

        let niveauMinimal = 0;
        let prixTotal = 0;
        let nombrePiecesActives = 0;

        for (const equipement of equipements) {
                if (equipement.effets) {
                        additionnerEffets(equipement.effets, effetsEquipements);
                }

                niveauMinimal = Math.max(niveauMinimal, equipement.niveau ?? 0);

                const etat = etatEquipements[equipement.nom];
                const appartientALaPanoplie = etat?.panoplie === panoplie.nom;
                if (appartientALaPanoplie) {
                        nombrePiecesActives += 1;
                }

                let prix: number | null = null;
                if (etat && appartientALaPanoplie && typeof etat.prix === 'number') {
                        prix = etat.prix;
                        prixTotal += prix;
                } else if (appartientALaPanoplie) {
                        prixManquants.push(equipement.nom);
                }

                prixDetails.push({ nom: equipement.nom, prix });
        }

        const bonus = panoplie['bonus de la panoplie'] ?? [];

        for (let index = 0; index < bonus.length; index += 1) {
                const seuilPieces = Math.min(panoplie.composition.length, index + 2);
                if (nombrePiecesActives < seuilPieces) {
                        continue;
                }

                for (const effet of bonus[index]) {
                        const [nomEffet, valeur] = Object.entries(effet)[0] ?? [];
                        if (!nomEffet || valeur === undefined) {
                                continue;
                        }

                        const intervalle = versIntervalle(valeur);
                        effetsBonus[nomEffet] = additionnerIntervalle(effetsBonus[nomEffet], intervalle);
                }
        }

        const effetsTotals = fusionnerEffets(effetsEquipements, effetsBonus);

        return {
                panoplie,
                equipements,
                effetsEquipements,
                effetsBonus,
                effetsTotals,
                niveauMinimal,
                nombrePiecesActives,
                prixTotal,
                prixManquants,
                prixDetails
        };
}
