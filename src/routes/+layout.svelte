<script lang="ts">
        import favicon from '$lib/assets/favicon.svg';

        let { children } = $props();
</script>

<svelte:head>
        <link rel="icon" href={favicon} />
</svelte:head>

<header class="entete">
        <h1>Gestionnaire de sets Dofus</h1>
        <nav>
                <a href="/equipements">Équipements</a>
                <a href="/sets">Mes sets</a>
                <a href="/comparateur">Comparateur</a>
        </nav>
</header>

<main class="contenu-principal">{@render children?.()}</main>

<style>
        .entete {
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                padding: 1rem 0;
        }

        .entete nav {
                display: flex;
                gap: 1rem;
        }

        .entete a {
                text-decoration: none;
                color: #2c3e50;
                font-weight: 600;
        }

        .entete a:hover {
                text-decoration: underline;
        }

        .contenu-principal {
                padding-bottom: 2rem;
        }
</style>
