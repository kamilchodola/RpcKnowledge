// Category: Proofs & verification — how a caller can verify an RPC answer
// instead of trusting it: tries, proofs, trusted headers, light clients.

export const topics = [
  {
    id: "state-proof",
    title: "State proof",
    category: "proofs",
    aliases: ["merkle proof", "eth_getProof", "EIP-1186", "prove a balance", "verify rpc answer"],
    summary: "A state proof is the set of [[merkle-patricia-trie|trie]] nodes that lets a caller recompute a [[state-root|state root]] from an account or storage value, so an RPC answer can be checked against a [[block-header|header]] the caller already trusts instead of believed.",
    sections: [
      {
        heading: "The problem it solves",
        paragraphs: [
          "[[eth-get-balance|eth_getBalance]] returns a number and nothing else. If the node operator is lying, is running modified software, or is simply serving a stale branch, the answer looks identical to a correct one. A state proof changes what you must trust: instead of the operator, you trust one header and the collision resistance of [[keccak-256|keccak-256]], and verify the rest yourself.",
          "That is worth doing whenever an answer drives something irreversible and the node is not yours: a bridge releasing funds, a [[light-client|light client]] in a browser, an application reading through a [[rpc-provider|provider]] it has no relationship with. It is not worth doing for a balance next to a refresh button.",
        ],
      },
      {
        heading: "What eth_getProof returns",
        paragraphs: [
          "[[eth-get-proof|eth_getProof]], defined by [[eip|EIP-1186]], takes an [[address|address]], an array of 32-byte storage keys, and a [[block-tag|block identifier]]. The result carries the account's four fields — `balance`, `nonce`, `codeHash`, `storageHash` — plus `accountProof`, an array of [[rlp|RLP]]-encoded trie nodes from the state root down to that account's leaf, and `storageProof`, one entry per requested key holding `key`, `value`, and its own `proof`.",
          "The four field values are convenience: they are what the proof, once verified, forces them to be. `storageHash` is the root of that account's own storage trie and the hinge between the two halves of the verification. An empty key array is legitimate and proves the account alone.",
        ],
      },
      {
        heading: "Verifying, step by step",
        paragraphs: [
          "First, obtain a [[trusted-header|trusted header]] for the block you asked about and take `stateRoot` from it. Nothing else in the procedure works if this value came from the same response as the proof. Second, hash the address: the trie key is `keccak256(address)` over the 20 raw bytes, and its 64 nibbles are the path. Third, walk `accountProof` from the root: each node must hash to the reference its parent held, starting with `stateRoot`, and each step consumes nibbles. The final leaf decodes to `RLP([nonce, balance, storageRoot, codeHash])`, and `storageRoot` must equal the `storageHash` you were handed; see [[account-proof|account proof]].",
          "Fourth, for each storage entry, hash the 32-byte slot key the same way and walk `storageProof[i].proof` from the verified `storageHash` to the leaf, whose RLP-decoded value must equal `value`; see [[storage-proof|storage proof]]. Only after both walks succeed have you learned anything, and it is precisely this: at the block committed to by that header, this account had these fields and this slot held this value.",
        ],
      },
      {
        heading: "What a proof does not establish",
        paragraphs: [
          "It does not prove canonicality. A self-consistent header with a self-consistent proof can be produced for a branch that lost, or for a chain that never existed; establishing that the header is on the canonical chain is a separate job for a [[consensus-proof|consensus proof]] or your own node. It does not prove recency either: a perfectly valid proof against a two-year-old header says only what was true then.",
          "It also does not cover everything. Logs, receipts, and transactions are not in the state trie and need a [[receipt-proof|receipt proof]] instead. `codeHash` commits to the bytecode but is not the bytecode, so verifying [[eth-get-code|eth_getCode]] means hashing what you were sent and comparing. And nothing about a state proof says the state transition was correct; that needs executing the block, or trusting those who did.",
        ],
      },
    ],
    example: {
      title: "eth_getProof for one account and one slot",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getProof\",\"params\":[\n  \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  [\"0xbf4954ae1137d99a74d9587692d0c99fcc87859496c91311c267c25a44a35f95\"],\n  \"0x12d4f1c\"\n]}\n\n// result (node arrays abridged)\n{\n  \"address\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  \"balance\": \"0x0\",\n  \"nonce\": \"0x1\",\n  \"codeHash\": \"0xd80d4b…1505\",\n  \"storageHash\": \"0x2dcc6f…ddb6\",\n  \"accountProof\": [\"0xf90211a0…\", \"0xf90211a0…\", …, \"0xf87180a0…\", \"0xf8669d20…\"],\n  \"storageProof\": [{\n    \"key\": \"0xbf4954…5f95\",\n    \"value\": \"0x21c382892\",\n    \"proof\": [\"0xf90211a0…\", …, \"0xf8b18080…\", \"0xe69e203c…85021c382892\"]\n  }]\n}",
      note: "`accountProof` must hash back to the `stateRoot` of a header you trust; `storageProof[0].proof` must hash back to the `storageHash` that the account leaf itself contained.",
    },
    pitfalls: [
      "Verifying a proof against a `stateRoot` read from the same untrusted response; the check then only proves the responder is internally consistent.",
      "Proving against `latest` and caching the result; the proof stays mathematically valid while the value it describes has moved on.",
      "Using the address or slot number as the trie key instead of its keccak-256 hash, which walks a path that does not exist.",
      "Assuming any endpoint can prove old blocks; historical `eth_getProof` needs retained trie nodes, which many [[archive-node|archive nodes]] do not keep.",
    ],
    related: ["eth-get-proof", "merkle-patricia-trie", "trusted-header", "account-proof", "storage-proof", "state-root", "inclusion-proof", "consensus-proof", "verified-rpc", "light-client"],
    sources: [
      { title: "EIP-1186: RPC-Method to get Merkle Proofs", url: "https://eips.ethereum.org/EIPS/eip-1186" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
      { title: "ethereum.org: data structures and encoding", url: "https://ethereum.org/developers/docs/data-structures-and-encoding/" },
    ],
  },
  {
    id: "merkle-patricia-trie",
    title: "Merkle-Patricia Trie",
    category: "proofs",
    aliases: ["MPT", "patricia trie", "hexary trie", "branch node", "extension node", "leaf node", "secure trie"],
    summary: "The Merkle-Patricia Trie is Ethereum's hexary radix tree: [[rlp|RLP]]-encoded branch, extension, and leaf nodes referenced by their [[keccak-256|keccak-256]] hashes, so a single 32-byte root commits to every key and value stored beneath it.",
    sections: [
      {
        heading: "Three node types",
        paragraphs: [
          "A branch node is an RLP list of 17 items: sixteen references, one per hex nibble, plus a value slot used when a key ends exactly there. An extension node is a two-item list holding a shared path segment and one reference, collapsing a long non-branching run into one node. A leaf node is also two items: the remaining path and the value. A compact [[hex-prefix-encoding|hex-prefix encoding]] marks the first nibble of a path so a verifier can tell a leaf from an extension and whether the nibble count is odd.",
          "A reference is the keccak-256 hash of the child's RLP encoding — except when that encoding is shorter than 32 bytes, in which case the node is inlined verbatim inside its parent. A verifier that treats every reference as a hash fails on small tries and shallow subtrees, so proof-checking code must handle both forms.",
        ],
      },
      {
        heading: "The four tries",
        paragraphs: [
          "The state trie maps `keccak256(address)` to `RLP([nonce, balance, storageRoot, codeHash])`, and its root is `stateRoot` in the [[block-header|header]]. Every contract has its own storage trie mapping `keccak256(slotKey)` to the RLP of the slot's value with leading zero bytes stripped; its root is the `storageRoot` inside the account leaf. Hashing the keys — the 'secure trie' design — keeps the tree balanced and stops an attacker crafting [[address|addresses]] that make one branch pathologically deep.",
          "The transactions and receipts tries are different in kind. They are built fresh for each [[block|block]], keyed by the RLP encoding of the index rather than by a hash, and their roots are `transactionsRoot` and `receiptsRoot`. Because the keys are small consecutive integers, the trees are shallow; see [[receipt-proof|receipt proofs]]. The [[consensus-layer|consensus layer]] does not use this structure at all — it Merkleizes with [[ssz|SSZ]] and SHA-256.",
        ],
      },
      {
        heading: "Why proofs fall out of it",
        paragraphs: [
          "A proof is the sequence of nodes along one path, root first. The verifier starts with a root it trusts and, for each node, checks that its keccak-256 hash equals the reference the previous node held, decodes it, and consumes the nibbles it accounts for. If the path is consumed and a leaf matches, the value is proven and nothing else is needed. Forging a proof would require a keccak-256 collision.",
          "The same walk proves absence. When the path leads to a branch whose child slot for the next nibble is empty, or to a node whose stored path diverges from the key, the key provably cannot be in the trie under that root. That is how [[eth-get-proof|eth_getProof]] answers for an account never touched, and why an 'empty' result is a real answer rather than a missing one.",
        ],
      },
      {
        heading: "The cost of the shape",
        paragraphs: [
          "Hexary branching keeps the tree shallow — seven to nine levels for a random account — but each branch node carries sixteen 32-byte references, so every proof drags along a lot of sibling data. Each level is a random lookup by hash, which is why [[client-storage|client storage engines]] moved to flat and path-based layouts that answer a value without touching the trie, and why some nodes serve [[eth-get-balance|eth_getBalance]] for an old block but not `eth_getProof` for it. It is also why [[witness|witnesses]] for [[stateless-ethereum|stateless execution]] are too large in this structure.",
        ],
      },
    ],
    example: {
      title: "Walking one account path from the state root",
      language: "text",
      code: "stateRoot   0x9b83c12c…ee71                      <- from a header you already trust\n   |        key = keccak256(address) = 5f3b2c9a…   (64 nibbles, consumed left to right)\n   v\nbranch      RLP list of 17 items; item[5] = 0x2a7e…\n   |  nibble 5\n   v\nextension   [ path \"f3b\", ref 0x81c4… ]              shared prefix, no fan-out here\n   |  nibbles f, 3, b\n   v\nbranch      RLP list of 17 items; item[2] = 0xd90a…\n   |  nibble 2\n   v\nleaf        [ path \"c9a…\", RLP([nonce, balance, storageRoot, codeHash]) ]\n\ncheck at every step:  keccak256(rlp_bytes_of_node) == reference held by the parent\ncheck at the start:   keccak256(rlp_bytes_of_node_0) == stateRoot\ncheck at the end:     the leaf's remaining path equals the unconsumed key nibbles",
      note: "The proof is exactly this node list; a verifier needs nothing else from the chain except the root it started with.",
    },
    pitfalls: [
      "Using the raw 20-byte address as the trie key; state and storage tries are keyed by the keccak-256 hash of the address or slot.",
      "Assuming every child reference is a 32-byte hash; nodes whose RLP encoding is under 32 bytes are embedded in the parent.",
      "Applying this structure to consensus data, which is Merkleized with SSZ and SHA-256, not RLP and keccak-256.",
      "Expecting the transactions and receipts tries to be queryable later; they are rebuilt per block and no standard RPC method serves their nodes.",
    ],
    related: ["state-proof", "state-root", "rlp", "keccak-256", "account-proof", "storage-proof", "receipt-proof", "inclusion-proof", "client-storage", "stateless-ethereum", "verkle-tree", "hex-prefix-encoding", "binary-state-tree"],
    sources: [
      { title: "ethereum.org: data structures and encoding", url: "https://ethereum.org/developers/docs/data-structures-and-encoding/" },
      { title: "Ethereum Yellow Paper", url: "https://ethereum.github.io/yellowpaper/paper.pdf" },
      { title: "EIP-1186: RPC-Method to get Merkle Proofs", url: "https://eips.ethereum.org/EIPS/eip-1186" },
    ],
  },
  {
    id: "account-proof",
    title: "Account proof",
    category: "proofs",
    aliases: ["accountProof", "prove an account", "account leaf", "empty account"],
    summary: "An account proof is the `accountProof` array of [[eth-get-proof|eth_getProof]]: the [[rlp|RLP]]-encoded [[merkle-patricia-trie|trie]] nodes from the [[state-root|state root]] to the account's leaf, whose value decodes to `RLP([nonce, balance, storageRoot, codeHash])`.",
    sections: [
      {
        heading: "The path and the leaf",
        paragraphs: [
          "The key is `keccak256(address)` over the 20 raw bytes of the [[address|address]] — not its checksummed text, and not the address itself. That 32-byte hash is 64 hex nibbles, and the nodes in `accountProof` are ordered root first, each consuming some of them. The leaf at the end holds the account's four fields in a fixed order: `nonce`, `balance`, `storageRoot`, `codeHash`.",
          "[[eth-get-proof|eth_getProof]] also returns those four at the top level as `nonce`, `balance`, `storageHash`, and `codeHash`, which is convenient and unverified. The point of the proof is to force them: after a successful walk, the leaf's `storageRoot` must equal the returned `storageHash` and the leaf's `codeHash` must equal the returned `codeHash`, or the response is inconsistent and the whole thing is discarded.",
        ],
      },
      {
        heading: "The walk",
        paragraphs: [
          "Start with a `stateRoot` taken from a [[trusted-header|trusted header]]. For each node in order, check that its [[keccak-256|keccak-256]] hash equals the reference you are expecting, decode it, and advance: a 17-item branch hands you the child at the next nibble, while a two-item node hands you its single reference after consuming the path segment it stores. When the nibbles run out at a leaf whose stored remainder matches, the leaf value is the account.",
          "Two details trip up first implementations. Nodes whose RLP encoding is shorter than 32 bytes are embedded in their parent rather than referenced by hash, so the hash check must be skipped for those. And the leaf's remaining path has to be compared against the unconsumed key nibbles; a verifier that stops as soon as it sees a leaf will accept a proof for a neighbouring account.",
        ],
      },
      {
        heading: "Proving that an account does not exist",
        paragraphs: [
          "Most [[address|addresses]] have never been touched and have no leaf in the state trie at all. The proof for one of those still verifies: the walk terminates at a branch with an empty slot, or at a node whose path diverges from the key, which proves the key is absent under that root. [[eth-get-proof|eth_getProof]] then reports `nonce` and `balance` as `0x0`, but clients disagree on the hashes: [[geth|Geth]], [[nethermind|Nethermind]], and [[erigon|Erigon]] return zero hashes, while [[besu|Besu]] and [[reth|Reth]] return `0xc5d24601…a470`, the keccak of empty bytes, and `0x56e81f17…b421`, the root of an empty trie — exactly what every existing account without code or storage returns. Only the proof shows absence.",
          "[[exclusion-proof|Exclusion proofs]] are what make a bridge or [[light-client|light client]] able to say 'this message was never registered' rather than 'the node did not answer'. They are also why an empty `accountProof` walk should be treated as a successful result and not as an error path.",
        ],
      },
    ],
    example: {
      title: "Verifying accountProof against a trusted stateRoot",
      language: "js",
      code: "const key = keccak256(hexToBytes(address));       // 20 raw bytes in, 32 bytes out\nlet nibbles = toNibbles(key);                    // 64 nibbles of path\nlet expected = trustedHeader.stateRoot;          // NOT the stateRoot from this response\n\nfor (const node of proof.accountProof) {         // RLP-encoded nodes, root first\n  if (node.length >= 32 && keccak256(node) !== expected)\n    throw new Error(\"node does not hash to the reference its parent held\");\n  const items = rlpDecode(node);\n  if (items.length === 17) {                     // branch: 16 children + value slot\n    expected = items[nibbles.shift()];\n  } else {                                       // extension or leaf: [path, ref | value]\n    consume(nibbles, decodeHexPrefix(items[0])); // throws if the stored path diverges\n    expected = items[1];\n  }\n}\n\nconst [nonce, balance, storageRoot, codeHash] = rlpDecode(expected);\nassert(bytesToHex(storageRoot) === proof.storageHash);   // the pivot into storage proofs",
      note: "Simplified: a production verifier also distinguishes leaves from extensions by their [[hex-prefix-encoding|hex-prefix flag]] and handles a path that ends at a branch's value slot.",
    },
    pitfalls: [
      "Hashing the checksummed address string instead of the 20 raw bytes, which produces a path that leads nowhere in the trie.",
      "Trusting the top-level `balance` and `nonce` without checking them against the values decoded from the proven leaf.",
      "Treating an exclusion proof as a failed request; an untouched account legitimately has no leaf and the walk still verifies.",
      "Skipping the comparison of the leaf's remaining path against the key, which lets a proof for a different account pass.",
    ],
    related: ["state-proof", "eth-get-proof", "merkle-patricia-trie", "storage-proof", "trusted-header", "account", "state-root", "inclusion-proof", "address"],
    sources: [
      { title: "EIP-1186: RPC-Method to get Merkle Proofs", url: "https://eips.ethereum.org/EIPS/eip-1186" },
      { title: "ethereum.org: accounts", url: "https://ethereum.org/developers/docs/accounts/" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
    ],
  },
  {
    id: "storage-proof",
    title: "Storage proof",
    category: "proofs",
    aliases: ["storageProof", "prove a slot", "slot proof", "mapping proof", "storageHash"],
    summary: "A storage proof is one entry of the `storageProof` array from [[eth-get-proof|eth_getProof]]: a slot `key`, its `value`, and the [[merkle-patricia-trie|trie]] nodes running from that account's `storageHash` down to the slot's leaf.",
    sections: [
      {
        heading: "Two hashes, not one",
        paragraphs: [
          "Every contract has its own storage trie, rooted at the `storageHash` inside its account leaf. You ask for a slot by its 32-byte slot number, but the path walked inside the trie is the [[keccak-256|keccak-256]] hash of those 32 bytes. That is the second hash, and it is easy to miss because the request and the response both show the un-hashed slot number in `key`.",
          "The first hash appears earlier, when the slot number itself has to be computed. A Solidity mapping entry lives at `keccak256(paddedKey . paddedSlot)`, an array element at `keccak256(slot) + index`, and a plain variable at its declaration index; see [[contract-storage|contract storage layout]]. So proving one token balance involves one hash to find the slot and another to find its path, and swapping them produces a proof request that verifies correctly against the wrong thing.",
        ],
      },
      {
        heading: "Values and empty slots",
        paragraphs: [
          "The leaf value is the [[rlp|RLP]] encoding of the slot contents as a big-endian integer with leading zero bytes stripped, so a slot holding one is stored as `0x01` and not as 32 bytes. A verifier that compares raw 32-byte words against the decoded leaf will mismatch on nearly every non-zero slot.",
          "A slot that has never been written has no leaf, and so does a slot that was written and then set back to zero — the [[evm|EVM]] deletes the entry, which is also why zeroing a slot refunds [[gas|gas]]. `eth_getProof` returns `value` `0x0` with an exclusion proof in both cases, and the two are genuinely indistinguishable from the trie. If your application needs 'never set' to differ from 'set to zero', that distinction has to live in a separate flag in the contract.",
        ],
      },
      {
        heading: "Verifying and using one",
        paragraphs: [
          "The order matters: verify the [[account-proof|account proof]] first against a [[state-root|state root]] from a [[trusted-header|trusted header]], take `storageHash` from the leaf you proved, and only then walk the storage nodes. Starting from the `storageHash` field of the response skips the only step that tied the storage trie to the chain.",
          "This is the workhorse of cross-chain systems. A canonical [[bridge|bridge]] proves that a withdrawal message was recorded in the bridge contract's storage on the other chain; an oracle proves a price it published; a [[governance-voting-power|governance system]] proves a token balance at a past block. In each case the storage slot is the contract's public commitment and the proof is what lets a verifier act on it without running a node on the source chain.",
        ],
      },
    ],
    example: {
      title: "Proving one ERC-20 balance slot",
      language: "json",
      code: "// the balances mapping is declared at slot 9, so the entry's slot number is\n// keccak256( pad32(holder) || pad32(9) )   -- Foundry: cast index address 0xd8dA…6045 9\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getProof\",\"params\":[\n  \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  [\"0xbf4954ae1137d99a74d9587692d0c99fcc87859496c91311c267c25a44a35f95\"],\n  \"0x12d4f1c\"\n]}\n\n// result (abridged)\n{\n  \"storageHash\": \"0x2dcc6f…ddb6\",\n  \"storageProof\": [{\n    \"key\":   \"0xbf4954…5f95\",\n    \"value\": \"0x21c382892\",\n    \"proof\": [\"0xf90211a0…\", …, \"0xf8b1808080…\", \"0xe69e203c…85021c382892\"]\n  }]\n}",
      note: "`key` is the slot number you asked for; the path actually walked through the nodes is `keccak256(key)`, and the walk must start from a `storageHash` you proved rather than one you were told.",
    },
    pitfalls: [
      "Passing the mapping's key, such as the holder address, as the storage key instead of the computed `keccak256(paddedKey . paddedSlot)` slot number.",
      "Expecting the trie path to be the slot number itself; the path is the keccak-256 hash of that 32-byte number.",
      "Comparing a padded 32-byte word against the leaf, whose value is RLP with leading zero bytes stripped.",
      "Reading `value` out of the response without walking `proof`, which is trusting the node exactly as much as [[eth-get-storage-at|eth_getStorageAt]] would.",
    ],
    related: ["state-proof", "account-proof", "eth-get-proof", "contract-storage", "merkle-patricia-trie", "eth-get-storage-at", "trusted-header", "bridge", "exclusion-proof", "governance-voting-power"],
    sources: [
      { title: "EIP-1186: RPC-Method to get Merkle Proofs", url: "https://eips.ethereum.org/EIPS/eip-1186" },
      { title: "Solidity: layout of state variables in storage", url: "https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
    ],
  },
  {
    id: "inclusion-proof",
    title: "Inclusion proof",
    category: "proofs",
    aliases: ["merkle proof", "membership proof", "merkle branch"],
    summary: "An inclusion proof is a short set of hashes that lets a verifier recompute a commitment root from one member, proving membership without holding the whole set; Ethereum uses [[merkle-patricia-trie|trie]] node paths on the execution side and [[ssz|SSZ]] Merkle branches on the consensus side.",
    sections: [
      {
        heading: "The general shape",
        paragraphs: [
          "Every inclusion proof has the same three parts: a root the verifier already trusts, a member, and just enough sibling data to recompute the root from that member. The verifier repeats the hashing the prover claims was done, level by level, and compares the result against the root. Proof size grows with the logarithm of the set, which is the whole point — a verifier holding 32 bytes can check membership in a set of millions.",
          "The security assumption is collision resistance of the hash, nothing more. That also bounds what is being claimed: the proof says the member is under that root, and says nothing at all about whether the root is the right root, when it was produced, or whether the data it commits to is meaningful.",
        ],
      },
      {
        heading: "Two families in Ethereum",
        paragraphs: [
          "Execution-layer proofs are [[merkle-patricia-trie|Merkle-Patricia]] node paths: [[rlp|RLP]]-encoded whole nodes hashed with [[keccak-256|keccak-256]], with keys hashed before use. Because a branch node carries sixteen references, the proof ships far more sibling data than a binary tree would; an [[account-proof|account proof]] of seven levels is several kilobytes. This is what [[eth-get-proof|eth_getProof]] returns.",
          "Consensus-layer proofs are SSZ Merkle branches: a fixed binary tree over a fixed data layout, hashed with SHA-256, where a proof is a flat list of 32-byte siblings plus a [[generalized-index|generalized index]] naming the leaf's position. The index is what tells the verifier which side each sibling goes on, and it is stable only within a fork, because the spec fixes the layout for each fork: Electra moved the finalized checkpoint root in the beacon state from index 105 to 169, and Glamsterdam's Gloas is set to move it again, to 735. [[light-client|Light client]] updates and [[beacon-api|Beacon API]] proofs use this form; see [[consensus-proof|consensus proof]].",
        ],
      },
      {
        heading: "Inclusion, exclusion, and limits",
        paragraphs: [
          "The same node path also proves absence. In a trie, a walk that ends at an empty branch slot or at a node whose path diverges is an [[exclusion-proof|exclusion proof]], and it is verified exactly like an inclusion proof. In a fixed-layout SSZ tree there is no absence to prove: every field exists, so the equivalent statement is that a field holds a particular value, such as zero.",
          "What no inclusion proof gives you is context. Membership in a [[block|block]]'s trie does not make the block canonical, does not say how old it is, and does not order two members relative to anything outside the tree. Those need a [[trusted-header|trusted header]] and, behind it, consensus evidence.",
        ],
      },
    ],
    example: {
      title: "Verifying an SSZ Merkle branch by generalized index",
      language: "js",
      code: "// SSZ proofs are binary and hashed with SHA-256, unlike execution-layer trie proofs\nfunction verifyBranch(leaf, branch, generalizedIndex, root) {\n  let node = leaf;                       // 32 bytes\n  let index = generalizedIndex;          // bit pattern names the path from the root\n\n  for (const sibling of branch) {        // one 32-byte sibling per level, leaf upwards\n    node = (index % 2n === 0n)\n      ? sha256(concat(node, sibling))    // this node is the left child\n      : sha256(concat(sibling, node));   // this node is the right child\n    index /= 2n;\n  }\n\n  return node === root;                  // root must come from somewhere you trust\n}",
      note: "An execution-layer proof looks different: whole RLP nodes rather than bare siblings, keccak-256 rather than SHA-256, and a key that was hashed before the walk began.",
    },
    pitfalls: [
      "Checking a proof against a root supplied in the same response, which proves only that the responder was internally consistent.",
      "Reusing keccak-256 for SSZ proofs; consensus Merkleization uses SHA-256, and mixing them fails silently as a hash mismatch.",
      "Treating a Merkle-Patricia proof as a list of sibling hashes; it is a list of complete RLP-encoded nodes that must each be decoded.",
      "Concluding that a proven transaction or receipt is final; inclusion under a root says nothing about that block being canonical.",
    ],
    related: ["merkle-patricia-trie", "state-proof", "ssz", "receipt-proof", "consensus-proof", "trusted-header", "keccak-256", "account-proof", "eth-get-proof"],
    sources: [
      { title: "ethereum.org: data structures and encoding", url: "https://ethereum.org/developers/docs/data-structures-and-encoding/" },
      { title: "ethereum/consensus-specs", url: "https://github.com/ethereum/consensus-specs" },
      { title: "EIP-1186: RPC-Method to get Merkle Proofs", url: "https://eips.ethereum.org/EIPS/eip-1186" },
    ],
  },
  {
    id: "receipt-proof",
    title: "Transaction and receipt proofs",
    category: "proofs",
    aliases: ["receiptsRoot", "transactionsRoot", "prove a log", "log proof", "bridge proof"],
    summary: "A transaction or receipt proof shows that one [[transaction|transaction]] or [[transaction-receipt|receipt]] sits at a given index in a block, by walking the per-block [[merkle-patricia-trie|trie]] whose root is `transactionsRoot` or `receiptsRoot` in the [[block-header|header]] and whose key is the [[rlp|RLP]] encoding of that index.",
    sections: [
      {
        heading: "Two tries that work differently",
        paragraphs: [
          "Unlike the state trie, these two are built from scratch for every [[block|block]] and thrown away afterwards. Their keys are the RLP encodings of the positional index — index 0 is the single byte `0x80`, index 1 is `0x01` — so the keys are short, consecutive, and not hashed. Values are the raw transaction bytes on one side and the encoded receipt on the other; for anything but a legacy [[transaction-types|typed transaction]] the value is the type byte followed by the RLP of the object, per EIP-2718.",
          "Because there are only a few hundred entries and no key hashing, these proofs are small: a handful of nodes reaches any index. What they prove is narrow but useful — that this exact transaction, or this exact receipt with these exact logs, is what the header committed to at that position.",
        ],
      },
      {
        heading: "The only cryptographic path from a log to a header",
        paragraphs: [
          "An [[event-log|event log]] lives inside a receipt and nowhere else. It is not in the [[state|state]] trie, so [[eth-get-proof|eth_getProof]] cannot touch it, and `logsBloom` is a probabilistic filter with false positives rather than evidence. The only way to prove a log cryptographically is to prove its receipt under `receiptsRoot` and then read the log out of the proven receipt.",
          "This is exactly what canonical [[bridge|bridges]] and cross-chain messaging protocols do. The source chain's contract emits a message as an event; the destination verifies a receipt proof against a header it has established as canonical, then acts on the log's contents. The proof is one half of the job and the [[trusted-header|trusted header]] is the other.",
        ],
      },
      {
        heading: "No RPC method returns one",
        paragraphs: [
          "The [[json-rpc|execution JSON-RPC]] has nothing for this. `eth_getProof` covers state only, and no standard method serves transaction or receipt trie nodes. The workaround is to rebuild the trie yourself: fetch every receipt of the block with [[eth-get-block-receipts|eth_getBlockReceipts]], or every transaction with [[eth-get-block-by-number|eth_getBlockByNumber]] and `fullTransactions` true, insert them under their RLP-encoded indices, and extract the branch for the index you care about.",
          "The pleasant consequence is that the data can come from an endpoint you do not trust at all. If any receipt was altered or omitted, the rebuilt root will not equal the `receiptsRoot` in your trusted header, and the whole attempt fails loudly. The unpleasant consequence is the work: one full block of receipts per proof, and an encoder that reproduces the client's byte-exact receipt serialization including the type prefix.",
        ],
      },
    ],
    example: {
      title: "Rebuilding the receipts trie to extract a proof",
      language: "js",
      code: "// no RPC method returns a receipt proof, so rebuild the block's trie locally\nconst receipts = await rpc(\"eth_getBlockReceipts\", [\"0x12d4f1c\"]);\nconst trie = new Trie();\n\nfor (const [index, receipt] of receipts.entries()) {\n  // key: RLP(index)  ->  0x80 for 0, 0x01 for 1, …\n  // value: legacy = RLP(receipt); typed = typeByte || RLP(receipt)   (EIP-2718)\n  await trie.put(rlpEncode(index), encodeReceipt(receipt));\n}\n\n// the rebuilt root must equal receiptsRoot in a header you already trust\nif (bytesToHex(trie.root()) !== trustedHeader.receiptsRoot)\n  throw new Error(\"the endpoint did not return this block's receipts\");\n\nconst proof = await trie.createProof(rlpEncode(targetIndex));",
      note: "The receipts may come from any endpoint: either the rebuilt root matches the trusted header or the data was wrong, and there is no third outcome.",
    },
    pitfalls: [
      "Forgetting the EIP-2718 type prefix when re-encoding a receipt; the root then differs from `receiptsRoot` for every block containing a typed transaction.",
      "Expecting `eth_getProof` to cover receipts or transactions; it proves state only, and no standard method returns these node paths.",
      "Treating `logsBloom` as evidence that a log exists; a bloom filter has false positives and proves nothing on its own.",
      "Proving a receipt against a header whose canonicality was never established, which leaves the proof true and the conclusion wrong.",
    ],
    related: ["inclusion-proof", "trusted-header", "transaction-receipt", "merkle-patricia-trie", "event-log", "eth-get-block-receipts", "bridge", "block-header", "state-proof"],
    sources: [
      { title: "EIP-2718: Typed Transaction Envelope", url: "https://eips.ethereum.org/EIPS/eip-2718" },
      { title: "ethereum.org: data structures and encoding", url: "https://ethereum.org/developers/docs/data-structures-and-encoding/" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/" },
    ],
  },
  {
    id: "trusted-header",
    title: "Trusted header",
    category: "proofs",
    aliases: ["anchor header", "canonical header", "header chain", "pinned checkpoint", "root of trust"],
    summary: "A trusted header is the [[block-header|header]] a verifier already believes, and every proof bottoms out in one: the proof shows a value is committed under `stateRoot` or `receiptsRoot`, and says nothing about whether that header belongs to the canonical chain.",
    sections: [
      {
        heading: "Why a proof is worthless without one",
        paragraphs: [
          "A [[state-proof|state proof]] consumes exactly one input from outside itself: a root. Take that root from the same response that supplied the proof and you have verified nothing except that the responder can produce internally consistent data — which anyone can, because building a fake header with a fake state trie underneath it costs nothing. The header is where the trust actually lives, and the proof merely extends it to a value.",
          "The minimum check on any header you are handed is that it hashes to the [[block-hash|block hash]] it claims: `keccak256(RLP(header))` must equal that hash. That catches tampering with individual fields but establishes nothing about canonicality, because a self-consistent header for a chain nobody follows hashes correctly too.",
        ],
      },
      {
        heading: "Four ways to get one",
        paragraphs: [
          "Running your own [[full-node|full node]] is the strongest: it validated every block itself and its head is its own conclusion. A [[light-client|light client]] is next, following [[sync-committee|sync committee]] signatures to accept headers with a cryptographic argument rather than an operator's word; see [[consensus-proof|consensus proof]]. Third, a pinned checkpoint — a finalized [[block-hash|block hash]] obtained out of band, exactly as [[checkpoint-sync|checkpoint sync]] and [[weak-subjectivity|weak subjectivity]] already require — plus a header chain you verify forward by checking each `parentHash` and each hash.",
          "Fourth and weakest, cross-checking: ask several independent [[rpc-provider|providers]] for the same block number and compare the hashes. That catches an isolated liar and a badly lagging node, and it is cheap, but agreement among providers is a heuristic and not a proof. [[eip|EIP-1898]]'s `requireCanonical` flag belongs in the same bucket: it makes the node fail rather than answer from a side branch, which is useful, but it is still the node asserting canonicality about itself.",
        ],
      },
      {
        heading: "Recency is a separate question",
        paragraphs: [
          "A header that is genuinely canonical and genuinely old still proves only old facts. Pair the header with a bound on its age: check its `timestamp` and `number` against what you expect, or insist the header be at or past the `finalized` [[block-tag|block tag]], which is also the only level at which [[finality|finality]] makes reversal cost a third of the stake.",
          "Chaining forward from a checkpoint by `parentHash` gives contiguity, not canonicality: an attacker with enough old keys can build a long consistent chain from an old checkpoint. That is the long-range attack that weak subjectivity exists to bound, and it is why the checkpoint has to be recent and why [[verified-rpc|verified RPC]] setups refresh theirs.",
        ],
      },
    ],
    example: {
      title: "Pinning a header and checking what follows from it",
      language: "bash",
      code: "# 1. anchor: a finalized header from a source you are willing to trust\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBlockByNumber\",\"params\":[\"finalized\",false]}' \\\n  http://127.0.0.1:8545 | jq -r '.result | .number, .hash, .stateRoot'\n\n# 2. cross-check the same height against two independent providers\nfor url in https://rpc-a.example https://rpc-b.example; do\n  curl -s -X POST -H 'content-type: application/json' \\\n    --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBlockByNumber\",\"params\":[\"0x12d4f1c\",false]}' \\\n    \"$url\" | jq -r '.result.hash'\ndone\n\n# 3. pin the hash in the proof request so the node refuses side branches (EIP-1898)\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getProof\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",[],{\"blockHash\":\"0x9b83c12c…ee71\",\"requireCanonical\":true}]}' \\\n  https://rpc.example",
      note: "Step 3 makes the node commit to a claim rather than quietly answering from a losing branch; it is still that node's claim, which is why steps 1 and 2 exist.",
    },
    pitfalls: [
      "Taking `stateRoot` from the same response as the proof, which reduces the verification to checking that the responder is self-consistent.",
      "Never checking that `keccak256(RLP(header))` equals the claimed block hash, so a header with one altered field passes straight through.",
      "Cross-checking two endpoints that are secretly the same upstream or the same provider, which produces agreement with no independence behind it.",
      "Treating `requireCanonical` as cryptographic; it is an assertion by the node answering, not evidence a verifier can check.",
    ],
    related: ["state-proof", "consensus-proof", "light-client", "block-header", "block-hash", "verified-rpc", "finality", "weak-subjectivity", "block-tag", "checkpoint-sync"],
    sources: [
      { title: "EIP-1898: Add blockHash to defaultBlock methods", url: "https://eips.ethereum.org/EIPS/eip-1898" },
      { title: "ethereum.org: nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
      { title: "ethereum/consensus-specs", url: "https://github.com/ethereum/consensus-specs" },
    ],
  },
  {
    id: "consensus-proof",
    title: "Consensus proof",
    category: "proofs",
    aliases: ["sync committee signature", "Altair light client", "canonicality proof", "BLS aggregate"],
    summary: "A consensus proof is evidence that a [[beacon-block|beacon header]] is canonical — a [[sync-committee|sync committee]] aggregate signature over it, packaged as a [[light-client-update|light client update]] — from which an [[ssz|SSZ]] branch reaches the execution [[block-header|header]] and its `stateRoot`.",
    sections: [
      {
        heading: "What the sync committee buys",
        paragraphs: [
          "Following [[proof-of-stake|proof of stake]] properly means tracking hundreds of thousands of validators. The Altair sync committee exists so that a [[light-client|light client]] does not have to: 512 validators are selected for a period of 256 [[slot-epoch|epochs]], roughly 27 hours, and sign the headers they see with an aggregatable BLS signature. A verifier that knows the current committee's public keys can check one aggregate signature and accept a header. The light client spec sets the bar by purpose: an update is valid with a single participant, the optimistic head moves once participation exceeds half the recent peak, and only the finalized header and the committee hand-over need at least two thirds — 342 of the 512 — except that once a full period has passed since its finalized header, a client may force-apply the best update it has seen.",
          "Committee rotation is itself proven. Each update carries the next period's committee together with an SSZ branch showing it is committed to by the state of the header being attested, so a client that bootstrapped once can walk forward period by period without ever trusting a server again.",
        ],
      },
      {
        heading: "Light client updates",
        paragraphs: [
          "The objects are defined in the consensus specs and served by the [[beacon-api|Beacon API]]. A bootstrap fetched for a block root you trust gives the header and the current committee. `LightClientUpdate` objects then carry an attested header, the sync aggregate that signed it, the next committee with its branch, and a finality branch linking to a finalized checkpoint. Between updates, optimistic and finality updates track the head and the latest finalized header.",
          "The trust assumptions are weaker than full [[finality|finality]] and worth stating. A sync committee member is not slashed for signing a header that never becomes canonical, so the security argument is an honest majority of a 512-validator sample rather than a third of all stake. And the bootstrap root has to come from outside the protocol, exactly as [[weak-subjectivity|weak subjectivity]] requires.",
        ],
      },
      {
        heading: "From beacon header to execution header",
        paragraphs: [
          "A canonical beacon header alone does not give you a `stateRoot` to verify a [[state-proof|state proof]] against. The [[execution-payload|execution payload]] header is a field inside the beacon block body, so the link is an SSZ Merkle branch from the beacon block root down to that field, and from there to its `state_root` and `block_hash`. That branch turns a consensus-verified header into the [[trusted-header|trusted header]] an execution proof needs. Gloas, the consensus half of the [[hardfork|Glamsterdam upgrade]] (on Sepolia from 2026-10-06, not yet scheduled for mainnet), takes the payload out of the beacon block: the light client header then carries only `execution_block_hash`, proven from the `parent_block_hash` of the block's payload bid, and the `stateRoot` has to come from an execution header whose hash is checked against it.",
          "The same bridge exists inside the [[evm|EVM]]. Since Dencun, EIP-4788 places the parent beacon block root in the execution [[block-header|header]] as `parentBeaconBlockRoot` and exposes it to contracts, so a contract can verify SSZ proofs about consensus state — validator balances, withdrawal credentials — without an oracle.",
        ],
      },
    ],
    example: {
      title: "Fetching light client updates from a beacon node",
      language: "bash",
      code: "# 1. bootstrap from a block root you obtained out of band (a weak-subjectivity checkpoint)\ncurl -s http://127.0.0.1:5052/eth/v1/beacon/light_client/bootstrap/0x9f2e4c8b…c41d\n\n# 2. walk forward one sync committee period at a time; each update proves the next committee\ncurl -s 'http://127.0.0.1:5052/eth/v1/beacon/light_client/updates?start_period=1865&count=4'\n\n# 3. track the head and the finalized checkpoint between periods\ncurl -s http://127.0.0.1:5052/eth/v1/beacon/light_client/optimistic_update\ncurl -s http://127.0.0.1:5052/eth/v1/beacon/light_client/finality_update",
      note: "Only the bootstrap root is trusted input; every later header is accepted because a committee proven by the previous update signed it.",
    },
    pitfalls: [
      "Treating a sync committee signature as equivalent to finality; committee members are not slashed for signing a header that loses, so the guarantee is weaker.",
      "Bootstrapping from a block root supplied by the same server that serves the updates, which collapses the whole chain of trust to that server.",
      "Stopping at a canonical beacon header; without the SSZ branch to the execution payload header there is no `stateRoot` to verify anything against.",
      "Reusing [[keccak-256|keccak-256]] to check these proofs; consensus Merkleization uses SSZ with SHA-256 throughout.",
    ],
    related: ["sync-committee", "light-client", "trusted-header", "ssz", "state-proof", "beacon-block", "finality", "beacon-api", "weak-subjectivity", "verified-rpc", "generalized-index", "light-client-update"],
    sources: [
      { title: "ethereum/consensus-specs", url: "https://github.com/ethereum/consensus-specs" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "EIP-4788: Beacon block root in the EVM", url: "https://eips.ethereum.org/EIPS/eip-4788" },
    ],
  },
  {
    id: "execution-trace",
    title: "Execution trace",
    category: "proofs",
    aliases: ["callTracer", "prestateTracer", "struct logger", "stateDiff", "vmTrace", "internal calls"],
    summary: "An execution trace is a node's record of running a transaction, step by step or call by call, returned by [[debug-api|debug_traceTransaction]] or [[trace-api|trace_transaction]]; it explains what the [[evm|EVM]] did and is testimony from that node rather than a cryptographic proof.",
    sections: [
      {
        heading: "Two families, several shapes",
        paragraphs: [
          "The [[geth|Geth]]-style `debug_` methods take a tracer argument. `callTracer` returns the call tree — each entry carrying `type`, `from`, `to`, `value`, `input`, `output`, `gas`, `gasUsed`, and an `error` with a revert reason when the call failed — which is the shape most tools want. `prestateTracer` returns every account and storage slot the transaction read, which is the content of a [[witness|witness]] for re-execution minus its proofs. The default struct logger emits one entry per opcode with program counter, opcode, gas, and optionally stack, memory, and storage, and its output for a large transaction runs to hundreds of megabytes.",
          "The Parity-style `trace_` namespace, implemented by [[nethermind|Nethermind]], [[erigon|Erigon]], and Reth, takes a different cut: `trace` is a flat list of actions and results rather than a tree, `vmTrace` is the step-level view, and `stateDiff` reports the before and after of every account the transaction touched. `trace_filter` searches across blocks, which is why [[block-explorer|block explorers]] built on it can list internal transfers per address.",
        ],
      },
      {
        heading: "Evidence, not proof",
        paragraphs: [
          "Nothing in a trace is committed to by the [[block-header|header]]. The header commits to the [[transaction-receipt|receipt]] through `receiptsRoot` and to the resulting [[state|state]] through `stateRoot`; the path taken to get there is not recorded anywhere on chain. Two nodes could hand you different traces for the same transaction and no hash comparison would tell you which is right.",
          "What makes a trace checkable is re-execution, not verification. Run the transaction yourself against the same prior state and compare, or compare two independent [[client-diversity|client implementations]]. That is a real check and a meaningfully different exercise from validating a [[state-proof|state proof]], which needs only one hash function and one [[trusted-header|trusted header]].",
        ],
      },
      {
        heading: "Where it earns its place",
        paragraphs: [
          "Traces answer questions nothing else can. They show why a call [[revert|reverted]] and at which depth, they reconstruct internal value transfers that emit no [[event-log|log]] and so are invisible to an [[indexer|indexer]] using logs alone, they feed [[access-list|access list]] construction, and `prestateTracer` output shows exactly which values a [[witness|witness]] for [[stateless-ethereum|stateless execution]] would have to prove, although, as Geth's documentation points out, it returns only those values and none of the trie nodes that prove them.",
          "The cost is real. Tracing an old transaction needs the state as it was before it, so anything beyond the last few hundred blocks requires an [[archive-node|archive node]]. Providers meter these methods far above `eth_` calls or disable the namespaces entirely, and a node that exposes `debug_` publicly hands anyone a cheap way to consume its CPU; see [[security|RPC security]].",
        ],
      },
    ],
    example: {
      title: "A call tree from debug_traceTransaction",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"debug_traceTransaction\",\"params\":[\"0x5c504ed4…22060\",{\"tracer\":\"callTracer\"}]}\n\n// result (abridged): one outer call, three inner ones\n{\n  \"type\": \"CALL\",\n  \"from\": \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\n  \"to\": \"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D\",\n  \"value\": \"0x0\",\n  \"gas\": \"0x3d090\",\n  \"gasUsed\": \"0x1f4c2\",\n  \"input\": \"0x38ed1739…\",\n  \"calls\": [\n    { \"type\": \"CALL\",       \"to\": \"0xA0b86991…eB48\", \"gasUsed\": \"0x5a39\", \"input\": \"0x23b872dd…\" },\n    { \"type\": \"STATICCALL\", \"to\": \"0xb4e16d01…f5cc\", \"gasUsed\": \"0x9d4\",  \"input\": \"0x0902f1ac\" },\n    { \"type\": \"CALL\",       \"to\": \"0xb4e16d01…f5cc\", \"gasUsed\": \"0xd82f\", \"input\": \"0x022c0d9f…\" }\n  ]\n}",
      note: "None of these inner calls has a transaction hash, a receipt, or a log; the trace is the only place they appear, and it exists because this node re-ran the transaction for you.",
    },
    pitfalls: [
      "Citing a trace as proof of what happened; it is one node's account of execution and is committed to by nothing in the header.",
      "Running the default struct logger on a large transaction, which can return hundreds of megabytes and time the request out.",
      "Assuming `debug_` and `trace_` output can be parsed by the same code; the two families differ in structure and field names.",
      "Planning around traces without checking the endpoint; many providers meter them heavily or do not expose the namespaces at all.",
    ],
    related: ["debug-api", "trace-api", "evm", "state-proof", "indexer", "archive-node", "revert", "transaction-receipt", "block-explorer", "client-diversity", "internal-transaction"],
    sources: [
      { title: "Geth: EVM tracing", url: "https://geth.ethereum.org/docs/developers/evm-tracing" },
      { title: "Nethermind documentation", url: "https://docs.nethermind.io/" },
      { title: "Erigon documentation", url: "https://docs.erigon.tech/" },
    ],
  },
  {
    id: "stateless-ethereum",
    title: "Stateless Ethereum and state trees",
    category: "proofs",
    aliases: ["binary tree", "statelessness", "state tree change"],
    summary: "Stateless Ethereum is the goal of validating a block from a [[witness|witness]] — the [[state|state]] it touches, plus proofs — instead of holding all state; [[merkle-patricia-trie|MPT]] witnesses are far too large, and the commitment structure meant to replace it is still unsettled.",
    sections: [
      {
        heading: "The witness problem",
        paragraphs: [
          "A validator that did not store the state cannot execute a block unless someone ships the touched accounts and slots with it, each accompanied by a proof against `stateRoot`. In the current hexary trie that is ruinously expensive: a block touches thousands of distinct keys, each path is seven to nine nodes deep, and every branch node on the way carries sixteen 32-byte references whether or not they are needed. Witnesses land in the megabytes, which does not fit in a 12-second slot alongside everything else.",
          "So statelessness is not really a change to execution; it is a change to the commitment structure underneath it. That is why the roadmap item people call 'stateless' has always been discussed as a state tree replacement.",
        ],
      },
      {
        heading: "Verkle, then binary",
        paragraphs: [
          "[[verkle-tree|Verkle trees]] were the plan from roughly 2021 through 2024. They replace hashes with vector commitments, so a node commits to all its children in constant size and a proof opens a position without shipping sibling data, shrinking witnesses by roughly an order of magnitude. EIP-6800 described the unified Verkle state layout, and testnets were run.",
          "During 2025 that direction was deprioritized in favour of [[binary-state-tree|binary state trees]], driven largely by how hard Verkle is to prove inside a SNARK and by the wish for a simpler, more conservative structure. Neither is live: mainnet still uses the [[keccak-256|keccak-256]] hexary Merkle-Patricia trie described in the yellow paper, and no [[hardfork|network upgrade]] has shipped a replacement. Treat Verkle as proposed and set aside, binary trees as the current direction, and both as undated.",
        ],
      },
      {
        heading: "What would change for RPC",
        paragraphs: [
          "[[eth-get-proof|eth_getProof]] is the sharp edge. EIP-1186 defines its result in terms of MPT nodes: `accountProof` and `storageProof[].proof` are arrays of [[rlp|RLP]]-encoded trie nodes, and a different tree makes those arrays meaningless rather than merely different. Every verifier — bridge contracts, [[light-client|light clients]], [[verified-rpc|verifying proxies]] — hard-codes the walk described in [[account-proof|account proof]] and [[storage-proof|storage proof]], so a tree change is a coordinated rewrite of all of them, plus a transition period in which both structures have to be served.",
          "The key scheme changes too. Both proposals flatten accounts and storage into one keyspace with a different mapping from [[contract-storage|slot number]] to tree position, so code that computes paths itself, rather than asking the node, breaks independently of the proof format. None of this affects [[eth-call|eth_call]] or [[eth-get-balance|eth_getBalance]], whose results are plain values.",
        ],
      },
    ],
    example: {
      title: "One account lookup under three commitment schemes",
      language: "text",
      code: "hexary Merkle-Patricia trie          live on mainnet today\n  keccak-256; 16 children per node\n  proof = 7-9 whole RLP nodes, each branch shipping 16 x 32-byte references\n  block witness: megabytes\n\nVerkle tree                          proposed 2021-2024, deprioritized in 2025\n  vector commitments; 256 children per node\n  proof = one aggregated opening rather than a pile of siblings\n  block witness: roughly an order of magnitude smaller\n\nbinary state tree                    current direction, not live, undated\n  2 children per node, one 32-byte sibling per level\n  chosen for simplicity and for being cheap to prove inside a SNARK\n\nin all three cases eth_getProof would return something,\nbut only the first matches the array-of-RLP-nodes shape EIP-1186 defines",
      note: "Nothing here is scheduled; the only structure a verifier can rely on today is the hexary trie.",
    },
    pitfalls: [
      "Describing Verkle trees as upcoming or scheduled; they were deprioritized during 2025 in favour of binary trees, and neither has shipped.",
      "Writing proof-verification code that assumes the MPT node shape is permanent, with no version marker on the stored proofs.",
      "Confusing a stateless validator with a [[light-client|light client]]; one executes blocks from a witness, the other follows headers and executes nothing.",
      "Expecting statelessness to remove the need for archive data; witnesses cover the state a block touches, not the chain's history.",
    ],
    related: ["merkle-patricia-trie", "state-proof", "eth-get-proof", "state", "client-storage", "account-proof", "storage-proof", "light-client", "hardfork", "verified-rpc", "witness", "verkle-tree", "binary-state-tree", "real-time-proving"],
    sources: [
      { title: "EIP-6800: Ethereum state using a unified verkle tree", url: "https://eips.ethereum.org/EIPS/eip-6800" },
      { title: "ethereum.org: the roadmap", url: "https://ethereum.org/roadmap/" },
      { title: "EIP-1186: RPC-Method to get Merkle Proofs", url: "https://eips.ethereum.org/EIPS/eip-1186" },
    ],
  },
  {
    id: "verified-rpc",
    title: "Verified RPC",
    category: "proofs",
    aliases: ["nimbus verified proxy", "trust-minimized rpc", "verifying proxy", "light client rpc", "verified eth_call"],
    summary: "Verified RPC is consuming an endpoint without trusting it: a [[light-client|light client]] establishes a [[trusted-header|trusted header]], proofs check the answers that can be proven, and everything else is cross-checked or accepted knowingly.",
    sections: [
      {
        heading: "The shape of the pattern",
        paragraphs: [
          "A verifying proxy runs next to your application and speaks ordinary [[json-rpc|JSON-RPC]] to it, so nothing upstream in your stack changes. Behind it, the proxy follows the chain through [[sync-committee|sync committee]] updates to obtain canonical headers — a [[consensus-proof|consensus proof]] — and then answers each supported request by calling an untrusted execution [[rpc-provider|provider]] and verifying the result against the header it already holds. A balance becomes an [[eth-get-proof|eth_getProof]] call plus a [[state-proof|state proof]] walk; a [[block-hash|block hash]] becomes a comparison.",
          "The bootstrap is the one trusted input: a recent finalized block root, obtained the same way [[checkpoint-sync|checkpoint sync]] obtains one and bounded by the same [[weak-subjectivity|weak subjectivity]] reasoning. After that the proxy accepts headers because signatures say so, not because a server said so.",
        ],
      },
      {
        heading: "The implementations",
        paragraphs: [
          "[[helios|Helios]] is the best known: a Rust light client that syncs from a weak-subjectivity checkpoint, talks to an untrusted execution endpoint, and exposes a local JSON-RPC server for applications. The [[nimbus|Nimbus]] verified proxy does the same job from the Nimbus side, sitting between an application and an untrusted endpoint and verifying what it forwards. [[lodestar|Lodestar]] ships light-client and prover libraries aimed at browsers and JavaScript applications.",
          "Method coverage is partial in all of them and moves between releases, so check the project's current list rather than assuming. Reads that reduce to a state proof are the well-covered core. Anything else is either passed through unverified or unsupported, and which of those two it is matters enormously — an unverified pass-through that looks like a verified answer is worse than no proxy at all.",
        ],
      },
      {
        heading: "What cannot be proven, and what to do instead",
        paragraphs: [
          "Several common calls have no proof available at reasonable cost. [[eth-get-logs|eth_getLogs]] over a range would need a receipts trie rebuilt for every block in it. [[mempool|Pool]] contents and gas suggestions are opinions rather than committed facts. Traces are an [[execution-trace|execution trace]], which nothing commits to. [[eth-call|eth_call]] sits in between: it can be verified only by re-executing it locally against proven state, and [[helios|Helios]] does that for arbitrary calls, taking an [[eth-create-access-list|eth_createAccessList]] result as a hint, proving every account and slot it names with `eth_getProof`, running the call in a local revm, and fetching and proving whatever state the hint missed, at the price of one proof request for every account the call touches.",
          "For those, use the cheap defences instead: pin the [[chain-id|chain id]], compare [[block-hash|block hashes]] from two genuinely independent providers at the same height, prefer the `finalized` [[block-tag|block tag]] for anything irreversible, and keep in mind that agreement between providers is a heuristic. The cost side is real too: an extra process, extra latency per call, a checkpoint to refresh, and a [[beacon-api|beacon endpoint]] to follow.",
        ],
      },
    ],
    example: {
      title: "A verifying proxy in front of an untrusted endpoint",
      language: "bash",
      code: "# the application's view does not change: it is still a JSON-RPC endpoint\n#\n#   app ──JSON-RPC──▶ verifying proxy ──JSON-RPC──▶ https://rpc.example   (untrusted)\n#                            │\n#                            └──light client updates──▶ beacon node       (sync committee)\n\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBalance\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"finalized\"]}' \\\n  http://127.0.0.1:8545\n\n# the cheap fallback where no proof exists: compare two independent providers\nfor url in https://rpc-a.example https://rpc-b.example; do\n  curl -s -X POST -H 'content-type: application/json' \\\n    --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBlockByNumber\",\"params\":[\"0x12d4f1c\",false]}' \\\n    \"$url\" | jq -r '.result.hash'\ndone",
      note: "The first call is verified against a header the proxy proved for itself; the second is a consistency check between two parties, which is a much weaker statement.",
    },
    pitfalls: [
      "Assuming a verifying proxy verifies every method; coverage is partial, and unsupported calls may be forwarded unchanged.",
      "Bootstrapping the light client from a checkpoint given by the same party that serves the data, which returns the whole setup to trusting one server.",
      "Cross-checking two endpoints that resolve to the same upstream or the same provider, which buys agreement without independence.",
      "Presenting provider agreement to users as verification; it detects an isolated liar, and proves nothing about the chain.",
    ],
    related: ["light-client", "trusted-header", "state-proof", "consensus-proof", "eth-get-proof", "rpc-provider", "sync-committee", "head-lag", "nimbus", "block-tag", "helios"],
    sources: [
      { title: "Nimbus guide", url: "https://nimbus.guide/" },
      { title: "Lodestar documentation", url: "https://chainsafe.github.io/lodestar/" },
      { title: "ethereum.org: nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
    ],
  },
  {
    id: "witness",
    title: "Witness",
    category: "proofs",
    aliases: ["execution witness", "stateless witness", "debug_executionWitness", "block witness", "pre-state", "prover input"],
    summary: "A witness is everything needed to re-execute a block without holding the chain's [[state|state]]: the accounts, storage slots and code it touches, the [[merkle-patricia-trie|trie]] nodes that prove them against the parent block's [[state-root|state root]], and the ancestor headers that `BLOCKHASH` can read.",
    sections: [
      {
        heading: "What a block needs from outside itself",
        paragraphs: [
          "Executing a block reads state the block does not carry: each sender's balance and nonce, the bytecode of every contract called, every slot an `SLOAD` touches, and for `BLOCKHASH` the hashes of up to 256 ancestors. A verifier without that state needs them delivered, and needs to know they are genuine. A witness provides both: the values, the trie nodes on the path from the parent's `stateRoot` to each of them, and the parent [[block-header|header]] that pins that root, with older headers linked to it by `parentHash`.",
          "The trie nodes do a second job. After executing, the verifier recomputes the post-state root and compares it with the block's own `stateRoot`, and updating a trie needs the nodes on every changed path, plus, where a deletion collapses a branch, sibling nodes that no read ever touched. Code travels whole and is authenticated by hashing it with [[keccak-256|keccak-256]] and comparing the result with the `codeHash` in the proven account leaf.",
        ],
      },
      {
        heading: "Three forms an RPC caller meets",
        paragraphs: [
          "`prestateTracer`, run through [[debug-api|debug_traceTransaction]] or a block trace, returns the balance, nonce, code and storage of everything a transaction read. It is values only: Geth's documentation likens it to a stateless witness except that it returns no cryptographic proof, so its output is exactly as trustworthy as the node that ran it; see [[execution-trace|execution trace]]. [[eth-get-proof|eth_getProof]] is the opposite case, verifiable but blind: one [[account-proof|account proof]] and its [[storage-proof|storage proofs]] per call, with no knowledge of which keys a block needs.",
          "`debug_executionWitness` does the whole job in one call. The node re-executes the block on its parent's state and returns `state` (every trie node touched, [[rlp|RLP]]-encoded), `codes`, `keys` (the unhashed addresses and slots) and `headers`. [[geth|Geth]], [[reth|Reth]], [[erigon|Erigon]], [[nethermind|Nethermind]] and [[besu|Besu]] all have a method of that name, but it is not in the execution-apis specification and the shapes differ: Geth returns headers as JSON objects and leaves `keys` empty, the others return RLP header bytes, and Besu returns only `state`, `codes` and `headers`, the three fields of the reference witness behind EIP-8025. Because the method needs the parent's state, a [[pruned-node|pruned node]] can build a witness only for recent blocks.",
        ],
      },
      {
        heading: "Who consumes witnesses",
        paragraphs: [
          "[[stateless-ethereum|Stateless validation]] is the protocol-level consumer: a validator that checks each block from its witness instead of a database. Today the heavier users are zero-knowledge provers. A prover for a [[zk-rollup|zkEVM]] or [[real-time-proving|for L1 blocks]] runs the block inside a proving system with no disk and no network, so its host program gathers every input in advance, either with one `debug_executionWitness` call or by tracing the block to find the touched keys and then calling `eth_getProof` at the parent block for each. Zeth documents its dependence on the non-standard method and ships a proxy that builds witnesses from an archive node.",
          "[[fraud-proof|Fault-proof]] programs for [[optimistic-rollup|optimistic rollups]] use the lazy variant. The OP Stack program asks its host for each L2 trie node and each piece of contract code by hash, through a preimage oracle, as execution reaches it. The result is the same witness, fetched on demand and authenticated by hashing.",
        ],
      },
      {
        heading: "Size, and what makes one trustworthy",
        paragraphs: [
          "In the hexary [[merkle-patricia-trie|Merkle-Patricia trie]] every level of a path costs a whole branch node of up to sixteen 32-byte references. EIP-6800 puts the witness for an average account access at close to 3 kB, EIP-7864 estimates one branch in a tree of 2^32 entries at 3,840 bytes, and because code is not chunked, touching one byte of a contract means shipping all of it. That is the case for [[verkle-tree|verkle]] and binary trees.",
          "A witness proves nothing on its own. Each node is authenticated only by hashing up to a root, so everything rests on the parent header, whose hash must equal the `parentHash` of a block you already trust; see [[trusted-header|trusted header]]. Given a trusted root, a dishonest witness can omit data, which makes execution fail, but cannot alter a value without breaking a hash. Given a root taken from the same response, it can say anything.",
        ],
      },
    ],
    example: {
      title: "debug_executionWitness for one block",
      language: "json",
      code: "// request (Reth also takes an optional second parameter, \"legacy\" or \"canonical\")\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"debug_executionWitness\",\"params\":[\"0x18d6a2c\"]}\n\n// result (abridged; the shape Reth, Erigon and Nethermind return)\n{\n  \"state\": [\n    \"0xf90211a0…\",                                   // RLP trie nodes, account and storage tries mixed\n    \"0xf8518080…\",\n    \"0xf8669d32c354…\"\n  ],\n  \"codes\": [\"0x6080604052…\"],                        // bytecode of every contract the block ran\n  \"keys\": [\n    \"0xd8da6bf26964af9d7eed9e03e53415d37aa96045\",     // an unhashed address\n    \"0x0000000000000000000000000000000000000000000000000000000000000009\"  // an unhashed slot\n  ],\n  \"headers\": [\"0xf9026aa0…\"]                          // RLP ancestor headers, including the parent\n}",
      note: "Every `state` entry is authenticated only by hashing up to the parent header's `stateRoot`. Geth serves the same method with headers as JSON objects and an empty `keys`, so a decoder has to know which client answered.",
    },
    pitfalls: [
      "Re-executing a block from `prestateTracer` output as though it were a witness; with no trie nodes, nothing ties those values to a state root.",
      "Parsing `debug_executionWitness` responses from different clients with one decoder; header encoding and the `keys` field differ, and no specification settles them.",
      "Assembling a witness from `eth_getProof` at the parent block and then failing to compute the post-state root, because a deletion that collapses a branch needs a sibling node no proof contained.",
      "Taking the parent header from the same response as the witness, which proves only that the witness agrees with itself.",
    ],
    related: ["stateless-ethereum", "merkle-patricia-trie", "eth-get-proof", "execution-trace", "debug-api", "zk-rollup", "fraud-proof", "verkle-tree", "trusted-header", "validity-proof", "real-time-proving"],
    sources: [
      { title: "Geth: built-in tracers (prestateTracer)", url: "https://geth.ethereum.org/docs/developers/evm-tracing/built-in-tracers" },
      { title: "Reth: debug namespace (debug_executionWitness)", url: "https://reth.rs/jsonrpc/debug" },
      { title: "EIP-8025: Optional Execution Proofs", url: "https://eips.ethereum.org/EIPS/eip-8025" },
      { title: "OP Stack specification: fault proof", url: "https://specs.optimism.io/fault-proof/index.html" },
    ],
  },
  {
    id: "verkle-tree",
    title: "Verkle tree",
    category: "proofs",
    aliases: ["verkle", "EIP-6800", "vector commitment", "Pedersen commitment", "EIP-7612", "EIP-4762", "Bandersnatch", "IPA multiproof"],
    summary: "A verkle tree is a 256-way state tree whose nodes commit to their children with vector commitments rather than hashes, proposed in EIP-6800 to make [[witness|witnesses]] small enough for [[stateless-ethereum|stateless validation]] and since set aside in favour of a binary hash tree.",
    sections: [
      {
        heading: "Commitments instead of hashes",
        paragraphs: [
          "In the [[merkle-patricia-trie|Merkle-Patricia trie]] a parent commits to its children by hashing all of them, so proving one child means shipping the others. A verkle node instead holds a vector commitment to its 256 children, in EIP-6800 a Pedersen commitment over the Bandersnatch elliptic curve, and a proof opens only the positions it needs. The openings along every path a block touches are aggregated into one multiproof built on an inner product argument, which needs no trusted setup.",
          "The payoff is size. EIP-6800 puts the [[witness|witness]] for an average account access at close to 3 kB in today's trie and about 200 bytes in a verkle tree, and puts the hexary worst case for a 15-million-gas block near 18 MB, too large to broadcast safely within a 12-second slot. A verkle proof is checked with elliptic-curve arithmetic rather than [[keccak-256|keccak-256]], so it shares nothing with the walk in [[account-proof|account proof]].",
        ],
      },
      {
        heading: "One tree, 31-byte stems",
        paragraphs: [
          "EIP-6800 also flattens the layout. The state trie whose leaves point to separate per-contract storage tries becomes one key-value tree with 32-byte keys. The first 31 bytes, the stem, come from a Pedersen hash of the [[address|address]] and a tree index; the last byte selects one of 256 values under that stem. An account's version, nonce, balance and code size are packed into one value, its code hash sits beside it, and its first 64 [[contract-storage|storage slots]] and first 128 code chunks share the same stem, so a typical call opens one stem rather than several paths.",
          "Code enters the tree, split into 31-byte chunks, each prefixed with a byte recording how many of its leading bytes are PUSH data so that jump destinations stay unambiguous. The tree also distinguishes a stored zero from an empty position, which the current trie cannot: a present value has 2^128 added to its lower half before it is committed, so zero and absence commit differently, and EIP-4762 adds that once a key holds a value it never returns to empty. [[exclusion-proof|Exclusion proof]] explains why that matters.",
        ],
      },
      {
        heading: "Transition and gas",
        paragraphs: [
          "The state cannot be rewritten in one block. EIP-7612 proposes an overlay: at the fork the Merkle-Patricia trie is frozen, every write goes into a new verkle tree, and reads try the verkle tree first and fall back to the frozen trie. A later step, EIP-7748, moves a fixed number of old entries across per block. Throughout, a value may live in either structure, which is why the proposed verification precompile, EIP-7545, took a version byte naming the proof type.",
          "[[gas|Gas]] changes with it, as specified in EIP-4762. A transaction pays 1,900 gas the first time it touches a stem and 200 for each new value read under it, 3,000 and 500 for the first write to a stem and to a value, and 6,200 to fill a previously empty value. Executing code is charged per 31-byte chunk, which the EIP estimates raises average gas use by 6 to 12 percent, and the per-byte charge for deploying code goes away.",
        ],
      },
      {
        heading: "Status in 2026",
        paragraphs: [
          "Verkle was the plan from roughly 2021 to 2024 and ran on the Kaustinen testnets, but it has not shipped and is not scheduled. EIP-6800, EIP-7612 and EIP-7545 are marked Stagnant, and in March 2026 the consensus specifications removed EIP-6800's feature specs on the grounds that it was unlikely to be included in an upgrade soon. Neither the Glamsterdam nor the Hegotá upgrade lists a state tree change, and mainnet still runs the hexary trie.",
          "The direction moved to [[binary-state-tree|a binary tree, EIP-7864]], still a Draft: two children per node and plain hashing, because elliptic-curve commitments are not quantum-resistant and hash-based binary trees are cheaper to prove inside the SNARKs expected to verify blocks. Its hash function is undecided, with BLAKE3 as a placeholder. It keeps 256-value stems, the EIP-7612 overlay and EIP-4762's access events, and the Ethereum Foundation's 2026 priorities list binary trees and statelessness as long-term goals. Either change replaces what [[eth-get-proof|eth_getProof]] returns; see [[stateless-ethereum|stateless Ethereum]].",
        ],
      },
    ],
    example: {
      title: "Where one account's data lives in the EIP-6800 tree",
      language: "text",
      code: "tree key = stem (31 bytes) || suffix (1 byte)\nstem     = pedersen_hash(address32 || tree_index)[:31]\n\nthe account's own stem (tree_index 0):\n  suffix 0          basic data: version | code_size | nonce | balance, packed\n  suffix 1          code hash\n  suffix 64-127     storage slots 0-63        HEADER_STORAGE_OFFSET = 64\n  suffix 128-255    code chunks 0-127         CODE_OFFSET = 128, 31 bytes of code each\n\neverything else lands on other stems:\n  storage slot s >= 64    tree_index = (256**31 + s) // 256    suffix = s % 256\n  code chunk c            tree_index = (128 + c) // 256        suffix = (128 + c) % 256",
      note: "Slots at or above 64 share a stem in aligned runs of 256, so adjacent slots open one commitment; slots derived with keccak-256, such as Solidity mapping entries, land on unrelated stems.",
    },
    pitfalls: [
      "Describing verkle trees as the next scheduled upgrade; the EIPs are Stagnant and no named upgrade contains a state tree change.",
      "Expecting a verkle proof to be a list of sibling hashes; it is a set of commitments plus one aggregated opening, checked with elliptic-curve arithmetic.",
      "Treating EIP-4762's gas numbers as settled; the EIP is a Draft, and the binary tree proposal reuses its access events without fixing its prices.",
      "Assuming a single proof format during a transition; under the overlay a value may have to be proven from the frozen trie or from the new tree.",
    ],
    related: ["stateless-ethereum", "merkle-patricia-trie", "witness", "eth-get-proof", "exclusion-proof", "gas", "contract-storage", "hardfork", "client-storage", "validity-proof", "binary-state-tree"],
    sources: [
      { title: "EIP-6800: Ethereum state using a unified verkle tree", url: "https://eips.ethereum.org/EIPS/eip-6800" },
      { title: "EIP-7864: Ethereum state using a unified binary tree", url: "https://eips.ethereum.org/EIPS/eip-7864" },
      { title: "consensus-specs #4984: Remove specs for EIP-6800", url: "https://github.com/ethereum/consensus-specs/pull/4984" },
      { title: "Ethereum Foundation: Protocol Priorities Update for 2026", url: "https://blog.ethereum.org/2026/02/18/protocol-priorities-update-2026" },
    ],
  },
  {
    id: "exclusion-proof",
    title: "Exclusion proof",
    category: "proofs",
    aliases: ["proof of absence", "non-membership proof", "non-inclusion proof", "absence proof", "non-existent account", "unset storage slot"],
    summary: "An exclusion proof shows that a key has no entry under a [[state-root|root]]: the [[merkle-patricia-trie|trie]] path for that key, walked down from the root, ends at an empty branch slot or at a node whose stored path diverges from the key, so no value can exist there.",
    sections: [
      {
        heading: "Where the path stops",
        paragraphs: [
          "A key's nibbles fix its path, so an absent key still has a place it would occupy. An exclusion proof is the list of nodes from the root down to where that place turns out to be empty, and in the state and storage tries it can end in three ways. A branch node's child for the next nibble is the empty string `0x80`. A leaf's stored remaining path differs from the key's remaining nibbles, so a different key lives there. Or an extension's stored segment is not a prefix of the remaining nibbles, so the key would have branched off above it.",
          "The walk is verified exactly like an [[inclusion-proof|inclusion proof]], each node hashing to the reference its parent held, and only the final check differs. Reading the stored paths depends on [[hex-prefix-encoding|hex-prefix encoding]], which also tells a verifier whether a two-item node is a leaf or an extension. EIP-1186 describes the branch and leaf endings and does not mention the extension one, which verifiers must handle anyway. An empty trie, whose root is `0x56e81f17…b421`, proves every key absent with an empty proof.",
        ],
      },
      {
        heading: "What eth_getProof returns for absence",
        paragraphs: [
          "For an address with no leaf, [[eth-get-proof|eth_getProof]] returns `balance` `0x0`, `nonce` `0x0` and an `accountProof` that ends in one of those three ways. The two hash fields depend on the client. Geth since v1.13.4, Nethermind and Erigon return `0x000…000` for both `codeHash` and `storageHash`; Besu and Reth by default return the empty-code hash `0xc5d24601…a470` and the empty-trie root `0x56e81f17…b421`, and EIP-1186 does not settle it. Every existing [[account|account]] without code or storage carries those same constants, so only the proof separates an absent account from an empty one.",
          "For a storage key with no leaf, the `storageProof` entry has `value` `0x0` and a proof ending at the divergence; when there is no storage trie to walk, because the account is absent or its storage root is the empty root, Geth returns an empty `proof` array. A slot never written and a slot written back to zero give the same answer, because the [[evm|EVM]] deletes a slot set to zero rather than storing a zero, as [[storage-proof|storage proof]] explains. A contract that needs the distinction must keep its own flag. The [[verkle-tree|verkle]] design would have changed this: there, zero commits differently from absence.",
        ],
      },
      {
        heading: "Verifying one",
        paragraphs: [
          "Start from a root you trust: `stateRoot` from a [[trusted-header|trusted header]] for an account, and for storage the `storageRoot` inside an account leaf you have already proven, never the response's `storageHash` field. Hash the address or slot with [[keccak-256|keccak-256]] to get 64 nibbles. Walk the nodes, checking each hash, remembering that nodes shorter than 32 bytes are inlined in their parent, and consuming nibbles as you go. Then require that the last node shows absence in one of the three ways and that the proof ends there.",
          "That last requirement is where verifiers go wrong. A proof that stops because the next node was left out looks like a path that ran out, but the parent still holds a reference to a real child: the proof is incomplete, and the key may well exist. Accept absence only when the final node itself shows the empty slot or the diverging path. Then treat the account as nonexistent or the slot as zero, and ignore the response's `codeHash` and `storageHash`.",
        ],
      },
      {
        heading: "What absence is used for",
        paragraphs: [
          "A [[bridge|bridge]] or messaging contract proves that a claimed flag or nullifier slot is still zero before it pays out. A [[light-client|light client]] or [[verified-rpc|verifying proxy]] answers `eth_getBalance` for a fresh address with a verified zero rather than an unverifiable one, and an absent account fixes [[eth-get-code|eth_getCode]] as empty just as firmly as a proven leaf would.",
          "The [[ssz|SSZ]] side has no equivalent. Consensus objects have a fixed layout in which every field exists, so what a consensus verifier proves is that a field holds some value, such as a zero hash, at a known [[generalized-index|generalized index]], rather than that a key is missing.",
        ],
      },
    ],
    example: {
      title: "eth_getProof for an address that was never used",
      language: "json",
      code: "// request: an address that has never been used, one storage key\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getProof\",\"params\":[\n  \"0x7c3a9e1f0b2d4c6e8a0f1b3d5c7e9a1b3d5f7e90\",\n  [\"0x0000000000000000000000000000000000000000000000000000000000000000\"],\n  \"0x18d6a2c\"\n]}\n\n// result from Geth (abridged)\n{\n  \"address\": \"0x7c3a9e1f0b2d4c6e8a0f1b3d5c7e9a1b3d5f7e90\",\n  \"balance\": \"0x0\",\n  \"nonce\": \"0x0\",\n  \"codeHash\": \"0x0000000000000000000000000000000000000000000000000000000000000000\",\n  \"storageHash\": \"0x0000000000000000000000000000000000000000000000000000000000000000\",\n  \"accountProof\": [\n    \"0xf90211a0…\",        // branch, root: must hash to the trusted stateRoot\n    \"0xf90211a0…\",        // branches, one nibble each\n    \"0xf90211a0…\",\n    \"0xf90211a0…\",\n    \"0xf90211a0…\",\n    \"0xf90211a0…\",\n    \"0xf8f1a0…8080…\"      // last branch: the slot for the key's next nibble is 0x80, empty\n  ],\n  \"storageProof\": [\n    { \"key\": \"0x0000000000000000000000000000000000000000000000000000000000000000\",\n      \"value\": \"0x0\",\n      \"proof\": [] }       // no account, so no storage trie to walk\n  ]\n}\n\n// Besu and Reth return the same absence with codeHash 0xc5d24601…a470\n// and storageHash 0x56e81f17…b421 instead of the zero hashes",
      note: "The last `accountProof` node, not the zero `balance`, is the evidence: it must hash to the reference its parent held, and its slot for the key's next nibble must be empty.",
    },
    pitfalls: [
      "Treating a proof that runs out of nodes as absence; a missing child node is an incomplete proof, and only an empty slot or a diverging path shows the key is absent.",
      "Deciding that an account exists because `codeHash` and `storageHash` are non-zero; Besu and Reth return the empty constants for accounts that are not in the trie at all.",
      "Expecting a storage proof to tell a slot that was never written from one that was reset to zero; neither has a leaf.",
      "Handling only the branch and leaf endings, which rejects a valid proof whose key diverges inside an extension node.",
    ],
    related: ["account-proof", "storage-proof", "merkle-patricia-trie", "eth-get-proof", "inclusion-proof", "hex-prefix-encoding", "trusted-header", "state-proof", "verkle-tree", "bridge"],
    sources: [
      { title: "EIP-1186: RPC-Method to get Merkle Proofs", url: "https://eips.ethereum.org/EIPS/eip-1186" },
      { title: "go-ethereum #28441: eth_getProof hashes for non-existent accounts", url: "https://github.com/ethereum/go-ethereum/issues/28441" },
      { title: "ethereum.org: Merkle Patricia Trie", url: "https://ethereum.org/developers/docs/data-structures-and-encoding/patricia-merkle-trie/" },
      { title: "EIP-4762: Statelessness gas cost changes", url: "https://eips.ethereum.org/EIPS/eip-4762" },
    ],
  },
  {
    id: "hex-prefix-encoding",
    title: "Hex-prefix encoding",
    category: "proofs",
    aliases: ["HP encoding", "compact encoding", "hex prefix", "nibble path", "leaf flag", "compact_encode"],
    summary: "Hex-prefix encoding is the compact form in which [[merkle-patricia-trie|Merkle-Patricia]] leaf and extension nodes store their path: nibbles packed two to a byte behind a flag nibble that says whether the node is a leaf and whether the path has an odd number of nibbles.",
    sections: [
      {
        heading: "Why a flag nibble",
        paragraphs: [
          "The trie walks keys nibble by nibble, but nodes store bytes, so a path with an odd number of nibbles cannot be packed without saying so. Leaf and extension nodes add a second ambiguity: both are two-item [[rlp|RLP]] lists, `[path, x]`, and nothing else in the list says whether `x` is a stored value or a reference to a child. Hex-prefix encoding settles both with one leading nibble. The Yellow Paper defines it; Geth's source calls it the compact encoding and keeps a separate in-memory form in which a trailing nibble 16 marks a leaf.",
          "Branch nodes carry no path, since their seventeen slots are indexed by the nibble itself, so the encoding appears only in the first item of a two-item node. [[eth-get-proof|eth_getProof]] returns nodes raw, so anyone checking an [[account-proof|account proof]] or a [[storage-proof|storage proof]] by hand decodes it at every leaf and extension, and the per-block tries behind a [[receipt-proof|receipt proof]] use it too.",
        ],
      },
      {
        heading: "Four flags",
        paragraphs: [
          "The high nibble of the first byte is the flag: 0 for an extension with an even number of nibbles, 1 for an extension with an odd number, 2 for a leaf with an even number, 3 for a leaf with an odd number. Bit 1 marks a leaf and bit 0 marks odd length. With an odd length, the low nibble of that first byte is the first nibble of the path; with an even length it is a padding zero and the path starts in the second byte. The remaining nibbles follow two to a byte.",
          "So the extension path f 3 b encodes as `0x1f3b` and f 3 as `0x00f3`, while the leaf paths 0 f 1 c b 8 and f 1 c b 8 encode as `0x200f1cb8` and `0x3f1cb8`, the examples ethereum.org uses. One consequence surprises people: a 56-nibble and a 57-nibble leaf path both occupy 29 bytes, so the byte length does not give the nibble count, and only the flag does.",
        ],
      },
      {
        heading: "Decoding one leaf by hand",
        paragraphs: [
          "Take the account key `keccak256(0xd8dA…6045)`, whose nibbles begin 0 6 e 1 2 0 c 2, and suppose seven branch nodes have consumed 0 6 e 1 2 0 c. The leaf's first item is then an RLP string of 29 bytes, prefix `0x9d`, beginning `0x32`: flag 3, a leaf with an odd path, so the low nibble 2 is the path's first nibble and the next 28 bytes supply the other 56. Seven consumed plus 57 decoded makes 64, and the 57 must equal the key's tail exactly, or the leaf belongs to another account.",
          "Had eight nibbles been consumed, the same leaf would begin `0x20`: a leaf, an even path, a padding zero, then the identical 28 bytes. At an extension the arithmetic is the same, but the result is a segment to consume before following the node's reference. A verifier that misreads the flag does not fail loudly; it walks one nibble out of step and rejects valid proofs. When the decoded path is meant to differ from the key, the node is evidence of absence; see [[exclusion-proof|exclusion proof]].",
        ],
      },
    ],
    example: {
      title: "Decoding the path of one account leaf",
      language: "text",
      code: "key    = keccak256(0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045)\n       = 06e120c 2c3547c60ee47f712d32e5acf38b35d1cc62e23b055a69bb88284c281\n         ^^^^^^^ consumed by seven branch nodes; 57 nibbles remain\n\nleaf   = RLP([ path, value ])\npath   = 9d 32 c3547c60ee47f712d32e5acf38b35d1cc62e23b055a69bb88284c281\n         |  ||\n         |  |+-- low nibble 2: the first path nibble, packed here because the length is odd\n         |  +--- high nibble 3: leaf, odd length\n         +------ RLP prefix 0x9d: a 29-byte string follows\n\ndecoded  2 c 3 5 4 7 c 6 0 e e 4 7 f … 8 4 c 2 8 1        57 nibbles\ncheck    7 consumed + 57 decoded = 64, and the 57 equal the key's last 57 nibbles\n\none level deeper (8 consumed, 56 remain):  9d 20 c3547c60…84c281    flag 2: leaf, even; 0 is padding\nextension paths:                           1f 3b -> f 3 b (odd)     00 f3 -> f 3 (even)",
      note: "Three layers stack here: strip `0x` and decode hex to get bytes, decode RLP to get the node's items, then decode hex-prefix to get nibbles. Only the last is this encoding.",
    },
    pitfalls: [
      "Telling a leaf from an extension by anything other than the flag, such as the node's depth or the length of its second item, which sends the walk the wrong way.",
      "Discarding the low nibble of every first byte; for an odd-length path it is the first nibble of the path.",
      "Counting the flag nibble, or the padding zero, as part of the path, which shifts the whole walk by one nibble.",
      "Inferring the nibble count from the byte length, which cannot separate a 56-nibble path from a 57-nibble one.",
      "Confusing it with the `0x` [[hex-encoding|hex encoding]] of JSON-RPC fields; hex-prefix lives inside RLP-encoded trie nodes, one layer below the JSON text.",
    ],
    related: ["merkle-patricia-trie", "rlp", "account-proof", "storage-proof", "exclusion-proof", "eth-get-proof", "receipt-proof", "state-proof", "hex-encoding", "keccak-256"],
    sources: [
      { title: "ethereum.org: Merkle Patricia Trie", url: "https://ethereum.org/developers/docs/data-structures-and-encoding/patricia-merkle-trie/" },
      { title: "Ethereum Yellow Paper (Appendix C, hex-prefix encoding)", url: "https://ethereum.github.io/yellowpaper/paper.pdf" },
      { title: "go-ethereum: trie/encoding.go", url: "https://github.com/ethereum/go-ethereum/blob/master/trie/encoding.go" },
    ],
  },
  {
    id: "generalized-index",
    title: "Generalized index",
    category: "proofs",
    aliases: ["gindex", "generalised index", "SSZ Merkle proof", "FINALIZED_ROOT_GINDEX", "get_generalized_index", "subtree index", "EIP-7688"],
    summary: "A generalized index is the number that names one node in an [[ssz|SSZ]] Merkle tree, with the root at 1 and the children of node i at 2i and 2i + 1, so a single integer tells a verifier how deep a proven field sits and which side each sibling hash goes on.",
    sections: [
      {
        heading: "Numbering a binary tree",
        paragraphs: [
          "SSZ Merkleization turns every object into a binary tree of 32-byte chunks, and a generalized index numbers its nodes from the top: the root is 1, its children 2 and 3, theirs 4 to 7, and in general the children of i are 2i on the left and 2i + 1 on the right. Written in binary the index is its own map. The leading 1 is the root, the number of bits after it is the depth, and those bits, read from the top, are the turns, 0 for left and 1 for right. 105 is `0b1101001`: six levels down, turning right, left, right, left, left, right.",
          "That is everything a verifier needs besides the data. A branch for index g holds exactly floor(log2 g) sibling hashes; walking up, each step hashes the current node with its sibling, with the current node on the left when g is even and on the right when it is odd, and then halves g. The [[inclusion-proof|inclusion proof]] lesson shows that loop in code, and a [[consensus-proof|consensus proof]] is a chain of such branches. The consensus specs call the position within the deepest level the subtree index: g minus 2 to the power of its depth.",
        ],
      },
      {
        heading: "From a field name to a number",
        paragraphs: [
          "A container with n fields is padded to the next power of two, P leaves, so field i has index P + i. Nesting concatenates: to reach a field inside a field, shift the outer index left by the inner depth and add the inner path. Lists mix their length into their root, so their contents sit under the left child of the list's node. For the Altair beacon state, 24 fields pad to 32 and `finalized_checkpoint`, field 20, is 52; inside a two-field `Checkpoint`, `root` is 3; together 52 times 2 plus 1 gives 105, the spec's `FINALIZED_ROOT_GINDEX`. The two sync committee fields, 22 and 23, are 54 and 55.",
          "The same arithmetic reaches the execution layer. In a Deneb [[beacon-block|beacon block]] body `execution_payload` is 25, and inside the payload `state_root` is field 2 of 17 fields padded to 32, index 34, so 802 from the body root. This is how [[light-client-update|light client updates]] and EIP-4788 contracts prove [[finality|finality]], [[sync-committee|sync committee]] membership, validator records and the [[execution-payload|execution payload]] header against a root they already trust.",
        ],
      },
      {
        heading: "When a fork moves the numbers",
        paragraphs: [
          "Because P depends on the field count, a [[hardfork|fork]] that pushes a container past a power of two deepens its tree and renumbers every field in it. Electra took the beacon state from 28 fields to 37, so `finalized_checkpoint.root` moved from 105 to 169, the sync committees from 54 and 55 to 86 and 87, and every branch through the state grew by one hash. Deneb did the same to the execution payload header, 15 fields to 17, moving `block_hash` within the body from 412 to 812. The light client spec now picks the index by slot, and on-chain verifiers carry both: EigenLayer's `BeaconChainProofs` keeps a Deneb and a Pectra beacon state height.",
          "Anything that hard-codes an index, a branch length or a tree height breaks at the fork, usually as proofs that suddenly fail, and a contract that cannot be upgraded fails for good. EIP-7688, Scheduled for Inclusion in Glamsterdam, is the fix: it moves the main consensus containers to `ProgressiveContainer` (EIP-7495) and `ProgressiveList` (EIP-7916), whose shapes let new fields be appended without moving existing ones. The price is one last renumbering, 735 for `finalized_checkpoint.root` and 2,945 and 2,946 for the sync committees in the Gloas specs, after which positions are meant to hold. Gloas activated on Sepolia on 6 October 2026, at epoch 353024; mainnet is not yet scheduled.",
        ],
      },
    ],
    example: {
      title: "Computing the light client indices",
      language: "js",
      code: "// generalized index: the root is 1, and the children of i are 2i and 2i + 1\nconst nextPow2 = n => 2 ** Math.ceil(Math.log2(n));\nconst depth    = g => Math.floor(Math.log2(g));           // also the number of branch hashes\nconst field    = (i, n) => nextPow2(n) + i;                 // field i of a container with n fields\nconst concat   = (outer, inner) => outer * 2 ** depth(inner) + (inner - 2 ** depth(inner));\n\nconcat(field(20, 24), field(1, 2));   // Altair BeaconState.finalized_checkpoint.root   -> 105\nconcat(field(20, 37), field(1, 2));   // Electra: 37 fields pad to 64 leaves, not 32    -> 169\nfield(22, 24);                        // current_sync_committee -> 54 (86 since Electra)\nconcat(field(9, 12), field(2, 17));   // Deneb body.execution_payload (25) .state_root   -> 802\n\ndepth(105);                           // 6 hashes in an Altair finality branch; depth(169) is 7\n(105).toString(2);                    // \"1101001\": after the leading 1, the turns from the root\n                                      // are right, left, right, left, left, right",
      note: "Hard-coding the outputs of these lines is exactly what broke at Electra; the light client spec now selects each index from the slot of the header being proven.",
    },
    pitfalls: [
      "Hard-coding `FINALIZED_ROOT_GINDEX` as 105 in a [[light-client|light client]] or contract; since Electra the finalized root sits at 169.",
      "Multiplying nested indices instead of concatenating them; 52 and 3 combine to 105, not 156.",
      "Forgetting a list's length mix-in, which puts the proof one level too shallow and on the wrong side.",
      "Taking the depth from the length of the supplied branch rather than from the index, which lets a prover present an inner node, also 32 bytes, as if it were the leaf.",
    ],
    related: ["ssz", "inclusion-proof", "light-client-update", "consensus-proof", "sync-committee", "beacon-block", "execution-payload", "hardfork", "light-client", "finality"],
    sources: [
      { title: "Consensus specs: Altair light client sync protocol", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/altair/light-client/sync-protocol.md" },
      { title: "Consensus specs: Electra light client sync protocol", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/electra/light-client/sync-protocol.md" },
      { title: "ethereum/ssz-specs", url: "https://github.com/ethereum/ssz-specs" },
      { title: "EIP-7688: Forward compatible consensus data structures", url: "https://eips.ethereum.org/EIPS/eip-7688" },
    ],
  },
  {
    id: "light-client-update",
    title: "Light client update",
    category: "proofs",
    aliases: ["LightClientUpdate", "LightClientBootstrap", "finality update", "optimistic update", "light_client/updates", "sync committee period", "Altair light client"],
    summary: "A light client update is the Altair [[ssz|SSZ]] object a beacon node serves so a [[light-client|light client]] can advance: a header attested by the [[sync-committee|sync committee]]'s aggregate signature, plus Merkle branches proving the finalized header and the next committee from that header's state.",
    sections: [
      {
        heading: "What the object carries",
        paragraphs: [
          "`LightClientUpdate` has seven fields. `attested_header` is the header the committee signed, and `sync_aggregate` holds the 512-bit participation field and one aggregate [[bls-signature|BLS signature]], taken from a later block at `signature_slot`. `finalized_header` with `finality_branch` proves the finalized checkpoint recorded in the attested header's state, and `next_sync_committee` with its branch proves the next period's committee the same way. Both branches are checked against `attested_header.beacon.state_root` at a fixed [[generalized-index|generalized index]]: 105 and 55 before Electra, 169 and 87 since.",
          "Two lighter objects cut this down. `LightClientFinalityUpdate` drops the next committee, and `LightClientOptimisticUpdate` keeps only the attested header, the aggregate and the slot, which lets a client follow the head between finalized checkpoints. The starting point is `LightClientBootstrap`, fetched for a block root the client already trusts: the header for that root, the current committee and its branch. The client checks that the header's hash tree root equals the root it asked for, which is why that root must come from outside the server, as [[weak-subjectivity|weak subjectivity]] requires.",
        ],
      },
      {
        heading: "Verifying and applying one",
        paragraphs: [
          "The committee rotates every 256 [[slot-epoch|epochs]], 8,192 slots or about 27 hours, and the signature must come from the committee of the period containing `signature_slot`: the current one, or the next once the client has learned it. Validation checks that `signature_slot` is later than the attested slot, which is no earlier than the finalized slot; verifies both branches; and verifies the aggregate over the attested header using the fork version at `signature_slot` minus one and the network's genesis validators root. An update with a single participant still passes validation.",
          "What an update may change depends on participation. The finalized header and the committee rotation are applied only when at least two thirds of the 512 bits are set, 342 members. The optimistic head moves on less: more than half of the highest participation seen in the current and previous periods. If nothing finalizes for a whole period, the spec allows a forced update from the best one seen, with its attested header standing in for a finalized one, which keeps a client moving through long non-finality at a guarantee weaker than [[finality|finality]].",
        ],
      },
      {
        heading: "From a beacon header to eth_getProof",
        paragraphs: [
          "Since Capella a `LightClientHeader` carries more than the beacon header: `execution`, the [[execution-payload|execution payload]] header of that block, and `execution_branch`, four hashes proving it at index 25 of the block body against `beacon.body_root`. That is the step that turns a verified beacon header into a [[trusted-header|trusted header]] for execution. `execution.state_root` is the root an [[eth-get-proof|eth_getProof]] response must hash up to, and `execution.block_hash` is what to pin the request to. [[verified-rpc|Verifying proxies]] such as [[helios|Helios]] rest on exactly this step.",
          "The Gloas specification, the consensus half of Glamsterdam, changes the shape again. With [[enshrined-pbs|enshrined proposer-builder separation]] the payload leaves the beacon block, so `LightClientHeader` keeps only `execution_block_hash`, proven from the payload bid's `parent_block_hash`, and every state-root lookup gains a step: fetch the execution header, hash it, compare. Gloas activated on Sepolia on 6 October 2026, at epoch 353024, and mainnet is not yet scheduled.",
        ],
      },
      {
        heading: "Serving them",
        paragraphs: [
          "The [[beacon-api|Beacon API]] has four routes under `/eth/v1/beacon/light_client/`: `bootstrap/{block_root}`, `updates?start_period=…&count=…` returning the best update per period and at most 128 per request, `finality_update` and `optimistic_update`, plus `light_client_finality_update` and `light_client_optimistic_update` events on the [[server-sent-events|event stream]]. Each answers JSON with a `version` field, or SSZ bytes when asked, and the object's shape follows the fork of its attested header.",
          "Serving is optional, and the spec asks full nodes to keep this data only for the block-serving window of about five months. Lighthouse serves it unless started with `--disable-light-client-server`, while Prysm serves it only with `--enable-light-client`. A client that has been offline longer than the window, or bootstraps from an older root, may find nothing to fetch.",
        ],
      },
    ],
    example: {
      title: "From a finality update to a pinned eth_getProof",
      language: "bash",
      code: "# 1. the latest finality update (JSON; send Accept: application/octet-stream for SSZ)\ncurl -s http://127.0.0.1:5052/eth/v1/beacon/light_client/finality_update \\\n  | jq '.version, .data.attested_header.beacon.slot, .data.signature_slot,\n        .data.finalized_header.beacon.slot, (.data.finality_branch | length),\n        .data.finalized_header.execution.block_hash,\n        .data.finalized_header.execution.state_root'\n# \"fulu\"  \"15314395\"  \"15314396\"  \"15314304\"  7  \"0x3b7e…41c0\"  \"0x6c1f…a9e2\"\n\n# 2. only after checking the aggregate and both branches: an execution proof pinned to that block\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getProof\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",[],{\"blockHash\":\"0x3b7e…41c0\"}]}' \\\n  https://rpc.example\n# accountProof[0] must hash to 0x6c1f…a9e2, the execution.state_root proven in step 1",
      note: "The beacon node supplies the bytes but not the trust: the update is accepted only after the sync aggregate checks out against a committee the client already holds and both branches hash up to `attested_header.beacon.state_root`.",
    },
    pitfalls: [
      "Bootstrapping from a block root supplied by the same beacon node that serves the updates, which reduces the whole chain of proofs to that node's word.",
      "Treating an optimistic update as final; it carries no finality branch, and the optimistic head advances on a smaller share of the committee.",
      "Keeping pre-Electra branch lengths or indices in a light client, which then rejects every update attested after the fork.",
      "Checking an `eth_getProof` response against `beacon.state_root`, the root of the consensus state, instead of `execution.state_root`.",
    ],
    related: ["sync-committee", "consensus-proof", "light-client", "beacon-api", "generalized-index", "trusted-header", "verified-rpc", "weak-subjectivity", "execution-payload", "helios"],
    sources: [
      { title: "Consensus specs: Altair light client sync protocol", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/altair/light-client/sync-protocol.md" },
      { title: "Consensus specs: Capella light client sync protocol", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/capella/light-client/sync-protocol.md" },
      { title: "Consensus specs: Altair light client full node", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/altair/light-client/full-node.md" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
    ],
  },
  {
    id: "binary-state-tree",
    title: "Binary state tree",
    category: "proofs",
    aliases: ["EIP-7864", "unified binary tree", "binary trie", "stem node", "binary Merkle tree", "state tree conversion"],
    summary: "The binary state tree is EIP-7864's draft replacement for the hexary [[merkle-patricia-trie|Merkle-Patricia trie]] behind Ethereum's [[state-root|state root]]: one key-value tree for accounts, code and storage in which every node has two children and commits by hashing alone, giving smaller proofs than today's trie and, unlike the [[verkle-tree|verkle tree]], no reliance on elliptic curves.",
    sections: [
      {
        heading: "The problem with today's trie",
        paragraphs: [
          "Every block header carries a `stateRoot`, a 32-byte hash committing to all accounts, code and storage. Checking one value against it without holding the [[state|state]], as a [[light-client|light client]], a [[bridge|bridge]] or a [[stateless-ethereum|stateless]] validator must, takes a proof: the sibling hashes on the path up to the root. Today's trie gives each node sixteen children, so each level carries fifteen siblings; EIP-7864 puts one path through 2^32 entries at 3,840 bytes. Code sits outside the trie, so touching one byte of a contract means shipping all of it.",
          "The trie is also slow to prove inside a [[validity-proof|validity proof]], the route to checking blocks without re-executing them that [[real-time-proving|real-time proving]] describes; the EIP blames RLP, slow-to-prove Keccak, one storage trie per contract and code kept outside. For RPC callers a new tree would change what [[eth-get-proof|eth_getProof]] returns and how every verifier checks state.",
        ],
      },
      {
        heading: "Stems, values and two children",
        paragraphs: [
          "The binary tree is one map from keys to 32-byte values. A key's last byte is its sub-index and the rest its stem; the 256 values sharing a stem hang under one stem node, so data read together is proven together. Above the stems each internal node has two children, and the tree is only as deep as needed to tell stems apart: no extension nodes and no [[rlp|RLP]].",
          "An internal node commits as `hash(left || right)`, its two children's hashes joined; a stem node hashes its 256 values pairwise up an eight-level binary tree and hashes the stem with that root. A proof needs k − 1 siblings per level of a k-child tree, and two children minimises the total: for 2^24 entries, 768 bytes per path against 2,880 for a hexary tree. The hash is undecided: the reference code uses BLAKE3, which the EIP says is not final, and Keccak and Poseidon2, under Ethereum Foundation security review, remain candidates.",
        ],
      },
      {
        heading: "Where an account's data lands: settled and open",
        paragraphs: [
          "Part of the layout has held through every revision. Each account has a header stem derived from its [[address|address]]: sub-index 0 packs a version byte, a 3-byte code size, an 8-byte nonce and a 16-byte balance into one value, and sub-index 1 holds the code hash. Code is cut into 31-byte chunks, each stored with a leading byte counting its PUSH data. The first chunks and storage slots share the header stem; the rest go in groups of 256 under other stems derived from the address, so keccak-derived [[contract-storage|mapping slots]] scatter widely.",
          "The exact positions are not settled. A June 2026 revision added a leading type byte, 0 for account headers, 1 for code and 255 for storage, and cut the header stem's share from 128 code chunks and 64 slots to 16 and 4. Elsewhere the text lags: its prose still says 128 and 64, its key functions use undefined names and hash inputs of lengths its hashing rule forbids, and there are no test vectors. The account fields are safe to learn; the exact keys are not.",
        ],
      },
      {
        heading: "Not verkle, not scheduled, and what changes for proofs",
        paragraphs: [
          "Against [[verkle-tree|verkle]], the EIP's case is not proof size, where verkle wins, but cryptography and proving. Verkle relies on elliptic curves, which a large quantum computer would break; the EIP cites NIST's advice to drop them by 2030, expects a hash tree to be Ethereum's last state tree, and argues fast provers make small proofs matter less. EIP-7864 is a Draft that neither of the next two upgrades, Glamsterdam and Hegotá, lists, so mainnet keeps the hexary trie.",
          "Migration would freeze the old trie and start the new tree empty. Writes go to the new tree; under the EIP-7612 overlay, written for verkle and now Stagnant, reads try it first and fall back to the frozen trie. EIP-7748 would then copy a fixed number of old entries per block. That needs the original keys, since today's trie stores `keccak256(address)` and `keccak256(slot)`, so each client must keep raw keys in a flat database, hold a full preimage database from hash to key, or download a prepared one.",
          "[[eth-get-proof|eth_getProof]] as EIP-1186 defines it returns RLP trie nodes, which the new tree does not have, and no replacement is specified. On-chain verifiers fare worst: the [[evm|EVM]] has precompiles for SHA-256 and BLAKE2 compression but none for BLAKE3 or Poseidon2, and the EIP notes that in-EVM proofs of historical state stop working.",
        ],
      },
    ],
    example: {
      title: "One account's keys under the June 2026 constants",
      language: "text",
      code: "address    0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\naddress32  0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045\nH          the tree hash: BLAKE3 in the reference code, not final\n||         joins byte strings; every byte of a key but the last is its stem\n\nkey = type byte || position || sub-index\n  basic data       0x00 || H(address32) || 0x00\n  code hash        0x00 || H(address32) || 0x01\n  code chunk 3     0x00 || H(address32) || 0x07           CODE_OFFSET 4 + 3\n  storage slot 2   0x00 || H(address32) || 0x16           HEADER_STORAGE_OFFSET 20 + 2\n  code chunk 40    0x01 || H(address32 || group) || 0x18                 group 0, (40 - 16) % 256 = 24\n  storage slot 9   0xff || H(address32) || H(address32 || group) || 0x05   group 0, (9 - 4) % 256 = 5\n\nbasic data for an account with nonce 1500, 1 ETH and no code (32 bytes, big-endian):\n  00 | 00000000 | 000000    | 00000000000005dc | 00000000000000000de0b6b3a7640000\n  version  reserved  code_size  nonce              balance in wei\n\none proof path, from the EIP’s table for 2^24 entries:\n  binary (k = 2)    24 siblings x 32 bytes =   768 bytes\n  hexary (k = 16)   90 siblings x 32 bytes = 2,880 bytes",
      note: "The basic-data packing matches the verkle layout and is not in dispute; sub-indices 0x07 and 0x16 come from the constants table that the EIP's own prose contradicts, and the last two keys give `H` inputs its hashing rule does not allow, so treat every key here as illustrative until test vectors exist.",
    },
    pitfalls: [
      "Hard-coding BLAKE3 into a verifier, when the EIP says the hash is not final.",
      "Shipping key derivation from the current text, whose constants, prose and functions disagree.",
      "Expecting one proof format during migration, when under the overlay a value lives in the new tree or the frozen trie.",
    ],
    related: ["verkle-tree", "stateless-ethereum", "merkle-patricia-trie", "witness", "eth-get-proof", "state-proof", "real-time-proving", "contract-storage", "client-storage", "hardfork"],
    sources: [
      { title: "EIP-7864: Ethereum state using a unified binary tree", url: "https://eips.ethereum.org/EIPS/eip-7864" },
      { title: "EIP-7748: State conversion to Verkle Tree", url: "https://eips.ethereum.org/EIPS/eip-7748" },
      { title: "EIP-7612: Verkle state transition via an overlay tree", url: "https://eips.ethereum.org/EIPS/eip-7612" },
      { title: "EIP-8081: Hardfork Meta - Hegotá", url: "https://eips.ethereum.org/EIPS/eip-8081" },
    ],
  },
  {
    id: "real-time-proving",
    title: "Real-time block proving",
    category: "proofs",
    aliases: ["real-time proving", "realtime proving", "L1 zkEVM", "Ethproofs", "zkVM guest", "EIP-8025", "optional execution proofs"],
    summary: "Real-time proving is producing a zero-knowledge proof that an L1 [[block|block]] is valid before its 12-second [[slot-epoch|slot]] ends, so that a validator could check a small proof instead of re-executing the block; the Ethereum Foundation's working definition is at most 10 seconds for 99 percent of mainnet blocks on hardware an individual could own.",
    sections: [
      {
        heading: "Why prove blocks, and how fast",
        paragraphs: [
          "Today every [[validator|validator]] re-executes every block against the full [[state|state]] before it [[attestation|attests]], so validating costs more as the gas limit and the state grow. A zero-knowledge proof breaks that link: here, a succinct certificate that a computation ran correctly, checked in milliseconds however long the computation took, the asymmetry [[validity-proof|validity proofs]] give [[zk-rollup|ZK rollups]]. If one machine, the prover, proves each block, everyone else can check instead of executing, provided the proof is ready within the slot. For RPC, provers are heavy users of witness methods, and a proof-only validator would hold no state to serve calls.",
          "An Ethereum Foundation post in July 2025 set the bar: at most 10 seconds for the 99th percentile of mainnet blocks; on-premises hardware costing at most 100,000 USD and drawing at most 10 kW, so that proving stays possible at home; at least 128 bits of security; and proofs of at most 300 KiB, from open-source code, with no trusted setup, the one-time ceremony some proof systems need, whose leftover secret could forge proofs.",
        ],
      },
      {
        heading: "The guest, and the scoreboard",
        paragraphs: [
          "A zkVM is a proving system for ordinary programs: it runs a program compiled for a small instruction set, usually RISC-V, and outputs a proof of what the run produced. The program is the guest, here an execution client's stateless validation: given the block and a [[witness|witness]], the state data the block touches, re-execute it and check the resulting state root, receipts root and requests. [[geth|Geth]] ships `cmd/keeper`, with a build for the MIPS-based Ziren zkVM, and [[nethermind|Nethermind]] publishes `stateless-validator` guests for ZisK, SP1 and OpenVM.",
          "Ethproofs, at `ethproofs.org`, is the public scoreboard: teams submit proofs of mainnet blocks, and the site records each one's latency against the 10-second line, its hardware, such as 16 consumer GPUs, and its cost. A December 2025 Foundation post reported 99 percent of blocks proven in under 10 seconds on target hardware. Several guests on several zkVMs is deliberate: if validators verify, say, three proofs from different zkVMs, one soundness bug, a flaw that lets a false statement be proven, cannot get an invalid block accepted. It is [[client-diversity|client diversity]] for provers.",
        ],
      },
      {
        heading: "Feeding the prover",
        paragraphs: [
          "The guest has no disk and no network, so a host program gathers its input in advance. EIP-8025 fixes it as a `StatelessInput`: the [[engine-api|Engine API]] `NewPayloadRequest`, meaning the block plus the fields the consensus client sends with it, the [[chain-id|chain id]], and an `ExecutionWitness` of three lists. `state` holds the RLP trie nodes that execution and the post-state root need, `codes` the bytecode read from the pre-state, and `headers` the chain from the parent back to the oldest ancestor `BLOCKHASH` read, at most 256.",
          "Over RPC the witness comes from one `debug_executionWitness` call to a node holding the parent's state, or from [[eth-get-proof|eth_getProof]] at the parent for every touched key, which misses nodes needed to recompute the root after a deletion. A real-time host runs its own execution client beside the prover: hosted endpoints rarely expose [[debug-api|debug_]], and every round trip spends the 10-second budget. An open execution-apis pull request would add `POST /engine/v1/payloads/witness`, returning the validation result and the witness in one Engine API call.",
        ],
      },
      {
        heading: "Verifying instead of re-executing",
        paragraphs: [
          "EIP-8025, Optional Execution Proofs, is the current proposal for L1. Opt-in validators act as provers and broadcast a `SignedExecutionProof` on a new `execution_proof` topic of the consensus layer's [[libp2p-gossip|gossip network]]: up to 400 KiB of proof (the EIP's limit on the wire; the Foundation's 300 KiB is a target for proof systems), a proof type naming the zkVM and guest, and a public input carrying the [[ssz|SSZ]] hash tree root of the whole `NewPayloadRequest`, a `successful_validation` flag, the chain id and a schema id. A verifier accepts it only if the proof checks, `successful_validation` is true and the root matches its own request. The EIP is a Draft, and the Hegotá upgrade's planning list declines it.",
          "In its current text, proof-verifying nodes still re-execute and treat a valid proof as an extra signal; dropping re-execution would take a later EIP. Even then the work would move, not vanish. A prover needs the full execution state plus its GPUs, a verify-only validator would hold no state and could answer no [[eth-call|eth_call]], and [[rpc-provider|RPC providers]] would still run stateful [[full-node|full nodes]]. The EIP warns that if verifiers multiply faster than provers, fewer parties will hold the state.",
        ],
      },
    ],
    example: {
      title: "One slot under EIP-8025, step by step",
      language: "text",
      code: "1. A beacon block for slot S arrives; the beacon node emits a Block event over server-sent events.\n2. The prover fetches the block and builds the NewPayloadRequest: payload, blob versioned hashes,\n   parent_beacon_block_root and execution requests.\n3. Its execution client re-executes the block on the parent state and records every trie node,\n   bytecode and ancestor header it touched: the ExecutionWitness (state, codes, headers).\n4. The host serializes StatelessInput = request + witness + chain_id as prefixed SSZ\n   and hands it to the proof node.\n5. The zkVM runs the guest: it checks the headers form a chain ending at the parent, executes\n   against witness-backed state, and outputs StatelessValidationResult.\n6. The prover signs the ExecutionProof under DOMAIN_EXECUTION_PROOF and gossips it on execution_proof.\n7. A verifying node checks the proof, then:\n     successful_validation    == true\n     new_payload_request_root == hash_tree_root(its own NewPayloadRequest)\n     chain_id                 == 1\n     schema_id                == the schema it expects\n   and, under the current text, still re-executes the block itself.\n\nbudgets: steps 3-6 within 10 s for 99% of blocks (EF target); proof <= 400 KiB on the wire;\n         at most 4 proof types per payload, so at most 1.6 MiB of proofs per slot",
      note: "The checks in step 7 need only the proof and the payload the node already has, while step 3 needs the full parent state and step 5 the proving hardware; the verifier holds state only because the current text keeps re-execution.",
    },
    pitfalls: [
      "Reading a verified proof as evidence that the block is canonical; it binds one `NewPayloadRequest`, and [[fork-choice|fork choice]] still picks the branch.",
      "Accepting a proof because it verifies, without checking `successful_validation` and its request root against your own `NewPayloadRequest`.",
      "Describing EIP-8025 as scheduled or as ending re-execution; it is a Draft, declined for Hegotá, whose verifiers still re-execute.",
    ],
    related: ["witness", "stateless-ethereum", "validity-proof", "zk-rollup", "binary-state-tree", "engine-api", "client-diversity", "debug-api", "execution-payload", "full-node"],
    sources: [
      { title: "Shipping an L1 zkEVM #1: Realtime Proving (Ethereum Foundation)", url: "https://blog.ethereum.org/2025/07/10/realtime-proving" },
      { title: "Shipping an L1 zkEVM #2: The Security Foundations (Ethereum Foundation)", url: "https://blog.ethereum.org/2025/12/18/zkevm-security-foundations" },
      { title: "EIP-8025: Optional Execution Proofs", url: "https://eips.ethereum.org/EIPS/eip-8025" },
      { title: "Ethproofs", url: "https://ethproofs.org/" },
    ],
  },
];
