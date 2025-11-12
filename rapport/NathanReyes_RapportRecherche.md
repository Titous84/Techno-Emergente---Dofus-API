# Application Dofus – Rapport de recherche sur SvelteKit
## Cours : Technologie émergente (Automne 2025)
Étudiant : Nathan Reyes
Enseignant : Étienne Rivard
Date de remise : 29 novembre 2025

## Table des matières
1. Retour sur la technologie
2. Métier lié à la technologie
3. Retour sur l'élaboration du prototype
4. Recherche et documentation
5. Bibliographie

## 1. Retour sur la technologie
### 1.1 Introduction
Ce projet de session explore SvelteKit en tant que technologie émergente. Au démarrage, mes attentes portaient sur la capacité du framework à offrir une expérience de développement rapide pour un outil de comparaison d'équipements Dofus tout en restant accessible à un étudiant de niveau cégep.
Je souhaitais valider que SvelteKit permette de structurer une application simple avec navigation multipage, gestion d'état locale et intégration de données statiques sans configurer un serveur complexe.
### 1.2 Concepts clés et carte mentale
La carte mentale ci-dessous résume les principaux concepts étudiés autour de SvelteKit :
• Noyau SvelteKit : routage basé sur le système de fichiers, chargement de données, actions.
• Interface utilisateur : composants Svelte réactifs, gestion des formulaires, styles SCSS.
• Données locales : utilisation de fichiers JSON, stores persistants et synchronisation.
• Outils : Vite pour le développement, TypeScript pour la sécurité, tests via npm run check.
• Livraison : génération statique possible, déploiement léger sur un hébergement statique.
### 1.3 Avis et matrice de décision
Après expérimentation, SvelteKit se démarque par sa simplicité de prise en main, ses performances et l'unification entre frontend et logique de chargement.
La matrice de décision suivante compare SvelteKit à d'autres solutions étudiées :
• Critères : facilité d'apprentissage, performance, écosystème, support TypeScript, adaptation au prototypage.
• SvelteKit : 5/5 sur la facilité (documentation claire), 4/5 en performance (rendue côté serveur), 4/5 pour l'écosystème (communauté en croissance), 5/5 en TypeScript, 5/5 en prototypage.
• Next.js : 3/5 en facilité (concepts plus nombreux), 4/5 en performance, 5/5 pour l'écosystème, 4/5 en TypeScript, 4/5 pour le prototypage.
• Nuxt 3 : 4/5 en facilité (Vue familier), 4/5 en performance, 4/5 pour l'écosystème, 4/5 en TypeScript, 4/5 pour le prototypage.
Cette analyse confirme que SvelteKit répond efficacement aux besoins du projet, en particulier pour la réalisation rapide d'une preuve de concept.
## 2. Métier lié à la technologie
### 2.1 Poste ciblé : Développeur ou développeuse front-end Svelte
Compétences requises :
• Maîtrise de Svelte et SvelteKit, bonnes pratiques HTML/CSS/TypeScript.
• Connaissances UX/UI, intégration d'API REST et outils de build modernes.
• Capacité à documenter et à travailler en équipe agile.
Tâches principales :
• Concevoir des composants réactifs et optimiser les performances côté client.
• Mettre en place des parcours utilisateurs, gérer l'état et les tests d'interface.
• Collaborer avec les équipes backend et assurer la veille technologique.
Description : spécialiste du développement Web moderne, garantissant une expérience utilisateur fluide grâce à SvelteKit et à la performance du rendu hybride.
Salaire moyen au Québec : entre 68 000 $ et 82 000 $ par année selon Emploi Québec (profil 2024).
## 3. Retour sur l'élaboration du prototype
### 3.1 Exigences techniques
Le prototype respecte les exigences suivantes :
• Catalogue local d'équipements avec recherche, filtres de type, niveaux et effets.
• Gestion des prix personnalisés enregistrés dans le navigateur (localStorage).
• Création de panoplies avec emplacements prédéfinis (chapeau, anneaux, dofus, familier).
• Calcul automatique du coût total, du niveau minimal et des effets cumulés.
• Comparaison de deux panoplies et export CSV prévu dans les itérations futures.
### 3.2 Fiches de dépannage
Problème 1 : Filtrage qui échoue lorsque le nom d'un équipement est vide.
Causes possibles : données incomplètes dans le JSON d'équipements.
Solution : ignorer les entrées sans nom avant tout filtrage.
Problème 2 : Plantage sur toLowerCase lors de la recherche.
Causes possibles : valeurs nulles renvoyées par certains champs.
Solution : normaliser chaque texte avec une conversion en chaîne sécurisée.
Problème 3 : Incohérence entre emplacements et types d'équipements.
Causes possibles : absence de correspondance stricte entre les catégories.
Solution : définir une table des emplacements avec les types compatibles et filtrer la liste.
### 3.3 Prototype vs attentes
Le prototype répond aux objectifs : consultation détaillée d'un équipement, gestion de plusieurs panoplies personnalisées, comparaison et suivi du coût total selon les prix saisis.
Les interactions sont réalisées entièrement côté client, démontrant la pertinence de SvelteKit pour une application locale et réactive.
### 3.4 Avis sur la solution
SvelteKit offre une longévité prometteuse grâce à une communauté active et à une intégration étroite avec Vite. Les composants sont stables, performants et maintenables grâce à TypeScript et aux stores centralisés.
Les pratiques adoptées (normalisation des données, séparation des services et stores) assurent une base solide pour faire évoluer le projet.
## 4. Recherche et documentation
### 4.1 Veille hebdomadaire
Semaine du 9 septembre : lecture du guide officiel de démarrage SvelteKit et tutoriels Vite.
Semaine du 16 septembre : analyse de la structure des routes et des layouts dynamiques.
Semaine du 23 septembre : veille sur les stores Svelte et la persistance localStorage.
Semaine du 30 septembre : lecture sur l'accessibilité des composants et les formulaires.
Semaine du 7 octobre : expérimentation des chargements de données et endpoints.
Semaine du 14 octobre : comparaison entre SvelteKit, Next.js et Nuxt dans des études de cas.
Semaine du 21 octobre : recherche sur les meilleures pratiques de typage TypeScript.
Semaine du 28 octobre : veille UI sur les catalogues d'objets et affichage d'icônes.
Semaine du 4 novembre : tests des méthodes de comparaison de panoplies et calculs d'effets.
Semaine du 11 novembre : recherche sur les options d'export CSV et PDF en SvelteKit.
Semaine du 18 novembre : veille sur la performance et la gestion des images locales.
Semaine du 25 novembre : préparation de la présentation finale et revue des fonctionnalités.
## 5. Bibliographie
Svelte Society. "SvelteKit Documentation", consulté entre septembre et novembre 2025.
Vite. "Guide officiel", consulté en septembre 2025.
Emploi Québec. "Développeur Web – statistiques salariales 2024", consulté le 20 octobre 2025.
