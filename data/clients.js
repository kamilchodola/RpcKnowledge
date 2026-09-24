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
          "The specification fixes the answers, not the machinery. Clients differ in their [[client-storage|storage engines]], in how they sync ([[snap-sync|snap sync]] versus re-executing history in stages), in memory and disk appetite, and most visibly in the non-standard [[namespaces|namespaces]] they serve. Geth-style [[debug-api|debug_]] tracing, Parity-style [[trace-api|trace_]] tracing, and Erigon's `ots_` search API are all optional extras, not part of what every client owes you.",
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
      "Assuming a method exists everywhere: `trace_block` is absent on Geth, `ots_` methods exist only on Erigon, and `debug_traceCall` tracers vary in detail between clients.",
      "Treating a synced execution client as a working node; without a consensus client its head stops advancing, while [[eth-syncing|eth_syncing]] may still return `false`.",
      "Pointing two consensus clients at one execution client; each sends its own [[fork-choice|fork choice]] and they will fight over the head.",
    ],
    related: ["execution-layer", "geth", "engine-api", "json-rpc", "nethermind", "erigon", "reth", "besu", "consensus-client", "client-storage"],
    sources: [
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
      { title: "Execution API documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
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
          "Geth is the oldest continuously maintained [[execution-client|execution client]] and, for most of Ethereum's history, the de facto reference implementation: new [[eip|EIPs]] and [[debug-api|debug_]] tracers frequently appeared there first and were then adopted by other clients. The repository also ships the `clef` external signer, the `evm` execution tool, and `abigen`. Running `geth attach` opens a JavaScript console over [[ipc-transport|IPC]] against `geth.ipc` in the data directory, which is the usual way to call [[admin-api|admin_]] methods without opening a network port.",
          "A default `geth` run uses `--syncmode snap` and `--gcmode full`: it fetches a recent state snapshot from peers, heals the trie, and then follows the head while keeping only recent state. It expects a [[consensus-client|consensus client]] on the [[engine-api|Engine API]]; without one it will sit idle after startup.",
        ],
      },
      {
        heading: "Storage and retention",
        paragraphs: [
          "Since v1.14 Geth uses the path-based state scheme (`--state.scheme path`) by default for new databases, which keeps one copy of each trie node keyed by its position rather than one per version; see [[client-storage|storage engines]]. That makes disk use predictable, but historical [[state|state]] survives only for a window of roughly 128 recent blocks. Ask for a balance or run [[eth-call|eth_call]] below that window on a [[pruned-node|pruned]] Geth and you get a `missing trie node` error. Serving old state requires `--gcmode archive`, which is a different database shape and costs multiple terabytes.",
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
      { title: "Geth documentation", url: "https://geth.ethereum.org/docs" },
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
          "Nethermind runs on the .NET runtime and is organized as a core plus plugins, which is how it supports several networks from one binary: Ethereum mainnet, [[testnets|Sepolia and Hoodi]], Gnosis Chain, and [[optimistic-rollup|OP Stack]] chains, where it plays the [[execution-client|execution client]] role next to `op-node`. A run is usually started from a named configuration, `--config mainnet`, which sets sane defaults that individual flags then override.",
          "Its data lives in RocksDB. Sync starts with [[snap-sync|snap sync]] plus a backwards download of headers, bodies, and receipts, so a fresh node serves the head quickly and fills in history behind it. Ancient-history barriers control how far back bodies and receipts are fetched, which is worth checking before you point an [[indexer|indexer]] at a newly synced node.",
        ],
      },
      {
        heading: "Pruning and state",
        paragraphs: [
          "Nethermind separates in-memory pruning, which keeps recent trie nodes in a cache and writes only what survives, from full pruning, which rewrites the state database in place to drop everything unreachable from the current [[state-root|state root]]. Full pruning runs while the node keeps following the chain, but it needs free disk roughly the size of the state being copied and takes hours, so it is scheduled rather than run on a whim. An [[archive-node|archive]] configuration turns pruning off entirely.",
          "The on-disk trie uses a half-path layout that keys nodes by their path prefix rather than purely by hash, which shrinks the database and speeds up range reads; Paprika is a separate, experimental state store being developed alongside it. See [[client-storage|storage engines]] for what these layouts mean for historical queries.",
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
      "Starting full pruning on a disk that is nearly full; it needs headroom for a copy of the state and will abort otherwise.",
      "Mixing a JSON config file with flags and forgetting that the flag wins, so an edit to the file appears to have no effect.",
    ],
    related: ["execution-client", "trace-api", "debug-api", "eth-simulate", "client-storage", "pruned-node", "engine-api", "namespaces", "snap-sync", "archive-node"],
    sources: [
      { title: "Nethermind documentation", url: "https://docs.nethermind.io/" },
      { title: "Nethermind: JSON-RPC configuration", url: "https://docs.nethermind.io/fundamentals/configuration" },
      { title: "NethermindEth/nethermind", url: "https://github.com/NethermindEth/nethermind" },
    ],
  },
  {
    id: "erigon",
    title: "Erigon",
    category: "clients",
    aliases: ["turbo-geth", "rpcdaemon", "ots_", "Otterscan API", "staged sync", "Caplin"],
    summary: "Erigon is the Go [[execution-client|execution client]] built around staged sync and a flat MDBX database, which runs its [[json-rpc|JSON-RPC]] in a separate `rpcdaemon` process and adds the `erigon_` and Otterscan `ots_` [[namespaces|namespaces]].",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "Erigon began as turbo-geth, a fork of [[geth|Geth]] aimed at making an [[archive-node|archive node]] affordable, and is now an independent codebase. Its defining choice is storage: instead of writing a trie of hashed nodes, it keeps accounts and storage slots as flat key-value records in MDBX and computes trie nodes only when a [[state-root|state root]] is needed; see [[client-storage|storage engines]]. History is kept as change sets, so retaining every historical value costs far less than storing a full trie per block.",
          "Sync is staged rather than block-by-block. A pipeline runs one stage at a time over the whole range — headers, then bodies, then execution, then hashing, then the history and log indices — which is much faster on a fresh machine but means the node is not queryable until the pipeline reaches the head. Erigon 3 also ships Caplin, its own [[consensus-client|consensus client]], inside the same binary; recent versions run it by default, and `--externalcl` switches to a standalone consensus client over the [[engine-api|Engine API]].",
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
          "Erigon serves the standard `eth_` surface plus the Parity-style [[trace-api|trace_]] namespace and Geth-style [[debug-api|debug_]] tracers. On top of that it exposes `erigon_` helpers such as `erigon_getHeaderByNumber` and `erigon_getBlockByTimestamp`, and the Otterscan API used by the [[block-explorer|Otterscan explorer]]: `ots_searchTransactionsBefore` and `ots_searchTransactionsAfter` page through an address's history, `ots_getTransactionBySenderAndNonce` finds a transaction without a hash, and `ots_getContractCreator` returns who deployed a contract. None of that exists on other clients, so code written against `ots_` is Erigon-specific.",
          "Because history indices are built as sync stages, [[eth-get-logs|eth_getLogs]] over wide ranges is usually cheap here, and archive [[eth-call|eth_call]] works at any block. A historical [[eth-get-proof|eth_getProof]] is the opposite case: the trie nodes a proof needs are not stored, so proofs at old blocks are limited even on a node that holds every historical value.",
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
      "Expecting a partially synced Erigon to answer queries; staged sync finishes one stage at a time, so RPC is incomplete until the pipeline reaches the head.",
      "Assuming an Erigon archive node can produce `eth_getProof` for any historical block; flat storage keeps values, not the trie nodes a proof needs.",
      "Running `rpcdaemon` against a data directory that the node has open in a mode that conflicts, instead of connecting over the private gRPC address.",
    ],
    related: ["execution-client", "client-storage", "archive-node", "trace-api", "eth-get-logs", "eth-get-proof", "block-explorer", "consensus-client", "namespaces", "geth"],
    sources: [
      { title: "Erigon documentation", url: "https://docs.erigon.tech/" },
      { title: "erigontech/erigon", url: "https://github.com/erigontech/erigon" },
      { title: "Otterscan", url: "https://otterscan.io/" },
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
          "Reth is a from-scratch [[execution-client|execution client]] in Rust, published as a set of crates rather than a single program: the same building blocks that run `reth node` on mainnet are used to build `op-reth` for [[optimistic-rollup|OP Stack]] chains and custom nodes for private networks. It follows the same [[execution-apis|execution APIs specification]] as every other client and pairs with a [[consensus-client|consensus client]] over the [[engine-api|Engine API]] on port 8551.",
          "Storage splits in two. MDBX holds the mutable parts — state, the account and storage change sets, and the indices — while headers, bodies, and receipts are written into append-only static files that are never rewritten and compress well; see [[client-storage|storage engines]]. Sync is a staged pipeline in the style of [[erigon|Erigon]]: headers, bodies, sender recovery, execution, then the hashing and index stages.",
        ],
      },
      {
        heading: "Archive by default",
        paragraphs: [
          "Reth keeps all historical [[state|state]] unless told otherwise, so a plain `reth node` is an [[archive-node|archive node]]; `--full` is the flag that turns it into a [[pruned-node|pruned node]] that keeps only recent state and history. That is the reverse of most clients' defaults and surprises operators who size a disk for a [[full-node|full node]] and get archive growth, or who add `--full` later and find historical [[eth-call|eth_call]] has stopped working.",
          "Execution Extensions, known as ExEx, are the other distinctive feature: a Rust task runs inside the node process and receives a stream of committed chain notifications, including reverted segments during a [[reorg|reorg]]. An [[indexer|indexer]] built that way reads state changes directly instead of polling [[eth-get-logs|eth_getLogs]] over [[http-transport|HTTP]], at the cost of being coupled to the node's lifecycle and to Reth itself.",
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
      "Adding `--full` to an existing archive node and expecting old data to remain; historical state beyond the retained window stops being queryable.",
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
          "Besu runs on the JVM and covers two audiences from one codebase: Ethereum mainnet as a public [[execution-client|execution client]], and permissioned networks, where it supplies the QBFT, IBFT 2.0, and Clique consensus algorithms that public Ethereum does not use, plus account and node permissioning. That second role explains configuration options an operator on mainnet never touches.",
          "State is stored in the Bonsai format by default (`--data-storage-format=BONSAI`): accounts and storage slots are kept flat, with trie logs recording the difference each block made so the node can roll back. The older Forest format keeps a conventional trie of hashed nodes. Bonsai keeps only a bounded window of historical state, governed by `--bonsai-historical-block-limit`, so an [[archive-node|archive]] deployment is a deliberate configuration rather than the default; see [[client-storage|storage engines]].",
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
    related: ["execution-client", "client-storage", "trace-api", "namespaces", "archive-node", "snap-sync", "reverse-proxy", "engine-api", "json-rpc", "security"],
    sources: [
      { title: "Besu documentation", url: "https://besu.hyperledger.org/" },
      { title: "Besu: command-line options", url: "https://besu.hyperledger.org/public-networks/reference/cli/options" },
      { title: "hyperledger/besu", url: "https://github.com/hyperledger/besu" },
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
          "Below a third of the network, a broken client is the one that suffers: its nodes follow a chain nobody else does, its validators miss duties and leak stake, and the rest of the network keeps [[finality|finalizing]] normally. Above a third, no branch can be finalized until the disagreement is resolved, so the whole network stalls at the last finalized checkpoint. Above two thirds, the broken client can finalize its own invalid chain, and undoing that requires coordinated human intervention rather than a protocol mechanism. Those thresholds are why operators are asked to run clients that are not already dominant, and why trackers such as clientdiversity.org publish the distribution.",
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
    aliases: ["VC", "slashing protection", "Web3Signer", "keymanager", "fee recipient", "EIP-3076"],
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
          "Pointing the validator client at several beacon nodes gives redundancy: if one is down or its execution client is unhealthy, duties continue against another; see [[failover|failover]]. When [[mev-boost|MEV-Boost]] is in use, the proposal path returns a blinded block that the validator signs without seeing the transactions, and the beacon node then exchanges the signature for the full block.",
        ],
      },
      {
        heading: "Keys and slashing protection",
        paragraphs: [
          "Because signing two conflicting messages is punished by [[slashing|slashing]], every validator client keeps a slashing protection database recording the highest block slot and the attestation source and target epochs it has signed for each key. That database is as important as the keys themselves: it must move with them, using the EIP-3076 interchange format, and it must never be restored from an old snapshot, because a rolled-back record will happily approve a signature it has already made.",
          "Keys can also live somewhere else entirely. A remote signer such as Web3Signer holds them and exposes a signing endpoint, so the validator client sends the message to be signed rather than loading a key. Clients additionally offer an authenticated keymanager API for importing and removing keys at runtime, which is a separate listener from the beacon node's [[beacon-api|Beacon API]] and should stay on a private network; see [[authentication|authentication]].",
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
      "Running two validator clients with the same keys for redundancy; that is the classic way to get slashed, and no protection database spans two hosts.",
      "Migrating keys without exporting the EIP-3076 slashing protection interchange, or restoring one from a backup taken before the last signatures.",
      "Exposing the keymanager API on a public interface; it can import and delete keys.",
      "Assuming a validator client needs its own execution endpoint; the fee recipient reaches the execution layer through the beacon node.",
    ],
    related: ["beacon-node", "consensus-client", "beacon-api", "validator", "slashing", "mev-boost", "block-proposal", "attestation", "authentication", "lighthouse"],
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
          "The beacon node is the half of a node that decides what the chain is. It receives [[beacon-block|beacon blocks]] and [[attestation|attestations]] over gossip on port 9000 (some clients default elsewhere, notably [[prysm|Prysm]]), verifies their BLS signatures, applies them to its fork choice, and keeps the justified and finalized checkpoints up to date; see [[libp2p-gossip|consensus networking]] and [[finality|finality]].",
          "It pairs one-to-one with an execution client. The [[engine-api|Engine API]] has no notion of several callers: each `engine_forkchoiceUpdated` sets one head, so two beacon nodes pointed at the same execution client would overwrite each other's view. One beacon node can, however, serve many [[validator-client|validator clients]], and one validator client can list several beacon nodes for redundancy.",
        ],
      },
      {
        heading: "What it can answer",
        paragraphs: [
          "The [[beacon-api|Beacon API]] exposes the chain as REST resources: headers and blocks by slot or root, `finality_checkpoints` for a state, the validator registry, and [[blob|blob sidecars]] at `/eth/v1/beacon/blob_sidecars/{block_id}` — blob data lives here, not on the execution client, and is dropped after 4096 epochs, roughly 18 days. `/eth/v1/events` is a server-sent-event stream carrying `head`, `finalized_checkpoint`, and `chain_reorg`, which is how a [[indexer|indexer]] can watch consensus without polling.",
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
      "Expecting blob data from the execution client after roughly 18 days; the [[consensus-layer|consensus layer]] is where sidecars live, and it drops them after 4096 epochs.",
    ],
    related: ["consensus-client", "beacon-api", "engine-api", "validator-client", "checkpoint-sync", "health-check", "fork-choice", "blob", "execution-client", "beacon-endpoints"],
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
          "The path-based layouts key a trie node by its position in the trie instead: [[geth|Geth]]'s path-based scheme, the default for new databases since v1.14, [[nethermind|Nethermind]]'s half-path layout, and [[besu|Besu]]'s Bonsai format. Each node then has exactly one current record, the database stops growing with history, and older versions survive only inside a bounded window of diff layers or trie logs — around 128 blocks on Geth. Past that window a [[pruned-node|pruned node]] answers `missing trie node`.",
          "The flat layouts, used by [[erigon|Erigon]] and [[reth|Reth]] and in spirit by Bonsai, go further: the authoritative record is the value itself, keyed by address and slot, and trie nodes are computed only when a [[state-root|state root]] must be produced. History becomes a set of change sets, so keeping every past value costs far less than keeping a trie per block, which is why archive nodes on these clients are affordable.",
        ],
      },
      {
        heading: "What an RPC caller sees",
        paragraphs: [
          "The first consequence is which blocks answer at all. The same [[eth-call|eth_call]] at a two-year-old block succeeds on a flat archive node, fails with `missing trie node` on a path-based pruned node, and may be answered from an entirely different database on a hash-based archive node. Probing beats assuming; see [[endpoint-capabilities|endpoint capabilities]].",
          "The second is proofs. [[eth-get-proof|eth_getProof]] returns actual trie nodes, and a client that stores values flat has to rebuild them. Historical proofs are therefore often unavailable even on a node that holds every historical value, which surprises teams building [[state-proof|state proofs]] against an archive endpoint.",
          "The third is history retention, which is separate from all of this: transaction indices and old bodies can be trimmed independently of state, as with Geth's `--history.transactions`, and [[history-expiry|history expiry]] removes pre-Merge data entirely. Underneath every layout is the same hardware requirement — random reads dominate, so [[node-hardware|NVMe with high IOPS]] is not optional. [[beacon-node|Beacon nodes]] store differently again: [[ssz|SSZ]] states with periodic snapshots and replay rather than a trie.",
        ],
      },
    ],
    example: {
      title: "What each execution client writes where",
      language: "text",
      code: "Geth        Pebble or LevelDB + freezer files   path-based trie by default, ~128-block state window\nNethermind  RocksDB                             half-path trie, in-memory and full pruning\nErigon      MDBX + snapshot files               flat values plus change sets\nReth        MDBX + static files                 flat values, archive unless --full\nBesu        RocksDB                             Bonsai flat state with trie logs, or Forest trie",
      note: "Nothing in the [[json-rpc|JSON-RPC]] specification covers retention, so two clients answer the same historical query differently because of this column alone.",
    },
    pitfalls: [
      "Assuming an archive node can produce a historical `eth_getProof`; flat storage keeps values, not the trie nodes a proof is made of.",
      "Reading `missing trie node` as database corruption; it usually means the state at that block was pruned.",
      "Sizing a disk from a client's state size and forgetting history, or converting a node between storage schemes without budgeting for a full resync.",
      "Putting the live state database on network storage because the append-only history files tolerate it; state is random-write and will not.",
    ],
    related: ["execution-client", "archive-node", "pruned-node", "geth", "erigon", "reth", "nethermind", "besu", "eth-get-proof", "history-expiry", "merkle-patricia-trie", "node-hardware"],
    sources: [
      { title: "Geth: pruning and state schemes", url: "https://geth.ethereum.org/docs/fundamentals/pruning" },
      { title: "Erigon documentation", url: "https://docs.erigon.tech/" },
      { title: "Besu: data storage formats", url: "https://besu.hyperledger.org/public-networks/concepts/data-storage-formats" },
    ],
  },
];

export default { topics };
