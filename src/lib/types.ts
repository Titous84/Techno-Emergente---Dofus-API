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

export interface EtatEquipementUtilisateur {
        prix: number | null;
        panoplie: string | null;
}

export interface EtatPanopliesUtilisateur {
        equipements: Record<string, EtatEquipementUtilisateur>;
        comparaison: [string | null, string | null];
}

export interface DetailPrixEquipement {
        nom: string;
        prix: number | null;
}

export interface SynthesePanoplie {
        panoplie: Panoplie;
        equipements: Equipement[];
        effetsEquipements: Record<string, IntervalleEffet>;
        effetsBonus: Record<string, IntervalleEffet>;
        effetsTotals: Record<string, IntervalleEffet>;
        niveauMinimal: number;
        nombrePiecesActives: number;
        prixTotal: number;
        prixManquants: string[];
        prixDetails: DetailPrixEquipement[];
}
