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
          "The execution JSON-RPC is a lookup interface over chain data. It hands you one [[block|block]] by number, one [[transaction|transaction]] by hash, one [[account|account]] balance at one [[block-tag|block identifier]]. It has no method for '[[address-history|every transfer this address ever received]]' or 'the current holders of this token', because the node stores neither. [[eth-get-logs|eth_getLogs]] comes closest and is still a bounded scan. An indexer turns per-item answers into those tables once, so an application can query them cheaply.",
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
    related: ["event-log", "reorg", "cursor-pagination", "eth-get-logs", "eth-get-block-receipts", "indexing-database", "etl-pipeline", "the-graph", "confirmations", "historical-data", "graph-node", "firehose", "client-extensions", "chain-analytics"],
    sources: [
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
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
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
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
    related: ["event-log", "eth-get-logs", "abi", "keccak-256", "indexer", "token-standards", "logs-bloom", "smart-contract", "signature-directory"],
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
    related: ["confirmations", "fork-choice", "block-tag", "indexer", "finality", "eth-get-logs", "head-lag", "block-hash", "eth-get-transaction-receipt", "indexing-database", "firehose"],
    sources: [
      { title: "ethereum.org: proof-of-stake attack and defense", url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/attack-and-defense/" },
      { title: "Consensus specs: fork choice", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/phase0/fork-choice.md" },
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
          "Under proof of work, reverting a block meant out-mining the honest chain, so the chance of a reversal fell exponentially with depth and 'six confirmations' became a rule of thumb. Ethereum no longer works that way. [[finality|Casper FFG]] finalizes checkpoints explicitly: a block at or below `finalized` can only be reverted if at least a third of all staked ETH is slashed, which normally happens two to three [[slot-epoch|epochs]] after inclusion, about 13 to 19 minutes, with 12.8 minutes the fastest case. `safe` depends on the consensus client: one running the [[fast-confirmation-rule|fast confirmation rule]], added to the consensus specs in April 2026, sends a block one or two slots behind the head, while the others send the latest justified checkpoint, one to two epochs behind.",
          "Depth still carries information for the window before finality. Single-block [[reorg|reorganizations]] are routine, two blocks are unusual, and anything deeper implies a real consensus problem rather than bad luck. So a confirmation count is a cheap way to price the risk in the first minute, and `finalized` is the correct answer once you can afford to wait.",
        ],
      },
      {
        heading: "Choosing a threshold",
        paragraphs: [
          "Match the wait to what a reversal would cost. Showing a balance or a pending order in a UI can use the head directly and correct itself. Crediting a user's deposit, releasing goods, or triggering an off-chain payment should wait for `finalized`, which is what [[exchange-deposits|exchanges]] and [[cross-chain-relayer|bridges]] converge on. In between, a handful of blocks buys most of the protection at a cost of seconds, and many [[indexer|indexers]] expose fresh data at the head while only advancing their settled frontier to a fixed depth.",
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
    related: ["reorg", "finality", "block-tag", "eth-get-transaction-receipt", "indexer", "head-lag", "l2-rpc", "proof-of-stake", "preconfirmation", "exchange-deposits"],
    sources: [
      { title: "ethereum.org: proof-of-stake and finality", url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/" },
      { title: "Consensus specs v1.6.1: safe block", url: "https://github.com/ethereum/consensus-specs/blob/v1.6.1/fork_choice/safe-block.md" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
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
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
    ],
  },
  {
    id: "historical-data",
    title: "Historical data",
    category: "indexing",
    aliases: ["old blocks", "history", "backfill source", "ancient data", "historical state"],
    summary: "Historical data is the chain's past — blocks, transactions, receipts, and logs — which is a different thing from historical [[state|state]]: a [[full-node|full node]] keeps each to its own depth, and each is lost to a different kind of pruning.",
    sections: [
      {
        heading: "History is not state",
        paragraphs: [
          "History is what was published: [[block-header|headers]], transaction bodies, and [[transaction-receipt|receipts]] with their logs. State is the result of executing it: every [[account|account]] balance, [[nonce|nonce]], code hash, and storage slot as of one block. A full node keeps only recent state, because storing a snapshot per block is what makes an [[archive-node|archive node]] expensive, and a [[partial-archive|partial archive]] keeps a window or slice of that state. Full nodes used to hold all history as well, and [[geth|Geth]] still does by default, but how much history one keeps now varies by client.",
          "The practical split shows up in which call fails. [[eth-get-block-by-number|eth_getBlockByNumber]] and [[eth-get-logs|eth_getLogs]] over a five-year-old range work on a full node that kept its history, such as a default Geth node. [[eth-get-balance|eth_getBalance]], [[eth-call|eth_call]], [[eth-get-storage-at|eth_getStorageAt]], and [[eth-get-proof|eth_getProof]] at that same block do not; they return a 'missing trie node' or 'historical state not available' [[rpc-errors|error]] because the trie for that block was discarded. [[geth|Geth]] on the path-based scheme keeps roughly the last 128 blocks of state.",
        ],
      },
      {
        heading: "History that is going away",
        paragraphs: [
          "EIP-4444 proposed that nodes stop serving very old bodies and receipts, and in 2025 [[execution-client|execution clients]] began doing it partially: pre-Merge bodies and receipts may be dropped while all headers are kept. Newer defaults go further: a fresh [[nethermind|Nethermind]] 2.0 mainnet node fetches bodies and receipts only from block 24,600,000, [[erigon|Erigon]] 3.5 and later keeps just the last 262,144 blocks in its default full mode, and Erigon 3.6 persists no receipts on a fresh datadir, re-deriving them on request; see [[history-expiry|history expiry]] and [[receipt-retention|receipt retention]]. Distribution of old history moved to [[era-files|era1 archive files]] and the [[portal-network|Portal Network]]. Separately, [[geth|Geth]] keeps the transaction-hash index only for `--history.transactions` blocks, about 2,350,000 by default, so [[eth-get-transaction-by-hash|eth_getTransactionByHash]] returns `null` for older transactions on a node that still has their block.",
          "[[blob|Blob]] data has always been temporary. Sidecars are retained on the [[consensus-layer|consensus layer]] for 4096 epochs, roughly 18 days, after which only the versioned hashes in the [[transaction|transactions]] that carried them survive and the bytes must come from [[blob-archive|whoever archived them]].",
        ],
      },
      {
        heading: "Where old data comes from",
        paragraphs: [
          "Four sources, in rising order of trust required. Your own archive node answers everything but costs terabytes and days of sync. An archive-capable [[rpc-provider|provider]] answers the same calls for a fee and a trust assumption. An [[indexer|indexer]] or dataset — your own [[etl-pipeline|ETL dump]], [[chain-analytics|a public warehouse]], a [[block-explorer|block explorer]] API — answers query-shaped questions much faster but only for what it chose to index. Era files and the Portal Network hand you the raw blocks and leave verification to you.",
          "One subtlety catches teams building [[state-proof|proof]] systems: archive state is not the same as archive proofs. Clients that store state in flat key-value layouts can serve an old balance while being unable to rebuild that block's trie nodes, so `eth_getProof` at a deep block can fail on a node that answers `eth_getBalance` for it happily; see [[client-storage|client storage engines]].",
        ],
      },
    ],
    pitfalls: [
      "Assuming an archive endpoint answers every historical method; tracing and `eth_getProof` depth are separate capabilities that have to be probed.",
      "Planning a backfill over all history against an endpoint with a block-range limit, without first checking how far back it actually serves logs.",
      "Expecting blob contents to be retrievable months later; only the versioned hash is permanent, and the sidecar is pruned after about 18 days.",
      "Treating 'full node' as meaning it can answer historical `eth_call`; it may hold the history, but not the state those calls need.",
    ],
    related: ["archive-node", "pruned-node", "history-expiry", "indexer", "portal-network", "eth-get-logs", "client-storage", "state", "blob", "etl-pipeline", "airdrop-rewards"],
    sources: [
      { title: "EIP-4444: Bound historical data in execution clients", url: "https://eips.ethereum.org/EIPS/eip-4444" },
      { title: "Geth command-line options", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
      { title: "ethereum.org: nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "Erigon: pruning modes", url: "https://docs.erigon.tech/fundamentals/pruning-modes" },
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
          "[[internal-transaction|Internal value transfers]] are the expensive exception. They emit no [[event-log|log]], so reconstructing them needs [[trace-api|trace_block]] or [[debug-api|debug_traceBlockByNumber]] with `callTracer`, which costs orders of magnitude more per block, is unavailable on many endpoints, and requires an [[archive-node|archive node]] for old ranges.",
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
    related: ["indexer", "indexing-database", "cursor-pagination", "abi", "eth-get-block-receipts", "trace-api", "rate-limits", "historical-data", "hex-encoding", "substreams", "chain-analytics"],
    sources: [
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
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
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
      { title: "The Graph: indexing concepts", url: "https://thegraph.com/docs/" },
    ],
  },
  {
    id: "the-graph",
    title: "The Graph and subgraphs",
    category: "indexing",
    aliases: ["subgraph", "graphql", "GRT"],
    summary: "The Graph is an indexing protocol whose subgraphs declare, in a manifest plus a GraphQL schema and AssemblyScript mappings, which contract events a `graph-node` should follow and what entities to write, so applications query GraphQL instead of [[eth-get-logs|eth_getLogs]].",
    sections: [
      {
        heading: "What a subgraph is",
        paragraphs: [
          "A subgraph is three artifacts. The manifest, `subgraph.yaml`, lists data sources: a contract [[address|address]], the [[abi|ABI]], a `startBlock`, and handlers that bind an event's canonical signature to a function name. `schema.graphql` declares the entities and fields the API will expose. The mapping code, written in AssemblyScript and compiled to WebAssembly, receives each decoded [[event-log|event]] as a typed object and saves entities.",
          "`graph-node` is [[graph-node|the process that runs all of this]]. It resolves each `event:` string to a topic0 exactly as [[event-signature|event signatures]] are computed, subscribes from `startBlock`, calls your handler once per matching log in order, and stores the resulting entities so a GraphQL query can join and filter them. Handlers are deterministic: they may read chain data with an [[eth-call|eth_call]] but cannot perform arbitrary network I/O, because two indexers must derive identical results.",
        ],
      },
      {
        heading: "Where the data comes from",
        paragraphs: [
          "In the ordinary setup `graph-node` is pointed at an RPC endpoint and behaves like any other [[indexer|indexer]]: it follows the head, fetches logs and blocks, and tracks `parentHash` so it can revert entity versions when a [[reorg|reorg]] happens. Because every entity write is recorded against a block, the rollback is automatic rather than something a mapping author handles.",
          "Two handler kinds raise the requirements sharply. Call handlers fire on a contract function call and depend on the Parity-style tracing API, so they need a [[trace-api|trace-capable]] and usually [[archive-node|archive]] endpoint. Block handlers run on every block, which is the most expensive option of all. For high-throughput cases The Graph offers [[firehose|Firehose]] and [[substreams|Substreams]], which stream pre-extracted block data instead of making the node answer one query at a time.",
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
    related: ["indexer", "event-log", "event-signature", "eth-get-logs", "abi", "block-explorer", "etl-pipeline", "indexing-database", "trace-api", "graph-node", "substreams"],
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
    aliases: ["etherscan", "blockscout", "explorer api", "verified source"],
    summary: "A block explorer is a website and API over an indexed copy of the chain — Etherscan, Blockscout, Otterscan — showing [[block|blocks]], transactions, [[event-log|logs]], internal calls reconstructed from [[execution-trace|traces]], token balances, and verified contract source.",
    sections: [
      {
        heading: "What they add on top of RPC",
        paragraphs: [
          "Most of what makes an explorer useful is not available from a node in one call. [[internal-transaction|Internal transactions]] — value-moving calls made by [[smart-contract|contracts]] during execution — emit no [[event-log|log]] and have no [[transaction-receipt|receipt]], so an explorer reconstructs them by running [[trace-api|trace_block]] or [[debug-api|debug_traceBlockByNumber]] over every block and storing the results. Token balances and transfer histories are assembled from `Transfer` logs. Function and event names come from decoding [[abi|ABI]] selectors against a [[signature-directory|signature directory]].",
          "Source verification is the other half. A developer uploads sources and compiler settings, the explorer recompiles and compares the bytecode to what is deployed, and on a match it publishes the source and ABI. That ABI is then what lets the explorer, and anyone calling its API, decode calldata and events for that [[address|address]].",
        ],
      },
      {
        heading: "The three you will meet",
        paragraphs: [
          "Etherscan is the closed-source, hosted one, covering Ethereum and many other networks, with a REST API that needs an API key and enforces a low free-tier request rate. Blockscout is open source and self-hostable, runs as the default explorer for many testnets and [[rollup|rollups]], and exposes an Etherscan-compatible API alongside its own. [[otterscan|Otterscan]] is different in kind: a self-hosted front end that talks directly to an [[erigon|Erigon]] node through the `ots_` namespace, so there is no separate index to maintain and no third party in the path.",
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
    related: ["indexer", "execution-trace", "trace-api", "event-log", "erigon", "indexing-database", "eth-get-logs", "the-graph", "smart-contract", "otterscan", "proxy-contract"],
    sources: [
      { title: "ethereum.org: block explorers", url: "https://ethereum.org/developers/docs/data-and-analytics/block-explorers/" },
      { title: "Erigon documentation", url: "https://docs.erigon.tech/" },
      { title: "ethereum.org: data and analytics", url: "https://ethereum.org/developers/docs/data-and-analytics/" },
    ],
  },
  {
    id: "internal-transaction",
    title: "Internal transactions",
    category: "indexing",
    aliases: ["internal transaction", "internal transfer", "internal call", "message call", "contract-initiated transfer", "ots_getInternalOperations"],
    summary: "An internal transaction is a call or value transfer that [[smart-contract|contract]] code makes while a [[transaction|transaction]] executes; it has no hash, no [[transaction-receipt|receipt]] and, on mainnet today, no [[event-log|log]] of its own, so it becomes visible only when a node re-executes the transaction with a tracer.",
    sections: [
      {
        heading: "A call frame, not a transaction",
        paragraphs: [
          "Only an externally owned account signs a transaction. Everything the called contract does next — `CALL`, `CALLCODE`, `DELEGATECALL`, `STATICCALL`, `CREATE`, `CREATE2`, `SELFDESTRUCT` — opens a new frame inside that same transaction in the [[evm|EVM]]. The block body records none of those frames, the receipt records only the outcome of the whole transaction, and the [[state-root|state root]] records only the resulting balances. On mainnet today, a contract that pays a user 1 ether changes the user's [[eth-get-balance|balance]] while leaving nothing on chain that names the payment, unless the contract chooses to emit an event, and a plain ether transfer to an account without code emits nothing at all; EIP-7708, live on Sepolia since 6 October 2026, makes every nonzero ether transfer log a `Transfer`.",
          "‘Internal transaction’ is explorer vocabulary for a projection of an [[execution-trace|execution trace]]: usually the frames below the top level that moved ether, plus contract creations and self-destructs. A frame has no identifier of its own, only a position — `traceAddress` in the [[trace-api|trace_ namespace]], or the path through the nested `calls` arrays of [[debug-api|callTracer]] — so an internal transaction is always named by its transaction hash plus that position.",
        ],
      },
      {
        heading: "Getting them over RPC",
        paragraphs: [
          "Every method that returns them re-executes. `debug_traceTransaction` and `debug_traceBlockByNumber` with `callTracer` give a nested call tree. `trace_transaction` and `trace_block` give a flat list, and `trace_filter` with `fromAddress` or `toAddress` answers ‘every ether movement to this address’ across a block range. [[otterscan|Otterscan]]'s `ots_getInternalOperations` returns only transfers, creations and self-destructs, typed 0 to 3. Re-execution needs the state as it was before the transaction, so anything older than a [[pruned-node|pruned node]]'s recent-state window needs an [[archive-node|archive node]], and [[rpc-provider|providers]] meter tracing far above ordinary `eth_` calls.",
          "Not every balance change is an internal transaction. An [[withdrawals|EIP-4895 withdrawal]] is credited outside the EVM, so it sits in the block's `withdrawals` list and appears in no trace; neither does the priority fee credited to the block's fee recipient. Before [[the-merge|the Merge]], block and uncle rewards were similar: `trace_block` reports them as `reward` entries, while `callTracer` has no frame for them. A [[accounting-reconciliation|reconciliation]] built from transactions plus traces alone never balances for a validator's addresses.",
        ],
      },
      {
        heading: "What counts as a transfer depends on who counts",
        paragraphs: [
          "Tracers report what was attempted, not what stuck. A frame that reverted carries an `error`, but a frame that succeeded inside a parent that later reverted carries none, and its ether never moved, so a correct scanner checks every ancestor. The `value` on a frame is not always a movement either: [[geth|Geth]]'s tracer hooks give a `DELEGATECALL` frame the value inherited from its parent, so summing `value` over every frame counts that ether twice. `CALLCODE` can carry value, a creation can carry an endowment, and `SELFDESTRUCT` sends the whole balance to a beneficiary, which it still does after EIP-6780 even though the code usually stays.",
          "Tools then filter by different rules. [[erigon|Erigon]]'s and [[reth|Reth]]'s `ots_getInternalOperations` include a `CALL` only when its value is non-zero, include every `CREATE` and `CREATE2` even with no endowment, skip the top-level frame, and keep frames that an enclosing revert undid. Geth's `callTracer` includes calls to [[precompiles|precompiles]], while its `flatCallTracer`, imitating Parity output, drops them unless `includePrecompiles` is set. Two [[block-explorer|explorers]] built on different clients can therefore list different internal transactions for one transaction, each faithful to its own node.",
        ],
      },
      {
        heading: "Where it matters",
        paragraphs: [
          "[[exchange-deposits|Exchange deposit detection]] is the classic case. A user withdrawing from a smart-contract wallet, a multisig, or a DeFi position sends ether to a deposit address through an internal call: no transaction has the deposit address as its `to`, and on mainnet there is no `Transfer` log, because ether is not a token. A scanner that watches only top-level transactions misses the deposit, so exchanges trace every block, or compare balances block by block and trace the blocks where one moves unexplained, a check that misses deposits to an already deployed `CREATE2` forwarder, which passes the ether on within the same call and so never shows a balance change. Any [[indexer|indexer]] reporting ether flows faces the same choice, and in an [[etl-pipeline|ETL pipeline]] traces are the most expensive column to extract.",
        ],
      },
    ],
    example: {
      title: "Two identical inner transfers, only one of which happened",
      language: "json",
      code: "// debug_traceTransaction with {\"tracer\": \"callTracer\"} (abridged)\n{\n  \"type\": \"CALL\", \"from\": \"0xd8da…6045\", \"to\": \"0x7a25…488d\", \"value\": \"0x0\",\n  \"calls\": [\n    { \"type\": \"CALL\", \"from\": \"0x7a25…488d\", \"to\": \"0x388c…9297\",\n      \"value\": \"0x6f05b59d3b20000\" },\n    { \"type\": \"CALL\", \"from\": \"0x7a25…488d\", \"to\": \"0x5f3b…aa01\", \"value\": \"0x0\",\n      \"error\": \"execution reverted\",\n      \"calls\": [\n        { \"type\": \"CALL\", \"from\": \"0x5f3b…aa01\", \"to\": \"0x388c…9297\",\n          \"value\": \"0x6f05b59d3b20000\" }\n      ] }\n  ]\n}",
      note: "Both inner calls to `0x388c…9297` carry 0.5 ether and neither has its own `error`, but only the first moved anything: the second sits under a frame that reverted, and the outer transaction still succeeded.",
    },
    pitfalls: [
      "Counting every frame with a non-zero `value` as a transfer, which counts a `DELEGATECALL` that inherits its parent's value a second time.",
      "Checking only a frame's own `error` field; a successful inner call beneath a reverted parent moved nothing.",
      "Watching only top-level transactions to deposit addresses, which misses ether forwarded by contract wallets and multisigs.",
      "Treating withdrawals as internal transactions; they are credited outside the EVM and appear in no trace.",
      "Expecting two explorers to agree on an internal-transactions tab; each filters trace frames by its own rules.",
    ],
    related: ["execution-trace", "trace-api", "debug-api", "block-explorer", "otterscan", "withdrawals", "archive-node", "etl-pipeline", "precompiles", "event-log", "exchange-deposits"],
    sources: [
      { title: "Geth: built-in tracers", url: "https://geth.ethereum.org/docs/developers/evm-tracing/built-in-tracers" },
      { title: "Otterscan book: ots namespace spec", url: "https://github.com/otterscan/otterscan-book/blob/main/src/api-docs/ots-api.md" },
      { title: "Reth: ots namespace", url: "https://reth.rs/jsonrpc/ots" },
      { title: "EIP-4895: Beacon chain push withdrawals as operations", url: "https://eips.ethereum.org/EIPS/eip-4895" },
    ],
  },
  {
    id: "graph-node",
    title: "graph-node",
    category: "indexing",
    aliases: ["Graph Node", "graph-node", "subgraph indexer", "--ethereum-rpc", "archive,traces", "ETHEREUM_REORG_THRESHOLD"],
    summary: "`graph-node` is The Graph's open-source indexing server, written in Rust, which runs [[the-graph|subgraphs]] by reading chain data over [[json-rpc|JSON-RPC]] or a [[firehose|Firehose]] stream, executing their WebAssembly mappings, storing block-versioned entities in Postgres, and serving them over GraphQL.",
    sections: [
      {
        heading: "One process, three dependencies",
        paragraphs: [
          "A subgraph is a description; `graph-node` is what runs it. It connects to Postgres, which holds entities, deployment metadata, and a cache of blocks and [[eth-call|eth_call]] results; to IPFS, from which it fetches a deployment's manifest, schema, ABIs and compiled mappings; and to one or more chain providers. It serves GraphQL on port 8000 (HTTP) and 8001 (WebSocket), an admin JSON-RPC for deployments on 8020, indexing status on 8030, and Prometheus metrics on 8040. The same binary serves self-hosted setups and The Graph's network indexers.",
          "Work splits in two. One node, named as the `ingestor` in the configuration, follows each chain's head, polling once a second by default. Every deployed subgraph then scans forward from its `startBlock` for triggers — logs matching its event handlers, calls matching its call handlers, blocks for its block handlers — and runs the matching handlers in order inside a WebAssembly runtime that reaches the outside world only through host functions graph-node provides. That restriction is why two operators indexing the same deployment derive the same entities.",
        ],
      },
      {
        heading: "What it asks of an RPC endpoint",
        paragraphs: [
          "Event handlers drive most of the traffic: [[eth-get-logs|eth_getLogs]] over windows of up to 1,000 blocks by default (`GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE`), 500 for filters with a topic and no address, then receipts for the blocks that matched, via [[eth-get-block-receipts|eth_getBlockReceipts]] where available. A mapping that reads contract state issues eth_call pinned to the block being processed by its hash, the [[eip|EIP-1898]] form, so that a [[reorg|reorg]] at that height cannot make the call read a replacement block's state. A subgraph that makes calls while syncing old history therefore needs an [[archive-node|archive node]] for the whole range. Call handlers, and block handlers with a `call` filter, are fed by `trace_filter`, which a [[geth|Geth]] endpoint does not serve.",
          "Those needs are declared, not probed. On the command line a provider is `--ethereum-rpc NETWORK:CAPABILITIES:URL`, for example `mainnet:archive,traces:https://…`; in the TOML configuration each provider lists `features` such as `archive`, `traces`, and `no_eip1898` for endpoints that reject block-hash parameters. graph-node assigns each subgraph a provider whose declared features cover what its manifest needs, which makes the declaration a promise: an endpoint labelled `archive` that is really a [[pruned-node|pruned node]] produces failed calls deep into a sync rather than a refusal at deploy time.",
        ],
      },
      {
        heading: "Entities, time travel, and reverts",
        paragraphs: [
          "Each mutable entity type becomes a Postgres table in which every row carries a `block_range`, an `int4range` of the blocks for which that version is current. An update closes the old version's range and inserts a new row; a query at block N reads the version whose range contains N, which is how GraphQL time-travel queries with `block: { number: N }` work. Immutable entity types skip the range and store only the block that created them.",
          "The same structure makes a reorg cheap. When the ingestor finds that a new block's `parentHash` does not match the stored chain, graph-node reverts each affected deployment to the common ancestor — deleting versions created above it and reopening the ranges they closed — and indexes the new branch, so mapping authors write no rollback code; compare the hand-built version in [[indexing-database|indexing database]]. The assumption is bounded by `ETHEREUM_REORG_THRESHOLD`, 250 blocks by default, beyond which graph-node documents that subgraphs may hold inconsistent data.",
        ],
      },
      {
        heading: "RPC or Firehose",
        paragraphs: [
          "A provider can instead have `type = \"firehose\"`, and graph-node then consumes a gRPC stream of blocks already extracted by an instrumented node, call traces included, with cursors and explicit undo steps, instead of issuing eth_getLogs and trace requests. Mapping calls still need JSON-RPC; the configuration can add a provider of `type = \"web3call\"`, which serves only calls and must declare `archive`. A subgraph can also take a [[substreams|Substreams]] package as its data source, handing the transformation to that engine and keeping graph-node as the store and GraphQL server.",
          "The choice is mostly about backfill: over JSON-RPC a long history is bounded by the endpoint's range caps, [[rate-limits|rate limits]], and archive and trace availability, over Firehose by stream throughput. Either way a changed mapping is a new deployment that indexes again from `startBlock`, reusing eth_call results already cached in Postgres.",
        ],
      },
    ],
    example: {
      title: "Declaring provider capabilities, on the command line or in config.toml",
      language: "text",
      code: "# command line: capabilities sit between the network name and the URL\ngraph-node \\\n  --postgres-url postgresql://graph:secret@localhost:5432/graph-node \\\n  --ipfs 127.0.0.1:5001 \\\n  --ethereum-rpc mainnet:archive,traces:http://erigon.internal:8545\n\n# or config.toml (excerpt): several providers, each with declared features\n[chains]\ningestor = \"index_node_0\"\n\n[chains.mainnet]\nshard = \"primary\"\nprovider = [\n  { label = \"erigon-archive\", url = \"http://erigon.internal:8545\", features = [\"archive\", \"traces\"] },\n  { label = \"geth-full\",      url = \"http://geth.internal:8545\",   features = [] }\n]",
      note: "The Geth provider declares nothing, so only subgraphs that need neither historical eth_call nor call handlers are served by it; nothing checks that the Erigon node really is an archive.",
    },
    pitfalls: [
      "Declaring `archive` on a provider that is really pruned, so historical eth_call in mappings fails midway through a sync.",
      "Pointing a subgraph with call handlers at a Geth endpoint; graph-node fetches call triggers with `trace_filter`, which Geth does not implement.",
      "Putting graph-node behind a load balancer that mixes nodes at different heads, which shows up as phantom reorgs and repeated reverts; see [[head-lag|head consistency]].",
      "Assuming a Firehose provider also serves the eth_calls that mappings make; those still go to a JSON-RPC endpoint.",
    ],
    related: ["the-graph", "firehose", "substreams", "indexer", "indexing-database", "reorg", "eth-get-logs", "trace-api", "archive-node", "eth-call"],
    sources: [
      { title: "The Graph: Graph Node", url: "https://thegraph.com/docs/en/indexing/tooling/graph-node/" },
      { title: "graph-node: configuration", url: "https://github.com/graphprotocol/graph-node/blob/master/docs/config.md" },
      { title: "graph-node: environment variables", url: "https://github.com/graphprotocol/graph-node/blob/master/docs/environment-variables.md" },
      { title: "graph-node: schema generation", url: "https://github.com/graphprotocol/graph-node/blob/master/docs/implementation/schema-generation.md" },
    ],
  },
  {
    id: "firehose",
    title: "Firehose",
    category: "indexing",
    aliases: ["StreamingFast Firehose", "fireeth", "sf.firehose.v2", "merged blocks", "STEP_UNDO", "--vmtrace=firehose"],
    summary: "Firehose is StreamingFast's block-streaming system, used across [[the-graph|The Graph]], in which an instrumented node emits every block with its full execution detail into flat files and a gRPC stream that consumers resume from an opaque cursor and that reports each [[reorg|reorg]] as an explicit undo step.",
    sections: [
      {
        heading: "What plain RPC leaves to the indexer",
        paragraphs: [
          "An [[indexer|indexer]] on [[json-rpc|JSON-RPC]] rebuilds each block from several calls — the block, its receipts, and a trace that re-executes it if it wants [[internal-transaction|internal transfers]] or state changes — and detects reorgs itself by comparing `parentHash`. Nothing in the API is resumable: a dropped [[eth-subscribe|subscription]] loses what arrived meanwhile, and [[eth-get-logs|eth_getLogs]] never reports a log it has withdrawn. Firehose turns this around. It captures everything once, while the node executes the block, and serves the result as an ordered stream positioned by a cursor.",
          "The capture happens inside the client. StreamingFast maintains patched builds of [[geth|Geth]] and Geth-derived chains, and forks of [[reth|Reth]], that run a Firehose tracer during block processing; the Geth build is started with `--vmtrace=firehose` and writes a `FIRE INIT` line and then one `FIRE BLOCK` line per block to standard output. It rests on the live-tracing hooks Geth added in v1.14 — `OnBlockStart`, `OnTxStart`, `OnEnter`, `OnBalanceChange` and the rest — which let a tracer compiled into the binary observe execution as the node syncs. Upstream Geth ships the hooks but not the Firehose tracer, so a stock binary cannot feed a Firehose; see [[client-extensions|client extensions]].",
        ],
      },
      {
        heading: "Components and files",
        paragraphs: [
          "The reader wraps the instrumented node, parses its output, and writes a one-block file per block, keeping every fork it sees. The merger bundles them into merged-block files of 100 blocks on object storage — local disk, S3, Google Cloud Storage, Azure, or anything S3-compatible — and those files are the historical archive. The relayer fans live blocks out from one or more readers. The Firehose gRPC server answers a `Blocks` request from merged files for history, one-block files near the head, and the relayer for live blocks, and the client sees one continuous stream.",
          "An Ethereum block at the extended detail level carries what RPC spreads over three namespaces: header, transactions, receipts and logs, every call frame with its input and output, and per-call balance, nonce, code, storage and gas changes, each balance change tagged with a reason such as `REASON_GAS_BUY` or `REASON_REWARD_TRANSACTION_FEE`. The base level holds only what the standard JSON-RPC exposes, which is all a network without an instrumented client can offer.",
        ],
      },
      {
        heading: "Cursors and fork steps",
        paragraphs: [
          "Every response carries a block, a `step` and a `cursor`. The default stream sends `STEP_NEW` for a block joining the chain and `STEP_UNDO` for a block a reorg removed, with metadata giving `lib_num`, the last irreversible block at that moment; a request with `final_blocks_only` receives only `STEP_FINAL` blocks and never an undo, at the cost of trailing the head by the time [[finality|finality]] takes. The cursor is opaque but records the block, its branch and the last irreversible block, so passing it back resumes immediately after the last message received. Forked blocks are kept, so a consumer that disconnected while on a block that has since been orphaned receives the undo for it when it reconnects.",
          "The consumer's side shrinks to one rule: store the cursor in the same database transaction as the rows derived from that block, and on an undo delete what the undone block produced. That is the model an RPC indexer approximates with a [[cursor-pagination|durable cursor]] and `parentHash` checks, delivered by the stream instead. [[graph-node|graph-node]] accepts a Firehose endpoint as a provider, and [[substreams|Substreams]] runs its modules over the same blocks.",
        ],
      },
    ],
    example: {
      title: "A reorg as the stream reports it, and the resume",
      language: "text",
      code: "# sf.firehose.v2.Stream/Blocks { start_block_num: 19746586 } (responses abridged)\nstep: STEP_NEW   block: 19746586 0x9b83…ee71  lib_num: 19746522  cursor: c1\nstep: STEP_NEW   block: 19746587 0x4c1d…07a2  lib_num: 19746522  cursor: c2\nstep: STEP_UNDO  block: 19746587 0x4c1d…07a2  lib_num: 19746522  cursor: c3\nstep: STEP_NEW   block: 19746587 0xe290…5b1f  lib_num: 19746522  cursor: c4\n\n# after a restart, continue exactly after the last message applied\nsf.firehose.v2.Stream/Blocks { cursor: c4 }",
      note: "The undo names the orphaned block by hash, so the consumer deletes its rows and then applies the replacement at the same height; persisting `c4` with those writes is what makes the restart exact.",
    },
    pitfalls: [
      "Expecting a stock Geth or Reth binary to feed a Firehose reader; the tracer lives in StreamingFast's builds, not upstream.",
      "Committing the cursor separately from the rows it covers, so a restart either skips a block or applies it twice.",
      "Ignoring `STEP_UNDO` when streaming near the head, which leaves rows from orphaned blocks in the database.",
      "Expecting call frames or state changes in a base-detail block; only the extended level carries them.",
    ],
    related: ["substreams", "graph-node", "the-graph", "indexer", "reorg", "cursor-pagination", "client-extensions", "execution-trace", "geth", "reth"],
    sources: [
      { title: "Firehose: the Firehose component", url: "https://firehose.streamingfast.io/firehose/architecture/components/firehose" },
      { title: "sf.firehose.v2 protocol definition", url: "https://github.com/streamingfast/proto/blob/develop/sf/firehose/v2/firehose.proto" },
      { title: "Geth: live tracing", url: "https://geth.ethereum.org/docs/developers/evm-tracing/live-tracing" },
      { title: "streamingfast/firehose-ethereum", url: "https://github.com/streamingfast/firehose-ethereum" },
    ],
  },
  {
    id: "substreams",
    title: "Substreams",
    category: "indexing",
    aliases: ["substreams.yaml", ".spkg", "map module", "store module", "substreams sink", "Substreams-powered subgraph"],
    summary: "Substreams is a [[firehose|Firehose]]-based engine that runs user-written Rust modules, compiled to WebAssembly, over every block of a chain — in parallel for history and as a live stream at the head — and delivers their output with cursors and undo signals to a sink such as Postgres, ClickHouse, or a subgraph.",
    sections: [
      {
        heading: "Modules and packages",
        paragraphs: [
          "A Substreams package, an `.spkg` file, bundles a `substreams.yaml` manifest, protobuf schemas, and a WASM binary holding the module handlers. A `map` module is a function from its inputs to a protobuf output — typically from an `sf.ethereum.type.v2.Block` to a list of decoded transfers or swaps. A `store` module keeps key-value state across blocks under one update policy: `set`, `set_if_not_exists`, `add`, `min`, `max`, `append`, or `set_sum`. Downstream modules read a store in get mode, as its value at the block being processed, or in deltas mode, as the changes it made in that block, and all modules run as a DAG once per block.",
          "The constraints are what make the rest possible. A module sees only its declared inputs and may not read a store it is writing, so given the same blocks it produces the same output. A `blockIndex` module adds a cheap pre-pass: it emits labels per block, such as `evt_addr:` and `evt_sig:` keys for the [[event-log|logs]] the block contains, and downstream modules filter on them to skip blocks without decoding them, the job a [[logs-bloom|logs bloom]] does for a node answering log queries.",
        ],
      },
      {
        heading: "Parallel backfill and caching",
        paragraphs: [
          "Because a module's output depends only on its inputs, history can be split. The server cuts the requested range into segments — 25,000 blocks by default on StreamingFast's servers — and runs them on many workers at once. A store is built per segment and the partial stores are merged into one linear view, so its value at block N is right even though block N − 1 was processed on another worker. Outputs are cached under a module hash computed from the WASM code, inputs, outputs and parameters: rerunning an unchanged module, or adding a new module downstream of one, streams cached output instead of recomputing it, while a code change invalidates that module and everything below it.",
          "The contrast with polling is the point. An [[eth-get-logs|eth_getLogs]] backfill is limited by the endpoint's range caps and [[rate-limits|rate limits]] and sees only logs; a [[the-graph|subgraph]] on RPC processes blocks strictly in order in one process. Substreams sees calls and state changes as well, and scales by adding workers. The price is writing Rust against protobuf types instead of an ABI and an AssemblyScript mapping, and depending on a Firehose provider. Forward parallel execution runs only in production mode; development mode is closer to linear.",
        ],
      },
      {
        heading: "Sinks",
        paragraphs: [
          "A consumer streams a module's output with a cursor exactly as with Firehose: output per block, an undo signal when a block is orphaned, and an option to take only final blocks. The SQL sink, `substreams sink postgres` or `substreams sink clickhouse`, applies a module's database changes, keeps its cursor in a table in the target database, and in Postgres logs every insert, update and delete in the reversible part of the chain to a `substreams_history` table, so an undo can invert them in reverse order. ClickHouse handles reorgs with a delay, and every table needs a primary key for either to work; compare the hand-built approach in [[indexing-database|indexing database]].",
          "A subgraph can name a package as its data source, and [[graph-node|graph-node]] then consumes a module that produces entity changes instead of running event handlers against RPC; this is the Substreams-powered subgraph, and it is where The Graph reports its largest sync-time reductions. The division of labour is then clean: Substreams transforms, the sink or graph-node stores and serves, and nothing in the path polls an [[rpc-provider|RPC provider]] for logs. It sits where an [[etl-pipeline|ETL pipeline]]'s transform stage would, with the reorg handling built in.",
        ],
      },
    ],
    example: {
      title: "A manifest with a map, a store fed by it, and a database output",
      language: "yaml",
      code: "specVersion: v0.1.0\npackage:\n  name: usdc_transfers\n  version: v0.1.0\n\nprotobuf:\n  files: [transfers.proto]\n  importPaths: [./proto]\n\nbinaries:\n  default:\n    type: wasm/rust-v1\n    file: ./target/wasm32-unknown-unknown/release/usdc_transfers.wasm\n\nmodules:\n  - name: map_transfers\n    kind: map\n    initialBlock: 6082465\n    inputs:\n      - source: sf.ethereum.type.v2.Block\n    output:\n      type: proto:usdc.v1.Transfers\n\n  - name: store_balances\n    kind: store\n    updatePolicy: add\n    valueType: bigint\n    inputs:\n      - map: map_transfers\n\n  - name: db_out\n    kind: map\n    inputs:\n      - map: map_transfers\n      - store: store_balances\n        mode: deltas\n    output:\n      type: proto:sf.substreams.sink.database.v1.DatabaseChanges",
      note: "`store_balances` sums per key across blocks, and `db_out` reads its per-block deltas rather than its values; editing `map_transfers` changes its module hash and invalidates the cache of all three.",
    },
    pitfalls: [
      "Committing sink rows and the cursor in separate transactions, so a restart replays or skips a block's output.",
      "Defining SQL sink tables without primary keys, which leaves the sink unable to undo rows from orphaned blocks.",
      "Timing a backfill in development mode and expecting production to match; forward parallel execution only runs in production mode.",
      "Editing a module and expecting its cache to survive; the module hash changes, and it and everything downstream recompute.",
    ],
    related: ["firehose", "graph-node", "the-graph", "etl-pipeline", "indexing-database", "eth-get-logs", "indexer", "reorg", "cursor-pagination"],
    sources: [
      { title: "Substreams: module types", url: "https://docs.substreams.dev/reference-material/manifest-and-components/types" },
      { title: "Substreams: architecture", url: "https://docs.substreams.dev/reference-material/core-concepts/architecture" },
      { title: "Substreams: module caching", url: "https://docs.substreams.dev/reference-material/core-concepts/module-caching" },
      { title: "Substreams SQL: reorg handling", url: "https://docs.substreams.dev/reference-material/sql/sql/reorg-handling" },
    ],
  },
  {
    id: "log-index",
    title: "Log index",
    category: "indexing",
    aliases: ["log search index", "filtermaps", "bloombits", "--history.logs", "LogIndex.Enabled", "EIP-7745", "logaddrs"],
    summary: "A log index is a structure an [[execution-client|execution client]] builds over the addresses and topics of every [[event-log|log]] so that [[eth-get-logs|eth_getLogs]] can find matching blocks without testing each header's 2048-bit [[logs-bloom|logs bloom]]; every client builds its own, with its own build time and retention window.",
    sections: [
      {
        heading: "Why the header bloom is not enough",
        paragraphs: [
          "The protocol provides one filter per block. Answering a query over a million blocks from blooms alone means reading a million [[block-header|headers]], testing each bloom, and loading the receipts of every block that might match. Busy blocks set most of their 2048 bits, so for common addresses and topics nearly every block matches and the bloom saves little. A log index answers the question the other way round, from a value to the blocks or transactions that contain it, and turns a range scan into a lookup.",
          "None of it is consensus data. An index is derived locally from receipts, nothing in the header commits to it, and two clients can index differently while returning identical answers. EIP-7745 proposes replacing the header bloom with the root of a committed log index built from filter maps, which would also let a server prove a query's answer, but it is a Draft. [[reth|Reth]] still answers from blooms: it reads headers in windows of 1,000, tests each, and fetches receipts for the candidates, bounded by `--rpc.max-blocks-per-filter` (100,000 by default) and `--rpc.max-logs-per-response` (20,000).",
        ],
      },
      {
        heading: "What each client builds",
        paragraphs: [
          "[[geth|Geth]] long kept a bloombits index, the header blooms transposed into per-bit vectors over sections of 4,096 blocks. v1.15.6 replaced it with filter maps, the structure EIP-7745 describes, whose query cost no longer rises with the density of logs per block. The index covers the most recent `--history.logs` blocks, 2,350,000 by default, about a year and roughly 10 GB on mainnet; `--history.logs=0` indexes the whole chain, about 61 GB, and `--history.logs.disable` turns it off. The indexer renders the head first, extends backwards to the configured depth, and drops old epochs as the chain advances.",
          "[[erigon|Erigon]] keeps inverted indexes, `logaddrs` and `logtopics`, mapping each emitting address and each topic to the transaction numbers where it appears, alongside `tracesfrom` and `tracesto` for call traces; in Erigon 3 these ship inside the snapshot files a new node downloads. [[nethermind|Nethermind]] added an opt-in log index in 1.37, enabled with `--LogIndex.Enabled true` and built in the background from stored receipts. Without it, Nethermind limits how many blocks one request may read sequentially, `Receipt.MaxBlockDepth`, and rejects wider requests with `-32602`.",
        ],
      },
      {
        heading: "Build time, retention, and what callers see",
        paragraphs: [
          "An index is a second job after sync, so a node reporting [[eth-syncing|eth_syncing]] `false` can still be building it. A query over blocks the index does not yet cover falls back to the slow path: Geth performs an unindexed search, block by block against header blooms, which over a wide range runs into the caller's or the [[rpc-provider|provider]]'s timeout; Nethermind refuses the range outright. Erigon avoids most of this because the index arrives with the downloaded history. Geth's indexer also disables itself if it meets a missing receipt, so a damaged database shows up as slow queries rather than errors.",
          "The same slow path applies permanently to blocks older than the index window, which is configured separately from [[receipt-retention|receipt retention]] and from [[history-expiry|history expiry]]: a default Geth holds receipts for years of blocks it no longer indexes, and a Geth [[archive-node|archive node]] still indexes only a year unless `--history.logs` says otherwise. Range performance is therefore a property of one node's index state. Two nodes on the same client and version can answer the same wide query in milliseconds and in minutes, and no RPC method reports which blocks are indexed; probing is the only check, as with every [[endpoint-capabilities|endpoint capability]].",
        ],
      },
    ],
    example: {
      title: "The log-search knob is different on each client",
      language: "bash",
      code: "# Geth: index logs for the whole chain instead of the most recent 2,350,000 blocks\ngeth --mainnet --history.logs 0\n\n# Nethermind: opt into its log index; without it, wide ranges hit Receipt.MaxBlockDepth\nnethermind --config mainnet --LogIndex.Enabled true\n\n# Reth: no separate index; the per-request scan budget is the setting (defaults shown)\nreth node --rpc.max-blocks-per-filter 100000 --rpc.max-logs-per-response 20000",
      note: "Each line changes something different: Geth's retention window, whether Nethermind builds an index at all, and how many blocks Reth will scan for one request.",
    },
    pitfalls: [
      "Pointing a backfill at a freshly synced node and reading its slow or failing wide eth_getLogs as a client bug; the log index is still being built.",
      "Assuming Geth's `--history.transactions` also governs log search; the log index has its own `--history.logs` window.",
      "Expecting an archive node to index logs back to genesis; retention of state, receipts and the log index are separate settings.",
      "Carrying one range width across clients; Reth caps blocks per filter, Nethermind caps blocks read without its index, and Geth falls back to a slow unindexed search.",
    ],
    related: ["eth-get-logs", "logs-bloom", "event-log", "geth", "erigon", "nethermind", "reth", "receipt-retention", "history-expiry", "endpoint-capabilities"],
    sources: [
      { title: "Geth v1.15.6 release notes: filtermaps log index", url: "https://github.com/ethereum/go-ethereum/releases/tag/v1.15.6" },
      { title: "Geth command-line options", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
      { title: "EIP-7745: Trustless log and transaction index", url: "https://eips.ethereum.org/EIPS/eip-7745" },
      { title: "Nethermind 1.37.0 release notes", url: "https://github.com/NethermindEth/nethermind/releases/tag/1.37.0" },
    ],
  },
  {
    id: "block-by-timestamp",
    title: "Block by timestamp",
    category: "indexing",
    aliases: ["block at time", "timestamp to block", "getblocknobytime", "erigon_getBlockByTimestamp", "slot to block", "date to block"],
    summary: "Finding the block for a wall-clock time has no standard [[json-rpc|JSON-RPC]] method, so callers binary-search [[eth-get-block-by-number|eth_getBlockByNumber]] on the header's `timestamp`, or on Ethereum use slot arithmetic and the [[beacon-api|Beacon API]], and must choose between the last block at or before that time and the first block at or after it.",
    sections: [
      {
        heading: "A search, not a lookup",
        paragraphs: [
          "A [[block-header|header]] carries `timestamp`, in seconds since the Unix epoch, and the [[execution-apis|execution APIs]] look blocks up by number or [[block-hash|hash]] only. Timestamps strictly increase from parent to child, so number-to-time is monotonic and a binary search works: take the head's number as the upper bound, then bisect with `eth_getBlockByNumber(n, false)` until two adjacent blocks bracket the target. For the whole of mainnet's history that is about 25 sequential requests, each small because transaction bodies are not needed.",
          "The answer depends on a convention the question rarely states. ‘The block at time T’ can mean the last block with `timestamp <= T`, the state as it stood at T, which is what a balance snapshot needs; or the first block with `timestamp >= T`, the first block that could hold activity after T. Etherscan's `getblocknobytime` makes the caller choose with `closest=before` or `closest=after`; [[erigon|Erigon]]'s `erigon_getBlockByTimestamp` returns the first block at or after T, and the head for a T in the future. An off-by-one here silently includes or excludes a whole block of activity.",
        ],
      },
      {
        heading: "Slots after the Merge",
        paragraphs: [
          "Since [[the-merge|the Merge]] mainnet has a clock. Slot s starts at `genesis_time + 12 × s`, where the beacon chain's `genesis_time` is 1606824023, and a block proposed in slot s carries exactly that start time as its timestamp: the Merge block 15537394, in slot 4700013, has timestamp 1663224179, which is 1606824023 + 12 × 4700013. The slot for a time T is therefore `floor((T − genesis_time) / 12)`, with no search at all; see [[slot-epoch|slots and epochs]].",
          "The block number is another matter, because not every slot has a block. A missed slot, where the proposer was offline or its block was orphaned, advances time but not the block number, so no arithmetic maps time to number, and ‘12 seconds per block’ drifts by one block for every missed slot since the reference point. The Beacon API closes the gap: `GET /eth/v2/beacon/blocks/{slot}` returns the block for that slot, including `execution_payload.block_number`, or 404 if the slot is empty, in which case the last block at or before T is in an earlier slot; see [[beacon-endpoints|Beacon API endpoints]].",
        ],
      },
      {
        heading: "Other chains, shortcuts, and who depends on it",
        paragraphs: [
          "Slot arithmetic is mainnet-specific. On an [[l2-rpc|L2]] the [[sequencer|sequencer]] sets block times — two seconds by default on OP Stack chains — and on Arbitrum consecutive blocks can share a timestamp, so ‘the block at T’ is a range and the convention must say which end. Before the Merge, and on chains without a slot schedule, only the binary search is reliable. Shortcuts exist but are not portable: explorer endpoints and client-specific methods each carry their own convention, keys and rate limits, while an [[indexer|indexer]] whose blocks table is indexed on timestamp answers in one query; see [[indexing-database|indexing database]].",
          "Several products rest on this mapping. [[governance-voting-power|Governance snapshots]] take voting power at the block before a proposal opens; streaming-payment and [[erc-4626|interest accrual]] convert the seconds between two timestamps into a block range; [[airdrop-rewards|reward eligibility and airdrop cut-offs]] decide who is in by the block at a deadline. Each result changes if the chosen block moves by one, so the convention belongs in the product's specification, and the resolved block number is worth storing with the result rather than recomputing it later.",
        ],
      },
    ],
    example: {
      title: "The last block at or before a Unix time, by bisection",
      language: "js",
      code: "// returns the number of the last block with timestamp <= t (t in seconds, as a BigInt)\nasync function blockAtOrBefore(rpc, t) {\n  const head = await rpc(\"eth_getBlockByNumber\", [\"latest\", false]);\n  let lo = 0n, hi = BigInt(head.number);\n  if (BigInt(head.timestamp) <= t) return hi;\n  while (lo < hi) {\n    const mid = (lo + hi + 1n) / 2n;               // round up so lo can advance\n    const b = await rpc(\"eth_getBlockByNumber\", [\"0x\" + mid.toString(16), false]);\n    if (BigInt(b.timestamp) <= t) lo = mid; else hi = mid - 1n;\n  }\n  return lo;  // first at or after t is lo when its timestamp equals t, otherwise lo + 1\n}",
      note: "Mainnet's genesis block has timestamp 0, so block 0 is always a valid lower bound; on another chain, check the lower bound before trusting the result.",
    },
    pitfalls: [
      "Using the first block at or after T when the question is the state at T, which counts one block of activity from after the cut-off.",
      "Converting elapsed time to a block number at 12 seconds per block, which drifts by every missed slot since the reference point.",
      "Applying mainnet slot arithmetic on an L2, where block times differ and several blocks can share one timestamp.",
      "Depending on an explorer's timestamp endpoint in automated flows; its convention, keys and availability are not part of any spec.",
    ],
    related: ["eth-get-block-by-number", "block-header", "slot-epoch", "beacon-api", "beacon-endpoints", "the-merge", "l2-rpc", "indexing-database", "erigon", "governance-voting-power", "airdrop-rewards"],
    sources: [
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "Beacon APIs: get block (block.v2.yaml)", url: "https://github.com/ethereum/beacon-APIs/blob/master/apis/beacon/blocks/block.v2.yaml" },
      { title: "Etherscan API: get block number by timestamp", url: "https://docs.etherscan.io/api-reference/endpoint/getblocknobytime" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
    ],
  },
  {
    id: "otterscan",
    title: "Otterscan",
    category: "indexing",
    aliases: ["ots_ namespace", "ots_searchTransactionsBefore", "ots_getApiLevel", "local block explorer", "Otterscan API", "ots2"],
    summary: "Otterscan is an open-source [[block-explorer|block explorer]] that runs as a static web app in the user's browser and reads a node's [[json-rpc|JSON-RPC]] directly, using the `ots_` [[namespaces|namespace]] the node implements, so it needs no separate [[indexer|indexer]] or database.",
    sections: [
      {
        heading: "An explorer without an indexer",
        paragraphs: [
          "Etherscan and Blockscout copy the chain into their own databases. Otterscan does not: it is a React application served as static files, and every page is a handful of RPC calls issued from the reader's browser to the configured node — by default `http://127.0.0.1:8545`, overridable with `ERIGON_URL` in the Docker image. The node must therefore be reachable from each reader's browser and must answer [[cors|CORS]] preflights, which on Erigon is `--http.corsdomain`. Optional pieces are a [[beacon-api|Beacon API]] URL for consensus pages and an assets server with token icons and the ethereum-lists 4bytes data it uses to name selectors; verified sources come from Sourcify.",
          "What makes this possible is doing the indexing inside the node. Standard JSON-RPC has no [[address-history|address history]], so an explorer's hardest page, every transaction touching an address, would otherwise need a separate indexer. Otterscan's authors added methods to [[erigon|Erigon]] that answer from Erigon's own history indexes, and Erigon remains the reference implementation: the documented setup is `--http.api eth,erigon,trace,ots`, with `trace` used for state diffs and `erigon_getHeaderByNumber` called outside the `ots_` namespace.",
        ],
      },
      {
        heading: "The ots_ methods",
        paragraphs: [
          "`ots_getApiLevel` returns an integer that Otterscan checks on connect; current releases expect 8. `ots_searchTransactionsBefore` and `ots_searchTransactionsAfter` page through an address's history — inbound, outbound and internal, meaning any transaction whose call tree sends ether to the address or calls it — taking an address, a block number (0 meaning newest or genesis) and a page size, and returning `txs`, `receipts`, `firstPage` and `lastPage`. A page can exceed the requested size, because results are cut only at block boundaries.",
          "`ots_getInternalOperations` lists [[internal-transaction|internal]] transfers, creations and self-destructs; `ots_traceTransaction` returns a compact call tree; `ots_getTransactionError` returns raw revert bytes for [[abi|ABI]] decoding; `ots_getContractCreator` returns the creating transaction and the direct creator; `ots_getTransactionBySenderAndNonce` finds a hash from sender and [[nonce|nonce]]; and `ots_getBlockDetails`, `ots_getBlockTransactions` and `ots_hasCode` are slimmed versions of standard calls.",
          "Implementations differ where it matters. Erigon serves the whole namespace, with the searches backed by its `tracesfrom` and `tracesto` indexes. [[reth|Reth]] registers every method and reports level 8, but its two search methods return `-32603` `unimplemented`, so address history does not work against it. Foundry's Anvil implements all of them for a [[local-devnet|local devnet]], its searches scanning only blocks it mined itself. [[geth|Geth]] and [[nethermind|Nethermind]] implement none. An API level is a claim, not a guarantee; see [[client-namespaces|client-specific namespaces]].",
        ],
      },
      {
        heading: "Where it fits",
        paragraphs: [
          "Otterscan suits an operator who already runs an archive Erigon: a private explorer with no third party seeing the queries and nothing extra to sync, and a quick one for devnets. The cost moves into the node. Searches over very busy addresses, traces and contract-creator lookups run on the node's CPU, and exposing the node to browsers means exposing `ots_` and `trace_` to whoever can load the page unless a [[reverse-proxy|reverse proxy]] limits them; see [[security|RPC security]]. It also does less than a hosted explorer: no holder tables, labels or analytics, and an experimental `ots2` namespace for extra indexers that needed a special Erigon 2 branch and is deprecated pending Erigon 3 support.",
        ],
      },
    ],
    pitfalls: [
      "Pointing Otterscan at a Reth node and expecting address history; Reth's `ots_` search methods return `unimplemented`.",
      "Configuring the node URL as `127.0.0.1` for remote users; the reader's browser, not the server hosting Otterscan, makes the RPC calls.",
      "Forgetting `--http.corsdomain`, which leaves the app loading while the browser blocks every RPC call it makes.",
      "Reading `ots_getApiLevel` as proof of full support; a node can report level 8 while leaving methods unimplemented.",
      "Exposing an archive node with `ots` and `trace` enabled to the internet so that a public Otterscan can use it.",
    ],
    related: ["block-explorer", "erigon", "reth", "internal-transaction", "client-namespaces", "archive-node", "cors", "trace-api", "local-devnet", "signature-directory", "address-history"],
    sources: [
      { title: "otterscan/otterscan", url: "https://github.com/otterscan/otterscan" },
      { title: "Otterscan book: ots namespace spec", url: "https://github.com/otterscan/otterscan-book/blob/main/src/api-docs/ots-api.md" },
      { title: "Reth: ots namespace", url: "https://reth.rs/jsonrpc/ots" },
      { title: "Anvil: Otterscan API implementation", url: "https://github.com/foundry-rs/foundry/blob/master/crates/anvil/src/eth/otterscan/api.rs" },
    ],
  },
  {
    id: "signature-directory",
    title: "Signature directories",
    category: "indexing",
    aliases: ["4byte", "4byte.directory", "selector lookup", "selector collision", "openchain signatures", "Sourcify signature database", "topic0 lookup"],
    summary: "A signature directory is a public database mapping four-byte function and error selectors and 32-byte event topics back to the human-readable signatures that hash to them, which explorers and tools use to decode calldata and logs when no verified [[abi|ABI]] is available.",
    sections: [
      {
        heading: "What is being looked up",
        paragraphs: [
          "A function selector is the first four bytes of the [[keccak-256|keccak-256]] hash of the canonical signature — `transfer(address,uint256)` gives `0xa9059cbb` — and custom errors use the same construction. An event's `topic0` keeps all 32 bytes: `Transfer(address,address,uint256)` gives `0xddf252ad…b3ef`; see [[event-signature|event signatures]]. A hash is one-way, so the only way back from bytes to a name is to have seen the string before. A directory collects strings from verified sources, compiler output, user submissions and brute force, stores their hashes, and answers lookups.",
          "Three are in common use. 4byte.directory, the original, has a REST API at `/api/v1/signatures/` and `/api/v1/event-signatures/` taking a `hex_signature` parameter, and about 1.5 million function signatures. The openchain.xyz database, which Sourcify took over along with its domain, now runs as Sourcify's signature database at `api.4byte.sourcify.dev`, seeded from openchain, 4byte.directory and Sourcify's verified contracts, and it adds the signatures of every newly verified contract automatically. The ethereum-lists 4bytes repository is a static dump that tools bundle offline. Etherface, once a fourth, is no longer reachable.",
        ],
      },
      {
        heading: "Collisions and ambiguous decodes",
        paragraphs: [
          "Four bytes is 2^32 values, and with millions of known signatures collisions are certain: Sourcify counted about 2,800 selectors with more than one signature in its database in 2025. Many are manufactured. 4byte.directory lists six signatures for `0xa9059cbb`, among them `many_msg_babbage(bytes1)` and `workMyDirefulOwner(uint256,uint256)`, strings brute-forced to share the most common selector there is. Ranking candidates by age or popularity is a heuristic, and Sourcify's API can filter out entries it has identified as spam.",
          "A decoder can check that the calldata parses under a candidate's parameter types, which eliminates some, but not reliably: `transfer(address,uint256)` and `workMyDirefulOwner(uint256,uint256)` both accept the same 68 bytes. Events are safer, since a 32-byte collision is not practical, but a directory entry carries no `indexed` markers, so the split between topics and `data` has to be inferred from the number of topics. That is also the only thing separating an ERC-20 and an ERC-721 `Transfer`, which share topic0; see [[token-standards|token standards]].",
        ],
      },
      {
        heading: "How explorers decide",
        paragraphs: [
          "A [[block-explorer|block explorer]] first uses the verified ABI of the contract being called — from Etherscan's or Sourcify's verification, which recompiles the source and compares bytecode — because that is the contract's own interface and names the function exactly. Behind a [[proxy-contract|proxy]] that means the implementation's ABI, not the proxy's. Without one it falls back to directories: Blockscout's sig-provider service queries 4byte.directory, openchain and its own bytecode database, [[otterscan|Otterscan]] bundles the ethereum-lists data, and Geth's `4byteTracer` collects the selectors seen during a trace as input to exactly this kind of lookup; see [[debug-api|debug_ namespace]].",
          "Whatever the source, a selector only means what the contract's dispatcher says it means, and a contract with a fallback function runs code for any four bytes. The robust presentation treats a directory decode as a guess, shows the raw selector beside it, and switches to the verified ABI whenever one exists. That matters most where a human approves the call, such as a wallet's signing screen, because a directory name for an unverified contract is a label anyone could have submitted.",
        ],
      },
    ],
    example: {
      title: "One selector, many names; one topic, one name",
      language: "bash",
      code: "# function selector: several signatures share 0xa9059cbb (newest first)\ncurl -s 'https://www.4byte.directory/api/v1/signatures/?hex_signature=0xa9059cbb'\n# {\"count\":6,\"results\":[\n#   {\"text_signature\":\"workMyDirefulOwner(uint256,uint256)\", ...},\n#   {\"text_signature\":\"join_tg_invmru_haha_fd06787(address,bool)\", ...},\n#   {\"text_signature\":\"func_2093253501(bytes)\", ...},\n#   {\"text_signature\":\"transfer(bytes4[9],bytes5[6],int48[11])\", ...},\n#   {\"text_signature\":\"many_msg_babbage(bytes1)\", ...},\n#   {\"text_signature\":\"transfer(address,uint256)\",\"created_at\":\"2016-07-09T...\", ...}]}\n\n# event topic0: 32 bytes, a single entry\ncurl -s 'https://www.4byte.directory/api/v1/event-signatures/?hex_signature=0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'\n# {\"count\":1,\"results\":[{\"text_signature\":\"Transfer(address,address,uint256)\", ...}]}",
      note: "The genuine `transfer` is the oldest entry and comes last in the default ordering; nothing in the response says which signature the contract behind a given call implements.",
    },
    pitfalls: [
      "Showing the newest or most popular directory match as the function name, when collisions mean several signatures share that selector.",
      "Hashing a signature with parameter names or `uint` and concluding the directory lacks it; lookups are by the canonical form.",
      "Decoding a proxy's calldata with the proxy's verified ABI instead of the implementation's.",
      "Assuming a directory decode of an event knows which parameters are indexed; the entry is only the signature string.",
      "Treating a selector match as evidence of what code ran; the contract's dispatcher decides that.",
    ],
    related: ["abi", "event-signature", "keccak-256", "block-explorer", "otterscan", "proxy-contract", "token-standards", "event-log", "debug-api"],
    sources: [
      { title: "Solidity: contract ABI specification", url: "https://docs.soliditylang.org/en/latest/abi-spec.html" },
      { title: "4byte.directory API documentation", url: "https://www.4byte.directory/docs/" },
      { title: "Sourcify: signature database", url: "https://docs.sourcify.dev/docs/repository/signature-database/" },
      { title: "Sourcify: analyzing 4byte selector collisions", url: "https://docs.sourcify.dev/blog/signatures-analysis/" },
    ],
  },
  {
    id: "exchange-deposits",
    title: "Exchange deposit and withdrawal pipelines",
    category: "indexing",
    aliases: ["deposit address", "deposit sweeping", "hot wallet", "CREATE2 forwarder", "deposit crediting", "withdrawal batching", "custody pipeline"],
    summary: "An exchange deposit and withdrawal pipeline is the system a centralised exchange or custodian runs to give each customer a deposit [[address|address]], credit what arrives there exactly once and only when it can no longer be reversed, sweep the funds into pooled wallets, and pay withdrawals from an online hot wallet, on every chain it lists.",
    sections: [
      {
        heading: "One address per customer, then a sweep",
        paragraphs: [
          "An Ethereum transfer carries no memo or reference field, so an exchange gives each customer an address of their own. The simplest design derives one key-held [[account|account]], an externally owned account or EOA, per customer from a master key, along a path such as `m/44'/60'/0'/0/4471` for customer 4471, and later sweeps it, moving the balance into a pooled wallet. Sweeping ether is one transaction, its [[gas|gas]] paid from the deposit; a token needs two, because the address first needs ether for gas, and a little is stranded each time.",
          "The other design hands out contract addresses and deploys each contract only at its first sweep: the `CREATE2` instruction fixes the address in advance from the deploying factory contract, a salt and the code. In BitGo's open-source `ForwarderV4`, the `receive` function, which runs when ether arrives, calls `flush`, which forwards the whole balance to `parentAddress` and emits `ForwarderDeposited`; tokens wait for `flushTokens(tokenContractAddress)`. A deployed forwarder's balance therefore never shows a deposit, and since every ether deposit runs code, a sender using a plain transfer's fixed 21,000 gas limit runs out of gas.",
        ],
      },
      {
        heading: "Detecting what arrived",
        paragraphs: [
          "Each block is checked three ways. A token deposit is a `Transfer` [[event-log|log]] emitted by the token contract, whose `topics[2]`, the recipient, is a deposit address; [[eth-get-block-receipts|eth_getBlockReceipts]] or [[eth-get-logs|eth_getLogs]] returns it. Ether from an EOA is a top-level [[transaction|transaction]] to the address whose [[transaction-receipt|receipt]] has `status` `0x1`. Ether from a contract, such as a Safe multisig, is an [[internal-transaction|internal transfer]] that no transaction or log names; only an [[execution-trace|execution trace]], the node's replay of every call, shows it, through [[trace-api|trace_block]] or [[debug-api|debug_traceBlockByNumber]].",
          "Known incidents come from crediting the wrong evidence. Any contract can emit a `Transfer` naming a deposit address and answer `USDT` from `symbol()`, so only logs whose `address` is a listed token contract count. ERC-20 lets a failing `transfer` return `false` instead of [[revert|reverting]], so decoding `transfer(to, amount)` from the transaction's input and checking only the receipt's `status` can credit tokens that never moved. In 2024 the security firm Hexagate reported attempts on several exchanges with a contract whose transaction succeeds while the inner call sending the deposit reverts and is caught. In the trace, the frame paying the deposit address shows no error; only its parent does.",
        ],
      },
      {
        heading: "When to credit, and how to take it back",
        paragraphs: [
          "Detection and crediting are separate steps, because the newest blocks can still be replaced in a [[reorg|reorg]]. A deposit is pending once seen at the head, the newest block, and spendable after a chosen number of [[confirmations|confirmations]], blocks built on top of it, or once its block is at or below the `finalized` [[block-tag|tag]], which the protocol treats as [[finality|irreversible]], about 13 to 19 minutes on mainnet. Rollups need their own thresholds, since one [[sequencer|sequencer]] makes their blocks; see [[l2-rpc|L2 RPC differences]].",
          "Each detection is stored under `blockHash`, `transactionHash` and `logIndex` or trace position, never block number, so each row belongs to exactly one branch. Each block names its parent in `parentHash`; a new block whose parent is not the stored hash below it signals a reorg, as in any [[indexer|indexer]]. The replaced block's pending rows, and only those, are deleted, and the transaction, often re-included a block or two later, is detected again under the new block's hash; crediting each surviving row once, when its block reaches the chosen depth, is what prevents a double credit. A credit granted before the chosen depth cannot be undone that way, since the customer may already have withdrawn it; the shortfall becomes a debt.",
        ],
      },
      {
        heading: "Withdrawals from a hot wallet",
        paragraphs: [
          "Withdrawals leave from a hot wallet, an account whose signing key stays online. Its transactions carry consecutive [[nonce|nonces]], and nonce 813 cannot be included before 812, so one withdrawal whose `maxFeePerGas` is below the block's [[eip-1559|base fee]] stalls every later one. One signer process owns the counter, reconciles it with [[eth-get-transaction-count|eth_getTransactionCount]] at `latest`, replaces a stuck transaction by re-signing its nonce with both fee fields raised, by at least 10% in Geth's pool, and keys records on sender and nonce, since each replacement has a new hash; see [[transaction-relayer|transaction relayers]].",
          "Batching withdrawals into one payout-contract call pays the 21,000-gas transaction base cost once instead of per recipient, but one recipient that cannot receive, such as an address frozen by USDC's issuer, reverts the whole batch unless each failure is caught. An EOA's address works on every chain, a contract's only where it was deployed: in 2022 the Optimism Foundation sent 20 million OP on Optimism to Wintermute's multisig address, which existed only on Ethereum, and an attacker deployed a contract there first.",
        ],
      },
    ],
    example: {
      title: "One internal ether deposit, from detection through a reorg to the sweep",
      language: "text",
      code: "customer 4471 -> deposit address 0x5d2c…91e4, a CREATE2 forwarder address, not yet deployed\n\nblock 21,904,118 (0x14e3af6), hash 0x41c7…e09a\n  tx 0x8f3a…c21d: an EOA calls execTransaction on Safe 0x1f9e…77ab\n  receipt: status 0x1, no log that names 0x5d2c…91e4\n  trace_block:  []     EOA -> Safe\n                [0]    Safe DELEGATECALL -> its singleton, the shared Safe code\n                [0,0]  CALL -> 0x5d2c…91e4, value 0xa688906bd8b0000 (0.75 ETH)\n                no error on [0,0], [0] or []\n  -> row (0x41c7…e09a, 0x8f3a…c21d, [0,0])   PENDING 0.75 ETH\n\nblock 21,904,119 arrives with parentHash 0x7b20…14fe, not 0x41c7…e09a  -> reorg\n  -> delete the rows of 0x41c7…e09a; the canonical 21,904,118 (0x7b20…14fe) lacks the tx\n  tx 0x8f3a…c21d is found again in block 21,904,119, hash 0x9d02…3b77\n  -> row (0x9d02…3b77, 0x8f3a…c21d, [0,0])   PENDING 0.75 ETH\n\nabout 13 minutes later: finalized >= 21,904,119, whose hash is still 0x9d02…3b77\n  -> CREDITED 0.75 ETH to customer 4471\n\nsweep: the hot wallet calls createForwarder(parent, feeAddress, salt) on the factory\n  -> the forwarder appears at 0x5d2c…91e4; its init() sends the 0.75 ETH to the parent\n     and logs ForwarderDeposited",
      note: "The deposit exists only in the trace, at `[0,0]` inside the Safe's `DELEGATECALL`; the reorg is caught by `parentHash` before anything is credited, and the credit waits for `finalized` under the same `blockHash` the deposit was detected in.",
    },
    pitfalls: [
      "Crediting any `Transfer` log that names a deposit address, including logs from look-alike tokens.",
      "Checking only a trace frame's own `error`, which credits ether sent by an inner call whose parent reverted.",
      "Watching deployed forwarders' balances for deposits, when they pass the ether on within the same call.",
      "Sending withdrawals with a fixed 21,000 gas limit, which runs out of gas at any contract wallet.",
    ],
    related: ["internal-transaction", "confirmations", "reorg", "trace-api", "transaction-relayer", "nonce", "token-standards", "l2-rpc", "stablecoin-payments", "chain-analytics"],
    sources: [
      { title: "BitGo eth-multisig-v4: ForwarderV4.sol", url: "https://github.com/BitGo/eth-multisig-v4/blob/master/contracts/ForwarderV4.sol" },
      { title: "EIP-1014: Skinny CREATE2", url: "https://eips.ethereum.org/EIPS/eip-1014" },
      { title: "EIP-20: Token Standard", url: "https://eips.ethereum.org/EIPS/eip-20" },
    ],
  },
  {
    id: "stablecoin-payments",
    title: "Stablecoin payment processing",
    category: "indexing",
    aliases: ["stablecoin payments", "USDC payments", "USDT payments", "crypto payment links", "payment channels", "stablecoin blacklist", "payment reconciliation"],
    summary: "Stablecoin payment processing is the service that lets a merchant or platform accept and send dollar-pegged tokens such as USDC and USDT: it assigns an address per payment or per customer, watches [[token-standards|token]] `Transfer` [[event-log|logs]] until they are final, matches each one to an invoice, and pays out from wallets it controls.",
    sections: [
      {
        heading: "An address per invoice",
        paragraphs: [
          "A stablecoin is a [[token-standards|token]] contract whose issuer keeps it worth one US dollar. A transfer records a sender, a recipient and an amount, and nothing that says which invoice it pays, so processors make the address the reference. BVNK's payment links create a fresh address per payment: in its documented example, `POST /api/v1/pay/summary` asks for 10 USD paid in USDT within 30 minutes and returns an address and an [[eip|EIP-681]] link a wallet opens as a ready-made USDT `transfer`, `ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7/transfer?address=0x7b68…00e3&uint256=10008422`. Amounts are whole numbers of the smallest unit, and USDT and USDC have six decimals, so `10008422` is 10.008422 USDT.",
          "BVNK's statuses combine chain events with a clock: `PENDING` until a transaction is seen, `PROCESSING` while it gathers [[confirmations|confirmations]], then `COMPLETE`, `UNDERPAID` or `EXPIRED`. Underpayment is ordinary: BVNK names fees taken by the sending exchange as a typical cause, so 10.008422 USDT requested can arrive as 9.008422. Payments after expiry or in the wrong token still land at an address the processor controls, but only a watcher looking for them notices. BVNK's channels instead give each customer one permanent address for every top-up.",
        ],
      },
      {
        heading: "Watching transfers until they count",
        paragraphs: [
          "The watch is a log scan. On Ethereum USDC is `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` and USDT is `0xdAC17F958D2ee523a2206206994597C13D831ec7`, and a payment is a `Transfer` log from one of them whose `topics[2]`, the recipient, is an open invoice address, left-padded to 32 bytes. A few invoices fit into one [[eth-get-logs|eth_getLogs]] filter as an OR array; tens of thousands do not, so large processors read every `Transfer` of the token per block and match recipients in memory. The log's `address` is the check that matters, since a look-alike token can emit an otherwise identical log.",
          "When a payment counts is a policy per chain, because recent blocks can still be replaced in a [[reorg|reorg]]. Circle Mint credits Ethereum deposits after 12 blocks, about three minutes. A rollup posts its blocks to Ethereum in batches, so for Base and OP Mainnet Circle counts 12 Ethereum blocks after the batch, and for Linea, which posts batches only every 6 to 32 hours, 65 Ethereum blocks after the batch, so a Linea deposit takes hours to count. Circle's CCTP, which moves USDC across chains by burning it on one and minting it on another, waits for Ethereum [[finality|finality]], 15 to 19 minutes, before attesting a burn: a burn reorged out after its mint would leave the dollars on both chains.",
        ],
      },
      {
        heading: "Gasless payers and issuer controls",
        paragraphs: [
          "Many payers hold stablecoins but no ether to pay [[gas|gas]] with. With USDC's [[eip-3009|EIP-3009]] the payer only signs a `transferWithAuthorization` message ([[eip-712|EIP-712]] typed data), and the processor submits it and pays the gas. The transaction's `from` is then the processor, and the payer appears only in the `Transfer` log's `topics[1]` and in `AuthorizationUsed`, so matching on the sender attributes every gasless payment to the processor; [[x402|x402]] facilitators submit payments the same way. The 2017 USDT contract on Ethereum accepts no signed transfer or approval, so its payers need ether or a sponsor such as a [[paymaster|paymaster]].",
          "Issuers can freeze addresses, and the two largest do it differently. USDC's blacklister calls `blacklist(address)`, which emits `Blacklisted(address indexed _account)` and makes both sending and receiving revert with `Blacklistable: account is blacklisted`. USDT's `addBlackList(address)` emits `AddedBlackList(address _user)`, whose address is not indexed and so cannot be filtered on, and blocks only sending; `destroyBlackFunds` can later zero the balance and cut supply with no `Transfer` at all. Before paying out, processors screen recipients with an [[eth-call|eth_call]] to `isBlacklisted` on USDC or `isBlackListed` on USDT.",
        ],
      },
      {
        heading: "Payouts and reconciliation",
        paragraphs: [
          "Payouts are token transfers from a hot wallet, an account whose key stays online, with the nonce discipline of any [[transaction-relayer|transaction relayer]]; see [[exchange-deposits|exchange pipelines]]. USDT's `transfer` returns nothing, so a contract calling it through an interface that expects a `bool` reverts while decoding the empty return data, which is why payout contracts use a wrapper such as OpenZeppelin's `SafeERC20`.",
          "Reconciliation compares the payments credited to an address, minus what was moved out of it, with its `balanceOf` read at the same block. USDT breaks the log-sum shortcut: besides `destroyBlackFunds`, the owner's `issue` and `redeem` change supply with `Issue` and `Redeem` events instead of `Transfer` events from or to the zero address, which ERC-20 only recommends. The contract call is the truth and the log sum the explanation; see [[accounting-reconciliation|balance reconciliation]].",
        ],
      },
    ],
    example: {
      title: "A USDT invoice from quote to underpayment",
      language: "text",
      code: "1. create the payment link\n   POST /api/v1/pay/summary  type IN, amount 10, currency USD, expiryMinutes 30, payInDetails.currency USDT\n   -> status PENDING, paidCurrency.amount 10.008422, address 0x7b686317f8ed2c2bc3bbd060464f1939359a00e3 (ETHEREUM)\n\n2. the watcher, on every new block\n   eth_getLogs {\n     \"address\": \"0xdAC17F958D2ee523a2206206994597C13D831ec7\",\n     \"topics\": [\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\", null,\n                \"0x0000000000000000000000007b686317f8ed2c2bc3bbd060464f1939359a00e3\"],\n     \"fromBlock\": \"0x1675ce7\", \"toBlock\": \"0x1675ce7\" }\n\n3. block 23,551,207 returns one log\n   topics[1] = an exchange's hot wallet, data = 0x…897526\n   0x897526 = 9,008,422 units = 9.008422 USDT at six decimals\n   -> PROCESSING, waiting for the required confirmations\n\n4. the confirmations are reached and the log's blockHash has not changed\n   -> UNDERPAID: 9.008422 of 10.008422 USDT received, credited as received",
      note: "The log's `address` proves it is real USDT and `topics[2]` ties it to the invoice; the missing 1 USDT is most likely a fee the paying exchange deducted, and nothing on chain labels it as such.",
    },
    pitfalls: [
      "Reusing one deposit address for several customers or invoices, which leaves no way to tell whose transfer arrived.",
      "Matching payments on the transaction's `from`, which names the relayer or processor for every EIP-3009 payment.",
      "Copying Ethereum's confirmation count to a rollup, where a deposit is only as settled as the batch that carries it to L1.",
      "Calling USDT's `transfer` from a contract through a `bool`-returning interface, which reverts on the token's empty return data.",
    ],
    related: ["eip-3009", "token-standards", "eth-get-logs", "confirmations", "exchange-deposits", "accounting-reconciliation", "x402", "paymaster", "transaction-relayer", "eip-712"],
    sources: [
      { title: "BVNK: Receive stablecoins via Payment Links", url: "https://docs.bvnk.com/bvnk/use-cases/stablecoin-payments-for-platforms/get-payment/" },
      { title: "Circle Mint: Blockchain confirmations", url: "https://developers.circle.com/circle-mint/blockchain-confirmations" },
      { title: "Circle stablecoin-evm (FiatToken source)", url: "https://github.com/circlefin/stablecoin-evm" },
      { title: "Etherscan: TetherToken (USDT) verified source", url: "https://etherscan.io/address/0xdac17f958d2ee523a2206206994597c13d831ec7#code" },
    ],
  },
  {
    id: "accounting-reconciliation",
    title: "Balance reconciliation",
    category: "indexing",
    aliases: ["balance reconciliation", "proof of completeness", "balance check", "period-end balance", "rebasing token accounting", "ledger reconciliation", "crypto accounting"],
    summary: "Balance reconciliation rebuilds an [[account|account]]'s balance from its recorded history and compares the result with [[eth-get-balance|eth_getBalance]], or with a token's `balanceOf`, at the same block, which is how accounting, tax and audit systems show that their transaction history is complete.",
    sections: [
      {
        heading: "The check, and the block it runs at",
        paragraphs: [
          "Accounting, tax and audit tools keep a ledger of every movement in and out of an address, and must show that nothing is missing. The check is arithmetic: the opening balance at block A, plus every credit and minus every debit after A up to and including B, must equal the node's balance at B. If it holds at every period end, the history is complete, barring errors that cancel out; if not, the difference is the size of what is missing. Cryptio runs this check per wallet; Etherscan's tax and accounting guide builds the ledger from its lists of transactions, internal transfers and token transfers, `txlist`, `txlistinternal` and `tokentx`.",
          "Both sides must name one block, by number or hash, never `latest`, the newest block, which can move between the two reads. A period end is a wall-clock time, so the first step is [[block-by-timestamp|mapping the date to a block]]: for a 2024 year-end, the last block at or before Unix time `1735689600`, 1 January 2025 00:00:00 UTC, which Etherscan's `getblocknobytime` returns with `closest=before`.",
        ],
      },
      {
        heading: "Every debit and credit, not just transfers",
        paragraphs: [
          "Debits are more than outgoing `value`. Every sent transaction pays a [[gas|gas]] fee: `gasUsed` from its [[transaction-receipt|receipt]] times `effectiveGasPrice`, the [[eip-1559|EIP-1559]] base fee plus a priority fee, the tip paid to the block's fee recipient. It pays even when it [[revert|reverted]] with `status` `0x0` and moved no `value`, and a [[blob|blob]] transaction also pays `blobGasUsed` times `blobGasPrice`.",
          "Credits are more than incoming transactions. [[internal-transaction|Internal transfers]], ether sent by contract code, include ether sent along with a contract creation and the balance a self-destructing contract hands over. Each block's fee recipient collects its priority fees, which no transaction or trace shows. For a block bought from a builder that is usually the builder, which pays the proposing validator with an ordinary transfer at the end; see [[validator-rewards|validator rewards]]. [[withdrawals|Withdrawals]], staking payouts listed in gwei in each block's `withdrawals` array, arrive with no transaction at all.",
          "History and other chains add more. Before [[the-merge|the Merge]] miners received block and uncle rewards, which `trace_block` reports as `reward` entries. At block 1,920,000 the DAO fork moved the DAO accounts' balances into the refund contract `0xbf4ed7b27f1d666546e30d74d50d173d20bca754` with no transaction, trace or log. On an OP Stack rollup a sender also pays the receipt's `l1Fee`, for posting its data to Ethereum, plus an operator fee where the chain sets one, while Arbitrum folds the L1 cost into `gasUsed`; see [[l2-rpc|L2 RPC differences]].",
        ],
      },
      {
        heading: "Why summing transfer logs never balances",
        paragraphs: [
          "Ether has no `Transfer` log, so a ledger built from logs misses every native movement. Tokens can move without logs too: ERC-20 only recommends that minting emit a `Transfer`, and [[token-standards|rebasing tokens]] change balances with no transfer at all. Lido's stETH, a token for staked ether, is share-based: a balance is the holder's shares times `totalPooledEther` divided by `totalShares`, so it changes daily when Lido's oracle reports its validators' balances, and a transfer can move 1 or 2 wei less than requested. Aave's aTokens grow with interest just as silently.",
          "Two remedies work. Reconcile each token against `balanceOf` called with [[eth-call|eth_call]] at the closing block, using the logs only to explain movements. For share-based tokens keep the ledger in the contract's own unit, as Lido recommends: `sharesOf` changes only on transfers and mints, which emit `TransferShares`, and on burns, which emit `SharesBurnt`; `getPooledEthByShares` at the closing block converts shares back to ether.",
        ],
      },
      {
        heading: "Reconciling at a past block",
        paragraphs: [
          "A balance at a past block needs that block's [[state|state]], the balances as they were then. A [[full-node|full node]] keeps only recent state, about the last 128 blocks on [[geth|Geth]]'s path-based scheme, so an `eth_getBalance` or `balanceOf` call at last quarter's closing block fails there, with Geth's `historical state 0x… is not available` or another client's `missing trie node`; an [[archive-node|archive node]] answers it. The cheap design snapshots every tracked balance at each period end while that state is still recent, with the block number and hash.",
          "When the sides disagree, bisect: compare ledger and node at the midpoint, keep the half that diverges, and in about 25 steps over mainnet's whole history the first wrong block is found, and its trace names the missing movement. The gap's size is often clue enough: an exact sum of withdrawals, one block's priority fees on a fee-recipient address, or a stETH balance off by the latest rebase.",
        ],
      },
    ],
    example: {
      title: "A January ledger that balances, and the same ledger without withdrawals",
      language: "text",
      code: "address 0x4c1b…4261, January 2025\nopening block A: last block at or before 1735689600 (2025-01-01 00:00:00 UTC)\nclosing block B: last block at or before 1738368000 (2025-02-01 00:00:00 UTC)\n\neth_getBalance(addr, A)                            12.400000000 ETH\n+ incoming top-level values                         +3.000000000\n+ internal credits (trace_filter, toAddress)        +0.750000000\n+ withdrawals, 3 entries, 54,213,790 gwei           +0.054213790\n- outgoing top-level values                         -5.000000000\n- fees, sum of gasUsed x effectiveGasPrice          -0.006314202   14 transactions, one with status 0x0\n= ledger at B                                      11.197899588\n\neth_getBalance(addr, B)                            11.197899588   difference 0\n\nthe same ledger without the withdrawals line       11.143685798   short by 0.054213790 ETH,\n                                                                  exactly the withdrawal total",
      note: "Both balances are read at resolved block numbers, never `latest`; the withdrawal amounts arrive in gwei and are converted before they are added, and the reverted transaction still contributes its fee.",
    },
    pitfalls: [
      "Reading the closing balance at `latest` instead of the resolved period-end block, so the two sides describe different moments.",
      "Leaving out the gas paid by reverted transactions, which were charged their fees even though their `value` never moved.",
      "Ignoring each block's `withdrawals` array, whose gwei amounts credit validator addresses with no transaction, trace or log.",
      "Summing stETH `Transfer` events to get a balance, which misses every daily rebase.",
    ],
    related: ["eth-get-balance", "withdrawals", "internal-transaction", "block-by-timestamp", "archive-node", "eip-1559", "l2-rpc", "token-standards", "validator-rewards", "exchange-deposits"],
    sources: [
      { title: "Etherscan API: Tax and accounting", url: "https://docs.etherscan.io/resources/tax-and-accounting" },
      { title: "Lido tokens integration guide", url: "https://docs.lido.fi/guides/lido-tokens-integration-guide" },
      { title: "EIP-4895: Beacon chain push withdrawals as operations", url: "https://eips.ethereum.org/EIPS/eip-4895" },
      { title: "Cryptio: proof of completeness", url: "https://blog.cryptio.co/proof-of-completeness-cryptio-data-integrity-module-for-financial-audits" },
    ],
  },
  {
    id: "chain-analytics",
    title: "Chain analytics and compliance pipelines",
    category: "indexing",
    aliases: ["blockchain analytics", "blockchain intelligence", "sanctions screening", "address clustering", "transaction monitoring", "onchain data warehouse", "compliance data pipeline"],
    summary: "A chain analytics or compliance pipeline copies every [[block|block]], [[transaction-receipt|receipt]], [[event-log|log]] and [[execution-trace|trace]] of a chain into normalised tables, keeps them complete and consistent through [[reorg|reorgs]], and builds models on top, such as address clusters, entity labels, sanctions matches and risk scores, that the node itself knows nothing about.",
    sections: [
      {
        heading: "The raw layer and its RPC bill",
        paragraphs: [
          "Intelligence firms such as Chainalysis and TRM Labs tell exchanges and investigators whether an address or a payment is linked to crime or sanctions; warehouses such as Dune and Allium offer SQL over the same data. All start from a raw copy of each chain. TRM's engineering blog describes fetching each EVM block with three calls: [[eth-get-block-by-number|eth_getBlockByNumber]], [[eth-get-block-receipts|eth_getBlockReceipts]] and [[trace-api|trace_block]]. Dune's `ethereum.traces` table stores each call with its position in the call tree, `trace_address`, and both its own `success` and the transaction's `tx_success`.",
          "Following the head costs three calls per block, about 7,200 blocks a day on mainnet. Backfill, loading all history from the first block, is the real bill: tracing replays each block against the state before it, mainnet has passed 25 million blocks, and even at a sustained 20 traced blocks per second a full backfill takes about two weeks on an [[archive-node|archive node]]. [[erigon|Erigon]] and [[reth|Reth]], whose storage makes historical replay cheap, are common choices; [[geth|Geth]] has no `trace_` namespace but gives the same flat shape through `flatCallTracer` under [[debug-api|debug_traceBlockByNumber]].",
        ],
      },
      {
        heading: "Completeness and reorgs",
        paragraphs: [
          "Completeness has to be proved. Allium checks that every block, transaction, log and trace exists, that blocks are in order and counts match, and that fields are sane, because, in its words, RPCs can flake, especially during version upgrades. The concrete checks are cheap per block: receipts equal transactions, each transaction has exactly one top-level trace, `logIndex` runs from zero without gaps, and every log carries the block's own hash.",
          "[[reorg|Reorgs]], in which the chain replaces its newest blocks, are handled by waiting, by correcting, or both. Dune delays raw ingestion on chains it rates as reorg-prone, Ethereum and Polygon among them. Allium waits for 12 confirmations on Ethereum, 15 on Base, 300 on Arbitrum, whose blocks come every 250 ms or so, and 50 on Polygon. TRM processes each block at once, compares `parent_hash` with the hash it holds, and has a fixer re-fetch and republish the canonical block. It also retries any block whose fetched parts carry different block hashes, because a provider's [[load-balancer|load balancer]] can answer the block and its traces from nodes on different branches; see [[head-lag|head consistency across nodes]].",
        ],
      },
      {
        heading: "Facts from the node, attribution from the model",
        paragraphs: [
          "The node supplies facts: this account sent this much at this block, and this call reverted. Everything a compliance product adds is a model built on those facts. Clustering, grouping addresses believed to share an owner, leans on exchange behaviour: Friedhelm Victor's 2020 paper groups addresses that pay into the same exchange deposit address, since each one belongs to a single customer; see [[exchange-deposits|exchange deposit pipelines]]. That was the most effective of its heuristics, which together clustered 17.9% of active externally owned accounts. Labels and risk scores are further layers that can be wrong while every raw row is right.",
          "Sanctions screening is the plainest case. The sanctions list of OFAC, a US Treasury office, includes Ethereum addresses, and screening checks a counterparty against it directly or a few transfers, or hops, away. Chainalysis published an on-chain oracle at `0x40C57923924B5c5c5455c48D93317139ADDaC8fb` whose `isSanctioned(address)` any [[eth-call|eth_call]] can query, but its documentation now says it is no longer maintained, last updated on 18 March 2026, while the contract keeps answering. Errors flow the other way too: a call under a reverted parent counted as a transfer adds a false hop to someone's exposure; see [[internal-transaction|internal transactions]].",
        ],
      },
      {
        heading: "Bulk history without JSON-RPC",
        paragraphs: [
          "JSON-RPC is a slow way to move a whole chain. [[era-files|Era files]] in the era1 format hand over pre-Merge blocks and receipts in verifiable batches of 8,192 blocks; consensus era files carry post-Merge blocks but no receipts, and traces always need re-execution. [[firehose|Firehose]] runs inside a patched client, captures each block with every call and balance change, and streams it with a cursor and undo steps for reorgs, replacing three calls per block and most reorg code. Tools such as Cryo write RPC output to Parquet; see [[etl-pipeline|ETL pipeline]].",
          "Whatever the source, a pipeline that serves investigators records provenance: the block hash each row came from, and the client and tracer that produced its traces. A finding that has to be defended must be reproducible, and tracers disagree about which frames to list: Geth's `callTracer` includes calls to precompiled contracts, while its `flatCallTracer` drops them by default.",
        ],
      },
    ],
    example: {
      title: "One block's batch, rejected and retried by the consistency check",
      language: "text",
      code: "block 23,551,207 (0x1675ce7), fetched through a load-balanced endpoint\n\n1  eth_getBlockByNumber(0x1675ce7, false)   hash 0x6e1f…a2c0, 184 transactions\n2  eth_getBlockReceipts(0x1675ce7)          184 receipts, blockHash 0x6e1f…a2c0\n3  trace_block(0x1675ce7)                   1,372 traces, blockHash 0x0b94…7d15   <- another branch\n\nhashes disagree -> discard the whole batch and fetch it again\n\n1' eth_getBlockByNumber(0x1675ce7, false)  hash 0x6e1f…a2c0, 184 transactions\n2' eth_getBlockReceipts(0x1675ce7)         184 receipts, blockHash 0x6e1f…a2c0\n3' trace_block(0x1675ce7)                  1,365 traces, blockHash 0x6e1f…a2c0   all three agree\n\nchecks before writing\n  receipts = transactions                  184 = 184\n  top-level traces (trace_address [])      184\n  logIndex runs 0 to 611 with no gap\n  parentHash = stored hash of 23,551,206   ok\n\nwrite every row keyed by 0x6e1f…a2c0 and advance the cursor, the last block processed,\nin the same database transaction",
      note: "Each call was answered by a different backend; only the shared block hash proves the three responses describe one block, and the per-block counts prove that nothing came back truncated.",
    },
    pitfalls: [
      "Joining a block from one node with traces from another without checking that both carry the same block hash.",
      "Treating a cluster label or risk score as an on-chain fact, when it is a model output the node cannot confirm.",
      "Screening against a sanctions list held in a contract that is no longer maintained, which answers false for every newer designation.",
      "Checking only that every block exists, which misses a block whose traces or logs came back truncated.",
    ],
    related: ["indexer", "etl-pipeline", "trace-api", "internal-transaction", "reorg", "firehose", "era-files", "exchange-deposits", "address-history", "head-lag"],
    sources: [
      { title: "TRM Labs: How TRM handles blockchain reorgs across EVM chains", url: "https://www.trmlabs.com/trm-tech-blog/how-trm-handles-blockchain-reorgs-across-evm-chains" },
      { title: "Dune: ethereum.traces", url: "https://docs.dune.com/data-catalog/evm/ethereum/raw/traces" },
      { title: "Allium: Transaction finality", url: "https://docs.allium.so/guides/finality" },
      { title: "Chainalysis oracle documentation", url: "https://go.chainalysis.com/chainalysis-oracle-docs.html" },
    ],
  },
  {
    id: "address-history",
    title: "Transaction history by address",
    category: "indexing",
    aliases: ["address history", "transactions by address", "account history", "txlist", "alchemy_getAssetTransfers", "ots_searchTransactionsBefore", "trace_filter fromAddress"],
    summary: "Ethereum's JSON-RPC has no method that lists the transactions touching an [[address|address]], because nodes look blocks and transactions up only by number and hash, so address history is assembled from log scans, address-filtered traces, client-specific searches or an external [[indexer|indexer]], each of which misses something.",
    sections: [
      {
        heading: "Why the node has no answer",
        paragraphs: [
          "Wallets, explorers and tax tools all want one list, everything that happened to an address, and a node cannot produce it. It stores blocks by number and hash, transactions by hash, receipts beside their blocks and [[state|state]] by address: tables with primary keys and no secondary index on address. State is only each account's current balance, nonce, code and storage, not how they got there. The one address index in a block is its 2048-bit [[logs-bloom|logs bloom]], which covers the contracts and topics of that block's logs, not transaction senders or recipients. Using it means testing every block header, and a match finds only logs.",
          "One number is available directly. [[eth-get-transaction-count|eth_getTransactionCount]] returns an externally owned account's nonce, the count of transactions it has sent and had included, so an account at nonce 42 should have exactly 42 outgoing transactions in any history built for it. [[eip-7702|EIP-7702]], which lets such an account run a contract's code, complicates the check: each applied authorization the account signed also raises its nonce, even when someone else sent the transaction, and so does every `CREATE` run by the delegated code. A contract's nonce starts at 1 and counts the contracts it created, and nothing counts incoming activity.",
        ],
      },
      {
        heading: "Four ways to build it",
        paragraphs: [
          "Logs answer for events. [[eth-get-logs|eth_getLogs]] with the address left-padded into `topics[1]` finds the `Transfer` events it sent, and a second query with it in `topics[2]` finds those it received, because a filter ANDs its topic positions and cannot OR across them. Leaving out `address` catches every token at once, the wide, expensive query that providers [[rate-limits|limit]]. ERC-1155's `TransferSingle` puts the operator first and the sender and recipient in `topics[2]` and `topics[3]`, so it needs its own queries.",
          "Traces answer for ether: `trace_filter` with `fromAddress` or `toAddress` returns every matching call in a block range, internal transfers included. [[erigon|Erigon]] finds the address in its call-trace indexes and re-executes only the matching transactions; [[nethermind|Nethermind]], [[besu|Besu]] and [[reth|Reth]] re-execute every block in the range. Default range caps are 1,000 blocks on Erigon (`--rpc.blockrange.limit`) and Besu (`--rpc-max-trace-filter-range`), 100 on Reth (`--rpc.max-trace-filter-blocks`) and none on Nethermind beyond its request timeout, and [[geth|Geth]] has no `trace_filter`. A year, about 2.6 million blocks, is therefore some 2,600 requests to Erigon or Besu and 26,000 to Reth.",
          "Search methods and hosted indexes answer the question directly. [[otterscan|Otterscan]]'s `ots_searchTransactionsBefore` and `ots_searchTransactionsAfter` page through an address's inbound, outbound and internal history on Erigon, while Reth answers them with `unimplemented`. Etherscan's account API splits history into separate lists, such as `txlist`, `txlistinternal`, `tokentx` and `txsBeaconWithdrawal`, each paged with `page` and `offset`. Alchemy's `alchemy_getAssetTransfers` takes a `category` array such as `external`, `internal` and `erc20`, returns 1,000 results per page by default with a `pageKey` that expires after ten minutes, and serves `internal` only on Ethereum, Polygon, Base and Arc.",
        ],
      },
      {
        heading: "What each one misses",
        paragraphs: [
          "Every method has a blind spot. Logs miss ether entirely, and any token movement the contract did not log, such as USDT's `issue`. Traces miss what happens outside the EVM: [[withdrawals|withdrawals]] and the priority fees credited to a block's fee recipient. Alchemy's transfers leave out zero-value internal calls, `DELEGATECALL` frames, miner rewards and beacon withdrawals. An address passed only as a function argument, such as a new owner set by an admin call that emits no event, shows up only by decoding every transaction's calldata, which none of these methods does. A complete history is therefore the union of several sources, checked against the balance; see [[accounting-reconciliation|balance reconciliation]].",
          "Sponsored and abstracted accounts break the assumption that the sender is the actor. An [[erc-4337|ERC-4337]] smart account is a contract wallet whose signed operations a bundler packs into its own transaction, a call to `handleOps` on the shared EntryPoint contract. A `txlist` query for the smart account comes back empty; its activity sits in the EntryPoint's `UserOperationEvent` logs, with the account as `sender` in `topics[2]`, and in the internal calls the account makes. [[eip-3009|EIP-3009]] payers and accounts whose gas a sponsor pays look the same, since the transaction's `from` is someone else.",
          "Because anyone can make a log mention an address, a log-built history also collects address-poisoning spam: zero-value transfers involving look-alike addresses that share the first and last characters of one the user really pays, planted so the user copies the wrong one. Filtering by token contract and amount removes them.",
        ],
      },
    ],
    example: {
      title: "One week of one smart account, seen through six methods",
      language: "text",
      code: "smart account 0x9d2c…4a71 (ERC-4337, EntryPoint v0.7 at 0x0000000071727De22E5E9d8BAf0edAc6f37da032)\n\nmethod                                                  rows   what it saw\ntxlist (top-level from or to)                              0   every operation was sent by a bundler\neth_getLogs Transfer, topics[1] = account                  4   3 USDC payments, 1 zero-value USDC transfer to a look-alike address\neth_getLogs Transfer, topics[2] = account                  3   2 USDC receipts, 1 token whose contract is not USDC\neth_getLogs on the EntryPoint, UserOperationEvent,\n            topics[2] = account                            5   the five operations, each with success = true\ntrace_filter fromAddress [account]                         7   calls the account made, 2 of them ether payouts\neth_getTransactionCount(account, latest)                 0x1   a contract's nonce starts at 1 and counts only its CREATEs",
      note: "No single row is the account's history: the zero-value transfer is poisoning spam, the look-alike token is not USDC, and only the union of logs, EntryPoint events and traces explains the account's balance.",
    },
    pitfalls: [
      "Querying `topics[1]` only, which returns what an address sent and none of what it received.",
      "Asking one `trace_filter` call for a year of blocks, far beyond the 100 to 1,000 blocks that most clients' default caps allow.",
      "Building a smart account's history from the transactions it sent, when a bundler sent every one of its operations.",
      "Copying an address out of a history that includes zero-value poisoning transfers involving look-alike addresses.",
    ],
    related: ["indexer", "eth-get-logs", "trace-api", "otterscan", "logs-bloom", "block-explorer", "internal-transaction", "erc-4337", "portfolio-tracker", "accounting-reconciliation"],
    sources: [
      { title: "Alchemy: Transfers API quickstart", url: "https://www.alchemy.com/docs/reference/transfers-api-quickstart" },
      { title: "Erigon: trace_filtering.go", url: "https://github.com/erigontech/erigon/blob/main/rpc/jsonrpc/trace_filtering.go" },
      { title: "Besu: ApiConfigurationOptions.java", url: "https://github.com/besu-eth/besu/blob/main/app/src/main/java/org/hyperledger/besu/cli/options/ApiConfigurationOptions.java" },
      { title: "Reth CLI: reth node", url: "https://reth.rs/cli/reth/node" },
    ],
  },
  {
    id: "portfolio-tracker",
    title: "Portfolio and balance scanners",
    category: "indexing",
    aliases: ["portfolio tracker", "wallet balances", "token discovery", "balance scanner", "BalanceChecker", "alchemy_getTokenBalances", "DeFi positions", "spam tokens"],
    summary: "A portfolio tracker shows what an [[address|address]] holds and what it is worth; because no [[json-rpc|JSON-RPC]] method lists an address's tokens, it first discovers candidate token contracts from [[event-log|Transfer logs]] or token lists, then reads every balance with [[eth-call|eth_call]] at one block.",
    sections: [
      {
        heading: "No method lists what an address holds",
        paragraphs: [
          "Wallets and portfolio apps such as Zerion, DeBank and the Safe{Wallet} interface show what an address holds, what it is worth and how its net worth changed over time. Ether sits in the account itself, and [[eth-get-balance|eth_getBalance]] returns it. Every other token is a [[smart-contract|contract]] that keeps its own holder-to-amount table in its [[contract-storage|storage]]. A node can answer what one token records for one holder, but nothing lists which tokens record anything for that holder. So every tracker works in two steps: discovery builds a list of candidate contracts, and reading asks each one for a number.",
          "Discovery has three common sources. The first is a transfer index. ERC-20 and ERC-721 tokens emit a `Transfer` event on every move, with the sender in `topics[1]` and the recipient in `topics[2]`, two of its indexed [[event-signature|topics]]. Scanning [[eth-get-logs|eth_getLogs]] for that event with the address in either position finds every token the address ever touched; the Safe Transaction Service fills its own [[indexer|index]] this way. The second is a token list, a curated file of contracts such as one in Uniswap's Token Lists format, each probed whether or not the address has history with it. The third is a provider's own method: `alchemy_getTokenBalances` returns at most 100 balances per call and documents no block parameter, so it answers only for the present.",
        ],
      },
      {
        heading: "The read fan-out",
        paragraphs: [
          "Each balance is then an ordinary call: `balanceOf(holder)` per token, `decimals()` and `symbol()` once per token, and eth_getBalance for ether. A wallet with 300 candidate tokens on five chains needs 1,500 reads per refresh, for every user who opens the app, so trackers pack them. [[multicall|Multicall3]]'s `aggregate3` runs hundreds of sub-calls inside one eth_call, all at the block the request names, so every balance describes the same moment. The open-source BalanceChecker at `0xb1f8e55c7f64d203c1400b9d8555d050f94adf39` packs tighter still: it takes an array of holders and an array of tokens and returns every balance, with the zero address standing for ether. Where nobody deployed it, a [[deployless-call|deployless call]] sends its bytecode inside the request.",
          "DeFi positions need protocol-specific reads, because a deposit in a lending market or a pool is not a token in the user's address. Aave V3's Pool answers `getUserAccountData(user)` with total collateral, total debt and the health factor, which says how close the loan is to liquidation. A Uniswap v3 liquidity position is an NFT issued by the position manager, so the tracker calls the manager's `balanceOf(owner)`, then `tokenOfOwnerByIndex(owner, i)` per position, then `positions(tokenId)` for its price range and liquidity, and converts that into two token amounts at the pool's current price; see [[dex-pool-reads|DEX pool reads]]. Products keep one such adapter per protocol.",
        ],
      },
      {
        heading: "Spam, prices and the past",
        paragraphs: [
          "Anyone can deploy a token and emit `Transfer` to any address, so a discovery index fills with junk: tokens named USDC that are not USDC, airdrops whose name is a phishing link, and zero-value transfers that plant a look-alike address in the user's history in the hope the user copies it. Filtering is off-chain work: Zerion's API marks each asset with `is_trash` and hides flagged positions by default, because `filter[trash]` defaults to `only_non_trash`. A tracker that skips this shows a fake balance next to the real ones.",
          "Prices are not on chain in general form; they come from market-data services or, for long-tail tokens, from on-chain [[price-oracle|price oracles]] and pool reserves. The net-worth chart repeats the fan-out at past blocks, one [[block-by-timestamp|block per point in time]]. Most nodes keep only recent state, so these are [[archive-node|archive]] requests, and a 90-day daily chart of 300 tokens is 27,000 of them per address. Trackers therefore store a daily snapshot as they go, or rebuild balances from their transfer index, which fails for rebasing tokens such as Lido's stETH, whose balances grow without a `Transfer`.",
        ],
      },
      {
        heading: "What it needs from an endpoint",
        paragraphs: [
          "The workload is wide and shallow. Most of it is eth_call at the `latest` [[block-tag|block tag]], the newest block: latency-bound because a person is waiting, and cacheable until the next block. Around it sit log scans and archive reads, as with [[address-history|address history]]. Each chain is at its own head, so a cross-chain total mixes blocks taken seconds apart.",
        ],
      },
    ],
    example: {
      title: "Four balances in one eth_call through a balance scanner",
      language: "text",
      code: "// eth_call to BalanceChecker.balances(address[] users, address[] tokens), pinned to block 26,290,000\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[\n  {\"to\":\"0xb1f8e55c7f64d203c1400b9d8555d050f94adf39\",\"data\":\"0xf0002ea9…\"},\n  \"0x1912750\"\n]}\n\ncalldata after the selector 0xf0002ea9, word by word:\n  …0040   offset of users        …0080   offset of tokens\n  …0001   one user               …d8da6bf26964af9d7eed9e03e53415d37aa96045\n  …0004   four tokens            …0000 (ether)            …a0b86991…eb48 (USDC)\n                                 …c02aaa39…6cc2 (WETH)    …6b175474…1d0f (DAI)\n\n// result: offset 0x20, length 4, then one balance per token, in the order asked\n// (with several users the array runs user by user: all tokens for the first, then the next)\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x…20…04…502f14b6df19176f…0246c3fc…145a277acf9c9ab6…c773e494795fd7e8\"}\n\ndecoded with each token's decimals():\n  ether  0x502f14b6df19176f / 1e18 =  5.7779\n  USDC   0x0246c3fc         / 1e6  = 38.192124\n  WETH   0x145a277acf9c9ab6 / 1e18 =  1.4665\n  DAI    0xc773e494795fd7e8 / 1e18 = 14.3721",
      note: "All four balances come from the same block in one request; `decimals()` is still needed per token, because USDC's 6 and DAI's 18 make raw totals meaningless.",
    },
    pitfalls: [
      "Building candidates only from a token list, which misses every token the list does not carry, including the airdrop that arrived this morning.",
      "Reading a zero from BalanceChecker as a real zero, when it also returns 0 for a token address without code and for a reverting `balanceOf`.",
      "Packing every candidate into one multicall past the node's eth_call gas cap, so the whole refresh fails.",
      "Summing `Transfer` amounts to get a balance, which drifts for rebasing and reflection tokens, whose balances change without a `Transfer`; read `balanceOf` instead.",
    ],
    related: ["token-standards", "multicall", "deployless-call", "eth-get-logs", "address-history", "price-oracle", "dex-pool-reads", "archive-node", "indexer", "block-by-timestamp"],
    sources: [
      { title: "Safe: RPC requirements for the Safe Transaction Service", url: "https://docs.safe.global/api-rpc-requirements" },
      { title: "Alchemy: alchemy_getTokenBalances", url: "https://www.alchemy.com/docs/reference/alchemy-gettokenbalances" },
      { title: "Zerion API: spam filtering", url: "https://developers.zerion.io/spam-filtering" },
      { title: "eth-balance-checker (BalanceChecker contract)", url: "https://github.com/wbobeirne/eth-balance-checker" },
    ],
  },
  {
    id: "airdrop-rewards",
    title: "Rewards, points and airdrop computation",
    category: "indexing",
    aliases: ["airdrop", "Merkl", "Merkle distributor", "liquidity mining", "points program", "time-weighted balance", "reward campaign", "claim proof"],
    summary: "Reward, points and airdrop engines compute off-chain, from on-chain history, how much each address has earned, then publish one Merkle root, a 32-byte hash that commits to the whole payout table, so that each recipient can claim with a short proof; behind every campaign sits a historical backfill that others must be able to reproduce.",
    sections: [
      {
        heading: "What the engine computes",
        paragraphs: [
          "A campaign reads like ‘pay 7,000 tokens over seven days to liquidity providers in this pool, in proportion to their liquidity over time’; an airdrop reads like ‘everyone who used the protocol before block N receives an amount’. The user sees what they have earned so far and a claim button. Time-weighted means a balance counts for as long as it was held: 1,000 units for ten days earn the same as 10,000 units for one day. Merkl, an incentive engine used by DeFi protocols, works this way: it rebuilds each participant's position from [[event-log|events]] and integrates it over the campaign, so a user's share is their area under the balance-over-time curve divided by everyone's. Points programs run the same calculation and stop at a leaderboard instead of a token.",
          "Events alone are not trusted, because state can change without a log: a lending market's debt grows continuously through interest computed when it is read, and rebasing tokens adjust every balance at once. So Merkl compares event-derived totals with on-chain values such as a lending market's `totalDebt()`, and when the two differ by more than 1% it reads each user's position on-chain to correct the figure. The inputs are logs for the timeline plus [[eth-call|eth_call]] reads at sampled past blocks, which need an [[archive-node|archive]] or a [[partial-archive|partial archive]] covering the window.",
        ],
      },
      {
        heading: "Concentrated liquidity earns only in range",
        paragraphs: [
          "A Uniswap v3 liquidity provider picks a price range, and the deposit is used by swaps, and earns fees, only while the pool's price is inside it. Prices are counted in ticks, integer steps of 0.01% on the pool's price scale. A position is an NFT whose `positions(tokenId)` record holds `tickLower`, `tickUpper` and `liquidity`; it is in range while the pool's current tick satisfies `tickLower <= tick < tickUpper`, and Merkl's concentrated-liquidity campaigns reward only in-range positions by default. The current tick is in every `Swap` event, so the engine replays swaps across the window to know which positions were active when, and reads the position manager's `IncreaseLiquidity` and `DecreaseLiquidity` events for how much each one held; see [[dex-pool-reads|DEX pool reads]].",
        ],
      },
      {
        heading: "Publishing a root and claiming",
        paragraphs: [
          "Paying thousands of addresses one transaction at a time would be expensive, so the engine commits to the whole payout table and lets each recipient claim. A Merkle tree hashes each row into a leaf, then hashes pairs of hashes upward until one 32-byte root remains. A [[inclusion-proof|proof]] is the list of sibling hashes from one leaf up to the root, about 20 hashes for a million rows, so a contract that holds the tokens and stores only the root, a Merkle distributor, can check any claim.",
          "Uniswap's MerkleDistributor, written for the 2020 UNI airdrop, hashes each leaf as `keccak256(abi.encodePacked(index, account, amount))`, takes `claim(index, account, amount, merkleProof)` and marks each index in a bitmap read through `isClaimed(index)`. OpenZeppelin's StandardMerkleTree hashes each leaf twice, as `keccak256(bytes.concat(keccak256(abi.encode(account, amount))))`, so an inner node can never pass as a leaf. Proofs come from the campaign's API or its published files; the chain only verifies them.",
          "Merkl's Distributor holds cumulative totals instead. Its leaf is `keccak256(abi.encode(user, token, amount))`, where `amount` is everything the user has ever earned in that token, and `claim(users, tokens, amounts, proofs)` pays `amount` minus what was already claimed. A new root becomes live only after a dispute period of one to two hours, during which anyone can contest it; until then `getMerkleRoot()` still returns the previous root, and a proof taken from the newest tree reverts with `InvalidProof`. An eth_call of the claim catches that before any gas is spent.",
        ],
      },
      {
        heading: "The backfill behind it",
        paragraphs: [
          "A seven-day campaign on Ethereum covers about 50,400 blocks of pool logs plus sampled reads per position; a retroactive airdrop covers years of [[eth-get-logs|eth_getLogs]] under provider range caps, plus a `balanceOf` at the cut-off block for every candidate. Correctness matters more than speed, because disputers and users recompute the result. That means pinning blocks rather than reading `latest`, staying behind the `finalized` block so that a [[reorg|reorg]], which replaces recent blocks, cannot remove counted activity, choosing the cut-off with a stated [[block-by-timestamp|block-by-time]] convention, and checking that an empty log range means no activity rather than [[history-expiry|expired history]]. [[chain-analytics|Chain analytics]] pipelines have the same shape.",
        ],
      },
    ],
    example: {
      title: "One week of an in-range liquidity campaign, step by step",
      language: "text",
      code: "Campaign: 7,000 REWARD over 7 days to in-range liquidity in one Uniswap v3 pool,\n1,000 per day, split by liquidity among the positions that were in range that day.\n(Simplified: Merkl's own formula also weights each position's token0 and token1 holdings.)\n\n1  eth_getLogs on the position manager and the pool, blocks 26,240,000 to 26,290,400\n     IncreaseLiquidity, DecreaseLiquidity   two positions, A and B, unchanged all week\n     Swap (its last field is the tick)      tick between -40 and 55 on days 1-5,\n                                            between 90 and 310 on days 6-7\n2  eth_call positions(tokenId) on the position manager at block 26,240,000\n     A  tickLower -600  tickUpper 600  liquidity 4.0e18\n     B  tickLower  -60  tickUpper  60  liquidity 6.0e18\n3  in range means tickLower <= tick < tickUpper\n     days 1-5   A in range, B in range\n     days 6-7   A in range, B out (tick >= 60)\n4  rewards per day\n     days 1-5   A  4 / (4 + 6) x 1,000 = 400      B  600\n     days 6-7   A  1,000                          B  0\n     totals     A  5 x 400 + 2 x 1,000 = 4,000    B  5 x 600 = 3,000\n5  Merkl-style leaf for A: keccak256(abi.encode(A, REWARD, 4000e18))\n     the amount is cumulative; A has claimed 0 so far\n6  after the dispute period, A calls claim([A], [REWARD], [4000e18], [proof])\n     the Distributor pays 4000e18 - 0 and records 4000e18 as claimed;\n     next week's tree carries A's new cumulative total, and A claims only the difference",
      note: "Step 3 is where a balance-weighted calculation goes wrong: B held more liquidity than A, but earned nothing on the two days the price sat above its range.",
    },
    pitfalls: [
      "Counting a concentrated-liquidity position for the whole campaign when it was out of range for part of it.",
      "Taking an empty `eth_getLogs` result over an old range as no activity when the endpoint no longer holds those receipts.",
      "Sending a Merkl claim built from the newest tree during its dispute period, when the contract still verifies against the previous root.",
      "Picking the first block at or after the deadline as the eligibility snapshot, which counts activity from after the cut-off.",
    ],
    related: ["event-log", "eth-get-logs", "dex-pool-reads", "archive-node", "partial-archive", "block-by-timestamp", "chain-analytics", "reorg", "governance-voting-power", "portfolio-tracker"],
    sources: [
      { title: "Merkl: architecture and technical overview", url: "https://docs.merkl.xyz/merkl-mechanisms/technical-overview" },
      { title: "Merkl Distributor contract", url: "https://github.com/AngleProtocol/merkl-contracts/blob/main/contracts/Distributor.sol" },
      { title: "Uniswap merkle-distributor", url: "https://github.com/Uniswap/merkle-distributor" },
      { title: "OpenZeppelin merkle-tree", url: "https://github.com/OpenZeppelin/merkle-tree" },
    ],
  },
];
