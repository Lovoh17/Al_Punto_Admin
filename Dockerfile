# 1. Imagen base con Node.js para construir la app
FROM node:18 AS build

# 2. Crear directorio de trabajo
WORKDIR /app

# 3. Copiar dependencias y instalarlas
COPY package*.json ./
RUN npm install

# 4. Copiar el resto del código y construir la app
COPY . .
RUN npm run build

# 5. Usar una imagen ligera de Nginx para servir los archivos estáticos
FROM nginx:alpine

# 6. Copiar el build generado a la carpeta de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# 7. Exponer el puerto 80
EXPOSE 80

# 8. Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
