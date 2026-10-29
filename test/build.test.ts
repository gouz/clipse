import { describe, expect, it } from "bun:test";
import { defaultBuildConfig } from "../build";

describe("build", () => {
  it("should keep node builtins as real imports", async () => {
    const { outputs } = await Bun.build({
      ...defaultBuildConfig,
      outdir: undefined,
      format: "esm",
    });
    const code = await outputs[0]?.text();
    expect(code).toContain('from "node:fs"');
    expect(code).toContain('from "node:os"');
  });
});
