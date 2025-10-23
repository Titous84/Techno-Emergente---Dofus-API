import equipements from '$lib/data/equipements.json';
import type { Equipement, IntervalleEffet, PanopliePersonnalisee, ResumePanoplie } from '$lib/types';
import type { RegistrePrix } from '$lib/stores/prix';

/**
 * Retrouve les informations d'un équipement à partir de son nom exact.
 */
export function trouverEquipement(nom: string): Equipement | undefined {
        return equipements.find(
                (equipement) => typeof equipement.nom === 'string' && equipement.nom === nom
        );
}

/**
 * Additionne un effet dans la structure cumulée.
 */
function cumulerEffet(effets: Record<string, IntervalleEffet>, effet: string, valeur: number | [number, number]) {
        const enCours = effets[effet] ?? { min: 0, max: 0 };
        if (Array.isArray(valeur)) {
                enCours.min += valeur[0];
                enCours.max += valeur[1];
        } else {
                enCours.min += valeur;
                enCours.max += valeur;
        }
        effets[effet] = enCours;
}

/**
 * Génère un résumé (prix total, niveau, effets cumulés) d'une panoplie personnalisée.
 */
export function calculerResumePanoplie(
        panoplie: PanopliePersonnalisee,
        registrePrix: RegistrePrix
): ResumePanoplie {
        const effetsCumules: Record<string, IntervalleEffet> = {};
        let coutTotal = 0;
        let niveauMinimum = 0;

        for (const nomEquipement of panoplie.equipements) {
                const equipement = trouverEquipement(nomEquipement);
                if (!equipement) {
                        continue;
                }
                niveauMinimum = Math.max(niveauMinimum, equipement.niveau ?? 0);
                const prix = registrePrix[nomEquipement];
                if (prix) {
                        coutTotal += prix;
                }
                if (equipement.effets) {
                        for (const [effet, valeur] of Object.entries(equipement.effets)) {
                                cumulerEffet(effetsCumules, effet, valeur);
                        }
                }
        }

        return {
                nombreEquipements: panoplie.equipements.length,
                coutTotal,
                niveauMinimum,
                effets: Object.fromEntries(
                        Object.entries(effetsCumules).sort(([effetA], [effetB]) => effetA.localeCompare(effetB))
                )
        };
}

/**
 * Compare deux résumés et retourne une structure exploitable pour l'affichage.
 */
export function comparerEffets(
        resumeA: ResumePanoplie | null,
        resumeB: ResumePanoplie | null
) {
        const effets = new Set<string>();
        if (resumeA) {
                Object.keys(resumeA.effets).forEach((effet) => effets.add(effet));
        }
        if (resumeB) {
                Object.keys(resumeB.effets).forEach((effet) => effets.add(effet));
        }

        return Array.from(effets)
                .sort((a, b) => a.localeCompare(b))
                .map((effet) => ({
                        effet,
                        a: resumeA?.effets[effet] ?? null,
                        b: resumeB?.effets[effet] ?? null
                }));
}
