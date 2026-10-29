// Category: Wallets & tooling — how wallets, libraries, and developer tools
// sit on top of RPC.

export const topics = [
  {
    id: "eip-1193",
    title: "EIP-1193 provider",
    category: "tooling",
    aliases: ["window.ethereum", "injected provider", "provider api", "accountsChanged", "chainChanged"],
    summary: "EIP-1193 is the JavaScript interface a browser wallet injects into a page, offering one `request({ method, params })` method that returns a promise plus a small set of events, so a web application speaks [[json-rpc|JSON-RPC]] without ever choosing a node.",
    sections: [
      {
        heading: "The interface",
        paragraphs: [
          "A conforming provider exposes exactly one call: `request({ method, params })`, returning a promise that resolves with the JSON-RPC `result` or rejects with a `ProviderRpcError` carrying `code`, `message`, and optional `data`. The method names are the ordinary ones — [[eth-call|eth_call]], [[eth-get-balance|eth_getBalance]], [[eth-send-transaction|eth_sendTransaction]] — plus the wallet-only [[wallet-rpc|wallet_ methods]]. Parameters keep the same [[hex-encoding|hex encoding]] as the wire protocol, so a page still passes `0x1` rather than `1`.",
          "EIP-1193 defines its own error codes on top of the standard [[rpc-errors|JSON-RPC ones]]: `4001` when the user rejects a request, `4100` when the method needs an authorization the page does not have, `4200` when the wallet does not support the method, and `4900` or `4901` when the provider is disconnected from all chains or from the requested chain. Code `4001` is the one every dapp must handle, because a user dismissing a signature prompt is normal, not an outage.",
        ],
      },
      {
        heading: "Events",
        paragraphs: [
          "The provider is an event emitter. `accountsChanged` fires with the new array of permitted addresses, which is empty when the user disconnects the site. `chainChanged` fires with the new [[chain-id|chain id]] as a hex string, and the specification recommends simply reloading the page rather than trying to migrate state. `connect` fires with a `{ chainId }` object when the provider first becomes able to serve requests, `disconnect` with an error when it cannot, and `message` delivers [[eth-subscribe|subscription]] notifications when the wallet supports them. A dapp that subscribes to none of these will keep showing balances from a chain the user left minutes ago.",
        ],
      },
      {
        heading: "Who actually answers",
        paragraphs: [
          "The provider is not a node. The wallet splits incoming requests: anything that touches a key or the user's consent — signing, sending, permissions, chain switching — it answers itself with a prompt, and everything else it forwards to whichever [[rpc-provider|RPC endpoint]] it is configured with. You do not choose that endpoint, you do not know its [[rate-limits|rate limits]], and you cannot assume it supports tracing, historical state, or wide [[eth-get-logs|eth_getLogs]] ranges.",
          "That is why serious applications use two paths: the injected provider for signing and sending, and their own endpoint or an [[indexer|indexer]] for reads. It also means the wallet's view of the head and your own endpoint's view can differ by a block, so a transaction the wallet just sent may not be visible to your reads yet; see [[head-lag|head consistency]] and [[dapp-architecture|dapp architecture]].",
        ],
      },
      {
        heading: "Finding the right provider",
        paragraphs: [
          "For years every wallet wrote itself to `window.ethereum`, so the last extension to load won and users with two wallets could not choose. [[eip-6963|EIP-6963]] fixes that with an announcement protocol: the page dispatches an `eip6963:requestProvider` event, each wallet responds with `eip6963:announceProvider` carrying its provider object and an `info` record holding `uuid`, `name`, `icon`, and a reverse-DNS `rdns` identifier, and the page presents a list. New code should discover providers this way and treat `window.ethereum` only as a fallback.",
        ],
      },
    ],
    example: {
      title: "Connecting and reacting to changes",
      language: "js",
      code: "// discovery: collect every announced wallet, not just window.ethereum\nconst wallets = new Map(); // uuid -> { info, provider }\nwindow.addEventListener('eip6963:announceProvider', (e) => {\n  wallets.set(e.detail.info.uuid, e.detail);\n  renderWalletPicker([...wallets.values()]); // a wallet that loads late just joins the list\n});\nwindow.dispatchEvent(new Event('eip6963:requestProvider'));\n\n// runs when the user picks a wallet, so it never reads an empty list\nasync function connect({ provider }) {\n  try {\n    const accounts = await provider.request({ method: 'eth_requestAccounts' });\n    const chainId = await provider.request({ method: 'eth_chainId' }); // '0x1'\n    console.log(accounts[0], chainId);\n  } catch (err) {\n    if (err.code === 4001) return; // user dismissed the prompt; not an error\n    throw err;\n  }\n\n  provider.on('chainChanged', () => window.location.reload());\n  provider.on('accountsChanged', (accounts) => {\n    if (accounts.length === 0) signOut();\n  });\n}",
      note: "Choosing the provider when the user picks one, not straight after dispatching the request, keeps a wallet that injects late from breaking the page. `eth_requestAccounts` prompts; `eth_accounts` does not and returns an empty array until the user has granted access.",
    },
    pitfalls: [
      "Treating error code `4001` as a failure to retry; the user declined, and re-prompting immediately is how sites get blocked by wallets.",
      "Reading `window.ethereum` and assuming it is the wallet the user wants; with two extensions installed it is whichever one loaded last.",
      "Caching the chain id once at startup; the user can switch networks at any moment, and only `chainChanged` tells you.",
      "Routing bulk reads through the injected provider; you inherit the wallet's endpoint, its limits, and its unknown feature set.",
    ],
    related: ["wallet-rpc", "signing-methods", "dapp-architecture", "client-libraries", "json-rpc", "chain-id", "rpc-errors", "eth-send-transaction", "head-lag", "eip-6963"],
    sources: [
      { title: "EIP-1193: Ethereum Provider JavaScript API", url: "https://eips.ethereum.org/EIPS/eip-1193" },
      { title: "EIP-6963: Multi Injected Provider Discovery", url: "https://eips.ethereum.org/EIPS/eip-6963" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "wallet-rpc",
    title: "wallet_ methods",
    category: "tooling",
    aliases: ["eth_requestAccounts", "wallet_switchEthereumChain", "wallet_addEthereumChain", "wallet_watchAsset", "wallet_sendCalls", "4902"],
    summary: "The `wallet_` methods, together with `eth_requestAccounts`, are answered by the wallet itself rather than by a node: they request account access, switch or add a chain, track an asset, manage per-site permissions, and submit batched calls.",
    sections: [
      {
        heading: "The methods and their EIPs",
        paragraphs: [
          "`eth_requestAccounts` (EIP-1102) prompts the user and resolves with the addresses the site may use. `wallet_switchEthereumChain` (EIP-3326) takes `[{ \"chainId\": \"0x1\" }]` and asks the wallet to move the site to that chain; if the wallet does not know it, the request rejects with code `4902`. `wallet_addEthereumChain` (EIP-3085) supplies the missing definition: `chainId`, `chainName`, `rpcUrls`, `nativeCurrency`, and `blockExplorerUrls`. `wallet_watchAsset` (EIP-747) asks the user to display a token in their wallet, which is a UI action and not a transaction.",
          "`wallet_getPermissions` and `wallet_requestPermissions` (EIP-2255) expose the site's capabilities as objects rather than a bare account list, which is how a wallet models 'this origin may see these accounts'. EIP-5792 adds `wallet_getCapabilities`, `wallet_sendCalls`, `wallet_getCallsStatus`, and `wallet_showCallsStatus`: the site hands over an array of calls, the wallet returns an identifier, and the site polls for status. On an account that supports it the batch lands atomically, which removes the approve-then-swap two-prompt dance.",
        ],
      },
      {
        heading: "Why a node never sees them",
        paragraphs: [
          "A node has no user, no interface, and no accounts belonging to anyone. Nothing in the [[execution-apis|execution APIs spec]] defines a `wallet_` method, so posting one to an HTTP endpoint returns [[rpc-errors|error]] `-32601`, method not found. These calls exist only across the [[eip-1193|EIP-1193 provider]] boundary, where a human can approve them. The same is true of the account-granting half of [[signing-methods|signing]]: the wallet holds the key and decides.",
          "The consequence is that 'connected' is a permission the user grants per origin and can revoke from the wallet at any time. `eth_accounts` can start returning an empty array between two of your calls, and a site that treats the first successful connection as permanent will keep rendering a signed-in interface for a user who is no longer connected.",
        ],
      },
      {
        heading: "Patterns that work",
        paragraphs: [
          "Always try the switch first and fall back to add, because most users already have the common chains. Never call `wallet_addEthereumChain` unprompted with your own RPC URL; you are asking the user to route all their traffic for that [[chain-id|chain id]] through an endpoint you control. After any switch, re-read `eth_chainId` rather than trusting the call to have succeeded, since the user may have approved a different network in the prompt.",
          "For batching, probe `wallet_getCapabilities` before offering the feature: support depends on the account type, not just the wallet, and an [[erc-4337|smart account]] or an [[eip-7702|EIP-7702 delegated EOA]] is usually what makes it possible. Treat the identifier from `wallet_sendCalls` as a wallet-level handle, not a [[transaction|transaction]] hash.",
        ],
      },
    ],
    example: {
      title: "Switch to a chain, adding it only if the wallet does not know it",
      language: "js",
      code: "const OP_MAINNET = '0xa'; // chain id 10\n\ntry {\n  await provider.request({\n    method: 'wallet_switchEthereumChain',\n    params: [{ chainId: OP_MAINNET }],\n  });\n} catch (err) {\n  if (err.code !== 4902) throw err;   // 4902 = wallet does not know this chain\n  await provider.request({\n    method: 'wallet_addEthereumChain',\n    params: [{\n      chainId: OP_MAINNET,\n      chainName: 'OP Mainnet',\n      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },\n      rpcUrls: ['https://l2.rpc.example'],\n      blockExplorerUrls: ['https://explorer.example'],\n    }],\n  });\n}\n\nconst now = await provider.request({ method: 'eth_chainId' }); // verify, do not assume",
      note: "Code `4902` is the documented signal that the chain is unknown; every other code should propagate.",
    },
    pitfalls: [
      "Sending a `wallet_` method to an HTTP RPC URL; the node answers `-32601` because these methods live in the wallet, not the chain.",
      "Assuming a resolved `wallet_switchEthereumChain` means you are on the requested chain; re-read `eth_chainId` afterwards.",
      "Calling `wallet_addEthereumChain` for a chain the user already has, which overwrites nothing but does train users to approve network prompts.",
      "Offering batched calls without checking `wallet_getCapabilities`; support depends on the account, not only on the wallet.",
    ],
    related: ["eip-1193", "signing-methods", "dapp-architecture", "chain-id", "erc-4337", "eip-7702", "rpc-errors", "client-libraries", "paymaster", "chainlist"],
    sources: [
      { title: "EIP-3326: wallet_switchEthereumChain", url: "https://eips.ethereum.org/EIPS/eip-3326" },
      { title: "EIP-3085: wallet_addEthereumChain", url: "https://eips.ethereum.org/EIPS/eip-3085" },
      { title: "EIP-5792: Wallet Call API", url: "https://eips.ethereum.org/EIPS/eip-5792" },
    ],
  },
  {
    id: "signing-methods",
    title: "Signing methods",
    category: "tooling",
    aliases: ["personal_sign", "eth_sign", "eth_signTypedData_v4", "eth_accounts", "EIP-191"],
    summary: "Signing methods ask a key holder, almost always a wallet, to produce a [[ecdsa-signature|signature]] over a message rather than to send a [[transaction|transaction]]: `personal_sign` for text, `eth_signTypedData_v4` for structured data, and the deprecated `eth_sign` for a raw hash.",
    sections: [
      {
        heading: "The four methods",
        paragraphs: [
          "`eth_accounts` returns the addresses the site is already permitted to use and never prompts; it answers with an empty array until [[wallet-rpc|eth_requestAccounts]] has been approved. `personal_sign` takes `[message, address]` and signs the EIP-191 digest, which is `keccak256` of the prefix `\\x19Ethereum Signed Message:\\n` plus the message length plus the message. That prefix is the whole point: a prefixed digest can never collide with a valid transaction, so the signature cannot be replayed as one.",
          "`eth_signTypedData_v4` takes `[address, typedDataJson]` and signs an [[eip-712|EIP-712]] structure, which lets the wallet display named fields instead of a hex blob. `eth_sign` takes `[address, hash]` and signs 32 arbitrary bytes with no prefix at all — those bytes could be a transaction hash, so a site that obtains one can move the user's funds. Wallets have disabled it, hidden it behind a warning, or removed it entirely, and no new code should use it.",
        ],
      },
      {
        heading: "Why a node should not expose personal_",
        paragraphs: [
          "The `personal_` [[namespaces|namespace]] exists in [[execution-client|execution clients]] for local key management: import a key, unlock an account, sign with it. A node with an unlocked account plus an exposed HTTP port is a wallet with no password, and thousands were drained that way. [[geth|Geth]] deprecated the namespace in favour of the external signer clef and later removed it; where it still exists it must never be reachable from outside the machine. See [[security|RPC security]].",
          "That separation is why a browser wallet implements these methods locally instead of forwarding them. A public endpoint answers `personal_sign` with `-32601` or a disabled-method [[rpc-errors|error]], which is the correct behaviour, not a misconfiguration.",
        ],
      },
      {
        heading: "Verifying what you get back",
        paragraphs: [
          "A signature is 65 bytes: `r`, `s`, and a `v` of 27 or 28. Recovering the signer means rebuilding the exact digest the wallet signed and running `ecrecover`; get the prefix or the encoding wrong and you recover a valid-looking but meaningless [[address|address]]. [[smart-contract|Smart contract]] accounts cannot produce ECDSA signatures at all, so their signatures are verified by calling the account's `isValidSignature(bytes32,bytes)` from [[erc-1271|ERC-1271]] with [[eth-call|eth_call]] and checking for the magic return value `0x1626ba7e`. Any login flow that must work for [[erc-4337|smart accounts]] needs that branch.",
          "Treat a signature as proof of key control, nothing more. Sign-in flows need a server-issued nonce, an origin or domain, and an expiry inside the signed message, or the same signature can be replayed by whoever captured it.",
        ],
      },
    ],
    example: {
      title: "personal_sign over the wallet provider",
      language: "js",
      code: "const [account] = await provider.request({ method: 'eth_accounts' });\n\n// note the order: message first, address second\nconst signature = await provider.request({\n  method: 'personal_sign',\n  params: ['Sign in to example.app\\nnonce: 8f3c2a1b\\nexpires: 2026-09-17T12:00:00Z', account],\n});\n// -> '0x9b2e…1c' (65 bytes: r, s, v)\n\n// eth_sign is the reverse order AND signs raw bytes with no prefix. Do not use it.\n// await provider.request({ method: 'eth_sign', params: [account, '0x…32 bytes'] });",
      note: "The nonce and expiry in the message are what stop the signature from being replayed later.",
    },
    pitfalls: [
      "Swapping the parameter order; `personal_sign` is `[message, address]` while the deprecated `eth_sign` is `[address, hash]`, and the mistake silently fails or signs the wrong thing.",
      "Verifying with `ecrecover` alone and rejecting smart contract accounts, which need the [[erc-1271|ERC-1271]] `isValidSignature` call instead.",
      "Accepting a signature as authentication without a server-issued nonce, an origin, and an expiry, which makes it replayable forever.",
      "Passing an already-hashed value to `personal_sign`; the wallet prefixes and hashes again, so the digest is not what the contract expects.",
    ],
    related: ["eip-712", "eip-1193", "wallet-rpc", "ecdsa-signature", "erc-4337", "security", "namespaces", "eth-call", "erc-1271", "erc-6492"],
    sources: [
      { title: "EIP-191: Signed Data Standard", url: "https://eips.ethereum.org/EIPS/eip-191" },
      { title: "ERC-1271: Standard Signature Validation for Contracts", url: "https://eips.ethereum.org/EIPS/eip-1271" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "eip-712",
    title: "EIP-712 typed data",
    category: "tooling",
    aliases: ["typed data", "signTypedData", "domain separator", "permit", "ERC-2612", "structured signing"],
    summary: "EIP-712 defines how to hash and sign a structured object so the wallet can display named fields and a [[smart-contract|contract]] can recompute the same digest, binding the signature to one chain, one contract, and one message shape.",
    sections: [
      {
        heading: "What it fixes",
        paragraphs: [
          "Signing a hex blob asks a user to approve something they cannot read, and signing plain text gives a contract nothing it can parse. EIP-712 splits the difference: the application submits a JSON document with a type definition, and the wallet renders each field with its name and value before asking for approval. The same document hashes deterministically, so the contract can verify the signature against exactly the values the user saw.",
        ],
      },
      {
        heading: "How the digest is built",
        paragraphs: [
          "The final digest is `keccak256(0x19 0x01 || domainSeparator || hashStruct(message))`. The domain separator is itself a hashed struct with `name`, `version`, `chainId`, and `verifyingContract`, plus an optional `salt`. Because the [[chain-id|chain id]] and the contract [[address|address]] are inside the digest, a signature produced for one deployment cannot be replayed against the same contract on another chain, and a signature for one contract is useless to another.",
          "`hashStruct` of a value is `keccak256(typeHash || encodeData(value))`, where the type hash is [[keccak-256|keccak256]] of the canonical type string such as `Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)`. Fixed-size fields are encoded as 32 bytes each; strings and bytes are replaced by their hashes; nested structs are replaced by their own `hashStruct`; arrays by the hash of the concatenated encodings. Referenced struct types are appended in alphabetical order, which is the rule people most often get wrong when computing a type hash by hand.",
        ],
      },
      {
        heading: "Over RPC and on-chain",
        paragraphs: [
          "The wallet method is `eth_signTypedData_v4`, with params `[address, typedData]`, where most wallets expect the typed data as a JSON string rather than an object. The document holds `types` (including the `EIP712Domain` entry), `primaryType`, `domain`, and `message`. Every [[client-libraries|client library]] has a helper that builds and stringifies it for you; see [[signing-methods|signing methods]] for how this sits beside `personal_sign`.",
          "The canonical use is ERC-2612 `permit`: a token approval signed off-chain and submitted by someone else, which saves the user a [[transaction|transaction]] and lets a [[transaction-relayer|relayer]] pay the [[gas|gas]]. The same pattern underlies order signing on exchanges and [[eip-3009|meta-transactions]]. On-chain the contract recomputes the digest and calls `ecrecover`, so any mismatch in the domain, the type string, or the field order yields a different [[address|address]] and a failed check rather than a helpful error.",
        ],
      },
    ],
    example: {
      title: "A permit as typed data",
      language: "json",
      code: "{\n  \"types\": {\n    \"EIP712Domain\": [\n      { \"name\": \"name\", \"type\": \"string\" },\n      { \"name\": \"version\", \"type\": \"string\" },\n      { \"name\": \"chainId\", \"type\": \"uint256\" },\n      { \"name\": \"verifyingContract\", \"type\": \"address\" }\n    ],\n    \"Permit\": [\n      { \"name\": \"owner\", \"type\": \"address\" },\n      { \"name\": \"spender\", \"type\": \"address\" },\n      { \"name\": \"value\", \"type\": \"uint256\" },\n      { \"name\": \"nonce\", \"type\": \"uint256\" },\n      { \"name\": \"deadline\", \"type\": \"uint256\" }\n    ]\n  },\n  \"primaryType\": \"Permit\",\n  \"domain\": {\n    \"name\": \"USD Coin\",\n    \"version\": \"2\",\n    \"chainId\": 1,\n    \"verifyingContract\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\"\n  },\n  \"message\": {\n    \"owner\": \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\n    \"spender\": \"0x1111111254EEB25477B68fb85Ed929f73A960582\",\n    \"value\": \"1000000\",\n    \"nonce\": 0,\n    \"deadline\": 1789000000\n  }\n}",
      note: "This whole document is the second parameter of `eth_signTypedData_v4`, usually passed as a JSON string.",
    },
    pitfalls: [
      "Building the domain with a hardcoded chain id; after the user switches networks the signature verifies nowhere.",
      "Omitting the `EIP712Domain` entry from `types`, which some wallets tolerate and others reject outright.",
      "Passing the typed data as an object where the wallet expects a JSON string, which fails with an unhelpful parameter error.",
      "Reordering fields between the front end and the contract's type string; the type hash changes and recovery silently returns the wrong address.",
    ],
    related: ["signing-methods", "eip-1193", "abi", "keccak-256", "ecdsa-signature", "smart-contract", "chain-id", "erc-4337", "eip-3009", "nft-marketplace"],
    sources: [
      { title: "EIP-712: Typed structured data hashing and signing", url: "https://eips.ethereum.org/EIPS/eip-712" },
      { title: "ERC-2612: Permit extension for ERC-20", url: "https://eips.ethereum.org/EIPS/eip-2612" },
      { title: "viem: signing typed data", url: "https://viem.sh/" },
    ],
  },
  {
    id: "client-libraries",
    title: "Client libraries",
    category: "tooling",
    aliases: ["viem", "ethers.js", "web3.js", "web3.py", "alloy", "Nethereum", "ethclient", "wagmi"],
    summary: "A client library wraps [[json-rpc|JSON-RPC]] in the idioms of a language: it encodes and decodes [[abi|ABI]] data, manages transports and retries, fills in fee and [[gas|gas]] defaults, and turns hex strings into native numbers and typed objects.",
    sections: [
      {
        heading: "What they add over raw RPC",
        paragraphs: [
          "Four things, mostly. ABI handling: turning `balanceOf(address)` and an argument into calldata for [[eth-call|eth_call]] and decoding the 32-byte answer, and parsing [[event-log|logs]] into named fields. Transport: connection pooling, [[batch-request|batching]], [[retries|retries]], and failover across endpoints. Type conversion: [[hex-encoding|hex QUANTITY]] to `BigInt` or `decimal`, checksummed [[address|addresses]], [[wei|wei and gwei]] helpers. And workflow: building a [[transaction|transaction]] with a nonce and [[eip-1559|EIP-1559]] fees, signing it, and waiting for a [[transaction-receipt|receipt]] with a confirmation count.",
        ],
      },
      {
        heading: "The JavaScript options",
        paragraphs: [
          "viem is the current default for new TypeScript code: small, tree-shakeable, explicit about which action hits which method, with types derived from the ABI so a typo in a function name is a compile error. It splits a public client for reads from a wallet client for signing, and wagmi builds React hooks on top of it. ethers.js is the long-standing alternative, organised around `Provider`, `Signer`, and `Contract` objects, with a larger surface and a gentler learning curve. web3.js is the oldest of the three and is no longer the recommended starting point; new projects generally choose one of the other two.",
        ],
      },
      {
        heading: "Other languages",
        paragraphs: [
          "web3.py is the Python standard, with a middleware stack you can insert caching or retry logic into, and a contract object built from an ABI. alloy is the current Rust library from the ethers-rs lineage, where the `sol!` macro generates types straight from a Solidity signature or ABI file. Nethereum covers .NET and generates typed contract classes from an ABI, which is how [[nethermind|Nethermind]]-adjacent tooling is usually written. go-ethereum ships `ethclient`, a thin wrapper that speaks RPC using the client's own types, paired with `abigen` for contract bindings — thin enough that it is often the clearest way to see what a method really returns.",
        ],
      },
      {
        heading: "What they hide",
        paragraphs: [
          "Defaults are where surprises live. Most libraries read at `latest` unless told otherwise, so two reads in one function can land on different [[block-tag|blocks]]. Many retry automatically, which is harmless for reads and means a 'failed' [[eth-send-raw-transaction|eth_sendRawTransaction]] may have landed anyway. Some apply a multiplier to [[eth-estimate-gas|eth_estimateGas]], some batch silently, and error normalisation can turn a [[revert|revert]] with useful `data` into a generic exception.",
          "None of that is wrong, but it means a library's behaviour is not evidence of the node's. When an answer looks impossible, reproduce it with [[cli-tools|curl or cast]] against the same endpoint and block before blaming the node; the raw response settles the argument in one call.",
        ],
      },
    ],
    example: {
      title: "The same read in three libraries",
      language: "js",
      code: "// viem\nimport { createPublicClient, http } from 'viem';\nconst client = createPublicClient({ transport: http('https://rpc.example') });\nconst bal = await client.readContract({\n  address: '0xA0b8…eB48', abi, functionName: 'balanceOf',\n  args: ['0xd8dA…6045'], blockNumber: 21000000n,   // pin the block\n});\n\n// ethers v6\nimport { JsonRpcProvider, Contract } from 'ethers';\nconst provider = new JsonRpcProvider('https://rpc.example');\nconst token = new Contract('0xA0b8…eB48', abi, provider);\nconst bal2 = await token.balanceOf('0xd8dA…6045', { blockTag: 21000000 });\n\n// what actually goes over the wire, in both cases\n// {\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\n//  \"params\":[{\"to\":\"0xA0b8…eB48\",\"data\":\"0x70a08231000…6045\"},\"0x1406f40\"]}",
      note: "Both libraries produce one `eth_call`; passing an explicit block is what makes the result reproducible.",
    },
    pitfalls: [
      "Letting every read default to `latest` and then comparing the results; pin a block number when two values must belong to the same snapshot.",
      "Trusting a library's error text instead of the JSON-RPC error; revert `data` is often dropped or reshaped on the way up.",
      "Assuming a thrown send means nothing was broadcast; automatic retries and lost responses both leave a valid transaction in flight, so look it up by hash.",
      "Debugging library behaviour by reading library source when one raw `curl` against the same endpoint would show what the node returned.",
    ],
    related: ["json-rpc", "abi", "cli-tools", "eip-1193", "dapp-architecture", "multicall", "retries", "hex-encoding", "eth-call", "batch-request"],
    sources: [
      { title: "viem documentation", url: "https://viem.sh/" },
      { title: "ethers.js documentation", url: "https://docs.ethers.org/" },
      { title: "web3.py documentation", url: "https://web3py.readthedocs.io/" },
    ],
  },
  {
    id: "multicall",
    title: "Multicall",
    category: "tooling",
    aliases: ["Multicall3", "aggregate3", "batch reads", "0xcA11bde05977b3631167028862bE2a173976CA11"],
    summary: "Multicall is a [[smart-contract|contract]] that executes an array of calls inside a single [[eth-call|eth_call]], so many reads come back as one consistent snapshot at one [[block|block]] instead of as many separate requests.",
    sections: [
      {
        heading: "One request, many reads",
        paragraphs: [
          "The caller [[abi|ABI]]-encodes each sub-call, packs them into an array of `(target, callData)` pairs, and sends one `eth_call` to the multicall contract. The contract loops, forwards each payload, collects the return data, and gives it back as an array the caller decodes per sub-call. Everything runs in one [[evm|EVM]] execution against one state, which is the property that matters: thirty token balances read this way all belong to the same block, with no chance of the head moving between them.",
          "Multicall3 is the de facto deployment, at `0xcA11bde05977b3631167028862bE2a173976CA11` on Ethereum and, thanks to deterministic deployment, at that same [[address|address]] on most L2s and testnets. That makes it safe to hardcode across chains, and it is why [[client-libraries|client libraries]] can turn ordinary contract reads into aggregated calls without any configuration from you.",
        ],
      },
      {
        heading: "aggregate3 and friends",
        paragraphs: [
          "The method to use is `aggregate3`, which takes `(address target, bool allowFailure, bytes callData)[]` and returns `(bool success, bytes returnData)[]`. The per-call `allowFailure` flag is the improvement over the older `aggregate`, where one [[revert|revert]] destroys the whole batch, and `tryAggregate`, where the flag applies to all calls at once. `aggregate3Value` adds a per-call ETH `value` for the rare case of batching writes. The contract also exposes small helpers — `getBlockNumber`, `getCurrentBlockTimestamp`, `getEthBalance`, `getBasefee` — so a batch can carry its own proof of which block it ran against.",
        ],
      },
      {
        heading: "Versus a JSON-RPC batch",
        paragraphs: [
          "A [[batch-request|JSON-RPC batch]] is N requests in one HTTP round trip: N separate executions, each resolving `latest` independently, each counted against [[rate-limits|rate limits]], each with its own error. Multicall is one request, one execution, one block, one shared [[gas|gas]] budget, and one error surface. Use a batch when the calls are different methods, such as a block plus a [[transaction-receipt|receipt]]; use multicall when they are all reads at one block.",
          "The limits come from that shared budget. Every sub-call draws on the node's `eth_call` gas cap, so a few hundred cheap reads are fine and a batch of heavy view functions will hit it; split and retry when it does. Response size caps apply too. And because the contract is the caller, `msg.sender` inside every sub-call is the multicall address, which quietly breaks any function that reads it.",
        ],
      },
    ],
    example: {
      title: "Two balances in one eth_call",
      language: "json",
      code: "// aggregate3 with two ERC-20 balanceOf calls, both allowFailure: true\n{\n  \"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"eth_call\",\n  \"params\": [\n    {\n      \"to\": \"0xcA11bde05977b3631167028862bE2a173976CA11\",\n      \"data\": \"0x82ad56cb0000…70a08231000…6045…70a08231000…6045\"\n    },\n    \"0x1406f40\"\n  ]\n}\n\n// result: one hex blob decoding to [(true, 0x…0f4240), (true, 0x…00)]\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x0000…\"}",
      note: "Pinning the block number rather than passing `latest` is what makes the snapshot reproducible on a retry.",
    },
    pitfalls: [
      "Leaving `allowFailure` false and losing the whole batch because one address turned out not to be a contract.",
      "Growing the batch until it exceeds the node's `eth_call` gas cap, which surfaces as an opaque out-of-gas rather than a size error.",
      "Batching calls that read `msg.sender`; inside a multicall the sender is the multicall contract, not your account.",
      "Treating an empty `returnData` as a zero value; it usually means the target had no code or reverted without a reason.",
    ],
    related: ["eth-call", "batch-request", "abi", "client-libraries", "token-standards", "rate-limits", "block-tag", "smart-contract", "dex-pool-reads", "deployless-call", "keeper", "portfolio-tracker"],
    sources: [
      { title: "Multicall3 repository", url: "https://github.com/mds1/multicall3" },
      { title: "viem: multicall", url: "https://viem.sh/" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "ens",
    title: "ENS resolution",
    category: "tooling",
    aliases: ["namehash", "resolver", "reverse record", "vitalik.eth"],
    summary: "ENS resolution turns a name such as `vitalik.eth` into an [[address|address]] or other record by hashing the name, asking a registry [[smart-contract|contract]] which resolver owns it, and reading the record from that resolver — all through ordinary [[eth-call|eth_call]] requests.",
    sections: [
      {
        heading: "The data model",
        paragraphs: [
          "Every name is identified by its namehash, a recursive [[keccak-256|keccak256]] defined in EIP-137: start from 32 zero bytes and, for each label from the right, hash the previous result with the hash of that label. The result is a `bytes32` node. The ENS registry at `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e` maps each node to an owner, a resolver address, and a TTL, and it stores nothing else — records live in the resolver contract, which is why different names can behave very differently.",
          "Resolvers implement whatever record types they choose: `addr(bytes32)` for the classic address, `text(bytes32,string)` for key-value metadata such as an avatar or a URL, and `contenthash` for a site. Names must be normalised before hashing, following ENSIP-15, or two visually identical strings produce two different nodes.",
        ],
      },
      {
        heading: "Forward and reverse over RPC",
        paragraphs: [
          "Forward resolution is two reads: `eth_call` the registry's `resolver(node)` to find the resolver, then `eth_call` that resolver's `addr(node)`. A Universal Resolver contract collapses both into one call and handles the newer wildcard and [[ccip-read|offchain paths]], which is what [[client-libraries|client libraries]] use behind `getEnsAddress` or `resolveName`. Reverse resolution goes the other way: namehash `<address without 0x>.addr.reverse`, read `name(node)`, and then forward-resolve the answer and check that it points back at the same address. Skipping that second step lets anyone set a reverse record claiming to be someone else.",
          "ENS's registry lives on Ethereum mainnet, so resolving a name from an L2 means querying mainnet, not the local chain; testnets such as Sepolia run a separate ENS deployment of their own. Names also change: records are mutable and registrations expire, so cache a resolution for minutes, not forever.",
        ],
      },
      {
        heading: "CCIP-Read for offchain names",
        paragraphs: [
          "Many subdomain systems keep their records off-chain. [[ccip-read|EIP-3668]] defines how: the resolver deliberately reverts with an `OffchainLookup` error naming gateway URLs and a callback, and the client fetches the data from a gateway and calls that callback with the response so the contract can verify it. A plain `eth_call` from curl therefore looks like a failed call — the [[revert|revert]] is the protocol, not an error, and only a client that implements the flow will resolve the name.",
        ],
      },
    ],
    pitfalls: [
      "Trusting a reverse record without forward-resolving it back to the same address; reverse records are self-declared.",
      "Hashing a raw user-typed name without ENSIP-15 normalisation, which produces a different node for lookalike characters.",
      "Resolving against whichever chain the user is on; the registry is on mainnet, so L2 dapps need a mainnet endpoint for names.",
      "Reading an `OffchainLookup` revert as a broken resolver; it is EIP-3668 asking the client to fetch from a gateway and call back.",
    ],
    related: ["eth-call", "keccak-256", "smart-contract", "client-libraries", "abi", "revert", "dapp-architecture", "address", "erc-165", "ccip-read"],
    sources: [
      { title: "ENS documentation", url: "https://docs.ens.domains/" },
      { title: "EIP-137: Ethereum Domain Name Service", url: "https://eips.ethereum.org/EIPS/eip-137" },
      { title: "EIP-3668: CCIP Read", url: "https://eips.ethereum.org/EIPS/eip-3668" },
    ],
  },
  {
    id: "erc-4337",
    title: "Account abstraction (ERC-4337)",
    category: "tooling",
    aliases: ["UserOperation", "bundler", "EntryPoint", "smart account", "eth_sendUserOperation", "ERC-7769"],
    summary: "ERC-4337 adds account abstraction without changing the protocol: users sign UserOperations instead of [[transaction|transactions]], bundlers collect them into one call to a singleton EntryPoint [[smart-contract|contract]], and the account contract decides what a valid signature is.",
    sections: [
      {
        heading: "The pieces",
        paragraphs: [
          "A UserOperation is a struct, not a transaction: it names a `sender` account contract, a nonce, the `callData` to execute, several gas limits, fee fields, an optional paymaster, and a `signature` whose meaning is entirely up to the account. Users submit them to a bundler, which keeps a separate pool outside the node's [[mempool|transaction pool]], and periodically sends one ordinary transaction calling `handleOps` on the EntryPoint singleton. The EntryPoint loops over the batch, asks each account to [[erc-7562|validate]], then executes each call, refunding the bundler from the account's deposit or from a [[paymaster|paymaster]].",
          "That indirection is what buys the features: signatures that are not secp256k1, [[onchain-agents|session keys]], social recovery, spending limits, and gas paid in tokens or sponsored entirely by a paymaster. The EntryPoint is versioned and its [[address|address]] changes between versions, so a client asks the bundler with `eth_supportedEntryPoints` rather than hardcoding one.",
        ],
      },
      {
        heading: "The bundler RPC",
        paragraphs: [
          "Bundlers expose five methods that look like node methods but are not; ERC-7769, the draft bundler RPC specification, also has them answer `eth_chainId` and, in testing mode only, a `debug_bundler_` namespace. `eth_sendUserOperation` takes the operation and an EntryPoint address and returns a `userOpHash`. `eth_estimateUserOperationGas` returns `preVerificationGas`, `verificationGasLimit`, and `callGasLimit`, plus `paymasterVerificationGasLimit` when the operation names a [[paymaster|paymaster]], and accepts a [[state-override|state override set]] as `eth_call` does. `eth_getUserOperationByHash` and `eth_getUserOperationReceipt` retrieve it once mined, the latter reporting `success`, `actualGasCost`, and the enclosing [[transaction-receipt|receipt]]. `eth_supportedEntryPoints` lists which versions the bundler serves.",
          "None of these exist on an [[execution-client|execution client]], so sending them to a normal endpoint returns `-32601`. A bundler URL and an RPC URL are different endpoints, even when a [[rpc-provider|provider]] sells both behind similar-looking hostnames.",
        ],
      },
      {
        heading: "What differs from a transaction",
        paragraphs: [
          "A `userOpHash` is not a transaction hash. [[eth-get-transaction-receipt|eth_getTransactionReceipt]] with one returns `null` forever; poll `eth_getUserOperationReceipt` instead. Inclusion is not success either: the bundle transaction can succeed while your operation's inner call reverted, so check the `success` field rather than the receipt `status`. Nonces come from the EntryPoint as a two-dimensional key and sequence pair, so [[eth-get-transaction-count|eth_getTransactionCount]] on the account tells you nothing useful.",
          "EIP-7702, live since Pectra, overlaps from the other direction: an existing EOA can delegate its code to a contract, and [[eth-get-code|eth_getCode]] then returns the 23-byte designator `0xef0100` followed by that contract's address. The two are complementary, and the Final ERC-4337 lists EIP-7702 among its requirements — 4337 infrastructure can serve delegated EOAs, and [[eip-7702|set code transactions]] give plain accounts batching and sponsorship without deploying a new one.",
        ],
      },
    ],
    example: {
      title: "Submitting a UserOperation to a bundler",
      language: "json",
      code: "{\n  \"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"eth_sendUserOperation\",\n  \"params\": [\n    {\n      \"sender\": \"0x9d2c…4a71\",\n      \"nonce\": \"0x7\",\n      \"callData\": \"0xb61d27f6000…\",\n      \"callGasLimit\": \"0x2710\",\n      \"verificationGasLimit\": \"0x186a0\",\n      \"preVerificationGas\": \"0xc350\",\n      \"maxFeePerGas\": \"0x1dcd6500\",\n      \"maxPriorityFeePerGas\": \"0x3b9aca00\",\n      \"signature\": \"0x4f2b…1e\"\n    },\n    \"0x0000…entrypoint\"\n  ]\n}\n\n// result is a userOpHash, NOT a transaction hash\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x6c1f…9b30\"}",
      note: "Poll `eth_getUserOperationReceipt` with that hash; `eth_getTransactionReceipt` will return `null` for it indefinitely.",
    },
    pitfalls: [
      "Polling `eth_getTransactionReceipt` with a `userOpHash`, which returns `null` no matter how long you wait.",
      "Reading the enclosing transaction's `status` as your operation's outcome; a bundle can succeed with your inner call reverted.",
      "Sending bundler methods to a normal RPC endpoint, which answers `-32601` because no execution client implements them.",
      "Deriving the next nonce from `eth_getTransactionCount`; 4337 nonces are key-and-sequence values held by the EntryPoint.",
    ],
    related: ["eip-7702", "transaction", "wallet-rpc", "signing-methods", "mempool", "dapp-architecture", "eth-get-transaction-receipt", "smart-contract", "rpc-provider", "erc-1271", "paymaster", "erc-7562", "onchain-agents"],
    sources: [
      { title: "ERC-4337: Account Abstraction Using Alt Mempool", url: "https://eips.ethereum.org/EIPS/eip-4337" },
      { title: "ERC-7769: JSON-RPC API for ERC-4337", url: "https://eips.ethereum.org/EIPS/eip-7769" },
      { title: "EIP-7702: Set EOA account code", url: "https://eips.ethereum.org/EIPS/eip-7702" },
      { title: "ethereum.org: Account abstraction", url: "https://ethereum.org/developers/docs/accounts/" },
    ],
  },
  {
    id: "local-devnet",
    title: "Local development nodes",
    category: "tooling",
    aliases: ["anvil", "hardhat network", "forking", "impersonation", "31337"],
    summary: "A local development node is a throwaway chain on your machine that serves the same [[json-rpc|JSON-RPC]] surface as a real node while adding methods to mine on demand, rewrite [[state|state]], impersonate accounts, and fork mainnet at a chosen [[block|block]].",
    sections: [
      {
        heading: "Anvil",
        paragraphs: [
          "Anvil ships with Foundry and starts in under a second on `http://127.0.0.1:8545`, [[chain-id|chain id]] `31337`, with ten prefunded accounts and instant mining. `anvil --fork-url https://rpc.example --fork-block-number 21000000` turns it into a local copy of mainnet at that height: it holds no state itself, fetches [[account|accounts]], code, and storage slots from the upstream node on first touch, and caches them. Since Foundry 1.8 it reads them by the fork block's hash, so an upstream that serves state only by number needs `--fork-state-by-number`, added in 1.8.3. That is how you [[fork-testing|reproduce a failed transaction or test against live contracts]] without deploying anything.",
          "Its extra methods do what no real node allows. `anvil_impersonateAccount` lets you send from an [[address|address]] whose key you do not have, `anvil_setBalance`, `anvil_setCode`, and `anvil_setStorageAt` rewrite state directly, `evm_mine` produces a block when automining is off, `evm_increaseTime` moves the clock, and `evm_snapshot` with `evm_revert` gives you a rollback point between test cases. Most `hardhat_` names are accepted as aliases.",
        ],
      },
      {
        heading: "Hardhat simulated networks",
        paragraphs: [
          "Hardhat covers the same ground from the JavaScript side with a simulated network, declared in Hardhat 3 as `type: \"edr-simulated\"` and called Hardhat Network in Hardhat 2. It runs either in-process during a test run or as a standalone server via `npx hardhat node`, also on chain id `31337`. Its control methods use the `hardhat_` prefix: `hardhat_impersonateAccount`, `hardhat_setBalance`, and `hardhat_mine` to fast-forward many blocks cheaply, while `hardhat_reset`, which re-forked from a different block mid-suite, is gone in Hardhat 3. It also supports `console.log` inside Solidity, which no real [[execution-client|execution client]] does.",
        ],
      },
      {
        heading: "When you need a real network",
        paragraphs: [
          "Neither tool runs consensus, so neither can test anything involving the [[engine-api|Engine API]], [[finality|finality]], the `safe` and `finalized` [[block-tag|block tags]], or client interoperability. The [[kurtosis|Kurtosis]] `ethereum-package` fills that gap: it launches a full devnet in containers with real [[execution-client|execution]] and [[consensus-client|consensus clients]] paired as they are in production — [[geth|Geth]], [[nethermind|Nethermind]], [[reth|Reth]], [[besu|Besu]], [[erigon|Erigon]] against [[lighthouse|Lighthouse]], [[teku|Teku]], [[prysm|Prysm]], [[nimbus|Nimbus]], or [[lodestar|Lodestar]] — from a generated genesis, with fork timings you choose. It is the standard way to rehearse a [[hardfork|network upgrade]] before it reaches a testnet.",
          "The gap between a devnet and production is the thing to keep in mind. Instant mining hides every race a 12-second block would expose, there is no competing [[mempool|pool]] and no [[reorg|reorg]], [[gas|gas]] is effectively free, and [[eth-send-transaction|eth_sendTransaction]] works because the node holds the keys — which is precisely what a public endpoint will refuse.",
        ],
      },
    ],
    example: {
      title: "Fork mainnet, impersonate a whale, mine a block",
      language: "bash",
      code: "anvil --fork-url https://rpc.example --fork-block-number 21000000\n\n# send as an address whose key you do not have\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"anvil_impersonateAccount\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\"]}' \\\n  http://127.0.0.1:8545\n\n# give it ether, then produce a block on demand\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"anvil_setBalance\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"0xde0b6b3a7640000\"]}' \\\n  http://127.0.0.1:8545\n\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"evm_mine\",\"params\":[]}' \\\n  http://127.0.0.1:8545",
      note: "Every method here would be rejected by a production endpoint; that is the point of a devnet and the reason code must not depend on them.",
    },
    pitfalls: [
      "Forking without `--fork-block-number`; results drift as the upstream head moves, and cache misses hammer the archive endpoint you are forking from.",
      "Writing application code around `eth_sendTransaction` and unlocked accounts because the devnet allows it; a real provider will not.",
      "Trusting a test suite that only ever ran with instant mining to catch nonce and ordering races.",
      "Assuming `safe` and `finalized` mean anything on Anvil or a Hardhat simulated network; neither runs consensus.",
    ],
    related: ["cli-tools", "eth-send-transaction", "state-override", "client-libraries", "block-tag", "genesis", "testnets", "dapp-architecture", "hardfork", "faucet", "kurtosis", "fork-testing"],
    sources: [
      { title: "Foundry Book: Anvil", url: "https://book.getfoundry.sh/" },
      { title: "Hardhat documentation", url: "https://hardhat.org/" },
      { title: "Kurtosis ethereum-package", url: "https://github.com/ethpandaops/ethereum-package" },
    ],
  },
  {
    id: "cli-tools",
    title: "Command-line RPC tools",
    category: "tooling",
    aliases: ["curl", "cast", "foundry", "geth attach", "websocat", "jq"],
    summary: "Command-line tools let you issue [[json-rpc|JSON-RPC]] calls directly and read the raw response, which is the fastest way to find out what an endpoint actually supports and what a node really returned.",
    sections: [
      {
        heading: "curl is the ground truth",
        paragraphs: [
          "Every method is one HTTP POST with a JSON body, so `curl -s -X POST -H 'content-type: application/json' --data '{…}' https://rpc.example` reaches anything. Piping through `jq` makes the response readable and lets you pull one field out of a large [[block|block]] object. Because nothing sits between you and the node, the result settles arguments that library behaviour cannot: whether a method exists, what the [[rpc-errors|error]] object really said, and which [[hex-encoding|hex value]] came back before anything decoded it.",
          "The same one-liner is the probe for [[endpoint-capabilities|endpoint capabilities]]. Ask for `web3_clientVersion` to learn which [[execution-client|client]] is behind the URL, `eth_chainId` to confirm the [[chain-id|chain]], a `debug_` or `trace_` method to see whether tracing is enabled, and an old block's state to see how far back the endpoint reaches.",
        ],
      },
      {
        heading: "cast for everything typed",
        paragraphs: [
          "Foundry's `cast` knows Ethereum's shapes, so it saves the encoding. `cast call <address> \"balanceOf(address)(uint256)\" <holder> --rpc-url <url>` builds the [[abi|ABI]] calldata, issues [[eth-call|eth_call]], and prints a decimal result. `cast block latest`, `cast receipt <hash>`, and `cast storage <address> <slot>` cover the common reads, `cast send` signs and submits, and `cast run <txhash>` replays a transaction and prints its [[execution-trace|trace]]. `cast rpc <method> [params…]` is the escape hatch that passes anything straight through, which is how you call a client-specific method with no dedicated subcommand.",
        ],
      },
      {
        heading: "Consoles and sockets",
        paragraphs: [
          "[[geth|Geth]]'s `geth attach` opens a JavaScript console against an HTTP URL or a local [[ipc-transport|IPC socket]], which is convenient for `admin_` and `txpool_` calls on a node you operate — over IPC those [[namespaces|namespaces]] are usually available even when the HTTP interface hides them. For [[websocket-transport|WebSocket]] work, `websocat` keeps a connection open so you can send an [[eth-subscribe|eth_subscribe]] frame and watch `newHeads` arrive, which HTTP cannot do.",
          "Keep one habit: when something behaves oddly through a [[client-libraries|library]], reproduce it as a raw request against the same endpoint and the same block before filing a bug. Half the time the node's answer is correct and the library's defaults were not, and the raw request is what makes that obvious.",
        ],
      },
    ],
    example: {
      title: "The same read three ways",
      language: "bash",
      code: "# raw JSON-RPC, exactly what goes over the wire\ncurl -s -X POST -H 'content-type: application/json' \\\n  --data '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getBalance\",\"params\":[\"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\"latest\"]}' \\\n  https://rpc.example | jq -r '.result'\n# -> 0x1bc16d674ec80000\n\n# cast: same call, decoded and pinned to a block\ncast balance 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --block 21000000 --rpc-url https://rpc.example\n\n# a contract read, ABI-encoded for you\ncast call 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 \\\n  'balanceOf(address)(uint256)' 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 \\\n  --rpc-url https://rpc.example\n\n# pass any method straight through, including client-specific ones\ncast rpc web3_clientVersion --rpc-url https://rpc.example",
      note: "`cast rpc` sends the method verbatim, which is how you probe for `trace_`, `debug_`, or a chain-specific namespace.",
    },
    pitfalls: [
      "Omitting the `content-type: application/json` header; some endpoints and proxies reject the request before the node ever sees it.",
      "Reading HTTP `200 OK` as success; a JSON-RPC error object normally arrives inside a successful response.",
      "Fighting shell quoting by nesting double quotes inside `--data`; wrap the whole body in single quotes instead.",
      "Comparing a `cast` result with a library's and forgetting that `cast` applied its own defaults, such as the latest block.",
    ],
    related: ["json-rpc", "client-libraries", "local-devnet", "endpoint-capabilities", "rpc-errors", "eth-call", "debug-api", "websocket-transport", "fork-testing"],
    sources: [
      { title: "Foundry Book: cast", url: "https://book.getfoundry.sh/" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
      { title: "Geth documentation", url: "https://geth.ethereum.org/docs" },
    ],
  },
  {
    id: "token-standards",
    title: "Token standards via RPC",
    category: "tooling",
    aliases: ["ERC-20", "ERC-721", "ERC-1155", "balanceOf", "0x70a08231", "Transfer event", "NFT"],
    summary: "Tokens are ordinary [[smart-contract|contracts]], so a balance is an [[eth-call|eth_call]] to `balanceOf` and a transfer history is an [[eth-get-logs|eth_getLogs]] query for `Transfer` [[event-log|events]] — there is no token-aware method in the [[json-rpc|JSON-RPC]] API.",
    sections: [
      {
        heading: "Balances are contract calls",
        paragraphs: [
          "An ERC-20 balance is `eth_call` with `to` set to the token and `data` set to the selector `0x70a08231` — the first four bytes of [[keccak-256|keccak256]] of `balanceOf(address)` — followed by the holder's [[address|address]] left-padded to 32 bytes. The result is a single 32-byte word to be read as an unsigned integer. The metadata reads are the same shape: `decimals()` is `0x313ce567`, `symbol()` is `0x95d89b41`, and `totalSupply()` is `0x18160ddd`. Because these are plain calls, they take a block parameter, so a historical balance is one [[block-tag|block identifier]] away on a node that still has the [[state|state]].",
          "ERC-721 keeps `balanceOf(address)` as a count and adds `ownerOf(uint256)` and `tokenURI(uint256)`; ERC-1155 uses `balanceOf(address,uint256)` per token id. For standards that adopted it, which interface a contract implements is discoverable with [[erc-165|ERC-165]]'s `supportsInterface(bytes4)`, selector `0x01ffc9a7`. ERC-20 never required it, and contracts without it answer unpredictably: they revert, return `0x`, or return a non-zero word from a catch-all fallback, which is why ERC-165 prescribes probing `0x01ffc9a7` and `0xffffffff` before trusting any answer.",
        ],
      },
      {
        heading: "History comes from logs",
        paragraphs: [
          "Every standard emits `Transfer(address,address,uint256)`, whose topic0 is `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`. Filter with `address` set to the token and `topics[1]` or `topics[2]` set to a padded address for sends or receives. The subtlety is that ERC-20 and ERC-721 share that topic0 but not the shape: ERC-20 indexes only the two addresses and puts the amount in `data`, while ERC-721 indexes the token id as well, so its logs carry four topics and an empty `data`. Counting topics is how you tell them apart. ERC-1155 emits `TransferSingle` and `TransferBatch` instead.",
        ],
      },
      {
        heading: "Why a portfolio is hard",
        paragraphs: [
          "Nothing on chain lists the tokens an [[account|account]] holds. The only honest answers are to scan every `Transfer` log that mentions the address across all blocks, which is expensive and bounded by provider [[rate-limits|range limits]], or to keep an [[indexer|indexer]] that does it once and maintains a table. Hosted providers sell exactly this as an [[portfolio-tracker|enhanced API]], which is convenient and is not part of any standard.",
          "Derive history from logs, but never derive a balance from them. Rebasing tokens change balances with no event, reflection tokens such as RFI take a fee from every transfer and spread it over all holders' balances without logging it, and some contracts mint or burn without emitting. Fee-on-transfer code such as USDT's credits the recipient less than the sender sent, but it logs that net amount and the fee as separate `Transfer` events. `balanceOf` at a specific block is the only authoritative number, so use [[multicall|multicall]] to read many of them in one consistent snapshot.",
        ],
      },
    ],
    example: {
      title: "A balance read and a transfer history query",
      language: "json",
      code: "// balanceOf(0xd8dA…6045) on USDC: selector + 32-byte padded address\n{\n  \"jsonrpc\": \"2.0\", \"id\": 1, \"method\": \"eth_call\",\n  \"params\": [{\n    \"to\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n    \"data\": \"0x70a08231000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045\"\n  }, \"0x1406f40\"]\n}\n// -> {\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x00000000000000000000000000000000000000000000000000000000000f4240\"}\n//    0xf4240 = 1000000 units, and USDC has 6 decimals, so 1.00 USDC\n\n// every transfer TO that address, from one token\n{\n  \"jsonrpc\": \"2.0\", \"id\": 2, \"method\": \"eth_getLogs\",\n  \"params\": [{\n    \"address\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\n    \"fromBlock\": \"0x1400000\", \"toBlock\": \"0x1406f40\",\n    \"topics\": [\n      \"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef\",\n      null,\n      \"0x000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045\"\n    ]\n  }]\n}",
      note: "`null` in the topic list means 'any sender'; positions matter, so topic1 is `from` and topic2 is `to`.",
    },
    pitfalls: [
      "Assuming 18 decimals; read `decimals()` per token, since USDC uses 6 and several tokens use other values.",
      "Summing `Transfer` amounts to compute a balance; rebasing and reflection tokens make the total wrong, so call `balanceOf`.",
      "Treating every `Transfer` log with that topic0 as ERC-20; four topics and empty `data` means it is an ERC-721 token id.",
      "Calling `symbol()` and failing on old tokens that return a `bytes32` rather than a string, which decodes as garbage or throws.",
    ],
    related: ["eth-call", "eth-get-logs", "abi", "event-signature", "multicall", "indexer", "event-log", "smart-contract", "client-libraries", "erc-165", "eip-3009", "stablecoin-payments", "portfolio-tracker", "nft-marketplace", "erc-4626"],
    sources: [
      { title: "ERC-20: Token Standard", url: "https://eips.ethereum.org/EIPS/eip-20" },
      { title: "ERC-721: Non-Fungible Token Standard", url: "https://eips.ethereum.org/EIPS/eip-721" },
      { title: "ethereum.org: Token standards", url: "https://ethereum.org/developers/docs/standards/tokens/" },
    ],
  },
  {
    id: "dapp-architecture",
    title: "Dapp architecture",
    category: "tooling",
    aliases: ["frontend", "read path", "write path", "provider key", "wallet vs rpc", "web3 stack"],
    summary: "A dapp has two distinct RPC paths: reads go from your application to an endpoint you choose, and writes go through the user's wallet to an endpoint the wallet chooses, with an [[indexer|indexer]] covering anything the chain cannot answer directly.",
    sections: [
      {
        heading: "Two paths, two endpoints",
        paragraphs: [
          "Reads are yours to control. Your frontend or backend talks to an [[rpc-provider|RPC provider]] or your own node, picks the [[block-tag|block tag]], and handles [[retries|retries]] and [[rate-limits|limits]]. Writes are not: the [[eip-1193|injected provider]] forwards signing to the wallet, and the wallet [[transaction-simulation|simulates]], estimates, and broadcasts through its own endpoint. The two endpoints are rarely at the same head, so a transaction the wallet has already accepted may be invisible to your next read; see [[head-lag|head consistency]].",
          "Anything that is a query rather than a lookup belongs to a third path. 'All transfers involving this user', 'the top holders', 'a chart over six months' are not RPC questions — they are [[eth-get-logs|log]] scans that no browser should attempt and most endpoints will refuse. That work belongs in an indexer, a [[the-graph|subgraph]], or a backend that keeps its own table.",
        ],
      },
      {
        heading: "Where each piece sits",
        paragraphs: [
          "Contracts are the source of truth. The frontend holds the wallet connection, the [[abi|ABI]], and the read client. A backend or indexer holds history, aggregates, and anything needing an API key, because a key shipped in browser JavaScript is a public key: anyone can read it from the network tab and spend your quota. Put the provider behind a small proxy that allows only the methods you use, and keep the write path direct between wallet and chain, where no secret of yours is involved.",
        ],
      },
      {
        heading: "The write path end to end",
        paragraphs: [
          "Connect with `eth_requestAccounts`, then check `eth_chainId` and, if needed, [[wallet-rpc|wallet_switchEthereumChain]]. Encode the call with the ABI, simulate it with [[eth-call|eth_call]] so a [[revert|revert]] surfaces with its reason before the user is asked for anything, then let the wallet estimate and prompt. When it returns a hash, poll [[eth-get-transaction-receipt|eth_getTransactionReceipt]] on your own endpoint until it is non-null, and only then wait for the [[confirmations|confirmations]] or the `finalized` tag that your risk model calls for.",
          "The failure modes cluster at the seams. The user switches chains mid-flow and your contract addresses are wrong. Your endpoint lags the wallet's and the receipt reads `null` for several seconds. Your library reshapes the revert reason into something unrecognisable. Your indexer is four blocks behind the head and the new position does not appear. Each one has a specific answer — re-read the [[chain-id|chain id]] after every `chainChanged`, poll the same endpoint, log the raw [[rpc-errors|error object]], and render pending state from the receipt while the indexer catches up.",
        ],
      },
    ],
    example: {
      title: "The write path, with the read path kept separate",
      language: "js",
      code: "// reads: your endpoint, your rules\nconst reader = createPublicClient({ transport: http('/api/rpc') }); // proxy hides the key\n\n// writes: the user's wallet, the wallet's endpoint\nconst [account] = await provider.request({ method: 'eth_requestAccounts' });\nif (await provider.request({ method: 'eth_chainId' }) !== '0x1') {\n  await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }] });\n}\n\n// simulate before prompting, so reverts never reach the user as a rejected popup\nawait reader.call({ account, to: token, data });\n\nconst hash = await provider.request({\n  method: 'eth_sendTransaction',\n  params: [{ from: account, to: token, data }],\n});\n\n// poll YOUR endpoint, and keep polling the same one\nconst receipt = await reader.waitForTransactionReceipt({ hash, confirmations: 2 });",
      note: "The wallet chose the node that broadcast the transaction; your client chose the node that confirms it, which is why the first few polls can return `null`.",
    },
    pitfalls: [
      "Shipping a provider API key in frontend JavaScript; it is visible in the network tab, so proxy it behind your own endpoint instead.",
      "Running historical `eth_getLogs` scans from the browser; that is indexer work, and providers cap the ranges anyway.",
      "Assuming the wallet and your read endpoint are at the same block, then treating a `null` receipt as a failed send.",
      "Skipping the `eth_call` simulation before prompting, so the user approves a transaction that was always going to revert.",
    ],
    related: ["eip-1193", "client-libraries", "indexer", "rpc-provider", "head-lag", "wallet-rpc", "token-standards", "eth-call", "confirmations", "the-graph", "eip-6963"],
    sources: [
      { title: "ethereum.org: Intro to dapps", url: "https://ethereum.org/developers/docs/dapps/" },
      { title: "viem documentation", url: "https://viem.sh/" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "erc-165",
    title: "ERC-165 interface detection",
    category: "tooling",
    aliases: ["supportsInterface", "EIP-165", "0x01ffc9a7", "interface id", "interface detection", "ERC165Checker", "0xffffffff"],
    summary: "ERC-165 is the convention by which a [[smart-contract|contract]] answers `supportsInterface(bytes4)` with `true` for each interface it implements, where an interface id is the XOR of that interface's function [[abi|selectors]], so a caller can ask over [[eth-call|eth_call]] what a contract claims to speak before calling it.",
    sections: [
      {
        heading: "Interface ids are XORed selectors",
        paragraphs: [
          "For ERC-165 an interface is nothing more than a set of function selectors, the first four bytes of the [[keccak-256|keccak256]] of each canonical signature, and its id is all of them XORed together. ERC-721's nine functions give `0x80ac58cd`, its metadata extension of `name`, `symbol` and `tokenURI` gives `0x5b5e139f`, and ERC-1155 gives `0xd9b67a26`. A one-function interface's id is simply that function's selector, which is why `0x01ffc9a7` is both the selector of `supportsInterface(bytes4)` and the id of ERC-165 itself, and why the [[ens|ENS]] wildcard interface `resolve(bytes,bytes)` is `0x9061b923`. Events, return types and optional functions are not part of an id.",
          "A compliant contract returns `true` for `0x01ffc9a7`, `false` for `0xffffffff`, `true` for every id it implements and `false` for everything else, using at most 30,000 gas. ERC-721 and ERC-1155 make it mandatory, [[nft-marketplace|ERC-2981 royalties]] (`0x2a55205a`) and ERC-4906 metadata updates (`0x49064906`) are discovered through it, and ENS resolvers advertise their record types with it. ERC-20 predates it and never required it, so a fungible token's silence says nothing; see [[token-standards|token standards]].",
        ],
      },
      {
        heading: "The detection procedure",
        paragraphs: [
          "Asking `supportsInterface(X)` directly is not enough, because a contract that never implemented ERC-165 can still answer. The ERC prescribes two probes first: a `STATICCALL` with 30,000 gas and input `0x01ffc9a701ffc9a7` plus padding must return true, and the same call with `0xffffffff` must return false. Only then does the answer for `X` mean anything. The second probe catches contracts whose fallback returns a non-zero word for any input, and OpenZeppelin's `ERC165Checker` also insists on at least 32 bytes of return data before it reads a `true`.",
          "Over RPC each probe is an eth_call whose `data` is `0x01ffc9a7` followed by the id left-aligned in a 32-byte word. Contracts without ERC-165 answer in several shapes, all of which mean no: mainnet USDC reverts with empty data, WETH's payable fallback succeeds and returns `0x`, and an [[address|address]] with no code also succeeds with `0x`, since a call to an empty account is a no-op. A [[proxy-contract|proxy]] answers with whatever its implementation said at that [[block-tag|block]], and an [[eip-7702|EIP-7702]] delegated account answers through its delegate's code, so an address that signs like an EOA can report `true`.",
        ],
      },
      {
        heading: "Batching, gas, and probing by calling",
        paragraphs: [
          "Probing many contracts is a natural [[multicall|Multicall3]] job: three `aggregate3` entries per target with `allowFailure` set, one eth_call, one block. Two details differ from the on-chain procedure. Multicall3 forwards all available gas to each sub-call, so the 30,000 cap is not enforced and one expensive fallback can eat the batch's budget under the node's gas cap. And a top-level eth_call's `gas` includes a transaction's intrinsic cost, 21,000 plus calldata, so `gas: 0x7530` leaves under 9,000 for execution, and an implementation that needs between 9,000 and 30,000 gets `out of gas` from [[geth|Geth]] where the on-chain procedure would pass; about 51,000 models the ERC's budget.",
          "The alternative is probing by calling: invoke a function you expect, such as `decimals()` or `ownerOf(1)`, and see whether the result decodes. That is the only option for ERC-20, but it proves only that one selector dispatched to something, which a fallback or a selector collision can fake. ERC-165 does not prove behaviour either: `supportsInterface` returns whatever its author wrote, so it tells a caller what to try, and the calls themselves remain the only evidence of behaviour.",
        ],
      },
    ],
    example: {
      title: "The three-probe check over eth_call",
      language: "json",
      code: "// 1. supportsInterface(0x01ffc9a7): does this ERC-721 contract implement ERC-165 at all?\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[{\n  \"to\": \"0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D\",\n  \"data\": \"0x01ffc9a701ffc9a700000000000000000000000000000000000000000000000000000000\"\n}, \"0x18de2a8\"]}\n// -> \"0x0000000000000000000000000000000000000000000000000000000000000001\"\n\n// 2. supportsInterface(0xffffffff) must be false\n//    data 0x01ffc9a7ffffffff00000000000000000000000000000000000000000000000000000000\n// -> \"0x0000000000000000000000000000000000000000000000000000000000000000\"\n\n// 3. only now ask the real question: ERC-721 is 0x80ac58cd\n//    data 0x01ffc9a780ac58cd00000000000000000000000000000000000000000000000000000000\n// -> \"0x0000000000000000000000000000000000000000000000000000000000000001\"\n\n// probe 1 against contracts without ERC-165\n// USDC 0xA0b8…eB48   {\"error\":{\"code\":3,\"message\":\"execution reverted\",\"data\":\"0x\"}}\n// WETH 0xC02a…6Cc2   {\"result\":\"0x\"}   payable fallback ran and returned nothing\n// no code at all     {\"result\":\"0x\"}",
      note: "Only a 32-byte true from the first probe and a 32-byte false from the second make the third answer meaningful; a revert, a success with `0x`, or a short word all mean the contract does not implement ERC-165.",
    },
    pitfalls: [
      "Calling `supportsInterface(0x80ac58cd)` alone and trusting a `true`, which a catch-all fallback returns for every input; run the `0x01ffc9a7` and `0xffffffff` probes first.",
      "Treating an empty `0x` result as a decoding bug rather than as the answer; success with no data means the target has no code or no ERC-165.",
      "Using ERC-165 to decide whether a contract is an ERC-20 token, which never had to implement it, so a `false` or a revert proves nothing.",
      "Passing `gas: 0x7530` to eth_call to mimic the ERC's limit, which leaves under 9,000 gas after intrinsic cost and fails any implementation that needs more with `out of gas`.",
      "Caching the answer per address forever; proxies upgrade and delegated accounts repoint, so an answer belongs to a block.",
    ],
    related: ["token-standards", "abi", "eth-call", "multicall", "erc-1271", "ens", "ccip-read", "proxy-contract", "eip-7702", "smart-contract"],
    sources: [
      { title: "ERC-165: Standard Interface Detection", url: "https://eips.ethereum.org/EIPS/eip-165" },
      { title: "ERC-721: Non-Fungible Token Standard", url: "https://eips.ethereum.org/EIPS/eip-721" },
      { title: "ERC-1155: Multi Token Standard", url: "https://eips.ethereum.org/EIPS/eip-1155" },
      { title: "OpenZeppelin ERC165Checker source", url: "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/introspection/ERC165Checker.sol" },
    ],
  },
  {
    id: "erc-1271",
    title: "ERC-1271 contract signatures",
    category: "tooling",
    aliases: ["isValidSignature", "0x1626ba7e", "EIP-1271", "contract signature", "ERC-6492", "smart account signature", "counterfactual signature"],
    summary: "ERC-1271 lets a contract [[account|account]] vouch for a signature: a verifier calls `isValidSignature(bytes32 hash, bytes signature)` on the account, and the account returns the magic value `0x1626ba7e` if the signature is valid by its own rules and its current [[state|state]].",
    sections: [
      {
        heading: "Why ecrecover is not enough",
        paragraphs: [
          "For an externally owned account the signer is a function of the signature: `ecrecover` over the digest yields an [[address|address]], and a match settles it permanently; see [[ecdsa-signature|signatures]]. A [[smart-contract|contract]] account has no private key, so nothing recovers to it. A Safe is several owner keys and a threshold, an [[erc-4337|ERC-4337]] account may accept passkeys or session keys, and either can change its rules with one transaction. ERC-1271, a Final standard, moves the decision into the account: `isValidSignature` is a `view` function that may read owners, thresholds or anything else in storage, and answers with a `bytes4`.",
          "The magic value is the function's own selector, `bytes4(keccak256('isValidSignature(bytes32,bytes)'))`, returned left-aligned in a 32-byte word, so a valid answer over RPC is `0x1626ba7e` followed by 28 zero bytes. Every other outcome is a rejection, and the shapes vary: the reference implementation returns `0xffffffff`, Safe reverts, and an address with no code returns `0x` because the call does nothing. An early draft used `isValidSignature(bytes,bytes)` with magic `0x20c13b0b`, and Safe v1.3.0's fallback handler still answers both, which is why the old value turns up in legacy code.",
        ],
      },
      {
        heading: "Verifying over eth_call",
        paragraphs: [
          "Off-chain verification is one [[eth-call|eth_call]] with `to` set to the account and `data` set to the [[abi|ABI]]-encoded hash and signature. The hash is whatever digest the application defines, an EIP-191 message hash or an [[eip-712|EIP-712]] digest, but the account decides what its owners actually signed. Safe wraps the hash in a `SafeMessage` typed structure under the Safe's own domain before checking owners, so an owner's signature over the raw digest fails; wallets that support Safe produce the wrapped signature, and the verifier never needs to know. That is what [[signing-methods|signing methods]] mean by the contract-account branch.",
          "Because the answer depends on state, it is true only at a [[block-tag|block]]. Owners rotate, thresholds change, session keys expire, and the same bytes can verify at block N and fail at N+1, a warning both Circle's and OpenZeppelin's verifier code carry. Pin a block number when the result is evidence, such as an audit record, and re-check at `latest` when it is authorization, such as a session. ERC-4361, Sign-In with Ethereum, adds that the account must be resolved on the [[chain-id|chain]] named in the message, since one counterfactual address can exist on several chains with different owners. The ERC sets no gas limit and warns against hardcoding one, so the node's eth_call gas cap is the only bound.",
        ],
      },
      {
        heading: "Accounts that are not deployed, or not contracts",
        paragraphs: [
          "A counterfactual account, an address computed from a factory and salt but not yet deployed, has no code to call. [[erc-6492|ERC-6492]], also Final, wraps the signature as `abi.encode(factory, factoryCalldata, innerSignature)` followed by the 32-byte suffix `0x6492…6492`. A verifier that sees the suffix runs the factory call and then `isValidSignature` inside a single eth_call, which is safe exactly because eth_call discards state: the reference `ValidateSigOffchain` contract is sent as creation bytecode with no `to` and returns `0x01` for valid. viem's `verifyMessage` and `verifyHash` actions do this and fall back to ecrecover, while its standalone `verifyMessage` utility handles only EOAs.",
          "[[eip-7702|EIP-7702]] delegated EOAs sit in between. The key still signs and ecrecover still recovers the address, but the account now has code, the 23-byte designator, and common verifiers branch on code length: OpenZeppelin's `SignatureChecker` and USDC's FiatToken v2.2 call `isValidSignature` whenever the signer has code. Whether a plain ECDSA signature then passes depends on the delegate, which may accept the account's own key or may not implement ERC-1271 at all. A verifier that tries ecrecover first and falls back to ERC-1271 accepts both, and the same routing decides [[eip-3009|signed USDC transfers]] from such accounts.",
        ],
      },
    ],
    example: {
      title: "isValidSignature on a Safe, and the shapes of no",
      language: "text",
      code: "// eth_call isValidSignature(bytes32 hash, bytes signature) on a 1-of-n Safe, pinned to a block\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[{\n  \"to\": \"0x3c1f…a9e2\",\n  \"data\": \"0x1626ba7e…\"\n}, \"0x18de2a8\"]}\n\ndata, word by word:\n  1626ba7e                                                           selector = magic value\n  d9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68   hash: EIP-191 digest of 'hello world'\n  0000000000000000000000000000000000000000000000000000000000000040   offset of the signature\n  0000000000000000000000000000000000000000000000000000000000000041   length: 65 bytes, one owner\n  <r 32 bytes><s 32 bytes><v 1 byte> zero-padded to 96 bytes\n\n// valid: the magic value, left-aligned\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x1626ba7e00000000000000000000000000000000000000000000000000000000\"}\n\n// the shapes of no\nSafe, not an owner's key       {\"error\":{\"code\":3,\"message\":\"execution reverted: GS026\",\"data\":\"0x08c379a0…\"}}\nreference implementation       {\"result\":\"0xffffffff00000000000000000000000000000000000000000000000000000000\"}\nno code: EOA or undeployed     {\"result\":\"0x\"}",
      note: "The hash is the application's digest; the Safe wraps it in `SafeMessage` before checking owners, so the 65 bytes are an owner's signature over the wrapped hash, not over `d9eb…7d68`.",
    },
    pitfalls: [
      "Verifying with `ecrecover` alone, which rejects every Safe, every ERC-4337 account, and some delegated EOAs whose signatures are perfectly valid.",
      "Treating any non-reverting answer as valid; only a result whose first four bytes are `0x1626ba7e` counts, and `0xffffffff`, `0x` or garbage all mean no.",
      "Verifying at `latest` for an audit record and later failing to reproduce it; the owners may have changed, so store the block number with the result.",
      "Rejecting a signature from an account that is not deployed yet instead of checking for the ERC-6492 suffix and verifying through a [[deployless-call|deployless eth_call]].",
      "Sending a delegated EOA straight to `isValidSignature` because it has code, which rejects a valid ECDSA signature when the delegate does not implement ERC-1271.",
    ],
    related: ["signing-methods", "eip-712", "ecdsa-signature", "erc-4337", "eip-7702", "eth-call", "block-tag", "erc-165", "eip-3009", "smart-contract", "erc-6492"],
    sources: [
      { title: "ERC-1271: Standard Signature Validation Method for Contracts", url: "https://eips.ethereum.org/EIPS/eip-1271" },
      { title: "ERC-6492: Signature Validation for Predeploy Contracts", url: "https://eips.ethereum.org/EIPS/eip-6492" },
      { title: "ERC-4361: Sign-In with Ethereum", url: "https://eips.ethereum.org/EIPS/eip-4361" },
      { title: "viem: verifyMessage", url: "https://viem.sh/docs/actions/public/verifyMessage" },
    ],
  },
  {
    id: "ccip-read",
    title: "CCIP-Read offchain lookup",
    category: "tooling",
    aliases: ["EIP-3668", "OffchainLookup", "0x556f1830", "offchain resolver", "CCIP gateway", "ccipRead", "enableCcipRead"],
    summary: "CCIP-Read, defined in EIP-3668, lets a [[smart-contract|contract]] answer a call with data it does not hold: it [[revert|reverts]] with `OffchainLookup`, the client fetches a response from a gateway URL the contract named, and then calls the contract's callback, which verifies the response and returns the real result.",
    sections: [
      {
        heading: "The three-step loop",
        paragraphs: [
          "Step one is an ordinary [[eth-call|eth_call]]. A CCIP-Read contract reverts with `OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)`, so the error's `data` begins with the selector `0x556f1830`. Step two happens off-chain: the client substitutes `{sender}` and `{data}` into a URL template, sends a GET if the template contains `{data}` or a JSON POST of `data` and `sender` if it does not, and expects a JSON object whose `data` field holds the 0x-prefixed response. Step three is a second eth_call to the same contract with `callbackFunction(response, extraData)`, whose return is handed to the caller as if the original function had produced it. The callback may itself revert with another lookup, so clients cap the chain: the EIP asks for a limit of at least four, and ethers stops at ten calls.",
          "The client rejects a lookup whose `sender` is not the contract it called, because that means the error bubbled up from a nested call. A 4xx from the gateway ends the attempt and a 5xx moves on to the next URL. `extraData` must travel back unmodified; it is how the callback confirms that the gateway answered the question that was asked rather than a different one.",
        ],
      },
      {
        heading: "Who verifies what",
        paragraphs: [
          "The gateway is untrusted by design; the callback is where the trust model lives, and it is application-specific. A signed-gateway resolver checks that the response carries an unexpired signature from a key it stores: the `base.eth` resolver's gateway returns a result, an expiry and a 65-byte signature, and `resolveWithProof(bytes,bytes)` checks all three. An L2 resolver can instead demand a [[storage-proof|storage proof]] of the record against an L2 state root posted to L1, which trusts the [[rollup|rollup]]'s settlement rather than a gateway operator. To the caller both look the same: a view function that took two calls.",
          "The main user is [[ens|ENS]]. Under ENSIP-10 wildcard resolution the client walks up from the name to the nearest ancestor with a resolver, checks that resolver with [[erc-165|ERC-165]] for `0x9061b923`, and calls `resolve(bytes name, bytes data)` with the DNS-encoded name and the ABI-encoded record call. Offchain and L2 naming systems implement `resolve` by reverting with a lookup, which is how a subname that has no resolver of its own resolves through its parent's.",
        ],
      },
      {
        heading: "What an RPC caller and an endpoint see",
        paragraphs: [
          "To a node CCIP-Read is invisible: it serves two or more ordinary eth_calls, the first of which fails with code `3` and revert `data`, and it never sees the gateway request. The protocol therefore depends on revert bytes surviving the trip, and a provider or [[rpc-gateway|RPC gateway]] in front of the node that rewrites reverts to `-32000` without `data` makes every offchain name unresolvable. [[client-libraries|Libraries]] run the loop. viem follows lookups on every call unless the client is created with `ccipRead: false`, and accepts a custom `ccipRead.request` function. ethers v6 follows them only for calls that set `enableCcipRead`, as its ENS code does, never when `provider.disableCcipRead` is set, and only at `latest`.",
          "Two consequences are easy to miss. The gateway request carries `sender` and `callData` and nothing else, no [[block-tag|block number]], so an offchain answer always reflects the gateway's present and a historical resolution cannot be reproduced. And the fetch is made by whoever runs the client: in a browser the gateway learns the user's IP address and the name being resolved, and on a server the resolver's author picks URLs your backend will request. The EIP recommends a hook to proxy or block lookups, no `from` on calls that may run untrusted code, and CCIP-Read off by default for transactions, including their [[eth-estimate-gas|gas estimation]]. Batching through [[multicall|Multicall3]] breaks it as well: `aggregate3` never bubbles a sub-call's revert, so the lookup comes back as a failed entry's return data or as Multicall3's own `call failed` error, and a client following the EIP never sees an `OffchainLookup` it can act on.",
        ],
      },
    ],
    example: {
      title: "Resolving jesse.base.eth by hand",
      language: "text",
      code: "// 1. eth_call base.eth's resolver: resolve(dnsEncode('jesse.base.eth'), addr(node))\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[{\n  \"to\": \"0xde9049636f4a1dfe0a64d1bfe3155c0a14c54f31\", \"data\": \"0x9061b923…\"}, \"latest\"]}\n// the revert is the protocol\n{\"jsonrpc\":\"2.0\",\"id\":1,\"error\":{\"code\":3,\"message\":\"execution reverted\",\"data\":\"0x556f1830…\"}}\n\ndecoded OffchainLookup:\n  sender            0xde9049636f4a1dfe0a64d1bfe3155c0a14c54f31   must equal the contract called\n  urls              [https://api.coinbase.com/api/v1/domain/resolver/resolveDomain/{sender}/{data}]\n  callData          0x9061b923…056a657373650462617365036574680…3b3b57de…\n  callbackFunction  0xf4d4d2f8   resolveWithProof(bytes,bytes)\n  extraData         0x9061b923…   the same bytes, kept for the callback\n\n// 2. the template contains {data}, so GET with both substituted\nGET https://api.coinbase.com/api/v1/domain/resolver/resolveDomain/0xde90…4f31/0x9061b923…\n-> 200 {\"data\":\"0x…0060…6aba5857…00a0…2211d1d0020daea8039e46cf1367962070d77da9…0041b3e9f9…\"}\n   result, expiry timestamp, 65-byte signature\n\n// 3. eth_call the callback with (response, extraData)\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_call\",\"params\":[{\n  \"to\": \"0xde9049636f4a1dfe0a64d1bfe3155c0a14c54f31\", \"data\": \"0xf4d4d2f8…\"}, \"latest\"]}\n-> {\"jsonrpc\":\"2.0\",\"id\":2,\"result\":\"0x…0020…0020…2211d1d0020daea8039e46cf1367962070d77da9\"}",
      note: "Captured in September 2026 against a public Geth endpoint: two ordinary eth_calls, one HTTPS request the node never saw, and a gateway signature checked on-chain by the callback.",
    },
    pitfalls: [
      "Reporting an `OffchainLookup` revert as a failed call; `0x556f1830` at the start of the error `data` is a request to fetch and call back.",
      "Serving eth_call through a proxy that strips revert `data`, which silently breaks every offchain ENS name for its users.",
      "Following lookups from a backend without an allowlist or a proxy, which lets any resolver make your servers request URLs it chose.",
      "Resolving an offchain name at a pinned historical block and expecting a historical answer; the gateway is only ever asked about now.",
      "Trusting a gateway response in client code instead of passing it to the callback, the only step that verifies it.",
    ],
    related: ["ens", "revert", "eth-call", "client-libraries", "erc-165", "storage-proof", "rpc-errors", "multicall", "security", "l2-rpc"],
    sources: [
      { title: "EIP-3668: CCIP Read, secure offchain data retrieval", url: "https://eips.ethereum.org/EIPS/eip-3668" },
      { title: "ENSIP-10: Wildcard Resolution", url: "https://docs.ens.domains/ensip/10" },
      { title: "ENS documentation: CCIP Read", url: "https://docs.ens.domains/resolvers/ccip-read" },
      { title: "viem: public client ccipRead option", url: "https://viem.sh/docs/clients/public" },
    ],
  },
  {
    id: "eip-6963",
    title: "EIP-6963 provider discovery",
    category: "tooling",
    aliases: ["multi injected provider discovery", "eip6963:announceProvider", "eip6963:requestProvider", "rdns", "window.ethereum", "mipd", "wallet discovery"],
    summary: "EIP-6963 lets every browser wallet on a page announce its own [[eip-1193|EIP-1193 provider]] through two `window` events, so a dapp can list the installed wallets and let the user choose, instead of taking whichever extension last wrote `window.ethereum`.",
    sections: [
      {
        heading: "The race it replaces",
        paragraphs: [
          "Before EIP-6963 every wallet extension injected its provider at `window.ethereum`. Extensions load in an unpredictable order, so with two installed the last to load usually won, some delayed their injection on purpose to overwrite a rival, and the user could neither choose which wallet a site talked to nor see which one it was. A dapp calling `window.ethereum.request` had no reliable way to know whose prompt would appear, and a newly installed wallet could silently displace the one the user relied on.",
          "EIP-6963, a Final interface standard, leaves the provider untouched and changes only discovery. Each wallet still exposes an EIP-1193 object with `request`, the same [[rpc-errors|error codes]] and the same `accountsChanged` and `chainChanged` events; there are simply several of them, each with a label. Wallets keep writing `window.ethereum` for legacy sites, and the EIP recommends that dapps read it only as a fallback when discovery finds nothing.",
        ],
      },
      {
        heading: "Two events and a record",
        paragraphs: [
          "The dapp adds a listener for `eip6963:announceProvider` and then dispatches a plain `Event` named `eip6963:requestProvider`. Each wallet, once on load and again on every request, dispatches a `CustomEvent` named `eip6963:announceProvider` whose `detail` is a frozen `{ info, provider }` object. Because both sides announce and both listen, load order stops mattering: a wallet that loads after the request announces on its own, and the EIP requires the dapp to keep its listener for the lifetime of the page. Event listeners run synchronously, so wallets already present are known the moment `dispatchEvent` returns, and late ones arrive whenever they load.",
          "`info` has four fields. `uuid` is a UUIDv4 that tells provider objects apart during one page's lifetime and is not meant to be persisted. `name` is a display label. `icon` must be a data URI, ideally a square of at least 96 pixels, and because an SVG can carry script the EIP requires rendering it as an image rather than as markup. `rdns` is a reverse-DNS identifier such as `com.example.wallet`, stable across sessions, which makes it the value to store when remembering a user's choice; it is self-declared, so the EIP says not to use it for feature detection.",
        ],
      },
      {
        heading: "What changes for RPC",
        paragraphs: [
          "Nothing on the wire: after discovery the dapp sends the same `eth_requestAccounts`, [[signing-methods|signing]] and [[wallet-rpc|wallet_]] calls to the chosen provider. What changes is which wallet, and therefore which upstream node, answers them. Each wallet forwards reads to its own [[rpc-provider|endpoint]] and may be on a different [[chain-id|chain]], so two discovered providers on one page can disagree about the chain id and the head; see [[head-lag|head consistency]]. Session state belongs to one provider as well, so `chainChanged` has to be subscribed on the object requests are sent through.",
          "Discovery covers injected browser providers only. A wallet's in-app mobile browser has only its own provider to offer, and WalletConnect reaches a wallet through a relay rather than the page, so neither involves these events, and [[client-libraries|libraries]] layer the paths: wagmi's `multiInjectedProviderDiscovery` option, on by default, uses the `mipd` library to turn each announcement into an injected connector. A dapp doing discovery itself should deduplicate by `uuid` and treat two announcements sharing one `uuid` as tampering, which the EIP names as the sign of one extension imitating another. See [[dapp-architecture|dapp architecture]] for where the wallet path sits.",
        ],
      },
    ],
    example: {
      title: "Discovering wallets and remembering the choice",
      language: "js",
      code: "const wallets = new Map(); // uuid -> { info, provider }\n\nwindow.addEventListener('eip6963:announceProvider', (event) => {\n  const { info, provider } = event.detail;\n  const seen = wallets.get(info.uuid);\n  if (seen && seen.provider !== provider) {\n    console.warn('two providers claim one uuid:', info.name); // possible imitation\n    return;\n  }\n  wallets.set(info.uuid, { info, provider });\n  renderWalletList([...wallets.values()]); // late wallets simply appear\n});\n\n// dispatch only after the listener exists; wallets already loaded answer synchronously\nwindow.dispatchEvent(new Event('eip6963:requestProvider'));\n\nasync function connect(uuid) {\n  const { info, provider } = wallets.get(uuid);\n  localStorage.setItem('wallet', info.rdns);            // rdns is stable, uuid is not\n  provider.on('chainChanged', () => location.reload());  // this provider, not window.ethereum\n  return provider.request({ method: 'eth_requestAccounts' });\n}\n\n// info.icon is a data URI: use it as an image source, never as innerHTML",
      note: "On the next visit, pick the announcement whose `rdns` matches the stored value; only if nothing announces at all fall back to `window.ethereum`.",
    },
    pitfalls: [
      "Reading `window.ethereum` first and discovery second, which reintroduces the race that EIP-6963 exists to remove.",
      "Taking the first announcement as the user's wallet; announcements arrive in load order, not in order of preference.",
      "Persisting `uuid` to remember a choice; it only distinguishes providers within one page's lifetime, while `rdns` is the stable identifier.",
      "Inserting an SVG `icon` into the page as markup, which runs any script inside it; render it as an image.",
      "Subscribing to `chainChanged` on `window.ethereum` while sending requests through a discovered provider, so the events describe a different wallet.",
    ],
    related: ["eip-1193", "wallet-rpc", "dapp-architecture", "client-libraries", "signing-methods", "chain-id", "rpc-provider", "security"],
    sources: [
      { title: "EIP-6963: Multi Injected Provider Discovery", url: "https://eips.ethereum.org/EIPS/eip-6963" },
      { title: "EIP-1193: Ethereum Provider JavaScript API", url: "https://eips.ethereum.org/EIPS/eip-1193" },
      { title: "wagmi: createConfig", url: "https://wagmi.sh/core/api/createConfig" },
    ],
  },
  {
    id: "eip-3009",
    title: "EIP-3009 transfer with authorization",
    category: "tooling",
    aliases: ["transferWithAuthorization", "receiveWithAuthorization", "ERC-3009", "AuthorizationUsed", "authorizationState", "gasless USDC", "x402"],
    summary: "EIP-3009 lets an ERC-20 holder sign an [[eip-712|EIP-712]] authorization that moves tokens directly, bounded by a validity window and a random 32-byte nonce, so that anyone else, a relayer, the payee or a payment facilitator, can submit the [[transaction|transaction]] and pay its [[gas|gas]].",
    sections: [
      {
        heading: "The functions and the signed message",
        paragraphs: [
          "`transferWithAuthorization(from, to, value, validAfter, validBefore, nonce, v, r, s)`, selector `0xe3ee160e`, moves `value` from `from` to `to` if the signature over `TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)` recovers to `from` under the token's domain. `receiveWithAuthorization` takes the same arguments under its own type hash and adds one check: the caller must be `to`. `cancelAuthorization` lets the holder spend an unused nonce without transferring anything, and `authorizationState(authorizer, nonce)` is the view that reports whether a nonce is spent. Each use emits `AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce)`, which in USDC immediately precedes the `Transfer` [[event-log|log]] in the same receipt.",
          "The window is strict at both ends: the reference implementation and USDC require `block.timestamp` to be greater than `validAfter` and less than `validBefore`, both in seconds. The nonce is random and scoped to the authorizer rather than a counter, so a holder can have many authorizations outstanding at once, settled in any order by different submitters, and a used or cancelled nonce stays spent; USDC's revert reads `FiatTokenV2: authorization is used or canceled`. The wallet call is an ordinary `eth_signTypedData_v4`; see [[signing-methods|signing methods]].",
        ],
      },
      {
        heading: "Where it runs",
        paragraphs: [
          "ERC-3009 is still a Draft in the ERCs repository, although Circle's FiatToken v2 contracts behind USDC have shipped it alongside ERC-2612 permit for years. The domain is per deployment: `USD Coin` version `2` on Ethereum mainnet and on Base, but `USDC` on Base Sepolia, so read `name()` and `version()` or compare `DOMAIN_SEPARATOR()` rather than hardcoding one. FiatToken v2.2 adds overloads that take a single `bytes signature`, such as `0xcf092995` for the transfer, and checks them with [[erc-1271|ERC-1271]] whenever `from` has code, while the ERC's own text says it does not apply to contract accounts. Decoders that know only the ERC's selectors miss those calls, and an [[eip-7702|EIP-7702]] delegated payer is judged by its delegate rather than by ecrecover.",
          "[[x402|x402]], a payment protocol built on the HTTP 402 status code, makes EIP-3009 the preferred method of its `exact` scheme on EVM chains. The client signs an authorization whose `to` is the server's `payTo` address, with a short validity window, and sends it in the `PAYMENT-SIGNATURE` header. The facilitator recovers the signer, checks the balance and the window, simulates with [[eth-call|eth_call]], then submits `transferWithAuthorization` and pays the gas. Tokens without EIP-3009 fall back to Permit2.",
        ],
      },
      {
        heading: "Versus permit, and who can submit",
        paragraphs: [
          "ERC-2612 `permit(owner, spender, value, deadline, v, r, s)` signs an approval, not a transfer: it consumes the next value of `nonces(owner)`, emits `Approval`, and still needs a separate `transferFrom` by the spender. Sequential nonces mean two permits signed in parallel conflict, and any unspent allowance outlives the payment. An EIP-3009 authorization moves exactly `value` to exactly `to` and leaves no allowance behind, at the price of the holder generating and tracking random nonces.",
          "Anyone holding an authorization can submit it. For `transferWithAuthorization` that is mostly harmless, since `to` and `value` are fixed and a copy lifted from the [[mempool|pool]] only changes who paid the gas, though the original submitter's transaction then reverts as already used. It is harmful when a contract is meant to receive the funds and act on them: a front-runner can execute the bare transfer without the contract's deposit logic, leaving tokens that were never processed. `receiveWithAuthorization` prevents that by requiring the caller to be the payee, which is why the ERC tells contracts to use it.",
          "[[stablecoin-payments|Reconciliation]] trips on the same indirection. The transaction's `from` is the relayer or facilitator; the payer never sends anything, its [[nonce|account nonce]] does not move, and it may hold no ETH at all. The payer appears in the `Transfer` log's `topics[1]` and again in `AuthorizationUsed` with the nonce, so match payments on logs: [[eth-get-logs|eth_getLogs]] on the token with topic0 `0x98de5035…` and the payer and nonce as topics 1 and 2 finds one authorization's settlement, and `authorizationState` at a pinned block says whether it has settled. An [[indexer|indexer]] that credits the transaction sender attributes every customer's payment to one facilitator.",
        ],
      },
    ],
    example: {
      title: "Finding a payer's settlements on Base USDC",
      language: "json",
      code: "// AuthorizationUsed(authorizer indexed, nonce indexed) for one payer\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_getLogs\",\"params\":[{\n  \"address\": \"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913\",\n  \"fromBlock\": \"0x317fc00\", \"toBlock\": \"0x317fd30\",\n  \"topics\": [\n    \"0x98de503528ee59b575ef0c0a2576a82497bfc029a5685b209e9ec333479b10a5\",\n    \"0x0000000000000000000000004c1b034a2264863b6c87130793f818f7f5484261\"\n  ]\n}]}\n\n// receipt of the matching transaction (abridged); its input starts 0xe3ee160e\n{\n  \"from\": \"0xb87e1a2cc2b4643f2892768e80e41167f17c5860\",\n  \"to\": \"0x833589fcd6edb6e08f4c7c32d4f71b54bda02913\",\n  \"status\": \"0x1\",\n  \"logs\": [\n    { \"logIndex\": \"0xfc\", \"data\": \"0x\", \"topics\": [\n        \"0x98de5035…10a5\",\n        \"0x0000000000000000000000004c1b034a2264863b6c87130793f818f7f5484261\",\n        \"0x76bb6f39ebe296bc6ee1d5290d3e458d3ed9e2b608f2ffbb029dc0009f2c0cde\" ] },\n    { \"logIndex\": \"0xfd\", \"topics\": [\n        \"0xddf252ad…b3ef\",\n        \"0x0000000000000000000000004c1b034a2264863b6c87130793f818f7f5484261\",\n        \"0x0000000000000000000000009fb365e4e9385e2a39febad70368267e6f571d9a\" ],\n      \"data\": \"0x00000000000000000000000000000000000000000000000000000000000003e8\" }\n  ]\n}",
      note: "The receipt's `from` is the submitter while both logs name the payer `0x4c1b…4261`; the nonce in `topics[2]` joins the off-chain authorization to its settlement, and `0x3e8` is 1,000 units, 0.001 USDC.",
    },
    pitfalls: [
      "Attributing a payment to the transaction's `from`; under EIP-3009 that is the submitter, and the payer is in the `Transfer` log.",
      "Generating nonces from a counter, which collides as soon as two sessions sign at once; use 32 random bytes and check `authorizationState`.",
      "Writing `validBefore` in milliseconds; the contract compares it with `block.timestamp` in seconds, so the authorization effectively never expires.",
      "Hardcoding the domain name `USD Coin` on every chain; testnet deployments differ, and the transfer then reverts with an invalid signature.",
      "Using `transferWithAuthorization` into a contract that must process the deposit, which lets a front-runner move the tokens without the processing.",
    ],
    related: ["eip-712", "token-standards", "signing-methods", "erc-1271", "eth-get-logs", "event-log", "transaction", "indexer", "mempool", "paymaster", "stablecoin-payments", "x402"],
    sources: [
      { title: "ERC-3009: Transfer With Authorization", url: "https://eips.ethereum.org/EIPS/eip-3009" },
      { title: "ERC-2612: Permit Extension for EIP-20 Signed Approvals", url: "https://eips.ethereum.org/EIPS/eip-2612" },
      { title: "Circle stablecoin-evm (FiatToken source)", url: "https://github.com/circlefin/stablecoin-evm" },
      { title: "x402: exact scheme on EVM", url: "https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md" },
    ],
  },
  {
    id: "paymaster",
    title: "Paymaster",
    category: "tooling",
    aliases: ["validatePaymasterUserOp", "postOp", "gas sponsorship", "verifying paymaster", "ERC-20 paymaster", "ERC-7677", "pm_getPaymasterData", "paymasterAndData"],
    summary: "A paymaster is an [[erc-4337|ERC-4337]] contract that agrees to pay the gas for someone else's UserOperation: the EntryPoint asks it to approve the operation during validation, charges the cost to a deposit the paymaster holds in the EntryPoint, and optionally calls it again after execution to settle.",
    sections: [
      {
        heading: "Two calls and a deposit",
        paragraphs: [
          "When a UserOperation names a paymaster, the EntryPoint changes who pays. The account's `validateUserOp` still runs, but with `missingAccountFunds` of zero; the EntryPoint then checks that the paymaster's deposit — ether placed in the EntryPoint with `depositTo` — covers the operation's maximum possible cost, deducts that prefund, and calls `validatePaymasterUserOp(userOp, userOpHash, maxCost)`. The paymaster reverts to refuse, or returns a `context` byte array and a packed `validationData` word holding a signature-failure flag and a `validUntil` and `validAfter` window.",
          "After the account's call, a non-empty `context` makes the EntryPoint call `postOp(mode, context, actualGasCost, actualUserOpFeePerGas)`, where `mode` says whether the inner call succeeded or reverted; either way the paymaster pays for the [[gas|gas]]. Unused prefund returns to the paymaster's deposit, and the bundler's `eth_getUserOperationReceipt` names the `paymaster` that paid. The deposit is not the stake: `addStake` locks ether behind an unstake delay, which [[erc-7562|ERC-7562]] bundlers require before relaxing their rules for a paymaster, and that stake is never slashed and never spent on gas.",
        ],
      },
      {
        heading: "The fields, packed and unpacked",
        paragraphs: [
          "From EntryPoint v0.7 on, the JSON a wallet sends to a bundler carries four fields — `paymaster`, `paymasterVerificationGasLimit`, `paymasterPostOpGasLimit`, and `paymasterData` — which the EntryPoint receives on chain concatenated into one `paymasterAndData` value: a 20-byte address, two 16-byte gas limits, then the paymaster's data. `eth_estimateUserOperationGas`, the bundler's counterpart to [[eth-estimate-gas|eth_estimateGas]], returns `paymasterVerificationGasLimit`, but ERC-7769 notes that the post-op limit cannot be reliably estimated, so the paymaster, which pays for it, supplies it.",
          "EntryPoint v0.9 adds an optional `paymasterSignature`, appended after `paymasterData` behind the magic suffix `0x22e325a297439656` and excluded from the `userOpHash`, so the user and the sponsor can sign in parallel.",
        ],
      },
      {
        heading: "Verifying and token paymasters",
        paragraphs: [
          "A verifying paymaster delegates the decision to an off-chain sponsor, whose service applies its policy and signs a hash covering the operation's fields — every gas limit and fee included — the [[chain-id|chain id]], the paymaster's [[address|address]], and a validity window; the contract only recovers the signer with [[ecdsa-signature|ECDSA]]. ERC-7677 standardises the service: `pm_getPaymasterStubData` returns placeholder fields for gas estimation, `pm_getPaymasterData` the final signed ones, and a dapp hands the service URL to the wallet through the `paymasterService` capability of [[wallet-rpc|wallet_sendCalls]]. The reference verifying paymaster keeps its signer in an `immutable`, which lives in code rather than [[contract-storage|storage]], and returns an empty context, so it needs no stake.",
          "An ERC-20 paymaster lets the user pay in a [[token-standards|token]]. It needs a price, usually from an [[price-oracle|oracle]], and must actually collect; the pattern the ERC describes is to pre-charge the maximum possible cost and refund the excess afterwards, in `postOp`. Reading an oracle touches storage outside the sender's own, and unstaked paymasters may not return a context, so a token paymaster must stake before public bundlers accept operations that use it.",
        ],
      },
      {
        heading: "Where sponsorship fails",
        paragraphs: [
          "The first failure is money. If the deposit cannot cover the prefund, the EntryPoint reverts with `AA31 paymaster deposit too low`, and bundlers refuse earlier: they total the maximum cost of every pending operation naming the paymaster and reject new ones with [[rpc-errors|error]] `-32508` once the deposit is exceeded. A sponsor that keeps signing after that point issues approvals nobody can use.",
          "The second is drift between estimation and submission. Stub data must match the final data in length, must not contain more zero bytes, and must drive the same code path, or `preVerificationGas` and the gas limits come out too low. Because the sponsor signed the gas fields, a wallet that re-estimates after `pm_getPaymasterData` gets `AA34 signature error`, and one that submits after `validUntil` gets `AA32 paymaster expired or not due` or bundler error `-32503`.",
          "The third is a reverting `postOp`. Under v0.7 the EntryPoint then rolls back the account's execution too, emits a `PostOpRevertReason` [[event-log|event]], marks the operation failed, and still charges the paymaster's deposit — so a token paymaster that collects only after execution can be griefed into paying for operations that end up doing nothing.",
        ],
      },
    ],
    example: {
      title: "Asking a sponsor for stub fields, and what the EntryPoint finally sees",
      language: "json",
      code: "// 1. before gas estimation: stub values from the paymaster service (ERC-7677)\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"pm_getPaymasterStubData\",\"params\":[\n  {\n    \"sender\": \"0x9d2c…4a71\",\n    \"nonce\": \"0x7\",\n    \"callData\": \"0xb61d27f6…\",\n    \"callGasLimit\": \"0x0\",\n    \"verificationGasLimit\": \"0x0\",\n    \"preVerificationGas\": \"0x0\",\n    \"maxFeePerGas\": \"0x1dcd6500\",\n    \"maxPriorityFeePerGas\": \"0x3b9aca00\"\n  },\n  \"0x0000000071727De22E5E9d8BAf0edAc6f37da032\",\n  \"0xaa36a7\",\n  { \"policyId\": \"962b252c-a726-4a37-8d86-333ce0a07299\" }\n]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":{\n  \"sponsor\": { \"name\": \"Example App\" },\n  \"paymaster\": \"0x7e1f…c0de\",\n  \"paymasterData\": \"0x0000…6a1b0000…0101…01\",\n  \"paymasterVerificationGasLimit\": \"0x9c40\",\n  \"paymasterPostOpGasLimit\": \"0x0\"\n}}\n\n// 2. eth_estimateUserOperationGas fills the account's gas limits,\n//    then the same params go to pm_getPaymasterData for the signed paymasterData\n\n// 3. packed for EntryPoint v0.7 on chain:\n// paymasterAndData = paymaster (20 bytes) | 0x…9c40 (16 bytes) | 0x…0000 (16 bytes) | paymasterData",
      note: "The stub carries a dummy signature of the real length; the final `paymasterData` signs the gas values, so nothing about gas may change after `pm_getPaymasterData` returns.",
    },
    pitfalls: [
      "Re-estimating or bumping fees after `pm_getPaymasterData`, which changes fields the sponsor signed and turns a sponsored operation into `AA34 signature error`.",
      "Funding the paymaster's stake and forgetting its deposit; the stake is locked for reputation and never pays for gas.",
      "Returning stub `paymasterData` that is shorter than the real data or has more zero bytes, so `preVerificationGas` is underestimated and the signed operation is rejected.",
      "Assuming the paymaster passed in `paymasterService` is the one that paid; ERC-7677 lets the wallet substitute its own, so read `paymaster` from the receipt.",
      "Embedding a paymaster provider's API-keyed URL in client code instead of proxying it through the app's backend, as ERC-7677's security section recommends.",
    ],
    related: ["erc-4337", "erc-7562", "wallet-rpc", "eip-7702", "token-standards", "gas", "eth-estimate-gas", "ecdsa-signature", "rpc-errors", "dapp-architecture"],
    sources: [
      { title: "ERC-4337: Account Abstraction Using Alt Mempool", url: "https://eips.ethereum.org/EIPS/eip-4337" },
      { title: "ERC-7677: Paymaster Web Service Capability", url: "https://eips.ethereum.org/EIPS/eip-7677" },
      { title: "ERC-7769: JSON-RPC API for ERC-4337", url: "https://eips.ethereum.org/EIPS/eip-7769" },
      { title: "eth-infinitism/account-abstraction (EntryPoint releases)", url: "https://github.com/eth-infinitism/account-abstraction" },
    ],
  },
  {
    id: "erc-7562",
    title: "Validation scope rules (ERC-7562)",
    category: "tooling",
    aliases: ["ERC-7562", "banned opcodes", "associated storage", "bundler reputation", "entity staking", "mass invalidation", "erc7562Tracer", "unsafe mode"],
    summary: "ERC-7562 is the rule set bundlers apply to the validation phase of every [[erc-4337|ERC-4337]] UserOperation — banned opcodes, limited storage access, and staking and reputation for shared contracts — so that one cheap on-chain change cannot invalidate many operations already accepted into the shared pool.",
    sections: [
      {
        heading: "The problem it solves",
        paragraphs: [
          "An ordinary [[transaction|transaction]]'s validity rests on a signature, a [[nonce|nonce]], and a balance, and only another transaction from the same sender can invalidate it — by paying a fee. A UserOperation's validity is whatever the account's `validateUserOp` and the [[paymaster|paymaster]]'s `validatePaymasterUserOp` compute, and that code could read anything. Without limits, an attacker fills the pool with operations that all check one storage slot, flips the slot with one write costing about 5,000 gas, and leaves every bundler holding thousands of operations that now fail and pay nothing: a mass invalidation attack.",
          "The rules sandbox validation so each operation depends only on its own sender's state, and so that global contracts — factories, paymasters, aggregators — are identifiable and can be throttled. They cover only validation frames; the account's execution and the paymaster's `postOp` are unrestricted, since payment is guaranteed once validation passes. Every bundler on the shared P2P pool, the ERC-4337 counterpart of a node's [[mempool|transaction pool]], must enforce the same rules, because a bundler that forwards operations its peers judge invalid is marked a spammer and disconnected.",
        ],
      },
      {
        heading: "Opcodes and storage",
        paragraphs: [
          "Rule OP-011 blocks opcodes that read the environment rather than state: `ORIGIN`, `GASPRICE`, `BLOCKHASH`, `COINBASE`, `TIMESTAMP`, `NUMBER`, `PREVRANDAO`, `GASLIMIT`, `BASEFEE`, `BLOBHASH`, `BLOBBASEFEE`, `INVALID`, `SELFDESTRUCT`, and `CREATE` except in narrow account-deployment cases. Their values change between simulation and inclusion: `require(block.number == N)` passes in the pool and fails on chain. `GAS` is allowed only right before a `*CALL`, `CALL` with value only into the EntryPoint, `BALANCE` only for staked entities, and calls only to the stateless [[precompiles|precompiles]] `0x01` to `0x11` plus P256VERIFY. An account that needs an expiry returns `validUntil` in its `validationData` for the EntryPoint to check.",
          "Storage is limited to the sender's own [[contract-storage|storage]] and its associated storage elsewhere: a slot whose value is the sender's address, or whose key is `keccak256(sender ‖ x) + n` for `n` up to 128 — how a Solidity mapping keyed by address lays out, so an existing account can read its own [[token-standards|token]] balance. [[transient-storage|Transient storage]] counts as storage. A staked factory or paymaster may also use its own storage and read other contracts freely, and the code hash of every contract validation touched must not change between the first validation and the second.",
        ],
      },
      {
        heading: "Staking and reputation",
        paragraphs: [
          "Each bundler tracks the shared entities: `opsSeen` counts valid operations received that reference one and `opsIncluded` those that landed, both decaying by 23/24 every hour. An entity is THROTTLED when `opsSeen / 10` exceeds `opsIncluded + 10` and BANNED past `opsIncluded + 50`; a banned paymaster's operations are dropped and new ones refused with [[rpc-errors|error]] `-32504`.",
          "Staking makes a new identity expensive: at least a chain-specific `MIN_STAKE_VALUE`, roughly $1,000 worth, locked behind an unstake delay of at least one day. The stake is never slashed; it only stops an attacker spinning up fresh paymasters faster than reputation catches them, and it buys the extra storage access above. Aggregators must always stake, an unstaked paymaster may not return a `context`, and an unstaked sender may have at most four operations pending.",
        ],
      },
      {
        heading: "What a bundler needs from its node",
        paragraphs: [
          "Enforcement means tracing. The bundler simulates validation with [[debug-api|debug_traceCall]] and a tracer that records opcodes, storage slots, and call frames per entity, checks the [[execution-trace|trace]] against the rules, and traces the whole bundle again before submitting it. Rundler, Alto, and the eth-infinitism reference bundler send a JavaScript tracer as a string in the request; [[geth|Geth]] has shipped a native `erc7562Tracer` since v1.16.0. Hardhat's node and Ganache cannot run it, and many [[rpc-provider|hosted endpoints]] disable `debug_` or accept only named built-in tracers, so a bundler usually needs its own node; see [[endpoint-capabilities|endpoint capabilities]].",
          "The escape hatch is unsafe mode — `--unsafe` on Rundler and the reference bundler, `--safe-mode` switched off on Alto — which skips the trace and therefore the rules. That suits a private bundler serving known accounts on a devnet, but such a bundler cannot safely join the shared pool. Native account abstraction reuses the work: RIP-7560 tells block builders to apply these rules, and the draft EIP-8141 frame transaction defines a mempool policy inspired by ERC-7562 but without staking or reputation.",
        ],
      },
    ],
    pitfalls: [
      "Reading `block.timestamp` in `validateUserOp` to expire a session key, which bundlers reject; return `validUntil` in `validationData` instead.",
      "Pointing a bundler at an endpoint that rejects custom tracers, then enabling unsafe mode in production to silence the errors.",
      "Letting an unstaked paymaster read an oracle or its own storage, so every public bundler refuses operations that name it.",
      "Testing an account only against a local bundler in unsafe mode, which accepts validation code that public bundlers will reject.",
    ],
    related: ["erc-4337", "paymaster", "debug-api", "execution-trace", "mempool", "transient-storage", "precompiles", "geth", "eip-7702", "rpc-provider"],
    sources: [
      { title: "ERC-7562: Account Abstraction Validation Scope Rules", url: "https://eips.ethereum.org/EIPS/eip-7562" },
      { title: "ERC-4337: Account Abstraction Using Alt Mempool", url: "https://eips.ethereum.org/EIPS/eip-4337" },
      { title: "Rundler CLI documentation", url: "https://github.com/alchemyplatform/rundler/blob/main/docs/cli.md" },
      { title: "go-ethereum: add erc7562 tracer (PR #31006)", url: "https://github.com/ethereum/go-ethereum/pull/31006" },
    ],
  },
  {
    id: "faucet",
    title: "Testnet faucet",
    category: "tooling",
    aliases: ["faucet", "testnet ETH", "Sepolia faucet", "PoW faucet", "PoWFaucet", "drip", "free test ether"],
    summary: "A faucet is a service that sends small amounts of [[testnets|testnet]] ether from a funded wallet to whoever asks, rationed by rate limits and anti-bot checks because the supply it hands out is finite even though the ether is worthless.",
    sections: [
      {
        heading: "Where testnet ether comes from",
        paragraphs: [
          "Nothing mints ether for a faucet. On a [[proof-of-stake|proof-of-stake]] testnet new ether enters only through the [[genesis|genesis]] allocation and validator issuance, and both land with whoever controls those keys — on Sepolia, whose validator set is permissioned, a small group of operators. A faucet is a wallet one of them funded, plus a front end that signs a transfer to your [[address|address]] and submits it with [[eth-send-raw-transaction|eth_sendRawTransaction]]. When its balance runs out, it stops.",
          "That makes testnet ether scarce on long-lived networks even though it is worthless by design. Demand grows with every project, airdrop farmers generate activity to qualify for rewards, and on Goerli testnet ether acquired a market price, which paid bots to drain faucets as fast as they were refilled. Resetting and private networks sidestep the problem: [[ephemery|Ephemery]] premines its faucet wallets again in every new genesis, and a [[local-devnet|local devnet]] or a [[kurtosis|Kurtosis]] network starts with prefunded keys, so neither needs a faucet in the usual sense.",
        ],
      },
      {
        heading: "How faucets ration",
        paragraphs: [
          "Every faucet design tries to make one claim cheap for a person and expensive for a bot. A proof-of-work faucet such as pk910's PoWFaucet, which runs instances for Sepolia, Hoodi, and Ephemery, has the browser compute hashes against a server-issued challenge and pays per accepted share; the hashing mines nothing, it only prices the claim in time and electricity. Account-gated faucets tie claims to something costly to fake: a GitHub account of a minimum age, a Gitcoin Passport score, a login with the operating company, or a mainnet balance — Alchemy's Sepolia faucet requires at least 0.001 ETH on mainnet.",
          "Underneath sit ordinary [[rate-limits|rate limits]]: claims per address and per IP per day, refusal of hosting and VPN address ranges, a ceiling on the recipient's existing balance, refusal of contract recipients, and an outflow budget that shrinks payouts as the faucet's own balance falls. The messages a user sees — already claimed, balance too high, a captcha loop, a queue — are these policies, not [[rpc-errors|RPC errors]].",
        ],
      },
      {
        heading: "Running one",
        paragraphs: [
          "Operating a faucet means holding a hot wallet and talking to a node. PoWFaucet's configuration is typical: an RPC endpoint, or several ranked by priority, a private key, the [[chain-id|chain id]] or auto-detection of it, a gas limit of 21,000 so payouts cannot run contract code, fee caps, and a cap on unconfirmed transactions, twelve in the example configuration. A stream of transfers from one account is a [[nonce|nonce]]-management problem: concurrent claims take consecutive nonces, and one transfer stuck in the [[mempool|pool]] behind a fee spike holds up every later one until it is replaced.",
          "The key is the thing to protect, since whoever obtains it drains the faucet in one transaction, and because it signs every payout unattended it cannot sit behind a hardware wallet's confirmation button. A faucet that relies on a public [[rpc-provider|provider]] endpoint also inherits that endpoint's rate limits at exactly the moment demand peaks, which is why PoWFaucet broadcasts each transaction to more than one endpoint and can queue claims while it waits to be refilled.",
        ],
      },
      {
        heading: "Not a mainnet concept",
        paragraphs: [
          "Faucets exist only because testnet ether is free by agreement. Mainnet has no faucets in this sense, and a site that asks for a seed phrase or a small activation payment to release funds is a scam. Layer 2 testnets usually fund users by [[bridge|bridging]] Sepolia ether or through their own faucets, and code that will eventually run on mainnet can be exercised first against a forked local node that sets any balance it likes.",
        ],
      },
    ],
    pitfalls: [
      "Claiming from a public faucet at the start of every CI run; rate limits and bot checks will fail it intermittently, and prefunded devnet keys do not.",
      "Requesting a payout to a smart account whose receive function runs code; a faucet that sends with a 21,000 gas limit or refuses contracts cannot pay it.",
      "Sending payouts concurrently without tracking nonces, so a single underpriced transfer stalls the whole queue.",
      "Running a faucet from a key that also holds other funds, so one leak drains more than the faucet's float.",
      "Planning a heavy test campaign on a long-lived testnet's faucet payouts instead of a network that resets or a devnet you fund yourself.",
    ],
    related: ["testnets", "ephemery", "local-devnet", "kurtosis", "nonce", "rate-limits", "mempool", "chain-id", "eth-send-raw-transaction", "bridge"],
    sources: [
      { title: "ethereum.org: Networks (testnet faucets)", url: "https://ethereum.org/developers/docs/networks/" },
      { title: "pk910/PoWFaucet", url: "https://github.com/pk910/PoWFaucet" },
      { title: "Alchemy Sepolia faucet", url: "https://www.alchemy.com/faucets/ethereum-sepolia" },
    ],
  },
  {
    id: "kurtosis",
    title: "Kurtosis ethereum-package",
    category: "tooling",
    aliases: ["kurtosis", "ethereum-package", "kurtosis run", "network_params.yaml", "enclave", "multi-client devnet", "ethPandaOps"],
    summary: "Kurtosis is a container orchestrator for reproducible test environments, and ethPandaOps' `ethereum-package` for it launches a private multi-client Ethereum network — real [[execution-client|execution]] and [[consensus-client|consensus clients]], validators, and optional tooling — from one YAML args file.",
    sections: [
      {
        heading: "What one command starts",
        paragraphs: [
          "`kurtosis run --enclave my-testnet github.com/ethpandaops/ethereum-package --args-file network_params.yaml` generates matching execution and consensus [[genesis|genesis]] files with ethPandaOps' genesis generator, then starts each participant as a set of containers — an execution client, a [[beacon-node|beacon node]], and a [[validator-client|validator client]] — wired together over the [[engine-api|Engine API]] with a shared JWT secret and peered with every other participant. Everything lives in an enclave, an isolated environment that persists until `kurtosis enclave rm -f my-testnet` removes it, and the same package runs on local Docker or on Kubernetes.",
          "It is the standard harness for multi-client work: ethPandaOps and client teams use it to bring up interop devnets and rehearse [[hardfork|forks]], Lighthouse's local testnet scripts are built on it, and the package's own repository keeps a directory of configurations exercised in CI on every pull request. Set `network_params.network` to a public network such as `sepolia`, `hoodi`, or `ephemery` and it joins that network instead; a `-shadowfork` suffix, with `persistent: true`, forks a real network's state into a private copy so an upgrade can be tested against production-sized state.",
        ],
      },
      {
        heading: "The args file",
        paragraphs: [
          "`participants` is a list. Each entry names `el_type` and `cl_type`, optionally `vc_type`, image overrides such as `el_image` for testing your own build, extra flags, and `count` to replicate the pair. Execution types include `geth`, `nethermind`, `erigon`, `besu`, `reth`, and `nimbus-eth1`; consensus types are `lighthouse`, `teku`, `prysm`, `nimbus`, `lodestar`, and `grandine`. `network_params` shapes the chain: `network_id`, which also becomes the [[chain-id|chain id]] and defaults to 3151908, `seconds_per_slot`, validator keys per node, and one epoch per fork — `electra_fork_epoch`, `fulu_fork_epoch`, `gloas_fork_epoch` — where the maximum uint64 value means the fork never activates.",
          "`additional_services` adds the surrounding infrastructure: `dora` as a beacon explorer, `blockscout` as an execution [[block-explorer|block explorer]], `spamoor` and `tx_fuzz` to generate transaction load, `blobscan` for [[blob|blobs]], `prometheus` and `grafana` for metrics, and `assertoor` to run checks such as ‘the chain finalises’ against the live network. `mev_type` stands up [[mev-boost|MEV-Boost]] with a [[relay|relay]] and builder, and `wait_for_finalization: true` makes the run block until the first epoch finalises.",
        ],
      },
      {
        heading: "Reaching the nodes",
        paragraphs: [
          "Services get names such as `el-1-nethermind-lighthouse` and `cl-1-lighthouse-nethermind`, and their ports are published on random host ports: `kurtosis enclave inspect my-testnet` lists them, and `kurtosis port print my-testnet el-1-nethermind-lighthouse rpc` prints the JSON-RPC URL. The clients start with generous [[namespaces|namespaces]] — Geth with `admin`, `debug`, and `txpool` on HTTP, Nethermind with `trace` as well — so tracing and pool inspection work where a public endpoint would refuse them. The genesis prefunds 21 test keys that are published in the package's source, which is why they must never hold value anywhere else.",
          "The contrast with a simulated node is the point. [[local-devnet|Anvil or a Hardhat simulated network]] is one process that mines on demand, fakes the clock, and runs no consensus, so [[finality|finality]], the `safe` and `finalized` tags, [[reorg|reorgs]], proposer behaviour, and [[client-diversity|disagreements between clients]] cannot appear there. A Kurtosis network has real slots, real attestations, and real client bugs, at the cost of minutes to start, several containers per participant, and gigabytes of memory for even a small mix.",
        ],
      },
    ],
    example: {
      title: "A four-node, three-client devnet with a scheduled fork",
      language: "yaml",
      code: "# network_params.yaml\nparticipants:\n  - el_type: nethermind\n    cl_type: lighthouse\n    count: 2\n  - el_type: geth\n    cl_type: teku\n  - el_type: reth\n    cl_type: prysm\nnetwork_params:\n  network_id: \"3151908\"\n  seconds_per_slot: 12\n  fulu_fork_epoch: 0\n  gloas_fork_epoch: 10\nadditional_services:\n  - dora\n  - spamoor\n  - prometheus\n  - grafana\nwait_for_finalization: true\n\n# run it, then find the first Nethermind node's RPC URL\n# kurtosis run --enclave fork-test github.com/ethpandaops/ethereum-package --args-file network_params.yaml\n# kurtosis port print fork-test el-1-nethermind-lighthouse rpc",
      note: "Every participant must cross epoch 10 onto the new fork together; an image that does not implement it stalls or splits off, which is exactly what the run is there to catch.",
    },
    pitfalls: [
      "Leaving images on `latest`, so the same args file tests different client versions from one week to the next; pin tags in `el_image` and `cl_image`.",
      "Running the package from its default branch in CI instead of pinning a release with `github.com/ethpandaops/ethereum-package@<tag>`.",
      "Hard-coding host ports copied from one run; they are reassigned every time unless `port_publisher` fixes them.",
      "Expecting `finalized` to move within seconds of genesis; like any beacon chain the devnet needs a couple of epochs of attestations first.",
      "Reusing the prefunded genesis keys on a public network, where anyone who has read the package source can spend from them.",
    ],
    related: ["local-devnet", "testnets", "hardfork", "execution-client", "consensus-client", "client-diversity", "engine-api", "mev-boost", "genesis", "ephemery", "hive"],
    sources: [
      { title: "ethpandaops/ethereum-package", url: "https://github.com/ethpandaops/ethereum-package" },
      { title: "Kurtosis CLI: run", url: "https://docs.kurtosis.com/run" },
      { title: "Kurtosis CLI: port print", url: "https://docs.kurtosis.com/port-print" },
    ],
  },
  {
    id: "chainlist",
    title: "Chainlist and chain registries",
    category: "tooling",
    aliases: ["chainlist.org", "ethereum-lists/chains", "chainid.network", "wallet_addEthereumChain", "EIP-3085", "add network", "public RPC list"],
    summary: "Chainlist is a directory of EVM networks keyed by [[chain-id|chain id]], built from the community ethereum-lists/chains registry plus its own list of public RPC URLs, that lets a user add a network to their wallet with one click through `wallet_addEthereumChain`.",
    sections: [
      {
        heading: "Where the data comes from",
        paragraphs: [
          "The registry underneath is the `ethereum-lists/chains` repository on GitHub: one JSON file per chain, named after its CAIP-2 identifier such as `eip155-1.json`, with `name`, `chain`, `chainId`, `networkId`, `nativeCurrency`, `rpc`, `faucets`, `explorers`, and optional `parent` and `status` fields. It is aggregated into `https://chainid.network/chains.json`, which chainlist.org fetches and merges with two lists of its own — extra chain entries and `extraRpcs.js`, additional public endpoints — that anyone can extend by pull request; the combined result is served at `https://chainlist.org/rpcs.json`.",
          "The registry is first come, first served. A pull request that claims an id already taken is closed, a chain is never deleted but marked `deprecated`, and an id reassigned after deprecation carries the red flag `reusedChainId` that clients are expected to show. Nothing stops unrelated private networks from using the same number outside the registry, so an entry proves only that one team registered it first. Entries also go stale: at the time of writing, the first two Sepolia URLs in the registry, `rpc.sepolia.org` and `rpc2.sepolia.org`, no longer answered JSON-RPC at all.",
        ],
      },
      {
        heading: "Adding a network to a wallet",
        paragraphs: [
          "The add-to-wallet button issues [[wallet-rpc|wallet_addEthereumChain]] (EIP-3085) through the page's [[eip-1193|EIP-1193 provider]] with `chainId` as a hex string, `chainName`, `nativeCurrency` as name, symbol, and decimals, `rpcUrls`, and optionally `blockExplorerUrls` and `iconUrls`. The EIP requires the wallet to reject the request if `rpcUrls` is empty, if any URL uses `http:` or `file:`, or if `chainId` does not match what `eth_chainId` returns from the RPC URLs, and to refuse adding the same chain id twice. It also tells the wallet to sign only with the submitted chain id, never one reported by an endpoint, since a faulty or malicious endpoint could otherwise steer the user into signing for another chain.",
          "The call returns `null` on success, and the EIP says the new chain must not be assumed to be selected; a dapp that needs it follows with `wallet_switchEthereumChain` and re-reads `eth_chainId`. EIP-3085 itself is marked Stagnant, yet wallets implement it widely, and it asks them to check requests against a list of known chains, which is why a wallet may warn when a name or currency symbol does not match its records.",
        ],
      },
      {
        heading: "Choosing an endpoint from the list",
        paragraphs: [
          "A chainlist entry is a pointer to someone's server, and that operator sees every request: your IP address, the accounts you query, and your transactions before they are public. Chainlist labels each endpoint with the operator's own claim — a `tracking` value of `none`, `limited`, or `yes` — plus the text of its privacy statement; the labels arrive with each pull request and nobody audits them. A public endpoint is also typically [[rate-limits|rate limited]], may lag the head, and may be pruned or lack `debug_` and `trace_`, so it is fine behind a wallet and wrong as the backend of an [[indexer|indexer]] or a [[load-balancer|load-balanced]] production pool.",
          "Verify rather than trust. Send `eth_chainId` to a URL before using it and compare it with the id you expect, check `web3_clientVersion` and the head [[block|block]] number against a second source, and treat an RPC URL that arrived in a site's `wallet_addEthereumChain` prompt as that site's choice, not the network's. A dishonest endpoint cannot forge signatures, but it can misreport balances, hide transactions, or serve a stale head; [[state-proof|state proofs]] and [[verified-rpc|verified RPC]] exist for the cases where that matters.",
        ],
      },
    ],
    example: {
      title: "Building an add-network request from the registry, keeping only URLs that prove their chain id",
      language: "js",
      code: "const chains = await (await fetch('https://chainid.network/chains.json')).json();\nconst sepolia = chains.find(c => c.chainId === 11155111);\n\n// drop URLs that need an API key placeholder, then ask each one which chain it serves\nconst rpcUrls = [];\nfor (const url of sepolia.rpc.filter(u => u.startsWith('https://') && !u.includes('${'))) {\n  try {\n    const res = await fetch(url, {\n      method: 'POST',\n      headers: { 'content-type': 'application/json' },\n      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),\n    });\n    const { result } = await res.json();\n    if (BigInt(result) === 11155111n) rpcUrls.push(url);\n  } catch { /* dead or not JSON-RPC: skip it */ }\n}\n\nawait provider.request({\n  method: 'wallet_addEthereumChain',\n  params: [{\n    chainId: '0x' + sepolia.chainId.toString(16),   // '0xaa36a7'\n    chainName: sepolia.name,\n    nativeCurrency: sepolia.nativeCurrency,\n    rpcUrls,\n    blockExplorerUrls: (sepolia.explorers ?? []).map(e => e.url),\n  }],\n});",
      note: "The `${INFURA_API_KEY}` placeholders in the registry mark URLs that need a key; the `eth_chainId` loop is the same check EIP-3085 asks the wallet to make, done before the prompt instead of after it.",
    },
    pitfalls: [
      "Treating a registered chain id as globally unique; private and abandoned networks reuse ids outside the registry.",
      "Reading a `none` tracking label as a [[rpc-privacy|privacy guarantee]]; it is the operator's own description, not an audit.",
      "Hard-coding the first chainlist URL for a chain into production code, tying the app to an unknown operator's uptime and rate limits.",
      "Assuming `wallet_addEthereumChain` also switched networks; follow it with a switch request and re-read `eth_chainId`.",
    ],
    related: ["chain-id", "wallet-rpc", "eip-1193", "rpc-provider", "testnets", "rate-limits", "security", "verified-rpc", "net-web3-api", "ephemery"],
    sources: [
      { title: "EIP-3085: wallet_addEthereumChain RPC Method", url: "https://eips.ethereum.org/EIPS/eip-3085" },
      { title: "ethereum-lists/chains", url: "https://github.com/ethereum-lists/chains" },
      { title: "DefiLlama/chainlist (chainlist.org source)", url: "https://github.com/DefiLlama/chainlist" },
    ],
  },
  {
    id: "dex-pool-reads",
    title: "Reading DEX pool state",
    category: "tooling",
    aliases: ["AMM pool state", "getReserves", "slot0", "extsload", "StateView", "pool reserves", "tick bitmap"],
    summary: "Reading DEX pool state means fetching the token balances, prices and liquidity of a decentralised exchange's pools over RPC, through each design's own getters, [[event-log|events]] and [[contract-storage|storage layout]], so that an interface, router or bot can price a trade against one consistent block.",
    sections: [
      {
        heading: "Pools and reserves: Uniswap v2 and v3",
        paragraphs: [
          "A decentralised exchange (DEX) lets anyone swap one [[token-standards|token]] for another against a pool, a [[smart-contract|contract]] holding two tokens that liquidity providers deposited in return for trading fees. Most pools are automated market makers (AMMs): they price trades from their own holdings, the reserves, instead of matching buyers with sellers. Showing what a swap returns, choosing between pools and spotting a price gap all start the same way: read pool state over RPC and apply the pool's pricing rule.",
          "A Uniswap v2 pair needs two numbers: `getReserves()` returns `reserve0` and `reserve1`, and every change emits `Sync`. Selling `x` tokens returns `x·997·Rout / (Rin·1000 + x·997)`, where `Rin` and `Rout` are the reserves of the token sold and the token bought, and 997/1000 takes the 0.3% fee. At block 26,297,957 the USDC/WETH pair held 9,747,161.55 USDC and 4,199.24 WETH (ether wrapped as a token), a ratio of 2,321.17 USDC per WETH, so one [[eth-call|eth_call]] was enough to price 1 WETH at 2,313.66 USDC; the fee and the trade's own pull on the ratio make up the gap.",
          "Uniswap v3 lets each provider place liquidity in a chosen price range, so the liquidity a trade meets changes as the price moves, and a quote walks from range to range. `slot0()` returns `sqrtPriceX96`, the square root of the price scaled by 2^96, and the current `tick`: tick `i` is the price 1.0001^i, a 0.01% step. `liquidity()` is the liquidity active at the current price; the more there is, the less a trade moves the price. It changes at initialized ticks, where some range begins or ends: `tickBitmap(int16)` marks them, and `ticks(int24)` returns each one's `liquidityNet`, the liquidity added or removed when the price crosses it. Selling 10,000 WETH into the 0.05% pool crossed 136 initialized ticks, each a further read.",
        ],
      },
      {
        heading: "Uniswap v4: one contract, read by slot",
        paragraphs: [
          "Uniswap v4 keeps every pool inside one contract, `PoolManager` at `0x000000000004444c5dc75cB358380D2e3dE08A90`. A pool is named by its `PoolId`, the [[keccak-256|keccak256]] hash of its key: `currency0`, `currency1` (native ether is `address(0)`), `fee`, `tickSpacing` and `hooks`. There are no per-pool getters. `PoolManager.extsload(bytes32)` returns any raw storage word, and v4-core's `StateLibrary` says where to look: pools are a mapping (a key-value table) at slot 6, so a pool's state starts at `keccak256(poolId . 6)`, the hash of the id followed by the number 6. That word holds `slot0`, and `liquidity` sits three slots on. The `StateView` contract wraps the same reads in getters.",
          "All v4 pools log from `PoolManager` with the pool id in `topics[1]` of each [[event-signature|event]], so one [[eth-get-logs|eth_getLogs]] filter follows one pool. A hook is a contract attached to a pool that runs its own code around swaps: one with the `beforeSwapReturnDelta` permission can take or add tokens during a swap, and a pool whose `fee` is `0x800000` lets its hook set the fee per swap. For such pools `slot0` and the tick map alone cannot price a trade, so readers fall back to a [[quoter-contract|quoter]], a contract that runs the swap itself, hook included.",
        ],
      },
      {
        heading: "Curve: a price that moves without trades",
        paragraphs: [
          "Curve's StableSwap pools, for assets meant to trade near 1:1 such as DAI, USDC and USDT in 3pool, are Vyper contracts holding `balances(i)`, a `fee()` and an amplification `A()`, which keeps the price flatter near balance the higher it is. The pricing equation is solved in a loop, so most readers call the pool's own view, `get_dy(i, j, dx)`, the output for selling `dx` of coin `i` for coin `j`. `A()` ramps linearly with `block.timestamp` between two scheduled values, so a quote can move between blocks with no trade and no event.",
        ],
      },
      {
        heading: "Polling, mirroring and one consistent block",
        paragraphs: [
          "Polling re-reads every watched pool on each new head, the newest block, in one [[multicall|Multicall3]] batch, so its cost grows with the number of pools. Mirroring reads each pool once at block N and then applies its events: a v2 `Sync` replaces both reserves, a v3 `Swap` carries the new `sqrtPriceX96`, `liquidity` and `tick`, and `Mint` and `Burn` adjust `liquidityNet`. Its cost grows with trading activity instead, so [[searcher|searchers]] and [[dex-aggregator|aggregators]] tracking thousands of pools mirror from [[eth-subscribe|eth_subscribe]] logs and reconcile with occasional polls.",
          "Every read behind one quote must come from one block, or the quote mixes prices that never existed together. Separate `latest` calls through a [[load-balancer|load balancer]] can hit nodes at different heights, as can the entries of a JSON-RPC batch, so pin a [[block-tag|block number or hash]] or use one multicall; pinning the newest block can reach a [[head-lag|lagging backend]] that answers `header not found`. A [[reorg|reorg]] reaches a mirror as logs with `removed: true`, and undoing them needs the earlier pool state, so mirrors keep a few blocks of snapshots. Some changes log nothing: a rebasing token's balance moves without transfers, so a v2 pair holding one drifts from its reserves until someone calls `sync`.",
        ],
      },
    ],
    example: {
      title: "A v2 pair and a v4 pool, read at the same block",
      language: "json",
      code: "// Uniswap v2 USDC/WETH pair: getReserves() at block 26,297,957\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[\n  {\"to\":\"0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc\",\"data\":\"0x0902f1ac\"},\n  \"0x1914665\"\n]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x000000000000000000000000000000000000000000000000000008dd701a06960000000000000000000000000000000000000000000000e3a4257d5bbb23df92000000000000000000000000000000000000000000000000000000006ae326db\"}\n// three 32-byte words; token0 is USDC, the lower address\n// reserve0 = 0x8dd701a0696        = 9,747,161.548438 USDC (6 decimals)\n// reserve1 = 0xe3a4257d5bbb23df92 = 4,199.2389 WETH (18 decimals)\n// blockTimestampLast = 1793271515, when the reserves last changed\n// 1 WETH in: 10^18 × 997 × reserve0 / (reserve1 × 1000 + 10^18 × 997) = 2,313.66 USDC\n\n// Uniswap v4 ETH/USDC: currency0 native ether (address(0)), currency1 USDC,\n// fee 500 (0.05%), tick spacing 10, no hook\n// poolId 0x21c67e77068de97969ba93d4aab21826d33ca12bb9f565d8496e8fda8a82ca27\n// its slot0 is the word at keccak256(poolId . 6) = 0xda8cac36…bdfc, read with extsload(bytes32)\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_call\",\"params\":[\n  {\"to\":\"0x000000000004444c5dc75cB358380D2e3dE08A90\",\n   \"data\":\"0x1e2eaeafda8cac368d67cd2f2d8aaa5cc531768e0fa3b1d205c5c5de60da078e1f59bdfc\"},\n  \"0x1914665\"\n]}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"result\":\"0x0000000001f407d07dfcf76b0000000000000000000328fe38678dd40b945388\"}\n\n// unused   lpFee    protocolFee  tick      sqrtPriceX96 (low 160 bits)\n// 000000   0001f4   07d07d       fcf76b    0000000000000000000328fe38678dd40b945388\n//          = 500    = 125|125    = -198805 = 3820361655526526150792072\n//          (0.05%)  (each way)\n// price = (sqrtPriceX96 / 2^96)^2 × 10^12 = 2,325.14 USDC per ETH\n// (× 10^12 because ETH has 18 decimals and USDC 6)",
      note: "Both reads name block `0x1914665`, so the two prices, 2,321.17 on v2 and 2,325.14 on v4 before fees, describe the same moment; the v4 word packs four fields, and `liquidity` sits three slots further on, at `…bdff`, read with the same `extsload` call.",
    },
    pitfalls: [
      "Pricing a v3 trade from `slot0` and `liquidity` alone, which is right only until the price reaches the next initialized tick.",
      "Looking for a v4 pool's own contract; pools exist only as storage inside `PoolManager`.",
      "Applying mirrored logs without handling `removed: true`, which leaves reserves from a block that is no longer canonical.",
    ],
    related: ["quoter-contract", "dex-aggregator", "multicall", "eth-call", "eth-get-logs", "eth-subscribe", "contract-storage", "reorg", "searcher", "price-oracle"],
    sources: [
      { title: "Uniswap v2-core: UniswapV2Pair.sol", url: "https://github.com/Uniswap/v2-core/blob/master/contracts/UniswapV2Pair.sol" },
      { title: "Uniswap v3-core: IUniswapV3PoolState.sol", url: "https://github.com/Uniswap/v3-core/blob/main/contracts/interfaces/pool/IUniswapV3PoolState.sol" },
      { title: "Uniswap v4-core: StateLibrary.sol", url: "https://github.com/Uniswap/v4-core/blob/main/src/libraries/StateLibrary.sol" },
      { title: "Curve 3pool: StableSwap3Pool.vy", url: "https://github.com/curvefi/curve-contract/blob/master/contracts/pools/3pool/StableSwap3Pool.vy" },
    ],
  },
  {
    id: "quoter-contract",
    title: "Quoter contracts",
    category: "tooling",
    aliases: ["QuoterV2", "V4Quoter", "quoteExactInputSingle", "revert-with-data", "lens contract", "queryBatchSwap", "TickLens"],
    summary: "A quoter contract is a helper deployed only to be called through [[eth-call|eth_call]]: it executes a real swap against live pool state, captures the result inside a [[revert|revert]] so nothing persists, and returns the exact output amount and a gas estimate.",
    sections: [
      {
        heading: "A swap that reverts on purpose",
        paragraphs: [
          "An interface that shows ‘you receive 2,324.58 USDC’ needs the exact output of a swap before the user signs anything. For a v3 pool that means repeating the pool's [[dex-pool-reads|tick walk]]; a quoter makes the pool do the walk itself. Uniswap's QuoterV2, at `0x61fFE014bA17989E743c5F6cB21bF9697530B21e` on Ethereum, has `quoteExactInputSingle`, which takes `tokenIn`, `tokenOut`, `amountIn`, `fee` (which pool) and `sqrtPriceLimitX96` (a price at which to stop, 0 for none). It calls the pool's real `swap` with itself as recipient. The pool moves its price, sends the output tokens and calls the quoter's `uniswapV3SwapCallback` to collect payment. Instead of paying, the callback reverts with 96 bytes: amount out, new price, new tick. The revert undoes everything the swap changed; the quoter catches it, decodes the bytes and returns `amountOut`, `sqrtPriceX96After`, `initializedTicksCrossed` and `gasEstimate` as ordinary return data, not an error.",
          "Because they call `swap`, these functions cannot be marked `view`, the [[abi|ABI]] label for functions that change nothing, and a comment in Uniswap's quoter interface warns that they are ‘not gas efficient and should not be called on-chain’. Libraries read that label and treat them as transactions, so ethers needs `staticCall` and viem `simulateContract` to send an eth_call; sent as a real transaction, a quote spends gas and leaves nothing behind. `gasEstimate` is `gasleft()` before minus after the pool call, so it covers the swap and its outbound transfer but not the 21,000 base [[gas|gas]] of a transaction, the calldata, a router or collecting the input.",
        ],
      },
      {
        heading: "The same trick in v4 and Balancer",
        paragraphs: [
          "`V4Quoter` takes a `PoolKey`, the five fields that name a v4 pool, plus `zeroForOne` (true when selling `currency0`), `exactAmount` and `hookData`. A v4 swap runs only inside `PoolManager.unlock`, which calls back the caller and at the end requires every token owed to be paid. The quoter runs the swap in that callback, hooks included, then reverts with the custom error `QuoteSwap(uint256)`, selector `0xecbd9804`, instead of paying, and returns `amountOut` and `gasEstimate`. Any other revert, including `NotEnoughLiquidity(poolId)` from a pool that cannot fill the whole amount, comes back wrapped in `UnexpectedRevertBytes`. QuoterV2 has no such check for exact input: a pool that runs out of liquidity returns the output of a partial fill.",
          "Balancer v2's Vault offers `queryBatchSwap`, whose source says it performs the swaps, pool hooks and balance updates included, then ‘reverts unconditionally’ with the asset deltas. Balancer v3 routes queries through the Vault's `quote`, which first checks that `tx.origin`, the transaction's signer (in eth_call, `from`), is the zero address, so that it runs only inside a call. Geth, Nethermind and Reth all use the zero address when `from` is omitted, so the query works; set `from` to the user and it reverts with `NotStaticCall()`.",
        ],
      },
      {
        heading: "What a quote costs",
        paragraphs: [
          "A quote is a full swap execution: storage reads, one loop iteration per crossed tick, token transfers. At block 26,297,957, 1 WETH into the USDC/WETH 0.05% pool returned 2,324.584010 USDC with one tick crossed and a `gasEstimate` of 92,809; 10,000 WETH crossed 136 ticks and used 3,459,595 gas. The same 1 WETH swap through the SwapRouter02 router needed 144,011 gas from [[eth-estimate-gas|eth_estimateGas]], so `gasEstimate` ranks routes but is not a gas limit. Off-chain math over a mirrored tick map needs no RPC call per quote, so [[searcher|searchers]] [[dex-pool-reads|mirror pool state]] and keep quoters for checks and for pools they cannot model.",
          "Uniswap's smart-order-router uses quoters rather than its own pool math: its source says off-chain quoting ‘would require fetching all the tick data for each pool’. It batches quoter calls through `UniswapInterfaceMulticall`, which gives each sub-call its own `gasLimit` and reports `gasUsed`. A node limits the gas one eth_call may burn, its [[request-cancellation|gas cap]], so the router's comments ask that quotes per batch times gas per quote stay under it; the class defaults are 150 quotes of up to 1,000,000 gas each, retried as 100 of up to 1,500,000 after an out-of-gas failure. Without the per-call limit, one quote that crosses hundreds of ticks would drain the whole batch's budget.",
        ],
      },
      {
        heading: "Lens contracts",
        paragraphs: [
          "A quoter is one kind of lens: a contract deployed only to be read, which packs many reads or a computation into one call and holds no state, so anyone can deploy a better one. TickLens's `getPopulatedTicksInWord(pool, index)` returns every initialized tick in one bitmap word with its `liquidityNet`; `StateView` decodes `PoolManager` storage; Aave's `UiPoolDataProviderV3` returns every lending market in one call. Uniswap's `FeeOnTransferDetector` borrows a token from a v2 pair for the length of the call, measures what arrives, tries a transfer and a sale, and reverts with a 160-byte `TokenFees` struct of buy and sell fees. A lens nobody deployed can still run as a [[deployless-call|deployless call]].",
        ],
      },
    ],
    example: {
      title: "QuoterV2: 1 WETH to USDC through the 0.05% pool",
      language: "json",
      code: "// quoteExactInputSingle((tokenIn, tokenOut, amountIn, fee, sqrtPriceLimitX96)), selector 0xc6a5026a\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[\n  {\"to\":\"0x61fFE014bA17989E743c5F6cB21bF9697530B21e\",\n   \"data\":\"0xc6a5026a000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000001f40000000000000000000000000000000000000000000000000000000000000000\"},\n  \"0x1914665\"\n]}\n// five 32-byte words: tokenIn WETH, tokenOut USDC, amountIn 10^18 (1 WETH),\n// fee 500 (the 0.05% pool), sqrtPriceLimitX96 0 (no limit)\n\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x000000000000000000000000000000000000000000000000000000008a8e564a00000000000000000000000000000000000050ffeaa2d0c558e7b0b7d869310100000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000016a89\"}\n\n// amountOut               0x8a8e564a  = 2,324.584010 USDC (6 decimals)\n// sqrtPriceX96After       0x50ffeaa2…693101, about 2,325.70 USDC per WETH after the swap\n// initializedTicksCrossed 1\n// gasEstimate             0x16a89     = 92,809",
      note: "The call succeeded with plain return data even though the swap inside it reverted; asking for 10,000 WETH instead returned 136 ticks crossed and a `gasEstimate` of 3,459,595 at the same block.",
    },
    pitfalls: [
      "Using `gasEstimate` as the transaction's gas limit; it leaves out intrinsic gas, calldata, router logic and collecting the input.",
      "Trusting a QuoterV2 exact-input quote on a thin pool, which can describe a partial fill without saying so.",
      "Passing the user's address as `from` to a Balancer v3 query, which then reverts with `NotStaticCall()`.",
    ],
    related: ["dex-pool-reads", "dex-aggregator", "eth-call", "revert", "eth-estimate-gas", "multicall", "deployless-call", "abi", "transaction-simulation"],
    sources: [
      { title: "Uniswap v3-periphery: QuoterV2.sol", url: "https://github.com/Uniswap/v3-periphery/blob/main/contracts/lens/QuoterV2.sol" },
      { title: "Uniswap v4-periphery: V4Quoter.sol", url: "https://github.com/Uniswap/v4-periphery/blob/main/src/lens/V4Quoter.sol" },
      { title: "Balancer v2 Vault: Swaps.sol", url: "https://github.com/balancer/balancer-v2-monorepo/blob/master/pkg/vault/contracts/Swaps.sol" },
      { title: "Uniswap smart-order-router: on-chain-quote-provider.ts", url: "https://github.com/Uniswap/smart-order-router/blob/main/src/providers/on-chain-quote-provider.ts" },
    ],
  },
  {
    id: "dex-aggregator",
    title: "DEX aggregators and quote engines",
    category: "tooling",
    aliases: ["DEX aggregator", "swap aggregator", "quote engine", "smart order router", "RFQ", "route search"],
    summary: "A DEX aggregator is a quote engine that searches many pools and other liquidity sources for the best way to fill a swap, checks the winning route by simulating the user's own transaction against current state, and returns a ready-to-sign transaction valid for a short time, which makes it one of the most latency-bound users of [[eth-call|eth_call]] with [[state-override|state overrides]].",
    sections: [
      {
        heading: "Route search on a cached graph",
        paragraphs: [
          "A user selling 1 WETH for USDC gets a different amount from each [[dex-pool-reads|pool]], and a large order gets more if it is split, because a pool's price moves against a trade as the trade grows. An aggregator finds the best combination and returns a transaction that executes it; public examples include 1inch, 0x, Velora (formerly ParaSwap), Odos, KyberSwap, Uniswap's smart-order-router and CoW Swap's quote endpoint. A request names a sell token, a buy token, an amount and usually the taker, the address that will trade. The engine keeps a graph in memory, tokens as nodes and pools as edges carrying cached pool state. A route is a path through it, direct (WETH to USDC) or with hops (WETH to DAI to USDC), and a split sends parts of the amount down several. The search runs off-chain, because reading every candidate pool per request would take thousands of round trips; RPC keeps the graph fresh and then checks the winner.",
          "An RFQ (request for quote) market maker, a trading firm quoting from its own inventory, answers with a signed, short-lived price instead of a pool. 0x weighs such quotes against pool routes, and its RFQ orders must carry the request's `taker`, because the signed order can be filled only by the address named in it. Every answer has a deadline: CoW Protocol's quote carries an `expiration`, and a route priced at block N is wrong once block N+1 moves its pools, so engines re-read state on every new block.",
        ],
      },
      {
        heading: "Verifying the winner by simulation",
        paragraphs: [
          "Before answering, the engine checks that the route works by running the router transaction the user will sign as an eth_call from the taker, at the block the quote was priced on. The router pulls the sold token from the taker with `transferFrom`, which an ERC-20 token allows only if the taker holds the amount and has approved the router beforehand, a grant the token records as `allowance[taker][router]`. A new user has usually done neither, so the plain call reverts. The engine therefore adds a [[state-override|state override]], eth_call's optional third parameter, which replaces an account's balance, code or storage words for that one call: its `stateDiff` writes the taker's balance and allowance into the token's storage, at slots found by [[storage-slot-discovery|storage-slot discovery]]. In the example the plain call reverts with `STF`, the router's failed-transfer message, and the overridden one returns the [[quoter-contract|quoter]]'s exact amount.",
          "Simulation catches what pool math cannot. A fee-on-transfer token keeps a cut of every transfer and so delivers less than the quote, a honeypot lets the buy through and reverts the sale, and paused or blacklisting tokens revert outright; Uniswap's routing code checks tokens with its `FeeOnTransferDetector` lens. Aggregator APIs surface the outcome: 0x returns an `issues` object with `allowance`, `balance` and `simulationIncomplete`, Velora's `ignoreChecks` turns its balance, allowance and failure checks off, and CoW's `priceQuality` of `verified` prefers quotes that passed simulation and marks them `verified: true`. Approve-then-swap sequences call for [[eth-simulate|eth_simulateV1]], and explaining a revert for `debug_traceCall`.",
        ],
      },
      {
        heading: "The RPC load and what breaks it",
        paragraphs: [
          "Load follows users and volatility: each new block invalidates cached quotes, and requests arrive in bursts. One user request typically becomes a few [[multicall|multicall]] batches of quoter calls for pools the engine cannot model, one router eth_call with overrides and one [[eth-estimate-gas|eth_estimateGas]] with the same overrides, all against `latest` or the block just produced, on top of the log stream that keeps the graph fresh. History matters only for backtesting; latency is the budget: a mainnet quote must come back well inside the 12 seconds between blocks, and a rollup with sub-second blocks leaves far less. CoW's solver documentation warns that its services ‘can be very heavy on RPC resource consumption’. Engines therefore run nodes close to the head, see [[fastest-head|fastest head]], and share this shape with [[intent-solver|solvers]], [[searcher|searchers]] and [[transaction-simulation|wallet simulation]].",
          "Four things break this workload. The gas cap, the most gas a node lets one call burn: one 10,000 WETH quote used 3.46 million gas, and Geth's default `--rpc.gascap` is 50,000,000, so a batch of fifteen such quotes fails as out of gas. Timeouts: a client that gives up still leaves the node computing, see [[request-cancellation|request cancellation]]. Providers that drop the third parameter: the override is ignored, and the simulation reports a revert that funding would have avoided. And a split head: pinning the newest block on a [[load-balancer|load-balanced]] endpoint returns `header not found` from a backend one block behind.",
        ],
      },
    ],
    example: {
      title: "Quoting and verifying 1 WETH to USDC at block 26,297,957",
      language: "text",
      code: "request: sell 1 WETH for USDC, taker 0x00000000000000000000000000000000000a11ce\n         (an empty address: no WETH, no approvals); every read at block 0x1914665\n\n1. price candidate pools from the cached graph\n   Uniswap v2 USDC/WETH   formula on cached reserves     -> 2,313.66 USDC\n   Uniswap v3 0.05%       QuoterV2, gasEstimate 92,809   -> 2,324.58 USDC\n   Uniswap v4 ETH/USDC    V4Quoter, gasEstimate 64,005   -> 2,323.02 USDC\n\n2. pick v3: it pays 1.56 USDC more than v4, while v4's 28,804 fewer gas\n   are worth about a third of a cent at the block's 0.049 gwei base fee\n\n3. verify: send the router call the user would sign, as an eth_call\n   {\"jsonrpc\":\"2.0\",\"id\":7,\"method\":\"eth_call\",\"params\":[\n     {\"from\":\"0x00000000000000000000000000000000000a11ce\",\n      \"to\":\"0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45\",\n      \"data\":\"0x04e45aaf000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000000000000000000000000000000000000000001f400000000000000000000000000000000000000000000000000000000000a11ce0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000\"},\n     \"0x1914665\",\n     {\"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2\":{\"stateDiff\":{\n       \"0x3d5f08ca17424ce91ef6d6c19014cf2cfe6d08bfab17bdcb25acf796e78396c7\":\n         \"0x0000000000000000000000000000000000000000000000000de0b6b3a7640000\",\n       \"0x1618cb48a46c110cfa72ee864c4c66fd72effc60d01774efa4e3d66b42444d2e\":\n         \"0x0000000000000000000000000000000000000000000000000de0b6b3a7640000\"}}}\n   ]}\n\n   params[0]  the call: from the taker, to SwapRouter02; data is selector 0x04e45aaf,\n              exactInputSingle, then seven 32-byte words: tokenIn WETH, tokenOut USDC,\n              fee 500, recipient taker, amountIn 10^18, amountOutMinimum 0, no price limit\n   params[1]  the block every quote in step 1 was priced at\n   params[2]  the state override, keyed by the WETH contract's address; stateDiff\n              replaces two of its storage words and leaves the rest as they are\n              key 1 = keccak256(pad32(taker) . pad32(3))       balanceOf[taker]\n              key 2 = keccak256(pad32(router) . keccak256(pad32(taker) . pad32(4)))\n                                                               allowance[taker][router]\n              both values 0x0de0b6b3a7640000 = 10^18 wei = 1 WETH\n\n   -> result 0x…8a8e564a = 2,324.584010 USDC, the quoter's amount to the last unit\n   without params[2]   -> error 3, execution reverted: STF\n\n4. eth_estimateGas with the same three params -> 0x2328b = 144,011 gas\n\n5. answer: 2,324.58 USDC, a minimum of 2,312.96 for 0.5% slippage (the price\n   moving before the swap lands), calldata with that amountOutMinimum, an expiry;\n   re-quote on the next block",
      note: "The third parameter is the whole trick: it gives the taker 1 WETH and gives the router a 1 WETH allowance for this call only, so the router's real code runs to the end and agrees with the quoter. Drop either key and the call reverts with `STF` again; set `amountOutMinimum` one unit above 2,324.584010 and it reverts with `Too little received`, which is how the minimum protects the user.",
    },
    pitfalls: [
      "Verifying routes against real state only, so every quote for a user who has not yet approved the router fails.",
      "Overriding the taker's balance but not the allowance, or the reverse; `transferFrom` needs both and reverts with `STF` either way.",
      "Assuming a provider applied an override without probing it once, for example by overriding a balance and reading it back.",
      "Treating gas measured under overrides as exact: with an unlimited WETH allowance, which WETH's `transferFrom` never decreases, the same swap estimated 140,432 gas instead of 144,011.",
    ],
    related: ["dex-pool-reads", "quoter-contract", "storage-slot-discovery", "state-override", "eth-simulate", "intent-solver", "searcher", "fastest-head", "request-cancellation", "transaction-simulation"],
    sources: [
      { title: "Uniswap smart-order-router: on-chain-quote-provider.ts", url: "https://github.com/Uniswap/smart-order-router/blob/main/src/providers/on-chain-quote-provider.ts" },
      { title: "CoW Protocol orderbook OpenAPI (quote, priceQuality, verified)", url: "https://github.com/cowprotocol/services/blob/main/crates/orderbook/openapi.yml" },
      { title: "0x Swap API: issues and error codes", url: "https://docs.0x.org/evm/need-help/api-issues" },
      { title: "CoW Protocol: locally testing a solver", url: "https://docs.cow.fi/cow-protocol/tutorials/solvers/local_test" },
    ],
  },
  {
    id: "price-oracle",
    title: "Price oracles",
    category: "tooling",
    aliases: ["oracle", "Chainlink Data Feeds", "latestRoundData", "Pyth", "TWAP oracle", "optimistic oracle", "UMA", "sequencer uptime feed"],
    summary: "A price oracle is a contract that tells other contracts a fact they cannot look up themselves, usually an asset price, either because an oracle network writes updates to it, because the user's own [[transaction|transaction]] carries a signed update in, or because it averages prices from trading on chain.",
    sections: [
      {
        heading: "Push feeds: proxy, aggregator, round",
        paragraphs: [
          "A lending contract needs ETH's dollar price to decide whether a loan is still covered, but a [[smart-contract|contract]] can read only chain state, so an oracle has to put the price there. In Chainlink Data Feeds, the common push design, a network of nodes writes each update to the chain, one feed per pair such as ETH/USD. Consumers read a proxy whose address never changes, `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419` for ETH/USD on mainnet, and it forwards to the aggregator, the replaceable contract that stores the prices.",
          "Reading the price is one [[eth-call|eth_call]] to `latestRoundData()`, which returns `roundId`, `answer`, `startedAt`, `updatedAt` and the deprecated `answeredInRound`. `answer` is an integer scaled by `decimals()`, which is 8 for ETH/USD, so `231608000000` means 2,316.08 dollars. Each update is a round, numbered by `roundId`.",
          "The aggregator is updated only when a trigger fires: a deviation, for this feed a move of 0.5 percent from the stored answer, or a heartbeat, for this feed 3,600 seconds since the last update. In between, the answer just gets older: if ETH moves 0.4 percent and stays there, the feed shows the old price for up to an hour. The nodes agree on each report off chain, and one of them sends it as a single transaction. The aggregator emits the `AnswerUpdated` [[event-log|event]]; the proxy does not, so log consumers watch the aggregator.",
        ],
      },
      {
        heading: "Pull feeds, TWAPs and optimistic oracles",
        paragraphs: [
          "In a pull design nobody writes the price until someone needs it. With Pyth, an application fetches a signed price over HTTP from Pyth's Hermes service and passes it into its own transaction. That transaction pays the fee quoted by `getUpdateFee(updateData)`, stores the price with `updatePriceFeeds`, and reads it with `getPriceNoOlderThan(feedId, 60)`, which returns `price`, `conf` (a confidence interval), `expo` (the decimal exponent) and `publishTime`, and reverts with `StalePrice` if the price is more than 60 seconds old.",
          "An exchange pool can be its own oracle. A Uniswap v3 pool stores its price as a tick, an integer i meaning a price of 1.0001 to the power i, and keeps a running total of tick times seconds elapsed. `observe([1800, 0])` returns that total as of 30 minutes ago and now; the difference divided by 1,800 is the average tick, the time-weighted average price or TWAP. Averaging is the defence: a price distorted for one 12-second block shifts the 30-minute average tick by only a 150th of the distortion. At block 26,281,440 the USDC/WETH 0.05 percent pool's average tick was 198,860; since 1.0001 to that power counts wei of WETH per millionth of a USDC, ETH was `1e12 / 1.0001^198860`, about 2,312 dollars against Chainlink's 2,316.08.",
          "UMA's Optimistic Oracle V3 answers questions no feed covers. `assertTruth` posts a claim with a bond, money lost if the claim proves false, and the claim is accepted unless someone calls `disputeAssertion` with an equal bond within a set window; a dispute goes to a vote of UMA stakers, 24 hours to commit and 24 to reveal.",
        ],
      },
      {
        heading: "What a consumer has to check",
        paragraphs: [
          "The oracle only stores a value; the contract that reads it decides whether to trust it. It compares `updatedAt` with `block.timestamp` against that feed's heartbeat plus a margin: a four-hour limit on this one-hour feed would accept a price three hours past its heartbeat. It rejects an `answer` of zero or below and reads `decimals()` rather than assuming 8.",
          "On an L2 there is one more failure: when the [[sequencer|sequencer]], the single operator that orders the rollup's transactions, stops, nothing lands and prices freeze. Chainlink's sequencer uptime feed answers 0 while it is up and 1 while it is down, with `startedAt` recording the last change; the flag is relayed from Ethereum through the rollup's bridge, which delivers it before any transaction sent later. Chainlink's sample consumer reverts with `SequencerDown`, then with `GracePeriodNotOver` for 3,600 seconds after `startedAt`, so borrowers can top up loans before [[liquidation-bot|liquidations]], forced sales of their collateral, resume. A newer L2 may have no uptime feed, since Chainlink has stopped adding them; see [[l2-rpc|L2 RPC differences]].",
        ],
      },
      {
        heading: "The RPC workload on each side",
        paragraphs: [
          "Oracle node operators carry the heavy load. A Chainlink node follows heads and logs through [[eth-subscribe|subscriptions]], so its primary endpoints need a [[websocket-transport|WebSocket]] `WSURL` beside the `HTTPURL`. The Chainlink node marks one of its endpoints out of sync once that endpoint's head falls more than five blocks behind the best of them, the default `SyncThreshold`, and meanwhile sends its reads and transactions through the others, so that it acts on the freshest chain view it has; see [[failover|failover]].",
          "Consumers mostly issue `eth_call` reads at `latest`, batched through [[multicall|Multicall3]]. History is the exception: checking whether a past liquidation used a fair price means finding the block for a past timestamp with a [[block-by-timestamp|block-by-timestamp]] search and calling `latestRoundData` or `observe` there on an [[archive-node|archive node]].",
        ],
      },
    ],
    example: {
      title: "Reading Chainlink ETH/USD and checking its age",
      language: "text",
      code: "// latestRoundData(), selector 0xfeaf968c, on the mainnet ETH/USD proxy at block 26,281,440\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[\n  {\"to\":\"0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419\",\"data\":\"0xfeaf968c\"},\n  \"0x19105e0\"\n]}\n\n// result: one 160-byte string, shown as the low half of each of its five 32-byte words\nword 0  0x…000000000000000700000000000088e4   roundId: phase 7, aggregator round 35,044\nword 1  0x…000000000000000000000035ece99e00   answer: 231608000000 = 2,316.08 USD (decimals 8)\nword 2  0x…0000000000000000000000006ae01c21   startedAt: 1793072161, observations taken\nword 3  0x…0000000000000000000000006ae01c37   updatedAt: 1793072183, report landed on chain\nword 4  0x…000000000000000700000000000088e4   answeredInRound: same as roundId, deprecated\n\n// aggregator() on the same proxy -> 0x7d4e742018fb52e48b08be73d041c18b21de6fb5\n// it logged AnswerUpdated(231608000000, 35044, 1793072183) in block 26,281,391\n\n// the consumer's check at block 26,281,440, whose timestamp is 1793072771\nage = 1793072771 - 1793072183 = 588 seconds\n588 < 3,600 heartbeat + margin   -> accept\nanswer > 0                       -> accept\nprice = 231608000000 / 10^8      -> 2,316.08 USD",
      note: "The proxy's `roundId` packs two numbers: the aggregator's own round, 35,044, in the low 64 bits, and above them the phase, 7, which rises each time Chainlink replaces the aggregator. `AnswerUpdated` carries only the 35,044, and only the aggregator logs it, so a subscription for this feed targets `0x7d4e…6fb5`. This round was a heartbeat update: it landed 3,636 seconds after the previous one, only 0.15 percent away from it.",
    },
    pitfalls: [
      "Reading a Pyth price with `getPriceUnsafe`, or a Chainlink price without checking `updatedAt`, and treating a frozen value as current.",
      "Asking a Uniswap v3 pool for a TWAP window longer than its stored observations cover, which reverts with `OLD`.",
      "Skipping the sequencer uptime check on an L2, so liquidations fire at stale prices the moment the sequencer returns.",
    ],
    related: ["eth-call", "multicall", "sequencer", "l2-rpc", "archive-node", "block-by-timestamp", "liquidation-bot", "dex-pool-reads", "keeper", "eth-subscribe"],
    sources: [
      { title: "Chainlink: Data Feeds API reference", url: "https://docs.chain.link/data-feeds/api-reference" },
      { title: "Chainlink: L2 sequencer uptime feeds", url: "https://docs.chain.link/data-feeds/l2-sequencer-feeds" },
      { title: "Uniswap v3 core: IUniswapV3PoolDerivedState.observe", url: "https://github.com/Uniswap/v3-core/blob/main/contracts/interfaces/pool/IUniswapV3PoolDerivedState.sol" },
      { title: "UMA: OptimisticOracleV3.sol", url: "https://github.com/UMAprotocol/protocol/blob/master/packages/core/contracts/optimistic-oracle-v3/implementation/OptimisticOracleV3.sol" },
    ],
  },
  {
    id: "keeper",
    title: "Keepers and automation",
    category: "tooling",
    aliases: ["keeper bot", "Chainlink Automation", "checkUpkeep", "performUpkeep", "upkeep", "Gelato Web3 Functions", "prize claiming bot", "automation"],
    summary: "A keeper is an off-chain service that watches contracts for work only an outside caller can start, such as harvesting a vault, settling an auction, claiming a prize or liquidating a loan, and sends the [[transaction|transaction]] when the work is due, because a contract runs only when a transaction calls it.",
    sections: [
      {
        heading: "Check off-chain, perform on-chain",
        paragraphs: [
          "Nothing on chain runs on a timer. A vault that should harvest, collecting and reinvesting its earnings, every day, or an auction that should settle when it ends, waits until someone sends the call. A keeper splits each such job in two: a free read that decides whether work is due and a paid write that does it. Chainlink Automation made the split an interface for each registered job, which it calls an upkeep: the contract implements `checkUpkeep(bytes checkData)`, returning `(bool upkeepNeeded, bytes performData)`, and `performUpkeep(bytes performData)`. Automation nodes run the check with [[eth-call|eth_call]], which executes without a transaction and costs no gas, so it may loop over hundreds of positions; only when it returns `true` do they send `performUpkeep` on chain.",
          "The `cannotExecute` modifier keeps the check off chain: it reverts unless `tx.origin`, the account that signed the transaction, is the zero address or `0x1111…1111`. Nobody holds a key for either, so no real transaction passes, while an `eth_call` without a `from` runs with `tx.origin` set to zero. The interface also warns that `performData` must not be trusted: anyone can call `performUpkeep`, and the state may have moved since the check. If two keepers both see vault 3 as due, the second perform must find nothing left to do, so the function checks again.",
        ],
      },
      {
        heading: "Where keepers run today",
        paragraphs: [
          "Chainlink deprecated Automation v1.x on 30 June 2026 and v2.1 on 31 July 2026 and moved users to workflows on its Chainlink Runtime Environment, CRE. A workflow repeats the old check off chain with `evmClient.callContract()` when a cron or log trigger fires, and acts by sending a signed report: a `KeystoneForwarder` contract hands it to a receiver contract, which calls the old `performUpkeep`. Aave's keeper robots on Gnosis, Linea and other networks moved to CRE from Gelato, whose automation service Aave calls deprecated.",
          "PoolTogether V5 is a prize savings protocol: the yield on deposits is paid out as random prizes, and open-source bots claim them for the winners. A claimer calls the prize pool's `isWinner(vault, user, tier, prizeIndex)` for every depositor and prize, thousands of reads batched through [[multicall|Multicall3]] at one block, then sends the Claimer contract one `claimPrizes` call listing the winners and a `minFeePerClaim`. The fee comes out of each prize and follows a gradual Dutch auction, rising with time since the draw and falling as claims are made, so claimers race once it covers their gas. The call reverts with `VrgdaClaimFeeBelowMin` when others claimed first and the fee fell below that minimum; a prize already claimed or past its claim period only adds a `ClaimError` event.",
          "OpenZeppelin set 1 July 2026 as the retirement date of its hosted Defender, which ran many keepers. Its open-source successors split the job: OpenZeppelin Monitor watches blocks and fires a webhook when a call or event matches, and OpenZeppelin Relayer sends the resulting transaction; see [[transaction-relayer|transaction relayers]].",
        ],
      },
      {
        heading: "The RPC workload",
        paragraphs: [
          "The base load is one check per job per block, and nearly every check answers no. Fifty jobs on mainnet, one call each per 12-second block, is 360,000 calls a day; on an OP Stack [[rollup|rollup]] with 2-second blocks it is 2,160,000. A `newHeads` [[eth-subscribe|subscription]] drives the loop better than polling [[eth-block-number|eth_blockNumber]], and one Multicall3 call at a pinned block turns fifty requests into one consistent snapshot. Event-driven jobs use a `logs` subscription or an [[eth-get-logs|eth_getLogs]] cursor instead, with a backfill after every reconnect.",
          "The write side is a small relayer. The keeper estimates the perform call with [[eth-estimate-gas|eth_estimateGas]], which also shows it would not revert right now, signs with a [[nonce|nonce]] it tracks itself, and raises the fee if the transaction stalls. Paid jobs draw [[searcher|searchers]], bots that compete for profitable transactions and can take a job first once they see a keeper's transaction in the public pool, so keepers that want to win send through [[private-rpc|private RPC]] or [[mev-bundle|bundles]]; [[liquidation-bot|liquidation bots]] are the extreme case.",
        ],
      },
      {
        heading: "What a stale endpoint does to a keeper",
        paragraphs: [
          "A lagging node shows a keeper work that is already done. Three blocks behind, `checkUpkeep` still reports the vault another keeper harvested two blocks ago, and the perform transaction reverts or does nothing while the keeper pays the [[gas|gas]]. Chainlink nodes stop using an endpoint five blocks behind the best; a home-grown keeper needs the same comparison against a second source, because [[eth-syncing|eth_syncing]] answers `false` on a node that has simply stopped importing blocks. See [[head-lag|head consistency]].",
          "Behind a [[load-balancer|load balancer]] the check and the perform can reach different nodes, so a careful keeper pins the check to a block number, estimates against the same node, and logs a reverted perform as a lost race rather than an incident.",
        ],
      },
    ],
    example: {
      title: "One keeper cycle on an Automation-style contract",
      language: "text",
      code: "block 26,281,440 (0x19105e0): newHeads notification arrives\n\n1. eth_call  to 0x7b3e…a210, data 0x6e04ff0d + abi(checkData), block 0x19105e0, no from\n   tx.origin is 0x0, so cannotExecute lets the check run\n   -> upkeepNeeded = true, performData = abi.encode([3, 7])      vaults 3 and 7 are due\n\n2. eth_estimateGas  from the keeper, to 0x7b3e…a210, data 0x4585e33b + performData\n   -> 0x3d2a8 (250,536 gas): no revert, so the work is still there\n\n3. sign nonce 1,204 with gas limit 300,000; eth_sendRawTransaction to two endpoints\n\n4a. block 0x19105e1: receipt status 0x1, vaults 3 and 7 harvested\n4b. or another keeper landed first in 0x19105e1: performUpkeep checks again,\n    finds nothing due and reverts; status 0x0, about 30,000 gas paid for nothing\n\n5. block 0x19105e2: checkUpkeep returns (false, 0x) and the loop idles",
      note: "Step 2 catches work that vanished before signing, but nothing catches a race decided inside the next block; that is why step 4b is a cost of doing business rather than a bug.",
    },
    pitfalls: [
      "Trusting `performData` in `performUpkeep` without checking state again, so a racing keeper or a [[reorg|reorg]] makes the contract act on a stale condition.",
      "Running against one endpoint with no head comparison, so a stalled node silently stops every job.",
      "Leaving a retired service's executor address in a contract's allow-list, so the replacement keeper's transactions revert.",
    ],
    related: ["eth-call", "multicall", "eth-subscribe", "transaction-relayer", "searcher", "liquidation-bot", "head-lag", "price-oracle", "eth-estimate-gas", "private-rpc"],
    sources: [
      { title: "Chainlink: Automation interfaces", url: "https://docs.chain.link/chainlink-automation/reference/automation-interfaces" },
      { title: "Chainlink: Migrate from Chainlink Automation to CRE", url: "https://docs.chain.link/cre/reference/cla-migration-ts" },
      { title: "PoolTogether V5: Claimer.sol", url: "https://github.com/GenerationSoftware/pt-v5-claimer/blob/main/src/Claimer.sol" },
      { title: "OpenZeppelin: Doubling down on open source and phasing out Defender", url: "https://www.openzeppelin.com/news/doubling-down-on-open-source-and-phasing-out-defender" },
    ],
  },
  {
    id: "transaction-simulation",
    title: "Transaction simulation services",
    category: "tooling",
    aliases: ["pre-signing simulation", "transaction preview", "asset changes", "estimated balance changes", "Tenderly simulation", "Blockaid", "red-pill contract", "tenderly_simulateTransaction"],
    summary: "A transaction simulation service executes a transaction a wallet is about to sign against current chain state and reports what it would do, which assets move in and out, which approvals it grants, which contracts it calls and whether it reverts, so a person or a security engine can judge it before any signature exists.",
    sections: [
      {
        heading: "Who simulates, and for whom",
        paragraphs: [
          "A wallet wants to show a person what a transaction will do before they sign it, such as ‘you pay 0.5 ETH and receive about 1,256 USDC’, and to catch one built by a drainer, an attacker whose contract or request is designed to empty the signer's wallet. MetaMask computes its preview of [[token-standards|token]] balance changes on a MetaMask server, and its security alerts, on by default, send each request with the dapp's URL and [[chain-id|chain id]] to a MetaMask server for risk checks by providers including Blockaid. Tenderly offers `tenderly_simulateTransaction` and `tenderly_simulateBundle` on its node RPC.",
          "The workload is one simulation per confirmation screen, at the head, while a person waits to click. It needs tracing and simulation methods, [[state-override|state overrides]], and an endpoint that is not behind, since a preview from a node two blocks stale describes pool prices that are already gone. It needs no deep history: a [[pruned-node|pruned node]] at the head can answer every preview. [[security-monitoring|Security monitors]] and [[dex-aggregator|DEX aggregators]] make the same demands.",
        ],
      },
      {
        heading: "From execution to asset changes",
        paragraphs: [
          "[[eth-simulate|eth_simulateV1]] with `traceTransfers: true` gives most of the answer in one call. Its logs include every token `Transfer` (whose [[event-signature|topic]] is `0xddf252ad…`; ERC-721 adds the token id as a fourth topic), ERC-1155 `TransferSingle` and `TransferBatch`, and synthetic `Transfer` logs from `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee` for ether moved by any call, which mainnet does not log today. Summing the logs that name the user gives the balance changes. `Approval` and `ApprovalForAll` record permission for another address to move the user's tokens later, and for a drainer they are the real payload. EIP-7708, part of the Amsterdam [[hardfork|upgrade]] that Sepolia has run since 6 October 2026 and mainnet has not scheduled, makes every ether transfer emit a real `Transfer` log, emitted by `0xfffffffffffffffffffffffffffffffffffffffe`, and the flag then adds nothing.",
          "The tracing route is [[debug-api|debug_traceCall]], which re-executes a call and reports what happened inside it. `callTracer` with `withLog: true` returns the tree of calls with each one's logs in place, catching an [[internal-transaction|internal transfer]] three calls deep. `prestateTracer` with `diffMode: true` returns `pre` and `post` objects, `post` holding only the fields that changed: a balance diff that covers ether directly. Overrides preview what the chain has not seen yet: a swap that needs an approval first can be simulated by patching the allowance slot, or by putting both calls in one `eth_simulateV1` block.",
        ],
      },
      {
        heading: "Where the preview lies",
        paragraphs: [
          "A simulation forecasts against one state, and the real transaction runs after whatever lands first. In a sandwich, a bot trades just before the user's swap and again just after it, turning a preview of 1,256 USDC into a fill near the user's minimum; only the minimum-output argument in the calldata bounds the loss. Simulating at `pending` does not help, because a node's pending block is a guess built from its own pool and private order flow is in no pool at all; see [[mev|MEV]].",
          "Worse are contracts that detect the simulation itself, behaving while simulated and stealing when run for real, which ZenGo's researchers named the red-pill attack. An [[eth-call|eth_call]] without fee fields runs with `tx.gasprice` of 0, and [[geth|Geth]] then sets the base fee to 0 as well, both impossible on mainnet; without a `from`, `tx.origin` is the zero address. With no `gas` given, `gasleft()` starts just under the node's cap, 50,000,000 on Geth, far above the 16,777,216 that EIP-7825 allows a real transaction.",
          "The block context is off too. `eth_call` runs on the base block's state with that block's own `number` and `timestamp`, while `eth_simulateV1` builds a child block that Geth, Nethermind and Reth date one slot, 12 seconds on mainnet, later; the real block matches neither. MetaMask's Added protection option instead enforces the simulated outcome on chain and reverts on a mismatch, at the cost of extra gas.",
        ],
      },
      {
        heading: "Cost and the signature gap",
        paragraphs: [
          "A full preview is several re-executions, a trace, a simulation with transfers and often a pass with overrides, so it costs an [[rpc-provider|RPC provider]] several times one `eth_call`, and many endpoints serve neither `debug_traceCall` nor `eth_simulateV1`. Services probe for `eth_simulateV1` and fall back to `debug_traceCall` plus their own decoding; see [[endpoint-capabilities|endpoint capabilities]].",
          "Many thefts skip the transaction entirely: the user only signs a message. An ERC-2612 `permit` or a Permit2 signature, requested with `eth_signTypedData_v4`, authorises spending but moves nothing when signed; the transfer happens when the spender submits the signature later. Scanners therefore decode the [[eip-712|EIP-712]] payload, reading the spender, amount and deadline, and can simulate the spender's follow-up `transferFrom` with an override that sets the allowance the signature would grant; see [[signing-methods|signing methods]].",
        ],
      },
    ],
    example: {
      title: "Asset changes for a 0.5 ETH swap, from one eth_simulateV1 call",
      language: "json",
      code: "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_simulateV1\",\"params\":[\n  {\n    \"blockStateCalls\": [{\n      \"calls\": [{\n        \"from\": \"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045\",\n        \"to\": \"0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D\",\n        \"value\": \"0x6f05b59d3b20000\",\n        \"maxFeePerGas\": \"0x9502f9000\",\n        \"maxPriorityFeePerGas\": \"0x3b9aca00\",\n        \"data\": \"0x7ff36ab5…\"\n      }]\n    }],\n    \"traceTransfers\": true,\n    \"validation\": true\n  },\n  \"latest\"\n]}\n\n// result (abridged): calls[0].status 0x1; four of its seven logs, in order\n// (WETH's Deposit and the pair's Sync and Swap are left out)\n{ \"address\": \"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee\",\n  \"topics\": [\"0xddf252ad…3ef\", \"0x…d8da…6045\", \"0x…7a25…488d\"], \"data\": \"0x…06f05b59d3b20000\" }\n{ \"address\": \"0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee\",\n  \"topics\": [\"0xddf252ad…3ef\", \"0x…7a25…488d\", \"0x…c02a…6cc2\"], \"data\": \"0x…06f05b59d3b20000\" }\n{ \"address\": \"0xc02a…6cc2\",\n  \"topics\": [\"0xddf252ad…3ef\", \"0x…7a25…488d\", \"0x…b4e1…c9dc\"], \"data\": \"0x…06f05b59d3b20000\" }\n{ \"address\": \"0xa0b8…eb48\",\n  \"topics\": [\"0xddf252ad…3ef\", \"0x…b4e1…c9dc\", \"0x…d8da…6045\"], \"data\": \"0x…4adfa210\" }\n\n// preview for 0xd8dA…6045: -0.5 ETH, +1,256.17 USDC (0x4adfa210 / 10^6), no approvals",
      note: "Only the first and last logs involve the user, so they make the preview. The two logs from `0xeeee…eeee` exist only because `traceTransfers` is on: on mainnet today a real block shows the router's ether movements nowhere but in a trace.",
    },
    pitfalls: [
      "Building a preview from `eth_call` return data, which carries no logs; asset changes come from logs, traces or state diffs.",
      "Forgetting `traceTransfers` on a chain without EIP-7708, so a transaction whose only effect is an ether transfer previews as doing nothing.",
      "Leaving approvals out of the summary because no balance moved, when an unlimited `approve` or `setApprovalForAll` is the drain.",
    ],
    related: ["eth-simulate", "debug-api", "state-override", "eth-call", "signing-methods", "eip-712", "security-monitoring", "endpoint-capabilities", "mev", "dex-aggregator"],
    sources: [
      { title: "MetaMask Support: Transaction simulations", url: "https://support.metamask.io/manage-crypto/transactions/simulations/" },
      { title: "execution-apis: eth_simulateV1 schema", url: "https://github.com/ethereum/execution-apis/blob/main/src/schemas/execute.yaml" },
      { title: "Geth: built-in tracers", url: "https://geth.ethereum.org/docs/developers/evm-tracing/built-in-tracers" },
      { title: "EIP-7825: Transaction Gas Limit Cap", url: "https://eips.ethereum.org/EIPS/eip-7825" },
    ],
  },
  {
    id: "nft-marketplace",
    title: "NFT marketplaces",
    category: "tooling",
    aliases: ["NFT marketplace", "Seaport", "OpenSea", "order validation", "ownerOf", "isApprovedForAll", "ERC-2981", "TransferSingle"],
    summary: "An NFT marketplace keeps listings and offers as signed off-chain orders and uses the node to check, before showing or filling one, that the seller still owns the item, still lets the marketplace's contract move it and has not cancelled the order; images and metadata come from off-chain storage, and history from event logs.",
    sections: [
      {
        heading: "Orders are signatures, settlement is a transaction",
        paragraphs: [
          "An NFT is a numbered item in a token contract, the collection: under ERC-721 each token id has one owner, returned by `ownerOf(tokenId)`; see [[token-standards|token standards]]. A marketplace shows each item's image, listings, offers and past sales. On OpenSea and other marketplaces built on Seaport, an open-source exchange contract, a listing is a signature, not a transaction. The seller signs an [[eip-712|EIP-712]] typed message, `OrderComponents`, bound to Seaport's address and chain. It names the offer (the NFT), the consideration (every payment, fees and creator payouts included), a time window, an optional `conduitKey` and the seller's current `counter`. The marketplace keeps it in its own database. A smart-contract wallet signs through [[erc-1271|ERC-1271]] instead, which Seaport checks with `isValidSignature`.",
          "Nothing reaches the chain until a buyer calls a fulfilment function such as `fulfillBasicOrder` on Seaport 1.6 at `0x0000000000000068F116a894984e2DB1123eB395`, which re-checks the order and moves the item and the payment in one transaction. An approval makes that possible: the token contract's record that an operator may move the owner's tokens. The seller calls `setApprovalForAll` once per collection, naming Seaport or, when orders carry a conduit key, a conduit, a contract Seaport instructs to move tokens, such as OpenSea's at `0x1E0049783F008A0085193E00003D00cd54003c71`. After that, a new listing costs no [[gas|gas]], and the database fills with orders that can no longer execute: the item was sold elsewhere, the approval was revoked, the seller called `incrementCounter` to cancel every open order at once, or the end time passed.",
        ],
      },
      {
        heading: "Checking an order with eth_call",
        paragraphs: [
          "So the marketplace checks each order against current state before showing it, and again before a buyer pays gas. Four reads cover it. `ownerOf(tokenId)` must return the seller; for ERC-1155, where an address holds a count of each id, `balanceOf(seller, id)` must cover the amount. `isApprovedForAll(seller, operator)` must be true for the operator the order actually uses. Seaport's `getCounter(seller)` must equal the order's counter. `getOrderStatus(orderHash)` returns `isValidated`, `isCancelled`, `totalFilled` and `totalSize`, which must show the order neither cancelled nor fully filled. The time window must include the next block's timestamp. A collection page batches these reads for all its orders into one [[multicall|multicall]] at one block.",
          "Seaport's authors publish a `SeaportValidator` at `0x00e5F120f500006757E984F1DED400fc00370000` that runs these checks in one eth_call and returns numbered codes, such as 303 for ‘ERC721 not owner of token’ and 800 for a cancelled order. The strongest check is to [[transaction-simulation|simulate]] the purchase: an [[eth-call|eth_call]] of the fulfilment from the buyer's address, which executes it without sending it, with a [[state-override|state override]] for the buyer's balance if needed. A revert exposes what static checks miss, such as a token whose transfer hook blocks this operator. Every answer holds for one block only: if the seller moves the item in the next block, the buyer's transaction reverts.",
        ],
      },
      {
        heading: "Metadata, royalties and history",
        paragraphs: [
          "`tokenURI(tokenId)`, or `uri(id)` on ERC-1155 with `{id}` replaced by the id as 64 lowercase hex digits, returns only a pointer: usually an `ipfs://` or `https://` URI, sometimes a `data:` URI with inline JSON; the example shows Bored Ape #1's. The name, image and traits sit behind that pointer, so a marketplace runs a metadata fetcher and an image cache, and refreshes them when the contract emits an ERC-4906 `MetadataUpdate` event. Royalties are a read too: probe [[erc-165|ERC-165]] `supportsInterface` with the EIP-2981 interface id `0x2a55205a`, then call `royaltyInfo(tokenId, salePrice)` for a receiver and an amount in the sale's own units. EIP-2981 leaves payment voluntary, and older collections lack the function: the Bored Ape contract answers `false` to that probe.",
          "History, meaning mints, sales and holders over time, comes from [[event-log|logs]]. ERC-721 emits `Transfer` with the token id as a third indexed topic; ERC-1155 emits `TransferSingle` and `TransferBatch` with ids and amounts in `data`; and ERC-2309 batch mints emit one `ConsecutiveTransfer` for a whole range of ids instead of a `Transfer` per token. ERC-721 itself lets a contract assign tokens during its own creation without any event. Sale prices are not in transfer events; they come from Seaport's `OrderFulfilled` log in the same transaction, whose consideration items list every payment. The workload is therefore a log backfill from each collection's deployment block plus heavy `latest` reads for validation, as for [[address-history|address history]] and [[block-explorer|block explorers]].",
        ],
      },
    ],
    example: {
      title: "Checking one Seaport listing at one block",
      language: "text",
      code: "A listing from the marketplace's database, abridged: seller S offers Bored Ape #1\n(0xBC4C…f13D) on Seaport 1.6, conduitKey 0x0000007b…0f0000 (OpenSea's conduit\n0x1E00…3c71), counter C, endTime 1793260000.\n\nOne aggregate3 eth_call to Multicall3 at block 0x1912750 (timestamp 1793175767):\n\n  target   call                               answer                    meaning\n  Seaport  information()                      (\"1.6\", 0xfce3…ba64, …)   version and EIP-712 domain separator\n  Seaport  getCounter(S)                      C                         counter still current\n  Seaport  getOrderStatus(orderHash)          (false, false, 0, 0)      not cancelled, never filled\n  BAYC     ownerOf(1)                         S                         seller still owns it\n  BAYC     isApprovedForAll(S, 0x1E00…3c71)   true                      the conduit may move it\n  BAYC     supportsInterface(0x2a55205a)      false                     no ERC-2981 royalty data\n  BAYC     tokenURI(1)                        ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/1\n\nendTime 1793260000 is later than the block's timestamp 1793175767, so the order is inside its window.\n\nBefore the buyer signs: eth_call fulfillBasicOrder(…) from the buyer's address at the same block.\n  success  -> show Buy\n  revert   -> hide the listing and record the reason (SeaportValidator codes 303, 304, 800, 901 …)",
      note: "Every row is a sub-call of the same eth_call, so ownership, approval and order status all describe block 26,290,000; the fulfilment simulation is the check that catches what the rows cannot.",
    },
    pitfalls: [
      "Showing a listing because its signature verifies, without checking that the seller still owns the item and still approves the operator.",
      "Checking `isApprovedForAll(seller, Seaport)` for an order that names a conduit key, which reports false for a listing that is perfectly valid.",
      "Building ownership from `Transfer` logs alone and missing ERC-2309 batch mints and creation-time assignments that emit no `Transfer`.",
      "Calling `royaltyInfo` without the ERC-165 probe, then treating a revert or a fallback's garbage as the creator's royalty.",
    ],
    related: ["token-standards", "eip-712", "erc-1271", "erc-165", "multicall", "transaction-simulation", "state-override", "event-log", "address-history", "block-explorer"],
    sources: [
      { title: "Seaport (contracts, deployments and documentation)", url: "https://github.com/ProjectOpenSea/seaport" },
      { title: "Seaport Order Validator", url: "https://github.com/ProjectOpenSea/seaport/blob/main/docs/OrderValidator.md" },
      { title: "EIP-721: Non-Fungible Token Standard", url: "https://eips.ethereum.org/EIPS/eip-721" },
      { title: "EIP-2981: NFT Royalty Standard", url: "https://eips.ethereum.org/EIPS/eip-2981" },
    ],
  },
  {
    id: "governance-voting-power",
    title: "Voting power at a past block",
    category: "tooling",
    aliases: ["voting power", "getPastVotes", "ERC20Votes", "ERC-5805", "ERC-6372", "Snapshot strategies", "delegation", "proposal snapshot"],
    summary: "Token governance weighs each vote by the voter's power at one fixed past point, the proposal's snapshot, read either from checkpoints the token contract stores itself (`getPastVotes`) or from balances at that old block through an [[archive-node|archive]] [[eth-call|eth_call]], so that anyone who recounts later gets the same number.",
    sections: [
      {
        heading: "Why the count is taken in the past",
        paragraphs: [
          "A governance app shows each proposal, each address's voting power on it and the running tally. If power were the balance at voting time, one token could vote, move to a second wallet and vote again, and a flash loan, borrowed and repaid within one transaction, could briefly hold a majority. So every system fixes a snapshot. OpenZeppelin's Governor, a widely used on-chain voting contract, sets it at proposal creation as `clock() + votingDelay()`, exposes it as `proposalSnapshot(proposalId)` and weighs each ballot with the token's `getPastVotes(account, snapshot)`. Aave Governance v3 takes the hash of the Ethereum block just before `activateVoting` is called. Snapshot, an off-chain voting service, stores a `snapshot` block number in each new proposal.",
          "The count must also be reproducible: voters, front ends, auditors and the on-chain Governor itself must all get the same weight for the same address at the same snapshot, months later. That rules out reading at `latest` and any input that depends on which node answered. Snapshot's guidelines for strategy authors ask the same: power taken from the snapshot, unchanged while the proposal is open.",
        ],
      },
      {
        heading: "Checkpoints in the token contract",
        paragraphs: [
          "In a voting token, a balance is not voting power. Tokens count only once their holder delegates them, to another address or to itself, and a delegate votes with everything delegated to it: in the example, a delegate holding about 2,066 ENS carries about 151,782 ENS of votes. `delegates(account)` returns the current choice, and `DelegateChanged` and `DelegateVotesChanged` [[event-log|events]] record its history. OpenZeppelin's ERC20Votes, an implementation of the ERC-5805 interface, also stores its own past: each time a delegate's weight changes, it appends a checkpoint, a pair of timepoint and votes, to a list in [[contract-storage|storage]]. `getPastVotes(account, timepoint)` binary-searches that list, and `getPastTotalSupply(timepoint)` does the same for quorum; Compound-style tokens such as COMP and UNI offer `getPriorVotes`.",
          "So the call runs against `latest` and needs no archive node, because the history lives in current state. A timepoint not yet in the past reverts: OpenZeppelin 5 raises `ERC5805FutureLookup`, and the example shows ENS's older message. A timepoint is a block number or a time in seconds; ERC-6372's `clock()` and `CLOCK_MODE()` say which, `mode=blocknumber&from=default` or `mode=timestamp`, and ERC-5805 says a token without them, like ENS, counts blocks. On Arbitrum, `block.number` inside the EVM returns an approximate Ethereum block number, so passing Arbitrum's own block number to a block-number clock there reads the wrong checkpoint; see [[l2-rpc|L2 RPC differences]].",
        ],
      },
      {
        heading: "Snapshot strategies read old state",
        paragraphs: [
          "A Snapshot space, a project's voting page, defines voting power as a list of strategies: small functions in Snapshot's score API that receive the voter addresses and the proposal's block. The simplest, `erc20-balance-of`, calls `balanceOf` through [[multicall|Multicall]] with `blockTag` set to that block. Most strategies read ordinary balances, staked positions and liquidity-pool shares rather than checkpoints, so each is an eth_call at an old [[block-tag|block]], which needs an archive endpoint once the snapshot is older than a node's recent state window. Snapshot asks a strategy to make at most five requests, finish within ten seconds and handle 500 addresses.",
          "A multi-chain strategy cannot reuse a block number, since block 26,000,000 on Ethereum means nothing on Base. Snapshot's `multichain` strategy takes the snapshot block's timestamp, asks its blockfinder service for each other network's block at that time, and reads every chain there; [[block-by-timestamp|block by timestamp]] explains why the before-or-after convention changes results. Votes stay open for days, so a short state window can start failing mid-vote.",
        ],
      },
      {
        heading: "Cross-chain voting with storage proofs",
        paragraphs: [
          "Aave Governance v3 lets holders vote on cheaper networks with weight held on Ethereum, without trusting any node. The snapshot block's hash reaches each voting network through Aave's cross-chain messaging. There, someone submits that block's [[block-header|header]] and an [[account-proof|account proof]] to a `DataWarehouse` contract, which checks the header against the hash and stores the voting token's storage root, the hash committing to all of its storage at that block. Each voter then submits [[storage-proof|storage proofs]] of their balance and delegation slots, produced with [[eth-get-proof|eth_getProof]] at the snapshot block and checked against that root. So a node must serve proofs for a block that may be days old, which needs historical trie nodes.",
        ],
      },
    ],
    example: {
      title: "Past votes from checkpoints, and the errors around them",
      language: "json",
      code: "// ENS token, an OpenZeppelin 4 ERC20Votes contract: getPastVotes(delegate, 26000000), sent at latest\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[{\n  \"to\": \"0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72\",\n  \"data\": \"0x3a46b1a8000000000000000000000000b8c2c29ee19d8307cb7255e1cd9cbde883a267d500000000000000000000000000000000000000000000000000000000018cba80\"\n}, \"latest\"]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x0000000000000000000000000000000000000000000020241a3d3b663cb16fec\"}\n//  0x20241a3d3b663cb16fec / 1e18 = 151,781.70 votes at block 26,000,000\n\n// the same delegate's own balance at that block: balanceOf, which needs archive state\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_call\",\"params\":[{\"to\":\"0xC183…9D72\",\"data\":\"0x70a08231…b8c2c29ee19d8307cb7255e1cd9cbde883a267d5\"},\"0x18cba80\"]}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"result\":\"0x0000000000000000000000000000000000000000000000700562534c4b1fdda8\"}\n//  2,066.42 ENS held; the rest of the weight was delegated by other holders\n\n// a timepoint that has not happened yet (block 26,400,000)\n{\"jsonrpc\":\"2.0\",\"id\":3,\"method\":\"eth_call\",\"params\":[{\"to\":\"0xC183…9D72\",\"data\":\"0x3a46b1a8…67d5…192d500\"},\"latest\"]}\n{\"jsonrpc\":\"2.0\",\"id\":3,\"error\":{\"code\":3,\"message\":\"execution reverted: ERC20Votes: block not yet mined\",\"data\":\"0x08c379a0…\"}}\n\n// ERC-6372: this token has no CLOCK_MODE(), so its timepoints are block numbers\n{\"jsonrpc\":\"2.0\",\"id\":4,\"method\":\"eth_call\",\"params\":[{\"to\":\"0xC183…9D72\",\"data\":\"0x4bf5d7e9\"},\"latest\"]}\n{\"jsonrpc\":\"2.0\",\"id\":4,\"error\":{\"code\":3,\"message\":\"execution reverted\"}}",
      note: "The first call is sent at `latest` yet answers for block 26,000,000, because the checkpoints are in current storage; the `balanceOf` beside it needed archive state, and shows how far delegated weight can exceed a holding.",
    },
    pitfalls: [
      "Reading `balanceOf` at the snapshot block and calling it voting power for an ERC20Votes token, where undelegated tokens carry nothing and delegates carry other people's balances.",
      "Passing a block number to a token whose `CLOCK_MODE` is `mode=timestamp`; 26,000,000 seconds is October 1970, before any checkpoint, so every account reads zero.",
      "Testing a Snapshot strategy at `latest` and shipping it, so weights drift for as long as the proposal is open.",
      "Recording a pruned endpoint's error, or a silent fallback to newer state, as an account's voting power.",
    ],
    related: ["block-by-timestamp", "archive-node", "storage-proof", "eth-get-proof", "multicall", "contract-storage", "l2-rpc", "event-log", "eip-712", "airdrop-rewards"],
    sources: [
      { title: "EIP-5805: Voting with delegation", url: "https://eips.ethereum.org/EIPS/eip-5805" },
      { title: "EIP-6372: Contract clock", url: "https://eips.ethereum.org/EIPS/eip-6372" },
      { title: "Snapshot score API: strategy guidelines", url: "https://github.com/snapshot-labs/score-api/blob/master/STRATEGIES.md" },
      { title: "Aave Governance v3: overview", url: "https://github.com/aave-dao/aave-governance-v3/blob/main/docs/overview.md" },
    ],
  },
  {
    id: "erc-4626",
    title: "Tokenized vaults (ERC-4626)",
    category: "tooling",
    aliases: ["ERC-4626", "tokenized vault", "vault shares", "convertToAssets", "share price", "vault APY", "inflation attack", "previewRedeem"],
    summary: "ERC-4626 is the standard interface for a vault that accepts one ERC-20 asset and issues shares for it, so any reader can get a vault's holdings and its share-to-asset exchange rate with plain [[eth-call|eth_call]] reads, and measure its yield by comparing that rate at two blocks.",
    sections: [
      {
        heading: "One interface for every vault",
        paragraphs: [
          "A vault is a contract that pools deposits of one token, say DAI or USDC, and puts them to work, for instance by lending them out. Depositors get shares, the vault's own ERC-20 token, and as the pool earns, each share redeems for more of the asset. Vault apps, [[portfolio-tracker|portfolio trackers]] and lending markets that take shares as collateral all need what a share is worth and what it earns. ERC-4626 fixes the functions behind those numbers. `asset()` names the underlying token, `totalAssets()` reports what the vault manages, `convertToShares(assets)` and `convertToAssets(shares)` give the exchange rate, and `deposit`, `mint`, `withdraw` and `redeem` move funds, each with a `preview` and a `max` view beside it. `Deposit` and `Withdraw` [[event-log|events]] record each move with its assets and shares. Yearn V3 vaults, Morpho's Vault V2 and Savings Dai (sDAI) all implement it, so one reader works for all three; see [[token-standards|token standards]].",
          "The views make different promises. `convertTo*` is the idealised rate: no fees, the same for every caller, no slippage, rounded down, and never [[revert|reverting]] except on overflow. `preview*` simulates the action now, fees included. `max*` returns the most one address can move, may underestimate it, and must return 0 while that action is disabled. Dashboards read `convertToAssets` for price and `previewRedeem` for what a holder would actually receive. The EIP has the vault round in its own favour: shares issued for a deposit and assets paid for a redemption round down, while shares burned for a withdrawal and assets charged for a mint round up, so no user can extract value through rounding, one smallest unit at a time.",
        ],
      },
      {
        heading: "Share price and yield over RPC",
        paragraphs: [
          "The share price is what one whole share redeems for. Amounts are integers in the smallest unit, so one whole share is `10 ** decimals()` units, using the vault's own `decimals()`, which the EIP recommends but does not require to match the asset's; sDAI has 18, so its price is `convertToAssets(1e18)`. Yield is the change in that price over time: read it at two blocks, divide, and annualise by the seconds between their timestamps. The example does this for sDAI over 30 days and recovers exactly the 1.25% Dai Savings Rate. Each past reading is state at an old block, so it needs an [[archive-node|archive]] endpoint or a [[partial-archive|partial archive]] covering the window, and a dashboard that plots a year of daily points for 200 vaults issues 73,000 historical calls, batched through [[multicall|Multicall]].",
          "There are two ways around archive state. A collector can record the share price at every block it follows from now on, which needs nothing historical but has no past before it started. Or the rate can be derived from events: each `Deposit` and `Withdraw` carries assets and shares, so their ratio is a price observation, but only when somebody acts, and with fees mixed in.",
        ],
      },
      {
        heading: "Donations, rounding and odd vaults",
        paragraphs: [
          "Rounding down also opens the inflation, or donation, attack. Against an empty USDC vault an attacker deposits 1 unit, 0.000001 USDC, for 1 share, then transfers 10,000 USDC straight to the vault, which raises `totalAssets` to 10,000,000,001 units without minting a share. A victim depositing 9,999 USDC receives 9,999,000,000 × 1 / 10,000,000,001 shares, which rounds to 0, and the attacker's single share now redeems both deposits. OpenZeppelin's implementation counters this with virtual shares and assets, sized by `_decimalsOffset()`: the rate is computed as if the vault always held extra shares and assets that nobody owns, which capture part of any donation, so the attack stops paying. Morpho's Vault V2 uses 10 to the power of 18 minus the asset's decimals as virtual shares, so its USDC vaults issue 18-decimal shares. For a [[security-monitoring|security monitor]], a share-price jump that no deposit or interest event explains looks like a donation.",
          "Some vaults bend the interface. Morpho's Vault V2 returns zero from every `max*` function by design, which a naive reader takes to mean deposits are closed. Yearn V3's `withdraw` and `redeem` accept a `maxLoss` in basis points (1 is 0.01%), and Yearn documents `pricePerShare()` as an off-chain helper only. The EIP itself warns that `preview*` can be manipulated by altering on-chain conditions, so it is not a safe [[price-oracle|price oracle]].",
        ],
      },
    ],
    example: {
      title: "APY from two share-price readings",
      language: "text",
      code: "// sDAI (Savings Dai), an ERC-4626 vault over DAI: convertToAssets(1e18) at two blocks\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[\n  {\"to\":\"0x83F20F44975D03b1b09e64809B757c47f942BEeA\",\n   \"data\":\"0x07a2d13a0000000000000000000000000000000000000000000000000de0b6b3a7640000\"},\n  \"0x18ddb90\"]}\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x0000000000000000000000000000000000000000000000001064005ec7f0c323\"}\n\n{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"eth_call\",\"params\":[\n  {\"to\":\"0x83F20F44975D03b1b09e64809B757c47f942BEeA\",\"data\":\"0x07a2d13a…0de0b6b3a7640000\"},\n  \"0x1912750\"]}\n{\"jsonrpc\":\"2.0\",\"id\":2,\"result\":\"0x00000000000000000000000000000000000000000000000010684d67f3f1bd22\"}\n\nblock        timestamp     1 share in DAI\n26,074,000   1790575007    1.181069409359\n26,290,000   1793175767    1.182280011054\n\ngrowth over 2,600,760 s (30.1 days)   1.182280011054 / 1.181069409359 = 1.0010250\nAPY = 1.0010250 ^ (31,536,000 / 2,600,760) - 1 = 0.0125, the 1.25% Dai Savings Rate",
      note: "Both calls ask the same question, what one share is worth, at two pinned blocks; the timestamps come from the blocks themselves, never from the wall clock of whoever ran the query.",
    },
    pitfalls: [
      "Pricing a share as `convertToAssets(10 ** asset.decimals())` when the shares use more decimals, which is off by a factor of 10^12 on an 18-decimal-share USDC vault.",
      "Using a `preview` function as an on-chain price feed, when one transaction can both move it and read it.",
      "Treating `maxDeposit` returning zero as proof that a vault is closed, when some vaults return zero by design.",
      "Annualising two `latest` readings by wall-clock time instead of reading two pinned blocks and their timestamps.",
    ],
    related: ["token-standards", "eth-call", "multicall", "archive-node", "partial-archive", "price-oracle", "event-log", "block-by-timestamp", "portfolio-tracker", "airdrop-rewards"],
    sources: [
      { title: "EIP-4626: Tokenized Vaults", url: "https://eips.ethereum.org/EIPS/eip-4626" },
      { title: "OpenZeppelin: ERC-4626 and the inflation attack", url: "https://docs.openzeppelin.com/contracts/5.x/erc4626" },
      { title: "Yearn: integrating V3 vaults", url: "https://docs.yearn.fi/developers/v3/Integrating_v3" },
      { title: "Morpho Vault V2", url: "https://github.com/morpho-org/vault-v2" },
    ],
  },
  {
    id: "fork-testing",
    title: "Fork testing against live state",
    category: "tooling",
    aliases: ["fork testing", "mainnet fork", "--fork-url", "--fork-block-number", "vm.createSelectFork", "cast run", "anvil_impersonateAccount", "Tenderly Virtual TestNets"],
    summary: "Fork testing runs code on a local chain that starts from a real network's [[state|state]] at a chosen block, the fork block, and fetches each account and storage slot from an upstream RPC endpoint the first time execution touches it, so tests, scripts and incident replays meet real contracts without deploying anything.",
    sections: [
      {
        heading: "How a fork gets its state",
        paragraphs: [
          "A fork test runs code against a real network as it stands, such as a swap through live pools or a proposal executed against the real treasury. The local chain starts empty and knows two things: the fork block and the upstream, the real network's RPC endpoint. It reads the fork block's header with [[eth-get-block-by-number|eth_getBlockByNumber]]. When execution touches an account, it asks the upstream for the balance, nonce and code with [[eth-get-balance|eth_getBalance]], [[eth-get-transaction-count|eth_getTransactionCount]] and [[eth-get-code|eth_getCode]], and for each storage slot it reads, it calls [[eth-get-storage-at|eth_getStorageAt]]. What it fetched is kept; writes stay local. Anvil's `--fork-url` with `--fork-block-number`, `forge test --fork-url`, Foundry's `vm.createSelectFork(url, blockNumber)` cheatcode, Hardhat's `forking` setting and Tenderly's hosted Virtual TestNets all work this way; see [[local-devnet|local development nodes]].",
          "A test costs a round of requests per distinct account and one per slot, and a swap routed through an aggregator touches dozens of contracts and hundreds of slots. Two Foundry behaviours show up in the upstream's logs. Every state read names the fork block by hash, as an [[block-tag|EIP-1898 block object]] `{\"blockHash\": …}`, so that a [[reorg|reorg]] upstream cannot swap the state under a running test; an endpoint that cannot serve state by hash fails every read, and `--fork-state-by-number` switches back to numbers. And on the first account Foundry also tries Reth's `eth_getAccountInfo`, which returns all three fields at once; a Geth upstream answers `-32601`, method not found, which is harmless.",
        ],
      },
      {
        heading: "Old blocks need archive, and determinism needs a pin",
        paragraphs: [
          "The fork block decides what the upstream must hold. Inside a [[full-node|full node]]'s recent state window, about 128 blocks on Geth, any node can answer. Last month's block needs historical state, so a [[pruned-node|pruned]] upstream fails the first read with `missing trie node`, and the test dies at whatever line first touched an uncached account. Providers often gate [[archive-node|archive]] reads separately, with an error of their own. Forking `latest` without a number avoids the archive question but starts every run from different state, so a test that passed yesterday can fail today with no code change.",
          "Pinning the block also makes the cache useful. Foundry saves what it fetched from a remote endpoint under `~/.foundry/cache/rpc/<chain>/<block>` and reuses it on the next run at the same block (`--no-storage-caching` turns this off); Hardhat likewise caches only pinned forks. In CI a cold cache means thousands of requests from every parallel job, so pipelines cache that directory keyed by chain and block. When the provider answers HTTP 429, too many requests, Foundry waits and retries (`--fork-retry-backoff` sets the first wait), so a [[rate-limits|rate limit]] shows up as slow or flaky tests rather than a clear error.",
        ],
      },
      {
        heading: "Rewriting state",
        paragraphs: [
          "A fork can do what a real chain refuses. Impersonation, through `anvil_impersonateAccount` or `hardhat_impersonateAccount`, sends transactions as any address without its private key, such as a governance timelock, the contract that executes passed proposals. `anvil_setBalance` and `anvil_setStorageAt` patch state directly; inside a Foundry test, `vm.prank` and `vm.deal` do the same. Tenderly's `tenderly_setErc20Balance` writes the token's balance slot and emits no `Transfer`, while `tenderly_addErc20Balance` emits a synthetic one for tools that watch events. These methods exist only on development nodes, so code that depends on them breaks on a real endpoint.",
        ],
      },
      {
        heading: "Replaying an incident",
        paragraphs: [
          "A transaction at index 5 of a block ran on the state left by the parent block plus the effects of transactions 0 to 4. `cast run <txhash>` rebuilds exactly that: it forks at the parent block, replays the earlier transactions locally, then executes the target and prints a full [[execution-trace|trace]]. `--quick` skips the earlier transactions and warns that results may differ from the live execution. `--debug-trace-transaction` instead renders the node's own `debug_traceTransaction` call trace without re-executing anything, which needs the [[debug-api|debug_ namespace]]. Inside a test, `vm.createSelectFork(url, txHash)` forks at that transaction's block and replays the ones before it, so an exploit can be re-run against patched code.",
          "Replay therefore needs the full block, archive state at the parent block and, for `--debug-trace-transaction`, the debug namespace; incident responders and [[security-monitoring|security monitors]] keep such an endpoint. For a single call, [[transaction-simulation|simulation]] with eth_call and [[state-override|state overrides]] is cheaper: one request and no local EVM. A fork is the tool when a sequence of transactions, impersonation or new code must run against live state.",
        ],
      },
    ],
    example: {
      title: "One cast call against a fork, and what the upstream saw",
      language: "text",
      code: "$ anvil --fork-url https://rpc.example --fork-block-number 26290000\n$ cast call 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 'balanceOf(address)(uint256)' \\\n    0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045 --rpc-url http://127.0.0.1:8545\n38192124 [3.819e7]\n\nWhat Anvil asked the upstream for, cold cache (abridged):\n 1  eth_chainId                       -> 0x1\n 2  anvil_nodeInfo                    -> method not found: the upstream is not another Anvil\n 3  eth_getBlockByNumber 0x1912750    -> hash 0xdd9db359…320f\n 4  the USDC proxy's account, every call at {\"blockHash\":\"0xdd9db359…320f\"}, sent together:\n      eth_getAccountInfo              -> -32601 method not found\n      eth_getBalance, eth_getTransactionCount, eth_getCode\n                                      -> proxy bytecode; separate calls from now on\n 5  eth_getStorageAt proxy, admin slot 0x10d6a54a…390b           -> proxy admin\n 6  eth_getStorageAt proxy, implementation slot 0x7050c9e0…f8c3  -> 0x4350…02dd\n 7  the three account calls for 0x4350…02dd -> implementation bytecode\n 8  eth_getStorageAt proxy, keccak256(pad32(holder) . pad32(9))\n                                      -> 0x…0246c3fc = 38,192,124 units = 38.192124 USDC\n\nSecond run at the same block: the state comes from\n~/.foundry/cache/rpc/mainnet/26290000/storage-<keccak256 of the URL>.json, not from the upstream.",
      note: "One `balanceOf` touched two contract accounts and three slots because USDC is a proxy: the admin and implementation slots are read before the balance slot, which sits in mapping slot 9, and every state request names block 26,290,000 by its hash.",
    },
    pitfalls: [
      "Pointing CI at a pruned or rate-limited endpoint and reading `missing trie node` or HTTP 429 as a bug in the code under test.",
      "Forking at the incident's own block instead of its parent, which starts from the state after the exploit had already run.",
      "Treating a `--quick` replay as evidence, when skipping the block's earlier transactions can change the prices and balances the target saw.",
    ],
    related: ["local-devnet", "cli-tools", "archive-node", "eth-get-storage-at", "execution-trace", "debug-api", "transaction-simulation", "state-override", "rate-limits", "security-monitoring"],
    sources: [
      { title: "Foundry: fork testing", url: "https://getfoundry.sh/forge/tests/fork-testing" },
      { title: "Foundry: cast run", url: "https://getfoundry.sh/cast/reference/run" },
      { title: "Hardhat: forking other networks", url: "https://hardhat.org/docs/guides/forking" },
      { title: "Tenderly: admin RPC", url: "https://docs.tenderly.co/virtual-environments/admin-rpc" },
    ],
  },
  {
    id: "erc-6492",
    title: "ERC-6492",
    category: "tooling",
    aliases: ["counterfactual signature", "predeploy signature", "UniversalSigValidator", "ValidateSigOffchain", "isValidSig", "0x6492 suffix", "ERC-8010"],
    summary: "ERC-6492 lets a contract wallet that is not deployed yet produce a signature others can verify: the [[erc-1271|ERC-1271]] signature is wrapped with the factory call that would deploy the wallet and a 32-byte magic suffix, and a verifier runs that deployment and the signature check together inside one [[eth-call|eth_call]], whose changes are thrown away.",
    sections: [
      {
        heading: "The problem: a wallet with no code yet",
        paragraphs: [
          "A smart account is a wallet that is a [[smart-contract|contract]]: its code, not one private key, decides which signatures count, so a site checking its signature calls `isValidSignature`, as [[erc-1271|ERC-1271]] defines, instead of `ecrecover`, the key-based check. New wallets break that. Their [[address|address]] is counterfactual: computed in advance with `CREATE2` from a factory contract, a salt and the wallet's creation code, so it can receive funds before anything is deployed there, and [[erc-4337|ERC-4337]] wallets deploy the code only with their first UserOperation, the 4337 form of a transaction. A user who creates a wallet and signs in at once signs for an address with no code, where `isValidSignature` returns `0x`, which reads as invalid. Coinbase's wallet documentation says its signatures carry the ERC-6492 wrapper for this case.",
          "The fix is to send, with the signature, what it takes to deploy the wallet: three [[abi|ABI]]-encoded fields, the factory address, the calldata that deploys the wallet and the signature the deployed wallet will check, then a 32-byte magic suffix, `0x6492` repeated sixteen times. A second form, for a wallet that is deployed but must first run a call such as `migrate`, puts that call's target and calldata in the first two fields as `prepareTo` and `prepareData`. The suffix ends in `0x92`, not a valid value for `v`, the last byte of a 65-byte [[ecdsa-signature|ECDSA signature]], so a wrapped signature cannot pass for a plain one.",
        ],
      },
      {
        heading: "The order of checks, in one deployless call",
        paragraphs: [
          "The ERC fixes the order. With the suffix, the verifier unwraps the signature, runs the factory call unless the address already has code, and calls `isValidSignature` with the inner signature; if that fails and the factory call was skipped, it runs that call anyway, as a preparation call, and asks again. Without the suffix, an address with code gets a plain ERC-1271 check, and only an address with no code reaches `ecrecover`. The suffix comes first so that a signature made before deployment still verifies afterwards.",
          "The wallet must exist for a moment without really being deployed, so the factory call and the check run inside one eth_call, which discards the resulting state. The validator need not be deployed either: in a [[deployless-call|deployless call]], the reference `ValidateSigOffchain` contract goes in eth_call `data` with no `to`, as creation code followed by the ABI-encoded signer, hash and signature. Its constructor creates a `UniversalSigValidator`, runs the checks and returns `0x01` for valid or `0x00` for invalid. viem's `verifyHash`, behind `verifyMessage` and `verifySiweMessage`, sends this call unless the chain has a deployed validator configured, whose `isValidSig` it calls instead.",
        ],
      },
      {
        heading: "What the answer depends on",
        paragraphs: [
          "The answer holds at one [[block-tag|block]], because the check reads the wallet's state. Once the wallet exists, the verifier asks the live contract, so a wrapped signature made before deployment stops verifying if the owners have rotated since. The ERC also warns about replay: if an owner deploys on Base and replaces a leaked key, signatures from the old key fail on Base but still verify on any chain where the same factory call would deploy the same address with the old owner. Binding the signed message to a [[chain-id|chain id]] prevents that.",
          "Payments run the same check. The reference [[x402|x402]] facilitator, which settles HTTP 402 payments for sellers, verifies a signed [[eip-3009|EIP-3009]] USDC transfer from an undeployed wallet in one [[multicall|Multicall3]] eth_call that runs the factory call and then `transferWithAuthorization`. At settlement it deploys the wallet with a real transaction, but only for factories on its `eip6492AllowedFactories` list, empty by default; otherwise any payer could make it pay gas for arbitrary calldata. It then skips a second simulation, because a [[load-balancer|load-balanced]] endpoint may answer from a replica that has not seen the deployment yet.",
        ],
      },
      {
        heading: "EIP-7702 accounts",
        paragraphs: [
          "[[eip-7702|EIP-7702]] lets a key-controlled account delegate to a contract: its code becomes a 23-byte designator pointing there, so the reference validator sends even a plain 65-byte signature to `isValidSignature`, which runs the delegate's code. If the delegate does not implement ERC-1271, the check reverts with `ERC1271Revert` and never reaches `ecrecover`. viem's `verifyHash`, in its default `auto` mode, falls back to `ecrecover`. The x402 facilitator deliberately does not, because USDC's FiatToken v2.2 also sends signers with code to ERC-1271 and would reject on chain a payment the fallback accepted. ERC-8010, an open proposal, is the counterpart of ERC-6492 for a delegation signed but not yet on chain: the eth_call carries it as an `authorizationList`, which the endpoint must apply.",
        ],
      },
    ],
    example: {
      title: "A wrapped signature, part by part, and its verification",
      language: "text",
      code: "// a counterfactual account signs; its 384-byte signature, word by word\noffset  content                                                            meaning\n0x000   000000000000000000000000 <factory, 20 bytes>                       create2Factory\n0x020   0000000000000000000000000000000000000000000000000000000000000060   offset of factoryCalldata\n0x040   00000000000000000000000000000000000000000000000000000000000000e0   offset of the inner signature\n0x060   0000000000000000000000000000000000000000000000000000000000000044   factoryCalldata length: 68 bytes\n0x080   5fbfb9cf <owner, 32 bytes> <salt, 32 bytes> + 28 zero bytes        createAccount(address owner, uint256 salt)\n0x0e0   0000000000000000000000000000000000000000000000000000000000000041   inner signature length: 65 bytes\n0x100   <r, 32 bytes> <s, 32 bytes> <v, 1 byte> + 31 zero bytes            the owner's signature, as ERC-1271 expects it\n0x160   6492649264926492649264926492649264926492649264926492649264926492   magic suffix\n\n// verify it with one deployless eth_call: no \"to\", creation code plus constructor arguments\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_call\",\"params\":[{\n  \"data\": \"0x<ValidateSigOffchain creation code><abi.encode(signer, hash, wrappedSignature)>\"\n}, \"0x18de2a8\"]}\n\n// inside that one call, none of which is kept:\n//   1. the constructor creates a UniversalSigValidator\n//   2. the signature ends in the suffix and the signer has no code: call the factory, createAccount(owner, salt)\n//   3. call isValidSignature(hash, innerSignature) on the account just created  ->  0x1626ba7e, valid\n//   4. return one byte\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x01\"}\n\n// the same account, asked directly before deployment\neth_call isValidSignature(hash, innerSignature) to the signer  ->  {\"result\":\"0x\"}",
      note: "The inner 65 bytes are what the deployed account's `isValidSignature` will check; before deployment the direct call returns `0x`, and only the deployless call, which runs the factory first, returns `0x01`.",
    },
    pitfalls: [
      "Rejecting a signature because [[eth-get-code|eth_getCode]] returns `0x`, when it ends in the `0x6492` suffix and the account is simply not deployed yet.",
      "Running the ERC-1271 check before looking for the suffix, so after deployment the whole wrapper reaches `isValidSignature` and fails.",
      "Executing the wrapper's factory call as a real transaction for any factory, which lets the signer choose calldata the verifier pays to run.",
    ],
    related: ["erc-1271", "erc-4337", "eip-7702", "signing-methods", "deployless-call", "eth-call", "eip-3009", "x402", "multicall", "address"],
    sources: [
      { title: "ERC-6492: Signature Validation for Predeploy Contracts", url: "https://eips.ethereum.org/EIPS/eip-6492" },
      { title: "ERC-4361: Sign-In with Ethereum", url: "https://eips.ethereum.org/EIPS/eip-4361" },
      { title: "viem: verifyHash source", url: "https://github.com/wevm/viem/blob/main/src/actions/public/verifyHash.ts" },
      { title: "x402 reference facilitator: exact EVM EIP-3009 settlement", url: "https://github.com/x402-foundation/x402/blob/main/typescript/packages/mechanisms/evm/src/exact/facilitator/eip3009.ts" },
    ],
  },
  {
    id: "x402",
    title: "x402",
    category: "tooling",
    aliases: ["HTTP 402", "402 Payment Required", "PAYMENT-SIGNATURE", "PAYMENT-REQUIRED", "x402 facilitator", "X-PAYMENT", "pay per request"],
    summary: "x402 is an open payment protocol built on the HTTP `402 Payment Required` status: the server answers an unpaid request with its price, the client retries with a signed token authorization, usually an [[eip-3009|EIP-3009]] USDC transfer, and a facilitator service verifies it and settles it on chain, paying the gas.",
    sections: [
      {
        heading: "The exchange over HTTP",
        paragraphs: [
          "x402 lets a server charge for a single HTTP request, in a token such as USDC, within HTTP itself; AI agents paying on their own are one use its specification names. Three parties take part: a client that pays, a resource server that sells, and a facilitator, a service that verifies and settles payments on chain for the server, so neither side has to think about gas or RPC. This lesson follows version 2, specified in the `x402-foundation/x402` repository. A server that wants payment answers `402` with a `PAYMENT-REQUIRED` header: base64-encoded JSON with `x402Version`, a `resource` and an `accepts` array.",
          "Each `accepts` entry is one way to pay. `scheme` names the method, such as `exact` for a fixed price. `network` names the chain as a CAIP-2 identifier, a chain-agnostic `namespace:reference` pair, so Base, [[chain-id|chain id]] 8453, is `eip155:8453`. `amount` is in the token's smallest unit, `asset` is the token contract, `payTo` is the recipient, `maxTimeoutSeconds` is the time allowed to complete the payment, and `extra` carries the token's [[eip-712|EIP-712]] domain `name` and `version`, needed for signing.",
          "The client picks an entry and signs an EIP-3009 `TransferWithAuthorization`, a message saying move this much of the token from me to this address within this time window, which anyone may then submit. Its `to` is `payTo`, its `value` equals `amount`, and the reference client lets it expire `maxTimeoutSeconds` from now. It repeats the request with a `PAYMENT-SIGNATURE` header holding `accepted`, the chosen entry, and `payload`, the signature plus the authorization's six fields. On success the server returns the resource with a `PAYMENT-RESPONSE` header naming the settlement `transaction` hash and the `payer`. Version 1, still in older code, used `X-PAYMENT` headers and `maxAmountRequired`, with the requirements in the 402 body.",
        ],
      },
      {
        heading: "Verify, then settle",
        paragraphs: [
          "A facilitator is an HTTP service with `POST /verify`, `POST /settle` and `GET /supported`. For `exact` with EIP-3009, verification checks that the signature recovers to `from`, that the payer holds enough of the token, and that `to`, `value` and the validity window match the chosen entry, then simulates `transferWithAuthorization` with [[eth-call|eth_call]]. The reference facilitator adds three checks. One [[eth-get-code|eth_getCode]] tells a plain key account from a contract or a delegated account; an [[erc-6492|undeployed wallet]] has no code either, so the ERC-6492 suffix on its signature is what marks it. A `validBefore` less than six seconds away is refused, and an `asset` with no code is rejected, because an eth_call to an empty address succeeds and returns nothing, so the simulation would pass.",
          "Settlement sends `transferWithAuthorization` from the facilitator's own account, waits for the [[transaction-receipt|receipt]], and checks that the `Transfer` log names the right payer, payee and value. The default order is verify, serve, then settle, so funds move only after the resource was produced. If the transaction was broadcast but no receipt arrived in time, the facilitator may answer `settlement_pending` with the hash, for the caller to look up on chain.",
          "Tokens without EIP-3009 pay through Permit2, Uniswap's signature-approval contract, and the `x402ExactPermit2Proxy` at `0x402085c248EeA27D92E8b30b2C58ed07f9E20001`, which restricts the funds to the recipient. The `upto` scheme settles a metered amount, such as LLM token generation, up to a signed maximum; it uses Permit2 only, since an EIP-3009 authorization fixes the amount. `batch-settlement` uses escrow and off-chain vouchers, so the seller redeems many small charges in one batch.",
        ],
      },
      {
        heading: "The RPC workload behind it",
        paragraphs: [
          "Each payment costs the facilitator a handful of calls on the payment chain: eth_getCode, one or two eth_call simulations, an [[eth-send-raw-transaction|eth_sendRawTransaction]] and receipt polling. It pays the gas from a hot wallet, a key kept online, whose [[nonce|nonces]] it manages as any [[transaction-relayer|transaction relayer]] does. In the default flow the buyer's HTTP response waits for that receipt, so block time and [[head-lag|head lag]] sit on the request path: on Base, with 2-second blocks as of October 2026, settlement adds seconds to each paid request.",
          "RPC itself is sold this way. Quicknode documents an alpha gateway where an unpaid JSON-RPC POST to `https://x402.quicknode.com/base-mainnet` gets a 402, and Goldsky documents x402 payment for its Edge RPC. One settlement transaction can cost more gas than one request is worth, so both also sell in bulk: a payment tops up a prepaid balance or buys a credit bundle tied to a session token, and later calls draw it down, the same trade between settling each payment and batching that [[stablecoin-payments|stablecoin payment]] systems make.",
        ],
      },
    ],
    example: {
      title: "Paying for one JSON-RPC call on Base",
      language: "http",
      code: "# 1. the client asks without paying\nPOST /base HTTP/1.1\nHost: rpc.example\nContent-Type: application/json\n\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_blockNumber\",\"params\":[]}\n\n# 2. the server names its price: 0.001 USDC on Base, paid to payTo\nHTTP/1.1 402 Payment Required\nPAYMENT-REQUIRED: eyJ4NDAyVmVyc2lvbiI6MiwicmVzb3VyY2UiOnsi…\n# base64 of:\n{\"x402Version\":2,\n \"resource\":{\"url\":\"https://rpc.example/base\"},\n \"accepts\":[{\"scheme\":\"exact\",\"network\":\"eip155:8453\",\"amount\":\"1000\",\n   \"asset\":\"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913\",\n   \"payTo\":\"0x9fb365e4e9385e2a39febad70368267e6f571d9a\",\n   \"maxTimeoutSeconds\":60,\n   \"extra\":{\"name\":\"USD Coin\",\"version\":\"2\"}}]}\n\n# 3. the client signs a USDC transferWithAuthorization and asks again\nPOST /base HTTP/1.1\nHost: rpc.example\nContent-Type: application/json\nPAYMENT-SIGNATURE: eyJ4NDAyVmVyc2lvbiI6MiwiYWNjZXB0ZWQi…\n# base64 of:\n{\"x402Version\":2,\n \"accepted\":{\"scheme\":\"exact\",\"network\":\"eip155:8453\",\"amount\":\"1000\", …same entry…},\n \"payload\":{\"signature\":\"0x2d6a…571c\",\n   \"authorization\":{\"from\":\"0x4c1b034a2264863b6c87130793f818f7f5484261\",\n     \"to\":\"0x9fb365e4e9385e2a39febad70368267e6f571d9a\",\"value\":\"1000\",\n     \"validAfter\":\"0\",\"validBefore\":\"1792500060\",\n     \"nonce\":\"0x76bb6f39ebe296bc6ee1d5290d3e458d3ed9e2b608f2ffbb029dc0009f2c0cde\"}}}\n\n{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"eth_blockNumber\",\"params\":[]}\n\n# 4. verified, served, then settled on Base; the reply carries the settlement hash\nHTTP/1.1 200 OK\nPAYMENT-RESPONSE: eyJzdWNjZXNzIjp0cnVl…\n# base64 of:\n{\"success\":true,\"transaction\":\"0x5f1e…a07c\",\"network\":\"eip155:8453\",\n \"payer\":\"0x4c1b034a2264863b6c87130793f818f7f5484261\"}\n\n{\"jsonrpc\":\"2.0\",\"id\":1,\"result\":\"0x3274a1c\"}",
      note: "`1000` is 0.001 USDC in six-decimal units. The facilitator's verify step compares the authorization with the chosen entry: `to` must equal `payTo`, `value` must equal `amount`, and `validBefore`, which the client set to now plus `maxTimeoutSeconds`, must still be at least 6 seconds away. Quicknode's x402 docs show the same shape: an `eth_blockNumber` POST to its `base-mainnet` endpoint.",
    },
    pitfalls: [
      "Reading `amount` as whole tokens; it is in the token's smallest unit, so `10000` is 0.01 USDC.",
      "Hardcoding the EIP-712 domain instead of using `extra.name` and `extra.version`; USDC is `USD Coin` on Base but `USDC` on Base Sepolia, and a wrong name fails with `invalid_exact_evm_payload_signature`.",
      "Answering `settlement_pending` by asking the buyer for a fresh authorization, which charges twice if the first transaction lands; look the hash up first.",
      "Serving a paid route to browsers without listing `PAYMENT-REQUIRED` in `Access-Control-Expose-Headers`, so the client sees a 402 whose price it cannot read; see [[cors|CORS]].",
    ],
    related: ["eip-3009", "eip-712", "erc-6492", "onchain-agents", "transaction-relayer", "stablecoin-payments", "rpc-provider", "authentication", "eth-call", "cors"],
    sources: [
      { title: "x402 protocol specification, version 2", url: "https://github.com/x402-foundation/x402/blob/main/specs/x402-specification-v2.md" },
      { title: "x402 HTTP transport, version 2", url: "https://github.com/x402-foundation/x402/blob/main/specs/transports-v2/http.md" },
      { title: "x402 scheme: exact on EVM", url: "https://github.com/x402-foundation/x402/blob/main/specs/schemes/exact/scheme_exact_evm.md" },
      { title: "Goldsky Edge RPC: x402", url: "https://docs.goldsky.com/edge-rpc/capabilities/x402" },
    ],
  },
  {
    id: "onchain-agents",
    title: "Autonomous agents onchain",
    category: "tooling",
    aliases: ["AI agent wallet", "LLM agent", "agent wallet", "AgentKit", "Olas", "MCP server", "agentic payments"],
    summary: "An onchain agent is a program, often driven by a large language model, that reads chain state through RPC, decides what to do, and signs and sends [[transaction|transactions]] without a person approving each one, so its safety rests on the tools it is given, the authority its key carries, and checks that do not depend on the model.",
    sections: [
      {
        heading: "Read, decide, act",
        paragraphs: [
          "The loop is a trading bot's: read balances, prices or events with [[eth-call|eth_call]], [[eth-get-balance|eth_getBalance]] and [[eth-get-logs|eth_getLogs]]; decide; sign and send a transaction. What is new is the decider. A large language model never calls a node itself. Its host program offers it tools, named functions it may ask to run with arguments, and runs whichever it picks. The Model Context Protocol, MCP, is a common way to offer them: a server lists tools with `tools/list`, each with a `name`, a `description` and an `inputSchema`, a JSON Schema for the arguments, and the host invokes one with `tools/call`. MCP messages are [[json-rpc|JSON-RPC 2.0]] too, but one layer up: the request names a tool, and the MCP server turns it into an Ethereum request to a node.",
          "Coinbase AgentKit is one toolkit built this way. Its action providers are the tools: ERC-20 transfers, swaps, [[x402|x402]] payments. Its wallet providers hold the key: Coinbase's CDP, Privy, ZeroDev or a plain viem client. Its extensions plug the tools into MCP, LangChain or the Vercel AI SDK. The viem provider estimates gas with [[eth-estimate-gas|eth_estimateGas]] and multiplies the estimate by 1.2 by default.",
          "Olas services, built with the Open Autonomy framework, spread one agent across several instances that independent operators can run, so no single instance can act alone. The instances agree on each step through a consensus layer built on Tendermint, a replication engine that keeps agreeing even if some participants fail or lie. A threshold of them sign a transaction from a Safe, a multisig wallet contract that executes only with enough owner signatures; a keeper they nominate sends it; and the others check that it executed. Each instance reaches the chain through its own RPC endpoint: the URL stored under `address` in the `ledger_apis` entry of its `valory/ledger` connection, beside the `chain_id`.",
        ],
      },
      {
        heading: "Limiting what the key can do",
        paragraphs: [
          "A model does not reliably tell instructions from data: text it reads can steer it just as its operator's prompt does. So the key, not the prompt, is the security boundary. AgentKit's own documentation says it does not gate transfers behind human approval, enforce spend caps or allowlist destinations, and leaves that to the developer. The usual answer is limited authority. A hot wallet, a key kept online, holds only what the agent may lose. An [[erc-4337|ERC-4337]] smart account can accept a session key, a second key that the account honours only for named contracts, functions and amounts, until an expiry. An existing key-controlled account can get the same rules by [[eip-7702|delegating]] to such an account implementation.",
          "Two draft standards give these grants a wallet interface. ERC-7715 adds `wallet_requestExecutionPermissions`, so an application can ask a user's wallet for a scoped permission, for example an `erc20-token-allowance` with an `expiry` rule. ERC-7710 defines how the holder redeems it, through a delegation manager's `redeemDelegations`, and x402's `exact` scheme accepts such a delegation as a way to pay. Limits can also live in the agent's runtime: AgentKit's x402 provider pays only registered service URLs, only in USDC, and at most `maxPaymentUsdc` per request, 1 USDC by default.",
        ],
      },
      {
        heading: "Simulate before sending, verify before believing",
        paragraphs: [
          "Before signing, a guard that is not the model simulates the exact transaction at a pinned block with eth_call or [[eth-simulate|eth_simulateV1]] and compares the outcome with the intent: a request to send 25 USDC should produce one `Transfer` [[event-log|log]] of `25000000` units from the agent's address and nothing else. That is [[transaction-simulation|transaction simulation]] used as a brake. It is a check, not a promise: state can change before the transaction is included, and the contract may then behave differently.",
          "Everything the agent believes comes from RPC answers, which can mislead it in two ways. A stale or dishonest endpoint gives the model a wrong picture; reading at `finalized` or cross-checking a second endpoint, as in [[verified-rpc|verified RPC]], bounds that. And chain data is untrusted text: a token's `name()` or an NFT's metadata can contain instructions, and any contract can return `USDC` from `symbol()`. Prompt injection, text planted so that a model reads it as an instruction, turns such data into a transaction, so token identity has to come from an address allowlist, never from names.",
        ],
      },
    ],
    example: {
      title: "One guarded transfer, step by step",
      language: "text",
      code: "1. the model asks its host to call a tool; the host sends an MCP request\n   {\"jsonrpc\":\"2.0\",\"id\":7,\"method\":\"tools/call\",\"params\":{\n     \"name\":\"erc20_balance\",\n     \"arguments\":{\"token\":\"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",\"owner\":\"0x7a3c…91e0\"}}}\n\n2. the MCP server turns it into an Ethereum request, pinned to a block\n   eth_call {to: 0xA0b8…eB48, data: 0x70a08231 <owner padded to 32 bytes>} at 0x18de2a8\n   <- 0x…05f5e100                      100000000 units = 100 USDC (6 decimals)\n\n3. the model proposes: transfer 25 USDC to 0x9fb3…1d9a\n\n4. policy, outside the model\n   token 0xA0b8…eB48 on the allowlist?           yes, by address, not by symbol\n   payee 0x9fb3…1d9a on the allowlist?           yes\n   25 USDC within today's remaining 50 USDC?     yes\n\n5. simulate the exact call from 0x7a3c…91e0 at 0x18de2a8\n   expect: one Transfer(0x7a3c…91e0 -> 0x9fb3…1d9a, 25000000) and no other outflow\n\n6. sign a UserOperation with a session key that may call only USDC transfer, until 2026-10-30T00:00Z\n   eth_sendUserOperation to a bundler -> poll eth_getUserOperationReceipt -> re-read the balance",
      note: "Steps 4 and 5 run outside the model; the model can propose anything, but only a transfer that passes the allowlist, the cap and the simulation is signed, and the session key limits the damage if all three are wrong.",
    },
    pitfalls: [
      "Giving the agent a treasury key and relying on the prompt to keep it in bounds; injected text can reach every tool the key can use.",
      "Choosing tokens or counterparties by a symbol or name read from the chain, which lets any contract pose as USDC.",
      "Treating a successful simulation at `latest` as a promise; state can move before inclusion, so limits must also hold on chain.",
      "Letting several agent processes sign with one key without a shared [[nonce|nonce]] source, so their transactions replace or block each other.",
      "Allowing x402 payments to any service the agent discovers, without an allowlist and a per-request cap.",
    ],
    related: ["transaction-simulation", "erc-4337", "eip-7702", "x402", "eth-simulate", "verified-rpc", "signing-methods", "keeper", "transaction-relayer", "security"],
    sources: [
      { title: "Model Context Protocol: Tools", url: "https://modelcontextprotocol.io/specification/2026-07-28/server/tools" },
      { title: "Coinbase AgentKit", url: "https://github.com/coinbase/agentkit" },
      { title: "Open Autonomy: What is an agent service", url: "https://stack.olas.network/open-autonomy/get_started/what_is_an_agent_service/" },
      { title: "ERC-7715: Request Permissions from Wallets", url: "https://eips.ethereum.org/EIPS/eip-7715" },
    ],
  },
];
