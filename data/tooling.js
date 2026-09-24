// Category: Wallets & tooling — how wallets, libraries, and developer tools
// sit on top of RPC.

export const topics = [
  {
    id: "eip-1193",
    title: "EIP-1193 provider",
    category: "tooling",
    aliases: ["window.ethereum", "injected provider", "provider api", "eip-6963", "accountsChanged", "chainChanged"],
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
          "For years every wallet wrote itself to `window.ethereum`, so the last extension to load won and users with two wallets could not choose. EIP-6963 fixes that with an announcement protocol: the page dispatches an `eip6963:requestProvider` event, each wallet responds with `eip6963:announceProvider` carrying its provider object and an `info` record holding `uuid`, `name`, `icon`, and a reverse-DNS `rdns` identifier, and the page presents a list. New code should discover providers this way and treat `window.ethereum` only as a fallback.",
        ],
      },
    ],
    example: {
      title: "Connecting and reacting to changes",
      language: "js",
      code: "// discovery: collect every announced wallet, not just window.ethereum\nconst wallets = [];\nwindow.addEventListener('eip6963:announceProvider', (e) => wallets.push(e.detail));\nwindow.dispatchEvent(new Event('eip6963:requestProvider'));\n\nconst { provider } = wallets[0];\n\ntry {\n  const accounts = await provider.request({ method: 'eth_requestAccounts' });\n  const chainId = await provider.request({ method: 'eth_chainId' }); // '0x1'\n  console.log(accounts[0], chainId);\n} catch (err) {\n  if (err.code === 4001) return; // user dismissed the prompt; not an error\n  throw err;\n}\n\nprovider.on('chainChanged', () => window.location.reload());\nprovider.on('accountsChanged', (accounts) => {\n  if (accounts.length === 0) signOut();\n});",
      note: "`eth_requestAccounts` prompts; `eth_accounts` does not and returns an empty array until the user has granted access.",
    },
    pitfalls: [
      "Treating error code `4001` as a failure to retry; the user declined, and re-prompting immediately is how sites get blocked by wallets.",
      "Reading `window.ethereum` and assuming it is the wallet the user wants; with two extensions installed it is whichever one loaded last.",
      "Caching the chain id once at startup; the user can switch networks at any moment, and only `chainChanged` tells you.",
      "Routing bulk reads through the injected provider; you inherit the wallet's endpoint, its limits, and its unknown feature set.",
    ],
    related: ["wallet-rpc", "signing-methods", "dapp-architecture", "client-libraries", "json-rpc", "chain-id", "rpc-errors", "eth-send-transaction", "head-lag"],
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
    related: ["eip-1193", "signing-methods", "dapp-architecture", "chain-id", "erc-4337", "eip-7702", "rpc-errors", "client-libraries"],
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
    aliases: ["personal_sign", "eth_sign", "eth_signTypedData_v4", "eth_accounts", "EIP-191", "ERC-1271"],
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
          "A signature is 65 bytes: `r`, `s`, and a `v` of 27 or 28. Recovering the signer means rebuilding the exact digest the wallet signed and running `ecrecover`; get the prefix or the encoding wrong and you recover a valid-looking but meaningless [[address|address]]. [[smart-contract|Smart contract]] accounts cannot produce ECDSA signatures at all, so their signatures are verified by calling the account's `isValidSignature(bytes32,bytes)` from ERC-1271 with [[eth-call|eth_call]] and checking for the magic return value `0x1626ba7e`. Any login flow that must work for [[erc-4337|smart accounts]] needs that branch.",
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
      "Verifying with `ecrecover` alone and rejecting smart contract accounts, which need the ERC-1271 `isValidSignature` call instead.",
      "Accepting a signature as authentication without a server-issued nonce, an origin, and an expiry, which makes it replayable forever.",
      "Passing an already-hashed value to `personal_sign`; the wallet prefixes and hashes again, so the digest is not what the contract expects.",
    ],
    related: ["eip-712", "eip-1193", "wallet-rpc", "ecdsa-signature", "erc-4337", "security", "namespaces", "eth-call"],
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
          "The canonical use is ERC-2612 `permit`: a token approval signed off-chain and submitted by someone else, which saves the user a [[transaction|transaction]] and lets a relayer pay the [[gas|gas]]. The same pattern underlies order signing on exchanges and meta-transactions. On-chain the contract recomputes the digest and calls `ecrecover`, so any mismatch in the domain, the type string, or the field order yields a different [[address|address]] and a failed check rather than a helpful error.",
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
    related: ["signing-methods", "eip-1193", "abi", "keccak-256", "ecdsa-signature", "smart-contract", "chain-id", "erc-4337"],
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
    related: ["eth-call", "batch-request", "abi", "client-libraries", "token-standards", "rate-limits", "block-tag", "smart-contract"],
    sources: [
      { title: "Multicall3 repository", url: "https://github.com/mds1/multicall" },
      { title: "viem: multicall", url: "https://viem.sh/" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
  {
    id: "ens",
    title: "ENS resolution",
    category: "tooling",
    aliases: ["namehash", "resolver", "reverse record", "CCIP-Read", "EIP-3668", "vitalik.eth"],
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
          "Forward resolution is two reads: `eth_call` the registry's `resolver(node)` to find the resolver, then `eth_call` that resolver's `addr(node)`. A Universal Resolver contract collapses both into one call and handles the newer wildcard and offchain paths, which is what [[client-libraries|client libraries]] use behind `getEnsAddress` or `resolveName`. Reverse resolution goes the other way: namehash `<address without 0x>.addr.reverse`, read `name(node)`, and then forward-resolve the answer and check that it points back at the same address. Skipping that second step lets anyone set a reverse record claiming to be someone else.",
          "ENS's registry lives on Ethereum mainnet, so resolving a name from an L2 means querying mainnet, not the local chain; testnets such as Sepolia run a separate ENS deployment of their own. Names also change: records are mutable and registrations expire, so cache a resolution for minutes, not forever.",
        ],
      },
      {
        heading: "CCIP-Read for offchain names",
        paragraphs: [
          "Most subdomain systems keep their records off-chain. EIP-3668 defines how: the resolver deliberately reverts with `OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)`, the client sees that specific error, fetches the data from one of the gateway URLs, and calls the named callback with the gateway's response so the contract can verify it. A plain `eth_call` from curl therefore looks like a failed call — the [[revert|revert]] is the protocol, not an error, and only a client that implements the flow will resolve the name.",
        ],
      },
    ],
    pitfalls: [
      "Trusting a reverse record without forward-resolving it back to the same address; reverse records are self-declared.",
      "Hashing a raw user-typed name without ENSIP-15 normalisation, which produces a different node for lookalike characters.",
      "Resolving against whichever chain the user is on; the registry is on mainnet, so L2 dapps need a mainnet endpoint for names.",
      "Reading an `OffchainLookup` revert as a broken resolver; it is EIP-3668 asking the client to fetch from a gateway and call back.",
    ],
    related: ["eth-call", "keccak-256", "smart-contract", "client-libraries", "abi", "revert", "dapp-architecture", "address"],
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
    aliases: ["UserOperation", "bundler", "EntryPoint", "paymaster", "smart account", "eth_sendUserOperation"],
    summary: "ERC-4337 adds account abstraction without changing the protocol: users sign UserOperations instead of [[transaction|transactions]], bundlers collect them into one call to a singleton EntryPoint [[smart-contract|contract]], and the account contract decides what a valid signature is.",
    sections: [
      {
        heading: "The pieces",
        paragraphs: [
          "A UserOperation is a struct, not a transaction: it names a `sender` account contract, a nonce, the `callData` to execute, several gas limits, fee fields, an optional paymaster, and a `signature` whose meaning is entirely up to the account. Users submit them to a bundler, which keeps a separate pool outside the node's [[mempool|transaction pool]], and periodically sends one ordinary transaction calling `handleOps` on the EntryPoint singleton. The EntryPoint loops over the batch, asks each account to validate, then executes each call, refunding the bundler from the account's deposit or from a paymaster.",
          "That indirection is what buys the features: signatures that are not secp256k1, session keys, social recovery, spending limits, and gas paid in tokens or sponsored entirely by a paymaster. The EntryPoint is versioned and its [[address|address]] changes between versions, so a client asks the bundler with `eth_supportedEntryPoints` rather than hardcoding one.",
        ],
      },
      {
        heading: "The bundler RPC",
        paragraphs: [
          "Bundlers expose five methods that look like node methods but are not. `eth_sendUserOperation` takes the operation and an EntryPoint address and returns a `userOpHash`. `eth_estimateUserOperationGas` returns `preVerificationGas`, `verificationGasLimit`, and `callGasLimit`. `eth_getUserOperationByHash` and `eth_getUserOperationReceipt` retrieve it once mined, the latter reporting `success`, `actualGasCost`, and the enclosing [[transaction-receipt|receipt]]. `eth_supportedEntryPoints` lists which versions the bundler serves.",
          "None of these exist on an [[execution-client|execution client]], so sending them to a normal endpoint returns `-32601`. A bundler URL and an RPC URL are different endpoints, even when a [[rpc-provider|provider]] sells both behind similar-looking hostnames.",
        ],
      },
      {
        heading: "What differs from a transaction",
        paragraphs: [
          "A `userOpHash` is not a transaction hash. [[eth-get-transaction-receipt|eth_getTransactionReceipt]] with one returns `null` forever; poll `eth_getUserOperationReceipt` instead. Inclusion is not success either: the bundle transaction can succeed while your operation's inner call reverted, so check the `success` field rather than the receipt `status`. Nonces come from the EntryPoint as a two-dimensional key and sequence pair, so [[eth-get-transaction-count|eth_getTransactionCount]] on the account tells you nothing useful.",
          "EIP-7702, live since Pectra, overlaps from the other direction: an existing EOA can delegate its code to a contract, and [[eth-get-code|eth_getCode]] then returns the 23-byte designator `0xef0100` followed by that contract's address. The two are complementary — 4337 infrastructure can serve delegated EOAs, and [[eip-7702|set code transactions]] give plain accounts batching and sponsorship without deploying a new one.",
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
    related: ["eip-7702", "transaction", "wallet-rpc", "signing-methods", "mempool", "dapp-architecture", "eth-get-transaction-receipt", "smart-contract", "rpc-provider"],
    sources: [
      { title: "ERC-4337: Account Abstraction Using Alt Mempool", url: "https://eips.ethereum.org/EIPS/eip-4337" },
      { title: "EIP-7702: Set EOA account code", url: "https://eips.ethereum.org/EIPS/eip-7702" },
      { title: "ethereum.org: Account abstraction", url: "https://ethereum.org/developers/docs/accounts/" },
    ],
  },
  {
    id: "local-devnet",
    title: "Local development nodes",
    category: "tooling",
    aliases: ["anvil", "hardhat network", "kurtosis", "ethereum-package", "forking", "impersonation", "31337"],
    summary: "A local development node is a throwaway chain on your machine that serves the same [[json-rpc|JSON-RPC]] surface as a real node while adding methods to mine on demand, rewrite [[state|state]], impersonate accounts, and fork mainnet at a chosen [[block|block]].",
    sections: [
      {
        heading: "Anvil",
        paragraphs: [
          "Anvil ships with Foundry and starts in under a second on `http://127.0.0.1:8545`, [[chain-id|chain id]] `31337`, with ten prefunded accounts and instant mining. `anvil --fork-url https://rpc.example --fork-block-number 21000000` turns it into a local copy of mainnet at that height: it holds no state itself, fetches [[account|accounts]], code, and storage slots from the upstream node on first touch, and caches them. That is how you reproduce a failed transaction or test against live contracts without deploying anything.",
          "Its extra methods do what no real node allows. `anvil_impersonateAccount` lets you send from an [[address|address]] whose key you do not have, `anvil_setBalance`, `anvil_setCode`, and `anvil_setStorageAt` rewrite state directly, `evm_mine` produces a block when automining is off, `evm_increaseTime` moves the clock, and `evm_snapshot` with `evm_revert` gives you a rollback point between test cases. Most `hardhat_` names are accepted as aliases.",
        ],
      },
      {
        heading: "Hardhat Network",
        paragraphs: [
          "Hardhat Network covers the same ground from the JavaScript side, either in-process during a test run or as a standalone server via `npx hardhat node`, also on chain id `31337`. Its control methods use the `hardhat_` prefix: `hardhat_impersonateAccount`, `hardhat_setBalance`, `hardhat_mine` to fast-forward many blocks cheaply, and `hardhat_reset` to re-fork from a different block mid-suite. It also supports `console.log` inside Solidity, which no real [[execution-client|execution client]] does.",
        ],
      },
      {
        heading: "When you need a real network",
        paragraphs: [
          "Neither tool runs consensus, so neither can test anything involving the [[engine-api|Engine API]], [[finality|finality]], the `safe` and `finalized` [[block-tag|block tags]], or client interoperability. The Kurtosis `ethereum-package` fills that gap: it launches a full devnet in containers with real [[execution-client|execution]] and [[consensus-client|consensus clients]] paired as they are in production — [[geth|Geth]], [[nethermind|Nethermind]], [[reth|Reth]], [[besu|Besu]], [[erigon|Erigon]] against [[lighthouse|Lighthouse]], [[teku|Teku]], [[prysm|Prysm]], [[nimbus|Nimbus]], or [[lodestar|Lodestar]] — from a generated genesis, with fork timings you choose. It is the standard way to rehearse a [[hardfork|network upgrade]] before it reaches a testnet.",
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
      "Assuming `safe` and `finalized` mean anything on Anvil or Hardhat Network; neither runs consensus.",
    ],
    related: ["cli-tools", "eth-send-transaction", "state-override", "client-libraries", "block-tag", "genesis", "testnets", "dapp-architecture", "hardfork"],
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
    related: ["json-rpc", "client-libraries", "local-devnet", "endpoint-capabilities", "rpc-errors", "eth-call", "debug-api", "websocket-transport"],
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
          "ERC-721 keeps `balanceOf(address)` as a count and adds `ownerOf(uint256)` and `tokenURI(uint256)`; ERC-1155 uses `balanceOf(address,uint256)` per token id. Which interface a contract implements is discoverable with ERC-165's `supportsInterface(bytes4)`, selector `0x01ffc9a7`, though older contracts predate it and simply do not answer.",
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
          "Nothing on chain lists the tokens an [[account|account]] holds. The only honest answers are to scan every `Transfer` log that mentions the address across all blocks, which is expensive and bounded by provider [[rate-limits|range limits]], or to keep an [[indexer|indexer]] that does it once and maintains a table. Hosted providers sell exactly this as an enhanced API, which is convenient and is not part of any standard.",
          "Derive history from logs, but never derive a balance from them. Rebasing tokens change balances with no event, fee-on-transfer tokens deliver less than the logged amount, and some contracts mint or burn without emitting. `balanceOf` at a specific block is the only authoritative number, so use [[multicall|multicall]] to read many of them in one consistent snapshot.",
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
      "Summing `Transfer` amounts to compute a balance; rebasing and fee-on-transfer tokens make the total wrong, so call `balanceOf`.",
      "Treating every `Transfer` log with that topic0 as ERC-20; four topics and empty `data` means it is an ERC-721 token id.",
      "Calling `symbol()` and failing on old tokens that return a `bytes32` rather than a string, which decodes as garbage or throws.",
    ],
    related: ["eth-call", "eth-get-logs", "abi", "event-signature", "multicall", "indexer", "event-log", "smart-contract", "client-libraries"],
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
          "Reads are yours to control. Your frontend or backend talks to an [[rpc-provider|RPC provider]] or your own node, picks the [[block-tag|block tag]], and handles [[retries|retries]] and [[rate-limits|limits]]. Writes are not: the [[eip-1193|injected provider]] forwards signing to the wallet, and the wallet simulates, estimates, and broadcasts through its own endpoint. The two endpoints are rarely at the same head, so a transaction the wallet has already accepted may be invisible to your next read; see [[head-lag|head consistency]].",
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
    related: ["eip-1193", "client-libraries", "indexer", "rpc-provider", "head-lag", "wallet-rpc", "token-standards", "eth-call", "confirmations", "the-graph"],
    sources: [
      { title: "ethereum.org: Intro to dapps", url: "https://ethereum.org/developers/docs/dapps/" },
      { title: "viem documentation", url: "https://viem.sh/" },
      { title: "ethereum.org: JSON-RPC API", url: "https://ethereum.org/developers/docs/apis/json-rpc/" },
    ],
  },
];
