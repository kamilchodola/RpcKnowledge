# Ethereum RPC knowledge map

A dependency-free field guide to Ethereum RPC. The map fills the left of the screen, the lesson reads down the right, and every term a lesson introduces is its own node you can open. Nothing is explained twice: if a word needs explaining, it gets a leaf.

## Run it

Needs Node.js 20.5 or newer.

```sh
npm start
```

The server prints every address it is reachable on:

```
Ethereum RPC map listening on 0.0.0.0:4173
  local    http://127.0.0.1:4173
  network  http://192.168.18.19:4173
```

It binds to all interfaces so other devices on the same network can open it. Set `HOST=127.0.0.1` to keep it on this machine, or `PORT` to move it.

## How the map works

The map shows every topic at once, clustered by category around the Ethereum RPC root. It never rearranges: each topic keeps its place, so you learn where things live.

Opening a topic moves the camera to it. From far out, where the labels are too small to read, it flies in to reading distance, pulling back slightly on long hops so you can see the route. From closer in it only pans, so a zoom you chose yourself is kept. Opening a category frames its whole cluster. `Home` and `Fit` return to the full map. The lines from the open topic run to every term its lesson links to.

The map takes roughly seventy percent of the width and the lesson thirty. Drag the bar between them to change that, double-click it to reset, or focus it and use the left and right arrow keys. The width is remembered. Below 1000 pixels the two stack instead, map above lesson.

The topic you arrived from stays on the map, marked *you came from here* with a flowing orange edge, even when the new lesson does not link back to it. The breadcrumb above the map is the same path in text, and every step in it is clickable.

Drag the canvas to pan, scroll to zoom, `Fit` frames everything.

The app is dark by default, because a luminous graph on a dark canvas is easier to read than dark ink on paper. The ◐ button switches to the light theme and remembers the choice; with no choice saved it follows your system setting.

## Learning state

Every node carries a tick or a cross, and every link in the lesson text is coloured: **green with a tick** means learned, **red with a dashed underline** means not yet. Category chips along the bottom of the map count how far you are through each layer.

A topic becomes learned only by passing its checkpoint. Press `Take the checkpoint` or hit `q`.

- Five questions, drawn from that lesson. All five must be right.
- You are never told *which* answers were wrong, only how many you got right.
- Each question's options stay inert for a couple of seconds, so clicking through a checkpoint in four seconds is not possible.
- A failed attempt locks the checkpoint for 20 seconds, doubling with each consecutive failure up to five minutes, and reshuffles both the questions and the option order.
- The correct answer is never written into the page, so reading the DOM does not help.

Questions come from the topic's own `quiz` array when it has one, topped up with questions generated from the lesson: fill the gap in a sentence, pick the definition, spot the real pitfall. Bookmarks, learned topics, the split position, and the theme live in browser storage.

`/` focuses search, `Escape` clears it, `Backspace` goes back, `q` opens the checkpoint.

Animations are on by default, including on systems set to reduce motion. The ⏵ button in the toolbar switches them off and remembers the choice.

## Content

`knowledge.js` is the dataset the browser loads. `data/` holds the per-category source files and `data/categories.js` the eleven layers: foundations, protocol data, requests, clients, nodes and networking, consensus, indexing, proofs and verification, layer 2 and scaling, operations, and wallets and tooling.

A topic record looks like this:

```js
{
  id: "eth-call",
  title: "eth_call",
  category: "requests",
  aliases: ["call", "simulate"],
  summary: "One sentence that defines the term, with [[state|links]] and `code`.",
  sections: [{ heading: "What it does", paragraphs: ["…", "…"] }],
  example: { title: "…", language: "json", code: "…", note: "…" },
  pitfalls: ["A concrete mistake and what to do instead."],
  quiz: [{ question: "…?", options: ["…", "…", "…", "…"], answer: 0 }],
  related: ["state", "archive-node"],
  sources: [{ title: "…", url: "https://…" }],
}
```

`[[topic-id|Visible label]]` becomes a safe button, never injected HTML. Text in backticks becomes inline code. A link to the topic you are already reading renders as plain text.

## Sharing it from your machine

```sh
npm run share
```

That builds the site, serves `dist/` on `127.0.0.1` only, and opens a Cloudflare quick tunnel to it. It prints a public address:

```
  Public address
  https://some-random-words.trycloudflare.com
```

Anyone with that link can open the map until you press Ctrl+C. It needs no Cloudflare account and costs nothing. It needs `cloudflared` installed once:

```sh
winget install --id Cloudflare.cloudflared
```

The tunnel dials out to Cloudflare rather than accepting connections, so it needs no router port forward and no firewall rule, and your public IP never appears. Because the server listens on loopback, nothing is exposed on your local network either. Only `dist/` is served, with the same security headers as a Pages deployment, and a test checks that the dev server, notes, and tests all return 404 through it.

Two limits. The address is random and changes on every run, and quick tunnels come with no uptime guarantee, so this is for showing someone the map, not hosting it. For a stable address, deploy to Cloudflare Pages as below, or use a named tunnel, which is also free but needs a Cloudflare account and a domain on it.

If a freshly printed address fails to resolve on your own machine for a minute, that is your local DNS having cached the name as missing from before the tunnel came up. Other people are unaffected.

## Publishing

The map is static, so it needs no server in production.

```sh
npm run build
```

That writes `dist/`, which holds only the files the site needs: the page, the styles, the favicon, the dataset, `src/`, and `data/`, plus a `_headers` file. The dev server, the tests, and these notes are not published. The publish list lives in [scripts/build.js](scripts/build.js) and a test asserts it never grows to include them, so adding a file to the repo does not put it on the internet until someone adds it to that list.

`_headers` is read by Cloudflare Pages. It sets `nosniff`, a referrer policy, frame and permissions policies, and a content security policy that allows no inline script, no `eval`, and no third-party code beyond the Google Fonts stylesheet and its font files.

Deploying on Cloudflare Pages from this repo:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npm run build` |
| Output directory | `dist` |

Nothing else needs configuring. Routing is hash-based, so no redirect or 404 rules are required, and the page makes no network calls of its own.

## Known issues and gaps

[KNOWN-ISSUES.md](KNOWN-ISSUES.md) is the running log: Ethereum spec inconsistencies and unspecified behaviour found while writing the lessons, client quirks worth knowing, terms the map still owes a node, facts nobody could confirm, and work left in this repo. Add to it as soon as something turns up rather than later.

The gap list names each wanted term as a slug, and a test asserts none of those slugs already exists as a topic, so an entry cannot quietly go stale after the topic is written.

## Checks

```sh
npm test
```

The suite covers the static server, including MIME types and traversal protection, and the dataset: unique slugs, resolvable links, no self-links, at least three onward paths per topic, real source URLs, every topic reachable from the root, no topic that nothing links to, and no orphaned dead ends. It also exercises the checkpoint generator against every topic, checking that each one yields enough questions, that options are distinct and non-empty, that the prompt never contains its own answer, and that a retry reshuffles the attempt.

Topics written against the section schema are additionally held to a depth bar: at least two headed sections, 240 words of lesson, an example for every request method.
