// The layers of the map. Order controls the order of the clusters in the overview
// layout and of the grouped results everywhere else.
export const categories = [
  {
    id: "foundations",
    label: "Foundations",
    color: "#6d5dfc",
    blurb: "What RPC is, how JSON-RPC is framed and transported, and how Ethereum's two layers expose their interfaces."
  },
  {
    id: "protocol",
    label: "Protocol data",
    color: "#0f7b8f",
    blurb: "The data structures every RPC answer is made of: blocks, transactions, receipts, accounts, state, gas, and encodings."
  },
  {
    id: "requests",
    label: "Requests",
    color: "#f2994a",
    blurb: "The concrete JSON-RPC methods and namespaces, what they take, what they return, and how a node answers them."
  },
  {
    id: "clients",
    label: "Clients",
    color: "#2f80ed",
    blurb: "The software implementations of the execution and consensus layers that actually serve RPC."
  },
  {
    id: "nodes",
    label: "Nodes & networking",
    color: "#13a085",
    blurb: "Node types, sync strategies, storage retention, and the peer-to-peer protocols behind the RPC boundary."
  },
  {
    id: "consensus",
    label: "Consensus",
    color: "#c2185b",
    blurb: "Proof of stake: slots, validators, attestations, fork choice, finality, and the block-building market."
  },
  {
    id: "indexing",
    label: "Indexing",
    color: "#eb5757",
    blurb: "Turning raw blocks, receipts, and logs into queryable data, and surviving reorgs while doing it."
  },
  {
    id: "proofs",
    label: "Proofs & verification",
    color: "#bb6bd9",
    blurb: "How a caller can verify an RPC answer instead of trusting it: tries, proofs, trusted headers, light clients."
  },
  {
    id: "scaling",
    label: "Layer 2 & scaling",
    color: "#b8860b",
    blurb: "Rollups, sequencers, blobs, and how RPC differs when the chain is an L2."
  },
  {
    id: "operations",
    label: "Operations",
    color: "#219653",
    blurb: "Running and consuming RPC in production: providers, routing, caching, limits, auth, health, and security."
  },
  {
    id: "tooling",
    label: "Wallets & tooling",
    color: "#7a8a3a",
    blurb: "How wallets, libraries, and developer tools sit on top of RPC."
  }
];
