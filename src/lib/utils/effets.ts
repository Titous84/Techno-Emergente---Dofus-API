const mapping: Record<string, string> = {
        Vitalité: 'pv',
        Force: 'terre',
        Intelligence: 'feu',
        Chance: 'eau',
        Agilité: 'air',
        Sagesse: 'sagesse',
        Tacle: 'tacle',
        Fuite: 'fuite',
        Portée: 'po',
        PA: 'pa',
        PM: 'pm',
        Prospection: 'pp',
        Puissance: 'puissance',
        'Retrait PA': 'retraitPA',
        'Retrait PM': 'retraitPM',
        'Esquive PA': 'esquivePA',
        'Esquive PM': 'esquivePM',
        '% Critique': 'critique',
        'Dommage(s)': 'dommages',
        'Dommage(s) Critiques': 'dommagesCrit',
        Initiative: 'initiative',
        '% Résistance Neutre': 'resNeutre',
        '% Résistance Terre': 'resTerre',
        '% Résistance Feu': 'resFeu',
        '% Résistance Eau': 'resEau',
        '% Résistance Air': 'resAir',
        'Résistance(s) Critiques': 'resCrit',
        'Invocation(s)': 'invocation',
        'Résistance(s) Poussée': 'resPoussee'
};

/**
 * Retourne l'URL d'une icône illustrant un effet donné.
 * Si l'effet n'est pas répertorié, on tente une normalisation simple.
 */
export function effetToImageUrl(effet: string): string {
        const filename = mapping[effet] || effet.toLowerCase().replace(/\s|\(|\)|%|'|\/|-/g, '');
        return `https://dofusdb.fr/icons/effects/${filename}.png`;
}
