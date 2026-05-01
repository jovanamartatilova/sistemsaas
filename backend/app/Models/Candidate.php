<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    protected $primaryKey = 'id_candidate';
    protected $keyType    = 'string';
    public $incrementing  = false;

    protected $fillable = [
        'id_candidate',
        'id_user',
        'phone',
        'institution',
        'education_level',
        'major',
        'photo_path',
        'birth_date',
        'address',
        'gender',
        'about',
        'bank_name',
        'bank_account_number',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'id_user', 'id_user');
    }
}