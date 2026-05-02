<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_task';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_task',
        'id_mentor',
        'id_intern',
        'id_team',
        'title',
        'description',
        'competency_ids',
        'frequency',
        'task_type',
        'status',
        'deadline_at',
        'work_attachments',
        'submitted_at',
        'parent_id_task',
        'delegated_by',
        'feedback_notes',
        'logbook_approved',
    ];

    protected $casts = [
        'deadline_at'      => 'datetime',
        'competency_ids'   => 'array',
        'work_attachments' => 'array',
        'submitted_at'     => 'datetime',
    ];

    public function mentor()
    {
        return $this->belongsTo(User::class, 'id_mentor', 'id_user');
    }

    public function intern()
    {
        return $this->belongsTo(User::class, 'id_intern', 'id_user');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'id_team', 'id_team');
    }

    public function parentTask()
    {
        return $this->belongsTo(Task::class, 'parent_id_task', 'id_task');
    }

    public function subTasks()
    {
        return $this->hasMany(Task::class, 'parent_id_task', 'id_task');
    }

    public function delegator()
    {
        return $this->belongsTo(User::class, 'delegated_by', 'id_user');
    }
}
