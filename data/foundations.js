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
          "The other three are narrower. The [[engine-api|Engine API]] is private plumbing, by default on port 8551 and authenticated with a shared JWT secret, over which the [[consensus-client|consensus client]] hands [[execution-payload|execution payloads]] to the execution client and names the head, safe, and finalized blocks. The [[beacon-api|Beacon API]] is a REST interface on the consensus side covering slots, validators, [[finality|finality]] checkpoints, and blobs. The [[eip-1193|EIP-1193 provider]] is the JavaScript object a browser wallet exposes to a page, which calls `window.ethereum.request` and lets the wallet decide which node answers.",
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
          "Only part of what an endpoint offers is specified. The [[execution-apis|execution-apis]] repository defines `eth_`, `net_`, `web3_`, and the [[engine-api|Engine API]] as [[openrpc|OpenRPC]] schemas. Everything else is convention: `debug_` follows [[geth|Geth]]'s shape, the [[trace-api|trace_ namespace]] follows Parity's and is implemented by [[nethermind|Nethermind]], [[erigon|Erigon]], and [[reth|Reth]], [[txpool-api|txpool_]] and [[admin-api|admin_]] differ per client, and `personal_` is deprecated in favour of external signers. Hosted [[rpc-provider|providers]] add their own enhanced methods on top.",
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
    related: ["request-response", "namespaces", "execution-apis", "hex-encoding", "block-tag", "rpc-errors", "http-transport", "eth-call", "endpoint-capabilities", "execution-layer"],
    sources: [
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
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
    aliases: ["execution-apis", "eth spec", "api specification", "hive"],
    summary: "`ethereum/execution-apis` is the repository that normatively defines the [[execution-layer|execution layer]]'s RPC surface: machine-readable [[openrpc|OpenRPC]] schemas for the `eth_` and `net_` methods and parts of `debug_` and `txpool_`, the [[engine-api|Engine API]] specification, and the shared test fixtures clients are checked against.",
    sections: [
      {
        heading: "What the repository holds",
        paragraphs: [
          "Each method has a schema file describing its parameters, its result, and the exact types involved: a QUANTITY, a 20-byte DATA [[address|address]], a 32-byte hash, a block object. Those files are compiled into a single `openrpc.json` document, which is what the rendered API documentation and most code generators consume. Because the types are machine-readable, a disagreement about whether a field is optional or whether an unknown [[block|block]] returns `null` has one place to be settled.",
          "The [[engine-api|Engine API]] lives in the same repository, mainly in prose specifications split by fork, so `engine_newPayloadV3` and its Cancun rules sit in one document and the Prague version in another. That split is deliberate: the [[json-rpc|application-facing API]] evolves slowly and additively, while the consensus-to-execution interface gains a new method version at nearly every [[hardfork|network upgrade]]. Machine-readable [[openrpc|OpenRPC]] schemas for the Engine API methods sit beside the prose under `src/engine/openrpc`.",
        ],
      },
      {
        heading: "How a method becomes standard",
        paragraphs: [
          "The path is a pull request, not automatically an [[eip|EIP]]. A method is proposed, argued over by client teams, usually implemented by at least two [[execution-client|execution clients]], and then merged as a schema. [[eth-get-block-receipts|eth_getBlockReceipts]] and [[eth-simulate|eth_simulateV1]] both arrived this way after existing as client extensions first. EIP-1474 still describes the older baseline and the error codes, but the repository is what client teams treat as current.",
          "Methods that never make it stay client-specific. The Parity-style [[trace-api|trace_ namespace]] is absent and documented only by the clients that implement it, which is exactly why its availability and output shapes vary. The [[debug-api|debug_ namespace]] is covered in part: the specification has long carried `debug_getRawHeader`, `debug_getRawBlock`, `debug_getRawTransaction`, `debug_getRawReceipts` and `debug_getBadBlocks`, and since June 2026 `debug_traceTransaction`, `debug_traceBlockByNumber` and `debug_traceBlockByHash` with a standardised opcode tracer, while `debug_traceCall` and the output of named tracers such as `callTracer` remain client-defined. Other recent additions took the same pull-request path: `txpool_status`, `txpool_content` and `txpool_contentFrom` in April 2026, `eth_capabilities`, which [[eth-capabilities|reports the head and how far back each kind of data is retained]], in June 2026, and a catalogue of [[rpc-errors|error groups]] that so far only the transaction-submission methods reference.",
        ],
      },
      {
        heading: "Conformance and its limits",
        paragraphs: [
          "The repository carries request and response test vectors, and the community `hive` [[hive|harness]] runs them against real client builds so that an answer's shape, not just its value, is compared. This is a practical lever for [[client-diversity|client diversity]]: an application written against the schema should get the same field names from [[geth|Geth]], [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]], and [[besu|Besu]].",
          "What the specification does not fix is everything operational. It says nothing about [[authentication|authentication]], [[rate-limits|rate limits]], block-range caps on [[eth-get-logs|eth_getLogs]], gas caps on [[eth-call|eth_call]], or how much history a node must keep. A node can be fully conformant and still refuse your query.",
        ],
      },
    ],
    pitfalls: [
      "Treating the rendered API documentation as exhaustive; `trace_` is absent from it, and only a few `debug_` methods are specified, so `debug_traceCall` and named tracers such as `callTracer` behave however each client decides.",
      "Assuming a method present in the schema is enabled on your endpoint; namespaces and per-method allow-lists are an operator decision.",
      "Reading a single Engine API document for all forks; the method versions are specified per fork and an old page describes an old payload shape.",
    ],
    related: ["json-rpc", "engine-api", "namespaces", "eip", "client-diversity", "endpoint-capabilities", "hardfork", "rpc-errors", "openrpc", "hive"],
    sources: [
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
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
          "`eth_` is the interface applications use: [[block|blocks]], transactions, receipts, [[eth-get-logs|logs]], [[state|state]] reads, simulation, fee data, and [[eth-send-raw-transaction|eth_sendRawTransaction]]. `net_` and `web3_` are tiny and describe the process rather than the chain, through [[net-web3-api|net_peerCount, net_listening, and web3_clientVersion]]. The [[execution-apis|execution APIs specification]] defines `eth_` and `net_`, plus part of `debug_` and `txpool_`, but not `web3_`, which clients serve by convention; an endpoint that offers only these three is still a useful endpoint.",
          "`eth_` also hides a wallet-era wart. `eth_accounts`, `eth_sign`, and [[eth-send-transaction|eth_sendTransaction]] assume the node holds private keys. Public nodes leave those disabled, and browser wallets implement the same names themselves behind the [[eip-1193|EIP-1193 provider]], which is why the method name you call in a dapp is not always answered by a node.",
        ],
      },
      {
        heading: "Diagnostic and administrative namespaces",
        paragraphs: [
          "The [[debug-api|debug_ namespace]] is [[geth|Geth]]-shaped and gives transaction and block tracing plus raw RLP access; the [[trace-api|trace_ namespace]] is the older Parity shape offered by [[nethermind|Nethermind]], [[erigon|Erigon]], and [[reth|Reth]]. Both are expensive: one `debug_traceBlockByNumber` can cost more than thousands of ordinary reads. The [[txpool-api|txpool_ namespace]] exposes the node's [[mempool|pending and queued transactions]], and the [[admin-api|admin_ namespace]] can add peers and start or stop listeners. `personal_` managed local keys and is deprecated in favour of external signers.",
          "Two namespaces are not part of this surface at all. `engine_` is only valid on the authenticated [[engine-api|Engine API]] listener, and clients refuse it on the public port. [[client-namespaces|Client-specific prefixes]] such as the `ots_` that Erigon, and in part Reth, serve for [[otterscan|Otterscan]], and provider-specific prefixes added by hosted [[rpc-provider|providers]], round out what a given endpoint may answer.",
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
    aliases: ["http", "https", "post", "keep-alive", "rest endpoint"],
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
          "The transport also imposes limits the specification does not. [[reverse-proxy|Reverse proxies]] cap body size and set read timeouts that abort a long [[debug-api|debug_ trace]] mid-flight, and browsers add [[cors|CORS]]: a page can only call an endpoint whose responses carry permissive `access-control-allow-origin` headers, configured in Geth with `--http.corsdomain` and guarded separately by `--http.vhosts`.",
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
    related: ["websocket-transport", "ipc-transport", "json-rpc", "rpc-errors", "batch-request", "load-balancer", "rate-limits", "caching", "cors"],
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
      code: "{\n  \"blockNumber\": \"0x12d4f1c\",          // QUANTITY: 19746588, no leading zeros\n  \"gasUsed\": \"0x5208\",                 // QUANTITY: 21000\n  \"status\": \"0x1\",                     // QUANTITY: success\n  \"value\": \"0xde0b6b3a7640000\",        // QUANTITY: 1e18 wei = 1 ether\n  \"from\": \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",   // DATA: exactly 20 bytes\n  \"input\": \"0x\",                       // DATA: empty byte string\n  \"storageValue\": \"0x0000000000000000000000000000000000000000000000000000000000000001\"  // DATA: 32 bytes\n}",
      note: "`status` and `storageValue` both encode one, but `status` is a QUANTITY and `storageValue` is a fixed-width DATA word.",
    },
    pitfalls: [
      "Parsing a wei value with `Number()` or `parseInt`; anything above 2^53 loses precision without any error being raised.",
      "Sending a zero-padded block number such as `0x01`; QUANTITY forbids leading zeros and clients reject it with invalid params.",
      "Comparing addresses byte-for-byte as strings when one side is EIP-55 checksummed and the other is lowercase.",
      "Expecting `eth_getStorageAt` to return a trimmed value; it returns the full 32-byte word, so `0x0` and `0x00…00` are not interchangeable here.",
    ],
    related: ["json-rpc", "block-tag", "wei", "eth-get-storage-at", "address", "request-response", "rlp", "eth-get-balance"],
    sources: [
      { title: "ethereum.org: JSON-RPC hex value encoding", url: "https://ethereum.org/developers/docs/apis/json-rpc/#hex-value-encoding" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
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
          "`safe` and `finalized` arrived with [[the-merge|the Merge]]. `finalized` is the most recent block that [[finality|Casper FFG finality]] has locked in; under normal conditions it trails the head by two to three epochs, about 13 to 19 minutes, and reverting it would require at least a third of all staked ETH to be slashed. `safe` is the block the [[consensus-client|consensus client]] considers extremely unlikely to be reorged. The consensus specs now define it through the [[fast-confirmation-rule|Fast Confirmation Rule]], which under normal network conditions confirms blocks much closer to the head, but a client that does not run that rule sends the block at the latest justified checkpoint, which usually trails the head by one to two epochs, about 6 to 13 minutes. `earliest` is the [[genesis|genesis block]] and is mostly useful as the start of a range.",
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
    related: ["finality", "reorg", "eth-get-balance", "eth-call", "pruned-node", "archive-node", "head-lag", "hex-encoding"],
    sources: [
      { title: "EIP-1898: Add blockHash to defaultBlock methods", url: "https://eips.ethereum.org/EIPS/eip-1898" },
      { title: "ethereum.org: JSON-RPC default block parameter", url: "https://ethereum.org/developers/docs/apis/json-rpc/#default-block" },
      { title: "Consensus specs: safe execution block (fast confirmation)", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/bellatrix/fast-confirmation.md" },
    ],
  },
  {
    id: "chain-id",
    title: "Chain ID",
    category: "foundations",
    aliases: ["eth_chainId", "net_version", "EIP-155", "network id", "replay protection"],
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
          "Common values are worth memorising: mainnet is 1, Sepolia is 11155111, Hoodi is 560048, and the deprecated Holesky was 17000; see [[testnets|testnets]]. Layer 2 networks have their own, and community registries such as [[chainlist|chainlist]] map ids to public endpoints and currency symbols. Because anyone can pick an id for a private network, a matching chain id proves intent, not authenticity.",
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
    related: ["testnets", "eip", "net-web3-api", "eth-send-raw-transaction", "health-check", "failover", "wallet-rpc", "genesis", "chainlist", "gnosis-chain"],
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
          "Its job is ordering and agreement, not computation. [[attestation|Attestations]] from validators feed the [[fork-choice|LMD-GHOST fork choice]] that picks a head, and Casper FFG turns accumulated votes into justified and finalized checkpoints, normally two epochs behind the head; see [[finality|finality]]. It also runs [[sync-committee|sync committees]] so that [[light-client|light clients]] can follow along, and it gossips [[blob|blob]] data, as data column sidecars since Fulu, which it retains for 4096 epochs, roughly 18 days.",
        ],
      },
      {
        heading: "A different interface",
        paragraphs: [
          "[[consensus-client|Consensus clients]] do not speak JSON-RPC to applications. They expose the [[beacon-api|Beacon API]], a REST interface with paths such as `/eth/v1/node/syncing` and `/eth/v1/beacon/headers`, on a client-specific port such as Lighthouse's 5052, and networking over libp2p gossip on port 9000 rather than [[devp2p|devp2p]]; see [[libp2p-gossip|consensus networking]]. A [[validator-client|validator client]] holding keys is a separate process that talks to a [[beacon-node|beacon node]] over that same API.",
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
    aliases: ["beacon node api", "5052", "3500", "REST", "eth/v1/beacon", "consensus api"],
    summary: "The Beacon API is the consensus client's REST interface, on a port that differs by client (5052 on Lighthouse and Nimbus), serving beacon blocks and states, validator data, node status, chain configuration, and a server-sent event stream, in JSON or SSZ.",
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
          "The `/eth/v1/beacon` group covers chain data: [[beacon-block|beacon blocks]], headers, [[attestation|attestation]] and exit pools, [[validator|validator]] balances and statuses under `/eth/v1/beacon/states/{state_id}/validators`, [[finality|finality]] state under `/eth/v1/beacon/states/{state_id}/finality_checkpoints`, and [[blob|blobs]] under `/eth/v1/beacon/blobs/{block_id}`, which beacon-APIs v4.0.0 added when it deprecated `/eth/v1/beacon/blob_sidecars/{block_id}`. The `/eth/v1/node` group reports `syncing`, `health`, `identity`, `version`, and `peers`, which is what an operator's [[health-check|health check]] uses. The `/eth/v1/config` group returns the spec constants and the fork schedule, so a tool can discover a network's parameters instead of hard-coding them.",
          "Two groups are not for general use. `/eth/v1/validator` serves duties, attestation data, and block production to a [[validator-client|validator client]], and the `/eth/v1/debug` routes dump whole beacon states, which are large and expensive. [[beacon-endpoints|The concrete route reference]] lists the rest.",
        ],
      },
      {
        heading: "Events and what only this API can answer",
        paragraphs: [
          "`/eth/v1/events` is a [[server-sent-events|server-sent event stream]], the consensus-side counterpart to [[eth-subscribe|eth_subscribe]]. Subscribing to topics such as `head`, `block`, `finalized_checkpoint`, and `chain_reorg` gives a push notification the moment the [[fork-choice|fork choice]] moves, which is a cleaner reorg signal than polling execution blocks and comparing parent hashes.",
          "Some facts exist nowhere else. Whether a validator is active, exited, or slashed; what the current justified and finalized checkpoints are; which validators sit on the [[sync-committee|sync committee]]; and blob contents, which the [[consensus-layer|consensus layer]] keeps for about 18 days and the [[execution-layer|execution layer]] never stores at all. Since Fulu a node keeps them as the data columns it custodies, with their KZG proofs, rather than as whole blob sidecars, so only a supernode, which custodies every column, is required to return full blobs. [[checkpoint-sync|Checkpoint sync]] and [[light-client|light clients]] are both built on this API.",
        ],
      },
      {
        heading: "Running and exposing it",
        paragraphs: [
          "The port is a client choice: 5052 for [[lighthouse|Lighthouse]] and [[nimbus|Nimbus]], 5051 for [[teku|Teku]], 9596 for [[lodestar|Lodestar]], while [[prysm|Prysm]] serves its REST interface on 3500 alongside its own gRPC interface. It is off by default in several clients and is enabled with an `--http` style flag. Exposing it publicly is a real decision, not a formality: the validator and debug routes are sensitive, event streams and state dumps are expensive, and there is no built-in [[authentication|authentication]], so put a [[reverse-proxy|reverse proxy]] in front if it must be reachable.",
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
      "Assuming blobs are available for old blocks; the consensus layer drops them after roughly 18 days, and older ones come only from a [[blob-archive|blob archive]].",
    ],
    related: ["consensus-layer", "beacon-endpoints", "beacon-node", "validator-client", "engine-api", "checkpoint-sync", "finality", "blob", "consensus-client"],
    sources: [
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "ethereum/beacon-APIs", url: "https://github.com/ethereum/beacon-APIs" },
      { title: "Lighthouse Book: Beacon node API", url: "https://lighthouse-book.sigmaprime.io/api_bn.html" },
    ],
  },
  {
    id: "the-merge",
    title: "The Merge",
    category: "foundations",
    aliases: ["merge", "paris", "proof of work to proof of stake", "september 2022", "TTD"],
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
          "Several [[block-header|header fields]] became constants. `difficulty` is `0x0`, the header `nonce` is zero, the ommers list is always empty so `sha3Uncles` never varies, and `mixHash` now carries `prevRandao`, [[randao|the consensus layer's randomness]] for that block. Mining methods such as `eth_getWork` disappeared from clients, and issuance moved to the consensus layer, so the execution block no longer pays a block reward.",
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
      "Treating `mixHash` as a mining artefact; it carries `prevRandao`, defined by EIP-4399, which is consensus randomness that a proposer can bias and predict a block ahead, so a contract using it needs the lookahead the [[randao|RANDAO]] lesson describes.",
      "Assuming `withdrawals` exists in every post-Merge block; the field was introduced at Shapella, months later.",
      "Expecting the Merge to have changed fees or throughput; it changed who produces blocks, not how much they can hold.",
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
          "A proposal moves through Draft, Review, and Last Call to Final, or stalls into Stagnant or Withdrawn; a few process documents, such as EIP-1 itself, are Living. Status describes the document, not the network. Final means the text is frozen, and a Core EIP only takes effect when an upgrade that includes it activates, while an ERC in Draft can already be deployed on thousands of contracts.",
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
    related: ["eip", "the-merge", "engine-api", "testnets", "blob", "transaction-types", "block-header", "execution-apis", "kurtosis"],
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
    aliases: ["Sepolia", "Hoodi", "Holesky", "Goerli", "test network"],
    summary: "A testnet is a separate Ethereum network with its own [[chain-id|chain id]] and worthless ether, running the same clients and the same RPC surface as mainnet: Sepolia for application work, Hoodi for staking and validator work.",
    sections: [
      {
        heading: "Which network to use",
        paragraphs: [
          "Sepolia, chain id 11155111, is the default for application testing. It is comparatively small and quick to sync, and its validator set is permissioned, which keeps it stable but means it is not a realistic rehearsal for staking software. Hoodi, chain id 560048 and launched in March 2025, is the network for validator, staking, and node-operator testing, with a permissionless validator set; it replaced Holesky, chain id 17000, which was deprecated in 2025 after Goerli's deprecation in 2024.",
          "Two other kinds of network fill the gaps. [[ephemery|Ephemery]] resets on a fixed period, so it never accumulates state and is useful for automated testing that would otherwise need a fresh chain. Short-lived devnets, usually spun up with tooling such as the [[kurtosis|Kurtosis ethereum package]], are how client teams rehearse an upgrade before it reaches a public testnet. For unit tests and local iteration, a [[local-devnet|local development node]] beats any of them.",
        ],
      },
      {
        heading: "Why the RPC behaves the same",
        paragraphs: [
          "A testnet runs the same [[execution-client|execution clients]] and [[consensus-client|consensus clients]] as mainnet with a different [[genesis|genesis and chain configuration]]. The [[namespaces|namespaces]], the [[hex-encoding|encodings]], the [[block-tag|block tags]], the [[rpc-errors|error codes]], and the [[engine-api|Engine API]] are all identical, so code written against a testnet endpoint works unchanged against mainnet. That is the point: the network differs, the interface does not.",
          "Some practical differences favour testing. History and [[state|state]] are small enough that an [[archive-node|archive node]] is cheap to run and full history is easy to scan with [[eth-get-logs|eth_getLogs]]. Fees are near zero, so gas budgeting exercises nothing. Getting ether at all requires a [[faucet|faucet]], which is usually rate limited per address and per day.",
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
    related: ["chain-id", "hardfork", "local-devnet", "genesis", "archive-node", "execution-client", "health-check", "the-merge", "faucet", "ephemery"],
    sources: [
      { title: "ethereum.org: Networks", url: "https://ethereum.org/developers/docs/networks/" },
      { title: "EIP-155: Simple replay attack protection", url: "https://eips.ethereum.org/EIPS/eip-155" },
      { title: "Nethermind: supported networks", url: "https://docs.nethermind.io/" },
    ],
  },
  {
    id: "ephemery",
    title: "Ephemery",
    category: "foundations",
    aliases: ["Ephemery testnet", "ephemeral testnet", "resetting testnet", "39438000", "retention.sh", "ephemery-genesis"],
    summary: "Ephemery is a public Ethereum [[testnets|testnet]] that throws its whole chain away every 28 days and restarts from a new [[genesis|genesis]] with a new [[chain-id|chain id]], so it never accumulates state and never runs short of test ether.",
    sections: [
      {
        heading: "One network, many iterations",
        paragraphs: [
          "Each run of the network is an iteration, and the genesis of the next is derived from the previous one. The genesis timestamp moves forward by the period, 2,419,200 seconds; the chain id becomes 39438000 plus the iteration number, so `eth_chainId` minus 39438000 is the iteration a node is on; and the genesis validator set is altered by the iteration number so the consensus fork digest changes while the fork versions stay fixed. Everything else — execution [[state|state]], blocks, receipts, the beacon state — is discarded. Each iteration's files are published as a release of the `ephemery-testnet/ephemery-genesis` repository, tagged `ephemery-` followed by the iteration number, and each iteration's fork schedule activates the latest upgrades at or soon after genesis, so an Ephemery node must run a client release that already supports them.",
          "The design exists to avoid the problems of long-lived testnets: scarce ether, inactive [[validator|validators]], and state bloat. Every genesis premines the operators and the [[faucet|faucets]] with millions of ether, so faucets refill themselves, and validators whose public keys are committed to the genesis repository are active from the first slot. The period is not arbitrary: the specification sizes it against the number of genesis validators, so that validators deposited later cannot activate fast enough to push the genesis set below a two-thirds majority before the next reset.",
        ],
      },
      {
        heading: "What a reset does to a node",
        paragraphs: [
          "For an [[execution-client|execution]] or [[consensus-client|consensus client]], a reset is a new network: the old database cannot continue, so the node must be stopped, its data directory cleared, the new genesis initialised, and the client restarted. The project's `retention.sh`, run from cron every five minutes, does exactly that, keeping node keys and deleting chain data. A few clients know the network natively: [[besu|Besu]] and [[teku|Teku]] accept `--network=ephemery` and derive the current iteration themselves, and Teku implements the reset as well. [[beacon-node|Beacon nodes]] can [[checkpoint-sync|checkpoint sync]] from several public Ephemery endpoints, and the [[kurtosis|Kurtosis]] `ethereum-package` joins the current iteration with `network: ephemery`.",
        ],
      },
      {
        heading: "What a reset does to RPC consumers",
        paragraphs: [
          "For anything that reads the chain over RPC, a reset looks like nothing it was designed for. Block numbers restart at zero, every [[block-hash|block hash]] and transaction hash from the previous iteration is gone, and contracts must be redeployed. An [[indexer|indexer]] whose cursor says block 190,000 with hash X finds a lower head and a different hash at every height it checks; handled as a [[reorg|reorg]], that would roll back 190,000 blocks one at a time. The reliable signal is the chain id or the genesis block hash changing, which should trigger a wipe and a fresh start, and the same applies to a [[block-explorer|block explorer]]'s database.",
          "Changing the chain id is deliberate: EIP-155 then makes any replay-protected transaction signed for one iteration invalid on the next, and no tool can confuse two iterations. The cost lands on configuration. The public RPC URLs stay the same across resets, so a wallet network saved with last month's id no longer matches `eth_chainId` and must be re-added, and hard-coded ids in deployment scripts, test fixtures, and [[eip-712|EIP-712]] domains all break at the next reset. Contract addresses can survive: the same deployer key starting from nonce zero on a fresh chain produces the same `CREATE` addresses in the same order. Balances, approvals, and registrations do not, which makes Ephemery a good fit for automated tests that build their world from scratch and a poor one for anything that must persist.",
        ],
      },
    ],
    example: {
      title: "Detecting a new iteration before resuming an indexer",
      language: "bash",
      code: "# stored by the indexer at the end of its last run\nLAST_CHAIN_ID=$(cat state/chain_id)\nLAST_GENESIS=$(cat state/genesis_hash)\n\nchain_id=$(cast chain-id --rpc-url $EPHEMERY_RPC)     # 39438000 + iteration\ngenesis=$(cast block 0 --field hash --rpc-url $EPHEMERY_RPC)\n\n# the current iteration, also the tag of its release: ephemery-<iteration>\ngh release view -R ephemery-testnet/ephemery-genesis --json tagName -q .tagName\n\nif [ $chain_id != $LAST_CHAIN_ID ] || [ $genesis != $LAST_GENESIS ]; then\n  echo new iteration $((chain_id - 39438000)): wiping the index and starting from block 0\n  echo $chain_id > state/chain_id; echo $genesis > state/genesis_hash\nfi",
      note: "The chain id alone identifies an Ephemery iteration, since subtracting 39438000 gives its number; checking the genesis hash as well also catches devnets that restart without changing their id.",
    },
    pitfalls: [
      "Saving Ephemery in a wallet or config with a fixed chain id; it changes every iteration, and transactions signed with last month's id are rejected.",
      "Letting an indexer treat a reset as a deep reorg instead of detecting the new genesis and starting over.",
      "Restarting a node on its old data directory after a reset, which cannot join the new iteration.",
      "Running an older client release; each iteration activates the latest upgrades near genesis, and a client without them drops off at the fork.",
      "Using Ephemery for a demo deployment or a soak test that has to outlive the 28-day period.",
    ],
    related: ["testnets", "chain-id", "genesis", "faucet", "kurtosis", "checkpoint-sync", "indexer", "reorg", "besu", "teku"],
    sources: [
      { title: "ephemery-testnet/ephemery-resources (network info and spec)", url: "https://github.com/ephemery-testnet/ephemery-resources" },
      { title: "ephemery-testnet/ephemery-genesis (per-iteration releases)", url: "https://github.com/ephemery-testnet/ephemery-genesis" },
      { title: "ethereum.org: Networks", url: "https://ethereum.org/developers/docs/networks/" },
    ],
  },
  {
    id: "gnosis-chain",
    title: "Gnosis Chain",
    category: "foundations",
    aliases: ["Gnosis", "xDAI", "xDai chain", "GNO", "Chiado", "chain id 100", "gnosis beacon chain"],
    summary: "Gnosis Chain is an EVM network with [[chain-id|chain id]] 100 whose native gas token is the DAI-backed xDAI and whose own beacon chain is secured by validators staking GNO; it runs Ethereum's client software with different constants, a two-token model and chain-specific rules a mainnet caller should not assume.",
    sections: [
      {
        heading: "Same architecture, different constants",
        paragraphs: [
          "Since its merge Gnosis Chain has run exactly the structure of Ethereum: an [[execution-layer|execution layer]] and a [[consensus-layer|consensus layer]] joined by the [[engine-api|Engine API]]. The numbers differ. Its chain id is 100 (`0x64`) and its testnet, Chiado, is 10200 (`0x27d8`). Slots are 5 seconds and epochs 16 slots, so an epoch lasts 80 seconds, blocks arrive every 5 seconds, and [[finality|finality]] lands within a few minutes rather than about 13. The beacon chain uses its own `gnosis` preset, which `/eth/v1/config/spec` reports, and tools that hard-code 12-second slots or 32-slot epochs compute wrong times and wrong epochs.",
          "Fees differ too. The EIP-1559 base fee is not burned but paid to a fee collector address, `0x6BBe78ee9e474842Dbd4AB4987b3CeFE88426A92`, since block 19,040,000, so burn-based supply accounting does not apply. Blobs target one per block with a maximum of two, the blob base fee has a 1 gwei floor, and blob data is kept for 16,384 epochs, about 15 days. Execution clients are [[nethermind|Nethermind]] and [[erigon|Erigon]] natively, plus Gnosis-maintained ports of Geth and Reth; the documented consensus clients are [[lighthouse|Lighthouse]], [[lodestar|Lodestar]], [[nimbus|Nimbus]] and [[teku|Teku]].",
        ],
      },
      {
        heading: "Two tokens, and withdrawals that are not balance credits",
        paragraphs: [
          "xDAI is the native token: [[eth-get-balance|eth_getBalance]] reports it and gas is priced in it. It is minted when DAI is bridged from Ethereum, and the minting happens inside block processing: after each block's transactions the client makes a system call to the block reward contract, `0x481c034c6d9441db23Ea48De68BCAe812C5d39bA`, and credits the native balances it returns. An address's xDAI can therefore grow with no transaction, no log and no receipt, which breaks reconciliation that sums transfers.",
          "GNO is an ERC-20 used for staking, one GNO per [[validator|validator]], which the beacon chain accounts as 32 mGNO. Gnosis changes EIP-4895: the [[withdrawals|withdrawals]] listed in a block do not credit native balances. The client instead calls `executeSystemWithdrawals` on the deposit contract at `0x0B98057eA310F4d31F2a452B414647007d1645d9`, which records claimable GNO, and the owner later calls `claimWithdrawal` to receive it as a token transfer. The `withdrawals` array looks like mainnet's, while the payout is a token claim rather than an xDAI credit.",
        ],
      },
      {
        heading: "Traces, rewards and irregular state changes",
        paragraphs: [
          "Before the merge the chain, then called xDai, ran AuRa proof of authority, from 2020 under POSDAO staking contracts, and a block reward contract paid out native tokens in every block. [[nethermind|Nethermind]] reports those payouts in [[trace-api|trace_block]] as `reward` entries with `rewardType` `external`, and [[block-explorer|Blockscout]]'s Nethermind integration reads them through `trace_block` to attribute block rewards, so on this chain they are data rather than noise. After the merge the reward contract still mints bridged xDAI through its system call, but Nethermind's trace module then reports only a zero-value `block` reward per block, so the mint is visible as a balance change rather than as a trace entry.",
          "Gnosis hard forks have also changed state without a transaction. The December 2025 upgrade replaced the code of the Balancer V2 exploiter's account with a restricted forwarding contract at a fixed timestamp, as an irregular state transition written into client configuration. [[eth-get-code|eth_getCode]] at that address changes between two blocks with nothing in either block to explain it, so an [[indexer|indexer]] or replay tool that derives code only from transactions diverges from the chain.",
        ],
      },
    ],
    pitfalls: [
      "Assuming 12-second slots and 32-slot epochs when converting Gnosis timestamps to blocks or estimating when `finalized` will move.",
      "Reconciling xDAI balances from transactions and logs alone; bridge mints arrive through the block reward system call.",
      "Watching a withdrawal address's native balance for staking payouts; they are claimable GNO in the deposit contract.",
      "Dropping `trace_block` reward entries when indexing Gnosis history; its AuRa-era `external` rewards are how explorers attribute block rewards.",
    ],
    related: ["chain-id", "consensus-layer", "nethermind", "erigon", "withdrawals", "trace-api", "block-explorer", "slot-epoch", "finality", "testnets"],
    sources: [
      { title: "Gnosis Chain docs: specs", url: "https://docs.gnosischain.com/about/specs/" },
      { title: "Gnosis Chain docs: run a node", url: "https://docs.gnosischain.com/node/" },
      { title: "gnosischain/specs: withdrawals", url: "https://github.com/gnosischain/specs/blob/master/execution/withdrawals.md" },
      { title: "gnosischain/specs: POSDAO post-merge", url: "https://github.com/gnosischain/specs/blob/master/execution/posdao-post-merge.md" },
    ],
  },
  {
    id: "permissioned-network",
    title: "Permissioned networks",
    category: "foundations",
    aliases: ["private network", "consortium chain", "QBFT", "IBFT 2.0", "Clique", "AuRa", "proof of authority", "perm_"],
    summary: "A permissioned network is a private or consortium EVM chain whose block producers are a fixed, known set, usually under proof-of-authority or BFT consensus such as QBFT, and which may restrict who connects or transacts, so it speaks Ethereum [[json-rpc|JSON-RPC]] while differing from mainnet in consensus, finality, fees and access.",
    sections: [
      {
        heading: "Consensus without proof of stake",
        paragraphs: [
          "Mainnet since [[the-merge|the Merge]] runs [[proof-of-stake|proof of stake]] with a beacon chain. A consortium usually wants a known set of validators and no beacon chain at all. QBFT and IBFT 2.0, implemented by [[besu|Besu]], are Byzantine-fault-tolerant: validators take turns proposing, a supermajority of at least two thirds commits each block, and four validators are the minimum that tolerates one faulty member. The validator list and commit seals travel in the header's `extraData`, timing comes from genesis options such as `blockperiodseconds` and `requesttimeoutseconds`, and validators are added by vote with `qbft_proposeValidatorVote` or by a validator contract. Clique rotates signers without BFT voting, and AuRa, which [[nethermind|Nethermind]] runs for chains such as Energy Web, assigns fixed time steps to validators in turn.",
          "Client support has narrowed. [[geth|Geth]] since v1.14 cannot seal Clique or Ethash blocks and runs private networks only as proof of stake with a consensus client. Besu removed Clique in 26.4.0, keeping only the ability to sync chains that started as Clique and later moved to proof of stake, and supports IBFT 2.0 for existing networks while recommending QBFT. Nethermind still ships Clique and AuRa engines. A new private network on the other clients is therefore a small proof-of-stake chain, of the kind [[kurtosis|Kurtosis]] or a [[local-devnet|local devnet]] spins up.",
        ],
      },
      {
        heading: "Finality and the block tags",
        paragraphs: [
          "Under QBFT or IBFT 2.0 a committed block is final: there are no forks, so the [[confirmations|confirmation]] counting and [[reorg|reorg]] handling written for public chains protects against nothing. The `safe` and `finalized` [[block-tag|block tags]], though, are defined by the [[engine-api|Engine API]] forkchoice, which a BFT network does not have. Besu resolves them from markers only the Engine API or a plugin sets, so on a plain QBFT network `eth_getBlockByNumber` with `finalized` returns an `Unknown block` error; its plugin API added setters for exactly this case. On such a network `latest` is the final block, and a library that defaults to `finalized` breaks.",
          "Clique and AuRa do not give that guarantee; short forks are possible and confirmations still mean something. BFT networks fail differently: when more than a third of validators are offline they stop producing blocks altogether, so [[eth-block-number|eth_blockNumber]] freezes instead of the chain forking, and a [[health-check|health check]] that watches head progress is the one that notices.",
        ],
      },
      {
        heading: "Permissioning, privacy and fees",
        paragraphs: [
          "Besu's local permissioning is enabled with `--permissions-nodes-config-file-enabled` and `--permissions-accounts-config-file-enabled`, reads allowlists from `permissions_config.toml`, and is managed at runtime through the `perm_` [[namespaces|namespace]], such as `perm_addAccountsToAllowlist`. Account permissioning is a policy of each node, not a consensus rule: a node rejects a non-allowlisted sender at [[eth-send-raw-transaction|eth_sendRawTransaction]] and will not propagate or include the transaction, yet accepts a block from another node that contains it. Smart-contract permissioning and Tessera private transactions were removed from Besu in 25.6.0 and the `PRIV` and `EEA` API groups in 25.7.0, so the `priv_` methods older guides describe no longer exist.",
          "Many private networks charge nothing for gas. In Besu that takes `--min-gas-price=0` on every node, `zeroBaseFee: true` in the [[genesis|genesis]] config for London and later, and turning off the pool's balance check, after which `eth_gasPrice` can return `0x0` and wallets or libraries that assume a positive base fee can misbehave. The chain id is chosen locally and can collide with a public network's, and the consensus methods — `qbft_`, `ibft_`, Nethermind's `clique_` — are extra namespaces enabled per node, for example by adding `QBFT` to Besu's `--rpc-http-api`.",
        ],
      },
    ],
    example: {
      title: "A QBFT genesis with free gas, and the finalized tag on such a network",
      language: "json",
      code: "// genesis config (excerpt)\n{\n  \"config\": {\n    \"chainid\": 1337,\n    \"berlinBlock\": 0,\n    \"londonBlock\": 0,\n    \"zeroBaseFee\": true,\n    \"qbft\": { \"blockperiodseconds\": 2, \"epochlength\": 30000, \"requesttimeoutseconds\": 4 }\n  },\n  \"gasLimit\": \"0x1fffffffffffff\",\n  \"difficulty\": \"0x1\",\n  \"extraData\": \"0xf87aa0…c080c0\"\n}\n\n// request against a Besu QBFT node with no plugin setting finality\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBlockByNumber\",\"params\":[\"finalized\",false]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"error\":{\"code\":-39001,\"message\":\"Unknown block\"}}",
      note: "Every block here is final once committed, yet the tag that says so is missing; on this network `latest` is the answer a `finalized` caller wanted.",
    },
    pitfalls: [
      "Defaulting reads to the `finalized` tag on a QBFT network, where Besu answers `Unknown block` although every committed block is final.",
      "Treating Besu account permissioning as a chain rule; it filters what one node accepts, and blocks from other nodes can still contain those transactions.",
      "Following an older guide to `priv_` methods or Tessera on a current Besu release, where private transactions have been removed.",
      "Starting a new Clique network on Geth or Besu; neither can seal Clique blocks any more.",
      "Leaving one node with a non-zero `--min-gas-price` on a free-gas network, which silently refuses zero-price transactions sent to it.",
    ],
    related: ["besu", "nethermind", "geth", "genesis", "chain-id", "block-tag", "finality", "namespaces", "local-devnet", "the-merge"],
    sources: [
      { title: "Besu: proof of authority consensus", url: "https://docs.besu-eth.org/private-networks/concepts/poa" },
      { title: "Besu: local permissioning", url: "https://docs.besu-eth.org/private-networks/how-to/use-local-permissioning" },
      { title: "Geth: private networks", url: "https://geth.ethereum.org/docs/fundamentals/private-network" },
      { title: "Besu changelog", url: "https://github.com/besu-eth/besu/blob/main/CHANGELOG.md" },
    ],
  },
  {
    id: "server-sent-events",
    title: "Server-sent events",
    category: "foundations",
    aliases: ["SSE", "text/event-stream", "EventSource", "Last-Event-ID", "/eth/v1/events", "event stream", "Beacon API events"],
    summary: "Server-sent events are a one-way push stream carried in an ordinary HTTP response of type `text/event-stream`, which the [[beacon-api|Beacon API]] uses at `/eth/v1/events` to announce heads, blocks, finality and reorgs as the beacon node sees them.",
    sections: [
      {
        heading: "The wire format",
        paragraphs: [
          "The client sends a GET, usually with `accept: text/event-stream`, and the server keeps the response open, writing UTF-8 text as things happen. Each line is a field: `event:` sets the event type, `data:` appends to the payload, `id:` sets the last event id, and `retry:` sets the reconnection delay in milliseconds. A blank line dispatches the event built so far, and a line starting with a colon is a comment, which servers use as a keep-alive.",
          "Nothing flows the other way. There is no upgrade and no binary framing, just an HTTP response that never finishes, which is why it passes through anything that passes [[http-transport|HTTP]] and is trivial to read with `curl -N`. A [[websocket-transport|WebSocket]] is the opposite trade: bidirectional frames after an upgrade handshake, so a client can send requests on the same connection, which is how [[eth-subscribe|eth_subscribe]] works on the execution layer.",
        ],
      },
      {
        heading: "Reconnection, and what it does not recover",
        paragraphs: [
          "A browser's `EventSource` reconnects by itself after a delay the browser chooses, a few seconds unless the server sent `retry:`, and it sends `Last-Event-ID` with the last id it saw, so a server that keeps a history can resume from there; an HTTP 204 tells it to stop trying. Resumption is entirely the server's feature, and `EventSource` cannot set custom headers, so a key has to travel in the URL or a cookie.",
          "The Beacon API does not define event ids or replay. Its stream carries only `event:` and `data:` lines, so a consumer that reconnects receives events from that moment on and nothing from the gap. That is the same shape as a dropped `eth_subscribe` connection, and it has the same remedy: remember the last block root and slot you processed, then fill the gap over REST before trusting the stream again.",
        ],
      },
      {
        heading: "The Beacon API stream",
        paragraphs: [
          "`GET /eth/v1/events?topics=head,chain_reorg,finalized_checkpoint` subscribes to several topics on one connection. Version 4.0.0 of the specification lists `head`, `block`, `block_gossip`, `attestation`, `single_attestation`, `voluntary_exit`, `bls_to_execution_change`, `proposer_slashing`, `attester_slashing`, `finalized_checkpoint`, `chain_reorg`, `contribution_and_proof`, the two light-client updates, `payload_attributes`, `blob_sidecar` and `data_column_sidecar`. Payload numbers are decimal strings, as elsewhere in the API; the pre-release for the next fork deprecates `head` in favour of `head_v2`.",
          "`head` carries the slot, block root, state root and dependent roots whenever [[fork-choice|fork choice]] moves; `chain_reorg` adds `depth` and the old and new head roots, the one place a [[reorg|reorg]] arrives as an explicit event; `finalized_checkpoint` fires about once per epoch with the new [[finality|finalized]] root. `block_gossip` fires when a block passes gossip validation and `block` when fork choice imports it, which is why [[network-telemetry|telemetry]] records both. `payload_attributes` is what builders and relays use to prepare the next proposal, and the attestation topics are high-volume.",
        ],
      },
      {
        heading: "Proxies and backfill",
        paragraphs: [
          "nginx buffers proxied responses by default, so events arrive in bursts or only once a buffer fills; `proxy_buffering off` for the location, or an `X-Accel-Buffering: no` response header, fixes it. Its `proxy_read_timeout` of 60 seconds cuts a quiet stream: a subscription to `finalized_checkpoint` alone is idle for several minutes at a time, and the Beacon API permits keep-alive comments without requiring them. Configure the [[reverse-proxy|reverse proxy]] for a stream, not for a request.",
          "After any reconnect, backfill before resuming: read `/eth/v1/beacon/headers/head` and `/eth/v1/beacon/states/head/finality_checkpoints` from the [[beacon-endpoints|REST routes]], compare the canonical root at each slot since your last processed one, and walk parent roots back to the first match to find reorgs you missed.",
        ],
      },
    ],
    example: {
      title: "A head and a reorg on the stream, and a proxy that does not break it",
      language: "text",
      code: "curl -sN -H 'accept: text/event-stream' \\\n  'http://127.0.0.1:5052/eth/v1/events?topics=head,chain_reorg,finalized_checkpoint'\n\nevent: head\ndata: {\"slot\":\"15307260\",\"block\":\"0x4f1c…a2e9\",\"state\":\"0x9d02…17bb\",\"epoch_transition\":false,\"previous_duty_dependent_root\":\"0x6ab3…0c41\",\"current_duty_dependent_root\":\"0x2e7f…d905\",\"execution_optimistic\":false}\n\nevent: chain_reorg\ndata: {\"slot\":\"15307261\",\"depth\":\"1\",\"old_head_block\":\"0x8c55…3f10\",\"new_head_block\":\"0xb21e…77a4\",\"old_head_state\":\"0x51d0…9e2c\",\"new_head_state\":\"0xe3a4…0b58\",\"epoch\":\"478351\",\"execution_optimistic\":false}\n\n# nginx in front of it\nlocation /eth/v1/events {\n  proxy_pass http://127.0.0.1:5052;\n  proxy_buffering off;        # otherwise events arrive in bursts\n  proxy_read_timeout 1h;      # a quiet topic can be idle for minutes\n}",
      note: "Neither event carries an `id:` line, so a reconnect cannot ask for what it missed; the REST routes are the only way to fill the gap.",
    },
    pitfalls: [
      "Assuming a reconnect resumes the Beacon API stream, when it defines no replay and the gap has to be backfilled over REST.",
      "Serving the stream through nginx with default buffering, so events arrive late and in batches.",
      "Leaving a 60-second proxy read timeout on a subscription whose only topic fires once per epoch.",
      "Treating a `head` event as final; a later `chain_reorg` can replace it, and only `finalized_checkpoint` means finality.",
      "Subscribing a dashboard to attestation topics on a shared beacon node, pulling a high-volume stream through it for no reason.",
    ],
    related: ["beacon-api", "beacon-endpoints", "eth-subscribe", "websocket-transport", "http-transport", "reverse-proxy", "reorg", "finality", "fork-choice", "network-telemetry", "mev-share"],
    sources: [
      { title: "WHATWG HTML: server-sent events", url: "https://html.spec.whatwg.org/multipage/server-sent-events.html" },
      { title: "Beacon APIs: event stream", url: "https://github.com/ethereum/beacon-APIs/blob/master/apis/eventstream/index.yaml" },
      { title: "nginx: ngx_http_proxy_module", url: "https://nginx.org/en/docs/http/ngx_http_proxy_module.html" },
    ],
  },
  {
    id: "openrpc",
    title: "OpenRPC",
    category: "foundations",
    aliases: ["OpenRPC", "openrpc.json", "rpc.discover", "JSON Schema", "rpc_modules", "rpc-compat", "method schema"],
    summary: "OpenRPC is a JSON-Schema-based format for describing a [[json-rpc|JSON-RPC]] 2.0 API, its methods, parameters, results, errors and examples, in one machine-readable document, much as OpenAPI describes a REST API, and it is the language the [[execution-apis|execution-apis]] specification is written in.",
    sections: [
      {
        heading: "What a document contains",
        paragraphs: [
          "An OpenRPC document is a JSON object with `openrpc`, the specification version, currently 1.4.x; `info`; optional `servers`; `methods`; and `components`, which holds reusable schemas referenced with `$ref`. Each method has a `name`, a `summary`, `params` as an array of content descriptors, each with a `name`, a `schema` and a `required` flag, a `result` descriptor, optional `errors` with `code`, `message` and `data`, `examples`, and `paramStructure`, which is `by-position`, `by-name` or, by default, `either`.",
          "Schemas follow JSON Schema draft 7, which is where Ethereum's [[hex-encoding|encoding rules]] become checkable. The execution-apis base types define `uint` as a string matching `^0x(0|[1-9a-f][0-9a-f]*)$`, so a QUANTITY with a leading zero fails validation, and fixed-width types such as a 32-byte hash as exact-length patterns. Ethereum methods take positional parameters, so a descriptor's place in the array is its meaning.",
        ],
      },
      {
        heading: "How execution-apis uses it",
        paragraphs: [
          "The specification is written as YAML split by area, such as `src/eth/client.yaml` and `src/schemas/base-types.yaml`, and `make build` compiles it into one `openrpc.json` with every `$ref` resolved, validated against the OpenRPC metaschema along the way. That file drives the rendered documentation at `ethereum.github.io/execution-apis` and whatever client generators consume it. Beyond `eth_`, the repository now also carries some [[debug-api|debug_]] methods, `txpool_content`, the [[engine-api|Engine API]] and, since 2026, an `eth_capabilities` [[eth-capabilities|method for reporting retention]].",
          "Conformance is tested separately. The `tests` directory holds `.io` files, each a request line prefixed `>>` and the expected response prefixed `<<`, recorded against a fixed chain built from `genesis.json` and `chain.rlp`; `speccheck` validates those cases against the schema, and [[hive|hive's]] `rpc-compat` simulator replays them against every major client daily, publishing results at hive.ethpandaops.io. This is the lever that keeps [[client-diversity|different clients]] returning the same shapes.",
        ],
      },
      {
        heading: "Discovery at runtime",
        paragraphs: [
          "OpenRPC defines one method of its own, `rpc.discover`, which a server answers with its own OpenRPC document, so a client could learn the exact surface of the endpoint in front of it. Ethereum execution clients do not generally serve it. What [[geth|Geth]], [[nethermind|Nethermind]] and [[reth|Reth]] answer instead is `rpc_modules`, which returns the enabled [[namespaces|namespaces]] with a version string each, such as `eth` mapped to `1.0`, and says nothing about individual methods, parameters or limits. The practical way to learn an endpoint's surface is still to probe it; see [[endpoint-capabilities|endpoint capabilities]].",
        ],
      },
      {
        heading: "What the schema cannot say",
        paragraphs: [
          "A schema fixes shapes, not behaviour. It cannot say how much gas an [[eth-call|eth_call]] may use, how wide an [[eth-get-logs|eth_getLogs]] range may be, how long a call may run, which namespaces an operator enabled, or how fast anything is, and the meaning of a tag such as `pending` lives in prose descriptions. A response can be schema-valid and wrong, since no pattern knows the correct balance; the recorded tests compare values only on their own small chain.",
          "Errors are the thinnest part. Since 2026 the repository has an error-group catalogue, with code `3` for execution reverted, 800 to 999 for gas errors and 1000 to 1199 for transaction-pool errors, but so far only `eth_sendTransaction` and [[eth-send-raw-transaction|eth_sendRawTransaction]] reference it, so most methods' failures remain unspecified. Client-specific namespaces such as [[trace-api|trace_]] and `ots_` are absent entirely.",
        ],
      },
    ],
    example: {
      title: "One method, its type, and its conformance test",
      language: "yaml",
      code: "# src/eth/client.yaml\n- name: eth_chainId\n  summary: Returns the chain ID of the current network.\n  params: []\n  result:\n    name: Chain ID\n    schema:\n      $ref: '#/components/schemas/uint'\n\n# src/schemas/base-types.yaml: the QUANTITY rule as a pattern\nuint:\n  title: hex encoded unsigned integer\n  type: string\n  pattern: ^0x(0|[1-9a-f][0-9a-f]*)$\n\n# tests/eth_chainId/get-chain-id.io, replayed by hive's rpc-compat simulator\n# >> {\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_chainId\"}\n# << {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0xc72dd9d5e883e\"}",
      note: "The schema would reject `0x01`; only the test notices whether the value is the chain id of the test chain, and neither says whether your endpoint enables the method.",
    },
    pitfalls: [
      "Treating a schema-valid response as a correct one; the schema checks encoding and shape, not the value.",
      "Calling `rpc.discover` on an execution client and concluding the endpoint is broken, when clients serve `rpc_modules` instead.",
      "Generating a client from `openrpc.json` and assuming every method in it is enabled on your endpoint.",
      "Branching on error codes from the catalogue for methods that do not yet reference it, where clients still differ.",
      "Reading the rendered documentation as the whole surface; client namespaces such as `trace_` and `ots_` are not in it.",
    ],
    related: ["execution-apis", "json-rpc", "namespaces", "hex-encoding", "rpc-errors", "endpoint-capabilities", "client-diversity", "engine-api", "client-namespaces", "hive"],
    sources: [
      { title: "OpenRPC specification", url: "https://spec.open-rpc.org/" },
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
      { title: "Execution APIs: tests", url: "https://github.com/ethereum/execution-apis/blob/main/docs-api/docs/tests.md" },
      { title: "hive: rpc-compat simulator", url: "https://github.com/ethereum/hive/tree/master/simulators/ethereum/rpc-compat" },
    ],
  },
];
