<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $table = 'teams';
    protected $primaryKey = 'id_team';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['id_team', 'name', 'team_code', 'created_at'];

    public function members()
    {
        return $this->hasMany(TeamMember::class, 'id_team', 'id_team');
    }
}
