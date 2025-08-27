# CRM System - AI Agent Instructions

## Architecture Overview

This is a **Django REST Framework + React TypeScript CRM system** with Firebase authentication and real-time features. The architecture follows a modular app-based approach with clear separation between backend APIs and frontend components.

### Key Components
- **Backend**: Django apps in `backend/apps/` (authentication, companies, kanban, chat, dashboard)
- **Frontend**: React app in `frontend/src/` with Redux Toolkit, Ant Design UI, and TypeScript
- **Authentication**: Firebase Auth with custom Django middleware (`FirebaseAuthenticationMiddleware`)
- **Database**: SQLite for development, MySQL for production (via Docker)

## Development Workflow

### Starting Services
```bash
# Backend (from project root, with venv activated)
cd backend && python manage.py runserver 8000

# Frontend (from project root)
cd frontend && npm start
```

### Terminal Management
**CRITICAL**: Always use separate terminals for different purposes:
- **Backend Terminal**: Dedicated for `python manage.py runserver` - DO NOT run other commands here
- **Frontend Terminal**: Dedicated for `npm start` - DO NOT run other commands here  
- **Command Terminal**: Use a separate terminal for all other operations (migrations, testing, file operations, etc.)

Never execute commands in terminals running active services (backend/frontend servers).

### Environment Setup
- Backend uses `.env` files and virtual environments (`.venv/`)
- Firebase credentials file must be in project root: `client_secret_254673637981-*.json`
- Use `setup.sh` for initial Docker-based setup

### Database Operations
```bash
# Create migrations after model changes
python manage.py makemigrations app_name

# Apply migrations
python manage.py migrate
```

## Code Conventions & Patterns

### Backend (Django)
- **Apps Structure**: Each feature is a Django app in `backend/apps/`
- **ViewSets**: Use DRF ViewSets with custom actions (see `companies/views.py`)
- **Serializers**: Multiple serializers per model (`CompanySerializer`, `CompanyListSerializer`)
- **Authentication**: Firebase tokens verified via custom middleware, users synced to Django User model

### Frontend (React)
- **Layout System**: Use `MainLayout` wrapper for authenticated pages
- **State Management**: Redux Toolkit slices in `src/redux/slices/`
- **API Integration**: Centralized in `src/services/api.ts` with axios
- **Auth Sync**: Multi-tab logout sync via `authSyncService.ts`

### Authentication Flow
1. Firebase handles login/registration on frontend
2. `FirebaseAuthenticationMiddleware` verifies tokens on backend
3. `authSyncService` syncs logout events across browser tabs
4. Redux store manages auth state with persistence

## Critical Integration Points

### Firebase-Django Bridge
- Firebase users automatically create Django users via `firebase_service.py`
- Token verification happens in `apps.authentication.middleware`
- Frontend sends Firebase ID tokens in Authorization headers

### API Patterns
- All APIs follow `/api/{app_name}/{endpoint}/` structure
- Use DRF filtering: `django_filters` for search/filter functionality
- Custom actions for statistics: `@action(detail=False, methods=['get'])`

### Frontend Component Patterns
- Pages go in `src/pages/`, reusable components in `src/components/`
- Use Ant Design components consistently
- Modals for CRUD operations (see `CompaniesPage.tsx`)
- MainLayout handles navigation and user menu

## Testing & Debugging

### Mandatory Testing After Implementation
**ALWAYS** perform comprehensive tests after completing any functionality:

1. **Backend API Tests**:
```bash
# Test all CRUD endpoints
curl -X GET "http://localhost:8000/api/{app_name}/{endpoint}/"
curl -X POST "http://localhost:8000/api/{app_name}/{endpoint}/" -H "Content-Type: application/json" -d '{...}'
```

2. **Frontend Integration Tests**:
- Test all UI interactions (create, edit, delete, search, pagination)
- Verify error handling and loading states
- Check responsive design on different screen sizes

3. **Database Integrity**:
```bash
# Check migrations and model consistency
python manage.py makemigrations --dry-run
python manage.py check
```

4. **Manual Interface Testing (Developer Required)**:
AI must provide specific test cases with step-by-step instructions for developer execution:

**Required Test Case Format:**
- Clear feature description and testing objective
- Detailed step-by-step instructions for manual testing
- Expected results and success criteria
- Edge cases and error scenarios to verify
- Responsive design testing requirements
- Cross-browser compatibility checks

**Testing Areas to Cover:**
- Complete CRUD workflows in the user interface
- Authentication and authorization flows
- Form validation and error handling
- Loading states and user feedback mechanisms
- Mobile and tablet responsiveness
- Error recovery and offline scenarios

5. **Cross-Module Testing**:
- Verify authentication flows work properly
- Test Firebase token validation
- Check API-Frontend integration

### API Testing Examples
```bash
# Test endpoints directly
curl -X GET "http://localhost:8000/api/companies/companies/" -H "Content-Type: application/json"
```

### Common Issues
- **Firebase credentials**: Ensure JSON file exists in project root
- **CORS issues**: Backend allows localhost:3000 via corsheaders
- **Port conflicts**: Backend runs on 8000, frontend on 3000

## Project-Specific Notes

- **Companies module**: Fully implemented reference for other CRM modules
- **Real-time features**: WebSocket routing in `chat/routing.py` (planned)
- **Docker support**: Full stack deployment via `docker-compose.yml`
- **Multi-environment**: Uses environment variables extensively for configuration

When working on new features, follow the Companies module pattern: create models, serializers, views, and frontend pages with consistent CRUD operations and proper authentication integration.
