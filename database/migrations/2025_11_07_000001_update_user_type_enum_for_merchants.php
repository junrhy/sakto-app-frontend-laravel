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
            $enumType = $this->getPostgresEnumType('users', 'user_type');

            if ($enumType) {
                $this->addPostgresEnumValue($enumType, 'merchant');
                $this->addPostgresEnumValue($enumType, 'employee');
            } else {
                // Column is not using an enum type yet; recreate with the expected values.
                DB::statement('ALTER TABLE users ALTER COLUMN user_type DROP DEFAULT');
                DB::statement('ALTER TABLE users ALTER COLUMN user_type TYPE TEXT');

                $enumTypeName = 'users_user_type_enum';
                $quotedEnumType = $this->quoteIdentifier($enumTypeName);

                DB::statement("DROP TYPE IF EXISTS {$quotedEnumType}");
                DB::statement("CREATE TYPE {$quotedEnumType} AS ENUM ('user','admin','customer','merchant','employee')");
                DB::statement("ALTER TABLE users ALTER COLUMN user_type TYPE {$quotedEnumType} USING user_type::text::{$quotedEnumType}");
                DB::statement("ALTER TABLE users ALTER COLUMN user_type SET DEFAULT 'user'");
            }
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
        $quotedType = $this->quoteIdentifier($typeName);

        DB::statement("
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1
                    FROM pg_type
                    WHERE typname = '{$escapedType}'
                ) THEN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM pg_type t
                        JOIN pg_enum e ON t.oid = e.enumtypid
                        WHERE t.typname = '{$escapedType}'
                          AND e.enumlabel = '{$escapedValue}'
                    ) THEN
                        ALTER TYPE {$quotedType} ADD VALUE '{$value}';
                    END IF;
                END IF;
            END
            $$;
        ");
    }

    private function getPostgresEnumType(string $table, string $column): ?string
    {
        $result = DB::selectOne(
            "SELECT data_type, udt_name
             FROM information_schema.columns
             WHERE table_schema = current_schema()
               AND table_name = ?
               AND column_name = ?",
            [$table, $column]
        );

        if (!$result) {
            return null;
        }

        if (($result->data_type ?? null) === 'USER-DEFINED' && !empty($result->udt_name)) {
            return $result->udt_name;
        }

        return null;
    }

    private function quoteIdentifier(string $identifier): string
    {
        return '"' . str_replace('"', '""', $identifier) . '"';
    }
};
