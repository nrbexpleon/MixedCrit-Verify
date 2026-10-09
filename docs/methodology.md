# Verification methodology

MixedCrit Verify uses explicit budgets and deterministic rules. It does not claim to implement or reproduce ISO 26262.

## Evidence thread

`Compute platform → Partitions/workloads → Shared-resource channels → Interference campaign → Recorded run → Evidence → Human safety review`

## Partition budgets

Each workload declares a criticality classification plus CPU, memory, and deadline budgets. Campaigns pair one or more aggressor workloads with safety-relevant targets.

## Campaign categories

- CPU stress
- Memory pressure
- Network saturation
- Storage contention
- Partition restart
- Fault injection
- Partition escape attempts

The default campaign set requires CPU, memory, network, restart, and fault-injection coverage. Tests targeting ASIL-B or above are treated as critical.

A case fails when its recorded result fails, CPU or memory exceeds the target budget, latency exceeds the deadline, or error propagation is observed. Missing critical results prevent an isolation conclusion.

## Production backlog

1. Entra/OIDC authentication, RBAC, tenant isolation, and signed audit events.
2. Active isolated fault/stress workers for approved hypervisor and HIL environments.
3. Trace importers for CPU scheduling, memory bandwidth, Ethernet, storage, GPU, and IPC.
4. Time synchronisation, provenance, cryptographic evidence hashes, and reproducibility metadata.
5. Statistical timing analysis, jitter distributions, confidence intervals, and baseline comparison.
6. Configurable OEM safety methods, independence criteria, and approval matrices.
7. Integrations with requirements, safety case, CI/CD, VariantGuard, and Vehicle API Lab.
8. Signed PDF verification reports and controlled evidence retention.
