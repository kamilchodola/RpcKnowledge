// Checkpoint questions: Wallets & tooling. Six per topic, in the order of data/tooling.js.

export const quizzes = {
  "eip-1193": [
    {
      kind: "scenario",
      question: "A user clicks connect, then dismisses the wallet popup. What does the provider do with the pending request?",
      options: [
        "It rejects the promise with a ProviderRpcError whose code is 4001",
        "It resolves with an empty array, since no account was approved",
        "It resolves with the accounts anyway, flagged as unauthorized",
        "It rejects with the standard JSON-RPC error -32601, method not found",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "A page calls eth_getBalance through window.ethereum. Which node answers it?",
      options: [
        "The RPC URL the page configured when it first created its read client",
        "A light node bundled inside the browser extension, synced from peers",
        "Whatever endpoint the wallet is set to use, not one the page picks",
        "The endpoint named in the request's params, if the page supplies one",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "What problem does EIP-6963 provider discovery exist to solve?",
      options: [
        "Wallets forwarding wallet_ methods to nodes that cannot serve them",
        "Providers returning decimal numbers where hex strings are required",
        "Several wallets overwriting window.ethereum, leaving users no choice",
        "Subscriptions breaking silently whenever the WebSocket reconnects",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "What separates eth_requestAccounts from eth_accounts when called through an injected provider?",
      options: [
        "The first returns one address; the second returns every address held",
        "The first prompts; the second never prompts and is empty until granted",
        "The first is answered by the node; the second by the wallet itself",
        "The first works only over HTTP; the second only over the injected provider",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A dapp reads the chain id once at startup and never listens for chainChanged. What happens after the user switches networks in the wallet?",
      options: [
        "The wallet refuses the switch until the page subscribes to the event",
        "It keeps showing data from the chain the user has already left",
        "The provider reloads the page automatically, so nothing goes stale",
        "Every request rejects with 4901 until the page reads eth_chainId again",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "A request from the page is rejected with EIP-1193 error code 4200. What does that code mean?",
      options: [
        "The user dismissed the prompt for this request",
        "The page lacks the authorization this method needs",
        "The wallet does not support the requested method",
        "The provider is disconnected from the requested chain",
      ],
      answer: 2,
    },
  ],
  "wallet-rpc": [
    {
      kind: "cause",
      question: "Why does posting wallet_switchEthereumChain to an https RPC endpoint fail?",
      options: [
        "The endpoint requires an API key before it serves wallet_ methods",
        "The chainId parameter must be sent as a decimal number over HTTP",
        "Wallets implement it, not nodes, so the node answers -32601",
        "Nodes accept wallet_ methods only over a WebSocket connection",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What does error code 4902 from wallet_switchEthereumChain mean?",
      options: [
        "The user saw the network switch prompt and rejected it outright",
        "The wallet has no definition for that chain, so offer to add it",
        "The chain id was malformed, for example sent as a decimal string",
        "The wallet is disconnected from all chains and cannot switch",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A site wants to submit several calls as one wallet action and then track its progress. Which pair of methods does that?",
      options: [
        "wallet_requestPermissions and wallet_getPermissions, from EIP-2255",
        "wallet_sendCalls and wallet_getCallsStatus, from EIP-5792",
        "eth_sendRawTransaction and eth_getTransactionReceipt",
        "wallet_watchAsset and wallet_showCallsStatus",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A site needs the user on OP Mainnet before it continues. What sequence of calls does the lesson recommend?",
      options: [
        "Add the chain first, then switch, so the switch never fails",
        "Switch first, and trust the resolved promise as confirmation",
        "Switch first, add only on 4902, then re-read eth_chainId",
        "Add the chain with your own RPC URL, which also switches to it",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A site calls wallet_addEthereumChain unprompted, supplying its own RPC URL. What is it asking the user to accept?",
      options: [
        "Grant your site standing permission to sign on that chain for them",
        "Register your RPC URL as a node with that chain's validator set",
        "Pay a one-time fee to list the chain in their wallet's registry",
        "Send all their traffic for that chain through an endpoint you run",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does the identifier returned by wallet_sendCalls differ from what eth_sendTransaction returns?",
      options: [
        "It is the hash of the first transaction in the batch it sent",
        "It is a userOpHash that eth_getTransactionReceipt can resolve",
        "It is a wallet-level handle to poll, not a transaction hash",
        "It is the block number at which the whole batch will be included",
      ],
      answer: 2,
    },
  ],
  "signing-methods": [
    {
      kind: "cause",
      question: "Why is eth_sign considered dangerous compared with personal_sign?",
      options: [
        "It returns the account's private key alongside the finished signature",
        "It signs with a deterministic nonce that leaks the key after two uses",
        "It signs 32 raw bytes with no prefix, which could be a transaction hash",
        "It sends the message on to the node rather than keeping it in the wallet",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A public RPC endpoint answers personal_sign with method not found. What does that indicate?",
      options: [
        "The node is still out of sync and cannot sign until it catches up",
        "Correct setup: the node holds no user keys and hides personal_",
        "The request needs an API key before the signing methods unlock",
        "The method was renamed to eth_personalSign in a recent fork",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "Your login flow verifies signatures with ecrecover and fails for one user whose address is a smart account. What is the fix?",
      options: [
        "Ask the user to sign the login message with eth_sign instead",
        "Recover again with v set to 0 or 1 rather than to 27 or 28",
        "Call its ERC-1271 isValidSignature and check for 0x1626ba7e",
        "Hash the message a second time before running ecrecover",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "In what order do personal_sign and the deprecated eth_sign take their two parameters?",
      options: [
        "personal_sign takes [address, message]; eth_sign takes [hash, address]",
        "personal_sign takes [message, address]; eth_sign takes [address, hash]",
        "Both take [address, message], matching eth_signTypedData_v4's order",
        "Both take [message, address], and the wallet detects which is which",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What does the EIP-191 prefix give a personal_sign signature that an eth_sign signature over raw bytes lacks?",
      options: [
        "The digest includes the chain id, so it cannot be replayed on other chains",
        "The message is encrypted, so only the site that requested it can read it",
        "The digest can never match a transaction, so it cannot be replayed as one",
        "The signature grows to 96 bytes, which marks it as a message signature",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A sign-in flow accepts any valid signature over the fixed text Sign in to example.app, with no nonce or expiry. What is the risk?",
      options: [
        "The wallet refuses to sign an identical message for a second time",
        "The signature reveals enough about the private key to derive it",
        "A captured signature can be replayed to sign in at any later time",
        "Every user gets the same signature, so accounts are indistinguishable",
      ],
      answer: 2,
    },
  ],
  "eip-712": [
    {
      kind: "cause",
      question: "What stops an EIP-712 signature from being replayed against the same contract deployed on another chain?",
      options: [
        "The wallet refuses to sign an identical typed message for a second chain",
        "The nonce field, which the standard requires in every message type",
        "The signed domain separator carries chainId and verifyingContract",
        "The 0x1901 prefix, whose bytes differ from one network to the next",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A contract recovers a different address than expected from a signature the wallet produced correctly. Which cause fits?",
      options: [
        "The permit deadline had already passed when the contract checked it",
        "The wallet signed with eth_signTypedData_v4 instead of personal_sign",
        "The message values were sent as JSON strings rather than numbers",
        "The front end's type string differs from the one the contract hashes",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "What does an ERC-2612 permit offer over a normal approve transaction?",
      options: [
        "It removes the allowance model, so no approval is ever stored on chain",
        "The user signs off-chain and someone else submits it and pays the gas",
        "It lets the token contract skip the ecrecover check on each transfer",
        "It makes a single approval valid on every chain the token exists on",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "How is the final digest that an EIP-712 signature covers built?",
      options: [
        "keccak256 of the EIP-191 message prefix and the raw JSON document",
        "keccak256 of 0x1901, the domain separator, and hashStruct(message)",
        "keccak256 of the type hash alone, signed together with the chain id",
        "sha256 of the domain separator, followed by the message's ABI encoding",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A wallet expects the typed data for eth_signTypedData_v4 as a JSON string, but the app passes an object. What happens?",
      options: [
        "The wallet stringifies it and signs the same digest",
        "The request fails with an unhelpful parameter error",
        "The wallet falls back to personal_sign over the object",
        "The signature is produced but binds to no chain id",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "When people compute a type hash by hand for a struct that references other structs, which rule do they most often get wrong?",
      options: [
        "Referenced struct types are appended in order of first use",
        "Field names are sorted alphabetically inside each type string",
        "Referenced struct types are appended in alphabetical order",
        "Referenced types are omitted, and only the primary type is hashed",
      ],
      answer: 2,
    },
  ],
  "client-libraries": [
    {
      kind: "cause",
      question: "Two balances read in the same function come from slightly different states. What is the usual cause?",
      options: [
        "The library cached the first result and reused it for the second",
        "Converting hex to BigInt lost precision on the larger of the two",
        "Each read defaulted to latest, and the head moved between them",
        "The ABI decoder read the second result using the wrong output type",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What does a client library such as viem or ethers add on top of raw JSON-RPC?",
      options: [
        "A guarantee that the endpoint supports every method it wraps",
        "ABI encoding of calldata and decoding of the returned words",
        "Proof that each answer matches the chain's canonical state",
        "Consistent snapshots, since every read it makes shares one block",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "Your send throws a timeout, so you re-sign the transaction with a fresh nonce and send it again. What can go wrong?",
      options: [
        "Nothing, since a timeout means the first was never broadcast at all",
        "The first may already be out, so both transactions can land",
        "The node rejects the nonce, because it must increase by exactly two",
        "The library refuses to sign twice with the same key in one session",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What distinguishes how viem is organised from how ethers.js is organised?",
      options: [
        "viem wraps Provider and Signer objects; ethers splits read and wallet clients",
        "viem splits read and wallet clients; ethers centres on Provider and Signer",
        "viem is the oldest library; ethers is the newer, tree-shakeable one",
        "viem only runs in browsers; ethers only runs under Node.js on servers",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "You are writing Rust and want contract types generated straight from a Solidity signature. What fits?",
      options: [
        "Nethereum, using its code generator",
        "alloy, using its sol! macro",
        "web3.py, using its contract factory",
        "ethclient, using abigen bindings",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why is go-ethereum's ethclient often the clearest way to see what a method really returns?",
      options: [
        "It logs every raw request and response to standard output",
        "It bypasses JSON-RPC and reads the node's database directly",
        "It validates each answer against a Merkle proof it fetches",
        "It is a thin wrapper that uses the client's own types",
      ],
      answer: 3,
    },
  ],
  "multicall": [
    {
      kind: "contrast",
      question: "What does a multicall give you over a JSON-RPC batch of the same eth_call requests?",
      options: [
        "Lower latency, since a JSON-RPC batch sends its calls one by one",
        "All reads run in one EVM call at one block, a consistent snapshot",
        "Per-call error isolation, which a JSON-RPC batch does not provide",
        "Access to historical state that a pruned node would otherwise refuse",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why is Multicall3 at the same address on Ethereum, Base, and Arbitrum?",
      options: [
        "Each chain's genesis includes it as a predeploy at a reserved address",
        "The address is reserved for it by an EIP that every chain has adopted",
        "It was deployed deterministically, so it lands at one address everywhere",
        "Canonical bridges replicate the contract automatically from L1 to each L2",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A view function that checks msg.sender returns the wrong answer when called inside a multicall. Why?",
      options: [
        "aggregate3 strips the from field out of the call object it forwards",
        "eth_call sets msg.sender to the zero address unless from is given",
        "The aggregator contract makes each call, so msg.sender is its address",
        "Each sub-call runs as a delegatecall, which clears the sender",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What does aggregate3 add over the older aggregate and tryAggregate methods?",
      options: [
        "A per-call ETH value, so the batch can carry payable writes",
        "A single allowFailure flag that applies to every call at once",
        "A per-call allowFailure flag, so one revert spares the rest",
        "A per-call gas limit, so one heavy read cannot exhaust the cap",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A multicall of heavy view functions grows until it exceeds the node's eth_call gas cap. How does that surface?",
      options: [
        "As a -32005 limit error naming how many calls were too many",
        "As a partial result, with the calls past the cap marked failed",
        "As an opaque out-of-gas failure rather than a size error",
        "As an HTTP 413 from the node, since the request body is too big",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "One sub-call in an aggregate3 result carries empty returnData. What does that usually indicate?",
      options: [
        "The value read is zero, encoded compactly as an empty word",
        "The node's gas cap cut the sub-call off before it returned",
        "The target has no code, or it reverted without giving a reason",
        "The result was cached, so the node omitted the bytes again",
      ],
      answer: 2,
    },
  ],
  "ens": [
    {
      kind: "detail",
      question: "Where are the address records for an ENS name stored?",
      options: [
        "In the registry contract, alongside the owner and the TTL",
        "In the name's own contract, deployed when it was registered",
        "In a resolver contract, which the registry only points to",
        "Off-chain in every case, fetched through a CCIP-Read gateway",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why must a reverse ENS lookup be confirmed with a forward lookup before it is trusted?",
      options: [
        "Reverse records live on a different chain from forward ones",
        "The namehash of a reverse name is not unique to one address",
        "Anyone can set a reverse record naming any name they like",
        "Reverse resolvers do not implement the addr(bytes32) record",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Your eth_call to an ENS resolver reverts with OffchainLookup. What should the client do?",
      options: [
        "Retry the same call at the finalized tag once the block settles",
        "Fetch from a gateway URL in the revert and call the named callback",
        "Fall back to reading the address record directly from the registry",
        "Treat the name as unregistered, since its resolver reverted",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "How is the namehash that identifies an ENS name computed, per EIP-137?",
      options: [
        "keccak256 of the full name string, lowercased and normalised",
        "From 32 zero bytes, hash in each label's hash from the left",
        "From 32 zero bytes, hash in each label's hash from the right",
        "sha256 of each label in turn, concatenated from left to right",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A dapp running on Base wants to show ENS names for its users. Which endpoint does it resolve them against?",
      options: [
        "Its Base endpoint, since each L2 keeps a registry mirror",
        "Any endpoint, since CCIP-Read gateways resolve on every chain",
        "An Ethereum mainnet endpoint, where the ENS registry lives",
        "Its Base endpoint, through the OP Stack's ENS predeploy",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A site hashes whatever name the user typed, without ENSIP-15 normalisation. What can go wrong?",
      options: [
        "The registry rejects the hash and the call reverts at once",
        "The resolver normalises it on chain, so nothing changes",
        "Two identical-looking names hash to different nodes",
        "The name resolves on L2 endpoints but fails on mainnet",
      ],
      answer: 2,
    },
  ],
  "erc-4337": [
    {
      kind: "scenario",
      question: "You have a userOpHash back from eth_sendUserOperation. Which call tells you whether the operation landed?",
      options: [
        "eth_getTransactionReceipt on any RPC endpoint",
        "eth_getUserOperationReceipt on the bundler",
        "eth_getTransactionByHash on the bundler",
        "eth_supportedEntryPoints on the EntryPoint contract",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "The bundle transaction carrying your UserOperation has receipt status 0x1. What does that establish?",
      options: [
        "That your operation's inner call executed and fully succeeded",
        "That the paymaster accepted the sponsorship and was charged",
        "Only that handleOps ran; your inner call may still have reverted",
        "That validation passed and the inner call was skipped as a dry run",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does EIP-7702 relate to ERC-4337 account abstraction?",
      options: [
        "It replaces bundlers with a protocol-level mempool for UserOperations",
        "It removes the EntryPoint singleton from the ERC-4337 design entirely",
        "It defines the transaction type that bundlers must use to call handleOps",
        "An EOA delegates to contract code and gains smart wallet features",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A client polls eth_getTransactionReceipt with the userOpHash its bundler returned. What does it get?",
      options: [
        "The bundle's receipt, once the operation has been included",
        "Null forever, since that value is not a transaction hash",
        "A -32601 error, since UserOperation receipts need a bundler",
        "A receipt whose status field reflects the operation's inner call",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does an ERC-4337 client ask the bundler with eth_supportedEntryPoints instead of hardcoding one EntryPoint address?",
      options: [
        "Each chain deploys the EntryPoint at a random address at genesis",
        "The EntryPoint is versioned, and its address changes per version",
        "The EntryPoint address rotates every epoch to resist censorship",
        "Bundlers each deploy a private EntryPoint that only they can call",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Where does the next nonce for an ERC-4337 smart account come from?",
      options: [
        "eth_getTransactionCount on the account contract's address",
        "The bundler, which assigns one as operations enter its pool",
        "The paymaster, which tracks nonces for the accounts it funds",
        "The EntryPoint, as a two-part key and sequence value",
      ],
      answer: 3,
    },
  ],
  "local-devnet": [
    {
      kind: "cause",
      question: "Why does a forked Anvil instance keep needing its upstream endpoint while it runs?",
      options: [
        "It replays every block from genesis against the upstream as it runs",
        "It holds no state and fetches accounts, code, and slots on first use",
        "It forwards every transaction it receives on to the upstream chain",
        "It relies on the upstream node to sign the transactions it sends",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "Which job needs the Kurtosis ethereum-package rather than Anvil or a Hardhat simulated network?",
      options: [
        "Impersonating an account whose private key you do not have",
        "Forking mainnet state at one specific historical block number",
        "Testing Engine API behaviour and finality with real client pairs",
        "Mining blocks on demand and moving the clock between test cases",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Your tests pass locally, but the same code races in production. Which devnet property most likely hid the bug?",
      options: [
        "The chain id being 31337, which changes how signatures are checked",
        "Prefunded accounts with balances large enough to never run short",
        "Instant mining, which confirms every transaction with no wait",
        "console.log statements in Solidity changing the order of execution",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Started with no flags, what does Anvil give you?",
      options: [
        "Port 8545, chain id 1, one funded account, 12-second blocks",
        "Port 8551, chain id 31337, no funded accounts, manual mining",
        "Port 8545, chain id 31337, ten funded accounts, instant mining",
        "Port 8546, chain id 1337, twenty funded accounts, 2-second blocks",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A test suite forks mainnet with Anvil but never passes --fork-block-number. What follows?",
      options: [
        "Anvil refuses to start until a fork block number is supplied",
        "Anvil forks from genesis, so it must download the whole chain",
        "Results drift with the upstream head, and cache misses pile up",
        "Anvil forks at finalized, so state lags the head by two epochs",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Application code sends with eth_sendTransaction because the devnet always allowed it. What happens against a hosted provider?",
      options: [
        "It works, since providers sign with a key tied to your API key",
        "It works, but only on testnets that mirror the devnet's setup",
        "It is queued until the account is impersonated on the provider",
        "It is refused, since the provider holds no keys for your accounts",
      ],
      answer: 3,
    },
  ],
  "cli-tools": [
    {
      kind: "detail",
      question: "Which cast subcommand sends an arbitrary method name that has no dedicated wrapper of its own?",
      options: [
        "cast call",
        "cast rpc",
        "cast send",
        "cast run",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A curl request returns HTTP 200, your script treats that as success, and it later fails. What was missed?",
      options: [
        "The node returned status 200 with a completely empty response body",
        "The response was gzip-compressed and never decoded by the script",
        "The body held a JSON-RPC error object, the normal way errors arrive",
        "The id field in the response did not match the one in the request",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why reproduce a suspected library bug with curl against the same endpoint and the same block?",
      options: [
        "curl retries automatically on errors, which libraries do not do",
        "Libraries have no way to pin a block number, so their reads drift",
        "It separates what the node sent from what the library did to it",
        "The node answers raw requests from different state than libraries",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "On a node you operate, what distinguishes geth attach over the IPC socket from calling the HTTP interface?",
      options: [
        "IPC accepts only eth_ reads, while HTTP also serves admin_ and txpool_",
        "IPC requires the Engine API JWT, while HTTP requires only an API key",
        "IPC works from any machine, while HTTP is bound to loopback only",
        "IPC usually exposes admin_ and txpool_, even when HTTP hides them",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "You want to watch newHeads notifications arrive from the command line. What does the lesson suggest?",
      options: [
        "curl, sending eth_subscribe over HTTP and polling once per second",
        "cast run, which streams each new block's trace as it arrives",
        "websocat, holding a WebSocket open for an eth_subscribe frame",
        "geth attach over HTTP, which pushes new heads into its console",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A hand-written curl request leaves out the content-type application/json header. What can happen?",
      options: [
        "The node parses the body as a form and answers with null fields",
        "The node treats it as a batch and answers with an empty array",
        "A proxy or endpoint may reject it before the node ever sees it",
        "Nothing, since nodes ignore the content-type header entirely",
      ],
      answer: 2,
    },
  ],
  "token-standards": [
    {
      kind: "contrast",
      question: "ERC-20 and ERC-721 Transfer logs share the same topic0. How do you tell them apart?",
      options: [
        "They use different topic0 values, despite sharing the same event name",
        "ERC-721 logs come only from contracts that answer ERC-165 queries",
        "ERC-721 logs carry four topics and empty data, ERC-20 logs three",
        "ERC-20 logs carry the token's decimals in an extra fourth topic",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "Using only standard JSON-RPC, how do you get the full list of tokens an address holds?",
      options: [
        "Call eth_getTokenBalances with the address as its only param",
        "Call eth_getLogs with the holder's address as the only filter field",
        "Scan Transfer logs mentioning it, or keep an indexer that does",
        "Call eth_getBalance with each token's address as the block tag",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "A dashboard rebuilds balances by summing Transfer events, and for one token it drifts over time. What is the likely reason?",
      options: [
        "eth_getLogs silently dropped logs whose removed flag was false",
        "The token's Transfer topic0 changed after its contract was upgraded",
        "The token rebases or reflects fees to holders, so logs miss changes",
        "The sums were divided by the token's decimals twice in a row",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What goes in the data field of an eth_call that reads an ERC-20 balanceOf?",
      options: [
        "0x313ce567 plus the holder's address left-padded to 32 bytes",
        "0x70a08231 plus the holder's 20-byte address with no padding",
        "0x70a08231 plus the holder's address left-padded to 32 bytes",
        "0xddf252ad plus the holder's address right-padded to 32 bytes",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A wallet assumes 18 decimals for every token and reads a USDC balance of 1000000 raw units. What does it display?",
      options: [
        "1.00 USDC, since the node converts units using the decimals field",
        "1000000 USDC, since the raw units already count whole tokens here",
        "0.000000000001 USDC, twelve orders of magnitude too small",
        "An error, since balanceOf rejects callers that assume 18 decimals",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "You need a holder's token balance as it stood at a block last month. What do you call?",
      options: [
        "eth_getBalance with the token address and that block number",
        "eth_getLogs for Transfer events, summed up to that block number",
        "balanceOf via eth_call at that block, on a node with that state",
        "balanceOf via eth_call at latest, minus transfers since then",
      ],
      answer: 2,
    },
  ],
  "dapp-architecture": [
    {
      kind: "cause",
      question: "Why can a receipt read null immediately after the wallet reports that a transaction was sent?",
      options: [
        "Receipts are only created once the transaction has been finalized",
        "The wallet broadcast through its own endpoint, and yours is behind",
        "The wallet returned a userOpHash rather than a transaction hash",
        "eth_getTransactionReceipt looks only at blocks at or below finalized",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A dapp's reads go to a hosted RPC provider that needs an API key. Where does the key belong?",
      options: [
        "In the frontend bundle, obscured by minification of the JavaScript",
        "In the wallet's network settings, added via wallet_addEthereumChain",
        "Behind a small backend proxy that allows only the methods you use",
        "In a URL query parameter, which browsers keep out of their logs",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "Which request belongs with an indexer rather than on the dapp's direct RPC read path?",
      options: [
        "Reading a single contract value at the latest block number",
        "Listing every transfer a user has ever made across all tokens",
        "Checking one account's ETH balance at a pinned block height",
        "Fetching one transaction's receipt by its hash after sending",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Before the wallet prompts the user to approve a write, what should the dapp do with the encoded call?",
      options: [
        "Send it with eth_sendRawTransaction to reserve the account's nonce",
        "Trace it with debug_traceCall to price its gas more precisely",
        "Simulate it with eth_call so any revert surfaces before the prompt",
        "Submit it to a private RPC so the wallet cannot see its contents",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "The user switches chains halfway through a flow, and the dapp never re-reads the chain id. What breaks?",
      options: [
        "The wallet cancels any pending signature request automatically",
        "The read endpoint follows the wallet and switches chains too",
        "Its contract addresses now point at the wrong chain's contracts",
        "The indexer re-indexes the new chain from the dapp's last block",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why should questions like a chart of six months of activity be answered by an indexer instead of from the browser?",
      options: [
        "Browsers cannot decode logs, since ABI decoding needs a server",
        "RPC endpoints only keep logs for the most recent 128 blocks",
        "They are wide log scans that most endpoints will cap or refuse",
        "Wallets block eth_getLogs calls made through the injected provider",
      ],
      answer: 2,
    },
  ],

  "erc-165": [
    {
      kind: "detail",
      question: "How is an ERC-165 interface id computed?",
      options: [
        "The keccak256 of the interface name, truncated to four bytes",
        "The XOR of all the function selectors in the interface",
        "The sum of the function selectors, modulo two to the 32",
        "The selector of the interface's first declared function",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "Your indexer calls supportsInterface(0x80ac58cd) on an unknown contract, gets true, and skips the other probes. What can it conclude?",
      options: [
        "That the contract is an ERC-721 collection with metadata",
        "That the contract implements ERC-165 but not ERC-721",
        "That the contract must also support the ERC-1155 id",
        "Nothing yet, since a catch-all fallback also returns true",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why does the detection procedure also ask about 0xffffffff and expect false?",
      options: [
        "To reject contracts whose fallback answers true to any input",
        "To confirm that the contract's storage mapping was initialised",
        "Because 0xffffffff is the id reserved for the ERC-721 standard",
        "Because the second call warms storage and lowers gas for later",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "An eth_call sets gas to 0x7530 to mimic the ERC's 30,000 limit, and the implementation needs 12,000 gas. What happens?",
      options: [
        "It succeeds, because eth_call has no intrinsic transaction cost",
        "It succeeds, because the node silently raises the limit to its cap",
        "It fails out of gas, because intrinsic cost leaves under 9,000",
        "It fails, because the ERC forbids implementations over 10,000",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does probing a contract by calling a function you expect differ from asking supportsInterface?",
      options: [
        "Probing is checked by the node itself; ERC-165 answers by nobody",
        "Probing needs an archive node; ERC-165 works on a pruned node",
        "Probing reads storage directly; ERC-165 runs code in the EVM",
        "Probing shows one call decodes; ERC-165 only reports a claim",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "Your first probe against WETH returns a successful eth_call result of 0x. How should you read it?",
      options: [
        "As false: success with no return data means no ERC-165",
        "As true: any call that does not revert counts as support",
        "As a node fault: a view call cannot return empty data",
        "As unknown: retry against an archive node to decode it",
      ],
      answer: 0,
    },
  ],

  "erc-1271": [
    {
      kind: "scenario",
      question: "A login server verifies signatures with ecrecover alone, and a user signs in from a Safe. What happens?",
      options: [
        "The login succeeds, as the Safe forwards its owner's key to ecrecover",
        "The login succeeds once the Safe's threshold of owners has signed",
        "The login is rejected, as no key recovers to the Safe address",
        "The login succeeds, as ecrecover returns the Safe for owner signatures",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What does a valid isValidSignature answer look like in the eth_call result?",
      options: [
        "0x1626ba7e followed by 28 zero bytes in one 32-byte word",
        "A 32-byte word ending in 01, the ABI encoding of true",
        "The recovered owner address, left-padded to 32 bytes",
        "0xffffffff followed by 28 zero bytes, meaning all checks pass",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "How does ERC-6492 differ from plain ERC-1271 verification?",
      options: [
        "It replaces the magic value with a boolean for simpler decoding",
        "It covers undeployed accounts by wrapping the signature",
        "It moves verification into the node through a new RPC method",
        "It lets EOAs return the magic value without any contract code",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A 7702-delegated EOA signs a message with its own key, and the verifier uses OpenZeppelin's SignatureChecker. When is the valid signature rejected?",
      options: [
        "When the account's nonce has changed since the signature was produced",
        "When the signature's v value is 27 rather than the newer 0 or 1",
        "When the delegation designator is shorter than 23 bytes of code",
        "When the delegate does not implement ERC-1271 for the account's key",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "An eth_call to isValidSignature returns 0x with no error. What does that mean?",
      options: [
        "The signature is valid, since the call did not revert",
        "The address has no code, so fall back to ecrecover",
        "The node pruned the state, so retry on an archive node",
        "The account accepted it but returned the legacy value",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why should a verifier that keeps signatures as evidence store the block number with each result?",
      options: [
        "Because contract signatures expire after 256 blocks under the ERC",
        "Because eth_call results are cached by providers per block",
        "Because the answer depends on account state that changes over time",
        "Because ecrecover output differs between hard forks",
      ],
      answer: 2,
    },
  ],

  "ccip-read": [
    {
      kind: "scenario",
      question: "You curl an eth_call to an offchain ENS resolver and get error code 3 with data starting 0x556f1830. What is going on?",
      options: [
        "The resolver is broken and its gateway is not configured",
        "The node refused the call because it exceeded the gas cap",
        "The name has expired and the registry blocked the lookup",
        "The resolver is asking the client to fetch and call back",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A provider's proxy rewrites every revert to -32000 with no data field. What happens to offchain ENS names for its users?",
      options: [
        "They resolve normally, since libraries retry on a second node",
        "They fail, since the client never sees the OffchainLookup bytes",
        "They resolve, but only to the last address cached by the gateway",
        "They fail, since the gateway rejects requests from that provider",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why must a CCIP-Read client reject a lookup whose sender differs from the contract it called?",
      options: [
        "The gateway signs responses only for the address that called it",
        "The node rewrites sender when a call passes through a proxy",
        "The lookup bubbled up from a nested call and would not complete",
        "The callback would run with the wrong msg.sender and revert",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does a signed-gateway resolver's trust differ from that of an L2 resolver checking storage proofs?",
      options: [
        "The first trusts a stored signing key; the second a posted state root",
        "The first trusts the RPC node itself; the second the ENS registry owner",
        "The first needs an archive node; the second works against any full node",
        "The first is verified by the client; the second by the gateway itself",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "An auditor resolves an offchain name with eth_call pinned to a block from last year. What does the answer reflect?",
      options: [
        "The gateway's current record, since no block reaches the gateway",
        "The record as it stood at the pinned block, via the archive state",
        "The record at the block, because the callback checks its timestamp",
        "The record at the finalized block nearest to the pinned one",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What does the client send to the gateway in a CCIP-Read request?",
      options: [
        "The full eth_call object, including from, gas and the block tag",
        "The signed transaction, so the gateway can simulate it",
        "The caller's address and a signature proving key control",
        "The sender address and callData the contract put in the error",
      ],
      answer: 3,
    },
  ],

  "eip-6963": [
    {
      kind: "scenario",
      question: "A user has two wallet extensions installed and your dapp reads window.ethereum. Which wallet answers?",
      options: [
        "Usually whichever extension happened to load last",
        "Typically the wallet the user most recently unlocked",
        "The wallet that was installed first in the browser",
        "Whichever wallet the browser marks as the default",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "Which info field should a dapp store to remember the user's wallet choice across visits?",
      options: [
        "uuid, since it is a UUIDv4 unique to that wallet",
        "name, since the display label is shown to users",
        "rdns, the reverse-DNS identifier kept stable",
        "icon, since its data URI identifies the wallet",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why does each wallet re-announce itself whenever it sees eip6963:requestProvider?",
      options: [
        "So the dapp can detect which of the wallets the user trusts most",
        "So the wallet can refresh its uuid on every page request",
        "So the browser can rank the wallets by response speed",
        "So discovery works whichever of dapp and wallet loads first",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does EIP-6963 relate to EIP-1193?",
      options: [
        "It replaces request() with events that carry JSON-RPC calls",
        "It finds providers; each found provider still speaks EIP-1193",
        "It adds wallet_ methods that EIP-1193 providers lacked before",
        "It moves provider errors from 4001 codes to DOM exceptions",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "A wallet announces an SVG data URI as its icon. How does the EIP require the dapp to render it?",
      options: [
        "Inline in the page, so it inherits the theme",
        "Converted to PNG first, to fix its resolution",
        "As an image, because an SVG can carry script",
        "Fetched again from the wallet's own website",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A dapp sends requests through a discovered provider but listens for chainChanged on window.ethereum. What goes wrong?",
      options: [
        "It receives each chainChanged event twice from one wallet",
        "It can react to chain switches made in a different wallet",
        "It loses the events, since discovered providers emit none",
        "It triggers a new announcement from every installed wallet",
      ],
      answer: 1,
    },
  ],

  "eip-3009": [
    {
      kind: "scenario",
      question: "Your finance team matches incoming USDC to customers by the transaction's from address, and payments arrive through an x402 facilitator. What do they see?",
      options: [
        "Every payment credited to the payer, as with a normal transfer",
        "Every payment credited to the facilitator that submitted it",
        "No payments at all, since authorizations do not emit Transfer",
        "Payments credited to the payee contract rather than the payer",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What does authorizationState(authorizer, nonce) return true for?",
      options: [
        "A nonce whose validBefore is in the future",
        "A nonce equal to the authorizer's next one",
        "A nonce reserved by a pending transaction",
        "A nonce that has been used or cancelled",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why does EIP-3009 use random 32-byte nonces instead of a sequential counter like ERC-2612?",
      options: [
        "So parallel authorizations settle in any order without conflict",
        "So the nonce can double as the payment amount's hidden commitment",
        "So the token avoids storing any per-account state for the payer",
        "So signatures stay valid across chains that share one address",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A vault's deposit function calls transferWithAuthorization with a user's signature, and an observer copies the signature from the mempool and submits it first. What happens?",
      options: [
        "The tokens go to the observer, who is now the transaction sender",
        "Both transactions succeed and the user pays the amount twice",
        "The tokens reach the vault without its deposit being recorded",
        "Nothing moves, since the vault is the only allowed submitter",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "An x402 client sets validBefore to Date.now() plus 60,000. What is wrong with the authorization?",
      options: [
        "It is too short, so the facilitator cannot settle it in time",
        "It is in seconds, but the contract compares it with block numbers",
        "It is fine, since the contract converts milliseconds to seconds",
        "It is in milliseconds, so it stays valid far longer than intended",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does an ERC-2612 permit differ from a transferWithAuthorization?",
      options: [
        "Permit sets an allowance that still needs a transferFrom call",
        "Permit moves tokens directly, while 3009 only sets an allowance",
        "Permit is signed with personal_sign rather than EIP-712 data",
        "Permit needs the payer to send the transaction and pay its gas",
      ],
      answer: 0,
    },
  ],

  "paymaster": [
    {
      kind: "scenario",
      question: "A wallet receives paymasterData from pm_getPaymasterData, then re-estimates and raises callGasLimit before the user signs. What does submission produce?",
      options: [
        "AA32 paymaster expired or not due, since re-estimating resets validUntil",
        "AA21 didn't pay prefund, since the account now owes the gas",
        "AA34 signature error, since the sponsor signed the old gas fields",
        "No error, because the sponsor's signature excludes gas values",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "Where does the ether that a paymaster spends on sponsored gas come from?",
      options: [
        "Its stake, locked in the EntryPoint behind an unstake delay",
        "Its deposit in the EntryPoint, charged per operation",
        "Its own contract balance, sent to the bundler afterwards",
        "The bundler's beneficiary, reimbursed later off chain",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why must a token paymaster that reads an oracle and settles in postOp be staked before public bundlers accept it?",
      options: [
        "Staking is what grants the EntryPoint permission to call its postOp",
        "The stake is slashed if the token price moves during execution",
        "Bundlers take their fee from the stake rather than the deposit",
        "Unstaked paymasters may not read that storage or return a context",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does a verifying paymaster decide whether to pay, compared with an ERC-20 paymaster?",
      options: [
        "It checks a signature from an off-chain sponsor's policy service",
        "It charges the user in tokens and refunds the excess in postOp",
        "It reads its signer from storage, so it must always be staked",
        "It pays from the account's deposit rather than from its own",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "Under EntryPoint v0.7, a paymaster's postOp reverts after the account's call succeeded. What is the outcome?",
      options: [
        "The account's call stands and the bundler absorbs the gas cost",
        "The whole bundle reverts and none of its operations is included",
        "The account's call is rolled back and the paymaster still pays",
        "The account's call stands and the account's own deposit pays",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A sponsor's service keeps approving operations, but bundlers now reject every one that names its paymaster with error -32508. What has happened?",
      options: [
        "The paymaster was banned by bundlers for returning an oversized context",
        "The sponsor rotated its signing key without redeploying",
        "The bundler's own balance fell below the bundle's gas cost",
        "The deposit no longer covers the paymaster's pending operations",
      ],
      answer: 3,
    },
  ],

  "erc-7562": [
    {
      kind: "cause",
      question: "Why does ERC-7562 restrict what UserOperation validation code may read?",
      options: [
        "So validation costs less gas than the account's execution phase",
        "So one cheap state change cannot invalidate many pooled operations",
        "So the EntryPoint can skip validation when it executes a bundle",
        "So execution code cannot read the storage of other accounts",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A smart account reads block.timestamp inside validateUserOp to expire session keys. What happens when it is sent to a public bundler?",
      options: [
        "It is accepted, because TIMESTAMP is allowed for staked accounts",
        "It is accepted, but bundled only into blocks with a matching time",
        "It is rejected unless the bundler traces with a native Geth tracer",
        "It is rejected; the account should return validUntil instead",
      ],
      answer: 3,
    },
    {
      kind: "detail",
      question: "An already deployed account's validation reads a token contract. Which of that contract's slots may it access without any stake?",
      options: [
        "Any slot, provided every read happens before the first write",
        "Slots whose key is keccak256 of its address plus an offset",
        "Only slots that the token contract exposes through a getter",
        "No slot, since other contracts are off limits in validation",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What distinguishes a bundler running in unsafe mode from one running normally?",
      options: [
        "It submits bundles without first simulating handleOps at all",
        "It accepts only staked paymasters, factories, and aggregators",
        "It traces each operation with the slower JavaScript tracer",
        "It skips the validation trace, so no ERC-7562 rule is checked",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A team points its bundler at a hosted endpoint that accepts only named built-in tracers such as callTracer. What follows?",
      options: [
        "Validation tracing fails, leaving unsafe mode or a node of its own",
        "Tracing works, but each trace is billed like a single eth_call",
        "Operations are accepted but never propagated to peer bundlers",
        "The bundler falls back to trace_call and gets identical results",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What does a paymaster's stake accomplish under ERC-7562?",
      options: [
        "It is slashed whenever the paymaster's operations fail on chain",
        "It pays the gas of the operations that the paymaster sponsors",
        "It makes new identities costly and unlocks wider storage access",
        "It refunds users whose operations the paymaster later rejects",
      ],
      answer: 2,
    },
  ],

  "faucet": [
    {
      kind: "cause",
      question: "Why is testnet ether scarce on a long-lived testnet even though it has no value?",
      options: [
        "New ether reaches just genesis holders and validators as demand grows",
        "The testnet caps its total supply at the genesis allocation permanently",
        "Clients burn testnet ether faster than validators can earn it back",
        "Faucets must buy it from validators at a fixed exchange rate",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What does the hashing in a proof-of-work faucet accomplish?",
      options: [
        "It mines the testnet ether that the faucet then pays out",
        "It helps secure the testnet's consensus alongside validators",
        "It prices each claim in time and electricity to deter bots",
        "It proves the claimant controls the receiving address's key",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A CI pipeline claims Sepolia ether from a public faucet at the start of every run, and runs fail intermittently. What is the better design?",
      options: [
        "Rotate through several faucets so that none of them rate limits it",
        "Request a larger payout so the pipeline has to claim less often",
        "Retry the faucet with exponential backoff until it finally pays",
        "Run the tests on a devnet whose genesis prefunds known keys",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A faucet sends payouts concurrently from one key, and one transfer is stuck below the base fee. What happens to the later payouts?",
      options: [
        "They confirm normally and the stuck one is dropped after a block",
        "They wait behind it, since each needs the next nonce in sequence",
        "They replace the stuck transfer because they pay a higher fee",
        "They fail at once with a nonce too low error from the node",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "How does Ephemery keep its faucets supplied, unlike a long-lived testnet?",
      options: [
        "Its faucets mint ether through a public contract on request",
        "It removes every rate limit so bots cannot drain one address",
        "Each new genesis premines the faucet wallets all over again",
        "Its validators donate their rewards to the faucets each epoch",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A user asks a faucet to pay a smart account whose receive function runs code, and the payout fails. What is the likely reason?",
      options: [
        "The faucet sends plain transfers with a 21,000 gas limit",
        "Faucets can pay only addresses that have sent a transaction",
        "Contract accounts cannot hold testnet ether in the first place",
        "The faucet signs for a different chain id than the account uses",
      ],
      answer: 0,
    },
  ],

  "kurtosis": [
    {
      kind: "contrast",
      question: "What can a Kurtosis ethereum-package network exercise that Anvil cannot?",
      options: [
        "Forking mainnet state at a chosen block number",
        "Impersonating an account whose key you do not hold",
        "Finality and behaviour across different real clients",
        "Mining a block on demand between two test steps",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "In the ethereum-package args file, what does one participant entry pair together?",
      options: [
        "An execution client type and a consensus client type",
        "A chain id and the hard fork epoch that activates on it",
        "A relay and the block builder that submits to it",
        "A validator key file and its withdrawal address",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "You need the JSON-RPC URL of the first Nethermind node in the enclave fork-test. What gives it to you?",
      options: [
        "Port 8545 on localhost, which every enclave service shares",
        "The rpc_url field that the args file sets per participant",
        "kurtosis port print with the EL service name and port id rpc",
        "A second kurtosis run of the same file with a print flag",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An args file leaves every client image on latest. What goes wrong over time?",
      options: [
        "The same file tests different client versions from week to week",
        "The package refuses to start at all until every image tag is pinned",
        "Genesis is regenerated with a different chain id on each run",
        "Latest images ignore the fork epochs set in network_params",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What does setting gloas_fork_epoch to the maximum uint64 value do?",
      options: [
        "Activates Gloas at genesis together with every earlier fork",
        "Lets each client pick its own Gloas activation epoch",
        "Activates Gloas as soon as the first epoch finalises",
        "Schedules Gloas so far out that it never activates",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why must the package's prefunded genesis keys never hold value on a public network?",
      options: [
        "They are regenerated at random for each enclave and then lost",
        "They are published in the package source for anyone to read",
        "They sign with the devnet chain id, which mainnet rejects",
        "They belong to the validators and are slashed if reused",
      ],
      answer: 1,
    },
  ],

  "chainlist": [
    {
      kind: "detail",
      question: "Where does chainlist.org get its base chain data?",
      options: [
        "From each chain team's own node, queried on every page load",
        "From the Ethereum Foundation's list of approved EVM networks",
        "From ethereum-lists/chains, aggregated at chainid.network",
        "From wallets reporting the networks their users have added",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A dapp calls wallet_addEthereumChain and the request resolves with null. What can it conclude?",
      options: [
        "The wallet has switched to the new network and will sign for it",
        "The RPC URL it passed has been verified as honest by the wallet",
        "The user declined, since null signals that the request failed",
        "The chain was added; whether it is now selected is unknown",
      ],
      answer: 3,
    },
    {
      kind: "cause",
      question: "Why does EIP-3085 tell wallets to sign with the chain id in the request rather than one reported by the endpoint?",
      options: [
        "A faulty or hostile endpoint can report some other chain's id",
        "An endpoint's eth_chainId goes stale after every network upgrade",
        "Endpoints return net_version, which is not the EIP-155 value",
        "Reading the request is cheaper than making another RPC call",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "What does a chainlist tracking label of none tell you about an endpoint?",
      options: [
        "That chainlist has audited the operator's logging practices",
        "That the endpoint routes every request through a private relay",
        "That the operator claims not to track, and nobody has verified it",
        "That the endpoint discards IP addresses at the network layer",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "Two private networks pick the same chain id, and one of them registers it in ethereum-lists. What does the registry entry establish?",
      options: [
        "That the other network's transactions are now invalid everywhere",
        "That one team claimed the number in the registry first",
        "That the registered operator controls the id on every wallet",
        "That wallets will refuse to add the unregistered network",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "Before offering a public RPC URL taken from the registry, your code sends eth_chainId to it. Why is that check worth making?",
      options: [
        "Registry entries can be dead or can serve the wrong network",
        "It warms the endpoint's cache before the wallet connects to it",
        "Wallets refuse any URL that has never answered a request",
        "It registers the dapp's origin with the endpoint's operator",
      ],
      answer: 0,
    },
  ],

  "dex-pool-reads": [
    {
      kind: "scenario",
      question: "A bot prices a large Uniswap v3 swap from slot0 and liquidity alone, and the result is far from what the swap returns. What did it leave out?",
      options: [
        "The pool's reserves, which getReserves would have returned",
        "Liquidity changes at the initialized ticks the trade crosses",
        "The Sync event the pool emitted at the end of the last block",
        "The fee tier, which slot0 reports only for the latest swap",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "Where does an off-chain client read the slot0 of a Uniswap v4 pool?",
      options: [
        "From the pool's own contract address, through a slot0 getter",
        "From the hook contract named in the pool's key",
        "From PoolManager storage, through extsload or StateView",
        "From the most recent Initialize event for that pool id",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does keeping pool state current by mirroring events differ in cost from polling every pool on each head?",
      options: [
        "Mirroring cost grows with trading activity, polling with pool count",
        "Mirroring needs an archive node, while polling works on any full node",
        "Mirroring reads raw storage slots, while polling replays the Sync logs",
        "Mirroring is free of reorg handling, while polling must undo old blocks",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why can a Curve StableSwap quote change between two blocks in which nobody traded with that pool?",
      options: [
        "Its balances accrue interest at every new block",
        "Its fee is recomputed from the base fee each block",
        "Its get_dy answer is cached for a single block only",
        "Its amplification A ramps with the block timestamp",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A mirror applies logs from a subscription but ignores entries whose removed flag is true. What happens after a reorg?",
      options: [
        "It double-counts the next Sync event the pool emits",
        "It keeps pool state from a block that is no longer canonical",
        "It loses the pool's token addresses until it restarts",
        "It stops receiving logs until the subscription is renewed",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "An app reads twenty pools with twenty separate latest calls through a load balancer and combines them into one route price. What is the risk?",
      options: [
        "Each call is charged the gas cap of a full multicall",
        "The balancer merges the calls and drops all but one",
        "The latest tag resolves to finalized behind a balancer",
        "The reads can come from nodes at different heights",
      ],
      answer: 3,
    },
  ],

  "quoter-contract": [
    {
      kind: "scenario",
      question: "A developer sees QuoterV2's functions marked nonpayable and sends quoteExactInputSingle as a real transaction. What is the outcome?",
      options: [
        "It stores the quote so later reads can fetch it cheaply",
        "It spends gas and leaves neither a quote nor any state",
        "It executes the swap and delivers tokens to the sender",
        "It is rejected, because quoters only accept an eth_call",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What does a successful eth_call to QuoterV2's quoteExactInputSingle hand back to the caller?",
      options: [
        "Ordinary return data with amount, price, ticks and gas",
        "A JSON-RPC error whose data field holds the quote bytes",
        "An empty 0x result, with the quote emitted as an event",
        "A revert reason string that must be parsed into numbers",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "How do V4Quoter and QuoterV2 differ when a pool cannot fill the whole exact-input amount?",
      options: [
        "V4Quoter returns a partial fill; QuoterV2 reverts with an error string",
        "Both revert, though only V4Quoter names the pool id in the error it raises",
        "V4Quoter reverts, citing NotEnoughLiquidity; QuoterV2 returns a partial fill",
        "Both return zero output and a gas estimate of zero for the pool",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why does a Balancer v3 query revert with NotStaticCall when the eth_call sets from to the user's address?",
      options: [
        "The router refuses calls that come from externally owned accounts",
        "The query needs a signature from the account named in from",
        "The Vault rejects any caller that has not approved its tokens",
        "The Vault checks that tx.origin is the zero address before quoting",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A wallet uses the gasEstimate from a quoter as the gas limit of the user's swap transaction. What should it expect?",
      options: [
        "Out-of-gas failures, since intrinsic and router costs are missing",
        "Overpayment, since the quoter adds a safety margin to every estimate",
        "Rejection by the node, since quoter estimates are not valid limits",
        "No change at all, since the estimate already covers the whole swap",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does Uniswap's smart-order-router quote v3 routes through QuoterV2 rather than from pool state it has read?",
      options: [
        "Off-chain math cannot reproduce the rounding of v3 fees",
        "Quoter calls cost nothing when sent inside a multicall",
        "Off-chain quoting would need every pool's full tick data",
        "Providers refuse eth_getStorageAt on Uniswap pool contracts",
      ],
      answer: 2,
    },
  ],

  "dex-aggregator": [
    {
      kind: "scenario",
      question: "An aggregator simulates the router call for a user who has not approved the router, and the plain eth_call reverts with STF. What does the engine add before trusting the route?",
      options: [
        "A higher gas limit so the token transfer has room to finish",
        "A pending block tag so the user's approval is counted",
        "State overrides for the taker's balance and allowance slots",
        "A signed approval broadcast just before the simulation runs",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why do quote engines keep a cached graph of pool state instead of reading every pool when a request arrives?",
      options: [
        "Pool contracts refuse eth_call from addresses without balances",
        "Route search touches far more pools than round trips allow in time",
        "Cached state is more accurate than state read at the chain head",
        "Providers do not allow eth_call to read DEX pools at the latest block",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What does the 0x Swap API report when the taker holds too little of the sell token?",
      options: [
        "An HTTP 402 error with no quote in the response",
        "A quote whose price includes a shortfall surcharge",
        "A revert string copied from the router contract",
        "A balance entry inside the issues object it returns",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A provider silently drops the third parameter of eth_call. What does the aggregator's verification report for a user who has no funds yet?",
      options: [
        "A revert that funding the user would have avoided",
        "A JSON-RPC error saying overrides are unsupported",
        "A success, since the node defaults balances to max",
        "A gas estimate equal to the node's whole gas cap",
      ],
      answer: 0,
    },
    {
      kind: "contrast",
      question: "How does an RFQ quote differ from an AMM route in an aggregator's answer?",
      options: [
        "It is read from pool storage and holds until the next swap there",
        "It is a market maker's signed price only the taker can fill",
        "It is computed on chain by a quoter at the requested block",
        "It is a path through several pools priced in one multicall",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "An engine pins its reads to the newest block number through a load-balanced endpoint and now and then receives header not found. What is happening?",
      options: [
        "The newest block was reorged out and its header deleted",
        "The provider prunes headers older than its gas cap window",
        "The block number was sent as decimal rather than hex",
        "A backend one block behind does not have that block yet",
      ],
      answer: 3,
    },
  ],

  "price-oracle": [
    {
      kind: "scenario",
      question: "A lending contract accepts the mainnet Chainlink ETH/USD answer whenever updatedAt is less than four hours old. What does that limit allow?",
      options: [
        "It rejects good prices that arrive between heartbeats",
        "It accepts prices up to about three hours past stale",
        "It reverts whenever the sequencer uptime feed reads 1",
        "It trusts answeredInRound instead of the round number",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "A service wants an event every time the ETH/USD feed updates. Which address should its logs subscription target?",
      options: [
        "The proxy address, since that is what consumers call",
        "The Multicall3 address used to batch the feed reads",
        "The aggregator address the proxy currently points to",
        "The sequencer uptime feed address on the same chain",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does a pull oracle such as Pyth differ from a push feed such as Chainlink Data Feeds?",
      options: [
        "The user's transaction carries a signed update it fetched",
        "Nodes write an update whenever a deviation trigger fires",
        "The price is averaged on chain from a pool's tick history",
        "A bonded claim stands unless disputed within a window",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does Chainlink's sample L2 consumer refuse prices for a grace period after the sequencer comes back?",
      options: [
        "The uptime flag takes an hour to cross the L1 bridge",
        "Oracle nodes need an hour to restart their OCR rounds",
        "The proxy has to be repointed to a fresh aggregator",
        "Users need time to fix positions before liquidations",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "A dashboard calls observe([86400, 0]) on a Uniswap v3 pool whose observation buffer covers about six hours. What happens?",
      options: [
        "It quietly returns a six-hour average instead",
        "It reverts, because the window predates the buffer",
        "It returns zero ticks for the eighteen missing hours",
        "It grows the buffer and charges the caller the gas",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "An analyst must check whether a liquidation two years ago used a fair Chainlink price. What does the RPC side need?",
      options: [
        "A pending-tag call to latestRoundData on any full node",
        "A logs subscription on the feed's proxy from now onward",
        "An archive read of the feed at the liquidation's block",
        "A fresh signed update fetched from Hermes for that day",
      ],
      answer: 2,
    },
  ],

  "keeper": [
    {
      kind: "detail",
      question: "What does Chainlink's cannotExecute modifier check so that checkUpkeep can run only as a simulation?",
      options: [
        "That msg.value is zero for the call being simulated",
        "That the gas price matches the current block's base fee",
        "That msg.sender is the registered Automation forwarder",
        "That tx.origin is the zero address, as in an eth_call",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A keeper's endpoint is three blocks behind. checkUpkeep reports a vault as due that another keeper harvested two blocks ago. What happens to the perform transaction?",
      options: [
        "It reverts or does nothing, and the keeper still pays gas",
        "The node refuses to broadcast it as a duplicate of a job",
        "It harvests the vault a second time using stale performData",
        "It waits in the pool until the endpoint catches up again",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why must performUpkeep validate performData again instead of trusting it?",
      options: [
        "performData is encrypted and must be decoded from storage",
        "The registry truncates performData beyond a fixed size",
        "Anyone can call it, and state can change while it waits",
        "Nodes compute performData at the finalized block only",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "Fifty jobs are each checked with one eth_call per block on an OP Stack chain with 2-second blocks. About how many calls is that per day?",
      options: [
        "About 360,000, the same load as on mainnet",
        "About 2,160,000, six times the mainnet load",
        "About 43,200, one call per block in total",
        "About 7,200, since checks run once per slot",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A PoolTogether claimer's claimPrizes call reverts with VrgdaClaimFeeBelowMin. What most likely happened?",
      options: [
        "The draw's claim window had already closed for good",
        "The winners array and the prize indices array did not match",
        "The prize pool had not yet awarded the latest draw",
        "Other claimers got in first and the fee per claim fell",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "After Chainlink moved Automation users to CRE, how does an existing checkUpkeep contract get served?",
      options: [
        "A workflow repeats the check off-chain and sends a signed report",
        "The check moves into the contract and runs on chain in every block",
        "The check becomes a bonded assertion with a dispute window",
        "The check now needs an archive node and historical replay",
      ],
      answer: 0,
    },
  ],

  "transaction-simulation": [
    {
      kind: "scenario",
      question: "On mainnet, a preview built from eth_simulateV1 shows nothing moving for a call that withdraws ether to the user. What was most likely left out?",
      options: [
        "The traceTransfers flag in the request",
        "A state override for the user's balance",
        "The validation flag in the request",
        "A pending block as the base block",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why can a contract tell that it is running inside a plain eth_call simulation sent without fee fields?",
      options: [
        "The node sets block.number to zero during every eth_call",
        "The EVM exposes a simulation flag through a dedicated opcode",
        "eth_call strips the value from any call that carries one",
        "tx.gasprice reads zero, which no real mainnet transaction has",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "What does prestateTracer in diff mode give a simulator that eth_call's return data does not?",
      options: [
        "The ABI-decoded return value of the outermost call",
        "Before-and-after values of every field that changed",
        "A guarantee that inclusion will match the simulation",
        "The final gas price the transaction will end up paying",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A wallet previews a swap returning 1,256 USDC, and the real transaction fills near the user's minimum. What explains it with no bug anywhere?",
      options: [
        "The preview ran on an archive node at an old block",
        "traceTransfers inflated the amount in the preview",
        "Other transactions moved the pool before it executed",
        "The node applied a state override from another wallet",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A user is asked to sign an ERC-2612 permit with eth_signTypedData_v4. Why does simulating the request as a transaction show nothing?",
      options: [
        "Signing moves nothing; the spender submits it later",
        "Typed data runs only against the pending block state",
        "Permits execute inside the wallet, outside the EVM",
        "Token contracts hide permit effects from all tracers",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "How does MetaMask's Added protection option keep the outcome equal to the preview?",
      options: [
        "It submits through a private RPC endpoint",
        "It re-simulates at pending just before sending",
        "It holds the pool's price fixed for one block",
        "It checks on chain and reverts on any mismatch",
      ],
      answer: 3,
    },
  ],

  "nft-marketplace": [
    {
      kind: "cause",
      question: "Why do marketplace databases accumulate listings that can no longer be filled?",
      options: [
        "Seaport deletes filled orders only after a dispute period ends",
        "Listings are signatures, so state changes without touching them",
        "Nodes prune order data from storage after a fixed block count",
        "Cancelled orders stay valid until the marketplace reindexes",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A Seaport listing uses OpenSea's conduit key. Your check calls isApprovedForAll(seller, Seaport) and gets false. What should you conclude?",
      options: [
        "The listing is invalid and should be hidden from the page now",
        "The seller cancelled every order by incrementing the counter",
        "The check asked about the wrong operator for this kind of order",
        "The signature is stale, because approvals expire every block",
      ],
      answer: 2,
    },
    {
      kind: "detail",
      question: "What does Seaport's getOrderStatus return for an order hash?",
      options: [
        "isValidated, isCancelled, totalFilled and totalSize",
        "The offerer, its counter, the start time and the end time",
        "The conduit key, the zone, the salt and the signature",
        "The item's owner, its approval flag and the asking price",
      ],
      answer: 0,
    },
    {
      kind: "scenario",
      question: "A marketplace calls royaltyInfo on a collection that never implemented ERC-2981 and records garbage as the royalty. What should it have done first?",
      options: [
        "Read the royalty from the tokenURI metadata file instead",
        "Called ownerOf to confirm the creator still holds a token",
        "Asked Seaport for the royalty recorded in the order hash",
        "Probed supportsInterface with the ERC-2981 interface id",
      ],
      answer: 3,
    },
    {
      kind: "consequence",
      question: "An indexer builds holder tables from ERC-721 Transfer logs only, and a collection minted its supply with ERC-2309. What happens?",
      options: [
        "The tokens appear twice, once per Transfer and once per batch",
        "The tokens are missing, since the mint emitted ConsecutiveTransfer",
        "The tokens appear with the zero address recorded as their current owner",
        "The tokens appear normally, because ERC-2309 also emits Transfer",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "An indexer needs the price a token sold for, not just its change of owner. Where does it find the price?",
      options: [
        "In the Transfer event's data field, which carries the payment",
        "In the tokenURI metadata, which records the last traded price",
        "In the royaltyInfo answer, which echoes the sale price it saw",
        "In Seaport's OrderFulfilled log from the same transaction",
      ],
      answer: 3,
    },
  ],

  "governance-voting-power": [
    {
      kind: "consequence",
      question: "A dapp passes block number 26,000,000 to getPastVotes on a token whose clock counts seconds. What does it get?",
      options: [
        "A revert, because the timepoint lies beyond the current clock",
        "Weights as of block 26,000,000, converted by the token itself",
        "Weights from late 1970, before any checkpoint, so zero for all",
        "Weights from the newest checkpoint, since the input is clamped",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "A front end shows a voter's weight on an ERC20Votes proposal as balanceOf at the snapshot block. The voter never delegated. What is wrong?",
      options: [
        "Nothing, since a balance at the snapshot equals its votes there",
        "The weight is doubled, because balance and votes are added up",
        "Undelegated tokens carry no votes, so the real weight is zero",
        "The weight is current, because balanceOf ignores block tags",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does the input to a typical Snapshot strategy differ from what an on-chain Governor reads?",
      options: [
        "It reads checkpoints from the token, so it needs no old state",
        "It reads votes at latest and subtracts transfers since the start",
        "It reads storage proofs, so every ballot is verified on-chain",
        "It reads ordinary balances at the snapshot block, from old state",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "An Aave holder casts a vote on a voting network other than Ethereum. What must someone have fetched from an Ethereum node for that vote to count?",
      options: [
        "An eth_getProof of the voter's slots at the snapshot block",
        "An eth_call of getPastVotes at the current Ethereum head",
        "A trace of the voter's last transfer before the snapshot",
        "A signed balance statement from the voter's RPC provider",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does getPastVotes answer for a months-old timepoint on a node that is not an archive node?",
      options: [
        "The token stores checkpoints in current state and searches them",
        "The node replays the token's transfers to rebuild the balance",
        "The Governor caches each voter's weight when a proposal opens",
        "The view call makes the node fetch archive state on its own",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "What does CLOCK_MODE return for a token whose checkpoints are keyed by timestamp?",
      options: [
        "mode=blocknumber&from=default",
        "mode=timestamp",
        "mode=blocknumber&from=eip155:1",
        "mode=seconds&from=default",
      ],
      answer: 1,
    },
  ],

  "erc-4626": [
    {
      kind: "detail",
      question: "How is a vault's APY computed from two convertToAssets readings?",
      options: [
        "Divide later by earlier, then annualise by their block timestamps",
        "Subtract earlier from later, then divide by the number of blocks",
        "Divide totalAssets by totalSupply at the later block on its own",
        "Average both readings, then compare them with the asset's price",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does ERC-4626 have a vault round down the shares it issues for a deposit?",
      options: [
        "So that share counts always fit inside a 128-bit storage slot",
        "So that deposits and redemptions return identical amounts",
        "So that rounding favours the vault and no user can drain it",
        "So that preview results match the conversion views exactly",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "An attacker deposits 1 unit into an empty USDC vault, then transfers 10,000 USDC to it directly. What happens to a victim's 9,999 USDC deposit?",
      options: [
        "It mints 9,999 shares at the original one-to-one exchange rate",
        "It reverts, because the vault detects the direct transfer first",
        "It mints half the shares, and the vault keeps the donation",
        "It mints zero shares, and the attacker's one share takes it",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A dashboard prices shares of a Morpho Vault V2 USDC vault as convertToAssets(10^6). What does it display?",
      options: [
        "The correct price, because shares mirror the asset's decimals",
        "A price far too small, because the shares use 18 decimals",
        "A revert, because convertToAssets rejects inputs below 1e18",
        "The price after fees, because a small input triggers preview",
      ],
      answer: 1,
    },
    {
      kind: "contrast",
      question: "What separates previewRedeem from convertToAssets?",
      options: [
        "previewRedeem ignores fees and reports the idealised rate",
        "previewRedeem changes with the caller, convertToAssets never",
        "previewRedeem rounds up, while convertToAssets rounds down",
        "previewRedeem includes fees and reflects current conditions",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "An integrator sees maxDeposit return zero on a vault that is accepting deposits from every address. What is the likely explanation?",
      options: [
        "The vault returns zero by design, a permitted underestimate",
        "The vault is paused, and deposits will revert until resumed",
        "The receiver is blocked, while other addresses can deposit",
        "The node is pruned, so the view reads an empty storage slot",
      ],
      answer: 0,
    },
  ],

  "fork-testing": [
    {
      kind: "scenario",
      question: "A fork test pinned to a block from last month fails at its very first state read. What is the most likely cause?",
      options: [
        "The local EVM cannot run contracts deployed before a hard fork",
        "The upstream is a pruned node that no longer has that state",
        "The fork cache expired, and Foundry refuses to fetch it again",
        "The test runner needs the debug namespace to read any storage",
      ],
      answer: 1,
    },
    {
      kind: "consequence",
      question: "A team reproduces an exploit by forking at the exploit transaction's own block number. What state do they start from?",
      options: [
        "The state before the exploit, because forks start at the parent",
        "The state after the exploit, because that whole block already ran",
        "An error, because a fork cannot start at a block containing an exploit",
        "The state midway through the block, at the exploit's own index",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why does Foundry name the fork block by its hash in the state reads it sends upstream?",
      options: [
        "So that requests pass the provider's rate limiter unchecked",
        "So that the fork can read old state from a pruned upstream",
        "So that one request returns the balance, nonce and code",
        "So that an upstream reorg cannot change state under a test",
      ],
      answer: 3,
    },
    {
      kind: "scenario",
      question: "A test funds an account with tenderly_setErc20Balance, and the app's indexer never shows the deposit. Why?",
      options: [
        "The method needs a mined block before the balance is visible",
        "The method writes the balance slot and emits no Transfer event",
        "The indexer ignores hosted forks until they finish syncing",
        "The method funds ether only, so token balances stay at zero",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What does cast run do before it executes the target transaction?",
      options: [
        "Forks at the target block and runs the same transaction once more",
        "Fetches the receipt and rebuilds the trace from its logs",
        "Forks at the parent block and replays earlier block transactions",
        "Sends the transaction to a private pool and waits for a result",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "When is a fork the better tool than one eth_call with state overrides?",
      options: [
        "When a sequence of transactions or impersonation has to run",
        "When a single read must be answered in a single request",
        "When the endpoint must not learn which contract is called",
        "When the answer must reflect the network's newest block",
      ],
      answer: 0,
    },
  ],

  "erc-6492": [
    {
      kind: "scenario",
      question: "A sign-in backend calls isValidSignature on a user's address and gets 0x back, and the signature's last 32 bytes are 0x6492 repeated. What should it conclude?",
      options: [
        "The account is not deployed yet and must be checked by simulating its factory call",
        "The signer is an ordinary externally owned account, so ecrecover alone should decide",
        "The signature was made for another chain and cannot be verified on this one",
        "The wallet rejected the message, because 0x is how a contract returns false",
      ],
      answer: 0,
    },
    {
      kind: "cause",
      question: "Why does the ERC-6492 magic suffix end in the byte 0x92?",
      options: [
        "It encodes the ERC number so tooling can look the standard up",
        "It is not a valid v value, so it cannot collide with an ECDSA signature",
        "It marks the end of the ABI-encoded tuple, so that decoders know where to stop",
        "It tells the verifier which factory interface the calldata targets",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "What does the reference ValidateSigOffchain contract return to the eth_call that runs it?",
      options: [
        "The deployed account's runtime bytecode when the check passes",
        "The ERC-1271 magic value 0x1626ba7e padded with zero bytes",
        "One byte, 0x01 for a valid signature and 0x00 for an invalid one",
        "The recovered signer address, left-padded to a 32-byte word",
      ],
      answer: 2,
    },
    {
      kind: "contrast",
      question: "How does verifying an ERC-6492 signature differ from a plain ERC-1271 check?",
      options: [
        "It needs a state-changing factory call, so it runs as creation code in a call",
        "It replaces isValidSignature with ecrecover over the factory's own address",
        "It needs the account's private key, so only the wallet itself is able to perform it",
        "It skips eth_call and reads the owner key directly with eth_getStorageAt",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "An account signed a wrapped message before deployment, was then deployed, and later rotated its owners. What happens when the old wrapped signature is verified today?",
      options: [
        "It still verifies, because the wrapper pins the owners at signing time",
        "It fails, because the verifier now asks the live contract and its owners",
        "It still verifies, because wrapped signatures are checked against the factory",
        "It fails, because a deployed account rejects every wrapped signature",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "A verifier built on the ERC-6492 reference validator gets a plain 65-byte ECDSA signature from an EIP-7702 delegated account whose delegate has no isValidSignature. What is the outcome?",
      options: [
        "It passes, because the validator tries ecrecover first for 65-byte inputs",
        "It passes, because a 23-byte designator counts as an account with no code",
        "It fails with ERC6492DeployFailed, since the validator runs a factory first",
        "It fails with a revert, because code at the address keeps it off ecrecover",
      ],
      answer: 3,
    },
  ],

  "x402": [
    {
      kind: "scenario",
      question: "A client receives an x402 requirement with amount 10000 and a USDC asset on Base. How much is it being asked to pay?",
      options: [
        "10,000 USDC, because amounts are written in whole tokens",
        "0.01 USDC, because amounts are in the token's smallest unit",
        "10,000 wei of ETH, because the amount covers settlement gas",
        "0.0001 USDC, because amounts are given in hundredths of a cent",
      ],
      answer: 1,
    },
    {
      kind: "detail",
      question: "In x402 version 2 over HTTP, where does the client put its signed payment?",
      options: [
        "In the request body, as a JSON field named x402Payment",
        "In an Authorization header, as a bearer token for a session",
        "In a PAYMENT-SIGNATURE header, as base64-encoded JSON",
        "In a PAYMENT-REQUIRED header, as a hex EIP-712 signature",
      ],
      answer: 2,
    },
    {
      kind: "cause",
      question: "Why does the reference facilitator reject a payment whose asset address has no code?",
      options: [
        "A call to an empty address succeeds and returns nothing, so the simulation passes",
        "An address with no code cannot hold balances, so the payer's funds would be lost",
        "EIP-3009 forbids tokens created with CREATE2, which an empty address implies",
        "Gas estimation fails on empty addresses, so the settlement cannot be priced",
      ],
      answer: 0,
    },
    {
      kind: "consequence",
      question: "A facilitator broadcasts the settlement, but its wait for the receipt times out. What does the version 2 spec let it return?",
      options: [
        "A success response, since the authorization had already been verified",
        "invalid_transaction_state, so the client signs a fresh authorization",
        "A 500 error with no hash, since nothing is known until a receipt arrives",
        "settlement_pending with the hash, so the caller can reconcile on chain",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does the upto scheme differ from exact on EVM chains?",
      options: [
        "It uses EIP-3009 with a longer window so settlement can happen later",
        "It lets the facilitator raise the amount if gas prices rise meanwhile",
        "It settles a metered amount up to a signed maximum, through Permit2",
        "It batches many exact payments into one transfer at session end",
      ],
      answer: 2,
    },
    {
      kind: "scenario",
      question: "An RPC gateway paid through x402 settles a separate onchain transfer for every eth_blockNumber call. What problem does this design run into?",
      options: [
        "EIP-3009 nonces run out after a few thousand authorizations per payer",
        "Facilitators refuse amounts below one cent on every supported network",
        "JSON-RPC batch requests cannot carry the header, so every batch fails",
        "Each settlement can cost more gas than the request it is paying for",
      ],
      answer: 3,
    },
  ],

  "onchain-agents": [
    {
      kind: "scenario",
      question: "An agent reads a token whose symbol() returns USDC and whose name() tells the model to send funds to a new address. What actually protects the agent?",
      options: [
        "A token allowlist by address and a spending policy enforced outside the model",
        "Checking that symbol() returns USDC again before each transfer the model proposes",
        "Reading the token's name at the finalized tag rather than at latest",
        "Asking the model to confirm that the instruction came from its operator",
      ],
      answer: 0,
    },
    {
      kind: "detail",
      question: "In the Model Context Protocol, how does a model's host invoke a tool that wraps eth_call?",
      options: [
        "It sends eth_call to the node directly, with the tool name in the id field",
        "It sends a tools/call request that names the tool and passes its arguments",
        "It posts the tool's inputSchema to the node's RPC port as a batch request",
        "It opens an eth_subscribe stream and sends the arguments as a filter",
      ],
      answer: 1,
    },
    {
      kind: "cause",
      question: "Why is a limited key, such as a session key scoped to one contract and an amount, the real safety boundary for a model-driven agent?",
      options: [
        "Session keys make transactions cheaper, which removes the reason to attack",
        "Bundlers reject UserOperations whose calldata was produced by a model",
        "A session key hides the agent's address, so attackers cannot target it",
        "A model does not reliably tell instructions from data, so a prompt is no limit",
      ],
      answer: 3,
    },
    {
      kind: "contrast",
      question: "How does an Olas service built with Open Autonomy differ from a single-key agent?",
      options: [
        "Its agents send unsigned transactions that the Olas network signs for them",
        "Its agents act only through x402 payments and never send transactions",
        "A threshold of its agent instances signs a Safe transaction a keeper sends",
        "Its agents run inside the EVM, so they read state without any RPC calls",
      ],
      answer: 2,
    },
    {
      kind: "consequence",
      question: "A guard simulates the agent's transfer at latest and it succeeds. What can still go wrong?",
      options: [
        "Nothing, since a call at latest is exactly the state the transaction meets",
        "State can change before inclusion, so the real transaction behaves otherwise",
        "The simulation spends the agent's gas, so the real transaction runs out of funds",
        "The node records the simulation, so the real one is rejected as a replay",
      ],
      answer: 1,
    },
    {
      kind: "scenario",
      question: "Two processes of one agent sign with the same key, and each reads its next nonce from eth_getTransactionCount at the same moment. What happens?",
      options: [
        "Both pick the same nonce, so one transaction replaces or blocks the other",
        "The node assigns distinct nonces itself, since both came from one key",
        "Both are mined in order, because nonces are tracked per signing process",
        "The second is refused, because a key may have one pending transaction",
      ],
      answer: 0,
    },
  ],
};
