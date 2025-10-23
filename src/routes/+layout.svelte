<script lang="ts">
        import favicon from '$lib/assets/favicon.svg';

        let { children } = $props();

        const navigation = [
                { libelle: 'Accueil', url: '/' },
                { libelle: 'Équipements', url: '/equipements' },
                { libelle: 'Sets', url: '/panoplies' },
                { libelle: 'Comparaison', url: '/comparaison' }
        ];
</script>

<svelte:head>
        <link rel="icon" href={favicon} />
</svelte:head>

<div class="app-shell">
        <header class="barre-entete">
                <h1>Projet SvelteKit – Dofus</h1>
                <nav aria-label="Navigation principale">
                        <ul>
                                {#each navigation as entree}
                                        <li>
                                                <a href={entree.url}>{entree.libelle}</a>
                                        </li>
                                {/each}
                        </ul>
                </nav>
        </header>

        <main class="contenu-principal">{@render children?.()}</main>

        <footer class="pied-de-page">
                <small>
                        Prototype pédagogique réalisé dans le cadre du projet de session en Technologies émergentes –
                        Cégep de Victoriaville.
                </small>
        </footer>
</div>

<style>
        .app-shell {
                min-height: 100vh;
                display: grid;
                grid-template-rows: auto 1fr auto;
                background: #f5f7fb;
                color: #1a1a1a;
                font-family: 'Segoe UI', Roboto, sans-serif;
        }

        .barre-entete {
                background: linear-gradient(90deg, #1f3c88, #4e7ac7);
                color: white;
                padding: 1.5rem 2rem;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                gap: 1rem;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }

        .barre-entete h1 {
                margin: 0;
                font-size: 1.5rem;
                letter-spacing: 0.05em;
        }

        nav ul {
                list-style: none;
                display: flex;
                flex-wrap: wrap;
                gap: 1rem;
                margin: 0;
                padding: 0;
        }

        nav a {
                color: white;
                text-decoration: none;
                font-weight: 600;
                padding: 0.5rem 0.75rem;
                border-radius: 0.5rem;
                transition: background 0.2s ease;
        }

        nav a:hover,
        nav a:focus-visible {
                background: rgba(255, 255, 255, 0.2);
                outline: none;
        }

        .contenu-principal {
                padding: 2rem;
                max-width: 1100px;
                margin: 0 auto;
                width: 100%;
        }

        .pied-de-page {
                text-align: center;
                padding: 1rem;
                background: #eef1f8;
                color: #3a3a3a;
                font-size: 0.85rem;
        }

        @media (max-width: 600px) {
                .contenu-principal {
                        padding: 1.5rem 1rem;
                }
        }
</style>
