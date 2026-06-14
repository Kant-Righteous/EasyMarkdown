# EasyMarkdown 1.1.0

<p align="center">
  <a href="README.md">中文</a> ·
  <a href="README.en.md">English</a> ·
  <strong>Français</strong>
</p>

![Aperçu d'EasyMarkdown](demo.fr.png)

## Présentation

EasyMarkdown est un éditeur Markdown local et léger pour ordinateur, avec édition, aperçu en direct, enregistrement de fichiers locaux et export PDF.

## Fonctions principales

- Créer, ouvrir, enregistrer et enregistrer sous des fichiers Markdown ou texte
- Modes édition, aperçu et écran partagé
- Barre de mise en forme Markdown et raccourcis clavier courants
- Liste des fichiers récents
- Rendu MDX léger
- Export PDF
- Interfaces en chinois, anglais et français
- Ouverture des liens de l'aperçu dans le navigateur système par défaut

Le MDX léger prend en charge les composants intégrés `Icon`,
`CardGroup` / `Card`, les sections `Tabs` / `Tab` entièrement développées,
ainsi qu'un ensemble limité de HTML sûr. Il ne s'agit pas d'un environnement
MDX complet et il n'exécute ni importations de composants, ni JSX arbitraire,
ni expressions JavaScript.

## Technologies

Tauri 2, Rust, TypeScript, Vite et Markdown-it.

## Développement local

```powershell
npm install
npm run dev
npm run tauri dev
```

Compilation du frontend :

```powershell
npm run build
```

## Création du paquet Windows

```powershell
npm run tauri build
```

La compilation Windows produit un installateur NSIS `.exe`, disponible en chinois simplifié, français et anglais.

## Licence

MIT
