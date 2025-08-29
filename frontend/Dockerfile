# Image de base
FROM node:18-alpine

# Equivalent du cd pour modifier le répertoire de travail
WORKDIR /app

# Copie du package.json et package-lock.json pour optimiser le cache docker
COPY package*.json ./

# Commande
RUN npm install

# Copie du code source dans /app
COPY . .

# Depuis quel port on peut se connecter au container
EXPOSE 3000

# Répertoire partagé avec le host
VOLUME /app/logs

# Commande à lancer lors du démarrage
CMD ["npm", "start"]


# On fais le COPY du code apres le npm install pour optimiser le cache docker 
# et ne pas faire de npm install a chaque build