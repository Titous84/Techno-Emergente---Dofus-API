<script lang="ts">
	import equipements from '$lib/data/equipements.json';
</script>

<h1>Liste des équipements</h1>

<ul>
	{#each equipements as equipement}
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
