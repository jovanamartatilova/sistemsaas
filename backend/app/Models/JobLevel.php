<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobLevel extends Model
{
    protected $fillable = ['id_company', 'name', 'description'];

    public function company()
    {
        return $this->belongsTo(Company::class, 'id_company', 'id_company');
    }
}