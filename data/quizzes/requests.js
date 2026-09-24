// Checkpoint questions for the Requests category. Six per topic; each attempt draws five.
// Every correct answer is stated or directly implied by the topic's lesson in data/requests.js.

export const quizzes = {
  "eth-block-number": [
    {
      kind: "scenario",
      question: "A node answers eth_blockNumber with a value close to the network head, yet eth_getBalance at that same block fails. What is going on?",
      options: [
        "The account has never been used, so no balance exists for it at any block",
        "It is snap syncing: the headers are in, but the state for that block is not",
        "eth_getBalance needs an archive node, even when it is asked about the head",
        "Its chain id is misconfigured, so only parameterless methods can succeed",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can two consecutive eth_blockNumber calls to the same node return a lower number the second time?",
      options: [
        "The node pruned its newest block once the state for it had been written",
        "Finality moved backwards after validators failed an attestation round",
        "A reorg replaced the head with a competing, shorter branch",
        "The method reports the consensus slot, which restarts at each new epoch",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What separates the number eth_blockNumber returns from the current consensus-layer slot?",
      options: [
        "Slots advance every 12 seconds even when no block is made, so the two drift",
        "They are one counter, offset by a constant that was fixed at the Merge transition",
        "The block number advances once per epoch, while the slot advances once per block",
        "The slot counts every block, while the block number counts only finalized ones",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "You need the height of the most recent finalized block. What request gets it?",
      options: [
        "eth_blockNumber with the string finalized passed as its only parameter",
        "eth_blockNumber, then subtract 64 blocks to cover two full epochs",
        "eth_syncing, reading the highestBlock field of its result object",
        "eth_getBlockByNumber with the finalized tag, then read its number",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "One backend behind a load balancer lost all of its peers an hour ago. What does eth_blockNumber on that backend return now?",
      options: [
        "Its last imported height, returned without any error",
        "An error with code -32000 reporting that it has no peers",
        "null, until the node reconnects and resumes importing",
        "The highest height its peers announced before they left",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What goes into the params field of an eth_blockNumber request?",
      options: [
        "The block tag latest, which is also the default",
        "An empty array",
        "A boolean selecting full transaction objects",
        "The chain id, encoded as a hex QUANTITY",
      ],
      answer: 1,
    },
  ],

  "eth-get-block-by-number": [
    {
      kind: "scenario",
      question: "Your head tracker fetches latest once per block and stores the hash each time. What check tells you the chain reorganized since the previous poll?",
      options: [
        "The new block's stateRoot matches the stateRoot of its parent block",
        "The new block's parentHash differs from the hash you stored last time",
        "The new block's timestamp lands more than 12 seconds after the last one",
        "The new block's totalDifficulty is lower than the value stored last time",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What changes in the response when the boolean second parameter of eth_getBlockByNumber is switched to true?",
      options: [
        "Each transaction entry also embeds its receipt, with status and logs",
        "Each transaction's input is decoded into named arguments via its ABI",
        "Each transaction hash is replaced by the complete transaction object",
        "Transactions still waiting in the pool are appended for that block",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A service caches block objects keyed only by block number. What does a reorg do to that cache?",
      options: [
        "Entries at the reorged heights now describe blocks that are not canonical",
        "The node refuses later lookups for those numbers until finality catches up",
        "The new canonical blocks receive fresh numbers, so the old entries stay valid",
        "Entries go stale only if the node that served them has since pruned them",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "A full node returns null for eth_getBlockByNumber at block 1,000,000 but answers normally at the head. What explains it?",
      options: [
        "Old blocks need an archive node, because reading them requires historical state",
        "Blocks from before the Merge can be fetched by their hash but not by number",
        "The node applied history expiry and no longer keeps that pre-Merge block",
        "The provider throttles requests for old blocks and answers null when limited",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "On a post-Merge block object, what does the mixHash field carry?",
      options: [
        "The proof-of-work mix digest, zeroed out since the Merge",
        "The root of the withdrawals list processed in that block",
        "The parent beacon block root committed for that slot",
        "prevRandao, the consensus-layer randomness for the slot",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "After a reorg, eth_getBlockByHash still returns a block for a hash you saved before it. What does that result tell you?",
      options: [
        "The block is canonical, since the method resolves only main-chain blocks",
        "The reorg was undone, because orphaned hashes resolve to null at once",
        "The node must be an archive node, the only kind that keeps orphaned blocks",
        "Nothing about canonicity; clients keep recent side-branch blocks as well",
      ],
      answer: 3,
    },
  ],

  "eth-get-block-receipts": [
    {
      kind: "cause",
      question: "Why is one eth_getBlockReceipts call cheaper for a node than one eth_getTransactionReceipt call per transaction in the same block?",
      options: [
        "It skips recomputing effectiveGasPrice and contractAddress for each receipt",
        "Receipts are stored grouped by block, so one read serves every transaction",
        "It reads receipts from the state trie, which the client keeps cached in memory",
        "It returns only receipts that emitted logs, which shrinks the work per block",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "An indexer needs status and gasUsed for every transaction in a block, including transactions that emitted no logs. What call fits?",
      options: [
        "eth_getLogs over that single block",
        "eth_getBlockReceipts for that block",
        "eth_getBlockByNumber with fullTransactions true",
        "eth_getTransactionByHash for each hash in the block",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "eth_getBlockReceipts returns [] for one block and null for another. What distinguishes the two answers?",
      options: [
        "The first block is empty; the node cannot serve the second block at all",
        "The first block is not yet finalized; the second was reorged out of the chain",
        "The first block holds only failed transactions; the second holds none at all",
        "The first was pruned from the receipt store; the second was never produced",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What quick check confirms that an eth_getBlockReceipts array covers the whole block?",
      options: [
        "The last entry's logIndex equals the block's transaction count",
        "The array length equals the number of set bits in logsBloom",
        "The last entry's cumulativeGasUsed equals the block's gasUsed",
        "The sum of every effectiveGasPrice equals the block's baseFeePerGas",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "An endpoint answers eth_getTransactionReceipt normally but returns method not found for eth_getBlockReceipts. How should your code respond?",
      options: [
        "Retry the call with a block hash, the only identifier form it accepts",
        "Treat the backend as pruned, since pruned nodes cannot serve receipts of any block",
        "Resend it inside a batch, which is the only framing the method supports",
        "Fall back to per-transaction receipts; a gateway may not implement it",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A block-by-block scanner calls eth_getBlockReceipts with the latest tag on every iteration. What can go wrong?",
      options: [
        "Consecutive calls can return the same block or skip one, leaving gaps",
        "Receipts for latest come back unordered and must be sorted by hash first",
        "The node answers from the pending block, whose receipts later change",
        "The method rejects tags and answers every call with an invalid params error",
      ],
      answer: 0,
    },
  ],

  "eth-get-transaction-by-hash": [
    {
      kind: "scenario",
      question: "eth_getTransactionByHash returns a full object whose blockHash, blockNumber, and transactionIndex are all null. What does that mean?",
      options: [
        "It was mined, but the node has since pruned the block body",
        "It reverted during execution, so the block did not record it",
        "The node holds it in its pool, but no block includes it yet",
        "The hash matched only partially, so the node returned a stub",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What can eth_getTransactionReceipt tell you about a mined transaction that eth_getTransactionByHash cannot?",
      options: [
        "The nonce the sender used for it",
        "The highest fee per gas the sender offered",
        "Whether it succeeded or reverted",
        "The calldata sent to the target contract",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "A full Geth node returns null for a transaction hash that a block explorer shows as mined three years ago. Why?",
      options: [
        "Consensus rules delete transactions from the chain after one year",
        "Old transactions can be looked up only by block hash and index",
        "The client keeps its hash-to-block index for a recent window only",
        "Resolving any transaction hash needs an archive node's full state",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "In the object eth_getTransactionByHash returns, what does the gas field hold?",
      options: [
        "The gas limit the sender set when signing",
        "The gas the transaction consumed when executed",
        "The price per unit of gas the sender actually paid",
        "The fee in wei the sender paid for inclusion",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "Right after eth_sendRawTransaction through a provider that rotates backends, eth_getTransactionByHash returns null. What does that show?",
      options: [
        "The transaction was rejected for a fee below the base fee",
        "Only that the backend answering has not seen it",
        "The transaction was already mined and left the pool",
        "The node dropped it as a duplicate of a queued nonce",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "You fetch a type 0x3 transaction with eth_getTransactionByHash. Where do its blobs live?",
      options: [
        "In the input field, encoded after the 4-byte function selector",
        "In blobVersionedHashes, which holds the full blob contents",
        "In the receipt's logs, which the node attaches after execution",
        "On the consensus layer, via the Beacon API, for about 18 days",
      ],
      answer: 3,
    },
  ],

  "eth-get-transaction-receipt": [
    {
      kind: "scenario",
      question: "A transaction was included in a block but reverted. What does eth_getTransactionReceipt return for it?",
      options: [
        "null, since a reverted transaction is left out of the block",
        "A JSON-RPC error with code 3 carrying the revert reason",
        "A receipt with status 0x0, its gas consumed, and no logs",
        "A receipt with status 0x1 and an empty logs array",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "You receive a receipt for your transaction, and the same call returns null a few seconds later. What happened?",
      options: [
        "The node evicted the receipt from its in-memory cache",
        "A higher-fee replacement took over the same transaction hash",
        "The block was finalized and its receipt moved to cold storage",
        "A reorg dropped the block that had included the transaction",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "What field tells you what the sender actually paid per unit of gas, rather than what they were willing to pay?",
      options: [
        "maxFeePerGas on the transaction",
        "effectiveGasPrice on the receipt",
        "gasUsed on the receipt",
        "baseFeePerGas on the block header",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What distinguishes a null result from a receipt whose status is 0x0?",
      options: [
        "null means not mined on this node yet; 0x0 means it ran and reverted",
        "null means it reverted before execution; 0x0 means it ran out of gas",
        "null means the pool dropped it; 0x0 means it is still waiting to be mined",
        "null means the node refused it at submission; 0x0 means it was replaced",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "You submit through a load balancer, then poll eth_getTransactionReceipt through it. An explorer already shows the transaction mined, yet you get null. Why?",
      options: [
        "Receipts become visible only once the block holding them is finalized",
        "The explorer lists pending transactions as mined until they are dropped",
        "The backend that answered has not imported that block yet",
        "Receipts are keyed by block, so the call also needs a block parameter",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why do wallets keep waiting for confirmations or the finalized tag after a receipt has appeared?",
      options: [
        "Receipt fields such as gasUsed are estimates until the block is finalized",
        "The node sets status only after attesters have justified the block",
        "A reorg can still drop the block, or re-include the transaction elsewhere",
        "Receipts are served from the pool at first and from the block store later",
      ],
      answer: 2,
    },
  ],

  "eth-get-transaction-count": [
    {
      kind: "detail",
      question: "You need a nonce that will not collide with transactions already queued in this node's pool. What block tag do you pass?",
      options: ["latest", "safe", "pending", "finalized"],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Two workers share one signing key, read the pending nonce in the same instant, and each sign a transaction. What follows?",
      options: [
        "Both are mined in arrival order, since the pool renumbers duplicates",
        "Both carry the same nonce, so at most one of them can be mined",
        "Both stay queued forever, because a duplicate nonce opens a gap",
        "The node refuses the second pending read until the first is sent",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "A contract is deployed in block N and has not deployed anything itself. What does eth_getTransactionCount return for it at block N?",
      options: [
        "0x0, since a contract never signs a transaction",
        "null, since only externally owned accounts have nonces",
        "The deployer's nonce, copied over at creation time",
        "0x1, since EIP-161 starts contract nonces at one",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "For the same address, one node returns 0x1f4 with latest and 0x1f7 with pending. What does the difference mean?",
      options: [
        "Three of the sender's transactions were mined but are not yet final",
        "The sender's three most recent transactions reverted and did not count",
        "This node's pool holds three queued transactions from that sender",
        "Three blocks have passed since the sender's last mined transaction",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why should a backend sending a burst of transactions keep a local nonce counter instead of re-reading pending before each one?",
      options: [
        "Each pending read costs an archive lookup, which providers rate limit",
        "The pending tag counts only mined transactions, so it lags by a block",
        "The pool may not have registered the previous transaction yet",
        "Nodes cache pending answers for a slot, so the value is always stale",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A sender skips one nonce value when signing a series of transactions. What happens to the later transactions from that account?",
      options: [
        "They are mined in order, and the skipped nonce is simply never used",
        "The node renumbers them to close the gap before propagating them",
        "They stay queued until the missing nonce is filled or they are evicted",
        "They are included in blocks, but each reverts until the gap is filled",
      ],
      answer: 2,
    },
  ],

  "eth-get-balance": [
    {
      kind: "scenario",
      question: "eth_getBalance at a block from last year returns an error mentioning a missing trie node. What does that tell you?",
      options: [
        "The account did not exist yet at that block, so it had no balance leaf",
        "This node no longer holds that block's state; an archive node can answer",
        "The block was reorged out after the fact, so its state root is unknown",
        "The address failed checksum validation before the lookup could run",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "An account's balance rose between two blocks, yet no transaction in either block touched it. What could have credited it?",
      options: [
        "An ERC-20 transfer that emitted a Transfer event to it",
        "An eth_call that another client ran against the account",
        "A validator withdrawal pushed from the consensus layer",
        "A transaction to it still waiting in the mempool",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What does eth_getBalance return for an address that has never appeared on chain?",
      options: ["null", "0x0", "An error saying the account does not exist", "0x, the empty DATA value"],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What separates the number eth_getBalance returns from a wallet's USDC balance?",
      options: [
        "USDC is tracked in the account leaf beside ether, under a token field",
        "eth_getBalance returns USDC too when the token address is passed as well",
        "USDC sits in a contract's storage and is read via eth_call to balanceOf",
        "USDC balances live in receipt logs, which the node sums for each account",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A JavaScript app decodes every eth_getBalance result with parseInt into a plain number. What goes wrong?",
      options: [
        "Ordinary balances exceed 2^53, so digits are silently lost",
        "parseInt rejects the 0x prefix, so every balance decodes as zero",
        "The result is in gwei, so values come out a billion times too small",
        "Balances are signed, so large ones decode as negative numbers",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does no RPC method return an account's balance history as a list of changes?",
      options: [
        "Balance history is kept only in the consensus layer's beacon state",
        "The chain keeps balances per block, not a log of movements",
        "Balances change only through logs, which eth_getLogs already covers",
        "History is pruned after 128 blocks, so no method could ever serve it",
      ],
      answer: 1,
    },
  ],

  "eth-get-code": [
    {
      kind: "scenario",
      question: "eth_getCode for an account returns 0xef0100 followed by twenty more bytes. What is that?",
      options: [
        "A proxy whose implementation address is inlined into its bytecode",
        "A truncated response from a node that hit its response-size limit",
        "An EIP-7702 delegation designator pointing at the code to run",
        "The first 23 bytes of a contract whose deployment is still pending",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why can a pruned node fail eth_getCode for an old block even though the bytecode itself is still on its disk?",
      options: [
        "Finding the codeHash needs that block's account leaf, which is gone",
        "Code blobs are deleted along with the historical receipts of that block",
        "Old bytecode uses opcodes the current client no longer knows how to decode",
        "The block parameter is ignored for code, so any old query is rejected outright",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What does eth_getCode return for an address that has never been used?",
      options: ["0x0", "null", "0x", "An error stating the account is unknown"],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An allow-list treats every address with a non-empty eth_getCode result as a contract. What does that get wrong since Pectra?",
      options: [
        "Contracts deployed through CREATE2 now return empty code",
        "Proxies now return their implementation's code, not their own",
        "EOAs with an EIP-7702 delegation now look like contracts",
        "Contracts mid-construction now return their initcode instead",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What distinguishes the bytes eth_getCode returns from the bytes sent in the contract's deployment transaction?",
      options: [
        "They are identical, since the node stores exactly what the deployer sent",
        "They are the runtime code only, without initcode or constructor arguments",
        "They add the constructor arguments, appended after the runtime code",
        "They are a compressed form that must be expanded before disassembly",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "eth_getCode on an upgradeable proxy returns only the proxy's own forwarding logic. How do you find the logic contract it currently forwards to?",
      options: [
        "Call eth_getCode again with the pending block tag",
        "Read its implementation slot with eth_getStorageAt",
        "Read the codeHash from the account leaf via eth_getProof",
        "Look up the deployer's nonce with eth_getTransactionCount",
      ],
      answer: 1,
    },
  ],

  "eth-get-storage-at": [
    {
      kind: "scenario",
      question: "A Solidity contract keeps a secret in a private variable. What stops an RPC caller from reading it with eth_getStorageAt?",
      options: [
        "The node refuses slot reads that belong to private variables",
        "The compiler encrypts private values with the deployer's key",
        "Private variables sit outside the storage trie, so no slot exists",
        "Nothing; private limits other contracts, not direct slot reads",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "Where is the value for key k of a mapping declared at slot p stored?",
      options: [
        "At slot p plus the numeric value of k",
        "At keccak256(pad32(p) concatenated with pad32(k))",
        "At keccak256(pad32(k) concatenated with pad32(p))",
        "In a separate mapping trie keyed by k alone",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "Why is a getter called through eth_call usually a better choice than reading the raw slot?",
      options: [
        "It is the only way to read the value as of a historical block",
        "It returns a decoded value and survives storage layout changes",
        "It does not need the node to hold the state for that block",
        "It skips the archive-node requirement that raw slot reads carry",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does eth_getStorageAt give the same answer for a slot never written and a slot explicitly set to zero?",
      options: [
        "The node pads both answers to 32 bytes before it hashes the response",
        "Full nodes prune both kinds of slot from the trie after 128 blocks",
        "Writing zero deletes the entry, so the state stores neither of them",
        "The ABI encoder maps an absent value to zero on the way out",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A slot holds four packed uint64 fields, and your code decodes the whole returned word as one uint256. What do you get?",
      options: [
        "The first field only, because the node returns the lowest 8 bytes",
        "An error, because packed slots must be read one field at a time",
        "The sum of the four fields, which the EVM keeps in that word",
        "A large number that mixes all four fields into one value",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "You need the address an EIP-1967 proxy currently points at. What do you read with eth_getStorageAt?",
      options: [
        "Slot 0, where every proxy keeps its implementation address",
        "The slot keccak256('eip1967.proxy.implementation') - 1",
        "The slot keccak256('eip1967.proxy.admin'), which names the logic",
        "The slot at keccak256 of the proxy's own address, padded to 32 bytes",
      ],
      answer: 1,
    },
  ],

  "eth-get-proof": [
    {
      kind: "scenario",
      question: "You ask eth_getProof for a storage key the contract never wrote. What does a correct node send back for that key?",
      options: [
        "An error, since no path can be built to a leaf that does not exist",
        "An exclusion proof: a valid path that ends before the key, value zero",
        "An empty storageProof array, with no entry or proof nodes for the key",
        "A proof of the nearest written key, which you must compare by hand",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why do some archive nodes still refuse eth_getProof for historical blocks?",
      options: [
        "They keep flat historical values but not the trie nodes a path needs",
        "The specification lets the method accept only the latest block tag",
        "Historical proofs would exceed the JSON-RPC response size limit",
        "Proofs need the receipts trie, which archive nodes prune over time",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "When verifying a storageProof entry, what path do you walk through the account's storage trie?",
      options: [
        "The key itself, unhashed",
        "keccak256 of the 32-byte key",
        "keccak256 of the address concatenated with the key",
        "The key's position in the request array",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What does eth_getProof add beyond the values eth_getBalance and eth_getStorageAt return?",
      options: [
        "Values at historical blocks that pruned nodes can no longer serve",
        "Values from the pending block, before the next block is sealed",
        "The trie nodes that let you check the values against a state root",
        "Decoded values, since the proof carries the contract's storage layout",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A bridge verifies every proof but takes the stateRoot it checks against from the same untrusted endpoint. What can a dishonest endpoint do?",
      options: [
        "Only delay answers, since a tampered proof breaks the hash chain",
        "Serve a valid proof against a state root it made up",
        "Only drop storage keys, since returned values must be genuine",
        "Only lie about balances, since storage values are hashed twice",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why should an ordinary application avoid eth_getProof for routine reads it never verifies?",
      options: [
        "Proof responses are cached, so their values trail the head by a slot",
        "Proofs cost kilobytes and heavy node work, wasted if never checked",
        "The method reports balances in gwei rather than wei, losing precision",
        "Proof values are signed by the provider and expire after one epoch",
      ],
      answer: 1,
    },
  ],

  "eth-call": [
    {
      kind: "scenario",
      question: "An eth_call hits a contract function that reverts with a custom error. What does the caller receive?",
      options: [
        "A successful result of 0x, since a reverted call returns nothing",
        "A JSON-RPC error whose data holds the encoded custom error",
        "A successful result carrying the custom error selector as data",
        "An HTTP 400 response with an empty body and no JSON-RPC envelope",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does eth_call usually succeed with a from address that holds no ether?",
      options: [
        "The node credits the sender with ether for the length of the call",
        "Balance checks apply only to transactions of type 0x2 and above",
        "The EVM ignores the from field entirely during a message call",
        "Clients relax fee and balance checks when no fee fields are set",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "What does one eth_call to Multicall3 guarantee over a JSON-RPC batch of eth_call requests that each use latest?",
      options: [
        "All of the reads execute against one block's state",
        "The reads cost less gas, since they share one intrinsic cost",
        "The node caches the results for later identical requests",
        "The reads skip the provider's rate limit for eth_call",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "Code reuses a transaction object, maxFeePerGas included, as the eth_call object for a read from an unfunded address. What happens?",
      options: [
        "The fee fields are ignored, since eth_call spends no gas",
        "The node signs and broadcasts it as a real transaction",
        "The balance check comes back and the call starts failing",
        "The call succeeds and the fee is charged to the target",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "On a Geth node, what bounds the gas a single eth_call may use?",
      options: [
        "The gas field the caller supplies, with no upper limit",
        "--rpc.gascap, 50,000,000 by default, plus a timeout",
        "The sender's ether balance divided by the gas price",
        "30,000,000, a fixed per-call maximum set by the protocol",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "An eth_call targets an address that holds no code at all. What comes back?",
      options: [
        "A JSON-RPC error with code 3 saying the target has no code",
        "A result of 32 zero bytes, the EVM's default return word",
        "null, because there is no contract to execute at that address",
        "A successful result of 0x, as for a function returning nothing",
      ],
      answer: 3,
    },
  ],

  "eth-estimate-gas": [
    {
      kind: "cause",
      question: "Why can eth_estimateGas return more gas than the receipt's gasUsed shows once the transaction is mined?",
      options: [
        "The node adds a fixed safety margin before it returns the estimate",
        "The 63/64 rule and later refunds put the needed limit above the charge",
        "gasUsed leaves out the 21,000 intrinsic gas that the estimate includes",
        "The estimate is given in wei, while gasUsed is counted in gas units",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "An estimate succeeds and the transaction is sent with exactly that limit, but it runs out of gas when mined. What is the likely cause?",
      options: [
        "The node's gas cap was applied again when the transaction was mined",
        "The base fee rose between the estimate and the block that included it",
        "The state changed before inclusion and the call took a costlier path",
        "The estimate came back in decimal and the wallet parsed it as hex",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "eth_estimateGas returns 0xb3d9 for a token transfer. What does that number represent?",
      options: [
        "A fee of 46,041 gwei at the current base fee",
        "46,041 gas units, the lowest limit that succeeds",
        "46,041 gas actually consumed, refunds already applied",
        "A gas price of 46,041 wei per unit for fast inclusion",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A wallet retries eth_estimateGas in a loop whenever the estimate reverts. What does each retry achieve?",
      options: [
        "It succeeds once the node's cached result for that call expires",
        "The node raises its gas cap on each retry until the call fits",
        "Each try repeats the same revert and costs several executions",
        "Each retry is queued in the pool and later mined as a transaction",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You estimate a swap while the approve transaction it depends on has not been mined yet, and the estimate reverts. What gets a meaningful number?",
      options: [
        "Retry with latest a few times until the node's cache refreshes",
        "Add a 30 percent buffer to the gas limit and send the swap anyway",
        "Pass the approval's hash as the block parameter of the estimate",
        "Estimate against pending, or override the allowance in state",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why do providers weight eth_estimateGas far above eth_call in their compute-unit pricing?",
      options: [
        "It must sign a trial transaction and simulate its propagation",
        "It always runs against an archive node's historical state",
        "A binary search runs the EVM several times for one estimate",
        "It replays every pending transaction in the pool before the call",
      ],
      answer: 2,
    },
  ],

  "eth-create-access-list": [
    {
      kind: "consequence",
      question: "You attach an access list entry for a storage slot the transaction never reads. What does that entry cost?",
      options: [
        "Nothing; the EVM ignores entries it never touches",
        "A revert, because a declared slot went unused",
        "1,900 gas paid upfront, for no benefit",
        "100 gas, the price of one warm storage read",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Roughly how much gas does correctly pre-declaring one cold storage slot save?",
      options: ["About 1,900 gas", "About 2,100 gas", "About 100 gas", "About 2,600 gas"],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why is a generated access list valid only for the state it was generated against?",
      options: [
        "The list embeds a block number and is rejected at any other height",
        "Storage keys are salted with the state root of the block they came from",
        "Access lists expire after a fixed number of blocks once generated",
        "Another state can send execution down a path touching other slots",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "Which addresses does eth_createAccessList leave out of its list because they are warm by rule anyway?",
      options: [
        "Every contract the call reaches through DELEGATECALL",
        "Accounts whose storage the call only reads",
        "Precompiles and the sender",
        "Addresses holding no code, such as plain EOAs",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A contract call runs close to its gas limit, and its cost shifts with what earlier transactions in the block touched. What does attaching an access list give it?",
      options: [
        "Priority ordering, since builders include listed transactions first",
        "Gas use that no longer depends on what others warmed first",
        "Protection from reverts, since only declared slots may be written",
        "Cheaper calldata, since declared slots are dropped from the input",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "How does the gasUsed that eth_createAccessList reports differ from what eth_estimateGas returns for the same call?",
      options: [
        "It leaves out the intrinsic 21,000 gas, which only the estimate counts",
        "It is the upper bound found by binary search, not the gas consumed",
        "It reflects the list's own cost, since the call is re-run with it",
        "It counts only the cold accesses the list has converted to warm ones",
      ],
      answer: 2,
    },
  ],

  "eth-gas-price": [
    {
      kind: "cause",
      question: "Why do two honest nodes on the same chain return different eth_gasPrice values at the same moment?",
      options: [
        "Each node sees a different base fee for the next block to be built",
        "It reports the cheapest transaction price in that node's own pool",
        "It is a percentile of recent tips, set by each operator's flags",
        "Nodes round the value to the nearest gwei, in different directions",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "A type 0x2 transaction sets maxFeePerGas far above the base fee. What does the sender actually pay per gas?",
      options: [
        "The full maxFeePerGas, since that is the price the sender committed to",
        "baseFee plus min(tip, maxFeePerGas minus baseFee); the rest is refunded",
        "Only the base fee, since tips apply to blob transactions alone",
        "The eth_gasPrice value suggested at the moment of inclusion",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "You want a fee estimator whose behavior you control instead of inheriting a node operator's flags. What method supplies the raw material?",
      options: ["eth_gasPrice", "eth_feeHistory", "eth_blobBaseFee", "eth_maxPriorityFeePerGas"],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A wallet sets maxFeePerGas to exactly the value eth_gasPrice returned. What happens if the base fee rises over the next few blocks?",
      options: [
        "The node tops up the fee from the tip, so inclusion is unaffected",
        "It strands, with no headroom once the base fee climbs past it",
        "It is mined at the old base fee, which was locked in at signing",
        "The pool converts it to a legacy transaction priced at gasPrice",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What distinguishes the number eth_blobBaseFee returns from the one eth_gasPrice returns?",
      options: [
        "It is the blob share of eth_gasPrice, to be subtracted from it",
        "It is the tip for blob transactions, added on top of eth_gasPrice",
        "It prices blob gas, a separate market a blob transaction pays too",
        "It is the same value, reported in blob gas units instead of wei",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You use eth_gasPrice on an L2 to estimate what a transaction will cost in total. What does that leave out?",
      options: [
        "The priority tip, which L2 sequencers ignore",
        "The base fee, which L2s do not charge",
        "The L1 data fee, usually the larger part",
        "The blob base fee of the L2's own blocks",
      ],
      answer: 2,
    },
  ],

  "eth-fee-history": [
    {
      kind: "detail",
      question: "You call eth_feeHistory with blockCount 0x4. How many entries does baseFeePerGas contain?",
      options: [
        "Four, one for each block in the requested window",
        "Five, the first repeating the oldest block for alignment",
        "Five: the last is the base fee of the next block",
        "It varies with how many of those blocks were empty",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why is a cold eth_feeHistory request over many blocks with several reward percentiles expensive for the node?",
      options: [
        "Each base fee must be recomputed by walking the parent header chain",
        "Each block must be re-executed in the EVM to derive its gasUsedRatio",
        "Each block's transactions must be loaded and sorted by effective tip",
        "Each blob ratio must be fetched from the consensus-layer sidecars",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "gasUsedRatio has been near 1.0 for the last ten blocks. What should your estimator do with maxFeePerGas?",
      options: [
        "Lower it, since full blocks mean demand was already served",
        "Ignore the ratio, since it describes only the blob market",
        "Raise it, since the base fee is still climbing each block",
        "Switch to eth_gasPrice, which accounts for congestion itself",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A node no longer holds receipts as far back as your blockCount reaches. How does it answer?",
      options: [
        "With an error naming the earliest block it still holds",
        "With a later oldestBlock and shorter arrays than requested",
        "With zero base fees and empty rewards for the missing blocks",
        "With newestBlock shifted back so the count still matches",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "How must the rewardPercentiles parameter be encoded in the request?",
      options: [
        "As hex QUANTITY strings, like every other numeric parameter",
        "As fractions between 0 and 1, like the gasUsedRatio values",
        "As one percentile, since the method accepts only a single value",
        "As ascending plain JSON numbers from 0 to 100",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "What sets the last entry of baseFeePerGas apart from every other fee figure the API offers?",
      options: [
        "It is the only one that already folds in the priority tip paid",
        "It is averaged over the whole window, smoothing out spikes",
        "The header already fixes it; it is a fact, not an estimate",
        "It is the only one denominated in gwei instead of wei",
      ],
      answer: 2,
    },
  ],

  "eth-send-raw-transaction": [
    {
      kind: "scenario",
      question: "The HTTP response to your eth_sendRawTransaction is lost in transit. What is the safe recovery?",
      options: [
        "Sign a new transaction with the next nonce and send that one instead",
        "Wait for the pool to expire it, then re-sign it with a higher fee",
        "Resend the identical bytes; you get the same hash or already known",
        "Read the nonce with latest and start over from the value it gives",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A validly signed, fully funded transaction that will certainly revert is submitted with eth_sendRawTransaction. What does the node do?",
      options: [
        "Rejects it, since pool validation runs it first to catch reverts",
        "Holds it in the queue until contract state would let it pass",
        "Accepts it; it is mined and charged for gas like any other",
        "Accepts it, then refunds all gas once the revert is recorded",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You submit to a public endpoint and a searcher sandwiches your swap. What change addresses that directly?",
      options: [
        "Raise maxFeePerGas so it lands earlier in the same block",
        "Submit to several public endpoints at once so it spreads faster",
        "Submit through a private endpoint that routes to builders",
        "Use a lower nonce so the transaction is ordered ahead of theirs",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A node with no peers receives your transaction through eth_sendRawTransaction. What happens?",
      options: [
        "It refuses it with an error saying there are no peers to gossip to",
        "It holds the call open until a peer connects and takes the transaction",
        "It accepts it and returns the hash, but no one else ever sees it",
        "It forwards it to the consensus client, which gossips it instead",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "A submission fails with replacement transaction underpriced. What did it do?",
      options: [
        "Sent the exact same bytes that the pool already holds",
        "Used a nonce below the account's current nonce",
        "Offered a fee below the pool's configured minimum",
        "Reused a queued nonce without a large enough fee bump",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why can you know a transaction's hash before you call eth_sendRawTransaction at all?",
      options: [
        "The node derives it from the sender address and nonce you chose",
        "It is fixed by the chain id and nonce, both known in advance",
        "It is the Keccak-256 hash of the signed transaction you hold",
        "It is the hash of the unsigned fields, which you built yourself",
      ],
      answer: 2,
    },
  ],

  "eth-send-transaction": [
    {
      kind: "cause",
      question: "A hosted RPC endpoint answers eth_sendTransaction with error -32601. Why?",
      options: [
        "The transaction object was missing its required gas field",
        "It accepts transactions only when they arrive over WebSocket",
        "The account lacks funds, which it reports as method not found",
        "It holds no key for your address and does not sign for callers",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A page calls eth_sendTransaction through MetaMask's injected provider. Who signs the transaction?",
      options: [
        "The node behind the wallet's RPC URL, using an unlocked account",
        "The wallet, with its own key, before forwarding the raw bytes",
        "The page, using a key the wallet injects into its JavaScript",
        "The provider's backend, which signs any object the wallet forwards",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "An operator unlocks an account on a node whose RPC port is reachable from the internet. What follows?",
      options: [
        "The port serves the keystore file to callers in plaintext",
        "The node begins gossiping the account's private key to peers",
        "Anyone who can reach the port can spend the account's funds",
        "Only the account's nonce is exposed, not its ability to sign",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "An eth_sendTransaction request omits nonce, gas, and fee fields. What does a node that supports it do?",
      options: [
        "Rejects it, since every omitted field is a required parameter",
        "Signs zeros for them, exactly as the request left them",
        "Fills in the pending nonce, a gas estimate, and a fee it picks",
        "Copies them from the sender's most recent mined transaction",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "On a node that supports both, what distinguishes eth_sendTransaction from eth_sendRawTransaction?",
      options: [
        "It waits for inclusion and then returns the receipt, not the hash",
        "It skips pool validation, since the node trusts its own local accounts",
        "The node signs with a key it holds rather than taking signed bytes",
        "It is the newer method, added for typed transactions after EIP-1559",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A deployment script works against Anvil but fails with -32601 against the production endpoint. What is the fix?",
      options: [
        "Add the production network's chain id to every transaction",
        "Switch the script to a WebSocket connection to the endpoint",
        "Sign locally and send the bytes with eth_sendRawTransaction",
        "Set an explicit gas limit so the endpoint skips estimation",
      ],
      answer: 2,
    },
  ],

  "eth-get-logs": [
    {
      kind: "scenario",
      question: "An eth_getLogs filter has topics [A, null, [B, C]]. What logs match it?",
      options: [
        "Logs with A, B, or C in any of their topic positions",
        "Logs whose topic0 is A and which carry both B and C",
        "Logs whose topic0 is A and topic2 is B or C, any topic1",
        "Logs whose topic0 is A and topic1 is B or C, any topic2",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why is the removed field of every log in an eth_getLogs response false?",
      options: [
        "Removed logs are deleted from their receipts when the node prunes",
        "The field is reserved for pending logs that have not been mined",
        "It reports only the canonical chain, so retracted logs are absent",
        "Clients hard-code it to false for compatibility with old tooling",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What does each block header's logs bloom let the node do while answering eth_getLogs?",
      options: [
        "Return matching logs directly without reading any receipts at all",
        "Produce an exact match set, since the bloom has no false positives",
        "Skip blocks that were already served from its response cache",
        "Skip blocks that cannot match, at the cost of some false positives",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "eth_getLogs over a pre-Merge range returns [] from a node that applies history expiry. What does that empty array show?",
      options: [
        "That no contract emitted a matching event anywhere in the range",
        "That the range exceeded the span limit and was silently cut",
        "Nothing about events; the node may no longer hold those receipts",
        "That the logs were reorged out and marked removed on the node",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A scan window fails with query returned more than 10000 results. What should a robust scanner do next?",
      options: [
        "Retry the same window until the provider's cache warms up",
        "Drop the address filter so the node can use its topic index",
        "Halve the window and retry, widening again after successes",
        "Move the cursor to latest and resume scanning from the head",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An indexer advances its durable cursor all the way to latest after every scan. What can go wrong?",
      options: [
        "The node rejects latest as toBlock once the filter has an address",
        "Logs at latest lack their blockHash until the block is finalized",
        "A reorg can retract logs it has already committed",
        "The bloom for latest is not built yet, so its logs are skipped",
      ],
      answer: 2,
    },
  ],

  "eth-filters": [
    {
      kind: "scenario",
      question: "Your eth_getFilterChanges polls start failing with filter not found while the endpoint is otherwise healthy. What is the likely cause?",
      options: [
        "The filter matched too many logs, so the node dropped it as oversized",
        "A reorg invalidated the topic list that the filter was installed with",
        "The poll hit a different backend, or the filter expired while idle",
        "The node converted the filter into a subscription on its own",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "For the same log filter id, what distinguishes eth_getFilterLogs from eth_getFilterChanges?",
      options: [
        "The first also works on block filters; the second only on log filters",
        "The first returns all matches, ignoring the cursor; the second only new ones",
        "The first resets the cursor to the head; the second leaves it where it was",
        "The first also includes pending logs; the second returns only mined ones",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "After a filter not found error, a consumer installs a fresh filter and carries on polling. What has it lost?",
      options: [
        "Nothing, since a new filter replays from the old filter's last position",
        "Only removed entries, since a new filter never reports retractions",
        "Whatever happened between the old cursor and the current head",
        "Its place in the node's filter quota, which resets only after a restart",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "By default, how long does Geth keep a filter that nobody is polling?",
      options: [
        "About 12 seconds, one slot",
        "About five minutes",
        "Until the next finalized epoch",
        "Until eth_uninstallFilter is called",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why do polling filters exist when eth_getLogs can already answer the same log query?",
      options: [
        "eth_getLogs cannot filter by topic, while a filter matches any position",
        "Filters read from the pool, so they see logs before blocks are mined",
        "HTTP cannot push, so the node keeps your cursor and sends only the delta",
        "Filters are shared across backends, so they work behind load balancers",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "eth_getFilterChanges delivers a log whose removed field is true. What should your consumer do with it?",
      options: [
        "Ignore it; it marks a log the node pruned from its receipts",
        "Store it; it is a pending log that has not been mined yet",
        "Retract that log; a reorg rewrote the block it came from",
        "Reinstall the filter; removed means its cursor was reset",
      ],
      answer: 2,
    },
  ],

  "eth-subscribe": [
    {
      kind: "consequence",
      question: "Your WebSocket drops for 40 seconds, reconnects, and you resubscribe to logs. What happened to matching events during the gap?",
      options: [
        "They arrive as a burst right after the new subscription starts",
        "They arrive with the next matching block, marked removed: true",
        "They are lost; nothing is buffered, so backfill with eth_getLogs",
        "The node replays them, since subscription ids survive reconnects",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "How does a subscription notification differ in structure from a normal JSON-RPC response?",
      options: [
        "It reuses the id of the eth_subscribe call that created the stream",
        "It has method eth_subscription and no id; the payload is in params",
        "It arrives as a batch array holding one element for each event",
        "It omits the jsonrpc field so the client can tell it is a push",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why do two endpoints on the same chain deliver different newPendingTransactions streams?",
      options: [
        "One of the two endpoints is serving a stale copy of the chain",
        "Pending streams are sampled, so each client gets a random subset",
        "The subscription ids encode different topic filters for each client",
        "Each stream reflects that node's own pool, shaped by peers and policy",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "Your newHeads handler must notice reorgs. What does it need to check on each header it receives?",
      options: [
        "That its parentHash equals the hash of the previous header",
        "The removed flag newHeads sets on a header it replaced",
        "That its timestamp is exactly 12 seconds after the last one",
        "A reorg event the node pushes on the stream before the head",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "Why do production indexers treat a logs subscription as a hint and an eth_getLogs scan as the authority?",
      options: [
        "Subscriptions deliver only logs from the pending block, not mined ones",
        "eth_getLogs reports removed entries, while subscriptions never do",
        "A dropped connection silently loses events a range query recovers",
        "Subscriptions are billed per event, while scans are billed per call",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A script can reach its node over HTTP only and wants new logs as they appear. What should it use?",
      options: [
        "eth_subscribe over HTTP, which falls back to long polling",
        "eth_subscribe with the logs type, sent as a batch request",
        "Polling filters with eth_newFilter and eth_getFilterChanges",
        "eth_getFilterLogs alone, which pushes new entries as they land",
      ],
      answer: 2,
    },
  ],

  "eth-syncing": [
    {
      kind: "cause",
      question: "eth_syncing returns false, but the node's head block is two hours old. What is the likely explanation?",
      options: [
        "The execution client finished syncing and stopped importing on purpose",
        "It is an archive node, which reports the oldest block it still holds",
        "Its consensus client is down, so nothing drives the head forward",
        "A reorg rolled the head back by two hours' worth of blocks",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "What combination of signals makes a sound readiness check for an RPC backend?",
      options: [
        "eth_syncing false alone, since the client knows best whether it is ready",
        "A TCP connect plus an HTTP 200 answer to any JSON-RPC request sent",
        "syncing false, a fresh head timestamp, the right chain id, peers above zero",
        "An eth_blockNumber answer above zero, returned in under one second",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What does eth_syncing return while a node is in the middle of a sync?",
      options: [
        "The boolean true",
        "A string naming the current sync mode",
        "An object with progress fields",
        "null until the sync completes",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A health check treats any truthy eth_syncing result as meaning synced. What goes wrong?",
      options: [
        "Nothing, since the method returns true only when the node is synced",
        "It fails on Geth, which returns the string synced instead of false",
        "It is backwards: a syncing node's object passes and false fails",
        "It works only for snap sync, where the method returns a boolean",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A node has just finished snap sync and eth_syncing now returns false. What still fails on it?",
      options: [
        "eth_blockNumber, until the first finalized epoch after the sync",
        "eth_call at older blocks, since no historical state exists yet",
        "eth_sendRawTransaction, until the pool has been rebuilt",
        "eth_getBlockByNumber at the head, until bodies are backfilled",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What sets startingBlock, currentBlock, and highestBlock apart from fields such as syncedAccounts in the result?",
      options: [
        "They are the standard fields; the rest are client-specific extras",
        "They are Geth-only; syncedAccounts is the portable standard field",
        "They are decimal strings, while the extras are hex QUANTITIES",
        "They describe snap sync, while the extras describe full sync",
      ],
      answer: 0,
    },
  ],

  "eth-simulate": [
    {
      kind: "contrast",
      question: "What can eth_simulateV1 model that a chain of separate eth_call requests cannot?",
      options: [
        "Reading contract return data without sending a transaction",
        "Executing calls against the state of an older, historical block",
        "State one call writes being visible to the next, across blocks",
        "Returning the decoded revert reason for a failing call",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why does simulating a call that withdraws ether from a contract show no value moving unless traceTransfers is set?",
      options: [
        "Ether transfers are hidden inside delegate calls by default",
        "Plain ether transfers emit no logs for the simulation to show",
        "The simulator converts ether amounts into gas units by default",
        "Withdrawals are credited by the consensus layer after the block",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A simulation run with validation set to false succeeds. What has it left unchecked?",
      options: [
        "Whether the contract logic reaches the branch you intended",
        "Nonce, balance, and fee checks a real transaction faces",
        "Whether the calls emit the events your frontend expects",
        "Whether each call returns the data your code will decode",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "You need to see how a vesting contract behaves after its cliff, two months from now. What does eth_simulateV1 offer for that?",
      options: [
        "A stateOverrides entry that sets the block timestamp slot",
        "A blockOverrides entry that sets time to a later date",
        "The traceTransfers flag, which fast-forwards pending events",
        "A base block identifier set to a future block number",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "In an eth_simulateV1 result, where do you find each call's status, returnData, gasUsed, and logs?",
      options: [
        "In one receipt per call, fetched with eth_getTransactionReceipt",
        "In a flat array of results, one per call, with no block objects",
        "In the logs of a synthetic block appended after the last one",
        "In the calls array of each simulated block object",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A request stacks many blocks of heavy calls until it passes the client's total gas ceiling. What happens?",
      options: [
        "Only the last call fails, and earlier results are still returned",
        "The whole simulation fails, not just the call that crossed it",
        "The node splits the work into several responses automatically",
        "The ceiling is raised for that request, at a higher unit price",
      ],
      answer: 1,
    },
  ],

  "state-override": [
    {
      kind: "contrast",
      question: "What is the difference between state and stateDiff in an account's override entry?",
      options: [
        "state applies to balances, while stateDiff applies to storage slots",
        "state wipes storage and installs your slots; stateDiff patches only them",
        "state persists after the call, while stateDiff is discarded afterward",
        "state is for contracts, while stateDiff is for externally owned accounts",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can a gas figure measured under a state override understate what the real transaction will cost?",
      options: [
        "Overrides switch off the intrinsic 21,000 gas charge for the call",
        "The node applies a lower gas cap whenever overrides are present",
        "Refunds are applied twice when an account's storage is overridden",
        "Pre-setting a slot turns a 20,000-gas first write into a cheap update",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A provider returns a plausible eth_call result, but your override seems to have had no effect. What should you suspect?",
      options: [
        "The override address key needed checksum casing to take effect",
        "Overrides apply only when the block tag is set to pending",
        "The endpoint dropped the third parameter and used real state",
        "The node applied the override to the next block, not this one",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "You meant to patch one token balance slot but passed it under state instead of stateDiff. What does the call see?",
      options: [
        "Only the patched slot changed, with the rest left as it was",
        "An error, since state accepts balances but not storage slots",
        "Every other slot of that contract reading as zero",
        "The real storage, since eth_call ignores the state field",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You want to test a candidate implementation against live state before an upgrade ships. How do overrides help?",
      options: [
        "Deploy it for real, then use stateDiff to revert the deployment",
        "Set the proxy's nonce so the next CREATE lands on the new code",
        "Put its code at the real contract's address and replay calldata",
        "Pass the new bytecode as the data field of a plain eth_call",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "How long does a state override passed to eth_call last, and who can see it?",
      options: [
        "Until the next block, for every caller of that node",
        "For that one request, invisible to every other caller",
        "Until eth_uninstallFilter or a node restart clears it",
        "Until the override is gossiped and confirmed by peers",
      ],
      answer: 1,
    },
  ],

  "debug-api": [
    {
      kind: "cause",
      question: "Why does tracing transaction 40 of a block cost far more than reading its receipt?",
      options: [
        "Traces are stored compressed and must be unpacked per request",
        "Receipts are cached locally, but traces are fetched from peers",
        "The node replays the transactions before it to rebuild state",
        "The tracer re-verifies every signature in the block first",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You need every account and slot a transaction read, plus their values before and after it ran. What tracer setup gives that?",
      options: [
        "callTracer with onlyTopCall disabled",
        "prestateTracer with diffMode enabled",
        "4byteTracer with its default configuration",
        "The struct logger with disableStorage set",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What does a callTracer trace show that a transaction receipt cannot?",
      options: [
        "The effective gas price the transaction actually paid per gas unit",
        "The hash of the block that included the transaction",
        "Internal ether transfers and which nested frame reverted",
        "The total gas the transaction used, refunds included",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "You call debug_traceTransaction on a complex transaction without any tracer option. What comes back?",
      options: [
        "A nested call tree, since callTracer is the default tracer",
        "An opcode-by-opcode log that can run to hundreds of megabytes",
        "An error, since the tracer field is a required parameter",
        "Only the top-level call frame, as with onlyTopCall set",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "Tracing a year-old transaction fails with required historical state unavailable. What does that error mean?",
      options: [
        "The transaction hash is unknown, so the node found nothing to trace",
        "The tracer timed out, and raising the timeout option will fix it",
        "The node pruned what it needs to replay from; a retention limit",
        "The namespace is disabled, and this is how nodes report it",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why do operators keep the debug_ namespace off public listeners?",
      options: [
        "It leaks private keys through methods such as debug_getRawTransaction",
        "Its replies are unsigned, so any caller could forge a trace for others",
        "A few traces can saturate a node, and some methods move its head",
        "It bypasses the rate limits that apply to eth_ methods on the same port",
      ],
      answer: 2,
    },
  ],

  "trace-api": [
    {
      kind: "contrast",
      question: "What does trace_filter offer that none of the debug_ tracers provide?",
      options: [
        "Tracing a call that was never submitted to the chain at all",
        "Querying call frames by from or to address across a block range",
        "Returning opcode-level execution detail for each step taken",
        "Applying state overrides to accounts before replaying a transaction",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "In a flat trace_ entry, what does the traceAddress field describe?",
      options: [
        "The contract address that the frame called into",
        "The address that paid for the gas this frame consumed",
        "The frame's path of child indices within the call tree",
        "The storage slot address that the frame wrote to",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You need a before-and-after view of every balance and storage slot one transaction changed. What do you request?",
      options: [
        "trace_block for the block that contains the transaction",
        "trace_replayTransaction with the stateDiff trace type",
        "trace_filter with the transaction's sender as fromAddress",
        "trace_call with the vmTrace trace type",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "You send trace_filter to an endpoint running Geth. What should you expect?",
      options: [
        "It works, since every client implements the Parity trace namespace",
        "It is translated into debug_traceBlockByNumber for each block",
        "It works once trace is added to the --http.api module list",
        "It fails, since that client implements no trace_ namespace at all",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "Code reads traceAddress as a call depth. What does it get wrong about the entries [0,1] and [1,0]?",
      options: [
        "They are different frames that merely sit at the same depth",
        "They are the same frame, listed once per parent that called it",
        "They are the top call and its first child, in reversed order",
        "They are frames at depths one and zero, ordered by gas used",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does the reward trace type appear only on blocks from before the Merge?",
      options: [
        "Rewards moved into the stateDiff trace type after the Merge",
        "Post-Merge rewards are paid by a system call that is not traced",
        "Since the Merge there is no execution-layer block reward",
        "Reward traces are pruned from full nodes after the Merge",
      ],
      answer: 2,
    },
  ],

  "txpool-api": [
    {
      kind: "scenario",
      question: "A transaction appears under queued rather than pending in txpool_contentFrom. What does that usually mean?",
      options: [
        "Its maxFeePerGas sits below the base fee of the current block",
        "A nonce gap: an earlier nonce from that sender is missing",
        "It has been mined and is waiting for its confirmations",
        "The node has not finished validating its signature",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why do hosted providers almost never expose txpool_content?",
      options: [
        "Every client implements it only over the IPC transport",
        "It needs archive state to reconstruct each pool entry",
        "The dump is enormous and reveals what users are about to do",
        "It would reveal which client and version the provider runs",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A dashboard reads txpool_status from one endpoint and labels it the network's pending backlog. What is wrong with that?",
      options: [
        "The count includes mined transactions still awaiting confirmations",
        "The count is sampled, so it is only accurate to within an epoch",
        "The count describes one node's pool, shaped by its peers and limits",
        "The count omits blob transactions, which live on the consensus layer",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A user's transactions are stuck. On your own node, what shows which of their nonces are held and at what fee?",
      options: [
        "txpool_status, which lists held nonces per sender",
        "txpool_contentFrom with the sender's address",
        "eth_getTransactionByHash on each of their hashes",
        "eth_getTransactionCount with the pending tag",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What does txpool_contentFrom reveal about a stuck transaction that eth_getTransactionByHash cannot?",
      options: [
        "Whether it will revert once it is finally executed",
        "Which of the node's peers first gossiped it over devp2p",
        "Whether it sits in pending or in queued behind a nonce gap",
        "The block number at which the pool expects it to be included",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What does txpool_status return when you call it on your own node?",
      options: [
        "Every pooled transaction, keyed by sender and nonce",
        "A summary string for each transaction in the pool",
        "Two hex counts, pending and queued",
        "The pool's minimum fee and its size limits",
      ],
      answer: 2,
    },
  ],

  "net-web3-api": [
    {
      kind: "detail",
      question: "web3_sha3 returns a 32-byte digest. What algorithm produced it?",
      options: [
        "NIST SHA3-256, as the method name indicates",
        "SHA-256, for compatibility with Bitcoin tooling",
        "Keccak-256, despite the method's name",
        "Blake2b-256, the hash behind a precompile",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why is net_peerCount from a hosted provider a weak health signal?",
      options: [
        "Providers report peers per API key rather than per node",
        "The count includes consensus-layer peers, inflating it",
        "It comes from a gateway, not the node serving your requests",
        "The specification caps the value at 25 peers",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You must confirm that an endpoint serves the network your signed transactions are meant for. What do you call?",
      options: [
        "net_version, since it identifies the network for peering",
        "eth_chainId, since signatures commit to the chain id",
        "web3_clientVersion, since its string names the network",
        "net_listening, since only a well-configured node accepts peers",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "On mainnet, code compares the net_version result with the eth_chainId result as plain strings. What happens?",
      options: [
        "They match, since both return the hex quantity 0x1",
        "They match, since both return the decimal string 1",
        "They never match: one is the string 1, the other 0x1",
        "It errors, since net_version returns a JSON number",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What distinguishes the network id from the chain id?",
      options: [
        "The network id is for testnets only; the chain id applies to mainnet",
        "The network id changes at every hardfork; the chain id never changes",
        "The network id is hex encoded; the chain id is sent as a decimal string",
        "The network id is for peering; the chain id is for replay protection",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "You are handed an unfamiliar endpoint and need to guess whether trace_ or debug_ will work. What do you call first?",
      options: [
        "net_version, to learn which network the endpoint serves",
        "net_peerCount, to learn how well connected the node is",
        "web3_clientVersion, to learn which implementation answers",
        "eth_syncing, to learn whether the node has finished syncing",
      ],
      answer: 2,
    },
  ],

  "admin-api": [
    {
      kind: "cause",
      question: "Why is exposing admin_ over HTTP even more dangerous than exposing debug_?",
      options: [
        "admin_ methods bypass the JWT that guards the Engine API port",
        "admin_ methods sign transactions with the node's unlocked keys",
        "admin_startHTTP opens a new listener with any namespace enabled",
        "admin_peers reveals the private key of each peer connection",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Your node will not sync, and admin_peers shows twelve peers whose advertised heads are hours old. What does that suggest?",
      options: [
        "The node is an archive node and reports historical heads for peers",
        "The peer set is stale or eclipsed; a count above zero proves little",
        "The peers are consensus-layer peers that cannot serve blocks",
        "The node's RPC module list is missing the eth namespace",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "On a well-run node, what forms the access boundary for the admin_ namespace?",
      options: [
        "An API key that the node's HTTP listener checks on each call",
        "The JWT secret shared with the consensus client on port 8551",
        "A CORS allow-list that restricts which browser origins may call",
        "The local IPC socket, guarded by file system permissions",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "You suspect peer discovery is broken on a node. What proves whether its outbound connectivity works at all?",
      options: [
        "admin_nodeInfo, reading the listening ports",
        "net_listening, which reports outbound reachability",
        "admin_addPeer with a known-good enode URL",
        "admin_startHTTP on a fresh port for peers",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An operator keeps a node peered only through admin_addPeer instead of fixing its broken discovery. What is the risk?",
      options: [
        "It stops the node from gossiping transactions to other peers",
        "It disables snap sync, which requires discovered peers only",
        "It hides the real connectivity fault and risks an eclipsed peer set",
        "It forces every added peer onto the trusted reserved-slot list",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What distinguishes the answer of admin_nodeInfo from that of admin_peers?",
      options: [
        "The first lists inbound peers; the second lists outbound peers",
        "The first describes this node; the second, each connected peer",
        "The first is served over IPC; the second only over HTTP listeners",
        "The first returns the node's private key; the second peer enodes",
      ],
      answer: 1,
    },
  ],

  "engine-payload": [
    {
      kind: "contrast",
      question: "What does engine_forkchoiceUpdated do differently when payloadAttributes is supplied?",
      options: [
        "It marks the given head block as finalized immediately",
        "It also starts building a block and returns a payloadId",
        "It validates the head payload instead of merely setting it",
        "It switches the execution client to archive mode for the block",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "engine_newPayload returns status SYNCING. What is the execution client telling the consensus client?",
      options: [
        "The payload failed validation and should be discarded",
        "The payload is valid but belongs to a side chain",
        "The Engine API version does not match the active fork",
        "It lacks the payload's parent and has begun fetching it",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Both clients of a node are running, yet the execution head has stopped advancing. What engine-side fault fits?",
      options: [
        "The pool filled up and blocked the import of new blocks",
        "eth_syncing reported false, so the consensus client paused",
        "Clock drift pushed the JWT iat claim outside its window",
        "The JWT token expired after its fixed 24-hour lifetime",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An operator upgrades the consensus client for a fork but leaves the execution client on the old release. What happens at the fork?",
      options: [
        "The execution client quietly applies the fork using the old version",
        "The pair fails on version mismatches such as -38005 unsupported fork",
        "The consensus client falls back to V1 methods and keeps working",
        "Only blob transactions fail, since other payloads are unchanged",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "How are Engine API calls authenticated, and on what port do they listen by default?",
      options: [
        "An API key in the URL path, on the same port 8545 as eth_",
        "Mutual TLS with certificates from both clients, on 5052",
        "A JWT signed with HS256 from a shared secret, on port 8551",
        "No authentication, on a socket bound to localhost only",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "engine_newPayload answers INVALID and names a latestValidHash. What does the consensus client do with that hash?",
      options: [
        "Retry the payload once the execution client finishes syncing",
        "Treat that hash as the new finalized block for the chain",
        "Back out to that last good ancestor of the rejected payload",
        "Fetch the missing parent it names from the network",
      ],
      answer: 2,
    },
  ],

  "beacon-endpoints": [
    {
      kind: "detail",
      question: "What field in /eth/v1/node/syncing flags that the beacon node has lost contact with its execution client?",
      options: ["sync_distance", "el_offline", "is_syncing", "head_slot"],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "How are numeric values encoded in Beacon API JSON responses?",
      options: [
        "As 0x-prefixed hex strings, matching the execution API",
        "As JSON numbers, with large values sent as floats",
        "As decimal strings, unlike the execution API's hex",
        "As base64-encoded SSZ fragments inside the data field",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You want an explicit signal whenever the consensus layer reorganizes. Where do you get it?",
      options: [
        "The finality_checkpoints route, comparing epochs across polls",
        "The /eth/v1/events stream with the chain_reorg topic",
        "The blob_sidecars route, which leaves out reorged blocks",
        "The headers route, checking the canonical flag on each slot",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "You request blob sidecars from a beacon node for a block from two months ago. What do you get?",
      options: [
        "The blobs, since beacon nodes keep them for good",
        "The blobs, but only in SSZ form, never as JSON",
        "Nothing: they are kept for only about 18 days",
        "The versioned hashes, with the blob bodies removed",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why do slot numbers and execution block numbers drift further apart over time?",
      options: [
        "Each epoch skips one block number at its boundary",
        "Block numbers restart at each hardfork, slots do not",
        "A missed slot produces no block, so the gap only grows",
        "Slots advance twice per block during sync committee periods",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You need the execution block number that belongs to a given slot. What Beacon API route gives it?",
      options: [
        "/eth/v1/beacon/headers/{block_id}, via its body_root field",
        "/eth/v1/node/syncing, via the head_slot it reports",
        "/eth/v2/beacon/blocks/{block_id}, via the payload in its body",
        "/eth/v1/beacon/states/{state_id}/finality_checkpoints",
      ],
      answer: 2,
    },
  ],
};
