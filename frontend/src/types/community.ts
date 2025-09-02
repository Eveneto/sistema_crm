// Types for Communities feature
export interface Community {
  id: string;
  name: string;
  description: string;
  created_by: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  is_public: boolean;
  requires_approval: boolean;
  max_members?: number;
  member_count: number;
  is_full: boolean;
  is_member: boolean;
  user_role?: 'admin' | 'moderator' | 'member';
  created_at: string;
  updated_at: string;
}

export interface CommunityMember {
  id: string;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  community: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  is_active: boolean;
  invited_by?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
}

export interface CommunityListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Community[];
}

export interface CommunityMemberListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: CommunityMember[];
}

export interface CommunityCreateData {
  name: string;
  description: string;
  is_public: boolean;
  requires_approval: boolean;
  max_members?: number;
}

export interface CommunityUpdateData {
  name?: string;
  description?: string;
  is_public?: boolean;
  requires_approval?: boolean;
  max_members?: number;
}

export interface CommunityStatistics {
  total_members: number;
  active_members: number;
  pending_requests: number;
  admins_count: number;
  moderators_count: number;
  members_count: number;
  recent_activity: {
    new_members_this_week: number;
    messages_this_week: number;
  };
}
