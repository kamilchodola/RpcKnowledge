// Polish text for the Foundations lessons, keyed by topic id. Only the words: ids, link
// targets, code, related topics, and sources come from data/foundations.js.
export const topics = {
  "ethereum-rpc": {
    title: "Ethereum RPC",
    aliases: ["api ethereum", "api węzła", "zacznij tutaj", "mapa rpc", "interfejsy ethereum", "czym jest ethereum rpc"],
    summary: "Ethereum RPC to rodzina interfejsów, przez które program rozmawia z węzłem Ethereum: API [[json-rpc|JSON-RPC]] [[execution-layer|warstwy wykonawczej]], uwierzytelnione [[engine-api|Engine API]] między dwoma klientami węzła, REST-owe [[beacon-api|Beacon API]] [[consensus-layer|warstwy konsensusu]] oraz API providera, które portfel udostępnia w przeglądarce.",
    sections: [
      {
        heading: "Cztery interfejsy",
        paragraphs: [
          "Mówiąc o endpoincie Ethereum RPC, większość ludzi ma na myśli JSON-RPC warstwy wykonawczej. Jego metody są pogrupowane w [[namespaces|przestrzenie nazw]], takie jak `eth_`, `net_` i `web3_`, z opcjonalnymi rozszerzeniami `debug_` i `trace_`. Odczytują [[block|bloki]], konta i [[event-log|logi]], symulują wywołania przez [[eth-call|eth_call]] i przyjmują podpisane transakcje do rozgłoszenia w sieci. [[execution-client|Klient wykonawczy]] udostępnia to API przez [[http-transport|HTTP]], [[websocket-transport|WebSocket]] albo lokalny [[ipc-transport|socket]].",
          "Pozostałe trzy mają węższy zakres. [[engine-api|Engine API]] to prywatne połączenie wewnątrz węzła: domyślnie działa na porcie 8551 i jest uwierzytelniane wspólnym sekretem JWT. Przez nie [[consensus-client|klient konsensusu]] przekazuje klientowi wykonawczemu [[execution-payload|execution payloady]] i wskazuje bloki head, safe i finalized. [[beacon-api|Beacon API]] to interfejs REST po stronie konsensusu, który obejmuje sloty, walidatorów, checkpointy [[finality|finalności]] i bloby. [[eip-1193|Provider EIP-1193]] to obiekt JavaScript, który portfel w przeglądarce udostępnia stronie. Strona wywołuje `window.ethereum.request`, a portfel decyduje, który węzeł odpowie."
        ]
      },
      {
        heading: "Co stoi za endpointem",
        paragraphs: [
          "Endpoint to nie baza danych z językiem zapytań. Od czasu [[the-merge|Merge]] węzeł to dwa procesy: klient wykonawczy, który przechowuje [[state|stan globalny]] i uruchamia [[evm|EVM]], oraz klient konsensusu, który obsługuje [[proof-of-stake|proof of stake]]. Każda odpowiedź to widok jednego węzła w danej chwili, dlatego dwa endpointy mogą się nie zgadzać co do bloku head, choć żaden z nich nie jest zepsuty; zobacz [[head-lag|head łańcucha na różnych węzłach]].",
          "Od tego zależy też model zaufania. Zwykły wynik JSON-RPC to tylko zapewnienie tego, kto prowadzi węzeł, a nie dowód. Niektóre odpowiedzi można sprawdzić, zamiast wierzyć im na słowo: wystarczy zweryfikować [[state-proof|dowód stanu]] względem nagłówka, któremu już się ufa. Tak właśnie działa [[light-client|lekki klient (light client)]]. Większość aplikacji przyjmuje odpowiedź na wiarę, a ryzyko zmniejsza, porównując wyniki dwóch [[rpc-provider|dostawców RPC]]."
        ]
      },
      {
        heading: "Jak czytać tę mapę",
        paragraphs: [
          "Każde pojęcie warte wyjaśnienia ma własny temat, a każdy temat wyjaśnia dokładnie jedną rzecz i po resztę odsyła dalej. Najlepiej zacząć od [[rpc|zdalnego wywołania procedury]], potem przejść do [[json-rpc|JSON-RPC warstwy wykonawczej]] jako całości, a pod ręką trzymać [[hex-encoding|kodowanie hex]] oraz [[block-tag|identyfikatory i tagi bloków]], bo niemal każda metoda korzysta z jednego i drugiego.",
          "Każda kategoria ma swój punkt wejścia. Struktury danych, które stoją za każdą odpowiedzią, zaczynają się od [[block|bloku]]. Oprogramowanie obsługujące RPC zaczyna się od [[execution-client|klienta wykonawczego]], a warianty wdrożenia od [[full-node|pełnego węzła]]. Strona konsensusu zaczyna się od [[proof-of-stake|proof of stake]]. Zamiana danych łańcucha na dane, które da się odpytywać, zaczyna się od [[indexer|indeksera]], a weryfikowanie odpowiedzi zamiast ufania im od [[state-proof|dowodu stanu]]. Warstwa 2 zaczyna się od [[rollup|rollupu]], a strona aplikacji od [[dapp-architecture|architektury dappa]]. Jeśli RPC na produkcję ma być własne albo kupione, punktem wyjścia jest [[rpc-provider|dostawca RPC]]."
        ]
      }
    ],
    example: {
      title: "Trzy interfejsy, trzy zupełnie różne wywołania",
      note: "Pierwsze jest dla aplikacji, drugie dla stakerów i eksploratorów bloków, a trzecie służy wyłącznie do rozmowy między dwiema połówkami jednego węzła."
    },
    pitfalls: [
      "Zakładanie, że każdy endpoint odpowiada na każdą metodę; tracing, stan historyczny i subskrypcje są opcjonalne, więc zanim kod się na nich oprze, trzeba sprawdzić, [[endpoint-capabilities|co endpoint obsługuje]].",
      "Wystawianie portu Engine API publicznie, bo wygląda jak zwykłe JSON-RPC; przez ten port zapada decyzja, na którym bloku buduje węzeł, więc musi pozostać uwierzytelniony i lokalny.",
      "Składanie odpowiedzi z dwóch endpointów w jeden snapshot; gdy kilka odczytów musi być ze sobą spójnych, trzeba podać jawny numer lub hash bloku."
    ]
  },
  rpc: {
    title: "Zdalne wywołanie procedury (RPC)",
    aliases: ["rpc", "zdalne wywołanie procedury", "rpc a rest", "wywołanie procedury", "remote procedure call"],
    summary: "Zdalne wywołanie procedury (remote procedure call, RPC) to żądanie, które uruchamia nazwaną operację w innym procesie z podanymi argumentami i zwraca jej wynik. Dzięki temu rozmowa z węzłem wygląda jak wywołanie funkcji, a nie pobieranie dokumentu.",
    sections: [
      {
        heading: "Co oznacza RPC",
        paragraphs: [
          "W stylu RPC jednostką interfejsu jest czasownik: nazwa metody, jej argumenty i wynik. [[eth-get-balance|eth_getBalance]] z [[address|adresem]] i [[block-tag|identyfikatorem bloku]] to wywołanie funkcji, które akurat wykonuje się na cudzej maszynie. REST stawia na pierwszym miejscu rzeczowniki: zasoby mają swoje ścieżki URL, a operuje się na nich małym, stałym zestawem czasowników HTTP. Ethereum wybrało model, w którym najpierw jest czasownik, a format przesyłanych danych określa [[json-rpc|JSON-RPC 2.0]].",
          "Każdy system RPC potrzebuje czterech rzeczy: przestrzeni nazw metod, serializacji argumentów i wyników, transportu oraz kanału błędów. W Ethereum są to [[namespaces|nazwy metod z prefiksem]], JSON z liczbami i ciągami bajtów [[hex-encoding|zakodowanymi w hex]], transport [[http-transport|HTTP]], [[websocket-transport|WebSocket]] lub [[ipc-transport|IPC]] oraz [[rpc-errors|obiekt błędu]] JSON przesyłany w odpowiedzi HTTP, która poza tym kończy się sukcesem."
        ]
      },
      {
        heading: "Dlaczego węzeł udostępnia czasowniki",
        paragraphs: [
          "Operacje węzła nie przekładają się wprost na zasoby. [[eth-call|eth_call]] uruchamia [[evm|EVM]] dla hipotetycznej transakcji na wybranym [[state|stanie]]; [[eth-estimate-gas|eth_estimateGas]] wykonuje ją wielokrotnie, szukając właściwej ilości gasu; [[eth-send-raw-transaction|eth_sendRawTransaction]] przekazuje podpisane bajty do [[mempool|mempoolu]] i do sieci, która rozgłasza je dalej. Żadna z tych operacji nie jest żądaniem GET ani PUT na dokumencie. Lista czasowników pozwala też klientowi dodać `debug_traceTransaction` bez przeprojektowywania hierarchii adresów URL.",
          "Ceną jest to, że semantyka HTTP przestaje opisywać wykonywaną pracę. Każde wywołanie to POST na jeden adres URL, więc cache, serwery proxy i przeglądarki nie odróżnią taniego odczytu od kosztownego tracingu, a [[rpc-gateway|gateway RPC]] musi sparsować body JSON, zanim będzie mógł cokolwiek routować, [[caching|cache'ować]] albo zliczać. Oznacza to również, że granicą bezpieczeństwa jest lista metod, a nie przestrzeń adresów URL; zobacz [[security|bezpieczeństwo RPC]]."
        ]
      },
      {
        heading: "Co ukrywa słowo „zdalne”",
        paragraphs: [
          "Funkcja lokalna albo zwraca wynik, albo rzuca wyjątek. Zdalna może też skończyć się timeoutem, zostać obsłużona przez inną maszynę za [[load-balancer|load balancerem]] albo zakończyć się sukcesem na serwerze, podczas gdy odpowiedź zginie w drodze powrotnej. Gdy `eth_sendRawTransaction` skończy się timeoutem, transakcja mogła już zostać rozgłoszona, więc ponowne wysłanie jest bezpieczne tylko dlatego, że te same podpisane bajty mają ten sam hash; zobacz [[retries|ponawianie i idempotentność]].",
          "Drugą ukrytą rzeczą jest to, że wywoływana strona to łańcuch, którego head ciągle się przesuwa. Dwa identyczne wywołania w odstępie sekundy mogą zupełnie poprawnie zwrócić różne wyniki, a wywołanie skierowane do opóźnionego węzła zwraca `null` dla [[transaction-receipt|receiptu]] (wyniku wykonania transakcji), który gdzie indziej już istnieje; zobacz [[head-lag|head łańcucha na różnych węzłach]]. [[client-libraries|Biblioteki klienckie]] ukrywają transport i kodowanie, ale tego ukryć nie mogą."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie metody RPC jak czystej funkcji; to samo wywołanie na `latest` odczytuje ruchomy łańcuch, a nie stałą wartość.",
      "Ponawianie zapisu tak samo jak odczytu, bez sprawdzenia, czy poprzednia próba już nie przeszła; zamiast tego trzeba najpierw wyszukać transakcję po hashu.",
      "Zakładanie, że kod statusu HTTP opisuje wywołanie; błąd JSON-RPC zwykle przychodzi w body odpowiedzi `200 OK`."
    ]
  },
  "json-rpc": {
    title: "Ethereum JSON-RPC",
    aliases: ["eth json-rpc", "api wykonawcze", "metody eth_", "api węzła", "json rpc 2.0"],
    summary: "API Ethereum JSON-RPC to interfejs [[execution-layer|warstwy wykonawczej]] przeznaczony dla aplikacji: zestaw metod pogrupowanych w [[namespaces|przestrzenie nazw]], przesyłanych jako obiekty [[request-response|JSON-RPC 2.0]], z wartościami [[hex-encoding|zakodowanymi w hex]], opisany w repozytorium [[execution-apis|execution-apis]] i dostępny przez HTTP, WebSocket lub IPC.",
    sections: [
      {
        heading: "Co obejmuje API",
        paragraphs: [
          "Przestrzeń nazw `eth_` ma pięć zadań. Zwraca dane łańcucha ([[eth-get-block-by-number|eth_getBlockByNumber]], [[eth-get-transaction-by-hash|eth_getTransactionByHash]], [[eth-get-transaction-receipt|eth_getTransactionReceipt]], [[eth-get-logs|eth_getLogs]]). Odczytuje [[state|stan globalny]] w bloku wskazanym przez [[block-tag|identyfikator bloku]] ([[eth-get-balance|eth_getBalance]], [[eth-get-code|eth_getCode]], [[eth-get-storage-at|eth_getStorageAt]], [[eth-get-transaction-count|eth_getTransactionCount]], [[eth-get-proof|eth_getProof]]). Symuluje wykonanie ([[eth-call|eth_call]], [[eth-estimate-gas|eth_estimateGas]], [[eth-simulate|eth_simulateV1]]). Wycenia transakcje ([[eth-gas-price|eth_gasPrice]], [[eth-fee-history|eth_feeHistory]]). I przyjmuje zapisy, choć metoda zapisu jest w praktyce tylko jedna: [[eth-send-raw-transaction|eth_sendRawTransaction]].",
          "Obok działają małe, pomocnicze przestrzenie nazw. [[net-web3-api|net_ i web3_]] podają liczbę peerów, informację, czy węzeł nasłuchuje, oraz `web3_clientVersion`; [[eth-syncing|eth_syncing]] i [[chain-id|eth_chainId]] odpowiadają na pytania, które zadaje [[health-check|health check]]. Dostęp w trybie push daje [[eth-subscribe|eth_subscribe]] przez WebSocket albo [[eth-filters|filtry po stronie serwera]], które klient odpytuje (polling)."
        ]
      },
      {
        heading: "Standard, standard de facto i rozszerzenia klientów",
        paragraphs: [
          "Specyfikacja obejmuje tylko część tego, co oferuje endpoint. Repozytorium [[execution-apis|execution-apis]] definiuje `eth_`, `net_`, `web3_` i [[engine-api|Engine API]] jako schematy [[openrpc|OpenRPC]]. Cała reszta to konwencja: `debug_` trzyma się formatu z [[geth|Geth]], [[trace-api|przestrzeń nazw trace_]] trzyma się formatu z Parity i implementują ją [[nethermind|Nethermind]], [[erigon|Erigon]] i [[reth|Reth]], [[txpool-api|txpool_]] i [[admin-api|admin_]] różnią się między klientami, a `personal_` jest przestarzałe (deprecated) na rzecz zewnętrznych signerów. Hostowani [[rpc-provider|dostawcy RPC]] dokładają do tego własne, rozszerzone metody.",
          "Nawet metody standardowe zachowują się różnie. Węzły ograniczają ilość gasu, jaką może zużyć `eth_call`, limitują liczbę bloków, jaką może objąć [[eth-get-logs|eth_getLogs]], różnią się co do tego, co obejmuje `pending`, i inaczej formułują komunikaty błędów. Dlatego przenośny kod nie zakłada [[endpoint-capabilities|możliwości endpointu]], tylko je sprawdza, zaczynając od `web3_clientVersion`."
        ]
      },
      {
        heading: "Format i kodowanie",
        paragraphs: [
          "Żądanie to obiekt JSON z polami `jsonrpc`, `method`, `params` i `id`; odpowiedź ma to samo `id` oraz `result` albo [[rpc-errors|obiekt błędu]]. Parametry to tablice pozycyjne: Ethereum nie korzysta z parametrów nazwanych, które dopuszcza JSON-RPC. Liczby całkowite są przesyłane jako ciągi QUANTITY, na przykład `0x1a4`, ciągi bajtów jako DATA o stałej długości, na przykład 20-bajtowy [[address|adres]], a ostatnim parametrem metody odczytu jest zwykle identyfikator bloku. Kilka żądań może dzielić jeden round trip jako [[batch-request|batch]].",
          "JSON nie przenosi typów, więc znaczenie niosą [[hex-encoding|reguły kodowania]]. Saldo to ciąg hex, który trzeba sparsować jako dużą liczbę całkowitą, nigdy jako liczbę JavaScript, a brakujący obiekt to `null`, a nie błąd."
        ]
      },
      {
        heading: "Gdzie kończy się specyfikacja",
        paragraphs: [
          "Specyfikacja opisuje metody, a nie wdrożenia. [[authentication|Uwierzytelnianie]], TLS, reguły CORS, [[rate-limits|rate limity]] (limity zapytań), limity rozmiaru batcha, limity zakresu bloków, limity rozmiaru odpowiedzi i to, czy WebSocket w ogóle jest dostępny, to decyzje operatora. Dwa endpointy mogą być w pełni poprawne, a mimo to zachowywać się inaczej pod obciążeniem, dlatego kod produkcyjny ma wbudowane [[retries|ponawianie]] i [[failover|failover]] oraz uwzględnia [[head-lag|head lag]], czyli opóźnienie węzła względem łańcucha."
        ]
      }
    ],
    example: {
      title: "Minimalne żądanie i odpowiedź",
      note: "Wynik to kwota w wei zapisana jako QUANTITY w hex: trzeba ją sparsować typem dla dużych liczb całkowitych i pamiętać, że odpowiedź jest prawdziwa tylko dla bloku, który w tamtej chwili był `latest`."
    },
    pitfalls: [
      "Parsowanie wyniku QUANTITY jako 64-bitowej liczby zmiennoprzecinkowej; salda i wartości w wei przekraczają `Number.MAX_SAFE_INTEGER` i po cichu tracą precyzję.",
      "Zakładanie, że metoda istnieje wszędzie; `trace_`, `debug_` i `eth_simulateV1` są na wielu endpointach niedostępne lub wyłączone i zwracają błąd „method not found”.",
      "Pisanie kodu pod limity zakresu bloków i rozmiaru batcha jednego dostawcy, a potem odkrycie, że inny dostawca narzuca ostrzejsze.",
      "Oczekiwanie błędu, gdy obiekt jest nieznany; nieznane bloki, transakcje i receipty wracają jako `null` w udanej odpowiedzi."
    ]
  },
  "request-response": {
    title: "Format komunikatu JSON-RPC (envelope)",
    aliases: ["jsonrpc 2.0", "envelope", "obiekt żądania", "obiekt odpowiedzi", "dopasowanie id", "params", "powiadomienie", "notification"],
    summary: "Każde wywołanie warstwy wykonawczej jest przesyłane jako obiekt JSON z polami `jsonrpc`, `method`, `params` i `id`, a wraca jako obiekt z tym samym `id` i dokładnie jednym z pól `result` albo `error`.",
    sections: [
      {
        heading: "Obiekt żądania",
        paragraphs: [
          "Żądanie składa się z czterech pól. `jsonrpc` musi być ciągiem `\"2.0\"`; serwery odrzucają `1.0` albo brak wersji błędem `-32600`. `method` to pełna nazwa razem z [[namespaces|prefiksem przestrzeni nazw]], na przykład `eth_getBlockByNumber`, i wielkość liter ma w niej znaczenie. `params` to tablica argumentów pozycyjnych; JSON-RPC 2.0 dopuszcza też obiekt z parametrami nazwanymi, ale metody Ethereum są zdefiniowane pozycyjnie, a klienci na ogół odrzucają formę obiektową. `id` to ciąg znaków lub liczba wybrana przez wywołującego.",
          "Opcjonalne parametry końcowe też są pozycyjne, więc żadnego nie da się przeskoczyć. `eth_getBlockByNumber` przyjmuje `[\"0x12d4f1c\", false]`, a ten boolean jest w praktyce obowiązkowy. Obiekt [[state-override|state override]] dla [[eth-call|eth_call]] można przekazać tylko jako trzeci element, po [[block-tag|identyfikatorze bloku]]. Wysłanie `[]` tam, gdzie metoda oczekuje argumentów, daje `-32602`, czyli invalid params."
        ]
      },
      {
        heading: "Obiekt odpowiedzi",
        paragraphs: [
          "Odpowiedź powtarza `jsonrpc` oraz `id` i zawiera `result` albo `error`, nigdy jedno i drugie. `result` może być dowolną wartością JSON, w tym `null`, którego Ethereum używa w znaczeniu „tego obiektu tutaj nie ma”: nieznany [[block|blok]], [[transaction-receipt|receipt]] transakcji, której jeszcze nie ma w bloku, transakcja usunięta przez [[reorg|reorg]] (reorganizację łańcucha). `error` to obiekt z polami `code`, `message` i opcjonalnym `data`; co znaczą kody, wyjaśnia temat [[rpc-errors|Błędy JSON-RPC]].",
          "Format komunikatu nie zależy od [[http-transport|HTTP]]. Obiekt błędu zwykle przychodzi w body odpowiedzi `200 OK`, więc kod, który patrzy tylko na status HTTP, potraktuje nieudane wywołanie jak sukces, a potem odczyta `undefined` z brakującego pola `result`."
        ]
      },
      {
        heading: "Identyfikatory, powiadomienia i dopasowywanie",
        paragraphs: [
          "Pole `id` istnieje po to, żeby dało się dopasować odpowiedzi do żądań, gdy kilka żądań jest w toku naraz. Przez [[http-transport|HTTP]] rzadko ma to znaczenie, bo każdy POST niesie jedno body, ale przez [[websocket-transport|WebSocket]] wiele wywołań dzieli jeden socket, a ramki wracają w takiej kolejności, w jakiej serwer kończy ich obsługę. Klient musi więc trzymać mapę z `id` na oczekujący promise. W [[batch-request|batchach]] jest tak samo, bo nie ma gwarancji, że kolejność w tablicy odpowiedzi się zgodzi.",
          "Żądanie bez pola `id` to powiadomienie (notification): serwerowi nie wolno na nie odpowiadać. Ethereum nie używa powiadomień do wywołań, ale w kierunku od serwera do klienta dzieje się coś podobnego. Aktualizacja z [[eth-subscribe|eth_subscribe]] przychodzi jako obiekt `method: \"eth_subscription\"` z polem `params`, w którym są `subscription` i `result`, i w ogóle bez `id`. Klient musi więc routować ją po identyfikatorze subskrypcji, a nie dopasowywać do żądania.",
          "Identyfikatory wybiera wywołujący i dla węzła nic one nie znaczą. Używanie tego samego `id` w każdym żądaniu działa przez HTTP, ale psuje się przez WebSocket albo w batchu, bo dwie odpowiedzi wyglądają wtedy identycznie. Zwykłym rozwiązaniem jest licznik zwiększany osobno dla każdego połączenia."
        ]
      }
    ],
    example: {
      title: "Żądanie, sukces, błąd i push z subskrypcji",
      note: "Trzy z tych czterech ramek mają `id`; czwarta jest powodem, dla którego klient WebSocket potrzebuje drugiej tablicy routingu, z identyfikatorem subskrypcji jako kluczem."
    },
    pitfalls: [
      "Sprawdzanie wyłącznie kodu statusu HTTP; obiekt `error` z JSON-RPC zwykle przychodzi wewnątrz odpowiedzi `200 OK`.",
      "Używanie stałego `id` w równoległych żądaniach na jednym połączeniu WebSocket, przez co dwóch oczekujących odpowiedzi nie da się odróżnić.",
      "Pomijanie parametru końcowego, takiego jak boolean `fullTransactions`; parametry są pozycyjne, więc żadnego nie da się przeskoczyć.",
      "Traktowanie `\"result\": null` jak awarii protokołu; to normalna odpowiedź dla obiektu, którego ten węzeł nie ma."
    ]
  },
  "batch-request": {
    title: "Żądanie zbiorcze (batch)",
    aliases: ["batch json-rpc", "batch", "batching", "żądanie zbiorcze", "żądanie w tablicy", "wiele wywołań naraz"],
    summary: "Batch to tablica JSON z obiektami żądań, wysyłana w jednym round tripie. Serwer odpowiada tablicą odpowiedzi, które mogą przyjść w dowolnej kolejności i mogą mieszać udane wyniki z błędami poszczególnych elementów.",
    sections: [
      {
        heading: "Jak zbudowany jest batch",
        paragraphs: [
          "Body żądania nie jest jednym obiektem, tylko tablicą zwykłych [[request-response|obiektów żądań]], z których każdy ma własne `method`, `params` i `id`. Serwer je przetwarza i zwraca tablicę obiektów odpowiedzi. JSON-RPC 2.0 wprost pozwala zwracać odpowiedzi w dowolnej kolejności, więc jedynym pewnym sposobem, by powiązać odpowiedź z żądaniem, jest `id`. Jeśli niepoprawna jest sama zewnętrzna tablica, serwer odpowiada pojedynczym obiektem błędu zamiast tablicy, a takiej odpowiedzi naiwny parser się nie spodziewa.",
          "Batch oszczędza round tripy, a nie pracę. Węzeł nadal wykonuje każde wywołanie, więc batch z 500 wywołaniami [[eth-get-transaction-receipt|eth_getTransactionReceipt]] kosztuje węzeł tyle samo co 500 osobnych wywołań i daje jedno duże body odpowiedzi. Oszczędza się narzut TCP i TLS oraz opóźnienie każdego pojedynczego żądania, dlatego najwięcej zyskuje [[indexer|indekser]], który pobiera dane z całego bloku."
        ]
      },
      {
        heading: "Czego batch nie gwarantuje",
        paragraphs: [
          "Batch nie jest transakcją ani snapshotem stanu. Jego elementy to niezależne wywołania, a każde z nich widzi ten head, który węzeł ma akurat w chwili jego wykonania. Dwa odczyty `latest` w jednym batchu mogą wypaść po dwóch stronach nowego bloku, więc saldo z elementu 1 i [[nonce|nonce]] z elementu 2 mogą pochodzić z różnych stanów. Gdy liczy się spójność, trzeba przekazać każdemu elementowi ten sam jawny numer bloku albo [[block-hash|hash bloku]]; zobacz [[block-tag|identyfikatory i tagi bloków]].",
          "Częściowe błędy są normalne. Jeden element może zwrócić `-32602`, czyli nieprawidłowe parametry, podczas gdy reszta się powiedzie. Element, który trafi na [[rate-limits|rate limit]] (limit zapytań), nie cofa pozostałych. Niektórzy [[rpc-provider|dostawcy RPC]] odrzucają cały batch, gdy jest za duży albo gdy którykolwiek element przekracza limit, a niektórzy z góry ograniczają rozmiar batcha, zwykle do kilkudziesięciu, najwyżej kilkuset elementów. Batch, który przekracza limit rozmiaru body, pada już na warstwie HTTP i w odpowiedzi nie ma żadnego błędu JSON-RPC."
        ]
      },
      {
        heading: "Jak dobrze korzystać z batcha",
        paragraphs: [
          "Batche powinny być jednorodne i mieć ograniczony rozmiar. Warto grupować wywołania o podobnym koszcie, żeby jedno `debug_traceBlockByNumber` nie blokowało 99 tanich odczytów, które dzielą z nim to samo połączenie i ten sam timeout. Rozmiar batcha trzeba dobrać do budżetu opóźnienia najwolniejszego elementu i dzielić batch po stronie klienta, zamiast pozwalać, by obcinał go serwer. Odpowiedź należy traktować jak nieuporządkowany zbiór: zindeksować tablicę po `id`, a potem w każdym elemencie sprawdzić `error`, zanim odczyta się `result`.",
          "Przy odczytach ze smart kontraktów batch często jest złym narzędziem. [[multicall|Multicall3]] łączy wiele odczytów [[eth-call|eth_call]] w jedno wywołanie on-chain, wykonane dokładnie w jednym bloku, co daje zarówno mniej żądań, jak i atomowy snapshot, którego batch nie może zagwarantować. Batch JSON-RPC pozostaje właściwym narzędziem dla różnych rodzajów wywołań, takich jak bloki, receipty i [[eth-get-logs|logi]] z tego samego zakresu bloków."
        ]
      }
    ],
    example: {
      title: "Batch z dwoma elementami i odpowiedź w innej kolejności",
      note: "Oba elementy wskazują ten sam numer bloku, więc para byłaby spójnym snapshotem, gdyby pierwszy element się powiódł; kolejność odpowiedzi nie ma żadnego znaczenia."
    },
    pitfalls: [
      "Parowanie tablicy odpowiedzi z tablicą żądań po indeksie; odpowiedzi mogą przyjść w innej kolejności, więc trzeba je dopasowywać po `id`.",
      "Odczytywanie `result` bez sprawdzenia `error` w każdym elemencie, przez co błąd jednego elementu zamienia się w ciche `undefined`.",
      "Użycie `latest` w kilku elementach i traktowanie odpowiedzi jak jednego snapshotu; w połowie batcha może pojawić się nowy blok.",
      "Wysłanie jednego ogromnego batcha i obwinianie węzła o timeout; zwykle zabił go limit rozmiaru body albo najwolniejszy element."
    ]
  },
  "rpc-errors": {
    title: "Błędy JSON-RPC",
    aliases: ["kody błędów", "-32000", "-32602", "execution reverted", "EIP-1474", "obiekt błędu"],
    summary: "Błąd JSON-RPC to obiekt z liczbowym `code`, czytelnym dla człowieka `message` i opcjonalnym `data`, zwracany zamiast `result` i zwykle dostarczany wewnątrz udanej odpowiedzi HTTP.",
    sections: [
      {
        heading: "Obiekt błędu",
        paragraphs: [
          "Błąd zastępuje `result` w [[request-response|odpowiedzi JSON-RPC]] i ma trzy pola. `code` to liczba całkowita z jednego ze standardowych zakresów, `message` to jedno krótkie zdanie dla człowieka, a `data` to opcjonalna wartość o dowolnej postaci. Ethereum intensywnie korzysta z `data`: to pole niesie bajty revertu, ilość [[gas|gasu]], której wywołanie by potrzebowało, albo szczegóły rate limitu u dostawcy. Decyzje w kodzie można bezpiecznie opierać tylko na `code`, bo komunikaty różnią się między [[execution-client|klientami wykonawczymi]] i zmieniają się między wydaniami.",
          "W błędach spotykają się też dwie warstwy stosu. Źle sformatowane body odpada, zanim uruchomi się jakakolwiek logika Ethereum, i daje `-32700` albo `-32600`; zły typ argumentu daje `-32602`; nieznana metoda daje `-32601`. Wszystko, co specyficzne dla Ethereum, mieści się natomiast w zakresie błędów serwera."
        ]
      },
      {
        heading: "Kody standardowe i kody Ethereum",
        paragraphs: [
          "JSON-RPC 2.0 rezerwuje `-32700` (parse error), `-32600` (invalid request), `-32601` (method not found), `-32602` (invalid params), `-32603` (internal error) oraz zakres od `-32000` do `-32099` na błędy serwera definiowane przez implementację. Konwencje Ethereum zebrano w [[eip|EIP-1474]], które nadaje znaczenia kodom z tego zakresu. W praktyce `-32000` to kod zbiorczy, którym klienci zgłaszają odrzucenia z mempoolu, takie jak `nonce too low`, `replacement transaction underpriced` i `insufficient funds for gas * price + value`.",
          "Dwa kody spoza standardowego zestawu pojawiają się często. Kod `3` powszechnie oznacza execution reverted, a `-32005` [[rpc-provider|dostawcy RPC]] często zwracają przy [[rate-limits|rate limitach]] (limitach zapytań), razem z HTTP 429. Dostawcy wymyślają też własne kody, więc każdy nierozpoznany ujemny kod z zakresu błędów serwera warto traktować jako problem po stronie serwera, który można ponowić, a nie jako błąd we własnych parametrach."
        ]
      },
      {
        heading: "Reverty to szczególny przypadek",
        paragraphs: [
          "Gdy [[eth-call|eth_call]] albo [[eth-estimate-gas|eth_estimateGas]] wykonuje kod, a [[evm|EVM]] trafia na `REVERT`, węzeł zgłasza to jako błąd, a nie wynik. Większość klientów zwraca kod `3` z komunikatem `execution reverted` i zakodowanym w ABI payloadem revertu w `data`, który dekoduje się do `Error(string)`, `Panic(uint256)` albo własnego błędu kontraktu (custom error); zobacz [[revert|reverty i błędy]]. Niektórzy dostawcy zwracają zamiast tego `-32000` z tym samym komunikatem, czasem bez `data`, więc nie warto zakładać na sztywno jednego formatu.",
          "Revert podczas symulacji to deterministyczna odpowiedź dotycząca stanu, o który pytano, a nie awaria transportu. Ponowienie wywołania na innym węźle niczego więc nie zmieni, chyba że dla tamtego węzła ten sam [[block-tag|identyfikator bloku]] wskazuje inny blok."
        ]
      },
      {
        heading: "Które błędy ponawiać",
        paragraphs: [
          "Wystarczą trzy kategorie. Błędy wywołującego (`-32600`, `-32601`, `-32602` i reverty) zawiodą identycznie przy każdej próbie, więc ich ponawianie tylko zużywa limit zapytań. Błędy przeciążenia (HTTP 429, `-32005`, timeouty, zerwane połączenia) warto ponawiać z backoffem albo wysyłać do innego upstreamu; zobacz [[retries|ponawianie i idempotentność]] oraz [[failover|failover]]. Błędy braku danych na węźle, takie jak `missing trie node`, `header not found` czy `historical state not available`, oznaczają, że ten konkretny węzeł nie umie odpowiedzieć. Odpowie tylko węzeł z większą ilością danych, zwykle [[archive-node|węzeł archiwalny]]."
        ]
      }
    ],
    example: {
      title: "Revert zgłoszony przez eth_call",
      note: "Prefiks `0x08c379a0` w `data` to selektor `Error(string)`; po zdekodowaniu reszty dostaje się ten sam powód, który cytuje już komunikat."
    },
    pitfalls: [
      "Dopasowywanie tekstu `message`, żeby wykryć revert; sformułowania różnią się między klientami i zmieniają między wydaniami, więc logikę trzeba opierać na `code` i `data`.",
      "Ponawianie `eth_call`, które skończyło się revertem, na zapasowym endpoincie; revert to deterministyczny wynik i zapasowy endpoint też go zwróci.",
      "Zakładanie, że `-32000` zawsze znaczy to samo; to zbiorczy zakres, którego znaczenie wynika z komunikatu i metody.",
      "Ignorowanie błędów na poziomie HTTP, bo klient parsuje tylko JSON; odpowiedź 429 czy 413 przychodzi w ogóle bez obiektu błędu JSON-RPC."
    ]
  },
  "execution-apis": {
    title: "Specyfikacja Execution APIs",
    aliases: ["execution-apis", "specyfikacja eth", "specyfikacja api", "eth spec", "hive"],
    summary: "`ethereum/execution-apis` to repozytorium, które normatywnie definiuje interfejs RPC [[execution-layer|warstwy wykonawczej]]: czytelne maszynowo schematy [[openrpc|OpenRPC]] dla metod `eth_` i `net_` oraz części `debug_` i `txpool_`, specyfikację [[engine-api|Engine API]] i wspólne przypadki testowe (fixtures), na których sprawdza się klientów.",
    sections: [
      {
        heading: "Co zawiera repozytorium",
        paragraphs: [
          "Każda metoda ma plik schematu, który opisuje jej parametry, wynik i dokładne typy: QUANTITY, 20-bajtowy [[address|adres]] typu DATA, 32-bajtowy hash, obiekt bloku. Te pliki są kompilowane do jednego dokumentu `openrpc.json`, z którego korzysta renderowana dokumentacja API i większość generatorów kodu. Ponieważ typy są czytelne maszynowo, spór o to, czy pole jest opcjonalne albo czy dla nieznanego [[block|bloku]] zwracane jest `null`, da się rozstrzygnąć w jednym miejscu.",
          "[[engine-api|Engine API]] jest w tym samym repozytorium, głównie jako specyfikacje pisane prozą i podzielone według forków, więc `engine_newPayloadV3` i jego reguły z Cancun są w jednym dokumencie, a wersja dla Prague w innym. Ten podział jest celowy: [[json-rpc|API dla aplikacji]] zmienia się powoli i przez dodawanie nowych elementów, a interfejs między warstwą konsensusu a warstwą wykonawczą dostaje nową wersję metody niemal przy każdej [[hardfork|aktualizacji sieci]]. Czytelne maszynowo schematy [[openrpc|OpenRPC]] dla metod Engine API leżą obok prozy, w `src/engine/openrpc`."
        ]
      },
      {
        heading: "Jak metoda staje się standardem",
        paragraphs: [
          "Droga prowadzi przez pull request, a nie automatycznie przez [[eip|EIP]]. Ktoś proponuje metodę, zespoły klientów się o nią spierają, zwykle implementuje ją co najmniej dwóch [[execution-client|klientów wykonawczych]], a na końcu jej schemat zostaje zmergowany. [[eth-get-block-receipts|eth_getBlockReceipts]] i [[eth-simulate|eth_simulateV1]] trafiły do specyfikacji właśnie tak, po tym jak najpierw istniały jako rozszerzenia klientów. EIP-1474 nadal opisuje starszy zestaw bazowy i kody błędów, ale za aktualne zespoły klientów uznają repozytorium.",
          "Metody, które nie przejdą tej drogi, pozostają specyficzne dla klientów. [[trace-api|Przestrzeni nazw trace_]] w stylu Parity nie ma w specyfikacji i dokumentują ją tylko klienci, którzy ją implementują, i właśnie dlatego jej dostępność i format wyników się różnią. [[debug-api|Przestrzeń nazw debug_]] jest objęta częściowo: specyfikacja od dawna zawiera `debug_getRawHeader`, `debug_getRawBlock`, `debug_getRawTransaction`, `debug_getRawReceipts` i `debug_getBadBlocks`, a od czerwca 2026 także `debug_traceTransaction`, `debug_traceBlockByNumber` i `debug_traceBlockByHash` z ustandaryzowanym tracerem opcodów. `debug_traceCall` i wynik nazwanych tracerów, takich jak `callTracer`, nadal definiują klienci. Inne niedawne dodatki przeszły tę samą drogę przez pull request: `txpool_status`, `txpool_content` i `txpool_contentFrom` w kwietniu 2026, metoda `eth_capabilities`, która [[eth-capabilities|podaje head łańcucha i to, jak daleko wstecz przechowywany jest każdy rodzaj danych]], w czerwcu 2026, oraz katalog [[rpc-errors|grup błędów]], do którego na razie odwołują się tylko metody wysyłania transakcji."
        ]
      },
      {
        heading: "Zgodność i jej granice",
        paragraphs: [
          "Repozytorium zawiera wektory testowe żądań i odpowiedzi, a społecznościowe [[hive|środowisko testowe]] `hive` uruchamia je na prawdziwych buildach klientów, więc porównuje się strukturę odpowiedzi, a nie tylko wartość. To praktyczne wsparcie dla [[client-diversity|różnorodności klientów]]: aplikacja napisana według schematu powinna dostać te same nazwy pól z [[geth|Geth]], [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]] i [[besu|Besu]].",
          "Specyfikacja nie reguluje niczego, co operacyjne. Nie mówi nic o [[authentication|uwierzytelnianiu]], [[rate-limits|rate limitach]] (limitach zapytań), limitach zakresu bloków w [[eth-get-logs|eth_getLogs]], limitach gasu w [[eth-call|eth_call]] ani o tym, ile historii węzeł musi przechowywać. Węzeł może być w pełni zgodny ze specyfikacją i mimo to odmówić obsługi zapytania."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie renderowanej dokumentacji API jako kompletnej; nie ma w niej `trace_`, a wyspecyfikowanych jest tylko kilka metod `debug_`, więc `debug_traceCall` i nazwane tracery, takie jak `callTracer`, działają tak, jak zdecyduje dany klient.",
      "Zakładanie, że metoda obecna w schemacie jest włączona na danym endpoincie; przestrzenie nazw i allowlisty metod to decyzja operatora.",
      "Czytanie jednego dokumentu Engine API dla wszystkich forków; wersje metod są specyfikowane osobno dla każdego forka, a stara strona opisuje starą strukturę payloadu."
    ]
  },
  namespaces: {
    title: "Przestrzenie nazw RPC",
    aliases: ["eth_", "net_", "web3_", "debug_", "trace_", "txpool_", "admin_", "moduły", "http.api", "namespace"],
    summary: "Przestrzeń nazw to prefiks przed podkreślnikiem w nazwie metody, na przykład `eth_` albo `debug_`. Właśnie całymi przestrzeniami nazw operator włącza, wyłącza i wystawia metody na danym listenerze.",
    sections: [
      {
        heading: "Przestrzenie nazw dla aplikacji",
        paragraphs: [
          "`eth_` to interfejs, z którego korzystają aplikacje: [[block|bloki]], transakcje, receipty, [[eth-get-logs|logi]], odczyty [[state|stanu]], symulacja, dane o opłatach i [[eth-send-raw-transaction|eth_sendRawTransaction]]. `net_` i `web3_` są bardzo małe i opisują proces, a nie łańcuch, za pomocą [[net-web3-api|net_peerCount, net_listening i web3_clientVersion]]. [[execution-apis|Specyfikacja Execution APIs]] definiuje `eth_` i `net_` oraz część `debug_` i `txpool_`, ale nie `web3_`, którą klienci udostępniają zwyczajowo. Endpoint, który oferuje tylko te trzy przestrzenie nazw, nadal jest w pełni użyteczny.",
          "W `eth_` został też relikt z czasów, gdy węzeł służył jako portfel. `eth_accounts`, `eth_sign` i [[eth-send-transaction|eth_sendTransaction]] zakładają, że węzeł przechowuje klucze prywatne. Publiczne węzły mają je wyłączone, a portfele w przeglądarce same implementują te same nazwy za [[eip-1193|providerem EIP-1193]]. Dlatego na metodę wywołaną w dappie nie zawsze odpowiada węzeł."
        ]
      },
      {
        heading: "Przestrzenie nazw diagnostyczne i administracyjne",
        paragraphs: [
          "[[debug-api|Przestrzeń nazw debug_]] ma format w stylu [[geth|Getha]] i daje tracing transakcji i bloków oraz surowy dostęp do RLP. [[trace-api|Przestrzeń nazw trace_]] to starszy format Parity, który oferują [[nethermind|Nethermind]], [[erigon|Erigon]] i [[reth|Reth]]. Obie są kosztowne: jedno `debug_traceBlockByNumber` może kosztować więcej niż tysiące zwykłych odczytów. [[txpool-api|Przestrzeń nazw txpool_]] pokazuje [[mempool|transakcje pending i queued]] węzła, a [[admin-api|przestrzeń nazw admin_]] potrafi dodawać peery oraz uruchamiać i zatrzymywać listenery. `personal_` zarządzała lokalnymi kluczami i jest przestarzała; zastępują ją zewnętrzne signery (external signers).",
          "Dwie przestrzenie nazw w ogóle nie należą do tego interfejsu. `engine_` działa tylko na uwierzytelnionym listenerze [[engine-api|Engine API]], a na porcie publicznym klienci ją odrzucają. Obraz tego, na co dany endpoint może odpowiedzieć, uzupełniają [[client-namespaces|prefiksy specyficzne dla klientów]], takie jak `ots_`, które Erigon, a częściowo także Reth, udostępniają dla [[otterscan|Otterscana]], oraz własne prefiksy hostowanych [[rpc-provider|dostawców RPC]]."
        ]
      },
      {
        heading: "Włączanie i wystawianie",
        paragraphs: [
          "Przestrzenie nazw wybiera się przy starcie, osobno dla każdego listenera. Geth używa `--http.api eth,net,web3` i osobnej listy `--ws.api`; Nethermind używa `--JsonRpc.Enabled true --JsonRpc.EnabledModules [Eth,Net,Web3,Trace]`. [[ipc-transport|Socket IPC]] zwykle domyślnie ma pełny zestaw, bo samo połączenie się z nim oznacza już dostęp lokalny. Żeby sprawdzić, co jest włączone, najpewniej jest wywołać jedną nieszkodliwą metodę z danej przestrzeni nazw; zobacz [[endpoint-capabilities|możliwości endpointu]].",
          "Decyzja o wystawieniu to decyzja o bezpieczeństwie. `admin_`, `personal_` i `txpool_` na publicznym listenerze dają każdemu kontrolę nad peerami, operacje na kluczach i wgląd w order flow, którego węzeł jeszcze nie rozgłosił, a `debug_` nawet w trybie tylko do odczytu jest gotowym narzędziem do ataku DoS; zobacz [[security|bezpieczeństwo RPC]]."
        ]
      }
    ],
    example: {
      title: "Jak sprawdzić, które przestrzenie nazw odpowiadają",
      note: "`-32601` oznacza, że przestrzeń nazw nie jest tu włączona, a nie że metoda nie istnieje w kliencie."
    },
    pitfalls: [
      "Zakładanie, że włączone `eth_` oznacza dostęp do całej przestrzeni nazw; `eth_sendTransaction` i `eth_accounts` są wyłączone praktycznie na każdym publicznym endpoincie.",
      "Włączenie `debug_` na publicznym listenerze na czas jednego dochodzenia i zostawienie go włączonym; tracing to łatwy sposób na wyczerpanie CPU węzła.",
      "Dopisanie `engine` do listy przestrzeni nazw HTTP na potrzeby debugowania; Engine API należy wyłącznie do swojego uwierzytelnionego listenera.",
      "Traktowanie `-32601` jako braku funkcji w kliencie, choć zwykle oznacza to, że operator nie włączył danego modułu."
    ]
  },
  "http-transport": {
    title: "Transport HTTP",
    aliases: ["http", "https", "post", "keep-alive", "endpoint rest"],
    summary: "JSON-RPC przez HTTP wysyła każde wywołanie jako POST z body w JSON-ie pod jeden URL i dostaje dokładnie jedno body odpowiedzi. Połączenie jest bezstanowe, a węzeł nie ma jak wysłać czegokolwiek z własnej inicjatywy.",
    sections: [
      {
        heading: "Jak przebiega wywołanie",
        paragraphs: [
          "Klient otwiera połączenie, wysyła POST z body i nagłówkiem `content-type: application/json`, a potem czyta odpowiedź. Ścieżka w URL nie ma znaczenia dla routingu: każda metoda trafia do tego samego endpointu, czasem z kluczem API w ścieżce albo w nagłówku `authorization`; zobacz [[authentication|uwierzytelnianie RPC]]. Serwery zwykle akceptują `accept-encoding: gzip`, co ma znaczenie, bo pełny [[block|blok]] z transakcjami albo duży wynik [[eth-get-logs|eth_getLogs]] kompresuje się wyjątkowo dobrze.",
          "Połączenia są używane wielokrotnie. Keep-alive albo multipleksowanie HTTP/2 u [[rpc-provider|dostawcy RPC]] usuwa z każdego wywołania handshake TCP i TLS, ale nie sam round trip, więc klient, który robi tysiące drobnych odczytów, nadal jest ograniczony opóźnieniem sieci. To argument za [[batch-request|batchem]], który zamienia wiele małych body na jedno duże."
        ]
      },
      {
        heading: "Dwie warstwy błędów",
        paragraphs: [
          "HTTP i JSON-RPC mają własne, niezależne pojęcia błędu, które się nie pokrywają. Metoda, która zawodzi wewnątrz węzła, zwraca `200 OK` z [[rpc-errors|obiektem błędu]] w body. Żądanie, które nigdy nie dotarło do dispatchera węzła, pada na warstwie HTTP i w odpowiedzi nie ma żadnego JSON-a: `413`, gdy body przekracza limit serwera, `429`, gdy zadziała rate limiter, `401` lub `403` przy złym kluczu, `502` i `504` od proxy stojącego przed węzłem. Kod klienta musi obsłużyć oba przypadki.",
          "Transport nakłada też limity, których nie ma w specyfikacji. [[reverse-proxy|Reverse proxy]] ogranicza rozmiar body i ma timeouty odczytu, które przerywają długi [[debug-api|trace przez debug_]] w trakcie wykonania, a przeglądarki dokładają [[cors|CORS]]: strona może wywołać tylko endpoint, którego odpowiedzi mają pozwalające na to nagłówki `access-control-allow-origin`. Geth ustawia je flagą `--http.corsdomain`, a osobną ochronę daje `--http.vhosts`."
        ]
      },
      {
        heading: "Nie ma push, więc trzeba odpytywać",
        paragraphs: [
          "Serwer nie może odezwać się pierwszy, więc wszystko, co ma reagować na zdarzenia, trzeba symulować. Typowy wzorzec to odpytywanie (polling) [[eth-block-number|eth_blockNumber]] co stały czas i pobieranie tego, co się zmieniło, albo założenie po stronie serwera [[eth-filters|filtra do odpytywania]] i wywoływanie `eth_getFilterChanges`. Oba sposoby zużywają żądania i oba dodają opóźnienie sięgające połowy czasu bloku. Prawdziwy push wymaga [[websocket-transport|transportu WebSocket]], dlatego większość wdrożeń produkcyjnych używa obu: HTTP do masowych odczytów i zapisów, WebSocketu do [[eth-subscribe|subskrypcji]].",
          "Bezstanowość to zaleta, która to rekompensuje. Każde żądanie HTTP może trafić do dowolnego węzła, dzięki czemu [[load-balancer|load balancer]] jest trywialny, [[retries|ponowienie]] odczytu jest bezpieczne, a [[caching|cache'owanie]] odpowiedzi po [[block-hash|hashu bloku]] staje się możliwe. Filtry psują tę właściwość, bo istnieją tylko na jednym konkretnym węźle."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie `200 OK` jako sukcesu bez sprawdzenia, czy body nie zawiera pola `error`.",
      "Otwieranie nowego połączenia dla każdego żądania; bez keep-alive handshake TLS może zdominować koszt drobnego odczytu.",
      "Odpytywanie `eth_blockNumber` co 200 ms na endpoincie rozliczanym za żądania i wyczerpanie limitu, zanim zacznie się jakakolwiek prawdziwa praca.",
      "Umieszczenie logiki opartej na filtrach za load balancerem; kolejne `eth_getFilterChanges` trafia do węzła, który nigdy nie słyszał o tym filtrze."
    ]
  },
  "websocket-transport": {
    title: "Transport WebSocket",
    aliases: ["ws", "wss", "websocket", "subskrypcje", "push", "długotrwałe połączenie"],
    summary: "WebSocket przenosi wiele wywołań JSON-RPC, a w odróżnieniu od HTTP także powiadomienia wysyłane z inicjatywy serwera, i robi to jednym długotrwałym, dwukierunkowym połączeniem. To właśnie umożliwia [[eth-subscribe|eth_subscribe]].",
    sections: [
      {
        heading: "Jeden socket, wiele wywołań",
        paragraphs: [
          "Klient otwiera `ws://` lub `wss://` przez handshake HTTP upgrade i od tej chwili każda ramka jest komunikatem JSON-RPC. Żądania i odpowiedzi mają ten sam [[request-response|format komunikatu (envelope)]] co w [[http-transport|HTTP]], ale kilka może być w toku jednocześnie, a węzeł odpowiada w takiej kolejności, w jakiej kończy, więc `id` jest jedynym sposobem, by je sparować. Dlatego klient trzyma mapę z `id` na oczekujące wywołanie i drugą mapę dla identyfikatorów subskrypcji.",
          "Ramki powiadomień to główny powód, by w ogóle sięgać po WebSocket. Przychodzą z `method` ustawionym na `eth_subscription` i bez `id`, a niosą identyfikator `subscription` i `result`. Subskrypcja założona przez [[eth-subscribe|eth_subscribe]] może dostarczać eventy `newHeads`, `logs`, `newPendingTransactions` lub `syncing` na bieżąco, zamiast wymuszać odpytywanie [[eth-block-number|eth_blockNumber]]."
        ]
      },
      {
        heading: "Subskrypcje są przypisane do połączenia",
        paragraphs: [
          "Subskrypcja należy do socketu, który ją utworzył. Gdy socket się zamyka, z jakiegokolwiek powodu, znikają wszystkie jego subskrypcje: węzeł nie zachowuje po nich śladu i nie ma czego wznawiać. Po ponownym połączeniu dostaje się nowe identyfikatory subskrypcji i, co najważniejsze, lukę. Eventy z czasu rozłączenia nigdy nie są odtwarzane, więc poprawny konsument zapisuje ostatni przetworzony blok i od tego miejsca uzupełnia brakujące dane (backfill) przez [[eth-get-logs|eth_getLogs]] lub [[eth-get-block-by-number|eth_getBlockByNumber]], zanim znów zaufa strumieniowi na żywo.",
          "Z tego samego powodu WebSockety źle znoszą naiwny [[load-balancer|load balancing]]. Ponowne połączenie, które trafi na inny węzeł, oznacza inny widok łańcucha, a [[reorg|reorg]] (reorganizacja łańcucha) widziany przez jeden węzeł może być już rozstrzygnięty na innym. Oznacza to też, że [[reverse-proxy|reverse proxy]] trzeba skonfigurować tak, by przepuszczało upgrade i nie zamykało bezczynnych połączeń. Inaczej subskrypcje będą ginąć po stałym czasie, co wygląda jak awaria sieci."
        ]
      },
      {
        heading: "Podtrzymywanie połączenia",
        paragraphs: [
          "Długotrwałe połączenia wymagają opieki. Półotwarty socket wykrywa się ramkami ping i pong na poziomie protokołu, bo sam TCP potrafi przez wiele minut trzymać martwe połączenie jako otwarte. Trzeba się spodziewać, że dostawcy RPC wymuszają idle timeout, maksymalną liczbę równoczesnych połączeń i limit subskrypcji na połączenie; zwłaszcza subskrypcja `newPendingTransactions` jest prawie wszędzie ograniczana albo wyłączona ze względu na wolumen. Ponowne połączenia warto nawiązywać z exponential backoff i jitterem, żeby restart węzła nie sprowadził wszystkich klientów z powrotem w tej samej chwili.",
          "Od strony operacyjnej WebSocket to osobny listener z własną listą przestrzeni nazw, na przykład flagi Getha `--ws --ws.api eth,net,web3` i `--ws.origins`. Włączenie HTTP go nie włącza, a endpoint, którego URL działa z `https://`, często ma inny host dla `wss://`."
        ]
      }
    ],
    example: {
      title: "Subskrypcja newHeads",
      note: "Każdy `parentHash` warto porównać z poprzednim `hash`: niezgodność to znak, że w tym strumieniu nastąpił [[reorg|reorg]]."
    },
    pitfalls: [
      "Ponowne subskrybowanie po odzyskaniu połączenia bez uzupełnienia brakujących danych; każdy event z luki przepada, a węzeł go nie odtworzy.",
      "Poleganie na tym, że TCP sam wykryje martwą drugą stronę; bez ping i pong półotwarty socket może przez wiele minut wyglądać na zdrowy i nic nie dostarczać.",
      "Umieszczenie endpointu WebSocket za load balancerem typu round-robin, przez co każde ponowne połączenie po cichu zmienia widok łańcucha.",
      "Subskrybowanie `newPendingTransactions` na endpoincie rozliczanym za zużycie i zerwanie połączenia przez sam wolumen, a nie przez błąd."
    ]
  },
  "ipc-transport": {
    title: "Transport IPC",
    aliases: ["ipc", "geth.ipc", "unix socket", "socket uniksowy", "named pipe", "geth attach", "socket lokalny"],
    summary: "IPC udostępnia ten sam JSON-RPC przez lokalny socket uniksowy albo, na Windowsie, przez named pipe, na przykład `geth.ipc`. Jest osiągalny tylko z tej samej maszyny i chronią go uprawnienia systemu plików, a nie żadne zabezpieczenia sieciowe.",
    sections: [
      {
        heading: "Czym jest IPC",
        paragraphs: [
          "Klient tworzy w swoim katalogu danych plik socketu i komunikuje się przez niego JSON-em, w którym komunikaty rozdziela znak nowej linii. Nie ma tu ramkowania HTTP, TLS, sprawdzania originu ani nagłówka, w którym dałoby się przesłać klucz API, bo system operacyjny już zdecydował, kto może otworzyć ten plik. [[request-response|Format komunikatu (envelope)]] jest identyczny jak w [[http-transport|HTTP]], a ponieważ połączenie jest dwukierunkowe i długotrwałe, obsługuje też [[eth-subscribe|eth_subscribe]], tak jak [[websocket-transport|WebSocket]].",
          "Ścieżki zależą od klienta i platformy. Geth domyślnie używa `<datadir>/geth.ipc` na Linuksie i macOS oraz named pipe na Windowsie; IPC wyłącza się w nim flagą `--ipcdisable`, a przenosi flagą `--ipcpath`. [[nethermind|Nethermind]] ma odpowiednik w postaci ustawienia ścieżki socketu JSON-RPC IPC. Socket leży w katalogu danych, więc kontener bez bind mountu tego katalogu nie dostanie się do socketu."
        ]
      },
      {
        heading: "Uprawnienia to cały model bezpieczeństwa",
        paragraphs: [
          "Na IPC zwykle włączone są wszystkie przestrzenie nazw, w tym [[admin-api|admin_]], [[debug-api|debug_]], [[txpool-api|txpool_]], a dawniej także `personal_`. To świadomy kompromis: socketu nie da się osiągnąć z sieci, więc klient zakłada, że kto może go otworzyć, ten jest operatorem. W konsekwencji prawo odczytu pliku socketu daje nad węzłem tyle samo, co uprawnienia roota. Pełną administrację węzłem po cichu daje więc każda z tych rzeczy: użytkownik dodany do grupy klienta, katalog danych czytelny dla wszystkich albo bind mount przekazany innemu kontenerowi.",
          "To odwrotność [[http-transport|listenera HTTP]], gdzie rozsądnym ustawieniem domyślnym jest minimalna lista przestrzeni nazw i jawna allowlista (lista dozwolonych); zobacz [[security|bezpieczeństwo RPC]]. Problemu z uprawnieniami nie należy rozwiązywać przez wystawienie socketu IPC na porcie TCP za pomocą proxy, bo zamienia to interfejs wyłącznie lokalny w zdalny, nieuwierzytelniony i w pełni uprzywilejowany."
        ]
      },
      {
        heading: "Kiedy go używać",
        paragraphs: [
          "IPC nadaje się do wszystkiego, co działa obok węzła: interaktywnej konsoli `geth attach`, sidecara do monitoringu, skryptu do backupu albo pruningu czy lokalnego [[indexer|indeksera]], który robi ciężkie skany [[eth-get-logs|eth_getLogs]]. To najszybszy dostępny transport: nie ma handshake'u TLS, parsowania HTTP ani proxy po drodze, co ma znaczenie, gdy zadanie wykonuje miliony drobnych wywołań. Niektóre [[cli-tools|narzędzia CLI]] i [[client-libraries|biblioteki klienckie]] przyjmują ścieżkę do socketu tam, gdzie normalnie wzięłyby URL.",
          "Do wszystkiego innego to zły wybór. IPC nie da się postawić za load balancerem, przeglądarka nie ma do niego dostępu, a po przeniesieniu węzła na inny host przestaje działać. Aplikacje powinny korzystać z listenera HTTP lub WebSocket, gdzie można zastosować przestrzenie nazw, [[rate-limits|rate limity]] (limity zapytań) i [[authentication|uwierzytelnianie]]."
        ]
      }
    ],
    pitfalls: [
      "Poluzowanie uprawnień katalogu danych, żeby drugi proces mógł czytać socket; to daje pełną administrację węzłem, a nie dostęp tylko do odczytu.",
      "Przekierowanie socketu IPC na port TCP narzędziem do przekazywania ruchu, co wystawia do sieci każdą uprzywilejowaną przestrzeń nazw bez uwierzytelniania.",
      "Oczekiwanie, że narzędzie w kontenerze znajdzie `geth.ipc`, choć katalogu danych węzła nigdy do tego kontenera nie podpięto przez bind mount.",
      "Zakładanie, że przez IPC można tylko czytać, bo działa lokalnie; `admin_` i `personal_` są na nim zwykle domyślnie włączone."
    ]
  },
  "hex-encoding": {
    title: "Kodowanie hex",
    aliases: ["QUANTITY", "DATA", "0x", "ciąg hex", "zapis szesnastkowy", "hex", "bigint", "reguły kodowania"],
    summary: "JSON-RPC warstwy wykonawczej używa dwóch kodowań hex: QUANTITY dla liczb całkowitych, z prefiksem `0x`, bez zer wiodących i z zerem zapisanym jako `0x0`, oraz DATA dla ciągów bajtów, z prefiksem `0x`, parzystą liczbą cyfr i zachowanymi zerami wiodącymi.",
    sections: [
      {
        heading: "Dwa kodowania",
        paragraphs: [
          "QUANTITY koduje liczbę. To `0x`, a po nim najkrótszy zapis hex, więc 1000 to `0x3e8`, nigdy `0x03e8`, a zero to `0x0`, nigdy `0x` ani `0x00`. Wielu klientów sprawdza to na wejściu i od razu odrzuca numer bloku dopełniony zerami. DATA koduje bajty. To `0x`, a po nim dwie cyfry hex na każdy bajt, więc 20-bajtowy [[address|adres]] ma zawsze 42 znaki, 32-bajtowy [[block-hash|hash]] zawsze 66, a pusty ciąg bajtów to dokładnie `0x`.",
          "Różnica ma największe znaczenie tam, gdzie tę samą wartość można odczytać na dwa sposoby. Slot storage zwrócony przez [[eth-get-storage-at|eth_getStorageAt]] to DATA i wraca jako pełne 32 bajty, `0x0000…0001`, a saldo z [[eth-get-balance|eth_getBalance]] to QUANTITY i wraca jako `0x1`. Obie wartości oznaczają jedynkę, ale tylko jedną z nich można bezpiecznie porównywać jako ciąg znaków."
        ]
      },
      {
        heading: "Gdzie które występuje",
        paragraphs: [
          "Liczby, które coś liczą, to QUANTITY: numery bloków, wartości [[nonce|nonce]], limity i ilości [[gas|gasu]], kwoty w [[wei|wei]], `chainId`, `status` [[transaction-receipt|receiptu]] i `logIndex`. Wszystko, co ma stałą liczbę bajtów albo dowolną długość, to DATA: adresy, hashe, `logsBloom`, kod kontraktu, pole `input` transakcji, topics [[event-log|logów]] i surowe bajty RLP przekazywane do [[eth-send-raw-transaction|eth_sendRawTransaction]]. [[block-tag|Parametr bloku]] to trzecia kategoria: QUANTITY, tag w postaci ciągu znaków albo obiekt EIP-1898.",
          "Zwykłe typy JSON też się pojawiają. Wartości logiczne, takie jak `fullTransactions`, to prawdziwe booleany, `null` to prawdziwy `null`, a flaga `removed` w logu jest booleanem, więc dekoder nie może po prostu traktować każdej wartości jak ciągu hex."
        ]
      },
      {
        heading: "Dekodowanie bez utraty danych",
        paragraphs: [
          "Klasyczny błąd to utrata precyzji. Saldo w wei regularnie przekracza 2 do potęgi 53, więc `parseInt` albo `Number()` w JavaScript po cichu je zaokrągla. Trzeba użyć `BigInt`, a na ciąg dziesiętny zamieniać wartość tylko do wyświetlenia. To samo dotyczy każdego języka, w którym domyślna liczba całkowita jest 64-bitowa, bo wartości `uint256` z wyników [[eth-call|eth_call]] się w niej nie mieszczą. Timestampy, wartości gasu i numery bloków są dziś wystarczająco małe, ale total supply czy saldo tokena już nie.",
          "Druga klasa błędów dotyczy porównań. Adresy z jednych źródeł wracają z checksumą EIP-55, czyli mieszaną wielkością liter, a z innych w całości małymi literami, więc trzeba je porównywać bez rozróżniania wielkości liter. Wartości QUANTITY nigdy nie należy porównywać jako ciągów znaków, bo `0x1` i `0x01` oznaczają tę samą liczbę, a poprawny jest tylko pierwszy zapis. Budując żądanie, trzeba samodzielnie kodować numery bloków i wartości według reguł QUANTITY, zamiast przekazywać to, co wyprodukował formatter hex danego języka."
        ]
      }
    ],
    example: {
      title: "Ta sama liczba w obu kodowaniach",
      note: "`status` i `storageValue` kodują jedynkę, ale `status` to QUANTITY, a `storageValue` to słowo DATA o stałej długości."
    },
    pitfalls: [
      "Parsowanie wartości w wei przez `Number()` lub `parseInt`; wszystko powyżej 2 do potęgi 53 traci precyzję i nie pojawia się przy tym żaden błąd.",
      "Wysyłanie numeru bloku dopełnionego zerami, na przykład `0x01`; QUANTITY zabrania zer wiodących, a klienci odrzucają taką wartość błędem invalid params.",
      "Porównywanie adresów jako ciągów znaków, bajt po bajcie, gdy jedna strona ma checksumę EIP-55, a druga jest zapisana małymi literami.",
      "Oczekiwanie, że `eth_getStorageAt` zwróci przyciętą wartość; zwraca pełne 32-bajtowe słowo, więc `0x0` i `0x00…00` nie są tu wymienne."
    ]
  },
  "block-tag": {
    title: "Identyfikatory i tagi bloków",
    aliases: [
      "latest",
      "safe",
      "finalized",
      "pending",
      "earliest",
      "tag bloku",
      "parametr bloku",
      "block parameter",
      "EIP-1898",
      "domyślny blok",
      "default block"
    ],
    summary: "Identyfikator bloku to parametr, który mówi metodzie odczytu, z [[state|stanu]] lub historii którego [[block|bloku]] ma odpowiedzieć: numer bloku, obiekt z [[block-hash|hashem bloku]] albo jeden z tagów `earliest`, `finalized`, `safe`, `latest` i `pending`.",
    sections: [
      {
        heading: "Co wybiera ten parametr",
        paragraphs: [
          "Prawie każda metoda odczytu w [[json-rpc|JSON-RPC warstwy wykonawczej]] kończy się parametrem bloku: przyjmują go [[eth-get-balance|eth_getBalance]], [[eth-call|eth_call]], [[eth-get-storage-at|eth_getStorageAt]], [[eth-get-transaction-count|eth_getTransactionCount]] i [[eth-get-proof|eth_getProof]]. Węzeł zamienia parametr na jeden konkretny blok i odpowiada ze [[state|stanu globalnego]] z chwili tuż po wykonaniu tego bloku. Dwa wywołania z tym samym numerem bloku, wysłane do tego samego zsynchronizowanego węzła, dostaną tę samą odpowiedź; dwa wywołania z `latest` wysłane w odstępie sekundy już niekoniecznie.",
          "Parametr może mieć trzy postacie. [[hex-encoding|Wartość QUANTITY w hex]], na przykład `0x12d4f1c`, wskazuje blok po wysokości. Tag, czyli nazwa w postaci tekstu, wskazuje blok po jego roli w łańcuchu. Obiekt zdefiniowany w [[eip|EIP-1898]], na przykład `{ \"blockHash\": \"0x…\" }` albo `{ \"blockNumber\": \"0x…\" }`, wskazuje blok precyzyjnie; dodanie `\"requireCanonical\": true` sprawia, że jeśli ten hash nie jest już w łańcuchu kanonicznym, węzeł zwraca błąd, zamiast odpowiadać z bocznej gałęzi."
        ]
      },
      {
        heading: "Pięć tagów",
        paragraphs: [
          "`latest` to head łańcucha w takiej postaci, w jakiej ten węzeł widzi go w tej chwili: blok ostatnio wybrany przez [[fork-choice|fork choice]]. Podczas [[reorg|reorgu]] (reorganizacji łańcucha) może się cofnąć, a na dwóch węzłach, których widok łańcucha dzieli kilka milisekund, może być inny. `pending` to hipotetyczny następny blok złożony z transakcji z [[mempool|mempoolu]] węzła; to lokalne przypuszczenie, a nie dane z łańcucha. Niektórzy klienci i providerzy po cichu traktują go jak `latest`.",
          "`safe` i `finalized` pojawiły się wraz z [[the-merge|Merge]]. `finalized` to najnowszy blok utrwalony przez [[finality|finalność Casper FFG]]; w normalnych warunkach jest dwie do trzech epok za headem, czyli około 13 do 19 minut, a cofnięcie go wymagałoby slashingu co najmniej jednej trzeciej całego stakowanego ETH. `safe` to blok, którego reorg [[consensus-client|klient konsensusu]] uważa za skrajnie mało prawdopodobny. Specyfikacje konsensusu definiują go teraz przez [[fast-confirmation-rule|Fast Confirmation Rule]], która w normalnych warunkach sieciowych potwierdza bloki znacznie bliżej heada. Klient, który tej reguły nie stosuje, przekazuje jednak blok z ostatniego checkpointu justified, który zwykle jest jedną do dwóch epok za headem, czyli około 6 do 13 minut. `earliest` to [[genesis|blok genesis]] i przydaje się głównie jako początek zakresu.",
          "O tym, co znaczą `safe` i `finalized`, decyduje [[consensus-layer|warstwa konsensusu]]. Przy każdym wywołaniu `engine_forkchoiceUpdated` przez [[engine-api|Engine API]] przekazuje te dwa hashe razem z hashem heada do [[execution-client|klienta wykonawczego]]. Klient wykonawczy, który stracił swojego klienta konsensusu, dalej odpowiada na `latest` z ostatniego znanego heada, ale jego widok `finalized` po cichu przestaje się przesuwać."
        ]
      },
      {
        heading: "Jak wybrać tag",
        paragraphs: [
          "`latest` sprawdza się przy odczytach dla użytkownika, gdzie świeżość liczy się bardziej niż stabilność, na przykład przy wyświetlaniu salda. `finalized` jest właściwy, gdy błędna odpowiedź kosztuje pieniądze albo nie da się jej cofnąć: przy księgowaniu wpłaty, rozliczaniu umowy off-chain czy ustawianiu checkpointu [[indexer|indeksera]]. Jawny numer albo hash bloku jest potrzebny, gdy kilka wywołań musi być ze sobą spójnych, na przykład przy odczycie salda tokena i jego całkowitej podaży z tego samego snapshotu, albo gdy żądania rozchodzą się na kilka węzłów za [[load-balancer|load balancerem]], które mogą widzieć różne heady.",
          "[[pruned-node|Pruned node]] odpowiada tylko dla niedawnych bloków. Zapytanie o stan na starym bloku zwraca [[rpc-errors|błąd]] „missing trie node” albo „historical state not available”, choć sam blok jest węzłowi znany. Stan historyczny wymaga [[archive-node|węzła archiwalnego]]."
        ]
      }
    ],
    example: {
      title: "To samo saldo odczytane na trzy sposoby",
      note: "Pierwsza odpowiedź może się zmienić już w następnym bloku, druga tylko przy naruszeniu finalności, a trzecie wywołanie zwróci jednoznaczny błąd, jeśli wskazany blok wypadnie w reorgu."
    },
    pitfalls: [
      "Odczytywanie dwóch wartości osobnymi wywołaniami z `latest` i traktowanie ich jak jednego snapshotu; do każdego z nich trzeba przekazać ten sam jawny numer bloku.",
      "Zakładanie, że `pending` odzwierciedla transakcje pending całej sieci; odzwierciedla mempool jednego węzła, a provider może go wyłączyć albo podmienić na `latest`.",
      "Oczekiwanie, że nieaktualna wartość `finalized` objawi się błędem; węzeł, którego klient konsensusu nie działa, bez żadnego sygnału dalej zwraca swój ostatni sfinalizowany blok."
    ]
  },
  "chain-id": {
    title: "Chain ID",
    aliases: [
      "eth_chainId",
      "net_version",
      "EIP-155",
      "chain id",
      "network id",
      "identyfikator sieci",
      "identyfikator łańcucha",
      "replay protection",
      "ochrona przed replay"
    ],
    summary: "Chain ID to liczba całkowita, która zgodnie z EIP-155 identyfikuje jedną sieć Ethereum w każdym podpisie transakcji. Zwraca ją `eth_chainId` i to pierwsza rzecz, którą sprawdza wywołujący, żeby się upewnić, że endpoint naprawdę obsługuje właściwą sieć.",
    sections: [
      {
        heading: "Ochrona przed replay",
        paragraphs: [
          "Przed [[eip|EIP-155]] podpisana [[transaction|transakcja]] była ważna w każdym łańcuchu o tym samym modelu kont, więc płatność z jednej sieci dało się powtórzyć (replay) w innej. EIP-155 włączyło chain ID do podpisywanych danych. W transakcji legacy jest on zaszyty w `v`, które przyjmuje wartość `chainId * 2 + 35` albo `+ 36`; w każdej [[transaction-types|transakcji typowanej]] to osobne pole `chainId`. Transakcja podpisana dla łańcucha 1 jest po prostu nieważna w łańcuchu 11155111, bo odzyskanie nadawcy z [[ecdsa-signature|podpisu]] daje inny [[address|adres]] albo od razu się nie udaje.",
          "Chain ID jest więc daną wejściową podpisu, a nie szczegółem transportu. Portfel, który podpisuje ze złą wartością, tworzy bajty, które docelowa sieć odrzuca już przy przyjmowaniu do mempoolu, a porażka objawia się [[rpc-errors|błędem]] `invalid sender` albo `invalid chain id` z [[eth-send-raw-transaction|eth_sendRawTransaction]], a nie czymkolwiek widocznym w łańcuchu."
        ]
      },
      {
        heading: "eth_chainId a net_version",
        paragraphs: [
          "Dwie metody odpowiadają na podobne pytania. `eth_chainId` zwraca chain ID z EIP-155 jako [[hex-encoding|QUANTITY w hex]], więc dla mainnetu to `0x1`. `net_version` to starszy network ID i zwraca string dziesiętny, więc dla mainnetu to `\"1\"`; zobacz [[net-web3-api|metody net_ i web3_]]. Te wartości zwykle są równe, ale to różne pojęcia, a niektóre sieci celowo ustawiły je na różne wartości, dlatego do podpisu trzeba używać chain ID, a `net_version` tylko do diagnostyki.",
          "Warto zapamiętać popularne wartości: mainnet to 1, Sepolia 11155111, Hoodi 560048, a wycofany Holesky miał 17000; zobacz [[testnets|testnety]]. Sieci warstwy 2 mają własne, a społecznościowe rejestry, takie jak [[chainlist|chainlist]], przypisują identyfikatorom publiczne endpointy i symbole walut. Ponieważ każdy może wybrać dowolny ID dla prywatnej sieci, zgodny chain ID świadczy o intencji, a nie o autentyczności."
        ]
      },
      {
        heading: "Sprawdzanie na produkcji",
        paragraphs: [
          "Przy nawiązaniu połączenia trzeba raz wywołać `eth_chainId`, porównać wynik z tym, czego oczekuje aplikacja, i przy różnicy odmówić podpisania czy wysłania czegokolwiek. To tanie, nie da się tego cache'ować między sieciami, a wyłapuje najgroźniejszą klasę błędów konfiguracji: staging podpięty do mainnetu albo [[failover|failover]], który przełączył ruch na upstream obsługujący inny łańcuch. Z tego samego powodu powinien to obejmować [[health-check|health check endpointu]], a [[load-balancer|load balancer]] nigdy nie może mieszać łańcuchów w jednej puli.",
          "W przeglądarce chain ID jest też ustawieniem, które kontroluje użytkownik. [[eip-1193|Provider EIP-1193]] emituje event `chainChanged`, gdy użytkownik przełącza sieć, a dapp prosi o przełączenie przez [[wallet-rpc|wallet_switchEthereumChain]], przekazując ID jako string z prefiksem `0x`. `chainChanged` należy traktować jako sygnał do ponownego odczytania wszystkiego, bo adresy kontraktów, listy tokenów i dane [[block|bloków]] w cache zależą od sieci."
        ]
      }
    ],
    example: {
      title: "Sprawdzenie endpointu, zanim mu się zaufa",
      note: "`0xaa36a7` to Sepolia, a nie mainnet; aplikacja, która oczekuje `0x1`, powinna się tu zatrzymać i niczego nie podpisywać."
    },
    pitfalls: [
      "Podpisywanie z `net_version` zamiast `eth_chainId`; to różne pojęcia, które w niektórych sieciach mają różne wartości.",
      "Porównywanie chain ID jako stringa; `0x1` i `0x01` to ta sama liczba, ale nie ten sam tekst, więc przed porównaniem trzeba wartość sparsować.",
      "Failover na upstream bez ponownego sprawdzenia chain ID, przez co ruch z mainnetu może trafić do węzła testnetu.",
      "Ignorowanie w dappie eventu `chainChanged` i dalsze używanie adresów oraz danych z cache z poprzedniej sieci."
    ]
  },
  "execution-layer": {
    title: "Warstwa wykonawcza",
    aliases: ["EL", "wykonanie", "eth1", "warstwa evm", "execution layer"],
    summary: "Warstwa wykonawcza to ta połowa węzła Ethereum, która uruchamia [[evm|EVM]], przechowuje [[state|stan globalny]], utrzymuje [[mempool|mempool (pulę transakcji)]] i obsługuje [[json-rpc|JSON-RPC]] `eth_`, a wszystkie decyzje o kolejności dostaje od [[consensus-layer|warstwy konsensusu]].",
    sections: [
      {
        heading: "Za co odpowiada",
        paragraphs: [
          "Warstwa wykonawcza dostaje uporządkowaną listę transakcji, wykonuje je i wylicza nowy stan. Nalicza [[gas|gas]], egzekwuje base fee z [[eip-1559|EIP-1559]], uruchamia kod kontraktów, emituje [[event-log|logi]], zapisuje [[transaction-receipt|receipty]] (wyniki wykonania transakcji) i oblicza [[state-root|state root]], receipts root i inne commitmenty w nagłówku, dzięki którym każdy inny węzeł może sprawdzić wynik. Przed wykonaniem waliduje też transakcje: [[ecdsa-signature|podpis]], [[nonce|nonce]], saldo i intrinsic gas.",
          "Wokół tego działają usługi, z którymi aplikacje faktycznie mają do czynienia. Mempool przechowuje podpisane transakcje przesłane przez [[eth-send-raw-transaction|eth_sendRawTransaction]] lub otrzymane od peerów i rozgłasza je przez [[devp2p|devp2p]]. Serwer [[json-rpc|JSON-RPC]] udostępnia odczyty, [[eth-call|symulację]] i [[eth-subscribe|subskrypcje]]. Całość implementuje [[execution-client|klient wykonawczy]], taki jak [[geth|Geth]], [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]] czy [[besu|Besu]]."
        ]
      },
      {
        heading: "O czym nie decyduje",
        paragraphs: [
          "Od czasu [[the-merge|Merge]] warstwa wykonawcza nie ma własnego zdania co do tego, który łańcuch jest prawdziwy. Nie może sama wybrać head łańcucha, niczego nie finalizuje i nic nie wie o walidatorach, slotach ani atestacjach. Wszystko to przychodzi jako polecenia przez [[engine-api|Engine API]]: [[consensus-client|klient konsensusu]] przesyła payload do walidacji, a potem wskazuje bloki head, safe i finalized. Pozostawiony sam sobie klient wykonawczy stoi w miejscu, bez względu na to, ilu ma peerów.",
          "Pola, które kiedyś opisywały kopanie, dziś są szczątkowe. `difficulty` wynosi `0`, `nonce` w nagłówku jest zerem, lista ommers jest zawsze pusta, a `mixHash` przenosi wartość `prevRandao` z warstwy konsensusu. Odczytywanie `difficulty`, żeby wykryć proof of work, albo oczekiwanie nagród za bloki uncle prowadzi do kodu, który po cichu działa źle na każdym współczesnym bloku."
        ]
      },
      {
        heading: "Dlaczego to ważne przy korzystaniu z RPC",
        paragraphs: [
          "Prawie wszystko, o co pyta aplikacja, to dane warstwy wykonawczej, więc praktyczna granica jest prosta: salda, kod, storage, receipty, logi, gas i symulacja pochodzą stąd, a salda walidatorów, atestacje i checkpointy [[finality|finalności]] z [[beacon-api|Beacon API]] po drugiej stronie. Wyjątkiem są [[block-tag|tagi safe i finalized]]: to fakty konsensusu, które warstwa wykonawcza tylko powtarza.",
          "To wyjaśnia też całą klasę objawów operacyjnych. Klient wykonawczy, którego klient konsensusu jest zatrzymany, nadal odpowiada na odczyty, ale jego head stoi w miejscu. Klient, który [[sync-modes|wciąż się synchronizuje]], odpowiada na część metod, a inne odrzuca. Klient z [[pruned-node|pruningiem]] odpowiada na pytania o niedawny stan, ale dla starych bloków zwraca `missing trie node`. Z perspektywy aplikacji wszystkie trzy przypadki wyglądają jak zepsuty endpoint, a żaden z nich nie jest błędem RPC."
        ]
      }
    ],
    pitfalls: [
      "Odczytywanie `difficulty` albo listy ommers, żeby wyciągać wnioski o konsensusie; od czasu Merge jedno i drugie to stałe wartości.",
      "Oczekiwanie, że sam klient wykonawczy będzie podążał za łańcuchem; bez klienta konsensusu, który steruje nim przez Engine API, nigdy nie ruszy do przodu.",
      "Pytanie warstwy wykonawczej o dane walidatorów, epok lub atestacji; te dane są w API warstwy konsensusu.",
      "Zakładanie, że `mixHash` to wciąż pozostałość po kopaniu; dziś przenosi `prevRandao`, czyli losowość warstwy konsensusu dla danego bloku."
    ]
  },
  "consensus-layer": {
    title: "Warstwa konsensusu",
    aliases: ["CL", "beacon chain", "eth2", "konsensus", "consensus layer"],
    summary: "Warstwa konsensusu to ta połowa węzła, która realizuje [[proof-of-stake|proof of stake]] (sloty, atestacje, fork choice i finalność), decyduje, który blok wykonawczy jest blokiem head, i zamiast JSON-RPC udostępnia REST-owe [[beacon-api|Beacon API]].",
    sections: [
      {
        heading: "Co robi",
        paragraphs: [
          "Warstwa konsensusu utrzymuje Beacon Chain: osobny łańcuch [[beacon-block|bloków beacon]], po jednym na każdy 12-sekundowy slot, a 32 sloty tworzą epokę. Ten łańcuch zapisuje, kim są [[validator|walidatorzy]], na co głosowali i które checkpointy mają status justified, a które finalized; zobacz [[slot-epoch|sloty i epoki]]. Każdy blok beacon zawiera [[execution-payload|execution payload]], czyli blok wykonawczy, więc oba łańcuchy posuwają się razem.",
          "Zadaniem warstwy konsensusu jest ustalenie kolejności i osiągnięcie zgody, a nie obliczenia. [[attestation|Atestacje]] walidatorów zasilają [[fork-choice|regułę fork choice LMD-GHOST]], która wybiera head łańcucha, a Casper FFG zamienia zebrane głosy w checkpointy justified i finalized, zwykle o dwie epoki starsze niż head; zobacz [[finality|finalność]]. Ta warstwa prowadzi też [[sync-committee|sync committees]], żeby [[light-client|lekcy klienci]] mogli śledzić łańcuch, i rozgłasza dane [[blob|blobów]], od Fulu w postaci data column sidecars, które przechowuje przez 4096 epok, czyli mniej więcej 18 dni."
        ]
      },
      {
        heading: "Inny interfejs",
        paragraphs: [
          "[[consensus-client|Klienci konsensusu]] nie rozmawiają z aplikacjami przez JSON-RPC. Udostępniają [[beacon-api|Beacon API]], interfejs REST ze ścieżkami takimi jak `/eth/v1/node/syncing` i `/eth/v1/beacon/headers`, na porcie zależnym od klienta, na przykład 5052 w Lighthouse. Między sobą komunikują się przez gossip libp2p na porcie 9000, a nie przez [[devp2p|devp2p]]; zobacz [[libp2p-gossip|sieć warstwy konsensusu]]. [[validator-client|Klient walidatora]], który trzyma klucze, to osobny proces, a [[beacon-node|beacon node]] obsługuje go przez to samo API.",
          "Implementacje to bazy kodu zupełnie niezależne od [[execution-client|klientów wykonawczych]]: [[lighthouse|Lighthouse]] (Rust), [[prysm|Prysm]] (Go), [[teku|Teku]] (Java), [[nimbus|Nimbus]] (Nim), [[lodestar|Lodestar]] (TypeScript) i [[grandine|Grandine]] (Rust). Węzeł powstaje, gdy uruchomi się po jednym kliencie każdego rodzaju, a wybór mniej popularnej pary to konkretny wkład operatora w [[client-diversity|różnorodność klientów]]."
        ]
      },
      {
        heading: "Jak steruje wykonaniem",
        paragraphs: [
          "Każda interakcja z [[execution-layer|warstwą wykonawczą]] idzie przez [[engine-api|Engine API]]. Przy nowym bloku klient konsensusu wywołuje `engine_newPayload`, żeby payload został zwalidowany i zaimportowany, a potem `engine_forkchoiceUpdated`, żeby wskazać hashe bloków head, safe i finalized. Gdy jego walidator ma zaproponować blok, to samo wywołanie `forkchoiceUpdated` niesie payload attributes, czyli prośbę do klienta wykonawczego o rozpoczęcie budowy bloku, który potem odbierze `engine_getPayload`.",
          "Dlatego `safe` i `finalized` w [[block-tag|tagach bloków]] to fakty konsensusu, które API warstwy wykonawczej tylko pożycza, i dlatego endpoint wykonawczy, którego klient konsensusu nie działa, nadal obsługuje odczyty, choć jego head stoi w miejscu. Z tego samego powodu istnieje [[checkpoint-sync|checkpoint sync]]: klient konsensusu może wystartować z niedawnego sfinalizowanego stanu pobranego z zaufanego Beacon API, zamiast odtwarzać lata historii."
        ]
      }
    ],
    pitfalls: [
      "Szukanie danych walidatorów lub epok w JSON-RPC warstwy wykonawczej; są dostępne tylko w Beacon API.",
      "Zakładanie, że numery bloków i sloty idą w parze; pominięty slot nie daje bloku wykonawczego, więc oba liczniki trwale się rozjeżdżają.",
      "Uruchamianie klienta konsensusu bez odpowiadającego mu klienta wykonawczego i oczekiwanie, że któraś z połówek przyda się sama.",
      "Zapominanie, że to warstwa konsensusu, a nie wykonawcza, przesuwa `safe` i `finalized` w odpowiedziach RPC."
    ]
  },
  "engine-api": {
    title: "Engine API",
    aliases: ["engine_", "authrpc", "8551", "jwt", "jwt.hex", "forkchoiceUpdated", "newPayload", "getPayload"],
    summary: "Engine API to uwierzytelniony interfejs JSON-RPC, domyślnie na porcie 8551, przez który [[consensus-client|klient konsensusu]] przekazuje [[execution-payload|execution payloady]] swojemu [[execution-client|klientowi wykonawczemu]] i mówi mu, które bloki są head, safe i finalized.",
    sections: [
      {
        heading: "Protokół opiera się na trzech metodach",
        paragraphs: [
          "`engine_newPayloadVx` przekazuje payload do walidacji i importu: klient wykonawczy ponownie wykonuje jego transakcje, sprawdza [[state-root|state root]] i pozostałe commitmenty w nagłówku, po czym odpowiada statusem. `engine_forkchoiceUpdatedVx` przekazuje potem widok łańcucha z perspektywy węzła przez `headBlockHash`, `safeBlockHash` i `finalizedBlockHash`, i dokładnie stąd biorą się [[block-tag|tagi safe i finalized]]. `engine_getPayloadVx` pobiera blok, który klient wykonawczy budował.",
          "Produkcja bloku używa dwóch z tych metod razem. Gdy [[validator|walidator]] tego węzła ma zaproponować blok, klient konsensusu wywołuje `engine_forkchoiceUpdated` z obiektem `payloadAttributes`, który zawiera timestamp, `prevRandao`, odbiorcę opłat (fee recipient) i wypłaty (withdrawals) do uwzględnienia. Klient wykonawczy zaczyna składać blok z [[mempool|mempoola]], zwraca `payloadId` i ulepsza blok, dopóki `engine_getPayload` go nie odbierze. [[engine-payload|Pełna lista metod]] dodaje negocjowanie możliwości przez `engine_exchangeCapabilities` i masowe pobieranie body bloków na potrzeby synchronizacji."
        ]
      },
      {
        heading: "Status payloadu",
        paragraphs: [
          "Zarówno `newPayload`, jak i `forkchoiceUpdated` odpowiadają polem statusu, a jego wartości to słownik całego interfejsu. `VALID` oznacza: wykonany i przyjęty. `INVALID` oznacza, że payload łamie reguły; odpowiedź zawiera wtedy `latestValidHash`, żeby klient konsensusu wiedział, jak daleko się cofnąć, oraz tekst `validationError`. `SYNCING` oznacza, że klient wykonawczy nie może jeszcze ocenić payloadu, bo brakuje mu przodków tego payloadu, których pobieranie już rozpoczął. `ACCEPTED` oznacza, że payload wygląda na poprawnie zbudowany, ale leży na bocznej gałęzi, która nie jest wykonywana. Starsze wersje specyfikacji definiowały też `INVALID_BLOCK_HASH` dla payloadu, którego obliczony hash się nie zgadza.",
          "Odpowiedź `INVALID` to poważna sprawa: to twierdzenie jednego klienta, że blok, który sieć mogła przyjąć, jest błędny. Błąd w kodzie, który daje fałszywe `INVALID`, wyrzuca węzeł z łańcucha kanonicznego, a właśnie taki rodzaj awarii ma ograniczać [[client-diversity|różnorodność klientów]]."
        ]
      },
      {
        heading: "Uwierzytelnianie i wersjonowanie",
        paragraphs: [
          "Interfejs jest uwierzytelniony, bo steruje węzłem. Oba procesy czytają ten sam 32-bajtowy sekret z pliku hex, zwykle nazwanego `jwt.hex`. Każde żądanie niesie w nagłówku `authorization: Bearer` token JWT (JSON Web Token) podpisany HS256, a jego claim `iat` musi się mieścić w około 60 sekundach od zegara serwera. Geth wskazuje plik przez `--authrpc.jwtsecret`, a [[lighthouse|Lighthouse]] przez `--execution-jwt`. Rozjazd zegarów (clock skew) między dwoma hostami to najczęstsza przyczyna sytuacji, w której Engine API odrzuca każde wywołanie; zobacz [[authentication|uwierzytelnianie RPC]].",
          "Metody dostają nową wersję przy każdej [[hardfork|aktualizacji sieci]], zamiast być rozszerzane w miejscu, bo każdy fork zmienia kształt payloadu: `engine_newPayloadV3` przyjmuje w Cancun versioned hashes blobów i root nadrzędnego [[beacon-block|bloku beacon]], a `V4` dodaje w Prague execution requests. Para klientów, która nie zgadza się co do wersji, po prostu przestaje działać przy forku, dlatego aktualizacja obu połówek przed aktualizacją sieci nie jest opcjonalna."
        ]
      },
      {
        heading: "Dlaczego wywołujący nigdy go nie widzą",
        paragraphs: [
          "Engine API nie jest API do danych i nie oferuje niczego, czego potrzebowałaby aplikacja; nie udostępnia sald, logów ani historii. Jest też kanałem sterowania, więc wystawiony port 8551 pozwala każdemu powiedzieć węzłowi, za którym łańcuchem ma podążać. Port powinien nasłuchiwać tylko na localhost, plik JWT ma być czytelny wyłącznie dla procesów obu klientów, a `engine` nigdy nie powinno trafić na publiczną [[namespaces|listę przestrzeni nazw]]. Monitoring należy do zwykłego listenera, gdzie są [[eth-syncing|eth_syncing]] i [[health-check|health checki]]."
        ]
      }
    ],
    example: {
      title: "Wskazanie bloków head, safe i finalized",
      note: "Drugi element to `null`, bo ten węzeł nie proponuje bloku; proposer wstawiłby tam `payloadAttributes` i dostał w odpowiedzi `payloadId`."
    },
    pitfalls: [
      "Wystawianie portu 8551 poza localhost; Engine API decyduje, za którym łańcuchem podąża węzeł, i nie ma żadnego rate limitu godnego tej nazwy.",
      "Dopuszczenie, by zegary dwóch hostów rozjechały się o więcej niż około 60 sekund, przez co każdy JWT oblewa sprawdzenie `iat`, a wygląda to jak błąd uwierzytelniania.",
      "Aktualizacja tylko jednego klienta przed forkiem; para nie zgadza się wtedy co do wersji `engine_newPayload` i węzeł staje.",
      "Odczytywanie statusu `SYNCING` jako błędu; oznacza on, że klient wykonawczy pobiera przodków i nie może jeszcze ocenić payloadu."
    ]
  },
  "beacon-api": {
    title: "Beacon API",
    aliases: ["beacon node api", "api beacon node", "5052", "3500", "REST", "eth/v1/beacon", "consensus api", "api warstwy konsensusu"],
    summary: "Beacon API to interfejs REST klienta konsensusu, na porcie zależnym od klienta (5052 w Lighthouse i Nimbus), który udostępnia bloki i stany beacon, dane walidatorów, status węzła, konfigurację łańcucha i strumień server-sent events, w formacie JSON albo SSZ.",
    sections: [
      {
        heading: "REST, nie JSON-RPC",
        paragraphs: [
          "Ten interfejs w niczym nie przypomina [[json-rpc|JSON-RPC warstwy wykonawczej]]. Nie ma formatu komunikatu (envelope), nazwy metody ani `id`: wywołujący wysyła `GET /eth/v1/node/syncing` i czyta obiekt JSON z polem `data`, a błędy przychodzą jako zwykłe kody statusu HTTP z opisującym je body w JSON-ie. Większość ścieżek to zwykłe GET-y, więc można je przeglądać w przeglądarce albo przez `curl` i cache'ować standardowymi mechanizmami HTTP.",
          "Bloki i stany adresuje się identyfikatorem stanu albo bloku, a nie numerem, i słownictwo ma tu znaczenie: `head`, `genesis`, `finalized`, `justified`, numer slotu albo 32-bajtowy root. `/eth/v2/beacon/blocks/finalized` i `/eth/v1/beacon/headers/head` są równie poprawne, a ta sama ścieżka odpowiada na każdą z tych form. Odpowiedź można też dostać w [[ssz|SSZ]] przez `accept: application/octet-stream`; jest wtedy dużo mniejsza i tego używają klienci, gdy synchronizują się od siebie nawzajem."
        ]
      },
      {
        heading: "Co gdzie jest",
        paragraphs: [
          "Grupa `/eth/v1/beacon` obejmuje dane łańcucha: [[beacon-block|bloki beacon]], nagłówki, pule [[attestation|atestacji]] i wyjść walidatorów (exit), salda i statusy [[validator|walidatorów]] pod `/eth/v1/beacon/states/{state_id}/validators`, dane o [[finality|finalności]] pod `/eth/v1/beacon/states/{state_id}/finality_checkpoints` oraz [[blob|bloby]] pod `/eth/v1/beacon/blobs/{block_id}`, które beacon-APIs v4.0.0 dodało, gdy oznaczyło jako przestarzałe `/eth/v1/beacon/blob_sidecars/{block_id}`. Grupa `/eth/v1/node` raportuje `syncing`, `health`, `identity`, `version` i `peers` i tego używa [[health-check|health check]] operatora. Grupa `/eth/v1/config` zwraca stałe specyfikacji i harmonogram forków, dzięki czemu narzędzie może odczytać parametry sieci, zamiast wpisywać je na sztywno.",
          "Dwie grupy nie są do ogólnego użytku. `/eth/v1/validator` udostępnia [[validator-client|klientowi walidatora]] obowiązki (duties), dane do atestacji i produkcję bloków, a ścieżki `/eth/v1/debug` zrzucają całe stany beacon, które są duże i drogie. [[beacon-endpoints|Konkretny spis ścieżek]] wymienia resztę."
        ]
      },
      {
        heading: "Eventy i to, na co odpowiada tylko to API",
        paragraphs: [
          "`/eth/v1/events` to [[server-sent-events|strumień server-sent events]], odpowiednik [[eth-subscribe|eth_subscribe]] po stronie konsensusu. Subskrypcja topics takich jak `head`, `block`, `finalized_checkpoint` i `chain_reorg` daje powiadomienie w trybie push w chwili, gdy [[fork-choice|fork choice]] się przesuwa, a to czystszy sygnał reorgu niż odpytywanie bloków wykonawczych i porównywanie hashy rodziców.",
          "Niektóre fakty nie istnieją nigdzie indziej: czy walidator jest aktywny, wyszedł (exit) czy dostał slashing; jakie są bieżące checkpointy justified i finalized; którzy walidatorzy zasiadają w [[sync-committee|sync committee]]; i zawartość blobów, którą [[consensus-layer|warstwa konsensusu]] trzyma przez około 18 dni, a [[execution-layer|warstwa wykonawcza]] nie przechowuje wcale. Od Fulu węzeł trzyma ją jako kolumny danych, za które odpowiada (custody), razem z ich dowodami KZG, a nie jako całe sidecary blobów, więc pełne bloby musi zwracać tylko supernode, który przechowuje wszystkie kolumny. Na tym API opierają się [[checkpoint-sync|checkpoint sync]] i [[light-client|lekcy klienci]]."
        ]
      },
      {
        heading: "Uruchamianie i wystawianie",
        paragraphs: [
          "Port to wybór klienta: 5052 w [[lighthouse|Lighthouse]] i [[nimbus|Nimbus]], 5051 w [[teku|Teku]], 9596 w [[lodestar|Lodestar]], a [[prysm|Prysm]] udostępnia swój interfejs REST na 3500 obok własnego interfejsu gRPC. W kilku klientach API jest domyślnie wyłączone i włącza się je flagą w stylu `--http`. Publiczne wystawienie to prawdziwa decyzja, a nie formalność: ścieżki validator i debug są wrażliwe, strumienie eventów i zrzuty stanu są drogie, a wbudowanego [[authentication|uwierzytelniania]] nie ma, więc jeśli API musi być osiągalne, trzeba postawić przed nim [[reverse-proxy|reverse proxy]]."
        ]
      }
    ],
    example: {
      title: "Checkpointy finalności i strumień eventów head",
      note: "Sfinalizowana epoka z tej odpowiedzi to właśnie to, co [[execution-client|klient wykonawczy]] zgłosi jako tag bloku `finalized`, gdy [[consensus-client|klient konsensusu]] przekaże ją przez [[engine-api|Engine API]]."
    },
    pitfalls: [
      "Oczekiwanie semantyki JSON-RPC; nie ma formatu komunikatu (envelope), błędy to kody statusu HTTP, a wyniki są opakowane w pole `data`.",
      "Żądanie stanu według slotu od [[beacon-node|beacon node]] z pruningiem; historyczne stany są drogie, a większość węzłów trzyma tylko niedawne.",
      "Publiczne wystawienie API bez proxy, co udostępnia endpointy walidatora i pozwala każdemu żądać kosztownych zrzutów stanu.",
      "Zakładanie, że bloby są dostępne dla starych bloków; warstwa konsensusu usuwa je po mniej więcej 18 dniach, a starsze można dostać tylko z [[blob-archive|archiwum blobów]]."
    ]
  },
  "the-merge": {
    title: "The Merge",
    aliases: ["merge", "the merge", "paris", "proof of work to proof of stake", "przejście na proof of stake", "wrzesień 2022", "TTD"],
    summary: "Merge, przeprowadzony 15 września 2022 roku, zakończył w Ethereum konsensus proof of work: istniejący łańcuch wykonawczy podłączono do Beacon Chain. Dlatego węzeł składa się dziś z dwóch klientów i dlatego istnieją [[block-tag|tagi bloków]] `safe` i `finalized`.",
    sections: [
      {
        heading: "Co się właściwie stało",
        paragraphs: [
          "Beacon Chain działał równolegle na [[proof-of-stake|proof of stake]] już od grudnia 2020 roku, a [[validator|walidatorzy]] atestowali łańcuch, który nie zawierał transakcji użytkowników. Merge połączył te dwa łańcuchy: gdy łańcuch wykonawczy przekroczył próg terminal total difficulty, kopanie ustało, a każdy kolejny blok wykonawczy przychodził już jako [[execution-payload|execution payload]] wewnątrz [[beacon-block|bloku beacon]]. Konta, salda, kontrakty, [[evm|EVM]] i format transakcji się nie zmieniły, a użytkownicy nie musieli nic robić.",
          "Zmienił się węzeł. Jeden proces zamienił się w [[execution-layer|warstwę wykonawczą]] i [[consensus-layer|warstwę konsensusu]] połączone przez [[engine-api|Engine API]]; każda z nich to osobna implementacja z własną bazą danych, portami i harmonogramem aktualizacji. Uruchamianie tylko jednej połowy przestało wchodzić w grę."
        ]
      },
      {
        heading: "Co zmienił dla RPC",
        paragraphs: [
          "Kilka [[block-header|pól nagłówka]] stało się stałymi. `difficulty` wynosi `0x0`, `nonce` w nagłówku jest zerowy, lista ommerów jest zawsze pusta, więc `sha3Uncles` się nie zmienia, a `mixHash` niesie teraz `prevRandao`, czyli [[randao|losowość warstwy konsensusu]] dla danego bloku. Metody kopania, takie jak `eth_getWork`, zniknęły z klientów, a emisja przeniosła się do warstwy konsensusu, więc blok wykonawczy nie wypłaca już nagrody za blok.",
          "Ważniejsze są dwa dodatki. Tagi `safe` i `finalized` stały się dostępne, bo warstwa konsensusu zna teraz oba te pojęcia. Czas bloków stał się 12-sekundowym harmonogramem z okazjonalnymi pominiętymi slotami zamiast procesu Poissona, dzięki czemu interwały odpytywania są przewidywalne. Głębokie [[reorg|reorgi]] stały się rzadkie: reorg o jeden blok nadal się zdarza, ale wieloblokowe reorgi z czasów proof of work już nie."
        ]
      },
      {
        heading: "Czego nie zmienił",
        paragraphs: [
          "Merge był zmianą konsensusu, a nie skalowaniem. Limity gasu, opłaty i przepustowość pozostały bez zmian, [[eth-call|eth_call]] i każda inna metoda odczytu zachowały dokładnie tę samą semantykę, a mechanika opłat [[eip-1559|EIP-1559]] przeszła bez zmian. Merge nie obejmował też wypłat ETH ze stakingu; pojawiły się one wraz z aktualizacją Shapella w kwietniu 2023 roku, a pole `withdrawals` występuje dopiero w blokach od tej [[hardfork|aktualizacji sieci]].",
          "Trwała konsekwencja dla operatora RPC jest operacyjna, a nie semantyczna. Dwóch klientów oznacza dwa procesy synchronizacji, wspólny sekret JWT, [[client-diversity|dwie decyzje o wyborze klienta]], które wpływają na zdrowie sieci, i tryb awarii, którego wcześniej nie było: [[execution-client|klient wykonawczy]] doskonale odpowiada na odczyty, ale jego [[consensus-client|klient konsensusu]] nie działa, więc serwowany head przestał się przesuwać."
        ]
      }
    ],
    pitfalls: [
      "Wykrywanie proof of work przez odczyt `difficulty`; w każdym bloku po Merge wynosi ono `0x0`, a to nie oznacza, że sieć jest niedostępna.",
      "Traktowanie `mixHash` jak pozostałości po kopaniu; niesie ono `prevRandao` zdefiniowane w EIP-4399, czyli losowość konsensusu, którą proposer może zniekształcić i przewidzieć z wyprzedzeniem jednego bloku, więc kontrakt, który z niej korzysta, potrzebuje wyprzedzenia (lookahead) opisanego w temacie [[randao|RANDAO]].",
      "Zakładanie, że `withdrawals` istnieje w każdym bloku po Merge; to pole wprowadziła dopiero aktualizacja Shapella, kilka miesięcy później.",
      "Oczekiwanie, że Merge zmienił opłaty albo przepustowość; zmienił to, kto produkuje bloki, a nie to, ile mogą pomieścić."
    ]
  },
  eip: {
    title: "Ethereum Improvement Proposals (EIP)",
    aliases: ["EIP", "ERC", "standardy", "eips.ethereum.org", "EIP-1474", "EIP-1898", "propozycje ulepszeń Ethereum"],
    summary: "EIP to numerowany dokument, który specyfikuje zmianę lub standard dla Ethereum. Ponieważ protokół nie ma jednego właściciela, EIP jest zwykle najbardziej miarodajnym opisem tego, dlaczego metoda RPC zachowuje się tak, a nie inaczej.",
    sections: [
      {
        heading: "Typy i statusy",
        paragraphs: [
          "EIP z kategorii Standards Track dzielą się na: Core, które zmieniają reguły konsensusu i dlatego wymagają [[hardfork|aktualizacji sieci]]; Networking, które zmieniają [[devp2p|protokoły peer-to-peer]]; Interface, które zmieniają API klientów, w tym JSON-RPC; oraz ERC, które standaryzują zachowanie na poziomie aplikacji, na przykład smart kontrakty tokenów. EIP typu Meta i Informational opisują natomiast procesy i zalecenia. ERC mają teraz własne repozytorium, ale numeracja jest wspólna, a kanoniczne linki `eips.ethereum.org` nadal działają.",
          "Propozycja przechodzi przez etapy Draft, Review i Last Call do Final albo utyka w statusie Stagnant lub Withdrawn; kilka dokumentów procesowych, takich jak sam EIP-1, ma status Living. Status opisuje dokument, a nie sieć. Final oznacza, że tekst jest zamrożony, a EIP typu Core zaczyna działać dopiero wtedy, gdy aktywuje się zawierająca go aktualizacja. Z kolei ERC w statusie Draft może już działać w tysiącach wdrożonych kontraktów."
        ]
      },
      {
        heading: "Dlaczego zachowanie RPC definiują EIP",
        paragraphs: [
          "Zaskakująco duża część interfejsu jest zdefiniowana w EIP, a nie w [[execution-apis|specyfikacji Execution APIs]]. EIP-1474 określił pierwotny zestaw metod JSON-RPC i [[rpc-errors|kody błędów]]; EIP-1898 dodał postać `{blockHash, requireCanonical}` [[block-tag|parametru bloku]]; EIP-1186 zdefiniował [[eth-get-proof|eth_getProof]] i strukturę zwracanych przez nią dowodów [[account-proof|konta]] i [[storage-proof|storage]]; EIP-155 wprowadził [[chain-id|chain ID]]; EIP-55 zdefiniował checksum [[address|adresu]] zapisywany wielkimi i małymi literami.",
          "EIP dotyczące protokołu zmieniają to, co zwraca RPC, nawet gdy żadna metoda się nie zmienia. EIP-1559 dodał `baseFeePerGas` i `effectiveGasPrice`; EIP-2718 stworzył [[transaction-types|format transakcji typowanych]] (typed transaction envelope), na którym opiera się każdy późniejszy typ; EIP-4844 dodał pola blobów i [[eth-gas-price|eth_blobBaseFee]]; EIP-4895 dodał `withdrawals`; [[eip-7702|EIP-7702]] sprawił, że [[eth-get-code|eth_getCode]] dla konta EOA zwraca delegation designator (znacznik delegacji). Po stronie narzędzi EIP-1193 definiuje interfejs [[eip-1193|providera w przeglądarce]]."
        ]
      },
      {
        heading: "Jak czytać EIP",
        paragraphs: [
          "Każdy EIP ma ten sam szkielet: Abstract, Motivation, Specification, Rationale, Backwards Compatibility i Security Considerations. Normatywna jest tylko sekcja Specification i zwykle jest krótka. W sekcji Rationale zapisano argumenty, które ukształtowały ostateczne zachowanie, i często właśnie tego potrzeba, gdy implementacja zaskakuje. Sekcja Backwards Compatibility mówi, co przestanie działać w dekoderze.",
          "Zanim zacznie się polegać na konkretnym EIP, trzeba sprawdzić dwie rzeczy. Po pierwsze status, a w przypadku EIP typu Core także to, czy jest zaplanowany w konkretnej, nazwanej aktualizacji. Po drugie, czy klienci są zgodni: EIP może mieć status Final i nadal być zaimplementowany z subtelnymi różnicami, dlatego [[execution-apis|schematy]] i dokumentacja samych klientów pozostają praktycznym punktem odniesienia dla wszystkiego, co wysyła się przez sieć."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie statusu Final jako wdrożenia; EIP typu Core zaczyna obowiązywać dopiero wtedy, gdy w danej sieci aktywuje się zawierająca go aktualizacja.",
      "Powoływanie się na sekcję Rationale lub Motivation jako normatywną; wymagane zachowanie definiuje tylko sekcja Specification.",
      "Zakładanie, że numery ERC to osobna seria; EIP i ERC mają wspólną numerację, choć leżą w różnych repozytoriach.",
      "Implementowanie RPC na podstawie samego EIP; endpoint w praktyce trzyma się zachowania klientów i schematów Execution APIs."
    ]
  },
  hardfork: {
    title: "Aktualizacje sieci (hard forki)",
    aliases: ["hard fork", "fork", "aktualizacja sieci", "Shapella", "Dencun", "Pectra", "Fusaka", "upgrade"],
    summary: "Aktualizacja sieci to skoordynowana zmiana reguł konsensusu, którą wszyscy klienci aktywują w tym samym timestampie albo w tej samej epoce. Węzeł ze starym oprogramowaniem nie podąża więc za jakimś łagodniejszym łańcuchem, tylko całkowicie wypada z łańcucha kanonicznego.",
    sections: [
      {
        heading: "Jak działa aktywacja",
        paragraphs: [
          "Aktywację się planuje, a nie negocjuje. Od [[the-merge|Merge]] fork warstwy wykonawczej aktywuje się w uniksowym timestampie zapisanym w konfiguracji łańcucha klienta, a odpowiadający mu fork warstwy konsensusu w określonej epoce. Obie części węzła trzeba skonfigurować i zaktualizować, bo forkują razem: klient, który nie zna nowych reguł, albo odrzuci pierwszy prawidłowy blok po forku, albo wyprodukuje blok, którego nikt inny nie przyjmie. Dlatego aktualizację ogłasza się z wielomiesięcznym wyprzedzeniem i najpierw przećwicza na [[testnets|testnetach]].",
          "Nazwy występują w parach, po jednej na warstwę, i zwykle się je skleja. Z Shanghai i Capella powstała nazwa Shapella, z Cancun i Deneb – Dencun, z Prague i Electra – Pectra, a z Osaka i Fulu – Fusaka. Z tego samego powodu [[execution-apis|specyfikacja Engine API]] jest uporządkowana według tych nazw forków."
        ]
      },
      {
        heading: "Ostatnie aktualizacje",
        paragraphs: [
          "Shapella z 12 kwietnia 2023 włączyła [[withdrawals|wypłaty]] walidatorów (EIP-4895) i dodała opcode `PUSH0`. Dencun z 13 marca 2024 wprowadził [[blob|transakcje blobowe]] (EIP-4844), transient storage (EIP-1153), root nadrzędnego [[beacon-block|bloku beacon]] dostępny w [[evm|EVM]] (EIP-4788) oraz zawężony `SELFDESTRUCT` z EIP-6780.",
          "Pectra z 7 maja 2025 była wyjątkowo szeroka: [[eip-7702|transakcje set code]], maksymalne efektywne saldo [[validator|walidatora]] 2048 ETH, docelowo 6 i maksymalnie 9 blobów, precompile'e BLS, wyjścia walidatorów inicjowane z warstwy wykonawczej i depozyty przetwarzane w bloku, droższe calldata oraz [[block-header|pole nagłówka]] `requestsHash` z EIP-7685. W grudniu 2025 przyszła Fusaka z PeerDAS, który zmienia sposób próbkowania [[data-availability|dostępności danych]] (data availability) blobów; po niej przychodzą forki zmieniające wyłącznie parametry blobów (blob-parameter-only), które podnoszą limity blobów według własnego harmonogramu. Następna aktualizacja, Glamsterdam, jest dopiero przed nami."
        ]
      },
      {
        heading: "Co sprawdza aplikacja korzystająca z RPC",
        paragraphs: [
          "Przy forku aplikacje psują się z trzech powodów. W obiektach bloków pojawiają się nowe [[block-header|pola nagłówka]], więc ścisły dekoder, który odrzuca nieznane klucze, wyłoży się na pierwszym bloku po forku. Pojawiają się nowe [[transaction-types|typy transakcji]], więc instrukcja switch po polu `type`, która rzuca wyjątek przy nieznanej wartości, zepsuje się na pierwszej takiej transakcji. Udostępniane są też nowe metody i pola, na przykład `eth_blobBaseFee` po Dencun, z których kod może korzystać dopiero wtedy, gdy endpoint przejdzie aktualizację.",
          "Od strony operacyjnej trzeba zaktualizować obu klientów przed timestampem forka i upewnić się, że zgadzają się co do wersji [[engine-api|Engine API]], bo niedopasowana para po prostu staje na forku, zamiast stopniowo tracić funkcje. Trzeba też sprawdzić, czy używany [[rpc-provider|provider]] przeszedł aktualizację, zmierzyć od nowa wszystko, co zależy od kosztów gasu, bo fork może zmienić ceny opcode'ów i calldata, i pamiętać, że testnety forkują kilka tygodni wcześniej. To na nich można znaleźć zepsuty dekoder, zanim zrobi to mainnet."
        ]
      }
    ],
    pitfalls: [
      "Ścisłe dekodowanie obiektów bloków i transakcji; każda aktualizacja może dodać pola, a dekoder, który odrzuca nieznane klucze, psuje się w chwili jej aktywacji.",
      "Zaktualizowanie [[execution-client|klienta wykonawczego]] bez [[consensus-client|klienta konsensusu]], przez co węzeł staje na forku, zamiast ostrzec operatora.",
      "Hardkodowanie oszacowań gasu i trzymanie ich po aktualizacji; zmiany cen, takie jak nowy koszt calldata w Pectra, po cichu je dezaktualizują.",
      "Zakładanie, że provider forkuje dokładnie w tej samej chwili co ty; lepiej sprawdzić jego okno aktualizacji, niż dowiedzieć się o nim z nieudanych wywołań."
    ]
  },
  testnets: {
    title: "Testnety",
    aliases: ["testnet", "sieć testowa", "Sepolia", "Hoodi", "Holesky", "Goerli", "test network"],
    summary: "Testnet (sieć testowa) to osobna sieć Ethereum z własnym [[chain-id|chain ID]] i bezwartościowym etherem, na której działają ci sami klienci i ten sam interfejs RPC co na mainnecie: Sepolia do pracy nad aplikacjami, Hoodi do stakingu i pracy z walidatorami.",
    sections: [
      {
        heading: "Której sieci użyć",
        paragraphs: [
          "Sepolia (chain ID 11155111) to domyślny wybór do testowania aplikacji. Jest stosunkowo mała i szybko się synchronizuje, a jej zbiór walidatorów jest zamknięty (permissioned), co daje stabilność, ale sprawia, że nie jest realistyczną próbą dla oprogramowania stakingowego. Hoodi (chain ID 560048), uruchomiona w marcu 2025, to sieć do testowania walidatorów, stakingu i pracy operatorów węzłów, z otwartym (permissionless) zbiorem walidatorów; zastąpiła Holesky (chain ID 17000), wycofaną w 2025, po tym jak w 2024 wycofano Goerli.",
          "Luki wypełniają dwa inne rodzaje sieci. [[ephemery|Ephemery]] resetuje się w stałym cyklu, więc nigdy nie gromadzi stanu i przydaje się w testach automatycznych, które inaczej potrzebowałyby świeżego łańcucha. Krótko żyjące devnety, zwykle stawiane narzędziami takimi jak [[kurtosis|ethereum-package dla Kurtosis]], to sposób, w jaki zespoły klientów przećwiczają aktualizację, zanim trafi ona na publiczny testnet. Do testów jednostkowych i szybkiej pracy lokalnej [[local-devnet|lokalny węzeł deweloperski]] jest lepszy od każdej z tych sieci."
        ]
      },
      {
        heading: "Dlaczego RPC zachowuje się tak samo",
        paragraphs: [
          "Na testnecie działają ci sami [[execution-client|klienci wykonawczy]] i [[consensus-client|klienci konsensusu]] co na mainnecie, tylko z innym [[genesis|genesis i konfiguracją łańcucha]]. [[namespaces|Przestrzenie nazw]], [[hex-encoding|kodowania]], [[block-tag|tagi bloków]], [[rpc-errors|kody błędów]] i [[engine-api|Engine API]] są identyczne, więc kod napisany pod endpoint testnetu działa bez zmian na mainnecie. O to właśnie chodzi: inna jest sieć, a interfejs ten sam.",
          "Niektóre praktyczne różnice sprzyjają testowaniu. Historia i [[state|stan]] są na tyle małe, że [[archive-node|węzeł archiwalny]] jest tani w utrzymaniu, a całą historię łatwo przeskanować przez [[eth-get-logs|eth_getLogs]]. Opłaty są bliskie zeru, więc budżetowanie gasu niczego tu nie sprawdza. Żeby w ogóle dostać ether, trzeba skorzystać z [[faucet|faucetu]] (serwisu rozdającego testowy ether), który zwykle ma rate limit na adres i na dzień."
        ]
      },
      {
        heading: "Różnice, które potrafią zaboleć",
        paragraphs: [
          "Testnety przechodzą aktualizacje kilka tygodni przed mainnetem, co jest zarówno zaletą, jak i pułapką: pole albo [[transaction-types|typ transakcji]], który istnieje na Sepolii, może jeszcze nie istnieć na mainnecie, a kod, który po cichu na nim polega, przechodzi wszystkie testy i pada na produkcji. Po wejściu [[hardfork|aktualizacji sieci]] zdarza się też odwrotnie: mainnet już się zmienił, a stare wdrożenie na testnecie nie.",
          "Adresy i infrastruktura też się rozjeżdżają. Kontraktu, od którego zależy aplikacja, może nie być, może być wdrożony pod innym adresem albo być zaślepką (stubem) o innym zachowaniu, a usługi oracle i rozwiązywanie nazw często działają inaczej albo w ogóle ich nie ma. [[mempool|Mempool]] jest uboższy i mniej konkurencyjny, więc wszystko, co dostrojono pod realną presję opłat albo kolejność transakcji, zachowuje się inaczej. Warto sprawdzać [[chain-id|eth_chainId]] przy każdym połączeniu, żeby źle skonfigurowany endpoint zawiódł głośno, zamiast wysłać prawdziwą transakcję do niewłaściwej sieci."
        ]
      }
    ],
    pitfalls: [
      "Testowanie oprogramowania stakingowego albo walidatorów na Sepolii; zamknięty zbiór walidatorów sprawia, że to słaba próba generalna, a Hoodi istnieje właśnie do tego.",
      "Hardkodowanie adresu kontraktu, który akurat jest taki sam na testnecie i na mainnecie; gwarantują to tylko deterministyczne wdrożenia.",
      "Ufanie zachowaniu gasu i opłat zmierzonemu na testnecie, gdzie prawie pusty mempool całkowicie ukrywa realną presję opłat.",
      "Używanie publicznego endpointu testnetu do testów obciążeniowych; faucety i współdzielone endpointy mają znacznie ostrzejsze rate limity niż płatne endpointy mainnetu."
    ]
  },
  ephemery: {
    title: "Ephemery",
    aliases: [
      "Ephemery testnet",
      "testnet Ephemery",
      "ephemeral testnet",
      "resetowany testnet",
      "resetting testnet",
      "39438000",
      "retention.sh",
      "ephemery-genesis"
    ],
    summary: "Ephemery to publiczny [[testnets|testnet]] Ethereum, który co 28 dni wyrzuca cały łańcuch i startuje od nowa z nowym blokiem [[genesis|genesis]] i nowym [[chain-id|chain ID]], więc nigdy nie gromadzi stanu i nigdy nie brakuje w nim testowego etheru.",
    sections: [
      {
        heading: "Jedna sieć, wiele iteracji",
        paragraphs: [
          "Każde uruchomienie sieci to iteracja, a genesis następnej wyprowadza się z poprzedniej. Timestamp genesis przesuwa się o okres, czyli 2 419 200 sekund; chain ID to 39438000 plus numer iteracji, więc `eth_chainId` minus 39438000 to numer iteracji, na której jest węzeł; a zbiór walidatorów genesis jest modyfikowany zależnie od numeru iteracji, tak że fork digest warstwy konsensusu się zmienia, a wersje forków pozostają stałe. Wszystko inne, czyli [[state|stan]] wykonawczy, bloki, receipty i stan beacon, jest wyrzucane. Pliki każdej iteracji są publikowane jako release repozytorium `ephemery-testnet/ephemery-genesis` z tagiem `ephemery-` i numerem iteracji, a harmonogram forków każdej iteracji aktywuje najnowsze aktualizacje w genesis albo krótko po nim, więc węzeł Ephemery musi działać na wydaniu klienta, które już je obsługuje.",
          "Taka konstrukcja ma omijać problemy długo żyjących testnetów: niedobór etheru, nieaktywni [[validator|walidatorzy]] i rozrost stanu (state bloat). Każdy genesis z góry przydziela (premine) operatorom i [[faucet|faucetom]] miliony etheru, więc faucety same się uzupełniają, a walidatorzy, których klucze publiczne trafiły do repozytorium genesis, są aktywni od pierwszego slotu. Długość okresu nie jest przypadkowa: specyfikacja dobiera ją do liczby walidatorów genesis tak, żeby walidatorzy zdeponowani później nie zdążyli się aktywować na tyle szybko, by zepchnąć zbiór genesis poniżej większości dwóch trzecich przed kolejnym resetem."
        ]
      },
      {
        heading: "Co reset robi z węzłem",
        paragraphs: [
          "Dla [[execution-client|klienta wykonawczego]] albo [[consensus-client|klienta konsensusu]] reset to nowa sieć: na starej bazie nie da się kontynuować, więc węzeł trzeba zatrzymać, wyczyścić jego katalog danych, zainicjalizować nowy genesis i uruchomić klienta ponownie. Skrypt projektu `retention.sh`, uruchamiany z crona co pięć minut, robi dokładnie to: zachowuje klucze węzła i usuwa dane łańcucha. Kilku klientów zna tę sieć natywnie: [[besu|Besu]] i [[teku|Teku]] przyjmują `--network=ephemery` i same wyznaczają bieżącą iterację, a Teku dodatkowo sam przeprowadza reset. [[beacon-node|Beacon node'y]] mogą robić [[checkpoint-sync|checkpoint sync]] z kilku publicznych endpointów Ephemery, a `ethereum-package` dla [[kurtosis|Kurtosis]] dołącza do bieżącej iteracji po ustawieniu `network: ephemery`."
        ]
      },
      {
        heading: "Co reset robi z aplikacjami korzystającymi z RPC",
        paragraphs: [
          "Dla wszystkiego, co czyta łańcuch przez RPC, reset nie przypomina niczego, z czym to oprogramowanie miało sobie radzić. Numery bloków zaczynają się od zera, każdy [[block-hash|hash bloku]] i hash transakcji z poprzedniej iteracji znika, a kontrakty trzeba wdrożyć od nowa. [[indexer|Indekser]], którego kursor wskazuje blok 190 000 z hashem X, znajduje niższy head i inny hash na każdej sprawdzanej wysokości; gdyby potraktował to jak [[reorg|reorg]], cofałby 190 000 bloków jeden po drugim. Wiarygodnym sygnałem jest zmiana chain ID albo hasha bloku genesis, która powinna wywołać wyczyszczenie danych i start od zera; to samo dotyczy bazy [[block-explorer|eksploratora bloków]].",
          "Zmiana chain ID jest celowa: dzięki EIP-155 każda transakcja z replay protection (ochroną przed powtórzeniem na innym łańcuchu) podpisana dla jednej iteracji jest nieważna w następnej, a żadne narzędzie nie pomyli dwóch iteracji. Koszt spada na konfigurację. Publiczne adresy URL RPC są te same między resetami, więc sieć zapisana w portfelu z zeszłomiesięcznym ID przestaje pasować do `eth_chainId` i trzeba ją dodać od nowa, a zahardkodowane ID w skryptach wdrożeniowych, fixture'ach testów i domenach [[eip-712|EIP-712]] psują się przy następnym resecie. Adresy kontraktów mogą przetrwać: ten sam klucz deployera, zaczynając od nonce zero na świeżym łańcuchu, daje te same adresy `CREATE` w tej samej kolejności. Salda, approvale i rejestracje już nie, dlatego Ephemery dobrze pasuje do testów automatycznych, które budują swój świat od zera, a słabo do wszystkiego, co musi przetrwać."
        ]
      }
    ],
    example: {
      title: "Wykrywanie nowej iteracji przed wznowieniem indeksera",
      note: "Sam chain ID identyfikuje iterację Ephemery, bo po odjęciu 39438000 daje jej numer; sprawdzanie także hasha genesis wyłapuje dodatkowo devnety, które restartują się bez zmiany ID."
    },
    pitfalls: [
      "Zapisywanie Ephemery w portfelu albo konfiguracji ze stałym chain ID; zmienia się ono w każdej iteracji, a transakcje podpisane z zeszłomiesięcznym ID są odrzucane.",
      "Pozwalanie indekserowi traktować reset jak głęboki reorg, zamiast wykryć nowy genesis i zacząć od nowa.",
      "Restartowanie węzła po resecie na starym katalogu danych; na nim węzeł nie dołączy do nowej iteracji.",
      "Używanie starszego wydania klienta; każda iteracja aktywuje najnowsze aktualizacje w pobliżu genesis, a klient bez nich odpada na forku.",
      "Używanie Ephemery do wdrożenia demo albo długotrwałego testu (soak test), który musi przetrwać dłużej niż 28-dniowy okres."
    ]
  },
  "gnosis-chain": {
    title: "Gnosis Chain",
    aliases: ["Gnosis", "xDAI", "xDai chain", "GNO", "Chiado", "chain id 100", "chain ID 100", "gnosis beacon chain"],
    summary: "Gnosis Chain to sieć EVM z [[chain-id|chain ID]] 100, której natywnym tokenem do płacenia za gas jest xDAI pokryty DAI, a własny beacon chain zabezpieczają walidatorzy stakujący GNO. Działa na oprogramowaniu klientów Ethereum, ale z innymi stałymi, modelem dwóch tokenów i regułami specyficznymi dla tego łańcucha, których nie należy zakładać, przenosząc nawyki z mainnetu.",
    sections: [
      {
        heading: "Ta sama architektura, inne stałe",
        paragraphs: [
          "Od własnego Merge Gnosis Chain ma dokładnie taką strukturę jak Ethereum: [[execution-layer|warstwę wykonawczą]] i [[consensus-layer|warstwę konsensusu]] połączone przez [[engine-api|Engine API]]. Inne są liczby. Chain ID to 100 (`0x64`), a testnet Chiado ma 10200 (`0x27d8`). Slot trwa 5 sekund, a epoka 16 slotów, więc epoka to 80 sekund, bloki pojawiają się co 5 sekund, a [[finality|finalność]] przychodzi w ciągu kilku minut zamiast po mniej więcej 13. Beacon chain używa własnego presetu `gnosis`, który zwraca `/eth/v1/config/spec`, a narzędzia z zahardkodowanymi 12-sekundowymi slotami albo 32-slotowymi epokami liczą złe czasy i złe epoki.",
          "Inne są też opłaty. Opłata base fee z EIP-1559 nie jest spalana, tylko od bloku 19 040 000 trafia na adres zbierający opłaty (fee collector) `0x6BBe78ee9e474842Dbd4AB4987b3CeFE88426A92`, więc rozliczenia podaży oparte na spalaniu tu nie działają. Docelowo jest jeden blob na blok, maksymalnie dwa, blob base fee ma dolną granicę 1 gwei, a dane blobów są przechowywane przez 16 384 epoki, czyli około 15 dni. Natywnymi klientami wykonawczymi są [[nethermind|Nethermind]] i [[erigon|Erigon]], do tego dochodzą utrzymywane przez Gnosis porty Geth i Reth; udokumentowani klienci konsensusu to [[lighthouse|Lighthouse]], [[lodestar|Lodestar]], [[nimbus|Nimbus]] i [[teku|Teku]]."
        ]
      },
      {
        heading: "Dwa tokeny i wypłaty, które nie zwiększają salda",
        paragraphs: [
          "xDAI to token natywny: raportuje go [[eth-get-balance|eth_getBalance]] i w nim wycenia się gas. Jest wybijany, gdy DAI zostaje przeniesiony z Ethereum przez bridge, a wybijanie odbywa się w trakcie przetwarzania bloku: po transakcjach każdego bloku klient wykonuje wywołanie systemowe (system call) do kontraktu nagród za bloki, `0x481c034c6d9441db23Ea48De68BCAe812C5d39bA`, i dopisuje do natywnych sald kwoty, które ten kontrakt zwraca. Saldo xDAI adresu może więc rosnąć bez żadnej transakcji, logu i receiptu, co psuje uzgadnianie sald oparte na sumowaniu przelewów.",
          "GNO to token ERC-20 używany do stakingu, jeden GNO na [[validator|walidatora]]; beacon chain liczy go jako 32 mGNO. Gnosis zmienia EIP-4895: [[withdrawals|wypłaty]] wymienione w bloku nie zwiększają natywnych sald. Zamiast tego klient wywołuje `executeSystemWithdrawals` na kontrakcie depozytowym pod adresem `0x0B98057eA310F4d31F2a452B414647007d1645d9`, który zapisuje GNO do odebrania, a właściciel później wywołuje `claimWithdrawal`, żeby dostać je jako przelew tokena. Tablica `withdrawals` wygląda jak na mainnecie, ale wypłata to claim tokena, a nie dopisanie xDAI."
        ]
      },
      {
        heading: "Trace'y, nagrody i nieregularne zmiany stanu",
        paragraphs: [
          "Przed Merge łańcuch, nazywany wtedy xDai, działał na proof of authority AuRa, od 2020 roku z kontraktami stakingowymi POSDAO, a kontrakt nagród za bloki wypłacał natywne tokeny w każdym bloku. [[nethermind|Nethermind]] raportuje te wypłaty w [[trace-api|trace_block]] jako wpisy `reward` z `rewardType` równym `external`, a integracja [[block-explorer|Blockscout]] z Nethermind czyta je przez `trace_block`, żeby przypisać nagrody za bloki, więc na tym łańcuchu są to dane, a nie szum. Po Merge kontrakt nagród nadal wybija przeniesiony przez bridge xDAI swoim wywołaniem systemowym, ale moduł trace w Nethermind raportuje już tylko zerową nagrodę typu `block` w każdym bloku, więc wybicie widać jako zmianę salda, a nie jako wpis w trace.",
          "Hard forki Gnosis zmieniały też stan bez transakcji. Aktualizacja z grudnia 2025 w ustalonym timestampie zastąpiła kod konta exploitera Balancer V2 ograniczonym kontraktem przekierowującym, jako nieregularną zmianę stanu (irregular state transition) zapisaną w konfiguracji klienta. [[eth-get-code|eth_getCode]] pod tym adresem zmienia się między dwoma blokami, choć nic w żadnym z nich tego nie wyjaśnia, więc [[indexer|indekser]] albo narzędzie do odtwarzania bloków, które wyprowadza kod tylko z transakcji, rozjeżdża się z łańcuchem."
        ]
      }
    ],
    pitfalls: [
      "Zakładanie 12-sekundowych slotów i 32-slotowych epok przy przeliczaniu timestampów Gnosis na bloki albo przy szacowaniu, kiedy przesunie się `finalized`.",
      "Uzgadnianie sald xDAI wyłącznie na podstawie transakcji i logów; wybicia z bridge'a przychodzą przez wywołanie systemowe kontraktu nagród za bloki.",
      "Obserwowanie natywnego salda adresu wypłat w oczekiwaniu na wypłaty ze stakingu; to GNO do odebrania w kontrakcie depozytowym.",
      "Pomijanie wpisów nagród z `trace_block` przy indeksowaniu historii Gnosis; jej nagrody `external` z czasów AuRa to sposób, w jaki eksploratory przypisują nagrody za bloki."
    ]
  },
  "permissioned-network": {
    title: "Sieci permissioned",
    aliases: [
      "sieć prywatna",
      "private network",
      "sieć konsorcjalna",
      "consortium chain",
      "QBFT",
      "IBFT 2.0",
      "Clique",
      "AuRa",
      "proof of authority",
      "perm_"
    ],
    summary: "Sieć permissioned to prywatny albo konsorcjalny łańcuch EVM, w którym bloki produkuje stały, znany zbiór podmiotów, zwykle w konsensusie proof of authority albo BFT, takim jak QBFT. Może też ograniczać, kto się łączy i kto wysyła transakcje. Obsługuje [[json-rpc|JSON-RPC]] Ethereum, ale różni się od mainnetu konsensusem, finalnością, opłatami i dostępem.",
    sections: [
      {
        heading: "Konsensus bez proof of stake",
        paragraphs: [
          "Mainnet od [[the-merge|Merge]] działa na [[proof-of-stake|proof of stake]] z Beacon Chain. Konsorcjum zwykle chce znanego zbioru walidatorów i w ogóle nie chce Beacon Chain. QBFT i IBFT 2.0, zaimplementowane w [[besu|Besu]], są odporne na błędy bizantyjskie (BFT): walidatorzy na zmianę proponują bloki, każdy blok zatwierdza kwalifikowana większość co najmniej dwóch trzecich, a czterech walidatorów to minimum, które toleruje jednego wadliwego uczestnika. Lista walidatorów i podpisy zatwierdzające (commit seals) są w polu `extraData` nagłówka, czas wyznaczają opcje genesis, takie jak `blockperiodseconds` i `requesttimeoutseconds`, a walidatorów dodaje się głosowaniem przez `qbft_proposeValidatorVote` albo przez kontrakt walidatorów. Clique rotuje podpisujących bloki (signerów) bez głosowania BFT, a AuRa, którą [[nethermind|Nethermind]] uruchamia dla łańcuchów takich jak Energy Web, przydziela walidatorom po kolei stałe kroki czasowe.",
          "Wsparcie w klientach się zawęziło. [[geth|Geth]] od v1.14 nie potrafi produkować (seal) bloków Clique ani Ethash i uruchamia sieci prywatne tylko jako proof of stake z klientem konsensusu. Besu usunął Clique w 26.4.0, zostawiając tylko możliwość synchronizacji łańcuchów, które zaczynały jako Clique, a później przeszły na proof of stake; IBFT 2.0 wspiera dla istniejących sieci, ale zaleca QBFT. Nethermind nadal ma silniki Clique i AuRa. Nowa sieć prywatna na pozostałych klientach to więc mały łańcuch proof of stake, taki, jaki stawia [[kurtosis|Kurtosis]] albo [[local-devnet|lokalny devnet]]."
        ]
      },
      {
        heading: "Finalność i tagi bloków",
        paragraphs: [
          "W QBFT i IBFT 2.0 zatwierdzony blok jest finalny: nie ma forków, więc liczenie [[confirmations|potwierdzeń]] i obsługa [[reorg|reorgów]] napisane dla publicznych łańcuchów przed niczym tu nie chronią. [[block-tag|Tagi bloków]] `safe` i `finalized` są jednak zdefiniowane przez fork choice [[engine-api|Engine API]], którego sieć BFT nie ma. Besu wyznacza je ze znaczników, które ustawia tylko Engine API albo plugin, więc w zwykłej sieci QBFT `eth_getBlockByNumber` z `finalized` zwraca błąd `Unknown block`; API pluginów Besu dostało settery właśnie na ten przypadek. W takiej sieci `latest` jest blokiem finalnym, a biblioteka, która domyślnie używa `finalized`, się psuje.",
          "Clique i AuRa nie dają takiej gwarancji; krótkie forki są możliwe i potwierdzenia nadal coś znaczą. Sieci BFT zawodzą inaczej: gdy ponad jedna trzecia walidatorów jest offline, w ogóle przestają produkować bloki, więc [[eth-block-number|eth_blockNumber]] zamiera, a łańcuch się nie rozwidla; zauważy to [[health-check|health check]], który obserwuje, czy head się przesuwa."
        ]
      },
      {
        heading: "Uprawnienia, prywatność i opłaty",
        paragraphs: [
          "Lokalne uprawnienia (permissioning) w Besu włącza się flagami `--permissions-nodes-config-file-enabled` i `--permissions-accounts-config-file-enabled`; allowlisty są czytane z `permissions_config.toml`, a w trakcie działania zarządza się nimi przez [[namespaces|przestrzeń nazw]] `perm_`, na przykład `perm_addAccountsToAllowlist`. Uprawnienia kont to polityka każdego węzła, a nie reguła konsensusu: węzeł odrzuca nadawcę spoza allowlisty w [[eth-send-raw-transaction|eth_sendRawTransaction]], nie rozgłasza tej transakcji i nie umieszcza jej w bloku, a mimo to przyjmuje od innego węzła blok, który ją zawiera. Uprawnienia oparte na smart kontraktach i prywatne transakcje Tessera usunięto z Besu w 25.6.0, a grupy API `PRIV` i `EEA` w 25.7.0, więc metody `priv_` opisywane w starszych poradnikach już nie istnieją.",
          "Wiele sieci prywatnych nie pobiera opłat za gas. W Besu wymaga to `--min-gas-price=0` na każdym węźle, `zeroBaseFee: true` w konfiguracji [[genesis|genesis]] dla London i nowszych oraz wyłączenia sprawdzania salda w mempoolu; potem `eth_gasPrice` może zwracać `0x0`, a portfele albo biblioteki, które zakładają dodatni base fee, mogą działać nieprawidłowo. Chain ID wybiera się lokalnie i może kolidować z siecią publiczną, a metody konsensusu (`qbft_`, `ibft_`, `clique_` w Nethermind) to dodatkowe przestrzenie nazw włączane na każdym węźle osobno, na przykład przez dodanie `QBFT` do `--rpc-http-api` w Besu."
        ]
      }
    ],
    example: {
      title: "Genesis QBFT z darmowym gasem i tag finalized w takiej sieci",
      note: "Każdy blok jest tu finalny od chwili zatwierdzenia, a mimo to brakuje tagu, który by to mówił; w tej sieci `latest` jest odpowiedzią, której oczekiwał ktoś pytający o `finalized`."
    },
    pitfalls: [
      "Domyślne czytanie z tagiem `finalized` w sieci QBFT, gdzie Besu odpowiada `Unknown block`, choć każdy zatwierdzony blok jest finalny.",
      "Traktowanie uprawnień kont w Besu jak reguły łańcucha; filtrują one tylko to, co przyjmuje jeden węzeł, a bloki od innych węzłów nadal mogą zawierać takie transakcje.",
      "Korzystanie ze starszego poradnika opisującego metody `priv_` albo Tesserę w aktualnym wydaniu Besu, z którego prywatne transakcje usunięto.",
      "Zakładanie nowej sieci Clique na Geth albo Besu; żaden z nich nie potrafi już produkować bloków Clique.",
      "Zostawienie na jednym węźle niezerowego `--min-gas-price` w sieci z darmowym gasem; taki węzeł po cichu odrzuca wysłane do niego transakcje z zerową ceną."
    ]
  },
  "server-sent-events": {
    title: "Server-sent events (SSE)",
    aliases: ["sse", "strumień eventów", "strumień zdarzeń", "eventy beacon api", "push przez http", "ponowne połączenie strumienia"],
    summary: "Server-sent events to jednokierunkowy strumień w trybie push, przesyłany w zwykłej odpowiedzi HTTP typu `text/event-stream`. [[beacon-api|Beacon API]] używa go pod `/eth/v1/events`, żeby ogłaszać nowe heady, bloki, finalność i reorgi w chwili, gdy widzi je beacon node.",
    sections: [
      {
        heading: "Format strumienia",
        paragraphs: [
          "Klient wysyła GET, zwykle z nagłówkiem `accept: text/event-stream`, a serwer trzyma odpowiedź otwartą i dopisuje do niej tekst UTF-8, gdy coś się dzieje. Każda linia to jedno pole: `event:` ustawia typ eventu, `data:` dokleja dane do payloadu, `id:` ustawia identyfikator ostatniego eventu, a `retry:` ustawia opóźnienie ponownego połączenia w milisekundach. Pusta linia przekazuje odbiorcy event zbudowany do tej pory, a linia zaczynająca się od dwukropka to komentarz, którego serwery używają jako keep-alive.",
          "W drugą stronę nic nie płynie. Nie ma upgrade'u połączenia ani binarnych ramek, jest tylko odpowiedź HTTP, która nigdy się nie kończy. Dlatego taki strumień przechodzi przez wszystko, co przepuszcza [[http-transport|HTTP]], i da się go odczytać zwykłym `curl -N`. [[websocket-transport|WebSocket]] to odwrotny kompromis: dwukierunkowe ramki po handshake'u z upgrade'em, więc klient może wysyłać żądania tym samym połączeniem. Tak działa [[eth-subscribe|eth_subscribe]] w warstwie wykonawczej."
        ]
      },
      {
        heading: "Ponowne połączenie i czego ono nie odzyska",
        paragraphs: [
          "`EventSource` w przeglądarce sam łączy się ponownie po opóźnieniu, które wybiera przeglądarka: kilka sekund, chyba że serwer wysłał `retry:`. Wysyła przy tym `Last-Event-ID` z ostatnim widzianym identyfikatorem, więc serwer, który przechowuje historię, może wznowić strumień od tego miejsca. Odpowiedź HTTP 204 każe przeglądarce przestać próbować. Wznawianie to wyłącznie funkcja serwera, a `EventSource` nie potrafi ustawiać własnych nagłówków, więc klucz trzeba przekazać w URL-u albo w cookie.",
          "Beacon API nie definiuje identyfikatorów eventów ani ich odtwarzania (replay). Jego strumień zawiera tylko linie `event:` i `data:`, więc konsument, który połączy się ponownie, dostaje eventy od tej chwili i nic z luki. Tak samo wygląda zerwane połączenie `eth_subscribe` i rada jest ta sama: trzeba zapamiętać root i slot ostatniego przetworzonego bloku, a potem uzupełnić lukę przez REST, zanim znów zaufa się strumieniowi."
        ]
      },
      {
        heading: "Strumień Beacon API",
        paragraphs: [
          "`GET /eth/v1/events?topics=head,chain_reorg,finalized_checkpoint` subskrybuje na jednym połączeniu kilka typów eventów (topics). Wersja 4.0.0 specyfikacji wymienia `head`, `block`, `block_gossip`, `attestation`, `single_attestation`, `voluntary_exit`, `bls_to_execution_change`, `proposer_slashing`, `attester_slashing`, `finalized_checkpoint`, `chain_reorg`, `contribution_and_proof`, dwa rodzaje aktualizacji dla lekkich klientów, `payload_attributes`, `blob_sidecar` i `data_column_sidecar`. Liczby w payloadzie są dziesiętnymi ciągami, jak w całym API; pre-release specyfikacji dla następnego forka oznacza `head` jako deprecated na rzecz `head_v2`.",
          "`head` niesie slot, root bloku, state root i dependent roots za każdym razem, gdy [[fork-choice|fork choice]] przesuwa head. `chain_reorg` dodaje `depth` oraz rooty starego i nowego heada i jest jedynym miejscem, w którym [[reorg|reorg]] przychodzi jako jawny event. `finalized_checkpoint` pojawia się mniej więcej raz na epokę z nowym [[finality|sfinalizowanym]] rootem. `block_gossip` przychodzi, gdy blok przejdzie walidację w gossipie, a `block`, gdy fork choice go zaimportuje, dlatego [[network-telemetry|telemetria]] zapisuje oba. Z `payload_attributes` korzystają builderzy i relaye, żeby przygotować następną propozycję bloku, a eventów atestacji jest bardzo dużo."
        ]
      },
      {
        heading: "Proxy i backfill",
        paragraphs: [
          "nginx domyślnie buforuje odpowiedzi z proxy, więc eventy przychodzą seriami albo dopiero wtedy, gdy zapełni się bufor; pomaga `proxy_buffering off` w danej sekcji location albo nagłówek odpowiedzi `X-Accel-Buffering: no`. Do tego jego `proxy_read_timeout` wynoszący 60 sekund ucina cichy strumień: subskrypcja samego `finalized_checkpoint` potrafi milczeć po kilka minut, a Beacon API pozwala na komentarze keep-alive, ale ich nie wymaga. [[reverse-proxy|Reverse proxy]] trzeba skonfigurować pod strumień, a nie pod pojedyncze żądanie.",
          "Po każdym ponownym połączeniu trzeba najpierw uzupełnić braki (backfill), a dopiero potem wznowić strumień: odczytać `/eth/v1/beacon/headers/head` i `/eth/v1/beacon/states/head/finality_checkpoints` przez [[beacon-endpoints|ścieżki REST]], porównać kanoniczny root w każdym slocie od ostatnio przetworzonego i cofać się po parent rootach do pierwszej zgodności, żeby znaleźć przegapione reorgi."
        ]
      }
    ],
    example: {
      title: "Head i reorg w strumieniu oraz proxy, które go nie psuje",
      note: "Żaden z tych eventów nie ma linii `id:`, więc po ponownym połączeniu nie da się poprosić o to, co przepadło; lukę można uzupełnić tylko przez ścieżki REST."
    },
    pitfalls: [
      "Zakładanie, że ponowne połączenie wznawia strumień Beacon API, choć strumień nie przewiduje odtwarzania, a lukę trzeba uzupełnić przez REST.",
      "Serwowanie strumienia przez nginx z domyślnymi ustawieniami buforów, przez co eventy przychodzą z opóźnieniem i paczkami.",
      "Zostawienie 60-sekundowego read timeoutu proxy przy subskrypcji, której jedyny typ eventu pojawia się raz na epokę.",
      "Traktowanie eventu `head` jako ostatecznego; późniejszy `chain_reorg` może go zastąpić, a finalność oznacza tylko `finalized_checkpoint`.",
      "Subskrybowanie w dashboardzie eventów atestacji ze współdzielonego beacon node'a, co bez powodu przepuszcza przez niego strumień o dużym wolumenie."
    ]
  },
  openrpc: {
    title: "OpenRPC",
    aliases: ["OpenRPC", "openrpc.json", "rpc.discover", "JSON Schema", "rpc_modules", "rpc-compat", "schemat metody"],
    summary: "OpenRPC to oparty na JSON Schema format opisu API [[json-rpc|JSON-RPC]] 2.0, czyli jego metod, parametrów, wyników, błędów i przykładów, w jednym czytelnym maszynowo dokumencie, podobnie jak OpenAPI opisuje API REST. W tym właśnie języku napisana jest specyfikacja [[execution-apis|execution-apis]].",
    sections: [
      {
        heading: "Co zawiera dokument",
        paragraphs: [
          "Dokument OpenRPC to obiekt JSON z polami: `openrpc`, czyli wersja specyfikacji, obecnie 1.4.x; `info`; opcjonalne `servers`; `methods`; oraz `components`, w którym trzyma się schematy wielokrotnego użytku, przywoływane przez `$ref`. Każda metoda ma: `name`; `summary`; `params`, czyli tablicę deskryptorów zawartości (content descriptors), z których każdy ma `name`, `schema` i flagę `required`; deskryptor `result`; opcjonalne `errors` z polami `code`, `message` i `data`; `examples`; oraz `paramStructure` o wartości `by-position`, `by-name` albo domyślnie `either`.",
          "Schematy są zgodne z JSON Schema draft 7 i dopiero w nich [[hex-encoding|reguły kodowania]] Ethereum da się automatycznie sprawdzić. Typy bazowe execution-apis definiują `uint` jako string pasujący do `^0x(0|[1-9a-f][0-9a-f]*)$`, więc QUANTITY z wiodącym zerem nie przechodzi walidacji. Typy o stałej szerokości, takie jak 32-bajtowy hash, są zdefiniowane jako wzorce o dokładnej długości. Metody Ethereum przyjmują parametry pozycyjne, więc o znaczeniu deskryptora decyduje jego miejsce w tablicy."
        ]
      },
      {
        heading: "Jak korzysta z niego execution-apis",
        paragraphs: [
          "Specyfikacja jest napisana w YAML-u i podzielona według obszarów, na przykład `src/eth/client.yaml` i `src/schemas/base-types.yaml`, a `make build` kompiluje ją do jednego `openrpc.json` z rozwiązanymi wszystkimi `$ref` i po drodze waliduje wynik względem metaschematu OpenRPC. Ten plik napędza renderowaną dokumentację pod adresem `ethereum.github.io/execution-apis` i wszystkie generatory klientów, które z niego korzystają. Poza `eth_` repozytorium zawiera teraz także niektóre metody [[debug-api|debug_]], `txpool_content`, [[engine-api|Engine API]] oraz, od 2026 roku, metodę `eth_capabilities`, która [[eth-capabilities|informuje, jak długo węzeł przechowuje dane]].",
          "Zgodność testuje się osobno. Katalog `tests` zawiera pliki `.io`, z których każdy ma linię żądania poprzedzoną `>>` i oczekiwaną odpowiedź poprzedzoną `<<`, nagrane na stałym łańcuchu zbudowanym z `genesis.json` i `chain.rlp`. `speccheck` waliduje te przypadki względem schematu, a symulator `rpc-compat` w [[hive|hive]] codziennie odtwarza je na wszystkich głównych klientach i publikuje wyniki pod adresem hive.ethpandaops.io. To właśnie pilnuje, żeby [[client-diversity|różni klienci]] zwracali dane o tej samej strukturze."
        ]
      },
      {
        heading: "Wykrywanie metod w czasie działania",
        paragraphs: [
          "OpenRPC definiuje jedną własną metodę, `rpc.discover`, na którą serwer odpowiada swoim dokumentem OpenRPC, więc klient mógłby poznać dokładny zestaw metod endpointu, z którym rozmawia. Klienci wykonawczy Ethereum z reguły jej nie obsługują. Zamiast niej [[geth|Geth]], [[nethermind|Nethermind]] i [[reth|Reth]] odpowiadają na `rpc_modules`, która zwraca włączone [[namespaces|przestrzenie nazw]], każdą z numerem wersji, na przykład `eth` z wersją `1.0`, i nie mówi nic o pojedynczych metodach, parametrach ani limitach. W praktyce to, co endpoint obsługuje, nadal sprawdza się, wywołując jego metody; zobacz [[endpoint-capabilities|możliwości endpointu]]."
        ]
      },
      {
        heading: "Czego schemat nie powie",
        paragraphs: [
          "Schemat ustala strukturę danych, a nie zachowanie. Nie powie, ile gasu może zużyć [[eth-call|eth_call]], jak szeroki może być zakres [[eth-get-logs|eth_getLogs]], jak długo może trwać wywołanie, które przestrzenie nazw operator włączył ani jak szybko cokolwiek działa, a znaczenie tagu takiego jak `pending` jest opisane tylko prozą. Odpowiedź może być zgodna ze schematem i zarazem błędna, bo żaden wzorzec nie zna poprawnego salda; nagrane testy porównują wartości tylko na własnym małym łańcuchu.",
          "Błędy to najsłabiej opisana część. Od 2026 roku repozytorium ma katalog grup błędów: kod `3` dla revertu (execution reverted), zakres od 800 do 999 dla błędów gasu i od 1000 do 1199 dla błędów mempoola. Na razie odwołują się do niego jednak tylko `eth_sendTransaction` i [[eth-send-raw-transaction|eth_sendRawTransaction]], więc błędy większości metod nadal nie są wyspecyfikowane. Przestrzeni nazw specyficznych dla klientów, takich jak [[trace-api|trace_]] i `ots_`, w specyfikacji w ogóle nie ma."
        ]
      }
    ],
    example: {
      title: "Jedna metoda, jej typ i jej test zgodności",
      note: "Schemat odrzuciłby `0x01`; tylko test zauważy, czy wartość jest chain ID łańcucha testowego, a ani schemat, ani test nie mówi, czy dany endpoint ma tę metodę włączoną."
    },
    pitfalls: [
      "Traktowanie odpowiedzi zgodnej ze schematem jako poprawnej; schemat sprawdza kodowanie i strukturę, a nie wartość.",
      "Wywołanie `rpc.discover` na kliencie wykonawczym i wniosek, że endpoint jest zepsuty, podczas gdy klienci obsługują zamiast tego `rpc_modules`.",
      "Wygenerowanie klienta z `openrpc.json` i założenie, że każda zawarta w nim metoda jest włączona na danym endpoincie.",
      "Uzależnianie logiki od kodów błędów z katalogu w metodach, które jeszcze się do niego nie odwołują i w których klienci wciąż się różnią.",
      "Traktowanie renderowanej dokumentacji jako pełnego zestawu metod; nie ma w niej przestrzeni nazw klientów, takich jak `trace_` i `ots_`."
    ]
  }
};
