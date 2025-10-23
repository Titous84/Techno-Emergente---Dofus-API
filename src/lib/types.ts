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
export interface PanopliePersonnalisee {
        id: string;
        nom: string;
        description?: string;
        equipements: string[];
        creeLe: string;
        modifieLe: string;
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
