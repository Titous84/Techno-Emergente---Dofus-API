<script lang="ts">
        import { calculerSynthesePanoplie } from '$lib/services/analyse-panoplies';
        import { listerPanoplies } from '$lib/services/base-de-donnees';
        import {
                definirComparaisonPanoplies,
                equipementsUtilisateur,
                selectionComparaison
        } from '$lib/stores/panoplies';

        const panoplies = listerPanoplies();

        $: comparaison = $selectionComparaison;
        $: syntheseA = comparaison[0]
                ? calculerSynthesePanoplie(comparaison[0], $equipementsUtilisateur)
                : null;
        $: syntheseB = comparaison[1]
                ? calculerSynthesePanoplie(comparaison[1], $equipementsUtilisateur)
                : null;

        $: effetsFusionnes = Array.from(
                new Set([
                        ...(syntheseA ? Object.keys(syntheseA.effetsTotals) : []),
                        ...(syntheseB ? Object.keys(syntheseB.effetsTotals) : [])
                ])
        ).sort((a, b) => a.localeCompare(b));

        function mettreAJourSelection(index: 0 | 1, valeur: string) {
                definirComparaisonPanoplies(index, valeur || null);
        }

        function permuter() {
                definirComparaisonPanoplies(0, comparaison[1] ?? null);
                definirComparaisonPanoplies(1, comparaison[0] ?? null);
        }

        function formaterIntervalle(intervalle: { min: number; max: number } | undefined | null) {
                if (!intervalle) {
                        return '—';
                }

                if (intervalle.min === intervalle.max) {
                        return intervalle.min.toString();
                }

                return `${intervalle.min} à ${intervalle.max}`;
        }

        function moyenne(intervalle: { min: number; max: number } | undefined | null) {
                if (!intervalle) {
                        return 0;
                }

                return (intervalle.min + intervalle.max) / 2;
        }

        function formaterPrix(valeur: number | null | undefined) {
                if (valeur === null || valeur === undefined) {
                        return '—';
                }

                return new Intl.NumberFormat('fr-CA').format(valeur);
        }

        function differenceIntervalle(
                valeurA: { min: number; max: number } | undefined,
                valeurB: { min: number; max: number } | undefined
        ) {
                if (!valeurA && !valeurB) {
                        return '—';
                }

                const diff = moyenne(valeurB ?? null) - moyenne(valeurA ?? null);
                if (!Number.isFinite(diff)) {
                        return '—';
                }

                const arrondi = Number(diff.toFixed(1));
                const prefixe = arrondi > 0 ? '+' : '';
                return `${prefixe}${arrondi}`;
        }
</script>

<header class="entete">
        <div>
                <h2>Comparateur de panoplies</h2>
                <p>Choisissez deux panoplies pour visualiser instantanément les écarts de statistiques et de prix.</p>
        </div>
        <button type="button" class="bouton-permuter" on:click={permuter}>
                Inverser A ↔ B
        </button>
</header>

<section class="selection">
        <div class="bloc-selection">
                <h3>Panoplie A</h3>
                <select value={comparaison[0] ?? ''} on:change={(event) => mettreAJourSelection(0, (event.currentTarget as HTMLSelectElement).value)}>
                        <option value="">Aucune sélection</option>
                        {#each panoplies as panoplie}
                                <option value={panoplie.nom}>{panoplie.nom}</option>
                        {/each}
                </select>
        </div>
        <div class="bloc-selection">
                <h3>Panoplie B</h3>
                <select value={comparaison[1] ?? ''} on:change={(event) => mettreAJourSelection(1, (event.currentTarget as HTMLSelectElement).value)}>
                        <option value="">Aucune sélection</option>
                        {#each panoplies as panoplie}
                                <option value={panoplie.nom}>{panoplie.nom}</option>
                        {/each}
                </select>
        </div>
</section>

<section class="resume-comparaison">
        <div>
                <h4>Panoplie A</h4>
                {#if syntheseA}
                        <p class="titre-panoplie">{syntheseA.panoplie.nom}</p>
                        <ul>
                                <li>Prix total : {formaterPrix(syntheseA.prixTotal)} kamas</li>
                                <li>Niveau minimal : {syntheseA.niveauMinimal}</li>
                                <li>Pièces actives : {syntheseA.nombrePiecesActives} / {syntheseA.panoplie.composition.length}</li>
                        </ul>
                {:else}
                        <p>Aucune panoplie A sélectionnée.</p>
                {/if}
        </div>
        <div>
                <h4>Panoplie B</h4>
                {#if syntheseB}
                        <p class="titre-panoplie">{syntheseB.panoplie.nom}</p>
                        <ul>
                                <li>Prix total : {formaterPrix(syntheseB.prixTotal)} kamas</li>
                                <li>Niveau minimal : {syntheseB.niveauMinimal}</li>
                                <li>Pièces actives : {syntheseB.nombrePiecesActives} / {syntheseB.panoplie.composition.length}</li>
                        </ul>
                {:else}
                        <p>Aucune panoplie B sélectionnée.</p>
                {/if}
        </div>
        <div>
                <h4>Écart (B - A)</h4>
                <ul>
                        <li>
                                Différence de prix :
                                {#if syntheseA && syntheseB}
                                        {formaterPrix(syntheseB.prixTotal - syntheseA.prixTotal)} kamas
                                {:else}
                                        —
                                {/if}
                        </li>
                        <li>
                                Différence de niveau :
                                {#if syntheseA && syntheseB}
                                        {syntheseB.niveauMinimal - syntheseA.niveauMinimal}
                                {:else}
                                        —
                                {/if}
                        </li>
                </ul>
        </div>
</section>

{#if syntheseA || syntheseB}
        <section class="tableau">
                <h3>Comparaison des statistiques</h3>
                <table>
                        <thead>
                                <tr>
                                        <th>Effet</th>
                                        <th>Panoplie A</th>
                                        <th>Panoplie B</th>
                                        <th>Écart (B - A)</th>
                                </tr>
                        </thead>
                        <tbody>
                                {#each effetsFusionnes as effet}
                                        {@const valeurA = syntheseA?.effetsTotals[effet]}
                                        {@const valeurB = syntheseB?.effetsTotals[effet]}
                                        <tr>
                                                <th scope="row">{effet}</th>
                                                <td>{formaterIntervalle(valeurA)}</td>
                                                <td>{formaterIntervalle(valeurB)}</td>
                                                <td>{differenceIntervalle(valeurA, valeurB)}</td>
                                        </tr>
                                {/each}
                        </tbody>
                </table>
        </section>
{:else}
        <p class="message-vide">
                Sélectionnez au moins une panoplie pour afficher le comparatif. Les données s&rsquo;appuient sur vos
                associations et prix saisis dans la page « Panoplies ».
        </p>
{/if}

<style>
        .entete {
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 1rem;
                margin-bottom: 1.5rem;
        }

        .bouton-permuter {
                background: #1f3c88;
                color: white;
                border: none;
                border-radius: 0.65rem;
                padding: 0.6rem 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .bouton-permuter:hover,
        .bouton-permuter:focus-visible {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(31, 60, 136, 0.2);
                outline: none;
        }

        .selection {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
        }

        .bloc-selection {
                background: white;
                padding: 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
                display: grid;
                gap: 0.75rem;
        }

        select {
                padding: 0.65rem;
                border-radius: 0.5rem;
                border: 1px solid #cdd6f6;
        }

        .resume-comparaison {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
        }

        .resume-comparaison > div {
                background: white;
                padding: 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
        }

        .titre-panoplie {
                font-weight: 700;
        }

        .resume-comparaison ul {
                padding-left: 1rem;
        }

        .tableau {
                background: white;
                padding: 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
        }

        table {
                width: 100%;
                border-collapse: collapse;
        }

        thead {
                background: #1f3c88;
                color: white;
        }

        th,
        td {
                padding: 0.75rem;
                border-bottom: 1px solid #e5e7eb;
                text-align: left;
        }

        tbody tr:nth-child(even) {
                background: #f8faff;
        }

        .message-vide {
                background: #fff7ed;
                border-left: 4px solid #f97316;
                padding: 1rem;
                border-radius: 0.5rem;
        }
</style>
