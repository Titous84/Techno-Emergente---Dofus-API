import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { EmplacementId, PanopliePersonnalisee } from '$lib/types';
import { emplacementsVides } from '$lib/types';

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

function normaliserPanoplie(entree: unknown): PanopliePersonnalisee | null {
        if (!entree || typeof entree !== 'object') {
                return null;
        }
        const base = emplacementsVides();
        const emplacements: typeof base = { ...base };

        const source = entree as Record<string, unknown>;

        if (source.emplacements && typeof source.emplacements === 'object') {
                for (const cle of Object.keys(base) as EmplacementId[]) {
                        const valeur = (source.emplacements as Record<string, unknown>)[cle];
                        if (typeof valeur === 'string' && valeur.trim().length > 0) {
                                emplacements[cle] = valeur;
                        }
                }
        } else if (Array.isArray(source.equipements)) {
                const ids = Object.keys(base) as EmplacementId[];
                source.equipements
                        .filter((nom): nom is string => typeof nom === 'string' && nom.trim().length > 0)
                        .forEach((nom, index) => {
                                const slot = ids[index];
                                if (slot) {
                                        emplacements[slot] = nom;
                                }
                        });
        }

        const nom = typeof source.nom === 'string' && source.nom.trim().length > 0
                ? source.nom.trim()
                : 'Panoplie sans nom';

        const creeLe = typeof source.creeLe === 'string' ? source.creeLe : new Date().toISOString();
        const modifieLe = typeof source.modifieLe === 'string' ? source.modifieLe : creeLe;

        return {
                id: typeof source.id === 'string' ? source.id : genererId(),
                nom,
                emplacements,
                creeLe,
                modifieLe
        };
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
                        return donnees
                                .map((item) => normaliserPanoplie(item))
                                .filter((item): item is PanopliePersonnalisee => item !== null);
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
                emplacements: emplacementsVides(),
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
                definirEquipement(id: string, emplacement: EmplacementId, equipementNom: string | null) {
                        update((liste) =>
                                liste.map((p) =>
                                        p.id === id
                                                ? {
                                                          ...p,
                                                          emplacements: {
                                                                  ...p.emplacements,
                                                                  [emplacement]: equipementNom
                                                          },
                                                          modifieLe: new Date().toISOString()
                                                  }
                                                : p
                                )
                        );
                },
                retirerEquipement(id: string, emplacement: EmplacementId) {
                        update((liste) =>
                                liste.map((p) =>
                                        p.id === id
                                                ? {
                                                          ...p,
                                                          emplacements: {
                                                                  ...p.emplacements,
                                                                  [emplacement]: null
                                                          },
                                                          modifieLe: new Date().toISOString()
                                                  }
                                                : p
                                )
                        );
                },
                reinitialiserEmplacements(id: string) {
                        update((liste) =>
                                liste.map((p) =>
                                        p.id === id
                                                ? {
                                                          ...p,
                                                          emplacements: emplacementsVides(),
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
                                        emplacements: { ...panoplieOriginale.emplacements },
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
