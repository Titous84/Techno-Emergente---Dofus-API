<!-- Page d'accueil : redirection immédiate vers /equipements -->
<script lang="ts">
        import { goto } from '$app/navigation';
        import { onMount } from 'svelte';

        // Dès que la page est prête côté client, on redirige l'utilisateur vers la liste d'équipements.
        onMount(() => {
                goto('/equipements');
        });
</script>

<h1>Redirection en cours…</h1>
<p>
        Si rien ne se passe, cliquez sur le lien suivant :
        <a href="/equipements">Voir la liste des équipements</a>.
</p>
