<?php

namespace App\Services\SuperAdmin;

use App\Models\Company;

class TenantService
{
    public function getAll(array $filters): array
    {
        $query = Company::withCount([
            'users',
            'vacancies',
            'submissions as peserta_count',
        ]);

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', "%{$filters['search']}%")
                  ->orWhere('email', 'like', "%{$filters['search']}%");
            });
        }

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        $companies = $query->latest()->get()->map(function ($c) {
            return [
                'id'            => $c->id_company,
                'name'          => $c->name,
                'email'         => $c->email,
                'address'       => $c->address,
                'logo_path'     => $c->logo_path,
                'status'        => $c->status,
                'users_count'   => $c->users_count,
                'vacancies_count' => $c->vacancies_count,
                'peserta_count' => $c->peserta_count,
                'created_at'    => $c->created_at->format('d M Y'),
            ];
        });

        return [
            'data'  => $companies,
            'total' => $companies->count(),
        ];
    }

    public function getById(string $id): array
    {
        $c = Company::withCount(['users', 'vacancies', 'submissions as peserta_count'])
                    ->findOrFail($id);

        return [
            'id'              => $c->id_company,
            'name'            => $c->name,
            'email'           => $c->email,
            'address'         => $c->address,
            'description'     => $c->description,
            'logo_path'       => $c->logo_path,
            'status'          => $c->status,
            'users_count'     => $c->users_count,
            'vacancies_count' => $c->vacancies_count,
            'peserta_count'   => $c->peserta_count,
            'created_at'      => $c->created_at->format('d M Y'),
        ];
    }

    public function updateStatus(string $id, string $status): array
    {
        $company = Company::findOrFail($id);
        $company->update(['status' => $status]);

        return [
            'message' => 'Status berhasil diperbarui',
            'status'  => $company->status,
        ];
    }
}
