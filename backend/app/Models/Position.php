<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Position extends Model
{
    protected $table = 'positions';
    protected $primaryKey = 'id_position';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
    protected $fillable = [
        'id_position',
        'id_company',
        'name',
        'quota',
    ];
    public function vacancies()
    {
        return $this->belongsToMany(Vacancy::class, 'vacancy_positions', 'id_position', 'id_vacancy')->withPivot('quota');
    }
    public function competencies()
    {
        return $this->belongsToMany(Competency::class, 'position_competencies', 'id_position', 'id_competency');
    }
    public function submissions()
    {
        return $this->hasMany(Submission::class, 'id_position', 'id_position');
    }
}