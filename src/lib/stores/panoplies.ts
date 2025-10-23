import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';
import type {
        DefinitionSlot,
        EtatSetsUtilisateur,
        SelectionSlot,
        SetUtilisateur,
        SlotEquipement
} from '$lib/types';

const CLE_STOCKAGE = 'sets-utilisateur';

const DEFINITIONS_SLOTS: DefinitionSlot[] = [
        { id: 'coiffe', libelle: 'Coiffe', description: 'Casques, coiffes et chapeaux' },
        { id: 'cape', libelle: 'Cape', description: 'Capes, ailes et manteaux' },
        { id: 'collier', libelle: 'Collier', description: 'Amulettes et colliers' },
        { id: 'anneau1', libelle: 'Anneau 1', description: 'Premier emplacement d’anneau' },
        { id: 'anneau2', libelle: 'Anneau 2', description: 'Deuxième emplacement d’anneau' },
        { id: 'ceinture', libelle: 'Ceinture', description: 'Ceintures et ceinturons' },
        { id: 'bottes', libelle: 'Bottes', description: 'Bottes et sandales' },
        { id: 'bouclier', libelle: 'Bouclier', description: 'Boucliers et trophées défensifs' },
        { id: 'arme', libelle: 'Arme', description: 'Toutes les armes principales' },
        { id: 'familier', libelle: 'Familier', description: 'Familiers et montiliers' },
        { id: 'dofus1', libelle: 'Dofus / Idole 1', description: 'Premier emplacement de Dofus ou Idole' },
        { id: 'dofus2', libelle: 'Dofus / Idole 2', description: 'Deuxième emplacement de Dofus ou Idole' },
        { id: 'dofus3', libelle: 'Dofus / Idole 3', description: 'Troisième emplacement de Dofus ou Idole' },
        { id: 'dofus4', libelle: 'Dofus / Idole 4', description: 'Quatrième emplacement de Dofus ou Idole' },
        { id: 'dofus5', libelle: 'Dofus / Idole 5', description: 'Cinquième emplacement de Dofus ou Idole' },
        { id: 'dofus6', libelle: 'Dofus / Idole 6', description: 'Sixième emplacement de Dofus ou Idole' }
];

const IDS_SLOTS = DEFINITIONS_SLOTS.map((slot) => slot.id);

function creerSelectionVide(slot: SlotEquipement): SelectionSlot {
        return { slot, equipementNom: null, prix: null };
}

function creerEtatInitial(): EtatSetsUtilisateur {
        const setEnCours = Object.fromEntries(
                DEFINITIONS_SLOTS.map((definition) => [
                        definition.id,
                        creerSelectionVide(definition.id)
                ])
        ) as Record<SlotEquipement, SelectionSlot>;

        return {
                setEnCours,
                sets: [],
                comparaison: [null, null],
                setActifId: null
        };
}

function cloner<T>(valeur: T): T {
        if (typeof structuredClone === 'function') {
                return structuredClone(valeur);
        }

        return JSON.parse(JSON.stringify(valeur)) as T;
}

function chargerDepuisStockage(): EtatSetsUtilisateur {
        if (!browser) {
                return creerEtatInitial();
        }

        try {
                const contenu = localStorage.getItem(CLE_STOCKAGE);
                if (!contenu) {
                        return creerEtatInitial();
                }

                const brut = JSON.parse(contenu) as Partial<EtatSetsUtilisateur>;
                const base = creerEtatInitial();

                if (brut.setEnCours) {
                        for (const id of IDS_SLOTS) {
                                const slot = brut.setEnCours[id];
                                if (slot) {
                                        base.setEnCours[id] = {
                                                slot: id,
                                                equipementNom: slot.equipementNom ?? null,
                                                prix: typeof slot.prix === 'number' ? slot.prix : null
                                        };
                                }
                        }
                }

                if (Array.isArray(brut.sets)) {
                        const ensembles: SetUtilisateur[] = [];
                        for (const set of brut.sets) {
                                if (!set || typeof set !== 'object' || !set.id || !set.nom || !set.slots) {
                                        continue;
                                }

                                const slots = Object.fromEntries(
                                        IDS_SLOTS.map((id) => {
                                                const slotsSource = (set as { slots?: Record<string, unknown> }).slots ?? {};
                                                const selectionBrute = slotsSource[id] as
                                                        | { equipementNom?: unknown; prix?: unknown }
                                                        | undefined;
                                                const equipementNom =
                                                        typeof selectionBrute?.equipementNom === 'string'
                                                                ? selectionBrute.equipementNom
                                                                : null;
                                                const prix =
                                                        typeof selectionBrute?.prix === 'number'
                                                                ? selectionBrute.prix
                                                                : null;

                                                return [
                                                        id,
                                                        equipementNom !== null || prix !== null
                                                                ? {
                                                                          slot: id,
                                                                          equipementNom,
                                                                          prix
                                                                  }
                                                                : creerSelectionVide(id)
                                                ];
                                        })
                                ) as Record<SlotEquipement, SelectionSlot>;

                                ensembles.push({
                                        id: String(set.id),
                                        nom: String(set.nom),
                                        description:
                                                typeof (set as { description?: unknown }).description === 'string'
                                                        ? (set as { description: string }).description
                                                        : undefined,
                                        slots,
                                        creeLe:
                                                typeof (set as { creeLe?: unknown }).creeLe === 'string'
                                                        ? (set as { creeLe: string }).creeLe
                                                        : new Date().toISOString()
                                });
                        }

                        base.sets = ensembles;
                }

                if (Array.isArray(brut.comparaison)) {
                        base.comparaison = [
                                brut.comparaison[0] ?? null,
                                brut.comparaison[1] ?? null
                        ] as [string | null, string | null];
                }

                base.setActifId = brut.setActifId ?? null;

                return base;
        } catch (erreur) {
                console.error('Impossible de charger le stockage local :', erreur);
                return creerEtatInitial();
        }
}

function genererId(): string {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
                return crypto.randomUUID();
        }
        return `set-${Math.random().toString(36).slice(2, 10)}`;
}

const etatInterne = writable<EtatSetsUtilisateur>(chargerDepuisStockage());

if (browser) {
        etatInterne.subscribe((valeur) => {
                localStorage.setItem(CLE_STOCKAGE, JSON.stringify(valeur));
        });
}

function miseAJour(mutation: (etat: EtatSetsUtilisateur) => EtatSetsUtilisateur) {
        etatInterne.update((courant) => mutation(cloner(courant)));
}

export const definitionsSlots = DEFINITIONS_SLOTS;

export const setEnCours = derived(etatInterne, (etat) => etat.setEnCours);

export const setsSauvegardes = derived(etatInterne, (etat) => etat.sets);

export const comparaisonSets = derived(etatInterne, (etat) => etat.comparaison);

export const setActifId = derived(etatInterne, (etat) => etat.setActifId);

function reinitialiserSlot(selection: SelectionSlot): SelectionSlot {
        return { slot: selection.slot, equipementNom: null, prix: null };
}

export function viderSetEnCours() {
        miseAJour((etat) => ({
                ...etat,
                setEnCours: Object.fromEntries(
                        IDS_SLOTS.map((id) => [id, reinitialiserSlot(etat.setEnCours[id])])
                ) as Record<SlotEquipement, SelectionSlot>,
                setActifId: null
        }));
}

export function retirerEquipementDuSlot(slot: SlotEquipement) {
        miseAJour((etat) => ({
                ...etat,
                setEnCours: {
                        ...etat.setEnCours,
                        [slot]: reinitialiserSlot(etat.setEnCours[slot])
                }
        }));
}

export function definirPrixPourSlot(slot: SlotEquipement, prix: number | null) {
        miseAJour((etat) => ({
                ...etat,
                setEnCours: {
                        ...etat.setEnCours,
                        [slot]: {
                                ...etat.setEnCours[slot],
                                prix: typeof prix === 'number' ? prix : null
                        }
                }
        }));
}

export function assignerEquipementAuSlot(
        slot: SlotEquipement,
        equipementNom: string,
        prix?: number | null
) {
        miseAJour((etat) => {
                const setEnCours = { ...etat.setEnCours };

                for (const id of IDS_SLOTS) {
                        if (id !== slot && setEnCours[id].equipementNom === equipementNom) {
                                setEnCours[id] = reinitialiserSlot(setEnCours[id]);
                        }
                }

                setEnCours[slot] = {
                        ...setEnCours[slot],
                        equipementNom,
                        prix: typeof prix === 'number' ? prix : null
                };

                return {
                        ...etat,
                        setEnCours,
                        setActifId: null
                };
        });
}

export function trouverSelectionDansConstruction(
        equipementNom: string
): SelectionSlot | null {
        const etat = get(etatInterne);
        for (const id of IDS_SLOTS) {
                const selection = etat.setEnCours[id];
                if (selection.equipementNom === equipementNom) {
                        return selection;
                }
        }
        return null;
}

export function enregistrerSetDepuisConstruction(
        nom: string,
        description?: string | undefined
): string {
        const id = genererId();
        miseAJour((etat) => ({
                ...etat,
                sets: [
                        ...etat.sets,
                        {
                                id,
                                nom: nom.trim() || 'Set sans nom',
                                description: description?.trim() || undefined,
                                slots: cloner(etat.setEnCours),
                                creeLe: new Date().toISOString()
                        }
                ],
                setActifId: id
        }));
        return id;
}

export function chargerSetDansConstruction(id: string) {
        miseAJour((etat) => {
                const set = etat.sets.find((item) => item.id === id);
                if (!set) {
                        return etat;
                }

                return {
                        ...etat,
                        setEnCours: cloner(set.slots),
                        setActifId: set.id
                };
        });
}

export function mettreAJourSet(id: string, donnees: Partial<SetUtilisateur>) {
        miseAJour((etat) => ({
                ...etat,
                sets: etat.sets.map((set) => {
                        if (set.id !== id) {
                                return set;
                        }
                        return {
                                ...set,
                                ...donnees,
                                slots: donnees.slots ? cloner(donnees.slots) : set.slots
                        };
                }),
                setActifId: donnees.slots ? id : etat.setActifId
        }));
}

export function dupliquerSet(id: string): string | null {
        const etat = get(etatInterne);
        const original = etat.sets.find((set) => set.id === id);
        if (!original) {
                return null;
        }

        const copieId = genererId();
        const copieNom = `${original.nom} (copie)`;
        miseAJour((courant) => ({
                ...courant,
                sets: [
                        ...courant.sets,
                        {
                                ...cloner(original),
                                id: copieId,
                                nom: copieNom,
                                creeLe: new Date().toISOString()
                        }
                ],
                setActifId: copieId
        }));
        return copieId;
}

export function supprimerSet(id: string) {
        miseAJour((etat) => {
                const sets = etat.sets.filter((set) => set.id !== id);
                const comparaison: [string | null, string | null] = [
                        etat.comparaison[0] === id ? null : etat.comparaison[0],
                        etat.comparaison[1] === id ? null : etat.comparaison[1]
                ];

                const setActifId = etat.setActifId === id ? null : etat.setActifId;

                return {
                        ...etat,
                        sets,
                        comparaison,
                        setActifId
                };
        });
}

export function definirComparaisonSet(index: 0 | 1, setId: string | null) {
        miseAJour((etat) => {
                const comparaison: [string | null, string | null] = [...etat.comparaison] as [
                        string | null,
                        string | null
                ];

                comparaison[index] = setId;

                return {
                        ...etat,
                        comparaison
                };
        });
}

export function obtenirDefinitionSlot(id: SlotEquipement): DefinitionSlot | undefined {
        return DEFINITIONS_SLOTS.find((slot) => slot.id === id);
}

export function listerIdsSlots(): SlotEquipement[] {
        return [...IDS_SLOTS] as SlotEquipement[];
}
