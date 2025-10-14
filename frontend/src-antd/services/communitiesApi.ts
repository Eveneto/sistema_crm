import api from './api';
import { 
  Community, 
  CommunityListResponse, 
  CommunityMember, 
  CommunityMemberListResponse,
  CommunityCreateData,
  CommunityUpdateData,
  CommunityStatistics 
} from '../types/community';

const COMMUNITIES_BASE_URL = '/api/communities';

export const communitiesApi = {
  // Communities CRUD
  async getCommunities(params?: {
    page?: number;
    search?: string;
    is_public?: boolean;
    ordering?: string;
  }): Promise<CommunityListResponse> {
    const response = await api.get(`${COMMUNITIES_BASE_URL}/communities/`, { params });
    return response.data;
  },

  async getCommunity(id: string): Promise<Community> {
    const response = await api.get(`${COMMUNITIES_BASE_URL}/communities/${id}/`);
    return response.data;
  },

  async createCommunity(data: CommunityCreateData): Promise<Community> {
    const response = await api.post(`${COMMUNITIES_BASE_URL}/communities/`, data);
    return response.data;
  },

  async updateCommunity(id: string, data: CommunityUpdateData): Promise<Community> {
    const response = await api.patch(`${COMMUNITIES_BASE_URL}/communities/${id}/`, data);
    return response.data;
  },

  async deleteCommunity(id: string): Promise<void> {
    await api.delete(`${COMMUNITIES_BASE_URL}/communities/${id}/`);
  },

  // Community actions
  async joinCommunity(id: string): Promise<{ message: string; membership: CommunityMember }> {
    const response = await api.post(`${COMMUNITIES_BASE_URL}/communities/${id}/join/`);
    return response.data;
  },

  async leaveCommunity(id: string): Promise<{ message: string }> {
    const response = await api.post(`${COMMUNITIES_BASE_URL}/communities/${id}/leave/`);
    return response.data;
  },

  async inviteMember(id: string, data: { user_email: string; role?: string }): Promise<{ message: string; membership: CommunityMember }> {
    const response = await api.post(`${COMMUNITIES_BASE_URL}/communities/${id}/invite_member/`, data);
    return response.data;
  },

  async addMember(id: string, data: { user_email: string; role?: string }): Promise<{ message: string; membership: CommunityMember }> {
    const response = await api.post(`${COMMUNITIES_BASE_URL}/communities/${id}/add_member/`, data);
    return response.data;
  },

  async getCommunityStatistics(id: string): Promise<CommunityStatistics> {
    const response = await api.get(`${COMMUNITIES_BASE_URL}/communities/${id}/statistics/`);
    return response.data;
  },

  // Members management
  async getCommunityMembers(
    communityId: string,
    params?: {
      page?: number;
      search?: string;
      role?: string;
      is_active?: boolean;
    }
  ): Promise<CommunityMemberListResponse | CommunityMember[]> {
    const response = await api.get(`${COMMUNITIES_BASE_URL}/communities/${communityId}/members/`, { params });
    return response.data;
  },

  async getCommunityMember(communityId: string, memberId: string): Promise<CommunityMember> {
    const response = await api.get(`${COMMUNITIES_BASE_URL}/communities/${communityId}/members/${memberId}/`);
    return response.data;
  },

  async updateMemberRole(
    communityId: string, 
    memberId: string, 
    data: { role: 'admin' | 'moderator' | 'member' }
  ): Promise<CommunityMember> {
    const response = await api.post(`${COMMUNITIES_BASE_URL}/communities/${communityId}/members/${memberId}/update_role/`, data);
    return response.data;
  },

  async removeMember(communityId: string, memberId: string): Promise<{ message: string }> {
    const response = await api.delete(`${COMMUNITIES_BASE_URL}/communities/${communityId}/members/${memberId}/remove/`);
    return response.data;
  },

  // Utility functions
  async searchCommunities(query: string): Promise<Community[]> {
    const response = await this.getCommunities({ search: query });
    return response.results;
  },

  async getMyCommunities(): Promise<Community[]> {
    const response = await this.getCommunities();
    return response.results.filter(community => community.is_member);
  },

  async getPublicCommunities(): Promise<Community[]> {
    const response = await this.getCommunities({ is_public: true });
    return response.results;
  },
};

export default communitiesApi;
