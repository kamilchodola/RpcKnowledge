// Polish names and blurbs for the layers of the map, keyed by the ids in data/categories.js.
export const categories = {
  foundations: {
    label: "Podstawy",
    blurb: "Czym jest RPC, jak zbudowane i przesyłane jest JSON-RPC oraz jak dwie warstwy Ethereum udostępniają swoje interfejsy."
  },
  protocol: {
    label: "Dane protokołu",
    blurb: "Struktury danych, z których składa się każda odpowiedź RPC: bloki, transakcje, receipty, konta, stan, gas i kodowania."
  },
  requests: {
    label: "Żądania",
    blurb: "Konkretne metody i przestrzenie nazw JSON-RPC: co przyjmują, co zwracają i jak węzeł na nie odpowiada."
  },
  clients: {
    label: "Klienci",
    blurb: "Implementacje warstwy wykonawczej i warstwy konsensusu, które faktycznie obsługują RPC."
  },
  nodes: {
    label: "Węzły i sieć",
    blurb: "Rodzaje węzłów, sposoby synchronizacji, ile danych węzeł przechowuje i protokoły peer-to-peer po drugiej stronie RPC."
  },
  consensus: {
    label: "Konsensus",
    blurb: "Proof of stake: sloty, walidatorzy, atestacje, fork choice, finalność i rynek budowania bloków."
  },
  indexing: {
    label: "Indeksowanie",
    blurb: "Zamiana surowych bloków, receiptów i logów w dane, które da się odpytywać i które przetrwają reorg."
  },
  proofs: {
    label: "Dowody i weryfikacja",
    blurb: "Jak sprawdzić odpowiedź RPC zamiast jej ufać: trie, dowody, zaufane nagłówki i lekcy klienci."
  },
  scaling: {
    label: "L2 i skalowanie",
    blurb: "Rollupy, sekwencery, bloby i to, czym różni się RPC, gdy łańcuch jest siecią L2."
  },
  operations: {
    label: "RPC na produkcji",
    blurb: "Uruchamianie i używanie RPC na produkcji: providerzy, routing, cache, limity, uwierzytelnianie, health checki i bezpieczeństwo."
  },
  tooling: {
    label: "Portfele i narzędzia",
    blurb: "Jak portfele, biblioteki i narzędzia deweloperskie korzystają z RPC."
  }
};
