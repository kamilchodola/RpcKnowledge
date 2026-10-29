// Polish checkpoint questions for the Clients lessons, keyed by topic id. Each topic's
// six questions match data/quizzes/clients.js in order, kind, and answer position.
export const quizzes = {
  "execution-client": [
    {
      kind: "detail",
      question: "Co po Merge mówi klientowi wykonawczemu, który blok jest head łańcucha?",
      options: [
        "Sparowany klient konsensusu, wywołując engine_forkchoiceUpdated",
        "Własne porównanie total difficulty gałęzi w kliencie wykonawczym",
        "Pierwszy blok ogłoszony przez peera devp2p na danej wysokości",
        "Tag bloku, który każdy wywołujący RPC przekazuje do eth_getBlockByNumber"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Dwóch klientów wykonawczych importuje ten sam blok i oblicza różne wartości stateRoot. Co to oznacza?",
      options: [
        "Jeden z nich ma błąd konsensusu i sieci grozi rozszczepienie",
        "State rooty zależą od implementacji; zgadzać się muszą tylko receipty",
        "Jeden z nich ma włączony pruning, więc oblicza krótsze trie",
        "Używają różnych trybów synchronizacji, a ich rooty zbiegną się po jej końcu"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Usługa wywołuje trace_block. Główny endpoint odpowiada, a zapasowy zwraca method not found. Co to wyjaśnia?",
      options: [
        "trace_ to opcjonalny dodatek w stylu Parity, którego część klientów nie ma",
        "trace_block wypadło ze standardowej specyfikacji przy Merge i jest przestarzałe",
        "Zapasowy węzeł wciąż się synchronizuje, a klienci do tego czasu ukrywają tracing",
        "Metody trace_ działają przez WebSocket na porcie 8546, a nie przez HTTP"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego port 8551 klienta wykonawczego musi być nieosiągalny z internetu?",
      options: [
        "Jego JWT to jedyne, co dzieli wywołującego od fork choice węzła",
        "Udostępnia zakresy snap z devp2p, więc obcy pobierają stan za darmo",
        "To listener WebSocket, a otwarte subskrypcje wyczerpują pamięć węzła",
        "Domyślnie działa na nim admin_, przez co każdy może dodawać i usuwać peery"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Które obliczone wartości klient wykonawczy porównuje z nagłówkiem po ponownym wykonaniu wszystkich transakcji przychodzącego bloku?",
      options: [
        "stateRoot, receiptsRoot i gasUsed",
        "stateRoot, parentHash i difficulty",
        "gasLimit, feeRecipient i extraData",
        "receiptsRoot, prevRandao i timestamp"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Klient wykonawczy jest w pełni zsynchronizowany, gdy jego sparowany klient konsensusu ulega awarii. Co widzi wywołujący RPC?",
      options: [
        "eth_blockNumber przestaje rosnąć, a eth_syncing może nadal zwracać false",
        "eth_blockNumber dalej rośnie, bo peery devp2p wciąż ogłaszają bloki",
        "eth_syncing zwraca true, dopóki klient konsensusu nie połączy się ponownie",
        "Każde żądanie eth_ kończy się błędem uwierzytelnienia Engine API"
      ],
      answer: 0
    }
  ],
  geth: [
    {
      kind: "cause",
      question: "Węzeł Geth z domyślną konfiguracją zwraca null z eth_getTransactionReceipt dla transakcji sprzed czterech lat, choć eth_getBlockByNumber wciąż zwraca jej blok. Dlaczego?",
      options: [
        "Indeks wyszukiwania transakcji obejmuje tylko okno z --history.transactions",
        "Receipty są przeliczane na żądanie, a dla tak starych bloków to się nie udaje",
        "Węzeł nie jest archiwalny, więc stare receipty usunął pruning",
        "Geth usuwa receipty, gdy ich blok trafia do plików freezer"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Geth odpowiada: the method trace_block does not exist/is not available. Jak zdobyć ten trace?",
      options: [
        "Użyć tracerów debug_ albo innego klienta; Geth nie ma implementacji trace_",
        "Dodać trace do --http.api, bo Geth odrzuca niewymienione przestrzenie nazw",
        "Zrestartować z --gcmode archive, żeby tracer miał stary stan do odtworzenia",
        "Połączyć się przez WebSocket, gdzie Geth serwuje trace_"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Które ustawienie Getha decyduje o tym, czy eth_call da się wykonać na dowolnym bloku historycznym?",
      options: [
        "--gcmode archive, które trzyma stan poza niedawnym oknem",
        "--history.transactions 0, które trzyma pełny indeks transakcji",
        "--syncmode full, które wykonuje cały łańcuch od nowa od genesis",
        "--rpc.gascap 0, które znosi limit gasu dla symulowanych wywołań"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Jak daleko wstecz sięgają w domyślnie skonfigurowanym węźle Geth historyczny stan i indeks wyszukiwania transakcji?",
      options: [
        "Stan około 128 bloków, indeks transakcji około roku",
        "Stan około roku, indeks transakcji około 128 bloków",
        "Jedno i drugie około roku, czyli okno freezera",
        "Stan do genesis dzięki freezerowi, indeks około 128 bloków"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Geth stoi za reverse proxy pod nową nazwą hosta i każde żądanie dostaje teraz gołe 403 bez body JSON-RPC. Czego brakuje?",
      options: [
        "Tej nazwy hosta w --http.vhosts",
        "Tej nazwy hosta w --http.addr",
        "Tokenu bearer podpisanego --authrpc.jwtsecret",
        "Przestrzeni nazw eth i net w --http.api"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator dodaje debug do --http.api na porcie Getha osiągalnym z internetu. Na czym polega zagrożenie?",
      options: [
        "Kilka wywołań debug_traceBlockByNumber może wyczerpać CPU węzła",
        "Metody debug_ ujawniają sekret JWT używany przez Engine API",
        "Włączenie debug_ wystawia też metody Engine API na porcie 8545",
        "Włączenie debug_ znosi limit --rpc.gascap dla wszystkich"
      ],
      answer: 0
    }
  ],
  nethermind: [
    {
      kind: "scenario",
      question: "Zsynchronizowany węzeł archiwalny Nethermind, uruchomiony z jawną listą modułów, odpowiada na trace_replayBlockTransactions błędem method not found. Co jest przyczyną?",
      options: [
        "Brak Trace w --JsonRpc.EnabledModules",
        "Nethermind ma tylko tracing debug_ w stylu Getha",
        "Replay tracing wymaga najpierw wyłączenia portu Engine API",
        "Receipty do odtworzenia usunął pruning"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co na węźle Nethermind z bazą patricia odróżnia full pruning od pruningu w pamięci?",
      options: [
        "Kopiuje stan osiągalny z rootu do świeżej bazy danych",
        "Trzyma niedawne trie node'y w cache i zapisuje tylko te, które przetrwały",
        "Usuwa body i receipty starsze niż bariery starej historii",
        "Wymaga zatrzymania węzła, w przeciwieństwie do pruningu w pamięci"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Węzeł Nethermind 1.39 z bazą half-path patricia zostaje zaktualizowany na miejscu do 2.0. Na jakim backendzie stanu działa potem?",
      options: [
        "Na patricia, bo istniejąca baza zostaje wykryta i zachowana",
        "Na flat, po migracji na miejscu przy pierwszym starcie",
        "Na flat, po pełnej ponownej synchronizacji wymuszonej przez aktualizację",
        "Na magazynie Paprika, który zastąpił trie half-path"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Dapp otwiera ws://127.0.0.1:8546 do węzła Nethermind z domyślnymi portami i połączenie zostaje odrzucone. Co się dzieje?",
      options: [
        "Nethermind domyślnie serwuje WebSocket na porcie JSON-RPC, 8545",
        "WebSocket jest wyłączony, dopóki Subscribe nie trafi do włączonych modułów",
        "Nethermind serwuje WebSocket tylko na porcie Engine API, 8551",
        "WebSocket wymaga --JsonRpc.JwtSecretFile, zanim przyjmie klienta"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Świeży węzeł Nethermind 2.0 na domyślnym backendzie ma ustawione Pruning.Mode=Hybrid i wyzwalacz full pruningu. Co się dzieje, gdy wyzwalacz zadziała?",
      options: [
        "Nic nie zostaje przycięte, a admin_prune zgłasza wyłączony pruning",
        "Stan zostaje skopiowany do nowej bazy, a stara zostaje usunięta",
        "Przetwarzanie bloków staje, dopóki przepisana baza nie będzie gotowa",
        "Płaska historia starsza niż okno retencji zostaje zwolniona z dysku"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Operator, którego skrypt startowy przekazuje kilka flag, zmienia JsonRpc.Port w pliku konfiguracyjnym JSON Nethermind i restartuje węzeł, ale port się nie zmienia. Dlaczego?",
      options: [
        "Flaga --JsonRpc.Port w wierszu poleceń nadpisuje plik",
        "Preset --config mainnet blokuje port",
        "Zmiany portu działają dopiero po tym, jak full pruning przepisze bazę",
        "Plik jest czytany tylko przy pierwszym starcie nowego katalogu danych"
      ],
      answer: 0
    }
  ],
  erigon: [
    {
      kind: "scenario",
      question: "Trzeba przeglądać historię transakcji adresu w Erigonie wstecz, strona po stronie. Która przestrzeń nazw i metoda to obsługują?",
      options: [
        "ots_, przez ots_searchTransactionsBefore",
        "erigon_, przez erigon_getBlockByTimestamp",
        "eth_, przez eth_getLogs filtrowane po adresie",
        "debug_, przez debug_traceBlockByNumber"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego wdrożenie Erigona może zrestartować warstwę RPC bez przerywania synchronizacji?",
      options: [
        "RPC to osobny rpcdaemon, który łączy się z węzłem przez prywatne gRPC",
        "Erigon odkłada przychodzące żądania na dysk, aż proces RPC wróci",
        "Engine API serwuje metody eth_, gdy warstwa RPC nie działa",
        "Synchronizacja sama się wstrzymuje, gdy listener RPC się zamyka, i potem wznawia"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Węzeł archiwalny Erigona odpowiada na eth_call na bloku 5 000 000, ale nie potrafi wygenerować tam eth_getProof. Co to wyjaśnia?",
      options: [
        "Płaska baza trzyma stare wartości, ale nie trie node'y do dowodu",
        "Specyfikacja definiuje eth_getProof tylko dla najnowszego bloku",
        "Przestrzeni nazw dowodów nie dodano do allowlisty --http.api",
        "Tryb archiwalny trzyma dowody tylko dla bloków po Merge"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Węzeł Erigon działa z domyślnym --prune.mode=full. Co się dzieje z eth_call na bloku sprzed sześciu miesięcy?",
      options: [
        "Kończy się błędem, bo full trzyma około 36 dni historii stanu",
        "Udaje się, bo full trzyma rok historii stanu",
        "Udaje się, bo płaskie zbiory zmian obejmują każdy blok",
        "Kończy się błędem, bo Erigon serwuje stan tylko na bloku head"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co zmienia flaga --externalcl w nowszym węźle Erigon?",
      options: [
        "Zamienia wbudowany Caplin na samodzielnego klienta konsensusu",
        "Przenosi rpcdaemon do osobnego procesu osiąganego przez gRPC",
        "Umieszcza zbiory zmian historii na zewnętrznym, wolniejszym dysku",
        "Pozwala zewnętrznej instancji Otterscana dotrzeć do przestrzeni ots_"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co odróżnia przechowywanie stanu w Erigonie od bazy trie node'ów kluczowanych hashami?",
      options: [
        "Płaskie rekordy kont i slotów, a trie node'y są wyliczane na żądanie",
        "Trie node'y kluczowane ścieżką, z jedną bieżącą kopią na pozycję w trie",
        "Stan w plikach statycznych typu append-only, nigdy nieprzepisywanych",
        "Pełne trie dla każdego bloku, deduplikowane przez hashowanie identycznych węzłów"
      ],
      answer: 0
    }
  ],
  reth: [
    {
      kind: "scenario",
      question: "Dysk dobrano pod pełny węzeł, a reth node uruchomiono bez flag retencji. Zajętość dysku rośnie daleko ponad szacunki. Co się stało?",
      options: [
        "Bez --full Reth działa jako węzeł archiwalny",
        "Static files nigdy nie są kompresowane",
        "Powiadomienia ExEx czekają na dysku, aż ktoś je odbierze",
        "Pipeline trzyma drugą kopię stanu do końca synchronizacji"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co Execution Extension daje indekserowi ponad to, co oferuje odpytywanie eth_getLogs przez HTTP?",
      options: [
        "Powiadomienia wewnątrz procesu o zatwierdzonych i wycofanych odcinkach łańcucha",
        "Dowód Merkle dołączony do każdej zmiany stanu, którą przekazuje węzeł",
        "Dostęp do historycznego stanu nawet na węźle uruchomionym z --full",
        "Gwarancję, że reorgi nie ruszą danych, które indekser już odebrał"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co przy synchronizacji od zera łączy podejście Retha z podejściem Erigona?",
      options: [
        "Etapowy pipeline zamiast importu blok po bloku",
        "Niedawny snapshot stanu pobrany od peerów, a potem healing trie",
        "Klient konsensusu dostarczany w tej samej binarce co warstwa wykonawcza",
        "Import blok po bloku sterowany kolejnymi wywołaniami engine_newPayload"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator dodaje --full do istniejącego węzła archiwalnego Reth. Co dzieje się z eth_call na starych blokach?",
      options: [
        "Przestaje działać poza zachowywanym oknem",
        "Działa dalej aż do ponownej synchronizacji",
        "Działa dalej dla każdego bloku sprzed dodania --full",
        "Zwalnia, bo stary stan jest odbudowywany ze static files"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Indekser zbudowany jako ExEx działa wewnątrz węzła Reth. Co się z nim dzieje, gdy węzeł się restartuje?",
      options: [
        "Zatrzymuje się razem z węzłem i po restarcie musi odtworzyć powiadomienia",
        "Działa dalej samodzielnie i w tym czasie nadrabia zaległości przez HTTP",
        "Traci swój indeks i zaczyna od nowa od bloku genesis",
        "Przechodzi na odpytywanie eth_getLogs, dopóki węzeł nie wróci"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego Reth trzyma nagłówki, body i receipty w static files, a stan w MDBX?",
      options: [
        "Historia jest tylko dopisywana, a stan zmienia się w każdym bloku",
        "Stan trzeba zhashować do trie, a static files nie da się hashować",
        "Tylko MDBX obsługuje równoległe odczyty, których historia nie potrzebuje",
        "Historię da się w całości zmapować do pamięci, a stanu nie"
      ],
      answer: 0
    }
  ],
  besu: [
    {
      kind: "scenario",
      question: "Węzeł Besu odpowiada na poprawne wywołanie eth_blockNumber, wysłane przez reverse proxy, kodem HTTP 403 i zwykłym tekstem w body zamiast błędu JSON-RPC. Co jest nie tak?",
      options: [
        "W --host-allowlist brakuje nazwy hosta proxy",
        "W --rpc-http-api nie ma ETH",
        "Sekret JWT Engine API nie zgadza się z sekretem proxy",
        "Węzeł wciąż się synchronizuje i odrzuca metody odczytu"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co domyślny format przechowywania Bonsai w Besu trzyma na dysku?",
      options: [
        "Płaskie konta i sloty z logami trie do cofania niedawnych bloków",
        "Klasyczne trie z węzłami pod hashami, które zachowuje każdą starą wersję",
        "Trie node'y kluczowane ścieżką, z domyślnie pełną historią archiwalną",
        "Magazyn uprawnień dla prywatnych sieci QBFT i IBFT 2.0"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego wywołujący może użyć endpointu GraphQL w Besu, włączanego przez --graphql-http-enabled=true, zamiast JSON-RPC?",
      options: [
        "Jedno zapytanie pobiera blok z transakcjami i logami",
        "Zwraca wyniki trace_, których API JSON-RPC Besu nie może zwrócić",
        "Jest uwierzytelniany, w przeciwieństwie do publicznego listenera na 8545",
        "Serwuje historyczny stan, który Bonsai usunął z JSON-RPC"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co odróżnia linię poleceń RPC Besu od linii poleceń Getha?",
      options: [
        "Besu łączy nazwę z wartością znakiem = i pisze nazwy API wielkimi literami",
        "Besu przyjmuje nazwy API jako listę w nawiasach o mieszanej wielkości liter, jak [Eth,Net,Web3]",
        "Besu poprzedza każdą opcję RPC prefiksem --JsonRpc. i nazwą modułu",
        "Besu używa opcji z kropkami w camelCase, takich jak --rpc.httpApi"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Wywołujący uruchamia eth_call na bloku z zeszłego roku na węźle Besu z domyślnym przechowywaniem Bonsai. Co się dzieje?",
      options: [
        "Nie działa, bo Bonsai trzyma tylko ograniczone okno starego stanu",
        "Udaje się, bo logi trie pozwalają Bonsai cofnąć się dowolnie daleko",
        "Udaje się z opóźnieniem, gdy Forest odbudowuje stare trie",
        "Odpowiada na nie GraphQL na porcie 8547"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Klient konsensusu przenosi się do innego kontenera i łączy się teraz z Besu przez nazwę DNS kontenera. Plik JWT się nie zmienił, HTTP RPC dalej działa, a mimo to jego wywołania Engine API są odrzucane. O czym zapomniano?",
      options: [
        "O tej nazwie w --engine-host-allowlist",
        "O tej nazwie w --host-allowlist",
        "O wpisie ENGINE w --rpc-http-api",
        "O adresie kontenera w --rpc-http-host"
      ],
      answer: 0
    }
  ],
  "consensus-client": [
    {
      kind: "detail",
      question: "Skąd biorą się tagi bloków safe i finalized, które udostępnia klient wykonawczy?",
      options: [
        "Klient konsensusu wysyła je w engine_forkchoiceUpdated",
        "Klient wykonawczy wylicza je z głębokości każdego bloku pod head",
        "Wynikają z total difficulty na każdej wysokości",
        "Wywołujący RPC podaje je w parametrze bloku każdego żądania"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Beacon node zgłasza is_syncing false i is_optimistic true. Co to oznacza?",
      options: [
        "Śledzi head, ale payloady za nim nie zostały jeszcze wykonane",
        "Zakończył synchronizację i jest dość zdrowy, by obsługiwać walidatorów",
        "Synchronizuje się od checkpointu i wkrótce dojdzie do head",
        "Jego klient wykonawczy jest zsynchronizowany, a Beacon Chain jest w tyle"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Aplikacja przez pomyłkę wysyła eth_getBalance na port HTTP beacon node. Co wraca?",
      options: [
        "Kod 404 z routera REST, a nie błąd JSON-RPC",
        "Błąd JSON-RPC method not found z kodem -32601",
        "Saldo, odczytane zamiast tego z rejestru walidatorów",
        "Przekierowanie na port JSON-RPC 8545 klienta wykonawczego"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym kodowanie danych i stos peer-to-peer klienta konsensusu różnią się od tych w kliencie wykonawczym?",
      options: [
        "SSZ i libp2p, podczas gdy strona wykonawcza używa RLP i devp2p",
        "RLP i libp2p, podczas gdy strona wykonawcza używa SSZ i devp2p",
        "SSZ i devp2p, na wspólnym z klientem wykonawczym porcie 30303",
        "RLP i gRPC, z peerami wykrywanymi przez Engine API"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Health check sprawdza port 5052 na beacon node'ach z Lighthouse, Prysm, Teku, Nimbus i Lodestar. Których klientów nie trafi na ich domyślnym porcie Beacon API?",
      options: ["Prysm, Teku i Lodestar", "Teku, Nimbus i Lodestar", "Prysm, Nimbus i Lighthouse", "Teku i Nimbus"],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego, poza szybkością, nowe węzły konsensusu zwykle startują z checkpoint sync, zamiast odtwarzać łańcuch od genesis?",
      options: [
        "Start z niedawnego sfinalizowanego stanu spełnia wymóg weak subjectivity",
        "Odtwarzanie od genesis wymaga archiwalnej historii klienta wykonawczego",
        "Beacon API odrzuca żądania stanu od węzłów, które zaczęły od genesis",
        "Węzły startujące od genesis nie mogą wywoływać engine_forkchoiceUpdated"
      ],
      answer: 0
    }
  ],
  lighthouse: [
    {
      kind: "scenario",
      question: "Beacon node Lighthouse synchronizuje się i atestuje, ale curl na port 5052 dostaje odmowę połączenia. Czego brakuje?",
      options: [
        "Flagi --http, która włącza listener Beacon API",
        "Flagi --metrics, która uruchamia REST API razem z metrykami",
        "Flagi --checkpoint-sync-url, która przy okazji otwiera API",
        "Klienta walidatora, który pośredniczy w API beacon node'a"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Co daje klientowi walidatora Lighthouse podanie kilku URL-i w --beacon-nodes?",
      options: [
        "Walidator dalej podpisuje, gdy jeden z beacon node'ów padnie",
        "Klucze są rozdzielone między podane węzły, więc żaden nie ma wszystkich",
        "Obowiązki są wykonywane na każdym węźle i powstaje kilka atestacji",
        "Jedną wspólną bazę ochrony przed slashingiem"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co robi --builder-proposals w kliencie walidatora Lighthouse?",
      options: [
        "Włącza budowanie bloków przez MEV-Boost dla jego propozycji",
        "Rozkłada propozycje na kilka beacon node'ów",
        "Podpisuje propozycje przez zewnętrzny signer, taki jak Web3Signer",
        "Podnosi limit gasu bloków budowanych przez jego klienta wykonawczego"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Operator podaje w --execution-endpoint Lighthouse'a URL klienta wykonawczego z portem 8545. Co jest nie tak?",
      options: [
        "Beacon node potrzebuje uwierzytelnianego Engine API na 8551",
        "Beacon node potrzebuje portu WebSocket 8546 do payloadów",
        "Lighthouse pobiera payloady z portu devp2p 30303",
        "Lighthouse czyta ten endpoint z --beacon-nodes, a nie z tej flagi"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co --enable-doppelganger-protection każe robić walidatorowi Lighthouse?",
      options: [
        "Odczekać parę epok przed podpisywaniem i wypatrywać własnego duplikatu",
        "Odmówić startu, jeśli inny klient zaimportował ten sam plik keystore",
        "Współdzielić bazę ochrony przed slashingiem z innymi klientami walidatora",
        "Podpisywać każdy komunikat dwa razy i porównywać, żeby wyłapać wadliwy klucz"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym gorąca baza beacon node'a Lighthouse różni się od zimnej?",
      options: [
        "Gorąca trzyma niedawne sloty, a zimna, czyli freezer, starsze",
        "Gorąca trzyma klucze walidatorów, a zimna stany beacon łańcucha",
        "Gorąca jest w pamięci, a zimna na dysku",
        "Gorąca obsługuje Beacon API, a zimna klienta walidatora"
      ],
      answer: 0
    }
  ],
  prysm: [
    {
      kind: "detail",
      question: "Który port Prysma odpowiada na standardowe żądanie Beacon API, na przykład GET /eth/v1/node/syncing?",
      options: ["3500, port REST API", "4000, port API gRPC", "5052, jak u innych", "8551, wspólny z Engine API"],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego Prysm wystawia dwa porty API, a Lighthouse jeden?",
      options: [
        "Jego natywne API to gRPC, a standardowe REST API jest udostępniane osobno",
        "Jeden port obsługuje klientów walidatora, a drugi klienta wykonawczego",
        "Jeden port zwraca body w JSON, a drugi body zakodowane w SSZ",
        "Drugi port to replika tylko do odczytu, przeznaczona do load balancingu"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Klient walidatora Teku skierowany na beacon node Prysma na porcie 4000 nie może pobrać swoich obowiązków. Dlaczego?",
      options: [
        "Port 4000 obsługuje gRPC, a nie standardowe Beacon API",
        "Port 4000 wymaga --accept-terms-of-use po stronie walidatora",
        "Port 4000 to port libp2p Prysma",
        "Port 4000 wymaga sekretu JWT wspólnego z Engine API"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym w kliencie walidatora Prysma flaga --beacon-rpc-provider różni się od --beacon-rest-api-provider?",
      options: [
        "Pierwsza używa API gRPC Prysma, druga standardowego REST API",
        "Pierwsza łączy się z klientem wykonawczym, druga z beacon node'em",
        "Pierwsza jest dla mainnetu, druga dla testnetów, takich jak Hoodi",
        "Pierwsza pobiera obowiązki, druga publikuje podpisane komunikaty"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Zgodnie z ogólnym poradnikiem operator otwiera w firewallu tylko port 9000 dla beacon node'a Prysm z domyślną konfiguracją. Co z tego wynika?",
      options: [
        "Peery nie połączą się z zewnątrz; Prysm słucha na TCP 13000 i UDP 12000",
        "Wszystko działa, bo Prysm używa 9000 jak pozostali",
        "Walidatorzy nie wykonują obowiązków, bo 9000 to port API gRPC Prysma",
        "Zamiast portu dla peerów wystawione zostaje REST API na 3500"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Skrypt startowy przeniesiony z innego klienta konsensusu pomija jedną flagę, której tylko Prysm wymaga przy każdym starcie. Którą?",
      options: ["--accept-terms-of-use", "--checkpoint-sync-url", "--execution-endpoint", "--beacon-rpc-provider"],
      answer: 0
    }
  ],
  teku: [
    {
      kind: "detail",
      question: "Na którym porcie węzeł Teku z domyślnymi ustawieniami odpowiada na wywołania Beacon API po ustawieniu --rest-api-enabled=true?",
      options: ["5051", "5052", "3500", "9596"],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Co zmienia --data-storage-mode=ARCHIVE dla beacon node'a Teku?",
      options: [
        "Zachowuje historyczne stany beacon, więc można pytać o stare sloty",
        "Zachowuje body i receipty każdego bloku wykonawczego, który widział węzeł",
        "Wyłącza pruning sidecarów blobów po upływie okresu retencji",
        "Trzyma drugą pełną kopię bazy do odtwarzania po awarii"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Operator stakingu chce, żeby klucze podpisujące walidatora Teku nigdy nie leżały obok klienta walidatora. Jaka konfiguracja to zapewnia?",
      options: [
        "Web3Signer podpisuje w jego imieniu przez --validators-external-signer-url",
        "Klucze są szyfrowane sekretem JWT wspólnym z klientem wykonawczym",
        "Klucze leżą w bazie danych beacon node'a",
        "Klucze są potrzebne tylko przy depozycie, a potem się je usuwa"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Żądanie dociera do REST API Teku przez reverse proxy pod nową nazwą hosta i zostaje odrzucone, zanim zadziała jakikolwiek handler. Co trzeba zmienić?",
      options: [
        "Dodać tę nazwę do --rest-api-host-allowlist",
        "Ustawić na nią --rest-api-interface",
        "Dać proxy token z --ee-jwt-secret-file",
        "Włączyć --rest-api-enabled=true dla wywołań przez proxy"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego operatorzy Teku ustawiają rozmiar heapu JVM jawnie, zamiast ufać domyślnym ustawieniom kontenera?",
      options: [
        "Pamięć zajmuje głównie cache stanów, a domyślne ustawienia źle to szacują",
        "Każdy klucz walidatora trzymany w procesie rezerwuje stały kawałek heapu",
        "Sidecary blobów leżą na heapie przez całe 18-dniowe okno",
        "JVM ogranicza heap do 1 GB, jeśli nie poda się rozmiaru przy starcie"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym uruchomienie Teku z --validator-keys różni się od osobnego procesu teku validator-client?",
      options: [
        "Klucze ładują się do procesu samego beacon node'a, a nie do osobnego",
        "Klucze zostają zaszyfrowane na dysku, zamiast trafić do pamięci",
        "Podpisywanie przechodzi do Web3Signera",
        "Klucze są współdzielone z każdym beacon node'em z listy failover"
      ],
      answer: 0
    }
  ],
  nimbus: [
    {
      kind: "scenario",
      question: "Zdrowy, zsynchronizowany beacon node Nimbus odrzuca połączenie curl na http://127.0.0.1:5052/eth/v1/node/syncing. Dlaczego?",
      options: [
        "Nimbus udostępnia REST API tylko po podaniu --rest",
        "Nimbus udostępnia API na porcie 5051",
        "Węzeł musi zakończyć trustedNodeSync, zanim API się otworzy",
        "REST jest dostępne tylko dla klienta walidatora na tym samym hoście"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jak operator Nimbusa uruchamia węzeł od niedawnego sfinalizowanego stanu zamiast od genesis?",
      options: [
        "Raz uruchamia podkomendę trustedNodeSync, a potem startuje węzeł",
        "Podaje --checkpoint-sync-url przy każdym starcie",
        "Kopiuje bazę klienta wykonawczego i wyprowadza z niej stan",
        "Startuje z --rest i pozwala klientowi walidatora dostarczyć checkpoint"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co Nimbus verified proxy robi dla aplikacji?",
      options: [
        "Odpowiada na część metod eth_, sprawdzając wyniki względem nagłówków lekkiego klienta",
        "Przekazuje wywołania Engine API między klientem beacon a wykonawczym",
        "Cache'uje odpowiedzi Beacon API, żeby małe maszyny obsłużyły więcej wywołujących",
        "Podpisuje obowiązki walidatora w imieniu zdalnego beacon node'a"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Jak nimbus_beacon_node ma się do projektu klienta wykonawczego Nimbus?",
      options: [
        "To osobne projekty; nimbus_beacon_node obsługuje tylko stronę konsensusu",
        "nimbus_beacon_node ma go wbudowanego, tak jak Erigon ma wbudowany Caplin",
        "Klient wykonawczy to tryb włączany jedną flagą przy starcie",
        "Mają wspólną bazę danych i katalog danych"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego Nimbus to zwykły wybór klienta konsensusu na komputerach jednopłytkowych i małych instancjach w chmurze?",
      options: [
        "Jego kod jest zoptymalizowany pod niskie zużycie pamięci i CPU",
        "Pomija agregację atestacji",
        "Polega na lekkim kliencie zamiast na pełnej walidacji",
        "Przenosi stan beacon do bazy klienta wykonawczego"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator kieruje endpoint wykonawczy beacon node'a Nimbus na port 8545 klienta wykonawczego. Co idzie nie tak?",
      options: [
        "Węzeł potrzebuje zamiast tego Engine API z uwierzytelnianiem JWT na 8551",
        "Nimbus potrzebuje listenera WebSocket na 8546 do wywołań z payloadami",
        "Nimbus łączy się z klientem wykonawczym przez IPC, a nie przez port",
        "Działa, bo Nimbus przechodzi na 8545, gdy 8551 jest zajęty"
      ],
      answer: 0
    }
  ],
  lodestar: [
    {
      kind: "scenario",
      question: "Konfiguracja walidatora skopiowana z setupu Lighthouse wskazuje 5052, ale beacon node to Lodestar z domyślnymi ustawieniami. Gdzie nasłuchuje jego Beacon API?",
      options: ["Port 9596", "Port 5051", "Port 3500", "Port 5054"],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co projekt Lodestar publikuje poza beacon node'em i klientem walidatora?",
      options: [
        "Pakiety npm dla SSZ, typów konsensusu i lekkiego klienta",
        "Gateway Beacon API tłumaczący REST na gRPC",
        "Klienta wykonawczego w TypeScripcie do pary z beacon node'em",
        "Hostowaną usługę checkpoint sync wbudowaną w binarkę"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Nazwy opcji Lodestara mają inny kształt niż u większości klientów. Który zestaw opcji należy do Lodestara?",
      options: [
        "--execution.urls, --checkpointSyncUrl, --dataDir",
        "--execution-endpoint, --checkpoint-sync-url, --datadir",
        "--ee-endpoint=, --checkpoint-sync-url=, --data-base-path=",
        "--web3-url=, --trusted-node-url=, --data-dir="
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego obciążony węzeł Lodestar zwykle pokazuje wolne odpowiedzi Beacon API, a nie błędy?",
      options: [
        "Pauzy garbage collectora w Node.js objawiają się jako opóźnienia",
        "Jego serwer REST kolejkuje żądania do początku następnego slotu",
        "Nakłada rate limit na API w trakcie obowiązków",
        "Każdą odpowiedź najpierw weryfikuje biblioteka lekkiego klienta"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Beacon node Lodestar ma skonfigurowane dwa endpointy wykonawcze. Co mu to daje?",
      options: [
        "Zapasowego klienta wykonawczego na wypadek awarii jednego z nich",
        "Dwa heady, po jednym śledzonym przez każdego klienta wykonawczego",
        "Każdy payload wykonany dwa razy i odrzucony przy niezgodności",
        "Dwa razy większą przepustowość Engine API"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co weryfikuje biblioteka lekkiego klienta Lodestar w porównaniu z pełnym beacon node'em?",
      options: [
        "Nagłówki bloków beacon, bez walidacji wykonania",
        "Wykonanie każdej transakcji za pomocą EVM samego węzła",
        "Saldo każdego walidatora w stanie",
        "Execution payloady, wykonując je ponownie w przeglądarce"
      ],
      answer: 0
    }
  ],
  grandine: [
    {
      kind: "scenario",
      question: "Operator wymienia beacon node Lighthouse na Grandine. Dlaczego klient walidatora, dashboardy i skrypty mogą zostać bez zmian?",
      options: [
        "Każdy klient konsensusu obsługuje te same standardowe Beacon API i Engine API",
        "Mają wspólny format bazy na dysku, więc dane można przekopiować",
        "Klucze walidatorów leżą w kliencie wykonawczym, który się nie zmienia",
        "Każdy klient przyjmuje flagi pozostałych klientów jako aliasy"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Grandine i Lighthouse są napisane w Ruście. Dlaczego ta para daje mniej niezależności niż dwie niezwiązane ze sobą implementacje?",
      options: [
        "Wspólny język albo biblioteka BLS może przenieść jeden błąd do każdego z nich",
        "Klienci w Ruście muszą używać identycznego kodu fork choice",
        "Dwóch klientów w Ruście nie da się połączyć z tym samym klientem wykonawczym",
        "Klienci w Ruście walidują bloki optymistycznie i pomijają sprawdzanie wykonania"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Grandine uruchamia beacon node i obowiązki walidatora w jednym procesie. Jaki jest tego koszt?",
      options: [
        "Restart zatrzymuje podpisywanie, a nie tylko śledzenie łańcucha",
        "Węzeł nie może już startować z checkpoint sync",
        "Jego Beacon API nie może już być udostępniane innym narzędziom",
        "Klucze walidatorów trzeba zamiast tego trzymać w kliencie wykonawczym"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Do jakiego operatora jest skierowana przede wszystkim równoległa architektura Grandine?",
      options: [
        "Do takiego, który ma wielu walidatorów i wiele rdzeni za jednym beacon node'em",
        "Do takiego, który ma komputer jednopłytkowy i potrzebuje małego zużycia pamięci",
        "Do takiego, który osadza lekkiego klienta w TypeScripcie w aplikacji przeglądarkowej",
        "Do takiego, który trzyma klucze w zewnętrznym signerze na potrzeby kustodii instytucjonalnej"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Trzeba podpiąć health checki dla nowego węzła Grandine, a punktem wyjścia jest polecenie uruchamiające Lighthouse. Co zrobić najpierw?",
      options: [
        "Przeczytać dokumentację Grandine i sprawdzić, na jakim porcie wystawił API",
        "Użyć flag Lighthouse bez zmian, bo każdy z tych klientów jest w Ruście",
        "Skierować sprawdzenia na 5052, którego używa każdy klient konsensusu w Ruście",
        "Odpytywać Engine API na 8551, bo Grandine nie ma Beacon API"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jak Grandine znalazł się wśród klientów konsensusu działających na mainnecie?",
      options: [
        "Jego kod otwarto w 2024 roku po latach zamkniętego rozwoju",
        "Powstał w 2024 roku jako fork Lighthouse, a potem przepisano go w całości",
        "Wydzielono go z Prysma, gdy Offchain Labs przejęło Prysma",
        "Zaczął jako port kodu Nimbusa z Nim na Rust"
      ],
      answer: 0
    }
  ],
  "client-diversity": [
    {
      kind: "consequence",
      question: "Błąd sprawia, że jeden klient akceptuje nieprawidłowy blok, a korzysta z niego ponad dwie trzecie walidatorów. Jaki jest najgorszy możliwy skutek?",
      options: [
        "Klient może sfinalizować zły łańcuch, a cofnięcie wymaga koordynacji ludzi",
        "Sieć dalej finalizuje, a w tyle zostają tylko węzły z tym błędem",
        "Finalność staje do czasu poprawki, a potem łańcuch sam wraca do normy",
        "Klienci wykonawczy nadpisują decyzję klientów konsensusu i odrzucają blok"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co się zmienia, gdy udział zepsutego klienta wśród walidatorów rośnie z nieco poniżej jednej trzeciej do nieco powyżej jednej trzeciej?",
      options: [
        "Finalność staje dla wszystkich, a nie tylko dla walidatorów tego klienta",
        "Zepsuty klient może teraz sfinalizować własny nieprawidłowy łańcuch",
        "Jego walidatorzy dostają slashing, zamiast tylko tracić stake",
        "Pozostali klienci zaczynają podążać za łańcuchem zepsutego klienta"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jak zapytać beacon node, jakie oprogramowanie klienta konsensusu na nim działa?",
      options: [
        "GET /eth/v1/node/version w Beacon API",
        "web3_clientVersion wysłane na port beacon node'a",
        "engine_exchangeCapabilities na porcie 8551",
        "GET /eth/v1/node/syncing w Beacon API"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "W maju 2023 mainnet dwukrotnie przez kilka epok nie finalizował bloków. Dlaczego łańcuch mimo to działał dalej?",
      options: [
        "Klienci bez tego błędu działali dalej, a pozostałych naprawiano",
        "Klienci wykonawczy przejęli fork choice na te epoki",
        "Engine API wstrzymało produkcję bloków do powrotu finalności",
        "Mechanizm protokołu cofnął łańcuch do ostatniego sfinalizowanego checkpointu"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Aplikację testowano tylko na jednym kliencie wykonawczym. Potem failover kieruje jej ruch do innej implementacji. Co zwykle wychodzi na jaw?",
      options: [
        "Różnice w komunikatach błędów i w obsługiwanych przestrzeniach nazw",
        "Inne state rooty dla tych samych bloków, dopóki nie wyczyści się cache",
        "Inny chain ID z eth_chainId dla tej samej sieci",
        "Odrzucone żądania, bo każdy klient wymaga własnego JWT na porcie 8545"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Wywołujesz web3_clientVersion na hostowanym endpoincie RPC i dostajesz ciąg wersji Getha. Co można bezpiecznie stwierdzić?",
      options: [
        "Niewiele; dostawca może go podmienić albo kierować ruch gdzie indziej",
        "Na każde kolejne żądanie pod ten URL będzie odpowiadał Geth",
        "Dostawca sprawdził ten ciąg z binarką węzła, który faktycznie działa",
        "Endpoint nie ma trace_, bo Geth nie implementuje tej przestrzeni nazw"
      ],
      answer: 0
    }
  ],
  "validator-client": [
    {
      kind: "detail",
      question: "Z którym procesem łączy się klient walidatora, żeby poznać swoje obowiązki?",
      options: [
        "Z beacon node'em, przez standardowe Beacon API",
        "Z klientem wykonawczym, przez Engine API na porcie 8551",
        "Z relayem MEV-Boost, przez builder API",
        "Z innymi klientami walidatora, przez gossip libp2p"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego bazy ochrony przed slashingiem nigdy nie wolno przywracać ze starszej kopii zapasowej?",
      options: [
        "Nie pamięta ostatnich podpisów i może przepuścić sprzeczny",
        "Trzyma też klucze podpisujące, które przywrócenie by nadpisało",
        "Beacon node nie przyjmuje obowiązków z przywróconej bazy",
        "Przywrócenie resetuje efektywne saldo walidatora do 32 ETH"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jak adres fee recipient ustawiony w kliencie walidatora trafia do klienta wykonawczego?",
      options: [
        "Beacon node przekazuje go w payloadAttributes w engine_forkchoiceUpdated",
        "Klient walidatora wysyła z tym adresem eth_sendRawTransaction",
        "Jest zaszyty w kluczu publicznym BLS walidatora w chwili depozytu",
        "Klient wykonawczy odczytuje go z pliku keystore klienta walidatora"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Dla redundancji operator uruchamia te same klucze walidatora w dwóch klientach walidatora na dwóch hostach, każdy z własną bazą ochrony. Na czym polega zagrożenie?",
      options: [
        "Mogą podpisać sprzeczne wiadomości, a za to grozi slashing",
        "Beacon node odrzuca duplikat i każdego z klientów oznacza jako offline",
        "Atestacji jest dwa razy więcej, więc nagrody i stake się podwajają",
        "Żadnego, bo bazy ochrony synchronizują się przez beacon node"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co się zmienia, gdy klient walidatora korzysta z remote signera, takiego jak Web3Signer, zamiast samemu wczytywać klucze?",
      options: [
        "Wysyła każdą wiadomość do podpisania, zamiast trzymać klucze",
        "Podpisuje kluczem klienta wykonawczego zamiast kluczami BLS",
        "Pobiera obowiązki od signera zamiast od beacon node'a",
        "Rozgłasza podpisane wiadomości do peerów z pominięciem beacon node'a"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Keymanager API klienta walidatora nasłuchuje na publicznym interfejsie. Co może z nim zrobić ktoś obcy?",
      options: [
        "Zaimportować nowe klucze i usunąć istniejące",
        "Wypłacić stake walidatora na dowolny adres",
        "Odczytać harmonogram obowiązków",
        "Przepisać fork choice beacon node'a"
      ],
      answer: 0
    }
  ],
  "beacon-node": [
    {
      kind: "cause",
      question: "Dlaczego każdy klient wykonawczy musi tworzyć parę z dokładnie jednym beacon node?",
      options: [
        "Każde engine_forkchoiceUpdated ustawia jedyny head, więc dwa by się gryzły",
        "Sekret JWT może uwierzytelniać tylko jednego wywołującego naraz",
        "Klientowi wykonawczemu skończyłyby się identyfikatory payloadów do budowania",
        "Dwa beacon node'y podwajałyby każdą atestację wysyłaną przez węzeł"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Beacon node zgłasza el_offline true, a is_syncing false. Co robi tag bloku finalized w sparowanym kliencie wykonawczym?",
      options: [
        "Przestaje się przesuwać, bo nie przychodzą nowe aktualizacje fork choice",
        "Przesuwa się dalej na podstawie bloków od peerów klienta wykonawczego",
        "Zaczyna śledzić tag latest",
        "Zwraca błąd, dopóki połączenie nie zostanie przywrócone"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Aplikacja chce danych blobów z bloku sprzed miesiąca. Co znajdzie?",
      options: [
        "Zwykle nic: beacon node'y usuwają dane blobów po 4096 epokach, około 18 dniach",
        "Dane z klienta wykonawczego, który trzyma bloby po tym, jak beacon node je usunie",
        "Dane z beacon node, bo 4096 epok to mniej więcej trzy miesiące",
        "Dane z trie receiptów, bo receipty przechowują zawartość każdego bloba"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Indekser chce dostawać od beacon node powiadomienia head, finalized_checkpoint i chain_reorg bez odpytywania. Czego używa?",
      options: [
        "Strumienia server-sent events /eth/v1/events",
        "eth_subscribe z newHeads na porcie REST beacon node",
        "/eth/v1/node/syncing i porównywania head_slot w każdym slocie",
        "Surowego gossipu libp2p czytanego z portu 9000"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym różni się zapytanie beacon node o stan head od zapytania o stan na dowolnym starym slocie?",
      options: [
        "Head jest tani; stary slot to odtwarzanie od snapshotu albo odmowa",
        "Stare sloty są tańsze, bo sfinalizowane stany są niezmienne i trzymane w cache",
        "Head wymaga klienta wykonawczego; stare sloty idą prosto z dysku",
        "Koszt jest ten sam, bo każdy stan jest przechowywany w całości"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Reguła monitoringu alarmuje tylko wtedy, gdy is_syncing beacon node ma wartość true. Którą awarię przeoczy?",
      options: [
        "Węzeł działający siłą rozpędu bez łącza Engine API, z el_offline",
        "Węzeł nadrabiający duże zaległości, z wysokim sync_distance",
        "Węzeł, którego checkpoint sync wciąż pobiera początkowy stan",
        "Węzeł po restarcie, który odtwarza bloki aż do head"
      ],
      answer: 0
    }
  ],
  "client-storage": [
    {
      kind: "scenario",
      question: "Zespół budujący dowody stanu korzysta z endpointu archiwalnego, który ma każde historyczne saldo, a mimo to eth_getProof na starych blokach zawodzi. Co to wyjaśnia?",
      options: [
        "Płaski układ trzyma wartości, a nie trie node'y, które zwraca dowód",
        "Specyfikacja definiuje eth_getProof tylko dla najnowszego bloku",
        "Przestrzeń nazw proof jest domyślnie wyłączona w węzłach archiwalnych",
        "Dowody wymagają hasha bloku, którego węzły archiwalne nie indeksują"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Jaka jest praktyczna różnica między kluczowaniem trie node'ów stanu hashem a kluczowaniem ich ścieżką?",
      options: [
        "Z hashem gromadzi się każda wersja; ze ścieżką każda pozycja ma jeden rekord",
        "Ze ścieżką stare wersje zostają na zawsze; z hashem tylko najnowsza",
        "Z hashem odczyty są szybsze; ze ścieżką pruning staje się niemożliwy",
        "Z hashem da się policzyć state root; ze ścieżką już nie"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Zwykły pełny węzeł zwraca z eth_getBlockByNumber blok sprzed dwóch lat, ale odmawia eth_getBalance na tym bloku. Dlaczego?",
      options: [
        "Trzyma całą historię, ale stan tylko dla ostatnich bloków",
        "Saldo trafiło do freezera, którego eth_getBalance nie umie czytać",
        "Historia i stan dzielą jedną bazę, a ta została skompaktowana",
        "Stare salda zwraca eth_getProof, a nie eth_getBalance"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego pruned node z układem path-based na stare eth_call zwykle odpowiada missing trie node?",
      options: [
        "Stan z tego bloku został już usunięty przez pruning",
        "Baza danych jest uszkodzona i wymaga ponownej synchronizacji",
        "Blok wypadł z kanonicznego łańcucha podczas reorga",
        "Kontrakt pod tym adresem uległ od tamtej pory samozniszczeniu"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Nowy węzeł Nethermind 2.0 synchronizuje się z domyślnymi ustawieniami. Jak trzyma stan na dysku?",
      options: [
        "Jako płaskie rekordy kont i slotów, tak jak Erigon i Reth",
        "Jako trie half-path kluczowane prefiksem ścieżki węzła",
        "Jako trie kluczowane hashem, które trzyma każdą wersję węzła",
        "Jako trie logi w stylu Bonsai z diffem każdego bloku"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator przenosi bazę bieżącego stanu na dysk sieciowy, bo pliki historii dobrze tam działały. Co z tego wynika?",
      options: [
        "Węzeł ma kłopoty, bo stan wymaga szybkich losowych odczytów i zapisów",
        "Działa, bo stan, tak jak pliki historii, jest tylko dopisywany",
        "Działa, dopóki freezer zostaje na lokalnym dysku NVMe",
        "Węzeł nie wystartuje, dopóki stan nie będzie na jednym dysku z historią"
      ],
      answer: 0
    }
  ],
  "validator-node": [
    {
      kind: "scenario",
      question: "Klient wykonawczy walidatora zostaje w tyle, a beacon node zgłasza is_optimistic równe true. Co w tym czasie robi walidator?",
      options: [
        "Dalej atestuje optymistyczny head, bo atestacje nie potrzebują payloadu",
        "Nie może proponować ani atestować, więc traci obowiązki bez slashingu",
        "Proponuje przez MEV-Boost, bo builder dostarcza pełny payload",
        "Dostaje slashing za każdy pominięty obowiązek, dopóki klient wykonawczy nie nadrobi"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego duży publiczny ruch RPC na kliencie wykonawczym walidatora może kosztować głosy head?",
      options: [
        "Opóźnia engine_newPayload, więc import nie mieści się w terminie atestacji",
        "Odpowiedzi RPC dzielą port z Engine API i wypierają wywołania fork choice",
        "Publiczne wywołania blokują klucze walidatora na czas odpowiedzi",
        "Beacon node wstrzymuje atestacje, gdy jego klient wykonawczy jest zajęty"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co odróżnia węzeł walidatora od klienta walidatora?",
      options: [
        "Węzeł trzyma klucze; klient tylko przekazuje obowiązki od beacon node'ów",
        "Węzeł to rola w Beacon Chain; klient to oprogramowanie wykonawcze",
        "Węzeł uruchamia MEV-Boost; klient uruchamia parę wykonawczy i beacon",
        "Węzeł to cała instalacja; klient to proces, który podpisuje"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Iloma klientami wykonawczymi może sterować jeden beacon node przez Engine API?",
      options: [
        "Dwoma: jednym do budowania payloadów i jednym do ich walidacji",
        "Dowolną liczbą, bo każdy dostaje te same wywołania forkchoice",
        "Jednym, bo Engine API ma jednego wywołującego fork choice",
        "Kilkoma, o ile każdy ma skonfigurowany własny sekret JWT"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "W slocie propozycji walidatora żaden relay w MEV-Boost nie odpowiada, a klient wykonawczy jest sprawny. Co z tego wynika?",
      options: [
        "Beacon node proponuje lokalnie zbudowany payload o mniejszej wartości",
        "Slot przepada, bo blinded blocki potrzebują relaya do publikacji",
        "Walidator dostaje kary, jakby klient wykonawczy był offline",
        "Beacon node czeka na relay aż do terminu atestacji"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Dla redundancji staker uruchamia drugi kompletny węzeł z tymi samymi kluczami jako gorącą rezerwę. Na czym polega ryzyko?",
      options: [
        "Drugi beacon node walczy z pierwszym o fork choice",
        "Relaye odrzucają oferty od dwóch węzłów z jednym fee recipient",
        "Sekret JWT rezerwy unieważnia Engine API węzła głównego",
        "Każdy z węzłów może podpisać ten sam slot, a to grozi slashingiem"
      ],
      answer: 3
    }
  ],
  "remote-signer": [
    {
      kind: "scenario",
      question: "Dwóch klientów walidatora korzysta z dwóch instancji Web3Signera, które współdzielą jedną bazę ochrony przed slashingiem, i każdy z klientów prosi o podpis innego bloku w tym samym slocie. Co się dzieje?",
      options: [
        "Podpisane zostaje każde żądanie, bo signer sprawdza tylko swoich klientów",
        "Żadne nie zostaje podpisane, dopóki operator ręcznie nie rozwiąże konfliktu",
        "Jedno żądanie zostaje podpisane, a sprzeczne z nim odrzucone",
        "Każde zostaje podpisane, a baza loguje drugie jako ostrzeżenie"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego ochrona przed slashingiem powinna działać w remote signerze, a nie tylko w każdym kliencie walidatora?",
      options: [
        "Klienci walidatora nie mogą zapisywać danych o slashingu przy zdalnych kluczach",
        "Keymanager API zabrania klientom walidatora prowadzenia takich zapisów",
        "Signery weryfikują podpisy on-chain, a klienci walidatora tego nie robią",
        "Signer to jedyne miejsce, które widzi każdy podpis swoich kluczy"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym Clef różni się od Web3Signera czy Dirka?",
      options: [
        "Podpisuje transakcje warstwy wykonawczej, a nie wiadomości BLS walidatorów",
        "Podpisuje wiadomości walidatorów, ale nie prowadzi zapisów ochrony przed slashingiem",
        "Jest signerem progowym, który dzieli klucze walidatorów między maszyny",
        "To wbudowane w Getha keymanager API do importu kluczy walidatorów"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Która ścieżka keymanager API rejestruje klucze publiczne, których podpisywanie klient walidatora deleguje pod adres URL signera?",
      options: ["/eth/v1/keystores", "/eth/v1/remotekeys", "/api/v1/eth2/sign", "/eth/v1/validator/duties"],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Skrypt failover uruchamia zapasowego klienta walidatora z drugim signerem i jego własną bazą, gdy tylko główny wydaje się wolny. Co może z tego wyniknąć?",
      options: [
        "Drugi signer automatycznie importuje zapisy pierwszego",
        "Zapasowy klient czeka na sprawdzenie doppelganger, co czyni go bezpiecznym",
        "Signer głównego klienta unieważnia klucz, gdy pojawia się zapasowy",
        "Każdy z dwóch klientów podpisuje te same obowiązki i dochodzi do slashingu"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Klucz walidatora przenosi się z jednego signera do drugiego. Co musi przenieść się razem z nim?",
      options: [
        "Jego fee recipient, bo każdy podpis obejmuje adres odbiorcy",
        "Jego eksport ochrony EIP-3076, zrobiony po ostatnim podpisie",
        "Jego dane depozytu, których nowy signer potrzebuje do wyliczenia domeny",
        "Tylko hasło do keystore'a, bo signery nie prowadzą innych zapisów"
      ],
      answer: 1
    }
  ],
  helios: [
    {
      kind: "scenario",
      question: "Dapp czyta logi przez Heliosa od providera, który po cichu pomija część pasujących logów. Co wykryje Helios?",
      options: [
        "Lukę, bo odbudowuje logs bloom dla każdego bloku w zakresie",
        "Lukę, bo porównuje receipty każdego bloku z zakresem",
        "Nic, bo Helios przekazuje eth_getLogs bez żadnych sprawdzeń",
        "Nic, bo dowodzi istnienia zwróconych logów, a nie braku pominiętych"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego Helios wywołuje eth_createAccessList przed wykonaniem eth_call?",
      options: [
        "Żeby provider wykonał wywołanie i zwrócił weryfikowalny wynik",
        "Żeby wiedzieć, które konta i sloty udowodnić przed lokalnym wykonaniem",
        "Żeby dostać szacunek gasu, który potem sprawdza względem nagłówka",
        "Żeby dostać od providera podpisany commitment do wyniku"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym źródło zaufania Heliosa w łańcuchach OP Stack różni się od tego, którego używa w Ethereum?",
      options: [
        "Śledzi finalność na L1 każdego output root, a nie bloki unsafe na L2",
        "Używa tego samego sync committee, bo łańcuchy OP dzielą walidatorów z Ethereum",
        "Przyjmuje bloki podpisane kluczem sekwencera, a nie głosy sync committee",
        "Wymaga rozliczonego fault proofu dla każdego bloku, zanim obsłuży odczyty"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co Helios zwraca dla eth_maxPriorityFeePerGas?",
      options: ["Stały napiwek 1 gwei", "Szacunek providera", "Medianę ostatnich napiwków", "Zweryfikowane base fee"],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Helios jest rutynowo uruchamiany z load-external-fallback zamiast z checkpointem wybranym przez operatora. Co z tego wynika?",
      options: [
        "Staje się odporny na stare checkpointy, bo lista jest zawsze świeża",
        "Łańcuch, który śledzi, wybierają endpointy z tej listy społeczności",
        "Sprawdza checkpoint każdego endpointu z listy względem korzenia genesis",
        "Odmawia startu, jeśli checkpoint nie jest młodszy niż dwa tygodnie"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Zespół wystawia Heliosa na 0.0.0.0, żeby inne usługi mogły go odpytywać. Na czym polegają te usługi?",
      options: [
        "Na własnej weryfikacji, bo Helios dołącza dowody do odpowiedzi",
        "Na podpisach sync committee, które Helios przekazuje z każdą odpowiedzią",
        "Na niczym więcej, bo zdalni wywołujący mają tę samą gwarancję",
        "Na uczciwości tego, kto obsługuje ten proces Heliosa"
      ],
      answer: 3
    }
  ],
  "client-extensions": [
    {
      kind: "scenario",
      question: "ExEx na węźle Reth z pruningiem nigdy nie wysyła FinishedHeight. Co widzi operator?",
      options: [
        "Pruning się wstrzymuje, a dysk stale rośnie",
        "Węzeł przestaje wysyłać do ExEx nowe powiadomienia",
        "Reth po każdym bloku uruchamia ExEx od genesis",
        "ExEx zostaje wyładowane po timeoucie jednej epoki"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego dokumentacja Getha każe, żeby live tracery były minimalne?",
      options: [
        "Działają w osobnym procesie z małym przydziałem pamięci",
        "Ich wynik jest ograniczony do jednego pliku JSONL na każdy blok",
        "Działają synchronicznie w przetwarzaniu bloku i je spowalniają",
        "Ich hooki odpalają raz na blok, więc ciężka praca przepada"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym ExEx Retha różni się od live tracingu Getha w tym, jak reorgi docierają do rozszerzenia?",
      options: [
        "Geth wysyła powiadomienia ChainReorged, a Reth tylko odtwarza nową gałąź",
        "Reth wysyła odcinki wycofane i zatwierdzone; Geth zostawia cofanie tobie",
        "Każdy z nich ukrywa reorgi, dostarczając tylko bloki już sfinalizowane",
        "Reth po cichu pomija bloki z reorga, a Geth oznacza je jako usunięte"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Jak ładowane są pluginy Nethermind?",
      options: [
        "Jako moduły WebAssembly pobierane przez serwer JSON-RPC",
        "Jako crate'y Rusta kompilowane razem z node builderem",
        "Jako skrypty rejestrowane w trakcie działania przez przestrzeń nazw admin_",
        "Jako assembly .NET wczytywane przy starcie z katalogu plugins"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Plugin synchronicznie zapisuje diff stanu każdego bloku do wolnej zdalnej bazy na węźle, który obsługuje walidatora. Co z tego wynika?",
      options: [
        "Klient trzyma zapisy w pamięci, więc przetwarzanie bloków na tym nie cierpi",
        "Klient konsensusu przełącza się na inny klient wykonawczy",
        "Import bloków zwalnia, newPayload odpowiada z opóźnieniem, cierpią atestacje",
        "Plugin wyłącza się automatycznie, gdy tylko spóźni się z pierwszym blokiem"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Po awarii rozszerzenie wznawia pracę od numeru bloku, który ostatnio zapisało, bez jego hasha. Co może pójść źle?",
      options: [
        "Reorg mógł zastąpić ten blok, więc punkt wznowienia jest nieaktualny",
        "Numery bloków są nadawane od nowa po każdym restarcie, więc numer jest nieważny",
        "Węzeł odmawia ponownego wykonania bloków starszych niż bieżący head",
        "Nic, bo numer bloku zawsze wskazuje dokładnie jeden blok"
      ],
      answer: 0
    }
  ],
  "slashing-protection": [
    {
      kind: "scenario",
      question: "Operator przenosi klucze do nowego klienta, kopiując same keystore'y, i uruchamia go zaraz po zatrzymaniu starego. Jakie ryzyko pozostaje?",
      options: [
        "Keystore'ów nie da się odszyfrować bez pliku wymiany",
        "Beacon node odrzuca klucze bez zapisu ochrony",
        "Nowy klient nie ma zapisu już podpisanych obowiązków",
        "Nowy klient odmawia każdego obowiązku, dopóki nie minie epoka"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Które pole w pliku EIP-3076 uniemożliwia zaimportowanie historii z jednej sieci do signera dla innej sieci?",
      options: [
        "genesis_validators_root w metadata",
        "interchange_format_version w metadata",
        "signing_root w każdej podpisanej atestacji",
        "pubkey w każdym wpisie tablicy data"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego import EIP-3076 ustawia low watermarks, zamiast tylko dodać wymienione wiadomości?",
      options: [
        "Format może przechowywać tylko jedną wiadomość na klucz",
        "Plik może pomijać wiadomości, więc starsze są odrzucane",
        "Watermarki pozwalają klientowi usuwać stare keystore'y",
        "Watermarki przyspieszają podpisywanie, pomijając wyszukiwanie"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym pełna baza ochrony przed slashingiem różni się od minimalnej?",
      options: [
        "Trzyma najwyższy slot i epoki każdego klucza i nic więcej",
        "Przechowuje same podpisy, a nie sloty czy epoki",
        "Współdzielą ją wszyscy klienci walidatora na tym samym hoście",
        "Trzyma każdą wiadomość i odmawia tylko prawdziwych konfliktów"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Dwóch klientów walidatora używa jednego klucza na różnych maszynach, każdy z własną, sprawną bazą ochrony. Co z tego wynika?",
      options: [
        "Każda baza zatwierdza swoją kopię, więc konflikty przechodzą",
        "Bazy się synchronizują, a drugi klient milczy",
        "Beacon node wykrywa duplikat i odrzuca jeden podpis",
        "Każda baza odmawia obowiązku, więc klucz tylko traci nagrody"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Po zaimportowaniu historii, w której ostatnia atestacja miała source 478211 i target 478212, klient dostaje do podpisania source 478210 i target 478213. Co zrobi?",
      options: [
        "Podpisze, bo jej target jest nowszy niż każdy zapisany",
        "Podpisze, bo jej source nie jest poniżej watermarku",
        "Odmówi, bo target może przesunąć się tylko o jedną epokę",
        "Odmówi, bo otacza zapisaną wcześniej atestację"
      ],
      answer: 3
    }
  ],
  hive: [
    {
      kind: "scenario",
      question: "Klient przechodzi każdy test rpc-compat na publicznej instancji hive, a mimo to indekser korzystający z providera, który go uruchamia, trafia na błędy zakresu bloków. Dlaczego hive tego nie wykrył?",
      options: [
        "Hive pomija eth_getLogs, bo odpowiedzi z logami różnią się między klientami",
        "Hive używa malutkiego łańcucha, bez limitów providera i bez retencji",
        "Hive uruchomił testy na innym kliencie niż ten u providera",
        "Hive sprawdza odpowiedzi tylko dla bloków, które są już sfinalizowane"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Jak rpc-compat ocenia odpowiedź w teście, który nie jest oznaczony jako speconly?",
      options: [
        "Sprawdza tylko, czy odpowiedź przechodzi walidację względem schematu",
        "Porównuje odpowiedź z tą, którą zwróciła większość klientów",
        "Porównuje odpowiedź jako JSON z dokładną oczekiwaną odpowiedzią",
        "Sprawdza, czy odpowiedź przyszła w limicie czasu danego testu"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym hive różni się od devnetu Kurtosis jako sposób testowania klienta?",
      options: [
        "Hive sprawdza jedno zachowanie naraz względem znanej oczekiwanej odpowiedzi",
        "Hive uruchamia żywą sieć z prawdziwym konsensusem między wieloma klientami",
        "Hive mierzy opóźnienie i przepustowość, a Kurtosis sprawdza kształty",
        "Hive wymaga publicznego testnetu, a Kurtosis buduje prywatny"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego hive czeka na otwarcie portu TCP 8545, zanim symulator zacznie komunikować się z klientem?",
      options: [
        "Ten port obsługuje handshake JWT Engine API w każdym teście",
        "Przez ten port każdy klient wysyła version.txt do wyników",
        "Ten port to API samego kontrolera, do którego klienci muszą dotrzeć",
        "Po otwartym porcie hive poznaje, że klient już wystartował"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Jakie buildy każdego klienta testuje przeważnie publiczna instancja hive?",
      options: [
        "Najnowsze otagowane wydanie opublikowane przez zespół",
        "Buildy deweloperskie z głównej gałęzi każdego zespołu",
        "Build, którego dziś używa większość walidatorów mainnetu",
        "Build przypinany raz na fork przez opiekunów hive"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Do jednego pliku testowego execution-apis trafia błędna oczekiwana odpowiedź. Co pokaże następne publiczne uruchomienie rpc-compat?",
      options: [
        "Test jest pomijany, dopóki opiekun nie uzna fixture'u za poprawny",
        "Test nie przechodzi tylko u klienta, z którego wzięto fixture",
        "Test przechodzi, bo rpc-compat ignoruje wartości, których nie umie sprawdzić",
        "Test nie przechodzi u każdego klienta, który odpowiada poprawnie"
      ],
      answer: 3
    }
  ]
};
