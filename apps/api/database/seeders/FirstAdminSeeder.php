<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use RuntimeException;

/**
 * Creates the first System Administrator from config('istigaba.first_admin') (env ADMIN_*).
 * Refuses (no row written) when the email or password is missing, and in production when the
 * password is the example value or shorter than 8 characters (D-06). Idempotent: if a user with
 * that email exists nothing changes, so a password changed later is never overwritten.
 */
final class FirstAdminSeeder extends Seeder
{
    public function run(): void
    {
        $email = mb_strtolower(trim((string) config('istigaba.first_admin.email')));
        $password = (string) config('istigaba.first_admin.password');
        $phone = config('istigaba.first_admin.phone');
        $name = (string) config('istigaba.first_admin.name');

        if ($email === '' || $password === '') {
            throw new RuntimeException('FirstAdminSeeder: set ADMIN_EMAIL and ADMIN_PASSWORD.');
        }

        if (app()->environment('production')
            && ($password === config('istigaba.first_admin.example_password') || mb_strlen($password) < 8)) {
            throw new RuntimeException('FirstAdminSeeder: refusing the example or a short ADMIN_PASSWORD in production.');
        }

        if (DB::table('users')->where('email', $email)->exists()) {
            return;
        }

        $roleId = DB::table('roles')->where('name', 'System Administrator')->value('id');
        if ($roleId === null) {
            throw new RuntimeException('FirstAdminSeeder: run IdentitySeeder first.');
        }

        DB::table('users')->insert([
            'role_id' => $roleId,
            'full_name' => $name,
            'email' => $email,
            'phone' => is_string($phone) && $phone !== '' ? $phone : null,
            'password_hash' => Hash::make($password),
            'is_active' => true,
            'location_consent' => false,
        ]);
    }
}
