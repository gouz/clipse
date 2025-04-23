# clipse

CLI Parsing So Easy

## Introduction

Clipse helps you to build a CLI Tool. It provides a simple and intuitive way to define and handle command-line arguments and options, making it easier to create powerful and user-friendly command-line tools.

```js
import { Clipse } from "clipse";

const subcli = new Clipse("sub");
subcli.addSubcommands([subsubcli]).action(() => {
  sub();
});

const mycli = new Clipse("mycli", "cli test", "version");
mycli
  .addOptions({
    opt: {
      short: "o",
      default: "test",
      type: "string",
      description: "an option for test",
    },
  })
  .addArguments([{ name: "arg", description: "an argument for test" }])
  .addSubcommands([subcli])
  .action((a, o) => {
    args = a;
    opts = o;
  });
```

Will done:

```
mycli version
cli test

Usage: mycli [options] [arguments]

Subcommands:
  sub   a sub command

Options:
  -h, --help      show help
  -v, --version   show version
  -o, --opt       an option for test  (default: test)

Arguments:
  arg   an argument for test
```

## Add Options

An option is defined with this following type:

```js
export type Clipse_Options = {
  [key: string]: {
    short?: string;
    long?: string;
    optional?: boolean;
    default?: string | boolean;
    description?: string;
    type?: "string" | "boolean";
  };
};
```

Then, if your CLI will have an option called `opt`, which can be shortened with `o`, you can declare your option like this:

```js
cli.addOptions({
  opt: {
    short: 'o',
  }
})
```

## Add Arguments

An argument is defined with this following type:

```js
export type Clipse_Argument = {
  name: string;
  description?: string;
};
```

Example:

Your CLI definition:

```js
const mycli = new Clipse("mycli", "cli test", "version");
mycli
  .addArguments([{ name: "arg", description: "an argument for test" }])
  .action((a, o) => {
    args = a;
    opts = o;
  });
```

If you call your cli like this:

```
mycli test
```

Then in the action function, your args will be :

```json
{
  "arg": "test"
}
```

## Add Subcommands

Clipse allows you to have sub commands with your Clipse

Attention, you must not name an argument like a subcommand !
