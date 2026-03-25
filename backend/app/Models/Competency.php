<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Competency extends Model
{
    //
    protected $table = 'competencies';
    protected $primaryKey = 'id_competency';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;
    protected $fillable = [
        'id_competency',
        'name',
        'learning_hours',
        'description',
    ];
    public function positions()
    {
        return $this->belongsToMany(Position::class, 'position_competencies', 'id_competency', 'id_position');
    }
}