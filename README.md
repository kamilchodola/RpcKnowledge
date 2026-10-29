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

The map shows every topic at once, clustered by category around the Ethereum RPC root. It never rearranges: each topic keeps its place, so you learn where things live. Within a cluster, topics sit in learning-path order, so the inner ring holds what to read first.

Opening a topic moves the camera to it. From far out, where the labels are too small to read, it flies in to reading distance, pulling back slightly on long hops so you can see the route. From closer in it only pans, so a zoom you chose yourself is kept. Opening a category frames its whole cluster. `Home` and `Fit` return to the full map. The lines from the open topic run to every term its lesson links to.

The map takes roughly seventy percent of the width and the lesson thirty. Drag the bar between them to change that, double-click it to reset, or focus it and use the left and right arrow keys. The width is remembered.

On a phone, or any screen 1000 pixels wide or less, the map and the lesson each take the whole screen, and the tab bar at the bottom switches between them; the lesson tab names the open topic. Tapping a tile, a search result, or a saved topic opens its lesson. On the map one finger pans, two fingers pinch to zoom, and tapping empty map zooms straight in to a size where labels can be read and tiles tapped. The phone's back gesture steps back through the topics read, because every topic opened is a browser history entry. The checkpoint fills the screen, and the player's speed, voice, and stop settings fold away behind ⋯.

The topic you arrived from stays on the map, marked *you came from here* with a flowing orange edge, even when the new lesson does not link back to it. The breadcrumb above the map is the same path in text, and every step in it is clickable.

Drag the canvas to pan, scroll to zoom, `Fit` frames everything.

The app is dark by default, because a luminous graph on a dark canvas is easier to read than dark ink on paper. The ◐ button switches to the light theme and remembers the choice; with no choice saved it follows your system setting.

## The learning path

Every topic has a number: its place on a suggested reading order through the whole map, from 1, the Ethereum RPC root, to the last. The number sits on the top left of each tile, on the lesson as `Step 17 of 290`, on category pages, and in search results. The order runs in twenty stages, from what RPC is, through the data model, reading and writing, events, tracing, clients, proof of stake, nodes, and operations, to proofs, layer 2, and wallets.

`Map` and `Roadmap` in the map's toolbar switch between the two views, and `r` does the same. The roadmap lays the same tiles out as a page: one band per stage, its marker on the left and its topics in order to the right, joined by a line that turns green as you learn them. Switching views slides each tile from its cluster to its place on the path and back.

The first topic on the path you have not learned is ringed in amber in both views, and `Next up` in the roadmap's toolbar opens it. Each lesson ends with the previous and next topics on the path, and `n` and `p` step along it. Clicking a stage marker, or the step pill on a lesson, opens that stage's reading list, with its blurb, its topics in order, and how long it takes to listen to. Passing a checkpoint offers the next unlearned topic on the path.

The order lives in [data/roadmap.js](data/roadmap.js). It follows the lessons' own links: the terms a topic's summary links to come earlier on the path wherever that does not break a stage apart, so most definitions only use words already covered. The exceptions are mostly overviews, such as the root, that introduce terms taught later.

## Listening

Any lesson can be read aloud, and the whole map can be played through like an audiobook, about fourteen hours at normal speed.

- `Listen` on a lesson reads it from the top: the title, the summary, each section, the example's title and note (never its code), and the pitfalls. Each section heading has its own ▶ to start from there.
- The paragraph being read is highlighted, and the lesson scrolls to keep it in view for as long as you are following. Scroll away to read something else and it leaves the page alone.
- `Stop after` in the player sets where playback stops: at the end of the section, at the end of the topic, or not at all. `Whole path` plays topic after topic in path order to the end, announcing each stage like a chapter, and the map and lesson follow along while you are watching the topic being read.
- The player skips back and forward a sentence or two at a time, or a whole topic, and sets the speed and the voice. `l` plays and pauses.
- The position is saved on every sentence. After a reload, the headphones button in the top bar picks up where you stopped. Nothing plays until you press play.

It uses the browser's own speech engine, so it needs no audio files and the page itself makes no network calls. Voice quality depends on the browser: Edge's "Natural" voices and Chrome's Google voices are far better than the older system voices, and the best English one is chosen by default. Those voices are online services run by the browser's maker, so the text being read goes to them; the system voices run on the device and work offline. If an online voice fails, playback switches to a device voice. Phones usually stop speech when the screen locks.

## Languages

`EN | PL` in the top bar switches the whole page between English and Polish, and the choice is remembered. A link can choose a language with `?lang=pl`. Switching reloads the page on the same topic.

Everything is translated: the interface, all 290 lessons, and all 1,740 checkpoint questions. The Polish is written the way Polish Ethereum developers talk: Polish sentences, everyday Polish words where they are the norm (węzeł, blok, transakcja, portfel), and the established English term where that is what people say (receipt, event, batch, cache, head, snapshot, health check). A few words keep one meaning across the app: *stan* is Ethereum state, *temat* is a lesson, *potwierdzenia* are block confirmations, and *test* is the checkpoint.

Narration uses a Polish voice for Polish lessons (in Edge, *Marek Online (Natural)* or *Zofia Online (Natural)*) and remembers a voice per language. A lesson added later without its Polish text fails the tests; the app itself would show such a lesson in English, say so above its summary, and narrate it with an English voice. Search in Polish still finds a topic by its English title. Learned topics, bookmarks, and the listening position are shared between languages.

The translation lives in `data/pl/`: `interface.js` holds the interface strings, keyed by the English text the code passes to `t()`; `categories.js` and `roadmap.js` the category and stage names; and `<category>.js` with `quizzes/<category>.js` the lessons and checkpoints, keyed by topic id. A translated lesson holds only words. Its links keep their topic ids, its inline code stays byte for byte, and its related topics, sources, and example code come from the English record, so the two can never drift apart in anything but language.

## Learning state

Every node carries a tick or a cross, and every link in the lesson text is coloured: **green with a tick** means learned, **red with a dashed underline** means not yet. Category chips along the bottom of the map count how far you are through each layer.

A topic becomes learned only by passing its checkpoint. Press `Take the checkpoint` or hit `q`.

- Five questions, drawn from six written for that lesson. All five must be right.
- You are never told *which* answers were wrong, only how many you got right.
- Each question's options stay inert for a couple of seconds, so clicking through a checkpoint in four seconds is not possible.
- A failed attempt locks the checkpoint for 20 seconds, doubling with each consecutive failure up to five minutes, and reshuffles both the questions and the option order.
- The correct answer is never written into the page, so reading the DOM does not help.

Every question is written by hand against its lesson, and each is tagged with the kind of thinking it asks for: a scenario to apply the lesson to, a cause, a contrast between two similar things, a precise detail, or a consequence. An attempt takes one of each kind before repeating any, then shuffles the question order and every question's options, so a retry differs in both content and layout. The wrong options are written to be as long and as specific as the right one, and a test fails if the correct option is the longest in more than 35% of questions, so picking the longest answer does not work.

Bookmarks, learned topics, the split position, the theme, the view, and the listening position and settings live in browser storage.

`/` focuses search, `Escape` clears it, `Backspace` goes back, `q` opens the checkpoint, `n` and `p` move to the next and previous topic on the path, `r` switches between the map and the roadmap, and `l` plays or pauses listening.

Animations are on by default, including on systems set to reduce motion. The ⏵ button in the toolbar switches them off and remembers the choice.

## Content

`knowledge.js` is the dataset the browser loads. `data/` holds the lessons, one file per category, `data/quizzes/` the checkpoint questions for each category, `data/roadmap.js` the learning path, `data/pl/` the Polish translation, and `data/categories.js` the eleven layers: foundations, protocol data, requests, clients, nodes and networking, consensus, indexing, proofs and verification, layer 2 and scaling, operations, and wallets and tooling.

Most lessons explain a mechanism: a method, a data structure, a protocol rule. A second set shows where those mechanisms are used: who calls RPC, for what, and what breaks. They start from *Who uses Ethereum RPC* (`rpc-workloads`), which sorts consumers into nine traffic shapes, and cover DEX pool reads, quoters and aggregators, deployless calls and storage-slot overrides, racing for the newest head, mempool streams, liquidation bots, solvers, MEV-Share, oracles, keepers, relayers, transaction simulation, security monitoring, exchange deposits, stablecoin payments, reconciliation, chain analytics, address history, portfolios, NFT marketplaces, governance, airdrops, vaults, fork testing, cross-chain relayers, x402 and onchain agents, plus benchmarking and the privacy of RPC itself. They sit in the categories and stages of the mechanisms they use rather than in a category of their own.

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
  related: ["state", "archive-node"],
  sources: [{ title: "…", url: "https://…" }],
}
```

Its checkpoint lives in `data/quizzes/<category>.js`, keyed by the same id, and `knowledge.js` joins the two:

```js
export const quizzes = {
  "eth-call": [
    { kind: "scenario", question: "…?", options: ["…", "…", "…", "…"], answer: 0 },
    // six per topic
  ],
};
```

A new topic also needs a place on the learning path. A stage in `data/roadmap.js` looks like this, with its topics in reading order; a test fails until every topic is placed exactly once:

```js
{
  id: "reads",
  label: "Reading the chain",
  blurb: "Your first requests: block numbers, blocks, balances, transactions, receipts, code, storage, and eth_call.",
  topics: ["cli-tools", "eth-block-number", "eth-get-block-by-number", /* … */]
}
```

Labels stay at 24 characters or fewer, because they sit on the roadmap as stage markers.

When writing checkpoint questions, each one must be answerable from its own lesson and have exactly one defensible answer. Wrong options should be mistakes a skimmer would actually make, as long and as specific as the right one. Avoid negatives like "which is NOT", "all of the above", and anything that is wrong only on a technicality. A topic's six questions use at least four of the five kinds, including a scenario. The tests enforce the mechanical parts; the rest is on the writer.

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

The suite covers the static server, including MIME types and traversal protection, and the dataset: unique slugs, resolvable links, no self-links, at least three onward paths per topic, real source URLs, every topic reachable from the root, no topic that nothing links to, and no orphaned dead ends. It also holds the checkpoints to their rules: six questions per topic across at least four kinds including a scenario, four distinct plain-text options, no question that contains its own answer, a correct option never more than 1.2 times the longest wrong one, and attempts that draw only from the topic's own set, spread across kinds, and change on retry.

Topics written against the section schema are additionally held to a depth bar: at least two headed sections, 240 words of lesson, an example for every request method.

Every interface string the code and the page use must have a Polish translation with the same placeholders, and every count its three Polish plural forms. Every lesson must have a Polish translation, and it must match its English original: the same sections, paragraphs, and pitfalls, the same links, the same inline code, and checkpoint questions with the same kinds and answer positions that pass the same fairness rules. [scripts/check-translation.js](scripts/check-translation.js) holds those checks, so a translator can run them on a batch before it is merged.

The learning path must place every topic exactly once, start at the root, and number the topics in order. The narration of every lesson must be plain speech with no link or code markup, in chunks short enough for every speech engine, tied to blocks the page marks, and must read an example's title and note but never its code.
