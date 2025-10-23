import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { PanopliePersonnalisee } from '$lib/types';

const STORAGE_KEY = 'dofus-panoplies-utilisateur';

type PanopliesState = PanopliePersonnalisee[];

/**
 * Génère un identifiant unique compatible navigateur/serveur.
 */
function genererId(): string {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                return crypto.randomUUID();
        }
        return `panoplie-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function chargerPanoplies(): PanopliesState {
        if (!browser) {
                return [];
        }
        try {
                const texte = localStorage.getItem(STORAGE_KEY);
                if (!texte) {
                        return [];
                }
                const donnees = JSON.parse(texte);
                if (Array.isArray(donnees)) {
                        return donnees as PanopliesState;
                }
        } catch (erreur) {
                console.warn('Impossible de lire les panoplies sauvegardées :', erreur);
        }
        return [];
}

function sauvegarderPanoplies(panoplies: PanopliesState) {
        if (!browser) {
                return;
        }
        try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(panoplies));
        } catch (erreur) {
                console.warn('Impossible de sauvegarder les panoplies :', erreur);
        }
}

function creerPanoplie(nom: string): PanopliePersonnalisee {
        const maintenant = new Date().toISOString();
        return {
                id: genererId(),
                nom,
                description: '',
                equipements: [],
                creeLe: maintenant,
                modifieLe: maintenant
        };
}

function creerStorePanoplies() {
        const { subscribe, update, set } = writable<PanopliesState>(chargerPanoplies());

        if (browser) {
                subscribe((valeur) => sauvegarderPanoplies(valeur));
        }

        return {
                subscribe,
                ajouterPanoplie(nom: string) {
                        const nomNettoye = nom.trim() || 'Nouvelle panoplie';
                        const panoplie = creerPanoplie(nomNettoye);
                        update((liste) => [...liste, panoplie]);
                        return panoplie.id;
                },
                supprimerPanoplie(id: string) {
                        update((liste) => liste.filter((p) => p.id !== id));
                },
                renommerPanoplie(id: string, nouveauNom: string) {
                        const nomNettoye = nouveauNom.trim();
                        if (!nomNettoye) {
                                return;
                        }
                        update((liste) =>
                                liste.map((p) =>
                                        p.id === id
                                                ? {
                                                          ...p,
                                                          nom: nomNettoye,
                                                          modifieLe: new Date().toISOString()
                                                  }
                                                : p
                                )
                        );
                },
                definirDescription(id: string, description: string) {
                        update((liste) =>
                                liste.map((p) =>
                                        p.id === id
                                                ? {
                                                          ...p,
                                                          description,
                                                          modifieLe: new Date().toISOString()
                                                  }
                                                : p
                                )
                        );
                },
                ajouterEquipement(id: string, equipementNom: string) {
                        update((liste) =>
                                liste.map((p) => {
                                        if (p.id !== id) {
                                                return p;
                                        }
                                        if (p.equipements.includes(equipementNom)) {
                                                return p;
                                        }
                                        return {
                                                ...p,
                                                equipements: [...p.equipements, equipementNom],
                                                modifieLe: new Date().toISOString()
                                        };
                                })
                        );
                },
                retirerEquipement(id: string, equipementNom: string) {
                        update((liste) =>
                                liste.map((p) =>
                                        p.id === id
                                                ? {
                                                          ...p,
                                                          equipements: p.equipements.filter((nom) => nom !== equipementNom),
                                                          modifieLe: new Date().toISOString()
                                                  }
                                                : p
                                )
                        );
                },
                dupliquerPanoplie(id: string) {
                        let nouvelId = '';
                        update((liste) => {
                                const panoplieOriginale = liste.find((p) => p.id === id);
                                if (!panoplieOriginale) {
                                        return liste;
                                }
                                const duplication: PanopliePersonnalisee = {
                                        ...panoplieOriginale,
                                        id: genererId(),
                                        nom: `${panoplieOriginale.nom} (copie)`,
                                        creeLe: new Date().toISOString(),
                                        modifieLe: new Date().toISOString()
                                };
                                nouvelId = duplication.id;
                                return [...liste, duplication];
                        });
                        return nouvelId;
                },
                reinitialiser() {
                        set([]);
                }
        };
}

export const panopliesUtilisateur = creerStorePanoplies();
