<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Submission extends Model
{
    protected $primaryKey = 'id_submission';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = true;

    protected $fillable = [

        'id_submission', 'id_team', 'id_user', 'id_vacancy', 'id_position',
        'cover_letter_file', 'institution_letter_file',
        'cv_file', 'portfolio_file', 'linkedin_url', 'motivation_message',
        'status', 'submitted_at',
        'hr_notes', 'screening_status',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function assessment()
    {
        return $this->hasOne(Assessment::class, 'id_submission', 'id_submission');
    }

    public function vacancy()
    {
        return $this->belongsTo(Vacancy::class, 'id_vacancy', 'id_vacancy');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function position()
    {
        return $this->belongsTo(Position::class, 'id_position', 'id_position');
    }
}
