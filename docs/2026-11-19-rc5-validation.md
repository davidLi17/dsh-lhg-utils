# DSH 0.2.2-rc.5 compatibility validation

Base: a1c5e4504890a0fac407add7396c797e451216d9. Candidate: 26.11.19-lhg.

Scope: exact rc.5 peer admission only, aligned matrix/fixtures, version and documentation. No reconnect/polling feature, no business/UI source changes, no broad range or permissions changes.

- Official rc.5 source tag 9c2670d3bce5275e0d1610272958121af87787bb: running its actual evaluatePluginCompatibility implementation against old manifest reports six unmet DSH peers; the candidate is accepted without exemptions. README and old manifest consistently ended at rc.4.
- Isolated rc.5 dependency graph verifies 76 same-version host packages. 34 files / 217 tests pass, including actual fork context inheritance, independent answer, explicit cancellation, passive parent delivery, original child continuation into Sidebar, native quote shadowing and effort shortcuts.
- Actual Cordis Loader 1.1.0: volatile settings updates, invalid-input preservation and disposal pass.
- Baseline npm check: typecheck, 217 runtime tests, 22 annotations tests, 15 release/identity tests and build pass.
- Official rc.5 CLI installs the packed candidate into a new temporary profile, registers the bundle and boots web without incompatible/disabled diagnostics. No user profile modified.
- Installed index.js and client.js SHA256 match the distributables committed here. Rebuilt client differs from previous bundle only in dependency source-path labels; normalized comparison is byte-identical.
- Browser cannot launch due to local Unix socket restriction. No browser E2E or Desktop installation claimed. This metadata adaptation is separate from the unvalidated upstream 300-second reconnect feature and Sidebar UI candidates, which remain withheld.
- No npm/upstream release, installer upload or workflow/security changes.
