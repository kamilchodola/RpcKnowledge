// Category: nodes — node roles, synchronization, storage and networking.

export const topics = [
  {
    id: "full-node",
    title: "Full node",
    category: "nodes",
    aliases: ["full client", "validating node", "self-verifying node"],
    summary: "A full node runs an [[execution-client|execution client]] and [[consensus-client|consensus client]] to validate chain data and serve RPC from locally maintained state.",
    sections: [
      {
        heading: "What ‘full’ means",
        paragraphs: [
          "A full node is a coupled system, not one particular binary. The execution client validates transactions, executes blocks, and maintains the current account and contract [[state|state]]. The consensus client tracks Beacon blocks, attestations, [[fork-choice|fork choice]], and [[finality|finality]]. They exchange payloads over the authenticated [[engine-api|Engine API]] while each participates in its own peer-to-peer network.",
          "The node can answer application [[json-rpc|JSON-RPC]] from data it has verified or reconstructed locally. It can read the current head, simulate calls, inspect receipts, and accept signed transactions without asking a hosted provider to vouch for the answer. That independence is the main reason to run one, alongside privacy and network resilience.",
        ],
      },
      {
        heading: "Validation and retention",
        paragraphs: [
          "Full does not mean that every byte since genesis remains on disk. Most full-node configurations prune old state or retain only a recent serving window while keeping enough block and state information to follow the chain. A node can therefore validate the chain and answer current [[eth-call|eth_call]] while failing to answer a call against a very old block. Retention is an explicit dimension separate from validation.",
          "An [[archive-node|archive node]] retains much more historical state; a [[pruned-node|pruned node]] intentionally discards selected data. A full node may rebuild some state by replaying blocks, but that can be expensive and may not restore every client-specific trace or [[eth-get-proof|proof]] capability. Record the client, sync mode, pruning mode, and tested block range for any service promise.",
        ],
      },
      {
        heading: "A practical deployment",
        paragraphs: [
          "Run the execution and consensus processes on storage and CPU sized for their workloads, keep Engine API private, and expose only the public namespaces applications need. Monitor execution head, consensus head, finalized checkpoint, peer count, database pressure, and payload status together. An HTTP listener can be responsive while the node is syncing or while one half of the pair is stalled.",
          "For an [[indexer|indexer]], a full node is a source of validated chain data, not a replacement for an application database. Store block hashes and cursors, handle [[reorg|reorganizations]], and use explicit block identifiers when several reads must describe the same snapshot. For high-value answers, combine local validation with a [[state-proof|state proof]] or an independently trusted header.",
        ],
      },
    ],
    pitfalls: [
      "Assuming every full node can answer arbitrary historical state or proof requests.",
      "Running only the execution client and calling the resulting process a complete post-Merge node.",
      "Health-checking only the HTTP port without checking sync, finalized checkpoint, and Engine API status.",
      "Using a node’s block number as an application database cursor without recording the block hash.",
    ],
    related: ["execution-client", "consensus-client", "archive-node", "pruned-node", "engine-api", "state", "json-rpc", "indexer", "state-proof", "sync-modes"],
    sources: [
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "ethereum.org: Run a node", url: "https://ethereum.org/developers/docs/nodes-and-clients/run-a-node/" },
    ],
  },
  {
    id: "archive-node",
    title: "Archive node",
    category: "nodes",
    aliases: ["archive mode", "historical-state node", "full history node"],
    summary: "An archive node is configured to retain historical execution state so old-block queries can be answered without rebuilding every snapshot on demand.",
    sections: [
      {
        heading: "What it adds",
        paragraphs: [
          "A normal [[full-node|full node]] is optimized for following the current chain. An archive node keeps additional state versions, indexes, or trie material needed to answer questions such as an account balance, contract storage slot, or [[eth-call|eth_call]] at an old block. This is useful to explorers, auditors, researchers, and [[indexer|indexers]] that need historical state rather than only transaction history.",
          "Archive is a storage policy, not a separate consensus role. The same [[execution-client|execution client]] still validates execution and the same [[consensus-client|consensus client]] still tracks proof-of-stake. The extra data can be held in different formats: some clients retain trie nodes, others use flat historical tables or immutable files, and the query cost depends on that implementation.",
        ],
      },
      {
        heading: "Archive does not mean every query",
        paragraphs: [
          "The word archive is not a universal compatibility guarantee. Old block bodies, old state, transaction indexes, traces, logs, and [[eth-get-proof|proof]] paths are separate capabilities. A client may have historical balances but lack a particular trace namespace; it may retain state values but need extra historical trie nodes for proof generation; a provider may advertise archive reads but impose range or method limits.",
          "Test the exact methods and block range before promising availability. For proofs, retain the requested [[block-header|header]] and check whether the client’s configured historical data can construct the account or storage path. For traces, test the selected tracer and state context. For logs and receipts, check transaction-history indexes separately from state retention.",
        ],
      },
      {
        heading: "Cost and operations",
        paragraphs: [
          "Archive storage consumes substantially more disk and I/O than a pruned node, and compaction or recovery can take a long time. Put the RPC workload behind a separate [[rpc-gateway|gateway]] or read replica when expensive history queries would compete with block processing. Keep backups and document the client release, state scheme, pruning flags, and data directory layout; restoring a current archive from an arbitrary snapshot may not preserve the same proof behavior.",
          "A managed [[rpc-provider|provider]] can be a practical archive source, but it moves the trust and availability boundary. Compare chain ID, block hash, retention window, rate limits, and proof support with a self-hosted node or another provider. Archive access helps retrieve data; it does not by itself establish [[finality|finality]] or make an RPC response independently verified.",
        ],
      },
    ],
    pitfalls: [
      "Treating an archive label as a guarantee of every historical trace or proof method.",
      "Confusing retained transactions and receipts with retained historical account state.",
      "Putting unbounded archive scans on the same resources that import and validate the head.",
      "Changing pruning or state-storage settings without a documented migration or resync plan.",
    ],
    related: ["full-node", "pruned-node", "client-storage", "history-expiry", "eth-call", "eth-get-proof", "block-header", "rpc-provider", "rpc-gateway", "finality"],
    sources: [
      { title: "Ethereum: Archive nodes", url: "https://ethereum.org/developers/docs/nodes-and-clients/archive-nodes" },
      { title: "Geth: Archive mode", url: "https://geth.ethereum.org/docs/fundamentals/archive" },
      { title: "EIP-4444: Bound historical data in execution clients", url: "https://eips.ethereum.org/EIPS/eip-4444" },
    ],
  },
  {
    id: "pruned-node",
    title: "Pruned node",
    category: "nodes",
    aliases: ["state pruning", "history pruning", "recent-state node"],
    summary: "A pruned node deletes selected historical data after it is no longer needed for its configured validation and serving workload.",
    sections: [
      {
        heading: "Why prune",
        paragraphs: [
          "The chain grows continuously, but many applications read only recent state. A [[full-node|full node]] can prune older state snapshots, trie nodes, indexes, or other derived data while continuing to validate new blocks and serve current [[json-rpc|JSON-RPC]]. The result uses less disk and often has simpler operational requirements than an [[archive-node|archive node]].",
          "Pruning is not the same as trusting a snapshot. The execution client still validates the data it imports according to its sync strategy and maintains the current [[state-root|state root]]. What disappears is the ability to answer some old-state questions immediately. The exact window and regeneration behavior are implementation-specific, so avoid turning a typical window into an API contract.",
        ],
      },
      {
        heading: "What RPC changes",
        paragraphs: [
          "Current-state methods such as balance, code, storage, and [[eth-call|eth_call]] usually work when the block tag is recent. A request against an old block may fail with a missing trie node, a block-not-found response, or a client-specific error; another client may regenerate the state and answer it. Old transaction receipts and logs can have different retention rules from old account state, so test them independently.",
          "A pruned node should not be assumed to generate old [[eth-get-proof|proofs]]. Proof construction requires the relevant account and storage path, while reading a value may require less information. If an application must verify a value offline, capture the [[block-header|header]], proof response, and verification result while the required data is available.",
        ],
      },
      {
        heading: "Choosing a pruning policy",
        paragraphs: [
          "Choose retention from actual workloads: recent dapp reads, transaction submission, log scanning, traces, historical analytics, or proof generation. Keep an explicit [[indexer|indexer]] for decoded application history instead of expecting the node’s database to be a reporting store. If the indexer later needs to replay an old call, route that job to an archive-capable pool and make the dependency visible.",
          "Document the client version, sync mode, pruning mode, and restoration path. A switch that only affects future writes may not restore already deleted state; some changes require a rebuild. Monitor free space and pruning progress alongside execution and consensus sync so a successful RPC health check does not conceal a node that cannot keep up.",
        ],
      },
    ],
    pitfalls: [
      "Saying that all full nodes keep exactly the same number of historical state blocks.",
      "Treating a missing old-state response as evidence that the block or transaction never existed.",
      "Assuming a client can reconstruct every deleted trie node on demand.",
      "Testing only `latest` and discovering after deployment that archive-dependent workloads fail.",
    ],
    related: ["full-node", "archive-node", "client-storage", "sync-modes", "eth-call", "eth-get-proof", "state-root", "indexer", "execution-client"],
    sources: [
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "Geth: Archive mode and state history", url: "https://geth.ethereum.org/docs/fundamentals/archive" },
    ],
  },
  {
    id: "light-client",
    title: "Light client",
    category: "nodes",
    aliases: ["light node", "header client", "mobile client", "Helios"],
    summary: "A light client verifies selected Ethereum data from compact headers and proofs instead of storing and executing the entire chain locally.",
    sections: [
      {
        heading: "Small local state, explicit verification",
        paragraphs: [
          "A light client avoids downloading the full execution and consensus databases. It tracks enough authenticated header or consensus information to request a value from a remote source and check that value against a committed root. This differs from an ordinary [[rpc-provider|provider]] call: a provider returns a JSON response, while a light client’s protocol includes the information needed to reject a response that does not match its trusted view.",
          "Execution and consensus light-client designs have different moving parts. Consensus light clients follow Beacon headers and sync committee signatures; execution data may require a [[state-proof|state proof]] and a trusted execution commitment. The client therefore needs a trust anchor such as a weak-subjectivity checkpoint or an authenticated header chain rather than blindly accepting the newest block a server advertises.",
        ],
      },
      {
        heading: "What it can and cannot do",
        paragraphs: [
          "A light client can support focused wallet or embedded-device reads, verify account or storage values, and reduce the hardware needed to obtain trustworthy chain information. It does not automatically provide every [[json-rpc|JSON-RPC]] method, replay arbitrary historical traces, index logs, or participate as a validator. Data that is not committed by the proof path still needs another source and another trust decision.",
          "The remote full node still performs much of the work: it supplies headers, branch proofs, or execution data. The light client verifies what it receives and can reject missing or inconsistent responses. This makes the network and protocol support important; a light client is not simply a browser wrapper around an unauthenticated HTTP endpoint.",
        ],
      },
      {
        heading: "Operational trade-offs",
        paragraphs: [
          "Light clients trade local storage and bandwidth for protocol complexity, update latency, and dependence on peers or relays that serve the required proofs. Keep the consensus checkpoint, client version, and verification policy observable. A wallet may accept a finalized view for a balance display but require stronger confirmation before signing a transaction or releasing funds.",
          "When an application needs broad queries, low latency, or historical scans, a verified light-client path may be complemented by a [[full-node|full node]] or [[indexer|indexer]]. The two paths should remain distinguishable: cached RPC data is an optimization, while the light client’s header and proof checks are the security decision. Do not advertise all remote RPC as light-client security.",
        ],
      },
    ],
    pitfalls: [
      "Calling a wallet that uses a provider a light client without local header or proof verification.",
      "Assuming light clients expose the complete execution JSON-RPC method set.",
      "Skipping weak-subjectivity or checkpoint management because headers are cryptographically signed.",
      "Using a light client as a validator or archive index without the required data and duties.",
    ],
    related: ["full-node", "trusted-header", "consensus-proof", "state-proof", "rpc-provider", "consensus-client", "beacon-node", "json-rpc", "indexer"],
    sources: [
      { title: "ethereum.org: Light clients", url: "https://ethereum.org/developers/docs/networking-layer/light-clients/" },
      { title: "Consensus light-client specifications", url: "https://github.com/ethereum/consensus-specs/tree/dev/specs/altair/light-client" },
    ],
  },
  {
    id: "snap-sync",
    title: "Snap sync",
    category: "nodes",
    aliases: ["snapshot sync", "state snapshot sync", "snap mode"],
    summary: "Snap sync is a fast execution-client synchronization strategy that downloads a recent state snapshot and verifies it against chain data before following the head.",
    sections: [
      {
        heading: "The synchronization shortcut",
        paragraphs: [
          "A from-scratch execution client does not need to re-execute every transaction from genesis before it can serve current reads. In snap sync, peers provide recent account and storage state in chunks, while the client obtains headers and block bodies, verifies the snapshot against an authenticated [[state-root|state root]], and then processes newer blocks locally. The exact phases, peer protocol, and defaults belong to the client implementation.",
          "Snap sync is therefore a bootstrap method, not a weaker consensus mode. Once synchronized, the execution client validates new blocks and maintains the same protocol state transition as a node that replayed from genesis. It can still be configured as a [[pruned-node|pruned node]] or [[archive-node|archive node]] depending on what history the operator retains after sync.",
        ],
      },
      {
        heading: "RPC during and after sync",
        paragraphs: [
          "During synchronization, an endpoint may accept requests while its head is behind or while historical state is unavailable. `eth_syncing`, head numbers, finalized checkpoints, and method-specific probes are more informative than an HTTP 200. Do not let an [[rpc-provider|RPC provider]] or [[rpc-gateway|gateway]] route production reads to a node merely because the process has opened port 8545.",
          "After snap sync reaches the head, current [[eth-call|eth_call]], balances, code, storage, and transaction submission should follow the client’s normal policy. Historical state depends on the retention mode, not on the fact that snap sync was used. An [[eth-get-proof|eth_getProof]] request may need historical trie nodes that the post-sync database did not retain.",
        ],
      },
      {
        heading: "Bootstrap choices",
        paragraphs: [
          "Choose snap sync when quick time-to-head and a normal current-state workload matter. Choose a full or archive-oriented path when the operator needs to validate or preserve deeper history locally, subject to the client’s supported modes. A trusted checkpoint or snapshot distribution can reduce initial work, but verify the source, chain ID, and resulting commitments before treating it as a local node.",
          "Measure snapshot download, state healing, peer availability, disk throughput, and time to finality. If a node repeatedly stalls, compare its sync phase with [[peer-to-peer|peer]] health and [[node-hardware|hardware]] capacity. Restoring a database snapshot can be faster than syncing again, but it should be part of a tested recovery plan rather than an unexamined shortcut.",
        ],
      },
    ],
    pitfalls: [
      "Describing snap sync as skipping validation rather than changing the bootstrap route.",
      "Exposing a syncing node as healthy because its HTTP listener responds.",
      "Assuming snap sync determines archive or proof availability after synchronization.",
      "Taking a state snapshot from an unverified source without checking chain identity and commitments.",
    ],
    related: ["sync-modes", "full-node", "pruned-node", "archive-node", "state-root", "eth-call", "eth-get-proof", "peer-to-peer", "node-hardware", "health-check"],
    sources: [
      { title: "Geth: Sync modes", url: "https://geth.ethereum.org/docs/fundamentals/sync-modes" },
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
    ],
  },
  {
    id: "peer-to-peer",
    title: "Peer-to-peer networking",
    category: "nodes",
    aliases: ["P2P", "node gossip", "network peers", "gossip network"],
    summary: "Peer-to-peer networking lets execution and consensus nodes exchange blocks, transactions, attestations, and synchronization data without routing those messages through application RPC.",
    sections: [
      {
        heading: "RPC is not the node network",
        paragraphs: [
          "An RPC client talks to one endpoint using HTTP, WebSocket, IPC, or another configured transport. A node’s peer-to-peer layer talks to other nodes using protocol-specific discovery, handshakes, gossip, and request-response messages. The two surfaces serve different purposes: RPC gives applications selected views and commands, while peers supply the data needed for the node to validate and follow the chain.",
          "Execution clients exchange transactions and execution blocks; consensus clients exchange Beacon blocks, attestations, and sync committee material. The processes then coordinate locally through [[engine-api|Engine API]]. A successful RPC call does not make the caller a peer, grant it a place in [[fork-choice|fork choice]], or let it inject arbitrary consensus messages.",
        ],
      },
      {
        heading: "Discovery and gossip",
        paragraphs: [
          "Execution networking commonly uses devp2p discovery and subprotocols, while consensus networking uses libp2p-based discovery and gossip. The exact wire protocols and port defaults vary by client and configuration, but the operational ideas are stable: discover useful peers, authenticate or negotiate protocol capabilities, request missing data, and gossip newly observed data to other peers. [[devp2p|devp2p]] is therefore an execution-side concept, not a synonym for all Ethereum networking.",
          "Peer count alone is a weak health signal. A node can have peers that are stale, on another network, unable to serve the state it needs, or disconnected from the best head. Combine peer metrics with sync phase, head lag, finalized checkpoint, and payload status when deciding whether to admit the node to an RPC pool.",
        ],
      },
      {
        heading: "Network operations",
        paragraphs: [
          "Firewall rules should permit the peer traffic the node needs while keeping public RPC, Beacon API, and Engine API boundaries intentional. A [[self-hosting|self-hosted node]] behind a restrictive NAT may need bootnodes, static peers, or carefully configured discovery; a node with no useful peers can never become a reliable RPC source. Record the network, chain ID, client version, and peer diversity when diagnosing a split view.",
          "Do not “fix” a peer problem by exposing administrative RPC methods. RPC can inspect selected status, but peer behavior is controlled by the node’s networking configuration and protocol implementation. A [[health-check|health check]] should report when a node is reachable yet cannot obtain or validate fresh data, so a [[load-balancer|load balancer]] can remove it before applications see stale results.",
        ],
      },
    ],
    pitfalls: [
      "Treating an RPC connection as a peer-to-peer connection with consensus privileges.",
      "Using peer count as the only signal for sync or data freshness.",
      "Opening Engine API or administrative RPC ports to solve a peer discovery problem.",
      "Mixing mainnet, testnet, or private-network peers through loose firewall and discovery rules.",
    ],
    related: ["devp2p", "execution-client", "consensus-client", "engine-api", "fork-choice", "full-node", "self-hosting", "health-check", "load-balancer", "sync-modes"],
    sources: [
      { title: "ethereum.org: Networking layer", url: "https://ethereum.org/developers/docs/networking-layer/" },
      { title: "Ethereum execution networking", url: "https://github.com/ethereum/devp2p" },
      { title: "Ethereum consensus specs", url: "https://github.com/ethereum/consensus-specs" },
    ],
  },
  {
    id: "devp2p",
    title: "devp2p",
    category: "nodes",
    aliases: ["Ethereum devp2p", "RLPx", "eth protocol", "snap protocol"],
    summary: "devp2p is the execution-network protocol family used by execution clients for discovery, peer sessions, transaction gossip, block exchange, and state synchronization.",
    sections: [
      {
        heading: "Where it fits",
        paragraphs: [
          "Execution clients use devp2p to find and communicate with other execution clients. RLPx provides the encrypted authenticated session, discovery identifies potential peers, and subprotocols such as `eth` and `snap` define what execution data can be exchanged. This sits below [[json-rpc|JSON-RPC]]: an application asking for a block does not speak devp2p, and an RPC endpoint cannot substitute for a healthy peer session.",
          "The execution network carries transactions and execution blocks, while the consensus client uses its own peer network for Beacon blocks and attestations. The paired processes meet at [[engine-api|Engine API]]. Keeping these layers distinct prevents an operator from assuming that an execution peer count proves the consensus side is synchronized.",
        ],
      },
      {
        heading: "Sync and gossip",
        paragraphs: [
          "The `eth` protocol supports chain and block exchange; the `snap` protocol supports downloading state ranges that can accelerate [[snap-sync|snap sync]]. Peers request data, verify it against headers and roots, and share newly observed transactions and blocks. A node can still reject a peer’s data if it conflicts with protocol rules or the current [[fork-choice|fork choice]]. The network is a source of candidate data, not an authority that overrides local validation.",
          "Discovery and protocol support are versioned and client-specific. An operator should watch peer session errors, requested-data latency, bandwidth, and whether peers provide the state ranges the sync phase requires. If the node has no suitable peers, RPC may remain available with a stale head while the process waits for data.",
        ],
      },
      {
        heading: "Practical boundaries",
        paragraphs: [
          "Permit peer traffic deliberately in firewall and container rules, and use bootnodes or static peers when discovery is constrained. Keep RPC, Engine API, and administrative namespaces on separate network policies. A [[self-hosting|self-hosted node]] may need public peer reachability for robust operation, but that does not imply public read or write access to its JSON-RPC methods.",
          "Troubleshoot from the bottom up: confirm the chain and network, inspect peer sessions, check sync phase, compare head and finalized values, then test RPC methods. If a [[health-check|health check]] only curls port 8545, it will miss a node that has lost all useful devp2p peers. Put that richer signal into the [[observability|metrics]] used by an RPC pool.",
        ],
      },
    ],
    pitfalls: [
      "Calling devp2p the application RPC interface.",
      "Assuming every execution peer supports the same optional subprotocol or state-serving behavior.",
      "Exposing administrative JSON-RPC to compensate for blocked peer traffic.",
      "Declaring a node healthy from a port check while its sync phase is stalled.",
    ],
    related: ["peer-to-peer", "execution-client", "snap-sync", "sync-modes", "engine-api", "json-rpc", "self-hosting", "health-check", "observability", "fork-choice"],
    sources: [
      { title: "Ethereum devp2p repository", url: "https://github.com/ethereum/devp2p" },
      { title: "ethereum.org: Networking layer", url: "https://ethereum.org/developers/docs/networking-layer/" },
    ],
  },
  {
    id: "history-expiry",
    title: "History expiry",
    category: "nodes",
    aliases: ["EIP-4444", "bounded history", "historical data expiry"],
    summary: "History expiry is the protocol and client direction of allowing old block history to be pruned from ordinary nodes while alternate retrieval systems preserve access.",
    sections: [
      {
        heading: "History versus state",
        paragraphs: [
          "Ethereum data has several histories. Execution block headers, block bodies, and receipts describe past activity; account and contract state describe snapshots; consensus clients retain Beacon information; and application [[indexer|indexers]] derive searchable records. [[eip|EIP-4444]] focuses on making ancient block history optional for execution clients, while state pruning and archive policies address different data. A node that expires old bodies can still serve current state and validate new blocks.",
          "This distinction matters for RPC. `eth_getBlockByNumber`, transaction lookup, logs, traces, old [[eth-call|eth_call]], and [[eth-get-proof|proof]] generation can depend on different retained structures. Do not promise that one ‘history’ setting controls every method. Ask which data source will serve the request and whether the node can reconstruct it.",
        ],
      },
      {
        heading: "Why expiry is useful",
        paragraphs: [
          "Historical block data grows forever and is often replicated by many providers even when only a subset of applications needs it. Expiry can reduce the storage burden for ordinary validating nodes and shift old-data serving to dedicated archives, peer protocols, portals, or application databases. The goal is not to erase Ethereum history; it is to avoid requiring every node to store every historical byte.",
          "A node that does not retain old blocks can still validate the current chain from its available synchronization point and maintain recent state. A [[light-client|light client]] may obtain selected historical facts through proofs or specialized protocols. The security and availability of those alternate sources must be made explicit rather than hidden behind a familiar RPC URL.",
        ],
      },
      {
        heading: "Application planning",
        paragraphs: [
          "If a service needs ancient blocks, receipts, or traces, retain them in a dedicated archive or indexed store and record the block hash with every derived record. If it needs historical state proofs, preserve the state evidence and the trusted [[block-header|header]] at collection time; old state values alone may not recreate the necessary path. If it needs user-facing data, expose the retrieval boundary and failure mode instead of returning an unexplained provider error.",
          "Operators should document which history they retain, when pruning runs, how restoration works, and which external source is used for expired data. Monitor archive synchronization and [[endpoint-capabilities|capabilities]] separately from the health of current-state RPC. Expiry becomes safe when applications are designed for explicit data provenance rather than accidental local availability.",
        ],
      },
    ],
    pitfalls: [
      "Treating history expiry as the same thing as state pruning or archive mode.",
      "Assuming an old block number can always be resolved by an ordinary execution RPC endpoint.",
      "Dropping block hashes from derived records and keeping only heights.",
      "Hiding expired-data fallbacks behind a provider URL without documenting provenance and verification.",
    ],
    related: ["archive-node", "pruned-node", "client-storage", "light-client", "indexer", "eth-call", "eth-get-proof", "block-header", "endpoint-capabilities", "historical-data"],
    sources: [
      { title: "EIP-4444: Bound historical data in execution clients", url: "https://eips.ethereum.org/EIPS/eip-4444" },
      { title: "ethereum.org: Archive nodes", url: "https://ethereum.org/developers/docs/nodes-and-clients/archive-nodes" },
    ],
  },
  {
    id: "sync-modes",
    title: "Sync modes",
    category: "nodes",
    aliases: ["synchronization strategy", "full sync", "checkpoint sync", "snap sync"],
    summary: "Sync modes define how a client obtains headers, bodies, state, and consensus data before it becomes a reliable node for RPC workloads.",
    sections: [
      {
        heading: "Bootstrap strategies",
        paragraphs: [
          "An execution client can replay a long history, download and verify a state snapshot through [[snap-sync|snap sync]], or restore a documented database checkpoint before catching up. Consensus clients have their own checkpoint or range-sync strategies. The names and flags vary across [[geth|Geth]], [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]], and [[besu|Besu]], so an application should describe the outcome and retention policy rather than rely on one universal command-line vocabulary.",
          "Every strategy still needs validation. Headers, blocks, state commitments, and consensus checkpoints must be checked against protocol rules and the intended chain. A faster bootstrap changes when a node becomes useful; it does not turn an unverified database into canonical truth. Record the trusted checkpoint or snapshot provenance in the recovery runbook.",
        ],
      },
      {
        heading: "When RPC is ready",
        paragraphs: [
          "A process can open RPC before it is synchronized. During startup it may return a low head, missing blocks, incomplete state, or errors for methods that will work later. Gate traffic on execution and consensus sync, a recent head, finalized checkpoint, and successful probes for the actual workloads: current calls, logs, traces, archive reads, or proof generation.",
          "The node’s final retention is independent of the initial sync mode. A snap-synced node can run with pruned history; a node restored from an archive snapshot may retain old state; and a consensus checkpoint does not guarantee execution archive data. Route each requirement to a tested [[endpoint-capabilities|capability]] pool.",
        ],
      },
      {
        heading: "Performance and recovery",
        paragraphs: [
          "Sync is a workload with dependencies: peer quality, disk random I/O, sequential write throughput, CPU execution, memory, and network bandwidth. Measure time spent in each phase and keep enough free disk for compaction. A [[node-hardware|hardware]] upgrade that improves database latency may matter more than extra network bandwidth once the node is healing state.",
          "Use a tested backup or snapshot for recovery, but verify the restored chain ID, head hash, finalized checkpoint, and RPC methods before rejoining a load balancer. If a node is repeatedly reset, diagnose peers, storage, and client logs rather than changing modes blindly. A [[self-hosting|self-hosted]] node is an operational system, not a one-time download.",
        ],
      },
    ],
    pitfalls: [
      "Treating a sync flag from one client as portable to another client.",
      "Putting a node into production because the RPC port opened before the head and finalized checkpoint caught up.",
      "Assuming a fast initial sync produces archive history.",
      "Restoring a snapshot without verifying chain identity, commitments, and workload-specific method support.",
    ],
    related: ["snap-sync", "full-node", "archive-node", "pruned-node", "execution-client", "consensus-client", "endpoint-capabilities", "node-hardware", "health-check", "self-hosting"],
    sources: [
      { title: "Geth: Sync modes", url: "https://geth.ethereum.org/docs/fundamentals/sync-modes" },
      { title: "Ethereum: Run a node", url: "https://ethereum.org/developers/docs/nodes-and-clients/run-a-node/" },
    ],
  },
  {
    id: "node-hardware",
    title: "Node hardware",
    category: "nodes",
    aliases: ["disk I/O", "node sizing", "SSD node", "RAM and bandwidth"],
    summary: "Node hardware is the CPU, memory, storage, and network capacity that determines sync time, RPC latency, historical-query throughput, and recovery behavior.",
    sections: [
      {
        heading: "The bottlenecks are uneven",
        paragraphs: [
          "Execution and consensus clients use different resources. Execution sync and EVM processing consume CPU; trie and database reads depend heavily on random I/O and latency; state and archive data consume disk; consensus gossip and checkpoint sync consume network and memory. A machine with many cores can still fall behind if its storage cannot sustain compaction or state reads. Measure the client workload rather than choosing hardware from a single headline specification.",
          "Current-state RPC and archive RPC have different profiles. `eth_blockNumber` is cheap, while wide [[eth-get-logs|eth_getLogs]], traces, old [[eth-call|eth_call]], and [[eth-get-proof|proof]] generation can read large structures or execute historical state. Keep expensive work away from the node responsible for importing blocks when latency and freshness matter.",
        ],
      },
      {
        heading: "Sizing a node for RPC",
        paragraphs: [
          "Start from retention and query requirements. A pruned [[full-node|full node]] needs less disk than an [[archive-node|archive node]], but both need headroom for growth, compaction, temporary sync files, logs, and backups. An [[indexer|indexer]] or trace workload often needs its own storage and database. If applications expect high concurrency, add read replicas or a [[rpc-gateway|gateway]] rather than assuming one larger disk fixes every queue.",
          "Memory affects caching, trie access, database compaction, and concurrent calls. Network capacity must cover peer sync and RPC responses at the same time. Use realistic request mixes and block ranges in load tests; a benchmark that sends only `eth_chainId` says little about a production log scanner or historical simulator.",
        ],
      },
      {
        heading: "Operations and failure",
        paragraphs: [
          "Monitor free disk, IOPS, fsync latency, database size, CPU saturation, memory pressure, peer bandwidth, and execution/consensus head lag. Alert before the filesystem is full because clients may stop importing blocks or corrupt recovery assumptions when writes fail. Use snapshots or backups only when the client supports them safely and test restore time against your service objective.",
          "Keep the hardware profile with the node’s client version, storage mode, sync mode, and archive promise. A node that was adequate at launch can become a pruned or archive bottleneck as state and RPC traffic grow. Route it out of the [[load-balancer|load balancer]] during resync and re-admit it only after workload-specific [[health-check|health checks]] pass.",
        ],
      },
    ],
    pitfalls: [
      "Sizing from CPU cores while ignoring random storage latency and compaction.",
      "Measuring only cheap RPC methods instead of historical logs, traces, calls, or proof requests.",
      "Filling a disk to the point that sync and recovery cannot complete.",
      "Keeping a resyncing node in the production RPC pool because its process is still running.",
    ],
    related: ["full-node", "archive-node", "pruned-node", "client-storage", "sync-modes", "eth-get-logs", "eth-call", "eth-get-proof", "rpc-gateway", "health-check"],
    sources: [
      { title: "ethereum.org: Run a node", url: "https://ethereum.org/developers/docs/nodes-and-clients/run-a-node/" },
      { title: "Geth: Hardware requirements", url: "https://geth.ethereum.org/docs/getting-started/hardware-requirements" },
    ],
  },
  {
    id: "checkpoint-sync",
    title: "Checkpoint sync",
    category: "nodes",
    aliases: ["trusted node sync", "checkpoint-sync-url", "beacon state sync", "checkpointz"],
    summary: "Checkpoint sync starts a [[consensus-client|consensus client]] from a recent finalized beacon state downloaded over the [[beacon-api|Beacon API]] from a trusted endpoint, instead of replaying every slot since [[genesis|genesis]].",
    sections: [
      {
        heading: "Starting from a finalized state",
        paragraphs: [
          "Replaying the Beacon Chain from genesis means processing millions of 12-second slots and every [[attestation|attestation]] in them, which takes days. Checkpoint sync skips that work: the client asks a provider for the state at the `finalized` state id and the matching block, adopts it as its anchor, and runs [[fork-choice|fork choice]] forward from there. A [[beacon-node|beacon node]] reaches the head in minutes.",
          "The downloaded state is not self-verifying. The client checks internal consistency and the state’s hash tree root, but nothing in the file proves that it belongs to the canonical chain; that gap is the [[weak-subjectivity|weak subjectivity]] assumption. The operator supplies the missing trust by choosing the endpoint and comparing the resulting block root against a second source before the node serves anything.",
        ],
      },
      {
        heading: "What the node can answer afterwards",
        paragraphs: [
          "Checkpoint sync covers the consensus side only. The paired [[execution-client|execution client]] still has to fetch state and history itself, usually through [[snap-sync|snap sync]], so [[eth-syncing|eth_syncing]] keeps returning a progress object well after the beacon node calls itself synced. Until then `engine_newPayload` answers `SYNCING` and the node cannot serve [[eth-call|eth_call]] or balances at the head.",
          "The beacon node also holds no blocks below its anchor until backfill finishes, so Beacon API requests for earlier slots return `404` on an otherwise healthy node. Blob sidecars are unrecoverable beyond the 4096-epoch (about 18 days) retention window. Once both clients are caught up, the `safe` and `finalized` [[block-tag|block tags]] behave normally, because the consensus client finally has real checkpoints to push over the [[engine-api|Engine API]].",
        ],
      },
      {
        heading: "Running it",
        paragraphs: [
          "[[lighthouse|Lighthouse]], [[prysm|Prysm]] and [[teku|Teku]] take `--checkpoint-sync-url`; Prysm also takes `--genesis-beacon-api-url` to fetch the genesis state, which matters on networks whose genesis is not built into the binary. [[lodestar|Lodestar]] spells it `--checkpointSyncUrl`, and [[nimbus|Nimbus]] runs a separate `trustedNodeSync` command before the node starts. Public checkpoint endpoints exist per network, and many teams point new nodes at a beacon node they already run.",
          "Treat the anchor as a recorded artifact: log the block root and slot the node started from and keep them with the deployment. If a node has been offline longer than the weak subjectivity period, resync it from a fresh checkpoint rather than restarting it. Reconstructing historic consensus states for an [[archive-node|archive node]] is a separate and much longer job.",
        ],
      },
    ],
    example: {
      title: "Starting a beacon node from a checkpoint, then checking the anchor",
      language: "bash",
      code: "lighthouse beacon_node \\\n  --network mainnet \\\n  --execution-endpoint http://127.0.0.1:8551 \\\n  --execution-jwt /secrets/jwt.hex \\\n  --checkpoint-sync-url https://checkpoint.example \\\n  --http\n\n# Prysm can fetch the genesis state from the same kind of endpoint\nbeacon-chain \\\n  --checkpoint-sync-url=https://checkpoint.example \\\n  --genesis-beacon-api-url=https://checkpoint.example\n\n# compare the root you just trusted against an independent node\ncurl -s https://checkpoint.example/eth/v1/beacon/headers/finalized\ncurl -s http://127.0.0.1:5052/eth/v1/beacon/headers/finalized",
      note: "The two roots must match; if you never run the comparison, the checkpoint provider decides which chain your node follows.",
    },
    pitfalls: [
      "Announcing the node as synced when only the beacon node is; the execution client is usually still snap syncing and head reads fail.",
      "Taking a checkpoint URL from a random list and never comparing the resulting block root with a second, independent source.",
      "Expecting Beacon API queries for slots below the anchor to work before backfill has finished, and reading the `404` as a node fault.",
      "Restarting a node that was offline longer than the weak subjectivity period instead of resyncing it from a fresh checkpoint.",
    ],
    related: ["weak-subjectivity", "sync-modes", "beacon-api", "consensus-client", "beacon-node", "snap-sync", "block-tag", "finality", "eth-syncing", "engine-api"],
    sources: [
      { title: "Lighthouse book", url: "https://lighthouse-book.sigmaprime.io/" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "ethereum.org: Run a node", url: "https://ethereum.org/developers/docs/nodes-and-clients/run-a-node/" },
    ],
  },
  {
    id: "weak-subjectivity",
    title: "Weak subjectivity",
    category: "nodes",
    aliases: ["weak subjectivity period", "long-range attack", "trusted anchor", "WS checkpoint"],
    summary: "Weak subjectivity is the property of [[proof-of-stake|proof of stake]] that a node joining or rejoining after a long gap cannot pick the right chain from protocol rules alone and must be handed a recent trusted block root out of band.",
    sections: [
      {
        heading: "Why the rules alone are not enough",
        paragraphs: [
          "Under proof of work, extending an old fork costs energy now, so the heaviest chain is self-evident to a new observer. Under proof of stake it is not. Validators who exited and withdrew their stake keep their old signing keys and have nothing left to lose, so they can cheaply sign an alternative history branching from a point in the past. This is the long-range attack.",
          "A client syncing from [[genesis|genesis]] can be handed two chains that both satisfy every state transition rule and both look finalized to a naive verifier. [[fork-choice|Fork choice]] cannot break the tie, because it weighs [[attestation|attestations]] from a validator set that the attacker also controls on the fake branch. The tie is broken by information the node did not derive itself.",
        ],
      },
      {
        heading: "The weak subjectivity period",
        paragraphs: [
          "The safety window is finite because stake takes time to leave. A validator must go through the exit queue and then the withdrawal delay before its 32 ETH is free, and the churn limit caps how fast the active set can turn over. The consensus specs compute the weak subjectivity period from the active validator count and that churn limit; on mainnet it is measured in weeks, and clients log the value they computed.",
          "Inside that window a node with a trusted anchor is safe, because not enough of the staked balance that signed near the anchor has been able to withdraw. Outside it, the guarantee is gone. Raising the maximum effective balance to 2048 ETH in Pectra changed consolidation and churn behaviour, so treat the period as a number the client reports rather than a constant you memorize.",
        ],
      },
      {
        heading: "What it means in practice",
        paragraphs: [
          "Every fresh consensus node needs an anchor, which is what [[checkpoint-sync|checkpoint sync]] supplies; some clients also accept a bare `--weak-subjectivity-checkpoint` of the form `root:epoch`. A [[light-client|light client]] has the same requirement and pins a trusted [[sync-committee|sync committee]] period instead of a full state. Both are trusting a human decision at setup time, not a protocol proof.",
          "The RPC consequence is quiet rather than loud. A node bootstrapped onto a fake branch answers [[eth-block-number|eth_blockNumber]] and [[eth-call|eth_call]] confidently and reports a `finalized` [[block-tag|block tag]] that will never match the real network. Nothing in a JSON-RPC response reveals this, so compare [[chain-id|chain id]], the finalized [[block-hash|block hash]], and the head against an independent endpoint before trusting a newly built node.",
        ],
      },
    ],
    pitfalls: [
      "Assuming that syncing from genesis is the paranoid, trustless option; it is exactly the case weak subjectivity says cannot be settled by rules alone.",
      "Restarting a long-offline node and letting it sync forward, instead of resyncing it from a checkpoint newer than the weak subjectivity period.",
      "Quoting a fixed number of days for the period rather than reading what the client computes for the current validator set.",
      "Believing a node is on the right chain because its responses are internally consistent and its finalized tag advances.",
    ],
    related: ["checkpoint-sync", "proof-of-stake", "finality", "light-client", "consensus-client", "sync-modes", "trusted-header", "block-tag", "sync-committee", "beacon-node"],
    sources: [
      { title: "ethereum.org: Weak subjectivity", url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/weak-subjectivity/" },
      { title: "Ethereum consensus specifications", url: "https://github.com/ethereum/consensus-specs" },
    ],
  },
  {
    id: "discovery",
    title: "Node discovery",
    category: "nodes",
    aliases: ["discv4", "discv5", "ENR", "enode", "bootnodes", "EIP-778", "EIP-1459"],
    summary: "Node discovery is the UDP protocol family, discv4 for the execution layer, which some execution clients supplement with discv5, and discv5 for consensus, through which a client finds peers by walking a Kademlia-style table of signed Ethereum Node Records.",
    sections: [
      {
        heading: "Finding peers with no peers",
        paragraphs: [
          "A client starts with a hardcoded bootnode list for its network and, optionally, a DNS list published as an `enrtree://` URL under [[eip|EIP-1459]]. From those seeds it performs Kademlia-style lookups over UDP, asking known nodes for records close to random target ids and filling a routing table bucketed by XOR distance. Discovery only exchanges records; the actual session is established afterwards.",
          "The two layers run separate discovery networks on separate ports. [[devp2p|devp2p]] uses discv4 on UDP 30303, beside the RLPx TCP port of the same number, while a [[beacon-node|beacon node]] uses discv5 on its own UDP port, 9000 on most clients and 12000 on Prysm, beside its [[libp2p-gossip|libp2p]] TCP port. The [[portal-network|Portal Network]] reuses the discv5 substrate for its own overlay.",
        ],
      },
      {
        heading: "ENR and enode",
        paragraphs: [
          "An enode URL is the older, flat identifier: `enode://<128 hex chars of public key>@<ip>:<port>`. An Ethereum Node Record, defined by [[eip|EIP-778]], replaces it with a signed key/value map carrying a sequence number, the identity scheme, `secp256k1`, `ip`, `tcp`, and `udp`, printed base64 with an `enr:-` prefix. Because it is signed and versioned, a node can update its address and peers accept the newer record.",
          "Records also advertise capability. Execution nodes put a fork id ([[eip|EIP-2124]]) in an `eth` entry so a peer on the wrong side of a [[hardfork|network upgrade]] is rejected before the handshake; consensus nodes advertise `eth2` and the attestation subnets they subscribe to, which is how a validator finds peers on the subnet it needs.",
        ],
      },
      {
        heading: "Where an RPC operator meets it",
        paragraphs: [
          "The [[admin-api|admin_ namespace]] exposes discovery state: `admin_nodeInfo` returns the node’s own enode and ENR, `admin_peers` lists sessions, and `admin_addPeer` pins a static peer. These reveal topology and accept configuration changes, so they belong on a private interface, never on a public endpoint next to `eth_`. The public equivalents are the much weaker [[net-web3-api|net_peerCount]] and `net_listening`.",
          "Most discovery failures look like a network problem, not an RPC problem. A node behind NAT that advertises an unreachable address gets only outbound peers, stalls its head, and then serves stale [[block-tag|latest]] answers with no error. Set the external address explicitly, open the UDP port as well as the TCP one, and make peer count plus head lag part of the [[health-check|health check]].",
        ],
      },
    ],
    example: {
      title: "The node’s own record, from admin_nodeInfo",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"admin_nodeInfo\",\"params\":[]}\n\n// result (abridged)\n{\n  \"id\": \"9f1b2c3d…a1c7\",\n  \"name\": \"Geth/v1.15.0-stable/linux-amd64/go1.23\",\n  \"enode\": \"enode://d860a01f9722d78051619d1e2351aba3f43f943f6f00718d1b9baa4101932a1f5011f16bb2b1bb35db20d6fe28fa0bf09636d26a87d31de9ec6203eeedb1f666@203.0.113.8:30303\",\n  \"enr\": \"enr:-Ku4QImhMc1z8yCiNJ…AgmlkgnY0gmlwhMsAcQiJ…\",\n  \"ip\": \"203.0.113.8\",\n  \"ports\": { \"discovery\": 30303, \"listener\": 30303 },\n  \"protocols\": { \"eth\": { \"network\": 1, \"genesis\": \"0xd4e567…8faa3cb\", \"head\": \"0x9b83c1…ee71\" } }\n}",
      note: "`discovery` is the UDP port and `listener` the TCP one; firewalling only the TCP port leaves the node unable to be found.",
    },
    pitfalls: [
      "Opening only the TCP peering port and leaving the UDP discovery port closed, so the node is never found by anyone.",
      "Leaving the advertised address at an internal NAT address, which gives the node outbound peers only and a slowly drifting head.",
      "Exposing `admin_` methods on the public RPC endpoint to inspect peers, which also hands callers `admin_addPeer`.",
      "Treating an enode URL and an ENR as interchangeable; only the record is signed, versioned, and able to carry fork and subnet data.",
    ],
    related: ["peer-to-peer", "devp2p", "libp2p-gossip", "admin-api", "net-web3-api", "beacon-node", "portal-network", "health-check", "self-hosting", "node-hardware"],
    sources: [
      { title: "Ethereum devp2p specifications", url: "https://github.com/ethereum/devp2p" },
      { title: "EIP-778: Ethereum Node Records (ENR)", url: "https://eips.ethereum.org/EIPS/eip-778" },
      { title: "EIP-1459: Node Discovery via DNS", url: "https://eips.ethereum.org/EIPS/eip-1459" },
    ],
  },
  {
    id: "libp2p-gossip",
    title: "Consensus networking (libp2p)",
    category: "nodes",
    aliases: ["gossipsub", "beacon p2p", "attestation subnets", "req/resp", "port 9000"],
    summary: "[[consensus-client|Consensus clients]] network over libp2p: gossipsub topics push [[beacon-block|beacon blocks]], [[attestation|attestations]] and blob sidecars within the slot, while a request/response protocol pulls historical blocks, both on port 9000 by default.",
    sections: [
      {
        heading: "Push for the slot, pull for history",
        paragraphs: [
          "Gossipsub handles everything that must cross the network inside a 12-second slot. A [[beacon-node|beacon node]] subscribes to a set of topics, validates each message before forwarding it, and propagates to a mesh of peers. Messages are [[ssz|SSZ]]-encoded and snappy-compressed, and topic names embed the current fork digest, so a node on the wrong side of a [[hardfork|network upgrade]] silently stops hearing its neighbours.",
          "Synchronizing history uses a separate request/response protocol rather than gossip: `Status` on connect, then `BeaconBlocksByRange`, `BeaconBlocksByRoot` and `BlobSidecarsByRange` to fill gaps. That is the path a node takes after [[checkpoint-sync|checkpoint sync]] when it backfills, and the path used to catch up after downtime.",
        ],
      },
      {
        heading: "Topics, subnets and scoring",
        paragraphs: [
          "The global topics carry beacon blocks, aggregated attestations, [[sync-committee|sync committee]] contributions, voluntary exits and slashings. Individual attestations travel on 64 `beacon_attestation_{subnet_id}` subnets, and blob sidecars have their own subnets, so a node only carries the traffic relevant to the committees it serves. A [[validator-client|validator client]]’s beacon node must join the right subnet before its committee’s slot, which is why the ENR advertises subscriptions.",
          "Gossipsub scores peers on message validity, timeliness and duplication, and prunes low scorers out of the mesh. A node with a bad clock forwards attestations that arrive outside their acceptance window, loses score, loses peers, and falls behind without any single error appearing in its logs.",
        ],
      },
      {
        heading: "Why an RPC caller should care",
        paragraphs: [
          "This network is where `safe` and `finalized` come from. Attestations gossiped here accumulate into the justified and finalized checkpoints the consensus client pushes to the [[execution-client|execution client]] on each `engine_forkchoiceUpdated` over the [[engine-api|Engine API]]. If the consensus side loses its peers, the execution client stops receiving blocks too, since it only learns of new ones through the consensus client: [[eth-block-number|eth_blockNumber]] keeps answering, but with a head that no longer moves, and the `finalized` [[block-tag|block tag]] stops with it.",
          "Blob data lives here too and nowhere else. A [[blob|blob transaction]] appears in execution RPC with its versioned hashes, but the blob contents are sidecars carried on this network and served from the [[beacon-api|Beacon API]] for 4096 epochs, about 18 days. After that not even an [[archive-node|archive node]] on the execution side brings them back.",
        ],
      },
    ],
    pitfalls: [
      "Monitoring only the execution client’s peer count while the consensus client is the half that has lost its mesh.",
      "Running a node with unsynchronized clocks, which costs gossip score because messages arrive outside their acceptance window.",
      "Opening TCP 9000 but not UDP 9000, leaving discv5 unable to find peers for the libp2p host.",
      "Expecting to fetch blob contents from an execution archive node after the 4096-epoch consensus retention window has passed.",
    ],
    related: ["peer-to-peer", "discovery", "devp2p", "beacon-node", "consensus-client", "attestation", "beacon-block", "blob", "ssz", "beacon-api"],
    sources: [
      { title: "Consensus specs: phase 0 p2p interface", url: "https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/p2p-interface.md" },
      { title: "ethereum.org: Networking layer", url: "https://ethereum.org/developers/docs/networking-layer/" },
    ],
  },
  {
    id: "portal-network",
    title: "Portal Network",
    category: "nodes",
    aliases: ["Trin", "Fluffy", "Shisui", "history network", "portal DHT"],
    summary: "The Portal Network is a separate peer-to-peer network whose nodes each store a small, self-chosen slice of Ethereum history in a distributed hash table, so data dropped by [[history-expiry|history expiry]] stays retrievable without an [[archive-node|archive node]].",
    sections: [
      {
        heading: "A slice each, not a copy each",
        paragraphs: [
          "A [[full-node|full node]] and an [[archive-node|archive node]] differ in how much of everything they keep; a portal node differs in kind. Each one picks a radius around its own node id and stores only content whose identifier falls inside it, then routes lookups for anything else to peers closer to the target. A phone or a router can hold a useful share, which is the point.",
          "Routing runs on the same discv5 substrate as consensus [[discovery|node discovery]], but as a separate overlay with its own sub-networks: history for headers, bodies and receipts, a beacon network for light client data, and a state network still in development. Retrieved content is verified against canonical headers before use, so a portal node does not have to trust the peer that served it.",
        ],
      },
      {
        heading: "Clients and what they answer",
        paragraphs: [
          "Implementations include Trin (Rust, Ethereum Foundation), Fluffy (Nim, from the [[nimbus|Nimbus]] team), Shisui (Go), Ultralight (TypeScript) and Samba (Java). Each exposes a local [[json-rpc|JSON-RPC]] endpoint answering a narrow, history-oriented slice of `eth_` methods, such as [[eth-get-block-by-number|eth_getBlockByNumber]] and block lookups by hash, plus `portal_` methods for inspecting and managing the DHT itself.",
          "What it does not offer matters as much. Without the state network there is no [[eth-call|eth_call]], no [[eth-get-balance|eth_getBalance]] and no [[eth-get-proof|eth_getProof]]; there is no [[mempool|transaction pool]], so nothing accepts a raw transaction. The supported method set is still moving, so probe the [[endpoint-capabilities|capabilities]] of the specific release rather than assuming parity with an execution client.",
        ],
      },
      {
        heading: "Where it fits for an application",
        paragraphs: [
          "Portal is the answer to a question [[eip|EIP-4444]] creates: if ordinary [[execution-client|execution clients]] stop serving pre-Merge bodies and receipts, an old [[eth-get-logs|eth_getLogs]] range or a decade-old block has to come from somewhere. The alternatives are era1 archive files, an [[indexer|indexer]] with its own copy, or a provider that kept the data, each with a different trust and availability story.",
          "Treat it as one retrieval source among several rather than a drop-in node. Pair it with a [[light-client|light client]] when the consensus view must also be verified, record provenance next to the data you pulled, and keep the [[block-hash|block hash]] with every derived record so a later reader can tell which chain the row came from.",
        ],
      },
    ],
    pitfalls: [
      "Expecting a portal node to answer state queries such as eth_call or eth_getBalance while the state sub-network is still unfinished.",
      "Treating it as a lighter full node rather than a read-only retrieval network with no transaction pool at all.",
      "Assuming a fixed set of supported methods instead of probing the specific client release you deployed.",
      "Storing data pulled from a portal client without recording its provenance and the block hash it belongs to.",
    ],
    related: ["history-expiry", "light-client", "archive-node", "historical-data", "discovery", "peer-to-peer", "full-node", "indexer", "endpoint-capabilities", "eth-get-logs"],
    sources: [
      { title: "Portal Network specifications", url: "https://github.com/ethereum/portal-network-specs" },
      { title: "Trin, a Portal Network client", url: "https://github.com/ethereum/trin" },
      { title: "EIP-4444: Bound historical data in execution clients", url: "https://eips.ethereum.org/EIPS/eip-4444" },
    ],
  },
];

export default { topics };
