<script lang="ts">
        import { equipementsDisponibles } from '$lib/services/base-de-donnees';
        import type { EquipementComplet } from '$lib/services/base-de-donnees';

        const equipements: EquipementComplet[] = equipementsDisponibles;

        // Zone de recherche simple sur le nom de l'équipement.
        let recherche = '';

        $: termeRecherche = recherche.trim().toLowerCase();

        $: listeFiltree = equipements.filter((equipement) =>
                equipement.nom.toLowerCase().includes(termeRecherche)
        );
</script>

<h1>Liste des équipements</h1>

<label style="display: block; margin-bottom: 1rem;">
        <span>Rechercher un équipement :</span>
        <input
                type="search"
                placeholder="Ex. : Anneau du Nidas"
                bind:value={recherche}
                style="margin-left: 0.5rem; padding: 0.4rem;"
        />
</label>

{#if listeFiltree.length === 0}
        <p>Aucun équipement ne correspond à la recherche.</p>
{:else}
        <ul>
                {#each listeFiltree as equipement}
                        <li style="margin-bottom: 1rem;">
                                {#if equipement.illustration_url}
                                        <img
                                                src={equipement.illustration_url}
                                                alt={'Illustration de ' + equipement.nom}
                                                style="height: 40px; vertical-align: middle;"
                                        />
                                {/if}
                                <a href={`/equipements/${encodeURIComponent(equipement.nom)}`}>
                                        {equipement.nom} (niv. {equipement.niveau})
                                </a>
                        </li>
                {/each}
        </ul>
{/if}
