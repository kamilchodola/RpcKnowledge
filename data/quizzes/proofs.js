// Checkpoint questions for the proofs category. Six per topic; each attempt draws five.
// Hand-written. See the topic lessons in data/proofs.js.

export const quizzes = {
  "state-proof": [
    {
      kind: "detail",
      question: "You verify an eth_getProof response successfully. What have you established?",
      options: [
        "That the block is part of the canonical chain today",
        "That the value is still current as of this moment",
        "That the account had those fields at your header's block",
        "That the node executed that block's transactions correctly",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Which field links the account half of the verification to the storage half?",
      options: [
        "codeHash, which commits to the contract's slots",
        "storageHash, the account leaf's storage root",
        "stateRoot, reused as the root of each storage trie",
        "The key field inside each storageProof entry",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why is eth_getProof the wrong tool for proving that a contract emitted a log?",
      options: [
        "Logs are committed to by no root at all, so nothing can prove them",
        "eth_getProof omits logs for contracts but not for accounts",
        "Logs can be proven only after their block is finalized",
        "Logs live in receipts under receiptsRoot, not in the state trie",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "Your verifier takes stateRoot from a header returned by the same provider that sent the proof. What does a successful check show?",
      options: [
        "That the balance was correct at that block height",
        "Only that the responder is internally consistent",
        "That the provider's node was fully synced at the time",
        "That the header is canonical as well as recent",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "A state proof verifies cleanly. What does it leave for a consensus proof or your own node to establish?",
      options: [
        "That the account leaf hashes up to stateRoot",
        "That storageHash matches the proven account leaf",
        "That the header belongs to the canonical chain",
        "That the slot value decodes from its leaf",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An application proves a balance against latest and caches the verified result for a day. What goes wrong?",
      options: [
        "The proof expires once the next epoch finalizes",
        "The cached proof stops hashing to its stateRoot",
        "The node revokes the proof at the next block",
        "The proof stays valid while the balance moves on",
      ],
      answer: 3,
    },
  ],

  "merkle-patricia-trie": [
    {
      kind: "detail",
      question: "In the Merkle-Patricia Trie, what does a branch node hold?",
      options: [
        "Two child hashes and a value, as in a binary Merkle tree",
        "The full remaining key and its value, with no children",
        "Sixteen child references, one per nibble, plus a value slot",
        "A shared path segment plus one reference to a single child node",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why are state and storage trie keys hashed before use?",
      options: [
        "It shortens the key, since a hash is smaller than an address",
        "It keeps the tree balanced against crafted, deep branches",
        "It hides each address from anyone who sees the proof",
        "It is required before RLP can encode the key at all",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A proof walk reaches a branch node whose child slot for the next nibble is empty. What does that prove?",
      options: [
        "The proof is malformed and must be requested again",
        "The node pruned that subtree and cannot answer",
        "The key exists, but its value is zero",
        "The key is absent from the trie under that root",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "A child node's RLP encoding is 20 bytes long. How does its parent refer to it?",
      options: [
        "By its keccak-256 hash, like every other child",
        "By embedding the node verbatim, with no hash",
        "By its SHA-256 hash, since short nodes use SSZ",
        "By its position in the proof's node array",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What distinguishes the transactions and receipts tries from the state trie?",
      options: [
        "They are rebuilt per block and keyed by RLP of the index",
        "They are keyed by keccak of the hash and kept across blocks",
        "They use SSZ and SHA-256, as consensus data does",
        "They share one root with the state trie in the header",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "You point your Merkle-Patricia proof verifier at a Beacon state proof. What happens?",
      options: [
        "It works, since both layers use RLP and keccak-256",
        "It works once each sibling is RLP-decoded first",
        "It fails only for fields added after the Merge",
        "It fails: consensus data is SSZ hashed with SHA-256",
      ],
      answer: 3,
    },
  ],

  "account-proof": [
    {
      kind: "detail",
      question: "What exactly is the key whose path the accountProof nodes follow?",
      options: [
        "The 20-byte address, left-padded to 32 bytes",
        "keccak256 of the checksummed address string",
        "keccak256 of the 20 raw address bytes",
        "The account's nonce concatenated with its address",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "eth_getProof returns codeHash 0xc5d24601…a470 and storageHash 0x56e81f17…b421 for an address. What does that indicate?",
      options: [
        "The account is a contract whose code self-destructed",
        "The account does not exist; those are the empty constants",
        "The node lacked the trie nodes and returned placeholder values",
        "The account exists, but its storage was pruned away",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why must a verifier compare the leaf's remaining path against the unconsumed key nibbles?",
      options: [
        "Otherwise the RLP decoding of the leaf is ambiguous",
        "The leaf stores its remaining path in reverse order",
        "Otherwise a proof for a neighbouring account would pass",
        "Branch nodes consume no nibbles, so the leaf holds every one",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "eth_getProof returns balance and nonce at the top level and again inside the proven leaf. What separates the two copies?",
      options: [
        "The leaf copies are rounded; the top-level ones are exact",
        "The top-level ones come from a newer block than the leaf",
        "The leaf copies are hashed; the top-level ones are plain",
        "The top-level ones are unverified until they match the leaf",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "Your verifier's walk for an untouched address ends at a branch with an empty slot for the next nibble. How should it treat the result?",
      options: [
        "As a verified proof that the account does not exist",
        "As a failed request to retry on another endpoint",
        "As proof the account exists with a zero balance",
        "As a malformed proof, since walks must end at a leaf",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A verifier hashes the checksummed address string to build the trie key. What happens?",
      options: [
        "It works, since keccak-256 ignores letter case",
        "It walks a path that leads nowhere in the trie",
        "It proves a neighbouring account instead",
        "The node rejects the proof request as malformed",
      ],
      answer: 1,
    },
  ],

  "storage-proof": [
    {
      kind: "detail",
      question: "For a mapping entry, how many keccak-256 hashes stand between the mapping key and the trie path?",
      options: [
        "One: the computed slot number is the trie path itself",
        "Three: the mapping key, the slot, and the value are each hashed",
        "Two: one finds the slot number, one turns it into the path",
        "None: mapping entries sit under the raw key in the trie",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "eth_getProof returns value 0x0 with a proof for a slot. What does a successful verification prove?",
      options: [
        "The slot was never written, since a cleared slot keeps its leaf",
        "The slot is empty, whether never written or reset to zero",
        "The contract has no code deployed at that address",
        "Nothing, because an empty slot cannot be proven",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Which storageHash should the storage proof walk start from?",
      options: [
        "The storageHash field of the eth_getProof response",
        "The stateRoot taken from your trusted header",
        "keccak256 of the contract's 20-byte address",
        "The one decoded from the account leaf you proved",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "To prove a holder's token balance, you pass the holder's address as the storage key. What goes wrong?",
      options: [
        "The node pads the address and finds the entry anyway",
        "The proof fails because keys must be 20 bytes long",
        "You asked for some other slot, not the mapping entry",
        "The node rejects any key that is not a declared slot",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why does comparing a padded 32-byte word with the decoded leaf fail for nearly every non-zero slot?",
      options: [
        "The leaf holds RLP of the value with leading zeros stripped",
        "The leaf stores the value's keccak-256 hash, not the value",
        "The leaf stores the value little-endian, not big-endian",
        "The leaf pads the value to 64 bytes rather than 32",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What separates reading a storageProof value without walking its proof from simply calling eth_getStorageAt?",
      options: [
        "The value field is signed by the node; the other is not",
        "The value field is checked against storageHash for you",
        "eth_getStorageAt reads a cache; the value field reads the trie",
        "Nothing in trust terms; both rest on the node's word",
      ],
      answer: 3,
    },
  ],

  "inclusion-proof": [
    {
      kind: "detail",
      question: "What does a generalized index contribute to an SSZ proof?",
      options: [
        "It is the leaf's hash, which starts the verification walk",
        "It names the leaf's position, so each sibling's side is known",
        "It selects which hash function to use at each tree level",
        "It is the tree's depth, used to size the branch array",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why is a Merkle-Patricia proof larger than a binary Merkle proof over the same number of items?",
      options: [
        "Its keys are longer, because they are hashed first",
        "It repeats the root at every level for checking",
        "Each branch node ships all sixteen of its references",
        "RLP encoding doubles the size of every hash inside it",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "You verify that a transaction is included under a block's transactionsRoot. What is still unproven?",
      options: [
        "That the transaction's bytes match what the root commits to",
        "That the transaction sits at the index you walked",
        "That the member hashes up to the root you started from",
        "That the block is on the canonical chain",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "What distinguishes a consensus-layer SSZ proof from an execution-layer trie proof?",
      options: [
        "keccak over bare siblings, versus SHA-256 over whole RLP nodes",
        "SHA-256 over bare siblings, versus keccak over whole RLP nodes",
        "Hexary branches in SSZ, versus binary branches in the trie",
        "Hashed keys in SSZ, versus unhashed positional keys in the trie",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "You want to show that a field in the beacon state is empty. What can an SSZ proof establish?",
      options: [
        "That the field is absent, via an empty branch slot",
        "That the field holds a particular value, such as zero",
        "That the field's stored path diverges from its key",
        "Nothing, because SSZ trees cannot prove single fields",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What does the security of an inclusion proof rest on?",
      options: [
        "The signature of the endpoint that served it",
        "The finality of the block the root came from",
        "The collision resistance of the hash function",
        "The number of sibling hashes it contains",
      ],
      answer: 2,
    },
  ],

  "receipt-proof": [
    {
      kind: "detail",
      question: "What is the key used in the transactions and receipts tries?",
      options: [
        "keccak256 of the transaction hash",
        "The RLP encoding of the entry's index in the block",
        "The transaction hash itself, unhashed",
        "keccak256 of the block number concatenated with the index",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why is it safe to rebuild the receipts trie from data served by an untrusted endpoint?",
      options: [
        "Receipts are signed by the proposer, so they cannot be altered",
        "The client library re-executes the block to check each receipt",
        "It is not safe; the receipts must come from a trusted node",
        "Any change alters the rebuilt root, so it fails the header check",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "You need to prove to a contract on another chain that a specific log was emitted. Which proof do you build?",
      options: [
        "A storage proof under the emitting contract's storageHash",
        "An account proof for the emitting contract under stateRoot",
        "A receipt proof under receiptsRoot, then read the log",
        "A logsBloom proof under the header's bloom filter",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "You rebuild a block's receipts trie but encode every receipt as plain RLP. What happens?",
      options: [
        "The root matches, since the trie ignores the type byte",
        "The root mismatches for any block with a typed transaction",
        "The root mismatches only for blocks with blob transactions",
        "The trie rejects the entries because the keys are wrong",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What separates logsBloom from a receipt proof as evidence that a log exists?",
      options: [
        "The bloom is signed by the proposer, the proof is not",
        "The bloom covers finalized blocks, the proof only the head",
        "The bloom is exact, but it only records log addresses",
        "The bloom can give false positives and proves nothing alone",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "You need a receipt proof, and your endpoint offers eth_getProof. What do you actually have to do?",
      options: [
        "Fetch every receipt of the block and rebuild the trie",
        "Call eth_getProof with the receipt's index as a key",
        "Call eth_getTransactionReceipt with its proof flag set",
        "Ask the Beacon API for the receipt's SSZ branch",
      ],
      answer: 0,
    },
  ],

  "trusted-header": [
    {
      kind: "cause",
      question: "Why does taking the state root from the proof response defeat the purpose of verifying?",
      options: [
        "Anyone can fabricate a header with a matching trie",
        "The state root inside a proof response arrives truncated",
        "It adds a round trip that makes the check meaningless",
        "The proof then fails, so the mistake corrects itself",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What gives a cryptographic argument for a header's canonicality rather than a heuristic?",
      options: [
        "Three independent providers returning the same block hash",
        "Sync committee signatures checked by a light client",
        "The node answering with requireCanonical set to true",
        "The header chaining back to a checkpoint by parentHash",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "You verify a proof against a canonical header from two years ago. What is wrong with acting on it today?",
      options: [
        "Proofs expire cryptographically after a finality period",
        "Headers that old carry no stateRoot field to check against",
        "Nothing; a canonical header stays canonical forever",
        "It proves what was true then; the value may have changed",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "What is the minimum check to run on any header you are handed?",
      options: [
        "Its parentHash equals the latest block's hash",
        "Its stateRoot matches the one in the proof response",
        "keccak256 of its RLP equals the block hash it claims",
        "Its timestamp falls within twelve seconds of now",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You cross-check block hashes from two RPC URLs that both front the same upstream provider. What have you gained?",
      options: [
        "A proof that the block is on the canonical chain",
        "A heuristic check strong enough to catch one liar",
        "Evidence equal to a sync committee signature",
        "Agreement, but with no independence behind it",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why must a pinned checkpoint be recent rather than years old?",
      options: [
        "Checkpoints expire once their epoch leaves the Beacon API",
        "Old keys can build a long consistent chain from it",
        "Old block hashes are pruned and can no longer be checked",
        "parentHash links break at each hard fork after the checkpoint",
      ],
      answer: 1,
    },
  ],

  "consensus-proof": [
    {
      kind: "cause",
      question: "How does a light client learn the next sync committee without trusting a server?",
      options: [
        "It asks the Beacon API for the validator set and takes the first 512",
        "Each update carries it with an SSZ branch into the attested state",
        "It derives the committee deterministically from the block number",
        "It cannot; an operator must configure it by hand each period",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "Why is a consensus proof no substitute for a state proof?",
      options: [
        "It covers only finalized blocks, while state proofs cover the head",
        "It uses SHA-256, which cannot commit to account balances",
        "It shows which header is canonical, not what an account holds",
        "It proves account state, but not receipts or logs",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What does EIP-4788 make possible on the execution layer?",
      options: [
        "Contracts can call the Beacon API through a precompile",
        "Execution clients can finalize blocks without a beacon node",
        "Light clients can skip following the sync committee",
        "Contracts can check SSZ proofs about consensus state",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A light client holds a canonical beacon header and wants to check an eth_getProof answer. What does it still need?",
      options: [
        "An SSZ branch to the execution payload header's state_root",
        "Nothing; the beacon header's state_root is the execution one",
        "A second sync committee signature over the account itself",
        "The execution client's JWT so it can query the Engine API",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What is the security argument for accepting a header on a sync committee signature?",
      options: [
        "Slashing of at least a third of all staked ETH",
        "An honest majority of a 512-validator sample",
        "The proposer's own signature over the header",
        "Agreement among the light client's network peers",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A light client bootstraps from a root supplied by the same server that serves its updates. What follows?",
      options: [
        "Only the first period is unverified; later ones are fine",
        "The client rejects the bootstrap as circular and halts",
        "Nothing, since every update proves itself from scratch",
        "The whole chain of trust collapses to that one server",
      ],
      answer: 3,
    },
  ],

  "execution-trace": [
    {
      kind: "cause",
      question: "Why is an execution trace not a proof of what happened?",
      options: [
        "It omits gasUsed, which a verifier needs in order to recompute it",
        "It exists only for pending transactions, not mined ones",
        "Nothing in the header commits to it, so no root can check it",
        "The node signs it with a key the caller cannot verify",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Which tracer output doubles as the witness a stateless verifier would need?",
      options: [
        "callTracer, listing the full tree of calls made",
        "prestateTracer, listing every account and slot read",
        "4byteTracer, counting the function selectors called",
        "The struct logger, recording every opcode executed",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "An indexer needs internal ETH transfers for an address. Why can it not get them from logs?",
      options: [
        "Logs from internal calls are kept under a separate root",
        "eth_getLogs filters cannot match the zero address",
        "Internal transfers are logged only when a call reverts",
        "A plain value-carrying call emits no log at all",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "You run debug_traceTransaction with the default struct logger on a large transaction. What should you expect?",
      options: [
        "A compact call tree, since the default is callTracer",
        "Hundreds of megabytes of output, and often a timeout",
        "A list of the accounts and slots the transaction read",
        "An error, because the struct logger needs an archive node",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What distinguishes Parity-style trace output from the output of Geth's callTracer?",
      options: [
        "trace returns a tree; callTracer returns a flat action list",
        "trace is signed by the node; callTracer output is unsigned",
        "trace is a flat list of actions; callTracer returns a tree",
        "trace covers only reverted calls; callTracer covers all",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Two nodes return different traces for the same transaction. How can you tell which one is right?",
      options: [
        "Re-execute it yourself against the same prior state",
        "Hash each trace and compare it with receiptsRoot",
        "Trust the node whose chain has the later finalized block",
        "Check the signature each node attached to its trace",
      ],
      answer: 0,
    },
  ],

  "stateless-ethereum": [
    {
      kind: "cause",
      question: "Why are witnesses impractically large under the current state trie?",
      options: [
        "Account values are stored uncompressed as 32-byte words",
        "Every branch on each path ships sixteen 32-byte references",
        "The trie keeps every historical value beside the current one",
        "Hashing the keys doubles the depth of each path",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What is the current status of Verkle trees on Ethereum?",
      options: [
        "Activated on mainnet as part of the Pectra upgrade",
        "Scheduled for the next network upgrade, with a published date",
        "Prototyped, then set aside in 2025 for binary state trees",
        "Abandoned before any specification was ever written",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "Which RPC method would a replacement of the state tree disrupt most?",
      options: [
        "eth_getBalance, whose value depends on the tree shape",
        "eth_getProof, whose result is arrays of RLP trie nodes",
        "eth_call, which walks the trie while it executes",
        "eth_blockNumber, which is derived from the state root",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What distinguishes a stateless validator from a light client?",
      options: [
        "It follows sync committee headers; a light client runs blocks",
        "It stores all state; a light client stores only recent state",
        "It runs blocks from a witness; a light client runs none",
        "It needs an archive node; a light client needs a full node",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Your bridge verifier computes tree paths itself instead of asking the node. Beyond the proof format, what breaks under a new state tree?",
      options: [
        "The JSON field names that eth_getBalance returns",
        "The chain id it pins for replay protection",
        "The block numbers it reads from each header",
        "The mapping from slot number to tree position",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A team expects stateless execution to let them retire their archive node. Why is that expectation wrong?",
      options: [
        "Witnesses cover the state a block touches, not history",
        "Stateless clients still store every past state root",
        "Witnesses are only valid for finalized blocks",
        "Archive nodes are what produce every block's witness",
      ],
      answer: 0,
    },
  ],

  "verified-rpc": [
    {
      kind: "detail",
      question: "What is the single trusted input a verifying light client proxy needs?",
      options: [
        "An API key for the execution provider it queries",
        "A recent finalized block root to bootstrap from",
        "The chain id of the network it is following",
        "The validator set's public keys, supplied by hand",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can eth_getLogs over a block range not be verified the way eth_getBalance can?",
      options: [
        "Logs are not committed to by any root at all",
        "Range queries are outside the JSON-RPC specification",
        "It would need a receipts trie rebuilt for every block",
        "A light client can fetch only one header at a time",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Two independent providers return the same block hash for a height. What has that established?",
      options: [
        "That the block is canonical, since agreement implies it",
        "That the block has reached the finalized checkpoint",
        "That either provider can now be trusted for proofs",
        "A heuristic against an isolated liar, and nothing more",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A verifying proxy forwards an unsupported method unchanged, and the application treats the answer as verified. What is the result?",
      options: [
        "The proxy verifies it later, once the next header arrives",
        "The provider rejects it because the proxy stripped its key",
        "Unverified data that looks verified, worse than no proxy",
        "The answer is verified by the light client's peers instead",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "Inside a verifying proxy, how does checking eth_getBalance differ from checking a block hash?",
      options: [
        "A balance is a comparison; a hash needs eth_getProof and a walk",
        "A balance needs eth_getProof and a walk; a hash is a comparison",
        "A balance needs a sync committee signature; a hash needs none",
        "A balance is passed through; a hash is re-executed locally",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A proxy wants to verify an eth_call result rather than pass it through. What would that take?",
      options: [
        "An eth_getProof of the called contract's code alone",
        "A sync committee signature over the returned data",
        "Re-executing the call locally against a proven witness",
        "A receipt proof for the call's output under receiptsRoot",
      ],
      answer: 2,
    },
  ],
};
