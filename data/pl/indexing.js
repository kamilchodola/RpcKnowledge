// Polish text for the Indexing lessons, keyed by topic id. Only the words: ids, link
// targets, code, related topics, and sources come from data/indexing.js.
export const topics = {
  indexer: {
    title: "Indekser",
    aliases: ["indexer", "indeksowanie", "indexing", "indekser łańcucha", "ingest", "backfill", "dane pochodne", "pipeline danych"],
    summary: "Indekser to usługa, która czyta z węzła przez [[json-rpc|JSON-RPC]] każdy [[block|blok]], [[transaction-receipt|receipt]] i [[event-log|log]], dekoduje je według [[abi|ABI]] kontraktów i zapisuje wynik w bazie danych, która odpowiada na zapytania, do jakich węzeł nie ma metody.",
    sections: [
      {
        heading: "Do czego służy indekser",
        paragraphs: [
          "JSON-RPC warstwy wykonawczej to interfejs do wyszukiwania pojedynczych elementów danych łańcucha. Zwraca jeden [[block|blok]] po numerze, jedną [[transaction|transakcję]] po hashu, saldo jednego [[account|konta]] przy jednym [[block-tag|identyfikatorze bloku]]. Nie ma metody na „[[address-history|każdy transfer, jaki ten adres kiedykolwiek otrzymał]]” ani na „obecnych posiadaczy tego tokena”, bo węzeł nie przechowuje ani jednego, ani drugiego. Najbliżej jest [[eth-get-logs|eth_getLogs]], a i to jest skan o ograniczonym zakresie. Indekser raz przekształca odpowiedzi o pojedynczych elementach w takie tabele, żeby aplikacja mogła tanio wykonywać na nich zapytania.",
          "Wszystko, co przechowuje indekser, to dane pochodne. Każdy wiersz da się wyliczyć ponownie z łańcucha i żaden nie jest kanoniczny: jeśli logika dekodowania jest błędna albo [[reorg|reorganizacja łańcucha]] zostanie przeoczona, baza danych się myli, a węzeł nadal ma rację. Indekser ocenia się po tym, czy ponowne przetworzenie tych samych bloków daje te same wiersze, a nie po szybkości pobierania danych."
        ]
      },
      {
        heading: "Pętla dla każdego bloku",
        paragraphs: [
          "Minimalny indekser wykonuje jedną pętlę. Dowiaduje się o head z [[eth-block-number|eth_blockNumber]] albo ze strumienia `newHeads` z [[eth-subscribe|eth_subscribe]], a dla każdej nieprzetworzonej wysokości wywołuje [[eth-get-block-by-number|eth_getBlockByNumber]] z `fullTransactions` ustawionym na `false`, żeby dostać [[block-header|nagłówek]] i hashe transakcji, a potem [[eth-get-block-receipts|eth_getBlockReceipts]], żeby w jednej odpowiedzi dostać każdy receipt i każdy log tego bloku. Na endpointach bez `eth_getBlockReceipts` zostaje `eth_getLogs` z `fromBlock` i `toBlock` ustawionymi na ten sam blok; to wywołanie zwraca logi, ale bez pól `status` i `gasUsed`.",
          "Zanim cokolwiek zapisze, porównuje `parentHash` nowego bloku z hashem zapisanym dla poprzedniej wysokości. Równość oznacza, że łańcuch się wydłużył; różnica oznacza, że nastąpił reorg i najpierw trzeba wycofać końcówkę. Potem dekoduje: `topics[0]` wybiera [[event-signature|sygnaturę eventu]], pozostałe topics i `data` dekoduje się według ABI, a wiersze zapisuje się razem z nowym [[cursor-pagination|kursorem]] w jednej transakcji bazodanowej, więc awaria między jednym a drugim nie może zgubić ani zdublować pracy.",
          "W normalnej pracy to dwa wywołania RPC na blok. Przy 12-sekundowych [[slot-epoch|slotach]] łańcuch produkuje około 7200 bloków dziennie, więc nadążanie za head jest tanie. Kosztowną fazą jest backfill (uzupełnianie danych historycznych), w którym o czasie przebudowy decydują [[batch-request|żądania zbiorcze (batch)]], współbieżność i [[rate-limits|rate limity]] endpointu."
        ]
      },
      {
        heading: "Jak zachować poprawność",
        paragraphs: [
          "Klucze wierszy trzeba dobrać tak, żeby reorg mógł je dokładnie cofnąć: (`blockHash`, `logIndex`) dla logów i `blockHash` dla wierszy na poziomie bloku, bo blok zastępczy dostaje ten sam `blockNumber`, ale nigdy ten sam hash. Usunięcie każdego wiersza, którego `blockHash` wypadł z kanonicznego łańcucha, i ponowne przetworzenie nowej gałęzi przywraca spójność bez pełnej ponownej synchronizacji; zobacz [[indexing-database|bazę danych indeksera]].",
          "Większość indekserów utrzymuje dwie granice: optymistyczną przy head, którą reorg może przepisać, i ustaloną, która przesuwa się tylko do bloków `finalized` lub wcześniejszych albo do bloków, które mają już określoną liczbę [[confirmations|potwierdzeń]]. Odczyt starych zakresów to inny problem: [[pruned-node|pruned node]] serwuje tylko niedawne bloki, a [[history-expiry|history expiry]] usuwa stare body bloków i receipty, więc głęboki backfill wymaga [[archive-node|węzła archiwalnego]] albo innego źródła [[historical-data|danych historycznych]]."
        ]
      },
      {
        heading: "Własny czy gotowy",
        paragraphs: [
          "Nie każda aplikacja potrzebuje własnego indeksera. [[the-graph|Subgraphy]] opakowują tę samą pętlę w GraphQL, [[block-explorer|eksploratory bloków]] już indeksują wszystko, [[rpc-provider|providerzy RPC]] sprzedają API tokenów zbudowane na własnych indeksach, a [[etl-pipeline|narzędzia ETL]], takie jak ethereum-etl i Cryo, zrzucają surowe bloki i logi do plików. Własny indekser opłaca się wtedy, gdy dekodowanie jest specyficzne dla konkretnych kontraktów."
        ]
      }
    ],
    example: {
      title: "Dwa wywołania, które indekser wykonuje dla każdego bloku",
      note: "Dwa wywołania na blok to całe pobieranie danych w normalnej pracy; zanim cokolwiek z tego trafi do bazy, trzeba porównać zwrócony `parentHash` z hashem zapisanym dla `0x12d4f1b`."
    },
    pitfalls: [
      "Używanie `blockNumber` jako klucza wierszy pochodnych; reorg ponownie używa tego numeru z inną zawartością, więc stare wiersze po cichu zostają.",
      "Przesuwanie kursora osobnym zapisem niż wiersze, które obejmuje; awaria pomiędzy nimi albo gubi blok, albo przetwarza go ponownie i tworzy duplikaty.",
      "Wywoływanie [[eth-get-transaction-receipt|eth_getTransactionReceipt]] raz na transakcję zamiast `eth_getBlockReceipts` raz na blok, co mnoży liczbę żądań przez liczbę transakcji w bloku.",
      "Traktowanie bazy pochodnej jako autorytatywnej; to cache łańcucha, który zmienia się pod spodem, więc wszystko, co nieodwracalne, musi opierać się na bloku sfinalizowanym."
    ]
  },
  "event-log": {
    title: "Event log",
    aliases: ["log", "logi", "event", "eventy", "emit", "emitowanie eventu", "LOG0", "LOG4", "logIndex", "removed"],
    summary: "Event log to rekord, który [[smart-contract|smart kontrakt]] emituje za pomocą opcode'ów `LOG0`–`LOG4`: do czterech 32-bajtowych `topics` plus dowolne bajty `data`. Jest zapisywany w [[transaction-receipt|receipcie]] dla odbiorców spoza łańcucha i nie da się go odczytać z wnętrza [[evm|EVM]].",
    sections: [
      {
        heading: "Obiekt logu",
        paragraphs: [
          "Każdy log zwracany przez [[eth-get-logs|eth_getLogs]], receipt albo powiadomienie `logs` z [[eth-subscribe|eth_subscribe]] ma ten sam kształt. `address` to 20-bajtowy [[address|adres]] kontraktu, który go wyemitował; wpisuje go EVM, więc emitujący nie może go podrobić. `topics` to tablica od zera do czterech 32-bajtowych wartości; w zwykłym evencie `topics[0]` to [[event-signature|hash sygnatury eventu]], a pozostałe to jego indeksowane parametry. `data` to zakodowane w ABI złączenie parametrów nieindeksowanych, jako wartość [[hex-encoding|DATA]] dowolnej długości.",
          "Pozostałe pola określają położenie logu w łańcuchu: `blockNumber`, `blockHash`, `transactionHash`, `transactionIndex` i `logIndex`. `logIndex` numeruje logi w całym bloku, a nie w obrębie jednej transakcji, więc pierwszy log drugiej transakcji może mieć `0x5`. `removed` ma wartość `true` tylko wtedy, gdy log jest wycofywany z powodu [[reorg|reorgu]] przez subskrypcję albo [[eth-filters|filtr z odpytywaniem (polling)]]; zwykła odpowiedź `eth_getLogs` zawsze opisuje obecny łańcuch kanoniczny i zwraca `removed: false`."
        ]
      },
      {
        heading: "Emisja logów i commitmenty",
        paragraphs: [
          "`emit` w Solidity kompiluje się do jednego z pięciu opcode'ów. Opcode'y od `LOG0` do `LOG4` przyjmują zakres pamięci dla `data` oraz tyle słów ze stosu dla `topics`, ile wskazuje numer opcode'u. Kosztują 375 gasu za sam opcode, kolejne 375 za każdy topic i 8 [[gas|gasu]] za każdy bajt danych. Nie ma opcode'u, który odczytuje log z powrotem, więc z punktu widzenia łańcucha eventy można tylko zapisywać: istnieją po to, żeby obserwował je [[indexer|indekser]], portfel albo frontend, a nigdy inny kontrakt.",
          "Logi nie są [[state|stanem]], ale są objęte commitmentem. Logi każdej transakcji znajdują się w jej receipcie, receipty bloku są hashowane do `receiptsRoot` w [[block-header|nagłówku]], a adresy i topics każdego logu trafiają do 2048-bitowego [[logs-bloom|logsBloom]] bloku. Dzięki temu filtrowi Blooma węzeł szybko pomija bloki przy zapytaniach o zakres, a `receiptsRoot` w ogóle umożliwia [[receipt-proof|dowód receiptu]] dla logu."
        ]
      },
      {
        heading: "Odczyt logów przez RPC",
        paragraphs: [
          "Są trzy drogi dostępu. `eth_getLogs` przeszukuje zakres bloków z filtrem po adresie i topics; to z niego korzysta backfill (uzupełnianie danych historycznych). [[eth-get-transaction-receipt|eth_getTransactionReceipt]] i [[eth-get-block-receipts|eth_getBlockReceipts]] zwracają logi w receiptach, więc razem z nimi dostaje się `status` i `gasUsed`. `eth_subscribe` z `logs` przez [[websocket-transport|WebSocket]] wysyła w trybie push pasujące logi, w miarę jak napływają bloki, łącznie z wpisami `removed: true`, gdy jakaś gałąź zostaje porzucona.",
          "Transakcja zakończona revertem nie emituje niczego: EVM odrzuca logi zapisane przed [[revert|revertem]] razem ze zmianami stanu. Logi udanej transakcji to jedyny wiarygodny sygnał dla świata poza łańcuchem, że coś się wydarzyło, i dlatego [[token-standards|standardy tokenów]] ich wymagają."
        ]
      }
    ],
    example: {
      title: "Jeden log Transfer z ERC-20 zwrócony przez eth_getLogs",
      note: "Dwa indeksowane adresy są w `topics[1]` i `topics[2]`, dopełnione z lewej do 32 bajtów, a nieindeksowana kwota (1 000 000 000 jednostek) to całe `data`."
    },
    pitfalls: [
      "Traktowanie `logIndex` jako pozycji w obrębie transakcji; to pozycja w bloku, więc unikalna jest dopiero w połączeniu z `blockHash`.",
      "Zakładanie, że event oznacza prawdziwy transfer; każdy kontrakt może wyemitować `Transfer`, więc zawsze trzeba porównać `address` z tokenem, o który faktycznie chodzi.",
      "Dekodowanie `data` pozycyjnie według pełnej listy parametrów z ABI; parametrów indeksowanych nie ma w `data`, zamiast tego pojawiają się jako topics.",
      "Oczekiwanie logów z transakcji zakończonej revertem; receipt ma `status` `0x0` i pustą tablicę `logs`."
    ]
  },
  "event-signature": {
    title: "Sygnatury eventów i topics",
    aliases: ["topic0", "topic eventu", "indexed", "event anonimowy", "topic Transfer", "hash sygnatury", "sygnatura eventu"],
    summary: "`topics[0]` logu to hash [[keccak-256|keccak-256]] kanonicznej sygnatury eventu, więc `Transfer(address,address,uint256)` zawsze daje `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`, w każdym kontrakcie, który ten event deklaruje.",
    sections: [
      {
        heading: "Jak powstaje topic0",
        paragraphs: [
          "Kanoniczna sygnatura to nazwa eventu, a po niej typy parametrów w nawiasie, rozdzielone przecinkami, bez spacji, bez nazw parametrów i bez słów kluczowych `indexed`. Aliasy typów rozwija się do postaci kanonicznej: `uint` staje się `uint256`, enum swoim typem bazowym `uint8`, a struct krotką (tuple) swoich pól w nawiasie. Ten ciąg ASCII hashuje się keccak-256 i zachowuje wszystkie 32 bajty; to właśnie `topics[0]`. Inaczej działa selektor funkcji z [[abi|ABI]]: to tylko pierwsze cztery bajty hasha zbudowanego w ten sam sposób.",
          "Hash zależy wyłącznie od tego ciągu znaków, więc dwa niezwiązane ze sobą kontrakty, które deklarują ten sam event, dają ten sam `topics[0]`. Dzięki temu możliwy jest filtr globalny: jedno wywołanie [[eth-get-logs|eth_getLogs]] bez pola `address`, z samym tym hashem w topics, zwraca każdy transfer w stylu ERC-20 z danego zakresu. Mapowanie działa też tylko w jedną stronę, więc ustalenie, jaki to event, na podstawie nieznanego `topics[0]` wymaga bazy sygnatur albo [[abi|ABI]] kontraktu, a nie obliczeń."
        ]
      },
      {
        heading: "Parametry indeksowane",
        paragraphs: [
          "Event, który nie jest anonimowy, może oznaczyć jako `indexed` najwyżej trzy parametry; zajmują one pozycje od `topics[1]` do `topics[3]` w kolejności deklaracji, a cała reszta trafia do `data`, zakodowana według ABI. Typ wartościowy, taki jak `address`, `uint256` czy `bytes32`, jest zapisywany jako 32-bajtowe słowo, więc [[address|adres]] pojawia się dopełniony z lewej dwunastoma bajtami zerowymi. Typ dynamiczny (`string`, `bytes`, tablica albo struct) jest zapisywany jako hash keccak-256 swojego kodowania, więc można filtrować po wartości, którą już się zna, ale nigdy nie da się jej odczytać z powrotem z wpisu w topics.",
          "Event `anonymous` w ogóle pomija `topics[0]`, więc może indeksować cztery parametry. Jego logów nie da się wybrać po sygnaturze, tylko po emitującym [[address|adresie]] albo po znanej wartości indeksowanej. Dlatego poza kontraktami, które do granic możliwości oszczędzają gas (gas golfing), i wewnętrznymi mechanizmami proxy prawie nikt go nie używa."
        ]
      },
      {
        heading: "Semantyka filtra",
        paragraphs: [
          "Tablica `topics` w filtrze `eth_getLogs` jest pozycyjna. Pozycja `i` ogranicza `topics[i]` logu, `null` oznacza na niej dowolną wartość (wildcard), a tablica na danej pozycji oznacza OR po tych wartościach. Pozycje łączą się przez AND, a filtr krótszy niż tablica topics logu nie ogranicza pozycji końcowych.",
          "Z tego wynikają dwie pułapki, na które trafiają [[indexer|indeksery]]. W jednym wywołaniu nie ma OR między różnymi pozycjami, więc „transfery od Alice lub do Alice” to dwa filtry albo jedno szersze zapytanie filtrowane po stronie klienta. Poza tym adres użyty jako topic musi mieć 32-bajtową postać dopełnioną zerami, a nie być 20-bajtowym literałem; węzeł porównuje topics jako nieprzezroczyste słowa i przy złym dopełnieniu po prostu nic nie zwraca."
        ]
      }
    ],
    example: {
      title: "Jedno wywołanie dla dwóch typów eventów, zawężone do jednego nadawcy",
      note: "Pozycja 0 to OR po hashach sygnatur `Transfer` i `Approval`; pozycja 1 przypina pierwszy parametr indeksowany do jednego adresu dopełnionego zerami, a pozycje 2 i 3 pozostają bez ograniczeń."
    },
    pitfalls: [
      "Hashowanie `Transfer(address,address,uint)` zamiast kanonicznej postaci z `uint256`, co daje zupełnie inny topic i pusty wynik.",
      "Przekazywanie 20-bajtowego adresu jako wartości w topics; topics są porównywane jako 32-bajtowe słowa, więc adres trzeba dopełnić zerami z lewej do 64 znaków hex.",
      "Oczekiwanie, że parametr indeksowany typu `string` lub `bytes` da się odczytać z topics; zapisany jest tylko jego hash keccak-256, więc wartość musi pochodzić z `data` albo być znana z góry.",
      "Zakładanie, że log z trzema topics ma trzy parametry indeksowane; w evencie, który nie jest anonimowy, pierwszy topic to sygnatura, więc parametry indeksowane są dwa."
    ]
  },
  reorg: {
    title: "Reorganizacja łańcucha (reorg)",
    aliases: ["reorg", "reorganizacja", "osierocony blok", "orphaned block", "usunięte logi", "removed logs", "cofnięcie łańcucha"],
    summary: "Reorganizacja łańcucha to sytuacja, w której [[fork-choice|fork choice]] zastępuje jeden lub więcej bloków przy head konkurencyjną gałęzią, więc bloki, transakcje i logi, które węzeł wcześniej raportował jako kanoniczne, zostają wycofane i zwykle zastąpione innymi.",
    sections: [
      {
        heading: "Co się dzieje i jak głęboko sięga",
        paragraphs: [
          "W [[proof-of-stake|proof of stake]] na każdy 12-sekundowy [[slot-epoch|slot]] wybierany jest jeden proposer, więc konkurencyjne bloki na tej samej wysokości są rzadkie, a reorgi niemal zawsze mają głębokość jednego bloku. Typowe przyczyny to blok opublikowany zbyt późno, żeby zebrać atestacje, proposer, który celowo buduje na bloku dziadka, bo blok rodzica dotarł za późno, oraz zwykłe partycje sieci. Głębsze reorgi wymagają, żeby duża część walidatorów zagłosowała inaczej, a bloków na poziomie [[block-tag|tagu bloku]] `finalized` lub niżej nie da się cofnąć bez slashingu co najmniej jednej trzeciej całego stakowanego ETH; zobacz [[finality|finalność]].",
          "Od [[the-merge|Merge]] nie ma już bloków uncle: blok, który przegra wyścig fork choice, po prostu przestaje być kanoniczny. Jego transakcje wracają do [[mempool|mempoolu]] i zwykle trafiają ponownie do następnego bloku lub dwóch. Zachowują ten sam hash transakcji, ale lądują z innymi wartościami `blockHash`, `blockNumber`, `transactionIndex` i `logIndex`. Transakcja może też nie wrócić, na przykład gdy konkurencyjna gałąź zawiera sprzeczną transakcję z tym samym [[nonce|nonce]]."
        ]
      },
      {
        heading: "Jak go wykryć",
        paragraphs: [
          "Niezawodnym lokalnym sygnałem jest `parentHash`. Dla każdego przetworzonego bloku trzeba zapisać `(number, hash, parentHash)`, a po pobraniu kolejnej wysokości sprawdzić, czy jej `parentHash` jest równy hashowi zapisanemu dla wysokości niżej. Niezgodność oznacza, że gałąź się zmieniła: trzeba iść wstecz, porównując zapisane hashe z [[eth-get-block-by-number|eth_getBlockByNumber]], aż do znalezienia wspólnego przodka. Odpytywanie (polling), które tylko zwiększa licznik, nigdy tego nie zauważy, bo nowy łańcuch bez oporu odpowiada na każdy numer.",
          "RPC pomaga tylko częściowo. Strumień `logs` z [[eth-subscribe|eth_subscribe]] i [[eth-filters|eth_getFilterChanges]] dostarczają wycofane logi z `removed: true`, a subskrypcja `newHeads` emituje nagłówki nowej gałęzi. [[eth-get-logs|eth_getLogs]] tego nie robi: odpowiada wyłącznie z bieżącego kanonicznego łańcucha, więc poller, który po reorgu ponownie odpytuje zakres, dostaje nowe logi i nigdy nie dowiaduje się o starych. [[eth-get-transaction-receipt|eth_getTransactionReceipt]] zaczyna zwracać `null` dla osieroconej transakcji albo, gdy trafi ona ponownie do bloku, receipt z innym `blockHash`."
        ]
      },
      {
        heading: "Jak się po nim pozbierać",
        paragraphs: [
          "Najpierw wycofanie, potem odtwarzanie do przodu. [[indexer|Indekser]] usuwa każdy pochodny wiersz, którego `blockHash` nie jest już kanoniczny — właśnie dlatego [[indexing-database|zaindeksowane wiersze]] mają klucz w postaci [[block-hash|hasha bloku]], a nie numeru — a potem stosuje bloki nowej gałęzi od wspólnego przodka. Jeśli zapisy są idempotentne i powiązane z hashem, wycofanie to po prostu usunięcie i ponowne odtworzenie, a nie osobna ścieżka w kodzie.",
          "Nieodwracalne efekty uboczne wymagają innej reguły: e-mail wysyła się, depozyt księguje, a towar wydaje dopiero po wybranej liczbie [[confirmations|potwierdzeń]] albo gdy blok jest na poziomie `finalized` lub niżej. Reorg na jednym węźle nie jest też automatycznie reorgiem na innym. Dwa endpointy za [[load-balancer|load balancerem]] mogą się różnić przez sekundę czy dwie, więc poller, który zmienia węzeł w trakcie odpytywania, może zobaczyć pozorny reorg, którego nie było w żadnym z łańcuchów; zobacz [[head-lag|spójność head między węzłami]]."
        ]
      }
    ],
    example: {
      title: "Wykrywanie reorgu po parentHash przed zapisem",
      note: "`parentHash` to jedyny tani lokalny detektor; indekser, który tylko zwiększa licznik bloków, nigdy się nie dowie, że blok przetworzony minutę temu zniknął."
    },
    pitfalls: [
      "Ponowne uruchamianie `eth_getLogs` na zakresie i dopisywanie wyników; to wywołanie nigdy nie raportuje starych logów jako usuniętych, więc osierocone wiersze zostają w bazie na zawsze.",
      "Traktowanie reorgu jak niepowodzenia transakcji; transakcja zwykle pojawia się ponownie w późniejszym bloku z tym samym hashem, ale innym `blockHash` i `logIndex`.",
      "Zapisywanie samych numerów bloków, przez co nie ma z czym porównać `parentHash` i nie da się ustalić, które wiersze usunąć.",
      "Zakładanie, że na dobrze podłączonym węźle reorg o jeden blok jest niemożliwy; reorgi jednego bloku zdarzają się na mainnecie regularnie i są normalnym zachowaniem fork choice."
    ]
  },
  confirmations: {
    title: "Potwierdzenia",
    aliases: ["confirmations", "liczba potwierdzeń", "głębokość bloku", "ile potwierdzeń", "głębokość rozliczenia"],
    summary: "Liczba potwierdzeń to liczba bloków zbudowanych na bloku, który zawiera transakcję, używana jako heurystyka tego, jak mało prawdopodobny jest [[reorg|reorg]]; w [[proof-of-stake|proof of stake]] na to samo pytanie odpowiada protokół przez [[block-tag|tagi bloków]] `safe` i `finalized`.",
    sections: [
      {
        heading: "Heurystyka odziedziczona po proof of work",
        paragraphs: [
          "W proof of work cofnięcie bloku oznaczało prześcignięcie uczciwego łańcucha w kopaniu, więc szansa na odwrócenie malała wykładniczo z głębokością, a „sześć potwierdzeń” stało się praktyczną regułą. Ethereum już tak nie działa. [[finality|Casper FFG]] jawnie finalizuje checkpointy: blok na poziomie `finalized` lub niżej można cofnąć tylko wtedy, gdy slashingiem zostanie objęta co najmniej jedna trzecia całego stakowanego ETH. Finalizacja następuje zwykle dwie do trzech [[slot-epoch|epok]] po włączeniu bloku, czyli po około 13 do 19 minutach, a w najszybszym przypadku po 12,8 minuty. `safe` zależy od klienta konsensusu: ten, który stosuje [[fast-confirmation-rule|Fast Confirmation Rule]] (dodany do specyfikacji konsensusu w kwietniu 2026), wysyła blok o jeden lub dwa sloty za head, a pozostali wysyłają najnowszy checkpoint justified, o jedną do dwóch epok za head.",
          "Głębokość wciąż niesie informację w oknie przed finalnością. [[reorg|Reorgi]] o jeden blok są rutyną, o dwa bloki zdarzają się rzadko, a cokolwiek głębszego oznacza prawdziwy problem z konsensusem, a nie pecha. Liczba potwierdzeń to więc tani sposób na wycenę ryzyka w pierwszej minucie, a `finalized` jest właściwą odpowiedzią, gdy można sobie pozwolić na czekanie."
        ]
      },
      {
        heading: "Wybór progu",
        paragraphs: [
          "Czas oczekiwania trzeba dopasować do kosztu odwrócenia. Wyświetlanie salda albo oczekującego zlecenia w UI może korzystać bezpośrednio z head i samo się poprawić. Zaksięgowanie depozytu użytkownika, wydanie towaru albo uruchomienie płatności off-chain powinno czekać na `finalized`; tak w praktyce robią [[exchange-deposits|giełdy]] i [[cross-chain-relayer|bridge'e]]. Pomiędzy tymi skrajnościami kilka bloków daje większość ochrony kosztem kilku sekund, a wiele [[indexer|indekserów]] udostępnia świeże dane przy head, ale granicę danych uznanych za rozliczone przesuwa tylko do stałej głębokości.",
          "Ta liczba nie przenosi się między łańcuchami. Na [[l2-rpc|L2]] bloki powstają często co 2 sekundy lub szybciej i produkuje je jeden [[sequencer|sekwencer]], więc dwadzieścia potwierdzeń to tam niewiążące zapewnienie jednej strony, a nie dwadzieścia bloków pracy konsensusu. Własny tag `finalized` warstwy L2 odzwierciedla to, co zostało rozliczone na Ethereum, a to może być daleko w tyle. Liczba przepisana z integracji na L1 do L2 jest prawie zawsze błędna."
        ]
      },
      {
        heading: "Poprawna implementacja",
        paragraphs: [
          "Zwykła definicja to `confirmations = head - blockNumber + 1`, w której blok zawierający transakcję liczy się jako pierwsze potwierdzenie. Samo obliczenie nie wystarcza: głębokość nic nie mówi o tym, czy blok jest nadal kanoniczny. Przy każdym odpytaniu trzeba ponownie odczytać [[eth-get-transaction-receipt|receipt]] i porównać `blockHash` z tym, który był widoczny wcześniej. Transakcja może mieć dziesięć bloków głębokości na gałęzi, która zaraz zostanie porzucona.",
          "Head, z którym się porównuje, musi pochodzić z tego samego węzła, który zwrócił receipt. Różne endpointy widzą head w różnym czasie, więc liczenie głębokości względem [[eth-block-number|eth_blockNumber]] jednego providera przy odczytywaniu receiptów od innego daje liczby, które skaczą i czasem się cofają; zobacz [[head-lag|spójność head między węzłami]]."
        ]
      }
    ],
    pitfalls: [
      "Liczenie głębokości bez ponownego sprawdzenia `blockHash`; transakcja, która wygląda na głęboko zakopaną, ale leży na osieroconej gałęzi, nie ma żadnych potwierdzeń.",
      "Czekanie na `finalized` w interaktywnym przepływie; to około 13 minut kręcącego się kółka, a wystarczyłoby kilka bloków i późniejsze sprawdzenie rozliczenia.",
      "Przenoszenie progu potwierdzeń z L1 na L2, gdzie bloki dzielą sekundy, a produkuje je jeden sekwencer.",
      "Mieszanie providerów przy liczeniu; numery head z opóźnionego węzła sprawiają, że licznik skacze albo na chwilę maleje."
    ]
  },
  "cursor-pagination": {
    title: "Paginacja kursorem i zakresem",
    aliases: [
      "cursor pagination",
      "paginacja",
      "pagination",
      "zakres bloków",
      "block range",
      "fromBlock toBlock",
      "chunking",
      "checkpoint",
      "wznawianie",
      "resume"
    ],
    summary: "Paginacja kursorem i zakresem to sposób, w jaki [[indexer|indekser]] przechodzi łańcuch w ograniczonych kawałkach: stałe okna od `fromBlock` do `toBlock` dla [[eth-get-logs|eth_getLogs]], trwały zapis ostatniego w pełni przetworzonego bloku i adaptacyjna zmiana rozmiaru okna, gdy endpoint je odrzuca.",
    sections: [
      {
        heading: "Zakresy zamiast offsetów",
        paragraphs: [
          "`eth_getLogs` nie ma `LIMIT`, offsetu ani tokenu następnej strony. Jedyne parametry sterujące to `fromBlock` i `toBlock` albo pojedynczy `blockHash`. Stronicowanie robi więc wywołujący, a endpoint egzekwuje własne limity: maksymalną szerokość zakresu, maksymalną liczbę dopasowanych logów albo maksymalny rozmiar odpowiedzi. Przekroczenie któregoś kończy się [[rpc-errors|błędem]], a nie uciętą stroną, z komunikatami w rodzaju „query returned more than 10000 results” albo „block range is too wide”, zwykle z kodem `-32005` albo serwerowym kodem `-32000`.",
          "Te limity różnią się między [[rpc-provider|providerami]], między planami i między [[execution-client|klientami]], a żaden z nich nie jest częścią specyfikacji, więc szerokość zakresu, która działa wszędzie, nie istnieje. Forma filtra z `blockHash` całkowicie omija limit szerokości, bo wskazuje dokładnie jeden blok, i właśnie jej powinna używać pętla podążająca za head."
        ]
      },
      {
        heading: "Trwały kursor",
        paragraphs: [
          "Kursor to najwyższy blok, którego wiersze pochodne są w całości zapisane, przechowywany razem z hashem tego bloku. Trzeba go aktualizować w tej samej transakcji bazodanowej co wiersze, które obejmuje; inaczej awaria rozsynchronizuje jedno z drugim i po restarcie proces albo pominie blok, albo przetworzy go drugi raz. Po restarcie proces czyta kursor, sprawdza, czy zapisany hash jest nadal kanoniczny, i kontynuuje od następnej wysokości.",
          "Kursor przesuwa się też do tyłu. Po wykryciu [[reorg|reorgu]] rollback usuwa wiersze powyżej wspólnego przodka i cofa kursor do niego, więc ta sama ścieżka kodu, która obsługuje restart, obsługuje też reorg. Wiele pipeline'ów utrzymuje drugi, wolniejszy kursor, który przesuwa się tylko do bloków `finalized` lub wcześniejszych albo do bloków o stałej głębokości [[confirmations|potwierdzeń]], i to on napędza eksporty i agregaty."
        ]
      },
      {
        heading: "Adaptacyjne zakresy i backfill",
        paragraphs: [
          "Strojenie odbywa się przy backfillu (uzupełnianiu danych historycznych). Zaczyna się od wstępnie wybranej szerokości, przy błędzie limitu zmniejsza się ją o połowę i ponawia zapytanie od tego samego bloku startowego, a po serii udanych zapytań powoli się ją zwiększa. Aktywność jest nierównomierna – blok z airdropem może wyemitować więcej logów niż tysiąc poprzednich bloków razem – więc szerokość dostrojona na spokojnej historii zawiedzie na ruchliwej, a stała szerokość wszędzie indziej marnuje wywołania. Adaptacyjną szerokość łączy się z backoffem przy odpowiedziach `429`; zobacz [[rate-limits|rate limity]].",
          "Duży backfill dzieli się na shardy, każdy z własnym kursorem na rozłącznym zakresie; działają równolegle i są scalane, gdy dojdą do workera podążającego za head. To działa tylko wtedy, gdy zapisy są idempotentne: upsert po (`blockHash`, `logIndex`) sprawia, że ponowiony albo nakładający się zakres nie tworzy duplikatów, co przy okazji czyni bezpiecznymi zwykłe [[retries|ponowienia (retry)]]."
        ]
      }
    ],
    example: {
      title: "Zapytanie o zakres, błąd limitu i ponowienie z połową szerokości",
      note: "Kursora nigdy nie przesuwa się za okno, które skończyło się błędem; poprawne ponowienie startuje od tego samego `fromBlock` z mniejszym `toBlock`."
    },
    pitfalls: [
      "Używanie `toBlock: \"latest\"` w pętli backfillu, przez co okno rośnie razem z łańcuchem, a wyniku nie da się odtworzyć.",
      "Przesunięcie kursora po częściowym zapisie; pominięte logi nigdy nie zostaną odwiedzone ponownie, bo nic nie skanuje wstecz.",
      "Ponawianie odrzuconego zakresu od środka zamiast od pierwotnego `fromBlock`, co po cichu gubi pierwszą połowę okna.",
      "Hardkodowanie jednej szerokości zakresu dla każdego endpointu; limity zależą od providera, od planu i od tego, jak gęsto kontrakt emituje logi."
    ]
  },
  "historical-data": {
    title: "Dane historyczne",
    aliases: ["stare bloki", "historia", "historia łańcucha", "źródło backfillu", "ancient data", "historyczny stan"],
    summary: "Dane historyczne to przeszłość łańcucha, czyli bloki, transakcje, receipty i logi. To coś innego niż historyczny [[state|stan]]: [[full-node|pełny węzeł]] trzyma każde z nich do innej głębokości i każde traci przez inny rodzaj pruningu.",
    sections: [
      {
        heading: "Historia to nie stan",
        paragraphs: [
          "Historia to to, co zostało opublikowane: [[block-header|nagłówki]], body bloków z transakcjami i [[transaction-receipt|receipty]] z ich logami. Stan to wynik wykonania tej historii: saldo, [[nonce|nonce]], hash kodu i sloty storage każdego [[account|konta]] na dany blok. Pełny węzeł trzyma tylko niedawny stan, bo przechowywanie snapshotu stanu dla każdego bloku jest właśnie tym, co czyni [[archive-node|węzeł archiwalny]] drogim, a [[partial-archive|częściowe archiwum]] trzyma okno albo wycinek tego stanu. Pełne węzły kiedyś przechowywały też całą historię i [[geth|Geth]] nadal robi to domyślnie, ale to, ile historii trzyma węzeł, zależy dziś od klienta.",
          "W praktyce różnicę widać po tym, które wywołanie się nie udaje. [[eth-get-block-by-number|eth_getBlockByNumber]] i [[eth-get-logs|eth_getLogs]] dla zakresu sprzed pięciu lat działają na pełnym węźle, który zachował historię, takim jak domyślny węzeł Geth. [[eth-get-balance|eth_getBalance]], [[eth-call|eth_call]], [[eth-get-storage-at|eth_getStorageAt]] i [[eth-get-proof|eth_getProof]] na tym samym bloku już nie działają: zwracają [[rpc-errors|błąd]] „missing trie node” albo „historical state not available”, bo trie dla tego bloku zostało usunięte. [[geth|Geth]] ze schematem opartym na ścieżkach (path-based) trzyma stan mniej więcej z ostatnich 128 bloków."
        ]
      },
      {
        heading: "Historia, która znika",
        paragraphs: [
          "EIP-4444 zaproponował, żeby węzły przestały serwować bardzo stare body i receipty, a w 2025 roku [[execution-client|klienci wykonawczy]] zaczęli to robić częściowo: body i receipty sprzed Merge mogą zostać usunięte, a wszystkie nagłówki zostają. Nowsze ustawienia domyślne idą dalej: świeży węzeł mainnetu [[nethermind|Nethermind]] 2.0 pobiera body i receipty dopiero od bloku 24 600 000, [[erigon|Erigon]] 3.5 i nowsze w domyślnym trybie full trzyma tylko ostatnie 262 144 bloki, a Erigon 3.6 w świeżym datadir w ogóle nie zapisuje receiptów i odtwarza je na żądanie; zobacz [[history-expiry|wygasanie historii]] i [[receipt-retention|retencję receiptów]]. Dystrybucja starej historii przeniosła się do [[era-files|plików archiwalnych era1]] i do [[portal-network|Portal Network]]. Niezależnie od tego [[geth|Geth]] trzyma indeks hashy transakcji tylko dla `--history.transactions` ostatnich bloków, domyślnie około 2 350 000, więc [[eth-get-transaction-by-hash|eth_getTransactionByHash]] zwraca `null` dla starszych transakcji na węźle, który wciąż ma ich blok.",
          "Dane [[blob|blobów]] zawsze były tymczasowe. Sidecary są przechowywane w [[consensus-layer|warstwie konsensusu]] przez 4096 epok, czyli mniej więcej 18 dni; potem zostają tylko versioned hashes w [[transaction|transakcjach]], które je przeniosły, a same bajty trzeba wziąć od [[blob-archive|tego, kto je zarchiwizował]]."
        ]
      },
      {
        heading: "Skąd brać stare dane",
        paragraphs: [
          "Są cztery źródła, uszeregowane według rosnącego zaufania, którego wymagają. Własny węzeł archiwalny odpowiada na wszystko, ale kosztuje terabajty dysku i dni synchronizacji. [[rpc-provider|Provider]] z obsługą archiwum odpowiada na te same wywołania za opłatą i przy założeniu, że mu się ufa. [[indexer|Indekser]] albo zbiór danych, czyli własny [[etl-pipeline|zrzut ETL]], [[chain-analytics|publiczna hurtownia danych]] albo API [[block-explorer|eksploratora bloków]], znacznie szybciej odpowiada na pytania, które da się sformułować jako zapytanie, ale tylko o to, co zdecydował się zaindeksować. Pliki era i Portal Network dają surowe bloki, a weryfikację zostawiają odbiorcy.",
          "Jedna subtelność zaskakuje zespoły budujące systemy oparte na [[state-proof|dowodach]]: archiwalny stan to nie to samo co archiwalne dowody. Klienci, którzy przechowują stan w płaskich układach klucz-wartość, mogą zwrócić stare saldo, a jednocześnie nie umieć odbudować trie node'ów tego bloku, więc `eth_getProof` dla głębokiego bloku może się nie udać na węźle, który bez problemu odpowiada dla niego na `eth_getBalance`; zobacz [[client-storage|silniki bazy danych klientów]]."
        ]
      }
    ],
    pitfalls: [
      "Zakładanie, że endpoint archiwalny odpowiada na każdą metodę historyczną; tracing i głębokość `eth_getProof` to osobne możliwości, które trzeba sprawdzić.",
      "Planowanie backfillu całej historii na endpoincie z limitem zakresu bloków bez wcześniejszego sprawdzenia, jak daleko wstecz naprawdę serwuje logi.",
      "Oczekiwanie, że treść blobów będzie dostępna po miesiącach; trwały jest tylko versioned hash, a sidecar jest usuwany po około 18 dniach.",
      "Rozumienie „pełnego węzła” jako takiego, który odpowie na historyczne `eth_call`; może mieć historię, ale nie stan, którego te wywołania potrzebują."
    ]
  },
  "etl-pipeline": {
    title: "Pipeline ETL",
    aliases: [
      "ETL pipeline",
      "ETL",
      "extract transform load",
      "ethereum-etl",
      "cryo",
      "hurtownia danych",
      "data warehouse",
      "eksport masowy",
      "bulk export"
    ],
    summary: "Pipeline ETL dla łańcucha pobiera (extract) przez RPC surowe bloki, receipty i logi, przekształca je (transform), dekodując według [[abi|ABI]] i zamieniając [[hex-encoding|hex]] na typowane kolumny, a potem idempotentnie ładuje (load) do bazy, która znosi późniejszy [[reorg|reorg]] przepisujący świeże wiersze.",
    sections: [
      {
        heading: "Ekstrakcja",
        paragraphs: [
          "Ekstrakcja to te same dwa wywołania, które wykonuje [[indexer|indekser]] – [[eth-get-block-by-number|eth_getBlockByNumber]] i [[eth-get-block-receipts|eth_getBlockReceipts]] – wysyłane z taką współbieżnością, jaką znosi endpoint, często łączone w [[batch-request|batche]] po 10 do 100 żądań, żeby ograniczyć liczbę round tripów. Warto to jawnie policzyć: 20 milionów bloków po dwa wywołania to 40 milionów żądań, więc przepustowość wyznaczają [[rate-limits|rate limity]] i [[cursor-pagination|dobór zakresów]], a nie baza danych.",
          "[[internal-transaction|Wewnętrzne transfery wartości]] są kosztownym wyjątkiem. Nie emitują żadnego [[event-log|logu]], więc ich odtworzenie wymaga [[trace-api|trace_block]] albo [[debug-api|debug_traceBlockByNumber]] z `callTracer`, co na blok kosztuje o rzędy wielkości więcej, na wielu endpointach jest niedostępne, a dla starych zakresów wymaga [[archive-node|węzła archiwalnego]]."
        ]
      },
      {
        heading: "Transformacja",
        paragraphs: [
          "Transformacja to głównie typowanie i dekodowanie. Każde pole liczbowe przychodzi jako hex QUANTITY, a wartości `uint256` nie mieszczą się w 64-bitowej liczbie całkowitej: kwota tokena z 18 miejscami po przecinku rutynowo przepełnia `BIGINT`, więc kwoty trzeba trzymać w szerokim typie dziesiętnym albo jako ciąg bajtów. Adresy i hashe powinny być zapisane w jednej kanonicznej formie, jako hex małymi literami albo surowe bajty, bo mieszanie adresów z checksumą i adresów małymi literami sprawia, że joiny po cichu gubią dopasowania.",
          "Dekodowanie mapuje `topics[0]` na [[event-signature|sygnaturę eventu]] i rozpakowuje pozostałe topics oraz `data` według ABI kontraktu. Surowy log warto trzymać obok zdekodowanego wiersza. Błędne ABI albo nowo odkryty event oznaczają wtedy ponowną transformację danych, które już są na miejscu, a nie drugą, wielodniową ekstrakcję."
        ]
      },
      {
        heading: "Ładowanie",
        paragraphs: [
          "Ładowanie musi być idempotentne, bo każde ponowienie, nakładanie się shardów i ponowne przetworzenie po reorgu zapisuje wiersze, które mogą już istnieć. Upsert po (`blockHash`, `logIndex`) sprawia, że powtórzenia są nieszkodliwe, a `blockHash` w kluczu każdej tabeli pochodnej zamienia rollback w usunięcie zamiast przebudowy; zobacz [[indexing-database|bazę danych indeksera]]. Gotowe narzędzia pokrywają typowe przypadki: ethereum-etl eksportuje bloki, transakcje, receipty, logi i transfery tokenów do CSV, JSON albo hurtowni danych, a Cryo zapisuje te same podstawowe dane do Parquet z regulowanymi zakresami bloków.",
          "Dobrze starzeje się układ dwuetapowy. Najpierw zapisuje się surowe tabele tylko do dopisywania (append-only) prosto z RPC, a potem buduje się z nich tabele zdekodowane i zagregowane. Warstwę surową drogo jest odtworzyć, pochodną tanio, a ich rozdzielenie oznacza, że zmiana schematu nigdy nie wymusza kolejnego pełnego backfillu, czyli ponownego pobierania [[historical-data|danych historycznych]]."
        ]
      }
    ],
    pitfalls: [
      "Zapisywanie kwot `uint256` w 64-bitowej kolumnie całkowitoliczbowej; zwykły transfer tokena z 18 miejscami po przecinku ją przepełnia, a w niektórych silnikach błąd przechodzi po cichu.",
      "Dekodowanie wyłącznie podczas ekstrakcji, przez co błąd w ABI wymusza pełną ponowną ekstrakcję zamiast taniej ponownej transformacji.",
      "Mieszanie adresów z checksumą i adresów małymi literami w różnych tabelach, co zamienia joiny w ciche puste wyniki.",
      "Zakładanie, że trace'y są dostępne; wiele endpointów nie udostępnia ani `trace_`, ani `debug_`, a te, które je udostępniają, liczą za nie znacznie więcej niż za wywołania `eth_`."
    ]
  },
  "indexing-database": {
    title: "Baza danych indeksera",
    aliases: [
      "indexing database",
      "schemat",
      "schema",
      "postgres",
      "clickhouse",
      "schemat odporny na reorgi",
      "reorg-safe schema",
      "tabele pochodne",
      "derived tables"
    ],
    summary: "Baza danych indeksera przechowuje pochodne dane łańcucha w takiej postaci, że [[reorg|reorg]] da się cofnąć: tabela bloków z kluczem `hash` i kolumną `parent_hash`, każdy wiersz pochodny z odpowiednim `block_hash` i rollback, który jest jednym usunięciem schodzącym kaskadowo w dół.",
    sections: [
      {
        heading: "Struktura odporna na reorgi",
        paragraphs: [
          "Wszystko opiera się na jednej tabeli: blocks, z kolumnami `number`, `hash`, `parent_hash` i `timestamp`. To ona pozwala [[indexer|indekserowi]] porównać `parentHash` świeżo pobranego nagłówka z tym, co już zapisał, i to od niej zaczyna się usuwanie. Każda tabela pochodna – logi, zdekodowane transfery, pozycje, salda – zawiera `block_hash`, z którego powstała, i odwołuje się do tej tabeli z `ON DELETE CASCADE`.",
          "W takiej strukturze cofnięcie reorgu to jedno polecenie, które usuwa bloki powyżej wspólnego przodka; kaskada usuwa wszystko, co od nich zależy, i żadna tabela pochodna nie potrzebuje własnej logiki rollbacku. Poprawność daje klucz z [[block-hash|hashem bloku]], a nie z numerem: blok zastępczy ma ten sam numer, więc wiersz, którego kluczem jest numer, zostałby w jednych tabelach po cichu nadpisany, a w innych zostałby nieaktualny."
        ]
      },
      {
        heading: "Klucze i typy",
        paragraphs: [
          "Naturalnym unikalnym kluczem logu jest (`block_hash`, `log_index`), bo `logIndex` jest unikalny w obrębie bloku. Ustawienie go jako klucza głównego i zapis przez upsert dają idempotentność za darmo, więc ponowiony zakres albo nakładający się shard backfillu (uzupełniania danych historycznych) nie mogą stworzyć duplikatów. Wiersze na poziomie transakcji mają klucz (`block_hash`, `transaction_index`), który pozostaje poprawny nawet wtedy, gdy ten sam hash transakcji pojawia się w dwóch gałęziach.",
          "Typy są równie ważne jak klucze. `uint256` wymaga szerokiego typu dziesiętnego, takiego jak `NUMERIC(78, 0)`, albo surowych bajtów, nigdy 64-bitowej liczby całkowitej. Hashe i [[address|adresy]] to pola binarne o stałej szerokości albo jedna spójna konwencja hex małymi literami. Timestampy bloków pochodzą z [[block-header|nagłówka]] i są jedynym zegarem, po którym warto indeksować; rzeczywisty czas pobrania danych mówi coś o działaniu pipeline'u, a nie o łańcuchu."
        ]
      },
      {
        heading: "Wybór silnika i serwowanie danych",
        paragraphs: [
          "Postgres jest domyślnym wyborem, bo klucze obce, kaskady i transakcyjne upserty dają odporność na reorgi prawie bez kodu. ClickHouse i podobne bazy analityczne wygrywają przy zapytaniach agregujących, które skanują dużo danych, ale nie mają kaskadowego usuwania, więc obsługa reorgów przechodzi do kodu, który zapisuje dane: albo usuwa się i przepisuje partycję, albo ładuje się tylko bloki `finalized` lub wcześniejsze, a nieustalony head serwuje się z innego miejsca.",
          "Niezależnie od silnika agregaty i widoki zmaterializowane powinny być liczone tylko z bloków do ustalonej granicy, a nie do head, żeby [[reorg|reorg]] o jeden blok nigdy nie wymuszał przeliczenia. Razem z danymi warto też zapisywać kursor i endpoint źródłowy: wiersze pochodne nie są kanoniczne, a jedyną obroną jest możliwość ich odbudowania z tym samym wynikiem; zobacz [[confirmations|potwierdzenia]]."
        ]
      }
    ],
    example: {
      title: "Szkic schematu odpornego na reorgi i możliwy dzięki niemu rollback",
      note: "Każda tabela pochodna, która zawiera `block_hash` i kaskadowo zależy od `blocks`, dziedziczy obsługę reorgów bez ani jednej linijki własnego kodu."
    },
    pitfalls: [
      "Ustawienie `block_number` jako klucza głównego tabeli pochodnej; blok zastępczy ma ten sam numer i nieaktualny wiersz przetrwa reorg.",
      "Zapisywanie kwot tokenów w `BIGINT`; kwota `uint256` tokena z 18 miejscami po przecinku wychodzi poza ten zakres i albo się zawija, albo zgłasza błąd w nieprzewidywalnym wierszu.",
      "Serwowanie agregatów liczonych z nieustalonych bloków przy head, przez co sumy chwieją się przy każdym reorgu o jeden blok.",
      "Zakładanie, że bazy w stylu ClickHouse dają rollback; bez kaskadowego usuwania logika reorgów musi być w kodzie, który zapisuje dane."
    ]
  },
  "the-graph": {
    title: "The Graph i subgraphy",
    aliases: ["The Graph", "subgraph", "subgraphy", "graphql", "GRT", "graph-node"],
    summary: "The Graph to protokół indeksowania, w którym subgraphy deklarują w manifeście, schemacie GraphQL i mappingach w AssemblyScript, które eventy kontraktów ma śledzić `graph-node` i jakie encje zapisywać, dzięki czemu aplikacje wysyłają zapytania GraphQL zamiast [[eth-get-logs|eth_getLogs]].",
    sections: [
      {
        heading: "Czym jest subgraph",
        paragraphs: [
          "Subgraph składa się z trzech artefaktów. Manifest, `subgraph.yaml`, wymienia źródła danych: [[address|adres]] kontraktu, [[abi|ABI]], `startBlock` i handlery, które wiążą kanoniczną sygnaturę eventu z nazwą funkcji. `schema.graphql` deklaruje encje i pola, które udostępni API. Kod mappingów, pisany w AssemblyScript i kompilowany do WebAssembly, dostaje każdy zdekodowany [[event-log|event]] jako typowany obiekt i zapisuje encje.",
          "`graph-node` to [[graph-node|proces, który to wszystko uruchamia]]. Każdy ciąg `event:` zamienia na topic0 dokładnie tak, jak wylicza się [[event-signature|sygnatury eventów]], subskrybuje od `startBlock`, wywołuje handler raz dla każdego pasującego logu, po kolei, i zapisuje powstałe encje, żeby zapytanie GraphQL mogło je łączyć i filtrować. Handlery są deterministyczne: mogą czytać dane łańcucha przez [[eth-call|eth_call]], ale nie mogą wykonywać dowolnych operacji sieciowych, bo dwa indeksery muszą otrzymać identyczne wyniki."
        ]
      },
      {
        heading: "Skąd pochodzą dane",
        paragraphs: [
          "W zwykłej konfiguracji `graph-node` łączy się z endpointem RPC i zachowuje się jak każdy inny [[indexer|indekser]]: podąża za head, pobiera logi i bloki i śledzi `parentHash`, żeby przy [[reorg|reorgu]] cofnąć wersje encji. Ponieważ każdy zapis encji jest powiązany z blokiem, rollback dzieje się automatycznie i autor mappingu nie musi go obsługiwać.",
          "Dwa rodzaje handlerów mocno podnoszą wymagania. Handlery wywołań (call handlers) uruchamiają się przy wywołaniu funkcji kontraktu i zależą od API tracingu w stylu Parity, więc potrzebują endpointu z [[trace-api|obsługą trace]], zwykle [[archive-node|archiwalnego]]. Handlery bloków (block handlers) działają przy każdym bloku i to najdroższa ze wszystkich opcji. Do przypadków o dużej przepustowości The Graph oferuje [[firehose|Firehose]] i [[substreams|Substreams]], które strumieniują wcześniej wyekstrahowane dane bloków, zamiast kazać węzłowi odpowiadać na zapytania pojedynczo."
        ]
      },
      {
        heading: "Sieć, Studio i ograniczenia",
        paragraphs: [
          "Prace deweloperskie odbywają się w Subgraph Studio, gdzie subgraph buduje się za pomocą CLI `graph` i wdraża na próbę. Produkcja działa w zdecentralizowanej sieci, w której niezależni operatorzy indeksują subgraphy, kuratorzy sygnalizują, które z nich są ważne, a za zapytania płaci się w GRT. Częste jest też samodzielne hostowanie `graph-node` obok własnego węzła, gdy dane są prywatne albo wolumen zapytań jest mały.",
          "Przed decyzją warto znać ograniczenia. Indeksowanie zaczyna się od `startBlock` i stamtąd musi dogonić head, więc stary kontrakt oznacza długą początkową synchronizację. Większość zmian schematu albo mappingów tworzy nowe wdrożenie, które synchronizuje się od zera. A serwowane dane zawsze są trochę za head, więc subgraph to dobre źródło historii i agregatów, ale słabe źródło odpowiedzi na pytanie „czy moja transakcja właśnie trafiła do bloku”; do tego służy [[eth-get-transaction-receipt|eth_getTransactionReceipt]]."
        ]
      }
    ],
    example: {
      title: "Manifest subgraphu wiążący jeden event z jednym handlerem",
      note: "Ciąg `event:` to kanoniczna sygnatura z zachowanymi znacznikami `indexed`; graph-node hashuje wersję bez nich, żeby dostać topic0, a ze znaczników wie, które argumenty pochodzą z topics."
    },
    pitfalls: [
      "Pozostawienie `startBlock` na 0, przez co subgraph odtwarza lata nieistotnych bloków, zanim dotrze do właściwego kontraktu.",
      "Używanie handlerów wywołań albo bloków bez sprawdzenia, czy endpoint udostępnia tracing i historię archiwalną; w przeciwnym razie indeksowanie po prostu staje.",
      "Traktowanie danych z subgraphu jako sygnału w czasie rzeczywistym, że transakcja trafiła do bloku; subgraph jest za head i nie powinien decydować o pokazaniu użytkownikowi statusu „wysłano”.",
      "Oczekiwanie, że zmiana schematu zadziała w miejscu; większość zmian wdraża nową wersję subgraphu, która musi ponownie synchronizować się od `startBlock`."
    ]
  },
  "block-explorer": {
    title: "Eksploratory bloków",
    aliases: [
      "block explorer",
      "eksplorator bloków",
      "etherscan",
      "blockscout",
      "API eksploratora",
      "explorer api",
      "zweryfikowany kod źródłowy",
      "verified source"
    ],
    summary: "Eksplorator bloków to strona internetowa i API nad zaindeksowaną kopią łańcucha – Etherscan, Blockscout, Otterscan – które pokazują [[block|bloki]], transakcje, [[event-log|logi]], wywołania wewnętrzne odtworzone z [[execution-trace|trace'ów]], salda tokenów i zweryfikowany kod źródłowy kontraktów.",
    sections: [
      {
        heading: "Co dodają ponad RPC",
        paragraphs: [
          "Większości tego, co czyni eksplorator użytecznym, nie da się dostać z węzła jednym wywołaniem. [[internal-transaction|Transakcje wewnętrzne]] – wywołania przenoszące wartość, które [[smart-contract|smart kontrakty]] wykonują w trakcie transakcji – nie emitują [[event-log|logu]] i nie mają [[transaction-receipt|receiptu]], więc eksplorator odtwarza je, uruchamiając [[trace-api|trace_block]] albo [[debug-api|debug_traceBlockByNumber]] dla każdego bloku i zapisując wyniki. Salda tokenów i historie transferów składa się z logów `Transfer`. Nazwy funkcji i eventów pochodzą z dekodowania selektorów [[abi|ABI]] za pomocą [[signature-directory|katalogu sygnatur]].",
          "Drugą połową jest weryfikacja kodu źródłowego. Deweloper przesyła źródła i ustawienia kompilatora, eksplorator kompiluje je ponownie i porównuje bytecode z tym, który jest wdrożony, a przy zgodności publikuje źródło i ABI. To właśnie ABI pozwala potem eksploratorowi i każdemu, kto korzysta z jego API, dekodować calldata i eventy dla tego [[address|adresu]]."
        ]
      },
      {
        heading: "Trzy najczęściej spotykane",
        paragraphs: [
          "Etherscan to zamknięta usługa hostowana, która obejmuje Ethereum i wiele innych sieci, z REST API wymagającym klucza API i z niskim limitem żądań w darmowym planie. Blockscout jest open source, można go hostować samodzielnie, działa jako domyślny eksplorator wielu testnetów (sieci testowych) i [[rollup|rollupów]], a obok własnego API udostępnia API zgodne z Etherscanem. [[otterscan|Otterscan]] to coś innego: samodzielnie hostowany frontend, który rozmawia bezpośrednio z węzłem [[erigon|Erigon]] przez przestrzeń nazw `ots_`, więc nie ma osobnego indeksu do utrzymywania ani nikogo trzeciego po drodze.",
          "Otterscan nie ma własnego API: to aplikacja w przeglądarce, która czyta [[json-rpc|JSON-RPC]] Erigona bezpośrednio. API Etherscanu i Blockscouta to REST z własnymi nazwami parametrów, paginacją i obsługą kluczy, dlatego API eksploratora przydaje się do analiz i narzędzi, ale nie zastąpi bez zmian [[rpc-provider|providera RPC]]."
        ]
      },
      {
        heading: "Dlaczego dane eksploratora się opóźniają i różnią",
        paragraphs: [
          "Eksplorator jest [[indexer|indekserem]], więc wszystko, co pokazuje, to dane pochodne. Strony bloków i transakcji pojawiają się zwykle w ciągu jednego lub dwóch bloków, ale salda tokenów, liczby posiadaczy, analityka i etykiety powstają w wolniejszych zadaniach i mogą zostawać za łańcuchem o minuty. Po [[reorg|reorgu]] eksplorator przepisuje własną historię, dlatego transakcja może być widoczna, a potem zniknąć.",
          "Trzeba go traktować odpowiednio. Eksplorator świetnie nadaje się do badania pojedynczej transakcji, czytania zweryfikowanego źródła albo ręcznego sprawdzania adresu, ale jest złym źródłem prawdy dla wszystkiego, co zautomatyzowane i finansowe; tam odpowiedzią jest [[eth-get-transaction-receipt|receipt]] z zaufanego węzła."
        ]
      }
    ],
    pitfalls: [
      "Nazywanie transakcji wewnętrznych z eksploratora prawdziwymi transakcjami; nie mają własnego hasha ani receiptu i nie istnieją niezależnie poza trace'em.",
      "Budowanie logiki produkcyjnej na API eksploratora, którego rate limity, wymagania co do kluczy i kształt odpowiedzi nie są ani standardowe, ani gwarantowane.",
      "Ufanie zweryfikowanemu źródłu proxy; zweryfikowany kod pod tym adresem to samo proxy, a właściwe działanie znajduje się pod adresem implementacji.",
      "Traktowanie salda tokena w eksploratorze jako autorytatywnego; jest przeliczane z zaindeksowanych transferów i może się opóźniać albo pomijać niestandardowe zachowanie tokenów."
    ]
  },
  "internal-transaction": {
    title: "Transakcje wewnętrzne",
    aliases: [
      "internal transaction",
      "internal transactions",
      "transakcja wewnętrzna",
      "transfer wewnętrzny",
      "wywołanie wewnętrzne",
      "message call",
      "transfer z kontraktu",
      "ots_getInternalOperations"
    ],
    summary: "Transakcja wewnętrzna to wywołanie albo transfer wartości, które wykonuje kod [[smart-contract|smart kontraktu]] w trakcie wykonywania [[transaction|transakcji]]. Nie ma własnego hasha ani [[transaction-receipt|receiptu]], a na mainnecie nie ma dziś też własnego [[event-log|logu]], więc staje się widoczna dopiero wtedy, gdy węzeł wykona transakcję ponownie z tracerem.",
    sections: [
      {
        heading: "Ramka wywołania, nie transakcja",
        paragraphs: [
          "Transakcję podpisuje wyłącznie konto EOA (externally owned account). Wszystko, co wywołany kontrakt robi dalej — `CALL`, `CALLCODE`, `DELEGATECALL`, `STATICCALL`, `CREATE`, `CREATE2`, `SELFDESTRUCT` — otwiera nową ramkę wywołania (call frame) wewnątrz tej samej transakcji w [[evm|EVM]]. Body bloku nie zapisuje żadnej z tych ramek, receipt zapisuje tylko wynik całej transakcji, a [[state-root|state root]] tylko salda, które z niej wynikły. Dziś na mainnecie kontrakt, który wypłaca użytkownikowi 1 ether, zmienia jego [[eth-get-balance|saldo]], ale nie zostawia w łańcuchu niczego, co wskazywałoby tę płatność, chyba że sam wyemituje event, a zwykły transfer etheru na konto bez kodu nie emituje zupełnie nic. Na Sepolii od 6 października 2026 działa EIP-7708, dzięki któremu każdy niezerowy transfer etheru emituje log `Transfer`.",
          "„Transakcja wewnętrzna” to słownictwo eksploratorów bloków na określenie widoku zbudowanego z [[execution-trace|trace wykonania]]: zwykle ramek poniżej najwyższego poziomu, które przesunęły ether, oraz operacji tworzenia kontraktów i self-destruct. Ramka nie ma własnego identyfikatora, tylko pozycję — `traceAddress` w [[trace-api|przestrzeni nazw trace_]] albo ścieżkę przez zagnieżdżone tablice `calls` w [[debug-api|callTracer]] — więc transakcję wewnętrzną zawsze identyfikuje hash transakcji plus ta pozycja."
        ]
      },
      {
        heading: "Jak je pobrać przez RPC",
        paragraphs: [
          "Każda metoda, która je zwraca, wykonuje transakcję ponownie. `debug_traceTransaction` i `debug_traceBlockByNumber` z `callTracer` dają zagnieżdżone drzewo wywołań. `trace_transaction` i `trace_block` dają płaską listę, a `trace_filter` z `fromAddress` albo `toAddress` odpowiada na pytanie o „każdy ruch etheru na ten adres” w zakresie bloków. `ots_getInternalOperations` z [[otterscan|Otterscan]] zwraca tylko transfery, utworzenia kontraktów i self-destructy, oznaczone typami od 0 do 3. Ponowne wykonanie wymaga stanu sprzed transakcji, więc wszystko starsze niż okno ostatnich stanów [[pruned-node|węzła z pruningiem]] wymaga [[archive-node|węzła archiwalnego]], a [[rpc-provider|dostawcy RPC]] wyceniają tracing dużo wyżej niż zwykłe wywołania `eth_`.",
          "Nie każda zmiana salda to transakcja wewnętrzna. [[withdrawals|Wypłata z EIP-4895]] jest księgowana poza EVM, więc trafia na listę `withdrawals` bloku i nie pojawia się w żadnym trace. Tak samo jest z priority fee, które trafia do odbiorcy opłat (fee recipient) bloku. Przed [[the-merge|Merge]] podobnie działały nagrody za bloki i za bloki uncle: `trace_block` raportuje je jako wpisy `reward`, a `callTracer` nie ma dla nich ramki. [[accounting-reconciliation|Uzgadnianie sald]] zbudowane wyłącznie z transakcji i trace'ów nigdy się nie zbilansuje dla adresów walidatora."
        ]
      },
      {
        heading: "Co jest transferem, zależy od tego, kto liczy",
        paragraphs: [
          "Tracery pokazują, co próbowano zrobić, a nie to, co ostatecznie zostało. Ramka, która zrobiła revert, ma `error`, ale udana ramka wewnątrz rodzica, który później zrobił revert, nie ma żadnego, a jej ether nigdy się nie przesunął, więc poprawny skaner sprawdza wszystkich przodków. `value` ramki też nie zawsze oznacza ruch: hooki tracera w [[geth|Geth]] dają ramce `DELEGATECALL` wartość odziedziczoną po rodzicu, więc sumowanie `value` po wszystkich ramkach liczy ten ether dwa razy. `CALLCODE` może przenosić wartość, utworzenie kontraktu może nieść wartość początkową (endowment), a `SELFDESTRUCT` wysyła całe saldo do beneficjenta i robi to nadal po EIP-6780, choć kod zwykle zostaje.",
          "Narzędzia filtrują potem według różnych reguł. `ots_getInternalOperations` w [[erigon|Erigon]] i [[reth|Reth]] uwzględnia `CALL` tylko przy niezerowej wartości, uwzględnia każde `CREATE` i `CREATE2`, nawet bez wartości początkowej, pomija ramkę najwyższego poziomu i zostawia ramki, które cofnął revert ramki nadrzędnej. `callTracer` z Geth uwzględnia wywołania [[precompiles|precompile'ów]], a jego `flatCallTracer`, naśladujący wynik Parity, pomija je, chyba że ustawi się `includePrecompiles`. Dwa [[block-explorer|eksploratory]] zbudowane na różnych klientach mogą więc pokazać różne transakcje wewnętrzne dla tej samej transakcji i każdy będzie wierny swojemu węzłowi."
        ]
      },
      {
        heading: "Gdzie to ma znaczenie",
        paragraphs: [
          "Klasycznym przypadkiem jest [[exchange-deposits|wykrywanie depozytów na giełdzie]]. Użytkownik, który wypłaca środki z portfela będącego smart kontraktem, z multisiga albo z pozycji DeFi, wysyła ether na adres depozytowy przez wywołanie wewnętrzne. Żadna transakcja nie ma adresu depozytowego w polu `to`, a na mainnecie nie ma też logu `Transfer`, bo ether nie jest tokenem. Skaner, który obserwuje tylko transakcje najwyższego poziomu, przegapi taki depozyt, dlatego giełdy robią trace każdego bloku albo porównują salda blok po bloku i robią trace tych bloków, w których saldo zmienia się bez wyjaśnienia. Takie porównanie nie wykryje jednak depozytu na już wdrożony forwarder `CREATE2`, który przekazuje ether dalej w tym samym wywołaniu, więc jego saldo nigdy się nie zmienia. Przed tym samym wyborem staje każdy [[indexer|indekser]] raportujący przepływy etheru, a w [[etl-pipeline|pipeline ETL]] trace'y to najdroższa kolumna do wyciągnięcia."
        ]
      }
    ],
    example: {
      title: "Dwa identyczne transfery wewnętrzne, z których wydarzył się tylko jeden",
      note: "Oba wewnętrzne wywołania do `0x388c…9297` niosą 0,5 etheru i żadne nie ma własnego `error`, ale tylko pierwsze cokolwiek przesunęło: drugie leży pod ramką, która zrobiła revert, a zewnętrzna transakcja i tak zakończyła się sukcesem."
    },
    pitfalls: [
      "Liczenie każdej ramki z niezerowym `value` jako transferu, co drugi raz liczy `DELEGATECALL`, który dziedziczy wartość po rodzicu.",
      "Sprawdzanie tylko własnego pola `error` ramki; udane wywołanie wewnętrzne pod rodzicem, który zrobił revert, niczego nie przesunęło.",
      "Obserwowanie wyłącznie transakcji najwyższego poziomu kierowanych na adresy depozytowe, co pomija ether przekazany dalej przez portfele kontraktowe i multisigi.",
      "Traktowanie wypłat jak transakcji wewnętrznych; są księgowane poza EVM i nie pojawiają się w żadnym trace.",
      "Oczekiwanie, że dwa eksploratory pokażą to samo w zakładce transakcji wewnętrznych; każdy filtruje ramki trace według własnych reguł."
    ]
  },
  "graph-node": {
    title: "graph-node",
    aliases: ["Graph Node", "graph-node", "indekser subgraphów", "--ethereum-rpc", "archive,traces", "ETHEREUM_REORG_THRESHOLD"],
    summary: "`graph-node` to open source'owy serwer indeksujący The Graph, napisany w Rust. Uruchamia [[the-graph|subgraphy]]: czyta dane łańcucha przez [[json-rpc|JSON-RPC]] albo ze strumienia [[firehose|Firehose]], wykonuje ich mappingi w WebAssembly, zapisuje w Postgresie encje wersjonowane według bloków i udostępnia je przez GraphQL.",
    sections: [
      {
        heading: "Jeden proces, trzy zależności",
        paragraphs: [
          "Subgraph jest tylko opisem, a uruchamia go `graph-node`. Łączy się z Postgresem, w którym są encje, metadane wdrożeń oraz cache bloków i wyników [[eth-call|eth_call]]; z IPFS, skąd pobiera manifest, schemat, ABI i skompilowane mappingi danego wdrożenia; oraz z jednym albo kilkoma providerami łańcucha. GraphQL udostępnia na porcie 8000 (HTTP) i 8001 (WebSocket), administracyjne JSON-RPC do zarządzania wdrożeniami na 8020, status indeksowania na 8030, a metryki Prometheusa na 8040. Tej samej binarki używają instalacje self-hosted i indekserzy w sieci The Graph.",
          "Praca dzieli się na dwie części. Jedna instancja graph-node, wskazana w konfiguracji jako `ingestor`, śledzi head każdego łańcucha i domyślnie odpytuje go raz na sekundę. Każdy wdrożony subgraph skanuje potem łańcuch do przodu od swojego `startBlock` w poszukiwaniu triggerów – logów pasujących do jego event handlerów, wywołań pasujących do call handlerów i bloków dla block handlerów – i uruchamia pasujące handlery po kolei w środowisku WebAssembly, które kontaktuje się ze światem zewnętrznym wyłącznie przez funkcje hosta udostępniane przez graph-node. To ograniczenie sprawia, że dwóch operatorów indeksujących to samo wdrożenie dochodzi do tych samych encji."
        ]
      },
      {
        heading: "Czego wymaga od endpointu RPC",
        paragraphs: [
          "Większość ruchu generują event handlery. Najpierw idzie [[eth-get-logs|eth_getLogs]] w oknach domyślnie do 1000 bloków (`GRAPH_ETHEREUM_MAX_BLOCK_RANGE_SIZE`), a dla filtrów, które mają topic, ale nie mają adresu, do 500 bloków; potem pobierane są receipty bloków z dopasowaniami, przez [[eth-get-block-receipts|eth_getBlockReceipts]], jeśli endpoint obsługuje tę metodę. Mapping, który czyta stan kontraktu, wysyła eth_call przypięte hashem do przetwarzanego bloku, w formie zdefiniowanej w [[eip|EIP-1898]], żeby [[reorg|reorg]] na tej wysokości nie sprawił, że wywołanie odczyta stan bloku, który go zastąpił. Subgraph, który wykonuje wywołania podczas synchronizacji starej historii, potrzebuje więc [[archive-node|węzła archiwalnego]] dla całego zakresu. Call handlery oraz block handlery z filtrem `call` są zasilane przez `trace_filter`, którego endpoint [[geth|Geth]] nie obsługuje.",
          "Te potrzeby się deklaruje, a graph-node ich nie wykrywa. W linii poleceń provider ma postać `--ethereum-rpc NETWORK:CAPABILITIES:URL`, na przykład `mainnet:archive,traces:https://…`; w konfiguracji TOML każdy provider wymienia swoje `features`, takie jak `archive`, `traces` i `no_eip1898` dla endpointów, które odrzucają parametry z hashem bloku. graph-node przydziela każdemu subgraphowi providera, którego zadeklarowane możliwości pokrywają wymagania manifestu, więc deklaracja jest tylko zapewnieniem: endpoint oznaczony jako `archive`, który w rzeczywistości jest [[pruned-node|pruned node]], zacznie zwracać błędy wywołań daleko w trakcie synchronizacji, zamiast zostać odrzucony już przy wdrożeniu."
        ]
      },
      {
        heading: "Encje, time travel i cofanie zmian",
        paragraphs: [
          "Każdy typ encji mutowalnej staje się tabelą w Postgresie, w której każdy wiersz ma `block_range`, czyli `int4range` bloków, dla których ta wersja jest aktualna. Aktualizacja zamyka zakres starej wersji i wstawia nowy wiersz; zapytanie na bloku N czyta wersję, której zakres zawiera N, i tak właśnie działają zapytania GraphQL typu time travel z `block: { number: N }`. Typy encji niemutowalnych nie mają zakresu i przechowują tylko blok, w którym je utworzono.",
          "Ta sama struktura sprawia, że reorg jest tani. Gdy ingestor stwierdzi, że `parentHash` nowego bloku nie pasuje do zapisanego łańcucha, graph-node cofa każde dotknięte wdrożenie do wspólnego przodka – usuwa wersje utworzone powyżej niego i ponownie otwiera zakresy, które one zamknęły – po czym indeksuje nową gałąź. Autorzy mappingów nie piszą więc żadnego kodu rollbacku; dla porównania warto zobaczyć ręczne podejście opisane przy [[indexing-database|bazie danych indeksera]]. To założenie ma granicę: `ETHEREUM_REORG_THRESHOLD`, domyślnie 250 bloków. Według dokumentacji graph-node przy głębszym reorgu subgraphy mogą zawierać niespójne dane."
        ]
      },
      {
        heading: "RPC czy Firehose",
        paragraphs: [
          "Provider może zamiast tego mieć `type = \"firehose\"`. graph-node konsumuje wtedy strumień gRPC bloków już wyodrębnionych przez zinstrumentowany węzeł, razem z trace'ami wywołań, kursorami i jawnymi krokami undo (cofnięcia), zamiast wysyłać eth_getLogs i żądania trace. Wywołania z mappingów nadal potrzebują JSON-RPC; konfiguracja może dodać providera `type = \"web3call\"`, który obsługuje tylko wywołania i musi deklarować `archive`. Subgraph może też przyjąć jako źródło danych pakiet [[substreams|Substreams]]: transformację przejmuje wtedy ten silnik, a graph-node zostaje magazynem danych i serwerem GraphQL.",
          "Wybór dotyczy głównie backfillu (uzupełniania historii): przez JSON-RPC długą historię ograniczają limity zakresu na endpoincie, [[rate-limits|rate limity]] oraz dostępność danych archiwalnych i trace'ów, a przez Firehose przepustowość strumienia. Tak czy inaczej zmieniony mapping to nowe wdrożenie, które indeksuje wszystko od nowa od `startBlock`, korzystając z wyników eth_call zapisanych już w cache w Postgresie."
        ]
      }
    ],
    example: {
      title: "Deklarowanie możliwości providera w linii poleceń albo w config.toml",
      note: "Provider z Geth niczego nie deklaruje, więc obsługuje tylko subgraphy, które nie potrzebują ani historycznego eth_call, ani call handlerów. Nic nie sprawdza, czy węzeł Erigon naprawdę jest archiwalny."
    },
    pitfalls: [
      "Deklarowanie `archive` dla providera, który w rzeczywistości ma pruning, przez co historyczne eth_call w mappingach zaczynają zawodzić w połowie synchronizacji.",
      "Kierowanie subgrapha z call handlerami na endpoint Geth; graph-node pobiera triggery wywołań przez `trace_filter`, którego Geth nie implementuje.",
      "Stawianie graph-node za load balancerem, który miesza węzły z różnym headem; objawia się to fantomowymi reorgami i powtarzanym cofaniem zmian. Zobacz [[head-lag|spójność head między węzłami]].",
      "Zakładanie, że provider Firehose obsłuży też wywołania eth_call z mappingów; one nadal trafiają do endpointu JSON-RPC."
    ]
  },
  firehose: {
    title: "Firehose",
    aliases: ["StreamingFast Firehose", "fireeth", "sf.firehose.v2", "merged blocks", "STEP_UNDO", "--vmtrace=firehose"],
    summary: "Firehose to system strumieniowania bloków od StreamingFast, używany w całym ekosystemie [[the-graph|The Graph]]. Zinstrumentowany węzeł emituje w nim każdy blok z pełnymi szczegółami wykonania do płaskich plików i do strumienia gRPC, który konsument wznawia od nieprzezroczystego kursora i który zgłasza każdy [[reorg|reorg]] jako jawny krok undo (cofnięcia).",
    sections: [
      {
        heading: "Co zwykłe RPC zostawia indekserowi",
        paragraphs: [
          "[[indexer|Indekser]] oparty na [[json-rpc|JSON-RPC]] składa każdy blok z kilku wywołań – sam blok, jego receipty i trace, który wykonuje blok ponownie, jeśli indekser potrzebuje [[internal-transaction|transferów wewnętrznych]] albo zmian stanu – i sam wykrywa reorgi, porównując `parentHash`. Niczego w tym API nie da się wznowić: zerwana [[eth-subscribe|subskrypcja]] gubi to, co przyszło w międzyczasie, a [[eth-get-logs|eth_getLogs]] nigdy nie zgłasza, że zwrócony wcześniej log został wycofany. Firehose odwraca ten model. Przechwytuje wszystko raz, gdy węzeł wykonuje blok, i udostępnia wynik jako uporządkowany strumień, w którym pozycję wyznacza kursor.",
          "Przechwytywanie odbywa się wewnątrz klienta. StreamingFast utrzymuje załatane buildy [[geth|Geth]] i łańcuchów opartych na Geth oraz forki [[reth|Reth]], które w trakcie przetwarzania bloków uruchamiają tracer Firehose. Build Geth uruchamia się z `--vmtrace=firehose`; wypisuje wtedy na standardowe wyjście linię `FIRE INIT`, a potem po jednej linii `FIRE BLOCK` na każdy blok. Opiera się to na hookach live tracingu dodanych w Geth v1.14 – `OnBlockStart`, `OnTxStart`, `OnEnter`, `OnBalanceChange` i pozostałych – dzięki którym tracer wkompilowany w binarkę obserwuje wykonanie, gdy węzeł się synchronizuje. Geth z upstreamu ma te hooki, ale nie ma tracera Firehose, więc standardowa binarka nie zasili Firehose; zobacz [[client-extensions|rozszerzenia klientów]]."
        ]
      },
      {
        heading: "Komponenty i pliki",
        paragraphs: [
          "Reader opakowuje zinstrumentowany węzeł, parsuje jego wyjście i zapisuje osobny plik dla każdego bloku (one-block file), zachowując każdy fork, jaki zobaczy. Merger łączy je w pliki merged blocks po 100 bloków w object storage – na dysku lokalnym, w S3, Google Cloud Storage, Azure albo w czymkolwiek zgodnym z S3 – i to te pliki są archiwum historii. Relayer rozsyła bloki na żywo z jednego albo kilku readerów. Serwer gRPC Firehose odpowiada na żądanie `Blocks`, biorąc historię z plików merged blocks, bloki blisko head łańcucha z plików one-block i bloki na żywo z relayera, a klient widzi jeden ciągły strumień.",
          "Blok Ethereum na rozszerzonym poziomie szczegółowości (extended) zawiera to, co RPC rozkłada na trzy przestrzenie nazw: nagłówek, transakcje, receipty i logi, każdą ramkę wywołania (call frame) z jej wejściem i wyjściem oraz zmiany salda, nonce, kodu, storage i gasu w każdym wywołaniu, przy czym każda zmiana salda ma przypisany powód, na przykład `REASON_GAS_BUY` albo `REASON_REWARD_TRANSACTION_FEE`. Poziom podstawowy (base) zawiera tylko to, co udostępnia standardowe JSON-RPC, i tylko tyle może zaoferować sieć bez zinstrumentowanego klienta."
        ]
      },
      {
        heading: "Kursory i kroki przy forkach",
        paragraphs: [
          "Każda odpowiedź zawiera blok, `step` i `cursor`. Domyślny strumień wysyła `STEP_NEW` dla bloku, który dołącza do łańcucha, i `STEP_UNDO` dla bloku usuniętego przez reorg, a w metadanych podaje `lib_num`, czyli ostatni nieodwracalny blok w tym momencie. Żądanie z `final_blocks_only` dostaje tylko bloki `STEP_FINAL` i nigdy undo, kosztem opóźnienia względem head o tyle, ile trwa osiągnięcie [[finality|finalności]]. Kursor jest nieprzezroczysty, ale zapisuje blok, jego gałąź i ostatni nieodwracalny blok, więc przekazanie go z powrotem wznawia strumień zaraz po ostatniej odebranej wiadomości. Bloki z forków są przechowywane, więc konsument, który rozłączył się na bloku, który potem został osierocony, po ponownym połączeniu dostaje dla niego undo.",
          "Po stronie konsumenta zostaje jedna zasada: kursor trzeba zapisywać w tej samej transakcji bazy danych co wiersze wyliczone z danego bloku, a przy undo usuwać to, co wyprodukował cofnięty blok. Indekser RPC przybliża ten model [[cursor-pagination|trwałym kursorem]] i sprawdzaniem `parentHash`, a tutaj dostarcza go sam strumień. [[graph-node|graph-node]] przyjmuje endpoint Firehose jako providera, a [[substreams|Substreams]] uruchamia swoje moduły na tych samych blokach."
        ]
      }
    ],
    example: {
      title: "Reorg tak, jak zgłasza go strumień, i wznowienie",
      note: "Undo wskazuje osierocony blok po hashu, więc konsument usuwa jego wiersze, a potem stosuje blok zastępczy na tej samej wysokości. Restart jest dokładny dlatego, że `c4` zostaje zapisany razem z tymi wierszami."
    },
    pitfalls: [
      "Oczekiwanie, że standardowa binarka Geth albo Reth zasili reader Firehose; tracer jest w buildach StreamingFast, a nie w upstreamie.",
      "Commitowanie kursora osobno od wierszy, które obejmuje, przez co po restarcie blok zostaje pominięty albo zastosowany dwa razy.",
      "Ignorowanie `STEP_UNDO` przy strumieniowaniu blisko head, przez co w bazie zostają wiersze z osieroconych bloków.",
      "Szukanie ramek wywołań albo zmian stanu w bloku na poziomie base; zawiera je tylko poziom extended."
    ]
  },
  substreams: {
    title: "Substreams",
    aliases: [
      "substreams.yaml",
      ".spkg",
      "moduł map",
      "moduł store",
      "substreams sink",
      "subgraph oparty na Substreams",
      "Substreams-powered subgraph"
    ],
    summary: "Substreams to silnik oparty na [[firehose|Firehose]], który uruchamia napisane przez użytkownika moduły w Rust, skompilowane do WebAssembly, na każdym bloku łańcucha – równolegle dla historii i jako strumień na żywo przy head – i dostarcza ich wynik, z kursorami i sygnałami undo, do sinka, takiego jak Postgres, ClickHouse albo subgraph.",
    sections: [
      {
        heading: "Moduły i pakiety",
        paragraphs: [
          "Pakiet Substreams, czyli plik `.spkg`, łączy manifest `substreams.yaml`, schematy protobuf i binarkę WASM z handlerami modułów. Moduł `map` to funkcja, która z wejść tworzy wynik w formacie protobuf – zwykle z `sf.ethereum.type.v2.Block` listę zdekodowanych transferów albo swapów. Moduł `store` przechowuje dane klucz-wartość między blokami według jednej polityki aktualizacji: `set`, `set_if_not_exists`, `add`, `min`, `max`, `append` albo `set_sum`. Moduły położone niżej w grafie czytają store w trybie get, czyli jako jego wartość w przetwarzanym bloku, albo w trybie deltas, czyli jako zmiany, które wprowadził w tym bloku. Wszystkie moduły wykonują się jako DAG raz na blok.",
          "To ograniczenia umożliwiają całą resztę. Moduł widzi tylko zadeklarowane wejścia i nie może czytać store'a, do którego pisze, więc dla tych samych bloków daje ten sam wynik. Moduł `blockIndex` dodaje tani wstępny przebieg: dla każdego bloku emituje etykiety, na przykład klucze `evt_addr:` i `evt_sig:` dla [[event-log|logów]] zawartych w bloku, a moduły niżej filtrują po nich i pomijają bloki bez dekodowania. Tę samą rolę pełni [[logs-bloom|logsBloom]] dla węzła odpowiadającego na zapytania o logi."
        ]
      },
      {
        heading: "Równoległy backfill i cache",
        paragraphs: [
          "Ponieważ wynik modułu zależy tylko od jego wejść, historię można podzielić. Serwer tnie żądany zakres na segmenty – na serwerach StreamingFast domyślnie po 25 000 bloków – i przetwarza je jednocześnie na wielu workerach. Store powstaje osobno dla każdego segmentu, a częściowe store'y są potem scalane w jeden liniowy widok, więc jego wartość w bloku N jest poprawna, choć blok N − 1 przetworzył inny worker. Wyniki trafiają do cache pod hashem modułu wyliczanym z kodu WASM, wejść, wyjść i parametrów: ponowne uruchomienie niezmienionego modułu albo dodanie nowego modułu poniżej niego strumieniuje wynik z cache, zamiast liczyć go od nowa, a zmiana kodu unieważnia ten moduł i wszystko poniżej.",
          "Najlepiej widać to w porównaniu z odpytywaniem. Backfill przez [[eth-get-logs|eth_getLogs]] ograniczają limity zakresu na endpoincie i [[rate-limits|rate limity]], a do tego widzi on tylko logi; [[the-graph|subgraph]] oparty na RPC przetwarza bloki ściśle po kolei w jednym procesie. Substreams widzi także wywołania i zmiany stanu, a skaluje się przez dodawanie workerów. Ceną jest pisanie w Rust na typach protobuf zamiast ABI i mappingu w AssemblyScript oraz zależność od providera Firehose. Równoległe wykonanie w przód działa tylko w trybie produkcyjnym; tryb deweloperski jest bliższy wykonaniu liniowemu."
        ]
      },
      {
        heading: "Sinki",
        paragraphs: [
          "Konsument strumieniuje wynik modułu z kursorem dokładnie tak jak w Firehose: wynik dla każdego bloku, sygnał undo, gdy blok zostaje osierocony, i opcja pobierania tylko bloków finalnych. Sink SQL, `substreams sink postgres` albo `substreams sink clickhouse`, stosuje zmiany w bazie danych wygenerowane przez moduł i trzyma swój kursor w tabeli w docelowej bazie. W Postgresie zapisuje każdy insert, update i delete z odwracalnej części łańcucha do tabeli `substreams_history`, żeby przy undo dało się je odwrócić w odwrotnej kolejności. ClickHouse obsługuje reorgi z opóźnieniem. W obu bazach mechanizm działa tylko wtedy, gdy każda tabela ma klucz główny. Dla porównania podejście budowane ręcznie opisuje [[indexing-database|baza danych indeksera]].",
          "Subgraph może wskazać pakiet jako swoje źródło danych, a [[graph-node|graph-node]] konsumuje wtedy moduł, który produkuje zmiany encji, zamiast uruchamiać event handlery na danych z RPC. To tak zwany subgraph oparty na Substreams (Substreams-powered subgraph) i właśnie przy nim The Graph raportuje największe skrócenie czasu synchronizacji. Podział pracy jest wtedy czysty: Substreams transformuje, sink albo graph-node przechowuje i udostępnia dane, a nic po drodze nie odpytuje [[rpc-provider|providera RPC]] o logi. Substreams zajmuje miejsce, w którym w [[etl-pipeline|pipeline ETL]] byłby etap transformacji, z wbudowaną obsługą reorgów."
        ]
      }
    ],
    example: {
      title: "Manifest z modułem map, zasilanym przez niego store'em i wyjściem do bazy danych",
      note: "`store_balances` sumuje wartości każdego klucza w kolejnych blokach, a `db_out` czyta jego delty z każdego bloku, a nie wartości. Edycja `map_transfers` zmienia hash tego modułu i unieważnia cache wszystkich trzech modułów."
    },
    pitfalls: [
      "Commitowanie wierszy sinka i kursora w osobnych transakcjach, przez co restart odtwarza wynik bloku drugi raz albo go pomija.",
      "Definiowanie tabel sinka SQL bez kluczy głównych, przez co sink nie umie cofnąć wierszy z osieroconych bloków.",
      "Mierzenie czasu backfillu w trybie deweloperskim i oczekiwanie takiego samego wyniku w produkcji; równoległe wykonanie w przód działa tylko w trybie produkcyjnym.",
      "Edytowanie modułu w przekonaniu, że jego cache przetrwa; hash modułu się zmienia, więc ten moduł i wszystko poniżej liczy się od nowa."
    ]
  },
  "log-index": {
    title: "Indeks logów",
    aliases: [
      "indeks wyszukiwania logów",
      "filtermaps",
      "filter maps",
      "bloombits",
      "--history.logs",
      "LogIndex.Enabled",
      "EIP-7745",
      "logaddrs"
    ],
    summary: "Indeks logów to struktura, którą [[execution-client|klient wykonawczy]] buduje nad adresami i topics wszystkich [[event-log|logów]], żeby metoda [[eth-get-logs|eth_getLogs]] mogła znaleźć pasujące bloki bez sprawdzania 2048-bitowego [[logs-bloom|logs bloom]] w każdym nagłówku. Każdy klient buduje własny indeks, z własnym czasem budowy i oknem retencji.",
    sections: [
      {
        heading: "Dlaczego bloom w nagłówku nie wystarcza",
        paragraphs: [
          "Protokół daje jeden filtr na blok. Odpowiedź na zapytanie o milion bloków z samych bloomów oznacza odczyt miliona [[block-header|nagłówków]], sprawdzenie każdego blooma i wczytanie receiptów każdego bloku, który może pasować. Bloki z dużym ruchem ustawiają większość z 2048 bitów, więc dla popularnych adresów i topics pasuje prawie każdy blok, a bloom niewiele oszczędza. Indeks logów odpowiada na pytanie od drugiej strony, od wartości do bloków lub transakcji, które ją zawierają, i zamienia skanowanie zakresu w pojedyncze wyszukiwanie.",
          "Nic z tego nie należy do danych konsensusu. Indeks powstaje lokalnie z receiptów, nagłówek nie zawiera do niego żadnego commitmentu, a dwaj klienci mogą indeksować inaczej i zwracać identyczne odpowiedzi. EIP-7745 proponuje, żeby w miejscu blooma nagłówek zawierał root indeksu logów zbudowanego z filter maps, czyli commitment do tego indeksu, co pozwoliłoby też serwerowi udowodnić odpowiedź na zapytanie. Ta propozycja ma jednak status Draft. [[reth|Reth]] nadal odpowiada z bloomów: czyta nagłówki w oknach po 1000, sprawdza każdy z nich i pobiera receipty kandydatów, w granicach `--rpc.max-blocks-per-filter` (domyślnie 100 000) i `--rpc.max-logs-per-response` (20 000)."
        ]
      },
      {
        heading: "Co buduje każdy klient",
        paragraphs: [
          "[[geth|Geth]] przez długi czas utrzymywał indeks bloombits, czyli bloomy nagłówków transponowane do wektorów osobnych dla każdego bitu, w sekcjach po 4096 bloków. Wersja v1.15.6 zastąpiła go filter maps, strukturą opisaną w EIP-7745, której koszt zapytania nie rośnie już wraz z gęstością logów w bloku. Indeks obejmuje ostatnie `--history.logs` bloków, domyślnie 2 350 000, czyli mniej więcej rok i około 10 GB na mainnecie; `--history.logs=0` indeksuje cały łańcuch, około 61 GB, a `--history.logs.disable` wyłącza indeks. Indekser zaczyna od head, rozszerza indeks wstecz do skonfigurowanej głębokości i usuwa stare epoki indeksu, gdy łańcuch idzie naprzód.",
          "[[erigon|Erigon]] utrzymuje indeksy odwrócone, `logaddrs` i `logtopics`, które mapują każdy emitujący adres i każdy topic na numery transakcji, w których się pojawia, a obok nich `tracesfrom` i `tracesto` dla trace'ów wywołań; w Erigonie 3 te indeksy przychodzą w plikach snapshotów, które pobiera nowy węzeł. [[nethermind|Nethermind]] dodał w wersji 1.37 opcjonalny indeks logów, włączany przez `--LogIndex.Enabled true` i budowany w tle z zapisanych receiptów. Bez niego Nethermind ogranicza liczbę bloków, które jedno żądanie może odczytać sekwencyjnie (`Receipt.MaxBlockDepth`), i odrzuca szersze żądania błędem `-32602`."
        ]
      },
      {
        heading: "Czas budowy, retencja i co widzi wywołujący",
        paragraphs: [
          "Budowa indeksu to osobne zadanie, które rusza po synchronizacji, więc węzeł, dla którego [[eth-syncing|eth_syncing]] zwraca `false`, nadal może go budować. Zapytanie o bloki, których indeks jeszcze nie obejmuje, trafia na wolną ścieżkę: Geth wykonuje wyszukiwanie bez indeksu, blok po bloku na bloomach nagłówków, co na szerokim zakresie kończy się timeoutem po stronie wywołującego albo [[rpc-provider|dostawcy RPC]]; Nethermind od razu odrzuca taki zakres. Erigon w dużej mierze tego unika, bo indeks przychodzi razem z pobraną historią. Indekser Getha wyłącza się też, gdy natrafi na brakujący receipt, więc uszkodzona baza danych objawia się wolnymi zapytaniami, a nie błędami.",
          "Ta sama wolna ścieżka dotyczy na stałe bloków starszych niż okno indeksu, które konfiguruje się niezależnie od [[receipt-retention|retencji receiptów]] i od [[history-expiry|history expiry]]: Geth z domyślnymi ustawieniami trzyma receipty z wielu lat bloków, których już nie indeksuje, a [[archive-node|węzeł archiwalny]] Getha nadal indeksuje tylko rok, chyba że `--history.logs` mówi inaczej. Wydajność zapytań o zakresy zależy więc od tego, co zaindeksował konkretny węzeł. Dwa węzły z tym samym klientem w tej samej wersji mogą odpowiedzieć na to samo szerokie zapytanie w milisekundach i w minutach, a żadna metoda RPC nie raportuje, które bloki są zaindeksowane; jedynym sposobem sprawdzenia jest sondowanie, jak przy każdej [[endpoint-capabilities|możliwości endpointu]]."
        ]
      }
    ],
    example: {
      title: "Ustawienie wyszukiwania logów w każdym kliencie wygląda inaczej",
      note: "Każda linia zmienia coś innego: okno retencji Getha, to, czy Nethermind w ogóle buduje indeks, oraz liczbę bloków, które Reth przeskanuje dla jednego żądania."
    },
    pitfalls: [
      "Kierowanie backfillu (pobierania historycznych logów) na świeżo zsynchronizowany węzeł i uznawanie wolnych lub nieudanych szerokich zapytań eth_getLogs za błąd klienta; indeks logów wciąż się buduje.",
      "Zakładanie, że opcja Getha `--history.transactions` dotyczy także wyszukiwania logów; indeks logów ma własne okno `--history.logs`.",
      "Oczekiwanie, że węzeł archiwalny indeksuje logi aż do bloku genesis; retencja stanu, receiptów i indeksu logów to osobne ustawienia.",
      "Przenoszenie jednej szerokości zakresu między klientami; Reth ogranicza liczbę bloków na filtr, Nethermind liczbę bloków czytanych bez indeksu, a Geth przechodzi na wolne wyszukiwanie bez indeksu."
    ]
  },
  "block-by-timestamp": {
    title: "Blok według timestampu",
    aliases: [
      "blok w danym czasie",
      "timestamp na numer bloku",
      "getblocknobytime",
      "erigon_getBlockByTimestamp",
      "slot na blok",
      "data na blok",
      "block by timestamp"
    ],
    summary: "Do znalezienia bloku dla konkretnego momentu w czasie nie ma standardowej metody [[json-rpc|JSON-RPC]], więc wywołujący robią wyszukiwanie binarne przez [[eth-get-block-by-number|eth_getBlockByNumber]] po polu `timestamp` nagłówka albo, na Ethereum, korzystają z arytmetyki slotów i [[beacon-api|Beacon API]]. Trzeba też wybrać, czy chodzi o ostatni blok z tego momentu lub sprzed niego, czy o pierwszy blok z tego momentu lub po nim.",
    sections: [
      {
        heading: "Wyszukiwanie, a nie odczyt",
        paragraphs: [
          "[[block-header|Nagłówek]] zawiera `timestamp`, czyli czas uniksowy w sekundach, a [[execution-apis|execution APIs]] wyszukują bloki tylko po numerze albo [[block-hash|hashu]]. Timestampy ściśle rosną od rodzica do dziecka, więc czas jest monotoniczną funkcją numeru bloku i wyszukiwanie binarne działa: za górną granicę przyjmuje się numer head, a potem dzieli przedział na pół przez `eth_getBlockByNumber(n, false)`, aż dwa sąsiednie bloki otoczą szukany czas. Dla całej historii mainnetu to około 25 kolejnych żądań, każde niewielkie, bo treść transakcji nie jest potrzebna.",
          "Odpowiedź zależy od konwencji, której pytanie zwykle nie określa. „Blok w chwili T” może oznaczać ostatni blok z `timestamp <= T`, czyli stan z chwili T, którego potrzebuje snapshot sald; albo pierwszy blok z `timestamp >= T`, czyli pierwszy blok, który mógł zawierać aktywność po T. Metoda `getblocknobytime` w Etherscanie każe wywołującemu wybrać `closest=before` albo `closest=after`; `erigon_getBlockByTimestamp` w [[erigon|Erigonie]] zwraca pierwszy blok w chwili T lub po niej, a dla T z przyszłości zwraca head. Pomyłka o jeden po cichu dołącza albo wyklucza aktywność z całego bloku."
        ]
      },
      {
        heading: "Sloty po Merge",
        paragraphs: [
          "Od [[the-merge|Merge]] mainnet ma zegar. Slot s zaczyna się w chwili `genesis_time + 12 × s`, gdzie `genesis_time` Beacon Chain wynosi 1606824023, a blok zaproponowany w slocie s ma jako timestamp dokładnie ten czas startu: blok Merge 15537394, w slocie 4700013, ma timestamp 1663224179, czyli 1606824023 + 12 × 4700013. Slot dla czasu T to więc `floor((T − genesis_time) / 12)`, bez żadnego wyszukiwania; zobacz [[slot-epoch|sloty i epoki]].",
          "Z numerem bloku jest inaczej, bo nie każdy slot ma blok. Pominięty slot (missed slot), w którym proposer był offline albo jego blok został osierocony, przesuwa czas, ale nie numer bloku, więc żadna arytmetyka nie przekłada czasu na numer, a reguła „12 sekund na blok” rozjeżdża się o jeden blok za każdy pominięty slot od punktu odniesienia. Lukę zamyka Beacon API: `GET /eth/v2/beacon/blocks/{slot}` zwraca blok z tego slotu, łącznie z `execution_payload.block_number`, albo 404, jeśli slot jest pusty; wtedy ostatni blok w chwili T lub przed nią leży we wcześniejszym slocie. Zobacz [[beacon-endpoints|endpointy Beacon API]]."
        ]
      },
      {
        heading: "Inne łańcuchy, skróty i kto od tego zależy",
        paragraphs: [
          "Arytmetyka slotów działa tylko na mainnecie. Na [[l2-rpc|L2]] czasy bloków ustala [[sequencer|sekwencer]], na łańcuchach OP Stack domyślnie co dwie sekundy, a na Arbitrum kolejne bloki mogą mieć ten sam timestamp, więc „blok w chwili T” to zakres i konwencja musi mówić, o który jego koniec chodzi. Przed Merge i na łańcuchach bez harmonogramu slotów niezawodne jest tylko wyszukiwanie binarne. Skróty istnieją, ale nie są przenośne: endpointy eksploratorów i metody specyficzne dla klientów mają własne konwencje, klucze i rate limity, a [[indexer|indekser]], którego tabela bloków ma indeks na timestampie, odpowiada jednym zapytaniem; zobacz [[indexing-database|bazę danych indeksera]].",
          "Na tym odwzorowaniu opiera się kilka rodzajów produktów. [[governance-voting-power|Snapshoty w governance]] biorą siłę głosu z bloku tuż przed otwarciem propozycji; płatności strumieniowe i [[erc-4626|naliczanie odsetek]] przeliczają sekundy między dwoma timestampami na zakres bloków; [[airdrop-rewards|uprawnienia do nagród i terminy airdropów]] rozstrzygają, kto się kwalifikuje, według bloku z chwili terminu. Każdy z tych wyników się zmienia, jeśli wybrany blok przesunie się o jeden, więc konwencja powinna być zapisana w specyfikacji produktu, a ustalony numer bloku warto przechowywać razem z wynikiem, zamiast liczyć go później od nowa."
        ]
      }
    ],
    example: {
      title: "Ostatni blok w danym czasie uniksowym lub przed nim, metodą bisekcji",
      note: "Blok genesis mainnetu ma timestamp 0, więc blok 0 zawsze jest poprawną dolną granicą; na innym łańcuchu przed zaufaniem wynikowi trzeba sprawdzić dolną granicę."
    },
    pitfalls: [
      "Używanie pierwszego bloku w chwili T lub po niej, gdy pytanie dotyczy stanu z chwili T, co wlicza jeden blok aktywności z okresu po terminie odcięcia.",
      "Przeliczanie upływu czasu na numer bloku po 12 sekund na blok, co rozjeżdża się o każdy pominięty slot od punktu odniesienia.",
      "Stosowanie arytmetyki slotów z mainnetu na L2, gdzie czasy bloków są inne, a kilka bloków może mieć ten sam timestamp.",
      "Poleganie na endpoincie timestampów z eksploratora w automatycznych procesach; jego konwencja, klucze i dostępność nie należą do żadnej specyfikacji."
    ]
  },
  otterscan: {
    title: "Otterscan",
    aliases: [
      "przestrzeń nazw ots_",
      "ots_ namespace",
      "ots_searchTransactionsBefore",
      "ots_getApiLevel",
      "lokalny eksplorator bloków",
      "local block explorer",
      "Otterscan API",
      "ots2"
    ],
    summary: "Otterscan to open source'owy [[block-explorer|eksplorator bloków]], który działa jako statyczna aplikacja webowa w przeglądarce użytkownika i czyta [[json-rpc|JSON-RPC]] węzła bezpośrednio, korzystając z [[namespaces|przestrzeni nazw]] `ots_` zaimplementowanej przez węzeł, więc nie potrzebuje osobnego [[indexer|indeksera]] ani bazy danych.",
    sections: [
      {
        heading: "Eksplorator bez indeksera",
        paragraphs: [
          "Etherscan i Blockscout kopiują łańcuch do własnych baz danych. Otterscan tego nie robi: to aplikacja React serwowana jako pliki statyczne, a każda strona to kilka wywołań RPC wysyłanych z przeglądarki użytkownika do skonfigurowanego węzła – domyślnie `http://127.0.0.1:8545`, co w obrazie Dockera można zmienić przez `ERIGON_URL`. Węzeł musi więc być osiągalny z przeglądarki każdego użytkownika i odpowiadać na zapytania preflight [[cors|CORS]], co w Erigonie ustawia `--http.corsdomain`. Opcjonalne elementy to URL [[beacon-api|Beacon API]] dla stron konsensusu oraz serwer zasobów z ikonami tokenów i danymi 4bytes z ethereum-lists, których Otterscan używa do nazywania selektorów; zweryfikowane źródła pochodzą z Sourcify.",
          "Jest to możliwe dzięki temu, że indeksowanie odbywa się w samym węźle. Standardowe JSON-RPC nie ma [[address-history|historii adresów]], więc najtrudniejsza strona eksploratora, czyli każda transakcja dotykająca danego adresu, wymagałaby inaczej osobnego indeksera. Autorzy Otterscana dodali do [[erigon|Erigona]] metody, które odpowiadają z własnych indeksów historii Erigona, i Erigon pozostaje implementacją referencyjną: udokumentowana konfiguracja to `--http.api eth,erigon,trace,ots`, gdzie `trace` służy do diffów stanu, a `erigon_getHeaderByNumber` jest wywoływane poza przestrzenią nazw `ots_`."
        ]
      },
      {
        heading: "Metody ots_",
        paragraphs: [
          "`ots_getApiLevel` zwraca liczbę całkowitą, którą Otterscan sprawdza przy połączeniu; obecne wersje oczekują 8. `ots_searchTransactionsBefore` i `ots_searchTransactionsAfter` stronicują historię adresu, czyli transakcje przychodzące, wychodzące i wewnętrzne, a więc każdą transakcję, której drzewo wywołań wysyła ether na ten adres albo go wywołuje. Przyjmują adres, numer bloku (0 oznacza najnowszy albo genesis) i rozmiar strony, a zwracają `txs`, `receipts`, `firstPage` i `lastPage`. Strona może przekroczyć żądany rozmiar, bo wyniki są cięte tylko na granicach bloków.",
          "`ots_getInternalOperations` wylicza [[internal-transaction|wewnętrzne]] transfery, utworzenia kontraktów i self-destructy; `ots_traceTransaction` zwraca zwarte drzewo wywołań; `ots_getTransactionError` zwraca surowe bajty revertu do dekodowania według [[abi|ABI]]; `ots_getContractCreator` zwraca transakcję tworzącą i bezpośredniego twórcę; `ots_getTransactionBySenderAndNonce` znajduje hash na podstawie nadawcy i [[nonce|nonce]]; a `ots_getBlockDetails`, `ots_getBlockTransactions` i `ots_hasCode` to odchudzone wersje standardowych wywołań.",
          "Implementacje różnią się tam, gdzie to ma znaczenie. Erigon serwuje całą przestrzeń nazw, a wyszukiwania opiera na swoich indeksach `tracesfrom` i `tracesto`. [[reth|Reth]] rejestruje każdą metodę i zgłasza poziom 8, ale jego dwie metody wyszukiwania zwracają `-32603` `unimplemented`, więc historia adresów z nim nie działa. Anvil z Foundry implementuje wszystkie metody na potrzeby [[local-devnet|lokalnego devnetu]], a jego wyszukiwania skanują tylko bloki, które sam wyprodukował. [[geth|Geth]] i [[nethermind|Nethermind]] nie implementują żadnej. Poziom API to deklaracja, a nie gwarancja; zobacz [[client-namespaces|przestrzenie nazw specyficzne dla klientów]]."
        ]
      },
      {
        heading: "Gdzie się sprawdza",
        paragraphs: [
          "Otterscan pasuje operatorowi, który już utrzymuje archiwalnego Erigona: daje prywatny eksplorator, przy którym nikt trzeci nie widzi zapytań i nie trzeba niczego dodatkowo synchronizować, a przy devnetach szybko się go stawia. Koszt przenosi się na węzeł. Wyszukiwania dla bardzo aktywnych adresów, trace'y i ustalanie twórców kontraktów obciążają CPU węzła, a wystawienie węzła dla przeglądarek oznacza wystawienie `ots_` i `trace_` każdemu, kto może załadować stronę, chyba że ogranicza je [[reverse-proxy|reverse proxy]]; zobacz [[security|bezpieczeństwo RPC]]. Otterscan robi też mniej niż hostowany eksplorator: nie ma tabel posiadaczy, etykiet ani analityki, a eksperymentalna przestrzeń nazw `ots2` dla dodatkowych indekserów wymagała specjalnej gałęzi Erigon 2 i jest oznaczona jako przestarzała (deprecated), dopóki nie pojawi się wsparcie w Erigon 3."
        ]
      }
    ],
    pitfalls: [
      "Podpinanie Otterscana pod węzeł Reth w oczekiwaniu na historię adresów; metody wyszukiwania `ots_` w Reth zwracają `unimplemented`.",
      "Ustawienie URL-a węzła na `127.0.0.1` dla zdalnych użytkowników; wywołania RPC wykonuje przeglądarka użytkownika, a nie serwer, który hostuje Otterscan.",
      "Pominięcie `--http.corsdomain`, przez co aplikacja się ładuje, ale przeglądarka blokuje każde jej wywołanie RPC.",
      "Traktowanie `ots_getApiLevel` jako dowodu pełnego wsparcia; węzeł może zgłaszać poziom 8, a mimo to nie implementować części metod.",
      "Wystawienie do internetu węzła archiwalnego z włączonymi `ots` i `trace`, żeby mógł z niego korzystać publiczny Otterscan."
    ]
  },
  "signature-directory": {
    title: "Katalogi sygnatur",
    aliases: [
      "signature directory",
      "katalog selektorów",
      "4byte",
      "4byte.directory",
      "wyszukiwanie selektora",
      "selector lookup",
      "kolizja selektorów",
      "selector collision",
      "openchain signatures",
      "Sourcify signature database",
      "wyszukiwanie topic0"
    ],
    summary: "Katalog sygnatur to publiczna baza danych, która mapuje czterobajtowe selektory funkcji i błędów oraz 32-bajtowe topics eventów z powrotem na czytelne sygnatury, z których powstały ich hashe. Eksploratory i narzędzia korzystają z niej do dekodowania calldata i logów, gdy nie ma zweryfikowanego [[abi|ABI]].",
    sections: [
      {
        heading: "Czego się szuka",
        paragraphs: [
          "Selektor funkcji to pierwsze cztery bajty hasha [[keccak-256|keccak-256]] z kanonicznej sygnatury – `transfer(address,uint256)` daje `0xa9059cbb` – a custom errory używają tej samej konstrukcji. `topic0` eventu zachowuje wszystkie 32 bajty: `Transfer(address,address,uint256)` daje `0xddf252ad…b3ef`; zobacz [[event-signature|sygnatury eventów]]. Hash jest jednokierunkowy, więc jedyny sposób, żeby z bajtów wrócić do nazwy, to znać ten ciąg wcześniej. Katalog zbiera ciągi ze zweryfikowanych źródeł, wyjścia kompilatora, zgłoszeń użytkowników i zgadywania metodą brute force, przechowuje ich hashe i odpowiada na zapytania.",
          "W powszechnym użyciu są trzy. 4byte.directory, oryginalny katalog, ma REST API pod `/api/v1/signatures/` i `/api/v1/event-signatures/` z parametrem `hex_signature` i około 1,5 miliona sygnatur funkcji. Baza openchain.xyz, którą Sourcify przejął razem z domeną, działa teraz jako baza sygnatur Sourcify pod `api.4byte.sourcify.dev`; zasilono ją danymi z openchain, 4byte.directory i zweryfikowanych kontraktów Sourcify, a sygnatury każdego nowo zweryfikowanego kontraktu dodaje automatycznie. Repozytorium 4bytes z ethereum-lists to statyczny zrzut, który narzędzia dołączają do pracy offline. Etherface, kiedyś czwarty, nie jest już dostępny."
        ]
      },
      {
        heading: "Kolizje i niejednoznaczne dekodowanie",
        paragraphs: [
          "Cztery bajty to 2 do potęgi 32 wartości, a przy milionach znanych sygnatur kolizje są pewne: w 2025 roku Sourcify naliczył w swojej bazie około 2800 selektorów z więcej niż jedną sygnaturą. Wiele z nich wyprodukowano celowo. 4byte.directory podaje sześć sygnatur dla `0xa9059cbb`, wśród nich `many_msg_babbage(bytes1)` i `workMyDirefulOwner(uint256,uint256)`, czyli ciągi dobrane metodą brute force tak, żeby miały najpopularniejszy selektor, jaki w ogóle istnieje. Ranking kandydatów według wieku albo popularności to heurystyka, a API Sourcify potrafi odfiltrować wpisy, które rozpoznało jako spam.",
          "Dekoder może sprawdzić, czy calldata da się sparsować według typów parametrów kandydata, co eliminuje część z nich, ale nie niezawodnie: `transfer(address,uint256)` i `workMyDirefulOwner(uint256,uint256)` przyjmują te same 68 bajtów. Eventy są bezpieczniejsze, bo kolizja 32 bajtów nie jest praktycznie osiągalna, ale wpis w katalogu nie zawiera znaczników `indexed`, więc podział między topics a `data` trzeba wywnioskować z liczby topics. Tylko to odróżnia też event `Transfer` z ERC-20 od jego odpowiednika z ERC-721, bo oba mają ten sam topic0; zobacz [[token-standards|standardy tokenów]]."
        ]
      },
      {
        heading: "Jak decydują eksploratory",
        paragraphs: [
          "[[block-explorer|Eksplorator bloków]] najpierw używa zweryfikowanego ABI wywoływanego kontraktu – z weryfikacji w Etherscanie albo Sourcify, która ponownie kompiluje źródło i porównuje bytecode – bo to własny interfejs kontraktu, który dokładnie nazywa funkcję. Za [[proxy-contract|proxy]] oznacza to ABI implementacji, a nie proxy. Jeśli takiego ABI nie ma, sięga po katalogi: usługa sig-provider w Blockscoucie odpytuje 4byte.directory, openchain i własną bazę bytecode'u, [[otterscan|Otterscan]] dołącza dane z ethereum-lists, a `4byteTracer` z Getha zbiera selektory widziane podczas trace'a jako dane wejściowe właśnie do takiego wyszukiwania; zobacz [[debug-api|przestrzeń nazw debug_]].",
          "Niezależnie od źródła selektor znaczy tylko to, co mówi o nim dispatcher kontraktu, a kontrakt z funkcją fallback wykonuje kod dla dowolnych czterech bajtów. Bezpieczna prezentacja traktuje dekodowanie z katalogu jak domysł, pokazuje obok surowy selektor i przełącza się na zweryfikowane ABI, gdy tylko ono istnieje. Ma to największe znaczenie tam, gdzie człowiek zatwierdza wywołanie, na przykład na ekranie podpisu w portfelu, bo nazwa z katalogu dla niezweryfikowanego kontraktu to etykieta, którą mógł zgłosić każdy."
        ]
      }
    ],
    example: {
      title: "Jeden selektor, wiele nazw; jeden topic, jedna nazwa",
      note: "Prawdziwy `transfer` to najstarszy wpis i w domyślnej kolejności pojawia się na końcu; nic w odpowiedzi nie mówi, którą sygnaturę implementuje kontrakt stojący za danym wywołaniem."
    },
    pitfalls: [
      "Pokazywanie najnowszego albo najpopularniejszego dopasowania z katalogu jako nazwy funkcji, gdy przez kolizje ten sam selektor ma kilka sygnatur.",
      "Hashowanie sygnatury z nazwami parametrów albo z `uint` i wniosek, że katalog jej nie zna; wyszukuje się po formie kanonicznej.",
      "Dekodowanie calldata proxy za pomocą zweryfikowanego ABI samego proxy zamiast ABI implementacji.",
      "Zakładanie, że dekodowanie eventu z katalogu wie, które parametry są indeksowane; wpis to tylko ciąg z sygnaturą.",
      "Traktowanie dopasowania selektora jako dowodu, jaki kod się wykonał; decyduje o tym dispatcher kontraktu."
    ]
  },
  "exchange-deposits": {
    title: "Depozyty i wypłaty na giełdzie",
    aliases: [
      "adres depozytowy",
      "deposit address",
      "sweep depozytów",
      "hot wallet",
      "forwarder CREATE2",
      "księgowanie depozytów",
      "batch wypłat",
      "pipeline custody"
    ],
    summary: "Pipeline depozytów i wypłat to system, który giełda scentralizowana albo custodian (firma przechowująca środki klientów) prowadzi na każdym obsługiwanym łańcuchu: daje każdemu klientowi własny [[address|adres]] depozytowy, księguje to, co na niego wpłynie, dokładnie raz i dopiero wtedy, gdy nie da się już tego cofnąć, przenosi środki (sweep) do portfeli zbiorczych, a wypłaty realizuje z hot walleta, który jest stale online.",
    sections: [
      {
        heading: "Jeden adres na klienta, potem sweep",
        paragraphs: [
          "Przelew w Ethereum nie ma pola na tytuł ani numer referencyjny, więc giełda daje każdemu klientowi osobny adres. Najprostsze rozwiązanie wyprowadza z klucza głównego (master key) jedno [[account|konto]] kontrolowane kluczem, czyli konto EOA (externally owned account), na każdego klienta, po ścieżce takiej jak `m/44'/60'/0'/0/4471` dla klienta 4471, a później robi na nim sweep, czyli przenosi saldo do portfela zbiorczego. Sweep etheru to jedna transakcja, a [[gas|gas]] płaci się z samego depozytu. Token wymaga dwóch transakcji, bo adres najpierw potrzebuje etheru na gas, i za każdym razem trochę tego etheru zostaje na adresie na stałe.",
          "Drugie rozwiązanie rozdaje adresy kontraktów, a każdy kontrakt wdraża dopiero przy pierwszym sweepie: instrukcja `CREATE2` ustala adres z góry na podstawie wdrażającego kontraktu factory, wartości salt i kodu. W open source'owym `ForwarderV4` od BitGo funkcja `receive`, która uruchamia się, gdy przychodzi ether, wywołuje `flush`, a ta przekazuje całe saldo na `parentAddress` i emituje `ForwarderDeposited`; tokeny czekają na `flushTokens(tokenContractAddress)`. Saldo wdrożonego forwardera nigdy więc nie pokazuje depozytu, a ponieważ każdy depozyt etheru uruchamia kod, nadawcy, który używa stałego limitu 21 000 gasu jak przy zwykłym przelewie, kończy się gas (out of gas)."
        ]
      },
      {
        heading: "Jak wykryć, co wpłynęło",
        paragraphs: [
          "Każdy blok sprawdza się na trzy sposoby. Depozyt tokenu to [[event-log|log]] `Transfer` wyemitowany przez kontrakt tokenu, w którym `topics[2]`, czyli odbiorca, jest adresem depozytowym; zwraca go [[eth-get-block-receipts|eth_getBlockReceipts]] albo [[eth-get-logs|eth_getLogs]]. Ether od konta EOA to [[transaction|transakcja]] najwyższego poziomu na ten adres, której [[transaction-receipt|receipt]] ma `status` `0x1`. Ether od kontraktu, na przykład od multisiga Safe, to [[internal-transaction|transfer wewnętrzny]], którego nie wymienia żadna transakcja ani log. Pokazuje go tylko [[execution-trace|trace wykonania]], czyli odtworzenie przez węzeł każdego wywołania, dostępne przez [[trace-api|trace_block]] albo [[debug-api|debug_traceBlockByNumber]].",
          "Znane incydenty biorą się z księgowania na podstawie niewłaściwego dowodu. Każdy kontrakt może wyemitować `Transfer` z adresem depozytowym i zwracać `USDT` z `symbol()`, więc liczą się tylko logi, których `address` to kontrakt tokenu z listy obsługiwanych. ERC-20 pozwala, żeby nieudany `transfer` zwrócił `false`, zamiast zrobić [[revert|revert]], więc dekodowanie `transfer(to, amount)` z danych wejściowych transakcji i sprawdzanie tylko pola `status` w receipcie może zaksięgować tokeny, które nigdy się nie przemieściły. W 2024 roku firma Hexagate, zajmująca się bezpieczeństwem, opisała próby ataków na kilka giełd z użyciem kontraktu, którego transakcja kończy się sukcesem, choć wewnętrzne wywołanie wysyłające depozyt robi revert i zostaje przechwycone. W trace ramka, która płaci na adres depozytowy, nie ma błędu; błąd widać tylko u jej rodzica."
        ]
      },
      {
        heading: "Kiedy księgować i jak to cofnąć",
        paragraphs: [
          "Wykrycie i zaksięgowanie to osobne kroki, bo najnowsze bloki wciąż mogą zostać zastąpione w [[reorg|reorgu]]. Depozyt ma status pending, gdy tylko pojawi się w najnowszym bloku (head), a do wydania jest dostępny po wybranej liczbie [[confirmations|potwierdzeń]], czyli bloków zbudowanych na nim, albo gdy jego blok jest na wysokości bloku oznaczonego [[block-tag|tagiem]] `finalized` lub niżej. Protokół traktuje taki blok jako [[finality|nieodwracalny]]; na mainnecie blok osiąga ten poziom po około 13 do 19 minutach. Rollupy potrzebują własnych progów, bo ich bloki tworzy jeden [[sequencer|sekwencer]]; zobacz [[l2-rpc|różnice RPC na L2]].",
          "Każde wykrycie zapisuje się pod kluczem złożonym z `blockHash`, `transactionHash` i `logIndex` albo pozycji w trace, a nigdy z numeru bloku, więc każdy wiersz należy do dokładnie jednej gałęzi. Każdy blok wskazuje rodzica w `parentHash`; nowy blok, którego rodzic nie zgadza się z zapisanym hashem bloku poniżej, sygnalizuje reorg, jak w każdym [[indexer|indekserze]]. Usuwa się tylko wiersze pending zastąpionego bloku, a transakcję, często ponownie włączoną do bloku jeden lub dwa bloki później, wykrywa się jeszcze raz pod hashem nowego bloku; przed podwójnym zaksięgowaniem chroni to, że każdy ocalały wiersz księguje się tylko raz, gdy jego blok osiągnie wybraną głębokość. Zaksięgowania przyznanego przed osiągnięciem wybranej głębokości nie da się w ten sposób cofnąć, bo klient mógł już te środki wypłacić; brakująca kwota staje się długiem."
        ]
      },
      {
        heading: "Wypłaty z hot walleta",
        paragraphs: [
          "Wypłaty wychodzą z hot walleta, czyli konta, którego klucz do podpisywania jest stale online. Jego transakcje mają kolejne [[nonce|nonce]], a nonce 813 nie może trafić do bloku przed 812, więc jedna wypłata, której `maxFeePerGas` jest niższy niż [[eip-1559|base fee]] bloku, wstrzymuje wszystkie kolejne. Licznikiem zarządza jeden proces podpisujący: uzgadnia go z [[eth-get-transaction-count|eth_getTransactionCount]] dla `latest`, zastępuje zablokowaną transakcję, podpisując jej nonce ponownie z podniesionymi oboma polami opłat (w mempoolu Getha o co najmniej 10%), i zapisuje rekordy pod kluczem złożonym z nadawcy i nonce, bo każda transakcja zastępująca ma nowy hash; zobacz [[transaction-relayer|relayery transakcji]].",
          "Połączenie wypłat w batch, czyli jedno wywołanie kontraktu wypłat, sprawia, że bazowy koszt transakcji, 21 000 gasu, płaci się raz, a nie za każdego odbiorcę. Jeden odbiorca, który nie może przyjąć środków, na przykład adres zamrożony przez emitenta USDC, powoduje jednak revert całego batcha, chyba że każdy błąd zostanie przechwycony. Adres konta EOA działa na każdym łańcuchu, a adres kontraktu tylko tam, gdzie kontrakt wdrożono: w 2022 roku Optimism Foundation wysłała na Optimism 20 milionów OP na adres multisiga Wintermute, który istniał tylko na Ethereum, a atakujący jako pierwszy wdrożył tam kontrakt."
        ]
      }
    ],
    example: {
      title: "Jeden wewnętrzny depozyt etheru: od wykrycia, przez reorg, do sweepu",
      note: "Depozyt istnieje tylko w trace, na pozycji `[0,0]` wewnątrz `DELEGATECALL` Safe'a; reorg zostaje wychwycony dzięki `parentHash`, zanim cokolwiek zostanie zaksięgowane, a zaksięgowanie czeka na `finalized` przy tym samym `blockHash`, pod którym wykryto depozyt."
    },
    pitfalls: [
      "Księgowanie każdego logu `Transfer`, który wskazuje adres depozytowy, także logów z tokenów podszywających się pod prawdziwe.",
      "Sprawdzanie tylko własnego pola `error` ramki w trace, przez co księguje się ether wysłany przez wewnętrzne wywołanie, którego rodzic zrobił revert.",
      "Szukanie depozytów w saldach wdrożonych forwarderów, choć przekazują one ether dalej w tym samym wywołaniu.",
      "Wysyłanie wypłat ze stałym limitem 21 000 gasu, przez co przy każdym portfelu będącym kontraktem transakcji kończy się gas."
    ]
  },
  "stablecoin-payments": {
    title: "Płatności w stablecoinach",
    aliases: [
      "płatności stablecoinami",
      "płatności USDC",
      "płatności USDT",
      "linki płatności krypto",
      "kanały płatności",
      "blacklista stablecoinów",
      "czarna lista USDC",
      "uzgadnianie płatności"
    ],
    summary: "Obsługa płatności w stablecoinach to usługa, dzięki której sprzedawca albo platforma przyjmuje i wysyła tokeny powiązane z dolarem, takie jak USDC i USDT: przydziela adres dla każdej płatności albo każdego klienta, śledzi [[event-log|logi]] `Transfer` [[token-standards|tokenów]], aż staną się ostateczne, dopasowuje każdy z nich do faktury i realizuje wypłaty z portfeli, które kontroluje.",
    sections: [
      {
        heading: "Adres na każdą fakturę",
        paragraphs: [
          "Stablecoin to kontrakt [[token-standards|tokenu]], którego emitent dba o to, żeby token był wart jednego dolara amerykańskiego. Przelew zapisuje nadawcę, odbiorcę i kwotę, ale nic, co mówiłoby, którą fakturę opłaca, więc operatorzy płatności (payment processors) robią z adresu numer referencyjny. Linki płatności BVNK tworzą nowy adres dla każdej płatności: w przykładzie z dokumentacji `POST /api/v1/pay/summary` prosi o 10 USD zapłacone w USDT w ciągu 30 minut i zwraca adres oraz link [[eip|EIP-681]], który portfel otwiera jako gotowy `transfer` USDT, `ethereum:0xdac17f958d2ee523a2206206994597c13d831ec7/transfer?address=0x7b68…00e3&uint256=10008422`. Kwoty to liczby całkowite w najmniejszej jednostce, a USDT i USDC mają sześć miejsc po przecinku, więc `10008422` to 10,008422 USDT.",
          "Statusy BVNK łączą zdarzenia na łańcuchu z zegarem: `PENDING`, dopóki nie pojawi się transakcja, `PROCESSING`, gdy zbiera [[confirmations|potwierdzenia]], a potem `COMPLETE`, `UNDERPAID` albo `EXPIRED`. Niedopłata to nic nadzwyczajnego: BVNK jako typową przyczynę podaje opłaty pobrane przez giełdę, z której wysłano środki, więc żądane 10,008422 USDT może dotrzeć jako 9,008422. Płatności po terminie albo w niewłaściwym tokenie i tak trafiają na adres kontrolowany przez operatora, ale zauważy je tylko proces, który ich wypatruje. Kanały (channels) BVNK dają natomiast każdemu klientowi jeden stały adres do wszystkich doładowań."
        ]
      },
      {
        heading: "Śledzenie przelewów, aż zaczną się liczyć",
        paragraphs: [
          "Śledzenie to skanowanie logów. Na Ethereum USDC to `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`, a USDT to `0xdAC17F958D2ee523a2206206994597C13D831ec7`. Płatność to log `Transfer` z jednego z tych kontraktów, w którym `topics[2]`, czyli odbiorca, to adres otwartej faktury, dopełniony zerami z lewej do 32 bajtów. Kilka faktur mieści się w jednym filtrze [[eth-get-logs|eth_getLogs]] jako tablica OR; dziesiątki tysięcy już nie, więc duzi operatorzy czytają w każdym bloku każdy `Transfer` danego tokenu i dopasowują odbiorców w pamięci. Kluczowe jest sprawdzenie pola `address` logu, bo token-podróbka może wyemitować log poza tym identyczny.",
          "To, kiedy płatność się liczy, jest polityką ustalaną osobno dla każdego łańcucha, bo niedawne bloki wciąż mogą zostać zastąpione w [[reorg|reorgu]]. Circle Mint księguje depozyty na Ethereum po 12 blokach, czyli po około trzech minutach. Rollup publikuje swoje bloki na Ethereum w batchach, więc dla Base i OP Mainnet Circle liczy 12 bloków Ethereum po batchu, a dla Linei, która publikuje batche tylko co 6 do 32 godzin, 65 bloków Ethereum po batchu, przez co depozyt na Linei zaczyna się liczyć dopiero po kilku godzinach. CCTP od Circle, który przenosi USDC między łańcuchami, spalając je na jednym i mintując na drugim, czeka na [[finality|finalność]] Ethereum, czyli 15 do 19 minut, zanim poświadczy spalenie: spalenie usunięte przez reorg już po mincie zostawiłoby dolary na obu łańcuchach."
        ]
      },
      {
        heading: "Płatności bez gasu i blokady emitentów",
        paragraphs: [
          "Wielu płacących ma stablecoiny, ale nie ma etheru na [[gas|gas]]. Przy [[eip-3009|EIP-3009]] w USDC płacący tylko podpisuje wiadomość `transferWithAuthorization` (typed data [[eip-712|EIP-712]]), a operator wysyła ją i płaci za gas. W polu `from` transakcji jest wtedy operator, a płacący pojawia się tylko w `topics[1]` logu `Transfer` i w `AuthorizationUsed`, więc dopasowywanie po nadawcy przypisuje operatorowi każdą płatność bez gasu; facilitatorzy [[x402|x402]] wysyłają płatności w ten sam sposób. Kontrakt USDT na Ethereum z 2017 roku nie przyjmuje żadnego podpisanego transferu ani podpisanej zgody (approval), więc płacący w USDT potrzebują etheru albo sponsora, na przykład [[paymaster|paymastera]].",
          "Emitenci mogą zamrażać adresy, a dwaj najwięksi robią to inaczej. W USDC blacklister (rola zarządzająca czarną listą) wywołuje `blacklist(address)`, co emituje `Blacklisted(address indexed _account)` i sprawia, że zarówno wysyłanie, jak i odbieranie kończy się revertem z komunikatem `Blacklistable: account is blacklisted`. W USDT `addBlackList(address)` emituje `AddedBlackList(address _user)`, w którym adres nie jest indeksowany, więc nie da się po nim filtrować, i blokuje tylko wysyłanie; `destroyBlackFunds` może później wyzerować saldo i zmniejszyć podaż bez żadnego `Transfer`. Przed wypłatą operatorzy sprawdzają odbiorców przez [[eth-call|eth_call]] do `isBlacklisted` w USDC albo `isBlackListed` w USDT."
        ]
      },
      {
        heading: "Wypłaty i uzgadnianie sald",
        paragraphs: [
          "Wypłaty to transfery tokenów z hot walleta, czyli konta, którego klucz jest stale online, prowadzone z taką samą dyscypliną nonce jak w każdym [[transaction-relayer|relayerze transakcji]]; zobacz [[exchange-deposits|depozyty i wypłaty na giełdzie]]. `transfer` w USDT nic nie zwraca, więc kontrakt, który wywołuje go przez interfejs oczekujący `bool`, robi revert przy dekodowaniu pustych danych zwrotnych. Dlatego kontrakty wypłat używają wrappera, takiego jak `SafeERC20` z OpenZeppelin.",
          "Uzgadnianie (reconciliation) porównuje płatności zaksięgowane na adresie, pomniejszone o to, co z niego wyprowadzono, z jego `balanceOf` odczytanym w tym samym bloku. USDT psuje skrót polegający na sumowaniu logów: poza `destroyBlackFunds` także `issue` i `redeem` właściciela zmieniają podaż eventami `Issue` i `Redeem` zamiast eventów `Transfer` od adresu zerowego albo do niego, które ERC-20 jedynie zaleca. Źródłem prawdy jest wywołanie kontraktu, a suma logów służy tylko za wyjaśnienie; zobacz [[accounting-reconciliation|uzgadnianie sald]]."
        ]
      }
    ],
    example: {
      title: "Faktura w USDT: od wyceny do niedopłaty",
      note: "Pole `address` logu dowodzi, że to prawdziwy USDT, a `topics[2]` wiąże go z fakturą; brakujący 1 USDT to najpewniej opłata potrącona przez giełdę, z której zapłacono, a nic na łańcuchu nie oznacza tej kwoty jako opłaty."
    },
    pitfalls: [
      "Używanie jednego adresu depozytowego dla kilku klientów albo faktur, przez co nie da się ustalić, czyj przelew dotarł.",
      "Dopasowywanie płatności po polu `from` transakcji, w którym przy każdej płatności EIP-3009 jest relayer albo operator.",
      "Przenoszenie liczby potwierdzeń z Ethereum na rollup, gdzie depozyt jest rozliczony tylko w takim stopniu jak batch, który przenosi go na L1.",
      "Wywoływanie `transfer` z USDT z poziomu kontraktu przez interfejs zwracający `bool`, co kończy się revertem na pustych danych zwrotnych tokenu."
    ]
  },
  "accounting-reconciliation": {
    title: "Uzgadnianie sald",
    aliases: [
      "uzgadnianie sald",
      "balance reconciliation",
      "dowód kompletności",
      "sprawdzenie salda",
      "saldo na koniec okresu",
      "księgowanie tokenów z rebasingiem",
      "uzgadnianie rejestru",
      "księgowość krypto"
    ],
    summary: "Uzgadnianie sald (reconciliation) odtwarza saldo [[account|konta]] z zapisanej historii i porównuje wynik z [[eth-get-balance|eth_getBalance]] albo z `balanceOf` tokenu w tym samym bloku. W ten sposób systemy księgowe, podatkowe i audytowe pokazują, że ich historia transakcji jest kompletna.",
    sections: [
      {
        heading: "Sprawdzenie i blok, w którym się je robi",
        paragraphs: [
          "Narzędzia księgowe, podatkowe i audytowe prowadzą rejestr (ledger) każdego ruchu środków na adres i z adresu i muszą wykazać, że niczego w nim nie brakuje. Sprawdzenie to arytmetyka: saldo otwarcia w bloku A plus wszystkie uznania (wpływy) i minus wszystkie obciążenia (wypływy) po bloku A aż do bloku B włącznie musi być równe saldu, które węzeł podaje dla bloku B. Jeśli ta równość zachodzi na koniec każdego okresu, historia jest kompletna, o ile jakieś błędy nie znoszą się nawzajem; jeśli nie, różnica jest równa wielkości tego, czego brakuje. Cryptio robi to sprawdzenie dla każdego portfela; przewodnik Etherscanu po podatkach i księgowości buduje rejestr z udostępnianych przez Etherscan list transakcji, transferów wewnętrznych i transferów tokenów: `txlist`, `txlistinternal` i `tokentx`.",
          "Obie strony muszą wskazywać jeden blok, po numerze albo hashu, nigdy `latest`, czyli najnowszy blok, który może się zmienić między dwoma odczytami. Koniec okresu to czas zegarowy, więc pierwszym krokiem jest [[block-by-timestamp|zamiana daty na blok]]: dla końca roku 2024 to ostatni blok z timestampem nie późniejszym niż `1735689600` (czas Unix), czyli 1 stycznia 2025, 00:00:00 UTC. Etherscan zwraca go przez `getblocknobytime` z `closest=before`."
        ]
      },
      {
        heading: "Wszystkie obciążenia i uznania, nie tylko przelewy",
        paragraphs: [
          "Obciążenia to coś więcej niż wychodzące `value`. Każda wysłana transakcja płaci opłatę za [[gas|gas]]: `gasUsed` z jej [[transaction-receipt|receiptu]] razy `effectiveGasPrice`, czyli base fee z [[eip-1559|EIP-1559]] plus priority fee, napiwek dla fee recipienta bloku. Płaci nawet wtedy, gdy zrobiła [[revert|revert]], ma `status` `0x0` i nie przeniosła żadnego `value`, a transakcja z [[blob|blobami]] płaci dodatkowo `blobGasUsed` razy `blobGasPrice`.",
          "Uznania to coś więcej niż przychodzące transakcje. [[internal-transaction|Transfery wewnętrzne]], czyli ether wysyłany przez kod kontraktów, obejmują ether wysłany razem z utworzeniem kontraktu i saldo, które przekazuje kontrakt wykonujący self-destruct. Fee recipient każdego bloku zbiera jego priority fees, których nie pokazuje żadna transakcja ani trace. W bloku kupionym od buildera jest nim zwykle sam builder, który na końcu płaci walidatorowi proponującemu blok zwykłym przelewem; zobacz [[validator-rewards|nagrody walidatora]]. [[withdrawals|Wypłaty (withdrawals)]], czyli wypłaty ze stakingu podane w gwei w tablicy `withdrawals` każdego bloku, przychodzą bez żadnej transakcji.",
          "Historia i inne łańcuchy dokładają kolejne pozycje. Przed [[the-merge|Merge]] górnicy dostawali nagrody za bloki i za bloki uncle, które `trace_block` zgłasza jako wpisy `reward`. W bloku 1 920 000 fork DAO przeniósł salda kont DAO do kontraktu zwrotów `0xbf4ed7b27f1d666546e30d74d50d173d20bca754` bez żadnej transakcji, trace'u ani logu. Na rollupie OP Stack nadawca płaci też `l1Fee` z receiptu za publikację swoich danych na Ethereum, a do tego opłatę operatora, jeśli łańcuch ją ustawia, natomiast Arbitrum wlicza koszt L1 do `gasUsed`; zobacz [[l2-rpc|różnice RPC na L2]]."
        ]
      },
      {
        heading: "Dlaczego suma logów transferów nigdy się nie zgadza",
        paragraphs: [
          "Ether nie ma logu `Transfer`, więc rejestr zbudowany z logów pomija każdy ruch natywnej waluty. Tokeny też mogą się przemieszczać bez logów: ERC-20 tylko zaleca, żeby mint emitował `Transfer`, a [[token-standards|tokeny z rebasingiem]] zmieniają salda bez żadnego transferu. stETH od Lido, token reprezentujący stakowany ether, opiera się na udziałach (shares): saldo to udziały posiadacza razy `totalPooledEther` podzielone przez `totalShares`, więc zmienia się codziennie, gdy wyrocznia (oracle) Lido raportuje salda swoich walidatorów, a transfer może przenieść 1 lub 2 wei mniej, niż zażądano. aTokeny Aave rosną z odsetkami równie po cichu.",
          "Działają dwa sposoby. Każdy token uzgadnia się z `balanceOf` wywołanym przez [[eth-call|eth_call]] w bloku zamknięcia, a logów używa się tylko do wyjaśnienia ruchów. Przy tokenach opartych na udziałach rejestr prowadzi się we własnej jednostce kontraktu, jak zaleca Lido: `sharesOf` zmienia się tylko przy transferach i mintach, które emitują `TransferShares`, oraz przy spaleniach, które emitują `SharesBurnt`; `getPooledEthByShares` w bloku zamknięcia przelicza udziały z powrotem na ether."
        ]
      },
      {
        heading: "Uzgadnianie w starszym bloku",
        paragraphs: [
          "Saldo w starszym bloku wymaga [[state|stanu]] z tego bloku, czyli sald takich, jakie były wtedy. [[full-node|Pełny węzeł]] trzyma tylko niedawny stan, w schemacie path-based [[geth|Getha]] mniej więcej z ostatnich 128 bloków, więc wywołanie `eth_getBalance` albo `balanceOf` dla bloku zamknięcia poprzedniego kwartału kończy się na nim błędem: w Gethu `historical state 0x… is not available`, w innym kliencie `missing trie node`. Odpowie na nie [[archive-node|węzeł archiwalny]]. Tanie rozwiązanie to snapshot każdego śledzonego salda na koniec każdego okresu, póki ten stan jest jeszcze niedawny, razem z numerem i hashem bloku.",
          "Gdy strony się nie zgadzają, pomaga bisekcja: porównuje się rejestr z węzłem w środku zakresu i zostawia tę połowę, w której pojawia się rozbieżność. Na całej historii mainnetu w około 25 krokach znajduje się pierwszy błędny blok, a jego trace wskazuje brakujący ruch. Często wystarczającą wskazówką jest sama wielkość różnicy: dokładna suma wypłat, priority fees z jednego bloku na adresie fee recipienta albo saldo stETH rozjechane o ostatni rebase."
        ]
      }
    ],
    example: {
      title: "Styczniowy rejestr, który się zgadza, i ten sam rejestr bez wypłat",
      note: "Oba salda są odczytywane przy ustalonych numerach bloków, nigdy przy `latest`; kwoty wypłat przychodzą w gwei i przed dodaniem trzeba je przeliczyć, a transakcja zakończona revertem i tak wnosi swoją opłatę."
    },
    pitfalls: [
      "Odczyt salda zamknięcia przy `latest` zamiast w ustalonym bloku końca okresu, przez co obie strony opisują różne chwile.",
      "Pomijanie gasu zapłaconego przez transakcje zakończone revertem, które zostały obciążone opłatami, choć ich `value` nigdy się nie przemieściło.",
      "Ignorowanie tablicy `withdrawals` każdego bloku, której kwoty w gwei zasilają adresy walidatorów bez żadnej transakcji, trace'u ani logu.",
      "Sumowanie eventów `Transfer` stETH, żeby otrzymać saldo, co pomija każdy codzienny rebase."
    ]
  },
  "chain-analytics": {
    title: "Analityka łańcucha i pipeline'y compliance",
    aliases: [
      "analityka blockchain",
      "blockchain intelligence",
      "screening sankcyjny",
      "klastrowanie adresów",
      "monitoring transakcji",
      "hurtownia danych onchain",
      "pipeline danych compliance"
    ],
    summary: "Pipeline analityki łańcucha albo compliance kopiuje każdy [[block|blok]], [[transaction-receipt|receipt]], [[event-log|log]] i [[execution-trace|trace]] łańcucha do znormalizowanych tabel, utrzymuje je kompletne i spójne mimo [[reorg|reorgów]] i buduje na nich modele, takie jak klastry adresów, etykiety podmiotów, trafienia na listach sankcyjnych i oceny ryzyka (risk scores), o których sam węzeł nic nie wie.",
    sections: [
      {
        heading: "Warstwa surowych danych i jej rachunek za RPC",
        paragraphs: [
          "Firmy analityczne (blockchain intelligence), takie jak Chainalysis i TRM Labs, mówią giełdom i śledczym, czy adres albo płatność ma związek z przestępstwem lub sankcjami; hurtownie danych, takie jak Dune i Allium, udostępniają SQL na tych samych danych. Wszystkie zaczynają od surowej kopii każdego łańcucha. Blog inżynierski TRM opisuje pobieranie każdego bloku EVM trzema wywołaniami: [[eth-get-block-by-number|eth_getBlockByNumber]], [[eth-get-block-receipts|eth_getBlockReceipts]] i [[trace-api|trace_block]]. Tabela `ethereum.traces` w Dune przechowuje każde wywołanie z jego pozycją w drzewie wywołań, `trace_address`, oraz zarówno jego własne `success`, jak i `tx_success` całej transakcji.",
          "Nadążanie za headem kosztuje trzy wywołania na blok, a na mainnecie to około 7200 bloków dziennie. Prawdziwym rachunkiem jest backfill, czyli wczytanie całej historii od pierwszego bloku: tracing wykonuje każdy blok ponownie na stanie sprzed niego, mainnet ma już ponad 25 milionów bloków, a nawet przy stałym tempie 20 bloków z trace'ami na sekundę pełny backfill trwa na [[archive-node|węźle archiwalnym]] około dwóch tygodni. Częstym wyborem są [[erigon|Erigon]] i [[reth|Reth]], których sposób przechowywania danych sprawia, że odtwarzanie historii jest tanie; [[geth|Geth]] nie ma przestrzeni nazw `trace_`, ale ten sam płaski kształt daje `flatCallTracer` w [[debug-api|debug_traceBlockByNumber]]."
        ]
      },
      {
        heading: "Kompletność i reorgi",
        paragraphs: [
          "Kompletność trzeba udowodnić. Allium sprawdza, czy istnieje każdy blok, transakcja, log i trace, czy bloki są w kolejności, czy liczby się zgadzają i czy pola mają sensowne wartości, bo, jak to ujmuje, RPC potrafią zawodzić, zwłaszcza podczas aktualizacji wersji. Konkretne sprawdzenia są tanie w przeliczeniu na blok: receiptów jest tyle samo co transakcji, każda transakcja ma dokładnie jeden trace najwyższego poziomu, `logIndex` biegnie od zera bez luk, a każdy log niesie hash właśnie tego bloku.",
          "[[reorg|Reorgi]], w których łańcuch zastępuje swoje najnowsze bloki, obsługuje się przez czekanie, przez korektę albo na oba sposoby. Dune opóźnia wczytywanie surowych danych na łańcuchach, które uznaje za podatne na reorgi, w tym na Ethereum i Polygonie. Allium czeka na 12 potwierdzeń na Ethereum, 15 na Base, 300 na Arbitrum, gdzie bloki pojawiają się mniej więcej co 250 ms, i 50 na Polygonie. TRM przetwarza każdy blok od razu, porównuje `parent_hash` z hashem, który ma zapisany, a osobny proces naprawczy (fixer) pobiera ponownie kanoniczny blok i publikuje go jeszcze raz. TRM ponawia też pobranie każdego bloku, którego pobrane części mają różne hashe bloku, bo [[load-balancer|load balancer]] providera może zwrócić blok i jego trace'y z węzłów stojących na różnych gałęziach; zobacz [[head-lag|spójność heada między węzłami]]."
        ]
      },
      {
        heading: "Fakty z węzła, atrybucja z modelu",
        paragraphs: [
          "Węzeł dostarcza fakty: to konto wysłało tyle w tym bloku, a to wywołanie zrobiło revert. Wszystko, co dokłada produkt compliance, to model zbudowany na tych faktach. Klastrowanie, czyli grupowanie adresów, które prawdopodobnie mają wspólnego właściciela, opiera się na zachowaniu giełd: praca Friedhelma Victora z 2020 roku grupuje adresy, które wpłacają na ten sam adres depozytowy giełdy, bo każdy taki adres należy do jednego klienta; zobacz [[exchange-deposits|depozyty i wypłaty na giełdzie]]. Była to najskuteczniejsza z heurystyk tej pracy, które razem pogrupowały w klastry 17,9% aktywnych kont EOA. Etykiety i oceny ryzyka to kolejne warstwy, które mogą być błędne, nawet gdy każdy surowy wiersz jest poprawny.",
          "Najprostszym przypadkiem jest screening sankcyjny. Lista sankcyjna OFAC, urzędu amerykańskiego Departamentu Skarbu, zawiera adresy Ethereum, a screening sprawdza kontrahenta względem tej listy bezpośrednio albo w odległości kilku transferów, czyli hopów. Chainalysis opublikowało wyrocznię onchain pod adresem `0x40C57923924B5c5c5455c48D93317139ADDaC8fb`, której `isSanctioned(address)` można odpytać dowolnym [[eth-call|eth_call]], ale jej dokumentacja mówi teraz, że nie jest już utrzymywana i ostatnio aktualizowano ją 18 marca 2026 roku, choć kontrakt nadal odpowiada. Błędy płyną też w drugą stronę: wywołanie pod rodzicem, który zrobił revert, policzone jako transfer, dodaje fałszywy hop do czyjejś ekspozycji; zobacz [[internal-transaction|transakcje wewnętrzne]]."
        ]
      },
      {
        heading: "Cała historia bez JSON-RPC",
        paragraphs: [
          "JSON-RPC to powolny sposób na przeniesienie całego łańcucha. [[era-files|Pliki era]] w formacie era1 przekazują bloki i receipty sprzed Merge w weryfikowalnych paczkach po 8192 bloki; pliki era warstwy konsensusu zawierają bloki po Merge, ale bez receiptów, a trace'y zawsze wymagają ponownego wykonania. [[firehose|Firehose]] działa wewnątrz zmodyfikowanego klienta, przechwytuje każdy blok z każdym wywołaniem i każdą zmianą salda i streamuje go z kursorem i krokami cofania (undo) dla reorgów, co zastępuje trzy wywołania na blok i większość kodu obsługi reorgów. Narzędzia takie jak Cryo zapisują wyniki RPC do Parquet; zobacz [[etl-pipeline|pipeline ETL]].",
          "Bez względu na źródło pipeline, który obsługuje śledczych, zapisuje pochodzenie danych (provenance): hash bloku, z którego pochodzi każdy wiersz, oraz klienta i tracer, które wygenerowały jego trace'y. Ustalenie, którego trzeba bronić, musi być odtwarzalne, a tracery różnią się co do tego, które ramki wymieniać: `callTracer` w Gethu uwzględnia wywołania prekompilowanych kontraktów, a jego `flatCallTracer` domyślnie je pomija."
        ]
      }
    ],
    example: {
      title: "Batch jednego bloku odrzucony przez sprawdzenie spójności i pobrany ponownie",
      note: "Na każde wywołanie odpowiedział inny backend; tylko wspólny hash bloku dowodzi, że trzy odpowiedzi opisują jeden blok, a zgodne liczby elementów bloku dowodzą, że nic nie wróciło obcięte."
    },
    pitfalls: [
      "Łączenie bloku z jednego węzła z trace'ami z innego bez sprawdzenia, czy blok i trace'y mają ten sam hash bloku.",
      "Traktowanie etykiety klastra albo oceny ryzyka jak faktu onchain, choć to wynik modelu, którego węzeł nie może zweryfikować.",
      "Screening na podstawie listy sankcyjnej trzymanej w kontrakcie, który nie jest już utrzymywany i dla każdego nowszego wpisu na listę zwraca false.",
      "Sprawdzanie tylko, czy istnieje każdy blok, co przeocza blok, którego trace'y albo logi wróciły obcięte."
    ]
  },
  "address-history": {
    title: "Historia transakcji adresu",
    aliases: [
      "historia adresu",
      "transakcje adresu",
      "historia konta",
      "txlist",
      "alchemy_getAssetTransfers",
      "ots_searchTransactionsBefore",
      "trace_filter fromAddress"
    ],
    summary: "JSON-RPC Ethereum nie ma metody, która wymienia transakcje dotyczące danego [[address|adresu]], bo węzły wyszukują bloki i transakcje tylko po numerze i hashu. Historię adresu składa się więc ze skanów logów, trace'ów filtrowanych po adresie, metod wyszukiwania dostępnych tylko w niektórych klientach albo z zewnętrznego [[indexer|indeksera]], a każde z tych źródeł coś pomija.",
    sections: [
      {
        heading: "Dlaczego węzeł nie zna odpowiedzi",
        paragraphs: [
          "Portfele, eksploratory bloków i narzędzia podatkowe chcą jednej listy: wszystkiego, co działo się z adresem, a węzeł nie potrafi jej zbudować. Przechowuje bloki po numerze i hashu, transakcje po hashu, receipty obok ich bloków, a [[state|stan]] po adresie: to tabele z kluczami głównymi i bez indeksu pomocniczego po adresie. Stan to tylko bieżące saldo, nonce, kod i storage każdego konta, a nie to, jak do nich doszło. Jedynym indeksem adresów w bloku jest jego 2048-bitowy [[logs-bloom|logsBloom]], który obejmuje kontrakty i topics logów z tego bloku, a nie nadawców ani odbiorców transakcji. Korzystanie z niego oznacza sprawdzanie nagłówka każdego bloku, a trafienie znajduje tylko logi.",
          "Jedna liczba jest dostępna bezpośrednio. [[eth-get-transaction-count|eth_getTransactionCount]] zwraca nonce konta EOA, czyli liczbę transakcji, które to konto wysłało i które trafiły do bloków, więc konto z nonce 42 powinno mieć w każdej zbudowanej dla niego historii dokładnie 42 transakcje wychodzące. [[eip-7702|EIP-7702]], które pozwala takiemu kontu uruchamiać kod kontraktu, komplikuje to sprawdzenie: każda zastosowana autoryzacja podpisana przez konto też podnosi jego nonce, nawet jeśli transakcję wysłał ktoś inny, i to samo robi każdy `CREATE` wykonany przez delegowany kod. Nonce kontraktu zaczyna się od 1 i liczy utworzone przez niego kontrakty, a aktywności przychodzącej nie liczy nic."
        ]
      },
      {
        heading: "Cztery sposoby na zbudowanie historii",
        paragraphs: [
          "Na pytanie o eventy odpowiadają logi. [[eth-get-logs|eth_getLogs]] z adresem dopełnionym zerami z lewej w `topics[1]` znajduje eventy `Transfer`, które adres wysłał, a drugie zapytanie z adresem w `topics[2]` znajduje te, które otrzymał, bo filtr łączy pozycje topics przez AND i nie potrafi zrobić OR między nimi. Pominięcie `address` łapie od razu wszystkie tokeny; to szerokie, drogie zapytanie, które providerzy [[rate-limits|ograniczają]]. `TransferSingle` z ERC-1155 stawia na pierwszym miejscu operatora, a nadawcę i odbiorcę w `topics[2]` i `topics[3]`, więc wymaga osobnych zapytań.",
          "Na pytanie o ether odpowiadają trace'y: `trace_filter` z `fromAddress` albo `toAddress` zwraca każde pasujące wywołanie w zakresie bloków, łącznie z transferami wewnętrznymi. [[erigon|Erigon]] znajduje adres w swoich indeksach call trace'ów i ponownie wykonuje tylko pasujące transakcje; [[nethermind|Nethermind]], [[besu|Besu]] i [[reth|Reth]] ponownie wykonują każdy blok w zakresie. Domyślne limity zakresu to 1000 bloków w Erigonie (`--rpc.blockrange.limit`) i Besu (`--rpc-max-trace-filter-range`), 100 w Reth (`--rpc.max-trace-filter-blocks`), a w Nethermindzie nie ma żadnego poza timeoutem żądania; [[geth|Geth]] w ogóle nie ma `trace_filter`. Rok, czyli około 2,6 miliona bloków, to więc mniej więcej 2600 żądań do Erigona albo Besu i 26 000 do Reth.",
          "Metody wyszukiwania i hostowane indeksy odpowiadają na to pytanie wprost. `ots_searchTransactionsBefore` i `ots_searchTransactionsAfter` z [[otterscan|Otterscana]] stronicują na Erigonie historię przychodzącą, wychodzącą i wewnętrzną adresu, a Reth odpowiada na nie `unimplemented`. API kont Etherscanu dzieli historię na osobne listy, takie jak `txlist`, `txlistinternal`, `tokentx` i `txsBeaconWithdrawal`, a każdą stronicuje się parametrami `page` i `offset`. `alchemy_getAssetTransfers` od Alchemy przyjmuje tablicę `category` z wartościami takimi jak `external`, `internal` i `erc20`, domyślnie zwraca 1000 wyników na stronę z `pageKey`, który wygasa po dziesięciu minutach, a `internal` obsługuje tylko na Ethereum, Polygonie, Base i Arc."
        ]
      },
      {
        heading: "Czego nie widzi każdy ze sposobów",
        paragraphs: [
          "Każda metoda ma martwe pole. Logi całkowicie pomijają ether i każdy ruch tokenu, którego kontrakt nie zalogował, na przykład `issue` w USDT. Trace'y pomijają to, co dzieje się poza EVM: [[withdrawals|wypłaty (withdrawals)]] i priority fees przypisywane fee recipientowi bloku. Transfery z Alchemy pomijają wywołania wewnętrzne o zerowej wartości, ramki `DELEGATECALL`, nagrody górników i wypłaty z Beacon Chain. Adres przekazany tylko jako argument funkcji, na przykład nowy właściciel ustawiony wywołaniem administracyjnym, które nie emituje eventu, wychodzi na jaw tylko po zdekodowaniu calldata każdej transakcji, czego żadna z tych metod nie robi. Kompletna historia to więc połączenie kilku źródeł, sprawdzone względem salda; zobacz [[accounting-reconciliation|uzgadnianie sald]].",
          "Konta sponsorowane i konta korzystające z abstrakcji kont łamią założenie, że działa ten, kto wysyła transakcję. Smart konto z [[erc-4337|ERC-4337]] to portfel będący kontraktem, którego podpisane operacje bundler pakuje do własnej transakcji, czyli wywołania `handleOps` na współdzielonym kontrakcie EntryPoint. Zapytanie `txlist` o smart konto wraca puste; jego aktywność jest w logach `UserOperationEvent` kontraktu EntryPoint, gdzie konto występuje jako `sender` w `topics[2]`, oraz w wywołaniach wewnętrznych, które konto wykonuje. Płacący przez [[eip-3009|EIP-3009]] i konta, za których gas płaci sponsor, wyglądają tak samo, bo `from` transakcji to ktoś inny.",
          "Ponieważ każdy może sprawić, że log wspomni dowolny adres, historia zbudowana z logów zbiera też spam typu address poisoning (zatruwanie adresów): transfery o zerowej wartości z udziałem podobnych adresów, które mają te same pierwsze i ostatnie znaki co adres, na który użytkownik naprawdę płaci, podrzucone po to, żeby skopiował niewłaściwy. Filtrowanie po kontrakcie tokenu i kwocie je usuwa."
        ]
      }
    ],
    example: {
      title: "Tydzień jednego smart konta widziany przez sześć metod",
      note: "Żaden pojedynczy wiersz nie jest historią konta: transfer o zerowej wartości to spam typu poisoning, token-podróbka to nie USDC, a saldo konta wyjaśnia dopiero połączenie logów, eventów EntryPoint i trace'ów."
    },
    pitfalls: [
      "Zapytanie tylko o `topics[1]`, które zwraca to, co adres wysłał, i nic z tego, co otrzymał.",
      "Proszenie jednym wywołaniem `trace_filter` o rok bloków, daleko ponad 100 do 1000 bloków, na które pozwalają domyślne limity większości klientów.",
      "Budowanie historii smart konta z wysłanych przez nie transakcji, choć każdą jego operację wysłał bundler.",
      "Kopiowanie adresu z historii, która zawiera zatruwające transfery o zerowej wartości z udziałem podobnych adresów."
    ]
  },
  "portfolio-tracker": {
    title: "Trackery portfolio i skanery sald",
    aliases: [
      "portfolio tracker",
      "tracker portfolio",
      "salda portfela",
      "wykrywanie tokenów",
      "skaner sald",
      "BalanceChecker",
      "alchemy_getTokenBalances",
      "pozycje DeFi",
      "spam tokeny"
    ],
    summary: "Tracker portfolio pokazuje, co ma [[address|adres]] i ile to jest warte. Żadna metoda [[json-rpc|JSON-RPC]] nie zwraca listy tokenów adresu, więc tracker najpierw wyszukuje kandydujące kontrakty tokenów w [[event-log|logach Transfer]] albo na listach tokenów, a potem odczytuje każde saldo przez [[eth-call|eth_call]] w jednym bloku.",
    sections: [
      {
        heading: "Żadna metoda nie mówi, co ma adres",
        paragraphs: [
          "Portfele i aplikacje do portfolio, takie jak Zerion, DeBank czy interfejs Safe{Wallet}, pokazują, co ma adres, ile to jest warte i jak jego wartość netto zmieniała się w czasie. Ether jest zapisany na samym koncie i zwraca go [[eth-get-balance|eth_getBalance]]. Każdy inny token to [[smart-contract|kontrakt]], który trzyma w swoim [[contract-storage|storage]] własną tabelę kwot przypisanych posiadaczom. Węzeł potrafi powiedzieć, co jeden token zapisał dla jednego posiadacza, ale nic nie podaje listy tokenów, które cokolwiek zapisały dla tego posiadacza. Dlatego każdy tracker działa w dwóch krokach: wykrywanie (discovery) buduje listę kandydujących kontraktów, a odczyt pyta każdy z nich o liczbę.",
          "Wykrywanie ma trzy typowe źródła. Pierwszym jest indeks transferów. Tokeny ERC-20 i ERC-721 przy każdym przeniesieniu emitują event `Transfer`, z nadawcą w `topics[1]` i odbiorcą w `topics[2]`, czyli w dwóch jego indeksowanych [[event-signature|topics]]. Przeskanowanie [[eth-get-logs|eth_getLogs]] w poszukiwaniu tego eventu z adresem na którejkolwiek z tych pozycji znajduje każdy token, z którym adres kiedykolwiek miał do czynienia; tak wypełnia swój [[indexer|indeks]] Safe Transaction Service. Drugim jest lista tokenów, czyli wyselekcjonowany plik z kontraktami, na przykład w formacie Token Lists od Uniswapa; tracker sprawdza każdy z nich niezależnie od tego, czy adres ma z nim jakąkolwiek historię. Trzecim jest własna metoda providera: `alchemy_getTokenBalances` zwraca najwyżej 100 sald na wywołanie i nie dokumentuje parametru bloku, więc odpowiada tylko dla chwili obecnej."
        ]
      },
      {
        heading: "Fan-out odczytów",
        paragraphs: [
          "Każde saldo to potem zwykłe wywołanie: `balanceOf(holder)` dla każdego tokena, `decimals()` i `symbol()` raz na token oraz eth_getBalance dla etheru. Portfel z 300 kandydującymi tokenami na pięciu łańcuchach potrzebuje 1500 odczytów na jedno odświeżenie, dla każdego użytkownika, który otworzy aplikację, więc trackery je pakują. `aggregate3` z [[multicall|Multicall3]] wykonuje setki podwywołań wewnątrz jednego eth_call, wszystkie w bloku wskazanym w żądaniu, więc każde saldo opisuje ten sam moment. Otwartoźródłowy BalanceChecker pod `0xb1f8e55c7f64d203c1400b9d8555d050f94adf39` pakuje jeszcze ciaśniej: przyjmuje tablicę posiadaczy i tablicę tokenów i zwraca wszystkie salda, a adres zerowy oznacza w nim ether. Tam, gdzie nikt go nie wdrożył, [[deployless-call|deployless call]] (wywołanie bez wdrażania kontraktu) wysyła jego bytecode w samym żądaniu.",
          "Pozycje DeFi wymagają odczytów specyficznych dla protokołu, bo depozyt na rynku pożyczkowym albo w puli nie jest tokenem na adresie użytkownika. Kontrakt Pool w Aave V3 odpowiada na `getUserAccountData(user)` łączną wartością zabezpieczenia (collateral), łącznym długiem i health factorem, który mówi, jak blisko pożyczce do likwidacji. Pozycja płynności w Uniswap v3 to NFT, który wydaje kontrakt position managera, więc tracker wywołuje na tym managerze `balanceOf(owner)`, potem `tokenOfOwnerByIndex(owner, i)` dla każdej pozycji, a potem `positions(tokenId)`, żeby poznać jej zakres cen i płynność, i przelicza to na kwoty dwóch tokenów po bieżącej cenie puli; zobacz [[dex-pool-reads|odczyty z pul DEX]]. Produkty utrzymują jeden taki adapter na każdy protokół."
        ]
      },
      {
        heading: "Spam, ceny i przeszłość",
        paragraphs: [
          "Każdy może wdrożyć token i wyemitować `Transfer` z dowolnym adresem jako odbiorcą, więc indeks wykrywania zapełnia się śmieciami: tokenami o nazwie USDC, które nie są USDC, airdropami, których nazwa jest linkiem phishingowym, i transferami o zerowej wartości, które podrzucają do historii użytkownika łudząco podobny adres w nadziei, że użytkownik go skopiuje. Filtrowanie to praca off-chain: API Zeriona oznacza każde aktywo flagą `is_trash` i domyślnie ukrywa oznaczone pozycje, bo `filter[trash]` ma domyślnie wartość `only_non_trash`. Tracker, który to pomija, pokazuje fałszywe saldo obok prawdziwych.",
          "Ceny nie są dostępne on-chain w ogólnej postaci; pochodzą z serwisów z danymi rynkowymi albo, dla mało popularnych tokenów z długiego ogona, z on-chainowych [[price-oracle|wyroczni cenowych]] (oracle) i z rezerw pul. Wykres wartości netto powtarza fan-out w przeszłych blokach, [[block-by-timestamp|jeden blok na każdy punkt w czasie]]. Większość węzłów trzyma tylko niedawny stan, więc to są żądania [[archive-node|archiwalne]], a dzienny wykres z 90 dni dla 300 tokenów to 27 000 takich żądań na adres. Dlatego trackery na bieżąco zapisują dzienny snapshot albo odtwarzają salda ze swojego indeksu transferów, co zawodzi przy tokenach z rebasingiem, takich jak stETH od Lido, których salda rosną bez żadnego `Transfer`."
        ]
      },
      {
        heading: "Czego potrzebuje od endpointu",
        paragraphs: [
          "Obciążenie jest szerokie i płytkie. Większość to eth_call z [[block-tag|tagiem bloku]] `latest`, czyli w najnowszym bloku: liczy się opóźnienie (latency), bo na wynik czeka człowiek, a odpowiedź można trzymać w cache do następnego bloku. Do tego dochodzą skany logów i odczyty archiwalne, jak przy [[address-history|historii adresu]]. Każdy łańcuch ma własny head, więc suma z wielu łańcuchów łączy bloki pobrane w odstępie kilku sekund."
        ]
      }
    ],
    example: {
      title: "Cztery salda w jednym eth_call przez skaner sald",
      note: "Wszystkie cztery salda pochodzą z tego samego bloku i z jednego żądania; `decimals()` nadal trzeba odczytać dla każdego tokena, bo przy 6 miejscach dziesiętnych USDC i 18 w DAI surowe sumy nic nie znaczą."
    },
    pitfalls: [
      "Budowanie listy kandydatów wyłącznie z listy tokenów, co pomija każdy token spoza listy, łącznie z airdropem, który przyszedł dziś rano.",
      "Traktowanie zera z BalanceChecker jako prawdziwego zera, choć zwraca on 0 także dla adresu tokena bez kodu i dla `balanceOf`, które robi revert.",
      "Pakowanie wszystkich kandydatów w jeden multicall ponad limit gasu, jaki węzeł nakłada na eth_call, przez co całe odświeżenie kończy się błędem.",
      "Sumowanie kwot z `Transfer`, żeby uzyskać saldo, co rozjeżdża się przy tokenach z rebasingiem i tokenach typu reflection, których salda zmieniają się bez `Transfer`; zamiast tego trzeba odczytać `balanceOf`."
    ]
  },
  "airdrop-rewards": {
    title: "Nagrody, punkty i wyliczanie airdropów",
    aliases: [
      "airdrop",
      "Merkl",
      "Merkle distributor",
      "liquidity mining",
      "program punktowy",
      "saldo ważone czasem",
      "kampania nagród",
      "dowód do claimu",
      "claim"
    ],
    summary: "Silniki nagród, punktów i airdropów wyliczają off-chain, na podstawie historii on-chain, ile zarobił każdy adres, a potem publikują jeden Merkle root, czyli 32-bajtowy hash będący commitmentem do całej tabeli wypłat, żeby każdy odbiorca mógł odebrać swoje środki (claim) z krótkim dowodem. Za każdą kampanią stoi backfill historii, który inni muszą móc odtworzyć.",
    sections: [
      {
        heading: "Co wylicza silnik",
        paragraphs: [
          "Kampania brzmi na przykład tak: „rozdziel 7000 tokenów w ciągu siedmiu dni między dostawców płynności w tej puli, proporcjonalnie do ich płynności w czasie”, a airdrop tak: „każdy, kto używał protokołu przed blokiem N, dostaje określoną kwotę”. Użytkownik widzi, ile już zarobił, i przycisk claim. Ważenie czasem oznacza, że saldo liczy się tak długo, jak długo było utrzymywane: 1000 jednostek przez dziesięć dni zarabia tyle samo co 10 000 jednostek przez jeden dzień. Merkl, silnik zachęt (incentive engine) używany przez protokoły DeFi, działa właśnie tak: odbudowuje pozycję każdego uczestnika z [[event-log|eventów]] i całkuje ją po czasie trwania kampanii, więc udział użytkownika to jego pole pod krzywą salda w czasie podzielone przez sumę takich pól wszystkich uczestników. Programy punktowe wykonują to samo obliczenie i kończą na rankingu (leaderboard) zamiast na tokenie.",
          "Samym eventom się nie ufa, bo stan może się zmienić bez logu: dług na rynku pożyczkowym rośnie w sposób ciągły przez odsetki wyliczane w chwili odczytu, a tokeny z rebasingiem zmieniają naraz wszystkie salda. Dlatego Merkl porównuje sumy wyliczone z eventów z wartościami on-chain, takimi jak `totalDebt()` rynku pożyczkowego, a gdy różnią się o więcej niż 1%, odczytuje on-chain pozycję każdego użytkownika, żeby poprawić wynik. Wejściem są więc logi, z których powstaje oś czasu, plus odczyty [[eth-call|eth_call]] w próbkowanych przeszłych blokach, które wymagają węzła [[archive-node|archiwalnego]] albo [[partial-archive|częściowego archiwum]] obejmującego to okno."
        ]
      },
      {
        heading: "Skoncentrowana płynność zarabia tylko w zakresie",
        paragraphs: [
          "Dostawca płynności w Uniswap v3 wybiera zakres cen, a jego depozyt jest używany przez swapy i zarabia opłaty tylko wtedy, gdy cena puli jest w tym zakresie. Ceny liczy się w tickach, czyli całkowitych krokach po 0,01% na skali cen puli. Pozycja to NFT, którego rekord `positions(tokenId)` zawiera `tickLower`, `tickUpper` i `liquidity`; jest w zakresie, dopóki bieżący tick puli spełnia `tickLower <= tick < tickUpper`, a kampanie Merkla dla skoncentrowanej płynności domyślnie nagradzają tylko pozycje w zakresie. Bieżący tick jest w każdym evencie `Swap`, więc silnik odtwarza swapy w całym oknie, żeby wiedzieć, które pozycje były aktywne i kiedy, a z eventów `IncreaseLiquidity` i `DecreaseLiquidity` position managera odczytuje, ile płynności miała każda z nich; zobacz [[dex-pool-reads|odczyty z pul DEX]]."
        ]
      },
      {
        heading: "Publikacja roota i claim",
        paragraphs: [
          "Wypłacanie środków tysiącom adresów, każdemu osobną transakcją, byłoby drogie, więc silnik publikuje commitment do całej tabeli wypłat i pozwala każdemu odbiorcy samemu odebrać środki. Drzewo Merkle hashuje każdy wiersz w liść, a potem hashuje pary hashy coraz wyżej, aż zostanie jeden 32-bajtowy root. [[inclusion-proof|Dowód]] to lista hashy sąsiadów (siblings) od jednego liścia do roota, około 20 hashy dla miliona wierszy, więc kontrakt, który trzyma tokeny i przechowuje tylko root, czyli Merkle distributor, może sprawdzić każdy claim.",
          "MerkleDistributor od Uniswapa, napisany do airdropu UNI w 2020 roku, hashuje każdy liść jako `keccak256(abi.encodePacked(index, account, amount))`, przyjmuje `claim(index, account, amount, merkleProof)` i oznacza każdy indeks w bitmapie, którą czyta się przez `isClaimed(index)`. StandardMerkleTree od OpenZeppelin hashuje każdy liść dwa razy, jako `keccak256(bytes.concat(keccak256(abi.encode(account, amount))))`, więc żaden node wewnętrzny drzewa nie może udawać liścia. Dowody pochodzą z API kampanii albo z opublikowanych przez nią plików; łańcuch tylko je weryfikuje.",
          "Distributor od Merkla trzyma zamiast tego sumy skumulowane. Jego liść to `keccak256(abi.encode(user, token, amount))`, gdzie `amount` to wszystko, co użytkownik kiedykolwiek zarobił w tym tokenie, a `claim(users, tokens, amounts, proofs)` wypłaca `amount` minus to, co już odebrano. Nowy root zaczyna obowiązywać dopiero po okresie sporu (dispute period) trwającym od jednej do dwóch godzin, w którym każdy może go zakwestionować; do tego czasu `getMerkleRoot()` nadal zwraca poprzedni root, a dowód wzięty z najnowszego drzewa kończy się revertem `InvalidProof`. Wywołanie claimu przez eth_call wyłapie to, zanim wyda się jakikolwiek gas."
        ]
      },
      {
        heading: "Backfill, który za tym stoi",
        paragraphs: [
          "Siedmiodniowa kampania na Ethereum obejmuje około 50 400 bloków logów puli plus próbkowane odczyty dla każdej pozycji; retroaktywny airdrop obejmuje lata wywołań [[eth-get-logs|eth_getLogs]] w ramach limitów zakresu u providera, plus `balanceOf` w bloku granicznym (cut-off) dla każdego kandydata. Poprawność liczy się bardziej niż szybkość, bo osoby zgłaszające spory i użytkownicy przeliczają wynik. To oznacza przypinanie bloków zamiast czytania `latest`, czytanie danych najwyżej do bloku `finalized`, żeby [[reorg|reorg]], który zastępuje niedawne bloki, nie mógł usunąć policzonej aktywności, wybór bloku granicznego według jawnie określonej konwencji [[block-by-timestamp|bloku według czasu]] i sprawdzanie, czy pusty zakres logów oznacza brak aktywności, a nie [[history-expiry|wygasłą historię]]. Pipeline'y [[chain-analytics|analityki łańcucha]] mają ten sam kształt."
        ]
      }
    ],
    example: {
      title: "Tydzień kampanii płynności w zakresie, krok po kroku",
      note: "Krok 3 to miejsce, w którym obliczenie ważone samym saldem się myli: B miał więcej płynności niż A, ale nic nie zarobił przez dwa dni, gdy cena była powyżej jego zakresu."
    },
    pitfalls: [
      "Liczenie pozycji w skoncentrowanej płynności przez całą kampanię, choć przez jej część była poza zakresem.",
      "Traktowanie pustego wyniku `eth_getLogs` dla starego zakresu jako braku aktywności, gdy endpoint nie ma już tych receiptów.",
      "Wysłanie claimu w Merklu zbudowanego z najnowszego drzewa w trakcie jego okresu sporu, kiedy kontrakt nadal weryfikuje względem poprzedniego roota.",
      "Wybór pierwszego bloku w chwili terminu lub po niej jako snapshotu uprawnień, co wlicza aktywność, która nastąpiła już po terminie granicznym."
    ]
  }
};
