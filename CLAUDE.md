# CRM System - Claude Sonnet Development Guide

## 🎯 Core Architecture

**Django REST Framework + React TypeScript CRM** with Firebase authentication
- Backend: Modular Django apps in `backend/apps/`
- Frontend: React + Redux Toolkit + Ant Design in `frontend/src/`
- Auth: Firebase tokens → Django middleware → User sync
- Database: SQLite (dev) / MySQL (prod via Docker)

## 🚨 CRITICAL RULES

### Terminal Management
**AI NEVER starts services automatically:**
- ❌ **NEVER** use `run_in_terminal` for `runserver` or `npm start`
- ❌ **NEVER** start services in background with `&` 
- ✅ **ONLY** provide startup instructions for developer
- ✅ **ONLY** use `run_in_terminal` for: migrations, curl tests, file operations
- 🔄 **Terminal Usage**: Commands only - Developer handles services

**Service Terminals (Developer Only):**
- **Backend Terminal**: Only for `python manage.py runserver 8000`
- **Frontend Terminal**: Only for `npm start` 
- **Command Terminal**: AI uses for all other operations

### Mandatory Post-Implementation Testing
After implementing ANY functionality, ALWAYS test:
1. Backend API endpoints with curl
2. Frontend UI interactions (CRUD, error states, responsiveness)
3. Database migrations (`python manage.py makemigrations --dry-run`)
4. Cross-module integration (auth flows, API-frontend communication)

## 🔧 Development Workflow

### Service Startup (DEVELOPER MUST DO MANUALLY)
**AI NEVER starts services automatically - only provides instructions**

```bash
# Terminal 1: Backend (Developer runs)
cd /home/dev_pc/Documentos/crm_freela
source .venv/bin/activate
cd backend
python manage.py runserver 8000

# Terminal 2: Frontend (Developer runs)
cd /home/dev_pc/Documentos/crm_freela/frontend
npm start

# Terminal 3: Commands (AI uses for migrations, testing, etc.)
```

### CRITICAL: AI Service Management Rules
- ❌ **NEVER** use `run_in_terminal` to start `runserver` or `npm start`
- ❌ **NEVER** try to start services in background with `&`
- ✅ **ALWAYS** provide clear startup instructions for developer
- ✅ **ALWAYS** assume services are running when testing
- ✅ **ONLY** use terminals for commands (migrations, curl tests, etc.)

### Firebase Setup
- Credentials file: `client_secret_254673637981-*.json` in project root
- Custom middleware: `apps.authentication.middleware.FirebaseAuthenticationMiddleware`
- User sync: `firebase_service.py` auto-creates Django users

## 📝 Code Patterns

### Backend (Django)
- **ViewSets**: DRF with custom actions (`@action(detail=False)`)
- **Serializers**: Multiple per model (`CompanySerializer`, `CompanyListSerializer`)
- **Filtering**: Use `django_filters` for search/filter
- **APIs**: Structure `/api/{app_name}/{endpoint}/`

### Frontend (React)
- **Layout**: Wrap authenticated pages with `MainLayout`
- **State**: Redux Toolkit slices in `src/redux/slices/`
- **API**: Centralized axios client in `src/services/api.ts`
- **Auth Sync**: Multi-tab logout via `authSyncService.ts`

### Reference Implementation
**Companies module** is the complete reference - follow its patterns:
- `backend/apps/companies/` (models, serializers, views, urls)
- `frontend/src/pages/CompaniesPage.tsx` (CRUD interface with Ant Design)

## 🧪 Testing Protocol

### DEVELOPER SETUP (Required before AI testing)
```bash
# 1. Start Backend (Terminal 1)
cd /home/dev_pc/Documentos/crm_freela
source .venv/bin/activate
cd backend
python manage.py runserver 8000

# 2. Start Frontend (Terminal 2) 
cd /home/dev_pc/Documentos/crm_freela/frontend
npm start

# 3. Create test user (if needed)
# In Terminal 3:
cd /home/dev_pc/Documentos/crm_freela/backend
source ../.venv/bin/activate
python manage.py createsuperuser
```

### AI TESTING (After Developer starts services)

### 1. API Testing (Assume Services Running)
**DEVELOPER MUST START SERVICES FIRST:**
1. **Backend Terminal**: `cd backend && python manage.py runserver 8000`
2. **Frontend Terminal**: `cd frontend && npm start`

**Then AI tests with:**
```bash
# Authentication test
curl -X POST "http://localhost:8000/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Companies CRUD tests
curl -X GET "http://localhost:8000/api/companies/companies/" \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X POST "http://localhost:8000/api/companies/companies/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Company","email":"test@company.com"}'
```

### 2. Database Validation
```bash
python manage.py makemigrations --dry-run
python manage.py check
python manage.py migrate
```

### 3. Manual Interface Testing (Developer Required)
**AI MUST provide specific test cases for developer to execute:**

#### Test Case Template:
```
🎯 Feature: [Feature Name]
📋 Developer Steps:
1. Ensure backend running on http://localhost:8000
2. Ensure frontend running on http://localhost:3000
3. Navigate to [URL/Page]
4. Click [Element]
5. Fill [Field] with [Value]
6. Click [Button]

✅ Expected Result: [What should happen]
❌ Edge Cases to Test:
- Empty fields
- Invalid data
- Network errors
- Long text inputs
- Special characters

🔄 Responsive Test: Check on mobile/tablet views
```

#### Example Test Cases:
**Companies CRUD:**
- Create company with all fields → Verify in table
- Edit company name → Check real-time update
- Delete company → Confirm removal and modal
- Search companies → Filter results instantly
- Pagination → Navigate through pages
- Empty state → Show "No data" message

**Authentication Flow:**
- Login with valid credentials → Redirect to dashboard
- Login with invalid credentials → Show error message
- Logout → Clear session and redirect
- Protected route access → Redirect to login

#### Error State Testing:
- Network disconnection → Show offline message
- API errors → Display user-friendly messages  
- Loading states → Show spinners/skeletons
- Form validation → Highlight required fields

## 🔍 Common Issues
- Firebase credentials missing in project root
- CORS configured for localhost:3000
- Port conflicts: Backend 8000, Frontend 3000
- Virtual environment activation required for backend

## 👨‍💻 DEVELOPER INSTRUCTIONS

### Starting Development Environment
```bash
# 1. Backend Terminal (keep running)
cd /home/dev_pc/Documentos/crm_freela
source .venv/bin/activate
cd backend
python manage.py runserver 8000
# Leave this terminal running ✅

# 2. Frontend Terminal (keep running)
cd /home/dev_pc/Documentos/crm_freela/frontend  
npm start
# Leave this terminal running ✅

# 3. Commands Terminal (for AI/Developer operations)
cd /home/dev_pc/Documentos/crm_freela
source .venv/bin/activate
# Use this terminal for: migrations, testing, file operations
```

### When AI Provides Test Cases
1. **Ensure both services are running** (check terminals 1 & 2)
2. **Follow step-by-step instructions** provided by AI
3. **Test all edge cases** mentioned in test cases
4. **Report results back** to AI with details of any failures

### When AI Requests API Testing
- AI will provide `curl` commands to test
- Developer should copy/paste and run these commands
- Report the output back to AI for analysis

Follow the Companies module as your implementation blueprint for consistent patterns across all CRM modules.
