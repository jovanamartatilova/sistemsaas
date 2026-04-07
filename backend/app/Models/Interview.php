<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    protected $primaryKey = 'id_interview';
    public $incrementing  = false;
    protected $keyType    = 'string';
    public $timestamps    = true;

    protected $fillable = [
        'id_interview', 'id_submission', 'id_interviewer',
        'interview_date', 'interview_time', 'media',
        'link', 'notes', 'result',
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class, 'id_submission', 'id_submission');
    }

    public function interviewer()
    {
        return $this->belongsTo(User::class, 'id_interviewer', 'id_user');
    }
}