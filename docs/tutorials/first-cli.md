# Build your first CLI

In this tutorial you will build a small command-line tool called `greet`, step by
step. By the end you will have a CLI with an option, a positional argument, and a
subcommand — and you will have run it after every change.

You need [Bun](https://bun.sh) (or Node.js 18+) installed. This tutorial uses Bun.

## Step 1 — Create the project

```sh
mkdir greet && cd greet
bun init -y
bun add clipse
```

## Step 2 — The smallest possible CLI

Create `greet.ts`:

```ts
import { Clipse } from "clipse";

new Clipse("greet", "a friendly greeter", "1.0.0")
  .action(() => {
    console.log("Hello, world!");
  })
  .ready();
```

Run it:

```sh
$ bun greet.ts
Hello, world!
```

You already get `--help` and `--version` for free:

```sh
$ bun greet.ts --version
1.0.0
```

Every builder method returns the CLI, so you can **chain** calls and finish with
`.ready()`, which reads `process.argv` and dispatches to your `action`.

## Step 3 — Add an argument

Let's greet someone by name. Add a positional argument and read it from `args`:

```ts{4,6}
import { Clipse } from "clipse";

new Clipse("greet", "a friendly greeter", "1.0.0")
  .addArguments([{ name: "who", description: "who to greet" }])
  .action((args) => {
    console.log(`Hello, ${args.who ?? "world"}!`);
  })
  .ready();
```

```sh
$ bun greet.ts Alice
Hello, Alice!
```

Because you declared `who`, `args.who` is typed as `string | undefined` — your
editor knows the key exists, and a typo like `args.whoo` won't compile.

## Step 4 — Add an option

Add a boolean `--loud` flag (with a `-l` shorthand):

```ts{4-6,8}
import { Clipse } from "clipse";

new Clipse("greet", "a friendly greeter", "1.0.0")
  .addOptions({
    loud: { short: "l", type: "boolean", description: "shout the greeting" },
  })
  .addArguments([{ name: "who", description: "who to greet" }])
  .action((args, opts) => {
    const msg = `Hello, ${args.who ?? "world"}!`;
    console.log(opts.loud ? msg.toUpperCase() : msg);
  })
  .ready();
```

```sh
$ bun greet.ts Alice --loud
HELLO, ALICE!
$ bun greet.ts Alice -l
HELLO, ALICE!
```

`opts.loud` is typed as `boolean` because you set `type: "boolean"`. Try assigning
it to a `string` and TypeScript will stop you.

## Step 5 — Add a subcommand

A subcommand is just another `Clipse`. Let's add `greet bye` that says goodbye:

```ts{3-6,15}
import { Clipse } from "clipse";

const bye = new Clipse("bye", "say goodbye instead")
  .addArguments([{ name: "who" }])
  .action((args) => {
    console.log(`Goodbye, ${args.who ?? "world"}!`);
  });

new Clipse("greet", "a friendly greeter", "1.0.0")
  .addOptions({
    loud: { short: "l", type: "boolean", description: "shout the greeting" },
  })
  .addArguments([{ name: "who", description: "who to greet" }])
  .addSubcommands([bye])
  .action((args, opts) => {
    const msg = `Hello, ${args.who ?? "world"}!`;
    console.log(opts.loud ? msg.toUpperCase() : msg);
  })
  .ready();
```

```sh
$ bun greet.ts Alice
Hello, Alice!
$ bun greet.ts bye Alice
Goodbye, Alice!
```

When the first word matches a subcommand's name, clipse hands the rest of the
arguments to that subcommand. Otherwise it runs the parent's `action`.

::: warning
Don't give an argument the same name as a subcommand — the subcommand wins.
:::

## Step 6 — See the generated help

```sh
$ bun greet.ts --help
```

```
greet 1.0.0
a friendly greeter

Usage: greet [options] [arguments]

Subcommands:
  bye   say goodbye instead

Options:
  -h, --help    show help
  -v, --version show version
  -l, --loud    shout the greeting

Arguments:
  who   who to greet

You can generate a completion script for your CLI by running:
$ greet generate-completion
```

## What you built

You now have a typed CLI with an option, an argument, a subcommand, and free
`--help`/`--version`. From here:

- Solve specific problems with the [How-to guides](/how-to/).
- Look up exact signatures in the [Reference](/reference/).
- Understand how the typing works in [Type inference](/explanation/type-inference).
