import { getEquipementParNom } from '$lib/services/base-de-donnees';
import {
        obtenirDefinitionSlot,
        definitionsSlots
} from '$lib/stores/panoplies';
import type {
        DefinitionSlot,
        DetailSlotSet,
        IntervalleEffet,
        SelectionSlot,
        SetUtilisateur,
        SlotEquipement,
        SyntheseSet,
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

function detailPourSlot(
        slotId: SlotEquipement,
        selection: SelectionSlot
): DetailSlotSet {
        const definition =
                obtenirDefinitionSlot(slotId) ??
                ({
                        id: slotId,
                        libelle: slotId,
                        description: ''
                } as DefinitionSlot);

        const equipement = selection.equipementNom
                ? getEquipementParNom(selection.equipementNom) ?? null
                : null;

        return { slot: definition, selection, equipement };
}

export function calculerSyntheseSet(set: SetUtilisateur): SyntheseSet {
        const effetsTotals: Record<string, IntervalleEffet> = {};
        const prixManquants: SlotEquipement[] = [];
        const details: DetailSlotSet[] = [];

        let niveauMinimal = 0;
        let prixTotal = 0;
        let slotsActifs = 0;

        for (const definition of definitionsSlots) {
                const selection = set.slots[definition.id];
                const detail = detailPourSlot(definition.id, selection);
                details.push(detail);

                if (detail.equipement) {
                        const equipement = detail.equipement;
                        if (equipement.effets) {
                                additionnerEffets(equipement.effets, effetsTotals);
                        }
                        niveauMinimal = Math.max(niveauMinimal, equipement.niveau ?? 0);
                        slotsActifs += 1;
                }

                if (typeof selection.prix === 'number') {
                        prixTotal += selection.prix;
                } else if (selection.equipementNom) {
                        prixManquants.push(definition.id);
                }
        }

        return {
                set,
                details,
                effetsTotals,
                niveauMinimal,
                prixTotal,
                prixManquants,
                slotsActifs
        };
}
