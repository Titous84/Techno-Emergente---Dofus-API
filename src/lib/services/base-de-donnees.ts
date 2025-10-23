import equipements from '$lib/data/equipements.json';
import panoplies from '$lib/data/panoplie.json';
import ressources from '$lib/data/ressources.json';
import type { Equipement, PanoplieOfficielle } from '$lib/types';

// Conversion explicite pour bénéficier de l'autocomplétion TypeScript.
const equipementsDonnees = equipements as unknown as Equipement[];
const panopliesDonnees = panoplies as unknown as PanoplieOfficielle[];

// Conversion explicite pour bénéficier de l'autocomplétion TypeScript.
const equipementsDonnees = equipements as unknown as Equipement[];
const panopliesDonnees = panoplies as unknown as PanoplieOfficielle[];

function normaliserTexte(texte: unknown): string {
        return String(texte ?? '')
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();
}

export function getEquipementParNom(nom: string): Equipement | undefined {
        const resultat = equipementsDonnees.find((e) => e.nom === nom);
        if (!resultat) {
                console.warn('❌ Équipement non trouvé :', nom);
                console.log(
                        'Voici quelques noms disponibles :',
                        equipementsDonnees.slice(0, 5).map((e) => e.nom)
                );
        }
        return resultat;
}

export function getPanoplieParEquipement(equipementNom: string): PanoplieOfficielle | undefined {
        const nomNormalise = normaliserTexte(equipementNom);
        return panopliesDonnees.find((p) => p.composition.some((nom) => normaliserTexte(nom) === nomNormalise));
}

export function trouverRessource(nom: string) {
	return ressources.find((r) => r.nom === nom);
}

export function listerTousLesEffets() {
	const setEffets = new Set<string>();

	for (const eq of equipements) {
		if (eq.effets) {
			for (const effet of Object.keys(eq.effets)) {
				setEffets.add(effet);
			}
		}
	}

	return Array.from(setEffets).sort();
}
