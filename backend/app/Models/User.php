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
    'phone',
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

    public function major()
    {
        return $this->belongsTo(Major::class, 'id_major', 'id_major');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'id_team', 'id_team');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'id_user', 'id_user');
    }
}
