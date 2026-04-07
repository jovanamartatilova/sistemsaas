<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Apprentice extends Model
{
    public $timestamps = false;  // ← tambah ini
    
    protected $primaryKey = 'id_apprentice';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_apprentice',
        'id_submission',
        'status',
        'start_date',
        'end_date',
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class, 'id_submission', 'id_submission');
    }
}