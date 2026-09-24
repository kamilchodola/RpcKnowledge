// Checkpoint questions for the indexing category. Six per topic; each attempt draws five.
// Hand-written. See the topic lessons in data/indexing.js.

export const quizzes = {
  "indexer": [
    {
      kind: "scenario",
      question: "An indexer fetches block N and its parentHash does not match the hash it stored for N-1. What should it do before writing anything?",
      options: [
        "Skip block N and continue from N+1, since the gap will close",
        "Roll back rows for the orphaned blocks, then apply the new branch",
        "Re-request block N-1 and overwrite only its row, keeping the rest",
        "Nothing; parentHash only differs while the node is out of sync",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why is (blockHash, logIndex) preferred over (blockNumber, logIndex) as the primary key for indexed logs?",
      options: [
        "logIndex restarts at zero for every transaction, so the number is ambiguous",
        "Block numbers are absent from the log objects eth_getLogs returns",
        "Hashes sort faster than integers in most database engines",
        "A replacement block after a reorg reuses the number but never the hash",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "What is the cheapest pair of calls for ingesting one block's header, receipts, and logs from a standard endpoint?",
      options: [
        "eth_getBlockByNumber with fullTransactions false, plus eth_getBlockReceipts",
        "eth_getBlockByNumber with full transactions, plus a receipt call for each",
        "eth_blockNumber, plus eth_getFilterChanges on a standing filter",
        "eth_subscribe on newHeads, plus debug_traceBlockByNumber",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "An indexer commits a block's rows, then updates its cursor in a separate write, and crashes in between. What happens on restart?",
      options: [
        "It skips that block, so its logs are never indexed",
        "It spots the gap through parentHash and repairs it",
        "It processes that block again and can duplicate its rows",
        "It loses the rows, because the database rolls them back",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "An indexer keeps two frontiers. What distinguishes the settled one from the optimistic one?",
      options: [
        "It follows the head and is rewritten whenever a reorg happens",
        "It covers backfilled ranges, while the other covers live blocks",
        "It stores decoded rows, while the other stores the raw logs",
        "It advances only to finalized or confirmation-deep blocks",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "Your endpoint lacks eth_getBlockReceipts, so you fetch one block's logs with eth_getLogs instead. What do you lose compared with receipts?",
      options: [
        "The logIndex of each log in the block",
        "Each transaction's status and gasUsed",
        "The blockHash each log belongs to",
        "Logs emitted by internal contract calls",
      ],
      answer: 1,
    },
  ],

  "event-log": [
    {
      kind: "detail",
      question: "Where do the indexed parameters of a normal event end up in the log?",
      options: [
        "At the start of data, ahead of the non-indexed ones",
        "In topics[0], concatenated after the signature hash",
        "In topics[1] onwards, one 32-byte word each",
        "In a separate indexedData field of the log object",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A contract wants to read an event that another contract emitted earlier in the same transaction. How does it do that?",
      options: [
        "It cannot; no EVM opcode reads logs back",
        "With the LOG0 opcode, called in read mode",
        "By calling eth_getLogs through a precompile",
        "By reading receiptsRoot from the block header",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "When does a log object arrive with removed set to true?",
      options: [
        "When the emitting transaction reverted after writing it",
        "When a subscription or filter withdraws it after a reorg",
        "When the log is older than the node's history retention",
        "When the emitting contract has since self-destructed",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "In one block, the first log of the second transaction carries logIndex 0x5. Why?",
      options: [
        "logIndex counts within the transaction, after five internal calls",
        "Five logs from the first transaction were removed by a reorg",
        "The node reserves indexes 0x0 to 0x4 for system logs",
        "logIndex counts across the whole block, not within a transaction",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A transaction reverts after its contract has already emitted two events. What does its receipt show?",
      options: [
        "status 0x0, with both logs marked removed",
        "status 0x1, with both logs kept",
        "status 0x0 and an empty logs array",
        "status 0x0, with both logs kept for debugging",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A wallet credits incoming tokens for any log whose topics[0] is the Transfer signature hash. What is the flaw?",
      options: [
        "Transfer logs count only once their block has been finalized",
        "topics[0] alone cannot tell a Transfer from an Approval",
        "Any contract can emit Transfer; the log's address must be checked",
        "Transfer logs from internal calls are not included in receipts",
      ],
      answer: 2,
    },
  ],

  "event-signature": [
    {
      kind: "detail",
      question: "A non-anonymous event's log carries three topics. How many indexed parameters does the event declare?",
      options: [
        "Three, one for each entry in the topics array",
        "Two, because topics[0] holds the signature hash",
        "Three, with the signature hash stored in data",
        "Four, since topics[0] packs two values together",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A filter asks for topics [sigHash, null, [aliceTopic, bobTopic]]. Which logs match?",
      options: [
        "That event, Alice or Bob as the first indexed value, any second",
        "That event only, since null cancels the rest of the array",
        "That event, any first indexed value, and Alice or Bob as the second",
        "Any event whose topics hold the signature hash anywhere",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "How does an indexed string parameter appear in a log?",
      options: [
        "As the first 32 bytes of its UTF-8 text, right-padded with zeros",
        "As an offset pointing into data, like a non-indexed string",
        "As its length in bytes, with the text itself moved into data",
        "As the keccak-256 hash of its encoding, which cannot be reversed",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "A filter built from the hash of Transfer(address,address,uint) returns nothing on a busy token. Why?",
      options: [
        "The canonical form says uint256, so the hash differs",
        "Filters need the 4-byte selector rather than a full hash",
        "Transfer logs are returned only when an address is set",
        "The hash is right, but the node strips the uint alias",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "You want every transfer either from Alice or to Alice. What do eth_getLogs filter semantics force you to do?",
      options: [
        "Put Alice's topic at positions 1 and 2 in a single filter",
        "Put null at position 1 and Alice's topic at position 2",
        "Run two filters, or one broader query filtered client-side",
        "Put Alice's topic in an array at position 0 with the hash",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What distinguishes topics[0] from an ABI function selector built the same way?",
      options: [
        "A selector keeps all 32 bytes of the hash; topics[0] keeps four",
        "topics[0] keeps all 32 bytes of the hash; a selector keeps four",
        "topics[0] hashes with SHA-256, while a selector uses keccak-256",
        "topics[0] includes the parameter names; a selector omits them",
      ],
      answer: 1,
    },
  ],

  "reorg": [
    {
      kind: "detail",
      question: "After a reorg, which RPC access path tells a consumer that a log it already received has been withdrawn?",
      options: [
        "eth_getLogs, which returns the orphaned log with removed set to true",
        "eth_getBlockReceipts, which returns a removedLogs array for the block",
        "A logs subscription or eth_getFilterChanges, with removed set to true",
        "eth_blockNumber, which drops back and implies which logs are gone",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A transaction you were tracking is reorged out and re-included in the next block. What changes?",
      options: [
        "Its transaction hash, since the signature is redone for the new block",
        "Nothing, because the receipt is stored under the transaction hash",
        "Its nonce, which is bumped by one to prevent a replay",
        "Its block hash, number, and indexes change; its hash stays",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "Under normal protocol assumptions, which block cannot be reorged out?",
      options: [
        "One at or below finalized, as reverting it needs a third slashed",
        "One at or below safe, which is irreversible by definition",
        "Any block over one slot old, since reorgs are only one deep",
        "The latest block, since the node has already executed it",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "An indexer re-runs eth_getLogs over a recent range after a reorg and appends whatever comes back. What ends up stored?",
      options: [
        "The new branch's logs only, since the old ones return as removed",
        "The new branch's logs alongside orphaned ones that never leave",
        "The orphaned logs only, because the node caches the range",
        "Duplicate rows that the node has marked with removed: true",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does a poller that only increments a block counter never notice a reorg?",
      options: [
        "Each reorg shifts every later block number up by one",
        "The node pauses eth_blockNumber until the reorg completes",
        "Reorgs only affect blocks the poller has not yet reached",
        "The new chain answers every number, so nothing looks wrong",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A poller behind a load balancer detects a reorg that never happened on either backend node. What caused it?",
      options: [
        "The chain briefly finalized a competing checkpoint",
        "It hopped between nodes whose heads briefly disagreed",
        "One backend had pruned the block the poller had stored",
        "Each backend applied the same reorg at a different depth",
      ],
      answer: 1,
    },
  ],

  "confirmations": [
    {
      kind: "contrast",
      question: "Why is a confirmation count a weaker guarantee on Ethereum today than the finalized block tag?",
      options: [
        "Confirmation counts reset whenever the finalized checkpoint moves",
        "Finalized blocks are produced faster, so they arrive sooner",
        "Depth is a heuristic; finality is a slashing-backed commitment",
        "Depth counts only the blocks built by the same proposer",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A transaction shows ten confirmations, but your integration still credits the wrong outcome. What check was most likely missing?",
      options: [
        "Re-reading the receipt to check its blockHash is unchanged",
        "Converting the block number from hex before subtracting it",
        "Waiting until the transaction had left the node's pool",
        "Checking that gasUsed matched the earlier gas estimate",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "You count confirmations against the current head. Where should the head and the receipt come from for a stable count?",
      options: [
        "Head from a public endpoint, receipt from your own node",
        "Head from the fastest endpoint, receipt from a cached copy",
        "Head from an L2 endpoint, receipt from the L1 it settles to",
        "Head from one endpoint, receipt from that same endpoint",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "How is a transaction's confirmation count usually defined?",
      options: [
        "The number of attestations the including block received",
        "head - blockNumber + 1, counting the including block",
        "Blocks built since the including block was finalized",
        "The number of nodes that have returned the receipt",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "You reuse a 20-confirmation threshold from an L1 integration on an L2 with 2-second blocks and one sequencer. What does it amount to?",
      options: [
        "A stronger guarantee, since 20 L2 blocks settle faster",
        "The same guarantee, since depth means the same on any chain",
        "Finality, since the L2 finalizes every block it produces",
        "A soft promise from one party, not 20 blocks of consensus",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "An exchange is about to credit a user's deposit. What should it wait for before doing so?",
      options: [
        "One confirmation, since reorgs are one block deep",
        "The including block to reach finalized",
        "The receipt to exist with status 0x1",
        "Six confirmations, the usual rule of thumb",
      ],
      answer: 1,
    },
  ],

  "cursor-pagination": [
    {
      kind: "scenario",
      question: "An eth_getLogs call fails with 'query returned more than 10000 results'. What is the correct response?",
      options: [
        "Retry the same range, paging with an offset parameter",
        "Skip past the range and record a gap to fill in later",
        "Retry from the same fromBlock with a narrower toBlock",
        "Switch the filter's range to use the pending block tag",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why must the cursor be written in the same database transaction as the rows it covers?",
      options: [
        "eth_getLogs refuses a fromBlock lower than the previous query's",
        "A crash could otherwise leave the cursor out of step with the rows",
        "The database needs it to compute confirmations without RPC",
        "Block ranges must be contiguous for the logs bloom to work",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Which filter form sidesteps an endpoint's maximum block range limit?",
      options: [
        "A range from earliest to latest, which the node treats specially",
        "A filter with no address, since limits apply per contract",
        "The blockHash form, which pins exactly one block",
        "A filter made with eth_newFilter and drained by eth_getFilterChanges",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A backfill loop sets toBlock to latest for every window. What goes wrong?",
      options: [
        "The node rejects latest inside any bounded range query",
        "The window keeps growing, so results cannot be reproduced",
        "latest resolves to the finalized block, hiding recent logs",
        "Each window returns the same logs, since latest is cached",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "Parallel backfill shards cover disjoint ranges but overlap slightly at their seams. What makes the overlap harmless?",
      options: [
        "Loading the shards in block-number order",
        "Writing each shard to its own database",
        "Ending each shard's range at the pending tag",
        "Upserting rows on (blockHash, logIndex)",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "Compared with a database query API, which paging controls does eth_getLogs give the caller?",
      options: [
        "fromBlock and toBlock, or a single blockHash",
        "A LIMIT and an offset on each request",
        "A next-page token returned with each response",
        "A cursor that the node stores for each filter",
      ],
      answer: 0,
    },
  ],

  "historical-data": [
    {
      kind: "scenario",
      question: "A node answers eth_getBlockByNumber for a block from 2019 but fails eth_getBalance at that same block. What kind of node is it?",
      options: [
        "A pruned node that has already dropped that block's body",
        "An archive node whose transaction index is corrupted",
        "A full node, which keeps history but only recent state",
        "A light client, which keeps neither history nor state",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What data does the protocol deliberately discard after a fixed retention period?",
      options: [
        "Block headers, which are dropped once they are finalized",
        "Blob sidecars, which consensus clients keep for about 18 days",
        "Transaction receipts, which are discarded after execution",
        "State roots, which are recomputed whenever they are needed",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can eth_getProof fail at a deep block on a node that answers eth_getBalance for it?",
      options: [
        "The spec defines eth_getProof only for the state of the latest block",
        "Proofs need the transaction index, which is pruned first",
        "A reorg touched the account, which invalidates older proofs",
        "A flat storage layout can serve values but not rebuild trie nodes",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A Geth node still has an old block, yet eth_getTransactionByHash returns null for a transaction inside it. Why?",
      options: [
        "Its hash index covers about the last 2.35 million blocks",
        "History expiry removed that transaction but kept its block",
        "Transactions older than the finalized block are not queryable",
        "The transaction was reorged out, leaving the block in place",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What separates a chain's historical data from its historical state?",
      options: [
        "History covers the last 128 blocks; state covers everything older",
        "History is what was published; state is the result of executing it",
        "History lives on the consensus layer, state on the execution layer",
        "History is kept by archive nodes, state by ordinary full nodes",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "An execution client applies partial history expiry. What happens to its pre-Merge data?",
      options: [
        "Headers are dropped, while every body and receipt is kept",
        "All of it moves into the consensus client's blob sidecar store",
        "It is replaced by one state snapshot taken at the Merge block",
        "Bodies and receipts may be dropped, while every header is kept",
      ],
      answer: 3,
    },
  ],

  "etl-pipeline": [
    {
      kind: "cause",
      question: "Why should an ETL pipeline keep the raw log rows after decoding them?",
      options: [
        "Raw logs compress far better than the decoded columns do",
        "An ABI fix then becomes a re-transform, not a second extraction",
        "The node refuses to serve the same block range a second time",
        "Decoded rows have no column for the block hash they came from",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What column type suits an ERC-20 transfer amount in a warehouse table?",
      options: [
        "A 64-bit integer, since amounts are bounded by total supply",
        "A floating-point number, so the 18 decimals are preserved",
        "A 32-bit integer, since amounts are stored in log topics",
        "A wide decimal or bytes, since uint256 overflows BIGINT",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "Your pipeline must reconstruct internal value transfers. What extra data source does it need?",
      options: [
        "The logs bloom filter from each block header",
        "Call traces from trace_ or debug_ methods",
        "eth_getBlockReceipts with full transactions set",
        "The pending block, which lists internal calls",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "One table stores checksummed addresses and another stores lowercase hex. What happens when you join them on address?",
      options: [
        "The database raises a type error on the mixed case",
        "The join silently misses rows that should match",
        "It matches correctly, since hex is case-insensitive",
        "Checksums are verified and invalid rows are dropped",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "In a two-stage layout, what separates the raw layer from the derived layer?",
      options: [
        "Raw holds only finalized blocks; derived holds the head",
        "Raw is decoded with the ABI; derived keeps the original hex logs",
        "Raw is costly to reproduce; derived is cheap to rebuild from it",
        "Raw is rewritten by every reorg; derived never changes",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You plan to extract 20 million blocks at two calls per block. What mostly decides how long that takes?",
      options: [
        "The write throughput of your destination database",
        "The number of columns in the decoded schema",
        "How many event types your ABIs declare",
        "The endpoint's rate limits and your range sizing",
      ],
      answer: 3,
    },
  ],

  "indexing-database": [
    {
      kind: "consequence",
      question: "Every derived table references blocks(hash) with ON DELETE CASCADE. What does that give an indexer?",
      options: [
        "It no longer needs to store a durable cursor",
        "Rolling back a reorg becomes one delete on blocks",
        "Aggregates over the head stay consistent through reorgs",
        "Duplicate log rows are rejected on every retry",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Transaction-level rows are keyed on (block_hash, transaction_index) rather than the transaction hash. Why?",
      options: [
        "Transaction hashes are not returned by eth_getBlockReceipts",
        "Hashes change when a transaction is re-included after a reorg",
        "transaction_index is globally unique across the whole chain",
        "One transaction hash can appear under two competing branches",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "Which clock should derived rows be indexed on for time-series queries?",
      options: [
        "The wall-clock time the row was ingested",
        "The block timestamp from the header",
        "The time the RPC response was received",
        "The database transaction's commit time",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Which Postgres column type can hold every uint256 value exactly?",
      options: [
        "BIGINT",
        "DOUBLE PRECISION",
        "NUMERIC(78, 0)",
        "NUMERIC(38, 18)",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What changes about reorg handling when an indexer moves from Postgres to ClickHouse?",
      options: [
        "ClickHouse's merge engine rolls back orphaned blocks by itself",
        "Nothing, since both engines support foreign-key cascades",
        "With no cascading delete, rollback logic moves into the writer",
        "Reorgs stop mattering, because ClickHouse rows are immutable",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Dashboard totals wobble every time a single-block reorg happens. Which design choice causes that?",
      options: [
        "Logs keyed on (block_hash, log_index)",
        "Upserts written with ON CONFLICT DO NOTHING clauses",
        "Timestamps taken from the block header",
        "Aggregates computed over unsettled head blocks",
      ],
      answer: 3,
    },
  ],

  "the-graph": [
    {
      kind: "detail",
      question: "What determines which logs a subgraph's event handler receives?",
      options: [
        "The entity names declared in the subgraph's schema.graphql file",
        "The manifest's contract address and the event's signature hash",
        "The GraphQL queries that consumers send to the subgraph",
        "The order in which handlers appear in the mapping file",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why do call handlers need a different class of RPC endpoint than event handlers?",
      options: [
        "They need WebSocket subscriptions instead of plain HTTP",
        "They read pending transactions straight from the pool",
        "They rely on the tracing API, since a plain call emits no log",
        "They need the endpoint to expose eth_getProof for state reads",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A subgraph handler needs to know a token's decimals. What is it allowed to do?",
      options: [
        "Fetch a public token list over HTTPS",
        "Make an eth_call to the token contract",
        "Read an environment variable the operator sets",
        "Query another subgraph's GraphQL API",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A manifest leaves startBlock at 0 for a contract deployed years after genesis. What happens?",
      options: [
        "graph-node rejects the manifest as invalid",
        "The subgraph starts at the current head and skips history",
        "graph-node finds the deployment block and starts there",
        "The subgraph replays years of irrelevant blocks first",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "A wallet must confirm that a transaction just landed and also show the user's transfer history. Which source fits each job?",
      options: [
        "A subgraph for the first, eth_getTransactionReceipt for the second",
        "eth_getTransactionReceipt for the first, a subgraph for the second",
        "A subgraph for each, since it indexes every receipt at the head",
        "eth_getLogs for the first, and a block explorer for the second",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "A manifest's event string keeps the indexed markers. What does graph-node do with them?",
      options: [
        "Hashes them into topic0 together with each parameter's type",
        "Uses them to decide which entities each handler must write",
        "Strips them to hash topic0, then reads those arguments from topics",
        "Passes them to GraphQL so those fields become filterable later",
      ],
      answer: 2,
    },
  ],

  "block-explorer": [
    {
      kind: "detail",
      question: "Where does an explorer get the internal transactions it shows for a transaction?",
      options: [
        "From the logs array of each transaction's receipt",
        "From the transactionsRoot committed in the block header",
        "From call traces collected with trace_ or debug_ methods",
        "From the pending pool, captured before the block is mined",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "Of the three explorers you will meet, what distinguishes Otterscan from Etherscan and Blockscout?",
      options: [
        "It reads an Erigon node's ots_ namespace, with no separate index",
        "It is the only explorer that verifies contract source code",
        "It is a hosted, closed-source service that needs an API key",
        "It indexes finalized blocks alone, so reorged transactions never show",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "An explorer shows your transaction, and a minute later the page says it does not exist. What most likely happened?",
      options: [
        "The explorer's API key for that page expired in the meantime",
        "It was pruned for being older than the retention window",
        "Its block was reorged out and the explorer rewrote its history",
        "The sender replaced it with a higher-fee one after inclusion",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "An explorer shows verified source for a proxy address. Where does the behavior you care about actually live?",
      options: [
        "In the proxy's verified source shown on that page",
        "At the implementation address the proxy delegates to",
        "In the ABI the explorer published for the proxy",
        "In the constructor arguments recorded at deployment",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "A developer submits source and compiler settings to an explorer for verification. What does the explorer do with them?",
      options: [
        "Signs the source with its own key and stores it beside the address",
        "Runs the contract's test suite against a fork of the chain",
        "Hashes the source and checks it against a value in storage",
        "Recompiles them and compares the result to the deployed bytecode",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "An explorer builds token balances from indexed Transfer logs. What follows for the balances it shows?",
      options: [
        "They are exact, since every balance change emits a Transfer",
        "They cover only tokens whose source has been verified",
        "They can lag the chain or miss non-standard token behavior",
        "They update before the block containing the transfer lands",
      ],
      answer: 2,
    },
  ],
};
