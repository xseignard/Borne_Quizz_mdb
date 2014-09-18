## Borne quizz pour le Musée de Bretagne

Une appli de quizz pour le Musée de Bretagne.

## Dev

Les outils de dev mis en place sont les suivants:

- [gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md#getting-started) pour builder le projet
- [npm](http://fr.openclassrooms.com/informatique/cours/des-applications-ultra-rapides-avec-node-js/les-modules-node-js-et-npm) qui permet de gérer les outils de dev que l'on utilise et qui sont basés sur node.js
- [editorconfig](http://editorconfig.org) un petit fichier qui permet de gérer les conventions telles que l'indentation, l'encodage, etc.

## Installer les outils de dev

- gulp et bower : `npm install gulp bower -g`
- editorconfig: installer [Package control](https://sublime.wbond.net/installation) pour Sublime Text, puis presser `ctrl+maj+p` ou `cmd+maj+p` et taper `install` puis `enter`, une liste de plugins Sublime Text apparait, taper `EditorConfig` puis `enter` pour l'installer.

## Installer les dépendances du projet

Pour installer les libs front end que le projet utilise, taper `bower install` dans un terminal, cela va télécharger les dépendances dans le dossier `bower_components`. Pour chercher d'autres dépendances, taper `bower search MOT_CLEF`. Une fois trouvée, taper `bower install MA_DEPENDANCE --save` pour télécharger la dépendance et la sauvegarder dans le fichier de définition des dépendances `bower.json`.

Pour installer les outils dont on a besoin pour builder le projet, il faut taper `npm install`, cela va télécharger les outils nécessaires au build. Pour rajouter un outil, utiliser la commande `npm install MA_DEPENDANCE --save-dev` pour télécharger cet outil et le sauvegarder dans la liste des dépendances de developpement (une dépendance de developpement est une dépendance qui sert juste pendant le dev, contrairement à une dépendance qui sert une fois le projet buildé).

## Lancer les builds

Il y a 2 builds:

- un build web de dev classique, qui se lance avec la commande `gulp`, il fait les choses suivantes
  - il lance un serveur qui servira les pages du projet
  - ouvre la page avec le navigateur par défaut
  - lance le service livereload
  - optimise les images
  - minifie le js/css/html
  - surveille les changements sur les fichiers sources et relance le build a chaque modif et rafraichi le navigateur avec ces modifs
  - le résultat du build se retrouve dans le dossier `dist`

- un build sous forme d'app avec node webkit, qui se lance avec la commande `gulp buildApp`
  - il crée les executables pour les plateformes suivantes: windows, mac et linux 64
  - ces executables se retrouvent dans le dossier `webkitbuilds`
  - il faut relancer `gulp buildApp` à chaque fois que l'on veut faire une nouvelle version de l'app.
