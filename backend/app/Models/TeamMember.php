<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    protected $table = 'team_members';
    protected $primaryKey = 'id_team_member';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = ['id_team_member', 'id_user', 'id_team', 'role', 'joined_at'];

    public function user()
    {
        return $this->belongsTo(User::class, 'id_user', 'id_user');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'id_team', 'id_team');
    }
}
