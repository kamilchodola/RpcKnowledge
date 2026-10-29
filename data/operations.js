// Category: Operations — running and consuming RPC in production.

export const topics = [
  {
    id: "rpc-provider",
    title: "RPC provider",
    category: "operations",
    aliases: ["Alchemy", "Infura", "QuickNode", "dRPC", "Chainstack", "Ankr", "PublicNode", "node service", "hosted node", "managed RPC"],
    summary: "An RPC provider is a service that runs [[execution-client|execution]] and [[consensus-client|consensus]] clients on your behalf and sells access to their [[json-rpc|JSON-RPC]] endpoints, usually behind an API key with quotas, routing, and extra non-standard APIs.",
    sections: [
      {
        heading: "What you actually buy",
        paragraphs: [
          "A provider gives you a URL. Behind it sits a fleet: [[full-node|full nodes]] for recent state, [[archive-node|archive nodes]] for old blocks, tracing-capable clients for the [[trace-api|trace_]] and [[debug-api|debug_]] namespaces, and separate pools per chain. The provider absorbs the work you would otherwise do yourself: hardware, sync, client upgrades before every [[hardfork|network upgrade]], [[load-balancer|load balancing]], [[caching|caching]], and [[failover|failover]]. Alchemy, Infura, QuickNode, Chainstack, dRPC, Ankr, and the free PublicNode endpoints all sell some version of this; dRPC and Ankr route across independently operated nodes rather than a single fleet, which changes the trust story but not the interface.",
          "Most providers also sell things no [[execution-client|execution client]] implements: [[portfolio-tracker|token balance]] and [[nft-marketplace|NFT endpoints]], decoded transaction history for an [[address|address]], webhook streams, and mempool feeds. These are convenient and completely non-portable. Code written against them cannot be pointed at your own node or a different provider without a rewrite, so keep them behind an interface of your own if you may ever move.",
        ],
      },
      {
        heading: "What varies, and what you should check",
        paragraphs: [
          "Nothing about a provider endpoint is guaranteed by the [[execution-apis|execution-apis specification]] beyond the core `eth_` methods, and even those come with limits. Archive depth differs, and so does whether historical [[eth-get-proof|eth_getProof]] works at all. [[eth-get-logs|eth_getLogs]] block ranges are usually capped, often at a few thousand blocks or by response size. [[batch-request|Batch]] arrays have a maximum length. [[eth-filters|Polling filters]] and [[eth-subscribe|eth_subscribe]] may be unsupported, restricted to certain plans, or silently limited in how many subscriptions one connection may hold. [[eth-simulate|eth_simulateV1]] and [[state-override|state overrides]] are available on some endpoints and not others. Probe rather than assume; see [[endpoint-capabilities|endpoint capabilities]].",
          "Cost is rarely per request. Providers price in compute units, charging a cheap method like [[eth-block-number|eth_blockNumber]] a fraction of what a `debug_traceBlock` costs, so a naive retry loop on an expensive method can drain a monthly quota in an hour. Read the method cost table before designing a scan; see [[rate-limits|rate limits and compute units]].",
        ],
      },
      {
        heading: "What you give up",
        paragraphs: [
          "Correctness becomes a trust assumption. A provider's answer is a claim, not a proof: it can serve stale state, answer from a node on a minority fork, or simply be wrong, and the JSON response carries no evidence either way. Where the answer decides money, verify it, by reading at the `finalized` [[block-tag|block tag]], by cross-checking a second independent endpoint, or by checking an [[eth-get-proof|account proof]] against a [[trusted-header|trusted header]]; [[verified-rpc|verified RPC]] covers the patterns.",
          "[[rpc-privacy|Privacy]] is the quieter cost. The provider sees your IP address, your API key, every address you query, every contract you read, and every transaction you submit before the network does. Wallets that use one default endpoint leak their users' whole address graph to one company. Submission is also a control point: a provider can drop or delay an [[eth-send-raw-transaction|eth_sendRawTransaction]], and a provider outage takes your application with it unless you have a second path.",
        ],
      },
    ],
    example: {
      title: "Asking two endpoints what they actually run",
      language: "bash",
      code: "curl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"web3_clientVersion\",\"params\":[]}' \\\n  https://rpc.example/v2/$KEY\n# {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"Geth/v1.15.11-stable/linux-amd64/go1.24.2\"}\n\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"web3_clientVersion\",\"params\":[]}' \\\n  https://other.rpc.example/$KEY\n# {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"erigon/3.0.0/linux-amd64/go1.23.6\"}",
      note: "Different upstream software means different tracing APIs and different error strings; some providers return a masked or constant string here, which is itself information about how much they normalize.",
    },
    pitfalls: [
      "Shipping the API key in a browser bundle. Anything in frontend JavaScript is public; use a domain allow-list, or proxy through your own backend.",
      "Assuming every endpoint of one provider is equivalent. Trace-capable and archive endpoints are often a different product tier on a different URL.",
      "Treating a 429 or a `-32005` as 'no such data'. It is an operational answer about your quota, not a statement about the chain.",
      "[[rpc-benchmarking|Benchmarking a provider]] against your own node on latency alone; a provider's edge cache can answer faster and still be a block behind.",
    ],
    related: ["self-hosting", "endpoint-capabilities", "rate-limits", "load-balancer", "authentication", "caching", "verified-rpc", "private-rpc", "json-rpc", "rpc-workloads", "x402"],
    sources: [
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "ethereum.org: Developer tools", url: "https://ethereum.org/developers/tools/" },
      { title: "Ethereum execution APIs", url: "https://github.com/ethereum/execution-apis" },
    ],
  },
  {
    id: "self-hosting",
    title: "Self-hosted node vs provider",
    category: "operations",
    aliases: ["run your own node", "own node", "in-house RPC", "hybrid RPC"],
    summary: "Self-hosting means running your own [[execution-client|execution]] and [[consensus-client|consensus]] client pair and calling its RPC directly, trading operational work for trust, privacy, and unrestricted method access.",
    sections: [
      {
        heading: "What it costs",
        paragraphs: [
          "A node is two processes, not one. The execution client serves `eth_` methods and the [[engine-api|Engine API]] on port 8551; the [[beacon-node|beacon node]] drives it and serves the [[beacon-api|Beacon API]]. They share a 32-byte hex JWT secret file. Both need a fast NVMe drive and enough RAM; see [[node-hardware|node hardware]] for realistic numbers, and expect a [[full-node|full node]] with history to sit in the terabytes while an [[archive-node|archive node]] is several times that.",
          "The recurring work is upgrades. Every [[hardfork|network upgrade]] has a client version deadline: a node that is not upgraded stops following the canonical chain at the fork timestamp and serves confidently wrong answers until someone notices. Add disk growth, [[snap-sync|resync]] after a corrupted database, and the fact that one node is not high availability. Budget for two nodes or a provider fallback before you call it production.",
        ],
      },
      {
        heading: "What it buys",
        paragraphs: [
          "Trust and privacy are the real reasons. Your node validates every block itself, so its answers are derived from consensus rules rather than from a company's claim, and nobody outside sees which addresses you query or which transactions you sign. Validators must self-host: signing duties depend on a beacon node you control, and the Engine API pair cannot be outsourced.",
          "Capability is the practical reason. On your own node there are no compute units, no [[eth-get-logs|eth_getLogs]] range cap or batch length limit beyond your client's defaults, which you can change (Erigon caps ranges at 1,000 blocks and Geth batches at 1,000 requests), and no plan tier gating [[debug-api|debug_]] tracing, [[trace-api|trace_]] replays, [[txpool-api|txpool_]] inspection, or long-lived [[eth-subscribe|subscriptions]]. Heavy [[indexer|indexing]] and simulation workloads are usually cheaper on owned hardware than on metered compute units.",
        ],
      },
      {
        heading: "Hybrid setups",
        paragraphs: [
          "Most production systems end up mixed. A common shape is an owned node as the primary upstream for latency-sensitive `latest` reads and transaction submission, with an [[rpc-provider|RPC provider]] behind it for burst capacity, deep archive queries, and as a [[failover|failover]] target during maintenance. An [[rpc-gateway|RPC gateway]] in front makes the split a routing rule instead of application code.",
          "Keep the fallback honest. A provider fallback that answers from a different [[chain-id|chain]], lags the head, or lacks the namespace you need is worse than an error, because the application will happily use the wrong answer; a [[health-check|health check]] on chain id, sync status, and head distance should gate every upstream, owned or not.",
        ],
      },
    ],
    example: {
      title: "A minimal pair: RPC on loopback, Engine API authenticated",
      language: "bash",
      code: "openssl rand -hex 32 | tr -d '\\n' > /secrets/jwt.hex\n\ngeth --http --http.addr 127.0.0.1 --http.port 8545 \\\n     --http.api eth,net,web3 --http.vhosts localhost \\\n     --authrpc.addr 127.0.0.1 --authrpc.port 8551 \\\n     --authrpc.jwtsecret /secrets/jwt.hex\n\nlighthouse bn --network mainnet \\\n     --execution-endpoint http://127.0.0.1:8551 \\\n     --execution-jwt /secrets/jwt.hex \\\n     --checkpoint-sync-url https://checkpoint.example \\\n     --http",
      note: "The public RPC port and the Engine API port are different interfaces with different trust levels; only 8545 should ever sit behind a [[reverse-proxy|reverse proxy]], and never 8551.",
    },
    pitfalls: [
      "Binding the HTTP RPC to `0.0.0.0` on a machine with a public IP; that is an open node, see [[security|RPC security]].",
      "Missing a fork deadline. An outdated client does not error loudly; it follows a dead chain and keeps answering.",
      "Assuming your own node answers historical state; a default [[pruned-node|pruned node]] keeps only recent state and will fail old [[eth-call|eth_call]] queries.",
      "Calling one node with no fallback 'self-hosted RPC'; a single machine reboot is an application outage.",
    ],
    related: ["rpc-provider", "full-node", "node-hardware", "health-check", "rpc-gateway", "security", "archive-node", "engine-api", "rpc-privacy"],
    sources: [
      { title: "ethereum.org: Run a node", url: "https://ethereum.org/developers/docs/nodes-and-clients/run-a-node/" },
      { title: "Geth: command-line options", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
      { title: "Lighthouse book: Beacon node", url: "https://lighthouse-book.sigmaprime.io/" },
    ],
  },
  {
    id: "load-balancer",
    title: "RPC load balancing",
    category: "operations",
    aliases: ["round robin", "upstream pool", "sticky sessions", "method routing"],
    summary: "RPC load balancing spreads JSON-RPC calls across several upstream nodes, which works for stateless reads but breaks for methods whose answer depends on one node's head or on per-connection server state.",
    sections: [
      {
        heading: "Why nodes are not interchangeable web servers",
        paragraphs: [
          "An HTTP application server is usually stateless, so any replica can answer any request. A node is not. Each upstream has its own view of the head, its own [[mempool|transaction pool]], its own retention, and its own server-side objects created by earlier calls. Two nodes that are both perfectly healthy will still disagree for a second or two after every 12-second slot, and a caller spread across them sees that disagreement as missing data; [[head-lag|head consistency]] covers the failure in detail.",
          "Routing therefore has to be method-aware. A plain TCP or HTTP round-robin cannot see the method name, so it cannot know that this request needs an [[archive-node|archive node]], that one must go to the same node as the previous call, and the third can be answered from [[caching|cache]].",
        ],
      },
      {
        heading: "The methods that break",
        paragraphs: [
          "[[eth-filters|Polling filters]] are server-side state. `eth_newFilter` returns an id that exists only in the memory of the node that created it, so a later `eth_getFilterChanges` sent to a sibling node fails with 'filter not found'. The same applies to `eth_newBlockFilter` and `eth_newPendingTransactionFilter`. Either pin the whole filter lifecycle to one upstream with a sticky session keyed on the filter id, or drop filters and use bounded [[eth-get-logs|eth_getLogs]] ranges, which are stateless and safe to spread.",
          "[[eth-subscribe|eth_subscribe]] is scoped to one [[websocket-transport|WebSocket]] connection, so it survives balancing only because the connection itself is pinned; when that connection drops and reconnects to a different node, the new node starts from its own head and the gap in between is lost. Nonce reads are the third trap: `eth_getTransactionCount` with the `pending` tag reflects one node's pool, so asking node A and then submitting through node B can produce a nonce gap or a duplicate. Keep nonce authority on one upstream, or use the `latest` tag plus your own in-flight accounting.",
        ],
      },
      {
        heading: "Policies that work",
        paragraphs: [
          "Classify methods into pools. Tracing and historical state go to archive-capable upstreams; `latest` reads and [[eth-send-raw-transaction|submissions]] go to the low-latency pool; log scans go to whichever upstream is allowed to be slow. Weight each upstream by measured health rather than a static list: poll [[eth-block-number|eth_blockNumber]] and [[eth-syncing|eth_syncing]] on a short interval and remove any node whose head is more than one or two blocks behind the best-known head, which is exactly what a [[health-check|health check]] should produce.",
          "Stickiness is the cheapest correctness fix. Hash on the API key, the session, or the caller IP so that one caller's consecutive requests land on the same upstream; they then see a monotonic head instead of a head that jumps backwards. Where correctness matters more than freshness, sidestep the whole problem by pinning requests to an explicit block number or hash rather than the `latest` [[block-tag|tag]].",
        ],
      },
    ],
    example: {
      title: "A filter split across two upstreams",
      language: "json",
      code: "// request 1 is routed to node A, which creates the filter in its own memory\n--> {\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_newFilter\",\"params\":[{\"address\":\"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\"topics\":[\"0xddf252ad…3ef\"]}]}\n<-- {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x1d5dbc2f0a1b3c4d5e6f708192a3b4c5\"}\n\n// request 2 is round-robined to node B, which has never heard of that id\n--> {\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_getFilterChanges\",\"params\":[\"0x1d5dbc2f0a1b3c4d5e6f708192a3b4c5\"]}\n<-- {\"jsonrpc\":\"2.0\",\"id\":2,\"error\":{\"code\":-32000,\"message\":\"filter not found\"}}",
      note: "The error is not a bug in either node; it is the balancer treating a stateful method as if it were stateless.",
    },
    pitfalls: [
      "Putting a generic HTTP balancer in front of nodes and calling it done; it cannot see methods, heads, or filter ids.",
      "Balancing WebSocket connections without stickiness, then wondering why subscriptions silently miss blocks after a reconnect.",
      "Mixing upstreams with different [[chain-id|chain ids]] or different retention in one pool, so results depend on which node answered.",
      "Health-checking with a TCP connect or an HTTP 200 only; a syncing node accepts connections and answers `eth_blockNumber` with a stale height.",
    ],
    related: ["head-lag", "rpc-gateway", "failover", "health-check", "eth-filters", "eth-subscribe", "caching", "rpc-provider", "endpoint-capabilities"],
    sources: [
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "Geth: real-time events and filters", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc/pubsub" },
      { title: "Ethereum execution APIs", url: "https://github.com/ethereum/execution-apis" },
    ],
  },
  {
    id: "rpc-gateway",
    title: "RPC gateway",
    category: "operations",
    aliases: ["eRPC", "dshackle", "Proxyd", "Blutgang", "Rivet", "RPC proxy", "multiplexer"],
    summary: "An RPC gateway is a proxy that parses the JSON-RPC envelope and routes, caches, limits, retries, and allow-lists calls across several upstream nodes and providers, so applications see one endpoint instead of a fleet.",
    sections: [
      {
        heading: "What it does that a plain proxy cannot",
        paragraphs: [
          "Because a gateway decodes the [[request-response|JSON-RPC envelope]], it can act on `method` and `params`. That unlocks per-method routing to different upstream pools, per-method rate limits and quotas, an allow-list that rejects [[admin-api|admin_]] or [[debug-api|debug_]] calls before they reach a node, response [[caching|caching]] keyed on the method and its block argument, splitting an oversized [[batch-request|batch]] into several upstream batches, and retrying a failed call on a different upstream while the caller waits on one connection.",
          "It also gives you one place to enforce head consistency. A gateway that tracks each upstream's [[eth-block-number|block number]] can refuse to route a request to a node more than N blocks behind, or hold a request until the chosen upstream reaches a height the caller has already seen, which removes most of the [[head-lag|head lag]] a bare [[load-balancer|load balancer]] would expose.",
        ],
      },
      {
        heading: "The tools",
        paragraphs: [
          "eRPC is a Go proxy aimed at multiplexing many providers behind one URL, with per-upstream failover, method-aware routing, and caching. dshackle, written on the JVM, focuses on quorum: sending the same call to several independent upstreams and comparing answers before returning one. Proxyd is the proxy used in the OP Stack, and tracks a consensus view of `latest`, `safe`, and `finalized` across its backends so it never routes a caller to a lagging node. Blutgang is a Rust proxy built around caching and head-sorted upstreams. Rivet is another gateway in the same space. All of them sit in front of self-hosted nodes, [[rpc-provider|providers]], or a mix.",
          "The generic alternative is a reverse proxy with Lua or a small service of your own. That is reasonable for allow-listing and TLS, but every consistency and caching rule you add reimplements one of these tools badly; see [[reverse-proxy|reverse proxy and TLS]] for the part that genuinely belongs at that layer.",
        ],
      },
      {
        heading: "Operating one",
        paragraphs: [
          "A gateway is now the single point of failure that the upstreams were not, so it needs its own metrics and alerts: request rate and latency per method, per-upstream error and eviction counts, cache hit ratio, and the head distance of each upstream. That is the core of [[observability|RPC observability]] for a fleet.",
          "Two correctness rules matter more than any tuning. Never cache anything resolved from the `latest` or `pending` [[block-tag|tags]] as if it were immutable, and never reorder or merge responses in a way that breaks the caller's `id` matching. A gateway that answers request `id: 7` with the result of `id: 8` corrupts every library on top of it, and the bug is almost invisible until a batch is partially rate-limited.",
        ],
      },
    ],
    example: {
      title: "How a gateway decides where one call goes",
      language: "text",
      code: "POST /  {\"jsonrpc\":\"2.0\",\"id\":9,\"method\":\"trace_block\",\"params\":[\"0x12d4f1c\"]}\n\n1. parse envelope            method = trace_block\n2. allow-list for this key   trace_* permitted            -> ok\n3. route by method class     \"trace\" -> pool [archive-1, archive-2]\n4. cache lookup              key = trace_block|0x12d4f1c\n                             0x12d4f1c <= finalized -> immutable  -> miss\n5. pick upstream             archive-1 (head lag 0, p95 210 ms)\n6. upstream answers 429      cool down archive-1 for 5 s, retry archive-2\n7. archive-2 answers 200     store in cache, return with id = 9",
      note: "Steps 3 and 4 are only possible because the proxy read the method and the block argument; steps 6 and 7 are [[failover|failover]] inside one client-visible request.",
    },
    pitfalls: [
      "Caching by the raw request body, so `eth_call` at `latest` gets a cache entry that outlives the block it was computed on.",
      "Failing over on a deterministic error such as `execution reverted`; every upstream will return the same thing and you have tripled the cost.",
      "Forgetting that the gateway terminates the caller's WebSocket, so [[eth-subscribe|subscriptions]] must be re-established upstream and gaps re-filled after an upstream switch.",
      "Running the gateway without an allow-list on the assumption that upstream providers already block dangerous [[namespaces|namespaces]]; self-hosted upstreams usually do not.",
    ],
    related: ["load-balancer", "caching", "failover", "head-lag", "rate-limits", "observability", "reverse-proxy", "rpc-provider", "retries", "circuit-breaker"],
    sources: [
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "OP Stack documentation", url: "https://docs.optimism.io/" },
      { title: "JSON-RPC 2.0 specification", url: "https://www.jsonrpc.org/specification" },
    ],
  },
  {
    id: "head-lag",
    title: "Head consistency across nodes",
    category: "operations",
    aliases: ["head lag", "stale head", "read your writes", "block height skew"],
    summary: "Head lag is the normal, temporary disagreement between nodes about which block is `latest`, which makes data written through one endpoint appear missing when read through another.",
    sections: [
      {
        heading: "Why heads differ",
        paragraphs: [
          "A block is produced once per 12-second [[slot-epoch|slot]] and then has to travel. The [[consensus-client|consensus client]] receives the beacon block over gossip, hands the [[execution-payload|execution payload]] to the [[execution-client|execution client]] via `engine_newPayload`, which executes it, and only then does that node's `latest` advance. Propagation, execution time, and disk pressure differ per machine, so a well-run fleet still spreads over hundreds of milliseconds, and a loaded or partially synced node over several seconds or blocks.",
          "None of this is a [[reorg|reorg]]. The nodes agree about the chain; they are at different points along it. A node can also be legitimately ahead: it may have imported a block that later loses [[fork-choice|fork choice]], so a caller can see a head appear and then disappear without any node misbehaving.",
        ],
      },
      {
        heading: "What it breaks",
        paragraphs: [
          "The classic symptom is submit-then-poll. You send a transaction through one endpoint, it is included, and [[eth-get-transaction-receipt|eth_getTransactionReceipt]] on another endpoint returns `null` because that node has not imported the block yet. Callers frequently misread that `null` as failure and resubmit with the same nonce.",
          "The subtler symptom is mixed sources. If you read a receipt from node A at height H and then read a balance or a contract value at `latest` from node B at height H-1, the two answers describe different worlds: the transfer is confirmed but the balance has not moved. Log scans do the same thing at the boundary, where `toBlock: \"latest\"` on a lagging node quietly returns fewer [[event-log|logs]] than exist, and an [[indexer|indexer]] that advances its cursor on that answer skips blocks permanently. Nonces are the third case: `eth_getTransactionCount` at the `pending` [[block-tag|tag]] reflects one node's [[mempool|pool]], so switching endpoints mid-flight produces gaps or duplicates.",
        ],
      },
      {
        heading: "How to make it go away",
        paragraphs: [
          "Pin the block. Resolve `latest` once, then pass that explicit number, or an EIP-1898 `{\"blockHash\": …, \"requireCanonical\": true}` object, to every call that must agree. A node that does not have that block fails loudly, on [[geth|Geth]] with 'header not found' for a number and 'header for hash not found' for a hash, instead of silently answering from an older one, which is the behavior you want.",
          "Pin the node. Route a caller's related requests to one upstream with a sticky session, and keep a high-water mark: record the greatest block number you have seen and discard or retry any response computed below it, so your view of the head never moves backwards. An [[rpc-gateway|RPC gateway]] can do both centrally, evicting upstreams that fall more than one or two blocks behind the best-known head, and a [[health-check|health check]] should measure that distance against a reference rather than trusting [[eth-syncing|eth_syncing]], which reports `false` on a node that finished syncing and then stalled.",
        ],
      },
    ],
    example: {
      title: "The same receipt, one block apart",
      language: "bash",
      code: "cast rpc --rpc-url https://a.rpc.example eth_blockNumber\n# \"0x12d4f1d\"\ncast rpc --rpc-url https://b.rpc.example eth_blockNumber\n# \"0x12d4f1c\"     <- one block behind\n\ncast rpc --rpc-url https://a.rpc.example \\\n  eth_getTransactionReceipt 0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060\n# {\"blockNumber\":\"0x12d4f1d\",\"status\":\"0x1\", …}\n\ncast rpc --rpc-url https://b.rpc.example \\\n  eth_getTransactionReceipt 0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060\n# null            <- not failure, just not there yet",
      note: "Both answers are correct for the node that gave them; only the caller that mixes them is wrong.",
    },
    pitfalls: [
      "Treating a `null` receipt from a second endpoint as a dropped transaction and rebroadcasting with a new nonce.",
      "Advancing an indexer cursor to `toBlock: \"latest\"` as reported by whichever node answered; store the block number you actually scanned.",
      "Assuming a provider URL is one node; it is a pool, and consecutive requests can go backwards in height.",
      "Alerting only on absolute block age, which fires during missed slots; compare each node against the best head you know instead.",
    ],
    related: ["load-balancer", "health-check", "rpc-gateway", "block-tag", "reorg", "failover", "eth-syncing", "indexer", "confirmations", "fastest-head"],
    sources: [
      { title: "EIP-1898: Add blockHash to defaultBlock methods", url: "https://eips.ethereum.org/EIPS/eip-1898" },
      { title: "ethereum.org: JSON-RPC default block parameter", url: "https://ethereum.org/developers/docs/apis/json-rpc/#default-block" },
      { title: "Ethereum execution APIs", url: "https://github.com/ethereum/execution-apis" },
    ],
  },
  {
    id: "failover",
    title: "Failover",
    category: "operations",
    aliases: ["fallback endpoint", "upstream switching", "split brain"],
    summary: "Failover is moving RPC traffic to a different upstream when the current one fails, which requires distinguishing operational failures worth retrying elsewhere from deterministic answers that every upstream will repeat.",
    sections: [
      {
        heading: "Classify the failure first",
        paragraphs: [
          "Most failover bugs are misclassification. Transport failures, timeouts, and HTTP 502, 503, or 504 mean this upstream is unwell and another may be fine. HTTP 429 and the [[rpc-errors|JSON-RPC]] code `-32005` mean you exceeded a quota on this upstream, so move traffic and back off here specifically. Server-side `-32000` messages such as 'header not found' or 'missing trie node' mean the node lacks data another node may have.",
          "Deterministic errors must not trigger failover. `-32602` invalid params is your bug. A revert returned as code `3` with revert `data`, or as `-32000` with 'execution reverted', is a correct answer about the chain: retrying it on three upstreams costs three times the quota and yields the same result. `-32601` method not found is in between; it means this upstream lacks the [[namespaces|namespace]], so a correctly configured pool can serve it while the failing one never will.",
        ],
      },
      {
        heading: "Vetting the replacement",
        paragraphs: [
          "Promoting an upstream you have not checked converts an outage into silent corruption. Before a node takes traffic, confirm [[chain-id|eth_chainId]] matches the chain you meant, that [[eth-syncing|eth_syncing]] is `false`, and that its head is within a block or two of the best head you know of; otherwise you fail over from an endpoint that errors to one that answers stale data, which is strictly worse. Also check [[endpoint-capabilities|capabilities]]: an upstream without [[trace-api|trace_]] or without archive depth will start returning errors for exactly the requests that mattered.",
          "Failing back needs the same care. Use a cooldown and a [[circuit-breaker|half-open probe]] rather than returning to the primary the instant one health check passes, and expect the head to appear to move backwards on the switch, so keep the high-water mark described in [[head-lag|head consistency]].",
        ],
      },
      {
        heading: "Transactions and streams",
        paragraphs: [
          "Submission is the dangerous path. [[eth-send-raw-transaction|eth_sendRawTransaction]] is idempotent in the sense that resending the identical signed bytes cannot produce a second transaction; the worst case is a 'already known' or 'nonce too low' error. Broadcasting the same signed payload to several upstreams at once is therefore safe and is a good way to survive one provider dropping it. What is not safe is asking two upstreams for the next [[nonce|nonce]]: their `pending` views differ, and you will sign two different transactions with the same nonce or leave a gap that stalls the queue. Keep one nonce authority, ideally your own counter reconciled against `latest`.",
          "[[websocket-transport|WebSocket]] streams cannot fail over transparently. When the connection moves, every [[eth-subscribe|subscription]] is gone and the new node starts from its own head. Re-subscribe, then backfill the gap with a bounded [[eth-get-logs|eth_getLogs]] range from the last block you fully processed; the same applies to server-side [[eth-filters|filters]], whose ids do not exist on the new upstream.",
        ],
      },
    ],
    example: {
      title: "A failover decision table",
      language: "text",
      code: "timeout, connection reset, HTTP 502/503/504   -> other upstream, mark this one unhealthy\nHTTP 429  or  JSON-RPC -32005                 -> other upstream, back off this one\n-32603 internal error                         -> retry once here, then other upstream\n-32000 \"header not found\"                      -> other upstream (this one is behind)\n-32000 \"missing trie node\"                     -> archive-capable upstream only\n-32601 method not found                       -> upstream that exposes the namespace\n-32602 invalid params                         -> caller bug, do not fail over\ncode 3 / \"execution reverted\"                  -> real answer, do not fail over\n\"already known\" on a resend                    -> success, the tx is in a pool",
      note: "Everything above the invalid-params line is about the upstream; everything below is about your request or the chain, and switching endpoints only multiplies the cost.",
    },
    pitfalls: [
      "Failing over on a revert, turning one correct error into three billed requests and a confusing log.",
      "Promoting a fallback without checking chain id, so a testnet or a fork endpoint starts answering production queries.",
      "Reading the nonce from whichever upstream answers, producing duplicate-nonce or gapped transactions under load.",
      "Counting a reconnected WebSocket as recovered without backfilling the blocks missed while it was down.",
    ],
    related: ["retries", "health-check", "load-balancer", "rpc-gateway", "head-lag", "rpc-errors", "chain-id", "endpoint-capabilities", "observability", "circuit-breaker"],
    sources: [
      { title: "EIP-1474: Remote procedure call specification", url: "https://eips.ethereum.org/EIPS/eip-1474" },
      { title: "JSON-RPC 2.0 specification", url: "https://www.jsonrpc.org/specification" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "retries",
    title: "Retries and idempotency",
    category: "operations",
    aliases: ["retry", "backoff", "jitter", "exponential backoff", "idempotent", "already known", "lost response"],
    summary: "A retry policy decides which failed RPC calls to send again: reads are pure and always safe to repeat, while [[eth-send-raw-transaction|eth_sendRawTransaction]] is safe only because the transaction hash is fixed by the signature.",
    sections: [
      {
        heading: "Reads are safe, in a specific sense",
        paragraphs: [
          "A read is a pure function of the method, its parameters, and the block it is answered at, so repeating [[eth-get-balance|eth_getBalance]] or [[eth-get-logs|eth_getLogs]] costs only time and quota. The subtlety is the block: a call that resolves the `latest` [[block-tag|tag]] is answered at a different block on the second attempt, so a retried read is deterministic only if you pinned an explicit number or [[block-hash|block hash]] first. Resolve the head once when several calls must agree.",
          "Retry operational failures only. Timeouts, connection resets, HTTP 502, 503, 504, and `-32603` internal errors mean the request never got a considered answer. HTTP 429 and [[rpc-errors|JSON-RPC]] `-32005` mean you were throttled, so wait and preferably move elsewhere. A revert returned as code `3` with revert `data`, `-32602` invalid params, and `-32601` method not found are considered answers; every sibling upstream repeats them, so the loop only multiplies the bill. [[failover|Failover]] draws the same line.",
        ],
      },
      {
        heading: "The one write, and its lost response",
        paragraphs: [
          "[[eth-send-raw-transaction|eth_sendRawTransaction]] is the only common method that changes anything, and it is idempotent by construction. The transaction hash is the [[keccak-256]] hash of the signed bytes, so sending those exact bytes twice cannot create two transactions: the second attempt returns the same hash or an `already known` error, and both mean success. Broadcasting one signed payload to several endpoints at once therefore survives a single provider dropping it.",
          "What is not idempotent is your reaction to a lost response. A node can accept and gossip the transaction and still leave you holding a timeout, so you cannot tell acceptance from loss. Compute the hash locally before sending, and on an ambiguous failure ask [[eth-get-transaction-by-hash|eth_getTransactionByHash]]: a non-`null` result means it sits in a [[mempool|pool]] or a block, `null` means you may resend the identical bytes. Never re-sign with a fresh [[nonce|nonce]], because that is a second, different transaction and both can land.",
        ],
      },
      {
        heading: "Backoff, jitter, and budgets",
        paragraphs: [
          "Use exponential backoff with full jitter: sleep a random interval between zero and a cap that doubles each attempt. Without jitter every caller that failed in the same second returns in the same second, and an upstream that was briefly slow becomes reliably down. Honor `Retry-After` when a 429 carries it, and bound the whole thing with a caller deadline, three or four attempts, and a retry budget.",
          "Retries interact with cost. Providers bill per compute unit, so a loop on a `debug_` trace is expensive in a way a loop on [[eth-block-number|eth_blockNumber]] is not; see [[rate-limits|rate limits]]. A retried [[batch-request|batch]] must be reassembled by `id` rather than by position, since a partially throttled batch comes back shorter than it went out. Most [[client-libraries|client libraries]] already retry with defaults you did not choose, so read them before adding your own.",
        ],
      },
    ],
    example: {
      title: "A submission whose response was lost",
      language: "bash",
      code: "# the hash is fixed by the signature, so derive it before you send anything\ncast keccak $RAW\n# 0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060\n\ncurl -s -m 10 -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_sendRawTransaction\",\"params\":[\"0x02f8b201…\"]}' \\\n  https://rpc.example\n# curl: (28) Operation timed out after 10001 milliseconds\n\n# do not re-sign. ask whether the network already has it:\ncast rpc --rpc-url https://rpc.example \\\n  eth_getTransactionByHash 0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060\n# {\"blockNumber\":null, …}  -> accepted and waiting in a pool: do nothing\n# null                     -> it never arrived: resend the identical bytes",
      note: "The identical bytes are always safe to resend; a freshly signed replacement is a different transaction and is not.",
    },
    pitfalls: [
      "Retrying a revert, turning one correct answer into three billed requests.",
      "Re-signing after a timeout instead of querying the hash you already computed locally.",
      "Retrying without jitter, so every failed caller returns in lockstep and finishes the outage off.",
      "Treating `already known` or `nonce too low` on a resend as failure; both mean it is already out there.",
    ],
    related: ["failover", "rpc-errors", "eth-send-raw-transaction", "rate-limits", "head-lag", "rpc-gateway", "nonce", "client-libraries", "eth-get-transaction-by-hash"],
    sources: [
      { title: "EIP-1474: Remote procedure call specification", url: "https://eips.ethereum.org/EIPS/eip-1474" },
      { title: "JSON-RPC 2.0 specification", url: "https://www.jsonrpc.org/specification" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "caching",
    title: "RPC response caching",
    category: "operations",
    aliases: ["cache", "TTL", "immutable response", "cache key", "negative caching"],
    summary: "RPC caching stores answers that can never change — anything keyed by a [[block-hash|block hash]], or computed at a block at or below `finalized` — and must never store answers resolved from the `latest` or `pending` [[block-tag|tags]].",
    sections: [
      {
        heading: "What is actually immutable",
        paragraphs: [
          "Cacheability is a property of the block an answer was computed at, not of the method. A block at or below the `finalized` [[block-tag|tag]] cannot be replaced without a consensus failure, so its header, transactions, receipts, [[event-log|logs]], and any state read at that height are fixed forever. Anything addressed by [[block-hash|block hash]], including an EIP-1898 `{\"blockHash\": …}` parameter, is fixed in a different way: the hash pins the content, though the block itself can still leave the canonical chain.",
          "Between `finalized` and the head the answer is provisional. A [[reorg|reorg]] rewrites it, so entries in that window need a short time to live and an invalidation hook that drops everything above the new common ancestor. Above that, `latest` and `pending` are not cacheable at all: `latest` moves every 12-second [[slot-epoch|slot]], and `pending` describes one node's [[mempool|pool]]. Configuration answers such as [[chain-id|eth_chainId]] and `web3_clientVersion` are constant for the life of an upstream.",
        ],
      },
      {
        heading: "Keys and shapes",
        paragraphs: [
          "Key on the method, the normalized parameters, and the resolved block, never on the raw request body. A body key looks unique but is fatally stable for `latest` calls, which is how a stale [[eth-call|eth_call]] result outlives the block it was computed at by hours. Normalize before hashing: lowercase addresses, canonical [[hex-encoding|QUANTITY]] encoding so `0x0` and `0x00` share an entry, omitted optional parameters filled with their defaults, and a `latest` tag resolved to a number by the caching layer itself.",
          "[[batch-request|Batches]] have to be split, looked up per item, and reassembled by `id`, so a cache that only sees whole bodies gets almost no hits on batched traffic. Cache errors deliberately: a revert at a fixed block is a deterministic answer and is cacheable, while 429 and `-32005` describe your quota rather than the chain and must not be. Negative caching is the sharpest edge of all, since a `null` from [[eth-get-transaction-receipt|eth_getTransactionReceipt]] usually means [[head-lag|head lag]], and caching it makes a temporary gap permanent.",
        ],
      },
      {
        heading: "Where the cache lives",
        paragraphs: [
          "An in-process cache is the cheapest hit and the least shared; a Redis tier in front of an [[rpc-gateway|RPC gateway]] gives one hit rate across every instance and is where per-method policy belongs. Content delivery networks fit badly, because JSON-RPC rides on HTTP POST with the request in the body and CDNs key on method and URL, so you need a gateway that hashes the body into a key or a read-only REST facade.",
          "Measure the hit ratio per method rather than overall. Deep [[archive-node|archive]] reads and [[eth-get-logs|eth_getLogs]] scans over settled ranges are where caching saves real money, and they are exactly what an overall ratio hides behind millions of cheap head queries.",
        ],
      },
    ],
    example: {
      title: "What may be cached, and for how long",
      language: "text",
      code: "cache forever (immutable)\n  eth_chainId, web3_clientVersion            configuration, not chain data\n  eth_getBlockByHash(0x9b83c12c…ee71)        the hash pins the content\n  eth_getBlockByNumber(0x12d4f1c)            block <= finalized\n  eth_getTransactionReceipt(0x5c504e…)       tx in a block <= finalized\n  eth_getLogs(fromBlock..toBlock)            range <= finalized\n  eth_call(…, 0x12d4f1c)                     same code, same state, same answer\n\ncache briefly, and invalidate on reorg\n  any explicit block number above finalized  a reorg can rewrite it\n  eth_blockNumber                            one second at most\n\nnever cache\n  eth_call / eth_getBalance at \"latest\"      the block moves under a stable key\n  eth_getTransactionCount at \"pending\"       one node's pool, not the chain\n  a null from eth_getTransactionReceipt      means \"not here yet\", not \"absent\"\n  HTTP 429 and JSON-RPC -32005               your quota, not an answer",
      note: "The dividing line is never the method; it is the block the answer was computed at.",
    },
    pitfalls: [
      "Keying on the raw request body, so an `eth_call` at `latest` gets a stable key for an answer that changes every block.",
      "Caching a `null` receipt and converting a few seconds of head lag into a permanent wrong answer.",
      "Caching between `finalized` and the head with no reorg invalidation, so a rewritten block keeps serving.",
      "Skipping parameter normalization, which halves the hit rate and hides that two keys hold one answer.",
    ],
    related: ["block-tag", "block-hash", "rpc-gateway", "head-lag", "reorg", "rate-limits", "eth-get-logs", "eth-call", "load-balancer", "batch-request"],
    sources: [
      { title: "EIP-1898: Add blockHash to defaultBlock methods", url: "https://eips.ethereum.org/EIPS/eip-1898" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "Ethereum execution APIs", url: "https://github.com/ethereum/execution-apis" },
    ],
  },
  {
    id: "rate-limits",
    title: "Rate limits and compute units",
    category: "operations",
    aliases: ["429", "-32005", "throttling", "compute units", "CU", "quota", "block range limit"],
    summary: "Rate limits are the quotas an endpoint enforces on you — requests per second, concurrency, monthly compute units, block range, batch length, response size — and they arrive as HTTP 429 or as [[rpc-errors|JSON-RPC]] errors, never as chain data.",
    sections: [
      {
        heading: "The dimensions you are limited on",
        paragraphs: [
          "Requests per second is the one everyone reads about and rarely the one that bites. Concurrency caps how many calls may be in flight at once. Monthly budgets are denominated in compute units rather than requests, and each method has a weight: [[eth-block-number|eth_blockNumber]] costs a fraction of an [[eth-call|eth_call]], which costs a fraction of a [[debug-api|debug_traceBlockByNumber]]. A scan that looks cheap in request count can be ruinous in units.",
          "Then come the shape limits. [[eth-get-logs|eth_getLogs]] is usually capped by block range, by result count, or by response size, and sometimes by all three, which is why the same range succeeds on quiet blocks and fails on busy ones. [[batch-request|Batch]] arrays have a maximum length. [[websocket-transport|WebSocket]] endpoints cap connections per key and [[eth-subscribe|subscriptions]] per connection. [[archive-node|Archive]] depth and the [[trace-api|trace_]] namespace are often plan-gated rather than rate-limited, which fails differently; see [[endpoint-capabilities|endpoint capabilities]].",
        ],
      },
      {
        heading: "How a limit is reported",
        paragraphs: [
          "Two layers report limits and they do not agree on a format. An edge proxy answers HTTP 429, often with a `Retry-After` header and a body that is not JSON-RPC at all, so a client that blindly parses every response as an envelope throws a parse error and reports the wrong cause. The node or the provider's own layer answers HTTP 200 with a JSON-RPC error instead: `-32005` is the [[eip|EIP-1474]] 'limit exceeded' code, and server errors in the `-32000` range carry messages such as `query returned more than 10000 results`.",
          "Batches make partial failure normal. A batch can come back with results for some `id` values and `-32005` for others, so every item needs its own outcome; treating the array as all-or-nothing loses data silently. None of these are statements about the chain. A 429 does not mean the block is missing, and an [[indexer|indexer]] that advances its cursor past a throttled range leaves a permanent hole.",
        ],
      },
      {
        heading: "Staying under the ceiling",
        paragraphs: [
          "Throttle yourself first. A client-side [[circuit-breaker|token bucket]] set a little under the published rate, plus a bounded concurrency pool, turns a hard external failure into a soft internal queue. On a range error, halve the [[eth-get-logs|eth_getLogs]] window, retry from the same [[cursor-pagination|cursor]], and grow the window back slowly. Prefer one [[eth-get-block-receipts|eth_getBlockReceipts]] over dozens of single-hash receipt lookups, and [[caching|cache]] everything settled. Combine that with jittered [[retries|backoff]] and with [[failover|failover]] to a second upstream, so a throttled key sheds load instead of hammering.",
        ],
      },
    ],
    example: {
      title: "Three ways one endpoint says no",
      language: "json",
      code: "// HTTP/1.1 429 Too Many Requests\n// retry-after: 2\n{\"jsonrpc\":\"2.0\",\"id\":11,\"error\":{\"code\":-32005,\"message\":\"exceeded compute units per second capacity\"}}\n\n// HTTP/1.1 200 OK — a limit reported inside a perfectly normal response\n{\"jsonrpc\":\"2.0\",\"id\":12,\"error\":{\"code\":-32000,\"message\":\"query returned more than 10000 results\"}}\n\n// a batch where only the second item was throttled\n[{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x12d4f1c\"},\n {\"jsonrpc\":\"2.0\",\"id\":2,\"error\":{\"code\":-32005,\"message\":\"limit exceeded\"}}]",
      note: "The HTTP status and the JSON-RPC code are independent: a 200 can carry a limit error, and a 429 can carry no [[request-response|JSON-RPC envelope]] at all.",
    },
    pitfalls: [
      "Treating a 429 as 'no data' and advancing a scan cursor past the range you never actually read.",
      "Parsing every response as a JSON-RPC envelope; an edge 429 is often HTML or plain text.",
      "Retrying the identical oversized `eth_getLogs` range instead of halving it.",
      "Budgeting in requests when the provider bills in compute units, so one tracing job drains a month.",
      "Assuming a batch either fully succeeds or fully fails, and dropping the successful items with it.",
    ],
    related: ["rpc-provider", "retries", "cursor-pagination", "eth-get-logs", "rpc-errors", "batch-request", "caching", "failover", "endpoint-capabilities", "rpc-gateway"],
    sources: [
      { title: "EIP-1474: Remote procedure call specification", url: "https://eips.ethereum.org/EIPS/eip-1474" },
      { title: "JSON-RPC 2.0 specification", url: "https://www.jsonrpc.org/specification" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "authentication",
    title: "RPC authentication",
    category: "operations",
    aliases: ["API key", "JWT", "HS256", "jwtsecret", "bearer token", "iat", "mTLS"],
    summary: "RPC authentication is how an endpoint decides who may call it at all: an API key for a hosted endpoint, a shared-secret JWT for the [[engine-api|Engine API]], and network-level restrictions for everything else.",
    sections: [
      {
        heading: "The public interface has none",
        paragraphs: [
          "The execution [[json-rpc|JSON-RPC]] interface defines no authentication. A client's `--http` listener answers anyone who can reach the port, so the real boundary is the network: bind to `127.0.0.1`, put a [[reverse-proxy|reverse proxy]] in front for TLS and credentials, and let a firewall decide who may connect. Everything else layered on top is an operator's addition, not part of the [[execution-apis|specification]].",
          "Hosted endpoints add a key, either in the path as `https://rpc.example/v2/<key>` or in a header. A path key ends up in proxy logs, browser history, and referrer headers, so prefer a header where the client supports one. A browser application cannot hold a secret at all: use a domain allow-list keyed on `Origin`, or proxy through your own backend, and pair either with per-key [[rate-limits|rate limits]] so a leaked key is a bounded loss rather than an open tab.",
        ],
      },
      {
        heading: "The Engine API is the exception",
        paragraphs: [
          "Port 8551 is authenticated, and it is the one interface in this map where authentication is specified rather than improvised. The [[execution-client|execution client]] and the [[consensus-client|consensus client]] share a 32-byte hex secret in a file, and every request carries `Authorization: Bearer <token>` holding a JWT signed HS256 with that secret. The `iat` claim must be within 60 seconds of the receiving node's clock, so the protocol is also a loose proof of liveness.",
          "That design has a practical consequence when the execution and consensus clients run on separate machines: clock drift between them presents as an authentication failure. On one machine both read the same clock, so drift cannot arise between them. A node whose time has slipped past the 60-second window stops accepting [[engine-payload|engine_forkchoiceUpdated]] and `engine_newPayload`, the pair falls apart, and the logs say 'invalid token' rather than anything about time. Run NTP, point both processes at the same secret file, and keep that file readable only by them. The JWT does not authorize a user; it proves the two processes are the intended pair, which is why 8551 still belongs on loopback.",
        ],
      },
      {
        heading: "Beyond a single key",
        paragraphs: [
          "Issue one key per application so you can revoke one without an outage, and treat keys as identifiers rather than authorization: a key that is valid for reads is usually valid for anything the endpoint exposes. Real authorization lives one layer up, in a [[rpc-gateway|gateway]] that maps a key to an allow-list of methods, a block-range ceiling, and a quota. For machine-to-machine links inside your own network, mutual TLS and IP allow-lists are stronger than a bearer string, because neither travels in a URL.",
        ],
      },
    ],
    example: {
      title: "The Engine API JWT, decoded",
      language: "json",
      code: "// header and payload, signed HS256 with the raw 32 bytes in /secrets/jwt.hex\n{\"alg\":\"HS256\",\"typ\":\"JWT\"}\n{\"iat\":1757430000}\n\n// POST http://127.0.0.1:8551\n// authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTc0MzAwMDB9.…\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"engine_forkchoiceUpdatedV3\",\"params\":[\n  {\"headBlockHash\":\"0x9b83c12c…ee71\",\"safeBlockHash\":\"0x7d5a4369…f0d3\",\"finalizedBlockHash\":\"0x41c9a80e…12b4\"},\n  null\n]}\n\n// with a clock more than 60 seconds off the receiver's:\n// HTTP/1.1 401 Unauthorized",
      note: "The payload carries almost nothing; `iat` is the whole freshness check, which is why a drifting clock looks exactly like a wrong secret.",
    },
    pitfalls: [
      "Shipping an API key in a browser bundle; anything in frontend JavaScript is public, so proxy or allow-list instead.",
      "Exposing port 8551 beyond loopback because 'it has a JWT'; the token authenticates a pair of processes, not the internet.",
      "Pointing the two clients at different secret files after a redeploy, which reads as a generic authentication error.",
      "Ignoring clock synchronization, so a node drifts past the 60-second `iat` window and silently stops following the chain.",
      "Sharing one key across environments, so revoking a leaked key takes production down with it.",
    ],
    related: ["engine-api", "security", "reverse-proxy", "rpc-provider", "rate-limits", "namespaces", "self-hosting", "engine-payload", "rpc-gateway", "x402"],
    sources: [
      { title: "Ethereum execution APIs (Engine API and authentication)", url: "https://github.com/ethereum/execution-apis" },
      { title: "Geth: command-line options", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
      { title: "Lighthouse book", url: "https://lighthouse-book.sigmaprime.io/" },
    ],
  },
  {
    id: "reverse-proxy",
    title: "Reverse proxy and TLS",
    category: "operations",
    aliases: ["nginx", "Caddy", "HAProxy", "Traefik", "TLS termination", "proxy_pass", "WebSocket upgrade"],
    summary: "A reverse proxy such as nginx, Caddy, HAProxy, or Traefik sits between the internet and a node's RPC port, terminating TLS, capping bodies and request rates, and forwarding [[websocket-transport|WebSocket]] upgrades, so the client never listens on a public address itself.",
    sections: [
      {
        heading: "What belongs at this layer",
        paragraphs: [
          "An [[execution-client|execution client]] speaks plain HTTP; `--http` has no TLS option, so a certificate has to come from somewhere else. That is the proxy's first job, with Caddy obtaining and renewing certificates automatically and nginx doing it through certbot. The second is limits that do not need to understand JSON-RPC: a request body cap so one oversized [[batch-request|batch]] cannot pressure the node's memory, per-IP connection and request rates, read and send timeouts, and access logs with the real client address.",
          "What does not belong here is anything that requires parsing the envelope. Routing by method, [[caching|caching]] keyed on a block, and method allow-lists all need the request decoded, and a proxy that matches on request bodies with regular expressions gets it wrong on whitespace, on batches, and on parameter order. That work belongs in an [[rpc-gateway|RPC gateway]]; use the proxy for transport and put the gateway behind it.",
        ],
      },
      {
        heading: "The upgrade dance and the timeouts",
        paragraphs: [
          "[[websocket-transport|WebSocket]] traffic needs its own location block. Without `proxy_http_version 1.1` and the `Upgrade` and `Connection` headers forwarded, the handshake fails outright. With them but without a raised `proxy_read_timeout`, it succeeds and then dies: nginx defaults to 60 seconds of read idleness, and a [[eth-subscribe|eth_subscribe]] stream on a quiet topic is idle by definition, so callers see a connection that drops every minute and blame the node.",
          "HTTP has the mirror-image problem. A deep [[debug-api|debug_]] trace or a wide [[eth-get-logs|eth_getLogs]] scan can outlast a default proxy timeout, and the caller gets a 504 while the node [[request-cancellation|keeps working on a query nobody will read]]. Set the proxy timeout above the slowest query you intend to allow, and bound the queries themselves rather than letting the proxy be the limit.",
        ],
      },
      {
        heading: "Keep the private interfaces private",
        paragraphs: [
          "Only the public JSON-RPC port belongs behind the proxy. The [[engine-api|Engine API]] on 8551 and the [[ipc-transport|IPC socket]] must not be proxied at all, and the node should stay bound to `127.0.0.1` so the proxy is the only path rather than a suggestion. Forward `X-Forwarded-For` or the PROXY protocol, because without it every rate limit and every log line sees one address, the proxy's own.",
          "Terminating TLS changes the `Host` header the node sees, which is exactly what [[geth|Geth]]'s `--http.vhosts` checks; set it to the public hostname or requests fail with `invalid host specified`. That check is a security control and is not the same thing as `--http.corsdomain`, which only governs browsers; [[security|RPC security]] covers the difference.",
        ],
      },
    ],
    example: {
      title: "An nginx front end for HTTP and WebSocket",
      language: "text",
      code: "# limit_req_zone $binary_remote_addr zone=rpc:10m rate=20r/s;  (in http{})\n\nserver {\n  listen 443 ssl;\n  server_name rpc.example;\n  ssl_certificate     /etc/letsencrypt/live/rpc.example/fullchain.pem;\n  ssl_certificate_key /etc/letsencrypt/live/rpc.example/privkey.pem;\n\n  client_max_body_size 1m;              # an oversized batch never reaches the node\n  limit_req zone=rpc burst=40 nodelay;\n\n  location / {                          # JSON-RPC over HTTP POST\n    proxy_pass http://127.0.0.1:8545;\n    proxy_set_header Host $host;\n    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n    proxy_read_timeout 30s;\n  }\n\n  location /ws {                        # without these four lines, subscriptions die\n    proxy_pass http://127.0.0.1:8546;\n    proxy_http_version 1.1;\n    proxy_set_header Upgrade $http_upgrade;\n    proxy_set_header Connection \"upgrade\";\n    proxy_read_timeout 3600s;\n  }\n}\n# port 8551 is deliberately absent: the Engine API stays on loopback.",
      note: "Run the node with `--http.addr 127.0.0.1 --http.vhosts rpc.example` so this block is the only route in, and the `Host` header it forwards is accepted.",
    },
    pitfalls: [
      "Proxying WebSocket without `proxy_http_version 1.1` and the `Upgrade` headers, so the handshake fails with a 400.",
      "Leaving `proxy_read_timeout` at 60 seconds, which kills idle subscriptions and long trace calls on a schedule.",
      "Adding a proxy while the node still listens on `0.0.0.0`, which makes the proxy optional for an attacker.",
      "Forgetting `--http.vhosts` after TLS termination and reading `invalid host specified` as a proxy misconfiguration.",
      "Not forwarding the client address, so per-IP rate limits throttle everyone as one caller.",
    ],
    related: ["security", "websocket-transport", "rpc-gateway", "authentication", "http-transport", "eth-subscribe", "batch-request", "engine-api", "self-hosting", "geth"],
    sources: [
      { title: "Geth: command-line options", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
      { title: "Geth: real-time events and filters", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc/pubsub" },
      { title: "ethereum.org: Run a node", url: "https://ethereum.org/developers/docs/nodes-and-clients/run-a-node/" },
    ],
  },
  {
    id: "security",
    title: "RPC security",
    category: "operations",
    aliases: ["hardening", "open node", "DNS rebinding", "http.vhosts", "corsdomain", "exposed RPC"],
    summary: "RPC security is keeping an endpoint from doing anything beyond answering reads: no [[admin-api|admin_]], [[debug-api|debug_]], `personal_`, or [[txpool-api|txpool_]] methods for the public, no unlocked accounts, no unbounded queries, and no listener on an address that did not need one.",
    sections: [
      {
        heading: "The namespaces that must never be public",
        paragraphs: [
          "[[namespaces|Namespaces]] are the first control, because they decide what the endpoint is able to do at all. `admin_` adds and removes peers and starts listeners. `personal_`, long deprecated and removed from [[geth|Geth]], unlocks keys and signs with them. `debug_` runs tracers that can occupy a core for minutes per call and dump raw internals. `txpool_` exposes the pending set, which is order-flow intelligence and a privacy leak for the users submitting through you. A public endpoint should expose `eth`, `net`, and `web3`, and nothing else.",
          "Geth defaults to that narrow set; Nethermind's default module list is broader, so set it explicitly on any public listener, and beyond that the damage is done by tutorials that widen it. [[geth|Geth]] takes `--http.api eth,net,web3`, [[nethermind|Nethermind]] takes `--JsonRpc.EnabledModules [Eth,Net,Web3]`, and the [[engine-api|Engine API]] lives on its own authenticated port rather than in that list. Where a namespace is genuinely needed by one internal consumer, expose it on a separate listener bound to a private interface instead of widening the public one.",
        ],
      },
      {
        heading: "Binding, hosts, and CORS",
        paragraphs: [
          "`--http.addr 127.0.0.1` is the default for a reason. A node bound to `0.0.0.0` on a public address is found by scanners within hours, and surveys of open [[json-rpc|JSON-RPC]] ports are a standing hobby. Binding to loopback is not the end of it, because of [[cors|DNS rebinding]]: a page on an attacker's domain can make the browser resolve that domain to `127.0.0.1` and then send same-origin requests to your node. `--http.vhosts` is the defense, an allow-list on the `Host` header that defaults to `localhost`.",
          "`--http.corsdomain` is routinely confused with it and does something else entirely. It sets `Access-Control-Allow-Origin`, which is a browser rule about which pages may read a response; scripts, servers, and `curl` never honored it and are unaffected. Setting it to `*` does not open a node that was already reachable, and setting it narrowly does not protect one that is. Vhosts is the security control; corsdomain is the convenience one.",
        ],
      },
      {
        heading: "Denial of service and the money paths",
        paragraphs: [
          "Reads are the denial-of-service surface. An unbounded [[eth-get-logs|eth_getLogs]] range, a `debug_traceBlockByNumber` on a busy block, a thousand-item [[batch-request|batch]], or an [[eth-call|eth_call]] with a huge gas cap all cost the node far more than they cost the caller. Cap the block range, the batch length, and the body size, apply per-IP [[rate-limits|rate limits]] at the [[reverse-proxy|proxy]], and keep [[geth|Geth]]'s `--rpc.gascap` at a sane value so one call cannot occupy a core.",
          "The money paths are shorter. Never run a node with unlocked accounts while [[eth-send-transaction|eth_sendTransaction]] or [[signing-methods|personal_sign]] is reachable; that combination is a direct withdrawal, and it is why `personal_` was removed rather than fixed. Keep the [[authentication|JWT secret]] file readable only by the two client processes, and treat RPC logs as sensitive, because they record every address and contract your users touched.",
        ],
      },
    ],
    example: {
      title: "The dangerous flags, and the ones you want",
      language: "bash",
      code: "# every namespace, every host, every origin, public bind: an open node\ngeth --http --http.addr 0.0.0.0 --http.vhosts '*' --http.corsdomain '*' \\\n     --http.api eth,net,web3,txpool,debug,admin,personal        # never do this\n\n# a node that is safe to put behind a proxy\ngeth --http --http.addr 127.0.0.1 --http.port 8545 \\\n     --http.api eth,net,web3 \\\n     --http.vhosts rpc.example \\\n     --rpc.gascap 50000000 \\\n     --authrpc.addr 127.0.0.1 --authrpc.port 8551 \\\n     --authrpc.jwtsecret /secrets/jwt.hex\n\n# the same shape in Nethermind\nnethermind --JsonRpc.Enabled true \\\n           --JsonRpc.Host 127.0.0.1 \\\n           --JsonRpc.Port 8545 \\\n           --JsonRpc.EnabledModules [Eth,Net,Web3]",
      note: "Every additional namespace in that first list is a capability you have handed to anyone who can reach the port.",
    },
    pitfalls: [
      "Copying `--http.api eth,net,web3,txpool,debug,admin,personal` from a tutorial written for a local devnet.",
      "Believing a loopback bind is enough on a machine with a browser, which DNS rebinding defeats unless `--http.vhosts` is set.",
      "Treating `--http.corsdomain` as an access control; it constrains browsers only, never servers or scripts.",
      "Exposing port 8551 publicly because the Engine API has a JWT; the token pairs two processes, it does not survive exposure.",
      "Leaving `txpool_` open on a node your own users submit through, which publishes their pending transactions.",
    ],
    related: ["namespaces", "authentication", "reverse-proxy", "admin-api", "debug-api", "txpool-api", "self-hosting", "rate-limits", "eth-send-transaction", "geth", "nethermind", "cors"],
    sources: [
      { title: "Geth: command-line options", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
      { title: "Nethermind documentation", url: "https://docs.nethermind.io/" },
      { title: "ethereum.org: Run a node", url: "https://ethereum.org/developers/docs/nodes-and-clients/run-a-node/" },
    ],
  },
  {
    id: "observability",
    title: "RPC observability",
    category: "operations",
    aliases: ["monitoring", "metrics", "Prometheus", "Grafana", "alerting", "SLO", "head age"],
    summary: "Observability for RPC is the set of signals that show an endpoint is answering correctly rather than merely answering: per-method latency and errors, head distance against a reference, node sync and peer state, and alerts that fire on a stalled head rather than a closed port.",
    sections: [
      {
        heading: "Signals at the edge",
        paragraphs: [
          "Measure per method, always. One `debug_traceBlockByNumber` and a million [[eth-block-number|eth_blockNumber]] calls average into a number that describes neither, so latency histograms, error rates, and request counts need the method as a label. Add the block argument where there is one: without it you cannot tell a slow [[archive-node|archive]] query from a slow node.",
          "Count [[rpc-errors|JSON-RPC]] error codes separately from HTTP statuses. A 200 carrying `-32005` is a complete outage for the caller while every HTTP dashboard stays green, and that gap is the most common reason an incident is reported by users before it is noticed internally. Track [[batch-request|batch]] sizes, response sizes, [[websocket-transport|WebSocket]] connections and subscriptions per connection, [[caching|cache]] hit ratio, and, if you run an [[rpc-gateway|RPC gateway]], per-upstream selection and eviction counts.",
        ],
      },
      {
        heading: "Signals at the node",
        paragraphs: [
          "Clients export Prometheus metrics and the client teams publish Grafana dashboards for them. [[geth|Geth]] takes `--metrics --metrics.addr 127.0.0.1 --metrics.port 6060` and serves `/debug/metrics/prometheus`; [[nethermind|Nethermind]] uses `--Metrics.Enabled true` with `--Metrics.ExposePort`; [[besu|Besu]] uses `--metrics-enabled`; [[lighthouse|Lighthouse]] and the other [[consensus-client|consensus clients]] expose `--metrics`, on port 5054 in Lighthouse's case. Scrape both halves of the pair, not just the [[execution-client|execution client]].",
          "The node-side signals that matter are the head block number and its timestamp, peer counts for each layer separately, sync state, disk headroom and IO latency, and [[engine-api|Engine API]] round-trip time. That last one is the best early warning available: `engine_newPayload` latency climbing toward the 12-second [[slot-epoch|slot]] interval means the node is about to start missing blocks, and it moves well before any head-lag alert fires.",
        ],
      },
      {
        heading: "Alert on the right thing",
        paragraphs: [
          "Head age is the single most useful alert: compare the `timestamp` of the latest [[eth-get-block-by-number|block]] against wall clock and fire above roughly 40 seconds, which tolerates a few missed slots without tolerating a stall. Pair it with head skew, the distance between this node and the best head you know across the fleet, since a whole fleet can be behind while each node looks individually fresh; [[head-lag|head consistency]] is what that measures.",
          "Do not alert on [[eth-syncing|eth_syncing]] alone. It returns `false` on a node that finished syncing and then stopped importing, so it is a liveness check with a false negative built in. Add alerts on peer count near zero, on the `finalized` [[block-tag|tag]] not advancing while `latest` does, which means the network is not finalizing or the [[consensus-client|consensus client]] has stopped telling the execution client about it, on error rate change per method, on disk headroom, and on certificate expiry.",
        ],
      },
    ],
    example: {
      title: "Scraping both clients and the layer in front of them",
      language: "yaml",
      code: "# prometheus.yml\nscrape_configs:\n  - job_name: geth            # geth --metrics --metrics.addr 127.0.0.1 --metrics.port 6060\n    metrics_path: /debug/metrics/prometheus\n    static_configs:\n      - targets: ['127.0.0.1:6060']\n\n  - job_name: lighthouse      # lighthouse bn --metrics\n    static_configs:\n      - targets: ['127.0.0.1:5054']\n\n  - job_name: rpc-edge        # your proxy or gateway, labelled by method\n    static_configs:\n      - targets: ['127.0.0.1:4001']\n\n# the three alerts that catch most incidents:\n#   head age    now - latest block timestamp > 40s\n#   head skew   local head < best known head - 2\n#   finality    finalized unchanged for > 20 min while latest advances",
      note: "Scraping only the execution client hides the most common root cause, which is a consensus client that stopped driving it.",
    },
    pitfalls: [
      "Alerting on port reachability or HTTP 200, both of which a syncing or stalled node satisfies happily.",
      "Averaging latency across all methods, so a tracing regression disappears into head-query traffic.",
      "Using `eth_syncing` as the liveness check; it reports `false` on a node that stopped importing blocks.",
      "Monitoring only the execution client when the consensus client is what feeds it blocks.",
      "Logging the method without the block argument, which makes slow archive queries indistinguishable from a slow node.",
    ],
    related: ["health-check", "head-lag", "rpc-gateway", "eth-syncing", "engine-api", "failover", "geth", "nethermind", "lighthouse", "block-tag", "rate-limits", "network-telemetry", "rpc-benchmarking"],
    sources: [
      { title: "Geth: metrics and monitoring", url: "https://geth.ethereum.org/docs/monitoring/metrics" },
      { title: "Nethermind documentation", url: "https://docs.nethermind.io/" },
      { title: "Lighthouse book", url: "https://lighthouse-book.sigmaprime.io/" },
    ],
  },
  {
    id: "health-check",
    title: "Endpoint health checks",
    category: "operations",
    aliases: ["liveness", "readiness", "probe", "head age", "peer count", "hysteresis"],
    summary: "A health check for an RPC endpoint asks whether it can answer correctly rather than whether its port is open: the [[chain-id|chain id]] must match, [[eth-syncing|eth_syncing]] must be `false`, and the head must be both recent and close to the rest of the fleet.",
    sections: [
      {
        heading: "What 'up' has to mean",
        paragraphs: [
          "A TCP connect and an HTTP 200 prove almost nothing. A node that is still syncing accepts connections. A node on the wrong network answers every call confidently. A node whose [[consensus-client|consensus client]] died keeps serving its last known head forever. A throttled [[rpc-provider|provider]] key returns valid JSON that happens to be an error. All four are 'up' by any transport-level check and useless to a caller.",
          "Four questions cover almost everything. Is this the right chain, from [[chain-id|eth_chainId]] compared against a constant you configured. Is it done syncing, from [[eth-syncing|eth_syncing]] returning `false`. Is it fresh, from the latest block `timestamp` compared against wall clock. Is it in agreement, from its head compared against the best head across the pool. For a node you operate, add `net_peerCount` from the [[net-web3-api|net_ namespace]], since a node with no peers will look fresh for one more slot and then stop.",
        ],
      },
      {
        heading: "Building the probe",
        paragraphs: [
          "Use the block `timestamp`, not the block number. A number alone cannot tell you how old it is, and a stalled node and a quiet chain look identical through [[eth-block-number|eth_blockNumber]]. Because blocks arrive every 12 seconds and slots are sometimes missed, set the freshness threshold around 40 seconds rather than 13; anything tighter alerts on normal behavior. Run the probe every 5 to 10 seconds, which is frequent enough to react within a [[slot-epoch|slot]] or two, and keep it cheap, since a probe that traces a block is itself a load problem.",
          "Probe through the same path a real caller uses, including TLS and the [[reverse-proxy|proxy]], but not through your own [[caching|cache]], which will happily report that a dead upstream is healthy. Give the probe a hard timeout well under its interval so a hanging node registers as unhealthy instead of queueing.",
        ],
      },
      {
        heading: "Wiring it to routing",
        paragraphs: [
          "A health check that only pages a human is half-built. Its output should feed the [[load-balancer|load balancer]] weight and the [[failover|failover]] decision directly, so an unhealthy upstream stops receiving traffic before anyone reads the alert. Add hysteresis: eject after several consecutive failures, restore only after several consecutive passes plus a cooldown, or a node that is marginal will flap in and out of the pool and take a share of requests with it each time.",
          "One boolean per upstream is not enough. A node can be perfectly healthy for `latest` reads and unable to serve a [[trace-api|trace_]] call or historical state, so health has to be evaluated per capability and matched to the pool that request belongs to; see [[endpoint-capabilities|endpoint capabilities]].",
        ],
      },
    ],
    example: {
      title: "A three-question health check",
      language: "bash",
      code: "#!/usr/bin/env bash\nset -euo pipefail\nURL=${1:-http://127.0.0.1:8545}\nEXPECT_CHAIN=0x1\nMAX_AGE=40\n\nrpc () {\n  curl -s -m 3 -X POST -H 'content-type: application/json' \\\n    --data \"{\\\"jsonrpc\\\":\\\"2.0\\\",\\\"id\\\":1,\\\"method\\\":\\\"$1\\\",\\\"params\\\":$2}\" \"$URL\"\n}\n\nchain=$(rpc eth_chainId '[]' | jq -r '.result')\n[ \"$chain\" = \"$EXPECT_CHAIN\" ] || { echo \"wrong chain: $chain\"; exit 1; }\n\nsyncing=$(rpc eth_syncing '[]' | jq -r '.result')\n[ \"$syncing\" = \"false\" ] || { echo \"still syncing: $syncing\"; exit 1; }\n\nts=$(rpc eth_getBlockByNumber '[\"latest\",false]' | jq -r '.result.timestamp')\nage=$(( $(date +%s) - $((ts)) ))\n(( age <= MAX_AGE )) || { echo \"head is ${age}s old\"; exit 1; }\n\necho \"ok: chain $chain, head age ${age}s\"",
      note: "Add one comparison against a reference endpoint's block number and the same script also catches [[head-lag|head lag]], which freshness alone does not.",
    },
    pitfalls: [
      "Health-checking with a TCP connect or an HTTP 200, which a syncing node and a wrong-chain node both pass.",
      "Treating `eth_syncing` returning `false` as sufficient; it says nothing about when the last block arrived.",
      "Setting the freshness threshold at one slot, so every missed slot on mainnet pages someone.",
      "Ejecting and restoring on a single sample, which makes a marginal upstream flap in and out of rotation.",
      "Running the probe through your own cache or gateway, which can report a dead upstream as healthy.",
    ],
    related: ["failover", "head-lag", "load-balancer", "eth-syncing", "chain-id", "observability", "endpoint-capabilities", "eth-get-block-by-number", "net-web3-api", "rpc-gateway"],
    sources: [
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "Ethereum execution APIs", url: "https://github.com/ethereum/execution-apis" },
      { title: "Geth: command-line options", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
    ],
  },
  {
    id: "endpoint-capabilities",
    title: "Endpoint capabilities",
    category: "operations",
    aliases: ["capability probe", "feature detection", "archive depth", "method support", "support matrix"],
    summary: "An endpoint's capabilities are the things it can actually answer — archive depth, tracing namespaces, subscriptions, proofs, simulation, and the limits layered on top — and apart from the retention that [[eth-capabilities|eth_capabilities]] reports on nodes that serve it, none of them are advertised, so they have to be probed.",
    sections: [
      {
        heading: "Why you cannot assume",
        paragraphs: [
          "The [[execution-apis|execution-apis specification]] defines what methods mean, not which ones an operator has enabled. Four independent things vary behind any URL: the [[execution-client|client]] and its version, which decides whether [[eth-simulate|eth_simulateV1]] or a given tracer exists at all; the enabled [[namespaces|namespaces]]; [[eth-capabilities|the retention]], which decides how far back [[eth-call|eth_call]] and [[eth-get-proof|eth_getProof]] can go; and the [[rate-limits|limits]] the operator adds on ranges, batches, and connections. Two URLs from the same [[rpc-provider|provider]] often differ on all four.",
          "The failure modes look similar and mean opposite things. `-32601 method not found` is permanent: this endpoint will never serve it. `-32000` with `missing trie node` or `historical state not available` means the block is out of retention, so an [[archive-node|archive]] upstream can answer. `-32005` or a 429 is a quota you may already be paying for. Only the first is a reason to stop asking, and an [[archive-node|archive]] endpoint answering old [[eth-get-balance|eth_getBalance]] calls is still no guarantee that historical [[eth-get-proof|eth_getProof]] works, because proofs need trie nodes that a flat-storage archive may not keep.",
        ],
      },
      {
        heading: "Probing",
        paragraphs: [
          "Run a fixed sequence at startup and after any endpoint change, and record the result per upstream. `web3_clientVersion` from the [[net-web3-api|web3_ namespace]] names the software and version; [[chain-id|eth_chainId]] confirms the network; a balance read at an early block tests archive depth, and a binary search over block numbers finds the exact boundary when you need it. Then one call per capability you depend on: a [[trace-api|trace_block]] or [[debug-api|debug_traceTransaction]], an [[eth-get-proof|eth_getProof]] at an old block, [[eth-simulate|eth_simulateV1]] with an empty call list, an [[eth-subscribe|eth_subscribe]] over [[websocket-transport|WebSocket]], and a growing [[batch-request|batch]] and [[eth-get-logs|eth_getLogs]] range to find the caps.",
          "Store the answers as a capability record rather than a boolean, and let the [[rpc-gateway|gateway]] route on it: traces to the archive pool, `latest` reads to the fast pool, proofs to whatever can actually produce them. Re-probe after every [[hardfork|network upgrade]] and whenever a provider changes its upstream software, because moving from [[geth|Geth]] to [[erigon|Erigon]] or [[nethermind|Nethermind]] changes tracer availability, error strings, and sometimes result shapes.",
        ],
      },
      {
        heading: "Failing at the right time",
        paragraphs: [
          "The point of probing is to move the failure from production to startup. An application that discovers at three in the morning that its fallback lacks `trace_` has an incident; one that refused to boot against that upstream has a configuration error, which is a much cheaper object. Assert what you require, log what you merely prefer, and treat a capability change on a live endpoint as an alert rather than a discovery made through error rates.",
        ],
      },
    ],
    example: {
      title: "A capability probe and what each answer means",
      language: "bash",
      code: "URL=https://rpc.example\np () { curl -s -m 10 -X POST -H 'content-type: application/json' \\\n         --data \"{\\\"jsonrpc\\\":\\\"2.0\\\",\\\"id\\\":1,\\\"method\\\":\\\"$1\\\",\\\"params\\\":$2}\" \"$URL\" \\\n       | jq -c '.result // .error'; }\n\np web3_clientVersion '[]'\n# \"Nethermind/v1.31.0/linux-x64/dotnet9.0.0\"      software and version\n\np eth_chainId '[]'\n# \"0x1\"                                            right network\n\np eth_getBalance '[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"0x100000\"]'\n# {\"code\":-32000,\"message\":\"missing trie node …\"}  not archive: out of retention\n\np trace_block '[\"0x12d4f1c\"]'\n# {\"code\":-32601,\"message\":\"Method not found\"}     trace_ namespace not enabled\n\np eth_simulateV1 '[{\"blockStateCalls\":[]},\"latest\"]'\n# []                                               supported\n\np eth_getLogs '[{\"fromBlock\":\"0x12c4f1c\",\"toBlock\":\"0x12d4f1c\",\"topics\":[]}]'\n# {\"code\":-32005,\"message\":\"block range too large\"} range cap, not a missing feature",
      note: "Four error shapes, four meanings: no such method, no such data, no such permission, and a limit. Only the first will never change.",
    },
    pitfalls: [
      "Assuming every URL from one provider is equivalent; archive and tracing are usually a separate tier on a separate host.",
      "Reading `-32601` as 'Ethereum does not support this' rather than 'this endpoint does not expose it'.",
      "Probing once at signup and never again, so a client upgrade or an upstream swap breaks you silently.",
      "Treating archive state as proof that historical `eth_getProof` works; the two need different data on disk.",
      "Concluding there is no range limit because one scan succeeded; some endpoints cap on response size, which depends on how busy the blocks were.",
    ],
    related: ["rpc-provider", "rpc-errors", "archive-node", "eth-get-proof", "eth-simulate", "trace-api", "debug-api", "rate-limits", "rpc-gateway", "net-web3-api", "health-check", "rpc-workloads", "eth-capabilities"],
    sources: [
      { title: "Ethereum execution APIs", url: "https://github.com/ethereum/execution-apis" },
      { title: "Execution API documentation", url: "https://ethereum.github.io/execution-apis/" },
      { title: "EIP-1474: Remote procedure call specification", url: "https://eips.ethereum.org/EIPS/eip-1474" },
    ],
  },
  {
    id: "private-rpc",
    title: "Private transaction RPC",
    category: "operations",
    aliases: ["Flashbots Protect", "MEV Blocker", "eth_sendPrivateTransaction", "private mempool", "order flow"],
    summary: "A private transaction RPC accepts a signed transaction and hands it to block builders instead of gossiping it to the public [[mempool|transaction pool]], so nobody can trade against it in the seconds before inclusion.",
    sections: [
      {
        heading: "What is private about it",
        paragraphs: [
          "A normal [[eth-send-raw-transaction|eth_sendRawTransaction]] puts the transaction into the node's pool, and [[devp2p|devp2p]] gossips it across the network within about a second. Everyone running a node sees it before it is mined, which is enough time to front-run or sandwich it; that is the ordinary operation of the [[mev|MEV]] supply chain. A private endpoint keeps the transaction off that path and hands it to builders directly, so only the parties that could include it ever see it.",
          "Flashbots Protect at `https://rpc.flashbots.net` and MEV Blocker at `https://rpc.mevblocker.io` are the two in widest use, both drop-in RPC URLs a wallet can simply be pointed at, and both return a share of the value extracted around the transaction. Privacy here is relative: you have replaced 'the whole network can see this' with 'this builder set can see this', which is a smaller audience, not none.",
        ],
      },
      {
        heading: "The methods",
        paragraphs: [
          "`eth_sendPrivateTransaction` takes an object rather than a bare hex string: `tx` with the signed bytes, an optional `maxBlockNumber` after which the attempt expires, and `preferences` for things like fast mode. It returns the same transaction hash [[eth-send-raw-transaction|eth_sendRawTransaction]] would. `eth_sendBundle` goes further and submits [[mev-bundle|an ordered list of raw transactions]] with a target `blockNumber`, optional timestamp bounds, and `revertingTxHashes` naming the ones allowed to fail. The list is included together, in that order, in one [[block|block]], or not at all.",
          "Atomicity is where revert protection comes from: a bundle that would fail is simply not included, so no [[gas|gas]] is spent on a losing attempt. Bundles target a single block, so a strategy spanning several slots resubmits once per block. Requests to the Flashbots bundle endpoint at `relay.flashbots.net`, which despite its name is not a MEV-Boost [[relay|relay]], carry an `X-Flashbots-Signature` header signed with any Ethereum key as a reputation identity, which should never be the key holding the funds.",
        ],
      },
      {
        heading: "What you trade away",
        paragraphs: [
          "Inclusion becomes slower and conditional. Only a block built by a participating builder can carry the transaction, so it waits for a slot whose proposer took a block from that builder, and a transaction that never gets one simply expires. Meanwhile [[eth-get-transaction-by-hash|eth_getTransactionByHash]] on any public node returns `null` for the whole wait, which breaks the usual 'is it in the pool yet' check; poll the private endpoint or wait for a [[transaction-receipt|receipt]].",
          "The endpoint is also a trusted intermediary that can delay, drop, or observe your flow, and a builder is still free to place profitable transactions around yours. For ordinary transfers the public pool is fine; private submission earns its complexity on swaps, [[liquidation-bot|liquidations]], large approvals, and anything where the ordering itself is worth money.",
        ],
      },
    ],
    example: {
      title: "One private transaction, and a bundle",
      language: "json",
      code: "// a single transaction, builders only, valid for a bounded window\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_sendPrivateTransaction\",\"params\":[{\n  \"tx\": \"0x02f8b201820…\",\n  \"maxBlockNumber\": \"0x12d4f2a\",\n  \"preferences\": { \"fast\": true }\n}]}\n// {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060\"}\n\n// a bundle: both land in block 0x12d4f21, in this order, or neither does\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_sendBundle\",\"params\":[{\n  \"txs\": [\"0x02f8b2…a1\", \"0x02f8b2…b2\"],\n  \"blockNumber\": \"0x12d4f21\",\n  \"revertingTxHashes\": []\n}]}\n\n// meanwhile, on any public node:\n// eth_getTransactionByHash(0x5c504ed4…22060) -> null",
      note: "The hash comes back exactly as it would from a public submission; the difference is that no public node can see the transaction behind it until it is mined.",
    },
    pitfalls: [
      "Polling a public node for the hash and concluding the transaction was dropped, when it was never visible there.",
      "Reading 'private' as 'hidden from everyone'; the builders you submitted to see it in full.",
      "Submitting a bundle once and waiting, when bundles target one block and must be resubmitted for each subsequent block.",
      "Signing the `X-Flashbots-Signature` header with the key that holds the funds instead of a separate identity key.",
      "Assuming private submission removes MEV; a builder still chooses what to place around your transaction.",
    ],
    related: ["mev", "mempool", "eth-send-raw-transaction", "mev-boost", "eth-get-transaction-by-hash", "block-proposal", "rpc-provider", "devp2p", "transaction-receipt", "nonce", "relay", "searcher", "mev-bundle", "rpc-privacy"],
    sources: [
      { title: "Flashbots documentation", url: "https://docs.flashbots.net/" },
      { title: "ethereum.org: Maximal extractable value (MEV)", url: "https://ethereum.org/developers/docs/mev/" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "cors",
    title: "CORS and DNS rebinding",
    category: "operations",
    aliases: ["CORS", "Access-Control-Allow-Origin", "preflight", "DNS rebinding", "--http.corsdomain", "--http.vhosts", "--ws.origins", "JsonRpc.CorsOrigins"],
    summary: "CORS is the browser rule, configured on a node by options such as `--http.corsdomain`, that decides whether a page from one origin may read a response from another; it is not access control, and DNS rebinding, the attack it is confused with, is stopped by a `Host` allow-list such as `--http.vhosts` instead.",
    sections: [
      {
        heading: "What the browser enforces",
        paragraphs: [
          "A browser tags every request with the origin of the page that made it, meaning scheme, host and port, and by default lets a script read a response only from its own origin. CORS, cross-origin resource sharing, is how a server opts other origins in: it answers with `Access-Control-Allow-Origin` naming the page's origin, or `*`. A [[json-rpc|JSON-RPC]] call is a POST with `content-type: application/json`, which is not one of the simple request shapes, so the browser first sends a preflight: an `OPTIONS` request carrying `Origin`, `Access-Control-Request-Method: POST` and `Access-Control-Request-Headers: content-type`. Only if that answer allows it does the real call go out.",
          "All of this is enforced by the browser on the user's behalf. `curl`, backend services, bots and [[client-libraries|libraries]] running in Node never send a preflight and ignore the response headers entirely. CORS therefore stops a hostile page from using a visitor's browser as its proxy; it does nothing to stop anyone calling the node directly. A listener reachable from the internet is reachable whatever its CORS setting says, which is why the bind address and [[authentication|authentication]] carry the real weight; see [[security|RPC security]].",
        ],
      },
      {
        heading: "The node settings",
        paragraphs: [
          "[[geth|Geth]]'s `--http.corsdomain` takes a comma-separated list of origins and is empty by default, in which case Geth adds no CORS handling at all and pages on other origins cannot read its answers; `*` admits every origin. Geth also refuses any `content-type` other than JSON with HTTP 415, so a cross-origin `text/plain` POST, which a browser would send without a preflight, is rejected before it reaches a method. [[reth|Reth]] uses the same flag names, and [[besu|Besu]] takes `--rpc-http-cors-origins`, empty by default. [[nethermind|Nethermind]]'s `JsonRpc.CorsOrigins` defaults to `*`, so any page can read a local Nethermind's answers until the list is narrowed.",
          "WebSocket sits outside CORS altogether. A browser sends `Origin` with the upgrade request and leaves the decision to the server, which is what Geth's `--ws.origins` is for: with the list empty it accepts `http://localhost` and the machine's own hostname, and it skips the check when no `Origin` header is present, since only browsers send one. A dapp whose [[http-transport|HTTP]] calls work while its [[websocket-transport|WebSocket]] handshake is refused usually needs its origin added there. A hosted endpoint built for browser [[dapp-architecture|dapps]] has to send permissive CORS headers, so its protection comes from keys and per-key origin allow-lists instead.",
        ],
      },
      {
        heading: "DNS rebinding and the Host check",
        paragraphs: [
          "DNS rebinding reaches a node that listens only on `127.0.0.1`. A user on the node's machine opens `attacker.example`; the attacker's DNS server answers first with its own address and a very short TTL, the page loads, and when the name is resolved again the answer is `127.0.0.1`. Scripts on the page now send requests to `http://attacker.example:8545`, which the browser considers same-origin, so CORS is never consulted, and they arrive at the local node. The loopback bind did not help, because the browser is on loopback too.",
          "What gives the attack away is the `Host` header: the browser still sends `Host: attacker.example:8545`, a name the operator never configured. Geth's `--http.vhosts`, `localhost` by default, rejects it with 403 `invalid host specified`, while requests addressed to a bare IP always pass, since rebinding cannot produce one. Besu's `--host-allowlist`, `localhost,127.0.0.1` by default, does the same. Nethermind's JsonRpc options include no Host allow-list, so a desktop Nethermind relies on the browser. Chrome, from version 142, asks the user before a public site may reach loopback or private addresses, which blunts both attacks in that browser. Behind a [[reverse-proxy|reverse proxy]], the vhosts list has to name the public hostname the proxy forwards.",
        ],
      },
    ],
    example: {
      title: "A preflight answered, and a rebinding request refused",
      language: "http",
      code: "# Geth started with --http.corsdomain https://app.example (headers abridged)\nOPTIONS / HTTP/1.1\nHost: rpc.example\nOrigin: https://app.example\nAccess-Control-Request-Method: POST\nAccess-Control-Request-Headers: content-type\n\nHTTP/1.1 204 No Content\nAccess-Control-Allow-Origin: https://app.example\nAccess-Control-Allow-Methods: POST\nAccess-Control-Allow-Headers: content-type\nAccess-Control-Max-Age: 600\nVary: Origin\n\n# a rebinding page reaching a Geth bound to 127.0.0.1 with the default --http.vhosts\nPOST / HTTP/1.1\nHost: attacker.example:8545\nOrigin: http://attacker.example:8545\nContent-Type: application/json\n\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_accounts\",\"params\":[]}\n\nHTTP/1.1 403 Forbidden\nContent-Type: text/plain; charset=utf-8\n\ninvalid host specified",
      note: "The first exchange is a browser courtesy that `curl` never performs; the second is the check that protects a loopback node, and it keys on `Host`, not on `Origin`.",
    },
    pitfalls: [
      "Setting `--http.corsdomain '*'` to cure a browser error and believing the node is now open, or narrowing it and believing a public listener is now protected.",
      "Debugging a CORS failure with `curl`, which succeeds because it never sends a preflight and ignores the headers a browser enforces.",
      "Running `--http.vhosts '*'` on a workstation with a browser, which reopens the loopback node to DNS rebinding.",
      "Leaving Nethermind's default `JsonRpc.CorsOrigins` of `*` on a desktop node, so any page the user visits can read what the node answers.",
      "Moving a dapp from HTTP to WebSocket without adding its origin to `--ws.origins`, so the handshake fails while HTTP calls keep working.",
    ],
    related: ["security", "reverse-proxy", "http-transport", "websocket-transport", "authentication", "geth", "nethermind", "besu", "dapp-architecture", "eip-1193"],
    sources: [
      { title: "MDN: Cross-Origin Resource Sharing (CORS)", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS" },
      { title: "Geth: command-line options", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
      { title: "Nethermind: configuration", url: "https://docs.nethermind.io/fundamentals/configuration" },
      { title: "Chrome: new permission prompt for Local Network Access", url: "https://developer.chrome.com/blog/local-network-access" },
    ],
  },
  {
    id: "circuit-breaker",
    title: "Circuit breakers and token buckets",
    category: "operations",
    aliases: ["circuit breaker", "half-open", "token bucket", "leaky bucket", "failsafe policy", "retry storm", "outlier ejection"],
    summary: "A circuit breaker is a switch in a client or [[rpc-gateway|RPC gateway]] that stops sending requests to an upstream once its recent failures or latency cross a threshold, fails or reroutes those calls at once, and lets traffic back only after trial requests succeed.",
    sections: [
      {
        heading: "Closed, open, half-open",
        paragraphs: [
          "Closed is normal: every request goes to the upstream and its outcome is recorded in a rolling window, counted over the last N calls or the last few seconds. When the window crosses a threshold, such as 20 failures in the last 80 calls, a run of consecutive failures, or a share of calls slower than a latency limit, the breaker opens. Open means requests are refused without touching the upstream, so the caller gets a fast error or, inside a gateway, an immediate [[failover|failover]] to another upstream. After a cooldown the breaker turns half-open and admits a few trial requests; enough successes close it, and a failure opens it again.",
          "The point is to stop hammering a dependency that is struggling and to stop callers waiting on calls that will fail. A [[health-check|health check]] asks an upstream synthetic questions on a timer; a breaker judges it by the outcomes of real traffic, so it catches the node that passes every probe while failing the requests that matter.",
        ],
      },
      {
        heading: "What counts, and how narrow the breaker is",
        paragraphs: [
          "Only operational failures belong in the window: connection errors, timeouts, HTTP 502 to 504, and `-32603` internal errors. Deterministic answers must never count. A revert returned as code `3`, `-32602` invalid params, and `-32601` method not found are correct responses about the request, and counting them lets one caller's loop of reverting [[eth-call|eth_call]] requests open the breaker on a healthy node for everyone; [[retries|retry policy]] draws the same line. HTTP 429 and `-32005` describe a quota rather than health, and eRPC, for one, keeps rate-limit responses and client errors out of its window.",
          "Granularity matters as much as thresholds. A node whose tracing workers are saturated times out every `debug_traceBlockByNumber` while still answering [[eth-block-number|eth_blockNumber]] and eth_call in milliseconds. One breaker per upstream sees trace failures fill the window and ejects the node for all traffic; a breaker per upstream and method class sheds only the [[trace-api|trace]] load. eRPC accepts breakers only at upstream scope, inside failsafe entries matched by method, and while one is open a call fails with `ErrFailsafeCircuitBreakerOpen` without dialling, which its network layer answers by trying the next upstream.",
        ],
      },
      {
        heading: "Stopping retry storms",
        paragraphs: [
          "Retries multiply. Three attempts in a [[client-libraries|client library]] behind three in a gateway behind a [[load-balancer|load balancer]] that also retries turn one slow request into as many as 27 against the node that is already slow, and every caller that timed out in the same second does the same. An open breaker cuts that loop where it is placed: attempts against the failing upstream stop at once, traffic moves to healthy upstreams, and when every upstream is open the caller receives a fast error instead of a queue.",
          "The half-open trial is also what makes failing back safe, because restoring an upstream on its first good answer lets a marginal node flap in and out and drag requests with it each time. A breaker cannot see a node that answers promptly and wrongly, such as one serving a stale head, so [[head-lag|head consistency]] checks stay a separate job.",
        ],
      },
      {
        heading: "Token bucket and leaky bucket",
        paragraphs: [
          "A breaker reacts to an upstream's failures; a rate limiter keeps you inside someone else's quota before failures start. In a token bucket, the bucket holds up to C tokens and refills at r per second, each request spends one token or its compute-unit weight, and a request that finds the bucket empty waits or is refused. After an idle spell it allows a burst of up to C, while its long-run rate never exceeds r. A leaky bucket instead queues requests and drains them at a fixed rate, so its output is smooth but a burst becomes queueing delay.",
          "For a caller of a metered [[rpc-provider|provider]], a token bucket set a little under the published rate plus a breaker per upstream turns [[rate-limits|rate limits]] into a local queue and upstream failures into fast rerouting, and keeps the two signals apart in [[observability|metrics]].",
        ],
      },
    ],
    example: {
      title: "Per-upstream, per-method breakers in eRPC",
      language: "yaml",
      code: "projects:\n  - id: main\n    upstreams:\n      - id: archive-1\n        endpoint: http://10.0.0.11:8545\n        failsafe:                         # entries are matched top to bottom\n          - matchMethod: \"trace_*\"        # a saturated trace pool trips only this breaker\n            circuitBreaker:\n              failureThresholdCount: 10   # 10 failures ...\n              failureThresholdCapacity: 40  # ... in the last 40 trace calls\n              halfOpenAfter: 2m\n              successThresholdCount: 5\n              successThresholdCapacity: 20\n          - matchMethod: \"*\"              # everything else keeps flowing\n            circuitBreaker:\n              failureThresholdCount: 20\n              failureThresholdCapacity: 80\n              halfOpenAfter: 5m\n              successThresholdCount: 8\n              successThresholdCapacity: 200",
      note: "With the trace breaker open, `trace_block` fails fast with `ErrFailsafeCircuitBreakerOpen` and is retried on another upstream, while `eth_call` keeps going to archive-1.",
    },
    pitfalls: [
      "Counting reverts and invalid-params errors as failures, so one caller's bad requests open the breaker on a healthy upstream.",
      "Running one breaker per upstream for every method, so a saturated trace pool ejects the node from cheap reads as well.",
      "Closing the breaker on the first successful trial request, which makes a marginal upstream flap in and out of rotation.",
      "Retrying at every layer with no breaker or retry budget, so a slow node receives many times its normal load at its weakest moment.",
      "Expecting a breaker to catch a stale node, which answers quickly and successfully; only a head-distance check sees it.",
    ],
    related: ["failover", "retries", "rate-limits", "health-check", "rpc-gateway", "load-balancer", "head-lag", "observability", "rpc-errors", "request-cancellation"],
    sources: [
      { title: "Martin Fowler: CircuitBreaker", url: "https://martinfowler.com/bliki/CircuitBreaker.html" },
      { title: "eRPC: circuit breaker", url: "https://docs.erpc.cloud/config/failsafe/circuit-breaker" },
      { title: "eRPC: failsafe policies", url: "https://docs.erpc.cloud/config/failsafe" },
    ],
  },
  {
    id: "request-cancellation",
    title: "Request limits and cancellation",
    category: "operations",
    aliases: ["request cancellation", "--rpc.evmtimeout", "--rpc.gascap", "JsonRpc.Timeout", "execution aborted", "request timed out", "hedged requests", "client disconnect"],
    summary: "Request cancellation covers the limits a node places on an expensive call, such as gas caps, execution timeouts, and batch and response sizes, and what happens to work already running when the caller gives up, which [[json-rpc|JSON-RPC]] has no message to express.",
    sections: [
      {
        heading: "Guards before and during a call",
        paragraphs: [
          "[[geth|Geth]] bounds simulation with `--rpc.gascap`, 50,000,000 gas for [[eth-call|eth_call]] and [[eth-estimate-gas|eth_estimateGas]], and `--rpc.evmtimeout`, 5 seconds for eth_call, after which the EVM is stopped and the caller reads `execution aborted (timeout = 5s)`. `--rpc.txfeecap`, 1 ether, is a different kind of guard: it refuses submitted transactions whose fee exceeds it. [[batch-request|Batches]] are capped at 1,000 items by `--rpc.batch-request-limit` and at 25,000,000 response bytes by `--rpc.batch-response-max-size`, and [[eth-get-logs|log queries]] by `--rpc.rangelimit`, unlimited by default, and `--rpc.logquerylimit`, 1,000 alternatives per topic position. Geth's HTTP server also answers `-32002` `request timed out` just before its 30-second write timeout.",
          "[[nethermind|Nethermind]] uses `JsonRpc.Timeout` of 20,000 ms, `JsonRpc.GasCap` of 100,000,000, `JsonRpc.MaxBatchSize` of 1,024, `JsonRpc.MaxBatchResponseBodySize` of 32 MiB and `JsonRpc.MaxLogsPerResponse` of 20,000. [[reth|Reth]] has `--rpc.gascap`, `--rpc.max-logs-per-response`, `--rpc.max-blocks-per-filter` and `--rpc.max-tracing-requests`, which by default allows two fewer concurrent traces than the machine has cores. Tracing carries its own clock: the options object of every `debug_trace*` method takes a `timeout` string, `5s` by default in Geth and applied per transaction, which is why heavy [[debug-api|traces]] are sent with a larger value.",
        ],
      },
      {
        heading: "No cancel message, only a closed connection",
        paragraphs: [
          "The JSON-RPC 2.0 specification defines requests, responses and notifications, and nothing that withdraws a request in flight; the [[execution-apis|execution APIs]] add nothing either. Protocols built on JSON-RPC that needed it, such as the Language Server Protocol, defined their own `$/cancelRequest`. A node therefore learns that a caller has given up in one way only: the connection closes. Over [[http-transport|HTTP]] a connection carries one request at a time, so abandoning a call means dropping that connection. Over a [[websocket-transport|WebSocket]] many calls share one socket, and the only way to stop one of them is to close all of them, subscriptions included.",
          "Whether a closed connection stops the work is client-specific and mostly undocumented. In Geth's source, eth_call runs under the request's context and a watcher cancels the EVM when that context ends, which Go's HTTP server does when the client disconnects, so an abandoned eth_call stops at the next check, and closing a WebSocket cancels every call in flight on it. Geth's tracers differ: the watcher that enforces a trace's `timeout` stops the EVM only when that deadline passes, and if the request is cancelled first it simply exits, so an abandoned trace runs to completion; a block trace stops dispatching further transactions but finishes the one in progress. Nethermind bounds eth_call with a cancellation token built from `JsonRpc.Timeout`. A [[reverse-proxy|reverse proxy]] passes the signal on only if it closes its upstream connection, which nginx does by default through `proxy_ignore_client_abort off`.",
        ],
      },
      {
        heading: "Callers that multiply the work",
        paragraphs: [
          "The workload that makes this matter is the [[dex-aggregator|quote engine]] or [[intent-solver|solver]]. It re-simulates routes with eth_call, [[eth-simulate|eth_simulateV1]] or `debug_traceCall` on every new head or price tick, and each head makes the previous round stale. A client-side timeout discards the answer but not the computation, so a solver that abandons half its simulations still pays the node for all of them, and so does everyone sharing that node.",
          "Resilience features multiply the same work. A hedged request sends a duplicate to a second upstream when the first is slower than some percentile, which trims tail latency at the cost of running the call twice; eRPC's hedge policy does this. A gateway that [[retries|retries]] a timed-out simulation three times has run it four times. The coherent arrangement is ordered limits, the node's execution limit below the gateway's timeout and the gateway's below the caller's deadline, so that the node gives up first and says so instead of working for nobody. A [[circuit-breaker|circuit breaker]] and bounded concurrency in the [[rpc-gateway|gateway]] complete it.",
        ],
      },
    ],
    example: {
      title: "Four clocks around one expensive call",
      language: "text",
      code: "# Geth: an eth_call that outruns --rpc.evmtimeout (5s by default)\n{\"jsonrpc\":\"2.0\",\"id\":7,\"error\":{\"code\":-32000,\"message\":\"execution aborted (timeout = 5s)\"}}\n\n# Geth: written just before the 30 s HTTP write timeout, as the handler's context is cancelled\n{\"jsonrpc\":\"2.0\",\"id\":8,\"error\":{\"code\":-32002,\"message\":\"request timed out\"}}\n\n# Nethermind: what its HTTP handler writes when request processing is cancelled\n{\"jsonrpc\":\"2.0\",\"id\":9,\"error\":{\"code\":-32016,\"message\":\"Request was canceled due to enabled timeout.\"}}\n\n# a trace given its own budget, which Geth applies per transaction\n{\"jsonrpc\":\"2.0\",\"id\":10,\"method\":\"debug_traceCall\",\"params\":[\n  {\"from\":\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"to\":\"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D\",\"data\":\"0x38ed1739…\"},\n  \"latest\",\n  {\"tracer\":\"callTracer\",\"timeout\":\"20s\"}\n]}\n\n# the caller's own clock: curl gives up after 3 s and closes the connection\ncurl -s -m 3 -X POST -H 'content-type: application/json' --data @call.json http://127.0.0.1:8545\n# curl: (28) Operation timed out after 3001 milliseconds with 0 bytes received",
      note: "Four clocks, and they interact: in Geth, once the request context ends, by the write timeout or by a disconnect, an `eth_call` stops while a running trace carries on without its own `timeout`.",
    },
    pitfalls: [
      "Setting a client timeout below the node's execution limit and assuming the node stops when the client does.",
      "Hedging or retrying expensive simulations at several layers, multiplying the work on the node that was already slow.",
      "Raising `--rpc.evmtimeout` or `JsonRpc.Timeout` to rescue one slow query, which lets every caller hold a core that long.",
      "Closing a WebSocket to abandon one slow call and losing every subscription on that connection.",
      "Giving a trace a `timeout` longer than the proxy's read timeout, so the caller gets a 504 while the node keeps tracing.",
    ],
    related: ["eth-call", "debug-api", "eth-simulate", "retries", "rpc-gateway", "reverse-proxy", "rate-limits", "security", "circuit-breaker", "batch-request"],
    sources: [
      { title: "JSON-RPC 2.0 specification", url: "https://www.jsonrpc.org/specification" },
      { title: "Geth: command-line options", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
      { title: "Nethermind: configuration", url: "https://docs.nethermind.io/fundamentals/configuration" },
      { title: "Reth: reth node command-line reference", url: "https://reth.rs/cli/reth/node" },
    ],
  },
  {
    id: "network-telemetry",
    title: "Network telemetry",
    category: "operations",
    aliases: ["Xatu", "The Lab", "ethPandaOps", "propagation timing", "node crawler", "client census", "sentry", "clock drift"],
    summary: "Network telemetry is measuring Ethereum from many vantage points outside any single client, recording when blocks and attestations reach nodes, how long nodes take to import them, and which software the network runs, as ethPandaOps' Xatu and The Lab do.",
    sections: [
      {
        heading: "Questions one node cannot answer",
        paragraphs: [
          "[[observability|Observability]] tells an operator about their own node. Network questions differ in kind: how long after a slot starts does a block reach most nodes, how late do proposers publish, which [[execution-client|execution client]] imports heavy blocks slowest, what share of nodes run a release ready for the next [[hardfork|fork]]. Answering them needs many observers with different peers, locations, hardware and clients recording the same events, and a store where the records can be joined on slot and block root.",
          "Two kinds of data come out. Timing data is many observations of one event, one per vantage point, and means something only as a distribution. Census data is one look at many nodes, collected by crawlers that walk [[discovery|node discovery]] and record what each reachable peer says about itself, which is what [[client-diversity|client diversity]] trackers publish. A census counts nodes that answered, not stake: validators behind one beacon node count once, nodes that accept no inbound connections are missed, and client names are self-reported strings.",
        ],
      },
      {
        heading: "Xatu and The Lab",
        paragraphs: [
          "Xatu is ethPandaOps' collection system, and it runs in modes. A sentry sits beside a [[consensus-client|consensus client]], subscribes to its [[beacon-api|Beacon API]] event stream and stamps each event as it arrives. Cannon reads canonical, finalized data from a beacon node once, without duplicates. Mimicry listens on the execution [[devp2p|devp2p]] network for transactions, discovery crawls discv4 and discv5, and the server collects from all of them, adds geolocation at the level each contributor chooses, and forwards the events to sinks that feed ClickHouse. Community members run Contributoor, a lightweight sentry, beside their own [[beacon-node|beacon nodes]].",
          "The data is public. xatu-data publishes Parquet files, one per day for event tables, at `data.ethpandaops.io` under CC BY 4.0, with table prefixes by source such as `beacon_api_`, `libp2p_`, `mempool_`, `canonical_beacon_`, `canonical_execution_` and `mev_relay_`. The Lab at `lab.ethpandaops.io` is the visual side, with a public API over derived tables that keep block first-seen per node, head first-seen per node and [[engine-payload|engine_newPayload]] duration per client as separate measurements.",
        ],
      },
      {
        heading: "Where the timestamp is taken",
        paragraphs: [
          "A block passes several instants on one node, and each is someone's measurement. It arrives on a [[libp2p-gossip|gossipsub]] topic; it passes gossip validation, when the beacon node emits `block_gossip`; the execution side runs `engine_newPayload`, whose start and end bracket execution; [[fork-choice|fork choice]] imports it and makes it head, emitting `block` and `head`, whose order differs by client, with [[lighthouse|Lighthouse]] sending `head` first since v8.1.0; and after `engine_forkchoiceUpdated` the execution client serves it, where `eth_blockNumber` and `newHeads` finally see it. These points are hundreds of milliseconds apart on one machine, and further apart on a heavy block.",
          "A figure means nothing without the point it was taken at, and Xatu's own are one hop later still: `event_date_time` is when the sentry received the event from its beacon node, and `propagation_slot_start_diff` subtracts a slot start computed from genesis time. For an RPC caller the instant that matters is the last one, later than every gossip figure quoted about the network.",
        ],
      },
      {
        heading: "Clocks, machines, peers, and the observer",
        paragraphs: [
          "Every slot-relative figure is the observer's clock minus a computed slot start, so clock error enters directly. NTP over the public internet typically keeps a clock within tens of milliseconds, whether through chrony or ntpd, and a poorly connected host does worse; Xatu sentries measure their drift against an NTP server and attach it to each event. Observers also differ in [[node-hardware|hardware]], which changes execution time, in peers, since a well-connected data-centre node hears blocks earlier, and in client, since implementations emit events at slightly different stages. Compare one observer with itself over time, or distributions across many, never one node against another.",
          "Measuring costs something too. A sentry subscribed to attestation topics pulls a high-volume stream through the beacon node it is measuring, instrumented clients do extra work on the hot path, and contributors are self-selected, which skews samples toward well-run infrastructure.",
        ],
      },
    ],
    example: {
      title: "One mainnet slot as The Lab recorded it",
      language: "text",
      code: "# slot 15307259, 2026-09-27 12:12:11 UTC; milliseconds after slot start, one row per observing node\ncurl -s -A 'Mozilla/5.0' 'https://lab.ethpandaops.io/api/v1/mainnet/fct_block_first_seen_by_node?slot_start_date_time_gte=1790511131&slot_start_date_time_lt=1790511132&page_size=500'\n\nblock first seen          148 nodes   min 1394   median 1554   p90 1788   max 2644\n  via gossipsub trace      45 nodes              median 1511\n  via block_gossip event  100 nodes              median 1577\nhead first seen           122 nodes   min 1469   median 1824              max 6180\n\n# same block, from fct_engine_new_payload_by_el_client\nengine_newPayload on EIP-7870 builder-class nodes, median per client:   30 ms to 146 ms",
      note: "The gap between the block and head medians is roughly import time; the per-client range compares one block on a handful of machines, which is a sample, not a benchmark.",
    },
    pitfalls: [
      "Quoting a propagation figure without saying which instant it measures: gossip arrival, import, head, or RPC availability.",
      "Comparing two nodes' slot-relative timings when their clocks, hardware and peer sets differ.",
      "Reading a crawler's node census as stake share, when validators behind one beacon node count once.",
      "Running a telemetry sentry against a production beacon node without budgeting for the event-stream load.",
      "Treating one slot's per-client import times as a benchmark rather than one sample on unequal machines.",
    ],
    related: ["observability", "client-diversity", "libp2p-gossip", "engine-payload", "beacon-api", "server-sent-events", "discovery", "node-hardware", "fork-choice", "block-proposal", "fastest-head", "rpc-benchmarking"],
    sources: [
      { title: "ethPandaOps: Xatu", url: "https://github.com/ethpandaops/xatu" },
      { title: "ethPandaOps: Xatu data", url: "https://github.com/ethpandaops/xatu-data" },
      { title: "The Lab by ethPandaOps", url: "https://lab.ethpandaops.io/" },
      { title: "EIP-7870: Hardware and Bandwidth Recommendations", url: "https://eips.ethereum.org/EIPS/eip-7870" },
    ],
  },
  {
    id: "fastest-head",
    title: "Racing for the newest head",
    category: "operations",
    aliases: ["first-seen latency", "block delivery network", "head signal", "bdnBlocks", "Chainbound Fiber", "newHeads latency", "fan-in feeds"],
    summary: "Racing for the newest head means learning of each new [[block|block]] at the tip of the chain as early as possible, by listening to several sources at once (beacon-node events, commercial block feeds, `newHeads` streams) and starting work on whichever reports it first, because [[searcher|searchers]], liquidators and market makers must respond within the same 12-second slot.",
    sections: [
      {
        heading: "Who needs the head first, and where it appears",
        paragraphs: [
          "The head is the block that [[fork-choice|fork choice]], the rule a node uses to pick between competing blocks, treats as the tip of the chain. A new one arrives every 12-second [[slot-epoch|slot]], and several consumers start work the moment it does: a [[searcher|searcher]] looks for a trade the new prices open, a [[liquidation-bot|liquidation bot]] re-checks which loans have become unsafe, a market maker re-reads reserves with [[dex-pool-reads|pool reads]], and an [[price-oracle|oracle]] operator decides whether to post a price. In the example's slot the median of 148 observing nodes saw the block 1.39 seconds in, leaving about ten seconds to simulate and submit for the next block.",
          "An Ethereum node is two programs joined by the [[engine-api|Engine API]]: a [[consensus-client|consensus client]], or beacon node, which receives blocks from peers and runs fork choice, and an [[execution-client|execution client]], which runs transactions and answers JSON-RPC. A new block passes five steps in a fixed order. First the [[beacon-block|beacon block]] arrives on the `beacon_block` [[libp2p-gossip|gossip]] topic, where nodes relay new blocks peer to peer, already carrying its [[execution-payload|execution payload]], the transactions. Second, once proposer and signature check out, before anything executes, the beacon node emits `block_gossip`. Third, it hands the payload to the execution client to run, with `engine_newPayload`. Fourth, it imports the block into fork choice as the new tip and emits `head` and `block` milliseconds apart, in an order that differs by client: current Lighthouse sends `head` first. Last, it tells the execution client with `engine_forkchoiceUpdated`; only then does its `latest` [[block-tag|tag]] move and [[geth|Geth]] fire `newHeads`.",
        ],
      },
      {
        heading: "What each signal tells you",
        paragraphs: [
          "The beacon node publishes its events as [[server-sent-events|server-sent events]] on the [[beacon-api|Beacon API]] at `/eth/v1/events?topics=block_gossip,head,block`, so `block_gossip` is the earliest signal one node offers. Earlier signals carry less: `block_gossip` holds only `slot` and the beacon block root, the consensus block's own hash, and `head` adds the state root; neither names the execution [[block-hash|block hash]] that JSON-RPC uses. For that hash or the transactions, a consumer fetches `/eth/v2/beacon/blocks/{root}` once the block is imported. `newHeads` comes last and carries the most, a full execution header. State can be read a little earlier: Geth stores the block and its state when `engine_newPayload` returns, so a call pinned to the block's hash works once `block` fires, before `latest` moves.",
          "Block delivery networks, private networks of well-connected nodes that forward blocks and transactions, sell an earlier copy of the first step with the payload attached. bloXroute's BDN streams `bdnBlocks`, documented as possibly including blocks that will not be accepted on chain, beside `newBlocks` for fully validated ones; Chainbound's Fiber offers gRPC streams such as `SubscribeNewExecutionPayloads`. Their edge is placement and peering, not a protocol shortcut, so the do-it-yourself version is a well-peered consensus client on a well-connected host, its execution client beside it, and consumers reading over [[ipc-transport|IPC]].",
        ],
      },
      {
        heading: "Building the fan-in",
        paragraphs: [
          "No source wins every block, so a latency-sensitive consumer subscribes to several: a delivery network, its own beacon node's events, its own execution node's `newHeads` over IPC, and one or two providers' `newHeads`. Picture one table keyed by execution block hash, fed by several queues, each arrival stamped on receipt. The first arrival of a hash starts work; later ones are dropped, with their delay logged. Beacon events name only the beacon root, so they are joined by slot until the body can be read. A second hash at the same height is a competing block, not a duplicate, as when the next proposer skips a late block and builds on its parent, a [[reorg|reorg]]. Each decision records its hash, and state reads go to a node that has the block, pinned to that hash, never to `latest`.",
          "A source's latency is arrival time minus slot start, which on mainnet is `1606824023 + 12 × slot` seconds, genesis plus 12 seconds a slot. Ranking feeds by one host's clock is safe, since all arrivals share its error; comparing against slot start, or across hosts, adds NTP error of tens of milliseconds, enough to change which feed looks fastest. Keep a distribution per source, not a win count: a feed first by two milliseconds on most blocks but a second late on a few can be worth less than a steady runner-up.",
        ],
      },
    ],
    example: {
      title: "One slot through five sources, stamped by one host clock",
      language: "text",
      code: "# mainnet slot 15307300 starts at 1606824023 + 12 x 15307300 = 1790511623 (2026-09-27 12:20:23 UTC)\n# its block: number 26068754, hash 0xb0f3…1514, parent 0x9228…34d8, beacon root 0x633e…7c58\n# The Lab: first sighting median +1387 ms across 148 observers (fastest +1251), head median +1608 ms across 122\n# this host's arrivals below are illustrative, in ms after slot start\n# own CL is Lighthouse, streaming GET http://localhost:5052/eth/v1/events?topics=block_gossip,head,block\n\n+1262  fiber      SubscribeNewExecutionPayloads  hash 0xb0f3…1514   FIRST: decode its transactions, start work\n+1281  bloxroute  bdnBlocks                      hash 0xb0f3…1514   same hash, +19 ms\n+1335  own CL     block_gossip  slot 15307300    root 0x633e…7c58   same slot, no hash yet, +73 ms\n+1566  own CL     head          root 0x633e…7c58                    now the tip of fork choice\n+1569  own CL     block         root 0x633e…7c58                    stored, body readable: hash 0xb0f3…1514\n+1597  own EL     newHeads      hash 0xb0f3…1514   parentHash 0x9228…34d8   same hash, +335 ms\n+1766  provider   newHeads      hash 0xb0f3…1514   same hash, +504 ms\n\n# reads sent to the local Geth\n+1270  eth_call {...} \"latest\"                        -> computed on 26068753, the parent\n+1270  eth_call {...} {\"blockHash\":\"0xb0f3…1514\"}   -> -32000 header for hash not found\n+1570  eth_call {...} {\"blockHash\":\"0xb0f3…1514\"}   -> answered on 26068754, before newHeads",
      note: "The delivery network beat this node's own `block_gossip` by 73 ms and its own `newHeads` by 335 ms. Before the local node had executed the block, the call at `latest` quietly used the parent's state, while the call pinned to the hash failed loudly; once `engine_newPayload` had stored the block, the pinned call worked, even before `newHeads`.",
    },
    pitfalls: [
      "Treating the first arrival as settled, when a delivery-network block may never be accepted and a valid one can still be reorged out.",
      "Calling `eth_call` at `latest` as soon as a delivery-network block arrives, which reads the parent's state because the local node has not imported it.",
      "Taking the head from a provider's `newHeads` and reading state through the same URL, which can reach a backend a block behind; see [[head-lag|head lag]].",
      "Treating a reconnected [[websocket-transport|WebSocket]] as caught up, when heads sent during the gap are never replayed and must be fetched by number.",
    ],
    related: ["head-lag", "network-telemetry", "eth-subscribe", "server-sent-events", "beacon-api", "libp2p-gossip", "reorg", "failover", "searcher", "engine-api"],
    sources: [
      { title: "beacon-APIs: event stream topics", url: "https://github.com/ethereum/beacon-APIs/blob/master/apis/eventstream/index.yaml" },
      { title: "Engine API: Paris specification", url: "https://github.com/ethereum/execution-apis/blob/main/src/engine/paris.md" },
      { title: "bloXroute: bdnBlocks stream", url: "https://docs.bloxroute.com/eth/streams/blocks-streams/bdnblocks" },
      { title: "Chainbound fiber-go client", url: "https://github.com/chainbound/fiber-go" },
    ],
  },
  {
    id: "transaction-relayer",
    title: "Transaction relayers",
    category: "operations",
    aliases: ["relayer", "OpenZeppelin Relayer", "transaction manager", "nonce manager", "meta-transaction", "ERC-2771", "speed up and cancel", "gasless transactions"],
    summary: "A transaction relayer is a service that holds signing keys and takes responsibility for landing [[transaction|transactions]]: it assigns [[nonce|nonces]] and fees, signs, broadcasts to several endpoints, replaces transactions that stall, and keeps checking receipts until they are final, so its callers hand over a call rather than a signed transaction.",
    sections: [
      {
        heading: "What callers hand over",
        paragraphs: [
          "Signing a transaction is easy; getting it included is not. The fee has to keep up with demand, and every transaction carries its sender's nonce, a counter that must go 0, 1, 2 with no gaps, so one transaction that never lands holds up every later one. Keepers, oracle nodes, bridges and backends that pay gas for their users all need this, so it is packaged as a service.",
          "OpenZeppelin Relayer, the open-source successor to Defender's relayer, accepts `POST /api/v1/relayers/<relayer_id>/transactions` with `to`, `data`, `value` and either explicit fees or a `speed` such as `fast`, and returns its own id, whose status runs from `Pending` to `Confirmed`. A request with no `valid_until` still unmined after eight hours is cancelled: replaced at the same nonce by a zero-value transfer to the relayer itself, so later transactions can proceed.",
          "Gasless flows let a user act without holding ether for gas. Under ERC-2771 the user signs a request off chain, and the relayer pays the [[gas|gas]] to send it to a trusted forwarder, a contract the recipient has agreed to believe. The forwarder checks the signature and calls the recipient with the signer's 20-byte address appended to the calldata, which the recipient's `_msgSender()` reads whenever `isTrustedForwarder(msg.sender)` is true. Signed [[eip-3009|EIP-3009]] token transfers are relayed the same way, and an [[erc-4337|ERC-4337]] bundler is a relayer one level up.",
        ],
      },
      {
        heading: "Nonces and fees",
        paragraphs: [
          "A relayer cannot simply ask the chain for its next nonce. [[eth-get-transaction-count|eth_getTransactionCount]] at `latest` ignores transactions still waiting: with nonce 1,204 unmined it answers 1,204 again, and a second transaction signed with that nonce becomes an attempt to replace the first. At `pending` it reflects one node's [[mempool|pool]] of waiting transactions, which differs between backends and can empty on a restart. Relayers count locally and treat the chain as a floor: OpenZeppelin Relayer raises its counter to the on-chain count when it falls behind and never lowers it.",
          "Fees follow [[eip-1559|EIP-1559]]: each block has a base fee per gas that rises at most 12.5 percent after a full block, and a transaction names the most it will pay, `maxFeePerGas`, and a tip, `maxPriorityFeePerGas`. [[eth-fee-history|eth_feeHistory]] gives recent base fees and tips, and a fee cap of twice the base fee plus the tip survives about six full blocks in a row. A pool keeps one transaction per sender and nonce, so a stalled one is replaced by sending the same nonce with higher fees. [[geth|Geth]], [[nethermind|Nethermind]] and [[reth|Reth]] demand at least 10 percent more on both fee fields (Geth's and Reth's `--txpool.pricebump`). Chainlink nodes bump by 20 percent after three blocks without inclusion.",
        ],
      },
      {
        heading: "Errors that mean something else",
        paragraphs: [
          "Several errors are not failures. Resending bytes a node already holds returns `already known`, which is success. `nonce too low` after a resend usually means one of the relayer's own transactions for that nonce landed, so it first checks the [[eth-get-transaction-receipt|receipts]] of every hash it sent at that nonce. `replacement transaction underpriced` means the slot is taken and the bump was too small; `transaction underpriced` means the fee is below that pool's minimum.",
          "The strings are conventions, not a specification. Geth, Nethermind and Reth return `nonce too low`, `already known` and `replacement transaction underpriced` under code `-32000`, with Geth and Reth appending the nonces, as in `nonce too low: next nonce 501, tx nonce 500`. [[besu|Besu]] answers `Nonce too low` with code `-32001` and `Known transaction` for a duplicate. Relayers match lower-cased substrings against a table of known texts, which goes stale: OpenZeppelin Relayer's still lists `exceeds next nonce` for Nethermind, which now says `nonce too high`. An [[rpc-provider|RPC provider]] in front of the node may rewrite any of them; see [[rpc-errors|JSON-RPC errors]].",
        ],
      },
      {
        heading: "Stuck, dropped and reorged",
        paragraphs: [
          "A transaction is stuck when its fee cap sits below the base fee, or when it waits behind a lower nonce that never landed. [[txpool-api|txpool_contentFrom]] on the relayer's own node tells which: Geth lists the first under `pending` and the second under `queued`, while Reth puts both under `queued`. A transaction that a node has dropped from its pool comes back by rebroadcasting the same signed bytes, which is safe to repeat, to several endpoints, such as OpenZeppelin Relayer's weighted list of `custom_rpc_urls`; see [[failover|failover]].",
          "Inclusion is not the end. The relayer polls `eth_getTransactionReceipt` on the endpoint it sent through, records `blockHash`, and re-checks until the block is at or below the `finalized` [[block-tag|tag]], because a [[reorg|reorg]], the chain switching to a competing branch of recent blocks, can remove the receipt, move it, or let the transaction it replaced land instead. The states themselves are in [[transaction-lifecycle|transaction lifecycle]].",
        ],
      },
    ],
    example: {
      title: "A stuck transaction, a rejected bump and a replacement",
      language: "text",
      code: "block N, base fee 25.0 gwei\n\n1. nonce 1,204 signed: maxFeePerGas 28 gwei, maxPriorityFeePerGas 1 gwei -> 0x9f1c…a3e0\n   eth_sendRawTransaction to endpoints A and B: both return 0x9f1c…a3e0\n\n2. blocks N to N+2 are full, so N+1 to N+3 have base fees of 28.1, 31.6 and 35.6 gwei\n   the fee cap is now below the base fee; Geth's txpool_contentFrom lists nonce 1,204 under pending\n\n3. bump by 5 percent: maxFeePerGas 29.4, tip 1.05 gwei\n   -> -32000 replacement transaction underpriced (pools want 10 percent on both)\n\n4. reprice from the head: maxFeePerGas 2 x 35.6 + 2 = 73.2 gwei, tip 2 gwei -> 0x41d0…77b2\n   A and B both return 0x41d0…77b2\n\n5. block N+5 includes 0x41d0…77b2\n   resending 0x9f1c…a3e0 now answers nonce too low: expected, the nonce is spent\n\n6. receipts: 0x41d0…77b2 status 0x1, blockHash 0x6c3a…e91f; 0x9f1c…a3e0 null for good\n\n7. 13 to 19 minutes later block N+5 is at or below finalized, blockHash unchanged: Confirmed",
      note: "A 10 percent bump in step 3 would have been accepted and stayed stuck, since 30.8 gwei is still below a 35.6 gwei base fee; the bump rule is only a pool's minimum, and the new fee has to be priced from the current base fee.",
    },
    pitfalls: [
      "Reading the next nonce from `eth_getTransactionCount` with `pending` on whichever backend answers, which reuses or skips nonces.",
      "Treating `nonce too low` after a resend as a failure and re-signing with a new nonce, which pays the recipient twice.",
      "Bumping a stuck transaction by the 10 percent minimum after the base fee has risen further, so the replacement stays stuck.",
    ],
    related: ["transaction-lifecycle", "nonce", "mempool", "eth-send-raw-transaction", "txpool-api", "failover", "erc-4337", "eth-fee-history", "keeper", "reorg"],
    sources: [
      { title: "OpenZeppelin Relayer: EVM integration", url: "https://github.com/OpenZeppelin/openzeppelin-relayer/blob/main/docs/evm.mdx" },
      { title: "ERC-2771: Secure Protocol for Native Meta Transactions", url: "https://eips.ethereum.org/EIPS/eip-2771" },
      { title: "Chainlink node configuration (CONFIG.md)", url: "https://github.com/smartcontractkit/chainlink/blob/develop/docs/CONFIG.md" },
      { title: "Reth CLI: reth node", url: "https://reth.rs/cli/reth/node" },
    ],
  },
  {
    id: "security-monitoring",
    title: "On-chain security monitoring",
    category: "operations",
    aliases: ["threat monitoring", "exploit detection", "Hypernative", "Forta", "OpenZeppelin Monitor", "Tenderly alerts", "automated pause", "incident response"],
    summary: "On-chain security monitoring is the continuous inspection of every new block, and often of pending transactions, for signs that a protocol is being attacked or misconfigured, raising alerts and sometimes responding on its own, for example by pausing a contract before an attacker's next transaction lands.",
    sections: [
      {
        heading: "What monitors look for",
        paragraphs: [
          "A protocol that holds users' funds wants to learn within seconds that it is under attack, and ideally to stop the attacker before the theft completes. Detectors are rules over decoded chain data. Some watch configuration: an `OwnershipTransferred` [[event-log|event]] (topic `0x8be0079c…`), an ERC-1967 `Upgraded` event (topic `0xbc7cd75a…`), or a bare write to the storage slot where a [[proxy-contract|proxy]] keeps the address of the code it runs. Some watch money: a protocol's balance falling by a fifth in one block, or a flash loan, borrowed and repaid inside one transaction, followed by a large swap. Some watch prices: a pool's spot price moving far from a [[price-oracle|price oracle]] inside one transaction suggests someone is pushing the price a lending contract reads. Forta splits an attack into funding, preparation, exploitation and money laundering; the earlier the stage a detector fires on, the more time a response has.",
          "Hypernative offers monitoring with automated response, Tenderly pairs alerts with its simulator, and Forta, which built a network of detection bots, now screens transactions before they reach a rollup's [[sequencer|sequencer]]. OpenZeppelin Monitor, the open-source option, matches calls, events and transaction expressions and sends Slack, email, webhook or script alerts, but its EVM client reads only blocks, logs and receipts, through `eth_blockNumber`, `eth_getBlockByNumber`, `eth_getLogs` and `eth_getTransactionReceipt`, so internal calls and the [[mempool|transaction pool]] are outside its view.",
        ],
      },
      {
        heading: "The RPC workload",
        paragraphs: [
          "A full monitor reads everything, every block: the block with full transactions, the receipts from [[eth-get-block-receipts|eth_getBlockReceipts]], and a [[execution-trace|trace]] of every transaction, the record of every inner call it made, from `debug_traceBlockByNumber` with `callTracer`, or `trace_block` where the [[trace-api|trace_ namespace]] exists. Logs are not enough, because the outflows that matter are often [[internal-transaction|internal ether transfers]], and a write to an implementation slot without an `Upgraded` event shows up in a `prestateTracer` state diff but in no log. All of it has to arrive within seconds of the block, which rules out most rate-limited shared endpoints.",
          "Watching before inclusion adds the pool. Over [[eth-subscribe|eth_subscribe]] with `newPendingTransactions` and full objects, or a dedicated [[mempool-streaming|mempool stream]], a monitor sees public transactions seconds before a block and can run each suspicious one through [[debug-api|debug_traceCall]] or [[eth-simulate|eth_simulateV1]] at the head. An attacker who submits through [[private-rpc|private RPC]] never appears there, so the pool view catches only public flow, and the dependable early signal is the attacker's preparation in earlier blocks.",
        ],
      },
      {
        heading: "Seven blocks of warning",
        paragraphs: [
          "Forta's write-up of the April 2022 Saddle Finance exploit, about 11 million dollars, shows the window that preparation leaves. The attacker's contract was created in block 14,684,300 and used in block 14,684,307. A detector that copies the chain's state just after the creation into a local fork and calls each new function finds that the one taking no arguments, [[abi|selector]] `0xaf8271f7`, lifts the attacker's WETH balance from 0 to 3,375. Seven blocks, 110 seconds by their timestamps, separate a provable threat from the theft: enough for an automated response, and far too little for a human one.",
          "The usual automated response is a guardian, an account the protocol authorised in advance, calling `pause()`, which emits `Paused(address)` and blocks the functions the attacker needs. That transaction races the attack, so it goes out through private RPC or as a [[mev-bundle|bundle]], where an attacker watching the pool cannot see it and move first. White-hat rescues go further: they front-run a visible exploit, landing a transaction just ahead of it that moves the funds to safety, a [[searcher|searcher]]'s technique used defensively.",
        ],
      },
      {
        heading: "When the endpoint is the false alarm",
        paragraphs: [
          "A monitor is only as right as the data it reads. A lagging endpoint means a late or missed alert. A wrong one is worse: a load balancer can split one evaluation across two heights, so a balance read one block apart shows a drop that never happened; a half-synced backend can return an error or `0x` that careless decoding turns into a zero balance; a node briefly on the losing side of a [[reorg|reorg]] reports transfers that never become canonical. Each of these pages somebody, and the expensive ones pause a protocol that was never attacked; see [[head-lag|head consistency]].",
          "The defences are mechanical. Pin each evaluation to one block hash. Cross-check the head, and any reading that would trigger action, against at least two independent providers, the quorum pattern an [[rpc-gateway|RPC gateway]] such as dshackle implements. Backfill from a stored cursor after every reconnect, so a dropped [[websocket-transport|WebSocket]] leaves no silent gap. Hypernative gave these reasons, missed blocks, delayed responses and inconsistent reads, for its 2026 move to multi-provider routing. Live detection needs only recent state; the investigation afterwards needs an [[archive-node|archive node]].",
        ],
      },
    ],
    example: {
      title: "What a monitor running today would have done with Saddle's preparation block",
      language: "text",
      code: "block 14,684,300 (0xe0108c) arrives on newHeads\n\n1. eth_getBlockByNumber 0xe0108c, true            full transaction objects\n2. eth_getBlockReceipts 0xe0108c                  one receipt has contractAddress 0x7336…2191\n3. debug_traceBlockByNumber 0xe0108c, callTracer  the CREATE frame and its deployer, 0x6334…5ac0\n4. detector: unverified code exposing two functions, 0xa15db5c5 and 0xaf8271f7\n5. eth_simulateV1 on base block 0xe0108c, from the deployer:\n     call 1  WETH balanceOf(attacker)            -> 0\n     call 2  new contract, data 0xaf8271f7        -> status 0x1\n     call 3  WETH balanceOf(attacker)            -> 3,375 WETH\n6. cross-check: a second provider, same blockHash, reproduces step 5\n7. alert; the guardian's signed pause() goes out through private RPC\n\nblock 14,684,307 (0xe01093): the real exploit, seven blocks and 110 seconds after block 14,684,300",
      note: "Forta's 2022 bot ran this check on a Ganache fork; on a current node `eth_simulateV1` does the same at the head without an archive, because the block it forks from is the latest one.",
    },
    pitfalls: [
      "Watching only events, which misses internal ether transfers and storage writes that a malicious upgrade or a drain need not log.",
      "Sending the response transaction through the public pool, where the attacker can see it and act first.",
      "Reading a quiet pending-transaction stream as safety, when private submissions never appear in it.",
    ],
    related: ["debug-api", "trace-api", "internal-transaction", "mempool-streaming", "private-rpc", "head-lag", "rpc-gateway", "proxy-contract", "transaction-simulation", "archive-node"],
    sources: [
      { title: "Forta: attack simulation with Forta (Saddle Finance)", url: "https://forta.org/blog/attack-simulation" },
      { title: "OpenZeppelin Monitor documentation", url: "https://docs.openzeppelin.com/monitor" },
      { title: "Hypernative: Smart Router RPC layer for on-chain data reliability", url: "https://www.hypernative.io/blog/hypernative-integrates-smart-router-rpc-layer-to-improve-onchain-data-reliability" },
      { title: "Forta: the Web3 kill chain", url: "https://www.forta.org/blog/web3-kill-chain" },
    ],
  },
  {
    id: "rpc-workloads",
    title: "Who uses Ethereum RPC",
    category: "operations",
    aliases: ["RPC use cases", "RPC consumers", "workload shapes", "RPC traffic patterns", "method mix", "who calls RPC"],
    summary: "An RPC workload is the shape of the traffic a consumer sends to a node — which methods, at which block, over how much history, and how quickly the answer is needed — and this lesson sorts Ethereum's RPC consumers into nine such shapes.",
    sections: [
      {
        heading: "Shapes, not industries",
        paragraphs: [
          "A lending protocol's [[liquidation-bot|liquidation bot]] and its accountants read the same contracts but need opposite endpoints: the bot reads loans at the head, the newest [[block|block]], within milliseconds of each block, while the accountants read month-end balances at old blocks and can wait a minute. To the node only the shape matters: which block is read, how much history that forces it to keep, which [[namespaces|namespaces]] are called, and whether a late or a missing answer does more harm. The nine shapes below, one paragraph each, are head reads, pinned-block reads, simulation, proofs, event logs, traces, writes, head streams, and the traffic that drives a chain. Most consumers mix several; a wallet reads, simulates and writes.",
        ],
      },
      {
        heading: "Reading state: at the head, pinned, simulated, proven",
        paragraphs: [
          "Head reads ask what is true now: [[eth-call|eth_call]] and [[eth-get-balance|eth_getBalance]] at `latest`, often packed into one call through [[multicall|Multicall3]] or a [[deployless-call|deployless call]]. Wallets, [[portfolio-tracker|portfolio trackers]], DEX routers reading [[dex-pool-reads|pools]] and [[quoter-contract|quoters]], lending dashboards, [[ens|name]] and attestation lookups, ticket checks, and game and social front ends send them. Packing has a ceiling: Uniswap's smart-order-router sizes each multicall for 150,000,000 [[gas|gas]] on mainnet, three times what a default [[geth|Geth]] node lets one `eth_call` use (`--rpc.gascap`), so its quotes fail there until the cap is raised or the chunks shrink.",
          "Pinned-block reads ask what was true at one past block: [[governance-voting-power|voting power]] at a proposal's snapshot, [[airdrop-rewards|reward]] eligibility, [[erc-4626|vault]] share prices, reserve reconciliation, insurance claims, risk research and [[fork-testing|fork tests]]. A [[pruned-node|pruned node]] keeps state only for recent blocks, 128 on Geth and other numbers elsewhere, so older reads fail there and need an [[archive-node|archive node]].",
          "Simulation asks what a transaction would do if sent: [[transaction-simulation|previews]] in wallets and security tools, routes in [[dex-aggregator|aggregators]] and [[intent-solver|solvers]], [[erc-4337|user operations]] in bundlers, and treasury payouts. It runs as `eth_call` with [[state-override|state overrides]], as [[eth-simulate|eth_simulateV1]] or as `debug_traceCall`, against a deadline; aggregators first find the token balance slots they override ([[storage-slot-discovery|slot discovery]]).",
          "Proofs ask for evidence the caller can check without trusting the node: [[light-client|light clients]] such as [[helios|Helios]], [[bridge|bridges]] and ZK provers, including [[real-time-proving|real-time provers]], call [[eth-get-proof|eth_getProof]]. Succinct's RSP block prover fetches a proof at the parent block for every account and slot a block touches, so it needs an archive node that keeps historical [[merkle-patricia-trie|trie]] nodes.",
        ],
      },
      {
        heading: "Reading history: event logs and traces",
        paragraphs: [
          "[[event-log|Event logs]] are records contracts emit, such as a token's `Transfer`. Their consumers turn them into tables: [[indexer|indexers]], [[exchange-deposits|exchange deposits]], [[stablecoin-payments|payment processors]], [[nft-marketplace|NFT marketplaces]], streaming and vesting apps, prediction-market settlement, carbon-credit retirements, [[cross-chain-relayer|cross-chain relayers]], storage networks, and oracle, dispute and staking nodes. They call [[eth-get-logs|eth_getLogs]], [[eth-get-block-receipts|eth_getBlockReceipts]] and log [[eth-subscribe|subscriptions]], and need logs back to a contract's deployment, which [[history-expiry|history expiry]] can remove; a Hyperlane relayer's first run indexes every past `Dispatch` message event on each origin chain. [[rpc-privacy|Privacy wallets]] download every event their pool contract emits.",
          "Traces show what happened inside a transaction, such as [[internal-transaction|internal ETH transfers]], which leave no log. [[block-explorer|Explorers]], compliance and [[chain-analytics|analytics]] platforms, [[accounting-reconciliation|accounting]], [[address-history|address history]] and [[security-monitoring|incident forensics]] call [[trace-api|trace_block]], `trace_filter` or [[debug-api|debug_traceBlockByNumber]]; Safe's Transaction Service uses `trace_filter` and `trace_block` on L1 chains but `eth_getLogs` on L2s. Traces are the costliest shape, since the node re-executes the block with a tracer attached, and the least portable: `trace_` and Geth's `debug_` output differ, and neither tracing format is part of the [[execution-apis|execution-apis]] specification.",
        ],
      },
      {
        heading: "Writing, streaming, and driving the chain",
        paragraphs: [
          "Writers need each transaction to land exactly once: [[transaction-relayer|relayers]], [[keeper|keepers]], exchange and custody withdrawals, stablecoin mints and burns, tokenised-asset issuers, [[x402|x402]] settlement, [[onchain-agents|agents]], [[faucet|faucets]], and launch, fundraising and game backends that send in bursts. The loop reads the account's next [[nonce|nonce]] with [[eth-get-transaction-count|eth_getTransactionCount]] at `pending`, estimates the fee, sends with [[eth-send-raw-transaction|eth_sendRawTransaction]] and polls for the receipt; a nonce is usable once, so a resent copy cannot land twice. When ordering is worth money, they send through [[private-rpc|private submission]] or [[mev-share|MEV-Share]] instead of the public mempool.",
          "Head streams feed consumers racing to see each new block and pending transaction: [[searcher|searchers]] and builders, market makers, [[price-oracle|oracles]], derivatives keepers, [[preconfirmation|preconfirmation]] services and gas estimators watching [[mempool-streaming|the mempool]]. They hold [[eth-subscribe|eth_subscribe]] streams open over WebSocket and pick endpoints by [[fastest-head|time to head]]; a Chainlink node needs a WebSocket URL whenever its log broadcaster is on, the default on Ethereum mainnet.",
          "The last shape runs the chain itself. An Ethereum node is a [[beacon-node|beacon node]] driving an [[execution-client|execution client]] over the [[engine-api|Engine API]], and [[validator-node|validators]], staking and restaking operators and [[distributed-validator|distributed validators]] run that pair. [[relay|Relays]], which pass builders' blocks to proposers, re-execute each one before a deadline. Rollups rebuild their chain from L1 data through the [[derivation-pipeline|derivation pipeline]], fetching [[blob|blobs]] with [[blob-archive|blob archives]] behind them. Chain teams, rollup-as-a-service platforms, [[testnets|testnet]] and [[permissioned-network|permissioned-network]] operators, [[network-telemetry|telemetry]] and [[portal-network|history]] projects run their own nodes; [[rpc-provider|providers]] and node hosts sell every shape at once.",
        ],
      },
    ],
    example: {
      title: "Named consumers, the calls they make and the history they need",
      language: "text",
      code: "consumer: its shapes, as named in the paragraphs above\n\nMetaMask wallet: head reads, simulation, writes\n  calls    eth_getBalance, eth_call, eth_estimateGas, eth_feeHistory, eth_sendRawTransaction\n  needs    the head only; Infura is the default endpoint\n\nUniswap smart-order-router: head reads\n  calls    eth_call carrying large Multicall batches to pools and quoters\n  needs    the head, and an eth_call gas cap of at least multicallChunk x gasLimitPerCall,\n           150,000,000 on mainnet by default (Geth's default cap is 50,000,000)\n\nSnapshot voting strategy: pinned-block reads\n  calls    eth_call through Multicall with blockTag set to the proposal snapshot\n  needs    archive state at that block\n\nFoundry fork test: pinned-block reads\n  calls    eth_getBalance, eth_getTransactionCount and eth_getCode (or eth_getAccountInfo\n           where served), eth_getStorageAt per slot\n  needs    archive state once the block is old; reads by block hash by default\n\ngraph-node subgraph: event logs, pinned-block reads, traces\n  calls    eth_getLogs; eth_call at past blocks; trace_filter for call handlers\n  needs    logs from each subgraph's start block, EIP-1898 archive state for calls\n\nSafe Transaction Service: traces on L1, event logs on L2\n  calls    L1: trace_filter, then trace_block near the head; L2: eth_getLogs\n  needs    traces or receipts back to the Safe deployments\n\nBlockscout explorer: nearly every reading shape\n  calls    blocks, receipts, and debug_ or trace_ per ETHEREUM_JSONRPC_VARIANT\n  needs    a full archive node plus a trace endpoint\n\nHyperlane relayer: event logs, writes\n  calls    eth_getLogs for Mailbox Dispatch events on each origin chain;\n           Mailbox.process() on the destination\n  needs    every past message on each origin chain\n\nSwarm Bee node: event logs, on Gnosis Chain\n  calls    eth_getLogs for postage-stamp contract events since the contract was created\n  needs    a full archival endpoint; non-archive ones fail with storage: not found\n\nSuccinct RSP prover: proofs\n  calls    eth_getProof at the parent block for each touched account and its slots,\n           or one debug_executionWitness with --state-backend execution-witness\n  needs    an archive node that keeps historical trie nodes\n\nmev-boost-relay: driving the chain (simulation against a deadline)\n  calls    flashbots_validateBuilderSubmissionV5; beacon payload_attributes events\n  needs    the head; BLOCKSIM_TIMEOUT_MS is 10000 in code (the README says 3000)\n\nSSV node: driving the chain, plus event logs\n  calls    registry contract events over ETH_1_ADDR (WebSocket); BEACON_NODE_ADDR (HTTP)\n  needs    contract events since deployment, then the head\n\nop-challenger: driving a rollup (dispute games), deep pinned-block reads\n  calls    L1 execution, L1 beacon for blobs, L2 archive with debug_, op-node archive\n  needs    L2 state back to the start of every open dispute game",
      note: "Each row follows the project's public documentation or code; one organisation can appear in several shapes, so place each service by its traffic, not by its brand.",
    },
    pitfalls: [
      "[[rpc-benchmarking|Sizing an endpoint]] by request count, when one trace or wide log scan costs more than a page of head reads.",
      "Testing a consumer only at `latest`, then failing in production on the pinned-block or history part of its mix.",
      "Treating archive as one capability, when old state, old receipts, traces and historical proofs are retained separately.",
    ],
    related: ["rpc-provider", "endpoint-capabilities", "archive-node", "indexer", "transaction-simulation", "fastest-head", "rpc-benchmarking", "rpc-privacy", "self-hosting", "trace-api"],
    sources: [
      { title: "Uniswap smart-order-router: README", url: "https://github.com/Uniswap/smart-order-router" },
      { title: "The Graph: Graph Node", url: "https://thegraph.com/docs/en/indexing/tooling/graph-node/" },
      { title: "Safe Transaction Service", url: "https://docs.safe.global/core-api/api-safe-transaction-service" },
      { title: "OP Stack: op-challenger configuration", url: "https://docs.optimism.io/operators/chain-operators/tools/op-challenger" },
    ],
  },
  {
    id: "rpc-benchmarking",
    title: "Benchmarking RPC nodes",
    category: "operations",
    aliases: ["RPC load testing", "RPC benchmark", "coordinated omission", "open-loop load", "A/A test", "saturation curve", "flood"],
    summary: "Benchmarking an RPC node or provider means measuring latency, throughput and correctness under traffic that resembles real use — a realistic method mix, a fixed arrival rate, mainnet-sized state, warm caches — and reporting percentiles against a measured noise floor rather than one average.",
    sections: [
      {
        heading: "Choosing the load",
        paragraphs: [
          "A single-method load measures one code path: sending `eth_getBlockByNumber` for `latest` thousands of times a second mostly measures a [[caching|cache]], since every request asks for the same block. Production serves a [[rpc-workloads|mix]] of head reads, [[eth-call|eth_call]] reading uncached storage, [[eth-get-logs|eth_getLogs]] ranges and occasional [[trace-api|traces]], and the expensive minority sets capacity. Realistic mixes come from a [[rpc-gateway|gateway]] request log replayed in order or from a generator such as ethspam, which emits read-only queries around the latest block. Replayed `latest` calls read different state each run, so pin block numbers to make results reproducible.",
          "State size matters as much as the mix. A [[local-devnet|local devnet]] or a [[kurtosis|Kurtosis]] network starts from a small genesis state that fits in memory, so every storage read is a RAM hit; mainnet state is far larger than RAM, so an uncached storage value is a random read from the SSD, the read [[node-hardware|node hardware]] is sized for. The node should also follow the chain, since importing each new block competes with RPC for disk and CPU; a node cut off from the network looks faster than production ever will. For a [[rpc-provider|provider]], network distance is often most of the latency, so measure from where the application runs.",
        ],
      },
      {
        heading: "Open loop, closed loop, coordinated omission",
        paragraphs: [
          "A closed-loop generator runs a fixed set of workers, each sending its next request only after the previous answer, as k6's `constant-vus` executor does. When the server slows, the workers wait, the request rate falls, and the slow period is barely sampled; this is called coordinated omission. An open-loop generator sends on a schedule regardless: k6's `constant-arrival-rate`, vegeta's `-rate`, and flood, which runs vegeta underneath. wrk2 times each request from when it should have been sent: in its README, one 1.4-second stall during a 2,000-request-per-second run puts the corrected p99, the latency 99% of requests beat, at 1.27 s against 6.04 ms uncorrected.",
          "The generator can be the bottleneck: a load machine short of CPU or sockets reports its own queueing as server latency, so watch its CPU and k6's `dropped_iterations`, which counts iterations skipped for lack of a free worker (a virtual user). Judge success on the body, not the status: a node returns [[rpc-errors|JSON-RPC errors]] such as `execution reverted` or `missing trie node` inside an HTTP 200 response, and vegeta counts any 200 as a success. flood's `--deep-check` covers this, checking that every body is well-formed JSON without an error and reporting failures separately.",
        ],
      },
      {
        heading: "Reading the numbers",
        paragraphs: [
          "Report latency per method as percentiles, such as p50 (the median) and p99, plus the maximum. RPC latency is skewed, so a mean of 8 ms can hide a p99 of 400 ms from cold reads. Capacity is a saturation curve, not one number. Step the offered rate, what the generator sends, for example with flood's `--rates 100 200 400 800 1600`, and plot the achieved rate, what the node answers, and p99 against it; the knee is where achieved stops tracking offered. Discard the warm-up: after a restart caches are cold and the .NET and JVM runtimes of [[nethermind|Nethermind]] and [[besu|Besu]] still compile hot code, so measure once successive intervals agree.",
          "Then measure the noise. An A/A run compares two identical builds; their spread is the smallest difference the setup can resolve, and an A/B result, build A against a changed build B, means nothing inside it. Interleave runs in A, B, B, A order so slow drift, such as the database's background compaction, lands on both builds equally.",
        ],
      },
      {
        heading: "Checking the answers",
        paragraphs: [
          "A fast wrong answer is worse than a slow right one, so diff the responses too. flood's `--equality` mode checks that two nodes answer identically, and Infura's versus runs one request stream against several endpoints, comparing bodies, status and timing; its README notes many mismatches are only key order, formatting or extra fields, so normalise first. Pin the block for every diffed request: at `latest`, two healthy nodes one block apart disagree and both are right, which is [[head-lag|head lag]], not a bug.",
          "Conformance tests cover the other half. The [[execution-apis|execution-apis]] repository keeps recorded requests and responses against a small fixed chain, and [[hive|hive]]'s `rpc-compat` simulator replays them against the major clients, checking that each returns the recorded values over [[json-rpc|JSON-RPC]]. That catches shape and encoding bugs on tiny state; a diffing mainnet benchmark catches what only real state exposes.",
        ],
      },
    ],
    example: {
      title: "An A/A saturation run, read step by step",
      language: "text",
      code: "# 1. the same build on two identical machines, both following mainnet;\n#    open-loop eth_call load at five offered rates, 60 s each, bodies checked\nflood eth_call a=http://10.0.0.11:8545 b=http://10.0.0.12:8545 \\\n  --rates 100 200 400 800 1600 --duration 60 --deep-check\n\n# 2. summary, abridged to one row per offered rate\noffered   achieved a / b   p50 ms a / b   p99 ms a / b   failed a / b\n  100       100 / 100        3.9 / 4.0      12 / 13      0% / 0%\n  200       200 / 200        4.1 / 4.1      14 / 15      0% / 0%\n  400       400 / 400        4.8 / 5.0      22 / 24      0% / 0%\n  800       797 / 798        9.6 / 9.1      88 / 81      0% / 0%\n 1600      1140 / 1090       690 / 760    3900 / 4300    2.4% / 3.1%\n\n# 3. reading it\n#  below the knee identical code differs by up to 9% at p99 (22 vs 24 ms at 400):\n#    an A/B gap smaller than that is noise\n#  the knee lies between 800 and 1600: achieved stops tracking offered\n#  capacity at a 100 ms p99 target is about 800 req/s for this mix and this state\n#  a closed loop of 50 workers would settle near 1,100 req/s at about 45 ms each\n#    (50 / 1,100 s, Little's law) and never show the queue that open-loop users meet",
      note: "The two nodes run identical code, so every difference in the table is noise; only after that spread is known does a run comparing two different builds mean anything.",
    },
    pitfalls: [
      "Quoting a closed-loop tool's latency as what users see under load, when its workers waited out the slow periods.",
      "Counting every HTTP 200 as a success while the bodies carry reverts, `missing trie node` or other JSON-RPC errors.",
      "Measuring capacity on a small-genesis devnet and quoting it for a mainnet node.",
      "Calling a 2% change a regression without an A/A run showing the setup can resolve 2%.",
    ],
    related: ["rpc-workloads", "observability", "node-hardware", "hive", "execution-apis", "caching", "head-lag", "rpc-errors", "local-devnet", "client-diversity"],
    sources: [
      { title: "paradigmxyz/flood: load testing for EVM nodes", url: "https://github.com/paradigmxyz/flood" },
      { title: "Grafana k6: open and closed models", url: "https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/" },
      { title: "wrk2: constant-throughput load and coordinated omission", url: "https://github.com/giltene/wrk2" },
      { title: "hive: rpc-compat simulator", url: "https://github.com/ethereum/hive/tree/master/simulators/ethereum/rpc-compat" },
    ],
  },
  {
    id: "rpc-privacy",
    title: "What an RPC endpoint learns about you",
    category: "operations",
    aliases: ["RPC privacy", "read privacy", "wallet privacy", "address linking", "private information retrieval", "PIR"],
    summary: "Every RPC request tells the endpoint's operator who is asking, through the source IP address, and what about, through the addresses, contracts and transactions in its parameters, so the operator can link one user's accounts, see their holdings, and tie a sent transaction to a network location.",
    sections: [
      {
        heading: "What one session gives away",
        paragraphs: [
          "Each request arrives with a source IP address, often an API key, and, from a web page, an `Origin` header naming the site. Parameters name the subject: [[eth-get-balance|eth_getBalance]] carries the address, an [[eth-call|eth_call]] to a token's `balanceOf` carries it inside the [[abi|ABI-encoded]] calldata, and an [[eth-get-logs|eth_getLogs]] filter for transfers to a user carries it as a [[event-signature|topic]] padded to 32 bytes. The endpoint cannot answer without reading it.",
          "Linking is the larger leak. A wallet that refreshes three accounts' balances in one [[batch-request|batch]] or one [[multicall|Multicall3]] call from one IP tells the operator the accounts belong together, even if they never transacted with each other. Sending is stronger still: [[eth-send-raw-transaction|eth_sendRawTransaction]] carries a signed transaction, and the sender's address can be recovered from its [[ecdsa-signature|signature]], so the operator learns the IP behind an address, usually seconds after [[eth-get-transaction-count|eth_getTransactionCount]] at `pending` and an [[eth-estimate-gas|eth_estimateGas]] call that named the recipient and amount.",
        ],
      },
      {
        heading: "Defaults and stated policies",
        paragraphs: [
          "Many users never choose an endpoint. MetaMask's privacy notice names Infura as the RPC provider the wallet uses by default; a user can add another RPC URL for a network and make it the default. In December 2022 Consensys, which runs both, stated that it does not store wallet addresses for read requests made through Infura, that it collects wallet and IP addresses for write requests but stores them apart, and that it was working on narrowing retention to seven days. The current notice gives no retention period for either. A policy governs storage, not visibility: every read still passes through the operator.",
          "The wallet's endpoint is rarely the only observer. A dapp sends its own reads to an endpoint it chose ([[dapp-architecture|dapp architecture]]), so a second operator sees the same address with the site attached. [[ens|ENS]] lookups reveal the names a user resolves, and a name that uses [[ccip-read|CCIP-Read]] sends the query on to a gateway chosen by the resolver contract. Wallet backends that fetch prices, token lists or [[address-history|address history]] for an account are observers too.",
        ],
      },
      {
        heading: "Mitigations, and what each one hides",
        paragraphs: [
          "A [[self-hosting|self-hosted node]] keeps reads local, though when it broadcasts a transaction it is necessarily the first peer to announce it over [[devp2p|devp2p]]. Tor or a VPN hides the IP but not the linking: one session that refreshes every account still ties them together, so keeping accounts apart takes a separate Tor circuit and session for each. Splitting traffic across [[rpc-provider|providers]] leaves each operator a fragment; Vitalik Buterin's April 2025 privacy roadmap proposes several endpoints, ideally one per dapp, optionally reached through a mixnet, which delays and shuffles messages so they cannot be traced to a sender.",
          "Verification is not privacy. [[helios|Helios]] and other [[verified-rpc|verified RPC]] setups check answers with [[eth-get-proof|eth_getProof]], so the provider still receives the address. For an `eth_call`, which Helios re-executes locally, the provider receives an [[eth-create-access-list|eth_createAccessList]] for the same call plus a proof request for every account the call touches. Hiding the question itself needs a trusted execution environment (TEE), a hardware enclave whose operator cannot read the computation, which the roadmap suggests for the short term, or private information retrieval (PIR), where the server answers without learning which record was asked, which the roadmap calls not yet efficient for large datasets.",
        ],
      },
      {
        heading: "Reading everything on purpose",
        paragraphs: [
          "Privacy applications avoid the leak by asking questions whose answers are the same for every user. A RAILGUN wallet fetches the pool contract's data to rebuild its Merkle trees and tries to decrypt every note, an encrypted record of value, to find its own balance, so the provider sees a download any wallet would make (by default much of it comes through QuickSync, a [[the-graph|subgraph]], whose indexer gets the same view). ERC-5564 stealth addresses, a fresh address per payment that only the recipient can recognise, work the same way: recipients scan every `Announcement` event from the announcer at `0x55649E01B5Df198D18D95b5cc5051630cfD45564`. A one-byte view tag lets them discard about 255 of every 256 after one elliptic-curve multiplication and one hash.",
          "The cost is bandwidth, and the protection is partial: timing, deposit and withdrawal amounts, and the endpoint used to submit still leak, and a wallet that also checks the user's public balance through the same endpoint undoes the effort. This differs from [[private-rpc|private transaction RPC]], which keeps a transaction out of the public [[mempool|mempool]] until it is included; the private endpoint still sees the sender's IP and the full transaction, and hides nothing about the queries made before it.",
        ],
      },
    ],
    example: {
      title: "One wallet session as the endpoint's log records it",
      language: "text",
      code: "source 203.0.113.7, one HTTPS connection, wallet holding accounts 0x4a1F…09c3 and 0x9e27…b81d\n\n1. t+0.00 s  eth_chainId\n             learns nothing about the user\n2. t+0.02 s  batch [ eth_getBalance(0x4a1F…09c3, latest), eth_getBalance(0x9e27…b81d, latest) ]\n             two addresses from one IP in one request: they belong together\n3. t+0.05 s  eth_call to 0xcA11bde05977b3631167028862bE2a173976CA11 (Multicall3), aggregate3:\n             balanceOf(0x4a1F…09c3) and balanceOf(0x9e27…b81d) on USDC, WETH and DAI\n             the token holdings of both accounts\n4. t+9.40 s  eth_getTransactionCount(0x9e27…b81d, pending)\n             which account is about to act\n5. t+9.45 s  eth_estimateGas({from: 0x9e27…b81d, to: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48,\n             data: transfer(0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045, 250000000)})\n             recipient and amount, 250 USDC, before anything is signed\n6. t+11.2 s  eth_sendRawTransaction(0x02f8b1…)\n             a signed transaction: sender 0x9e27…b81d, now tied to 203.0.113.7",
      note: "Steps 2 and 3 link the accounts and step 6 locates one of them; routing the session through Tor would change the source address in every line and remove none of the linking.",
    },
    pitfalls: [
      "Reading a provider's promise not to store read requests as a promise that the reads were never seen.",
      "Refreshing every account in one batch, which links them for the operator even over Tor.",
      "Treating a light client or verified RPC as a privacy measure; it proves the answers and leaves the questions in plain view.",
    ],
    related: ["rpc-provider", "self-hosting", "private-rpc", "helios", "verified-rpc", "dapp-architecture", "security", "ccip-read", "portfolio-tracker", "rpc-workloads"],
    sources: [
      { title: "MetaMask privacy notice", url: "https://metamask.com/privacy-notice" },
      { title: "Consensys: data retention update for MetaMask and Infura", url: "https://consensys.com/blog/consensys-data-retention-update" },
      { title: "A maximally simple L1 privacy roadmap", url: "https://ethereum-magicians.org/t/a-maximally-simple-l1-privacy-roadmap/23459" },
      { title: "ERC-5564: Stealth Addresses", url: "https://eips.ethereum.org/EIPS/eip-5564" },
    ],
  },
];
