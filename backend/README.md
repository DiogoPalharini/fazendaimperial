# Backend FastAPI

Este diretório contém a API FastAPI responsável pelo provisionamento de fazendas, módulos e usuários `system_admin`.

## Requisitos

- Python 3.12+
- PostgreSQL 14+ (ou compatível)

## Primeiros passos

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy env.example .env
```

Atualize o arquivo `.env` com as credenciais do banco e o usuário `system_admin` inicial (`FIRST_SYSTEM_ADMIN_EMAIL/PASSWORD`).

## Migrações

```powershell
.\.venv\Scripts\alembic upgrade head
```

## Executar a API

```powershell
uvicorn app.main:app --reload
```

A documentação interativa estará disponível em `http://localhost:8000/api/v1/docs`.

