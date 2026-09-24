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
          "The L1 contracts will not accept an arbitrary state commitment. On one family an incorrect commitment can be disproved with a [[fraud-proof|fraud proof]] during a challenge window; on the other a [[validity-proof|validity proof]] is checked before the commitment counts at all. Either way the rollup's canonical state is a function of data that lives on Ethereum, which is the property the word 'rollup' is reserved for. A chain that keeps its data with an outside committee is a validium or alt-DA chain instead, and its users trust that committee to stay honest and online.",
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
          "Four roles appear on every rollup. A [[sequencer|sequencer]] orders incoming transactions and produces L2 blocks in a second or two, which is what users experience as confirmation. A batcher compresses those blocks and posts them to L1. A proposer submits state commitments. A prover or challenger backs those commitments with a proof. The canonical [[bridge|bridge]] contracts move ETH and tokens in both directions and are the reason a withdrawal is slower than a deposit.",
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
      "Assuming an L2 block number relates to an L1 block number; they are independent counters, and on Arbitrum the EVM's `block.number` reports the L1 number while [[eth-block-number|eth_blockNumber]] reports the L2 one.",
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
          "OP Stack powers Optimism, Base, and many others from a shared codebase. Its node splits like an L1 node: `op-node` runs the derivation pipeline that rebuilds the L2 chain from L1 batches and deposits, and drives an [[execution-client|execution client]] — `op-geth`, `op-reth`, or [[nethermind|Nethermind]] — over the [[engine-api|Engine API]]. Blocks are produced every 2 seconds whether or not there are transactions. Its fault proof system bisects a disputed claim down to one instruction and executes that step on L1 in an on-chain MIPS interpreter called Cannon.",
          "Arbitrum One and Nova run Nitro, a single process built around a modified go-ethereum core. The same state transition function is compiled to WASM so it can be replayed inside the dispute game, and BoLD (Bounded Liquidity Delay) makes validation permissionless with a bounded settlement time rather than relying on a whitelist of validators. Nitro blocks are produced on demand, as often as every 250 milliseconds.",
        ],
      },
      {
        heading: "What it means for callers",
        paragraphs: [
          "Both stacks accept the standard method set, and both change what the [[block-tag|block tags]] mean. `latest` on a sequencer endpoint is an unsafe head: a block the [[sequencer|sequencer]] has produced and gossiped but that no L1 batch mentions yet. `safe` is the head derived from batch data already on L1, and `finalized` is the head derived from L1 data that L1 itself has finalized, so it trails by L1 [[finality|finality]] plus the batch posting interval. An unsafe block can be replaced without any L1 [[reorg|reorg]] if the sequencer's chain and the derived chain disagree.",
          "Fees have two parts. Execution gas is metered by the [[evm|EVM]] as usual and is nearly free; the L1 data cost is charged separately and is usually the larger half. OP Stack surfaces it as `l1Fee` on the [[transaction-receipt|receipt]]; Arbitrum folds it into the gas number as `gasUsedForL1`. Details are in [[l2-rpc|L2 RPC differences]].",
        ],
      },
    ],
    pitfalls: [
      "Assuming the challenge window delays deposits; deposits from L1 land in minutes, only withdrawals wait for the window.",
      "Polling an optimistic rollup for `finalized` and expecting it to move every few seconds; it advances in steps tied to L1 finality and batch posting.",
      "Comparing L2 block numbers across chains to judge elapsed time; 2-second OP Stack blocks and sub-second Arbitrum blocks measure very different intervals.",
    ],
    related: ["rollup", "fraud-proof", "l2-rpc", "sequencer", "bridge", "zk-rollup", "block-tag", "data-availability", "nethermind"],
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
    related: ["validity-proof", "rollup", "l2-rpc", "optimistic-rollup", "data-availability", "sequencer", "bridge", "block-tag", "finality"],
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
          "L1 cannot re-execute a whole L2 batch; that would defeat the purpose of the rollup. Instead the challenger and the defender play a bisection game. Each claims a different state after a range of execution. They repeatedly split the range in half and state the intermediate results until they disagree about one single instruction. Only that instruction is executed on L1, against the memory and registers both sides agreed on, and the contract compares the result with what each party claimed. The loser's bond is slashed.",
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
    related: ["optimistic-rollup", "bridge", "rollup", "validity-proof", "sequencer", "data-availability", "l2-rpc", "execution-trace"],
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
    related: ["zk-rollup", "fraud-proof", "rollup", "bridge", "data-availability", "state-root", "l2-rpc", "sequencer"],
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
    aliases: ["sequencing", "soft confirmation", "unsafe head", "forced inclusion", "based rollup"],
    summary: "A sequencer is the party that receives an L2's transactions, fixes their order, and produces blocks immediately, giving users a soft confirmation long before the batch containing them reaches L1.",
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
          "Nearly every production rollup runs a single sequencer, so censorship resistance comes from a separate path: submitting through L1. On OP Stack a call to the `OptimismPortal` contract produces a deposit that the derivation pipeline must include, and it appears on L2 as a type `0x7e` transaction within the chain's sequencing window, which is measured in hours. Arbitrum has the equivalent through its delayed inbox. This path is slow and costs L1 [[gas|gas]], but it does not need the sequencer's cooperation.",
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
    related: ["l2-rpc", "rollup", "optimistic-rollup", "head-lag", "block-tag", "bridge", "mempool", "data-availability", "mev"],
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
          "Deposits from L1 appear as a transaction type that does not exist on mainnet: `0x7e` on OP Stack. Such a transaction has no signature, carries `sourceHash` and `mint` fields, and has a `from` that is an aliased version of the L1 sender's [[address|address]]. Strict decoders in [[client-libraries|client libraries]] and [[indexer|indexers]] that switch on [[transaction-types|transaction type]] will throw on it unless they were written for OP Stack.",
        ],
      },
      {
        heading: "Fees are estimated differently",
        paragraphs: [
          "On OP Stack, [[eth-estimate-gas|eth_estimateGas]] returns only the L2 execution gas; the L1 data fee is charged on top and is usually the larger part. To show a user a real total you query the `GasPriceOracle` predeploy at `0x420000000000000000000000000000000000000F` with [[eth-call|eth_call]], passing the serialized transaction to `getL1Fee`. Arbitrum takes the opposite approach and folds the L1 component into the gas number itself, so its estimate already includes it and the `gasUsedForL1` field tells you how much of the total that was.",
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
      "Assuming `block.number` inside the EVM matches [[eth-block-number|eth_blockNumber]]; on Arbitrum the opcode returns the L1 block number while the RPC method returns the L2 one.",
    ],
    related: ["rollup", "sequencer", "block-tag", "bridge", "transaction-types", "optimistic-rollup", "zk-rollup", "eth-estimate-gas", "head-lag", "namespaces"],
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
          "A deposit starts as an ordinary L1 transaction to a bridge contract — on OP Stack, `OptimismPortal` directly or `L1StandardBridge` for tokens. It emits an [[event-log|event]]. Every L2 node's derivation pipeline reads L1 blocks, finds those events, and inserts a corresponding transaction into an L2 block; on OP Stack it appears as a type `0x7e` deposit transaction whose `from` is an aliased version of the L1 sender. The [[sequencer|sequencer]] has no say in whether it is included, which is why this path doubles as the forced-inclusion escape hatch.",
          "Because the pipeline is deterministic, a deposit normally shows up on L2 within a few minutes, after enough L1 [[confirmations|confirmations]] for the chain's derivation rules. Its L2 execution gas was paid on L1 when the deposit was made, so it does not need funds on L2 to run.",
        ],
      },
      {
        heading: "Withdrawals wait for settlement",
        paragraphs: [
          "The other direction is slower because L1 has no way to observe L2 except through what has been settled there. On OP Stack a withdrawal is a message recorded by the `L2ToL1MessagePasser` predeploy at `0x4200000000000000000000000000000000000016`. Once a proposer has posted an output root covering that L2 block, the user proves the message on L1 with a [[storage-proof|storage proof]] taken from [[eth-get-proof|eth_getProof]] against the L2 at that block, waits out the [[fraud-proof|fault proof]] challenge window of about seven days, then sends a second transaction to finalize and receive the funds.",
          "On a [[zk-rollup|ZK rollup]] the same proof of inclusion is checked, but the wait is until the batch's [[validity-proof|validity proof]] has been verified on L1 rather than a fixed window, so the delay is hours. Either way, the withdrawal is two or three L1 transactions, and the L1 [[gas|gas]] to prove and finalize can exceed the amount being withdrawn for small sums.",
        ],
      },
      {
        heading: "Third-party bridges and what to watch",
        paragraphs: [
          "Most users never touch the canonical path. Liquidity bridges front the funds on the destination chain immediately and take the slow route themselves, charging a fee for the capital and the risk. Messaging bridges with their own validator or oracle sets move arbitrary data between chains that have no shared settlement layer at all. Both replace the rollup's security model with the bridge's own, and bridge contracts have been the single largest category of loss in the ecosystem.",
          "From an RPC perspective, tracking bridge activity means watching two chains at once: [[eth-get-logs|eth_getLogs]] on the L1 contracts for deposits and proofs, `eth_getLogs` on the L2 for the message-passed events, and `optimism_outputAtBlock` on `op-node` to learn which output root a given L2 block falls under. An [[indexer|indexer]] that joins the two sides has to handle each chain's [[reorg|reorgs]] independently.",
        ],
      },
    ],
    pitfalls: [
      "Assuming a withdrawal is one transaction; on OP Stack it is initiate on L2, prove on L1, then finalize on L1 after the window.",
      "Proving a withdrawal against a block the proposer has not covered yet; the proof only works once an output root including that block exists on L1.",
      "Sending tokens to a bridge address directly instead of calling the deposit function; a bare transfer is not a bridge message and is usually unrecoverable.",
    ],
    related: ["rollup", "fraud-proof", "eth-get-proof", "optimistic-rollup", "validity-proof", "l2-rpc", "sequencer", "receipt-proof", "event-log"],
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
    aliases: ["DA", "calldata", "validium", "alt-da", "celestia", "eigenda", "peerdas", "das"],
    summary: "Data availability is the guarantee that the data behind a [[rollup|rollup]] batch was actually published, so anyone can reconstruct the L2 state and exit without the operator's help, independent of whether the transition was proved correct.",
    sections: [
      {
        heading: "Why availability is its own problem",
        paragraphs: [
          "A [[validity-proof|validity proof]] shows a state transition was executed correctly; a [[fraud-proof|fraud proof]] lets someone disprove a wrong one. Neither helps if the data is missing. If an operator publishes a valid [[state-root|state root]] but withholds the transactions behind it, nobody else can compute the current state, nobody can build the [[storage-proof|storage proof]] a [[bridge|withdrawal]] needs, and nobody can challenge anything because they cannot construct the correct claim. The chain is correct and unusable at the same time.",
          "That is why a rollup is defined by where its data goes. Publishing to Ethereum means the data inherits Ethereum's own availability: every [[full-node|full node]] on the network downloads and checks it, and an [[archive-node|archive]] or [[portal-network|Portal Network]] keeps it afterwards.",
        ],
      },
      {
        heading: "The three places data goes",
        paragraphs: [
          "Calldata was the original option: permanent, verifiable by contracts, and expensive, since it competes with all other execution [[gas|gas]] and EIP-7623 raised its cost further in Pectra. [[blob|Blobs]] are the current default: a separate market, roughly two orders of magnitude cheaper per byte at typical prices, not readable by the [[evm|EVM]], and discarded by nodes after about 18 days — long enough for anyone to derive the chain, not long enough to serve as archival storage.",
          "External DA layers such as Celestia, EigenDA, and Avail, or a fixed data availability committee, are the third option. Chains using them are usually called validiums or alt-DA chains. They are much cheaper still, and they change the trust model: availability now depends on that network or committee rather than on Ethereum, and a rollup that loses its data cannot be repaired by L1.",
        ],
      },
      {
        heading: "Sampling instead of downloading",
        paragraphs: [
          "Requiring every node to download every blob is what caps blob throughput. PeerDAS, introduced by EIP-7594 in the Fusaka upgrade of December 2025, changes that: blob data is erasure-coded into columns, each node stores and gossips only some of them, and it samples random columns to become confident the rest exists. Because no node needs the whole thing, blob counts can rise without raising per-node bandwidth, which is what the blob-parameter-only forks after Fusaka do.",
        ],
      },
      {
        heading: "Reading the data over RPC",
        paragraphs: [
          "The [[execution-layer|execution layer]] never hands you blob contents. [[eth-get-transaction-by-hash|eth_getTransactionByHash]] on a batch-posting transaction returns `blobVersionedHashes`, which are commitments, not data. The bodies live on the [[consensus-layer|consensus layer]] and are fetched from the [[beacon-api|Beacon API]] at `/eth/v1/beacon/blob_sidecars/{block_id}` while within the retention window; after that only an archive service or the rollup's own node has them. Deriving an L2 chain from scratch therefore needs an execution endpoint and a consensus endpoint, which is why [[rollup|rollup]] node setups ask for both.",
        ],
      },
    ],
    pitfalls: [
      "Assuming a validity proof implies the data is available; the two properties are independent and a proved chain can still strand its users.",
      "Planning to read old batch data from blobs; sidecars are dropped after about 18 days, so long-range derivation needs an archive of them.",
      "Calling a validium a rollup; its availability rests on an external committee or network, not on Ethereum.",
      "Expecting blob contents from an execution endpoint; `eth_` methods return only the versioned hashes, and the bodies come from the Beacon API.",
    ],
    related: ["blob", "rollup", "validity-proof", "fraud-proof", "beacon-api", "bridge", "zk-rollup", "optimistic-rollup", "beacon-endpoints"],
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
          "Blobs never enter the execution block. They propagate on the [[consensus-layer|consensus layer]] as sidecars gossiped alongside the [[beacon-block|beacon block]], and are retained for 4096 epochs, about 18 days, after which nodes delete them. The commitment stays in the chain forever; the data does not. Retrieval is through the [[beacon-api|Beacon API]] at `/eth/v1/beacon/blob_sidecars/{block_id}`, never through an `eth_` method, which only ever returns the versioned hashes.",
          "The retention is deliberate: [[data-availability|availability]] only has to last long enough for everyone to download the data and derive the L2 chain, and anyone who wants it permanently archives it themselves. After Fusaka, PeerDAS lets a node sample columns rather than hold every blob, which is what allows the limits to keep rising.",
        ],
      },
    ],
    example: {
      title: "A rollup batch posted as a type 0x3 transaction (abridged)",
      language: "json",
      code: "// request\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getTransactionByHash\",\"params\":[\"0x3c8e42…91a4\"]}\n\n// result\n{\n  \"hash\": \"0x3c8e42…91a4\",\n  \"type\": \"0x3\",\n  \"chainId\": \"0x1\",\n  \"from\": \"0x5050f6…76c9\",\n  \"to\": \"0xff00000000000000000000000000000000008453\",\n  \"value\": \"0x0\",\n  \"input\": \"0x\",\n  \"nonce\": \"0x2f10c\",\n  \"gas\": \"0x5208\",\n  \"maxFeePerGas\": \"0x1dcd6500\",\n  \"maxPriorityFeePerGas\": \"0x3b9aca00\",\n  \"maxFeePerBlobGas\": \"0x2540be400\",\n  \"blobVersionedHashes\": [\"0x01597a…c7d2\", \"0x01a3f0…4f08\"],\n  \"blockNumber\": \"0x14a1b2c\"\n}",
      note: "The batch inbox address encodes the rollup's [[chain-id|chain id]], the payload is empty, and the 128 KiB of data behind each versioned hash has to be fetched from a [[consensus-client|consensus client]].",
    },
    pitfalls: [
      "Looking for blob contents in the transaction object; `blobVersionedHashes` are commitments, and the bodies come from the Beacon API within about 18 days.",
      "Sending a type `0x3` transaction with a plain signed encoding; `eth_sendRawTransaction` expects the network form carrying the blobs, commitments, and proofs.",
      "Estimating blob cost from the execution base fee; the two markets move independently and the blob base fee can sit at 1 wei for days.",
    ],
    related: ["data-availability", "rollup", "transaction-types", "eth-fee-history", "beacon-api", "eip-1559", "block-header", "eth-gas-price", "beacon-endpoints"],
    sources: [
      { title: "EIP-4844: Shard Blob Transactions", url: "https://eips.ethereum.org/EIPS/eip-4844" },
      { title: "EIP-4844 overview", url: "https://www.eip4844.com/" },
      { title: "Beacon APIs specification", url: "https://ethereum.github.io/beacon-APIs/" },
    ],
  },
];
