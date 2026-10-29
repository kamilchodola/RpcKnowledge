// The suggested reading order for the whole map: every topic once, grouped into stages.
// The map numbers each topic by its place here, the roadmap view lays the stages out in
// this order, and listening plays the topics in it, one after another.
//
// The order follows the lessons' own links. A topic's summary is its definition, so the
// terms a summary links to come earlier on the path wherever that does not break a stage
// apart; the exceptions are mostly overviews, such as the root, that introduce terms
// taught later. Labels are short because they sit on the map as stage markers.
export const stages = [
  {
    id: "start",
    label: "Start here",
    blurb: "What RPC is, how a JSON-RPC request is framed, sent, and answered, and the two layers that sit behind every Ethereum endpoint.",
    topics: ["ethereum-rpc", "rpc", "execution-layer", "consensus-layer", "json-rpc", "request-response", "hex-encoding", "rpc-errors", "batch-request", "namespaces", "http-transport", "websocket-transport", "ipc-transport", "execution-apis", "openrpc", "eip"]
  },
  {
    id: "data",
    label: "The chain's data",
    blurb: "Accounts, state, transactions, gas, blocks, and receipts: the records that every RPC answer is built from.",
    topics: ["account", "address", "wei", "state", "transaction", "nonce", "ecdsa-signature", "keccak-256", "smart-contract", "evm", "gas", "block", "block-header", "state-root", "block-hash", "block-tag", "chain-id", "transaction-receipt", "event-log"]
  },
  {
    id: "reads",
    label: "Reading the chain",
    blurb: "Your first requests: block numbers, blocks, balances, transactions, receipts, code, storage, and eth_call.",
    topics: ["cli-tools", "eth-block-number", "eth-get-block-by-number", "eth-get-balance", "eth-get-transaction-count", "eth-get-transaction-by-hash", "eth-get-transaction-receipt", "eth-get-block-receipts", "eth-get-code", "abi", "eth-call", "revert", "contract-storage", "eth-get-storage-at", "net-web3-api", "eth-syncing"]
  },
  {
    id: "writes",
    label: "Fees and sending",
    blurb: "How fees are priced and gas is estimated, what happens to a transaction between submission and inclusion, and how relayers land transactions reliably.",
    topics: ["transaction-types", "eip-1559", "eth-gas-price", "eth-fee-history", "eth-estimate-gas", "access-list", "eth-create-access-list", "gas-refunds", "mempool", "eth-send-raw-transaction", "eth-send-transaction", "transaction-lifecycle", "txpool-api", "transaction-relayer"]
  },
  {
    id: "events",
    label: "Events and logs",
    blurb: "Finding what contracts emitted: event topics, the logs bloom, eth_getLogs, filters, and subscriptions.",
    topics: ["event-signature", "logs-bloom", "eth-get-logs", "log-index", "eth-filters", "eth-subscribe", "block-by-timestamp"]
  },
  {
    id: "execution",
    label: "Simulation and tracing",
    blurb: "Contracts in more depth, then the methods that simulate a call against modified state and replay execution step by step, and the techniques and services built on them.",
    topics: ["proxy-contract", "precompiles", "transient-storage", "eip-7702", "state-override", "deployless-call", "eth-simulate", "debug-api", "execution-trace", "trace-api", "internal-transaction", "storage-slot-discovery", "transaction-simulation"]
  },
  {
    id: "layers",
    label: "Two kinds of client",
    blurb: "Execution and consensus clients, the Engine API and Beacon API between and around them, and what clients add beyond the standard.",
    topics: ["the-merge", "execution-client", "consensus-client", "engine-api", "engine-payload", "beacon-node", "beacon-api", "beacon-endpoints", "server-sent-events", "client-namespaces", "admin-api", "client-extensions", "client-storage", "client-diversity"]
  },
  {
    id: "pos",
    label: "Proof of stake",
    blurb: "Slots, attestations, fork choice, fast confirmation, and finality: why a block you have read can still change, and the point after which it cannot.",
    topics: ["proof-of-stake", "slot-epoch", "validator", "bls-signature", "ssz", "beacon-block", "execution-payload", "block-proposal", "randao", "attestation", "sync-committee", "fork-choice", "reorg", "finality", "fast-confirmation-rule", "confirmations", "weak-subjectivity", "libp2p-gossip"]
  },
  {
    id: "validators",
    label: "Validators",
    blurb: "The software and keys behind a validator, how it is rewarded, slashed, and protected from slashing, and how its stake enters and leaves the execution layer.",
    topics: ["validator-client", "remote-signer", "distributed-validator", "slashing", "slashing-protection", "withdrawals", "execution-requests", "system-contracts", "validator-rewards", "validator-node"]
  },
  {
    id: "lineup",
    label: "The client lineup",
    blurb: "The execution and consensus clients running the network today, and where each one's RPC behaviour differs.",
    topics: ["geth", "nethermind", "besu", "erigon", "reth", "lighthouse", "prysm", "teku", "nimbus", "lodestar", "grandine"]
  },
  {
    id: "nodes",
    label: "Nodes and history",
    blurb: "Full, archive, and pruned nodes, how a node syncs, how much history it keeps and reports, and the peer-to-peer network underneath.",
    topics: ["full-node", "archive-node", "pruned-node", "partial-archive", "sync-modes", "snap-sync", "checkpoint-sync", "database-snapshot", "node-hardware", "peer-to-peer", "devp2p", "discovery", "historical-data", "history-expiry", "receipt-retention", "eth-capabilities", "era-files", "portal-network"]
  },
  {
    id: "networks",
    label: "Networks and devnets",
    blurb: "Network upgrades, genesis, testnets, other EVM networks, and the local chains, forks, and test harnesses you develop and test against.",
    topics: ["hardfork", "genesis", "testnets", "ephemery", "faucet", "gnosis-chain", "permissioned-network", "chainlist", "local-devnet", "fork-testing", "kurtosis", "hive"]
  },
  {
    id: "mev",
    label: "MEV and building",
    blurb: "Who builds blocks and how: mempool streams, searchers, liquidation bots and solvers, bundles and MEV-Share, builders, relays, MEV-Boost, enshrined PBS, and private submission.",
    topics: ["mev", "searcher", "mempool-streaming", "mev-bundle", "mev-share", "liquidation-bot", "intent-solver", "builder-api", "relay", "mev-boost", "enshrined-pbs", "private-rpc", "preconfirmation"]
  },
  {
    id: "operations",
    label: "Serving RPC",
    blurb: "Who uses RPC and for what, using a provider or running your own node, the limits, authentication, and security an endpoint needs, and what it learns about its callers.",
    topics: ["rpc-provider", "rpc-workloads", "self-hosting", "endpoint-capabilities", "rate-limits", "authentication", "reverse-proxy", "cors", "security", "rpc-privacy"]
  },
  {
    id: "reliability",
    label: "Reliability at scale",
    blurb: "Routing, health checks, failover, retries, caching, and monitoring for a fleet of RPC nodes, racing for the newest head, and benchmarking it all.",
    topics: ["load-balancer", "rpc-gateway", "head-lag", "fastest-head", "health-check", "failover", "retries", "circuit-breaker", "request-cancellation", "caching", "observability", "network-telemetry", "rpc-benchmarking"]
  },
  {
    id: "indexing",
    label: "Indexing",
    blurb: "Turning raw blocks and logs into queryable tables that survive reorgs, and the pipelines built that way: deposits, payments, reconciliation, analytics, rewards, portfolios, and security monitoring.",
    topics: ["indexer", "cursor-pagination", "etl-pipeline", "indexing-database", "block-explorer", "otterscan", "address-history", "signature-directory", "the-graph", "graph-node", "firehose", "substreams", "exchange-deposits", "stablecoin-payments", "accounting-reconciliation", "chain-analytics", "airdrop-rewards", "portfolio-tracker", "security-monitoring"]
  },
  {
    id: "proofs",
    label: "Tries and proofs",
    blurb: "How state is committed to in a trie, and how a proof lets you check an answer against a root you already trust.",
    topics: ["rlp", "merkle-patricia-trie", "hex-prefix-encoding", "state-proof", "eth-get-proof", "account-proof", "storage-proof", "exclusion-proof", "receipt-proof", "inclusion-proof", "generalized-index"]
  },
  {
    id: "trustless",
    label: "Trustless access",
    blurb: "Trusted headers, light clients, and verified RPC, then witnesses, the move toward stateless Ethereum, the binary state tree, and real-time block proving.",
    topics: ["trusted-header", "light-client", "light-client-update", "consensus-proof", "verified-rpc", "helios", "witness", "stateless-ethereum", "verkle-tree", "binary-state-tree", "real-time-proving"]
  },
  {
    id: "l2",
    label: "Layer 2",
    blurb: "Rollups, data availability, blobs and PeerDAS, fraud and validity proofs, sequencers, bridges and their relayers, and how an L2 endpoint differs from mainnet.",
    topics: ["rollup", "data-availability", "blob", "peerdas", "blob-archive", "optimistic-rollup", "fraud-proof", "op-challenger", "zk-rollup", "validity-proof", "validium", "sequencer", "derivation-pipeline", "bridge", "cross-chain-relayer", "predeploys", "l2-rpc"]
  },
  {
    id: "wallets",
    label: "Wallets, dapps and DeFi",
    blurb: "The wallet interface, signing, libraries, names, tokens, and account abstraction, then the apps built on RPC: DEXes, aggregators, oracles, keepers, vaults, NFTs, governance, payments, and agents.",
    topics: ["eip-1193", "eip-6963", "wallet-rpc", "signing-methods", "eip-712", "erc-1271", "erc-6492", "eip-3009", "x402", "client-libraries", "multicall", "ens", "ccip-read", "erc-165", "token-standards", "erc-4626", "dapp-architecture", "erc-4337", "paymaster", "erc-7562", "dex-pool-reads", "quoter-contract", "dex-aggregator", "price-oracle", "keeper", "nft-marketplace", "governance-voting-power", "onchain-agents"]
  }
];
