<script lang="ts">
        import equipements from '$lib/data/equipements.json';
        import { prixEquipements } from '$lib/stores/prix';
        import { panopliesUtilisateur } from '$lib/stores/panoplies';
        import { calculerResumePanoplie, trouverEquipement } from '$lib/services/analyse-panoplies';
        import type { Equipement, PanopliePersonnalisee, ResumePanoplie } from '$lib/types';

        // Champs contrôlés par les formulaires de la page.
        let nomNouvellePanoplie = '';
        let rechercheEquipement = '';
        let panoplieSelectionneeId = '';
        let equipementSelectionne = '';
        let panoplies: PanopliePersonnalisee[] = [];
        let registrePrix = {} as Record<string, number>;
        let panoplieSelectionnee: PanopliePersonnalisee | null = null;
        let resumePanoplie: ResumePanoplie | null = null;
        let equipementsFiltres: Equipement[] = [];

        function libelleType(brut: string | undefined) {
                const valeur = brut?.trim();
                return valeur && valeur.length > 0 ? valeur : 'Type inconnu';
        }

        // Synchronisation automatique avec les stores Svelte.
        $: panoplies = $panopliesUtilisateur as PanopliePersonnalisee[];
        $: registrePrix = $prixEquipements;
        $: panoplieSelectionnee = panoplies.find((p) => p.id === panoplieSelectionneeId) ?? null;
        $: resumePanoplie = panoplieSelectionnee
                ? calculerResumePanoplie(panoplieSelectionnee, registrePrix)
                : null;

        function normaliserTexte(texte: string | undefined) {
                return texte?.toLowerCase() ?? '';
        }

        $: equipementsFiltres = equipements
                .filter((equipement) =>
                        normaliserTexte(equipement.nom).includes(normaliserTexte(rechercheEquipement.trim()))
                )
                .slice(0, 30);

        // Crée une panoplie vide puis la sélectionne.
        function creerPanoplie() {
                const id = panopliesUtilisateur.ajouterPanoplie(nomNouvellePanoplie);
                panoplieSelectionneeId = id;
                nomNouvellePanoplie = '';
        }

        // Demande confirmation avant de supprimer une panoplie.
        function supprimerPanoplie(id: string) {
                if (confirm('Supprimer cette panoplie ?')) {
                        panopliesUtilisateur.supprimerPanoplie(id);
                        if (panoplieSelectionneeId === id) {
                                panoplieSelectionneeId = '';
                        }
                }
        }

        // Duplique la panoplie existante et sélectionne la copie.
        function dupliquerPanoplie(id: string) {
                const nouveauId = panopliesUtilisateur.dupliquerPanoplie(id);
                if (nouveauId) {
                        panoplieSelectionneeId = nouveauId;
                }
        }

        // Ajoute un équipement choisi dans la liste déroulante.
        function ajouterEquipement(nom: string) {
                if (!panoplieSelectionneeId) {
                        alert('Veuillez sélectionner une panoplie dans la liste.');
                        return;
                }
                panopliesUtilisateur.ajouterEquipement(panoplieSelectionneeId, nom);
                equipementSelectionne = '';
        }

        // Retire un équipement de la panoplie courante.
        function retirerEquipement(nom: string) {
                if (!panoplieSelectionneeId) return;
                panopliesUtilisateur.retirerEquipement(panoplieSelectionneeId, nom);
        }

        // Met à jour le nom de la panoplie en direct.
        function renommerPanoplie(event: Event) {
                if (!panoplieSelectionneeId) return;
                const cible = event.currentTarget as HTMLInputElement;
                panopliesUtilisateur.renommerPanoplie(panoplieSelectionneeId, cible.value);
        }

        // Enregistre une description libre de l'objectif de la panoplie.
        function definirDescription(event: Event) {
                if (!panoplieSelectionneeId) return;
                const cible = event.currentTarget as HTMLTextAreaElement;
                panopliesUtilisateur.definirDescription(panoplieSelectionneeId, cible.value);
        }

        // Texte court pour afficher les statistiques clés dans la liste.
        function resumeCourt(panoplie: PanopliePersonnalisee) {
                const resume = calculerResumePanoplie(panoplie, registrePrix);
                return `${resume.nombreEquipements} objet(s) · ${resume.coutTotal.toLocaleString()} kamas · niv. min ${resume.niveauMinimum}`;
        }
</script>

<section class="gestion">
        <div class="liste-panoplies">
                <h2>Mes panoplies</h2>
                <form class="creation" on:submit|preventDefault={creerPanoplie}>
                        <label>
                                Nom de la nouvelle panoplie
                                <input type="text" bind:value={nomNouvellePanoplie} placeholder="Ex. : Panoplie PvM Terre" />
                        </label>
                        <button type="submit">Créer</button>
                </form>

                <ul>
                        {#if panoplies.length === 0}
                                <li class="vide">Aucune panoplie enregistrée pour le moment.</li>
                        {/if}
                        {#each panoplies as panoplie}
                                <li class:active={panoplie.id === panoplieSelectionneeId}>
                                        <button type="button" on:click={() => (panoplieSelectionneeId = panoplie.id)}>
                                                <strong>{panoplie.nom}</strong>
                                                <span>{resumeCourt(panoplie)}</span>
                                        </button>
                                        <div class="actions">
                                                <button type="button" on:click={() => dupliquerPanoplie(panoplie.id)}>
                                                        Dupliquer
                                                </button>
                                                <button type="button" on:click={() => supprimerPanoplie(panoplie.id)}>
                                                        Supprimer
                                                </button>
                                        </div>
                                </li>
                        {/each}
                </ul>
        </div>

        <div class="details">
                {#if !panoplieSelectionnee}
                        <p>Sélectionnez ou créez une panoplie pour afficher les détails.</p>
                {:else}
                        <h2>Détails de {panoplieSelectionnee.nom}</h2>
                        <div class="meta">
                                <label>
                                        Nom
                                        <input type="text" value={panoplieSelectionnee.nom} on:input={renommerPanoplie} />
                                </label>
                                <label>
                                        Description
                                        <textarea
                                                rows="3"
                                                placeholder="Objectifs, rôle en combat, sources d'inspiration..."
                                                value={panoplieSelectionnee.description ?? ''}
                                                on:input={definirDescription}
                                        ></textarea>
                                </label>
                        </div>

                        <section class="ajout">
                                <h3>Ajouter un équipement</h3>
                                <div class="controle">
                                        <input
                                                type="search"
                                                placeholder="Rechercher un équipement"
                                                bind:value={rechercheEquipement}
                                        />
                                        <select bind:value={equipementSelectionne}>
                                                <option value="">Sélectionner</option>
                                                {#each equipementsFiltres as equipement}
                                                        <option value={equipement.nom}>{equipement.nom} (niv. {equipement.niveau})</option>
                                                {/each}
                                        </select>
                                        <button
                                                type="button"
                                                on:click={() => equipementSelectionne && ajouterEquipement(equipementSelectionne)}
                                                disabled={!equipementSelectionne}
                                        >
                                                Ajouter
                                        </button>
                                </div>
                        </section>

                        <section>
                                <h3>Équipements sélectionnés</h3>
                                {#if panoplieSelectionnee.equipements.length === 0}
                                        <p>Aucun équipement dans cette panoplie pour l'instant.</p>
                                {:else}
                                        <ul class="equipements">
                                                {#each panoplieSelectionnee.equipements as nom}
                                                        {@const equipement = trouverEquipement(nom) as Equipement}
                                                        <li>
                                                                <div>
                                                                        <strong>{nom}</strong>
                                                                        {#if equipement}
                                        <span>Niveau {equipement.niveau} · {libelleType(equipement?.Type)}</span>
                                                                        {/if}
                                                                </div>
                                                                <div class="boutons">
                                                                        <a href={`/equipements/${encodeURIComponent(nom)}`}>Voir la fiche</a>
                                                                        <button type="button" on:click={() => retirerEquipement(nom)}>
                                                                                Retirer
                                                                        </button>
                                                                </div>
                                                        </li>
                                                {/each}
                                        </ul>
                                {/if}
                        </section>

                        {#if resumePanoplie}
                                <section class="resume">
                                        <h3>Résumé automatique</h3>
                                        <ul>
                                                <li>
                                                        <strong>Nombre d'équipements :</strong> {resumePanoplie.nombreEquipements}
                                                </li>
                                                <li>
                                                        <strong>Coût total :</strong> {resumePanoplie.coutTotal.toLocaleString()} kamas
                                                </li>
                                                <li>
                                                        <strong>Niveau minimum requis :</strong> {resumePanoplie.niveauMinimum}
                                                </li>
                                        </ul>
                                        <details>
                                                <summary>Effets cumulés</summary>
                                                <table>
                                                        <thead>
                                                                <tr>
                                                                        <th>Effet</th>
                                                                        <th>Valeur minimale</th>
                                                                        <th>Valeur maximale</th>
                                                                </tr>
                                                        </thead>
                                                        <tbody>
                                                                {#each Object.entries(resumePanoplie.effets) as [effet, intervalle]}
                                                                        <tr>
                                                                                <td>{effet}</td>
                                                                                <td>{intervalle.min}</td>
                                                                                <td>{intervalle.max}</td>
                                                                        </tr>
                                                                {/each}
                                                        </tbody>
                                                </table>
                                        </details>
                                </section>
                        {/if}
                {/if}
        </div>
</section>

<style>
        .gestion {
                display: grid;
                grid-template-columns: minmax(280px, 360px) 1fr;
                gap: 2rem;
        }

        .liste-panoplies,
        .details {
                background: white;
                padding: 1.5rem;
                border-radius: 1rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                display: grid;
                gap: 1rem;
        }

        .creation {
                display: grid;
                gap: 0.75rem;
        }

        .creation input {
                padding: 0.5rem 0.75rem;
                border-radius: 0.5rem;
                border: 1px solid #d0d6e1;
        }

        .creation button {
                background: #2a4a7b;
                color: white;
                border: none;
                border-radius: 999px;
                padding: 0.5rem 1.25rem;
                cursor: pointer;
        }

        .liste-panoplies ul {
                list-style: none;
                padding: 0;
                margin: 0;
                display: grid;
                gap: 0.75rem;
        }

        .liste-panoplies li {
                background: #f7f9fc;
                border-radius: 0.75rem;
                padding: 0.75rem;
                display: grid;
                gap: 0.5rem;
        }

        .liste-panoplies li.active {
                border: 2px solid #2a4a7b;
        }

        .liste-panoplies button {
                background: none;
                border: none;
                text-align: left;
                cursor: pointer;
        }

        .liste-panoplies .actions {
                display: flex;
                gap: 0.5rem;
        }

        .liste-panoplies .actions button {
                background: #e4eaf5;
                border: none;
                border-radius: 0.5rem;
                padding: 0.35rem 0.75rem;
                cursor: pointer;
        }

        .liste-panoplies .vide {
                text-align: center;
                color: #666;
        }

        .details .meta {
                display: grid;
                gap: 0.75rem;
        }

        .details input,
        .details textarea,
        .controle input,
        .controle select {
                width: 100%;
                padding: 0.5rem 0.75rem;
                border-radius: 0.5rem;
                border: 1px solid #d0d6e1;
        }

        .controle {
                display: flex;
                gap: 0.75rem;
                flex-wrap: wrap;
        }

        .controle button {
                background: #2a4a7b;
                color: white;
                border: none;
                border-radius: 0.5rem;
                padding: 0.5rem 1rem;
                cursor: pointer;
        }

        .controle button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
        }

        .equipements {
                list-style: none;
                padding: 0;
                margin: 0;
                display: grid;
                gap: 0.75rem;
        }

        .equipements li {
                background: #f7f9fc;
                border-radius: 0.75rem;
                padding: 0.75rem;
                display: flex;
                justify-content: space-between;
                gap: 1rem;
                align-items: center;
        }

        .equipements .boutons {
                display: flex;
                gap: 0.5rem;
        }

        .equipements a {
                color: #2a4a7b;
                text-decoration: none;
        }

        .equipements button {
                background: #d9534f;
                color: white;
                border: none;
                border-radius: 0.5rem;
                padding: 0.35rem 0.75rem;
                cursor: pointer;
        }

        .resume ul {
                list-style: none;
                margin: 0;
                padding: 0;
                display: grid;
                gap: 0.5rem;
        }

        table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 0.75rem;
        }

        th,
        td {
                border: 1px solid #d0d6e1;
                padding: 0.5rem;
                text-align: left;
        }

        @media (max-width: 960px) {
                .gestion {
                        grid-template-columns: 1fr;
                }
        }
</style>
