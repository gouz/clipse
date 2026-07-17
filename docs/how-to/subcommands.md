# Add subcommands

A subcommand is simply another `Clipse` instance registered on its parent with
`addSubcommands`. This lets you build tools like `git commit` or `docker image ls`.

```ts
import { Clipse } from "clipse";

const commit = new Clipse("commit", "record changes")
  .addOptions({ message: { short: "m", type: "string" } })
  .action((_args, opts) => {
    console.log(`committing: ${opts.message}`);
  });

new Clipse("git", "a tiny git", "1.0.0")
  .addSubcommands([commit])
  .action(() => console.log("run `git commit` to record changes"))
  .ready();
```

```sh
$ git commit -m "initial"
committing: initial
```

When the first word matches a subcommand's name, clipse removes it from the
argument list and hands the rest to that subcommand's `ready`. If nothing matches,
the parent's own `action` runs.

## Nesting

Because a subcommand is a full `Clipse`, it can have its own subcommands — nest as
deep as you like:

```ts
const remoteAdd = new Clipse("add", "add a remote")
  .action(() => console.log("remote added"));

const remote = new Clipse("remote", "manage remotes")
  .addSubcommands([remoteAdd]);

new Clipse("git", "a tiny git", "1.0.0")
  .addSubcommands([remote])
  .ready();
```

```sh
$ git remote add
remote added
```

The generated `--help` and the full command path (`git remote add`) are handled
for you at each level.

## See also

- [Set a default command](/how-to/default-command) to run something when no
  subcommand is given.
- [Share global options](/how-to/global-options) to pass options down into
  subcommands.
