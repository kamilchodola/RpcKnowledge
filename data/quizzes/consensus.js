// Checkpoint questions for the consensus category. Six per topic; each attempt draws five.
// Hand-written. See the topic lessons in data/consensus.js.

export const quizzes = {
  "proof-of-stake": [
    {
      kind: "contrast",
      question: "A beacon block carries an execution payload. How is the work of handling it divided between the consensus client and the execution client?",
      options: [
        "The execution client executes it and computes the state root",
        "The consensus client executes it and the execution client stores it",
        "The consensus client computes the state root from returned receipts",
        "The validator client executes it before the consensus client signs",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What sets how much weight a validator's vote carries under proof of stake?",
      options: [
        "The number of epochs it has been active",
        "The volume of RPC traffic its beacon node answers",
        "Its effective balance, subject to the protocol's rules",
        "The total gas used by blocks it has proposed so far",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "An application submits a transaction and polls a Beacon API endpoint every slot. What does this contribute to consensus?",
      options: [
        "A weak vote for the head the transaction was built on",
        "Passive attester status for the address that polls",
        "Extra fork-choice weight for the node that serves it",
        "Nothing; neither request is a validator vote",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A validator's server is down for a few hours and misses its duties. What does proof of stake do about it?",
      options: [
        "It slashes the validator for failing to attest on time",
        "It forfeits those rewards and can take penalties",
        "It removes the validator from the active set at once",
        "It freezes the stake until the operator signs a re-entry",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Before a brand-new observer can follow a long consensus history, what does proof of stake require it to have?",
      options: [
        "The deposit contract's full event log from genesis",
        "A signed attestation from the current slot's proposer",
        "An archive execution node to replay each block since genesis",
        "A weak-subjectivity checkpoint or other trusted anchor",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "An operator's only alert on a validator setup watches its balance. Which signals would show consensus and execution falling out of step?",
      options: [
        "Base fee, mempool size, and pending transaction count",
        "Engine API statuses, peers, and finalized checkpoints",
        "Request latency, cache hit ratio, and HTTP error rates",
        "Block gas used, transaction count, and ommer block rate",
      ],
      answer: 1,
    },
  ],

  "slot-epoch": [
    {
      kind: "scenario",
      question: "A slot passes and your node sees no block for it. What does that indicate?",
      options: [
        "The chain inserted an empty execution block to keep numbering continuous",
        "A reorganization removed a block that had been in that slot",
        "The node lost its consensus peers and must be restarted",
        "No proposer published one, or this node has not received it yet",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why can an execution block number not stand in for a Beacon slot number?",
      options: [
        "Block numbers are hex quantities while slots are decimal strings",
        "Slots advance even when no block appears, so the counts drift",
        "Block numbers restart from zero at every epoch boundary",
        "Slots count only blocks that have already reached finality",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "You join Beacon records to execution records on timestamp alone. What can go wrong?",
      options: [
        "Nothing, because both layers stamp blocks from one shared clock",
        "Only the consensus side records timestamps, so every join fails",
        "A missed slot or competing branch pairs the wrong records",
        "Builders set execution timestamps, so every join is a slot late",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What should an indexer store for each block so that it can tell a missed slot apart from an empty execution block?",
      options: [
        "Number, hash, parent hash, and the slot if available",
        "Number, timestamp, gas used, and the base fee per gas",
        "Hash, transaction count, and the receipts root",
        "Number, timestamp, and the proposer's fee recipient",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A monitoring rule labels a single empty slot as a reorg. What should it check before drawing that conclusion?",
      options: [
        "Whether eth_blockNumber rose by exactly one",
        "The execution client's pending transaction count",
        "Block ancestry and the consensus state",
        "The load balancer's upstream health status",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What does a validator client get from the consensus client's duty assignment that a local slot timer cannot give it?",
      options: [
        "A more precise wall clock, synchronised to the slot boundary",
        "A signature key that rotates at every epoch boundary",
        "Permission from the network to sign in that particular slot",
        "Committee assignments that can change at epoch transitions",
      ],
      answer: 3,
    },
  ],

  "fork-choice": [
    {
      kind: "detail",
      question: "When the fork-choice rule picks a head among competing blocks, what does it weigh?",
      options: [
        "The total gas used along each competing branch",
        "The latest available attestations from validators",
        "The number of transactions in each candidate block",
        "The accumulated difficulty of each branch",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "Two endpoints both return latest with the same block number. Is it the same block?",
      options: [
        "Yes; only one valid block can exist at a given height",
        "Yes, provided both endpoints report the same chain id",
        "Not necessarily; compare hashes, since branches can compete",
        "Not necessarily, but only while one is still syncing",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What makes a finalized checkpoint a different kind of statement from the current head?",
      options: [
        "The proposer picks the head while a relay decides finality",
        "The execution client computes finality and the consensus client the head",
        "The head stays advisory until an indexer has accepted it",
        "A late vote can move the head; finalized history should stand",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Two healthy nodes report different head hashes for a few seconds and then agree. What is the ordinary explanation?",
      options: [
        "Propagation delay let one see the new block first",
        "One briefly followed a different network's chain",
        "Their execution clients disagreed on a state root",
        "The finalized checkpoint rolled back, then forward",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A team pins each user to one RPC node with sticky sessions. What does that change when the protocol head moves?",
      options: [
        "Reorgs stop reaching that user until the session expires",
        "Reads agree with one node, yet the head can still change",
        "latest behaves like the safe tag for the whole session",
        "The pinned node's head is frozen for the session's lifetime",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "You need three state reads that must agree with each other. How should you address them?",
      options: [
        "Send each to a different endpoint, all using the latest tag",
        "Use the pending tag so that none of them lags behind",
        "Put them in one JSON-RPC batch, each with latest",
        "Pin all three to the same explicit block hash or number",
      ],
      answer: 3,
    },
  ],

  "finality": [
    {
      kind: "detail",
      question: "In the consensus rules, what must happen to a checkpoint before it can be finalized?",
      options: [
        "It must first be justified by a supermajority of attestations",
        "It must be referenced by hash in the next execution block header",
        "It must be countersigned by the next slot's proposer",
        "It must collect a configured number of block confirmations",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Two endpoints both implement the finalized tag. Why can they briefly return different blocks for it?",
      options: [
        "One of them is following a different chain id",
        "Each client defines finalized against a different epoch",
        "Nodes receive and process finality at different times",
        "The tag only refreshes when a caller explicitly asks",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Finality stops advancing while eth_blockNumber keeps rising. What should you inspect?",
      options: [
        "The execution client alone, since it produces the blocks",
        "Validator participation, peers, and Engine API statuses",
        "The load balancer's sticky session configuration",
        "The transaction pool, since stale transactions block finality",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A provider returns a balance labelled finalized, and your contract settles large sums on it. What does that label establish on its own?",
      options: [
        "That the balance has been cryptographically verified for you",
        "That every endpoint now returns the same value for it",
        "Which block the provider's node currently calls finalized",
        "That the value was proven against a trusted header",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A service reads two related balances in separate requests, each with the finalized tag. What can happen if finality advances between them?",
      options: [
        "The second request fails until the node's cache refreshes",
        "The node pins both reads to the first finalized block",
        "The second read reverts because its block is now stale",
        "The reads resolve to different blocks and may disagree",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "What distinguishes a finalized checkpoint from a block buried under a fixed number of confirmations?",
      options: [
        "Finality comes from validator votes; a confirmation count is local policy",
        "Confirmations are counted by validators; finality by providers",
        "Each is a protocol guarantee, but finality arrives a few slots sooner",
        "A confirmation count is enforced by the execution client's fork choice",
      ],
      answer: 0,
    },
  ],

  "execution-payload": [
    {
      kind: "contrast",
      question: "The execution client answers SYNCING rather than INVALID for a payload. What is the difference?",
      options: [
        "They are the same status, spelled differently by different clients",
        "SYNCING means the payload broke a rule; INVALID means it came too late",
        "INVALID breaks execution rules; SYNCING means it cannot decide yet",
        "SYNCING applies to consensus blocks and INVALID to execution blocks",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "A proposer used a builder's payload. What does its signed beacon block commit to?",
      options: [
        "The relay's bid amount, as a consensus field",
        "The chosen execution payload header",
        "The full transaction list, inspected before signing",
        "The builder's signature over the transaction list",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A node's database is slow. How can that surface on the consensus side?",
      options: [
        "Peers reject its attestations for invalid signatures",
        "The Engine API's JWT secret expires and must be rotated",
        "Beacon block bodies arrive truncated from gossip peers",
        "Slow payload validation makes it miss proposal deadlines",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "An application wants the execution block that a new beacon block carried. How does it normally read it?",
      options: [
        "eth_getBlockByHash or a subscription over JSON-RPC",
        "engine_getPayload, called directly on the execution client",
        "engine_newPayload, passing the beacon block root",
        "The Beacon API's validators route for that slot",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "A beacon block embeds an execution payload. What does that payload contain?",
      options: [
        "Attestations, the sync aggregate, and the proposer index",
        "Transactions, withdrawals, and a state root commitment",
        "Committee assignments, RANDAO mixes, and validator duties",
        "Deposit signatures, slashings, and the Engine API JWT",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does the consensus client need a payload status from the execution client at all?",
      options: [
        "It needs the status to compute its own RANDAO reveal",
        "The status carries the attestations it must aggregate",
        "Without it the validator key cannot be unlocked for signing",
        "It never executes transactions, so it cannot judge them",
      ],
      answer: 3,
    },
  ],

  "block-proposal": [
    {
      kind: "contrast",
      question: "Within one slot, how does the proposer duty differ from the attester duty?",
      options: [
        "Both assemble a block, but only the proposer's is broadcast",
        "The proposer creates the block; attesters vote on it",
        "The attester builds the payload, and the proposer wraps it",
        "Attesters act every slot and proposers once per epoch",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A validator misses its proposal. Where should the investigation look?",
      options: [
        "At the JSON-RPC response an application got for that slot",
        "At the relay's public dashboard, treated as authoritative",
        "At the logs of all three processes and the builder path",
        "At the execution client's pending transaction pool",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An operator using MEV-Boost wants to stop its execution client to save resources. What breaks?",
      options: [
        "Nothing can evaluate payloads and return a status over Engine API",
        "Relays refuse bids to proposers without a synced mempool",
        "The validator key, which the execution client stores, is lost",
        "MEV-Boost can no longer forward the node's attestations",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "Where does a validator client learn that it has a proposer assignment for a slot?",
      options: [
        "From the relay it registered with",
        "From the execution client over Engine API",
        "From the consensus client it is paired with",
        "From the deposit contract's event logs",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What changes when a proposer switches from local building to the builder path?",
      options: [
        "Which validity rules the execution payload must satisfy",
        "Which validator the protocol assigns to propose the slot",
        "Whether the block still needs attestations to become head",
        "Who orders the transactions and how the payload arrives",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "Your indexer sees a block the moment it is proposed. How should it treat that block?",
      options: [
        "As final, since the assigned proposer has already signed it",
        "As provisional until its confirmation policy accepts it",
        "As canonical as soon as its payload status comes back VALID",
        "As invalid until the next epoch boundary has confirmed it",
      ],
      answer: 1,
    },
  ],

  "beacon-block": [
    {
      kind: "consequence",
      question: "A beacon block is correctly signed by its assigned proposer, but its execution payload is invalid. What is the block?",
      options: [
        "Valid at the consensus layer, a problem only for execution RPC",
        "Invalid; the proposer's signature cannot make the payload acceptable",
        "Valid, because attestations on the block override payload errors",
        "Provisional until the next epoch boundary decides its status",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why should an application avoid hard-coding the shape of a beacon block body?",
      options: [
        "Each client implementation orders the fields differently",
        "The consensus endpoint returns the body as opaque bytes",
        "The schema is versioned and changes across network upgrades",
        "The body is withheld from the API until the block finalizes",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "When correlating a beacon block with its execution block, which identifiers should you keep?",
      options: [
        "The timestamp and the block number, which both layers share",
        "The proposer index, the epoch, and the gas used",
        "The chain id, the epoch number, and the parent root",
        "The slot, the beacon block root, and the execution block hash",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "An application combines beacon and execution data. Where does it query each kind of block?",
      options: [
        "Each over execution JSON-RPC, under the eth_ and beacon_ namespaces",
        "Beacon blocks from a consensus endpoint, execution ones over JSON-RPC",
        "Beacon blocks over Engine API, execution blocks from the Beacon API",
        "Each from the Beacon API, which serves one route per layer",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Besides the execution payload, what does a beacon block body carry?",
      options: [
        "Transaction receipts and the logs bloom filter",
        "The committee assignments for the next epoch",
        "Attestations and other consensus operations",
        "Every validator's balance for that slot",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A light-client workflow holds an authenticated Beacon header. What must it still check before trusting a value from execution state?",
      options: [
        "A second proposer signature over the same Beacon header",
        "That the value's block number matches the Beacon slot",
        "Nothing further; the Beacon header commits to every balance",
        "The linked execution payload header, then a state proof",
      ],
      answer: 3,
    },
  ],

  "mev-boost": [
    {
      kind: "contrast",
      question: "What does MEV-Boost change about how a block comes to exist?",
      options: [
        "It replaces the execution client's transition rules with the builder's",
        "It lets the consensus client finalize a block without attestations",
        "It moves payload assembly to builders; validity rules stay the same",
        "It lets relays sign blocks on the proposer's behalf",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Every configured relay times out during a proposer's slot. What options does the proposer have left?",
      options: [
        "Fall back to a locally built payload, or miss the slot",
        "Sign the most recent bid any relay had sent earlier",
        "Hand the duty to the next validator in its committee",
        "Let the consensus client extend the previous block",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "Which part of a validator setup must stay outside the builder and relay path?",
      options: [
        "The consensus client's read-only Beacon API",
        "The execution client's transaction pool",
        "The validator client's signing key",
        "The node's peer discovery settings",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "During a proposal with MEV-Boost enabled, which component asks the middleware for a bid?",
      options: [
        "The execution client, over Engine API",
        "The relay, on behalf of its builders",
        "The validator client, straight to builders",
        "The proposer's consensus client",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "What separates a builder's role from a relay's in the MEV-Boost path?",
      options: [
        "The relay makes the payload; the builder signs it for the proposer",
        "The builder makes the payload and bid; the relay mediates delivery",
        "The builder checks the proposer's key; the relay orders transactions",
        "The relay pays the proposer; the builder pays the relay a fee",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "An operator trims its relay list down to a single relay. Which properties does that choice affect?",
      options: [
        "Attestation weight, sync committee odds, and finality",
        "Slashing risk, the exit queue, and withdrawal delay",
        "The gas limit, the base fee, and the blob count",
        "Censorship resistance, availability, and expected value",
      ],
      answer: 3,
    },
  ],

  "validator": [
    {
      kind: "detail",
      question: "Since Pectra, what is the largest effective balance a validator with 0x02 compounding credentials can have?",
      options: [
        "32 ETH",
        "1024 ETH",
        "2048 ETH",
        "4096 ETH",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "An indexer reconciles ETH balances from transactions and receipts, yet a staker's address keeps gaining ETH it cannot explain. Why?",
      options: [
        "Rewards arrive as internal calls hidden from receipts",
        "Withdrawals credit it with no transaction or receipt",
        "The deposit contract emits refunds as anonymous logs",
        "Beacon rewards are paid by a system transaction",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "A Beacon API response shows balance 32041938475 and effective_balance 32000000000. Which reading is right?",
      options: [
        "Each is in wei, and balance sets voting weight each slot",
        "Each is in gwei, and balance sets voting weight each slot",
        "balance is in wei, while effective_balance is in gwei",
        "Each is in gwei, and effective_balance sets voting weight",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "The chain stops finalizing for a long stretch. What happens to validators that have stopped participating?",
      options: [
        "They are slashed once four epochs pass without a vote",
        "An inactivity leak drains them until others can finalize",
        "Their effective balances freeze until finality resumes",
        "They are ejected at the next sync committee rotation",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What distinguishes the cost of being offline from the cost of being slashed?",
      options: [
        "Downtime triggers slashing after a day; equivocation, a warning",
        "Each costs the same stake, but slashing is applied sooner",
        "Downtime forces an exit; equivocation costs about one reward",
        "Downtime costs the missed rewards; equivocation destroys stake",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why can a validator move to new hardware without the chain noticing?",
      options: [
        "The deposit contract rebinds its IP address each epoch",
        "Its withdrawal credentials follow it between machines",
        "Its identity is its key and index, not the host",
        "Sync committees re-register its address each period",
      ],
      answer: 2,
    },
  ],

  "attestation": [
    {
      kind: "detail",
      question: "A single attestation carries three claims at once. What are they?",
      options: [
        "The head block root, the execution state root, and the proposer index",
        "The head block root, the source checkpoint, and the target checkpoint",
        "The slot, the validator's balance, and the sync committee period",
        "The parent block, the transactions root, and the epoch number",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "Participation drops sharply, but blocks keep being produced. What does an application reading JSON-RPC notice first?",
      options: [
        "eth_getBlockByNumber returns null for latest",
        "Every eth_call fails with an execution reverted error",
        "latest keeps advancing while finalized stops moving",
        "eth_chainId switches to the fork's chain id",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why are individual attestations aggregated before they go into a block?",
      options: [
        "The fork-choice rule reads only one signature per slot per committee",
        "Aggregation hides which validators voted, for privacy reasons",
        "The protocol caps a block body at 512 individual signatures",
        "A million votes could not fit; bitfields and one signature can",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "You want to know which validator a set bit in aggregation_bits stands for. What do you need?",
      options: [
        "The committee assignment for that slot and committee index",
        "The validator's public key, recovered from the signature",
        "The block proposer's index for that same slot",
        "The sync committee membership for that period",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What distinguishes beacon_block_root from the source and target pair inside an attestation?",
      options: [
        "The root feeds Casper FFG; source and target feed LMD-GHOST",
        "The root names the proposer; source and target name the slot",
        "The root is optional, while source and target are mandatory",
        "The root feeds LMD-GHOST; source and target feed Casper FFG",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A node's clock drifts, so its attestations keep arriving late. What is the effect?",
      options: [
        "They are discarded and count as missed duties",
        "They still count for fork choice but earn less",
        "They are treated as a double vote and slashed",
        "They count fully once the next slot has begun",
      ],
      answer: 1,
    },
  ],

  "sync-committee": [
    {
      kind: "detail",
      question: "How many validators sit on a sync committee, and how long does one committee serve?",
      options: [
        "128 validators for one epoch, about 6.4 minutes",
        "512 validators for 4096 epochs, roughly 18 days",
        "512 validators for 256 epochs, roughly 27 hours",
        "One validator per slot, rotating every 12 seconds",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why can a light client keep following the chain long after its original trusted starting point?",
      options: [
        "Committee keys never change once it has downloaded them",
        "Each verified period lets it prove the next committee",
        "It downloads the full validator set again every epoch",
        "The proposer signs a certificate that extends its trust",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A verified RPC proxy holds a header it trusts from sync committee updates. What does it still need to answer eth_getBalance without trust?",
      options: [
        "Nothing further; the header itself lists account balances",
        "A second sync committee signature over the account",
        "An archive node to re-execute the block locally",
        "A state proof from any source, checked against that header",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "What makes a sync committee signature weaker evidence than finality?",
      options: [
        "Committee members are not slashed for signing a wrong header",
        "Its signatures are not aggregated, so they are easy to forge",
        "It covers one epoch of blocks rather than the whole chain",
        "It is produced by the slot's proposer alone",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "Committee members sign the block root of the current slot. Where does that signature end up?",
      options: [
        "In that block's aggregation_bits, one bit per committee member",
        "In the next block's sync_aggregate, as bits plus one signature",
        "In the next block's attestations list, one per member",
        "In the execution payload's extra data field",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A light client bootstraps from a block root it never checked. What has it given up?",
      options: [
        "Nothing; later updates each prove themselves from scratch",
        "It can follow optimistic updates but no finality updates",
        "It must redownload the full validator set every period",
        "Every committee it later trusts rests on that unchecked start",
      ],
      answer: 3,
    },
  ],

  "slashing": [
    {
      kind: "scenario",
      question: "An operator reviews four incidents on its validators. Which one leads to slashing?",
      options: [
        "Being offline for a full day and missing every attestation",
        "Signing two attestations where one's span surrounds the other's",
        "Proposing a block that the network later reorgs out",
        "Letting its execution client fall behind the head for hours",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does the correlation penalty scale with how much other stake was slashed around the same time?",
      options: [
        "To compensate the whistleblower who submitted the evidence",
        "Because the protocol cannot measure one validator's balance at exit",
        "To price one operator's mistake far below a coordinated attack",
        "To keep the total supply of ETH constant across epochs",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What does a validator client's slashing protection database record for each key?",
      options: [
        "An encrypted backup of the signing key and its keystore password",
        "The highest slot it signed and highest source and target epochs",
        "The signatures of every peer that gossiped its blocks",
        "The list of relays the validator is allowed to use",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "An operator starts the same validator keys on a standby host while the primary may still be running. What is the risk?",
      options: [
        "The chain sees two peers and halves the validator's weight",
        "The standby host's votes are ignored until the primary exits",
        "Each host attests, so the validator earns double rewards",
        "The two hosts sign conflicting messages and it is slashed",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "Your service watches execution JSON-RPC for slashings and has never seen one. Where does the evidence appear?",
      options: [
        "In beacon block bodies and the Beacon API status",
        "In a receipt log emitted by the deposit contract",
        "In eth_getLogs output for a slashing system contract",
        "In the withdrawals array of the very next block",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "What happens to a validator immediately after it is slashed?",
      options: [
        "It keeps attesting at reduced weight until it chooses to exit",
        "Its whole balance is burned in the block with the evidence",
        "It takes an initial penalty and is queued for a forced exit",
        "It is suspended for one epoch and then resumes its duties",
      ],
      answer: 2,
    },
  ],

  "mev": [
    {
      kind: "scenario",
      question: "You are about to submit a large swap through a public endpoint. Which parameter you set most directly limits what a sandwich can extract?",
      options: [
        "The gas limit, since a sandwich needs extra gas to wrap you",
        "The slippage bound, since a bigger move makes the swap revert",
        "maxFeePerGas, since a higher cap buys the first position",
        "The nonce, since it fixes your position within the block",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Who typically decides the transaction ordering in the block a mainnet transaction lands in today?",
      options: [
        "The node it was submitted to, which assembles its own pool",
        "The protocol, which sorts transactions by effective gas price",
        "An external builder, whose payload the proposer signs blind",
        "The relay, which rewrites the order after the proposer signs",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What does a successful eth_call simulation against latest actually tell you about your transaction?",
      options: [
        "The result against current state, before others trade around it",
        "The exact result the transaction will have once it is included",
        "That no searcher is currently targeting the sending address",
        "That the transaction will land in the very next block",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "A searcher expresses an opportunity as a bundle. What property defines a bundle?",
      options: [
        "Its transactions share a single nonce and a single signature",
        "It is a block template that a relay sends straight to proposers",
        "It is a JSON-RPC batch that a node executes in one request",
        "Its transactions are included together, in order, or not at all",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "You route a swap through a private transaction endpoint instead of the public pool. What trade-off remains?",
      options: [
        "Its nonce can no longer be replaced by a later transaction",
        "It loses replay protection, so it could execute on another chain",
        "The receiving builder still sees it, and inclusion can be slower",
        "It pays the relay a fixed fee on top of the priority fee",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "A bot reads txpool_content to predict the next block's ordering. Why is that unreliable?",
      options: [
        "It lists only transactions that have already been included",
        "It is sorted by arrival time, which builders then reverse",
        "It is one node's local pool, and no builder is bound by it",
        "It hides transactions whose fees are below the base fee",
      ],
      answer: 2,
    },
  ],
};
