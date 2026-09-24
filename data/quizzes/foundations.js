// Checkpoint questions for the Foundations category, six per topic.
// Every answer is stated or directly implied by the topic's lesson in data/foundations.js.

export const quizzes = {
  "ethereum-rpc": [
    {
      kind: "detail",
      question: "A consensus client needs to tell its execution client which block is now the head. Which interface carries that message?",
      options: [
        "The Engine API, on its own authenticated port",
        "The eth_ JSON-RPC, through eth_blockNumber",
        "The Beacon API, through its REST routes",
        "The EIP-1193 provider, through request calls",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A dapp frontend shows token balances, and a staking dashboard shows validator statuses. Which endpoint should each one read from?",
      options: [
        "Dapp: execution JSON-RPC. Dashboard: Beacon API",
        "Dapp: Beacon API. Dashboard: execution JSON-RPC",
        "Dapp: execution JSON-RPC. Dashboard: Engine API",
        "Dapp: Engine API. Dashboard: Beacon API",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Two healthy mainnet endpoints return different results for the same eth_getBalance at latest, sent at the same moment. Why can both be correct?",
      options: [
        "Each answered from its own node's view of the head at that instant",
        "Each provider caches balances and refreshes them on its own timer",
        "One answered from pending, since latest has no agreed meaning",
        "JSON-RPC lets a read return any state from the last finalized epoch",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What does verifying a state proof add on top of a plain JSON-RPC answer?",
      options: [
        "A check against a header the caller already trusts",
        "A signature from the node operator over the response",
        "A guarantee that the value comes from a finalized block",
        "Agreement from a second provider on the same value",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "An operator exposes port 8551 to the internet because it looks like ordinary JSON-RPC. What does that put at risk?",
      options: [
        "Control over which block the node builds on",
        "The validator signing keys that the port serves",
        "Nothing beyond load, since the port is read-only",
        "The node's peer list, which the port lets callers edit",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A dapp calls window.ethereum.request to read a balance. Who decides which node actually answers?",
      options: [
        "The browser wallet that injected the provider",
        "The dapp, through the RPC URL it passes to request",
        "The consensus client paired with the answering node",
        "The browser, which picks the fastest public endpoint",
      ],
      answer: 0,
    },
  ],

  "rpc": [
    {
      kind: "cause",
      question: "Why must an RPC gateway parse each request's JSON body before it can route, cache, or count the call?",
      options: [
        "Every call is a POST to one URL, so only the body names the method",
        "JSON-RPC signs each body, and the gateway must check the signature",
        "The block number sits in a header that most proxies strip away",
        "HTTP caches key on a hash of the body rather than on the path",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "An eth_sendRawTransaction call times out before any reply arrives. What may already be true on the server side?",
      options: [
        "The node already broadcast the transaction to its peers",
        "The node rolled the transaction back when the call timed out",
        "The node is holding the transaction until the client acks",
        "The node discarded it, since only a delivered reply commits",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A load balancer sends a receipt lookup to a node one block behind the rest. The transaction landed in the newest block. What comes back?",
      options: [
        "null, though the receipt already exists on other nodes",
        "An error explaining that the transaction is still in the pool",
        "The receipt, fetched on demand from a synced peer",
        "A receipt with status 0x0 until the node catches up",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What distinguishes Ethereum's verb-first node interface from a REST design?",
      options: [
        "Its unit is a named method with arguments, not a URL resource",
        "It uses GET for reads and POST for writes, rather than one verb",
        "It returns numbers as hex strings, where REST returns decimals",
        "It keeps session state on the server, where REST is stateless",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does a verb-first interface suit eth_estimateGas better than a REST resource would?",
      options: [
        "It executes repeatedly to search; there is no document to fetch",
        "Its result is too large to return in reply to a plain GET request",
        "REST verbs cannot carry the hex-encoded arguments that it takes",
        "REST responses get cached, and gas estimates must never be cached",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "Every RPC system needs an error channel. Where does Ethereum's JSON-RPC put it?",
      options: [
        "In an error object inside a successful HTTP response",
        "In the HTTP status code, with the message in a header",
        "In a separate error stream opened beside each connection",
        "In the result field, as a string with an error prefix",
      ],
      answer: 0,
    },
  ],

  "json-rpc": [
    {
      kind: "detail",
      question: "A portable library wants to call only methods that the execution-apis specification defines. Which of these is one?",
      options: [
        "eth_getLogs",
        "debug_traceTransaction",
        "trace_replayBlockTransactions",
        "txpool_content",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "eth_getTransactionReceipt returns HTTP 200 with result null. What does that tell the caller?",
      options: [
        "This node has no receipt for that hash in a block yet",
        "The transaction reverted, so no receipt was written",
        "The node rejected the request as having malformed params",
        "The node is still syncing and declines to answer reads",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Two correctly implemented endpoints handle the same wide eth_getLogs query differently. Why is that allowed?",
      options: [
        "Range and response size caps are operator choices outside the spec",
        "Each client encodes topics its own way, and the spec allows it",
        "The spec leaves each client to decide how topic wildcards match",
        "Logs are indexed only by the nodes that produced the block",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "How does a request pass a method's arguments in Ethereum's JSON-RPC?",
      options: [
        "As a positional array, the block identifier usually last",
        "As a named object whose keys match the schema's parameters",
        "As URL query parameters appended to the endpoint path",
        "As a positional array, the block identifier usually first",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "Before relying on client-specific behaviour, you want to know what software runs behind an endpoint. Which method tells you?",
      options: [
        "web3_clientVersion",
        "eth_protocolVersion",
        "net_version",
        "eth_chainId",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "Code written against one provider calls eth_simulateV1 on another endpoint that lacks it. What comes back?",
      options: [
        "A method-not-found error from that endpoint",
        "A null result inside a successful response",
        "The answer to eth_call, which the node substitutes",
        "An HTTP 404, since that method's route does not exist",
      ],
      answer: 0,
    },
  ],

  "request-response": [
    {
      kind: "detail",
      question: "A response object carries a result member. What can you conclude about an error member?",
      options: [
        "It is absent, since a response carries one or the other",
        "It may be present too, carrying warnings about the call",
        "It is present as null, marking the call as a success",
        "It may follow in a later frame if execution fails",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does a WebSocket JSON-RPC client keep a map from request id to pending call?",
      options: [
        "The node answers in whatever order it finishes, not send order",
        "Frames on a socket drop the method name, leaving only the id",
        "Each id may be used once per socket and has to be tracked",
        "The node refuses a new request until the last one is acked",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "On an Ethereum WebSocket connection, which kind of frame arrives with no id member at all?",
      options: [
        "A subscription push, whose method is eth_subscription",
        "The eth_subscribe reply that hands back the subscription id",
        "Each response inside the reply to a batch request",
        "A reply to a request that left out the params member",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A client sends every request with id 1 over one WebSocket, several at a time. What breaks?",
      options: [
        "Two in-flight answers can no longer be told apart",
        "The node rejects each repeated id as an invalid request",
        "The node queues each request until the previous one ends",
        "Subscriptions stop, because they share the request id",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "You need to pass a state override object to eth_call. Where in the request does it go?",
      options: [
        "As the third params element, after the block identifier",
        "As a named overrides key inside a params object",
        "As the second params element, before the block identifier",
        "As a top-level member of the request, beside params",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What distinguishes a response whose result is null from one that carries an error object?",
      options: [
        "null is a successful answer: this node has no such object",
        "null means the node timed out before finishing the call",
        "null means the node refused the call without saying why",
        "null means the method exists but the operator disabled it",
      ],
      answer: 0,
    },
  ],

  "batch-request": [
    {
      kind: "detail",
      question: "How should a client pair each element of a batch reply with the request that produced it?",
      options: [
        "By the id member that each element carries",
        "By array position, which the server preserves",
        "By the method name echoed back in each element",
        "By sorting both arrays on method name first",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "You batch eth_getBalance and eth_getTransactionCount for one account, both at latest. Why can the two answers disagree?",
      options: [
        "Each item runs on its own, and a new block can land between them",
        "Balance is read from state, while the nonce comes from the pool",
        "Most clients execute the items of a batch in reverse order",
        "The node caches balances one block longer than nonces",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "Compared with 500 separate receipt calls, what does a single 500-item batch actually save?",
      options: [
        "Round trips and handshakes; the node still does every lookup",
        "Node work, since the receipts are read in a single pass",
        "Rate limit quota, since the batch counts as one request",
        "Execution time, since the items run in parallel on one snapshot",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A 20-item batch comes back with one element carrying error -32602 and nineteen carrying results. What should the client conclude?",
      options: [
        "One item had bad params; the other nineteen results stand",
        "The whole batch failed and must be resent as one unit",
        "The nineteen results are provisional until the error clears",
        "The server stopped the batch at the item that failed",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A client sends a batch so large that the body exceeds the server's size limit. What does it get back?",
      options: [
        "An HTTP-level failure with no JSON-RPC error object",
        "An array with a -32600 error in every element",
        "Results for the items that fit, then errors for the rest",
        "An array holding one error for each item that was cut",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What does Multicall3 give a set of contract reads that a JSON-RPC batch cannot promise?",
      options: [
        "Execution at exactly one block, as an atomic snapshot",
        "Separate error codes for each read instead of one merged",
        "Parallel execution spread across several upstream nodes",
        "Freedom from the gas cap that limits a single eth_call",
      ],
      answer: 0,
    },
  ],

  "rpc-errors": [
    {
      kind: "scenario",
      question: "eth_call comes back with error code 3 and a data field. What happened?",
      options: [
        "The EVM ran the call and it reverted; data holds the reason",
        "The params were malformed, so nothing was executed at all",
        "The node lacks that block's state, so it could not run it",
        "The provider throttled the call; data holds the retry delay",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "Your failover logic may resend a failed call to a different upstream. For which error does that actually help?",
      options: [
        "missing trie node while reading an old block's state",
        "invalid params caused by a badly formatted address",
        "execution reverted from a token transfer simulation",
        "nonce too low returned for a signed transaction submission",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why should application code branch on an error's code rather than on its message?",
      options: [
        "Message wording differs between clients and releases",
        "The message field is optional and usually left empty",
        "Messages are sent only over WebSocket, never HTTP",
        "The code is signed by the node, and the message is not",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "eth_getBalance receives a JSON number where it expects an address string. Which error code does the node return?",
      options: [
        "-32602",
        "-32601",
        "-32600",
        "-32700",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A fallback routine resends a reverted eth_call, pinned to the same block number, to a second provider. What happens?",
      options: [
        "It reverts there too, since the result is deterministic",
        "It succeeds, since a revert reflects one node's pool",
        "It returns null, since the revert was already reported",
        "It fails with -32005, since the call is a duplicate",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What separates a missing trie node error from an HTTP 429 when deciding how to retry?",
      options: [
        "The first needs a node with more data; the second, backoff",
        "The first is a caller error; the second is a node-state error",
        "The first can retry on the same node; the second cannot retry",
        "The first means a bad block number; the second, a bad API key",
      ],
      answer: 0,
    },
  ],

  "execution-apis": [
    {
      kind: "detail",
      question: "Where does the specification for the trace_ namespace live?",
      options: [
        "With each client that implements it, in its own docs",
        "In execution-apis, as a schema beside eth_ and net_",
        "In EIP-1474, which lists it as an optional namespace",
        "In the consensus-specs repository, beside the Beacon API",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why is the Engine API split into per-fork documents while the eth_ methods compile into one openrpc.json?",
      options: [
        "It gains a new method version at nearly every upgrade",
        "Each fork replaces the whole Engine API with a new protocol",
        "The eth_ methods are frozen by EIP-1474 and cannot change",
        "Consensus client teams maintain it, not execution teams",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A fully conformant endpoint refuses your eth_getLogs query over 100,000 blocks. Does that violate the specification?",
      options: [
        "No; range caps are a deployment choice it does not cover",
        "Yes; the schema sets a minimum range every node must serve",
        "Yes; conformance means answering any well-formed filter",
        "No; eth_getLogs sits outside the specification altogether",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What is the usual path for a new method such as eth_simulateV1 to become standard?",
      options: [
        "A pull request, usually after two clients implement it",
        "An Interface EIP that must first reach Final status",
        "A vote by client teams at the next network upgrade",
        "Adoption as an extension by the largest hosted providers",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "A method appears in the execution-apis schema. What does that tell you about your own endpoint?",
      options: [
        "Its shape is defined; whether it is enabled is up to the operator",
        "It is enabled, since conformant nodes must serve every method",
        "It is served, but only over the IPC and WebSocket listeners",
        "It is enabled once the node has finished syncing its history",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A developer builds a Prague-era client from the Cancun Engine API document alone. What goes wrong?",
      options: [
        "They implement an old payload shape the fork no longer uses",
        "They miss the eth_ methods that moved into the Engine API",
        "They sign with a JWT algorithm that changed at Prague",
        "They bind the wrong port, since each fork moves 8551",
      ],
      answer: 0,
    },
  ],

  "namespaces": [
    {
      kind: "detail",
      question: "Which three namespaces does the execution APIs specification define?",
      options: [
        "eth_, net_, and web3_",
        "eth_, debug_, and trace_",
        "eth_, txpool_, and admin_",
        "eth_, net_, and debug_",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A call to trace_block on a Nethermind endpoint returns -32601. What is the usual cause?",
      options: [
        "The operator did not enable the trace module on it",
        "The block is older than the node's tracing window",
        "The request tripped the endpoint's rate limiter",
        "Nethermind implements tracing only under debug_",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why is exposing txpool_ on a public listener a risk?",
      options: [
        "It reveals unincluded transactions, which is order flow",
        "It lets any caller delete transactions from the pool",
        "It skips the rate limits applied to eth_ methods",
        "It returns private keys for locally signed transactions",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A dapp calls eth_sendTransaction through window.ethereum. Who answers the call?",
      options: [
        "The browser wallet, which holds the keys",
        "The public node, which signs with its own key",
        "The public node, which forwards it to the wallet",
        "Nobody; public nodes return method not found",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What distinguishes the debug_ namespace from the trace_ namespace?",
      options: [
        "debug_ follows Geth's shape; trace_ follows Parity's",
        "debug_ is read-only; trace_ can change the node's state",
        "debug_ is in the spec; trace_ is left to each client",
        "debug_ is cheap to serve; trace_ is the expensive one",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "An operator enables debug_ on a public listener for one investigation and forgets it. What is the risk?",
      options: [
        "Anyone can exhaust the node's CPU with tracing calls",
        "Anyone can add or remove the node's peers",
        "Anyone can use keys the node holds for signing",
        "Anyone can see transactions before they are included",
      ],
      answer: 0,
    },
  ],

  "http-transport": [
    {
      kind: "scenario",
      question: "An endpoint answers HTTP 429 with an HTML body. Where is the JSON-RPC error object?",
      options: [
        "There is none; the request never reached the JSON-RPC layer",
        "In a response header, since the body is reserved for HTML",
        "In a later frame on the same keep-alive connection",
        "Inside the HTML, which clients are expected to parse",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why can the HTTP transport never deliver eth_subscribe notifications?",
      options: [
        "Each request gets one reply, and the server cannot speak first",
        "JSON-RPC 2.0 forbids notifications over any HTTP connection",
        "Notification payloads exceed the maximum HTTP body size",
        "HTTP cannot carry the binary frames that notifications use",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "Which HTTP property makes load balancing RPC trivial, and which feature breaks it?",
      options: [
        "Statelessness; filters break it, since their state is on one node",
        "Keep-alive; gzip breaks it, since compression state is per connection",
        "CORS; TLS breaks it, since each certificate names one host",
        "Batching; eth_call breaks it, since it needs archive state",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A client opens a fresh HTTPS connection for every small read. What dominates the cost of each call?",
      options: [
        "The TLS handshake repeated on every request",
        "Parsing JSON in every response on the client",
        "The node executing each read against its state",
        "Decompressing gzip on every response body",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "Which Geth flag sets the origins a browser page may call the HTTP listener from?",
      options: [
        "--http.corsdomain",
        "--http.vhosts",
        "--ws.origins",
        "--authrpc.jwtsecret",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A dapp that talks to its node over HTTP needs to react to new blocks. What does it have to do?",
      options: [
        "Poll eth_blockNumber on a timer and fetch what changed",
        "Open eth_subscribe over HTTP with a long request timeout",
        "Send one request and read blocks as the reply streams in",
        "Register a callback URL for the node to POST blocks to",
      ],
      answer: 0,
    },
  ],

  "websocket-transport": [
    {
      kind: "consequence",
      question: "Your WebSocket drops for 40 seconds and reconnects. What has happened to the logs subscription?",
      options: [
        "It is gone, and events from the gap are never replayed",
        "The node buffered its events and replays them on reconnect",
        "Its id stays valid, and streaming resumes where it stopped",
        "The node resends the last 128 blocks of logs to the socket",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "On a newHeads subscription stream, how does a reorg announce itself?",
      options: [
        "A block's parentHash differs from the previous block's hash",
        "A notification arrives with the removed flag set to true",
        "The node closes the subscription and sends a new id",
        "A notification arrives with a negative block number",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does a reverse proxy in front of a WebSocket endpoint often cause mysterious disconnects?",
      options: [
        "Its idle timeout closes sockets that are quiet between events",
        "It cannot forward frames larger than one megabyte of JSON",
        "TLS termination at the proxy invalidates subscription ids",
        "It reorders frames in flight, which breaks the client's id matching",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A log consumer reconnects after an outage. What should it do before trusting the new live stream?",
      options: [
        "Backfill with eth_getLogs from the last block it processed",
        "Reuse its old subscription id so the node resumes delivery",
        "Ask the node to replay the missed events through eth_subscribe",
        "Wait for the next newHeads event, which carries the missed logs",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why send protocol-level ping and pong frames on a long-lived subscription socket?",
      options: [
        "TCP alone can keep a dead socket looking open for minutes",
        "Pong frames carry the head block number for health checks",
        "Ping frames renew subscription ids before they expire",
        "Ping frames tell the node which subscriptions to keep",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "An operator starts Geth with --http.api eth,net,web3. What does that give WebSocket clients?",
      options: [
        "Nothing; WebSocket is a separate listener with its own list",
        "WebSocket on the same port, sharing the same namespace list",
        "WebSocket with only the eth_ namespace, until configured",
        "WebSocket, once --ws.origins has also been set",
      ],
      answer: 0,
    },
  ],

  "ipc-transport": [
    {
      kind: "detail",
      question: "What authenticates a caller who connects over the IPC transport?",
      options: [
        "Filesystem permissions on the socket file",
        "A JWT shared secret, as on the Engine API",
        "An API key sent in the first JSON-RPC call",
        "The caller's process id, checked against an allow-list",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why do clients enable every namespace on IPC but only a minimal set on HTTP?",
      options: [
        "Opening the socket already implies local operator access",
        "IPC has no way to express a namespace filter at startup",
        "HTTP is faster, so its methods need tighter limits",
        "The Engine API requires every namespace over IPC",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "Which workload is a good fit for the IPC transport?",
      options: [
        "An indexer scanning logs on the same host as the node",
        "A browser dapp reading token balances for its users",
        "A public endpoint spread across a load-balanced pool of nodes",
        "A mobile wallet submitting transactions from a phone",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "To let a remote tool reach it, someone forwards geth.ipc to a TCP port with a relay. What have they created?",
      options: [
        "A remote, unauthenticated, fully privileged interface",
        "A remote interface that serves only the eth_ namespace",
        "A remote endpoint still guarded by the socket's permissions",
        "A remote endpoint that demands the Engine API's JWT",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A containerized tool cannot find geth.ipc, though the node runs on the same host. What is the likely cause?",
      options: [
        "The node's data directory was never bind-mounted into it",
        "IPC only accepts callers running as the root user",
        "Geth disables IPC by default until --ipcpath is set",
        "The socket moved to a TCP port when the container started",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What does IPC share with WebSocket that plain HTTP lacks?",
      options: [
        "A long-lived two-way connection, so eth_subscribe works",
        "An origin check that browsers enforce on every connection",
        "TLS encryption negotiated during the opening handshake",
        "Reachability from other hosts on the same network",
      ],
      answer: 0,
    },
  ],

  "hex-encoding": [
    {
      kind: "detail",
      question: "A request must pass the number zero as a QUANTITY. Which string is well formed?",
      options: [
        "0x0",
        "0x00",
        "0x",
        "0",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "eth_getBalance returns 0x21e19e0c9bab2400000. What is the safe way to hold it in JavaScript?",
      options: [
        "Parse it with BigInt, and format a decimal string only for display",
        "Parse it with parseInt and radix 16, then store it as a number",
        "Convert it with Number() and round the result to 18 decimals",
        "Keep the hex string and compare it with other balance strings",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "eth_getStorageAt returns a 66-character value and eth_getBalance returns 0x1, yet both mean one. Why the difference?",
      options: [
        "Storage is fixed-width 32-byte DATA; a balance is unpadded QUANTITY",
        "Storage is returned big-endian, while balances come back little-endian",
        "The storage word carries a type prefix byte before the value",
        "The balance was shortened because it fits in a small integer",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why is 0x01 a malformed block number in a request?",
      options: [
        "QUANTITY values may not have leading zeros",
        "Block numbers must be sent as decimal strings",
        "Block numbers are DATA and need 32 full bytes",
        "Hex digits in a QUANTITY must be uppercase",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "Two well-formed copies of the same address fail a plain string comparison. What is the likely cause?",
      options: [
        "One is EIP-55 mixed case and the other lowercase",
        "One carries a checksum byte after its 20 bytes",
        "One is stored big-endian and the other little-endian",
        "One keeps its leading zero bytes and the other drops them",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A decoder treats every value in a log object as a hex string. Where does it go wrong?",
      options: [
        "On removed, which is a real JSON boolean",
        "On logIndex, which is DATA padded to 32 bytes",
        "On topics, which are sent as decimal strings",
        "On address, which is a QUANTITY without zeros",
      ],
      answer: 0,
    },
  ],

  "block-tag": [
    {
      kind: "cause",
      question: "Which block tag can move backwards, and why?",
      options: [
        "latest, because fork choice can replace the head in a reorg",
        "finalized, because the consensus client recomputes it each epoch",
        "earliest, because history expiry removes the oldest blocks",
        "safe, because a syncing node resets it to genesis",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "An execution client keeps serving RPC after its consensus client stops. What happens to reads at finalized?",
      options: [
        "They answer from a finalized block that no longer advances",
        "They fail with an error naming the missing consensus client",
        "They quietly fall back to answering from the latest block",
        "They return null until the consensus client reconnects",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A token balance and that token's total supply must agree with each other. What should both calls pass?",
      options: [
        "The same explicit block number or block hash",
        "latest for both, sent together inside one batch",
        "pending for both, so recent transactions are included",
        "finalized for the balance and latest for the supply",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What does adding requireCanonical: true to an EIP-1898 block hash object change?",
      options: [
        "The node fails if that hash is no longer canonical",
        "The node waits until the named block is finalized",
        "The node answers from the canonical block at that height",
        "The node checks that hash against a second peer first",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What distinguishes the pending tag from the latest tag?",
      options: [
        "It is one node's guess at the next block, built from its pool",
        "It is the next block as already agreed by the proposer",
        "It is the head block before its transactions are executed",
        "It is the head block as seen by the majority of peers",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "An exchange credits deposits and cannot claw a credit back. Which tag should its confirmation reads use?",
      options: [
        "finalized, locked in by Casper FFG",
        "safe, the latest justified checkpoint",
        "latest, the head this node has chosen",
        "pending, the block this node expects next",
      ],
      answer: 0,
    },
  ],

  "chain-id": [
    {
      kind: "cause",
      question: "What stops a transaction signed for Sepolia from being replayed on mainnet?",
      options: [
        "The chain id is signed, so sender recovery fails on another chain",
        "Nodes check each hash against a shared cross-chain blocklist",
        "Nonces on the two networks are drawn from ranges that never overlap",
        "Mainnet rejects any gas price that was quoted by a testnet",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "eth_chainId returns 0x1 and net_version returns 1. Which should a signer use, and why?",
      options: [
        "eth_chainId, since EIP-155 signs over the chain id",
        "net_version, since a decimal string is easier to compare",
        "Either, since the specification makes the two identical",
        "net_version, since the network id is what peers check",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A failover promotes an upstream without re-checking eth_chainId. What is the worst outcome?",
      options: [
        "Reads and writes silently go to a different network",
        "Signed transactions fail because the nonce was reset",
        "The new upstream rejects calls until it is told the id",
        "Balances show in the wrong unit until the cache refreshes",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "An endpoint returns exactly the chain id your application expects. What has that proven?",
      options: [
        "That it claims your network, not that it is genuine",
        "That it is a fully synced node on the canonical chain",
        "That its operator is listed in a chain registry",
        "That its responses are signed for that network",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "Your code compares eth_chainId's result to the string 0x01 and reports a mismatch on mainnet. Why?",
      options: [
        "0x1 and 0x01 are the same number but different text",
        "Mainnet reports its chain id as the decimal string 1",
        "Mainnet's chain id is padded to four bytes, 0x00000001",
        "The endpoint serves a testnet whose id also starts 0x0",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A user switches networks in their wallet, and the dapp receives chainChanged. What should the dapp do?",
      options: [
        "Re-read everything, since addresses and cached data differ",
        "Nothing, since the wallet rewrites pending reads itself",
        "Re-sign pending transactions with a fresh nonce for the chain",
        "Call net_version first, since chainChanged can be spoofed",
      ],
      answer: 0,
    },
  ],

  "execution-layer": [
    {
      kind: "contrast",
      question: "Since the Merge, what does the execution layer still decide by itself?",
      options: [
        "Whether a transaction's signature, nonce, and gas are valid",
        "Which of two competing blocks becomes the head of the chain",
        "When a checkpoint has gathered enough votes to be finalized",
        "Which validator is due to propose the block in the next slot",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A fully synced execution client has 50 peers, but its latest block is an hour old. What is the likely cause?",
      options: [
        "Its consensus client is not driving it over the Engine API",
        "Its transaction pool is full and blocks new imports",
        "Its JSON-RPC listener is rate limiting its own head updates",
        "It lacks historical state and so refuses to import blocks",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "Over which network does the execution layer gossip the transactions in its pool?",
      options: [
        "devp2p, between execution clients",
        "libp2p gossip, between beacon nodes",
        "The Engine API, to its consensus client",
        "The Beacon API's server-sent event stream",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "You need a validator's balance and the latest finality checkpoints. Where do you ask?",
      options: [
        "The Beacon API on the consensus client",
        "eth_getBalance on the execution JSON-RPC",
        "eth_getBlockByNumber with the finalized tag",
        "engine_forkchoiceUpdated on the Engine API",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "Code reads a block's difficulty field to decide whether the chain uses proof of work. What does it see on modern blocks?",
      options: [
        "A constant zero, since mining fields are now vestigial",
        "The last proof-of-work difficulty, frozen at the Merge",
        "A rising value that tracks validator participation",
        "The total stake securing the beacon chain, in gwei",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why do the safe and finalized tags count as consensus facts, even on the execution JSON-RPC?",
      options: [
        "The consensus client names those blocks over the Engine API",
        "The execution client derives them from its own peer votes",
        "Execution clients read them from the Beacon API every slot",
        "They are computed from block depth, counting 64 confirmations",
      ],
      answer: 0,
    },
  ],

  "consensus-layer": [
    {
      kind: "detail",
      question: "What interface does a consensus client expose to applications and operators?",
      options: [
        "A REST Beacon API, typically on port 5052",
        "The same eth_ JSON-RPC that execution clients serve",
        "Only the Engine API, on its authenticated port 8551",
        "A GraphQL endpoint on the default port 8545",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why do execution block numbers and consensus slot numbers drift further apart over time?",
      options: [
        "A missed slot counts as a slot but produces no execution block",
        "Slot numbers restart from zero at the start of every epoch",
        "Execution blocks are numbered from the Merge, not from genesis",
        "Each execution block takes up two consecutive slots on the chain",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A consensus client imports a new block from gossip. Which Engine API calls does it make, in order?",
      options: [
        "engine_newPayload, then engine_forkchoiceUpdated",
        "engine_getPayload, then engine_newPayload",
        "engine_forkchoiceUpdated, then engine_getPayload",
        "engine_exchangeCapabilities, then engine_newPayload",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "How long is a slot, and how many slots make up an epoch?",
      options: [
        "12 seconds, with 32 slots to an epoch",
        "12 seconds, with 64 slots to an epoch",
        "6.4 minutes, with 32 slots to an epoch",
        "15 seconds, with 32 slots to an epoch",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "An application asks a consensus node for a blob posted two months ago. What does it get?",
      options: [
        "Nothing; sidecars are kept for about 18 days",
        "The blob, since consensus nodes keep every sidecar",
        "The blob, fetched on demand from the execution client",
        "Its KZG proof alone, since blob data is kept 4096 slots",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What distinguishes the jobs of LMD-GHOST and Casper FFG?",
      options: [
        "LMD-GHOST picks the head; Casper FFG finalizes checkpoints",
        "LMD-GHOST finalizes checkpoints; Casper FFG picks the head",
        "LMD-GHOST picks proposers; Casper FFG picks attesters",
        "LMD-GHOST runs on execution; Casper FFG runs on consensus",
      ],
      answer: 0,
    },
  ],

  "engine-api": [
    {
      kind: "scenario",
      question: "A consensus client's validator is due to propose in the next slot. Which call starts the execution client building a block?",
      options: [
        "engine_forkchoiceUpdated carrying payloadAttributes",
        "engine_getPayload carrying the target slot number",
        "engine_newPayload carrying an empty transaction list",
        "engine_exchangeCapabilities carrying the proposer index",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "engine_newPayload answers with status SYNCING. What is the execution client saying?",
      options: [
        "It lacks the payload's ancestors, so it cannot judge it yet",
        "The payload is invalid, but it will retry validation later",
        "The payload was accepted and will be executed next slot",
        "Its JWT expired, so the request was refused before execution",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does a clock difference between the two hosts make the Engine API refuse every call?",
      options: [
        "Each JWT's iat claim must sit within about 60 seconds of server time",
        "Payload timestamps must match the slot to within a second",
        "The JWT secret file is rotated on a clock-based schedule",
        "The consensus client drops replies that arrive after the slot",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What distinguishes an ACCEPTED payload status from INVALID?",
      options: [
        "ACCEPTED: well formed, on a side branch. INVALID: breaks the rules",
        "ACCEPTED was executed and is valid; INVALID failed its signature check",
        "ACCEPTED awaits the JWT check; INVALID has failed that check",
        "ACCEPTED is queued for the next slot; INVALID is dropped",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "An operator upgrades the execution client before a fork but leaves the consensus client as it was. What happens at the fork?",
      options: [
        "The node stalls, since the pair disagrees on method versions",
        "The node keeps working by falling back to older method versions",
        "Only blob transactions fail, since the older client ignores them",
        "The node warns about the mismatch but keeps following the head",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "How does each Engine API request prove it comes from the paired consensus client?",
      options: [
        "An HS256 JWT signed with the shared secret, in a Bearer header",
        "A client certificate checked during the TLS handshake on 8551",
        "The validator key signing each request body before it is sent",
        "An API key in the URL path, copied from the jwt.hex file",
      ],
      answer: 0,
    },
  ],

  "beacon-api": [
    {
      kind: "detail",
      question: "How does a caller name which beacon state or block a Beacon API route should answer for?",
      options: [
        "With an id such as head, finalized, a slot, or a root",
        "With a JSON-RPC block tag placed in the request body",
        "With a 32-byte root only, because slots can be empty",
        "With an execution block number that the client maps",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "You need data that exists on the consensus side alone. Which request must go to the Beacon API?",
      options: [
        "A validator's status and the current justified checkpoint",
        "A transaction receipt's gasUsed and effectiveGasPrice",
        "A contract's storage slot as it stood at the finalized block",
        "The base fee and gas used of the latest block",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What is the consensus-side counterpart to eth_subscribe for learning about reorgs?",
      options: [
        "The event stream at /eth/v1/events, topic chain_reorg",
        "A WebSocket on port 5052 using the eth_subscribe envelope",
        "Polling /eth/v1/node/syncing and comparing its answers",
        "A callback registered through engine_forkchoiceUpdated",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A tool written for JSON-RPC calls a Beacon API route and looks for result and error members. What does it find?",
      options: [
        "A data member, with failures signalled by HTTP status",
        "result and error, nested one level inside a data member",
        "result and error, since both APIs share one envelope",
        "An id member that it must match against the request",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A tool must learn a network's spec constants and fork schedule instead of hard-coding them. Which route group serves that?",
      options: [
        "/eth/v1/config",
        "/eth/v1/node",
        "/eth/v1/debug",
        "/eth/v1/validator",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why is putting the Beacon API on a public address a real decision rather than a formality?",
      options: [
        "It has no built-in auth, and some routes are costly or sensitive",
        "It shares port 5052 with gossip, which then stops working",
        "Its responses include the validator client's signing keys",
        "It serves the Engine API as well, on the same port by default",
      ],
      answer: 0,
    },
  ],

  "the-merge": [
    {
      kind: "detail",
      question: "In a post-Merge execution block header, which field carries the consensus layer's randomness?",
      options: [
        "mixHash, which now holds prevRandao",
        "difficulty, which now holds the RANDAO reveal",
        "nonce, which now holds the proposer index",
        "extraData, which now holds the beacon block root",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "Which addition to the execution JSON-RPC arrived with the Merge itself?",
      options: [
        "The safe and finalized block tags",
        "The pending block tag",
        "The baseFeePerGas field of EIP-1559",
        "The withdrawals field in block objects",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "After the Merge, an operator keeps running only the execution client, as before. What does the node do?",
      options: [
        "It stops following the chain, since nothing names the head",
        "It keeps mining blocks until its difficulty target is hit",
        "It follows the head by listening to beacon gossip itself",
        "It follows the chain but can no longer serve eth_call",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "The Merge changed who produces blocks. What did it leave untouched?",
      options: [
        "Gas limits, fees, and throughput",
        "The header difficulty and nonce fields",
        "The block reward in each execution block",
        "Block timing, which stayed a Poisson process",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A decoder assumes every post-Merge block has a withdrawals field. Where does it fail?",
      options: [
        "On blocks before Shapella, in April 2023",
        "On blocks after Dencun, which renamed the field",
        "On empty blocks, which leave the field out",
        "On blocks from missed slots, which carry no payload",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why did polling for new blocks become more predictable after the Merge?",
      options: [
        "Blocks follow a 12-second slot schedule, not a Poisson process",
        "Clients began pushing each new block to every HTTP caller at once",
        "Block times were cut to a fixed six seconds by the Engine API",
        "The difficulty bomb was removed, which steadied block times",
      ],
      answer: 0,
    },
  ],

  "eip": [
    {
      kind: "contrast",
      question: "An EIP's status is Final. What does that status tell you?",
      options: [
        "That its text is frozen, not that it is live anywhere",
        "That it went live on mainnet on the date in its header",
        "That every execution client has already shipped it",
        "That no later EIP can ever supersede or amend it",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "Which EIP added the option of passing a block hash object instead of a number to read methods?",
      options: [
        "EIP-1898",
        "EIP-1474",
        "EIP-1186",
        "EIP-155",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "When an implementation must decide what an EIP requires, which section is normative?",
      options: [
        "Specification",
        "Motivation",
        "Rationale",
        "Security Considerations",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "A token standard still in Draft status is already deployed on thousands of contracts. How can that be?",
      options: [
        "An ERC needs no network upgrade; status tracks only the text",
        "Client teams activate Draft ERCs early on mainnet for testing",
        "Draft ERCs become deployable once they enter Last Call",
        "Those contracts live on testnets, where Draft ERCs are active",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "After Pectra, eth_getCode for an externally owned account returns non-empty bytes. Which EIP explains that?",
      options: [
        "EIP-7702, set code transactions",
        "EIP-2718, typed transaction envelopes",
        "EIP-1186, account and storage proofs",
        "EIP-4895, validator withdrawals",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "EIP-1559 changed what RPC returns without adding a method. What did it add to responses?",
      options: [
        "baseFeePerGas in blocks and effectiveGasPrice in receipts",
        "blobGasUsed in receipts and a blob base fee in blocks",
        "A withdrawals list in blocks and a withdrawals root",
        "A type byte on every transaction, receipt, and envelope",
      ],
      answer: 0,
    },
  ],

  "hardfork": [
    {
      kind: "detail",
      question: "How does an execution-layer fork activate since the Merge?",
      options: [
        "At a Unix timestamp set in the client's chain configuration",
        "When a supermajority of validators signals readiness on chain",
        "At a block number that validators vote on before the fork",
        "When the consensus client sends forkchoiceUpdated with a fork flag",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "Which network upgrade first brought blob transactions to mainnet?",
      options: [
        "Dencun, in March 2024",
        "Shapella, in April 2023",
        "Pectra, in May 2025",
        "Fusaka, in December 2025",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why is a strict JSON decoder that rejects unknown keys a liability across upgrades?",
      options: [
        "Upgrades add fields, so it fails on the first post-fork block",
        "Upgrades change the hex encoding rules for existing fields",
        "Upgrades rename existing fields instead of adding new ones",
        "Upgrades switch block responses from JSON over to SSZ",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "Pectra is a contracted name. Which two forks does it combine, one per layer?",
      options: [
        "Prague on execution and Electra on consensus",
        "Electra on execution and Prague on consensus",
        "Paris on execution and Electra on consensus",
        "Prague on execution and Deneb on consensus",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "Code switches over a transaction's type field and throws on unknown values. What happens at an upgrade that adds a type?",
      options: [
        "It breaks on the first transaction of the new type",
        "It keeps working, since nodes hide new types from old callers",
        "It breaks once the node restarts with the new type list",
        "It rejects the fork's first block, whatever it contains",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "Where should a decoder that breaks on an upcoming upgrade's new fields be caught first?",
      options: [
        "On a public testnet, which forks weeks before mainnet",
        "On mainnet's first post-fork block, then roll back",
        "On an archive node, which receives new fields first",
        "In the EIP's Rationale, which lists every new field",
      ],
      answer: 0,
    },
  ],

  "testnets": [
    {
      kind: "scenario",
      question: "You need to rehearse validator and staking software on a public testnet. Which network fits?",
      options: [
        "Hoodi, chain id 560048",
        "Sepolia, chain id 11155111",
        "Holesky, chain id 17000",
        "Ephemery, reset on a fixed period",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why can the same code work on Sepolia and then fail on mainnet?",
      options: [
        "Testnets fork first, so a field may not exist on mainnet yet",
        "Testnets use a different hex encoding for QUANTITY values",
        "Testnet clients enable extra JSON-RPC namespaces by default",
        "Testnet block objects omit several fields that mainnet includes",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "What check catches a deployment accidentally pointed at the wrong network?",
      options: [
        "Comparing eth_chainId with the expected value on connect",
        "Comparing web3_clientVersion with the expected client",
        "Checking that eth_syncing returns false before starting",
        "Checking that the latest block's timestamp is recent",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What distinguishes Sepolia's validator set from the one on Hoodi?",
      options: [
        "Sepolia's is permissioned; Hoodi's is permissionless",
        "Sepolia's is permissionless; Hoodi's is permissioned",
        "Sepolia's resets on a fixed period; Hoodi's never does",
        "Sepolia's is shared with mainnet; Hoodi's is separate",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A team tunes its fee strategy against Sepolia and ships it unchanged to mainnet. What is likely to go wrong?",
      options: [
        "The strategy never met real fee pressure or competition",
        "Sepolia prices gas in a different unit from mainnet",
        "Mainnet rejects fee fields that were computed on a testnet",
        "The base fee rule differs, since EIP-1559 is mainnet-only",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What sets Ephemery apart and makes it useful for automated testing?",
      options: [
        "It resets on a fixed period, so it never accumulates state",
        "It runs a single client, so results never vary between runs",
        "It has no faucet limits, so tests can mint unlimited ether",
        "It forks weeks before Sepolia, so tests see upgrades first",
      ],
      answer: 0,
    },
  ],
};
