<h2>Prototype de recherche – Dofus et Technologies émergentes</h2>

<p>
        Cette application SvelteKit constitue la preuve de concept de mon projet de session au Cégep de
        Victoriaville. Elle illustre l&rsquo;utilisation d&rsquo;une technologie émergente (SvelteKit) pour bâtir une
        solution web légère connectée à des fichiers JSON locaux servant de base de données.
</p>

<section class="grille-introduction">
        <article>
                <h3>Identification des besoins</h3>
                <ul>
                        <li>Centraliser les informations d&rsquo;équipements et de sets personnalisés de Dofus.</li>
                        <li>Permettre le suivi des prix du marché pour chacune des pièces.</li>
                        <li>Comparer facilement deux constructions pour orienter le choix des joueurs.</li>
                </ul>
        </article>

        <article>
                <h3>Retour sur SvelteKit</h3>
                <p>
                        SvelteKit offre un rendu rapide, une structure modulaire simple et la possibilité de travailler
                        hors ligne avec des données locales. Il répond parfaitement aux critères d&rsquo;agilité et de
                        performance définis dans la matrice de décision.
                </p>
        </article>

        <article>
                <h3>Veille technologique</h3>
                <p>
                        Les choix techniques (SvelteKit, stockage local, typage TypeScript) résultent d&rsquo;une veille sur
                        les frameworks modernes, comparés à React et Vue pour le critère de légèreté et d&rsquo;apprentissage.
                </p>
        </article>

        <article>
                <h3>Structure du prototype</h3>
                <ul>
                        <li>Liste et fiche détaillée des équipements.</li>
                        <li>Construction de sets avec saisie des prix et suivi local.</li>
                        <li>Tableau de comparaison de deux sets personnalisés.</li>
                </ul>
        </article>
</section>

<section class="liens-principaux">
        <h3>Explorer la preuve de concept</h3>
        <div class="cartes-liens">
                <a class="carte" href="/equipements">
                        <h4>Équipements</h4>
                        <p>Recherche, fiche descriptive et ajout rapide au set en cours.</p>
                </a>
                <a class="carte" href="/panoplies">
                        <h4>Construction des sets</h4>
                        <p>Préparer chaque emplacement, conserver les prix et enregistrer des variantes.</p>
                </a>
                <a class="carte" href="/comparaison">
                        <h4>Comparaison</h4>
                        <p>Comparer deux sets personnalisés pour valider la stratégie retenue.</p>
                </a>
        </div>
</section>

<style>
        h2 {
                margin-bottom: 1rem;
        }

        .grille-introduction {
                display: grid;
                gap: 1.5rem;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                margin-bottom: 2.5rem;
        }

        .grille-introduction article {
                background: white;
                padding: 1.25rem;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
        }

        .grille-introduction h3 {
                margin-top: 0;
        }

        .liens-principaux {
                background: white;
                padding: 1.5rem;
                border-radius: 0.75rem;
                box-shadow: 0 6px 16px rgba(31, 60, 136, 0.08);
        }

        .cartes-liens {
                display: grid;
                gap: 1rem;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }

        .carte {
                display: block;
                border: 2px solid transparent;
                border-radius: 0.75rem;
                padding: 1.25rem;
                text-decoration: none;
                color: inherit;
                background: linear-gradient(135deg, #eef2ff, #ffffff);
                transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .carte:hover,
        .carte:focus-visible {
                transform: translateY(-4px);
                box-shadow: 0 10px 20px rgba(31, 60, 136, 0.15);
                outline: none;
        }

        .carte h4 {
                margin-top: 0;
                margin-bottom: 0.5rem;
        }

        @media (max-width: 600px) {
                .cartes-liens {
                        grid-template-columns: 1fr;
                }
        }
</style>
