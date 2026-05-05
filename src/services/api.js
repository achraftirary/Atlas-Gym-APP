const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, options);
    if (!response.ok) {
        let message = 'Request failed';
        try {
            const error = await response.json();
            message = error.message || message;
        } catch (err) {
            message = response.statusText || message;
        }
        throw new Error(message);
    }
    return response.json();
};

// Member API calls
export const memberAPI = {
    // Login
    login: async (credentials) => {
        const endpoint = credentials.isAdminLogin ? '/auth/admin/login' : '/auth/member/login';
        return request(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
            })
        });
    },

    // Register new member (public self-registration)
    register: async (memberData) => {
        return request('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: memberData.first_name,
                last_name: memberData.last_name,
                email: memberData.email,
                password: memberData.password
            })
        });
    },

    // Create member (admin-protected)
    create: async (memberData) => {
        if (!memberData.password) throw new Error('Password is required for new members');
        const token = localStorage.getItem('token');
        return request('/members', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                first_name: memberData.first_name,
                last_name: memberData.last_name,
                email: memberData.email,
                password: memberData.password
            })
        });
    },

    // Get member's own profile
    getProfile: async () => {
        const token = localStorage.getItem('token');
        return request('/members/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
    },

    // Update member's own profile
    updateProfile: async (profileData) => {
        const token = localStorage.getItem('token');
        return request('/members/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(profileData)
        });
    },

    // Get all members (admin only)
    getAll: async () => {
        const token = localStorage.getItem('token');
        return request('/members', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // Get member by ID (admin only)
    getById: async (id) => {
        const token = localStorage.getItem('token');
        return request(`/members/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // Update member
    update: async (id, memberData) => {
        const token = localStorage.getItem('token');
        return request(`/members/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                first_name: memberData.first_name,
                last_name: memberData.last_name,
                email: memberData.email,
                ...(memberData.password && { password: memberData.password })
            })
        });
    },

    // Delete member (admin only)
    delete: async (id) => {
        const token = localStorage.getItem('token');
        return request(`/members/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // Get member's own subscription
    getMySubscription: async () => {
        const token = localStorage.getItem('token');
        return request('/members/subscription', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // Get member dashboard bundle
    getDashboard: async () => {
        const token = localStorage.getItem('token');
        return request('/members/dashboard', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // Book class as member
    bookClass: async (classId) => {
        const token = localStorage.getItem('token');
        return request(`/members/classes/${classId}/book`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
};

// Membership API calls
export const membershipAPI = {
    // Create new membership
    create: async (membershipData) => {
        const token = localStorage.getItem('token');
        return request('/memberships', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(membershipData)
        });
    },

    // Get membership by member ID
    getByMemberId: async (memberId) => {
        const token = localStorage.getItem('token');
        return request(`/memberships/member/${memberId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    },

    // Update membership
    update: async (id, membershipData) => {
        const token = localStorage.getItem('token');
        return request(`/memberships/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(membershipData)
        });
    },

    // Cancel membership
    cancel: async (id) => {
        const token = localStorage.getItem('token');
        return request(`/memberships/${id}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
}; 

// Admin data APIs
export const adminAPI = {
    getOverview: async () => {
        const token = localStorage.getItem('token');
        return request('/admin/overview', { headers: { Authorization: `Bearer ${token}` } });
    },
    getPayments: async () => {
        const token = localStorage.getItem('token');
        return request('/admin/payments', { headers: { Authorization: `Bearer ${token}` } });
    },
    markPaymentPaid: async (id) => {
        const token = localStorage.getItem('token');
        return request(`/admin/payments/${id}/mark-paid`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    },
    createClass: async (payload) => {
        const token = localStorage.getItem('token');
        return request('/admin/classes', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    },
    inviteStaff: async (payload) => {
        const token = localStorage.getItem('token');
        return request('/admin/staff/invite', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    },
    logEquipmentMaintenance: async (id, payload) => {
        const token = localStorage.getItem('token');
        return request(`/admin/equipment/${id}/log-maintenance`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    },
    getClasses: async () => {
        const token = localStorage.getItem('token');
        return request('/admin/classes', { headers: { Authorization: `Bearer ${token}` } });
    },
    getAttendance: async () => {
        const token = localStorage.getItem('token');
        return request('/admin/attendance', { headers: { Authorization: `Bearer ${token}` } });
    },
    getEquipment: async () => {
        const token = localStorage.getItem('token');
        return request('/admin/equipment', { headers: { Authorization: `Bearer ${token}` } });
    },
    getLeads: async () => {
        const token = localStorage.getItem('token');
        return request('/admin/leads', { headers: { Authorization: `Bearer ${token}` } });
    },
    getStaff: async () => {
        const token = localStorage.getItem('token');
        return request('/admin/staff', { headers: { Authorization: `Bearer ${token}` } });
    },
    getBranches: async () => {
        const token = localStorage.getItem('token');
        return request('/admin/branches', { headers: { Authorization: `Bearer ${token}` } });
    }
    ,
    getAuditLogs: async () => {
        const token = localStorage.getItem('token');
        return request('/admin/audit-logs', { headers: { Authorization: `Bearer ${token}` } });
    },
    getMemberships: async () => {
        const token = localStorage.getItem('token');
        return request('/admin/memberships', { headers: { Authorization: `Bearer ${token}` } });
    },
    getTrainers: async () => {
        const token = localStorage.getItem('token');
        return request('/admin/trainers', { headers: { Authorization: `Bearer ${token}` } });
    },
    getProfile: async () => {
        const token = localStorage.getItem('token');
        return request('/admin/profile', { headers: { Authorization: `Bearer ${token}` } });
    },
    updateProfile: async (payload) => {
        const token = localStorage.getItem('token');
        return request('/admin/profile', { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    },
    logCheckin: async (memberId) => {
        const token = localStorage.getItem('token');
        return request('/admin/checkin', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ memberId }) });
    },
    createLead: async (payload) => {
        const token = localStorage.getItem('token');
        return request('/admin/leads', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    },
    createBranch: async (payload) => {
        const token = localStorage.getItem('token');
        return request('/admin/branches', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    },
    createMembershipPlan: async (payload) => {
        const token = localStorage.getItem('token');
        return request('/admin/memberships', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    },
    createTrainer: async (payload) => {
        const token = localStorage.getItem('token');
        return request('/admin/trainers', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    }
};