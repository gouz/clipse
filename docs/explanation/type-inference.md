# Type inference

The defining feature of clipse is that the options and arguments you declare are
inferred into the `action` callback. This page explains how that works, so the
compile-time errors you see make sense.

## The goal

Given this code:

```ts
new Clipse("app")
  .addOptions({ opt: { type: "string" }, verbose: { type: "boolean" } })
  .addArguments([{ name: "file" }])
  .action((args, opts) => {
    opts.opt;      // string
    opts.verbose;  // boolean
    args.file;     // string | undefined
    opts.nope;     // ❌ compile error
  });
```

`opts` and `args` are precisely typed, and a typo is a compile error — with no type
annotations written by hand.

## How it is built

### The class carries two type parameters

```ts
class Clipse<TOpts, TArgs> { … }
```

`TOpts` is the accumulated shape of the options, `TArgs` the shape of the
arguments. A fresh `new Clipse("app")` starts with both empty.

### `addOptions` grows `TOpts`

`addOptions` is generic over the exact object you pass and returns a `Clipse` whose
`TOpts` is intersected with the newly inferred options:

```ts
addOptions<const O extends ClipseOptions>(
  options: O,
): Clipse<TOpts & InferOptions<O>, TArgs>
```

The `const` type parameter preserves the literal shape of your object (so
`type: "boolean"` stays the literal `"boolean"`, not the widened `string`).
`InferOptions` then maps each option to its value type:

```ts
type OptionValue<O extends ClipseOption> =
  O["type"] extends "boolean" ? boolean : string;

type InferOptions<O extends ClipseOptions> = {
  [K in keyof O]: OptionValue<O[K]>;
};
```

### `addArguments` grows `TArgs`

Similarly, `addArguments` uses a `const` parameter to capture literal argument
names and maps them to keys:

```ts
type InferArguments<A extends readonly ClipseArgument[]> = {
  [K in A[number]["name"]]: string;
};
```

### `action` consumes both

Finally, `action` requires a callback typed from the accumulated shapes:

```ts
action(a: ClipseFunction<TArgs, TOpts>): this
```

Because each builder step returns a `Clipse` with updated type parameters, by the
time you call `action` the compiler knows every option and argument you declared.

## Why unknown keys are rejected

The empty starting shape is a plain object type with **no index signature**. If it
were `Record<string, …>`, an index signature would make `opts.anything` legal.
Using an index-signature-free empty type means only the keys you actually declared
exist on `opts` and `args` — so `opts.nope` is a genuine error.

## The intentional soft spot

`opts` values are typed as always-present (`string`/`boolean`), even though an
option marked `optional: true` may be absent at runtime. This is a deliberate
trade-off: modelling optionality precisely in the type would complicate every
signature for a case you can handle with a normal `?? fallback`. If you need the
"absent" state, mark the option `optional: true` and treat its value as possibly
`undefined` in your own code.
