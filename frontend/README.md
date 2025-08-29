# En local

Pour lancer le frontend en local, vous pouvez utiliser la commande:

    npm start


# Container


## Build

Pour build le container docker, utilisez la commande:

    docker build -t score-mille-bornes .


## Lancer

Puis pour le lancer:

    docker run -d -p 3000:3000 score-mille-bornes
