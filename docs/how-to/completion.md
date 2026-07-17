# Generate shell completion

clipse ships a **bash** completion generator. Every CLI automatically gains a
built-in `generate-completion` subcommand.

## Generate the script

```sh
$ mycli generate-completion
```

This prints instructions and a completion script:

```
Copy this into ~/.clipse.mycli.bash
#!/usr/bin/env bash
_mycli_completions()
{
    ...
}
complete -F _mycli_completions mycli
Then execute: source ~/.clipse.mycli.bash
```

## Install it

Save the script and source it from your shell profile:

```sh
mycli generate-completion > ~/.clipse.mycli.bash
echo "source ~/.clipse.mycli.bash" >> ~/.bashrc
source ~/.bashrc
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
