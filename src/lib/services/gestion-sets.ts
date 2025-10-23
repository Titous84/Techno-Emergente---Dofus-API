import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

/**
 * Représente un équipement stocké dans un set personnalisé.
 */
export interface EquipementDansSet {
        nom: string;
        prix: number;
}

/**
 * Représente un set personnalisé complet (nom + équipements).
 */
export interface SetPersonnalise {
        id: string;
        nom: string;
        equipements: EquipementDansSet[];
}

const CLE_SETS = 'dofus-sets';
const CLE_PRIX = 'dofus-prix';

function chargerDepuisLocalStorage<T>(cle: string, defaut: T): T {
        if (!browser) {
                return defaut;
        }
        try {
                const brut = localStorage.getItem(cle);
                if (!brut) {
                        return defaut;
                }
                return JSON.parse(brut) as T;
        } catch (erreur) {
                console.warn('Impossible de lire les données locales :', erreur);
                return defaut;
        }
}

/**
 * Liste des sets personnalisés enregistrés dans le navigateur.
 */
export const setsStore: Writable<SetPersonnalise[]> = writable(
        chargerDepuisLocalStorage<SetPersonnalise[]>(CLE_SETS, [])
);

/**
 * Tableau associatif des prix connus par équipement (utilisé pour préremplir les champs).
 */
export const prixEquipementsStore: Writable<Record<string, number>> = writable(
        chargerDepuisLocalStorage<Record<string, number>>(CLE_PRIX, {})
);

if (browser) {
        // Sauvegarde automatique dès qu'un store évolue.
        setsStore.subscribe((valeur) => {
                localStorage.setItem(CLE_SETS, JSON.stringify(valeur));
        });
        prixEquipementsStore.subscribe((valeur) => {
                localStorage.setItem(CLE_PRIX, JSON.stringify(valeur));
        });
}

function genererId(): string {
        if (browser && 'randomUUID' in crypto) {
                return crypto.randomUUID();
        }
        return `set-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/**
 * Crée un nouveau set et le retourne.
 */
export function creerSet(nom: string): SetPersonnalise {
        const nouveau: SetPersonnalise = {
                id: genererId(),
                nom: nom.trim() || 'Set sans nom',
                equipements: []
        };
        setsStore.update((liste) => [...liste, nouveau]);
        return nouveau;
}

/**
 * Modifie le nom d'un set existant.
 */
export function renommerSet(id: string, nouveauNom: string) {
        const nomNettoye = nouveauNom.trim() || 'Set sans nom';
        setsStore.update((liste) =>
                liste.map((set) => (set.id === id ? { ...set, nom: nomNettoye } : set))
        );
}

/**
 * Supprime un set complet.
 */
export function supprimerSet(id: string) {
        setsStore.update((liste) => liste.filter((set) => set.id !== id));
}

/**
 * Enregistre ou met à jour le prix d'un équipement de façon globale.
 */
export function enregistrerPrixEquipement(nom: string, prix: number) {
        const prixNettoye = Math.max(0, Math.round(prix * 100) / 100);
        prixEquipementsStore.update((dictionnaire) => ({
                ...dictionnaire,
                [nom]: prixNettoye
        }));
}

/**
 * Ajoute un équipement à un set. S'il est déjà présent, son prix est mis à jour.
 */
export function ajouterEquipementAuSet(setId: string, equipementNom: string, prix: number) {
        const prixNettoye = Math.max(0, Math.round(prix * 100) / 100);
        setsStore.update((liste) =>
                liste.map((set) => {
                        if (set.id !== setId) {
                                return set;
                        }
                        const existe = set.equipements.find((eq) => eq.nom === equipementNom);
                        if (existe) {
                                return {
                                        ...set,
                                        equipements: set.equipements.map((eq) =>
                                                eq.nom === equipementNom
                                                        ? { ...eq, prix: prixNettoye }
                                                        : eq
                                        )
                                };
                        }
                        return {
                                ...set,
                                equipements: [...set.equipements, { nom: equipementNom, prix: prixNettoye }]
                        };
                })
        );
}

/**
 * Met à jour le prix d'un équipement pour un set donné.
 */
export function mettreAJourPrixDansSet(setId: string, equipementNom: string, prix: number) {
        const prixNettoye = Math.max(0, Math.round(prix * 100) / 100);
        setsStore.update((liste) =>
                liste.map((set) => {
                        if (set.id !== setId) {
                                return set;
                        }
                        return {
                                ...set,
                                equipements: set.equipements.map((eq) =>
                                        eq.nom === equipementNom ? { ...eq, prix: prixNettoye } : eq
                                )
                        };
                })
        );
}

/**
 * Retire un équipement d'un set.
 */
export function retirerEquipementDuSet(setId: string, equipementNom: string) {
        setsStore.update((liste) =>
                liste.map((set) =>
                        set.id === setId
                                ? {
                                          ...set,
                                          equipements: set.equipements.filter((eq) => eq.nom !== equipementNom)
                                  }
                                : set
                )
        );
}
