<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Production seeder for RBAC (FR-004, NFR-007): the four SRS roles, exactly the D-34 permission
 * codes, and the role → permission map that matches every `x-required-roles` /
 * `x-required-permissions` pair in docs/api/openapi.yaml (diffed in docs/plans/S1.md §2.10;
 * re-checked by tests/Database/SeedersTest.php).
 *
 * Idempotent: roles and codes are upserted by name. Role → permission pairs are only granted for
 * codes this run creates, so a re-seed never re-grants a pair an administrator removed through
 * replaceRolePermissions (audited, FR-004) and never removes one either.
 */
final class IdentitySeeder extends Seeder
{
    /** @var array<string, string> role name => description */
    public const ROLES = [
        'Citizen' => 'Reports emergencies and follows their own reports.',
        'Dispatcher' => 'Reviews, prioritises and dispatches reports in the operations room.',
        'Field Unit Representative' => 'Executes missions assigned to their field unit.',
        'System Administrator' => 'Manages users, roles, settings and audited identity disclosure.',
    ];

    /** @var array<string, string> D-34 code => description */
    public const PERMISSIONS = [
        'report.view' => 'View operations reports, the map and assignment reads.',
        'report.review' => 'Start reviewing a report.',
        'report.edit' => 'Edit report data in the operations room.',
        'report.assign' => 'Assign and reassign a report to a field unit.',
        'report.close' => 'Close a report.',
        'report.export' => 'Export reports.',
        'statistics.view' => 'View statistics and the heat map.',
        'alert.send' => 'Send geographic alerts.',
        'alert.view' => 'View geographic alerts.',
        'chat.use' => 'Use operator chat.',
        'field_unit.view' => 'List field units.',
        'field_unit.manage' => 'Create and update field units.',
        'field_unit.update_own' => 'Update the own field unit of the caller.',
        'assignment.view_own' => 'View own unit assignments and field actions.',
        'mission.update' => 'Update mission status and submit field actions.',
        'user.manage' => 'Manage user accounts.',
        'role.manage' => 'Manage role permissions.',
        'settings.manage' => 'Manage system settings and report types.',
        'audit.view' => 'View audit and simulated-integration logs.',
        'identity.reveal' => 'Reveal the identity of an anonymous reporter (audited).',
    ];

    /** @var array<string, list<string>> role name => permission codes */
    public const ROLE_PERMISSIONS = [
        'Citizen' => [],
        'Dispatcher' => [
            'report.view', 'report.review', 'report.edit', 'report.assign', 'report.close',
            'report.export', 'statistics.view', 'alert.send', 'alert.view', 'chat.use',
            'field_unit.view',
        ],
        'Field Unit Representative' => ['assignment.view_own', 'mission.update', 'field_unit.update_own'],
        'System Administrator' => [
            'user.manage', 'role.manage', 'settings.manage', 'audit.view', 'field_unit.view',
            'field_unit.manage', 'identity.reveal',
        ],
    ];

    public function run(): void
    {
        DB::transaction(function (): void {
            foreach (self::ROLES as $name => $description) {
                DB::table('roles')->updateOrInsert(['name' => $name], ['description' => $description]);
            }
            $existing = DB::table('permissions')->pluck('code')->all();
            foreach (self::PERMISSIONS as $code => $description) {
                DB::table('permissions')->updateOrInsert(['code' => $code], ['description' => $description]);
            }
            $created = array_diff(array_keys(self::PERMISSIONS), $existing);

            $roleIds = DB::table('roles')->pluck('id', 'name');
            $permissionIds = DB::table('permissions')->pluck('id', 'code');

            $rows = [];
            foreach (self::ROLE_PERMISSIONS as $role => $codes) {
                foreach (array_intersect($codes, $created) as $code) {
                    $rows[] = ['role_id' => $roleIds[$role], 'permission_id' => $permissionIds[$code]];
                }
            }
            DB::table('role_permissions')->insertOrIgnore($rows);
        });
    }
}
