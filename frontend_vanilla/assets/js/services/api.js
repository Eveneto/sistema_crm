// API Service para comunicação com backend Django
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:8000'; // URL do backend Django
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    // Obter headers com token de autenticação
    async getHeaders() {
        const headers = { ...this.defaultHeaders };
        
        // Adicionar token Firebase se autenticado
        if (window.firebaseAuth && window.firebaseAuth.isAuthenticated()) {
            const token = await window.firebaseAuth.getCurrentToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }

    // Método base para requisições
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            const headers = await this.getHeaders();
            
            const config = {
                headers,
                ...options
            };

            const response = await $.ajax({
                url: url,
                method: options.method || 'GET',
                headers: headers,
                data: options.data ? JSON.stringify(options.data) : undefined,
                contentType: 'application/json',
                dataType: 'json'
            });

            return response;
        } catch (error) {
            console.error('API Request failed:', error);
            
            // Tratar erros específicos
            if (error.status === 401) {
                showToast('Sessão expirada. Faça login novamente.', 'error');
                await window.firebaseAuth.logout();
                return;
            }
            
            if (error.status === 403) {
                showToast('Acesso negado', 'error');
                return;
            }
            
            if (error.status >= 500) {
                showToast('Erro interno do servidor', 'error');
                return;
            }
            
            throw error;
        }
    }

    // GET
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST
    async post(endpoint, data) {
        return this.request(endpoint, { 
            method: 'POST', 
            data: data 
        });
    }

    // PUT
    async put(endpoint, data) {
        return this.request(endpoint, { 
            method: 'PUT', 
            data: data 
        });
    }

    // PATCH
    async patch(endpoint, data) {
        return this.request(endpoint, { 
            method: 'PATCH', 
            data: data 
        });
    }

    // DELETE
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // ===== COMPANIES API =====
    async getCompanies(params = {}) {
        const queryString = $.param(params);
        const endpoint = `/api/companies/companies/${queryString ? '?' + queryString : ''}`;
        return this.get(endpoint);
    }

    async getCompany(id) {
        return this.get(`/api/companies/companies/${id}/`);
    }

    async createCompany(data) {
        return this.post('/api/companies/companies/', data);
    }

    async updateCompany(id, data) {
        return this.put(`/api/companies/companies/${id}/`, data);
    }

    async deleteCompany(id) {
        return this.delete(`/api/companies/companies/${id}/`);
    }

    async getCompaniesStatistics() {
        return this.get('/api/companies/companies/statistics/');
    }

    // ===== KANBAN API =====
    async getBoards() {
        return this.get('/api/kanban/boards/');
    }

    async getBoard(id) {
        return this.get(`/api/kanban/boards/${id}/`);
    }

    async getTasks(params = {}) {
        const queryString = $.param(params);
        const endpoint = `/api/kanban/tasks/${queryString ? '?' + queryString : ''}`;
        return this.get(endpoint);
    }

    async getTask(id) {
        return this.get(`/api/kanban/tasks/${id}/`);
    }

    async createTask(data) {
        return this.post('/api/kanban/tasks/', data);
    }

    async updateTask(id, data) {
        return this.put(`/api/kanban/tasks/${id}/`, data);
    }

    async deleteTask(id) {
        return this.delete(`/api/kanban/tasks/${id}/`);
    }

    // ===== COMMUNITIES API =====
    async getCommunities() {
        return this.get('/api/communities/communities/');
    }

    async getCommunity(id) {
        return this.get(`/api/communities/communities/${id}/`);
    }

    async createCommunity(data) {
        return this.post('/api/communities/communities/', data);
    }

    async updateCommunity(id, data) {
        return this.put(`/api/communities/communities/${id}/`, data);
    }

    async deleteCommunity(id) {
        return this.delete(`/api/communities/communities/${id}/`);
    }

    // ===== CHAT API =====
    async getChatRooms() {
        return this.get('/api/chat/rooms/');
    }

    async getChatRoom(id) {
        return this.get(`/api/chat/rooms/${id}/`);
    }

    async getMessages(roomId) {
        return this.get(`/api/chat/rooms/${roomId}/messages/`);
    }

    async sendMessage(roomId, data) {
        return this.post(`/api/chat/rooms/${roomId}/messages/`, data);
    }

    // ===== DASHBOARD API =====
    async getDashboardStats() {
        try {
            const [companies, tasks, communities] = await Promise.all([
                this.getCompanies(),
                this.getTasks(),
                this.getCommunities()
            ]);

            return {
                companies: companies.length || companies.count || 0,
                tasks: tasks.length || tasks.count || 0,
                communities: communities.length || communities.count || 0,
                messages: Math.floor(Math.random() * 1000) + 500, // Simulado
                revenue: Math.floor(Math.random() * 500000) + 100000 // Simulado
            };
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            // Retornar dados padrão em caso de erro
            return {
                companies: 0,
                tasks: 0,
                communities: 0,
                messages: 0,
                revenue: 0
            };
        }
    }

    // ===== HEALTH CHECK =====
    async healthCheck() {
        try {
            return this.get('/api/health/');
        } catch (error) {
            console.error('Health check failed:', error);
            return { status: 'error' };
        }
    }
}

// Instância global da API
window.api = new APIService();
