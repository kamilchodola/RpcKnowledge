// Polish text for the Operations lessons, keyed by topic id. Only the words: ids, link
// targets, code, related topics, and sources come from data/operations.js.
export const topics = {
  "rpc-provider": {
    title: "Provider RPC",
    aliases: [
      "RPC provider",
      "dostawca RPC",
      "Alchemy",
      "Infura",
      "QuickNode",
      "dRPC",
      "Chainstack",
      "Ankr",
      "PublicNode",
      "hostowany węzeł",
      "managed RPC"
    ],
    summary: "Provider RPC to usługa, która uruchamia za ciebie klientów [[execution-client|wykonawczych]] i [[consensus-client|konsensusu]] i sprzedaje dostęp do ich endpointów [[json-rpc|JSON-RPC]], zwykle za kluczem API, z limitami, routingiem i dodatkowymi, niestandardowymi API.",
    sections: [
      {
        heading: "Co się właściwie kupuje",
        paragraphs: [
          "Provider daje URL. Za nim stoi cała flota: [[full-node|pełne węzły]] do niedawnego stanu, [[archive-node|węzły archiwalne]] do starych bloków, klienci obsługujący tracing dla przestrzeni nazw [[trace-api|trace_]] i [[debug-api|debug_]] oraz osobne pule dla każdego łańcucha. Provider przejmuje pracę, którą inaczej trzeba wykonać samemu: sprzęt, synchronizację, aktualizacje klientów przed każdą [[hardfork|aktualizacją sieci]], [[load-balancer|load balancing]], [[caching|cache'owanie]] i [[failover|failover]]. Alchemy, Infura, QuickNode, Chainstack, dRPC, Ankr i darmowe endpointy PublicNode sprzedają jakąś wersję tego samego; dRPC i Ankr kierują ruch do niezależnie prowadzonych węzłów, a nie do jednej floty, co zmienia model zaufania, ale nie interfejs.",
          "Większość providerów sprzedaje też rzeczy, których nie implementuje żaden [[execution-client|klient wykonawczy]]: [[portfolio-tracker|endpointy sald tokenów]] i [[nft-marketplace|NFT]], zdekodowaną historię transakcji dla [[address|adresu]], strumienie webhooków i feedy mempoolu. Są wygodne i zupełnie nieprzenośne. Kodu napisanego pod nie nie da się przepiąć na własny węzeł ani do innego providera bez przepisania, więc jeśli przeprowadzka jest kiedykolwiek możliwa, warto schować je za własnym interfejsem."
        ]
      },
      {
        heading: "Co się różni i co sprawdzić",
        paragraphs: [
          "Poza podstawowymi metodami `eth_` [[execution-apis|specyfikacja execution-apis]] niczego w endpoincie providera nie gwarantuje, a nawet te metody mają limity. Głębokość archiwum się różni, podobnie jak to, czy historyczne [[eth-get-proof|eth_getProof]] w ogóle działa. Zakresy bloków w [[eth-get-logs|eth_getLogs]] są zwykle ograniczone, często do kilku tysięcy bloków albo rozmiarem odpowiedzi. Żądania [[batch-request|batch]] mają limit długości tablicy. [[eth-filters|Filtry do odpytywania (polling)]] i [[eth-subscribe|eth_subscribe]] mogą być nieobsługiwane, dostępne tylko w niektórych planach albo po cichu ograniczone co do liczby subskrypcji na jedno połączenie. [[eth-simulate|eth_simulateV1]] i [[state-override|state override]] działają na niektórych endpointach, a na innych nie. Zamiast zakładać, trzeba sprawdzać; zobacz [[endpoint-capabilities|możliwości endpointu]].",
          "Rzadko płaci się za żądanie. Providerzy wyceniają w compute units (jednostkach obliczeniowych): tania metoda, taka jak [[eth-block-number|eth_blockNumber]], kosztuje ułamek tego, co `debug_traceBlock`, więc naiwna pętla ponowień na drogiej metodzie potrafi w godzinę wyczerpać miesięczny limit. Przed zaprojektowaniem skanowania warto przeczytać tabelę kosztów metod; zobacz [[rate-limits|rate limity i compute units]]."
        ]
      },
      {
        heading: "Z czego się rezygnuje",
        paragraphs: [
          "Poprawność staje się założeniem opartym na zaufaniu. Odpowiedź providera to twierdzenie, a nie dowód: może podać nieaktualny stan, odpowiedzieć z węzła na mniejszościowym forku albo po prostu się mylić, a odpowiedź JSON nie zawiera żadnego dowodu ani w jedną, ani w drugą stronę. Gdy od odpowiedzi zależą pieniądze, trzeba ją zweryfikować: czytając przy [[block-tag|tagu bloku]] `finalized`, porównując z drugim, niezależnym endpointem albo sprawdzając [[eth-get-proof|dowód konta]] względem [[trusted-header|zaufanego nagłówka]]; wzorce opisuje [[verified-rpc|weryfikowane RPC]].",
          "[[rpc-privacy|Prywatność]] to koszt mniej widoczny. Provider widzi twój adres IP, klucz API, każdy adres, o który pytasz, każdy kontrakt, który czytasz, i każdą transakcję, którą wysyłasz, zanim zobaczy ją sieć. Portfele z jednym domyślnym endpointem ujawniają jednej firmie cały graf adresów swoich użytkowników. Wysyłanie transakcji to też punkt kontroli: provider może odrzucić albo opóźnić [[eth-send-raw-transaction|eth_sendRawTransaction]], a awaria providera kładzie razem z nim aplikację, chyba że jest druga droga."
        ]
      }
    ],
    example: {
      title: "Sprawdzenie, na czym naprawdę działają dwa endpointy",
      note: "Inne oprogramowanie upstream oznacza inne API tracingu i inne komunikaty błędów; niektórzy providerzy zwracają tu zamaskowany albo stały ciąg, co samo w sobie mówi, jak mocno normalizują odpowiedzi."
    },
    pitfalls: [
      "Umieszczanie klucza API w bundlu JavaScriptu dla przeglądarki. Wszystko, co jest w kodzie frontendu, jest publiczne; trzeba użyć allowlisty domen albo proxy przez własny backend.",
      "Zakładanie, że wszystkie endpointy jednego providera są równoważne. Endpointy z tracingiem i archiwalne to często inny poziom produktu pod innym URL.",
      "Traktowanie 429 albo `-32005` jako „nie ma takich danych”. To odpowiedź operacyjna o twoim limicie, a nie informacja o łańcuchu.",
      "[[rpc-benchmarking|Porównywanie providera]] z własnym węzłem tylko pod względem opóźnienia; edge cache providera może odpowiedzieć szybciej, a mimo to być blok w tyle."
    ]
  },
  "self-hosting": {
    title: "Własny węzeł czy provider",
    aliases: [
      "self-hosting",
      "self-hosted node",
      "własny węzeł",
      "run your own node",
      "własne RPC",
      "in-house RPC",
      "hybrydowe RPC",
      "hybrid RPC"
    ],
    summary: "Self-hosting oznacza uruchomienie własnej pary klientów, [[execution-client|wykonawczego]] i [[consensus-client|konsensusu]], i wywoływanie jej RPC bezpośrednio. Pracę operacyjną wymienia się wtedy na zaufanie, prywatność i dostęp do metod bez ograniczeń.",
    sections: [
      {
        heading: "Ile to kosztuje",
        paragraphs: [
          "Węzeł to dwa procesy, nie jeden. Klient wykonawczy obsługuje metody `eth_` i [[engine-api|Engine API]] na porcie 8551; [[beacon-node|beacon node]] nim steruje i udostępnia [[beacon-api|Beacon API]]. Współdzielą plik z 32-bajtowym sekretem JWT w hex. Oba potrzebują szybkiego dysku NVMe i wystarczającej ilości RAM; realistyczne liczby są w temacie [[node-hardware|sprzęt dla węzła]]. Trzeba się liczyć z tym, że [[full-node|pełny węzeł]] z historią zajmuje terabajty, a [[archive-node|węzeł archiwalny]] kilka razy więcej.",
          "Stała praca to aktualizacje. Każda [[hardfork|aktualizacja sieci]] ma termin na wersję klienta: węzeł, którego nie zaktualizowano, w chwili aktywacji forka przestaje podążać za kanonicznym łańcuchem i z pełnym przekonaniem podaje błędne odpowiedzi, dopóki ktoś tego nie zauważy. Do tego dochodzą przyrost danych na dysku, [[snap-sync|ponowna synchronizacja]] po uszkodzeniu bazy i fakt, że jeden węzeł nie daje wysokiej dostępności. Zanim nazwie się to produkcją, trzeba zaplanować dwa węzły albo fallback do providera."
        ]
      },
      {
        heading: "Co to daje",
        paragraphs: [
          "Prawdziwe powody to zaufanie i prywatność. Własny węzeł sam waliduje każdy blok, więc jego odpowiedzi wynikają z reguł konsensusu, a nie z deklaracji firmy, i nikt z zewnątrz nie widzi, o które adresy pytasz ani jakie transakcje podpisujesz. Walidatorzy muszą mieć własne węzły: obowiązki podpisywania zależą od beacon node pod własną kontrolą, a pary połączonej przez Engine API nie da się zlecić na zewnątrz.",
          "Praktyczny powód to możliwości. Na własnym węźle nie ma compute units ani poziomu planu, od którego zależą tracing [[debug-api|debug_]], replay w [[trace-api|trace_]], podgląd przez [[txpool-api|txpool_]] czy długotrwałe [[eth-subscribe|subskrypcje]], a jedyne limity zakresu [[eth-get-logs|eth_getLogs]] i długości batcha to domyślne ustawienia klienta, które można zmienić (Erigon ogranicza zakresy do 1000 bloków, a Geth batche do 1000 żądań). Ciężkie [[indexer|indeksowanie]] i symulacje są zwykle tańsze na własnym sprzęcie niż na opłacanych compute units."
        ]
      },
      {
        heading: "Konfiguracje hybrydowe",
        paragraphs: [
          "Większość systemów produkcyjnych kończy jako mieszane. Typowy układ to własny węzeł jako główny upstream dla wrażliwych na opóźnienia odczytów `latest` i wysyłania transakcji, a za nim [[rpc-provider|provider RPC]] na skoki ruchu, głębokie zapytania archiwalne i jako cel [[failover|failoveru]] w czasie prac serwisowych. [[rpc-gateway|Gateway RPC]] przed nimi zamienia ten podział w regułę routingu, a nie kod aplikacji.",
          "Fallback musi być uczciwy. Fallback do providera, który odpowiada z innego [[chain-id|łańcucha]], zostaje w tyle za headem albo nie ma potrzebnej przestrzeni nazw, jest gorszy niż błąd, bo aplikacja chętnie użyje złej odpowiedzi; [[health-check|health check]] sprawdzający chain ID, status synchronizacji i odległość od heada powinien dopuszczać do ruchu każdy upstream, własny czy nie."
        ]
      }
    ],
    example: {
      title: "Minimalna para: RPC na loopbacku, Engine API z uwierzytelnianiem",
      note: "Publiczny port RPC i port Engine API to różne interfejsy o różnym poziomie zaufania; za [[reverse-proxy|reverse proxy]] może stać tylko 8545, nigdy 8551."
    },
    pitfalls: [
      "Bindowanie HTTP RPC do `0.0.0.0` na maszynie z publicznym IP; to otwarty węzeł, zobacz [[security|bezpieczeństwo RPC]].",
      "Przegapienie terminu forka. Nieaktualny klient nie zgłasza głośno błędu; podąża za martwym łańcuchem i dalej odpowiada.",
      "Zakładanie, że własny węzeł odpowie na pytania o historyczny stan; domyślny [[pruned-node|pruned node]] trzyma tylko niedawny stan i nie obsłuży starych zapytań [[eth-call|eth_call]].",
      "Nazywanie jednego węzła bez fallbacku „self-hosted RPC”; jeden restart maszyny to awaria aplikacji."
    ]
  },
  "load-balancer": {
    title: "Load balancing RPC",
    aliases: [
      "load balancing",
      "load balancer",
      "równoważenie obciążenia",
      "round robin",
      "pula upstreamów",
      "upstream pool",
      "sticky sessions",
      "sticky session",
      "routing według metody",
      "method routing"
    ],
    summary: "Load balancing RPC rozkłada wywołania JSON-RPC na kilka węzłów upstream. Działa to przy bezstanowych odczytach, ale psuje się przy metodach, których odpowiedź zależy od heada jednego węzła albo od danych, które serwer trzyma dla konkretnego połączenia.",
    sections: [
      {
        heading: "Dlaczego węzły to nie wymienne serwery WWW",
        paragraphs: [
          "Serwer aplikacji HTTP jest zwykle bezstanowy, więc każda replika może odpowiedzieć na każde żądanie. Węzeł taki nie jest. Każdy upstream ma własny obraz heada, własny [[mempool|mempool]], własną retencję danych i własne obiekty po stronie serwera, utworzone przez wcześniejsze wywołania. Dwa w pełni zdrowe węzły i tak będą się różnić przez sekundę lub dwie po każdym 12-sekundowym slocie, a wywołujący, którego żądania rozchodzą się na oba, widzi tę różnicę jako brakujące dane; szczegóły tej awarii opisuje [[head-lag|spójność heada]].",
          "Routing musi więc rozumieć metody. Zwykły round robin TCP albo HTTP nie widzi nazwy metody, więc nie może wiedzieć, że to żądanie wymaga [[archive-node|węzła archiwalnego]], tamto musi trafić do tego samego węzła co poprzednie wywołanie, a trzecie można obsłużyć z [[caching|cache]]."
        ]
      },
      {
        heading: "Metody, które się psują",
        paragraphs: [
          "[[eth-filters|Filtry odpytywane w trybie polling]] to obiekty po stronie serwera. `eth_newFilter` zwraca id, które istnieje tylko w pamięci węzła, który utworzył filtr, więc późniejsze `eth_getFilterChanges` wysłane do innego węzła kończy się błędem 'filter not found'. To samo dotyczy `eth_newBlockFilter` i `eth_newPendingTransactionFilter`. Trzeba albo przypiąć cały cykl życia filtra do jednego upstreamu przez sticky session z kluczem w postaci id filtra, albo zrezygnować z filtrów i używać ograniczonych zakresów [[eth-get-logs|eth_getLogs]], które są bezstanowe i można je bezpiecznie rozkładać.",
          "[[eth-subscribe|eth_subscribe]] jest związane z jednym połączeniem [[websocket-transport|WebSocket]], więc przeżywa load balancing tylko dlatego, że samo połączenie jest przypięte. Gdy to połączenie się zerwie i połączy ponownie z innym węzłem, nowy węzeł zaczyna od własnego heada, a luka pomiędzy przepada. Trzecią pułapką są odczyty nonce: `eth_getTransactionCount` z tagiem `pending` odzwierciedla mempool jednego węzła, więc zapytanie węzła A, a potem wysłanie transakcji przez węzeł B może dać lukę w nonce albo duplikat. Źródłem prawdy o nonce powinien być jeden upstream, albo trzeba używać tagu `latest` i własnej ewidencji transakcji w locie."
        ]
      },
      {
        heading: "Polityki, które działają",
        paragraphs: [
          "Metody trzeba podzielić na pule. Tracing i stan historyczny idą do upstreamów z danymi archiwalnymi, odczyty `latest` i [[eth-send-raw-transaction|wysyłanie transakcji]] do puli o niskim opóźnieniu, a skany logów do tego upstreamu, któremu wolno być wolnym. Wagę każdego upstreamu trzeba ustalać na podstawie zmierzonego zdrowia, a nie statycznej listy: odpytywać [[eth-block-number|eth_blockNumber]] i [[eth-syncing|eth_syncing]] w krótkich odstępach i usuwać każdy węzeł, którego head jest więcej niż jeden lub dwa bloki za najlepszym znanym headem. Dokładnie to powinien dawać [[health-check|health check]].",
          "Przypinanie (stickiness) to najtańszy sposób na poprawność. Hashowanie po kluczu API, sesji albo IP wywołującego sprawia, że kolejne żądania jednego wywołującego trafiają do tego samego upstreamu; widzi on wtedy monotoniczny head, a nie head, który skacze do tyłu. Tam, gdzie poprawność liczy się bardziej niż świeżość, cały problem można obejść, przypinając żądania do jawnego numeru bloku albo hasha zamiast [[block-tag|tagu]] `latest`."
        ]
      }
    ],
    example: {
      title: "Filtr rozbity między dwa upstreamy",
      note: "Ten błąd nie jest bugiem żadnego z węzłów; to load balancer traktuje metodę, która trzyma dane na serwerze, tak, jakby była bezstanowa."
    },
    pitfalls: [
      "Postawienie zwykłego load balancera HTTP przed węzłami i uznanie sprawy za załatwioną; nie widzi on metod, headów ani id filtrów.",
      "Rozkładanie połączeń WebSocket bez sticky sessions, a potem zdziwienie, że po ponownym połączeniu subskrypcje po cichu gubią bloki.",
      "Mieszanie w jednej puli upstreamów z różnym [[chain-id|chain ID]] albo różną retencją, przez co wyniki zależą od tego, który węzeł odpowiedział.",
      "Health check oparty tylko na połączeniu TCP albo HTTP 200; synchronizujący się węzeł przyjmuje połączenia i odpowiada na `eth_blockNumber` nieaktualną wysokością."
    ]
  },
  "rpc-gateway": {
    title: "Gateway RPC",
    aliases: ["RPC gateway", "eRPC", "dshackle", "Proxyd", "Blutgang", "Rivet", "RPC proxy", "proxy RPC", "multiplexer", "multiplekser RPC"],
    summary: "Gateway RPC to proxy, które parsuje format komunikatu JSON-RPC (envelope) i na tej podstawie routuje, cache'uje, limituje, ponawia i filtruje allowlistą wywołania kierowane do kilku węzłów upstream i providerów, tak że aplikacje widzą jeden endpoint zamiast całej puli upstreamów.",
    sections: [
      {
        heading: "Czego nie potrafi zwykłe proxy",
        paragraphs: [
          "Gateway dekoduje [[request-response|format komunikatu JSON-RPC (envelope)]], więc może działać na podstawie `method` i `params`. Dzięki temu możliwe są: routing per metoda do różnych pul upstreamów, rate limity i limity ilościowe (quota) per metoda, allowlista, która odrzuca wywołania [[admin-api|admin_]] albo [[debug-api|debug_]], zanim dotrą do węzła, [[caching|cache'owanie]] odpowiedzi z kluczem złożonym z metody i jej argumentu bloku, dzielenie zbyt dużego [[batch-request|batcha]] na kilka batchy wysyłanych do upstreamów i ponawianie nieudanego wywołania na innym upstreamie, podczas gdy wywołujący czeka na jednym połączeniu.",
          "Daje też jedno miejsce do pilnowania spójności heada. Gateway, który śledzi [[eth-block-number|numer bloku]] każdego upstreamu, może odmówić skierowania żądania do węzła opóźnionego o więcej niż N bloków albo wstrzymać żądanie, aż wybrany upstream osiągnie wysokość, którą wywołujący już widział. Usuwa to większość [[head-lag|opóźnienia heada]], które ujawniłby goły [[load-balancer|load balancer]]."
        ]
      },
      {
        heading: "Narzędzia",
        paragraphs: [
          "eRPC to proxy w Go, nastawione na multipleksowanie wielu providerów za jednym URL-em, z failoverem per upstream, routingiem świadomym metod i cache'owaniem. dshackle, napisany na JVM, skupia się na kworum: wysyła to samo wywołanie do kilku niezależnych upstreamów i porównuje odpowiedzi, zanim zwróci jedną. Proxyd to proxy używane w OP Stack; śledzi uzgodniony obraz `latest`, `safe` i `finalized` we wszystkich backendach, więc nigdy nie kieruje wywołującego do opóźnionego węzła. Blutgang to proxy w Ruście zbudowane wokół cache'owania i upstreamów posortowanych według heada. Rivet to kolejny gateway z tej samej kategorii. Wszystkie stoją przed węzłami utrzymywanymi samodzielnie, [[rpc-provider|providerami]] albo ich mieszanką.",
          "Generyczna alternatywa to reverse proxy z Lua albo mała własna usługa. Sprawdza się przy allowlistach i TLS, ale każda reguła spójności i cache'owania, którą się do niej doda, to gorsza reimplementacja któregoś z tych narzędzi; część, która naprawdę należy do tamtej warstwy, opisuje [[reverse-proxy|reverse proxy i TLS]]."
        ]
      },
      {
        heading: "Utrzymanie gatewaya",
        paragraphs: [
          "Gateway staje się pojedynczym punktem awarii, którym upstreamy nie były, więc potrzebuje własnych metryk i alertów: tempa żądań i opóźnienia per metoda, liczby błędów i wyrzuceń z puli per upstream, hit ratio cache i odległości heada każdego upstreamu od najlepszego. To rdzeń [[observability|obserwowalności RPC]] przy wielu węzłach.",
          "Dwie zasady poprawności są ważniejsze niż jakikolwiek tuning. Nigdy nie wolno cache'ować niczego, co rozwiązano z [[block-tag|tagów]] `latest` albo `pending`, tak jakby było niezmienne, i nigdy nie wolno zmieniać kolejności ani łączyć odpowiedzi tak, że psuje to dopasowanie po `id` u wywołującego. Gateway, który na żądanie `id: 7` odpowiada wynikiem `id: 8`, psuje każdą bibliotekę nad sobą, a ten bug jest prawie niewidoczny, dopóki batch nie zostanie częściowo zablokowany przez rate limit."
        ]
      }
    ],
    example: {
      title: "Jak gateway decyduje, dokąd trafia jedno wywołanie",
      note: "Kroki 3 i 4 są możliwe tylko dlatego, że proxy odczytało metodę i argument bloku; kroki 6 i 7 to [[failover|failover]] w obrębie jednego żądania widocznego dla klienta."
    },
    pitfalls: [
      "Cache'owanie według surowego body żądania, przez co `eth_call` na `latest` dostaje wpis w cache, który żyje dłużej niż blok, na którym go policzono.",
      "Failover przy deterministycznym błędzie, takim jak `execution reverted`; każdy upstream zwróci to samo, a koszt właśnie się potroił.",
      "Zapominanie, że gateway terminuje WebSocket wywołującego, więc po zmianie upstreamu [[eth-subscribe|subskrypcje]] trzeba odtworzyć u nowego upstreamu, a luki uzupełnić.",
      "Uruchamianie gatewaya bez allowlisty w założeniu, że providerzy upstream już blokują niebezpieczne [[namespaces|przestrzenie nazw]]; własne upstreamy zwykle tego nie robią."
    ]
  },
  "head-lag": {
    title: "Spójność heada między węzłami",
    aliases: [
      "head lag",
      "opóźnienie heada",
      "nieaktualny head",
      "stale head",
      "read your writes",
      "block height skew",
      "rozjazd wysokości bloków"
    ],
    summary: "Head lag to normalna, chwilowa niezgodność między węzłami co do tego, który blok jest `latest`. Przez nią dane zapisane przez jeden endpoint wyglądają na brakujące, gdy czyta się je przez inny.",
    sections: [
      {
        heading: "Dlaczego heady się różnią",
        paragraphs: [
          "Blok powstaje raz na 12-sekundowy [[slot-epoch|slot]], a potem musi dotrzeć do węzłów. [[consensus-client|Klient konsensusu]] odbiera blok beacon przez gossip i przekazuje [[execution-payload|execution payload]] [[execution-client|klientowi wykonawczemu]] przez `engine_newPayload`, ten go wykonuje i dopiero wtedy `latest` tego węzła przesuwa się do przodu. Propagacja, czas wykonania i obciążenie dysku różnią się między maszynami, więc nawet dobrze utrzymane węzły rozjeżdżają się o setki milisekund, a obciążony albo częściowo zsynchronizowany węzeł o kilka sekund lub bloków.",
          "Nic z tego nie jest [[reorg|reorgiem]]. Węzły zgadzają się co do łańcucha; są po prostu w różnych jego punktach. Węzeł może też całkiem uczciwie być do przodu: mógł zaimportować blok, który później przegra [[fork-choice|fork choice]], więc wywołujący może zobaczyć, jak head się pojawia, a potem znika, choć żaden węzeł nie działa wadliwie."
        ]
      },
      {
        heading: "Co się psuje",
        paragraphs: [
          "Klasyczny objaw to schemat „wyślij, a potem odpytuj”. Transakcja wysłana przez jeden endpoint trafia do bloku, a [[eth-get-transaction-receipt|eth_getTransactionReceipt]] na innym endpoincie zwraca `null`, bo ten węzeł jeszcze nie zaimportował bloku. Wywołujący często błędnie odczytują ten `null` jako niepowodzenie i wysyłają transakcję ponownie z tym samym nonce.",
          "Subtelniejszy objaw to mieszanie źródeł. Jeśli receipt pochodzi z węzła A na wysokości H, a saldo albo wartość z kontraktu na `latest` z węzła B na wysokości H-1, obie odpowiedzi opisują różne światy: transfer już jest w bloku, ale saldo się nie zmieniło. Skany logów robią to samo na granicy zakresu: `toBlock: \"latest\"` na opóźnionym węźle po cichu zwraca mniej [[event-log|logów]], niż istnieje, a [[indexer|indekser]], który przesuwa kursor na podstawie takiej odpowiedzi, na zawsze pomija bloki. Trzeci przypadek to nonce: `eth_getTransactionCount` z [[block-tag|tagiem]] `pending` odzwierciedla [[mempool|mempool]] jednego węzła, więc zmiana endpointu w trakcie wysyłania daje luki albo duplikaty."
        ]
      },
      {
        heading: "Jak się tego pozbyć",
        paragraphs: [
          "Pierwszy sposób to przypięcie bloku. `latest` rozwiązuje się raz, a potem ten jawny numer albo obiekt EIP-1898 `{\"blockHash\": …, \"requireCanonical\": true}` przekazuje się do każdego wywołania, które musi się zgadzać z pozostałymi. Węzeł, który nie ma tego bloku, głośno zgłasza błąd (w [[geth|Gethu]] 'header not found' dla numeru i 'header for hash not found' dla hasha), zamiast po cichu odpowiedzieć ze starszego bloku, i właśnie o to chodzi.",
          "Drugi sposób to przypięcie węzła. Powiązane żądania jednego wywołującego kieruje się do jednego upstreamu przez sticky session i prowadzi się high-water mark: zapisuje się najwyższy widziany numer bloku i odrzuca albo ponawia każdą odpowiedź policzoną poniżej niego, więc obraz heada nigdy się nie cofa. [[rpc-gateway|Gateway RPC]] może robić jedno i drugie centralnie, wyrzucając upstreamy, które spadną więcej niż jeden lub dwa bloki za najlepszy znany head, a [[health-check|health check]] powinien mierzyć tę odległość względem punktu odniesienia, zamiast ufać [[eth-syncing|eth_syncing]], które zwraca `false` na węźle, który skończył synchronizację, a potem się zatrzymał."
        ]
      }
    ],
    example: {
      title: "Ten sam receipt, jeden blok różnicy",
      note: "Obie odpowiedzi są poprawne dla węzłów, które ich udzieliły; myli się tylko wywołujący, który je miesza."
    },
    pitfalls: [
      "Traktowanie odpowiedzi `null` zamiast receiptu z drugiego endpointu jak transakcji, która wypadła z mempoola, i ponowne rozgłaszanie jej z nowym nonce.",
      "Przesuwanie kursora indeksera do `toBlock: \"latest\"` w wersji zgłoszonej przez węzeł, który akurat odpowiedział; trzeba zapisywać numer bloku, który faktycznie przeskanowano.",
      "Zakładanie, że URL providera to jeden węzeł; to pula, a kolejne żądania mogą cofać się w wysokości.",
      "Alertowanie tylko na bezwzględny wiek bloku, co odpala się przy pominiętych slotach (missed slots); zamiast tego każdy węzeł trzeba porównywać z najlepszym znanym headem."
    ]
  },
  failover: {
    title: "Failover",
    aliases: ["failover", "fallback endpoint", "zapasowy endpoint", "przełączanie upstreamu", "upstream switching", "split brain"],
    summary: "Failover to przeniesienie ruchu RPC na inny upstream, gdy bieżący zawodzi. Wymaga odróżnienia awarii operacyjnych, które warto ponowić gdzie indziej, od deterministycznych odpowiedzi, które każdy upstream powtórzy.",
    sections: [
      {
        heading: "Najpierw klasyfikacja błędu",
        paragraphs: [
          "Większość bugów w failoverze to zła klasyfikacja. Błędy transportu, timeouty oraz HTTP 502, 503 lub 504 oznaczają, że ten upstream niedomaga, a inny może działać dobrze. HTTP 429 i kod błędu [[rpc-errors|JSON-RPC]] `-32005` oznaczają przekroczenie limitu na tym upstreamie, więc trzeba przenieść ruch i zastosować backoff właśnie wobec niego. Komunikaty `-32000` od serwera, takie jak 'header not found' albo 'missing trie node', oznaczają, że węzłowi brakuje danych, które inny węzeł może mieć.",
          "Błędy deterministyczne nie mogą wyzwalać failoveru. `-32602` invalid params to bug po stronie wywołującego. Revert zwrócony jako kod `3` z `data` revertu albo jako `-32000` z 'execution reverted' to poprawna odpowiedź o łańcuchu: ponowienie go na trzech upstreamach zużywa trzy razy więcej limitu i daje ten sam wynik. `-32601` method not found to przypadek pośredni: oznacza, że temu upstreamowi brakuje danej [[namespaces|przestrzeni nazw]], więc poprawnie skonfigurowana pula może ją obsłużyć, a ten konkretny upstream nigdy."
        ]
      },
      {
        heading: "Weryfikacja zastępcy",
        paragraphs: [
          "Awansowanie niesprawdzonego upstreamu zamienia awarię w ciche psucie danych. Zanim węzeł dostanie ruch, trzeba sprawdzić, czy [[chain-id|eth_chainId]] zgadza się z zamierzonym łańcuchem, czy [[eth-syncing|eth_syncing]] zwraca `false` i czy jego head jest najwyżej blok lub dwa za najlepszym znanym headem. Inaczej failover prowadzi od endpointu, który zwraca błędy, do takiego, który odpowiada nieaktualnymi danymi, a to jest jednoznacznie gorsze. Trzeba też sprawdzić [[endpoint-capabilities|możliwości]]: upstream bez [[trace-api|trace_]] albo bez archiwalnej głębokości zacznie zwracać błędy akurat dla tych żądań, które były ważne.",
          "Powrót na główny upstream (failback) wymaga tej samej ostrożności. Zamiast wracać na niego w chwili, gdy przejdzie jeden health check, trzeba użyć cooldownu i [[circuit-breaker|próby w trybie półotwartym (half-open)]], a przy przełączeniu spodziewać się, że head pozornie się cofnie, więc warto prowadzić high-water mark opisany w [[head-lag|spójności heada]]."
        ]
      },
      {
        heading: "Transakcje i strumienie",
        paragraphs: [
          "Wysyłanie transakcji to niebezpieczna ścieżka. [[eth-send-raw-transaction|eth_sendRawTransaction]] jest idempotentne w tym sensie, że ponowne wysłanie identycznych podpisanych bajtów nie może utworzyć drugiej transakcji; w najgorszym razie pojawi się błąd 'already known' albo 'nonce too low'. Rozgłaszanie tego samego podpisanego payloadu do kilku upstreamów naraz jest więc bezpieczne i dobrze chroni przed sytuacją, w której jeden provider go zgubi. Niebezpieczne jest natomiast pytanie dwóch upstreamów o następny [[nonce|nonce]]: ich widoki `pending` się różnią, więc albo podpisze się dwie różne transakcje z tym samym nonce, albo powstanie luka, która zablokuje kolejkę. Źródło nonce powinno być jedno, najlepiej własny licznik uzgadniany z `latest`.",
          "Strumieni [[websocket-transport|WebSocket]] nie da się przełączyć na inny upstream w sposób przezroczysty. Gdy połączenie przechodzi na inny węzeł, każda [[eth-subscribe|subskrypcja]] znika, a nowy węzeł zaczyna od własnego heada. Trzeba zasubskrybować ponownie, a potem uzupełnić lukę ograniczonym zakresem [[eth-get-logs|eth_getLogs]] od ostatniego w pełni przetworzonego bloku; to samo dotyczy [[eth-filters|filtrów]] po stronie serwera, których id nie istnieją na nowym upstreamie."
        ]
      }
    ],
    example: {
      title: "Tabela decyzji o failoverze",
      note: "Wszystko nad linią invalid params dotyczy upstreamu; wszystko pod nią dotyczy żądania albo łańcucha, a zmiana endpointu tylko mnoży koszt."
    },
    pitfalls: [
      "Failover przy revercie, który zamienia jeden poprawny błąd w trzy płatne żądania i mylący log.",
      "Awansowanie zapasowego endpointu bez sprawdzenia chain ID, przez co testnet albo endpoint forka zaczyna odpowiadać na zapytania produkcyjne.",
      "Odczytywanie nonce z tego upstreamu, który akurat odpowie, co pod obciążeniem daje transakcje z powtórzonym nonce albo z lukami.",
      "Uznawanie ponownie połączonego WebSocketu za sprawny bez uzupełnienia bloków pominiętych w czasie przerwy."
    ]
  },
  retries: {
    title: "Ponawianie (retry) i idempotentność",
    aliases: [
      "retry",
      "ponawianie",
      "ponowienie",
      "backoff",
      "jitter",
      "exponential backoff",
      "idempotent",
      "idempotentność",
      "already known",
      "utracona odpowiedź",
      "lost response"
    ],
    summary: "Polityka ponowień decyduje, które nieudane wywołania RPC wysłać jeszcze raz: odczyty są czyste i zawsze można je bezpiecznie powtórzyć, a [[eth-send-raw-transaction|eth_sendRawTransaction]] jest bezpieczne tylko dlatego, że hash transakcji wyznacza podpis.",
    sections: [
      {
        heading: "Odczyty są bezpieczne, w konkretnym sensie",
        paragraphs: [
          "Odczyt to czysta funkcja metody, jej parametrów i bloku, na którym udzielono odpowiedzi, więc powtórzenie [[eth-get-balance|eth_getBalance]] albo [[eth-get-logs|eth_getLogs]] kosztuje tylko czas i limit zapytań. Haczyk tkwi w bloku: wywołanie, które rozwiązuje [[block-tag|tag]] `latest`, przy drugiej próbie dostaje odpowiedź na innym bloku, więc ponowiony odczyt jest deterministyczny tylko wtedy, gdy wcześniej przypięto jawny numer albo [[block-hash|hash bloku]]. Gdy kilka wywołań musi się zgadzać, head trzeba rozwiązać raz.",
          "Ponawiać trzeba tylko awarie operacyjne. Timeouty, zerwane połączenia, HTTP 502, 503, 504 i błędy wewnętrzne `-32603` oznaczają, że żądanie nigdy nie dostało merytorycznej odpowiedzi. HTTP 429 i kod [[rpc-errors|JSON-RPC]] `-32005` oznaczają throttling, więc trzeba odczekać i najlepiej przenieść się gdzie indziej. Revert zwrócony jako kod `3` z `data` revertu, `-32602` invalid params i `-32601` method not found to odpowiedzi merytoryczne; każdy inny upstream w puli je powtórzy, więc pętla tylko mnoży rachunek. [[failover|Failover]] przebiega według tej samej granicy."
        ]
      },
      {
        heading: "Jedyny zapis i jego utracona odpowiedź",
        paragraphs: [
          "[[eth-send-raw-transaction|eth_sendRawTransaction]] to jedyna popularna metoda, która cokolwiek zmienia, i jest idempotentna z samej konstrukcji. Hash transakcji to hash [[keccak-256|Keccak-256]] podpisanych bajtów, więc dwukrotne wysłanie dokładnie tych samych bajtów nie może utworzyć dwóch transakcji: druga próba zwraca ten sam hash albo błąd `already known`, a jedno i drugie oznacza sukces. Rozgłoszenie jednego podpisanego payloadu do kilku endpointów naraz przetrwa więc sytuację, w której jeden provider go zgubi.",
          "Idempotentna nie jest natomiast reakcja na utraconą odpowiedź. Węzeł może przyjąć transakcję i rozesłać ją przez gossip, a mimo to zostawić wywołującego z timeoutem, więc nie da się odróżnić przyjęcia od utraty. Hash trzeba policzyć lokalnie przed wysłaniem, a po niejednoznacznej porażce zapytać [[eth-get-transaction-by-hash|eth_getTransactionByHash]]: wynik inny niż `null` oznacza, że transakcja jest w [[mempool|mempoolu]] albo w bloku, a `null` oznacza, że można ponownie wysłać identyczne bajty. Nigdy nie wolno podpisywać jej od nowa z nowym [[nonce|nonce]], bo to druga, inna transakcja i obie mogą trafić do bloku."
        ]
      },
      {
        heading: "Backoff, jitter i budżety",
        paragraphs: [
          "Należy stosować exponential backoff z pełnym jitterem: odczekać losowy czas między zerem a górnym limitem, który podwaja się przy każdej próbie. Bez jittera każdy wywołujący, któremu nie udało się w tej samej sekundzie, wraca w tej samej sekundzie, a upstream, który był tylko chwilowo wolny, pada na dobre. Gdy odpowiedź 429 zawiera `Retry-After`, trzeba go respektować, a całość ograniczyć deadline'em wywołującego, trzema lub czterema próbami i budżetem ponowień.",
          "Ponowienia wpływają na koszt. Providerzy rozliczają się w compute units, więc pętla na trace `debug_` jest droga w sposób, w jaki pętla na [[eth-block-number|eth_blockNumber]] nie jest; zobacz [[rate-limits|rate limity]]. Ponowiony [[batch-request|batch]] trzeba składać po `id`, a nie po pozycji, bo batch częściowo zablokowany przez rate limit wraca krótszy, niż został wysłany. Większość [[client-libraries|bibliotek klienckich]] już ponawia żądania z domyślnymi ustawieniami, których nikt świadomie nie wybrał, więc warto je przeczytać, zanim doda się własne."
        ]
      }
    ],
    example: {
      title: "Wysłana transakcja, której odpowiedź zginęła",
      note: "Identyczne bajty zawsze można bezpiecznie wysłać ponownie; świeżo podpisany zamiennik to inna transakcja i bezpieczny nie jest."
    },
    pitfalls: [
      "Ponawianie revertu, które zamienia jedną poprawną odpowiedź w trzy płatne żądania.",
      "Ponowne podpisywanie po timeoucie zamiast zapytania o hash, który już policzono lokalnie.",
      "Ponawianie bez jittera, przez co wszyscy wywołujący, którym się nie udało, wracają w tym samym momencie i dobijają upstream w trakcie awarii.",
      "Traktowanie `already known` albo `nonce too low` przy ponownym wysłaniu jako porażki; jedno i drugie oznacza, że transakcja już jest w sieci."
    ]
  },
  caching: {
    title: "Cache'owanie odpowiedzi RPC",
    aliases: ["cache", "cache RPC", "cache'owanie", "TTL", "niezmienna odpowiedź", "klucz cache", "negative caching"],
    summary: "Cache RPC przechowuje odpowiedzi, które nigdy się nie zmienią: wszystko, co adresuje się [[block-hash|hashem bloku]], albo co wyliczono na bloku `finalized` lub wcześniejszym. Nie wolno mu natomiast przechowywać odpowiedzi wyliczonych dla [[block-tag|tagów]] `latest` i `pending`.",
    sections: [
      {
        heading: "Co naprawdę jest niezmienne",
        paragraphs: [
          "O tym, czy odpowiedź można cache'ować, decyduje blok, na którym ją wyliczono, a nie metoda. Bloku na wysokości [[block-tag|tagu]] `finalized` lub niższej nie da się zastąpić bez awarii konsensusu, więc jego nagłówek, transakcje, receipty, [[event-log|logi]] i każdy stan odczytany na tej wysokości są ustalone na zawsze. Wszystko, co adresuje się [[block-hash|hashem bloku]], w tym parametr EIP-1898 `{\"blockHash\": …}`, jest ustalone w inny sposób: hash jednoznacznie wyznacza treść, ale sam blok wciąż może wypaść z kanonicznego łańcucha.",
          "Między `finalized` a head odpowiedź jest tymczasowa. [[reorg|Reorg]] może ją przepisać, więc wpisy z tego okna potrzebują krótkiego TTL (czasu życia wpisu) i mechanizmu inwalidacji, który usuwa wszystko powyżej nowego wspólnego przodka. Jeszcze wyżej leżą `latest` i `pending`, których w ogóle nie da się cache'ować: `latest` przesuwa się co 12-sekundowy [[slot-epoch|slot]], a `pending` opisuje [[mempool|mempool]] jednego węzła. Odpowiedzi konfiguracyjne, takie jak [[chain-id|eth_chainId]] i `web3_clientVersion`, są stałe przez cały czas życia upstreamu."
        ]
      },
      {
        heading: "Klucze i rodzaje odpowiedzi",
        paragraphs: [
          "Klucz buduje się z metody, znormalizowanych parametrów i bloku po rozwiązaniu tagu, nigdy z surowego body żądania. Klucz z body wygląda na unikalny, ale dla wywołań z `latest` pozostaje taki sam, choć odpowiedź już się zmieniła, i właśnie tak nieaktualny wynik [[eth-call|eth_call]] potrafi godzinami przeżyć blok, na którym go wyliczono. Przed hashowaniem trzeba znormalizować dane: adresy małymi literami, kanoniczne kodowanie [[hex-encoding|QUANTITY]], żeby `0x0` i `0x00` trafiały do jednego wpisu, pominięte parametry opcjonalne uzupełnione wartościami domyślnymi, a tag `latest` zamieniony na numer bloku przez samą warstwę cache.",
          "[[batch-request|Batche]] trzeba rozbić, sprawdzić w cache element po elemencie i złożyć z powrotem według `id`, więc cache, który widzi tylko całe body, prawie nie ma trafień w ruchu batchowym. Błędy cache'uje się świadomie: revert na ustalonym bloku to deterministyczna odpowiedź i można go cache'ować, a 429 i `-32005` opisują wykorzystanie limitu, a nie łańcuch, więc nie wolno ich przechowywać. Najbardziej zdradliwy jest negative caching (zapamiętywanie braku wyniku), bo `null` z [[eth-get-transaction-receipt|eth_getTransactionReceipt]] zwykle oznacza [[head-lag|opóźnienie head]], a zapisanie go w cache zamienia chwilową lukę w trwałą."
        ]
      },
      {
        heading: "Gdzie trzymać cache",
        paragraphs: [
          "Cache w procesie daje najtańsze trafienie, ale nikt inny z niego nie korzysta; warstwa Redis przed [[rpc-gateway|gatewayem RPC]] daje jeden wspólny hit rate (odsetek trafień) dla wszystkich instancji i to w niej powinny być reguły dla poszczególnych metod. Sieci CDN pasują tu słabo, bo JSON-RPC korzysta z HTTP POST z żądaniem w body, a CDN buduje klucz z metody HTTP i adresu URL. Potrzebny jest więc gateway, który hashuje body do klucza, albo fasada REST tylko do odczytu.",
          "Hit rate trzeba mierzyć osobno dla każdej metody, a nie łącznie. Realne oszczędności cache daje przy głębokich odczytach z [[archive-node|węzła archiwalnego]] i przy skanach [[eth-get-logs|eth_getLogs]] po zakresach, które już się nie zmienią, a właśnie je łączny wskaźnik chowa za milionami tanich zapytań o head."
        ]
      }
    ],
    example: {
      title: "Co można cache'ować i jak długo",
      note: "Granicę nigdy nie wyznacza metoda, tylko blok, na którym wyliczono odpowiedź."
    },
    pitfalls: [
      "Budowanie klucza z surowego body żądania, przez co `eth_call` na `latest` dostaje stały klucz dla odpowiedzi, która zmienia się z każdym blokiem.",
      "Zapisanie w cache `null` zamiast receiptu, co zamienia kilka sekund opóźnienia head w trwale błędną odpowiedź.",
      "Cache'owanie odpowiedzi między `finalized` a head bez inwalidacji przy reorgu, przez co przepisany blok jest dalej serwowany.",
      "Pominięcie normalizacji parametrów, co obniża hit rate o połowę i ukrywa, że dwa klucze przechowują tę samą odpowiedź."
    ]
  },
  "rate-limits": {
    title: "Rate limity i compute units",
    aliases: [
      "rate limits",
      "rate limit",
      "limit zapytań",
      "429",
      "-32005",
      "throttling",
      "compute units",
      "CU",
      "limit miesięczny",
      "quota",
      "limit zakresu bloków"
    ],
    summary: "Rate limity (limity zapytań) to ograniczenia, które endpoint na ciebie nakłada: żądania na sekundę, współbieżność, miesięczne compute units, zakres bloków, długość batcha, rozmiar odpowiedzi. Przychodzą jako HTTP 429 albo jako [[rpc-errors|błędy JSON-RPC]], nigdy jako dane z łańcucha.",
    sections: [
      {
        heading: "Co dokładnie jest limitowane",
        paragraphs: [
          "O żądaniach na sekundę czyta każdy, a rzadko to one bolą najbardziej. Limit współbieżności określa, ile wywołań może być jednocześnie w toku. Miesięczne budżety liczy się w compute units (jednostkach obliczeniowych), a nie w żądaniach, i każda metoda ma swoją wagę: [[eth-block-number|eth_blockNumber]] kosztuje ułamek [[eth-call|eth_call]], a ten z kolei ułamek [[debug-api|debug_traceBlockByNumber]]. Skanowanie, które wygląda tanio w liczbie żądań, może być rujnujące w jednostkach.",
          "Potem przychodzą limity kształtu. [[eth-get-logs|eth_getLogs]] jest zwykle ograniczony zakresem bloków, liczbą wyników albo rozmiarem odpowiedzi, a czasem wszystkimi trzema naraz, dlatego ten sam zakres przechodzi na spokojnych blokach i nie przechodzi na zatłoczonych. Żądania [[batch-request|batch]] mają limit długości tablicy. Endpointy [[websocket-transport|WebSocket]] ograniczają liczbę połączeń na klucz i [[eth-subscribe|subskrypcji]] na połączenie. Głębokość [[archive-node|archiwum]] i przestrzeń nazw [[trace-api|trace_]] często zależą od planu, a nie od rate limitu, i zawodzą inaczej; zobacz [[endpoint-capabilities|możliwości endpointu]]."
        ]
      },
      {
        heading: "Jak zgłaszany jest limit",
        paragraphs: [
          "Limity zgłaszają dwie warstwy i nie zgadzają się co do formatu. Edge proxy odpowiada HTTP 429, często z nagłówkiem `Retry-After` i body, które wcale nie jest JSON-RPC, więc klient, który na ślepo parsuje każdą odpowiedź jako format komunikatu JSON-RPC (envelope), rzuca błąd parsowania i podaje złą przyczynę. Węzeł albo własna warstwa providera odpowiada natomiast HTTP 200 z błędem JSON-RPC: `-32005` to kod „limit exceeded” z [[eip|EIP-1474]], a błędy serwera z zakresu `-32000` niosą komunikaty takie jak `query returned more than 10000 results`.",
          "W batchach częściowa porażka jest normalna. Batch może wrócić z wynikami dla części wartości `id` i z `-32005` dla pozostałych, więc każdy element potrzebuje własnego wyniku; traktowanie tablicy jako „wszystko albo nic” po cichu gubi dane. Żadna z tych odpowiedzi nie mówi niczego o łańcuchu. 429 nie oznacza, że bloku brakuje, a [[indexer|indekser]], który przesuwa kursor za zakres odrzucony przez limit, zostawia trwałą dziurę."
        ]
      },
      {
        heading: "Jak zmieścić się pod limitem",
        paragraphs: [
          "Najpierw trzeba samemu ograniczyć tempo. [[circuit-breaker|Token bucket]] po stronie klienta ustawiony trochę poniżej opublikowanej stawki i do tego ograniczona pula współbieżności zamieniają twardą awarię zewnętrzną w miękką kolejkę wewnętrzną. Przy błędzie zakresu trzeba zmniejszyć okno [[eth-get-logs|eth_getLogs]] o połowę, ponowić od tego samego [[cursor-pagination|kursora]] i powoli z powrotem je powiększać. Zamiast dziesiątek pojedynczych odczytów receiptów po hashu lepiej użyć jednego [[eth-get-block-receipts|eth_getBlockReceipts]], a wszystko, co jest już ostateczne, trzymać w [[caching|cache]]. Do tego [[retries|backoff]] z jitterem i [[failover|failover]] na drugi upstream, żeby klucz pod throttlingiem zrzucał obciążenie, zamiast zasypywać endpoint żądaniami."
        ]
      }
    ],
    example: {
      title: "Trzy sposoby, na jakie endpoint mówi „nie”",
      note: "Status HTTP i kod JSON-RPC są od siebie niezależne: 200 może nieść błąd limitu, a 429 może w ogóle nie mieć [[request-response|formatu komunikatu JSON-RPC (envelope)]]."
    },
    pitfalls: [
      "Traktowanie 429 jako „brak danych” i przesuwanie kursora skanowania za zakres, którego nigdy faktycznie nie odczytano.",
      "Parsowanie każdej odpowiedzi jako formatu komunikatu JSON-RPC; 429 z warstwy edge to często HTML albo zwykły tekst.",
      "Ponawianie identycznego, zbyt dużego zakresu `eth_getLogs` zamiast zmniejszenia go o połowę.",
      "Budżetowanie w żądaniach, gdy provider rozlicza compute units, przez co jedno zadanie tracingu zjada budżet na cały miesiąc.",
      "Zakładanie, że batch albo w całości się udaje, albo w całości zawodzi, i wyrzucanie razem z nim udanych elementów."
    ]
  },
  authentication: {
    title: "Uwierzytelnianie RPC",
    aliases: ["RPC authentication", "klucz API", "API key", "JWT", "HS256", "jwtsecret", "bearer token", "iat", "mTLS"],
    summary: "Uwierzytelnianie RPC to sposób, w jaki endpoint decyduje, kto w ogóle może go wywołać: klucz API dla hostowanego endpointu, JWT ze współdzielonym sekretem dla [[engine-api|Engine API]] i ograniczenia na poziomie sieci dla całej reszty.",
    sections: [
      {
        heading: "Publiczny interfejs go nie ma",
        paragraphs: [
          "Interfejs [[json-rpc|JSON-RPC]] warstwy wykonawczej nie definiuje żadnego uwierzytelniania. Listener `--http` w kliencie odpowiada każdemu, kto dosięgnie portu, więc prawdziwą granicą jest sieć: bind na `127.0.0.1`, [[reverse-proxy|reverse proxy]] z przodu dla TLS i poświadczeń oraz firewall, który decyduje, kto może się połączyć. Wszystko inne, co się na to nakłada, to dodatek operatora, a nie część [[execution-apis|specyfikacji]].",
          "Hostowane endpointy dodają klucz, albo w ścieżce, jak `https://rpc.example/v2/<key>`, albo w nagłówku. Klucz w ścieżce trafia do logów proxy, historii przeglądarki i nagłówków referrer, więc tam, gdzie klient na to pozwala, lepszy jest nagłówek. Aplikacja w przeglądarce w ogóle nie utrzyma sekretu: trzeba użyć allowlisty domen opartej na nagłówku `Origin` albo proxy przez własny backend, a w każdym z tych wariantów dodać [[rate-limits|rate limity]] na klucz, żeby wyciek klucza oznaczał ograniczoną stratę, a nie otwarty rachunek."
        ]
      },
      {
        heading: "Engine API to wyjątek",
        paragraphs: [
          "Port 8551 jest uwierzytelniony i to jedyny interfejs w tej mapie, w którym uwierzytelnianie jest wyspecyfikowane, a nie improwizowane. [[execution-client|Klient wykonawczy]] i [[consensus-client|klient konsensusu]] współdzielą 32-bajtowy sekret w hex zapisany w pliku, a każde żądanie niesie `Authorization: Bearer <token>` z JWT podpisanym tym sekretem algorytmem HS256. Claim `iat` musi się mieścić w 60 sekundach od zegara węzła odbierającego, więc protokół jest też luźnym dowodem, że druga strona żyje (liveness).",
          "Ten projekt ma praktyczną konsekwencję, gdy klient wykonawczy i klient konsensusu działają na osobnych maszynach: dryf zegara między nimi wygląda jak błąd uwierzytelniania. Na jednej maszynie oba procesy czytają ten sam zegar, więc dryf między nimi nie może powstać. Węzeł, którego czas uciekł poza 60-sekundowe okno, przestaje przyjmować [[engine-payload|engine_forkchoiceUpdated]] i `engine_newPayload`, para się rozpada, a logi mówią „invalid token” zamiast czegokolwiek o czasie. Trzeba uruchomić NTP, wskazać obu procesom ten sam plik z sekretem i pozwolić na jego odczyt tylko im. JWT nie autoryzuje użytkownika; dowodzi, że te dwa procesy to zamierzona para, i dlatego port 8551 nadal powinien być dostępny tylko na loopbacku."
        ]
      },
      {
        heading: "Więcej niż jeden klucz",
        paragraphs: [
          "Warto wydawać osobny klucz dla każdej aplikacji, żeby jeden dało się unieważnić bez awarii, i traktować klucze jako identyfikatory, a nie autoryzację: klucz ważny do odczytów zwykle jest ważny do wszystkiego, co endpoint udostępnia. Prawdziwa autoryzacja jest warstwę wyżej, w [[rpc-gateway|gatewayu]], który mapuje klucz na allowlistę metod, górny limit zakresu bloków i limit wykorzystania (quota). Dla połączeń maszyna–maszyna we własnej sieci mutual TLS i allowlisty IP są mocniejsze niż ciąg bearer, bo żadne z nich nie podróżuje w URL."
        ]
      }
    ],
    example: {
      title: "JWT z Engine API po zdekodowaniu",
      note: "Payload niesie prawie nic; `iat` to całe sprawdzenie świeżości, i dlatego dryfujący zegar wygląda dokładnie jak zły sekret."
    },
    pitfalls: [
      "Umieszczanie klucza API w bundlu JavaScriptu dla przeglądarki; wszystko w kodzie frontendu jest publiczne, więc zamiast tego trzeba użyć proxy albo allowlisty.",
      "Wystawianie portu 8551 poza loopback, bo „ma JWT”; token uwierzytelnia parę procesów, a nie internet.",
      "Wskazanie obu klientom różnych plików z sekretem po ponownym wdrożeniu, co wygląda jak ogólny błąd uwierzytelniania.",
      "Ignorowanie synchronizacji zegara, przez co węzeł wychodzi poza 60-sekundowe okno `iat` i po cichu przestaje podążać za łańcuchem.",
      "Współdzielenie jednego klucza między środowiskami, przez co unieważnienie klucza, który wyciekł, kładzie też produkcję."
    ]
  },
  "reverse-proxy": {
    title: "Reverse proxy i TLS",
    aliases: [
      "reverse proxy",
      "nginx",
      "Caddy",
      "HAProxy",
      "Traefik",
      "terminacja TLS",
      "TLS termination",
      "proxy_pass",
      "WebSocket upgrade",
      "upgrade WebSocket"
    ],
    summary: "Reverse proxy, takie jak nginx, Caddy, HAProxy albo Traefik, stoi między internetem a portem RPC węzła: terminuje TLS, ogranicza rozmiar body i tempo żądań oraz przekazuje upgrade połączenia do [[websocket-transport|WebSocket]], dzięki czemu sam klient nigdy nie nasłuchuje na publicznym adresie.",
    sections: [
      {
        heading: "Co należy do tej warstwy",
        paragraphs: [
          "[[execution-client|Klient wykonawczy]] obsługuje tylko zwykłe HTTP; `--http` nie ma opcji TLS, więc certyfikat musi pochodzić skądinąd. To pierwsze zadanie proxy: Caddy sam uzyskuje i odnawia certyfikaty, a nginx robi to przez certbota. Drugie zadanie to limity, które nie wymagają rozumienia JSON-RPC: limit rozmiaru body żądania, żeby jeden zbyt duży [[batch-request|batch]] nie mógł obciążyć pamięci węzła, limity połączeń i żądań na adres IP, timeouty odczytu i wysyłania oraz access logi z prawdziwym adresem klienta.",
          "Nie należy tu natomiast nic, co wymaga sparsowania komunikatu JSON-RPC (envelope). Routing według metody, [[caching|cache'owanie]] z kluczem opartym na bloku i allowlisty metod wymagają zdekodowania żądania, a proxy, które dopasowuje body żądań wyrażeniami regularnymi, potyka się o białe znaki, batche i kolejność parametrów. Ta praca należy do [[rpc-gateway|gatewaya RPC]]: proxy odpowiada za transport, a gateway stoi za nim."
        ]
      },
      {
        heading: "Upgrade połączenia i timeouty",
        paragraphs: [
          "Ruch [[websocket-transport|WebSocket]] potrzebuje osobnego bloku location. Bez `proxy_http_version 1.1` i bez przekazania nagłówków `Upgrade` i `Connection` handshake od razu kończy się błędem. Z nimi, ale bez podniesionego `proxy_read_timeout`, handshake się udaje, a potem połączenie umiera: nginx domyślnie zamyka je po 60 sekundach bez żadnych danych do odczytu, a strumień [[eth-subscribe|eth_subscribe]], na którym rzadko coś się dzieje, jest z definicji bezczynny. Wywołujący widzą więc połączenie zrywane co minutę i winią węzeł.",
          "Przy HTTP problem jest odwrotny. Głęboki trace [[debug-api|debug_]] albo szeroki skan [[eth-get-logs|eth_getLogs]] może trwać dłużej niż domyślny timeout proxy; wywołujący dostaje wtedy 504, a węzeł [[request-cancellation|dalej pracuje nad zapytaniem, którego wyniku nikt nie odczyta]]. Timeout proxy trzeba ustawić powyżej najwolniejszego zapytania, na które chce się pozwolić, a ograniczać same zapytania, zamiast traktować proxy jako limit."
        ]
      },
      {
        heading: "Prywatne interfejsy zostają prywatne",
        paragraphs: [
          "Za proxy powinien stać tylko publiczny port JSON-RPC. [[engine-api|Engine API]] na porcie 8551 i [[ipc-transport|socket IPC]] w ogóle nie mogą być wystawione przez proxy, a węzeł powinien dalej nasłuchiwać tylko na `127.0.0.1`, żeby proxy było jedyną drogą, a nie sugestią. Trzeba przekazywać `X-Forwarded-For` albo używać protokołu PROXY, bo bez tego każdy rate limit i każda linia logu widzą jeden adres: adres samego proxy.",
          "Terminacja TLS zmienia nagłówek `Host`, który widzi węzeł, a właśnie ten nagłówek sprawdza `--http.vhosts` w [[geth|Geth]]. Trzeba tam ustawić publiczną nazwę hosta, inaczej żądania kończą się błędem `invalid host specified`. To sprawdzenie jest zabezpieczeniem i nie jest tym samym co `--http.corsdomain`, który dotyczy tylko przeglądarek; różnicę opisuje [[security|bezpieczeństwo RPC]]."
        ]
      }
    ],
    example: {
      title: "nginx przed węzłem dla HTTP i WebSocket",
      note: "Węzeł trzeba uruchomić z `--http.addr 127.0.0.1 --http.vhosts rpc.example`, żeby ten blok był jedyną drogą do węzła, a przekazywany przez niego nagłówek `Host` był akceptowany."
    },
    pitfalls: [
      "Wystawianie WebSocketu przez proxy bez `proxy_http_version 1.1` i nagłówków `Upgrade`, przez co handshake kończy się błędem 400.",
      "Zostawienie `proxy_read_timeout` na 60 sekundach, co jak w zegarku zabija bezczynne subskrypcje i długie wywołania trace.",
      "Dodanie proxy, gdy węzeł wciąż nasłuchuje na `0.0.0.0`, przez co dla atakującego proxy jest opcjonalne.",
      "Zapomnienie o `--http.vhosts` po wprowadzeniu terminacji TLS i branie `invalid host specified` za błąd konfiguracji proxy.",
      "Nieprzekazywanie adresu klienta, przez co rate limity per IP dławią wszystkich jak jednego wywołującego."
    ]
  },
  security: {
    title: "Bezpieczeństwo RPC",
    aliases: [
      "bezpieczeństwo węzła",
      "hardening",
      "utwardzanie węzła",
      "otwarty węzeł",
      "open node",
      "DNS rebinding",
      "http.vhosts",
      "corsdomain",
      "wystawione RPC",
      "exposed RPC"
    ],
    summary: "Bezpieczeństwo RPC polega na tym, żeby endpoint nie robił niczego poza odpowiadaniem na odczyty: żadnych publicznie dostępnych metod [[admin-api|admin_]], [[debug-api|debug_]], `personal_` ani [[txpool-api|txpool_]], żadnych odblokowanych kont, żadnych nieograniczonych zapytań i żadnego listenera na adresie, który go nie potrzebował.",
    sections: [
      {
        heading: "Przestrzenie nazw, które nigdy nie mogą być publiczne",
        paragraphs: [
          "[[namespaces|Przestrzenie nazw]] to pierwsza linia kontroli, bo decydują, co endpoint w ogóle potrafi zrobić. `admin_` dodaje i usuwa peery oraz uruchamia listenery. `personal_`, od dawna przestarzałe i usunięte z [[geth|Getha]], odblokowuje klucze i podpisuje nimi. `debug_` uruchamia tracery, które potrafią zająć rdzeń na minuty przy jednym wywołaniu i zrzucać surowe dane wewnętrzne węzła. `txpool_` ujawnia zbiór transakcji pending, czyli cenne informacje o order flow i wyciek prywatności użytkowników, którzy wysyłają transakcje przez ten węzeł. Publiczny endpoint powinien udostępniać `eth`, `net` i `web3`, i nic więcej.",
          "Geth domyślnie udostępnia właśnie ten wąski zestaw; domyślna lista modułów w Nethermind jest szersza, więc na każdym publicznym listenerze trzeba ją ustawić jawnie. Poza tym szkody wyrządzają tutoriale, które tę listę poszerzają. [[geth|Geth]] przyjmuje `--http.api eth,net,web3`, [[nethermind|Nethermind]] przyjmuje `--JsonRpc.EnabledModules [Eth,Net,Web3]`, a [[engine-api|Engine API]] działa na własnym, uwierzytelnionym porcie, poza tą listą. Jeśli jakaś przestrzeń nazw jest naprawdę potrzebna jednemu wewnętrznemu odbiorcy, lepiej wystawić ją na osobnym listenerze nasłuchującym na prywatnym interfejsie, niż poszerzać publiczny."
        ]
      },
      {
        heading: "Adres nasłuchu, hosty i CORS",
        paragraphs: [
          "`--http.addr 127.0.0.1` jest domyślne nie bez powodu. Skanery znajdują węzeł nasłuchujący na `0.0.0.0` pod publicznym adresem w ciągu kilku godzin, a liczenie otwartych portów [[json-rpc|JSON-RPC]] w internecie to czyjeś stałe hobby. Nasłuch na loopbacku to jednak nie koniec, bo istnieje [[cors|DNS rebinding]]: strona w domenie atakującego może sprawić, że przeglądarka rozwiąże tę domenę na `127.0.0.1`, a potem wyśle do węzła żądania z tego samego originu. Obroną jest `--http.vhosts`, allowlista nagłówka `Host`, domyślnie `localhost`.",
          "`--http.corsdomain` jest notorycznie mylony z vhosts, a robi coś zupełnie innego. Ustawia `Access-Control-Allow-Origin`, czyli regułę przeglądarki o tym, które strony mogą odczytać odpowiedź; skrypty, serwery i `curl` nigdy jej nie respektowały i jej nie podlegają. Ustawienie go na `*` nie otwiera węzła, który już był osiągalny, a wąskie ustawienie nie chroni węzła, który jest osiągalny. Vhosts to zabezpieczenie, corsdomain to wygoda."
        ]
      },
      {
        heading: "Ataki DoS i ścieżki do pieniędzy",
        paragraphs: [
          "Powierzchnią ataku DoS są odczyty. Nieograniczony zakres [[eth-get-logs|eth_getLogs]], `debug_traceBlockByNumber` na zatłoczonym bloku, [[batch-request|batch]] z tysiącem elementów albo [[eth-call|eth_call]] z ogromnym limitem gasu kosztują węzeł dużo więcej niż wywołującego. Trzeba ograniczyć zakres bloków, długość batcha i rozmiar body, stosować [[rate-limits|rate limity]] per IP na [[reverse-proxy|proxy]] i trzymać `--rpc.gascap` w [[geth|Geth]] na rozsądnym poziomie, żeby jedno wywołanie nie mogło zająć rdzenia.",
          "Przy ścieżkach do pieniędzy zasady są krótsze. Nigdy nie należy uruchamiać węzła z odblokowanymi kontami, gdy osiągalne jest [[eth-send-transaction|eth_sendTransaction]] albo [[signing-methods|personal_sign]]; takie połączenie to bezpośrednia droga do wyprowadzenia środków i właśnie dlatego `personal_` usunięto, zamiast je naprawiać. Plik z [[authentication|sekretem JWT]] powinien być czytelny tylko dla dwóch procesów klientów, a logi RPC trzeba traktować jako wrażliwe, bo zapisują każdy adres i kontrakt, z którym mieli do czynienia użytkownicy."
        ]
      }
    ],
    example: {
      title: "Niebezpieczne flagi i te właściwe",
      note: "Każda dodatkowa przestrzeń nazw na pierwszej liście to uprawnienie przekazane każdemu, kto dosięgnie portu."
    },
    pitfalls: [
      "Kopiowanie `--http.api eth,net,web3,txpool,debug,admin,personal` z tutorialu napisanego dla lokalnego devnetu.",
      "Przekonanie, że nasłuch na loopbacku wystarczy na maszynie z przeglądarką; DNS rebinding to obchodzi, chyba że ustawiono `--http.vhosts`.",
      "Traktowanie `--http.corsdomain` jak kontroli dostępu; ogranicza tylko przeglądarki, nigdy serwery ani skrypty.",
      "Publiczne wystawienie portu 8551, bo Engine API ma JWT; token łączy w parę dwa procesy i nie jest pomyślany jako ochrona portu wystawionego na świat.",
      "Zostawienie otwartego `txpool_` na węźle, przez który wysyłają transakcje własni użytkownicy, co publikuje ich transakcje pending."
    ]
  },
  observability: {
    title: "Obserwowalność RPC",
    aliases: ["observability", "monitoring", "metryki", "Prometheus", "Grafana", "alerty", "alerting", "SLO", "head age"],
    summary: "Obserwowalność (observability) RPC to zestaw sygnałów, które pokazują, że endpoint odpowiada poprawnie, a nie tylko że w ogóle odpowiada: latencja i błędy dla każdej metody, odległość head od punktu odniesienia, status synchronizacji i peerów węzła oraz alerty, które reagują na zatrzymany head, a nie na zamknięty port.",
    sections: [
      {
        heading: "Sygnały na edge'u",
        paragraphs: [
          "Mierzy się zawsze osobno dla każdej metody. Jedno `debug_traceBlockByNumber` i milion wywołań [[eth-block-number|eth_blockNumber]] uśredniają się do liczby, która nie opisuje ani jednego, ani drugiego, więc histogramy latencji, odsetek błędów i liczba żądań muszą mieć metodę jako label. Tam, gdzie żądanie ma argument bloku, warto dodać także ten argument: bez niego nie da się odróżnić wolnego zapytania [[archive-node|archiwalnego]] od wolnego węzła.",
          "Kody błędów [[rpc-errors|JSON-RPC]] trzeba liczyć osobno od statusów HTTP. Odpowiedź 200 z `-32005` to dla wywołującego całkowita awaria, a wszystkie dashboardy HTTP pozostają zielone. Ta luka to najczęstszy powód, dla którego o incydencie pierwsi informują użytkownicy, zanim zauważy go zespół. Warto śledzić rozmiary [[batch-request|batchy]] i odpowiedzi, połączenia [[websocket-transport|WebSocket]] i liczbę subskrypcji na połączenie, odsetek trafień w [[caching|cache]], a przy własnym [[rpc-gateway|gatewayu RPC]] także to, jak często każdy upstream jest wybierany i wyrzucany z puli."
        ]
      },
      {
        heading: "Sygnały z węzła",
        paragraphs: [
          "Klienci eksportują metryki Prometheus, a zespoły, które je rozwijają, publikują do nich dashboardy Grafany. [[geth|Geth]] przyjmuje `--metrics --metrics.addr 127.0.0.1 --metrics.port 6060` i serwuje `/debug/metrics/prometheus`; [[nethermind|Nethermind]] używa `--Metrics.Enabled true` razem z `--Metrics.ExposePort`; [[besu|Besu]] używa `--metrics-enabled`; [[lighthouse|Lighthouse]] i pozostali [[consensus-client|klienci konsensusu]] udostępniają `--metrics`, w przypadku Lighthouse na porcie 5054. Trzeba scrapować obie połówki pary, a nie tylko [[execution-client|klienta wykonawczego]].",
          "Na węźle liczą się: numer bloku head i jego timestamp, liczba peerów osobno dla każdej warstwy, status synchronizacji, zapas miejsca na dysku i latencja IO oraz czas round-trip [[engine-api|Engine API]]. Ten ostatni to najlepsze dostępne wczesne ostrzeżenie: latencja `engine_newPayload` rosnąca w stronę 12-sekundowego interwału [[slot-epoch|slotu]] oznacza, że węzeł zaraz zacznie gubić bloki, i zmienia się dużo wcześniej, niż odpali jakikolwiek alert o opóźnieniu head."
        ]
      },
      {
        heading: "Alerty na właściwe sygnały",
        paragraphs: [
          "Najbardziej użytecznym pojedynczym alertem jest head age (wiek head): porównuje `timestamp` najnowszego [[eth-get-block-by-number|bloku]] z aktualnym czasem i odpala, gdy różnica przekracza mniej więcej 40 sekund, co toleruje kilka pominiętych slotów, ale nie zatrzymanie. Warto połączyć go z head skew, czyli odległością między tym węzłem a najlepszym head znanym w całej flocie węzłów, bo cała flota może być w tyle, choć każdy węzeł z osobna wygląda na aktualny; właśnie to mierzy [[head-lag|spójność head]].",
          "Nie należy alertować na samo [[eth-syncing|eth_syncing]]. Zwraca `false` na węźle, który skończył synchronizację, a potem przestał importować bloki, więc jako liveness check z samej konstrukcji daje wyniki fałszywie negatywne. Warto dodać alerty na liczbę peerów bliską zeru; na [[block-tag|tag]] `finalized`, który stoi, podczas gdy `latest` idzie do przodu, co oznacza, że sieć nie finalizuje albo [[consensus-client|klient konsensusu]] przestał przekazywać tę informację klientowi wykonawczemu; na zmianę odsetka błędów dla danej metody; na zapas miejsca na dysku i na wygasanie certyfikatów."
        ]
      }
    ],
    example: {
      title: "Scrapowanie obu klientów i warstwy przed nimi",
      note: "Scrapowanie tylko klienta wykonawczego ukrywa najczęstszą przyczynę źródłową: klienta konsensusu, który przestał nim sterować."
    },
    pitfalls: [
      "Alertowanie na osiągalność portu albo HTTP 200, które bez problemu spełnia zarówno węzeł w trakcie synchronizacji, jak i zatrzymany.",
      "Uśrednianie latencji ze wszystkich metod, przez co regresja w tracingu znika w ruchu zapytań o head.",
      "Używanie `eth_syncing` jako liveness checku; zwraca `false` na węźle, który przestał importować bloki.",
      "Monitorowanie tylko klienta wykonawczego, choć to klient konsensusu dostarcza mu bloki.",
      "Logowanie metody bez argumentu bloku, przez co wolnych zapytań archiwalnych nie da się odróżnić od wolnego węzła."
    ]
  },
  "health-check": {
    title: "Health checki endpointów",
    aliases: [
      "health check",
      "health checki",
      "liveness",
      "readiness",
      "probe",
      "wiek heada",
      "head age",
      "liczba peerów",
      "peer count",
      "histereza",
      "hysteresis"
    ],
    summary: "Health check endpointu RPC sprawdza, czy endpoint potrafi poprawnie odpowiadać, a nie czy jego port jest otwarty: [[chain-id|chain ID]] musi się zgadzać, [[eth-syncing|eth_syncing]] musi zwracać `false`, a head musi być zarówno świeży, jak i bliski pozostałym węzłom w puli.",
    sections: [
      {
        heading: "Co musi znaczyć „działa”",
        paragraphs: [
          "Połączenie TCP i HTTP 200 nie dowodzą prawie niczego. Węzeł, który wciąż się synchronizuje, przyjmuje połączenia. Węzeł w niewłaściwej sieci pewnie odpowiada na każde wywołanie. Węzeł, którego [[consensus-client|klient konsensusu]] padł, w nieskończoność serwuje ostatni znany head. Klucz u [[rpc-provider|providera]] objęty throttlingiem zwraca poprawny JSON, który akurat jest błędem. Wszystkie cztery „działają” według każdego sprawdzenia na poziomie transportu i są bezużyteczne dla wywołującego.",
          "Prawie wszystko pokrywają cztery pytania. Czy to właściwy łańcuch: [[chain-id|eth_chainId]] porównany ze skonfigurowaną stałą. Czy synchronizacja się zakończyła: [[eth-syncing|eth_syncing]] zwraca `false`. Czy węzeł jest świeży: `timestamp` najnowszego bloku porównany z bieżącym czasem. Czy zgadza się z resztą: jego head porównany z najlepszym headem w puli. Dla własnego węzła warto dodać `net_peerCount` z [[net-web3-api|przestrzeni nazw net_]], bo węzeł bez peerów będzie wyglądał na świeży jeszcze przez jeden slot, a potem się zatrzyma."
        ]
      },
      {
        heading: "Jak zbudować sprawdzenie",
        paragraphs: [
          "Trzeba używać `timestamp` bloku, a nie numeru bloku. Sam numer nie mówi, jak stary jest blok, a zatrzymany węzeł i cichy łańcuch wyglądają przez [[eth-block-number|eth_blockNumber]] identycznie. Bloki przychodzą co 12 sekund, a sloty bywają pomijane, więc próg świeżości warto ustawić w okolicy 40 sekund, a nie 13; każdy ciaśniejszy próg alarmuje przy normalnym zachowaniu. Sprawdzenie warto uruchamiać co 5 do 10 sekund, co wystarcza, żeby zareagować w ciągu [[slot-epoch|slotu]] lub dwóch, i musi ono być tanie, bo sprawdzenie, które trace'uje blok, samo staje się problemem z obciążeniem.",
          "Sprawdzenie powinno iść tą samą ścieżką, której używa prawdziwy wywołujący, łącznie z TLS i [[reverse-proxy|proxy]], ale nie przez własny [[caching|cache]], który chętnie zgłosi, że martwy upstream jest zdrowy. Sprawdzenie potrzebuje twardego timeoutu, wyraźnie krótszego niż jego interwał, żeby zawieszony węzeł został oznaczony jako niezdrowy, a sprawdzenia nie ustawiały się w kolejce."
        ]
      },
      {
        heading: "Podłączenie do routingu",
        paragraphs: [
          "Health check, który tylko budzi człowieka alertem, jest zrobiony w połowie. Jego wynik powinien bezpośrednio zasilać wagę w [[load-balancer|load balancerze]] i decyzję o [[failover|failoverze]], żeby niezdrowy upstream przestał dostawać ruch, zanim ktokolwiek przeczyta alert. Do tego potrzebna jest histereza: wyrzucać z puli dopiero po kilku kolejnych porażkach, a przywracać dopiero po kilku kolejnych sukcesach i odczekaniu cooldownu. Inaczej węzeł na granicy sprawności będzie na przemian wypadał z puli i do niej wracał (flapping), za każdym razem pociągając za sobą część żądań.",
          "Jedna flaga na upstream nie wystarcza. Węzeł może być w pełni zdrowy dla odczytów `latest`, a jednocześnie nie móc obsłużyć wywołania [[trace-api|trace_]] ani stanu historycznego, więc zdrowie trzeba oceniać osobno dla każdej możliwości i dopasowywać do puli, do której należy dane żądanie; zobacz [[endpoint-capabilities|możliwości endpointu]]."
        ]
      }
    ],
    example: {
      title: "Health check w trzech pytaniach",
      note: "Wystarczy dodać jedno porównanie z numerem bloku endpointu referencyjnego, a ten sam skrypt wyłapie też [[head-lag|head lag]], którego sama świeżość nie wykrywa."
    },
    pitfalls: [
      "Health check oparty na połączeniu TCP albo HTTP 200, który przejdzie zarówno synchronizujący się węzeł, jak i węzeł w złym łańcuchu.",
      "Uznawanie `false` z `eth_syncing` za wystarczający sygnał; nie mówi on nic o tym, kiedy przyszedł ostatni blok.",
      "Ustawienie progu świeżości na jeden slot, przez co każdy pominięty slot na mainnecie kogoś budzi.",
      "Wyrzucanie z puli i przywracanie na podstawie jednej próbki, przez co upstream na granicy sprawności na przemian wypada z rotacji i do niej wraca.",
      "Uruchamianie sprawdzenia przez własny cache albo gateway, które mogą zgłosić martwy upstream jako zdrowy."
    ]
  },
  "endpoint-capabilities": {
    title: "Możliwości endpointu",
    aliases: [
      "endpoint capabilities",
      "capability probe",
      "sondowanie możliwości",
      "feature detection",
      "głębokość archiwum",
      "archive depth",
      "obsługiwane metody",
      "macierz wsparcia"
    ],
    summary: "Możliwości endpointu to wszystko, na co faktycznie potrafi odpowiedzieć: głębokość archiwum, przestrzenie nazw do tracingu, subskrypcje, dowody, symulacja i nałożone na to limity. Poza retencją, którą na węzłach obsługujących tę metodę raportuje [[eth-capabilities|eth_capabilities]], żadna z nich nie jest nigdzie ogłaszana, więc trzeba je ustalić sondowaniem (probing).",
    sections: [
      {
        heading: "Dlaczego nie można zakładać",
        paragraphs: [
          "[[execution-apis|Specyfikacja execution-apis]] określa, co metody znaczą, a nie to, które z nich operator włączył. Za każdym URL różnią się cztery niezależne rzeczy: [[execution-client|klient]] i jego wersja, od których zależy, czy [[eth-simulate|eth_simulateV1]] albo dany tracer w ogóle istnieje; włączone [[namespaces|przestrzenie nazw]]; [[eth-capabilities|retencja]], od której zależy, jak daleko wstecz mogą sięgać [[eth-call|eth_call]] i [[eth-get-proof|eth_getProof]]; oraz [[rate-limits|limity]], które operator dokłada na zakresy, batche i połączenia. Dwa URL-e od tego samego [[rpc-provider|providera]] często różnią się we wszystkich czterech.",
          "Różne awarie wyglądają podobnie, a znaczą coś przeciwnego. `-32601 method not found` jest trwałe: ten endpoint nigdy tej metody nie obsłuży. `-32000` z `missing trie node` albo `historical state not available` oznacza, że blok wypadł poza retencję, więc odpowiedzieć może upstream [[archive-node|archiwalny]]. `-32005` albo 429 to limit, za który być może już się płaci. Tylko pierwszy przypadek jest powodem, żeby przestać pytać, a endpoint [[archive-node|archiwalny]], który odpowiada na stare wywołania [[eth-get-balance|eth_getBalance]], nadal nie gwarantuje, że działa historyczne [[eth-get-proof|eth_getProof]], bo dowody wymagają trie node'ów, których archiwum z płaską bazą (flat storage) może nie trzymać."
        ]
      },
      {
        heading: "Sondowanie",
        paragraphs: [
          "Przy starcie i po każdej zmianie endpointu warto uruchomić stałą sekwencję wywołań i zapisać wynik dla każdego upstreamu. `web3_clientVersion` z [[net-web3-api|przestrzeni nazw web3_]] podaje oprogramowanie i wersję; [[chain-id|eth_chainId]] pokazuje, czy to właściwa sieć; odczyt salda we wczesnym bloku sprawdza głębokość archiwum, a wyszukiwanie binarne po numerach bloków znajduje dokładną granicę, gdy jest potrzebna. Potem po jednym wywołaniu na każdą potrzebną możliwość: [[trace-api|trace_block]] albo [[debug-api|debug_traceTransaction]], [[eth-get-proof|eth_getProof]] na starym bloku, [[eth-simulate|eth_simulateV1]] z pustą listą wywołań, [[eth-subscribe|eth_subscribe]] przez [[websocket-transport|WebSocket]] oraz coraz większy [[batch-request|batch]] i coraz szerszy zakres [[eth-get-logs|eth_getLogs]], żeby znaleźć limity.",
          "Odpowiedzi warto zapisać jako rekord możliwości, a nie jeden boolean, i pozwolić [[rpc-gateway|gatewayowi]] kierować ruch na jego podstawie: trace do puli archiwalnej, odczyty `latest` do szybkiej puli, dowody tam, gdzie faktycznie da się je wygenerować. Sondowanie trzeba powtarzać po każdej [[hardfork|aktualizacji sieci]] i za każdym razem, gdy provider zmienia oprogramowanie upstream, bo przejście z [[geth|Geth]] na [[erigon|Erigon]] albo [[nethermind|Nethermind]] zmienia dostępność tracerów, komunikaty błędów, a czasem kształt wyników."
        ]
      },
      {
        heading: "Błąd we właściwym momencie",
        paragraphs: [
          "Sondowanie ma przenieść awarię z produkcji na start. Aplikacja, która o trzeciej w nocy odkrywa, że jej fallback nie ma `trace_`, ma incydent; aplikacja, która odmówiła startu z takim upstreamem, ma błąd konfiguracji, a to dużo tańsza sprawa. Wymagane możliwości trzeba twardo sprawdzać (assert), te tylko preferowane logować, a zmianę możliwości działającego endpointu traktować jak alert, a nie jak odkrycie zrobione dopiero na podstawie wskaźnika błędów."
        ]
      }
    ],
    example: {
      title: "Sondowanie możliwości i znaczenie każdej odpowiedzi",
      note: "Cztery kształty błędów, cztery znaczenia: nie ma takiej metody, nie ma takich danych, brak uprawnień i limit. Tylko pierwszy nigdy się nie zmieni."
    },
    pitfalls: [
      "Zakładanie, że wszystkie URL-e od jednego providera są równoważne; archiwum i tracing to zwykle osobny poziom na osobnym hoście.",
      "Odczytywanie `-32601` jako „Ethereum tego nie obsługuje” zamiast „ten endpoint tego nie udostępnia”.",
      "Sondowanie raz przy rejestracji i nigdy więcej, przez co aktualizacja klienta albo podmiana upstreamu po cichu psuje integrację.",
      "Traktowanie stanu archiwalnego jako gwarancji, że działa historyczne `eth_getProof`; jedno i drugie wymaga innych danych na dysku.",
      "Wniosek, że nie ma limitu zakresu, bo jedno skanowanie się udało; niektóre endpointy ograniczają rozmiar odpowiedzi, a ten zależy od tego, jak zatłoczone były bloki."
    ]
  },
  "private-rpc": {
    title: "Prywatne RPC dla transakcji",
    aliases: [
      "private transaction RPC",
      "prywatne RPC",
      "prywatny mempool",
      "private mempool",
      "Flashbots Protect",
      "MEV Blocker",
      "eth_sendPrivateTransaction",
      "order flow"
    ],
    summary: "Prywatne RPC dla transakcji przyjmuje podpisaną transakcję i przekazuje ją builderom, zamiast rozgłaszać ją w publicznym [[mempool|mempoolu]], więc nikt nie może zagrać przeciwko niej w sekundach przed włączeniem do bloku.",
    sections: [
      {
        heading: "Co tu jest prywatne",
        paragraphs: [
          "Zwykłe [[eth-send-raw-transaction|eth_sendRawTransaction]] wkłada transakcję do mempoolu węzła, a [[devp2p|devp2p]] rozgłasza ją po sieci w ciągu mniej więcej sekundy. Każdy, kto prowadzi węzeł, widzi ją, zanim trafi do bloku, a to wystarczy, żeby zrobić na niej front-running albo atak sandwich; tak po prostu działa łańcuch dostaw [[mev|MEV]]. Prywatny endpoint omija tę drogę i przekazuje transakcję bezpośrednio builderom, więc widzą ją tylko te strony, które mogą ją włączyć do bloku.",
          "Najpopularniejsze są Flashbots Protect pod `https://rpc.flashbots.net` i MEV Blocker pod `https://rpc.mevblocker.io`. To gotowe adresy RPC, na które wystarczy przełączyć portfel, i każdy z nich zwraca nadawcy część wartości wydobytej wokół jego transakcji. Prywatność jest tu względna: zamiast „widzi to cała sieć” jest „widzi to ten zestaw builderów”, a to mniejsze grono, ale nie puste."
        ]
      },
      {
        heading: "Metody",
        paragraphs: [
          "`eth_sendPrivateTransaction` przyjmuje obiekt, a nie goły ciąg hex: `tx` z podpisanymi bajtami, opcjonalny `maxBlockNumber`, po którym próba wygasa, i `preferences` na ustawienia takie jak tryb szybki (fast). Zwraca ten sam hash transakcji, który zwróciłoby [[eth-send-raw-transaction|eth_sendRawTransaction]]. `eth_sendBundle` idzie dalej i wysyła [[mev-bundle|uporządkowaną listę surowych transakcji]] z docelowym `blockNumber`, opcjonalnymi granicami czasowymi i `revertingTxHashes` wskazującym te, którym wolno się nie powieść. Lista trafia do jednego [[block|bloku]] w całości i w tej kolejności albo wcale.",
          "Z atomowości bierze się ochrona przed revertem: bundle, który by się nie powiódł, po prostu nie trafia do bloku, więc przegrana próba nie kosztuje [[gas|gasu]]. Bundle dotyczą jednego bloku, więc strategia obejmująca kilka slotów wysyła je ponownie na każdy blok. Żądania do endpointu bundli Flashbots pod `relay.flashbots.net`, który mimo nazwy nie jest [[relay|relayem]] MEV-Boost, niosą nagłówek `X-Flashbots-Signature` podpisany dowolnym kluczem Ethereum, który służy jako tożsamość do budowania reputacji; nigdy nie powinien to być klucz trzymający środki."
        ]
      },
      {
        heading: "Co się traci",
        paragraphs: [
          "Włączenie do bloku staje się wolniejsze i warunkowe. Transakcję może zawierać tylko blok zbudowany przez uczestniczącego buildera, więc czeka ona na slot, w którym proposer wziął blok od tego buildera, a transakcja, która takiego slotu się nie doczeka, po prostu wygasa. Do tego czasu [[eth-get-transaction-by-hash|eth_getTransactionByHash]] na każdym publicznym węźle zwraca `null`, co psuje zwykłe sprawdzenie „czy jest już w mempoolu”; trzeba odpytywać prywatny endpoint albo czekać na [[transaction-receipt|receipt]].",
          "Endpoint jest też zaufanym pośrednikiem, który może opóźnić, odrzucić albo podglądać przepływ transakcji (order flow), a builder nadal może umieścić opłacalne transakcje wokół wysłanej transakcji. Do zwykłych przelewów publiczny mempool wystarczy; prywatne wysyłanie jest warte swojej złożoności przy swapach, [[liquidation-bot|likwidacjach]], approve na duże kwoty i wszędzie tam, gdzie sama kolejność jest warta pieniędzy."
        ]
      }
    ],
    example: {
      title: "Jedna prywatna transakcja i bundle",
      note: "Hash wraca dokładnie taki sam jak przy publicznym wysłaniu; różnica polega na tym, że żaden publiczny węzeł nie widzi stojącej za nim transakcji, dopóki nie trafi ona do bloku."
    },
    pitfalls: [
      "Odpytywanie publicznego węzła o hash i wniosek, że transakcja przepadła, choć nigdy nie była tam widoczna.",
      "Rozumienie „prywatna” jako „ukryta przed wszystkimi”; builderzy, do których trafiła, widzą ją w całości.",
      "Wysłanie bundla raz i czekanie, choć bundle dotyczą jednego bloku i trzeba je wysyłać ponownie dla każdego kolejnego bloku.",
      "Podpisywanie nagłówka `X-Flashbots-Signature` kluczem, który trzyma środki, zamiast osobnym kluczem tożsamości.",
      "Zakładanie, że prywatne wysyłanie eliminuje MEV; builder nadal wybiera, co umieścić wokół transakcji."
    ]
  },
  cors: {
    title: "CORS i DNS rebinding",
    aliases: [
      "CORS",
      "Access-Control-Allow-Origin",
      "preflight",
      "żądanie preflight",
      "DNS rebinding",
      "--http.corsdomain",
      "--http.vhosts",
      "--ws.origins",
      "JsonRpc.CorsOrigins"
    ],
    summary: "CORS to reguła przeglądarki, konfigurowana w węźle opcjami takimi jak `--http.corsdomain`, która decyduje, czy strona z jednego originu może odczytać odpowiedź z innego. Nie jest to kontrola dostępu. Przed DNS rebindingiem, atakiem, z którym CORS bywa mylony, chroni natomiast allowlista nagłówka `Host`, taka jak `--http.vhosts`.",
    sections: [
      {
        heading: "Co egzekwuje przeglądarka",
        paragraphs: [
          "Przeglądarka dołącza do każdego żądania origin strony, która je wysłała, czyli schemat, host i port, i domyślnie pozwala skryptowi odczytać odpowiedź tylko z jego własnego originu. CORS (cross-origin resource sharing) to sposób, w jaki serwer dopuszcza inne originy: odpowiada nagłówkiem `Access-Control-Allow-Origin` z originem strony albo z `*`. Wywołanie [[json-rpc|JSON-RPC]] to POST z `content-type: application/json`, a to nie jest tak zwane proste żądanie (simple request), więc przeglądarka najpierw wysyła preflight: żądanie `OPTIONS` z `Origin`, `Access-Control-Request-Method: POST` i `Access-Control-Request-Headers: content-type`. Właściwe wywołanie wychodzi dopiero wtedy, gdy odpowiedź na preflight na to pozwala.",
          "Wszystko to egzekwuje przeglądarka w imieniu użytkownika. `curl`, usługi backendowe, boty i [[client-libraries|biblioteki]] działające w Node nigdy nie wysyłają preflightu i całkowicie ignorują nagłówki odpowiedzi. CORS powstrzymuje więc wrogą stronę przed użyciem przeglądarki odwiedzającego jako swojego proxy, ale nikomu nie przeszkadza wywoływać węzła bezpośrednio. Listener osiągalny z internetu jest osiągalny bez względu na ustawienia CORS i dlatego prawdziwy ciężar dźwigają adres nasłuchu oraz [[authentication|uwierzytelnianie]]; zobacz [[security|bezpieczeństwo RPC]]."
        ]
      },
      {
        heading: "Ustawienia węzłów",
        paragraphs: [
          "`--http.corsdomain` w [[geth|Geth]] przyjmuje listę originów rozdzielonych przecinkami i domyślnie jest pusty. Geth w ogóle nie obsługuje wtedy CORS, a strony z innych originów nie mogą odczytać jego odpowiedzi; `*` dopuszcza każdy origin. Geth odrzuca też każdy `content-type` inny niż JSON kodem HTTP 415, więc cross-origin POST z `text/plain`, który przeglądarka wysłałaby bez preflightu, zostaje odrzucony, zanim dotrze do metody. [[reth|Reth]] używa tych samych nazw flag, a [[besu|Besu]] przyjmuje `--rpc-http-cors-origins`, domyślnie puste. W [[nethermind|Nethermind]] `JsonRpc.CorsOrigins` ma domyślnie wartość `*`, więc każda strona może odczytać odpowiedzi lokalnego Nethermind, dopóki lista nie zostanie zawężona.",
          "WebSocket w ogóle nie podlega CORS. Przeglądarka wysyła `Origin` w żądaniu upgrade i zostawia decyzję serwerowi; do tego służy `--ws.origins` w Geth. Przy pustej liście Geth akceptuje `http://localhost` i własną nazwę hosta maszyny, a gdy nagłówka `Origin` nie ma, pomija sprawdzenie, bo wysyłają go tylko przeglądarki. Dapp, którego wywołania [[http-transport|HTTP]] działają, a handshake [[websocket-transport|WebSocket]] jest odrzucany, zwykle musi dopisać tam swój origin. Hostowany endpoint zbudowany dla przeglądarkowych [[dapp-architecture|dappów]] musi wysyłać liberalne nagłówki CORS, więc jego ochrona opiera się na kluczach i allowlistach originów przypisanych do klucza."
        ]
      },
      {
        heading: "DNS rebinding i sprawdzanie nagłówka Host",
        paragraphs: [
          "DNS rebinding sięga węzła, który nasłuchuje tylko na `127.0.0.1`. Użytkownik na maszynie z węzłem otwiera `attacker.example`; serwer DNS atakującego najpierw odpowiada własnym adresem z bardzo krótkim TTL, strona się ładuje, a gdy nazwa jest rozwiązywana ponownie, odpowiedzią jest `127.0.0.1`. Skrypty na stronie wysyłają teraz żądania do `http://attacker.example:8545`, co przeglądarka uznaje za ten sam origin, więc CORS w ogóle nie wchodzi do gry, a żądania trafiają do lokalnego węzła. Nasłuch na loopbacku nie pomógł, bo przeglądarka też jest na loopbacku.",
          "Atak zdradza nagłówek `Host`: przeglądarka nadal wysyła `Host: attacker.example:8545`, czyli nazwę, której operator nigdy nie skonfigurował. `--http.vhosts` w Geth, domyślnie `localhost`, odrzuca takie żądanie kodem 403 `invalid host specified`, a żądania wysłane na sam adres IP zawsze przechodzą, bo rebinding nie potrafi takiego wytworzyć. `--host-allowlist` w Besu, domyślnie `localhost,127.0.0.1`, działa tak samo. Opcje JsonRpc w Nethermind nie obejmują allowlisty nagłówka Host, więc desktopowy Nethermind polega na przeglądarce. Chrome od wersji 142 pyta użytkownika, zanim publiczna strona połączy się z loopbackiem albo z adresem prywatnym, co w tej przeglądarce osłabia oba ataki. Za [[reverse-proxy|reverse proxy]] lista vhosts musi zawierać publiczną nazwę hosta, którą przekazuje proxy."
        ]
      }
    ],
    example: {
      title: "Odpowiedź na preflight i odrzucone żądanie z rebindingu",
      note: "Pierwsza wymiana to uprzejmość przeglądarki, której `curl` nigdy nie wykonuje; druga to sprawdzenie, które chroni węzeł na loopbacku, a opiera się ono na `Host`, nie na `Origin`."
    },
    pitfalls: [
      "Ustawienie `--http.corsdomain '*'`, żeby pozbyć się błędu w przeglądarce, w przekonaniu, że węzeł jest teraz otwarty, albo zawężenie tej listy w przekonaniu, że publiczny listener jest teraz chroniony.",
      "Debugowanie błędu CORS za pomocą `curl`, który działa, bo nigdy nie wysyła preflightu i ignoruje nagłówki egzekwowane przez przeglądarkę.",
      "Uruchamianie `--http.vhosts '*'` na stacji roboczej z przeglądarką, co z powrotem otwiera węzeł na loopbacku na DNS rebinding.",
      "Zostawienie w Nethermind domyślnego `JsonRpc.CorsOrigins` równego `*` na węźle desktopowym, przez co każda strona odwiedzona przez użytkownika może odczytać odpowiedzi węzła.",
      "Przeniesienie dappa z HTTP na WebSocket bez dodania jego originu do `--ws.origins`, przez co handshake się nie udaje, choć wywołania HTTP dalej działają."
    ]
  },
  "circuit-breaker": {
    title: "Circuit breaker i token bucket",
    aliases: [
      "circuit breaker",
      "half-open",
      "tryb półotwarty",
      "token bucket",
      "leaky bucket",
      "failsafe policy",
      "polityka failsafe",
      "retry storm",
      "lawina ponowień",
      "outlier ejection"
    ],
    summary: "Circuit breaker to przełącznik w kliencie albo [[rpc-gateway|gatewayu RPC]], który przestaje wysyłać żądania do upstreamu, gdy jego ostatnie błędy albo opóźnienia przekroczą próg, od razu kończy te wywołania błędem albo kieruje je gdzie indziej i wpuszcza ruch z powrotem dopiero wtedy, gdy próbne żądania się powiodą.",
    sections: [
      {
        heading: "Zamknięty, otwarty, półotwarty",
        paragraphs: [
          "Zamknięty to tryb normalny: każde żądanie idzie do upstreamu, a jego wynik trafia do okna przesuwnego, liczonego po ostatnich N wywołaniach albo po ostatnich kilku sekundach. Gdy okno przekroczy próg, na przykład 20 błędów w ostatnich 80 wywołaniach, serię kolejnych błędów albo odsetek wywołań wolniejszych niż limit opóźnienia, breaker się otwiera. Otwarty oznacza, że żądania są odrzucane bez dotykania upstreamu, więc wywołujący dostaje szybki błąd albo, wewnątrz gatewaya, natychmiastowy [[failover|failover]] na inny upstream. Po cooldownie breaker przechodzi w tryb półotwarty (half-open) i wpuszcza kilka próbnych żądań; wystarczająco dużo sukcesów go zamyka, a błąd znowu otwiera.",
          "Chodzi o to, żeby przestać zasypywać żądaniami zależność, która ma problemy, i żeby wywołujący przestali czekać na wywołania, które i tak się nie udadzą. [[health-check|Health check]] zadaje upstreamowi syntetyczne pytania według harmonogramu; breaker ocenia go po wynikach prawdziwego ruchu, więc wyłapuje węzeł, który przechodzi każde sprawdzenie, a zawodzi przy żądaniach, które mają znaczenie."
        ]
      },
      {
        heading: "Co się liczy i jak wąski jest breaker",
        paragraphs: [
          "Do okna należą tylko awarie operacyjne: błędy połączenia, timeouty, HTTP od 502 do 504 i błędy wewnętrzne `-32603`. Odpowiedzi deterministyczne nigdy nie mogą się liczyć. Revert zwrócony jako kod `3`, `-32602` invalid params i `-32601` method not found to poprawne odpowiedzi dotyczące żądania, a liczenie ich pozwala, by jeden wywołujący pętlą revertujących wywołań [[eth-call|eth_call]] otworzył breaker na zdrowym węźle dla wszystkich; [[retries|polityka ponowień]] przebiega według tej samej granicy. HTTP 429 i `-32005` opisują limit, a nie zdrowie, i na przykład eRPC trzyma odpowiedzi rate limitu i błędy klienta poza swoim oknem.",
          "Granularność jest równie ważna jak progi. Węzeł, którego workery tracingu są nasycone, ma timeout przy każdym `debug_traceBlockByNumber`, a jednocześnie odpowiada na [[eth-block-number|eth_blockNumber]] i eth_call w milisekundach. Jeden breaker na upstream widzi, jak błędy trace'ów wypełniają okno, i wyrzuca węzeł dla całego ruchu; breaker dla każdej kombinacji upstreamu i klasy metod odcina tylko obciążenie [[trace-api|trace]]. eRPC przyjmuje breakery tylko na poziomie upstreamu, wewnątrz wpisów failsafe dopasowywanych po metodzie, a gdy któryś jest otwarty, wywołanie kończy się błędem `ErrFailsafeCircuitBreakerOpen` bez nawiązywania połączenia, na co warstwa sieciowa eRPC odpowiada próbą na następnym upstreamie."
        ]
      },
      {
        heading: "Jak zatrzymać lawinę ponowień",
        paragraphs: [
          "Ponowienia się mnożą. Trzy próby w [[client-libraries|bibliotece klienckiej]], za nią trzy w gatewayu, a za nim [[load-balancer|load balancer]], który też ponawia: razem jedno wolne żądanie zamienia się w nawet 27 prób wobec węzła, który już jest wolny, a to samo robi każdy wywołujący, który dostał timeout w tej samej sekundzie. Otwarty breaker przecina tę pętlę tam, gdzie go umieszczono: próby wobec zawodzącego upstreamu natychmiast ustają, ruch przechodzi na zdrowe upstreamy, a gdy breakery wszystkich upstreamów są otwarte, wywołujący dostaje szybki błąd zamiast kolejki.",
          "Próba w trybie półotwartym sprawia też, że powrót na upstream jest bezpieczny, bo przywrócenie upstreamu po pierwszej dobrej odpowiedzi pozwala węzłowi na granicy sprawności na przemian wypadać i wracać, za każdym razem ciągnąc za sobą żądania. Breaker nie widzi węzła, który odpowiada szybko i błędnie, na przykład serwując nieaktualny head, więc sprawdzanie [[head-lag|spójności heada]] pozostaje osobnym zadaniem."
        ]
      },
      {
        heading: "Token bucket i leaky bucket",
        paragraphs: [
          "Breaker reaguje na błędy upstreamu, a rate limiter pilnuje, żeby nie przekroczyć cudzego limitu, zanim błędy w ogóle się zaczną. W algorytmie token bucket wiadro mieści do C tokenów i uzupełnia się w tempie r na sekundę, każde żądanie zużywa jeden token albo swoją wagę w compute units, a żądanie, które trafi na puste wiadro, czeka albo zostaje odrzucone. Po okresie bezczynności pozwala na burst do C, a jego długoterminowe tempo nigdy nie przekracza r. Leaky bucket zamiast tego kolejkuje żądania i opróżnia kolejkę w stałym tempie, więc ruch na wyjściu jest równy, ale burst zamienia się w opóźnienie w kolejce.",
          "Aplikacji korzystającej z [[rpc-provider|providera]] rozliczanego za użycie wystarczy token bucket ustawiony nieco poniżej opublikowanego limitu i breaker na każdy upstream: razem zamieniają [[rate-limits|rate limity]] w lokalną kolejkę, a awarie upstreamów w szybkie przekierowanie, i trzymają oba sygnały osobno w [[observability|metrykach]]."
        ]
      }
    ],
    example: {
      title: "Breakery per upstream i per metoda w eRPC",
      note: "Gdy breaker dla trace jest otwarty, `trace_block` szybko kończy się błędem `ErrFailsafeCircuitBreakerOpen` i jest ponawiane na innym upstreamie, a `eth_call` dalej trafia do archive-1."
    },
    pitfalls: [
      "Liczenie revertów i błędów invalid params jako awarii, przez co złe żądania jednego wywołującego otwierają breaker na zdrowym upstreamie.",
      "Jeden breaker na upstream dla wszystkich metod, przez co nasycona pula trace'ów wyrzuca węzeł także z tanich odczytów.",
      "Zamykanie breakera po pierwszym udanym żądaniu próbnym, przez co upstream na granicy sprawności na przemian wypada z rotacji i do niej wraca.",
      "Ponawianie na każdej warstwie bez breakera i budżetu ponowień, przez co wolny węzeł dostaje wielokrotność normalnego obciążenia w najsłabszym momencie.",
      "Oczekiwanie, że breaker wyłapie nieaktualny węzeł, który odpowiada szybko i bez błędów; widzi go tylko sprawdzanie odległości heada."
    ]
  },
  "request-cancellation": {
    title: "Limity i anulowanie żądań",
    aliases: [
      "anulowanie żądań",
      "request cancellation",
      "--rpc.evmtimeout",
      "--rpc.gascap",
      "JsonRpc.Timeout",
      "execution aborted",
      "request timed out",
      "hedged requests",
      "rozłączenie klienta",
      "client disconnect"
    ],
    summary: "Anulowanie żądań obejmuje limity, które węzeł nakłada na kosztowne wywołanie, takie jak limity gasu, timeouty wykonania oraz rozmiary batchy i odpowiedzi, a także to, co dzieje się z już trwającą pracą, gdy wywołujący zrezygnuje. Na to ostatnie [[json-rpc|JSON-RPC]] nie ma żadnego komunikatu.",
    sections: [
      {
        heading: "Zabezpieczenia przed wywołaniem i w jego trakcie",
        paragraphs: [
          "[[geth|Geth]] ogranicza symulację przez `--rpc.gascap`, 50 000 000 gasu dla [[eth-call|eth_call]] i [[eth-estimate-gas|eth_estimateGas]], oraz `--rpc.evmtimeout`, 5 sekund dla eth_call, po których EVM zostaje zatrzymane, a wywołujący dostaje `execution aborted (timeout = 5s)`. `--rpc.txfeecap`, 1 ether, to zabezpieczenie innego rodzaju: odrzuca wysyłane transakcje, których opłata go przekracza. [[batch-request|Batche]] są ograniczone do 1000 elementów przez `--rpc.batch-request-limit` i do 25 000 000 bajtów odpowiedzi przez `--rpc.batch-response-max-size`, a [[eth-get-logs|zapytania o logi]] przez `--rpc.rangelimit`, domyślnie bez limitu, oraz `--rpc.logquerylimit`, 1000 alternatyw na każdą pozycję w topics. Serwer HTTP Getha odpowiada też `-32002` `request timed out` tuż przed swoim 30-sekundowym write timeoutem.",
          "[[nethermind|Nethermind]] używa `JsonRpc.Timeout` równego 20 000 ms, `JsonRpc.GasCap` równego 100 000 000, `JsonRpc.MaxBatchSize` równego 1024, `JsonRpc.MaxBatchResponseBodySize` równego 32 MiB i `JsonRpc.MaxLogsPerResponse` równego 20 000. [[reth|Reth]] ma `--rpc.gascap`, `--rpc.max-logs-per-response`, `--rpc.max-blocks-per-filter` i `--rpc.max-tracing-requests`, który domyślnie pozwala na o dwa mniej równoległych trace'ów, niż maszyna ma rdzeni. Tracing ma własny zegar: obiekt opcji każdej metody `debug_trace*` przyjmuje pole `timeout` typu string, w Geth domyślnie `5s` i stosowane per transakcja, dlatego ciężkie [[debug-api|trace'y]] wysyła się z większą wartością."
        ]
      },
      {
        heading: "Nie ma komunikatu anulowania, jest tylko zamknięte połączenie",
        paragraphs: [
          "Specyfikacja JSON-RPC 2.0 definiuje żądania, odpowiedzi i powiadomienia (notifications), ale nic, co wycofywałoby żądanie w trakcie realizacji; [[execution-apis|execution APIs]] też niczego tu nie dodają. Protokoły zbudowane na JSON-RPC, które tego potrzebowały, takie jak Language Server Protocol, zdefiniowały własne `$/cancelRequest`. Węzeł dowiaduje się więc o rezygnacji wywołującego tylko w jeden sposób: połączenie się zamyka. Przez [[http-transport|HTTP]] połączenie niesie jedno żądanie naraz, więc porzucenie wywołania oznacza zerwanie tego połączenia. Przez [[websocket-transport|WebSocket]] wiele wywołań dzieli jeden socket, a jedynym sposobem na zatrzymanie jednego z nich jest zamknięcie wszystkich, łącznie z subskrypcjami.",
          "To, czy zamknięte połączenie zatrzymuje pracę, zależy od klienta i jest w większości nieudokumentowane. W kodzie Getha eth_call działa w kontekście żądania, a watcher anuluje EVM, gdy ten kontekst się kończy, co serwer HTTP w Go robi, gdy klient się rozłącza. Porzucone eth_call zatrzymuje się więc przy najbliższym sprawdzeniu, a zamknięcie WebSocketu anuluje każde trwające na nim wywołanie. Tracery Getha działają inaczej: watcher, który egzekwuje `timeout` trace'a, zatrzymuje EVM tylko po upływie tego terminu, a jeśli żądanie zostanie anulowane wcześniej, po prostu kończy działanie, więc porzucony trace wykonuje się do końca; trace bloku przestaje rozdzielać kolejne transakcje, ale kończy tę, która jest w toku. Nethermind ogranicza eth_call tokenem anulowania zbudowanym z `JsonRpc.Timeout`. [[reverse-proxy|Reverse proxy]] przekazuje ten sygnał dalej tylko wtedy, gdy zamyka swoje połączenie do upstreamu, co nginx robi domyślnie dzięki `proxy_ignore_client_abort off`."
        ]
      },
      {
        heading: "Wywołujący, którzy mnożą pracę",
        paragraphs: [
          "Obciążenie, przy którym ma to znaczenie, generuje [[dex-aggregator|silnik wycen]] (quote engine) albo [[intent-solver|solver]]. Symuluje on trasy od nowa przez eth_call, [[eth-simulate|eth_simulateV1]] albo `debug_traceCall` przy każdym nowym headzie lub zmianie ceny, a każdy nowy head sprawia, że poprzednia runda jest nieaktualna. Timeout po stronie klienta odrzuca odpowiedź, ale nie obliczenia, więc solver, który porzuca połowę symulacji, i tak obciąża węzeł wszystkimi, a koszt ponosi też każdy, kto współdzieli ten węzeł.",
          "Mechanizmy odporności mnożą tę samą pracę. Hedged request wysyła duplikat do drugiego upstreamu, gdy pierwszy jest wolniejszy niż ustalony percentyl, co przycina tail latency kosztem dwukrotnego wykonania wywołania; tak działa polityka hedge w eRPC. Gateway, który [[retries|ponawia]] symulację z timeoutem trzy razy, wykonał ją cztery razy. Spójny układ to uporządkowane limity: limit wykonania węzła poniżej timeoutu gatewaya, a timeout gatewaya poniżej deadline'u wywołującego, tak żeby to węzeł poddał się pierwszy i o tym powiedział, zamiast pracować dla nikogo. Dopełniają go [[circuit-breaker|circuit breaker]] i ograniczona współbieżność w [[rpc-gateway|gatewayu]]."
        ]
      }
    ],
    example: {
      title: "Cztery zegary wokół jednego kosztownego wywołania",
      note: "Cztery zegary, które na siebie wpływają: w Geth, gdy kontekst żądania się kończy, przez write timeout albo rozłączenie, `eth_call` się zatrzymuje, a trwający trace działa dalej, już bez własnego `timeout`."
    },
    pitfalls: [
      "Ustawienie timeoutu klienta poniżej limitu wykonania węzła i założenie, że węzeł przestaje pracować razem z klientem.",
      "Hedging albo ponawianie kosztownych symulacji na kilku warstwach, co mnoży pracę na węźle, który już był wolny.",
      "Podnoszenie `--rpc.evmtimeout` albo `JsonRpc.Timeout`, żeby uratować jedno wolne zapytanie, co pozwala każdemu wywołującemu zajmować rdzeń równie długo.",
      "Zamykanie WebSocketu, żeby porzucić jedno wolne wywołanie, i utrata każdej subskrypcji na tym połączeniu.",
      "Ustawienie trace'owi `timeout` dłuższego niż timeout odczytu proxy, przez co wywołujący dostaje 504, a węzeł dalej trace'uje."
    ]
  },
  "network-telemetry": {
    title: "Telemetria sieci",
    aliases: [
      "network telemetry",
      "Xatu",
      "The Lab",
      "ethPandaOps",
      "czasy propagacji",
      "propagation timing",
      "crawler węzłów",
      "spis klientów",
      "client census",
      "sentry",
      "dryf zegara"
    ],
    summary: "Telemetria sieci to mierzenie Ethereum z wielu punktów obserwacji poza jakimkolwiek pojedynczym klientem: kiedy bloki i atestacje docierają do węzłów, ile czasu zajmuje węzłom ich import i jakie oprogramowanie działa w sieci. Tak robią to Xatu i The Lab od ethPandaOps.",
    sections: [
      {
        heading: "Pytania, na które jeden węzeł nie odpowie",
        paragraphs: [
          "[[observability|Obserwowalność]] mówi operatorowi o jego własnym węźle. Pytania o sieć są innego rodzaju: po jakim czasie od początku slotu blok dociera do większości węzłów, jak późno proposerzy publikują bloki, który [[execution-client|klient wykonawczy]] najwolniej importuje ciężkie bloki, jaka część węzłów ma wersję gotową na następny [[hardfork|hard fork]]. Odpowiedź wymaga wielu obserwatorów z różnymi peerami, lokalizacjami, sprzętem i klientami, którzy rejestrują te same zdarzenia, oraz bazy, w której rekordy da się łączyć po slocie i roocie bloku.",
          "Powstają z tego dwa rodzaje danych. Dane o czasach to wiele obserwacji jednego zdarzenia, po jednej z każdego punktu obserwacji, i mają sens tylko jako rozkład. Dane ze spisu (census) to jedno spojrzenie na wiele węzłów: zbierają je crawlery, które przeszukują sieć mechanizmem [[discovery|discovery węzłów]] i zapisują, co każdy osiągalny peer mówi o sobie; to właśnie publikują serwisy śledzące [[client-diversity|różnorodność klientów]]. Spis liczy węzły, które odpowiedziały, a nie stake: walidatorzy za jednym beacon node liczą się raz, węzły, które nie przyjmują połączeń przychodzących, są pomijane, a nazwa klienta to tekst, który węzeł sam o sobie podaje."
        ]
      },
      {
        heading: "Xatu i The Lab",
        paragraphs: [
          "Xatu to system zbierania danych od ethPandaOps, który działa w kilku trybach. Sentry działa obok [[consensus-client|klienta konsensusu]], subskrybuje strumień eventów jego [[beacon-api|Beacon API]] i zapisuje czas nadejścia każdego eventu. Cannon jednokrotnie, bez duplikatów, odczytuje z beacon node'a kanoniczne, sfinalizowane dane. Mimicry nasłuchuje transakcji w sieci [[devp2p|devp2p]] warstwy wykonawczej, tryb discovery przeszukuje sieci discv4 i discv5, a serwer zbiera dane od wszystkich, dodaje geolokalizację z dokładnością wybraną przez każdego uczestnika i przekazuje eventy do sinków, które zasilają ClickHouse. Członkowie społeczności uruchamiają Contributoor, lekką wersję sentry, obok własnych [[beacon-node|beacon node'ów]].",
          "Dane są publiczne. xatu-data publikuje pliki Parquet, dla tabel eventów po jednym na dzień, pod `data.ethpandaops.io` na licencji CC BY 4.0, z prefiksami tabel według źródła, takimi jak `beacon_api_`, `libp2p_`, `mempool_`, `canonical_beacon_`, `canonical_execution_` i `mev_relay_`. The Lab pod `lab.ethpandaops.io` to część wizualna, z publicznym API nad tabelami pochodnymi, które jako osobne pomiary trzymają moment, w którym każdy węzeł pierwszy raz zobaczył blok, moment, w którym każdy węzeł pierwszy raz zobaczył nowy head, oraz czas [[engine-payload|engine_newPayload]] dla każdego klienta."
        ]
      },
      {
        heading: "W którym miejscu mierzy się czas",
        paragraphs: [
          "Na jednym węźle blok przechodzi przez kilka momentów i każdy z nich jest czyimś pomiarem. Dociera przez topic [[libp2p-gossip|gossipsub]]; przechodzi walidację gossip, gdy beacon node emituje `block_gossip`; strona wykonawcza uruchamia `engine_newPayload`, którego początek i koniec wyznaczają ramy wykonania; beacon node importuje go do [[fork-choice|fork choice]] i ustawia jako head, emitując `block` i `head` w kolejności zależnej od klienta ([[lighthouse|Lighthouse]] od v8.1.0 wysyła najpierw `head`); a po `engine_forkchoiceUpdated` klient wykonawczy zaczyna go serwować i dopiero wtedy widzą go `eth_blockNumber` i `newHeads`. Na jednej maszynie te punkty dzielą setki milisekund, a przy ciężkim bloku jeszcze więcej.",
          "Liczba bez punktu, w którym ją zmierzono, nic nie znaczy, a własne liczby Xatu pochodzą jeszcze o jeden przeskok później: `event_date_time` to moment, w którym sentry otrzymał event od swojego beacon node'a, a `propagation_slot_start_diff` odejmuje początek slotu wyliczony z czasu genesis. Dla wywołującego RPC liczy się ostatni z tych momentów, późniejszy niż każdy pomiar gossipu podawany o sieci."
        ]
      },
      {
        heading: "Zegary, maszyny, peery i obserwator",
        paragraphs: [
          "Każdy pomiar liczony względem slotu to zegar obserwatora minus wyliczony początek slotu, więc błąd zegara wchodzi do wyniku bezpośrednio. NTP przez publiczny internet zwykle trzyma zegar w granicach kilkudziesięciu milisekund, czy to przez chrony, czy przez ntpd, a słabo podłączony host radzi sobie gorzej; sentry Xatu mierzą swój dryf względem serwera NTP i dołączają go do każdego eventu. Obserwatorzy różnią się też [[node-hardware|sprzętem]], co zmienia czas wykonania, peerami, bo dobrze podłączony węzeł w centrum danych słyszy o blokach wcześniej, i klientem, bo implementacje emitują eventy na nieco innych etapach. Porównuje się jednego obserwatora z nim samym na przestrzeni czasu albo rozkłady z wielu obserwatorów, nigdy jeden węzeł z drugim.",
          "Sam pomiar też kosztuje. Sentry subskrybujący topiki atestacji ciągnie strumień o dużym wolumenie przez ten sam beacon node, który mierzy, klienci z dodaną instrumentacją wykonują dodatkową pracę na hot path, a uczestnicy sami się zgłaszają, co przesuwa próbkę w stronę dobrze utrzymanej infrastruktury."
        ]
      }
    ],
    example: {
      title: "Jeden slot mainnetu w zapisie The Lab",
      note: "Różnica między medianami dla bloku i dla head to w przybliżeniu czas importu; zakres dla poszczególnych klientów porównuje jeden blok na kilku maszynach, więc to próbka, a nie benchmark."
    },
    pitfalls: [
      "Podawanie czasu propagacji bez informacji, który moment mierzy: dotarcie przez gossip, import, head czy dostępność przez RPC.",
      "Porównywanie czasów dwóch węzłów liczonych względem slotu, gdy różnią się ich zegary, sprzęt i zestawy peerów.",
      "Odczytywanie spisu węzłów z crawlera jako udziału w stake, choć walidatorzy za jednym beacon node liczą się raz.",
      "Uruchamianie sentry telemetrii przy produkcyjnym beacon node bez uwzględnienia obciążenia od strumienia eventów.",
      "Traktowanie czasów importu poszczególnych klientów z jednego slotu jako benchmarku, a nie jednej próbki na nierównych maszynach."
    ]
  },
  "fastest-head": {
    title: "Wyścig o najnowszy head",
    aliases: [
      "first-seen latency",
      "block delivery network",
      "sieć dostarczania bloków",
      "head signal",
      "sygnał nowego heada",
      "bdnBlocks",
      "Chainbound Fiber",
      "newHeads latency",
      "opóźnienie newHeads",
      "fan-in feedów"
    ],
    summary: "Wyścig o najnowszy head polega na tym, żeby o każdym nowym [[block|bloku]] na szczycie łańcucha dowiedzieć się jak najwcześniej: słuchać kilku źródeł naraz (eventów beacon node'a, komercyjnych feedów bloków, strumieni `newHeads`) i zaczynać pracę od tego, które zgłosi blok pierwsze. [[searcher|Searcherzy]], likwidatorzy i market makerzy muszą bowiem zareagować w tym samym 12-sekundowym slocie.",
    sections: [
      {
        heading: "Kto potrzebuje heada najwcześniej i gdzie się on pojawia",
        paragraphs: [
          "Head to blok, który [[fork-choice|fork choice]], czyli reguła, według której węzeł wybiera między konkurencyjnymi blokami, uznaje za szczyt łańcucha. Nowy przychodzi w każdym 12-sekundowym [[slot-epoch|slocie]], a kilku odbiorców zaczyna pracę dokładnie w tej chwili: [[searcher|searcher]] szuka okazji handlowej, którą otwierają nowe ceny, [[liquidation-bot|bot likwidacyjny]] sprawdza na nowo, które pożyczki stały się zagrożone, market maker ponownie odczytuje rezerwy przez [[dex-pool-reads|odczyty pul]], a operator [[price-oracle|oracle]] decyduje, czy opublikować cenę. W slocie z przykładu mediana czasu, w którym blok zobaczyło 148 obserwujących węzłów, wyniosła 1,39 sekundy od początku slotu, co zostawiało około dziesięciu sekund na symulację i wysłanie transakcji do następnego bloku.",
          "Węzeł Ethereum to dwa programy połączone przez [[engine-api|Engine API]]: [[consensus-client|klient konsensusu]], czyli beacon node, który odbiera bloki od peerów i wykonuje fork choice, oraz [[execution-client|klient wykonawczy]], który wykonuje transakcje i odpowiada na JSON-RPC. Nowy blok przechodzi przez pięć kroków w stałej kolejności. Najpierw [[beacon-block|blok beacon]] przychodzi przez [[libp2p-gossip|gossip]] na topicu `beacon_block`, którym węzły przekazują sobie nowe bloki od peera do peera, i już niesie swój [[execution-payload|execution payload]], czyli transakcje. Po drugie, gdy proposer i podpis okażą się poprawne, zanim cokolwiek zostanie wykonane, beacon node emituje `block_gossip`. Po trzecie przekazuje payload klientowi wykonawczemu do wykonania przez `engine_newPayload`. Po czwarte importuje blok do fork choice jako nowy szczyt łańcucha i w odstępie milisekund emituje `head` i `block`, w kolejności zależnej od klienta: obecne wersje Lighthouse wysyłają najpierw `head`. Na koniec informuje klienta wykonawczego przez `engine_forkchoiceUpdated`; dopiero wtedy przesuwa się jego [[block-tag|tag]] `latest`, a [[geth|Geth]] wysyła `newHeads`."
        ]
      },
      {
        heading: "Co mówi każdy sygnał",
        paragraphs: [
          "Beacon node publikuje swoje eventy jako [[server-sent-events|server-sent events]] w [[beacon-api|Beacon API]] pod `/eth/v1/events?topics=block_gossip,head,block`, więc `block_gossip` to najwcześniejszy sygnał, jaki daje jeden węzeł. Wcześniejsze sygnały niosą mniej: `block_gossip` zawiera tylko `slot` i root bloku beacon, czyli własny hash bloku konsensusu, a `head` dodaje do tego state root; żaden z nich nie podaje [[block-hash|hasha bloku]] warstwy wykonawczej, którego używa JSON-RPC. Po ten hash albo po transakcje odbiorca sięga pod `/eth/v2/beacon/blocks/{root}`, gdy blok zostanie zaimportowany. `newHeads` przychodzi ostatni i niesie najwięcej: pełny nagłówek wykonawczy. Stan da się odczytać trochę wcześniej: Geth zapisuje blok i jego stan, gdy `engine_newPayload` zwraca odpowiedź, więc wywołanie przypięte do hasha bloku działa, gdy tylko pojawi się `block`, jeszcze zanim przesunie się `latest`.",
          "Sieci dostarczania bloków (block delivery networks), czyli prywatne sieci dobrze połączonych węzłów, które przekazują bloki i transakcje, sprzedają wcześniejszą kopię pierwszego kroku razem z payloadem. BDN od bloXroute udostępnia strumień `bdnBlocks`, który według dokumentacji może zawierać bloki, których łańcuch nie przyjmie, obok strumienia `newBlocks` z blokami w pełni zwalidowanymi; Fiber od Chainbound oferuje strumienie gRPC, takie jak `SubscribeNewExecutionPayloads`. Ich przewaga wynika z lokalizacji i peeringu, a nie ze skrótu w protokole, więc wersja do zbudowania samemu to klient konsensusu z dobrym peeringiem na dobrze podłączonym hoście, obok niego klient wykonawczy, a odbiorcy czytają przez [[ipc-transport|IPC]]."
        ]
      },
      {
        heading: "Łączenie wielu źródeł (fan-in)",
        paragraphs: [
          "Żadne źródło nie wygrywa każdego bloku, więc odbiorca wrażliwy na opóźnienia subskrybuje kilka: sieć dostarczania bloków, eventy własnego beacon node'a, `newHeads` własnego węzła wykonawczego przez IPC i `newHeads` od jednego lub dwóch providerów. Można to sobie wyobrazić jako jedną tabelę z hashem bloku wykonawczego jako kluczem, zasilaną z kilku kolejek, w której każde nadejście dostaje znacznik czasu w chwili odbioru. Pierwsze nadejście danego hasha uruchamia pracę; kolejne są odrzucane, a ich opóźnienie trafia do logu. Eventy beacon podają tylko root bloku beacon, więc łączy się je po slocie, dopóki nie da się odczytać body bloku. Drugi hash na tej samej wysokości to konkurencyjny blok, a nie duplikat, na przykład gdy następny proposer pomija spóźniony blok i buduje na jego bloku nadrzędnym, czyli [[reorg|reorg]]. Każda decyzja zapisuje swój hash, a odczyty stanu idą do węzła, który ma ten blok, przypięte do tego hasha, nigdy do `latest`.",
          "Opóźnienie źródła to czas nadejścia minus początek slotu, który na mainnecie wynosi `1606824023 + 12 × slot` sekund, czyli genesis plus 12 sekund na każdy slot. Ranking feedów według zegara jednego hosta jest bezpieczny, bo wszystkie nadejścia mają ten sam błąd zegara; porównanie z początkiem slotu albo między hostami dodaje błąd NTP rzędu dziesiątek milisekund, a to wystarczy, żeby zmienić, który feed wygląda na najszybszy. Warto trzymać rozkład dla każdego źródła, a nie liczbę wygranych: feed, który na większości bloków jest pierwszy o dwie milisekundy, ale na kilku spóźnia się o sekundę, może być wart mniej niż stabilny drugi."
        ]
      }
    ],
    example: {
      title: "Jeden slot z pięciu źródeł, ze znacznikami czasu z zegara jednego hosta",
      note: "Sieć dostarczania bloków wyprzedziła własny `block_gossip` tego węzła o 73 ms, a jego własne `newHeads` o 335 ms. Zanim lokalny węzeł wykonał blok, wywołanie na `latest` po cichu użyło stanu bloku nadrzędnego, a wywołanie przypięte do hasha głośno zwróciło błąd; gdy `engine_newPayload` zapisało już blok, przypięte wywołanie zadziałało, jeszcze przed `newHeads`."
    },
    pitfalls: [
      "Traktowanie pierwszego nadejścia jako przesądzonego, choć blok z sieci dostarczania bloków może nigdy nie zostać przyjęty, a poprawny blok nadal może wypaść w reorgu.",
      "Wywoływanie `eth_call` na `latest`, gdy tylko przyjdzie blok z sieci dostarczania bloków; wywołanie czyta wtedy stan bloku nadrzędnego, bo lokalny węzeł jeszcze tego bloku nie zaimportował.",
      "Branie heada z `newHeads` providera i czytanie stanu przez ten sam URL, który może trafić do backendu o blok w tyle; zobacz [[head-lag|opóźnienie heada]].",
      "Zakładanie, że ponownie połączony [[websocket-transport|WebSocket]] nadrobił zaległości, choć heady wysłane w czasie przerwy nigdy nie zostaną powtórzone i trzeba je pobrać po numerze."
    ]
  },
  "transaction-relayer": {
    title: "Relayery transakcji",
    aliases: [
      "relayer",
      "OpenZeppelin Relayer",
      "transaction manager",
      "nonce manager",
      "meta-transakcja",
      "ERC-2771",
      "przyspieszanie i anulowanie transakcji",
      "speed up i cancel",
      "transakcje gasless",
      "transakcje bez gasu"
    ],
    summary: "Relayer transakcji to usługa, która trzyma klucze do podpisywania i bierze na siebie doprowadzenie [[transaction|transakcji]] do bloku: przydziela [[nonce|nonce]] i opłaty, podpisuje, rozgłasza do kilku endpointów, zastępuje transakcje, które utknęły, i sprawdza receipty, dopóki nie zostaną sfinalizowane. Dzięki temu wywołujący przekazuje mu samo wywołanie, a nie podpisaną transakcję.",
    sections: [
      {
        heading: "Co przekazują wywołujący",
        paragraphs: [
          "Podpisać transakcję jest łatwo; trudniej doprowadzić do jej włączenia do bloku. Opłata musi nadążać za popytem, a każda transakcja niesie nonce nadawcy, licznik, który musi iść 0, 1, 2 bez przerw, więc jedna transakcja, która nigdy nie trafi do bloku, blokuje wszystkie późniejsze. Potrzebują tego keepery, węzły oracle, bridge'e i backendy płacące za gas swoich użytkowników, więc robi się z tego usługę.",
          "OpenZeppelin Relayer, następca open source relayera z Defendera, przyjmuje `POST /api/v1/relayers/<relayer_id>/transactions` z polami `to`, `data`, `value` oraz albo jawnymi opłatami, albo parametrem `speed`, na przykład `fast`, i zwraca własne id, którego status przechodzi od `Pending` do `Confirmed`. Żądanie bez `valid_until`, które po ośmiu godzinach wciąż nie trafiło do bloku, zostaje anulowane: relayer zastępuje je pod tym samym nonce transferem o zerowej wartości do samego siebie, żeby późniejsze transakcje mogły przejść.",
          "Przepływy gasless pozwalają użytkownikowi działać bez posiadania etheru na gas. W ERC-2771 użytkownik podpisuje żądanie off-chain, a relayer płaci za [[gas|gas]], żeby wysłać je do zaufanego forwardera (trusted forwarder), czyli kontraktu, któremu odbiorca zgodził się wierzyć. Forwarder sprawdza podpis i wywołuje odbiorcę z 20-bajtowym adresem podpisującego doklejonym na końcu calldata, a `_msgSender()` odbiorcy odczytuje ten adres zawsze, gdy `isTrustedForwarder(msg.sender)` zwraca true. Podpisane transfery tokenów [[eip-3009|EIP-3009]] przekazuje się tak samo, a bundler [[erc-4337|ERC-4337]] to relayer o poziom wyżej."
        ]
      },
      {
        heading: "Nonce i opłaty",
        paragraphs: [
          "Relayer nie może po prostu zapytać łańcucha o swój następny nonce. [[eth-get-transaction-count|eth_getTransactionCount]] w `latest` pomija transakcje, które jeszcze czekają: gdy nonce 1204 nie trafił jeszcze do bloku, odpowiada znowu 1204, a druga transakcja podpisana tym nonce staje się próbą zastąpienia pierwszej. W `pending` odzwierciedla [[mempool|mempool]] oczekujących transakcji jednego węzła, który różni się między backendami i może się opróżnić przy restarcie. Relayery liczą lokalnie i traktują łańcuch jako dolną granicę: OpenZeppelin Relayer podnosi swój licznik do wartości on-chain, gdy zostaje w tyle, i nigdy go nie obniża.",
          "Opłaty działają według [[eip-1559|EIP-1559]]: każdy blok ma base fee za jednostkę gasu, które po pełnym bloku rośnie najwyżej o 12,5 procent, a transakcja podaje maksimum, jakie zapłaci, `maxFeePerGas`, oraz napiwek (tip), `maxPriorityFeePerGas`. [[eth-fee-history|eth_feeHistory]] podaje ostatnie base fee i napiwki, a limit opłaty (fee cap) równy dwukrotności base fee plus napiwek wytrzymuje około sześciu pełnych bloków z rzędu. Mempool trzyma jedną transakcję na nadawcę i nonce, więc tę, która utknęła, zastępuje się, wysyłając ten sam nonce z wyższymi opłatami. [[geth|Geth]], [[nethermind|Nethermind]] i [[reth|Reth]] wymagają co najmniej 10 procent więcej w obu polach opłat (Geth i Reth mają na to flagę `--txpool.pricebump`). Węzły Chainlink podnoszą opłatę o 20 procent po trzech blokach bez włączenia do bloku."
        ]
      },
      {
        heading: "Błędy, które znaczą coś innego",
        paragraphs: [
          "Kilka błędów wcale nie oznacza porażki. Ponowne wysłanie bajtów, które węzeł już ma, zwraca `already known`, a to jest sukces. `nonce too low` po ponownym wysłaniu zwykle znaczy, że jedna z własnych transakcji relayera z tym nonce trafiła do bloku, więc relayer najpierw sprawdza [[eth-get-transaction-receipt|receipty]] każdego hasha, który wysłał pod tym nonce. `replacement transaction underpriced` znaczy, że miejsce dla tego nonce jest zajęte, a podwyżka była za mała; `transaction underpriced` znaczy, że opłata jest poniżej minimum danego mempoolu.",
          "Te teksty to konwencje, a nie specyfikacja. Geth, Nethermind i Reth zwracają `nonce too low`, `already known` i `replacement transaction underpriced` z kodem `-32000`, a Geth i Reth dopisują wartości nonce, jak w `nonce too low: next nonce 501, tx nonce 500`. [[besu|Besu]] odpowiada `Nonce too low` z kodem `-32001` oraz `Known transaction` dla duplikatu. Relayery dopasowują fragmenty tekstu zamienionego na małe litery do tabeli znanych komunikatów, która się starzeje: tabela OpenZeppelin Relayer wciąż ma `exceeds next nonce` dla Nethermind, który teraz zwraca `nonce too high`. [[rpc-provider|Provider RPC]] przed węzłem może przepisać każdy z tych tekstów; zobacz [[rpc-errors|błędy JSON-RPC]]."
        ]
      },
      {
        heading: "Utknięte, wyrzucone i wycofane przez reorg",
        paragraphs: [
          "Transakcja utyka, gdy jej fee cap jest poniżej base fee albo gdy czeka za niższym nonce, który nigdy nie trafił do bloku. [[txpool-api|txpool_contentFrom]] na własnym węźle relayera pokazuje, który to przypadek: Geth wymienia pierwszy pod `pending`, a drugi pod `queued`, natomiast Reth umieszcza oba pod `queued`. Transakcja, którą węzeł wyrzucił ze swojego mempoolu, wraca po ponownym rozgłoszeniu tych samych podpisanych bajtów do kilku endpointów, na przykład z ważonej listy `custom_rpc_urls` w OpenZeppelin Relayer; takie rozgłaszanie można bezpiecznie powtarzać. Zobacz [[failover|failover]].",
          "Włączenie do bloku to nie koniec. Relayer odpytuje `eth_getTransactionReceipt` na endpoincie, przez który wysłał transakcję, zapisuje `blockHash` i sprawdza ponownie, dopóki blok nie znajdzie się na wysokości [[block-tag|tagu]] `finalized` albo niżej, bo [[reorg|reorg]], czyli przejście łańcucha na konkurencyjną gałąź ostatnich bloków, może usunąć receipt, przenieść go albo sprawić, że do bloku trafi zamiast niej transakcja, którą ona zastąpiła. Same stany opisuje [[transaction-lifecycle|cykl życia transakcji]]."
        ]
      }
    ],
    example: {
      title: "Transakcja, która utknęła, odrzucona podwyżka i zastąpienie",
      note: "Podwyżka o 10 procent w kroku 3 zostałaby przyjęta, a transakcja dalej by tkwiła, bo 30,8 gwei to wciąż mniej niż base fee 35,6 gwei; reguła podwyżki to tylko minimum mempoolu, a nową opłatę trzeba wyceniać od bieżącego base fee."
    },
    pitfalls: [
      "Odczytywanie następnego nonce z `eth_getTransactionCount` z `pending` na backendzie, który akurat odpowie, co prowadzi do ponownego użycia albo pominięcia nonce.",
      "Traktowanie `nonce too low` po ponownym wysłaniu jako porażki i podpisywanie od nowa z nowym nonce, przez co odbiorca dostaje zapłatę dwa razy.",
      "Podnoszenie opłat transakcji, która utknęła, o minimalne 10 procent, gdy base fee wzrosło już bardziej, przez co zastępcza transakcja też utyka."
    ]
  },
  "security-monitoring": {
    title: "Monitoring bezpieczeństwa on-chain",
    aliases: [
      "monitoring zagrożeń",
      "threat monitoring",
      "wykrywanie exploitów",
      "Hypernative",
      "Forta",
      "OpenZeppelin Monitor",
      "Tenderly alerts",
      "automatyczna pauza",
      "reagowanie na incydenty",
      "incident response"
    ],
    summary: "Monitoring bezpieczeństwa on-chain to ciągła analiza każdego nowego bloku, a często też transakcji pending, w poszukiwaniu oznak, że protokół jest atakowany albo źle skonfigurowany. Taki monitoring zgłasza alerty, a czasem sam reaguje, na przykład pauzuje kontrakt, zanim następna transakcja atakującego trafi do bloku.",
    sections: [
      {
        heading: "Czego szukają monitory",
        paragraphs: [
          "Protokół, który przechowuje środki użytkowników, chce się w ciągu kilku sekund dowiedzieć, że jest atakowany, a najlepiej zatrzymać atakującego, zanim kradzież się zakończy. Detektory to reguły działające na zdekodowanych danych z łańcucha. Jedne pilnują konfiguracji: [[event-log|eventu]] `OwnershipTransferred` (topic `0x8be0079c…`), eventu `Upgraded` z ERC-1967 (topic `0xbc7cd75a…`) albo samego zapisu do slotu storage, w którym [[proxy-contract|proxy]] trzyma adres wykonywanego kodu. Inne pilnują pieniędzy: spadku salda protokołu o jedną piątą w jednym bloku albo flash loana, czyli pożyczki zaciągniętej i spłaconej w jednej transakcji, po którym następuje duży swap. Jeszcze inne pilnują cen: gdy w ramach jednej transakcji cena spot w puli mocno oddala się od [[price-oracle|oracle cenowego]], sugeruje to, że ktoś przesuwa cenę, którą czyta kontrakt pożyczkowy. Forta dzieli atak na etapy finansowania, przygotowania, exploitu i prania pieniędzy; im wcześniejszy etap wykryje detektor, tym więcej czasu ma reakcja.",
          "Hypernative oferuje monitoring z automatyczną reakcją, Tenderly łączy alerty ze swoim symulatorem, a Forta, która zbudowała sieć botów wykrywających, teraz prześwietla transakcje, zanim dotrą do [[sequencer|sekwencera]] rollupu. OpenZeppelin Monitor, opcja open source, dopasowuje wywołania, eventy i wyrażenia na transakcjach i wysyła alerty na Slacka, e-mailem, webhookiem albo przez skrypt, ale jego klient EVM czyta tylko bloki, logi i receipty, przez `eth_blockNumber`, `eth_getBlockByNumber`, `eth_getLogs` i `eth_getTransactionReceipt`, więc wywołania wewnętrzne i [[mempool|mempool]] są poza jego zasięgiem."
        ]
      },
      {
        heading: "Obciążenie RPC",
        paragraphs: [
          "Pełny monitor czyta wszystko z każdego bloku: blok z pełnymi transakcjami, receipty z [[eth-get-block-receipts|eth_getBlockReceipts]] oraz [[execution-trace|trace]] każdej transakcji, czyli zapis wszystkich wewnętrznych wywołań, które wykonała, z `debug_traceBlockByNumber` z `callTracer` albo z `trace_block` tam, gdzie istnieje [[trace-api|przestrzeń nazw trace_]]. Logi nie wystarczą, bo istotne odpływy środków to często [[internal-transaction|wewnętrzne transfery etheru]], a zapis do slotu implementacji bez eventu `Upgraded` widać w diffie stanu z `prestateTracer`, ale w żadnym logu. Wszystko to musi dotrzeć w ciągu kilku sekund od bloku, co wyklucza większość współdzielonych endpointów z rate limitami.",
          "Obserwacja jeszcze przed włączeniem do bloku dokłada do tego mempool. Przez [[eth-subscribe|eth_subscribe]] z `newPendingTransactions` i pełnymi obiektami albo przez dedykowany [[mempool-streaming|strumień mempoolu]] monitor widzi publiczne transakcje kilka sekund przed blokiem i może przepuścić każdą podejrzaną przez [[debug-api|debug_traceCall]] albo [[eth-simulate|eth_simulateV1]] na headzie. Atakujący, który wysyła przez [[private-rpc|prywatne RPC]], nigdy się tam nie pojawia, więc widok mempoolu łapie tylko publiczny ruch, a wiarygodnym wczesnym sygnałem są przygotowania atakującego we wcześniejszych blokach."
        ]
      },
      {
        heading: "Siedem bloków ostrzeżenia",
        paragraphs: [
          "Opis exploitu Saddle Finance z kwietnia 2022 (około 11 milionów dolarów), który przygotowała Forta, pokazuje okno, jakie zostawiają przygotowania. Kontrakt atakującego powstał w bloku 14 684 300, a został użyty w bloku 14 684 307. Detektor, który kopiuje stan łańcucha tuż po utworzeniu kontraktu do lokalnego forka i wywołuje każdą nową funkcję, odkrywa, że ta bez argumentów, o [[abi|selektorze]] `0xaf8271f7`, podnosi saldo WETH atakującego z 0 do 3375. Siedem bloków, według ich timestampów 110 sekund, dzieli możliwe do udowodnienia zagrożenie od kradzieży: to dość na automatyczną reakcję i zdecydowanie za mało na reakcję człowieka.",
          "Typowa automatyczna reakcja polega na tym, że guardian, czyli konto, które protokół wcześniej upoważnił, wywołuje `pause()`; ta funkcja emituje `Paused(address)` i blokuje funkcje, których potrzebuje atakujący. Ta transakcja ściga się z atakiem, więc wychodzi przez prywatne RPC albo jako [[mev-bundle|bundle]], gdzie atakujący obserwujący mempool nie może jej zobaczyć i ruszyć pierwszy. Akcje ratunkowe white hatów idą dalej: robią front-running widocznego exploitu, umieszczając tuż przed nim transakcję, która przenosi środki w bezpieczne miejsce. To technika [[searcher|searchera]] użyta w obronie."
        ]
      },
      {
        heading: "Gdy fałszywy alarm wywołuje endpoint",
        paragraphs: [
          "Monitor ma rację tylko na tyle, na ile poprawne są dane, które czyta. Opóźniony endpoint oznacza spóźniony albo przegapiony alert. Błędny endpoint jest gorszy: load balancer może rozbić jedno uruchomienie detektora na dwie wysokości bloku, więc dwa odczyty salda z bloków oddalonych o jeden pokazują spadek, którego nie było; częściowo zsynchronizowany backend może zwrócić błąd albo `0x`, które nieostrożne dekodowanie zamienia w zerowe saldo; węzeł, który przez chwilę jest po przegranej stronie [[reorg|reorga]], raportuje transfery, które nigdy nie staną się kanoniczne. Przy każdym z nich alert trafia do dyżurnego, a te kosztowne pauzują protokół, którego nikt nie zaatakował; zobacz [[head-lag|spójność heada]].",
          "Środki obrony są czysto mechaniczne. Każde uruchomienie detektorów przypina się do jednego hasha bloku. Head, a także każdy odczyt, który miałby uruchomić reakcję, sprawdza się krzyżowo u co najmniej dwóch niezależnych providerów; to wzorzec kworum, który implementuje [[rpc-gateway|gateway RPC]] taki jak dshackle. Po każdym ponownym połączeniu robi się backfill od zapisanego kursora, żeby zerwane połączenie [[websocket-transport|WebSocket]] nie zostawiło cichej luki. Hypernative podał właśnie te powody (przegapione bloki, opóźnione odpowiedzi i niespójne odczyty), gdy w 2026 roku przechodził na routing przez wielu providerów. Wykrywanie na żywo potrzebuje tylko świeżego stanu; późniejsze dochodzenie wymaga [[archive-node|węzła archiwalnego]]."
        ]
      }
    ],
    example: {
      title: "Co zrobiłby dziś monitor z blokiem przygotowań do ataku na Saddle",
      note: "Forta w 2022 roku uruchamiała to sprawdzenie w bocie na forku w Ganache; na obecnym węźle `eth_simulateV1` robi to samo na headzie bez węzła archiwalnego, bo blok, od którego się odgałęzia, jest najnowszy."
    },
    pitfalls: [
      "Obserwowanie samych eventów, co pomija wewnętrzne transfery etheru i zapisy do storage, których złośliwy upgrade albo drenaż środków nie musi logować.",
      "Wysyłanie transakcji reakcji przez publiczny mempool, gdzie atakujący może ją zobaczyć i zadziałać pierwszy.",
      "Traktowanie spokojnego strumienia transakcji pending jako oznaki bezpieczeństwa, choć prywatnie wysłane transakcje nigdy się w nim nie pojawiają."
    ]
  },
  "rpc-workloads": {
    title: "Kto korzysta z Ethereum RPC",
    aliases: [
      "zastosowania RPC",
      "RPC use cases",
      "konsumenci RPC",
      "profile obciążenia",
      "workload",
      "wzorce ruchu RPC",
      "mix metod",
      "kto wywołuje RPC"
    ],
    summary: "Obciążenie RPC (workload) to profil ruchu, który konsument wysyła do węzła: jakie metody, w którym bloku, z jak dużego zakresu historii i jak szybko potrzebna jest odpowiedź. Ten temat dzieli konsumentów RPC w Ethereum na dziewięć takich profili.",
    sections: [
      {
        heading: "Profile, nie branże",
        paragraphs: [
          "[[liquidation-bot|Bot likwidacyjny]] protokołu pożyczkowego i księgowi tego protokołu czytają te same kontrakty, ale potrzebują przeciwnych endpointów: bot czyta pożyczki na headzie, czyli w najnowszym [[block|bloku]], w ciągu milisekund od każdego bloku, a księgowi czytają salda na koniec miesiąca w starych blokach i mogą poczekać minutę. Dla węzła liczy się tylko profil: który blok jest czytany, ile historii węzeł musi przez to trzymać, które [[namespaces|przestrzenie nazw]] są wywoływane i czy więcej szkody robi spóźniona odpowiedź, czy brakująca. Dziewięć profili poniżej, każdy w jednym akapicie, to odczyty na headzie, odczyty w przypiętym bloku, symulacja, dowody, logi eventów, trace'y, zapisy, strumienie heada i ruch, który napędza sam łańcuch. Większość konsumentów łączy kilka z nich; portfel czyta, symuluje i zapisuje."
        ]
      },
      {
        heading: "Odczyt stanu: na headzie, w przypiętym bloku, w symulacji, z dowodem",
        paragraphs: [
          "Odczyty na headzie pytają, co jest prawdą teraz: [[eth-call|eth_call]] i [[eth-get-balance|eth_getBalance]] na `latest`, często spakowane w jedno wywołanie przez [[multicall|Multicall3]] albo [[deployless-call|wywołanie deployless]]. Wysyłają je portfele, [[portfolio-tracker|trackery portfolio]], routery DEX czytające [[dex-pool-reads|pule]] i [[quoter-contract|quotery]], dashboardy pożyczkowe, wyszukiwanie [[ens|nazw]] i poświadczeń (attestations), sprawdzanie biletów oraz frontendy gier i aplikacji społecznościowych. Pakowanie ma swój sufit: smart-order-router Uniswapa dobiera rozmiar każdego multicalla pod 150 000 000 [[gas|gasu]] na mainnecie, trzy razy więcej, niż domyślny węzeł [[geth|Geth]] pozwala zużyć jednemu `eth_call` (`--rpc.gascap`), więc jego wyceny zawodzą tam, dopóki limit nie zostanie podniesiony albo multicalle nie zostaną zmniejszone.",
          "Odczyty w przypiętym bloku pytają, co było prawdą w jednym bloku z przeszłości: [[governance-voting-power|siła głosu]] w snapshocie propozycji, prawo do [[airdrop-rewards|nagród]], ceny udziałów w [[erc-4626|vaultach]], uzgadnianie rezerw, roszczenia ubezpieczeniowe, analizy ryzyka i [[fork-testing|testy na forku]]. [[pruned-node|Pruned node]] trzyma stan tylko dla ostatnich bloków, 128 w Geth, a w innych klientach inną liczbę, więc starsze odczyty zawodzą tam i wymagają [[archive-node|węzła archiwalnego]].",
          "Symulacja pyta, co zrobiłaby transakcja, gdyby ją wysłać: [[transaction-simulation|podglądy]] w portfelach i narzędziach bezpieczeństwa, trasy w [[dex-aggregator|agregatorach]] i u [[intent-solver|solverów]], [[erc-4337|UserOperation]] w bundlerach oraz płatności ze skarbców (treasury). Działa jako `eth_call` ze [[state-override|state overrides]], jako [[eth-simulate|eth_simulateV1]] albo jako `debug_traceCall`, z terminem, którego trzeba dotrzymać; agregatory najpierw znajdują sloty sald tokenów, które nadpisują ([[storage-slot-discovery|wyszukiwanie slotów]]).",
          "Dowody to prośba o materiał, który wywołujący może sprawdzić bez ufania węzłowi: [[light-client|lekcy klienci]] tacy jak [[helios|Helios]], [[bridge|bridge]] i provery ZK, w tym [[real-time-proving|provery czasu rzeczywistego]], wywołują [[eth-get-proof|eth_getProof]]. Prover bloków RSP od Succinct pobiera dowód w bloku rodzica dla każdego konta i slotu, którego dotyka blok, więc potrzebuje węzła archiwalnego, który trzyma historyczne [[merkle-patricia-trie|trie node'y]]."
        ]
      },
      {
        heading: "Odczyt historii: logi eventów i trace'y",
        paragraphs: [
          "[[event-log|Logi eventów]] to rekordy emitowane przez kontrakty, na przykład `Transfer` tokena. Ich konsumenci zamieniają je w tabele: [[indexer|indeksery]], [[exchange-deposits|obsługa depozytów na giełdach]], [[stablecoin-payments|procesory płatności]], [[nft-marketplace|marketplace'y NFT]], aplikacje do streamingu płatności i vestingu, rozliczanie rynków predykcyjnych, umarzanie kredytów węglowych, [[cross-chain-relayer|relayery cross-chain]], sieci przechowywania danych oraz węzły oracle, rozstrzygania sporów i stakingu. Wywołują [[eth-get-logs|eth_getLogs]], [[eth-get-block-receipts|eth_getBlockReceipts]] i [[eth-subscribe|subskrypcje]] logów i potrzebują logów aż do wdrożenia kontraktu, a te może usunąć [[history-expiry|history expiry]]; przy pierwszym uruchomieniu relayer Hyperlane indeksuje każdy dotychczasowy event wiadomości `Dispatch` na każdym łańcuchu źródłowym. [[rpc-privacy|Portfele prywatnościowe]] pobierają każdy event emitowany przez kontrakt ich puli.",
          "Trace'y pokazują, co działo się wewnątrz transakcji, na przykład [[internal-transaction|wewnętrzne transfery ETH]], które nie zostawiają logu. [[block-explorer|Eksploratory bloków]], platformy compliance i [[chain-analytics|analityczne]], [[accounting-reconciliation|księgowość]], [[address-history|historia adresów]] i [[security-monitoring|analiza incydentów]] wywołują [[trace-api|trace_block]], `trace_filter` albo [[debug-api|debug_traceBlockByNumber]]; Transaction Service od Safe używa `trace_filter` i `trace_block` na łańcuchach L1, ale `eth_getLogs` na L2. Trace'y to najdroższy profil, bo węzeł ponownie wykonuje blok z podpiętym tracerem, i najmniej przenośny: wyniki `trace_` i `debug_` z Geth się różnią, a żaden z tych formatów tracingu nie jest częścią specyfikacji [[execution-apis|execution-apis]]."
        ]
      },
      {
        heading: "Zapisy, strumienie i napędzanie łańcucha",
        paragraphs: [
          "Ci, którzy wysyłają transakcje, potrzebują, żeby każda trafiła do łańcucha dokładnie raz: [[transaction-relayer|relayery]], [[keeper|keepery]], wypłaty z giełd i usług custody, mint i burn stablecoinów, emitenci tokenizowanych aktywów, rozliczenia [[x402|x402]], [[onchain-agents|agenci]], [[faucet|faucety]] oraz backendy launchów, zbiórek i gier, które wysyłają transakcje falami. Pętla odczytuje następny [[nonce|nonce]] konta przez [[eth-get-transaction-count|eth_getTransactionCount]] na `pending`, szacuje opłatę, wysyła przez [[eth-send-raw-transaction|eth_sendRawTransaction]] i odpytuje o receipt; nonce można użyć tylko raz, więc ponownie wysłana kopia nie trafi do łańcucha dwa razy. Gdy kolejność jest warta pieniądze, wysyłają przez [[private-rpc|prywatne wysyłanie]] albo [[mev-share|MEV-Share]] zamiast przez publiczny mempool.",
          "Strumienie heada zasilają konsumentów, którzy ścigają się o to, kto pierwszy zobaczy każdy nowy blok i każdą transakcję pending: [[searcher|searcherów]] i builderów, market makerów, [[price-oracle|oracle]], keeperów derywatów, usługi [[preconfirmation|preconfirmations]] i estymatory gasu, które obserwują [[mempool-streaming|mempool]]. Trzymają otwarte strumienie [[eth-subscribe|eth_subscribe]] przez WebSocket i wybierają endpointy według [[fastest-head|czasu do heada]]; węzeł Chainlink potrzebuje adresu WebSocket zawsze, gdy jego log broadcaster jest włączony, a tak jest domyślnie na mainnecie Ethereum.",
          "Ostatni profil to praca samego łańcucha. Węzeł Ethereum to [[beacon-node|beacon node]] sterujący [[execution-client|klientem wykonawczym]] przez [[engine-api|Engine API]], a tę parę uruchamiają [[validator-node|walidatorzy]], operatorzy stakingu i restakingu oraz [[distributed-validator|rozproszeni walidatorzy]]. [[relay|Relaye]], które przekazują bloki builderów proposerom, ponownie wykonują każdy z nich przed upływem terminu. Rollupy odbudowują swój łańcuch z danych L1 przez [[derivation-pipeline|derivation pipeline]] i pobierają [[blob|bloby]], mając za sobą [[blob-archive|archiwa blobów]]. Zespoły łańcuchów, platformy rollup-as-a-service, operatorzy [[testnets|testnetów]] i [[permissioned-network|sieci permissioned]] oraz projekty [[network-telemetry|telemetrii]] i [[portal-network|historii]] uruchamiają własne węzły; [[rpc-provider|dostawcy RPC]] i firmy hostujące węzły sprzedają wszystkie profile naraz."
        ]
      }
    ],
    example: {
      title: "Konkretni konsumenci, ich wywołania i potrzebna im historia",
      note: "Każdy wiersz opiera się na publicznej dokumentacji albo kodzie projektu; jedna organizacja może występować w kilku profilach, więc każdą usługę trzeba przypisywać według jej ruchu, a nie według marki."
    },
    pitfalls: [
      "[[rpc-benchmarking|Wymiarowanie endpointu]] według liczby żądań, gdy jeden trace albo szeroki skan logów kosztuje więcej niż cała strona odczytów na headzie.",
      "Testowanie konsumenta tylko na `latest`, a potem awaria na produkcji w tej części jego mixu, która dotyczy przypiętych bloków albo historii.",
      "Traktowanie archiwum jako jednej funkcji, podczas gdy stary stan, stare receipty, trace'y i historyczne dowody są przechowywane osobno."
    ]
  },
  "rpc-benchmarking": {
    title: "Benchmarkowanie węzłów RPC",
    aliases: [
      "RPC load testing",
      "testy obciążeniowe RPC",
      "RPC benchmark",
      "benchmark RPC",
      "coordinated omission",
      "open-loop load",
      "obciążenie w otwartej pętli",
      "A/A test",
      "przebieg A/A",
      "saturation curve",
      "krzywa nasycenia",
      "flood"
    ],
    summary: "Benchmarkowanie węzła albo providera RPC to mierzenie latencji, przepustowości i poprawności pod ruchem podobnym do prawdziwego (z realistyczną mieszanką metod, stałym tempem napływu żądań, stanem wielkości mainnetu i rozgrzanym cache) oraz raportowanie percentyli względem zmierzonego poziomu szumu zamiast jednej średniej.",
    sections: [
      {
        heading: "Dobór obciążenia",
        paragraphs: [
          "Obciążenie jedną metodą mierzy jedną ścieżkę kodu: wysyłanie `eth_getBlockByNumber` dla `latest` tysiące razy na sekundę mierzy głównie [[caching|cache]], bo każde żądanie pyta o ten sam blok. Produkcja obsługuje [[rpc-workloads|mieszankę]] odczytów heada, wywołań [[eth-call|eth_call]] czytających storage spoza cache, zakresów [[eth-get-logs|eth_getLogs]] i okazjonalnych [[trace-api|trace'ów]], a o pojemności węzła (capacity) decyduje kosztowna mniejszość. Realistyczne mieszanki pochodzą z logu żądań z [[rpc-gateway|gatewaya]], odtwarzanego w oryginalnej kolejności, albo z generatora takiego jak ethspam, który tworzy zapytania tylko do odczytu wokół najnowszego bloku. Odtwarzane wywołania na `latest` czytają przy każdym przebiegu inny stan, więc żeby wyniki były powtarzalne, trzeba przypiąć numery bloków.",
          "Rozmiar stanu ma takie samo znaczenie jak mieszanka. [[local-devnet|Lokalny devnet]] albo sieć [[kurtosis|Kurtosis]] startuje z małego stanu genesis, który mieści się w pamięci, więc każdy odczyt storage trafia w RAM; stan mainnetu jest znacznie większy niż RAM, więc wartość storage spoza cache to losowy odczyt z dysku SSD, czyli właśnie ten odczyt, pod który dobiera się [[node-hardware|sprzęt węzła]]. Węzeł powinien też podążać za łańcuchem, bo import każdego nowego bloku konkuruje z RPC o dysk i CPU; węzeł odcięty od sieci wygląda na szybszy, niż kiedykolwiek będzie na produkcji. W przypadku [[rpc-provider|providera]] odległość sieciowa to często większość latencji, więc trzeba mierzyć z miejsca, w którym działa aplikacja."
        ]
      },
      {
        heading: "Otwarta pętla, zamknięta pętla, coordinated omission",
        paragraphs: [
          "Generator w zamkniętej pętli (closed loop) uruchamia stały zestaw workerów, z których każdy wysyła kolejne żądanie dopiero po otrzymaniu poprzedniej odpowiedzi; tak działa executor `constant-vus` w k6. Gdy serwer zwalnia, workery czekają, tempo żądań spada, a wolny okres prawie nie trafia do próbek; nazywa się to coordinated omission. Generator w otwartej pętli (open loop) wysyła według harmonogramu bez względu na odpowiedzi: `constant-arrival-rate` w k6, `-rate` w vegeta i flood, który działa na bazie vegeta. wrk2 mierzy czas każdego żądania od chwili, w której powinno zostać wysłane: w jego README jedna przerwa trwająca 1,4 sekundy podczas przebiegu z 2000 żądań na sekundę daje skorygowany p99, czyli latencję, od której szybsze jest 99% żądań, równy 1,27 s wobec 6,04 ms bez korekty.",
          "Wąskim gardłem może być sam generator: maszyna obciążająca, której brakuje CPU albo socketów, raportuje własne kolejkowanie jako latencję serwera, więc trzeba obserwować jej CPU i `dropped_iterations` w k6, czyli liczbę iteracji pominiętych z braku wolnego workera (virtual user). Sukces ocenia się po body, a nie po statusie: węzeł zwraca [[rpc-errors|błędy JSON-RPC]], takie jak `execution reverted` czy `missing trie node`, wewnątrz odpowiedzi HTTP 200, a vegeta liczy każde 200 jako sukces. Obsługuje to `--deep-check` we flood: sprawdza, czy każde body to poprawny JSON bez błędu, i raportuje porażki osobno."
        ]
      },
      {
        heading: "Jak czytać liczby",
        paragraphs: [
          "Latencję raportuje się osobno dla każdej metody jako percentyle, takie jak p50 (mediana) i p99, plus maksimum. Rozkład latencji RPC jest skośny, więc średnia 8 ms może ukrywać p99 równe 400 ms, które biorą się z zimnych odczytów. Pojemność to krzywa nasycenia, a nie jedna liczba. Trzeba stopniowo podnosić zadane tempo (offered rate), czyli to, co wysyła generator, na przykład przez `--rates 100 200 400 800 1600` we flood, i rysować względem niego osiągnięte tempo (achieved rate), czyli to, na co węzeł odpowiada, oraz p99; kolano krzywej (knee) to miejsce, w którym osiągnięte tempo przestaje nadążać za zadanym. Rozgrzewkę (warm-up) trzeba odrzucić: po restarcie cache są zimne, a środowiska uruchomieniowe .NET i JVM w [[nethermind|Nethermind]] i [[besu|Besu]] wciąż kompilują gorący kod, więc mierzy się dopiero wtedy, gdy kolejne interwały dają zgodne wyniki.",
          "Potem trzeba zmierzyć szum. Przebieg A/A porównuje dwa identyczne buildy; ich rozrzut to najmniejsza różnica, jaką dany zestaw pomiarowy potrafi rozróżnić, a wynik A/B (build A kontra zmieniony build B) mieszczący się w tym rozrzucie nic nie znaczy. Przebiegi przeplata się w kolejności A, B, B, A, żeby powolny dryf, taki jak kompakcja bazy danych w tle, rozłożył się równo na oba buildy."
        ]
      },
      {
        heading: "Sprawdzanie odpowiedzi",
        paragraphs: [
          "Szybka zła odpowiedź jest gorsza niż wolna poprawna, więc trzeba też porównywać odpowiedzi. Tryb `--equality` we flood sprawdza, czy dwa węzły odpowiadają identycznie, a versus od Infury puszcza jeden strumień żądań na kilka endpointów i porównuje body, statusy i czasy; jego README zauważa, że wiele niezgodności to tylko kolejność kluczy, formatowanie albo dodatkowe pola, więc najpierw trzeba odpowiedzi znormalizować. Przy każdym porównywanym żądaniu trzeba przypiąć blok: na `latest` dwa zdrowe węzły różniące się o jeden blok dają różne odpowiedzi i oba mają rację, a to jest [[head-lag|opóźnienie heada]], a nie błąd.",
          "Drugą połowę pokrywają testy zgodności. Repozytorium [[execution-apis|execution-apis]] przechowuje nagrane żądania i odpowiedzi dla małego, stałego łańcucha, a symulator `rpc-compat` w [[hive|hive]] odtwarza je na głównych klientach i sprawdza, czy każdy z nich zwraca przez [[json-rpc|JSON-RPC]] nagrane wartości. To wyłapuje błędy kształtu i kodowania na małym stanie; benchmark na mainnecie, który porównuje odpowiedzi, wyłapuje to, co ujawnia dopiero prawdziwy stan."
        ]
      }
    ],
    example: {
      title: "Przebieg A/A z krzywą nasycenia, czytany krok po kroku",
      note: "Oba węzły działają na identycznym kodzie, więc każda różnica w tabeli to szum; dopiero gdy ten rozrzut jest znany, przebieg porównujący dwa różne buildy cokolwiek znaczy."
    },
    pitfalls: [
      "Podawanie latencji z narzędzia w zamkniętej pętli jako tego, co widzą użytkownicy pod obciążeniem, choć jego workery przeczekały wolne okresy.",
      "Liczenie każdego HTTP 200 jako sukcesu, gdy body zawierają reverty, `missing trie node` albo inne błędy JSON-RPC.",
      "Mierzenie pojemności na devnecie z małym genesis i podawanie jej jako wyniku dla węzła mainnetu.",
      "Nazywanie zmiany o 2% regresją bez przebiegu A/A, który pokazuje, że zestaw pomiarowy potrafi rozróżnić 2%."
    ]
  },
  "rpc-privacy": {
    title: "Czego endpoint RPC dowiaduje się o tobie",
    aliases: [
      "RPC privacy",
      "prywatność RPC",
      "read privacy",
      "prywatność odczytów",
      "wallet privacy",
      "prywatność portfela",
      "address linking",
      "łączenie adresów",
      "private information retrieval",
      "PIR"
    ],
    summary: "Każde żądanie RPC mówi operatorowi endpointu, kto pyta, przez źródłowy adres IP, i o co, przez adresy, kontrakty i transakcje w parametrach. Dzięki temu operator może powiązać ze sobą konta jednego użytkownika, zobaczyć jego aktywa i przypisać wysłaną transakcję do lokalizacji w sieci.",
    sections: [
      {
        heading: "Co zdradza jedna sesja",
        paragraphs: [
          "Każde żądanie przychodzi ze źródłowym adresem IP, często z kluczem API, a gdy pochodzi ze strony WWW, także z nagłówkiem `Origin`, który wskazuje witrynę. Parametry wskazują, kogo dotyczy pytanie: [[eth-get-balance|eth_getBalance]] niesie adres, [[eth-call|eth_call]] do `balanceOf` tokena niesie go w calldata [[abi|zakodowanym według ABI]], a filtr [[eth-get-logs|eth_getLogs]] na transfery do użytkownika niesie go jako [[event-signature|topic]] dopełniony do 32 bajtów. Endpoint nie może odpowiedzieć, nie odczytując go.",
          "Większym wyciekiem jest łączenie kont. Portfel, który odświeża salda trzech kont w jednym [[batch-request|batchu]] albo jednym wywołaniu [[multicall|Multicall3]] z jednego IP, mówi operatorowi, że te konta są ze sobą powiązane, nawet jeśli nigdy nie przesyłały sobie nawzajem transakcji. Wysyłanie zdradza jeszcze więcej: [[eth-send-raw-transaction|eth_sendRawTransaction]] niesie podpisaną transakcję, a adres nadawcy da się odzyskać z jej [[ecdsa-signature|podpisu]], więc operator poznaje IP stojące za adresem, zwykle kilka sekund po [[eth-get-transaction-count|eth_getTransactionCount]] na `pending` i wywołaniu [[eth-estimate-gas|eth_estimateGas]], które podało odbiorcę i kwotę."
        ]
      },
      {
        heading: "Ustawienia domyślne i deklarowane zasady",
        paragraphs: [
          "Wielu użytkowników nigdy nie wybiera endpointu. Informacja o prywatności MetaMaska wskazuje Infurę jako providera RPC, którego portfel używa domyślnie; użytkownik może dodać dla sieci inny adres RPC i ustawić go jako domyślny. W grudniu 2022 Consensys, który prowadzi oba produkty, oświadczył, że nie przechowuje adresów portfeli przy żądaniach odczytu wysyłanych przez Infurę, że przy żądaniach zapisu zbiera adresy portfeli i adresy IP, ale przechowuje je osobno, i że pracuje nad skróceniem okresu przechowywania do siedmiu dni. Obecna informacja nie podaje okresu przechowywania dla żadnego z tych dwóch rodzajów żądań. Polityka reguluje przechowywanie, a nie widoczność: każdy odczyt nadal przechodzi przez operatora.",
          "Endpoint portfela rzadko jest jedynym obserwatorem. Dapp wysyła własne odczyty do endpointu, który sam wybrał ([[dapp-architecture|architektura dappa]]), więc drugi operator widzi ten sam adres razem z witryną, z której przyszło żądanie. Zapytania [[ens|ENS]] ujawniają nazwy, które użytkownik rozwiązuje, a nazwa korzystająca z [[ccip-read|CCIP-Read]] przekazuje zapytanie dalej do gatewaya wybranego przez kontrakt resolvera. Backendy portfeli, które pobierają dla konta ceny, listy tokenów albo [[address-history|historię adresu]], też są obserwatorami."
        ]
      },
      {
        heading: "Środki zaradcze i co każdy z nich ukrywa",
        paragraphs: [
          "[[self-hosting|Własny węzeł]] zatrzymuje odczyty lokalnie, choć gdy rozgłasza transakcję, z konieczności jest pierwszym peerem, który ogłasza ją przez [[devp2p|devp2p]]. Tor albo VPN ukrywa IP, ale nie łączenie kont: jedna sesja, która odświeża wszystkie konta, nadal je ze sobą wiąże, więc rozdzielenie kont wymaga osobnego obwodu Tor i osobnej sesji dla każdego z nich. Rozłożenie ruchu na kilku [[rpc-provider|providerów]] zostawia każdemu operatorowi tylko fragment; roadmapa prywatności Vitalika Buterina z kwietnia 2025 proponuje kilka endpointów, najlepiej jeden na dapp, opcjonalnie osiąganych przez mixnet, który opóźnia i miesza wiadomości tak, żeby nie dało się ich powiązać z nadawcą.",
          "Weryfikacja to nie prywatność. [[helios|Helios]] i inne konfiguracje [[verified-rpc|weryfikowanego RPC]] sprawdzają odpowiedzi przez [[eth-get-proof|eth_getProof]], więc provider nadal dostaje adres. Przy `eth_call`, które Helios wykonuje ponownie lokalnie, provider dostaje [[eth-create-access-list|eth_createAccessList]] dla tego samego wywołania oraz żądanie dowodu dla każdego konta, którego dotyka wywołanie. Ukrycie samego pytania wymaga zaufanego środowiska wykonawczego (trusted execution environment, TEE), czyli sprzętowej enklawy, w której operator nie może odczytać obliczeń, co roadmapa proponuje na krótką metę, albo private information retrieval (PIR), gdzie serwer odpowiada, nie dowiadując się, o który rekord pytano; według roadmapy to podejście nie jest jeszcze wydajne dla dużych zbiorów danych."
        ]
      },
      {
        heading: "Celowe czytanie wszystkiego",
        paragraphs: [
          "Aplikacje dbające o prywatność unikają wycieku, zadając pytania, na które odpowiedź jest taka sama dla każdego użytkownika. Portfel RAILGUN pobiera dane kontraktu puli, żeby odbudować swoje drzewa Merkle, i próbuje odszyfrować każdą notę (note), czyli zaszyfrowany zapis wartości, żeby znaleźć własne saldo, więc provider widzi pobieranie, jakie wykonałby każdy portfel (domyślnie znaczna część danych przychodzi przez QuickSync, czyli [[the-graph|subgraph]], którego indekser ma ten sam obraz). Adresy stealth z ERC-5564, czyli nowy adres dla każdej płatności, który rozpoznaje tylko odbiorca, działają tak samo: odbiorcy skanują każdy event `Announcement` z kontraktu announcer pod `0x55649E01B5Df198D18D95b5cc5051630cfD45564`. Jednobajtowy view tag pozwala im odrzucić około 255 na każde 256 po jednym mnożeniu na krzywej eliptycznej i jednym hashu.",
          "Ceną jest transfer danych, a ochrona jest częściowa: nadal wyciekają czasy, kwoty wpłat i wypłat oraz endpoint użyty do wysłania transakcji, a portfel, który przez ten sam endpoint sprawdza też publiczne saldo użytkownika, niweczy cały wysiłek. To coś innego niż [[private-rpc|prywatne RPC dla transakcji]], które trzyma transakcję poza publicznym [[mempool|mempoolem]], dopóki nie trafi ona do bloku; prywatny endpoint nadal widzi IP nadawcy i całą transakcję i nie ukrywa niczego w sprawie zapytań wysłanych wcześniej."
        ]
      }
    ],
    example: {
      title: "Jedna sesja portfela w logu endpointu",
      note: "Kroki 2 i 3 łączą konta, a krok 6 lokalizuje jedno z nich; przepuszczenie sesji przez Tor zmieniłoby adres źródłowy w każdej linii, ale nie usunęłoby żadnego z tych powiązań."
    },
    pitfalls: [
      "Rozumienie zapewnienia providera, że nie przechowuje żądań odczytu, jako zapewnienia, że provider tych odczytów w ogóle nie widział.",
      "Odświeżanie wszystkich kont w jednym batchu, co łączy je dla operatora nawet przez Tor.",
      "Traktowanie lekkiego klienta albo weryfikowanego RPC jako ochrony prywatności; dowodzi on poprawności odpowiedzi, a pytania zostawia na widoku."
    ]
  }
};
