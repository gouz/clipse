# The `Clipse` class

```ts
import { Clipse } from "clipse";

class Clipse<TOpts, TArgs> { … }
```

`Clipse` is generic over the accumulated shapes of its options (`TOpts`) and
arguments (`TArgs`). You never write these type parameters by hand — `addOptions`
and `addArguments` infer them and feed them to your [`action`](#action) callback.
See [Type inference](/explanation/type-inference).

## Constructor

```ts
new Clipse(name: string, description?: string, version?: string)
```

| Parameter     | Type     | Default | Description                         |
| ------------- | -------- | ------- | ----------------------------------- |
| `name`        | `string` | —       | The command name.                   |
| `description` | `string` | `""`    | Shown in help.                      |
| `version`     | `string` | `""`    | Printed by `-v` / `--version`.      |

Two options are registered automatically on every instance: `help` (`-h`) and
`version` (`-v`).

## Accessors

Each of `name`, `description`, and `version` has a getter and a setter.

```ts
cli.name;                 // read
cli.name = "renamed";     // write
cli.description;
cli.version = "2.0.0";
```

## Methods

All builder methods return the CLI so calls can be chained.

### addOptions

```ts
addOptions<O extends ClipseOptions>(options?: O): Clipse<TOpts & …, TArgs>
```

Register options, keyed by long name. The value types are inferred into `action`.
See [Add options](/how-to/options) and [`ClipseOption`](/reference/types#clipseoption).

### addGlobalOptions

```ts
addGlobalOptions<O extends ClipseOptions>(options?: O): Clipse<TOpts & …, TArgs>
```

Register options that are inherited by subcommands. See
[Share global options](/how-to/global-options).

### addArguments

```ts
addArguments<A extends readonly ClipseArgument[]>(args: A): Clipse<TOpts, TArgs & …>
```

Declare positional arguments, in order. Each argument name becomes a key on
`args`. See [Add arguments](/how-to/arguments).

### addSubcommands

```ts
addSubcommands(subcommands: Clipse[]): this
```

Register child commands. See [Add subcommands](/how-to/subcommands).

### defineDefaultCommand

```ts
defineDefaultCommand(cmd: Clipse): this
```

Set the command to run when no subcommand matches (including when called with no
arguments). See [Set a default command](/how-to/default-command).

### action

```ts
action(fn: ClipseFunction<TArgs, TOpts>): this
```

Set the function to run for this command. It receives the parsed `args` and `opts`,
typed from what you declared, and may be `async`. See
[`ClipseFunction`](/reference/types#clipsefunction).

### ready

```ts
ready(argv?: string[], parent?: string): Promise<void>
```

Parse and dispatch. Call this last.

- `argv` — arguments to parse. Defaults to `process.argv.slice(2)` when called at
  the top level with no arguments.
- `parent` — the parent command path, used to build help output. Set
  automatically for subcommands; you normally omit it.

`ready` resolves after the matched `action` (and any awaited subcommand) completes.

### help

```ts
help(): never
```

Print the full help text to stdout **and exit the process** with code `0`.

### helpText

```ts
helpText(): string
```

Build and return the help text **without** printing or exiting. Use this to embed
or test help output.

### generateCompletionScript

```ts
generateCompletionScript(): string
```

Return the bash completion script as a string, with no side effects. See
[Generate shell completion](/how-to/completion).

### getGenerationCompletionLine

```ts
getGenerationCompletionLine(): string
```

Return the space-separated list of subcommand names and option flags used to build
the completion script. Primarily an internal helper.
