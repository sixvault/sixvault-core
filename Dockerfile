FROM node:lts
RUN apt-get update && \
    apt-get install -y texlive texlive-latex-extra texlive-fonts-extra && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app

ARG DEBUG
ENV DEBUG=${DEBUG}
ARG PORT
ENV PORT=8080
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG JWT_ACCESS_SECRET
ENV JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
ARG JWT_ACCESS_SECRET_DEFAULT_EXPIRE
ENV JWT_ACCESS_SECRET_DEFAULT_EXPIRE=${JWT_ACCESS_SECRET_DEFAULT_EXPIRE}
ARG JWT_REFRESH_SECRET
ENV JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
ARG JWT_REFRESH_SECRET_DEFAULT_EXPIRE
ENV JWT_REFRESH_SECRET_DEFAULT_EXPIRE=${JWT_REFRESH_SECRET_DEFAULT_EXPIRE}
ARG R2_ACCOUNT_ID
ENV R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
ARG R2_ACCESS_KEY
ENV R2_ACCESS_KEY=${R2_ACCESS_KEY}
ARG R2_SECRET_KEY
ENV R2_SECRET_KEY=${R2_SECRET_KEY}
ARG R2_BUCKET
ENV R2_BUCKET=${R2_BUCKET}
ARG R2_PUBLIC_URL
ENV R2_PUBLIC_URL=${R2_PUBLIC_URL}

RUN npx prisma generate
EXPOSE 8080 5555
COPY run.sh /app/run.sh
ENTRYPOINT ["/app/run.sh"]