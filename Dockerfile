# Imagen base para Node.js
FROM node:14

# Instalación de PostgreSQL cliente
RUN apt-get update && apt-get install -y postgresql-client

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivo de dependencias de Node.js
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Variables de entorno para la conexión a PostgreSQL
ENV PGHOST=db
ENV PGUSER=postgres
ENV PGDATABASE=ProyectoG6
ENV PGPASSWORD=contrasena
ENV PGPORT=5432

# Puerto expuesto por la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "server.js"]
