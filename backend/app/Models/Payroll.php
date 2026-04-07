<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    protected $primaryKey = 'id_payroll';
    public $incrementing  = false;
    protected $keyType    = 'string';

    protected $fillable = [
        'id_payroll', 'id_submission', 'stipend_amount',
        'bank_name', 'bank_account', 'account_holder',
        'period', 'status', 'paid_at',
    ];

    public function submission()
    {
        return $this->belongsTo(Submission::class, 'id_submission', 'id_submission');
    }
}