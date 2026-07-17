# Design philosophy

clipse is intentionally small. This page explains the principles behind it, so you
can judge whether it fits your project and understand why the API looks the way it
does.

## A fluent builder, then `ready()`

Everything is expressed by chaining methods on a `Clipse` instance and finishing
with `ready()`:

```ts
new Clipse("app", "…", "1.0.0")
  .addOptions({ … })
  .addArguments([ … ])
  .addSubcommands([ … ])
  .action(fn)
  .ready();
```

Each method returns the instance, so configuration reads top-to-bottom. `ready()`
is the single side-effecting step: it reads `process.argv`, parses, and dispatches.
Keeping parsing in one place makes the control flow easy to follow and to test —
you can call `ready(["…"])` with an explicit argument list instead of touching the
global `process.argv`.

## Types are the product

A CLI library written in TypeScript should give you more than runtime parsing: it
should make wrong code fail to compile. clipse infers the shapes you declare into
the `action` callback, so unknown option keys and mismatched value types are caught
by the compiler rather than discovered at runtime. This is the feature that
justifies reaching for clipse over hand-rolling `process.argv` parsing. The
mechanics are covered in [Type inference](/explanation/type-inference).

## Sensible defaults, no ceremony

- `help` (`-h`) and `version` (`-v`) exist on every command automatically.
- Every declared option is present in `opts` with a default, so you rarely write
  `?? fallback` — unless you opt into `optional: true`, which models "truly absent".
- A `generate-completion` subcommand is built in.

The goal is that a useful CLI is only a few lines, and the common cases need no
configuration.

## What clipse deliberately is not

- **No validation/coercion framework.** Values are strings or booleans. If you need
  numbers, enums, or schema validation, do it in your `action` (optionally with a
  library like Zod). This keeps the core tiny and predictable.
- **No dependency tree.** clipse has zero runtime dependencies and ships ESM + CJS
  with type declarations. `typescript` is the only peer dependency.
- **Bash-only completion.** The completion generator targets bash. Other shells are
  out of scope for now.

These boundaries are what keep the library small enough to read in one sitting.

## Side effects are explicit and separable

`help()` prints and exits, which is what a CLI wants by default. But the pure
building blocks are exposed too: `helpText()` returns the help string and
`generateCompletionScript()` returns the completion script, neither printing nor
exiting. That makes the output embeddable and testable without spawning a process.
