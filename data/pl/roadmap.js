// Polish names and blurbs for the stages of the learning path, keyed by the ids in
// data/roadmap.js. Labels sit on the roadmap as stage markers, so they stay short.
export const stages = {
  start: {
    label: "Zacznij tutaj",
    blurb: "Czym jest RPC, jak żądanie JSON-RPC jest zbudowane, wysłane i obsłużone oraz jakie dwie warstwy stoją za każdym endpointem Ethereum."
  },
  data: {
    label: "Dane łańcucha",
    blurb: "Konta, stan, transakcje, gas, bloki i receipty: dane, z których zbudowana jest każda odpowiedź RPC."
  },
  reads: {
    label: "Odczyt łańcucha",
    blurb: "Pierwsze żądania: numery bloków, bloki, salda, transakcje, receipty, kod, storage i eth_call."
  },
  writes: {
    label: "Opłaty i wysyłanie",
    blurb: "Jak wyceniane są opłaty i szacowany jest gas, co dzieje się z transakcją od wysłania do trafienia do bloku i jak relayery niezawodnie doprowadzają ją do bloku."
  },
  events: {
    label: "Eventy i logi",
    blurb: "Jak znaleźć to, co wyemitowały kontrakty: topics eventów, filtr Blooma, eth_getLogs, filtry i subskrypcje."
  },
  execution: {
    label: "Symulacja i tracing",
    blurb: "Kontrakty dokładniej, potem metody, które symulują wywołanie na zmienionym stanie i odtwarzają wykonanie krok po kroku, oraz techniki i usługi zbudowane na tych metodach."
  },
  layers: {
    label: "Dwa rodzaje klientów",
    blurb: "Klienci wykonawczy i klienci konsensusu, Engine API i Beacon API, przez które się komunikują, oraz to, co klienci dodają ponad standard."
  },
  pos: {
    label: "Proof of stake",
    blurb: "Sloty, atestacje, fork choice, fast confirmation rule i finalność: dlaczego odczytany blok może się jeszcze zmienić i od którego momentu już nie może."
  },
  validators: {
    label: "Walidatorzy",
    blurb: "Oprogramowanie i klucze walidatora, za co dostaje nagrody, a za co slashing, jak chroni się przed slashingiem oraz jak jego stake trafia do warstwy wykonawczej i z niej wychodzi."
  },
  lineup: {
    label: "Przegląd klientów",
    blurb: "Klienci wykonawczy i klienci konsensusu, na których działa dziś sieć, oraz to, czym różni się zachowanie RPC każdego z nich."
  },
  nodes: {
    label: "Węzły i historia",
    blurb: "Węzły pełne, archiwalne i pruned, jak węzeł się synchronizuje, ile historii przechowuje i jak o tym informuje oraz jaka sieć peer-to-peer działa pod spodem."
  },
  networks: {
    label: "Sieci i devnety",
    blurb: "Aktualizacje sieci, blok genesis, testnety, inne sieci EVM oraz lokalne łańcuchy, forki i narzędzia testowe do programowania i testów."
  },
  mev: {
    label: "MEV i budowa bloków",
    blurb: "Kto i jak buduje bloki: strumienie mempoola, searcherzy, boty likwidacyjne i solverzy, bundle i MEV-Share, builderzy, relaye, MEV-Boost, ePBS i prywatne wysyłanie transakcji."
  },
  operations: {
    label: "Udostępnianie RPC",
    blurb: "Kto korzysta z RPC i do czego, provider RPC czy własny węzeł, limity, uwierzytelnianie i zabezpieczenia endpointu oraz to, czego endpoint dowiaduje się o wywołujących."
  },
  reliability: {
    label: "Niezawodność i skala",
    blurb: "Routing, health checki, failover, retry, cache i monitoring dla wielu węzłów RPC naraz, wyścig o najnowszy head i benchmarki całości."
  },
  indexing: {
    label: "Indeksowanie",
    blurb: "Zamiana surowych bloków i logów w tabele, które da się odpytywać i które przetrwają reorg, oraz pipeline'y zbudowane w ten sposób: depozyty, płatności, uzgadnianie sald, analityka, nagrody, portfolio i monitoring bezpieczeństwa."
  },
  proofs: {
    label: "Trie i dowody",
    blurb: "Jak trie wiąże cały stan z jednym hashem w nagłówku i jak dowód pozwala sprawdzić odpowiedź względem state roota, któremu już ufasz."
  },
  trustless: {
    label: "Bez zaufania (trustless)",
    blurb: "Zaufane nagłówki, lekcy klienci i weryfikowalne RPC, a potem witnessy, droga do stateless Ethereum, binarne drzewo stanu i dowodzenie bloków w czasie rzeczywistym."
  },
  l2: {
    label: "Layer 2",
    blurb: "Rollupy, dostępność danych, bloby i PeerDAS, fraud proofs i validity proofs, sekwencery, bridge'e i ich relayery oraz to, czym endpoint L2 różni się od mainnetu."
  },
  wallets: {
    label: "Portfele, dappy i DeFi",
    blurb: "Interfejs portfela, podpisywanie, biblioteki, nazwy, tokeny i abstrakcja kont, a potem aplikacje zbudowane na RPC: DEX-y, agregatory, oracle, keepery, vaulty, NFT, governance, płatności i agenci."
  }
};
