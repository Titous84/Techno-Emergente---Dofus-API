<script lang="ts">
        import {
                creerSet,
                enregistrerPrixEquipement,
                mettreAJourPrixDansSet,
                renommerSet,
                retirerEquipementDuSet,
                setsStore,
                supprimerSet
        } from '$lib/services/gestion-sets';
        import { getEquipementParNom } from '$lib/services/base-de-donnees';

        let nomNouveauSet = '';
        let messageGlobal = '';

        function creerSetLocal() {
                if (nomNouveauSet.trim().length === 0) {
                        messageGlobal = 'Veuillez indiquer un nom pour créer un set.';
                        return;
                }
                const nouveau = creerSet(nomNouveauSet);
                messageGlobal = `✅ Set "${nouveau.nom}" créé.`;
                nomNouveauSet = '';
        }

        function renommerSetLocal(id: string, valeur: string) {
                renommerSet(id, valeur);
                messageGlobal = 'Nom du set mis à jour.';
        }

        function supprimerSetLocal(id: string) {
                if (confirm('Supprimer ce set ?')) {
                        supprimerSet(id);
                        messageGlobal = 'Set supprimé.';
                }
        }

        function mettreAJourPrix(setId: string, equipementNom: string, valeur: string) {
                const prix = Number(valeur) || 0;
                mettreAJourPrixDansSet(setId, equipementNom, prix);
                enregistrerPrixEquipement(equipementNom, prix);
                messageGlobal = `Prix mis à jour pour ${equipementNom}.`;
        }

        function retirerEquipement(setId: string, equipementNom: string) {
                retirerEquipementDuSet(setId, equipementNom);
                messageGlobal = `${equipementNom} retiré du set.`;
        }
</script>

<h1>Mes sets d'équipements</h1>

<section class="carte">
        <h2>Créer un nouveau set</h2>
        <form on:submit|preventDefault={creerSetLocal} class="formulaire">
                <label>
                        Nom du set :
                        <input type="text" bind:value={nomNouveauSet} placeholder="Ex. : Mode Terre" />
                </label>
                <button type="submit">Créer</button>
        </form>
</section>

{#if messageGlobal}
        <p class="message">{messageGlobal}</p>
{/if}

{#if $setsStore.length === 0}
        <p>Aucun set enregistré pour le moment.</p>
{:else}
        <div class="liste-sets">
                {#each $setsStore as set}
                        <article class="carte">
                                <header class="entete-set">
                                        <input
                                                type="text"
                                                value={set.nom}
                                                on:change={(event) => renommerSetLocal(set.id, event.currentTarget.value)}
                                        />
                                        <button type="button" on:click={() => supprimerSetLocal(set.id)}>
                                                Supprimer le set
                                        </button>
                                </header>

                                {#if set.equipements.length === 0}
                                        <p>Aucun équipement dans ce set pour le moment.</p>
                                {:else}
                                        <table>
                                                <thead>
                                                        <tr>
                                                                <th>Équipement</th>
                                                                <th>Niveau</th>
                                                                <th>Prix (kamas)</th>
                                                                <th></th>
                                                        </tr>
                                                </thead>
                                                <tbody>
                                                        {#each set.equipements as equipement}
                                                                {@const details = getEquipementParNom(equipement.nom)}
                                                                <tr>
                                                                        <td>{equipement.nom}</td>
                                                                        <td>{details?.niveau ?? '??'}</td>
                                                                        <td>
                                                                                <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        step="1"
                                                                                        value={equipement.prix}
                                                                                        on:change={(event) =>
                                                                                                mettreAJourPrix(
                                                                                                        set.id,
                                                                                                        equipement.nom,
                                                                                                        event.currentTarget.value
                                                                                                )
                                                                                        }
                                                                                />
                                                                        </td>
                                                                        <td>
                                                                                <button
                                                                                        type="button"
                                                                                        on:click={() => retirerEquipement(set.id, equipement.nom)}
                                                                                >
                                                                                        Retirer
                                                                                </button>
                                                                        </td>
                                                                </tr>
                                                        {/each}
                                                </tbody>
                                        </table>
                                {/if}
                        </article>
                {/each}
        </div>
{/if}

<style>
        .carte {
                border: 1px solid #dcdcdc;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1.5rem;
        }

        .formulaire {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                max-width: 320px;
        }

        .formulaire input {
                padding: 0.4rem;
        }

        .formulaire button {
                align-self: flex-start;
                padding: 0.5rem 1rem;
        }

        .liste-sets {
                display: flex;
                flex-direction: column;
                gap: 1rem;
        }

        .entete-set {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                align-items: center;
                justify-content: space-between;
        }

        .entete-set input {
                flex: 1;
                min-width: 200px;
                padding: 0.4rem;
        }

        table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 1rem;
        }

        th,
        td {
                border: 1px solid #e0e0e0;
                padding: 0.5rem;
                text-align: left;
        }

        input[type='number'] {
                width: 100%;
        }

        .message {
                color: #2e7d32;
        }
</style>
