<script lang="ts">
        import { page } from '$app/stores';
        import { afterNavigate } from '$app/navigation';
        import {
                getEquipementParNom,
                getPanoplieParEquipement,
                trouverRessource
        } from '$lib/services/base-de-donnees';
        import {
                ajouterEquipementAuSet,
                creerSet,
                enregistrerPrixEquipement,
                prixEquipementsStore,
                setsStore
        } from '$lib/services/gestion-sets';

        let equipement: any = null;
        let panoplie: any = null;

        // Gestion du prix personnalisé et des actions sur les sets.
        let prixSaisi = 0;
        let messagePrix = '';
        let messageSet = '';
        let setSelectionne = '';
        let nouveauSetNom = '';

        // Fonction qui charge les données en fonction du paramètre d'URL
        function chargerEquipement() {
                const equipementNom = decodeURIComponent($page.params.nom ?? '');
                equipement = getEquipementParNom(equipementNom);
                if (equipement) {
                        panoplie = getPanoplieParEquipement(equipement.nom);
                        prixSaisi = $prixEquipementsStore[equipement.nom] ?? 0;
                } else {
                        panoplie = null;
                        prixSaisi = 0;
                }
        }

        // Chargement initial
        chargerEquipement();

        // Recharger quand l’URL change (navigation dans la même page dynamique)
        afterNavigate(() => {
                chargerEquipement();
        });

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

        function sauvegarderPrix() {
                if (!equipement) {
                        return;
                }
                enregistrerPrixEquipement(equipement.nom, Number(prixSaisi) || 0);
                messagePrix = '💾 Prix enregistré pour cet équipement.';
                messageSet = '';
        }

        function ajouterDansUnSet() {
                if (!equipement) {
                        return;
                }
                let idSetCible = setSelectionne;

                if (nouveauSetNom.trim().length > 0) {
                        const nouveau = creerSet(nouveauSetNom);
                        idSetCible = nouveau.id;
                        setSelectionne = nouveau.id;
                        nouveauSetNom = '';
                }

                if (!idSetCible) {
                        messageSet = 'Veuillez sélectionner un set existant ou renseigner un nom pour en créer un.';
                        return;
                }

                enregistrerPrixEquipement(equipement.nom, Number(prixSaisi) || 0);
                ajouterEquipementAuSet(idSetCible, equipement.nom, Number(prixSaisi) || 0);
                messageSet = '✅ Équipement ajouté au set sélectionné.';
        }

        $: setsAvecEquipement = equipement
                ? $setsStore.filter((set) => set.equipements.some((eq) => eq.nom === equipement.nom))
                : [];
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

        <section class="carte">
                <h2>Prix personnalisé</h2>
                <form on:submit|preventDefault={sauvegarderPrix} class="formulaire-prix">
                        <label>
                                Prix (kamas) :
                                <input type="number" bind:value={prixSaisi} min="0" step="1" />
                        </label>
                        <button type="submit">Enregistrer le prix</button>
                </form>
                {#if messagePrix}
                        <p class="message-succes">{messagePrix}</p>
                {/if}
        </section>

        <section class="carte">
                <h2>Ajouter au set</h2>
                <form on:submit|preventDefault={ajouterDansUnSet} class="formulaire-set">
                        <label>
                                Choisir un set existant :
                                <select bind:value={setSelectionne}>
                                        <option value="">-- Sélectionner --</option>
                                        {#each $setsStore as set}
                                                <option value={set.id}>{set.nom}</option>
                                        {/each}
                                </select>
                        </label>
                        <label>
                                Ou créer un nouveau set :
                                <input
                                        type="text"
                                        placeholder="Nom du nouveau set"
                                        bind:value={nouveauSetNom}
                                />
                        </label>
                        <button type="submit">Ajouter l'équipement au set</button>
                </form>
                {#if messageSet}
                        <p class="message-succes">{messageSet}</p>
                {/if}
                {#if setsAvecEquipement.length > 0}
                        <p>Présent dans :</p>
                        <ul>
                                {#each setsAvecEquipement as set}
                                        <li>{set.nom}</li>
                                {/each}
                        </ul>
                {/if}
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

	{#if panoplie}
		<h2>Panoplie : {panoplie.nom}</h2>
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
	{/if}
{:else}
	<p>Équipement non trouvé.</p>
{/if}

<style>
        .carte {
                border: 1px solid #dcdcdc;
                border-radius: 8px;
                padding: 1rem;
                margin: 1rem 0;
        }

        .formulaire-prix,
        .formulaire-set {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
        }

        .formulaire-prix input,
        .formulaire-set input,
        .formulaire-set select {
                padding: 0.4rem;
        }

        .formulaire-prix button,
        .formulaire-set button {
                align-self: flex-start;
                padding: 0.5rem 1rem;
        }

        .message-succes {
                margin-top: 0.5rem;
                color: #2e7d32;
        }
</style>
