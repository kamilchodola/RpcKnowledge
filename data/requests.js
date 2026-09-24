// Category: Requests — the concrete JSON-RPC methods and namespaces, what they
// take, what they return, and how a node answers them.

export const topics = [
  {
    id: "eth-block-number",
    title: "eth_blockNumber",
    category: "requests",
    aliases: ["blockNumber", "eth_blockNumber", "block height", "chain height", "head number", "how far along is the node"],
    summary: "`eth_blockNumber` takes no parameters and returns the number of the most recent [[block|block]] this node currently considers canonical, as a [[hex-encoding|hex QUANTITY]].",
    sections: [
      {
        heading: "What it does",
        paragraphs: [
          "The request carries an empty `params` array and the result is a single QUANTITY such as `0x12d4f1c`. That number is the height of the node's own head: the block most recently accepted by [[fork-choice|fork choice]] and pushed to the [[execution-client|execution client]] over the [[engine-api|Engine API]]. It is an execution block number, not a consensus slot; slots advance every 12 seconds whether or not a block is produced, so the two counters drift apart permanently. See [[slot-epoch|slots and epochs]].",
          "The answer says nothing about how settled that block is. `eth_blockNumber` has no block parameter and no tag; if you want the justified or finalized height you must ask for a block with the `safe` or `finalized` [[block-tag|tag]] and read its `number`. The value can also go down: a [[reorg|reorganization]] that replaces the head with a shorter branch lowers it, and a node restarted from an unclean shutdown can briefly report an earlier height while it replays.",
        ],
      },
      {
        heading: "How the node answers",
        paragraphs: [
          "This is the cheapest method in the API. The client keeps the head block number in memory, so answering needs no trie lookup, no disk read, and no [[state|state]] at all. A [[pruned-node|pruned node]] and an [[archive-node|archive node]] answer it identically and equally fast, which is why it is the default liveness probe and why [[rpc-provider|providers]] usually price it at their lowest tier.",
          "A node that is still syncing answers anyway, reporting the head of whatever chain segment it has imported so far. During [[snap-sync|snap sync]] that number can jump to near the network head long before the node holds enough [[state|state]] to serve [[eth-call|eth_call]] or [[eth-get-balance|eth_getBalance]] for it. Pair the call with [[eth-syncing|eth_syncing]] and with the head block's `timestamp` before deciding an endpoint is usable.",
        ],
      },
      {
        heading: "Practical use",
        paragraphs: [
          "Use it to measure [[head-lag|head lag]] between endpoints, to choose the `toBlock` of an [[eth-get-logs|eth_getLogs]] scan, and to report progress in an [[indexer|indexer]]. Do not use it as a new-block trigger by polling in a tight loop; one [[eth-subscribe|eth_subscribe]] to `newHeads` over a [[websocket-transport|WebSocket]] delivers the same information with the header attached and no wasted round trips.",
          "When a result must be reproducible, treat the number as a starting point only. Fetch the block with [[eth-get-block-by-number|eth_getBlockByNumber]], keep its [[block-hash|hash]], and pass that hash or the explicit number to every later call, so a [[load-balancer|load balancer]] sending the next request to a different backend cannot silently change which chain you are reading.",
        ],
      },
    ],
    example: {
      title: "The cheapest call in the API",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_blockNumber\",\"params\":[]}\n\n// response\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x12d4f1c\"}",
      note: "`0x12d4f1c` is 19,746,588 in decimal; decode it as an integer rather than comparing the hex strings, because `0x9` and `0x10` do not sort as text.",
    },
    pitfalls: [
      "Reading it as the network's head; it is one node's head, and a backend that has fallen behind reports a lower number without any error.",
      "Assuming it only ever increases, then storing it as a permanent cursor; a reorg lowers it and re-uses the numbers for different blocks.",
      "Concluding an endpoint is healthy because the call succeeds; a node with no peers keeps returning its last imported height forever.",
      "Polling it every 200 ms to detect new blocks, which burns rate limit for information a `newHeads` subscription pushes for free.",
    ],
    related: ["eth-get-block-by-number", "eth-syncing", "head-lag", "block-tag", "reorg", "eth-subscribe", "health-check", "hex-encoding"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: eth_blockNumber", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_blocknumber" },
    ],
  },
  {
    id: "eth-get-block-by-number",
    title: "eth_getBlockByNumber / ByHash",
    category: "requests",
    aliases: ["getBlockByNumber", "getBlockByHash", "eth_getBlockByNumber", "eth_getBlockByHash", "fetch a block", "fullTransactions"],
    summary: "`eth_getBlockByNumber` and `eth_getBlockByHash` return one [[block|block]] object — every [[block-header|header]] field plus the transaction list and withdrawals — or `null` if the node does not know that block.",
    sections: [
      {
        heading: "Parameters and result",
        paragraphs: [
          "Both methods take two parameters. The first identifies the block: a number or a [[block-tag|tag]] such as `latest`, `safe`, `finalized`, `earliest`, or `pending` for `eth_getBlockByNumber`, and a 32-byte [[block-hash|block hash]] for `eth_getBlockByHash`. The second is a boolean, usually written `fullTransactions`: `false` returns the `transactions` array as bare hashes, `true` replaces each entry with the complete transaction object that [[eth-get-transaction-by-hash|eth_getTransactionByHash]] would return.",
          "The result carries the header verbatim — `parentHash`, `stateRoot`, `transactionsRoot`, `receiptsRoot`, `logsBloom`, `number`, `gasLimit`, `gasUsed`, `timestamp`, `baseFeePerGas`, `withdrawalsRoot`, `blobGasUsed`, `excessBlobGas`, `parentBeaconBlockRoot`, `requestsHash` — plus computed extras: `hash`, `size` in bytes, `uncles` (always empty since [[the-merge|the Merge]]), and `withdrawals`. Post-Merge blocks report `difficulty` as `0x0`, `nonce` as `0x0000000000000000`, and reuse the `mixHash` slot to carry `prevRandao`. `totalDifficulty` froze at the terminal value and some clients have stopped returning it.",
        ],
      },
      {
        heading: "How the node answers",
        paragraphs: [
          "Neither method touches [[state|state]], so a [[pruned-node|pruned node]] serves any block it still stores just as well as an [[archive-node|archive node]]. The client resolves the identifier to a header, and loads the body from the block store only when the transaction list is needed. Passing `true` for `fullTransactions` is the expensive part: a busy block holds a few hundred transactions and the response can exceed a megabyte, which is why providers bill it higher and may reject it inside a [[batch-request|batch]].",
          "A node that has applied [[history-expiry|history expiry]] to pre-Merge data returns `null` for those old blocks even though it validated them years ago. `eth_getBlockByHash` can also return a block that is not on the canonical chain: clients keep recent side-branch blocks, so a hash from a [[reorg|reorged]] branch may still resolve, with a `number` that now belongs to a different block.",
        ],
      },
      {
        heading: "Practical use",
        paragraphs: [
          "The standard head-tracking loop fetches `latest` with `fullTransactions` set to `false`, then compares the new block's `parentHash` against the `hash` you stored last time. A mismatch is a reorg, and you walk backwards by `parentHash` until the hashes agree again to find the fork point. This is cheaper and more reliable than comparing numbers, which repeat across branches.",
          "`timestamp` is the proposer's declared slot time in seconds and is the usual way to map a block to wall-clock time; it advances in multiples of 12 seconds with gaps for missed slots. When several reads must describe one consistent moment, take the `hash` from this call and pass it as an [[eip|EIP-1898]] `{\"blockHash\": …}` object to [[eth-call|eth_call]] and the other state methods instead of repeating `latest`.",
        ],
      },
    ],
    example: {
      title: "A block header with transaction hashes only",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBlockByNumber\",\"params\":[\"0x12d4f1c\",false]}\n\n// result (abridged)\n{\n  \"number\": \"0x12d4f1c\",\n  \"hash\": \"0x9b83c12c69edb74f6c8dd5d052765c1adf940e320bd1291696e6fa07829eee71\",\n  \"parentHash\": \"0x7d5a4369…f0d3\",\n  \"stateRoot\": \"0x4f2c8e11…8a1b\",\n  \"transactionsRoot\": \"0x8c11a6df…d7e0\",\n  \"receiptsRoot\": \"0x2ae93b0c…31c4\",\n  \"logsBloom\": \"0x…\",\n  \"miner\": \"0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5\",\n  \"difficulty\": \"0x0\",\n  \"nonce\": \"0x0000000000000000\",\n  \"mixHash\": \"0x6d2b41c9…a17f\",\n  \"gasLimit\": \"0x2255100\",\n  \"gasUsed\": \"0x1b7e2a1\",\n  \"timestamp\": \"0x67f3a2b0\",\n  \"baseFeePerGas\": \"0x3b9aca00\",\n  \"withdrawalsRoot\": \"0x1ac5f2d0…9e77\",\n  \"blobGasUsed\": \"0x60000\",\n  \"excessBlobGas\": \"0x3200000\",\n  \"parentBeaconBlockRoot\": \"0xd41e9a72…04b3\",\n  \"size\": \"0x1e8c3\",\n  \"uncles\": [],\n  \"withdrawals\": [ { \"index\": \"0x2f81b4\", \"validatorIndex\": \"0xa3f1\", \"address\": \"0x388c818ca8b9251b393131c08a736a67ccb19297\", \"amount\": \"0xd4f2a1\" } ],\n  \"transactions\": [ \"0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060\", \"0x9d0e77a1…4a12\" ]\n}",
      note: "Switching the boolean to `true` replaces each hash with a full transaction object and can grow the response past a megabyte.",
    },
    pitfalls: [
      "Requesting `fullTransactions: true` when you only need the header, which multiplies response size and provider cost for data you discard.",
      "Treating a block number as a stable key; after a reorg the same number names a different block, so store the hash alongside it.",
      "Reading `mixHash` as proof-of-work mixing data; post-Merge it carries `prevRandao`, the consensus-layer randomness for that slot.",
      "Assuming `null` means the block does not exist; it can equally mean this node pruned or expired it, or has not synced that far.",
      "Expecting `withdrawals` on pre-Shapella blocks; the field is absent before EIP-4895 activated in April 2023.",
    ],
    related: ["block", "block-header", "block-hash", "block-tag", "reorg", "eth-get-block-receipts", "eth-get-transaction-by-hash", "history-expiry", "withdrawals", "eth-subscribe"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: eth_getBlockByNumber", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_getblockbynumber" },
      { title: "EIP-4895: Beacon chain push withdrawals as operations", url: "https://eips.ethereum.org/EIPS/eip-4895" },
    ],
  },
  {
    id: "eth-get-block-receipts",
    title: "eth_getBlockReceipts",
    category: "requests",
    aliases: ["getBlockReceipts", "eth_getBlockReceipts", "all receipts in a block", "bulk receipts"],
    summary: "`eth_getBlockReceipts` returns every [[transaction-receipt|receipt]] in one [[block|block]] as a single array, replacing one [[eth-get-transaction-receipt|eth_getTransactionReceipt]] call per transaction.",
    sections: [
      {
        heading: "What it does",
        paragraphs: [
          "The method takes one parameter, a block identifier: a number, one of the [[block-tag|tags]] `latest`, `safe`, `finalized`, `earliest`, `pending`, or a 32-byte [[block-hash|block hash]]. The result is an array of receipt objects in `transactionIndex` order, each identical in shape to what [[eth-get-transaction-receipt|eth_getTransactionReceipt]] returns: `transactionHash`, `transactionIndex`, `blockHash`, `blockNumber`, `from`, `to`, `status`, `gasUsed`, `cumulativeGasUsed`, `effectiveGasPrice`, `contractAddress`, `type`, `logs`, `logsBloom`, and for blob transactions `blobGasUsed` and `blobGasPrice`.",
          "An empty block returns `[]`. A block the node does not have returns `null`, which is a different answer and worth distinguishing in code. The method went through the [[execution-apis|execution-apis]] standardization process in 2023 after clients had shipped incompatible versions of the same idea, so it is now specified rather than a client extension.",
        ],
      },
      {
        heading: "How the node answers",
        paragraphs: [
          "[[execution-client|Execution clients]] store receipts grouped by block, not by transaction hash. Fetching a single receipt therefore costs a hash-to-block index lookup plus a read of the whole block's receipt list, of which all but one entry is thrown away. This method reads that list once and returns it, so a 300-transaction block costs roughly one disk read instead of 300 index lookups and 300 reads of the same data. Derived fields such as `effectiveGasPrice` and `contractAddress` are recomputed from the block's [[eip-1559|base fee]] and the transaction list.",
          "No [[state|state]] is required, only history, so a [[pruned-node|pruned node]] serves recent blocks fine. Blocks whose receipts were dropped by [[history-expiry|history expiry]] are unavailable. The transaction-index window that limits `eth_getTransactionReceipt` does not apply, because receipts are read by block rather than looked up by transaction hash, which makes this method the way back to receipts that have aged out of that index. The response is large: a full block of [[event-log|logs]] can run to several megabytes of JSON, which collides with provider response-size caps far more often than the equivalent single-receipt calls do.",
        ],
      },
      {
        heading: "Practical use",
        paragraphs: [
          "This is the method an [[indexer|indexer]] should use for a block-by-block scan. Combined with [[eth-get-block-by-number|eth_getBlockByNumber]] it gives you every transaction and every log of a block in two calls, with `blockHash` on each receipt so you can attribute the whole batch to one branch and roll it back atomically after a [[reorg|reorg]]. Compare that with [[eth-get-logs|eth_getLogs]], which returns logs across a range but omits `status`, `gasUsed`, and transactions that emitted nothing.",
          "Support is broad — [[geth|Geth]], [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]], and [[besu|Besu]] all implement it — but older gateway and caching layers in front of a node sometimes do not, and answer `method not found`. Probe it once at startup and fall back to per-transaction receipts; see [[endpoint-capabilities|endpoint capabilities]].",
        ],
      },
    ],
    example: {
      title: "Every receipt of one block in a single call",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBlockReceipts\",\"params\":[\"0x12d4f1c\"]}\n\n// result: one entry per transaction, in transactionIndex order (abridged)\n[\n  {\n    \"transactionHash\": \"0x9d0e77a1…4a12\",\n    \"transactionIndex\": \"0x0\",\n    \"blockHash\": \"0x9b83c12c…ee71\",\n    \"blockNumber\": \"0x12d4f1c\",\n    \"status\": \"0x1\",\n    \"gasUsed\": \"0x5208\",\n    \"cumulativeGasUsed\": \"0x5208\",\n    \"effectiveGasPrice\": \"0x4a817c800\",\n    \"type\": \"0x2\",\n    \"contractAddress\": null,\n    \"logs\": []\n  },\n  {\n    \"transactionHash\": \"0x5c504ed4…22060\",\n    \"transactionIndex\": \"0x1\",\n    \"status\": \"0x1\",\n    \"gasUsed\": \"0xb3d9\",\n    \"cumulativeGasUsed\": \"0x105e1\",\n    \"logs\": [ { \"address\": \"0xA0b8…eB48\", \"topics\": [\"0xddf252ad…3ef\"], \"logIndex\": \"0x0\", \"removed\": false } ]\n  }\n]",
      note: "`cumulativeGasUsed` accumulates down the array, so the last entry equals the block's `gasUsed`; a good sanity check that you received the whole block.",
    },
    pitfalls: [
      "Treating `[]` and `null` as the same answer; the first means an empty block, the second means the node cannot serve that block at all.",
      "Re-sorting the array by transaction hash or by log index; the array is already in execution order, and that order is what `cumulativeGasUsed` depends on.",
      "Requesting `latest` in a scan loop, which can return a different block on each call and leave gaps; pass explicit numbers or hashes.",
      "Assuming every endpoint implements it and hard-failing on `method not found` instead of falling back to per-transaction receipts.",
    ],
    related: ["transaction-receipt", "eth-get-transaction-receipt", "eth-get-block-by-number", "indexer", "eth-get-logs", "reorg", "history-expiry", "endpoint-capabilities", "etl-pipeline"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
    ],
  },
  {
    id: "eth-get-transaction-by-hash",
    title: "eth_getTransactionByHash",
    category: "requests",
    aliases: ["getTransactionByHash", "eth_getTransactionByHash", "lookup a transaction", "transaction object", "is my transaction pending"],
    summary: "`eth_getTransactionByHash` returns the [[transaction|transaction]] object for a 32-byte hash — including one still sitting in the node's [[mempool|pool]], where `blockHash`, `blockNumber`, and `transactionIndex` are `null` — or `null` if the node has never seen it.",
    sections: [
      {
        heading: "Parameters and result",
        paragraphs: [
          "The single parameter is the transaction hash. The result describes the signed message itself, not its outcome: `from`, `to` (`null` for a contract creation), `value`, `gas` (the limit the sender set), `input`, `nonce`, `hash`, `chainId`, `type`, and the [[ecdsa-signature|signature]] as `r`, `s`, and `v` or `yParity`. Fee fields follow the [[transaction-types|type]]: legacy `0x0` and access-list `0x1` carry `gasPrice`; `0x2` carries `maxFeePerGas` and `maxPriorityFeePerGas`; `0x3` adds `maxFeePerBlobGas` and `blobVersionedHashes`; `0x4` adds `authorizationList` for [[eip-7702|set code transactions]]. Types `0x1` and above also carry `accessList`.",
          "Three fields answer where the transaction is. When all of `blockHash`, `blockNumber`, and `transactionIndex` are `null`, the node holds the transaction in its pool but no block contains it. When they are set, it is mined in the block this node currently calls canonical. The sibling methods `eth_getTransactionByBlockNumberAndIndex` and `eth_getTransactionByBlockHashAndIndex` fetch the same object by position instead of by hash.",
        ],
      },
      {
        heading: "How the node answers",
        paragraphs: [
          "The client checks two places: the transaction pool, and an on-disk index from transaction hash to the block number and position that contain it. Neither needs [[state|state]], so a [[pruned-node|pruned node]] answers for any indexed transaction. That index is finite. [[geth|Geth]]'s `--history.transactions` keeps roughly the last 2,350,000 blocks by default and returns `null` beyond it, and a node under [[history-expiry|history expiry]] cannot serve pre-Merge transactions at all. An [[indexer|indexer]] or a [[block-explorer|block explorer]] is the practical source for very old hashes.",
          "For a blob transaction the result contains `blobVersionedHashes` but never the blobs. The sidecar data lives on the [[consensus-layer|consensus layer]] and is fetched from the [[beacon-api|Beacon API]] blob sidecar route, is retained for roughly 18 days, and is not part of any `eth_` response. See [[blob|blobs]].",
        ],
      },
      {
        heading: "Practical use",
        paragraphs: [
          "Use it to distinguish 'the node never received my transaction' from 'it is queued'. After [[eth-send-raw-transaction|eth_sendRawTransaction]], a `null` here means the transaction did not reach this node's pool — it was dropped, evicted, or you are polling a different backend than you sent to; see [[head-lag|head consistency]]. A non-null result with `blockNumber` still `null` means it is waiting, usually because its fee is below the current [[eip-1559|base fee]] or a lower [[nonce|nonce]] from the same sender is missing.",
          "For the outcome — success, [[gas|gas]] consumed, [[event-log|logs]] — you need [[eth-get-transaction-receipt|eth_getTransactionReceipt]] instead. A transaction object exists as soon as the node accepts it; a receipt exists only after execution. Re-encoding the returned object and re-hashing it will not always reproduce the original raw bytes, so keep the raw transaction you signed if you need to rebroadcast it.",
        ],
      },
    ],
    example: {
      title: "A mined EIP-1559 transaction",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getTransactionByHash\",\"params\":[\"0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060\"]}\n\n// result (abridged)\n{\n  \"hash\": \"0x5c504ed4…22060\",\n  \"blockHash\": \"0x9b83c12c…ee71\",\n  \"blockNumber\": \"0x12d4f1c\",\n  \"transactionIndex\": \"0x1\",\n  \"from\": \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\n  \"to\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  \"value\": \"0x0\",\n  \"nonce\": \"0x1f4\",\n  \"gas\": \"0x186a0\",\n  \"input\": \"0xa9059cbb000000000000000000000000388c818ca8b9251b393131c08a736a67ccb192970000000000000000000000000000000000000000000000000000000005f5e100\",\n  \"type\": \"0x2\",\n  \"chainId\": \"0x1\",\n  \"maxFeePerGas\": \"0x6fc23ac00\",\n  \"maxPriorityFeePerGas\": \"0x3b9aca00\",\n  \"accessList\": [],\n  \"yParity\": \"0x1\",\n  \"r\": \"0x8d1f…c3a2\",\n  \"s\": \"0x2b77…9e04\"\n}",
      note: "`input` begins with the 4-byte selector `0xa9059cbb`, which is `transfer(address,uint256)`; decoding it needs the [[abi|ABI]], not the node.",
    },
    pitfalls: [
      "Reading `gas` as the amount consumed; it is the limit the sender chose, and actual consumption appears as `gasUsed` on the receipt.",
      "Assuming a non-null result means confirmed; a pending transaction is a full object with three null location fields.",
      "Expecting `blobVersionedHashes` to let you recover blob contents, which live on the consensus layer and expire after about 18 days.",
      "Polling a provider pool after sending, where a `null` only means this backend has not seen the transaction, not that it was rejected.",
    ],
    related: ["transaction", "eth-get-transaction-receipt", "transaction-types", "mempool", "eth-send-raw-transaction", "nonce", "history-expiry", "block-explorer", "abi"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: eth_getTransactionByHash", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_gettransactionbyhash" },
      { title: "EIP-2718: Typed Transaction Envelope", url: "https://eips.ethereum.org/EIPS/eip-2718" },
    ],
  },
  {
    id: "eth-get-transaction-receipt",
    title: "eth_getTransactionReceipt",
    category: "requests",
    aliases: ["receipt", "getTransactionReceipt", "eth_getTransactionReceipt", "transaction status", "did my transaction land"],
    summary: "`eth_getTransactionReceipt` returns the [[transaction-receipt|receipt]] of a mined [[transaction|transaction]] by hash, or `null` while the transaction is still pending or unknown to the node.",
    sections: [
      {
        heading: "What it does",
        paragraphs: [
          "The receipt is the node's record of what happened when the transaction was executed inside a [[block|block]]: whether it succeeded (`status` is `0x1`) or reverted (`0x0`), how much [[gas|gas]] it consumed, what it actually paid per unit of gas in `effectiveGasPrice`, which [[event-log|logs]] it emitted, and, for a contract deployment, the new contract's [[address|address]] in `contractAddress`. Because a receipt only exists after execution, this method is the canonical way to answer 'did my transaction land, and what did it do?'",
          "The single parameter is the 32-byte transaction hash returned by [[eth-send-raw-transaction|eth_sendRawTransaction]]. There is no block parameter: a transaction hash identifies one transaction, and the node looks up which canonical block contains it. If the transaction is in the [[mempool|pool]] but not yet in a block, or the node has never seen it, the result is `null` rather than an [[rpc-errors|error]].",
        ],
      },
      {
        heading: "How the node answers",
        paragraphs: [
          "[[execution-client|Execution clients]] keep an index from transaction hash to block number so this lookup does not scan the chain. Receipts are stored per block, so the client loads that block's receipts and picks the one at the transaction's index. Fields that are not stored on disk, such as `blockHash`, `transactionIndex`, or `effectiveGasPrice` for legacy transactions, are derived on the fly. This is also why [[eth-get-block-receipts|eth_getBlockReceipts]] is much cheaper than calling this method once per transaction when you need a whole block.",
          "Some clients keep the transaction index only for recent blocks. [[geth|Geth]]'s `--history.transactions` flag defaults to roughly the last 2.35 million blocks, about a year, and older transactions return `null` even though their block is still present. Nodes that have applied [[history-expiry|history expiry]] to pre-Merge data cannot return those receipts at all; an [[archive-node|archive node]] or an [[indexer|indexer]] is needed for very old history.",
        ],
      },
      {
        heading: "Confirming a transaction correctly",
        paragraphs: [
          "A non-null receipt means the transaction sits in a block this node currently considers canonical. It does not mean the block will stay canonical. A [[reorg|reorg]] can drop the block, after which the same call returns `null` again, or a receipt with a different `blockHash` once the transaction is re-included. Wallets and backends therefore poll once per block until a receipt appears, then wait for a number of [[confirmations|confirmations]], or until the block number is at or below the `finalized` [[block-tag|block tag]], before treating the outcome as settled.",
          "When you send through one endpoint and poll another behind a [[load-balancer|load balancer]], the second node may not have the block yet and will answer `null` for a transaction that is already mined elsewhere; see [[head-lag|head consistency]]. Poll the same node, or tolerate a few extra rounds of `null` before concluding anything.",
        ],
      },
    ],
    example: {
      title: "A successful ERC-20 transfer receipt (abridged)",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getTransactionReceipt\",\"params\":[\"0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060\"]}\n\n// result\n{\n  \"transactionHash\": \"0x5c504ed4…22060\",\n  \"blockHash\": \"0x9b83c12c…ee71\",\n  \"blockNumber\": \"0x12d4f1c\",\n  \"transactionIndex\": \"0x1\",\n  \"from\": \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\n  \"to\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  \"status\": \"0x1\",\n  \"gasUsed\": \"0xb3d9\",\n  \"cumulativeGasUsed\": \"0x105e1\",\n  \"effectiveGasPrice\": \"0x4a817c800\",\n  \"type\": \"0x2\",\n  \"contractAddress\": null,\n  \"logs\": [ { \"address\": \"0xA0b8…eB48\", \"topics\": [\"0xddf252ad…3ef\", \"0x000…6045\", \"0x000…1f2e\"], \"data\": \"0x…\", \"logIndex\": \"0x0\", \"removed\": false } ],\n  \"logsBloom\": \"0x…\"\n}",
      note: "`status` and `logs` tell you what happened; `blockHash` tells you where, and is what you compare on the next poll to detect a reorg.",
    },
    pitfalls: [
      "Treating `null` as failure. It means 'not mined on this node yet'; a revert is a receipt with `status` equal to `0x0`.",
      "Treating `contractAddress` as proof that a contract exists. It is filled in for every contract-creation transaction, including one that reverted, so check that `status` is `0x1` or call `eth_getCode` before relying on code at that address.",
      "Confusing `gasUsed` in the receipt (actual consumption) with `gas` on the transaction object (the limit the sender set).",
      "Expecting `status` on receipts from before the Byzantium upgrade in 2017; those carry a post-state `root` field instead.",
    ],
    related: ["transaction-receipt", "eth-send-raw-transaction", "eth-get-block-receipts", "confirmations", "reorg", "event-log", "head-lag", "eth-get-transaction-by-hash"],
    sources: [
      { title: "Execution APIs: eth_getTransactionReceipt", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: eth_getTransactionReceipt", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_gettransactionreceipt" },
      { title: "Geth command-line options (history.transactions)", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
    ],
  },
  {
    id: "eth-get-transaction-count",
    title: "eth_getTransactionCount",
    category: "requests",
    aliases: ["getTransactionCount", "eth_getTransactionCount", "nonce", "next nonce", "transaction count"],
    summary: "`eth_getTransactionCount` returns an account's [[nonce|nonce]] at a given block — the number of transactions it has sent — which is also the nonce the next transaction from that account must use.",
    sections: [
      {
        heading: "Parameters and result",
        paragraphs: [
          "The two parameters are a 20-byte [[address|address]] and a block identifier: a number, an [[eip|EIP-1898]] object, or one of the [[block-tag|tags]] `latest`, `safe`, `finalized`, `earliest`, `pending`. The result is a [[hex-encoding|QUANTITY]] such as `0x1f4`. Because nonces start at zero and increment by one per sent transaction, the count and the next nonce are the same number, which is why this method is what wallets call before signing.",
          "The tag choice changes the meaning completely. With `latest` you get the nonce implied by mined blocks only. With `pending` the node also counts the transactions from that sender sitting in its own [[mempool|pool]], so the answer is the nonce that will not collide with something already queued. A contract [[account|account]] has a nonce too: it counts `CREATE` deployments the contract has made, and since EIP-161 a newly deployed contract starts at `1`.",
        ],
      },
      {
        heading: "How the node answers",
        paragraphs: [
          "For a historical block or `latest`, the client reads the account leaf out of the [[state|state]] at that block and returns its nonce field, exactly the same lookup [[eth-get-balance|eth_getBalance]] performs. That makes it a state query: a [[pruned-node|pruned node]] answers for recent blocks and errors for old ones, where an [[archive-node|archive node]] is needed.",
          "`pending` is not a state lookup at all. The client starts from the latest state and walks the sender's queued transactions in its pool, stopping at the first [[nonce|nonce]] gap. That answer is local by construction: two nodes with different pool contents legitimately return different values for the same address in the same second, and a node whose pool was just restarted forgets everything it had queued.",
        ],
      },
      {
        heading: "Practical use",
        paragraphs: [
          "The standard send loop is: read with `pending`, sign, submit with [[eth-send-raw-transaction|eth_sendRawTransaction]], increment locally, repeat. Re-reading `pending` before every transaction in a burst is a race — the pool may not have registered the previous one yet — so a backend that sends more than one transaction at a time should keep its own counter and use the RPC value only to resynchronize after an error or restart.",
          "Two senders sharing one key, or one sender behind a [[load-balancer|load balancer]] that rotates backends, is the classic source of stuck queues: both read the same `pending` nonce, both sign, and the second transaction is rejected as `replacement transaction underpriced` while the first is still pending, as `nonce too low` once the first is mined, or silently replaces the first if it pays a large enough fee bump. To deliberately replace a transaction, reuse its exact nonce with a fee bump; to cancel it, send a zero-value transaction to yourself at that nonce.",
        ],
      },
    ],
    example: {
      title: "Mined nonce versus pool-aware nonce",
      language: "json",
      code: "// what the chain says\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getTransactionCount\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"latest\"]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x1f4\"}\n\n// what this node's pool says\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_getTransactionCount\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"pending\"]}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"result\":\"0x1f7\"}",
      note: "The gap of three means this node holds three queued transactions from that sender; another node may report `0x1f4` for the same address at the same moment.",
    },
    pitfalls: [
      "Using `latest` to pick the next nonce while earlier transactions are still pending, which produces a duplicate nonce and an immediate `nonce too low` rejection.",
      "Calling `pending` against a provider pool, where each backend has a different pool and the answer changes between calls.",
      "Sending a burst by re-reading the nonce each time instead of incrementing a local counter, which races the pool's own bookkeeping.",
      "Creating a nonce gap by skipping a value; every later transaction from that account stays queued until the missing nonce is filled or the pool evicts them.",
    ],
    related: ["nonce", "mempool", "eth-send-raw-transaction", "account", "block-tag", "eth-get-balance", "head-lag", "load-balancer", "retries"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: eth_getTransactionCount", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_gettransactioncount" },
      { title: "EIP-161: State trie clearing", url: "https://eips.ethereum.org/EIPS/eip-161" },
    ],
  },
  {
    id: "eth-get-balance",
    title: "eth_getBalance",
    category: "requests",
    aliases: ["getBalance", "eth_getBalance", "balance", "ether balance", "how much ETH"],
    summary: "`eth_getBalance` returns an [[account|account]]'s native ether balance in [[wei|wei]] as a [[hex-encoding|QUANTITY]], read from the [[state|world state]] as it existed after the block you name.",
    sections: [
      {
        heading: "Parameters and result",
        paragraphs: [
          "The two parameters are a 20-byte [[address|address]] and a block identifier — a number, an [[eip|EIP-1898]] object, or one of the [[block-tag|tags]] `latest`, `safe`, `finalized`, `earliest`, `pending`. The result is a single QUANTITY in wei, so one ether comes back as `0xde0b6b3a7640000`. An address that has never been used returns `0x0` rather than `null`; the [[evm|EVM]] has no concept of a missing account, only of one whose fields are all zero.",
          "The balance is the native currency only. An ERC-20 token balance is a number in a contract's [[contract-storage|storage]] and is read with [[eth-call|eth_call]] against that contract's `balanceOf`, not with this method. Confusing the two is the single most common mistake made against it.",
        ],
      },
      {
        heading: "How the node answers",
        paragraphs: [
          "The client hashes the address with [[keccak-256|Keccak-256]], walks the [[merkle-patricia-trie|state trie]] rooted at that block's [[state-root|state root]] (or the equivalent flat index its [[client-storage|storage engine]] keeps), and returns the `balance` field of the account leaf. This is a state query, so cost scales with the depth of the lookup and not with chain history, and every call is a handful of random reads.",
          "That makes retention the binding constraint. A [[full-node|full node]] holds the state of recent blocks only — [[geth|Geth]]'s path-based scheme keeps roughly the last 128 blocks of historical state — so an old block returns a `missing trie node` or `historical state not available` [[rpc-errors|error]], not a zero. Historical balances need an [[archive-node|archive node]], which is why [[rpc-provider|providers]] sell archive access as a separate tier and some cap how far back it reaches. If you need the answer verified rather than trusted, [[eth-get-proof|eth_getProof]] returns the same balance with a [[state-proof|proof]] against the state root.",
        ],
      },
      {
        heading: "Practical use",
        paragraphs: [
          "There is no balance-history method. The chain stores balances per block, not a log of changes, and balances move for reasons that leave no [[event-log|log]] and sometimes no transaction at all: gas payment, the priority fee credited to the proposer, and validator [[withdrawals|withdrawals]], which are system-level credits with no receipt. Reconstructing an account's history means either sampling this method block by block against an archive node, or reading balance diffs out of the [[trace-api|trace_ namespace]] or [[debug-api|debug_ prestate tracer]].",
          "Decode the result with an arbitrary-precision integer. One ether is 10^18 wei, which exceeds the 2^53 limit of a JavaScript number, so `parseInt` silently loses precision on ordinary balances. Use `BigInt` or the big-number type your [[client-libraries|library]] provides, and keep the hex string if you plan to log or compare it.",
        ],
      },
    ],
    example: {
      title: "Balance at the head and at a fixed block",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBalance\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"latest\"]}\n\n// response: 1.5 ETH in wei\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x14d1120d7b160000\"}\n\n// the same address at an old block, on a node that pruned that state\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_getBalance\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"0x5b8d80\"]}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"error\":{\"code\":-32000,\"message\":\"missing trie node 4f2c8e11… (path ) state 0x4f2c8e11…\"}}",
      note: "The failure is an error, not `0x0`; a node that cannot reach the state never pretends the account was empty.",
    },
    pitfalls: [
      "Calling it to read a token balance; ERC-20 balances live in contract storage and need an `eth_call` to `balanceOf`.",
      "Parsing wei with a 64-bit float or `parseInt`, which loses precision above 2^53 and quietly corrupts ordinary balances.",
      "Reading an error at an old block as an empty account; it means the node no longer holds that state.",
      "Assuming balance changes always correspond to a transaction; withdrawals credit balances with no transaction and no receipt.",
    ],
    related: ["account", "state", "block-tag", "archive-node", "eth-get-proof", "wei", "eth-call", "withdrawals", "pruned-node", "hex-encoding"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: eth_getBalance", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_getbalance" },
    ],
  },
  {
    id: "eth-get-code",
    title: "eth_getCode",
    category: "requests",
    aliases: ["getCode", "eth_getCode", "bytecode", "is this a contract", "runtime code"],
    summary: "`eth_getCode` returns the runtime bytecode stored at an [[address|address]] at a given block as DATA, or `0x` when the account holds no code.",
    sections: [
      {
        heading: "Parameters and result",
        paragraphs: [
          "The parameters are an address and a block identifier, the same pair [[eth-get-balance|eth_getBalance]] takes, and the result is a DATA string of the deployed bytes. A plain externally owned [[account|account]] returns `0x`. That is the usual contract test, but it is a test at one block: an address can be empty today and hold code tomorrow, because `CREATE2` lets anyone deploy to a precomputed address at any time, and because code was deployed at some block in the past for every contract that exists now.",
          "The bytes are the runtime code, not the [[smart-contract|deployment]] code. Constructor arguments and the initcode that ran at deployment are not stored and cannot be recovered here; they live in the deploying transaction's `input`. Since EIP-6780 shipped in Dencun, `SELFDESTRUCT` removes code only when the contract was created in the same transaction, so a contract that runs `SELFDESTRUCT` after that upgrade keeps its code and storage, while one destroyed before Dencun has no code from that block on.",
        ],
      },
      {
        heading: "How the node answers",
        paragraphs: [
          "The account leaf in the [[state|state]] holds a `codeHash`, not the code. The client reads that leaf at the requested block, then loads the byte string from a separate content-addressed store keyed by the [[keccak-256|Keccak-256]] hash. Two identical deployments therefore share one stored copy. Because step one is a state lookup, historical queries need historical state: a [[pruned-node|pruned node]] errors for old blocks exactly as it does for balances, even though the code blob itself is usually still on disk.",
          "The response can be large — EIP-170 caps deployed runtime code at 24,576 bytes — so fetching code for many addresses in a loop is a bandwidth problem before it is a compute problem. A [[caching|cache]] keyed by address and [[block-hash|block hash]] is unusually effective here, because deployed code never changes for a given address and block.",
        ],
      },
      {
        heading: "Delegation designators and practical use",
        paragraphs: [
          "Since Pectra, an externally owned account can point at contract code through [[eip-7702|EIP-7702]]. `eth_getCode` then returns exactly 23 bytes: the three-byte prefix `0xef0100` followed by the 20-byte address it delegates to. That is not executable code and must not be disassembled; it is a pointer the EVM follows. Code that concludes 'length greater than zero, therefore a contract' now misclassifies delegated wallets, which matters for [[erc-4337|account abstraction]] flows and for any allow-list built on 'is this an EOA'.",
          "The other common use is verifying a deployment before interacting with it: compare the returned bytes against the compiler's expected runtime bytecode, or hash them and compare with a known `codeHash`. For proxies, the code you get back is the proxy's, and the implementation address is a [[contract-storage|storage slot]] you read with [[eth-get-storage-at|eth_getStorageAt]] rather than something the code itself reveals.",
        ],
      },
    ],
    example: {
      title: "A contract, an EOA, and an EIP-7702 delegation",
      language: "json",
      code: "// a contract\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getCode\",\"params\":[\"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\"latest\"]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x608060405234801561001057600080fd5b50…\"}\n\n// an externally owned account\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_getCode\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"latest\"]}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"result\":\"0x\"}\n\n// an account that delegated its code under EIP-7702\n{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"eth_getCode\",\"params\":[\"0x388c818ca8b9251b393131c08a736a67ccb19297\",\"latest\"]}\n{\"jsonrpc\":\"2.0\",\"id\":3,\"result\":\"0xef01006f2e1f1a1a3c2b4d5e6f708192a3b4c5d6e7f809\"}",
      note: "The third result is 23 bytes: the `0xef0100` prefix plus the address whose code the account executes.",
    },
    pitfalls: [
      "Testing `code.length > 2` to mean 'contract'; an EIP-7702 delegation designator is 23 bytes on an account that is still an EOA.",
      "Expecting constructor code or constructor arguments; only runtime bytecode is stored, and the rest lives in the deploying transaction.",
      "Caching 'this address is not a contract' forever, when CREATE2 allows a deployment to that exact address later.",
      "Reading a proxy's code and concluding the contract has no logic; the implementation lives at another address named by a storage slot.",
    ],
    related: ["smart-contract", "eip-7702", "account", "eth-get-storage-at", "state", "keccak-256", "eth-call", "archive-node", "caching"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "EIP-7702: Set EOA account code", url: "https://eips.ethereum.org/EIPS/eip-7702" },
      { title: "EIP-170: Contract code size limit", url: "https://eips.ethereum.org/EIPS/eip-170" },
    ],
  },
  {
    id: "eth-get-storage-at",
    title: "eth_getStorageAt",
    category: "requests",
    aliases: ["getStorageAt", "eth_getStorageAt", "storage slot", "read private variable", "raw storage"],
    summary: "`eth_getStorageAt` returns the raw 32-byte value held in one [[contract-storage|storage slot]] of an [[account|account]] at a given block, with no [[abi|ABI]] decoding and no access control.",
    sections: [
      {
        heading: "Parameters and result",
        paragraphs: [
          "Three parameters: the [[address|address]], the slot index as a [[hex-encoding|QUANTITY]], and a block identifier. The result is always 32 bytes of DATA, zero-padded, and a slot that was never written returns `0x0000…0000`. Nothing distinguishes 'never written' from 'written to zero', because the [[state|state]] stores no empty slots — writing zero deletes the entry.",
          "There is no privacy here. Solidity's `private` and `internal` keywords restrict what other contracts can read at the EVM level; they do not hide anything from an RPC caller, who reads the slot directly. Anything a [[smart-contract|contract]] stores is public, which is why secrets belong off chain or behind a commitment.",
        ],
      },
      {
        heading: "Finding the slot",
        paragraphs: [
          "Slots are assigned by the compiler in declaration order, with small types packed together into one 32-byte word, so the value you want is often a sub-range of the returned bytes rather than the whole word. Dynamic structures are hashed: for `mapping(address => uint256) balances` at slot `p`, the entry for key `k` is at `keccak256(pad32(k) . pad32(p))`, and a dynamic array's elements start at `keccak256(pad32(p))`. Computing these correctly is the hard part of using the method; the details belong to [[contract-storage|storage layout]].",
          "Some slots are standardized precisely so tooling can find them without the source. EIP-1967 places a proxy's implementation address at the slot `keccak256('eip1967.proxy.implementation') - 1`, the constant `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`, and the admin address at a similarly derived slot. Reading those is the standard way to resolve what a proxy currently points at.",
        ],
      },
      {
        heading: "How the node answers and when to use it",
        paragraphs: [
          "The client reads the account leaf at the requested block to get its `storageHash`, then looks up `keccak256(slot)` in that account's storage trie. Like every state read it needs the state at that block, so historical queries require an [[archive-node|archive node]] and fail on a [[pruned-node|pruned node]] with a missing-trie-node [[rpc-errors|error]]. [[eth-get-proof|eth_getProof]] returns the same value together with a [[storage-proof|storage proof]] you can verify against the [[state-root|state root]].",
          "Prefer a getter through [[eth-call|eth_call]] when one exists: it survives contract upgrades and layout changes, and it returns a decoded value instead of raw bytes. Reach for raw storage when there is no getter, when you are reading a proxy's implementation pointer, when you are debugging a value the contract will not expose, or when you need a value at a historical block from a contract whose getter did not exist yet.",
        ],
      },
    ],
    example: {
      title: "Reading a proxy's implementation slot",
      language: "json",
      code: "// EIP-1967 implementation slot\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getStorageAt\",\"params\":[\n  \"0x388c818ca8b9251b393131c08a736a67ccb19297\",\n  \"0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc\",\n  \"latest\"\n]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48\"}\n\n// a mapping entry: slot = keccak256(pad32(key) . pad32(2))\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_getStorageAt\",\"params\":[\n  \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  \"0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3\",\n  \"0x12d4f1c\"\n]}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"result\":\"0x0000000000000000000000000000000000000000000000000000000005f5e100\"}",
      note: "Both results are 32 bytes; the first is an address left-padded to a word, the second a `uint256` worth 100000000 in decimal.",
    },
    pitfalls: [
      "Believing a `private` variable is unreadable; the keyword constrains other contracts, not RPC callers.",
      "Reading a packed struct or several small variables as one value; the compiler may pack four `uint64` fields into the single word you received.",
      "Hard-coding slot numbers across an upgradeable contract's versions, where a new implementation can renumber the layout.",
      "Treating an all-zero result as proof the slot is unused; a slot explicitly set to zero is stored the same way as one never written.",
    ],
    related: ["contract-storage", "eth-call", "eth-get-proof", "storage-proof", "smart-contract", "state", "archive-node", "eth-get-code", "keccak-256"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "Solidity: layout of state variables in storage", url: "https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html" },
      { title: "EIP-1967: Proxy storage slots", url: "https://eips.ethereum.org/EIPS/eip-1967" },
    ],
  },
  {
    id: "eth-get-proof",
    title: "eth_getProof",
    category: "requests",
    aliases: ["getProof", "eth_getProof", "EIP-1186", "merkle proof", "account proof", "storage proof"],
    summary: "`eth_getProof` returns an [[account|account]]'s fields plus the [[merkle-patricia-trie|trie]] nodes proving them, and optionally the same for named storage slots, so a caller can verify the answer against a block's [[state-root|state root]] instead of trusting the node.",
    sections: [
      {
        heading: "Parameters and result",
        paragraphs: [
          "Defined by [[eip|EIP-1186]], the method takes three parameters: an [[address|address]], an array of 32-byte storage keys (which may be empty), and a block identifier. The result object carries `address`, `balance`, `nonce`, `codeHash`, `storageHash`, an `accountProof` array, and a `storageProof` array with one entry per requested key holding `key`, `value`, and its own `proof`. Every proof is an ordered list of RLP-encoded trie nodes running from the root down to the leaf.",
          "The account fields are what [[eth-get-balance|eth_getBalance]], [[eth-get-transaction-count|eth_getTransactionCount]], and [[eth-get-code|eth_getCode]] return separately, and each `storageProof` value matches [[eth-get-storage-at|eth_getStorageAt]]; the difference is that here they arrive with the evidence attached.",
        ],
      },
      {
        heading: "Verifying the answer",
        paragraphs: [
          "Verification is mechanical. Hash the address with [[keccak-256|Keccak-256]] to get the path, walk `accountProof` from the first node down, checking at each step that the hash of the node equals the reference the previous node contained, and that the first node hashes to the block's `stateRoot`. The leaf RLP-decodes to `[nonce, balance, storageRoot, codeHash]`, which must match the top-level fields. Then repeat per storage key, using `keccak256(key)` as the path and `storageHash` as the root. A key that was never written yields an exclusion proof: a valid path that terminates before the key, proving the value really is zero.",
          "What this proves is narrow and worth stating precisely. It proves the value belongs to the [[state|state]] committed by that `stateRoot`. It does not prove that the block containing that root is canonical — that requires a [[trusted-header|trusted header]] obtained from a [[light-client|light client]], your own node, or a pinned finalized block. Without one, a node could serve a perfectly valid proof against a state root it invented. See [[state-proof|state proof]] and [[verified-rpc|verified RPC]].",
        ],
      },
      {
        heading: "Availability and cost",
        paragraphs: [
          "This is the most demanding read in the API. Producing a proof requires the trie itself, not just the values, so clients that keep a flat key-value layout for speed — [[erigon|Erigon]], [[reth|Reth]], [[besu|Besu]] with Bonsai — must reconstruct trie nodes to answer, and some can only do so for recent blocks. Being an [[archive-node|archive node]] does not by itself guarantee historical proofs: retaining historical values is a different property from retaining historical trie structure. Many [[rpc-provider|providers]] support `latest` and a shallow window only, and some do not expose the method at all; probe it before designing around it. See [[client-storage|client storage engines]].",
          "The response is also big: each proof node is up to 532 bytes and a mainnet account path is typically seven to nine nodes deep, so proving a few storage keys costs several kilobytes. Bridges and [[light-client|light clients]] accept that cost because the alternative is trusting a remote node's word; ordinary applications should not pay it for reads they will not verify.",
        ],
      },
    ],
    example: {
      title: "Proving a storage slot against the state root",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getProof\",\"params\":[\n  \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  [\"0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3\"],\n  \"0x12d4f1c\"\n]}\n\n// result (abridged)\n{\n  \"address\": \"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48\",\n  \"balance\": \"0x0\",\n  \"nonce\": \"0x1\",\n  \"codeHash\": \"0xb44fb4e949d0f78f87f79ee46428f23a2a5713ce6fc6e0beb3dda78c2ac1ea55\",\n  \"storageHash\": \"0x1d0a6a1d…7c9e\",\n  \"accountProof\": [\n    \"0xf90211a0b8c1…80\",\n    \"0xf90211a04e7f…80\",\n    \"0xf8719f20b1…c0\"\n  ],\n  \"storageProof\": [\n    {\n      \"key\": \"0x7050c9e0…f8c3\",\n      \"value\": \"0x5f5e100\",\n      \"proof\": [\"0xf90211a0fe32…80\", \"0xe216a0…84\"]\n    }\n  ]\n}",
      note: "Check the first `accountProof` node against the `stateRoot` of block `0x12d4f1c`, which you must obtain from a header you already trust.",
    },
    pitfalls: [
      "Verifying a proof against the `stateRoot` the same node handed you, which proves only that the node is internally consistent.",
      "Assuming an archive node can prove any historical block; retaining old values and old trie nodes are different capabilities.",
      "Reading `value` in `storageProof` as fixed 32 bytes; it is a QUANTITY with leading zeros stripped, not a padded word.",
      "Treating an exclusion proof as a failed lookup rather than evidence that the slot is genuinely zero.",
    ],
    related: ["state-proof", "account-proof", "storage-proof", "merkle-patricia-trie", "state-root", "trusted-header", "archive-node", "verified-rpc", "eth-get-storage-at", "client-storage"],
    sources: [
      { title: "EIP-1186: RPC-Method to get Merkle Proofs", url: "https://eips.ethereum.org/EIPS/eip-1186" },
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "eth-call",
    title: "eth_call",
    category: "requests",
    aliases: ["call", "eth_call", "read contract", "simulate", "static call", "view function"],
    summary: "`eth_call` executes a message call in the [[evm|EVM]] against the [[state|state]] at a chosen block and returns the call's raw return bytes, without signing anything, spending [[gas|gas]], or changing state.",
    sections: [
      {
        heading: "Parameters and result",
        paragraphs: [
          "The first parameter is a call object. `to` is the target; `data` (accepted as `input` by current clients) is the [[abi|ABI]]-encoded calldata; `from` is the apparent sender, which the node accepts at face value because nothing is signed; `value`, `gas`, `gasPrice` or the [[eip-1559|EIP-1559]] pair `maxFeePerGas` and `maxPriorityFeePerGas`, `nonce`, `accessList`, and `chainId` are all optional. The second parameter is a block identifier — number, [[eip|EIP-1898]] object, or a [[block-tag|tag]]. A third, optional parameter carries [[state-override|state overrides]], a widely implemented extension.",
          "The result is DATA: exactly the bytes the called function returned, undecoded. A function declared to return nothing yields `0x`, which is also what you get from calling an address with no code — the EVM treats a call to an empty account as a successful no-op. Decoding is the caller's job and needs the ABI.",
        ],
      },
      {
        heading: "How the node executes it",
        paragraphs: [
          "The client builds an EVM environment from the named block's header, so `block.number`, `block.timestamp`, `BLOCKHASH`, `PREVRANDAO`, and the [[eip-1559|base fee]] are that block's values, and the [[state|world state]] is the state after that block executed. It runs the call, collects the output, and throws the state changes away. Nothing is broadcast and no [[mempool|pool]] is involved, so the call is invisible to every other node.",
          "Because there is no signature, `from` can be any [[address|address]], including one with no ether. Clients relax the fee and balance checks when fee fields are omitted, which is why a read from the zero address normally works. Supply `gasPrice` or `maxFeePerGas` explicitly and the balance check comes back, and a `from` account without funds starts failing — a frequent surprise when code reuses a transaction object for a call.",
          "Gas is bounded by the node, not by you: [[geth|Geth]] caps a call at `--rpc.gascap`, 50,000,000 by default, with an execution timeout on top, and other clients expose equivalents. A call against an old block also needs historical state, so it fails on a [[pruned-node|pruned node]] and requires an [[archive-node|archive node]].",
        ],
      },
      {
        heading: "Reverts and practical use",
        paragraphs: [
          "A [[revert|revert]] is not a successful result with empty data. It comes back as a JSON-RPC [[rpc-errors|error]], commonly with code `3` and a `data` field holding the revert bytes — `Error(string)` under selector `0x08c379a0`, `Panic(uint256)` under `0x4e487b71`, or a custom error's own selector — though some providers report it as `-32000` with the message `execution reverted` and drop the data. Code that checks only for a result misreads a revert as an empty answer.",
          "This is the method behind almost every read a wallet or dapp performs: `balanceOf`, `decimals`, [[ens|ENS]] resolution, price quotes, allowance checks. Applications batch them through the [[multicall|Multicall3]] contract, which aggregates many reads into one `eth_call` at one block and so guarantees a consistent snapshot; a plain [[batch-request|JSON-RPC batch]] saves round trips but not consistency, since each entry executes independently and `latest` may move between them.",
          "`eth_call` is also the cheap half of simulation. It tells you what a transaction would return right now; it does not tell you what gas it needs — that is [[eth-estimate-gas|eth_estimateGas]] — and it cannot model a sequence of transactions across blocks, which is what [[eth-simulate|eth_simulateV1]] exists for.",
        ],
      },
    ],
    example: {
      title: "Reading an ERC-20 balance, and a call that reverts",
      language: "json",
      code: "// balanceOf(address) — selector 0x70a08231\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[\n  {\n    \"to\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n    \"data\": \"0x70a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045\"\n  },\n  \"latest\"\n]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x0000000000000000000000000000000000000000000000000000000005f5e100\"}\n\n// transferFrom without an allowance\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_call\",\"params\":[{\"from\":\"0xd8dA…6045\",\"to\":\"0xA0b8…eB48\",\"data\":\"0x23b872dd…\"},\"latest\"]}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"error\":{\n  \"code\": 3,\n  \"message\": \"execution reverted: ERC20: insufficient allowance\",\n  \"data\": \"0x08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000204552433230…\"\n}}",
      note: "The `data` field is ABI-encoded revert payload: selector `0x08c379a0` for `Error(string)`, then an offset, a length, and the message bytes.",
    },
    pitfalls: [
      "Treating a revert as an empty result; reverts arrive as a JSON-RPC error object, and the reason is in `data`, not in `result`.",
      "Calling an address that holds no code and reading the `0x` back as a legitimate zero value; check with [[eth-get-code|eth_getCode]] first.",
      "Reusing a signed transaction's fee fields in the call object, which re-enables the balance check and makes reads fail for unfunded senders.",
      "Issuing several related calls with `latest` and combining the answers; the head can move between them, so pin one block number or use Multicall3.",
    ],
    related: ["evm", "eth-estimate-gas", "state-override", "revert", "abi", "block-tag", "eth-simulate", "multicall", "archive-node", "smart-contract", "rpc-errors"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: eth_call", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_call" },
      { title: "Geth command-line options (rpc.gascap)", url: "https://geth.ethereum.org/docs/fundamentals/command-line-options" },
    ],
  },
  {
    id: "eth-estimate-gas",
    title: "eth_estimateGas",
    category: "requests",
    aliases: ["estimateGas", "eth_estimateGas", "gas limit", "how much gas", "estimate"],
    summary: "`eth_estimateGas` repeatedly executes a call object against a block's [[state|state]] to find the smallest [[gas|gas]] limit under which it does not run out, and returns that number as a [[hex-encoding|QUANTITY]].",
    sections: [
      {
        heading: "Parameters and result",
        paragraphs: [
          "The first parameter is the same call object [[eth-call|eth_call]] takes: `from`, `to`, `data`, `value`, and optional fee fields. The block identifier is optional and clients differ on the default — some resolve it to `latest`, others to `pending` — so pass it explicitly when the distinction matters. Several clients also accept [[state-override|state overrides]] as a third parameter. The result is a gas amount, for example `0xb3d9`, not a fee and not a price.",
          "A call that reverts produces the same [[rpc-errors|error]] shape as `eth_call`: commonly code `3` with the [[revert|revert]] bytes in `data`. That is a useful property — estimation doubles as a pre-flight check — but it means estimation failure and transaction failure are reported identically, and an application must distinguish 'this would revert' from 'the node could not estimate'.",
        ],
      },
      {
        heading: "How the node computes it",
        paragraphs: [
          "The client binary-searches. It runs the call with a high limit, usually the node's gas cap, and then narrows between the amount consumed and the cap, executing the EVM again at each step until it finds the lowest limit that still succeeds. A single estimate therefore costs several full executions, which is why it is one of the most expensive read methods and why [[rpc-provider|providers]] weight it far above [[eth-call|eth_call]] in their [[rate-limits|compute-unit]] pricing.",
          "The answer is not simply the gas consumed. EIP-150's 63/64 rule means a contract that forwards gas to a subcall needs more supplied than is finally spent, so the search converges above the consumption figure, and refunds applied after execution push the receipt's `gasUsed` lower still. Since [[hardfork|Pectra]], EIP-7623 adds a calldata floor cost that can dominate data-heavy transactions.",
        ],
      },
      {
        heading: "Why estimates go wrong",
        paragraphs: [
          "An estimate describes one state at one moment, and the world moves before inclusion. A storage slot that was zero when you estimated costs 20,000 gas to fill but only 2,900 to update, so someone else's deposit — or your own earlier transaction — changes the answer. Refunds shift with ordering, and contracts that branch on balances, oracle prices, or block timestamps take a different path entirely.",
          "The practical response is a buffer: wallets commonly add ten to thirty percent and let the surplus go unspent, because unused gas is refunded while underestimating costs a failed transaction that still pays for the gas it burned. Do not buffer a plain 21,000-gas ether transfer, where the cost is fixed. For anything complex, estimate against the state the transaction will actually meet — the `pending` [[block-tag|tag]] when your own transactions are queued, [[state-override|state overrides]] for an approval that has not landed, or [[eth-simulate|eth_simulateV1]] when the calls must run in order.",
        ],
      },
    ],
    example: {
      title: "Estimating a token transfer, and an estimate that reverts",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_estimateGas\",\"params\":[\n  {\n    \"from\": \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\n    \"to\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n    \"data\": \"0xa9059cbb000000000000000000000000388c818ca8b9251b393131c08a736a67ccb192970000000000000000000000000000000000000000000000000000000005f5e100\"\n  },\n  \"latest\"\n]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0xb3d9\"}\n\n// the same call from an account with no tokens\n{\"jsonrpc\":\"2.0\",\"id\":2,\"error\":{\n  \"code\": 3,\n  \"message\": \"execution reverted: ERC20: transfer amount exceeds balance\",\n  \"data\": \"0x08c379a0…\"\n}}",
      note: "`0xb3d9` is 46,041 gas units; multiply by a gas price only when you want a fee, and send the transaction with a limit somewhat above it.",
    },
    pitfalls: [
      "Sending a transaction with the estimate as its exact gas limit; any state drift turns into an out-of-gas failure that still costs the full limit.",
      "Confusing gas units with a fee; multiply by a gas price from [[eth-fee-history|eth_feeHistory]] or [[eth-gas-price|eth_gasPrice]].",
      "Estimating with `latest` while your own earlier transactions are still pending, so the estimate assumes state those transactions have not yet produced.",
      "Retrying an estimate in a loop when it reverts; the revert is deterministic for that state, and each attempt costs several executions.",
    ],
    related: ["eth-call", "gas", "revert", "state-override", "eth-simulate", "eth-create-access-list", "eip-1559", "eth-send-raw-transaction", "rate-limits"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: eth_estimateGas", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_estimategas" },
      { title: "EIP-7623: Increase calldata cost", url: "https://eips.ethereum.org/EIPS/eip-7623" },
    ],
  },
  {
    id: "eth-create-access-list",
    title: "eth_createAccessList",
    category: "requests",
    aliases: ["createAccessList", "eth_createAccessList", "access list", "EIP-2930", "warm slots"],
    summary: "`eth_createAccessList` executes a call while recording every [[address|address]] and storage slot it touches, and returns that set as an EIP-2930 [[access-list|access list]] together with the [[gas|gas]] the call would use with the list attached.",
    sections: [
      {
        heading: "Parameters and result",
        paragraphs: [
          "The parameters are the same call object [[eth-call|eth_call]] takes plus an optional block identifier. The result is an object with `accessList`, an array of `{ address, storageKeys }` entries, and `gasUsed`, the gas the call consumed when run with that list applied. When the call fails, clients add an `error` string describing the failure alongside a best-effort list rather than returning nothing.",
          "Clients leave out entries that are warm by rule anyway — precompiles and the sender — because declaring them costs gas for no benefit. What remains is the set of accounts and [[contract-storage|storage slots]] the [[evm|EVM]] reached cold during that execution.",
        ],
      },
      {
        heading: "What the list is worth",
        paragraphs: [
          "The accounting comes from EIP-2929 and EIP-2930 and is tighter than it looks. A cold account access costs 2,600 gas; declaring the address costs 2,400 upfront and makes the access warm at 100, so the saving is 100 gas. A cold `SLOAD` costs 2,100; declaring the slot costs 1,900 plus a 100 warm read, again saving 100. Declaring something the call never touches costs the full 2,400 or 1,900 for nothing, so a list produced from the wrong state can easily make a transaction more expensive.",
          "The real value is elsewhere. An access list makes the cost of a call predictable regardless of what other transactions in the block warmed first, which matters for contracts that sit near their gas limit, and it is the mechanism behind [[transaction-types|type 0x1]] transactions. On a [[rollup|rollup]] the list is extra data that must be published. On [[hardfork|mainnet]] the saving is thin by design: listing an address costs 2400 gas and saves 2500 on its first access, listing a storage key costs 1900 and saves 2000, so any entry that would already be warm, such as the sender, the recipient, or a precompile, costs more than it saves.",
        ],
      },
      {
        heading: "How the node answers and when to use it",
        paragraphs: [
          "The client runs the call under a tracer that records touched addresses and slots, then re-runs it with the resulting list so the reported `gasUsed` reflects the list's own cost. That is at least two full executions, which puts it in the same cost class as [[eth-estimate-gas|eth_estimateGas]], and it needs the [[state|state]] at the requested block, so old blocks require an [[archive-node|archive node]]. Support is broad across [[geth|Geth]], [[nethermind|Nethermind]], [[erigon|Erigon]], and [[reth|Reth]], but some [[rpc-provider|providers]] leave it off their allow-list.",
          "The list is only valid for the state you generated it against. A call whose path depends on balances, prices, or a proxy's current implementation touches different slots after the state moves, so regenerate rather than cache. The other common use is diagnostic: the returned list is a compact answer to 'what does this transaction actually read and write', useful before a [[debug-api|full trace]].",
        ],
      },
    ],
    example: {
      title: "The slots a token transfer touches",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_createAccessList\",\"params\":[\n  {\n    \"from\": \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\n    \"to\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n    \"data\": \"0xa9059cbb000000000000000000000000388c818ca8b9251b393131c08a736a67ccb192970000000000000000000000000000000000000000000000000000000005f5e100\"\n  },\n  \"latest\"\n]}\n\n// result\n{\n  \"accessList\": [\n    {\n      \"address\": \"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48\",\n      \"storageKeys\": [\n        \"0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3\",\n        \"0x2b1c1e5c0b5e0a0b7b4b1d1f2a3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e\"\n      ]\n    }\n  ],\n  \"gasUsed\": \"0xd6d8\"\n}",
      note: "Compare `gasUsed` here with what [[eth-estimate-gas|eth_estimateGas]] returns without the list; if the list is larger, do not attach it.",
    },
    pitfalls: [
      "Attaching a list without comparing gas both ways; each unused entry costs 2,400 or 1,900 gas and can make the transaction dearer.",
      "Caching a list across state changes, after which the call touches different slots and the declared ones are dead weight.",
      "Expecting a saving proportional to the number of entries; each correctly predicted cold access saves only about 100 gas.",
      "Using it on a rollup without counting the calldata, where publishing the extra bytes usually outweighs the warm-access discount.",
    ],
    related: ["access-list", "transaction-types", "eth-estimate-gas", "eth-call", "gas", "evm", "contract-storage", "debug-api", "archive-node"],
    sources: [
      { title: "EIP-2930: Optional access lists", url: "https://eips.ethereum.org/EIPS/eip-2930" },
      { title: "EIP-2929: Gas cost increases for state access opcodes", url: "https://eips.ethereum.org/EIPS/eip-2929" },
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "eth-gas-price",
    title: "eth_gasPrice and eth_maxPriorityFeePerGas",
    category: "requests",
    aliases: ["gasPrice", "eth_gasPrice", "eth_maxPriorityFeePerGas", "eth_blobBaseFee", "fee suggestion", "tip"],
    summary: "These parameterless methods return a node's own fee suggestions: `eth_gasPrice` a total price per [[gas|gas]] unit, `eth_maxPriorityFeePerGas` just the tip, and `eth_blobBaseFee` the current blob base fee.",
    sections: [
      {
        heading: "What each one returns",
        paragraphs: [
          "`eth_gasPrice` predates [[eip-1559|EIP-1559]] and still returns a single QUANTITY in [[wei|wei]]. On a post-1559 chain a client computes it as the next block's base fee plus a suggested tip, so it is a legacy-shaped answer to a two-part question. `eth_maxPriorityFeePerGas` returns only the tip, which is the half you actually have to guess; the base fee is not a guess at all, because the next block's value is fully determined by the current block's header.",
          "`eth_blobBaseFee` returns the base fee per blob gas for the next block, derived from `excessBlobGas` in the header. It is the blob market's equivalent and is unrelated to the execution gas price; a [[blob|blob]] transaction pays both, in separate currencies of gas. All three take an empty `params` array and none of them accepts a [[block-tag|block tag]].",
        ],
      },
      {
        heading: "How the number is produced",
        paragraphs: [
          "There is no protocol rule here. Each [[execution-client|execution client]] samples the priority fees actually paid in recent blocks and returns a percentile of them, and the sample size, the percentile, and the floor are configuration, not consensus. [[geth|Geth]] exposes them through `--gpo.blocks`, `--gpo.percentile`, and `--gpo.maxprice`; other clients have their own. Two honest nodes on the same chain therefore return different suggestions, and a [[rpc-provider|provider]] may substitute its own estimator entirely.",
          "The suggestion also lags. It describes what was paid in blocks that already exist, not what the next block will demand, so it reacts slowly to a sudden surge and stays high after one has passed. During quiet periods a client's configured minimum dominates and the answer stops tracking the market at all.",
        ],
      },
      {
        heading: "Practical use",
        paragraphs: [
          "For a [[transaction-types|type 0x2]] transaction, take the tip from `eth_maxPriorityFeePerGas`, read `baseFeePerGas` from the latest [[block-header|block header]] via [[eth-get-block-by-number|eth_getBlockByNumber]], and set `maxFeePerGas` high enough to survive several blocks of base-fee growth — the base fee can rise 12.5 percent per block, so roughly twice the current base fee plus the tip covers a handful of blocks. Overpaying on `maxFeePerGas` is safe: the sender is charged `baseFee + min(tip, maxFeePerGas - baseFee)` and refunded the rest.",
          "Use `eth_gasPrice` only for a legacy [[transaction|transaction]] or a chain without 1559. For anything adaptive, [[eth-fee-history|eth_feeHistory]] gives you the raw material — per-block base fees, utilization, and tip percentiles — to build an estimator whose behavior you control rather than inheriting a node operator's flags. On an [[l2-rpc|L2]] these methods describe the L2's execution fee only and omit the L1 data cost, which is usually the larger component.",
        ],
      },
    ],
    example: {
      title: "Three fee suggestions from one node",
      language: "bash",
      code: "curl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_gasPrice\",\"params\":[]}' https://rpc.example\n# {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x4a817c800\"}     # 20 gwei: base fee plus a suggested tip\n\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_maxPriorityFeePerGas\",\"params\":[]}' https://rpc.example\n# {\"jsonrpc\":\"2.0\",\"id\":2,\"result\":\"0x3b9aca00\"}       # 1 gwei tip only\n\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"eth_blobBaseFee\",\"params\":[]}' https://rpc.example\n# {\"jsonrpc\":\"2.0\",\"id\":3,\"result\":\"0x1\"}              # 1 wei per blob gas, the floor",
      note: "The difference between the first two results is this node's view of the next base fee; read it directly from the latest header instead of subtracting.",
    },
    pitfalls: [
      "Setting `maxFeePerGas` to the value from `eth_gasPrice`, which leaves no headroom and strands the transaction as soon as the base fee rises.",
      "Treating the suggestion as a network-wide number; it is one node's percentile over its own recent history, and operators tune it with flags.",
      "Using `eth_gasPrice` on a rollup to estimate total cost, which omits the L1 data fee that usually dominates.",
      "Adding `eth_blobBaseFee` to the execution gas price; blob gas is a separate market with its own units and its own budget.",
    ],
    related: ["eip-1559", "eth-fee-history", "gas", "wei", "transaction-types", "blob", "l2-rpc", "eth-send-raw-transaction", "eth-get-block-by-number"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "EIP-1559: Fee market change", url: "https://eips.ethereum.org/EIPS/eip-1559" },
      { title: "EIP-4844: Shard Blob Transactions", url: "https://eips.ethereum.org/EIPS/eip-4844" },
    ],
  },
  {
    id: "eth-fee-history",
    title: "eth_feeHistory",
    category: "requests",
    aliases: ["feeHistory", "eth_feeHistory", "fee estimator", "base fee history", "reward percentiles"],
    summary: "`eth_feeHistory` returns per-block [[eip-1559|base fees]], block utilization, and requested percentiles of the priority fees actually paid over a window of recent blocks, as the raw material for a fee estimator.",
    sections: [
      {
        heading: "Parameters and result",
        paragraphs: [
          "Three parameters: `blockCount` as a [[hex-encoding|QUANTITY]] (capped at 1024 by the specification and usually lower by a [[rpc-provider|provider]]), `newestBlock` as a number or [[block-tag|tag]], and `rewardPercentiles`, an ascending array of plain JSON numbers between 0 and 100. Passing an empty array or omitting it skips the expensive part of the query.",
          "The result has `oldestBlock` and four arrays. `baseFeePerGas` holds `blockCount + 1` entries, because the last one is the base fee of the block after `newestBlock` — already determined by the header and the only fee value in the whole API that is a fact rather than an estimate. `gasUsedRatio` holds one float per block, the fraction of the [[gas|gas]] limit consumed. `reward` holds one array per block with one entry per requested percentile. Since Dencun, `baseFeePerBlobGas` and `blobGasUsedRatio` mirror the first two for the [[blob|blob]] market.",
        ],
      },
      {
        heading: "How the node answers",
        paragraphs: [
          "Base fees and gas ratios come straight from [[block-header|block headers]], so that half is nearly free. The `reward` arrays are not: for each block the client must load the receipts or transactions, compute each transaction's effective priority fee, sort them by that value, and pick the requested percentiles. Clients cache the computed percentiles per block, but a cold request over a thousand blocks with several percentiles is a real amount of work, which is why providers charge it well above a header read and cap `blockCount` aggressively.",
          "The window can also run past what the node retains. A [[pruned-node|pruned node]] or one under [[history-expiry|history expiry]] cannot produce rewards for blocks whose receipts are gone, and clients respond by truncating: `oldestBlock` comes back later than you asked for and the arrays are shorter than `blockCount`. Always drive your loop from `oldestBlock` and the array lengths, never from the number you requested.",
        ],
      },
      {
        heading: "Building an estimator",
        paragraphs: [
          "A workable estimator asks for 10 to 20 blocks with percentiles like `[10, 50, 90]`, discards blocks whose `gasUsedRatio` is zero (an empty block says nothing about demand), and takes a percentile of the collected tips as `maxPriorityFeePerGas`. For `maxFeePerGas` start from the last entry of `baseFeePerGas` — the next block's actual base fee — and multiply by a factor that covers however many blocks you are willing to wait, since the base fee can move at most 12.5 percent per block toward a 50 percent utilization target.",
          "Reading `gasUsedRatio` is what separates this from [[eth-gas-price|eth_gasPrice]]. Ratios near 1.0 mean the base fee is still climbing and a low `maxFeePerGas` will strand the [[transaction|transaction]]; ratios near 0.3 mean it is falling and you can bid close to the current value. Wallets and [[client-libraries|libraries]] build their default fee logic on exactly this call.",
        ],
      },
    ],
    example: {
      title: "Four blocks with tip percentiles",
      language: "json",
      code: "// request: percentiles are plain numbers, not hex\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_feeHistory\",\"params\":[\"0x4\",\"latest\",[25,50,75]]}\n\n// result\n{\n  \"oldestBlock\": \"0x12d4f19\",\n  \"baseFeePerGas\": [\"0x3b9aca00\", \"0x3f5476a0\", \"0x3a35294e\", \"0x37b5f4d2\", \"0x3529a1c4\"],\n  \"gasUsedRatio\": [0.6421, 0.3399, 0.4102, 0.2988],\n  \"reward\": [\n    [\"0x5f5e100\", \"0xbebc200\", \"0x1dcd6500\"],\n    [\"0x3d09000\", \"0x5f5e100\", \"0xbebc200\"],\n    [\"0x3d09000\", \"0x5f5e100\", \"0x11e1a300\"],\n    [\"0x2faf080\", \"0x47868c0\", \"0x9502f900\"]\n  ],\n  \"baseFeePerBlobGas\": [\"0x1\", \"0x1\", \"0x1\", \"0x1\", \"0x1\"],\n  \"blobGasUsedRatio\": [0.5, 0.3333, 0.6667, 0.5]\n}",
      note: "`baseFeePerGas` has five entries for four blocks; the last one is the next block's base fee and is the number to build `maxFeePerGas` from.",
    },
    pitfalls: [
      "Indexing `baseFeePerGas` and `gasUsedRatio` in lockstep; the first array is one element longer and that last element is the future block.",
      "Assuming you received `blockCount` blocks; a node that cannot reach that far back truncates and reports a later `oldestBlock`.",
      "Sending `rewardPercentiles` as hex strings; they are ordinary JSON numbers and must be strictly ascending, or the node rejects the request.",
      "Averaging tips across empty blocks, which drags the estimate toward zero using blocks that carried no transactions.",
    ],
    related: ["eip-1559", "eth-gas-price", "gas", "block-header", "blob", "client-libraries", "eth-send-raw-transaction", "history-expiry", "rate-limits"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "EIP-1559: Fee market change", url: "https://eips.ethereum.org/EIPS/eip-1559" },
      { title: "ethereum.org: eth_feeHistory", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_feehistory" },
    ],
  },
  {
    id: "eth-send-raw-transaction",
    title: "eth_sendRawTransaction",
    category: "requests",
    aliases: ["sendRawTransaction", "eth_sendRawTransaction", "broadcast", "submit transaction", "send signed transaction"],
    summary: "`eth_sendRawTransaction` hands a node one already-signed [[transaction|transaction]] as raw bytes; the node validates it, puts it in its [[mempool|pool]], gossips it to peers, and returns the transaction hash.",
    sections: [
      {
        heading: "Parameter and result",
        paragraphs: [
          "The single parameter is DATA: the [[rlp|RLP]]-encoded legacy transaction, or the [[transaction-types|typed envelope]] `0x02…`, `0x03…`, `0x04…` for the newer types. Signing happens entirely on the caller's side, so the node never sees a private key and cannot alter a single byte without invalidating the [[ecdsa-signature|signature]]. This is the only write method an ordinary endpoint should expose.",
          "On success the result is the 32-byte transaction hash. That hash is [[keccak-256|Keccak-256]] of the very bytes you sent, so you can compute it before the call and do not need the response to know it. The return value means 'accepted into this node's pool', nothing more: no block, no execution, no success. Confirmation comes later from [[eth-get-transaction-receipt|eth_getTransactionReceipt]].",
        ],
      },
      {
        heading: "What the node checks",
        paragraphs: [
          "Before accepting, the client verifies the signature and recovers the sender, checks the `chainId` against its own, and rejects a [[nonce|nonce]] below the account's current one with `nonce too low`. It requires the sender's balance to cover `gas × maxFeePerGas + value` (`insufficient funds for gas * price + value`), the gas limit to be at least the intrinsic cost (`intrinsic gas too low`) and no more than the block gas limit, and the fees to clear the pool's minimum (`transaction underpriced`). Resubmitting the same bytes yields `already known`, and replacing a queued nonce without a large enough fee bump yields `replacement transaction underpriced`.",
          "All of this is pool policy layered on consensus rules and differs between clients and [[rpc-provider|providers]]; a transaction whose `maxFeePerGas` sits below the current base fee is held by some and refused by others. None of these checks predicts execution: a transaction that will revert is accepted, mined, and charged for its [[gas|gas]] exactly as a successful one is.",
        ],
      },
      {
        heading: "Broadcast, retries, and privacy",
        paragraphs: [
          "Acceptance starts propagation over [[devp2p|devp2p]] to a handful of peers, which forward it further. A node with no peers accepts your transaction and never tells anyone. Because the hash is fixed by the bytes, the call is idempotent: if the response is lost, resending the identical payload either succeeds again or answers `already known`, and both mean the same thing. That property is what makes [[retries|retries]] safe here and unsafe for most write APIs.",
          "Submitting to a public endpoint publishes your intent before it is mined, which is what makes sandwiching possible; see [[mev|MEV]]. [[private-rpc|Private transaction RPC]] endpoints accept the same method but route to builders instead. On an [[l2-rpc|L2]] it usually reaches the [[sequencer|sequencer]] directly, which is why L2 submissions feel instant and are not final until the batch settles on L1.",
        ],
      },
    ],
    example: {
      title: "Submitting a signed transaction and being rejected",
      language: "json",
      code: "// request: one typed, signed transaction as raw bytes\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_sendRawTransaction\",\"params\":[\"0x02f8730182 01f4843b9aca00850 6fc23ac00825208940 …\"]}\n\n// accepted: the hash of exactly those bytes\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060\"}\n\n// rejected: the nonce was already used\n{\"jsonrpc\":\"2.0\",\"id\":2,\"error\":{\"code\":-32000,\"message\":\"nonce too low: next nonce 501, tx nonce 500\"}}\n\n// rejected: a replacement without a big enough fee bump\n{\"jsonrpc\":\"2.0\",\"id\":3,\"error\":{\"code\":-32000,\"message\":\"replacement transaction underpriced\"}}",
      note: "Spaces in the payload are only for readability here; the real parameter is one unbroken `0x` string.",
    },
    pitfalls: [
      "Reading the returned hash as confirmation; it means the node queued the bytes, and the transaction may still be dropped, replaced, or reverted.",
      "Treating `already known` as an error and re-signing with a new nonce, which creates a second transaction competing with the first.",
      "Submitting to one endpoint and polling for the receipt on another, where the second node has not seen the transaction yet.",
      "Expecting the node to reject a transaction that will revert; pool validation checks funds and encoding, never execution outcome.",
    ],
    related: ["transaction", "mempool", "eth-get-transaction-receipt", "nonce", "eth-get-transaction-count", "private-rpc", "rpc-errors", "retries", "devp2p", "transaction-types"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: eth_sendRawTransaction", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_sendrawtransaction" },
      { title: "EIP-1474: Remote procedure call specification", url: "https://eips.ethereum.org/EIPS/eip-1474" },
    ],
  },
  {
    id: "eth-send-transaction",
    title: "eth_sendTransaction",
    category: "requests",
    aliases: ["sendTransaction", "eth_sendTransaction", "unlocked account", "node-side signing"],
    summary: "`eth_sendTransaction` asks the node to fill in, sign, and broadcast a [[transaction|transaction]] using a private key it holds for the `from` [[address|address]] — which is why almost no public endpoint implements it.",
    sections: [
      {
        heading: "What it does",
        paragraphs: [
          "The parameter is a transaction object: `from`, `to`, `value`, `data`, and optionally `gas`, `nonce`, and fee fields. Anything omitted the node fills in itself — it looks up the pending [[nonce|nonce]], estimates [[gas|gas]], and picks a fee — then signs with the key for `from` and submits. The result is the transaction hash, exactly as [[eth-send-raw-transaction|eth_sendRawTransaction]] returns.",
          "The precondition is that the node holds and has unlocked that key. This is a design from the era when running your own node and keeping your keys in its keystore were the same activity. It makes the RPC port equivalent to the private key: anyone who can reach it can move the funds, with no signature required from the caller.",
        ],
      },
      {
        heading: "Why it is disabled",
        paragraphs: [
          "Every serious deployment turns it off. A [[rpc-provider|provider]] has no keys for your accounts and could not sign if it wanted to, so it answers with a method-not-found [[rpc-errors|error]]. [[geth|Geth]] deprecated and then removed its `personal_` account-management methods in favour of the external signer Clef, and exposing an unlocked account over HTTP has long been one of the first items on any [[security|RPC hardening]] checklist. If you find an endpoint that will sign for you, someone has made a serious mistake.",
          "The replacement pattern is the one every wallet and backend now uses: build the transaction, sign locally with a key the node never sees, and submit the bytes with `eth_sendRawTransaction`. Server-side signers, hardware wallets, and remote signing services all sit on that split, and it is why the write path in the API is a single method that accepts opaque bytes.",
        ],
      },
      {
        heading: "Where you still meet it",
        paragraphs: [
          "Browser wallets keep the name alive. A dapp calls `eth_sendTransaction` through the [[eip-1193|EIP-1193 provider]], but the wallet is not a node: it intercepts the request, shows the user a confirmation, signs with its own key, and forwards the raw bytes to its own RPC endpoint. The method name is the same and the trust model is entirely different, which is a routine source of confusion when reading wallet documentation next to node documentation. The wallet's other requests are covered by the [[wallet-rpc|wallet_ methods]].",
          "[[local-devnet|Local development nodes]] also implement it, and there it is a convenience rather than a risk. Anvil and Hardhat Network start with prefunded unlocked accounts, so tests and scripts can send transactions without key management, and both add impersonation so you can send as any address on a forked chain. Code written against that convenience breaks the moment it points at a real endpoint.",
        ],
      },
    ],
    example: {
      title: "Accepted on a dev node, refused by a provider",
      language: "bash",
      code: "# Anvil: accounts are unlocked and prefunded\ncast rpc eth_sendTransaction \\\n  '{\"from\":\"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\",\"to\":\"0x70997970C51812dc3A010C7d01b50e0d17dc79C8\",\"value\":\"0xde0b6b3a7640000\"}' \\\n  --rpc-url http://127.0.0.1:8545\n# \"0x9d0e77a1…4a12\"\n\n# a hosted endpoint has no key for that address\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_sendTransaction\",\"params\":[{\"from\":\"0xd8dA…6045\",\"to\":\"0x388c…9297\",\"value\":\"0x0\"}]}' \\\n  https://rpc.example\n# {\"jsonrpc\":\"2.0\",\"id\":1,\"error\":{\"code\":-32601,\"message\":\"the method eth_sendTransaction does not exist/is not available\"}}",
      note: "Code that works against a local devnet and fails with `-32601` in production is almost always relying on node-side signing.",
    },
    pitfalls: [
      "Writing scripts against a dev node's unlocked accounts and discovering in production that no real endpoint will sign.",
      "Unlocking an account on a node whose RPC port is reachable, which hands the key's authority to anyone who can send it a request.",
      "Confusing the wallet's `eth_sendTransaction` with the node method; the wallet signs in the browser and forwards raw bytes.",
      "Letting the node choose the nonce and fees for a burst of transactions, which races its own pending bookkeeping.",
    ],
    related: ["eth-send-raw-transaction", "security", "eip-1193", "local-devnet", "signing-methods", "wallet-rpc", "namespaces", "transaction", "nonce"],
    sources: [
      { title: "ethereum.org: eth_sendTransaction", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_sendtransaction" },
      { title: "Geth: account management and Clef", url: "https://geth.ethereum.org/docs/tools/clef/introduction" },
      { title: "Foundry Book: Anvil", url: "https://book.getfoundry.sh/anvil/" },
    ],
  },
  {
    id: "eth-get-logs",
    title: "eth_getLogs",
    category: "requests",
    aliases: ["getLogs", "eth_getLogs", "logs", "events", "filter logs", "topics"],
    summary: "`eth_getLogs` returns every [[event-log|log]] in a block range that matches a filter on emitting [[address|address]] and indexed topics, as a flat array in chain order.",
    sections: [
      {
        heading: "The filter object",
        paragraphs: [
          "One parameter, an object with up to five fields. `fromBlock` and `toBlock` bound the range and accept numbers or [[block-tag|tags]], defaulting to `latest` when omitted. `address` restricts to one emitting contract or, as an array, to several. `topics` is an array of up to four positions. `blockHash`, added by EIP-234, names exactly one block and cannot be combined with the range fields.",
          "Topic matching is positional and easy to get backwards. Position `i` matches the log's `topics[i]`, `null` in a position matches anything, a single value must match exactly, and an array in a position means OR. Across positions the conditions are ANDed. `topics[0]` is normally the [[event-signature|event signature hash]], and positions 1 to 3 are the indexed parameters, so `[sigHash, null, [aliceTopic, bobTopic]]` means 'this event, any sender, recipient Alice or Bob'. A filter with fewer positions than the log has topics still matches.",
          "Each returned log carries `address`, `topics`, `data`, `blockNumber`, `blockHash`, `transactionHash`, `transactionIndex`, `logIndex`, and `removed`. From `eth_getLogs` the `removed` flag is always `false`, because the method only reports the canonical chain; `true` appears only in [[eth-filters|filter]] and [[eth-subscribe|subscription]] deliveries, where a [[reorg|reorg]] can retract a log you were already given.",
        ],
      },
      {
        heading: "How the node answers",
        paragraphs: [
          "Logs are not stored in a queryable table; they live inside [[transaction-receipt|receipts]]. The classic algorithm tests each [[block-header|block header]]'s 2048-bit [[logs-bloom|logs bloom]] against the requested address and topics, and only for blocks that might match does it load the receipts and filter exactly. The bloom gives false positives but never false negatives, so the only penalty is wasted receipt reads. Modern clients keep an auxiliary index over the blooms or over topics, so a wide range no longer means touching every header, but the work still scales with range width and with how common your topics are.",
          "The method needs history, not [[state|state]], so a [[pruned-node|pruned node]] answers for whatever receipts it kept. A node under [[history-expiry|history expiry]] returns nothing for pre-Merge ranges, which looks exactly like 'no matching events' unless you check the range against what the node retains. That ambiguity is why serious [[indexer|indexers]] verify their range coverage independently.",
        ],
      },
      {
        heading: "Limits and scanning patterns",
        paragraphs: [
          "This is the method [[rpc-provider|providers]] restrict most. Typical caps are a maximum block span, often 2,000 to 10,000 blocks, a maximum number of returned logs, often 10,000, and a wall-clock timeout, each surfaced as a distinct [[rpc-errors|error]] such as `query returned more than 10000 results` or `block range is too large`. An unfiltered query over a wide range is the cheapest way to make a node unresponsive, so self-hosted nodes cap it too.",
          "The robust pattern is adaptive: scan in fixed windows, halve the window on a limit error, widen it after a run of successes, and persist a durable cursor of the last fully processed block and its hash. Never advance the cursor to `latest`; stop a few [[confirmations|confirmations]] short, or at the `finalized` tag, so a reorg cannot retract logs you have already committed. See [[cursor-pagination|cursor and range pagination]].",
          "When you need the full outcome rather than just the events, [[eth-get-block-receipts|eth_getBlockReceipts]] is the better tool: it gives `status`, `gasUsed`, and the transactions that emitted nothing, all of which this method omits by construction.",
        ],
      },
    ],
    example: {
      title: "ERC-20 transfers to either of two recipients",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getLogs\",\"params\":[{\n  \"fromBlock\": \"0x12d4f00\",\n  \"toBlock\": \"0x12d4f1c\",\n  \"address\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  \"topics\": [\n    \"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\",\n    null,\n    [\n      \"0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045\",\n      \"0x000000000000000000000000388c818ca8b9251b393131c08a736a67ccb19297\"\n    ]\n  ]\n}]}\n\n// result (abridged)\n[\n  {\n    \"address\": \"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48\",\n    \"topics\": [\"0xddf252ad…3ef\", \"0x000…1f2e\", \"0x000…6045\"],\n    \"data\": \"0x0000000000000000000000000000000000000000000000000000000005f5e100\",\n    \"blockNumber\": \"0x12d4f1c\",\n    \"blockHash\": \"0x9b83c12c…ee71\",\n    \"transactionHash\": \"0x5c504ed4…22060\",\n    \"transactionIndex\": \"0x1\",\n    \"logIndex\": \"0x0\",\n    \"removed\": false\n  }\n]\n\n// too wide a range\n{\"jsonrpc\":\"2.0\",\"id\":2,\"error\":{\"code\":-32005,\"message\":\"query returned more than 10000 results\"}}",
      note: "`topics[1]` is `null`, so any sender matches; the array in `topics[2]` is an OR over two recipients, both left-padded to 32 bytes.",
    },
    pitfalls: [
      "Reading topic arrays as an OR across the whole filter; positions are ANDed and only values inside one position are ORed.",
      "Filtering on a dynamic indexed parameter such as a `string`; the topic holds its Keccak hash, so hash before comparing.",
      "Advancing an indexer cursor to `latest`, which commits logs that a reorg can still retract.",
      "Treating an empty result over an old range as 'no events' when the node may simply no longer hold those receipts.",
    ],
    related: ["event-log", "event-signature", "logs-bloom", "cursor-pagination", "indexer", "eth-subscribe", "eth-filters", "reorg", "rate-limits", "eth-get-block-receipts", "history-expiry"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: eth_getLogs", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_getlogs" },
      { title: "EIP-234: Add blockHash to eth_getLogs", url: "https://eips.ethereum.org/EIPS/eip-234" },
    ],
  },
  {
    id: "eth-filters",
    title: "Polling filters",
    category: "requests",
    aliases: ["eth_newFilter", "eth_getFilterChanges", "eth_newBlockFilter", "eth_newPendingTransactionFilter", "eth_uninstallFilter", "eth_getFilterLogs", "filter id"],
    summary: "Filters are server-side cursors: you install one with `eth_newFilter`, `eth_newBlockFilter`, or `eth_newPendingTransactionFilter`, then call `eth_getFilterChanges` to receive only what appeared since your previous poll.",
    sections: [
      {
        heading: "The six methods",
        paragraphs: [
          "`eth_newFilter` takes the same filter object as [[eth-get-logs|eth_getLogs]] and returns an opaque id such as `0x1a4b…`. `eth_newBlockFilter` and `eth_newPendingTransactionFilter` take no parameters and watch new [[block|blocks]] and new pool entries instead. `eth_getFilterChanges` takes the id and returns an array of whatever is new: [[event-log|log]] objects for a log filter, [[block-hash|block hashes]] for a block filter, transaction hashes for a pending filter. `eth_getFilterLogs` returns everything a log filter matches from the start of its range, ignoring the cursor. `eth_uninstallFilter` deletes it and returns a boolean.",
          "The point of the design is that [[http-transport|HTTP]] cannot push. A server that cannot open a connection to you can still remember where you left off, so polling becomes cheap: the second and later calls transfer only the delta instead of re-running the whole query. Unlike `eth_getLogs`, a log filter's deliveries can contain entries with `removed` set to `true`, retracting logs it gave you before a [[reorg|reorg]] rewrote them.",
        ],
      },
      {
        heading: "Server-side state and its consequences",
        paragraphs: [
          "A filter id lives in the memory of one process on one node. That single fact explains every operational problem with filters. Behind a [[load-balancer|load balancer]] or an [[rpc-gateway|RPC gateway]] that spreads requests over a pool, the poll usually lands on a node that has never heard of your id and answers `filter not found`. Making filters work through a shared endpoint requires sticky routing, which most hosted endpoints do not offer.",
          "Filters also expire. Clients drop a filter that has not been polled for a few minutes — [[geth|Geth]]'s default deadline is five — and a node restart drops all of them at once. Recovery means installing a new filter, which starts from the current head and silently skips whatever happened in the gap, so a durable consumer must backfill the missed range with `eth_getLogs` rather than simply reinstalling. Each open filter also costs the node memory, which is why endpoints cap how many one client may hold.",
        ],
      },
      {
        heading: "When to use them",
        paragraphs: [
          "Use filters when you are restricted to HTTP against a single known node, for example a script talking to `http://127.0.0.1:8545` or a corporate network that forbids long-lived connections. In that setting they are genuinely more efficient than re-running a range query every few seconds.",
          "Otherwise prefer [[eth-subscribe|eth_subscribe]] over a [[websocket-transport|WebSocket]], which pushes the same events with no cursor to lose and no id to keep alive, or a plain `eth_getLogs` scan with your own durable cursor, the only approach that survives restarts, reorgs, and provider failover without gaps. Most [[client-libraries|client libraries]] pick one of the three transparently, so check what yours does before assuming which method is on the wire.",
        ],
      },
    ],
    example: {
      title: "Install, poll, and uninstall a log filter",
      language: "json",
      code: "// install\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_newFilter\",\"params\":[{\n  \"fromBlock\": \"latest\",\n  \"address\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  \"topics\": [\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\"]\n}]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x1a4b7cfe2d9f0e3a5c81\"}\n\n// poll: only what is new since the previous call\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_getFilterChanges\",\"params\":[\"0x1a4b7cfe2d9f0e3a5c81\"]}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"result\":[{\"address\":\"0xa0b8…eb48\",\"topics\":[\"0xddf252ad…3ef\",\"0x000…6045\",\"0x000…9297\"],\"data\":\"0x…\",\"blockNumber\":\"0x12d4f1d\",\"logIndex\":\"0x4\",\"removed\":false}]}\n\n// the filter expired or the poll hit a different backend\n{\"jsonrpc\":\"2.0\",\"id\":3,\"error\":{\"code\":-32000,\"message\":\"filter not found\"}}\n\n// clean up\n{\"jsonrpc\":\"2.0\",\"id\":4,\"method\":\"eth_uninstallFilter\",\"params\":[\"0x1a4b7cfe2d9f0e3a5c81\"]}\n{\"jsonrpc\":\"2.0\",\"id\":4,\"result\":true}",
      note: "An empty array from `eth_getFilterChanges` means nothing new; `filter not found` means your cursor is gone and the gap must be backfilled.",
    },
    pitfalls: [
      "Using filters through a provider pool, where each poll may reach a different node and the id exists on only one of them.",
      "Reinstalling a filter after `filter not found` and continuing; the new filter starts at the head and the intervening blocks are lost.",
      "Ignoring entries with `removed` set to `true`, which are retractions of logs the same filter already delivered.",
      "Leaking filters by never calling `eth_uninstallFilter`, which holds node memory until each one times out.",
    ],
    related: ["eth-subscribe", "eth-get-logs", "http-transport", "websocket-transport", "load-balancer", "rpc-gateway", "reorg", "event-log", "cursor-pagination"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: eth_newFilter", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_newfilter" },
    ],
  },
  {
    id: "eth-subscribe",
    title: "eth_subscribe",
    category: "requests",
    aliases: ["subscribe", "eth_subscribe", "eth_unsubscribe", "newHeads", "newPendingTransactions", "push notifications", "streaming"],
    summary: "`eth_subscribe` opens a push stream over a [[websocket-transport|WebSocket]] or [[ipc-transport|IPC]] connection, after which the node sends `eth_subscription` notifications for new heads, matching [[event-log|logs]], pending transactions, or sync status until you unsubscribe.",
    sections: [
      {
        heading: "The four subscription types",
        paragraphs: [
          "The first parameter names the stream and the second carries its options. `newHeads` pushes each new canonical [[block-header|block header]] as it is accepted, in the same shape [[eth-get-block-by-number|eth_getBlockByNumber]] returns without the transaction list. `logs` takes a filter object with `address` and `topics`, the same one [[eth-get-logs|eth_getLogs]] uses, and pushes matching logs as blocks arrive. `newPendingTransactions` pushes hashes of transactions entering this node's [[mempool|pool]], and several clients accept a boolean to receive full transaction objects instead. `syncing` pushes status changes when the node starts or finishes syncing.",
          "The call returns a subscription id. Notifications do not look like responses: they arrive as requests from the server, with `method` set to `eth_subscription` and a `params` object holding `subscription` and `result`. They carry no `id` of their own, so a client must route them by subscription id rather than by request id; see the [[request-response|JSON-RPC envelope]]. `eth_unsubscribe` takes the id and returns a boolean.",
        ],
      },
      {
        heading: "Connection-scoped state",
        paragraphs: [
          "A subscription belongs to one connection. When the socket closes — a network blip, a proxy idle timeout, a node restart, a [[load-balancer|load balancer]] rotating backends — every subscription on it is gone, no notification is sent about their loss, and nothing is buffered for replay. A client that reconnects and resubscribes resumes at the current head and never learns what happened in between.",
          "That gap is the central design problem. The standard remedy is to record the last block you fully processed, and after every reconnect run an [[eth-get-logs|eth_getLogs]] query from that block to the current head before trusting the stream again. The same applies to `newHeads`: compare each header's `parentHash` against the previous one you saw, because a [[reorg|reorg]] shows up as a new head whose parent you do not recognize, not as an explicit event. Log notifications do carry `removed: true` entries when a delivered log is retracted.",
        ],
      },
      {
        heading: "Practical use and limits",
        paragraphs: [
          "`newHeads` is the correct way to drive a per-block loop and replaces polling [[eth-block-number|eth_blockNumber]]. A `logs` subscription is excellent for reacting quickly and poor as a system of record, so production [[indexer|indexers]] usually treat it as a low-latency hint and keep a [[eth-get-logs|eth_getLogs]] scan with a durable cursor as the authority.",
          "`newPendingTransactions` is a firehose — mainnet sees a large and variable number of pool entries per second — and it reports one node's pool, not the network's, so two endpoints legitimately disagree. [[rpc-provider|Providers]] frequently cap the number of concurrent subscriptions per connection, disable pending-transaction streams entirely, or bill notifications individually. Where only [[http-transport|HTTP]] is available, [[eth-filters|polling filters]] are the fallback.",
        ],
      },
    ],
    example: {
      title: "Subscribing to new heads and receiving a notification",
      language: "json",
      code: "// over a WebSocket connection\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_subscribe\",\"params\":[\"newHeads\"]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0xcd0c3e8af590364c09d0fa6a1210faf5\"}\n\n// a push notification: note method eth_subscription and no id\n{\"jsonrpc\":\"2.0\",\"method\":\"eth_subscription\",\"params\":{\n  \"subscription\": \"0xcd0c3e8af590364c09d0fa6a1210faf5\",\n  \"result\": {\n    \"number\": \"0x12d4f1d\",\n    \"hash\": \"0x3f8c2ab1…77de\",\n    \"parentHash\": \"0x9b83c12c…ee71\",\n    \"timestamp\": \"0x67f3a2bc\",\n    \"baseFeePerGas\": \"0x3f5476a0\",\n    \"gasUsed\": \"0x1a3f2c8\"\n  }\n}}\n\n// a filtered log stream\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_subscribe\",\"params\":[\"logs\",{\n  \"address\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  \"topics\": [\"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\"]\n}]}\n\n{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"eth_unsubscribe\",\"params\":[\"0xcd0c3e8af590364c09d0fa6a1210faf5\"]}",
      note: "The notification's `parentHash` matches the previous head's `hash`; when it does not, the chain reorganized and you must re-read the affected range.",
    },
    pitfalls: [
      "Trusting a stream across reconnects; nothing is buffered, so every reconnect needs a backfill query for the missed range.",
      "Routing notifications by request id, which they do not have; match on the `subscription` field instead.",
      "Treating a `logs` stream as a complete history, when a connection drop silently removes events that never arrive.",
      "Subscribing to `newPendingTransactions` on a shared endpoint and being throttled or disconnected for the volume it produces.",
      "Assuming a reorg arrives as an event on `newHeads`; you detect it yourself by checking `parentHash` continuity.",
    ],
    related: ["websocket-transport", "eth-filters", "eth-get-logs", "reorg", "request-response", "indexer", "mempool", "head-lag", "ipc-transport", "eth-block-number"],
    sources: [
      { title: "Geth: RPC PUB/SUB", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc/pubsub" },
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "eth-syncing",
    title: "eth_syncing",
    category: "requests",
    aliases: ["syncing", "eth_syncing", "sync status", "is the node ready", "catching up"],
    summary: "`eth_syncing` returns `false` when the [[execution-client|execution client]] believes it is caught up, and otherwise an object with `startingBlock`, `currentBlock`, and `highestBlock` describing how far through a sync it is.",
    sections: [
      {
        heading: "What it returns",
        paragraphs: [
          "The method takes no parameters and has an awkward result type: a boolean `false`, or an object — never `true`. The three specified fields are [[hex-encoding|QUANTITIES]]: where this sync run began, which [[block|block]] has been processed, and the highest block known to be available. Clients add their own fields around those, because the three numbers describe a linear block-by-block sync and modern [[sync-modes|sync modes]] are not linear.",
          "[[geth|Geth]] during [[snap-sync|snap sync]] reports progress counters for accounts, bytecodes, storage slots, and trie nodes healed. [[erigon|Erigon]] reports its staged-sync stages. [[nethermind|Nethermind]] and [[reth|Reth]] expose their own. Parse the three standard fields and treat everything else as informational, because none of it is portable across clients.",
        ],
      },
      {
        heading: "Why false does not mean ready",
        paragraphs: [
          "The answer describes this client's own opinion of its own progress, and there are several ways for that opinion to be right while the node is useless. A node whose [[consensus-client|consensus client]] has stopped receives no more `engine_forkchoiceUpdated` calls over the [[engine-api|Engine API]], so its head simply stops advancing; it is not syncing, because nothing is asking it to. A node with zero peers has nothing to sync to and reports `false`. A node that just finished snap sync answers `false` before it has any historical [[state|state]], so [[eth-call|eth_call]] at older blocks still fails.",
          "The inverse also happens. During [[checkpoint-sync|checkpoint sync]] and optimistic import, a consensus client can be feeding payloads the execution client has not yet fully validated, and what the pair reports is genuinely in between. Never gate traffic on this method alone.",
        ],
      },
      {
        heading: "Using it in a health check",
        paragraphs: [
          "A usable [[health-check|health check]] combines four cheap signals: `eth_syncing` is `false`; the latest block's `timestamp` is within roughly a minute of wall-clock time, which catches the stalled-head case that nothing else catches; `eth_chainId` matches the chain you expect, which catches a misconfigured backend; and `net_peerCount` is non-zero. Compare the head against a second independent source as well, because a node can be consistently wrong on its own.",
          "For [[load-balancer|load balancing]] and [[failover|failover]], the sync object is also a routing input: a backend that is syncing should be drained rather than merely deprioritized, since it will answer [[eth-get-balance|state reads]] with errors rather than with stale values. The [[beacon-api|Beacon API]]'s `/eth/v1/node/syncing` route gives the consensus half of the same picture, including whether the node is optimistic.",
        ],
      },
    ],
    example: {
      title: "Syncing, then synced",
      language: "json",
      code: "// still catching up (Geth, snap sync; extra fields are client-specific)\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_syncing\",\"params\":[]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{\n  \"startingBlock\": \"0x12c0000\",\n  \"currentBlock\": \"0x12d1a40\",\n  \"highestBlock\": \"0x12d4f1c\",\n  \"syncedAccounts\": \"0x1f4a2c33\",\n  \"syncedBytecodes\": \"0x3a91\",\n  \"healedTrienodes\": \"0x8c2d71\"\n}}\n\n// caught up, as far as this client is concerned\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_syncing\",\"params\":[]}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"result\":false}",
      note: "`false` is a claim about progress, not about freshness; check the head block's `timestamp` before routing traffic to this node.",
    },
    pitfalls: [
      "Using `false` as the only readiness signal, which passes for a node whose consensus client died and whose head froze hours ago.",
      "Expecting the result to be `true` while syncing; the syncing case is an object, so a naive boolean check inverts the meaning.",
      "Parsing client-specific progress fields as if they were standard, then breaking when the operator switches client.",
      "Assuming a node that reports `false` can serve historical state; snap sync finishes without any history behind the head.",
    ],
    related: ["health-check", "sync-modes", "snap-sync", "engine-api", "head-lag", "net-web3-api", "failover", "beacon-api", "full-node"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: eth_syncing", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_syncing" },
    ],
  },
  {
    id: "eth-simulate",
    title: "eth_simulateV1",
    category: "requests",
    aliases: ["simulateV1", "eth_simulateV1", "simulation", "bundle simulation", "multicall rpc", "blockStateCalls"],
    summary: "`eth_simulateV1` runs a sequence of calls across one or more hypothetical [[block|blocks]] on top of real [[state|state]], with per-block [[state-override|state and block overrides]], and returns each call's result, [[event-log|logs]], and [[gas|gas]] usage.",
    sections: [
      {
        heading: "What it does",
        paragraphs: [
          "The first parameter is an object whose main field is `blockStateCalls`, an array of block descriptions. Each entry may carry `blockOverrides` (values such as `number`, `time`, `baseFeePerGas`, `gasLimit`), `stateOverrides` (the same map [[eth-call|eth_call]] accepts), and `calls`, an ordered array of call objects. Three booleans shape the run: `validation` applies the checks a real [[transaction|transaction]] would face instead of executing loosely, `traceTransfers` surfaces plain ether movements as synthetic `Transfer` logs so value flow is visible, and `returnFullTransactions` expands the transactions in the returned blocks. The second parameter is the base block identifier.",
          "The result is an array of simulated block objects, each with header-shaped fields and a `calls` array containing `status`, `returnData`, `gasUsed`, `logs`, and an `error` object when a call fails. State carries forward: call two sees what call one wrote, and block two sees everything block one did, which is exactly what a chain of [[eth-call|eth_call]] requests cannot do.",
        ],
      },
      {
        heading: "Why it exists",
        paragraphs: [
          "Before it, every non-trivial simulation was vendor-specific. Wallets wanting to show 'what will this transaction do to my balances' used provider APIs, searchers used [[debug-api|debug_traceCall]] with overrides, and multi-step flows such as approve-then-swap could not be modelled at all without sending the first transaction for real. `eth_simulateV1` went through the [[execution-apis|execution-apis]] process to make that a standard method with defined semantics.",
          "The `blockOverrides` are what make future-dated logic testable: move `time` forward to cross a vesting cliff or an auction deadline, raise `number` to pass a block-height check, or set `baseFeePerGas` to see how a contract behaves under congestion. `traceTransfers` matters more than it sounds, because ether movements emit no logs on a real chain, so without it a simulation of a withdrawal shows nothing at all.",
        ],
      },
      {
        heading: "Cost and availability",
        paragraphs: [
          "One request can execute dozens of calls across several blocks, so it is priced and capped like a tracing method rather than like a read. Clients enforce a total gas ceiling across the whole simulation and a limit on how many blocks you may stack, and [[rpc-provider|providers]] add their own [[rate-limits|compute-unit]] weights. Simulating on top of an old block needs historical state and therefore an [[archive-node|archive node]].",
          "Support arrived across [[geth|Geth]], [[nethermind|Nethermind]], [[erigon|Erigon]], and [[reth|Reth]] during 2024 and 2025, but it is still the newest method here and the first thing an older gateway rejects, so probe it at startup and keep an [[eth-call|eth_call]] fallback; see [[endpoint-capabilities|endpoint capabilities]]. A simulation is also a prediction against state that will have moved by the time a real transaction lands, and it cannot model what other people's transactions do first; see [[mev|MEV]].",
        ],
      },
    ],
    example: {
      title: "Approve then transfer, with a funded balance override",
      language: "json",
      code: "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_simulateV1\",\"params\":[\n  {\n    \"blockStateCalls\": [\n      {\n        \"blockOverrides\": { \"baseFeePerGas\": \"0x3b9aca00\" },\n        \"stateOverrides\": {\n          \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\": { \"balance\": \"0x56bc75e2d63100000\" }\n        },\n        \"calls\": [\n          { \"from\": \"0xd8dA…6045\", \"to\": \"0xA0b8…eB48\", \"data\": \"0x095ea7b3…\" },\n          { \"from\": \"0xd8dA…6045\", \"to\": \"0x7a25…488D\", \"data\": \"0x38ed1739…\" }\n        ]\n      }\n    ],\n    \"validation\": true,\n    \"traceTransfers\": true\n  },\n  \"latest\"\n]}\n\n// result (abridged): one entry per simulated block\n[\n  {\n    \"number\": \"0x12d4f1d\",\n    \"timestamp\": \"0x67f3a2bc\",\n    \"gasUsed\": \"0x1e8f4\",\n    \"baseFeePerGas\": \"0x3b9aca00\",\n    \"calls\": [\n      { \"status\": \"0x1\", \"returnData\": \"0x000…0001\", \"gasUsed\": \"0xb1c4\", \"logs\": [ { \"address\": \"0xa0b8…eb48\", \"topics\": [\"0x8c5be1e5…c1c925\"], \"data\": \"0x…\" } ] },\n      { \"status\": \"0x1\", \"returnData\": \"0x…\", \"gasUsed\": \"0x13d30\", \"logs\": [ { \"address\": \"0xa0b8…eb48\", \"topics\": [\"0xddf252ad…3ef\"], \"data\": \"0x…\" } ] }\n    ]\n  }\n]",
      note: "The second call sees the allowance the first one wrote, which is the whole point; two separate `eth_call` requests would each start from unmodified state.",
    },
    pitfalls: [
      "Running with `validation` off and concluding the transaction will succeed; loose mode skips nonce, balance, and fee checks a real transaction must pass.",
      "Forgetting `traceTransfers` and reporting 'no value moved' for a call whose entire effect was an ether transfer, which emits no log.",
      "Treating simulated `gasUsed` as a gas limit; it is the cost under your overrides, not a minimum limit that survives real ordering.",
      "Stacking many blocks with large calls until the request trips the client's total gas ceiling, which fails the whole simulation rather than one call.",
    ],
    related: ["eth-call", "state-override", "eth-estimate-gas", "debug-api", "execution-apis", "archive-node", "endpoint-capabilities", "mev", "block"],
    sources: [
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "state-override",
    title: "State overrides",
    category: "requests",
    aliases: ["stateOverrides", "state override set", "override balance", "override code", "stateDiff", "override account"],
    summary: "A state override is an optional map passed alongside [[eth-call|eth_call]], [[eth-estimate-gas|eth_estimateGas]], or [[eth-simulate|eth_simulateV1]] that replaces an [[account|account]]'s balance, nonce, code, or storage for the duration of that simulation only.",
    sections: [
      {
        heading: "The shape of an override",
        paragraphs: [
          "The override set is a JSON object keyed by [[address|address]]. Each value may set `balance`, `nonce`, `code`, and one of `state` or `stateDiff`. `state` discards the account's entire [[contract-storage|storage]] and installs exactly the slots you list; `stateDiff` keeps the real storage and patches only the slots you name. Supplying both for one account is an error, and mixing them up is the difference between 'this contract has one balance entry' and 'this contract has one changed balance entry'. Some clients also accept `movePrecompileToAddress`, which relocates a precompile so you can put your own code at its address.",
          "Overrides apply to the [[state|state]] the simulation starts from and are discarded when it ends. They are per-request, never persisted, never gossiped, and invisible to every other caller. In [[eth-simulate|eth_simulateV1]] they are a first-class field of each entry in `blockStateCalls`, alongside `blockOverrides` for header values such as `time` and `number`, which plain `eth_call` cannot change.",
        ],
      },
      {
        heading: "What it is for",
        paragraphs: [
          "The common case is removing a precondition you have not met. Override your balance to price a trade you cannot yet afford, patch an ERC-20 allowance slot to simulate a swap without sending the approval first, or set a token balance to quote a sale. The next case is testing code that is not deployed: put a candidate implementation in `code` at the real contract's address and run the existing calldata against it, which is how upgrade proposals are checked against live state.",
          "Overrides also make otherwise impossible reads possible. Deploying a throwaway helper at an unused address and calling it in the same request exposes an internal value the real contract never returns — the technique [[multicall|Multicall]]-style deployless libraries use. And overriding a single storage slot is often the fastest way to confirm a diagnosis: if forcing a flag to `true` makes the [[revert|revert]] go away, that flag was the cause.",
        ],
      },
      {
        heading: "Limits and caveats",
        paragraphs: [
          "Overrides are a de facto standard rather than an original part of the specification: [[geth|Geth]] introduced them, and [[nethermind|Nethermind]], [[erigon|Erigon]], and [[reth|Reth]] follow, but coverage differs by method — support on `eth_call` is near universal, on `eth_estimateGas` and [[eth-create-access-list|eth_createAccessList]] less so — and some [[rpc-provider|providers]] strip the third parameter silently, which is worse than rejecting it because the answer then describes unmodified state.",
          "Gas figures measured under overrides are approximations: replacing `code` changes the instructions executed, and pre-setting a slot turns a 20,000-gas first write into a 2,900-gas update. Treat an overridden simulation as an answer to 'what happens if the world looked like this', and validate the assumptions separately before acting on the number.",
        ],
      },
    ],
    example: {
      title: "Quoting a swap the caller cannot yet afford",
      language: "json",
      code: "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[\n  { \"from\": \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\n    \"to\": \"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D\",\n    \"data\": \"0x38ed1739…\" },\n  \"latest\",\n  {\n    \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\": {\n      \"balance\": \"0x56bc75e2d63100000\"\n    },\n    \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\": {\n      \"stateDiff\": {\n        \"0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3\": \"0x00000000000000000000000000000000000000000000000000000000e8d4a51000\"\n      }\n    }\n  }\n]}",
      note: "`balance` gives the caller 100 ether for this call only; `stateDiff` patches one token balance slot while leaving the rest of that contract's storage intact.",
    },
    pitfalls: [
      "Using `state` when you meant `stateDiff`, which wipes every other slot in that contract and makes totals, owners, and pool reserves read as zero.",
      "Assuming a provider honoured the override; some drop the third parameter silently and return an answer computed against real state.",
      "Quoting gas from an overridden run as a real gas limit, since pre-set slots and substituted code change the cost model.",
      "Overriding `code` at an address whose storage layout differs, so the new code reads the old slots as unrelated values.",
    ],
    related: ["eth-call", "eth-simulate", "eth-estimate-gas", "contract-storage", "account", "smart-contract", "multicall", "revert", "endpoint-capabilities"],
    sources: [
      { title: "Geth: eth_call state override set", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-eth" },
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
    ],
  },
  {
    id: "debug-api",
    title: "debug_ namespace",
    category: "requests",
    aliases: ["debug", "debug_traceTransaction", "debug_traceCall", "callTracer", "prestateTracer", "struct logger", "tracing", "debug_getRawBlock"],
    summary: "The `debug_` [[namespaces|namespace]] is the Geth-style tracing and introspection API: it re-executes transactions, calls, or whole [[block|blocks]] under a chosen tracer and returns an [[execution-trace|execution trace]], plus raw encodings of chain objects.",
    sections: [
      {
        heading: "The methods",
        paragraphs: [
          "The tracing core is four methods with the same options object. `debug_traceTransaction` takes a transaction hash and replays that transaction as it ran in its block. `debug_traceCall` takes a call object, a block identifier, and — like [[eth-call|eth_call]] — optional [[state-override|state overrides]], so it traces something that never happened. `debug_traceBlockByNumber` and `debug_traceBlockByHash` trace every transaction in a block and return one trace per transaction.",
          "Around them sit the raw accessors: `debug_getRawHeader`, `debug_getRawBlock`, `debug_getRawTransaction`, and `debug_getRawReceipts` return the [[rlp|RLP]] bytes a node stores and gossips, which is what you need to verify a hash yourself or to feed another tool. `debug_storageRangeAt` walks a contract's [[contract-storage|storage]] slot by slot. Client-specific additions go further, including methods that move the head or dump the database, which is why the namespace is treated as privileged.",
        ],
      },
      {
        heading: "Tracers",
        paragraphs: [
          "The `tracer` field in the options object picks what you get back. Omit it and you get the struct logger: one entry per executed opcode with program counter, gas, stack, and optionally memory and storage. It is complete and enormous — a complex transaction produces hundreds of megabytes of JSON — so memory is left out unless you set `enableMemory`, and `disableStack` and `disableStorage` cut it down further.",
          "`callTracer` is the one most people want: a nested tree of calls with `from`, `to`, `type` (`CALL`, `DELEGATECALL`, `STATICCALL`, `CREATE`), `input`, `output`, `gas`, `gasUsed`, and `error` or `revertReason` on failures. `tracerConfig: {\"onlyTopCall\": true}` collapses it to the outermost frame. `prestateTracer` returns every account and slot the transaction read, and with `diffMode: true` a before-and-after pair, which is how you reconstruct a state diff. `4byteTracer` counts function selectors, `noopTracer` measures the replay overhead, and `muxTracer` runs several at once. [[geth|Geth]] also accepts custom tracers written in JavaScript and ships `flatCallTracer` for output shaped like the [[trace-api|trace_ namespace]].",
        ],
      },
      {
        heading: "Cost, state requirements, and exposure",
        paragraphs: [
          "Tracing is re-execution, not a lookup. To trace transaction 40 of a block the client must reconstruct the state as of that point, replaying everything before it from a state it still holds; the `reexec` option caps how far back it will go before giving up with a 'required historical state unavailable' [[rpc-errors|error]]. Tracing an old block therefore needs an [[archive-node|archive node]], a single trace can cost hundreds of times an [[eth-call|eth_call]], and long traces need the `timeout` option raised.",
          "That cost is also the security problem. A handful of unauthenticated `debug_traceBlockByNumber` calls will saturate a node, and some methods in the namespace can alter its view of the chain. Keep `debug_` off the public listener — in [[geth|Geth]] it is absent from `--http.api` unless you add it — and expose it, if at all, through an authenticated internal path with a method allow-list; see [[security|RPC security]]. [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]], and [[besu|Besu]] all implement large parts of the namespace, and most [[rpc-provider|providers]] sell tracing as a separate, heavily metered tier.",
          "The practical uses are narrow and valuable: explaining why a transaction reverted deep inside a call tree, recovering internal ether transfers that emit no [[event-log|logs]], and attributing [[gas|gas]] across frames for accounting. For a whole-block sweep prefer one `debug_traceBlockByNumber` over one call per transaction, and check whether [[trace-api|trace_filter]] or an [[indexer|indexer]] already has the answer.",
        ],
      },
    ],
    example: {
      title: "A call tree from callTracer",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"debug_traceTransaction\",\"params\":[\n  \"0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060\",\n  { \"tracer\": \"callTracer\", \"tracerConfig\": { \"onlyTopCall\": false }, \"timeout\": \"60s\" }\n]}\n\n// result (abridged)\n{\n  \"type\": \"CALL\",\n  \"from\": \"0xd8da6bf26964af9d7eed9e03e53415d37aa96045\",\n  \"to\": \"0x7a250d5630b4cf539739df2c5dacb4c659f2488d\",\n  \"value\": \"0x0\",\n  \"gas\": \"0x186a0\",\n  \"gasUsed\": \"0x1d4c2\",\n  \"input\": \"0x38ed1739…\",\n  \"output\": \"0x…\",\n  \"calls\": [\n    {\n      \"type\": \"STATICCALL\",\n      \"from\": \"0x7a25…488d\",\n      \"to\": \"0xb4e1…11ec\",\n      \"gas\": \"0x14c08\",\n      \"gasUsed\": \"0x9e4\",\n      \"input\": \"0x0902f1ac\",\n      \"output\": \"0x…\"\n    },\n    {\n      \"type\": \"DELEGATECALL\",\n      \"from\": \"0xa0b8…eb48\",\n      \"to\": \"0x4351…9f1c\",\n      \"gas\": \"0xf2c1\",\n      \"gasUsed\": \"0x62d1\",\n      \"input\": \"0xa9059cbb…\",\n      \"error\": \"execution reverted\",\n      \"revertReason\": \"ERC20: transfer amount exceeds balance\"\n    }\n  ]\n}",
      note: "The failure is three frames deep: the receipt alone would only have shown `status` `0x0` on the outermost transaction.",
    },
    pitfalls: [
      "Tracing without a `tracer` option and receiving the full opcode log, which can be hundreds of megabytes for one transaction.",
      "Exposing `debug_` on a public endpoint, where a few tracing calls are enough to exhaust the node and some methods can change its head.",
      "Tracing an old transaction on a [[pruned-node|pruned node]] and reading 'historical state unavailable' as a bug rather than a retention limit.",
      "Treating a trace as cryptographic evidence; it is one node's replay of execution, verifiable only by re-running it yourself.",
    ],
    related: ["trace-api", "execution-trace", "eth-call", "state-override", "archive-node", "security", "geth", "namespaces", "revert", "rlp", "indexer"],
    sources: [
      { title: "Geth: debug namespace", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-debug" },
      { title: "Geth: built-in tracers", url: "https://geth.ethereum.org/docs/developers/evm-tracing/built-in-tracers" },
      { title: "Nethermind: JSON-RPC namespaces", url: "https://docs.nethermind.io/interacting/json-rpc-ns/" },
    ],
  },
  {
    id: "trace-api",
    title: "trace_ namespace",
    category: "requests",
    aliases: ["trace", "trace_transaction", "trace_block", "trace_filter", "trace_call", "trace_replayBlockTransactions", "parity traces", "internal transactions"],
    summary: "The `trace_` [[namespaces|namespace]] is the Parity-style tracing API carried forward by [[nethermind|Nethermind]], [[erigon|Erigon]], and [[reth|Reth]]: it returns a flat list of call frames, optional VM steps, and optional state diffs, and it can query traces across a block range by [[address|address]].",
    sections: [
      {
        heading: "The methods",
        paragraphs: [
          "Reading traces of what already happened: `trace_transaction` for one transaction hash, `trace_block` for every trace in a [[block|block]], and `trace_get` for one frame at a given position. Replaying with more detail: `trace_replayTransaction` and `trace_replayBlockTransactions`, which take a list of trace types. Tracing hypotheticals: `trace_call`, `trace_callMany` for an ordered sequence sharing state, and `trace_rawTransaction` for signed bytes that were never submitted.",
          "`trace_filter` is the method with no equivalent in the [[debug-api|debug_ namespace]] and the reason the namespace is still worth having. It takes `fromBlock`, `toBlock`, `fromAddress`, `toAddress`, `after`, and `count`, and returns every matching call frame in that range — which is how you answer 'what ether moved in and out of this address', including the internal transfers that emit no [[event-log|log]] and appear in no [[transaction-receipt|receipt]]. This is how [[block-explorer|block explorers]] populate their internal-transaction tabs.",
        ],
      },
      {
        heading: "The three trace types",
        paragraphs: [
          "Replay and call methods take an array of type names. `trace` gives the call frames. `vmTrace` gives an opcode-level record comparable to the default struct logger and is correspondingly enormous. `stateDiff` gives a per-account before-and-after for balance, nonce, code, and each touched [[contract-storage|storage]] slot, which is the cleanest way to answer 'what did this transaction change'. Ask for only what you need; each type multiplies the work.",
          "The `trace` output is flat where [[debug-api|callTracer]] output is nested. Each entry has `action` (with `from`, `to`, `value`, `gas`, `input`, or `init` for a creation), `result` (with `gasUsed` and `output` or `address`), `subtraces`, and `traceAddress`, an array of indices giving the frame's position in the tree — `[]` for the top call, `[0,1]` for the second child of the first child. `type` is `call`, `create`, `suicide`, or `reward`; the last only appears on pre-Merge blocks, since after [[the-merge|the Merge]] there is no execution-layer block reward to report.",
        ],
      },
      {
        heading: "Support, cost, and choosing between the namespaces",
        paragraphs: [
          "[[geth|Geth]] does not implement `trace_`; it offers `flatCallTracer` under `debug_` to produce similarly shaped output, without `trace_filter`. Nethermind, Erigon, and Reth implement the namespace natively, and Erigon and Reth are usually the clients of choice for heavy trace work because their storage layouts make historical replay cheap. Availability at a [[rpc-provider|provider]] is a paid, separate capability, and which methods are enabled varies; probe before designing around it, as with any [[endpoint-capabilities|endpoint capability]].",
          "Everything here is re-execution, so the same rules as `debug_` apply: an old block needs an [[archive-node|archive node]], responses are large, and a few unauthenticated `trace_block` calls will flatten a node. Keep the namespace off public listeners; [[nethermind|Nethermind]] serves whatever `--JsonRpc.EnabledModules` lists and its default list is broad, so on any exposed listener set it explicitly, for example `[Eth,Net,Web3]`, and add `Trace` only where it is wanted. Choose `trace_filter` when the question is address-scoped across a range, `trace_replay…` with `stateDiff` when the question is what changed, and the `debug_` tracers when you want a nested tree, a custom tracer, or [[state-override|state overrides]].",
          "As with any [[execution-trace|execution trace]], the answer is one node's replay, not a [[state-proof|proof]]. Two honest clients should agree, and comparing them is a reasonable consistency check, but nothing in the response is verifiable without running the execution yourself.",
        ],
      },
    ],
    example: {
      title: "Every call frame touching an address over a block range",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"trace_filter\",\"params\":[{\n  \"fromBlock\": \"0x12d4f00\",\n  \"toBlock\": \"0x12d4f1c\",\n  \"toAddress\": [\"0x388c818ca8b9251b393131c08a736a67ccb19297\"],\n  \"after\": 0,\n  \"count\": 100\n}]}\n\n// result (abridged)\n[\n  {\n    \"action\": {\n      \"callType\": \"call\",\n      \"from\": \"0x7a250d5630b4cf539739df2c5dacb4c659f2488d\",\n      \"to\": \"0x388c818ca8b9251b393131c08a736a67ccb19297\",\n      \"value\": \"0xde0b6b3a7640000\",\n      \"gas\": \"0x2328\",\n      \"input\": \"0x\"\n    },\n    \"result\": { \"gasUsed\": \"0x0\", \"output\": \"0x\" },\n    \"type\": \"call\",\n    \"traceAddress\": [1, 0],\n    \"subtraces\": 0,\n    \"blockNumber\": 19746588,\n    \"blockHash\": \"0x9b83c12c…ee71\",\n    \"transactionHash\": \"0x5c504ed4…22060\",\n    \"transactionPosition\": 1\n  }\n]",
      note: "`traceAddress` `[1,0]` places this frame as the first child of the second top-level call; the 1 ether transfer it records appears in no log and on no receipt.",
    },
    pitfalls: [
      "Expecting `trace_` on a Geth endpoint; Geth serves Geth-style tracers under `debug_` and has no `trace_filter` equivalent.",
      "Requesting `vmTrace` when `trace` would do, which turns a manageable response into an opcode-by-opcode dump.",
      "Reading `traceAddress` as a call depth; it is a path of child indices, so `[0,1]` and `[1,0]` are different frames at the same depth.",
      "Running `trace_filter` over a wide range with no address filter, which asks the node to replay every block in the window.",
      "Treating a trace as authoritative evidence rather than one node's replay of execution.",
    ],
    related: ["debug-api", "execution-trace", "nethermind", "erigon", "reth", "archive-node", "block-explorer", "event-log", "state-override", "namespaces", "endpoint-capabilities"],
    sources: [
      { title: "Nethermind: trace namespace", url: "https://docs.nethermind.io/interacting/json-rpc-ns/trace/" },
      { title: "Erigon documentation", url: "https://docs.erigon.tech/" },
      { title: "Reth book", url: "https://reth.rs/" },
    ],
  },
  {
    id: "txpool-api",
    title: "txpool_ namespace",
    category: "requests",
    aliases: ["txpool", "txpool_status", "txpool_content", "txpool_inspect", "txpool_contentFrom", "pending queue", "stuck transaction"],
    summary: "The `txpool_` [[namespaces|namespace]] exposes one node's [[mempool|transaction pool]]: `txpool_status` counts, `txpool_content` dumps every queued [[transaction|transaction]], `txpool_contentFrom` narrows to one sender, and `txpool_inspect` returns a human-readable summary.",
    sections: [
      {
        heading: "The methods and what they show",
        paragraphs: [
          "`txpool_status` returns `{ \"pending\": \"0x…\", \"queued\": \"0x…\" }` and is the only one of the four that is cheap. `txpool_content` returns the whole pool as a two-level map from sender [[address|address]] to [[nonce|nonce]] to full transaction object. `txpool_contentFrom` takes one address and returns the same structure for that sender alone. `txpool_inspect` has the same shape but replaces each transaction with a summary string such as `0x388c…9297: 1000000000000000000 wei + 21000 gas × 20000000000 wei`.",
          "The split between `pending` and `queued` is the useful part. Pending means executable now: the nonce follows on from the account's current one with no gap. Queued means held back, almost always because of a nonce gap — a transaction with nonce 12 when the account is at 10 and no nonce 11 exists — or because the transaction is otherwise not yet eligible. A transaction sitting in `queued` will never be mined until the gap is filled, which is exactly the diagnosis you cannot get from [[eth-get-transaction-by-hash|eth_getTransactionByHash]], since it reports a pool entry either way.",
        ],
      },
      {
        heading: "Why it is rarely available",
        paragraphs: [
          "None of these methods is part of the [[execution-apis|execution-apis]] specification; they originated in [[geth|Geth]] and were copied by [[nethermind|Nethermind]], [[erigon|Erigon]], and [[reth|Reth]] with small differences. Almost no [[rpc-provider|provider]] exposes `txpool_content`, for two reasons. The response is huge: a busy mainnet pool holds tens of thousands of transactions, so a single call serializes hundreds of megabytes and can stall the node while it does. And the contents are commercially sensitive — the pool is a list of what people are about to do, which is raw material for [[mev|MEV]].",
          "The answer is also strictly local. A pool is shaped by which peers a node has, its eviction policy, its minimum fee, and its size limits, so two honest nodes hold overlapping but different sets and neither is 'the' mempool. Any conclusion of the form 'the network has N pending transactions' drawn from one endpoint is wrong by construction.",
        ],
      },
      {
        heading: "Practical use",
        paragraphs: [
          "On your own node the namespace is the right tool for a stuck sender: `txpool_contentFrom` shows exactly which nonces are held and at what fee, which tells you whether to fill a gap, bump a fee, or cancel. `txpool_status` is cheap enough to scrape continuously, and a pending count that climbs steadily while the head advances normally is a good early signal of fee-market pressure; see [[observability|RPC observability]].",
          "If you expose it, expose `txpool_status` only, and keep `content` and `inspect` behind the same restrictions as the [[debug-api|debug_ namespace]]; see [[security|RPC security]]. Network-wide pool visibility is a data product built from many nodes, not an RPC method. [[eth-subscribe|eth_subscribe]] to `newPendingTransactions` gives the same local view as a stream instead of a dump.",
        ],
      },
    ],
    example: {
      title: "Counting the pool, then inspecting one sender",
      language: "bash",
      code: "curl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"txpool_status\",\"params\":[]}' \\\n  http://127.0.0.1:8545\n# {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{\"pending\":\"0x3a98\",\"queued\":\"0x1f4\"}}\n\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"txpool_contentFrom\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\"]}' \\\n  http://127.0.0.1:8545\n# {\n#   \"pending\": { \"500\": { \"hash\": \"0x5c504ed4…22060\", \"nonce\": \"0x1f4\", \"maxFeePerGas\": \"0x6fc23ac00\", … } },\n#   \"queued\":  { \"502\": { \"hash\": \"0x9d0e77a1…4a12\", \"nonce\": \"0x1f6\", \"maxFeePerGas\": \"0x6fc23ac00\", … } }\n# }",
      note: "Nonce 502 is queued because 501 is missing; nothing will mine it until that gap is filled or the pool evicts it.",
    },
    pitfalls: [
      "Reading `txpool_status` counts as the network's backlog; they describe one node's pool, shaped by its peers and limits.",
      "Calling `txpool_content` on a busy node, which can serialize hundreds of megabytes and degrade the node while it does.",
      "Exposing the namespace publicly, which publishes every user's intended transaction before it is mined.",
      "Concluding a transaction is lost because it is absent here; it may be in another node's pool, or already mined.",
    ],
    related: ["mempool", "nonce", "eth-get-transaction-count", "eth-send-raw-transaction", "security", "mev", "eth-subscribe", "namespaces", "observability"],
    sources: [
      { title: "Geth: txpool namespace", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool" },
      { title: "Nethermind: JSON-RPC namespaces", url: "https://docs.nethermind.io/interacting/json-rpc-ns/" },
    ],
  },
  {
    id: "net-web3-api",
    title: "net_ and web3_ methods",
    category: "requests",
    aliases: ["net_version", "net_peerCount", "net_listening", "web3_clientVersion", "web3_sha3", "client version", "peer count"],
    summary: "The `net_` and `web3_` [[namespaces|namespaces]] are five small utility methods that identify the network and the client software rather than reading chain data: `net_version`, `net_peerCount`, `net_listening`, `web3_clientVersion`, and `web3_sha3`.",
    sections: [
      {
        heading: "What each returns",
        paragraphs: [
          "`net_version` returns the network id as a decimal string — `\"1\"` for mainnet — which makes it the odd one out in an API where numbers are [[hex-encoding|hex QUANTITIES]]. It predates `eth_chainId` and is not the same concept: the network id governs [[devp2p|peer-to-peer]] handshakes while the [[chain-id|chain id]] governs signature replay protection, and although they match on the major networks, they need not. Use `eth_chainId` for anything that touches signing.",
          "`net_peerCount` returns a hex count of connected peers and `net_listening` a boolean for whether the node accepts inbound connections. `web3_clientVersion` returns a free-form version string identifying the implementation, such as `Geth/v1.15.11-stable-36b2371c/linux-amd64/go1.24.2` from [[geth|Geth]] or `Nethermind/v1.31.0+ab12cd34/linux-x64/dotnet8.0.11` from [[nethermind|Nethermind]]. `web3_sha3` hashes the DATA you pass and, despite the name, returns [[keccak-256|Keccak-256]], not NIST SHA3-256 — a naming accident from before the standard was finalized.",
        ],
      },
      {
        heading: "Identifying what you are talking to",
        paragraphs: [
          "`web3_clientVersion` is the first call to make against an unfamiliar endpoint. It tells you which implementation you have reached, which decides whether `trace_` or `debug_` will work, whether [[eth-simulate|eth_simulateV1]] is available, and how errors will be worded. It is also the practical way to survey [[client-diversity|client diversity]], although a hosted endpoint may answer for a gateway, return a redacted string, or rotate between several backends running different clients.",
          "Version strings are free-form and clients change them, so parse defensively: match on the leading implementation name and treat everything after it as opaque. Combine it with a few probe calls before deciding what an endpoint supports; see [[endpoint-capabilities|endpoint capabilities]].",
        ],
      },
      {
        heading: "Peers, health, and limits",
        paragraphs: [
          "`net_peerCount` belongs in a [[health-check|health check]] because zero peers is the failure mode that other signals miss: the node keeps answering, [[eth-syncing|eth_syncing]] keeps saying `false`, and the head quietly stops moving. It is only meaningful against a node you operate. A [[rpc-provider|provider]] answers from a gateway that has no peers of its own and commonly returns a constant, so a plausible number from a hosted endpoint proves nothing about the node behind it.",
          "None of these methods reads [[state|state]] or history, so all five are cheap and safe to expose, and they are typically in the default module list. `web3_sha3` is a curiosity rather than a tool — hashing locally is faster and involves no round trip — but it is occasionally handy for checking that your own Keccak implementation agrees with a client's.",
        ],
      },
    ],
    example: {
      title: "Fingerprinting an endpoint",
      language: "bash",
      code: "curl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"web3_clientVersion\",\"params\":[]}' https://rpc.example\n# {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"Nethermind/v1.31.0+ab12cd34/linux-x64/dotnet8.0.11\"}\n\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"net_version\",\"params\":[]}' https://rpc.example\n# {\"jsonrpc\":\"2.0\",\"id\":2,\"result\":\"1\"}            # decimal string, not hex\n\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"eth_chainId\",\"params\":[]}' https://rpc.example\n# {\"jsonrpc\":\"2.0\",\"id\":3,\"result\":\"0x1\"}          # hex quantity\n\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":4,\"method\":\"net_peerCount\",\"params\":[]}' http://127.0.0.1:8545\n# {\"jsonrpc\":\"2.0\",\"id\":4,\"result\":\"0x32\"}         # 50 peers",
      note: "`net_version` and `eth_chainId` return the same network in two different encodings; comparing them as strings is a classic mismatch bug.",
    },
    pitfalls: [
      "Comparing `net_version` with `eth_chainId` directly; one is a decimal string and the other a hex quantity.",
      "Using the network id for replay protection; signatures commit to the chain id, and the two are distinct concepts.",
      "Trusting `net_peerCount` from a hosted endpoint, where the number describes a gateway rather than the node serving you.",
      "Parsing `web3_clientVersion` with a strict pattern; the format is free-form and changes between releases.",
      "Expecting `web3_sha3` to compute SHA3-256; it is Keccak-256, which produces a different digest for the same input.",
    ],
    related: ["chain-id", "namespaces", "client-diversity", "health-check", "endpoint-capabilities", "keccak-256", "eth-syncing", "devp2p", "rpc-provider"],
    sources: [
      { title: "Execution APIs: method documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "clientdiversity.org", url: "https://clientdiversity.org/" },
    ],
  },
  {
    id: "admin-api",
    title: "admin_ namespace",
    category: "requests",
    aliases: ["admin", "admin_nodeInfo", "admin_peers", "admin_addPeer", "admin_startHTTP", "node administration", "enode"],
    summary: "The `admin_` [[namespaces|namespace]] controls the node itself rather than reading the chain: it reports identity and peer state, adds or removes peers, and on some clients can start and stop RPC listeners.",
    sections: [
      {
        heading: "The methods",
        paragraphs: [
          "`admin_nodeInfo` returns the node's own identity: its `enode` URL, its ENR record, the listening ports, and a `protocols` section with the network id, the current head, the genesis hash, and the chain configuration — useful for confirming at a glance that a node is on the network and at the fork you expect. `admin_peers` returns the same detail for every connected peer, including each one's client string, negotiated capabilities, remote address, and advertised head, which is the fastest way to see that peers are real and current rather than stale.",
          "`admin_addPeer` and `admin_removePeer` take an `enode` URL and manage connections by hand, with `admin_addTrustedPeer` on clients that keep a reserved-slot list. [[geth|Geth]] adds `admin_startHTTP`, `admin_stopHTTP`, `admin_startWS`, and `admin_stopWS`, plus `admin_datadir` and chain import and export helpers. Exact membership varies by client; [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]], and [[besu|Besu]] each expose their own subset.",
        ],
      },
      {
        heading: "Why it is never public",
        paragraphs: [
          "This namespace changes the node's behaviour, and one method in it is a privilege escalation on its own: `admin_startHTTP` opens a new HTTP listener with whatever module list the caller asks for. Anyone who can reach `admin_` can therefore grant themselves `debug_`, `personal_`, or anything else the build supports, on a port of their choosing. Attaching peers by hand is a lesser but real lever, since a node with hand-picked peers can be eclipsed from the rest of the network.",
          "The standard posture is to keep `admin_` on [[ipc-transport|IPC]] only, where the file system permissions on `geth.ipc` are the security boundary, and to leave it out of `--http.api` entirely. Client consoles such as `geth attach` reach it over that socket. It never appears on a [[rpc-provider|provider]] endpoint, and finding it on a reachable HTTP port is a critical finding in any [[security|RPC security]] review.",
        ],
      },
      {
        heading: "Operational use",
        paragraphs: [
          "Day to day it answers peering questions. A node that will not sync is often a [[discovery|discovery]] problem — no inbound connections because a port is not forwarded, or a peer set that is all stale heads — and `admin_peers` shows both immediately. `admin_addPeer` with a known-good `enode` proves whether outbound connectivity works at all, independently of discovery.",
          "It is also how you wire fixed topologies: a private network, a devnet, or a pair of nodes that must peer with each other regardless of discovery. For the consensus half of a node the equivalents live on the [[beacon-api|Beacon API]] under its node namespace, and the [[engine-api|Engine API]] is a third, separately authenticated surface; none of the three should share a listener with public traffic.",
        ],
      },
    ],
    example: {
      title: "Checking identity and peers over the local IPC socket",
      language: "bash",
      code: "# IPC only: the socket's file permissions are the access control\ncast rpc admin_nodeInfo --rpc-url /home/eth/.ethereum/geth.ipc\n# {\n#   \"enode\": \"enode://a979fb575495b8d6db44f750317d0f4622bf4c2aa3365d6af7c284339968eef29b69ad0dce72a4d8db5ebb4968de0e3bec910127f134779fbcb0cb6d3331163c@52.16.188.185:30303\",\n#   \"enr\": \"enr:-Ku4QImhMc1z8yCiNJ1TyUxdcfNucje3BGwEHzodEZUan8PherEo4sF7pPHPSIB1NNuSg5fZy7qFsjmUKs2ea1Whi0EBgmlkgnY0…\",\n#   \"ports\": { \"discovery\": 30303, \"listener\": 30303 },\n#   \"protocols\": { \"eth\": { \"network\": 1, \"head\": \"0x9b83c12c…ee71\", \"genesis\": \"0xd4e56740…3fa3\" } }\n# }\n\ncast rpc admin_peers --rpc-url /home/eth/.ethereum/geth.ipc | head -c 400\n# [ { \"enode\": \"enode://3f1d12…@203.0.113.8:30303\", \"name\": \"Nethermind/v1.31.0…\",\n#     \"caps\": [\"eth/68\",\"snap/1\"], \"protocols\": { \"eth\": { \"head\": \"0x9b83c12c…ee71\" } } } ]",
      note: "If these methods answer over HTTP from outside the host, the node is misconfigured and should be treated as compromised.",
    },
    pitfalls: [
      "Adding `admin` to an HTTP module list 'temporarily' for debugging, which lets any caller open a new listener with any namespace enabled.",
      "Assuming a non-zero peer count means healthy peering; check each peer's advertised head, since stale peers still count.",
      "Relying on `admin_addPeer` as a substitute for working discovery, which hides the real connectivity problem and risks an eclipsed peer set.",
      "Expecting the same method set on every client; the namespace is client-specific and only a small core is common.",
    ],
    related: ["security", "namespaces", "ipc-transport", "discovery", "devp2p", "geth", "engine-api", "beacon-api", "peer-to-peer", "health-check"],
    sources: [
      { title: "Geth: admin namespace", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-admin" },
      { title: "Nethermind: JSON-RPC namespaces", url: "https://docs.nethermind.io/interacting/json-rpc-ns/" },
    ],
  },
  {
    id: "engine-payload",
    title: "Engine API methods",
    category: "requests",
    aliases: ["engine_forkchoiceUpdated", "engine_newPayload", "engine_getPayload", "engine_exchangeCapabilities", "payloadId", "payload status", "fcU"],
    summary: "The `engine_` methods are the [[engine-api|Engine API]]'s verbs: `engine_forkchoiceUpdated` sets the head and optionally starts building, `engine_getPayload` collects the built block, and `engine_newPayload` delivers a block from the network for validation.",
    sections: [
      {
        heading: "The three core methods",
        paragraphs: [
          "`engine_forkchoiceUpdatedVx` takes a forkchoice state — `headBlockHash`, `safeBlockHash`, `finalizedBlockHash` — and an optional `payloadAttributes`. The first parameter tells the [[execution-client|execution client]] which chain to treat as canonical and is what makes the `safe` and `finalized` [[block-tag|block tags]] mean anything. When `payloadAttributes` is present, with `timestamp`, `prevRandao`, `suggestedFeeRecipient`, `withdrawals`, and since Cancun `parentBeaconBlockRoot`, the client also starts assembling a block and returns a `payloadId`.",
          "`engine_getPayloadVx` exchanges that `payloadId` for the finished [[execution-payload|execution payload]], along with `blockValue` so the [[consensus-client|consensus client]] can compare it against a builder's bid, a `blobsBundle` of [[blob|blob]] commitments and proofs, and `shouldOverrideBuilder`. V4 adds `executionRequests`, the EIP-7685 list carrying deposits, withdrawal requests, and consolidations. `engine_newPayloadVx` runs the other way: the consensus client hands over a payload it received from the network and the execution client validates and executes it.",
          "Around them sit `engine_exchangeCapabilities`, where the two processes agree on which methods each supports, `engine_getPayloadBodiesByHashV1` and `…ByRangeV1` for backfilling bodies during sync, and `engine_getBlobsV1`, which lets a consensus client take blobs the execution client already holds instead of waiting for gossip.",
        ],
      },
      {
        heading: "Payload status and versioning",
        paragraphs: [
          "Both `newPayload` and `forkchoiceUpdated` answer with a `payloadStatus` holding `status`, `latestValidHash`, and `validationError`. `VALID` means executed and accepted. `INVALID` means the payload breaks the rules, and `latestValidHash` names the last good ancestor so the consensus client can back out. `SYNCING` means the execution client does not yet have the parent and has started fetching it — normal during sync, and the reason a fresh node reports an optimistic head. `ACCEPTED` applies to a side-chain payload that is valid so far but not on the current canonical chain. Older specification versions also defined `INVALID_BLOCK_HASH`.",
          "Methods are versioned per [[hardfork|network upgrade]] because each fork adds fields: V2 brought [[withdrawals|withdrawals]] at Shapella, V3 the blob fields and `parentBeaconBlockRoot` at Cancun, V4 `executionRequests` at Prague. A client must accept the version matching each payload's timestamp and reject mismatches, so upgrading one half of a node without the other breaks the pair at the fork with errors such as `-38005 unsupported fork`. Other Engine-specific codes include `-38001 unknown payload` and `-38002 invalid forkchoice state`.",
        ],
      },
      {
        heading: "Why applications never call it",
        paragraphs: [
          "This is a control channel, not a data API. The methods listen on a separate port, 8551 by default, behind a JWT bearer token signed with HS256 using a 32-byte hex secret both processes read from a file, with the `iat` claim required to be within about 60 seconds of the current time; see [[authentication|RPC authentication]]. Nothing here reads chain data more conveniently than the `eth_` methods, and a caller who can reach the port can set the head to a block of their choosing.",
          "The traffic is a steady heartbeat. Every 12-second slot the consensus client calls `forkchoiceUpdated` at least once to confirm the head; when this node's [[validator|validator]] is due to propose it calls again with `payloadAttributes` and later `getPayload`, or takes a builder's block through [[mev-boost|MEV-Boost]] instead. Payloads from other proposers arrive through `newPayload`. If [[eth-syncing|eth_syncing]] says `false` while the head is frozen, the usual cause is that this conversation stopped: the consensus client is down, the JWT secret does not match, or clocks drifted past the `iat` window.",
        ],
      },
    ],
    example: {
      title: "Setting the head and requesting a block to propose",
      language: "json",
      code: "// POST http://127.0.0.1:8551 with header: authorization: Bearer <JWT signed with the shared secret>\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"engine_forkchoiceUpdatedV3\",\"params\":[\n  {\n    \"headBlockHash\": \"0x9b83c12c69edb74f6c8dd5d052765c1adf940e320bd1291696e6fa07829eee71\",\n    \"safeBlockHash\": \"0x7d5a4369…f0d3\",\n    \"finalizedBlockHash\": \"0x2a1c88f4…b0e9\"\n  },\n  {\n    \"timestamp\": \"0x67f3a2bc\",\n    \"prevRandao\": \"0x6d2b41c9…a17f\",\n    \"suggestedFeeRecipient\": \"0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5\",\n    \"withdrawals\": [ { \"index\": \"0x2f81b4\", \"validatorIndex\": \"0xa3f1\", \"address\": \"0x388c818ca8b9251b393131c08a736a67ccb19297\", \"amount\": \"0xd4f2a1\" } ],\n    \"parentBeaconBlockRoot\": \"0xd41e9a72…04b3\"\n  }\n]}\n\n// result\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{\n  \"payloadStatus\": { \"status\": \"VALID\", \"latestValidHash\": \"0x9b83c12c…ee71\", \"validationError\": null },\n  \"payloadId\": \"0x0355fbdc35a3a781\"\n}}\n\n// a few hundred milliseconds later, collect the built block\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"engine_getPayloadV3\",\"params\":[\"0x0355fbdc35a3a781\"]}\n// → { \"executionPayload\": { … }, \"blockValue\": \"0x1bc16d674ec80000\", \"blobsBundle\": { \"commitments\": […], \"proofs\": […], \"blobs\": […] }, \"shouldOverrideBuilder\": false }",
      note: "Without `payloadAttributes` the same call is a plain head update; with them it also commissions a block and returns a `payloadId` to collect it by.",
    },
    pitfalls: [
      "Exposing port 8551 beyond the host, which hands an attacker the ability to set your node's head.",
      "Upgrading one client across a fork and not the other, after which the pair fails on version mismatches such as `-38005 unsupported fork`.",
      "Reading `SYNCING` as an error; it means the execution client lacks the parent and is fetching it, which is normal during sync.",
      "Letting the two processes' clocks drift, which invalidates the JWT `iat` claim and silently stops the conversation.",
    ],
    related: ["engine-api", "execution-payload", "consensus-client", "execution-client", "block-tag", "authentication", "fork-choice", "mev-boost", "block-proposal", "hardfork", "blob"],
    sources: [
      { title: "Engine API specification", url: "https://github.com/ethereum/execution-apis/tree/main/src/engine" },
      { title: "EIP-7685: General purpose execution layer requests", url: "https://eips.ethereum.org/EIPS/eip-7685" },
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
    ],
  },
  {
    id: "beacon-endpoints",
    title: "Beacon API endpoints",
    category: "requests",
    aliases: ["beacon routes", "/eth/v1/beacon", "blob_sidecars", "finality_checkpoints", "node/syncing", "SSE events", "state id"],
    summary: "The [[beacon-api|Beacon API]] is REST, not JSON-RPC: consensus data is fetched with HTTP GET on paths like `/eth/v1/beacon/headers` and `/eth/v2/beacon/blocks/{block_id}`, with decimal numbers and an optional SSZ encoding.",
    sections: [
      {
        heading: "Shape of the interface",
        paragraphs: [
          "A [[beacon-node|beacon node]] serves these routes on its own port — 5052 for [[lighthouse|Lighthouse]] and [[nimbus|Nimbus]], 5051 for [[teku|Teku]], 9596 for [[lodestar|Lodestar]], 3500 for [[prysm|Prysm]]'s REST gateway — separate from the execution client's 8545 and from the [[engine-api|Engine API]]'s 8551. Every response wraps its payload in a `data` field, errors are HTTP status codes rather than JSON-RPC error objects, and numbers are decimal strings such as `\"7654321\"`, not [[hex-encoding|hex]]. Code moving between the two layers switches conventions completely.",
          "Paths are parameterized by identifiers rather than by request bodies. A `block_id` is `head`, `genesis`, `finalized`, a [[slot-epoch|slot]] number, or a block root; a `state_id` adds `justified` and accepts a [[state-root|state root]]. Sending `Accept: application/octet-stream` returns [[ssz|SSZ]] instead of JSON, far more compact for whole blocks and states, and the `Eth-Consensus-Version` header names the fork whose schema a response follows.",
        ],
      },
      {
        heading: "The routes that matter for RPC work",
        paragraphs: [
          "`/eth/v1/node/syncing` is the consensus-side health check and reports `head_slot`, `sync_distance`, `is_syncing`, `is_optimistic`, and `el_offline`. The last two are the ones with no execution-layer equivalent: `is_optimistic` means blocks have been imported without the [[execution-client|execution client]] confirming them, and `el_offline` says the pair is broken — exactly the condition that leaves [[eth-syncing|eth_syncing]] reporting `false` while the head freezes.",
          "`/eth/v1/beacon/headers/{block_id}` gives a [[beacon-block|beacon block]] header with its root and whether it is canonical. `/eth/v2/beacon/blocks/{block_id}` gives the full signed block including the [[execution-payload|execution payload]], which is how you map a slot to an execution block number. `/eth/v1/beacon/states/{state_id}/finality_checkpoints` returns the previous justified, current justified, and finalized checkpoints — the authoritative source for what `safe` and `finalized` mean; see [[finality|finality]]. `/eth/v1/beacon/states/{state_id}/validators/{validator_id}` returns a [[validator|validator]]'s balance and status.",
          "`/eth/v1/beacon/blob_sidecars/{block_id}` serves the [[blob|blob]] data that execution methods never return; sidecars are retained for roughly 18 days, so older blobs are simply gone. `/eth/v1/events` is a server-sent-events stream with a `topics` query parameter accepting `head`, `finalized_checkpoint`, `chain_reorg`, and others — the consensus equivalent of [[eth-subscribe|eth_subscribe]], and the only place a [[reorg|reorg]] arrives as an explicit event rather than something you infer.",
        ],
      },
      {
        heading: "Who calls it",
        paragraphs: [
          "A [[validator-client|validator client]] is the heaviest user, fetching duties and submitting signed objects through the `/eth/v1/validator/…` routes. Staking dashboards read validator status and balances, [[checkpoint-sync|checkpoint sync]] pulls a recent finalized state from a trusted provider's `/eth/v2/debug/beacon/states/{state_id}` route, and [[light-client|light clients]] follow `/eth/v1/beacon/light_client/…` updates backed by [[sync-committee|sync committee]] signatures.",
          "For application developers it matters in two situations: when you need consensus facts the execution API does not expose, such as whether a slot was missed or which validator proposed, and when you are diagnosing a node whose execution side looks healthy but is not advancing. Most [[rpc-provider|providers]] sell execution endpoints only, so a Beacon endpoint usually means your own [[beacon-node|beacon node]].",
        ],
      },
    ],
    example: {
      title: "Sync status, finality checkpoints, and a header",
      language: "bash",
      code: "curl -s -H 'accept: application/json' http://127.0.0.1:5052/eth/v1/node/syncing\n# {\"data\":{\"head_slot\":\"9871234\",\"sync_distance\":\"0\",\"is_syncing\":false,\"is_optimistic\":false,\"el_offline\":false}}\n\ncurl -s http://127.0.0.1:5052/eth/v1/beacon/states/head/finality_checkpoints\n# {\"data\":{\n#   \"previous_justified\":{\"epoch\":\"308474\",\"root\":\"0x4c1e…9a02\"},\n#   \"current_justified\":{\"epoch\":\"308475\",\"root\":\"0x8b31…d7f4\"},\n#   \"finalized\":{\"epoch\":\"308474\",\"root\":\"0x4c1e…9a02\"}\n# }}\n\ncurl -s http://127.0.0.1:5052/eth/v1/beacon/headers/finalized\n# {\"execution_optimistic\":false,\"finalized\":true,\"data\":{\n#   \"root\":\"0x4c1e…9a02\",\"canonical\":true,\n#   \"header\":{\"message\":{\"slot\":\"9871168\",\"proposer_index\":\"614233\",\n#     \"parent_root\":\"0x2f7d…11ab\",\"state_root\":\"0xa93c…40e8\",\"body_root\":\"0x71bd…c5d9\"},\n#     \"signature\":\"0xb8f1…\"}}}\n\n# an SSE stream of heads and finality changes\ncurl -sN -H 'accept: text/event-stream' \\\n  'http://127.0.0.1:5052/eth/v1/events?topics=head,finalized_checkpoint,chain_reorg'",
      note: "Every number is a decimal string, and slots are not block numbers: a missed slot produces no block, so the two counters drift apart permanently.",
    },
    pitfalls: [
      "Parsing the decimal strings as hex because the execution API trained you to; `\"9871234\"` is not `0x9871234`.",
      "Equating slots with execution block numbers; missed slots mean the two are offset by an amount that only grows.",
      "Requesting blob sidecars for old blocks, which are dropped after roughly 18 days and return nothing.",
      "Reading `is_syncing: false` while ignoring `is_optimistic` and `el_offline`, which are the fields that reveal a broken execution pairing.",
      "Assuming an execution RPC endpoint serves these routes; they are a different process on a different port.",
    ],
    related: ["beacon-api", "beacon-node", "consensus-layer", "finality", "blob", "slot-epoch", "validator-client", "checkpoint-sync", "ssz", "eth-syncing", "light-client"],
    sources: [
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "ethereum/consensus-specs", url: "https://github.com/ethereum/consensus-specs" },
      { title: "Lighthouse Book: HTTP API", url: "https://lighthouse-book.sigmaprime.io/api-bn.html" },
    ],
  },
];
