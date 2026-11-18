# DSH 0.2.2-rc.4 validation

Base: b2820b94459a113c000ec23b5314094cbf68bf93. Candidate: 26.11.18-lhg.

Only add exact rc.4 peer admission, aligned compatibility matrix/fixtures, version and documentation. No source implementation or runtime dependency changes. No broad untested host range.

- Official host rc.4: 3f321d32bfe382212a8ed8785c1d47a5a300aa23. Unreleased master migrations excluded.
- Isolated rc.4 graph verified 76 matching DSH packages: 34 test files, 217 tests passed. Covers actual host tool runtime, annotations, keyed quote slot shadowing, native effort/composer and lifecycle contracts.
- Actual Cordis Loader 1.1.0: volatile config updates, invalid-input preservation and disposal passed.
- Existing baseline npm check passed: typecheck, 217 runtime tests, 22 annotation checks, 15 release/identity checks, build.
- Official rc.4 CLI installed the packed candidate into a new temporary profile; bundle registration and web startup passed with no incompatible/disabled diagnostic.
- Rebuilt client differs from checked-in bundle only in dependency source-path labels; existing distributable retained to avoid unrelated churn.
- Chromium cannot launch in this environment (local Unix socket denied); browser interaction and user Desktop installation are NOT claimed. This release changes admission metadata only, not UI implementation.
- No security policies, workflows, permissions, account settings or user data changed. No npm or upstream release; no installer upload.
