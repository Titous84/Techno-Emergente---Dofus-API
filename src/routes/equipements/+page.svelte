<script lang="ts">
        import equipements from '$lib/data/equipements.json';

        // Zone de recherche simple sur le nom de l'équipement.
        let recherche = '';

        $: listeFiltree = equipements.filter((equipement) =>
                equipement.nom.toLowerCase().includes(recherche.toLowerCase())
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
