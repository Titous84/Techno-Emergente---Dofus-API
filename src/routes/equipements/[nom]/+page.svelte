<script lang="ts">
        import { page } from '$app/stores';
        import { afterNavigate } from '$app/navigation';
        import { get } from 'svelte/store';
        import {
                getEquipementParNom,
                getPanopliesParEquipement,
                trouverRessource
        } from '$lib/services/base-de-donnees';
        import {
                definirPanopliePourEquipement,
                definirPrixPourEquipement,
                equipementsUtilisateur,
                retirerEquipementUtilisateur
        } from '$lib/stores/panoplies';
        import type { Equipement, Panoplie } from '$lib/types';

        let equipement: Equipement | undefined;
        let panopliesCompatibles: Panoplie[] = [];
        let panoplieSelectionnee = '';
        let prixSaisi = '';

        // Fonction qui charge les données en fonction du paramètre d'URL
        function chargerEquipement() {
                const equipementNom = decodeURIComponent($page.params.nom ?? '');
                equipement = getEquipementParNom(equipementNom);

                if (equipement) {
                        panopliesCompatibles = getPanopliesParEquipement(equipement.nom);
                        const etat = get(equipementsUtilisateur)[equipement.nom];
                        const panoplieExiste = etat?.panoplie
                                ? panopliesCompatibles.some((panoplie) => panoplie.nom === etat.panoplie)
                                : false;

                        panoplieSelectionnee = panoplieExiste ? (etat?.panoplie ?? '') : '';
                        prixSaisi = etat?.prix != null ? String(etat.prix) : '';
                } else {
                        panopliesCompatibles = [];
                        panoplieSelectionnee = '';
                        prixSaisi = '';
                }
        }

        // Chargement initial
        chargerEquipement();

        // Recharger quand l’URL change (navigation dans la même page dynamique)
        afterNavigate(() => {
                chargerEquipement();
        });

        $: etatEquipement = equipement ? $equipementsUtilisateur[equipement.nom] : undefined;

        function enregistrerPanoplie() {
                if (!equipement) {
                        return;
                }

                definirPanopliePourEquipement(equipement.nom, panoplieSelectionnee || null);
        }

        function enregistrerPrix(valeur: string) {
                if (!equipement) {
                        return;
                }

                const normalise = valeur.replace(/\s/g, '');
                if (!normalise) {
                        definirPrixPourEquipement(equipement.nom, null);
                        prixSaisi = '';
                        return;
                }

                const montant = Number(normalise);
                if (!Number.isFinite(montant) || montant < 0) {
                        prixSaisi = '';
                        definirPrixPourEquipement(equipement.nom, null);
                        return;
                }

                definirPrixPourEquipement(equipement.nom, Math.round(montant));
                prixSaisi = String(Math.round(montant));
        }

        function reinitialiserSuivi() {
                if (!equipement) {
                        return;
                }

                retirerEquipementUtilisateur(equipement.nom);
                panoplieSelectionnee = '';
                prixSaisi = '';
        }

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

		const filename = mapping[effet] || effet.toLowerCase().replace(/\s|\(|\)|%/g, '');
		return `https://dofusdb.fr/icons/effects/${filename}.png`;
	}
</script>

{#if equipement}
	<h1>{equipement.nom}</h1>

	{#if equipement.illustration_url}
		<img
			src={equipement.illustration_url}
			alt="Image de {equipement.nom}"
			style="max-height: 100px"
		/>
	{/if}

	<p><strong>Niveau :</strong> {equipement.niveau}</p>
	<p><strong>Type :</strong> {equipement.Type}</p>
	<p><strong>Description :</strong> {equipement.description}</p>

        <section class="gestion-utilisateur">
                <h2>Gestion personnalisée</h2>
                <div class="formulaire">
                        <label>
                                <span>Panoplie associée</span>
                                <select bind:value={panoplieSelectionnee} on:change={enregistrerPanoplie}>
                                        <option value="">Aucune panoplie suivie</option>
                                        {#each panopliesCompatibles as panoplie}
                                                <option value={panoplie.nom}>{panoplie.nom}</option>
                                        {/each}
                                </select>
                        </label>

                        <label>
                                <span>Prix observé (kamas)</span>
                                <input
                                        type="number"
                                        min="0"
                                        step="100"
                                        bind:value={prixSaisi}
                                        on:change={(event) => enregistrerPrix((event.currentTarget as HTMLInputElement).value)}
                                />
                        </label>

                        <div class="resume">
                                <p>
                                        <strong>Panoplie enregistrée :</strong>
                                        {etatEquipement?.panoplie ?? 'Non définie'}
                                </p>
                                <p>
                                        <strong>Prix enregistré :</strong>
                                        {#if typeof etatEquipement?.prix === 'number'}
                                                {new Intl.NumberFormat('fr-CA').format(etatEquipement?.prix)} kamas
                                        {:else}
                                                À déterminer
                                        {/if}
                                </p>
                        </div>

                        <button type="button" class="bouton-secondaire" on:click={reinitialiserSuivi}>
                                Retirer de mon suivi
                        </button>

                        <p class="note">
                                Les informations saisies sont conservées localement dans votre navigateur pour faciliter
                                la préparation de vos séances.
                        </p>
                </div>
        </section>

        {#if equipement.effets}
                <h2>Effets</h2>
                <ul>
                        {#each Object.entries(equipement.effets) as [effet, valeur]}
                                <li style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                        <img
                                                src={effetToImageUrl(effet)}
                                                alt={effet}
                                                style="height: 24px;"
                                                on:error={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                                        />
                                        <span>
                                                {effet} :
                                                {#if Array.isArray(valeur)}
                                                        {valeur[0]} à {valeur[1]}
                                                {:else}
                                                        {valeur}
                                                {/if}
                                        </span>
                                </li>
                        {/each}
                </ul>
        {/if}

        {#if equipement.recette}
                <h2>Recette</h2>
                <ul>
                        {#each Object.entries(equipement.recette) as [nomIngredient, quantite]}
                                {@const ressource = trouverRessource(nomIngredient)}
                                <li style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        {#if ressource}
                                                <img src={ressource.illustration_url} alt={ressource.nom} style="height: 32px;" />
                                                <span>{quantite} × {ressource.nom}</span>
                                        {:else}
                                                <span>{quantite} × {nomIngredient}</span>
                                        {/if}
                                </li>
                        {/each}
                </ul>
        {/if}

        {#if panopliesCompatibles.length > 0}
                <h2>Panoplies compatibles</h2>
                <div class="liste-panoplies">
                        {#each panopliesCompatibles as panoplie}
                                <article class:active={etatEquipement?.panoplie === panoplie.nom}>
                                        <header>
                                                <h3>{panoplie.nom}</h3>
                                                <p>Niveau recommandé : {panoplie.niveau ?? '—'}</p>
                                        </header>
                                        <ul>
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
                                </article>
                        {/each}
                </div>
        {/if}
{:else}
        <p>Équipement non trouvé.</p>
{/if}

<style>
        .gestion-utilisateur {
                margin: 2rem 0;
                background: white;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
                padding: 1.5rem;
        }

        .formulaire {
                display: grid;
                gap: 1rem;
        }

        label {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                font-weight: 600;
        }

        select,
        input {
                padding: 0.65rem;
                border-radius: 0.5rem;
                border: 1px solid #cdd6f6;
        }

        .resume {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                background: #f0f4ff;
                padding: 1rem;
                border-radius: 0.75rem;
        }

        .bouton-secondaire {
                justify-self: start;
                background: transparent;
                color: #d14343;
                border: 1px solid #d14343;
                border-radius: 0.65rem;
                padding: 0.5rem 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: background 0.2s ease, color 0.2s ease;
        }

        .bouton-secondaire:hover,
        .bouton-secondaire:focus-visible {
                background: #d14343;
                color: white;
                outline: none;
        }

        .note {
                margin: 0;
                font-size: 0.85rem;
                color: #4b5563;
        }

        .liste-panoplies {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
        }

        .liste-panoplies article {
                background: white;
                border-radius: 0.75rem;
                padding: 1rem;
                box-shadow: 0 4px 12px rgba(31, 60, 136, 0.1);
                border: 2px solid transparent;
        }

        .liste-panoplies article.active {
                border-color: #1f3c88;
        }

        .liste-panoplies header {
                margin-bottom: 0.75rem;
        }

        .liste-panoplies ul {
                list-style: none;
                padding: 0;
                margin: 0;
                display: grid;
                gap: 0.35rem;
        }

        .liste-panoplies a {
                text-decoration: none;
                color: #1f3c88;
        }

        .liste-panoplies a:hover,
        .liste-panoplies a:focus-visible {
                text-decoration: underline;
                outline: none;
        }

        @media (max-width: 600px) {
                .liste-panoplies {
                        grid-template-columns: 1fr;
                }
        }
</style>
