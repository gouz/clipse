# Generate shell completion

clipse ships a **bash** completion generator. Every CLI automatically gains a
built-in `generate-completion` subcommand.

## Generate and install it

```sh
$ mycli generate-completion
```

This does everything for you:

1. Writes the completion script to `~/.clipse.mycli.bash`.
2. Adds `source ~/.clipse.mycli.bash` to your shell's startup file (once) so every
   new shell picks it up. The file is chosen from `$SHELL`: `~/.zshrc` for zsh,
   otherwise `~/.bashrc`.
3. Tells you the command to run to enable it in the current shell.

```
Completion script written to /home/you/.clipse.mycli.bash
Added "source /home/you/.clipse.mycli.bash" to /home/you/.zshrc
To enable completion in the current shell, run: source /home/you/.clipse.mycli.bash
```

The script is bash syntax, but it works under **zsh** too: it loads zsh's
`bashcompinit` shim automatically when sourced from a zsh shell.

A running process cannot `source` into its parent shell, so the last step is left
for you to run once in the current terminal:

```sh
source ~/.clipse.mycli.bash
```

Now pressing <kbd>Tab</kbd> completes your subcommands and options:

```sh
$ mycli <Tab>
sub   --help   --version   --opt   -o
```

Completion covers the first level (subcommands and the top-level options) and the
second level (each subcommand's options).

## Generate it programmatically

If you need the script as a string — to write it during an install step, for
example — call `generateCompletionScript()`:

```ts
import { writeFileSync } from "node:fs";
import { Clipse } from "clipse";

const cli = new Clipse("mycli", "…", "1.0.0").addSubcommands([/* … */]);
writeFileSync("mycli-completion.bash", cli.generateCompletionScript());
```

Unlike the `generate-completion` subcommand, `generateCompletionScript()` has no
side effects: it neither prints nor exits.
