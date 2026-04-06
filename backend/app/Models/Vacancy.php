<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

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
        return $this->positions->sum('pivot.quota');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'id_company', 'id_company');
    }

    public function positions()
    {
        return $this->belongsToMany(Position::class, 'vacancy_positions', 'id_vacancy', 'id_position')->withPivot('quota');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'id_vacancy', 'id_vacancy');
    }

    /**
     * Automatically close published vacancies that are past their deadline.
     */
    public static function closeExpired($id_company = null)
    {
        $query = self::where('status', 'published')
            ->where('deadline', '<', Carbon::now()->format('Y-m-d'));
        
        if ($id_company) {
            $query->where('id_company', $id_company);
        }

        $query->update(['status' => 'closed']);
    }
}
