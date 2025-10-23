<script lang="ts">
        import { browser } from '$app/environment';
        import { getEquipementParNom } from '$lib/services/base-de-donnees';
        import { setsStore } from '$lib/services/gestion-sets';

        interface EffetCumule {
                min: number;
                max: number;
        }

        interface ResumeSet {
                id: string;
                nom: string;
                coutTotal: number;
                niveauMinimum: number;
                effets: Record<string, EffetCumule>;
        }

        let selection: string[] = [];
        let messageExport = '';

        function basculerSelection(id: string) {
                if (selection.includes(id)) {
                        selection = selection.filter((item) => item !== id);
                } else {
                        selection = [...selection, id];
                }
        }

        function sommerEffets(resume: ResumeSet, nomEffet: string, valeur: number | number[]) {
                if (!resume.effets[nomEffet]) {
                        resume.effets[nomEffet] = { min: 0, max: 0 };
                }
                if (Array.isArray(valeur)) {
                        resume.effets[nomEffet].min += valeur[0];
                        resume.effets[nomEffet].max += valeur[1];
                } else {
                        resume.effets[nomEffet].min += valeur;
                        resume.effets[nomEffet].max += valeur;
                }
        }

        function calculerResume(setId: string): ResumeSet | null {
                const set = $setsStore.find((element) => element.id === setId);
                if (!set) {
                        return null;
                }

                const resume: ResumeSet = {
                        id: set.id,
                        nom: set.nom,
                        coutTotal: 0,
                        niveauMinimum: 0,
                        effets: {}
                };

                for (const equipement of set.equipements) {
                        resume.coutTotal += equipement.prix ?? 0;
                        const details = getEquipementParNom(equipement.nom);
                        if (!details) {
                                continue;
                        }
                        if (details.niveau && details.niveau > resume.niveauMinimum) {
                                resume.niveauMinimum = details.niveau;
                        }
                        if (details.effets) {
                                for (const [nomEffet, valeur] of Object.entries(details.effets)) {
                                        sommerEffets(resume, nomEffet, valeur as number | number[]);
                                }
                        }
                }

                return resume;
        }

        $: resumesSelectionnes = selection
                .map((id) => calculerResume(id))
                .filter((resume): resume is ResumeSet => resume !== null);

        function formaterKamas(valeur: number) {
                return `${valeur.toLocaleString('fr-FR')} kamas`;
        }

        function formaterEffets(effets: Record<string, EffetCumule>) {
                return Object.entries(effets)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([nom, plage]) =>
                                plage.min === plage.max
                                        ? `${nom} : ${plage.min}`
                                        : `${nom} : ${plage.min} à ${plage.max}`
                        );
        }

        function exporterCSV() {
                if (!browser) {
                        return;
                }
                if (resumesSelectionnes.length === 0) {
                        messageExport = 'Sélectionnez au moins un set avant d’exporter.';
                        return;
                }

                const lignes = ['Nom du set;Coût total;Niveau minimum;Effets cumulés'];
                for (const resume of resumesSelectionnes) {
                        const effetsTexte = formaterEffets(resume.effets).join(' | ').replace(/"/g, '""');
                        lignes.push(
                                `${resume.nom};${resume.coutTotal};${resume.niveauMinimum};"${effetsTexte}"`
                        );
                }

                const blob = new Blob([lignes.join('\n')], {
                        type: 'text/csv;charset=utf-8;'
                });
                const url = URL.createObjectURL(blob);
                const lien = document.createElement('a');
                lien.href = url;
                lien.download = 'comparaison-sets.csv';
                lien.click();
                URL.revokeObjectURL(url);
                messageExport = 'Export CSV généré.';
        }

        function exporterPDF() {
                if (!browser) {
                        return;
                }
                if (resumesSelectionnes.length === 0) {
                        messageExport = 'Sélectionnez au moins un set avant d’exporter.';
                        return;
                }

                const contenu = resumesSelectionnes
                        .map((resume) => {
                                const effetsLignes = formaterEffets(resume.effets)
                                        .map((ligne) => `<li>${ligne}</li>`) 
                                        .join('');
                                return `<section style="margin-bottom:16px;">
                                                <h2>${resume.nom}</h2>
                                                <p><strong>Coût total :</strong> ${formaterKamas(resume.coutTotal)}</p>
                                                <p><strong>Niveau minimum :</strong> ${resume.niveauMinimum}</p>
                                                <ul>${effetsLignes}</ul>
                                        </section>`;
                        })
                        .join('');

                const fenetre = window.open('', '', 'width=800,height=600');
                if (!fenetre) {
                        messageExport = 'Impossible d’ouvrir la fenêtre d’impression.';
                        return;
                }

                fenetre.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8" />
                        <title>Comparaison de sets</title>
                        <style>
                                body { font-family: Arial, sans-serif; padding: 24px; }
                                h1 { text-align: center; }
                                section { border-bottom: 1px solid #ccc; padding-bottom: 12px; }
                        </style>
                </head><body><h1>Comparaison de sets</h1>${contenu}<p>Astuce : choisissez "Enregistrer au format PDF" dans la fenêtre d’impression.</p></body></html>`);
                fenetre.document.close();
                fenetre.focus();
                fenetre.print();
                messageExport = 'Fenêtre d’impression ouverte : enregistrez en PDF pour conserver la comparaison.';
        }
</script>

<h1>Comparateur de sets</h1>
<p>Sélectionnez les sets à comparer pour visualiser les coûts, niveaux et effets cumulés.</p>

<section class="carte">
        <h2>Sets disponibles</h2>
        {#if $setsStore.length === 0}
                <p>Aucun set disponible. Créez un set depuis la page "Mes sets".</p>
        {:else}
                <ul class="liste-selection">
                        {#each $setsStore as set}
                                <li>
                                        <label>
                                                <input
                                                        type="checkbox"
                                                        checked={selection.includes(set.id)}
                                                        on:change={() => basculerSelection(set.id)}
                                                />
                                                {set.nom} ({set.equipements.length} équipements)
                                        </label>
                                </li>
                        {/each}
                </ul>
        {/if}
</section>

{#if resumesSelectionnes.length === 0}
        <p>Sélectionnez au moins un set pour lancer la comparaison.</p>
{:else}
        <section class="carte">
                <h2>Résultats de la comparaison</h2>
                <table>
                        <thead>
                                <tr>
                                        <th>Set</th>
                                        <th>Coût total</th>
                                        <th>Niveau minimum</th>
                                        <th>Effets cumulés</th>
                                </tr>
                        </thead>
                        <tbody>
                                {#each resumesSelectionnes as resume}
                                        <tr>
                                                <td>{resume.nom}</td>
                                                <td>{formaterKamas(resume.coutTotal)}</td>
                                                <td>{resume.niveauMinimum}</td>
                                                <td>
                                                        <ul>
                                                                {#each formaterEffets(resume.effets) as effet}
                                                                        <li>{effet}</li>
                                                                {/each}
                                                        </ul>
                                                </td>
                                        </tr>
                                {/each}
                        </tbody>
                </table>
        </section>

        <div class="actions-export">
                <button type="button" on:click={exporterCSV}>Exporter en CSV</button>
                <button type="button" on:click={exporterPDF}>Exporter en PDF</button>
        </div>
        {#if messageExport}
                <p class="message">{messageExport}</p>
        {/if}
{/if}

<style>
        .carte {
                border: 1px solid #dcdcdc;
                border-radius: 8px;
                padding: 1rem;
                margin: 1rem 0;
        }

        .liste-selection {
                list-style: none;
                padding-left: 0;
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
        }

        table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 1rem;
        }

        th,
        td {
                border: 1px solid #e0e0e0;
                padding: 0.5rem;
                text-align: left;
                vertical-align: top;
        }

        ul {
                margin: 0;
                padding-left: 1.2rem;
        }

        .actions-export {
                display: flex;
                gap: 1rem;
                margin: 1rem 0;
        }

        .message {
                color: #2e7d32;
        }
</style>
