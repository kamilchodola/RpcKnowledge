// Category: Foundations — what RPC is, how JSON-RPC is framed and transported,
// and how Ethereum's two layers expose their interfaces.

export const topics = [
  {
    id: "ethereum-rpc",
    title: "Ethereum RPC",
    category: "foundations",
    aliases: ["ethereum api", "node api", "start here", "rpc map", "ethereum interfaces", "what is ethereum rpc"],
    summary: "Ethereum RPC is the family of interfaces a program uses to talk to an Ethereum node: the [[execution-layer|execution layer]]'s [[json-rpc|JSON-RPC]] API, the authenticated [[engine-api|Engine API]] between a node's two clients, the [[consensus-layer|consensus layer]]'s REST [[beacon-api|Beacon API]], and the wallet provider API exposed in browsers.",
    sections: [
      {
        heading: "The four interfaces",
        paragraphs: [
          "The execution JSON-RPC is what most people mean by an Ethereum RPC endpoint. Its methods are grouped into [[namespaces|namespaces]] such as `eth_`, `net_`, and `web3_`, with optional `debug_` and `trace_` extensions, and they read [[block|blocks]], accounts, and [[event-log|logs]], simulate calls with [[eth-call|eth_call]], and accept signed transactions for broadcast. An [[execution-client|execution client]] serves it over [[http-transport|HTTP]], [[websocket-transport|WebSocket]], or a local [[ipc-transport|socket]].",
          "The other three are narrower. The [[engine-api|Engine API]] is private plumbing, by default on port 8551 and authenticated with a shared JWT secret, over which the [[consensus-client|consensus client]] hands [[execution-payload|execution payloads]] to the execution client and names the head, safe, and finalized blocks. The [[beacon-api|Beacon API]] is a REST interface on the consensus side covering slots, validators, [[finality|finality]] checkpoints, and blob sidecars. The [[eip-1193|EIP-1193 provider]] is the JavaScript object a browser wallet exposes to a page, which calls `window.ethereum.request` and lets the wallet decide which node answers.",
        ],
      },
      {
        heading: "What sits behind an endpoint",
        paragraphs: [
          "An endpoint is not a database with a query language in front of it. Since [[the-merge|the Merge]] a node is two processes: an execution client holding the [[state|world state]] and running the [[evm|EVM]], and a consensus client following [[proof-of-stake|proof of stake]]. Every answer is that one node's view at that moment, which is why two endpoints can disagree about the head without either being broken; see [[head-lag|head consistency across nodes]].",
          "That also sets the trust model. A plain JSON-RPC result is an assertion by whoever runs the node, not a proof. Some answers can be checked rather than believed, by verifying a [[state-proof|state proof]] against a header you already trust, which is what a [[light-client|light client]] does. Most callers accept the assertion and reduce risk by cross-checking two [[rpc-provider|providers]] instead.",
        ],
      },
      {
        heading: "How to read this map",
        paragraphs: [
          "Every term worth explaining is its own node, and each node explains exactly one thing and links out for the rest. Start with [[rpc|remote procedure call]], then [[json-rpc|the execution JSON-RPC]] as a whole, and keep [[hex-encoding|hex encoding]] and [[block-tag|block identifiers and tags]] close by, because nearly every method uses both.",
          "Each category has an entry point. The data structures behind every answer start at [[block|the block]]. The software that serves RPC starts at [[execution-client|execution client]], and deployment shapes at [[full-node|full node]]. The consensus side starts at [[proof-of-stake|proof of stake]]. Turning chain data into queries starts at [[indexer|indexer]], and checking answers instead of trusting them at [[state-proof|state proof]]. Layer 2 starts at [[rollup|rollup]], running or buying RPC in production at [[rpc-provider|RPC provider]], and the application side at [[dapp-architecture|dapp architecture]].",
        ],
      },
    ],
    example: {
      title: "Three interfaces, three very different calls",
      language: "bash",
      code: "# execution JSON-RPC: what applications call\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_chainId\",\"params\":[]}' \\\n  https://rpc.example\n\n# Beacon API: REST on the consensus client\ncurl -s http://127.0.0.1:5052/eth/v1/node/syncing\n\n# Engine API: node-to-node only, needs a JWT bearer token\ncurl -s -X POST -H 'content-type: application/json' \\\n  -H 'authorization: Bearer <jwt signed with the shared secret>' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"engine_exchangeCapabilities\",\"params\":[[]]}' \\\n  http://127.0.0.1:8551",
      note: "The first is for applications, the second for stakers and explorers, and the third only for the two halves of one node talking to each other.",
    },
    pitfalls: [
      "Assuming every endpoint answers every method; tracing, historical state, and subscriptions are all optional, so probe [[endpoint-capabilities|what the endpoint supports]] before depending on it.",
      "Exposing the Engine API port publicly because it looks like ordinary JSON-RPC; it decides which block your node builds on and must stay authenticated and local.",
      "Mixing answers from two endpoints into one snapshot; pass an explicit block number or hash when several reads have to agree with each other.",
    ],
    quiz: [
      {
        question: "Which interface does a consensus client use to tell an execution client which block is the head of the chain?",
        options: [
          "The Engine API, on a separate authenticated port",
          "The public eth_ JSON-RPC, via eth_blockNumber",
          "The Beacon API, over REST",
          "The devp2p eth protocol",
        ],
        answer: 0,
      },
      {
        question: "A dapp frontend and a staking dashboard each need an endpoint. Which pairing is correct?",
        options: [
          "Dapp: execution JSON-RPC. Staking dashboard: Beacon API",
          "Dapp: Beacon API. Staking dashboard: Engine API",
          "Dapp: Engine API. Staking dashboard: execution JSON-RPC",
          "Both should use the Engine API, since it is the authenticated one",
        ],
        answer: 0,
      },
      {
        question: "Two RPC endpoints on the same network return different answers to the same call at the same moment. What is the most likely explanation?",
        options: [
          "They are at different chain heads and each answered from its own current view",
          "One of them computed an invalid state root",
          "JSON-RPC does not define deterministic results for reads",
          "One of them is serving a different chain id, which is the only way this happens",
        ],
        answer: 0,
      },
    ],
    related: ["rpc", "json-rpc", "block", "execution-client", "full-node", "proof-of-stake", "indexer", "state-proof", "rollup", "rpc-provider", "dapp-architecture"],
    sources: [
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
    ],
  },
  {
    id: "rpc",
    title: "Remote procedure call",
    category: "foundations",
    aliases: ["rpc", "remote procedure call", "rpc vs rest", "procedure call"],
    summary: "A remote procedure call is a request that makes a named operation run inside another process with the arguments you supply and hands back its result, so talking to a node looks like calling a function rather than fetching a document.",
    sections: [
      {
        heading: "What RPC means",
        paragraphs: [
          "In an RPC style the unit of the interface is a verb: a method name, its arguments, and a result. [[eth-get-balance|eth_getBalance]] with an [[address|address]] and a [[block-tag|block identifier]] is a function call that happens to execute on someone else's machine. REST puts nouns first instead: resources live at URL paths and are manipulated with a small fixed set of HTTP verbs. Ethereum chose the verb-first shape, and [[json-rpc|JSON-RPC 2.0]] supplies the wire format.",
          "Any RPC system needs four things: a method namespace, a serialization for arguments and results, a transport, and an error channel. Ethereum's answers are [[namespaces|prefixed method names]], JSON with [[hex-encoding|hex-encoded]] numbers and byte strings, [[http-transport|HTTP]], [[websocket-transport|WebSocket]] or [[ipc-transport|IPC]], and a JSON [[rpc-errors|error object]] carried inside an otherwise successful HTTP response.",
        ],
      },
      {
        heading: "Why a node exposes verbs",
        paragraphs: [
          "Node operations do not map cleanly onto resources. [[eth-call|eth_call]] runs the [[evm|EVM]] over a hypothetical transaction against a chosen [[state|state]]; [[eth-estimate-gas|eth_estimateGas]] executes repeatedly to search for a gas amount; [[eth-send-raw-transaction|eth_sendRawTransaction]] hands signed bytes to a [[mempool|transaction pool]] and a gossip network. None of those is a GET or a PUT on a document. A verb list also lets a client add `debug_traceTransaction` without redesigning a URL hierarchy.",
          "The cost is that HTTP semantics stop describing the work. Every call is a POST to one URL, so caches, proxies, and browsers cannot distinguish a cheap read from an expensive trace, and an [[rpc-gateway|RPC gateway]] must parse the JSON body before it can route, [[caching|cache]], or count anything. It also means the method list rather than the URL space is the security boundary; see [[security|RPC security]].",
        ],
      },
      {
        heading: "What 'remote' hides",
        paragraphs: [
          "A local function either returns or throws. A remote one can also time out, be answered by a different machine behind a [[load-balancer|load balancer]], or succeed on the server while the response is lost on the way back. A timed-out `eth_sendRawTransaction` may already have broadcast the transaction, so resending is safe only because the same signed bytes carry the same hash; see [[retries|retries and idempotency]].",
          "The second thing it hides is that the callee is a chain with a moving head. Two identical calls a second apart can legitimately differ, and a call routed to a lagging node returns `null` for a [[transaction-receipt|receipt]] that already exists elsewhere; see [[head-lag|head consistency across nodes]]. [[client-libraries|Client libraries]] hide the transport and the encoding, but they cannot hide this.",
        ],
      },
    ],
    pitfalls: [
      "Treating an RPC method as a pure function; the same call against `latest` samples a moving chain rather than a constant.",
      "Retrying a write the way you retry a read without first checking whether the earlier attempt landed; look the transaction up by hash instead.",
      "Assuming the HTTP status code describes the call; a JSON-RPC error normally arrives inside a `200 OK` response body.",
    ],
    quiz: [
      {
        question: "Why does an RPC gateway have to parse the JSON body of every request before routing it?",
        options: [
          "Because all calls are POSTs to a single URL, so the method name is only visible in the body",
          "Because JSON-RPC requires a signature over the body",
          "Because HTTP forbids routing on headers",
          "Because the block number appears only in the URL query string",
        ],
        answer: 0,
      },
      {
        question: "Which failure is possible with a remote call but not with a local function call?",
        options: [
          "The operation succeeds but the caller never learns the result",
          "The operation raises an exception",
          "The operation returns a wrong value because of a bug",
          "The operation runs out of memory",
        ],
        answer: 0,
      },
      {
        question: "What is the main reason Ethereum's node interface is verb-first rather than REST-style?",
        options: [
          "Most node operations are computations, such as simulating a call, not reads of a stored resource",
          "JSON cannot be transferred over REST endpoints",
          "REST cannot express hexadecimal values",
          "RPC is the only style that works over WebSocket",
        ],
        answer: 0,
      },
    ],
    related: ["json-rpc", "request-response", "http-transport", "rpc-errors", "namespaces", "client-libraries", "retries", "head-lag"],
    sources: [
      { title: "JSON-RPC 2.0 Specification", url: "https://www.jsonrpc.org/specification" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "json-rpc",
    title: "Ethereum JSON-RPC",
    category: "foundations",
    aliases: ["eth json-rpc", "execution api", "eth_ methods", "node api", "json rpc 2.0"],
    summary: "The Ethereum JSON-RPC API is the [[execution-layer|execution layer]]'s application-facing interface: a set of [[namespaces|namespaced]] methods framed as [[request-response|JSON-RPC 2.0]] objects with [[hex-encoding|hex-encoded]] values, specified in the [[execution-apis|execution-apis]] repository and served over HTTP, WebSocket, or IPC.",
    sections: [
      {
        heading: "What the API covers",
        paragraphs: [
          "The `eth_` namespace does five jobs. It returns chain data ([[eth-get-block-by-number|eth_getBlockByNumber]], [[eth-get-transaction-by-hash|eth_getTransactionByHash]], [[eth-get-transaction-receipt|eth_getTransactionReceipt]], [[eth-get-logs|eth_getLogs]]). It reads [[state|world state]] at a [[block-tag|block identifier]] ([[eth-get-balance|eth_getBalance]], [[eth-get-code|eth_getCode]], [[eth-get-storage-at|eth_getStorageAt]], [[eth-get-transaction-count|eth_getTransactionCount]], [[eth-get-proof|eth_getProof]]). It simulates execution ([[eth-call|eth_call]], [[eth-estimate-gas|eth_estimateGas]], [[eth-simulate|eth_simulateV1]]). It prices transactions ([[eth-gas-price|eth_gasPrice]], [[eth-fee-history|eth_feeHistory]]). And it accepts writes, of which there is essentially one: [[eth-send-raw-transaction|eth_sendRawTransaction]].",
          "Around that sit the small service namespaces. [[net-web3-api|net_ and web3_]] report peer count, listening state, and `web3_clientVersion`; [[eth-syncing|eth_syncing]] and [[chain-id|eth_chainId]] answer the questions a [[health-check|health check]] asks. Push-style access comes from [[eth-subscribe|eth_subscribe]] over a WebSocket, or from server-side [[eth-filters|polling filters]].",
        ],
      },
      {
        heading: "Standard, de facto, and client-specific",
        paragraphs: [
          "Only part of what an endpoint offers is specified. The [[execution-apis|execution-apis]] repository defines `eth_`, `net_`, `web3_`, and the [[engine-api|Engine API]] as OpenRPC schemas. Everything else is convention: `debug_` follows [[geth|Geth]]'s shape, the [[trace-api|trace_ namespace]] follows Parity's and is implemented by [[nethermind|Nethermind]], [[erigon|Erigon]], and [[reth|Reth]], [[txpool-api|txpool_]] and [[admin-api|admin_]] differ per client, and `personal_` is deprecated in favour of external signers. Hosted [[rpc-provider|providers]] add their own enhanced methods on top.",
          "Even standard methods differ in behaviour. Nodes cap the gas an `eth_call` may consume, limit how many blocks [[eth-get-logs|eth_getLogs]] may span, disagree on what `pending` includes, and word their error messages differently. Portable code therefore treats [[endpoint-capabilities|endpoint capabilities]] as something to probe, not assume, starting with `web3_clientVersion`.",
        ],
      },
      {
        heading: "Framing and encoding",
        paragraphs: [
          "A request is a JSON object with `jsonrpc`, `method`, `params`, and `id`; the response carries the same `id` and either `result` or an [[rpc-errors|error object]]. Parameters are positional arrays, and Ethereum does not use JSON-RPC's named-parameter form. Integers travel as QUANTITY strings such as `0x1a4`, byte strings as fixed-width DATA such as a 20-byte [[address|address]], and a read method's last parameter is usually the block identifier. Several requests can share one round trip as a [[batch-request|batch]].",
          "Nothing in JSON is typed, so the [[hex-encoding|encoding rules]] carry the meaning. A balance is a hex string that must be parsed as a big integer, never as a JavaScript number, and a missing object is `null` rather than an error.",
        ],
      },
      {
        heading: "Where the specification stops",
        paragraphs: [
          "The spec describes methods, not deployments. [[authentication|Authentication]], TLS, CORS rules, [[rate-limits|rate limits]], batch size caps, block range caps, response size caps, and whether WebSocket exists at all are operator choices. Two endpoints can both be correct and still behave differently under load, which is why production callers build in [[retries|retries]], [[failover|failover]], and awareness of [[head-lag|head lag]].",
        ],
      },
    ],
    example: {
      title: "A minimal request and its response",
      language: "bash",
      code: "curl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBalance\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"latest\"]}' \\\n  https://rpc.example\n\n# {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x1b1ae4d6e2ef500000\"}",
      note: "The result is wei as a hex QUANTITY: parse it with a big-integer type, and remember the answer is only true for the block that was `latest` at that instant.",
    },
    pitfalls: [
      "Parsing a QUANTITY result with a 64-bit float; balances and wei values exceed `Number.MAX_SAFE_INTEGER` and silently lose precision.",
      "Assuming a method exists everywhere; `trace_`, `debug_`, and `eth_simulateV1` are absent or disabled on many endpoints and return method-not-found.",
      "Writing code against one provider's block-range and batch limits, then discovering another provider enforces stricter ones.",
      "Expecting an error when an object is unknown; unknown blocks, transactions, and receipts come back as `null` inside a successful response.",
    ],
    quiz: [
      {
        question: "Which of these is defined by the execution-apis specification rather than by client convention?",
        options: [
          "eth_getLogs",
          "debug_traceTransaction",
          "trace_replayBlockTransactions",
          "txpool_content",
        ],
        answer: 0,
      },
      {
        question: "An endpoint returns a successful HTTP 200 with the body {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":null} for eth_getTransactionReceipt. What does that mean?",
        options: [
          "This node does not know of that transaction in a block yet",
          "The transaction reverted during execution",
          "The request was malformed and the node ignored it",
          "The node is not synced and refuses to answer",
        ],
        answer: 0,
      },
      {
        question: "Why do two correctly implemented endpoints still behave differently for the same eth_getLogs query?",
        options: [
          "Block range caps, response size caps, and rate limits are deployment choices the spec does not fix",
          "The log encoding differs between clients",
          "Topic filters are interpreted differently by each client",
          "Logs are stored only by the client that produced the block",
        ],
        answer: 0,
      },
    ],
    related: ["request-response", "namespaces", "execution-apis", "hex-encoding", "block-tag", "rpc-errors", "http-transport", "eth-call", "endpoint-capabilities", "execution-layer"],
    sources: [
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "JSON-RPC 2.0 Specification", url: "https://www.jsonrpc.org/specification" },
    ],
  },
  {
    id: "request-response",
    title: "JSON-RPC envelope",
    category: "foundations",
    aliases: ["jsonrpc 2.0", "request object", "response object", "id matching", "params", "notification"],
    summary: "Every execution-layer call travels as a JSON object with `jsonrpc`, `method`, `params`, and `id`, and comes back as an object carrying the same `id` plus exactly one of `result` or `error`.",
    sections: [
      {
        heading: "The request object",
        paragraphs: [
          "Four members make a request. `jsonrpc` must be the string `\"2.0\"`; servers reject `1.0` or a missing version with `-32600`. `method` is the full name including its [[namespaces|namespace prefix]], such as `eth_getBlockByNumber`, and it is case sensitive. `params` is an array of positional arguments; JSON-RPC 2.0 also allows a named-parameter object, but Ethereum methods are specified positionally and clients generally reject the object form. `id` is a string or number chosen by the caller.",
          "Optional trailing parameters are positional too, so you cannot skip one. `eth_getBlockByNumber` takes `[\"0x12d4f1c\", false]` and the boolean is mandatory in practice; [[eth-call|eth_call]]'s [[state-override|state override]] object can only be passed as a third element after the [[block-tag|block identifier]]. Sending `[]` where a method expects arguments produces `-32602`, invalid params.",
        ],
      },
      {
        heading: "The response object",
        paragraphs: [
          "A response echoes `jsonrpc` and `id` and carries `result` or `error`, never both. `result` may be any JSON value, including `null`, which Ethereum uses for 'this object does not exist here': an unknown [[block|block]], an unmined [[transaction-receipt|receipt]], a [[reorg|reorged]] transaction. `error` is an object with `code`, `message`, and optional `data`; see [[rpc-errors|JSON-RPC errors]] for what the codes mean.",
          "The envelope is independent of [[http-transport|HTTP]]. An error object normally arrives inside a `200 OK` body, so code that branches on the HTTP status alone will treat a failed call as a success and then read `undefined` from the missing `result` field.",
        ],
      },
      {
        heading: "Ids, notifications, and matching",
        paragraphs: [
          "The `id` exists so responses can be matched to requests when several are in flight. Over [[http-transport|HTTP]] that rarely matters, because each POST carries one body, but over a [[websocket-transport|WebSocket]] many calls share one socket and frames come back in whatever order the server finishes them, so a client must keep a map from `id` to pending promise. [[batch-request|Batches]] have the same requirement, since array order is not guaranteed to match.",
          "A request with no `id` member is a notification: the server must not reply. Ethereum does not use notifications for calls, but the server-to-client direction does something similar. An [[eth-subscribe|eth_subscribe]] update arrives as a `method: \"eth_subscription\"` object with a `params` member holding `subscription` and `result`, and no `id` at all, so a client must route on the subscription id rather than on request matching.",
          "Ids are the caller's to choose and mean nothing to the node. Reusing the same `id` for every request works over HTTP and breaks over a WebSocket or in a batch, because two answers then look identical. Using an incrementing counter per connection is the usual fix.",
        ],
      },
    ],
    example: {
      title: "Request, success, error, and a subscription push",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBlockByNumber\",\"params\":[\"0x12d4f1c\",false]}\n\n// success\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{\"number\":\"0x12d4f1c\",\"hash\":\"0x9b83c12c…ee71\",\"transactions\":[\"0x5c504ed4…2060\"]}}\n\n// error (same id, no result member)\n{\"jsonrpc\":\"2.0\",\"id\":1,\"error\":{\"code\":-32602,\"message\":\"invalid argument 0: hex string without 0x prefix\"}}\n\n// server push over WebSocket: no id, routed by subscription\n{\"jsonrpc\":\"2.0\",\"method\":\"eth_subscription\",\"params\":{\"subscription\":\"0xcd0c3e8af590364c09d0fa6a1210faf5\",\"result\":{\"number\":\"0x12d4f1d\",\"parentHash\":\"0x9b83c12c…ee71\"}}}",
      note: "Three of these four frames carry an `id`; the fourth is why a WebSocket client needs a second routing table keyed by subscription id.",
    },
    pitfalls: [
      "Branching only on the HTTP status code; a JSON-RPC `error` object usually rides inside a `200 OK` response.",
      "Reusing a constant `id` across concurrent requests on one WebSocket, which makes two in-flight answers indistinguishable.",
      "Omitting a trailing parameter such as the `fullTransactions` boolean; parameters are positional, so there is no way to skip one.",
      "Treating `\"result\": null` as a protocol failure; it is the normal answer for an object this node does not have.",
    ],
    quiz: [
      {
        question: "A response arrives with both an id and a result member, but no error member. What does the absence of error tell you?",
        options: [
          "The call succeeded; result and error are mutually exclusive in one response",
          "Nothing, since some clients send both members",
          "The node is still processing and will send the error later",
          "The request was a notification",
        ],
        answer: 0,
      },
      {
        question: "Why must a WebSocket JSON-RPC client keep a map from request id to pending call?",
        options: [
          "Responses on a shared socket can come back in a different order than the requests were sent",
          "The WebSocket protocol strips method names from responses",
          "Each subscription consumes one id from a fixed pool",
          "The server rejects a second request until the first is answered",
        ],
        answer: 0,
      },
      {
        question: "Which frame in the Ethereum JSON-RPC envelope carries no id at all?",
        options: [
          "A subscription update, sent as method eth_subscription",
          "An error response",
          "Any response to a batch request",
          "The first request on a new connection",
        ],
        answer: 0,
      },
    ],
    related: ["json-rpc", "rpc-errors", "batch-request", "http-transport", "websocket-transport", "hex-encoding", "eth-subscribe", "namespaces"],
    sources: [
      { title: "JSON-RPC 2.0 Specification", url: "https://www.jsonrpc.org/specification" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "batch-request",
    title: "Batch request",
    category: "foundations",
    aliases: ["json-rpc batch", "batching", "array request", "multiple calls"],
    summary: "A batch is a JSON array of request objects sent in one round trip; the server answers with an array of responses that may arrive in any order and may mix successes with per-item errors.",
    sections: [
      {
        heading: "How a batch is framed",
        paragraphs: [
          "Instead of one object, the body is an array of ordinary [[request-response|request objects]], each with its own `method`, `params`, and `id`. The server processes them and returns an array of response objects. JSON-RPC 2.0 explicitly allows the responses to come back in any order, so the only reliable way to associate an answer with a question is the `id`. If the outer array itself is malformed, the server replies with a single error object rather than an array, which is a shape a naive parser will not expect.",
          "Batching saves round trips, not work. The node still executes each call, so a 500-item batch of [[eth-get-transaction-receipt|eth_getTransactionReceipt]] costs the node the same as 500 separate calls and produces one large response body. What you save is TCP and TLS overhead plus per-request latency, which is why an [[indexer|indexer]] pulling a block's worth of data benefits most.",
        ],
      },
      {
        heading: "What a batch does not guarantee",
        paragraphs: [
          "A batch is not a transaction and not a snapshot. The items are independent calls, executed against whatever the node's head is when each one runs. Two `latest` reads in the same batch can straddle a new block, so the balance in item 1 and the [[nonce|nonce]] in item 2 may come from different states. When consistency matters, pass the same explicit block number or [[block-hash|block hash]] to every item; see [[block-tag|block identifiers and tags]].",
          "Partial failure is normal. One item may return `-32602` invalid params while the rest succeed, and one item hitting a [[rate-limits|rate limit]] does not roll back the others. Some [[rpc-provider|providers]] reject the whole batch when it is too large or when any single item exceeds a limit, and some cap batch size outright, typically in the tens or low hundreds of items. A batch that exceeds a body size limit fails at the HTTP layer with no JSON-RPC error at all.",
        ],
      },
      {
        heading: "Using batches well",
        paragraphs: [
          "Keep batches homogeneous and bounded. Group calls of similar cost, so one `debug_traceBlockByNumber` does not hold up 99 cheap reads sharing the same connection and timeout. Size the batch to the slowest item's latency budget, and split on the client rather than letting the server truncate. Handle the response as an unordered set: index the array by `id`, then check each element for `error` before reading `result`.",
          "For contract reads specifically, a batch is often the wrong tool. [[multicall|Multicall3]] aggregates many [[eth-call|eth_call]] reads into a single on-chain call executed at exactly one block, which gives both fewer requests and the atomic snapshot a batch cannot promise. A JSON-RPC batch remains the right tool for heterogeneous calls such as blocks, receipts, and [[eth-get-logs|logs]] for the same block range.",
        ],
      },
    ],
    example: {
      title: "A two-item batch and an out-of-order reply",
      language: "json",
      code: "// request body\n[\n  {\"jsonrpc\":\"2.0\",\"id\":\"blk\",\"method\":\"eth_getBlockByNumber\",\"params\":[\"0x12d4f1c\",false]},\n  {\"jsonrpc\":\"2.0\",\"id\":\"bal\",\"method\":\"eth_getBalance\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"0x12d4f1c\"]}\n]\n\n// response body: note the order and the per-item error\n[\n  {\"jsonrpc\":\"2.0\",\"id\":\"bal\",\"result\":\"0x1b1ae4d6e2ef500000\"},\n  {\"jsonrpc\":\"2.0\",\"id\":\"blk\",\"error\":{\"code\":-32000,\"message\":\"header not found\"}}\n]",
      note: "Both items pin the same block number, so the pair would have been a consistent snapshot had the first item succeeded; the reply order carries no meaning.",
    },
    pitfalls: [
      "Zipping the response array against the request array by index; responses may be reordered, so match on `id` instead.",
      "Reading `result` without checking `error` on each element, which turns a per-item failure into a silent `undefined`.",
      "Using `latest` on several items and treating the answers as one snapshot; a new block can land midway through the batch.",
      "Sending one enormous batch and blaming the node for a timeout; the body size limit or the slowest item usually killed it.",
    ],
    quiz: [
      {
        question: "What is the correct way to associate a batch response element with the request that produced it?",
        options: [
          "Match on the id member of each object",
          "Use the array index, which the spec preserves",
          "Use the method name in the response",
          "Sort both arrays and pair them",
        ],
        answer: 0,
      },
      {
        question: "You batch eth_getBalance and eth_getTransactionCount, both at latest, for the same account. Why can the pair be inconsistent?",
        options: [
          "The items execute independently and a new block can land between them",
          "Balance is read from state but nonce is read from the mempool",
          "Batches are executed in reverse order by most clients",
          "The node caches balances for one block longer than nonces",
        ],
        answer: 0,
      },
      {
        question: "Why does batching 500 receipt lookups not reduce the node's workload?",
        options: [
          "Each item is still executed individually; only network round trips are saved",
          "The node re-executes the block once per item",
          "Batches disable the node's transaction index",
          "The node must serialize the whole response before starting work",
        ],
        answer: 0,
      },
    ],
    related: ["request-response", "json-rpc", "rate-limits", "multicall", "http-transport", "rpc-errors", "indexer", "block-tag"],
    sources: [
      { title: "JSON-RPC 2.0 Specification: Batch", url: "https://www.jsonrpc.org/specification" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "rpc-errors",
    title: "JSON-RPC errors",
    category: "foundations",
    aliases: ["error codes", "-32000", "-32602", "execution reverted", "EIP-1474", "error object"],
    summary: "A JSON-RPC error is an object with a numeric `code`, a human-readable `message`, and optional `data`, returned in place of `result` and usually delivered inside a successful HTTP response.",
    sections: [
      {
        heading: "The error object",
        paragraphs: [
          "The error replaces `result` in the [[request-response|response envelope]] and has three members. `code` is an integer chosen from the standard ranges, `message` is a single short sentence intended for a human, and `data` is an optional free-form value. Ethereum uses `data` heavily: it carries revert bytes, the amount of [[gas|gas]] a call would have needed, or a provider's rate-limit details. Only `code` is safe to branch on, because message strings differ between [[execution-client|execution clients]] and change between releases.",
          "Errors are also where the two layers of the stack meet. A malformed body fails before any Ethereum logic runs and yields `-32700` or `-32600`; a wrong argument type yields `-32602`; an unknown method yields `-32601`. Everything Ethereum-specific lives in the server-error range instead.",
        ],
      },
      {
        heading: "Standard and Ethereum-specific codes",
        paragraphs: [
          "JSON-RPC 2.0 reserves `-32700` parse error, `-32600` invalid request, `-32601` method not found, `-32602` invalid params, `-32603` internal error, and the range `-32000` to `-32099` for implementation-defined server errors. Ethereum's conventions are collected in [[eip|EIP-1474]], which assigns meanings in that server range, and in practice `-32000` is the catch-all clients use for pool rejections such as `nonce too low`, `replacement transaction underpriced`, and `insufficient funds for gas * price + value`.",
          "Two codes outside the standard set appear often. Code `3` is the widely used execution-reverted code, and `-32005` is commonly used by [[rpc-provider|providers]] for [[rate-limits|rate limits]] alongside HTTP 429. Providers also invent codes, so treat any unrecognised negative code in the server range as a retryable server-side condition rather than a bug in your parameters.",
        ],
      },
      {
        heading: "Reverts are a special case",
        paragraphs: [
          "When [[eth-call|eth_call]] or [[eth-estimate-gas|eth_estimateGas]] executes and the [[evm|EVM]] hits `REVERT`, the node reports it as an error rather than a result. Most clients return code `3` with the message `execution reverted` and the ABI-encoded revert payload in `data`, which decodes into `Error(string)`, `Panic(uint256)`, or a custom error; see [[revert|reverts and errors]]. Some providers instead return `-32000` with the same message and sometimes without `data`, so do not hard-code one shape.",
          "A revert during simulation is a deterministic answer about the state you asked about, not a transport failure, so retrying it against another node changes nothing unless that node resolves your [[block-tag|block identifier]] to a different block.",
        ],
      },
      {
        heading: "Classifying for retry",
        paragraphs: [
          "Three buckets are enough. Caller errors (`-32600`, `-32601`, `-32602`, and reverts) will fail identically on every attempt, so retrying wastes quota. Capacity errors (HTTP 429, `-32005`, timeouts, connection resets) are worth retrying with backoff or sending to another upstream; see [[retries|retries and idempotency]] and [[failover|failover]]. Node-state errors such as `missing trie node`, `header not found`, or `historical state not available` mean this particular node cannot answer, and only a node with more data, typically an [[archive-node|archive node]], will.",
        ],
      },
    ],
    example: {
      title: "A revert surfaced through eth_call",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":7,\"method\":\"eth_call\",\"params\":[{\"to\":\"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\"data\":\"0xa9059cbb000…\"},\"latest\"]}\n\n// response: an error, not a result\n{\n  \"jsonrpc\": \"2.0\",\n  \"id\": 7,\n  \"error\": {\n    \"code\": 3,\n    \"message\": \"execution reverted: ERC20: transfer amount exceeds balance\",\n    \"data\": \"0x08c379a00000000000000000000000000000000000000000000000000000000000000020…\"\n  }\n}",
      note: "The `0x08c379a0` prefix in `data` is the selector of `Error(string)`; decoding the rest gives the same reason string the message already quotes.",
    },
    pitfalls: [
      "Matching on `message` text to detect a revert; wording differs between clients and changes across releases, so branch on `code` and `data`.",
      "Retrying a reverted `eth_call` against a fallback endpoint; the revert is a deterministic result and the fallback will produce it too.",
      "Assuming `-32000` always means the same thing; it is a catch-all range whose meaning comes from the message and the method.",
      "Ignoring HTTP-level failures because the client only parses JSON; a 429 or a 413 arrives with no JSON-RPC error object at all.",
    ],
    quiz: [
      {
        question: "eth_call returns an error with code 3 and a data field. What happened?",
        options: [
          "The EVM executed the call and it reverted, and data holds the encoded revert reason",
          "The parameters were malformed and the node never executed anything",
          "The node is missing historical state for that block",
          "The provider throttled the request",
        ],
        answer: 0,
      },
      {
        question: "Which error is worth retrying against a different upstream endpoint?",
        options: [
          "missing trie node while reading an old block's state",
          "invalid params on a badly formatted address",
          "execution reverted from a token transfer simulation",
          "method not found for trace_block",
        ],
        answer: 0,
      },
      {
        question: "Why should application code branch on code rather than on message?",
        options: [
          "Message wording differs between clients and versions, while codes are stable",
          "The message field is optional and usually absent",
          "Messages are returned only over WebSocket",
          "The code is signed by the node and the message is not",
        ],
        answer: 0,
      },
    ],
    related: ["request-response", "revert", "eth-call", "retries", "rate-limits", "failover", "json-rpc", "archive-node"],
    sources: [
      { title: "JSON-RPC 2.0 Specification: Error object", url: "https://www.jsonrpc.org/specification" },
      { title: "EIP-1474: Remote procedure call specification", url: "https://eips.ethereum.org/EIPS/eip-1474" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "execution-apis",
    title: "Execution APIs specification",
    category: "foundations",
    aliases: ["execution-apis", "openrpc", "eth spec", "api specification", "hive"],
    summary: "`ethereum/execution-apis` is the repository that normatively defines the [[execution-layer|execution layer]]'s RPC surface: machine-readable OpenRPC schemas for the `eth_`, `net_`, and `web3_` methods, the [[engine-api|Engine API]] specification, and the shared test fixtures clients are checked against.",
    sections: [
      {
        heading: "What the repository holds",
        paragraphs: [
          "Each method has a schema file describing its parameters, its result, and the exact types involved: a QUANTITY, a 20-byte DATA [[address|address]], a 32-byte hash, a block object. Those files are compiled into a single `openrpc.json` document, which is what the rendered API documentation and most code generators consume. Because the types are machine-readable, a disagreement about whether a field is optional or whether an unknown [[block|block]] returns `null` has one place to be settled.",
          "The [[engine-api|Engine API]] lives in the same repository but in prose specifications split by fork, so `engine_newPayloadV3` and its Cancun rules sit in one document and the Prague version in another. That split is deliberate: the [[json-rpc|application-facing API]] evolves slowly and additively, while the consensus-to-execution interface gains a new method version at nearly every [[hardfork|network upgrade]].",
        ],
      },
      {
        heading: "How a method becomes standard",
        paragraphs: [
          "The path is a pull request, not automatically an [[eip|EIP]]. A method is proposed, argued over by client teams, usually implemented by at least two [[execution-client|execution clients]], and then merged as a schema. [[eth-get-block-receipts|eth_getBlockReceipts]] and [[eth-simulate|eth_simulateV1]] both arrived this way after existing as client extensions first. EIP-1474 still describes the older baseline and the error codes, but the repository is what client teams treat as current.",
          "Methods that never make it stay client-specific. The [[debug-api|debug_ namespace]] and the [[trace-api|trace_ namespace]] are documented by the clients that implement them rather than here, which is exactly why their availability and their output shapes vary.",
        ],
      },
      {
        heading: "Conformance and its limits",
        paragraphs: [
          "The repository carries request and response test vectors, and the community `hive` harness runs them against real client builds so that an answer's shape, not just its value, is compared. This is a practical lever for [[client-diversity|client diversity]]: an application written against the schema should get the same field names from [[geth|Geth]], [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]], and [[besu|Besu]].",
          "What the specification does not fix is everything operational. It says nothing about [[authentication|authentication]], [[rate-limits|rate limits]], block-range caps on [[eth-get-logs|eth_getLogs]], gas caps on [[eth-call|eth_call]], or how much history a node kept. A node can be fully conformant and still refuse your query.",
        ],
      },
    ],
    pitfalls: [
      "Treating the rendered API documentation as exhaustive; `debug_` and `trace_` are absent from it because they are not part of the specification.",
      "Assuming a method present in the schema is enabled on your endpoint; namespaces and per-method allow-lists are an operator decision.",
      "Reading a single Engine API document for all forks; the method versions are specified per fork and an old page describes an old payload shape.",
    ],
    quiz: [
      {
        question: "Where is the trace_ namespace specified?",
        options: [
          "Nowhere central; each client that implements it documents its own version",
          "In execution-apis, alongside eth_ and net_",
          "In EIP-1474 as an optional namespace",
          "In the consensus specs repository",
        ],
        answer: 0,
      },
      {
        question: "Why is the Engine API specified in separate documents per fork while the eth_ methods are not?",
        options: [
          "The consensus-to-execution interface gains a new method version at nearly every upgrade",
          "The Engine API is not machine-readable so it cannot be merged into one file",
          "Each fork replaces the entire Engine API with a new protocol",
          "The eth_ methods are frozen and can never change",
        ],
        answer: 0,
      },
      {
        question: "An endpoint is fully conformant with execution-apis but rejects your eth_getLogs query over a 100,000-block range. Is that a spec violation?",
        options: [
          "No; range caps and other limits are deployment choices the specification does not cover",
          "Yes; the schema defines a minimum supported range",
          "Yes; conformance requires answering any valid filter",
          "No, because eth_getLogs is not part of the specification",
        ],
        answer: 0,
      },
    ],
    related: ["json-rpc", "engine-api", "namespaces", "eip", "client-diversity", "endpoint-capabilities", "hardfork", "rpc-errors"],
    sources: [
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "EIP-1474: Remote procedure call specification", url: "https://eips.ethereum.org/EIPS/eip-1474" },
    ],
  },
  {
    id: "namespaces",
    title: "RPC namespaces",
    category: "foundations",
    aliases: ["eth_", "net_", "web3_", "debug_", "trace_", "txpool_", "admin_", "modules", "http.api"],
    summary: "A namespace is the prefix before the underscore in a method name, such as `eth_` or `debug_`, and it is the unit an operator uses to enable, disable, or expose a whole group of methods on a listener.",
    sections: [
      {
        heading: "The application namespaces",
        paragraphs: [
          "`eth_` is the interface applications use: [[block|blocks]], transactions, receipts, [[eth-get-logs|logs]], [[state|state]] reads, simulation, fee data, and [[eth-send-raw-transaction|eth_sendRawTransaction]]. `net_` and `web3_` are tiny and describe the process rather than the chain, through [[net-web3-api|net_peerCount, net_listening, and web3_clientVersion]]. These three are the ones defined by the [[execution-apis|execution APIs specification]], and an endpoint that offers nothing else is still a useful endpoint.",
          "`eth_` also hides a wallet-era wart. `eth_accounts`, `eth_sign`, and [[eth-send-transaction|eth_sendTransaction]] assume the node holds private keys. Public nodes leave those disabled, and browser wallets implement the same names themselves behind the [[eip-1193|EIP-1193 provider]], which is why the method name you call in a dapp is not always answered by a node.",
        ],
      },
      {
        heading: "Diagnostic and administrative namespaces",
        paragraphs: [
          "The [[debug-api|debug_ namespace]] is [[geth|Geth]]-shaped and gives transaction and block tracing plus raw RLP access; the [[trace-api|trace_ namespace]] is the older Parity shape offered by [[nethermind|Nethermind]], [[erigon|Erigon]], and [[reth|Reth]]. Both are expensive: one `debug_traceBlockByNumber` can cost more than thousands of ordinary reads. The [[txpool-api|txpool_ namespace]] exposes the node's [[mempool|pending and queued transactions]], and the [[admin-api|admin_ namespace]] can add peers and start or stop listeners. `personal_` managed local keys and is deprecated in favour of external signers.",
          "Two namespaces are not part of this surface at all. `engine_` is only valid on the authenticated [[engine-api|Engine API]] listener, and clients refuse it on the public port. Client-specific prefixes such as Erigon's `ots_` for Otterscan, and provider-specific prefixes added by hosted [[rpc-provider|providers]], round out what a given endpoint may answer.",
        ],
      },
      {
        heading: "Enabling and exposing them",
        paragraphs: [
          "Namespaces are selected per listener at startup. Geth uses `--http.api eth,net,web3` and a separate `--ws.api` list; Nethermind uses `--JsonRpc.Enabled true --JsonRpc.EnabledModules [Eth,Net,Web3,Trace]`. The [[ipc-transport|IPC socket]] usually defaults to the full set, because reaching it already implies local access. Probing a single harmless method from a namespace is the reliable way to learn what is on; see [[endpoint-capabilities|endpoint capabilities]].",
          "The exposure decision is a security decision. `admin_`, `personal_`, and `txpool_` on a public listener hand out peer control, key operations, and a view of unbroadcast order flow, and `debug_` is a denial-of-service lever even when read-only; see [[security|RPC security]].",
        ],
      },
    ],
    example: {
      title: "Finding out which namespaces answer",
      language: "bash",
      code: "# always present\ncast rpc web3_clientVersion --rpc-url https://rpc.example\n\n# tracing: succeeds, or returns -32601 method not found\ncast rpc trace_block 0x12d4f1c --rpc-url https://rpc.example\n\n# should fail on any public endpoint\ncast rpc admin_peers --rpc-url https://rpc.example",
      note: "`-32601` means the namespace is not enabled here, not that the method does not exist in the client.",
    },
    pitfalls: [
      "Assuming `eth_` implies the whole namespace; `eth_sendTransaction` and `eth_accounts` are disabled on essentially every public endpoint.",
      "Enabling `debug_` on a public listener for one investigation and leaving it on; tracing is an easy way to exhaust a node's CPU.",
      "Adding `engine` to the HTTP namespace list to debug it; the Engine API belongs on its authenticated listener only.",
      "Reading a `-32601` as a missing feature in the client software when it usually means the operator did not enable that module.",
    ],
    quiz: [
      {
        question: "Which namespaces are covered by the execution APIs specification?",
        options: [
          "eth_, net_, and web3_",
          "eth_, debug_, and trace_",
          "eth_, txpool_, and admin_",
          "All namespaces a client implements",
        ],
        answer: 0,
      },
      {
        question: "A call to trace_block returns error -32601. What is the most likely cause?",
        options: [
          "The operator did not enable the trace module on this listener",
          "The block is too old to trace",
          "The request exceeded the endpoint's rate limit",
          "The client does not implement tracing in any form",
        ],
        answer: 0,
      },
      {
        question: "Why is txpool_ risky to expose publicly?",
        options: [
          "It reveals transactions that have not yet been included, which is exploitable order flow",
          "It lets callers delete transactions from the pool",
          "It bypasses the node's rate limiting",
          "It returns private keys for locally signed transactions",
        ],
        answer: 0,
      },
    ],
    related: ["json-rpc", "debug-api", "trace-api", "security", "engine-api", "execution-apis", "endpoint-capabilities", "net-web3-api", "admin-api"],
    sources: [
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "Geth: JSON-RPC server", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc" },
      { title: "Nethermind: JSON-RPC configuration", url: "https://docs.nethermind.io/interacting/json-rpc-server/" },
    ],
  },
  {
    id: "http-transport",
    title: "HTTP transport",
    category: "foundations",
    aliases: ["http", "https", "post", "keep-alive", "cors", "rest endpoint"],
    summary: "JSON-RPC over HTTP sends each call as a POST with a JSON body to one URL and receives exactly one response body, with no connection state and no way for the node to push anything back.",
    sections: [
      {
        heading: "How a call travels",
        paragraphs: [
          "The client opens a connection, POSTs a body with `content-type: application/json`, and reads the response. The URL path carries no meaning for routing: every method goes to the same endpoint, sometimes with an API key in the path or in an `authorization` header; see [[authentication|RPC authentication]]. Servers normally accept `accept-encoding: gzip`, which matters because a full [[block|block]] with transactions or a large [[eth-get-logs|eth_getLogs]] result compresses extremely well.",
          "Connections are reused. Keep-alive, or HTTP/2 multiplexing at a [[rpc-provider|provider]], removes the TCP and TLS handshake from every call but not the round trip itself, so a caller making thousands of small reads is still latency-bound. That is the case for a [[batch-request|batch]], which trades one big body for many small ones.",
        ],
      },
      {
        heading: "Two layers of failure",
        paragraphs: [
          "HTTP and JSON-RPC each have their own notion of an error, and they do not line up. A method that fails inside the node returns `200 OK` with an [[rpc-errors|error object]] in the body. A request that never reached the node's dispatcher fails at the HTTP layer with no JSON at all: `413` when the body exceeds the server's limit, `429` when a rate limiter fires, `401` or `403` on a bad key, `502` and `504` from a proxy in front of the node. Client code must handle both shapes.",
          "The transport also imposes limits the specification does not. [[reverse-proxy|Reverse proxies]] cap body size and set read timeouts that abort a long [[debug-api|debug_ trace]] mid-flight, and browsers add CORS: a page can only call an endpoint whose responses carry permissive `access-control-allow-origin` headers, configured in Geth with `--http.corsdomain` and guarded separately by `--http.vhosts`.",
        ],
      },
      {
        heading: "No push, so poll",
        paragraphs: [
          "Because the server cannot speak first, everything event-driven has to be simulated. The usual pattern is polling [[eth-block-number|eth_blockNumber]] on a timer and fetching what changed, or installing a server-side [[eth-filters|polling filter]] and calling `eth_getFilterChanges`. Both burn requests and both add up to half the block time in latency. Real push needs the [[websocket-transport|WebSocket transport]], which is why most production setups run both: HTTP for bulk reads and writes, WebSocket for [[eth-subscribe|subscriptions]].",
          "Statelessness is the compensating advantage. Any HTTP request can go to any node, which makes a [[load-balancer|load balancer]] trivial, [[retries|retrying]] a read safe, and [[caching|caching]] by [[block-hash|block hash]] possible. Filters break that property, because their state lives on one specific node.",
        ],
      },
    ],
    pitfalls: [
      "Treating `200 OK` as success without inspecting the body for an `error` member.",
      "Opening a new connection per request; without keep-alive the TLS handshake can dominate the cost of a small read.",
      "Polling `eth_blockNumber` every 200 ms against a metered endpoint and exhausting the quota before any real work happens.",
      "Putting a filter-based workflow behind a load balancer; the follow-up `eth_getFilterChanges` reaches a node that has never heard of the filter.",
    ],
    quiz: [
      {
        question: "An endpoint returns HTTP 429 with an HTML body. Where is the JSON-RPC error object?",
        options: [
          "There is none; the request was rejected before the JSON-RPC layer saw it",
          "In a response header",
          "It will arrive in a later response on the same connection",
          "It is the HTML body, which clients must parse",
        ],
        answer: 0,
      },
      {
        question: "Why can HTTP not deliver eth_subscribe notifications?",
        options: [
          "Each request yields exactly one response and the server cannot initiate a message",
          "JSON-RPC forbids notifications over HTTP",
          "Subscription payloads exceed the maximum body size",
          "HTTP cannot carry binary WebSocket frames",
        ],
        answer: 0,
      },
      {
        question: "Which property of HTTP makes load balancing RPC easy, and which feature breaks it?",
        options: [
          "Statelessness makes it easy; server-side filters break it because their state lives on one node",
          "Keep-alive makes it easy; gzip breaks it because compression is per connection",
          "CORS makes it easy; TLS breaks it because certificates are per host",
          "Batching makes it easy; eth_call breaks it because it needs archive state",
        ],
        answer: 0,
      },
    ],
    related: ["websocket-transport", "ipc-transport", "json-rpc", "rpc-errors", "batch-request", "load-balancer", "rate-limits", "caching"],
    sources: [
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "Geth: JSON-RPC server", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc" },
      { title: "JSON-RPC 2.0 Specification", url: "https://www.jsonrpc.org/specification" },
    ],
  },
  {
    id: "websocket-transport",
    title: "WebSocket transport",
    category: "foundations",
    aliases: ["ws", "wss", "websocket", "subscriptions", "push", "long-lived connection"],
    summary: "A WebSocket carries many JSON-RPC calls and, unlike HTTP, server-initiated notifications over one long-lived bidirectional connection, which is what makes [[eth-subscribe|eth_subscribe]] possible.",
    sections: [
      {
        heading: "One socket, many calls",
        paragraphs: [
          "The client opens `ws://` or `wss://` with an HTTP upgrade handshake, and from then on each frame is a JSON-RPC message. Requests and responses use the same [[request-response|envelope]] as over [[http-transport|HTTP]], but several can be in flight at once and the node answers them in whatever order it finishes, so the `id` is the only way to pair them. A client therefore keeps a map from `id` to pending call and a second map for subscription ids.",
          "Notification frames are the reason to use a WebSocket at all. They arrive with `method` set to `eth_subscription` and no `id`, carrying a `subscription` id and a `result`. A subscription created with [[eth-subscribe|eth_subscribe]] can deliver `newHeads`, `logs`, `newPendingTransactions`, or `syncing` events as they happen instead of forcing a poll of [[eth-block-number|eth_blockNumber]].",
        ],
      },
      {
        heading: "Subscriptions are connection-scoped",
        paragraphs: [
          "A subscription belongs to the socket that created it. When the socket closes, for any reason, every subscription on it is gone: the node keeps no record and there is nothing to resume. Reconnecting gives you new subscription ids and, critically, a gap. Events that occurred while you were disconnected are never replayed, so a correct consumer records the last block it processed and backfills with [[eth-get-logs|eth_getLogs]] or [[eth-get-block-by-number|eth_getBlockByNumber]] from that point before trusting the live stream again.",
          "The same scoping makes WebSockets hostile to naive [[load-balancer|load balancing]]. A reconnect that lands on a different node is a different chain view, and a [[reorg|reorg]] seen by one node may already be resolved on another. It also means a [[reverse-proxy|reverse proxy]] must be configured to pass the upgrade through and to not close idle connections, or subscriptions will die on a timer that looks like a network fault.",
        ],
      },
      {
        heading: "Keeping the connection alive",
        paragraphs: [
          "Long-lived connections need maintenance. Use protocol-level ping and pong frames to detect a half-open socket, because TCP alone can keep a dead connection open for minutes. Expect providers to enforce idle timeouts, a maximum number of concurrent connections, and a cap on subscriptions per connection; `newPendingTransactions` in particular is throttled or disabled almost everywhere because of its volume. Reconnect with exponential backoff and jitter so that a node restart does not bring every client back at the same instant.",
          "Operationally, WebSocket is a separate listener with its own namespace list, for example Geth's `--ws --ws.api eth,net,web3` and `--ws.origins`. Enabling HTTP does not enable it, and an endpoint URL that works with `https://` frequently has a different `wss://` host.",
        ],
      },
    ],
    example: {
      title: "Subscribing to new heads",
      language: "json",
      code: "// client -> node\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_subscribe\",\"params\":[\"newHeads\"]}\n\n// node -> client: the subscription id\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0xcd0c3e8af590364c09d0fa6a1210faf5\"}\n\n// node -> client, once per block, with no id\n{\"jsonrpc\":\"2.0\",\"method\":\"eth_subscription\",\"params\":{\"subscription\":\"0xcd0c3e8af590364c09d0fa6a1210faf5\",\"result\":{\"number\":\"0x12d4f1d\",\"hash\":\"0x7d5a4369…f0d3\",\"parentHash\":\"0x9b83c12c…ee71\"}}}",
      note: "Compare each `parentHash` with the previous `hash`: a mismatch is how a [[reorg|reorg]] announces itself on this stream.",
    },
    pitfalls: [
      "Resubscribing after a reconnect without backfilling; every event during the gap is lost and the node will not replay it.",
      "Relying on TCP to notice a dead peer; without ping and pong a half-open socket can look healthy for minutes while delivering nothing.",
      "Putting a WebSocket endpoint behind a round-robin load balancer, so each reconnect silently switches chain views.",
      "Subscribing to `newPendingTransactions` on a metered endpoint and being disconnected for volume rather than for an error.",
    ],
    quiz: [
      {
        question: "Your WebSocket drops for 40 seconds and reconnects. What happens to the logs subscription that was running?",
        options: [
          "It is gone, and events from the gap are never replayed, so you must backfill",
          "The node buffers events and replays them on reconnect",
          "The subscription id stays valid and streaming resumes automatically",
          "The node resends the last 128 blocks of logs by default",
        ],
        answer: 0,
      },
      {
        question: "How does a client tell a subscription notification apart from a response to one of its calls?",
        options: [
          "The notification has no id and its method field is eth_subscription",
          "The notification arrives on a separate socket",
          "The notification has a negative id",
          "Notifications are sent as binary frames, responses as text",
        ],
        answer: 0,
      },
      {
        question: "Why is a reverse proxy in front of a WebSocket endpoint a common source of mysterious disconnects?",
        options: [
          "Default idle timeouts close connections that are quiet between blocks",
          "Proxies cannot forward JSON bodies larger than 1 MB",
          "TLS termination invalidates subscription ids",
          "Proxies reorder frames, which breaks id matching",
        ],
        answer: 0,
      },
    ],
    related: ["eth-subscribe", "http-transport", "request-response", "reorg", "load-balancer", "reverse-proxy", "eth-filters", "ipc-transport"],
    sources: [
      { title: "ethereum.org: eth_subscribe", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "Geth: JSON-RPC server (WebSocket)", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc/pubsub" },
      { title: "JSON-RPC 2.0 Specification", url: "https://www.jsonrpc.org/specification" },
    ],
  },
  {
    id: "ipc-transport",
    title: "IPC transport",
    category: "foundations",
    aliases: ["ipc", "geth.ipc", "unix socket", "named pipe", "geth attach", "local socket"],
    summary: "IPC serves the same JSON-RPC over a local Unix domain socket or Windows named pipe, such as `geth.ipc`, reachable only from the same machine and guarded by filesystem permissions rather than by any network control.",
    sections: [
      {
        heading: "What it is",
        paragraphs: [
          "The client creates a socket file in its data directory and speaks newline-delimited JSON over it. There is no HTTP framing, no TLS, no origin check, and no header to carry an API key, because the operating system already decided who may open the file. The [[request-response|envelope]] is identical to the one used over [[http-transport|HTTP]], and because the connection is bidirectional and long-lived it also supports [[eth-subscribe|eth_subscribe]] the way a [[websocket-transport|WebSocket]] does.",
          "Paths differ by client and platform. Geth defaults to `<datadir>/geth.ipc` on Linux and macOS and a named pipe on Windows, and disables IPC with `--ipcdisable` or relocates it with `--ipcpath`; [[nethermind|Nethermind]] exposes the equivalent through its JSON-RPC IPC socket path setting. Because the socket lives in the data directory, a container that does not bind-mount that directory cannot reach it.",
        ],
      },
      {
        heading: "Permissions are the whole security model",
        paragraphs: [
          "IPC usually has every namespace enabled, including [[admin-api|admin_]], [[debug-api|debug_]], [[txpool-api|txpool_]], and historically `personal_`. That is a deliberate trade: the socket cannot be reached from the network, so the client assumes whoever can open it is the operator. The consequence is that read access to the socket file is root-equivalent for the node. A user added to the client's group, a world-readable data directory, or a bind mount handed to another container all silently grant node administration.",
          "This is the opposite of the [[http-transport|HTTP listener]], where the sensible default is a minimal namespace list and an explicit allow-list; see [[security|RPC security]]. Do not solve a permissions problem by proxying the IPC socket to a TCP port, which converts a local-only interface into a remote, unauthenticated, fully privileged one.",
        ],
      },
      {
        heading: "When to use it",
        paragraphs: [
          "Use IPC for anything that runs beside the node: the interactive `geth attach` console, a monitoring sidecar, a backup or pruning script, or a local [[indexer|indexer]] doing heavy [[eth-get-logs|eth_getLogs]] scans. It is the fastest transport available, with no TLS handshake, no HTTP parsing, and no proxy in the path, which matters when a job makes millions of small calls. Some [[cli-tools|command-line tools]] and [[client-libraries|client libraries]] accept a socket path where they would otherwise take a URL.",
          "It is the wrong choice for anything else. IPC cannot be load balanced, cannot be reached by a browser, and does not survive the node moving to another host. Applications belong on the HTTP or WebSocket listener, where namespaces, [[rate-limits|rate limits]], and [[authentication|authentication]] can be applied.",
        ],
      },
    ],
    pitfalls: [
      "Loosening permissions on the data directory so a second process can read the socket; that grants complete node administration, not read-only access.",
      "Forwarding the IPC socket to a TCP port with a relay tool, which exposes every privileged namespace to the network without authentication.",
      "Expecting a containerized tool to find `geth.ipc` when the node's data directory was never bind-mounted into it.",
      "Assuming IPC is read-only because it is local; `admin_` and `personal_` are usually enabled on it by default.",
    ],
    quiz: [
      {
        question: "What authenticates a caller on the IPC transport?",
        options: [
          "Filesystem permissions on the socket file",
          "A JWT shared secret, as on the Engine API",
          "An API key passed in the first JSON-RPC call",
          "The caller's process id, checked against an allow-list",
        ],
        answer: 0,
      },
      {
        question: "Why do clients enable every namespace on IPC but not on the HTTP listener?",
        options: [
          "The socket is unreachable from the network, so access already implies operator privilege",
          "IPC cannot express namespace filters",
          "HTTP is faster and so needs stricter limits",
          "The Engine API requires all namespaces on IPC",
        ],
        answer: 0,
      },
      {
        question: "Which workload is a good fit for IPC?",
        options: [
          "A log-scanning indexer running on the same host as the node",
          "A browser dapp reading token balances",
          "A public endpoint behind a load balancer",
          "A mobile wallet submitting transactions",
        ],
        answer: 0,
      },
    ],
    related: ["http-transport", "websocket-transport", "security", "namespaces", "cli-tools", "admin-api", "json-rpc", "geth"],
    sources: [
      { title: "Geth: JSON-RPC server", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc" },
      { title: "Nethermind: JSON-RPC configuration", url: "https://docs.nethermind.io/interacting/json-rpc-server/" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "hex-encoding",
    title: "Hex encoding",
    category: "foundations",
    aliases: ["QUANTITY", "DATA", "0x", "hex string", "bigint", "encoding rules"],
    summary: "The execution JSON-RPC uses two hex encodings: QUANTITY for integers, `0x`-prefixed with no leading zeros and zero written `0x0`, and DATA for byte strings, `0x`-prefixed with an even number of digits and leading zeros preserved.",
    sections: [
      {
        heading: "The two encodings",
        paragraphs: [
          "QUANTITY encodes a number. It is `0x` followed by the shortest hex representation, so 1000 is `0x3e8`, never `0x03e8`, and zero is `0x0`, never `0x` or `0x00`. Many clients validate this on input and reject a padded block number outright. DATA encodes bytes. It is `0x` followed by two hex digits per byte, so a 20-byte [[address|address]] is always 42 characters, a 32-byte [[block-hash|hash]] always 66, and an empty byte string is exactly `0x`.",
          "The difference matters most where the same value can be read both ways. A storage slot returned by [[eth-get-storage-at|eth_getStorageAt]] is DATA and comes back as 32 full bytes, `0x0000…0001`, while the balance from [[eth-get-balance|eth_getBalance]] is QUANTITY and comes back as `0x1`. Both mean one; only one of them is safe to compare as a string.",
        ],
      },
      {
        heading: "Where each appears",
        paragraphs: [
          "Numbers that count things are QUANTITY: block numbers, [[nonce|nonces]], [[gas|gas]] limits and amounts, [[wei|wei]] values, `chainId`, `status` in a [[transaction-receipt|receipt]], and `logIndex`. Everything with a fixed byte width or arbitrary length is DATA: addresses, hashes, `logsBloom`, contract code, a transaction's `input`, [[event-log|log]] topics, and the raw RLP bytes you pass to [[eth-send-raw-transaction|eth_sendRawTransaction]]. The [[block-tag|block parameter]] is a third thing: a QUANTITY, a tag string, or an EIP-1898 object.",
          "JSON's own types still appear. Booleans such as `fullTransactions` are real booleans, `null` is real `null`, and the `removed` flag on a log is a boolean, so a decoder cannot simply treat every value as a hex string.",
        ],
      },
      {
        heading: "Decoding without losing data",
        paragraphs: [
          "The classic bug is precision. A wei balance routinely exceeds 2^53, so `parseInt` or `Number()` in JavaScript silently rounds it; use `BigInt`, and only convert to a decimal string for display. The same applies in any language where the default integer is 64-bit, because `uint256` values from [[eth-call|eth_call]] results do not fit. Timestamps, gas values, and block numbers are small enough today, but a total supply or a token balance is not.",
          "The second class of bug is comparison. Addresses come back checksummed under EIP-55 mixed case from some sources and fully lowercase from others, so compare them case-insensitively, and never compare a QUANTITY as a string, because `0x1` and `0x01` denote the same number while only the first is well formed. When you build a request, encode block numbers and values with the QUANTITY rules yourself rather than passing whatever your language's hex formatter produced.",
        ],
      },
    ],
    example: {
      title: "The same number in both encodings",
      language: "json",
      code: "{\n  \"blockNumber\": \"0x12d4f1c\",          // QUANTITY: 19746076, no leading zeros\n  \"gasUsed\": \"0x5208\",                 // QUANTITY: 21000\n  \"status\": \"0x1\",                     // QUANTITY: success\n  \"value\": \"0xde0b6b3a7640000\",        // QUANTITY: 1e18 wei = 1 ether\n  \"from\": \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",   // DATA: exactly 20 bytes\n  \"input\": \"0x\",                       // DATA: empty byte string\n  \"storageValue\": \"0x0000000000000000000000000000000000000000000000000000000000000001\"  // DATA: 32 bytes\n}",
      note: "`status` and `storageValue` both encode one, but `status` is a QUANTITY and `storageValue` is a fixed-width DATA word.",
    },
    pitfalls: [
      "Parsing a wei value with `Number()` or `parseInt`; anything above 2^53 loses precision without any error being raised.",
      "Sending a zero-padded block number such as `0x01`; QUANTITY forbids leading zeros and clients reject it with invalid params.",
      "Comparing addresses byte-for-byte as strings when one side is EIP-55 checksummed and the other is lowercase.",
      "Expecting `eth_getStorageAt` to return a trimmed value; it returns the full 32-byte word, so `0x0` and `0x00…00` are not interchangeable here.",
    ],
    quiz: [
      {
        question: "Which of these is a valid QUANTITY for the number 0?",
        options: [
          "0x0",
          "0x00",
          "0x",
          "0",
        ],
        answer: 0,
      },
      {
        question: "eth_getBalance returns 0x21e19e0c9bab2400000. What is the safe way to handle it in JavaScript?",
        options: [
          "Parse it with BigInt and only format to a decimal string for display",
          "Use parseInt with radix 16 and store it as a number",
          "Use Number() and round to 18 decimal places",
          "Keep it as a string and compare it directly against other balance strings",
        ],
        answer: 0,
      },
      {
        question: "A storage read returns a 66-character string and a balance read returns a 5-character string, and both represent the value one. Why do they differ?",
        options: [
          "Storage values are DATA with a fixed 32-byte width, balances are QUANTITY with no padding",
          "Storage is encoded big-endian and balances little-endian",
          "The storage value includes a type prefix byte",
          "The balance was truncated because it fits in a small integer",
        ],
        answer: 0,
      },
    ],
    related: ["json-rpc", "block-tag", "wei", "eth-get-storage-at", "address", "request-response", "rlp", "eth-get-balance"],
    sources: [
      { title: "ethereum.org: JSON-RPC hex value encoding", url: "https://ethereum.org/developers/docs/apis/json-rpc/#hex-value-encoding" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "EIP-55: Mixed-case checksum address encoding", url: "https://eips.ethereum.org/EIPS/eip-55" },
    ],
  },
  {
    id: "block-tag",
    title: "Block identifiers and tags",
    category: "foundations",
    aliases: ["latest", "safe", "finalized", "pending", "earliest", "block parameter", "EIP-1898", "default block"],
    summary: "A block identifier is the parameter that tells a read method which [[block|block]]'s [[state|state]] or history to answer from: a block number, a [[block-hash|block hash]] object, or one of the tags `earliest`, `finalized`, `safe`, `latest`, and `pending`.",
    sections: [
      {
        heading: "What the parameter selects",
        paragraphs: [
          "Almost every read method in the [[json-rpc|execution JSON-RPC]] ends with a block parameter: [[eth-get-balance|eth_getBalance]], [[eth-call|eth_call]], [[eth-get-storage-at|eth_getStorageAt]], [[eth-get-transaction-count|eth_getTransactionCount]], and [[eth-get-proof|eth_getProof]] all take one. The node resolves the parameter to one specific block and answers from the [[state|world state]] that existed immediately after that block was executed. Two callers who pass the same block number to the same synced node get the same answer; two callers who pass `latest` a second apart may not.",
          "The parameter accepts three shapes. A [[hex-encoding|hex QUANTITY]] such as `0x12d4f1c` names a block by height. A tag string names a block by its role in the chain. An object defined by [[eip|EIP-1898]], such as `{ \"blockHash\": \"0x…\" }` or `{ \"blockNumber\": \"0x…\" }`, names a block precisely; adding `\"requireCanonical\": true` makes the node fail if that hash is no longer on the canonical chain instead of answering from a side branch.",
        ],
      },
      {
        heading: "The five tags",
        paragraphs: [
          "`latest` is the head of the chain as this node currently sees it: the block most recently chosen by [[fork-choice|fork choice]]. It can move backwards during a [[reorg|reorganization]] and differs between nodes that are milliseconds apart. `pending` is a hypothetical next block assembled from the node's [[mempool|transaction pool]]; it is a local guess rather than chain data, and some clients and providers quietly treat it as `latest`.",
          "`safe` and `finalized` arrived with [[the-merge|the Merge]]. `finalized` is the most recent block that [[finality|Casper FFG finality]] has locked in; under normal conditions it trails the head by two epochs, roughly 13 minutes, and reverting it would require at least a third of all staked ETH to be slashed. `safe` is the block at the latest justified checkpoint, which the [[consensus-client|consensus client]] considers extremely unlikely to be reorged; it usually trails the head by less than one epoch. `earliest` is the [[genesis|genesis block]] and is mostly useful as the start of a range.",
          "The [[consensus-layer|consensus layer]] decides what `safe` and `finalized` mean. It pushes those two hashes together with the head hash to the [[execution-client|execution client]] on every `engine_forkchoiceUpdated` call over the [[engine-api|Engine API]]. An execution client that has lost its consensus client keeps answering `latest` from its last known head, but its `finalized` view silently stops advancing.",
        ],
      },
      {
        heading: "Choosing the right tag",
        paragraphs: [
          "Use `latest` for user-facing reads where freshness matters more than stability, such as showing a balance. Use `finalized` when a wrong answer costs money or cannot be undone: crediting a deposit, settling an off-chain agreement, or anchoring an [[indexer|indexer]] checkpoint. Use an explicit block number or hash when several calls must be consistent with each other, for example reading a token balance and a total supply from the same snapshot, or when requests are spread across several nodes behind a [[load-balancer|load balancer]] that may see different heads.",
          "A [[pruned-node|pruned node]] can answer only for recent blocks. Asking for state at an old block returns a 'missing trie node' or 'historical state not available' [[rpc-errors|error]] even though the block itself is known. Historical state needs an [[archive-node|archive node]].",
        ],
      },
    ],
    example: {
      title: "The same balance read three ways",
      language: "json",
      code: "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBalance\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"latest\"]}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_getBalance\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"finalized\"]}\n{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"eth_getBalance\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",{\"blockHash\":\"0x9b83c12c69edb74f6c8dd5d052765c1adf940e320bd1291696e6fa07829eee71\",\"requireCanonical\":true}]}",
      note: "The first answer may change on the next block, the second only if finality is violated, and the third fails cleanly if the named block is reorged out.",
    },
    pitfalls: [
      "Reading two values with separate `latest` calls and treating them as one snapshot; pass the same explicit block number to both.",
      "Assuming `pending` reflects the network's pending transactions; it reflects one node's pool and may be disabled or aliased to `latest` by a provider.",
      "Assuming a stale `finalized` value is an error; a node whose consensus client is down keeps reporting its last finalized block without complaint.",
    ],
    quiz: [
      {
        question: "Which block tag can move backwards, and why?",
        options: [
          "latest, because fork choice can replace the head during a reorganization",
          "finalized, because the consensus client recomputes it every epoch",
          "earliest, because history expiry removes old blocks",
          "safe, but only while a node is still syncing",
        ],
        answer: 0,
      },
      {
        question: "An execution client keeps serving RPC after its consensus client stops. What happens to reads at finalized?",
        options: [
          "They keep answering from the last finalized hash the node was told, which no longer advances",
          "They start returning an error that names the missing consensus client",
          "They silently fall back to latest",
          "They return null until the consensus client reconnects",
        ],
        answer: 0,
      },
      {
        question: "You need a token balance and that token's total supply to be consistent with each other. What should both calls pass?",
        options: [
          "The same explicit block number or block hash",
          "latest for both, sent inside one batch request",
          "pending for both, so the newest transactions are included",
          "finalized for the balance and latest for the supply",
        ],
        answer: 0,
      },
    ],
    related: ["finality", "reorg", "eth-get-balance", "eth-call", "pruned-node", "archive-node", "head-lag", "hex-encoding"],
    sources: [
      { title: "EIP-1898: Add blockHash to defaultBlock methods", url: "https://eips.ethereum.org/EIPS/eip-1898" },
      { title: "ethereum.org: JSON-RPC default block parameter", url: "https://ethereum.org/developers/docs/apis/json-rpc/#default-block" },
      { title: "Consensus specs: safe block", url: "https://github.com/ethereum/consensus-specs/blob/dev/fork_choice/safe-block.md" },
    ],
  },
  {
    id: "chain-id",
    title: "Chain ID",
    category: "foundations",
    aliases: ["eth_chainId", "net_version", "EIP-155", "network id", "replay protection", "chainlist"],
    summary: "The chain id is the integer that identifies one Ethereum network inside every transaction signature under EIP-155, reported by `eth_chainId`, and it is the first thing a caller checks to confirm an endpoint really serves the intended network.",
    sections: [
      {
        heading: "Replay protection",
        paragraphs: [
          "Before [[eip|EIP-155]], a signed [[transaction|transaction]] was valid on any chain that shared its account model, so a payment on one network could be replayed on another. EIP-155 folded the chain id into the signed payload. In a legacy transaction it appears inside `v`, which becomes `chainId * 2 + 35` or `+ 36`; in every [[transaction-types|typed transaction]] it is an explicit `chainId` field. A transaction signed for chain 1 is simply invalid on chain 11155111, because recovering the sender from the [[ecdsa-signature|signature]] yields a different [[address|address]] or fails outright.",
          "That makes the chain id a signing input, not a transport detail. A wallet that signs with the wrong value produces bytes the target network rejects at pool admission, and the failure surfaces as an `invalid sender` or `invalid chain id` [[rpc-errors|error]] from [[eth-send-raw-transaction|eth_sendRawTransaction]] rather than as anything visible on chain.",
        ],
      },
      {
        heading: "eth_chainId versus net_version",
        paragraphs: [
          "Two methods answer similar questions. `eth_chainId` returns the EIP-155 chain id as a [[hex-encoding|hex QUANTITY]], so mainnet is `0x1`. `net_version` is the older network id and returns a decimal string, so mainnet is `\"1\"`; see [[net-web3-api|net_ and web3_ methods]]. The two values are usually equal but are conceptually different, and some networks have deliberately set them apart, so sign with the chain id and use `net_version` only for diagnostics.",
          "Common values are worth memorising: mainnet is 1, Sepolia is 11155111, Hoodi is 560048, and the deprecated Holesky was 17000; see [[testnets|testnets]]. Layer 2 networks have their own, and community registries such as chainlist map ids to public endpoints and currency symbols. Because anyone can pick an id for a private network, a matching chain id proves intent, not authenticity.",
        ],
      },
      {
        heading: "Checking it in production",
        paragraphs: [
          "Call `eth_chainId` once when a connection is established and compare it with what the application expects, then refuse to sign or submit anything if it differs. This is cheap, is not cacheable across networks, and catches the most damaging class of misconfiguration: a staging environment pointed at mainnet, or a [[failover|failover]] that promoted an upstream serving a different chain. An [[health-check|endpoint health check]] should include it for the same reason, and a [[load-balancer|load balancer]] must never mix chains in one pool.",
          "In the browser the chain id is also user-controlled state. The [[eip-1193|EIP-1193 provider]] emits a `chainChanged` event when the user switches networks, and a dapp asks for a switch with [[wallet-rpc|wallet_switchEthereumChain]], passing the id as a `0x`-prefixed string. Treat `chainChanged` as a signal to re-read everything, because contract addresses, token lists, and cached [[block|block]] data are all network-specific.",
        ],
      },
    ],
    example: {
      title: "Confirming the endpoint before trusting it",
      language: "bash",
      code: "curl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_chainId\",\"params\":[]}' \\\n  https://rpc.example\n# {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0xaa36a7\"}   -> 11155111, Sepolia\n\ncast chain-id --rpc-url https://rpc.example\n# 11155111",
      note: "`0xaa36a7` is Sepolia, not mainnet; an application expecting `0x1` should stop here rather than sign anything.",
    },
    pitfalls: [
      "Signing with `net_version` instead of `eth_chainId`; they are different concepts and can differ on some networks.",
      "Comparing the chain id as a string; `0x1` and `0x01` are the same number but not the same text, so parse before comparing.",
      "Failing over to an upstream without re-checking the chain id, which can route mainnet traffic to a testnet node.",
      "Ignoring the `chainChanged` event in a dapp and continuing to use addresses and cached data from the previous network.",
    ],
    quiz: [
      {
        question: "What stops a transaction signed for Sepolia from being replayed on mainnet?",
        options: [
          "The chain id is part of the signed payload, so the signature does not recover to a valid sender on another chain",
          "Nodes compare the transaction hash against a cross-chain blocklist",
          "The nonce ranges of the two networks never overlap",
          "Mainnet rejects any transaction whose gas price was set on a testnet",
        ],
        answer: 0,
      },
      {
        question: "eth_chainId returns 0x1 and net_version returns 1. Which should a signer use?",
        options: [
          "eth_chainId, because EIP-155 signatures are defined over the chain id",
          "net_version, because it is a decimal value and easier to compare",
          "Either, since the two are guaranteed identical by the specification",
          "Neither; the chain id belongs in the transaction's nonce field",
        ],
        answer: 0,
      },
      {
        question: "Why should a failover routine re-check the chain id on the upstream it promotes?",
        options: [
          "A misconfigured upstream can serve a different network, and reads and writes would silently go to the wrong chain",
          "The chain id changes after every network upgrade",
          "Chain ids are reassigned when a node resyncs",
          "The chain id encodes the node's rate limit tier",
        ],
        answer: 0,
      },
    ],
    related: ["testnets", "eip", "net-web3-api", "eth-send-raw-transaction", "health-check", "failover", "wallet-rpc", "genesis"],
    sources: [
      { title: "EIP-155: Simple replay attack protection", url: "https://eips.ethereum.org/EIPS/eip-155" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "EIP-3326: wallet_switchEthereumChain", url: "https://eips.ethereum.org/EIPS/eip-3326" },
    ],
  },
  {
    id: "execution-layer",
    title: "Execution layer",
    category: "foundations",
    aliases: ["EL", "execution", "eth1", "evm layer"],
    summary: "The execution layer is the half of an Ethereum node that runs the [[evm|EVM]], holds the [[state|world state]], keeps a [[mempool|transaction pool]], and serves the `eth_` [[json-rpc|JSON-RPC]], taking all of its ordering decisions from the [[consensus-layer|consensus layer]].",
    sections: [
      {
        heading: "What it is responsible for",
        paragraphs: [
          "Given an ordered list of transactions, the execution layer applies them and produces a new state. It charges [[gas|gas]], enforces the [[eip-1559|EIP-1559]] base fee, runs contract code, emits [[event-log|logs]], writes [[transaction-receipt|receipts]], and computes the [[state-root|state root]], receipts root, and other header commitments that let every other node check the result. It also validates transactions before they are executed: [[ecdsa-signature|signature]], [[nonce|nonce]], balance, intrinsic gas.",
          "Around that sit the services applications actually touch. The transaction pool holds signed transactions submitted through [[eth-send-raw-transaction|eth_sendRawTransaction]] or received from peers, and gossips them over [[devp2p|devp2p]]. The [[json-rpc|JSON-RPC]] server exposes reads, [[eth-call|simulation]], and [[eth-subscribe|subscriptions]]. An [[execution-client|execution client]] such as [[geth|Geth]], [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]], or [[besu|Besu]] implements all of it.",
        ],
      },
      {
        heading: "What it does not decide",
        paragraphs: [
          "Since [[the-merge|the Merge]] the execution layer has no opinion about which chain is real. It cannot choose a head, cannot finalize anything, and does not know about validators, slots, or attestations. All of that arrives as instructions on the [[engine-api|Engine API]]: the [[consensus-client|consensus client]] sends a payload to validate, then names the head, safe, and finalized blocks. Left alone, an execution client sits still no matter how many peers it has.",
          "Fields that used to describe mining are now vestigial. `difficulty` is `0`, `nonce` in the header is zero, the ommers list is always empty, and `mixHash` carries the consensus layer's `prevRandao` value. Reading `difficulty` to detect proof of work, or expecting uncle rewards, produces code that is quietly wrong on every modern block.",
        ],
      },
      {
        heading: "Why RPC callers care",
        paragraphs: [
          "Almost everything an application asks for is execution-layer data, so the practical boundary is simple: balances, code, storage, receipts, logs, gas, and simulation come from here; validator balances, attestations, and [[finality|finality]] checkpoints come from the [[beacon-api|Beacon API]] on the other side. The exception is the [[block-tag|safe and finalized tags]], which are consensus facts the execution layer merely repeats.",
          "This also explains a whole class of operational symptoms. An execution client whose consensus client is stopped keeps answering reads from a frozen head; one that is [[sync-modes|still syncing]] answers some methods and refuses others; and a [[pruned-node|pruned]] one answers recent state while returning `missing trie node` for old blocks. All three look like a broken endpoint from the caller's side, and none of them is an RPC bug.",
        ],
      },
    ],
    pitfalls: [
      "Reading `difficulty` or the ommers list to reason about consensus; both are fixed constants after the Merge.",
      "Expecting an execution client alone to follow the chain; without a consensus client driving it over the Engine API, it never advances.",
      "Asking the execution layer for validator, epoch, or attestation data; that lives on the consensus layer's API.",
      "Assuming `mixHash` is still a mining artefact; it now carries `prevRandao`, the consensus layer's randomness for that block.",
    ],
    quiz: [
      {
        question: "Which of these does the execution layer decide on its own?",
        options: [
          "Whether a transaction has enough gas and a valid signature",
          "Which of two competing blocks is the head of the chain",
          "When a checkpoint becomes finalized",
          "Which validator proposes the next block",
        ],
        answer: 0,
      },
      {
        question: "A fully synced execution client has 50 peers but its latest block is an hour old. What is the most likely cause?",
        options: [
          "Its consensus client is not driving it over the Engine API",
          "Its transaction pool is full",
          "Its JSON-RPC listener is rate limiting itself",
          "It is missing historical state and refuses to import blocks",
        ],
        answer: 0,
      },
      {
        question: "What does the mixHash field of a post-Merge block header carry?",
        options: [
          "prevRandao, the consensus layer's randomness value for that block",
          "The mining nonce that satisfied the difficulty target",
          "The hash of the beacon block that contained this payload",
          "A hash of the withdrawals list",
        ],
        answer: 0,
      },
    ],
    related: ["consensus-layer", "engine-api", "execution-client", "evm", "state", "the-merge", "json-rpc", "mempool", "block-header"],
    sources: [
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "ethereum/execution-specs", url: "https://github.com/ethereum/execution-specs" },
      { title: "ethereum.org: The Merge", url: "https://ethereum.org/roadmap/merge/" },
    ],
  },
  {
    id: "consensus-layer",
    title: "Consensus layer",
    category: "foundations",
    aliases: ["CL", "beacon chain", "eth2", "consensus"],
    summary: "The consensus layer is the half of a node that runs [[proof-of-stake|proof of stake]] — slots, attestations, fork choice, and finality — decides which execution block is the head, and exposes the REST [[beacon-api|Beacon API]] rather than JSON-RPC.",
    sections: [
      {
        heading: "What it does",
        paragraphs: [
          "The consensus layer maintains the Beacon Chain: a separate chain of [[beacon-block|beacon blocks]], one per 12-second slot with 32 slots to an epoch, that records who the [[validator|validators]] are, what they voted for, and which checkpoints are justified and finalized; see [[slot-epoch|slots and epochs]]. Each beacon block wraps an [[execution-payload|execution payload]], which is the execution block, so the two chains advance together.",
          "Its job is ordering and agreement, not computation. [[attestation|Attestations]] from validators feed the [[fork-choice|LMD-GHOST fork choice]] that picks a head, and Casper FFG turns accumulated votes into justified and finalized checkpoints, normally two epochs behind the head; see [[finality|finality]]. It also runs [[sync-committee|sync committees]] so that [[light-client|light clients]] can follow along, and it gossips [[blob|blob]] sidecars, which it retains for 4096 epochs, roughly 18 days.",
        ],
      },
      {
        heading: "A different interface",
        paragraphs: [
          "[[consensus-client|Consensus clients]] do not speak JSON-RPC to applications. They expose the [[beacon-api|Beacon API]], a REST interface with paths such as `/eth/v1/node/syncing` and `/eth/v1/beacon/headers`, typically on port 5052, and networking over libp2p gossip on port 9000 rather than [[devp2p|devp2p]]; see [[libp2p-gossip|consensus networking]]. A [[validator-client|validator client]] holding keys is a separate process that talks to a [[beacon-node|beacon node]] over that same API.",
          "The implementations are entirely separate codebases from the [[execution-client|execution clients]]: [[lighthouse|Lighthouse]] in Rust, [[prysm|Prysm]] in Go, [[teku|Teku]] in Java, [[nimbus|Nimbus]] in Nim, [[lodestar|Lodestar]] in TypeScript, and [[grandine|Grandine]] in Rust. Running one of each is what makes a node, and picking an unpopular pair is the concrete contribution an operator makes to [[client-diversity|client diversity]].",
        ],
      },
      {
        heading: "How it drives execution",
        paragraphs: [
          "Every interaction with the [[execution-layer|execution layer]] goes through the [[engine-api|Engine API]]. On a new block the consensus client calls `engine_newPayload` to have the payload validated and imported, then `engine_forkchoiceUpdated` to name the head, safe, and finalized hashes. When its validator is due to propose, the same `forkchoiceUpdated` call carries payload attributes, which asks the execution client to start building a block that `engine_getPayload` will collect.",
          "This is why `safe` and `finalized` in [[block-tag|block tags]] are consensus facts on loan to the execution API, and why an execution endpoint whose consensus client is down keeps serving reads from a frozen head. It is also why [[checkpoint-sync|checkpoint sync]] exists: a consensus client can start from a recent finalized state fetched from a trusted Beacon API instead of replaying years of history.",
        ],
      },
    ],
    pitfalls: [
      "Looking for validator or epoch data on the execution JSON-RPC; it is only on the Beacon API.",
      "Assuming block numbers and slots line up; a missed slot produces no execution block, so the two counters drift apart permanently.",
      "Running a consensus client without a matching execution client and expecting either half to be useful on its own.",
      "Forgetting that the consensus layer, not the execution layer, is what makes `safe` and `finalized` advance for RPC callers.",
    ],
    quiz: [
      {
        question: "Which interface does a consensus client expose to applications and operators?",
        options: [
          "A REST Beacon API, typically on port 5052",
          "The same eth_ JSON-RPC as the execution client",
          "Only the Engine API on port 8551",
          "A GraphQL endpoint on port 8545",
        ],
        answer: 0,
      },
      {
        question: "Why do execution block numbers and consensus slot numbers drift apart?",
        options: [
          "A missed or empty slot advances the slot counter but produces no execution block",
          "Slots are counted per epoch and reset every 32 slots",
          "Execution blocks are numbered from the Merge rather than from genesis",
          "Each execution block spans exactly two slots",
        ],
        answer: 0,
      },
      {
        question: "Which pair of Engine API calls does a consensus client make when importing a new block?",
        options: [
          "engine_newPayload to validate it, then engine_forkchoiceUpdated to name the head",
          "engine_getPayload to fetch it, then engine_newPayload to store it",
          "engine_forkchoiceUpdated to reserve the slot, then engine_getPayload to build it",
          "engine_exchangeCapabilities followed by engine_getPayloadBodiesByHash",
        ],
        answer: 0,
      },
    ],
    related: ["execution-layer", "engine-api", "beacon-api", "proof-of-stake", "consensus-client", "finality", "beacon-block", "slot-epoch", "block-tag"],
    sources: [
      { title: "ethereum/consensus-specs", url: "https://github.com/ethereum/consensus-specs" },
      { title: "ethereum.org: Consensus clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
    ],
  },
  {
    id: "engine-api",
    title: "Engine API",
    category: "foundations",
    aliases: ["engine_", "authrpc", "8551", "jwt", "forkchoiceUpdated", "newPayload", "getPayload"],
    summary: "The Engine API is the authenticated JSON-RPC interface, by default on port 8551, over which a [[consensus-client|consensus client]] hands [[execution-payload|execution payloads]] to its [[execution-client|execution client]] and tells it which blocks are head, safe, and finalized.",
    sections: [
      {
        heading: "Three methods carry the protocol",
        paragraphs: [
          "`engine_newPayloadVx` submits a payload for validation and import: the execution client re-executes its transactions, checks the [[state-root|state root]] and the other header commitments, and answers with a status. `engine_forkchoiceUpdatedVx` then states the node's view of the chain with `headBlockHash`, `safeBlockHash`, and `finalizedBlockHash`, which is exactly where the [[block-tag|safe and finalized tags]] come from. `engine_getPayloadVx` retrieves a block the execution client has been building.",
          "Block production uses two of those together. When its [[validator|validator]] is due to propose, the consensus client calls `engine_forkchoiceUpdated` with a `payloadAttributes` object carrying the timestamp, `prevRandao`, the fee recipient, and the withdrawals to include. The execution client starts assembling a block from its [[mempool|transaction pool]], returns a `payloadId`, and improves the block until `engine_getPayload` collects it. [[engine-payload|The full method list]] adds capability negotiation through `engine_exchangeCapabilities` and bulk body retrieval for sync.",
        ],
      },
      {
        heading: "Payload status",
        paragraphs: [
          "Both `newPayload` and `forkchoiceUpdated` answer with a status field, and the values are the vocabulary of the whole interface. `VALID` means executed and accepted. `INVALID` means the payload breaks the rules, and the response carries `latestValidHash` so the consensus client knows how far back to rewind, plus a `validationError` string. `SYNCING` means the execution client cannot judge yet because it lacks ancestors and has started fetching them. `ACCEPTED` means the payload looks well formed but sits on a side branch that is not being executed. Older specifications also defined `INVALID_BLOCK_HASH` for a payload whose computed hash does not match.",
          "An `INVALID` answer is serious: it is one client's claim that a block the network may have accepted is wrong. A bug that produces a false `INVALID` takes a node off the canonical chain, which is precisely the failure mode [[client-diversity|client diversity]] exists to contain.",
        ],
      },
      {
        heading: "Authentication and versioning",
        paragraphs: [
          "The interface is authenticated because it controls the node. Both processes read the same 32-byte secret from a hex file, usually named `jwt.hex`, and every request carries an HS256 JSON Web Token in an `authorization: Bearer` header whose `iat` claim must be within about 60 seconds of the server's clock. Geth points at it with `--authrpc.jwtsecret` and [[lighthouse|Lighthouse]] with `--execution-jwt`. Clock skew between the two hosts is the most common cause of an Engine API that refuses every call; see [[authentication|RPC authentication]].",
          "Methods are versioned per [[hardfork|network upgrade]] rather than extended in place, because each fork changes the payload's shape: `engine_newPayloadV3` takes blob versioned hashes and the parent [[beacon-block|beacon block]] root for Cancun, and `V4` adds execution requests for Prague. A client pair that disagrees about versions simply stops working at the fork, which is why upgrading both halves before an upgrade is not optional.",
        ],
      },
      {
        heading: "Why callers never see it",
        paragraphs: [
          "The Engine API is not a data API and offers nothing an application wants; it exposes no balances, no logs, and no history. It is also a control channel, so an exposed port 8551 lets anyone tell your node which chain to follow. Bind it to localhost, keep the JWT file readable only by the two client processes, and never add `engine` to a public [[namespaces|namespace list]]. Monitoring belongs on the normal listener, where [[eth-syncing|eth_syncing]] and [[health-check|health checks]] live.",
        ],
      },
    ],
    example: {
      title: "Naming the head, safe, and finalized blocks",
      language: "json",
      code: "// consensus client -> execution client, after importing a block\n{\n  \"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"engine_forkchoiceUpdatedV3\",\n  \"params\": [\n    {\n      \"headBlockHash\": \"0x7d5a4369…f0d3\",\n      \"safeBlockHash\": \"0x2b1f8c07…91ab\",\n      \"finalizedBlockHash\": \"0x9b83c12c…ee71\"\n    },\n    null\n  ]\n}\n\n// execution client -> consensus client\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{\"payloadStatus\":{\"status\":\"VALID\",\"latestValidHash\":\"0x7d5a4369…f0d3\",\"validationError\":null},\"payloadId\":null}}",
      note: "The second element is `null` because this node is not proposing; a proposer would put `payloadAttributes` there and get a `payloadId` back.",
    },
    pitfalls: [
      "Exposing port 8551 beyond localhost; the Engine API decides which chain your node follows and has no rate limiting worth the name.",
      "Letting the two hosts drift more than about 60 seconds apart, which makes every JWT fail its `iat` check and looks like an authentication bug.",
      "Upgrading only one client before a fork; the pair then disagrees about which `engine_newPayload` version to use and the node stalls.",
      "Reading a `SYNCING` status as an error; it means the execution client is fetching ancestors and cannot judge the payload yet.",
    ],
    quiz: [
      {
        question: "Which Engine API call tells an execution client to start building a block?",
        options: [
          "engine_forkchoiceUpdated with a payloadAttributes object",
          "engine_getPayload with the target slot number",
          "engine_newPayload with an empty transaction list",
          "engine_exchangeCapabilities with the proposer index",
        ],
        answer: 0,
      },
      {
        question: "engine_newPayload returns status SYNCING. What does the execution client mean?",
        options: [
          "It does not have the payload's ancestors yet, so it cannot judge it",
          "The payload is invalid but the client will retry",
          "The payload was accepted and will be executed later",
          "The JWT token expired and the request was refused",
        ],
        answer: 0,
      },
      {
        question: "Both clients are running and healthy, but every Engine API call is rejected. Which cause fits best?",
        options: [
          "The two hosts' clocks differ by more than the JWT iat tolerance",
          "The execution client has too few peers",
          "The consensus client has not finished checkpoint sync",
          "Port 8551 is bound to localhost instead of a public address",
        ],
        answer: 0,
      },
    ],
    related: ["consensus-layer", "execution-layer", "engine-payload", "authentication", "execution-payload", "block-tag", "hardfork", "the-merge", "security"],
    sources: [
      { title: "Engine API specification", url: "https://github.com/ethereum/execution-apis/tree/main/src/engine" },
      { title: "ethereum.org: Nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "Lighthouse Book: Merge migration and JWT", url: "https://lighthouse-book.sigmaprime.io/" },
    ],
  },
  {
    id: "beacon-api",
    title: "Beacon API",
    category: "foundations",
    aliases: ["beacon node api", "5052", "3500", "REST", "SSE", "eth/v1/beacon", "consensus api"],
    summary: "The Beacon API is the consensus client's REST interface, typically on port 5052, serving beacon blocks and states, validator data, node status, chain configuration, and a server-sent event stream, in JSON or SSZ.",
    sections: [
      {
        heading: "REST, not JSON-RPC",
        paragraphs: [
          "Nothing about this interface resembles the [[json-rpc|execution JSON-RPC]]. There is no envelope, no method name, and no `id`: a caller issues `GET /eth/v1/node/syncing` and reads a JSON object with a `data` member, and failures arrive as ordinary HTTP status codes with a JSON body describing them. Most routes are plain GETs, so they can be explored with a browser or `curl` and cached by normal HTTP machinery.",
          "Blocks and states are addressed by a state or block id rather than a number, and the vocabulary matters: `head`, `genesis`, `finalized`, `justified`, a slot number, or a 32-byte root. `/eth/v2/beacon/blocks/finalized` and `/eth/v1/beacon/headers/head` are both valid, and the same route answers for any of those forms. Responses can also be requested as [[ssz|SSZ]] with `accept: application/octet-stream`, which is much smaller and is what clients use when syncing from each other.",
        ],
      },
      {
        heading: "What lives where",
        paragraphs: [
          "The `/eth/v1/beacon` group covers chain data: [[beacon-block|beacon blocks]], headers, [[attestation|attestation]] and exit pools, [[validator|validator]] balances and statuses under `/eth/v1/beacon/states/{state_id}/validators`, [[finality|finality]] state under `/eth/v1/beacon/states/{state_id}/finality_checkpoints`, and [[blob|blob]] sidecars under `/eth/v1/beacon/blob_sidecars/{block_id}`. The `/eth/v1/node` group reports `syncing`, `health`, `identity`, `version`, and `peers`, which is what an operator's [[health-check|health check]] uses. The `/eth/v1/config` group returns the spec constants and the fork schedule, so a tool can discover a network's parameters instead of hard-coding them.",
          "Two groups are not for general use. `/eth/v1/validator` serves duties, attestation data, and block production to a [[validator-client|validator client]], and the `/eth/v1/debug` routes dump whole beacon states, which are large and expensive. [[beacon-endpoints|The concrete route reference]] lists the rest.",
        ],
      },
      {
        heading: "Events and what only this API can answer",
        paragraphs: [
          "`/eth/v1/events` is a server-sent event stream, the consensus-side counterpart to [[eth-subscribe|eth_subscribe]]. Subscribing to topics such as `head`, `block`, `finalized_checkpoint`, and `chain_reorg` gives a push notification the moment the [[fork-choice|fork choice]] moves, which is a cleaner reorg signal than polling execution blocks and comparing parent hashes.",
          "Some facts exist nowhere else. Whether a validator is active, exited, or slashed; what the current justified and finalized checkpoints are; which validators sit on the [[sync-committee|sync committee]]; and the blob sidecars with their KZG proofs, which the [[consensus-layer|consensus layer]] keeps for about 18 days and the [[execution-layer|execution layer]] never stores at all. [[checkpoint-sync|Checkpoint sync]] and [[light-client|light clients]] are both built on this API.",
        ],
      },
      {
        heading: "Running and exposing it",
        paragraphs: [
          "The port is a client choice: 5052 for [[lighthouse|Lighthouse]], [[teku|Teku]], [[nimbus|Nimbus]], and [[lodestar|Lodestar]], while [[prysm|Prysm]] serves its REST interface on 3500 alongside its own gRPC interface. It is off by default in several clients and is enabled with an `--http` style flag. Exposing it publicly is a real decision, not a formality: the validator and debug routes are sensitive, event streams and state dumps are expensive, and there is no built-in [[authentication|authentication]], so put a [[reverse-proxy|reverse proxy]] in front if it must be reachable.",
        ],
      },
    ],
    example: {
      title: "Finality checkpoints and a head event stream",
      language: "bash",
      code: "curl -s http://127.0.0.1:5052/eth/v1/beacon/states/head/finality_checkpoints\n# {\"data\":{\"previous_justified\":{\"epoch\":\"291204\",\"root\":\"0x2b1f…\"},\n#          \"current_justified\":{\"epoch\":\"291205\",\"root\":\"0x8ac3…\"},\n#          \"finalized\":{\"epoch\":\"291204\",\"root\":\"0x9b83…\"}}}\n\ncurl -s -N -H 'accept: text/event-stream' \\\n  'http://127.0.0.1:5052/eth/v1/events?topics=head,finalized_checkpoint'\n# event: head\n# data: {\"slot\":\"9318560\",\"block\":\"0x7d5a…\",\"epoch_transition\":false,...}",
      note: "The finalized epoch here is what the [[execution-client|execution client]] will report as the `finalized` block tag once the [[consensus-client|consensus client]] passes it over the [[engine-api|Engine API]].",
    },
    pitfalls: [
      "Expecting JSON-RPC semantics; there is no envelope, errors are HTTP status codes, and results are wrapped in a `data` member.",
      "Requesting a state by slot on a pruned [[beacon-node|beacon node]]; historical states are expensive and most nodes keep only recent ones.",
      "Exposing the API publicly without a proxy, which hands out validator endpoints and lets anyone request costly state dumps.",
      "Assuming blob sidecars are available for old blocks; the consensus layer drops them after roughly 18 days.",
    ],
    quiz: [
      {
        question: "How does a caller address a beacon state or block on this API?",
        options: [
          "By a state or block id such as head, finalized, a slot number, or a root",
          "By passing a JSON-RPC block tag in the request body",
          "Only by 32-byte root, since slots may be empty",
          "By execution block number, which the consensus client maps internally",
        ],
        answer: 0,
      },
      {
        question: "Which data can only be obtained from the Beacon API and never from the execution JSON-RPC?",
        options: [
          "A validator's activation status and the current justified checkpoint",
          "A transaction receipt's gasUsed value",
          "A contract's storage slot at the finalized block",
          "The base fee of the latest block",
        ],
        answer: 0,
      },
      {
        question: "What is the consensus-side equivalent of eth_subscribe for reorg notifications?",
        options: [
          "The server-sent event stream at /eth/v1/events, with topics such as head and chain_reorg",
          "A WebSocket on port 5052 using the same envelope as eth_subscribe",
          "Polling /eth/v1/node/syncing on a timer",
          "The Engine API's forkchoiceUpdated callback",
        ],
        answer: 0,
      },
    ],
    related: ["consensus-layer", "beacon-endpoints", "beacon-node", "validator-client", "engine-api", "checkpoint-sync", "finality", "blob", "consensus-client"],
    sources: [
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "ethereum/beacon-APIs", url: "https://github.com/ethereum/beacon-APIs" },
      { title: "Lighthouse Book: Beacon node API", url: "https://lighthouse-book.sigmaprime.io/api-bn.html" },
    ],
  },
  {
    id: "the-merge",
    title: "The Merge",
    category: "foundations",
    aliases: ["merge", "paris", "proof of work to proof of stake", "september 2022", "prevRandao", "TTD"],
    summary: "The Merge, on 15 September 2022, retired Ethereum's proof-of-work consensus by attaching the existing execution chain to the Beacon Chain, which is why a node is now two clients and why the `safe` and `finalized` [[block-tag|block tags]] exist.",
    sections: [
      {
        heading: "What actually happened",
        paragraphs: [
          "The Beacon Chain had already been running [[proof-of-stake|proof of stake]] in parallel since December 2020, with [[validator|validators]] attesting to a chain that carried no user transactions. The Merge joined the two: once the execution chain crossed a terminal total difficulty threshold, mining stopped and every subsequent execution block arrived as an [[execution-payload|execution payload]] inside a [[beacon-block|beacon block]]. Nothing about accounts, balances, contracts, the [[evm|EVM]], or the transaction format changed, and no user action was required.",
          "What changed was the node. A single process became a [[execution-layer|execution layer]] and a [[consensus-layer|consensus layer]] joined by the [[engine-api|Engine API]], each a separate implementation with its own database, ports, and upgrade schedule. Running only one half stopped being an option.",
        ],
      },
      {
        heading: "What it changed for RPC",
        paragraphs: [
          "Several [[block-header|header fields]] became constants. `difficulty` is `0x0`, the header `nonce` is zero, the ommers list is always empty so `sha3Uncles` never varies, and `mixHash` now carries `prevRandao`, the consensus layer's randomness for that block. Mining methods such as `eth_getWork` disappeared from clients, and issuance moved to the consensus layer, so the execution block no longer pays a block reward.",
          "Two additions matter more. The `safe` and `finalized` tags became available because the consensus layer now has a notion of both, and block timing became a 12-second schedule with occasional missed slots rather than a Poisson process, which makes polling intervals predictable. Deep [[reorg|reorganizations]] became rare: a single-block reorg still happens, but the multi-block ones of the proof-of-work era do not.",
        ],
      },
      {
        heading: "What it did not change",
        paragraphs: [
          "The Merge was a consensus change, not a scaling change. Gas limits, fees, and throughput were untouched, [[eth-call|eth_call]] and every other read method kept their exact semantics, and [[eip-1559|EIP-1559]] fee mechanics carried over unchanged. Withdrawals of staked ETH were not part of it either; those arrived with Shapella in April 2023, and `withdrawals` only appears in blocks from that [[hardfork|upgrade]] onward.",
          "The lasting consequence for an RPC operator is operational rather than semantic. Two clients means two sync processes, a shared JWT secret, [[client-diversity|two client choices]] that affect network health, and a failure mode that did not exist before: an [[execution-client|execution client]] that answers reads perfectly while its [[consensus-client|consensus client]] is dead, serving a head that stopped advancing.",
        ],
      },
    ],
    pitfalls: [
      "Detecting proof of work by reading `difficulty`; it is `0x0` on every post-Merge block, which is not the same as the network being unavailable.",
      "Treating `mixHash` as a mining artefact; it carries `prevRandao` and is a usable source of consensus randomness, defined by EIP-4399.",
      "Assuming `withdrawals` exists in every post-Merge block; the field was introduced at Shapella, months later.",
      "Expecting the Merge to have changed fees or throughput; it changed who produces blocks, not how much they can hold.",
    ],
    quiz: [
      {
        question: "Which field carries the consensus layer's randomness in a post-Merge execution block header?",
        options: [
          "mixHash, which now holds prevRandao",
          "difficulty, which holds the RANDAO reveal",
          "nonce, which holds the proposer index",
          "extraData, which holds the beacon block root",
        ],
        answer: 0,
      },
      {
        question: "Which capability did the Merge add to the execution JSON-RPC?",
        options: [
          "The safe and finalized block tags",
          "The pending block tag",
          "EIP-1559 base fee fields",
          "The withdrawals field in block objects",
        ],
        answer: 0,
      },
      {
        question: "An execution endpoint answers eth_getBalance correctly but its latest block is two hours old. Which post-Merge failure mode is this?",
        options: [
          "Its consensus client is down, so nothing is driving the head forward",
          "It ran out of proof-of-work peers to mine with",
          "Its transaction pool rejected every incoming transaction",
          "Its difficulty target became unreachable",
        ],
        answer: 0,
      },
    ],
    related: ["proof-of-stake", "execution-layer", "consensus-layer", "engine-api", "block-tag", "hardfork", "block-header", "reorg"],
    sources: [
      { title: "ethereum.org: The Merge", url: "https://ethereum.org/roadmap/merge/" },
      { title: "EIP-3675: Upgrade consensus to Proof-of-Stake", url: "https://eips.ethereum.org/EIPS/eip-3675" },
      { title: "EIP-4399: Supplant DIFFICULTY opcode with PREVRANDAO", url: "https://eips.ethereum.org/EIPS/eip-4399" },
    ],
  },
  {
    id: "eip",
    title: "Ethereum Improvement Proposals",
    category: "foundations",
    aliases: ["EIP", "ERC", "standards", "eips.ethereum.org", "EIP-1474", "EIP-1898"],
    summary: "An EIP is a numbered document that specifies a change or standard for Ethereum, and because the protocol has no single owner, an EIP is usually the most authoritative description of why an RPC method behaves the way it does.",
    sections: [
      {
        heading: "Types and statuses",
        paragraphs: [
          "Standards Track EIPs split into Core, which changes consensus rules and therefore needs a [[hardfork|network upgrade]]; Networking, which changes [[devp2p|peer protocols]]; Interface, which changes client APIs including JSON-RPC; and ERC, which standardises application-level behaviour such as token contracts. Meta and Informational EIPs describe processes and guidance instead. ERCs now live in their own repository, but the numbering is shared and the canonical `eips.ethereum.org` links still resolve.",
          "A proposal moves through Draft, Review, and Last Call to Final, or stalls into Stagnant or Withdrawn; a few, such as the ERC-20 style registries, are Living. Status describes the document, not the network. Final means the text is frozen, and a Core EIP only takes effect when an upgrade that includes it activates, while an ERC in Draft can already be deployed on thousands of contracts.",
        ],
      },
      {
        heading: "Why RPC behaviour lives here",
        paragraphs: [
          "A surprising amount of the interface is defined by EIP rather than by the [[execution-apis|execution APIs specification]]. EIP-1474 set out the original JSON-RPC surface and the [[rpc-errors|error codes]]; EIP-1898 added the `{blockHash, requireCanonical}` form of the [[block-tag|block parameter]]; EIP-1186 defined [[eth-get-proof|eth_getProof]] and the shape of its [[account-proof|account]] and [[storage-proof|storage]] proofs; EIP-155 introduced the [[chain-id|chain id]]; EIP-55 defined the mixed-case [[address|address]] checksum.",
          "Protocol EIPs change what RPC returns even when no method changes. EIP-1559 added `baseFeePerGas` and `effectiveGasPrice`; EIP-2718 created the [[transaction-types|typed transaction]] envelope that every later type builds on; EIP-4844 added blob fields and [[eth-gas-price|eth_blobBaseFee]]; EIP-4895 added `withdrawals`; [[eip-7702|EIP-7702]] made [[eth-get-code|eth_getCode]] return a delegation designator for an externally owned account. On the tooling side EIP-1193 defines the [[eip-1193|browser provider]] interface.",
        ],
      },
      {
        heading: "Reading one",
        paragraphs: [
          "Every EIP has the same skeleton: Abstract, Motivation, Specification, Rationale, Backwards Compatibility, and Security Considerations. Only Specification is normative, and it is usually short; the Rationale section is where the arguments that shaped the final behaviour are recorded, which is often what you actually need when an implementation surprises you. Backwards Compatibility is the section that tells you what will break in your decoder.",
          "Check two things before relying on a number. First the status and, for a Core EIP, whether it is scheduled in a named upgrade. Second whether clients agree: an EIP can be Final and still be implemented with subtle differences, which is why the [[execution-apis|schemas]] and the clients' own documentation remain the practical reference for anything you send over the wire.",
        ],
      },
    ],
    pitfalls: [
      "Reading Final as deployed; a Core EIP takes effect only when an upgrade including it activates on that network.",
      "Citing an EIP's Rationale or Motivation as normative; only the Specification section defines required behaviour.",
      "Assuming ERC numbers are a separate series; EIPs and ERCs share one number space even though they live in different repositories.",
      "Implementing from an EIP alone for RPC work; client behaviour and the execution APIs schemas are what an endpoint actually follows.",
    ],
    quiz: [
      {
        question: "An EIP has status Final. What does that guarantee about mainnet?",
        options: [
          "Nothing by itself; a Core EIP is live only once an upgrade containing it activates",
          "That it is active on mainnet as of the date in the header",
          "That every client has implemented it",
          "That it can no longer be superseded by another EIP",
        ],
        answer: 0,
      },
      {
        question: "Which EIP defines passing a block hash instead of a number to a read method?",
        options: [
          "EIP-1898",
          "EIP-1474",
          "EIP-1186",
          "EIP-155",
        ],
        answer: 0,
      },
      {
        question: "Which section of an EIP is normative?",
        options: [
          "Specification",
          "Motivation",
          "Rationale",
          "Security Considerations",
        ],
        answer: 0,
      },
    ],
    related: ["hardfork", "execution-apis", "rpc-errors", "block-tag", "chain-id", "transaction-types", "eip-1193", "json-rpc"],
    sources: [
      { title: "EIP-1: EIP Purpose and Guidelines", url: "https://eips.ethereum.org/EIPS/eip-1" },
      { title: "Ethereum Improvement Proposals", url: "https://eips.ethereum.org/" },
      { title: "EIP-1474: Remote procedure call specification", url: "https://eips.ethereum.org/EIPS/eip-1474" },
    ],
  },
  {
    id: "hardfork",
    title: "Network upgrades",
    category: "foundations",
    aliases: ["hard fork", "fork", "Shapella", "Dencun", "Pectra", "Fusaka", "upgrade"],
    summary: "A network upgrade is a coordinated change to the consensus rules that every client activates at the same timestamp or epoch, so a node running old software does not follow a softer chain but falls off the canonical one entirely.",
    sections: [
      {
        heading: "How activation works",
        paragraphs: [
          "Activation is scheduled, not negotiated. Since [[the-merge|the Merge]] an execution-layer fork activates at a Unix timestamp written into the client's chain configuration, and the matching consensus-layer fork activates at an epoch. Both halves of a node must be configured and upgraded, because they fork together: a client that does not know the rules either rejects the first valid post-fork block or produces one nobody else accepts. This is why an upgrade is announced months ahead and rehearsed on [[testnets|testnets]] first.",
          "Names come in pairs, one per layer, and are usually contracted. Shanghai and Capella became Shapella, Cancun and Deneb became Dencun, Prague and Electra became Pectra, and Osaka and Fulu became Fusaka. The [[execution-apis|Engine API specification]] is organised by these fork names for the same reason.",
        ],
      },
      {
        heading: "The recent upgrades",
        paragraphs: [
          "Shapella, on 12 April 2023, enabled validator [[withdrawals|withdrawals]] through EIP-4895 and added the `PUSH0` opcode. Dencun, on 13 March 2024, introduced [[blob|blob transactions]] with EIP-4844, transient storage with EIP-1153, the parent [[beacon-block|beacon block]] root in the [[evm|EVM]] with EIP-4788, and the narrowed `SELFDESTRUCT` of EIP-6780.",
          "Pectra, on 7 May 2025, was unusually broad: [[eip-7702|set code transactions]], a maximum effective balance of 2048 ETH for a [[validator|validator]], a blob target and maximum of 6 and 9, BLS precompiles, execution-layer exits and in-block deposits, higher calldata costs, and the `requestsHash` [[block-header|header field]] from EIP-7685. Fusaka followed in December 2025 with PeerDAS, which changes how blob [[data-availability|data availability]] is sampled, and is being followed by blob-parameter-only forks that raise blob limits on their own schedule. The next upgrade, Glamsterdam, is still upcoming.",
        ],
      },
      {
        heading: "What an RPC consumer checks",
        paragraphs: [
          "Three things break applications at a fork. New [[block-header|header fields]] appear in block objects, so a strict decoder that rejects unknown keys fails on the first post-fork block. New [[transaction-types|transaction types]] appear, so a switch statement over `type` that throws on an unknown value breaks on the first one. And new methods or fields become available, such as `eth_blobBaseFee` after Dencun, which code can only use once the endpoint has upgraded.",
          "Operationally, upgrade both clients before the timestamp and confirm they agree on the [[engine-api|Engine API]] versions, because a mismatched pair stalls at the fork rather than degrading gracefully. Check that your [[rpc-provider|provider]] has upgraded too, re-measure anything that depends on gas costs since a fork can reprice opcodes and calldata, and remember that testnets fork weeks earlier, which makes them the place to find a broken decoder before mainnet does.",
        ],
      },
    ],
    pitfalls: [
      "Decoding block and transaction objects strictly; every upgrade may add fields, and a decoder that rejects unknown keys fails the moment it activates.",
      "Upgrading the [[execution-client|execution client]] but not the [[consensus-client|consensus client]], which stalls the node at the fork instead of warning you.",
      "Hard-coding gas estimates across an upgrade; repricings such as the calldata cost change in Pectra silently invalidate them.",
      "Assuming a provider forks at the same instant you do; confirm their upgrade window rather than discovering it from failing calls.",
    ],
    quiz: [
      {
        question: "How does a post-Merge execution-layer fork activate?",
        options: [
          "At a fixed Unix timestamp written into the client's chain configuration",
          "When a supermajority of miners signals readiness",
          "At a block number voted on by validators",
          "When the consensus client sends an engine_forkchoiceUpdated with a fork flag",
        ],
        answer: 0,
      },
      {
        question: "Which upgrade introduced blob transactions?",
        options: [
          "Dencun, in March 2024",
          "Shapella, in April 2023",
          "Pectra, in May 2025",
          "The Merge, in September 2022",
        ],
        answer: 0,
      },
      {
        question: "Why is a strict JSON decoder a liability across network upgrades?",
        options: [
          "Upgrades add header and object fields, and rejecting unknown keys fails on the first new block",
          "Upgrades change the hex encoding rules for existing fields",
          "Upgrades rename existing fields rather than adding new ones",
          "Upgrades switch the response format from JSON to SSZ",
        ],
        answer: 0,
      },
    ],
    related: ["eip", "the-merge", "engine-api", "testnets", "blob", "transaction-types", "block-header", "execution-apis"],
    sources: [
      { title: "ethereum.org: History and forks", url: "https://ethereum.org/history/" },
      { title: "Ethereum Improvement Proposals", url: "https://eips.ethereum.org/" },
      { title: "ethereum/execution-specs: network upgrade specifications", url: "https://github.com/ethereum/execution-specs" },
    ],
  },
  {
    id: "testnets",
    title: "Testnets",
    category: "foundations",
    aliases: ["Sepolia", "Hoodi", "Holesky", "Goerli", "Ephemery", "faucet", "test network"],
    summary: "A testnet is a separate Ethereum network with its own [[chain-id|chain id]] and worthless ether, running the same clients and the same RPC surface as mainnet: Sepolia for application work, Hoodi for staking and validator work.",
    sections: [
      {
        heading: "Which network to use",
        paragraphs: [
          "Sepolia, chain id 11155111, is the default for application testing. It is comparatively small and quick to sync, and its validator set is permissioned, which keeps it stable but means it is not a realistic rehearsal for staking software. Hoodi, chain id 560048 and launched in March 2025, is the network for validator, staking, and node-operator testing, with a permissionless validator set; it replaced Holesky, chain id 17000, which was deprecated in 2025 after Goerli's deprecation in 2024.",
          "Two other kinds of network fill the gaps. Ephemery resets on a fixed period, so it never accumulates state and is useful for automated testing that would otherwise need a fresh chain. Short-lived devnets, usually spun up with tooling such as the Kurtosis ethereum package, are how client teams rehearse an upgrade before it reaches a public testnet. For unit tests and local iteration, a [[local-devnet|local development node]] beats any of them.",
        ],
      },
      {
        heading: "Why the RPC behaves the same",
        paragraphs: [
          "A testnet runs the same [[execution-client|execution clients]] and [[consensus-client|consensus clients]] as mainnet with a different [[genesis|genesis and chain configuration]]. The [[namespaces|namespaces]], the [[hex-encoding|encodings]], the [[block-tag|block tags]], the [[rpc-errors|error codes]], and the [[engine-api|Engine API]] are all identical, so code written against a testnet endpoint works unchanged against mainnet. That is the point: the network differs, the interface does not.",
          "Some practical differences favour testing. History and [[state|state]] are small enough that an [[archive-node|archive node]] is cheap to run and full history is easy to scan with [[eth-get-logs|eth_getLogs]]. Fees are near zero, so gas budgeting exercises nothing. Getting ether at all requires a faucet, which is usually rate limited per address and per day.",
        ],
      },
      {
        heading: "Where they differ in ways that bite",
        paragraphs: [
          "Testnets upgrade weeks before mainnet, which is a feature and a trap: a field or [[transaction-types|transaction type]] that exists on Sepolia may not exist on mainnet yet, and code that silently depends on it passes every test and fails in production. The reverse also happens after a [[hardfork|network upgrade]] ships, when mainnet has moved and an old testnet deployment has not.",
          "Addresses and infrastructure diverge too. A contract you depend on may be absent, deployed at a different address, or a stub with different behaviour, and oracles and name resolution often differ or are simply missing. The [[mempool|transaction pool]] is thinner and less competitive, so anything tuned against real fee pressure or ordering behaves differently. Check [[chain-id|eth_chainId]] on every connection so a misconfigured endpoint fails loudly rather than sending a real transaction to the wrong network.",
        ],
      },
    ],
    pitfalls: [
      "Testing staking or validator software on Sepolia; its permissioned validator set makes it a poor rehearsal, and Hoodi exists for exactly that.",
      "Hard-coding a contract address that happens to be identical on a testnet and on mainnet; only deterministic deployments guarantee that.",
      "Trusting gas and fee behaviour measured on a testnet, where an almost empty transaction pool hides real fee pressure entirely.",
      "Relying on a public testnet endpoint for load testing; faucets and shared endpoints are rate limited far more aggressively than paid mainnet ones.",
    ],
    quiz: [
      {
        question: "Which testnet is intended for validator and staking software testing?",
        options: [
          "Hoodi, chain id 560048",
          "Sepolia, chain id 11155111",
          "Goerli, chain id 5",
          "Ephemery, which resets periodically",
        ],
        answer: 0,
      },
      {
        question: "Why can a feature work on Sepolia and fail on mainnet with the same code?",
        options: [
          "Testnets activate network upgrades weeks earlier, so a field or transaction type may not exist on mainnet yet",
          "Testnets use a different hex encoding for quantities",
          "Testnet clients implement extra JSON-RPC namespaces by default",
          "Testnet block objects omit fields that mainnet includes",
        ],
        answer: 0,
      },
      {
        question: "Which check catches a deployment accidentally pointed at the wrong network?",
        options: [
          "Comparing eth_chainId against the expected value on every connection",
          "Comparing web3_clientVersion against the expected client",
          "Checking that eth_syncing returns false",
          "Checking that the latest block timestamp is recent",
        ],
        answer: 0,
      },
    ],
    related: ["chain-id", "hardfork", "local-devnet", "genesis", "archive-node", "execution-client", "health-check", "the-merge"],
    sources: [
      { title: "ethereum.org: Networks", url: "https://ethereum.org/developers/docs/networks/" },
      { title: "EIP-155: Simple replay attack protection", url: "https://eips.ethereum.org/EIPS/eip-155" },
      { title: "Nethermind: supported networks", url: "https://docs.nethermind.io/" },
    ],
  },
];
