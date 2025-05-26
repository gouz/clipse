import { Clipse } from "../src";

  const sub = () => console.log("sub");
  const subsub = () => console.log("subsub");
  const subsubcli = new Clipse("sub", "a sub sub command");
  subsubcli.action(() => {
    subsub();
  });

  const subcli = new Clipse("sub", "a sub command");
  subcli.addSubcommands([subsubcli]).action(() => {
    sub();
  });

const mycli = new Clipse("mycli", "cli test", "v0.0.1");
mycli
    .addOptions({
    opt: {
        short: "o",
        default: "test",
        type: "string",
        description: "an option for test",
        optional: true,
    },
    bool: {
        default: true,
        type: "boolean",
        description: "a boolean option true per default",
        optional: false,
    },
    faux: {
        short: "f",
        type: "boolean",
        description: "a boolean option false per default",
    },
    })
    .addArguments([{ name: "arg", description: "an argument for test" }])
    .addSubcommands([subcli])
    .action((a, o) => {
        console.log({ a, o });
    }).ready();