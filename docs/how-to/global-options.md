# Share global options

Global options are declared once on the parent and made available to its
subcommands. Use them for cross-cutting flags like `--verbose` or `--config`.

```ts
import { Clipse } from "clipse";

const build = new Clipse("build", "build the project")
  .action((_args, opts) => {
    if (opts.verbose) console.log("verbose build…");
  });

new Clipse("tool", "my tool", "1.0.0")
  .addGlobalOptions({
    verbose: { short: "V", type: "boolean", description: "verbose output" },
  })
  .addSubcommands([build])
  .ready();
```

```sh
$ tool build --verbose
verbose build…
```

## How it works

When a subcommand is dispatched, the parent merges its global options into that
subcommand's own options. From the subcommand's point of view they behave exactly
like locally declared options: they get defaults, are parsed from the command
line, and appear in the subcommand's `--help`.

Global options also show up in the parent's `--help` listing, so users can
discover them.

::: info
`addGlobalOptions` returns the CLI for chaining, just like `addOptions`. Declare
globals before `addSubcommands`/`ready` so they are in place when subcommands are
dispatched.
:::

## When to use which

- Use [`addOptions`](/how-to/options) for options that belong to a single command.
- Use `addGlobalOptions` for options that several subcommands should all accept.
