// Checkpoint questions for the protocol category, keyed by topic id in the order of data/protocol.js.
// Six hand-written questions per topic; each attempt draws five. The app shuffles options and order.

export const quizzes = {
  "block": [
    {
      kind: "detail",
      question: "In a post-Merge execution block returned over RPC, what does the uncles field hold?",
      options: [
        "Up to two uncle headers, as it did under proof of work",
        "An empty array, because ommers ended with the Merge",
        "Hashes of competing beacon blocks for the same slot",
        "The withdrawals the consensus layer credited",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A block's timestamp is 24 seconds after its parent's, yet its number is exactly one higher. What happened?",
      options: [
        "The block held twice the usual gas, so its slot was extended",
        "The proposer set a later timestamp to collect more priority fees",
        "The slot between them was missed, so no block was produced for it",
        "A reorg merged two blocks, keeping one number for both of them",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Which value in an eth_getBlockByNumber result is computed by the node rather than read from a header field?",
      options: [
        "gasUsed, the gas its transactions consumed",
        "parentHash, the hash of the previous block",
        "timestamp, the Unix second of its slot",
        "size, the byte length of its RLP encoding",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "An indexer scans blocks with eth_getBlockByNumber and passes true as the second parameter, though it only needs transaction hashes. What does that cost it?",
      options: [
        "Much larger responses: several hundred kilobytes, not a few",
        "Each call also returns every receipt, doubling provider compute",
        "The node must replay each block, so the call needs archive state",
        "Uncle headers are returned in full, which roughly doubles the size",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why should a program that reads a balance, a storage slot, and a nonce that must agree pin all three to one block number instead of using latest?",
      options: [
        "The latest tag is served from the pool, not from executed state",
        "Separate latest calls can be answered from different blocks",
        "Nodes cache latest per method, so each value lags differently",
        "A number makes the node verify each answer against its stateRoot",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What does a receipt's blockHash tell you that its blockNumber cannot?",
      options: [
        "Whether the block is finalized, since hashes are assigned at finality",
        "Which slot the block was proposed in, since numbers skip missed slots",
        "Which node served it, since each node hashes blocks independently",
        "Which exact block produced it, since a reorg can reuse the number",
      ],
      answer: 3,
    },
  ],

  "block-header": [
    {
      kind: "contrast",
      question: "What distinguishes stateRoot and receiptsRoot from transactionsRoot and withdrawalsRoot?",
      options: [
        "They are SSZ hash tree roots rather than Merkle-Patricia trie roots",
        "They commit to what executing the block produced, not to its inputs",
        "They are computed by the consensus layer rather than the execution client",
        "They are optional and appear only on blocks produced after the Merge",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Where does the blob fee market keep the state it carries from one block to the next?",
      options: [
        "In the storage of a system contract the EVM reads",
        "In extraData, where the block builder writes it",
        "On the consensus layer only, beside the blob sidecars",
        "In the header, as blobGasUsed and excessBlobGas",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A block from 2020 comes back with no baseFeePerGas field. What should a decoder conclude?",
      options: [
        "It predates London, the upgrade that added the field",
        "The node pruned the field from old headers to save disk",
        "The block was empty, so no base fee applied to it",
        "The field appears only when full transactions are requested",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "In a post-Merge header, what does the field that clients still expose as mixHash carry?",
      options: [
        "The builder's signature over the payload, left over from mining",
        "The root of the parent beacon block that wrapped this payload",
        "prevRandao, the consensus layer's randomness for that slot",
        "A proof-of-work seed, kept at zero since difficulty ended",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why does the miner field of a block bought through MEV-Boost usually name a builder rather than the proposing validator?",
      options: [
        "Builders sign the header, and miner records the signer's address",
        "It names the relay that delivered the block to the proposer",
        "It is the address in the validator's withdrawal credentials",
        "It is the fee recipient, which the builder sets to its own address",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "What distinguishes parentBeaconBlockRoot from parentHash in an execution header?",
      options: [
        "It is the same hash, re-encoded with SHA-256 for beacon clients",
        "It commits to the parent's state, while parentHash commits to its header",
        "It names the parent consensus block, not the parent execution block",
        "It is the root of the withdrawals the consensus layer pushed in",
      ],
      answer: 2,
    },
  ],

  "block-hash": [
    {
      kind: "cause",
      question: "Only the header is hashed to get a block hash. Why does changing one byte of one transaction still change it?",
      options: [
        "Clients append the body's RLP to the header before hashing",
        "The header's transactionsRoot commits to every transaction",
        "The hash is taken over the full block once it is finalized",
        "Each transaction hash is mixed into the header's extraData",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What does the BLOCKHASH opcode return when asked for a block older than the 256 most recent?",
      options: [
        "The genesis block's hash",
        "The oldest hash the node stores",
        "A zero value",
        "An out-of-range revert",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What makes a block hash a safer cache key than a block number?",
      options: [
        "A reorg can reassign a number to other content, never a hash",
        "Hashes are assigned only once a block has been finalized by the chain",
        "Numbers skip missed slots, so two blocks can end up sharing one",
        "Numbers are local to each node, while hashes are agreed network-wide",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "An indexer stored the hash of block 100. Block 101 then arrives with a parentHash that does not equal it. What does that mean?",
      options: [
        "Block 101 is invalid, and the indexer should wait for a valid replacement",
        "The node skipped a missed slot, so parentHash points two blocks back",
        "Block 100 was reorged out, so data derived from it must be rolled back",
        "The block was built through MEV-Boost, which hashes headers differently",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A read method is given a blockHash with requireCanonical set to true, and that block is no longer canonical. What does the node do?",
      options: [
        "It answers from the canonical block at the same height",
        "It fails cleanly instead of answering from another block",
        "It answers from that block anyway and adds a warning field",
        "It waits until the block becomes canonical again, then answers",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A developer passes an execution block hash to the Beacon API route /eth/v2/beacon/blocks/{block_id}. What comes back?",
      options: [
        "The beacon block wrapping it, since both hashes identify one block",
        "A type error, since execution hashes are 20 bytes and roots 32",
        "The execution payload only, without the consensus fields around it",
        "A not-found response, since the route expects a beacon block root",
      ],
      answer: 3,
    },
  ],

  "transaction": [
    {
      kind: "detail",
      question: "In a transaction object from eth_getTransactionByHash, which field did the sender never sign?",
      options: [
        "nonce, which the node fills in from the account",
        "from, which the node recovers from the signature",
        "chainId, which the node adds from its own config",
        "input, which the node decodes from the calldata",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A transaction object has its to field set to null. What kind of transaction is it?",
      options: [
        "A pending one whose recipient is not yet resolved",
        "A withdrawal pushed in by the consensus layer",
        "A burn that sends its value to the zero address",
        "A contract deployment, with the init code in input",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "During a transaction, one contract calls another contract. Where can you observe that inner call afterwards?",
      options: [
        "In an execution trace of the transaction",
        "As a second transaction in the same block",
        "In the block body, right after the outer transaction",
        "In eth_getTransactionByHash, under an internal field",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "To speed up a pending payment, a wallet signs a new copy with a higher fee but the next nonce instead of the same one. What happens?",
      options: [
        "The new copy replaces the old one, since its fee is higher",
        "Both can be included, so the payment may go out twice",
        "The node rejects the new copy as a duplicate of the first",
        "The old copy is dropped as soon as the new one is broadcast",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "A transaction moves 1000 USDC to another holder, but its value field is 0x0. Why?",
      options: [
        "value is filled in only after the receipt is written",
        "The node hides value for token contracts to protect privacy",
        "value is in gwei, so small amounts round down to zero",
        "The transfer is a contract call encoded in input, not ether",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "eth_sendRawTransaction has just returned a transaction hash. What does that hash establish?",
      options: [
        "The transaction has been included and a receipt now exists",
        "A proposer has committed to include it in the next block",
        "Only that this node accepted it; inclusion comes later",
        "The network has confirmed the signature and the fee payment",
      ],
      answer: 2,
    },
  ],

  "transaction-types": [
    {
      kind: "detail",
      question: "How are the bytes of a type 0x2 transaction laid out when handed to eth_sendRawTransaction?",
      options: [
        "An RLP list whose first element is the type number 2",
        "An SSZ container, like consensus-layer objects",
        "The byte 0x02 followed by an RLP list of its fields",
        "A JSON object with a type field, signed as text",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why can a blob-carrying transaction never be used to deploy a contract?",
      options: [
        "Blob gas cannot pay the extra 32000 gas that a deployment costs",
        "Type 0x3 must name a recipient in to, and a deployment has none",
        "Init code would travel in the sidecar, which the EVM never sees",
        "Deployments need a gasPrice field, which type 0x3 does not carry",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A pool watcher reads a raw transaction whose first byte is 0xf8. What is it?",
      options: [
        "A type 0xf8 transaction from a future network upgrade",
        "A blob sidecar that arrived without its transaction",
        "A corrupt payload, since valid type bytes stop at 0x7f",
        "A legacy transaction, since that byte opens an RLP list",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Right after a network upgrade, a node rejects a new-format transaction with transaction type not supported. What is the usual cause?",
      options: [
        "The node's client is an older release without the new type",
        "The sender set gasPrice together with maxFeePerGas",
        "The transaction's type byte was not covered by its signature",
        "The pool is full and refuses the types it cannot price",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "You fetch a type 0x3 transaction with eth_getTransactionByHash. What does the object contain for its blobs?",
      options: [
        "The full blob bytes, in a sidecar field of the object",
        "The KZG proofs, placed where calldata would normally go",
        "Only their versioned hashes, in blobVersionedHashes",
        "Nothing, since blob transactions are served by the Beacon API",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What does a type 0x1 transaction add on top of the legacy type 0x0 format?",
      options: [
        "maxFeePerGas and maxPriorityFeePerGas instead of one gasPrice",
        "blobVersionedHashes and maxFeePerBlobGas for blob data",
        "An authorizationList that points the sender at contract code",
        "An explicit chainId, an accessList, and yParity instead of v",
      ],
      answer: 3,
    },
  ],

  "transaction-receipt": [
    {
      kind: "scenario",
      question: "Two consecutive receipts in one block show cumulativeGasUsed of 21000 and then 42000. How much gas did the second transaction use?",
      options: [
        "42000, the later of the two cumulative values",
        "21000, the difference between the two values",
        "63000, the sum of the two cumulative values",
        "Nothing can be concluded without a trace of it",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Which receipt field is reconstructed by the client rather than stored in the consensus receipt that receiptsRoot commits to?",
      options: [
        "status",
        "logs",
        "cumulativeGasUsed",
        "effectiveGasPrice",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A transaction reverted at its outermost call. What does its receipt show?",
      options: [
        "status 0x1, plus an error field holding the revert reason",
        "status 0x0 and a gasUsed of 0x0, since nothing was applied",
        "No receipt at all, since a reverted transaction writes none",
        "status 0x0, a non-zero gasUsed, and an empty logs array",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "You fetched a transaction's receipt at block N, and then the chain reorganised past N. What can happen to that receipt?",
      options: [
        "Nothing, since a fetched receipt is final once returned",
        "It can vanish, then come back with a different blockHash",
        "Its status flips to 0x0 to mark the orphaned execution",
        "It stays valid, but its logs are removed from the index",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can a receipt show status 0x1 for a batch operation in which one of the inner calls failed?",
      options: [
        "status reflects only the gas payment, not the calls made",
        "Inner reverts are recorded in logsBloom rather than status",
        "The node rewrites status once the block is finalized",
        "The contract caught the inner revert and finished normally",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "What gives the execution fee a transaction actually paid, in wei?",
      options: [
        "gasUsed times effectiveGasPrice",
        "gas times effectiveGasPrice",
        "cumulativeGasUsed times effectiveGasPrice",
        "gasUsed times maxFeePerGas",
      ],
      answer: 0,
    },
  ],

  "nonce": [
    {
      kind: "scenario",
      question: "eth_getTransactionCount at latest returns 0x5 for an address with nothing pending. What nonce should its next transaction use?",
      options: [
        "0x6, because the count equals the last nonce used",
        "0x5, because the included count equals the next nonce",
        "0x4, because the count is one-based and nonces are not",
        "Any value from 0x5 up, because higher nonces are accepted",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "Your transaction with nonce 12 is stuck in the pool, and you send another with nonce 13. What happens to the second one?",
      options: [
        "It replaces nonce 12, because the higher nonce wins",
        "It is rejected at once with the error nonce too low",
        "It waits behind nonce 12 and cannot be included first",
        "It is included first, and nonce 12 becomes invalid for good",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What makes the nonce of a contract account go up by one?",
      options: [
        "Each transaction that calls into it",
        "Each contract it deploys with CREATE",
        "Each incoming transfer of ether",
        "Each write it makes to its own storage",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "You resend a stuck transaction with the same nonce, raising only maxFeePerGas by 20 percent. Why does a typical pool answer replacement transaction underpriced?",
      options: [
        "It wants maxPriorityFeePerGas raised by the same margin too",
        "It wants maxFeePerGas raised by at least 50 percent, not 20",
        "It wants the replacement to carry a new, higher nonce",
        "It wants the replacement sent to the node that took the original",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "Two workers share one sending address. Each reads the next nonce and signs a transaction at the same moment. What typically happens?",
      options: [
        "Both are included, since the pool assigns them consecutive nonces",
        "The node merges them into one transaction with both payloads",
        "One is included and the other is rejected, often as nonce too low",
        "Both wait in the queued set until another fills the gap",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What does eth_getTransactionCount with the pending tag count on top of what the latest tag counts?",
      options: [
        "Transactions that were included but later reverted",
        "Transactions in blocks that are not yet finalized",
        "Deployments its contracts made with CREATE",
        "Transactions waiting in this particular node's own pool",
      ],
      answer: 3,
    },
  ],

  "gas": [
    {
      kind: "consequence",
      question: "A transaction runs out of gas partway through its execution. What is charged, and what is kept?",
      options: [
        "Only the gas used up to the failure is charged; changes are undone",
        "Nothing is charged, since the transaction failed before finishing",
        "The gas used is charged, and changes made before the failure stay",
        "The whole gas limit is charged, and every state change is undone",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "How much of its remaining gas can a contract hand to a sub-call?",
      options: [
        "All of it, provided the caller passes the full amount",
        "At most 63/64 of it; one 64th stays with the caller",
        "Half of it, split evenly between caller and callee",
        "Up to the 21000 intrinsic gas of the transaction",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why must every execution client charge exactly the same gas for each opcode?",
      options: [
        "It would otherwise compute a different gasUsed and state root, and split off",
        "Builders override per-node gas prices when they assemble a block",
        "The consensus layer re-meters every opcode and slashes deviating clients",
        "Opcode prices are read from a system contract set at genesis",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "An eth_call that runs a heavy computation fails on a public endpoint, though the same work would fit easily in a block. What is the likely reason?",
      options: [
        "eth_call charges each opcode double to discourage heavy reads",
        "The endpoint's operator set a gas cap below what the call needs",
        "The call's intrinsic 21000 gas is not refunded on an endpoint",
        "eth_call cannot read storage slots the block has not touched",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What intrinsic gas does a transaction pay before any code runs, if it deploys nothing and carries no calldata?",
      options: [
        "2100 gas",
        "21000 gas",
        "53000 gas",
        "32000 gas",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A sender sets a gas limit ten times higher than the transaction will need. What does that do?",
      options: [
        "The whole limit is charged, as with an out-of-gas failure",
        "The node rejects it, as limits must be within 10 percent of use",
        "Unused gas comes back, though the limit takes up block space",
        "The base fee is charged on the full limit, the tip only on use",
      ],
      answer: 2,
    },
  ],

  "eip-1559": [
    {
      kind: "detail",
      question: "By how much can the base fee change from one block to the next?",
      options: [
        "By any amount the block builder chooses",
        "At most 100 percent, doubling after a full block",
        "At most 12.5 percent, up or down",
        "Not at all within an epoch of 32 blocks",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A block's base fee is 25 gwei. A transaction in it signed maxFeePerGas 30 gwei and maxPriorityFeePerGas 2 gwei. What is its effectiveGasPrice?",
      options: [
        "30 gwei",
        "27 gwei",
        "25 gwei",
        "2 gwei",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Where does the base-fee part of a transaction's fee end up?",
      options: [
        "With the proposer, together with the tip",
        "With the builder that assembled the block",
        "In a protocol treasury contract",
        "It is burned and leaves circulation",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why is setting maxFeePerGas well above the current base fee cheap insurance rather than an overpayment?",
      options: [
        "The excess is refunded to the sender after the block",
        "A higher cap lowers the base fee the block will charge",
        "Only base fee plus the tip is charged; the headroom is not",
        "The cap only binds legacy transactions, not type 0x2 ones",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "The base fee rises to 29 gwei while a transaction's maxFeePerGas is 30 gwei and its maxPriorityFeePerGas is 2 gwei. What does the fee recipient get per gas?",
      options: [
        "2 gwei",
        "1 gwei",
        "30 gwei",
        "0 gwei",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "After a burst of full blocks, a transaction's maxFeePerGas is now below the base fee. What happens to it?",
      options: [
        "It becomes invalid forever, like a nonce that is too low",
        "It is included, with the shortfall taken from its tip",
        "It waits, unincludable, until the base fee falls back to it",
        "It is included at its cap, and the proposer absorbs the gap",
      ],
      answer: 2,
    },
  ],

  "access-list": [
    {
      kind: "detail",
      question: "At best, how much gas does listing a storage key in an access list save on its first read?",
      options: [
        "2100 gas, because the listed read becomes free",
        "100 gas, as 1900 plus a 100 warm read beats 2100",
        "1900 gas, which is refunded once the slot is read",
        "Nothing; the list only helps the client schedule reads",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A transaction lists an address in its accessList but never touches it. What is the effect?",
      options: [
        "The entry is ignored and costs no gas",
        "The transaction is rejected as invalid",
        "The 2400 gas is refunded at the end",
        "It still pays 2400 gas for the unused entry",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A transaction reads a storage slot that is missing from its access list. What happens?",
      options: [
        "The read goes ahead at the cold price of 2100 gas",
        "The EVM halts the frame with an out-of-access error",
        "The read returns zero, as unlisted slots are hidden",
        "The transaction reverts, because the list is a whitelist",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does the type 0x1 transaction exist at all, when a type 0x2 can carry an access list as well?",
      options: [
        "Type 0x1 is the only type whose access list is refunded if unused",
        "Access lists arrived before dynamic fees, so they got a type first",
        "Type 0x2 access lists are advisory, while type 0x1 enforces them",
        "Type 0x1 keeps access lists out of the signature, unlike type 0x2",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "eth_createAccessList leaves out the sender and the recipient, though the call touched both. Why?",
      options: [
        "They are implied by the signature and cannot be listed",
        "They are warm by rule, so listing them only costs gas",
        "The node hides them to avoid revealing who is transacting",
        "Only storage keys are listed; addresses are never included",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "Two transactions in one block both list the same storage slot. How does that affect their execution?",
      options: [
        "The second reverts, since the first holds a lock on the slot",
        "They run in parallel, since each declared its state up front",
        "No effect; they still run in block order, one after the other",
        "Only the first gets the discounted warm price; the second pays cold",
      ],
      answer: 2,
    },
  ],

  "account": [
    {
      kind: "detail",
      question: "Which single RPC method returns an account's balance, nonce, codeHash, and storage root in one response?",
      options: [
        "eth_getBalance",
        "eth_getProof",
        "eth_getCode",
        "eth_getStorageAt",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "An account record in the state trie holds exactly four fields. Which list names them?",
      options: [
        "address, balance, storageRoot, codeHash",
        "nonce, balance, owner, createdAtBlock",
        "nonce, balance, storageRoot, codeHash",
        "nonce, balance, code, tokenBalances",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You need an address's balance of an ERC-20 token. Where is that value actually stored?",
      options: [
        "In the holder's account, beside its ether",
        "In the token contract's storage",
        "In the token contract's codeHash field",
        "In the receipts of the transfers that moved it",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "What does eth_getBalance return for an address that has never been funded or deployed to?",
      options: [
        "null, since no state entry exists for that address",
        "An error saying the account does not exist in state",
        "0x0, as for any account with no balance",
        "0x0 with a flag marking the account as nonexistent",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why is one eth_getProof call better than separate eth_getBalance, eth_getTransactionCount, and eth_getCode calls at latest when you need a consistent snapshot?",
      options: [
        "eth_getBalance at latest reads pending pool state",
        "Separate latest calls can land on either side of a new block",
        "Only eth_getProof reads state; the others read history",
        "eth_getCode returns the code hash, which cannot be verified",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "eth_getCode returns 0x for an address at latest. What does that establish?",
      options: [
        "That the address is an externally owned account with a known key",
        "That it has no code now; a contract may still be deployed there",
        "That the address has never been funded or used on this chain",
        "That the address is a delegated account whose code was cleared",
      ],
      answer: 1,
    },
  ],

  "address": [
    {
      kind: "contrast",
      question: "What makes a CREATE2 address independent of the deployer's transaction order, unlike a CREATE address?",
      options: [
        "It hashes the deployer's nonce, which is fixed in advance",
        "It hashes a salt and the init code instead of the nonce",
        "The node reserves the address when the salt is registered",
        "It is derived from the deployer's public key alone",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "How does a 20-byte address appear when it is an indexed event argument inside a log topic?",
      options: [
        "Right-padded with twelve zero bytes to 32 bytes",
        "Hashed with Keccak-256, like a dynamic argument",
        "Left-padded with twelve zero bytes to 32 bytes",
        "As-is, in the first 20 bytes of the 32-byte topic",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Two address strings differ only in the capitalisation of some letters. What does that tell you?",
      options: [
        "They name different accounts, since addresses are case-sensitive",
        "Nothing about identity; the case is an EIP-55 checksum",
        "One is a contract and the other a key-controlled account",
        "The mixed-case form belongs to a different chain",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "Someone sends tokens to the zero address to burn them, but the token contract gives that address no special treatment. What happens to the tokens?",
      options: [
        "The protocol destroys them, as the zero address burns value",
        "The transfer reverts, since the zero address cannot receive",
        "They are stuck at an address with no known key",
        "They return to the contract's deployer after a timeout",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A library is asked to send ether to vitalik.eth. What does the node it talks to receive as the recipient?",
      options: [
        "The name itself, which the node resolves through its ENS config",
        "The name's Keccak hash, which the node maps back to an address",
        "A 20-byte address, which the library resolved with eth_call",
        "A special ENS transaction type that the node routes to the registry",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "How is the address of an externally owned account derived from its key?",
      options: [
        "The first 20 bytes of the SHA-256 hash of its private key",
        "The Keccak-256 hash of the sender and nonce, cut to 20 bytes",
        "The last 20 bytes of the Keccak-256 hash of its public key",
        "A value the network assigns when the key first sends a transaction",
      ],
      answer: 2,
    },
  ],

  "evm": [
    {
      kind: "contrast",
      question: "What does DELEGATECALL do differently from an ordinary CALL?",
      options: [
        "Runs the caller's code inside the callee's storage context",
        "Runs the callee's code against the caller's storage",
        "Forbids every state change for the duration of the call",
        "Forwards all remaining gas rather than 63/64 of it",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "Which check does eth_call skip that a real transaction must pass?",
      options: [
        "Metering the gas of each opcode it executes",
        "Checking the sender's signature and its nonce",
        "Undoing state when a require condition fails",
        "Reading storage of the contract being called",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What happens to a value written with TSTORE once the transaction ends?",
      options: [
        "It is written to the contract's storage trie like SSTORE",
        "It is discarded and never reaches eth_getStorageAt",
        "It is copied into the receipt, next to the logs",
        "It stays in memory for the next call in the same block",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can thousands of nodes replay a block and agree on its state root, even though contracts run arbitrary code?",
      options: [
        "Each block's proposer signs the state root, and others copy it",
        "Contracts are checked at deployment to reject nondeterministic code",
        "The EVM has no clock, files, or network; its only inputs are fixed",
        "Clients round floating-point results the same way by convention",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A dapp runs eth_call from the zero address, which holds no ether and whose key nobody has. What happens?",
      options: [
        "It fails, as the zero address cannot originate any call",
        "It fails with insufficient funds for gas * price + value",
        "It runs normally, since eth_call needs no signature or balance",
        "It runs, but storage reads return zero for that sender",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A lottery contract uses PREVRANDAO as its source of randomness. What is the weakness?",
      options: [
        "The value repeats every 256 blocks, so it can be predicted",
        "It is always zero since the Merge ended mining difficulty",
        "The proposer knows the value before it builds the block",
        "Only archive nodes can read it, so results cannot be checked",
      ],
      answer: 2,
    },
  ],

  "smart-contract": [
    {
      kind: "detail",
      question: "After a successful deployment, what does eth_getCode return at the new contract's address?",
      options: [
        "The exact bytes sent in the deployment's input field",
        "The source code, as compiled by the node on deployment",
        "The runtime bytecode that the init code returned",
        "The ABI followed by the runtime bytecode",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A proxy contract DELEGATECALLs an implementation for every call. When the implementation's code writes a variable, whose storage changes?",
      options: [
        "The implementation's, since its code performs the write",
        "The proxy's, as the caller's storage context is kept",
        "Both, since the write is mirrored into each contract",
        "Neither, as delegated code is limited to reading storage",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why must an application ship a contract's ABI instead of asking the node for it?",
      options: [
        "Nodes return the ABI only to the account that deployed it",
        "The chain stores bytecode only, with no function list or names",
        "The ABI is stored on chain but needs an archive node to read",
        "eth_getAbi exists, but public providers usually disable it",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "Since Dencun, what does SELFDESTRUCT do in a contract that was deployed in an earlier transaction?",
      options: [
        "It deletes the code and storage, as it did before Dencun",
        "It reverts, since the opcode was removed in Dencun",
        "It only sweeps the balance; code and storage stay",
        "It clears the storage but leaves the code in place",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What separates calling a view function with eth_call from calling it from another contract on chain?",
      options: [
        "Only the eth_call version is metered",
        "Only the on-chain call is paid for in gas",
        "Only the on-chain call can read storage",
        "Only the eth_call version can return data",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A developer wants a contract to look up an event it emitted last week in order to decide a payout. What is the problem?",
      options: [
        "Logs older than 256 blocks are pruned from contract view",
        "Contracts cannot read logs; needed data must be in storage",
        "Reading a log costs 2100 gas per topic, which is prohibitive",
        "Only the contract's deployer may read its logs from the EVM",
      ],
      answer: 1,
    },
  ],

  "contract-storage": [
    {
      kind: "detail",
      question: "A contract declares mapping(address => uint256) balances at slot 2. Where is the value for holder H stored?",
      options: [
        "At keccak256 of 2 as 32 bytes followed by H as 32 bytes",
        "At slot 2 plus the numeric value of H's address",
        "At keccak256 of H as 32 bytes followed by 2 as 32 bytes",
        "At keccak256 of H alone, with the slot number ignored",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Two uint128 variables are declared one after the other at the start of a contract. How many storage slots do they take?",
      options: [
        "Two, since each variable gets a slot of its own",
        "One, since together they fill exactly one 32-byte slot",
        "Two, since packing applies only inside structs",
        "Four, since each uint128 is stored as two halves",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A contract keeps a reentrancy flag in transient storage with TSTORE. What does eth_getStorageAt show of it after the transaction?",
      options: [
        "The flag's last value, since it shares persistent slots",
        "No trace of it, since transient storage never persists",
        "Its value, if queried at the block that included the call",
        "An error, since transient slots are rejected by the method",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can anyone read a contract variable declared private?",
      options: [
        "Private variables are kept in plain text only on archive nodes",
        "Visibility only stops other contracts; RPC reads any slot",
        "The private keyword is ignored by compilers since Solidity 0.8",
        "Anyone with the deployer's ABI can decrypt private storage",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A script hashes the slot number before the key when locating a mapping entry, and eth_getStorageAt returns zero. What went wrong?",
      options: [
        "The mapping is empty, since zero means no entries exist",
        "The order is key then slot, so it read an unused slot",
        "eth_getStorageAt cannot read mapping entries at all",
        "The slot must be hashed twice for mappings of addresses",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "An upgrade inserts a new variable in the middle of a contract's declarations. What happens to the variables declared after it?",
      options: [
        "They keep their slots, since slots are assigned by name",
        "They move to hashed slots derived from their names",
        "They shift to later slots, so old data no longer lines up",
        "Nothing, as the compiler appends new variables last",
      ],
      answer: 2,
    },
  ],

  "state": [
    {
      kind: "contrast",
      question: "A node keeps history and state separately. Which question does it answer from state?",
      options: [
        "Which logs a given contract emitted during the last week",
        "Which receipt a given transaction produced",
        "What an address's balance was at block 19,000,000",
        "Which transactions block 19,000,000 contained",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A node answers eth_getBlockByNumber for a six-month-old block, yet eth_call at that block fails with missing trie node. Why?",
      options: [
        "The block was reorged out and only its header survived",
        "The spec disables eth_call for blocks older than a month",
        "It kept that block's history but has pruned the state for it",
        "The block predates the EVM version the node now runs",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What changes account balances without any transaction being executed?",
      options: [
        "Base fee burning, which trims every balance a little",
        "eth_sendTransaction, when the node holds the account's key",
        "Validator withdrawals pushed in by the consensus layer",
        "State overrides that a caller passes to eth_call",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An app reads a receipt from one node behind a load balancer and a balance from another. What is the risk?",
      options: [
        "The second node rejects reads for blocks it did not import",
        "The two answers can come from different chain heads",
        "Balances from a second node are served from its pending pool",
        "The receipt's logsBloom will not match the second node's",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why is there no RPC method that writes a value into state directly?",
      options: [
        "Direct writes are allowed only on archive nodes",
        "Writes are batched and applied at the next epoch",
        "Only executing a block can change state",
        "The method exists but needs the admin namespace",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What does reading state at the pending tag reflect?",
      options: [
        "The network's agreed view of the next block's state",
        "The state at the latest block, delayed by one slot",
        "One node's guess at the next block, from its own pool",
        "The state that the next proposer has already committed to",
      ],
      answer: 2,
    },
  ],

  "state-root": [
    {
      kind: "detail",
      question: "The stateRoot in the header of block N describes the state at which point?",
      options: [
        "Before block N ran, so it equals its parent's post-state",
        "After block N's transactions, but before its withdrawals",
        "When the proposer began building block N's payload",
        "After block N's transactions and withdrawals are applied",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "Two execution clients compute different state roots for the same block. What happens?",
      options: [
        "Both accept it, and the next epoch reconciles their states",
        "The consensus layer takes the majority root and rewrites the header",
        "The client whose root differs from the header rejects the block",
        "Nothing, since the state root is informational metadata",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Besides the eth_getProof response, what do you need to verify a balance yourself?",
      options: [
        "The full state trie of that block from another node",
        "A header you already trust for that same block",
        "A second provider returning the same balance",
        "The transaction that last changed the balance",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why do two clients with completely different on-disk storage layouts still produce the same state root?",
      options: [
        "Clients convert their databases to one shared format per block",
        "The consensus layer computes the root and hands it to both",
        "The root is defined by the state data, not by how it is stored",
        "Storage layouts are fixed by the protocol for every client",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "A bridge wants to prove that a log was emitted. Why is a proof against stateRoot not enough?",
      options: [
        "stateRoot only covers accounts that sent transactions",
        "Logs sit under receiptsRoot, not under the state root",
        "Logs are pruned from the state trie after 256 blocks",
        "stateRoot uses SHA-256, which log proofs cannot reuse",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "An archive endpoint answers eth_call at a two-year-old block but refuses eth_getProof there. What explains it?",
      options: [
        "eth_getProof works only within the last 128 blocks by spec",
        "Proofs for old blocks need a trusted header it lacks",
        "It can replay old values without rebuilding the old trie",
        "The endpoint pruned the block but kept its receipts",
      ],
      answer: 2,
    },
  ],

  "logs-bloom": [
    {
      kind: "consequence",
      question: "A block's logsBloom does not contain the address you are looking for. What can you conclude?",
      options: [
        "Probably none matches, but the receipts must still be checked",
        "No log in that block was emitted by that address",
        "The block contains no logs of any kind",
        "Nothing, since blooms cover only topics, not addresses",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "The bloom of a block matches your filter. What must a correct client do next?",
      options: [
        "Return the match, since the bloom is authoritative",
        "Recompute the bloom from the header to double-check it",
        "Check the next block, since a match means the log is near",
        "Load the receipts and compare, as bloom matches can be false",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "How many of the 2048 bits does one address or topic set?",
      options: [
        "One",
        "Three",
        "Eleven",
        "Thirty-two",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can eth_getLogs not filter on a log's data field?",
      options: [
        "Data is encrypted until the block is finalized",
        "Only the address and topics go into the bloom",
        "Data is stored in the state trie, not in receipts",
        "Data is dropped from receipts after the block is built",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "What happens to the bloom's usefulness as blocks get busier?",
      options: [
        "It grows beyond 2048 bits to keep false positives low",
        "Most bits get set, so it matches almost anything",
        "It rotates to fresh hash functions to stay selective",
        "It becomes exact, since more logs sharpen each bit",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What separates a receipt's logsBloom from the logsBloom in its block header?",
      options: [
        "The receipt's covers topics only, while the header's adds addresses",
        "The receipt's covers its own logs; the header's ORs all of them",
        "The receipt's is exact; the header's allows false positives",
        "The receipt's is 256 bits; the header's is the full 2048",
      ],
      answer: 1,
    },
  ],

  "keccak-256": [
    {
      kind: "scenario",
      question: "web3_sha3 of empty input returns a digest starting 0xc5d24601. What does that tell you?",
      options: [
        "The node runs an outdated SHA3-256 implementation",
        "The input was rejected and a placeholder was returned",
        "The method computes Keccak-256, not NIST SHA3-256",
        "The method computes NIST SHA3-256, as its name says",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "One of these commitments is computed with SHA-256 rather than Keccak-256. Which one?",
      options: [
        "A four-byte function selector",
        "A storage trie key",
        "An execution block hash",
        "A blob's versioned hash",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A script passes the hex string 0x1234 to keccak256 as text rather than as the two bytes it represents. What results?",
      options: [
        "The same digest, since libraries detect hex input",
        "An error, since hashing text is not allowed",
        "A valid-looking digest of entirely the wrong input",
        "A SHA3-256 digest instead of a Keccak-256 one",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why do Keccak-256 and NIST SHA3-256 give completely different digests for the same input?",
      options: [
        "SHA3-256 hashes twice, while Keccak-256 hashes only once",
        "NIST changed the padding rule after Ethereum adopted Keccak",
        "Keccak-256 prepends the chain id before hashing any input",
        "SHA3-256 uses a 512-bit state, while Keccak-256 uses 256",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "You find a 32-byte commitment computed with SHA-256. Which side of Ethereum does it most likely belong to?",
      options: [
        "The consensus layer, as with SSZ roots",
        "The execution layer, as with trie keys",
        "The JSON-RPC layer, as with web3_sha3",
        "The devp2p layer, as with RLP messages",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "In the state trie, what key is an account stored under?",
      options: [
        "Its 20-byte address, with no hashing",
        "The Keccak-256 hash of its address",
        "The SHA-256 hash of its address",
        "The hash of its address and nonce",
      ],
      answer: 1,
    },
  ],

  "rlp": [
    {
      kind: "detail",
      question: "How does RLP encode the integer zero on the wire?",
      options: [
        "As the single byte 0x00",
        "As 0x80, the empty byte string",
        "As 0x8100, a one-byte string holding zero",
        "As 0xc0, the empty list",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can an RLP decoder not tell a 20-byte address from a 20-byte number without outside knowledge?",
      options: [
        "Both use the same type tag in the length prefix",
        "The decoder strips type tags to keep encodings canonical",
        "RLP records only lengths and nesting, never types",
        "Types sit in a trailing byte that decoders skip",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A raw transaction begins with the byte 0x02. Which part of it is RLP?",
      options: [
        "The whole payload, including the first byte",
        "Everything after that first byte",
        "None of it, since typed transactions use SSZ",
        "Only the signature fields at the end",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does RLP insist that integers carry no leading zeros?",
      options: [
        "Leading zeros would be read as a nested list prefix",
        "The EVM cannot load words that carry leading zeros",
        "So each value has one valid encoding and hashes the same",
        "Leading zeros exceed the 55-byte short-string limit",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A hand-built encoder writes a nonce as a fixed eight-byte value with leading zeros. What happens when the transaction is sent?",
      options: [
        "The node strips the zeros and accepts it unchanged",
        "It is accepted, since RLP ignores leading zeros",
        "It is rejected as a non-minimal encoding",
        "The nonce is read as eight separate list items",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "You are writing decoders for several byte sources. Which one is RLP-encoded?",
      options: [
        "The calldata in a transaction's input field",
        "A beacon block fetched as octet-stream",
        "The trie nodes that eth_getProof returns",
        "The body of a JSON-RPC response",
      ],
      answer: 2,
    },
  ],

  "ssz": [
    {
      kind: "detail",
      question: "Which hash function does SSZ Merkleization use to build a hash tree root?",
      options: [
        "Keccak-256",
        "SHA-256",
        "SHA3-256",
        "BLAKE2b",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What exactly is the hash tree root of an SSZ object?",
      options: [
        "One hash of the object's serialised bytes, taken in a single pass",
        "The root of a binary Merkle tree over the object's 32-byte chunks",
        "The root of the Merkle-Patricia trie holding the beacon state",
        "A checksum over the offsets in the object's variable-size part",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "You want a Beacon API endpoint to return a beacon state as SSZ rather than JSON. What do you send?",
      options: [
        "A format=ssz query parameter on the route",
        "The same request, sent to a separate binary-only port",
        "An Accept header of application/octet-stream",
        "A POST body asking for the ssz encoding",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What can a reader do with SSZ bytes that is impossible with RLP bytes?",
      options: [
        "Decode the value types without knowing the schema in advance",
        "Jump to a field via the schema without walking lengths",
        "Recover the object's hash tree root without hashing anything",
        "Skip unknown fields that a later fork appended to the object",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A tool decodes a new beacon block with the SSZ type from an earlier fork. What happens?",
      options: [
        "It decodes the shared fields and skips the new ones cleanly",
        "It fails the SHA-256 check and reports a corrupt download",
        "It reads the new object as garbage, since the schema changed",
        "It works, since SSZ types are frozen once they ship",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why can a light client verify one field of a large beacon state without downloading all of it?",
      options: [
        "Beacon states are small enough to fit into a single SSZ chunk",
        "Each field sits at a fixed position in a Merkle tree over the state",
        "Beacon nodes sign each field individually with their keys",
        "The Beacon API returns each field with an RLP trie proof",
      ],
      answer: 1,
    },
  ],

  "ecdsa-signature": [
    {
      kind: "detail",
      question: "How does a node learn which account sent a transaction?",
      options: [
        "It reads the from field inside the signed payload",
        "It looks the hash up in its index of senders",
        "It recovers the address from the signature",
        "The wallet names the sender when submitting it",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why did EIP-155 fold the chain id into v for legacy transactions?",
      options: [
        "So nodes can skip signature recovery on known chains",
        "So a signature for one chain is useless on another",
        "To make room in v for a second recovery bit",
        "So one signature can authorise a payment on several chains",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "Someone flips one byte of a signed transaction's value field in transit. What does the node see?",
      options: [
        "The original transaction, repaired using the signature",
        "A signature that now recovers to a different, unrelated address",
        "A valid transaction from the same sender with the new value",
        "A transaction flagged as modified in its eventual receipt",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "A legacy transaction has v equal to 0x26, which is 38. What does that encode under EIP-155?",
      options: [
        "Chain id 1 with recovery parity 0",
        "Chain id 19, as v is twice the chain id",
        "Chain id 1 with recovery parity 1",
        "Recovery parity 11, counted up from 27",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why do public endpoints disable eth_sendTransaction but accept eth_sendRawTransaction?",
      options: [
        "The first skips the pool's nonce and fee checks",
        "The first makes the node sign with a key it holds",
        "The first is limited to type 0x0 legacy transactions",
        "The first returns before the transaction is validated",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A library produces a signature whose s value lies in the upper half of the curve order. What happens when a transaction uses it?",
      options: [
        "It is accepted, since both s forms recover the same sender",
        "Nodes reject it, since EIP-2 requires a low s value",
        "The node flips it to the low form and accepts it",
        "It recovers a different sender and fails the balance check",
      ],
      answer: 1,
    },
  ],

  "wei": [
    {
      kind: "detail",
      question: "eth_getBalance returns 0xde0b6b3a7640000 for an address. How much ether is that?",
      options: [
        "0.1 ether",
        "1 ether",
        "10 ether",
        "1 gwei",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does JSON-RPC return balances as hex strings rather than JSON numbers?",
      options: [
        "Hex is shorter on the wire than decimal digits",
        "Balances are byte arrays rather than numbers",
        "Wei amounts exceed what a double holds exactly",
        "JSON-RPC 2.0 forbids numbers in any result",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A token contract reports decimals of 6, and balanceOf returns 1000000 for a holder. How much does the holder own?",
      options: [
        "1000000 tokens",
        "1 token",
        "0.000000000001 tokens",
        "0.000001 ether",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A dashboard converts wei balances to JavaScript numbers with Number before adding them up. What goes wrong?",
      options: [
        "Number throws on 0x-prefixed strings, so every balance fails",
        "Amounts above about 0.009 ether can silently lose precision",
        "Balances over 1000 ether overflow and become Infinity",
        "Zero balances fail, since Number rejects the string 0x0",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "A plain transfer uses 21000 gas at an effectiveGasPrice of 25 gwei. What is the fee?",
      options: [
        "0.00525 ether",
        "0.000525 ether",
        "0.0000525 ether",
        "525000 wei",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What separates an ERC-20 token amount from an ether amount counted in wei?",
      options: [
        "Token amounts use the same 10^18 scale, enforced by the EVM",
        "Token amounts put the decimal point where each contract says",
        "Token amounts are stored in gwei rather than in wei",
        "Token amounts are floats, since tokens are divisible",
      ],
      answer: 1,
    },
  ],

  "abi": [
    {
      kind: "detail",
      question: "How is the four-byte selector for a function derived?",
      options: [
        "First four bytes of the contract's address, plus an index",
        "An index the compiler assigns in declaration order",
        "Keccak-256 of its canonical signature, first four bytes",
        "Keccak-256 of the function name alone, without its types",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "A function takes a string argument. How does that argument appear in the calldata?",
      options: [
        "As its raw UTF-8 bytes in place, padded to a multiple of 32",
        "As the Keccak-256 hash of the string, in one word",
        "As a 32-byte offset, with length and bytes after the head",
        "As a pointer into the calling contract's memory",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "eth_call returns 0x and no error for a function that should return a uint256. What is the likely cause?",
      options: [
        "The call reverted, and the node hid the error",
        "The node's gas cap ran out before the function returned",
        "The address holds no code at the block queried",
        "The return value was zero, which encodes as 0x",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A developer hashes the text transfer(address to, uint256 amount) to get a selector. What happens when a call uses it?",
      options: [
        "It matches, since hashing ignores argument names",
        "It matches after the node normalises the signature",
        "It reaches no function, because names change the hash",
        "The call reverts with a Panic code for bad input",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Revert data begins with the selector 0x08c379a0. What does it carry?",
      options: [
        "A numeric code, encoded as Panic(uint256)",
        "A reason string, encoded as Error(string)",
        "A custom error's arguments, which need the ABI",
        "An out-of-gas report added by the node",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why is decoding a call result with the wrong ABI dangerous rather than merely failing?",
      options: [
        "The node rejects the call and bans the caller's key",
        "The decoder corrupts the contract's storage on write-back",
        "The bytes decode into plausible values instead of an error",
        "It changes the selector, so the next call hits another function",
      ],
      answer: 2,
    },
  ],

  "revert": [
    {
      kind: "scenario",
      question: "A transaction was mined with status 0x0. Where can you find its revert reason?",
      options: [
        "In the receipt, in an error field beside status",
        "In the receipt's logs, as a special error event",
        "Nowhere stored; replay it with eth_call or trace it",
        "In the transaction's input, appended by the node",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Revert data is 0x4e487b71 followed by a word holding 0x11. What failed?",
      options: [
        "A require failed with the reason string 0x11",
        "A custom error with selector 0x4e487b71 was thrown",
        "Arithmetic overflowed, raising Panic code 0x11",
        "The call ran out of gas after 0x11 frames",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "How does eth_call report a call whose execution reverts?",
      options: [
        "As a successful result of 0x, left for the caller to spot",
        "As a JSON-RPC error whose data holds the revert bytes",
        "As a null result, sent with an HTTP 400 status",
        "As a result object carrying a status field of 0x0",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What separates a REVERT from running out of gas, for the frame that fails?",
      options: [
        "REVERT keeps the frame's changes; out of gas undoes them",
        "REVERT returns unused gas and data; out of gas returns neither",
        "REVERT fails the whole transaction; out of gas fails one frame",
        "REVERT is free; out of gas charges the gas that was used",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why should a client library look for the data field instead of checking for error code 3 on a reverted eth_call?",
      options: [
        "Code 3 is reserved for out-of-gas failures, not reverts",
        "Code 3 appears only when the revert data is empty",
        "Providers disagree on the code; data holds the revert",
        "The code is random per request, to stop fingerprinting",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A transaction's outermost call reverts. What still happens to the transaction and its sender?",
      options: [
        "It is included, pays for its gas, and uses up the nonce",
        "Nothing; the transaction is dropped as if never sent",
        "Its gas is refunded in full, though its nonce is still used up",
        "It is included, but its nonce stays free for a retry",
      ],
      answer: 0,
    },
  ],

  "mempool": [
    {
      kind: "detail",
      question: "eth_getTransactionByHash returns a transaction whose blockNumber is null. What does that mean?",
      options: [
        "The node rejected it but kept a record of the attempt",
        "It was mined, and the node pruned its block details",
        "The node holds it in its pool, not yet in a block",
        "The node has never seen that hash at all",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "An account's next nonce is 7, and a transaction from it arrives with nonce 9. Where does the pool put it?",
      options: [
        "In the pending set, since its nonce is above 7",
        "In the queued set, until nonces 7 and 8 arrive",
        "Straight into the next block, out of order",
        "Nowhere; it is rejected as nonce too high",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can two well-connected nodes disagree about which transactions are pending?",
      options: [
        "The protocol assigns each node its own shard of the pool",
        "Only the next proposer holds the complete, canonical pool",
        "Pools are local; gossip, eviction, and private flow differ",
        "Pending transactions become consensus data one slot later",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An app sends a transaction through endpoint A and polls endpoint B for its receipt. What can go wrong?",
      options: [
        "B rejects the poll, since it never saw the transaction",
        "B can report null long after the transaction is included",
        "B returns A's pending receipt with status 0x0",
        "B double-counts the transaction when A's copy arrives",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What is the largest encoded transaction that Geth's pool accepts by default?",
      options: [
        "32 KB",
        "128 KB",
        "1024 KB",
        "24 KB",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "Searchers send transactions straight to builders through private endpoints. What does a pending-transaction watcher see of them?",
      options: [
        "Nothing, until they turn up for the first time in a block",
        "Everything, as builders re-gossip private flow publicly",
        "Only their hashes, as private endpoints redact the rest",
        "Only the blob ones, since their sidecars travel publicly",
      ],
      answer: 0,
    },
  ],

  "withdrawals": [
    {
      kind: "detail",
      question: "In what unit is the amount field of a withdrawal expressed?",
      options: [
        "Wei, like the other RPC values",
        "Ether, as a hex quantity",
        "Gwei, a billion wei each",
        "Validator shares of 32 ether",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A withdrawal credits an address. What can an indexer observe of it?",
      options: [
        "A transaction sent from the zero address to the recipient",
        "A log from a system contract at a fixed address",
        "A balance change, and its entry in the block body's list",
        "A receipt with status 0x1 and an empty logs array",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "How many withdrawals can one execution block carry at most?",
      options: [
        "As many as the block gas limit allows",
        "One per validator that exited in the slot",
        "At most 16, fixed by the protocol",
        "Unlimited, since they use no gas",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An exchange rebuilds balances by summing every transaction that touches its addresses. What happens for an address that receives withdrawals?",
      options: [
        "Nothing, as withdrawals arrive as transactions",
        "Its balance is overstated by the withdrawal fees",
        "Its computed balance drifts below the true one",
        "It double-counts each credit, once per receipt",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why does a withdrawal have no sender, no gas, and no receipt?",
      options: [
        "Its fees are paid on the consensus layer, which keeps the receipt",
        "It is a credit the consensus layer pushes in, not a transaction",
        "Validators sign it in batches, so one receipt covers the block",
        "The recipient pays its gas later, from the credited amount",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What distinguishes a partial withdrawal from a full one?",
      options: [
        "A partial is paid in gwei, and a full one in wei",
        "A partial pays out the excess; a full pays all after exit",
        "A partial goes to 0x00 credentials; a full to 0x01 ones",
        "A partial counts toward the 16 per block; a full does not",
      ],
      answer: 1,
    },
  ],

  "genesis": [
    {
      kind: "scenario",
      question: "You add a new RPC provider and want to confirm it really serves mainnet. Which check is strongest?",
      options: [
        "Confirming that eth_chainId answers 0x1",
        "Confirming that net_version answers 1",
        "Comparing its block 0 hash with the known one",
        "Reading web3_clientVersion for the network",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "How are post-Merge upgrades scheduled in an execution client's chain configuration?",
      options: [
        "By block number, as upgrades were before",
        "By timestamp, in fields such as cancunTime",
        "By consensus-layer epoch, in fields like cancunEpoch",
        "By a total difficulty threshold per upgrade",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Where does the state at block 0 come from?",
      options: [
        "The transactions included in block 0",
        "The deposit contract's balances at launch",
        "The allocation listed in the genesis file",
        "Nowhere; state starts empty at block 1",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "Two nodes run with fork schedules that differ only in pragueTime. When does the problem show up?",
      options: [
        "At startup, when the peers compare configs and refuse",
        "Never, since the consensus layer overrides the schedule",
        "When the first of them activates Prague and they split",
        "At the next restart, when the database fails to open",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why is a genesis hash harder to fake by accident than an eth_chainId answer?",
      options: [
        "It is signed by the Ethereum Foundation at every release",
        "It is computed from the chain, not typed into a config",
        "It is checked by the consensus layer on every request",
        "It changes at every upgrade, so stale values stand out",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A contract works on a local devnet but fails on a public testnet with an invalid opcode. What is the likely cause?",
      options: [
        "The testnet's genesis allocation lacked the deployer's funds",
        "The opcode's fork is live on the devnet but not yet there",
        "The devnet's chain id disabled the opcode check entirely",
        "The testnet node pruned the state the opcode needed",
      ],
      answer: 1,
    },
  ],

  "eip-7702": [
    {
      kind: "detail",
      question: "eth_getCode on an account returns 0xef0100 followed by twenty bytes. What is it?",
      options: [
        "A contract whose runtime bytecode is unusually short",
        "A delegation designator naming the code the account runs",
        "An encoding error from a client without type 0x4 support",
        "A pointer from the account to its own storage root",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A delegated account runs its delegate's code, which writes a storage slot. Whose storage changes?",
      options: [
        "The delegate contract's storage",
        "Both, since the write is mirrored",
        "The delegated account's own storage",
        "Neither; delegated code is read-only",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "A type 0x4 transaction sets code on an account. Who pays for it?",
      options: [
        "The authorizing account, whoever sends the transaction",
        "Its sender, who may be a sponsor rather than the authority",
        "The delegate contract, from its own balance",
        "The proposer, who is repaid by the protocol",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A type 0x4 transaction carries an authorization whose nonce no longer matches the authority's. What happens?",
      options: [
        "The whole transaction reverts and its gas is refunded",
        "The node rejects the transaction from its pool at once",
        "It is skipped, and the transaction still executes",
        "The authority's nonce is reset to match the authorization",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why should an indexer re-read an account's delegation at each block it cares about instead of caching it?",
      options: [
        "Delegations expire automatically after 8191 blocks",
        "A later authorization can repoint or clear it",
        "The designator is rewritten in a new format each fork",
        "Delegations are valid only within the signing transaction",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What distinguishes EIP-7702 from ERC-4337 as a route to smart-account behaviour?",
      options: [
        "7702 needs a bundler and an entry point contract; 4337 needs neither",
        "7702 changes existing accounts in-protocol; 4337 uses new ones",
        "7702 works only on new accounts; 4337 on existing ones",
        "7702 lives in the mempool only; 4337 changes consensus",
      ],
      answer: 1,
    },
  ],
};
