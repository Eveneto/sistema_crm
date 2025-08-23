# CRM Backend

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configurations
```

4. Run migrations:
```bash
python manage.py migrate
python manage.py createsuperuser
```

5. Run development server:
```bash
python manage.py runserver
```

## API Documentation

- Swagger UI: http://localhost:8000/swagger/
- ReDoc: http://localhost:8000/redoc/

## WebSocket Endpoints

- Chat: ws://localhost:8000/ws/chat/{room_id}/
- Notifications: ws://localhost:8000/ws/notifications/
