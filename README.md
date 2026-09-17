# Ethereum RPC knowledge map

A dependency-free field guide to Ethereum RPC. The map sits on top, the lesson sits below it, and every term a lesson introduces is its own node you can open. Nothing is explained twice: if a word needs explaining, it gets a leaf.

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

**Focus** is the default view. The topic you are reading sits in the middle, the terms it links to form a ring around it, and each of those shows a few of its own leaves in a dashed outer ring. Click any node to re-centre the map there. The tree is laid out to match the shape of the map pane, so a wide short pane gets a wide flat tree.

A well-connected lesson can name thirty terms, which would shrink every label past reading size, so the ring keeps the eighteen most relevant and the centre node counts the rest. The order is the topic you came from first, then the lesson's own read-next list, then terms in order of first mention. Nothing is lost: every term is one click away in the lesson's term list, and in search.

**Overview** shows all topics at once, clustered by category around the root. Press `f` to switch views.

The topic you arrived from stays on the map, on the left, marked *you came from here* with an orange edge, even when the new lesson does not link back to it. The breadcrumb above the map is the same path in text, and every step in it is clickable.

Drag the bar between map and lesson to resize; the split is remembered. Drag the canvas to pan, scroll to zoom, `Fit` frames everything.

## Learning state

Every node carries a tick or a cross, and every link in the lesson text is coloured: **green with a tick** means learned, **red with a dashed underline** means not yet. Category chips along the bottom of the map count how far you are through each layer.

A topic becomes learned only by passing its checkpoint. Press `Take the checkpoint` or hit `q`.

- Five questions, drawn from that lesson. All five must be right.
- You are never told *which* answers were wrong, only how many you got right.
- Each question's options stay inert for a couple of seconds, so clicking through a checkpoint in four seconds is not possible.
- A failed attempt locks the checkpoint for 20 seconds, doubling with each consecutive failure up to five minutes, and reshuffles both the questions and the option order.
- The correct answer is never written into the page, so reading the DOM does not help.

Questions come from the topic's own `quiz` array when it has one, topped up with questions generated from the lesson: fill the gap in a sentence, pick the definition, spot the real pitfall. Bookmarks, learned topics, the split position, and the contrast toggle live in browser storage.

`/` focuses search, `Escape` clears it, `Backspace` goes back, `q` opens the checkpoint, `f` toggles the view.

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
