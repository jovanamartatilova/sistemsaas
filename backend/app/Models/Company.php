<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Company extends Model
{
    use HasApiTokens;

    protected $primaryKey = 'id_company';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id_company',
        'name',
        'email',
        'address',
        'slug',
        'password',
        'phone',
        'description',
        'logo_path',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            // 'password' => 'hashed', // Removed - handle hashing manually in controller
        ];
    }

    public function vacancies()
    {
        return $this->hasMany(Vacancy::class, 'id_company', 'id_company');
    }

}
