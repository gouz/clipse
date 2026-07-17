# Add options

Options are the named flags of your CLI (`--opt`, `-o`). Declare them with
`addOptions`, keyed by their long name.

```ts
cli.addOptions({
  opt: {
    short: "o",
    type: "string",
    default: "test",
    description: "an option for test",
  },
});
```

## String vs boolean options

The `type` field decides how an option is parsed and what value your `action`
receives:

```ts
cli.addOptions({
  name: { type: "string" },   // opts.name is a string
  force: { type: "boolean" }, // opts.force is a boolean
});
```

`type` defaults to `"string"` when omitted. The value type is inferred into the
`action` callback, so `opts.force` is a `boolean` and `opts.name` is a `string`.

## Add a shorthand

Set `short` to expose a single-character alias:

```ts
cli.addOptions({ output: { short: "o", type: "string" } });
```

```sh
$ mycli --output file.txt
$ mycli -o file.txt
$ mycli -o=file.txt
```

Boolean shorthands can be combined: `-abc` sets three boolean flags at once, and
`-ab value` sets two booleans plus a trailing value for the last flag.

## Provide a default value

```ts
cli.addOptions({
  level: { type: "string", default: "info" },
  color: { type: "boolean", default: true },
});
```

If the user doesn't pass the option, `opts.level` is `"info"` and `opts.color` is
`true`. When you give no default, a string option falls back to `""` and a boolean
to `false`.

::: tip
Defaults are type-checked against `type`: a `"boolean"` option only accepts a
boolean default, a `"string"` option only a string default.
:::

## Make an option optional

By default every declared option is present in `opts` (with its default). Mark an
option `optional: true` to **omit it entirely** when the user doesn't pass it:

```ts
cli.addOptions({
  tag: { type: "string", optional: true },
});
```

Now `opts.tag` only exists when the user actually passes `--tag`. Use this for
options where "not provided" is meaningfully different from "default value".

## Passing values on the command line

| Form                | Example              | Result                     |
| ------------------- | -------------------- | -------------------------- |
| Long, separate      | `--opt value`        | `opts.opt = "value"`       |
| Long, with `=`      | `--opt=value`        | `opts.opt = "value"`       |
| Long boolean        | `--force`            | `opts.force = true`        |
| Short, separate     | `-o value`           | `opts.opt = "value"`       |
| Short, with `=`     | `-o=value`           | `opts.opt = "value"`       |
| Combined booleans   | `-abc`               | three booleans set to true |

See [Parsing rules](/reference/parsing) for the exact algorithm.
