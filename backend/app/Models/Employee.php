<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $primaryKey = 'id_employee';
    protected $keyType    = 'string';
    public $incrementing  = false;

    protected $fillable = [
        'id_employee',
        'id_user',
        'id_company',
        'id_role',
        'first_name',
        'last_name',
        'phone',
        'nik',
        'birth_date',
        'address',
        'photo_path',
        'department',
        'position',
        'joined_at',
        'job_level',
        'employee_status',
        'schedule',
        'emergency_name',
        'emergency_phone',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'joined_at'  => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'id_company', 'id_company');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'id_role', 'id_role');
    }

    // Helper: nama lengkap
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }
}