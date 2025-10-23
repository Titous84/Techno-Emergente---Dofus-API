<script lang="ts">
        import { listerEquipements } from '$lib/services/base-de-donnees';
        import { calculerSyntheseSet } from '$lib/services/analyse-sets';
        import {
                assignerEquipementAuSlot,
                chargerSetDansConstruction,
                definirPrixPourSlot,
                definitionsSlots,
                dupliquerSet,
                enregistrerSetDepuisConstruction,
                mettreAJourSet,
                retirerEquipementDuSlot,
                setActifId,
                setEnCours,
                setsSauvegardes,
                supprimerSet,
                viderSetEnCours
        } from '$lib/stores/panoplies';
        import type { Equipement, SlotEquipement } from '$lib/types';

        const equipements: Equipement[] = listerEquipements();
        const nomsEquipements = equipements.map((eq) => eq.nom).sort((a, b) => a.localeCompare(b));

        let nomSet = '';
        let descriptionSet = '';
        let message: string | null = null;
        let dernierSetChargeId: string | null = null;

        $: syntheseConstruction = calculerSyntheseSet({
                id: 'construction',
                nom: nomSet || 'Set en cours',
                description: descriptionSet || undefined,
                slots: $setEnCours,
                creeLe: new Date().toISOString()
        });

        $: resumeSets = $setsSauvegardes.map((set) => ({
                set,
                synthese: calculerSyntheseSet(set)
        }));

        $: if ($setActifId !== dernierSetChargeId) {
                const setCharge = resumeSets.find((item) => item.set.id === $setActifId);
                nomSet = setCharge?.set.nom ?? '';
                descriptionSet = setCharge?.set.description ?? '';
                dernierSetChargeId = $setActifId;
                if ($setActifId) {
                        message = `Set « ${setCharge?.set.nom ?? ''} » chargé pour édition.`;
                }
        }

        function mettreAJourEquipement(slot: SlotEquipement, valeur: string) {
                const nom = valeur.trim();
                if (!nom) {
                        retirerEquipementDuSlot(slot);
                        return;
                }

                assignerEquipementAuSlot(slot, nom);
        }

        function mettreAJourPrix(slot: SlotEquipement, valeur: string) {
                const nettoye = valeur.replace(/\s/g, '');
                if (!nettoye) {
                        definirPrixPourSlot(slot, null);
                        return;
                }

                const montant = Number(nettoye);
                definirPrixPourSlot(slot, Number.isFinite(montant) && montant >= 0 ? Math.round(montant) : null);
        }

        function sauvegarderConstruction() {
                if (!nomSet.trim()) {
                        message = 'Donnez un nom à votre set avant de l’enregistrer.';
                        return;
                }

                if ($setActifId) {
                        mettreAJourSetExiste($setActifId);
                        message = 'Set mis à jour avec succès.';
                } else {
                        const id = enregistrerSetDepuisConstruction(
                                nomSet.trim(),
                                descriptionSet.trim() || undefined
                        );
                        dernierSetChargeId = id;
                        message = 'Nouveau set enregistré.';
                }
        }

        function mettreAJourSetExiste(id: string) {
                mettreAJourSet(id, {
                        nom: nomSet.trim(),
                        description: descriptionSet.trim() || undefined,
                        slots: $setEnCours
                });
        }

        function enregistrerCommeNouveau() {
                if (!nomSet.trim()) {
                        message = 'Choisissez un nom pour créer un nouveau set.';
                        return;
                }

                const id = enregistrerSetDepuisConstruction(
                        nomSet.trim(),
                        descriptionSet.trim() || undefined
                );
                message = 'Copie enregistrée comme nouveau set.';
                dernierSetChargeId = id;
        }

        function reinitialiserConstruction() {
                viderSetEnCours();
                nomSet = '';
                descriptionSet = '';
                dernierSetChargeId = null;
                message = 'Construction réinitialisée.';
        }

        function selectionnerSet(id: string) {
                chargerSetDansConstruction(id);
        }

        function dupliquerEtEditer(id: string) {
                const nouveau = dupliquerSet(id);
                if (nouveau) {
                        chargerSetDansConstruction(nouveau);
                        message = 'Copie du set prête à être personnalisée.';
                }
        }

        function supprimerEtReinitialiser(id: string) {
                if (!confirm('Supprimer ce set enregistré ?')) {
                        return;
                }

                supprimerSet(id);
                if (dernierSetChargeId === id) {
                        nomSet = '';
                        descriptionSet = '';
                        dernierSetChargeId = null;
                }
                message = 'Set supprimé.';
        }
</script>

<svelte:head>
        <title>Construction de sets personnalisés</title>
</svelte:head>

<section class="intro">
        <div>
                <h2>Construire mes sets</h2>
                <p>
                        Complétez chaque emplacement avec un équipement et son prix, puis enregistrez l&rsquo;ensemble comme
                        nouveau set pour la comparaison.
                </p>
        </div>
        <div class="actions-intro">
                <button type="button" class="secondaire" on:click={reinitialiserConstruction}>
                        Réinitialiser la construction
                </button>
        </div>
</section>

<section class="edition">
        <header class="entete-set">
                <div>
                        <label>
                                <span>Nom du set</span>
                                <input type="text" bind:value={nomSet} placeholder="Ex. Panoplie PvM Terre" />
                        </label>
                        <label>
                                <span>Description / notes</span>
                                <textarea rows="2" bind:value={descriptionSet} placeholder="Objectifs, variantes, etc."></textarea>
                        </label>
                </div>
                <div class="resume-set">
                        <h3>Résumé rapide</h3>
                        <p>{syntheseConstruction.slotsActifs} emplacement(s) complété(s) sur {definitionsSlots.length}</p>
                        <p>Prix total estimé : {new Intl.NumberFormat('fr-CA').format(syntheseConstruction.prixTotal)} kamas</p>
                        <p>Niveau minimal suggéré : {syntheseConstruction.niveauMinimal}</p>
                </div>
        </header>

        {#if message}
                <p class="message">{message}</p>
        {/if}

        <div class="grille-slots">
                {#each definitionsSlots as slot}
                        {@const selection = $setEnCours[slot.id]}
                        <article class:vide={!selection?.equipementNom}>
                                <header>
                                        <h4>{slot.libelle}</h4>
                                        <p>{slot.description}</p>
                                </header>
                                <label>
                                        <span>Équipement</span>
                                        <input
                                                type="text"
                                                list={`equipements-${slot.id}`}
                                                value={selection?.equipementNom ?? ''}
                                                on:change={(event) =>
                                                        mettreAJourEquipement(
                                                                slot.id,
                                                                (event.currentTarget as HTMLInputElement).value
                                                        )
                                                }
                                                placeholder="Nom exact de l’équipement"
                                        />
                                        <datalist id={`equipements-${slot.id}`}>
                                                {#each nomsEquipements as nom}
                                                        <option value={nom}></option>
                                                {/each}
                                        </datalist>
                                </label>
                                <label>
                                        <span>Prix (kamas)</span>
                                        <input
                                                type="number"
                                                min="0"
                                                step="100"
                                                value={selection?.prix ?? ''}
                                                on:change={(event) =>
                                                        mettreAJourPrix(
                                                                slot.id,
                                                                (event.currentTarget as HTMLInputElement).value
                                                        )
                                                }
                                                placeholder="À déterminer"
                                        />
                                </label>
                                <div class="actions-slot">
                                        <button type="button" on:click={() => retirerEquipementDuSlot(slot.id)}>
                                                Vider cet emplacement
                                        </button>
                                        {#if selection?.equipementNom}
                                                <a
                                                        class="lien-fiche"
                                                        href={`/equipements/${encodeURIComponent(selection.equipementNom)}`}
                                                >
                                                        Voir la fiche
                                                </a>
                                        {/if}
                                </div>
                        </article>
                {/each}
        </div>

        <footer class="actions-sauvegarde">
                <button type="button" class="primaire" on:click={sauvegarderConstruction}>
                        {$setActifId ? 'Mettre à jour ce set' : 'Enregistrer ce set'}
                </button>
                <button type="button" class="secondaire" on:click={enregistrerCommeNouveau}>
                        Enregistrer comme nouveau set
                </button>
        </footer>
</section>

<section class="liste-sets">
        <h3>Sets enregistrés</h3>
        {#if resumeSets.length === 0}
                <p>Aucun set n&rsquo;est enregistré pour le moment. Créez votre premier ensemble ci-dessus.</p>
        {:else}
                <ul>
                        {#each resumeSets as item}
                                <li>
                                        <div class="en-tete">
                                                <button type="button" on:click={() => selectionnerSet(item.set.id)}>
                                                        {item.set.nom}
                                                </button>
                                                <span class="date">{new Date(item.set.creeLe).toLocaleDateString('fr-CA')}</span>
                                        </div>
                                        <p class="notes">{item.set.description ?? 'Aucune note ajoutée.'}</p>
                                        <ul class="resume">
                                                <li>{item.synthese.slotsActifs} emplacement(s) complété(s)</li>
                                                <li>Prix total : {new Intl.NumberFormat('fr-CA').format(item.synthese.prixTotal)} kamas</li>
                                                <li>Niveau minimal : {item.synthese.niveauMinimal}</li>
                                                {#if item.synthese.prixManquants.length}
                                                        <li>Prix manquant pour : {item.synthese.prixManquants.map((slotId) =>
                                                                definitionsSlots.find((slot) => slot.id === slotId)?.libelle ?? slotId
                                                        ).join(', ')}</li>
                                                {/if}
                                        </ul>
                                        <div class="actions">
                                                <button type="button" on:click={() => selectionnerSet(item.set.id)}>
                                                        Charger dans l’éditeur
                                                </button>
                                                <button type="button" on:click={() => dupliquerEtEditer(item.set.id)}>
                                                        Dupliquer
                                                </button>
                                                <button
                                                        type="button"
                                                        class="danger"
                                                        on:click={() => supprimerEtReinitialiser(item.set.id)}
                                                >
                                                        Supprimer
                                                </button>
                                        </div>
                                </li>
                        {/each}
                </ul>
        {/if}
</section>

<style>
        .intro {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                gap: 1rem;
                margin-bottom: 1.5rem;
                align-items: center;
        }

        .actions-intro {
                display: flex;
                gap: 0.75rem;
        }

        button {
                border: none;
                border-radius: 0.75rem;
                padding: 0.6rem 1.1rem;
                font-weight: 600;
                cursor: pointer;
        }

        .primaire {
                background: linear-gradient(120deg, #38bdf8, #6366f1);
                color: #0f172a;
        }

        .secondaire {
                background: rgba(148, 163, 184, 0.2);
                color: #1f2937;
        }

        .danger {
                background: rgba(248, 113, 113, 0.2);
                color: #b91c1c;
        }

        .edition {
                background: white;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
                padding: 1.5rem;
                margin-bottom: 2rem;
                display: grid;
                gap: 1.5rem;
        }

        .entete-set {
                display: grid;
                gap: 1rem;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }

        .entete-set label {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                font-weight: 600;
        }

        input,
        textarea {
                padding: 0.65rem;
                border-radius: 0.5rem;
                border: 1px solid #cdd6f6;
        }

        textarea {
                resize: vertical;
        }

        .resume-set {
                background: #f0f4ff;
                border-radius: 0.75rem;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 0.35rem;
        }

        .message {
                margin: 0;
                padding: 0.75rem 1rem;
                border-radius: 0.65rem;
                background: rgba(56, 189, 248, 0.2);
                border: 1px solid rgba(56, 189, 248, 0.45);
                color: #0f172a;
                font-weight: 600;
        }

        .grille-slots {
                display: grid;
                gap: 1.25rem;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }

        article {
                background: #f8fafc;
                border-radius: 0.75rem;
                padding: 1rem;
                border: 1px solid transparent;
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
        }

        article.vide {
                border-color: rgba(148, 163, 184, 0.4);
        }

        article h4 {
                margin: 0;
        }

        article p {
                margin: 0;
                color: #4b5563;
                font-size: 0.9rem;
        }

        article label {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                font-weight: 600;
        }

        .actions-slot {
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 0.75rem;
        }

        .actions-slot button {
                background: rgba(148, 163, 184, 0.2);
                color: #1f2937;
                border-radius: 0.65rem;
                padding: 0.45rem 0.9rem;
        }

        .actions-slot .lien-fiche {
                color: #2563eb;
                text-decoration: none;
        }

        .actions-slot .lien-fiche:hover,
        .actions-slot .lien-fiche:focus-visible {
                text-decoration: underline;
        }

        .actions-sauvegarde {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
        }

        .liste-sets {
                background: white;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
                padding: 1.5rem;
        }

        .liste-sets ul {
                list-style: none;
                margin: 0;
                padding: 0;
                display: grid;
                gap: 1rem;
        }

        .liste-sets li {
                border: 1px solid rgba(148, 163, 184, 0.3);
                border-radius: 0.75rem;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
        }

        .liste-sets .en-tete {
                display: flex;
                justify-content: space-between;
                align-items: center;
        }

        .liste-sets .en-tete button {
                background: none;
                color: #1f2937;
                padding: 0;
                border-radius: 0;
        }

        .liste-sets .date {
                font-size: 0.85rem;
                color: #64748b;
        }

        .liste-sets .notes {
                margin: 0;
                color: #4b5563;
        }

        .liste-sets .resume {
                display: grid;
                gap: 0.35rem;
                padding-left: 1rem;
        }

        .liste-sets .actions {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
        }

        @media (max-width: 720px) {
                .actions-slot {
                        flex-direction: column;
                        align-items: flex-start;
                }

                .actions-sauvegarde {
                        flex-direction: column;
                        align-items: flex-start;
                }
        }
</style>
