<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $primaryKey = 'id_submission';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_submission', 'id_team', 'id_user', 'id_vacancy', 'id_position',
        'cover_letter_file', 'institution_letter_file',
        'cv_file', 'portfolio_file', 'linkedin_url', 'motivation_message', 'status', 'submitted_at',
    ];

    public function vacancy()
    {
        return $this->belongsTo(Vacancy::class, 'id_vacancy', 'id_vacancy');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }
}