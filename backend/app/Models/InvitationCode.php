<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvitationCode extends Model
{
    protected $primaryKey = 'id_invitation';

    protected $fillable = [
        'id_company',
        'id_role',
        'code',
        'label',
        'division',
        'position',
        'employee_status',
        'schedule',
        'job_level',
        'is_active',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'id_company', 'id_company');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'id_role', 'id_role');
    }
}