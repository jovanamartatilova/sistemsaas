<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamInvitation extends Model
{
    protected $table = 'team_invitations';
    protected $primaryKey = 'id_invitation';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'id_invitation',
        'id_team',
        'id_creator',
        'token',
        'team_name',
        'max_members',
        'used_count',
        'expires_at',
        'is_active',
        'created_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    /**
     * Relationship with Team
     */
    public function team()
    {
        return $this->belongsTo(Team::class, 'id_team', 'id_team');
    }

    /**
     * Relationship with Creator (User)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'id_creator', 'id_user');
    }

    /**
     * Check if invitation is still valid
     */
    public function isValid(): bool
    {
        return $this->is_active
            && (!$this->expires_at || $this->expires_at->isFuture());
    }

    /**
     * Check if team is at max capacity
     */
    public function isTeamFull(): bool
    {
        $memberCount = TeamMember::where('id_team', $this->id_team)->count();
        return $memberCount >= $this->max_members;
    }

    /**
     * Increment used count
     */
    public function incrementUsedCount(): void
    {
        $this->increment('used_count');
    }

    /**
     * Deactivate invitation
     */
    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }
}
