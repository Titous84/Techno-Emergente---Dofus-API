<script lang="ts">
        import equipements from '$lib/data/equipements.json';
        import { prixEquipements } from '$lib/stores/prix';
        import type { Equipement } from '$lib/types';

        function libelleType(brut: string | undefined) {
                const valeur = brut?.trim();
                return valeur && valeur.length > 0 ? valeur : 'Type inconnu';
        }

        const equipementsAvecNom = equipements.filter(
                (equipement) => typeof equipement.nom === 'string' && equipement.nom.trim().length > 0
        );

        const typesDisponibles = [
                'Tous',
                ...new Set(equipementsAvecNom.map((equipement) => libelleType(equipement.Type)))
        ];

        let recherche = '';
        let typeSelectionne = 'Tous';

        function normaliserTexte(texte: unknown) {
                if (typeof texte !== 'string') {
                        return '';
                }
                return texte.toLowerCase();
        }

        $: equipementsFiltres = equipementsAvecNom.filter((equipement) => {
                const typeNormalise = libelleType(equipement.Type);
                const correspondAuType =
                        typeSelectionne === 'Tous' || typeNormalise === libelleType(typeSelectionne);
                const correspondRecherche = normaliserTexte(equipement.nom).includes(
                        normaliserTexte(recherche)
                );
                return correspondAuType && correspondRecherche;
        });

        /**
         * Renvoie un libellé lisible pour un intervalle d'effets.
         */
        function formaterValeur(valeur: number | [number, number]) {
                if (Array.isArray(valeur)) {
                        return `${valeur[0]} à ${valeur[1]}`;
                }
                return `${valeur}`;
        }

        function mettreAJourPrix(equipement: Equipement, event: Event) {
                const cible = event.currentTarget as HTMLInputElement;
                const valeur = Number(cible.value);
                prixEquipements.definirPrix(equipement.nom, valeur);
        }
</script>

<section class="outils">
        <label>
                Recherche par nom
                <input type="search" placeholder="Ex. : Cape du Sinistrofu" bind:value={recherche} />
        </label>
        <label>
                Filtrer par type
                <select bind:value={typeSelectionne}>
                        {#each typesDisponibles as type}
                                <option value={type}>{type}</option>
                        {/each}
                </select>
        </label>
        <button type="button" on:click={() => prixEquipements.reinitialiser()}>
                Réinitialiser les prix
        </button>
</section>

<section class="liste">
        <h2>{equipementsFiltres.length} équipement(s) trouvé(s)</h2>
        <ul>
                {#each equipementsFiltres as equipement}
                        <li>
                                <header>
                                        {#if equipement.illustration_url}
                                                <img src={equipement.illustration_url} alt={equipement.nom} />
                                        {/if}
                                        <div>
                                                <h3>
                                                        <a href={`/equipements/${encodeURIComponent(equipement.nom)}`}>
                                                                {equipement.nom}
                                                        </a>
                                                </h3>
                                                <p>Type : {libelleType(equipement.Type)} · Niveau {equipement.niveau}</p>
                                        </div>
                                </header>
                                {#if equipement.effets}
                                        {@const effets = equipement.effets as Record<string, number | [number, number]>}
                                        <details>
                                                <summary>Voir les effets principaux</summary>
                                                <ul class="effets">
                                                        {#each Object.entries(effets) as [effet, valeur]}
                                                                <li><strong>{effet} :</strong> {formaterValeur(valeur)}</li>
                                                        {/each}
                                                </ul>
                                        </details>
                                {/if}
                                <div class="prix">
                                        <label>
                                                Prix personnel (kamas)
                                                <input
                                                        type="number"
                                                        min="0"
                                                        step="1000"
                                                        value={$prixEquipements[equipement.nom] ?? ''}
                                                        on:input={(event) => mettreAJourPrix(equipement, event)}
                                                />
                                        </label>
                                        <p class="note">Le prix est enregistré localement dans votre navigateur.</p>
                                </div>
                        </li>
                {/each}
        </ul>
</section>

<style>
        section.outils {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                background: white;
                padding: 1.5rem;
                border-radius: 1rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
                margin-bottom: 1.5rem;
        }

        section.outils label {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                font-weight: 600;
        }

        section.outils input,
        section.outils select {
                padding: 0.5rem 0.75rem;
                border-radius: 0.5rem;
                border: 1px solid #d0d6e1;
        }

        section.outils button {
                background: #2a4a7b;
                color: white;
                border: none;
                border-radius: 999px;
                padding: 0.5rem 1.25rem;
                cursor: pointer;
        }

        section.liste ul {
                display: grid;
                gap: 1.5rem;
                list-style: none;
                padding: 0;
                margin: 0;
        }

        section.liste li {
                background: white;
                padding: 1.5rem;
                border-radius: 1rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        section.liste header {
                display: flex;
                gap: 1rem;
        }

        section.liste img {
                width: 64px;
                height: 64px;
                object-fit: contain;
                border-radius: 0.5rem;
        }

        section.liste h3 {
                margin: 0 0 0.25rem;
        }

        section.liste a {
                color: #2a4a7b;
                text-decoration: none;
        }

        details summary {
                cursor: pointer;
                font-weight: 600;
        }

        .effets {
                margin-top: 0.75rem;
                display: grid;
                gap: 0.35rem;
        }

        .prix {
                margin-top: 1rem;
                display: grid;
                gap: 0.35rem;
        }

        .prix input {
                max-width: 200px;
        }

        .note {
                font-size: 0.85rem;
                color: #555;
        }
</style>
