# Parsing rules

This page describes exactly how `ready()` turns a list of arguments into the
`args` and `opts` your `action` receives.

## Dispatch order

`ready(argv)` checks, in order:

1. `argv[0]` is `-h` or `--help` → print help and exit.
2. `argv[0]` is `-v` or `--version` → print the version and exit.
3. `argv[0]` matches a subcommand name → dispatch to that subcommand with the rest
   of `argv`.
4. `argv[0]` is `generate-completion` → write the completion script to
   `~/.clipse.<name>.bash`, source it from `~/.bashrc`, and exit.
5. A default command is defined → run it with `argv`.
6. Otherwise → parse `argv` and run this command's `action`.

## Options

An entry is treated as an option when it starts with `-`.

### Long options (`--name`)

| Input           | Result                                             |
| --------------- | -------------------------------------------------- |
| `--opt value`   | `opts.opt = "value"` (consumes the next entry)     |
| `--opt=value`   | `opts.opt = "value"`                               |
| `--flag`        | `opts.flag = true` (when `flag` is a boolean)      |
| `--opt` (last)  | `opts.opt = default` (no value available)          |

### Short options (`-x`)

Short entries match `-` followed by letters, digits, and `=`.

| Input           | Result                                                        |
| --------------- | ------------------------------------------------------------ |
| `-o value`      | `opts.opt = "value"`                                          |
| `-o=value`      | `opts.opt = "value"`                                          |
| `-f`            | `opts.faux = true` (when `f` maps to a boolean)              |
| `-abc`          | three booleans set to `true`                                  |
| `-ab value`     | booleans `a`,`b` set to `true`; `value` assigned to last non-boolean |

Short flags are resolved to their long name through the option's `short` field.
Passing an unknown option throws `Unknown option: -x` / `Unknown option: --name`.

## Arguments

Anything not starting with `-` is a positional value. Positionals are assigned to
the declared arguments **in order**:

```ts
cli.addArguments([{ name: "a" }, { name: "b" }]);
// mycli x y  →  args = { a: "x", b: "y" }
```

If fewer positionals are given than declared, the trailing arguments are
`undefined`. Extra positionals beyond the declared arguments are ignored.

## Defaults

Before parsing, every declared option (except `help`, `version`, and any marked
`optional: true`) is seeded with its value:

- an explicit `default`, otherwise
- `false` for a boolean option, or
- `""` for a string option.

Options marked `optional: true` are **not** seeded — they appear in `opts` only if
the user actually passes them.
