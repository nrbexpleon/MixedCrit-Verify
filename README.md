# MixedCrit Verify

Mixed-criticality isolation and interference evidence for centralized vehicle compute.

MixedCrit Verify helps OEM, Tier-1, and platform teams model compute partitions and workloads, define interference campaigns, record deterministic validation outcomes, identify freedom-from-interference gaps, and create human-reviewed evidence packs.

## MVP capabilities

- Vehicle-compute platform and hypervisor context
- Partition/workload register with criticality, CPU, memory, timing, and communication budgets
- Shared-resource and interference-channel modelling
- Deterministic campaign generation for CPU, memory, storage, network, restart, and fault-injection scenarios
- Recorded execution outcomes and budget-overrun checks
- Explainable isolation findings, coverage metrics, and remediation actions
- Evidence links, review decisions, and append-style audit history
- Downloadable JSON verification report
- REST API, responsive UI, unit tests, Docker, and Azure deployment assets

## Important limitation

This MVP records and evaluates supplied results. It does not inject faults into a real vehicle computer, prove freedom from interference, or certify ISO 26262 compliance. Approved safety methods, controlled test environments, and qualified human review are required.

## Run

Requires Node.js 20+.

```bash
npm test
npm start
```

Open http://localhost:3000.

## API

- `GET /api/health`
- `GET|POST /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects/:id/partitions`
- `POST /api/projects/:id/channels`
- `POST /api/projects/:id/campaigns`
- `POST /api/projects/:id/runs`
- `POST /api/projects/:id/evidence`
- `POST /api/projects/:id/reviews`
- `GET /api/projects/:id/report`

See `docs/methodology.md` for the transparent verification model.
