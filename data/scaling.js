// Category: Layer 2 & scaling — rollups, sequencers, blobs, and how RPC differs
// when the chain answering you is an L2.

export const topics = [
  {
    id: "rollup",
    title: "Rollup",
    category: "scaling",
    aliases: ["l2", "layer 2", "rollups", "optimism", "base", "arbitrum", "zksync", "scroll"],
    summary: "A rollup is a chain that executes transactions on its own nodes but publishes the transaction data and a state commitment to Ethereum [[smart-contract|contracts]], so L1 rather than a separate validator set is what ultimately decides its state.",
    sections: [
      {
        heading: "What makes a chain a rollup",
        paragraphs: [
          "A rollup runs an [[evm|EVM]]-compatible chain of its own, with its own [[block|blocks]], [[chain-id|chain id]], [[mempool|transaction pool]], and [[execution-client|execution client]] serving ordinary [[json-rpc|JSON-RPC]]. What separates it from an independent chain is that it has no validator set of its own deciding what is true. It publishes every transaction it executes to Ethereum as [[data-availability|available data]], and it publishes commitments to the resulting state into a set of L1 contracts. Anyone can read L1, replay that data, and derive the same state without asking the rollup's operators for anything.",
          "The L1 contracts will not accept an arbitrary state commitment. On one family an incorrect commitment can be disproved with a [[fraud-proof|fraud proof]] during a challenge window; on the other a [[validity-proof|validity proof]] is checked before the commitment counts at all. Either way the rollup's canonical state is a function of data that lives on Ethereum, which is the property the word 'rollup' is reserved for. A chain that keeps its data with an outside committee is a [[validium|validium]] or alt-DA chain instead, and its users trust that committee to stay honest and online.",
        ],
      },
      {
        heading: "Where the cost savings come from",
        paragraphs: [
          "Execution is cheap because only the rollup's own nodes run it, and because L1 [[gas|gas]] is paid once per batch of thousands of transactions instead of once per transaction. Since [[blob|blobs]] arrived with Dencun in March 2024, batches go into blob space rather than calldata, which is priced by a separate market and which nodes discard after about 18 days. That one change cut L2 fees by roughly an order of magnitude.",
          "The L1 data cost is still the dominant term in an L2 fee, so rollups charge it back to users as a separate data fee on top of ordinary execution gas. That is the single biggest reason an L2 fee estimate does not work like an L1 one; see [[l2-rpc|L2 RPC differences]].",
        ],
      },
      {
        heading: "The moving parts",
        paragraphs: [
          "Four roles appear on every rollup. A [[sequencer|sequencer]] orders incoming transactions and produces L2 blocks in a second or two, which is what users experience as confirmation. A batcher compresses those blocks and posts them to L1. A proposer submits state commitments. A prover or [[op-challenger|challenger]] backs those commitments with a proof. The canonical [[bridge|bridge]] contracts move ETH and tokens in both directions and are the reason a withdrawal is slower than a deposit.",
          "On an OP Stack chain the node is two processes, mirroring L1: `op-node` derives the L2 chain from L1 data and plays the consensus role, driving an execution client — `op-geth`, `op-reth`, or [[nethermind|Nethermind]] — over the same [[engine-api|Engine API]] a mainnet [[consensus-client|consensus client]] uses. Arbitrum Nitro packages the equivalent roles into a single Nitro process built around a modified go-ethereum core.",
        ],
      },
      {
        heading: "Why it still speaks eth_",
        paragraphs: [
          "Rollups deliberately expose the same method set as L1, so [[client-libraries|client libraries]], wallets, and [[indexer|indexers]] work unchanged: [[eth-call|eth_call]], [[eth-get-logs|eth_getLogs]], and [[eth-send-raw-transaction|eth_sendRawTransaction]] all behave as expected. The semantics underneath are what shift. Blocks arrive in seconds rather than 12, the `safe` and `finalized` [[block-tag|block tags]] are derived from L1 rather than from local [[finality|finality]], fee estimation has an extra L1 component, and receipts carry extra fields. Treating an L2 endpoint as 'Ethereum but faster' is where most integration bugs start.",
        ],
      },
    ],
    example: {
      title: "The same call against L1 and an L2",
      language: "bash",
      code: "# L1: 12-second blocks, chain id 0x1\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_chainId\",\"params\":[]}' \\\n  https://rpc.example\n# -> {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0xa\"}   # OP Mainnet is chain id 10\n\n# identical method, identical shape, different chain and different block cadence\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_getBlockByNumber\",\"params\":[\"latest\",false]}' \\\n  https://l2.rpc.example",
      note: "Always confirm the chain id before sending anything; the method set gives no hint which chain you reached.",
    },
    pitfalls: [
      "Assuming an L2 block number relates to an L1 block number; they are independent counters, and on Arbitrum the EVM's `block.number` reports an approximate L1 number while [[eth-block-number|eth_blockNumber]] reports the L2 one.",
      "Treating a sequencer confirmation as settlement; until the batch is on L1 and the commitment is accepted, the only party asserting that block exists is the sequencer.",
      "Reusing an L1 gas estimate on an L2; the data fee, the gas schedule, and the fee parameters all differ.",
    ],
    related: ["optimistic-rollup", "zk-rollup", "l2-rpc", "sequencer", "data-availability", "blob", "bridge", "fraud-proof", "validity-proof", "block-tag"],
    sources: [
      { title: "ethereum.org: Layer 2 scaling", url: "https://ethereum.org/developers/docs/scaling/" },
      { title: "Optimism docs: OP Stack", url: "https://docs.optimism.io/" },
      { title: "Arbitrum docs", url: "https://docs.arbitrum.io/" },
    ],
  },
  {
    id: "optimistic-rollup",
    title: "Optimistic rollups",
    category: "scaling",
    aliases: ["optimism", "op stack", "base", "arbitrum", "nitro", "challenge window", "bedrock"],
    summary: "An optimistic rollup posts state commitments to L1 without proving them up front and lets anyone disprove a wrong one with a [[fraud-proof|fraud proof]] during a challenge window, typically seven days, before the commitment can be used to release funds.",
    sections: [
      {
        heading: "The optimistic assumption",
        paragraphs: [
          "The chain publishes its transaction data to L1, and a proposer publishes an output root committing to the L2 state after some block. The L1 contracts accept that root provisionally. If it is wrong, anyone who replayed the published data can open a dispute and, at the end of an interactive game, prove on L1 that the proposer lied. Nothing is proved in the happy path, which is why this family is cheap.",
          "The security assumption is one honest challenger with funds and software ready to act inside the window. That is what buys the seven days: a shorter window leaves less room to react to L1 censorship, a longer one makes [[bridge|withdrawals]] slower still. None of it affects reads, since the chain's own nodes execute normally and answer [[json-rpc|JSON-RPC]] from real state.",
        ],
      },
      {
        heading: "The two main stacks",
        paragraphs: [
          "OP Stack powers Optimism, Base, and many others from a shared codebase. Its node splits like an L1 node: `op-node` runs the [[derivation-pipeline|derivation pipeline]] that rebuilds the L2 chain from L1 batches and deposits, and drives an [[execution-client|execution client]] — `op-geth`, `op-reth`, or [[nethermind|Nethermind]] — over the [[engine-api|Engine API]]. Blocks are produced every 2 seconds whether or not there are transactions. Its fault proof system bisects a disputed claim down to one instruction and executes that step on L1 in an on-chain MIPS interpreter called Cannon.",
          "Arbitrum One and Nova run Nitro, a single process built around a modified go-ethereum core. The same state transition function is compiled to WASM so it can be replayed inside the dispute game, and BoLD (Bounded Liquidity Delay) makes validation permissionless with a bounded settlement time rather than relying on a whitelist of validators. Nitro blocks are produced on demand, as often as every 250 milliseconds.",
        ],
      },
      {
        heading: "What it means for callers",
        paragraphs: [
          "Both stacks accept the standard method set, and both change what the [[block-tag|block tags]] mean. `latest` on a sequencer endpoint is [[preconfirmation|an unsafe head]]: a block the [[sequencer|sequencer]] has produced and gossiped but that no L1 batch mentions yet. `safe` is the head derived from batch data already on L1, and `finalized` is the head derived from L1 data that L1 itself has finalized, so it trails by L1 [[finality|finality]] plus the batch posting interval. An unsafe block can be replaced without any L1 [[reorg|reorg]] if the sequencer's chain and the derived chain disagree.",
          "Fees have two parts. Execution gas is metered by the [[evm|EVM]] as usual and is nearly free; the L1 data cost is charged separately and is usually the larger half. OP Stack surfaces it as `l1Fee` on the [[transaction-receipt|receipt]]; Arbitrum folds it into the gas number as `gasUsedForL1`. Details are in [[l2-rpc|L2 RPC differences]].",
        ],
      },
    ],
    pitfalls: [
      "Assuming the challenge window delays deposits; deposits from L1 land in minutes, only withdrawals wait for the window.",
      "Polling an optimistic rollup for `finalized` and expecting it to move every few seconds; it advances in steps tied to L1 finality and batch posting.",
      "Comparing L2 block numbers across chains to judge elapsed time; 2-second OP Stack blocks and sub-second Arbitrum blocks measure very different intervals.",
    ],
    related: ["rollup", "fraud-proof", "l2-rpc", "sequencer", "bridge", "zk-rollup", "block-tag", "data-availability", "nethermind", "derivation-pipeline", "op-challenger"],
    sources: [
      { title: "ethereum.org: Optimistic rollups", url: "https://ethereum.org/developers/docs/scaling/optimistic-rollups/" },
      { title: "Optimism docs: OP Stack architecture", url: "https://docs.optimism.io/" },
      { title: "Arbitrum docs: how Arbitrum works", url: "https://docs.arbitrum.io/" },
    ],
  },
  {
    id: "zk-rollup",
    title: "ZK rollups",
    category: "scaling",
    aliases: ["zksync", "scroll", "linea", "polygon zkevm", "starknet", "zkevm", "validity rollup"],
    summary: "A ZK rollup posts each batch together with a [[validity-proof|validity proof]] that an L1 verifier contract checks before accepting the new state, so a wrong state transition is rejected outright rather than challenged afterwards.",
    sections: [
      {
        heading: "How a batch becomes canonical",
        paragraphs: [
          "The [[sequencer|sequencer]] executes transactions and produces L2 blocks as any chain does. Those blocks are grouped into a batch, the batch's data is published so the state can be reconstructed by anyone, and a prover generates a succinct proof that running the batch against the previous [[state-root|state root]] yields the new one. An L1 contract verifies the proof in a single transaction whose cost barely depends on how much work the batch contained. Once that transaction is included and L1 [[finality|finality]] covers it, the L2 state is as settled as Ethereum itself.",
          "That gives ZK rollups several visible stages instead of one: executed by the sequencer, committed with its data on L1, proved, and finalized. Explorers and RPC extensions expose them separately, because a transaction is irreversible in practice long before it is provably final. The gap is set by proving time and submission frequency, and runs from minutes to hours.",
        ],
      },
      {
        heading: "The landscape",
        paragraphs: [
          "zkSync Era, Scroll, Linea, and Polygon zkEVM run zkEVMs: they aim to execute the same bytecode as Ethereum and expose the same method set, differing in how closely they match L1 [[gas|gas]] costs and opcode behavior. Starknet is not an EVM chain — it runs Cairo contracts and exposes its own `starknet_` [[json-rpc|JSON-RPC]] rather than `eth_` methods, so [[client-libraries|Ethereum libraries]] do not work against it unaided.",
          "Proof systems differ too, mostly in cost and latency: SNARK families need a verifier contract with a fixed circuit, STARK-based systems trade larger proofs for no trusted setup, and most chains aggregate many proofs into one before touching L1. Nearly all still have an upgradeable verifier controlled by a multisig or security council, so the honest description of the trust model is 'proof plus governance'.",
        ],
      },
      {
        heading: "RPC differences",
        paragraphs: [
          "The `eth_` surface is the same, with chain-specific additions. zkSync Era adds a `zks_` namespace — `zks_L1BatchNumber` for the latest proved batch, `zks_getL1BatchDetails` for its commit and prove transactions, `zks_estimateFee` for its fee model — and its [[transaction-receipt|receipts]] carry `l1BatchNumber` and `l1BatchTxIndex` so a caller can map a transaction to the batch that will prove it. Scroll and Linea expose similar batch lookups of their own.",
          "The [[block-tag|block tags]] surprise people most. On several ZK chains `finalized` tracks the last batch whose proof has been verified on L1, so it can trail `latest` by far more than the two epochs an L1 caller expects; on others the tags are only approximated. For anything that must not be reversed, wait for the batch's L1 proof transaction rather than for a block count; see [[l2-rpc|L2 RPC differences]].",
        ],
      },
    ],
    pitfalls: [
      "Reading `finalized` on a ZK chain and assuming the L1 lag; it is tied to proof submission, which can be an hour or more behind.",
      "Assuming every ZK rollup is bytecode-identical to Ethereum; gas costs, some opcodes, and native [[erc-4337|account abstraction]] behavior differ per chain, and Starknet is a different VM entirely.",
      "Treating a validity proof as covering [[data-availability|data availability]]; the proof shows the transition was correct, not that anyone can still obtain the data needed to rebuild the state.",
    ],
    related: ["validity-proof", "rollup", "l2-rpc", "optimistic-rollup", "data-availability", "sequencer", "bridge", "block-tag", "finality", "validium"],
    sources: [
      { title: "ethereum.org: ZK rollups", url: "https://ethereum.org/developers/docs/scaling/zk-rollups/" },
      { title: "zkSync Era documentation", url: "https://docs.zksync.io/" },
      { title: "Scroll documentation", url: "https://docs.scroll.io/" },
    ],
  },
  {
    id: "fraud-proof",
    title: "Fraud proof",
    category: "scaling",
    aliases: ["fault proof", "dispute game", "cannon", "bold", "bisection", "challenge"],
    summary: "A fraud proof is the on-chain procedure that disproves an incorrect state commitment from an [[optimistic-rollup|optimistic rollup]] by narrowing the dispute to a single execution step that an L1 contract can run and judge for itself.",
    sections: [
      {
        heading: "Why it is interactive",
        paragraphs: [
          "L1 cannot re-execute a whole L2 batch; that would defeat the purpose of the rollup. Instead the [[op-challenger|challenger]] and the defender play a bisection game. Each claims a different state after a range of execution. They repeatedly split the range in half and state the intermediate results until they disagree about one single instruction. Only that instruction is executed on L1, against the memory and registers both sides agreed on, and the contract compares the result with what each party claimed. The loser's bond is slashed.",
          "Executing one instruction on L1 requires an interpreter for the machine the L2's state transition function was compiled to. OP Stack compiles it to MIPS and runs the disputed step in the on-chain Cannon interpreter; Arbitrum compiles the Nitro state transition function to WASM and runs it in a WASM interpreter. Both also need the disputed inputs on demand, supplied through a preimage oracle contract that anyone can populate from published data.",
        ],
      },
      {
        heading: "Who can challenge",
        paragraphs: [
          "The whole design rests on at least one honest party who has the published [[data-availability|data]], re-derived the chain, noticed the bad commitment, and has capital to bond. Early deployments used a permissioned validator list. OP Stack's dispute game and Arbitrum's BoLD both make it permissionless, with BoLD adding a bounded settlement time so that an attacker cannot delay resolution indefinitely by spawning challenges.",
          "The consequence for users is the challenge window, seven days on OP Stack chains and comparable on Arbitrum. A state commitment older than the window is treated as settled and can be used to release funds through the [[bridge|bridge]]; a newer one cannot. That is the entire reason a canonical L2 withdrawal takes a week while a deposit takes minutes.",
        ],
      },
      {
        heading: "What it does and does not prove",
        paragraphs: [
          "A successful fraud proof establishes that a specific claimed [[state-root|state root]] does not follow from the agreed inputs. It says nothing about whether your transaction was included, whether the [[sequencer|sequencer]] censored you, or whether the data was published in the first place — a chain that withholds data cannot be challenged, because nobody can compute the correct answer to challenge with. Availability is a separate property with its own mechanism; see [[data-availability|data availability]].",
          "It is also not something an application calls over [[json-rpc|JSON-RPC]]. Disputes happen through L1 contract transactions and are observed with [[eth-get-logs|eth_getLogs]] against the dispute game contracts. What an ordinary caller sees is timing: a withdrawal that cannot be finalized yet, and a [[block-tag|block tag]] whose meaning is defined by L1 rather than by the L2 node answering the call.",
        ],
      },
    ],
    pitfalls: [
      "Assuming a fraud proof can rescue funds after data withholding; without the data nobody can construct the correct claim to dispute.",
      "Believing the challenge window applies per transaction; it applies to the state commitment that a withdrawal is proved against.",
      "Expecting an RPC method that reports dispute status; you read the L1 dispute game contracts and their logs, not the L2 node.",
      "Confusing an [[execution-trace|execution trace]] from `debug_` with a fraud proof; a trace is one node's account of execution, not something L1 can adjudicate.",
    ],
    related: ["optimistic-rollup", "bridge", "rollup", "validity-proof", "sequencer", "data-availability", "l2-rpc", "execution-trace", "op-challenger"],
    sources: [
      { title: "ethereum.org: Optimistic rollups and fault proofs", url: "https://ethereum.org/developers/docs/scaling/optimistic-rollups/" },
      { title: "Optimism docs: fault proofs", url: "https://docs.optimism.io/" },
      { title: "Arbitrum docs: BoLD", url: "https://docs.arbitrum.io/" },
    ],
  },
  {
    id: "validity-proof",
    title: "Validity proof",
    category: "scaling",
    aliases: ["zk proof", "snark", "stark", "zkevm proof", "prover", "verifier contract"],
    summary: "A validity proof is a succinct cryptographic argument that a batch of L2 transactions was executed correctly, small and cheap enough for an L1 verifier [[smart-contract|contract]] to check before accepting the resulting state root.",
    sections: [
      {
        heading: "What is being proved",
        paragraphs: [
          "The statement is narrow and precise: given a starting [[state-root|state root]], this list of transactions, and these public inputs, running the state transition function yields that ending state root. The prover turns the execution into an arithmetic circuit or trace, commits to it, and produces a proof. The verifier contract on L1 checks the proof against the public inputs in a single transaction whose [[gas|gas]] cost is close to constant regardless of whether the batch held a hundred transactions or a hundred thousand.",
          "Proving is asymmetric work. Generating the proof can take minutes to hours on specialized hardware, which is why [[zk-rollup|ZK rollups]] batch aggressively and often aggregate many proofs into one recursive proof before submitting. Verification is the cheap side, and that asymmetry is the whole economic argument for the design.",
        ],
      },
      {
        heading: "Proof systems in practice",
        paragraphs: [
          "SNARK families produce small constant-size proofs and verify fast, at the cost of a circuit-specific setup; STARK-based systems avoid a trusted setup and rely only on hash functions, at the cost of larger proofs. Several chains prove with STARKs and then wrap the result in a SNARK so the final on-chain verification is cheap. As a caller you never see any of this — you see how long it takes for a batch to reach the proved stage and how much the chain charges for it.",
          "Proving the EVM is hard because the EVM was not designed to be proved: 256-bit arithmetic, [[keccak-256|Keccak-256]] everywhere, and a Merkle-Patricia state trie are all expensive in circuits. Chains resolve this differently, which is why a zkEVM's [[gas|gas]] schedule and occasionally its opcode behavior can diverge from L1.",
        ],
      },
      {
        heading: "What it changes and what it does not",
        paragraphs: [
          "Because correctness is established up front there is no challenge window, so a canonical [[bridge|bridge]] withdrawal can finalize as soon as the proof is verified and that L1 transaction is safely included — hours rather than a week. It also means no honest-challenger assumption: nobody needs to be watching for a [[fraud-proof|fraud proof]] to keep the chain honest.",
          "The limits are worth stating plainly. A validity proof does not prove that the data behind the batch is available, so a proved chain can still leave users unable to construct their own withdrawal proofs; see [[data-availability|data availability]]. It does not prove the [[sequencer|sequencer]] included your transaction or ordered it fairly. And it is only as strong as the verifier contract deployed on L1, which on most chains is still upgradeable by a small group, and as the circuit itself, where a soundness bug would be silent.",
        ],
      },
    ],
    pitfalls: [
      "Reading 'zero knowledge' as privacy; these proofs are used for succinctness, and the transaction data is published in full.",
      "Assuming proof verification cost scales with batch size; it is near-constant, which is exactly why batches are large.",
      "Treating a proved state as beyond governance risk; an upgradeable verifier or a circuit bug is a real part of the trust model.",
      "Expecting a validity proof to make the [[sequencer|sequencer]] trustworthy about inclusion or ordering; it only constrains execution.",
    ],
    related: ["zk-rollup", "fraud-proof", "rollup", "bridge", "data-availability", "state-root", "l2-rpc", "sequencer", "real-time-proving"],
    sources: [
      { title: "ethereum.org: ZK rollups", url: "https://ethereum.org/developers/docs/scaling/zk-rollups/" },
      { title: "ethereum.org: Layer 2 scaling", url: "https://ethereum.org/developers/docs/scaling/" },
      { title: "zkSync Era documentation", url: "https://docs.zksync.io/" },
    ],
  },
  {
    id: "sequencer",
    title: "Sequencer",
    category: "scaling",
    aliases: ["sequencing", "unsafe head", "forced inclusion", "based rollup"],
    summary: "A sequencer is the party that receives an L2's transactions, fixes their order, and produces blocks immediately, giving users a [[preconfirmation|soft confirmation]] long before the batch containing them reaches L1.",
    sections: [
      {
        heading: "What it actually does",
        paragraphs: [
          "The sequencer runs a node with a privileged role. It accepts transactions through its own [[eth-send-raw-transaction|eth_sendRawTransaction]] endpoint, orders them — first-come-first-served on both OP Stack and Arbitrum today — executes them, and produces a signed L2 [[block|block]]. OP Stack produces one every 2 seconds whether or not there is anything to include; Arbitrum Nitro produces them on demand, down to roughly 250 milliseconds apart. Those blocks are gossiped to replica nodes, which is how a public [[rpc-provider|RPC endpoint]] can show your transaction a moment after you send it.",
          "This is a promise, not a settlement. Nothing about that block is on L1 yet, and no [[fraud-proof|fraud proof]] or [[validity-proof|validity proof]] covers it. Only when the batcher posts the [[data-availability|batch data]] and a state commitment follows does the block become something L1 recognizes. Until then the sequencer could in principle replace it, which is exactly why the `safe` and `finalized` [[block-tag|block tags]] on an L2 mean something different from `latest`.",
        ],
      },
      {
        heading: "Sequencer endpoint versus replica",
        paragraphs: [
          "Reads and writes take different paths. Any node that follows the chain can serve [[eth-call|eth_call]] or [[eth-get-logs|eth_getLogs]], but only the sequencer can include a transaction, so public endpoints forward `eth_sendRawTransaction` to it while answering reads locally. The immediate consequence is [[head-lag|head lag]]: a [[transaction-receipt|receipt]] can exist at the sequencer and still be `null` on the replica you poll a few hundred milliseconds later. Poll the same URL you sent to, and tolerate several `null` responses.",
          "Most rollups also have no public [[mempool|transaction pool]]. [[eth-subscribe|eth_subscribe]] with `newPendingTransactions` and the `txpool_` methods return little or nothing, and the `pending` block tag is close to meaningless. That removes ordinary sandwiching, since nobody else sees your transaction before it executes, and concentrates the same discretion in one operator instead.",
        ],
      },
      {
        heading: "Centralization, escape hatches, and downtime",
        paragraphs: [
          "Nearly every production rollup runs a single sequencer, so censorship resistance comes from a separate path: submitting through L1. On OP Stack a call to the `OptimismPortal` contract produces a deposit that the [[derivation-pipeline|derivation pipeline]] must include, and it appears on L2 as a type `0x7e` transaction within the chain's sequencing window, which is measured in hours. Arbitrum has the equivalent through its delayed inbox. This path is slow and costs L1 [[gas|gas]], but it does not need the sequencer's cooperation.",
          "If the sequencer stops, the chain stops producing blocks. Reads keep working against replicas, balances are unchanged, and nothing is lost, but no new transaction confirms until it restarts or the forced-inclusion path is used. Designs that remove the single point — shared sequencer networks, and based rollups that let L1 proposers do the sequencing — exist but are not yet how the large chains run.",
        ],
      },
    ],
    example: {
      title: "Writes go to the sequencer, reads can go anywhere",
      language: "bash",
      code: "# write path: must reach the sequencer endpoint\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_sendRawTransaction\",\"params\":[\"0x02f8…c0\"]}' \\\n  https://sequencer.l2.example\n\n# read path: any replica following the chain will do\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_getTransactionReceipt\",\"params\":[\"0x7bd1…9f02\"]}' \\\n  https://replica.l2.example",
      note: "Sending to one host and polling another is the most common cause of a receipt that appears to be missing on an L2.",
    },
    pitfalls: [
      "Treating a sequencer response as final; it is one operator's assertion until the batch and its state commitment reach L1.",
      "Expecting a populated pending pool on an L2; most rollups keep the queue private, so subscriptions to pending transactions stay empty.",
      "Assuming a stalled L2 means lost funds; the chain simply stops advancing, and forced inclusion through L1 remains available.",
    ],
    related: ["l2-rpc", "rollup", "optimistic-rollup", "head-lag", "block-tag", "bridge", "mempool", "data-availability", "mev", "derivation-pipeline", "price-oracle"],
    sources: [
      { title: "Optimism docs: sequencer and rollup node", url: "https://docs.optimism.io/" },
      { title: "Arbitrum docs: the sequencer", url: "https://docs.arbitrum.io/" },
      { title: "ethereum.org: Layer 2 scaling", url: "https://ethereum.org/developers/docs/scaling/" },
    ],
  },
  {
    id: "l2-rpc",
    title: "L2 RPC differences",
    category: "scaling",
    aliases: ["l1Fee", "l1GasUsed", "l1BlockNumber", "0x7e", "deposit transaction", "arb_", "zks_", "optimism_"],
    summary: "An L2 endpoint answers the same `eth_` methods as L1 but with different block cadence, extra [[transaction-receipt|receipt]] fields for the L1 data cost, chain-specific namespaces, and `safe` and `finalized` derived from L1 rather than from local [[finality|finality]].",
    sections: [
      {
        heading: "Same methods, different cadence",
        paragraphs: [
          "OP Stack chains produce a [[block|block]] every 2 seconds and Arbitrum Nitro roughly every 250 milliseconds, so an L2 block number covers a tiny slice of time compared with an L1 one. A 10,000-block [[eth-get-logs|eth_getLogs]] range is under six hours on OP Stack and well under an hour on Arbitrum, which is why providers cap ranges aggressively and why an [[indexer|indexer]] tuned for L1 will fall behind. `latest` changes under you constantly, so pin an explicit block number whenever several reads must agree.",
          "The [[block-tag|block tags]] are computed from L1. On OP Stack, `op-node` marks the head derived from batch data already on L1 as `safe`, and the head derived from L1 data that L1 has finalized as `finalized`; blocks the [[sequencer|sequencer]] produced but that no batch covers yet form the unsafe head that `latest` points at. `finalized` therefore trails by L1 finality, about 13 minutes, plus however long the batcher waits before posting. It can also sit still for minutes at a time, which breaks health checks that expect it to advance every block.",
        ],
      },
      {
        heading: "Extra fields",
        paragraphs: [
          "OP Stack receipts carry the L1 data charge alongside the usual fields: `l1Fee` is the wei charged for publishing the transaction, `l1GasUsed` the estimated L1 gas for its compressed bytes, and `l1BaseFee`, `l1BaseFeeScalar`, `l1BlobBaseFee`, and `l1BlobBaseFeeScalar` the inputs used to compute it. Arbitrum instead exposes `l1BlockNumber` on blocks and transactions and `gasUsedForL1` on receipts. zkSync Era adds `l1BatchNumber` and `l1BatchTxIndex`, which map a transaction to the batch whose proof will settle it.",
          "Deposits from L1 appear as a transaction type that does not exist on mainnet: `0x7e` on OP Stack. Such a transaction has no signature, carries `sourceHash` and `mint` fields, and has a `from` equal to the L1 sender's [[address|address]], or to that address's alias when the sender is a contract. Strict decoders in [[client-libraries|client libraries]] and [[indexer|indexers]] that switch on [[transaction-types|transaction type]] will throw on it unless they were written for OP Stack.",
        ],
      },
      {
        heading: "Fees are estimated differently",
        paragraphs: [
          "On OP Stack, [[eth-estimate-gas|eth_estimateGas]] returns only the L2 execution gas; the L1 data fee is charged on top and is usually the larger part. To show a user a real total you query the `GasPriceOracle` [[predeploys|predeploy]] at `0x420000000000000000000000000000000000000F` with [[eth-call|eth_call]], passing the serialized transaction to `getL1Fee`. Arbitrum takes the opposite approach and folds the L1 component into the gas number itself, so its estimate already includes it and the `gasUsedForL1` field tells you how much of the total that was.",
        ],
      },
      {
        heading: "Chain-specific namespaces",
        paragraphs: [
          "`op-node` exposes an `optimism_` [[namespaces|namespace]] on its own port with `optimism_syncStatus`, `optimism_outputAtBlock`, and `optimism_rollupConfig`, which is where the unsafe, safe, and finalized heads and the output roots used by the [[bridge|bridge]] come from. Arbitrum Nitro adds an `arb_` namespace plus `arbtrace_` for Parity-style traces, and answers gas and confirmation questions through the `NodeInterface` pseudo-contract at `0x00000000000000000000000000000000000000C8` via `eth_call`. zkSync Era adds `zks_`, including `zks_L1BatchNumber` and `zks_getL1BatchDetails`. None of these is in the [[execution-apis|execution APIs spec]], so probe before depending on them.",
        ],
      },
    ],
    example: {
      title: "An OP Stack receipt (abridged)",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getTransactionReceipt\",\"params\":[\"0x9f2b1c…c41d\"]}\n\n// result\n{\n  \"transactionHash\": \"0x9f2b1c…c41d\",\n  \"blockNumber\": \"0x7a1f3c2\",\n  \"transactionIndex\": \"0x3\",\n  \"status\": \"0x1\",\n  \"type\": \"0x2\",\n  \"gasUsed\": \"0xb0e2\",\n  \"effectiveGasPrice\": \"0xf4629\",\n  \"l1Fee\": \"0x36a4b2f1c8\",\n  \"l1GasUsed\": \"0x640\",\n  \"l1BaseFee\": \"0x12a05f200\",\n  \"l1BaseFeeScalar\": \"0x146b\",\n  \"l1BlobBaseFee\": \"0x1\",\n  \"l1BlobBaseFeeScalar\": \"0xf79c5\",\n  \"logs\": [ { \"address\": \"0x4200…0006\", \"topics\": [\"0xddf252ad…3ef\"], \"data\": \"0x…\" } ]\n}",
      note: "The user paid `gasUsed` times `effectiveGasPrice` plus `l1Fee`; only the first term is what `eth_estimateGas` reported.",
    },
    pitfalls: [
      "Quoting a user the L2 gas estimate on an OP Stack chain and omitting `l1Fee`, which is often the larger half of the bill.",
      "Alerting when `finalized` stops advancing on an L2; it moves in steps tied to L1 finality and batch posting, not once per block.",
      "Copying an L1 block-range or polling interval to an L2; 2-second and sub-second blocks mean far more blocks per hour and much tighter provider limits.",
      "Assuming `block.number` inside the EVM matches [[eth-block-number|eth_blockNumber]]; on Arbitrum the opcode returns an approximate L1 block number while the RPC method returns the L2 one.",
    ],
    related: ["rollup", "sequencer", "block-tag", "bridge", "transaction-types", "optimistic-rollup", "zk-rollup", "eth-estimate-gas", "head-lag", "namespaces", "predeploys"],
    sources: [
      { title: "Optimism docs: differences between Ethereum and OP Stack", url: "https://docs.optimism.io/" },
      { title: "Arbitrum docs: differences from Ethereum", url: "https://docs.arbitrum.io/" },
      { title: "zkSync Era documentation", url: "https://docs.zksync.io/" },
    ],
  },
  {
    id: "bridge",
    title: "Bridges",
    category: "scaling",
    aliases: ["deposit", "withdrawal", "canonical bridge", "l1 to l2 messaging", "portal", "message passing"],
    summary: "A canonical bridge is the pair of L1 and L2 [[smart-contract|contracts]] that moves value and messages between a [[rollup|rollup]] and Ethereum: deposits are forced into L2 blocks by the derivation pipeline, and withdrawals are proved on L1 against a posted state commitment.",
    sections: [
      {
        heading: "Deposits are cheap and censorship-resistant",
        paragraphs: [
          "A deposit starts as an ordinary L1 transaction to a bridge contract — on OP Stack, `OptimismPortal` directly or `L1StandardBridge` for tokens. It emits an [[event-log|event]]. Every L2 node's [[derivation-pipeline|derivation pipeline]] reads L1 blocks, finds those events, and inserts a corresponding transaction into an L2 block; on OP Stack it appears as a type `0x7e` deposit transaction whose `from` is the L1 sender, or, when the sender is a contract, its alias: the address plus `0x1111000000000000000000000000000000001111`. The [[sequencer|sequencer]] has no say in whether it is included, which is why this path doubles as the forced-inclusion escape hatch.",
          "Because the pipeline is deterministic, a deposit normally shows up on L2 within a few minutes, after enough L1 [[confirmations|confirmations]] for the chain's derivation rules. Its L2 execution gas was paid on L1 when the deposit was made, so it does not need funds on L2 to run.",
        ],
      },
      {
        heading: "Withdrawals wait for settlement",
        paragraphs: [
          "The other direction is slower because L1 has no way to observe L2 except through what has been settled there. On OP Stack a withdrawal is a message recorded by the `L2ToL1MessagePasser` [[predeploys|predeploy]] at `0x4200000000000000000000000000000000000016`. Once a proposer has posted an output root covering that L2 block, the user proves the message on L1 with a [[storage-proof|storage proof]] taken from [[eth-get-proof|eth_getProof]] against the L2 at that block, waits out the [[fraud-proof|fault proof]] challenge window of about seven days, then sends a second transaction to finalize and receive the funds.",
          "On a [[zk-rollup|ZK rollup]] the same proof of inclusion is checked, but the wait is until the batch's [[validity-proof|validity proof]] has been verified on L1 rather than a fixed window, so the delay is hours. Either way, the withdrawal is two or three L1 transactions, and the L1 [[gas|gas]] to prove and finalize can exceed the amount being withdrawn for small sums.",
        ],
      },
      {
        heading: "Third-party bridges and what to watch",
        paragraphs: [
          "Most users never touch the canonical path. Liquidity bridges front the funds on the destination chain immediately and take the slow route themselves, charging a fee for the capital and the risk. [[cross-chain-relayer|Messaging bridges]] with their own validator or oracle sets move arbitrary data between chains that have no shared settlement layer at all. Both replace the rollup's security model with the bridge's own, and bridge contracts have been the single largest category of loss in the ecosystem.",
          "From an RPC perspective, tracking bridge activity means watching two chains at once: [[eth-get-logs|eth_getLogs]] on the L1 contracts for deposits and proofs, `eth_getLogs` on the L2 for the message-passed events, and `optimism_outputAtBlock` on `op-node` to learn which output root a given L2 block falls under. An [[indexer|indexer]] that joins the two sides has to handle each chain's [[reorg|reorgs]] independently.",
        ],
      },
    ],
    pitfalls: [
      "Assuming a withdrawal is one transaction; on OP Stack it is initiate on L2, prove on L1, then finalize on L1 after the window.",
      "Proving a withdrawal against a block the proposer has not covered yet; the proof only works once an output root including that block exists on L1.",
      "Sending tokens to a bridge address directly instead of calling the deposit function; a bare transfer is not a bridge message and is usually unrecoverable.",
    ],
    related: ["rollup", "fraud-proof", "eth-get-proof", "optimistic-rollup", "validity-proof", "l2-rpc", "sequencer", "receipt-proof", "event-log", "cross-chain-relayer"],
    sources: [
      { title: "Optimism docs: bridging and messaging", url: "https://docs.optimism.io/" },
      { title: "Arbitrum docs: bridging", url: "https://docs.arbitrum.io/" },
      { title: "EIP-1186: eth_getProof", url: "https://eips.ethereum.org/EIPS/eip-1186" },
    ],
  },
  {
    id: "data-availability",
    title: "Data availability",
    category: "scaling",
    aliases: ["DA", "calldata", "celestia", "eigenda", "peerdas", "das"],
    summary: "Data availability is the guarantee that the data behind a [[rollup|rollup]] batch was actually published, so anyone can reconstruct the L2 state and exit without the operator's help, independent of whether the transition was proved correct.",
    sections: [
      {
        heading: "Why availability is its own problem",
        paragraphs: [
          "A [[validity-proof|validity proof]] shows a state transition was executed correctly; a [[fraud-proof|fraud proof]] lets someone disprove a wrong one. Neither helps if the data is missing. If an operator publishes a valid [[state-root|state root]] but withholds the transactions behind it, nobody else can compute the current state, nobody can build the [[storage-proof|storage proof]] a [[bridge|withdrawal]] needs, and nobody can challenge anything because they cannot construct the correct claim. The chain is correct and unusable at the same time.",
          "That is why a rollup is defined by where its data goes. Publishing to Ethereum means the data inherits Ethereum's own availability: every [[full-node|full node]] on the network checks it, downloading calldata in full and, since PeerDAS, sampling blob columns, and an [[archive-node|archive]] or [[portal-network|Portal Network]] keeps the calldata afterwards.",
        ],
      },
      {
        heading: "The three places data goes",
        paragraphs: [
          "Calldata was the original option: permanent, verifiable by contracts, and expensive, since it competes with all other execution [[gas|gas]] and EIP-7623 raised its cost further in Pectra. [[blob|Blobs]] are the current default: a separate market, roughly two orders of magnitude cheaper per byte at typical prices, not readable by the [[evm|EVM]], and discarded by nodes after about 18 days — long enough for anyone to derive the chain, not long enough to serve as archival storage.",
          "External DA layers such as Celestia, EigenDA, and Avail, or a fixed data availability committee, are the third option. Chains using them are usually called [[validium|validiums]] or alt-DA chains. They are much cheaper still, and they change the trust model: availability now depends on that network or committee rather than on Ethereum, and a rollup that loses its data cannot be repaired by L1.",
        ],
      },
      {
        heading: "Sampling instead of downloading",
        paragraphs: [
          "Requiring every node to download every blob is what caps blob throughput. [[peerdas|PeerDAS]], introduced by EIP-7594 in the Fusaka upgrade of December 2025, changes that: blob data is erasure-coded into columns, each node stores and gossips only some of them, and each slot it samples a fixed set of at least 8 columns, derived from its node id, to become confident the rest exists. Because no node needs the whole thing, blob counts can rise without raising per-node bandwidth, which is what the blob-parameter-only forks after Fusaka do.",
        ],
      },
      {
        heading: "Reading the data over RPC",
        paragraphs: [
          "The [[execution-layer|execution layer]] never hands you blob contents. [[eth-get-transaction-by-hash|eth_getTransactionByHash]] on a batch-posting transaction returns `blobVersionedHashes`, which are commitments, not data. The bodies live on the [[consensus-layer|consensus layer]] and are fetched from the [[beacon-api|Beacon API]] at `/eth/v1/beacon/blobs/{block_id}`, the Fulu replacement for the deprecated `/eth/v1/beacon/blob_sidecars/{block_id}`, while within the retention window; since PeerDAS only supernodes, which custody every column, are required to return whole blobs. After the window only [[blob-archive|an archive service]] or the rollup's own node has them. Deriving an L2 chain from scratch therefore needs an execution endpoint and a consensus endpoint, which is why [[rollup|rollup]] node setups ask for both.",
        ],
      },
    ],
    pitfalls: [
      "Assuming a validity proof implies the data is available; the two properties are independent and a proved chain can still strand its users.",
      "Planning to read old batch data from blobs; sidecars are dropped after about 18 days, so long-range derivation needs an archive of them.",
      "Calling a validium a rollup; its availability rests on an external committee or network, not on Ethereum.",
      "Expecting blob contents from an execution endpoint; `eth_` methods return only the versioned hashes, and the bodies come from the Beacon API.",
    ],
    related: ["blob", "rollup", "validity-proof", "fraud-proof", "beacon-api", "bridge", "zk-rollup", "optimistic-rollup", "beacon-endpoints", "validium"],
    sources: [
      { title: "ethereum.org: Data availability", url: "https://ethereum.org/developers/docs/data-availability/" },
      { title: "EIP-7594: PeerDAS", url: "https://eips.ethereum.org/EIPS/eip-7594" },
      { title: "EIP-4844: Shard Blob Transactions", url: "https://eips.ethereum.org/EIPS/eip-4844" },
    ],
  },
  {
    id: "blob",
    title: "Blobs (EIP-4844)",
    category: "scaling",
    aliases: ["4844", "proto-danksharding", "blob transaction", "type 0x3", "kzg", "versioned hash", "blobGasUsed"],
    summary: "A blob is a 128 KiB chunk of data attached to a type `0x3` transaction, committed to on-chain by a KZG versioned hash, priced in its own gas market, and dropped by nodes after roughly 18 days.",
    sections: [
      {
        heading: "What a blob is",
        paragraphs: [
          "Each blob is 4096 field elements of 32 bytes, exactly 131072 bytes or 128 KiB. It is carried alongside a transaction rather than inside it: the transaction body holds only `blobVersionedHashes`, where each versioned hash is `0x01` followed by the last 31 bytes of `sha256` over the blob's KZG commitment. The [[evm|EVM]] cannot read blob contents. It can read a versioned hash with the `BLOBHASH` opcode (`0x49`) and prove a single point of a blob with the point-evaluation precompile at `0x0a`, which is exactly what a [[rollup|rollup]] needs and nothing more.",
          "A type `0x3` transaction adds `maxFeePerBlobGas` and `blobVersionedHashes` to the [[eip-1559|EIP-1559]] fields, and it must have a `to` [[address|address]] — a blob transaction cannot deploy a [[smart-contract|contract]]. When you submit one with [[eth-send-raw-transaction|eth_sendRawTransaction]], the encoding is the network form that wraps the transaction together with the blobs, their commitments, and their proofs; the node validates the commitments before accepting it into the [[mempool|pool]].",
        ],
      },
      {
        heading: "A separate fee market",
        paragraphs: [
          "Blob gas is metered apart from execution [[gas|gas]] and burned entirely. Each blob costs 131072 blob gas, and the [[block-header|header]] carries `blobGasUsed` for the block plus `excessBlobGas`, a running counter of how far past target recent blocks have been. The blob base fee is an exponential function of `excessBlobGas`, so a run of full blocks raises it sharply and an idle period brings it back down. Before Fusaka it could sink to 1 wei; since Fusaka, EIP-7918 stops it falling below a reserve price tied to the execution base fee. [[eth-gas-price|eth_blobBaseFee]] returns the current value and [[eth-fee-history|eth_feeHistory]] returns `baseFeePerBlobGas` and `blobGasUsedRatio` arrays for building an estimate.",
          "The target and maximum per block have risen with each upgrade: 3 and 6 at Dencun in March 2024, 6 and 9 at Pectra in May 2025 under EIP-7691, and higher again through the blob-parameter-only forks that follow Fusaka. Because the two markets are priced separately, blob space can be cheap while execution gas is expensive, or the reverse, though since EIP-7918 the blob price no longer drops arbitrarily far below the cost of execution. [[transaction-receipt|Receipts]] for a blob transaction report `blobGasUsed` and `blobGasPrice` so the sender can see what it actually paid.",
        ],
      },
      {
        heading: "Where the data lives",
        paragraphs: [
          "Blobs never enter the execution block. They propagate on the [[consensus-layer|consensus layer]] as sidecars gossiped alongside the [[beacon-block|beacon block]], and are retained for 4096 epochs, about 18 days, after which nodes delete them. The commitment stays in the chain forever; the data does not. Retrieval is through the [[beacon-api|Beacon API]] at `/eth/v1/beacon/blobs/{block_id}`, which replaced the deprecated `/eth/v1/beacon/blob_sidecars/{block_id}` at Fulu, never through an `eth_` method, which only ever returns the versioned hashes.",
          "The retention is deliberate: [[data-availability|availability]] only has to last long enough for everyone to download the data and derive the L2 chain, and anyone who wants it permanently [[blob-archive|archives it themselves]]. After Fusaka, [[peerdas|PeerDAS]] lets a node sample columns rather than hold every blob, which is what allows the limits to keep rising, and why the Beacon API requires only supernodes, which custody every column, to return whole blobs.",
        ],
      },
    ],
    example: {
      title: "A rollup batch posted as a type 0x3 transaction (abridged)",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getTransactionByHash\",\"params\":[\"0x3c8e42…91a4\"]}\n\n// result\n{\n  \"hash\": \"0x3c8e42…91a4\",\n  \"type\": \"0x3\",\n  \"chainId\": \"0x1\",\n  \"from\": \"0x5050f6…76c9\",\n  \"to\": \"0xff00000000000000000000000000000000008453\",\n  \"value\": \"0x0\",\n  \"input\": \"0x\",\n  \"nonce\": \"0x2f10c\",\n  \"gas\": \"0x5208\",\n  \"maxFeePerGas\": \"0x1dcd6500\",\n  \"maxPriorityFeePerGas\": \"0x3b9aca00\",\n  \"maxFeePerBlobGas\": \"0x2540be400\",\n  \"blobVersionedHashes\": [\"0x01597a…c7d2\", \"0x01a3f0…4f08\"],\n  \"blockNumber\": \"0x14a1b2c\"\n}",
      note: "This is Base's batch inbox, which spells out its [[chain-id|chain id]] 8453 (the OP Stack's documented default is `0x00` followed by the first 19 bytes of `keccak256` over the 32-byte chain id); the payload is empty, and the 128 KiB of data behind each versioned hash has to be fetched from a [[consensus-client|consensus client]].",
    },
    pitfalls: [
      "Looking for blob contents in the transaction object; `blobVersionedHashes` are commitments, and the bodies come from the Beacon API within about 18 days.",
      "Sending a type `0x3` transaction with a plain signed encoding; `eth_sendRawTransaction` expects the network form carrying the blobs, commitments, and proofs.",
      "Estimating blob cost from the execution base fee; since EIP-7918 that sets only the reserve price the blob base fee is pushed back up to, and under blob demand the blob base fee climbs far above it.",
    ],
    related: ["data-availability", "rollup", "transaction-types", "eth-fee-history", "beacon-api", "eip-1559", "block-header", "eth-gas-price", "beacon-endpoints", "blob-archive"],
    sources: [
      { title: "EIP-4844: Shard Blob Transactions", url: "https://eips.ethereum.org/EIPS/eip-4844" },
      { title: "EIP-4844 overview", url: "https://www.eip4844.com/" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
    ],
  },
  {
    id: "predeploys",
    title: "Predeploys",
    category: "scaling",
    aliases: ["predeploy", "0x4200 namespace", "GasPriceOracle", "L1Block", "L2ToL1MessagePasser", "ArbSys", "NodeInterface", "system contract"],
    summary: "A predeploy is a contract that exists at a protocol-fixed [[address|address]] from an L2's [[genesis|genesis]] or a network upgrade rather than from a user's deployment, so fee oracles, L1 context, withdrawal records and bridges live where every node, wallet and library already knows to look.",
    sections: [
      {
        heading: "Contracts that exist from block 0",
        paragraphs: [
          "On an [[optimistic-rollup|OP Stack]] chain the predeploys occupy a namespace starting at `0x4200000000000000000000000000000000000000`. The ones callers meet are `WETH9` at `…0006`, `L2CrossDomainMessenger` at `…0007`, `L2StandardBridge` at `…0010`, `SequencerFeeVault` at `…0011`, `GasPriceOracle` at `…000F`, `L1Block` at `…0015`, `L2ToL1MessagePasser` at `…0016`, and `BaseFeeVault` and `L1FeeVault` at `…0019` and `…001a`. Together they are the chain's [[bridge|bridge]], its fee model and its view of L1.",
          "Most of them are [[proxy-contract|proxies]]. Genesis places proxy bytecode at the first 2048 addresses of the namespace, owned by the `ProxyAdmin` predeploy at `…0018`; only `WETH9` and the governance token at `…0042` have no proxy. Network upgrades rely on that: the activation block of Ecotone, Fjord or Isthmus contains deposit-type upgrade transactions that deploy new implementations and repoint the proxies. So [[eth-get-code|eth_getCode]] on a predeploy returns the small proxy, the logic sits at the address held in the EIP-1967 implementation slot, readable with [[eth-get-storage-at|eth_getStorageAt]], and a function an upgrade added does not exist at earlier blocks. Genesis also carries preinstalls, third-party contracts such as Multicall3 at `0xcA11bde05977b3631167028862bE2a173976CA11` placed at their usual L1 addresses, which are ordinary bytecode rather than protocol machinery.",
        ],
      },
      {
        heading: "What an RPC caller does with them",
        paragraphs: [
          "`L1Block` holds L1 context. The first transaction of every L2 block is a type `0x7e` deposit from `0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001` to `L1Block` recording the L1 origin's number, timestamp, base fee, blob base fee and hash, so contracts can read L1 facts, and transaction index 0 of every block is this system call rather than a user's. `GasPriceOracle` prices the L1 data fee from those values: [[eth-call|eth_call]] to `getL1Fee(bytes)` with a serialized transaction returns what it would be charged on top of execution gas, and `getL1FeeUpperBound(uint256)`, added by Fjord, bounds the fee from a byte length alone. That is the part [[eth-estimate-gas|eth_estimateGas]] leaves out; see [[l2-rpc|L2 RPC differences]].",
          "`L2ToL1MessagePasser` records withdrawals: `initiateWithdrawal` stores each withdrawal's hash in its `sentMessages` mapping. The output root a proposer posts to L1 hashes together a version, the L2 [[state-root|state root]], this contract's storage root and the block hash, so proving a withdrawal on L1 means supplying a [[storage-proof|storage proof]] of that mapping slot, taken with [[eth-get-proof|eth_getProof]] at the proven block, against the storage root inside the output root. The fee vaults collect the priority, base and L1 fees of every block and pay out to an L1 address, which is why their balances grow without incoming transfers.",
        ],
      },
      {
        heading: "Arbitrum's precompiles and NodeInterface",
        paragraphs: [
          "Arbitrum Nitro puts the same machinery in [[precompiles|precompiles]], addresses whose behaviour ArbOS implements natively rather than as [[evm|EVM]] bytecode. `ArbSys` at `0x0000000000000000000000000000000000000064` provides `arbBlockNumber()`, which contracts need because `block.number` on Arbitrum returns an approximate L1 block number, close to but not always equal to the parent chain's, plus `withdrawEth` and `sendTxToL1` for messages to L1. `ArbGasInfo` at `0x…6c` answers `getPricesInWei()` and `getL1BaseFeeEstimate()`, and `ArbRetryableTx` at `0x…6e` manages retryable tickets. Contracts and `eth_call` can both reach them.",
          "`NodeInterface` at `0x00000000000000000000000000000000000000C8` is not on chain at all. The node intercepts `eth_call` and `eth_estimateGas` messages addressed to it, so a [[smart-contract|contract]] calling `0xc8` gets nothing, while an RPC caller gets `gasEstimateComponents` and `gasEstimateL1Component` for fee breakdowns, `findBatchContainingBlock` and `getL1Confirmations` for settlement status, and `l2BlockRangeForL1` for mapping block numbers. It is Arbitrum's counterpart to the `optimism_` namespace, delivered as a pseudo-contract.",
        ],
      },
      {
        heading: "The L1 analogue: system contracts",
        paragraphs: [
          "Ethereum mainnet has no genesis predeploys, but since Cancun it has [[system-contracts|contracts at protocol-fixed addresses that the protocol calls itself]]. EIP-4788's beacon roots contract at `0x000F3df6D732807Ef1319fB7B8bB8522d0Beac02` and EIP-2935's block-hash history at `0x0000F90827F1C53a10cb7A02335B175320002935` are written by a system call from `0xfffffffffffffffffffffffffffffffffffffffe` before a block's transactions run, and EIP-7002 and EIP-7251 even name their request contracts, at `0x00000961Ef480Eb55e80D19ad83579A64c007002` and `0x0000BBdDc7CE488642fb579F8B00f3a590007251`, predeploy addresses. Each was installed by a one-off keyless deployment transaction before its [[hardfork|fork]]. OP Stack reuses these addresses: its predeploy list includes the beacon roots contract since Ecotone, and Isthmus deployed the EIP-2935 contract by upgrade transaction.",
        ],
      },
    ],
    example: {
      title: "Pricing the L1 fee and finding the implementation behind the oracle",
      language: "json",
      code: "// L1 data-fee bound for a 200-byte transaction (getL1FeeUpperBound, selector 0xf1c7a58b)\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[{\n  \"to\": \"0x420000000000000000000000000000000000000F\",\n  \"data\": \"0xf1c7a58b00000000000000000000000000000000000000000000000000000000000000c8\"\n}, \"latest\"]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x00000000000000000000000000000000000000000000000000000019f8b5a4c3\"}\n\n// the proxy's implementation address, from the EIP-1967 slot\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_getStorageAt\",\"params\":[\n  \"0x420000000000000000000000000000000000000F\",\n  \"0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc\",\n  \"latest\"\n]}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"result\":\"0x000000000000000000000000b528…3e2f\"}",
      note: "The first result, in wei, is what a wallet adds to execution gas times gas price; the second names the implementation that answered it, which changes at network upgrades.",
    },
    pitfalls: [
      "Calling a function an upgrade added, such as `getL1FeeUpperBound`, at a block before that upgrade, where the proxy still points at an implementation without it and the call reverts.",
      "Auditing the bytecode `eth_getCode` returns for a predeploy; that is the proxy, and the logic lives at the address in its implementation slot.",
      "Counting the `L1Block` deposit at index 0 of every OP Stack block as user activity, or decoding it with a parser that rejects type `0x7e`.",
      "Having a contract call Arbitrum's `NodeInterface`; it answers only RPC calls, so on-chain code receives an empty result.",
      "Assuming the `0x4200…` addresses mean anything on Arbitrum, zkSync or Scroll; each rollup family has its own layout.",
    ],
    related: ["l2-rpc", "bridge", "optimistic-rollup", "precompiles", "proxy-contract", "eth-call", "storage-proof", "eth-get-proof", "genesis", "derivation-pipeline", "system-contracts"],
    sources: [
      { title: "OP Stack specification: predeploys", url: "https://specs.optimism.io/protocol/predeploys.html" },
      { title: "Arbitrum docs: precompiles reference", url: "https://docs.arbitrum.io/arbitrum-essentials/precompiles/reference" },
      { title: "Arbitrum docs: NodeInterface overview", url: "https://docs.arbitrum.io/arbitrum-essentials/nodeinterface/overview" },
      { title: "EIP-4788: Beacon block root in the EVM", url: "https://eips.ethereum.org/EIPS/eip-4788" },
    ],
  },
  {
    id: "derivation-pipeline",
    title: "Derivation pipeline",
    category: "scaling",
    aliases: ["op-node derivation", "batch inbox", "channel", "frame", "span batch", "safe head", "unsafe head", "optimism_syncStatus"],
    summary: "The derivation pipeline is the deterministic procedure by which an OP Stack rollup node such as `op-node` rebuilds every L2 block from L1 data — batcher transactions and deposit events — and hands each block to its [[execution-client|execution client]] over the [[engine-api|Engine API]], which is what lets anyone check the chain without trusting the [[sequencer|sequencer]].",
    sections: [
      {
        heading: "Two inputs on L1",
        paragraphs: [
          "`op-node` walks L1 blocks in order and collects two kinds of input. The first is batcher transactions: transactions sent to the chain's batch inbox address and signed by the batcher address that the L1 `SystemConfig` contract names, carrying data in calldata or, since Ecotone, in [[blob|blobs]]. That data is a sequence of frames. Frames reassemble into channels, compressed streams that can span several L1 transactions and must complete within a channel timeout, 50 L1 blocks since Granite. A channel decompresses into batches, each describing L2 blocks by timestamp, L1 origin and transaction list; span batches, added in Delta, cover many blocks in one.",
          "The second is deposits: `TransactionDeposited` [[event-log|events]] emitted by the `OptimismPortal` contract, which become type `0x7e` transactions at the start of the first L2 block that takes that L1 block as its origin; see [[bridge|bridges]]. Every L2 block also opens with an L1-attributes deposit that writes the origin's number, hash and fees into the [[predeploys|L1Block predeploy]]. For each block the pipeline produces payload attributes — timestamp, `prevRandao`, fee recipient, the exact transaction list, and `noTxPool: true` — and `op-node` passes them to its execution client with `engine_forkchoiceUpdated`, exactly as an L1 [[consensus-client|consensus client]] would, then imports the built block with `engine_newPayload`.",
        ],
      },
      {
        heading: "Unsafe, safe and finalized",
        paragraphs: [
          "The sequencer builds blocks long before their batch reaches L1 and gossips them, and other nodes insert them as the unsafe head, which is what `latest` returns. When derivation reproduces a block from batch data on L1 it becomes safe; when the L1 block carrying that data is finalized, it becomes finalized. `op-node` reports all three in each forkchoice update, which is why the `safe` and `finalized` [[block-tag|block tags]] on an L2 mean derived from L1 rather than anything local. If a derived block differs from the gossiped one, derivation wins and the unsafe blocks are replaced: an L2 [[reorg|reorg]] with no L1 reorg behind it.",
          "Two rules bound the sequencer and the safe head. Batches for an epoch must land within the sequencing window, 3,600 L1 blocks or 12 hours in the standard configuration; if none arrive, derivation generates deposit-only blocks by itself, which is what makes forced inclusion through L1 work. And safe means safe relative to the L1 chain as it stands now: an L1 reorg resets the pipeline and can move the L2 safe head backwards, while finalized cannot move. `--verifier.l1-confs` keeps a node a set number of L1 blocks behind the head to avoid that churn, at the price of a later safe head.",
        ],
      },
      {
        heading: "What a node needs to derive",
        paragraphs: [
          "`op-node` takes `--l1`, an L1 execution endpoint from which it reads blocks and receipts with the method `--l1.rpckind` selects (`eth_getBlockReceipts` for `standard`), checking them against block headers unless `--l1.trustrpc` is set; `--l1.beacon`, a [[beacon-api|Beacon API]] endpoint for blob contents; and `--l2` with `--l2.jwt-secret` for the execution client's Engine API. Beacon nodes keep blobs for about 18 days, so re-deriving older blocks needs `--l1.beacon-fallbacks` pointing at a [[blob-archive|blob archive]]. `--syncmode=consensus-layer`, the default, derives every block from L1; `execution-layer` lets the execution client [[snap-sync|snap sync]] from peers and derives from there on.",
          "`op-node` serves its own `optimism_` [[namespaces|namespace]], on port 9545 by default. `optimism_syncStatus` returns its L1 view (`current_l1`, `head_l1`, `safe_l1`, `finalized_l1`) beside the three L2 heads, `optimism_outputAtBlock` returns the output root for an L2 block, and with `--safedb.path` set, `optimism_safeHeadAtL1Block` returns the safe head reached at a given L1 block, which [[op-challenger|op-challenger]] depends on. That is the point of the design: anyone with an L1 node, a beacon endpoint and this software can recompute the chain, so the sequencer's word matters only for blocks L1 has not seen yet; see [[optimistic-rollup|optimistic rollups]].",
        ],
      },
    ],
    example: {
      title: "optimism_syncStatus on op-node (abridged)",
      language: "json",
      code: "// request, to op-node's RPC port, not the execution client\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"optimism_syncStatus\",\"params\":[]}\n\n// result\n{\n  \"current_l1\":   {\"hash\":\"0x8b2e…41c7\",\"number\":25610447,\"timestamp\":1790590811},\n  \"head_l1\":      {\"hash\":\"0x0f7a…d2e9\",\"number\":25610448,\"timestamp\":1790590823},\n  \"safe_l1\":      {\"hash\":\"0x61c3…9b04\",\"number\":25610400,\"timestamp\":1790590247},\n  \"finalized_l1\": {\"hash\":\"0xa94d…17f2\",\"number\":25610368,\"timestamp\":1790589863},\n  \"unsafe_l2\":    {\"hash\":\"0x3dd1…7a60\",\"number\":156402310,\"l1origin\":{\"number\":25610444},\"sequenceNumber\":2},\n  \"safe_l2\":      {\"hash\":\"0x9c40…e1b8\",\"number\":156402178,\"l1origin\":{\"number\":25610422},\"sequenceNumber\":4},\n  \"finalized_l2\": {\"hash\":\"0x51ab…0c3d\",\"number\":156401734,\"l1origin\":{\"number\":25610326},\"sequenceNumber\":0}\n}",
      note: "Numbers here are plain decimal JSON, not hex; `unsafe_l2` is what `latest` returns on the execution client, and `finalized_l2` trails it by L1 finality plus the batch interval.",
    },
    pitfalls: [
      "Reading the heights in `optimism_syncStatus` as hex strings; the block references carry decimal JSON numbers.",
      "Resyncing an old chain from L1 with only an ordinary beacon endpoint, which stalls at the first batch whose blobs have expired.",
      "Setting `--l1.trustrpc` against a third-party L1 provider, which drops the check of fetched receipts against the block header.",
      "Treating a replica's `latest` as derived; until its batch is on L1 it is the sequencer's gossip and can be replaced.",
    ],
    related: ["optimistic-rollup", "sequencer", "bridge", "blob", "engine-api", "block-tag", "blob-archive", "op-challenger", "l2-rpc", "predeploys"],
    sources: [
      { title: "OP Stack specification: L2 chain derivation", url: "https://specs.optimism.io/protocol/derivation.html" },
      { title: "OP Stack specification: deposits", url: "https://specs.optimism.io/protocol/deposits.html" },
      { title: "Optimism docs: op-node configuration reference", url: "https://docs.optimism.io/node-operators/reference/op-node-config" },
      { title: "Optimism docs: op-node JSON-RPC", url: "https://docs.optimism.io/node-operators/reference/op-node-json-rpc" },
    ],
  },
  {
    id: "validium",
    title: "Validium",
    category: "scaling",
    aliases: ["validium", "optimium", "volition", "data availability committee", "DAC", "AnyTrust", "Alt-DA", "off-chain data availability"],
    summary: "A validium is an L2 that settles on Ethereum with [[validity-proof|validity proofs]] but keeps its transaction data off Ethereum, with a committee or an external DA network, so users can rebuild the state and exit only while that party keeps the data available.",
    sections: [
      {
        heading: "Proofs on Ethereum, data somewhere else",
        paragraphs: [
          "A [[zk-rollup|ZK rollup]] publishes two things to Ethereum: a validity proof for each batch and the data behind it. A validium publishes only the first, with a state commitment and, where a committee is used, the committee's signed attestation that it holds the data. The verifier contract still rejects any transition that does not follow from the previous state, so the operator cannot move funds it does not own. What it can do is withhold the data. Without it nobody else can compute current balances or build the Merkle proof the L1 contract demands before releasing an exit, so funds are frozen rather than stolen; see [[data-availability|data availability]].",
          "The data sits with a data availability committee, a known set of members who each sign that they store it; with an external DA network such as Celestia, EigenDA or Avail, which brings its own security assumptions; or with bonded providers who can be slashed for withholding. StarkEx accepts a validium state update only if a quorum of its committee has signed it. A volition lets users choose, per asset or per transaction, between on-chain data and off-chain data on the same system, which is what StarkEx's volition mode offers. L2BEAT, which classifies [[rollup|L2s]] by these properties, reserves the word rollup for chains whose data is on Ethereum.",
        ],
      },
      {
        heading: "Optimiums: fraud proofs without the data",
        paragraphs: [
          "The optimistic version is weaker still, because a [[fraud-proof|fraud proof]] cannot even be constructed without the data: if it is withheld, a wrong state root passes its challenge window unopposed. L2BEAT calls these chains optimiums. Arbitrum AnyTrust, which Arbitrum Nova runs, is the best-known design. An N-member committee, trusted on the assumption that at least two members are honest, signs a Data Availability Certificate — the data's hash, an expiry time and BLS signatures from N−1 members — which the sequencer posts to L1 in place of the batch. If it cannot collect enough signatures within a few minutes, it falls back to posting the full data to L1.",
          "OP Stack's Alt-DA mode makes the same trade. The batcher posts only an input commitment to L1, either `keccak256` of the data or a DA-service commitment defined by the external layer, and stores the data behind a DA server with `/put` and `/get/<commitment>` routes; `op-node` runs with `--altda.enabled` and `--altda.da-server` and resolves every commitment through that server during [[derivation-pipeline|derivation]]. A `DataAvailabilityChallenge` contract lets anyone challenge a keccak commitment, forcing the data onto L1 within a resolve window or making derivation drop that input, and finality waits for the challenge window. DA-service commitments cannot be resolved through that contract.",
        ],
      },
      {
        heading: "What changes for nodes and callers",
        paragraphs: [
          "The [[json-rpc|JSON-RPC]] surface is indistinguishable from a rollup's: the same `eth_` methods, the same receipts, often the same client software. What differs is what it takes to rebuild the chain. A rollup node resyncs from an L1 node, a beacon endpoint and, for old blocks, a [[blob-archive|blob archive]]. A validium or optimium node also needs the committee's servers, the DA network or the Alt-DA server, and if those stop answering, derivation stops while L1 is perfectly healthy. [[indexer|Indexers]] and [[block-explorer|explorers]] that planned to backfill from L1 alone find commitments and certificates where transactions should be.",
          "For anyone judging risk — a [[bridge|bridge]], a custodian, a dashboard — the chain's endpoints will not say which kind it is: [[chain-id|eth_chainId]] and the method set look the same either way. The answer is in its L1 contracts and batch format, or in a classifier such as L2BEAT. And while the operator's nodes answer, a withdrawal proof built with [[eth-get-proof|eth_getProof]] works exactly as on a rollup; the committee assumption only matters on the day those nodes stop.",
        ],
      },
    ],
    pitfalls: [
      "Calling a chain a rollup because it posts validity proofs to Ethereum; the proof covers correctness, and the data can still be withheld.",
      "Planning to resync a validium or Alt-DA chain from an L1 archive alone; derivation also needs the off-chain data source.",
      "Treating a posted Data Availability Certificate as the data; it is a signed promise that committee members hold it.",
      "Assuming Alt-DA's challenge contract protects every commitment type; it resolves only keccak commitments.",
    ],
    related: ["data-availability", "zk-rollup", "validity-proof", "rollup", "fraud-proof", "optimistic-rollup", "bridge", "blob-archive", "derivation-pipeline"],
    sources: [
      { title: "ethereum.org: Validium", url: "https://ethereum.org/developers/docs/scaling/validium/" },
      { title: "L2BEAT glossary", url: "https://l2beat.com/glossary" },
      { title: "Arbitrum docs: AnyTrust protocol", url: "https://docs.arbitrum.io/how-arbitrum-works/deep-dives/anytrust-protocol" },
      { title: "OP Stack specification: Alt-DA mode", url: "https://specs.optimism.io/experimental/alt-da.html" },
    ],
  },
  {
    id: "op-challenger",
    title: "op-challenger",
    category: "scaling",
    aliases: ["op-challenger", "fault dispute game", "DisputeGameFactory", "cannon-kona", "kona-host", "op-dispute-mon", "safedb", "dispute bond"],
    summary: "op-challenger is the OP Stack agent that watches the L1 dispute game factory, compares each proposed output root with what its own rollup node derives, and plays the [[fraud-proof|fault dispute game]] against wrong claims, which takes four RPC endpoints, a fault-proof VM and an L2 node that can serve historical state.",
    sections: [
      {
        heading: "Proposals are games",
        paragraphs: [
          "On an OP Stack chain with fault proofs, every state claim is a game. A proposer creates one through the `DisputeGameFactory` contract on L1, posting a bond and a root claim: the output root it asserts for some L2 block number. op-challenger is the service that makes the honest-challenger assumption of [[optimistic-rollup|optimistic rollups]] true in practice. It watches the factory for games inside `--game-window`, computes the correct output root for each claimed block with `optimism_outputAtBlock` on its own rollup node, and acts: it attacks claims that disagree, defends claims that agree, resolves finished games and claims its bonds. Every move is an L1 transaction, so it runs with a funded key.",
          "The game bisects twice. Above the split depth, players disagree about output roots over ranges of blocks; below it, about the execution trace of the fault-proof program that derives and executes one block. At maximum depth one instruction is executed on L1 by Cannon, a MIPS emulator contract, with inputs from the `PreimageOracle`. To produce trace commitments at all, op-challenger runs that program itself: the Kona client compiled to MIPS inside the `cannon` binary, with `kona-host` serving preimages. That is the `cannon-kona` game type, chosen with `--game-types` (formerly `--trace-type`) alongside `cannon` and `permissioned`, and the challenger refuses games whose absolute prestate does not match `--cannon-kona-prestate`. Bonds grow with depth and are held in `DelayedWETH` until claimed after resolution and a withdrawal delay.",
        ],
      },
      {
        heading: "Four endpoints, each with requirements",
        paragraphs: [
          "`--l1-eth-rpc` is an L1 execution endpoint that takes many reads and all of the challenger's transactions; the program host also loads L1 headers and receipts through it with `debug_getRawHeader` and `debug_getRawReceipts`, so the [[debug-api|debug_ namespace]] must be reachable. `--l1-beacon` is a [[beacon-api|Beacon API]] endpoint for the blobs holding batch data, and games over blocks older than about 18 days need one backed by a [[blob-archive|blob archive]]. `--rollup-rpc` is `op-node`, which must serve output roots for blocks as old as the games it plays, so its execution client must still hold that state.",
          "`--l2-eth-rpc` is the demanding one: an L2 execution endpoint with `eth` and `debug` enabled. The host asks it for each block's [[witness|execution witness]] through op-reth's `debug_executePayload`, falls back to `debug_dbGet` for individual trie nodes and bytecode by hash, and uses [[eth-get-proof|eth_getProof]] at the agreed starting block, including the `L2ToL1MessagePasser` storage root it needs to rebuild the output root. The OP documentation therefore asks for an op-reth [[archive-node|archive node]] with its historical-proofs store enabled (`--proofs-history`) and sized to cover the dispute window of at least 28 days. A pruned node, or a [[rpc-provider|provider]] endpoint without `debug_`, cannot play.",
        ],
      },
      {
        heading: "The safe-head database",
        paragraphs: [
          "Each game records the L1 head at its creation, and the honest answer for block N is only what could be derived from L1 data up to that L1 block; a block whose batch landed later is not yet defensible. op-challenger enforces this by calling `optimism_safeHeadAtL1Block` on its rollup node and capping the block it argues for at the safe head returned. The method is served from op-node's safe-head database, enabled with `--safedb.path`, which records the L2 safe head reached at each L1 block as the [[derivation-pipeline|derivation pipeline]] advances. Without the flag nothing is recorded, and the database cannot answer for L1 blocks from before it was started.",
          "Because it records this node's own derivation history, it is not ordinary chain data. The documentation says never to restore it from a [[database-snapshot|snapshot]]: a database out of step with L1 leads the challenger to act on the wrong safe head and possibly attack valid outputs. Monitoring is a separate service, `op-dispute-mon`, which takes an L1 endpoint, a rollup endpoint and the factory address and reports the status of games over the last 28 days, so an operator hears about a game going the wrong way while there is still clock left to respond.",
        ],
      },
    ],
    example: {
      title: "A challenger and the rollup node it depends on",
      language: "bash",
      code: "# rollup node: keep the safe-head database the challenger queries\nop-node ... --safedb.path=/data/safedb\n\n# challenger: four endpoints, the game types to play, the VM and its prestate\nop-challenger \\\n  --l1-eth-rpc=http://l1-el:8545 \\\n  --l1-beacon=http://l1-cl:5052 \\\n  --l2-eth-rpc=http://op-reth-archive:8545 \\\n  --rollup-rpc=http://op-node:9545 \\\n  --game-factory-address=0x… \\\n  --game-types=cannon-kona,permissioned \\\n  --datadir=/data/challenger \\\n  --cannon-bin=/usr/local/bin/cannon \\\n  --cannon-kona-server=/usr/local/bin/kona-host \\\n  --cannon-kona-prestate=/prestates/kona-prestate.bin.gz \\\n  --private-key=$CHALLENGER_KEY\n\n# what the challenger asks op-node for each game's L1 head\ncurl -s -X POST -H 'content-type: application/json' http://op-node:9545 \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"optimism_safeHeadAtL1Block\",\"params\":[\"0x186c8f0\"]}'\n# {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{\"l1Block\":{\"hash\":\"0x61c3…9b04\",\"number\":25610480},\n#   \"safeHead\":{\"hash\":\"0x9c40…e1b8\",\"number\":156402178}}}",
      note: "The parameter is a hex L1 block number but the result carries decimal numbers; if `--safedb.path` was never set, the call fails and the challenger cannot bound its claims.",
    },
    pitfalls: [
      "Pointing `--l2-eth-rpc` at a pruned or hosted L2 endpoint; the program host needs debug methods and historical proofs that such endpoints rarely serve.",
      "Restoring the rollup node's safe-head database from a snapshot, which desynchronises the challenger's view of what L1 had made safe.",
      "Upgrading across a prestate change without updating `--cannon-kona-prestate`, so the challenger declines every game that uses the new prestate.",
      "Using an L1 provider that blocks `debug_getRawHeader` and `debug_getRawReceipts`, which the program host calls to load L1 headers and receipts.",
      "Assuming bonds come back on their own; they sit in `DelayedWETH` until claimed, which op-challenger does only for its own sender and any `--additional-bond-claimants`.",
    ],
    related: ["fraud-proof", "optimistic-rollup", "derivation-pipeline", "blob-archive", "archive-node", "witness", "debug-api", "eth-get-proof", "database-snapshot", "bridge"],
    sources: [
      { title: "Optimism docs: op-challenger configuration", url: "https://docs.optimism.io/chain-operators/guides/configuration/op-challenger-config-guide" },
      { title: "OP Stack specification: fault dispute game", url: "https://specs.optimism.io/fault-proof/stage-one/fault-dispute-game.html" },
      { title: "OP Stack specification: bond incentives", url: "https://specs.optimism.io/fault-proof/stage-one/bond-incentives.html" },
      { title: "Optimism docs: chain monitoring and op-dispute-mon", url: "https://docs.optimism.io/chain-operators/tools/chain-monitoring" },
    ],
  },
  {
    id: "blob-archive",
    title: "Blob archive",
    category: "scaling",
    aliases: ["blob archiver", "historical blobs", "blob retention", "supernode", "Blobscan", "prune-blobs", "l1.beacon-fallbacks", "/eth/v1/beacon/blobs"],
    summary: "A blob archive keeps [[blob|blob]] data beyond the consensus layer's retention window of 4096 epochs, about 18 days, and serves it through [[beacon-api|Beacon API]] routes, so rollup nodes, provers and explorers can still fetch batch data that ordinary beacon nodes have deleted.",
    sections: [
      {
        heading: "Why blobs need archiving",
        paragraphs: [
          "Since Deneb, the consensus rules oblige beacon nodes to serve blob data for 4096 epochs and let them delete it afterwards, while the [[execution-layer|execution]] block keeps only the versioned hashes forever. Plenty of work needs the contents later: a rollup node re-running the [[derivation-pipeline|derivation pipeline]] from genesis, an [[op-challenger|op-challenger]] disputing an old block, an Arbitrum node syncing from scratch, an explorer or analytics job. The window is a network parameter, not a law: Gnosis Chain keeps 16,384 of its 80-second epochs, roughly 15 days.",
          "PeerDAS, live since Fusaka, changed what a beacon node holds. Each block's blobs are extended into 128 columns, and a node custodies at least 4 custody groups, more when it serves validators, rather than every blob; columns are served for the same 4096-epoch window, and the old by-range blob request is deprecated. A node with half the columns or more can reconstruct the rest, and the Beacon API states that after Fulu only supernodes, which custody all columns, are required to return blobs. So an archive now has to hold full data and not prune it. It also has to start in time: once the network has pruned a range, no peer is obliged to serve it, so a late archive cannot backfill from the p2p network.",
        ],
      },
      {
        heading: "Ways to keep them",
        paragraphs: [
          "The first is a [[beacon-node|beacon node]] told not to delete, with custody wide enough to rebuild blobs. [[lighthouse|Lighthouse]] has `--prune-blobs false` and `--blob-prune-margin-epochs`, plus `--supernode` or `--semi-supernode`; [[prysm|Prysm]] has `--blob-retention-epochs`, which it refuses to set below 4096, plus `--supernode` or `--semi-supernode`; [[lodestar|Lodestar]] has `--chain.archiveDataEpochs` with `--supernode` or `--semiSupernode`. Other clients have their own options. Disk then grows with every blob ever posted, and blob limits rise with each blob-parameter fork.",
          "The second is a standalone archiver. Base's `blob-archiver` runs an archiver process that follows a beacon node and writes blobs to disk or S3, and an API process that serves `/eth/v1/beacon/blob_sidecars/{id}` and `/eth/v1/beacon/blobs/{id}`, so it drops in wherever a beacon URL is expected; its README notes that it does not validate what the beacon node gave it. Blobscan indexes blob transactions for browsing and an API, and several beacon providers sell endpoints with historical blobs. All of these are [[historical-data|historical data]] services with the same question attached: can the answer be checked?",
        ],
      },
      {
        heading: "Pointing a node at one, and why it need not be trusted",
        paragraphs: [
          "`op-node` takes the archive as `--l1.beacon-fallbacks` (older name `--l1.beacon-archiver`) and tries it when `--l1.beacon` lacks a blob. Nitro has `--parent-chain.blob-client.secondary-beacon-url`, and `--parent-chain.blob-client.blob-directory` to keep every blob it fetches on local disk. Current op-node releases request `/eth/v1/beacon/blobs/{block_id}` with a `versioned_hashes` query: the route [[beacon-endpoints|Beacon API]] v4.0.0 added for Fulu, when it deprecated `/eth/v1/beacon/blob_sidecars/{block_id}`, which the next major version's drafts remove. An archive that serves only the old route stops working as a fallback.",
          "The archive cannot forge data. A blob determines its KZG commitment, and the versioned hash in the type `0x3` transaction is `0x01` followed by the last 31 bytes of `sha256` over that commitment. A client recomputes the commitment from the bytes it received and compares the hash with the one in an execution block it trusts; op-node does exactly this and rejects any mismatch. An archive can therefore lose data or refuse it, but not substitute it — provided the versioned hash comes from your own node's copy of the transaction, via [[eth-get-transaction-by-hash|eth_getTransactionByHash]], and not from the archive's response.",
        ],
      },
    ],
    example: {
      title: "Fetching an expired blob from an archive by versioned hash",
      language: "bash",
      code: "# the versioned hash comes from your own execution node\ncurl -s -X POST -H 'content-type: application/json' http://127.0.0.1:8545 \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getTransactionByHash\",\"params\":[\"0x7a51d0…e3b9\"]}' \\\n  | jq -r '.result.blobVersionedHashes[0]'\n# 0x01597a…c7d2\n\n# an ordinary beacon node, 40 days later: the data is gone\ncurl -s 'http://127.0.0.1:5052/eth/v1/beacon/blobs/15014337?versioned_hashes=0x01597a…c7d2'\n# empty data or an error, depending on the client\n\n# the archive answers on the same route\ncurl -s 'https://blobs.archive.example/eth/v1/beacon/blobs/15014337?versioned_hashes=0x01597a…c7d2'\n# {\"execution_optimistic\":false,\"finalized\":true,\"data\":[\"0x00a1f3…\"]}",
      note: "Before using the 131072 bytes, recompute their KZG commitment and check that it hashes to the versioned hash from your own node; that check is what makes the archive untrusted.",
    },
    pitfalls: [
      "Setting up an archive only after it is needed; ranges the network has already pruned cannot be backfilled from peers.",
      "Running an archiving beacon node without supernode or semi-supernode custody after Fusaka; it keeps its own columns forever but cannot return whole blobs.",
      "Pointing a current op-node at an archive that serves only the deprecated `blob_sidecars` route, which leaves the fallback failing on every request.",
      "Using a blob from an archive without recomputing its commitment against a versioned hash from your own node.",
      "Sizing archive disk from today's blob rate; each blob-parameter fork raises how much data a block can carry.",
    ],
    related: ["blob", "data-availability", "beacon-api", "beacon-endpoints", "derivation-pipeline", "op-challenger", "historical-data", "beacon-node", "rollup", "peerdas"],
    sources: [
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
      { title: "Consensus specs: Fulu p2p interface", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/fulu/p2p-interface.md" },
      { title: "base/blob-archiver", url: "https://github.com/base/blob-archiver" },
      { title: "Arbitrum docs: beacon nodes and historical blobs", url: "https://docs.arbitrum.io/run-arbitrum-node/beacon-nodes-historical-blobs" },
    ],
  },
  {
    id: "peerdas",
    title: "PeerDAS",
    category: "scaling",
    aliases: ["PeerDAS", "EIP-7594", "data availability sampling", "data column sidecar", "custody groups", "supernode", "cell KZG proofs", "Fulu"],
    summary: "PeerDAS (peer data availability sampling), added by EIP-7594 in the Fusaka upgrade, has each [[beacon-node|beacon node]] download and keep only some columns of erasure-coded [[blob|blob]] data instead of every blob, so the network as a whole still checks [[data-availability|data availability]] while no ordinary node holds whole blobs.",
    sections: [
      {
        heading: "From blobs to columns",
        paragraphs: [
          "Until Fusaka, the December 2025 [[hardfork|upgrade]] made of the Fulu consensus fork and the Osaka execution fork, every beacon node downloaded every blob, so each extra blob per block cost every node more bandwidth. PeerDAS splits that work. First each blob, 4,096 field elements of 32 bytes, is doubled to 8,192 field elements with Reed-Solomon erasure coding. Much as a RAID array survives a lost disk, any half of the extended data is enough to recompute all of it. The extended blob is then cut into 128 cells of 64 field elements, 2,048 bytes each. Stack a block's blobs as rows and the cells line up into 128 columns: column 37 is cell 37 of every blob in the block.",
          "Each column travels on its own [[libp2p-gossip|gossip subnet]] as a `DataColumnSidecar`. It carries the column's cells, a 48-byte KZG proof that each cell belongs to its blob, and what those proofs are checked against: each blob's KZG commitment, a 48-byte fingerprint that the block lists, plus the signed block header and a Merkle proof linking the two. A node can therefore check one column without seeing any other. Mainnet has allowed up to 21 blobs per block since January 2026; in such a block one column holds 43,008 bytes of cells, a sixty-fourth of the 2,752,512 bytes of blobs.",
        ],
      },
      {
        heading: "Custody, sampling and supernodes",
        paragraphs: [
          "Custody means downloading a column, storing it for 4,096 [[slot-epoch|epochs]] of 6.4 minutes, about 18 days, and serving it to peers. The spec counts it in custody groups, each one column on mainnet. Every node custodies at least 4, chosen by `get_custody_groups` from its node id, so any peer can work out which columns another should hold. With [[validator|validators]] attached, a node custodies one group per 32 ETH of their effective balance, from 8 up to 128: one 32 ETH validator means 8, one 2,048 ETH validator (the largest effective balance since Pectra) means 64, and 4,096 ETH or more makes the node a supernode, which custodies all 128. It advertises the count as `cgc` in its [[discovery|ENR]], the signed record peers find it by, and as `custody_group_count` in the metadata that `/eth/v1/node/identity` returns.",
          "Sampling is how a node decides that a block's data was published. Every slot it fetches at least 8 groups, or all of its custody groups if it has more, and treats the block as available only when every one of those columns arrives. That is enough because a publisher hiding data must withhold more than half of the columns, since any 64 rebuild the rest, and then a node's eight columns almost certainly include a missing one. A node holding 64 or more columns can rebuild the whole matrix, and should then gossip the missing columns on. The `--semi-supernode` mode of [[lighthouse|Lighthouse]] and [[prysm|Prysm]], `--semiSupernode` in [[lodestar|Lodestar]], keeps exactly those 64.",
        ],
      },
      {
        heading: "What changed for RPC callers",
        paragraphs: [
          "Sending blobs changed first. [[eth-send-raw-transaction|eth_sendRawTransaction]] takes a blob (type `0x3`) transaction in its network wrapper, which carries the blobs and their proofs beside the signed transaction; since Osaka it is `rlp([tx_payload_body, wrapper_version, blobs, commitments, cell_proofs])` with `wrapper_version` 1. Instead of one proof per blob it holds 128 cell proofs per blob, 768 for a transaction at the 6-blob limit, computed by the sender because computing them is costly and checking them cheap. [[geth|Geth]] still converts an old-style wrapper by computing the cell proofs itself, a stopgap its source marks for removal; other nodes and providers may simply reject it.",
          "Reading blobs changed next. The [[beacon-endpoints|Beacon API]] route `/eth/v1/beacon/blobs/{block_id}` now says that only supernodes must return blobs and that other nodes may reconstruct them. A node with fewer than 64 columns can therefore fail the request even inside the 18 days: Lighthouse answers 400 with `Insufficient data columns to reconstruct blobs`, and other clients word it differently. `/eth/v1/debug/beacon/data_column_sidecars/{block_id}` returns only the columns the node custodies.",
          "Inside the node, on the [[engine-payload|Engine API]], `engine_getPayloadV5` returns 128 cell proofs per blob, and `engine_getBlobsV2` and `engine_getBlobsV3` let the consensus client build columns from blobs its execution client already holds in its [[mempool|transaction pool]] instead of waiting for gossip. V2 returns every requested blob or `null`; V3 allows partial answers.",
        ],
      },
    ],
    example: {
      title: "One 21-blob block, seen by a Lighthouse node with one 32 ETH validator",
      language: "text",
      code: "blob            4,096 field elements x 32 bytes = 131,072 bytes\nextended blob   8,192 field elements = 128 cells x 2,048 bytes\nmatrix          21 rows (one per blob) x 128 columns\none column      21 cells = 43,008 bytes, plus 21 proofs x 48 bytes = 1,008 bytes\n\ncustody         max(8, 32 ETH / 32 ETH) = 8 groups = 8 columns, kept 4,096 epochs\nsampling        max(8 samples, 8 custody groups) = 8 columns, all must arrive\ndownloaded      8 x 43,008 = 344,064 of the block's 2,752,512 bytes (1/8)\nreconstruction  needs 64 of 128 columns; this node cannot rebuild a blob alone\n\n$ curl -s http://127.0.0.1:5052/eth/v1/node/identity | jq .data.metadata.custody_group_count\n\"8\"\n\n$ curl -s http://127.0.0.1:5052/eth/v1/beacon/blobs/head\n{\"code\":400,\"message\":\"BAD_REQUEST: Insufficient data columns to reconstruct blobs: required 64, but only 8 were found. You may need to run the beacon node with --supernode or --semi-supernode.\"}\n\n# the same request to a supernode\n{\"execution_optimistic\":false,\"finalized\":false,\"data\":[\"0x00a1…\", …]}",
      note: "Every number follows from the Fulu constants: 128 columns, a custody minimum of 4 groups or 8 with validators, 8 samples per slot, and reconstruction from half the columns. The 400 is Lighthouse's wording; other clients fail differently.",
    },
    pitfalls: [
      "Pointing a rollup node's blob fetches at an ordinary beacon node and reading its errors as missing data, when only a supernode, semi-supernode or [[blob-archive|blob archive]] is set up to serve whole blobs.",
      "Sizing a validator host for the 4-group minimum, when a node with validators custodies at least 8 groups and 64 once a single 2,048 ETH validator is attached.",
      "Signing blob transactions with a pre-Osaka library that attaches one proof per blob, which some endpoints reject and only some convert.",
    ],
    related: ["blob", "data-availability", "blob-archive", "beacon-endpoints", "engine-payload", "beacon-node", "eth-send-raw-transaction", "libp2p-gossip", "rollup", "hardfork"],
    sources: [
      { title: "EIP-7594: PeerDAS - Peer Data Availability Sampling", url: "https://eips.ethereum.org/EIPS/eip-7594" },
      { title: "consensus-specs: Fulu data availability sampling core", url: "https://github.com/ethereum/consensus-specs/blob/master/specs/fulu/das-core.md" },
      { title: "beacon-APIs: getBlobs", url: "https://github.com/ethereum/beacon-APIs/blob/master/apis/beacon/blobs/blobs.yaml" },
      { title: "execution-apis: Engine API, Osaka", url: "https://github.com/ethereum/execution-apis/blob/main/src/engine/osaka.md" },
    ],
  },
  {
    id: "cross-chain-relayer",
    title: "Cross-chain message relayers",
    category: "scaling",
    aliases: ["relayer", "Hyperlane relayer", "LayerZero DVN", "LayerZero executor", "Wormhole guardian", "VAA", "Across relayer", "Chainlink CCIP"],
    summary: "A cross-chain message relayer is an off-chain program that carries a message between chains that cannot see each other: it watches the source chain, waits until the message is unlikely to be [[reorg|reorged]] away, obtains the proof the destination contract requires, and delivers it there, paying the destination gas, the pattern messaging [[bridge|bridges]] follow.",
    sections: [
      {
        heading: "One pattern behind messaging protocols",
        paragraphs: [
          "A contract can read only its own chain. Nothing on Arbitrum learns that tokens were locked on Base unless someone sends Arbitrum a transaction saying so, with evidence its contract can check. Messaging protocols do that with off-chain programs in five steps. Watch: index the source chain's message events with [[eth-get-logs|eth_getLogs]]. Wait: hold off until the source block is unlikely to be reorged out. Prove: collect evidence the destination accepts, usually signatures from attesters, parties that each watch the source chain and vouch for what they saw. Deliver: send the destination transaction that executes the message once the evidence is there. Pay: the deliverer spends destination gas, which in Hyperlane, LayerZero and CCIP the sender prepays on the source chain.",
          "The names differ. The attesters are Hyperlane's validators; LayerZero's DVNs, decentralised verifier networks, which record their verification on the destination themselves; Wormhole's 19 guardians, 13 of whose signatures make a VAA, a verified action approval; and Chainlink CCIP's committee of node operators. The deliverers are Hyperlane relayers and the executors of the other three. All four let anyone deliver a proven message, so the security lives in the proof: a deliverer can at worst delay a message, never forge one. CCIP is unrelated to [[ccip-read|CCIP-Read]].",
        ],
      },
      {
        heading: "Watch and wait on the source chain",
        paragraphs: [
          "Watching is event indexing. In Hyperlane, the relayer indexes each origin chain for `Dispatch` on the Mailbox, the contract that sends and receives messages, for `GasPayment` on the gas paymaster, the contract that collects delivery fees, and for insertions into the MerkleTreeHook, which adds each message to a [[inclusion-proof|Merkle tree]], a hash tree whose root commits to every entry. It calls eth_getLogs in windows of `index.chunk` blocks, 1,999 by default, which fits common 2,000-block range caps. Downtime becomes catch-up over every missed block, which needs an endpoint that still holds those receipts; see [[cursor-pagination|range pagination]].",
          "Waiting is what prevents a double spend: if a message is delivered and its source transaction is then reorged out, tokens appear on the destination for a lock or burn that never happened. Hyperlane validators therefore sign the tree only as it stood `reorgPeriod` blocks below the tip, set per chain: 15 blocks on Ethereum, 10 on Base, 5 on Arbitrum, and `finalized` on Polygon. CCIP waits for full source [[finality|finality]] by default. In Wormhole the sending contract picks a consistency level: `200` for instant, `201` for the `safe` [[block-tag|block]], anything else for finalized; after the wait the guardians' watcher re-reads the receipt and drops the message as orphaned if it is gone.",
        ],
      },
      {
        heading: "Prove, deliver, pay",
        paragraphs: [
          "On the destination, a Hyperlane relayer checks that the origin transaction paid the gas paymaster enough under its fee policy. It then gathers the proof, called metadata, that the recipient's security module, the destination contract that judges proofs, asks for: for a multisig module, signatures from a threshold of validators on a checkpoint of the tree. It simulates `process(metadata, message)` on the destination Mailbox, then sends it. A failed attempt goes back in the queue with a backoff that grows from 5 seconds to hours and eventually days. Races are normal: when two relayers deliver one message, the loser's simulation or transaction reverts with `Mailbox: already delivered`.",
          "One relayer serves many chains, often dozens, so endpoint quality is the product. Hyperlane agents take several URLs per chain through `customRpcUrls`, with `rpcConsensusType` set to `fallback`, the default, which moves to the next URL when a provider fails, or `quorum`, which needs a majority to agree on reads but not on sending transactions; see [[failover|failover]].",
        ],
      },
      {
        heading: "Across: deliver first, prove later",
        paragraphs: [
          "Across runs the same steps in another order. A user calls `deposit` on the origin chain's SpokePool contract, which locks the tokens and emits `FundsDeposited`. A relayer watching for that event calls `fillRelay` on the destination SpokePool and pays the recipient at once, from its own capital. The proof comes afterwards: a dataworker, a whitelisted off-chain agent, bundles the fills and proposes them to the HubPool contract on Ethereum with a bond, and after a challenge period the relayer is repaid. Each fill is matched against its deposit, so the relayer bears the reorg risk and chooses its own wait: a fill for a deposit later reorged away is never repaid, the same fill risk an [[intent-solver|intent solver]] carries.",
        ],
      },
    ],
    example: {
      title: "One Hyperlane message from Base to Arbitrum",
      language: "text",
      code: "A Hyperlane message from Base (domain 8453) to Arbitrum (domain 42161)\n\n1. send, on Base: a user's transaction calls dispatch(42161, recipient, body) on the\n   Mailbox 0xeA87ae93Fa0019a82A727bfd3eBd1cFCa8f64f1D, which emits\n   Dispatch(sender, 42161, recipient, message)     topic0 0x769f711d…c814\n   DispatchId(messageId)\n   and prepays the gas paymaster 0xc3F23848Ed2e04C0c6d41bd7804fa8f89F940B94, which emits\n   GasPayment(messageId, 42161, gasAmount, payment)\n\n2. watch: the relayer runs eth_getLogs on the Mailbox in 1,999-block windows; the\n   message lands in its local RocksDB store\n\n3. wait: Hyperlane's validators for Base wait reorgPeriod = 10 blocks, about 20 seconds at 2-second blocks, then sign the\n   checkpoint (root, index) of the MerkleTreeHook 0x19dc38aeae620380430C200a6E990D5Af5480117\n   and write it to S3\n\n4. prove: was gas paid under the relayer's policy? fetch a threshold of checkpoint\n   signatures (plus a Merkle proof, if the security module wants one), then simulate on Arbitrum\n   eth_estimateGas {to: 0x979Ca5202784112f4738403dBec5D0F3B9daabB9,\n                    data: 0x7c39d130 <process(metadata, message)>}\n\n5. deliver and pay: eth_sendRawTransaction on Arbitrum, gas paid by the relayer;\n   the Mailbox emits Process and ProcessId\n\n6. confirm: wait for Arbitrum's own depth; on a revert or a reorg, back to step 4\n   a second relayer that lost the race sees in its simulation:\n   execution reverted: Mailbox: already delivered",
      note: "Steps 2 to 5 are the watch, wait, prove, deliver and pay pattern, and each runs on ordinary RPC against one of the two chains. The 10-block wait in step 3 is what stands between a Base reorg and a double spend, and step 6 needs a separate wait on Arbitrum.",
    },
    pitfalls: [
      "Reusing one confirmation depth on every chain; 15 blocks take three minutes on Ethereum but about four seconds on Arbitrum, and some chains signal safety only through `finalized`; see [[confirmations|confirmations]].",
      "Advancing an indexing cursor past a range whose eth_getLogs came back empty from a node that no longer holds those receipts, which silently skips messages.",
      "Counting a delivery as done once it is sent; it can revert or be reorged out on the destination, and only a confirmed receipt counts.",
      "Switching endpoints mid-scan without re-checking the head, so a [[head-lag|lagging node]] makes recent messages look missing or a reorg look real.",
    ],
    related: ["bridge", "finality", "reorg", "confirmations", "eth-get-logs", "intent-solver", "l2-rpc", "failover", "transaction-relayer", "ccip-read"],
    sources: [
      { title: "Hyperlane: Relayer", url: "https://docs.hyperlane.xyz/docs/protocol/agents/relayer" },
      { title: "Hyperlane: Agent configuration reference", url: "https://docs.hyperlane.xyz/docs/operate/config/config-reference" },
      { title: "LayerZero: Build DVNs", url: "https://docs.layerzero.network/v2/workers/off-chain/build-dvns" },
      { title: "Wormhole: Guardians", url: "https://wormhole.com/docs/protocol/infrastructure/guardians/" },
    ],
  },
];
