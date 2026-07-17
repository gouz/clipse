import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "clipse",
  description: "CLI parsing so easy — a tiny, type-safe CLI builder for Bun & Node.",
  lang: "en-US",

  // Deployed at https://gouz.github.io/clipse/
  base: "/clipse/",

  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    nav: [
      { text: "Tutorials", link: "/tutorials/" },
      { text: "How-to", link: "/how-to/" },
      { text: "Reference", link: "/reference/" },
      { text: "Explanation", link: "/explanation/" },
      { text: "npm", link: "https://www.npmjs.com/package/clipse" },
    ],

    sidebar: {
      "/tutorials/": [
        {
          text: "Tutorials",
          items: [
            { text: "Overview", link: "/tutorials/" },
            { text: "Build your first CLI", link: "/tutorials/first-cli" },
          ],
        },
      ],
      "/how-to/": [
        {
          text: "How-to guides",
          items: [
            { text: "Overview", link: "/how-to/" },
            { text: "Add options", link: "/how-to/options" },
            { text: "Add arguments", link: "/how-to/arguments" },
            { text: "Add subcommands", link: "/how-to/subcommands" },
            { text: "Set a default command", link: "/how-to/default-command" },
            { text: "Share global options", link: "/how-to/global-options" },
            { text: "Generate shell completion", link: "/how-to/completion" },
            { text: "Compile a standalone binary", link: "/how-to/compile" },
          ],
        },
      ],
      "/reference/": [
        {
          text: "Reference",
          items: [
            { text: "Overview", link: "/reference/" },
            { text: "Clipse class", link: "/reference/clipse" },
            { text: "Types", link: "/reference/types" },
            { text: "Parsing rules", link: "/reference/parsing" },
          ],
        },
      ],
      "/explanation/": [
        {
          text: "Explanation",
          items: [
            { text: "Overview", link: "/explanation/" },
            { text: "Design philosophy", link: "/explanation/design" },
            { text: "Type inference", link: "/explanation/type-inference" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/gouz/clipse" },
    ],

    editLink: {
      pattern: "https://github.com/gouz/clipse/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © gouz",
    },
  },
});
