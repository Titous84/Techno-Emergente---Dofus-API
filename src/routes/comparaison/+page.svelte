<script lang="ts">
        import { calculerSyntheseSet } from '$lib/services/analyse-sets';
        import {
                comparaisonSets,
                definirComparaisonSet,
                definitionsSlots,
                setsSauvegardes
        } from '$lib/stores/panoplies';

        $: setsDisponibles = $setsSauvegardes;
        $: comparaison = $comparaisonSets;

        function trouverSet(id: string | null) {
                if (!id) {
                        return null;
                }
                return setsDisponibles.find((set) => set.id === id) ?? null;
        }

        $: syntheseA = (() => {
                const set = trouverSet(comparaison[0]);
                return set ? calculerSyntheseSet(set) : null;
        })();

        $: syntheseB = (() => {
                const set = trouverSet(comparaison[1]);
                return set ? calculerSyntheseSet(set) : null;
        })();

        $: effetsFusionnes = Array.from(
                new Set([...(syntheseA ? Object.keys(syntheseA.effetsTotals) : []), ...(syntheseB ? Object.keys(syntheseB.effetsTotals) : [])])
        ).sort((a, b) => a.localeCompare(b));

        function mettreAJourSelection(index: 0 | 1, valeur: string) {
                definirComparaisonSet(index, valeur || null);
        }

        function permuter() {
                definirComparaisonSet(0, comparaison[1] ?? null);
                definirComparaisonSet(1, comparaison[0] ?? null);
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

<svelte:head>
        <title>Comparer mes sets enregistrés</title>
</svelte:head>

<header class="entete">
        <div>
                <h2>Comparateur de sets</h2>
                <p>
                        Sélectionnez deux ensembles enregistrés pour comparer leurs statistiques cumulées, leur niveau
                        minimal et le coût estimé.
                </p>
        </div>
        <button type="button" class="bouton-permuter" on:click={permuter}>
                Inverser A ↔ B
        </button>
</header>

<section class="selection">
        <div class="bloc-selection">
                <h3>Set A</h3>
                <select value={comparaison[0] ?? ''} on:change={(event) => mettreAJourSelection(0, (event.currentTarget as HTMLSelectElement).value)}>
                        <option value="">Aucun set</option>
                        {#each setsDisponibles as set}
                                <option value={set.id}>{set.nom}</option>
                        {/each}
                </select>
        </div>
        <div class="bloc-selection">
                <h3>Set B</h3>
                <select value={comparaison[1] ?? ''} on:change={(event) => mettreAJourSelection(1, (event.currentTarget as HTMLSelectElement).value)}>
                        <option value="">Aucun set</option>
                        {#each setsDisponibles as set}
                                <option value={set.id}>{set.nom}</option>
                        {/each}
                </select>
        </div>
</section>

<section class="resume-comparaison">
        <div>
                <h4>Set A</h4>
                {#if syntheseA}
                        <p class="titre-set">{syntheseA.set.nom}</p>
                        <ul>
                                <li>Prix total : {formaterPrix(syntheseA.prixTotal)} kamas</li>
                                <li>Niveau minimal : {syntheseA.niveauMinimal}</li>
                                <li>Emplacements actifs : {syntheseA.slotsActifs} / {definitionsSlots.length}</li>
                        </ul>
                {:else}
                        <p>Aucun set A sélectionné.</p>
                {/if}
        </div>
        <div>
                <h4>Set B</h4>
                {#if syntheseB}
                        <p class="titre-set">{syntheseB.set.nom}</p>
                        <ul>
                                <li>Prix total : {formaterPrix(syntheseB.prixTotal)} kamas</li>
                                <li>Niveau minimal : {syntheseB.niveauMinimal}</li>
                                <li>Emplacements actifs : {syntheseB.slotsActifs} / {definitionsSlots.length}</li>
                        </ul>
                {:else}
                        <p>Aucun set B sélectionné.</p>
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

<section class="tableau-effets">
        <table>
                <caption>Comparaison détaillée des effets cumulés</caption>
                <thead>
                        <tr>
                                <th>Effet</th>
                                <th>Set A</th>
                                <th>Set B</th>
                                <th>Écart (B - A)</th>
                        </tr>
                </thead>
                <tbody>
                        {#each effetsFusionnes as effet}
                                <tr>
                                        <th scope="row">{effet}</th>
                                        <td>{formaterIntervalle(syntheseA?.effetsTotals[effet])}</td>
                                        <td>{formaterIntervalle(syntheseB?.effetsTotals[effet])}</td>
                                        <td>{differenceIntervalle(syntheseA?.effetsTotals[effet], syntheseB?.effetsTotals[effet])}</td>
                                </tr>
                        {/each}
                </tbody>
        </table>
</section>

<style>
        .entete {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                margin-bottom: 1.5rem;
        }

        .bouton-permuter {
                border: none;
                border-radius: 0.75rem;
                padding: 0.6rem 1.1rem;
                font-weight: 600;
                cursor: pointer;
                background: rgba(148, 163, 184, 0.2);
        }

        .selection {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
                background: white;
                padding: 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
        }

        .bloc-selection h3 {
                margin-top: 0;
        }

        select {
                width: 100%;
                padding: 0.65rem;
                border-radius: 0.5rem;
                border: 1px solid #cdd6f6;
        }

        .resume-comparaison {
                display: grid;
                gap: 1rem;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                margin-bottom: 2rem;
        }

        .resume-comparaison > div {
                background: white;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
                padding: 1.25rem;
        }

        .titre-set {
                font-weight: 700;
        }

        .tableau-effets table {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border-radius: 0.75rem;
                overflow: hidden;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
        }

        .tableau-effets caption {
                text-align: left;
                font-weight: 600;
                padding: 1rem;
        }

        th,
        td {
                padding: 0.75rem 1rem;
                border-bottom: 1px solid #e2e8f0;
                text-align: left;
        }

        tbody tr:nth-child(odd) {
                background: #f8fafc;
        }

        @media (max-width: 720px) {
                .entete {
                        flex-direction: column;
                        align-items: flex-start;
                }

                .resume-comparaison {
                        grid-template-columns: 1fr;
                }
        }
</style>
