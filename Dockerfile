FROM node:alpine
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npx prisma generate
EXPOSE 3000 5555
CMD ["npx", "concurrently", "npm run start", "npm run studio"]