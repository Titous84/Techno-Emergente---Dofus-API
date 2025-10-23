<script lang="ts">
        import { page } from '$app/stores';
        import { afterNavigate } from '$app/navigation';
        import { get } from 'svelte/store';
        import { getEquipementParNom, getPanopliesParEquipement, trouverRessource } from '$lib/services/base-de-donnees';
        import {
                assignerEquipementAuSlot,
                definirPrixPourSlot,
                definitionsSlots,
                retirerEquipementDuSlot,
                setEnCours,
                trouverSelectionDansConstruction
        } from '$lib/stores/panoplies';
        import type { Equipement, Panoplie, SlotEquipement } from '$lib/types';

        let equipement: Equipement | undefined;
        let panopliesCompatibles: Panoplie[] = [];
        let slotSelectionne: SlotEquipement | '' = '';
        let prixSaisi = '';
        let message: string | null = null;

        function determinerSlotsProposes(typeBrut: string | undefined): SlotEquipement[] {
                const type = typeBrut?.toLowerCase() ?? '';
                if (!type) {
                        return [];
                }

                if (type.includes('coiffe') || type.includes('chapeau')) {
                        return ['coiffe'];
                }
                if (type.includes('cape')) {
                        return ['cape'];
                }
                if (type.includes('amulette') || type.includes('collier')) {
                        return ['collier'];
                }
                if (type.includes('anneau') || type.includes('alliance') || type.includes('bague')) {
                        return ['anneau1', 'anneau2'];
                }
                if (type.includes('ceinture')) {
                        return ['ceinture'];
                }
                if (type.includes('botte') || type.includes('sandale')) {
                        return ['bottes'];
                }
                if (type.includes('bouclier')) {
                        return ['bouclier'];
                }
                if (type.includes('familier') || type.includes('montilier') || type.includes('dragodinde')) {
                        return ['familier'];
                }
                if (type.includes('dofus') || type.includes('idole') || type.includes('troph')) {
                        return ['dofus1', 'dofus2', 'dofus3', 'dofus4', 'dofus5', 'dofus6'];
                }

                const motsArmes = [
                        'arc',
                        'bâton',
                        'baton',
                        'baguette',
                        'épée',
                        'epee',
                        'dague',
                        'marteau',
                        'hache',
                        'pelle',
                        'pioche',
                        'lance',
                        'faux',
                        'arme',
                        'flèche',
                        'fuseur',
                        'pistolet'
                ];
                if (motsArmes.some((mot) => type.includes(mot))) {
                        return ['arme'];
                }

                return [];
        }

        function proposerSlot(equipement: Equipement): SlotEquipement {
                const slotsPreferes = determinerSlotsProposes(equipement.Type);
                const enCours = get(setEnCours);

                if (slotsPreferes.length > 0) {
                        for (const slot of slotsPreferes) {
                                if (!enCours[slot]?.equipementNom) {
                                        return slot;
                                }
                        }
                        return slotsPreferes[0];
                }

                for (const definition of definitionsSlots) {
                        if (!enCours[definition.id]?.equipementNom) {
                                return definition.id;
                        }
                }

                return definitionsSlots[0]?.id ?? 'coiffe';
        }

        function chargerEquipement() {
                const equipementNom = decodeURIComponent($page.params.nom ?? '');
                equipement = getEquipementParNom(equipementNom);

                if (equipement) {
                        panopliesCompatibles = getPanopliesParEquipement(equipement.nom);
                        const selection = trouverSelectionDansConstruction(equipement.nom);
                        slotSelectionne = selection?.slot ?? proposerSlot(equipement);
                        prixSaisi = selection?.prix != null ? String(selection.prix) : '';
                } else {
                        panopliesCompatibles = [];
                        slotSelectionne = '';
                        prixSaisi = '';
                }

                message = null;
        }

        chargerEquipement();

        afterNavigate(() => {
                chargerEquipement();
        });

        $: selectionCourante = (() => {
                if (!equipement) {
                        return null;
                }
                const enCours = $setEnCours;
                for (const definition of definitionsSlots) {
                        const selection = enCours[definition.id];
                        if (selection?.equipementNom === equipement.nom) {
                                return selection;
                        }
                }
                return null;
        })();

        $: if (equipement && selectionCourante) {
                if (slotSelectionne !== selectionCourante.slot) {
                        slotSelectionne = selectionCourante.slot;
                }

                const prix = selectionCourante.prix;
                if (typeof prix === 'number' && prixSaisi !== String(prix)) {
                        prixSaisi = String(prix);
                }
                if (prix === null && prixSaisi !== '') {
                        prixSaisi = '';
                }
        }

        function libelleSlot(slot: SlotEquipement | ''): string {
                if (!slot) {
                        return 'Emplacement non défini';
                }
                return definitionsSlots.find((definition) => definition.id === slot)?.libelle ?? slot;
        }

        function enregistrerDansSet() {
                if (!equipement) {
                        return;
                }

                if (!slotSelectionne) {
                        message = 'Veuillez choisir un emplacement dans le set.';
                        return;
                }

                const prixNettoye = prixSaisi.replace(/\s/g, '');
                let prix: number | null = null;
                if (prixNettoye) {
                        const montant = Number(prixNettoye);
                        if (!Number.isFinite(montant) || montant < 0) {
                                message = 'Le prix doit être un nombre positif.';
                                return;
                        }
                        prix = Math.round(montant);
                }

                assignerEquipementAuSlot(slotSelectionne, equipement.nom);
                definirPrixPourSlot(slotSelectionne, prix);

                message = `« ${equipement.nom} » est suivi dans l’emplacement ${libelleSlot(slotSelectionne)}.`;
        }

        function retirerDuSet() {
                if (!equipement) {
                        return;
                }

                if (!selectionCourante) {
                        message = 'Cet équipement n’est pas présent dans votre set en cours.';
                        return;
                }

                retirerEquipementDuSlot(selectionCourante.slot);
                message = 'Équipement retiré du set en cours.';
                prixSaisi = '';
                slotSelectionne = proposerSlot(equipement);
        }

        function effetToImageUrl(effet: string): string {
                const mapping: Record<string, string> = {
                        Vitalité: 'pv',
                        Force: 'terre',
                        Intelligence: 'feu',
                        Chance: 'eau',
                        Agilité: 'air',
                        Sagesse: 'sagesse',
                        Tacle: 'tacle',
                        Fuite: 'fuite',
                        Portée: 'po',
                        PA: 'pa',
                        PM: 'pm',
                        Prospection: 'pp',
                        Puissance: 'puissance',
                        'Retrait PA': 'retraitPA',
                        'Retrait PM': 'retraitPM',
                        'Esquive PA': 'esquivePA',
                        'Esquive PM': 'esquivePM',
                        '% Critique': 'critique',
                        'Dommage(s)': 'dommages',
                        Initiative: 'initiative',
                        '% Résistance Neutre': 'resNeutre',
                        '% Résistance Terre': 'resTerre',
                        '% Résistance Feu': 'resFeu',
                        '% Résistance Eau': 'resEau',
                        '% Résistance Air': 'resAir',
                        'Résistance(s) Critiques': 'resCrit',
                        'Invocation(s)': 'invocation',
                        'Résistance(s) Poussée': 'resPoussee'
                };

                const filename = mapping[effet] || effet.toLowerCase().replace(/\s|\(|\)|%/g, '');
                return `https://dofusdb.fr/icons/effects/${filename}.png`;
        }
</script>

{#if equipement}
        <h1>{equipement.nom}</h1>

        {#if equipement.illustration_url}
                <img
                        src={equipement.illustration_url}
                        alt="Image de {equipement.nom}"
                        style="max-height: 100px"
                />
        {/if}

        <p><strong>Niveau :</strong> {equipement.niveau}</p>
        <p><strong>Type :</strong> {equipement.Type}</p>
        <p><strong>Description :</strong> {equipement.description}</p>

        <section class="gestion-utilisateur">
                <h2>Ajouter à mon set en cours</h2>
                <div class="formulaire">
                        <label>
                                <span>Emplacement</span>
                                <select bind:value={slotSelectionne}>
                                        <option value="">— Choisir un emplacement —</option>
                                        {#each definitionsSlots as slot}
                                                <option value={slot.id}>{slot.libelle}</option>
                                        {/each}
                                </select>
                        </label>

                        <label>
                                <span>Prix observé (kamas)</span>
                                <input type="number" min="0" step="100" bind:value={prixSaisi} />
                        </label>

                        <div class="resume">
                                <p>
                                        <strong>État actuel :</strong>
                                        {#if selectionCourante}
                                                Placé dans {libelleSlot(selectionCourante.slot)}
                                                {#if typeof selectionCourante.prix === 'number'}
                                                        –
                                                        {new Intl.NumberFormat('fr-CA').format(selectionCourante.prix)} kamas
                                                {:else}
                                                        – prix à confirmer
                                                {/if}
                                        {:else}
                                                Non placé dans le set en cours
                                        {/if}
                                </p>
                                <p class="note">
                                        Remplissez chaque emplacement sur la page « Construire mes sets » puis enregistrez
                                        l&rsquo;ensemble pour le comparer à d&rsquo;autres variantes.
                                </p>
                        </div>

                        {#if message}
                                <p class="message">{message}</p>
                        {/if}

                        <div class="actions">
                                <button type="button" class="primaire" on:click={enregistrerDansSet}>
                                        Ajouter ou mettre à jour
                                </button>
                                <button type="button" class="bouton-secondaire" on:click={retirerDuSet}>
                                        Retirer du set en cours
                                </button>
                        </div>
                </div>
        </section>

        {#if equipement.effets}
                <h2>Effets</h2>
                <ul>
                        {#each Object.entries(equipement.effets) as [effet, valeur]}
                                <li style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                                        <img
                                                src={effetToImageUrl(effet)}
                                                alt={effet}
                                                style="height: 24px;"
                                                on:error={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                                        />
                                        <span>
                                                {effet} :
                                                {#if Array.isArray(valeur)}
                                                        {valeur[0]} à {valeur[1]}
                                                {:else}
                                                        {valeur}
                                                {/if}
                                        </span>
                                </li>
                        {/each}
                </ul>
        {/if}

        {#if equipement.recette}
                <h2>Recette</h2>
                <ul>
                        {#each Object.entries(equipement.recette) as [nomIngredient, quantite]}
                                {@const ressource = trouverRessource(nomIngredient)}
                                <li style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                                        {#if ressource}
                                                <img src={ressource.illustration_url} alt={ressource.nom} style="height: 32px;" />
                                                <span>{quantite} × {ressource.nom}</span>
                                        {:else}
                                                <span>{quantite} × {nomIngredient}</span>
                                        {/if}
                                </li>
                        {/each}
                </ul>
        {/if}

        {#if panopliesCompatibles.length > 0}
                <h2>Panoplies compatibles</h2>
                <div class="liste-panoplies">
                        {#each panopliesCompatibles as panoplie}
                                <article>
                                        <header>
                                                <h3>{panoplie.nom}</h3>
                                                <p>Niveau recommandé : {panoplie.niveau ?? '—'}</p>
                                        </header>
                                        <ul>
                                                {#each panoplie.composition as nom}
                                                        <li>
                                                                {#if nom === equipement.nom}
                                                                        <strong>{nom}</strong>
                                                                {:else}
                                                                        <a href={`/equipements/${encodeURIComponent(nom)}`}>{nom}</a>
                                                                {/if}
                                                        </li>
                                                {/each}
                                        </ul>
                                </article>
                        {/each}
                </div>
        {/if}
{:else}
        <p>Équipement non trouvé.</p>
{/if}

<style>
        .gestion-utilisateur {
                margin: 2rem 0;
                background: white;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
                padding: 1.5rem;
        }

        .formulaire {
                display: grid;
                gap: 1rem;
        }

        label {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                font-weight: 600;
        }

        select,
        input {
                padding: 0.65rem;
                border-radius: 0.5rem;
                border: 1px solid #cdd6f6;
        }

        .resume {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
                background: #f0f4ff;
                padding: 1rem;
                border-radius: 0.75rem;
        }

        .note {
                margin: 0;
                font-size: 0.85rem;
                color: #4b5563;
        }

        .actions {
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem;
        }

        .primaire {
                background: linear-gradient(120deg, #38bdf8, #6366f1);
                color: #0f172a;
                border: none;
                border-radius: 0.65rem;
                padding: 0.6rem 1.1rem;
                font-weight: 600;
                cursor: pointer;
        }

        .bouton-secondaire {
                background: transparent;
                color: #d14343;
                border: 1px solid #d14343;
                border-radius: 0.65rem;
                padding: 0.5rem 1rem;
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

        .message {
                margin: 0;
                padding: 0.75rem 1rem;
                border-radius: 0.65rem;
                background: rgba(56, 189, 248, 0.2);
                border: 1px solid rgba(56, 189, 248, 0.45);
                color: #0f172a;
                font-weight: 600;
        }

        .liste-panoplies {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 1rem;
                margin-bottom: 2rem;
        }

        .liste-panoplies article {
                background: white;
                border-radius: 0.75rem;
                padding: 1rem;
                box-shadow: 0 4px 12px rgba(31, 60, 136, 0.1);
                border: 2px solid transparent;
        }

        .liste-panoplies header {
                margin-bottom: 0.75rem;
        }

        .liste-panoplies ul {
                list-style: none;
                padding: 0;
                margin: 0;
                display: grid;
                gap: 0.35rem;
        }

        .liste-panoplies a {
                text-decoration: none;
                color: #1f3c88;
        }

        .liste-panoplies a:hover,
        .liste-panoplies a:focus-visible {
                text-decoration: underline;
                outline: none;
        }

        @media (max-width: 600px) {
                .liste-panoplies {
                        grid-template-columns: 1fr;
                }
        }
</style>
