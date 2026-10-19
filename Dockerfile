# ---- build: static web export ----
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# EXPO_PUBLIC_* values are baked into the bundle at build time.
ARG EXPO_PUBLIC_SUPABASE_URL
ARG EXPO_PUBLIC_SUPABASE_ANON_KEY
ARG EXPO_PUBLIC_VAPID_PUBLIC_KEY
ARG EXPO_PUBLIC_SNOOZE_URL
ENV EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL \
    EXPO_PUBLIC_SUPABASE_ANON_KEY=$EXPO_PUBLIC_SUPABASE_ANON_KEY \
    EXPO_PUBLIC_VAPID_PUBLIC_KEY=$EXPO_PUBLIC_VAPID_PUBLIC_KEY \
    EXPO_PUBLIC_SNOOZE_URL=$EXPO_PUBLIC_SNOOZE_URL \
    CI=1
RUN npm run build:web

# ---- runtime: nginx serving dist/ ----
FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/healthz || exit 1
