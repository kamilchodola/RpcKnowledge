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
        "The committees of that slot that its committee_bits names",
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
        "The blocks and attestations that key has already signed",
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

  "randao": [
    {
      kind: "scenario",
      question: "A lottery contract picks its winner from block.prevrandao of the block that includes the draw transaction. Who can influence the result most cheaply?",
      options: [
        "That block's proposer, by including or delaying the draw",
        "Any searcher, by bundling a transaction just ahead of the draw",
        "No one, since the value stays unknown until the block is sealed",
        "The sync committee members who sign that block's header",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why can a proposer not grind its randao_reveal for a more favourable value?",
      options: [
        "The reveal is picked by the attesting committee, not the proposer",
        "The reveal must match a commitment the validator made at deposit",
        "The reveal is a deterministic BLS signature over the epoch number",
        "The reveal is hashed together with the parent state root first",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Under which field name does a block's PREVRANDAO value appear in execution JSON-RPC responses?",
      options: [
        "difficulty, which EIP-4399 redefined in place",
        "mixHash, the header field the value took over",
        "prevRandao, added to the header as a new field",
        "nonce, which lost its mining meaning at the Merge",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "How does randomness from a VRF oracle differ from PREVRANDAO?",
      options: [
        "It is free, because every node computes it locally",
        "It is always delivered, since providers cannot refuse",
        "It is unbiasable only when read four epochs ahead",
        "It carries a proof, so the provider cannot pick outcomes",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "An entity controls the last k slots of an epoch and decides for each whether to publish its block. What does it gain?",
      options: [
        "Control of the mix until the chain next finalizes",
        "The ability to set its reveal to any value it wants",
        "A choice among 2 to the k seeds for a later epoch",
        "A lasting bias that later honest reveals cannot undo",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "A dapp deployed unchanged on Arbitrum reads block.prevrandao as its source of randomness. What does it receive?",
      options: [
        "The L1 mix from the matching Ethereum block",
        "The constant 1, identical in every block",
        "A fresh value the sequencer derives per block",
        "An error, since the opcode is disabled there",
      ],
      answer: 1,
    },
  ],

  "builder-api": [
    {
      kind: "scenario",
      question: "A validator signed a blinded block, but the payload was never published, and the slot is not over yet. What should its client do?",
      options: [
        "Sign a locally built block and publish it before the slot ends",
        "Accept the missed slot rather than sign anything new for it",
        "Sign a fresh blinded block from the next-best bid it received",
        "Ask its execution client to rebuild the builder's payload",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can the builder side safely reveal its transactions once the proposer has signed the blinded block?",
      options: [
        "The proposer's client deletes the header once it has signed",
        "The payload stays encrypted to the builder until inclusion",
        "Relays reveal payloads only to proposers who post a bond",
        "Any other block for that slot would be a slashable proposal",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "What does the v2 submitBlindedBlock call return to the proposer after Fulu?",
      options: [
        "202 Accepted with no body; the builder side publishes",
        "The full execution payload together with its blobs",
        "A signed receipt proving the block was gossiped",
        "The same header, countersigned by the relay's key",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "On the v3 block production route, how does builder_boost_factor=100 differ from builder_boost_factor=0?",
      options: [
        "100 always takes the bid; 0 turns the builder off entirely",
        "100 doubles the local block's value; 0 leaves it unchanged",
        "100 takes whichever pays more; 0 prefers the local payload",
        "100 waits a full second for bids; 0 does not wait at all",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "Lighthouse, with default settings, has seen three skipped slots in a row just before it is due to propose. What does it do?",
      options: [
        "It skips the builders and builds the block locally",
        "It asks only the relay with the best recent record",
        "It extends its wait for builder bids by a second",
        "It declines to propose until the chain finalizes",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What job does the timestamp in a ValidatorRegistrationV1 do?",
      options: [
        "It sets the slot from which the fee recipient applies",
        "It expires the registration after exactly one epoch",
        "It proves the validator was online when it signed",
        "It orders registrations so an older one cannot win",
      ],
      answer: 3,
    },
  ],

  "relay": [
    {
      kind: "scenario",
      question: "An analyst sums the value of proposer_payload_delivered across five relays for a month and gets more than proposers were actually paid. What is the likeliest cause?",
      options: [
        "The relays report value in gwei rather than in wei",
        "The data API also lists bids that lost the auction",
        "The same block appears as delivered at several relays",
        "The reported values include the base fee that was burned",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Which JSON-RPC method does mev-boost-relay call on its execution node to check a Fulu block submission?",
      options: [
        "flashbots_validateBuilderSubmissionV5",
        "engine_newPayloadV4 with the bid attached",
        "eth_callBundle against the block's parent",
        "debug_traceBlock with the payload as input",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does a relay's simulation check that the last transaction pays the proposer, or that the fee recipient's balance rose?",
      options: [
        "Consensus rules reject any block that underpays the proposer",
        "The Engine API accepts payloads only when payment comes last",
        "The builder's own fee recipient must end the block empty",
        "The proposer signs blind and cannot check the payment itself",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "What does a proposer rely on a relay for, compared with what a builder relies on it for?",
      options: [
        "Not stealing the block's contents, versus validity and publication",
        "Validity and publication, versus not stealing the block's contents",
        "Paying the promised bid, versus refunding bundles that failed",
        "Finality of the block, versus inclusion of every bundle sent",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A relay's simulation node wrongly accepts an invalid block, and the proposer signs its header. What follows?",
      options: [
        "The block becomes canonical because the relay vouched for it",
        "The network rejects the block and the proposer misses the slot",
        "The proposer is slashed for signing a header that is invalid",
        "The builder's collateral makes the block valid after the fact",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A developer sends eth_sendBundle requests to boost-relay.flashbots.net because it is the relay. What is wrong?",
      options: [
        "It is the MEV-Boost relay; bundles belong at relay.flashbots.net",
        "Bundles have to be sent over a WebSocket rather than plain HTTP",
        "Only registered validators may submit anything at all to a relay",
        "Bundle requests must carry the relay's BLS public key in the URL",
      ],
      answer: 0,
    },
  ],

  "searcher": [
    {
      kind: "contrast",
      question: "How does a searcher's role differ from a block builder's?",
      options: [
        "It signs blocks for a slot; the builder only simulates them",
        "It is a protocol role; the builder is an off-chain service",
        "It runs the relay; the builder runs the proposer's sidecar",
        "It proposes transaction sequences; the builder assembles blocks",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A searcher simulates a backrun with eth_call against latest, submits it for the next block, and it fails anyway. What is the likeliest reason?",
      options: [
        "eth_call cannot simulate transactions that transfer value",
        "The builder placed other transactions ahead of it in the block",
        "The latest tag already pointed at the block being targeted",
        "Builders execute bundles on finalized state, not on latest",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "In eth_callBundle, what does the stateBlockNumber parameter specify?",
      options: [
        "The block the bundle is targeted for inclusion in",
        "The last block in which the bundle is still valid",
        "The block whose state the bundle is executed on",
        "The block where the sender's nonce was last used",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why do serious searchers run their own nodes rather than use a shared provider endpoint?",
      options: [
        "Reacting inside a slot leaves no room for extra hops or limits",
        "Providers are not permitted to serve eth_call to trading bots",
        "Only a local node is able to submit bundles to block builders",
        "Shared endpoints do not support eth_subscribe in any form",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A searcher backtests a year of strategies against a pruned full node. What happens?",
      options: [
        "The replays succeed but leave out every internal call",
        "The node quietly substitutes current state for old blocks",
        "The results are right but ten times slower than archive",
        "Replays fail with missing trie node beyond its state window",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "What does a MEV-Share hint carry even when the sender chooses to share nothing else?",
      options: [
        "The complete signed transaction bytes",
        "The sender's address and current nonce",
        "A double-hashed transaction hash",
        "The calldata and the target address",
      ],
      answer: 2,
    },
  ],

  "distributed-validator": [
    {
      kind: "scenario",
      question: "A four-operator Charon cluster runs with a threshold of three, and one operator's machine dies. What happens to its duties?",
      options: [
        "They continue, since three shares still meet the threshold",
        "They stop until the fourth share is restored from a backup",
        "They continue, but the cluster can no longer propose blocks",
        "They pause until the cluster reruns key generation",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why do the operators of a distributed validator run a consensus round before each duty is signed?",
      options: [
        "The beacon chain wants a quorum certificate with every vote",
        "Each share signs a different part of the attestation data",
        "The validator client refuses to sign without a round number",
        "Partial signatures combine only if they cover one object",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does an SSV node's place in the stack differ from Charon's?",
      options: [
        "It keeps the whole key on one node and copies signatures out",
        "It performs the duties itself instead of a validator client",
        "It needs no beacon node, because it reads only the contract",
        "It proxies the Beacon API to an unmodified validator client",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Why does an SSV node need a WebSocket connection to an execution client?",
      options: [
        "It submits each partial signature as a transaction",
        "It builds the execution payloads for its proposals",
        "It reads validator and operator events from a contract",
        "It checks every operator's ETH balance before signing",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An operator recombines a threshold of key shares into an ordinary key and starts it while the cluster keeps running. What follows?",
      options: [
        "A double signature, and slashing, is close to certain",
        "The cluster notices and hands its duties to the new key",
        "Nothing, because the chain cannot tell the signers apart",
        "The shares are invalidated and the cluster stops signing",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What must a distributed validator cluster produce before its beacon node can be asked for a block to propose?",
      options: [
        "A fresh key generation ceremony for that slot",
        "A threshold-combined RANDAO reveal for the epoch",
        "A signed builder registration for every relay",
        "An aggregated attestation from the previous slot",
      ],
      answer: 1,
    },
  ],

  "preconfirmation": [
    {
      kind: "detail",
      question: "Which ordering runs from the weakest guarantee to the strongest?",
      options: [
        "Inclusion, preconfirmation, safe, finalized",
        "Preconfirmation, safe, inclusion, finalized",
        "Preconfirmation, inclusion, safe, finalized",
        "Safe, preconfirmation, inclusion, finalized",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What backs a based preconfirmation that a centralised L2 sequencer's soft confirmation lacks?",
      options: [
        "Collateral that can be slashed if the commitment is broken",
        "A zero-knowledge proof of the future block's contents",
        "A signature from the sync committee of the current period",
        "An on-chain record of the transaction before inclusion",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why did EIP-7917, shipped in Fulu, matter to based preconfirmation designs?",
      options: [
        "It lets proposers sign commitments with their BLS keys",
        "It adds an eth_ method for requesting a commitment",
        "It makes a broken commitment a slashable offence",
        "It fixes the next epoch's proposers in the beacon state",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "An app marks a user's L2 swap as done because the sequencer returned a receipt one second after submission. What has the user actually got?",
      options: [
        "A finalized result, because the receipt names a block hash",
        "A preconfirmation from the unsafe head, not yet on L1",
        "An L1 inclusion, since receipts exist only after batching",
        "A safe block, since sequencers sign only justified blocks",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A wallet simulates a transaction with eth_call against latest while earlier preconfirmed transactions are due to run first in the next block. What is the risk?",
      options: [
        "The call fails, because latest rejects pending commitments",
        "The node refuses the call until the commitments are included",
        "The result describes a state the transaction will never meet",
        "The simulation counts the committed transactions twice over",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "How does Base expose its Flashblocks preconfirmed state to RPC callers?",
      options: [
        "Through a new eth_getPreconfirmation method on every node",
        "Through the safe tag, which it updates every 200 milliseconds",
        "Through L1 calldata, readable once the batch has been posted",
        "Through the pending tag on standard methods such as eth_call",
      ],
      answer: 3,
    },
  ],

  "validator-rewards": [
    {
      kind: "scenario",
      question: "A staking dashboard sums the priority fees of every block its validators proposed through MEV-Boost and reports that as execution income. What is wrong?",
      options: [
        "Priority fees are burned, so the true sum is always zero",
        "Those fees went to the builder; the proposer got its transfer",
        "Priority fees are paid out later through the withdrawal sweep",
        "The sum is right but has to be converted from gwei into wei",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Which attestation vote costs a validator nothing when missed except the reward it forgoes?",
      options: [
        "The target vote",
        "The source vote",
        "The head vote",
        "The sync committee signature",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why does the attestation rewards route fail for an epoch from months ago on a pruned beacon node?",
      options: [
        "It recomputes rewards from states the node no longer keeps",
        "Rewards older than one withdrawal sweep are removed from the chain",
        "The route accepts only epochs that have not yet been finalized",
        "Old rewards are served by the paired execution client instead",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "How does consensus income reach an execution address, compared with priority fees?",
      options: [
        "By a transaction from the deposit contract, while fees are swept",
        "To the fee recipient each epoch, while fees need a withdrawal",
        "As a receipt log, while fees appear only in the beacon state",
        "By the withdrawal sweep, while fees are credited in the block",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A validator still has 0x00 withdrawal credentials. What happens to the consensus rewards it earns?",
      options: [
        "They are swept to the validator's fee recipient address instead",
        "They stay on the beacon chain until the credentials change",
        "They are burned at every epoch boundary until claimed",
        "They are paid out as an ordinary transaction each sweep",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What does the total field of the Beacon API block rewards route cover?",
      options: [
        "Consensus rewards only, without priority fees or MEV",
        "Consensus rewards plus the block's priority fees",
        "Priority fees and MEV, without consensus rewards",
        "Everything the proposer earned, expressed in wei",
      ],
      answer: 0,
    },
  ],

  "bls-signature": [
    {
      kind: "detail",
      question: "What are the sizes of a compressed BLS public key and signature in Ethereum's consensus layer?",
      options: [
        "96-byte public key, 48-byte signature",
        "33-byte public key, 65-byte signature",
        "64-byte public key, 64-byte signature",
        "48-byte public key, 96-byte signature",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why does an attestation from a large committee still carry only one signature?",
      options: [
        "Only the aggregator signs; the other members are listed",
        "Signatures over identical data aggregate into one",
        "Members sign a hash chain and only the last link is kept",
        "The proposer re-signs it on the committee's behalf",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A tool checks a mainnet attestation signature but computes the domain with a testnet's genesis validators root. What happens?",
      options: [
        "It passes, because the domain type is the same",
        "It passes, but only for messages from before a fork",
        "It fails, although the signature itself is valid",
        "It fails only when the fork versions differ as well",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does verifying a BLS signature differ from checking an execution-layer ECDSA signature?",
      options: [
        "BLS needs the public key as input; ECDSA recovers the signer",
        "BLS recovers the signer; ECDSA needs the public key as input",
        "BLS needs the signer's address; ECDSA needs the chain id",
        "BLS needs the private key; ECDSA needs only the message",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "Someone deposits for a new validator key but the deposit's signature does not verify. What happens?",
      options: [
        "The deposit contract reverts and returns the ETH",
        "The validator activates but cannot sign attestations",
        "The deposit waits until a valid signature is supplied",
        "No validator is created and the ETH is not refunded",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A contract passes a validator's 48-byte public key straight to the EIP-2537 pairing precompile. What happens?",
      options: [
        "It succeeds, since the precompile decompresses keys",
        "It succeeds but charges extra gas to decompress it",
        "It errors, since the precompile wants 128-byte points",
        "It returns false, as if the signature were invalid",
      ],
      answer: 2,
    },
  ],

  "liquidation-bot": [
    {
      kind: "scenario",
      question: "An Aave v3 borrower has a health factor of 0.9856, and both their collateral and their debt in the two assets involved exceed $2,000. How much may one liquidation repay?",
      options: [
        "All of the debt, because the factor is below 1",
        "Only enough to bring the factor back to 1",
        "Half of the borrower's total debt at most",
        "A fixed tenth of the debt in each block",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why does an eth_getLogs filter for AnswerUpdated on a Chainlink price-feed proxy address never match?",
      options: [
        "The aggregator behind the proxy is the contract that emits it",
        "Proxies emit it only when the feed's heartbeat window expires",
        "The event is anonymous, so it has no topic to filter on",
        "Proxies batch their events and emit them once per epoch",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A bot backruns the public transmit of a Chainlink feed that Aave reads through SVR. What happens to the price Aave uses?",
      options: [
        "It updates in the same block as the public transmit",
        "It is averaged with the price on the standard feed",
        "It is rejected because the report arrives twice",
        "It stays put; that price moves through MEV-Share",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "What happens to an Aave v3 liquidation that would leave $600 of both debt and collateral behind?",
      options: [
        "It succeeds, and the remainder is written off as dust",
        "It reverts with the MustNotLeaveDust error",
        "It succeeds, but the liquidator forfeits the bonus",
        "It is converted into a flash loan for the remainder",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "How does liquidating on Compound v3 differ from calling Aave v3's liquidationCall?",
      options: [
        "absorb pays the caller a fixed 5 percent bonus in collateral at once",
        "absorb can only be called by governance during an emergency pause",
        "absorb moves the debt to the protocol, which sells the collateral later",
        "absorb requires the caller to post the debt asset as collateral first",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A liquidation sent through the public pool loses the race to a faster bot. What does the losing attempt cost?",
      options: [
        "Gas for a transaction that reverts on chain",
        "Nothing, since the pool drops losing attempts",
        "Its liquidation bonus, which goes to the winner",
        "A penalty that the lending protocol deducts",
      ],
      answer: 0,
    },
  ],

  "intent-solver": [
    {
      kind: "scenario",
      question: "A filler simulates a UniswapX Dutch order with eth_call at latest and finds the fill just unprofitable. What has it overlooked?",
      options: [
        "Dutch orders cannot be simulated without the cosigner's private key",
        "eth_call skips the reactor's exclusivity check, so the result is void",
        "The order's demanded output rises each block, so later is always worse",
        "The order is priced at a timestamp one slot before it can land",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "In CoW Protocol, what does the /settle request tell the winning solver's driver?",
      options: [
        "The calldata that the autopilot computed for the solution",
        "The auction id and the last block the settlement may land in",
        "The list of builders the settlement is required to use",
        "The gas price the driver must bid in the public pool",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does CoW's reference driver cap the gas limit before it calls eth_estimateGas on a solution?",
      options: [
        "So a rogue solution cannot make the node search up to the block gas limit",
        "So the settlement fits inside one bundle that MEV Blocker will accept for a block",
        "Because the autopilot reimburses only the gas spent below that cap",
        "Because eth_estimateGas rejects any request above 30 million gas",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A winning CoW solver's settlement has still not landed when its deadline block passes. What follows?",
      options: [
        "The autopilot resubmits the same solution on the solver's behalf",
        "The users' orders are cancelled and have to be signed again",
        "Its score counts against it, and its reward can turn negative",
        "The solver is removed from the competition for good at once",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does an intent differ from an ordinary swap transaction?",
      options: [
        "It runs through the public pool without any signature",
        "It is settled by validators rather than by a contract",
        "It names the pools but lets the user skip paying gas",
        "It states the outcome and leaves the route to a solver",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A solver sends both its quote traffic and its settlements through one rate-limited endpoint. What goes wrong when a volatile block lands?",
      options: [
        "The endpoint reorders settlements behind the queued quotes",
        "Quote bursts use up the limit and starve the submissions",
        "Settlements are rejected for exceeding the node's gas cap",
        "Quotes start being answered from the pending block instead",
      ],
      answer: 1,
    },
  ],

  "mev-share": [
    {
      kind: "scenario",
      question: "A searcher compares the hash field of MEV-Share hints with the transaction hashes in the next block and never finds a match. Why?",
      options: [
        "It is the keccak-256 of the transaction hash",
        "Hints describe bundles only, never single transactions",
        "Hint hashes are encoded as base64 rather than as hex",
        "Hints are published only after the block is finalized",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What does the inclusion object of mev_sendBundle allow that the blockNumber field of eth_sendBundle does not?",
      options: [
        "A list of builders that are required to include it",
        "A minimum refund that the user must receive first",
        "An inclusive range of blocks, from block to maxBlock",
        "A validity window measured in milliseconds of time",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why does mev_simBundle reject a searcher's backrun bundle before the user's transaction has landed?",
      options: [
        "Simulation is reserved for the user who sent the transaction",
        "Backrun bundles can be simulated only on the Sepolia testnet",
        "The node simulates only bundles whose refunds are filled in",
        "The bundle still holds an unmatched hash entry in its body",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does MEV Blocker's searcher feed differ from MEV-Share's hint stream?",
      options: [
        "It sends only hashes, with every other field removed",
        "It sends whole transactions without their signatures",
        "It requires each bundle to carry the user's signature",
        "It streams over server-sent events with no keep-alive",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A wallet points its users at Flashbots Protect with no URL parameters. Which builders can include their transactions?",
      options: [
        "Only the Flashbots builder",
        "Every builder in the registry",
        "Any builder a searcher names",
        "Builders the validator picks",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "Under Flashbots Protect's default settings, how is a MEV refund split?",
      options: [
        "50 percent to tx.origin and 50 percent to the winning searcher",
        "100 percent to the builder that included the bundle",
        "90 percent to tx.origin and 10 percent to the validator",
        "90 percent to the searcher and 10 percent to tx.origin",
      ],
      answer: 2,
    },
  ],

  "enshrined-pbs": [
    {
      kind: "scenario",
      question: "A builder's bid sits in a timely Gloas beacon block that draws 80% of same-slot attestations, and the builder never reveals the payload. What happens?",
      options: [
        "The beacon block is orphaned and the proposer earns nothing",
        "The builder is slashed and its stake goes to the proposer",
        "The next proposer has to include the builder's payload",
        "The slot ends empty and the proposer is still paid the bid",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "What does a Gloas beacon block body carry where the execution payload used to be?",
      options: [
        "The payload header countersigned by a relay",
        "A builder's signed bid committing to a block hash",
        "The payload envelope with its execution requests",
        "Payload attestations voted in that same slot",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why can an execution node's eth_blockNumber trail the beacon head by part of a slot under Gloas?",
      options: [
        "The payload comes in its own envelope after the block",
        "The execution client waits for the PTC vote to import",
        "The beacon block must finalize before its payload runs",
        "Execution blocks are now produced every second slot",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "How does the payload timeliness committee differ from an ordinary attestation committee?",
      options: [
        "It votes on source and target checkpoints for finality",
        "It signs the execution payload on the builder's behalf",
        "It votes on whether the payload and blob data arrived",
        "It chooses which builder's bid the proposer must take",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An execution client imported a payload as its head, and the next proposer then builds on that beacon block as empty. What does an RPC caller observe?",
      options: [
        "Nothing, because the beacon block is still canonical",
        "A one-block reorg that drops that payload's block",
        "A finality stall until the builder republishes it",
        "One block number appearing at two different slots",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Which execution block does a Gloas light client header commit to?",
      options: [
        "The block revealed in that slot's payload envelope",
        "The latest finalized execution block of the epoch",
        "Whichever block the PTC voted present that slot",
        "The parent named by the bid's parent_block_hash",
      ],
      answer: 3,
    },
  ],

  "fast-confirmation-rule": [
    {
      kind: "scenario",
      question: "Two providers answer eth_getBlockByNumber with safe: one returns a block two behind latest, the other one about fifty behind. What explains the gap?",
      options: [
        "One consensus client runs the FCR and the other does not",
        "One provider caches its responses for several minutes",
        "One execution client has pruned its recent safe blocks",
        "One endpoint sits on a chain with lower participation",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does the FCR need more than 95% of one slot's committee to confirm a block after a single slot?",
      options: [
        "The bar is the two-thirds supermajority used by finality",
        "The bar requires every committee member to vote in time",
        "The bar adds the proposer boost and a 25% adversary",
        "The bar doubles the weight to cover a possible missed slot",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does the guarantee behind an FCR-confirmed block differ from the one behind a finalized block?",
      options: [
        "It needs a third of stake slashed, the same as finality",
        "It is weaker only because it trusts a single proposer",
        "It holds unconditionally but covers fewer recent blocks",
        "It assumes timely votes, and reverting it slashes nobody",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "An FCR client's confirmed block leaves the canonical chain. What does eth_getBlockByNumber with safe return next?",
      options: [
        "The finalized block, many blocks lower than before",
        "The same block, because safe never moves backwards",
        "An error, until another block has been confirmed",
        "The latest block, until the next epoch boundary",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "When a consensus client runs the FCR, how does its result reach the execution client?",
      options: [
        "As a new safe tag value sent over an eth_ method",
        "As safeBlockHash in engine_forkchoiceUpdated",
        "As a beacon block root inside payloadAttributes",
        "As a fast_confirmation event on the Engine API",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A block receives 93% of its slot's committee, and participation stays the same afterwards. When does the FCR confirm it?",
      options: [
        "At the start of the next slot, after one slot of votes",
        "Only at the next epoch boundary, when it is rechecked",
        "One slot later, once two slots of votes clear 85%",
        "Never, because 93% falls short of the 95% one-slot bar",
      ],
      answer: 2,
    },
  ],
};
