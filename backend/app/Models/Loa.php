<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Loa extends Model
{
    protected $primaryKey = 'id_loa';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id_loa',
        'id_submission',
        'letter_number',
        'file_path',
        'signed_by',
        'issued_date',
        'is_sent',
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class, 'id_submission', 'id_submission');
    }
}
