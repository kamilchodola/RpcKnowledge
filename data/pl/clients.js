// Polish text for the Clients lessons, keyed by topic id. Only the words: ids, link
// targets, code, related topics, and sources come from data/clients.js.
export const topics = {
  "execution-client": {
    title: "Klient wykonawczy",
    aliases: ["EL client", "klient EL", "execution client", "klient warstwy wykonawczej", "el", "geth nethermind erigon reth besu"],
    summary: "Klient wykonawczy to oprogramowanie, które przechowuje [[state|stan globalny]] Ethereum, wykonuje transakcje w [[evm|EVM]], prowadzi [[mempool|mempool]] i udostępnia zarówno publiczne API `eth_` [[json-rpc|JSON-RPC]], jak i uwierzytelnione [[engine-api|Engine API]].",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Klient wykonawczy implementuje reguły [[execution-layer|warstwy wykonawczej]]: ze stanu bloku nadrzędnego i uporządkowanej listy transakcji musi wyprowadzić dokładnie jeden stan wynikowy i jeden zestaw [[transaction-receipt|receiptów]]. Przechowuje ten stan i historię łańcucha we własnej bazie danych, wymienia bloki i transakcje z peerami przez [[devp2p|devp2p]] na porcie 30303 i odpowiada na [[json-rpc|JSON-RPC]] na porcie 8545 przez [[http-transport|HTTP]] i 8546 przez [[websocket-transport|WebSocket]], jeśli operator włączy te listenery.",
          "Od [[the-merge|Merge]] klient wykonawczy nie decyduje już, który blok jest head łańcucha. Mówi mu to [[consensus-client|klient konsensusu]], wywołując `engine_forkchoiceUpdated` przez [[engine-api|Engine API]] na porcie 8551. Dlatego klienta wykonawczego nigdy nie uruchamia się samego: jeden klient wykonawczy tworzy parę z dokładnie jednym [[beacon-node|beacon node]], a ta para to właśnie to, co ludzie nazywają węzłem.",
          "Za mainnetem podąża pięć implementacji: [[geth|Geth]] w Go, [[nethermind|Nethermind]] w C#, [[erigon|Erigon]] w Go, [[reth|Reth]] w Ruście i [[besu|Besu]] w Javie. Piszą je niezależne zespoły według tych samych specyfikacji, więc muszą się zgadzać co do bitu przy każdym [[state-root|state root]]. Rozbieżność to błąd konsensusu, a nie kwestia gustu, i na tym właśnie opiera się cały argument za [[client-diversity|różnorodnością klientów]]."
        ]
      },
      {
        heading: "Cztery zadania",
        paragraphs: [
          "Po pierwsze walidacja: ponowne wykonanie każdej transakcji przychodzącego bloku i sprawdzenie, czy obliczone `stateRoot`, `receiptsRoot` i `gasUsed` zgadzają się z [[block-header|nagłówkiem]]. Po drugie przechowywanie: trzymanie bieżącego stanu, żeby dało się odpowiadać na metody odczytu, i wystarczającej historii dla [[eth-get-block-by-number|eth_getBlockByNumber]] i [[eth-get-logs|eth_getLogs]]. Po trzecie mempool: przyjmowanie podpisanych transakcji od wywołujących RPC i od peerów, sprawdzanie reguł nonce, salda i opłat oraz rozgłaszanie ich dalej. Po czwarte udostępnianie API.",
          "Budowanie bloków to ta sama ścieżka kodu w odwrotnym kierunku. Gdy klient konsensusu przekaże `payloadAttributes` do `engine_forkchoiceUpdatedV3`, klient wykonawczy zaczyna składać payload z mempoola i zwraca go z `engine_getPayload`; zobacz [[engine-payload|metody Engine API]]. Wszystko, co wywołujący widzi przez metody `eth_` — salda, receipty, logi, estymacje gasu — to odczyt struktur, które utrzymują te zadania."
        ]
      },
      {
        heading: "Czym różnią się implementacje",
        paragraphs: [
          "Specyfikacja ustala odpowiedzi, a nie mechanizm. Klienci różnią się [[client-storage|silnikami bazy danych]], sposobem synchronizacji ([[snap-sync|snap sync]] albo etapowe ponowne wykonywanie historii), apetytem na pamięć i dysk, a najbardziej widać to po niestandardowych [[namespaces|przestrzeniach nazw]], które udostępniają. Tracing [[debug-api|debug_]] w stylu Geth, tracing [[trace-api|trace_]] w stylu Parity i API wyszukiwania `ots_`, które Erigon udostępnia dla [[otterscan|Otterscan]], to [[client-namespaces|opcjonalne dodatki]], a nie coś, co musi zapewnić każdy klient.",
          "Klienta wybiera się według pytań, na które endpoint musi odpowiadać: stan [[archive-node|archiwalny]] na starych blokach, tracing, [[eth-get-proof|eth_getProof]] głęboko w historii, obsługa [[eth-simulate|eth_simulateV1]]. Potem trzeba sprawdzić, co się faktycznie dostało, przez [[net-web3-api|web3_clientVersion]] i kilka próbnych wywołań, zamiast ufać stronie z listą funkcji dostawcy; zobacz [[endpoint-capabilities|możliwości endpointu]]."
        ]
      }
    ],
    example: {
      title: "Cztery listenery, które zwykle otwiera klient wykonawczy",
      note: "Dla aplikacji są przeznaczone tylko 8545 i 8546; 8551 należy do sparowanego [[consensus-client|klienta konsensusu]], a 30303 do sieci."
    },
    pitfalls: [
      "Wystawianie portu 8551 albo przestrzeni nazw `admin_` i `debug_` do internetu; JWT w Engine API to jedyne, co stoi między wywołującym a fork choice węzła.",
      "Zakładanie, że metoda jest dostępna wszędzie: `trace_block` nie ma w Geth, wyszukiwanie adresów przez `ots_` działa w Erigon, ale w Reth zwraca błąd braku implementacji, a tracery `debug_traceCall` różnią się szczegółowością między klientami.",
      "Traktowanie zsynchronizowanego klienta wykonawczego jak działającego węzła; bez klienta konsensusu jego head przestaje się przesuwać, a [[eth-syncing|eth_syncing]] może nadal zwracać `false`.",
      "Podłączanie dwóch klientów konsensusu do jednego klienta wykonawczego; każdy wysyła własny [[fork-choice|fork choice]] i będą się przeciągać o head."
    ]
  },
  geth: {
    title: "Geth",
    aliases: ["Geth", "go-ethereum", "geth attach", "--http.api", "history.transactions", "PBSS", "path-based state scheme"],
    summary: "Geth (go-ethereum) to [[execution-client|klient wykonawczy]] napisany w Go i utrzymywany przez zespół go-ethereum. Przechowuje stan w układzie trie opartym na ścieżkach (path-based), synchronizuje się przez [[snap-sync|snap sync]] i udostępnia [[json-rpc|JSON-RPC]] tylko dla [[namespaces|przestrzeni nazw]] wymienionych w `--http.api`.",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Geth to najstarszy stale utrzymywany [[execution-client|klient wykonawczy]] i przez większość historii Ethereum faktyczna implementacja referencyjna: nowe [[eip|EIP-y]] i tracery [[debug-api|debug_]] często pojawiały się najpierw w nim, a potem przejmowali je inni klienci. Repozytorium zawiera też narzędzie `evm` do wykonywania kodu i `abigen`; [[remote-signer|zewnętrzny signer]] `clef` został z niego usunięty w czerwcu 2026 i jest rozwijany dalej jako osobny projekt ethereum/clef, a Geth nadal łączy się z zewnętrznym signerem przez `--signer`. Polecenie `geth attach` otwiera konsolę JavaScript przez [[ipc-transport|IPC]] do pliku `geth.ipc` w katalogu danych; to zwykły sposób na wywoływanie metod [[admin-api|admin_]] bez otwierania portu sieciowego.",
          "Domyślnie uruchomiony `geth` używa `--syncmode snap` i `--gcmode full`: pobiera od peerów niedawny snapshot stanu, naprawia trie (healing), a potem podąża za headem i trzyma tylko niedawny stan. Oczekuje [[consensus-client|klienta konsensusu]] na [[engine-api|Engine API]]; bez niego po starcie stoi bezczynnie."
        ]
      },
      {
        heading: "Przechowywanie danych i retencja",
        paragraphs: [
          "Od v1.14 Geth domyślnie używa dla nowych baz schematu stanu opartego na ścieżkach (`--state.scheme path`), który trzyma jedną kopię każdego trie node'a pod kluczem jego pozycji, a nie po jednej kopii na każdą wersję; zobacz [[client-storage|silniki przechowywania danych]]. Dzięki temu zużycie dysku jest przewidywalne, ale historyczny [[state|stan]] przetrwa tylko w oknie mniej więcej 128 ostatnich bloków. Zapytanie o saldo albo [[eth-call|eth_call]] poniżej tego okna na węźle Geth po [[pruned-node|pruningu]] kończy się błędem `missing trie node`. Serwowanie starego stanu wymaga `--gcmode archive`. Przy schemacie path od v1.16 to ta sama baza plus indeks nad historią stanu, a dopóki indeks nie zostanie zbudowany, węzeł nie serwuje niczego historycznego. `--history.state` ustala, ile bloków tej historii jest przechowywanych, domyślnie 90 000, czyli tylko [[partial-archive|niedawne okno]]; archiwum całego łańcucha, około 2 TB na mainnecie, wymaga `--history.state 0` i pełnej synchronizacji od genesis. Dawne archiwum oparte na hashach (hash-based) przechowuje za to każdą wersję trie i przekracza 20 TB.",
          "Historia jest przechowywana osobno od stanu: stare nagłówki, body bloków i receipty trafiają do plików freezer typu append-only, które `--datadir.ancient` może umieścić na wolniejszym dysku. Indeks wyszukiwania transakcji ogranicza `--history.transactions`, domyślnie do około 2 350 000 bloków, czyli mniej więcej roku. Dla starszych transakcji [[eth-get-transaction-receipt|eth_getTransactionReceipt]] i [[eth-get-transaction-by-hash|eth_getTransactionByHash]] zwracają `null`, mimo że Geth wciąż ma ich bloki; `--history.transactions 0` zachowuje pełny indeks kosztem miejsca na dysku."
        ]
      },
      {
        heading: "Włączanie RPC",
        paragraphs: [
          "Wszystkie listenery są domyślnie wyłączone. `--http` uruchamia serwer HTTP na `--http.addr 127.0.0.1` i `--http.port 8545`; `--ws` uruchamia serwer [[websocket-transport|WebSocket]] na porcie 8546. `--http.api` i `--ws.api` to allowlisty przestrzeni nazw (`eth,net,web3,debug,txpool,admin`), a metoda z niewymienionej przestrzeni nazw kończy się błędem `the method X does not exist/is not available`, choć program ją implementuje. `--http.vhosts` sprawdza nagłówek `Host`, więc węzeł za [[reverse-proxy|reverse proxy]] pod nową nazwą hosta odpowiada 403, dopóki ta nazwa nie zostanie dodana. [[engine-api|Engine API]] ma własne flagi: `--authrpc.port 8551` i `--authrpc.jwtsecret`.",
          "Geth serwuje `eth_`, `net_`, `web3_`, `txpool_`, `admin_` i `debug_`. W ogóle nie implementuje przestrzeni nazw [[trace-api|trace_]] w stylu Parity, więc kto potrzebuje trace'ów wywołań, używa [[debug-api|debug_traceTransaction]] albo `debug_traceCall` z `callTracer` i `prestateTracer`. Dwa limity dają się we znaki wywołaniom symulacyjnym: `--rpc.gascap` ogranicza gas, który może zużyć [[eth-call|eth_call]] albo [[eth-estimate-gas|eth_estimateGas]] (domyślnie 50 000 000), a `--rpc.txfeecap` odrzuca lokalne transakcje, których maksymalna opłata przekracza 1 ether."
        ]
      }
    ],
    example: {
      title: "Uruchomienie Getha z HTTP, WebSocket i Engine API",
      note: "`debug` celowo nie ma tu w `--http.api`; dodaje się go tylko na endpoincie, do którego nie da się dotrzeć z internetu."
    },
    pitfalls: [
      "Dodawanie `debug` albo `admin` do `--http.api` na publicznie dostępnym porcie; sam `debug_traceBlockByNumber` wystarczy, żeby wyczerpać CPU węzła.",
      "Wniosek, że węzeł stracił stare transakcje, gdy `eth_getTransactionReceipt` zwraca `null`; domyślny indeks `--history.transactions` po prostu kończy się mniej więcej rok wstecz.",
      "Oczekiwanie, że `trace_filter` zadziała po dodaniu go do `--http.api`; Geth nie ma implementacji `trace_`, więc tej przestrzeni nazw nie da się włączyć.",
      "Postawienie Getha za proxy bez ustawienia `--http.vhosts`, co daje gołe 403 bez body z błędem JSON-RPC."
    ]
  },
  nethermind: {
    title: "Nethermind",
    aliases: ["Nethermind", "JsonRpc.EnabledModules", "klient .NET", "dotnet client", "klient C#", "C# client", "full pruning", "Paprika", "FlatDb"],
    summary: "Nethermind to [[execution-client|klient wykonawczy]] w C# na platformie .NET, tworzony przez firmę Nethermind. Obsługuje tracing [[debug-api|debug_]] w stylu Getha i [[trace-api|trace_]] w stylu Parity, a [[json-rpc|JSON-RPC]] konfiguruje się w nim kluczami `--JsonRpc.*`, takimi jak `--JsonRpc.EnabledModules`.",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Nethermind działa na środowisku uruchomieniowym .NET i składa się z rdzenia oraz [[client-extensions|pluginów]], dzięki czemu jeden program obsługuje kilka sieci: mainnet Ethereum, [[testnets|Sepolię i Hoodi]], [[gnosis-chain|Gnosis Chain]] oraz łańcuchy [[optimistic-rollup|OP Stack]], gdzie pełni rolę [[execution-client|klienta wykonawczego]] obok `op-node`. Uruchomienie zwykle zaczyna się od nazwanej konfiguracji, `--config mainnet`, która ustawia rozsądne wartości domyślne, a poszczególne flagi mogą je potem nadpisać.",
          "Dane trzyma w RocksDB. Synchronizacja zaczyna się od [[snap-sync|snap sync]] oraz pobierania wstecz nagłówków, body bloków i receiptów, więc świeży węzeł szybko serwuje head i uzupełnia historię za nim. Bariery starej historii (ancient barriers) określają, jak daleko wstecz pobierane są body i receipty: na mainnecie `Sync.AncientBodiesBarrier` i `Sync.AncientReceiptsBarrier` mają domyślnie wartość bloku 24 600 000 dla nowego albo ponownie synchronizowanego węzła 2.0, więc starszych body i [[receipt-retention|receiptów]] nie ma, chyba że obie wartości ustawi się na `0`. Warto to sprawdzić, zanim podłączy się [[indexer|indekser]] do świeżo zsynchronizowanego węzła."
        ]
      },
      {
        heading: "Pruning i stan",
        paragraphs: [
          "Od wersji 2.0 nowa baza używa płaskiego backendu stanu (flat): `FlatDb.Enabled` ma domyślnie wartość `true`, a konta i sloty storage są przechowywane jako płaskie rekordy obok trie node'ów potrzebnych do wyliczenia [[state-root|state root]]. Istniejąca baza patricia, czyli trie half-path z wersji 1.x, w której kluczem węzła jest prefiks jego ścieżki, a nie wyłącznie hash, jest wykrywana przy starcie i zostaje bazą patricia, więc aktualizacja ani nie migruje danych, ani nie wymusza ponownej synchronizacji; `--FlatDb.Enabled=false` synchronizuje świeży węzeł na patricia. Eksperymentalny magazyn Paprika nie wchodzi w skład 2.0. Co te układy oznaczają dla zapytań historycznych: zobacz [[client-storage|silniki przechowywania danych]].",
          "[[archive-node|Archiwum]] na płaskim backendzie to płaska historia (flat history): przy `FlatDb.HistoryEnabled`, które `--config mainnet_archive` ustawia razem z `Pruning.Mode=None`, węzeł podczas synchronizacji zapisuje zmiany kont i storage w każdym sfinalizowanym bloku. Ta historia ma cztery warianty: pełna, od genesis albo od pivotu synchronizacji (`FlatDb.HistoryRetention=None`); kroczące okno (`Rolling` z `FlatDb.HistoryRetentionBlocks`); wszystko od wybranego bloku (`SinceBlock` z `FlatDb.HistoryRetentionSinceBlock`); oraz głęboka historia wybranych kontraktów dodana do okna (`FlatDb.HistorySliceAddresses`); zobacz [[partial-archive|archiwa częściowe]]. Poniżej zachowanej granicy odczyty kończą się [[rpc-errors|błędem]] o przyciętej historii (fail closed), zamiast odpowiadać z bieżącego stanu, a włączenie historii działa tylko do przodu: nic sprzed momentu jej włączenia nie zostaje uzupełnione.",
          "Dwie kolejne opcje opt-in są przeznaczone dla pełnych archiwów. `FlatDb.ArchiveProofBuildEnabled` zapisuje commitmenty dowodów obok historii, a `FlatDb.ArchiveProofServeEnabled` odpowiada na ich podstawie na historyczne [[eth-get-proof|eth_getProof]]; obie są domyślnie wyłączone. `Receipt.DeriveFromState` przestaje zapisywać treść receiptów i przy zapytaniu o receipt wykonuje blok ponownie na stanie rodzica, a wynik serwuje tylko wtedy, gdy odtwarza on `receiptsRoot` z nagłówka.",
          "Pruning w starszym znaczeniu dotyczy backendu patricia. Nethermind rozróżnia tam pruning w pamięci (in-memory), który trzyma niedawne trie node'y w cache i zapisuje tylko to, co przetrwa, oraz full pruning, który kopiuje wszystko, co osiągalne z bieżącego state root, do nowej bazy i porzuca resztę. Full pruning działa, podczas gdy węzeł dalej podąża za łańcuchem, ale wymaga wolnego miejsca na dysku mniej więcej wielkości kopiowanego stanu i trwa godzinami, więc się go planuje, a nie uruchamia pod wpływem impulsu. Full pruning przez kopiowanie nie jest dostępny na płaskim backendzie w 2.0: płaski węzeł bez ostrzeżenia przyjmuje `Pruning.Mode=Hybrid` i wyzwalacze full pruningu, ale nigdy niczego nie przycina, a `admin_prune` zgłasza `disabled` (znany problem 2.0, #13600)."
        ]
      },
      {
        heading: "Konfiguracja RPC",
        paragraphs: [
          "Klucze konfiguracji są pogrupowane według modułów i można je podać jako flagi wiersza poleceń (`--JsonRpc.Enabled true`), jako wpisy w pliku konfiguracyjnym JSON albo jako zmienne środowiskowe w postaci `NETHERMIND_JSONRPCCONFIG_ENABLED`. Listener ustawiają `--JsonRpc.Host` i `--JsonRpc.Port` (8545); ruch [[websocket-transport|WebSocket]] jest obsługiwany na `--JsonRpc.WebSocketsPort`, który domyślnie jest tym samym portem, więc zwykłym endpointem subskrypcji jest `ws://127.0.0.1:8545`. [[engine-api|Engine API]] nasłuchuje osobno na `--JsonRpc.EnginePort` (8551) z `--JsonRpc.JwtSecretFile`.",
          "`--JsonRpc.EnabledModules` to allowlista: `Eth`, `Net`, `Web3`, `Subscribe`, `TxPool`, `Trace`, `Debug`, `Admin`, `Parity` i inne. Moduł, którego nie ma na liście, zwraca [[rpc-errors|błąd]] method not found, choć klient go implementuje, i to najczęstsze zaskoczenie dla osób przechodzących z innego klienta. Nethermind obsługuje oba style tracingu, czyli `trace_call`, `trace_transaction`, `trace_filter` i `trace_replayBlockTransactions`, a także `debug_traceTransaction`, i implementuje [[eth-simulate|eth_simulateV1]], więc ci, którzy dużo symulują, często celowo wybierają właśnie jego."
        ]
      }
    ],
    example: {
      title: "Uruchomienie Nethermind z jawną listą modułów",
      note: "`Subscribe` musi być na liście, żeby [[eth-subscribe|eth_subscribe]] działało przez WebSocket, a `Trace`, żeby działała przestrzeń nazw `trace_`; oba moduły są niezależne od `Eth`."
    },
    pitfalls: [
      "Wniosek, że Nethermind nie ma tracingu, gdy `trace_filter` kończy się błędem; ta przestrzeń nazw jest zaimplementowana, ale musi być wymieniona w `--JsonRpc.EnabledModules`.",
      "Otwieranie WebSocketu na porcie 8546 z przyzwyczajenia; Nethermind serwuje WebSocket na porcie JSON-RPC, chyba że zmieni się `--JsonRpc.WebSocketsPort`.",
      "Uruchamianie full pruningu na węźle patricia z prawie pełnym dyskiem; potrzebuje zapasu miejsca na kopię stanu, a bez niego przerwie pracę.",
      "Podanie `--FlatDb.Enabled=false` dla istniejącego katalogu danych z płaską bazą, co zamiast odmowy usuwa stan i synchronizuje węzeł od nowa.",
      "Łączenie pliku konfiguracyjnego JSON z flagami i zapominanie, że wygrywa flaga, przez co zmiana w pliku wydaje się nie działać."
    ]
  },
  erigon: {
    title: "Erigon",
    aliases: ["Erigon", "turbo-geth", "rpcdaemon", "ots_", "staged sync", "synchronizacja etapowa", "Caplin"],
    summary: "Erigon to [[execution-client|klient wykonawczy]] w Go zbudowany wokół staged sync i płaskiej bazy MDBX. Swoje [[json-rpc|JSON-RPC]] uruchamia w osobnym procesie `rpcdaemon` i dodaje [[namespaces|przestrzenie nazw]] `erigon_` oraz `ots_` z Otterscana.",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Erigon zaczynał jako turbo-geth, fork [[geth|Getha]], który miał sprawić, że [[archive-node|węzeł archiwalny]] stanie się przystępny cenowo, a dziś to niezależna baza kodu. Jego kluczowa decyzja dotyczy przechowywania danych: zamiast zapisywać trie z węzłami adresowanymi hashami, trzyma konta i sloty storage jako płaskie rekordy klucz-wartość w MDBX i wylicza trie node'y dopiero wtedy, gdy potrzebny jest [[state-root|state root]]; zobacz [[client-storage|silniki przechowywania danych]]. Historia jest trzymana jako zbiory zmian (change sets), więc przechowywanie każdej historycznej wartości kosztuje dużo mniej niż trzymanie pełnego trie dla każdego bloku.",
          "Synchronizacja przebiega etapami (staged sync), a nie blok po bloku, a Erigon 3 zmienił to, co robią poszczególne etapy. Świeży węzeł nie wykonuje łańcucha od genesis: pierwszy etap pobiera większość stanu i historii, razem z indeksami logów i historii, jako niezmienne pliki snapshotów udostępniane przez BitTorrent, a kolejne etapy pobierają nagłówki i body bloków i wykonują tylko bloki nowsze niż te pliki. Etap wykonania zajmuje się teraz także hashowaniem, trie i indeksami, które w Erigonie 2 były osobnymi etapami. Na świeżej maszynie to dużo szybsze, ale odpowiedzi węzła są niekompletne, dopóki cały pipeline nie dojdzie do head. Erigon 3 zawiera też Caplin, własnego [[consensus-client|klienta konsensusu]], w tym samym pliku wykonywalnym; nowsze wersje uruchamiają go domyślnie, a `--externalcl` przełącza na samodzielnego klienta konsensusu połączonego przez [[engine-api|Engine API]]."
        ]
      },
      {
        heading: "Osobny daemon RPC",
        paragraphs: [
          "RPC Erigona to oddzielny komponent, `rpcdaemon`. Może działać wewnątrz procesu węzła albo jako osobny proces, który otwiera ten sam katalog danych w trybie tylko do odczytu albo łączy się przez prywatny endpoint gRPC (`--private.api.addr`, domyślnie 127.0.0.1:9090). Ten podział to praktyczny powód, żeby wystawiać Erigona za publicznym endpointem: warstwę RPC można restartować, skalować, a nawet pozwolić jej paść bez ruszania synchronizacji, a przed jednym węzłem można postawić kilka procesów RPC za [[load-balancer|load balancerem]].",
          "Retencję wybiera się przez `--prune.mode`, którego presety sięgają od minimalnego węzła po pełne archiwum. Flagi kształtujące listener HTTP odpowiadają flagom Getha: `--http`, `--http.addr`, `--http.port` (8545) i `--http.api` jako allowlista przestrzeni nazw."
        ]
      },
      {
        heading: "Co widać od strony wywołującego",
        paragraphs: [
          "Erigon serwuje standardowy zestaw `eth_` oraz przestrzeń nazw [[trace-api|trace_]] w stylu Parity i tracery [[debug-api|debug_]] w stylu Getha. Do tego udostępnia pomocnicze metody `erigon_`, takie jak `erigon_getHeaderByNumber` i `erigon_getBlockByTimestamp`, oraz API `ots_` używane przez [[block-explorer|eksplorator]] [[otterscan|Otterscan]]: `ots_searchTransactionsBefore` i `ots_searchTransactionsAfter` przeglądają historię adresu strona po stronie, `ots_getTransactionBySenderAndNonce` znajduje transakcję bez hasha, a `ots_getContractCreator` zwraca, kto wdrożył kontrakt. [[reth|Reth]] implementuje większość tej przestrzeni nazw, ale na oba wyszukiwania po adresie odpowiada błędem `-32603` unimplemented, a Anvil serwuje całość w lokalnych devnetach, więc kod, który zależy od wyszukiwania po adresie w `ots_`, jest w praktyce przywiązany do Erigona.",
          "Indeksy logów i historii przychodzą razem z plikami snapshotów, więc [[eth-get-logs|eth_getLogs]] na szerokich zakresach jest tu zwykle tani, choć od v3.4.0 `--rpc.blockrange.limit` domyślnie ogranicza zakres tej metody, a także `trace_filter`, do 1000 bloków, a `0` znosi ten limit. Dokumentacja Erigona ostrzega też, że w domyślnym trybie `full` zapytanie filtrowane po adresie albo topicu może pominąć dopasowania starsze niż okno historii stanu wynoszące 262 144 bloki, czyli około 36 dni. Historyczne [[eth-call|eth_call]] działa na dowolnym bloku tylko wtedy, gdy historia stanu obejmuje cały łańcuch, tak jak przy `--prune.mode=archive`; tryb `full` trzyma stan przez to samo okno, chyba że `--prune.distance` je poszerzy. Historyczne [[eth-get-proof|eth_getProof]] to przypadek odwrotny: domyślnie trie node'y potrzebne do dowodu nie są przechowywane, więc dowody dla starych bloków zawodzą nawet na węźle, który ma każdą historyczną wartość, chyba że działa z `--prune.include-commitment-history`."
        ]
      }
    ],
    example: {
      title: "Erigon z wbudowanym listenerem RPC i osobnym rpcdaemon",
      note: "Dopiero `ots` w `--http.api` udostępnia metody wyszukiwania Otterscana; bez wpisu na liście są wyłączone."
    },
    pitfalls: [
      "Pisanie [[indexer|indeksera]] pod metody `ots_` albo `erigon_`, a potem odkrycie, że zapasowy provider działa na innym kliencie.",
      "Oczekiwanie, że częściowo zsynchronizowany Erigon odpowie na zapytania; dopóki pobieranie snapshotów i pozostałe etapy nie dojdą do head, odpowiedzi RPC są niekompletne.",
      "Zakładanie, że węzeł archiwalny Erigona wygeneruje `eth_getProof` dla dowolnego historycznego bloku; bez `--prune.include-commitment-history` płaskie przechowywanie trzyma wartości, a nie trie node'y potrzebne do dowodu.",
      "Zostawienie węzła na domyślnym `--prune.mode=full`, a potem pytanie o stan albo filtrowane logi starsze niż jego okno 262 144 bloków.",
      "Uruchamianie `rpcdaemon` na katalogu danych, który węzeł ma otwarty w kolidującym trybie, zamiast łączenia się przez prywatny adres gRPC."
    ]
  },
  reth: {
    title: "Reth",
    aliases: ["Paradigm", "rust ethereum", "ExEx", "execution extensions", "static files", "MDBX", "klient wykonawczy w Ruście"],
    summary: "Reth to [[execution-client|klient wykonawczy]] w Ruście zapoczątkowany przez Paradigm. Jest zbudowany z crate'ów wielokrotnego użytku, a dane trzyma w MDBX i w niezmiennych static files. Domyślnie działa jako węzeł archiwalny, a przestrzenie nazw [[json-rpc|JSON-RPC]] wybiera się flagą `--http.api`.",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Reth to [[execution-client|klient wykonawczy]] napisany od zera w Ruście i wydawany jako zestaw crate'ów, a nie jeden program. Te same komponenty, które uruchamiają `reth node` na mainnecie, służą do budowy `op-reth` dla łańcuchów [[optimistic-rollup|OP Stack]] i własnych węzłów dla [[permissioned-network|sieci prywatnych]]. Reth trzyma się tej samej [[execution-apis|specyfikacji Execution APIs]] co każdy inny klient i łączy się z [[consensus-client|klientem konsensusu]] przez [[engine-api|Engine API]] na porcie 8551.",
          "Dane na dysku dzielą się na dwie części. MDBX trzyma dane zmienne: stan, change sety kont i storage oraz indeksy. Nagłówki, body bloków i receipty trafiają do static files, czyli plików tylko do dopisywania (append-only), których nigdy się nie przepisuje i które dobrze się kompresują; zobacz [[client-storage|silniki bazy danych]]. Synchronizacja to etapowy pipeline w stylu [[erigon|Erigona]]: nagłówki, body, odzyskiwanie nadawców (sender recovery), wykonanie, a potem etapy hashowania i indeksowania."
        ]
      },
      {
        heading: "Domyślnie węzeł archiwalny",
        paragraphs: [
          "Reth zachowuje cały historyczny [[state|stan]], chyba że skonfiguruje się go inaczej, więc zwykłe `reth node` to [[archive-node|węzeł archiwalny]]. Dopiero flaga `--full` zamienia go w [[pruned-node|pruned node]], który trzyma tylko niedawny stan i historię. To odwrotność ustawień domyślnych większości klientów. Zaskakuje to operatorów, którzy dobierają dysk pod [[full-node|pełny węzeł]], a dostają przyrost danych jak w archiwum, albo dodają `--full` później i odkrywają, że historyczne [[eth-call|eth_call]] przestało działać.",
          "Drugą charakterystyczną cechą są [[client-extensions|Execution Extensions]], w skrócie ExEx: zadanie w Ruście działa wewnątrz procesu węzła i dostaje strumień powiadomień o zatwierdzonych blokach łańcucha, w tym o odcinkach wycofanych podczas [[reorg|reorga]]. [[indexer|Indekser]] zbudowany w ten sposób czyta zmiany stanu bezpośrednio, zamiast odpytywać [[eth-get-logs|eth_getLogs]] przez [[http-transport|HTTP]]. Płaci za to związaniem z cyklem życia węzła i z samym Rethem."
        ]
      },
      {
        heading: "Obsługa RPC",
        paragraphs: [
          "Flagi są bardzo podobne do flag Getha. `--http` otwiera listener HTTP na `--http.addr` i `--http.port` (8545), a `--http.api` to allowlista przestrzeni nazw, zwykle `eth,net,web3,debug,trace,txpool`. `--ws`, `--ws.port` (8546) i `--ws.api` robią to samo dla [[websocket-transport|WebSocketu]]. Ruch Engine API idzie przez `--authrpc.addr`, `--authrpc.port` i `--authrpc.jwtsecret`, a `--metrics 127.0.0.1:9001` wystawia liczniki Prometheusa do [[observability|monitoringu]].",
          "Reth obsługuje oba style tracingu: tracery [[debug-api|debug_]] zgodne z Gethem i przestrzeń nazw [[trace-api|trace_]] w stylu Parity. Razem z archiwum jako ustawieniem domyślnym sprawia to, że Reth często stoi za endpointami do tracingu. Limity symulowanych wywołań nie są wpisane na sztywno: ustawia się je flagą `--rpc.gascap` oraz własnymi flagami serwera RPC dla timeoutu i rozmiaru body."
        ]
      }
    ],
    example: {
      title: "Węzeł Reth z pruningiem, HTTP, WebSocketem i Engine API",
      note: "Bez `--full` to samo polecenie uruchamia węzeł archiwalny, bo przechowywanie całej historii to w Reth ustawienie domyślne."
    },
    pitfalls: [
      "Dobranie dysku pod pełny węzeł i pominięcie `--full`; węzeł będzie dalej rósł jako archiwum.",
      "Dodanie `--full` do istniejącego węzła archiwalnego w przekonaniu, że stare dane zostaną; historyczny stan spoza [[partial-archive|zachowywanego okna]] przestaje być dostępny dla zapytań.",
      "Zbudowanie ExEx i traktowanie go jak zamiennika zewnętrznego [[indexer|indeksera]]; pada razem z węzłem, a po restarcie musi odtwarzać powiadomienia od nowa.",
      "Zakładanie, że `trace_` i `debug_` są dostępne domyślnie; każdą z tych przestrzeni nazw nadal trzeba wpisać w `--http.api`."
    ]
  },
  besu: {
    title: "Besu",
    aliases: ["Besu", "Hyperledger Besu", "Bonsai", "host-allowlist", "rpc-http-api", "GraphQL"],
    summary: "Besu to [[execution-client|klient wykonawczy]] w Javie rozwijany w ramach Linux Foundation Decentralized Trust, a jego głównym kontrybutorem jest Consensys. Używa płaskiego przechowywania Bonsai, allowlisty `--rpc-http-api` z nazwami pisanymi wielkimi literami i opcjonalnego endpointu GraphQL.",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Besu działa na JVM i z jednej bazy kodu obsługuje dwie grupy odbiorców: mainnet Ethereum jako publiczny [[execution-client|klient wykonawczy]] oraz [[permissioned-network|sieci permissioned]] (z kontrolą dostępu), w których dostarcza algorytmy konsensusu QBFT i IBFT 2.0, nieużywane w publicznym Ethereum, a także lokalne uprawnienia kont i węzłów (permissioning). Zalecanym wyborem jest QBFT, a IBFT 2.0 zostaje dla istniejących sieci. Clique usunięto w 26.4.0, z wyjątkiem synchronizacji łańcuchów takich jak Linea, które zaczynały na Clique i przeszły na proof of stake; prywatność Tessera i permissioning on-chain zniknęły w 25.6.0, a grupy API `PRIV` i `EEA` w 25.7.0. Ta druga rola tłumaczy opcje konfiguracyjne, których operator na mainnecie nigdy nie dotyka.",
          "Stan jest domyślnie przechowywany w formacie Bonsai (`--data-storage-format=BONSAI`): konta i sloty storage są trzymane płasko, a logi trie (trie logs) zapisują różnicę, jaką wprowadził każdy blok, żeby węzeł mógł się cofnąć. Starszy format Forest trzyma klasyczne trie z węzłami adresowanymi hashami. Bonsai trzyma tylko [[partial-archive|ograniczone okno historycznego stanu]], ustawiane przez `--bonsai-historical-block-limit`, więc wdrożenie [[archive-node|archiwalne]] to świadoma konfiguracja, a nie ustawienie domyślne; zobacz [[client-storage|silniki przechowywania danych]]."
        ]
      },
      {
        heading: "Włączanie RPC",
        paragraphs: [
          "Flagi Besu oddzielają nazwę od wartości znakiem `=` i zapisują nazwy API wielkimi literami, na czym potyka się każdy, kto kopiuje linię poleceń Getha. `--rpc-http-enabled=true` otwiera listener HTTP na `--rpc-http-host` i `--rpc-http-port` (8545); `--rpc-http-api=ETH,NET,WEB3,TRACE,TXPOOL` to allowlista. [[websocket-transport|WebSocket]] ma własną parę, `--rpc-ws-enabled=true` i `--rpc-ws-port` (8546). [[engine-api|Engine API]] konfiguruje się przez `--engine-rpc-port=8551` i `--engine-jwt-secret`.",
          "Charakterystycznym zabezpieczeniem jest `--host-allowlist`. Besu sprawdza nagłówek `Host` każdego przychodzącego żądania i odpowiada 403 ze zwykłym tekstem `Host not authorized` w body, gdy nazwy nie ma na liście, zanim nastąpi jakiekolwiek parsowanie JSON-RPC. Węzeł osiągany przez [[reverse-proxy|reverse proxy]] albo przez nazwę DNS kontenera odrzuca więc całkowicie poprawne wywołania, dopóki ta nazwa hosta (albo `*`, w sieci prywatnej) nie zostanie dodana, a Engine API ma własną `--engine-host-allowlist`."
        ]
      },
      {
        heading: "Co widać od strony wywołującego",
        paragraphs: [
          "Besu serwuje `eth_`, `net_`, `web3_`, `txpool_`, `admin_`, `debug_` oraz przestrzeń nazw [[trace-api|trace_]] w stylu Parity, więc `trace_transaction` i `trace_replayBlockTransactions` są dostępne tam, gdzie dane są zachowane. To także klient najbardziej znany z alternatywnego interfejsu zapytań: `--graphql-http-enabled=true` wystawia endpoint GraphQL na porcie 8547, gdzie jedno zapytanie może pobrać blok razem z transakcjami i [[event-log|logami]]. To alternatywa dla [[batch-request|batcha JSON-RPC]], a nie zamiennik [[json-rpc|JSON-RPC]].",
          "[[sync-modes|Tryby synchronizacji]] wybiera się przez `--sync-mode`, w tym `SNAP` dla [[snap-sync|snap sync]], `CHECKPOINT` i `FULL`. Metryki do [[observability|monitoringu]] włącza `--metrics-enabled=true` na porcie 9545."
        ]
      }
    ],
    example: {
      title: "Uruchomienie Besu z HTTP RPC i Engine API",
      note: "Nazwy API są tu zapisane wielkimi literami; `--rpc-http-api=eth` zostaje odrzucone przy starcie, a nie po cichu zignorowane."
    },
    pitfalls: [
      "Kopiowanie listy API w stylu Getha do `--rpc-http-api` bez porównania jej z nazwami modułów Besu, które jego dokumentacja zapisuje wielkimi literami: `ETH,NET,WEB3`.",
      "Debugowanie 403 jako problemu z uwierzytelnianiem, gdy to `--host-allowlist` odrzuca nagłówek `Host` wysłany przez proxy.",
      "Oczekiwanie, że historyczne [[eth-call|eth_call]] zadziała na domyślnym węźle Bonsai; przechowywane jest tylko ograniczone okno historycznego stanu.",
      "Zapomnienie o `--engine-host-allowlist` po przeniesieniu [[consensus-client|klienta konsensusu]] do innego kontenera, przez co Engine API jest nieosiągalne, choć HTTP RPC dalej działa."
    ]
  },
  "consensus-client": {
    title: "Klient konsensusu",
    aliases: [
      "CL client",
      "klient CL",
      "beacon chain client",
      "klient beacon chain",
      "eth2 client",
      "klient warstwy konsensusu",
      "lighthouse prysm teku nimbus lodestar grandine"
    ],
    summary: "Klient konsensusu to oprogramowanie implementujące Beacon Chain, czyli [[proof-of-stake|proof of stake]] w Ethereum: rozgłasza i waliduje [[beacon-block|bloki beacon]], wykonuje [[fork-choice|fork choice]], śledzi [[finality|finalność]], steruje [[execution-client|klientem wykonawczym]] przez [[engine-api|Engine API]] i udostępnia [[beacon-api|Beacon API]].",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Klient konsensusu odpowiada za wszystko, co doszło przy [[the-merge|Merge]]: [[validator|walidatorów]] i ich salda, [[slot-epoch|12-sekundowe sloty i 32-slotowe epoki]], [[attestation|atestacje]] i ich agregację, [[sync-committee|sync committees]] oraz checkpointy justified i finalized. Jego struktury danych są kodowane w [[ssz|SSZ]], a nie w [[rlp|RLP]], a jego stos peer-to-peer to libp2p na porcie 9000 zamiast [[devp2p|devp2p]]; zobacz [[libp2p-gossip|sieć warstwy konsensusu]].",
          "Za mainnetem podąża sześć implementacji: [[lighthouse|Lighthouse]] w Ruście od Sigma Prime, [[prysm|Prysm]] w Go od Offchain Labs, [[teku|Teku]] w Javie od Consensys, [[nimbus|Nimbus]] w Nim od Status, [[lodestar|Lodestar]] w TypeScripcie od ChainSafe i [[grandine|Grandine]] w Ruście. Wszystkie implementują te same specyfikacje konsensusu i to samo REST API, więc z punktu widzenia operatora są wymienne, i o to właśnie chodzi w [[client-diversity|różnorodności klientów]].",
          "Większość z nich składa się z dwóch programów: [[beacon-node|beacon node]], który podąża za łańcuchem, i [[validator-client|klienta walidatora]], który trzyma klucze do podpisywania. Węzeł, który tylko czyta łańcuch, uruchamia sam beacon node."
        ]
      },
      {
        heading: "Jak steruje klientem wykonawczym",
        paragraphs: [
          "Każdy klient konsensusu ma skonfigurowany endpoint wykonawczy i wspólny sekret, zwykle `http://127.0.0.1:8551` i plik z 32-bajtowym sekretem JWT zapisanym w hex; zobacz [[authentication|uwierzytelnianie RPC]]. Gdy przychodzi nowy blok beacon, klient konsensusu przekazuje [[execution-payload|execution payload]] klientowi wykonawczemu przez `engine_newPayload` i czeka na `VALID` albo `INVALID`. Po wykonaniu fork choice wywołuje `engine_forkchoiceUpdated` z `headBlockHash`, `safeBlockHash` i `finalizedBlockHash`, i dokładnie stąd biorą się [[block-tag|tagi bloków]] `safe` i `finalized`.",
          "Dopóki klient wykonawczy się synchronizuje, klient konsensusu może importować bloki optymistycznie i oznaczać swój head jako niezweryfikowany. Beacon API zgłasza to jako `is_optimistic: true` w `/eth/v1/node/syncing` i właśnie na to warto ustawić alert: łańcuch wygląda na żywy, ale nic za nim nie zostało jeszcze wykonane."
        ]
      },
      {
        heading: "Co udostępnia, a czego nie",
        paragraphs: [
          "Klient konsensusu udostępnia [[beacon-api|Beacon API]], interfejs REST ze ścieżkami takimi jak `/eth/v1/beacon/headers`, `/eth/v2/beacon/blocks/{block_id}` i `/eth/v1/events` dla server-sent events; zobacz [[beacon-endpoints|endpointy Beacon API]]. Trzyma też dane, których [[execution-layer|warstwa wykonawcza]] nigdy nie widzi, w tym [[blob|sidecary blobów]], które klienci konsensusu przechowują przez 4096 epok, czyli około 18 dni, zanim je usuną.",
          "Nie uruchamia [[evm|EVM]] i nie obsługuje metod `eth_`. Wysłanie [[eth-get-balance|eth_getBalance]] na port HTTP beacon node kończy się kodem 404 z routera REST, a nie [[rpc-errors|błędem JSON-RPC]], co często wprowadza w błąd, gdy pomyli się dwa porty węzła. Nowe węzły zwykle startują przez [[checkpoint-sync|checkpoint sync]] z niedawnego sfinalizowanego stanu, zamiast odtwarzać łańcuch od [[genesis|genesis]], co przy okazji spełnia wymóg [[weak-subjectivity|weak subjectivity]]."
        ]
      }
    ],
    example: {
      title: "Domyślne porty HTTP Beacon API różnią się między klientami",
      note: "Health checki i monitoring trzeba konfigurować osobno dla każdego klienta; nie ma jednego domyślnego portu Beacon API, tak jak 8545 dla [[json-rpc|JSON-RPC warstwy wykonawczej]]."
    },
    pitfalls: [
      "Ustawienie adresu RPC aplikacji na port HTTP beacon node; Beacon API to REST i nic nie wie o metodach `eth_`.",
      "Zakładanie, że każdy klient konsensusu odpowiada na porcie 5052; Prysm, Teku i Lodestar mają inne domyślne porty, a niektórzy klienci trzymają API wyłączone, dopóki nie włączy go flaga.",
      "Uznawanie `is_syncing: false` za oznakę zdrowego węzła bez sprawdzenia `is_optimistic` i `el_offline` w tej samej odpowiedzi.",
      "Dopuszczenie do rozjechania się plików z sekretem JWT obu klientów; Engine API odrzuca wtedy każde wywołanie i węzeł przestaje podążać za łańcuchem, choć oba procesy wyglądają na żywe."
    ]
  },
  lighthouse: {
    title: "Lighthouse",
    aliases: ["lighthouse bn", "lighthouse vc", "Sigma Prime", "--execution-jwt", "doppelganger", "klient konsensusu w Ruście"],
    summary: "Lighthouse to [[consensus-client|klient konsensusu]] w Ruście od Sigma Prime. Jedna binarka ma podkomendę `bn` dla [[beacon-node|beacon node'a]] i podkomendę `vc` dla [[validator-client|klienta walidatora]], a [[beacon-api|Beacon API]] udostępnia na porcie 5052, jeśli poda się `--http`.",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Lighthouse to jedna binarka w Ruście z podkomendami: `lighthouse bn` uruchamia beacon node, `lighthouse vc` klienta walidatora, a `lighthouse account` zarządza kluczami walidatorów. Stany beacon są trzymane w gorącej bazie (hot) dla niedawnych slotów i w zimnej bazie (cold), czyli freezerze, dla starszych. Historyczne stany nie są zapisywane w całości, tylko odtwarzane przez ponowne przetworzenie bloków od okresowych snapshotów; `--reconstruct-historic-states` odbudowuje je dla archiwalnego beacon node'a.",
          "W typowym uruchomieniu podaje się `--network mainnet`, `--datadir`, `--execution-endpoint http://127.0.0.1:8551`, `--execution-jwt` wskazujące plik ze wspólnym sekretem oraz `--checkpoint-sync-url`, żeby węzeł wystartował od niedawnego sfinalizowanego stanu, a nie od bloku [[genesis|genesis]]; zobacz [[checkpoint-sync|checkpoint sync]]."
        ]
      },
      {
        heading: "Co ważne przy pracy z RPC",
        paragraphs: [
          "[[beacon-api|Beacon API]] jest wyłączone, dopóki nie poda się `--http`. Wtedy nasłuchuje na 127.0.0.1:5052; adres i port zmienia się flagami `--http-address` i `--http-port`, a wywołania z przeglądarki wymagają `--http-allow-origin`. Metryki Prometheusa do [[observability|monitoringu]] daje `--metrics` na porcie 5054. Klient walidatora łączy się z REST API beacon node'a przez `--beacon-nodes`, które przyjmuje kilka URL-i, więc może bez przestoju przejść na inny beacon node; zobacz [[failover|failover]].",
          "Po stronie walidatora `--suggested-fee-recipient` ustawia [[address|adres]], który trafia do `payloadAttributes`, gdy ten węzeł proponuje blok. `--builder-proposals` włącza budowanie bloków przez [[mev-boost|MEV-Boost]], a `--enable-doppelganger-protection` sprawia, że walidator czeka parę epok, zanim zacznie podpisywać. W tym czasie może wykryć swój duplikat działający gdzie indziej w sieci i uniknąć [[slashing|slashingu]]."
        ]
      }
    ],
    example: {
      title: "Beacon node Lighthouse z checkpoint sync i włączonym API",
      note: "Bez `--http` węzeł normalnie się synchronizuje i atestuje, ale na porcie 5052 nie odpowiada na nic, co dla health checka wygląda jak martwy proces."
    },
    pitfalls: [
      "Oczekiwanie, że Beacon API będzie dostępne bez `--http`; Lighthouse domyślnie trzyma je zamknięte.",
      "Podanie w `--execution-endpoint` portu 8545 [[execution-client|klienta wykonawczego]] zamiast uwierzytelnianego portu 8551 [[engine-api|Engine API]].",
      "Uruchamianie dwóch klientów walidatora z tymi samymi kluczami w nadziei, że ochrona przed doppelgangerem uratuje sytuację; skraca ona okno ryzyka, ale go nie usuwa.",
      "Ustawienie `--http-address 0.0.0.0` bez firewalla, co wystawia endpointy walidatora obok endpointów tylko do odczytu."
    ]
  },
  prysm: {
    title: "Prysm",
    aliases: ["beacon-chain", "grpc-gateway", "Offchain Labs", "Prysmatic", "port 3500", "port 4000", "klient konsensusu w Go"],
    summary: "Prysm to [[consensus-client|klient konsensusu]] w Go rozwijany przez Offchain Labs. Jest zbudowany wokół API gRPC na porcie 4000, a standardowe [[beacon-api|Beacon API]] udostępnia przez REST gateway na porcie 3500.",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Prysm składa się z dwóch programów, `beacon-chain` i `validator`, a dane łańcucha trzyma we wbudowanej bazie klucz-wartość. Jego wewnętrzne API od początku było oparte na gRPC, a standardowe REST [[beacon-api|Beacon API]] doszło później. Dlatego Prysm od dawna wystawia dwa porty API, REST i gRPC, tam gdzie inni klienci wystawiają jeden. Wymaga też `--accept-terms-of-use` przy każdym starcie; takiej flagi nie ma żaden inny [[consensus-client|klient konsensusu]].",
          "Ponieważ te dwa porty obsługują różne API, [[validator-client|klient walidatora]] może rozmawiać z [[beacon-node|beacon node'em]] na dwa sposoby. `--beacon-rpc-provider=127.0.0.1:4000` używa endpointu gRPC, a `--beacon-rest-api-provider` zamienia go w zwykłego konsumenta standardowego Beacon API. Tej drugiej opcji potrzeba, gdy walidator Prysma ma się łączyć z beacon node'em innego klienta."
        ]
      },
      {
        heading: "Co ważne przy pracy z RPC",
        paragraphs: [
          "REST API domyślnie nasłuchuje na 3500, a flagi ustawiające jego host i port zmieniały nazwy między wydaniami, więc trzeba je brać z dokumentacji tej wersji, którą się uruchamia. Monitoring i [[health-check|health checki]] napisane pod 5052 po cichu tu zawiodą. Z [[execution-client|klientem wykonawczym]] Prysm łączy się przez `--execution-endpoint http://127.0.0.1:8551` razem z `--jwt-secret`. Po stronie sieci domyślnie używa dla libp2p portów TCP 13000 i UDP 12000 zamiast 9000, co ma znaczenie przy pisaniu reguł firewalla według ogólnego poradnika; zobacz [[libp2p-gossip|sieć warstwy konsensusu]].",
          "[[checkpoint-sync|Checkpoint sync]] wymaga w Prysmie dwóch flag: `--checkpoint-sync-url` dla niedawnego sfinalizowanego stanu i `--genesis-beacon-api-url` dla stanu [[genesis|genesis]]. Zwykle wskazują tego samego dostawcę. Jeśli poda się tylko pierwszą, węzeł nie zdoła dokończyć startu."
        ]
      }
    ],
    example: {
      title: "Beacon node Prysm z checkpoint sync",
      note: "`/eth/v1/node/syncing` jest tu na porcie 3500; port 4000 obsługuje gRPC i nie odpowie na żądanie REST."
    },
    pitfalls: [
      "Pisanie health checka pod port 5052, bo tego portu używają inni klienci; REST API Prysma jest na 3500.",
      "Podanie samego `--checkpoint-sync-url` i zdziwienie, że start stoi w miejscu; Prysm chce też `--genesis-beacon-api-url`.",
      "Otwarcie w firewallu tylko portu 9000; domyślne porty libp2p w Prysmie to TCP 13000 i UDP 12000.",
      "Kierowanie klienta walidatora spoza Prysma na port 4000; gRPC to nie standardowe Beacon API i inni klienci go nie obsługują."
    ]
  },
  teku: {
    title: "Teku",
    aliases: ["Consensys", "--ee-endpoint", "rest-api-port", "5051", "Web3Signer", "klient konsensusu w Javie"],
    summary: "Teku to [[consensus-client|klient konsensusu]] w Javie od Consensys, który może uruchomić [[beacon-node|beacon node]] i jego [[validator-client|klienta walidatora]] w jednym procesie JVM. [[beacon-api|Beacon API]] udostępnia na porcie 5051 po ustawieniu `--rest-api-enabled=true`.",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Teku działa na JVM i powstał z myślą o instytucjonalnym stakingu, co widać po jego ustawieniach domyślnych. Może trzymać klucze walidatorów w tym samym procesie co beacon node, jeśli poda się `--validator-keys=<keystores>:<passwords>`, albo działać jako osobny proces `teku validator-client`. Tryb przechowywania danych ustawia się jawnie flagą `--data-storage-mode` z wartościami `MINIMAL`, `PRUNE` i `ARCHIVE`. Tryb archiwalny zachowuje historyczne stany beacon, dzięki czemu [[beacon-api|Beacon API]] odpowiada na zapytania o stare sloty, a nie tylko o niedawne.",
          "Flagi oddzielają nazwę od wartości znakiem `=`. Z [[execution-client|klientem wykonawczym]] Teku łączy się przez `--ee-endpoint=http://127.0.0.1:8551` i `--ee-jwt-secret-file=`, a [[checkpoint-sync|checkpoint sync]] konfiguruje się flagą `--checkpoint-sync-url=` albo, dla konkretnego pliku ze stanem, `--initial-state=`."
        ]
      },
      {
        heading: "Co ważne przy pracy z RPC",
        paragraphs: [
          "REST API jest wyłączone do czasu ustawienia `--rest-api-enabled=true`. Potem nasłuchuje na `--rest-api-port`, domyślnie 5051, a nie 5052, na interfejsie podanym w `--rest-api-interface`. Podobnie jak [[besu|Besu]], które pochodzi z tej samej organizacji, Teku sprawdza nagłówek `Host` względem `--rest-api-host-allowlist`. Żądanie, które przychodzi przez [[reverse-proxy|reverse proxy]] pod nazwą spoza tej listy, zostaje więc odrzucone, zanim dotrze do handlera.",
          "Skoro to proces JVM, dobór rozmiaru heapu jest częścią jego utrzymania. Pamięć beacon node'a zajmuje głównie cache stanów, więc operatorzy ustawiają heap jawnie, zamiast polegać na domyślnych ustawieniach kontenera. Po stronie walidatora Teku obsługuje zewnętrzne podpisywanie przez `--validators-external-signer-url`. Tak łączy się go z Web3Signerem, żeby klucze nigdy nie leżały obok samego [[validator-client|klienta walidatora]]."
        ]
      }
    ],
    example: {
      title: "Beacon node Teku z włączonym REST API",
      note: "Zmień `--data-storage-mode` na `ARCHIVE` tylko wtedy, gdy potrzebne są zapytania o historyczne stany beacon; kosztuje to dużo miejsca na dysku."
    },
    pitfalls: [
      "Zakładanie portu 5052; domyślny port REST API Teku to 5051 i do ustawienia `--rest-api-enabled=true` jest on zamknięty.",
      "Szukanie winy w uwierzytelnianiu po otrzymaniu 403 przez proxy, gdy przyczyną jest `--rest-api-host-allowlist`.",
      "Pytanie o stan starego slotu na węźle w trybie `PRUNE`; historycznych stanów po prostu tam nie ma.",
      "Uruchamianie połączonego procesu beacon node i walidatora na jednej maszynie, a potem start drugiej kopii z tymi samymi kluczami podczas migracji."
    ]
  },
  nimbus: {
    title: "Nimbus",
    aliases: ["nimbus_beacon_node", "trustedNodeSync", "Status", "Nim", "--web3-url", "verified proxy", "klient konsensusu na małe maszyny"],
    summary: "Nimbus to [[consensus-client|klient konsensusu]] w języku Nim od Status, zbudowany z myślą o małych maszynach. Z [[execution-client|klientem wykonawczym]] łączy się przez `--el`, a [[beacon-api|Beacon API]] udostępnia tylko wtedy, gdy poda się `--rest`.",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Nimbus jest napisany w Nim i zoptymalizowany pod niskie zużycie pamięci i CPU, dlatego zwykle wybiera się go na komputery jednopłytkowe i małe instancje w chmurze. [[beacon-node|Beacon node]] to `nimbus_beacon_node`, a [[validator-client|klient walidatora]] to osobny `nimbus_validator_client`, choć beacon node może też sam trzymać klucze. Ten sam projekt utrzymuje lekkiego klienta i Nimbus verified proxy, które odpowiada na część metod `eth_` i sprawdza wyniki względem nagłówków śledzonych przez [[light-client|lekkiego klienta]]; zobacz [[verified-rpc|weryfikowane RPC]].",
          "Jego flagi używają `=` i różnią się od flag większości innych klientów. Endpoint wykonawczy to `--el=http://127.0.0.1:8551` (starsze wydania nazywały go `--web3-url`) razem z `--jwt-secret=`, a katalog danych to `--data-dir=`. Nimbus ma też klienta dla [[execution-layer|warstwy wykonawczej]], ale to osobny projekt, rozwijany od dawna, i nie jego uruchamia `nimbus_beacon_node`."
        ]
      },
      {
        heading: "Co ważne przy pracy z RPC",
        paragraphs: [
          "[[checkpoint-sync|Checkpoint sync]] to osobny krok, a nie flaga. Raz uruchamia się `nimbus_beacon_node trustedNodeSync --trusted-node-url=...` z zaufanym [[beacon-api|Beacon API]] jako źródłem, żeby zainicjować bazę danych, a potem uruchamia się węzeł normalnie. W ten sam sposób ponownie inicjuje się węzeł, który za bardzo został w tyle.",
          "REST API jest domyślnie wyłączone i wymaga `--rest`. Potem nasłuchuje na `--rest-port`, domyślnie 5052, a `--rest-address` domyślnie wiąże je z localhostem. To ustawienie domyślne ma znaczenie dla monitoringu: węzeł Nimbus, który poza tym działa poprawnie, nie odpowiada na nic, dopóki `--rest` nie jest włączone, a skierowany na niego [[validator-client|klient walidatora]] nie może też pobrać obowiązków."
        ]
      }
    ],
    example: {
      title: "Inicjalizacja Nimbusa z checkpointu i zwykłe uruchomienie",
      note: "URL zaufanego węzła jest używany tylko w tym jednym poleceniu; potem węzeł sam śledzi łańcuch."
    },
    pitfalls: [
      "Oczekiwanie, że `/eth/v1/node/syncing` odpowie na węźle Nimbus z domyślną konfiguracją; REST API jest zamknięte, dopóki nie poda się `--rest`.",
      "Szukanie flagi `--checkpoint-sync-url`; Nimbus robi checkpoint sync przez podkomendę `trustedNodeSync`.",
      "Podanie w `--el` portu 8545 klienta wykonawczego; beacon node potrzebuje uwierzytelnianego [[engine-api|Engine API]] na 8551.",
      "Mylenie beacon node'a Nimbus z osobnym projektem klienta wykonawczego Nimbus podczas czytania dokumentacji."
    ]
  },
  lodestar: {
    title: "Lodestar",
    aliases: ["ChainSafe", "klient w TypeScripcie", "--rest.port", "9596", "lekki klient lodestar"],
    summary: "Lodestar to [[consensus-client|klient konsensusu]] w TypeScripcie od ChainSafe, działający na Node.js i udostępniający [[beacon-api|Beacon API]] na porcie 9596. Jest też źródłem javascriptowej biblioteki [[light-client|lekkiego klienta]] dla przeglądarek.",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Lodestar to monorepo w TypeScripcie uruchamiane na Node.js: `lodestar beacon` uruchamia [[beacon-node|beacon node]], a `lodestar validator` [[validator-client|klienta walidatora]]. To, że jest napisany w tym samym języku co większość narzędzi Ethereum, ma praktyczną konsekwencję. Pakiety implementujące [[ssz|SSZ]], typy konsensusu i zgodnego ze specyfikacją [[light-client|lekkiego klienta]] są publikowane jako biblioteki npm, a aplikacja w przeglądarce albo w Node może weryfikować nagłówki [[beacon-block|bloków beacon]] tym samym kodem, który uruchamia węzeł; zobacz [[verified-rpc|weryfikowane RPC]].",
          "Nazwy jego opcji zawierają kropki i są w camelCase. To główna rzecz do poprawienia przy kopiowaniu polecenia z innego klienta: `--execution.urls` dla endpointu [[engine-api|Engine API]], `--jwt-secret` dla wspólnego sekretu, `--checkpointSyncUrl` dla [[checkpoint-sync|checkpoint sync]] i `--dataDir` dla katalogu danych."
        ]
      },
      {
        heading: "Co ważne przy pracy z RPC",
        paragraphs: [
          "[[beacon-api|Beacon API]] nasłuchuje na porcie 9596, ustawianym przez `--rest.port` i `--rest.address`, czyli daleko od 5052, które zakładają ogólne szablony monitoringu. `--execution.urls` przyjmuje więcej niż jeden endpoint wykonawczy, więc beacon node można skonfigurować z zapasowym [[execution-client|klientem wykonawczym]], na który przejdzie w razie problemu; zobacz [[failover|failover]].",
          "Działanie na Node.js oznacza typowe dla JavaScriptu problemy operacyjne. Limity heapu to realny sufit dla dużego węzła, a pauzy garbage collectora widać jako opóźnienia odpowiedzi [[beacon-endpoints|Beacon API]], a nie jako błędy. W zamian klienta łatwo osadzić w środowiskach testowych i devnetach, dlatego często pojawia się w konfiguracjach do testowania wielu klientów naraz; zobacz [[client-diversity|różnorodność klientów]]."
        ]
      }
    ],
    example: {
      title: "Beacon node Lodestar z checkpoint sync",
      note: "Klient walidatora wskazuje wtedy `http://127.0.0.1:9596`, a nie 5052, przez `lodestar validator --beaconNodes`."
    },
    pitfalls: [
      "Kopiowanie konfiguracji monitoringu albo walidatora z wpisanym na sztywno portem 5052; domyślny port Beacon API w Lodestarze to 9596.",
      "Dosłowne tłumaczenie flag z innego klienta; Lodestar używa `--execution.urls` i `--checkpointSyncUrl`, a nie `--execution-endpoint`.",
      "Ignorowanie limitów heapu Node.js na obciążonym węźle; dają o sobie znać jako wolne odpowiedzi API na długo przed awarią procesu.",
      "Zakładanie, że biblioteka lekkiego klienta daje te same gwarancje co pełny beacon node; weryfikuje nagłówki, ale nie waliduje wykonania."
    ]
  },
  grandine: {
    title: "Grandine",
    aliases: ["grandine beacon", "klient konsensusu w Ruście", "szósty klient konsensusu"],
    summary: "Grandine to [[consensus-client|klient konsensusu]] w Ruście zaprojektowany pod przetwarzanie równoległe i duże liczby walidatorów. Implementuje te same specyfikacje [[beacon-api|Beacon API]] i [[engine-api|Engine API]] co pozostali klienci konsensusu.",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Grandine to szósta implementacja [[consensus-layer|warstwy konsensusu]], która trafiła na mainnet. Jest napisana w Ruście, a jej kod otwarto w 2024 roku po kilku latach zamkniętego rozwoju. Głównym celem projektu jest przepustowość: przetwarzanie bloków i [[attestation|atestacji]] zbudowano tak, żeby korzystało z wielu rdzeni. To odpowiedź na potrzeby operatorów, którzy trzymają wielu [[validator|walidatorów]] za jednym [[beacon-node|beacon node'em]], a nie na przypadek pojedynczego walidatora.",
          "Beacon node i obowiązki walidatora działają w jednym procesie, więc mały setup stakingowy nie potrzebuje osobnego [[validator-client|klienta walidatora]]. To wygodne, ale wiąże się ze zwykłym kompromisem: jeden proces to jedna domena awarii, a rozdzielenie obu części pozwala zrestartować albo wymienić beacon node bez dotykania kluczy podpisujących."
        ]
      },
      {
        heading: "Uruchamianie i co sprawdzić",
        paragraphs: [
          "Grandine przyjmuje te same dane wejściowe co każdy inny klient konsensusu: sieć, katalog danych, endpoint wykonawczy na porcie 8551 z plikiem sekretu JWT i URL checkpointu do [[checkpoint-sync|checkpoint sync]]. Pisownia opcji wiersza poleceń różni się od tej w [[lighthouse|Lighthouse]] i [[prysm|Prysmie]]. Trzeba więc czytać jego własną dokumentację, zamiast tłumaczyć polecenie flaga po fladze, a przed podpięciem [[health-check|health checków]] sprawdzić, na jakim porcie faktycznie wystawił [[beacon-api|Beacon API]].",
          "Ponieważ REST API jest ustandaryzowane, wszystko, co z niego korzysta, jest przenośne: [[validator-client|klient walidatora]] z innego projektu, dashboard monitoringu czy skrypt czytający `/eth/v1/node/syncing` działają bez zmian. Właśnie ta przenośność sprawia, że wymiana klienta konsensusu jest realną operacją, a nie migracją, i to na niej opiera się [[client-diversity|różnorodność klientów]].",
          "Warto zwrócić uwagę na jeden niuans: Grandine i Lighthouse są napisane w Ruście i, jak każdy klient, opierają się na wspólnych bibliotekach kryptograficznych do podpisów BLS i hashowania. Różnorodność implementacji zmniejsza ryzyko skorelowanych awarii, ale go nie eliminuje tam, gdzie klienci mają wspólny język, wspólną zależność albo tak samo błędnie odczytali specyfikację."
        ]
      }
    ],
    pitfalls: [
      "Zakładanie, że flagi Grandine są takie same jak w Lighthouse, bo oba projekty są napisane w Ruście; Grandine ma własne nazwy opcji.",
      "Traktowanie połączonego procesu beacon node i walidatora jak odpowiednika rozdzielonego setupu; jego restart zatrzymuje nie tylko śledzenie łańcucha, ale też atestowanie.",
      "Traktowanie różnorodności języków jako pełnej niezależności, gdy dwóch klientów korzysta z tej samej biblioteki BLS."
    ]
  },
  "client-diversity": {
    title: "Różnorodność klientów",
    aliases: [
      "różnorodność klientów",
      "klient większościowy",
      "klient mniejszościowy",
      "superwiększość",
      "udział klientów w sieci",
      "dominujący klient"
    ],
    summary: "Różnorodność klientów to właściwość sieci, w której żadna pojedyncza implementacja nie ma na tyle dużego udziału, żeby jej błędy mogły podzielić łańcuch albo błędnie go sfinalizować. Dotyczy to zarówno [[execution-layer|warstwy wykonawczej]], jak i [[consensus-layer|warstwy konsensusu]].",
    sections: [
      {
        heading: "Dlaczego udział ma znaczenie",
        paragraphs: [
          "Każdy [[execution-client|klient wykonawczy]] i [[consensus-client|klient konsensusu]] to niezależna interpretacja tych samych specyfikacji i każdy może zawierać błąd, przez który zaakceptuje blok odrzucany przez pozostałych albo odwrotnie. Koszt takiego błędu zależy wyłącznie od tego, ilu [[validator|walidatorów]] korzysta z klienta, który go ma, a liczą się tu trzy progi.",
          "Poniżej jednej trzeciej sieci cierpi tylko zepsuty klient: jego węzły podążają za łańcuchem, za którym nie idzie nikt inny, jego walidatorzy nie wykonują obowiązków i tracą stake, a reszta sieci normalnie [[finality|finalizuje]] bloki. Powyżej jednej trzeciej żadna gałąź nie może zostać sfinalizowana, dopóki rozbieżność nie zostanie rozwiązana, więc cała sieć utyka na ostatnim sfinalizowanym checkpoincie. Powyżej dwóch trzecich zepsuty klient może sfinalizować własny, nieprawidłowy łańcuch, a cofnięcie tego wymaga skoordynowanej interwencji ludzi, a nie mechanizmu protokołu. Z powodu tych progów operatorów prosi się o uruchamianie klientów, które nie dominują, a [[network-telemetry|trackery]] takie jak clientdiversity.org publikują rozkład udziałów.",
          "To nie jest teoria. W maju 2023 mainnet dwukrotnie przez kilka epok nie finalizował bloków, gdy nietypowe obciążenie ujawniło błąd obecny w części klientów konsensusu, a w innych nie. Klienci bez tego błędu utrzymali łańcuch w ruchu, podczas gdy pozostałych naprawiano. Sieć z jedną implementacją nie miałaby takiego marginesu."
        ]
      },
      {
        heading: "Jak sprawdzić, z czym się rozmawia",
        paragraphs: [
          "Po stronie wykonawczej [[net-web3-api|web3_clientVersion]] zwraca ciąg w dowolnym formacie, który identyfikuje oprogramowanie, jego wersję i platformę. Po stronie konsensusu odpowiednikiem jest `GET /eth/v1/node/version` z [[beacon-api|Beacon API]]. Żadna z tych odpowiedzi nie jest uwierzytelniona ani gwarantowana, a [[rpc-provider|dostawca RPC]] z mieszaną flotą węzłów może zwrócić ciąg własnego gatewaya, zmienioną wartość albo przy każdym żądaniu kierować ruch do innego backendu.",
          "Dla aplikacji różnorodność to także kwestia interfejsu. Klienci różnią się tym, jakie [[namespaces|przestrzenie nazw]] obsługują, jakie [[rpc-errors|kody i komunikaty błędów]] zwracają przy tej samej awarii, limitami gasu w [[eth-call|eth_call]], obsługą [[eth-simulate|eth_simulateV1]] i tym, ile historycznego stanu trzymają. Kod testowany na dokładnie jednym kliencie zwykle utrwala jego dziwactwa, a gdy [[failover|failover]] skieruje ruch do innej implementacji, te założenia wychodzą na produkcji jako błędy. Sprawdzanie prawdziwymi wywołaniami, jak w [[endpoint-capabilities|możliwościach endpointu]], jest pewniejsze niż czytanie ciągu wersji."
        ]
      }
    ],
    example: {
      title: "Jak zapytać endpoint, jakie oprogramowanie na nim działa",
      note: "Numery wersji są tu przykładowe; pewny jest tylko kształt ciągu, który podaje implementację, jej build i platformę."
    },
    pitfalls: [
      "Traktowanie `web3_clientVersion` na hostowanym endpoincie jako wiarygodnej informacji; dostawcy mogą tę wartość zmieniać albo kierować następne żądanie do innego oprogramowania.",
      "Wybieranie klienta do konfiguracji walidatora według popularności, bo to właśnie ta presja tworzy superwiększość.",
      "Testowanie aplikacji tylko na jednym kliencie i odkrycie podczas failovera, że komunikaty błędów i zestaw przestrzeni nazw się różnią.",
      "Uruchamianie zróżnicowanego zestawu klientów wykonawczych, gdy wszystkie własne [[beacon-node|beacon node'y]] działają na tym samym kliencie konsensusu; ryzyko dotyczy każdej z warstw niezależnie."
    ]
  },
  "validator-client": {
    title: "Klient walidatora",
    aliases: [
      "klient walidatora",
      "VC",
      "validator client",
      "slashing protection",
      "ochrona przed slashingiem",
      "keymanager",
      "fee recipient",
      "EIP-3076"
    ],
    summary: "Klient walidatora to proces, który trzyma klucze podpisujące [[validator|walidatora]], pyta [[beacon-node|beacon node]] przez [[beacon-api|Beacon API]], jakie obowiązki ma do wykonania, i podpisuje [[attestation|atestacje]], [[block-proposal|propozycje bloków]] oraz wiadomości [[sync-committee|sync committee]].",
    sections: [
      {
        heading: "Czym jest",
        paragraphs: [
          "Klient walidatora jest celowo mały. Nie ma połączeń peer-to-peer, bazy danych łańcucha ani niczego do synchronizowania; trzyma klucze BLS i zapis tego, co już podpisał. Całą wiedzę o łańcuchu dostaje przez HTTP od jednego lub kilku beacon node'ów. Dzięki temu oba procesy mogą działać na różnych maszynach, po różnych stronach granicy zaufania, a nawet w różnych implementacjach klientów: klient walidatora [[lighthouse|Lighthouse]] może sterować beacon node'em [[teku|Teku]], bo API między nimi jest ustandaryzowane.",
          "Nigdy nie rozmawia z [[execution-client|klientem wykonawczym]]. [[address|Adres]] odbiorcy opłat (fee recipient), który klient ogłasza przez `--suggested-fee-recipient`, trafia do [[execution-layer|warstwy wykonawczej]] pośrednio: klient walidatora przekazuje go beacon node'owi, beacon node wkłada go do `payloadAttributes` w wywołaniu `engine_forkchoiceUpdated`, a klient wykonawczy, budując payload, kieruje na ten adres opłaty z bloku."
        ]
      },
      {
        heading: "Pętla obowiązków",
        paragraphs: [
          "Raz na epokę klient walidatora pyta o swoje przydziały: `POST /eth/v1/validator/duties/attester/{epoch}` z indeksami swoich walidatorów oraz `GET /eth/v1/validator/duties/proposer/{epoch}`. W przydzielonym slocie pobiera dane do podpisania, czyli `GET /eth/v1/validator/attestation_data` dla atestacji i `GET /eth/v3/validator/blocks/{slot}` dla propozycji bloku. Podpisuje je lokalnie i publikuje z powrotem przez beacon node, który rozgłasza je w sieci.",
          "Wskazanie klientowi walidatora kilku beacon node'ów daje redundancję: jeśli jeden nie działa albo jego klient wykonawczy jest niesprawny, obowiązki są dalej wykonywane przez inny; zobacz [[failover|failover]]. Gdy w użyciu jest [[mev-boost|MEV-Boost]], ścieżka propozycji zwraca [[builder-api|blinded block]], czyli blok, który walidator podpisuje, nie widząc transakcji, a beacon node wymienia potem ten podpis na pełny blok."
        ]
      },
      {
        heading: "Klucze i ochrona przed slashingiem",
        paragraphs: [
          "Podpisanie dwóch sprzecznych wiadomości jest karane [[slashing|slashingiem]], dlatego każdy klient walidatora prowadzi [[slashing-protection|bazę ochrony przed slashingiem]] (slashing protection), w której zapisuje, co podpisał każdy klucz. Lighthouse zapisuje każdy podpisany blok i każdą atestację, a minimalna baza trzyma tylko najwyższy slot podpisanego bloku oraz epoki source i target podpisanych atestacji. Ta baza jest tak samo ważna jak same klucze: musi przenosić się razem z nimi w formacie wymiany EIP-3076 i nigdy nie wolno jej przywracać ze starego snapshotu, bo cofnięty zapis bez wahania przepuści podpis pod czymś, co klient już podpisał.",
          "Klucze mogą też być trzymane zupełnie gdzie indziej. [[remote-signer|Remote signer]], na przykład Web3Signer, przechowuje je i udostępnia endpoint do podpisywania, więc klient walidatora wysyła wiadomość do podpisania, zamiast wczytywać klucz. Klienci oferują ponadto uwierzytelniane keymanager API do importowania i usuwania kluczy w trakcie działania. To osobny listener, niezależny od [[beacon-api|Beacon API]] beacon node'a, i powinien zostać w sieci prywatnej; zobacz [[authentication|uwierzytelnianie]]."
        ]
      }
    ],
    example: {
      title: "Klient walidatora podłączony do dwóch beacon node'ów",
      note: "Oba adresy URL wskazują [[beacon-node|beacon node'y]]; żadna część tego procesu nigdy nie otwiera połączenia z klientem wykonawczym."
    },
    pitfalls: [
      "Uruchamianie dwóch klientów walidatora z tymi samymi kluczami [[distributed-validator|dla redundancji]]. To klasyczny sposób na slashing, a żadna baza ochrony nie obejmuje dwóch hostów.",
      "Migrowanie kluczy bez eksportu ochrony przed slashingiem w formacie wymiany EIP-3076 albo import takiego eksportu z kopii zapasowej zrobionej przed ostatnimi podpisami.",
      "Wystawianie keymanager API na publicznym interfejsie; przez nie można importować i usuwać klucze.",
      "Zakładanie, że klient walidatora potrzebuje własnego endpointu wykonawczego; fee recipient trafia do warstwy wykonawczej przez beacon node."
    ]
  },
  "beacon-node": {
    title: "Beacon node",
    aliases: ["BN", "beacon chain node", "węzeł beacon", "node/syncing", "el_offline", "is_optimistic"],
    summary: "Beacon node to proces [[consensus-client|klienta konsensusu]], który synchronizuje Beacon Chain przez libp2p, wykonuje [[fork-choice|fork choice]], steruje jednym [[execution-client|klientem wykonawczym]] przez [[engine-api|Engine API]] i udostępnia [[beacon-api|Beacon API]].",
    sections: [
      {
        heading: "Co robi",
        paragraphs: [
          "Beacon node to ta połowa węzła, która decyduje, czym jest łańcuch. Odbiera [[beacon-block|bloki beacon]] i [[attestation|atestacje]] przez gossip na porcie 9000 (niektórzy klienci domyślnie używają innego, zwłaszcza [[prysm|Prysm]]), weryfikuje ich [[bls-signature|podpisy BLS]], uwzględnia je w fork choice i na bieżąco aktualizuje checkpointy justified i finalized; zobacz [[libp2p-gossip|sieć warstwy konsensusu]] i [[finality|finalność]].",
          "Tworzy parę jeden do jednego z klientem wykonawczym. [[engine-api|Engine API]] nie zna pojęcia wielu wywołujących: każde `engine_forkchoiceUpdated` ustawia jeden head, więc dwa beacon node'y podłączone do tego samego klienta wykonawczego nadpisywałyby sobie nawzajem widok łańcucha. Jeden beacon node może natomiast obsługiwać wielu [[validator-client|klientów walidatora]], a jeden klient walidatora może mieć na liście kilka beacon node'ów dla redundancji."
        ]
      },
      {
        heading: "Na co potrafi odpowiedzieć",
        paragraphs: [
          "[[beacon-api|Beacon API]] wystawia łańcuch jako zasoby REST: nagłówki i bloki według slotu albo roota, `finality_checkpoints` dla danego stanu, rejestr walidatorów oraz [[blob|bloby]] pod `/eth/v1/beacon/blobs/{block_id}`, które beacon-APIs v4.0.0 dodało w miejsce przestarzałego `/eth/v1/beacon/blob_sidecars/{block_id}`. Dane blobów są tutaj, a nie w kliencie wykonawczym, i są usuwane po 4096 epokach, czyli mniej więcej po 18 dniach. Od Fulu węzeł przechowuje (custody) kolumny danych, a nie całe bloby, więc zwracać je musi tylko supernode, który przechowuje wszystkie kolumny; inne węzły mogą je zrekonstruować albo odmówić. `/eth/v1/events` to [[server-sent-events|strumień server-sent events]] z eventami `head`, `finalized_checkpoint` i `chain_reorg` i to dzięki niemu [[indexer|indekser]] może obserwować konsensus bez odpytywania.",
          "Zapytania o stan to drogi przypadek. Beacon node'y przechowują okresowe snapshoty stanu i odtwarzają bloki, żeby dojść do pozostałych, więc zapytanie o stan na starym slocie albo wymaga realnej pracy, albo zostaje odrzucone, zależnie od ustawień retencji klienta. Identyfikatory stanu `head` i `finalized` są zawsze tanie, a dowolne historyczne sloty już nie. To odpowiednik po stronie warstwy konsensusu tego, że po stronie wykonawczej potrzebny jest [[archive-node|węzeł archiwalny]]."
        ]
      },
      {
        heading: "Jak sprawdzić, czy jest zdrowy",
        paragraphs: [
          "`GET /eth/v1/node/syncing` to najbardziej przydatny endpoint dla [[health-check|health checków]]. `is_syncing` i `sync_distance` mówią, jak daleko węzeł jest za head. `is_optimistic` ma wartość `true`, gdy węzeł zaimportował bloki, których jego klient wykonawczy jeszcze nie zwalidował, a `el_offline` ma wartość `true`, gdy połączenie przez Engine API jest zerwane. Węzeł z `is_syncing: false` i `el_offline: true` nie jest zdrowy — działa siłą rozpędu, a [[block-tag|tagi bloków]] `safe` i `finalized` w sparowanym kliencie wykonawczym przestaną się przesuwać.",
          "[[checkpoint-sync|Checkpoint sync]] to zwykły sposób uruchamiania beacon node: węzeł pobiera niedawny sfinalizowany stan z zaufanego [[beacon-api|Beacon API]] i zaczyna od niego, opcjonalnie uzupełniając później starsze bloki (backfill). Dzięki temu świeży klient konsensusu nadaje się do użytku w kilka minut zamiast dni, i to również spełnia wymóg [[weak-subjectivity|weak subjectivity]]."
        ]
      }
    ],
    example: {
      title: "Endpoint do health checków, który powinien obserwować każdy monitoring",
      note: "Liczą się wszystkie cztery flagi; alert tylko na `is_syncing` ukrywa węzeł, którego klient wykonawczy zniknął."
    },
    pitfalls: [
      "Podłączanie dwóch beacon node'ów do jednego klienta wykonawczego; będą się przeciągać o head przez `engine_forkchoiceUpdated`.",
      "Alertowanie tylko na `is_syncing` i przeoczenie `el_offline` albo `is_optimistic`, które opisują węzeł wyglądający na sprawny, choć sprawny nie jest.",
      "Żądanie stanu beacon na dowolnym starym slocie od normalnie skonfigurowanego węzła; stany są rekonstruowane, a nie wszystkie przechowywane.",
      "Oczekiwanie danych blobów od klienta wykonawczego po mniej więcej 18 dniach; dane blobów żyją w [[consensus-layer|warstwie konsensusu]], która usuwa je po 4096 epokach, więc starsze bloby trzeba brać z [[blob-archive|archiwum blobów]].",
      "Kierowanie konsumenta blobów do zwykłego beacon node po Fulu; odpowiadać na `/eth/v1/beacon/blobs/{block_id}` muszą tylko supernode'y."
    ]
  },
  "client-storage": {
    title: "Silniki bazy danych klientów",
    aliases: [
      "baza danych klienta",
      "przechowywanie stanu na dysku",
      "stan oparty na ścieżkach",
      "stan oparty na hashach",
      "układ bazy danych węzła",
      "historia na dysku"
    ],
    summary: "Silnik bazy danych klienta to układ, w jakim [[execution-client|klient wykonawczy]] trzyma [[state|stan]] i historię na dysku: trie kluczowane hashami, trie kluczowane ścieżkami albo płaskie rekordy klucz-wartość ze zbiorami zmian (change sets). Od niego zależy, na które historyczne zapytania RPC węzeł potrafi odpowiedzieć.",
    sections: [
      {
        heading: "Dwie różne rzeczy do przechowania",
        paragraphs: [
          "Węzeł przechowuje stan i historię, a każde z nich zachowuje się inaczej. Stan to bieżąca wartość każdego konta i każdego slotu storage; z niego czytają [[eth-get-balance|eth_getBalance]], [[eth-call|eth_call]] i [[eth-get-storage-at|eth_getStorageAt]]. Historia to sekwencja bloków, transakcji i receiptów, z której czytają [[eth-get-block-by-number|eth_getBlockByNumber]] i [[eth-get-logs|eth_getLogs]]. Węzeł może mieć całą historię i prawie nic ze starego stanu, i dokładnie tak wygląda zwykły [[full-node|pełny węzeł]].",
          "Historia jest tylko dopisywana (append-only), więc klienci przenoszą ją z głównej bazy do niezmiennych plików. Tak robią freezer (ancient store) Getha, pliki snapshotów Erigona i static files Retha, a wszystkie te pliki mogą leżeć na tańszym nośniku niż baza z bieżącymi danymi. Stan to część przepisywana w każdym bloku i właśnie w nim układy danych się różnią."
        ]
      },
      {
        heading: "Jak kluczowane są trie node'y stanu",
        paragraphs: [
          "Pierwotny układ kluczuje każdy węzeł [[merkle-patricia-trie|Merkle-Patricia Trie]] hashem jego zawartości. Zmieniony trie node dostaje nowy hash, więc gromadzi się każda wersja każdego trie node'a. Dzięki temu [[archive-node|węzeł archiwalny]] jest trywialny, bo wystarczy niczego nie usuwać, ale zwykły węzeł robi się drogi, bo baza rośnie, a losowych zapisów przybywa.",
          "Układy oparte na ścieżkach (path-based) kluczują trie node jego pozycją w trie. Tak działa schemat path-based [[geth|Getha]], domyślny dla nowych baz od v1.14, układ half-path [[nethermind|Nethermind]], który 2.0 zachowuje tylko dla zaktualizowanych baz i węzłów uruchomionych z `FlatDb.Enabled=false`, oraz format Bonsai w [[besu|Besu]]. Każdy trie node ma wtedy dokładnie jeden bieżący rekord, baza przestaje rosnąć razem z historią, a starsze wersje przetrwają tylko w ograniczonym oknie warstw diffów (diff layers) albo trie logów; w przypadku Getha to około 128 bloków. Poza tym oknem [[pruned-node|pruned node]] odpowiada `missing trie node`.",
          "Układy płaskie, których używają [[erigon|Erigon]], [[reth|Reth]], nowe bazy Nethermind 2.0, a co do idei także Bonsai, idą dalej: rekordem źródłowym jest sama wartość, kluczowana adresem i slotem, a trie node'y liczy się tylko wtedy, gdy trzeba wyznaczyć [[state-root|state root]]. Historia staje się zbiorem change setów, więc przechowanie każdej dawnej wartości kosztuje dużo mniej niż przechowanie trie dla każdego bloku. Dlatego węzły archiwalne w tych klientach są przystępne cenowo."
        ]
      },
      {
        heading: "Co widzi wywołujący RPC",
        paragraphs: [
          "Pierwsza konsekwencja dotyczy tego, dla których bloków węzeł w ogóle odpowiada. To samo [[eth-call|eth_call]] na bloku sprzed dwóch lat udaje się na płaskim węźle archiwalnym, kończy się błędem `missing trie node` na pruned node z układem path-based, a na węźle archiwalnym z układem hash-based może zostać obsłużone z zupełnie innej bazy. Lepiej sprawdzać niż zakładać; zobacz [[endpoint-capabilities|możliwości endpointu]].",
          "Druga dotyczy dowodów. [[eth-get-proof|eth_getProof]] zwraca rzeczywiste trie node'y, a klient, który trzyma wartości płasko, musi je odbudować. Dlatego historyczne dowody są domyślnie niedostępne nawet na węźle, który ma każdą historyczną wartość, co zaskakuje zespoły budujące [[state-proof|dowody stanu]] na endpoincie archiwalnym. Klienci, którzy je oferują, robią z nich opcję do włączenia, zwykle przez przechowywanie dodatkowych danych trie albo commitmentów: `--history.trienode` w Geth 1.17, `FlatDb.ArchiveProofServeEnabled` razem z `FlatDb.ArchiveProofBuildEnabled` przy płaskiej historii bez okna w Nethermind 2.0, `--prune.include-commitment-history` w Erigon 3 oraz `--rpc.eth-proof-window` w Reth, którego okno sięga najwyżej 1 209 600 bloków poniżej heada.",
          "Trzecia to retencja historii, niezależna od wszystkiego powyżej: indeksy transakcji i body starych bloków można przycinać niezależnie od stanu, jak w `--history.transactions` Getha, a [[history-expiry|history expiry]] (wygaszanie starej historii) całkowicie usuwa dane sprzed Merge. Pod każdym układem leży ten sam wymóg sprzętowy: dominują losowe odczyty, więc [[node-hardware|NVMe z wysokim IOPS]] nie jest opcjonalny. [[beacon-node|Beacon node'y]] przechowują dane jeszcze inaczej: stany [[ssz|SSZ]] z okresowymi snapshotami i odtwarzaniem zamiast trie."
        ]
      }
    ],
    example: {
      title: "Co i gdzie zapisuje każdy klient wykonawczy",
      note: "Specyfikacja [[json-rpc|JSON-RPC]] w ogóle nie obejmuje retencji, więc dwóch klientów może odpowiedzieć na to samo historyczne zapytanie inaczej wyłącznie z powodu tej kolumny."
    },
    pitfalls: [
      "Zakładanie, że węzeł archiwalny potrafi odpowiedzieć na historyczne `eth_getProof`; domyślnie płaskie przechowywanie trzyma wartości, a nie trie node'y, z których składa się dowód.",
      "Odczytywanie `missing trie node` jako uszkodzenia bazy danych; zwykle oznacza to, że stan z tego bloku został usunięty przez pruning.",
      "Dobieranie dysku według rozmiaru stanu klienta z pominięciem historii albo przełączanie węzła między schematami przechowywania bez zaplanowania pełnej ponownej synchronizacji.",
      "Umieszczanie bazy bieżącego stanu na dysku sieciowym, bo pliki historii, do których dane są tylko dopisywane, dobrze to znoszą; stan wymaga losowych zapisów i tego nie zniesie."
    ]
  },
  "validator-node": {
    title: "Węzeł walidatora",
    aliases: [
      "węzeł walidatora",
      "węzeł stakingowy",
      "staking node",
      "staking setup",
      "validator deployment",
      "EL + BN + VC",
      "home staking",
      "maszyna do stakingu"
    ],
    summary: "Węzeł walidatora to cała instalacja stakingowa: [[execution-client|klient wykonawczy]], [[beacon-node|beacon node]] i [[validator-client|klient walidatora]], często z [[mev-boost|MEV-Boost]], [[remote-signer|remote signerem]] albo middleware [[distributed-validator|rozproszonego walidatora]], połączone tak, żeby obowiązki [[validator|walidatora]] były podpisywane i publikowane na czas.",
    sections: [
      {
        heading: "Trzy procesy, trzy interfejsy",
        paragraphs: [
          "Walidator to klucz, klient walidatora to proces, który nim podpisuje, a węzeł walidatora to wszystko, od czego ten podpis zależy. Klient wykonawczy i beacon node rozmawiają przez [[engine-api|Engine API]] na porcie 8551, a połączenie uwierzytelnia wspólny 32-bajtowy sekret JWT: beacon node przekazuje payload każdego bloku przez `engine_newPayload`, wskazuje head przez `engine_forkchoiceUpdated` i prosi o zbudowanie payloadu, gdy jego walidator proponuje blok. Klient walidatora rozmawia z beacon node'em przez endpointy walidatora w [[beacon-api|Beacon API]], które obsługują obowiązki, dane atestacji, produkcję i publikację bloków. Beacon node rozmawia z MEV-Boost, domyślnie na porcie 18550, przez [[builder-api|builder API]]: rejestruje walidatorów, pobiera ofertę z nagłówkiem i wysyła podpisany blinded block.",
          "Opcjonalne elementy wpinają się w te interfejsy. Remote signer stoi za klientem walidatora, który wysyła mu żądania podpisu, zamiast wczytywać klucze. Middleware rozproszonego walidatora, na przykład Charon od Obol, stoi między klientami walidatora a beacon node'ami: każdemu klientowi wystawia Beacon API, a jednocześnie koordynuje podpis progowy między operatorami. Liczby mają znaczenie: jeden klient wykonawczy na beacon node, bo Engine API przewiduje tylko jednego wywołującego fork choice; wielu klientów walidatora na jeden beacon node; kilka beacon node'ów na klienta walidatora; jeden MEV-Boost dla kilku beacon node'ów. Klient walidatora nigdy nie rozmawia z klientem wykonawczym."
        ]
      },
      {
        heading: "Jak rozchodzi się awaria",
        paragraphs: [
          "Klient wykonawczy, który nie działa albo się synchronizuje, nie może walidować payloadów, więc jego beacon node staje albo importuje bloki optymistycznie, a `/eth/v1/node/syncing` zgłasza `el_offline` lub `is_optimistic`. Specyfikacja optimistic sync zabrania wtedy walidatorowi proponowania bloków, atestowania i udziału w obowiązkach [[sync-committee|sync committee]], więc każdy obowiązek z tego okresu przepada. To kosztuje kary, a nie [[slashing|slashing]], i MEV-Boost nie pomaga: węzeł optymistyczny nie może proponować bloku nawet z ofertą buildera w ręku.",
          "Pozostałe awarie mają węższy zasięg. Beacon node, który znika, zabiera ze sobą swoich klientów walidatora, chyba że mają na liście inny; zobacz [[failover|failover]]. Przy awarii relaya albo MEV-Boost beacon node wraca do lokalnie zbudowanego payloadu, więc propozycja się udaje, tylko ma mniejszą wartość. Zły sekret JWT albo rozjazd zegarów między hostami sprawia, że każde wywołanie Engine API kończy się błędem, co od strony walidatora wygląda dokładnie tak, jakby klient wykonawczy nie działał."
        ]
      },
      {
        heading: "Obciążenie RPC na kliencie wykonawczym walidatora",
        paragraphs: [
          "Walidator publikuje atestację, gdy blok ze slotu zostanie zaimportowany albo gdy minie mniej więcej jedna trzecia slotu, dziś na mainnecie cztery sekundy, zależnie od tego, co nastąpi wcześniej. Import obejmuje wykonanie payloadu przez klienta wykonawczego wewnątrz `engine_newPayload`. Klient wykonawczy, który dzieli CPU, dysk i bazę danych z ruchem publicznym, czyli szerokimi skanami [[eth-get-logs|eth_getLogs]], `debug_traceBlockByNumber` i seriami [[eth-call|eth_call]], wykonuje ten payload później. Gdy import przesunie się poza termin, atestacja głosuje na rodzica jako head i traci nagrodę za head. Proposer, który wolno buduje albo waliduje, publikuje z opóźnieniem, a spóźniony blok może zostać osierocony przez następnego proposera. Dokumentacja Nethermind ostrzega, że z tego samego powodu full pruning może zmniejszyć nagrody walidatora.",
          "Zwykłą odpowiedzią jest rozdzielenie. Klient wykonawczy walidatora obsługuje tylko Engine API i lokalny monitoring, a publiczne [[json-rpc|JSON-RPC]] trafia do innych węzłów za [[load-balancer|load balancerem]]. Jeśli jedna maszyna musi robić jedno i drugie, warto ograniczyć kosztowne metody [[rate-limits|rate limitami]], trzymać publiczny listener na osobnym interfejsie i obserwować opóźnienie `newPayload` oraz terminowość atestacji obok dashboardów RPC."
        ]
      }
    ],
    example: {
      title: "Połączenia jednego węzła walidatora",
      note: "Każda strzałka to miejsce, w którym opóźnienie albo awaria zamienia się w pominięty obowiązek; jedynymi upstreamami klienta walidatora są beacon node'y i opcjonalnie signer."
    },
    pitfalls: [
      "Kierowanie publicznego ruchu dappów do klienta wykonawczego za beacon node'em walidatora, przez co serie tracingu opóźniają `newPayload` i kosztują głosy head.",
      "Budowanie redundancji przez powielenie całego węzła razem z kluczami, zamiast dać jednemu klientowi walidatora kilka beacon node'ów.",
      "Alertowanie tylko na synchronizację warstwy wykonawczej i przeoczenie beacon node'a, który zgłasza `el_offline` lub `is_optimistic`, podczas gdy jego obowiązki przepadają.",
      "Zakładanie, że MEV-Boost utrzyma propozycję przy niedziałającym kliencie wykonawczym; optymistyczny beacon node w ogóle nie może proponować bloków."
    ]
  },
  "remote-signer": {
    title: "Remote signer",
    aliases: [
      "remote signer",
      "zdalny signer",
      "Web3Signer",
      "Dirk",
      "external signer",
      "zewnętrzny signer",
      "keymanager API",
      "/eth/v1/remotekeys",
      "EIP-3076",
      "Clef"
    ],
    summary: "Remote signer to osobna usługa, która trzyma klucze [[validator|walidatorów]] i zwraca [[bls-signature|podpisy BLS]] [[validator-client|klientowi walidatora]], który o nie prosi. Dzięki temu proces rozmawiający z siecią nigdy nie ma klucza, a ochrona przed slashingiem działa przy kluczu, a nie przy kliencie.",
    sections: [
      {
        heading: "Podpisywanie przez sieć",
        paragraphs: [
          "Klient walidatora zwykle wczytuje keystore'y i podpisuje lokalnie. Z remote signerem buduje obiekt do podpisania, czyli [[attestation|atestację]], blok, RANDAO reveal albo wiadomość sync committee, i zamiast go podpisać, wysyła go dalej. Web3Signer od Consensys przyjmuje `POST /api/v1/eth2/sign/{identifier}`, gdzie identyfikatorem jest klucz publiczny BLS walidatora, a body zawiera `type`, na przykład `ATTESTATION` albo `BLOCK_V2`, pole `fork_info` potrzebne do wyznaczenia domeny podpisu, opcjonalny `signingRoot` i sam obiekt. W odpowiedzi zwraca podpis. Wszyscy główni klienci walidatora potrafią delegować do niego podpisywanie.",
          "Dirk od Attestant komunikuje się przez gRPC z wzajemnym uwierzytelnianiem TLS (mutual TLS), z osobnym certyfikatem dla każdego klienta, i zwykle steruje nim klient walidatora Vouch, również od Attestant. Przechowuje zwykłe klucze albo klucze rozproszone, wygenerowane tak, że dowolne k z n instancji Dirka razem tworzy poprawny podpis progowy, a żadna pojedyncza maszyna nie ma całego klucza. To odpowiednik [[distributed-validator|rozproszonych walidatorów]] po stronie signera. Kluczami zarządza się w trakcie działania przez standardowe keymanager API, uwierzytelniane tokenem i udostępniane przez ten program, który akurat trzyma klucze: `/eth/v1/keystores` wyświetla, importuje i usuwa lokalne keystore'y, a `/eth/v1/remotekeys` rejestruje klucze publiczne, których podpisywanie klient walidatora deleguje pod adres URL signera."
        ]
      },
      {
        heading: "Ochrona przed slashingiem powinna być przy kluczu",
        paragraphs: [
          "Signer, który trzyma klucz, to jedyne miejsce, które widzi każdy złożony nim podpis, więc tam powinna działać ochrona przed [[slashing|slashingiem]]. Web3Signer domyślnie sprawdza każde żądanie w [[slashing-protection|bazie ochrony przed slashingiem]], czyli w bazie PostgreSQL wskazanej przez `--slashing-protection-db-url`. Dzięki temu kilku klientów walidatora albo kilka instancji Web3Signera współdzielących tę bazę nie uzyska w ten sposób sprzecznych podpisów. Dirk prowadzi własne zapisy. Oba narzędzia importują i eksportują format wymiany EIP-3076: JSON, którego pole `metadata` zawiera `interchange_format_version` 5 i `genesis_validators_root`, a dalej dla każdego klucza `signed_blocks` według slotów i `signed_attestations` według epok source i target. Keymanager API przenosi te same dane: import je zawiera, a usunięcie klucza je zwraca.",
          "Ochrona obejmuje tylko żądania, które widzi. Dwa signery z osobnymi bazami, które trzymają jeden klucz, klucz nadal wczytany w kliencie walidatora po zarejestrowaniu go jako zdalny albo skrypt [[failover|failover]], który uruchamia drugiego klienta z drugim signerem, gdy pierwszy jest tylko wolny: każdy z tych przypadków przywraca podwójny podpis, który cały ten układ miał wykluczyć. Doppelganger protection, która według dokumentacji Lighthouse przez dwie do trzech epok milczy i nasłuchuje, czy klucz nie działa gdzie indziej, to ostatnia linia obrony, a jej własna dokumentacja nazywa ją niedoskonałą."
        ]
      },
      {
        heading: "Opóźnienia, dostępność i Clef",
        paragraphs: [
          "Każdy obowiązek obejmuje teraz round trip przez sieć i zapis do bazy, zanim wróci podpis, a atestacja powinna wyjść mniej więcej cztery sekundy po początku slotu. Signer za wolnym łączem, przeciążona baza albo signer progowy czekający na k z n instancji mogą przesunąć wiadomości poza termin i kosztować nagrody, a awaria signera oznacza pominięcie naraz wszystkich obowiązków wszystkich kluczy, które trzyma. Web3Signer udostępnia `/upcheck` i `/healthcheck`; alerty warto ustawić zarówno na opóźnienie podpisywania, jak i na samą dostępność. Resztę tego łańcucha zależności czasowych omawia temat o [[validator-node|węźle walidatora]].",
          "Clef to inne narzędzie oparte na podobnym pomyśle: signer warstwy wykonawczej dla transakcji i danych typowanych [[eip-712|EIP-712]], z którym [[geth|Geth]] łączył się przez `--signer`, a nie signer dla walidatorów. W czerwcu 2026 usunięto go z repozytorium go-ethereum jako nieutrzymywany; jest rozwijany dalej w osobnym repozytorium ethereum/clef, a Geth nadal przyjmuje zewnętrzny signer przez `--signer`. Podpisywanie w warstwie wykonawczej z poziomu aplikacji opisują [[signing-methods|metody podpisywania]]."
        ]
      }
    ],
    example: {
      title: "Żądanie podpisu atestacji wysłane do Web3Signera",
      note: "Przed podpisaniem signer sprawdza `source` i `target` w swojej bazie ochrony przed slashingiem; żądanie, które dałoby surround vote albo double vote, zostaje odrzucone, a nie podpisane."
    },
    pitfalls: [
      "Kierowanie zapasowego klienta walidatora do drugiego signera z własną bazą ochrony przed slashingiem, przez co failover może podpisać dwa razy.",
      "Zostawianie kluczy zaimportowanych w kliencie walidatora po zarejestrowaniu ich jako kluczy zdalnych, przez co podpisywać nimi mogą dwa miejsca.",
      "Przenoszenie klucza między signerami bez jego eksportu EIP-3076 albo importowanie eksportu zrobionego przed ostatnimi podpisami.",
      "Wystawianie keymanager API albo portu HTTP signera poza hosty walidatorów; przez każde z nich można dodawać, usuwać i używać kluczy.",
      "Umieszczanie signera lub jego bazy daleko od klienta walidatora i odkrywanie opóźnienia dopiero po spadku terminowości atestacji."
    ]
  },
  helios: {
    title: "Helios",
    aliases: [
      "a16z helios",
      "helios light client",
      "@a16z/helios",
      "helios ethereum",
      "heliosup",
      "verifying RPC proxy",
      "proxy weryfikujące RPC"
    ],
    summary: "Helios to napisany w Ruście [[light-client|lekki klient]] od a16z, który śledzi konsensus Ethereum przez podpisy [[sync-committee|sync committee]] i zamienia niezaufane RPC warstwy wykonawczej w lokalny endpoint [[json-rpc|JSON-RPC]], a jego odpowiedzi sprawdza przez [[eth-get-proof|eth_getProof]] i własne EVM.",
    sections: [
      {
        heading: "Dwie ścieżki zaufania",
        paragraphs: [
          "Strona konsensusu zaczyna od checkpointu weak subjectivity, `--checkpoint`, czyli korzenia pierwszego bloku beacon w epoce. Helios pobiera bootstrap, a potem [[light-client-update|aktualizacje lekkiego klienta]] z `--consensus-rpc`, czyli z dowolnego beacon node, który serwuje endpointy lekkiego klienta z Beacon API, i weryfikuje każdy agregat sync committee, idąc do przodu okres komitetu po okresie. To jest [[consensus-proof|dowód konsensusu]], który daje [[trusted-header|zaufany nagłówek]] ze `stateRoot` i hashem bloku. README zaleca checkpoint młodszy niż dwa tygodnie; starszy powoduje tylko ostrzeżenie, chyba że ustawiono `--strict-checkpoint-age`, a po pierwszym uruchomieniu Helios zapisuje w cache najnowszy sfinalizowany korzeń w swoim katalogu danych; opisuje to temat [[weak-subjectivity|weak subjectivity]].",
          "Strona wykonawcza to `--execution-rpc`, czyli dowolny provider, który serwuje eth_getProof. Odczyt salda, nonce albo storage staje się wywołaniem eth_getProof weryfikowanym względem zaufanego korzenia, a kod jest hashowany i porównywany z udowodnionym `codeHash`; opisuje to temat [[state-proof|dowód stanu]]. [[eth-call|eth_call]] i [[eth-estimate-gas|eth_estimateGas]] idą dalej: Helios prosi providera o [[eth-create-access-list|eth_createAccessList]] jako podpowiedź, których kont i slotów dotknie wywołanie, dowodzi każdego z nich i wykonuje wywołanie w lokalnym EVM, pobierając i dowodząc wszystkiego, co podpowiedź pominęła. Podpowiedź wpływa tylko na szybkość; nieuczciwa podpowiedź nie może zmienić wyniku."
        ]
      },
      {
        heading: "Co serwuje i w jakich łańcuchach",
        paragraphs: [
          "Helios domyślnie nasłuchuje na `127.0.0.1:8545`, co zmienia się przez `--rpc-port` i `--rpc-bind-ip`. Jest też dostępny jako biblioteka Rust i jako pakiet npm `@a16z/helios`, skompilowany do WebAssembly, którego provider wystawia w przeglądarce metodę `request` w stylu [[eip-1193|EIP-1193]]. Lista metod obejmuje odczyty stanu, wywołania i szacowanie gasu, bloki, transakcje, receipty, [[eth-get-logs|eth_getLogs]] i filtry, `eth_sendRawTransaction` oraz `eth_subscribe` tylko dla `newHeads`. Receipty sprawdza, pobierając pełną listę receiptów bloku i porównując ją z `receiptsRoot`, a bloki mieszczące się w 8191 hashach, które trzyma kontrakt historii z EIP-2935, da się przez ten kontrakt udowodnić.",
          "`helios ethereum` obsługuje mainnet i wymienione w dokumentacji testnety (sieci testowe), a `helios opstack --network op-mainnet` albo `base` oraz `helios linea` obsługują rollupy. Tryby rollupowe opierają się na innym źródle zaufania: w łańcuchach OP Stack Helios przyjmuje bloki podpisane przez unsafe-block signer łańcucha, czyli klucz [[sequencer|sekwencera]], którego adres może sprawdzić w konfiguracji systemu na L1. To dowodzi tego, co opublikował sekwencer, a nie tego, co rozliczyło Ethereum; opisuje to temat o [[optimistic-rollup|optimistic rollupach]]."
        ]
      },
      {
        heading: "Gdzie kończy się gwarancja",
        paragraphs: [
          "Niektóre odpowiedzi nie są faktami, które dowód może ustalić. `eth_gasPrice` to zweryfikowane base fee plus stały napiwek (tip) 1 gwei, a `eth_maxPriorityFeePerGas` to właśnie ta stała. `eth_sendRawTransaction` jest przekazywane do niezaufanego providera; Helios sprawdza, czy zwrócony hash pasuje do transakcji, ale nie widzi [[mempool|mempoola]] i nie może wymusić włączenia do bloku. Przestrzenie nazw spoza jego listy, takie jak [[debug-api|debug_]] i [[trace-api|trace_]], w ogóle nie są serwowane, zamiast być przekazywane bez weryfikacji, i taka porażka jest bezpieczniejsza.",
          "Logi to subtelny przypadek. Helios sprawdza, czy każdy log zwrócony przez providera występuje w udowodnionych receiptach jego bloku, co dowodzi włączenia; nie zagląda jednak do bloków, które provider pominął, więc provider może pominąć logi i nie zostać przyłapany. Wszystko opiera się też na bootstrapie: `--load-external-fallback`, który bierze najczęstszy checkpoint z listy endpointów prowadzonej przez społeczność, jest wygodny, ale oddaje tej liście wybór łańcucha. Do tego Helios weryfikuje na potrzeby procesu, który go uruchamia; inne hosty korzystające z niego przez sieć ufają jego operatorowi, jak w każdej konfiguracji [[verified-rpc|weryfikowanego RPC]]."
        ]
      }
    ],
    example: {
      title: "Helios przed niezaufanym providerem",
      note: "Za tym jednym wywołaniem Helios wysyła do providera eth_createAccessList po podpowiedź i eth_getProof dla każdego dotkniętego konta, a potem sam wykonuje wywołanie."
    },
    pitfalls: [
      "Traktowanie zweryfikowanego wyniku `eth_getLogs` jako kompletnego; Helios dowodzi, że zwrócone logi istnieją, a nie, że żadnego nie pominięto.",
      "Odczytywanie `eth_gasPrice` z Heliosa jako rynkowej estymacji, gdy jego składnik napiwku to stałe 1 gwei.",
      "Używanie `--load-external-fallback` jako zwykłego bootstrapu, przez co o łańcuchu decyduje checkpoint, na który zgodzą się endpointy z listy.",
      "Wybór providera wykonawczego, który nie ma `eth_getProof` albo nakłada na tę metodę rate limit, podczas gdy każdy zweryfikowany odczyt stanu staje się co najmniej jednym wywołaniem o dowód.",
      "Zakładanie, że tryb OP Stack ma bezpieczeństwo Ethereum; weryfikuje on podpis sekwencera na blokach unsafe."
    ]
  },
  "client-extensions": {
    title: "Rozszerzenia klientów",
    aliases: [
      "pluginy nethermind",
      "wtyczki klienta",
      "rozszerzenia wykonawcze",
      "tracing na żywo",
      "kod w procesie węzła",
      "exex w reth"
    ],
    summary: "Rozszerzenia klientów to kod działający wewnątrz procesu [[execution-client|klienta wykonawczego]], taki jak pluginy Nethermind, ExEx Retha czy live tracery Getha. Widzi on bloki, transakcje i zmiany stanu w chwili, gdy węzeł je wykonuje, zamiast pytać o nie później przez [[json-rpc|JSON-RPC]].",
    sections: [
      {
        heading: "Po co uruchamiać kod w węźle",
        paragraphs: [
          "[[indexer|Indekser]], który odpytuje [[eth-get-block-receipts|eth_getBlockReceipts]] i uruchamia tracer dla każdego bloku, płaci trzy razy: za serializację każdej odpowiedzi, za ponowne wykonanie przy każdym trace i za opóźnienie względem heada, które wynika z odpytywania. Diffy stanu i [[internal-transaction|transakcje wewnętrzne]] są dostępne przez RPC tylko dzięki tracerom, które wykonują blok jeszcze raz; zobacz [[execution-trace|trace wykonania]]. Wewnątrz klienta te same dane są produktem ubocznym jednokrotnego wykonania bloku: każda ramka wywołania, zapis do storage, zmiana salda i log przechodzą przez kod, który rozszerzenie może obserwować i zapisywać prosto do kolejki albo bazy danych. Tak powstaje wznawialny strumień danych z wykonania bez odpytywania, z którego [[firehose|Firehose]] zrobił produkt.",
          "Ceną jest wspólny los z węzłem. Rozszerzenie działa w procesie i pamięci węzła, pada razem z nim, a gdy się zablokuje, wstrzymuje import bloków, co w przypadku węzła zasilającego [[validator-node|węzeł walidatora]] kosztuje atestacje. Jest też związane z wewnętrznym API i cyklem wydań jednego klienta, więc każda aktualizacja oznacza przebudowanie. Dokumentacja Getha podaje praktyczną zasadę: kod w procesie ma być minimalny i tylko wyciągać surowe dane, a ciężkie przetwarzanie odbywa się później."
        ]
      },
      {
        heading: "Trzy mechanizmy",
        paragraphs: [
          "Pluginy [[nethermind|Nethermind]] to assembly .NET implementujące `INethermindPlugin`, ładowane przy starcie z katalogu `plugins` albo z `--plugins-dir`. W ten sposób zbudowana jest duża część samego Nethermind, w tym obsługa Optimism i Taiko oraz health checki. W 2.0 plugin dostarcza moduł Autofac, który może rejestrować kroki inicjalizacji, moduły JSON-RPC zadeklarowane jako interfejsy z atrybutem `RpcModule`, dekoratory wokół istniejących modułów oraz tracery bloków podpięte pod główne przetwarzanie bloków. Dołączony plugin TraceStore działa właśnie tak: zapisuje trace w stylu Parity podczas przetwarzania bloków i odpowiada na wywołania `trace_` z własnej bazy danych, bez stanu historycznego.",
          "ExEx [[reth|Retha]] to asynchroniczne zadanie instalowane przez node builder. Dostaje wartości `ExExNotification`: `ChainCommitted { new }`, `ChainReorged { old, new }` i `ChainReverted { old }`, z których każda niesie bloki, receipty i zmiany stanu jednego odcinka łańcucha. Odpowiada `ExExEvent::FinishedHeight`, wskazując najwyższy blok, który w pełni przetworzyło. Reth przycina (pruning) tylko te dane, z którymi skończyło już każde ExEx, a potem wysyła mu tylko powiadomienia powyżej tej wysokości. Powiadomienia są trzymane w write-ahead logu, a strumień uruchomiony od własnego heada ExEx uzupełnia braki, wykonując ponownie bloki aż do heada węzła.",
          "Live tracing [[geth|Getha]], dodany w v1.14, korzysta z interfejsu tracerów: tracer w Go wkompilowany w binarkę rejestruje się pod nazwą i zwraca `tracing.Hooks`, takie jak `OnBlockStart`, `OnTxStart`, `OnEnter`, `OnStorageChange`, `OnBalanceChange` i `OnLog`. Włącza się go przez `--vmtrace <name>` i `--vmtrace.jsonconfig`. Dołączony tracer `supply` zapisuje do plików JSONL emisję i spalanie etheru w każdym bloku. Hooki działają synchronicznie wewnątrz przetwarzania bloku. Firehose od StreamingFast używa zmodyfikowanego Getha uruchamianego z `--vmtrace=firehose`."
        ]
      },
      {
        heading: "Wznawianie i reorgi to zadanie konsumenta",
        paragraphs: [
          "Mechanizmy różnią się tym, ile przekazują rozszerzeniu. Reth dostarcza [[reorg|reorg]] jako jawny odcinek wycofany i odcinek zatwierdzony, a pruning wstrzymuje, dopóki ExEx nie potwierdzi postępu. Live tracer Getha po prostu dostaje bloki nowej gałęzi i zostawia cofanie zmian konsumentowi, który musi porównywać `parentHash` każdego bloku z tym, co już wyemitował. W każdym przypadku rozszerzenie po awarii musi znać ostatni blok, który trwale wyemitowało, zarówno po hashu, jak i po numerze, i wznowić od niego. Działa to tylko tak długo, jak węzeł nadal ma stan potrzebny do ponownego wykonania tych bloków.",
          "Dlatego lekcja o kliencie Reth ostrzega, że ExEx nie zastępuje indeksera: rozszerzenie to tylko wejście danych (ingest), a baza, którą zasila, nadal potrzebuje własnej obsługi reorgów, kursorów i kopii zapasowych. Wiąże też dane z jedną implementacją: indeks zbudowany wyłącznie z hooków jednego klienta dziedziczy jego błędy. To argument z [[client-diversity|różnorodności klientów]] zastosowany do pipeline'ów danych."
        ]
      }
    ],
    example: {
      title: "Co każdy klient przekazuje rozszerzeniu",
      note: "Tylko interfejs Retha jawnie przenosi reorgi i backpressure; w dwóch pozostałych rozszerzenie musi zbudować jedno i drugie samo."
    },
    pitfalls: [
      "Ciężkie dekodowanie albo synchroniczne zapisy do bazy wewnątrz live tracera lub pluginu, co wstrzymuje import bloków i opóźnia odpowiedź na `engine_newPayload`.",
      "ExEx, które nigdy nie wysyła `FinishedHeight`, przez co Reth nie przycina danych, których ExEx może jeszcze potrzebować, a dysk stale rośnie.",
      "Traktowanie strumienia z live tracera Getha jako odpornego na reorgi; raportuje on wszystkie bloki, które Geth przetwarza, i zostawia cofanie zmian konsumentowi.",
      "Zapisywanie punktu wznowienia jako samego numeru bloku; po reorgu ten sam numer oznacza inny blok.",
      "Aktualizacja klienta bez przebudowania rozszerzenia; na przykład Nethermind 2.0 zmienił typy właściwości konfiguracji i wymaga ponownej kompilacji pluginów."
    ]
  },
  "slashing-protection": {
    title: "Ochrona przed slashingiem",
    aliases: [
      "slashing protection",
      "ochrona przed slashingiem",
      "baza ochrony przed slashingiem",
      "slashing protection database",
      "EIP-3076",
      "interchange format",
      "format wymiany",
      "slashing protection interchange",
      "doppelganger protection",
      "signing_root",
      "low watermark"
    ],
    summary: "Ochrona przed slashingiem (slashing protection) to zapis, który [[validator-client|klient walidatora]] albo [[remote-signer|remote signer]] prowadzi o tym, co podpisał każdy klucz. Sprawdza się go przed każdym nowym podpisem, żeby klucz nigdy nie wytworzył sprzecznej pary podpisów, za którą walidator dostaje [[slashing|slashing]]. Między klientami przenosi się go w formacie wymiany EIP-3076 (interchange format).",
    sections: [
      {
        heading: "Trzy odmowy",
        paragraphs: [
          "[[validator|Walidator]] podpisuje blok, gdy go proponuje, oraz [[attestation|atestację]] raz na każdą [[slot-epoch|epokę]] (32 sloty, 6,4 minuty). Każda atestacja głosuje za połączeniem dwóch checkpointów, czyli bloków na granicach epok: od starszego, swojej epoki source, do nowszego, swojej epoki target. Trzy rodzaje podpisów kończą się [[slashing|slashingiem]] walidatora, czyli utratą części stake i wymuszonym wyjściem: drugi, inny blok dla slotu, w którym walidator już proponował; podwójny głos (double vote), czyli dwie różne atestacje z tą samą epoką target; oraz surround vote, czyli atestacja, której przedział od source do target ściśle zawiera przedział innej albo ściśle się w nim mieści. Na przykład po podpisaniu source 301 i target 302 głos od 300 do 303 otacza tamten głos.",
          "Łańcuch ocenia tylko podpisy, a nie intencje, dlatego przed każdym podpisem klient sprawdza historię klucza i albo w jednym kroku podpisuje wiadomość i ją zapisuje, albo odmawia. [[lighthouse|Lighthouse]] loguje odmowę jako `CRIT Not signing slashable attestation` i podaje powód, na przykład `DoubleVote`.",
          "Klienci przechowują historię na różne sposoby. Lighthouse zapisuje każdy blok i każdą atestację w pliku SQLite, `slashing_protection.sqlite`; [[teku|Teku]] trzyma jeden plik YAML na klucz w katalogu `slashprotection`; remote signer Web3Signer używa PostgreSQL. EIP-3076 nazywa dwa podejścia. Pełna baza (complete) trzyma każdą wiadomość i odmawia tylko tego, co dałoby slashing. Minimalna (minimal) trzyma tylko najnowszy slot i najnowsze epoki każdego klucza i odmawia każdego bloku w tym slocie lub niższym oraz każdej atestacji ze starszym source albo z targetem, który nie jest nowszy: to prostsze, ale czasem odmawia nieszkodliwego podpisu."
        ]
      },
      {
        heading: "Plik wymiany EIP-3076",
        paragraphs: [
          "Przeniesienie klucza między klientami oznacza przeniesienie jego historii, a EIP-3076 definiuje do tego format JSON. `metadata` zawiera `interchange_format_version`, czyli ciąg `5`, oraz `genesis_validators_root`, który identyfikuje łańcuch, więc historii z testnetu Hoodi nie da się zaimportować do signera na mainnecie. `data` zawiera dla każdego `pubkey` listy `signed_blocks` (każdy wpis z polem `slot`) i `signed_attestations` (każdy wpis z polami `source_epoch` i `target_epoch`), wszystko jako ciągi dziesiętne. `signing_root`, czyli hash, który faktycznie podpisano, jest w obu listach opcjonalny; dzięki niemu klient potrafi odróżnić nieszkodliwe powtórzenie tej samej wiadomości, na przykład ponowne rozgłoszenie, od konfliktu.",
          "Import ustawia też low watermarks (dolne progi), poniżej których klucz nic nie podpisze, bo plik może zawierać tylko minimalną historię, a importujący nie widzi, co podpisano przed jej wpisami. Potem klient odmawia każdego bloku w najniższym zaimportowanym slocie lub niższym, każdej atestacji z source poniżej najniższego zaimportowanego source i każdej z targetem równym najniższemu zaimportowanemu targetowi lub niższym, chyba że `signing_root` pokazuje, że to ponownie ta sama wiadomość. EIP-3076 zaleca, żeby eksport i import odbywały się przy zatrzymanym kliencie, tak by plik był kompletny i nic nie zostało podpisane w trakcie importu; takimi poleceniami są `lighthouse account validator slashing-protection export` i `teku slashing-protection import --from`."
        ]
      },
      {
        heading: "Przed czym nie chroni",
        paragraphs: [
          "Baza chroni tylko te podpisy, które przez nią przechodzą. Klasyczne incydenty przybierają dwie formy. Pierwsza to jeden klucz w dwóch procesach, z których każdy ma czystą historię, jak wtedy, gdy skrypt [[failover|failover]] uruchamia instancję zapasową, nie upewniwszy się najpierw, że główna została zatrzymana. Druga to jeden proces z nieaktualną historią, jak wtedy, gdy kopia zapasowa przywrócona sprzed ostatnich podpisów pozwala mu podpisać wiadomości sprzeczne z tamtymi podpisami. W lutym 2021 roku 75 walidatorów dostawcy usług stakingowych Staked zostało ukaranych slashingiem, po tym jak firma przestała zachowywać bazę ochrony swoich klientów walidatora między restartami, więc zrestartowani klienci wracali bez żadnej historii. Doppelganger protection, czyli oczekiwanie przy starcie, w którym klient nic nie podpisuje i obserwuje sieć, szukając głosów tego klucza (w Lighthouse przez dwie do trzech epok), wykrywa klucz, który już działa gdzie indziej, ale nie dwie kopie uruchomione jednocześnie.",
          "Konfiguracje zdalne i rozproszone przenoszą bazę w inne miejsce, a nie ją usuwają. Remote signer, taki jak Web3Signer, sprawdza każde żądanie we własnej bazie, więc kilka instancji Web3Signera z jednym kluczem jest bezpiecznych tylko wtedy, gdy współdzielą tę bazę. Keymanager API, standardowe API do zarządzania kluczami klienta walidatora, przenosi ten sam JSON: `POST /eth/v1/keystores` przyjmuje `slashing_protection` razem z kluczami, a `DELETE /eth/v1/keystores` musi wstrzymać podpisywanie tym kluczem, zanim zwróci historię. W [[distributed-validator|rozproszonym walidatorze]] działającym przez Charon klient walidatora każdego operatora chroni własny udział w kluczu (key share), a podpis prowadzący do slashingu wymaga, żeby sprzeczne dane podpisała progowa liczba udziałów."
        ]
      }
    ],
    example: {
      title: "Eksport EIP-3076 i to, czego potem odmawia klient, który go zaimportował",
      note: "`genesis_validators_root` należy do mainnetu; to właśnie signing rooty pozwalają nowemu klientowi ponownie podpisać identyczną wiadomość, a odmówić innej z tym samym targetem."
    },
    pitfalls: [
      "Importowanie keystore'ów do nowego klienta bez pliku wymiany, przez co klient zaczyna z pustą historią i nie ma czego odmawiać.",
      "Eksportowanie, gdy stary klient wciąż działa, przez co w pliku brakuje jego ostatnich podpisów, a nowy klient może podpisać dla tych samych obowiązków inne wiadomości.",
      "Odtwarzanie utraconej bazy flagą `--init-slashing-protection` w Lighthouse, gdy stary klient może jeszcze podpisywać, albo wcześniej niż epokę po jego zatrzymaniu.",
      "Zostawianie klucza w keystore'ach klienta walidatora po zarejestrowaniu go w remote signerze, przez co dwie bazy zatwierdzają każda swoją sprzeczną wiadomość."
    ]
  },
  hive: {
    title: "Hive",
    aliases: [
      "hive",
      "ethereum/hive",
      "hiveview",
      "rpc-compat",
      "symulator hive",
      "hive simulator",
      "testy integracyjne klientów",
      "client integration tests"
    ],
    summary: "Hive to środowisko testów integracyjnych klientów Ethereum: buduje każdego klienta jako obraz Dockera, uruchamia go z testowym blokiem [[genesis|genesis]] i łańcuchem, pozwala programom symulatorów sterować nim przez [[json-rpc|JSON-RPC]], [[engine-api|Engine API]] i [[devp2p|devp2p]] i zapisuje, które zachowania zgadzają się z oczekiwanymi wynikami.",
    sections: [
      {
        heading: "Klienci, symulatory i kontroler",
        paragraphs: [
          "[[execution-client|Klientów wykonawczych]] Ethereum piszą osobne zespoły, a wszyscy muszą się zgadzać co do joty: blok, który przyjmie jeden z nich, muszą przyjąć wszyscy pozostali, a odpowiedź na [[eth-get-block-by-number|eth_getBlockByNumber]] musi się parsować tak samo u każdego. Hive, program w Go pod adresem `github.com/ethereum/hive`, który steruje Dockerem, sprawdza to na wspólnych fixtures, czyli zapisanych danych wejściowych razem z oczekiwanymi wynikami. Definicja klienta to katalog w `clients/` z Dockerfile'em, który zwykle opakowuje obraz opublikowany przez zespół, i skryptem startowym (entry point). Przy starcie skrypt tłumaczy `/genesis.json`, czyli genesis w formacie Getha, na format danego klienta, importuje bloki zakodowane w RLP z `/chain.rlp`, a potem z `/blocks/`, i otwiera JSON-RPC na porcie 8545; gdy ten port się otworzy, hive uznaje klienta za gotowego.",
          "Ustawienia przychodzą jako zmienne środowiskowe `HIVE_`, a każdy build zapisuje swoją wersję w `/version.txt`. Symulator to program we własnym kontenerze, który zawiera logikę testów. Przez HTTP API pod adresem z `HIVE_SIMULATOR` prosi kontroler hive o uruchomienie klientów z podanymi plikami i zmiennymi, komunikuje się z nimi i raportuje kontrolerowi zestawy testów (suites) i przypadki testowe. `./hive --sim ethereum/sync --client go-ethereum,besu,nethermind` buduje symulator i trzy obrazy klientów, uruchamia go, a potem usuwa wszystkie kontenery; przyrostek taki jak `go-ethereum_v1.9.23` wybiera wersję."
        ]
      },
      {
        heading: "Symulatory",
        paragraphs: [
          "Symulatory warstwy wykonawczej obejmują każdy interfejs klienta. `devp2p` uruchamia zestawy eth, snap, discv4 i discv5 na porcie [[peer-to-peer|peer-to-peer]] klienta. `ethereum/engine` odgrywa rolę [[consensus-client|klienta konsensusu]] i prowadzi scenariusze Engine API, od budowania payloadu po uwierzytelnianie JWT. `ethereum/sync` sprawdza, czy każdy klient potrafi zsynchronizować łańcuch testowy od każdego innego. `ethereum/consensus` uruchamia klasyczne testy konsensusu w JSON, a rodzina `ethereum/eels/` uruchamia fixtures wygenerowane przez execution-specs, referencyjną implementację w Pythonie, na przykład `consume-rlp` do importu bloków i `consume-engine` do wysyłania ich przez Engine API.",
          "Dla konsumentów RPC najważniejszy jest `ethereum/rpc-compat`. Klonuje [[execution-apis|execution-apis]], buduje z niego dokument [[openrpc|OpenRPC]], uruchamia klienta na łańcuchu testowym ze specyfikacji i odtwarza każdy plik testowy `.io`, czyli linię żądania, a po niej dokładną oczekiwaną odpowiedź. Odpowiedzi są porównywane jako JSON, więc test nie przechodzi, gdy brakuje pola, jest pole nadmiarowe albo liczba jest inaczej zakodowana; testy oznaczone jako speconly, których wartości mogą się w uzasadniony sposób różnić między węzłami, sprawdza się zamiast tego względem schematu. 28 października 2026 roku zestaw liczył 273 testy. `ethereum/graphql` robi to samo dla endpointu GraphQL."
        ]
      },
      {
        heading: "Gdzie są wyniki i jak korzystają z nich zespoły",
        paragraphs: [
          "Każdy zestaw zapisuje w `./workspace/logs` plik wyników w JSON, a obok niego logi klientów; `hiveview` serwuje je w przeglądarce, jak pokazuje przykład. Publiczna instancja działa na GitHub Actions w `ethpandaops/hive-tests` i publikuje wyniki pod `hive.ethpandaops.io`: grupę mainnet w `/generic/` oraz grupy dla sieci testowych nadchodzących forków. Każde uruchomienie to jedna linia w `listing.jsonl` danej grupy, która podaje zestaw, build klienta, liczbę testów i porażki.",
          "Zespoły klientów uruchamiają hive we własnym CI, co widać po workflowach w repozytoriach Reth, Nethermind i Erigon, a publiczną porażkę odtwarzają lokalnie z `--sim.limit`, czyli wyrażeniem regularnym, którego część przed pierwszym ukośnikiem wybiera zestawy, a część po nim testy. README wymienia błędy znalezione w ten sposób, od błędów konsensusu po kształty odpowiedzi RPC, na przykład to, że Besu nie traktował pustej listy topics jako wildcarda. Hive uzupełnia [[kurtosis|Kurtosis]]: Kurtosis uruchamia żywą sieć wielu klientów z prawdziwym konsensusem, a hive testuje jedno zachowanie naraz względem znanej odpowiedzi."
        ]
      },
      {
        heading: "Czego nie mówi zielony wynik",
        paragraphs: [
          "Hive sprawdza zachowanie, a nie wydajność. Poza timeoutami, takimi jak domyślne trzy minuty, które klient ma na otwarcie portu 8545, nic nie jest mierzone: poprawna odpowiedź po dwóch sekundach przechodzi tak samo jak po dwóch milisekundach. Łańcuchy są malutkie, około 60 bloków w testach RPC, więc głębokość archiwum, pruning, [[receipt-retention|retencja]], stan wielkości mainnetu i limity gasu dla wywołań (gas cap) nigdy nie są sprawdzane. Nie odtwarza się też niczego spoza execution-apis, w tym [[trace-api|przestrzeni nazw trace_]] i nazwanych tracerów [[debug-api|debug_]].",
          "Wynik opisuje też jeden build w jednej konfiguracji. Publiczne uruchomienia rpc-compat z 28 października 2026 roku testowały niewydane buildy, takie jak `Geth/v1.17.11-unstable` i Erigon `3.9.0-dev`, a żadne uruchomienie nie obejmuje [[namespaces|przestrzeni nazw]], limitów ani proxy, które dokłada [[rpc-provider|dostawca RPC]]. Porażka też nie zawsze jest winą klienta: błędny fixture oblewa od razu wszystkich klientów, jak było z pierwszym fixture'em dla [[eth-capabilities|eth_capabilities]], więc czerwoną komórkę czyta się razem z jej diffem i historią fixture'u."
        ]
      }
    ],
    example: {
      title: "Uruchomienie zestawu testów zgodności RPC i odczyt wyniku",
      note: "Podana wersja to niestabilny build z dnia uruchomienia, a cały zestaw trwał sześć sekund, bo łańcuch, na którym działa, ma około 60 bloków; przejście testów mówi, że zgadzają się kształty odpowiedzi, a nie, że endpoint na mainnecie zachowuje się tak samo."
    },
    pitfalls: [
      "Traktowanie przejścia całego rpc-compat jako dowodu, że endpoint spełnia specyfikację, choć limity i retencja tego endpointu nie są testowane.",
      "Porównywanie publicznych wyników z wersją, którą się uruchamia, choć publiczna instancja testuje buildy deweloperskie.",
      "Obwinianie klienta za czerwony test przed przeczytaniem fixture'u, choć błędna oczekiwana odpowiedź oblewa wszystkich klientów.",
      "Oczekiwanie, że rpc-compat pokryje `trace_` albo `callTracer`, choć odtwarza tylko metody z execution-apis."
    ]
  }
};
