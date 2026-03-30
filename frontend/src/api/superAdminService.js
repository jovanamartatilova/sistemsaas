import api from "./axios";

export const superAdminService = {
  getDashboardStats: () =>
    api.get(`/superadmin/dashboard/stats`).then(r => r.data),

  getTenants: (params = {}) =>
    api.get(`/superadmin/tenants`, { params }).then(r => r.data),

  updateTenantStatus: (id, status) =>
    api.patch(`/superadmin/tenants/${id}/status`, { status }).then(r => r.data),

  getUsers: (params = {}) =>
    api.get(`/superadmin/users`, { params }).then(r => r.data),
};