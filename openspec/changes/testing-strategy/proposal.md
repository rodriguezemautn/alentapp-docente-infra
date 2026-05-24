# Proposal: Testing Strategy

## Intent

Fix broken test infra (41 failing, no root `npm test`) and deliver a testing strategy for Actividad 3. Students need a working test runner, clear docs, and academic reference material.

## Scope

### In Scope
- Root vitest workspace config so `npm test` works cross-package
- Full testing strategy doc (unit, integration, E2E, coverage + mutation, property-based, accessibility, visual regression, API contract)
- Hexagonal map update with test layers mapped to hexagonal layers
- Markdown slide deck for classroom presentation
- npm scripts + TUI for test execution (unit, integration, e2e, coverage)
- Fill test gaps (Discipline integration test, additional E2E)
- Academic notes on process, strategy, versioning, tools
- Coverage thresholds config and documentation

### Out of Scope
- Fixing pre-existing business logic failures (config-only fixes)
- CI/CD pipeline setup (GitHub Actions, etc.)
- Migration to different test frameworks

## Capabilities

### New Capabilities
- `testing`: Root vitest workspace, test scripts, coverage config, and TUI for running tests across all packages from a single entry point

### Modified Capabilities
- None

## Approach

1. Fix infrastructure first (vitest workspace, root package.json scripts)
2. Document strategy (testing doc, hexagonal map, slides, academic notes)
3. Create scripts (npm scripts + bash TUI)
4. Fill test gaps (Discipline integration test, extra E2E)
5. Verify — `npm test` passes, coverage reports work

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `vitest.workspace.ts` | Create | Root workspace config for multi-package testing |
| `package.json` | Modify | `npm test` → vitest workspace, add unit/integration/e2e/coverage scripts |
| `packages/web/vitest.config.ts` | Modify | Ensure workspace compatibility |
| `docs/architecture/hexagonal-map.md` | Modify | Add testing layer section |
| `docs/testing/strategy.md` | Create | Full testing strategy document |
| `docs/testing/slides.md` | Create | Markdown slide deck |
| `docs/notas-academicas/12-testing-estrategia.md` | Create | Academic notes |
| `scripts/test-tui.sh` | Create | TUI for test execution |
| `openspec/specs/testing/spec.md` | Create | Testing infrastructure spec |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| vitest workspace conflicts with per-package configs | Low | Test on each package separately first |
| New tests fail from env setup | Low | Validate env prerequisites in documentation |

## Rollback Plan

- Revert `vitest.workspace.ts` and `package.json` changes if incompatible
- All docs are additive — reversible with `git revert`

## Success Criteria

- [ ] `npm test` runs all tests from root, 197+ baseline unit tests pass
- [ ] Testing strategy documented with diagrams
- [ ] Academic notes written with references
- [ ] Presentation slides created
- [ ] Hexagonal map updated with testing layer
- [ ] TUI script runs unit, integration, e2e, coverage
