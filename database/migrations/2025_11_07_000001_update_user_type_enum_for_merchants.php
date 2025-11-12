<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'user_type')) {
            return;
        }

        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN user_type ENUM('user','admin','customer','merchant','employee') DEFAULT 'user'");
        } elseif ($driver === 'pgsql') {
            $this->addPostgresEnumValue('user_type', 'merchant');
            $this->addPostgresEnumValue('user_type', 'employee');
        } else {
            Schema::table('users', function (Blueprint $table) {
                $table->string('user_type')->default('user')->change();
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('users', 'user_type')) {
            return;
        }

        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN user_type ENUM('user','admin','customer','merchant') DEFAULT 'user'");
        } elseif ($driver === 'pgsql') {
            // Removing enum values is not straightforward; document the limitation.
        }
    }

    private function addPostgresEnumValue(string $typeName, string $value): void
    {
        $escapedType = addslashes($typeName);
        $escapedValue = addslashes($value);

        DB::statement("
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_type t
                    JOIN pg_enum e ON t.oid = e.enumtypid
                    WHERE t.typname = '{$escapedType}'
                      AND e.enumlabel = '{$escapedValue}'
                ) THEN
                    ALTER TYPE {$typeName} ADD VALUE '{$value}';
                END IF;
            END
            $$;
        ");
    }
};
