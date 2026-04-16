<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assessment extends Model
{
    protected $primaryKey = 'id_assessment';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = true;

    protected $fillable = [
        'id_assessment',
        'id_submission',
        'id_user',
        'id_user_mentor',
        'scores_data',
        'narrative',
        'recommendation',
        'evaluation_status',
    ];

    protected $casts = [
        'scores_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class, 'id_submission', 'id_submission');
    }

    public function mentor()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}
