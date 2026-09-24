// Category: Protocol data — the structures every RPC answer is made of:
// blocks, transactions, receipts, accounts, state, gas, and encodings.

export const topics = [
  {
    id: "block",
    title: "Block",
    category: "protocol",
    aliases: ["execution block", "block object", "getBlockByNumber", "block body", "uncles", "ommers"],
    summary: "An execution block is a [[block-header|header]] plus a body, the ordered [[transaction|transactions]] and the [[withdrawals|withdrawals]], that clients execute as one atomic step from the parent [[state|state]] to a new state, identified by its number and its [[block-hash|hash]].",
    sections: [
      {
        heading: "Header and body",
        paragraphs: [
          "The [[block-header|header]] is a fixed list of fields that commits to everything else: `stateRoot`, `transactionsRoot`, `receiptsRoot`, and `withdrawalsRoot` are root hashes over data the block consumed or produced, and `logsBloom` summarises its [[event-log|logs]]. The body holds the ordered [[transaction|transactions]] and the [[withdrawals|withdrawals]] that the [[consensus-layer|consensus layer]] pushed in. One body field survives from proof of work: the ommers (uncles) list, always empty since [[the-merge|the Merge]], so `sha3Uncles` is always the hash of the empty list and `uncles` is always `[]` in RPC.",
          "Execution is all-or-nothing per block. Every client that applies the same block to the same parent state must derive the same `stateRoot`, or it rejects the block as invalid. Order inside the body is fixed by the proposer and it matters, because transaction N runs against the state left by transaction N-1; that dependence is what makes [[mev|ordering]] worth money.",
        ],
      },
      {
        heading: "One block per slot",
        paragraphs: [
          "Since the Merge an execution block is produced as an [[execution-payload|execution payload]], carried inside a [[beacon-block|beacon block]] for one 12-second [[slot-epoch|slot]], and handed to the [[execution-client|execution client]] over the [[engine-api|Engine API]]. Numbers stay consecutive, but time does not: a missed slot produces no block, so `timestamp` jumps by 24 seconds while `number` still advances by one. Do not convert a block count into elapsed time, and do not assume block N was produced at genesis time plus twelve times N.",
        ],
      },
      {
        heading: "The block object in RPC",
        paragraphs: [
          "[[eth-get-block-by-number|eth_getBlockByNumber]] and `eth_getBlockByHash` return one JSON object that merges the header fields with the body and with values the node derives: `hash`, `size` (the byte length of the [[rlp|RLP]] encoding), `transactions`, `withdrawals`, and `uncles`. The boolean second parameter chooses whether `transactions` holds 32-byte hashes or full [[transaction|transaction]] objects, which on a busy block is the difference between a few kilobytes and several hundred. An unknown block returns `null` rather than an [[rpc-errors|error]].",
          "The block is also the unit of consistency for every other read. A [[block-tag|block tag]] or number selects which state a read answers from, [[eth-get-logs|eth_getLogs]] takes a block range, and every [[transaction-receipt|receipt]] names the block that produced it. When several values have to agree with each other, pin them all to one block number or [[block-hash|block hash]] instead of issuing separate `latest` calls.",
        ],
      },
    ],
    example: {
      title: "A block fetched with transaction hashes only (abridged)",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBlockByNumber\",\"params\":[\"0x15318a4\",false]}\n\n// result\n{\n  \"number\": \"0x15318a4\",\n  \"hash\": \"0x9d4c4a1f…7b02\",\n  \"parentHash\": \"0x2f6e91c3…a8d1\",\n  \"timestamp\": \"0x68c2a13f\",\n  \"gasLimit\": \"0x2255100\",\n  \"gasUsed\": \"0x11f8a3c\",\n  \"baseFeePerGas\": \"0x7a1d2e4b\",\n  \"size\": \"0x1d4f2\",\n  \"transactions\": [\"0x5c504ed4…2060\", \"0x8b1f77a9…c3e1\"],\n  \"withdrawals\": [{\"index\":\"0x4a1b2c\",\"validatorIndex\":\"0x1d4e\",\"address\":\"0x8d9f…3b71\",\"amount\":\"0xbd9f1c\"}],\n  \"uncles\": []\n}",
      note: "Passing `true` as the second parameter replaces each hash in `transactions` with the full transaction object; every other field is unchanged.",
    },
    pitfalls: [
      "Treating block numbers as a clock; a missed slot costs 12 seconds without costing a number, so read `timestamp` when you need time.",
      "Requesting full transaction objects when hashes would do, which multiplies response size and provider cost for every block you scan.",
      "Assuming a number identifies a block; after a [[reorg|reorg]] the same number can name different content, which is why receipts and logs also carry `blockHash`.",
    ],
    related: ["block-header", "transaction", "eth-get-block-by-number", "block-hash", "withdrawals", "execution-payload", "state", "reorg", "block-tag"],
    sources: [
      { title: "ethereum.org: Blocks", url: "https://ethereum.org/developers/docs/blocks/" },
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
      { title: "EIP-4895: Beacon chain push withdrawals as operations", url: "https://eips.ethereum.org/EIPS/eip-4895" },
    ],
  },
  {
    id: "block-header",
    title: "Block header",
    category: "protocol",
    aliases: ["header fields", "stateRoot", "baseFeePerGas", "prevRandao", "mixHash", "withdrawalsRoot", "excessBlobGas", "parentBeaconBlockRoot", "requestsHash"],
    summary: "The block header is the roughly twenty-field record that commits to a [[block|block]]'s [[state|state]], [[transaction|transactions]], [[transaction-receipt|receipts]], and [[withdrawals|withdrawals]], carries the chain's position and fee parameters, and hashes to the [[block-hash|block hash]].",
    sections: [
      {
        heading: "What the header commits to",
        paragraphs: [
          "Four fields are roots of [[merkle-patricia-trie|Merkle-Patricia tries]]. `stateRoot` commits to the entire [[state|world state]] as it exists after the block ran, which is why [[eth-get-proof|eth_getProof]] can prove a balance against it. `transactionsRoot`, `receiptsRoot`, and `withdrawalsRoot` commit to the body's lists, each built as a trie keyed by the [[rlp|RLP]]-encoded index of the item. `logsBloom` is not a root but a 2048-bit [[logs-bloom|bloom filter]] over the addresses and topics of every log in the block, and `requestsHash` (added by Pectra's EIP-7685) commits to execution-layer requests such as deposits and validator exits.",
          "Because these are commitments, a header is enough to check body data you received from somewhere else. Change one byte of one transaction and `transactionsRoot` changes, `receiptsRoot` almost certainly changes, `stateRoot` changes, and therefore so does the block hash.",
        ],
      },
      {
        heading: "Position, gas, and fees",
        paragraphs: [
          "`parentHash` links this header to the previous one and is what makes a chain a chain; walking `parentHash` backwards is how a client or an [[indexer|indexer]] verifies it has a contiguous history. `number` is the height, `timestamp` is the Unix second of the [[slot-epoch|slot]], and `extraData` is up to 32 free-form bytes that builders use as a signature.",
          "`gasLimit` is the block's capacity, which a proposer can move by at most one 1024th of the parent's limit per block, and `gasUsed` is what the transactions actually consumed. `baseFeePerGas` is the burned per-[[gas|gas]] price computed from the parent block by [[eip-1559|EIP-1559]]. `blobGasUsed` and `excessBlobGas` do the same job for the separate [[blob|blob]] fee market: `excessBlobGas` is the running surplus carried between blocks, and the blob base fee (`eth_blobBaseFee`) is derived from it.",
        ],
      },
      {
        heading: "Fields that changed meaning",
        paragraphs: [
          "Three fields are proof-of-work leftovers. `difficulty` is `0x0` and `nonce` is `0x0000000000000000` in every post-[[the-merge|Merge]] block. `mixHash` was repurposed by EIP-4399 to carry `prevRandao`, the [[consensus-layer|consensus layer]]'s randomness for that slot, and most clients still expose it in JSON under the name `mixHash`; inside the [[evm|EVM]] the old `DIFFICULTY` opcode now returns that value as `PREVRANDAO`. The `miner` field is the payload's fee recipient, which for a block bought through [[mev-boost|MEV-Boost]] is usually the builder's address, with the proposer paid by a transfer at the end of the block.",
          "`parentBeaconBlockRoot` (EIP-4788, Dencun) puts the parent [[beacon-block|beacon block]] root in the execution header so contracts can verify consensus data, and it is not the same thing as the parent execution [[block-hash|block hash]].",
        ],
      },
      {
        heading: "Reading headers over RPC",
        paragraphs: [
          "[[eth-get-block-by-number|eth_getBlockByNumber]] returns every header field by its spec name, mixed in with `hash`, `size`, and the body. Fields added by a fork simply do not appear on older blocks: `baseFeePerGas` starts at London, `withdrawalsRoot` at Shapella, the blob and beacon-root fields at Dencun, and `requestsHash` at Pectra. Decode them as optional, and treat a missing field as a pre-fork block rather than an error.",
        ],
      },
    ],
    example: {
      title: "Header fields of a recent block (abridged)",
      language: "json",
      code: "{\n  \"parentHash\": \"0x2f6e91c3…a8d1\",\n  \"sha3Uncles\": \"0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347\",\n  \"miner\": \"0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5\",\n  \"stateRoot\": \"0x8c1f4b2a…09e7\",\n  \"transactionsRoot\": \"0x4a92f0d1…bb34\",\n  \"receiptsRoot\": \"0x7e3c55af…10c9\",\n  \"logsBloom\": \"0x00200000…000000\",\n  \"difficulty\": \"0x0\",\n  \"number\": \"0x15318a4\",\n  \"gasLimit\": \"0x2255100\",\n  \"gasUsed\": \"0x11f8a3c\",\n  \"timestamp\": \"0x68c2a13f\",\n  \"extraData\": \"0x6265617665726275696c642e6f7267\",\n  \"mixHash\": \"0xd9a1f3c0…5e42\",\n  \"nonce\": \"0x0000000000000000\",\n  \"baseFeePerGas\": \"0x7a1d2e4b\",\n  \"withdrawalsRoot\": \"0x1b0f8c77…d3a5\",\n  \"blobGasUsed\": \"0xc0000\",\n  \"excessBlobGas\": \"0x4e0000\",\n  \"parentBeaconBlockRoot\": \"0x64f2b8e1…7c30\",\n  \"requestsHash\": \"0xe3b0c442…b855\"\n}",
      note: "`extraData` decodes to the ASCII string `beaverbuild.org`, and `blobGasUsed` of `0xc0000` is exactly six blobs of 131072 blob gas each.",
    },
    pitfalls: [
      "Reading `mixHash` as leftover mining data; since the Merge it carries `prevRandao`, and contracts that use it as randomness are reading consensus output.",
      "Assuming every header field exists on every block; asking for `withdrawalsRoot` on a pre-Shapella block yields nothing, and strict decoders crash on it.",
      "Confusing `parentBeaconBlockRoot` with `parentHash`; the first identifies a consensus block, the second an execution block.",
      "Treating `miner` as the validator that proposed the block; with external block building it is usually the builder's fee recipient.",
    ],
    related: ["block", "state-root", "block-hash", "logs-bloom", "eip-1559", "withdrawals", "merkle-patricia-trie", "blob", "eth-get-block-by-number", "execution-payload"],
    sources: [
      { title: "EIP-4399: Supplant DIFFICULTY opcode with PREVRANDAO", url: "https://eips.ethereum.org/EIPS/eip-4399" },
      { title: "EIP-4788: Beacon block root in the EVM", url: "https://eips.ethereum.org/EIPS/eip-4788" },
      { title: "EIP-7685: General purpose execution layer requests", url: "https://eips.ethereum.org/EIPS/eip-7685" },
    ],
  },
  {
    id: "block-hash",
    title: "Block hash",
    category: "protocol",
    aliases: ["blockHash", "getBlockByHash", "BLOCKHASH", "header hash"],
    summary: "A block hash is the [[keccak-256|Keccak-256]] digest of the [[rlp|RLP]]-encoded [[block-header|header]]: 32 bytes that change if any header field changes, and therefore name one exact [[block|block]] together with everything it contains.",
    sections: [
      {
        heading: "How it is computed",
        paragraphs: [
          "Hash the RLP encoding of the header list and you have the block hash. Nothing else is hashed directly, because the header already commits to the body through `transactionsRoot`, `withdrawalsRoot`, and `receiptsRoot`, and to the result of execution through `stateRoot`. Any change anywhere in the block therefore propagates into the hash. No node has to be trusted for it either: a client that has the header recomputes the hash itself, and the [[engine-api|Engine API]] has a dedicated `INVALID_BLOCK_HASH` status for a payload whose claimed hash does not match its fields.",
        ],
      },
      {
        heading: "Hash versus number",
        paragraphs: [
          "A block number is a position on the chain; a block hash is an identity. Two different blocks can hold the same number at the same time during a [[reorg|reorganisation]], and one of them will lose. This is why consumers that must not double-count, such as an [[indexer|indexer]], store `blockHash` and `parentHash` for every block they process: if the `parentHash` of the new head does not equal the hash they recorded, a reorg happened and derived data has to be rolled back.",
          "[[block-tag|EIP-1898]] lets read methods take `{\"blockHash\": \"0x…\", \"requireCanonical\": true}` instead of a number, so a node answers from that exact block or fails cleanly if it is no longer canonical. Using it removes the race where a call meant for block N is answered from a different block N.",
        ],
      },
      {
        heading: "Where it appears",
        paragraphs: [
          "`eth_getBlockByHash` takes one, [[eth-get-logs|eth_getLogs]] accepts `blockHash` in place of a `fromBlock`/`toBlock` range (usually without the provider's range limits, since it is a single block), and every [[transaction-receipt|receipt]] and [[event-log|log]] carries the `blockHash` it came from. Inside the [[evm|EVM]], the `BLOCKHASH` opcode returns the hash of one of the 256 most recent blocks and zero beyond that window; Pectra's EIP-2935 additionally stores the last 8191 hashes in a system contract that contracts can read.",
          "One hash that looks similar is not the same: the [[beacon-block|beacon block]] root identifies the consensus block that wrapped this payload, and the [[beacon-api|Beacon API]] indexes by that root, not by the execution block hash. Passing one where the other is expected returns a not-found response rather than a type error.",
        ],
      },
    ],
    pitfalls: [
      "Caching immutable data under a block number; after a reorg the number names different content, so key by `blockHash` instead.",
      "Passing an execution block hash to a Beacon API route such as `/eth/v2/beacon/blocks/{block_id}`, which expects a beacon block root.",
      "Expecting `BLOCKHASH` in a contract to reach arbitrarily far back; outside the 256-block window it returns zero, which naive code reads as a valid hash.",
      "Comparing hashes as strings without normalising case; clients return lowercase hex, but user input and some tools do not.",
    ],
    related: ["block-header", "block", "keccak-256", "rlp", "reorg", "block-tag", "eth-get-block-by-number", "state-root", "beacon-block"],
    sources: [
      { title: "ethereum.org: Blocks", url: "https://ethereum.org/developers/docs/blocks/" },
      { title: "EIP-1898: Add blockHash to defaultBlock methods", url: "https://eips.ethereum.org/EIPS/eip-1898" },
      { title: "EIP-2935: Serve historical block hashes from state", url: "https://eips.ethereum.org/EIPS/eip-2935" },
    ],
  },
  {
    id: "transaction",
    title: "Transaction",
    category: "protocol",
    aliases: ["tx", "signed transaction", "calldata", "input data", "tx hash"],
    summary: "A transaction is a message signed by an externally owned [[account|account]] that tells the network to transfer value, call a [[smart-contract|contract]], or deploy one, and it is the only way anything on Ethereum changes [[state|state]].",
    sections: [
      {
        heading: "What a transaction is",
        paragraphs: [
          "Only an externally owned account can originate a transaction, because a transaction is valid only if its [[ecdsa-signature|ECDSA signature]] recovers to the sender. Everything a contract does afterwards, including calls into other contracts, happens inside that one transaction; those internal calls have no hash, no [[transaction-receipt|receipt]], and no existence in the [[block|block]] body, which is why they show up only in an [[execution-trace|execution trace]]. The transaction is also the unit of atomicity: it either applies in full or, if it [[revert|reverts]], leaves no state change behind except the [[nonce|nonce]] increment and the [[gas|gas]] it burned.",
        ],
      },
      {
        heading: "The fields",
        paragraphs: [
          "A signed transaction carries `nonce`, `to`, `value` in [[wei|wei]], `input` (the calldata, named `data` by older tooling), `gas` (the limit the sender is willing to spend), the fee fields, `chainId`, and the signature as `r`, `s`, and `v` or `yParity`. A [[transaction-types|typed transaction]] adds `accessList`, `blobVersionedHashes`, or `authorizationList` depending on its type. `to` is `null` for a contract deployment, in which case `input` is the init code and the new [[address|address]] is derived from the sender and nonce.",
          "The fee fields depend on the type: legacy transactions carry a single `gasPrice`, while [[eip-1559|EIP-1559]] transactions carry `maxFeePerGas` and `maxPriorityFeePerGas`. What was actually paid is not in the transaction at all; it appears as `effectiveGasPrice` in the receipt, once the block's base fee is known.",
          "The transaction object returned by [[eth-get-transaction-by-hash|eth_getTransactionByHash]] adds fields that were never signed: `from` is recovered from the signature, and `hash`, `blockHash`, `blockNumber`, and `transactionIndex` describe where the node found it. For a transaction still in the [[mempool|pool]], the last three are `null`.",
        ],
      },
      {
        heading: "From signing to receipt",
        paragraphs: [
          "A sender builds the fields, signs the [[keccak-256|Keccak-256]] of the encoded payload with its private key, and serialises the result. The hash of that serialised form is the transaction hash, which is why changing any field, even the gas limit, produces a different transaction. The signed bytes go to a node through [[eth-send-raw-transaction|eth_sendRawTransaction]], which validates them against the pool's rules and returns the hash immediately. Inclusion is a separate event: a proposer picks the transaction, the block executes, and only then does a receipt exist.",
        ],
      },
    ],
    example: {
      title: "A dynamic-fee transaction as RPC returns it (abridged)",
      language: "json",
      code: "{\n  \"hash\": \"0x5c504ed4…2060\",\n  \"type\": \"0x2\",\n  \"chainId\": \"0x1\",\n  \"nonce\": \"0x2f\",\n  \"from\": \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\n  \"to\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  \"value\": \"0x0\",\n  \"gas\": \"0x1adb0\",\n  \"maxFeePerGas\": \"0x9502f9000\",\n  \"maxPriorityFeePerGas\": \"0x3b9aca00\",\n  \"input\": \"0xa9059cbb000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266000000000000000000000000000000000000000000000000000000003b9aca00\",\n  \"accessList\": [],\n  \"blockNumber\": \"0x15318a4\",\n  \"transactionIndex\": \"0x2a\",\n  \"yParity\": \"0x1\",\n  \"r\": \"0x8f2a…41c9\",\n  \"s\": \"0x1d77…0b3e\"\n}",
      note: "`value` is `0x0` because the ether transfer is not ether at all: `input` is an [[abi|ABI]]-encoded `transfer(address,uint256)` call on a token contract.",
    },
    pitfalls: [
      "Treating `from` as signed data; it is recovered from the signature, so an invalid signature yields a different sender rather than a missing one.",
      "Assuming a transaction hash means inclusion; a hash exists the moment the transaction is signed, even if no node ever accepts it.",
      "Reading `value` to measure a token transfer; token movements are calldata and [[event-log|logs]], and `value` stays `0x0`.",
      "Rebuilding and resigning a transaction to bump the fee without keeping the same [[nonce|nonce]], which sends a second transaction instead of replacing the first.",
    ],
    related: ["transaction-types", "transaction-receipt", "nonce", "ecdsa-signature", "eth-send-raw-transaction", "mempool", "gas", "eip-1559", "abi", "address"],
    sources: [
      { title: "ethereum.org: Transactions", url: "https://ethereum.org/developers/docs/transactions/" },
      { title: "EIP-1559: Fee market change for ETH 1.0 chain", url: "https://eips.ethereum.org/EIPS/eip-1559" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "transaction-types",
    title: "Typed transactions",
    category: "protocol",
    aliases: ["EIP-2718", "type 0x2", "type 0x3", "envelope", "0x1", "0x4", "legacy transaction"],
    summary: "EIP-2718 wraps every new [[transaction|transaction]] format in an envelope whose first byte is the type, so the protocol can add fields without breaking old ones: `0x0` legacy, `0x1` access list, `0x2` dynamic fee, `0x3` blob, `0x4` set code.",
    sections: [
      {
        heading: "The envelope",
        paragraphs: [
          "A typed transaction is serialised as a single type byte followed by that type's payload, usually an [[rlp|RLP]] list. A legacy transaction has no type byte at all; it is a bare RLP list, and since an RLP list always starts with a byte of `0xc0` or higher, a decoder can tell the two apart by looking at the first byte. Types are reserved from `0x00` to `0x7f`, which leaves room for future formats and also lets a [[rollup|rollup]] define its own, such as the OP Stack deposit type `0x7e` that has no signature.",
          "The type byte is part of what gets hashed and signed, so a transaction cannot be reinterpreted as another type. In RPC the type appears as `type` on both the [[transaction|transaction]] object and its [[transaction-receipt|receipt]], and the bytes you hand to [[eth-send-raw-transaction|eth_sendRawTransaction]] are exactly this envelope, hex-encoded.",
        ],
      },
      {
        heading: "The five types",
        paragraphs: [
          "`0x0` is the original format: `nonce`, `gasPrice`, `gas`, `to`, `value`, `data`, and a signature whose `v` encodes the [[chain-id|chain id]] under EIP-155. `0x1` (EIP-2930) keeps `gasPrice` but adds an explicit `chainId`, an [[access-list|accessList]], and `yParity` instead of the overloaded `v`. `0x2` (EIP-1559) replaces `gasPrice` with `maxFeePerGas` and `maxPriorityFeePerGas` and is what wallets send by default today.",
          "`0x3` (EIP-4844) adds `maxFeePerBlobGas` and `blobVersionedHashes` for [[blob|blob-carrying]] transactions. It cannot deploy a contract, so `to` must be set, and the blobs themselves are not in the block: the transaction commits to them by versioned hash while the data travels as a sidecar on the consensus network. `0x4` (EIP-7702, Pectra) adds an `authorizationList` that points an [[account|EOA]] at contract code; see [[eip-7702|set code transactions]].",
        ],
      },
      {
        heading: "What this means for callers",
        paragraphs: [
          "Decoders must treat fields as type-dependent. A type `0x2` transaction has no `maxFeePerBlobGas`, a type `0x0` has no `accessList`, and clients differ in whether they echo a synthesised `gasPrice` on dynamic-fee transactions, so read `effectiveGasPrice` from the receipt when you want the price actually paid. Anything that parses raw transactions, including [[mempool|pool]] watchers, must branch on the leading byte rather than assuming an RLP list.",
          "A node will reject a type it does not know with an [[rpc-errors|error]] such as 'transaction type not supported', which is the normal symptom of sending a post-upgrade transaction to a client that has not been updated for the [[hardfork|network upgrade]].",
        ],
      },
    ],
    example: {
      title: "The same payment as legacy and as dynamic fee",
      language: "json",
      code: "// type 0x0, fields as RPC returns them\n{\"type\":\"0x0\",\"nonce\":\"0x9\",\"gasPrice\":\"0x4a817c800\",\"gas\":\"0x5208\",\"to\":\"0x70997970…79c8\",\"value\":\"0xde0b6b3a7640000\",\"input\":\"0x\",\"v\":\"0x26\",\"r\":\"0x…\",\"s\":\"0x…\"}\n\n// type 0x2, same payment\n{\"type\":\"0x2\",\"chainId\":\"0x1\",\"nonce\":\"0x9\",\"maxFeePerGas\":\"0x4a817c800\",\"maxPriorityFeePerGas\":\"0x5f5e100\",\"gas\":\"0x5208\",\"to\":\"0x70997970…79c8\",\"value\":\"0xde0b6b3a7640000\",\"input\":\"0x\",\"accessList\":[],\"yParity\":\"0x0\",\"r\":\"0x…\",\"s\":\"0x…\"}\n\n// on the wire, the second one is: 0x02 || rlp([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gas, to, value, data, accessList, yParity, r, s])",
      note: "`0x26` in the legacy `v` is 38, which encodes both the recovery bit and chain id 1 under EIP-155; the typed form keeps them apart as `yParity` and `chainId`.",
    },
    pitfalls: [
      "Writing a raw-transaction decoder that assumes RLP; anything from type `0x1` onwards starts with a single type byte instead.",
      "Sending `gasPrice` together with `maxFeePerGas` in one call object, which clients reject as conflicting fee fields.",
      "Assuming a blob transaction you fetched over RPC contains its blobs; only `blobVersionedHashes` is in the transaction.",
      "Hardcoding a list of known types; each [[hardfork|upgrade]] can add one, and unknown types must be skipped rather than mis-parsed.",
    ],
    related: ["transaction", "eip-1559", "access-list", "blob", "eip-7702", "rlp", "eth-send-raw-transaction", "transaction-receipt", "l2-rpc"],
    sources: [
      { title: "EIP-2718: Typed Transaction Envelope", url: "https://eips.ethereum.org/EIPS/eip-2718" },
      { title: "EIP-2930: Optional access lists", url: "https://eips.ethereum.org/EIPS/eip-2930" },
      { title: "EIP-4844: Shard Blob Transactions", url: "https://eips.ethereum.org/EIPS/eip-4844" },
    ],
  },
  {
    id: "transaction-receipt",
    title: "Transaction receipt",
    category: "protocol",
    aliases: ["receipt", "status", "gasUsed", "cumulativeGasUsed", "effectiveGasPrice", "logs"],
    summary: "A receipt is the record a node keeps of what happened when one [[transaction|transaction]] executed inside a [[block|block]]: whether it succeeded, how much [[gas|gas]] it used, what it paid, and which [[event-log|logs]] it emitted.",
    sections: [
      {
        heading: "What is in it",
        paragraphs: [
          "`status` is `0x1` for success and `0x0` for a [[revert|revert]] or any other failure; receipts from before the Byzantium upgrade in 2017 carry a post-state `root` instead. `gasUsed` is what this transaction consumed and `cumulativeGasUsed` is the running total for the block up to and including it, so the difference between consecutive receipts is one transaction's usage. `effectiveGasPrice` is the price actually paid per gas, which for an [[eip-1559|EIP-1559]] transaction is the block's base fee plus the tip that fitted under `maxFeePerGas`. `logs` and `logsBloom` carry the events, `contractAddress` holds the new [[address|address]] for a deployment and `null` otherwise, and blob transactions add `blobGasUsed` and `blobGasPrice`.",
          "The receipt is not the transaction. It has no `input`, no `value`, and no fee caps; those stay on the [[transaction|transaction]] object. Pairing them is normal: [[eth-get-transaction-by-hash|eth_getTransactionByHash]] for what was asked, [[eth-get-transaction-receipt|eth_getTransactionReceipt]] for what happened.",
        ],
      },
      {
        heading: "Consensus data versus derived data",
        paragraphs: [
          "Only part of a receipt is protocol data. The consensus receipt that goes into the block's `receiptsRoot` trie holds the type, the status (or, before Byzantium, an intermediate [[state-root|state root]]), `cumulativeGasUsed`, the bloom, and the logs. Everything else in the RPC object, including `gasUsed`, `effectiveGasPrice`, `contractAddress`, `blockHash`, and `transactionIndex`, is reconstructed by the client from the block and its position in it. That is why receipts can be served only for blocks the node still has indexed, and why a [[pruned-node|node that dropped old history]] returns `null` for an old hash rather than an [[rpc-errors|error]].",
          "Because the root commits to logs, a receipt is provable: a bridge or [[light-client|light client]] can show that a log was emitted by producing the receipt and its trie path against `receiptsRoot`; see [[receipt-proof|receipt proofs]].",
        ],
      },
      {
        heading: "When a receipt exists",
        paragraphs: [
          "A receipt is created by execution, so it exists only after inclusion. [[eth-call|eth_call]] and [[eth-estimate-gas|eth_estimateGas]] simulate and never produce one, a transaction sitting in the [[mempool|pool]] has none, and a lookup for either case returns `null`. After a [[reorg|reorg]] a receipt can disappear and come back with a different `blockHash`, so confirming a transaction means checking the receipt and then watching depth or the `finalized` [[block-tag|block tag]].",
        ],
      },
    ],
    pitfalls: [
      "Reading `status` as the only failure signal for a batch operation; a contract can catch an inner revert and still finish with `status` `0x1`.",
      "Expecting logs from a reverted transaction; a revert discards the whole frame, so `logs` is empty when `status` is `0x0`.",
      "Using `cumulativeGasUsed` as the transaction's cost; it includes every transaction before it in the block.",
      "Multiplying `gas` from the transaction by `effectiveGasPrice` to compute the fee; the limit is not what was spent, `gasUsed` is.",
    ],
    related: ["transaction", "eth-get-transaction-receipt", "event-log", "logs-bloom", "revert", "gas", "eth-get-block-receipts", "receipt-proof", "eip-1559"],
    sources: [
      { title: "ethereum.org: Transactions", url: "https://ethereum.org/developers/docs/transactions/" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
      { title: "EIP-658: Embedding transaction status code in receipts", url: "https://eips.ethereum.org/EIPS/eip-658" },
    ],
  },
  {
    id: "nonce",
    title: "Account nonce",
    category: "protocol",
    aliases: ["transaction count", "nonce too low", "replacement", "stuck transaction", "getTransactionCount"],
    summary: "An account nonce is the count of transactions an [[account|account]] has already sent, included in every [[transaction|transaction]] so the network executes that account's transactions exactly once, in the order the sender chose.",
    sections: [
      {
        heading: "Ordering and replay protection",
        paragraphs: [
          "Each externally owned account starts at nonce `0x0` and the value rises by one for every transaction of that account that makes it into a [[block|block]], including transactions that [[revert|revert]]. A transaction whose nonce is below the account's current value is invalid forever and a node rejects it with 'nonce too low'. A transaction whose nonce is above it is valid but not yet executable: it sits in the queued side of the [[mempool|pool]] until the gap is filled. There is no way to execute the second transaction first, which is exactly the point, because it makes an account's history a strict sequence and makes a captured signed transaction impossible to replay.",
        ],
      },
      {
        heading: "Replacement, gaps, and stuck transactions",
        paragraphs: [
          "Since the nonce fixes the slot, the way to cancel or speed up a pending transaction is to sign a different one with the same nonce and a higher fee. Pools require a real bump rather than a token one; clients commonly demand at least 10 percent more on both [[eip-1559|maxFeePerGas and maxPriorityFeePerGas]], and answer 'replacement transaction underpriced' otherwise. A cancel is the same move with an empty self-transfer as the payload.",
          "One underpriced transaction therefore blocks every later one from the same account, which is the usual cause of a backlog that looks like a node problem. It is also why a service that sends from one address serialises its sending: two workers that both read the next nonce and both sign get one transaction included and one rejected as 'nonce too low', or worse, two transactions competing for the same slot.",
        ],
      },
      {
        heading: "Contract nonces and RPC",
        paragraphs: [
          "Contracts have nonces too, but theirs count deployments rather than transactions: a contract's nonce increments on every `CREATE` it performs, and it starts at 1 when the contract is created, which is what makes [[address|CREATE addresses]] unique. [[eip-7702|Set code authorizations]] also carry and consume a nonce from the signing account.",
          "[[eth-get-transaction-count|eth_getTransactionCount]] is the usual way to read one, and [[eth-get-proof|eth_getProof]] also returns it alongside a proof: with `latest` it returns the count of included transactions, which is the next nonce to use; with `pending` it also counts what the node holds in its own pool. Two nodes can disagree on the `pending` answer, so a wallet that rotates across providers should track its nonce itself and use the node only as a floor. The unrelated `nonce` in a [[block-header|block header]] is a proof-of-work leftover, always `0x0000000000000000` since [[the-merge|the Merge]].",
        ],
      },
    ],
    pitfalls: [
      "Reading `eth_getTransactionCount` with `latest` while transactions of yours are still pending, which reuses a nonce that is already spoken for.",
      "Assuming a failed transaction leaves the nonce free; a reverted transaction is still included and still consumes its nonce.",
      "Bumping only `maxFeePerGas` when replacing; most pools want the priority fee raised by the same percentage too.",
      "Sending from one address in parallel across workers or providers, which produces gaps and 'nonce too low' rejections instead of throughput.",
    ],
    related: ["transaction", "account", "eth-get-transaction-count", "mempool", "eth-send-raw-transaction", "address", "eip-7702", "eip-1559"],
    sources: [
      { title: "ethereum.org: Transactions", url: "https://ethereum.org/developers/docs/transactions/" },
      { title: "ethereum.org: Accounts", url: "https://ethereum.org/developers/docs/accounts/" },
      { title: "EIP-155: Simple replay attack protection", url: "https://eips.ethereum.org/EIPS/eip-155" },
    ],
  },
  {
    id: "gas",
    title: "Gas",
    category: "protocol",
    aliases: ["gas limit", "gasUsed", "out of gas", "intrinsic gas", "21000", "gas metering"],
    summary: "Gas is the unit that meters work in the [[evm|EVM]]: every opcode, every byte of calldata, and every state change has a fixed gas cost, and a [[transaction|transaction]] may consume up to the `gas` limit its sender signed.",
    sections: [
      {
        heading: "What costs gas",
        paragraphs: [
          "Every transaction pays 21000 gas of intrinsic cost before any code runs, plus 32000 more if it deploys a [[smart-contract|contract]], plus a charge for its calldata: historically 16 gas per non-zero byte and 4 per zero byte, with a floor price added by Pectra's EIP-7623 that makes data-heavy transactions cost more. Execution then charges per opcode. Arithmetic is a few gas, reading an untouched storage slot is 2100 and re-reading it 100, touching a new [[account|account]] is 2600, and writing a slot from zero to non-zero is 20000. Clearing storage earns a refund, but EIP-3529 caps total refunds at a fifth of the gas the transaction used.",
          "This pricing is not a fee schedule invented per client; it is consensus. Two clients that charge different gas for the same block would compute different `gasUsed` and different [[state-root|state roots]], so gas costs change only through a [[hardfork|network upgrade]].",
        ],
      },
      {
        heading: "Limit, consumption, and running out",
        paragraphs: [
          "The `gas` field on a transaction is a limit, not a price and not a prediction. Unused gas is returned, so setting it higher than needed costs nothing directly, but it does reserve space against the [[block-header|block gas limit]], which is voted on by validators and caps the sum of every transaction in a [[block|block]]. If execution needs more than the limit, the transaction ends with an out-of-gas failure: the whole limit is charged, all state changes are rolled back, and the [[transaction-receipt|receipt]] shows `status` `0x0` with `gasUsed` equal to the limit.",
          "Inside execution, a caller cannot hand all its remaining gas to a sub-call. EIP-150's rule keeps a 64th back, so a call forwards at most 63/64 of what is left. That is why deeply nested calls can run out even when the transaction still has gas, and why a contract that checks a sub-call's result can survive one.",
        ],
      },
      {
        heading: "Gas in RPC",
        paragraphs: [
          "[[eth-estimate-gas|eth_estimateGas]] searches for the smallest limit that succeeds against current state, and [[eth-call|eth_call]] runs with a gas cap the operator sets rather than with what a sender would pay; Geth's `--rpc.gascap` defaults to 50 million, so a call that would be fine in a block can still fail on an endpoint. The fee itself is gas multiplied by a price in [[wei|wei]], which is a separate question answered by [[eip-1559|the fee market]]; the receipt reports the two halves as `gasUsed` and `effectiveGasPrice`. Blob data is metered by a second, independent unit, blob gas, with its own limit and its own price.",
        ],
      },
    ],
    pitfalls: [
      "Copying `gas` from an old transaction; the same call can cost more after an upgrade repriced an opcode or after storage changed from zero to non-zero.",
      "Treating an out-of-gas failure as free; the full limit is charged even though nothing was applied.",
      "Setting a limit above the block gas limit, which no proposer can include no matter what fee is offered.",
      "Assuming `eth_call` succeeding means a transaction will; the call ran under the node's gas cap, not under the sender's limit.",
    ],
    related: ["eip-1559", "evm", "transaction", "eth-estimate-gas", "transaction-receipt", "access-list", "wei", "block-header", "revert"],
    sources: [
      { title: "ethereum.org: Gas and fees", url: "https://ethereum.org/developers/docs/gas/" },
      { title: "EIP-2929: Gas cost increases for state access opcodes", url: "https://eips.ethereum.org/EIPS/eip-2929" },
      { title: "EIP-3529: Reduction in refunds", url: "https://eips.ethereum.org/EIPS/eip-3529" },
    ],
  },
  {
    id: "eip-1559",
    title: "EIP-1559 fee market",
    category: "protocol",
    aliases: ["base fee", "baseFeePerGas", "maxFeePerGas", "maxPriorityFeePerGas", "tip", "burn", "1559"],
    summary: "EIP-1559 replaced the single gas price with a protocol-set `baseFeePerGas` that every [[block|block]] burns, a `maxPriorityFeePerGas` tip paid to the block's fee recipient, and a `maxFeePerGas` ceiling the sender signs.",
    sections: [
      {
        heading: "How the base fee moves",
        paragraphs: [
          "Each block header carries a `baseFeePerGas` that is computed from its parent alone: if the parent used exactly half its [[gas|gas]] limit the fee stays put, and otherwise it moves toward that target by at most 12.5 percent per block. Because the rule is deterministic, anyone holding a header can compute the next block's base fee exactly, which is what fee estimators and [[rollup|rollups]] rely on. The base fee is burned rather than paid to anyone, so the proposer gains nothing by inflating it.",
          "Twelve seconds and 12.5 percent is a slow instrument. It smooths demand over minutes, not within a block; inside one block the only thing that decides order is the tip and whatever the builder was paid privately.",
        ],
      },
      {
        heading: "What the sender actually pays",
        paragraphs: [
          "A [[transaction-types|type 0x2 transaction]] signs two numbers. `maxFeePerGas` is the most it will pay per gas in total, and `maxPriorityFeePerGas` is the most it will hand the fee recipient on top of the base fee. The settled price is `baseFeePerGas + min(maxPriorityFeePerGas, maxFeePerGas - baseFee)`, and it appears in the [[transaction-receipt|receipt]] as `effectiveGasPrice`. Anything signed above that is simply not charged, which is why a generous `maxFeePerGas` is cheap insurance rather than an overpayment.",
          "A transaction whose `maxFeePerGas` is below the current base fee is not invalid, just unincludable until the base fee falls back to it. Legacy transactions still work: a single `gasPrice` is read as both cap and tip, so it silently pays the base fee and tips the remainder.",
        ],
      },
      {
        heading: "Building an estimate from RPC",
        paragraphs: [
          "Read the current base fee from the latest [[block-header|header]] or from [[eth-fee-history|eth_feeHistory]], which also returns the next block's base fee, `gasUsedRatio`, and tip percentiles over a window of blocks. Ask [[eth-gas-price|eth_maxPriorityFeePerGas]] for a tip suggestion, or take a percentile from the same call. A common recipe is a tip of one to two gwei plus a `maxFeePerGas` of roughly twice the base fee, which survives several consecutive full blocks. `eth_gasPrice` still exists and returns base fee plus a suggested tip as one number for legacy callers.",
          "[[blob|Blob]] data has its own parallel market with the same shape: `excessBlobGas` in the header drives a blob base fee that is also burned, and `eth_blobBaseFee` reports it.",
        ],
      },
    ],
    example: {
      title: "What a transaction pays at a given base fee",
      language: "text",
      code: "block baseFeePerGas   = 25 gwei\ntransaction maxFeePerGas          = 40 gwei\ntransaction maxPriorityFeePerGas  =  2 gwei\n\neffectiveGasPrice = 25 + min(2, 40 - 25) = 27 gwei\n  burned : 25 gwei per gas\n  to the fee recipient : 2 gwei per gas\n  not charged : 13 gwei per gas of unused headroom\n\nif the base fee had risen to 39 gwei:\neffectiveGasPrice = 39 + min(2, 40 - 39) = 40 gwei  (the tip is squeezed to 1 gwei)",
      note: "The tip is what is left under the cap, so a tight `maxFeePerGas` becomes a tip cut long before it becomes a rejection.",
    },
    pitfalls: [
      "Setting `maxFeePerGas` equal to the current base fee; one block of growth makes the transaction unincludable until demand falls.",
      "Reading `effectiveGasPrice` as proof the sender was charged `maxFeePerGas`; the difference is never taken.",
      "Estimating fees from `eth_gasPrice` alone on a chain where tips dominate, instead of reading base fee and tip separately.",
      "Assuming the burned base fee goes to the proposer, and then explaining validator revenue from a number that was destroyed.",
    ],
    related: ["gas", "transaction-types", "eth-fee-history", "eth-gas-price", "transaction-receipt", "block-header", "blob", "mempool", "wei"],
    sources: [
      { title: "EIP-1559: Fee market change for ETH 1.0 chain", url: "https://eips.ethereum.org/EIPS/eip-1559" },
      { title: "ethereum.org: Gas and fees", url: "https://ethereum.org/developers/docs/gas/" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "access-list",
    title: "Access lists",
    category: "protocol",
    aliases: ["EIP-2930", "accessList", "warm", "cold", "EIP-2929", "createAccessList"],
    summary: "An access list is the optional `accessList` field of a [[transaction-types|typed transaction]] that names addresses and storage keys up front, paying a discounted price for them so their first use during execution is charged as a warm access.",
    sections: [
      {
        heading: "Warm and cold access",
        paragraphs: [
          "EIP-2929 made state access cost depend on whether the [[evm|EVM]] has touched it before in the same [[transaction|transaction]]. The first read of a storage slot costs 2100 [[gas|gas]] and every later read 100; the first touch of an [[account|account]], for a balance read or a call, costs 2600 and later touches 100. The gap pays for the disk work a client does to fetch state it does not have in memory.",
          "EIP-2930 lets the sender pre-pay: 2400 gas per address and 1900 gas per storage key listed, after which those entries start the transaction warm. The arithmetic is deliberately tight. A listed storage key costs 1900 plus 100 on first use, which beats 2100 by exactly 100 gas, and a listed address costs 2400 plus 100 against 2600, again 100. The list only pays for itself if the access actually happens.",
        ],
      },
      {
        heading: "Building and sending one",
        paragraphs: [
          "[[eth-create-access-list|eth_createAccessList]] executes the call and reports which addresses and slots it touched, along with the `gasUsed` that results from including the list. Clients leave out entries that are already warm by rule, such as the sender, the recipient, and the precompiles. The field rides on every [[transaction-types|typed transaction]] from type `0x1` onwards, so a normal EIP-1559 transaction can carry one; type `0x1` exists mainly because access lists were introduced before dynamic fees.",
          "In practice the gas saving is small and the list costs calldata bytes of its own, so applications use it selectively: contracts that jump across many cold accounts, [[rollup|rollup]] traffic where predictability matters, and transactions built by simulators that already know the touched set. The list is also a scheduling hint, since a client that reads it knows which state a transaction will need before it runs.",
        ],
      },
      {
        heading: "What it does not do",
        paragraphs: [
          "An access list does not authorise anything and does not restrict anything. A transaction can touch state that is not listed, and it simply pays the cold price for it; conversely, listing state it never touches is pure loss. It is not a security boundary and not a lock, so two transactions listing the same slot still execute in block order, one after the other.",
        ],
      },
    ],
    pitfalls: [
      "Attaching an access list generated against old state; if the touched set has changed, you pay 2400 or 1900 per stale entry for nothing.",
      "Expecting a large saving; the best case is 100 gas per entry, minus the calldata cost of carrying it.",
      "Treating the list as a whitelist of state the transaction may touch, which it is not.",
      "Calling `eth_createAccessList` on every send; it costs a full simulation per transaction for a saving that is often smaller than the estimation overhead.",
    ],
    related: ["transaction-types", "gas", "eth-create-access-list", "evm", "state", "contract-storage", "transaction", "eip-1559"],
    sources: [
      { title: "EIP-2930: Optional access lists", url: "https://eips.ethereum.org/EIPS/eip-2930" },
      { title: "EIP-2929: Gas cost increases for state access opcodes", url: "https://eips.ethereum.org/EIPS/eip-2929" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "account",
    title: "Account",
    category: "protocol",
    aliases: ["EOA", "externally owned account", "contract account", "balance", "codeHash", "storageRoot"],
    summary: "An account is an entry in the [[state|world state]] keyed by a 20-byte [[address|address]] and holding exactly four fields, `nonce`, `balance`, `storageRoot`, and `codeHash`, whose code decides whether it is a contract or an externally owned account.",
    sections: [
      {
        heading: "Two kinds, one structure",
        paragraphs: [
          "An externally owned account is controlled by a private key: it has a [[nonce|nonce]] and a `balance` in [[wei|wei]], no storage, and no code, so its `codeHash` is the [[keccak-256|Keccak-256]] of the empty string and its `storageRoot` is the root of the empty trie. A [[smart-contract|contract]] account has the same four fields with real values in the last two, and it acts only when something calls it. The distinction is a single question, does this address have code, and [[eip-7702|EIP-7702]] blurred even that by letting an externally owned account publish a delegation designator as its code.",
          "Nothing else is stored per account. There is no owner field, no creation timestamp, no list of tokens held. A balance in some ERC-20 token is not part of the account at all; it is a value in that token [[contract-storage|contract's storage]], which is why listing what an address owns needs an [[indexer|indexer]] rather than one RPC call.",
        ],
      },
      {
        heading: "Where accounts live",
        paragraphs: [
          "Accounts are the leaves of the state trie, keyed by the Keccak-256 hash of the address and holding the four fields as an [[rlp|RLP]] list. That is why the [[state-root|state root]] in every [[block-header|header]] is a commitment to every account at once, and why [[eth-get-proof|eth_getProof]] can prove a balance to someone who only trusts a header.",
          "An address exists as a valid destination whether or not the state has an entry for it; the entry appears when the address is first funded or deployed to. Reading an account that was never touched is not an [[rpc-errors|error]]: the balance is `0x0`, the nonce is `0x0`, and the code is `0x`.",
        ],
      },
      {
        heading: "Reading account fields over RPC",
        paragraphs: [
          "There is no `eth_getAccount` in common use; each field has its own method. [[eth-get-balance|eth_getBalance]] returns `balance`, [[eth-get-transaction-count|eth_getTransactionCount]] returns the nonce, [[eth-get-code|eth_getCode]] returns the code itself rather than its hash, and [[eth-get-storage-at|eth_getStorageAt]] returns one slot of storage. All of them take a [[block-tag|block parameter]], so all of them need the state at that block to still exist on the node.",
          "[[eth-get-proof|eth_getProof]] is the exception that returns the whole account at once, as `balance`, `nonce`, `codeHash`, and `storageHash`, with the proof nodes to verify them. It is the cheapest way to get a consistent snapshot of one account, since four separate calls at `latest` can straddle a new block.",
        ],
      },
    ],
    pitfalls: [
      "Deciding an address is an externally owned account because `eth_getCode` returned `0x` at `latest`; a contract may not be deployed yet at that address, and a delegated account returns 23 bytes.",
      "Expecting a token balance from `eth_getBalance`, which only ever reports ether in wei.",
      "Assuming an account with zero balance does not exist; existence and balance are unrelated.",
      "Reading balance, nonce, and code with three `latest` calls and treating them as one snapshot of the account.",
    ],
    related: ["address", "state", "nonce", "smart-contract", "eth-get-balance", "eth-get-proof", "contract-storage", "eip-7702", "state-root", "wei"],
    sources: [
      { title: "ethereum.org: Accounts", url: "https://ethereum.org/developers/docs/accounts/" },
      { title: "EIP-1186: RPC-Method to get Merkle Proofs", url: "https://eips.ethereum.org/EIPS/eip-1186" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "address",
    title: "Address",
    category: "protocol",
    aliases: ["0x address", "EIP-55", "checksum", "CREATE2", "zero address", "20 bytes"],
    summary: "An address is the 20-byte identifier of an [[account|account]]: for a key-controlled account the last 20 bytes of the [[keccak-256|Keccak-256]] hash of its public key, and for a contract a value derived from its creator plus either a [[nonce|nonce]] or a salt.",
    sections: [
      {
        heading: "Where addresses come from",
        paragraphs: [
          "An externally owned account's address is the low 20 bytes of the Keccak-256 hash of its uncompressed public key, with the leading `0x04` tag removed first. Nothing registers it, so every one of the 2^160 addresses is valid and can receive ether before anyone holds its key.",
          "A contract deployed with `CREATE` gets `keccak256(rlp([sender, nonce]))` truncated to 20 bytes, which is why a deployer's nth contract has a predictable address. `CREATE2` instead uses `keccak256(0xff ++ sender ++ salt ++ keccak256(initCode))`, so the address depends on the code rather than on ordering. That is what makes counterfactual deployment possible: an application can compute a wallet's address, let users fund it, and deploy the [[smart-contract|contract]] there later.",
        ],
      },
      {
        heading: "Checksums and formatting",
        paragraphs: [
          "Addresses appear in JSON-RPC as 20-byte [[hex-encoding|DATA]], `0x` plus exactly 40 hex characters, and clients return them lowercase. EIP-55 adds an optional checksum by capitalising some hex letters according to the Keccak hash of the lowercase form, so `0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` and its all-lowercase twin are the same address, but a typo in a mixed-case string is detectable. Wallets validate the checksum; nodes do not care.",
          "The zero address, `0x0000000000000000000000000000000000000000`, is an ordinary address with no known key. It is a convention rather than a protocol feature: ERC-20 tokens use it as the counterparty in mint and burn [[event-log|events]], and a `to` of `null` rather than the zero address is what marks a deployment.",
        ],
      },
      {
        heading: "Addresses in RPC calls",
        paragraphs: [
          "Address parameters are case-insensitive, and comparing them requires normalising case first, which is the source of many silent misses in filters and caches. In [[eth-get-logs|eth_getLogs]] the `address` field takes one address or a list of them, but when an address is an indexed event argument it appears inside a 32-byte topic, left-padded with twelve zero bytes, and the filter value must be padded the same way.",
          "[[ens|ENS]] names are not addresses and never reach the node as names: a library resolves the name with its own [[eth-call|eth_call]] first, then sends the 20 bytes. Nothing in the execution JSON-RPC accepts `vitalik.eth`.",
        ],
      },
    ],
    pitfalls: [
      "Comparing addresses as raw strings; a checksummed and a lowercase form of the same address are not string-equal.",
      "Using an address directly as a `topics` filter value without left-padding it to 32 bytes; some clients reject it as an invalid topic length and others simply never match it.",
      "Sending to the zero address to burn tokens that do not treat it specially; the value is simply stuck at an address nobody controls.",
      "Assuming a `CREATE` address is stable across chains or retries; it depends on the deployer's nonce at that moment.",
    ],
    related: ["account", "keccak-256", "smart-contract", "hex-encoding", "nonce", "event-signature", "ens", "eth-get-logs", "contract-storage"],
    sources: [
      { title: "ethereum.org: Accounts", url: "https://ethereum.org/developers/docs/accounts/" },
      { title: "EIP-55: Mixed-case checksum address encoding", url: "https://eips.ethereum.org/EIPS/eip-55" },
      { title: "EIP-1014: Skinny CREATE2", url: "https://eips.ethereum.org/EIPS/eip-1014" },
    ],
  },
  {
    id: "evm",
    title: "Ethereum Virtual Machine",
    category: "protocol",
    aliases: ["EVM", "bytecode", "opcodes", "stack machine", "DELEGATECALL", "message call"],
    summary: "The EVM is the stack machine every [[execution-client|execution client]] implements identically: it runs contract bytecode over 256-bit words, meters each step in [[gas|gas]], and is the only thing that can change [[state|state]].",
    sections: [
      {
        heading: "The machine",
        paragraphs: [
          "The EVM has a stack of at most 1024 words, each 256 bits wide, plus three places to put data. Memory is a byte array that lasts for one call and costs more as it grows. [[contract-storage|Storage]] is a persistent map from 256-bit keys to 256-bit values that belongs to the [[smart-contract|contract]] and survives between transactions. Calldata is the read-only input the caller supplied. Transient storage, added by EIP-1153 in Dencun, behaves like storage but is discarded when the [[transaction|transaction]] ends.",
          "Execution is deterministic by construction. There is no clock, no file system, and no network access; the only outside information is the block context (number, timestamp, `PREVRANDAO`, base fee), the calldata, and the state itself. That is what lets thousands of machines replay the same [[block|block]] and agree on the resulting [[state-root|state root]].",
        ],
      },
      {
        heading: "Calls, frames, and failure",
        paragraphs: [
          "A contract reaches another contract with a message call. `CALL` runs the callee's code in a new frame with its own stack, memory, and storage context. `DELEGATECALL` runs the callee's code but keeps the caller's storage, [[address|address]], and value, which is exactly what makes proxy contracts and upgradeable systems possible. `STATICCALL` forbids state changes, so a view function cannot quietly write. Frames nest up to 1024 deep, and a caller can forward at most 63/64 of its remaining gas.",
          "A frame ends in one of three ways: it returns data, it [[revert|reverts]] and hands back revert data while undoing its own changes, or it runs out of gas and consumes everything it was given. A revert in an inner frame does not have to fail the transaction; the caller sees a failure flag and may carry on, which is why a [[transaction-receipt|receipt]] can show `status` `0x1` for a transaction that contains failed calls.",
        ],
      },
      {
        heading: "Running the EVM from RPC",
        paragraphs: [
          "[[eth-call|eth_call]] executes a message call against the state at a chosen block and throws the result away. It builds a plausible block context, skips signature and nonce checks, and does not require the caller to hold a balance, so a call from the zero address works. That freedom is why it is the standard read path and why success there does not prove a transaction would succeed.",
          "[[eth-estimate-gas|eth_estimateGas]] runs the same machine repeatedly to find a workable limit, [[state-override|state overrides]] let a caller pretend an account has different code or balance, [[eth-simulate|eth_simulateV1]] chains calls across simulated blocks, and the [[debug-api|debug_]] and [[trace-api|trace_]] namespaces re-run execution while recording it, which is the only way to see internal calls. All of them need the state at the chosen block, so an endpoint that pruned it refuses.",
        ],
      },
      {
        heading: "One spec, several implementations",
        paragraphs: [
          "Every client ships its own EVM: [[geth|Geth]]'s Go interpreter, [[nethermind|Nethermind]]'s in C#, revm in [[reth|Reth]], and others, checked against shared execution-spec tests. Behaviour has to match to the gas unit, because a single mispriced opcode produces a different state root and splits the network along client lines, which is the whole argument for [[client-diversity|client diversity]].",
        ],
      },
    ],
    pitfalls: [
      "Assuming an `eth_call` that succeeded means the transaction will; the call skipped nonce, balance, and signature checks and ran under the node's gas cap.",
      "Reading `DELEGATECALL` as a normal call; the callee's code writes the caller's storage, so a bad implementation address takes the proxy with it.",
      "Expecting internal calls in a receipt; only a trace shows them, because nothing about them is protocol data.",
      "Treating `PREVRANDAO` as private randomness; the proposer sees it before building the block.",
    ],
    related: ["gas", "smart-contract", "eth-call", "contract-storage", "revert", "state", "execution-trace", "debug-api", "state-override", "eth-estimate-gas"],
    sources: [
      { title: "ethereum.org: Ethereum Virtual Machine", url: "https://ethereum.org/developers/docs/evm/" },
      { title: "ethereum.org: Opcodes", url: "https://ethereum.org/developers/docs/evm/opcodes/" },
      { title: "EIP-1153: Transient storage opcodes", url: "https://eips.ethereum.org/EIPS/eip-1153" },
    ],
  },
  {
    id: "smart-contract",
    title: "Smart contract",
    category: "protocol",
    aliases: ["contract", "bytecode", "deployment", "constructor", "proxy", "getCode"],
    summary: "A smart contract is bytecode stored at an [[address|address]] together with its own [[contract-storage|storage]]: it holds no keys, never acts on its own, and runs only when a [[transaction|transaction]] or another contract calls it.",
    sections: [
      {
        heading: "How code gets on chain",
        paragraphs: [
          "A deployment is an ordinary transaction with `to` set to `null` and the init code in `input`. The [[evm|EVM]] runs that init code, the constructor writes whatever initial [[contract-storage|storage]] it wants, and what the init code returns is the runtime bytecode that is actually stored. The two differ, which is why the bytes you sent are not the bytes [[eth-get-code|eth_getCode]] gives back. The new [[address|address]] is derived from the sender and its [[nonce|nonce]], or from the salt when `CREATE2` is used, and the [[transaction-receipt|receipt]] reports it in `contractAddress`.",
          "Stored code is immutable. Systems that need upgrades put a proxy at the stable address which `DELEGATECALL`s an implementation address kept in a fixed storage slot, so the storage stays with the proxy while the logic can be swapped. `SELFDESTRUCT` no longer removes code either: since Dencun's EIP-6780 it only clears an account created in the same transaction, and otherwise just sweeps the balance.",
        ],
      },
      {
        heading: "Talking to a contract over RPC",
        paragraphs: [
          "Reading means [[eth-call|eth_call]] with [[abi|ABI]]-encoded calldata and a [[block-tag|block parameter]]; the node runs the function and returns the encoded result without touching the chain. Writing means signing a transaction to the same address with the same kind of calldata, then waiting for a receipt. Observing means [[event-log|logs]]: contracts emit them with the `LOG0` to `LOG4` opcodes, and [[eth-get-logs|eth_getLogs]] is how anything off-chain learns what happened. Contracts cannot read their own logs, which is why state that a contract needs must be in storage and logs exist only for the outside world.",
        ],
      },
      {
        heading: "What a node does not know",
        paragraphs: [
          "The chain stores bytecode, not meaning. No RPC method returns a contract's function list, its variable names, or its source: an ABI comes from the developer or from a [[block-explorer|block explorer]] that verified the source against the deployed bytecode. The same is true of layout, so reading a variable with [[eth-get-storage-at|eth_getStorageAt]] means computing the slot from the source yourself.",
          "Names are also not on chain. An [[ens|ENS]] name, a token's symbol, and an interface's identity are all data the caller resolves by calling other contracts. A node answers with bytes; every label around them is application knowledge.",
        ],
      },
    ],
    pitfalls: [
      "Comparing deployed bytecode against the compiler's creation output; only the runtime part is stored, and metadata at the end differs by compiler settings.",
      "Deciding an address is safe because `eth_getCode` returns bytes; a proxy's behaviour lives at whatever implementation its storage points to.",
      "Assuming a `view` function is free; it costs nothing as an `eth_call` but costs gas when a contract calls it on chain.",
      "Expecting a contract to read its own past [[event-log|events]]; logs are write-only from the EVM's point of view.",
    ],
    related: ["evm", "contract-storage", "abi", "eth-call", "eth-get-code", "address", "event-log", "transaction", "block-explorer", "revert"],
    sources: [
      { title: "ethereum.org: Smart contracts", url: "https://ethereum.org/developers/docs/smart-contracts/" },
      { title: "Solidity documentation", url: "https://docs.soliditylang.org/" },
      { title: "EIP-6780: SELFDESTRUCT only in same transaction", url: "https://eips.ethereum.org/EIPS/eip-6780" },
    ],
  },
  {
    id: "contract-storage",
    title: "Contract storage layout",
    category: "protocol",
    aliases: ["storage slot", "slot 0", "mapping slot", "packed variables", "getStorageAt", "storage layout"],
    summary: "Contract storage is a map of 2^256 slots of 32 bytes each, and Solidity assigns variables to slots by fixed rules, so reading one with [[eth-get-storage-at|eth_getStorageAt]] means computing the slot number yourself.",
    sections: [
      {
        heading: "Fixed-size variables and packing",
        paragraphs: [
          "The compiler numbers statically sized state variables from slot `0` in declaration order. Variables smaller than 32 bytes share a slot when they fit, filling it from the low-order end, so a `uint128` followed by a `uint128` occupies one slot and a read returns both values concatenated. A variable that does not fit starts a new slot, and reordering declarations changes every later slot number. Constants and `immutable` values never appear in storage at all, because the compiler writes them into the bytecode of the [[smart-contract|contract]].",
          "Inherited contracts continue the same numbering, parents first, which is why proxy patterns reserve fixed slots far out in the space instead of relying on declaration order. The authoritative answer for any given contract is the compiler's storage layout output, not a guess from the source.",
        ],
      },
      {
        heading: "Mappings, arrays, and strings",
        paragraphs: [
          "A mapping's declared slot `p` holds nothing. The value for key `k` lives at `keccak256(pad32(k) ++ pad32(p))`, both operands padded to 32 bytes, and a nested mapping applies the rule again with the inner slot as the new `p`. A dynamic array keeps its length in slot `p` and its elements from `keccak256(pad32(p))` onwards, one after another. A `string` or `bytes` value of at most 31 bytes sits inline in its slot with twice its length in the last byte; longer values keep twice the length plus one there and the data at `keccak256(pad32(p))`.",
          "Because these positions come from [[keccak-256|Keccak-256]], storage is scattered rather than contiguous, which is also why iterating a mapping is impossible on chain and why an [[indexer|indexer]] exists.",
        ],
      },
      {
        heading: "Reading storage over RPC",
        paragraphs: [
          "[[eth-get-storage-at|eth_getStorageAt]] takes an [[address|address]], a slot number, and a [[block-tag|block parameter]] and returns exactly 32 bytes, zero-padded, with no type information. It ignores visibility, so a `private` variable is readable by anyone; privacy on a public chain is a property of the data you put there, not of the keyword. [[eth-get-proof|eth_getProof]] returns the same values with a [[storage-proof|storage proof]] against the account's `storageHash`, which is how a value can be verified rather than trusted.",
          "Two things stay invisible: transient storage written with `TSTORE`, which never persists, and values a contract keeps only in memory during a call. For those, run the getter with [[eth-call|eth_call]] instead.",
        ],
      },
    ],
    example: {
      title: "Reading an ERC-20 balance straight from storage",
      language: "text",
      code: "// contract Token {\n//     uint256 totalSupply;                      // slot 0\n//     mapping(address => uint256) balanceOf;    // slot 1\n// }\n\nslot = keccak256( pad32(holder) ++ pad32(1) )\n     = keccak256( 000…000d8dA6BF26964aF9D7eEd9e03E53415D37aA96045\n                  0000000000000000000000000000000000000000000000000000000000000001 )\n     = 0x3a4f…91c2\n\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getStorageAt\",\"params\":[\"0xA0b8…eB48\",\"0x3a4f…91c2\",\"latest\"]}\n// result\n\"0x00000000000000000000000000000000000000000000000000000000000f4240\"   // 1000000",
      note: "The key comes first and the slot number second; swapping them yields a valid-looking slot that is always zero.",
    },
    pitfalls: [
      "Hashing the slot number before the key when computing a mapping position; the order is key then slot, and the wrong order silently returns zeros.",
      "Reading a packed slot and using the whole 32 bytes as one number instead of extracting the field's byte range.",
      "Assuming slot numbers survive a contract upgrade; adding a variable to the middle of a declaration list shifts everything after it.",
      "Believing `private` hides a value from RPC; the keyword only stops other contracts from reading it.",
    ],
    related: ["eth-get-storage-at", "smart-contract", "keccak-256", "state", "storage-proof", "eth-get-proof", "evm", "account", "abi"],
    sources: [
      { title: "Solidity: Layout of state variables in storage", url: "https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html" },
      { title: "ethereum.org: eth_getStorageAt", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_getstorageat" },
      { title: "EIP-1186: RPC-Method to get Merkle Proofs", url: "https://eips.ethereum.org/EIPS/eip-1186" },
    ],
  },
  {
    id: "state",
    title: "World state",
    category: "protocol",
    aliases: ["global state", "state trie", "current state", "historical state", "state growth"],
    summary: "The world state is the mapping from every [[address|address]] to its [[account|account]], plus each contract's [[contract-storage|storage]], as it exists after a particular [[block|block]]; almost every read method answers from one version of it.",
    sections: [
      {
        heading: "State versus history",
        paragraphs: [
          "A node holds two different things. History is the sequence of blocks, [[transaction|transactions]], [[transaction-receipt|receipts]], and [[event-log|logs]] that happened, and it never changes once canonical. State is the current value of everything: balances, [[nonce|nonces]], code, and storage slots. [[eth-get-logs|eth_getLogs]] and [[eth-get-transaction-by-hash|eth_getTransactionByHash]] read history; [[eth-get-balance|eth_getBalance]], [[eth-get-code|eth_getCode]], [[eth-get-storage-at|eth_getStorageAt]], and [[eth-call|eth_call]] read state. The distinction decides which node can answer you, because [[historical-data|keeping old history]] and keeping old state are separate costs.",
          "State is versioned per block, not global. Every [[block-tag|block parameter]] you pass selects one version, and the node has to be able to reconstruct it. A [[full-node|full node]] keeps the recent versions, an [[archive-node|archive node]] keeps them all, and a [[pruned-node|pruned node]] answers 'missing trie node' or 'state not available' for anything older than its window even though it still has the block.",
        ],
      },
      {
        heading: "How state changes",
        paragraphs: [
          "Only block execution changes state. Each transaction in order applies its effects, [[withdrawals|withdrawals]] credit validator balances without being transactions at all, and at the end the client computes the [[state-root|state root]] and checks it against the header. Nothing outside a block can move a value, which is why there is no RPC method that writes state directly and why [[state-override|state overrides]] exist only inside simulations.",
          "The same rule makes state deterministic: replaying the chain from [[genesis|genesis]] with the same rules produces byte-identical state on any client. An [[execution-client|execution client]] can store it however it likes, as a trie, as flat key-value pairs, or both, as long as the root matches.",
        ],
      },
      {
        heading: "Size and growth",
        paragraphs: [
          "State only grows: a slot set to zero frees a little accounting but the trie keeps expanding as new accounts and contracts appear. That growth is the main pressure on node operators, since state must be on fast storage to be read at block speed, and it is the reason for the work on [[stateless-ethereum|stateless designs]] and for [[client-storage|storage layouts]] that trade proof cost against disk. History, by contrast, can be moved off the node, which is what [[history-expiry|history expiry]] does.",
        ],
      },
      {
        heading: "Consistency when reading it",
        paragraphs: [
          "Two reads at `latest` a moment apart may land in different blocks, so anything that must agree with itself should name one explicit block number or [[block-hash|block hash]]. Behind a [[load-balancer|load balancer]] the risk is larger, because two nodes can be at different heads. When a value has to be verifiable rather than merely fresh, [[eth-get-proof|eth_getProof]] returns the account and slots with a proof against the state root of that block.",
        ],
      },
    ],
    pitfalls: [
      "Asking a full node for state at a year-old block and reading the error as data corruption; the state was pruned, the block was not.",
      "Assuming an archive endpoint can prove old state; some archive layouts can replay historical values without being able to rebuild the historical trie for [[eth-get-proof|eth_getProof]].",
      "Mixing a receipt from one node with state from another, which silently compares two different chain heads.",
      "Treating `pending` state as the network's view; it is one node's guess at the next block from its own [[mempool|pool]].",
    ],
    related: ["state-root", "account", "contract-storage", "block-tag", "archive-node", "eth-get-proof", "pruned-node", "historical-data", "withdrawals", "stateless-ethereum"],
    sources: [
      { title: "ethereum.org: Intro to Ethereum (state)", url: "https://ethereum.org/developers/docs/intro-to-ethereum/" },
      { title: "ethereum.org: Accounts", url: "https://ethereum.org/developers/docs/accounts/" },
      { title: "EIP-4444: Bound historical data in execution clients", url: "https://eips.ethereum.org/EIPS/eip-4444" },
    ],
  },
  {
    id: "state-root",
    title: "State root",
    category: "protocol",
    aliases: ["stateRoot", "state commitment", "post-state root", "trie root"],
    summary: "The state root is the 32-byte root hash of the [[merkle-patricia-trie|state trie]] carried in every [[block-header|block header]]: one value that commits to every [[account|account]] and every storage slot as of the end of that [[block|block]].",
    sections: [
      {
        heading: "What it commits to",
        paragraphs: [
          "The state trie is keyed by the [[keccak-256|Keccak-256]] hash of each [[address|address]] and its leaves are the [[rlp|RLP]]-encoded account records. Each record contains that contract's own storage root, so the state root commits transitively to every slot of every [[contract-storage|contract's storage]] as well. Change one wei of one balance and the leaf changes, every node on the path up changes, and the root is entirely different.",
          "It is a post-state root: the value in header N describes the [[state|world state]] after block N's transactions and [[withdrawals|withdrawals]] were applied, not before. Clients recompute it at the end of execution, which is also the expensive part of applying a block.",
        ],
      },
      {
        heading: "Why every client must agree on it",
        paragraphs: [
          "A proposer puts its computed root in the header. Every other node executes the same block and compares; a mismatch means the block is rejected as invalid, and over the [[engine-api|Engine API]] the [[execution-client|execution client]] answers `INVALID`. This is the mechanism that turns a client bug into a visible split rather than a silent divergence, and the reason a supermajority client is a systemic risk, as [[client-diversity|client diversity]] work argues.",
          "Because the root is defined by the data and not by the database, two clients with completely different [[client-storage|storage layouts]] produce the same root from the same state. Nothing about how state is stored on disk is protocol.",
        ],
      },
      {
        heading: "Using it from RPC",
        paragraphs: [
          "`stateRoot` comes back with any block from [[eth-get-block-by-number|eth_getBlockByNumber]], and it is the anchor for verification: [[eth-get-proof|eth_getProof]] returns the trie nodes from a leaf up to this root, and a caller who already has a [[trusted-header|trusted header]] can check a balance or a slot without trusting the node that served it; see [[state-proof|state proofs]]. Receipts and logs are covered by different roots, so a log needs a [[receipt-proof|receipt proof]] instead.",
          "Producing such a proof requires the historical trie, not just the historical values, so many nodes that can answer an old [[eth-call|eth_call]] still cannot answer an old `eth_getProof`. Check the endpoint before designing around it.",
        ],
      },
    ],
    pitfalls: [
      "Verifying a proof against the root of the wrong block; the header you check against must be the exact block the proof was taken at.",
      "Treating the state root as a commitment to the block's transactions or logs; those have their own roots in the header.",
      "Assuming an [[archive-node|archive node]] can produce a proof for any past block, when it may only be able to replay values.",
      "Reading a matching state root as proof the chain is canonical; it proves consistency, not that anyone else built on this block.",
    ],
    related: ["state", "merkle-patricia-trie", "block-header", "eth-get-proof", "state-proof", "account", "trusted-header", "client-storage", "keccak-256"],
    sources: [
      { title: "ethereum.org: Merkle Patricia Trie", url: "https://ethereum.org/developers/docs/data-structures-and-encoding/patricia-merkle-trie/" },
      { title: "EIP-1186: RPC-Method to get Merkle Proofs", url: "https://eips.ethereum.org/EIPS/eip-1186" },
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
    ],
  },
  {
    id: "logs-bloom",
    title: "Logs bloom filter",
    category: "protocol",
    aliases: ["logsBloom", "bloom filter", "2048-bit", "log filtering", "false positive"],
    summary: "The logs bloom is a 2048-bit filter in every [[block-header|header]] and every [[transaction-receipt|receipt]], built from the addresses and topics of the [[event-log|logs]] it covers, that lets a node rule a block out of a log scan without reading its receipts.",
    sections: [
      {
        heading: "How the filter is built",
        paragraphs: [
          "For each log, the emitting [[address|address]] and each of its topics is hashed with [[keccak-256|Keccak-256]]. Three bit positions are taken from the first six bytes of that hash, each pair of bytes reduced to an 11-bit number, which is exactly enough to index one of 2048 bits. Those three bits are set. A receipt's bloom covers its own logs, and the header's bloom is the bitwise OR of every receipt bloom in the [[block|block]], so one filter summarises the whole block.",
          "Nothing is stored about how many items set a bit, so the filter cannot be reversed or emptied. It answers exactly one question: could this item be in here.",
        ],
      },
      {
        heading: "False positives, never false negatives",
        paragraphs: [
          "If any of an item's three bits is zero, that item is definitely absent, which is what makes the filter useful. If all three are set, the item is probably present but may be a collision with other logs, so a node still has to load the receipts and compare properly. Busy blocks set a large share of the 2048 bits, and a saturated bloom matches almost everything, so the saving shrinks precisely when blocks are full.",
          "The bloom covers addresses and topics only. The `data` field of a log is not in it, which is one reason [[eth-get-logs|eth_getLogs]] cannot filter on data at all.",
        ],
      },
      {
        heading: "Where it matters for RPC",
        paragraphs: [
          "A log query over a block range is, in the naive implementation, a per-block bloom check followed by a receipt read on the candidates. That is why a narrow filter over a wide range can still be slow, and why [[rpc-provider|providers]] cap ranges and charge per block scanned. Clients now build their own log indexes and largely bypass the header bloom for serving queries, and proposals to drop it from the header in favour of a better structure have been discussed without shipping.",
          "For an [[indexer|indexer]], checking the bloom client-side before requesting receipts is rarely worth it, since fetching the header already costs a round trip. Filtering by `blockHash` or by narrow ranges usually beats it.",
        ],
      },
    ],
    pitfalls: [
      "Trusting a bloom match as a hit; it must be confirmed against the actual logs, or you will count events that never happened.",
      "Trying to filter on a log's `data` with the bloom or with [[eth-get-logs|eth_getLogs]]; only the address and the indexed topics are filterable.",
      "Assuming a bloom miss on one node means the event does not exist; it only covers the block you checked.",
      "Reading `logsBloom` from a receipt as if it covered the block; the receipt's bloom covers that transaction's logs only.",
    ],
    related: ["event-log", "eth-get-logs", "block-header", "transaction-receipt", "keccak-256", "event-signature", "indexer", "address"],
    sources: [
      { title: "ethereum.org: Logs and bloom filters", url: "https://ethereum.org/developers/docs/apis/json-rpc/#eth_getlogs" },
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
      { title: "ethereum.org: Blocks", url: "https://ethereum.org/developers/docs/blocks/" },
    ],
  },
  {
    id: "keccak-256",
    title: "Keccak-256",
    category: "protocol",
    aliases: ["keccak256", "sha3", "web3_sha3", "hash function", "not SHA3-256"],
    summary: "Keccak-256 is the 256-bit hash Ethereum uses for nearly everything it commits to — [[block-hash|block hashes]], transaction hashes, [[address|addresses]], selectors, topics, and trie keys — and it is the original Keccak submission rather than the later NIST SHA3-256 standard.",
    sections: [
      {
        heading: "Not SHA3-256",
        paragraphs: [
          "Ethereum adopted Keccak before NIST finished standardising it, and the standard then changed the padding rule. The functions are otherwise the same design but produce completely different digests: Keccak-256 of the empty input is `0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470`, while SHA3-256 of the empty input starts `0xa7ffc6f8`. Libraries make this worse by naming things loosely, and the [[evm|EVM]] opcode itself was called `SHA3` for years before being renamed `KECCAK256`. When a hash does not match, checking which of the two a library computed is the first thing to try.",
        ],
      },
      {
        heading: "Everywhere in the execution layer",
        paragraphs: [
          "A [[block-hash|block hash]] is Keccak-256 of the [[rlp|RLP]]-encoded [[block-header|header]], and a transaction hash is Keccak-256 of its encoded form. An externally owned account's [[address|address]] is the last 20 bytes of the hash of its public key, and a `CREATE2` address hashes the deployer, a salt, and the init code. [[merkle-patricia-trie|Trie]] keys are hashed too, both `keccak256(address)` for the [[state|state]] trie and `keccak256(slot)` for [[contract-storage|storage]], which is why storage positions look random. Selectors in the [[abi|ABI]] and `topic0` in [[event-signature|event signatures]] are taken from the hash of a signature string, and [[ecdsa-signature|signing]] hashes the payload with it first.",
          "The [[consensus-layer|consensus layer]] does not follow suit: [[ssz|SSZ]] Merkleization uses SHA-256, and so does the versioned hash of a [[blob|blob]]. A structure hashed with SHA-256 is almost always consensus-side, and one hashed with Keccak-256 almost always execution-side.",
        ],
      },
      {
        heading: "Hashing over RPC",
        paragraphs: [
          "`web3_sha3` takes [[hex-encoding|DATA]] and returns its Keccak-256 digest, despite the name. It is a cheap way to confirm what an endpoint means by the term and to check a selector without a local library. Nothing else in the [[json-rpc|execution JSON-RPC]] computes hashes for you: a caller that needs a topic, a selector, or a storage slot computes it client-side, which every library exposes as `keccak256` or, in ethers, as `id` for strings.",
        ],
      },
    ],
    pitfalls: [
      "Calling a library function named `sha3` and assuming Keccak; some packages route it to the NIST variant, which silently produces a different selector.",
      "Hashing a signature string with argument names or spaces; the canonical form is `transfer(address,uint256)` with no names, no spaces, and no aliases like `uint`.",
      "Using Keccak-256 where the consensus layer expects SHA-256, for example when rebuilding a beacon root or a blob versioned hash.",
      "Hashing the hex string instead of the bytes it represents, which produces a valid-looking but meaningless digest.",
    ],
    related: ["abi", "address", "block-hash", "merkle-patricia-trie", "event-signature", "ssz", "rlp", "contract-storage", "net-web3-api"],
    sources: [
      { title: "ethereum.org: Cryptography and hashing", url: "https://ethereum.org/developers/docs/data-structures-and-encoding/" },
      { title: "ethereum.org: web3_sha3", url: "https://ethereum.org/developers/docs/apis/json-rpc/#web3_sha3" },
      { title: "Solidity: Units and globally available variables", url: "https://docs.soliditylang.org/en/latest/units-and-global-variables.html" },
    ],
  },
  {
    id: "rlp",
    title: "RLP encoding",
    category: "protocol",
    aliases: ["Recursive Length Prefix", "raw transaction", "serialization", "0x80", "0xc0"],
    summary: "RLP, Recursive Length Prefix, is the [[execution-layer|execution layer]]'s serialisation format for nested byte strings and lists; it defines the exact bytes that are hashed and signed for [[block-header|headers]], [[transaction|transactions]], receipts, and [[merkle-patricia-trie|trie]] nodes.",
    sections: [
      {
        heading: "Two things and nothing else",
        paragraphs: [
          "RLP knows byte strings and lists of items. A single byte below `0x80` stands for itself; a string of up to 55 bytes is prefixed with `0x80` plus its length; longer strings use a prefix that encodes the length of the length. Lists follow the same pattern from `0xc0`. That is the whole format, which is why the first byte of an encoding tells you whether you are looking at a list.",
          "There are no types. Integers are big-endian byte strings with leading zeros stripped, so zero, the empty string, and an absent value all encode as `0x80`, and booleans are `0x01` and `0x80`. A decoder therefore cannot tell what it decoded without knowing the structure it expected, which is the trade for an encoding that is canonical: one value has exactly one valid encoding, and that is what makes hashing it meaningful.",
        ],
      },
      {
        heading: "What is RLP-encoded",
        paragraphs: [
          "The header list, whose [[keccak-256|Keccak-256]] hash is the [[block-hash|block hash]]. Legacy transactions in full, and the payload of every [[transaction-types|typed transaction]] after its leading type byte. Receipts, the nodes of the state and storage tries, and the messages of the [[devp2p|devp2p]] wire protocol. What is not RLP is just as important: calldata uses the [[abi|ABI]] encoding, consensus objects use [[ssz|SSZ]], and the RPC layer itself is JSON.",
        ],
      },
      {
        heading: "Where it surfaces in RPC",
        paragraphs: [
          "[[eth-send-raw-transaction|eth_sendRawTransaction]] takes a signed transaction as hex bytes, which for a typed transaction is the type byte followed by an RLP list; libraries build it, but debugging a rejected transaction means decoding it by hand. The [[debug-api|debug_]] namespace returns protocol bytes directly with `debug_getRawBlock`, `debug_getRawTransaction`, and `debug_getRawReceipts`, which is how you compare what a node stores against what it reports. [[eth-get-proof|eth_getProof]] returns the trie nodes on the path as RLP, so verifying a proof means decoding them and hashing each one.",
          "Nothing in the [[json-rpc|JSON-RPC]] layer encodes RLP for you beyond these, and nothing decodes it back: an endpoint that hands you raw bytes assumes you brought a decoder.",
        ],
      },
    ],
    pitfalls: [
      "Encoding an integer with leading zeros or a fixed width; RLP integers are minimal, and a non-minimal encoding hashes to a different value and is rejected.",
      "Feeding a typed transaction to an RLP decoder without stripping the leading type byte first.",
      "Assuming a decoded item's type; RLP returns bytes, and reading a 20-byte string as a number is a silent bug.",
      "Confusing RLP with the ABI encoding; both produce opaque hex strings, but nothing in calldata is RLP.",
    ],
    related: ["keccak-256", "transaction-types", "block-header", "merkle-patricia-trie", "ssz", "eth-send-raw-transaction", "debug-api", "abi", "eth-get-proof"],
    sources: [
      { title: "ethereum.org: RLP serialization", url: "https://ethereum.org/developers/docs/data-structures-and-encoding/rlp/" },
      { title: "EIP-2718: Typed Transaction Envelope", url: "https://eips.ethereum.org/EIPS/eip-2718" },
      { title: "ethereum/execution-apis", url: "https://github.com/ethereum/execution-apis" },
    ],
  },
  {
    id: "ssz",
    title: "SSZ encoding",
    category: "protocol",
    aliases: ["SimpleSerialize", "hash tree root", "Merkleization", "generalized index", "octet-stream"],
    summary: "SSZ, SimpleSerialize, is the [[consensus-layer|consensus layer]]'s encoding: a schema-driven layout of fixed and variable parts, paired with Merkleization into a hash tree root so that any single field of a large object can be proved.",
    sections: [
      {
        heading: "Serialisation with a schema",
        paragraphs: [
          "Every SSZ type has a declared shape. Fixed-size fields are written inline in order; variable-size fields are written as a four-byte offset in the head, with their contents appended in the tail, and lists carry a maximum length from the type rather than from the data. The result is deterministic and directly addressable: a reader who knows the schema can jump to a field without parsing what comes before it, unlike [[rlp|RLP]], where lengths must be walked.",
        ],
      },
      {
        heading: "Merkleization and hash tree roots",
        paragraphs: [
          "The part that matters for verification is the hash tree root. An object is chunked into 32-byte leaves, padded up to a power of two, and hashed pairwise with SHA-256 until a single root remains, with lists mixing in their length. Because the tree shape follows the type, every field has a fixed position expressed as a generalized index, and a proof for that field is the sibling hashes along its path.",
          "This is what makes consensus data provable in a way execution data is not: a [[light-client|light client]] can verify one field of a beacon state against a root it trusts. The `parentBeaconBlockRoot` in an execution [[block-header|header]] is exactly such a root, which is why EIP-4788 lets contracts reach consensus data at all, and why [[consensus-proof|consensus proofs]] can walk from a [[beacon-block|beacon block]] down to the [[execution-payload|execution payload]] header.",
        ],
      },
      {
        heading: "Meeting SSZ over an API",
        paragraphs: [
          "The [[beacon-api|Beacon API]] returns JSON by default and the SSZ bytes when a caller sends `Accept: application/octet-stream`, which is much smaller and is what clients use for block and state downloads. Blob sidecars and beacon states are routinely fetched this way. The [[json-rpc|execution JSON-RPC]] never returns SSZ, so anything crossing the boundary, such as proving an execution log to a consensus-side verifier, has to translate between two hash worlds: SHA-256 Merkle trees on one side, [[keccak-256|Keccak-256]] and [[merkle-patricia-trie|Merkle-Patricia tries]] on the other. Work to move execution structures to SSZ has been under way for years, but the objects RPC serves today are still RLP-based.",
        ],
      },
    ],
    pitfalls: [
      "Decoding SSZ without the exact type for the current fork; the schema changes at upgrades, and an old decoder reads a new object as garbage.",
      "Hashing SSZ with Keccak-256; Merkleization uses SHA-256, so the root will simply not match.",
      "Treating a beacon block root as an execution [[block-hash|block hash]]; they identify different objects and are computed differently.",
      "Requesting large states as JSON out of habit, when the SSZ representation is a fraction of the size.",
    ],
    related: ["consensus-layer", "beacon-api", "rlp", "beacon-block", "consensus-proof", "light-client", "keccak-256", "inclusion-proof", "block-header"],
    sources: [
      { title: "ethereum/consensus-specs", url: "https://github.com/ethereum/consensus-specs" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "EIP-4788: Beacon block root in the EVM", url: "https://eips.ethereum.org/EIPS/eip-4788" },
    ],
  },
  {
    id: "ecdsa-signature",
    title: "Transaction signatures",
    category: "protocol",
    aliases: ["secp256k1", "ECDSA", "r s v", "yParity", "ecrecover", "EIP-155"],
    summary: "A transaction signature is a secp256k1 ECDSA signature over the [[keccak-256|Keccak-256]] hash of the transaction's signing payload, carried as `r`, `s`, and `v` or `yParity`, from which anyone can recover the sender's [[address|address]].",
    sections: [
      {
        heading: "Signing and recovery",
        paragraphs: [
          "The sender serialises everything except the signature, hashes it, and signs the hash with its private key. The result is two 32-byte numbers, `r` and `s`, plus one bit that says which of the two possible public keys to pick when recovering. A node runs that recovery to learn who sent the [[transaction|transaction]]; there is no `from` field in the signed data, and the `from` you see over RPC is the recovered value. A signature that recovers to an [[account|account]] with no balance fails the balance check, but it fails as that account, not as a malformed message.",
          "Two rules keep signatures from being reshaped. EIP-2 requires `s` to be in the lower half of the curve order, so the same signature cannot be flipped into a second valid form with a different hash, and `yParity` is restricted to `0` or `1`. Change any byte of the transaction and the hash changes, so the signature no longer recovers to the same sender: nothing about a signed transaction can be edited in flight.",
        ],
      },
      {
        heading: "v, chain id, and typed transactions",
        paragraphs: [
          "Legacy transactions packed the recovery bit into `v` as `27` or `28`. EIP-155 redefined it as `chainId * 2 + 35 + parity`, which folds the [[chain-id|chain id]] into the signed data and is what stops a mainnet transaction from being replayed on another chain. [[transaction-types|Typed transactions]] dropped the trick: they carry `chainId` as a plain field and `yParity` as the bit, though many clients still echo an equivalent `v` for compatibility.",
        ],
      },
      {
        heading: "Signatures and RPC",
        paragraphs: [
          "The private key never reaches the node. A wallet or signing service produces the bytes and the node only sees them inside [[eth-send-raw-transaction|eth_sendRawTransaction]], which is why a public endpoint is a delivery mechanism rather than a custodian. The exception is [[eth-send-transaction|eth_sendTransaction]], where the node signs with a key it holds, and that is exactly why public nodes disable it.",
          "The same curve underpins off-chain [[signing-methods|message signing]] such as EIP-191 personal messages and [[eip-712|EIP-712]] typed data, verified in contracts through the `ECRECOVER` precompile, and [[eip-7702|EIP-7702]] authorizations, which are signatures over a small tuple rather than over a transaction. Same cryptography, different payload, and the payload prefix is what keeps one from being replayed as the other.",
        ],
      },
    ],
    pitfalls: [
      "Trusting a `from` field from an untrusted source; it means nothing until the signature is recovered, and only the node that recovers it knows.",
      "Accepting a signature with a high `s` value, which older libraries produce and modern clients and contracts reject.",
      "Signing a message that could be decoded as a transaction payload; prefixes and EIP-712 domains exist to keep those spaces apart.",
      "Assuming a valid signature means a valid transaction; nonce, balance, and fee checks are separate and come after.",
    ],
    related: ["transaction", "address", "keccak-256", "chain-id", "eth-send-raw-transaction", "signing-methods", "eip-712", "eip-7702", "account"],
    sources: [
      { title: "EIP-155: Simple replay attack protection", url: "https://eips.ethereum.org/EIPS/eip-155" },
      { title: "EIP-2: Homestead hard-fork changes", url: "https://eips.ethereum.org/EIPS/eip-2" },
      { title: "ethereum.org: Transactions", url: "https://ethereum.org/developers/docs/transactions/" },
    ],
  },
  {
    id: "wei",
    title: "Wei, gwei, and ether",
    category: "protocol",
    aliases: ["gwei", "ether", "denominations", "1e18", "BigInt", "decimals"],
    summary: "Wei is the indivisible unit of ether: one ether is 10^18 wei and one gwei is 10^9 wei, and every balance, `value`, and fee in JSON-RPC is an integer count of wei written as a hex [[hex-encoding|QUANTITY]].",
    sections: [
      {
        heading: "One unit, three names",
        paragraphs: [
          "The protocol only knows wei. Ether is a display convention, and gwei is a convenience for fee prices, where numbers like 25000000000 wei are easier to talk about as 25 gwei. The [[evm|EVM]] carries balances and `value` as 256-bit integers of wei, and [[eip-1559|fee fields]] are wei per unit of [[gas|gas]], so a transaction's cost in wei is `gasUsed` multiplied by `effectiveGasPrice`.",
          "Token amounts are not wei and not protocol data. An ERC-20 contract stores a plain integer and publishes a `decimals` value that says where to put the point, which is 18 for many tokens but 6 for USDC and 8 for wrapped bitcoin. Nothing enforces it; see [[token-standards|token standards]]. Reading a token balance without reading its decimals produces answers off by ten to the power of that value: a factor of a million for USDC and of 10^18 for most other tokens.",
        ],
      },
      {
        heading: "Why the wire format is hex",
        paragraphs: [
          "One ether is 10^18 wei, and JavaScript's safe integer range stops just above 9 * 10^15, which is under a hundredth of an ether. Parsing a balance into a double therefore loses wei, and the loss is silent. The [[json-rpc|execution JSON-RPC]] avoids the problem by returning every quantity as a `0x`-prefixed hex string with no leading zeros, and zero as `0x0`. Decode those with `BigInt` or an arbitrary-precision type, never with `parseFloat`, and be careful with JSON parsers that helpfully coerce strings to numbers.",
        ],
      },
      {
        heading: "Converting safely",
        paragraphs: [
          "[[client-libraries|Libraries]] provide the conversions: `parseEther` and `formatEther` for the 18-decimal case, `parseUnits` and `formatUnits` for anything else. Do all arithmetic in integer wei and convert only at the edge where a human reads the number; converting early and adding floats afterwards is how a balance display ends up off by a few wei, and how an exchange's accounting ends up off by more than that. When showing a value, decide on a rounding rule deliberately, because truncating 0.9999 ether to two places tells the user they have 0.99.",
        ],
      },
    ],
    example: {
      title: "The same amounts in each unit",
      language: "text",
      code: "1 ether   = 1000000000000000000 wei = 0xde0b6b3a7640000\n1 gwei    =          1000000000 wei = 0x3b9aca00\n25 gwei   =        25000000000 wei = 0x5d21dba00\n\n// a plain transfer at 25 gwei\ngasUsed 21000 * effectiveGasPrice 25 gwei = 525000 gwei = 0.000525 ether\n\n// eth_getBalance result\n\"0x1bc16d674ec80000\"  -> 2000000000000000000 wei -> 2 ether\n\n// an ERC-20 balance of a 6-decimal token\n\"0x00000000000000000000000000000000000000000000000000000000000f4240\" -> 1000000 -> 1.000000 USDC",
      note: "Only the first block is protocol data; the token amount means nothing until you read that contract's `decimals`.",
    },
    pitfalls: [
      "Parsing a wei quantity with `Number` or `parseFloat`; anything above about 0.009 ether loses precision without any error.",
      "Assuming 18 decimals for every token, which turns a USDC balance into a number a trillion times too small, since USDC uses six.",
      "Mixing units in one expression, for example multiplying a gas amount by a price already converted to gwei.",
      "Sending a `value` computed as a float; the field is an integer number of wei and a rounding artefact is a real payment.",
    ],
    related: ["hex-encoding", "eip-1559", "gas", "eth-get-balance", "transaction", "client-libraries", "token-standards", "evm"],
    sources: [
      { title: "ethereum.org: Intro to ether", url: "https://ethereum.org/developers/docs/intro-to-ether/" },
      { title: "ethereum.org: JSON-RPC API conventions", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "Solidity: Units and globally available variables", url: "https://docs.soliditylang.org/en/latest/units-and-global-variables.html" },
    ],
  },
  {
    id: "abi",
    title: "Contract ABI",
    category: "protocol",
    aliases: ["selector", "4byte", "encodeFunctionData", "calldata encoding", "application binary interface"],
    summary: "The ABI, or application binary interface, is the convention that turns a function call into calldata: a four-byte selector taken from the [[keccak-256|Keccak-256]] hash of the signature, followed by arguments in 32-byte words, with the same rules used to decode results and [[event-log|events]].",
    sections: [
      {
        heading: "Encoding a call",
        paragraphs: [
          "The selector is the first four bytes of the hash of the canonical signature: the function name, then the argument types in parentheses, with no names, no spaces, and full type names such as `uint256` rather than `uint`. After it, every static argument occupies exactly 32 bytes, numbers and [[address|addresses]] right-aligned with zero padding on the left, fixed byte arrays left-aligned. A dynamic argument, a `string`, `bytes`, or a variable-length array, is replaced in that position by a 32-byte offset, and its length and contents are appended after the head.",
          "That is all a node receives. [[eth-call|eth_call]] takes these bytes as `input` and hands back the return value encoded the same way, as raw bytes with no names or types attached. Decoding is entirely the caller's job, which is what a [[client-libraries|library]] does when it turns a result into an object.",
        ],
      },
      {
        heading: "Events and errors use the same rules",
        paragraphs: [
          "An event's `topic0` is the Keccak hash of its signature, indexed arguments become further topics (hashed first if they are dynamic), and everything else is ABI-encoded into the log's `data`; see [[event-signature|event signatures]]. A [[revert|revert]] is encoded as a call too: `Error(string)` has selector `0x08c379a0`, `Panic(uint256)` has `0x4e487b71`, and a custom error has its own selector derived from its own signature. Decoding revert data is therefore the same operation as decoding a call.",
        ],
      },
      {
        heading: "What the ABI is not",
        paragraphs: [
          "The ABI JSON file that tools consume is compiler output, not chain data. Nothing on chain records a contract's function list, so there is no RPC method that returns it; an application ships the ABI, or fetches it from a [[block-explorer|block explorer]] that verified the source. Public selector directories exist for the reverse direction, mapping four bytes back to a likely signature.",
          "Four bytes is also small enough to collide, deliberately or by accident. A selector identifies a call only as far as the contract's own dispatch table is concerned, so treating a selector as proof of which function ran is a mistake, especially through a proxy where the [[smart-contract|implementation]] decides what it means.",
        ],
      },
    ],
    example: {
      title: "Encoding an ERC-20 transfer by hand",
      language: "text",
      code: "transfer(address to, uint256 amount), to = 0xf39F…2266, amount = 1000000\n\nselector = keccak256(\"transfer(address,uint256)\")[0:4]    = a9059cbb\narg 0    = 000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb92266\narg 1    = 00000000000000000000000000000000000000000000000000000000000f4240\n\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[\n  {\"to\":\"0xA0b8…eB48\",\n   \"input\":\"0xa9059cbb000000000000000000000000f39fd6e51aad88f6f4ce6ab8827279cfffb9226600000000000000000000000000000000000000000000000000000000000f4240\"},\n  \"latest\"]}\n\n// result: a single bool, encoded as a full word\n\"0x0000000000000000000000000000000000000000000000000000000000000001\"",
      note: "The signature text hashed here contains no argument names; `transfer(address to,uint256 amount)` would produce a different and wrong selector.",
    },
    pitfalls: [
      "Hashing a signature that includes argument names, spaces, or `uint` instead of `uint256`, which yields a selector no contract answers to.",
      "Treating an empty `0x` result from `eth_call` as a revert; it also happens when the address holds no code at that block.",
      "Decoding a result with the wrong ABI; the bytes decode into plausible nonsense rather than failing.",
      "Assuming a four-byte selector identifies a function globally; collisions exist and a proxy can route it anywhere.",
    ],
    related: ["eth-call", "smart-contract", "keccak-256", "event-signature", "revert", "client-libraries", "event-log", "address", "block-explorer"],
    sources: [
      { title: "Solidity: Contract ABI specification", url: "https://docs.soliditylang.org/en/latest/abi-spec.html" },
      { title: "ethereum.org: Smart contracts", url: "https://ethereum.org/developers/docs/smart-contracts/" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "revert",
    title: "Reverts and errors",
    category: "protocol",
    aliases: ["REVERT", "execution reverted", "Error(string)", "Panic", "custom error", "require"],
    summary: "A revert stops the current [[evm|EVM]] frame, undoes its state changes, and returns data explaining why, which RPC surfaces as an error with `data` on [[eth-call|eth_call]] and as `status` `0x0` on a [[transaction-receipt|receipt]].",
    sections: [
      {
        heading: "What reverting does",
        paragraphs: [
          "The `REVERT` opcode ends a frame, restores every state change the frame made, hands back the [[gas|gas]] it did not use, and returns a byte string. That last part is what separates it from the other failure modes: running out of gas or hitting an invalid opcode also undoes the frame but burns all remaining gas and returns nothing. In Solidity, `require`, `revert`, and a failed custom error all compile to `REVERT`, and since version 0.8 so does `assert`.",
          "A revert is local to its frame. If contract A calls contract B and B reverts, A sees a failure flag and may ignore it and continue, so the [[transaction|transaction]] can succeed with `status` `0x1` while containing failed calls. Only a revert that reaches the outermost frame fails the whole transaction, and even then the transaction is included in the [[block|block]], consumes gas, and increments the [[nonce|nonce]].",
        ],
      },
      {
        heading: "Three shapes of revert data",
        paragraphs: [
          "Revert data is [[abi|ABI]]-encoded like a function call. `Error(string)` has the selector `0x08c379a0` and carries the human-readable reason of a `require`. `Panic(uint256)` has `0x4e487b71` and carries a code the compiler assigns: `0x01` for a failed assertion, `0x11` for arithmetic overflow, `0x12` for division by zero, `0x32` for an out-of-bounds array index. A custom error has its own selector derived from its own signature, so decoding it needs the contract's ABI; without it, a caller sees four bytes and arguments it cannot name.",
          "Empty revert data is the fourth and least helpful case. A bare `revert()`, a Solidity contract calling a function on an [[address|address]] with no code, or a failure in a library that never set a reason all produce `0x`, which says only that something failed. An `eth_call` sent directly to an address with no code is different: nothing executes, and it succeeds with `0x`.",
        ],
      },
      {
        heading: "How RPC reports reverts",
        paragraphs: [
          "[[eth-call|eth_call]] and [[eth-estimate-gas|eth_estimateGas]] answer a reverting call with a JSON-RPC error object rather than a result. Most clients, including [[geth|Geth]], [[nethermind|Nethermind]], and [[reth|Reth]], use code `3` with the message `execution reverted` and the raw revert bytes in `data`; some [[rpc-provider|providers]] return `-32000` with a message instead, so treat the code as a hint and look for `data`. See [[rpc-errors|JSON-RPC errors]] for the classification.",
          "A mined transaction is different: its receipt has `status` `0x0`, no logs, and no reason string anywhere. The bytes were returned at execution time and nothing stores them. To find out why a transaction failed, replay it with `eth_call` against the block it was in, or ask the node for a trace through the [[debug-api|debug_]] or [[trace-api|trace_]] namespace, which records the revert output of every frame.",
        ],
      },
    ],
    example: {
      title: "Revert data from a failing eth_call",
      language: "text",
      code: "{\"jsonrpc\":\"2.0\",\"id\":1,\"error\":{\n  \"code\": 3,\n  \"message\": \"execution reverted\",\n  \"data\": \"0x08c379a0…0026…45524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e6365…\"\n}}\n\ndecoding data:\n  08c379a0   selector of Error(string)\n  …0020      offset to the string argument\n  …0026      length 0x26 = 38 bytes\n  4552433230…  \"ERC20: transfer amount exceeds balance\"\n\nother first words you will meet:\n  4e487b71 …0011   Panic(uint256), code 0x11: arithmetic overflow\n  4e487b71 …0012   Panic(uint256), code 0x12: division by zero\n  <4 bytes>        a custom error; only the contract's ABI says which one\n  0x               no data at all: bare revert(), or a call to an address with no code",
      note: "The same bytes appear in `eth_estimateGas` errors and in traces, so one decoder handles all three.",
    },
    pitfalls: [
      "Looking for a revert reason in the receipt; it is not stored, and recovering it means replaying the call or tracing the transaction.",
      "Treating out of gas as a revert; it consumes the whole limit and returns no data, so there is nothing to decode.",
      "Assuming `status` `0x1` means every inner call succeeded; a caller can swallow a revert and finish normally.",
      "Hardcoding error code `3`; clients and providers disagree, and `data` is the field that actually matters.",
      "Showing a user the raw selector of a custom error; without the ABI it is meaningless, and with it the message is usually specific.",
    ],
    related: ["eth-call", "evm", "transaction-receipt", "rpc-errors", "abi", "eth-estimate-gas", "gas", "debug-api", "execution-trace", "smart-contract"],
    sources: [
      { title: "Solidity: Error handling", url: "https://docs.soliditylang.org/en/latest/control-structures.html#error-handling-assert-require-revert-and-exceptions" },
      { title: "EIP-140: REVERT instruction", url: "https://eips.ethereum.org/EIPS/eip-140" },
      { title: "EIP-1474: Remote procedure call specification", url: "https://eips.ethereum.org/EIPS/eip-1474" },
    ],
  },
  {
    id: "mempool",
    title: "Transaction pool",
    category: "protocol",
    aliases: ["mempool", "pending", "queued", "txpool", "underpriced", "propagation"],
    summary: "The transaction pool is one node's local set of signed [[transaction|transactions]] that are valid but not yet in a [[block|block]], split into pending transactions that can execute now and queued ones waiting behind a [[nonce|nonce]] gap.",
    sections: [
      {
        heading: "Admission, replacement, eviction",
        paragraphs: [
          "When [[eth-send-raw-transaction|eth_sendRawTransaction]] hands a node a transaction, the pool checks it before accepting: the signature must recover, the [[chain-id|chain id]] must match, the nonce must not be below the account's current value, the balance must cover `value` plus `gas` times the fee cap, the fee must clear the pool's minimum, and the encoded size must be under the client's limit, which for Geth is 128 KB. Failures come back immediately as [[rpc-errors|errors]] with recognisable messages: 'nonce too low', 'insufficient funds for gas * price + value', 'replacement transaction underpriced'.",
          "A pool is finite. When it fills, the cheapest transactions are dropped, which is why a transaction can vanish from a node without ever being mined, and why resubmitting is a normal part of sending. Replacing a pending transaction means reusing its nonce with a fee raised by the client's required margin, commonly ten percent on both [[eip-1559|fee fields]].",
        ],
      },
      {
        heading: "One pool per node, not a network object",
        paragraphs: [
          "Nodes announce transaction hashes to their peers over [[devp2p|devp2p]] and peers pull the ones they do not have, so pools converge but never match. Two nodes differ on which transactions they hold, in what order they arrived, and what they have evicted; a [[blob|blob transaction]] is not even broadcast in full, only announced and fetched on demand because of its sidecar. There is therefore no such thing as the mempool, only pools, and 'it is not in the mempool' is a statement about one node.",
          "A growing share of transactions skips public pools entirely. Users and searchers send directly to builders through [[private-rpc|private transaction endpoints]] to avoid being front-run, and those transactions appear for the first time in a block; see [[mev|MEV]]. Anything that measures demand or detects activity by watching pending transactions sees only the public remainder.",
        ],
      },
      {
        heading: "Seeing the pool over RPC",
        paragraphs: [
          "[[eth-get-transaction-by-hash|eth_getTransactionByHash]] returns pooled transactions with `blockHash`, `blockNumber`, and `transactionIndex` set to `null`, which is the cheapest way to confirm a node accepted yours. [[eth-get-transaction-count|eth_getTransactionCount]] with the `pending` [[block-tag|tag]] counts pool transactions into the nonce. The [[txpool-api|txpool_]] namespace exposes the pool directly with `txpool_status`, `txpool_content`, and `txpool_inspect`, and [[eth-subscribe|eth_subscribe]] with `newPendingTransactions` streams arrivals. Public endpoints usually disable the first of those and rate-limit the last, because a full dump is large and reveals who is about to do what.",
        ],
      },
    ],
    pitfalls: [
      "Treating a transaction's absence from one node's pool as proof it was never sent; pools are local and private flow never appears at all.",
      "Polling for a receipt on a different endpoint than the one that accepted the transaction, which can report `null` long after inclusion.",
      "Assuming a pending transaction will eventually be mined; it can be evicted when the pool fills or when its fee cap falls below the base fee.",
      "Reading `newPendingTransactions` as an ordered queue of what the next block contains; the proposer's ordering is decided elsewhere.",
    ],
    related: ["transaction", "nonce", "eth-send-raw-transaction", "txpool-api", "eip-1559", "block-tag", "private-rpc", "devp2p", "mev", "eth-subscribe"],
    sources: [
      { title: "ethereum.org: Transactions", url: "https://ethereum.org/developers/docs/transactions/" },
      { title: "Geth: txpool API", url: "https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-txpool" },
      { title: "EIP-4844: Shard Blob Transactions", url: "https://eips.ethereum.org/EIPS/eip-4844" },
    ],
  },
  {
    id: "withdrawals",
    title: "Withdrawals",
    category: "protocol",
    aliases: ["EIP-4895", "validator withdrawals", "withdrawalsRoot", "sweep", "gwei amount"],
    summary: "A withdrawal is a balance credit pushed from the [[consensus-layer|consensus layer]] into an execution [[block|block]] by EIP-4895: it moves a [[validator|validator]]'s ETH to an execution [[address|address]] without being a [[transaction|transaction]], so it has no sender, no [[gas|gas]], and no [[transaction-receipt|receipt]].",
    sections: [
      {
        heading: "Where they come from",
        paragraphs: [
          "Shapella, in April 2023, made staked ETH movable again. The consensus layer sweeps through validators in index order and produces two kinds of credit: a partial withdrawal of any balance above a validator's effective limit, and a full withdrawal of the entire balance once a validator has exited. Nobody signs anything, and nobody pays a fee; the credits are included by the proposer as a list in the [[execution-payload|execution payload]], and at most 16 of them fit in one block.",
          "A validator can only be swept once its withdrawal credentials name an execution address. Credentials of type `0x01` do that, and Pectra added `0x02` for compounding validators with a higher maximum effective balance, whose partial withdrawals only start above that larger ceiling.",
        ],
      },
      {
        heading: "What the fields look like",
        paragraphs: [
          "Each entry in a block's `withdrawals` array has four fields: `index`, a global counter that never resets; `validatorIndex`, naming the source validator; `address`, the recipient; and `amount`, the credit in gwei rather than in [[wei|wei]]. That unit is the single most common bug in code that handles withdrawals, because every other value in the [[json-rpc|JSON-RPC]] is wei and the factor is a billion. The [[block-header|header]] commits to the list through `withdrawalsRoot`, which is a trie over the entries just like the transactions root.",
        ],
      },
      {
        heading: "Consequences for RPC consumers",
        paragraphs: [
          "Because a withdrawal is not a transaction, it produces no receipt, no [[event-log|log]], and no entry in a trace. The recipient's balance simply differs between block N-1 and block N. Anything that reconstructs balances by summing transactions, most obviously an [[indexer|indexer]] or an exchange's accounting, silently drifts on any address that receives withdrawals unless it reads the `withdrawals` array from every block. [[eth-get-balance|eth_getBalance]] always reports the truth, so comparing a computed balance against it is a good invariant to check.",
          "Withdrawals also mean an address can gain ETH while no transaction touches it, which breaks the assumption that a balance change implies chain activity for that address. Pectra's EIP-7002 added a way for an execution-layer request to trigger an exit or partial withdrawal, but the payout still arrives through this same sweep.",
        ],
      },
    ],
    pitfalls: [
      "Reading `amount` as wei; it is gwei, so the value is a billion times smaller than it looks next to every other field.",
      "Looking for a transaction hash for a withdrawal; there is none, and searching an explorer by address is the only way to see it.",
      "Assuming withdrawals appear in traces or receipts, which is how balance reconciliation quietly goes wrong.",
      "Expecting withdrawal fields on pre-Shapella blocks; both `withdrawals` and `withdrawalsRoot` are absent there.",
    ],
    related: ["block", "block-header", "validator", "consensus-layer", "eth-get-balance", "execution-payload", "indexer", "address", "eth-get-block-by-number"],
    sources: [
      { title: "EIP-4895: Beacon chain push withdrawals as operations", url: "https://eips.ethereum.org/EIPS/eip-4895" },
      { title: "ethereum.org: Staking withdrawals", url: "https://ethereum.org/staking/withdrawals/" },
      { title: "EIP-7002: Execution layer triggerable withdrawals", url: "https://eips.ethereum.org/EIPS/eip-7002" },
    ],
  },
  {
    id: "genesis",
    title: "Genesis and chain config",
    category: "protocol",
    aliases: ["block 0", "genesis.json", "chainspec", "alloc", "fork schedule", "terminal total difficulty"],
    summary: "The genesis block is block 0, defined by a configuration file instead of being executed, and the chain config beside it fixes the [[chain-id|chain id]] and the block or timestamp at which every [[hardfork|network upgrade]] activates.",
    sections: [
      {
        heading: "What genesis defines",
        paragraphs: [
          "A genesis file lists an initial allocation of balances and, on test networks, prefunded development accounts and preset contract code. The client builds the resulting [[state|state]], computes its [[state-root|state root]], fills in the header fields the file specifies, such as `gasLimit`, `timestamp`, and `extraData`, and hashes it. That hash is the network's identity: Ethereum mainnet's is `0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3`, and a node built from a different file computes a different block 0 and will not follow the same chain.",
        ],
      },
      {
        heading: "The fork schedule",
        paragraphs: [
          "Alongside the allocation sits the chain configuration: the chain id and the activation point of every rule change. Pre-Merge upgrades are scheduled by block number, everything since is scheduled by timestamp (`shanghaiTime`, `cancunTime`, `pragueTime`, and so on), and the transition to [[proof-of-stake|proof of stake]] is pinned by a terminal total difficulty. For known networks this table is compiled into the [[execution-client|execution client]] and selected by a flag such as `--mainnet` or `--sepolia`; for a custom network it comes from a file, a `genesis.json` for [[geth|Geth]]-style clients or a chainspec for [[nethermind|Nethermind]].",
          "A configuration mismatch is not a startup error. Both nodes run happily until the disputed activation point, then disagree about the rules, compute a different [[state-root|state root]], and split. That is why the checklist before an upgrade is a client version and a fork schedule, and why [[health-check|health checks]] worth the name verify the chain and not just the port.",
        ],
      },
      {
        heading: "Genesis over RPC",
        paragraphs: [
          "The `earliest` [[block-tag|block tag]] and `eth_getBlockByNumber` with `0x0` return the genesis block; `eth_chainId` returns the configured chain id and `net_version` the network id; the two match on mainnet and the main testnets but are separate settings and differ on some chains. Only the first of those is hard to fake by accident: a misconfigured node can report the chain id you expect while serving a different chain, so comparing the genesis hash is the strongest cheap identity check an application can make, and it is worth doing when adding a new [[rpc-provider|provider]] or a new [[testnets|testnet]].",
          "Development networks lean on genesis heavily. [[local-devnet|Local nodes]] generate one with funded accounts and every fork active from block 0, which is why a contract that works locally can still fail on a chain where a newer opcode is not yet enabled.",
        ],
      },
    ],
    pitfalls: [
      "Trusting `eth_chainId` alone to identify a network; it is a configured value, while the genesis hash is derived from the actual chain.",
      "Copying a genesis file between clients without translating it; a Geth `genesis.json` and a Nethermind chainspec are different formats.",
      "Assuming a devnet's fork schedule matches mainnet, which hides upgrade-dependent bugs until deployment.",
      "Changing a chain config on a running node and expecting a restart to fix it; the node forks off at the first differing rule.",
    ],
    related: ["chain-id", "hardfork", "block", "state-root", "testnets", "local-devnet", "execution-client", "block-tag", "health-check", "block-hash"],
    sources: [
      { title: "ethereum.org: Network upgrades", url: "https://ethereum.org/history/" },
      { title: "Geth: Private networks", url: "https://geth.ethereum.org/docs/fundamentals/private-network" },
      { title: "Nethermind documentation", url: "https://docs.nethermind.io/" },
    ],
  },
  {
    id: "eip-7702",
    title: "Set code transactions (EIP-7702)",
    category: "protocol",
    aliases: ["type 0x4", "authorizationList", "delegation designator", "0xef0100", "EOA delegation", "Pectra"],
    summary: "EIP-7702 adds type `0x4` transactions, live since Pectra, whose `authorizationList` points an externally owned [[account|account]] at a [[smart-contract|contract]]: [[eth-get-code|eth_getCode]] then returns the 23-byte delegation designator `0xef0100` followed by that contract's [[address|address]].",
    sections: [
      {
        heading: "What an authorization does",
        paragraphs: [
          "An authorization is a small signed tuple of [[chain-id|chain id]], delegate address, and the authority's [[nonce|nonce]]. When a type `0x4` [[transaction|transaction]] carrying it executes, the authority's account gets the designator `0xef0100 || address` written into its code field and its nonce is incremented. From then on, a call to that account runs the delegate's code in the account's own context, like a `DELEGATECALL`, so the storage written belongs to the account, not to the delegate. Signing a new authorization for the zero address clears the delegation.",
          "The signer of the authorization does not have to send the transaction. A sponsor can pay for someone else's delegation, which is the point: an existing account gains contract behaviour, batching, and session keys without moving funds to a new address. A chain id of `0` makes an authorization valid on any chain, and an authorization whose nonce no longer matches is skipped silently rather than failing the transaction.",
        ],
      },
      {
        heading: "What changes for RPC callers",
        paragraphs: [
          "The oldest heuristic in Ethereum tooling, code means contract, no code means externally owned account, is now wrong in both directions. `eth_getCode` on a delegated account returns exactly 23 bytes starting `0xef0100`, and the useful answer is the address inside it, which must be fetched separately to learn what the account will actually do. [[eth-call|eth_call]] to such an account executes the delegate's code, and [[eth-get-storage-at|eth_getStorageAt]] reads the account's own slots, which now hold contract state.",
          "On-chain checks shift too: a key-controlled account can now have code, the 23-byte delegation designator, so a guard that reads 'has code' as 'is a contract, not a person' misclassifies delegated accounts, and a `tx.origin == msg.sender` check no longer guarantees that no contract code is running. A delegated account can still send ordinary transactions, so both paths coexist, and type `0x4` transactions themselves cannot create contracts, since `to` must be set.",
        ],
      },
      {
        heading: "Relationship to account abstraction",
        paragraphs: [
          "[[erc-4337|ERC-4337]] gives smart-account behaviour to new accounts through bundlers and an entry point contract, entirely outside the protocol. EIP-7702 gives it to accounts people already have, inside the protocol, and the two are usually combined: a wallet delegates an existing account to an implementation that speaks the 4337 interface. For anything reading the chain, the practical result is that an [[address|address]] you saw as an ordinary sender last year may execute arbitrary code today, so capability should be checked per block rather than cached forever.",
        ],
      },
    ],
    pitfalls: [
      "Classifying accounts as contracts or not from `eth_getCode` alone; a 23-byte answer starting `0xef0100` is a delegation, not a contract.",
      "Caching the delegate address; a later authorization can repoint or clear it, so re-read at the block you care about.",
      "Assuming the account that signed an authorization also paid for the transaction; a sponsor commonly sends it.",
      "Expecting an invalid authorization to fail the transaction; it is skipped, and the rest of the transaction still executes.",
    ],
    related: ["account", "smart-contract", "eth-get-code", "transaction-types", "erc-4337", "nonce", "evm", "address", "eth-call", "hardfork"],
    sources: [
      { title: "EIP-7702: Set Code for EOAs", url: "https://eips.ethereum.org/EIPS/eip-7702" },
      { title: "ethereum.org: Account abstraction", url: "https://ethereum.org/roadmap/account-abstraction/" },
      { title: "EIP-4337: Account Abstraction Using Alt Mempool", url: "https://eips.ethereum.org/EIPS/eip-4337" },
    ],
  },
];
