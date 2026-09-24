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
          "Most providers also sell things no [[execution-client|execution client]] implements: token balance and NFT endpoints, decoded transaction history for an [[address|address]], webhook streams, and mempool feeds. These are convenient and completely non-portable. Code written against them cannot be pointed at your own node or a different provider without a rewrite, so keep them behind an interface of your own if you may ever move.",
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
          "Privacy is the quieter cost. The provider sees your IP address, your API key, every address you query, every contract you read, and every transaction you submit before the network does. Wallets that use one default endpoint leak their users' whole address graph to one company. Submission is also a control point: a provider can drop or delay an [[eth-send-raw-transaction|eth_sendRawTransaction]], and a provider outage takes your application with it unless you have a second path.",
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
      "Benchmarking a provider against your own node on latency alone; a provider's edge cache can answer faster and still be a block behind.",
    ],
    related: ["self-hosting", "endpoint-capabilities", "rate-limits", "load-balancer", "authentication", "caching", "verified-rpc", "private-rpc", "json-rpc"],
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
          "Capability is the practical reason. On your own node there are no compute units, no [[eth-get-logs|eth_getLogs]] range cap other than the one you set, no batch length limit, and no plan tier gating [[debug-api|debug_]] tracing, [[trace-api|trace_]] replays, [[txpool-api|txpool_]] inspection, or long-lived [[eth-subscribe|subscriptions]]. Heavy [[indexer|indexing]] and simulation workloads are usually cheaper on owned hardware than on metered compute units.",
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
    related: ["rpc-provider", "full-node", "node-hardware", "health-check", "rpc-gateway", "security", "archive-node", "engine-api"],
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
    related: ["load-balancer", "caching", "failover", "head-lag", "rate-limits", "observability", "reverse-proxy", "rpc-provider", "retries"],
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
          "Pin the block. Resolve `latest` once, then pass that explicit number, or an EIP-1898 `{\"blockHash\": …, \"requireCanonical\": true}` object, to every call that must agree. A node that does not have that block fails loudly with 'header not found' instead of silently answering from an older one, which is the behavior you want.",
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
    related: ["load-balancer", "health-check", "rpc-gateway", "block-tag", "reorg", "failover", "eth-syncing", "indexer", "confirmations"],
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
    aliases: ["fallback endpoint", "upstream switching", "circuit breaker", "split brain"],
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
          "Failing back needs the same care. Use a cooldown and a half-open probe rather than returning to the primary the instant one health check passes, and expect the head to appear to move backwards on the switch, so keep the high-water mark described in [[head-lag|head consistency]].",
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
    related: ["retries", "health-check", "load-balancer", "rpc-gateway", "head-lag", "rpc-errors", "chain-id", "endpoint-capabilities", "observability"],
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
          "Throttle yourself first. A client-side token bucket set a little under the published rate, plus a bounded concurrency pool, turns a hard external failure into a soft internal queue. On a range error, halve the [[eth-get-logs|eth_getLogs]] window, retry from the same [[cursor-pagination|cursor]], and grow the window back slowly. Prefer one [[eth-get-block-receipts|eth_getBlockReceipts]] over dozens of single-hash receipt lookups, and [[caching|cache]] everything settled. Combine that with jittered [[retries|backoff]] and with [[failover|failover]] to a second upstream, so a throttled key sheds load instead of hammering.",
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
    related: ["engine-api", "security", "reverse-proxy", "rpc-provider", "rate-limits", "namespaces", "self-hosting", "engine-payload", "rpc-gateway"],
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
          "HTTP has the mirror-image problem. A deep [[debug-api|debug_]] trace or a wide [[eth-get-logs|eth_getLogs]] scan can outlast a default proxy timeout, and the caller gets a 504 while the node keeps working on a query nobody will read. Set the proxy timeout above the slowest query you intend to allow, and bound the queries themselves rather than letting the proxy be the limit.",
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
    aliases: ["hardening", "open node", "DNS rebinding", "CORS", "http.vhosts", "corsdomain", "exposed RPC"],
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
          "`--http.addr 127.0.0.1` is the default for a reason. A node bound to `0.0.0.0` on a public address is found by scanners within hours, and surveys of open [[json-rpc|JSON-RPC]] ports are a standing hobby. Binding to loopback is not the end of it, because of DNS rebinding: a page on an attacker's domain can make the browser resolve that domain to `127.0.0.1` and then send same-origin requests to your node. `--http.vhosts` is the defense, an allow-list on the `Host` header that defaults to `localhost`.",
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
    related: ["namespaces", "authentication", "reverse-proxy", "admin-api", "debug-api", "txpool-api", "self-hosting", "rate-limits", "eth-send-transaction", "geth", "nethermind"],
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
    related: ["health-check", "head-lag", "rpc-gateway", "eth-syncing", "engine-api", "failover", "geth", "nethermind", "lighthouse", "block-tag", "rate-limits"],
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
    summary: "An endpoint's capabilities are the things it can actually answer — archive depth, tracing namespaces, subscriptions, proofs, simulation, and the limits layered on top — none of which are advertised, so they have to be probed.",
    sections: [
      {
        heading: "Why you cannot assume",
        paragraphs: [
          "The [[execution-apis|execution-apis specification]] defines what methods mean, not which ones an operator has enabled. Four independent things vary behind any URL: the [[execution-client|client]] and its version, which decides whether [[eth-simulate|eth_simulateV1]] or a given tracer exists at all; the enabled [[namespaces|namespaces]]; the retention, which decides how far back [[eth-call|eth_call]] and [[eth-get-proof|eth_getProof]] can go; and the [[rate-limits|limits]] the operator adds on ranges, batches, and connections. Two URLs from the same [[rpc-provider|provider]] often differ on all four.",
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
    related: ["rpc-provider", "rpc-errors", "archive-node", "eth-get-proof", "eth-simulate", "trace-api", "debug-api", "rate-limits", "rpc-gateway", "net-web3-api", "health-check"],
    sources: [
      { title: "Ethereum execution APIs", url: "https://github.com/ethereum/execution-apis" },
      { title: "Execution API documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "EIP-1474: Remote procedure call specification", url: "https://eips.ethereum.org/EIPS/eip-1474" },
    ],
  },
  {
    id: "private-rpc",
    title: "Private transaction RPC",
    category: "operations",
    aliases: ["Flashbots Protect", "MEV Blocker", "eth_sendPrivateTransaction", "eth_sendBundle", "private mempool", "order flow"],
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
          "`eth_sendPrivateTransaction` takes an object rather than a bare hex string: `tx` with the signed bytes, an optional `maxBlockNumber` after which the attempt expires, and `preferences` for things like fast mode. It returns the same transaction hash [[eth-send-raw-transaction|eth_sendRawTransaction]] would. `eth_sendBundle` goes further and submits an ordered list of raw transactions with a target `blockNumber`, optional timestamp bounds, and `revertingTxHashes` naming the ones allowed to fail. The list is included together, in that order, in one [[block|block]], or not at all.",
          "Atomicity is where revert protection comes from: a bundle that would fail is simply not included, so no [[gas|gas]] is spent on a losing attempt. Bundles target a single block, so a strategy spanning several slots resubmits once per block. Requests to the Flashbots relay carry an `X-Flashbots-Signature` header signed with any Ethereum key as a reputation identity, which should never be the key holding the funds.",
        ],
      },
      {
        heading: "What you trade away",
        paragraphs: [
          "Inclusion becomes slower and conditional. Only a block built by a participating builder can carry the transaction, so it waits for a slot whose proposer took a block from that builder, and a transaction that never gets one simply expires. Meanwhile [[eth-get-transaction-by-hash|eth_getTransactionByHash]] on any public node returns `null` for the whole wait, which breaks the usual 'is it in the pool yet' check; poll the private endpoint or wait for a [[transaction-receipt|receipt]].",
          "The endpoint is also a trusted intermediary that can delay, drop, or observe your flow, and a builder is still free to place profitable transactions around yours. For ordinary transfers the public pool is fine; private submission earns its complexity on swaps, liquidations, large approvals, and anything where the ordering itself is worth money.",
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
    related: ["mev", "mempool", "eth-send-raw-transaction", "mev-boost", "eth-get-transaction-by-hash", "block-proposal", "rpc-provider", "devp2p", "transaction-receipt", "nonce"],
    sources: [
      { title: "Flashbots documentation", url: "https://docs.flashbots.net/" },
      { title: "ethereum.org: Maximal extractable value (MEV)", url: "https://ethereum.org/developers/docs/mev/" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
];
