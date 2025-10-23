/**
 * Définitions TypeScript centralisées pour le projet.
 * Les interfaces sont commentées pour faciliter la compréhension.
 */

/**
 * Représente la structure d'un équipement provenant du fichier JSON local.
 */
export interface Equipement {
        nom: string;
        url?: string;
        illustration_url?: string;
        Type: string;
        description?: string;
        effets?: Record<string, number | [number, number]>;
        recette?: Record<string, number>;
        niveau: number;
}

/**
 * Structure de base d'une panoplie officielle (données provenant du JSON).
 */
export interface PanoplieOfficielle {
        nom: string;
        url?: string;
        illustration_url?: string;
        Type: string;
        'bonus de la panoplie'?: Record<string, number>[] | Record<string, number>[][];
        composition: string[];
        niveau: number;
}

/**
 * Représentation d'une panoplie personnalisée créée par l'utilisateur.
 */
export type EmplacementId =
        | 'chapeau'
        | 'cape'
        | 'collier'
        | 'ceinture'
        | 'anneau_1'
        | 'anneau_2'
        | 'bottes'
        | 'arme'
        | 'bouclier'
        | 'familier'
        | 'dofus_1'
        | 'dofus_2'
        | 'dofus_3'
        | 'dofus_4'
        | 'dofus_5'
        | 'dofus_6';

export type EmplacementsPanoplie = Record<EmplacementId, string | null>;

export interface EmplacementDefinition {
        /** Identifiant technique unique de l'emplacement. */
        id: EmplacementId;
        /** Libellé affiché dans l'interface. */
        nom: string;
        /** Catégorie pour regrouper visuellement les emplacements. */
        categorie: 'équipement' | 'dofus' | 'compagnon';
}

export interface PanopliePersonnalisee {
        id: string;
        nom: string;
        description?: string;
        emplacements: EmplacementsPanoplie;
        creeLe: string;
        modifieLe: string;
}

export const EMPLACEMENTS_PANOPLIE: EmplacementDefinition[] = [
        { id: 'chapeau', nom: 'Chapeau', categorie: 'équipement' },
        { id: 'cape', nom: 'Cape', categorie: 'équipement' },
        { id: 'collier', nom: 'Collier', categorie: 'équipement' },
        { id: 'ceinture', nom: 'Ceinture', categorie: 'équipement' },
        { id: 'anneau_1', nom: 'Anneau 1', categorie: 'équipement' },
        { id: 'anneau_2', nom: 'Anneau 2', categorie: 'équipement' },
        { id: 'bottes', nom: 'Bottes', categorie: 'équipement' },
        { id: 'arme', nom: 'Arme', categorie: 'équipement' },
        { id: 'bouclier', nom: 'Bouclier', categorie: 'équipement' },
        { id: 'familier', nom: 'Familier / Monture', categorie: 'compagnon' },
        { id: 'dofus_1', nom: 'Dofus ou Idole 1', categorie: 'dofus' },
        { id: 'dofus_2', nom: 'Dofus ou Idole 2', categorie: 'dofus' },
        { id: 'dofus_3', nom: 'Dofus ou Idole 3', categorie: 'dofus' },
        { id: 'dofus_4', nom: 'Dofus ou Idole 4', categorie: 'dofus' },
        { id: 'dofus_5', nom: 'Dofus ou Idole 5', categorie: 'dofus' },
        { id: 'dofus_6', nom: 'Dofus ou Idole 6', categorie: 'dofus' }
];

export function emplacementsVides(): EmplacementsPanoplie {
        return EMPLACEMENTS_PANOPLIE.reduce<Partial<EmplacementsPanoplie>>((acc, emplacement) => {
                acc[emplacement.id] = null;
                return acc;
        }, {}) as EmplacementsPanoplie;
}

/**
 * Résumé chiffré d'un effet additionné sur plusieurs équipements.
 */
export interface IntervalleEffet {
        min: number;
        max: number;
}

/**
 * Détails résumés d'une panoplie personnalisée (utilisé pour l'affichage et la comparaison).
 */
export interface ResumePanoplie {
        nombreEquipements: number;
        coutTotal: number;
        niveauMinimum: number;
        effets: Record<string, IntervalleEffet>;
}
