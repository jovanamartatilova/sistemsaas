<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    protected $primaryKey = 'id_certificate';
    public $incrementing = false;
    protected $keyType = 'string';
    const UPDATED_AT = null;

    protected $fillable = [
        'id_certificate',
        'id_submission',
        'certificate_number',
        'file_path',
        'final_score',
        'issued_date',
        'is_sent',
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class, 'id_submission');
    }
}
