FROM node:alpine
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate
RUN npx prisma migrate deploy
EXPOSE 3000 5555
CMD ["npx", "concurrently", "npm run start", "npm run studio"]