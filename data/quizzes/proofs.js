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
      question: "eth_getProof returns the empty-code hash as codeHash and the empty-trie root as storageHash for an address. What do those two values tell you?",
      options: [
        "The account does not exist, since those are the empty constants",
        "The node lacked the trie nodes and returned placeholder values",
        "Nothing about existence; a funded EOA returns exactly the same",
        "The account exists, but its code and storage were pruned away",
      ],
      answer: 2,
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
      question: "What does prestateTracer output lack that a stateless verifier's witness must carry?",
      options: [
        "The values of the accounts and slots that the transaction read",
        "The trie nodes that prove each value against the state root",
        "The call tree that shows which frame read each account or slot",
        "The gas that each call frame used, for the verifier to re-meter",
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
        "Re-executing the call locally against proven state",
        "A receipt proof for the call's output under receiptsRoot",
      ],
      answer: 2,
    },
  ],

  "witness": [
    {
      kind: "scenario",
      question: "A prover is handed prestateTracer output for a block and re-executes the block from it. What does a successful run tell it about those input values?",
      options: [
        "That they match the parent state root the tracer read from",
        "That they are complete, since the tracer includes every header",
        "Nothing beyond the word of the node that ran the tracer",
        "That they are final, since tracers only run on finalized blocks",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Besides trie nodes and contract code, what does a debug_executionWitness response include so a verifier can check BLOCKHASH results?",
      options: [
        "Ancestor block headers that chain back by parentHash",
        "A list of block hashes signed by the serving node",
        "The beacon block roots of the last 256 slots",
        "The receipts of every block BLOCKHASH can reach",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why is a Merkle-Patricia witness so much larger than the values it carries?",
      options: [
        "Each value is repeated once for every transaction that reads it",
        "Every node is shipped twice, once as RLP and once as JSON",
        "Every account proof must include the account's whole storage trie",
        "Each level of a path ships a branch node of up to sixteen hashes",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "You call debug_executionWitness for a two-year-old block on a pruned node. What should you expect?",
      options: [
        "A witness rebuilt from receipts, which pruned nodes keep for every block",
        "A smaller witness, because older blocks touched fewer accounts",
        "An error, because the node no longer holds that block's parent state",
        "A witness with headers only, since state is left out for old blocks",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does eth_getProof differ from debug_executionWitness as a source of inputs for re-executing a block?",
      options: [
        "It returns unverified values, while the witness method returns proofs",
        "It is verifiable per key but cannot say which keys a block needs",
        "It covers a whole block at once, while the witness covers one account",
        "It includes contract code, while the witness method returns only hashes",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A verifier hashes every witness node correctly but takes the parent header from the same response. What is it actually trusting?",
      options: [
        "The server that sent it, since a made-up root verifies too",
        "Nobody, because hashing every node already proves canonicality",
        "The sync committee, which signs each execution witness",
        "The block builder, who commits to the witness in the header",
      ],
      answer: 0,
    },
  ],

  "verkle-tree": [
    {
      kind: "detail",
      question: "In EIP-6800, how does a verkle node commit to its 256 children?",
      options: [
        "With a keccak-256 hash of the concatenated child references",
        "With a Pedersen vector commitment over the Bandersnatch curve",
        "With a SHA-256 Merkle root over the children, as SSZ does",
        "With a KZG commitment that reuses the blob trusted setup",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why do verkle proofs make witnesses smaller than hexary trie proofs?",
      options: [
        "Values are compressed with RLP before they are committed",
        "Proofs cover only accounts and leave storage out of the witness",
        "Nodes use a faster hash, so fewer of them need to be included",
        "An opening proves a position without shipping the sibling data",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A roadmap slide lists verkle trees as Ethereum's next state upgrade. What is the accurate status in 2026?",
      options: [
        "Set aside: the EIPs are Stagnant and a binary tree is the direction",
        "Scheduled for Glamsterdam, with Sepolia activation in October",
        "Live on mainnet since Pectra, with proofs served by eth_getProof",
        "Scheduled for Hegotá, pending a final choice of commitment curve",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "How does the EIP-7864 binary tree differ from the verkle design it builds on?",
      options: [
        "It keeps a separate storage trie for each contract, unlike verkle",
        "It keeps RLP-encoded nodes so that eth_getProof stays unchanged",
        "It commits with hashes rather than elliptic-curve vector commitments",
        "It keeps width 256 but swaps Pedersen for KZG commitments",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "Under the EIP-7612 overlay, what happens when a block reads an account nobody has written since the fork?",
      options: [
        "The read fails until conversion has moved that account across",
        "The read misses the verkle tree and falls back to the frozen trie",
        "The read returns empty, because the old trie is deleted at the fork",
        "The read copies the account's entire storage into the new tree",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What can the verkle design distinguish that the current Merkle-Patricia trie cannot?",
      options: [
        "A contract account from an externally owned account",
        "A finalized value from one written in a pending block",
        "A storage slot from a code chunk that shares its key",
        "A stored zero from a position that was never written",
      ],
      answer: 3,
    },
  ],

  "exclusion-proof": [
    {
      kind: "detail",
      question: "Which of these endings of a trie walk proves that the key is absent?",
      options: [
        "A branch whose seventeenth value slot is empty at that depth",
        "A leaf whose value decodes to the RLP empty string 0x80",
        "An extension whose segment is not a prefix of the remaining key",
        "A final node whose encoding is shorter than 32 bytes",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Your verifier's walk for a slot reaches a branch whose child for the next nibble is a hash, and the proof has no more nodes. How should it classify the result?",
      options: [
        "As an incomplete proof, since a real child is referenced",
        "As proof of absence, since the path ended at a branch",
        "As proof the slot holds zero, since no leaf was supplied",
        "As a valid proof of the value stored in the branch itself",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "An application decides an address exists whenever eth_getProof returns non-zero codeHash and storageHash. What goes wrong?",
      options: [
        "Geth reports zero hashes for every account without contract code",
        "Besu and Reth report the empty constants for absent accounts too",
        "The two hashes change every block, so existence flips between calls",
        "Non-zero hashes appear only for contracts, so every EOA looks absent",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "For a storage key of an account that exists, Geth answers value 0x0 with an empty proof array. When is that a valid proof that the slot is unset?",
      options: [
        "When the slot number is below 64 and sits in the account header",
        "When the block is finalized and its old trie nodes were pruned",
        "When the proven account leaf's storage root is the empty-trie root",
        "When the account's codeHash equals the empty-code hash",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why can't a storage proof tell a slot that was never written from one that was reset to zero?",
      options: [
        "Zero values are stored, but their proof nodes are pruned early",
        "eth_getProof leaves out the proof for any slot whose value is zero",
        "Both leaves hash alike, since RLP encodes zero as the byte 0x80",
        "Writing zero deletes the slot's leaf, so both cases are absent",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does verifying an exclusion proof differ from verifying an inclusion proof in the same trie?",
      options: [
        "Only the last check differs: the final node must show the gap",
        "It uses a different hash function for the empty positions",
        "It starts from the leaf and hashes upward toward the root",
        "It needs no trusted root, because absence cannot be forged",
      ],
      answer: 0,
    },
  ],

  "hex-prefix-encoding": [
    {
      kind: "detail",
      question: "A two-item trie node's path item begins with the byte 0x3a. What does that tell a verifier?",
      options: [
        "Extension, odd length, and a is the first path nibble",
        "Leaf, odd length, and a is the first path nibble",
        "Leaf, even length, and the a nibble is only padding",
        "Extension, even length, and the path begins with 3",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why do leaf and extension nodes need a flag at all?",
      options: [
        "RLP cannot encode strings longer than 55 bytes without one",
        "A node's keccak-256 hash must begin with a type marker",
        "Branch nodes use it to find their seventeenth value slot",
        "Both are two-item lists, so nothing else says value or child",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does hex-prefix encoding relate to the 0x-prefixed hex strings of JSON-RPC?",
      options: [
        "It is the same format, applied to trie keys instead of values",
        "It is JSON-RPC hex with leading zero nibbles stripped away",
        "It is unrelated: a binary flag inside trie nodes, not text",
        "It is JSON-RPC hex with an extra 0x marking odd lengths",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A leaf's path item is 29 bytes long. What does that tell you about its nibble count?",
      options: [
        "It is 58 nibbles, two per byte, with no flag",
        "It is 56 or 57, and only the flag says which",
        "It is 57 nibbles, since leaf paths are odd",
        "It is 56 nibbles, since byte one is padding",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A verifier drops the low nibble of every path's first byte. Which proofs does it misread?",
      options: [
        "Those with a leaf or extension path of odd length",
        "Only storage proofs, whose slot keys are not hashed",
        "Only proofs whose nodes are shorter than 32 bytes",
        "None, because that nibble is always a padding zero",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "After seven branch nodes, an account proof's leaf decodes to a 57-nibble path. What must the verifier check next?",
      options: [
        "That the path's keccak-256 hash equals the account address",
        "That the path is shorter than the depth already walked",
        "That the flag nibble matches the branch's value slot",
        "That the 57 nibbles equal the key's unconsumed tail",
      ],
      answer: 3,
    },
  ],

  "generalized-index": [
    {
      kind: "detail",
      question: "In SSZ generalized-index numbering, which nodes are the children of node 26?",
      options: [
        "Nodes 27 and 28",
        "Nodes 13 and 14",
        "Nodes 52 and 53",
        "Nodes 51 and 52",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A light client hard-codes FINALIZED_ROOT_GINDEX as 105 and keeps running after Electra. What happens?",
      options: [
        "Finality branches stop verifying, as the root now sits at 169",
        "Nothing, because generalized indices are fixed at genesis",
        "It verifies updates, but only those signed by the old committee",
        "It accepts updates, but with finality delayed by one period",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why did Electra change the generalized index of finalized_checkpoint.root?",
      options: [
        "The Checkpoint container gained an extra slot field",
        "The beacon state passed 32 fields, adding a tree level",
        "SSZ switched the beacon state to a different hash function",
        "Fields were reordered so that the new ones came first",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A verifier combines the nested indices 52 and 3 by multiplying them. What goes wrong?",
      options: [
        "Nothing, since multiplying and concatenating agree here",
        "It reaches the right node but hashes it on the wrong side",
        "Its branch comes out one hash too long to verify",
        "It targets node 156 instead of 105, a different node",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "From a proof verifier's point of view, how does EIP-7688's ProgressiveContainer differ from today's SSZ Container?",
      options: [
        "Appending fields leaves existing generalized indices in place",
        "It hashes with keccak-256 so execution tools can verify it",
        "It drops Merkleization, so fields are proven by byte offset",
        "It pads every container to 64 leaves, whatever it holds",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why should a verifier take the branch depth from the generalized index rather than from the number of hashes supplied?",
      options: [
        "Branch lengths change with the validator count each epoch",
        "Provers pad every branch to 64 hashes for alignment",
        "An inner node is 32 bytes like a leaf, so depth identifies it",
        "SSZ branches arrive sorted by hash, so their length is unreliable",
      ],
      answer: 2,
    },
  ],

  "light-client-update": [
    {
      kind: "scenario",
      question: "A light client bootstraps from a block root returned by the same beacon node that serves its updates. What has it verified?",
      options: [
        "That the chain is canonical from that root onwards",
        "That the root is finalized, since bootstraps require it",
        "That the current committee was selected honestly",
        "That the node's answers agree with one another",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "Which field of a Capella-or-later LightClientHeader holds the root an eth_getProof response must hash up to?",
      options: [
        "beacon.state_root, the root of the beacon state",
        "execution.state_root, proven against the body root",
        "beacon.body_root, which commits to all account state",
        "The last hash of finality_branch, the state root",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does a LightClientUpdate carry next_sync_committee together with a Merkle branch?",
      options: [
        "So the client can learn the next signers without trusting the server",
        "So the server can prove that the committee members are slashable",
        "So the committee's aggregate can be verified without BLS keys",
        "So the client can skip verifying the attested header's signature",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "How does a LightClientOptimisticUpdate differ from a LightClientFinalityUpdate?",
      options: [
        "It is signed by the next committee rather than the current one",
        "It carries the next committee, which finality updates omit",
        "It has no finalized header or branch, only the attested head",
        "It proves execution state, while finality updates prove beacon state",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A light client that has been offline for eight months tries to resume from its last stored committee. Why might it find nothing to fetch?",
      options: [
        "Sync committees older than one period cannot be verified",
        "Updates expire from the API once their slot is finalized",
        "Bootstrap roots are deleted at each committee rotation",
        "Servers are asked to keep roughly five months of updates",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "An update arrives with 300 of the 512 sync committee bits set. What can it change in a client that follows the spec?",
      options: [
        "The finalized header, but not the optimistic head",
        "The optimistic head, but not the finalized header",
        "Nothing, since updates under 342 bits are invalid",
        "Both, since any participation above half suffices",
      ],
      answer: 1,
    },
  ],

  "binary-state-tree": [
    {
      kind: "detail",
      question: "In the June 2026 draft of EIP-7864, what sits at sub-index 0 under an account's header stem?",
      options: [
        "The code hash of the account's deployed contract bytecode",
        "Storage slot 0 of the account's own contract storage",
        "The first 31-byte chunk of the account's deployed code",
        "Version, code size, nonce and balance packed together",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why does EIP-7864 give each node two children rather than sixteen?",
      options: [
        "Two children let each node keep the existing RLP encoding",
        "Proofs carry k minus 1 siblings per level, a cost least at 2",
        "Binary nodes can use elliptic-curve commitments with no setup",
        "Sixteen children made the state too deep to store on disk",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What is the main cryptographic difference between EIP-7864 and the verkle design it displaced?",
      options: [
        "It commits with hashes alone, so it relies on no elliptic curve",
        "It commits with Pedersen vectors, so proofs open many children",
        "It commits with Keccak alone, so existing verifiers keep working",
        "It commits with KZG polynomials, so proofs need a trusted setup",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A bridge team plans to verify binary-tree state proofs inside a Solidity contract once EIP-7864 ships. What obstacle does it face?",
      options: [
        "The EVM cannot read any storage written before the tree changes",
        "Binary proofs are larger than hexary proofs for every account",
        "The EVM has no precompile for BLAKE3 or Poseidon2 hashing",
        "The new tree removes the stateRoot field from block headers",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "During the overlay transition that EIP-7864 relies on, where does a state read look first?",
      options: [
        "In the frozen hexary trie, then in the new binary tree",
        "In whichever tree the account was last written to",
        "In both trees at once, comparing their two values",
        "In the new binary tree, then in the frozen hexary trie",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A client keeps its flat state keyed only by keccak256 of each address and slot. What does an EIP-7748 conversion require of it?",
      options: [
        "A full resync from genesis under the new tree's key scheme",
        "A Pedersen hash of every key before it enters the new tree",
        "A preimage database mapping those hashes back to raw keys",
        "A trusted header for every block since the fork activated",
      ],
      answer: 2,
    },
  ],

  "real-time-proving": [
    {
      kind: "detail",
      question: "What latency does the Ethereum Foundation's working definition of real-time proving set?",
      options: [
        "At most 12 seconds for every mainnet block, with no exceptions",
        "At most 10 seconds for 99 percent of mainnet blocks",
        "At most 4 seconds, so proofs arrive before attestations",
        "At most one epoch, so proofs arrive before finality",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A verifying node receives a proof that checks cryptographically, but its public input has successful_validation set to false. What should it conclude?",
      options: [
        "The payload is valid, since the proof itself verified correctly",
        "The proof counts as positive once a second zkVM's proof agrees",
        "The proof is malformed and its sender should be banned from gossip",
        "It cannot count the proof as evidence that the payload is valid",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does a zkVM guest program get the state it reads, compared with an execution client validating a block normally?",
      options: [
        "It receives every trie node, code and header up front in a witness",
        "It queries the prover's node over JSON-RPC as execution needs it",
        "It reads a snapshot of the full state mounted into the proving VM",
        "It rebuilds the state by replaying the whole chain inside the zkVM",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does a real-time prover usually run its own execution client rather than use a hosted RPC endpoint?",
      options: [
        "Hosted endpoints return witnesses the guest cannot hash to a root",
        "Hosted endpoints rarely expose debug_ and round trips eat the budget",
        "Proofs must be signed with the execution client's own node key",
        "Hosted endpoints serve only finalized blocks, which come too late",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What does the current text of EIP-8025 say proof-verifying nodes do with a block?",
      options: [
        "They stop re-executing once three proofs from distinct zkVMs agree",
        "They skip re-execution whenever any valid proof has arrived first",
        "They still re-execute it and treat a valid proof as an extra signal",
        "They re-execute it only when two gossiped proofs disagree on it",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "Suppose a later EIP lets validators verify proofs and stop re-executing. Which job still needs nodes that hold the full state?",
      options: [
        "Checking each proof's public input against the payload received",
        "Following fork choice and attesting to the head of the chain",
        "Answering eth_call and other reads for applications and users",
        "Verifying the BLS signature on each gossiped execution proof",
      ],
      answer: 2,
    },
  ],
};
