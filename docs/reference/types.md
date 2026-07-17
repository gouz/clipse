# Types

All types are exported from the package entry point.

## ClipseOption

A single option definition. It is a **discriminated union** on `type`, so a boolean
option carries a boolean default and a string option a string default.

```ts
type ClipseOptionBase = {
  short?: string;
  optional?: boolean;
  description?: string;
};

type ClipseOption =
  | (ClipseOptionBase & { type: "boolean"; default?: boolean })
  | (ClipseOptionBase & { type?: "string"; default?: string });
```

| Field         | Type                     | Description                                             |
| ------------- | ------------------------ | ------------------------------------------------------ |
| `short`       | `string`                 | Single-character shorthand (e.g. `"o"` for `-o`).      |
| `type`        | `"string"` \| `"boolean"`| Value type. Defaults to `"string"`.                    |
| `default`     | `string` \| `boolean`    | Value when the option is not passed (matches `type`).  |
| `optional`    | `boolean`                | If `true`, the option is omitted from `opts` when not passed instead of defaulted. |
| `description` | `string`                 | Shown in `--help`.                                     |

## ClipseOptions

A map of option definitions keyed by long name.

```ts
type ClipseOptions = Record<string, ClipseOption>;
```

## ClipseArgument

A positional argument definition.

```ts
type ClipseArgument = {
  name: string;
  description?: string;
};
```

## ClipseFunction

The action callback. `args` and `opts` are typed from the arguments and options
you declared, so keys and value types are checked at compile time.

```ts
type ClipseFunction<TArgs, TOpts> = (
  args: { [K in keyof TArgs]?: string },
  opts: TOpts,
) => void | Promise<void>;
```

- `args` values are `string | undefined` (a positional may be missing).
- `opts` values are `string` or `boolean`, per each option's `type`.
- The callback may be synchronous or return a `Promise`.

## Deprecated aliases

The following names are kept for backward compatibility and will be removed in a
future major version. Prefer the `ClipseXxx` names above.

```ts
type Clipse_Options  = ClipseOptions;   // @deprecated
type Clipse_Argument = ClipseArgument;  // @deprecated
type Clipse_Function = ClipseFunction;  // @deprecated
```
