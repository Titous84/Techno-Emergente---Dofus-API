<script lang="ts">
        import { page } from '$app/stores';
        import { afterNavigate } from '$app/navigation';
        import {
                getEquipementParNom,
                getPanoplieParEquipement,
                trouverRessource
        } from '$lib/services/base-de-donnees';
        import { prixEquipements } from '$lib/stores/prix';
import { panopliesUtilisateur } from '$lib/stores/panoplies';
import type { Equipement, PanoplieOfficielle, PanopliePersonnalisee } from '$lib/types';

        let equipement: Equipement | null = null;
        let panoplie: PanoplieOfficielle | null = null;
        let messageConfirmation = '';
let panoplieSelectionnee = '';
let panopliesDisponibles: PanopliePersonnalisee[] = [];

$: panopliesDisponibles = $panopliesUtilisateur as PanopliePersonnalisee[];

        function chargerEquipement() {
                const equipementNom = decodeURIComponent($page.params.nom ?? '');
                equipement = getEquipementParNom(equipementNom) as Equipement | null;
                if (equipement) {
                        panoplie = getPanoplieParEquipement(equipement.nom) as PanoplieOfficielle | null;
                } else {
                        panoplie = null;
                }
                messageConfirmation = '';
        }

        chargerEquipement();

        afterNavigate(() => {
                chargerEquipement();
        });

        function effetToImageUrl(effet: string): string {
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

                const filename = mapping[effet] || effet.toLowerCase().replace(/\s|\(|\)|%|'|\/|-/g, '');
                return `https://dofusdb.fr/icons/effects/${filename}.png`;
        }

        function formaterEffet(valeur: number | [number, number]) {
                if (Array.isArray(valeur)) {
                        return `${valeur[0]} à ${valeur[1]}`;
                }
                return `${valeur}`;
        }

        function enregistrerPrix(event: Event) {
                if (!equipement) return;
                const cible = event.currentTarget as HTMLInputElement;
                prixEquipements.definirPrix(equipement.nom, Number(cible.value));
        }

        function ajouterALaPanoplie() {
        if (!equipement || !panoplieSelectionnee) {
                return;
        }
        panopliesUtilisateur.ajouterEquipement(panoplieSelectionnee, equipement.nom);
        const selection = panopliesDisponibles.find((p) => p.id === panoplieSelectionnee);
        messageConfirmation = selection
                ? `${equipement.nom} a été ajouté à « ${selection.nom} »`
                : `${equipement.nom} a été ajouté.`;
        setTimeout(() => (messageConfirmation = ''), 3000);
}
</script>

{#if equipement}
        <article class="fiche">
                <header>
                        <div>
                                <h2>{equipement.nom}</h2>
                                <p>
                                        <strong>Niveau :</strong> {equipement.niveau} · <strong>Type :</strong> {equipement.Type}
                                </p>
                                {#if equipement.url}
                                        <p>
                                                <a href={equipement.url} target="_blank" rel="noreferrer">Consulter sur l'encyclopédie</a>
                                        </p>
                                {/if}
                        </div>
                        {#if equipement.illustration_url}
                                <img src={equipement.illustration_url} alt={`Image de ${equipement.nom}`} />
                        {/if}
                </header>

                {#if equipement.description}
                        <p class="description">{equipement.description}</p>
                {/if}

                <section class="prix">
                        <h3>Prix personnalisé</h3>
                        <label>
                                Indiquer un prix en kamas
                                <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={$prixEquipements[equipement.nom] ?? ''}
                                        on:input={enregistrerPrix}
                                />
                        </label>
                        <p class="note">Le montant est stocké localement pour vos comparaisons.</p>
                </section>

                {#if equipement.effets}
                        <section>
                                <h3>Effets et caractéristiques</h3>
                                <ul class="effets">
                                        {#each Object.entries(equipement.effets) as [effet, valeur]}
                                                <li>
                                                        <img
                                                                src={effetToImageUrl(effet)}
                                                                alt={effet}
                                                                on:error={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                                                        />
                                                        <span>
                                                                <strong>{effet} :</strong> {formaterEffet(valeur)}
                                                        </span>
                                                </li>
                                        {/each}
                                </ul>
                        </section>
                {/if}

                {#if equipement.recette}
                        <section>
                                <h3>Recette de fabrication</h3>
                                <ul class="recette">
                                        {#each Object.entries(equipement.recette) as [nomIngredient, quantite]}
                                                {@const ressource = trouverRessource(nomIngredient)}
                                                <li>
                                                        {#if ressource?.illustration_url}
                                                                <img src={ressource.illustration_url} alt={ressource.nom} />
                                                        {/if}
                                                        <span>{quantite} × {ressource?.nom ?? nomIngredient}</span>
                                                </li>
                                        {/each}
                                </ul>
                        </section>
                {/if}

                <section class="ajout-panoplie">
                        <h3>Ajouter l'équipement à une panoplie personnelle</h3>
                {#if panopliesDisponibles.length === 0}
                        <p>
                                Aucune panoplie enregistrée pour le moment. Rendez-vous dans la section « Gestion des panoplies »
                                pour créer votre première configuration.
                        </p>
                {:else}
                        <div class="controle">
                                <select bind:value={panoplieSelectionnee}>
                                        <option value="">Sélectionner une panoplie</option>
                                        {#each panopliesDisponibles as panopliePerso}
                                                <option value={panopliePerso.id}>{panopliePerso.nom}</option>
                                        {/each}
                                </select>
                                <button type="button" on:click={ajouterALaPanoplie} disabled={!panoplieSelectionnee}>
                                                Ajouter à la panoplie
                                        </button>
                                </div>
                                {#if messageConfirmation}
                                        <p class="confirmation">{messageConfirmation}</p>
                                {/if}
                        {/if}
                </section>

                {#if panoplie}
                        <section>
                                <h3>Panoplie associée : {panoplie.nom}</h3>
                                <ul class="panoplie">
                                        {#each panoplie.composition as nom}
                                                <li>
                                                        {#if nom === equipement.nom}
                                                                <strong>{nom}</strong>
                                                        {:else}
                                                                <a href={`/equipements/${encodeURIComponent(nom)}`}>{nom}</a>
                                                        {/if}
                                                </li>
                                        {/each}
                                </ul>
                        </section>
                {/if}
        </article>
{:else}
        <p>Équipement non trouvé.</p>
{/if}

<style>
        .fiche {
                display: grid;
                gap: 1.5rem;
                background: white;
                padding: 2rem;
                border-radius: 1.5rem;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        header {
                display: flex;
                justify-content: space-between;
                gap: 1.5rem;
                align-items: center;
        }

        header img {
                width: 140px;
                height: 140px;
                object-fit: contain;
        }

        .description {
                font-style: italic;
        }

        .effets,
        .recette,
        .panoplie {
                list-style: none;
                margin: 0;
                padding: 0;
                display: grid;
                gap: 0.75rem;
        }

        .effets li,
        .recette li {
                display: flex;
                align-items: center;
                gap: 0.75rem;
        }

        .effets img,
        .recette img {
                width: 32px;
                height: 32px;
        }

        .panoplie li a {
                color: #2a4a7b;
                text-decoration: none;
        }

        .prix input {
                max-width: 200px;
        }

        .note {
                font-size: 0.85rem;
                color: #555;
        }

        .ajout-panoplie .controle {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
        }

        .ajout-panoplie select,
        .ajout-panoplie button,
        .prix input {
                padding: 0.5rem 0.75rem;
                border-radius: 0.5rem;
                border: 1px solid #d0d6e1;
        }

        .ajout-panoplie button {
                background: #2a4a7b;
                color: white;
                border: none;
                cursor: pointer;
        }

        .ajout-panoplie button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
        }

        .confirmation {
                color: #1b7f4a;
                font-weight: 600;
        }
</style>
