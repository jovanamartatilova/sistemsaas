#!/bin/bash

cd /var/www/sistemsaas/backend

# Verify .env has Mailtrap config
echo "=== Current MAIL Configuration ==="
grep '^MAIL_' .env
echo ""

# Update bootstrap/app.php to add service provider
echo "=== Updating bootstrap/app.php ==="
if ! grep -q "MailtrapServiceProvider" bootstrap/app.php; then
  sed -i "s/return Application::configure/use App\\\\Providers\\\\MailtrapServiceProvider;\n\nreturn Application::configure/" bootstrap/app.php
fi

# Clear all caches
echo "=== Clearing Laravel caches ==="
php artisan config:clear
php artisan cache:clear
php artisan route:clear

echo ""
echo "=== Setup Complete ==="
echo "Ready to test email sending."
