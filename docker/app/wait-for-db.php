<?php

/**
 * Blocks until the configured database accepts a connection.
 *
 * Driver-agnostic on purpose: it boots the framework and asks Laravel for a
 * PDO handle, so it honours DATABASE_URL (how Railway and most managed
 * Postgres providers hand over credentials) just as well as discrete
 * DB_HOST / DB_PORT variables, and works for pgsql, sqlsrv and sqlite alike.
 *
 * Usage: php docker/app/wait-for-db.php [attempts] [sleep-seconds]
 */

$attempts = (int) ($argv[1] ?? 30);
$delay = (int) ($argv[2] ?? 2);

require __DIR__ . '/../../vendor/autoload.php';

$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$connection = config('database.default');
fwrite(STDOUT, "Waiting for database connection [{$connection}]..." . PHP_EOL);

for ($attempt = 1; $attempt <= $attempts; $attempt++) {
    try {
        Illuminate\Support\Facades\DB::connection()->getPdo();
        fwrite(STDOUT, "Database is up (attempt {$attempt})." . PHP_EOL);
        exit(0);
    } catch (Throwable $e) {
        fwrite(STDERR, "  attempt {$attempt}/{$attempts}: " . $e->getMessage() . PHP_EOL);
        sleep($delay);
    }
}

fwrite(STDERR, 'Database did not become available in time.' . PHP_EOL);
exit(1);
