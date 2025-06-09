#!/bin/sh

# Run migrations first
npx prisma migrate deploy

# Then start the app and studio concurrently
npx concurrently "npm run start" "npm run studio"
