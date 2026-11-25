# Progress

## Current slice

**S0 Foundation**, plan approved 2026-11-26 (`docs/plans/S0.md`). In progress.

## Done

- 2026-11-25: S0 plan written (`docs/plans/S0.md`).
- 2026-11-26: Owner decisions B1–B8 and Q1–Q4 recorded in the plan. Reference docs copied byte-identical into `docs/` (B1). `structure.txt` deleted (Q2).

## Next

- Finish S0 per `docs/plans/S0.md` §4.

## Blockers

- None.

## Open decisions

- Framework tables (`cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `migrations`) exist outside the DBML by decision B2 and are allowlisted in the schema-drift check.
- GIST indexes on geography columns: deferred to S10 (B7).
- `report_types` category for "SOS عام": still open (seed-proposal.md), needed in S2.

## Verification log

| Date | Command | Result |
|---|---|---|
| 2026-11-26 | `pnpm doctor` (after `source ~/.bashrc`) | All checks ok: PHP 8.4.22 + extensions, Composer on 8.4.22, Node 26.13.1, pnpm 12.23.0, Python 3.13.17, psql 18.7, PostGIS 3.7 |

## Notes

- pnpm ≥ 11 reads non-auth settings only from `pnpm-workspace.yaml`, so the planned `.npmrc` settings live there instead (§3 of the plan).
