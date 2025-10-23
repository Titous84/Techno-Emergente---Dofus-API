import equipementsSource from '$lib/data/equipements.json';
import panopliesSource from '$lib/data/panoplie.json';
import ressourcesSource from '$lib/data/ressources.json';
import type { Equipement, Panoplie, Ressource } from '$lib/types';

const equipements = equipementsSource as unknown as Equipement[];
const panoplies = panopliesSource as unknown as Panoplie[];
const ressources = ressourcesSource as unknown as Ressource[];

function normaliserTexte(texte: string): string {
        return texte
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLowerCase();
}

export function listerEquipements(): Equipement[] {
        return equipements;
}

export function rechercherEquipements(terme: string): Equipement[] {
        if (!terme.trim()) {
                return equipements;
        }

        const termeNormalise = normaliserTexte(terme);
        return equipements.filter((equipement) =>
                normaliserTexte(equipement.nom).includes(termeNormalise)
        );
}

export function getEquipementParNom(nom: string): Equipement | undefined {
        const resultat = equipements.find((e) => e.nom === nom);
        if (!resultat) {
                console.warn('❌ Équipement non trouvé :', nom);
                console.log(
                        'Voici quelques noms disponibles :',
                        equipements.slice(0, 5).map((e) => e.nom)
                );
        }
        return resultat;
}

export function listerPanoplies(): Panoplie[] {
        return panoplies;
}

export function getPanoplieParNom(nom: string): Panoplie | undefined {
        const nomNormalise = normaliserTexte(nom);
        return panoplies.find((panoplie) => normaliserTexte(panoplie.nom) === nomNormalise);
}

export function getPanopliesParEquipement(equipementNom: string): Panoplie[] {
        const nomNormalise = normaliserTexte(equipementNom);
        return panoplies.filter((panoplie) =>
                panoplie.composition.some((nom) => normaliserTexte(nom) === nomNormalise)
        );
}

export function trouverRessource(nom: string): Ressource | undefined {
        return ressources.find((ressource) => ressource.nom === nom);
}

export function listerTousLesEffets(): string[] {
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
