import { browser } from '$app/environment';
import { derived, writable } from 'svelte/store';
import type {
        EtatEquipementUtilisateur,
        EtatPanopliesUtilisateur
} from '$lib/types';

const CLE_STOCKAGE = 'panoplies-utilisateur';

const etatInitial: EtatPanopliesUtilisateur = {
        equipements: {},
        comparaison: [null, null]
};

function chargerDepuisStockage(): EtatPanopliesUtilisateur {
        if (!browser) {
                return etatInitial;
        }

        try {
                const contenu = localStorage.getItem(CLE_STOCKAGE);
                if (!contenu) {
                        return etatInitial;
                }

                const objet = JSON.parse(contenu) as EtatPanopliesUtilisateur;
                return {
                        equipements: objet.equipements ?? {},
                        comparaison: objet.comparaison ?? [null, null]
                };
        } catch (erreur) {
                console.error('Impossible de charger les données locales :', erreur);
                return etatInitial;
        }
}

function cloner<T>(valeur: T): T {
        if (typeof structuredClone === 'function') {
                return structuredClone(valeur);
        }

        return JSON.parse(JSON.stringify(valeur)) as T;
}

const etatInterne = writable<EtatPanopliesUtilisateur>(chargerDepuisStockage());

if (browser) {
        etatInterne.subscribe((valeur) => {
                localStorage.setItem(CLE_STOCKAGE, JSON.stringify(valeur));
        });
}

function miseAJour(
        mutation: (etat: EtatPanopliesUtilisateur) => EtatPanopliesUtilisateur
) {
        etatInterne.update((courant) => mutation(cloner(courant)));
}

export const etatPanopliesUtilisateur = {
        subscribe: etatInterne.subscribe
};

export const equipementsUtilisateur = derived(etatInterne, (etat) => etat.equipements);

export const selectionComparaison = derived(etatInterne, (etat) => etat.comparaison);

export function definirPanopliePourEquipement(
        equipementNom: string,
        panoplieNom: string | null
) {
        miseAJour((etat) => {
                const equipements = { ...etat.equipements };
                const actuel: EtatEquipementUtilisateur = equipements[equipementNom] ?? {
                        prix: null,
                        panoplie: null
                };

                equipements[equipementNom] = {
                        ...actuel,
                        panoplie: panoplieNom
                };

                return {
                        ...etat,
                        equipements
                };
        });
}

export function definirPrixPourEquipement(equipementNom: string, prix: number | null) {
        miseAJour((etat) => {
                const equipements = { ...etat.equipements };
                const actuel: EtatEquipementUtilisateur = equipements[equipementNom] ?? {
                        prix: null,
                        panoplie: null
                };

                equipements[equipementNom] = {
                        ...actuel,
                        prix
                };

                return {
                        ...etat,
                        equipements
                };
        });
}

export function retirerEquipementUtilisateur(equipementNom: string) {
        miseAJour((etat) => {
                const equipements = { ...etat.equipements };
                delete equipements[equipementNom];

                return {
                        ...etat,
                        equipements
                };
        });
}

export function definirComparaisonPanoplies(index: 0 | 1, panoplieNom: string | null) {
        miseAJour((etat) => {
                const comparaison: [string | null, string | null] = [...etat.comparaison] as [
                        string | null,
                        string | null
                ];
                comparaison[index] = panoplieNom;

                return {
                        ...etat,
                        comparaison
                };
        });
}

export function reinitialiserPanopliesUtilisateur() {
        etatInterne.set(cloner(etatInitial));
}
