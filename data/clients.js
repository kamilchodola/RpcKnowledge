// Category: clients — the software implementations of the execution and consensus
// layers that actually serve RPC.

export const topics = [
  {
    id: "execution-client",
    title: "Execution client",
    category: "clients",
    aliases: ["EL client", "execution layer client", "el", "geth nethermind erigon reth besu"],
    summary: "An execution client is the software that keeps Ethereum's [[state|world state]], executes transactions in the [[evm|EVM]], runs the [[mempool|transaction pool]], and serves both the public `eth_` [[json-rpc|JSON-RPC]] API and the authenticated [[engine-api|Engine API]].",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "An execution client implements the [[execution-layer|execution layer]] rules: given a parent state and an ordered list of transactions, it must produce exactly one resulting state and one set of [[transaction-receipt|receipts]]. It stores that state and the chain history in its own database, exchanges blocks and transactions with peers over [[devp2p|devp2p]] on port 30303, and answers [[json-rpc|JSON-RPC]] on port 8545 over [[http-transport|HTTP]] and 8546 over [[websocket-transport|WebSocket]] when an operator turns those listeners on.",
          "Since [[the-merge|the Merge]] an execution client no longer decides which block is the head of the chain. A [[consensus-client|consensus client]] tells it, by calling `engine_forkchoiceUpdated` over the [[engine-api|Engine API]] on port 8551. The execution client is therefore never run alone: one execution client is paired with exactly one [[beacon-node|beacon node]], and the pair is what people mean by a node.",
          "Five implementations follow mainnet: [[geth|Geth]] in Go, [[nethermind|Nethermind]] in C#, [[erigon|Erigon]] in Go, [[reth|Reth]] in Rust, and [[besu|Besu]] in Java. Independent teams write them from the same specifications, so they must agree bit for bit on every [[state-root|state root]]. A disagreement is a consensus bug, not a matter of taste, which is the whole argument for [[client-diversity|client diversity]].",
        ],
      },
      {
        heading: "The four jobs",
        paragraphs: [
          "First, validation: re-execute every transaction of an incoming block, then check that the computed `stateRoot`, `receiptsRoot`, and `gasUsed` match the [[block-header|header]]. Second, storage: keep the current state so read methods can be answered, and keep enough history for [[eth-get-block-by-number|eth_getBlockByNumber]] and [[eth-get-logs|eth_getLogs]]. Third, the pool: accept signed transactions from RPC callers and peers, check nonce, balance, and fee rules, and propagate them. Fourth, the API surface.",
          "Block building is the same code path in reverse. When its consensus client passes `payloadAttributes` to `engine_forkchoiceUpdatedV3`, the execution client starts assembling a payload from its pool and returns it from `engine_getPayload`; see [[engine-payload|the Engine API methods]]. Everything a caller sees through `eth_` methods — balances, receipts, logs, gas estimates — is a read of the structures these jobs maintain.",
        ],
      },
      {
        heading: "Where implementations differ",
        paragraphs: [
          "The specification fixes the answers, not the machinery. Clients differ in their [[client-storage|storage engines]], in how they sync ([[snap-sync|snap sync]] versus re-executing history in stages), in memory and disk appetite, and most visibly in the non-standard [[namespaces|namespaces]] they serve. Geth-style [[debug-api|debug_]] tracing, Parity-style [[trace-api|trace_]] tracing, and the `ots_` search API that Erigon serves for [[otterscan|Otterscan]] are all [[client-namespaces|optional extras]], not part of what every client owes you.",
          "Pick a client by the questions your endpoint must answer: [[archive-node|archive]] state at old blocks, tracing, [[eth-get-proof|eth_getProof]] deep in history, [[eth-simulate|eth_simulateV1]] support. Then confirm what you actually got with [[net-web3-api|web3_clientVersion]] and a few probe calls rather than trusting a provider's feature page; see [[endpoint-capabilities|endpoint capabilities]].",
        ],
      },
    ],
    example: {
      title: "The four listeners an execution client typically opens",
      language: "text",
      code: "8545   HTTP JSON-RPC   eth_, net_, web3_ and whatever else the operator enables\n8546   WebSocket       the same methods plus eth_subscribe\n8551   Engine API      consensus client only, JWT-authenticated, never public\n30303  devp2p TCP/UDP  peers: headers, bodies, receipts, transactions, snap ranges",
      note: "Only 8545 and 8546 are meant for applications; 8551 belongs to the paired [[consensus-client|consensus client]] and 30303 to the network.",
    },
    pitfalls: [
      "Exposing port 8551 or the `admin_` and `debug_` namespaces to the internet; the Engine API's JWT is the only thing between a caller and your node's fork choice.",
      "Assuming a method exists everywhere: `trace_block` is absent on Geth, `ots_` address search works on Erigon but returns an unimplemented error on Reth, and `debug_traceCall` tracers vary in detail between clients.",
      "Treating a synced execution client as a working node; without a consensus client its head stops advancing, while [[eth-syncing|eth_syncing]] may still return `false`.",
      "Pointing two consensus clients at one execution client; each sends its own [[fork-choice|fork choice]] and they will fight over the head.",
    ],
    related: ["execution-layer", "geth", "engine-api", "json-rpc", "nethermind", "erigon", "reth", "besu", "consensus-client", "client-storage", "client-extensions"],
    sources: [
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
      { title: "Execution API documentation", url: "https://ethereum.github.io/execution-apis/" },
    ],
  },
  {
    id: "geth",
    title: "Geth",
    category: "clients",
    aliases: ["go-ethereum", "geth attach", "--http.api", "history.transactions", "PBSS"],
    summary: "Geth (go-ethereum) is the Go [[execution-client|execution client]] maintained by the go-ethereum team, storing state in a path-based trie layout, syncing with [[snap-sync|snap sync]], and exposing [[json-rpc|JSON-RPC]] only for the [[namespaces|namespaces]] named in `--http.api`.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Geth is the oldest continuously maintained [[execution-client|execution client]] and, for most of Ethereum's history, the de facto reference implementation: new [[eip|EIPs]] and [[debug-api|debug_]] tracers frequently appeared there first and were then adopted by other clients. The repository also ships the `evm` execution tool and `abigen`; the `clef` [[remote-signer|external signer]] was removed from it in June 2026 and continues as its own ethereum/clef project, while Geth still reaches an external signer through `--signer`. Running `geth attach` opens a JavaScript console over [[ipc-transport|IPC]] against `geth.ipc` in the data directory, which is the usual way to call [[admin-api|admin_]] methods without opening a network port.",
          "A default `geth` run uses `--syncmode snap` and `--gcmode full`: it fetches a recent state snapshot from peers, heals the trie, and then follows the head while keeping only recent state. It expects a [[consensus-client|consensus client]] on the [[engine-api|Engine API]]; without one it will sit idle after startup.",
        ],
      },
      {
        heading: "Storage and retention",
        paragraphs: [
          "Since v1.14 Geth uses the path-based state scheme (`--state.scheme path`) by default for new databases, which keeps one copy of each trie node keyed by its position rather than one per version; see [[client-storage|storage engines]]. That makes disk use predictable, but historical [[state|state]] survives only for a window of roughly 128 recent blocks. Ask for a balance or run [[eth-call|eth_call]] below that window on a [[pruned-node|pruned]] Geth and you get a `missing trie node` error. Serving old state requires `--gcmode archive`. With the path scheme, from v1.16, that is the same database plus an index over its state history, and nothing historical is served until the index is built. `--history.state` sets how many blocks of that history are kept, 90,000 by default and so only a [[partial-archive|recent window]]; a whole-chain archive, around 2 TB on mainnet, needs `--history.state 0` and a full sync from genesis. The legacy hash-based archive stores every trie version instead and exceeds 20 TB.",
          "History is stored separately from state: old headers, bodies, and receipts move into append-only freezer files, which `--datadir.ancient` can place on a slower disk. The transaction lookup index is bounded by `--history.transactions`, which defaults to about 2,350,000 blocks, roughly a year. Past that, [[eth-get-transaction-receipt|eth_getTransactionReceipt]] and [[eth-get-transaction-by-hash|eth_getTransactionByHash]] return `null` for transactions whose blocks Geth still holds; `--history.transactions 0` keeps the full index at the cost of disk.",
        ],
      },
      {
        heading: "Turning RPC on",
        paragraphs: [
          "Every listener is off by default. `--http` starts the HTTP server on `--http.addr 127.0.0.1` and `--http.port 8545`; `--ws` starts the [[websocket-transport|WebSocket]] server on 8546. `--http.api` and `--ws.api` are allow-lists of namespaces (`eth,net,web3,debug,txpool,admin`), and a method in an unlisted namespace fails with `the method X does not exist/is not available` even though the binary implements it. `--http.vhosts` checks the `Host` header, so a node behind a [[reverse-proxy|reverse proxy]] under a new hostname answers 403 until that name is added. The [[engine-api|Engine API]] has its own flags: `--authrpc.port 8551` and `--authrpc.jwtsecret`.",
          "Geth serves `eth_`, `net_`, `web3_`, `txpool_`, `admin_`, and `debug_`. It does not implement the Parity-style [[trace-api|trace_]] namespace at all, so callers that need call traces use [[debug-api|debug_traceTransaction]] or `debug_traceCall` with `callTracer` and `prestateTracer`. Two limits bite simulation callers: `--rpc.gascap` caps the gas an [[eth-call|eth_call]] or [[eth-estimate-gas|eth_estimateGas]] may consume (50,000,000 by default) and `--rpc.txfeecap` rejects local transactions whose maximum fee exceeds 1 ether.",
        ],
      },
    ],
    example: {
      title: "Starting Geth with HTTP, WebSocket, and the Engine API",
      language: "bash",
      code: "geth \\\n  --mainnet \\\n  --datadir /data/geth \\\n  --syncmode snap \\\n  --http --http.addr 127.0.0.1 --http.port 8545 \\\n  --http.api eth,net,web3,txpool \\\n  --ws --ws.addr 127.0.0.1 --ws.port 8546 --ws.api eth,net,web3 \\\n  --authrpc.addr 127.0.0.1 --authrpc.port 8551 \\\n  --authrpc.jwtsecret /secrets/jwt.hex \\\n  --history.transactions 0",
      note: "`debug` is deliberately absent from `--http.api` here; add it only on an endpoint that is not reachable from the internet.",
    },
    pitfalls: [
      "Adding `debug` or `admin` to `--http.api` on a publicly reachable port; `debug_traceBlockByNumber` alone is enough to exhaust a node's CPU.",
      "Concluding that a node lost old transactions when `eth_getTransactionReceipt` returns `null`; the default `--history.transactions` index simply stops about a year back.",
      "Expecting `trace_filter` to work after adding it to `--http.api`; Geth has no `trace_` implementation, so the namespace cannot be enabled.",
      "Putting Geth behind a proxy and forgetting `--http.vhosts`, which produces a bare 403 with no JSON-RPC error body.",
    ],
    related: ["execution-client", "client-storage", "debug-api", "snap-sync", "namespaces", "archive-node", "pruned-node", "ipc-transport", "history-expiry", "security"],
    sources: [
      { title: "Geth command-line options", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
      { title: "Geth: JSON-RPC server", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc" },
      { title: "Geth: archive mode", url: "https://geth.ethereum.org/docs/fundamentals/archive" },
      { title: "go-ethereum #35097: remove clef", url: "https://github.com/ethereum/go-ethereum/pull/35097" },
    ],
  },
  {
    id: "nethermind",
    title: "Nethermind",
    category: "clients",
    aliases: ["JsonRpc.EnabledModules", "dotnet client", "C# client", "full pruning", "Paprika"],
    summary: "Nethermind is the C#/.NET [[execution-client|execution client]] built by Nethermind, serving Geth-style [[debug-api|debug_]] and Parity-style [[trace-api|trace_]] tracing, with [[json-rpc|JSON-RPC]] configured through `--JsonRpc.*` keys such as `--JsonRpc.EnabledModules`.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Nethermind runs on the .NET runtime and is organized as a core plus [[client-extensions|plugins]], which is how it supports several networks from one binary: Ethereum mainnet, [[testnets|Sepolia and Hoodi]], [[gnosis-chain|Gnosis Chain]], and [[optimistic-rollup|OP Stack]] chains, where it plays the [[execution-client|execution client]] role next to `op-node`. A run is usually started from a named configuration, `--config mainnet`, which sets sane defaults that individual flags then override.",
          "Its data lives in RocksDB. Sync starts with [[snap-sync|snap sync]] plus a backwards download of headers, bodies, and receipts, so a fresh node serves the head quickly and fills in history behind it. Ancient-history barriers control how far back bodies and receipts are fetched: on mainnet `Sync.AncientBodiesBarrier` and `Sync.AncientReceiptsBarrier` default to block 24,600,000 for a new or resyncing 2.0 node, so older bodies and [[receipt-retention|receipts]] are not there unless both are set to `0`, which is worth checking before you point an [[indexer|indexer]] at a newly synced node.",
        ],
      },
      {
        heading: "Pruning and state",
        paragraphs: [
          "Since 2.0 a new database uses the flat state backend: `FlatDb.Enabled` defaults to `true`, and accounts and storage slots live as flat records beside the trie nodes needed to produce the [[state-root|state root]]. An existing patricia database, the half-path trie of 1.x that keys nodes by their path prefix rather than purely by hash, is detected at start and stays patricia, so an upgrade neither migrates nor resyncs; `--FlatDb.Enabled=false` syncs a fresh node on patricia. The experimental Paprika store is not part of 2.0. See [[client-storage|storage engines]] for what these layouts mean for historical queries.",
          "An [[archive-node|archive]] on the flat backend is flat history: with `FlatDb.HistoryEnabled`, which `--config mainnet_archive` sets alongside `Pruning.Mode=None`, the node records each finalized block's account and storage changes as it syncs. That history comes in four shapes: full, from genesis or the sync pivot (`FlatDb.HistoryRetention=None`); a rolling window (`Rolling` with `FlatDb.HistoryRetentionBlocks`); everything from a chosen block (`SinceBlock` with `FlatDb.HistoryRetentionSinceBlock`); and deep history for listed contracts on top of a window (`FlatDb.HistorySliceAddresses`); see [[partial-archive|partial archives]]. Below the retained floor, reads fail closed with a pruned-history [[rpc-errors|error]] instead of answering from live state, and enabling history is forward-only: nothing below the point where it was switched on is backfilled.",
          "Two further opt-ins are meant for full archives. `FlatDb.ArchiveProofBuildEnabled` writes proof commitments beside the history and `FlatDb.ArchiveProofServeEnabled` answers historical [[eth-get-proof|eth_getProof]] from them; both are off by default. `Receipt.DeriveFromState` stops persisting receipt bodies and re-executes a block over its parent state when a receipt is asked for, serving the result only if it reproduces the header's `receiptsRoot`.",
          "Pruning in the older sense belongs to the patricia backend. There Nethermind separates in-memory pruning, which keeps recent trie nodes in a cache and writes only what survives, from full pruning, which copies everything reachable from the current state root into a fresh database and drops the rest. Full pruning runs while the node keeps following the chain, but it needs free disk roughly the size of the state being copied and takes hours, so it is scheduled rather than run on a whim. Copy-style full pruning is not available on the flat backend in 2.0: a flat node accepts `Pruning.Mode=Hybrid` and the full-pruning triggers without warning but never prunes, and `admin_prune` reports `disabled` (a 2.0 known issue, #13600).",
        ],
      },
      {
        heading: "Configuring RPC",
        paragraphs: [
          "Configuration keys are namespaced by module and can be given as command-line flags (`--JsonRpc.Enabled true`), as entries in a JSON config file, or as environment variables of the form `NETHERMIND_JSONRPCCONFIG_ENABLED`. The listener is set by `--JsonRpc.Host` and `--JsonRpc.Port` (8545); [[websocket-transport|WebSocket]] traffic is served on `--JsonRpc.WebSocketsPort`, which defaults to the same port, so `ws://127.0.0.1:8545` is the usual subscription endpoint. The [[engine-api|Engine API]] listens separately on `--JsonRpc.EnginePort` (8551) with `--JsonRpc.JwtSecretFile`.",
          "`--JsonRpc.EnabledModules` is an allow-list: `Eth`, `Net`, `Web3`, `Subscribe`, `TxPool`, `Trace`, `Debug`, `Admin`, `Parity`, and others. A module that is not listed returns a method-not-found [[rpc-errors|error]] even though the client implements it, which is the single most common surprise for callers moving from another client. Nethermind serves both tracing styles — `trace_call`, `trace_transaction`, `trace_filter`, `trace_replayBlockTransactions` as well as `debug_traceTransaction` — and implements [[eth-simulate|eth_simulateV1]], so simulation-heavy callers often target it deliberately.",
        ],
      },
    ],
    example: {
      title: "Starting Nethermind with an explicit module list",
      language: "bash",
      code: "nethermind \\\n  --config mainnet \\\n  --data-dir /data/nethermind \\\n  --JsonRpc.Enabled true \\\n  --JsonRpc.Host 127.0.0.1 \\\n  --JsonRpc.Port 8545 \\\n  --JsonRpc.EnabledModules [Eth,Net,Web3,Subscribe,TxPool,Trace] \\\n  --JsonRpc.EngineHost 127.0.0.1 \\\n  --JsonRpc.EnginePort 8551 \\\n  --JsonRpc.JwtSecretFile /secrets/jwt.hex",
      note: "`Subscribe` must be present for [[eth-subscribe|eth_subscribe]] to work over WebSocket, and `Trace` for the `trace_` namespace; both are independent of `Eth`.",
    },
    pitfalls: [
      "Concluding that Nethermind lacks tracing when `trace_filter` fails; the namespace is implemented but must appear in `--JsonRpc.EnabledModules`.",
      "Opening a WebSocket to port 8546 out of habit; Nethermind serves WebSocket on the JSON-RPC port unless `--JsonRpc.WebSocketsPort` is changed.",
      "Starting full pruning on a patricia node whose disk is nearly full; it needs headroom for a copy of the state and will abort otherwise.",
      "Passing `--FlatDb.Enabled=false` to an existing flat data directory, which discards the state and resyncs instead of refusing.",
      "Mixing a JSON config file with flags and forgetting that the flag wins, so an edit to the file appears to have no effect.",
    ],
    related: ["execution-client", "trace-api", "debug-api", "eth-simulate", "client-storage", "pruned-node", "engine-api", "namespaces", "snap-sync", "archive-node", "partial-archive", "gnosis-chain", "client-namespaces"],
    sources: [
      { title: "Nethermind 2.0.0 release notes", url: "https://github.com/NethermindEth/nethermind/releases/tag/2.0.0" },
      { title: "Nethermind: archive nodes", url: "https://docs.nethermind.io/fundamentals/archive-nodes" },
      { title: "Nethermind: JSON-RPC configuration", url: "https://docs.nethermind.io/fundamentals/configuration" },
      { title: "NethermindEth/nethermind", url: "https://github.com/NethermindEth/nethermind" },
    ],
  },
  {
    id: "erigon",
    title: "Erigon",
    category: "clients",
    aliases: ["turbo-geth", "rpcdaemon", "ots_", "staged sync", "Caplin"],
    summary: "Erigon is the Go [[execution-client|execution client]] built around staged sync and a flat MDBX database, which runs its [[json-rpc|JSON-RPC]] in a separate `rpcdaemon` process and adds the `erigon_` and Otterscan `ots_` [[namespaces|namespaces]].",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Erigon began as turbo-geth, a fork of [[geth|Geth]] aimed at making an [[archive-node|archive node]] affordable, and is now an independent codebase. Its defining choice is storage: instead of writing a trie of hashed nodes, it keeps accounts and storage slots as flat key-value records in MDBX and computes trie nodes only when a [[state-root|state root]] is needed; see [[client-storage|storage engines]]. History is kept as change sets, so retaining every historical value costs far less than storing a full trie per block.",
          "Sync is staged rather than block-by-block, and Erigon 3 changed what the stages do. A fresh node does not re-execute from genesis: its first stage downloads most of the state and history, log and history indices included, as immutable snapshot files shared over BitTorrent, and later stages fetch headers and bodies and execute only the blocks after them, with the execution stage now also doing the hashing, trie and index work that were separate stages in Erigon 2. That is much faster on a fresh machine, but the node's answers are incomplete until the pipeline reaches the head. Erigon 3 also ships Caplin, its own [[consensus-client|consensus client]], inside the same binary; recent versions run it by default, and `--externalcl` switches to a standalone consensus client over the [[engine-api|Engine API]].",
        ],
      },
      {
        heading: "The separate RPC daemon",
        paragraphs: [
          "Erigon's RPC is a distinct component, `rpcdaemon`. It can run embedded in the node process, or as its own process that either opens the same data directory in read-only mode or connects over a private gRPC endpoint (`--private.api.addr`, 127.0.0.1:9090 by default). That split is the practical reason to run Erigon behind a public endpoint: you can restart, scale, or crash the RPC layer without touching sync, and you can put several RPC processes in front of one node behind a [[load-balancer|load balancer]].",
          "Retention is chosen with `--prune.mode`, whose presets range from a minimal node up to a full archive. The flags that shape the HTTP listener mirror Geth's: `--http`, `--http.addr`, `--http.port` (8545), and `--http.api` as an allow-list of namespaces.",
        ],
      },
      {
        heading: "What callers notice",
        paragraphs: [
          "Erigon serves the standard `eth_` surface plus the Parity-style [[trace-api|trace_]] namespace and Geth-style [[debug-api|debug_]] tracers. On top of that it exposes `erigon_` helpers such as `erigon_getHeaderByNumber` and `erigon_getBlockByTimestamp`, and the `ots_` API used by the [[otterscan|Otterscan]] [[block-explorer|explorer]]: `ots_searchTransactionsBefore` and `ots_searchTransactionsAfter` page through an address's history, `ots_getTransactionBySenderAndNonce` finds a transaction without a hash, and `ots_getContractCreator` returns who deployed a contract. [[reth|Reth]] implements most of the namespace but answers the two address searches with a `-32603` unimplemented error, and Anvil serves all of it on local devnets, so code that depends on `ots_` address search is in practice Erigon-specific.",
          "Log and history indices ship with the snapshot files, so [[eth-get-logs|eth_getLogs]] over wide ranges is usually cheap here, although since v3.4.0 `--rpc.blockrange.limit` caps it and `trace_filter` at 1,000 blocks by default, and `0` removes the cap. Erigon's documentation also warns that on the default `full` mode an address- or topic-filtered query can miss matches older than the 262,144-block state-history window, about 36 days. Historical [[eth-call|eth_call]] works at any block only when state history covers the whole chain, as `--prune.mode=archive` keeps it; `full` keeps state for that same window unless `--prune.distance` widens it. A historical [[eth-get-proof|eth_getProof]] is the opposite case: by default the trie nodes a proof needs are not stored, so proofs at old blocks fail even on a node that holds every historical value unless it runs with `--prune.include-commitment-history`.",
        ],
      },
    ],
    example: {
      title: "Erigon with an embedded RPC listener, and a standalone rpcdaemon",
      language: "bash",
      code: "# node process, RPC embedded\nerigon \\\n  --chain mainnet \\\n  --datadir /data/erigon \\\n  --http --http.addr 127.0.0.1 --http.port 8545 \\\n  --http.api eth,erigon,web3,net,debug,trace,txpool,ots \\\n  --authrpc.addr 127.0.0.1 --authrpc.port 8551 \\\n  --authrpc.jwtsecret /secrets/jwt.hex \\\n  --private.api.addr 127.0.0.1:9090\n\n# or a separate RPC process against the same node\nrpcdaemon \\\n  --private.api.addr 127.0.0.1:9090 \\\n  --http.addr 0.0.0.0 --http.port 8545 \\\n  --http.api eth,erigon,trace,ots",
      note: "`ots` in `--http.api` is what makes the Otterscan search methods reachable; it is off unless listed.",
    },
    pitfalls: [
      "Writing an [[indexer|indexer]] against `ots_` or `erigon_` methods and then discovering the fallback provider runs a different client.",
      "Expecting a partially synced Erigon to answer queries; until the snapshot download and the remaining stages reach the head, RPC answers are incomplete.",
      "Assuming an Erigon archive node can produce `eth_getProof` for any historical block; without `--prune.include-commitment-history` flat storage keeps values, not the trie nodes a proof needs.",
      "Leaving a node on the default `--prune.mode=full` and then querying state, or filtered logs, older than its 262,144-block window.",
      "Running `rpcdaemon` against a data directory that the node has open in a mode that conflicts, instead of connecting over the private gRPC address.",
    ],
    related: ["execution-client", "client-storage", "archive-node", "trace-api", "eth-get-logs", "eth-get-proof", "block-explorer", "consensus-client", "namespaces", "geth", "otterscan", "client-namespaces"],
    sources: [
      { title: "Erigon documentation", url: "https://docs.erigon.tech/" },
      { title: "erigontech/erigon", url: "https://github.com/erigontech/erigon" },
      { title: "Erigon: pruning modes", url: "https://docs.erigon.tech/fundamentals/pruning-modes" },
      { title: "Otterscan book: ots namespace spec", url: "https://github.com/otterscan/otterscan-book/blob/main/src/api-docs/ots-api.md" },
    ],
  },
  {
    id: "reth",
    title: "Reth",
    category: "clients",
    aliases: ["Paradigm", "rust ethereum", "ExEx", "execution extensions", "static files", "MDBX"],
    summary: "Reth is the Rust [[execution-client|execution client]] started by Paradigm, built as reusable crates over MDBX plus immutable static files, archive by default, with [[json-rpc|JSON-RPC]] namespaces selected by `--http.api`.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Reth is a from-scratch [[execution-client|execution client]] in Rust, published as a set of crates rather than a single program: the same building blocks that run `reth node` on mainnet are used to build `op-reth` for [[optimistic-rollup|OP Stack]] chains and custom nodes for [[permissioned-network|private networks]]. It follows the same [[execution-apis|execution APIs specification]] as every other client and pairs with a [[consensus-client|consensus client]] over the [[engine-api|Engine API]] on port 8551.",
          "Storage splits in two. MDBX holds the mutable parts — state, the account and storage change sets, and the indices — while headers, bodies, and receipts are written into append-only static files that are never rewritten and compress well; see [[client-storage|storage engines]]. Sync is a staged pipeline in the style of [[erigon|Erigon]]: headers, bodies, sender recovery, execution, then the hashing and index stages.",
        ],
      },
      {
        heading: "Archive by default",
        paragraphs: [
          "Reth keeps all historical [[state|state]] unless told otherwise, so a plain `reth node` is an [[archive-node|archive node]]; `--full` is the flag that turns it into a [[pruned-node|pruned node]] that keeps only recent state and history. That is the reverse of most clients' defaults and surprises operators who size a disk for a [[full-node|full node]] and get archive growth, or who add `--full` later and find historical [[eth-call|eth_call]] has stopped working.",
          "[[client-extensions|Execution Extensions]], known as ExEx, are the other distinctive feature: a Rust task runs inside the node process and receives a stream of committed chain notifications, including reverted segments during a [[reorg|reorg]]. An [[indexer|indexer]] built that way reads state changes directly instead of polling [[eth-get-logs|eth_getLogs]] over [[http-transport|HTTP]], at the cost of being coupled to the node's lifecycle and to Reth itself.",
        ],
      },
      {
        heading: "Serving RPC",
        paragraphs: [
          "The flags follow Geth's shape closely. `--http` opens the HTTP listener on `--http.addr` and `--http.port` (8545); `--http.api` is the allow-list, typically `eth,net,web3,debug,trace,txpool`; `--ws`, `--ws.port` (8546) and `--ws.api` do the same for [[websocket-transport|WebSocket]]. Engine traffic uses `--authrpc.addr`, `--authrpc.port` and `--authrpc.jwtsecret`, and `--metrics 127.0.0.1:9001` exposes Prometheus counters for [[observability|monitoring]].",
          "Reth serves both tracing styles: Geth-compatible [[debug-api|debug_]] tracers and the Parity-style [[trace-api|trace_]] namespace, which together with archive-by-default makes it a common choice behind tracing endpoints. Limits on simulated calls are set with `--rpc.gascap` and the RPC server's own timeout and body-size flags rather than being hard-coded.",
        ],
      },
    ],
    example: {
      title: "A pruned Reth node with HTTP, WebSocket, and Engine API",
      language: "bash",
      code: "reth node \\\n  --chain mainnet \\\n  --datadir /data/reth \\\n  --full \\\n  --http --http.addr 127.0.0.1 --http.port 8545 \\\n  --http.api eth,net,web3,txpool,trace,debug \\\n  --ws --ws.addr 127.0.0.1 --ws.port 8546 --ws.api eth \\\n  --authrpc.addr 127.0.0.1 --authrpc.port 8551 \\\n  --authrpc.jwtsecret /secrets/jwt.hex \\\n  --metrics 127.0.0.1:9001",
      note: "Remove `--full` and the same command gives an archive node, because keeping all history is Reth's default.",
    },
    pitfalls: [
      "Sizing disk for a full node and omitting `--full`; the node will keep growing as an archive.",
      "Adding `--full` to an existing archive node and expecting old data to remain; historical state beyond [[partial-archive|the retained window]] stops being queryable.",
      "Building an ExEx and treating it as a substitute for an external [[indexer|indexer]]; it dies with the node and must replay on restart.",
      "Assuming `trace_` and `debug_` are reachable by default; both namespaces still have to be named in `--http.api`.",
    ],
    related: ["execution-client", "client-storage", "archive-node", "trace-api", "indexer", "erigon", "engine-api", "pruned-node", "namespaces", "debug-api"],
    sources: [
      { title: "Reth book", url: "https://reth.rs/" },
      { title: "paradigmxyz/reth", url: "https://github.com/paradigmxyz/reth" },
    ],
  },
  {
    id: "besu",
    title: "Besu",
    category: "clients",
    aliases: ["Hyperledger Besu", "Bonsai", "host-allowlist", "rpc-http-api", "GraphQL"],
    summary: "Besu is the Java [[execution-client|execution client]] developed under Linux Foundation Decentralized Trust with Consensys as its main contributor, using Bonsai flat storage, an uppercase `--rpc-http-api` allow-list, and an optional GraphQL endpoint.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Besu runs on the JVM and covers two audiences from one codebase: Ethereum mainnet as a public [[execution-client|execution client]], and [[permissioned-network|permissioned networks]], where it supplies the QBFT and IBFT 2.0 consensus algorithms that public Ethereum does not use, plus local account and node permissioning. QBFT is the recommended choice and IBFT 2.0 is kept for existing networks; Clique was removed in 26.4.0, apart from syncing chains such as Linea that began as Clique and moved to proof of stake, and Tessera privacy and on-chain permissioning went in 25.6.0, followed by the `PRIV` and `EEA` API groups in 25.7.0. That second role explains configuration options an operator on mainnet never touches.",
          "State is stored in the Bonsai format by default (`--data-storage-format=BONSAI`): accounts and storage slots are kept flat, with trie logs recording the difference each block made so the node can roll back. The older Forest format keeps a conventional trie of hashed nodes. Bonsai keeps only [[partial-archive|a bounded window of historical state]], governed by `--bonsai-historical-block-limit`, so an [[archive-node|archive]] deployment is a deliberate configuration rather than the default; see [[client-storage|storage engines]].",
        ],
      },
      {
        heading: "Turning RPC on",
        paragraphs: [
          "Besu's flags use `=` between name and value and spell API names in upper case, which trips up anyone copying a Geth command line. `--rpc-http-enabled=true` opens the HTTP listener on `--rpc-http-host` and `--rpc-http-port` (8545); `--rpc-http-api=ETH,NET,WEB3,TRACE,TXPOOL` is the allow-list. [[websocket-transport|WebSocket]] has its own pair, `--rpc-ws-enabled=true` and `--rpc-ws-port` (8546). The [[engine-api|Engine API]] is configured with `--engine-rpc-port=8551` and `--engine-jwt-secret`.",
          "The distinctive gate is `--host-allowlist`. Besu checks the `Host` header of every incoming request and answers 403 with a plain `Host not authorized` body when the name is not listed, before any JSON-RPC parsing happens. A node reached through a [[reverse-proxy|reverse proxy]] or a container DNS name therefore rejects perfectly valid calls until that hostname (or `*`, on a private network) is added, and the Engine API has its own `--engine-host-allowlist`.",
        ],
      },
      {
        heading: "What callers notice",
        paragraphs: [
          "Besu serves `eth_`, `net_`, `web3_`, `txpool_`, `admin_`, `debug_`, and the Parity-style [[trace-api|trace_]] namespace, so `trace_transaction` and `trace_replayBlockTransactions` are available where the data is retained. It is also the client best known for an alternative query interface: `--graphql-http-enabled=true` exposes a GraphQL endpoint on port 8547 where a single query can pull a block with its transactions and [[event-log|logs]], which is an alternative to a [[batch-request|JSON-RPC batch]] rather than a replacement for [[json-rpc|JSON-RPC]].",
          "[[sync-modes|Sync modes]] are chosen with `--sync-mode`, including `SNAP` for [[snap-sync|snap sync]], `CHECKPOINT`, and `FULL`. Metrics for [[observability|monitoring]] come from `--metrics-enabled=true` on port 9545.",
        ],
      },
    ],
    example: {
      title: "Starting Besu with HTTP RPC and the Engine API",
      language: "bash",
      code: "besu \\\n  --network=mainnet \\\n  --data-path=/data/besu \\\n  --data-storage-format=BONSAI \\\n  --sync-mode=SNAP \\\n  --rpc-http-enabled=true \\\n  --rpc-http-host=127.0.0.1 \\\n  --rpc-http-port=8545 \\\n  --rpc-http-api=ETH,NET,WEB3,TXPOOL,TRACE \\\n  --host-allowlist=localhost,127.0.0.1 \\\n  --engine-rpc-port=8551 \\\n  --engine-jwt-secret=/secrets/jwt.hex \\\n  --engine-host-allowlist=localhost,127.0.0.1",
      note: "API names are upper case here; `--rpc-http-api=eth` is rejected at startup rather than silently ignored.",
    },
    pitfalls: [
      "Copying a Geth-style API list into `--rpc-http-api` without checking it against Besu's own module names, which its documentation writes in upper case: `ETH,NET,WEB3`.",
      "Debugging a 403 as an authentication problem when it is `--host-allowlist` rejecting the `Host` header sent by a proxy.",
      "Expecting historical [[eth-call|eth_call]] to work on a default Bonsai node; only a bounded window of historical state is kept.",
      "Forgetting `--engine-host-allowlist` after moving the [[consensus-client|consensus client]] to another container, which leaves the Engine API unreachable while HTTP RPC still works.",
    ],
    related: ["execution-client", "client-storage", "trace-api", "namespaces", "archive-node", "snap-sync", "reverse-proxy", "engine-api", "json-rpc", "security", "permissioned-network"],
    sources: [
      { title: "Besu documentation", url: "https://docs.besu-eth.org/" },
      { title: "Besu: command-line options", url: "https://docs.besu-eth.org/public-networks/reference/cli/options" },
      { title: "besu-eth/besu", url: "https://github.com/besu-eth/besu" },
      { title: "Besu changelog", url: "https://github.com/besu-eth/besu/blob/main/CHANGELOG.md" },
    ],
  },
  {
    id: "consensus-client",
    title: "Consensus client",
    category: "clients",
    aliases: ["CL client", "beacon chain client", "eth2 client", "lighthouse prysm teku nimbus lodestar grandine"],
    summary: "A consensus client is the software implementing Ethereum's [[proof-of-stake|proof-of-stake]] Beacon Chain: it gossips and validates [[beacon-block|beacon blocks]], runs [[fork-choice|fork choice]], tracks [[finality|finality]], drives an [[execution-client|execution client]] over the [[engine-api|Engine API]], and serves the [[beacon-api|Beacon API]].",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "The consensus client owns everything that was added at [[the-merge|the Merge]]: [[validator|validators]] and their balances, [[slot-epoch|12-second slots and 32-slot epochs]], [[attestation|attestations]] and their aggregation, [[sync-committee|sync committees]], and the justified and finalized checkpoints. Its data structures are [[ssz|SSZ]]-encoded rather than [[rlp|RLP]], and its peer-to-peer stack is libp2p on port 9000 rather than [[devp2p|devp2p]]; see [[libp2p-gossip|consensus networking]].",
          "Six implementations follow mainnet: [[lighthouse|Lighthouse]] in Rust by Sigma Prime, [[prysm|Prysm]] in Go by Offchain Labs, [[teku|Teku]] in Java by Consensys, [[nimbus|Nimbus]] in Nim by Status, [[lodestar|Lodestar]] in TypeScript by ChainSafe, and [[grandine|Grandine]] in Rust. All of them implement the same consensus specifications and the same REST API, so they are interchangeable from an operator's point of view, which is the point of [[client-diversity|client diversity]].",
          "Most of them ship as two programs: a [[beacon-node|beacon node]] that follows the chain, and a [[validator-client|validator client]] that holds signing keys. A node that only reads the chain runs the beacon node alone.",
        ],
      },
      {
        heading: "How it drives the execution client",
        paragraphs: [
          "Every consensus client is configured with an execution endpoint and a shared secret, typically `http://127.0.0.1:8551` and a 32-byte hex JWT file; see [[authentication|RPC authentication]]. When a new beacon block arrives it hands the [[execution-payload|execution payload]] to the execution client with `engine_newPayload` and waits for `VALID` or `INVALID`. After running fork choice it calls `engine_forkchoiceUpdated` with `headBlockHash`, `safeBlockHash`, and `finalizedBlockHash`, which is exactly where the `safe` and `finalized` [[block-tag|block tags]] come from.",
          "While the execution client is still syncing, the consensus client may import blocks optimistically and mark its head as unverified. The Beacon API reports that as `is_optimistic: true` in `/eth/v1/node/syncing`, and it is the correct thing to alert on: the chain looks live, but nothing behind it has been executed yet.",
        ],
      },
      {
        heading: "What it serves, and what it does not",
        paragraphs: [
          "The consensus client serves the [[beacon-api|Beacon API]], a REST interface with routes such as `/eth/v1/beacon/headers`, `/eth/v2/beacon/blocks/{block_id}`, and `/eth/v1/events` for server-sent events; see [[beacon-endpoints|Beacon API endpoints]]. It also holds data the [[execution-layer|execution layer]] never sees, including [[blob|blob sidecars]], which consensus clients retain for 4096 epochs, about 18 days, before dropping them.",
          "It runs no [[evm|EVM]] and serves no `eth_` methods. Sending [[eth-get-balance|eth_getBalance]] to a beacon node's HTTP port produces a 404 from a REST router, not a [[rpc-errors|JSON-RPC error]] — a frequent source of confusion when a node's two ports are mixed up. Fresh nodes normally start with [[checkpoint-sync|checkpoint sync]] from a recent finalized state rather than replaying from [[genesis|genesis]], which also satisfies the [[weak-subjectivity|weak subjectivity]] requirement.",
        ],
      },
    ],
    example: {
      title: "Beacon API HTTP defaults differ per client",
      language: "text",
      code: "Lighthouse   5052   --http turns the API on, --http-port moves it\nPrysm        3500   --grpc-gateway-port serves REST; 4000 is its gRPC API\nTeku         5051   --rest-api-enabled=true, --rest-api-port\nNimbus       5052   --rest turns it on (off by default), --rest-port\nLodestar     9596   --rest.port, --rest.address",
      note: "Health checks and monitoring must be configured per client; there is no single default Beacon API port the way 8545 is for [[json-rpc|execution JSON-RPC]].",
    },
    pitfalls: [
      "Pointing an application's RPC URL at the beacon node's HTTP port; the Beacon API is REST and knows nothing about `eth_` methods.",
      "Assuming every consensus client answers on 5052; Prysm, Teku, and Lodestar use different defaults, and some clients keep the API off until a flag enables it.",
      "Treating `is_syncing: false` as healthy without checking `is_optimistic` and `el_offline` in the same response.",
      "Letting the JWT secret files of the two clients drift apart; the Engine API then rejects every call and the node stops following the chain while both processes look alive.",
    ],
    related: ["consensus-layer", "beacon-node", "beacon-api", "engine-api", "execution-client", "validator-client", "lighthouse", "checkpoint-sync", "fork-choice", "client-diversity"],
    sources: [
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "ethereum/consensus-specs", url: "https://github.com/ethereum/consensus-specs" },
    ],
  },
  {
    id: "lighthouse",
    title: "Lighthouse",
    category: "clients",
    aliases: ["lighthouse bn", "lighthouse vc", "Sigma Prime", "--execution-jwt", "doppelganger"],
    summary: "Lighthouse is the Rust [[consensus-client|consensus client]] by Sigma Prime, shipping one binary with a `bn` [[beacon-node|beacon node]] subcommand and a `vc` [[validator-client|validator client]] subcommand, and serving the [[beacon-api|Beacon API]] on port 5052 when `--http` is given.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Lighthouse is a single Rust binary with subcommands: `lighthouse bn` runs the beacon node, `lighthouse vc` runs the validator client, and `lighthouse account` manages validator keys. Beacon states are stored in a hot database for recent slots and a cold freezer database for older ones, with historical states reconstructed by replaying blocks from periodic snapshots rather than stored outright; `--reconstruct-historic-states` builds them back for an archival beacon node.",
          "A typical start passes `--network mainnet`, `--datadir`, `--execution-endpoint http://127.0.0.1:8551`, `--execution-jwt` pointing at the shared secret file, and `--checkpoint-sync-url` so the node starts from a recent finalized state instead of [[genesis|genesis]]; see [[checkpoint-sync|checkpoint sync]].",
        ],
      },
      {
        heading: "RPC-relevant behavior",
        paragraphs: [
          "The [[beacon-api|Beacon API]] is off until `--http` is passed. It then listens on 127.0.0.1:5052, moved with `--http-address` and `--http-port`, and browser callers need `--http-allow-origin`. Prometheus metrics for [[observability|monitoring]] come from `--metrics` on port 5054. The validator client connects to the beacon node's REST API with `--beacon-nodes`, which accepts several URLs so it can fail over between beacon nodes without downtime; see [[failover|failover]].",
          "On the validator side, `--suggested-fee-recipient` sets the [[address|address]] that ends up in `payloadAttributes` when this node proposes, `--builder-proposals` opts into [[mev-boost|MEV-Boost]] block building, and `--enable-doppelganger-protection` makes a validator wait a couple of epochs before signing so it can detect a duplicate of itself elsewhere on the network and avoid [[slashing|slashing]].",
        ],
      },
    ],
    example: {
      title: "A Lighthouse beacon node with checkpoint sync and the API enabled",
      language: "bash",
      code: "lighthouse bn \\\n  --network mainnet \\\n  --datadir /data/lighthouse \\\n  --execution-endpoint http://127.0.0.1:8551 \\\n  --execution-jwt /secrets/jwt.hex \\\n  --checkpoint-sync-url https://checkpoint.example \\\n  --http --http-address 127.0.0.1 --http-port 5052 \\\n  --metrics",
      note: "Without `--http` the node syncs and attests normally but answers nothing on 5052, which looks like a dead process to a health check.",
    },
    pitfalls: [
      "Expecting the Beacon API to be reachable without `--http`; Lighthouse keeps it closed by default.",
      "Giving `--execution-endpoint` the [[execution-client|execution client]]'s 8545 port instead of the authenticated 8551 [[engine-api|Engine API]] port.",
      "Running two validator clients with the same keys and relying on doppelganger protection to save you; it reduces the risk window, it does not remove it.",
      "Binding `--http-address 0.0.0.0` without a firewall, which exposes validator endpoints alongside read-only ones.",
    ],
    related: ["consensus-client", "beacon-node", "validator-client", "beacon-api", "checkpoint-sync", "engine-api", "mev-boost", "slashing", "client-diversity", "observability"],
    sources: [
      { title: "Lighthouse book", url: "https://lighthouse-book.sigmaprime.io/" },
      { title: "sigp/lighthouse", url: "https://github.com/sigp/lighthouse" },
    ],
  },
  {
    id: "prysm",
    title: "Prysm",
    category: "clients",
    aliases: ["beacon-chain", "grpc-gateway", "Offchain Labs", "Prysmatic", "port 3500", "port 4000"],
    summary: "Prysm is the Go [[consensus-client|consensus client]] maintained by Offchain Labs, built around a gRPC API on port 4000 with the standard [[beacon-api|Beacon API]] served over a REST gateway on port 3500.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Prysm ships two programs, `beacon-chain` and `validator`, and stores chain data in an embedded key-value database. Its internal API was gRPC from the start, and the standard REST [[beacon-api|Beacon API]] came later, which is why Prysm has long exposed two API ports, REST and gRPC, where other clients expose one. It also requires `--accept-terms-of-use` on every start, a flag no other [[consensus-client|consensus client]] has.",
          "Because the two ports carry different APIs, the [[validator-client|validator client]] can talk to the [[beacon-node|beacon node]] in two ways: `--beacon-rpc-provider=127.0.0.1:4000` uses the gRPC endpoint, and `--beacon-rest-api-provider` makes it a standard Beacon API consumer instead, which is what you need when pointing Prysm's validator at another client's beacon node.",
        ],
      },
      {
        heading: "RPC-relevant behavior",
        paragraphs: [
          "The REST API listens on 3500 by default, and the flags that set its host and port have been renamed across releases, so take them from the documentation for the version you run; monitoring and [[health-check|health checks]] written against 5052 will silently fail here. Connection to the [[execution-client|execution client]] uses `--execution-endpoint http://127.0.0.1:8551` together with `--jwt-secret`, and on the network side Prysm defaults to TCP 13000 and UDP 12000 for libp2p rather than 9000, which matters when you write firewall rules from a generic guide; see [[libp2p-gossip|consensus networking]].",
          "[[checkpoint-sync|Checkpoint sync]] needs two flags on Prysm: `--checkpoint-sync-url` for the recent finalized state and `--genesis-beacon-api-url` for the [[genesis|genesis]] state, usually pointing at the same provider. Giving only the first leaves the node unable to complete startup.",
        ],
      },
    ],
    example: {
      title: "A Prysm beacon node with checkpoint sync",
      language: "bash",
      code: "beacon-chain \\\n  --mainnet \\\n  --datadir /data/prysm \\\n  --execution-endpoint http://127.0.0.1:8551 \\\n  --jwt-secret /secrets/jwt.hex \\\n  --checkpoint-sync-url https://checkpoint.example \\\n  --genesis-beacon-api-url https://checkpoint.example \\\n  --grpc-gateway-host 127.0.0.1 --grpc-gateway-port 3500 \\\n  --accept-terms-of-use",
      note: "`/eth/v1/node/syncing` lives on 3500 here; port 4000 speaks gRPC and will not answer a REST request.",
    },
    pitfalls: [
      "Writing a health check against port 5052 because that is what other clients use; Prysm's REST API is on 3500.",
      "Passing `--checkpoint-sync-url` alone and wondering why startup stalls; Prysm also wants `--genesis-beacon-api-url`.",
      "Opening firewall rules for port 9000 only; Prysm's libp2p defaults are TCP 13000 and UDP 12000.",
      "Pointing a non-Prysm validator client at port 4000; gRPC is not the standard Beacon API and other clients cannot speak it.",
    ],
    related: ["consensus-client", "beacon-api", "beacon-node", "validator-client", "checkpoint-sync", "engine-api", "libp2p-gossip", "health-check", "lighthouse", "client-diversity"],
    sources: [
      { title: "Prysm documentation", url: "https://docs.prylabs.network/" },
      { title: "OffchainLabs/prysm", url: "https://github.com/OffchainLabs/prysm" },
    ],
  },
  {
    id: "teku",
    title: "Teku",
    category: "clients",
    aliases: ["Consensys", "--ee-endpoint", "rest-api-port", "5051", "Web3Signer"],
    summary: "Teku is the Java [[consensus-client|consensus client]] from Consensys that can run a [[beacon-node|beacon node]] and its [[validator-client|validator client]] in a single JVM process, serving the [[beacon-api|Beacon API]] on port 5051 once `--rest-api-enabled=true` is set.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Teku runs on the JVM and is written for institutional staking setups, which shapes its defaults: it can host validator keys in the same process as the beacon node by passing `--validator-keys=<keystores>:<passwords>`, or run as a separate `teku validator-client` process. Its storage mode is explicit, `--data-storage-mode` with `MINIMAL`, `PRUNE`, and `ARCHIVE`, where the archive mode retains historical beacon states so the [[beacon-api|Beacon API]] can answer queries about old slots instead of only recent ones.",
          "Flags use `=` between name and value. The [[execution-client|execution client]] is reached with `--ee-endpoint=http://127.0.0.1:8551` and `--ee-jwt-secret-file=`, and [[checkpoint-sync|checkpoint sync]] is configured with `--checkpoint-sync-url=` or, for an explicit state file, `--initial-state=`.",
        ],
      },
      {
        heading: "RPC-relevant behavior",
        paragraphs: [
          "The REST API is disabled until `--rest-api-enabled=true`, then listens on `--rest-api-port` with a default of 5051 rather than 5052, bound to `--rest-api-interface`. Like [[besu|Besu]], which comes from the same organization, Teku validates the `Host` header against `--rest-api-host-allowlist`, so a request that arrives through a [[reverse-proxy|reverse proxy]] under an unlisted name is rejected before it reaches a handler.",
          "Because it is a JVM process, heap sizing is part of running it: the beacon node's memory use is dominated by the state cache, and operators set the heap explicitly rather than relying on container defaults. On the validator side, Teku supports external signing over `--validators-external-signer-url`, which is how it pairs with Web3Signer so that keys never sit next to the [[validator-client|validator client]] itself.",
        ],
      },
    ],
    example: {
      title: "A Teku beacon node with the REST API enabled",
      language: "bash",
      code: "teku \\\n  --network=mainnet \\\n  --data-base-path=/data/teku \\\n  --ee-endpoint=http://127.0.0.1:8551 \\\n  --ee-jwt-secret-file=/secrets/jwt.hex \\\n  --checkpoint-sync-url=https://checkpoint.example \\\n  --rest-api-enabled=true \\\n  --rest-api-interface=127.0.0.1 \\\n  --rest-api-port=5051 \\\n  --rest-api-host-allowlist=localhost,127.0.0.1 \\\n  --data-storage-mode=PRUNE",
      note: "Change `--data-storage-mode` to `ARCHIVE` only if you need historical beacon state queries; it costs a large amount of disk.",
    },
    pitfalls: [
      "Assuming port 5052; Teku's REST API default is 5051, and it is closed until `--rest-api-enabled=true`.",
      "Getting a 403 through a proxy and blaming authentication instead of `--rest-api-host-allowlist`.",
      "Querying an old slot's state on a node running with `PRUNE` storage; historical states are simply not there.",
      "Running the combined beacon-plus-validator process on one machine and then starting a second copy with the same keys during a migration.",
    ],
    related: ["consensus-client", "beacon-node", "validator-client", "beacon-api", "checkpoint-sync", "engine-api", "besu", "reverse-proxy", "client-diversity", "slashing"],
    sources: [
      { title: "Teku documentation", url: "https://docs.teku.consensys.io/" },
      { title: "Consensys/teku", url: "https://github.com/Consensys/teku" },
    ],
  },
  {
    id: "nimbus",
    title: "Nimbus",
    category: "clients",
    aliases: ["nimbus_beacon_node", "trustedNodeSync", "Status", "Nim", "--web3-url", "verified proxy"],
    summary: "Nimbus is the Nim [[consensus-client|consensus client]] from Status, built for small machines, reaching its [[execution-client|execution client]] with `--el` and serving the [[beacon-api|Beacon API]] only when `--rest` is passed.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Nimbus is written in Nim and optimized for low memory and CPU use, which is why it is the usual choice on single-board computers and small cloud instances. The [[beacon-node|beacon node]] is `nimbus_beacon_node` and the [[validator-client|validator client]] is a separate `nimbus_validator_client`, though the beacon node can also hold keys directly. The same project maintains a light client and the Nimbus verified proxy, which answers a subset of `eth_` methods and checks the results against headers followed by a [[light-client|light client]]; see [[verified-rpc|verified RPC]].",
          "Its flags use `=` and differ from most other clients: the execution endpoint is `--el=http://127.0.0.1:8551` (older releases called it `--web3-url`) with `--jwt-secret=`, and the data directory is `--data-dir=`. A Nimbus execution client for the [[execution-layer|execution layer]] is a separate, longer-running project and is not what `nimbus_beacon_node` runs.",
        ],
      },
      {
        heading: "RPC-relevant behavior",
        paragraphs: [
          "[[checkpoint-sync|Checkpoint sync]] is a separate step rather than a flag. You run `nimbus_beacon_node trustedNodeSync --trusted-node-url=...` once against a trusted [[beacon-api|Beacon API]] to seed the database, then start the node normally; this is also how you re-seed a node that has fallen too far behind.",
          "The REST API is off by default and needs `--rest`, after which it listens on `--rest-port` with a default of 5052 and `--rest-address` bound to localhost. That default matters for monitoring: an otherwise healthy Nimbus node answers nothing at all until `--rest` is on, and a [[validator-client|validator client]] pointed at it cannot fetch duties either.",
        ],
      },
    ],
    example: {
      title: "Seeding Nimbus from a checkpoint, then running it",
      language: "bash",
      code: "# one-time trusted node sync\nnimbus_beacon_node trustedNodeSync \\\n  --network=mainnet \\\n  --data-dir=/data/nimbus \\\n  --trusted-node-url=https://checkpoint.example\n\n# normal start\nnimbus_beacon_node \\\n  --network=mainnet \\\n  --data-dir=/data/nimbus \\\n  --el=http://127.0.0.1:8551 \\\n  --jwt-secret=/secrets/jwt.hex \\\n  --rest --rest-address=127.0.0.1 --rest-port=5052",
      note: "The trusted node URL is only used during that one command; afterwards the node follows the chain on its own.",
    },
    pitfalls: [
      "Expecting `/eth/v1/node/syncing` to answer on a default Nimbus node; the REST API is closed until `--rest` is passed.",
      "Looking for a `--checkpoint-sync-url` flag; Nimbus does checkpoint sync through the `trustedNodeSync` subcommand instead.",
      "Passing the execution client's 8545 port to `--el`; the beacon node needs the authenticated [[engine-api|Engine API]] on 8551.",
      "Confusing the Nimbus beacon node with the separate Nimbus execution client project when reading documentation.",
    ],
    related: ["consensus-client", "beacon-node", "beacon-api", "checkpoint-sync", "light-client", "verified-rpc", "validator-client", "engine-api", "client-diversity", "node-hardware"],
    sources: [
      { title: "Nimbus guide", url: "https://nimbus.guide/" },
      { title: "status-im/nimbus-eth2", url: "https://github.com/status-im/nimbus-eth2" },
    ],
  },
  {
    id: "lodestar",
    title: "Lodestar",
    category: "clients",
    aliases: ["ChainSafe", "TypeScript client", "--rest.port", "9596", "lodestar light client"],
    summary: "Lodestar is the TypeScript [[consensus-client|consensus client]] by ChainSafe, running on Node.js, serving the [[beacon-api|Beacon API]] on port 9596, and doubling as the source of a JavaScript [[light-client|light client]] library for browsers.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Lodestar is a TypeScript monorepo run on Node.js, with `lodestar beacon` for the [[beacon-node|beacon node]] and `lodestar validator` for the [[validator-client|validator client]]. Being written in the same language as most Ethereum tooling has a practical consequence: the packages that implement [[ssz|SSZ]], the consensus types, and a spec-compliant [[light-client|light client]] are published as npm libraries, and a browser or Node application can verify [[beacon-block|beacon block]] headers with the same code the node runs; see [[verified-rpc|verified RPC]].",
          "Its option names are dotted and camelCase, which is the main thing to adjust when copying a command from another client: `--execution.urls` for the [[engine-api|Engine API]] endpoint, `--jwt-secret` for the shared secret, `--checkpointSyncUrl` for [[checkpoint-sync|checkpoint sync]], and `--dataDir` for storage.",
        ],
      },
      {
        heading: "RPC-relevant behavior",
        paragraphs: [
          "The [[beacon-api|Beacon API]] listens on 9596, set with `--rest.port` and `--rest.address`, which is far from the 5052 that generic monitoring templates assume. `--execution.urls` accepts more than one execution endpoint, so a beacon node can be configured with a spare [[execution-client|execution client]] to fall back on; see [[failover|failover]].",
          "Running on Node.js means the usual JavaScript operational concerns apply: heap limits are a real ceiling on a large node, and garbage-collection pauses show up as latency in [[beacon-endpoints|Beacon API]] responses rather than as errors. In exchange, the client is easy to embed in test harnesses and devnets, which is why it appears often in cross-client testing setups; see [[client-diversity|client diversity]].",
        ],
      },
    ],
    example: {
      title: "A Lodestar beacon node with checkpoint sync",
      language: "bash",
      code: "lodestar beacon \\\n  --network mainnet \\\n  --dataDir /data/lodestar \\\n  --execution.urls http://127.0.0.1:8551 \\\n  --jwt-secret /secrets/jwt.hex \\\n  --checkpointSyncUrl https://checkpoint.example \\\n  --rest.address 127.0.0.1 \\\n  --rest.port 9596",
      note: "A validator client then points at `http://127.0.0.1:9596`, not 5052, with `lodestar validator --beaconNodes`.",
    },
    pitfalls: [
      "Copying a monitoring or validator configuration that hardcodes 5052; Lodestar's Beacon API default is 9596.",
      "Translating flags literally from another client; Lodestar uses `--execution.urls` and `--checkpointSyncUrl`, not `--execution-endpoint`.",
      "Ignoring Node.js heap limits on a busy node, which surface as slow API responses long before the process fails.",
      "Assuming the light client library gives the same guarantees as a full beacon node; it verifies headers, it does not validate execution.",
    ],
    related: ["consensus-client", "beacon-node", "beacon-api", "light-client", "checkpoint-sync", "validator-client", "verified-rpc", "engine-api", "client-diversity", "client-libraries"],
    sources: [
      { title: "Lodestar documentation", url: "https://chainsafe.github.io/lodestar/" },
      { title: "ChainSafe/lodestar", url: "https://github.com/ChainSafe/lodestar" },
    ],
  },
  {
    id: "grandine",
    title: "Grandine",
    category: "clients",
    aliases: ["grandine beacon", "rust consensus client", "sixth client"],
    summary: "Grandine is a Rust [[consensus-client|consensus client]] designed around parallel processing and large validator counts, implementing the same [[beacon-api|Beacon API]] and [[engine-api|Engine API]] contracts as the other consensus clients.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Grandine is the sixth implementation of the [[consensus-layer|consensus layer]] to follow mainnet, written in Rust and open-sourced in 2024 after several years of closed development. Its design goal is throughput: the block-processing and [[attestation|attestation]] paths are built to use many cores, which is aimed at operators running large numbers of [[validator|validators]] behind one [[beacon-node|beacon node]] rather than at the single-validator case.",
          "It runs the beacon node and validator duties in one process, so a small staking setup does not need a separate [[validator-client|validator client]]. That is convenient, and it is also the usual trade-off: a single process is one failure domain, and separating the two lets you restart or replace the beacon node without touching signing keys.",
        ],
      },
      {
        heading: "Running it and what to check",
        paragraphs: [
          "Grandine takes the same inputs as every other consensus client: a network, a data directory, an execution endpoint on port 8551 with a JWT secret file, and a checkpoint URL for [[checkpoint-sync|checkpoint sync]]. The spelling of its command-line options differs from [[lighthouse|Lighthouse]]'s and [[prysm|Prysm]]'s, so read its own documentation instead of translating a command line flag by flag, and confirm the [[beacon-api|Beacon API]] port it actually bound before wiring up [[health-check|health checks]].",
          "Because the REST API is standardized, everything downstream of it is portable: a [[validator-client|validator client]] from another project, a monitoring dashboard, or a script reading `/eth/v1/node/syncing` works unchanged. That portability is what makes swapping consensus clients a realistic operation rather than a migration, and it is the mechanism behind [[client-diversity|client diversity]].",
          "One nuance is worth naming: Grandine and Lighthouse are both written in Rust and, like every client, lean on shared cryptography libraries for BLS signatures and hashing. Implementation diversity reduces correlated failure, but it does not eliminate it where clients share a language, a dependency, or a specification misreading.",
        ],
      },
    ],
    pitfalls: [
      "Assuming Grandine's flags match Lighthouse's because both are written in Rust; the option names are its own.",
      "Treating a combined beacon-and-validator process as equivalent to a separated setup; restarting it stops attesting as well as following the chain.",
      "Counting language diversity as full independence when two clients share the same BLS library.",
    ],
    related: ["consensus-client", "client-diversity", "beacon-node", "validator-client", "beacon-api", "checkpoint-sync", "lighthouse", "consensus-layer"],
    sources: [
      { title: "grandinetech/grandine", url: "https://github.com/grandinetech/grandine" },
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
    ],
  },
  {
    id: "client-diversity",
    title: "Client diversity",
    category: "clients",
    aliases: ["supermajority client", "clientdiversity.org", "minority client", "web3_clientVersion"],
    summary: "Client diversity is the property that no single implementation runs a large enough share of the network for its bugs to split or finalize the chain incorrectly, on both the [[execution-layer|execution]] and [[consensus-layer|consensus]] layers.",
    sections: [
      {
        heading: "Why the share matters",
        paragraphs: [
          "Every [[execution-client|execution client]] and [[consensus-client|consensus client]] is an independent reading of the same specifications, and any of them can contain a bug that makes it accept a block the others reject, or the reverse. What that bug costs depends entirely on how many [[validator|validators]] run the client that has it, and three thresholds matter.",
          "Below a third of the network, a broken client is the one that suffers: its nodes follow a chain nobody else does, its validators miss duties and leak stake, and the rest of the network keeps [[finality|finalizing]] normally. Above a third, no branch can be finalized until the disagreement is resolved, so the whole network stalls at the last finalized checkpoint. Above two thirds, the broken client can finalize its own invalid chain, and undoing that requires coordinated human intervention rather than a protocol mechanism. Those thresholds are why operators are asked to run clients that are not already dominant, and why [[network-telemetry|trackers]] such as clientdiversity.org publish the distribution.",
          "This is not theoretical. In May 2023 mainnet twice went several epochs without finalizing when unusual load exposed a bug present in some consensus clients and not others; the unaffected clients kept the chain running while the others were fixed. A single-implementation network would have had no such margin.",
        ],
      },
      {
        heading: "Finding out what you are talking to",
        paragraphs: [
          "On the execution side, [[net-web3-api|web3_clientVersion]] returns a free-form string that identifies the software, its version, and its platform. On the consensus side the equivalent is `GET /eth/v1/node/version` from the [[beacon-api|Beacon API]]. Neither is authenticated or guaranteed, and an [[rpc-provider|RPC provider]] that fronts a mixed fleet may return its own gateway's string, a rewritten value, or a different backend on each request.",
          "For an application, diversity is also an interface question. Clients differ in which [[namespaces|namespaces]] they serve, in [[rpc-errors|error codes and messages]] for the same failure, in gas caps on [[eth-call|eth_call]], in [[eth-simulate|eth_simulateV1]] support, and in how much historical state they keep. Code tested against exactly one client tends to encode its quirks, and the moment a [[failover|failover]] sends traffic to a different implementation, those assumptions surface as production errors. Probing with real calls, as in [[endpoint-capabilities|endpoint capabilities]], is more reliable than reading a version string.",
        ],
      },
    ],
    example: {
      title: "Asking an endpoint which software it runs",
      language: "bash",
      code: "curl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"web3_clientVersion\",\"params\":[]}' \\\n  http://127.0.0.1:8545\n\n# result strings have this shape, one per implementation:\n#   \"Geth/v1.15.0-stable-…/linux-amd64/go1.23.0\"\n#   \"Nethermind/v1.31.0+…/linux-x64/dotnet9.0.0\"\n#   \"erigon/3.0.0/linux-amd64/go1.23.0\"\n#   \"reth/v1.3.0-…/x86_64-unknown-linux-gnu\"\n#   \"besu/v25.4.0/linux-x86_64/openjdk-java-21\"\n\n# the consensus client answers on its own API\ncurl -s http://127.0.0.1:5052/eth/v1/node/version\n#   {\"data\":{\"version\":\"Lighthouse/v7.0.0-…/x86_64-linux\"}}",
      note: "The version numbers here are illustrative; what is reliable is the shape, which names the implementation, its build, and its platform.",
    },
    pitfalls: [
      "Treating `web3_clientVersion` as authoritative on a hosted endpoint; providers may rewrite it or route the next request to different software.",
      "Choosing a client for a validator setup by popularity, which is precisely the pressure that creates a supermajority.",
      "Testing an application against one client only, then discovering during a failover that error messages and namespace coverage differ.",
      "Running a diverse set of execution clients while every one of your [[beacon-node|beacon nodes]] is the same consensus client; the risk applies to both layers independently.",
    ],
    related: ["execution-client", "consensus-client", "net-web3-api", "endpoint-capabilities", "failover", "beacon-api", "geth", "lighthouse", "rpc-provider", "namespaces"],
    sources: [
      { title: "clientdiversity.org", url: "https://clientdiversity.org/" },
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
    ],
  },
  {
    id: "validator-client",
    title: "Validator client",
    category: "clients",
    aliases: ["VC", "slashing protection", "keymanager", "fee recipient", "EIP-3076"],
    summary: "A validator client is the process that holds [[validator|validator]] signing keys, asks a [[beacon-node|beacon node]] over the [[beacon-api|Beacon API]] what duties are due, and signs [[attestation|attestations]], [[block-proposal|block proposals]], and [[sync-committee|sync committee]] messages.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "The validator client is deliberately small. It has no peer-to-peer connections, no chain database, and nothing to sync; it holds BLS keys and a record of what it has already signed. Everything it knows about the chain comes from one or more beacon nodes over HTTP, which is what allows the two to be separated across machines, trust boundaries, or even client implementations — a [[lighthouse|Lighthouse]] validator client can drive a [[teku|Teku]] beacon node, because the API between them is standardized.",
          "It never talks to the [[execution-client|execution client]]. The `--suggested-fee-recipient` [[address|address]] it announces reaches the [[execution-layer|execution layer]] indirectly: the validator client tells the beacon node, the beacon node puts it into `payloadAttributes` on `engine_forkchoiceUpdated`, and the execution client credits that address when it builds the payload.",
        ],
      },
      {
        heading: "The duty loop",
        paragraphs: [
          "Once per epoch the validator client asks for its assignments: `POST /eth/v1/validator/duties/attester/{epoch}` with its validator indices, and `GET /eth/v1/validator/duties/proposer/{epoch}`. At the assigned slot it fetches the data to sign — `GET /eth/v1/validator/attestation_data` for an attestation, `GET /eth/v3/validator/blocks/{slot}` for a proposal — signs it locally, and publishes it back through the beacon node, which gossips it to the network.",
          "Pointing the validator client at several beacon nodes gives redundancy: if one is down or its execution client is unhealthy, duties continue against another; see [[failover|failover]]. When [[mev-boost|MEV-Boost]] is in use, the proposal path returns a [[builder-api|blinded block]] that the validator signs without seeing the transactions, and the beacon node then exchanges the signature for the full block.",
        ],
      },
      {
        heading: "Keys and slashing protection",
        paragraphs: [
          "Because signing two conflicting messages is punished by [[slashing|slashing]], every validator client keeps a [[slashing-protection|slashing protection database]] of what each key has signed: Lighthouse records every block and attestation, while a minimal database keeps only the highest block slot and the attestation source and target epochs. That database is as important as the keys themselves: it must move with them, using the EIP-3076 interchange format, and it must never be restored from an old snapshot, because a rolled-back record will happily approve a signature it has already made.",
          "Keys can also live somewhere else entirely. [[remote-signer|A remote signer]] such as Web3Signer holds them and exposes a signing endpoint, so the validator client sends the message to be signed rather than loading a key. Clients additionally offer an authenticated keymanager API for importing and removing keys at runtime, which is a separate listener from the beacon node's [[beacon-api|Beacon API]] and should stay on a private network; see [[authentication|authentication]].",
        ],
      },
    ],
    example: {
      title: "A validator client pointed at two beacon nodes",
      language: "bash",
      code: "lighthouse vc \\\n  --network mainnet \\\n  --datadir /data/vc \\\n  --beacon-nodes http://127.0.0.1:5052,http://10.0.0.8:5052 \\\n  --suggested-fee-recipient 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 \\\n  --builder-proposals\n\n# what it asks a beacon node for, each epoch and each assigned slot:\n#   POST /eth/v1/validator/duties/attester/{epoch}\n#   GET  /eth/v1/validator/duties/proposer/{epoch}\n#   GET  /eth/v3/validator/blocks/{slot}",
      note: "Both URLs point at [[beacon-node|beacon nodes]]; no part of this process ever opens a connection to an execution client.",
    },
    pitfalls: [
      "Running two validator clients with the same keys [[distributed-validator|for redundancy]]; that is the classic way to get slashed, and no protection database spans two hosts.",
      "Migrating keys without exporting the EIP-3076 slashing protection interchange, or restoring one from a backup taken before the last signatures.",
      "Exposing the keymanager API on a public interface; it can import and delete keys.",
      "Assuming a validator client needs its own execution endpoint; the fee recipient reaches the execution layer through the beacon node.",
    ],
    related: ["beacon-node", "consensus-client", "beacon-api", "validator", "slashing", "mev-boost", "block-proposal", "attestation", "authentication", "lighthouse", "validator-node", "remote-signer"],
    sources: [
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "EIP-3076: Slashing protection interchange format", url: "https://eips.ethereum.org/EIPS/eip-3076" },
      { title: "Lighthouse book: validator client", url: "https://lighthouse-book.sigmaprime.io/" },
    ],
  },
  {
    id: "beacon-node",
    title: "Beacon node",
    category: "clients",
    aliases: ["BN", "beacon chain node", "node/syncing", "el_offline", "is_optimistic"],
    summary: "A beacon node is the [[consensus-client|consensus client]] process that syncs the Beacon Chain over libp2p, runs [[fork-choice|fork choice]], drives one [[execution-client|execution client]] through the [[engine-api|Engine API]], and serves the [[beacon-api|Beacon API]].",
    sections: [
      {
        heading: "What it does",
        paragraphs: [
          "The beacon node is the half of a node that decides what the chain is. It receives [[beacon-block|beacon blocks]] and [[attestation|attestations]] over gossip on port 9000 (some clients default elsewhere, notably [[prysm|Prysm]]), verifies their [[bls-signature|BLS signatures]], applies them to its fork choice, and keeps the justified and finalized checkpoints up to date; see [[libp2p-gossip|consensus networking]] and [[finality|finality]].",
          "It pairs one-to-one with an execution client. The [[engine-api|Engine API]] has no notion of several callers: each `engine_forkchoiceUpdated` sets one head, so two beacon nodes pointed at the same execution client would overwrite each other's view. One beacon node can, however, serve many [[validator-client|validator clients]], and one validator client can list several beacon nodes for redundancy.",
        ],
      },
      {
        heading: "What it can answer",
        paragraphs: [
          "The [[beacon-api|Beacon API]] exposes the chain as REST resources: headers and blocks by slot or root, `finality_checkpoints` for a state, the validator registry, and [[blob|blobs]] at `/eth/v1/beacon/blobs/{block_id}`, which beacon-APIs v4.0.0 added in place of the deprecated `/eth/v1/beacon/blob_sidecars/{block_id}` — blob data lives here, not on the execution client, and is dropped after 4096 epochs, roughly 18 days. Since Fulu a node custodies data columns rather than whole blobs, so only a supernode, which custodies every column, is required to return them; other nodes may reconstruct them or refuse. `/eth/v1/events` is a [[server-sent-events|server-sent-event stream]] carrying `head`, `finalized_checkpoint`, and `chain_reorg`, which is how a [[indexer|indexer]] can watch consensus without polling.",
          "State queries are the expensive case. Beacon nodes store periodic state snapshots and replay blocks to reach the rest, so asking for a state at an old slot either takes real work or is refused, depending on the client's retention settings. `head` and `finalized` state ids are always cheap; arbitrary historical slots are not, which is the consensus-layer counterpart to needing an [[archive-node|archive node]] on the execution side.",
        ],
      },
      {
        heading: "Checking whether it is healthy",
        paragraphs: [
          "`GET /eth/v1/node/syncing` is the single most useful endpoint for [[health-check|health checks]]. `is_syncing` and `sync_distance` say how far behind the head it is; `is_optimistic` is `true` when the node has imported blocks its execution client has not yet validated; and `el_offline` is `true` when the Engine API connection is broken. A node with `is_syncing: false` and `el_offline: true` is not healthy — it is coasting, and the `safe` and `finalized` [[block-tag|block tags]] on the paired execution client will stop moving.",
          "[[checkpoint-sync|Checkpoint sync]] is how a beacon node is normally started: it fetches a recent finalized state from a trusted [[beacon-api|Beacon API]] and begins from there, optionally backfilling older blocks afterwards. That is what makes a fresh consensus client usable in minutes instead of days, and it is also what satisfies [[weak-subjectivity|weak subjectivity]].",
        ],
      },
    ],
    example: {
      title: "The health endpoint every monitoring setup should watch",
      language: "bash",
      code: "curl -s http://127.0.0.1:5052/eth/v1/node/syncing\n\n# {\n#   \"data\": {\n#     \"head_slot\": \"9876543\",\n#     \"sync_distance\": \"0\",\n#     \"is_syncing\": false,\n#     \"is_optimistic\": false,\n#     \"el_offline\": false\n#   }\n# }",
      note: "All four flags matter; alerting only on `is_syncing` hides a node whose execution client has disappeared.",
    },
    pitfalls: [
      "Pointing two beacon nodes at one execution client; they will fight over the head through `engine_forkchoiceUpdated`.",
      "Alerting on `is_syncing` alone and missing `el_offline` or `is_optimistic`, which describe a node that looks fine and is not.",
      "Requesting beacon state at an arbitrary old slot from a normally configured node; states are reconstructed, not all stored.",
      "Expecting blob data from the execution client after roughly 18 days; the [[consensus-layer|consensus layer]] is where blob data lives, and it drops it after 4096 epochs, so older blobs come from a [[blob-archive|blob archive]].",
      "Pointing a blob consumer at an ordinary post-Fulu beacon node; only supernodes are required to answer `/eth/v1/beacon/blobs/{block_id}`.",
    ],
    related: ["consensus-client", "beacon-api", "engine-api", "validator-client", "checkpoint-sync", "health-check", "fork-choice", "blob", "execution-client", "beacon-endpoints", "validator-node"],
    sources: [
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "ethereum/consensus-specs", url: "https://github.com/ethereum/consensus-specs" },
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
    ],
  },
  {
    id: "client-storage",
    title: "Client storage engines",
    category: "clients",
    aliases: ["PBSS", "hash-based state", "path-based state", "Bonsai", "MDBX", "static files", "freezer"],
    summary: "A client storage engine is the layout an [[execution-client|execution client]] uses to keep [[state|state]] and history on disk — hash-keyed tries, path-keyed tries, or flat key-value records plus change sets — and it decides which historical RPC queries the node can answer.",
    sections: [
      {
        heading: "Two different things to store",
        paragraphs: [
          "A node stores state and history, and they behave differently. State is the current value of every account and storage slot, and it is what [[eth-get-balance|eth_getBalance]], [[eth-call|eth_call]], and [[eth-get-storage-at|eth_getStorageAt]] read. History is the sequence of blocks, transactions, and receipts, which is what [[eth-get-block-by-number|eth_getBlockByNumber]] and [[eth-get-logs|eth_getLogs]] read. A node can have all of the history and almost none of the old state, which is exactly what a normal [[full-node|full node]] is.",
          "History is append-only, so clients move it out of their main database into immutable files: Geth's freezer or ancient store, Erigon's snapshot files, and Reth's static files all do this, and all of them can sit on cheaper storage than the live database. State is the part that is rewritten every block, and it is where the layouts differ.",
        ],
      },
      {
        heading: "How the state trie is keyed",
        paragraphs: [
          "The original layout keys every node of the [[merkle-patricia-trie|Merkle-Patricia trie]] by the hash of its contents. Because a changed node gets a new hash, every version of every node accumulates, which makes an [[archive-node|archive node]] trivial — never delete anything — and makes an ordinary node expensive, since the database grows and random writes multiply.",
          "The path-based layouts key a trie node by its position in the trie instead: [[geth|Geth]]'s path-based scheme, the default for new databases since v1.14, [[nethermind|Nethermind]]'s half-path layout, which 2.0 keeps only for upgraded databases and nodes started with `FlatDb.Enabled=false`, and [[besu|Besu]]'s Bonsai format. Each node then has exactly one current record, the database stops growing with history, and older versions survive only inside a bounded window of diff layers or trie logs — around 128 blocks on Geth. Past that window a [[pruned-node|pruned node]] answers `missing trie node`.",
          "The flat layouts, used by [[erigon|Erigon]], [[reth|Reth]], new Nethermind 2.0 databases, and in spirit by Bonsai, go further: the authoritative record is the value itself, keyed by address and slot, and trie nodes are computed only when a [[state-root|state root]] must be produced. History becomes a set of change sets, so keeping every past value costs far less than keeping a trie per block, which is why archive nodes on these clients are affordable.",
        ],
      },
      {
        heading: "What an RPC caller sees",
        paragraphs: [
          "The first consequence is which blocks answer at all. The same [[eth-call|eth_call]] at a two-year-old block succeeds on a flat archive node, fails with `missing trie node` on a path-based pruned node, and may be answered from an entirely different database on a hash-based archive node. Probing beats assuming; see [[endpoint-capabilities|endpoint capabilities]].",
          "The second is proofs. [[eth-get-proof|eth_getProof]] returns actual trie nodes, and a client that stores values flat has to rebuild them. Historical proofs are therefore unavailable by default even on a node that holds every historical value, which surprises teams building [[state-proof|state proofs]] against an archive endpoint. Clients that offer them make it an opt-in, most of them by storing extra trie or commitment data: Geth 1.17's `--history.trienode`, Nethermind 2.0's `FlatDb.ArchiveProofServeEnabled` with `FlatDb.ArchiveProofBuildEnabled` on unwindowed flat history, Erigon 3's `--prune.include-commitment-history`, and Reth's `--rpc.eth-proof-window`, which reaches at most 1,209,600 blocks below the head.",
          "The third is history retention, which is separate from all of this: transaction indices and old bodies can be trimmed independently of state, as with Geth's `--history.transactions`, and [[history-expiry|history expiry]] removes pre-Merge data entirely. Underneath every layout is the same hardware requirement — random reads dominate, so [[node-hardware|NVMe with high IOPS]] is not optional. [[beacon-node|Beacon nodes]] store differently again: [[ssz|SSZ]] states with periodic snapshots and replay rather than a trie.",
        ],
      },
    ],
    example: {
      title: "What each execution client writes where",
      language: "text",
      code: "Geth        Pebble or LevelDB + freezer files   path-based trie by default, ~128-block state window\nNethermind  RocksDB                             2.0: flat values, optional flat history; upgraded nodes keep the half-path trie\nErigon      MDBX + snapshot files               flat values plus change sets\nReth        MDBX + static files                 flat values, archive unless --full\nBesu        RocksDB                             Bonsai flat state with trie logs, or Forest trie",
      note: "Nothing in the [[json-rpc|JSON-RPC]] specification covers retention, so two clients answer the same historical query differently because of this column alone.",
    },
    pitfalls: [
      "Assuming an archive node can produce a historical `eth_getProof`; by default flat storage keeps values, not the trie nodes a proof is made of.",
      "Reading `missing trie node` as database corruption; it usually means the state at that block was pruned.",
      "Sizing a disk from a client's state size and forgetting history, or converting a node between storage schemes without budgeting for a full resync.",
      "Putting the live state database on network storage because the append-only history files tolerate it; state is random-write and will not.",
    ],
    related: ["execution-client", "archive-node", "pruned-node", "geth", "erigon", "reth", "nethermind", "besu", "eth-get-proof", "history-expiry", "merkle-patricia-trie", "node-hardware"],
    sources: [
      { title: "Geth: archive mode and state history", url: "https://geth.ethereum.org/docs/fundamentals/archive" },
      { title: "Nethermind: archive nodes", url: "https://docs.nethermind.io/fundamentals/archive-nodes" },
      { title: "Erigon documentation", url: "https://docs.erigon.tech/" },
      { title: "Besu: data storage formats", url: "https://docs.besu-eth.org/public-networks/concepts/data-storage-formats" },
    ],
  },
  {
    id: "validator-node",
    title: "Validator node",
    category: "clients",
    aliases: ["staking node", "staking setup", "validator deployment", "EL + BN + VC", "home staking machine"],
    summary: "A validator node is the whole staking deployment — an [[execution-client|execution client]], a [[beacon-node|beacon node]] and a [[validator-client|validator client]], often with [[mev-boost|MEV-Boost]], a [[remote-signer|remote signer]] or [[distributed-validator|distributed-validator]] middleware — wired so that a [[validator|validator]]'s duties are signed and published on time.",
    sections: [
      {
        heading: "Three processes, three interfaces",
        paragraphs: [
          "The validator is a key, the validator client is the process that signs with it, and the validator node is everything the signature depends on. The execution client and beacon node talk over the [[engine-api|Engine API]] on port 8551, authenticated by a shared 32-byte JWT secret: the beacon node hands over each block's payload with `engine_newPayload`, names the head with `engine_forkchoiceUpdated`, and asks for a payload to be built when its validator proposes. The validator client talks to the beacon node over the [[beacon-api|Beacon API]] validator endpoints for duties, attestation data, block production and publishing. The beacon node talks to MEV-Boost, on port 18550 by default, over the [[builder-api|builder API]]: register validators, fetch a header bid, submit the signed blinded block.",
          "The optional pieces slot into those interfaces. A remote signer sits behind the validator client, which sends it signing requests instead of loading keys. Distributed-validator middleware such as Obol's Charon sits between validator clients and beacon nodes, presenting a Beacon API to each client while it coordinates a threshold signature across operators. The counts matter: one execution client per beacon node, because the Engine API has a single fork-choice caller; many validator clients per beacon node; several beacon nodes per validator client; one MEV-Boost for several beacon nodes. The validator client never talks to the execution client.",
        ],
      },
      {
        heading: "How a failure travels",
        paragraphs: [
          "An execution client that is down or syncing cannot validate payloads, so its beacon node stalls or imports blocks optimistically, and `/eth/v1/node/syncing` reports `el_offline` or `is_optimistic`. The optimistic sync specification then forbids the validator from proposing, attesting or taking part in [[sync-committee|sync committee]] duties, so every duty in that period is missed. That costs penalties, not [[slashing|slashing]], and MEV-Boost does not help: an optimistic node must not propose even with a builder bid in hand.",
          "The other failures are narrower. A beacon node that disappears takes its validator clients with it unless they list another; see [[failover|failover]]. A relay or MEV-Boost outage sends the beacon node back to a locally built payload, so the proposal survives with less value. A wrong JWT secret or clock skew between hosts makes every Engine API call fail, which from the validator's side looks exactly like the execution client being down.",
        ],
      },
      {
        heading: "RPC load on the validating execution client",
        paragraphs: [
          "An attester publishes when the slot's block has been imported or when about a third of the slot has passed, four seconds on mainnet today, whichever comes first. Import includes the execution client running the payload inside `engine_newPayload`. An execution client that shares CPU, disk and database with public traffic — wide [[eth-get-logs|eth_getLogs]] scans, `debug_traceBlockByNumber`, bursts of [[eth-call|eth_call]] — runs that payload later, and when import slips past the deadline the attestation votes for the parent as head and loses the head reward. A proposer that builds or validates slowly publishes late, and a late block risks being orphaned by the next proposer. Nethermind's documentation warns that full pruning can reduce validator rewards for the same reason.",
          "The usual answer is separation. The validating execution client serves only the Engine API and local monitoring, while public [[json-rpc|JSON-RPC]] goes to other nodes behind a [[load-balancer|load balancer]]. Where one machine has to do both, cap the expensive methods with [[rate-limits|rate limits]], keep the public listener on its own interface, and watch `newPayload` latency and attestation timeliness beside the RPC dashboards.",
        ],
      },
    ],
    example: {
      title: "The wiring of one validator node",
      language: "text",
      code: "execution client ──Engine API :8551, JWT──▶ beacon node ◀──Beacon API──  validator client\n                                             │                               │\n                                             └──builder API :18550──▶ MEV-Boost ──▶ relays\n                                                                             │\n                                         remote signer (optional) ◀──────────┘\n\none execution client per beacon node\nmany validator clients per beacon node, several beacon nodes per validator client\npublic JSON-RPC: a different execution client",
      note: "Every arrow is a place where latency or an outage turns into a missed duty; the validator client's only upstreams are beacon nodes and, optionally, a signer.",
    },
    pitfalls: [
      "Pointing public dapp traffic at the execution client behind a validator's beacon node, so tracing bursts delay `newPayload` and cost head votes.",
      "Building redundancy by duplicating the entire node including its keys, instead of giving one validator client several beacon nodes.",
      "Alerting on execution sync alone and missing a beacon node that reports `el_offline` or `is_optimistic` while its duties are skipped.",
      "Assuming MEV-Boost keeps a proposal alive while the execution client is down; an optimistic beacon node must not propose at all.",
    ],
    related: ["validator-client", "beacon-node", "execution-client", "engine-api", "mev-boost", "builder-api", "remote-signer", "distributed-validator", "attestation", "load-balancer"],
    sources: [
      { title: "Consensus specs: optimistic sync, validator assignments", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/bellatrix/optimistic-sync.md" },
      { title: "Engine API specification", url: "https://github.com/ethereum/execution-apis/tree/main/src/engine" },
      { title: "Builder API specification", url: "https://github.com/ethereum/builder-specs" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
    ],
  },
  {
    id: "remote-signer",
    title: "Remote signer",
    category: "clients",
    aliases: ["Web3Signer", "Dirk", "external signer", "keymanager API", "/eth/v1/remotekeys", "EIP-3076", "Clef"],
    summary: "A remote signer is a separate service that holds [[validator|validator]] keys and returns [[bls-signature|BLS signatures]] to the [[validator-client|validator client]] that asks, so the process that talks to the network never holds the key and slashing protection sits next to the key rather than next to the client.",
    sections: [
      {
        heading: "Signing over a wire",
        paragraphs: [
          "A validator client normally loads keystores and signs locally. With a remote signer it builds the object to sign — an [[attestation|attestation]], a block, a RANDAO reveal, a sync committee message — and sends it instead. Web3Signer, from Consensys, takes `POST /api/v1/eth2/sign/{identifier}`, where the identifier is the validator's BLS public key and the body carries a `type` such as `ATTESTATION` or `BLOCK_V2`, the `fork_info` needed for the signing domain, an optional `signingRoot`, and the object itself; it answers with the signature. The major validator clients can all delegate signing to it.",
          "Dirk, from Attestant, speaks gRPC over mutual TLS with a certificate per client, and is usually driven by Attestant's Vouch validator client. It holds ordinary keys or distributed ones, generated so that any k of n Dirk instances together produce a valid threshold signature and no single machine holds the whole key, the signer-side cousin of [[distributed-validator|distributed validators]]. Keys are managed at runtime through the standard keymanager API, served by whichever binary holds them and authenticated with a token: `/eth/v1/keystores` lists, imports and deletes local keystores, and `/eth/v1/remotekeys` registers public keys whose signing a validator client delegates to a signer URL.",
        ],
      },
      {
        heading: "Slashing protection belongs with the key",
        paragraphs: [
          "The signer that holds a key is the one place that sees every signature made with it, so that is where [[slashing|slashing]] protection belongs. Web3Signer checks each request against a [[slashing-protection|slashing-protection database]] by default, PostgreSQL reached through `--slashing-protection-db-url`, so several validator clients, or several Web3Signer instances sharing that database, cannot obtain conflicting signatures through it. Dirk keeps its own records. Both import and export the EIP-3076 interchange format: JSON whose `metadata` carries `interchange_format_version` 5 and the `genesis_validators_root`, then per key the `signed_blocks` by slot and the `signed_attestations` by source and target epoch. The keymanager API moves the same data: an import carries it and a delete returns it.",
          "Protection covers only the requests it sees. Two signers with separate databases holding one key, a key still loaded in a validator client after it was registered as remote, or a [[failover|failover]] script that starts a second client against a second signer while the first is merely slow, all bring back the double signature the design exists to rule out. Doppelganger protection, which Lighthouse documents as staying silent for two to three epochs while it listens for the key elsewhere, is a last line of defence that its own documentation calls imperfect.",
        ],
      },
      {
        heading: "Latency, availability, and Clef",
        paragraphs: [
          "Every duty now includes a network round trip and a database write before the signature returns, and an attestation is due about four seconds into the slot. A signer across a slow link, a loaded database, or a threshold signer waiting for k of n instances can push messages past their deadline and cost rewards, and a signer outage misses every duty of every key it holds at once. Web3Signer exposes `/upcheck` and `/healthcheck`; alert on signing latency as well as liveness. The [[validator-node|validator node]] lesson covers the rest of that timing chain.",
          "Clef is a different tool for a similar idea: an execution-layer signer for transactions and [[eip-712|EIP-712]] typed data that [[geth|Geth]] reached through `--signer`, not a validator signer. It was removed from the go-ethereum repository in June 2026 as no longer maintained and continues in a separate ethereum/clef repository, while Geth still accepts an external signer through `--signer`. For execution-layer signing from applications, see [[signing-methods|signing methods]].",
        ],
      },
    ],
    example: {
      title: "A Web3Signer attestation signing request",
      language: "http",
      code: "POST /api/v1/eth2/sign/0x989d34725a2bfc3f15105f3f5fc8741f436c25ee1ee4f948e425d6bcb8c56bce6e06c269635b7e985a7ffa639e2409bf HTTP/1.1\nContent-Type: application/json\n\n{\n  \"type\": \"ATTESTATION\",\n  \"fork_info\": {\n    \"fork\": { \"previous_version\": \"0x05000000\", \"current_version\": \"0x06000000\", \"epoch\": \"411392\" },\n    \"genesis_validators_root\": \"0x4b363db94e286120d76eb905340fdd4e54bfe9f06bf33ff6cf5ad27f511bfe95\"\n  },\n  \"attestation\": {\n    \"slot\": \"15314400\",\n    \"index\": \"0\",\n    \"beacon_block_root\": \"0x7d5a4369…f0d3\",\n    \"source\": { \"epoch\": \"478574\", \"root\": \"0x2b1f8c07…91ab\" },\n    \"target\": { \"epoch\": \"478575\", \"root\": \"0x9b83c12c…ee71\" }\n  }\n}\n\nHTTP/1.1 200 OK\n{ \"signature\": \"0xb3baa751…a5d9\" }",
      note: "The signer checks `source` and `target` against its slashing-protection database before it signs; a request that would make a surround or double vote is refused rather than signed.",
    },
    pitfalls: [
      "Pointing a standby validator client at a second signer with its own slashing database, so a failover can sign twice.",
      "Leaving keys imported in the validator client after registering them as remote keys, so two places can sign with them.",
      "Moving a key between signers without its EIP-3076 export, or importing an export taken before the last signatures.",
      "Exposing the keymanager API or the signer's HTTP port beyond the validator hosts; either can add, remove or use keys.",
      "Placing the signer or its database far from the validator client and discovering the latency in attestation timeliness.",
    ],
    related: ["validator-client", "validator-node", "slashing", "bls-signature", "distributed-validator", "validator", "failover", "authentication", "signing-methods", "geth"],
    sources: [
      { title: "Keymanager API specification", url: "https://github.com/ethereum/keymanager-APIs" },
      { title: "EIP-3076: Slashing protection interchange format", url: "https://eips.ethereum.org/EIPS/eip-3076" },
      { title: "Consensys/web3signer", url: "https://github.com/Consensys/web3signer" },
      { title: "attestantio/dirk", url: "https://github.com/attestantio/dirk" },
    ],
  },
  {
    id: "helios",
    title: "Helios",
    category: "clients",
    aliases: ["a16z helios", "helios light client", "@a16z/helios", "helios ethereum", "heliosup", "verifying RPC proxy"],
    summary: "Helios is a16z's Rust [[light-client|light client]] that follows Ethereum consensus through [[sync-committee|sync committee]] signatures and turns an untrusted execution RPC into a local [[json-rpc|JSON-RPC]] endpoint whose answers it checks with [[eth-get-proof|eth_getProof]] and its own EVM.",
    sections: [
      {
        heading: "Two trust paths",
        paragraphs: [
          "The consensus side starts from a weak-subjectivity checkpoint, `--checkpoint`, the root of the first beacon block of an epoch. Helios fetches a bootstrap and then [[light-client-update|light client updates]] from `--consensus-rpc`, any beacon node that serves the Beacon API light-client routes, and verifies each sync committee aggregate, walking forward one committee period at a time. That is the [[consensus-proof|consensus proof]] that yields a [[trusted-header|trusted header]] with a `stateRoot` and block hash. The README recommends a checkpoint less than two weeks old; an older one only warns unless `--strict-checkpoint-age` is set, and after the first run Helios caches the latest finalized root in its data directory; see [[weak-subjectivity|weak subjectivity]].",
          "The execution side is `--execution-rpc`, any provider that serves eth_getProof. A balance, nonce or storage read becomes an eth_getProof call verified against the trusted root, and code is hashed against the proven `codeHash`; see [[state-proof|state proof]]. [[eth-call|eth_call]] and [[eth-estimate-gas|eth_estimateGas]] go further: Helios asks the provider for [[eth-create-access-list|eth_createAccessList]] as a hint of which accounts and slots the call will touch, proves each one, and executes the call in a local EVM, fetching and proving anything the hint missed. The hint affects only speed; a dishonest one cannot change the result.",
        ],
      },
      {
        heading: "What it serves, and on which chains",
        paragraphs: [
          "Helios listens on `127.0.0.1:8545` by default, changed with `--rpc-port` and `--rpc-bind-ip`, and also ships as a Rust library and as the `@a16z/helios` npm package, compiled to WebAssembly, whose provider exposes an [[eip-1193|EIP-1193]]-style `request` method in the browser. Its method list covers state reads, calls and gas estimates, blocks, transactions, receipts, [[eth-get-logs|eth_getLogs]] and filters, `eth_sendRawTransaction`, and `eth_subscribe` for `newHeads` only. Receipts are checked by fetching the block's whole receipt list and matching it against `receiptsRoot`, and blocks within the 8191 hashes kept by the EIP-2935 history contract can be proven through it.",
          "`helios ethereum` covers mainnet and the testnets it lists, while `helios opstack --network op-mainnet` or `base` and `helios linea` cover rollups. The rollup modes rest on a different root of trust: on OP Stack chains Helios accepts blocks signed by the chain's unsafe-block signer, the [[sequencer|sequencer]] key, whose address it can check against the L1 system configuration. That proves what the sequencer published, not what Ethereum has settled; see [[optimistic-rollup|optimistic rollups]].",
        ],
      },
      {
        heading: "Where the guarantee stops",
        paragraphs: [
          "Some answers are not facts a proof can establish. `eth_gasPrice` is the verified base fee plus a fixed 1 gwei tip, and `eth_maxPriorityFeePerGas` is that constant. `eth_sendRawTransaction` is relayed to the untrusted provider; Helios checks that the returned hash matches the transaction but cannot see the [[mempool|pool]] or force inclusion. Namespaces outside its list, such as [[debug-api|debug_]] and [[trace-api|trace_]], are not served at all rather than passed through unverified, which is the safer failure.",
          "Logs are the subtle case. Helios checks that every log a provider returns appears in the proven receipts of its block, which proves inclusion; it does not look at blocks the provider left out, so a provider can omit logs without being caught. Everything also rests on the bootstrap: `--load-external-fallback`, which takes the most common checkpoint from a community list of endpoints, is convenient and hands the choice of chain to that list. And Helios verifies for the process that runs it; other hosts using it over the network are trusting its operator, as with any [[verified-rpc|verified RPC]] setup.",
        ],
      },
    ],
    example: {
      title: "Running Helios in front of an untrusted provider",
      language: "bash",
      code: "helios ethereum \\\n  --network mainnet \\\n  --execution-rpc https://rpc.example \\\n  --consensus-rpc https://beacon.example \\\n  --checkpoint 0x<root of the first block of a recent finalized epoch> \\\n  --strict-checkpoint-age\n\n# USDC balanceOf(vitalik.eth), answered from proven state and a local EVM run\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[{\"to\":\"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\"data\":\"0x70a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045\"},\"latest\"]}' \\\n  http://127.0.0.1:8545",
      note: "Behind that one call Helios sends the provider an eth_createAccessList for the hint and an eth_getProof per touched account, then runs the call itself.",
    },
    pitfalls: [
      "Treating a verified `eth_getLogs` result as complete; Helios proves that returned logs exist, not that none were left out.",
      "Reading `eth_gasPrice` from Helios as a market estimate when its tip component is a fixed 1 gwei.",
      "Using `--load-external-fallback` as the normal bootstrap, which lets whatever checkpoint the listed endpoints agree on decide the chain.",
      "Choosing an execution provider that lacks or rate-limits `eth_getProof`, when every verified state read becomes one or more proof calls.",
      "Assuming the OP Stack mode carries Ethereum's security; it verifies the sequencer's signature on unsafe blocks.",
    ],
    related: ["light-client", "verified-rpc", "trusted-header", "consensus-proof", "light-client-update", "sync-committee", "state-proof", "eth-get-proof", "weak-subjectivity", "eth-create-access-list"],
    sources: [
      { title: "a16z/helios", url: "https://github.com/a16z/helios" },
      { title: "Helios: supported RPC methods", url: "https://github.com/a16z/helios/blob/master/rpc.md" },
      { title: "Consensus specs: Altair light client sync protocol", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/altair/light-client/sync-protocol.md" },
    ],
  },
  {
    id: "client-extensions",
    title: "Client extensions",
    category: "clients",
    aliases: ["ExEx", "execution extensions", "Nethermind plugins", "live tracing", "--vmtrace", "INethermindPlugin", "tracing.Hooks"],
    summary: "Client extensions are code that runs inside an [[execution-client|execution client]]'s process — Nethermind plugins, Reth's ExEx, Geth's live tracers — and sees blocks, transactions and state changes as the node executes them, instead of asking for them over [[json-rpc|JSON-RPC]] afterwards.",
    sections: [
      {
        heading: "Why run inside the node",
        paragraphs: [
          "An [[indexer|indexer]] that polls [[eth-get-block-receipts|eth_getBlockReceipts]] and a tracer for every block pays three times: serialisation of each response, a re-execution for each trace, and polling latency behind the head. State diffs and [[internal-transaction|internal transactions]] are reachable over RPC only through tracers that run the block again; see [[execution-trace|execution trace]]. Inside the client the same data is a by-product of executing the block once: every call frame, storage write, balance change and log passes through code an extension can observe and write straight to a queue or database. That is the route to a resumable execution stream without polling, which [[firehose|Firehose]] turns into a product.",
          "The price is shared fate. The extension runs in the node's process and memory, crashes when the node crashes, and stalls block import when it blocks, which on a node feeding a [[validator-node|validator node]] costs attestations. It is also tied to one client's internal API and release cycle, so every upgrade is a rebuild. Geth's documentation states the working rule: keep the in-process code minimal, get the raw data out, and do heavy processing later.",
        ],
      },
      {
        heading: "Three mechanisms",
        paragraphs: [
          "[[nethermind|Nethermind]] plugins are .NET assemblies loaded at start-up from the `plugins` directory, or from `--plugins-dir`, implementing `INethermindPlugin`; much of Nethermind itself, including its Optimism and Taiko support and health checks, is built this way. In 2.0 a plugin contributes an Autofac module that can register initialization steps, JSON-RPC modules declared as interfaces carrying the `RpcModule` attribute, decorators around existing modules, and block tracers attached to main block processing. The bundled TraceStore plugin works exactly so: it records Parity-style traces as blocks are processed and answers `trace_` calls from its own database without the historical state.",
          "A [[reth|Reth]] ExEx is an asynchronous task installed through the node builder. It receives `ExExNotification` values — `ChainCommitted { new }`, `ChainReorged { old, new }` and `ChainReverted { old }` — each carrying the blocks, receipts and state changes of a chain segment, and answers with `ExExEvent::FinishedHeight` naming the highest block it has fully processed. Reth prunes only data every ExEx has finished with and afterwards sends only notifications above that height; notifications are kept in a write-ahead log, and a stream started from the ExEx's own head backfills by re-executing blocks up to the node's head.",
          "[[geth|Geth]]'s live tracing, added in v1.14, reuses the tracer interface: a Go tracer compiled into the binary registers under a name and returns `tracing.Hooks` such as `OnBlockStart`, `OnTxStart`, `OnEnter`, `OnStorageChange`, `OnBalanceChange` and `OnLog`, switched on with `--vmtrace <name>` and `--vmtrace.jsonconfig`. The bundled `supply` tracer writes ether issuance and burn for every block to JSONL files. Hooks run synchronously inside block processing. StreamingFast's Firehose runs a patched Geth started with `--vmtrace=firehose`.",
        ],
      },
      {
        heading: "Resuming and reorgs are the consumer's job",
        paragraphs: [
          "The mechanisms differ in how much they hand over. Reth delivers a [[reorg|reorg]] as an explicit reverted and committed segment and holds back pruning until the ExEx confirms progress. Geth's live tracer simply receives the new branch's blocks and leaves unwinding to the consumer, which must compare each block's `parentHash` with what it has already emitted. In every case, after a crash the extension has to know the last block it durably emitted, by hash as well as number, and resume from there, which works only while the node still holds the state to re-execute those blocks.",
          "This is why the Reth lesson warns that an ExEx is not a substitute for an indexer: the extension is the ingest end, and the database it feeds still needs reorg handling, cursors and backups of its own. It also ties the data to one implementation: an index built only from one client's hooks inherits that client's bugs, which is the [[client-diversity|client diversity]] argument applied to data pipelines.",
        ],
      },
    ],
    example: {
      title: "What each client hands an extension",
      language: "text",
      code: "Nethermind  plugins/*.dll implementing INethermindPlugin\n            Autofac module: steps, JSON-RPC modules, decorators, block tracers\n\nReth        ExEx task installed through the node builder\n            in:  ChainCommitted { new } | ChainReorged { old, new } | ChainReverted { old }\n            out: FinishedHeight(BlockNumHash)   -- pruning waits for it\n\nGeth        geth --syncmode full --vmtrace supply --vmtrace.jsonconfig '{\"path\": \"output\"}'\n            tracing.Hooks: OnBlockStart, OnTxStart, OnEnter, OnExit, OnStorageChange, OnLog ...",
      note: "Only Reth's interface carries reorgs and backpressure explicitly; with the other two the extension has to build both itself.",
    },
    pitfalls: [
      "Doing heavy decoding or synchronous database writes inside a live tracer or plugin, which stalls block import and delays the answer to `engine_newPayload`.",
      "Never emitting `FinishedHeight` from an ExEx, which stops Reth from pruning data the ExEx might still need, so the disk keeps growing.",
      "Treating a Geth live-tracer stream as reorg-safe; it reports whatever blocks Geth processes and leaves unwinding to the consumer.",
      "Recording the resume point as a block number alone; after a reorg the same number names a different block.",
      "Upgrading the client without rebuilding the extension; Nethermind 2.0, for example, changed configuration property types and requires plugins to be recompiled.",
    ],
    related: ["execution-client", "indexer", "firehose", "reth", "nethermind", "geth", "execution-trace", "reorg", "internal-transaction", "client-diversity"],
    sources: [
      { title: "Nethermind: plugins", url: "https://docs.nethermind.io/developers/plugins/" },
      { title: "Reth: how ExExes work", url: "https://reth.rs/exex/how-it-works/" },
      { title: "Geth: live tracing", url: "https://geth.ethereum.org/docs/developers/evm-tracing/live-tracing" },
    ],
  },
  {
    id: "slashing-protection",
    title: "Slashing protection",
    category: "clients",
    aliases: ["slashing protection database", "EIP-3076", "interchange format", "slashing protection interchange", "doppelganger protection", "signing_root", "low watermark"],
    summary: "Slashing protection is the record that a [[validator-client|validator client]] or [[remote-signer|remote signer]] keeps of what each key has signed, checked before every new signature so the key never produces the conflicting pair that gets a validator [[slashing|slashed]], and carried between clients in the EIP-3076 interchange format.",
    sections: [
      {
        heading: "Three refusals",
        paragraphs: [
          "A [[validator|validator]] signs a block when it proposes and an [[attestation|attestation]] once every [[slot-epoch|epoch]] (32 slots, 6.4 minutes). Each attestation votes for a link between two checkpoints, the blocks at epoch boundaries: from an older one, its source epoch, to a newer one, its target epoch. Three kinds of signature get a validator [[slashing|slashed]], losing stake and being forced out: a second, different block for a slot it already proposed in; a double vote, two different attestations with the same target epoch; and a surround vote, an attestation whose source-to-target span strictly contains another's or sits strictly inside it. After signing source 301 and target 302, for example, a vote from 300 to 303 surrounds it.",
          "The chain judges only signatures, not intent, so before each one the client checks the key's history and either signs and records the message in one step or refuses. [[lighthouse|Lighthouse]] logs a refusal as `CRIT Not signing slashable attestation`, naming the reason, such as `DoubleVote`.",
          "Clients store the history differently. Lighthouse records every block and attestation in an SQLite file, `slashing_protection.sqlite`; [[teku|Teku]] keeps one YAML file per key under `slashprotection`; the remote signer Web3Signer uses PostgreSQL. EIP-3076 names the two designs. A complete database keeps every message and refuses only what would be slashable. A minimal one keeps only each key's latest slot and epochs, and refuses any block at or below that slot and any attestation with an older source or a target that is not newer: simpler, but it sometimes refuses a harmless signature.",
        ],
      },
      {
        heading: "The EIP-3076 interchange file",
        paragraphs: [
          "Moving a key between clients means moving its history, and EIP-3076 defines the JSON for it. `metadata` holds `interchange_format_version`, the string `5`, and `genesis_validators_root`, which identifies the chain, so a history from the Hoodi testnet cannot be imported into a mainnet signer. `data` holds, per `pubkey`, lists of `signed_blocks` (each with a `slot`) and `signed_attestations` (each with `source_epoch` and `target_epoch`), all as decimal strings. `signing_root`, the hash that was actually signed, is optional on both; with it a client can tell a harmless repeat of the same message, such as a rebroadcast, from a conflict.",
          "An import also sets low watermarks, floors below which the key signs nothing, because the file may hold only a minimal history and the importer cannot see what was signed before it. Afterwards the client refuses any block at or below the lowest imported slot, any attestation with a source below the lowest imported source, and any with a target at or below the lowest imported target, unless the `signing_root` shows the same message again. EIP-3076 asks for export and import to happen with the client stopped, so the file is complete and nothing is signed mid-import; `lighthouse account validator slashing-protection export` and `teku slashing-protection import --from` are such commands.",
        ],
      },
      {
        heading: "What it cannot protect",
        paragraphs: [
          "A database protects only the signatures that pass through it. The classic incidents take two forms: one key in two processes, each with a clean history, as when a [[failover|failover]] script starts a standby without first making sure the primary has stopped; and one process with an out-of-date history, as when a backup restored from before the last signatures lets it sign conflicting messages for them. In February 2021 the staking provider Staked had 75 validators slashed after it stopped keeping its validator clients' protection database across restarts, so restarted clients came back with no history. Doppelganger protection, a start-up wait in which the client signs nothing and watches the network for the key's votes (two to three epochs in Lighthouse), catches a key already running elsewhere, not two copies started at once.",
          "Remote and distributed setups move the database rather than remove it. A remote signer such as Web3Signer checks each request against its own database, so several Web3Signer instances holding one key are safe only if they share that database. The keymanager API, the standard API for managing a validator client's keys, carries the same JSON: `POST /eth/v1/keystores` accepts `slashing_protection` alongside the keys, and `DELETE /eth/v1/keystores` must stop the key signing before it returns the history. In a [[distributed-validator|distributed validator]] run through Charon, each operator's validator client protects its own key share, and a slashable signature needs a threshold of shares to sign conflicting data.",
        ],
      },
    ],
    example: {
      title: "An EIP-3076 export, and what the importing client then refuses",
      language: "json",
      code: "// exported from the old client after it was stopped\n{\n  \"metadata\": {\n    \"interchange_format_version\": \"5\",\n    \"genesis_validators_root\": \"0x4b363db94e286120d76eb905340fdd4e54bfe9f06bf33ff6cf5ad27f511bfe95\"\n  },\n  \"data\": [\n    {\n      \"pubkey\": \"0x989d34725a2bfc3f15105f3f5fc8741f436c25ee1ee4f948e425d6bcb8c56bce6e06c269635b7e985a7ffa639e2409bf\",\n      \"signed_blocks\": [\n        { \"slot\": \"15302817\", \"signing_root\": \"0x6f1c…a40b\" }\n      ],\n      \"signed_attestations\": [\n        { \"source_epoch\": \"478210\", \"target_epoch\": \"478211\", \"signing_root\": \"0x2d9e…71c3\" },\n        { \"source_epoch\": \"478211\", \"target_epoch\": \"478212\", \"signing_root\": \"0xb07a…5e28\" }\n      ]\n    }\n  ]\n}\n\n// the new client, after import, is asked to sign:\n// attestation 478211 -> 478212, other signing_root   refused: double vote\n// attestation 478210 -> 478213                       refused: surrounds 478211 -> 478212\n// block at slot 15302817, other signing_root         refused: second block for the slot\n// attestation 478212 -> 478213                       signed and recorded",
      note: "The `genesis_validators_root` is mainnet's; the signing roots are what let the new client re-sign an identical message while refusing a different one at the same target.",
    },
    pitfalls: [
      "Importing keystores into a new client without the interchange file, which leaves it an empty history and nothing to refuse.",
      "Exporting while the old client still runs, so the file misses its last signatures and the new client may sign different messages for them.",
      "Recreating a lost database with Lighthouse's `--init-slashing-protection` while the old client may still be signing, or less than an epoch after it stopped.",
      "Leaving a key in a validator client's keystores after registering it with a remote signer, so two databases each approve their own conflicting message.",
    ],
    related: ["slashing", "validator-client", "remote-signer", "distributed-validator", "validator", "attestation", "block-proposal", "lighthouse", "teku", "failover"],
    sources: [
      { title: "EIP-3076: Slashing Protection Interchange Format", url: "https://eips.ethereum.org/EIPS/eip-3076" },
      { title: "Lighthouse Book: Slashing Protection", url: "https://lighthouse-book.sigmaprime.io/validator_slashing_protection.html" },
      { title: "Web3Signer: Configure slashing protection", url: "https://docs.web3signer.consensys.com/how-to/configure-slashing-protection" },
      { title: "ethereum/keymanager-APIs", url: "https://github.com/ethereum/keymanager-APIs" },
    ],
  },
  {
    id: "hive",
    title: "Hive",
    category: "clients",
    aliases: ["hive", "ethereum/hive", "hiveview", "rpc-compat", "hive simulator", "client integration tests"],
    summary: "Hive is the Ethereum client integration test harness: it builds each client as a Docker image, starts it on a test [[genesis|genesis]] and chain, and lets simulator programs drive it over [[json-rpc|JSON-RPC]], the [[engine-api|Engine API]] and [[devp2p|devp2p]], recording which behaviours match the expected results.",
    sections: [
      {
        heading: "Clients, simulators and the controller",
        paragraphs: [
          "Separate teams write Ethereum's [[execution-client|execution clients]], and all must agree exactly: a block one accepts, every other must accept, and an [[eth-get-block-by-number|eth_getBlockByNumber]] answer must parse the same from all. Hive, a Go program at `github.com/ethereum/hive` that drives Docker, checks this against shared fixtures, stored inputs with their expected outputs. A client definition is a directory under `clients/` with a Dockerfile, usually wrapping the team's published image, and an entry-point script. At start-up the script translates `/genesis.json`, a Geth-format genesis, into the client's own, imports the RLP-encoded blocks in `/chain.rlp` and then `/blocks/`, and opens JSON-RPC on port 8545; once that port opens, hive treats the client as ready.",
          "Settings arrive as `HIVE_` environment variables, and each build records its version in `/version.txt`. A simulator is a program, in its own container, holding the test logic. It asks the hive controller, over an HTTP API at the address in `HIVE_SIMULATOR`, to start clients with given files and variables, talks to them, and reports suites and test cases back. `./hive --sim ethereum/sync --client go-ethereum,besu,nethermind` builds the simulator and three client images, runs it and removes every container afterwards; a suffix such as `go-ethereum_v1.9.23` picks a version.",
        ],
      },
      {
        heading: "The simulators",
        paragraphs: [
          "Execution-layer simulators cover each client interface. `devp2p` runs the eth, snap, discv4 and discv5 suites against the client's [[peer-to-peer|peer-to-peer]] port. `ethereum/engine` plays the [[consensus-client|consensus client]] and drives Engine API scenarios, from payload building to JWT authentication. `ethereum/sync` checks that every client can sync a test chain from every other. `ethereum/consensus` runs the classic JSON consensus tests, and the `ethereum/eels/` family runs fixtures generated by execution-specs, the Python reference implementation, for example `consume-rlp` to import blocks and `consume-engine` to send them through the Engine API.",
          "`ethereum/rpc-compat` matters most to RPC consumers. It clones [[execution-apis|execution-apis]], builds its [[openrpc|OpenRPC]] document, starts the client on the specification's test chain and replays every `.io` test file, each a request line followed by the exact expected response. Responses are compared as JSON, so a missing field, an extra one or a differently encoded number fails; tests marked speconly, whose values legitimately differ between nodes, are checked against the schema instead. On 28 October 2026 the suite held 273 tests. `ethereum/graphql` does the same for the GraphQL endpoint.",
        ],
      },
      {
        heading: "Where results live, and how teams use them",
        paragraphs: [
          "Each suite writes a JSON result file, with the client logs beside it, under `./workspace/logs`, and `hiveview` serves them in a browser, as the example shows. The public instance runs from GitHub Actions in `ethpandaops/hive-tests` and publishes at `hive.ethpandaops.io`: a mainnet group under `/generic/`, plus groups for the test networks of upcoming forks. Every run is a line in the group's `listing.jsonl` giving the suite, the client build, the test count and the failures.",
          "Client teams run hive in their own CI, as workflows in the Reth, Nethermind and Erigon repositories show, and reproduce a public failure locally with `--sim.limit`, a regular expression whose part before the first slash selects suites and whose part after it selects tests. The README lists bugs found this way, from consensus faults to RPC shapes such as Besu not treating an empty topic list as a wildcard. Hive complements [[kurtosis|Kurtosis]]: Kurtosis runs a live multi-client network with real consensus, while hive tests one behaviour at a time against a known answer.",
        ],
      },
      {
        heading: "What a green run does not tell you",
        paragraphs: [
          "Hive checks behaviour, not performance. Apart from timeouts, such as the default three minutes a client gets to open port 8545, nothing is timed: a correct answer in two seconds passes like one in two milliseconds. The chains are tiny, about 60 blocks for the RPC tests, so archive depth, pruning, [[receipt-retention|retention]], mainnet-sized state and gas caps are never exercised. Nothing outside execution-apis is replayed either, including the [[trace-api|trace_ namespace]] and named [[debug-api|debug_]] tracers.",
          "A result also describes one build in one configuration. The public rpc-compat runs of 28 October 2026 tested unreleased builds such as `Geth/v1.17.11-unstable` and Erigon `3.9.0-dev`, and no run covers the [[namespaces|namespaces]], limits or proxies an [[rpc-provider|RPC provider]] adds. A failure is not always the client's fault either: a wrong fixture fails every client at once, as the first [[eth-capabilities|eth_capabilities]] fixture did, so a red cell is read with its diff and the fixture's history.",
        ],
      },
    ],
    example: {
      title: "Running the RPC conformance suite and reading a result",
      language: "bash",
      code: "# build hive, then replay the execution-apis tests against two clients\ngit clone https://github.com/ethereum/hive && cd hive && go build .\n./hive --sim ethereum/rpc-compat --client go-ethereum,nethermind\n\n# only the eth_getBlockByNumber tests, in any suite (the part after the first slash matches tests)\n./hive --sim ethereum/rpc-compat --client nethermind --sim.limit /eth_getBlockByNumber\n\n# browse results and client logs at http://127.0.0.1:8080\ngo build ./cmd/hiveview && ./hiveview --serve --logdir ./workspace/logs\n\n# one line of the public index, hive.ethpandaops.io/generic/listing.jsonl (abridged)\n# {\"name\":\"rpc-compat\",\"ntests\":273,\"passes\":273,\"fails\":0,\"timeout\":false,\n#  \"clients\":[\"go-ethereum_default\"],\n#  \"versions\":{\"go-ethereum_default\":\"Geth/v1.17.11-unstable-7d0a3d84-20261028/linux-amd64/go1.27.3\"},\n#  \"start\":\"2026-10-28T11:25:55.862554293Z\",\"end\":\"2026-10-28T11:26:01.738760842Z\", ...}",
      note: "The listed version is an unstable build from the day of the run, and the whole suite took six seconds, because the chain behind it is about 60 blocks long; a pass says the shapes match, not that a mainnet endpoint behaves the same.",
    },
    pitfalls: [
      "Reading a full rpc-compat pass as proof that an endpoint meets the specification, when your limits and retention go untested.",
      "Comparing public results with the release you run, when the public instance tests development builds.",
      "Blaming the client for a red test before reading the fixture, since a wrong expected response fails every client.",
      "Expecting `trace_` or `callTracer` coverage from rpc-compat, which replays only methods in execution-apis.",
    ],
    related: ["execution-apis", "openrpc", "client-diversity", "kurtosis", "engine-api", "devp2p", "execution-client", "consensus-client", "local-devnet", "testnets"],
    sources: [
      { title: "hive: overview", url: "https://github.com/ethereum/hive/blob/master/docs/overview.md" },
      { title: "hive: command-line documentation", url: "https://github.com/ethereum/hive/blob/master/docs/commandline.md" },
      { title: "hive: rpc-compat simulator", url: "https://github.com/ethereum/hive/tree/master/simulators/ethereum/rpc-compat" },
      { title: "Hive results (ethPandaOps)", url: "https://hive.ethpandaops.io/" },
    ],
  },
];

export default { topics };
