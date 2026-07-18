# Set a default command

Sometimes you want a command to run automatically when the user doesn't type a
subcommand — for example, running `serve` when they just call your tool. Use
`defineDefaultCommand`.

```ts
import { Clipse } from "clipse";

const serve = new Clipse("serve", "start the dev server")
  .addOptions({ port: { short: "p", type: "string", default: "3000" } })
  .action((_args, opts) => {
    console.log(`listening on :${opts.port}`);
  });

new Clipse("app", "my app", "1.0.0")
  .addSubcommands([serve])
  .defineDefaultCommand(serve)
  .ready();
```

Now both invocations run `serve`:

```sh
$ app serve --port 8080
listening on :8080
$ app --port 8080
listening on :8080
```

## How it resolves

When you call `ready()`, clipse dispatches in this order:

1. `-h` / `--help` → print help and exit.
2. `-v` / `--version` → print the version and exit.
3. First word matches a **subcommand** → run that subcommand.
4. First word is `generate-completion` → write the completion script to
   `~/.clipse.<name>.bash`, source it from `~/.bashrc`, and exit.
5. A **default command** is defined → run it with the remaining arguments.
6. Otherwise → run this command's own `action`.

So the default command is the fallback used whenever no subcommand matches — and
also when the CLI is called with no arguments at all.

::: tip
The default command receives the arguments untouched, so its own options and
arguments are parsed as usual.
:::
