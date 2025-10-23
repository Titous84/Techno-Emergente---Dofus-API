<script lang="ts">
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import {
		getEquipementParNom,
		getPanoplieParEquipement,
		trouverRessource
	} from '$lib/services/base-de-donnees';

	let equipement: any = null;
	let panoplie: any = null;

	// Fonction qui charge les données en fonction du paramètre d'URL
	function chargerEquipement() {
		const equipementNom = decodeURIComponent($page.params.nom ?? '');
		equipement = getEquipementParNom(equipementNom);
		if (equipement) {
			panoplie = getPanoplieParEquipement(equipement.nom);
		} else {
			panoplie = null;
		}
	}

	// Chargement initial
	chargerEquipement();

	// Recharger quand l’URL change (navigation dans la même page dynamique)
	const unsubscribe = afterNavigate(() => {
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
