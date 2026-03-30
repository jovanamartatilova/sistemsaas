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
        'type',
        'deadline',
        'start_date',
        'end_date',
        'payment_type',
        'batch',
        'status',
        'publish_date',
    ];

    protected $appends = ['total_quota'];

    public function getTotalQuotaAttribute()
    {
        return $this->positions->sum('quota');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'id_company', 'id_company');
    }

    public function positions()
    {
        return $this->belongsToMany(Position::class, 'vacancy_positions', 'id_vacancy', 'id_position');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'id_vacancy', 'id_vacancy');
    }
}
