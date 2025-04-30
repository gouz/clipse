import { describe, it, expect, mock, spyOn, beforeEach } from "bun:test";
import { Clipse } from "../src";

describe("clipse", () => {
  type t = { [key: string]: string | boolean | undefined };
  let args: t = {};
  let opts: t = {};
  const sub = mock(() => true);
  const subsub = mock(() => true);
  const subsubcli = new Clipse("sub", "a sub sub command");
  subsubcli.action(() => {
    subsub();
  });

  const subcli = new Clipse("sub", "a sub command");
  subcli.addSubcommands([subsubcli]).action(() => {
    sub();
  });

  let mycli: Clipse;

  beforeEach(() => {
    mycli = new Clipse("mycli", "cli test", "v0.0.1");
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
          type: "boolean",
          description: "a boolean option false per default",
        },
      })
      .addArguments([{ name: "arg", description: "an argument for test" }])
      .addSubcommands([subcli])
      .action((a, o) => {
        args = a;
        opts = o;
      });
  });

  it("should give me the name of the cli", () => {
    expect(mycli.name).toEqual("mycli");
  });

  it("should change the name of the cli", () => {
    mycli.name = "test";
    expect(mycli.name).toEqual("test");
  });

  it("should give me the description of the cli", () => {
    expect(mycli.description).toEqual("cli test");
  });

  it("should change the description of the cli", () => {
    mycli.description = "test";
    expect(mycli.description).toEqual("test");
  });

  it("should give me the version of the cli", () => {
    expect(mycli.version).toEqual("v0.0.1");
  });

  it("should change the version of the cli", () => {
    mycli.version = "test";
    expect(mycli.version).toEqual("test");
  });

  it("should show the help", () => {
    const spy = spyOn(mycli, "help");
    spyOn(process, "exit").mockImplementation(
      (_?: string | number | null | undefined) => undefined as never,
    );
    mycli.ready(["-h"]);
    expect(spy).toHaveBeenCalled();
  });

  it("should give me arguments and options", () => {
    mycli.ready(["--opt", "plop", "plip"]);
    expect(args).toEqual({ arg: "plip" });
    expect(opts).toEqual({ opt: "plop", bool: true, faux: false });
  });

  it("should give me arguments and options without equals sign", () => {
    mycli.ready(["plip", "--opt", "plop"]);
    expect(args).toEqual({ arg: "plip" });
    expect(opts).toEqual({ opt: "plop", bool: true, faux: false });
  });

  it("should give me arguments and options with default value", () => {
    mycli.ready(["plip", "--opt"]);
    expect(args).toEqual({ arg: "plip" });
    expect(opts).toEqual({ opt: "test", bool: true, faux: false });
  });

  it("should give me arguments and options with default value and short call", () => {
    mycli.ready(["plip", "-o"]);
    expect(args).toEqual({ arg: "plip" });
    expect(opts).toEqual({ opt: "test", bool: true, faux: false });
  });

  it("should give me arguments and options with short call", () => {
    mycli.ready(["-o", "plop", "plip"]);
    expect(args).toEqual({ arg: "plip" });
    expect(opts).toEqual({ opt: "plop", bool: true, faux: false });
  });

  it("should give me arguments and options with short call", () => {
    mycli.ready(["plip", "-o", "plop"]);
    expect(args).toEqual({ arg: "plip" });
    expect(opts).toEqual({ opt: "plop", bool: true, faux: false });
  });

  it("should not call the sub cli", () => {
    mycli.ready(["plop"]);
    expect(sub).not.toBeCalled();
  });

  it("should call the sub sub cli", () => {
    mycli.ready(["sub", "sub"]);
    expect(subsub).toBeCalled();
  });

  it("should call the sub cli", () => {
    mycli.ready(["sub"]);
    expect(sub).toBeCalled();
  });

  it("should capture options with equals", () => {
    mycli.ready(["plip", "-o=plop"]);
    expect(args).toEqual({ arg: "plip" });
    expect(opts).toEqual({ opt: "plop", bool: true, faux: false });
  });

  it("should capture options with equals", () => {
    mycli.ready(["plip", "--opt=plop"]);
    expect(args).toEqual({ arg: "plip" });
    expect(opts).toEqual({ opt: "plop", bool: true, faux: false });
  });

  it("should set boolean options to true", () => {
    mycli.ready(["plip", "--opt=plop", "--faux"]);
    expect(args).toEqual({ arg: "plip" });
    expect(opts).toEqual({ opt: "plop", faux: true, bool: true });
  });

  it("should not return optional parameters", () => {
    mycli.addOptions({
      option: {
        optional: true,
        type: "boolean",
        default: false,
      },
      optchar: {
        type: "string",
        default: "I'm here",
      },
      optcharnotopt: {
        type: "string",
        default: "I'm not here",
        optional: false,
      },
    });
    mycli.ready(["plip"]);
    expect(args).toEqual({ arg: "plip" });
    expect(opts).toEqual({
      bool: true,
      faux: false,
      optchar: "I'm here",
      optcharnotopt: "I'm not here",
    });
  });
});
