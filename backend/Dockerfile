# Multi-stage build para backend Django
FROM python:3.12-slim as builder

WORKDIR /tmp

# Instalar dependências do sistema para build
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Build de wheels
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /tmp/wheels -r requirements.txt


# Stage de produção
FROM python:3.12-slim

WORKDIR /app

# Instalar dependências apenas de runtime
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar wheels do builder
COPY --from=builder /tmp/wheels /wheels
COPY --from=builder /tmp/requirements.txt .

# Instalar dependências
RUN pip install --no-cache /wheels/*

# Copiar código da aplicação
COPY . .

# Criar diretório para static files
RUN mkdir -p /app/staticfiles /var/log/crm && \
    chmod -R 755 /app

# User não-root para segurança
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app /var/log/crm

USER appuser

# Environment
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DJANGO_SETTINGS_MODULE=crm_backend.settings

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/health/ || exit 1

# Comando por padrão (pode ser sobrescrito)
CMD ["gunicorn", \
     "crm_backend.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "4", \
     "--worker-class", "sync", \
     "--timeout", "30", \
     "--max-requests", "1000", \
     "--max-requests-jitter", "50", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]

EXPOSE 8000
