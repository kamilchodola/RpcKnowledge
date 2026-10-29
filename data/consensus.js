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
          "Beacon time advances in slots, with a target duration defined by the consensus specification. A slot may contain a proposed block or may be missed; the chain does not invent a block just because the clock advanced. Epochs group slots and provide boundaries for committee assignments, checkpoint processing, rewards, and finality calculations. On mainnet a slot is 12 seconds (`SLOT_DURATION_MS` of 12000) and an epoch is 32 slots (`SLOTS_PER_EPOCH`), 6.4 minutes, but the exact constants belong to the active network configuration, not a generic application assumption.",
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
    related: ["proof-of-stake", "beacon-api", "consensus-client", "execution-client", "fork-choice", "finality", "validator-client", "beacon-block", "reorg", "execution-payload", "block-by-timestamp"],
    sources: [
      { title: "Consensus specs: Configuration", url: "https://github.com/ethereum/consensus-specs/blob/master/configs/mainnet.yaml" },
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
          "Compare the execution head hash, Beacon head root, safe and finalized roots, peer status, and Engine API payload statuses. If two nodes differ briefly, [[network-telemetry|propagation delay]] may be enough; if one remains on an old head, it may be syncing, partitioned, resource-starved, or following a different network. An [[observability|observability]] system should record the transition instead of treating every head change as an outage.",
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
      { title: "Consensus specs: Fork choice", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/phase0/fork-choice.md" },
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
    related: ["proof-of-stake", "consensus-client", "fork-choice", "beacon-api", "block-header", "state-proof", "light-client", "indexer", "confirmations", "engine-api", "fast-confirmation-rule", "cross-chain-relayer"],
    sources: [
      { title: "ethereum.org: Proof-of-stake", url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/" },
      { title: "Consensus specs: Fork choice", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/phase0/fork-choice.md" },
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
          "A proposer may obtain a locally built payload or receive one through a block-building market such as [[mev-boost|MEV-Boost]]. The validator signs a Beacon block that commits to the chosen execution payload header. The proposer signs that header before it has the payload, so at signing time it relies on the [[relay|relay]]; afterwards every node's consensus and execution clients validate the published payload by protocol rules, so a builder cannot make an invalid block canonical, only cost the proposer its slot.",
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
    related: ["engine-api", "execution-client", "consensus-client", "beacon-block", "fork-choice", "mev-boost", "state-root", "node-hardware", "health-check", "indexer", "enshrined-pbs"],
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
          "Record the assigned slot, duty source, payload path, block root, execution payload status, propagation time, and whether [[network-telemetry|other nodes observed the block]]. A missed proposal may be caused by key availability, validator-client configuration, consensus sync, execution lag, builder or relay availability, or peer networking. Use logs from all three relevant processes instead of blaming the RPC endpoint from which a status was read.",
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
    related: ["proof-of-stake", "validator-client", "consensus-client", "execution-client", "execution-payload", "engine-api", "mev-boost", "fork-choice", "health-check", "indexer", "builder-api"],
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
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "Ethereum consensus specifications", url: "https://github.com/ethereum/consensus-specs" },
    ],
  },
  {
    id: "mev-boost",
    title: "MEV-Boost",
    category: "consensus",
    aliases: ["PBS middleware", "proposer-builder separation"],
    summary: "MEV-Boost is middleware that lets a proof-of-stake proposer request execution payload bids from builders through relays while retaining local consensus validation and signing control.",
    sections: [
      {
        heading: "Why it exists",
        paragraphs: [
          "Maximal extractable value can make block construction complex and competitive. MEV-Boost lets a [[validator-node|validator’s setup]] receive candidate payload bids from external builders instead of assembling every transaction locally. The proposer’s [[consensus-client|consensus client]] asks the middleware for a bid, and the middleware communicates with configured [[relay|relays]] and builders using the [[builder-api|builder API]]. The resulting Beacon block still goes through the normal consensus process.",
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
          "Every active validator attests exactly once per epoch, in one assigned committee and one of the 32 slots. Proposing is rarer and probabilistic: each 12-second slot has one proposer chosen by [[randao|RANDAO]] with probability proportional to effective balance. A small rotating subset also serves on the [[sync-committee|sync committee]]. Duties are fetched from the [[beacon-node|beacon node]] over the [[beacon-api|Beacon API]] an epoch or more ahead.",
          "[[validator-rewards|Rewards]] are paid for timely and correct votes; missing a duty forfeits that reward and costs a matching penalty, which is why an offline validator bleeds slowly rather than catastrophically. If the chain stops finalizing, the inactivity leak drains non-participating validators until the active set shrinks enough to finalize again. Equivocation is different in kind and is handled by [[slashing|slashing]].",
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
    related: ["attestation", "proof-of-stake", "validator-client", "slashing", "sync-committee", "block-proposal", "slot-epoch", "withdrawals", "beacon-api", "finality", "distributed-validator"],
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
          "The signed object is small. `slot` says when; since Electra (EIP-7549) `index` is always `0` and the committee is named outside the signed data, as `committee_index` on a single attestation and as the `committee_bits` field of an aggregate. `beacon_block_root` is the head vote that feeds [[fork-choice|LMD-GHOST]], and the `source` and `target` checkpoint pairs are the Casper FFG vote that feeds [[finality|finality]]. One message therefore serves both rules, which is why the same vote can be wrong in two different ways and why [[slashing|slashing]] conditions are written over source and target rather than over the head.",
          "Timing is fixed by the slot. A committee member attests once its assigned slot’s [[beacon-block|beacon block]] arrives, or at one third into the 12-second slot if it has not, and designated aggregators publish at two thirds. A vote that arrives late still counts for [[fork-choice|fork choice]] but earns less, which makes clock skew an expensive configuration error.",
        ],
      },
      {
        heading: "Committees and aggregation",
        paragraphs: [
          "Every active [[validator|validator]] is placed in exactly one committee per epoch, so the whole set votes once across the 32 slots. Members with identical attestation data have their [[bls-signature|BLS signatures]] aggregated into a single signature plus an `aggregation_bits` bitfield marking who signed. Individual attestations travel on 64 attestation [[libp2p-gossip|gossip subnets]], per-committee aggregates on one global topic, and the next proposer merges aggregates with identical data from different committees into at most eight on-chain attestations per block, each with a `committee_bits` field marking the committees it covers.",
          "Aggregation is what makes the numbers work. Over a million validators voting individually could never fit in a block; as bitfields over committees they do. The cost is that an application reading attestations sees committee-level objects, and mapping a bit back to a validator index requires the assignments for that slot of every committee named in `committee_bits`, from the [[beacon-api|Beacon API]].",
        ],
      },
      {
        heading: "From a gossip message to a block tag",
        paragraphs: [
          "Attestations are the mechanism behind two block tags an ordinary RPC caller uses daily. Enough target votes in an epoch justify a checkpoint, which a [[consensus-client|consensus client]] not running the newer [[fast-confirmation-rule|Fast Confirmation Rule]] reports as `safe`; two consecutive justifications finalize the earlier one, which becomes `finalized`. Those roots are pushed to the [[execution-client|execution client]] on every `engine_forkchoiceUpdated` over the [[engine-api|Engine API]].",
          "That chain is also the failure mode. When participation drops, `latest` keeps advancing normally while `finalized` stops moving, and an application that settles on `finalized` stalls with no error anywhere in its [[json-rpc|JSON-RPC]] responses. Monitoring attestation participation and inclusion distance catches it earlier than watching block numbers.",
        ],
      },
    ],
    example: {
      title: "One aggregated attestation from a beacon block body",
      language: "json",
      code: "// GET /eth/v2/beacon/blocks/15300001\n// → .data.message.body.attestations[0]\n{\n  \"aggregation_bits\": \"0xffffffffffbfffff…ffffdfff7f\",\n  \"data\": {\n    \"slot\": \"15300000\",\n    \"index\": \"0\",\n    \"beacon_block_root\": \"0x8f4c2b…a91d\",\n    \"source\": { \"epoch\": \"478124\", \"root\": \"0x1c7ab3…44e0\" },\n    \"target\": { \"epoch\": \"478125\", \"root\": \"0x8f4c2b…a91d\" }\n  },\n  \"signature\": \"0xa7f1c9…3b02\",\n  \"committee_bits\": \"0xffffffffffffffff\"\n}\n\n// which validator is which bit? take the committees set in committee_bits,\n// in index order, and read aggregation_bits across their members\n// GET /eth/v1/beacon/states/15300000/committees?slot=15300000",
      note: "Each cleared bit is a committee member who did not attest in time; the zeroes, not the signature, are what participation dashboards count. Since Electra `data.index` is always `0`, and this aggregate's `committee_bits` names all 64 committees of the slot.",
    },
    pitfalls: [
      "Reading an attestation as a vote for one block only; it also commits to a source and a target checkpoint.",
      "Trying to identify a signer from `aggregation_bits` without fetching the assignments for that exact slot of every committee set in `committee_bits`.",
      "Running a node with drifting clocks, which produces late attestations that earn less and degrade gossip peer scores.",
      "Watching only block height for chain health, when stalled participation shows up first as a `finalized` tag that stops advancing.",
    ],
    related: ["fork-choice", "finality", "validator", "beacon-block", "slot-epoch", "sync-committee", "slashing", "beacon-api", "engine-api", "libp2p-gossip"],
    sources: [
      { title: "Ethereum consensus specifications", url: "https://github.com/ethereum/consensus-specs" },
      { title: "EIP-7549: Move committee index outside Attestation", url: "https://eips.ethereum.org/EIPS/eip-7549" },
      { title: "ethereum.org: Attestations", url: "https://ethereum.org/developers/docs/consensus-mechanisms/pos/attestations/" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
    ],
  },
  {
    id: "sync-committee",
    title: "Sync committee",
    category: "consensus",
    aliases: ["Altair", "sync aggregate", "512 validators"],
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
          "Light clients consume this through dedicated [[beacon-api|Beacon API]] routes: a [[light-client-update|bootstrap at a trusted block root]], then `light_client` updates, finality updates, and optimistic updates. Each update proves the next committee with a Merkle branch against the [[ssz|SSZ]] beacon state, so the client never has to trust the server that handed it the bytes.",
        ],
      },
      {
        heading: "What it does and does not prove",
        paragraphs: [
          "This is the machinery behind [[verified-rpc|verified RPC]] proxies such as [[helios|Helios]] and the [[nimbus|Nimbus]] verified proxy. They follow sync committee updates to obtain a trusted execution [[block-header|header]], then answer `eth_` calls locally by fetching an [[eth-get-proof|eth_getProof]] from an untrusted [[rpc-provider|provider]] and checking it against that header’s [[state-root|state root]].",
          "The guarantee is weaker than [[finality|finality]], and the threshold depends on what an update is used for. The Altair light-client sync protocol treats an update signed by a single member as valid, moves its optimistic head once more than half of the recent peak participation has signed, and needs at least two thirds of the 512 bits only to apply a finalized header or the next committee; after a full period without such an update it may force-apply the best one it has seen. Sync committee messages are not slashable, so a dishonest committee risks far less than an equivocating attester. Use it as a cheap canonicality check, and still wait for a finalized checkpoint when the answer is worth real money.",
        ],
      },
    ],
    pitfalls: [
      "Treating a sync committee signature as equivalent to finality; committee members are penalized for absence but not slashed for signing a wrong header.",
      "Bootstrapping a light client from an arbitrary block root without checking it, which reintroduces the weak subjectivity problem it was meant to solve.",
      "Assuming the committee rotates per epoch; it is resampled once per 256-epoch period of roughly 27 hours.",
      "Expecting the sync aggregate to prove execution state directly, when it only authenticates a header that a separate proof must be checked against.",
    ],
    related: ["light-client", "attestation", "validator", "consensus-proof", "verified-rpc", "finality", "beacon-block", "weak-subjectivity", "beacon-api", "eth-get-proof", "bls-signature"],
    sources: [
      { title: "Consensus specs: Altair light client", url: "https://github.com/ethereum/consensus-specs/tree/master/specs/altair/light-client" },
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
          "The [[validator-client|validator client]] maintains a [[slashing-protection|slashing protection database]] recording what each key has signed, exportable in the [[eip|EIP-3076]] interchange format: [[lighthouse|Lighthouse]] keeps every block and attestation, while the minimal design the EIP also allows keeps only the highest block slot and the highest source and target epochs. The classic incident is not an attack but an operator running one key in two places: a failover that never fenced the old host, or a restore from a data-directory backup without the current protection file.",
          "Nothing in execution [[json-rpc|JSON-RPC]] reports a slashing. The evidence appears in the block body as `proposer_slashings` and `attester_slashings`, and the validator’s [[beacon-api|Beacon API]] `status` moves to a slashed state; much later the remaining balance shows up as an ordinary [[withdrawals|withdrawal]] entry in an execution block with no transaction or receipt.",
        ],
      },
    ],
    example: {
      title: "The slashing protection record that prevents a double sign",
      language: "json",
      code: "// EIP-3076 interchange export from a validator client\n{\n  \"metadata\": { \"interchange_format_version\": \"5\", \"genesis_validators_root\": \"0x4b363db9…f511bfe95\" },\n  \"data\": [\n    {\n      \"pubkey\": \"0xb4a1f2…9c0d\",\n      \"signed_blocks\": [ { \"slot\": \"9482112\" } ],\n      \"signed_attestations\": [ { \"source_epoch\": \"296315\", \"target_epoch\": \"296316\" } ]\n    }\n  ]\n}",
      note: "Import this before starting a key on new hardware; without it the new client has no record of what the old one already signed.",
    },
    pitfalls: [
      "Believing that going offline gets you slashed; downtime is a small penalty, while signing two conflicting messages is not.",
      "Restoring a validator from a data-directory backup without the current slashing protection database, then signing an already-signed slot.",
      "Building an active-active failover for the same keys, which is the most common way operators slash themselves.",
      "Looking for slashing events in execution JSON-RPC, when the evidence only appears in the beacon block body and the Beacon API status.",
    ],
    related: ["validator", "validator-client", "attestation", "block-proposal", "proof-of-stake", "beacon-block", "withdrawals", "client-diversity", "finality", "beacon-api", "distributed-validator", "remote-signer"],
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
    aliases: ["maximal extractable value", "sandwich", "frontrunning", "bundle"],
    summary: "MEV, maximal extractable value, is the profit available to whoever chooses the order and inclusion of transactions in a block, captured through arbitrage, liquidations, and sandwiching of other people’s pending transactions.",
    sections: [
      {
        heading: "The value is in the ordering",
        paragraphs: [
          "The EVM is deterministic, but the result of a [[transaction|transaction]] depends on what executed before it. A swap that moves a price can be bracketed by a buy in front and a sell behind it, [[liquidation-bot|a loan that just became under-collateralized pays whoever liquidates it first]], and a price gap between two venues is an atomic arbitrage. None of this requires a bug; it follows from a public [[mempool|transaction pool]] plus one party choosing the order.",
          "[[searcher|Searchers]] hunt these opportunities and express them as [[mev-bundle|bundles]]: an ordered list of transactions that is either included together or not at all. A bundle can wrap someone else’s pending transaction, which is why a transaction sitting in the public pool is an input to someone else’s strategy before it is a block entry.",
        ],
      },
      {
        heading: "Who really builds the block",
        paragraphs: [
          "Since [[the-merge|the Merge]] most proposers do not assemble their own blocks. Builders compete to construct the highest-paying [[execution-payload|execution payload]], [[relay|relays]] deliver the bids, and the [[validator-client|validator client]] signs a blinded header through [[mev-boost|MEV-Boost]] without seeing the contents until it has committed. The proposer takes the payment; the ordering decision belongs to the builder.",
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
    related: ["mev-boost", "mempool", "private-rpc", "block-proposal", "eth-send-raw-transaction", "execution-payload", "block-tag", "eip-1559", "txpool-api", "proof-of-stake", "dex-pool-reads", "intent-solver"],
    sources: [
      { title: "ethereum.org: Maximal extractable value (MEV)", url: "https://ethereum.org/developers/docs/mev/" },
      { title: "Flashbots documentation", url: "https://docs.flashbots.net/" },
    ],
  },
  {
    id: "randao",
    title: "RANDAO",
    category: "consensus",
    aliases: ["prevRandao", "PREVRANDAO", "randao_reveal", "randao mix", "EIP-4399", "block.prevrandao", "on-chain randomness"],
    summary: "RANDAO is the beacon chain's accumulated randomness: each proposer mixes the hash of a [[bls-signature|BLS]] signature over the epoch number into a running value that seeds proposer and committee selection and reaches the [[evm|EVM]] as `PREVRANDAO`.",
    sections: [
      {
        heading: "How the mix accumulates",
        paragraphs: [
          "Every [[beacon-block|beacon block]] carries a `randao_reveal`, the proposer's BLS signature over the current epoch number under the `DOMAIN_RANDAO` domain. The chain verifies it against the proposer's public key, hashes it with SHA-256, and XORs the hash into the mix for the current epoch. BLS signing is deterministic, so a proposer cannot grind for a better reveal; its only freedom is whether the reveal appears at all. The beacon state keeps one mix per epoch in `randao_mixes`, a ring of 65,536 entries, so about 290 days of values can be read back from any state.",
          "The mix is consumed with lookahead. The seed for epoch N comes from the mix as it stood at the end of epoch N−2, so the committees of the next [[slot-epoch|epoch]] are fixed before it starts, and since Fulu the beacon state also stores a `proposer_lookahead` (EIP-7917) that pins every proposer for the current and next epoch. That is what lets a [[validator-client|validator client]] fetch its duties in advance, and what based [[preconfirmation|preconfirmation]] designs rely on to know who proposes next.",
        ],
      },
      {
        heading: "PREVRANDAO and mixHash",
        paragraphs: [
          "[[eip|EIP-4399]] exposed the mix to contracts at [[the-merge|the Merge]]. Opcode `0x44`, formerly `DIFFICULTY`, returns `PREVRANDAO`, and the execution [[block-header|header]] carries the same 32 bytes in the field that JSON-RPC still calls `mixHash`. The value in block N is the mix after the previous block's reveal: the consensus layer checks `payload.prev_randao` against the current mix before it applies block N's own reveal, which is what the ‘prev’ in the name means.",
          "The value is therefore public as soon as the parent block is. [[eth-call|eth_call]] at a block runs with that block's value, [[eth-get-block-by-number|eth_getBlockByNumber]] returns it as `mixHash`, and [[eth-simulate|eth_simulateV1]] accepts a `prevRandao` block override. On the consensus side, `GET /eth/v1/beacon/states/{state_id}/randao` on the [[beacon-api|Beacon API]] returns the mix for an optional `epoch` query parameter, and answers HTTP 400 for an epoch outside the state's 65,536-entry window.",
        ],
      },
      {
        heading: "How much a proposer can bias it",
        paragraphs: [
          "The mix is hard to predict but not unbiasable. A proposer that dislikes the value its reveal would produce can skip its slot, forfeiting the block's income, and leave the mix unchanged: two outcomes to choose from, one bit of influence. The last proposer of an epoch holds the valuable bit, because its choice fixes the seed for committees and proposers two epochs later, and whoever controls k consecutive slots at the end of an epoch chooses among `2^k` outcomes. One honest reveal afterwards restores the unpredictability.",
          "Applications face a cheaper bias. The proposer of block N knows the value block N exposes, and because it knows its own reveal it also knows what block N+1 will expose, so it can include a dice-roll transaction or push it into the next block, whichever pays. EIP-4399 therefore recommends committing first and rolling later: stop accepting bets, then read the randomness of a block several epochs ahead, with four epochs given as a reasonable lookahead.",
        ],
      },
      {
        heading: "When RANDAO is not enough",
        paragraphs: [
          "For anything where one bit of steering is worth more than a block's income, such as a lottery jackpot or a rare-item reveal, `PREVRANDAO` alone is the wrong primitive. A VRF oracle returns a value together with a proof that it was computed from a committed key and the request's seed, so the provider cannot choose among outcomes, although it can still fail to answer. Commit-reveal schemes buy the same property at the cost of an extra round and a participant who may refuse to reveal.",
          "Rollups do not inherit the beacon chain's mix unless their own rules say so. On Arbitrum `block.prevrandao` is the constant 1, and on any chain run by a single [[sequencer|sequencer]] whatever the opcode returns is known to that operator first. Code that uses `PREVRANDAO` has to be reviewed per chain, not per compiler version.",
        ],
      },
    ],
    pitfalls: [
      "Seeding a lottery with the current block's `block.prevrandao`, which that block's proposer already knows and can steer by including or delaying the draw.",
      "Treating the value in block N as block N's own reveal; it is the mix before that reveal, fixed once the parent block exists.",
      "Porting randomness code to an L2 unchanged, where the opcode may return a constant or a value the operator saw first.",
      "Looking for a `prevRandao` field in `eth_getBlockByNumber` output; the value is there under the old name `mixHash`.",
    ],
    related: ["validator", "block-proposal", "block-header", "evm", "slot-epoch", "bls-signature", "beacon-endpoints", "the-merge", "preconfirmation", "eth-simulate"],
    sources: [
      { title: "EIP-4399: Supplant DIFFICULTY opcode with PREVRANDAO", url: "https://eips.ethereum.org/EIPS/eip-4399" },
      { title: "Consensus specs: Phase 0 beacon chain", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/phase0/beacon-chain.md" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "Arbitrum docs: Solidity support", url: "https://docs.arbitrum.io/solidity-support" },
    ],
  },
  {
    id: "builder-api",
    title: "Builder API",
    category: "consensus",
    aliases: ["builder-specs", "getHeader", "submitBlindedBlock", "registerValidator", "blinded block", "SignedBuilderBid", "builder_boost_factor"],
    summary: "The Builder API, defined in the builder-specs repository, is the REST interface through which a proposer's [[beacon-node|beacon node]] registers preferences with external block builders, asks for a signed bid for its slot, and trades a signed blinded block for publication of the full payload.",
    sections: [
      {
        heading: "Three calls around a proposal",
        paragraphs: [
          "Registration comes first and repeats. The [[validator-client|validator client]] signs a `ValidatorRegistrationV1` holding `fee_recipient`, `gas_limit`, `timestamp`, and `pubkey`, hands it to its beacon node at `POST /eth/v1/validator/register_validator`, and the beacon node forwards it to builders at `POST /eth/v1/builder/validators`; the spec suggests resubmitting every epoch. The signature uses a dedicated `DOMAIN_APPLICATION_BUILDER` domain, so a registration can never pass for a consensus message, and the timestamp orders registrations so a stale one cannot replace a newer one.",
          "At the slot, the beacon node calls `GET /eth/v1/builder/header/{slot}/{parent_hash}/{pubkey}`. A builder side that has a block answers with a `SignedBuilderBid` holding an [[execution-payload|execution payload]] header, a `value` in wei, and the signer's public key; one that has nothing answers `204`. The proposer assembles a blinded [[beacon-block|beacon block]] whose body carries `execution_payload_header` in place of the payload, signs it, and posts it back to `/eth/v1/builder/blinded_blocks` or its v2 successor. Only then are the transactions revealed.",
        ],
      },
      {
        heading: "What blinding buys, and what it costs",
        paragraphs: [
          "Blinding is how the design stops a proposer from stealing a builder's block. The header commits to every transaction through `transactionsRoot`, so once the proposer has signed a block containing it, any other block for that slot would be a second signed proposal, which is [[slashing|slashable]] equivocation. The payload can therefore be revealed safely after the signature, and the proposer is bound to whatever it contains without having executed it.",
          "The cost is trust in the other direction. The proposer cannot check that the payload is valid, that the bid's `value` will actually be paid, or that the block will be published; the [[relay|relay]] carries all three. A proposer that has signed a blinded block must also not fall back to a local block if the reveal never comes, because that local block is exactly the conflicting signature the spec warns about. The slot is simply lost.",
        ],
      },
      {
        heading: "Local fallback and circuit breakers",
        paragraphs: [
          "The spec requires an honest proposer to build locally in parallel through the [[engine-api|Engine API]] and to abandon the builder path if no bid arrives within `BUILDER_PROPOSAL_DELAY_TOLERANCE`, one second. The validator client steers the choice with `builder_boost_factor` on `GET /eth/v3/validator/blocks/{slot}`: `0` prefers the local payload, `100` takes whichever pays more, and `2**64 - 1` prefers the builder; the `Eth-Execution-Payload-Blinded` response header says which came back. The execution client can also ask for its own payload to be used, by setting `shouldOverrideBuilder` in its [[engine-payload|engine_getPayload]] response.",
          "Beacon nodes also stop querying builders when the chain looks unhealthy, a liveness failsafe the spec calls a [[circuit-breaker|circuit breaker]] and leaves to each client. [[lighthouse|Lighthouse]] documents it as `--builder-fallback-skips` (default 3 skipped slots in a row), `--builder-fallback-skips-per-epoch` (default 8), and `--builder-fallback-epochs-since-finalization` (default 3); other clients use their own names and thresholds.",
        ],
      },
      {
        heading: "Versions after Fulu",
        paragraphs: [
          "Endpoints are versioned one at a time. After Fulu, the v1 `submitBlindedBlock`, which returned the payload and blobs to the caller, is deprecated in favour of `POST /eth/v2/builder/blinded_blocks`, which answers `202 Accepted` with no body and obliges the builder side to publish the block and blobs itself. [[mev-boost|MEV-Boost]] tries v2 first and retries v1 when a relay answers with an error status. Glamsterdam schedules [[enshrined-pbs|enshrined proposer-builder separation]] (EIP-7732), whose consensus half, Gloas, turns bids into protocol objects and deprecates registrations, but Gloas has no mainnet activation epoch yet.",
        ],
      },
    ],
    pitfalls: [
      "Falling back to a locally built block after signing a blinded one, which puts two signed proposals for the slot on the network and gets the validator slashed.",
      "Expecting the v2 blinded-block call to return the payload; it answers 202 with an empty body, and the block reaches the chain only if the builder side publishes it.",
      "Treating the bid's `value` as guaranteed by the protocol; nothing on the proposer's side checks it, only the relay's simulation does.",
      "Changing the fee recipient on the validator client and assuming builders follow at once, when they build for the last registration they received.",
    ],
    related: ["mev-boost", "relay", "block-proposal", "execution-payload", "beacon-block", "validator-client", "beacon-node", "engine-payload", "slashing", "mev"],
    sources: [
      { title: "Builder API specification", url: "https://ethereum.github.io/builder-specs/" },
      { title: "Builder specs: Bellatrix honest validator", url: "https://github.com/ethereum/builder-specs/blob/main/specs/bellatrix/validator.md" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "Lighthouse book: beacon node flags", url: "https://lighthouse-book.sigmaprime.io/help_bn.html" },
    ],
  },
  {
    id: "relay",
    title: "Relay",
    category: "consensus",
    aliases: ["MEV-Boost relay", "mev-boost-relay", "flashbots_validateBuilderSubmissionV5", "block submission validation", "bid trace", "proposer_payload_delivered", "optimistic relay"],
    summary: "A relay is the trusted intermediary between block builders and proposers: it takes builders' complete blocks, simulates each on its own [[execution-client|execution client]], offers the best to the proposer as a blinded bid, and publishes the payload only after the proposer has signed.",
    sections: [
      {
        heading: "What a relay does in one slot",
        paragraphs: [
          "Builders post complete blocks to `POST /relay/v1/builder/blocks`, each wrapped in a bid trace naming the slot, parent hash, builder and proposer keys, the proposer's fee recipient, and the `value` promised. The relay checks the builder's signature and the block against the proposer's registration from the [[builder-api|Builder API]], then keeps the best valid bid. When the proposer's [[mev-boost|MEV-Boost]] calls `getHeader`, the relay returns only that block's header and value, signed with the relay's own BLS key, which is why a relay URL in MEV-Boost carries a public key: `https://0xpubkey@host`.",
          "A relay needs chain context of its own: [[beacon-node|beacon nodes]] streaming `head` and `payload_attributes` events, so it knows the next proposer and the `prevRandao` and withdrawals that block must use, and an execution node to simulate against. On `submitBlindedBlock` it checks the proposer's signature, publishes the full block through its beacon nodes, and only afterwards, on the v1 call, returns the payload to the proposer.",
        ],
      },
      {
        heading: "Block validation on the relay's execution node",
        paragraphs: [
          "Simulation is an execution-client workload with no place in the standard JSON-RPC API. mev-boost-relay sends it to the node at `BLOCKSIM_URI` in the `flashbots` namespace: `flashbots_validateBuilderSubmissionV5` for Fulu blocks, V4 for Electra, V3 for Deneb. The request carries the bid trace, the full payload, the blobs bundle, execution requests, the builder's signature, the proposer's `registered_gas_limit`, and the `parent_beacon_block_root`. The node executes the block on its parent state and returns an error if anything differs from what the builder claimed.",
          "The checks go beyond an ordinary import. [[reth|Reth]]'s `flashbots` module, which serves V3 through V6, compares the header with the execution result, enforces the registered gas limit, and verifies payment, the one promise in the bid a proposer cannot check before signing: either the fee recipient's balance rose by at least `value`, withdrawals excluded, or the last transaction is a plain transfer of exactly `value` to it. It can also reject blocks that touch addresses on a configured disallow list. [[nethermind|Nethermind]]'s Flashbots module declares only V3, upstream [[geth|Geth]] has no such method, and the Flashbots Geth fork that used to serve it is archived.",
        ],
      },
      {
        heading: "Who trusts whom",
        paragraphs: [
          "The proposer trusts the relay twice: that the block it signs blind is valid, and that the relay will publish it in time. If either fails the slot is missed, and the proposer cannot rescue it with a local block without equivocating. The builder trusts the relay not to lift the strategy out of its block, since the relay sees every transaction. Neither side can check this in real time; relays compete on reputation, and some run an optimistic mode that accepts collateralised builders' blocks before simulation has finished.",
          "The April 2023 incident shows what the ordering protects. A proposer signed a header with zeroed parent and state roots, the ultra sound relay revealed the payload even though beacon nodes rejected the block, and the proposer reused the exposed sandwich-bot transactions in a block of its own, taking about 20 million dollars. Relays now publish through their beacon nodes before returning anything, and the v2 call returns nothing at all.",
        ],
      },
      {
        heading: "Relay data as an MEV source",
        paragraphs: [
          "Relays publish a data API that most [[mev|MEV]] dashboards are built on. `GET /relay/v1/data/bidtraces/proposer_payload_delivered` lists delivered payloads, filterable by `slot`, `block_number`, `block_hash`, `proposer_pubkey`, or `builder_pubkey`, with `value` in wei, and `builder_blocks_received` lists every submission. These are self-reports. Builders send one block to many relays and MEV-Boost sends the signed header to every relay it is configured with, so the same slot can appear as delivered at several, and `value` is a claim to check against the payment in the block itself.",
        ],
      },
    ],
    example: {
      title: "One delivered payload from a relay's data API",
      language: "json",
      code: "// GET https://boost-relay.flashbots.net/relay/v1/data/bidtraces/proposer_payload_delivered?block_number=23380000\n[\n  {\n    \"slot\": \"12608764\",\n    \"parent_hash\": \"0x3f1c7a09…a2d0\",\n    \"block_hash\": \"0x9b83c12c…ee71\",\n    \"builder_pubkey\": \"0xa1d4f6e2…0b3c\",\n    \"proposer_pubkey\": \"0x8f2c91b4…61aa\",\n    \"proposer_fee_recipient\": \"0x388c818ca8b9251b393131c08a736a67ccb19297\",\n    \"gas_limit\": \"45000000\",\n    \"gas_used\": \"21357190\",\n    \"value\": \"48201735624109882\",\n    \"num_tx\": \"231\",\n    \"block_number\": \"23380000\"\n  }\n]",
      note: "`value` is the relay's record of the bid, in wei; the proof of payment is the last transaction of block 23380000 or the fee recipient's balance change, read over ordinary [[json-rpc|JSON-RPC]].",
    },
    pitfalls: [
      "Confusing `relay.flashbots.net`, which accepts bundles and private transactions, with the MEV-Boost relay at `boost-relay.flashbots.net`.",
      "Summing `proposer_payload_delivered` across relays without deduplicating by `block_hash`, which counts one block several times.",
      "Reading a relay's `value` as the proposer's income without checking the closing transfer or balance change in the block.",
      "Pointing a relay's simulation at a node whose Flashbots module lacks the version the current fork needs, so every submission fails.",
      "Believing the relay's simulation is what makes a block valid; every node re-executes it on import, and a bad simulation only costs the proposer the slot.",
    ],
    related: ["mev-boost", "builder-api", "block-proposal", "execution-payload", "mev", "searcher", "reth", "nethermind", "beacon-node", "validator-rewards", "enshrined-pbs"],
    sources: [
      { title: "flashbots/mev-boost-relay", url: "https://github.com/flashbots/mev-boost-relay" },
      { title: "Flashbots relay API specification", url: "https://flashbots.github.io/relay-specs/" },
      { title: "Flashbots: post mortem of the April 3rd, 2023 relay incident", url: "https://collective.flashbots.net/t/post-mortem-april-3rd-2023-mev-boost-relay-incident-and-related-timing-issue/1540" },
    ],
  },
  {
    id: "searcher",
    title: "Searcher",
    category: "consensus",
    aliases: ["MEV searcher", "MEV bot", "arbitrage bot", "backrun", "liquidation bot", "eth_callBundle", "MEV-Share"],
    summary: "A searcher is an off-chain operator, not a protocol role, that finds [[mev|MEV]] opportunities such as arbitrage, liquidations, and backruns and sends them to block builders as bundles whose value depends on landing in exactly the right position.",
    sections: [
      {
        heading: "What a searcher does",
        paragraphs: [
          "A searcher watches state and pending flow, computes a profitable sequence of transactions, and submits it as a [[mev-bundle|bundle]] to one or more builders: an atomic arbitrage across two [[dex-pool-reads|pools]] after a large swap, the liquidation of a loan whose collateral just fell below its threshold, a backrun that trades immediately after someone else's transaction. The bundle pays for its position with priority fees or a direct transfer to the block's `coinbase`, and competition between searchers pushes that payment towards most of the opportunity's value.",
          "Nothing in the protocol knows searchers exist. They are ordinary accounts sending ordinary signed transactions, and what distinguishes their flow is the channel: [[private-rpc|private submission]] to builders rather than the public [[mempool|pool]], and bundle semantics that make a losing attempt vanish instead of reverting on chain. Builders, then [[relay|relays]], sit downstream; a searcher's output is an input to the block a builder bids with.",
        ],
      },
      {
        heading: "What a searcher needs from RPC",
        paragraphs: [
          "Latency first. A searcher [[fastest-head|reacts to a new head]] or a [[mempool-streaming|pending transaction]] and has to simulate and submit within a fraction of a 12-second slot, which is why serious ones run their own nodes, read over [[ipc-transport|IPC]] or a local [[websocket-transport|WebSocket]], and use [[eth-subscribe|eth_subscribe]] for `newHeads` and `newPendingTransactions` rather than polling. A shared provider endpoint adds network hops and [[rate-limits|rate limits]], and any one node's pending pool is only its own view of the flow.",
          "Simulation pinned to a known parent comes next. [[eth-call|eth_call]] against an explicit block hash, [[state-override|state overrides]] for hypothetical balances or code, and [[eth-simulate|eth_simulateV1]] for multi-transaction sequences all answer ‘what if my transactions ran on this state’. Builders offer the bundle-shaped version: Flashbots' `eth_callBundle` takes `txs`, a target `blockNumber`, and a `stateBlockNumber` to execute on, which is precisely the question of which parent the bundle will meet.",
        ],
      },
      {
        heading: "Hidden flow and history",
        paragraphs: [
          "Much profitable flow never reaches the public pool. Order-flow auctions such as [[mev-share|Flashbots' MEV-Share]] publish partial hints over a server-sent-events stream at `https://mev-share.flashbots.net`, carrying a double-hashed transaction hash and, when the sender allows, logs, the target address, calldata, or the function selector. A searcher can then backrun a transaction it cannot fully see, submitting through `mev_sendBundle` and sharing the proceeds with the original sender.",
          "Strategy work runs on history. Backtesting replays past blocks, which needs an [[archive-node|archive node]] for state at arbitrary heights, [[debug-api|debug_]] or [[trace-api|trace_]] methods to see internal calls, and receipts for every block in the range. That load is heavy and bursty, and it is a common reason searchers outgrow metered provider plans and run their own infrastructure.",
        ],
      },
    ],
    pitfalls: [
      "Simulating against `latest` and assuming the bundle meets that state, when the builder may place other transactions ahead of it in the target block.",
      "Treating one node's `newPendingTransactions` feed as the whole market, when much competing flow reaches builders privately and never appears there.",
      "Sending a strategy through the public pool, where other searchers can copy or front-run it before inclusion.",
      "Backtesting against a pruned node, which lacks the old state a replay needs and fails with `missing trie node` partway through the range.",
    ],
    related: ["mev", "mev-bundle", "private-rpc", "eth-call", "eth-simulate", "state-override", "mempool", "eth-subscribe", "archive-node", "relay", "dex-aggregator", "liquidation-bot", "keeper"],
    sources: [
      { title: "ethereum.org: Maximal extractable value (MEV)", url: "https://ethereum.org/developers/docs/mev/" },
      { title: "Flashbots docs: JSON-RPC endpoint", url: "https://docs.flashbots.net/flashbots-auction/advanced/rpc-endpoint" },
      { title: "Flashbots docs: MEV-Share event stream", url: "https://docs.flashbots.net/flashbots-mev-share/searchers/event-stream" },
    ],
  },
  {
    id: "distributed-validator",
    title: "Distributed validator",
    category: "consensus",
    aliases: ["DVT", "distributed validator technology", "Obol Charon", "SSV", "threshold signing", "DKG", "key shares"],
    summary: "A distributed validator is one [[validator|validator]] key operated by several independent nodes, each holding a share of a threshold [[bls-signature|BLS]] key, which agree on what to sign before a threshold of partial signatures is combined into one ordinary signature.",
    sections: [
      {
        heading: "One key, several operators",
        paragraphs: [
          "BLS keys can be split by threshold: n shares such that any t partial signatures over the same message combine into exactly the signature the whole key would have produced, so the chain cannot tell the difference. The shares are normally created in a distributed key generation ceremony, which means the full private key never exists on any machine. The result is active-active redundancy for a single validator: with four operators and a threshold of three, one node can be offline or even malicious and duties continue.",
          "Agreement has to come before signing. If each operator signed whatever its own beacon node suggested, the partial signatures would cover different attestation data and never combine. Every duty therefore starts with a Byzantine-fault-tolerant consensus round among the operators, QBFT in both major implementations, to fix the exact object, and only then does each node sign its share. That round spends time inside the slot, which matters most for a [[block-proposal|block proposal]].",
        ],
      },
      {
        heading: "Middleware or replacement",
        paragraphs: [
          "Obol's Charon is middleware. It sits between an unmodified [[validator-client|validator client]] and its [[beacon-node|beacon node]], serves the [[beacon-api|Beacon API]] to the validator client on `--validator-api-address` (default `127.0.0.1:3600`), and forwards to the real beacon nodes listed in `--beacon-node-endpoints`. The validator client holds its key share and keeps its own slashing protection; Charon runs consensus with its peers over libp2p and aggregates their partial signatures. A cluster of four tolerates one malicious node, a cluster of three only one offline node.",
          "SSV replaces the validator client. An SSV node holds its operator's share and performs duties itself, in committees of 4, 7, 10, or 13 operators. It needs a beacon endpoint over HTTP (`BEACON_NODE_ADDR`) and an [[execution-client|execution client]] over WebSocket (`ETH_1_ADDR`), because validators, key shares, operators, and fee recipients are registered in the SSV network contract and the node learns them from its [[event-log|events]], reading 8 blocks behind the head so a shallow [[reorg|reorg]] cannot hand it stale membership.",
        ],
      },
      {
        heading: "Slashing and RANDAO under a threshold",
        paragraphs: [
          "Threshold signing moves the [[slashing|slashing]] risk. A single share signing twice is harmless, because it takes t shares to make a signature, so a slashable message needs t operators to sign conflicting objects. Charon leans on this: a compromised Charon proposing a double vote meets each validator client's own protection database and is refused. The dangerous operations become duplication instead. Running one cluster peer in two places counts as a malicious node, and recombining shares into a normal key while the cluster still runs guarantees a double signature.",
          "Every signed object needs the threshold, including the proposer's [[randao|RANDAO reveal]], so a proposal starts with a round that combines partial reveals before the beacon node can even be asked for a block, then a consensus round on the block itself. Builder blocks fit awkwardly because every operator must agree on one blinded header; Charon's `--builder-api` mode, once enabled, produces only builder blocks.",
        ],
      },
      {
        heading: "Diagnosing a missed duty",
        paragraphs: [
          "A failure now crosses four processes per operator — execution client, beacon node, DV node, and, with Charon, the validator client — and several operators. A missed attestation can mean too few peers reachable for consensus, one operator's beacon node on a different head so the round cannot agree, clock skew, or an execution endpoint that has fallen behind. The first questions are whether the consensus round completed and how many partial signatures arrived, which only the DV node's own logs and metrics can answer.",
        ],
      },
    ],
    pitfalls: [
      "Starting a backup copy of a cluster node just in case, which the cluster counts as a malicious peer and a three-node cluster cannot tolerate.",
      "Combining key shares into a standalone key while the cluster is still running, which guarantees a double signature.",
      "Giving an SSV node an HTTP execution URL; it expects a WebSocket endpoint and reads the network contract's events through it.",
      "Blaming the beacon node for a missed duty before checking whether the operators reached consensus, a step no beacon or execution endpoint can see.",
    ],
    related: ["validator", "validator-client", "beacon-node", "slashing", "bls-signature", "block-proposal", "remote-signer", "validator-node", "randao", "attestation", "slashing-protection"],
    sources: [
      { title: "Obol docs: Charon introduction", url: "https://docs.obol.org/learn/charon/intro" },
      { title: "Obol docs: key staking concepts", url: "https://docs.obol.org/learn/readme/key-concepts" },
      { title: "SSV docs: operator node setup", url: "https://docs.ssv.network/operators/operator-node/node-setup/" },
      { title: "ObolNetwork/charon", url: "https://github.com/ObolNetwork/charon" },
    ],
  },
  {
    id: "preconfirmation",
    title: "Preconfirmation",
    category: "consensus",
    aliases: ["preconf", "based preconfirmation", "soft confirmation", "proposer commitment", "Commit-Boost", "Bolt", "Flashblocks"],
    summary: "A preconfirmation is a signed promise from an L1 proposer or an L2 [[sequencer|sequencer]] that a transaction will be included, and sometimes with what result, issued before the block that contains it exists.",
    sections: [
      {
        heading: "A ladder of guarantees",
        paragraphs: [
          "A preconfirmation sits at the bottom of a ladder that a caller should keep explicit. Above it is inclusion: a block containing the transaction has been published and a [[transaction-receipt|receipt]] exists, though a [[reorg|reorg]] can still remove it. Above that is the `safe` [[block-tag|tag]], once the block's checkpoint is justified or, on a client running the [[fast-confirmation-rule|Fast Confirmation Rule]], once that rule confirms it, and at the top `finalized`, which cannot be reverted without at least a third of staked ETH being slashed. A preconfirmation is a promise about a block that does not exist yet, and it is exactly as strong as whatever makes the promiser keep it.",
          "What enforces it differs by design. Based designs put the promiser's collateral at stake: a proposer registers, signs commitments with its validator key or a delegated key, and can be slashed through a contract if the block it proposes breaks one, which requires the commitment to be checkable on chain. A centralised L2 sequencer posts no collateral; its promise is backed by reputation and by the fact that it controls ordering anyway.",
        ],
      },
      {
        heading: "On L1: proposer commitments",
        paragraphs: [
          "An L1 proposer can only promise for its own slot, so based preconfirmations depend on knowing who proposes next. Since Fulu the beacon state carries a deterministic `proposer_lookahead` for the current and next epoch, added by EIP-7917 partly so contracts can prove the schedule against a beacon block root. A user sends a request to the upcoming proposer's endpoint or a gateway acting for it, the proposer signs a commitment, and near the slot it passes the committed transactions to builders as constraints the block must satisfy.",
          "Most of this is still settling. Chainbound's Bolt implemented the whole flow as a fork of the [[mev-boost|MEV-Boost]] stack, and its repository is now archived. Commit-Boost is a validator sidecar that implements the [[builder-api|Builder API]] like MEV-Boost and adds a signer module, so commitment protocols can obtain signatures from validator keys or delegated proxy keys without holding them. Taiko, a based rollup, runs preconfirmations on mainnet, but from a whitelisted set of launch-partner preconfers rather than from L1 validators.",
        ],
      },
      {
        heading: "On L2s the unsafe head is one",
        paragraphs: [
          "Every sequencer-run rollup already issues preconfirmations under another name. When an [[l2-rpc|L2 endpoint]] returns a receipt a second after submission, the block behind it is the unsafe head: produced and gossiped by the sequencer, not yet derivable from data on L1. Base's Flashblocks go further and stream partial blocks about every 200 milliseconds, exposed through the `pending` tag on methods such as `eth_getBlockByNumber`, `eth_call`, and `eth_getBalance`. Base's Denim upgrade, live on Base Sepolia since 21 October 2026 and planned for Base mainnet in November 2026, replaces Flashblocks with complete 200-millisecond blocks and drops that `pending` state.",
          "No standard `eth_` method requests or returns a preconfirmation. Each design ships its own endpoint and response, and the commitment is not part of any block, so an indexer cannot recover it later from chain data. Simulation is left with an awkward question: commitments made for the next block are not in `latest`, so an [[eth-call|eth_call]] or [[eth-simulate|eth_simulateV1]] against `latest` ignores transactions that will run first, and only the promiser's own endpoint knows the committed sequence to build on.",
        ],
      },
    ],
    pitfalls: [
      "Crediting a user or releasing goods on a preconfirmation as if it were inclusion, when its only backing may be the promiser's reputation.",
      "Reading an L2 receipt from the unsafe head as settled; it is the sequencer's preconfirmation until the batch reaches L1.",
      "Simulating against `latest` when earlier committed transactions will execute first, so the result describes a state the transaction will never meet.",
      "Assuming a based preconfirmation protocol is live and slashable because it is specified; check whether its contracts are deployed and proposers have opted in.",
    ],
    related: ["sequencer", "l2-rpc", "block-proposal", "finality", "confirmations", "mev-boost", "builder-api", "block-tag", "randao", "rollup"],
    sources: [
      { title: "EIP-7917: Deterministic proposer lookahead", url: "https://eips.ethereum.org/EIPS/eip-7917" },
      { title: "Commit-Boost documentation", url: "https://commit-boost.github.io/commit-boost-client/" },
      { title: "Base docs: Flashblocks for apps", url: "https://docs.base.org/base-chain/flashblocks/apps" },
      { title: "Taiko docs: FAQ", url: "https://docs.taiko.xyz/resources/faq" },
    ],
  },
  {
    id: "validator-rewards",
    title: "Validator rewards",
    category: "consensus",
    aliases: ["staking rewards", "consensus rewards", "attestation rewards", "execution-layer rewards", "fee recipient income", "rewards API", "staking APR"],
    summary: "A validator earns in two places: consensus rewards and penalties credited in gwei to its beacon-chain balance and later swept out as [[withdrawals|withdrawals]], and execution-layer income, priority fees and MEV payments, sent to its fee recipient [[address|address]] inside the blocks it proposes.",
    sections: [
      {
        heading: "Consensus-layer rewards",
        paragraphs: [
          "Most consensus income is for voting. Each epoch a [[validator|validator]] earns for a timely, correct source, target, and head vote in its [[attestation|attestation]], weighted 14, 26, and 14 out of 64 in the Altair accounting, and is penalised for a missing or wrong source or target; a missed head vote costs only the reward. These amounts are settled at the end of the following epoch and scale with overall participation. [[sync-committee|Sync committee]] members earn per slot with weight 2, and the proposer earns weight 8 for including attestations, sync signatures, and slashing evidence.",
          "None of this is a transaction. The balance changes inside the beacon state, and the ETH reaches the execution layer only when the withdrawal sweep arrives at the validator and credits the excess over its cap, 32 ETH for `0x01` credentials and 2048 ETH for `0x02`, as a withdrawal entry with an amount in gwei and no transaction hash, receipt, or log. Validators still on `0x00` credentials are not swept at all until they sign a change to an execution address with their [[bls-signature|BLS]] withdrawal key.",
        ],
      },
      {
        heading: "Execution-layer income",
        paragraphs: [
          "When a validator proposes, the block's priority fees go to the payload's fee recipient, while the base fee and blob fees are burned and reach nobody; see [[eip-1559|EIP-1559]]. For a locally built block that recipient is the validator's own suggested fee recipient. For a block bought through [[mev-boost|MEV-Boost]] the header's `miner` is usually the builder's address, and the proposer is paid by the builder's final transaction in the block, a plain transfer of the bid value to the registered fee recipient; [[relay|relays]] check for exactly that transfer, or an equivalent balance increase, before offering the bid.",
          "So the proposer's execution income for a builder block is that transfer, not the block's priority fees, which went to the builder. The two figures are related only through the builder's margin, and a report that sums priority fees for its own blocks can be wrong in either direction.",
        ],
      },
      {
        heading: "Reading rewards over the Beacon API",
        paragraphs: [
          "The [[beacon-api|Beacon API]] has three reward routes, all in gwei. `GET /eth/v1/beacon/rewards/blocks/{block_id}` returns the proposer's consensus reward for one block, split into `attestations`, `sync_aggregate`, `proposer_slashings`, and `attester_slashings`. `POST /eth/v1/beacon/rewards/attestations/{epoch}` returns per-validator `head`, `target`, `source`, and `inactivity` values beside the ideal amounts for each effective balance, and `POST /eth/v1/beacon/rewards/sync_committee/{block_id}` returns each member's reward. Penalties appear as negative numbers, and no route includes execution-layer income.",
          "Each route recomputes rewards from beacon states around the block or epoch requested, so reporting old periods needs a [[beacon-node|beacon node]] that keeps historical states; a pruned or freshly [[checkpoint-sync|checkpoint-synced]] node answers HTTP 404, the code the specification uses when the required state or data is not available. Clients name the mode differently: [[lighthouse|Lighthouse]] `--archive`, [[teku|Teku]] `--data-storage-mode=archive`, [[nimbus|Nimbus]] `--history=archive`, and a checkpoint-synced node must still backfill before its old states exist.",
        ],
      },
    ],
    example: {
      title: "One block's consensus reward, and one validator's attestation reward",
      language: "json",
      code: "// GET /eth/v1/beacon/rewards/blocks/12608764\n{\n  \"execution_optimistic\": false,\n  \"finalized\": true,\n  \"data\": {\n    \"proposer_index\": \"1183526\",\n    \"total\": \"38917456\",\n    \"attestations\": \"37105331\",\n    \"sync_aggregate\": \"1812125\",\n    \"proposer_slashings\": \"0\",\n    \"attester_slashings\": \"0\"\n  }\n}\n\n// POST /eth/v1/beacon/rewards/attestations/394023   body: [\"1183526\"]\n// → data.total_rewards[0]\n{ \"validator_index\": \"1183526\", \"head\": \"2831\", \"target\": \"5259\", \"source\": \"2831\", \"inactivity\": \"0\" }",
      note: "`total` is the four components added up, in gwei, and it is consensus income only; the same block's MEV payment is a transaction in the execution block, found with [[eth-get-block-by-number|eth_getBlockByNumber]].",
    },
    pitfalls: [
      "Counting a builder block's priority fees as the proposer's income, when the proposer received the builder's closing transfer and the fees went to the builder.",
      "Looking for consensus rewards in transactions or receipts; they reach the execution layer only as withdrawals, which have no transaction hash.",
      "Treating the Beacon API block reward as a block's total value; it covers consensus rewards only and omits priority fees and MEV.",
      "Querying reward routes for months-old epochs on a pruned beacon node and reading the 404 as missing rewards rather than missing states.",
      "Reporting a self-built block's gross fees including the base fee, which was burned and never reached the fee recipient.",
    ],
    related: ["validator", "withdrawals", "attestation", "sync-committee", "beacon-endpoints", "relay", "mev-boost", "eip-1559", "beacon-node", "slashing"],
    sources: [
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "Consensus specs: Altair beacon chain", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/altair/beacon-chain.md" },
      { title: "EIP-4895: Beacon chain push withdrawals as operations", url: "https://eips.ethereum.org/EIPS/eip-4895" },
      { title: "Teku CLI reference", url: "https://docs.teku.consensys.io/reference/cli" },
    ],
  },
  {
    id: "bls-signature",
    title: "BLS signatures",
    category: "consensus",
    aliases: ["BLS12-381", "aggregate signature", "signing domain", "proof of possession", "EIP-2537", "FastAggregateVerify", "BLS pubkey"],
    summary: "BLS signatures over the BLS12-381 curve are how the [[consensus-layer|consensus layer]] signs everything: a 48-byte public key, a 96-byte signature, and the property that many signatures over one message combine into a single signature that verifies against the combined keys.",
    sections: [
      {
        heading: "Sizes and aggregation",
        paragraphs: [
          "Ethereum uses the ciphersuite `BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_POP_`, which puts public keys in the smaller group G1 and signatures in G2, so a compressed key is 48 bytes and a signature 96 bytes. A [[validator|validator]] is identified by that key and an index, never by an [[address|address]]. The defining property is aggregation: signatures from different keys over the same message add up to one 96-byte signature, and `FastAggregateVerify` checks it against the sum of the keys in one verification instead of one per signer.",
          "That is what lets consensus fit in blocks. Committee members signing identical data fold into one signature plus a bitfield, so an [[attestation|attestation]] carries a single signature whether 30 or 400 members signed. The [[sync-committee|sync committee]]'s `sync_aggregate` does the same for 512 members at once: a 512-bit field and one signature over the previous slot's block root, which is all a [[light-client|light client]] checks per header. Verification still needs every signer's key, so the verifier must know which validators the bits refer to.",
        ],
      },
      {
        heading: "Domains bind a signature to a chain and a purpose",
        paragraphs: [
          "Nothing is signed raw. The signing root is the [[ssz|SSZ]] hash of the object together with a 32-byte domain: a 4-byte domain type, such as `0x01000000` for attestations or `0x02000000` for RANDAO reveals, followed by 28 bytes of a hash over the fork version and the chain's `genesis_validators_root`. A mainnet attestation therefore does not verify on a testnet, a block signature cannot be replayed as a vote, and most messages are tied to the fork version they were signed under.",
          "A few domains are deliberately fork-agnostic. Deposits use the genesis fork version and a zero root, so one deposit signature stays valid across forks, and the deposit contract does not check it at all. Since Deneb, voluntary exits are always signed with the Capella fork version, so a pre-signed exit never expires. The [[builder-api|Builder API]] uses its own `DOMAIN_APPLICATION_BUILDER` with no genesis root, which keeps registrations and bids out of the consensus signing space.",
        ],
      },
      {
        heading: "Rogue keys and proof of possession",
        paragraphs: [
          "Aggregating keys naively is unsafe. An attacker who publishes a key computed as its own key minus a victim's can produce an aggregate that appears to include the victim and verifies with a signature only the attacker made. The defence is proof of possession: every key must first sign something showing its owner holds the secret. In Ethereum that proof is the deposit signature, verified by the consensus layer when a new key is added; a deposit with a bad signature simply creates no validator, and its ETH is not refunded.",
          "Verification is expensive, since each check involves pairings that are far slower than [[ecdsa-signature|secp256k1]] recovery, so [[beacon-node|beacon nodes]] batch-verify gossip. Several clients also share one BLS library, blst, which [[client-diversity|client diversity]] counts as a correlated risk that separate codebases do not remove.",
        ],
      },
      {
        heading: "Against ECDSA, and on-chain verification",
        paragraphs: [
          "Execution-layer ECDSA signatures are 65 bytes, cannot be aggregated, and let a node recover the signer's address from the signature alone, which is why a transaction carries no `from` field. A BLS signature recovers nothing: verification takes the public key as an input. One staker therefore appears under two identities, a BLS key on the beacon chain and addresses on the execution layer, linked only by withdrawal credentials.",
          "Since Pectra, [[eip|EIP-2537]] adds [[precompiles|precompiles]] at `0x0b` through `0x11` for BLS12-381 arithmetic: G1 and G2 addition and multi-scalar multiplication, mapping field elements to curve points, and a pairing check at `0x0f` costing `32600*k + 37700` gas for k pairs. They take uncompressed points, 128 bytes for G1 and 256 for G2, so the 48- and 96-byte forms must be expanded off chain, and hashing the message to G2 is left to the contract, built from SHA-256 and the `0x11` map.",
        ],
      },
    ],
    pitfalls: [
      "Verifying a consensus signature with the wrong fork version or genesis validators root, which rejects signatures that are perfectly valid.",
      "Expecting a validator's BLS key to map to an execution address, when the two identities are linked only through withdrawal credentials.",
      "Passing compressed 48- or 96-byte encodings to the EIP-2537 precompiles, which expect 128- and 256-byte uncompressed points and return an error.",
      "Treating an aggregate as proof of who signed without the committee assignment that maps its bits to public keys.",
    ],
    related: ["ecdsa-signature", "validator", "attestation", "sync-committee", "consensus-proof", "light-client", "validator-client", "ssz", "distributed-validator", "precompiles"],
    sources: [
      { title: "Consensus specs: Phase 0 beacon chain (BLS and domains)", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/phase0/beacon-chain.md" },
      { title: "EIP-2537: Precompile for BLS12-381 curve operations", url: "https://eips.ethereum.org/EIPS/eip-2537" },
      { title: "IETF draft: BLS signatures, version 04", url: "https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-bls-signature-04" },
    ],
  },
  {
    id: "liquidation-bot",
    title: "Liquidation bots",
    category: "consensus",
    aliases: ["liquidator", "health factor", "liquidationCall", "getUserAccountData", "oracle backrun", "flash loan liquidation"],
    summary: "A liquidation bot watches lending-protocol positions and, once a borrower's collateral no longer covers their debt by the protocol's margin, repays part of that debt through the protocol's liquidation function in exchange for collateral at a discount, racing other bots for the same position.",
    sections: [
      {
        heading: "The trade a lending protocol offers",
        paragraphs: [
          "A lending protocol lets a borrower deposit collateral, such as wrapped ether (WETH), and borrow against it, such as the USDC stablecoin. If the collateral's price falls far enough the loan turns unsafe, and the protocol pays outsiders to close it: anyone may repay part of the debt and take that value of collateral plus a bonus. A liquidation bot exists to be first. This lesson uses Aave v3, still live beside the newer V4. Its Pool at `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2` answers `getUserAccountData(address)`, selector `0xbf92857c`, with total collateral and debt in US dollars (8 decimals) and a `healthFactor` (18 decimals), among other values. Each collateral counts only up to its liquidation threshold, say 83 percent of its value, and the health factor is that weighted collateral divided by the debt.",
          "With a health factor below `1e18`, that is 1.0, the position is open to `liquidationCall(collateralAsset, debtAsset, user, debtToCover, receiveAToken)`: the caller repays debt and receives that value of collateral plus the asset's liquidation bonus, for example 5 percent, less a protocol fee taken from the bonus. How much may be repaid is code: the whole debt in that asset, unless the collateral and debt in the two assets involved are both worth at least $2,000 and the health factor is above 0.95, when the cap is half the total debt. A liquidation that clears neither the debt nor the collateral must leave at least $1,000 of each, or it reverts with `MustNotLeaveDust`. Other protocols differ: on Compound v3, `absorb` moves an unsafe account's debt and collateral to the protocol, which later sells the collateral at a discount through `buyCollateral`.",
        ],
      },
      {
        heading: "Finding positions and watching prices",
        paragraphs: [
          "Discovery is indexing: the bot builds its borrower list with [[eth-get-logs|eth_getLogs]] over the Pool's `Borrow` and `Supply` events since deployment, then follows new logs. Each new head triggers a re-score of every borrower near the threshold: thousands of `getUserAccountData` calls batched through [[multicall|Multicall3]] and sent with [[eth-call|eth_call]] pinned to the head's hash, so every answer describes one block. That read-heavy load on the newest state is why liquidators care about [[fastest-head|getting the head first]].",
          "Positions usually cross the line when an [[price-oracle|oracle]] posts a new price. Protocols read a Chainlink price through a proxy contract that points at an aggregator, and the aggregator, not the proxy, emits `AnswerUpdated(int256,uint256,uint256)` when a new price lands. Timing decides the race: before the update the position is still healthy and a liquidation reverts, and after it the first liquidation wins. So the bot backruns the update, placing its liquidation directly behind it in the same block. To check in advance that this pays, it simulates the state after the update, with [[eth-simulate|eth_simulateV1]] running both in sequence or a [[state-override|state override]] putting stub code that answers the new price at the aggregator.",
        ],
      },
      {
        heading: "Landing the liquidation",
        paragraphs: [
          "On Aave the update that matters never enters the public [[mempool|pool]]. Aave v3 on Ethereum reads ETH/USD and several other prices through Chainlink's Smart Value Recapture (SVR) feeds, which send each report twice: publicly to the standard feed, which Aave ignores, and privately through [[mev-share|MEV-Share]] to the SVR aggregator that Aave reads. MEV-Share keeps the transaction hidden, shows [[searcher|searchers]] only a hint, a partial description of it, and auctions the right to backrun it; the value recaptured is split between Aave and Chainlink. If the private copy has not landed after a configurable delay, the SVR feed falls back to the standard price.",
          "The liquidation is one transaction from the bot's own contract, which rarely holds the debt asset. It takes a flash loan, borrowed and repaid within the same transaction, such as Aave's `flashLoanSimple` or Morpho's fee-free `flashLoan`, calls the liquidation, swaps the seized collateral back, repays the loan and keeps the difference. It sends this as a [[mev-bundle|bundle]], transactions that a builder, the party assembling the block, includes together and in order or not at all, through a [[private-rpc|private endpoint]]: for SVR, `mev_sendBundle` with the update's hint hash first and the liquidation second. The liquidation pays the builder with priority fees or a transfer to `block.coinbase`, and competition between bots pushes that bid towards most of the profit.",
          "Failure is cheap only when it is private: a bundle that loses the race is simply not included, while the same transaction sent publicly reverts and still pays gas. Geth lowers any `eth_call` gas request to its cap, 50,000,000 by default, so an oversized Multicall batch runs out of gas and fails whole, and an endpoint that ignores state overrides answers at the old price. [[keeper|Keepers]] and [[dex-aggregator|aggregators]] load a node the same way.",
        ],
      },
    ],
    example: {
      title: "One oracle update, one liquidation, on Aave v3",
      language: "text",
      code: "# Aave v3 Pool 0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2 prices WETH from the SVR ETH/USD feed,\n# aggregator 0x7c7f…e3f8. Borrower 0x3f1c…a2d0 deposited 20 WETH and borrowed 40,600 USDC; figures illustrative.\n\n1  new head 26003511: re-score 2,140 tracked borrowers in 22 Multicall3 batches pinned to its hash\n   getUserAccountData(0x3f1c…a2d0)   (selector 0xbf92857c)\n     totalCollateralBase   $49,342.00     20 WETH at 2,467.10\n     totalDebtBase         $40,600.00     USDC\n     liquidation threshold 8300 (83%)\n     healthFactor          1.0087e18      49,342 x 0.83 / 40,600: still safe\n2  a MEV-Share hint arrives: txs[0].functionSelector 0x6fadcf72, a forward call\n     its callData names the aggregator 0x7c7f…e3f8 and carries a report: ETH/USD 2,410.55, a drop about to land\n3  what will the position look like after it? eth_call on 26003511, with stub code at 0x7c7f…e3f8\n   (a state override) answering 2,410.55\n     totalCollateralBase   $48,211.00\n     healthFactor          0.9856e18      liquidatable once the update lands\n     above 0.95 and both sides over $2,000: at most half the debt, 20,300 USDC\n4  build the liquidation; the bot holds no USDC, so it borrows it for the length of the transaction\n     flashLoanSimple(USDC, 20,300) -> liquidationCall(WETH, USDC, 0x3f1c…a2d0, 20300e6, false)\n     20,300 / 2,410.55 = 8.4213 WETH, plus the 5% bonus = 8.8424 WETH\n     minus a 10% protocol fee on the bonus = 8.8003 WETH to the bot\n     swap to about 21,203 USDC after a 0.05% pool fee, repay 20,300 + 10.15 premium (0.05%)\n     about 893 USDC before the bid\n5  mev_sendBundle, body [{hash: the hint's hash}, {tx: the liquidation}], blocks 0x18cc838 to 0x18cc83a\n   (26003512 to 26003514): the update first, the liquidation right behind it,\n   which bids 0.25 ETH, about 603 USDC, by a transfer to block.coinbase\n6  lands in 26003512 right behind the price update, with a LiquidationCall event,\n   or a rival's higher bid wins and this bundle is never included",
      note: "Why each step: the re-score finds who is near the line, the hint is the only early sight of Aave's next price, the override shows the position after it, the flash loan supplies capital the bot lacks, and the bundle puts the liquidation directly behind the update, where it lands or is dropped at no cost. Watching the public pool would have shown only the standard feed's copy, which does not move Aave's WETH price.",
    },
    pitfalls: [
      "Filtering `AnswerUpdated` on the Chainlink proxy address, when the aggregator behind the proxy emits it, so the filter never matches.",
      "Watching the public pool for updates to a feed Aave reads through SVR, whose price for Aave moves through MEV-Share.",
      "Re-scoring borrowers on a provider that lags a block, so positions look healthy until a faster bot has already liquidated them.",
    ],
    related: ["mev", "searcher", "mev-bundle", "private-rpc", "state-override", "eth-simulate", "multicall", "price-oracle", "fastest-head", "mev-share"],
    sources: [
      { title: "Aave v3 LiquidationLogic.sol", url: "https://github.com/aave-dao/aave-v3-origin/blob/main/src/contracts/protocol/libraries/logic/LiquidationLogic.sol" },
      { title: "Chainlink: Smart Value Recapture (SVR) feeds", url: "https://docs.chain.link/data-feeds/svr-feeds" },
      { title: "Compound III: liquidation", url: "https://docs.compound.xyz/liquidation/" },
      { title: "Morpho Blue: Morpho.sol", url: "https://github.com/morpho-org/morpho-blue/blob/main/src/Morpho.sol" },
    ],
  },
  {
    id: "intent-solver",
    title: "Intents and solvers",
    category: "consensus",
    aliases: ["solver", "intent", "CoW Protocol", "batch auction", "UniswapX filler", "1inch Fusion resolver", "Dutch order"],
    summary: "An intent is a signed order that states an outcome, such as selling 10 WETH for at least 24,000 USDC before an expiry, and leaves the route to solvers, fillers or resolvers who compete off-chain and settle it on-chain, which makes them deadline-bound consumers of fresh state and simulation.",
    sections: [
      {
        heading: "Orders that name an outcome",
        paragraphs: [
          "A swap transaction says how: which pools, in which order, with which slippage. An intent says what: the user signs an [[eip-712|EIP-712]] order off-chain with a sell amount, a minimum buy amount and an expiry, and a third party, called a solver, filler or resolver depending on the protocol, picks the route, pays the gas and submits it. The settlement contract checks the signature and the limit before moving tokens, so the order itself protects the user. CoW Protocol gathers open orders into a batch auction, in which solvers compete to settle many orders in one transaction through `GPv2Settlement` at `0x9008D19f58AAbD9eD0D60971565AA8510560ab41`. UniswapX fillers and 1inch Fusion resolvers take Dutch orders instead, whose rate starts high for the user and falls over time until someone fills it.",
          "A CoW solver has two parts: the driver, CoW's open-source component that fetches liquidity, encodes, simulates and submits, and the solver engine, the matching algorithm a team writes itself. At a regular interval a service called the autopilot builds an auction from open orders and posts it to every driver's `/solve` endpoint with a `deadline` timestamp. Each driver replies with a score for each solution, roughly the surplus it gives users beyond their limit prices. The autopilot picks the winners, who earn a reward, and sends each one `/settle` with `submissionDeadlineLatestBlock`, three blocks ahead on mainnet. A winning solution that misses it counts against the solver in the reward formula, which can make the reward negative.",
        ],
      },
      {
        heading: "The simulation load",
        paragraphs: [
          "Every auction is a burst of reads and simulations against the newest state. A solver refreshes reserves for hundreds of pools with [[dex-pool-reads|pool reads]], prices routes with [[eth-call|eth_call]] against [[quoter-contract|quoter contracts]], and simulates each candidate settlement before scoring it. CoW's reference driver estimates each one with [[eth-estimate-gas|eth_estimateGas]] on the `pending` block, or on a pinned block when it supplies [[state-override|state overrides]], and caps the gas limit at its configured per-transaction limit so a rogue solution cannot make the node search up to the block gas limit; it calls [[eth-create-access-list|eth_createAccessList]] for native-ETH payouts, which smart-contract wallets may need an access list to receive. CoW's local-testing guide warns that its services can be very heavy on RPC resource consumption.",
          "Time is part of the state. A UniswapX V2 Dutch order demands an output that falls linearly between `decayStartTime` and `decayEndTime`: an order asking 24,000 USDC at the start and 23,900 sixty seconds later asks about 23,980 twelve seconds in. Those times, and a window in which one `exclusiveFiller` gets the order first, are signed by a cosigner, a second key that the reactor, UniswapX's settlement contract, checks. An `eth_call` at `latest` runs with the latest block's timestamp, at least one 12-second slot before any block the fill can land in, so a filler simulates at the timestamp it expects to land at, using `blockOverrides` in [[eth-simulate|eth_simulateV1]] or Geth's fourth `eth_call` parameter. Each new head makes the last round of simulations stale, and an abandoned simulation still costs the node its full run; see [[request-cancellation|request cancellation]].",
        ],
      },
      {
        heading: "Getting the settlement on chain",
        paragraphs: [
          "The driver's submission path is explicit configuration: exactly one of public-mempool URLs, a private relay such as MEV Blocker at `https://rpc.mevblocker.io`, or builders that receive the settlement as an [[mev-bundle|eth_sendBundle]] bundle for every block until the deadline. While it waits, the driver keeps re-simulating and cancels the transaction once it would revert. UniswapX fillers poll `https://api.uniswap.org/v2/orders?orderStatus=open&chainId=1`, capped at four requests a second and returning at most the last 50 orders, fill through the reactor's `execute` or `executeWithCallback`, and are told to submit through a [[private-rpc|private relay]] because fills compete in a gas auction.",
          "RPC failures have prices. A head one block stale yields a settlement that simulates and then reverts against reserves that already moved; a provider timeout that outlasts the `deadline` means a correct solution never arrives; an HTTP 429 when a volatile block lands hits every solver sharing that plan at once; an endpoint that silently drops overrides scores a solution against the wrong state. [[dex-aggregator|Aggregators]] and [[liquidation-bot|liquidation bots]] share the profile of burst simulation against the newest state under a hard deadline.",
        ],
      },
    ],
    example: {
      title: "One CoW Protocol auction, from one solver's driver",
      language: "text",
      code: "# times from the arrival of head 26003512; ids, counts and gas figures illustrative\n\n+0.0 s   newHeads 26003512: driver refreshes cached reserves for 340 pools in 4 batched eth_calls\n+0.4 s   autopilot -> driver  POST /solve  {\"id\": 10482217, \"orders\": [27 orders], \"deadline\": \"2026-10-29T10:41:15.200Z\", ...}\n         forwarded to the solver engine, which proposes 3 candidate settlements\n+1.1 s   for each candidate, a call to GPv2Settlement 0x9008D19f58AAbD9eD0D60971565AA8510560ab41\n           eth_estimateGas at pending, gas capped   ->  412,377  /  reverts: a pool moved  /  389,904\n+2.2 s   /solve answered with scores for candidates 1 and 3; the autopilot ranks every solver's bids\n+3.1 s   POST /settle {\"solutionId\": 3, \"auctionId\": 10482217, \"submissionDeadlineLatestBlock\": 26003515}\n         26003512 + 3 blocks on mainnet\n+3.2 s   eth_sendBundle to two builders for 26003513, re-simulating first\n+12.1 s  26003513 arrives without it; re-simulate, still valid, eth_sendBundle again for 26003514\n+24.0 s  settlement included in 26003514, one block inside the deadline\n         had it missed 26003515, its score would have counted against the solver's reward",
      note: "The `/solve` deadline is a wall-clock time and the settlement deadline is a block number, so a solver budgets RPC latency against the first and inclusion odds against the second.",
    },
    pitfalls: [
      "Simulating a Dutch order at the latest block's timestamp, which prices the fill as it stood a slot before it can land.",
      "Letting a provider timeout run past the auction's `deadline`, so a correct solution never reaches the autopilot.",
      "Submitting a settlement through the public pool, where a competing filler can take the order first and the losing transaction still pays gas.",
      "Sharing one rate-limited endpoint between quoting and settlement, so the burst of quotes at each new block starves submission.",
      "Assuming every endpoint honours state overrides and `eth_simulateV1`, when some strip the parameter and answer against unmodified state.",
    ],
    related: ["dex-aggregator", "dex-pool-reads", "eth-simulate", "state-override", "eth-estimate-gas", "eth-create-access-list", "private-rpc", "mev-bundle", "request-cancellation", "eip-712"],
    sources: [
      { title: "CoW Protocol: running a solver locally", url: "https://docs.cow.fi/cow-protocol/tutorials/solvers/local_test" },
      { title: "CoW Protocol: solver competition rules", url: "https://docs.cow.fi/cow-protocol/reference/core/auctions/competition-rules" },
      { title: "CoW Protocol services: driver example configuration", url: "https://github.com/cowprotocol/services/blob/main/crates/driver/example.toml" },
      { title: "UniswapX: filling on mainnet", url: "https://developers.uniswap.org/docs/liquidity/uniswapx/filling/mainnet/filling-on-mainnet" },
    ],
  },
  {
    id: "mev-share",
    title: "MEV-Share",
    category: "consensus",
    aliases: ["mev_sendBundle", "mev_simBundle", "orderflow auction", "MEV refund", "MEV-Share Node", "MEV-Share hints"],
    summary: "MEV-Share is Flashbots' orderflow auction: users send transactions privately to a MEV-Share Node, which streams partial hints about them to [[searcher|searchers]] over [[server-sent-events|server-sent events]], accepts backrun bundles that refer to the hidden transaction by hash, and forwards them to builders on condition that most of the value goes back to the user.",
    sections: [
      {
        heading: "From a private transaction to a hint",
        paragraphs: [
          "A large swap moves a pool's price away from other venues, so whoever trades straight after it, a backrun, can close the gap at a profit. In the public [[mempool|pool]] that profit goes to the fastest [[searcher|searcher]], who may also trade in front of the user. An orderflow auction sells that chance instead: the transaction stays private, searchers bid for the right to backrun it, and most of what the winner pays is refunded to the user. The user's side is a [[private-rpc|private RPC]], Flashbots Protect at `https://rpc.flashbots.net`, or a direct `eth_sendPrivateTransaction` call.",
          "By default Protect forwards only to the Flashbots builder, one of the parties that assemble blocks, retries for 25 blocks, shares the `hash` and `default_logs` hints, and sends 90 percent of any refund to `tx.origin`, the transaction's sender, and the rest to the validator. URL parameters change that: `?hint=hash` alone is full privacy, adding hints such as `calldata` or `logs` gives searchers more to bid on, `builder=` adds builders, and `refund=address:percent` redirects the payment. The `/fast` path shares with every builder in Flashbots' registry, 19 in October 2026, gives the validator a larger share, and shows the whole unsigned transaction to searchers inside trusted execution environments.",
          "Searchers read the hints with a plain GET on `https://mev-share.flashbots.net`, a server-sent-events stream that writes a `:ping` comment after 15 quiet seconds. Each event has a `hash`, which is the [[keccak-256|keccak-256]] of the transaction or bundle hash rather than the hash itself, optional `logs`, and `txs` entries holding the fields the sender shared, such as `to`, `functionSelector` and `callData`; an absent field means the sender withheld it. `default_logs` reveals only the pool and the fact of a swap, for Curve, Balancer and Uniswap-style pools. The stream has no replay, but `GET /api/v1/history` with `blockStart` and `blockEnd` returns past hints for backfill.",
        ],
      },
      {
        heading: "Backrunning with mev_sendBundle",
        paragraphs: [
          "A searcher answers with `mev_sendBundle`, sent to `relay.flashbots.net` and signed with `X-Flashbots-Signature` like any [[mev-bundle|Flashbots bundle]]. Its `version` is `v0.1`; `inclusion.block` and an optional `maxBlock` give an inclusive range of blocks; `body` lists `{hash}` for the user's transaction, known only by its hint hash, then `{tx, canRevert}` for the searcher's own signed transaction; `validity` holds optional refund terms; `privacy` sets hints and builders, but Flashbots' bundle guide says a bundle holding a `{hash}` entry may not use `privacy`, so a backrun cannot leak the user's transaction further. MEV-Share accepts only backruns, and since 20 October 2025 a bundle may hold at most one backrun transaction.",
          "The node swaps the hash for the original transaction and forwards the bundle to builders with the refund as a condition. As the bundle specification requires, the builder simulates the bundle without the user's transaction, to separate the searcher's payment from the user's, and redistributes the searcher's share to the refund addresses. A searcher cannot simulate what it cannot see: `mev_simBundle` rejects a bundle that still holds a `{hash}` entry, so strategies infer from hints, send several candidate bundles, or check profitability on chain and let a bad bundle drop.",
        ],
      },
      {
        heading: "How it differs from neighbouring channels",
        paragraphs: [
          "Plain `eth_sendBundle` needs every transaction signed and in hand, so a backrun there means copying a victim's transaction from the public pool, and it targets one block with no refund terms outside builder-specific extensions; `mev_sendBundle` references a transaction the searcher never saw and carries the refund. A private RPC without an auction hides the transaction just as well but sells nothing about it, so nothing comes back. MEV Blocker differs in disclosure: its searchers subscribe to `mevblocker_partialPendingTransactions` on `wss://searchers.mevblocker.io` and receive the whole transaction without `v`, `r` and `s`, where MEV-Share shows ordinary searchers only what the user's hints allow.",
          "None of this is standard [[json-rpc|JSON-RPC]] on a node: the stream, the bundle format and the refund rules are Flashbots conventions, with per-IP limits of 1,800 `mev_sendBundle` and 300 `mev_simBundle` requests a minute. On Ethereum, Chainlink's SVR feeds for Aave deliver price reports privately through MEV-Share, so [[liquidation-bot|liquidation bots]] backrun those oracle updates here rather than in the public pool: Chainlink's searcher guide says to watch for the `forward` selector `0x6fadcf72` in a hint's `txs` and to send a body of exactly two entries, the update's hash and then the backrun.",
        ],
      },
    ],
    example: {
      title: "A hint, and the bundle that backruns it",
      language: "text",
      code: "# 1. a hint on the stream: default_logs shows the pool and that a swap happened\ncurl -sN https://mev-share.flashbots.net\n:ping\n\ndata: {\"hash\":\"0x24e6e999b8abf2c4df46e8a02516c0983043039a5a54f89fa87274427ce64798\",\"logs\":[{\"address\":\"0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640\",\"topics\":[\"0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67\"],\"data\":\"0x\"}],\"txs\":null}\n\n# 2. the backrun: POST https://relay.flashbots.net with X-Flashbots-Signature over this body\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"mev_sendBundle\",\"params\":[{\n  \"version\": \"v0.1\",\n  \"inclusion\": {\"block\": \"0x18cc839\", \"maxBlock\": \"0x18cc83b\"},\n  \"body\": [\n    {\"hash\": \"0x24e6e999b8abf2c4df46e8a02516c0983043039a5a54f89fa87274427ce64798\"},\n    {\"tx\": \"0x02f8b4018204a2843b9aca00…c3\", \"canRevert\": false}\n  ],\n  \"validity\": {\"refund\": [], \"refundConfig\": []}\n}]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{\"bundleHash\":\"0x7d6e491ab67aee5f4b75321c936bf05664d2d9b234fd67083e46bd43bb42f383\"}}\n\n# 3. mev_simBundle on the same body is refused: it still holds an unmatched {hash} entry",
      note: "The hint names a Uniswap v3 pool and the `Swap` event topic and nothing else; the body copies the hint's `hash` as received, `validity` is left empty because the node fills in the user's refund, and one submission covers blocks `0x18cc839` to `0x18cc83b`.",
    },
    pitfalls: [
      "Comparing a hint's `hash` directly with on-chain transaction hashes, when it is their keccak-256 and matches only after hashing them again.",
      "Expecting `mev_simBundle` to price a backrun before it lands, when it rejects any bundle that still contains a `{hash}` entry.",
      "Putting two backrun transactions in one bundle, which MEV-Share has not accepted since 20 October 2025.",
      "Assuming a reconnected hint stream missed nothing, when it has no replay and gaps must be backfilled from `/api/v1/history`.",
      "Assuming Protect's defaults reach every builder, when it forwards only to the Flashbots builder unless the URL adds builders or uses fast mode.",
    ],
    related: ["searcher", "mev-bundle", "private-rpc", "mev", "server-sent-events", "relay", "liquidation-bot", "mempool-streaming", "builder-api"],
    sources: [
      { title: "Flashbots: MEV-Share event stream", url: "https://docs.flashbots.net/flashbots-mev-share/searchers/event-stream" },
      { title: "Flashbots: understanding MEV-Share bundles", url: "https://docs.flashbots.net/flashbots-mev-share/searchers/understanding-bundles" },
      { title: "Flashbots Protect: settings guide", url: "https://docs.flashbots.net/flashbots-protect/settings-guide" },
      { title: "mev-share spec: mev_sendBundle v0.1", url: "https://github.com/flashbots/mev-share/blob/main/specs/bundles/v0.1.md" },
    ],
  },
  {
    id: "enshrined-pbs",
    title: "Enshrined proposer-builder separation (ePBS)",
    category: "consensus",
    aliases: ["ePBS", "EIP-7732", "Gloas", "payload timeliness committee", "PTC", "execution payload bid", "execution payload envelope", "builder withholding"],
    summary: "Enshrined proposer-builder separation (ePBS), EIP-7732 in the Gloas consensus fork of Glamsterdam, puts the hand-off of block building to outside builders into the protocol itself: the [[beacon-block|beacon block]] carries only a builder's signed bid, the builder reveals the [[execution-payload|execution payload]] later in the slot, and a committee of validators votes on whether it arrived in time.",
    sections: [
      {
        heading: "A bid in the block, the payload after it",
        paragraphs: [
          "Each 12-second [[slot-epoch|slot]] has a proposer, a [[validator|validator]] chosen to add the block, and it can sell the job of filling that block to a specialised builder. Today the sale runs through [[mev-boost|MEV-Boost]] and a [[relay|relay]]: the proposer signs a block header without seeing the transactions, trusting the relay to publish the full block and to have checked that the builder pays. EIP-7732 turns both jobs into protocol rules. Builders become a staked registry of their own, separate from validators, with deposits from 1 ETH through an execution-layer contract (EIP-8282). A bid is valid only if the builder's beacon-chain balance covers it, so the protocol can pay the proposer out of that balance.",
          "A builder signs an `ExecutionPayloadBid` naming the `parent_block_hash` it builds on, the `block_hash` it will deliver, the proposer's `fee_recipient` and the `value` it pays in gwei, and gossips it on the `execution_payload_bid` topic. The proposer puts the winning bid in its block as `signed_execution_payload_bid`, in place of the old `execution_payload` field; a proposer building for itself uses `BUILDER_INDEX_SELF_BUILD` and a value of 0. Only once the block has committed to the bid does the builder reveal the payload, so the proposer never sees the transactions before committing; it comes wrapped in a signed envelope (`SignedExecutionPayloadEnvelope`) on the `execution_payload` topic, due half-way through the slot. Nodes check it against the bid's `block_hash` and pass the payload to their [[execution-client|execution client]] with `engine_newPayload`.",
        ],
      },
      {
        heading: "The payload timeliness committee, and withholding",
        paragraphs: [
          "Splitting block and payload raises a new question each slot: did the payload arrive in time? A payload timeliness committee (PTC) of 512 validators, drawn from that slot's [[attestation|attestation]] committees, answers it: at 75% of the slot, nine seconds in, each member broadcasts a `PayloadAttestationMessage` with two booleans, `payload_present` and `blob_data_available`, and more than 256 matching votes decide what [[fork-choice|fork choice]] treats as timely and available. Fork choice now sees each beacon block as two possible branches, full with its payload and empty without, and the next block picks one through the parent hash its bid names.",
          "If the builder withholds, the slot ends empty: the beacon block stays in the chain, but no execution block exists for that slot. Processing the beacon block records the bid's `value` as a pending payment, which becomes a [[withdrawals|withdrawal]] to the `fee_recipient` once a later block builds on the delivered payload. Without a payload it is still paid at the end of the following epoch if the beacon block drew same-slot attestations worth at least 60% of one slot's stake, that is, if it arrived on time and was widely seen. EIP-7732 calls the remaining risk the free option problem: a rational builder may withhold whenever that pays better than revealing, leaving a slot without transactions.",
        ],
      },
      {
        heading: "What RPC callers see",
        paragraphs: [
          "EIP-7732 changes the [[engine-api|Engine API]] only to carry new [[execution-requests|execution request]] types. But the payload now reaches the execution client up to half a slot, six seconds, after the beacon block, so `latest` and [[eth-block-number|eth_blockNumber]] trail the beacon head by that much. An empty slot looks like a missed one: no block number is used. And a payload already imported as the head is dropped if the next proposer builds on the empty branch: a one-block [[reorg|reorg]] of the execution chain under a beacon block that stays canonical.",
          "`safe` and `finalized` sit one block further back, because a beacon block fixes only the payload its bid builds on; whether its own payload counts is decided by the block after it. The Gloas fork choice therefore sends the finalized beacon block's bid `parent_block_hash` as `finalizedBlockHash`, and the [[fast-confirmation-rule|fast confirmation rule]] counts only a confirmed beacon block's parent payload as safe. [[light-client-update|Light client headers]] keep only `execution_block_hash`, the bid's parent, so a [[light-client|light client]] must fetch the execution header with that hash to learn a `stateRoot`. On the [[beacon-api|Beacon API]], the `head_v2` event reports a `payload_status` of `empty` or `full`, and `/eth/v1/beacon/execution_payload_envelopes/{block_id}` returns the envelope.",
          "Gloas activated on the Sepolia testnet on 6 October 2026, at epoch 353024; mainnet has no date yet, and EIP-7732 is in Last Call until 1 November 2026. Off-protocol deals remain possible: the [[builder-api|Builder API]] gains Gloas endpoints such as `getExecutionPayloadBid`, and a bid may name a non-zero `execution_payment`, paid outside the protocol on trust, though such bids stay off public gossip.",
        ],
      },
    ],
    example: {
      title: "One Gloas slot, delivered and withheld",
      language: "text",
      code: "Sepolia slot 11412345, builder 42 bids 51000000 gwei (0.051 ETH)\n\nt = 0 s    proposer publishes beacon block B with signed_execution_payload_bid\n             builder_index 42, value 51000000,\n             parent_block_hash 0x5e1a…77d0, block_hash 0x9c3f…02be\nt = 3 s    attesters vote for B (25% of the slot under Gloas)\nt < 6 s    builder 42 publishes the SignedExecutionPayloadEnvelope for B\n             consensus client -> engine_newPayloadV5(block 0x9c3f…02be)   VALID\n             consensus client -> engine_forkchoiceUpdatedV4(head 0x9c3f…02be)\n             eth_blockNumber goes up by one\nt = 9 s    PTC: 503 of 512 vote payload_present true, blob_data_available true\nnext slot  the proposer builds on B as full: bid parent_block_hash 0x9c3f…02be\n             B's 51000000 gwei is queued as a withdrawal to the fee_recipient\n\nthe same slot if builder 42 withholds\nt = 9 s    PTC: 498 of 512 vote payload_present false\nnext slot  the proposer builds on B as empty: bid parent_block_hash 0x5e1a…77d0\n             no execution block exists for slot 11412345\nat the end of the next epoch\n             B drew same-slot attestations worth >= 60% of one slot's stake,\n             so the 51000000 gwei is paid anyway",
      note: "The beacon block is canonical in both branches; only the execution chain differs, by one block, and in the second branch the proposer is paid for a payload nobody saw.",
    },
    pitfalls: [
      "Mapping slots to execution blocks by counting beacon blocks, when an empty slot has a beacon block but no payload.",
      "Treating the newest `latest` block as settled because its beacon block is canonical, when the next proposer can still build on the empty branch.",
      "Assuming every included bid pays the proposer; a late block that misses the 60% attestation threshold can end with no payload and no payment.",
    ],
    related: ["builder-api", "relay", "mev-boost", "beacon-block", "execution-payload", "block-proposal", "fork-choice", "engine-api", "light-client-update", "fast-confirmation-rule"],
    sources: [
      { title: "EIP-7732: Enshrined Proposer-Builder Separation", url: "https://eips.ethereum.org/EIPS/eip-7732" },
      { title: "consensus-specs: Gloas beacon chain", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/gloas/beacon-chain.md" },
      { title: "consensus-specs: Gloas fork choice", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/gloas/fork-choice.md" },
      { title: "EIP-7773: Hardfork Meta - Glamsterdam", url: "https://eips.ethereum.org/EIPS/eip-7773" },
    ],
  },
  {
    id: "fast-confirmation-rule",
    title: "Fast confirmation rule",
    category: "consensus",
    aliases: ["FCR", "fast confirmation", "safe block", "safe head", "confirmed block", "CONFIRMATION_BYZANTINE_THRESHOLD", "fast_confirmation event"],
    summary: "The fast confirmation rule (FCR) is a consensus-specs algorithm that a [[consensus-client|consensus client]] runs every slot to confirm a block within a slot or two, guaranteed to stay canonical while votes arrive on time and at most a quarter of stake is adversarial; the specs send its result to the [[execution-client|execution client]] as the `safe` block.",
    sections: [
      {
        heading: "What it promises, and under which assumptions",
        paragraphs: [
          "Each 12-second [[slot-epoch|slot]] can add a block. [[fork-choice|Fork choice]] picks the head from validators' latest votes, but a head can still be replaced, and [[finality|finality]] makes a block irreversible only about two epochs (64 slots) later, 13 minutes or more. In between, a block is probably safe, but nothing says how safe. The FCR, added to consensus-specs in April 2026, measures it. For each block since the last confirmed one, it asks: has so much of the stake due to vote since that block backed it or its descendants that no other branch could overtake it, even if a quarter of all validators turned against it? Normally the answer is yes after one or two slots, 12 to 24 seconds.",
          "Two assumptions carry the guarantee: synchrony, meaning honest validators' attestations reach every honest node by the end of their slot, and `CONFIRMATION_BYZANTINE_THRESHOLD`, 25, meaning at most 25% of validators are Byzantine and may vote arbitrarily. If synchrony breaks, the spec warns, confirmed blocks can be [[reorg|reorged]] without any attack and without anyone being [[slashing|slashed]]. Finality promises more: reverting a finalized block needs at least a third of all stake to be slashed, whatever the network did.",
        ],
      },
      {
        heading: "How a block gets confirmed",
        paragraphs: [
          "The test is a weighing. Every validator [[attestation|attests]] once per epoch, so each slot a 32nd of the stake votes, split into as many as 64 committees; as in the specification, one committee's weight here means all of a slot's committees combined. On one side is the weight behind the block and its descendants. On the other is all a competing branch could gather: votes that went elsewhere or were never cast, the proposer boost of 40% of one committee's weight that fork choice gives a timely new block, and the adversary's 25%, counted twice because those votes can leave one side and join the other. The block therefore needs more than (maximum + boost + 2 × adversary) / 2, where the maximum is all the weight the committees since the block's parent could cast.",
          "For a block one slot old that is (100% + 40% + 50%) / 2: more than 95% of its slot's committee. With two slots of votes it is (200% + 40% + 100%) / 2, 170% of one committee, or 85% of the votes possible. So a block backed by 97% of its committee is confirmed at the start of the next slot; at 93% it waits one more. Every ancestor back to the last confirmed block must pass too, and for a block from the current epoch, that epoch's checkpoint, its boundary block, must be on course for justification, the first of finality's two steps.",
          "The client runs the rule early in each slot, after applying the previous slot's votes and before the current slot's attestations are due, and sends the confirmed block's execution hash as `safeBlockHash` in `engine_forkchoiceUpdated` over the [[engine-api|Engine API]]. If the confirmed block is from before the previous epoch, leaves the canonical chain, or fails the recheck at each epoch boundary, the rule falls back to the finalized block and later restarts from the justified checkpoint. A restart does the same unless the client implements the spec's optional restore step, as Lighthouse does.",
        ],
      },
      {
        heading: "What it does to the safe tag",
        paragraphs: [
          "Before the FCR, `safe` was the block at the latest justified checkpoint, usually one to two epochs, 6 to 13 minutes, behind the head. A client running the rule sends a block one or two behind `latest`, so `eth_getBlockByNumber` with `safe` moves minutes closer to the head. It can also move backwards: when the rule falls back, `safe` drops to the finalized block, dozens of blocks lower. Under [[enshrined-pbs|ePBS]] the safe hash is the confirmed beacon block's parent payload, one block further back.",
          "Clients differ, and no endpoint says which rule produced its `safe`. [[nimbus|Nimbus]] runs the rule by default. [[lighthouse|Lighthouse]] (v8.3.0) and [[prysm|Prysm]] (v7.2.0) ship it behind `--enable-fast-confirmation` and [[lodestar|Lodestar]] behind `--chain.fastConfirmation`, all off by default; [[teku|Teku]] hides it behind the experimental `--Xfast-confirmation-enabled`, and [[grandine|Grandine]]'s is an open pull request. [[nethermind|Nethermind]] releases before 1.38.0 rejected near-head safe hashes with `-38002`, and Nimbus briefly stopped sending its result as the safe hash because of it. Clients running it also emit a `fast_confirmation` event on `/eth/v1/events`. An [[exchange-deposits|exchange crediting deposits]] or a [[cross-chain-relayer|bridge relayer]] that waits for `safe` therefore waits 12 seconds on one endpoint and 12 minutes on another.",
        ],
      },
    ],
    example: {
      title: "Slot by slot on a Lighthouse node started with the FCR enabled",
      language: "text",
      code: "slot 15536866   block A proposed (execution block 26,297,530 = 0x19144ba)\n                 97% of slot 15536866's committee weight attests to A\nslot 15536867   FCR runs early in the slot:\n                 97% > (100% + 40% + 2 x 25%) / 2 = 95%   ->  A confirmed\n                 engine_forkchoiceUpdatedV3 { head: B 26,297,531, safe: A 26,297,530,\n                                              finalized: 26,297,465 }\n                 event: fast_confirmation\n                 data: {\"block\":\"0x3352…8988\",\"slot\":\"15536866\",\"current_slot\":\"15536867\"}\n\neth_getBlockByNumber latest     -> 0x19144bb (26,297,531)\neth_getBlockByNumber safe       -> 0x19144ba (26,297,530)\neth_getBlockByNumber finalized  -> 0x1914479 (26,297,465)\n\nslot 15536868   block C gets 93% of its committee\nslot 15536869   93% < 95%: C not confirmed, safe stays below C\nslot 15536870   C now has 186% of one committee from two slots > 170%: C confirmed\n\nafter a fallback, or a restart without the restore step\n                 safe = the finalized block, until the rule can advance again",
      note: "The `fast_confirmation` event names the beacon block root and slot; the execution client only ever sees the resulting `safeBlockHash`, and nothing in its JSON-RPC answer says which rule chose it.",
    },
    pitfalls: [
      "Treating an FCR `safe` block as final, when it holds only while the synchrony and 25% assumptions hold and reverting it slashes nobody.",
      "Assuming `safe` only moves forward, when a fallback sends it back to the finalized block in a single update.",
      "Alerting on `safe` lag just after a consensus client restarts, when the rule legitimately reports the finalized block until it can advance again.",
    ],
    related: ["block-tag", "finality", "fork-choice", "attestation", "confirmations", "engine-api", "consensus-client", "lighthouse", "preconfirmation", "reorg"],
    sources: [
      { title: "consensus-specs: Phase 0 fast confirmation", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/phase0/fast-confirmation.md" },
      { title: "A Confirmation Rule for the Ethereum Consensus Protocol (arXiv 2405.00549)", url: "https://arxiv.org/abs/2405.00549" },
      { title: "Lighthouse Book: Fast Confirmation Rule", url: "https://lighthouse-book.sigmaprime.io/advanced_fcr.html" },
      { title: "Lodestar: Fast Confirmation", url: "https://chainsafe.github.io/lodestar/run/beacon-management/fast-confirmation/" },
    ],
  },
];

export default { topics };
