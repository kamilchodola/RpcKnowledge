// Category: consensus — proof-of-stake timing, fork choice, payloads and block production.

export const topics = [
  {
    id: "proof-of-stake",
    title: "Proof of stake",
    category: "consensus",
    aliases: ["PoS", "Gasper", "beacon consensus", "stake-weighted consensus"],
    summary: "Proof of stake is Ethereum’s consensus mechanism in which validators lock stake, attest to chain views, and are selected for duties that advance fork choice and finality.",
    sections: [
      {
        heading: "The consensus role",
        paragraphs: [
          "Ethereum’s proof-of-stake layer is run by a [[consensus-client|consensus client]] that tracks Beacon blocks, attestations, committees, and checkpoints. Validators deposit stake and receive assignments to attest, propose, or serve sync-committee duties. Their signed messages provide the votes used by [[fork-choice|fork choice]] and the supermajority conditions that produce [[finality|finality]].",
          "The consensus layer does not execute application transactions itself. Each Beacon block may carry an execution payload, and the paired [[execution-client|execution client]] validates that payload and computes the resulting [[state-root|state root]]. The two clients exchange payload status and fork-choice information through [[engine-api|Engine API]], giving the node a modular boundary between consensus and execution.",
        ],
      },
      {
        heading: "Why stake matters",
        paragraphs: [
          "A validator’s voting weight is derived from effective balance, subject to protocol rules. Honest participation earns rewards; missing duties loses opportunities and can incur penalties; contradictory or invalid signed behavior can be slashable. These incentives do not make every validator honest, but they make a conflicting finalized history economically and cryptographically difficult under the protocol assumptions.",
          "The relevant unit is a validator’s vote, not an RPC request. Calling a Beacon API endpoint does not contribute to consensus, and sending an execution transaction does not vote for a chain head. RPC applications consume the results of consensus and execution; they do not become validators merely by reaching a node.",
        ],
      },
      {
        heading: "What an operator observes",
        paragraphs: [
          "A healthy setup has a synchronized consensus client, an execution client that can validate the incoming payload, sufficient peers, and a validator client if the operator has duties. Monitor slot timing, attestation inclusion, head and finalized checkpoints, Engine API statuses, and execution sync together. A public [[rpc-provider|RPC provider]] can supply data to an application, but it cannot replace the protocol’s consensus process when an application needs a trusted finalized view.",
          "Proof of stake also has a trust bootstrapping issue: a new observer needs a weak-subjectivity checkpoint or another trusted anchor before following a long consensus history. That is why a [[light-client|light client]] and a full node have different setup assumptions even when both verify later updates.",
        ],
      },
    ],
    pitfalls: [
      "Calling JSON-RPC traffic a consensus vote or treating an RPC provider as a validator.",
      "Collapsing execution payload validation into the consensus client’s responsibilities.",
      "Monitoring only validator balances while ignoring Engine API, peer, and finalized-checkpoint health.",
      "Skipping weak-subjectivity or checkpoint provenance for a newly bootstrapped observer.",
    ],
    related: ["consensus-client", "execution-client", "fork-choice", "finality", "engine-api", "execution-payload", "validator-client", "light-client", "slot-epoch"],
    sources: [
      { title: "ethereum.org: Proof-of-stake", url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/" },
      { title: "Ethereum consensus specifications", url: "https://github.com/ethereum/consensus-specs" },
    ],
  },
  {
    id: "slot-epoch",
    title: "Slots and epochs",
    category: "consensus",
    aliases: ["12-second slot", "32-slot epoch", "Beacon time", "slot clock"],
    summary: "A slot is a scheduled opportunity for a Beacon block, and an epoch is a fixed group of slots used for committees, checkpoints, and consensus accounting.",
    sections: [
      {
        heading: "The clock",
        paragraphs: [
          "Beacon time advances in slots, with a target duration defined by the consensus specification. A slot may contain a proposed block or may be missed; the chain does not invent a block just because the clock advanced. Epochs group slots and provide boundaries for committee assignments, checkpoint processing, rewards, and finality calculations. The exact current constants belong to the active network configuration, not a generic application assumption.",
          "An execution RPC method such as `eth_blockNumber` reports an execution block height, not a slot or epoch. A block can be absent for a slot, and an execution block’s timestamp is not a complete substitute for the Beacon clock. Use the [[beacon-api|Beacon API]] when an application needs consensus slot or epoch data.",
        ],
      },
      {
        heading: "How RPC sees time",
        paragraphs: [
          "Applications often poll the latest block and infer freshness, but that view can lag the consensus clock or move during [[fork-choice|fork choice]]. A health service should compare execution head, Beacon head, safe and finalized checkpoints, and wall-clock age. For indexing, store the block number, hash, slot if available, and parent hash so a missed slot is not mistaken for an empty execution block.",
          "A missed slot is not automatically a [[reorg|reorganization]] or a node failure. It may indicate that no proposer published a block or that the node has not received one yet. Repeated missed slots, late attestations, and increasing head lag are operational signals; a single empty slot is normal enough to model explicitly.",
        ],
      },
      {
        heading: "Epoch boundaries",
        paragraphs: [
          "Epoch transitions can change committee assignments and checkpoint state, so systems that schedule validator or consensus work should use the consensus client’s view rather than a local timer alone. A [[validator-client|validator client]] obtains duties and signs the exact objects assigned for its slot and epoch. An RPC consumer that only displays balances may not need this precision, but monitoring and block-production systems do.",
          "When combining data from a [[consensus-client|consensus client]] and [[execution-client|execution client]], include identifiers from both layers. A Beacon block references an execution payload, while the payload has its own block hash and state commitment. Correlating by timestamp alone can join records from different views or miss a skipped slot.",
        ],
      },
    ],
    pitfalls: [
      "Assuming every slot contains an execution block.",
      "Using execution block number as if it were a Beacon slot or epoch.",
      "Calling one missed slot a reorganization without checking block ancestry and consensus state.",
      "Scheduling validator duties from a wall clock without obtaining the consensus client’s assigned duty.",
    ],
    related: ["proof-of-stake", "beacon-api", "consensus-client", "execution-client", "fork-choice", "finality", "validator-client", "beacon-block", "reorg", "execution-payload"],
    sources: [
      { title: "Consensus specs: Configuration", url: "https://github.com/ethereum/consensus-specs/blob/dev/configs/mainnet.yaml" },
      { title: "ethereum.org: Proof-of-stake", url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/" },
    ],
  },
  {
    id: "fork-choice",
    title: "Fork choice",
    category: "consensus",
    aliases: ["LMD-GHOST", "head selection", "canonical head"],
    summary: "Fork choice selects the currently preferred valid Beacon chain head from competing blocks using the latest validator votes and consensus rules.",
    sections: [
      {
        heading: "Head is not finality",
        paragraphs: [
          "A [[consensus-client|consensus client]] may know several valid branches at the same height. The fork-choice rule weighs the latest available attestations and chooses the head that should be extended. That head can change when a competing block or delayed vote arrives. [[finality|finalized checkpoints]] are a stronger, separate property: a latest head can be reorganized even when the finalized history remains stable.",
          "The selected consensus head is sent to the execution client through [[engine-api|Engine API]] alongside safe and finalized references. The execution client validates the associated [[execution-payload|execution payload]] and reports whether it can execute it. A consensus head with an INVALID payload cannot be treated as an ordinary alternative branch.",
        ],
      },
      {
        heading: "What applications should use",
        paragraphs: [
          "Fast UI updates often use the unsafe latest head, while accounting, indexing, and settlement choose a confirmation depth or finalized checkpoint. A block number alone is insufficient to identify one branch during a [[reorg|reorganization]]; store its hash and parent hash. For state reads that must agree, use an explicit block hash or number rather than asking several endpoints for `latest` independently.",
          "A [[rpc-provider|provider]] may expose latest, safe, and finalized block tags, but the tags describe the provider’s node view. If a decision needs independent assurance, verify the header or state commitment through a trusted consensus path and a [[state-proof|state proof]] where appropriate. Fork choice gives a protocol view; it does not make a provider response self-authenticating.",
        ],
      },
      {
        heading: "Diagnosing disagreement",
        paragraphs: [
          "Compare the execution head hash, Beacon head root, safe and finalized roots, peer status, and Engine API payload statuses. If two nodes differ briefly, propagation delay may be enough; if one remains on an old head, it may be syncing, partitioned, resource-starved, or following a different network. An [[observability|observability]] system should record the transition instead of treating every head change as an outage.",
          "Indexers should make reorganization handling explicit. Keep provisional records until the application’s [[confirmations|confirmation]] policy is met, and reconcile removed logs and block descendants when the preferred branch changes. A sticky RPC connection can reduce inconsistent reads but cannot prevent protocol-level head changes.",
        ],
      },
    ],
    pitfalls: [
      "Calling the latest head final before a finalized checkpoint supports that conclusion.",
      "Comparing block numbers without block hashes during competing branches.",
      "Assuming Engine API head selection replaces execution payload validation.",
      "Making an indexer irreversible at the first observation of a block.",
    ],
    related: ["proof-of-stake", "consensus-client", "engine-api", "execution-payload", "finality", "reorg", "confirmations", "state-proof", "observability", "rpc-provider"],
    sources: [
      { title: "Consensus specs: Fork choice", url: "https://github.com/ethereum/consensus-specs/tree/dev/specs/phase0/fork-choice" },
      { title: "Ethereum Engine API", url: "https://github.com/ethereum/execution-apis/tree/main/src/engine" },
    ],
  },
  {
    id: "finality",
    title: "Finality",
    category: "consensus",
    aliases: ["finalized checkpoint", "justification", "FFG finality"],
    summary: "Finality is the consensus guarantee that a checkpoint has received the required validator support and is not expected to be reverted during ordinary operation.",
    sections: [
      {
        heading: "Justified and finalized checkpoints",
        paragraphs: [
          "The Beacon consensus rules track checkpoints at epoch boundaries. Validator attestations contribute to the supermajority conditions for justification and then finalization. A [[consensus-client|consensus client]] exposes these checkpoints through its APIs and uses them when reporting the head’s safe and finalized context. Finalization does not mean every RPC query is immediately available on every node; propagation and execution still take time.",
          "Finality is stronger than a chosen latest block but it is not a magic proof of every application response. A finalized [[block-header|header]] can anchor a [[state-proof|state proof]], while the proof path still needs to be checked. A provider that labels a response ‘finalized’ is reporting its block tag; the verifier must decide whether the header and value are authentic for its threat model.",
        ],
      },
      {
        heading: "How RPC uses it",
        paragraphs: [
          "Execution JSON-RPC supports block tags such as `safe` and `finalized` where the client implements them. These tags are useful for reads that trade freshness for stability, including balances, contract calls, and indexer checkpoints. They do not turn a query into a cross-request snapshot unless every related call uses the same resolved block identifier or hash.",
          "A [[full-node|full node]] can be caught up to the latest head while still waiting for a finalized checkpoint, and a node may expose finalized data later than another node. Health checks should track finalized epoch and execution block hash separately from process liveness. For settlement workflows, use the policy appropriate to the value at risk rather than copying a universal number of confirmations.",
        ],
      },
      {
        heading: "When finality stalls",
        paragraphs: [
          "No finalized checkpoint for longer than expected can reflect missed attestations, client bugs, network participation loss, or a serious consensus event. Inspect validator participation, peer connectivity, slot processing, consensus-client logs, and Engine API payload statuses. Do not infer cause from an unchanged execution `eth_blockNumber` alone; skipped slots and a stalled execution engine produce different symptoms.",
          "Applications should keep provisional and finalized data distinguishable. An [[indexer|indexer]] can ingest latest blocks for low-latency views, then mark records durable only after its confirmation or finalized policy. A [[light-client|light client]] may follow finalized consensus headers while requesting execution proofs from another source, so document the composition of those trust steps.",
        ],
      },
    ],
    pitfalls: [
      "Treating a provider’s finalized tag as cryptographic verification of the returned value.",
      "Using a fixed confirmation count as if it were a network-wide finality guarantee.",
      "Assuming finalized data is available at identical times on every RPC endpoint.",
      "Ignoring consensus participation and Engine API health when finality stops advancing.",
    ],
    related: ["proof-of-stake", "consensus-client", "fork-choice", "beacon-api", "block-header", "state-proof", "light-client", "indexer", "confirmations", "engine-api"],
    sources: [
      { title: "ethereum.org: Proof-of-stake", url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/" },
      { title: "Consensus specs: Fork choice", url: "https://github.com/ethereum/consensus-specs/tree/dev/specs/phase0/fork-choice" },
    ],
  },
  {
    id: "execution-payload",
    title: "Execution payload",
    category: "consensus",
    aliases: ["execution block", "payload", "EL payload"],
    summary: "An execution payload is the transaction, fee, withdrawal, and block-context data that the consensus layer asks the execution client to validate and execute.",
    sections: [
      {
        heading: "The payload boundary",
        paragraphs: [
          "After the Merge, a Beacon block carries an execution payload rather than having the consensus client execute transactions itself. The payload includes execution block fields, transactions, withdrawals where applicable, and commitments such as the [[state-root|state root]]. The paired [[execution-client|execution client]] applies the EVM rules, checks the payload, and returns a status over [[engine-api|Engine API]].",
          "The consensus client uses that status while validating a [[beacon-block|Beacon block]] and applying [[fork-choice|fork choice]]. An INVALID status is materially different from SYNCING: the former says the payload violates execution rules, while the latter says the engine lacks context to decide. Operators should preserve the payload identifier and status in diagnostics.",
        ],
      },
      {
        heading: "Builder and proposer flow",
        paragraphs: [
          "A proposer may obtain a locally built payload or receive one through a block-building market such as [[mev-boost|MEV-Boost]]. The validator signs a Beacon block that commits to the chosen execution payload header. The proposer signs that header before it has the payload, so at signing time it relies on the relay; afterwards every node's consensus and execution clients validate the published payload by protocol rules, so a builder cannot make an invalid block canonical, only cost the proposer its slot.",
          "RPC callers usually see the resulting execution block through `eth_getBlockByHash` or a subscription, not through Engine API. If an application needs to correlate a Beacon block to execution data, use explicit payload and block identifiers, account for reorgs, and avoid joining records by timestamp alone.",
        ],
      },
      {
        heading: "Operational checks",
        paragraphs: [
          "Track payload validation latency, Engine API request errors, missing execution data, and differences between the execution head and Beacon head. A slow database or insufficient [[node-hardware|hardware]] can cause the consensus client to miss proposal deadlines even when the P2P layer is healthy. Keep the local JWT secret protected and make Engine API reachable only by the intended paired processes.",
          "For RPC infrastructure, the payload pipeline determines when a new block becomes visible and whether a node can safely be admitted to a pool. A [[health-check|health check]] should compare block hashes and finalized context across both clients, while an [[indexer|indexer]] should wait for its own confirmation policy before treating payload-derived logs as durable.",
        ],
      },
    ],
    pitfalls: [
      "Calling the execution payload a Beacon block without the surrounding consensus object and signatures.",
      "Treating SYNCING and INVALID Engine API statuses as the same failure.",
      "Assuming a builder or relay bypasses local execution validation.",
      "Correlating Beacon and execution records only by timestamp.",
    ],
    related: ["engine-api", "execution-client", "consensus-client", "beacon-block", "fork-choice", "mev-boost", "state-root", "node-hardware", "health-check", "indexer"],
    sources: [
      { title: "Ethereum Engine API", url: "https://github.com/ethereum/execution-apis/tree/main/src/engine" },
      { title: "Execution API schemas", url: "https://github.com/ethereum/execution-apis/tree/main/src" },
    ],
  },
  {
    id: "block-proposal",
    title: "Block proposal",
    category: "consensus",
    aliases: ["proposer duty", "validator proposal", "proposed block"],
    summary: "Block proposal is the validator duty of assembling and signing a Beacon block for an assigned slot, including an execution payload when one is available.",
    sections: [
      {
        heading: "Getting the duty",
        paragraphs: [
          "A [[validator-client|validator client]] learns its proposer assignment from the [[consensus-client|consensus client]] and must act in the slot’s time window. The Beacon node supplies chain context and the execution client supplies a valid payload or collaborates with a builder. With a locally built payload the node's own execution client has already executed it; with a builder's payload the validator signs a blinded block carrying only the payload header, relying on the relay to have checked the payload and to publish it. Either way the signed block then goes out to the consensus network.",
          "Proposal is different from attestation. An attester votes on a block and checkpoint; a proposer creates the block that others may attest to. Both duties depend on correct slot timing and a synchronized node, and both are affected by peer propagation and execution payload readiness.",
        ],
      },
      {
        heading: "Local and builder paths",
        paragraphs: [
          "A proposer can build a payload locally from the execution client’s transaction pool or use a builder path coordinated by [[mev-boost|MEV-Boost]]. The builder path changes who assembles transaction ordering and how the payload is delivered; it does not remove the consensus client’s or execution client’s validity checks. The signed Beacon block commits to the selected payload header.",
          "The execution client remains responsible for evaluating the payload, checking gas and state transition rules, and returning its status over [[engine-api|Engine API]]. If the payload is unavailable or invalid, the proposer must follow the consensus client’s handling rather than blindly sign arbitrary bytes. This boundary is central to diagnosing missed proposals.",
        ],
      },
      {
        heading: "Monitoring proposal quality",
        paragraphs: [
          "Record the assigned slot, duty source, payload path, block root, execution payload status, propagation time, and whether other nodes observed the block. A missed proposal may be caused by key availability, validator-client configuration, consensus sync, execution lag, builder or relay availability, or peer networking. Use logs from all three relevant processes instead of blaming the RPC endpoint from which a status was read.",
          "A public RPC service should not share validator signing keys or give application callers proposal control. It can expose resulting blocks and receipts after validation, while a [[health-check|health check]] confirms the node’s execution and consensus views. An [[indexer|indexer]] should treat a proposed block as provisional until its [[fork-choice|fork choice]] and confirmation policy accept it.",
        ],
      },
    ],
    pitfalls: [
      "Confusing the proposer duty with the attester duty: one validator builds and signs the block for a slot, while the committee only votes on it.",
      "Assuming MEV-Boost makes the local execution client optional.",
      "Signing a payload before Engine API and consensus checks complete.",
      "Diagnosing a missed proposal from an application RPC response alone.",
    ],
    related: ["proof-of-stake", "validator-client", "consensus-client", "execution-client", "execution-payload", "engine-api", "mev-boost", "fork-choice", "health-check", "indexer"],
    sources: [
      { title: "ethereum.org: Block proposal", url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/block-proposal/" },
      { title: "Ethereum consensus specifications", url: "https://github.com/ethereum/consensus-specs" },
    ],
  },
  {
    id: "beacon-block",
    title: "Beacon block",
    category: "consensus",
    aliases: ["Beacon block body", "Beacon header", "consensus block"],
    summary: "A Beacon block is a consensus-layer object containing slot and proposer data, attestations and other consensus operations, and an execution payload or its header.",
    sections: [
      {
        heading: "What the block commits to",
        paragraphs: [
          "A Beacon block is signed and propagated by the consensus network. Its header and body commit to proposer information, parent root, state root, attestations, deposits or withdrawals-related operations where applicable, and the execution payload fields. The exact schema changes with network forks, so consumers should follow the versioned consensus specifications and [[beacon-api|Beacon API]] schemas rather than hard-code an old body shape.",
          "The execution payload links consensus to the execution [[block-header|header]], transaction list, receipts and resulting [[state-root|state root]]. A verifier needs to authenticate both the Beacon chain context and the execution commitment before using a block as a trusted anchor for a [[state-proof|state proof]].",
        ],
      },
      {
        heading: "Block lifecycle",
        paragraphs: [
          "A selected proposer assembles and signs a block for a [[slot-epoch|slot]], peers validate it, and validators attest to the block and checkpoint. The [[consensus-client|consensus client]] applies fork choice as blocks and votes arrive; later epochs may justify and finalize checkpoints. The latest Beacon block can therefore be visible before it is final, and it may be replaced during a [[reorg|reorganization]].",
          "The execution client validates the embedded payload through [[engine-api|Engine API]]. A Beacon block with an invalid payload is not made valid by signatures from a proposer or by an RPC provider returning it. Block roots, payload hashes, parent roots, and execution commitments are the identifiers to preserve in an index or audit trail.",
        ],
      },
      {
        heading: "Reading through RPC",
        paragraphs: [
          "Beacon blocks are queried from a consensus endpoint, while execution blocks are queried through execution [[json-rpc|JSON-RPC]]. An application that combines both should record the slot, Beacon root, execution block hash, and canonicality status. Joining only on a number or timestamp risks mixing an execution block with the wrong consensus container, especially around missed slots or reorgs.",
          "For a light-client or proof workflow, treat the Beacon header and execution payload header as separate verification steps linked by the protocol schema. For ordinary UI data, it may be enough to wait for [[finality|finality]] or confirmations. For a high-value action, retain the source headers and verification evidence instead of trusting a cached response.",
        ],
      },
    ],
    pitfalls: [
      "Treating a Beacon block schema as immutable across network upgrades.",
      "Using an execution block number as the Beacon block root.",
      "Calling a proposer signature proof of execution payload validity.",
      "Indexing a latest Beacon block irreversibly before fork choice and finality policy allow it.",
    ],
    related: ["consensus-client", "beacon-api", "execution-payload", "block-header", "state-root", "state-proof", "slot-epoch", "fork-choice", "finality", "reorg"],
    sources: [
      { title: "Ethereum Beacon APIs", url: "https://ethereum.org/developers/apis/ethereum-consensus-api/" },
      { title: "Ethereum consensus specifications", url: "https://github.com/ethereum/consensus-specs" },
    ],
  },
  {
    id: "mev-boost",
    title: "MEV-Boost",
    category: "consensus",
    aliases: ["PBS middleware", "builder API", "relay", "proposer-builder separation"],
    summary: "MEV-Boost is middleware that lets a proof-of-stake proposer request execution payload bids from builders through relays while retaining local consensus validation and signing control.",
    sections: [
      {
        heading: "Why it exists",
        paragraphs: [
          "Maximal extractable value can make block construction complex and competitive. MEV-Boost lets a validator’s setup receive candidate payload bids from external builders instead of assembling every transaction locally. The proposer’s [[consensus-client|consensus client]] asks the middleware for a bid, and the middleware communicates with configured relays and builders using the builder API. The resulting Beacon block still goes through the normal consensus process.",
          "A builder creates a payload and bid; a relay mediates delivery and may apply its own policy; the proposer chooses whether to accept a bid. The execution client stays connected through the [[engine-api|Engine API]] and builds a local fallback payload, but on the builder path the proposer signs a blinded block, only the payload header, without seeing the payload itself: the relay has checked the builder's block and publishes it after the signature, and every node's execution client, the proposer's included, validates it only on import. MEV-Boost changes block-building topology, not the definition of a valid execution state transition.",
        ],
      },
      {
        heading: "Trust and failure boundaries",
        paragraphs: [
          "Relays and builders are additional dependencies. A validator may lose a proposal opportunity if the middleware, relay, network, or builder is unavailable, but it should not sign an invalid payload. Operators choose relay lists, timeout policies, and fallback behavior; those choices affect censorship resistance, availability, and expected value. The validator client’s signing key must stay outside the builder and relay path.",
          "The payload status returned by the execution client and the consensus client’s checks remain authoritative for local acceptance. A [[rpc-provider|provider]] endpoint can expose blocks produced through this path, but it does not prove that a relay was honest or that a latest block is final. Use consensus headers, payload commitments, and [[finality|finality]] when an application needs stronger evidence.",
        ],
      },
      {
        heading: "Operating the path",
        paragraphs: [
          "Monitor bid availability, relay response time, builder errors, fallback rate, proposal success, payload validation, and peer propagation. Correlate a missed proposal with the validator client, MEV-Boost logs, relay responses, consensus slot, and execution Engine API status. An RPC health check alone cannot tell whether the proposer had a usable bid in time.",
          "Keep MEV-Boost and relay configuration versioned, minimize trust in third-party endpoints, and rehearse fallback to local block construction. Public application traffic should not share the validator’s protected interfaces. A [[client-diversity|diverse client]] deployment can reduce correlated software failure, but it does not remove the operational dependency on builders and relays.",
        ],
      },
    ],
    pitfalls: [
      "Treating MEV-Boost as a replacement for the execution client or consensus client.",
      "Giving builders or relays access to validator signing keys.",
      "Assuming a successful bid means the payload bypassed local validation.",
      "Measuring only RPC uptime while ignoring relay timeouts and missed proposal duties.",
    ],
    related: ["proof-of-stake", "validator-client", "consensus-client", "execution-client", "execution-payload", "block-proposal", "beacon-block", "engine-api", "finality", "client-diversity"],
    sources: [
      { title: "Flashbots: MEV-Boost documentation", url: "https://docs.flashbots.net/flashbots-mev-boost/introduction" },
      { title: "MEV-Boost specification", url: "https://github.com/flashbots/mev-boost" },
    ],
  },
  {
    id: "validator",
    title: "Validator",
    category: "consensus",
    aliases: ["staker", "32 ETH", "effective balance", "validator index", "EIP-7251"],
    summary: "A validator is an entry in the beacon state, identified by a BLS public key and an index, funded by a deposit of at least 32 ETH, and assigned to attest in every epoch and to propose a block when selected.",
    sections: [
      {
        heading: "A record, not a machine",
        paragraphs: [
          "The validator lives in the consensus state: an index, a public key, withdrawal credentials, an actual balance, and an effective balance that is rounded down and used for all weighting. One physical server can run thousands of validators, and a [[validator-client|validator client]] can move to new hardware without the chain noticing, because the identity is the key and the index, never the host.",
          "The floor is 32 ETH. Since Pectra, [[eip|EIP-7251]] raises the maximum effective balance to 2048 ETH for validators whose withdrawal credentials use the `0x02` compounding prefix, so one record can hold consolidated stake and earn on all of it instead of being split across dozens of 32 ETH entries. Effective balance sets both [[attestation|attestation]] weight and proposer selection odds.",
        ],
      },
      {
        heading: "Duties",
        paragraphs: [
          "Every active validator attests exactly once per epoch, in one assigned committee and one of the 32 slots. Proposing is rarer and probabilistic: each 12-second slot has one proposer chosen by RANDAO with probability proportional to effective balance. A small rotating subset also serves on the [[sync-committee|sync committee]]. Duties are fetched from the [[beacon-node|beacon node]] over the [[beacon-api|Beacon API]] an epoch or more ahead.",
          "Rewards are paid for timely and correct votes; missing a duty forfeits that reward and costs a matching penalty, which is why an offline validator bleeds slowly rather than catastrophically. If the chain stops finalizing, the inactivity leak drains non-participating validators until the active set shrinks enough to finalize again. Equivocation is different in kind and is handled by [[slashing|slashing]].",
        ],
      },
      {
        heading: "Lifecycle, and where RPC sees it",
        paragraphs: [
          "A deposit to the [[execution-layer|execution layer]] deposit contract enters an activation queue limited by the churn rate; exits, whether voluntary or triggered from the execution layer by [[eip|EIP-7002]], go through a matching queue and then a withdrawal delay. Since [[eip|EIP-6110]] deposits are read from the block itself rather than through a separate voting mechanism, which shortens activation latency.",
          "No `eth_` method lists validators. They are read from the Beacon API at `/eth/v1/beacon/states/{state_id}/validators/{id}`, which returns an index, a gwei balance, and a `status` such as `active_ongoing` or `exited_unslashed`. What does surface in execution [[json-rpc|JSON-RPC]] is the payout: [[withdrawals|withdrawals]] appear in the block’s `withdrawals` array as bare balance increases, with no transaction, no receipt, and no log to index.",
        ],
      },
    ],
    example: {
      title: "One validator read from the Beacon API",
      language: "json",
      code: "// GET /eth/v1/beacon/states/head/validators/1234567\n{\n  \"execution_optimistic\": false,\n  \"finalized\": true,\n  \"data\": {\n    \"index\": \"1234567\",\n    \"balance\": \"32041938475\",\n    \"status\": \"active_ongoing\",\n    \"validator\": {\n      \"pubkey\": \"0xb4a1f2…9c0d\",\n      \"withdrawal_credentials\": \"0x010000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045\",\n      \"effective_balance\": \"32000000000\",\n      \"slashed\": false,\n      \"activation_eligibility_epoch\": \"281940\",\n      \"activation_epoch\": \"281946\",\n      \"exit_epoch\": \"18446744073709551615\",\n      \"withdrawable_epoch\": \"18446744073709551615\"\n    }\n  }\n}",
      note: "Beacon API numbers are decimal strings in gwei, not `0x` [[hex-encoding|QUANTITY]]; `18446744073709551615` is the far-future epoch meaning this validator has not been scheduled to exit.",
    },
    pitfalls: [
      "Reading `balance` when you meant `effective_balance`; only the rounded effective balance drives attestation weight and proposer odds.",
      "Assuming every validator is exactly 32 ETH, which stopped being true once Pectra allowed compounding credentials up to 2048 ETH.",
      "Confusing being offline with being slashed; downtime costs roughly what the missed reward was worth, equivocation costs far more.",
      "Indexing ETH movements from transactions alone and missing withdrawals, which credit an address with no transaction or receipt.",
    ],
    related: ["attestation", "proof-of-stake", "validator-client", "slashing", "sync-committee", "block-proposal", "slot-epoch", "withdrawals", "beacon-api", "finality"],
    sources: [
      { title: "ethereum.org: Staking", url: "https://ethereum.org/staking/" },
      { title: "EIP-7251: Increase the MAX_EFFECTIVE_BALANCE", url: "https://eips.ethereum.org/EIPS/eip-7251" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
    ],
  },
  {
    id: "attestation",
    title: "Attestation",
    category: "consensus",
    aliases: ["vote", "attestation data", "committee vote", "aggregate", "LMD vote"],
    summary: "An attestation is a validator’s signed vote carrying three claims at once: the head block it currently sees, the source checkpoint it votes from, and the target checkpoint it votes to justify.",
    sections: [
      {
        heading: "Three votes in one signature",
        paragraphs: [
          "The signed object is small. `slot` and `index` say which committee and when, `beacon_block_root` is the head vote that feeds [[fork-choice|LMD-GHOST]], and the `source` and `target` checkpoint pairs are the Casper FFG vote that feeds [[finality|finality]]. One message therefore serves both rules, which is why the same vote can be wrong in two different ways and why [[slashing|slashing]] conditions are written over source and target rather than over the head.",
          "Timing is fixed by the slot. A committee member attests once its assigned slot’s [[beacon-block|beacon block]] arrives, or at one third into the 12-second slot if it has not, and designated aggregators publish at two thirds. A vote that arrives late still counts for [[fork-choice|fork choice]] but earns less, which makes clock skew an expensive configuration error.",
        ],
      },
      {
        heading: "Committees and aggregation",
        paragraphs: [
          "Every active [[validator|validator]] is placed in exactly one committee per epoch, so the whole set votes once across the 32 slots. Members with identical attestation data have their BLS signatures aggregated into a single signature plus an `aggregation_bits` bitfield marking who signed. Individual attestations travel on 64 attestation [[libp2p-gossip|gossip subnets]], aggregates on one global topic, and the next proposer packs the aggregates into the block body.",
          "Aggregation is what makes the numbers work. Over a million validators voting individually could never fit in a block; as bitfields over committees they do. The cost is that an application reading attestations sees committee-level objects, and mapping a bit back to a validator index requires the committee assignment for that slot from the [[beacon-api|Beacon API]].",
        ],
      },
      {
        heading: "From a gossip message to a block tag",
        paragraphs: [
          "Attestations are the mechanism behind two block tags an ordinary RPC caller uses daily. Enough target votes in an epoch justify a checkpoint, which the [[consensus-client|consensus client]] reports as `safe`; two consecutive justifications finalize the earlier one, which becomes `finalized`. Those roots are pushed to the [[execution-client|execution client]] on every `engine_forkchoiceUpdated` over the [[engine-api|Engine API]].",
          "That chain is also the failure mode. When participation drops, `latest` keeps advancing normally while `finalized` stops moving, and an application that settles on `finalized` stalls with no error anywhere in its [[json-rpc|JSON-RPC]] responses. Monitoring attestation participation and inclusion distance catches it earlier than watching block numbers.",
        ],
      },
    ],
    example: {
      title: "One aggregated attestation from a beacon block body",
      language: "json",
      code: "// GET /eth/v2/beacon/blocks/head\n// → .data.message.body.attestations[0]\n{\n  \"aggregation_bits\": \"0xffffffffffbfffffffffffffffffdfff7f\",\n  \"data\": {\n    \"slot\": \"9482112\",\n    \"index\": \"12\",\n    \"beacon_block_root\": \"0x8f4c2b…a91d\",\n    \"source\": { \"epoch\": \"296315\", \"root\": \"0x1c7ab3…44e0\" },\n    \"target\": { \"epoch\": \"296316\", \"root\": \"0x8f4c2b…a91d\" }\n  },\n  \"signature\": \"0xa7f1c9…3b02\"\n}\n\n// which validator is which bit?\n// GET /eth/v1/beacon/states/head/committees?slot=9482112&index=12",
      note: "Each cleared bit is a committee member who did not attest in time; the zeroes, not the signature, are what participation dashboards count.",
    },
    pitfalls: [
      "Reading an attestation as a vote for one block only; it also commits to a source and a target checkpoint.",
      "Trying to identify a signer from `aggregation_bits` without fetching the committee assignment for that exact slot and index.",
      "Running a node with drifting clocks, which produces late attestations that earn less and degrade gossip peer scores.",
      "Watching only block height for chain health, when stalled participation shows up first as a `finalized` tag that stops advancing.",
    ],
    related: ["fork-choice", "finality", "validator", "beacon-block", "slot-epoch", "sync-committee", "slashing", "beacon-api", "engine-api", "libp2p-gossip"],
    sources: [
      { title: "Ethereum consensus specifications", url: "https://github.com/ethereum/consensus-specs" },
      { title: "ethereum.org: Attestations", url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/attestations/" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
    ],
  },
  {
    id: "sync-committee",
    title: "Sync committee",
    category: "consensus",
    aliases: ["Altair", "sync aggregate", "light client update", "512 validators"],
    summary: "A sync committee is a set of 512 validators, resampled every 256 epochs (about 27 hours), whose members sign each new block header so a [[light-client|light client]] can follow the chain by checking one aggregate signature per slot.",
    sections: [
      {
        heading: "Why a small committee exists",
        paragraphs: [
          "Following [[fork-choice|fork choice]] honestly means tracking the entire active validator set and the [[attestation|attestations]] it produces, which is far beyond a browser extension or an embedded device. The Altair upgrade added a deliberately small, slowly rotating committee so that a verifier only has to know 512 BLS public keys at a time to decide whether a header is real.",
          "Slow rotation is the other half of the design. Membership for the next period is derivable one full period in advance, so a client that trusts the committee for period N can prove the committee for period N+1 from the state it already verified, and hop forward indefinitely from one trusted starting point, the same kind of [[weak-subjectivity|weak subjectivity]] anchor a full node needs.",
        ],
      },
      {
        heading: "How the signature is carried",
        paragraphs: [
          "Members are sampled by effective [[validator|validator]] balance for a period of 256 epochs, which is 8192 slots or roughly 27 hours. Each member signs the block root of the current slot, and the following [[beacon-block|beacon block]] carries a `sync_aggregate` holding a 512-bit `sync_committee_bits` field and one aggregated signature. Serving on the committee pays extra and missing it is penalized.",
          "Light clients consume this through dedicated [[beacon-api|Beacon API]] routes: a bootstrap at a trusted block root, then `light_client` updates, finality updates, and optimistic updates. Each update proves the next committee with a Merkle branch against the [[ssz|SSZ]] beacon state, so the client never has to trust the server that handed it the bytes.",
        ],
      },
      {
        heading: "What it does and does not prove",
        paragraphs: [
          "This is the machinery behind [[verified-rpc|verified RPC]] proxies such as Helios and the [[nimbus|Nimbus]] verified proxy. They follow sync committee updates to obtain a trusted execution [[block-header|header]], then answer `eth_` calls locally by fetching an [[eth-get-proof|eth_getProof]] from an untrusted [[rpc-provider|provider]] and checking it against that header’s [[state-root|state root]].",
          "The guarantee is weaker than [[finality|finality]]. A client requires a supermajority of the 512 bits before accepting an update, but sync committee messages are not slashable, so a dishonest committee risks far less than an equivocating attester. Use it as a cheap canonicality check, and still wait for a finalized checkpoint when the answer is worth real money.",
        ],
      },
    ],
    pitfalls: [
      "Treating a sync committee signature as equivalent to finality; committee members are penalized for absence but not slashed for signing a wrong header.",
      "Bootstrapping a light client from an arbitrary block root without checking it, which reintroduces the weak subjectivity problem it was meant to solve.",
      "Assuming the committee rotates per epoch; it is resampled once per 256-epoch period of roughly 27 hours.",
      "Expecting the sync aggregate to prove execution state directly, when it only authenticates a header that a separate proof must be checked against.",
    ],
    related: ["light-client", "attestation", "validator", "consensus-proof", "verified-rpc", "finality", "beacon-block", "weak-subjectivity", "beacon-api", "eth-get-proof"],
    sources: [
      { title: "Consensus specs: Altair light client", url: "https://github.com/ethereum/consensus-specs/tree/dev/specs/altair/light-client" },
      { title: "ethereum.org: Light clients", url: "https://ethereum.org/developers/docs/nodes-and-clients/light-clients/" },
    ],
  },
  {
    id: "slashing",
    title: "Slashing",
    category: "consensus",
    aliases: ["proposer slashing", "attester slashing", "surround vote", "double vote", "EIP-3076"],
    summary: "Slashing is the protocol’s punishment for a validator that signs two conflicting messages: a second block for the same slot, or two attestations that double-vote or surround one another.",
    sections: [
      {
        heading: "Two offences, both equivocation",
        paragraphs: [
          "A proposer slashing is two distinct signed [[beacon-block|beacon blocks]] for the same slot by the same [[validator|validator]]. An attester slashing is two different [[attestation|attestations]] that either share a target epoch, whichever of their fields differs, or where one vote’s source-to-target span strictly surrounds the other’s. Both are provable from the two signatures alone, with no reference to network conditions.",
          "Because the evidence is self-contained, anyone can submit it: the whistleblower is rewarded and the proposer who includes the evidence takes a share. This is why being offline is a completely different category. Downtime forfeits rewards and applies a roughly matching penalty; equivocation forces an exit and destroys stake.",
        ],
      },
      {
        heading: "What it costs",
        paragraphs: [
          "A slashed validator is marked immediately, takes an initial penalty, stops earning, and is queued for a forced exit with a withdrawal delay measured in weeks. Part-way through that delay a correlation penalty is applied that scales with how much total stake was slashed in the same window, so an isolated mistake is survivable while a correlated failure across a large operator or a single client implementation is ruinous.",
          "That design is deliberate. It prices the difference between one misconfigured box and a coordinated attempt to finalize two chains, and it is the reason [[client-diversity|client diversity]] is a financial argument for stakers rather than only an idealistic one.",
        ],
      },
      {
        heading: "Preventing it, and seeing it over RPC",
        paragraphs: [
          "The [[validator-client|validator client]] maintains a slashing protection database recording, per key, the highest block slot signed and the highest source and target epochs attested, exportable in the [[eip|EIP-3076]] interchange format. The classic incident is not an attack but an operator running one key in two places: a failover that never fenced the old host, or a restore from a data-directory backup without the current protection file.",
          "Nothing in execution [[json-rpc|JSON-RPC]] reports a slashing. The evidence appears in the block body as `proposer_slashings` and `attester_slashings`, and the validator’s [[beacon-api|Beacon API]] `status` moves to a slashed state; much later the remaining balance shows up as an ordinary [[withdrawals|withdrawal]] entry in an execution block with no transaction or receipt.",
        ],
      },
    ],
    example: {
      title: "The slashing protection record that prevents a double sign",
      language: "json",
      code: "// EIP-3076 interchange export from a validator client\n{\n  \"metadata\": { \"interchange_format_version\": \"5\", \"genesis_validators_root\": \"0x4b363db9…95673\" },\n  \"data\": [\n    {\n      \"pubkey\": \"0xb4a1f2…9c0d\",\n      \"signed_blocks\": [ { \"slot\": \"9482112\" } ],\n      \"signed_attestations\": [ { \"source_epoch\": \"296315\", \"target_epoch\": \"296316\" } ]\n    }\n  ]\n}",
      note: "Import this before starting a key on new hardware; without it the new client has no record of what the old one already signed.",
    },
    pitfalls: [
      "Believing that going offline gets you slashed; downtime is a small penalty, while signing two conflicting messages is not.",
      "Restoring a validator from a data-directory backup without the current slashing protection database, then signing an already-signed slot.",
      "Building an active-active failover for the same keys, which is the most common way operators slash themselves.",
      "Looking for slashing events in execution JSON-RPC, when the evidence only appears in the beacon block body and the Beacon API status.",
    ],
    related: ["validator", "validator-client", "attestation", "block-proposal", "proof-of-stake", "beacon-block", "withdrawals", "client-diversity", "finality", "beacon-api"],
    sources: [
      { title: "Ethereum consensus specifications", url: "https://github.com/ethereum/consensus-specs" },
      { title: "EIP-3076: Slashing Protection Interchange Format", url: "https://eips.ethereum.org/EIPS/eip-3076" },
      { title: "ethereum.org: Staking", url: "https://ethereum.org/staking/" },
    ],
  },
  {
    id: "mev",
    title: "MEV",
    category: "consensus",
    aliases: ["maximal extractable value", "sandwich", "frontrunning", "searcher", "bundle"],
    summary: "MEV, maximal extractable value, is the profit available to whoever chooses the order and inclusion of transactions in a block, captured through arbitrage, liquidations, and sandwiching of other people’s pending transactions.",
    sections: [
      {
        heading: "The value is in the ordering",
        paragraphs: [
          "The EVM is deterministic, but the result of a [[transaction|transaction]] depends on what executed before it. A swap that moves a price can be bracketed by a buy in front and a sell behind it, a loan that just became under-collateralized pays whoever liquidates it first, and a price gap between two venues is an atomic arbitrage. None of this requires a bug; it follows from a public [[mempool|transaction pool]] plus one party choosing the order.",
          "Searchers hunt these opportunities and express them as bundles: an ordered list of transactions that is either included together or not at all. A bundle can wrap someone else’s pending transaction, which is why a transaction sitting in the public pool is an input to someone else’s strategy before it is a block entry.",
        ],
      },
      {
        heading: "Who really builds the block",
        paragraphs: [
          "Since [[the-merge|the Merge]] most proposers do not assemble their own blocks. Builders compete to construct the highest-paying [[execution-payload|execution payload]], relays deliver the bids, and the [[validator-client|validator client]] signs a blinded header through [[mev-boost|MEV-Boost]] without seeing the contents until it has committed. The proposer takes the payment; the ordering decision belongs to the builder.",
          "The practical consequence for an RPC caller is that the block a transaction lands in was probably not assembled by the node it was submitted to. The `pending` [[block-tag|block tag]] and `txpool_content` describe one node’s local pool, not the ordering some builder is about to win the slot with.",
        ],
      },
      {
        heading: "What a caller can do about it",
        paragraphs: [
          "Calling [[eth-send-raw-transaction|eth_sendRawTransaction]] against a public endpoint publishes the signed transaction over [[devp2p|devp2p]] to every peer, searchers included, for as long as it waits. A simulation via [[eth-call|eth_call]] tells you what would happen against current state, not against the state your transaction will actually meet once other trades are inserted around it.",
          "The usual defences are a tight slippage bound and a deadline, so an unfavourable sandwich reverts rather than executing, and a [[private-rpc|private transaction endpoint]] that routes to builders instead of the public pool. Private routing has its own trade-offs: the receiving builder still sees the transaction, and reaching fewer builders can mean waiting longer for inclusion.",
        ],
      },
    ],
    pitfalls: [
      "Treating MEV as an exploit to be patched, when it is a consequence of public ordering that only the ordering mechanism can address.",
      "Setting a generous slippage tolerance for reliability, which is exactly the parameter a sandwich needs in order to be profitable.",
      "Reading `pending` or txpool_ output as the network's view, when it is one node's local pool and no builder is bound by it.",
      "Assuming a private RPC endpoint hides a transaction from everyone, when the builder receiving it necessarily sees it.",
    ],
    related: ["mev-boost", "mempool", "private-rpc", "block-proposal", "eth-send-raw-transaction", "execution-payload", "block-tag", "eip-1559", "txpool-api", "proof-of-stake"],
    sources: [
      { title: "ethereum.org: Maximal extractable value (MEV)", url: "https://ethereum.org/developers/docs/mev/" },
      { title: "Flashbots documentation", url: "https://docs.flashbots.net/" },
    ],
  },
];

export default { topics };
