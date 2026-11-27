<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * S1: roles, permissions and the role map (IdentitySeeder) plus the first administrator from
     * env (FirstAdminSeeder). Report types and settings arrive in S2 per docs/seed-proposal.md.
     */
    public function run(): void
    {
        $this->call([
            IdentitySeeder::class,
            FirstAdminSeeder::class,
        ]);
    }
}
