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
    'id_submission', 'id_team', 'id_user', 'id_vacancy', 'id_position', 'id_user_mentor',
    'cover_letter_file', 'institution_letter_file',
    'cv_file', 'portfolio_file', 'linkedin_url', 'motivation_message',
    'status', 'submitted_at',

    // dari HR
    'hr_notes', 'screening_status',

    // dari main (evaluation)
    'scores_data', 'narrative', 'recommendation', 'evaluation_status',
    ];

    protected $casts = [
        'scores_data' => 'array',
        'submitted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function mentor()
    {
        return $this->belongsTo(User::class, 'id_user_mentor', 'id_user');
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

    public function loa()
{
    return $this->hasOne(Loa::class, 'id_submission', 'id_submission');
}

public function payroll()
{
    return $this->hasOne(Payroll::class, 'id_submission', 'id_submission');
}
}
