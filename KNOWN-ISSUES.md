# Known issues and gaps

A running log of anything that turned out to be weird, inconsistent, undocumented, or missing while building this map. Three kinds of entry live here:

- **Ethereum itself** — spec inconsistencies, unspecified behaviour, client disagreement, things that arguably need fixing upstream.
- **This map** — terms a lesson had to explain in prose because no node exists for them, and facts we could not pin down.
- **This repo** — bugs found, and work still owed.

## How to add to it

Add an entry the moment something is noticed, not later. One entry, one problem. Keep this shape:

```
- **Short label** — what is wrong or missing, and why it matters. Status: open | resolved | upstream.
```

Say what is actually known. If a claim is unverified, write that in the entry rather than dropping it. When an entry is resolved, move it to **Resolved** with a one-line note on what fixed it, rather than deleting it.

Proposed map nodes are written as slugs in backticks, for example `precompiles`. A test asserts none of those slugs already exists as a topic, so once a term gets its own node the test fails until the entry moves to **Resolved**. That is deliberate: it stops this file drifting out of date quietly.

---

## Ethereum protocol and spec

- **No standard code for "execution reverted"** — Geth, Nethermind and Reth commonly return JSON-RPC error code `3` with the revert bytes in `data`, while several hosted providers return `-32000` with a message string. EIP-1474 does not settle it. Callers cannot branch on code alone and end up matching on message text. Status: open, upstream.
- **`pending` is not specified** — the tag names a block that does not exist yet, assembled from one node's own transaction pool. Some clients and most hosted endpoints quietly answer `latest` instead. Any read against `pending` is therefore node-specific and not reproducible. Status: open, upstream.
- **`eth_estimateGas` has no agreed default block tag** — clients differ on whether an omitted block parameter means `latest` or `pending`, which changes the answer whenever a pending transaction touches the same state. Pass the tag explicitly. Status: open, upstream.
- **Two ways to ask for the chain** — `eth_chainId` (EIP-155) and `net_version` both exist, return different encodings, and can disagree on forked or misconfigured networks. `net_version` is effectively legacy but still widely called. Status: open, upstream.
- **QUANTITY and DATA are easy to confuse** — quantities are minimal hex with no leading zeros (`0x0`), byte strings are fixed-width and keep their zeros. The rule is stated in prose in the docs rather than enforced by the schemas, and mixing them silently corrupts balances, storage keys and signatures. Status: open, upstream.
- **`eth_getLogs` has no standard limits or pagination** — the method takes a block range with no defined maximum, so every provider invents its own caps (block span, result count, wall-clock timeout) and its own error text. Portable log scanners have to discover limits by failing. Status: open, upstream.
- **Tracing was never standardised** — `debug_` descends from Geth and `trace_` from Parity, they model the same execution differently, and neither is in the execution-apis spec. Anything built on traces is written against one client family. Status: open, upstream.
- **No RPC method returns a transaction or receipt proof** — `eth_getProof` (EIP-1186) covers account and storage state only. Proving that a transaction or a log was included means rebuilding the transactions or receipts trie from a full block, which every bridge and light client reimplements. Status: open, upstream.
- **Historical `eth_getProof` availability is undefined** — an archive node holds historical state, but generating a proof also needs the historical trie nodes, which some storage layouts discard. "Archive" is therefore not a reliable promise of provable history. Status: open, upstream.
- **Filters are server-side session state** — `eth_newFilter` and `eth_getFilterChanges` bind a client to one node, which breaks behind any load balancer that does not pin sessions, and they expire on an unspecified idle timeout (Geth's default is five minutes). Status: open, upstream.
- **`eth_syncing` returning `false` does not mean usable** — a node can report not-syncing while still lagging the head, or while its consensus client is down and its `finalized` view is frozen. Health checks that trust it alone are wrong. Status: open, upstream.
- **`mixHash` carries `prevRandao`** — after the Merge the header field kept its pre-merge name in most RPC responses, so the JSON field name no longer matches what the value means. Status: open, upstream.
- **Rejecting a below-base-fee transaction is client-dependent** — some clients queue it until the base fee falls, others refuse it outright. A submitter sees either a hash that never lands or an immediate error, for the same transaction. Status: open, upstream.
- **Layer 2 reuses `eth_` names with different meanings** — `safe` and `finalized` on an OP Stack chain are derived from L1, block times are seconds or milliseconds rather than twelve, and receipts carry extra L1 fee fields. Code written against L1 semantics compiles and runs against an L2 while being subtly wrong. Status: open, upstream.
- **History expiry makes "nothing found" ambiguous** — after pre-Merge history is dropped, a query over an old range returns an empty result that is indistinguishable from "there were genuinely no events", unless the caller separately checks what the node retains. Status: open, upstream.
- **Enhanced provider APIs are not portable** — token balance, NFT and transfer-history endpoints are each provider-specific, so the convenient path off the standard surface is also the one that locks a project in. Status: open, by design.
- **The `eth_` prefix does not say who answers** — ERC-4337 bundler methods are named `eth_sendUserOperation` and `eth_getUserOperationReceipt`, but no execution client implements them; they are served by a bundler. Wallet methods under `eth_` are answered by the wallet. The namespace tells you nothing about which process handles the call. Status: open, upstream.
- **Two error code spaces** — EIP-1193 defines provider errors `4001`, `4100`, `4200`, `4900` and `4901` alongside the JSON-RPC `-32xxx` range. A browser dapp has to handle both, and the two overlap in meaning without mapping onto each other. Status: open, upstream.
- **`personal_sign` and `eth_sign` take their arguments in opposite orders** — one is `[message, address]`, the other `[address, hash]`, for two methods that are otherwise easy to confuse. The argument order is the only thing stopping a caller signing the wrong thing. Status: open, upstream.
- **CCIP-Read signals success by reverting** — EIP-3668 offchain lookup is triggered by a specific revert, so a plain `eth_call` cannot resolve an offchain ENS name and instead sees a failure. Resolution requires a client that recognises the revert and follows it. Status: open, upstream.
- **ERC-20 and ERC-721 share a `Transfer` topic0** — the signature hash is identical, and only the number of indexed topics distinguishes a fungible transfer from an NFT transfer. Log consumers that filter on topic0 alone mix the two. Status: open, upstream.
- **Blob commitments outlive blob data** — the KZG commitment stays in the chain forever while the blob itself is dropped from the consensus layer after roughly eighteen days, so a commitment can be verifiable long after the data it commits to is unavailable from nodes. Status: open, by design.
- **Orphaned logs are only announced on one path** — a subscription and `eth_getFilterChanges` both set `removed: true` when a reorg withdraws a log, but `eth_getLogs` simply stops returning it. A consumer that polls has no in-protocol way to learn that a log it already stored is gone, which silently corrupts naive indexers. Status: open, upstream.
- **`eth_getProof` is welded to one state tree** — EIP-1186 describes its result purely in Merkle-Patricia terms, as arrays of RLP trie nodes, with no version marker and no abstraction over the tree type. Any future state-tree change breaks the method's schema rather than just its contents. Status: open, upstream.
- **The same value has two names in one response** — the account leaf field is `storageRoot` while the `eth_getProof` response field is `storageHash`. Status: open, upstream.
- **`requireCanonical` is an unverifiable assertion** — EIP-1898's flag is the only canonicality control in the whole JSON-RPC surface, and it is the answering node's word for it. Nothing in the response lets the caller check. Status: open, upstream.
- **A trie cannot say "never written" versus "written back to zero"** — both produce an exclusion proof, so contracts have to carry a separate flag to recover the distinction the protocol discards. Status: open, upstream.
- **Anonymous events cannot be filtered by signature** — they have no `topic0`, so no `eth_getLogs` filter can select them by name. The filter semantics say nothing about the case. Status: open, upstream.
- **A block can name blob data nobody has** — after the roughly eighteen day sidecar retention, `eth_getBlockByNumber` still returns the blob transaction, and no error distinguishes "this data expired" from any other kind of missing data. Status: open, upstream.
- **EIP-5792 atomicity depends on the account, not the call** — `wallet_sendCalls` does not guarantee that a batch is atomic; that depends on what kind of account is behind it. It also returns an identifier that is not a transaction hash, so the usual receipt polling does not apply. Status: open, upstream.

## Client behaviour worth knowing

Recorded because a lesson needed it and the answer was not in one obvious place. Verify against the version you run before depending on any of it.

- **Geth prunes the transaction index** — `--history.transactions` defaults to roughly the last 2.35 million blocks, so `eth_getTransactionByHash` and `eth_getTransactionReceipt` return `null` for older transactions even though the block is still present. Reads as data loss if you do not know the flag exists.
- **Erigon serves RPC from a separate process** — `rpcdaemon` is its own component, so "the node is up" and "RPC is up" are separate facts, and it exposes the Otterscan `ots_` namespace that no other client has.
- **Path-based state keeps a short window** — Geth's default scheme retains roughly the last 128 blocks of state, so historical `eth_call` fails on a node that looks fully synced.
- **Metrics ports are not standardised** — each client exposes Prometheus on its own port and flag. Nothing is shared across clients, so dashboards are per-client.
- **Grandine's flags could not be confirmed** — no flag names or default API port are asserted in its lesson, which is why it is the only client topic without an example. Status: open, needs someone who runs it.
- **`eth_simulateV1` support is uneven** — it arrived across the major execution clients during 2024 and 2025, so availability depends on the version in front of you rather than on the client name.
- **The two tracing families are not translations of each other** — `debug_` returns a call tree and takes a tracer argument, `trace_` returns a flat action list; the field names differ too, and Besu has neither in the same form. Tooling picks a family and stays there.
- **Historical balance and historical proof are separate promises** — flat and path-based storage layouts let a node answer `eth_getBalance` at an old block while failing `eth_getProof` at that same block. Nothing in the spec relates archive state to archive trie nodes.
- **Transaction-index retention is a Geth-documented number only** — the equivalents and defaults for Nethermind, Erigon, Reth and Besu could not be confirmed, so the lessons attribute the flag to Geth alone. Status: open.
- **`ots_` is only confirmed on Erigon** — other clients may implement the Otterscan namespace; nobody checked. Status: open.
- **`eth_getBlockReceipts` support still varies** — enough that the lessons document the single-block `eth_getLogs` fallback rather than assuming the method is there.

### Layer 2 differences

The rollups present an Ethereum-shaped API over quite different machinery, and the differences are where the bugs are.

- **Node topology differs** — an OP Stack node is `op-node` plus a separate execution client, while Arbitrum Nitro is a single process. Operational assumptions do not carry across.
- **L1 cost is surfaced under three different names** — OP Stack puts `l1Fee`, `l1GasUsed` and `l1BaseFeeScalar` on the receipt, Arbitrum reports `gasUsedForL1` alongside `l1BlockNumber`, and zkSync uses `l1BatchNumber` and `l1BatchTxIndex`. Nothing is shared.
- **`eth_estimateGas` means different things** — it excludes the L1 data fee on OP Stack and includes it on Arbitrum, so the same call returns figures that are not comparable.
- **`block.number` inside the EVM is not the same number** — it is the L1 block number on Arbitrum and the L2 block number on OP Stack. Contract logic that reads it behaves differently per chain.
- **Arbitrum `arb_` method names could not be confirmed** — the lesson points at the NodeInterface precompile instead. Status: open, needs someone who runs a Nitro node.
- **Library defaults are unspecified** — viem, ethers, web3.py and alloy each pick their own default block tag, retry policy, gas multiplier and revert-data handling, and none of it is part of any spec. Two libraries against one node can disagree. Status: open.

## Gaps in this map

Terms a lesson had to explain in prose because no node exists for them. Each is a candidate node; the slug is the proposed id.

**Protocol and execution**

- `precompiles` — needed by access lists, signatures, and gas. Referenced in several lessons with nowhere to link.
- `transient-storage` — EIP-1153, referenced by the EVM and contract storage lessons.
- `gas-refunds` — including the 63/64 rule, referenced by gas estimation.
- `execution-requests` — EIP-7685 and the `requestsHash` header field added at Pectra.
- `randao` — `prevRandao`, RANDAO reveal, and on-chain randomness.

**Consensus and staking**

- `validator-node` — the whole machine, meaning an execution client plus beacon node plus validator client. Only the `validator-client` process has a node, so the deployment-level concept has no home. This id previously existed and was removed as a duplicate; if it comes back it must not collide.
- `builder-api` — blinded blocks and the proposer-builder interface, currently folded into MEV-Boost.
- `relay` and `searcher` — the other two roles in the block-building market.
- `remote-signer` — Web3Signer, Clef, and the keymanager API, referenced by validator and security lessons.

**Interfaces and tooling**

- `server-sent-events` — how the Beacon API streams events, referenced twice with no link.
- `openrpc` — the schema language the execution APIs are written in.
- `cors` — plus DNS rebinding, referenced by RPC security.
- `circuit-breaker` — and token-bucket throttling, referenced by rate limits and failover.
- `client-namespaces` — the client-specific namespaces `ots_` and `erigon_`, distinct from the standard set.

**Layer 2**

- `predeploys` — the fixed contracts at known L2 addresses, such as the OP Stack gas price oracle and the L2-to-L1 message passer.
- `derivation-pipeline` — how an OP Stack node rebuilds L2 blocks from L1 data, which is what makes the chain verifiable without the sequencer.
- `validium` — chains that post commitments to Ethereum but data elsewhere, referenced by the data availability lesson.

**Contracts and wallets**

- `erc-165` — interface detection, referenced by the token standards lesson.
- `erc-1271` — signature validation for contract accounts, which breaks the usual `ecrecover` assumption.
- `ccip-read` — EIP-3668 offchain lookup, currently explained inside the ENS lesson.
- `eip-6963` — multi-wallet provider discovery, currently a clause in the EIP-1193 lesson.
- `paymaster` — who pays gas under account abstraction, referenced by ERC-4337.

**Proofs and state**

- `witness` — central to stateless execution and to the prestate tracer, referenced with nowhere to link.
- `verkle-tree` — a named, heavily documented concept currently folded into the stateless lesson.
- `exclusion-proof` — explained in three separate lessons, which is the usual sign a term wants its own node.
- `hex-prefix-encoding` — the trie path encoding that separates a leaf from an extension.
- `generalized-index` — the SSZ proof position identifier.
- `bls-signature` — sync committee aggregates use BLS; the signature lesson covers secp256k1 only.
- `light-client-update` — the Altair object, explained inline in the consensus proof lesson.

**Indexing and tools**

- `internal-transaction` — explained inline in three lessons; it is what explorers show and what traces are for.
- `graph-node` and `substreams` — folded into the subgraph lesson.
- `helios` and `otterscan` — named software with no nodes, unlike every other client in the map.
- `signature-directory` — the four-byte selector and event directory that explorers decode against.

**Networks and tools**

- `faucet`, `ephemery`, `kurtosis`, `chainlist` — each referenced once in the testnets lesson.

## Facts we would not assert

Deliberately left vague in the lessons because they could not be confirmed. Anyone who knows the answer should fix the lesson and move the entry to **Resolved**.

- The terminal total difficulty value that triggered the Merge.
- Slashing penalty constants after Electra changed the minimum-penalty quotient.
- The weak subjectivity period as a number, rather than "weeks, read what your client computes".
- Which `eth_` methods the Portal Network actually serves today.
- Blob target and maximum after the Fusaka blob-parameter-only forks.
- The current mainnet block gas limit, which validators keep voting upward.
- `EIP-7623` calldata cost as a formula, and what `requestsHash` hashes exactly.
- Default ports for Nethermind and Besu metrics endpoints.
- Whether `--rpc.batch-request-limit` and `--JsonRpc.JwtSecretFile` are real current flag names.
- The OP Stack sequencing window as a number, written as "measured in hours".
- Arbitrum's challenge period, written as comparable to OP Stack's seven days rather than given.
- The status of web3.js, written as "no longer the recommended starting point" rather than sunset.
- Canonical ERC-4337 EntryPoint addresses; the lesson points at `eth_supportedEntryPoints` instead.
- Whether every wallet requires EIP-712 typed data as a JSON string, written as "most".
- Helios command-line flags, deliberately omitted rather than invented.
- How much of the `eth_` surface a verified-RPC proxy actually covers, written as partial and moving between releases.

## This repo

- **Legacy lesson voice** — a handful of topics carried over from the first pass read as advice ("operators should…") rather than explanation. They pass validation but do not match the exemplar's voice. Status: open.
- **Dataset wiring** — `knowledge.js` composes all eleven category files, 186 topics. Status: resolved.
- **Quiz questions are generated where not authored** — every topic now ships three hand-written questions, and the generator tops each attempt up to five. Generated questions are only as good as the sentences they are drawn from. Status: open, watch for weak ones.

## Resolved

- **`rpc` linked to itself** — the lesson contained `[[rpc|RPC]]` inside its own body, rendering a button that reloaded the page you were on. Removed from the dataset, and the renderer now prints a self-link as plain text. A test forbids it.
- **`validator-node` id drift** — content referenced an id that the registry had renamed to `validator-client`, producing dangling links. All references updated; the validator now rejects unknown ids.
- **A generated question printed its own answer** — when a lesson linked the same term twice in one sentence, the fill-in-the-blank question blanked the first mention and left the second visible. The generator now blanks every mention, and a final filter drops any question whose prompt contains its answer.
- **Edges snapped while nodes glided** — CSS cannot transition SVG line geometry, so map transitions were half-animated. Nodes and edges are now driven by one frame loop.
- **Lessons were too short to teach** — the original dataset averaged about sixty words per topic. The rewrite runs 280 to 600 words with worked examples and pitfalls, and the tests enforce a floor.
