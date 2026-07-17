# Add arguments

Positional arguments are the unnamed values a user types after the command. Declare
them with `addArguments`, in order.

```ts
const mycli = new Clipse("mycli", "cli test", "1.0.0")
  .addArguments([{ name: "arg", description: "an argument for test" }])
  .action((args) => {
    console.log(args);
  });
```

Call it:

```sh
$ mycli test
```

Inside `action`, `args` is:

```json
{ "arg": "test" }
```

## Multiple arguments

Arguments are matched to positional values **in the order you declare them**:

```ts
cli.addArguments([
  { name: "source" },
  { name: "destination" },
]);
```

```sh
$ mycli a.txt b.txt
# args = { source: "a.txt", destination: "b.txt" }
```

## Typing

Each declared argument becomes a key on `args`, typed as `string | undefined`
(a value is `undefined` when the user provides fewer positionals than declared):

```ts
.action((args) => {
  args.source;      // string | undefined
  args.missing;     // ❌ compile error — not a declared argument
})
```

Guard against missing values with a default:

```ts
const dest = args.destination ?? ".";
```

::: warning
Don't give an argument the same name as a subcommand. If the first word matches a
subcommand, clipse dispatches to that subcommand instead of treating it as an
argument.
:::
