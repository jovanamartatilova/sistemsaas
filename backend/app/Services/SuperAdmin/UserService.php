<?php

namespace App\Services\SuperAdmin;

use App\Models\User;

class UserService
{
    public function getAll(array $filters): array
    {
        $query = User::with('company:id_company,name')
                     ->where('role', '!=', 'super_admin');

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('email', 'like', "%{$filters['search']}%");
            });
        }

        if (!empty($filters['role']) && $filters['role'] !== 'all') {
            $query->where('role', $filters['role']);
        }

        if (!empty($filters['company_id'])) {
            $query->where('id_company', $filters['company_id']);
        }

        $users = $query->latest()->get()->map(function ($u) {
            return [
                'id'          => $u->id_user,
                'name'        => $u->name,
                'email'       => $u->email,
                'role'        => $u->role,
                'phone'       => $u->phone,
                'company'     => $u->company?->name ?? '—',
                'created_at'  => $u->created_at->format('d M Y'),
            ];
        });

        return [
            'data'  => $users,
            'total' => $users->count(),
        ];
    }
}
