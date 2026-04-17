<?php
require 'vendor/autoload.php';

try {
    $db = new PDO('mysql:host=127.0.0.1;dbname=internship_saas', 'root', '');

    $companies = $db->query('SELECT COUNT(*) as cnt FROM companies')->fetch(PDO::FETCH_ASSOC)['cnt'];
    $users = $db->query('SELECT COUNT(*) as cnt FROM users')->fetch(PDO::FETCH_ASSOC)['cnt'];
    $candidates = $db->query('SELECT COUNT(*) as cnt FROM users WHERE role="candidate"')->fetch(PDO::FETCH_ASSOC)['cnt'];
    $vacancies = $db->query('SELECT COUNT(*) as cnt FROM vacancies')->fetch(PDO::FETCH_ASSOC)['cnt'];
    $submissions = $db->query('SELECT COUNT(*) as cnt FROM submissions')->fetch(PDO::FETCH_ASSOC)['cnt'];

    echo "✓ Database Data Status:\n";
    echo "├─ Companies: $companies\n";
    echo "├─ Users: $users\n";
    echo "├─ Candidates: $candidates\n";
    echo "├─ Vacancies: $vacancies\n";
    echo "└─ Submissions: $submissions\n";
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage();
}
