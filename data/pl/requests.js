// Polish text for the Requests lessons, keyed by topic id. Only the words: ids, link
// targets, code, related topics, and sources come from data/requests.js.
export const topics = {
  "eth-block-number": {
    title: "eth_blockNumber",
    aliases: [
      "blockNumber",
      "eth_blockNumber",
      "wysokość bloku",
      "wysokość łańcucha",
      "numer heada",
      "numer ostatniego bloku",
      "block height",
      "jak daleko jest węzeł"
    ],
    summary: "`eth_blockNumber` nie przyjmuje parametrów i zwraca numer najnowszego [[block|bloku]], który ten węzeł uważa w tej chwili za kanoniczny, jako [[hex-encoding|QUANTITY w hex]].",
    sections: [
      {
        heading: "Co robi",
        paragraphs: [
          "Żądanie ma pustą tablicę `params`, a wynik to pojedyncza wartość QUANTITY, na przykład `0x12d4f1c`. Ta liczba to wysokość własnego heada węzła, czyli bloku ostatnio zaakceptowanego przez [[fork-choice|fork choice]] i przekazanego [[execution-client|klientowi wykonawczemu]] przez [[engine-api|Engine API]]. To numer bloku warstwy wykonawczej, a nie slot konsensusu; sloty przesuwają się co 12 sekund niezależnie od tego, czy powstaje blok, więc te dwa liczniki trwale się rozjeżdżają. Zobacz [[slot-epoch|sloty i epoki]].",
          "Odpowiedź nic nie mówi o tym, na ile ten blok jest już przesądzony. `eth_blockNumber` nie ma parametru bloku ani tagu; żeby poznać wysokość, która jest już przesądzona, trzeba zapytać o blok z [[block-tag|tagiem]] `safe` lub `finalized` i odczytać jego `number`. `safe` to przy tym wynik [[fast-confirmation-rule|Fast Confirmation Rule]] na klientach konsensusu, które ją stosują, a na pozostałych ostatni checkpoint justified. Wartość może też spaść: obniża ją [[reorg|reorg]] (reorganizacja łańcucha), który zastępuje head krótszą gałęzią, a węzeł uruchomiony ponownie po niepoprawnym zamknięciu może przez chwilę zgłaszać niższą wysokość, dopóki odtwarza bloki."
        ]
      },
      {
        heading: "Jak odpowiada węzeł",
        paragraphs: [
          "To najtańsza metoda w całym API. Klient trzyma numer bloku head w pamięci, więc odpowiedź nie wymaga wyszukiwania w trie, odczytu z dysku ani w ogóle [[state|stanu]]. [[pruned-node|Pruned node]] i [[archive-node|węzeł archiwalny]] odpowiadają na nią tak samo i równie szybko, dlatego służy jako domyślny liveness probe, a [[rpc-provider|providerzy]] zwykle wyceniają ją w najniższej stawce.",
          "Węzeł, który wciąż się synchronizuje, i tak odpowiada, podając head tego fragmentu łańcucha, który do tej pory zaimportował. Podczas [[snap-sync|snap sync]] ta liczba może skoczyć prawie do heada sieci na długo przed tym, zanim węzeł będzie miał dość [[state|stanu]], żeby obsłużyć dla tego bloku [[eth-call|eth_call]] albo [[eth-get-balance|eth_getBalance]]. Zanim uzna się endpoint za używalny, trzeba to wywołanie połączyć z [[eth-syncing|eth_syncing]] i z `timestamp` bloku head."
        ]
      },
      {
        heading: "Zastosowanie w praktyce",
        paragraphs: [
          "Przydaje się do mierzenia [[head-lag|opóźnienia heada]] między endpointami, do wyboru `toBlock` przy skanowaniu przez [[eth-get-logs|eth_getLogs]] i do raportowania postępu w [[indexer|indekserze]]. Nie należy jej używać do wykrywania nowych bloków przez odpytywanie w ciasnej pętli; jedna subskrypcja [[eth-subscribe|eth_subscribe]] na `newHeads` przez [[websocket-transport|WebSocket]] dostarcza tę samą informację razem z nagłówkiem i bez zbędnych round tripów.",
          "Gdy wynik musi być powtarzalny, numer to tylko punkt wyjścia. Trzeba pobrać blok przez [[eth-get-block-by-number|eth_getBlockByNumber]], zachować jego [[block-hash|hash]] i przekazywać ten hash albo jawny numer do każdego kolejnego wywołania, żeby [[load-balancer|load balancer]], wysyłając następne żądanie do innego backendu, nie mógł po cichu zmienić łańcucha, z którego się czyta."
        ]
      }
    ],
    example: {
      title: "Najtańsze wywołanie w API",
      note: "`0x12d4f1c` to dziesiętnie 19 746 588; trzeba to dekodować jako liczbę całkowitą, a nie porównywać ciągów hex, bo `0x9` i `0x10` nie sortują się poprawnie jako tekst."
    },
    pitfalls: [
      "Traktowanie wyniku jako heada całej sieci; to head jednego węzła, a backend, który został w tyle, zgłasza niższy numer bez żadnego błędu.",
      "Zakładanie, że wartość tylko rośnie, i zapisywanie jej jako trwałego kursora; reorg ją obniża i używa tych samych numerów dla innych bloków.",
      "Uznawanie endpointu za zdrowy, bo wywołanie się udaje; węzeł bez peerów bez końca zwraca ostatnią zaimportowaną wysokość.",
      "Odpytywanie co 200 ms w celu wykrycia nowych bloków, co zużywa rate limit na informację, którą subskrypcja `newHeads` dostarcza w trybie push za darmo."
    ]
  },
  "eth-get-block-by-number": {
    title: "eth_getBlockByNumber / ByHash",
    aliases: [
      "getBlockByNumber",
      "getBlockByHash",
      "eth_getBlockByNumber",
      "eth_getBlockByHash",
      "pobranie bloku",
      "fetch a block",
      "fullTransactions"
    ],
    summary: "`eth_getBlockByNumber` i `eth_getBlockByHash` zwracają jeden obiekt [[block|bloku]], czyli wszystkie pola [[block-header|nagłówka]] plus listę transakcji i wypłat walidatorów (withdrawals), albo `null`, jeśli węzeł nie zna tego bloku.",
    sections: [
      {
        heading: "Parametry i wynik",
        paragraphs: [
          "Każda z tych metod przyjmuje dwa parametry. Pierwszy wskazuje blok: w `eth_getBlockByNumber` to numer albo [[block-tag|tag]], taki jak `latest`, `safe`, `finalized`, `earliest` lub `pending`, a w `eth_getBlockByHash` 32-bajtowy [[block-hash|hash bloku]]. Drugi to boolean, zwykle nazywany `fullTransactions`: `false` zwraca tablicę `transactions` jako same hashe, a `true` zastępuje każdy wpis pełnym obiektem transakcji, takim, jaki zwróciłoby [[eth-get-transaction-by-hash|eth_getTransactionByHash]].",
          "Wynik zawiera nagłówek bez zmian (`parentHash`, `stateRoot`, `transactionsRoot`, `receiptsRoot`, `logsBloom`, `number`, `gasLimit`, `gasUsed`, `timestamp`, `baseFeePerGas`, `withdrawalsRoot`, `blobGasUsed`, `excessBlobGas`, `parentBeaconBlockRoot`, `requestsHash`) oraz wyliczane dodatki: `hash`, `size` w bajtach, `uncles` (zawsze puste od [[the-merge|Merge]]) i `withdrawals`. Bloki po Merge zwracają `difficulty` jako `0x0` i `nonce` jako `0x0000000000000000`, a pole `mixHash` wykorzystują do przenoszenia `prevRandao`. `totalDifficulty` zatrzymało się na wartości końcowej i niektórzy klienci przestali je zwracać."
        ]
      },
      {
        heading: "Jak odpowiada węzeł",
        paragraphs: [
          "Żadna z tych metod nie sięga do [[state|stanu]], więc [[pruned-node|pruned node]] obsłuży każdy blok, który jeszcze przechowuje, równie dobrze jak [[archive-node|węzeł archiwalny]]. Klient zamienia identyfikator na nagłówek, a body bloku wczytuje z bazy bloków tylko wtedy, gdy potrzebna jest lista transakcji. Kosztowne jest przekazanie `true` w `fullTransactions`: ruchliwy blok zawiera kilkaset transakcji, a odpowiedź może przekroczyć megabajt, dlatego providerzy liczą za nią więcej i mogą ją odrzucić w [[batch-request|batchu]].",
          "Węzeł, który zastosował [[history-expiry|history expiry]] (usuwanie starej historii) do danych sprzed Merge, zwraca `null` dla tych starych bloków, choć zwalidował je lata temu. `eth_getBlockByHash` może też zwrócić blok spoza łańcucha kanonicznego: klienci przechowują niedawne bloki z bocznych gałęzi, więc hash z gałęzi, która [[reorg|wypadła w reorgu]], może nadal dać wynik, z `number`, który należy już do innego bloku."
        ]
      },
      {
        heading: "Zastosowanie w praktyce",
        paragraphs: [
          "Standardowa pętla śledzenia heada pobiera `latest` z `fullTransactions` ustawionym na `false`, a potem porównuje `parentHash` nowego bloku z `hash` zapisanym poprzednim razem. Niezgodność oznacza reorg; żeby znaleźć punkt rozwidlenia, trzeba cofać się po `parentHash`, aż hashe znów się zgodzą. To tańsze i pewniejsze niż porównywanie numerów, które powtarzają się w różnych gałęziach.",
          "`timestamp` to deklarowany przez proposera czas slotu w sekundach i zwykły sposób na [[block-by-timestamp|powiązanie bloku z czasem rzeczywistym]]; rośnie o wielokrotności 12 sekund, z lukami w miejscach opuszczonych slotów. Gdy kilka odczytów musi opisywać jeden spójny moment, trzeba wziąć `hash` z tego wywołania i przekazać go jako obiekt [[eip|EIP-1898]] `{\"blockHash\": …}` do [[eth-call|eth_call]] i pozostałych metod odczytu stanu, zamiast powtarzać `latest`."
        ]
      }
    ],
    example: {
      title: "Nagłówek bloku z samymi hashami transakcji",
      note: "Przełączenie booleana na `true` zastępuje każdy hash pełnym obiektem transakcji i może powiększyć odpowiedź ponad megabajt."
    },
    pitfalls: [
      "Żądanie `fullTransactions: true`, gdy potrzebny jest tylko nagłówek; to wielokrotnie zwiększa rozmiar odpowiedzi i koszt u providera za dane, które i tak się wyrzuca.",
      "Traktowanie numeru bloku jako stabilnego klucza; po reorgu ten sam numer wskazuje inny blok, więc obok niego trzeba zapisywać hash.",
      "Traktowanie `mixHash` jako danych mieszania z proof of work; po Merge pole niesie `prevRandao`, czyli losowość warstwy konsensusu dla danego slotu.",
      "Zakładanie, że `null` oznacza, że blok nie istnieje; równie dobrze może to znaczyć, że ten węzeł go usunął przez pruning lub history expiry albo jeszcze tak daleko się nie zsynchronizował.",
      "Oczekiwanie pola `withdrawals` w blokach sprzed Shapella; nie ma go przed aktywacją EIP-4895 w kwietniu 2023 roku."
    ]
  },
  "eth-get-block-receipts": {
    title: "eth_getBlockReceipts",
    aliases: ["getBlockReceipts", "eth_getBlockReceipts", "wszystkie receipty bloku", "receipty całego bloku", "receipty hurtem"],
    summary: "`eth_getBlockReceipts` zwraca wszystkie [[transaction-receipt|receipty]] jednego [[block|bloku]] w jednej tablicy i zastępuje osobne wywołanie [[eth-get-transaction-receipt|eth_getTransactionReceipt]] dla każdej transakcji.",
    sections: [
      {
        heading: "Co robi",
        paragraphs: [
          "Metoda przyjmuje jeden parametr, identyfikator bloku: numer, jeden z [[block-tag|tagów]] `latest`, `safe`, `finalized`, `earliest`, `pending` albo 32-bajtowy [[block-hash|hash bloku]]. Wynikiem jest tablica receiptów w kolejności `transactionIndex`, a każdy z nich ma dokładnie ten sam kształt co wynik [[eth-get-transaction-receipt|eth_getTransactionReceipt]]: `transactionHash`, `transactionIndex`, `blockHash`, `blockNumber`, `from`, `to`, `status`, `gasUsed`, `cumulativeGasUsed`, `effectiveGasPrice`, `contractAddress`, `type`, `logs`, `logsBloom`, a dla transakcji blobowych także `blobGasUsed` i `blobGasPrice`.",
          "Pusty blok zwraca `[]`. Blok, którego węzeł nigdy nie miał, na przykład o numerze wyższym niż jego head, zwraca `null`. To inna odpowiedź i warto ją w kodzie odróżniać. Metoda przeszła w 2023 roku proces standaryzacji w [[execution-apis|execution-apis]], po tym jak klienci wydali niezgodne ze sobą wersje tego samego pomysłu, więc dziś jest częścią specyfikacji, a nie rozszerzeniem klienta."
        ]
      },
      {
        heading: "Jak odpowiada węzeł",
        paragraphs: [
          "[[execution-client|Klienci wykonawczy]] przechowują receipty pogrupowane według bloków, a nie według hasha transakcji. Pobranie jednego receiptu kosztuje więc wyszukanie bloku w indeksie hashy transakcji oraz odczyt listy receiptów całego bloku, z której wszystkie wpisy oprócz jednego są odrzucane. Ta metoda czyta tę listę raz i zwraca ją w całości, więc blok z 300 transakcjami kosztuje mniej więcej jeden odczyt z dysku zamiast 300 wyszukań w indeksie i 300 odczytów tych samych danych. Pola pochodne, takie jak `effectiveGasPrice` i `contractAddress`, są wyliczane od nowa z [[eip-1559|base fee]] bloku i listy transakcji.",
          "Nie jest potrzebny [[state|stan]], tylko historia, więc [[pruned-node|pruned node]] bez problemu obsłuży niedawne bloki. Bloki, których [[receipt-retention|receipty zostały usunięte]] przez [[history-expiry|history expiry]], są niedostępne, a [[geth|Geth]], [[reth|Reth]] i [[nethermind|Nethermind]] sygnalizują to dziś błędem `4444` „Pruned history unavailable”, czyli kodem przypisanym przez specyfikację, a nie wynikiem `null`. Okno indeksu transakcji, które ogranicza `eth_getTransactionReceipt`, tu nie obowiązuje, bo receipty są czytane według bloku, a nie wyszukiwane po hashu transakcji; dlatego ta metoda pozwala dotrzeć do receiptów, które wypadły już z tego indeksu. Odpowiedź jest duża: blok pełen [[event-log|logów]] może zająć kilka megabajtów JSON-a, a taka odpowiedź znacznie częściej niż równoważne pojedyncze wywołania przekracza limity rozmiaru odpowiedzi u providerów."
        ]
      },
      {
        heading: "Zastosowanie w praktyce",
        paragraphs: [
          "Tej metody powinien używać [[indexer|indekser]], który skanuje łańcuch blok po bloku. W połączeniu z [[eth-get-block-by-number|eth_getBlockByNumber]] daje wszystkie transakcje i wszystkie logi bloku w dwóch wywołaniach, a `blockHash` w każdym receipcie pozwala przypisać całość do jednej gałęzi i po [[reorg|reorgu]] atomowo ją wycofać. Dla porównania [[eth-get-logs|eth_getLogs]] zwraca logi z zakresu bloków, ale pomija `status`, `gasUsed` i transakcje, które niczego nie wyemitowały.",
          "Obsługa jest szeroka: implementują ją [[geth|Geth]], [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]] i [[besu|Besu]], ale starsze warstwy gateway i cache przed węzłem czasem jej nie obsługują i odpowiadają `method not found`. Warto sprawdzić ją raz przy starcie, a w razie braku przejść na pobieranie receiptów pojedynczo; zobacz [[endpoint-capabilities|możliwości endpointu]]."
        ]
      }
    ],
    example: {
      title: "Wszystkie receipty bloku w jednym wywołaniu",
      note: "`cumulativeGasUsed` narasta w dół tablicy, więc w ostatnim wpisie równa się `gasUsed` bloku; to dobry sposób, żeby sprawdzić, czy przyszedł cały blok."
    },
    pitfalls: [
      "Traktowanie `[]`, `null` i błędu `4444` jako tej samej odpowiedzi; oznaczają kolejno pusty blok, blok, którego węzeł nigdy nie miał, i blok, którego receipty węzeł usunął.",
      "Ponowne sortowanie tablicy po hashu transakcji albo po indeksie logu; tablica jest już w kolejności wykonania i od tej kolejności zależy `cumulativeGasUsed`.",
      "Używanie `latest` w pętli skanującej; każde wywołanie może zwrócić inny blok i zostawić luki, więc trzeba podawać jawne numery albo hashe.",
      "Zakładanie, że każdy endpoint implementuje tę metodę, i przerywanie pracy na `method not found` zamiast przejścia na receipty pobierane pojedynczo."
    ]
  },
  "eth-get-transaction-by-hash": {
    title: "eth_getTransactionByHash",
    aliases: [
      "getTransactionByHash",
      "eth_getTransactionByHash",
      "wyszukanie transakcji",
      "obiekt transakcji",
      "czy moja transakcja jest pending",
      "transakcja po hashu"
    ],
    summary: "`eth_getTransactionByHash` zwraca obiekt [[transaction|transakcji]] dla 32-bajtowego hasha, także takiej, która wciąż czeka w [[mempool|mempoolu]] węzła (wtedy `blockHash`, `blockNumber` i `transactionIndex` mają wartość `null`), albo `null`, jeśli węzeł nigdy jej nie widział.",
    sections: [
      {
        heading: "Parametry i wynik",
        paragraphs: [
          "Jedynym parametrem jest hash transakcji. Wynik opisuje samą podpisaną wiadomość, a nie skutek jej wykonania: `from`, `to` (`null` przy tworzeniu kontraktu), `value`, `gas` (limit ustawiony przez nadawcę), `input`, `nonce`, `hash`, `chainId`, `type` oraz [[ecdsa-signature|podpis]] jako `r`, `s` i `v` albo `yParity`. Pola opłat zależą od [[transaction-types|typu]]: typy legacy `0x0` i access list `0x1` mają `gasPrice`; `0x2` ma `maxFeePerGas` i `maxPriorityFeePerGas`; `0x3` dodaje `maxFeePerBlobGas` i `blobVersionedHashes`; `0x4` dodaje `authorizationList` dla [[eip-7702|transakcji set code]]. Typy od `0x1` wzwyż mają też `accessList`.",
          "O tym, gdzie jest transakcja, mówią trzy pola. Gdy wszystkie trzy, czyli `blockHash`, `blockNumber` i `transactionIndex`, mają wartość `null`, węzeł trzyma transakcję w mempoolu, ale żaden blok jej nie zawiera. Gdy są ustawione, transakcja jest już w bloku, który ten węzeł w tej chwili uważa za kanoniczny. Pokrewne metody `eth_getTransactionByBlockNumberAndIndex` i `eth_getTransactionByBlockHashAndIndex` pobierają ten sam obiekt według pozycji w bloku, a nie według hasha."
        ]
      },
      {
        heading: "Jak odpowiada węzeł",
        paragraphs: [
          "Klient sprawdza dwa miejsca: mempool oraz indeks na dysku, który mapuje hash transakcji na numer bloku i pozycję w tym bloku. Żadne z nich nie wymaga [[state|stanu]], więc [[pruned-node|pruned node]] odpowie dla każdej zaindeksowanej transakcji. Ten indeks ma jednak ograniczony zasięg. W [[geth|Geth]] ustawia go flaga `--history.transactions`, domyślnie na mniej więcej ostatnie 2 350 000 bloków; dla starszych transakcji węzeł zwraca `null`. Z kolei węzeł, który stosuje [[history-expiry|history expiry]] (usuwanie starej historii), w ogóle nie obsłuży transakcji sprzed Merge. Dla bardzo starych hashy praktycznym źródłem jest [[indexer|indekser]] albo [[block-explorer|eksplorator bloków]].",
          "Dla transakcji blobowej wynik zawiera `blobVersionedHashes`, ale nigdy same bloby. Dane sidecara są w [[consensus-layer|warstwie konsensusu]]: pobiera się je przez endpoint blob sidecars w [[beacon-api|Beacon API]], są przechowywane przez mniej więcej 18 dni i nie trafiają do żadnej odpowiedzi `eth_`. Zobacz [[blob|bloby]]."
        ]
      },
      {
        heading: "Zastosowanie w praktyce",
        paragraphs: [
          "Metoda pozwala odróżnić sytuację „węzeł nigdy nie dostał mojej transakcji” od „transakcja czeka w kolejce”. Po [[eth-send-raw-transaction|eth_sendRawTransaction]] wynik `null` oznacza, że transakcja nie dotarła do mempoolu tego węzła: przepadła, została wyparta z puli albo zapytanie trafia do innego backendu niż ten, do którego ją wysłano; zobacz [[head-lag|spójność head między węzłami]]. Pełny obiekt, w którym `blockNumber` nadal ma wartość `null`, oznacza, że transakcja czeka, zwykle dlatego, że jej opłata jest niższa od bieżącego [[eip-1559|base fee]] albo brakuje niższego [[nonce|nonce]] tego samego nadawcy.",
          "Wynik wykonania, czyli to, czy transakcja się powiodła, ile [[gas|gasu]] zużyła i jakie [[event-log|logi]] wyemitowała, daje dopiero [[eth-get-transaction-receipt|eth_getTransactionReceipt]]. Obiekt transakcji istnieje od chwili, gdy węzeł ją przyjmie; receipt (wynik wykonania transakcji) powstaje dopiero po wykonaniu. Ponowne zakodowanie zwróconego obiektu i policzenie hasha nie zawsze odtworzy oryginalne surowe bajty, więc jeśli transakcję trzeba będzie rozgłosić ponownie, warto zachować podpisaną surową transakcję."
        ]
      }
    ],
    example: {
      title: "Transakcja EIP-1559, która jest już w bloku",
      note: "`input` zaczyna się od 4-bajtowego selektora `0xa9059cbb`, czyli `transfer(address,uint256)`; do jego zdekodowania potrzebne jest [[abi|ABI]], a nie węzeł."
    },
    pitfalls: [
      "Odczytywanie `gas` jako ilości zużytego gasu; to limit wybrany przez nadawcę, a faktyczne zużycie widać jako `gasUsed` w receipcie.",
      "Zakładanie, że wynik inny niż null oznacza transakcję potwierdzoną; transakcja pending to pełny obiekt, w którym trzy pola określające miejsce w bloku mają wartość null.",
      "Oczekiwanie, że z `blobVersionedHashes` da się odzyskać zawartość blobów; bloby są w warstwie konsensusu i wygasają po około 18 dniach.",
      "Odpytywanie puli backendów providera zaraz po wysłaniu, gdzie `null` znaczy tylko tyle, że ten backend nie widział transakcji, a nie że ją odrzucono."
    ]
  },
  "eth-get-transaction-receipt": {
    title: "eth_getTransactionReceipt",
    aliases: [
      "receipt",
      "getTransactionReceipt",
      "eth_getTransactionReceipt",
      "status transakcji",
      "czy moja transakcja weszła do bloku",
      "czy transakcja przeszła"
    ],
    summary: "`eth_getTransactionReceipt` zwraca po hashu [[transaction-receipt|receipt]] (wynik wykonania) [[transaction|transakcji]], która jest już w bloku, albo `null`, dopóki transakcja jest pending lub węzeł jej nie zna.",
    sections: [
      {
        heading: "Co robi",
        paragraphs: [
          "Receipt to zapis węzła o tym, co się stało, gdy transakcja została wykonana w [[block|bloku]]: czy się powiodła (`status` równe `0x1`), czy zakończyła się revertem (`0x0`), ile [[gas|gasu]] zużyła, ile faktycznie zapłaciła za jednostkę gasu (`effectiveGasPrice`), jakie [[event-log|logi]] wyemitowała, a przy wdrożeniu kontraktu także [[address|adres]] nowego kontraktu w `contractAddress`. Receipt istnieje dopiero po wykonaniu, więc ta metoda to podstawowy sposób, by odpowiedzieć na pytanie „czy moja transakcja weszła do bloku i co zrobiła?”.",
          "Jedynym parametrem jest 32-bajtowy hash transakcji, który zwraca [[eth-send-raw-transaction|eth_sendRawTransaction]]. Nie ma parametru bloku: hash identyfikuje jedną transakcję, a węzeł sam ustala, który kanoniczny blok ją zawiera. Jeśli transakcja jest w [[mempool|mempoolu]], ale jeszcze nie w bloku, albo węzeł nigdy jej nie widział, wynikiem jest `null`, a nie [[rpc-errors|błąd]]."
        ]
      },
      {
        heading: "Jak odpowiada węzeł",
        paragraphs: [
          "[[execution-client|Klienci wykonawczy]] utrzymują indeks, który mapuje hash transakcji na numer bloku, żeby to wyszukanie nie wymagało przeglądania łańcucha. Receipty są przechowywane razem dla całego bloku, więc klient wczytuje receipty tego bloku i wybiera ten, który odpowiada indeksowi transakcji. Pola, których nie ma na dysku, takie jak `blockHash`, `transactionIndex` czy `effectiveGasPrice` dla transakcji legacy, są wyliczane w locie. Dlatego też [[eth-get-block-receipts|eth_getBlockReceipts]] jest dużo tańsze niż wywoływanie tej metody osobno dla każdej transakcji, gdy potrzebny jest cały blok.",
          "Niektórzy klienci trzymają indeks transakcji tylko dla niedawnych bloków. W [[geth|Geth]] decyduje o tym flaga `--history.transactions`, domyślnie obejmująca mniej więcej ostatnie 2,35 miliona bloków, czyli około roku; dla starszych transakcji wynik to `null`, chociaż ich blok nadal jest na dysku. Węzły, które zastosowały [[history-expiry|history expiry]] (usuwanie starej historii) do danych sprzed Merge, w ogóle nie zwrócą tych receiptów; do bardzo starej historii potrzebny jest [[archive-node|węzeł archiwalny]] albo [[indexer|indekser]]."
        ]
      },
      {
        heading: "Jak poprawnie potwierdzić transakcję",
        paragraphs: [
          "Otrzymany receipt oznacza, że transakcja jest w bloku, który ten węzeł w tej chwili uważa za kanoniczny. Nie oznacza, że ten blok pozostanie kanoniczny. [[reorg|Reorg]] (reorganizacja łańcucha) może usunąć blok; wtedy to samo wywołanie znowu zwraca `null` albo, gdy transakcja trafi do innego bloku, receipt z innym `blockHash`. Dlatego portfele i backendy odpytują węzeł raz na blok, aż pojawi się receipt, a potem, zanim uznają wynik za przesądzony, czekają na określoną liczbę [[confirmations|potwierdzeń]] albo aż numer bloku będzie mniejszy lub równy numerowi bloku z [[block-tag|tagiem bloku]] `finalized`.",
          "Gdy transakcja jest wysyłana przez jeden endpoint, a odpytywana przez inny za [[load-balancer|load balancerem]], drugi węzeł może jeszcze nie mieć bloku i odpowie `null` dla transakcji, która gdzie indziej jest już w bloku; zobacz [[head-lag|spójność head między węzłami]]. Trzeba odpytywać ten sam węzeł albo tolerować kilka dodatkowych odpowiedzi `null`, zanim wyciągnie się jakiekolwiek wnioski."
        ]
      }
    ],
    example: {
      title: "Receipt udanego transferu ERC-20 (skrócony)",
      note: "`status` i `logs` mówią, co się stało; `blockHash` mówi, gdzie, i właśnie jego porównuje się przy następnym odpytaniu, żeby wykryć reorg."
    },
    pitfalls: [
      "Traktowanie `null` jako porażki. Oznacza ono „jeszcze nie w bloku na tym węźle”; revert to receipt ze `status` równym `0x0`.",
      "Traktowanie `contractAddress` jako dowodu, że kontrakt istnieje. To pole jest wypełniane przy każdej transakcji tworzącej kontrakt, także takiej, która zakończyła się revertem, więc zanim zacznie się polegać na kodzie pod tym adresem, trzeba sprawdzić, czy `status` to `0x1`, albo wywołać `eth_getCode`.",
      "Mylenie `gasUsed` z receiptu (faktyczne zużycie) z `gas` w obiekcie transakcji (limit ustawiony przez nadawcę).",
      "Oczekiwanie pola `status` w receiptach sprzed aktualizacji Byzantium z 2017 roku; zamiast niego mają pole `root`, czyli state root po wykonaniu transakcji."
    ]
  },
  "eth-get-transaction-count": {
    title: "eth_getTransactionCount",
    aliases: [
      "getTransactionCount",
      "eth_getTransactionCount",
      "nonce",
      "następny nonce",
      "next nonce",
      "liczba transakcji",
      "transaction count"
    ],
    summary: "`eth_getTransactionCount` zwraca [[nonce|nonce]] konta na danym bloku, czyli liczbę wysłanych przez nie transakcji, a zarazem nonce, którego musi użyć następna transakcja z tego konta.",
    sections: [
      {
        heading: "Parametry i wynik",
        paragraphs: [
          "Parametry są dwa: 20-bajtowy [[address|adres]] i identyfikator bloku, czyli numer, obiekt [[eip|EIP-1898]] albo jeden z [[block-tag|tagów]] `latest`, `safe`, `finalized`, `earliest`, `pending`. Wynik to [[hex-encoding|QUANTITY]], na przykład `0x1f4`. Nonce zaczyna się od zera i rośnie o jeden z każdą wysłaną transakcją, więc liczba transakcji i następny nonce to ta sama liczba; dlatego portfele wywołują tę metodę przed podpisaniem transakcji.",
          "Wybór tagu całkowicie zmienia znaczenie wyniku. Z `latest` dostaje się nonce wynikający wyłącznie z bloków, które już są w łańcuchu. Z `pending` węzeł liczy też transakcje tego nadawcy czekające w jego własnym [[mempool|mempoolu]], więc odpowiedź to nonce, który nie zderzy się z niczym, co już czeka w kolejce. [[account|Konto]] kontraktu też ma nonce: liczy on wdrożenia wykonane przez kontrakt opcode'em `CREATE`, a od EIP-161 świeżo wdrożony kontrakt zaczyna od `1`."
        ]
      },
      {
        heading: "Jak odpowiada węzeł",
        paragraphs: [
          "Dla bloku historycznego albo `latest` klient odczytuje liść konta ze [[state|stanu]] na tym bloku i zwraca jego pole nonce; to dokładnie to samo wyszukiwanie, które wykonuje [[eth-get-balance|eth_getBalance]]. To więc zapytanie o stan: [[pruned-node|pruned node]] odpowiada dla niedawnych bloków i zwraca błąd dla starych, dla których potrzebny jest [[archive-node|węzeł archiwalny]].",
          "`pending` w ogóle nie jest odczytem stanu. Klient zaczyna od najnowszego stanu i przechodzi po transakcjach nadawcy czekających w jego mempoolu, zatrzymując się na pierwszej luce w [[nonce|nonce]]. Ta odpowiedź jest z definicji lokalna: dwa węzły z różną zawartością mempoolu w tej samej sekundzie zupełnie zasadnie zwracają różne wartości dla tego samego adresu, a węzeł, którego mempool właśnie zrestartowano, zapomina wszystko, co miał w kolejce."
        ]
      },
      {
        heading: "Zastosowanie w praktyce",
        paragraphs: [
          "Standardowa pętla wysyłki wygląda tak: odczyt z `pending`, podpisanie, wysłanie przez [[eth-send-raw-transaction|eth_sendRawTransaction]], lokalna inkrementacja i od nowa. Ponowne czytanie `pending` przed każdą transakcją w serii to wyścig, bo mempool mógł jeszcze nie zarejestrować poprzedniej. Dlatego backend, który wysyła więcej niż jedną transakcję naraz, powinien prowadzić własny licznik, a wartości z RPC używać tylko do ponownej synchronizacji po błędzie lub restarcie.",
          "Dwóch nadawców współdzielących jeden klucz albo jeden nadawca za [[load-balancer|load balancerem]], który rotuje backendy, to klasyczne źródło zablokowanych kolejek: każdy odczyt daje ten sam nonce `pending`, każda transakcja zostaje podpisana, a druga z nich jest odrzucana jako `replacement transaction underpriced`, póki pierwsza jest jeszcze pending, jako `nonce too low`, gdy pierwsza trafi już do bloku, albo po cichu zastępuje pierwszą, jeśli płaci wystarczająco podbitą opłatę. Żeby celowo zastąpić transakcję, trzeba użyć dokładnie jej nonce z podbitą opłatą (fee bump); żeby ją anulować, trzeba wysłać z tym nonce transakcję o zerowej wartości na własny adres."
        ]
      }
    ],
    example: {
      title: "Nonce z łańcucha a nonce uwzględniający mempool",
      note: "To, że wartości różnią się o trzy, oznacza, że ten węzeł trzyma w kolejce trzy transakcje od tego nadawcy; inny węzeł może w tej samej chwili zwrócić dla tego adresu `0x1f4`."
    },
    pitfalls: [
      "Używanie `latest` do wyboru następnego nonce, gdy wcześniejsze transakcje są jeszcze pending; daje to zdublowany nonce i natychmiastowe odrzucenie z `nonce too low`.",
      "Odpytywanie `pending` na puli węzłów providera, gdzie każdy backend ma inny mempool, a odpowiedź zmienia się między wywołaniami.",
      "Wysyłanie serii transakcji z ponownym odczytem nonce za każdym razem zamiast inkrementacji lokalnego licznika; to wyścig z wewnętrzną ewidencją mempoolu.",
      "Tworzenie luki w nonce przez pominięcie wartości; każda późniejsza transakcja z tego konta czeka w kolejce, dopóki brakujący nonce nie zostanie uzupełniony albo mempool ich nie usunie."
    ]
  },
  "eth-get-balance": {
    title: "eth_getBalance",
    aliases: ["getBalance", "eth_getBalance", "saldo", "saldo konta", "saldo ETH", "balance", "ile ETH"],
    summary: "`eth_getBalance` zwraca saldo [[account|konta]] w natywnym etherze, wyrażone w [[wei|wei]] jako [[hex-encoding|QUANTITY]] i odczytane ze [[state|stanu globalnego]] w postaci, jaką miał po wskazanym bloku.",
    sections: [
      {
        heading: "Parametry i wynik",
        paragraphs: [
          "Parametry są dwa: 20-bajtowy [[address|adres]] i identyfikator bloku, czyli numer, obiekt [[eip|EIP-1898]] albo jeden z [[block-tag|tagów]] `latest`, `safe`, `finalized`, `earliest`, `pending`. Wynik to pojedyncza wartość QUANTITY w wei, więc jeden ether wraca jako `0xde0b6b3a7640000`. Adres, który nigdy nie był używany, zwraca `0x0`, a nie `null`; [[evm|EVM]] nie zna pojęcia brakującego konta, tylko konta, którego wszystkie pola są zerowe.",
          "Saldo dotyczy wyłącznie natywnej waluty. Saldo tokena ERC-20 to liczba w [[contract-storage|storage]] kontraktu i odczytuje się je przez [[eth-call|eth_call]] do funkcji `balanceOf` tego kontraktu, a nie tą metodą. Mylenie tych dwóch rzeczy to najczęstszy błąd popełniany przy tej metodzie."
        ]
      },
      {
        heading: "Jak odpowiada węzeł",
        paragraphs: [
          "Klient hashuje adres funkcją [[keccak-256|Keccak-256]], przechodzi [[merkle-patricia-trie|trie stanu]] (albo równoważny płaski indeks, który utrzymuje jego [[client-storage|silnik bazy danych]]) od korzenia, którym jest [[state-root|state root]] danego bloku, i zwraca pole `balance` z liścia konta. To zapytanie o stan, więc koszt zależy od głębokości wyszukiwania, a nie od historii łańcucha, a każde wywołanie to kilka losowych odczytów.",
          "Dlatego głównym ograniczeniem jest retencja danych. [[full-node|Pełny węzeł]] przechowuje stan tylko niedawnych bloków (schemat path-based w [[geth|Geth]] trzyma stan historyczny z mniej więcej 128 ostatnich bloków), więc stary blok zwraca [[rpc-errors|błąd]] `missing trie node` albo `historical state not available`, a nie zero. Historyczne salda wymagają [[archive-node|węzła archiwalnego]], dlatego [[rpc-provider|providerzy]] sprzedają dostęp archiwalny jako osobny plan, a niektórzy ograniczają, jak daleko wstecz sięga. Jeśli odpowiedź ma być zweryfikowana, a nie przyjęta na wiarę, [[eth-get-proof|eth_getProof]] zwraca to samo saldo razem z [[state-proof|dowodem]] względem state root."
        ]
      },
      {
        heading: "Zastosowanie w praktyce",
        paragraphs: [
          "Nie ma metody zwracającej historię salda. Łańcuch przechowuje salda dla każdego bloku, a nie dziennik zmian, a salda zmieniają się z powodów, które nie zostawiają [[event-log|logu]], a czasem nawet transakcji: opłata za gas, priority fee zaksięgowane na rzecz proposera i [[withdrawals|wypłaty walidatorów]] (withdrawals), czyli systemowe wpływy na konto bez receiptu. Odtworzenie historii konta oznacza albo próbkowanie tej metody blok po bloku na węźle archiwalnym, albo odczyt różnic sald z [[trace-api|przestrzeni nazw trace_]] lub [[debug-api|tracera prestate z debug_]].",
          "Wynik trzeba dekodować do liczby całkowitej o dowolnej precyzji. Jeden ether to 10 do potęgi 18 wei, a to przekracza limit 2 do potęgi 53 dla typu number w JavaScripcie, więc `parseInt` po cichu traci precyzję już na zwykłych saldach. Trzeba użyć `BigInt` albo typu dużych liczb z używanej [[client-libraries|biblioteki]], a ciąg hex zachować, jeśli ma być logowany albo porównywany."
        ]
      }
    ],
    example: {
      title: "Saldo przy headzie i na ustalonym bloku",
      note: "Porażka to błąd, a nie `0x0`; węzeł, który nie ma dostępu do stanu, nigdy nie udaje, że konto było puste."
    },
    pitfalls: [
      "Wywoływanie tej metody, żeby odczytać saldo tokena; salda ERC-20 są w storage kontraktu i wymagają `eth_call` do `balanceOf`.",
      "Parsowanie wei do 64-bitowego floata albo przez `parseInt`, co traci precyzję powyżej 2 do potęgi 53 i po cichu psuje zwykłe salda.",
      "Traktowanie błędu na starym bloku jak pustego konta; oznacza on, że węzeł nie ma już tego stanu.",
      "Zakładanie, że każda zmiana salda odpowiada jakiejś transakcji; wypłaty walidatorów zasilają salda bez transakcji i bez receiptu."
    ]
  },
  "eth-get-code": {
    title: "eth_getCode",
    aliases: ["getCode", "eth_getCode", "bytecode", "czy to kontrakt", "kod runtime", "kod kontraktu"],
    summary: "`eth_getCode` zwraca jako DATA bytecode runtime zapisany pod [[address|adresem]] w danym bloku albo `0x`, gdy konto nie ma kodu.",
    sections: [
      {
        heading: "Parametry i wynik",
        paragraphs: [
          "Parametry to adres i identyfikator bloku, czyli ta sama para, którą przyjmuje [[eth-get-balance|eth_getBalance]], a wynikiem jest ciąg DATA z wdrożonymi bajtami. Dla zwykłego [[account|konta EOA]] wynik to `0x`. To typowy sposób sprawdzenia, czy pod adresem jest kontrakt, ale odpowiedź dotyczy jednego bloku: adres może być dziś pusty, a jutro mieć kod, bo `CREATE2` pozwala każdemu w dowolnej chwili wdrożyć kontrakt pod wcześniej wyliczony adres, a każdy istniejący dziś kontrakt został kiedyś wdrożony w jakimś bloku.",
          "Te bajty to kod runtime, a nie kod używany przy [[smart-contract|wdrożeniu kontraktu]]. Argumenty konstruktora i initcode wykonany przy wdrożeniu nie są przechowywane i nie da się ich tu odzyskać; są w polu `input` transakcji wdrażającej. Odkąd w Dencun weszło EIP-6780, `SELFDESTRUCT` usuwa kod tylko wtedy, gdy kontrakt został utworzony w tej samej transakcji. Kontrakt, który wykona `SELFDESTRUCT` po tej aktualizacji, zachowuje więc kod i storage, a kontrakt zniszczony przed Dencun nie ma kodu od tamtego bloku."
        ]
      },
      {
        heading: "Jak odpowiada węzeł",
        paragraphs: [
          "Liść konta w [[state|stanie]] zawiera `codeHash`, a nie sam kod. Klient czyta ten liść w żądanym bloku, a potem wczytuje ciąg bajtów z osobnego magazynu adresowanego treścią (content-addressed), w którym kluczem jest hash [[keccak-256|Keccak-256]]. Dwa identyczne wdrożenia współdzielą więc jedną zapisaną kopię. Pierwszy krok to odczyt stanu, więc zapytania historyczne wymagają historycznego stanu: [[pruned-node|pruned node]] zwraca błąd dla starych bloków dokładnie tak samo jak przy saldach, chociaż sam bytecode zwykle nadal leży na dysku.",
          "Odpowiedź może być duża (EIP-170 ogranicza wdrożony kod runtime do 24 576 bajtów), więc pobieranie kodu dla wielu adresów w pętli to najpierw problem przepustowości, a dopiero potem mocy obliczeniowej. [[caching|Cache]] z kluczem złożonym z adresu i [[block-hash|hasha bloku]] działa tu wyjątkowo dobrze, bo wdrożony kod dla danego adresu i bloku nigdy się nie zmienia."
        ]
      },
      {
        heading: "Delegation designator i zastosowania",
        paragraphs: [
          "Od Pectra konto EOA może wskazywać na kod kontraktu przez [[eip-7702|EIP-7702]]. `eth_getCode` zwraca wtedy dokładnie 23 bajty: trzybajtowy prefiks `0xef0100`, a po nim 20-bajtowy adres, na który konto deleguje. To nie jest kod wykonywalny i nie wolno go deasemblować; to wskaźnik, za którym podąża EVM. Kod, który wnioskuje „długość większa od zera, więc kontrakt”, źle klasyfikuje teraz portfele z delegacją, co ma znaczenie dla przepływów [[erc-4337|abstrakcji kont (account abstraction)]] i dla każdej allowlisty opartej na pytaniu „czy to EOA”.",
          "Drugie częste zastosowanie to weryfikacja wdrożenia przed interakcją z kontraktem: porównanie zwróconych bajtów z kodem runtime, który według kompilatora powinien tam być, albo policzenie ich hasha i porównanie ze znanym `codeHash`. W przypadku proxy dostaje się kod samego proxy, a adres implementacji jest w [[contract-storage|slocie storage]], który odczytuje się przez [[eth-get-storage-at|eth_getStorageAt]]; sam kod tego nie ujawnia."
        ]
      }
    ],
    example: {
      title: "Kontrakt, konto EOA i delegacja EIP-7702",
      note: "Trzeci wynik ma 23 bajty: prefiks `0xef0100` i adres, którego kod to konto wykonuje."
    },
    pitfalls: [
      "Uznawanie `code.length > 2` za oznakę kontraktu; delegation designator EIP-7702 ma 23 bajty, a konto nadal jest kontem EOA.",
      "Oczekiwanie kodu konstruktora albo jego argumentów; przechowywany jest tylko bytecode runtime, a reszta jest w transakcji wdrażającej.",
      "Zapamiętanie w cache na zawsze, że „ten adres nie jest kontraktem”, podczas gdy CREATE2 pozwala później wdrożyć kontrakt dokładnie pod ten adres.",
      "Odczytanie kodu proxy i wniosek, że kontrakt nie ma logiki; implementacja jest pod innym adresem, wskazanym przez slot storage."
    ]
  },
  "eth-get-storage-at": {
    title: "eth_getStorageAt",
    aliases: ["getStorageAt", "eth_getStorageAt", "slot storage", "storage slot", "odczyt zmiennej private", "surowy storage"],
    summary: "`eth_getStorageAt` zwraca surową 32-bajtową wartość z jednego [[contract-storage|slotu storage]] [[account|konta]] w danym bloku, bez dekodowania [[abi|ABI]] i bez żadnej kontroli dostępu.",
    sections: [
      {
        heading: "Parametry i wynik",
        paragraphs: [
          "Trzy parametry: [[address|adres]], indeks slotu jako [[hex-encoding|QUANTITY]] i identyfikator bloku. Wynik to zawsze 32 bajty DATA, dopełnione zerami, a dla slotu, do którego nigdy nic nie zapisano, wynik to `0x0000…0000`. Nic nie odróżnia „nigdy niezapisanego” od „zapisanego zerem”, bo [[state|stan]] nie przechowuje pustych slotów: zapis zera usuwa wpis.",
          "Nie ma tu żadnej prywatności. Słowa kluczowe `private` i `internal` w Solidity ograniczają to, co mogą odczytać inne kontrakty na poziomie EVM; nie ukrywają niczego przed wywołującym RPC, który czyta slot bezpośrednio. Wszystko, co [[smart-contract|kontrakt]] przechowuje, jest publiczne, dlatego sekrety trzyma się off-chain albo ukrywa za commitmentem."
        ]
      },
      {
        heading: "Jak znaleźć slot",
        paragraphs: [
          "Sloty przydziela kompilator w kolejności deklaracji, a małe typy pakuje razem w jedno 32-bajtowe słowo, więc szukana wartość to często fragment zwróconych bajtów, a nie całe słowo. Struktury dynamiczne są hashowane: dla `mapping(address => uint256) balances` w slocie `p` wpis dla klucza `k` leży w Solidity pod `keccak256(pad32(k) . pad32(p))`, a w Vyperze pod `keccak256(pad32(p) . pad32(k))`, natomiast elementy tablicy dynamicznej w Solidity zaczynają się od `keccak256(pad32(p))`. [[storage-slot-discovery|Poprawne wyliczenie tych pozycji]] to najtrudniejsza część korzystania z metody; szczegóły opisuje [[contract-storage|układ storage]].",
          "Niektóre sloty są ustandaryzowane właśnie po to, żeby narzędzia mogły je znaleźć bez kodu źródłowego. EIP-1967 umieszcza adres implementacji [[proxy-contract|proxy]] w slocie `keccak256('eip1967.proxy.implementation') - 1`, czyli pod stałą `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`, a adres admina w slocie wyliczonym w podobny sposób. Odczyt tych slotów to standardowy sposób na ustalenie, na co proxy aktualnie wskazuje."
        ]
      },
      {
        heading: "Jak odpowiada węzeł i kiedy używać tej metody",
        paragraphs: [
          "Klient czyta liść konta w żądanym bloku, żeby dostać jego `storageHash`, a potem szuka `keccak256(slot)` w trie storage tego konta. Jak każdy odczyt stanu, wymaga stanu z tego bloku, więc zapytania historyczne potrzebują [[archive-node|węzła archiwalnego]], a [[pruned-node|pruned node]] odpowiada na nie [[rpc-errors|błędem]] missing trie node. [[eth-get-proof|eth_getProof]] zwraca tę samą wartość razem z [[storage-proof|dowodem storage]], który można zweryfikować względem [[state-root|state root]].",
          "Gdy istnieje getter, lepiej wywołać go przez [[eth-call|eth_call]]: przetrwa upgrade kontraktu i zmiany układu storage, a do tego zwraca zdekodowaną wartość zamiast surowych bajtów. Po surowy storage warto sięgać, gdy gettera nie ma, gdy odczytuje się wskaźnik implementacji proxy, gdy debuguje się wartość, której kontrakt nie udostępnia, albo gdy potrzebna jest wartość z historycznego bloku, a getter kontraktu wtedy jeszcze nie istniał."
        ]
      }
    ],
    example: {
      title: "Slot implementacji proxy i wpis mappingu",
      note: "Oba wyniki mają 32 bajty. Pierwszy to adres implementacji dopełniony z lewej do pełnego słowa, trzymany w slocie sprzed standardu, bo slot EIP-1967 w [[proxy-contract|proxy]] USDC zawiera zero; drugi to 9063377042, czyli 9063,377042 USDC przy sześciu miejscach po przecinku, w słowie, którego najwyższy bit USDC rezerwuje na [[stablecoin-payments|flagę blacklisty]]."
    },
    pitfalls: [
      "Przekonanie, że zmiennej `private` nie da się odczytać; to słowo kluczowe ogranicza inne kontrakty, a nie wywołujących RPC.",
      "Odczytywanie spakowanej struktury albo kilku małych zmiennych jako jednej wartości; kompilator może spakować cztery pola `uint64` w jedno otrzymane słowo.",
      "Zakodowanie na sztywno numerów slotów w kolejnych wersjach upgradowalnego kontraktu, w którym nowa implementacja może przenumerować układ storage.",
      "Traktowanie wyniku z samych zer jako dowodu, że slot jest nieużywany; slot jawnie ustawiony na zero jest przechowywany tak samo jak slot nigdy niezapisany."
    ]
  },
  "eth-get-proof": {
    title: "eth_getProof",
    aliases: ["getProof", "eth_getProof", "EIP-1186", "dowód Merkle", "merkle proof", "dowód konta", "dowód storage"],
    summary: "`eth_getProof` zwraca pola [[account|konta]] wraz z [[merkle-patricia-trie|trie node'ami]], które ich dowodzą, a opcjonalnie to samo dla wskazanych slotów storage, dzięki czemu wywołujący może zweryfikować odpowiedź względem [[state-root|state root]] bloku, zamiast ufać węzłowi.",
    sections: [
      {
        heading: "Parametry i wynik",
        paragraphs: [
          "Metoda zdefiniowana w [[eip|EIP-1186]] przyjmuje trzy parametry: [[address|adres]], tablicę 32-bajtowych kluczy storage (może być pusta) i identyfikator bloku. Obiekt wyniku zawiera `address`, `balance`, `nonce`, `codeHash`, `storageHash`, tablicę `accountProof` oraz tablicę `storageProof` z jednym wpisem na każdy żądany klucz, w którym są `key`, `value` i własny `proof`. Każdy dowód to uporządkowana lista trie node'ów zakodowanych w RLP, od korzenia w dół do liścia.",
          "Pola konta to te same dane, które osobno zwracają [[eth-get-balance|eth_getBalance]], [[eth-get-transaction-count|eth_getTransactionCount]] i [[eth-get-code|eth_getCode]], a każda wartość w `storageProof` odpowiada [[eth-get-storage-at|eth_getStorageAt]]. Różnica polega na tym, że tutaj przychodzą razem z dowodem."
        ]
      },
      {
        heading: "Weryfikacja odpowiedzi",
        paragraphs: [
          "Weryfikacja jest mechaniczna. Hash [[keccak-256|Keccak-256]] adresu daje ścieżkę. `accountProof` przechodzi się od pierwszego node'a w dół, sprawdzając na każdym kroku, czy hash node'a jest równy referencji, którą zawierał poprzedni node, i czy hash pierwszego node'a jest równy `stateRoot` bloku. Liść dekoduje się z RLP do `[nonce, balance, storageRoot, codeHash]`, a te wartości muszą zgadzać się z polami na najwyższym poziomie odpowiedzi. Potem powtarza się to dla każdego klucza storage, z `keccak256(key)` jako ścieżką i `storageHash` jako korzeniem. Klucz, do którego nigdy nic nie zapisano, daje [[exclusion-proof|dowód nieistnienia]]: poprawną ścieżkę, która kończy się przed kluczem i dowodzi, że wartość naprawdę wynosi zero.",
          "To, czego dowodzi weryfikacja, jest wąskie i warto to powiedzieć precyzyjnie. Dowodzi, że wartość należy do [[state|stanu]], którego commitmentem jest ten `stateRoot`. Nie dowodzi, że blok zawierający ten korzeń jest kanoniczny – do tego potrzebny jest [[trusted-header|zaufany nagłówek]] z [[light-client|lekkiego klienta]], z własnego węzła albo z przypiętego sfinalizowanego bloku. Bez niego węzeł mógłby zwrócić całkowicie poprawny dowód względem wymyślonego przez siebie state root. Zobacz [[state-proof|dowód stanu]] i [[verified-rpc|weryfikowane RPC]]."
        ]
      },
      {
        heading: "Dostępność i koszt",
        paragraphs: [
          "To najbardziej wymagający odczyt w całym API. Wygenerowanie dowodu wymaga samego trie, a nie tylko wartości, więc klienci, którzy dla szybkości trzymają dane w płaskim układzie klucz-wartość – [[erigon|Erigon]], [[reth|Reth]], [[besu|Besu]] z Bonsai – muszą odtwarzać trie node'y, żeby odpowiedzieć, a niektórzy potrafią to zrobić tylko dla ostatnich bloków. Bycie [[archive-node|węzłem archiwalnym]] samo w sobie nie gwarantuje historycznych dowodów: zachowywanie historycznych wartości to inna właściwość niż zachowywanie historycznej struktury trie. Wielu [[rpc-provider|providerów]] obsługuje tylko `latest` i płytkie okno, a niektórzy w ogóle nie udostępniają tej metody, więc zanim zaprojektuje się coś wokół niej, trzeba ją sprawdzić. Zobacz [[client-storage|silniki przechowywania danych w klientach]].",
          "Odpowiedź jest też duża: każdy node dowodu ma do 532 bajtów, a ścieżka konta w mainnecie ma zwykle od siedmiu do dziewięciu node'ów głębokości, więc udowodnienie kilku kluczy storage kosztuje kilka kilobajtów. Bridge'e i [[light-client|lekcy klienci]] akceptują ten koszt, bo alternatywą jest wiara na słowo zdalnemu węzłowi. Zwykłe aplikacje nie powinny go ponosić przy odczytach, których nie będą weryfikować."
        ]
      }
    ],
    example: {
      title: "Dowód slotu storage względem state root",
      note: "Klucz to slot implementacji w kontrakcie [[proxy-contract|proxy]] USDC, więc udowodniona wartość to adres implementacji. Pierwszy node z `accountProof` trzeba sprawdzić względem `stateRoot` bloku `0x12d4f1c`, wziętego z nagłówka, któremu już się ufa."
    },
    pitfalls: [
      "Weryfikowanie dowodu względem `stateRoot` otrzymanego od tego samego węzła, co dowodzi tylko, że węzeł jest wewnętrznie spójny.",
      "Zakładanie, że węzeł archiwalny udowodni dowolny historyczny blok; zachowywanie starych wartości i zachowywanie starych trie node'ów to różne możliwości.",
      "Odczytywanie `value` w `storageProof` jako stałych 32 bajtów; to QUANTITY bez zer wiodących, a nie dopełnione słowo.",
      "Traktowanie dowodu nieistnienia jak nieudanego wyszukiwania, a nie jak dowodu, że slot naprawdę wynosi zero."
    ]
  },
  "eth-call": {
    title: "eth_call",
    aliases: ["call", "eth_call", "odczyt kontraktu", "symulacja", "static call", "funkcja view", "wywołanie kontraktu"],
    summary: "`eth_call` wykonuje w [[evm|EVM]] wywołanie (message call) na [[state|stanie]] z wybranego bloku i zwraca surowe bajty wyniku, niczego nie podpisując, nie wydając [[gas|gasu]] i nie zmieniając stanu.",
    sections: [
      {
        heading: "Parametry i wynik",
        paragraphs: [
          "Pierwszym parametrem jest obiekt wywołania. `to` to adres docelowy; `data` (obecni klienci przyjmują je także jako `input`) to calldata zakodowane według [[abi|ABI]]; `from` to pozorny nadawca, którego węzeł przyjmuje na słowo, bo nic nie jest podpisane; `value`, `gas`, `gasPrice` albo para [[eip-1559|EIP-1559]] `maxFeePerGas` i `maxPriorityFeePerGas`, `nonce`, `accessList` i `chainId` są opcjonalne. Drugim parametrem jest identyfikator bloku: numer, obiekt [[eip|EIP-1898]] albo [[block-tag|tag]]. Trzeci, opcjonalny parametr przenosi [[state-override|state override]], szeroko zaimplementowane rozszerzenie.",
          "Wynikiem jest DATA: dokładnie te bajty, które zwróciła wywołana funkcja, bez dekodowania. Funkcja zadeklarowana jako niezwracająca niczego daje `0x` i to samo dostaje się po wywołaniu adresu bez kodu, bo EVM traktuje wywołanie pustego konta jako udaną operację, która nic nie robi. Dekodowanie to zadanie wywołującego i wymaga ABI."
        ]
      },
      {
        heading: "Jak węzeł je wykonuje",
        paragraphs: [
          "Klient buduje środowisko EVM z nagłówka wskazanego bloku, więc `block.number`, `block.timestamp`, `BLOCKHASH`, `PREVRANDAO` i [[eip-1559|base fee]] mają wartości z tego bloku, a [[state|stan globalny]] to stan po wykonaniu tego bloku. Klient wykonuje wywołanie, zbiera wynik i odrzuca zmiany stanu. Nic nie jest rozgłaszane i nie bierze w tym udziału żaden [[mempool|mempool]], więc wywołanie jest niewidoczne dla wszystkich innych węzłów.",
          "Ponieważ nie ma podpisu, `from` może być dowolnym [[address|adresem]], także takim bez etheru. Klienci łagodzą sprawdzanie opłat i salda, gdy pola opłat są pominięte, i dlatego odczyt z adresu zerowego zwykle działa. Wystarczy jawnie podać `gasPrice` albo `maxFeePerGas`, a sprawdzanie salda wraca i wywołania z kontem `from` bez środków zaczynają kończyć się błędem. To częste zaskoczenie, gdy kod używa obiektu transakcji ponownie jako obiektu wywołania.",
          "Limit gasu wyznacza węzeł, a nie wywołujący: [[geth|Geth]] ogranicza wywołanie do `--rpc.gascap`, domyślnie 50 000 000, a do tego dochodzi [[request-cancellation|timeout wykonania]]; inni klienci mają odpowiedniki. Wywołanie na starym bloku wymaga też historycznego stanu, więc [[pruned-node|pruned node]] zwróci błąd i potrzebny jest [[archive-node|węzeł archiwalny]]."
        ]
      },
      {
        heading: "Reverty i zastosowanie w praktyce",
        paragraphs: [
          "[[revert|Revert]] nie jest udanym wynikiem z pustymi danymi. Wraca jako [[rpc-errors|błąd]] JSON-RPC, zwykle z kodem `3` i polem `data` zawierającym bajty revertu: `Error(string)` pod selektorem `0x08c379a0`, `Panic(uint256)` pod `0x4e487b71` albo własny selektor custom errora. Niektórzy providerzy zgłaszają go jednak jako `-32000` z komunikatem `execution reverted` i gubią dane. Kod, który sprawdza tylko, czy przyszedł wynik, myli revert z pustą odpowiedzią.",
          "Ta metoda stoi za niemal każdym odczytem, jaki wykonuje portfel albo dapp: `balanceOf`, `decimals`, rozwiązywanie nazw [[ens|ENS]], [[quoter-contract|wyceny]], sprawdzanie allowance. Aplikacje grupują te odczyty przez kontrakt [[multicall|Multicall3]], który łączy wiele z nich w jedno `eth_call` na jednym bloku i dzięki temu gwarantuje spójny snapshot. Zwykły [[batch-request|batch JSON-RPC]] oszczędza round tripy, ale nie daje spójności, bo każdy wpis jest wykonywany niezależnie, a `latest` może się między nimi przesunąć.",
          "`eth_call` to też tańsza połowa symulacji. Mówi, co transakcja zwróciłaby w tej chwili; nie mówi, ile gasu potrzebuje (od tego jest [[eth-estimate-gas|eth_estimateGas]]) i nie potrafi zamodelować sekwencji transakcji w wielu blokach, do czego służy [[eth-simulate|eth_simulateV1]]."
        ]
      }
    ],
    example: {
      title: "Odczyt salda ERC-20 i wywołanie z revertem",
      note: "Pole `data` to zakodowany w ABI payload revertu: selektor `0x08c379a0` dla `Error(string)`, potem offset, długość i bajty komunikatu."
    },
    pitfalls: [
      "Traktowanie revertu jak pustego wyniku; reverty przychodzą jako obiekt błędu JSON-RPC, a powód jest w `data`, nie w `result`.",
      "Wywołanie adresu bez kodu i odczytanie zwróconego `0x` jako prawdziwej wartości zero; najpierw trzeba to sprawdzić przez [[eth-get-code|eth_getCode]].",
      "Przenoszenie pól opłat z podpisanej transakcji do obiektu wywołania, co z powrotem włącza sprawdzanie salda i sprawia, że odczyty z kont bez środków kończą się błędem.",
      "Wysyłanie kilku powiązanych wywołań z `latest` i łączenie odpowiedzi; head może się między nimi przesunąć, więc trzeba przypiąć jeden numer bloku albo użyć Multicall3."
    ]
  },
  "eth-estimate-gas": {
    title: "eth_estimateGas",
    aliases: ["estimateGas", "eth_estimateGas", "limit gasu", "ile gasu", "szacowanie gasu", "estymacja gasu"],
    summary: "`eth_estimateGas` wielokrotnie wykonuje obiekt wywołania na [[state|stanie]] wybranego bloku, by znaleźć najmniejszy limit [[gas|gasu]], przy którym wywołaniu nie zabraknie gasu, i zwraca tę liczbę jako [[hex-encoding|QUANTITY]].",
    sections: [
      {
        heading: "Parametry i wynik",
        paragraphs: [
          "Pierwszy parametr to ten sam obiekt wywołania, który przyjmuje [[eth-call|eth_call]]: `from`, `to`, `data`, `value` i opcjonalne pola opłat. Identyfikator bloku jest opcjonalny, a klienci różnią się wartością domyślną (jedni przyjmują `latest`, inni `pending`), więc gdy ta różnica ma znaczenie, trzeba go podać jawnie. Część klientów przyjmuje też [[state-override|state overrides]] jako trzeci parametr. Wynik to ilość gasu, na przykład `0xb3d9`, a nie opłata ani cena.",
          "Wywołanie, które kończy się revertem, daje [[rpc-errors|błąd]] o tym samym kształcie co `eth_call`: zwykle kod `3` z bajtami [[revert|revertu]] w `data`. To przydatna cecha, bo estymacja służy przy okazji za sprawdzenie przed wysłaniem (pre-flight check). Oznacza to jednak, że niepowodzenie estymacji i niepowodzenie transakcji są zgłaszane identycznie, a aplikacja musi odróżnić „to wywołanie skończy się revertem” od „węzeł nie zdołał oszacować gasu”."
        ]
      },
      {
        heading: "Jak węzeł to liczy",
        paragraphs: [
          "Klient stosuje wyszukiwanie binarne. Uruchamia wywołanie z wysokim limitem, zwykle równym limitowi gasu RPC ustawionemu w węźle (gas cap), a potem zawęża przedział między zużytą ilością a tym limitem, za każdym razem ponownie wykonując EVM, aż znajdzie najniższy limit, przy którym wywołanie wciąż się udaje. Jedna estymacja kosztuje więc kilka pełnych wykonań. Dlatego to jedna z najdroższych metod odczytu, a [[rpc-provider|providerzy]] w cenniku opartym na [[rate-limits|compute units]] wyceniają ją znacznie wyżej niż [[eth-call|eth_call]].",
          "Odpowiedź to nie po prostu zużyty gas. [[gas-refunds|Reguła 63/64 z EIP-150]] sprawia, że kontrakt przekazujący gas do wywołania podrzędnego musi go dostać więcej, niż ostatecznie wyda, więc wyszukiwanie zbiega się powyżej zużycia, a refundy naliczane po wykonaniu jeszcze bardziej obniżają `gasUsed` w receipcie. Od [[hardfork|Pectra]] EIP-7623 dodaje minimalny koszt calldata (calldata floor), który może dominować w transakcjach z dużą ilością danych."
        ]
      },
      {
        heading: "Dlaczego estymacje się mylą",
        paragraphs: [
          "Estymacja opisuje jeden stan w jednej chwili, a zanim transakcja trafi do bloku, świat idzie dalej. Slot storage, który przy estymacji był zerowy, kosztuje 20 000 gasu przy zapisie, ale tylko 2900 przy aktualizacji, więc cudzy depozyt albo własna wcześniejsza transakcja zmienia wynik. Refundy zmieniają się zależnie od kolejności transakcji, a kontrakty, które rozgałęziają się zależnie od sald, [[price-oracle|cen z wyroczni (oracle)]] albo znaczników czasu bloku, idą zupełnie inną ścieżką.",
          "Praktyczną odpowiedzią jest zapas: portfele zwykle dodają od dziesięciu do trzydziestu procent i pozwalają, by nadwyżka została niewykorzystana, bo niezużyty gas wraca do nadawcy, a niedoszacowanie kosztuje nieudaną transakcję, która i tak płaci za zużyty gas. Zwykłego przelewu etheru za 21 000 gasu nie należy powiększać o zapas, bo jego koszt jest stały. Przy czymś bardziej złożonym trzeba szacować na stanie, który transakcja faktycznie zastanie: z [[block-tag|tagiem]] `pending`, gdy w kolejce czekają własne transakcje, ze [[state-override|state overrides]] dla zatwierdzenia (approve), które jeszcze nie trafiło do bloku, albo przez [[eth-simulate|eth_simulateV1]], gdy wywołania muszą przejść po kolei."
        ]
      }
    ],
    example: {
      title: "Estymacja transferu tokena i estymacja zakończona revertem",
      note: "`0xb3d9` to 46 041 jednostek gasu; mnożenie przez cenę gasu ma sens dopiero wtedy, gdy potrzebna jest opłata, a transakcję wysyła się z limitem nieco wyższym od tej wartości."
    },
    pitfalls: [
      "Wysyłanie transakcji z estymacją jako dokładnym limitem gasu; najmniejsza zmiana stanu kończy się błędem out of gas, a ten i tak kosztuje cały limit.",
      "Mylenie jednostek gasu z opłatą; trzeba je pomnożyć przez cenę gasu z [[eth-fee-history|eth_feeHistory]] albo [[eth-gas-price|eth_gasPrice]].",
      "Estymowanie z `latest`, gdy własne wcześniejsze transakcje wciąż są pending, przez co estymacja zakłada stan, którego te transakcje jeszcze nie wytworzyły.",
      "Ponawianie estymacji w pętli, gdy kończy się revertem; revert jest deterministyczny dla danego stanu, a każda próba kosztuje kilka wykonań."
    ]
  },
  "eth-create-access-list": {
    title: "eth_createAccessList",
    aliases: ["createAccessList", "eth_createAccessList", "access list", "EIP-2930", "ciepłe sloty", "warm slots"],
    summary: "`eth_createAccessList` wykonuje wywołanie, zapisując każdy [[address|adres]] i slot storage, do którego się ono odwołuje, i zwraca ten zbiór jako [[access-list|access listę]] EIP-2930 razem z ilością [[gas|gasu]], jaką wywołanie zużyłoby z dołączoną listą.",
    sections: [
      {
        heading: "Parametry i wynik",
        paragraphs: [
          "Parametry to ten sam obiekt wywołania, który przyjmuje [[eth-call|eth_call]], plus opcjonalny identyfikator bloku. Wynik to obiekt z polem `accessList`, czyli tablicą wpisów `{ address, storageKeys }`, oraz `gasUsed`, czyli gasem zużytym przez wywołanie uruchomione z tą listą. Gdy wywołanie się nie powiedzie, klienci zamiast pustej odpowiedzi dodają pole tekstowe `error` z opisem błędu, a obok niego listę zebraną w miarę możliwości.",
          "Klienci pomijają wpisy, które i tak są ciepłe (warm) z definicji, czyli precompile'y i nadawcę, bo ich deklarowanie kosztuje gas i nic nie daje. Zostaje zbiór kont i [[contract-storage|slotów storage]], do których [[evm|EVM]] sięgnęła w tym wykonaniu na zimno (cold)."
        ]
      },
      {
        heading: "Ile jest warta lista",
        paragraphs: [
          "Rachunek wynika z EIP-2929 i EIP-2930 i jest ciaśniejszy, niż się wydaje. Zimny dostęp do konta kosztuje 2600 gasu; zadeklarowanie adresu kosztuje 2400 z góry i sprawia, że dostęp jest ciepły i kosztuje 100, więc oszczędność wynosi 100 gasu. Zimny `SLOAD` kosztuje 2100; zadeklarowanie slotu kosztuje 1900 plus 100 za ciepły odczyt, co znowu daje 100 oszczędności. Zadeklarowanie czegoś, do czego wywołanie nigdy się nie odwoła, kosztuje pełne 2400 albo 1900 na darmo, więc lista zbudowana na złym stanie łatwo podraża transakcję.",
          "Prawdziwa wartość leży gdzie indziej. Access list sprawia, że koszt wywołania jest przewidywalny bez względu na to, co inne transakcje w bloku wcześniej rozgrzały. Ma to znaczenie dla kontraktów działających blisko swojego limitu gasu, a poza tym na tym mechanizmie opierają się transakcje [[transaction-types|typu 0x1]]. W [[rollup|rollupie]] lista to dodatkowe dane, które trzeba opublikować. Na [[hardfork|mainnecie]] oszczędność jest z założenia niewielka: wpisanie adresu kosztuje 2400 gasu i oszczędza 2500 przy pierwszym dostępie, a wpisanie klucza storage kosztuje 1900 i oszczędza 2000, więc każdy wpis, który i tak byłby ciepły, jak nadawca, odbiorca czy precompile, kosztuje więcej, niż oszczędza."
        ]
      },
      {
        heading: "Jak odpowiada węzeł i kiedy jej używać",
        paragraphs: [
          "Klient uruchamia wywołanie pod tracerem, który zapisuje adresy i sloty, do których się odwołano, a potem uruchamia je ponownie z wynikową listą, by zwrócone `gasUsed` uwzględniało koszt samej listy. To co najmniej dwa pełne wykonania, czyli ta sama klasa kosztu co [[eth-estimate-gas|eth_estimateGas]], a do tego potrzebny jest [[state|stan]] z żądanego bloku, więc stare bloki wymagają [[archive-node|węzła archiwalnego]]. Metodę obsługują [[geth|Geth]], [[nethermind|Nethermind]], [[erigon|Erigon]] i [[reth|Reth]], ale część [[rpc-provider|providerów RPC]] nie ma jej na swojej allowliście.",
          "Lista jest ważna tylko dla stanu, na którym ją wygenerowano. Wywołanie, którego ścieżka zależy od sald, cen albo bieżącej implementacji proxy, po zmianie stanu odwołuje się do innych slotów, więc listę trzeba generować od nowa, a nie cache'ować. Drugie częste zastosowanie jest diagnostyczne: zwrócona lista to zwięzła odpowiedź na pytanie „co ta transakcja naprawdę czyta i zapisuje”, przydatna, zanim sięgnie się po [[debug-api|pełny trace]]."
        ]
      }
    ],
    example: {
      title: "Sloty, do których odwołuje się transfer tokena",
      note: "`0x7050…f8c3` i `0x10d6…390b` to sloty implementacji i admina [[proxy-contract|proxy]] USDC, czytane przy każdym wywołaniu, zanim proxy przekaże wykonanie (delegate) do `0x4350…02dd`, którego własny storage w ogóle nie jest używany; slot 1 przechowuje flagę pauzy, a `0x5e6e…2fcb` i `0xbf49…5f95` to salda odbiorcy i nadawcy. Warto porównać `gasUsed` z tym, co [[eth-estimate-gas|eth_estimateGas]] zwraca bez listy, i nie dołączać listy, jeśli z nią wychodzi więcej."
    },
    pitfalls: [
      "Dołączanie listy bez porównania gasu w obu wariantach; każdy nieużyty wpis kosztuje 2400 albo 1900 gasu i może podrożyć transakcję.",
      "Cache'owanie listy mimo zmian stanu, po których wywołanie odwołuje się do innych slotów, a zadeklarowane sloty są martwym balastem.",
      "Oczekiwanie oszczędności proporcjonalnej do liczby wpisów; każdy trafnie przewidziany zimny dostęp oszczędza tylko około 100 gasu.",
      "Używanie listy w rollupie bez liczenia calldata, gdzie publikacja dodatkowych bajtów zwykle przewyższa zniżkę za ciepły dostęp."
    ]
  },
  "eth-gas-price": {
    title: "eth_gasPrice i eth_maxPriorityFeePerGas",
    aliases: ["gasPrice", "eth_gasPrice", "eth_maxPriorityFeePerGas", "eth_blobBaseFee", "sugerowana opłata", "cena gasu", "napiwek", "tip"],
    summary: "Te bezparametrowe metody zwracają sugestie opłat wyliczone przez sam węzeł: `eth_gasPrice` łączną cenę za jednostkę [[gas|gasu]], `eth_maxPriorityFeePerGas` sam napiwek (priority fee), a `eth_blobBaseFee` bieżącą base fee blobów.",
    sections: [
      {
        heading: "Co zwraca każda z nich",
        paragraphs: [
          "`eth_gasPrice` jest starsza niż [[eip-1559|EIP-1559]] i nadal zwraca jedną wartość QUANTITY w [[wei|wei]]. W sieci z EIP-1559 klient wylicza ją jako base fee następnego bloku plus sugerowany napiwek, więc to odpowiedź w starym formacie na pytanie, które ma dwie części. `eth_maxPriorityFeePerGas` zwraca tylko napiwek, czyli tę połowę, którą naprawdę trzeba zgadnąć. Base fee w ogóle nie trzeba zgadywać, bo jej wartość dla następnego bloku w pełni wynika z nagłówka bieżącego bloku.",
          "`eth_blobBaseFee` zwraca base fee za jednostkę blob gas dla następnego bloku, wyliczoną z `excessBlobGas` w nagłówku. To odpowiednik dla rynku blobów, niezwiązany z ceną gasu za wykonanie; transakcja z [[blob|blobami]] płaci obie opłaty, każdą w innym rodzaju gasu. Wszystkie trzy metody przyjmują pustą tablicę `params` i żadna nie przyjmuje [[block-tag|tagu bloku]]."
        ]
      },
      {
        heading: "Skąd bierze się ta liczba",
        paragraphs: [
          "Nie ma tu żadnej reguły protokołu. Każdy [[execution-client|klient wykonawczy]] próbkuje napiwki faktycznie zapłacone w ostatnich blokach i zwraca ich percentyl, a wielkość próbki, percentyl i dolna granica to konfiguracja, nie konsensus. [[geth|Geth]] udostępnia je przez `--gpo.blocks`, `--gpo.percentile` i `--gpo.maxprice`; inni klienci mają własne ustawienia. Dwa uczciwe węzły w tym samym łańcuchu zwracają więc różne sugestie, a [[rpc-provider|provider RPC]] może całkowicie zastąpić estymator własnym.",
          "Sugestia jest też spóźniona. Opisuje to, co zapłacono w blokach, które już istnieją, a nie to, czego zażąda następny blok, więc wolno reaguje na nagły skok popytu i pozostaje wysoka, gdy ten już minie. W spokojnych okresach dominuje minimum skonfigurowane w kliencie, a odpowiedź w ogóle przestaje śledzić rynek."
        ]
      },
      {
        heading: "W praktyce",
        paragraphs: [
          "W transakcji [[transaction-types|typu 0x2]] napiwek bierze się z `eth_maxPriorityFeePerGas`, `baseFeePerGas` odczytuje się z najnowszego [[block-header|nagłówka bloku]] przez [[eth-get-block-by-number|eth_getBlockByNumber]], a `maxFeePerGas` ustawia się na tyle wysoko, by przetrwało kilka bloków wzrostu base fee. Base fee może rosnąć o 12,5 procent na blok, więc mniej więcej dwukrotność bieżącej base fee plus napiwek wystarcza na kilka bloków. Zawyżone `maxFeePerGas` jest bezpieczne: nadawca płaci `baseFee + min(tip, maxFeePerGas - baseFee)`, a reszta do niego wraca.",
          "Z `eth_gasPrice` warto korzystać tylko przy [[transaction|transakcji]] legacy albo w sieci bez 1559. Do wszystkiego, co ma się dostosowywać do rynku, [[eth-fee-history|eth_feeHistory]] daje surowe dane: base fee kolejnych bloków, ich wypełnienie i percentyle napiwków. Można z nich zbudować estymator, nad którego zachowaniem ma się kontrolę, zamiast dziedziczyć flagi operatora węzła. Na [[l2-rpc|L2]] te metody opisują tylko opłatę za wykonanie na L2 i pomijają koszt danych na L1, który zwykle jest większą częścią."
        ]
      }
    ],
    example: {
      title: "Trzy sugestie opłat z jednego węzła",
      note: "Różnica między dwoma pierwszymi wynikami to następna base fee w ocenie tego węzła; lepiej odczytać ją bezpośrednio z najnowszego nagłówka, zamiast odejmować."
    },
    pitfalls: [
      "Ustawianie `maxFeePerGas` na wartość z `eth_gasPrice`, co nie zostawia zapasu i sprawia, że transakcja utyka, gdy tylko base fee wzrośnie.",
      "Traktowanie sugestii jako liczby dla całej sieci; to percentyl liczony przez jeden węzeł z jego własnej niedawnej historii, a operatorzy stroją go flagami.",
      "Używanie `eth_gasPrice` w rollupie do szacowania całkowitego kosztu, co pomija opłatę za dane na L1, która zwykle dominuje.",
      "Dodawanie `eth_blobBaseFee` do ceny gasu za wykonanie; blob gas to osobny rynek z własnymi jednostkami i własnym budżetem."
    ]
  },
  "eth-fee-history": {
    title: "eth_feeHistory",
    aliases: ["feeHistory", "eth_feeHistory", "estymator opłat", "historia base fee", "percentyle napiwków", "reward percentiles"],
    summary: "`eth_feeHistory` zwraca dla okna ostatnich bloków [[eip-1559|base fee]] każdego z nich, stopień ich wypełnienia i wybrane percentyle faktycznie zapłaconych napiwków (priority fee). To surowe dane dla estymatora opłat.",
    sections: [
      {
        heading: "Parametry i wynik",
        paragraphs: [
          "Metoda ma trzy parametry: `blockCount` jako [[hex-encoding|QUANTITY]] (specyfikacja ogranicza go do 1024, a [[rpc-provider|provider RPC]] zwykle do mniejszej wartości), `newestBlock` jako numer lub [[block-tag|tag]] oraz `rewardPercentiles`, czyli rosnącą tablicę zwykłych liczb JSON od 0 do 100. Pusta tablica albo pominięcie tego parametru pozwala ominąć najdroższą część zapytania.",
          "Wynik zawiera `oldestBlock` i cztery tablice. `baseFeePerGas` ma `blockCount + 1` elementów, bo ostatni to base fee bloku, który następuje po `newestBlock`. Ta wartość wynika już z nagłówka i jako jedyna wartość opłaty w całym API jest faktem, a nie szacunkiem. `gasUsedRatio` zawiera jedną liczbę zmiennoprzecinkową na blok: część limitu [[gas|gasu]], która została zużyta. `reward` zawiera jedną tablicę na blok, z jednym elementem na każdy żądany percentyl. Od Dencun `baseFeePerBlobGas` i `blobGasUsedRatio` są odpowiednikami dwóch pierwszych tablic dla rynku [[blob|blobów]]."
        ]
      },
      {
        heading: "Jak odpowiada węzeł",
        paragraphs: [
          "Base fee i stopień zużycia gasu pochodzą wprost z [[block-header|nagłówków bloków]], więc ta połowa jest prawie darmowa. Tablice `reward` już nie: dla każdego bloku klient musi wczytać receipty albo transakcje, obliczyć efektywny napiwek każdej transakcji, posortować je według tej wartości i wybrać żądane percentyle. Klienci cache'ują obliczone percentyle dla każdego bloku, ale zapytanie o tysiąc bloków z kilkoma percentylami, dla którego nic nie ma jeszcze w cache, to realna praca. Dlatego providerzy liczą za nie znacznie więcej niż za odczyt nagłówka i agresywnie ograniczają `blockCount`.",
          "Okno może też sięgać dalej wstecz niż dane, które węzeł przechowuje. [[pruned-node|Pruned node]] albo węzeł z włączonym [[history-expiry|wygasaniem historii (history expiry)]] nie wyliczy percentyli napiwków dla bloków, których receipty już usunął, i klienci reagują obcięciem odpowiedzi: `oldestBlock` wraca późniejszy niż żądany, a tablice są krótsze niż `blockCount`. Pętlą zawsze trzeba sterować na podstawie `oldestBlock` i długości tablic, nigdy liczby, o którą się prosiło."
        ]
      },
      {
        heading: "Budowa estymatora",
        paragraphs: [
          "Sensowny estymator prosi o 10 do 20 bloków z percentylami w rodzaju `[10, 50, 90]`, odrzuca bloki, których `gasUsedRatio` wynosi zero (pusty blok nic nie mówi o popycie), i bierze percentyl zebranych napiwków jako `maxPriorityFeePerGas`. Dla `maxFeePerGas` punktem wyjścia jest ostatni element `baseFeePerGas`, czyli faktyczna base fee następnego bloku, pomnożony przez współczynnik pokrywający tyle bloków, ile jest się gotowym czekać. Base fee może się bowiem zmienić o najwyżej 12,5 procent na blok, by sprowadzić wypełnienie bloków do celu 50 procent.",
          "To odczyt `gasUsedRatio` odróżnia to podejście od [[eth-gas-price|eth_gasPrice]]. Wartości bliskie 1,0 oznaczają, że base fee wciąż rośnie i przy niskim `maxFeePerGas` [[transaction|transakcja]] utknie; wartości bliskie 0,3 oznaczają, że base fee spada i można licytować blisko bieżącej wartości. Portfele i [[client-libraries|biblioteki]] budują domyślną logikę opłat właśnie na tym wywołaniu."
        ]
      }
    ],
    example: {
      title: "Cztery bloki z percentylami napiwków",
      note: "`baseFeePerGas` ma pięć elementów dla czterech bloków; ostatni to base fee następnego bloku i od niego należy liczyć `maxFeePerGas`."
    },
    pitfalls: [
      "Indeksowanie `baseFeePerGas` i `gasUsedRatio` jednym indeksem, jakby miały tę samą długość; pierwsza tablica jest o jeden element dłuższa, a ten ostatni element dotyczy przyszłego bloku.",
      "Zakładanie, że dostało się `blockCount` bloków; węzeł, który nie sięga tak daleko wstecz, obcina odpowiedź i zwraca późniejszy `oldestBlock`.",
      "Wysyłanie `rewardPercentiles` jako ciągów hex; to zwykłe liczby JSON, które muszą być ściśle rosnące, inaczej węzeł odrzuci żądanie.",
      "Uśrednianie napiwków razem z pustymi blokami, co ściąga estymację w stronę zera za sprawą bloków bez żadnych transakcji."
    ]
  },
  "eth-send-raw-transaction": {
    title: "eth_sendRawTransaction",
    aliases: [
      "sendRawTransaction",
      "eth_sendRawTransaction",
      "broadcast",
      "wysłanie transakcji",
      "rozgłoszenie transakcji",
      "wysyłanie podpisanej transakcji"
    ],
    summary: "`eth_sendRawTransaction` przekazuje węzłowi jedną, już podpisaną [[transaction|transakcję]] jako surowe bajty; węzeł ją waliduje, umieszcza w swoim [[mempool|mempoolu]], rozgłasza do peerów i zwraca hash transakcji.",
    sections: [
      {
        heading: "Parametr i wynik",
        paragraphs: [
          "Jedyny parametr to DATA: zakodowana w [[rlp|RLP]] transakcja legacy albo, dla nowszych typów, [[transaction-types|format transakcji typowanych (typed transaction envelope)]] `0x02…`, `0x03…`, `0x04…`. Podpisywanie odbywa się w całości po stronie wywołującego, więc węzeł nigdy nie widzi klucza prywatnego i nie może zmienić ani jednego bajtu bez unieważnienia [[ecdsa-signature|podpisu]]. To jedyna metoda zapisu, jaką powinien udostępniać zwykły endpoint.",
          "Po sukcesie wynikiem jest 32-bajtowy hash transakcji. Ten hash to [[keccak-256|Keccak-256]] dokładnie tych bajtów, które zostały wysłane, więc można go obliczyć przed wywołaniem i nie trzeba czekać na odpowiedź, by go znać. Zwrócona wartość oznacza „przyjęta do mempoola tego węzła” i nic więcej: żadnego bloku, żadnego wykonania, żadnego sukcesu. O tym, czy transakcja trafiła do bloku i jak się wykonała, informuje dopiero [[eth-get-transaction-receipt|eth_getTransactionReceipt]]."
        ]
      },
      {
        heading: "Co sprawdza węzeł",
        paragraphs: [
          "Przed przyjęciem klient weryfikuje podpis i odzyskuje z niego nadawcę, porównuje `chainId` z własnym i odrzuca [[nonce|nonce]] niższy niż bieżący nonce konta z błędem `nonce too low`. Wymaga, by saldo nadawcy pokryło `gas × maxFeePerGas + value` (`insufficient funds for gas * price + value`), by limit gasu był co najmniej równy kosztowi intrinsic (`intrinsic gas too low`) i nie większy niż limit gasu bloku, a opłaty nie były niższe niż minimum mempoolu (`transaction underpriced`). Ponowne wysłanie tych samych bajtów daje `already known`, a zastąpienie transakcji z tym samym nonce, która jest już w mempoolu, bez dostatecznie dużej podwyżki opłaty daje `replacement transaction underpriced`.",
          "Wszystko to jest polityką mempoola nałożoną na reguły konsensusu i różni się między klientami i [[rpc-provider|providerami RPC]]; transakcję, której `maxFeePerGas` jest niższe od bieżącej base fee, jedni przetrzymają, a inni odrzucą. Żadne z tych sprawdzeń nie przewiduje wykonania: transakcja, która skończy się revertem, zostanie przyjęta, trafi do bloku i zapłaci za [[gas|gas]] dokładnie tak samo jak udana."
        ]
      },
      {
        heading: "Rozgłaszanie, ponowienia i prywatność",
        paragraphs: [
          "Przyjęcie uruchamia propagację przez [[devp2p|devp2p]] do kilku peerów, które przekazują transakcję dalej. Węzeł bez peerów przyjmie transakcję i nikomu o niej nie powie. Hash wynika z bajtów, więc wywołanie jest idempotentne: jeśli odpowiedź zginie, ponowne wysłanie identycznego payloadu albo znowu się powiedzie, albo zwróci `already known`, a jedno i drugie znaczy to samo. Dzięki tej właściwości [[retries|ponowienia (retry)]] są tu bezpieczne, choć w większości API zapisu nie są.",
          "Wysłanie do publicznego endpointu ujawnia zamiar, zanim transakcja trafi do bloku, i to właśnie umożliwia ataki sandwich; zobacz [[mev|MEV]]. Endpointy [[private-rpc|prywatnego RPC dla transakcji]] przyjmują tę samą metodę, ale kierują transakcje do builderów. Na [[l2-rpc|L2]] transakcja zwykle trafia bezpośrednio do [[sequencer|sekwencera]], dlatego wysyłanie na L2 wydaje się natychmiastowe, ale transakcja nie ma finalności, dopóki batch nie zostanie rozliczony na L1."
        ]
      }
    ],
    example: {
      title: "Wysłanie podpisanej transakcji i jej odrzucenie",
      note: "Spacje w payloadzie służą tu tylko czytelności; prawdziwy parametr to jeden nieprzerwany ciąg `0x`."
    },
    pitfalls: [
      "Traktowanie zwróconego hasha jako znaku, że transakcja jest już w bloku; oznacza on tylko, że węzeł przyjął bajty do mempoola, a transakcja wciąż może zostać [[transaction-lifecycle|wyrzucona, zastąpiona albo zakończyć się revertem]].",
      "Traktowanie `already known` jako błędu i ponowne podpisywanie z nowym nonce, co tworzy drugą transakcję, która konkuruje z pierwszą.",
      "Wysyłanie przez jeden endpoint i odpytywanie o receipt innego, za którym stoi węzeł, który jeszcze nie widział tej transakcji.",
      "Oczekiwanie, że węzeł odrzuci transakcję, która skończy się revertem; walidacja w mempoolu sprawdza środki i kodowanie, nigdy wynik wykonania."
    ]
  },
  "eth-send-transaction": {
    title: "eth_sendTransaction",
    aliases: ["sendTransaction", "eth_sendTransaction", "odblokowane konto", "unlocked account", "podpisywanie po stronie węzła"],
    summary: "`eth_sendTransaction` prosi węzeł, by uzupełnił, podpisał i rozgłosił [[transaction|transakcję]] kluczem prywatnym, który przechowuje dla [[address|adresu]] `from`. Dlatego prawie żaden publiczny endpoint jej nie implementuje.",
    sections: [
      {
        heading: "Co robi",
        paragraphs: [
          "Parametrem jest obiekt transakcji: `from`, `to`, `value`, `data` i opcjonalnie `gas`, `nonce` oraz pola opłat. Wszystko, czego brakuje, węzeł uzupełnia sam: ustala [[nonce|nonce]] z uwzględnieniem transakcji pending, szacuje [[gas|gas]] i dobiera opłatę, po czym podpisuje transakcję kluczem dla `from` i ją wysyła. Wynikiem jest hash transakcji, dokładnie taki, jaki zwraca [[eth-send-raw-transaction|eth_sendRawTransaction]].",
          "Warunkiem jest to, że węzeł przechowuje ten klucz i go odblokował. To rozwiązanie z czasów, gdy prowadzenie własnego węzła i trzymanie kluczy w jego keystore były jednym i tym samym. Sprawia ono, że port RPC jest równoważny kluczowi prywatnemu: każdy, kto do niego dotrze, może przenieść środki, a od wywołującego nie jest wymagany żaden podpis."
        ]
      },
      {
        heading: "Dlaczego jest wyłączona",
        paragraphs: [
          "Każde poważne wdrożenie ją wyłącza. [[rpc-provider|Provider RPC]] nie ma kluczy do kont użytkowników i nie mógłby podpisać, nawet gdyby chciał, więc odpowiada [[rpc-errors|błędem]] method not found. [[geth|Geth]] najpierw oznaczył jako przestarzałe, a potem usunął swoje metody zarządzania kontami `personal_` na rzecz zewnętrznego signera Clef, a wystawianie odblokowanego konta przez HTTP od dawna jest jednym z pierwszych punktów każdej checklisty [[security|zabezpieczania RPC]]. Jeśli jakiś endpoint podpisuje transakcje za wywołującego, ktoś popełnił poważny błąd.",
          "Wzorzec, który ją zastąpił, stosuje dziś każdy portfel i backend: zbudować transakcję, podpisać ją lokalnie kluczem, którego węzeł nigdy nie widzi, i wysłać bajty przez `eth_sendRawTransaction`. Na tym podziale opierają się signery po stronie serwera, portfele sprzętowe i usługi zdalnego podpisywania, i właśnie dlatego ścieżka zapisu w API to jedna metoda przyjmująca nieprzezroczyste bajty."
        ]
      },
      {
        heading: "Gdzie wciąż występuje",
        paragraphs: [
          "Portfele w przeglądarce utrzymują tę nazwę przy życiu. Dapp wywołuje `eth_sendTransaction` przez [[eip-1193|provider EIP-1193]], ale portfel nie jest węzłem: przechwytuje żądanie, prosi użytkownika o zatwierdzenie, podpisuje własnym kluczem i przekazuje surowe bajty do swojego endpointu RPC. Nazwa metody jest ta sama, a model zaufania zupełnie inny, co regularnie myli przy czytaniu dokumentacji portfeli obok dokumentacji węzłów. Pozostałe żądania portfela opisują [[wallet-rpc|metody wallet_]].",
          "[[local-devnet|Lokalne węzły deweloperskie]] też ją implementują i tam jest to wygoda, a nie ryzyko. Anvil i symulowane sieci Hardhata startują z odblokowanymi kontami zasilonymi środkami, więc skrypty i kod testujący mogą wysyłać transakcje bez zarządzania kluczami, a każde z tych narzędzi dodaje impersonację, która pozwala wysyłać transakcje jako dowolny adres na [[fork-testing|forku łańcucha]]. Kod napisany pod tę wygodę przestaje działać w chwili, gdy zostanie skierowany na prawdziwy endpoint."
        ]
      }
    ],
    example: {
      title: "Przyjęta przez węzeł deweloperski, odrzucona przez providera",
      note: "Kod, który działa na lokalnym devnecie, a na produkcji kończy się błędem `-32601`, prawie zawsze polega na podpisywaniu po stronie węzła."
    },
    pitfalls: [
      "Pisanie skryptów pod odblokowane konta węzła deweloperskiego i odkrycie na produkcji, że żaden prawdziwy endpoint niczego nie podpisze.",
      "Odblokowanie konta na węźle z osiągalnym portem RPC, co oddaje uprawnienia klucza każdemu, kto może wysłać do niego żądanie.",
      "Mylenie `eth_sendTransaction` portfela z metodą węzła; portfel podpisuje w przeglądarce i przekazuje dalej surowe bajty.",
      "Zostawianie węzłowi wyboru nonce i opłat dla serii transakcji, co prowadzi do wyścigu z jego własną ewidencją transakcji pending."
    ]
  },
  "eth-get-logs": {
    title: "eth_getLogs",
    aliases: ["getLogs", "eth_getLogs", "logi", "eventy", "filtrowanie logów", "topics"],
    summary: "`eth_getLogs` zwraca wszystkie [[event-log|logi]] z zakresu bloków, które pasują do filtra po emitującym [[address|adresie]] i indeksowanych topics, jako płaską tablicę w kolejności łańcucha.",
    sections: [
      {
        heading: "Obiekt filtra",
        paragraphs: [
          "Jeden parametr: obiekt z najwyżej pięcioma polami. `fromBlock` i `toBlock` wyznaczają zakres i przyjmują numery albo [[block-tag|tagi]]; pominięte przyjmują domyślnie `latest`. `address` zawęża wyniki do jednego emitującego kontraktu albo, jako tablica, do kilku. `topics` to tablica z najwyżej czterema pozycjami. `blockHash`, dodane w EIP-234, wskazuje dokładnie jeden blok i nie można go łączyć z polami zakresu.",
          "Dopasowanie topics jest pozycyjne i łatwo je zrozumieć na odwrót. Pozycja `i` dopasowuje `topics[i]` logu, `null` na pozycji pasuje do wszystkiego, pojedyncza wartość musi pasować dokładnie, a tablica na pozycji oznacza OR. Między pozycjami warunki łączy AND. `topics[0]` to zwykle [[event-signature|hash sygnatury eventu]], a pozycje od 1 do 3 to parametry indeksowane, więc `[sigHash, null, [aliceTopic, bobTopic]]` oznacza „ten event, dowolny nadawca, odbiorca Alice lub Bob”. Filtr z mniejszą liczbą pozycji, niż log ma topics, nadal pasuje.",
          "Każdy zwrócony log zawiera `address`, `topics`, `data`, `blockNumber`, `blockHash`, `transactionHash`, `transactionIndex`, `logIndex` i `removed`. W `eth_getLogs` flaga `removed` ma zawsze wartość `false`, bo metoda raportuje tylko łańcuch kanoniczny; `true` pojawia się wyłącznie w wynikach [[eth-filters|filtrów]] i powiadomieniach [[eth-subscribe|subskrypcji]], gdzie [[reorg|reorg]] może wycofać log, który już został dostarczony."
        ]
      },
      {
        heading: "Jak odpowiada węzeł",
        paragraphs: [
          "Logi nie leżą w tabeli, którą można odpytywać; są zapisane wewnątrz [[transaction-receipt|receiptów]]. Klasyczny algorytm sprawdza 2048-bitowy [[logs-bloom|logs bloom]] każdego [[block-header|nagłówka bloku]] pod kątem żądanego adresu i topics i tylko dla bloków, które mogą pasować, wczytuje receipty i filtruje je dokładnie. Bloom daje fałszywe trafienia, ale nigdy niczego nie przeocza, więc jedynym kosztem są zbędne odczyty receiptów. Kilku klientów utrzymuje dziś [[log-index|dodatkowy indeks]] adresów i topics, żeby szeroki zakres nie musiał dotykać każdego nagłówka: [[geth|Geth]] domyślnie dla niedawnego okna około 2,35 miliona bloków (`--history.logs`), [[erigon|Erigon]] w postaci indeksów odwróconych, a [[nethermind|Nethermind]] tylko wtedy, gdy ustawiono `--LogIndex.Enabled`. [[reth|Reth]] nadal skanuje bloomy nagłówków. Tak czy inaczej praca rośnie z szerokością zakresu i z tym, jak częste są szukane topics.",
          "Metoda potrzebuje historii, a nie [[state|stanu]], więc [[pruned-node|pruned node]] odpowiada w zakresie receiptów, które zachował. Węzeł stosujący [[history-expiry|history expiry]] odpowiada dziś na zakres zaczynający się poniżej jego granicy błędem `4444` „Pruned history unavailable”, tak jak robią to Geth i Reth. Geth po cichu traktuje jednak `fromBlock: earliest` jako najstarszy blok, jaki zachował, a starsza wersja klienta albo gateway wciąż może zwrócić `[]`, co wygląda dokładnie jak „brak pasujących eventów”, dopóki nie porówna się zakresu z tym, co węzeł faktycznie przechowuje. Przez tę dwuznaczność poważne [[indexer|indeksery]] niezależnie weryfikują pokrycie swoich zakresów."
        ]
      },
      {
        heading: "Limity i wzorce skanowania",
        paragraphs: [
          "To metoda, którą [[rpc-provider|dostawcy RPC]] ograniczają najbardziej. Typowe limity to maksymalna rozpiętość zakresu, często od 2000 do 10 000 bloków, maksymalna liczba zwracanych logów, często 10 000, oraz timeout liczony w czasie rzeczywistym; każdy z nich zgłaszany jest osobnym [[rpc-errors|błędem]], na przykład `query returned more than 10000 results` albo `block range is too large`. Niefiltrowane zapytanie o szeroki zakres to najtańszy sposób, żeby węzeł przestał odpowiadać, więc własne węzły też je ograniczają.",
          "Odporny wzorzec jest adaptacyjny: skanuje się w stałych oknach, przy błędzie limitu zmniejsza okno o połowę, po serii udanych zapytań znów je poszerza i trwale zapisuje kursor, czyli ostatni w pełni przetworzony blok i jego hash. Kursora nigdy nie przesuwa się do `latest`; zatrzymuje się go kilka [[confirmations|potwierdzeń]] wcześniej albo na tagu `finalized`, żeby reorg nie mógł wycofać logów, które już zostały zapisane na stałe. Zobacz [[cursor-pagination|paginację kursorem i zakresem]].",
          "Gdy potrzebny jest pełny wynik, a nie tylko eventy, lepszym narzędziem jest [[eth-get-block-receipts|eth_getBlockReceipts]]: daje `status`, `gasUsed` i transakcje, które niczego nie wyemitowały, a tego wszystkiego ta metoda z założenia nie zwraca."
        ]
      }
    ],
    example: {
      title: "Transfery ERC-20 do jednego z dwóch odbiorców",
      note: "`topics[1]` to `null`, więc pasuje dowolny nadawca; tablica w `topics[2]` to OR po dwóch odbiorcach, obu dopełnionych zerami z lewej do 32 bajtów."
    },
    pitfalls: [
      "Czytanie tablic topics jako OR po całym filtrze; pozycje łączy AND, a OR dotyczy tylko wartości w obrębie jednej pozycji.",
      "Filtrowanie po dynamicznym parametrze indeksowanym, takim jak `string`; topic zawiera jego hash Keccak, więc przed porównaniem trzeba policzyć hash.",
      "Przesuwanie kursora indeksera do `latest`, co zapisuje na stałe logi, które reorg wciąż może wycofać.",
      "Traktowanie pustego wyniku dla starego zakresu jako „brak eventów”, gdy węzeł może po prostu nie mieć już tych receiptów."
    ]
  },
  "eth-filters": {
    title: "Filtry z odpytywaniem (polling)",
    aliases: [
      "eth_newFilter",
      "eth_getFilterChanges",
      "eth_newBlockFilter",
      "eth_newPendingTransactionFilter",
      "eth_uninstallFilter",
      "eth_getFilterLogs",
      "id filtra",
      "filtry polling"
    ],
    summary: "Filtry to kursory po stronie serwera: instaluje się je przez `eth_newFilter`, `eth_newBlockFilter` albo `eth_newPendingTransactionFilter`, a potem wywołuje `eth_getFilterChanges`, żeby dostać tylko to, co pojawiło się od poprzedniego odpytania.",
    sections: [
      {
        heading: "Sześć metod",
        paragraphs: [
          "`eth_newFilter` przyjmuje ten sam obiekt filtra co [[eth-get-logs|eth_getLogs]] i zwraca nieprzezroczyste id, na przykład `0x1a4b…`. `eth_newBlockFilter` i `eth_newPendingTransactionFilter` nie przyjmują parametrów i zamiast logów obserwują nowe [[block|bloki]] i nowe wpisy w mempoolu. `eth_getFilterChanges` przyjmuje id i zwraca tablicę wszystkiego, co nowe: obiekty [[event-log|logów]] dla filtra logów, [[block-hash|hashe bloków]] dla filtra bloków i hashe transakcji dla filtra pending. `eth_getFilterLogs` zwraca wszystko, co pasuje do filtra logów od początku jego zakresu, z pominięciem kursora. `eth_uninstallFilter` usuwa filtr i zwraca boolean.",
          "Sens tego projektu polega na tym, że [[http-transport|HTTP]] nie działa w trybie push. Serwer, który nie może sam otworzyć połączenia do klienta, może za to pamiętać, gdzie klient skończył, więc odpytywanie staje się tanie: drugie i kolejne wywołania przesyłają tylko różnicę, zamiast ponownie wykonywać całe zapytanie. W przeciwieństwie do `eth_getLogs` wyniki filtra logów mogą zawierać wpisy z `removed` ustawionym na `true`, które wycofują wcześniej dostarczone logi, przepisane potem przez [[reorg|reorg]]."
        ]
      },
      {
        heading: "Filtr żyje po stronie serwera",
        paragraphs: [
          "Id filtra istnieje w pamięci jednego procesu na jednym węźle. Ten jeden fakt wyjaśnia wszystkie problemy operacyjne z filtrami. Za [[load-balancer|load balancerem]] albo [[rpc-gateway|gatewayem RPC]], który rozkłada żądania na pulę węzłów, odpytanie zwykle trafia do węzła, który nigdy nie słyszał o tym id, i dostaje odpowiedź `filter not found`. Żeby filtry działały przez wspólny endpoint, potrzebny jest sticky routing (kierowanie klienta zawsze do tego samego węzła), a większość hostowanych endpointów go nie oferuje.",
          "Filtry też wygasają. Klienci usuwają filtr, którego nikt nie odpytywał przez kilka minut ([[geth|Geth]] domyślnie czeka pięć), a restart węzła usuwa wszystkie naraz. Odzyskanie oznacza instalację nowego filtra, który zaczyna od bieżącego head i po cichu pomija wszystko, co wydarzyło się w przerwie, więc konsument, który nie może gubić danych, musi uzupełnić brakujący zakres przez `eth_getLogs`, a nie tylko ponownie zainstalować filtr. Każdy otwarty filtr kosztuje też węzeł pamięć, dlatego endpointy ograniczają liczbę filtrów, które może trzymać jeden klient."
        ]
      },
      {
        heading: "Kiedy ich używać",
        paragraphs: [
          "Filtrów warto używać, gdy dostępne jest tylko HTTP do jednego znanego węzła, na przykład w skrypcie, który rozmawia z `http://127.0.0.1:8545`, albo w sieci firmowej, która zabrania długotrwałych połączeń. W takich warunkach są naprawdę wydajniejsze niż ponowne wykonywanie zapytania o zakres co kilka sekund.",
          "W pozostałych przypadkach lepiej wybrać [[eth-subscribe|eth_subscribe]] przez [[websocket-transport|WebSocket]], który dostarcza te same eventy w trybie push, bez kursora, który można zgubić, i bez id, które trzeba utrzymywać przy życiu. Druga możliwość to zwykłe skanowanie `eth_getLogs` z własnym trwałym kursorem, jedyne podejście, które bez luk przetrwa restarty, reorgi i failover dostawcy. Większość [[client-libraries|bibliotek klienckich]] po cichu wybiera jedną z tych trzech dróg, więc zanim założy się, która metoda faktycznie idzie po sieci, trzeba sprawdzić, co robi używana biblioteka."
        ]
      }
    ],
    example: {
      title: "Instalacja, odpytywanie i usunięcie filtra logów",
      note: "Pusta tablica z `eth_getFilterChanges` oznacza, że nie ma nic nowego; `filter not found` oznacza, że kursor przepadł i lukę trzeba uzupełnić."
    },
    pitfalls: [
      "Używanie filtrów przez pulę węzłów dostawcy, gdzie każde odpytanie może trafić do innego węzła, a id istnieje tylko na jednym z nich.",
      "Ponowne zainstalowanie filtra po `filter not found` i dalsza praca jak gdyby nigdy nic; nowy filtr zaczyna od head, a bloki z przerwy przepadają.",
      "Ignorowanie wpisów z `removed` ustawionym na `true`, które wycofują logi dostarczone wcześniej przez ten sam filtr.",
      "Wyciek filtrów przez niewywoływanie `eth_uninstallFilter`; każdy z nich zajmuje pamięć węzła, dopóki nie wygaśnie."
    ]
  },
  "eth-subscribe": {
    title: "eth_subscribe",
    aliases: [
      "subscribe",
      "eth_subscribe",
      "eth_unsubscribe",
      "newHeads",
      "newPendingTransactions",
      "powiadomienia push",
      "streaming",
      "subskrypcja"
    ],
    summary: "`eth_subscribe` otwiera strumień push przez połączenie [[websocket-transport|WebSocket]] lub [[ipc-transport|IPC]], po czym węzeł wysyła powiadomienia `eth_subscription` o nowych headach, pasujących [[event-log|logach]], transakcjach pending albo statusie synchronizacji, dopóki subskrypcja nie zostanie anulowana.",
    sections: [
      {
        heading: "Cztery typy subskrypcji",
        paragraphs: [
          "Pierwszy parametr wskazuje strumień, a drugi przenosi jego opcje. `newHeads` wysyła każdy nowy kanoniczny [[block-header|nagłówek bloku]] w chwili jego przyjęcia, w tym samym kształcie, jaki zwraca [[eth-get-block-by-number|eth_getBlockByNumber]], tylko bez listy transakcji. `logs` przyjmuje obiekt filtra z `address` i `topics`, ten sam, którego używa [[eth-get-logs|eth_getLogs]], i wysyła pasujące logi w miarę napływu bloków. `newPendingTransactions` wysyła hashe transakcji wchodzących do [[mempool|mempoolu]] tego węzła, a kilku klientów przyjmuje dodatkowo wartość boolean, żeby zamiast hashy dostawać pełne obiekty transakcji, choć [[besu|Besu]] odczytuje tylko obiekt `{\"includeTransactions\": true}`; zobacz [[mempool-streaming|streaming mempoolu]]. `syncing` wysyła zmiany statusu, gdy węzeł zaczyna lub kończy synchronizację.",
          "Wywołanie zwraca id subskrypcji. Powiadomienia nie wyglądają jak odpowiedzi: przychodzą jako żądania od serwera, z `method` ustawionym na `eth_subscription` i obiektem `params`, który zawiera `subscription` i `result`. Nie mają własnego `id`, więc klient musi przypisywać je według id subskrypcji, a nie id żądania; zobacz [[request-response|format komunikatu JSON-RPC (envelope)]]. `eth_unsubscribe` przyjmuje id i zwraca boolean."
        ]
      },
      {
        heading: "Subskrypcja żyje tyle, co połączenie",
        paragraphs: [
          "Subskrypcja należy do jednego połączenia. Gdy socket się zamyka (chwilowy problem z siecią, timeout bezczynności na proxy, restart węzła, [[load-balancer|load balancer]] przełączający backendy), znikają wszystkie subskrypcje na tym połączeniu, nikt nie wysyła o tym powiadomienia i nic nie jest przechowywane do późniejszego odtworzenia. Klient, który połączy się ponownie i odnowi subskrypcję, wznawia od bieżącego head i nigdy się nie dowie, co działo się w międzyczasie.",
          "Ta luka to główny problem projektowy. Standardowe rozwiązanie to zapisywanie ostatniego w pełni przetworzonego bloku i po każdym ponownym połączeniu wykonanie zapytania [[eth-get-logs|eth_getLogs]] od tego bloku do bieżącego head, zanim znów zaufa się strumieniowi. To samo dotyczy `newHeads`: `parentHash` każdego nagłówka trzeba porównywać z hashem poprzedniego otrzymanego nagłówka, bo [[reorg|reorg]] objawia się jako nowy head, którego rodzica klient nie zna, a nie jako jawny komunikat. Powiadomienia z logami zawierają natomiast wpisy `removed: true`, gdy dostarczony wcześniej log zostaje wycofany."
        ]
      },
      {
        heading: "Zastosowanie w praktyce i limity",
        paragraphs: [
          "`newHeads` to właściwy sposób na napędzanie [[keeper|pętli, która wykonuje się raz na blok]], i zastępuje odpytywanie [[eth-block-number|eth_blockNumber]]. Subskrypcja `logs` świetnie nadaje się do szybkiego reagowania, a słabo jako źródło prawdy, więc produkcyjne [[indexer|indeksery]] zwykle traktują ją jako szybki sygnał, a za rozstrzygające uznają skanowanie [[eth-get-logs|eth_getLogs]] z trwałym kursorem.",
          "`newPendingTransactions` to zalew danych (firehose): na mainnecie co sekundę przybywa duża i zmienna liczba wpisów w mempoolu. Strumień pokazuje mempool jednego węzła, a nie całej sieci, więc dwa endpointy mają pełne prawo się różnić. [[rpc-provider|Dostawcy RPC]] często ograniczają liczbę równoczesnych subskrypcji na połączenie, całkowicie wyłączają strumienie transakcji pending albo naliczają opłatę za każde powiadomienie. Tam, gdzie dostępne jest tylko [[http-transport|HTTP]], zapasowym rozwiązaniem są [[eth-filters|filtry z odpytywaniem]]."
        ]
      }
    ],
    example: {
      title: "Subskrypcja newHeads i odebrane powiadomienie",
      note: "`parentHash` w powiadomieniu zgadza się z `hash` poprzedniego head; gdy się nie zgadza, nastąpił reorg i dotknięty zakres trzeba odczytać ponownie."
    },
    pitfalls: [
      "Ufanie strumieniowi po ponownym połączeniu; nic nie jest przechowywane, więc każde ponowne połączenie wymaga zapytania, które uzupełni brakujący zakres.",
      "Kierowanie powiadomień według id żądania, którego one nie mają; dopasowuje się je po polu `subscription`.",
      "Traktowanie strumienia `logs` jak pełnej historii, choć zerwanie połączenia po cichu usuwa eventy, które już nigdy nie dotrą.",
      "Subskrybowanie `newPendingTransactions` na współdzielonym endpoincie, przez co dostawca ogranicza ruch (throttling) albo zrywa połączenie z powodu ilości danych.",
      "Zakładanie, że reorg przychodzi jako osobny komunikat w `newHeads`; trzeba go wykryć samodzielnie, sprawdzając ciągłość `parentHash`."
    ]
  },
  "eth-syncing": {
    title: "eth_syncing",
    aliases: ["syncing", "eth_syncing", "status synchronizacji", "postęp synchronizacji", "czy węzeł jest gotowy", "nadrabianie bloków"],
    summary: "`eth_syncing` zwraca `false`, gdy [[execution-client|klient wykonawczy]] uważa, że jest na bieżąco, a w przeciwnym razie obiekt z polami `startingBlock`, `currentBlock` i `highestBlock`, który opisuje, jak daleko zaszła synchronizacja.",
    sections: [
      {
        heading: "Co zwraca",
        paragraphs: [
          "Metoda nie przyjmuje parametrów i ma niewygodny typ wyniku: boolean `false` albo obiekt, nigdy `true`. Trzy pola ze specyfikacji, wszystkie typu [[hex-encoding|QUANTITY]], mówią, od którego bloku zaczęła się ta synchronizacja, który [[block|blok]] został już przetworzony i jaki jest najwyższy blok, o którym wiadomo, że jest dostępny. Klienci dodają do nich własne pola, bo te trzy liczby opisują liniową synchronizację blok po bloku, a nowoczesne [[sync-modes|tryby synchronizacji]] nie są liniowe.",
          "[[geth|Geth]] podczas [[snap-sync|snap sync]] podaje liczniki postępu dla kont, bytecode'ów, slotów storage i trie nodes naprawionych w fazie healingu. [[erigon|Erigon]] podaje etapy swojego staged sync. [[nethermind|Nethermind]] i [[reth|Reth]] udostępniają własne pola. Warto parsować trzy standardowe pola, a całą resztę traktować jako informacyjną, bo nic z niej nie jest przenośne między klientami."
        ]
      },
      {
        heading: "Dlaczego false nie znaczy gotowy",
        paragraphs: [
          "Odpowiedź to opinia klienta o własnym postępie, a ta opinia może być słuszna nawet wtedy, gdy węzeł jest bezużyteczny, i to na kilka sposobów. Węzeł, którego [[consensus-client|klient konsensusu]] przestał działać, nie dostaje już wywołań `engine_forkchoiceUpdated` przez [[engine-api|Engine API]], więc jego head po prostu przestaje się przesuwać; węzeł się nie synchronizuje, bo nikt go o to nie prosi. Węzeł bez peerów nie ma do czego się synchronizować i zwraca `false`. Węzeł, który właśnie skończył snap sync, odpowiada `false`, zanim ma jakikolwiek historyczny [[state|stan]], więc [[eth-call|eth_call]] na starszych blokach nadal kończy się błędem.",
          "Zdarza się też odwrotnie. Podczas [[checkpoint-sync|checkpoint sync]] i importu optymistycznego (optimistic import) klient konsensusu może przekazywać payloady, których klient wykonawczy jeszcze w pełni nie zwalidował, a to, co raportuje ta para klientów, naprawdę jest czymś pomiędzy. Nigdy nie należy kierować ruchu wyłącznie na podstawie tej metody."
        ]
      },
      {
        heading: "Użycie w health checku",
        paragraphs: [
          "Użyteczny [[health-check|health check]] łączy cztery tanie sygnały: `eth_syncing` zwraca `false`; `timestamp` najnowszego bloku jest najwyżej około minuty za bieżącym czasem, co wychwytuje zatrzymany head, którego nic innego nie wychwyci; `eth_chainId` zgadza się z oczekiwanym łańcuchem, co wychwytuje źle skonfigurowany backend; a `net_peerCount` jest większe od zera. Warto też porównać head z drugim, niezależnym źródłem, bo węzeł może konsekwentnie mylić się sam.",
          "Przy [[load-balancer|load balancingu]] i [[failover|failoverze]] obiekt synchronizacji jest też sygnałem dla routingu: backend, który się synchronizuje, trzeba wyłączyć z ruchu (drain), a nie tylko obniżyć mu priorytet, bo na [[eth-get-balance|odczyty stanu]] odpowie błędami, a nie nieaktualnymi wartościami. Endpoint `/eth/v1/node/syncing` w [[beacon-api|Beacon API]] daje drugą, konsensusową połowę tego samego obrazu, w tym informację, czy węzeł jest w trybie optymistycznym."
        ]
      }
    ],
    example: {
      title: "W trakcie synchronizacji, potem zsynchronizowany",
      note: "`false` to twierdzenie o postępie, a nie o świeżości danych; zanim skieruje się ruch do tego węzła, trzeba sprawdzić `timestamp` bloku head."
    },
    pitfalls: [
      "Używanie `false` jako jedynego sygnału gotowości; przejdzie on dla węzła, którego klient konsensusu padł, a head zamarł wiele godzin temu.",
      "Oczekiwanie wyniku `true` w trakcie synchronizacji; wtedy wynikiem jest obiekt, więc naiwne sprawdzenie wartości logicznej odwraca znaczenie.",
      "Parsowanie pól postępu specyficznych dla klienta tak, jakby były standardowe, i awaria, gdy operator zmieni klienta.",
      "Zakładanie, że węzeł, który zwraca `false`, obsłuży historyczny stan; snap sync kończy się bez żadnej historii starszej niż head."
    ]
  },
  "eth-simulate": {
    title: "eth_simulateV1",
    aliases: ["simulateV1", "eth_simulateV1", "symulacja", "symulacja transakcji", "multicall rpc", "blockStateCalls"],
    summary: "`eth_simulateV1` wykonuje sekwencję wywołań w jednym lub kilku hipotetycznych [[block|blokach]] na prawdziwym [[state|stanie]], z [[state-override|state overrides i block overrides]] ustawianymi osobno dla każdego bloku, i zwraca wynik każdego wywołania, jego [[event-log|logi]] oraz zużycie [[gas|gasu]].",
    sections: [
      {
        heading: "Co robi",
        paragraphs: [
          "Pierwszy parametr to obiekt, którego głównym polem jest `blockStateCalls`, czyli tablica opisów bloków. Każdy wpis może zawierać `blockOverrides` (wartości takie jak `number`, `time`, `baseFeePerGas`, `gasLimit`), `stateOverrides` (tę samą mapę, którą przyjmuje [[eth-call|eth_call]]) oraz `calls`, uporządkowaną tablicę obiektów wywołań. Przebieg kształtują trzy flagi typu boolean. `validation` stosuje sprawdzenia, którym podlegałaby prawdziwa [[transaction|transakcja]], zamiast luźnego wykonania. `traceTransfers` pokazuje zwykłe transfery etheru jako syntetyczne logi `Transfer`, żeby przepływ wartości był widoczny. `returnFullTransactions` rozwija transakcje w zwracanych blokach. Drugi parametr to identyfikator bloku bazowego.",
          "Wynikiem jest tablica symulowanych obiektów bloków. Każdy ma pola jak w nagłówku bloku i tablicę `calls`, w której są `status`, `returnData`, `gasUsed`, `logs` oraz obiekt `error`, gdy wywołanie się nie powiedzie. Stan przechodzi dalej: drugie wywołanie widzi to, co zapisało pierwsze, a drugi blok widzi wszystko, co zrobił pierwszy. Właśnie tego nie da się osiągnąć łańcuchem żądań [[eth-call|eth_call]]."
        ]
      },
      {
        heading: "Po co powstała",
        paragraphs: [
          "Wcześniej każda nietrywialna symulacja zależała od dostawcy. [[transaction-simulation|Portfele, które chciały pokazać]], „co ta transakcja zrobi z moimi saldami”, korzystały z API dostawców, searcherzy używali [[debug-api|debug_traceCall]] z nadpisaniami stanu, a przepływów wieloetapowych, takich jak approve, a potem swap, nie dało się w ogóle zamodelować bez wysłania pierwszej transakcji naprawdę. Metoda `eth_simulateV1` przeszła proces [[execution-apis|execution-apis]], żeby stać się standardem o zdefiniowanej semantyce.",
          "To `blockOverrides` pozwalają sprawdzić logikę zależną od przyszłej daty. Przesunięcie `time` do przodu pozwala przekroczyć cliff vestingu albo termin aukcji, podniesienie `number` pozwala przejść sprawdzenie wysokości bloku, a ustawienie `baseFeePerGas` pokazuje, jak kontrakt zachowuje się przy przeciążonej sieci. `traceTransfers` znaczy więcej, niż się wydaje: na mainnecie transfery etheru nie emitują dziś żadnych logów, więc bez tej flagi symulacja wypłaty z kontraktu nie pokazuje zupełnie nic. EIP-7708, które działa na Sepolii od 6 października 2026, ale nie ma jeszcze terminu na mainnecie, sprawia, że każdy niezerowy transfer etheru zostawia log `Transfer` emitowany z adresu `0xfffffffffffffffffffffffffffffffffffffffe`, a prawdziwy nadawca i odbiorca są w jego topics."
        ]
      },
      {
        heading: "Koszt i dostępność",
        paragraphs: [
          "Jedno żądanie może wykonać dziesiątki wywołań w kilku blokach, dlatego wycenia się je i ogranicza jak metodę tracingu, a nie jak zwykły odczyt. Klienci narzucają łączny limit gasu na całą symulację i limit liczby bloków, które można w niej ułożyć jeden po drugim, a [[rpc-provider|dostawcy RPC]] dokładają własne wagi w [[rate-limits|compute units]]. Symulacja na starym bloku wymaga stanu historycznego, a więc [[archive-node|węzła archiwalnego]].",
          "Obsługa pojawiła się w [[geth|Geth]], [[nethermind|Nethermind]], [[erigon|Erigon]] i [[reth|Reth]] w 2024 i 2025 roku, ale to wciąż najnowsza z opisanych tu metod i pierwsza, którą odrzuci starszy gateway. Dlatego warto sprawdzić ją przy starcie i mieć fallback na [[eth-call|eth_call]]; zobacz [[endpoint-capabilities|możliwości endpointu]]. Symulacja jest też prognozą na stanie, który zdąży się zmienić, zanim prawdziwa transakcja trafi do bloku, i nie modeluje tego, co wcześniej zrobią transakcje innych osób; zobacz [[mev|MEV]]."
        ]
      }
    ],
    example: {
      title: "Approve, potem transfer, z saldem zasilonym przez state override",
      note: "Drugie wywołanie widzi allowance zapisane przez pierwsze i o to właśnie chodzi; dwa osobne żądania `eth_call` startowałyby z niezmienionego stanu."
    },
    pitfalls: [
      "Uruchomienie z wyłączonym `validation` i wniosek, że transakcja się powiedzie; tryb luźny pomija sprawdzenie nonce, salda i opłat, które prawdziwa transakcja musi przejść.",
      "Pominięcie `traceTransfers` i raportowanie „żadna wartość się nie przesunęła” dla wywołania, którego całym efektem był transfer etheru, a na mainnecie taki transfer nie emituje logu.",
      "Traktowanie symulowanego `gasUsed` jak limitu gasu; to koszt przy użytych nadpisaniach, a nie minimalny limit, który przetrwa prawdziwą kolejność transakcji w bloku.",
      "Układanie wielu bloków z dużymi wywołaniami, aż żądanie przekroczy łączny limit gasu klienta; wtedy pada cała symulacja, a nie jedno wywołanie."
    ]
  },
  "state-override": {
    title: "State overrides",
    aliases: [
      "stateOverrides",
      "state override set",
      "nadpisanie stanu",
      "nadpisanie salda",
      "nadpisanie kodu",
      "stateDiff",
      "nadpisanie konta"
    ],
    summary: "State override to opcjonalna mapa przekazywana razem z [[eth-call|eth_call]], [[eth-estimate-gas|eth_estimateGas]] albo [[eth-simulate|eth_simulateV1]], która podmienia saldo, nonce, kod lub storage [[account|konta]] wyłącznie na czas tej jednej symulacji.",
    sections: [
      {
        heading: "Struktura nadpisań",
        paragraphs: [
          "Zestaw nadpisań to obiekt JSON, którego kluczami są [[address|adresy]]. Każda wartość może ustawiać `balance`, `nonce`, `code` i jedno z pól `state` lub `stateDiff`. `state` odrzuca cały [[contract-storage|storage]] konta i instaluje dokładnie wymienione sloty; `stateDiff` zachowuje prawdziwy storage i podmienia tylko wskazane sloty. Podanie obu pól dla jednego konta jest błędem, a ich pomylenie to różnica między „ten kontrakt ma jeden wpis salda” a „ten kontrakt ma jeden zmieniony wpis salda”. Niektórzy klienci akceptują też `movePrecompileToAddress`, które przenosi [[precompiles|precompile]] w inne miejsce, żeby pod jego adresem można było umieścić własny kod.",
          "Nadpisania dotyczą [[state|stanu]], od którego zaczyna się symulacja, i są odrzucane po jej zakończeniu. Obowiązują w jednym żądaniu, nigdy nie są utrwalane ani rozgłaszane i są niewidoczne dla innych wywołujących. W [[eth-simulate|eth_simulateV1]] są pełnoprawnym polem każdego wpisu w `blockStateCalls`, obok `blockOverrides` dla wartości nagłówka takich jak `time` i `number`, których zwykłe `eth_call` nie może zmienić."
        ]
      },
      {
        heading: "Do czego służą",
        paragraphs: [
          "Najczęstszy przypadek to usunięcie warunku wstępnego, którego jeszcze się nie spełnia. Nadpisanie własnego salda pozwala wycenić wymianę, na którą jeszcze nie ma środków, podmiana [[storage-slot-discovery|slotu allowance w ERC-20]] pozwala zasymulować swap bez wcześniejszego wysyłania transakcji approve, a ustawienie salda tokena pozwala wycenić sprzedaż. Kolejny przypadek to sprawdzanie kodu, którego jeszcze nie wdrożono: kandydującą implementację wstawia się w `code` pod adresem prawdziwego kontraktu i uruchamia na niej istniejące calldata. Tak sprawdza się proponowane aktualizacje kontraktów na bieżącym stanie.",
          "Nadpisania umożliwiają też odczyty, które inaczej byłyby niemożliwe. Podmiana `code` kontraktu na wersję z dodanym getterem ujawnia wewnętrzną wartość, której prawdziwy kontrakt nigdy nie zwraca, bo storage kontraktu zostaje na miejscu. Jednorazowy kontrakt pomocniczy pod nieużywanym adresem tego storage nie widzi, ale może [[multicall|grupować odczyty]] przez funkcje publiczne, a odczyty deployless w viem w ogóle pomijają nadpisanie, bo wysyłają creation code kontraktu pomocniczego bez `to`; oba podejścia to [[deployless-call|wywołania deployless]]. Nadpisanie jednego slotu storage to też często najszybszy sposób, żeby zweryfikować diagnozę: jeśli wymuszenie wartości `true` we fladze sprawia, że [[revert|revert]] znika, to ta flaga była przyczyną."
        ]
      },
      {
        heading: "Ograniczenia i zastrzeżenia",
        paragraphs: [
          "Nadpisania to standard de facto, a nie pierwotna część specyfikacji: wprowadził je [[geth|Geth]], a [[nethermind|Nethermind]], [[erigon|Erigon]] i [[reth|Reth]] poszli w jego ślady, ale zakres obsługi zależy od metody. W `eth_call` obsługa jest niemal powszechna, w `eth_estimateGas` i [[eth-create-access-list|eth_createAccessList]] już rzadsza, a niektórzy [[rpc-provider|dostawcy RPC]] po cichu usuwają trzeci parametr, co jest gorsze niż jego odrzucenie, bo odpowiedź opisuje wtedy niezmieniony stan.",
          "Wartości gasu zmierzone przy nadpisaniach są przybliżone: podmiana `code` zmienia wykonywane instrukcje, a ustawienie slotu z góry zamienia pierwszy zapis za 20 000 gasu w aktualizację za 2900 gasu. Nadpisaną symulację warto traktować jako odpowiedź na pytanie „co by się stało, gdyby świat wyglądał tak”, a zanim podejmie się działanie na podstawie tej liczby, osobno zweryfikować założenia."
        ]
      }
    ],
    example: {
      title: "Wycena swapu, na który wywołującego jeszcze nie stać",
      note: "`balance` daje wywołującemu 100 ETH tylko na to jedno wywołanie; `stateDiff` ustawia saldo USDC wywołującego, `keccak256(pad32(caller) . pad32(9))`, oraz allowance routera w zagnieżdżonym mappingu w slocie 10, każde na 1 000 000 USDC, i zostawia bez zmian resztę storage tego kontraktu, łącznie ze wskaźnikiem na implementację."
    },
    pitfalls: [
      "Użycie `state` zamiast zamierzonego `stateDiff`, co wymazuje każdy inny slot tego kontraktu, przez co sumy, właściciele i rezerwy puli odczytują się jako zero.",
      "Zakładanie, że dostawca uwzględnił nadpisanie; niektórzy po cichu pomijają trzeci parametr i zwracają odpowiedź policzoną na prawdziwym stanie.",
      "Podawanie gasu z nadpisanego wykonania jako prawdziwego limitu gasu, bo ustawione z góry sloty i podmieniony kod zmieniają model kosztów.",
      "Nadpisywanie `code` pod adresem o innym układzie storage, przez co nowy kod odczytuje stare sloty jako niezwiązane z nim wartości."
    ]
  },
  "debug-api": {
    title: "Przestrzeń nazw debug_",
    aliases: [
      "debug",
      "debug_traceTransaction",
      "debug_traceCall",
      "callTracer",
      "prestateTracer",
      "struct logger",
      "tracing",
      "debug_getRawBlock"
    ],
    summary: "[[namespaces|Przestrzeń nazw]] `debug_` to API tracingu i introspekcji w stylu Geth: ponownie wykonuje transakcje, wywołania albo całe [[block|bloki]] z wybranym tracerem i zwraca [[execution-trace|trace wykonania]], a do tego obiekty łańcucha w surowym kodowaniu.",
    sections: [
      {
        heading: "Metody",
        paragraphs: [
          "Rdzeń tracingu to cztery metody z tym samym obiektem opcji. `debug_traceTransaction` przyjmuje hash transakcji i odtwarza ją dokładnie tak, jak wykonała się w swoim bloku. `debug_traceCall` przyjmuje obiekt wywołania, identyfikator bloku i — podobnie jak [[eth-call|eth_call]] — opcjonalne [[state-override|state overrides]], więc śledzi coś, co nigdy się nie wydarzyło. `debug_traceBlockByNumber` i `debug_traceBlockByHash` śledzą każdą transakcję w bloku i zwracają po jednym trace na transakcję.",
          "Obok nich są metody zwracające surowe dane. `debug_getRawHeader`, `debug_getRawBlock`, `debug_getRawTransaction` i `debug_getRawReceipts` zwracają bajty [[rlp|RLP]], które węzeł przechowuje i rozgłasza przez gossip. Są potrzebne, żeby samodzielnie zweryfikować hash albo przekazać dane innemu narzędziu. `debug_storageRangeAt` przechodzi przez [[contract-storage|storage]] kontraktu slot po slocie. Rozszerzenia konkretnych klientów idą dalej, łącznie z metodami, które przesuwają head albo zrzucają bazę danych, i dlatego tę przestrzeń nazw traktuje się jako uprzywilejowaną."
        ]
      },
      {
        heading: "Tracery",
        paragraphs: [
          "Pole `tracer` w obiekcie opcji decyduje, co wraca. Bez niego dostaje się struct logger: jeden wpis na każdy wykonany opcode z licznikiem programu, gasem, stosem i opcjonalnie pamięcią i storage. Jest kompletny i ogromny — złożona transakcja daje setki megabajtów JSON-a — dlatego pamięć jest pomijana, chyba że ustawi się `enableMemory`, a `disableStack` i `disableStorage` dodatkowo zmniejszają wynik.",
          "`callTracer` to tracer, którego chce większość: zagnieżdżone drzewo wywołań z `from`, `to`, `type` (`CALL`, `DELEGATECALL`, `STATICCALL`, `CREATE`), `input`, `output`, `gas`, `gasUsed` oraz `error` albo `revertReason` przy błędach. `tracerConfig: {\"onlyTopCall\": true}` zwija je do ramki najwyższego poziomu. `prestateTracer` zwraca każde konto i slot, które transakcja odczytała, a z `diffMode: true` parę „przed i po”; tak odtwarza się state diff. `4byteTracer` zlicza selektory funkcji, `noopTracer` mierzy narzut samego odtwarzania, `muxTracer` uruchamia kilka tracerów naraz, a `erc7562Tracer`, natywny od Geth v1.16.0, zapisuje opcode'y, dostępy do storage i ramki wywołań, które bundler sprawdza pod kątem reguł walidacji [[erc-7562|ERC-7562]]. [[geth|Geth]] przyjmuje też własne tracery napisane w JavaScripcie i ma `flatCallTracer`, który zwraca wynik w kształcie znanym z [[trace-api|przestrzeni nazw trace_]]."
        ]
      },
      {
        heading: "Koszt, wymagania co do stanu i wystawienie",
        paragraphs: [
          "Tracing to ponowne wykonanie, a nie odczyt gotowych danych. Żeby prześledzić transakcję nr 40 w bloku, klient musi odbudować stan z tego momentu, wykonując ponownie wszystko, co było przed nią, począwszy od stanu, który jeszcze przechowuje. Opcja `reexec` ogranicza, jak daleko wstecz się cofnie, zanim podda się z [[rpc-errors|błędem]] „required historical state unavailable”. Dlatego tracing starego bloku wymaga [[archive-node|węzła archiwalnego]], pojedynczy trace może kosztować setki razy więcej niż [[eth-call|eth_call]], a długie trace'y wymagają podniesienia opcji `timeout`.",
          "Ten koszt jest też problemem bezpieczeństwa. Garść nieuwierzytelnionych wywołań `debug_traceBlockByNumber` wystarczy, żeby zatkać węzeł, a niektóre metody tej przestrzeni nazw potrafią zmienić jego widok łańcucha. `debug_` trzeba trzymać z dala od publicznego listenera — w [[geth|Geth]] nie ma tej przestrzeni w `--http.api`, dopóki się jej nie doda — a jeśli w ogóle trzeba ją udostępnić, to przez uwierzytelnioną, wewnętrzną drogę dostępu z allowlistą metod; zobacz [[security|bezpieczeństwo RPC]]. [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]] i [[besu|Besu]] implementują dużą część tej przestrzeni nazw, a większość [[rpc-provider|dostawców RPC]] sprzedaje tracing jako osobny, drogo liczony pakiet.",
          "Praktyczne zastosowania są wąskie, ale cenne: wyjaśnienie, dlaczego transakcja zrobiła revert głęboko w drzewie wywołań, odzyskanie wewnętrznych transferów etheru, które nie emitują [[event-log|logów]], i przypisanie zużycia [[gas|gasu]] do poszczególnych ramek na potrzeby rozliczeń. Przy przeglądzie całego bloku lepiej wywołać raz `debug_traceBlockByNumber` niż osobno dla każdej transakcji, a wcześniej sprawdzić, czy odpowiedzi nie ma już [[trace-api|trace_filter]] albo [[indexer|indekser]]."
        ]
      }
    ],
    example: {
      title: "Drzewo wywołań z callTracer",
      note: "Błąd leży trzy ramki w głąb: sam receipt pokazałby tylko `status` `0x0` dla zewnętrznej transakcji."
    },
    pitfalls: [
      "Tracing bez opcji `tracer` i otrzymanie pełnego logu opcode'ów, który dla jednej transakcji może mieć setki megabajtów.",
      "Wystawienie `debug_` na publicznym endpoincie, gdzie kilka wywołań tracingu wystarczy, by wyczerpać węzeł, a niektóre metody mogą zmienić jego head.",
      "Tracing starej transakcji na [[pruned-node|węźle z pruningiem]] i uznanie „historical state unavailable” za błąd w kodzie, a nie za limit retencji danych.",
      "Traktowanie trace jako dowodu kryptograficznego; to odtworzenie wykonania przez jeden węzeł, które da się zweryfikować tylko, uruchamiając je samodzielnie."
    ]
  },
  "trace-api": {
    title: "Przestrzeń nazw trace_",
    aliases: [
      "trace",
      "trace_transaction",
      "trace_block",
      "trace_filter",
      "trace_call",
      "trace_replayBlockTransactions",
      "parity traces",
      "trace'y parity"
    ],
    summary: "[[namespaces|Przestrzeń nazw]] `trace_` to API tracingu w stylu Parity, które przejęli [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]] i [[besu|Besu]]. Zwraca płaską listę ramek wywołań, opcjonalnie kroki VM i opcjonalnie state diffy, a trace'y z zakresu bloków potrafi wyszukiwać po [[address|adresie]].",
    sections: [
      {
        heading: "Metody",
        paragraphs: [
          "Odczyt trace'ów tego, co już się wydarzyło: `trace_transaction` dla jednego hasha transakcji, `trace_block` dla wszystkich trace'ów w [[block|bloku]] i `trace_get` dla jednej ramki na podanej pozycji. Odtwarzanie z większą szczegółowością: `trace_replayTransaction` i `trace_replayBlockTransactions`, które przyjmują listę typów trace. Tracing hipotetycznych scenariuszy: `trace_call`, `trace_callMany` dla uporządkowanej sekwencji ze wspólnym stanem i `trace_rawTransaction` dla podpisanych bajtów, których nigdy nie wysłano.",
          "`trace_filter` to metoda bez odpowiednika w [[debug-api|przestrzeni nazw debug_]] i właśnie dla niej tę przestrzeń nazw wciąż warto mieć. Przyjmuje `fromBlock`, `toBlock`, `fromAddress`, `toAddress`, `after` i `count`, a zwraca każdą pasującą ramkę wywołania w tym zakresie. Tak odpowiada się na pytanie „ile etheru wpłynęło na ten adres i z niego wypłynęło”, łącznie z transferami wewnętrznymi, które nie emitują [[event-log|logu]] i nie pojawiają się w żadnym [[transaction-receipt|receipcie]]. W ten sposób [[block-explorer|eksploratory bloków]] wypełniają zakładki z transakcjami wewnętrznymi."
        ]
      },
      {
        heading: "Trzy typy trace",
        paragraphs: [
          "Metody typu replay i call przyjmują tablicę nazw typów. `trace` daje ramki wywołań. `vmTrace` daje zapis na poziomie opcode'ów, porównywalny z domyślnym struct loggerem i równie ogromny. `stateDiff` daje dla każdego konta stan przed i po: saldo, nonce, kod i każdy dotknięty slot [[contract-storage|storage]]; to najczystszy sposób, by odpowiedzieć na pytanie „co zmieniła ta transakcja”. Warto prosić tylko o to, czego się potrzebuje, bo każdy typ mnoży pracę.",
          "Wynik `trace` jest płaski tam, gdzie wynik [[debug-api|callTracer]] jest zagnieżdżony. Każdy wpis ma `action` (z `from`, `to`, `value`, `gas`, `input` albo `init` przy tworzeniu kontraktu), `result` (z `gasUsed` i `output` albo `address`), `subtraces` oraz `traceAddress`, czyli tablicę indeksów wskazującą pozycję ramki w drzewie — `[]` dla wywołania najwyższego poziomu, `[0,1]` dla drugiego dziecka pierwszego dziecka. `type` to `call`, `create`, `suicide` albo `reward`. Na mainnecie Ethereum wpis `reward` niesie wartość tylko przed [[the-merge|Merge]], bo po nim w warstwie wykonawczej nie ma nagrody za blok. [[reth|Reth]] pomija wtedy ten wpis, a [[nethermind|Nethermind]] nadal emituje wpis o wartości zero dla odbiorcy opłat (fee recipient) każdego bloku. [[gnosis-chain|Gnosis Chain]] po swoim własnym Merge nadal wywołuje kontrakt nagród za blok, więc jej wpisy reward z `rewardType` `external` mogą nieść realną wartość."
        ]
      },
      {
        heading: "Obsługa, koszt i wybór przestrzeni nazw",
        paragraphs: [
          "[[geth|Geth]] nie implementuje `trace_`; zamiast tego ma w `debug_` tracer `flatCallTracer`, który daje wynik o podobnym kształcie, ale bez `trace_filter`. Nethermind, Erigon, Reth i Besu implementują tę przestrzeń nazw natywnie, a do ciężkiej pracy z trace'ami zwykle wybiera się Erigon i Reth, bo ich układ danych na dysku sprawia, że odtwarzanie historii jest tanie. U [[rpc-provider|dostawcy RPC]] to płatna, osobna funkcja, a zestaw włączonych metod bywa różny. Zanim oprze się na niej projekt, trzeba ją sprawdzić, tak jak każdą [[endpoint-capabilities|możliwość endpointu]].",
          "Wszystko tutaj to ponowne wykonanie, więc obowiązują te same zasady co przy `debug_`: stary blok wymaga [[archive-node|węzła archiwalnego]], odpowiedzi są duże, a kilka nieuwierzytelnionych wywołań `trace_block` położy węzeł. Tę przestrzeń nazw trzeba trzymać z dala od publicznych listenerów. [[nethermind|Nethermind]] udostępnia wszystko, co wymienia `--JsonRpc.EnabledModules`, a domyślna lista jest szeroka, więc na każdym wystawionym listenerze trzeba ją ustawić jawnie, na przykład `[Eth,Net,Web3]`, i dodawać `Trace` tylko tam, gdzie jest potrzebny. `trace_filter` sprawdza się, gdy pytanie dotyczy adresu w zakresie bloków, `trace_replay…` ze `stateDiff`, gdy pytanie brzmi, co się zmieniło, a tracery `debug_`, gdy potrzebne jest zagnieżdżone drzewo, własny tracer albo [[state-override|state overrides]].",
          "Jak każdy [[execution-trace|trace wykonania]], odpowiedź to odtworzenie wykonania przez jeden węzeł, a nie [[state-proof|dowód]]. Dwóch uczciwych klientów powinno dać ten sam wynik i porównanie ich to rozsądne sprawdzenie spójności, ale niczego w odpowiedzi nie da się zweryfikować bez samodzielnego wykonania."
        ]
      }
    ],
    example: {
      title: "Każda ramka wywołania dotycząca adresu w zakresie bloków",
      note: "`traceAddress` `[1,0]` oznacza, że ta ramka jest pierwszym dzieckiem drugiego wywołania najwyższego poziomu; transfer 1 etheru, który zapisuje, nie pojawia się w żadnym logu ani receipcie."
    },
    pitfalls: [
      "Oczekiwanie `trace_` na endpoincie Geth; Geth udostępnia tracery w stylu Geth w `debug_` i nie ma odpowiednika `trace_filter`.",
      "Proszenie o `vmTrace`, gdy wystarczyłby `trace`, co zamienia odpowiedź rozsądnej wielkości w zrzut opcode po opcode.",
      "Czytanie `traceAddress` jako głębokości wywołania; to ścieżka indeksów dzieci, więc `[0,1]` i `[1,0]` to różne ramki na tej samej głębokości.",
      "Uruchamianie `trace_filter` na szerokim zakresie bez filtra adresów, co każe węzłowi odtworzyć każdy blok w tym oknie.",
      "Traktowanie trace jako rozstrzygającego dowodu, a nie odtworzenia wykonania przez jeden węzeł."
    ]
  },
  "txpool-api": {
    title: "Przestrzeń nazw txpool_",
    aliases: [
      "txpool",
      "txpool_status",
      "txpool_content",
      "txpool_inspect",
      "txpool_contentFrom",
      "kolejka pending",
      "utknięta transakcja",
      "stuck transaction"
    ],
    summary: "[[namespaces|Przestrzeń nazw]] `txpool_` udostępnia [[mempool|mempool]] jednego węzła: `txpool_status` liczy transakcje, `txpool_content` zrzuca wszystkie czekające w nim [[transaction|transakcje]], `txpool_contentFrom` zawęża wynik do jednego nadawcy, a `txpool_inspect` zwraca podsumowanie czytelne dla człowieka.",
    sections: [
      {
        heading: "Metody i to, co pokazują",
        paragraphs: [
          "`txpool_status` zwraca `{ \"pending\": \"0x…\", \"queued\": \"0x…\" }` i jako jedyna z czterech metod jest tania. `txpool_content` zwraca cały mempool jako dwupoziomową mapę: od [[address|adresu]] nadawcy przez [[nonce|nonce]] do pełnego obiektu transakcji. `txpool_contentFrom` przyjmuje jeden adres i zwraca tę samą strukturę tylko dla tego nadawcy. `txpool_inspect` ma ten sam kształt, ale każdą transakcję zastępuje ciągiem z podsumowaniem, takim jak `0x388c…9297: 1000000000000000000 wei + 21000 gas × 20000000000 wei`.",
          "Najbardziej przydatny jest podział na `pending` i `queued`. Pending oznacza, że transakcję można wykonać od razu: jej nonce bez luki następuje po bieżącym nonce konta. Queued oznacza, że jest wstrzymana, prawie zawsze z powodu luki w nonce (transakcja z nonce 12, gdy konto jest na 10, a nonce 11 nie istnieje) albo dlatego, że z innego powodu nie kwalifikuje się jeszcze do włączenia. Transakcja w `queued` nigdy nie trafi do bloku, dopóki luka nie zostanie wypełniona, a właśnie tej diagnozy nie da się uzyskać z [[eth-get-transaction-by-hash|eth_getTransactionByHash]], bo ta metoda w każdym z tych przypadków zgłasza po prostu wpis w mempoolu."
        ]
      },
      {
        heading: "Dlaczego rzadko jest dostępna",
        paragraphs: [
          "Żadna z tych metod nie należy do specyfikacji [[execution-apis|execution-apis]]; powstały w [[geth|Geth]] i z drobnymi różnicami zostały skopiowane przez [[nethermind|Nethermind]], [[erigon|Erigon]] i [[reth|Reth]]. Prawie żaden [[rpc-provider|provider RPC]] nie udostępnia `txpool_content`, z dwóch powodów. Odpowiedź jest ogromna: mempool na mainnecie w okresie dużego ruchu trzyma dziesiątki tysięcy transakcji, więc jedno wywołanie serializuje setki megabajtów i może przy tym zablokować węzeł. Poza tym zawartość jest wrażliwa biznesowo: mempool to lista tego, co ludzie zaraz zrobią, czyli surowiec dla [[mev|MEV]].",
          "Odpowiedź jest też ściśle lokalna. Mempool kształtują peery węzła, jego polityka wyrzucania transakcji, minimalna opłata i limity rozmiaru, więc dwa uczciwe węzły trzymają zbiory, które częściowo się pokrywają, ale się różnią, i żaden z nich nie jest „tym” mempoolem. Każdy wniosek w rodzaju „sieć ma N transakcji pending” wyciągnięty z jednego endpointu jest błędny z samej konstrukcji."
        ]
      },
      {
        heading: "W praktyce",
        paragraphs: [
          "Na własnym węźle ta przestrzeń nazw jest właściwym narzędziem dla nadawcy z utkniętymi transakcjami: `txpool_contentFrom` pokazuje dokładnie, które nonce są wstrzymane i z jaką opłatą, a to mówi, czy trzeba wypełnić lukę, podnieść opłatę, czy anulować. `txpool_status` jest na tyle tani, że można go scrapować bez przerwy, a liczba transakcji pending, która stale rośnie, podczas gdy head przesuwa się normalnie, to dobry wczesny sygnał presji na rynku opłat; zobacz [[observability|obserwowalność RPC]].",
          "Jeśli ta przestrzeń nazw ma być wystawiona na zewnątrz, to tylko `txpool_status`, a `content` i `inspect` trzeba trzymać za tymi samymi ograniczeniami co [[debug-api|przestrzeń nazw debug_]]; zobacz [[security|bezpieczeństwo RPC]]. Widoczność mempooli w całej sieci to [[mempool-streaming|produkt danych zbudowany z wielu węzłów]], a nie metoda RPC. [[eth-subscribe|eth_subscribe]] z `newPendingTransactions` daje ten sam lokalny widok w postaci strumienia zamiast zrzutu."
        ]
      }
    ],
    example: {
      title: "Zliczenie mempoola, a potem podgląd jednego nadawcy",
      note: "Nonce 502 jest queued, bo brakuje 501; nic nie włączy tej transakcji do bloku, dopóki luka nie zostanie wypełniona albo mempool jej nie wyrzuci."
    },
    pitfalls: [
      "Traktowanie liczników z `txpool_status` jako zaległości całej sieci; opisują mempool jednego węzła, ukształtowany przez jego peery i limity.",
      "Wywoływanie `txpool_content` na obciążonym węźle, co może serializować setki megabajtów i na ten czas spowolnić węzeł.",
      "Publiczne wystawienie tej przestrzeni nazw, co ujawnia zamierzoną transakcję każdego użytkownika, zanim trafi ona do bloku.",
      "Wniosek, że transakcja przepadła, bo jej tu nie ma; może być w mempoolu innego węzła albo już w bloku."
    ]
  },
  "net-web3-api": {
    title: "Metody net_ i web3_",
    aliases: ["net_version", "net_peerCount", "net_listening", "web3_clientVersion", "web3_sha3", "wersja klienta", "liczba peerów"],
    summary: "[[namespaces|Przestrzenie nazw]] `net_` i `web3_` to pięć drobnych metod pomocniczych, które zamiast czytać dane łańcucha identyfikują sieć i oprogramowanie klienta: `net_version`, `net_peerCount`, `net_listening`, `web3_clientVersion` i `web3_sha3`.",
    sections: [
      {
        heading: "Co zwraca każda z nich",
        paragraphs: [
          "`net_version` zwraca identyfikator sieci (network id) jako ciąg dziesiętny, `\"1\"` dla mainnetu, i tym odstaje od reszty API, w którym liczby są zapisywane jako [[hex-encoding|QUANTITY w hex]]. Metoda jest starsza niż `eth_chainId` i nie oznacza tego samego: network id rządzi handshake'ami [[devp2p|peer-to-peer]], a [[chain-id|chain ID]] chroni podpisy przed atakami replay. W głównych sieciach obie wartości się pokrywają, ale nie jest to regułą. Do wszystkiego, co dotyczy podpisywania, trzeba używać `eth_chainId`.",
          "`net_peerCount` zwraca w hex liczbę połączonych peerów, a `net_listening` zwraca boolean, który mówi, czy węzeł przyjmuje połączenia przychodzące. `web3_clientVersion` zwraca tekst wersji w dowolnym formacie, który identyfikuje implementację, na przykład `Geth/v1.15.11-stable-36b2371c/linux-amd64/go1.24.2` z [[geth|Geth]] albo `Nethermind/v1.31.0+ab12cd34/linux-x64/dotnet8.0.11` z [[nethermind|Nethermind]]. `web3_sha3` hashuje przekazane DATA i mimo nazwy zwraca [[keccak-256|Keccak-256]], a nie NIST SHA3-256; to pomyłka w nazewnictwie z czasów, zanim standard został sfinalizowany."
        ]
      },
      {
        heading: "Jak ustalić, z czym się rozmawia",
        paragraphs: [
          "`web3_clientVersion` to pierwsze wywołanie, które warto wykonać na nieznanym endpoincie. Mówi, do której implementacji trafiło żądanie, a od tego zależy, czy zadziała `trace_` albo `debug_`, czy dostępne jest [[eth-simulate|eth_simulateV1]] i jak będą sformułowane błędy. To także praktyczny sposób na badanie [[client-diversity|różnorodności klientów]], choć hostowany endpoint może odpowiadać w imieniu gatewaya, zwracać zamaskowany tekst albo rotować między kilkoma backendami z różnymi klientami.",
          "Teksty wersji mają dowolny format i klienci je zmieniają, więc trzeba je parsować ostrożnie: dopasowywać początkową nazwę implementacji, a wszystko, co po niej, traktować jako ciąg, którego się nie interpretuje. Zanim się ustali, co endpoint obsługuje, warto uzupełnić to kilkoma wywołaniami próbnymi; zobacz [[endpoint-capabilities|możliwości endpointu]]."
        ]
      },
      {
        heading: "Peery, health check i ograniczenia",
        paragraphs: [
          "`net_peerCount` powinien być częścią [[health-check|health checku]], bo zero peerów to awaria, której inne sygnały nie wychwytują: węzeł dalej odpowiada, [[eth-syncing|eth_syncing]] dalej zwraca `false`, a head po cichu przestaje się przesuwać. Ma to sens tylko na własnym węźle. [[rpc-provider|Provider]] odpowiada z gatewaya, który nie ma własnych peerów i często zwraca stałą wartość, więc wiarygodnie wyglądająca liczba z hostowanego endpointu niczego nie mówi o węźle, który za nim stoi.",
          "Żadna z tych metod nie czyta [[state|stanu]] ani historii, więc każda z pięciu jest tania i można ją bezpiecznie udostępnić; zwykle są na domyślnej liście modułów. `web3_sha3` to raczej ciekawostka niż narzędzie (lokalne hashowanie jest szybsze i nie wymaga round tripu), ale czasem przydaje się do sprawdzenia, czy własna implementacja Keccaka zgadza się z klientem."
        ]
      }
    ],
    example: {
      title: "Fingerprinting endpointu",
      note: "`net_version` i `eth_chainId` zwracają tę samą sieć w dwóch różnych kodowaniach; porównywanie ich jako tekstu to klasyczny błąd porównania."
    },
    pitfalls: [
      "Bezpośrednie porównywanie `net_version` z `eth_chainId`; jedno to ciąg dziesiętny, a drugie QUANTITY w hex.",
      "Używanie network id do ochrony przed replay; podpisy obejmują chain ID, a to dwa różne pojęcia.",
      "Ufanie `net_peerCount` z hostowanego endpointu, gdzie liczba opisuje gateway, a nie węzeł, który obsługuje żądania.",
      "Parsowanie `web3_clientVersion` sztywnym wzorcem; format jest dowolny i zmienia się między wydaniami.",
      "Oczekiwanie, że `web3_sha3` policzy SHA3-256; to Keccak-256, który dla tych samych danych daje inny skrót."
    ]
  },
  "admin-api": {
    title: "Przestrzeń nazw admin_",
    aliases: ["admin api", "administracja węzłem", "zarządzanie peerami", "dodawanie peerów", "informacje o węźle", "tożsamość węzła"],
    summary: "[[namespaces|Przestrzeń nazw]] `admin_` steruje samym węzłem, a nie odczytuje łańcuch: podaje tożsamość węzła i informacje o peerach, dodaje i usuwa peery, a w niektórych klientach potrafi uruchamiać i zatrzymywać listenery RPC.",
    sections: [
      {
        heading: "Metody",
        paragraphs: [
          "`admin_nodeInfo` zwraca tożsamość samego węzła: jego URL `enode`, rekord ENR, porty nasłuchu i sekcję `protocols` z identyfikatorem sieci, bieżącym headem, hashem bloku genesis i konfiguracją łańcucha. Pozwala jednym rzutem oka potwierdzić, że węzeł jest w oczekiwanej sieci i na oczekiwanym forku. `admin_peers` zwraca te same szczegóły dla każdego połączonego peera, w tym identyfikator jego klienta, wynegocjowane protokoły (capabilities), zdalny adres i ogłaszany head. To najszybszy sposób, żeby sprawdzić, czy peery są prawdziwe i na bieżąco, a nie zostały w tyle.",
          "`admin_addPeer` i `admin_removePeer` przyjmują URL `enode` i pozwalają ręcznie zarządzać połączeniami, a w klientach z listą zarezerwowanych miejsc dla peerów dochodzi `admin_addTrustedPeer`. [[geth|Geth]] dodaje `admin_startHTTP`, `admin_stopHTTP`, `admin_startWS` i `admin_stopWS`, a także `admin_datadir` i pomocnicze metody do importu i eksportu łańcucha. Dokładny zestaw metod zależy od klienta; [[nethermind|Nethermind]], [[erigon|Erigon]], [[reth|Reth]] i [[besu|Besu]] udostępniają każdy swój podzbiór."
        ]
      },
      {
        heading: "Dlaczego nigdy nie jest publiczna",
        paragraphs: [
          "Ta przestrzeń nazw zmienia zachowanie węzła, a jedna jej metoda sama w sobie jest eskalacją uprawnień: `admin_startHTTP` otwiera nowy listener HTTP z dowolną listą modułów, o jaką poprosi wywołujący. Każdy, kto ma dostęp do `admin_`, może więc przyznać sobie `debug_`, `personal_` albo cokolwiek innego, co obsługuje dany build, na wybranym przez siebie porcie. Ręczne podpinanie peerów to mniejsza, ale realna dźwignia, bo węzeł z ręcznie dobranymi peerami można atakiem eclipse odciąć od reszty sieci.",
          "Standardowa praktyka to trzymanie `admin_` wyłącznie na [[ipc-transport|IPC]], gdzie granicą bezpieczeństwa są uprawnienia systemu plików do `geth.ipc`, i całkowite pominięcie tej przestrzeni nazw w `--http.api`. Konsole klientów, takie jak `geth attach`, łączą się z nią przez ten socket. Nigdy nie pojawia się na endpoincie [[rpc-provider|dostawcy RPC]], a znalezienie jej na osiągalnym porcie HTTP to krytyczne znalezisko w każdym przeglądzie [[security|bezpieczeństwa RPC]]."
        ]
      },
      {
        heading: "Zastosowanie operacyjne",
        paragraphs: [
          "Na co dzień odpowiada na pytania o peering. Węzeł, który nie chce się zsynchronizować, często ma problem z [[discovery|discovery]] (wykrywaniem peerów): nie ma połączeń przychodzących, bo port nie jest przekierowany, albo wszystkie jego peery mają nieaktualne heady. `admin_peers` od razu pokazuje oba przypadki. `admin_addPeer` ze sprawdzonym `enode` pokazuje, czy połączenia wychodzące w ogóle działają, niezależnie od discovery.",
          "W ten sam sposób łączy się stałe topologie: sieć prywatną, devnet albo parę węzłów, które muszą być ze sobą połączone niezależnie od discovery. Dla konsensusowej połowy węzła odpowiedniki są w [[beacon-api|Beacon API]], w grupie ścieżek node, a [[engine-api|Engine API]] to trzeci, osobno uwierzytelniany interfejs. Żaden z tych trzech nie powinien dzielić listenera z publicznym ruchem."
        ]
      }
    ],
    example: {
      title: "Sprawdzanie tożsamości i peerów przez lokalny socket IPC",
      note: "Jeśli te metody odpowiadają przez HTTP spoza hosta, węzeł jest źle skonfigurowany i trzeba go traktować jako przejęty."
    },
    pitfalls: [
      "Dodawanie `admin` do listy modułów HTTP „tymczasowo”, na czas debugowania, co pozwala każdemu wywołującemu otworzyć nowy listener z dowolną włączoną przestrzenią nazw.",
      "Zakładanie, że niezerowa liczba peerów oznacza zdrowy peering; trzeba sprawdzić head ogłaszany przez każdego peera, bo nieaktualne peery też się liczą.",
      "Używanie `admin_addPeer` jako zastępstwa dla działającego discovery, co ukrywa prawdziwy problem z łącznością i grozi zestawem peerów przejętym atakiem eclipse.",
      "Oczekiwanie tego samego zestawu metod w każdym kliencie; ta przestrzeń nazw zależy od klienta i wspólny jest tylko mały rdzeń."
    ]
  },
  "engine-payload": {
    title: "Metody Engine API",
    aliases: [
      "engine_forkchoiceUpdated",
      "engine_newPayload",
      "engine_getPayload",
      "engine_exchangeCapabilities",
      "payloadId",
      "payload status",
      "status payloadu",
      "fcU"
    ],
    summary: "Metody `engine_` to czasowniki [[engine-api|Engine API]]: `engine_forkchoiceUpdated` ustawia head i opcjonalnie zaczyna budowanie bloku, `engine_getPayload` odbiera zbudowany blok, a `engine_newPayload` dostarcza blok z sieci do walidacji.",
    sections: [
      {
        heading: "Trzy główne metody",
        paragraphs: [
          "`engine_forkchoiceUpdatedVx` przyjmuje obiekt forkchoice state — `headBlockHash`, `safeBlockHash`, `finalizedBlockHash` — oraz opcjonalne `payloadAttributes`. Pierwszy parametr mówi [[execution-client|klientowi wykonawczemu]], który łańcuch traktować jako kanoniczny, i to on nadaje sens [[block-tag|tagom bloków]] `safe` i `finalized`. Gdy obecne jest `payloadAttributes` z `timestamp`, `prevRandao`, `suggestedFeeRecipient`, `withdrawals` i od Cancun z `parentBeaconBlockRoot`, klient zaczyna też składać blok i zwraca `payloadId`.",
          "`engine_getPayloadVx` wymienia ten `payloadId` na gotowy [[execution-payload|execution payload]]. Razem z nim zwraca `blockValue`, żeby [[consensus-client|klient konsensusu]] mógł porównać blok z ofertą buildera, `blobsBundle` z commitmentami i dowodami [[blob|blobów]] oraz `shouldOverrideBuilder`. V4 dodaje `executionRequests`, czyli [[execution-requests|listę z EIP-7685]] z depozytami, żądaniami wypłat i konsolidacjami. `engine_newPayloadVx` działa w drugą stronę: klient konsensusu przekazuje payload, który dostał z sieci, a klient wykonawczy go waliduje i wykonuje.",
          "Wokół nich są `engine_exchangeCapabilities`, przez którą oba procesy uzgadniają, jakie metody obsługuje każdy z nich, `engine_getPayloadBodiesByHashV1` i `…ByRangeV1` do uzupełniania body bloków podczas synchronizacji oraz `engine_getBlobsV1`, która pozwala klientowi konsensusu wziąć bloby, które klient wykonawczy już ma, zamiast czekać na gossip. Od aktualizacji Osaka ta metoda odpowiada kodem `-38005` i ustępuje miejsca `engine_getBlobsV2`, która zwraca każdy żądany blob z jego dowodami komórek (cell proofs) albo `null`, oraz `engine_getBlobsV3`, która dopuszcza częściowe odpowiedzi."
        ]
      },
      {
        heading: "Status payloadu i wersjonowanie",
        paragraphs: [
          "Zarówno `newPayload`, jak i `forkchoiceUpdated` odpowiadają obiektem `payloadStatus` z polami `status`, `latestValidHash` i `validationError`. `VALID` oznacza: wykonany i przyjęty. `INVALID` oznacza, że payload łamie reguły, a `latestValidHash` wskazuje ostatniego poprawnego przodka, żeby klient konsensusu mógł się wycofać. `SYNCING` oznacza, że klient wykonawczy nie ma jeszcze rodzica i zaczął go pobierać — to normalne podczas synchronizacji i właśnie dlatego świeży węzeł zgłasza optymistyczny head. `ACCEPTED` dotyczy payloadu z bocznego łańcucha, który jest jak dotąd poprawny, ale nie leży na bieżącym łańcuchu kanonicznym. Starsze wersje specyfikacji definiowały też `INVALID_BLOCK_HASH`.",
          "Metody dostają nową wersję przy [[hardfork|aktualizacji sieci]], bo każdy fork dodaje pola: V2 przyniosła [[withdrawals|wypłaty]] w Shapella, V3 pola blobów i `parentBeaconBlockRoot` w Cancun, V4 `executionRequests` w Prague, a w Osaka pojawiło się `engine_getPayloadV5`, którego `blobsBundle` niesie 128 dowodów komórek na blob na potrzeby [[data-availability|PeerDAS]] zamiast jednego dowodu, podczas gdy `newPayload` zostało przy V4. Klient musi przyjmować wersję pasującą do timestampu każdego payloadu i odrzucać niezgodne, więc aktualizacja jednej połówki węzła bez drugiej psuje parę przy forku błędami takimi jak `-38005 unsupported fork`. Inne kody specyficzne dla Engine API to `-38001 unknown payload` i `-38002 invalid forkchoice state`."
        ]
      },
      {
        heading: "Dlaczego aplikacje nigdy ich nie wywołują",
        paragraphs: [
          "To kanał sterowania, a nie API do danych. Metody nasłuchują na osobnym porcie, domyślnie 8551, za bearer tokenem JWT, podpisanym algorytmem HS256 z użyciem 32-bajtowego sekretu w hex, który oba procesy czytają z pliku, a claim `iat` musi się mieścić w około 60 sekundach od bieżącego czasu; zobacz [[authentication|uwierzytelnianie RPC]]. Nic tutaj nie czyta danych łańcucha wygodniej niż metody `eth_`, a ktoś, kto dosięgnie tego portu, może ustawić head na wybrany przez siebie blok.",
          "Ruch ma stały rytm, jak heartbeat. W każdym 12-sekundowym slocie klient konsensusu wywołuje `forkchoiceUpdated` co najmniej raz, żeby ponowić wskazanie head. Gdy [[validator|walidator]] tego węzła ma zaproponować blok, wywołuje je ponownie z `payloadAttributes`, a potem `getPayload`, albo zamiast tego bierze blok buildera przez [[mev-boost|MEV-Boost]]. Payloady od innych proposerów przychodzą przez `newPayload`. Jeśli [[eth-syncing|eth_syncing]] zwraca `false`, a head stoi w miejscu, zwykle ta rozmowa się urwała: klient konsensusu nie działa, sekret JWT się nie zgadza albo zegary rozjechały się poza okno `iat`."
        ]
      }
    ],
    example: {
      title: "Ustawienie head i zamówienie bloku do zaproponowania",
      note: "Bez `payloadAttributes` to samo wywołanie jest zwykłą aktualizacją head; z nimi zleca też zbudowanie bloku i zwraca `payloadId`, po którym można ten blok odebrać."
    },
    pitfalls: [
      "Wystawienie portu 8551 poza hosta, co daje atakującemu możliwość ustawienia head węzła.",
      "Aktualizacja jednego klienta przed forkiem bez drugiego, po czym para pada na niezgodnościach wersji, takich jak `-38005 unsupported fork`.",
      "Odczytywanie `SYNCING` jako błędu; oznacza to, że klientowi wykonawczemu brakuje rodzica i właśnie go pobiera, co jest normalne podczas synchronizacji.",
      "Dopuszczenie do rozjechania się zegarów obu procesów, co unieważnia claim `iat` w JWT i po cichu przerywa rozmowę."
    ]
  },
  "beacon-endpoints": {
    title: "Endpointy Beacon API",
    aliases: [
      "endpointy beacon api",
      "ścieżki beacon api",
      "rest api warstwy konsensusu",
      "status synchronizacji beacon node",
      "pobieranie blobów",
      "checkpointy finalności"
    ],
    summary: "[[beacon-api|Beacon API]] to REST, a nie JSON-RPC: dane konsensusu pobiera się przez HTTP GET ze ścieżek takich jak `/eth/v1/beacon/headers` i `/eth/v2/beacon/blocks/{block_id}`, liczby są zapisane dziesiętnie, a odpowiedź może być opcjonalnie zakodowana w SSZ.",
    sections: [
      {
        heading: "Jak wygląda ten interfejs",
        paragraphs: [
          "[[beacon-node|Beacon node]] wystawia te ścieżki na własnym porcie: [[lighthouse|Lighthouse]] i [[nimbus|Nimbus]] na 5052, [[teku|Teku]] na 5051, [[lodestar|Lodestar]] na 9596, a REST gateway [[prysm|Prysma]] na 3500. To inny port niż 8545 klienta wykonawczego i 8551 [[engine-api|Engine API]]. Każda odpowiedź opakowuje dane w pole `data`, błędy to kody statusu HTTP zamiast obiektów błędów JSON-RPC, a liczby to dziesiętne ciągi znaków, na przykład `\"7654321\"`, a nie [[hex-encoding|hex]]. Kod pracujący z obiema warstwami musi przy przejściu między nimi całkowicie zmienić konwencje.",
          "Ścieżki parametryzuje się identyfikatorami, a nie body żądania. `block_id` to `head`, `genesis`, `finalized`, numer [[slot-epoch|slotu]] albo root bloku; `state_id` przyjmuje dodatkowo `justified` oraz [[state-root|state root]]. Nagłówek `Accept: application/octet-stream` sprawia, że odpowiedź przychodzi w [[ssz|SSZ]] zamiast JSON, co przy całych blokach i stanach daje znacznie mniejsze dane, a nagłówek `Eth-Consensus-Version` podaje fork, z którego schematu korzysta odpowiedź."
        ]
      },
      {
        heading: "Ścieżki ważne przy pracy z RPC",
        paragraphs: [
          "`/eth/v1/node/syncing` to health check po stronie konsensusu; zwraca `head_slot`, `sync_distance`, `is_syncing`, `is_optimistic` i `el_offline`. Dwa ostatnie pola nie mają odpowiednika w warstwie wykonawczej: `is_optimistic` oznacza, że bloki zaimportowano, zanim zweryfikował je [[execution-client|klient wykonawczy]], a `el_offline` mówi, że połączenie między klientami jest zerwane. To dokładnie ta sytuacja, w której [[eth-syncing|eth_syncing]] zwraca `false`, a head stoi w miejscu.",
          "`/eth/v1/beacon/headers/{block_id}` zwraca nagłówek [[beacon-block|bloku beacon]] z jego rootem i informacją, czy blok jest kanoniczny. `/eth/v2/beacon/blocks/{block_id}` zwraca cały podpisany blok razem z [[execution-payload|execution payload]] i właśnie w ten sposób mapuje się slot na numer bloku warstwy wykonawczej. `/eth/v1/beacon/states/{state_id}/finality_checkpoints` zwraca poprzedni checkpoint justified, bieżący checkpoint justified i checkpoint finalized; to rozstrzygające źródło dla `finalized`, a dla `safe` tylko na kliencie konsensusu bez [[fast-confirmation-rule|Fast Confirmation Rule]], bo klient, który ją stosuje, ustawia `safe` jeden lub dwa sloty za headem (zobacz [[finality|finalność]]). `/eth/v1/beacon/states/{state_id}/validators/{validator_id}` zwraca saldo i status [[validator|walidatora]].",
          "`/eth/v1/beacon/blobs/{block_id}` serwuje dane [[blob|blobów]], których metody warstwy wykonawczej nigdy nie zwracają. Ta ścieżka zastąpiła `/eth/v1/beacon/blob_sidecars/{block_id}`, którą w beacon-APIs v4.0.0 oznaczono jako deprecated w związku z Fulu. Od Fulu węzeł [[peerdas|przechowuje kolumny danych]], a nie całe bloby, więc odpowiadać na nią muszą tylko supernode'y, czyli węzły przechowujące każdą kolumnę. Dane są trzymane przez mniej więcej 18 dni; potem starsze bloby znikają, chyba że zachowało je [[blob-archive|archiwum blobów]]. `/eth/v1/events` to [[server-sent-events|strumień server-sent events]] z parametrem zapytania `topics`, który przyjmuje między innymi `head`, `finalized_checkpoint` i `chain_reorg`. To odpowiednik [[eth-subscribe|eth_subscribe]] po stronie konsensusu i jedyne miejsce, w którym [[reorg|reorg]] przychodzi jako jawny event, a nie coś, co trzeba wywnioskować."
        ]
      },
      {
        heading: "Kto z niego korzysta",
        paragraphs: [
          "Najintensywniej korzysta z niego [[validator-client|klient walidatora]]: pobiera obowiązki i wysyła podpisane obiekty przez ścieżki `/eth/v1/validator/…`. Dashboardy stakingowe odczytują status i salda walidatorów, [[checkpoint-sync|checkpoint sync]] pobiera niedawny sfinalizowany stan ze ścieżki `/eth/v2/debug/beacon/states/{state_id}` zaufanego dostawcy, a [[light-client|lekcy klienci]] śledzą aktualizacje `/eth/v1/beacon/light_client/…` oparte na podpisach [[sync-committee|sync committee]].",
          "Twórcom aplikacji przydaje się w dwóch sytuacjach: gdy potrzebne są fakty z warstwy konsensusu, których API warstwy wykonawczej nie udostępnia, na przykład czy slot został pominięty albo który walidator był proposerem, oraz przy diagnozowaniu węzła, którego strona wykonawcza wygląda zdrowo, ale nie idzie do przodu. Większość [[rpc-provider|dostawców RPC]] sprzedaje tylko endpointy warstwy wykonawczej, więc endpoint Beacon zwykle oznacza własny [[beacon-node|beacon node]]."
        ]
      }
    ],
    example: {
      title: "Status synchronizacji, checkpointy finalności i nagłówek",
      note: "Każda liczba jest dziesiętnym ciągiem znaków, a sloty to nie numery bloków: pominięty slot nie daje bloku, więc oba liczniki trwale się rozjeżdżają."
    },
    pitfalls: [
      "Parsowanie dziesiętnych ciągów jako hex, bo do hex przyzwyczaiło API warstwy wykonawczej; `\"9871234\"` to nie `0x9871234`.",
      "Utożsamianie slotów z numerami bloków warstwy wykonawczej; przez pominięte sloty oba liczniki są przesunięte o wartość, która tylko rośnie.",
      "Żądanie blobów dla starych bloków, choć bloby są usuwane po mniej więcej 18 dniach, albo od węzła, który nie jest supernode'em i od Fulu w ogóle nie musi trzymać całych blobów.",
      "Odczytywanie `is_syncing: false` bez spojrzenia na `is_optimistic` i `el_offline`, czyli pola, które ujawniają zerwane połączenie z klientem wykonawczym.",
      "Zakładanie, że endpoint RPC warstwy wykonawczej obsługuje te ścieżki; to inny proces na innym porcie."
    ]
  },
  "client-namespaces": {
    title: "Przestrzenie nazw specyficzne dla klientów",
    aliases: [
      "niestandardowe metody rpc",
      "metody erigon",
      "api otterscan",
      "moduły nethermind",
      "metody specyficzne dla klienta",
      "przestrzenie nazw klientów"
    ],
    summary: "Przestrzenie nazw specyficzne dla klientów to grupy metod, które [[execution-client|klient wykonawczy]] albo towarzyszący mu węzeł dodaje ponad standardowy zestaw `eth_`, `net_` i `web3_`. Erigon ma `erigon_`, Otterscan definiuje API `ots_`, Nethermind ma `parity_` i `proof_`, Reth ma `reth_`, a Besu `qbft_` i `perm_`. Każdą z nich włącza się osobno na danym listenerze i odpowiada na nią tylko oprogramowanie, które ją implementuje.",
    sections: [
      {
        heading: "Co dodają klienci",
        paragraphs: [
          "[[erigon|Erigon]] udostępnia pomocnicze metody `erigon_`, takie jak `erigon_getHeaderByNumber`, `erigon_getBlockByTimestamp`, `erigon_getBalanceChangesInBlock` i `erigon_getLogsByHash`, a także API `ots_`, na którym działa eksplorator [[otterscan|Otterscan]]: `ots_getApiLevel`, `ots_searchTransactionsBefore` i `ots_searchTransactionsAfter` do historii adresu, `ots_getInternalOperations`, `ots_getContractCreator`. [[reth|Reth]] też implementuje `ots_`, ale częściowo: na obie metody wyszukiwania odpowiada błędem `unimplemented`, a `erigon_getHeaderByNumber` obsługuje jako alias. Jego własna przestrzeń nazw `reth_` dodaje `reth_getBalanceChangesInBlock` i subskrypcje powiadomień o zmianach łańcucha. Anvil również udostępnia `ots_`.",
          "[[nethermind|Nethermind]] zachował z czasów Parity moduł `parity_`, z `parity_pendingTransactions`, `parity_getBlockReceipts` i `parity_netPeers`, oraz ma moduł `proof_`. Jego `proof_getTransactionReceipt` zwraca receipt razem z dowodami trie transakcji i receiptu względem rootów bloku, czyli [[receipt-proof|dowód receiptu]], którego nie daje żadna standardowa metoda, a `proof_call` zwraca wynik wywołania razem z [[witness|witnessem]] wykonania. [[geth|Geth]] obok [[admin-api|admin_]] dodaje `miner_` z `miner_setExtra`, `miner_setGasPrice` i `miner_setGasLimit`. [[besu|Besu]] dodaje `ibft_` i `qbft_`, na przykład `qbft_getValidatorsByBlockNumber`, oraz metody allowlisty `perm_` dla [[permissioned-network|sieci permissioned]]; jego grupy prywatności `priv_` i `eea_` usunięto w wersji 25.7.0."
        ]
      },
      {
        heading: "Przestrzenie nazw poza klientem wykonawczym",
        paragraphs: [
          "Na niektóre prefiksy odpowiada zupełnie inny proces. W OP Stack węzeł rollupu `op-node` serwuje `optimism_syncStatus`, `optimism_outputAtBlock`, `optimism_rollupConfig` i `optimism_version` na własnym porcie, a stojący obok klient wykonawczy odpowiada na `eth_`; zobacz [[l2-rpc|różnice RPC na L2]]. [[local-devnet|Węzły deweloperskie]] dodają metody `anvil_`, `evm_` i `hardhat_`, których nie przyjmie żaden produkcyjny endpoint. Część nazw pod `eth_` należy w ogóle do innego oprogramowania: na `eth_sendUserOperation` odpowiadają [[erc-4337|bundlery]], a na [[mev-bundle|metody bundli]] builderzy."
        ]
      },
      {
        heading: "Jak je włączyć",
        paragraphs: [
          "Każdy klient dopuszcza przestrzenie nazw przez allowlistę ustawianą osobno dla każdego listenera, jak opisano w [[namespaces|przestrzeniach nazw RPC]]. Erigon i Reth przyjmują `--http.api`, przy czym Reth akceptuje `admin`, `debug`, `eth`, `net`, `trace`, `txpool`, `web3`, `rpc`, `reth`, `ots`, `flashbots`, `miner`, `mev` i `testing`. W Nethermind 2.0 `JsonRpc.EnabledModules` ma domyślnie wartość `[Eth,Subscribe,Trace,TxPool,Web3,Proof,Net,Parity,Health,Rpc]`, więc `proof_` i `parity_` są już włączone. `--rpc-http-api` w Besu ma domyślnie `ETH,NET,WEB3` i przyjmuje `QBFT` albo `PERM` pisane wielkimi literami.",
          "`rpc_modules`, obsługiwane przez Geth, Nethermind i Reth, wypisuje przestrzenie nazw włączone na danym listenerze, każdą z ciągiem wersji. Nie mówi nic o tym, które metody wewnątrz przestrzeni nazw działają, a to ważne, gdy dwie implementacje mają ten sam prefiks: Erigon i Reth zgłaszają `ots_` na poziomie API 8, choć różnią się tym, na co faktycznie odpowiadają."
        ]
      },
      {
        heading: "Koszt przenośności",
        paragraphs: [
          "Kod napisany pod przestrzeń nazw jednego klienta jest z tym klientem związany na dobre. Gdy tylko [[failover|failover]] skieruje ruch do węzła z innym oprogramowaniem, wywołania kończą się błędem `-32601`, a [[indexer|indekser]] oparty na `ots_searchTransactionsBefore` albo `erigon_getBlockByTimestamp` staje. Gateway może utrzymać takie metody przy życiu tylko wtedy, gdy kieruje je do puli węzłów, które je obsługują, a to wymaga zapisania [[endpoint-capabilities|możliwości]] każdego upstreamu metoda po metodzie, zamiast ufać nazwie klienta. Tam, gdzie pojawiła się już standardowa metoda, tak jak [[eth-get-block-receipts|eth_getBlockReceipts]] dla receiptów całego bloku, przenośnym wyborem jest metoda standardowa. Kod, który działa wewnątrz klienta, zamiast go wywoływać, to jeszcze inna sprawa; zobacz [[client-extensions|rozszerzenia klientów]]."
        ]
      }
    ],
    example: {
      title: "To samo wywołanie Otterscana na trzech endpointach",
      note: "`-32601` oznacza, że na tym endpoincie nie ma danej przestrzeni nazw; `-32603` z `unimplemented` oznacza, że przestrzeń nazw jest, ale ta metoda to zaślepka, czego nie ujawnia ani ciąg wersji, ani lista modułów."
    },
    pitfalls: [
      "Budowanie indeksera na metodach `ots_` albo `erigon_` i odkrycie dopiero przy failoverze, że zapasowy węzeł działa na innym kliencie.",
      "Traktowanie `ots_getApiLevel` równego 8 jako dowodu, że działa każda metoda Otterscana, podczas gdy Reth ma w miejscu wyszukiwania historii adresów tylko zaślepki.",
      "Wysyłanie `optimism_syncStatus` do klienta wykonawczego OP Stack zamiast do `op-node`, czyli procesu, który tę metodę obsługuje.",
      "Zakładanie, że przestrzeń nazw jest wyłączona, bo nikt jej nie włączył, podczas gdy domyślna lista modułów Nethermind zawiera już `Proof`, `Parity` i `Trace`.",
      "Kopiowanie linii poleceń Besu z `PRIV` albo `EEA`, czyli grupami, których obecne wersje już nie przyjmują."
    ]
  },
  "mev-bundle": {
    title: "Bundle MEV",
    aliases: [
      "MEV bundle",
      "bundle",
      "eth_sendBundle",
      "eth_callBundle",
      "eth_cancelBundle",
      "mev_sendBundle",
      "revertingTxHashes",
      "replacementUuid",
      "X-Flashbots-Signature",
      "symulacja bundla"
    ],
    summary: "Bundle [[mev|MEV]] to uporządkowana lista podpisanych transakcji wysyłana do builderów metodą `eth_sendBundle`. Transakcje mają się wykonać w tej kolejności w jednym docelowym [[block|bloku]] albo wcale, a wcześniej można je zasymulować metodą `eth_callBundle`. Te metody to konwencje builderów zapoczątkowane przez Flashbots, a nie część standardowego API wykonawczego.",
    sections: [
      {
        heading: "Obiekt bundla",
        paragraphs: [
          "`eth_sendBundle` przyjmuje jeden obiekt. `txs` to lista podpisanych transakcji w surowej postaci; może się wśród nich znaleźć cudza transakcja pending skopiowana z [[mempool|mempoolu]]. `blockNumber` to numer jedynego bloku, dla którego bundle jest ważny, zapisany w hex. `minTimestamp` i `maxTimestamp` opcjonalnie ograniczają jego ważność w czasie; to uniksowe timestampy w sekundach, wysyłane jako zwykłe liczby. `revertingTxHashes` wskazuje transakcje, którym wolno zakończyć się [[revert|revertem]]; bez tego pola dowolny revert unieważnia cały bundle. `replacementUuid` to identyfikator do późniejszej podmiany albo anulowania, a `builders` wymienia zarejestrowanych builderów, którym relay ma przekazać bundle. W odpowiedzi przychodzi `bundleHash`.",
          "Gwarancje to atomowość i kolejność w obrębie jednego bloku: wszystkie transakcje trafiają do bloku w podanej kolejności albo nie trafia żadna, a bundle, który by się nie powiódł, nic nie kosztuje, bo po prostu zostaje pominięty. Właśnie za to płaci [[searcher|searcher]] i z tego też wynika, że strategia nastawiona na trzy najbliższe bloki wysyła trzy bundle, po jednym na każdy `blockNumber`. Builder wkłada zaakceptowane bundle do bloków, które oferuje przez [[builder-api|Builder API]]. Relay Flashbots przyjmuje najwyżej 100 transakcji i 300 000 bajtów na bundle."
        ]
      },
      {
        heading: "Symulacja przez eth_callBundle",
        paragraphs: [
          "`eth_callBundle` przyjmuje te same `txs`, `blockNumber`, czyli blok, w kontekście którego odbywa się symulacja, `stateBlockNumber`, czyli blok, którego stan jest punktem wyjścia (liczba albo tag, na przykład `latest`), oraz opcjonalny `timestamp`. Wykonuje transakcje po kolei, przy czym każda widzi zmiany zapisane przez poprzednie, i zwraca dla każdej transakcji wpis z polami `txHash` i `gasUsed`, z `coinbaseDiff` rozbitym na `gasFees` z priority fee i `ethSentToCoinbase` z całej reszty oraz albo z `value` z danymi zwróconymi przez wywołanie, albo z `revert` z danymi revertu. Po nich idą sumy dla całego bundla, a `bundleGasPrice` to łączny `coinbaseDiff` podzielony przez zużyty gas. Nawet `gasPrice` pojedynczej transakcji zależy od implementacji: w udokumentowanym przykładzie Flashbots to `coinbaseDiff` tej transakcji podzielony przez jej gas, a Reth podaje efektywny priority fee.",
          "Revert nie powoduje błędu całego wywołania; widać go we wpisie danej transakcji, a to, czy prawdziwy bundle go przetrwa, zależy od `revertingTxHashes`, którego symulacja nie uwzględnia. Kodowanie łamie nawyki wyniesione z metod `eth_`: kwoty w wei to dziesiętne stringi, a `gasUsed` i `stateBlockNumber` to zwykłe liczby JSON. Symulacja działa też na stanie z ustalonego bloku, a w prawdziwym bloku przed bundlem mogą się wykonać inne transakcje, więc wynik jest prognozą, a nie gwarancją, tak samo jak w [[eth-simulate|eth_simulateV1]]. Metodę obsługuje relay Flashbots, a [[reth|Reth]] odpowiada na nią z własnego modułu `eth`."
        ]
      },
      {
        heading: "Podmiana, anulowanie i MEV-Share",
        paragraphs: [
          "Wysłanie nowego bundla z tym samym `replacementUuid` zastępuje poprzedni. `eth_cancelBundle` przyjmuje `replacementUuid` i sprawia, że builderzy Flashbots przestają używać bundla w kolejnych ofertach, ale oferta już wysłana do [[relay|relaya]] nie zostaje wycofana, więc anulowany bundle wciąż może trafić do bloku, jeśli ta oferta wygra.",
          "`mev_sendBundle` z [[mev-share|MEV-Share]] to osobny format, a nie wariant poprzedniego. Ma pole `version`, obiekt `inclusion` z polem `block` i opcjonalnym `maxBlock`, dzięki czemu jedno zgłoszenie może objąć zakres bloków, pole `body`, którego elementy to `{hash}` dla transakcji użytkownika znanej searcherowi tylko z hasha, `{tx, canRevert}` dla podpisanej transakcji albo zagnieżdżony bundle, oraz obiekty `validity` i `privacy` do zwrotów (refunds) i podpowiedzi (hints). Od 20 października 2025 Flashbots przyjmuje w takim bundlu tylko jedną transakcję backrunu. Symuluje się go metodą `mev_simBundle`."
        ]
      },
      {
        heading: "Podpis i rozsyłanie do wielu builderów",
        paragraphs: [
          "Endpointy Flashbots wymagają nagłówka `X-Flashbots-Signature` w postaci `address:signature`, gdzie część po dwukropku to podpis EIP-191 w wariancie personal message, złożony nad hashem Keccak-256 (zakodowanym w hex) dokładnie tego body, które idzie w żądaniu. Nada się dowolny klucz; adres służy jako tożsamość, pod którą buduje się reputację, i nigdy nie powinien należeć do klucza trzymającego środki. Ponieważ podpis obejmuje dokładnie te bajty, ponowna serializacja body po podpisaniu go unieważnia. Flashbots stosuje ten sam nagłówek w swoich metodach do [[private-rpc|prywatnych transakcji]].",
          "Searcherzy wysyłają każdy bundle do wielu builderów, a każdy endpoint mówi własnym dialektem. Na przykład BuilderNet dodaje `replacementNonce`, `droppingTxHashes`, `refundPercent`, `refundRecipient` i `refundTxHashes`, a podmianę opisuje w dokumentacji przez `eth_sendBundle`, nie wymieniając `eth_cancelBundle`. Żaden [[eip|EIP]] tego nie definiuje, więc kod rozsyłający bundle trzyma osobny adapter dla każdego buildera."
        ]
      }
    ],
    example: {
      title: "Symulacja bundla z dwiema transakcjami przez eth_callBundle",
      note: "Druga transakcja płaci builderowi 0,05 etheru bezpośrednio; `ethSentToCoinbase` oddziela tę płatność od jej priority fee wynoszącego 1 gwei, a jej `gasPrice` liczony w stylu Flashbots tę płatność uwzględnia. Kwoty w wei to dziesiętne stringi, a `gasUsed` i `stateBlockNumber` to zwykłe liczby."
    },
    pitfalls: [
      "Wysłanie bundla raz i czekanie, choć każde zgłoszenie dotyczy dokładnie jednego bloku i trzeba je powtórzyć dla następnego.",
      "Traktowanie odpowiedzi `eth_callBundle` bez błędu jako pomyślnej symulacji, zanim sprawdzi się, czy któryś wpis nie zawiera pola `revert`.",
      "Parsowanie `coinbaseDiff` albo `gasFees` jako wartości QUANTITY w hex, choć odpowiedzi dla bundli zawierają dziesiętne stringi.",
      "Formatowanie (pretty-print) albo ponowna serializacja body żądania po obliczeniu `X-Flashbots-Signature`, co unieważnia podpis.",
      "Traktowanie `eth_cancelBundle` jak gwarancji, choć oferta, która już dotarła do relaya, nadal może wprowadzić bundle do bloku."
    ]
  },
  "deployless-call": {
    title: "Wywołania deployless",
    aliases: [
      "deployless",
      "deployless read",
      "deployless multicall",
      "eth_call bez to",
      "wywołanie bez wdrożenia",
      "konstruktor zwracający wynik",
      "nadpisanie kodu",
      "code override",
      "counterfactual call"
    ],
    summary: "Wywołanie deployless uruchamia kod pomocniczy, który nie jest nigdzie wdrożony: albo jako creation code w [[eth-call|eth_call]] bez `to`, którego konstruktor zwraca odpowiedź, albo jako runtime code umieszczony pod adresem przez [[state-override|state override]], dzięki czemu jedno żądanie może zgrupować odczyty albo sprawdzić podpisy na dowolnym łańcuchu.",
    sections: [
      {
        heading: "Creation code jako zapytanie",
        paragraphs: [
          "Niektóre odczyty wymagają kontraktu pomocniczego, którego łańcuch nie ma: Multicall3 do grupowania odczytów na nowym łańcuchu, weryfikatora podpisów dla smart konta, które jeszcze nie istnieje, albo kontraktu lens napisanego dla jednego dashboardu. Wywołanie deployless uruchamia taki kontrakt bez wdrażania go. Pierwszy sposób to utworzenie kontraktu. Wywołanie eth_call bez `to` symuluje wdrożenie: węzeł uruchamia `data` jako initcode, czyli kod wykonywany jeden raz przy tworzeniu kontraktu, a to, co ten kod przekaże opcode'owi `RETURN`, normalnie stałoby się runtime code nowego [[smart-contract|smart kontraktu]], czyli kodem, który od tej pory wykonuje się pod jego adresem. W wywołaniu nic nie zostaje zapisane, a węzeł zwraca te bajty jako `result`. Konstruktor, który wykonuje odczyty i zamiast kodu zwraca odpowiedź, staje się więc zapytaniem; jego argumenty koduje się według [[abi|ABI]] i dokleja do creation code dokładnie tak jak przy prawdziwym wdrożeniu.",
          "Wzorcowym przypadkiem jest `ValidateSigOffchain` z ERC-6492: jego konstruktor tworzy `UniversalSigValidator`, sprawdza podpis portfela, który może jeszcze nie istnieć, najpierw uruchamiając fabrykę tego portfela, a potem wykonuje `mstore(0, isValidSig)` i `return(31, 1)`, więc wynikiem jest jeden bajt, `0x01` albo `0x00`; zobacz [[erc-6492|ERC-6492]] i [[erc-1271|ERC-1271]]. viem ma ten wzorzec wbudowany w akcję `call`: z parametrem `code` opakowuje creation code wskazanego kontraktu w konstruktor, który wdraża go przez `CREATE2` i wywołuje, a z `factory` i `factoryData` najpierw uruchamia fabrykę, jeśli pod docelowym adresem nie ma jeszcze kodu, jak w przypadku [[erc-4337|smart konta]], które nie zostało wdrożone. Jego `multicall` z `deployless: true` wysyła w ten sam sposób creation code [[multicall|Multicall3]] i calldata `aggregate3`, jako eth_call bez `to`, na łańcuchach, na których Multicall3 nie jest wdrożony."
        ]
      },
      {
        heading: "Kod wstawiony przez nadpisanie",
        paragraphs: [
          "Drugi sposób zapisuje runtime code pod adresem przez pole `code` w [[state-override|state override]] i wywołuje ten adres normalnie. Kod działa na storage tego adresu, który jest pusty, chyba że też go nadpisano. Zastosowania to między innymi instalacja Multicall3 pod `0xcA11bde05977b3631167028862bE2a173976CA11` na łańcuchu, który go nie ma, skaner sald, który czyta setki sald w jednym wywołaniu, kontrakt lens, którego nikt nie wdrożył, oraz podmiana kodu prawdziwego kontraktu na wersję z dodatkowym getterem, co ujawnia jego zmienne wewnętrzne, bo własny storage kontraktu zostaje na miejscu.",
          "Te dwa sposoby różnią się wymaganiami. Ścieżka przez tworzenie kontraktu nie potrzebuje niczego poza eth_call, więc działa na endpointach, które usuwają albo odrzucają nadpisania; ścieżka przez nadpisanie wymaga trzeciego parametru, który niektórzy [[rpc-provider|dostawcy RPC]] po cichu pomijają, a w [[eth-estimate-gas|eth_estimateGas]] obsługa jest jeszcze bardziej wybiórcza. Bytecode, któremu jest obojętne, jak go uruchomiono, działa na oba sposoby: 55-bajtowy skaner sald z przykładu zwraca te same 64 bajty jako initcode i jako nadpisany kod."
        ]
      },
      {
        heading: "Ograniczenia",
        paragraphs: [
          "Wynik deployless jest sprawdzany jak kod kontraktu, bo dla [[evm|EVM]] nim jest. Wynik, którego pierwszy bajt to `0xEF`, zostaje odrzucony na mocy EIP-3541, jako `invalid code: must not begin with 0xef` w Geth i `CreateContractStartingWithEF` w Reth. Wynik dłuższy niż 24 576 bajtów, czyli limit rozmiaru kodu z EIP-170 na mainnecie (kod źródłowy Getha definiuje już 65 536 dla aktualizacji Amsterdam, jeszcze nieaktywnej), kończy się błędem `max code size exceeded` w Geth i `EVM error: CreateContractSizeLimit` w Reth. Jeden hash na 256 zaczyna się od `0xEF`, więc odczyt deployless funkcji zwracającej surowy hash `bytes32` zawodzi mniej więcej raz na 256 wywołań, a duży multicall deployless zawodzi, gdy jego dane zwrotne przekroczą 24 KB, podczas gdy ten sam kod zainstalowany przez nadpisanie `code` zwraca każdy z tych wyników. Wejście też ma limit: od aktualizacji Shanghai EIP-3860 ogranicza initcode do 49 152 bajtów, a `data` o długości 49 153 bajtów kończy się błędem `max initcode size exceeded`. Każdy zwrócony bajt kosztuje też 200 gasu opłaty code deposit, czyli opłaty za zapisanie nowego kodu.",
          "Reszta to zwykły budżet eth_call. Kontrakt pomocniczy i każde wywołanie, które wykonuje, dzielą gas cap węzła, czyli najwięcej gasu, ile może spalić jedno wywołanie: domyślnie 50 000 000 w [[geth|Geth]] (`--rpc.gascap`) i 100 000 000 w [[nethermind|Nethermind]] (`JsonRpc.GasCap`), a do tego dochodzi [[request-cancellation|timeout wykonania]] węzła. Ten limit jest znacznie wyższy niż 16 777 216 gasu, na które EIP-7825 pozwala prawdziwej transakcji od aktualizacji Fusaka: Geth, Nethermind i [[reth|Reth]] pomijają ten limit dla eth_call, ale przycinają do niego eth_estimateGas, więc kontrakt pomocniczy, który spala 20 milionów gasu, zadziała jako wywołanie, ale nie da się dla niego oszacować gasu."
        ]
      }
    ],
    example: {
      title: "Jeden 55-bajtowy skaner sald uruchomiony na dwa sposoby",
      note: "Initcode żądania 3 zwraca 32-bajtowe słowo zaczynające się od `0xEF`, którego nie może wyprodukować żadne tworzenie kontraktu; te same bajty zainstalowane przez nadpisanie `code` wracają jako `0xef00…0001` bez żadnych zastrzeżeń."
    },
    pitfalls: [
      "Zwracanie surowego `bytes32` z konstruktora deployless, przez co mniej więcej jeden wynik na 256 zaczyna się od `0xEF` i wywołanie kończy się błędem.",
      "Rozbudowywanie multicalla deployless, aż jego dane zwrotne przekroczą 24 576 bajtów, co wywraca cały batch, a nie jedno wywołanie.",
      "Wstawianie creation code do nadpisania `code`, gdzie logika konstruktora wykonuje się jako runtime code, a doklejonych argumentów brakuje.",
      "Poleganie na nadpisaniu u dostawcy, który je usuwa, przez co wywołanie trafia na pusty adres i zwraca `0x`."
    ]
  },
  "storage-slot-discovery": {
    title: "Znajdowanie slotów storage tokena",
    aliases: [
      "slot salda",
      "slot allowance",
      "balance slot",
      "nadpisanie salda",
      "wykrywanie slotów storage",
      "deal cheatcode",
      "ERC-7201",
      "slot mappingu"
    ],
    summary: "Wyszukiwanie slotów storage to ustalanie, który [[contract-storage|slot storage]] tokena przechowuje `balanceOf[holder]` albo `allowance[owner][spender]`, tak żeby symulator mógł ustawić fikcyjne saldo albo zgodę (approve) przez [[state-override|state override]], zamiast potrzebować prawdziwych środków.",
    sections: [
      {
        heading: "Po co potrzebny jest slot",
        paragraphs: [
          "[[transaction-simulation|Podgląd transakcji w portfelu]], [[dex-aggregator|agregator]] weryfikujący wycenę dla użytkownika, który jeszcze nie dał zgody (approve), i [[fork-testing|test na forku]] chcą uruchomić transakcję tak, jakby adres miał tokeny, których nie ma. Nadpisanie nie może ustawić salda tokena bezpośrednio: ustawia słowa storage, czyli numerowane 32-bajtowe sloty, w których kontrakt trzyma swoje zmienne, a saldo to to, co kod tokena z nich obliczy. W Solidity `mapping(address => uint256)` zadeklarowany w slocie `p` trzyma wpis dla `holder` pod `keccak256(pad32(holder) . pad32(p))`, gdzie `pad32` dopełnia wartość zerami z lewej do 32 bajtów, a `.` łączy obie wartości. Zagnieżdżone `allowance[owner][spender]` stosuje tę regułę dwa razy, najpierw dla właściciela: `keccak256(pad32(spender) . keccak256(pad32(owner) . pad32(p)))`. WETH trzyma salda w slocie 3, a allowance w slocie 4; USDC w 9 i 10.",
          "Inne kompilatory i biblioteki używają innych wzorów. Vyper hashuje najpierw slot, a potem klucz, `keccak256(pad32(p) . pad32(holder))`, więc wzór z Solidity zastosowany do tokena w Vyperze, takiego jak wiele tokenów LP z Curve, daje poprawny, ale pusty slot. `ERC20Upgradeable` z OpenZeppelin 5 trzyma swoje zmienne w przestrzeni nazw ERC-7201 (namespace), czyli w strukturze pod zahashowaną lokalizacją, `keccak256(uint256(keccak256(id)) - 1)` z wyzerowanym ostatnim bajtem: dla id `openzeppelin.storage.ERC20` jest to `0x52c63247…ce00`, gdzie leży `_balances`, więc saldo jest pod `keccak256(pad32(holder) . 0x52c6…ce00)`. ERC-20 z Solady hashuje 32 bajty: 20 bajtów adresu posiadacza, osiem bajtów zerowych i czterobajtowy seed `0x87a211a2`."
        ]
      },
      {
        heading: "Odkrywanie nieznanego układu",
        paragraphs: [
          "Gdy układ jest nieznany, trzeba podejrzeć, które sloty czyta `balanceOf`. Uruchamia się `balanceOf(holder)` przez [[debug-api|debug_traceCall]] z domyślnym struct loggerem, który zapisuje każdy wykonany opcode razem ze stosem, i zbiera wartość ze szczytu stosu przy każdym wykonaniu `SLOAD`, czyli opcode'u, który czyta storage: ta wartość to slot. Trzeba też śledzić, czyjego storage dotyczy każdy odczyt: `CALL` i `STATICCALL` przełączają na storage wywoływanego kontraktu, a `DELEGATECALL` zostawia storage wywołującego. Dokładnie tak działa crate `balance-overrides` z CoW Protocol. [[eth-create-access-list|eth_createAccessList]] zwraca te same klucze dla każdego adresu w zwartej postaci. Każdy klucz porównuje się potem z kandydującymi wzorami: CoW próbuje slotów mappingu Solidity od 0 do N oraz seeda Solady, a token w Vyperze wymaga tego samego sprawdzenia z odwróconą kolejnością. Dopasowanie daje regułę, która działa dla każdego posiadacza; klucz, który nie pasuje do żadnego wzoru, jest ważny tylko dla posiadacza, dla którego go znaleziono.",
          "Potem trzeba to udowodnić: nadpisać i sprawdzić. Do kandydującego slotu zapisuje się przez `stateDiff` wartość kontrolną (sentinel), której nikt nie miałby przypadkiem, ponownie wywołuje `balanceOf` i zostawia ten slot, z którego wartość kontrolna wraca. CoW używa `0x0102…1f20`, a ponieważ każdy jej bajt jest inny, po położeniu odczytanej wartości da się też rozpoznać spakowane saldo. Funkcja pomocnicza `deal` z Foundry, używana w testach, robi to samo wewnątrz procesu: zapisuje odczyty przez `vm.record` i sprawdza każdy slot. W USDC w bloku 26 297 957 access lista dla `balanceOf(0xd8dA…6045)` zawierała trzy klucze na proxy: slot admina, slot implementacji i `0xbf49…5f95`, czyli `keccak256(pad32(holder) . pad32(9))`; wartość kontrolna zapisana w tym miejscu wróciła bez zmian."
        ]
      },
      {
        heading: "Gdzie to się psuje",
        paragraphs: [
          "[[proxy-contract|Proxy]] to mały kontrakt, który przez `DELEGATECALL` przekazuje każde wywołanie do osobnego kontraktu implementacji, a cały storage trzyma u siebie, więc nadpisanie musi dotyczyć adresu proxy. Jego własne sloty techniczne pojawiają się w każdym trace i trzeba je odfiltrować: proxy EIP-1967 trzyma adres implementacji pod `0x360894…2bbc`, a starsze proxy USDC czyta hashe `org.zeppelinos.proxy.admin` i `org.zeppelinos.proxy.implementation`, czyli pierwsze dwa klucze z przykładu. Spakowane sloty karzą za duże wartości: USDC 2.2 trzyma flagę czarnej listy w najwyższym bicie słowa salda, więc zapis samych jedynek odczytuje się jako `0x7fff…ffff`, a transfer kończy się revertem `Blacklistable: account is blacklisted`, natomiast UNI i COMP przechowują salda jako `uint96`, więc większa wartość wraca obcięta do 96 najniższych bitów.",
          "Niektóre salda są obliczane. stETH, token stakowanego etheru od Lido, zwraca z `balanceOf` wartość `getPooledEthByShares(shares[account])`, czyli udziały posiadacza razy ilość etheru na udział w puli. Zapisanie 1000 razy 10 do potęgi 18 we wpisie udziałów, w mappingu w slocie 0 proxy, dało w tym bloku odczyt 1247,40 stETH. W Aave aTokeny, czyli tokeny poświadczające depozyty, skalują zapisane saldo indeksem odsetek. Niektóre salda są gdzie indziej: `balanceOf` tokena puli Balancera v3 pyta kontrakt Vault, więc slot leży w storage tego kontraktu. A układy storage zmieniają się przy aktualizacjach, więc slot znaleziony dziś jest ważny tylko dla implementacji, na której go znaleziono."
        ]
      }
    ],
    example: {
      title: "Znajdowanie slotu salda USDC i dowód, że to ten slot",
      note: "Prawdziwe saldo wynosiło `0x246c3fc`, czyli 38,192124 USDC; wartość kontrolna wróciła bajt w bajt, co dowodzi zarówno, że to właściwy slot, jak i że saldo nie jest w nim przesunięte, a krok 3 pokazuje, dlaczego wartość maksymalna to zły sposób sprawdzania."
    },
    pitfalls: [
      "Hashowanie w kolejności Solidity dla tokena w Vyperze, co daje poprawny, ale pusty slot i zostawia saldo bez zmian.",
      "Nadpisywanie storage kontraktu implementacji zamiast storage proxy, co nie zmienia niczego, co czyta token.",
      "Wpisywanie maksymalnego `uint256` jako fikcyjnego salda, co w USDC wpisuje posiadacza na czarną listę, a w UNI albo COMP, które trzymają salda jako `uint96`, zostaje obcięte do 2 do potęgi 96 minus 1.",
      "Wpisywanie żądanej kwoty do wpisu udziałów stETH, co daje inne saldo, bo slot przechowuje udziały, a nie ether.",
      "Cache'owanie znalezionego slotu na zawsze, przez co aktualizacja, która przesuwa układ storage, sprawia, że każde późniejsze nadpisanie po cichu przestaje działać."
    ]
  },
  "mempool-streaming": {
    title: "Streaming mempoolu",
    aliases: [
      "newPendingTransactions",
      "pending transaction stream",
      "strumień transakcji pending",
      "mempool feed",
      "feed mempoolu",
      "eth_newPendingTransactionFilter",
      "Mempool Dumpster",
      "mempool archive",
      "archiwum mempoolu"
    ],
    summary: "Streaming mempoolu to odbieranie [[transaction|transakcji]] pending w chwili, gdy trafiają do [[mempool|mempoolu]] węzła: przez strumień `eth_subscribe`, filtr transakcji pending, snapshot `txpool_content` albo feed łączący dane z wielu węzłów. Dzięki temu odbiorca może zareagować, zanim te transakcje trafią do bloku.",
    sections: [
      {
        heading: "Trzy sposoby czytania mempoolu",
        paragraphs: [
          "Transakcja pending to taka, którą węzeł przyjął do swojego mempoolu, a której nie zawiera jeszcze żaden blok. Obserwowanie ich pozwala działać, zanim trafią do bloku: [[searcher|searcher]] szuka dużego swapu, za którym może zagrać, portfel pokazuje oczekujący przelew użytkownika i jego następny [[nonce|nonce]], a monitoring bezpieczeństwa wypatruje trwającego ataku. Interfejsem w trybie push jest [[eth-subscribe|eth_subscribe]] z `newPendingTransactions` przez połączenie [[websocket-transport|WebSocket]] albo [[ipc-transport|IPC]]; domyślnie subskrypcja wysyła jedno powiadomienie z hashem na każdą transakcję, która wchodzi do mempoolu. Pełne obiekty transakcji wymagają drugiego parametru, którego postać zależy od klienta: [[geth|Geth]], [[erigon|Erigon]] i [[reth|Reth]] przyjmują gołe `true`, [[nethermind|Nethermind]] przyjmuje `true` albo `{\"includeTransactions\": true}`, a [[besu|Besu]] rozumie tylko postać obiektu. Własna dokumentacja Geth nie wymienia żadnego parametru, choć jego kod źródłowy go przyjmuje.",
          "Przez zwykłe HTTP ten sam strumień daje `eth_newPendingTransactionFilter` odpytywany przez `eth_getFilterChanges` (Geth pozwala mu też zwracać pełne obiekty), ze zwykłymi zastrzeżeniami dotyczącymi [[eth-filters|filtrów po stronie serwera]]. Interfejsem typu snapshot jest [[txpool-api|txpool_content]]: wszystkie transakcje pending oraz te w kolejce (queued), które wciąż czekają na wcześniejszy nonce, pogrupowane według nadawcy i nonce. Odbiorca wywołuje go raz przy starcie, a potem aktualizuje obraz ze strumienia. Jedynym zdarzeniem w standardowych strumieniach jest nadejście: nic nie zgłasza usunięcia z mempoolu (eviction) ani zastąpienia przez transakcję z tym samym nadawcą i nonce, która płaci wyższą opłatę, a Geth ogłasza transakcję ponownie, gdy [[reorg|reorg]] przywraca ją do mempoolu. Nethermind i Besu dodają subskrypcję `droppedPendingTransactions`, która wysyła hash każdej transakcji usuniętej z ich mempoolu."
        ]
      },
      {
        heading: "Czego nie widzi jeden węzeł",
        paragraphs: [
          "Węzeł dowiaduje się o transakcji, gdy jeden z jego peerów [[devp2p|devp2p]] ją wyśle albo ogłosi, więc czas i kolejność nadejścia zależą od peeringu, a dwa dobrze utrzymane węzły różnią się pod obydwoma względami. [[blob|Transakcje z blobami]], które niosą duże ilości danych dla rollupów, rozchodzą się gorzej: EIP-4844 zabrania wysyłania ich do peerów bez prośby, więc ogłasza się je po hashu i pobiera na żądanie, przez co docierają do każdego węzła później i mniej równomiernie. Transakcje prywatne nie docierają wcale: transakcja wysłana przez [[private-rpc|Flashbots Protect, MEV Blocker]] albo prosto do buildera, czyli jednej ze stron składających większość bloków, pojawia się po raz pierwszy dopiero w bloku, a rollup z jednym [[sequencer|sekwencerem]] zwykle nie ma publicznego mempoolu, który dałoby się streamować.",
          "Ta luka decyduje, do czego strumień się nadaje. BlockSec opisuje w dokumentacji, że jego monitor Phalcon wyprzedza transakcje z exploitem, które widzi w mempoolu, transakcją pauzującą atakowany protokół, i że ataków wysłanych prywatnie albo w sieciach layer 2 bez publicznego mempoolu nie da się na tym etapie wyłapać; zobacz [[security-monitoring|monitoring bezpieczeństwa]]. Estymatory gasu mają to samo ograniczenie: API `blockprices` od Blocknative zwraca poziomy pewności włączenia do następnego bloku i według opisu korzysta z obserwacji mempoolu tam, gdzie są dostępne, co modeluje publiczną resztę ruchu, a nie to, co builderzy trzymają prywatnie."
        ]
      },
      {
        heading: "Feedy, archiwa i obciążenie węzła",
        paragraphs: [
          "Komercyjne feedy poszerzają widok, łącząc dane z wielu węzłów: strumienie `newTxs` i `pendingTxs` od bloXroute oraz `SubscribeNewTxs` od Chainbound Fiber, który dostarcza każdą transakcję razem z nadawcą, więc klient pomija odzyskiwanie adresu z podpisu. Archiwa odpowiadają na to pytanie po fakcie. Mempool Dumpster od Flashbots publikuje codzienne pliki Parquet i CSV pod `https://mempool-dumpster.flashbots.net`, od jednego do dwóch milionów unikalnych transakcji dziennie, z polem `sources`, czyli źródłami, które widziały daną transakcję, i jej `inclusionDelayMs`; ethPandaOps publikuje tabelę `mempool_transaction` z czasami, w których jego węzły obserwacyjne (sentries) zobaczyły każdą transakcję, jako codzienne pliki Parquet pod `data.ethpandaops.io`.",
          "Dla węzła strumień pełnych obiektów na mainnecie to nieprzerwany potok zserializowanych transakcji, a odbiorca, który nie nadąża, go traci. Według dokumentacji Geth powiadomienia czekają w buforze, a połączenie zostaje zamknięte, gdy w kolejce jest ich 10 000, ale obecny kod Geth nie ma takiego bufora: zapisuje każde powiadomienie bezpośrednio, z 10-sekundowym limitem czasu. Gdy więc odbiorca przestanie czytać tak długo, że jeden zapis utknie na cały ten czas, zapis kończy się timeoutem i połączenie zostaje zerwane. Tak czy inaczej przepada każda subskrypcja na tym połączeniu. Dlatego [[rpc-provider|providerzy]] ograniczają albo wyłączają tę subskrypcję, a odbiorcy wrażliwi na opóźnienia czytają własny węzeł przez IPC. Wynik to nadal obraz jednego węzła; widoczność w skali całej sieci wymaga wielu punktów obserwacji, i właśnie to sprzedają feedy, a publikują archiwa."
        ]
      }
    ],
    example: {
      title: "Pełne transakcje pending i wyścig z samymi hashami",
      note: "Obiekt jest przycięty: prawdziwy zawiera też `chainId`, `accessList` i pola podpisu. Obiekt pending ma `blockHash`, `blockNumber` i `transactionIndex` ustawione na `null`. Wynik `null` z `eth_getTransactionByHash` oznacza, że transakcja opuściła ten mempool, bo została usunięta albo zastąpiona, albo że wywołanie trafiło do innego backendu; transakcja już zawarta w bloku wróciłaby z wypełnionymi polami bloku."
    },
    pitfalls: [
      "Subskrybowanie samych hashy i pobieranie każdej transakcji przez `eth_getTransactionByHash`, co podwaja liczbę żądań i gubi transakcje, które opuszczą mempool, zanim dotrze zapytanie.",
      "Wysyłanie gołego `true` do Besu, który oczekuje obiektu z `includeTransactions`, i dostawanie błędu parametru zamiast strumienia.",
      "Traktowanie kolejności nadejścia jako kolejności w następnym bloku, choć builder, który wygra slot, układa transakcje według własnych reguł i dokłada ruch, którego nikt nie widział w żadnym strumieniu.",
      "Wniosek, że transakcja nigdy nie została wysłana, bo nie pokazał jej żaden feed, choć mogła trafić do builderów prywatnie.",
      "Odbieranie strumienia wolniej, niż napływa, aż połączenie się zerwie, przy 10 000 powiadomień w kolejce, o których mówi dokumentacja Geth, albo przy 10-sekundowym timeoucie zapisu z jego kodu; razem z połączeniem przepada każda subskrypcja, która na nim działa."
    ]
  },
  "eth-capabilities": {
    title: "eth_capabilities",
    aliases: [
      "eth_capabilities",
      "raportowanie retencji",
      "retention reporting",
      "capability discovery",
      "oldestBlock",
      "deleteStrategy",
      "retentionBlocks"
    ],
    summary: "`eth_capabilities` zwraca head węzła, a dla każdego rodzaju danych, o którym raportuje (stan, transakcje, logi, receipty, bloki i dowody stanu), informację, czy te dane są serwowane, jaki najstarszy blok obejmują i w jakim przesuwnym oknie węzeł robi ich pruning. Dzięki temu router może odczytać retencję endpointu, zamiast ją sondować.",
    sections: [
      {
        heading: "Na jakie pytanie odpowiada",
        paragraphs: [
          "Router stojący przed wieloma węzłami musi wiedzieć, które z nich odpowiedzą na żądanie dotyczące starego bloku. [[full-node|Pełny węzeł]] trzyma tylko świeży stan, więc [[eth-get-balance|eth_getBalance]] na bloku z zeszłego roku kończy się na nim błędem brakującego stanu, a na [[archive-node|węźle archiwalnym]] się udaje; logi, receipty i stare body bloków mają własne limity. Do tej pory router ustalał je wywołaniami testowymi, czyli sondowaniem opisanym w temacie [[endpoint-capabilities|możliwości endpointu]]. `eth_capabilities` zamiast tego pyta sam węzeł. Nie przyjmuje parametrów i zwraca siedem wymaganych pól: `head`, czyli `number` i `hash` bieżącego head, oraz sześć zasobów.",
          "Specyfikacja podaje, których metod dotyczy każdy zasób. `state` obejmuje eth_getBalance, [[eth-get-storage-at|eth_getStorageAt]], [[eth-call|eth_call]], [[eth-estimate-gas|eth_estimateGas]] i pozostałe odczyty stanu; `stateproofs` obejmuje [[eth-get-proof|eth_getProof]]; `logs` obejmuje [[eth-get-logs|eth_getLogs]] i [[eth-filters|filtry]]; `receipts` obejmuje [[eth-get-transaction-receipt|eth_getTransactionReceipt]] i [[eth-get-block-receipts|eth_getBlockReceipts]]; `tx` obejmuje wyszukiwanie transakcji po hashu albo pozycji; a `blocks` obejmuje [[eth-get-block-by-number|eth_getBlockByNumber]] i metody zliczające. Każdy zasób ma wymagany boolean `disabled`, opcjonalny `oldestBlock`, czyli najwcześniejszy blok, który powinien poprawnie serwować, i opcjonalny `deleteStrategy`. Schemat zabrania dodatkowych pól, a każda liczba jest zapisana jako [[hex-encoding|ciąg hex typu QUANTITY]]."
        ]
      },
      {
        heading: "Jak czytać odpowiedź",
        paragraphs: [
          "Jedyna zdefiniowana strategia to `window` z polem `retentionBlocks`: węzeł trzyma tyle ostatnich bloków, więc `oldestBlock` równa się `head.number - retentionBlocks + 1` i rośnie o jeden z każdym nowym blokiem. Router przelicza więc tę dolną granicę, zamiast ją cache'ować. Zasób bez strategii ma stałą dolną granicę, na przykład gdy [[history-expiry|wygasanie historii]] usunęło body bloków sprzed Merge, albo nie ma jej wcale.",
          "Dolna granica nie zawsze jest ścianą. W przykładzie poniżej `logs` podaje domyślne okno indeksu logów Getha, 2 350 000 bloków, a jednak Geth odpowiada na starsze zakresy logów wolniejszym skanowaniem bez indeksu, więc ta granica wyznacza miejsce, w którym zapytania zwalniają, a nie to, w którym zawodzą. Węzeł bez tej metody odpowiada `-32601`, a filtrujący gateway może użyć innego kodu, na przykład `-32600`; tak czy inaczej wywołujący wraca do sondowania."
        ]
      },
      {
        heading: "Jak wypełniają ją klienci",
        paragraphs: [
          "Metodę zaproponowano w pull requeście 755 do [[execution-apis|execution-apis]] i zmergowano 2 czerwca 2026 roku. Jej pierwsze fixtures (przypadki testowe), skopiowane z wektorów testów jednostkowych Getha, łączyły numer bloku z hashem bloku genesis mainnetu, a takiej odpowiedzi nie może dać żaden węzeł, więc nie przeszedł ich żaden klient. Pull request 819 wygenerował je na nowo z działającego klienta i oznaczył test jako speconly: [[hive|hive]] sprawdza tylko schemat i to, czy `head` zgadza się z łańcuchem testowym, bo retencja różni się zależnie od węzła i konfiguracji.",
          "Obsługuje ją wszystkich pięciu głównych klientów wykonawczych: [[geth|Geth]] od v1.17.4, [[nethermind|Nethermind]] od 1.39.0, [[reth|Reth]] od v2.3.0, [[erigon|Erigon]] od v3.5.0 i [[besu|Besu]] od 26.5.0. Geth na pełnym węźle raportuje okno stanu 128 bloków. Archiwum Getha w schemacie path-based trzyma stary stan, ale stare trie node'y, których potrzebuje dowód, trzyma tylko z `--history.trienode`, więc jego `stateproofs` może sięgać dużo płycej niż `state`. Nethermind podaje dolną granicę i okno z `receipts` także dla `tx` i `logs`. Erigon wyłącza `stateproofs`, chyba że ustawiono `--prune.include-commitment-history`. Besu raportuje jedną dolną granicę dla każdego zasobu, nigdy okno, a od 26.6.0 wyłącza `state` i `stateproofs`, gdy brakuje stanu genesis, jak na węźle po snap sync, który nadal odpowiada dla `latest`. Reth w domyślnym trybie `--full` raportuje okno `state` o długości 10 064 bloków, a Reth przed v2.4.0 i Nethermind 1.39.x zapisują `retentionBlocks` jako zwykłą liczbę JSON, `10064`."
        ]
      },
      {
        heading: "Czego nie potrafi powiedzieć",
        paragraphs: [
          "Schemat dopuszcza jedną dolną granicę na zasób, więc nie opisze [[partial-archive|częściowego archiwum]], które trzyma głęboką historię tylko dla wskazanych kontraktów, jak robi to `FlatDb.HistorySliceAddresses` w Nethermind, ani filtra logów dla receiptów w Reth, który zachowuje stare receipty dla wybranych adresów. Nie powie też, że indeks wciąż się buduje: Geth wylicza odpowiedź z konfiguracji, więc podczas długiego pierwszego indeksowania archiwum path-based raportuje zakres, którego jeszcze nie potrafi obsłużyć. Nie obejmuje też [[trace-api|trace_]] ani [[debug-api|debug_]], limitów gasu dla wywołań (gas cap) ani [[rate-limits|limitów zakresu i rate limitów]].",
          "Odpowiedź to deklaracja samego węzła i opisuje tylko backend, który obsłużył dane żądanie. Za [[load-balancer|load balancerem]] następne wywołanie może trafić gdzie indziej: 29 października 2026 roku jeden publiczny endpoint odpowiedział na [[net-web3-api|web3_clientVersion]] raz `reth/v2.8.0`, a przy następnym wywołaniu `Geth/v1.17.9`. Router, który polega na tej odpowiedzi, sprawdza więc wyrywkowo jedno wywołanie na zgłoszonej dolnej granicy, na przykład eth_getBalance na `oldestBlock`, zanim skieruje tam ruch archiwalny."
        ]
      }
    ],
    example: {
      title: "Odpowiedź pełnego węzła Geth v1.17.9, 29 października 2026",
      note: "Head to blok 26 297 934. `state` i `stateproofs` trzymają okno 128 bloków (`0x80`), więc ich dolna granica leży 127 bloków pod head; `logs` trzyma 2 350 000 bloków (`0x23dbb0`); `tx`, `receipts` i `blocks` sięgają genesis bez żadnego okna. Geth i tak serwuje logi starsze niż jego indeks, skanując bloki, tylko wolniej."
    },
    pitfalls: [
      "Odczytywanie `-32601` jako węzła bez historii, choć tej metody nie udostępniają starsze wersje klientów i filtrujące gatewaye.",
      "Cache'owanie `oldestBlock` dla zasobu z oknem, bo po dwunastu sekundach ta wartość jest już nieaktualna; trzeba ją przeliczać z head i `retentionBlocks`.",
      "Parsowanie `retentionBlocks` wyłącznie jako ciągu hex, choć niektóre wersje Reth i Nethermind zwracają zwykłą liczbę JSON.",
      "Kierowanie `eth_getProof` według dolnej granicy `state`, choć na archiwum Getha w schemacie path-based i na Erigonie `stateproofs` może sięgać dużo płycej albo być wyłączony."
    ]
  }
};
