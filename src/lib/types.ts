export type ValeurEffet = number | [number, number];

export interface Effets {
        [nom: string]: ValeurEffet;
}

export interface Equipement {
        nom: string;
        url?: string;
        illustration_url?: string;
        Type?: string;
        description?: string;
        effets?: Effets;
        recette?: Record<string, number>;
        niveau?: number;
}

export interface Panoplie {
        nom: string;
        url?: string;
        illustration_url?: string;
        Type?: string;
        niveau?: number;
        composition: string[];
        'bonus de la panoplie'?: Array<Array<Record<string, ValeurEffet>>>;
}

export interface Ressource {
        nom: string;
        illustration_url?: string;
        description?: string;
}

export interface IntervalleEffet {
        min: number;
        max: number;
}

export type SlotEquipement =
        | 'coiffe'
        | 'cape'
        | 'collier'
        | 'anneau1'
        | 'anneau2'
        | 'ceinture'
        | 'bottes'
        | 'bouclier'
        | 'arme'
        | 'familier'
        | 'dofus1'
        | 'dofus2'
        | 'dofus3'
        | 'dofus4'
        | 'dofus5'
        | 'dofus6';

export interface DefinitionSlot {
        id: SlotEquipement;
        libelle: string;
        description: string;
}

export interface SelectionSlot {
        slot: SlotEquipement;
        equipementNom: string | null;
        prix: number | null;
}

export interface SetUtilisateur {
        id: string;
        nom: string;
        description?: string;
        slots: Record<SlotEquipement, SelectionSlot>;
        creeLe: string;
}

export interface EtatSetsUtilisateur {
        setEnCours: Record<SlotEquipement, SelectionSlot>;
        sets: SetUtilisateur[];
        comparaison: [string | null, string | null];
        setActifId: string | null;
}

export interface DetailSlotSet {
        slot: DefinitionSlot;
        selection: SelectionSlot;
        equipement: Equipement | null;
}

export interface SyntheseSet {
        set: SetUtilisateur;
        details: DetailSlotSet[];
        effetsTotals: Record<string, IntervalleEffet>;
        niveauMinimal: number;
        prixTotal: number;
        prixManquants: SlotEquipement[];
        slotsActifs: number;
}
