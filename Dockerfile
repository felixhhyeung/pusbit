FROM node:22.1.0-alpine as base

# Add package file
COPY package.json ./
COPY yarn.lock ./
COPY scripts/dev.sh ./scripts/dev.sh

# Install deps
RUN yarn install

# Copy source
COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY openapi.yml ./openapi.yml
COPY .env .env

# Build dist
RUN yarn build

# Start production image build
FROM node:22.1.0-alpine

# Copy node modules and build directory
COPY --from=base ./node_modules ./node_modules
COPY --from=base /dist /dist

# Copy static files
COPY src/public dist/public

# Expose port 3000
EXPOSE 3000
CMD ["dist/server.js"]
