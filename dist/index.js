// src/index.ts
class Clipse {
  #name;
  #description = "";
  #version = "0.0.1";
  #options = {
    help: { short: "h", description: "show help", type: "boolean" },
    version: { short: "v", description: "show version", type: "boolean" }
  };
  #globalOptions = {};
  #shortMap = { h: "help", v: "version" };
  #arguments = [];
  #subcommands = [];
  #action = async () => {};
  #parent = "";
  #defaultcmd = null;
  constructor(name, description = "", version = "") {
    this.#name = name;
    this.#description = description;
    this.#version = version;
  }
  set name(name) {
    this.#name = name;
  }
  get name() {
    return this.#name;
  }
  set description(description) {
    this.#description = description;
  }
  get description() {
    return this.#description;
  }
  set version(version) {
    this.#version = version;
  }
  get version() {
    return this.#version;
  }
  #helpDesc(desc) {
    return `\x1B[3m${desc}\x1B[0m`;
  }
  #helpMain() {
    return `
\x1B[1;36m${this.#parent}${this.#name}\x1B[0m ${this.#version}
${this.#helpDesc(this.description)}
`;
  }
  #helpUsage() {
    return `
Usage: ${this.#parent}${this.#name} [options] [arguments]

`;
  }
  #helpSubs() {
    let subs = "";
    if (this.#subcommands.length) {
      const maxLength = Math.max(...this.#subcommands.map((s) => s.name.length)) + 2;
      subs = this.#subcommands.map((s) => `  \x1B[1m${s.name.padEnd(maxLength)}\x1B[0m ${this.#helpDesc(s.description)}
`).join("");
    }
    return subs !== "" ? `\x1B[4mSubcommands:\x1B[0m
${subs}
` : "";
  }
  #verboseOption(key, def) {
    const short = typeof def.short !== "undefined" ? `-${def.short}, ` : "";
    const param = def.type === "boolean" ? "" : " <param>";
    return `${short}--${key}${param}`;
  }
  #helpOptions() {
    const options = [
      ...Object.entries(this.#options),
      ...Object.entries(this.#globalOptions)
    ];
    const maxLength = Math.max(...options.map(([k, v]) => this.#verboseOption(k, v).length)) + 1;
    const opts = options.map(([k, v]) => [
      `  \x1B[1m${this.#verboseOption(k, v).padEnd(maxLength)}\x1B[0m`,
      this.#helpDesc(v.description ?? ""),
      ` ${typeof v.default !== "undefined" ? `(default: ${v.default})` : ""}`,
      `
`
    ].join(" ")).join("");
    return opts !== "" ? `\x1B[4mOptions:\x1B[0m
${opts}
` : "";
  }
  #helpArguments() {
    let args = "";
    if (this.#arguments.length) {
      const maxLength = Math.max(...this.#arguments.map((a) => a.name.length)) + 1;
      args = this.#arguments.map((a) => `  \x1B[1m${a.name.padEnd(maxLength)}\x1B[0m ${this.#helpDesc(a.description ?? "")}
`).join("");
    }
    return args !== "" ? `\x1B[4mArguments:\x1B[0m
${args}
` : "";
  }
  #helpCompletion() {
    return `
You can generate a completion script for your CLI by running:
\x1B[3m$ ${this.#name} generate-completion\x1B[0m
    `;
  }
  helpText() {
    return this.#helpMain() + this.#helpUsage() + this.#helpSubs() + this.#helpOptions() + this.#helpArguments() + this.#helpCompletion();
  }
  help() {
    console.log(this.helpText());
    process.exit(0);
  }
  #registerOptions(target, options) {
    for (const [k, v] of Object.entries(options)) {
      target[k] = v;
      if (typeof v.short !== "undefined")
        this.#shortMap[v.short] = k;
    }
  }
  addOptions(options = {}) {
    this.#registerOptions(this.#options, options);
    return this;
  }
  addGlobalOptions(options = {}) {
    this.#registerOptions(this.#globalOptions, options);
    return this;
  }
  addArguments(args) {
    this.#arguments.push(...args);
    return this;
  }
  addSubcommands(subcommands) {
    this.#subcommands.push(...subcommands);
    return this;
  }
  defineDefaultCommand(cmd) {
    this.#defaultcmd = cmd;
    return this;
  }
  action(a) {
    this.#action = a;
    return this;
  }
  #longFromShort(short) {
    const long = this.#shortMap[short];
    if (typeof long === "undefined")
      throw new Error(`Unknown option: -${short}`);
    return long;
  }
  #assertKnownLong(name) {
    if (typeof this.#options[name] === "undefined" && typeof this.#globalOptions[name] === "undefined")
      throw new Error(`Unknown option: --${name}`);
  }
  #parseShortOptions(argv, ar, options) {
    if (ar.includes("=")) {
      const [k, v] = ar.substring(1).split("=", 2);
      options[this.#longFromShort(k)] = v;
    } else {
      const shorts = ar.substring(1).split("");
      for (const [j, s] of shorts.entries()) {
        const long = this.#longFromShort(s);
        const def = this.#options[long];
        if (def?.type !== "boolean") {
          if (j === shorts.length - 1) {
            if (!argv[1]?.startsWith("-")) {
              options[long] = argv[1] ?? def?.default;
              argv.shift();
            } else {
              options[long] = def?.default;
            }
          } else {
            options[long] = def?.default;
          }
        } else {
          options[long] = true;
        }
      }
    }
    argv.shift();
  }
  #parseLongOptions(argv, ar, options) {
    const a = ar.substring(2);
    if (a.includes("=")) {
      const [k, v] = a.split("=", 2);
      this.#assertKnownLong(k);
      options[k] = v;
    } else {
      this.#assertKnownLong(a);
      if (this.#options[a]?.type !== "boolean") {
        if (argv.length === 1) {
          options[a] = this.#options[a]?.default;
        } else {
          options[a] = argv[1];
          argv.shift();
        }
      } else {
        options[a] = true;
      }
    }
    argv.shift();
  }
  #parseOptions(argv) {
    const options = {};
    const args = [];
    while (argv.length) {
      const ar = argv[0] ?? "";
      if (ar.startsWith("--"))
        this.#parseLongOptions(argv, ar, options);
      else if (/^-[A-Za-z0-9=]+$/.test(ar))
        this.#parseShortOptions(argv, ar, options);
      else
        args.push(argv.shift() ?? "");
    }
    return { options, args };
  }
  #parseArguments(argv) {
    const args = {};
    for (const a of this.#arguments) {
      if (argv.length)
        args[a.name] = argv.shift();
    }
    return args;
  }
  getGenerationCompletionLine() {
    const allOptions = { ...this.#options, ...this.#globalOptions };
    return [
      ...new Set([
        ...this.#subcommands.map((c) => c.name),
        ...Object.keys(allOptions).map((o) => `--${o}`),
        ...Object.values(allOptions).map((o) => o.short ?? "").filter((f) => f !== "").map((o) => `-${o}`)
      ])
    ].join(" ");
  }
  generateCompletionScript() {
    return `
#!/usr/bin/env bash
_${this.#name}_completions()
{
    local cur prev

    cur=\${COMP_WORDS[COMP_CWORD]}
    prev=\${COMP_WORDS[COMP_CWORD-1]}

    case \${COMP_CWORD} in
        1)
            COMPREPLY=($(compgen -W "${this.getGenerationCompletionLine()}" -- \${cur}))
            ;;
        2)
            case \${prev} in
                ${this.#subcommands.map((s) => `
                ${s.name})
                    COMPREPLY=($(compgen -W "${s.getGenerationCompletionLine()}" -- \${cur}))
                    ;;
                `).join(`
`)}
            esac
            ;;
        *)
            COMPREPLY=()
            ;;
    esac
}
complete -F _${this.#name}_completions ${this.#name}
`;
  }
  #generateCompletion() {
    console.log(`Copy this into ~/.clipse.${this.#name}.bash`);
    console.log(this.generateCompletionScript());
    console.log(`Then execute: source ~/.clipse.${this.#name}.bash`);
  }
  async ready(argv = [], parent = "") {
    this.#parent = parent;
    if (argv.length === 0 && parent === "")
      argv.push(...process.argv.slice(2));
    const options = {};
    for (const [key, value] of Object.entries(this.#options)) {
      if ((typeof value.optional === "undefined" || !value.optional) && !["help", "version"].includes(key))
        options[key] = value.default ?? (value.type === "boolean" ? false : "");
    }
    if (argv.length) {
      if (argv[0] === "-h" || argv[0] === "--help") {
        this.help();
      }
      if (argv[0] === "-v" || argv[0] === "--version") {
        console.log(this.#version);
        process.exit(0);
      }
      const sub = this.#subcommands.find((s) => s.name === argv[0]);
      if (sub) {
        argv.shift();
        sub.addOptions(this.#globalOptions);
        await sub.ready(argv, `${this.#parent}${this.#name} `);
      } else if (argv[0] === "generate-completion") {
        this.#generateCompletion();
        process.exit(0);
      } else if (this.#defaultcmd) {
        this.#defaultcmd.addOptions(this.#globalOptions);
        await this.#defaultcmd.ready(argv, `${this.#parent}${this.#name} `);
      } else {
        const parsedOptions = this.#parseOptions([...argv]);
        const opts = {
          ...options,
          ...parsedOptions.options
        };
        const args = this.#parseArguments([...parsedOptions.args]);
        await this.#action(args, opts);
      }
    } else if (this.#defaultcmd) {
      this.#defaultcmd.addOptions(this.#globalOptions);
      await this.#defaultcmd.ready(argv, `${this.#parent}${this.#name} `);
    } else
      await this.#action({}, options);
  }
}
export {
  Clipse
};
