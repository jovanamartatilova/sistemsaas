<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'id_user';

    /**
     * The "type" of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
    'id_user',
    'id_company',
    'name',
    'email',
    'password',
    'role',
    'is_active',
    'activation_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'id_company', 'id_company');
    }

    public function university()
    {
        return $this->belongsTo(University::class, 'id_university', 'id_university');
    }

    public function teamMembership()
    {
        return $this->hasOne(TeamMember::class, 'id_user', 'id_user');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'id_user', 'id_user');
    }

    public function employee()
    {
        return $this->hasOne(Employee::class, 'id_user', 'id_user');
    }

    public function candidate()
    {
        return $this->hasOne(Candidate::class, 'id_user', 'id_user');
    }

    /**
     * Get scoped role (leader or member) based on team membership
     * Returns: 'leader', 'member', or null if not in a team
     */
    public function getScopedRole()
    {
        if (!$this->id_team) {
            return null; // Independent, no team
        }

        // Check if user is team leader in team_members table
        $teamMember = \App\Models\TeamMember::where('id_user', $this->id_user)
            ->where('id_team', $this->id_team)
            ->first();

        if ($teamMember && $teamMember->role === 'leader') {
            return 'leader';
        }

        // If in team but not leader role, they're a member
        if ($this->id_team) {
            return 'member';
        }

        return null;
    }
}
