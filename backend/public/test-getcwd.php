<?php
echo "Current directory: " . getcwd() . "\n";
echo "Index.php exists at: " . (file_exists('index.php') ? 'YES' : 'NO') . "\n";
echo "Index.php exists at full path: " . (file_exists(__DIR__ . '/index.php') ? 'YES' : 'NO') . "\n";
