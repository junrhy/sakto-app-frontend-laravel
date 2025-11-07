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
            // Attempt to add the new values to the enum type if it exists
            try {
                DB::statement("ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'merchant'");
                DB::statement("ALTER TYPE user_type ADD VALUE IF NOT EXISTS 'employee'");
            } catch (\Throwable $e) {
                // Fallback: change column to text temporarily and recreate enum
                DB::statement('ALTER TABLE users ALTER COLUMN user_type TYPE TEXT');
                DB::statement("DROP TYPE IF EXISTS user_type");
                DB::statement("CREATE TYPE user_type AS ENUM ('user','admin','customer','merchant','employee')");
                DB::statement("ALTER TABLE users ALTER COLUMN user_type TYPE user_type USING user_type::user_type");
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
};
