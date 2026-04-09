# Debug Checklist: Scores Not Saving

## Step 1: Run Database Migrations
Di terminal backend, jalankan:
```bash
cd backend
php artisan migrate
```

Output harus menunjukkan migration 2026_04_09_000004 sukses:
```
2026-04-09_000004_add_scores_and_assessment_columns_to_submissions .. 1.23 (300+ms)
```

## Step 2: Verify Database Schema
Jalankan di php artisan:
```bash
php artisan tinker
> Schema::hasColumn('submissions', 'scores_data')
=> true  // harus true, kalo false ada masalah

> $sub = \App\Models\Submission::first();
> $sub->scores_data
=> null  // atau array jika sudah ada data

> exit
```

## Step 3: Test Manual Insert
```php
$sub = \App\Models\Submission::where('id_user_mentor', 'USR123abc')->first();
if ($sub) {
    $sub->update(['scores_data' => [
        ['id_competency' => 'CMP001', 'score' => 85, 'status' => 'passed']
    ]]);
    $sub->refresh();
    var_dump($sub->scores_data); // harus show array
}
```

## Step 4: Check Browser DevTools
1. Buka DevTools (F12)
2. Masuk ke mentor Input Score page
3. Lihat Console tab - harus ada logs seperti:
   - `[API] POST /mentor/interns/{id}/scores` 
   - `[API] Response 200 from /mentor/interns/{id}/scores:`
   
4. Kalau ada error 500, lihat Network tab:
   - Click request `/mentor/interns/{id}/scores`
   - Lihat Response tab untuk error details
   - Lihat backend `storage/logs/laravel.log` untuk full error

## Step 5: Common Issues & Solutions

### Issue: "Column 'scores_data' doesn't exist"
- Run: `php artisan migrate`
- Check: `php artisan migrate --pending` untuk lihat unflushed migrations

### Issue: "Validation error on score"
- Frontend harus send: `{ scores: [{id_competency: '...', score: 85, ...}] }`
- Score must be: number 0-100, atau null
- Hours must be: number >= 0, atau null

### Issue: "Submission not found"
- Verify: Mentor indeed has assignment untuk submission itu
- Query: `SELECT * FROM submissions WHERE id_submission='...' AND id_user_mentor='...'`

### Issue: Migration already run but scores_data missing
- Rollback: `php artisan migrate:rollback`
- Atau run spesifik: `php artisan migrate --path=/database/migrations/2026_04_09_000004...`
