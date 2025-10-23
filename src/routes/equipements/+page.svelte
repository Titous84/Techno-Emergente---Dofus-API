<script lang="ts">
        import { listerEquipements, rechercherEquipements } from '$lib/services/base-de-donnees';
        import { definitionsSlots, setEnCours } from '$lib/stores/panoplies';
        import type { DefinitionSlot, Equipement } from '$lib/types';

        const tousLesEquipements = listerEquipements();
        const typesDisponibles = ['Tous', ...new Set(tousLesEquipements.map((eq) => eq.Type).filter(Boolean))];

        let recherche = '';
        let typeSelectionne = 'Tous';

        $: resultatRecherche = rechercherEquipements(recherche);
        $: equipementsFiltres = resultatRecherche.filter((equipement) =>
                typeSelectionne === 'Tous' || equipement.Type === typeSelectionne
        );

        $: placementDansSet = (() => {
                const resultat = new Map<string, { slot: DefinitionSlot; prix: number | null }>();
                for (const definition of definitionsSlots) {
                        const selection = $setEnCours[definition.id];
                        if (selection?.equipementNom) {
                                resultat.set(selection.equipementNom, {
                                        slot: definition,
                                        prix: typeof selection.prix === 'number' ? selection.prix : null
                                });
                        }
                }
                return resultat;
        })();

        function formaterNombre(valeur: number | null | undefined): string {
                if (valeur === null || valeur === undefined) {
                        return '—';
                }
                return new Intl.NumberFormat('fr-CA', { maximumFractionDigits: 0 }).format(valeur);
        }

        function nombreEffets(equipement: Equipement): number {
                return equipement.effets ? Object.keys(equipement.effets).length : 0;
        }
</script>

<header class="entete-page">
        <div>
                <h2>Explorer les équipements</h2>
                <p>
                        Recherchez un objet pour consulter sa fiche complète, saisir son prix et l&rsquo;ajouter à votre set
                        en construction.
                </p>
        </div>
        <a class="lien-action" href="/panoplies">Construire mes sets</a>
</header>

<section class="outils-recherche">
        <label>
                <span>Recherche</span>
                <input
                        type="search"
                        placeholder="Ex. Coiffe du Comte Harebourg"
                        bind:value={recherche}
                        aria-label="Rechercher un équipement"
                />
        </label>

        <label>
                <span>Type</span>
                <select bind:value={typeSelectionne}>
                        {#each typesDisponibles as type}
                                <option value={type}>{type}</option>
                        {/each}
                </select>
        </label>

        <p class="resume">{equipementsFiltres.length} résultat(s)</p>
</section>

<section class="grille-equipements">
        {#each equipementsFiltres as equipement}
                <article class="carte-equipement">
                        <header>
                                {#if equipement.illustration_url}
                                        <img src={equipement.illustration_url} alt={'Illustration de ' + equipement.nom} />
                                {/if}
                                <div>
                                        <h3>{equipement.nom}</h3>
                                        <p class="meta">Niveau {equipement.niveau ?? '—'} · {equipement.Type ?? 'Type inconnu'}</p>
                                </div>
                        </header>

                        <dl class="details">
                                <div>
                                        <dt>Effets recensés</dt>
                                        <dd>{nombreEffets(equipement)}</dd>
                                </div>
                                <div>
                                        <dt>Emplacement suivi</dt>
                                        <dd>
                                                {#if placementDansSet.has(equipement.nom)}
                                                        {placementDansSet.get(equipement.nom)?.slot.libelle}
                                                {:else}
                                                        Non placé
                                                {/if}
                                        </dd>
                                </div>
                                <div>
                                        <dt>Prix saisi</dt>
                                        <dd>
                                                {#if placementDansSet.has(equipement.nom) &&
                                                typeof placementDansSet.get(equipement.nom)?.prix === 'number'}
                                                        {formaterNombre(placementDansSet.get(equipement.nom)?.prix ?? null)} kamas
                                                {:else}
                                                        À préciser
                                                {/if}
                                        </dd>
                                </div>
                        </dl>

                        <a class="bouton" href={`/equipements/${encodeURIComponent(equipement.nom)}`}>
                                Ouvrir la fiche détaillée
                        </a>
                </article>
        {/each}
</section>

<style>
        .entete-page {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                margin-bottom: 1.5rem;
        }

        .lien-action {
                background: #1f3c88;
                color: white;
                padding: 0.75rem 1.25rem;
                border-radius: 0.75rem;
                text-decoration: none;
                font-weight: 600;
                transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .lien-action:hover,
        .lien-action:focus-visible {
                transform: translateY(-2px);
                box-shadow: 0 8px 16px rgba(31, 60, 136, 0.2);
                outline: none;
        }

        .outils-recherche {
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

        .resume {
                margin: auto 0 0 auto;
                font-weight: 600;
                color: #1f3c88;
        }

        .grille-equipements {
                display: grid;
                gap: 1.5rem;
                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        }

        .carte-equipement {
                background: white;
                padding: 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
                display: flex;
                flex-direction: column;
                gap: 1rem;
        }

        .carte-equipement header {
                display: flex;
                gap: 1rem;
                align-items: center;
        }

        .carte-equipement img {
                height: 56px;
                width: 56px;
        }

        .meta {
                margin: 0;
                color: #4b5563;
                font-size: 0.95rem;
        }

        .details {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 0.75rem;
        }

        dt {
                font-size: 0.75rem;
                text-transform: uppercase;
                color: #6b7280;
                margin-bottom: 0.25rem;
        }

        dd {
                margin: 0;
                font-weight: 600;
        }

        .bouton {
                align-self: flex-start;
                background: #4e7ac7;
                color: white;
                text-decoration: none;
                padding: 0.6rem 1rem;
                border-radius: 0.65rem;
                transition: background 0.2s ease, transform 0.2s ease;
        }

        .bouton:hover,
        .bouton:focus-visible {
                background: #1f3c88;
                transform: translateY(-2px);
                outline: none;
        }

        @media (max-width: 700px) {
                .details {
                        grid-template-columns: 1fr;
                }
        }
</style>
