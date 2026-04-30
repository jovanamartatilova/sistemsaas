<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    protected $primaryKey = 'id_role';
    protected $keyType    = 'string';
    public $incrementing  = false;

    protected $fillable = [
        'id_role',
        'id_company',
        'name',
        'description',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'id_company', 'id_company');
    }

    public function employees()
    {
        return $this->hasMany(Employee::class, 'id_role', 'id_role');
    }

    public function users()
    {
        return $this->hasMany(Employee::class, 'id_role', 'id_role');
    }
}