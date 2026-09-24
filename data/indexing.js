// Category: Indexing — turning raw blocks, receipts, and logs into queryable
// data, and surviving reorgs while doing it.

export const topics = [
  {
    id: "indexer",
    title: "Indexer",
    category: "indexing",
    aliases: ["indexing", "chain indexer", "ingest", "backfill", "derived data", "data pipeline"],
    summary: "An indexer is a service that reads every [[block|block]], [[transaction-receipt|receipt]], and [[event-log|log]] from a node over [[json-rpc|JSON-RPC]], decodes them against contract [[abi|ABIs]], and stores the result in a database that answers queries the node has no method for.",
    sections: [
      {
        heading: "What an indexer is for",
        paragraphs: [
          "The execution JSON-RPC is a lookup interface over chain data. It hands you one [[block|block]] by number, one [[transaction|transaction]] by hash, one [[account|account]] balance at one [[block-tag|block identifier]]. It has no method for 'every transfer this address ever received' or 'the current holders of this token', because the node stores neither. [[eth-get-logs|eth_getLogs]] comes closest and is still a bounded scan. An indexer turns per-item answers into those tables once, so an application can query them cheaply.",
          "Everything an indexer stores is derived data. Each row can be recomputed from the chain, and none of it is canonical: if the decode logic is wrong or a [[reorg|reorganization]] is missed, the database is wrong while the node is still right. An indexer is judged on whether replaying the same blocks produces the same rows, not on ingest speed.",
        ],
      },
      {
        heading: "The per-block loop",
        paragraphs: [
          "A minimal indexer runs one loop. It learns the head from [[eth-block-number|eth_blockNumber]] or an [[eth-subscribe|eth_subscribe]] `newHeads` stream, and for each unprocessed height it calls [[eth-get-block-by-number|eth_getBlockByNumber]] with `fullTransactions` set to `false` for the [[block-header|header]] and transaction hashes, then [[eth-get-block-receipts|eth_getBlockReceipts]] for every receipt and log of that block in one response. Endpoints without `eth_getBlockReceipts` fall back to `eth_getLogs` with `fromBlock` and `toBlock` at the same block, which returns logs but not `status` or `gasUsed`.",
          "Before writing anything it compares the new block's `parentHash` against the hash stored for the previous height. Equal means the chain extended; different means a reorg happened and the tail must be rolled back first. Then it decodes: `topics[0]` selects an [[event-signature|event signature]], the rest of the topics and `data` are decoded with the ABI, and rows are written with the new [[cursor-pagination|cursor]] in one database transaction, so a crash between the two cannot lose or duplicate work.",
          "That is two RPC calls per block in steady state. At 12-second [[slot-epoch|slots]] the chain produces roughly 7,200 blocks a day, so following the head is cheap; the expensive phase is backfill, where [[batch-request|batch requests]], concurrency, and the endpoint's [[rate-limits|rate limits]] decide how long a rebuild takes.",
        ],
      },
      {
        heading: "Staying correct",
        paragraphs: [
          "Rows must be keyed so a reorg can undo them exactly: (`blockHash`, `logIndex`) for logs and `blockHash` for block-level rows, because a replacement block reuses the `blockNumber` but never the hash. Deleting every row whose `blockHash` left the canonical chain and replaying the new branch restores consistency without a full resync; see [[indexing-database|indexing database]].",
          "Most indexers keep two frontiers: an optimistic one at the head that may be rewritten, and a settled one that advances only to blocks at or below `finalized` or some depth of [[confirmations|confirmations]]. Reading old ranges is a different problem: a [[pruned-node|pruned node]] serves recent blocks only, and [[history-expiry|history expiry]] drops old bodies and receipts, so deep backfills need an [[archive-node|archive node]] or another source of [[historical-data|historical data]].",
        ],
      },
      {
        heading: "Build or buy",
        paragraphs: [
          "Not every application needs its own. [[the-graph|Subgraphs]] package the same loop behind GraphQL, [[block-explorer|block explorers]] index everything already, [[rpc-provider|providers]] sell token APIs built on their own indexes, and [[etl-pipeline|ETL tools]] such as ethereum-etl and Cryo dump raw blocks and logs to files. Writing your own pays off when the decoding is contract-specific.",
        ],
      },
    ],
    example: {
      title: "The two calls an indexer makes per block",
      language: "bash",
      code: "# 1. the block: header fields plus transaction hashes (fullTransactions = false)\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBlockByNumber\",\"params\":[\"0x12d4f1c\",false]}' \\\n  https://rpc.example\n\n# 2. every receipt of that block, with every log, in one response\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_getBlockReceipts\",\"params\":[\"0x12d4f1c\"]}' \\\n  https://rpc.example\n\n# fallback when the endpoint lacks eth_getBlockReceipts: logs only, one block wide\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"eth_getLogs\",\"params\":[{\"fromBlock\":\"0x12d4f1c\",\"toBlock\":\"0x12d4f1c\"}]}' \\\n  https://rpc.example",
      note: "Two calls per block is the whole steady-state ingest; compare the returned `parentHash` with the hash you stored for `0x12d4f1b` before writing any of it.",
    },
    pitfalls: [
      "Keying derived rows by `blockNumber`; a reorg reuses the number with different contents, so the old rows are silently kept.",
      "Advancing the cursor in a separate write from the rows it covers; a crash in between either loses a block or replays it into duplicates.",
      "Calling [[eth-get-transaction-receipt|eth_getTransactionReceipt]] once per transaction instead of `eth_getBlockReceipts` once per block, which multiplies the request count by the block's transaction count.",
      "Treating the derived database as authoritative; it is a cache of a chain that changes under it, so anything irreversible must key off a finalized block.",
    ],
    related: ["event-log", "reorg", "cursor-pagination", "eth-get-logs", "eth-get-block-receipts", "indexing-database", "etl-pipeline", "the-graph", "confirmations", "historical-data"],
    sources: [
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "The Graph: how subgraphs index chain data", url: "https://thegraph.com/docs/" },
    ],
  },
  {
    id: "event-log",
    title: "Event log",
    category: "indexing",
    aliases: ["log", "event", "emit", "LOG0", "LOG4", "logIndex", "removed"],
    summary: "An event log is a record a [[smart-contract|contract]] emits with the `LOG0`–`LOG4` opcodes: up to four 32-byte `topics` plus arbitrary `data` bytes, stored in the [[transaction-receipt|receipt]] for off-chain consumers and unreadable from inside the [[evm|EVM]].",
    sections: [
      {
        heading: "The log object",
        paragraphs: [
          "Every log returned by [[eth-get-logs|eth_getLogs]], a receipt, or an [[eth-subscribe|eth_subscribe]] `logs` notification has the same shape. `address` is the 20-byte [[address|address]] of the contract that emitted it, which the EVM fills in and the emitter cannot forge. `topics` is an array of zero to four 32-byte values; for a normal event `topics[0]` is the [[event-signature|event signature hash]] and the rest are its indexed parameters. `data` is the ABI-encoded concatenation of the non-indexed parameters, as [[hex-encoding|DATA]] of arbitrary length.",
          "The remaining fields locate the log on the chain: `blockNumber`, `blockHash`, `transactionHash`, `transactionIndex`, and `logIndex`. `logIndex` counts logs across the whole block, not within one transaction, so the first log of the second transaction may be `0x5`. `removed` is `true` only when the log is being withdrawn by a [[reorg|reorg]] through a subscription or a [[eth-filters|polling filter]]; a plain `eth_getLogs` answer always describes the current canonical chain and returns `removed: false`.",
        ],
      },
      {
        heading: "How logs are produced and committed",
        paragraphs: [
          "Solidity's `emit` compiles to one of five opcodes. `LOG0` through `LOG4` take a memory range for `data` plus that many stack words for `topics`, and cost 375 gas for the opcode, 375 more per topic, and 8 [[gas|gas]] per byte of data. There is no opcode that reads a log back, so events are write-only from the chain's perspective: they exist to be observed by an [[indexer|indexer]], a wallet, or a frontend, never by another contract.",
          "Logs are not [[state|state]], but they are committed to. The logs of each transaction live in its receipt, the receipts of a block are hashed into `receiptsRoot` in the [[block-header|header]], and the addresses and topics of every log are folded into the block's 2048-bit [[logs-bloom|logs bloom]]. That bloom is how a node skips blocks quickly when answering a range query, and `receiptsRoot` is what makes a [[receipt-proof|receipt proof]] of a log possible at all.",
        ],
      },
      {
        heading: "Reading logs over RPC",
        paragraphs: [
          "Three access paths exist. `eth_getLogs` queries a block range with an address and topic filter and is what backfills use. [[eth-get-transaction-receipt|eth_getTransactionReceipt]] and [[eth-get-block-receipts|eth_getBlockReceipts]] return logs attached to their receipts, which is how you get `status` and `gasUsed` alongside them. `eth_subscribe` with `logs` pushes matching logs as blocks arrive over a [[websocket-transport|WebSocket]], including `removed: true` entries when a branch is dropped.",
          "A reverted transaction emits nothing: the EVM discards logs written before a [[revert|revert]] along with the state changes. A successful transaction's logs are the only reliable off-chain signal that something happened, which is why [[token-standards|token standards]] mandate them.",
        ],
      },
    ],
    example: {
      title: "One ERC-20 Transfer log as returned by eth_getLogs",
      language: "json",
      code: "{\n  \"address\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  \"topics\": [\n    \"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\",\n    \"0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045\",\n    \"0x0000000000000000000000001f2e8b6c0d9a4e5f7381cba0d2f3e4a5b6c7d8e9\"\n  ],\n  \"data\": \"0x000000000000000000000000000000000000000000000000000000003b9aca00\",\n  \"blockNumber\": \"0x12d4f1c\",\n  \"blockHash\": \"0x7d5a4369…f0d3\",\n  \"transactionHash\": \"0x5c504ed4…22060\",\n  \"transactionIndex\": \"0x2a\",\n  \"logIndex\": \"0x41\",\n  \"removed\": false\n}",
      note: "Two indexed addresses sit in `topics[1]` and `topics[2]` left-padded to 32 bytes, while the non-indexed amount (1,000,000,000 units) is the whole of `data`.",
    },
    pitfalls: [
      "Reading `logIndex` as an offset inside the transaction; it is the position within the block, so it must be combined with `blockHash` to be unique.",
      "Trusting an event to mean a real transfer; any contract can emit `Transfer`, so always check `address` against the token you actually care about.",
      "Decoding `data` positionally from the ABI's full parameter list; indexed parameters are absent from `data` and appear as topics instead.",
      "Expecting logs from a reverted transaction; the receipt has `status` `0x0` and an empty `logs` array.",
    ],
    related: ["event-signature", "eth-get-logs", "transaction-receipt", "logs-bloom", "abi", "eth-subscribe", "indexer", "smart-contract", "reorg"],
    sources: [
      { title: "Solidity: events", url: "https://docs.soliditylang.org/en/latest/contracts.html#events" },
      { title: "ethereum.org: eth_getLogs", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_getlogs" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "event-signature",
    title: "Event signatures and topics",
    category: "indexing",
    aliases: ["topic0", "event topic", "indexed", "anonymous event", "Transfer topic", "signature hash"],
    summary: "`topics[0]` of a log is the [[keccak-256|keccak-256]] hash of the event's canonical signature string, so `Transfer(address,address,uint256)` always hashes to `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef` on every contract that declares it.",
    sections: [
      {
        heading: "Computing topic0",
        paragraphs: [
          "The canonical signature is the event name followed by its parameter types in parentheses, comma-separated, with no spaces, no parameter names, and no `indexed` keywords. Aliases are expanded to canonical forms: `uint` becomes `uint256`, an enum becomes its underlying `uint8`, and a struct becomes a parenthesized tuple of its members. Hash that ASCII string with keccak-256 and keep all 32 bytes; that is `topics[0]`, unlike the [[abi|ABI]] function selector, which is the first four bytes of the same construction.",
          "Because the hash depends only on the string, two unrelated contracts declaring the same event produce the same `topics[0]`. That makes a global filter possible: one [[eth-get-logs|eth_getLogs]] call with no `address` and that one topic returns every ERC-20 style transfer in the range. The mapping is also one-way, so recovering 'which event is this' from an unknown `topics[0]` needs a signature database or the contract's [[abi|ABI]], not computation.",
        ],
      },
      {
        heading: "Indexed parameters",
        paragraphs: [
          "A non-anonymous event may mark up to three parameters `indexed`; they occupy `topics[1]` to `topics[3]` in declaration order, and everything else is ABI-encoded into `data`. A value type such as `address`, `uint256`, or `bytes32` is stored as its 32-byte word, so an [[address|address]] appears left-padded with twelve zero bytes. A dynamic type — `string`, `bytes`, an array, or a struct — is stored as the keccak-256 hash of its encoding, so you can filter on a value you already know but can never read it back out of the topic.",
          "An `anonymous` event omits `topics[0]` entirely and may therefore index four parameters. Its logs cannot be selected by signature, only by emitting [[address|address]] or by a known indexed value, which is why almost nothing uses it outside of gas-golfed contracts and proxy internals.",
        ],
      },
      {
        heading: "Filter semantics",
        paragraphs: [
          "The `topics` array in an `eth_getLogs` filter is positional. Position `i` constrains `topics[i]` of the log, `null` is a wildcard there, and an array at a position means OR across those values. Positions combine with AND, and a filter shorter than the log's topic array leaves the trailing positions unconstrained.",
          "Two consequences bite [[indexer|indexers]]. There is no OR across different positions in one call, so 'transfers from Alice or to Alice' is two filters or one broad query filtered client-side. And an address used as a topic must be the 32-byte padded form, not the 20-byte literal; the node matches topics as opaque words and simply returns nothing when the padding is wrong.",
        ],
      },
    ],
    example: {
      title: "One call for two event types, narrowed to one sender",
      language: "json",
      code: "{\n  \"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"eth_getLogs\",\n  \"params\": [{\n    \"fromBlock\": \"0x12d4f00\",\n    \"toBlock\": \"0x12d4f1c\",\n    \"address\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n    \"topics\": [\n      [\n        \"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\",\n        \"0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925\"\n      ],\n      \"0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045\"\n    ]\n  }]\n}",
      note: "Position 0 is an OR over the `Transfer` and `Approval` signature hashes; position 1 pins the first indexed parameter to one padded address, and positions 2 and 3 stay unconstrained.",
    },
    pitfalls: [
      "Hashing `Transfer(address,address,uint)` instead of the canonical `uint256` form, which yields a completely different topic and an empty result set.",
      "Passing a 20-byte address as a topic value; topics are matched as 32-byte words, so it must be left-padded to 64 hex characters.",
      "Expecting to read an indexed `string` or `bytes` parameter from its topic; only its keccak-256 hash is stored, so the value has to come from `data` or be known in advance.",
      "Assuming a log with three topics has three indexed parameters; for a non-anonymous event the first topic is the signature, so it has two.",
    ],
    related: ["event-log", "eth-get-logs", "abi", "keccak-256", "indexer", "token-standards", "logs-bloom", "smart-contract"],
    sources: [
      { title: "Solidity: contract ABI specification, events", url: "https://docs.soliditylang.org/en/latest/abi-spec.html#events" },
      { title: "ethereum.org: eth_getLogs", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_getlogs" },
      { title: "Solidity: events", url: "https://docs.soliditylang.org/en/latest/contracts.html#events" },
    ],
  },
  {
    id: "reorg",
    title: "Chain reorganization",
    category: "indexing",
    aliases: ["reorg", "reorganisation", "orphaned block", "removed logs", "chain rollback", "forked out"],
    summary: "A chain reorganization is [[fork-choice|fork choice]] replacing one or more blocks at the head with a competing branch, so blocks, transactions, and logs a node previously reported as canonical are withdrawn and usually replaced by others.",
    sections: [
      {
        heading: "What happens and how deep it goes",
        paragraphs: [
          "Under [[proof-of-stake|proof of stake]] one proposer is selected per 12-second [[slot-epoch|slot]], so competing blocks at the same height are rare and reorgs are almost always one block deep. The common causes are a block published too late to gather attestations, a proposer deliberately building on the grandparent because the parent arrived late, and ordinary network partitions. Deeper reorgs need a large share of validators to have voted the other way, and blocks at or below the `finalized` [[block-tag|block tag]] cannot be reverted at all without at least a third of all staked ETH being slashed; see [[finality|finality]].",
          "Since [[the-merge|the Merge]] there are no uncles: a block that loses the fork-choice race simply stops being canonical. Its transactions return to the [[mempool|transaction pool]] and are normally re-included in the next block or two, keeping the same transaction hash but landing under a different `blockHash`, `blockNumber`, `transactionIndex`, and `logIndex`. A transaction can also fail to come back, for example when the competing branch contains a conflicting transaction from the same [[nonce|nonce]].",
        ],
      },
      {
        heading: "Detecting it",
        paragraphs: [
          "The reliable local signal is `parentHash`. Store `(number, hash, parentHash)` for every block you process; when you fetch the next height, check that its `parentHash` equals the hash you stored for the height below. A mismatch means the branch changed, and you walk backwards comparing stored hashes against [[eth-get-block-by-number|eth_getBlockByNumber]] until you find the common ancestor. Polling that only increments a counter never notices, because the new chain answers every number happily.",
          "RPC gives partial help. An [[eth-subscribe|eth_subscribe]] `logs` stream and [[eth-filters|eth_getFilterChanges]] both deliver withdrawn logs with `removed: true`, and a `newHeads` subscription emits the headers of the new branch. [[eth-get-logs|eth_getLogs]] does not: it answers from the current canonical chain only, so a poller that re-queries a range after a reorg gets the new logs and never hears about the old ones. [[eth-get-transaction-receipt|eth_getTransactionReceipt]] starts returning `null` for an orphaned transaction, or a receipt with a different `blockHash` once it is re-included.",
        ],
      },
      {
        heading: "Recovering from one",
        paragraphs: [
          "Roll back before you roll forward. An [[indexer|indexer]] deletes every derived row whose `blockHash` is no longer canonical — which is why [[indexing-database|indexed rows]] are keyed by [[block-hash|block hash]] and not by number — then applies the blocks of the new branch from the common ancestor onwards. If writes are idempotent and scoped by hash, the rollback is a delete and a replay rather than a special code path.",
          "Irreversible side effects need a different rule: send the email, credit the deposit, or release the goods only after a chosen depth of [[confirmations|confirmations]], or once the block is at or below `finalized`. Note also that a reorg on one node is not automatically a reorg on another. Two endpoints behind a [[load-balancer|load balancer]] can disagree for a second or two, so a poller that switches nodes mid-poll may see a phantom reorg that never happened on either chain; see [[head-lag|head consistency across nodes]].",
        ],
      },
    ],
    example: {
      title: "Detecting a reorg by parentHash before writing",
      language: "js",
      code: "// after fetching the header for height n, before writing anything derived from it\nconst prev = await store.header(n - 1n);             // { hash, parentHash }\n\nif (prev && prev.hash !== header.parentHash) {\n  // the branch changed: walk back until a stored hash matches the canonical chain\n  let h = n - 1n;\n  while (h > 0n) {\n    const canonical = await rpc(\"eth_getBlockByNumber\", [toHex(h), false]);\n    const stored = await store.header(h);\n    if (!stored || stored.hash === canonical.hash) break;\n    h -= 1n;\n  }\n  await store.deleteBlocksAbove(h);                   // deletes rows by blockHash\n}\n\nawait store.apply(header, logs);                      // now the tail is consistent",
      note: "`parentHash` is the only cheap local detector; an indexer that just increments its block counter will never learn that the block it processed a minute ago is gone.",
    },
    pitfalls: [
      "Re-running `eth_getLogs` over a range and appending the results; the call never reports the old logs as removed, so orphaned rows stay in the database forever.",
      "Treating a reorg as transaction failure; the transaction usually reappears in a later block with the same hash but a different `blockHash` and `logIndex`.",
      "Recording only block numbers, so there is nothing to compare `parentHash` against and no way to tell which rows to delete.",
      "Assuming a one-block reorg is impossible on a well-connected node; single-block reorgs happen on mainnet regularly and are normal fork-choice behavior.",
    ],
    related: ["confirmations", "fork-choice", "block-tag", "indexer", "finality", "eth-get-logs", "head-lag", "block-hash", "eth-get-transaction-receipt", "indexing-database"],
    sources: [
      { title: "ethereum.org: proof-of-stake attack and defense", url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/attack-and-defense/" },
      { title: "Consensus specs: fork choice", url: "https://github.com/ethereum/consensus-specs/blob/dev/specs/phase0/fork-choice.md" },
      { title: "ethereum.org: eth_getLogs", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_getlogs" },
    ],
  },
  {
    id: "confirmations",
    title: "Confirmations",
    category: "indexing",
    aliases: ["confirmation count", "block depth", "how many confirmations", "settlement depth"],
    summary: "A confirmation count is the number of blocks built on top of the one containing a transaction, used as a heuristic for how unlikely a [[reorg|reorg]] is; under [[proof-of-stake|proof of stake]] the `safe` and `finalized` [[block-tag|block tags]] answer that question from the protocol instead.",
    sections: [
      {
        heading: "A heuristic inherited from proof of work",
        paragraphs: [
          "Under proof of work, reverting a block meant out-mining the honest chain, so the chance of a reversal fell exponentially with depth and 'six confirmations' became a rule of thumb. Ethereum no longer works that way. [[finality|Casper FFG]] finalizes checkpoints explicitly: a block at or below `finalized` can only be reverted if at least a third of all staked ETH is slashed, which normally happens two to three [[slot-epoch|epochs]] after inclusion, about 13 to 19 minutes, with 12.8 minutes the fastest case. `safe` marks the latest justified checkpoint and usually trails the head by one to two epochs.",
          "Depth still carries information for the window before finality. Single-block [[reorg|reorganizations]] are routine, two blocks are unusual, and anything deeper implies a real consensus problem rather than bad luck. So a confirmation count is a cheap way to price the risk in the first minute, and `finalized` is the correct answer once you can afford to wait.",
        ],
      },
      {
        heading: "Choosing a threshold",
        paragraphs: [
          "Match the wait to what a reversal would cost. Showing a balance or a pending order in a UI can use the head directly and correct itself. Crediting a user's deposit, releasing goods, or triggering an off-chain payment should wait for `finalized`, which is what exchanges and bridges converge on. In between, a handful of blocks buys most of the protection at a cost of seconds, and many [[indexer|indexers]] expose fresh data at the head while only advancing their settled frontier to a fixed depth.",
          "The number does not transfer between chains. On an [[l2-rpc|L2]] blocks are often 2 seconds or faster and are produced by a single [[sequencer|sequencer]], so twenty confirmations there is a soft promise from one party rather than twenty blocks of consensus work, and the L2's own `finalized` tag reflects what has settled on Ethereum, which can be far behind. A count copied from an L1 integration to an L2 is almost always wrong.",
        ],
      },
      {
        heading: "Implementing it correctly",
        paragraphs: [
          "The usual definition is `confirmations = head - blockNumber + 1`, counting the including block itself as the first. Computing that is not enough: depth says nothing about whether the block is still canonical. On each poll, re-read the [[eth-get-transaction-receipt|receipt]] and compare `blockHash` with the one you saw before. A transaction can sit at ten blocks of depth on a branch that is about to be dropped.",
          "The head you compare against must come from the same node that gave you the receipt. Different endpoints see the head at different times, so counting depth against one provider's [[eth-block-number|eth_blockNumber]] while reading receipts from another produces counts that jitter and occasionally go backwards; see [[head-lag|head consistency across nodes]].",
        ],
      },
    ],
    pitfalls: [
      "Counting depth without re-checking `blockHash`; a deep-looking transaction on an orphaned branch has no confirmations at all.",
      "Waiting for `finalized` inside an interactive flow; that is roughly 13 minutes of spinner, where a few blocks plus a later settlement check would do.",
      "Reusing an L1 confirmation threshold on an L2, where blocks are seconds apart and produced by one sequencer.",
      "Mixing providers when counting; head numbers from a lagging node make the count jump around or briefly decrease.",
    ],
    related: ["reorg", "finality", "block-tag", "eth-get-transaction-receipt", "indexer", "head-lag", "l2-rpc", "proof-of-stake"],
    sources: [
      { title: "ethereum.org: proof-of-stake and finality", url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/" },
      { title: "Consensus specs: safe block", url: "https://github.com/ethereum/consensus-specs/blob/dev/fork_choice/safe-block.md" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "cursor-pagination",
    title: "Cursor and range pagination",
    category: "indexing",
    aliases: ["pagination", "block range", "fromBlock toBlock", "chunking", "checkpoint", "resume"],
    summary: "Cursor and range pagination is how an [[indexer|indexer]] walks the chain in bounded pieces: fixed `fromBlock`/`toBlock` windows for [[eth-get-logs|eth_getLogs]], a durable record of the last fully processed block, and adaptive resizing when the endpoint rejects a window.",
    sections: [
      {
        heading: "Ranges, not offsets",
        paragraphs: [
          "`eth_getLogs` has no `LIMIT`, no offset, and no next-page token. The only controls are `fromBlock` and `toBlock`, or a single `blockHash`. The caller therefore does the paging, and the endpoint enforces its own ceilings: a maximum range width, a maximum number of matched logs, or a maximum response size. Exceeding one produces an [[rpc-errors|error]] rather than a truncated page, with messages like 'query returned more than 10000 results' or 'block range is too wide', typically under code `-32005` or a `-32000` server code.",
          "Those ceilings differ between [[rpc-provider|providers]], between plans, and between [[execution-client|clients]], and none of them is part of the spec, so a range width that works everywhere does not exist. The `blockHash` form of the filter sidesteps the width limit entirely by pinning exactly one block, which is what a head-following loop should use anyway.",
        ],
      },
      {
        heading: "The durable cursor",
        paragraphs: [
          "The cursor is the highest block whose derived rows are completely written, stored with that block's hash. It must be updated in the same database transaction as the rows it covers; otherwise a crash leaves the two out of step and the restart either skips a block or replays one. On restart the process reads the cursor, re-checks that the stored hash is still canonical, and continues from the next height.",
          "The cursor also moves backwards. When a [[reorg|reorg]] is detected, the rollback deletes rows above the common ancestor and rewinds the cursor to it, so the same code path that handles a restart handles a reorg. Many pipelines keep a second, slower cursor that only advances to blocks at or below `finalized` or a fixed depth of [[confirmations|confirmations]], and drive exports and aggregates from that one.",
        ],
      },
      {
        heading: "Adaptive ranges and backfill",
        paragraphs: [
          "Backfill is where the tuning happens. Start with a candidate width, halve it on a limit error and retry the same starting block, and grow it back slowly after a run of successes. Activity is bursty — an airdrop block can emit more logs than the previous thousand blocks combined — so a width tuned on quiet history will fail in busy history and a fixed width wastes calls everywhere else. Combine the adaptive width with backoff on `429` responses; see [[rate-limits|rate limits]].",
          "Large backfills split into shards, each with its own cursor over a disjoint range, run in parallel and merged when they meet the head-following worker. That only works if writes are idempotent: upsert on (`blockHash`, `logIndex`) so a retried or overlapping range produces no duplicates, which also makes ordinary [[retries|retries]] safe.",
        ],
      },
    ],
    example: {
      title: "A range query, its limit error, and the halved retry",
      language: "json",
      code: "// request: 5,000 blocks wide\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getLogs\",\"params\":[{\"fromBlock\":\"0x12d0000\",\"toBlock\":\"0x12d1388\",\"topics\":[\"0xddf252ad…3ef\"]}]}\n\n// response: the endpoint refuses rather than truncating\n{\"jsonrpc\":\"2.0\",\"id\":1,\"error\":{\"code\":-32005,\"message\":\"query returned more than 10000 results\"}}\n\n// retry the same starting block with half the width, then grow again on success\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_getLogs\",\"params\":[{\"fromBlock\":\"0x12d0000\",\"toBlock\":\"0x12d09c4\",\"topics\":[\"0xddf252ad…3ef\"]}]}",
      note: "Never advance the cursor past a window that errored; the correct retry restarts at the same `fromBlock` with a smaller `toBlock`.",
    },
    pitfalls: [
      "Using `toBlock: \"latest\"` inside a backfill loop, which makes the window grow as the chain advances and the result non-reproducible.",
      "Advancing the cursor after a partial write; the skipped logs are never revisited because nothing ever scans backwards.",
      "Retrying a rejected range from the middle instead of the original `fromBlock`, which silently drops the first half of the window.",
      "Hard-coding one range width for every endpoint; limits vary by provider, by plan, and by how log-dense the contract is.",
    ],
    related: ["indexer", "eth-get-logs", "rate-limits", "retries", "reorg", "etl-pipeline", "indexing-database", "historical-data"],
    sources: [
      { title: "ethereum.org: eth_getLogs", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_getlogs" },
      { title: "EIP-1474: Remote procedure call specification", url: "https://eips.ethereum.org/EIPS/eip-1474" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "historical-data",
    title: "Historical data",
    category: "indexing",
    aliases: ["old blocks", "history", "backfill source", "ancient data", "historical state"],
    summary: "Historical data is the chain's past — blocks, transactions, receipts, and logs — which is a different thing from historical [[state|state]]: a [[full-node|full node]] keeps all of the first and almost none of the second, and each is lost to a different kind of pruning.",
    sections: [
      {
        heading: "History is not state",
        paragraphs: [
          "History is what was published: [[block-header|headers]], transaction bodies, and [[transaction-receipt|receipts]] with their logs. State is the result of executing it: every [[account|account]] balance, [[nonce|nonce]], code hash, and storage slot as of one block. A full node replays every block and therefore holds all history, but it keeps only recent state, because storing a snapshot per block is what makes an [[archive-node|archive node]] expensive.",
          "The practical split shows up in which call fails. [[eth-get-block-by-number|eth_getBlockByNumber]] and [[eth-get-logs|eth_getLogs]] over a five-year-old range work on an ordinary full node. [[eth-get-balance|eth_getBalance]], [[eth-call|eth_call]], [[eth-get-storage-at|eth_getStorageAt]], and [[eth-get-proof|eth_getProof]] at that same block do not; they return a 'missing trie node' or 'historical state not available' [[rpc-errors|error]] because the trie for that block was discarded. [[geth|Geth]] on the path-based scheme keeps roughly the last 128 blocks of state.",
        ],
      },
      {
        heading: "History that is going away",
        paragraphs: [
          "EIP-4444 proposed that nodes stop serving very old bodies and receipts, and in 2025 [[execution-client|execution clients]] began doing it partially: pre-Merge bodies and receipts may be dropped while all headers are kept. Distribution moved to era1 archive files and the [[portal-network|Portal Network]]; see [[history-expiry|history expiry]] for what each client actually drops. Separately, [[geth|Geth]] keeps the transaction-hash index only for `--history.transactions` blocks, about 2,350,000 by default, so [[eth-get-transaction-by-hash|eth_getTransactionByHash]] returns `null` for older transactions on a node that still has their block.",
          "[[blob|Blob]] data has always been temporary. Sidecars are retained on the [[consensus-layer|consensus layer]] for 4096 epochs, roughly 18 days, after which only the versioned hashes in the [[block-header|header]] survive and the bytes must come from whoever archived them.",
        ],
      },
      {
        heading: "Where old data comes from",
        paragraphs: [
          "Four sources, in rising order of trust required. Your own archive node answers everything but costs terabytes and days of sync. An archive-capable [[rpc-provider|provider]] answers the same calls for a fee and a trust assumption. An [[indexer|indexer]] or dataset — your own [[etl-pipeline|ETL dump]], a public warehouse, a [[block-explorer|block explorer]] API — answers query-shaped questions much faster but only for what it chose to index. Era files and the Portal Network hand you the raw blocks and leave verification to you.",
          "One subtlety catches teams building [[state-proof|proof]] systems: archive state is not the same as archive proofs. Clients that store state in flat key-value layouts can serve an old balance while being unable to rebuild that block's trie nodes, so `eth_getProof` at a deep block can fail on a node that answers `eth_getBalance` for it happily; see [[client-storage|client storage engines]].",
        ],
      },
    ],
    pitfalls: [
      "Assuming an archive endpoint answers every historical method; tracing and `eth_getProof` depth are separate capabilities that have to be probed.",
      "Planning a backfill over all history against an endpoint with a block-range limit, without first checking how far back it actually serves logs.",
      "Expecting blob contents to be retrievable months later; only the versioned hash is permanent, and the sidecar is pruned after about 18 days.",
      "Treating 'full node' as meaning it can answer historical `eth_call`; it holds history, not the state those calls need.",
    ],
    related: ["archive-node", "pruned-node", "history-expiry", "indexer", "portal-network", "eth-get-logs", "client-storage", "state", "blob", "etl-pipeline"],
    sources: [
      { title: "EIP-4444: Bound historical data in execution clients", url: "https://eips.ethereum.org/EIPS/eip-4444" },
      { title: "Geth command-line options", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
      { title: "ethereum.org: nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
    ],
  },
  {
    id: "etl-pipeline",
    title: "ETL pipeline",
    category: "indexing",
    aliases: ["extract transform load", "ethereum-etl", "cryo", "data warehouse", "bulk export"],
    summary: "A chain ETL pipeline extracts raw blocks, receipts, and logs over RPC, transforms them by decoding with [[abi|ABIs]] and normalizing the [[hex-encoding|hex]] into typed columns, and loads them idempotently into a store that tolerates a later [[reorg|reorg]] rewriting recent rows.",
    sections: [
      {
        heading: "Extract",
        paragraphs: [
          "Extraction is the same two calls an [[indexer|indexer]] makes — [[eth-get-block-by-number|eth_getBlockByNumber]] and [[eth-get-block-receipts|eth_getBlockReceipts]] — issued at whatever concurrency the endpoint tolerates, often folded into [[batch-request|batch requests]] of 10 to 100 to cut round trips. Budget it explicitly: 20 million blocks at two calls each is 40 million requests, so throughput is set by [[rate-limits|rate limits]] and [[cursor-pagination|range sizing]], not by your database.",
          "Internal value transfers are the expensive exception. They emit no [[event-log|log]], so reconstructing them needs [[trace-api|trace_block]] or [[debug-api|debug_traceBlockByNumber]] with `callTracer`, which costs orders of magnitude more per block, is unavailable on many endpoints, and requires an [[archive-node|archive node]] for old ranges.",
        ],
      },
      {
        heading: "Transform",
        paragraphs: [
          "Transformation is mostly typing and decoding. Every numeric field arrives as a hex QUANTITY, and `uint256` values do not fit in a 64-bit integer: a token amount with 18 decimals overflows `BIGINT` routinely, so amounts belong in a wide decimal type or a byte string. Addresses and hashes should be stored in one canonical form — lowercase hex or raw bytes — because mixing checksummed and lowercase text makes joins miss silently.",
          "Decoding maps `topics[0]` to an [[event-signature|event signature]] and unpacks the remaining topics and `data` with the contract ABI. Keep the raw log alongside the decoded row. A wrong ABI or a newly discovered event is then a re-transform over data you already hold, rather than a second multi-day extraction.",
        ],
      },
      {
        heading: "Load",
        paragraphs: [
          "Loading must be idempotent, because every retry, shard overlap, and reorg replay writes rows that may already exist. Upserting on (`blockHash`, `logIndex`) makes repeats harmless, and keying every derived table by `blockHash` makes a rollback a delete instead of a rebuild; see [[indexing-database|indexing database]]. Off-the-shelf tools cover the common shapes: ethereum-etl exports blocks, transactions, receipts, logs, and token transfers to CSV, JSON, or a warehouse, and Cryo writes the same primitives to Parquet with adjustable block ranges.",
          "A two-stage layout ages well. Land raw, append-only tables straight from RPC, then build decoded and aggregated tables from them. The raw layer is the expensive part to reproduce, the derived layer is cheap, and separating them means a schema change never triggers another full backfill over [[historical-data|historical data]].",
        ],
      },
    ],
    pitfalls: [
      "Storing `uint256` amounts in a 64-bit integer column; an ordinary 18-decimal token transfer overflows it and the failure is silent in some engines.",
      "Decoding during extraction only, so an ABI mistake forces a complete re-extract instead of a cheap re-transform.",
      "Mixing checksummed and lowercase addresses across tables, which turns joins into silent empty results.",
      "Assuming traces are available; many endpoints expose neither `trace_` nor `debug_`, and those that do meter them far more heavily than `eth_` calls.",
    ],
    related: ["indexer", "indexing-database", "cursor-pagination", "abi", "eth-get-block-receipts", "trace-api", "rate-limits", "historical-data", "hex-encoding"],
    sources: [
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "ethereum.org: data and analytics", url: "https://ethereum.org/developers/docs/data-and-analytics/" },
    ],
  },
  {
    id: "indexing-database",
    title: "Indexing database",
    category: "indexing",
    aliases: ["schema", "postgres", "clickhouse", "reorg-safe schema", "derived tables"],
    summary: "An indexing database stores derived chain data in a shape that a [[reorg|reorg]] can undo: a blocks table keyed by `hash` with its `parent_hash`, every derived row carrying that `block_hash`, and a rollback that is one delete cascading downwards.",
    sections: [
      {
        heading: "The reorg-safe shape",
        paragraphs: [
          "One table anchors everything: blocks, with `number`, `hash`, `parent_hash`, and `timestamp`. It is the record that lets an [[indexer|indexer]] compare a newly fetched header's `parentHash` against what it already stored, and it is the deletion root. Every derived table — logs, decoded transfers, positions, balances — carries the `block_hash` it was produced from and references that table with `ON DELETE CASCADE`.",
          "With that shape, unwinding a reorg is a single statement deleting blocks above the common ancestor; the cascade removes everything downstream and no derived table needs its own rollback logic. Keying by [[block-hash|block hash]] rather than number is what makes it correct: the replacement block reuses the number, so a number-keyed row would be quietly overwritten in some tables and left stale in others.",
        ],
      },
      {
        heading: "Keys and types",
        paragraphs: [
          "The natural unique key for a log is (`block_hash`, `log_index`), since `logIndex` is unique within a block. Making it the primary key and writing with an upsert gives idempotency for free, so a retried range or an overlapping backfill shard cannot create duplicates. Transaction-level rows key on (`block_hash`, `transaction_index`), which stays correct even when the same transaction hash appears under two branches.",
          "Types matter as much as keys. `uint256` needs a wide decimal such as `NUMERIC(78, 0)` or raw bytes, never a 64-bit integer. Hashes and [[address|addresses]] are fixed-width binary or one consistent lowercase hex convention. Block timestamps come from the [[block-header|header]] and are the only clock worth indexing on; wall-clock ingest time tells you about your pipeline, not the chain.",
        ],
      },
      {
        heading: "Engine choice and serving",
        paragraphs: [
          "Postgres is the default because foreign keys, cascades, and transactional upserts give reorg safety with almost no code. ClickHouse and similar analytic stores win on scan-heavy aggregate queries but have no cascading delete, so reorg handling moves into the writer: either drop and rewrite a partition, or only load blocks that are already at or below `finalized` and serve the unsettled head from somewhere else.",
          "Whatever the engine, aggregates and materialized views should be computed from the settled frontier rather than the head, so a one-block [[reorg|reorg]] never forces a recount. And record the cursor and the source endpoint alongside the data: derived rows are not canonical, and the only defence is being able to rebuild them and get the same answer; see [[confirmations|confirmations]].",
        ],
      },
    ],
    example: {
      title: "A reorg-safe schema sketch, and the rollback it enables",
      language: "text",
      code: "CREATE TABLE blocks (\n  number      BIGINT      NOT NULL,\n  hash        BYTEA       PRIMARY KEY,\n  parent_hash BYTEA       NOT NULL,\n  timestamp   TIMESTAMPTZ NOT NULL\n);\nCREATE INDEX blocks_number_idx ON blocks (number);\n\nCREATE TABLE logs (\n  block_hash BYTEA   NOT NULL REFERENCES blocks(hash) ON DELETE CASCADE,\n  log_index  INT     NOT NULL,\n  tx_hash    BYTEA   NOT NULL,\n  address    BYTEA   NOT NULL,\n  topic0     BYTEA   NOT NULL,\n  topics     BYTEA[] NOT NULL,\n  data       BYTEA   NOT NULL,\n  PRIMARY KEY (block_hash, log_index)\n);\nCREATE INDEX logs_address_topic0_idx ON logs (address, topic0);\n\n-- ingest is an upsert, so replays and overlapping shards are harmless\nINSERT INTO logs (...) VALUES (...) ON CONFLICT (block_hash, log_index) DO NOTHING;\n\n-- and unwinding a reorg is one statement; the cascade does the rest\nDELETE FROM blocks WHERE number > $common_ancestor;",
      note: "Every derived table that carries `block_hash` and cascades from `blocks` inherits reorg handling without writing any.",
    },
    pitfalls: [
      "Making `block_number` the primary key of a derived table; the replacement block reuses it and the stale row survives the reorg.",
      "Storing token amounts in `BIGINT`; an 18-decimal `uint256` exceeds it and either wraps or raises at an unpredictable row.",
      "Serving aggregates computed over unsettled head blocks, which makes totals wobble every time a single-block reorg happens.",
      "Assuming ClickHouse-style stores give you rollback; without cascading deletes the reorg logic has to live in the writer.",
    ],
    related: ["indexer", "reorg", "etl-pipeline", "cursor-pagination", "event-log", "confirmations", "block-hash", "historical-data"],
    sources: [
      { title: "ethereum.org: data and analytics", url: "https://ethereum.org/developers/docs/data-and-analytics/" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "The Graph: indexing concepts", url: "https://thegraph.com/docs/" },
    ],
  },
  {
    id: "the-graph",
    title: "The Graph and subgraphs",
    category: "indexing",
    aliases: ["subgraph", "graph-node", "graphql", "substreams", "firehose", "GRT"],
    summary: "The Graph is an indexing protocol whose subgraphs declare, in a manifest plus a GraphQL schema and AssemblyScript mappings, which contract events a `graph-node` should follow and what entities to write, so applications query GraphQL instead of [[eth-get-logs|eth_getLogs]].",
    sections: [
      {
        heading: "What a subgraph is",
        paragraphs: [
          "A subgraph is three artifacts. The manifest, `subgraph.yaml`, lists data sources: a contract [[address|address]], the [[abi|ABI]], a `startBlock`, and handlers that bind an event's canonical signature to a function name. `schema.graphql` declares the entities and fields the API will expose. The mapping code, written in AssemblyScript and compiled to WebAssembly, receives each decoded [[event-log|event]] as a typed object and saves entities.",
          "`graph-node` is the process that runs all of this. It resolves each `event:` string to a topic0 exactly as [[event-signature|event signatures]] are computed, subscribes from `startBlock`, calls your handler once per matching log in order, and stores the resulting entities so a GraphQL query can join and filter them. Handlers are deterministic: they may read chain data with an [[eth-call|eth_call]] but cannot perform arbitrary network I/O, because two indexers must derive identical results.",
        ],
      },
      {
        heading: "Where the data comes from",
        paragraphs: [
          "In the ordinary setup `graph-node` is pointed at an RPC endpoint and behaves like any other [[indexer|indexer]]: it follows the head, fetches logs and blocks, and tracks `parentHash` so it can revert entity versions when a [[reorg|reorg]] happens. Because every entity write is recorded against a block, the rollback is automatic rather than something a mapping author handles.",
          "Two handler kinds raise the requirements sharply. Call handlers fire on a contract function call and depend on the Parity-style tracing API, so they need a [[trace-api|trace-capable]] and usually [[archive-node|archive]] endpoint. Block handlers run on every block, which is the most expensive option of all. For high-throughput cases The Graph offers Firehose and Substreams, which stream pre-extracted block data instead of making the node answer one query at a time.",
        ],
      },
      {
        heading: "Network, studio, and limits",
        paragraphs: [
          "Development happens in Subgraph Studio, where a subgraph is built with the `graph` CLI and deployed for testing. Production runs on the decentralized network, where independent operators index subgraphs, curators signal which ones matter, and queries are paid for in GRT. Self-hosting `graph-node` next to your own node is also common when the data is private or the query volume is small.",
          "The constraints are worth knowing before committing. Indexing starts at `startBlock` and must catch up from there, so an old contract means a long initial sync. Most schema or mapping changes produce a new deployment that resyncs from scratch. And the served data always lags the head slightly, so a subgraph is a good source for history and aggregates and a poor one for 'did my transaction just land'; use [[eth-get-transaction-receipt|eth_getTransactionReceipt]] for that.",
        ],
      },
    ],
    example: {
      title: "A subgraph manifest binding one event to one handler",
      language: "yaml",
      code: "specVersion: 1.0.0\nschema:\n  file: ./schema.graphql\ndataSources:\n  - kind: ethereum\n    name: Token\n    network: mainnet\n    source:\n      address: \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\"\n      abi: ERC20\n      startBlock: 6082465          # the contract's deployment block, not 0\n    mapping:\n      kind: ethereum/events\n      apiVersion: 0.0.9\n      language: wasm/assemblyscript\n      file: ./src/token.ts\n      entities:\n        - Transfer\n        - Account\n      abis:\n        - name: ERC20\n          file: ./abis/ERC20.json\n      eventHandlers:\n        - event: Transfer(indexed address,indexed address,uint256)\n          handler: handleTransfer",
      note: "The `event:` string is the canonical signature with `indexed` markers kept; graph-node hashes the version without them to get topic0 and uses the markers to know which arguments come from topics.",
    },
    pitfalls: [
      "Leaving `startBlock` at 0, which makes the subgraph replay years of irrelevant blocks before it reaches your contract.",
      "Using call handlers or block handlers without checking that the endpoint exposes tracing and archive history; indexing simply stalls otherwise.",
      "Treating subgraph output as real-time confirmation of a transaction; it trails the head and should not gate a user-facing 'sent' state.",
      "Expecting a schema change to apply in place; most changes deploy a new subgraph version that has to sync from `startBlock` again.",
    ],
    related: ["indexer", "event-log", "event-signature", "eth-get-logs", "abi", "block-explorer", "etl-pipeline", "indexing-database", "trace-api"],
    sources: [
      { title: "The Graph documentation", url: "https://thegraph.com/docs/" },
      { title: "The Graph: subgraph manifest", url: "https://thegraph.com/docs/en/subgraphs/developing/creating/subgraph-manifest/" },
      { title: "ethereum.org: data and analytics", url: "https://ethereum.org/developers/docs/data-and-analytics/" },
    ],
  },
  {
    id: "block-explorer",
    title: "Block explorers",
    category: "indexing",
    aliases: ["etherscan", "blockscout", "otterscan", "explorer api", "internal transactions", "verified source"],
    summary: "A block explorer is a website and API over an indexed copy of the chain — Etherscan, Blockscout, Otterscan — showing [[block|blocks]], transactions, [[event-log|logs]], internal calls reconstructed from [[execution-trace|traces]], token balances, and verified contract source.",
    sections: [
      {
        heading: "What they add on top of RPC",
        paragraphs: [
          "Most of what makes an explorer useful is not available from a node in one call. Internal transactions — value-moving calls made by [[smart-contract|contracts]] during execution — emit no [[event-log|log]] and have no [[transaction-receipt|receipt]], so an explorer reconstructs them by running [[trace-api|trace_block]] or [[debug-api|debug_traceBlockByNumber]] over every block and storing the results. Token balances and transfer histories are assembled from `Transfer` logs. Function and event names come from decoding [[abi|ABI]] selectors against a signature directory.",
          "Source verification is the other half. A developer uploads sources and compiler settings, the explorer recompiles and compares the bytecode to what is deployed, and on a match it publishes the source and ABI. That ABI is then what lets the explorer, and anyone calling its API, decode calldata and events for that [[address|address]].",
        ],
      },
      {
        heading: "The three you will meet",
        paragraphs: [
          "Etherscan is the closed-source, hosted one, covering Ethereum and many other networks, with a REST API that needs an API key and enforces a low free-tier request rate. Blockscout is open source and self-hostable, runs as the default explorer for many testnets and [[rollup|rollups]], and exposes an Etherscan-compatible API alongside its own. Otterscan is different in kind: a self-hosted front end that talks directly to an [[erigon|Erigon]] node through the `ots_` namespace, so there is no separate index to maintain and no third party in the path.",
          "Otterscan has no API of its own: it is a browser app reading Erigon's [[json-rpc|JSON-RPC]] directly. Etherscan's and Blockscout's APIs are REST with their own parameter names, pagination, and key handling, which is why an explorer API is a research and tooling dependency rather than a drop-in for an [[rpc-provider|RPC provider]].",
        ],
      },
      {
        heading: "Why explorer data lags and differs",
        paragraphs: [
          "An explorer is an [[indexer|indexer]], so everything it shows is derived. Block and transaction pages usually appear within a block or two, but token balances, holder counts, analytics, and label data are produced by slower jobs and can trail the chain by minutes. After a [[reorg|reorg]] an explorer rewrites its own history, which is why a transaction can be visible and then vanish.",
          "Treat it accordingly. An explorer is excellent for investigating one transaction, reading verified source, or checking an address by hand, and it is the wrong source of truth for anything automated and financial, where the [[eth-get-transaction-receipt|receipt]] from a node you trust is the answer.",
        ],
      },
    ],
    pitfalls: [
      "Calling an explorer's internal transactions real transactions; they have no hash of their own, no receipt, and no independent existence outside the trace.",
      "Building production logic on an explorer API, whose rate limits, key requirements, and response shapes are neither standard nor guaranteed.",
      "Trusting verified source for a proxy; the verified code at that address is the proxy, and the behavior lives at the implementation address.",
      "Reading an explorer's token balance as authoritative; it is recomputed from indexed transfers and can lag or miss non-standard token behavior.",
    ],
    related: ["indexer", "execution-trace", "trace-api", "event-log", "erigon", "indexing-database", "eth-get-logs", "the-graph", "smart-contract"],
    sources: [
      { title: "ethereum.org: block explorers", url: "https://ethereum.org/developers/docs/data-and-analytics/block-explorers/" },
      { title: "Erigon documentation", url: "https://docs.erigon.tech/" },
      { title: "ethereum.org: data and analytics", url: "https://ethereum.org/developers/docs/data-and-analytics/" },
    ],
  },
];
