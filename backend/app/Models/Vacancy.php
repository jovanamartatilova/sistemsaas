<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vacancy extends Model
{
    protected $primaryKey = 'id_vacancy';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_vacancy',
        'id_company',
        'title',
        'description',
        'photo',
        'location',
        'duration_months',
        'type',
        'deadline',
        'payment_type',
        'batch',
        'quota',
        'status',
        'publish_date',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'id_company', 'id_company');
    }

    public function positions()
    {
        return $this->belongsToMany(Position::class, 'vacancy_positions', 'id_vacancy', 'id_position');
    }
}
