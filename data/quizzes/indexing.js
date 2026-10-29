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
        "A full node that kept its history, but only recent state",
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

  "internal-transaction": [
    {
      kind: "scenario",
      question: "An exchange credits deposits by scanning for transactions whose to field is a deposit address. A customer sends ether to that address from a multisig. What happens?",
      options: [
        "It is credited normally, because the multisig transaction names the address",
        "It is missed, because the ether arrives through an internal call",
        "It is credited once the multisig's Transfer log has been indexed",
        "It is rejected, because a multisig cannot send plain ether",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does an internal transaction have no receipt of its own?",
      options: [
        "Receipts are issued only for transactions that emit logs",
        "Its receipt is pruned once the parent transaction is finalized",
        "Receipts for internal calls are kept by archive nodes, not full nodes",
        "It is a frame inside a signed transaction, which owns the receipt",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "In a reconciliation built from transactions and traces, how does a validator withdrawal differ from an internal transaction?",
      options: [
        "It is credited outside the EVM, so no trace contains it",
        "It appears as a CALL frame sent from the deposit contract",
        "It appears as a reward entry in every callTracer result",
        "It is traced as a SELFDESTRUCT from a system contract",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "An indexer sums the value field of every callTracer frame to measure the ether a transaction moved. What goes wrong?",
      options: [
        "It misses CREATE frames, since a creation carries no value",
        "It undercounts, since callTracer omits every zero-value frame",
        "It counts DELEGATECALL frames that inherit their parent's value",
        "It overcounts, since STATICCALL frames repeat the parent's value",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A router's inner CALL sends 0.5 ether and has no error field, but its parent frame reverted while the transaction as a whole succeeded. Did the recipient receive the ether?",
      options: [
        "Yes, because the inner frame itself finished without an error",
        "No, because the parent's revert undid everything beneath it",
        "Yes, because value transfers survive an enclosing frame's revert",
        "It depends on whether the recipient account holds any code",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Which frames does ots_getInternalOperations return on Erigon and Reth?",
      options: [
        "Every call frame, zero-value calls and the top-level call included",
        "Only value transfers that no enclosing revert later undid",
        "Only calls to precompiles and contracts created in that block",
        "Non-zero CALLs, creations and self-destructs below the top frame",
      ],
      answer: 3,
    },
  ],

  "graph-node": [
    {
      kind: "scenario",
      question: "A subgraph's mappings use eth_call while syncing from a 2021 startBlock, and its only provider is a pruned full node declared as archive. What happens?",
      options: [
        "graph-node refuses the deployment because the node is not archive",
        "graph-node serves the calls from values cached in its Postgres store",
        "The calls fail partway through the sync, where old state is missing",
        "The calls succeed, because eth_call pinned by hash needs no old state",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Which RPC method feeds graph-node's call handlers?",
      options: [
        "trace_filter over the block range and the watched contracts",
        "eth_getLogs with the handler's function selector as topic0",
        "eth_getBlockReceipts, filtered by each transaction's input",
        "eth_subscribe with a newPendingTransactions stream",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does graph-node pin a mapping's eth_call to the block hash rather than the block number?",
      options: [
        "Hash lookups are faster than number lookups on most clients",
        "Because eth_call rejects block numbers older than 128 blocks",
        "So the call result can be checked against the header's state root",
        "So a reorg at that height cannot make the call read another block",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does graph-node's reorg handling differ from that of a hand-written RPC indexer?",
      options: [
        "It waits for finality before writing anything, so it never reverts",
        "It reverts entity versions itself, so mappings hold no rollback code",
        "It asks every mapping to implement a revert handler for each entity",
        "It ignores reorgs below its threshold and keeps both branches",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What lets graph-node answer a GraphQL query as of an earlier block?",
      options: [
        "It re-runs the subgraph's mappings up to that block on demand",
        "It sends the query to an archive node pinned at that block",
        "Every entity version row records the blocks where it is current",
        "It keeps a full Postgres snapshot for every block it has indexed",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An operator gives a chain only a Firehose provider and removes every JSON-RPC provider. Which subgraphs break?",
      options: [
        "Those whose mappings call eth_call, which still needs JSON-RPC",
        "Those with event handlers, since Firehose does not deliver logs",
        "Those with call handlers, since Firehose blocks lack call traces",
        "None, since a Firehose endpoint also answers contract calls",
      ],
      answer: 0,
    },
  ],

  "firehose": [
    {
      kind: "detail",
      question: "Besides the block itself, what does every Firehose stream response carry?",
      options: [
        "A Merkle proof that the block belongs to the canonical chain",
        "The eth_getLogs filter that selected the block for delivery",
        "The block's position in the provider's rate-limit budget",
        "A step such as STEP_NEW or STEP_UNDO, and an opaque cursor",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why can a stock Geth binary not feed a Firehose reader?",
      options: [
        "Geth removed its live-tracing hooks after the v1.14 release",
        "Firehose reads Geth's database files, whose layout keeps changing",
        "The Firehose tracer lives in StreamingFast's builds, not upstream",
        "Stock Geth prints FIRE BLOCK lines only when run in archive mode",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does resuming a Firehose stream differ from resubscribing with eth_subscribe after a dropped connection?",
      options: [
        "Firehose resumes after its last message; a resubscription loses the gap",
        "Firehose restarts at the current head; a resubscription replays missed blocks",
        "Both replay missed blocks, but Firehose also delivers their receipts",
        "Both lose the gap, but Firehose reports how many blocks were missed",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A consumer writes each block's rows and then saves the cursor in a separate write. What can happen after a crash between the two?",
      options: [
        "The server rejects the stale cursor and restarts from genesis",
        "A STEP_UNDO message rolls the rows back automatically",
        "Nothing, because Firehose deduplicates blocks per consumer",
        "The block can be applied a second time when the stream resumes",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "What does an extended-detail Firehose block add over a base-detail one?",
      options: [
        "The receipts and event logs that base-detail blocks leave out",
        "Call frames and per-call balance, storage and nonce changes",
        "The beacon block and the proposer's signature over it",
        "Compression, so that the same data takes less storage",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A consumer disconnects while on a block that is orphaned before it reconnects with its saved cursor. What does it receive?",
      options: [
        "An error, since the cursor names a block no longer on the chain",
        "An undo for the orphaned block, then the canonical replacement",
        "The next canonical block, with the orphaned one silently skipped",
        "The whole stream again from the last irreversible block onward",
      ],
      answer: 1,
    },
  ],

  "substreams": [
    {
      kind: "detail",
      question: "What does a store module's update policy decide?",
      options: [
        "How values written to the same key combine across blocks",
        "How often the store is flushed to the sink's database tables",
        "Which blocks the store module may read as its input",
        "Whether the store's cache survives a change to its code",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why can Substreams split a long history into segments processed at the same time?",
      options: [
        "Each segment reads a different archive node, so nothing is shared",
        "Segments skip blocks without logs, so they rarely overlap in work",
        "Output depends only on inputs, and partial stores merge afterwards",
        "Segments run in development mode, which relaxes ordering rules",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A developer changes one line in a map module's Rust code and reruns the package. What happens to cached output?",
      options: [
        "Only the edited module recomputes; downstream reads its old cache",
        "The edited module and every module downstream of it recompute",
        "Nothing recomputes, because the module kept its name and version",
        "Everything recomputes from genesis, including unrelated modules",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "The SQL sink writes to Postgres tables that have no primary keys. What stops working?",
      options: [
        "Parallel backfill, which splits ranges by each table's key",
        "Cursor storage, which is keyed by each table's primary key",
        "Undoing rows from orphaned blocks when a reorg happens",
        "Nothing, since the sink adds a surrogate key to every table",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "In a Substreams-powered subgraph, what does graph-node consume?",
      options: [
        "A module's entity changes, in place of running event handlers",
        "Raw Firehose blocks, which its AssemblyScript mappings then decode",
        "SQL rows that a sink exported from a ClickHouse database",
        "eth_getLogs results that Substreams cached for the subgraph",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "How does a Substreams backfill differ from an eth_getLogs backfill?",
      options: [
        "It reads the same logs through a GraphQL layer rather than JSON-RPC",
        "It sees only logs, but avoids the endpoint's block range caps",
        "It needs an archive endpoint, where eth_getLogs never does",
        "It sees calls and state changes too, and scales by adding workers",
      ],
      answer: 3,
    },
  ],

  "log-index": [
    {
      kind: "scenario",
      question: "A backfill is pointed at a Geth node that finished syncing an hour ago, and wide eth_getLogs calls time out. What is the likely cause?",
      options: [
        "Geth rejects ranges wider than 10,000 blocks until they finalize",
        "Its log index is still being built, so Geth searches unindexed",
        "Header blooms are written only once the log index is complete",
        "The node pruned receipts during sync and is refetching them",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What does Geth's --history.logs flag set?",
      options: [
        "How many recent blocks keep their receipts on disk",
        "How many logs one eth_getLogs response may return",
        "How many recent blocks keep a transaction-hash index",
        "How many recent blocks the log search index covers",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why is a log index faster than header blooms for a wide query, when both lead to correct answers?",
      options: [
        "It maps each value to the blocks holding it, avoiding a header scan",
        "It removes the false negatives that blooms produce for busy blocks",
        "It lets the node skip checking candidate logs against receipts",
        "The header commits to it, so the node can trust it without checks",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "How does Reth answer a wide eth_getLogs range, compared with Geth?",
      options: [
        "With filter maps like Geth's, but indexed from genesis by default",
        "From Erigon-style inverted indexes that it downloads with snapshots",
        "By scanning header blooms within a per-request cap, with no index",
        "By refusing the range until an opt-in log index has been enabled",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An operator runs a Geth archive node with default flags and backfills logs from 2019. What should they expect?",
      options: [
        "Fast answers, since archive mode indexes logs back to genesis",
        "Errors, since archive mode switches the log index off entirely",
        "Empty results, since receipts that old are no longer stored",
        "Slow unindexed searches for blocks older than about a year",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A Nethermind node without its log index receives an eth_getLogs spanning more blocks than Receipt.MaxBlockDepth allows. What does the caller see?",
      options: [
        "A truncated result covering only the first 1,000 blocks",
        "An invalid-params error, code -32602, instead of results",
        "A slow answer while Nethermind builds the index on demand",
        "An empty array, because unindexed blocks are skipped",
      ],
      answer: 1,
    },
  ],

  "block-by-timestamp": [
    {
      kind: "scenario",
      question: "A governance snapshot must reflect balances as they stood at a proposal's start time T. Which block should the search return?",
      options: [
        "The first block with a timestamp at or after T",
        "The block closest to T, on whichever side it falls",
        "The last block with a timestamp at or before T",
        "The block whose number is T minus genesis over 12",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "How does a caller turn a post-Merge slot into an execution block number?",
      options: [
        "Call eth_getBlockByNumber with the slot number as the block number",
        "Divide the slot's start time by 12 and add the Merge block number",
        "Call eth_getBlockByHash with that slot's beacon block root",
        "Fetch the slot's beacon block and read its execution block_number",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "The Beacon API returns 404 for the slot that contains time T. What follows for the last block at or before T?",
      options: [
        "It does not exist yet, because that slot is still pending",
        "It is in an earlier slot, because that slot has no block",
        "It is the next block, which inherits the empty slot's time",
        "It has to be fetched from an archive beacon node instead",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "How does finding the block at time T on Arbitrum differ from doing it on mainnet?",
      options: [
        "Consecutive blocks can share a timestamp, so T can match a range",
        "Blocks there carry slot numbers, so arithmetic finds them exactly",
        "Timestamps there repeat L1's, so they advance in 12-second steps",
        "It offers a standard eth_ method that returns the block directly",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What does Erigon's erigon_getBlockByTimestamp return for a time that falls between two blocks?",
      options: [
        "The last block whose timestamp is at or before that time",
        "Whichever of the two blocks lies nearer to that time",
        "The first block whose timestamp is at or after that time",
        "An error, because the time matches no block exactly",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why does converting elapsed time to a block number at 12 seconds per block go wrong on mainnet?",
      options: [
        "Missed slots advance time without producing a block",
        "Proposers may set timestamps anywhere within a drift window",
        "The slot length changed at each network upgrade since the Merge",
        "Timestamps switched to milliseconds at the Merge",
      ],
      answer: 0,
    },
  ],

  "otterscan": [
    {
      kind: "scenario",
      question: "Otterscan is hosted on a company web server and configured with the node URL http://127.0.0.1:8545. What happens when remote colleagues open it?",
      options: [
        "The web server proxies their calls to the node on its own loopback",
        "Otterscan falls back to a public endpoint for remote viewers",
        "The pages load from Otterscan's built-in copy of the chain",
        "Each browser calls port 8545 on its own machine and finds no node",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A developer points Otterscan at a Reth archive node with ots enabled. Which part of the explorer fails?",
      options: [
        "Block pages, since Reth does not implement ots_getBlockDetails",
        "Address history, since the search methods are unimplemented",
        "Transaction pages, since Reth cannot return revert data",
        "Everything, since Reth reports an unsupported API level",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does Otterscan need no separate indexer or database?",
      options: [
        "It builds an index in the browser's local storage on first load",
        "It reads Etherscan's API for anything the node cannot answer",
        "The node answers address history from its own history indexes",
        "It shows blocks and transactions only, never address history",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does Otterscan differ from Blockscout in where the chain data lives?",
      options: [
        "Blockscout keeps its own copy of the chain; Otterscan asks the node",
        "Otterscan copies the chain into Postgres; Blockscout asks the node live",
        "Both copy the chain, but Otterscan keeps only the last 128 blocks",
        "Both ask the node live, but Blockscout adds a signature database",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What does a node's answer of 8 to ots_getApiLevel establish?",
      options: [
        "That every ots_ method up to level 8 is implemented",
        "That the node is Erigon, the only client that answers the call",
        "That the node keeps full archive state for tracing",
        "That the node claims level 8, not that every method works",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "The node answers curl requests, but Otterscan in the browser shows every RPC call failing. What is the likely missing setting?",
      options: [
        "The trace namespace, which every Otterscan page depends on",
        "CORS, since the browser blocks calls the node does not allow",
        "An API key, which Otterscan sends with every JSON-RPC request",
        "WebSocket support, since Otterscan never calls over HTTP",
      ],
      answer: 1,
    },
  ],

  "signature-directory": [
    {
      kind: "scenario",
      question: "A tool decodes calldata starting 0xa9059cbb with the newest 4byte.directory entry and shows workMyDirefulOwner. What went wrong?",
      options: [
        "Several signatures share the selector, and newest is not likeliest",
        "The tool hashed the calldata instead of reading its first four bytes",
        "The directory mislabels transfer, whose selector is different",
        "The contract is a proxy, so its selectors change on each upgrade",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "How does decoding with a contract's verified ABI differ from decoding with a signature directory?",
      options: [
        "The ABI covers events only; a directory covers functions too",
        "The ABI is that contract's own interface; a directory offers guesses",
        "The ABI is inferred from bytecode; a directory holds verified sources",
        "Both are exact, but the directory answers without an API key",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What does a directory entry for an event leave a decoder to work out?",
      options: [
        "The parameter types in the event's canonical form",
        "The event's name as it was declared in the source",
        "The 32-byte topic0 hash that the signature produces",
        "Which parameters are indexed and which are in data",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "An explorer decodes calls to a proxy using the proxy's own verified ABI. What does it show?",
      options: [
        "Correct names, since a proxy's ABI includes its implementation's",
        "Correct names, but only after the next implementation upgrade",
        "Missing or wrong names; the functions live in the implementation",
        "Nothing, since proxies cannot be verified on explorers at all",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "How does Sourcify's signature database gain new signatures without anyone submitting them?",
      options: [
        "From the ABIs of contracts verified on Sourcify",
        "By brute-forcing every selector seen on mainnet",
        "By mirroring 4byte.directory's entries each night",
        "From the 4byteTracer output of every public node",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why are function selector collisions common while topic0 collisions are practically absent?",
      options: [
        "Events are hashed with SHA-256, functions with keccak-256",
        "Directories reject event signatures that collide with others",
        "A selector keeps four bytes of the hash, topic0 all thirty-two",
        "Topic0 mixes in the emitting contract's address, making it unique",
      ],
      answer: 2,
    },
  ],

  "exchange-deposits": [
    {
      kind: "scenario",
      question: "A customer withdraws 0.75 ETH from a Safe multisig to their exchange deposit address, and the exchange's scanner reads only top-level transactions and Transfer logs. What happens to the deposit?",
      options: [
        "It is credited at once, because the Safe emits a Transfer log",
        "It is missed, because the inner call to it appears in traces alone",
        "It is credited late, once the Safe's own batch is finalized",
        "It is rejected, because contracts cannot send ether to EOAs",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does a pipeline that watches the ether balance of a deployed CREATE2 forwarder see no deposits?",
      options: [
        "Its receive function passes the ether on within the same call",
        "Forwarder balances are kept in the factory, not at the forwarder",
        "eth_getBalance reports zero for any address that holds code",
        "Ether sent to a forwarder waits in the EntryPoint as a credit",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "In an exchange pipeline, what separates detecting a deposit from crediting it?",
      options: [
        "Detection reads traces, while crediting reads only Transfer logs",
        "Detection runs on the hot wallet's node, crediting on a cold node",
        "Detection needs an archive node, while crediting needs a full node",
        "Detection is at the head; crediting waits for depth or finality",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "Which evidence should decide that an ERC-20 deposit really arrived?",
      options: [
        "Decoded transfer calldata together with a receipt status of 0x1",
        "A Transfer log whose token symbol matches the listed asset's",
        "A Transfer log from a contract on the supported-token list",
        "A balance increase shown on the token's page at an explorer",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A hot wallet's withdrawal at nonce 812 sits unmined with maxFeePerGas below the base fee, and 40 later withdrawals wait behind it. What clears the queue?",
      options: [
        "Rebroadcasting the 40 waiting withdrawals through another provider",
        "Sending withdrawal 813 again with a higher priority fee attached",
        "Waiting for the node to drop nonce 812 from its pool after a while",
        "Replacing nonce 812 with the same payout at a higher fee cap",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "An exchange makes deposits spendable at one confirmation, and a one-block reorg drops a deposit's transaction for good. What follows?",
      options: [
        "The credit outlives the ether, and the shortfall becomes a debt",
        "The node restores the deposit, since logs are never withdrawn",
        "The credit is removed automatically with the pending detection row",
        "The transaction turns into a withdrawal entry in the next block",
      ],
      answer: 0,
    },
  ],

  "stablecoin-payments": [
    {
      kind: "scenario",
      question: "A processor gives every customer the same USDC deposit address and asks payers to mention their account number. What goes wrong?",
      options: [
        "Wallets refuse to send to an address that already holds USDC",
        "USDC strips the payer's note before it emits the Transfer log",
        "A transfer carries no reference, so payers cannot be told apart",
        "The note is kept in the receipt, which providers prune within days",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "On Ethereum, how does USDT's blacklist differ from USDC's?",
      options: [
        "USDT blocks only receiving, while USDC blocks only sending",
        "USDT's freeze emits Blacklisted, while USDC's emits AddedBlackList",
        "USDT emits an indexed event, while USDC emits no event at all",
        "USDT blocks only sending, while USDC blocks sending and receiving",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why does a processor attribute an EIP-3009 USDC payment from the Transfer log rather than from the transaction's from field?",
      options: [
        "The from field is hidden for transactions that carry signatures",
        "The from field names the submitter who paid gas for the payer",
        "The from field holds the token contract whenever permits are used",
        "The from field is zero, because the payer signed no transaction",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "An invoice asks for 10.008422 USDT, and a log from the real USDT contract delivers 9.008422 to the invoice address. What is the usual explanation?",
      options: [
        "USDT's transfer fee was charged and paid to the contract owner",
        "The paying exchange deducted its own fee from the amount sent",
        "The watcher picked up a look-alike token using USDT's symbol",
        "The rest is still pending and will arrive in a later receipt",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A payout contract calls USDT's transfer through a standard interface that expects a bool return value. What happens?",
      options: [
        "The call succeeds, and the contract reads the result as false",
        "The tokens move, but no Transfer log is emitted for the payout",
        "The call reverts while decoding the token's empty return data",
        "The call succeeds only when the recipient is on the blacklist",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "Circle Mint credits Ethereum deposits after 12 confirmations, while CCTP waits for finality before attesting a burn. What explains the difference?",
      options: [
        "A burn reorged out after its mint would leave tokens on both chains",
        "CCTP mostly runs on rollups, where 12 blocks pass in mere seconds",
        "Mint deposits can be reversed by Circle, so their depth hardly matters",
        "The finalized tag is unavailable to services that watch for deposits",
      ],
      answer: 0,
    },
  ],

  "accounting-reconciliation": [
    {
      kind: "cause",
      question: "Why must both sides of a period-end balance check be read at a resolved block number rather than at latest?",
      options: [
        "latest moves between the two reads, so they describe two moments",
        "latest is served from the transaction pool, so it counts pending spends",
        "latest names the finalized block, which trails the period end by minutes",
        "latest is rejected by eth_getBalance when the endpoint is an archive",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "An address that receives staking payouts reconciles from its transactions and traces, yet the ledger ends below eth_getBalance. What was most likely missed?",
      options: [
        "Base fees returned to it whenever blocks were less than full",
        "Internal transfers hidden beneath DELEGATECALL frames",
        "Gas refunds paid back after its own reverted transactions",
        "Gwei credits listed in each block's withdrawals array",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does Lido's recommended stETH accounting differ from summing stETH Transfer events?",
      options: [
        "It sums Transfer events, but adds 1 or 2 wei back to each one",
        "It tracks wstETH balances, which rebase daily at each oracle report",
        "It tracks shares, which the daily rebase leaves unchanged",
        "It tracks the oracle's daily reports, which emit Transfer events",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An auditor asks a full node for an address's ETH balance at last quarter's closing block. What happens?",
      options: [
        "It answers 0x0, since the account is absent from that old state",
        "It answers with today's balance, as the nearest state it holds",
        "It answers correctly, since every block's balances are retained",
        "It returns an error, because that state has been pruned away",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A ledger agrees with eth_getBalance at the start of a year and disagrees at its end. What is the efficient way to find the first divergent block?",
      options: [
        "Trace every block of the year and diff each balance change",
        "Re-read the address's history from a second explorer's API",
        "Bisect the range, comparing ledger and node at each midpoint",
        "Sum the year's Transfer logs and compare the total to the gap",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Which charge does an OP Stack sender pay that mainnet's gasUsed times effectiveGasPrice formula leaves out?",
      options: [
        "A blob fee, which OP Stack charges on every transaction it orders",
        "The l1Fee on the receipt, for publishing the transaction's data",
        "The base fee, which effectiveGasPrice leaves out on rollups",
        "A withdrawal fee charged when the block's batch settles on L1",
      ],
      answer: 1,
    },
  ],

  "chain-analytics": [
    {
      kind: "scenario",
      question: "A pipeline gets a block and its receipts from one backend and trace_block from another behind the same load balancer, and the block hashes differ. What should it do?",
      options: [
        "Keep the receipts and patch the traces in on a later pass",
        "Discard the batch and fetch it again until the hashes agree",
        "Store both versions and let the next parentHash pick one",
        "Accept the traces, since trace_block reads the canonical head",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What separates a node's answer about an address from a compliance product's risk score for it?",
      options: [
        "The node gives facts, while the score is a model built on them",
        "The node signs its answer, while the score carries no signature",
        "The node reports clusters, while the score covers one address",
        "The node updates daily, while the score follows every block",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What does the Chainalysis on-chain sanctions oracle return for an address designated after its last update?",
      options: [
        "It reverts, because the contract has been removed from the chain",
        "It returns true, since unknown addresses are flagged by default",
        "It returns false, because its list is no longer being maintained",
        "It forwards the query on to Chainalysis's address screening API",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A pipeline counts every trace frame that carries value and has no error of its own as a transfer. What does that do to an exposure graph?",
      options: [
        "It drops every transfer made by contracts created in that block",
        "It merges clusters whenever two frames share a transaction hash",
        "It hides every transfer whose value was inherited by DELEGATECALL",
        "It adds hops for frames whose parent reverted and moved nothing",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A team needs pre-Merge receipts for a full backfill and wants to avoid millions of RPC calls. Which source supplies them in verifiable batches?",
      options: [
        "Consensus era files, which carry post-Merge execution payloads",
        "Era1 files holding blocks and receipts, 8,192 blocks apiece",
        "Firehose base-detail blocks streamed from a stock Geth binary",
        "A Dune warehouse export of its raw ethereum.traces table",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does an analytics pipeline check per block that receipts equal transactions, even after confirming the block exists?",
      options: [
        "Receipts are regenerated on every request, so their count drifts",
        "Blocks below finalized can still change their transaction count",
        "Providers sample receipts on purpose to stay within their quotas",
        "Its logs or traces arrive truncated even when the block itself exists",
      ],
      answer: 3,
    },
  ],

  "address-history": [
    {
      kind: "detail",
      question: "Where does an ERC-4337 smart account's activity show up when a txlist query for the account comes back empty?",
      options: [
        "In the bundler's pool, which archive nodes keep permanently",
        "In the withdrawals array of each block that carried its bundle",
        "In eth_getTransactionCount, which counts each of its operations",
        "In the EntryPoint's UserOperationEvent logs, as the sender",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "An indexer queries eth_getLogs for Transfer events with an address in topics[1] and calls the result the address's token history. What is missing?",
      options: [
        "Every transfer the address received, which sits in topics[2]",
        "Every transfer to it from contracts, which sits in the data field",
        "Every transfer made before the logs bloom joined block headers",
        "Every transfer above 10,000 tokens, which providers strip out",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does no standard JSON-RPC method return all of an address's transactions?",
      options: [
        "Full nodes prune address history after the most recent 128 blocks",
        "The logs bloom records senders, but only for the latest blocks",
        "Nodes look blocks and transactions up by number and hash alone",
        "Address history lives only in the consensus client's database",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does Erigon's trace_filter differ from the ones in Reth and Besu?",
      options: [
        "Erigon replays every block, while they look matches up in indexes",
        "Erigon looks matches up in indexes, while they replay every block",
        "Erigon has no range cap, while they reject ranges over a default",
        "Erigon returns nested call trees, while they return flat lists",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "An account signs an EIP-7702 authorization that a sponsor submits on its behalf. What does that do to a nonce-based completeness check?",
      options: [
        "The nonce rises with no outgoing transaction from that account",
        "The nonce stops counting, since the account now has code instead",
        "The nonce falls back by one when the delegation is cleared later",
        "The nonce is copied over to the sponsor who sent the transaction",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A wallet shows a history built from logs that includes a zero-value USDC transfer to an address matching the first and last characters of the user's usual payee. What is it?",
      options: [
        "A failed payment that the wallet will retry at a higher fee",
        "An allowance check that every USDC transferFrom emits first",
        "Address-poisoning spam that the user must not copy from",
        "A reorged payment whose log has not yet been marked removed",
      ],
      answer: 2,
    },
  ],

  "portfolio-tracker": [
    {
      kind: "scenario",
      question: "A wallet finds balances by calling balanceOf for every contract in a curated token list. A user receives a token that is not on the list. What does the wallet show for it?",
      options: [
        "The new balance, because balanceOf is asked of every token contract",
        "Nothing, because discovery never put that contract on the list",
        "The new balance, as soon as its Transfer log reaches finality",
        "An error, because a token outside the list has no decimals",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "How does reading 300 balances through Multicall3's aggregate3 differ from sending them as a JSON-RPC batch?",
      options: [
        "It returns decoded token amounts instead of raw 32-byte words",
        "It runs every read in one execution against a single block",
        "It escapes the node's gas cap because every read is a view",
        "It lets each read pick its own block number inside the call",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can no single standard JSON-RPC call return every token an address holds?",
      options: [
        "Providers disable that method because its responses grow too large",
        "Token balances sit in receipts, which nodes prune after a while",
        "The state trie hashes every key, which blocks lookups by holder",
        "Each balance lives in its own token contract's storage, by holder",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A tracker packs all 2,000 candidate tokens of a large holder into one aggregate3 call. What is the likely result?",
      options: [
        "The call runs past the node's eth_call gas cap and fails as a whole",
        "The node splits the call into smaller batches and returns them in order",
        "Multicall3 quietly drops the reads that would exceed the limit",
        "The provider counts it as one request and returns every balance",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What does the BalanceChecker contract return for a token address that has no code?",
      options: [
        "A revert that aborts the whole balances call for every token",
        "The holder's ether balance in place of the missing token's",
        "Zero, the same word that a genuinely empty balance produces",
        "The largest uint256 value, used as an explicit failure marker",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A team plans 90-day net-worth charts built only from alchemy_getTokenBalances. What goes wrong?",
      options: [
        "The method keeps 30 days of history, so older points come back empty",
        "The method answers in US dollars, so prices end up counted twice",
        "The method takes no block parameter, so it answers for the present",
        "The method serves finalized blocks, so the latest days always lag",
      ],
      answer: 2,
    },
  ],

  "airdrop-rewards": [
    {
      kind: "scenario",
      question: "An airdrop backfill gets an empty eth_getLogs result for a 2021 block range. What should the pipeline confirm before recording no activity?",
      options: [
        "That the range was finalized before the logs were requested",
        "That the endpoint still holds receipts for that block range",
        "That the token emitted Approval events in the same range",
        "That the block hashes have not changed since the snapshot",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Why does OpenZeppelin's StandardMerkleTree hash each leaf twice?",
      options: [
        "So that the root fits in one storage slot on every chain",
        "So that an inner node can never be presented as a leaf",
        "So that proofs verify in either order of the two siblings",
        "So that one address can appear in several separate leaves",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A campaign rewards in-range liquidity. A position covers ticks -60 to 60, and the pool's tick sits at 90 for two days. What does the position earn on those days?",
      options: [
        "Its usual share, since all deposited liquidity counts the same",
        "Half its share, because one of its two tokens is still deposited",
        "Nothing, because its liquidity is inactive while out of range",
        "Double its share, because fewer positions compete on those days",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A user claims from Merkl with a proof taken from a tree posted 30 minutes ago. What happens?",
      options: [
        "It succeeds, because a posted root is valid from the same block",
        "It pays half, because the dispute period splits new rewards",
        "It queues, and the contract pays out once the period ends",
        "It reverts, because getMerkleRoot still returns the old root",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does a leaf in Merkl's Distributor differ from a leaf in Uniswap's MerkleDistributor?",
      options: [
        "It carries an index, and a claim sets one bit in a bitmap",
        "It carries a per-epoch amount, and a claim resets it to zero",
        "It carries a signature, and a claim recovers the user's address",
        "It carries a running total, and a claim pays the difference",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why does Merkl compare event-derived totals with on-chain reads such as totalDebt?",
      options: [
        "State can change without a log, so events alone can drift",
        "Events are pruned sooner than state, so reads fill the gaps",
        "Reads cost less than logs, so they replace most event scans",
        "Events cannot be filtered by user, so reads assign amounts",
      ],
      answer: 0,
    },
  ],
};
