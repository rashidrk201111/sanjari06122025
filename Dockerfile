# Frontend build stage
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Backend install stage
FROM python:3.11-slim AS backend-builder
ARG DJANGO_SECRET_KEY=change-me
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
ENV NODE_ENV=production
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt
COPY backend /app
RUN python manage.py collectstatic --noinput
RUN python manage.py check

# Final runtime image
FROM python:3.11-slim
ARG DJANGO_SECRET_KEY=change-me
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SECRET_KEY=${DJANGO_SECRET_KEY}
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get install -y nginx && rm -f /etc/nginx/sites-enabled/default && ln -sf /dev/stdout /var/log/nginx/access.log && ln -sf /dev/stderr /var/log/nginx/error.log && rm -rf /var/lib/apt/lists/*
COPY --from=frontend-builder /frontend/build /usr/share/nginx/html
COPY --from=backend-builder /usr/local /usr/local
COPY --from=backend-builder /app /app
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py sync_frontend_catalog && (gunicorn project.wsgi:application --bind 127.0.0.1:8000 --workers 3 --log-level info &) && sleep 2 && exec nginx -g 'daemon off;'" ]
