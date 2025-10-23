<script lang="ts">
        import { get } from 'svelte/store';
        import { calculerSynthesePanoplie } from '$lib/services/analyse-panoplies';
        import {
                getEquipementParNom,
                getPanoplieParNom,
                listerPanoplies
        } from '$lib/services/base-de-donnees';
        import {
                definirPanopliePourEquipement,
                definirPrixPourEquipement,
                equipementsUtilisateur,
                reinitialiserPanopliesUtilisateur
        } from '$lib/stores/panoplies';
        import type { Equipement, Panoplie } from '$lib/types';

        const panoplies = listerPanoplies();
        let recherche = '';
        let panoplieSelectionneeNom = panoplies[0]?.nom ?? '';

        function normaliserTexte(texte: string): string {
                return texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        }

        $: panopliesFiltrees = panoplies.filter((panoplie) =>
                normaliserTexte(panoplie.nom).includes(normaliserTexte(recherche))
        );

        $: if (panopliesFiltrees.length > 0 && !panopliesFiltrees.some((p) => p.nom === panoplieSelectionneeNom)) {
                panoplieSelectionneeNom = panopliesFiltrees[0].nom;
        }

        $: panoplieSelectionnee = panoplieSelectionneeNom
                ? getPanoplieParNom(panoplieSelectionneeNom)
                : undefined;

        $: equipementsPanoplie = panoplieSelectionnee
                ? panoplieSelectionnee.composition
                                .map((nom) => getEquipementParNom(nom))
                                .filter((equipement): equipement is Equipement => Boolean(equipement))
                : [];

        $: synthese = panoplieSelectionnee
                ? calculerSynthesePanoplie(panoplieSelectionnee.nom, $equipementsUtilisateur)
                : null;

        function basculerEquipementDansPanoplie(nom: string, actif: boolean) {
                if (!panoplieSelectionnee) {
                        return;
                }

                definirPanopliePourEquipement(nom, actif ? panoplieSelectionnee.nom : null);
        }

        function mettreAJourPrix(nom: string, valeur: string) {
                const nettoye = valeur.replace(/\s/g, '');
                if (!nettoye) {
                        definirPrixPourEquipement(nom, null);
                        return;
                }

                const montant = Number(nettoye);
                definirPrixPourEquipement(nom, Number.isFinite(montant) && montant >= 0 ? Math.round(montant) : null);
        }

        function formaterIntervalle(intervalle: { min: number; max: number }): string {
                if (intervalle.min === intervalle.max) {
                        return intervalle.min.toString();
                }

                return `${intervalle.min} à ${intervalle.max}`;
        }

        function formaterPrix(valeur: number | null | undefined): string {
                if (valeur === null || valeur === undefined) {
                        return '—';
                }

                return new Intl.NumberFormat('fr-CA').format(valeur);
        }
</script>

<header class="entete">
        <div>
                <h2>Gestion des panoplies</h2>
                <p>Activez les pièces dont vous disposez et consignez leur prix pour obtenir une synthèse instantanée.</p>
        </div>
        <button type="button" class="bouton-secondaire" on:click={reinitialiserPanopliesUtilisateur}>
                Réinitialiser mes suivis
        </button>
</header>

<section class="outils-selection">
        <label>
                <span>Recherche</span>
                <input type="search" placeholder="Nom de panoplie" bind:value={recherche} />
        </label>
        <label>
                <span>Panoplie sélectionnée</span>
                <select bind:value={panoplieSelectionneeNom}>
                        {#each panopliesFiltrees as panoplie}
                                <option value={panoplie.nom}>{panoplie.nom}</option>
                        {/each}
                </select>
        </label>
        <p class="compteur">{panopliesFiltrees.length} panoplie(s) correspondante(s)</p>
</section>

{#if panoplieSelectionnee}
        <section class="presentation">
                <div class="resume">
                        <h3>{panoplieSelectionnee.nom}</h3>
                        <p>Niveau recommandé : {panoplieSelectionnee.niveau ?? '—'}</p>
                        <p>Pièces officielles : {panoplieSelectionnee.composition.length}</p>
                        {#if synthese}
                                <p>
                                        Pièces actives suivies : {synthese.nombrePiecesActives} / {panoplieSelectionnee.composition.length}
                                </p>
                        {/if}
                </div>
                {#if panoplieSelectionnee.illustration_url}
                        <img src={panoplieSelectionnee.illustration_url} alt={panoplieSelectionnee.nom} />
                {/if}
        </section>

        <section class="liste-equipements">
                {#if equipementsPanoplie.length === 0}
                        <p>Aucun équipement n&rsquo;a été trouvé pour cette panoplie dans les données locales.</p>
                {:else}
                        {#each equipementsPanoplie as equipement}
                                {@const etat = $equipementsUtilisateur[equipement.nom]}
                                {@const estActif = etat?.panoplie === panoplieSelectionnee.nom}
                                <article class:actif={estActif}>
                                        <header>
                                                <div class="titre">
                                                        {#if equipement.illustration_url}
                                                                <img src={equipement.illustration_url} alt={equipement.nom} />
                                                        {/if}
                                                        <div>
                                                                <h4>{equipement.nom}</h4>
                                                                <p>Niveau {equipement.niveau ?? '—'} · {equipement.Type ?? 'Type inconnu'}</p>
                                                        </div>
                                                </div>
                                                <label class="toggle">
                                                        <input
                                                                type="checkbox"
                                                                checked={estActif}
                                                                on:change={(event) =>
                                                                        basculerEquipementDansPanoplie(
                                                                                equipement.nom,
                                                                                (event.currentTarget as HTMLInputElement).checked
                                                                        )
                                                                }
                                                        />
                                                        <span>Inclure</span>
                                                </label>
                                        </header>

                                        <div class="contenu">
                                                <label>
                                                        <span>Prix (kamas)</span>
                                                        <input
                                                                type="number"
                                                                min="0"
                                                                step="100"
                                                                value={etat?.prix ?? ''}
                                                                disabled={!estActif}
                                                                on:change={(event) =>
                                                                        mettreAJourPrix(
                                                                                equipement.nom,
                                                                                (event.currentTarget as HTMLInputElement).value
                                                                        )
                                                                }
                                                        />
                                                </label>
                                                <p class="resume-effets">
                                                        {#if equipement.effets}
                                                                Effets clés : {Object.keys(equipement.effets).slice(0, 3).join(', ')}
                                                        {:else}
                                                                Aucun effet recensé dans la base locale.
                                                        {/if}
                                                </p>
                                        </div>
                                </article>
                        {/each}
                {/if}
        </section>

        {#if synthese}
                <section class="synthese">
                        <h3>Synthèse de la panoplie</h3>
                        <div class="grille">
                                <div>
                                        <h4>Prix total</h4>
                                        <p class="valeur">
                                                {formaterPrix(synthese.prixTotal)} kamas
                                        </p>
                                        {#if synthese.prixManquants.length > 0}
                                                <p class="note">
                                                        Prix manquant pour : {synthese.prixManquants.join(', ')}
                                                </p>
                                        {/if}
                                </div>
                                <div>
                                        <h4>Niveau minimal</h4>
                                        <p class="valeur">{synthese.niveauMinimal}</p>
                                </div>
                                <div>
                                        <h4>Pièces actives</h4>
                                        <p class="valeur">
                                                {synthese.nombrePiecesActives} / {panoplieSelectionnee.composition.length}
                                        </p>
                                </div>
                        </div>

                        <div class="tableau-effets">
                                <h4>Statistiques cumulées</h4>
                                <ul>
                                        {#each Object.entries(synthese.effetsTotals) as [effet, intervalle]}
                                                <li>
                                                        <strong>{effet}</strong>
                                                        <span>{formaterIntervalle(intervalle)}</span>
                                                </li>
                                        {/each}
                                </ul>
                        </div>

                        {#if Object.keys(synthese.effetsBonus).length > 0}
                                <div class="tableau-effets">
                                        <h4>Bonus de panoplie appliqués</h4>
                                        <ul>
                                                {#each Object.entries(synthese.effetsBonus) as [effet, intervalle]}
                                                        <li>
                                                                <strong>{effet}</strong>
                                                                <span>{formaterIntervalle(intervalle)}</span>
                                                        </li>
                                                {/each}
                                        </ul>
                                </div>
                        {/if}

                        <div class="liste-prix">
                                <h4>Détail des prix saisis</h4>
                                <ul>
                                        {#each synthese.prixDetails as detail}
                                                <li>
                                                        <span>{detail.nom}</span>
                                                        <span>{formaterPrix(detail.prix)} kamas</span>
                                                </li>
                                        {/each}
                                </ul>
                        </div>
                </section>
        {/if}
{:else}
        <p>Aucune panoplie ne correspond à la recherche actuelle.</p>
{/if}

<style>
        .entete {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                align-items: center;
                gap: 1rem;
                margin-bottom: 1.5rem;
        }

        .bouton-secondaire {
                background: transparent;
                border: 1px solid #d14343;
                color: #d14343;
                border-radius: 0.65rem;
                padding: 0.6rem 1rem;
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

        .outils-selection {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 1rem;
                background: white;
                padding: 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
                margin-bottom: 2rem;
        }

        label {
                display: flex;
                flex-direction: column;
                gap: 0.35rem;
                font-weight: 600;
        }

        input,
        select {
                padding: 0.65rem;
                border-radius: 0.5rem;
                border: 1px solid #cdd6f6;
        }

        .compteur {
                margin: auto 0 0 auto;
                font-weight: 600;
                color: #1f3c88;
        }

        .presentation {
                display: flex;
                flex-wrap: wrap;
                gap: 1.5rem;
                align-items: center;
                background: white;
                padding: 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
                margin-bottom: 2rem;
        }

        .presentation img {
                max-height: 140px;
        }

        .resume {
                display: grid;
                gap: 0.35rem;
        }

        .liste-equipements {
                display: grid;
                gap: 1.5rem;
        }

        .liste-equipements article {
                background: white;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
                padding: 1.5rem;
                display: grid;
                gap: 1rem;
                border: 2px solid transparent;
        }

        .liste-equipements article.actif {
                border-color: #1f3c88;
        }

        .liste-equipements header {
                display: flex;
                justify-content: space-between;
                gap: 1rem;
                flex-wrap: wrap;
        }

        .titre {
                display: flex;
                gap: 1rem;
                align-items: center;
        }

        .titre img {
                height: 56px;
                width: 56px;
        }

        .toggle {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
        }

        .contenu {
                display: grid;
                gap: 0.75rem;
        }

        .resume-effets {
                margin: 0;
                color: #4b5563;
        }

        .synthese {
                margin-top: 2rem;
                background: white;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
                padding: 1.5rem;
                display: grid;
                gap: 1.5rem;
        }

        .grille {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 1rem;
        }

        .valeur {
                font-size: 1.4rem;
                font-weight: 700;
        }

        .note {
                margin: 0.35rem 0 0 0;
                color: #b45309;
        }

        .tableau-effets ul {
                list-style: none;
                padding: 0;
                margin: 0;
                display: grid;
                gap: 0.5rem;
        }

        .tableau-effets li {
                display: flex;
                justify-content: space-between;
                gap: 1rem;
        }

        .liste-prix ul {
                list-style: none;
                padding: 0;
                margin: 0;
                display: grid;
                gap: 0.5rem;
        }

        .liste-prix li {
                display: flex;
                justify-content: space-between;
        }

        @media (max-width: 650px) {
                .tableau-effets li,
                .liste-prix li {
                        flex-direction: column;
                        align-items: flex-start;
                }
        }
</style>
