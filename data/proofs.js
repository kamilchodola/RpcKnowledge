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
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getProof\",\"params\":[\n  \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  [\"0x1c2e8b6c0d9a4e5f7381cba0d2f3e4a5b6c7d8e9f0a1b2c3d4e5f60718293a3f\"],\n  \"0x12d4f1c\"\n]}\n\n// result (node arrays abridged)\n{\n  \"address\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  \"balance\": \"0x0\",\n  \"nonce\": \"0x1\",\n  \"codeHash\": \"0xb0c9e6…41d2\",\n  \"storageHash\": \"0x4f2b7c…91c0\",\n  \"accountProof\": [\"0xf90211a0…\", \"0xf90211a0…\", \"0xf8b18080…\", \"0xf8669d3a…\"],\n  \"storageProof\": [{\n    \"key\": \"0x1c2e8b…a3f4\",\n    \"value\": \"0x3b9aca00\",\n    \"proof\": [\"0xf90211a0…\", \"0xf87180808…\", \"0xe5a0203f…8403b9aca00\"]\n  }]\n}",
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
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
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
          "A branch node is an RLP list of 17 items: sixteen references, one per hex nibble, plus a value slot used when a key ends exactly there. An extension node is a two-item list holding a shared path segment and one reference, collapsing a long non-branching run into one node. A leaf node is also two items: the remaining path and the value. A compact hex-prefix encoding marks the first nibble of a path so a verifier can tell a leaf from an extension and whether the nibble count is odd.",
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
          "Hexary branching keeps the tree shallow — seven to nine levels for a random account — but each branch node carries sixteen 32-byte references, so every proof drags along a lot of sibling data. Each level is a random lookup by hash, which is why [[client-storage|client storage engines]] moved to flat and path-based layouts that answer a value without touching the trie, and why some nodes serve [[eth-get-balance|eth_getBalance]] for an old block but not `eth_getProof` for it. It is also why witnesses for [[stateless-ethereum|stateless execution]] are too large in this structure.",
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
    related: ["state-proof", "state-root", "rlp", "keccak-256", "account-proof", "storage-proof", "receipt-proof", "inclusion-proof", "client-storage", "stateless-ethereum"],
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
    aliases: ["accountProof", "prove an account", "exclusion proof", "account leaf", "empty account"],
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
          "Most [[address|addresses]] have never been touched and have no leaf in the state trie at all. The proof for one of those still verifies: the walk terminates at a branch with an empty slot, or at a node whose path diverges from the key, which proves the key is absent under that root. [[eth-get-proof|eth_getProof]] then reports the empty-account values — `nonce` `0x0`, `balance` `0x0`, `codeHash` `0xc5d24601…a470` for the keccak of empty bytes, and `storageHash` `0x56e81f17…b421` for the root of an empty trie.",
          "Exclusion proofs are what make a bridge or [[light-client|light client]] able to say 'this message was never registered' rather than 'the node did not answer'. They are also why an empty `accountProof` walk should be treated as a successful result and not as an error path.",
        ],
      },
    ],
    example: {
      title: "Verifying accountProof against a trusted stateRoot",
      language: "js",
      code: "const key = keccak256(hexToBytes(address));       // 20 raw bytes in, 32 bytes out\nlet nibbles = toNibbles(key);                    // 64 nibbles of path\nlet expected = trustedHeader.stateRoot;          // NOT the stateRoot from this response\n\nfor (const node of proof.accountProof) {         // RLP-encoded nodes, root first\n  if (node.length >= 32 && keccak256(node) !== expected)\n    throw new Error(\"node does not hash to the reference its parent held\");\n  const items = rlpDecode(node);\n  if (items.length === 17) {                     // branch: 16 children + value slot\n    expected = items[nibbles.shift()];\n  } else {                                       // extension or leaf: [path, ref | value]\n    consume(nibbles, decodeHexPrefix(items[0])); // throws if the stored path diverges\n    expected = items[1];\n  }\n}\n\nconst [nonce, balance, storageRoot, codeHash] = rlpDecode(expected);\nassert(bytesToHex(storageRoot) === proof.storageHash);   // the pivot into storage proofs",
      note: "Simplified: a production verifier also distinguishes leaves from extensions by their hex-prefix flag and handles a path that ends at a branch's value slot.",
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
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
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
          "This is the workhorse of cross-chain systems. A canonical [[bridge|bridge]] proves that a withdrawal message was recorded in the bridge contract's storage on the other chain; an oracle proves a price it published; a governance system proves a token balance at a past block. In each case the storage slot is the contract's public commitment and the proof is what lets a verifier act on it without running a node on the source chain.",
        ],
      },
    ],
    example: {
      title: "Proving one ERC-20 balance slot",
      language: "json",
      code: "// the balances mapping is declared at slot 9, so the entry's slot number is\n// keccak256( pad32(holder) || pad32(9) )   -- Foundry: cast index address 0xd8dA…6045 9\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getProof\",\"params\":[\n  \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n  [\"0x1c2e8b6c0d9a4e5f7381cba0d2f3e4a5b6c7d8e9f0a1b2c3d4e5f60718293a3f\"],\n  \"0x12d4f1c\"\n]}\n\n// result (abridged)\n{\n  \"storageHash\": \"0x4f2b7c…91c0\",\n  \"storageProof\": [{\n    \"key\":   \"0x1c2e8b…a3f4\",\n    \"value\": \"0x3b9aca00\",\n    \"proof\": [\"0xf90211a0…\", \"0xf871808080…\", \"0xe5a0203f…8403b9aca00\"]\n  }]\n}",
      note: "`key` is the slot number you asked for; the path actually walked through the nodes is `keccak256(key)`, and the walk must start from a `storageHash` you proved rather than one you were told.",
    },
    pitfalls: [
      "Passing the mapping's key, such as the holder address, as the storage key instead of the computed `keccak256(paddedKey . paddedSlot)` slot number.",
      "Expecting the trie path to be the slot number itself; the path is the keccak-256 hash of that 32-byte number.",
      "Comparing a padded 32-byte word against the leaf, whose value is RLP with leading zero bytes stripped.",
      "Reading `value` out of the response without walking `proof`, which is trusting the node exactly as much as [[eth-get-storage-at|eth_getStorageAt]] would.",
    ],
    related: ["state-proof", "account-proof", "eth-get-proof", "contract-storage", "merkle-patricia-trie", "eth-get-storage-at", "trusted-header", "bridge"],
    sources: [
      { title: "EIP-1186: RPC-Method to get Merkle Proofs", url: "https://eips.ethereum.org/EIPS/eip-1186" },
      { title: "Solidity: layout of state variables in storage", url: "https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html" },
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
    ],
  },
  {
    id: "inclusion-proof",
    title: "Inclusion proof",
    category: "proofs",
    aliases: ["merkle proof", "membership proof", "merkle branch", "generalized index", "exclusion proof"],
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
          "Consensus-layer proofs are SSZ Merkle branches: a fixed binary tree over a fixed data layout, hashed with SHA-256, where a proof is a flat list of 32-byte siblings plus a generalized index naming the leaf's position. The index is what tells the verifier which side each sibling goes on, and it is stable because the layout is fixed by the spec. [[light-client|Light client]] updates and [[beacon-api|Beacon API]] proofs use this form; see [[consensus-proof|consensus proof]].",
        ],
      },
      {
        heading: "Inclusion, exclusion, and limits",
        paragraphs: [
          "The same node path also proves absence. In a trie, a walk that ends at an empty branch slot or at a node whose path diverges is an exclusion proof, and it is verified exactly like an inclusion proof. In a fixed-layout SSZ tree there is no absence to prove: every field exists, so the equivalent statement is that a field holds a particular value, such as zero.",
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
      { title: "Execution APIs documentation", url: "https://ethereum.github.io/execution-apis/api-documentation/" },
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
    aliases: ["light client update", "sync committee signature", "Altair light client", "canonicality proof", "BLS aggregate"],
    summary: "A consensus proof is evidence that a [[beacon-block|beacon header]] is canonical — a [[sync-committee|sync committee]] aggregate signature over it, packaged as a light client update — from which an [[ssz|SSZ]] branch reaches the execution [[block-header|header]] and its `stateRoot`.",
    sections: [
      {
        heading: "What the sync committee buys",
        paragraphs: [
          "Following [[proof-of-stake|proof of stake]] properly means tracking hundreds of thousands of validators. The Altair sync committee exists so that a [[light-client|light client]] does not have to: 512 validators are selected for a period of 256 [[slot-epoch|epochs]], roughly 27 hours, and sign the headers they see with an aggregatable BLS signature. A verifier that knows the current committee's public keys can check one aggregate signature and accept a header, and the light client spec requires more than two thirds of the committee — at least 342 of the 512 — to have signed.",
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
          "A canonical beacon header alone does not give you a `stateRoot` to verify a [[state-proof|state proof]] against. The [[execution-payload|execution payload]] header is a field inside the beacon block body, so the link is an SSZ Merkle branch from the beacon block root down to that field, and from there to its `state_root` and `block_hash`. That branch turns a consensus-verified header into the [[trusted-header|trusted header]] an execution proof needs.",
          "The same bridge exists inside the [[evm|EVM]]. Since Dencun, EIP-4788 places the parent beacon block root in the execution [[block-header|header]] as `parentBeaconBlockRoot` and exposes it to contracts, so a contract can verify SSZ proofs about consensus state — validator balances, withdrawal credentials — without an oracle.",
        ],
      },
    ],
    example: {
      title: "Fetching light client updates from a beacon node",
      language: "bash",
      code: "# 1. bootstrap from a block root you obtained out of band (a weak-subjectivity checkpoint)\ncurl -s http://127.0.0.1:5052/eth/v1/beacon/light_client/bootstrap/0x9f2e4c8b…c41d\n\n# 2. walk forward one sync committee period at a time; each update proves the next committee\ncurl -s 'http://127.0.0.1:5052/eth/v1/beacon/light_client/updates?start_period=1180&count=4'\n\n# 3. track the head and the finalized checkpoint between periods\ncurl -s http://127.0.0.1:5052/eth/v1/beacon/light_client/optimistic_update\ncurl -s http://127.0.0.1:5052/eth/v1/beacon/light_client/finality_update",
      note: "Only the bootstrap root is trusted input; every later header is accepted because a committee proven by the previous update signed it.",
    },
    pitfalls: [
      "Treating a sync committee signature as equivalent to finality; committee members are not slashed for signing a header that loses, so the guarantee is weaker.",
      "Bootstrapping from a block root supplied by the same server that serves the updates, which collapses the whole chain of trust to that server.",
      "Stopping at a canonical beacon header; without the SSZ branch to the execution payload header there is no `stateRoot` to verify anything against.",
      "Reusing [[keccak-256|keccak-256]] to check these proofs; consensus Merkleization uses SSZ with SHA-256 throughout.",
    ],
    related: ["sync-committee", "light-client", "trusted-header", "ssz", "state-proof", "beacon-block", "finality", "beacon-api", "weak-subjectivity", "verified-rpc"],
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
          "The [[geth|Geth]]-style `debug_` methods take a tracer argument. `callTracer` returns the call tree — each entry carrying `type`, `from`, `to`, `value`, `input`, `output`, `gas`, `gasUsed`, and an `error` with a revert reason when the call failed — which is the shape most tools want. `prestateTracer` returns every account and storage slot the transaction read, which is a witness for re-execution. The default struct logger emits one entry per opcode with program counter, opcode, gas, and optionally stack, memory, and storage, and its output for a large transaction runs to hundreds of megabytes.",
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
          "Traces answer questions nothing else can. They show why a call [[revert|reverted]] and at which depth, they reconstruct internal value transfers that emit no [[event-log|log]] and so are invisible to an [[indexer|indexer]] using logs alone, they feed [[access-list|access list]] construction, and `prestateTracer` output is precisely the witness that [[stateless-ethereum|stateless execution]] would ship with a block.",
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
    related: ["debug-api", "trace-api", "evm", "state-proof", "indexer", "archive-node", "revert", "transaction-receipt", "block-explorer", "client-diversity"],
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
    aliases: ["verkle", "binary tree", "witness", "statelessness", "state tree change", "EIP-6800"],
    summary: "Stateless Ethereum is the goal of validating a block from a witness — the [[state|state]] it touches, plus proofs — instead of holding all state; [[merkle-patricia-trie|MPT]] witnesses are far too large, and the commitment structure meant to replace it is still unsettled.",
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
          "Verkle trees were the plan from roughly 2021 through 2024. They replace hashes with vector commitments, so a node commits to all its children in constant size and a proof opens a position without shipping sibling data, shrinking witnesses by roughly an order of magnitude. EIP-6800 described the unified Verkle state layout, and testnets were run.",
          "During 2025 that direction was deprioritized in favour of binary state trees, driven largely by how hard Verkle is to prove inside a SNARK and by the wish for a simpler, more conservative structure. Neither is live: mainnet still uses the [[keccak-256|keccak-256]] hexary Merkle-Patricia trie described in the yellow paper, and no [[hardfork|network upgrade]] has shipped a replacement. Treat Verkle as proposed and set aside, binary trees as the current direction, and both as undated.",
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
    related: ["merkle-patricia-trie", "state-proof", "eth-get-proof", "state", "client-storage", "account-proof", "storage-proof", "light-client", "hardfork", "verified-rpc"],
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
    aliases: ["helios", "nimbus verified proxy", "trust-minimized rpc", "verifying proxy", "light client rpc"],
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
          "Helios is the best known: a Rust light client that syncs from a weak-subjectivity checkpoint, talks to an untrusted execution endpoint, and exposes a local JSON-RPC server for applications. The [[nimbus|Nimbus]] verified proxy does the same job from the Nimbus side, sitting between an application and an untrusted endpoint and verifying what it forwards. [[lodestar|Lodestar]] ships light-client and prover libraries aimed at browsers and JavaScript applications.",
          "Method coverage is partial in all of them and moves between releases, so check the project's current list rather than assuming. Reads that reduce to a state proof are the well-covered core. Anything else is either passed through unverified or unsupported, and which of those two it is matters enormously — an unverified pass-through that looks like a verified answer is worse than no proxy at all.",
        ],
      },
      {
        heading: "What cannot be proven, and what to do instead",
        paragraphs: [
          "Several common calls have no proof available at reasonable cost. [[eth-get-logs|eth_getLogs]] over a range would need a receipts trie rebuilt for every block in it. [[mempool|Pool]] contents and gas suggestions are opinions rather than committed facts. [[eth-call|eth_call]] can only be verified by re-executing locally against a proven witness, which some provers do for narrow cases and none do in general. Traces are an [[execution-trace|execution trace]], which nothing commits to.",
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
    related: ["light-client", "trusted-header", "state-proof", "consensus-proof", "eth-get-proof", "rpc-provider", "sync-committee", "head-lag", "nimbus", "block-tag"],
    sources: [
      { title: "Nimbus guide", url: "https://nimbus.guide/" },
      { title: "Lodestar documentation", url: "https://chainsafe.github.io/lodestar/" },
      { title: "ethereum.org: nodes and clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/" },
    ],
  },
];
