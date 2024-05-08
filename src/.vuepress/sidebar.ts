import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": {
    prefix: "cs-basics/",
    children: [
      "os/",
      "network/",
    ],
  },
  "/cs-basics/os/": "structure",
  "/cs-basics/network/": "structure",
});
