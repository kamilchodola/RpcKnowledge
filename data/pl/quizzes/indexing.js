// Polish checkpoint questions for the Indexing lessons, keyed by topic id. Each topic's
// six questions match data/quizzes/indexing.js in order, kind, and answer position.
export const quizzes = {
  indexer: [
    {
      kind: "scenario",
      question: "Indekser pobiera blok N, a jego parentHash nie zgadza się z hashem zapisanym dla N-1. Co powinien zrobić, zanim cokolwiek zapisze?",
      options: [
        "Pominąć blok N i kontynuować od N+1, bo luka sama się zamknie",
        "Wycofać wiersze osieroconych bloków, a potem zastosować nową gałąź",
        "Pobrać ponownie blok N-1 i nadpisać tylko jego wiersz, resztę zostawić",
        "Nic; parentHash różni się tylko wtedy, gdy węzeł nie jest zsynchronizowany"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego jako klucz główny zaindeksowanych logów lepsze jest (blockHash, logIndex) niż (blockNumber, logIndex)?",
      options: [
        "logIndex zaczyna się od zera w każdej transakcji, więc numer jest niejednoznaczny",
        "Obiekty logów zwracane przez eth_getLogs nie zawierają numerów bloków",
        "Hashe sortują się szybciej niż liczby całkowite w większości silników baz",
        "Blok zastępczy po reorgu ma ten sam numer, ale nigdy ten sam hash"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Jaka para wywołań najtaniej pobiera ze standardowego endpointu nagłówek, receipty i logi jednego bloku?",
      options: [
        "eth_getBlockByNumber z fullTransactions false oraz eth_getBlockReceipts",
        "eth_getBlockByNumber z pełnymi transakcjami oraz osobne pobranie receiptu każdej",
        "eth_blockNumber oraz eth_getFilterChanges na stałym filtrze",
        "eth_subscribe na newHeads oraz debug_traceBlockByNumber"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Indekser zatwierdza wiersze bloku, potem osobnym zapisem aktualizuje kursor i pada pomiędzy jednym a drugim. Co się dzieje po restarcie?",
      options: [
        "Pomija ten blok, więc jego logi nigdy nie zostaną zaindeksowane",
        "Wykrywa lukę dzięki parentHash i ją naprawia",
        "Przetwarza ten blok ponownie i może zdublować jego wiersze",
        "Traci te wiersze, bo baza danych je wycofuje"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Indekser utrzymuje dwie granice. Co odróżnia ustaloną od optymistycznej?",
      options: [
        "Podąża za head i jest przepisywana przy każdym kolejnym reorgu",
        "Obejmuje zakresy z backfillu, a ta druga obejmuje bieżące bloki",
        "Przechowuje zdekodowane wiersze, a ta druga surowe logi z węzła",
        "Dochodzi tylko do bloków sfinalizowanych lub z wymaganą liczbą potwierdzeń"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Endpoint nie ma eth_getBlockReceipts, więc logi jednego bloku pobiera się przez eth_getLogs. Czego brakuje w porównaniu z receiptami?",
      options: [
        "Pola logIndex każdego logu w bloku",
        "Pól status i gasUsed każdej transakcji",
        "Pola blockHash, do którego należy każdy log",
        "Logów emitowanych przez wewnętrzne wywołania kontraktów"
      ],
      answer: 1
    }
  ],
  "event-log": [
    {
      kind: "detail",
      question: "Gdzie w logu znajdują się indeksowane parametry zwykłego eventu?",
      options: [
        "Na początku data, przed parametrami nieindeksowanymi",
        "W topics[0], doklejone za hashem sygnatury",
        "W topics[1] i dalszych, po jednym 32-bajtowym słowie",
        "W osobnym polu indexedData w obiekcie logu"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Kontrakt chce odczytać event, który inny kontrakt wyemitował wcześniej w tej samej transakcji. Jak to zrobić?",
      options: [
        "Nie da się; żaden opcode EVM nie odczytuje logów",
        "Opcode'em LOG0 wywołanym w trybie odczytu",
        "Wywołując eth_getLogs przez precompile",
        "Odczytując receiptsRoot z nagłówka bloku"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Kiedy obiekt logu przychodzi z removed ustawionym na true?",
      options: [
        "Gdy transakcja, która go wyemitowała, zrobiła potem revert",
        "Gdy subskrypcja albo filtr wycofuje go po reorgu",
        "Gdy log jest starszy niż okres przechowywania historii w węźle",
        "Gdy kontrakt, który go wyemitował, wykonał potem selfdestruct"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "W jednym bloku pierwszy log drugiej transakcji ma logIndex 0x5. Dlaczego?",
      options: [
        "logIndex liczy w obrębie transakcji, po pięciu wywołaniach wewnętrznych",
        "Reorg usunął pięć logów pierwszej transakcji",
        "Węzeł rezerwuje indeksy od 0x0 do 0x4 na logi systemowe",
        "logIndex liczy logi w całym bloku, a nie w obrębie transakcji"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Transakcja robi revert, gdy jej kontrakt wyemitował już dwa eventy. Co pokazuje jej receipt?",
      options: [
        "status 0x0 i dwa logi oznaczone jako removed",
        "status 0x1 i dwa zachowane logi",
        "status 0x0 i pustą tablicę logs",
        "status 0x0 i dwa logi zachowane do debugowania"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Portfel zalicza przychodzące tokeny na podstawie każdego logu, którego topics[0] to hash sygnatury Transfer. Na czym polega błąd?",
      options: [
        "Logi Transfer liczą się dopiero po sfinalizowaniu ich bloku",
        "Samo topics[0] nie odróżnia Transfer od Approval",
        "Każdy kontrakt może wyemitować Transfer; trzeba sprawdzić address logu",
        "Logi Transfer z wywołań wewnętrznych nie trafiają do receiptów"
      ],
      answer: 2
    }
  ],
  "event-signature": [
    {
      kind: "detail",
      question: "Log eventu, który nie jest anonimowy, ma trzy topics. Ile parametrów indeksowanych deklaruje ten event?",
      options: [
        "Trzy, po jednym na każdy wpis w tablicy topics",
        "Dwa, bo topics[0] zawiera hash sygnatury",
        "Trzy, a hash sygnatury jest zapisany w data",
        "Cztery, bo topics[0] łączy dwie wartości naraz"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Filtr ma topics [sigHash, null, [aliceTopic, bobTopic]]. Które logi pasują?",
      options: [
        "Ten event, Alice lub Bob jako pierwsza wartość indeksowana, dowolna druga",
        "Tylko ten event, bo null unieważnia resztę tablicy",
        "Ten event, dowolna pierwsza wartość indeksowana, Alice lub Bob jako druga",
        "Dowolny event, którego topics zawierają hash sygnatury na dowolnej pozycji"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jak parametr indeksowany typu string pojawia się w logu?",
      options: [
        "Jako pierwsze 32 bajty tekstu UTF-8, dopełnione zerami z prawej",
        "Jako offset wskazujący na data, jak nieindeksowany string",
        "Jako długość w bajtach, a sam tekst trafia do data",
        "Jako hash keccak-256 jego kodowania, którego nie da się odwrócić"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Filtr zbudowany z hasha Transfer(address,address,uint) nic nie zwraca dla popularnego tokena. Dlaczego?",
      options: [
        "Postać kanoniczna zawiera uint256, więc hash jest inny",
        "Filtry wymagają 4-bajtowego selektora, a nie pełnego hasha",
        "Logi Transfer są zwracane tylko przy ustawionym adresie",
        "Hash jest dobry, ale węzeł usuwa alias uint"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Potrzebne są wszystkie transfery od Alice albo do Alice. Co wymusza semantyka filtrów eth_getLogs?",
      options: [
        "Alice jako topic na pozycjach 1 i 2 w jednym filtrze",
        "null na pozycji 1, a Alice jako topic na pozycji 2",
        "Dwa filtry albo szersze zapytanie filtrowane po stronie klienta",
        "Alice jako topic w tablicy na pozycji 0, razem z hashem sygnatury"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym topics[0] różni się od selektora funkcji ABI zbudowanego w ten sam sposób?",
      options: [
        "Selektor zachowuje wszystkie 32 bajty hasha, a topics[0] cztery",
        "topics[0] zachowuje wszystkie 32 bajty hasha, a selektor cztery",
        "topics[0] hashuje przez SHA-256, a selektor przez keccak-256",
        "topics[0] zawiera nazwy parametrów, a selektor je pomija"
      ],
      answer: 1
    }
  ],
  reorg: [
    {
      kind: "detail",
      question: "Która ścieżka dostępu RPC po reorgu informuje konsumenta, że log, który już otrzymał, został wycofany?",
      options: [
        "eth_getLogs, który zwraca osierocony log z removed ustawionym na true",
        "eth_getBlockReceipts, który zwraca dla bloku tablicę removedLogs",
        "Subskrypcja logs albo eth_getFilterChanges, z removed ustawionym na true",
        "eth_blockNumber, który cofa się i pośrednio wskazuje usunięte logi"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Śledzona transakcja wypada w reorgu i trafia ponownie do następnego bloku. Co się zmienia?",
      options: [
        "Jej hash, bo podpis jest tworzony od nowa dla nowego bloku",
        "Nic, bo receipt jest zapisany pod hashem transakcji",
        "Jej nonce, zwiększony o jeden, żeby zapobiec powtórce",
        "Hash i numer bloku oraz indeksy się zmieniają; jej hash zostaje"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Którego bloku przy normalnych założeniach protokołu nie da się usunąć w reorgu?",
      options: [
        "Bloku finalized lub starszego; cofnięcie wymaga slashingu jednej trzeciej",
        "Bloku na poziomie safe lub niżej, z definicji nieodwracalnego",
        "Każdego starszego niż jeden slot, bo reorgi mają jeden blok głębokości",
        "Najnowszego bloku, bo węzeł już go wykonał"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Po reorgu indekser ponownie uruchamia eth_getLogs na niedawnym zakresie i dopisuje wszystko, co wróci. Co zostaje zapisane?",
      options: [
        "Tylko logi nowej gałęzi, bo stare wracają jako removed",
        "Logi nowej gałęzi obok osieroconych, które nigdy nie znikną",
        "Tylko osierocone logi, bo węzeł trzyma ten zakres w cache",
        "Zduplikowane wiersze, które węzeł oznaczył jako removed: true"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego poller, który tylko zwiększa licznik bloków, nigdy nie zauważy reorgu?",
      options: [
        "Każdy reorg przesuwa numery wszystkich późniejszych bloków o jeden w górę",
        "Węzeł wstrzymuje eth_blockNumber do zakończenia reorgu",
        "Reorgi dotyczą tylko bloków, do których poller jeszcze nie doszedł",
        "Nowy łańcuch odpowiada na każdy numer, więc nic nie wygląda podejrzanie"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Poller za load balancerem wykrywa reorg, którego nie było na żadnym z węzłów backendu. Co go spowodowało?",
      options: [
        "Łańcuch przez chwilę sfinalizował konkurencyjny checkpoint",
        "Przeskakiwał między węzłami, których head przez chwilę się różnił",
        "Jeden backend usunął w pruningu blok, który poller miał zapisany",
        "Każdy backend zastosował ten sam reorg na innej głębokości"
      ],
      answer: 1
    }
  ],
  confirmations: [
    {
      kind: "contrast",
      question: "Dlaczego liczba potwierdzeń jest dziś na Ethereum słabszą gwarancją niż tag bloku finalized?",
      options: [
        "Liczba potwierdzeń zeruje się przy każdym przesunięciu sfinalizowanego checkpointu",
        "Bloki finalized powstają szybciej, więc docierają wcześniej",
        "Głębokość to heurystyka; finalność to commitment zabezpieczony slashingiem",
        "Głębokość liczy tylko bloki zbudowane przez tego samego proposera"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Transakcja ma dziesięć potwierdzeń, a integracja i tak zaksięgowała zły wynik. Którego sprawdzenia najpewniej zabrakło?",
      options: [
        "Ponownego odczytu receiptu i sprawdzenia, czy blockHash się nie zmienił",
        "Konwersji numeru bloku z hex przed odejmowaniem",
        "Odczekania, aż transakcja opuści mempool węzła",
        "Sprawdzenia, czy gasUsed zgadza się z wcześniejszym oszacowaniem gasu"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Potwierdzenia są liczone względem bieżącego head. Skąd powinny pochodzić head i receipt, żeby liczba była stabilna?",
      options: [
        "Head z publicznego endpointu, receipt z własnego węzła",
        "Head z najszybszego endpointu, receipt z kopii w cache",
        "Head z endpointu L2, receipt z L1, na którym się rozlicza",
        "Head z jednego endpointu, receipt z tego samego endpointu"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Jak zwykle definiuje się, ile potwierdzeń ma transakcja?",
      options: [
        "Liczba atestacji, które otrzymał blok z transakcją",
        "head - blockNumber + 1, licząc blok z transakcją",
        "Bloki zbudowane od finalizacji bloku z transakcją",
        "Liczba węzłów, które zwróciły receipt"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Próg 20 potwierdzeń z integracji na L1 zostaje użyty na L2 z 2-sekundowymi blokami i jednym sekwencerem. Co on tam oznacza?",
      options: [
        "Silniejszą gwarancję, bo 20 bloków L2 rozlicza się szybciej",
        "Tę samą gwarancję, bo głębokość znaczy to samo na każdym łańcuchu",
        "Finalność, bo L2 finalizuje każdy blok, który wyprodukuje",
        "Niewiążące zapewnienie jednej strony, a nie 20 bloków konsensusu"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Giełda ma zaksięgować depozyt użytkownika. Na co powinna przedtem poczekać?",
      options: [
        "Na jedno potwierdzenie, bo reorgi mają jeden blok głębokości",
        "Na osiągnięcie finalized przez blok z transakcją",
        "Na pojawienie się receiptu ze statusem 0x1",
        "Na sześć potwierdzeń, zwykłą praktyczną regułę"
      ],
      answer: 1
    }
  ],
  "cursor-pagination": [
    {
      kind: "scenario",
      question: "Wywołanie eth_getLogs kończy się błędem „query returned more than 10000 results”. Jaka jest poprawna reakcja?",
      options: [
        "Ponowić ten sam zakres, stronicując parametrem offset",
        "Przeskoczyć zakres i zapisać lukę do późniejszego uzupełnienia",
        "Ponowić od tego samego fromBlock z węższym toBlock",
        "Zmienić zakres filtra tak, by używał tagu bloku pending"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego kursor trzeba zapisywać w tej samej transakcji bazodanowej co wiersze, które obejmuje?",
      options: [
        "eth_getLogs odrzuca fromBlock niższy niż w poprzednim zapytaniu",
        "Inaczej awaria mogłaby rozsynchronizować kursor z wierszami",
        "Baza potrzebuje go, żeby liczyć potwierdzenia bez RPC",
        "Zakresy bloków muszą być ciągłe, żeby działał filtr Blooma logów"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Która forma filtra omija limit maksymalnego zakresu bloków na endpoincie?",
      options: [
        "Zakres od earliest do latest, który węzeł traktuje specjalnie",
        "Filtr bez adresu, bo limity dotyczą pojedynczego kontraktu",
        "Forma z blockHash, która wskazuje dokładnie jeden blok",
        "Filtr utworzony przez eth_newFilter i opróżniany przez eth_getFilterChanges"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Pętla backfillu ustawia toBlock na latest w każdym oknie. Co idzie nie tak?",
      options: [
        "Węzeł odrzuca latest w każdym zapytaniu o ograniczony zakres",
        "Okno ciągle rośnie, więc wyników nie da się odtworzyć",
        "latest wskazuje na blok sfinalizowany i ukrywa świeże logi",
        "Każde okno zwraca te same logi, bo latest jest w cache"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Równoległe shardy backfillu obejmują rozłączne zakresy, ale na stykach lekko na siebie zachodzą. Co sprawia, że to nakładanie się jest nieszkodliwe?",
      options: [
        "Ładowanie shardów w kolejności numerów bloków",
        "Zapisywanie każdego shardu do osobnej bazy danych",
        "Kończenie zakresu każdego shardu na tagu pending",
        "Upsert wierszy po (blockHash, logIndex)"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Jakie parametry stronicowania daje wywołującemu eth_getLogs w porównaniu z API bazy danych?",
      options: [
        "fromBlock i toBlock albo pojedynczy blockHash",
        "LIMIT i offset w każdym żądaniu",
        "Token następnej strony zwracany z każdą odpowiedzią",
        "Kursor przechowywany przez węzeł dla każdego filtra"
      ],
      answer: 0
    }
  ],
  "historical-data": [
    {
      kind: "scenario",
      question: "Węzeł odpowiada na eth_getBlockByNumber dla bloku z 2019 roku, ale eth_getBalance na tym samym bloku się nie udaje. Co to za węzeł?",
      options: [
        "Pruned node, który zdążył już usunąć body tego bloku",
        "Węzeł archiwalny z uszkodzonym indeksem transakcji",
        "Pełny węzeł z zachowaną historią, ale tylko niedawnym stanem",
        "Lekki klient, który nie trzyma ani pełnej historii, ani stanu"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Które dane protokół celowo usuwa po stałym okresie przechowywania?",
      options: [
        "Nagłówki bloków, które są usuwane, gdy tylko zostaną sfinalizowane",
        "Blob sidecary, trzymane przez klientów konsensusu około 18 dni",
        "Receipty transakcji, odrzucane zaraz po wykonaniu",
        "State rooty, wyliczane na nowo, gdy są potrzebne"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego eth_getProof dla głębokiego bloku może się nie udać na węźle, który odpowiada dla niego na eth_getBalance?",
      options: [
        "Specyfikacja definiuje eth_getProof tylko dla stanu najnowszego bloku",
        "Dowody wymagają indeksu transakcji, który jest usuwany jako pierwszy",
        "Reorg dotknął konta, co unieważnia starsze dowody",
        "Płaski układ danych zwraca wartości, ale nie odbudowuje trie node'ów"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Węzeł Geth nadal ma stary blok, a mimo to eth_getTransactionByHash zwraca null dla transakcji z tego bloku. Dlaczego?",
      options: [
        "Indeks hashy obejmuje około 2,35 miliona ostatnich bloków",
        "Wygasanie historii usunęło tę transakcję, ale zostawiło jej blok",
        "Transakcji starszych niż sfinalizowany blok nie da się odpytać",
        "Transakcja wypadła w reorgu, a blok został na miejscu"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co odróżnia dane historyczne łańcucha od jego historycznego stanu?",
      options: [
        "Historia obejmuje ostatnie 128 bloków, a stan wszystko, co starsze",
        "Historia to to, co opublikowano, a stan to wynik jej wykonania",
        "Historia jest w warstwie konsensusu, a stan w warstwie wykonawczej",
        "Historię trzymają węzły archiwalne, a stan zwykłe pełne węzły"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Klient wykonawczy stosuje częściowe wygasanie historii. Co dzieje się z jego danymi sprzed Merge?",
      options: [
        "Nagłówki są usuwane, a każde body i każdy receipt zostają na dysku",
        "Wszystko trafia do magazynu blob sidecarów klienta konsensusu",
        "Zastępuje je jeden snapshot stanu wykonany w bloku Merge",
        "Body i receipty mogą zostać usunięte, a każdy nagłówek zostaje"
      ],
      answer: 3
    }
  ],
  "etl-pipeline": [
    {
      kind: "cause",
      question: "Dlaczego pipeline ETL powinien zachować surowe wiersze logów po ich zdekodowaniu?",
      options: [
        "Surowe logi kompresują się znacznie lepiej niż zdekodowane kolumny",
        "Poprawka ABI staje się wtedy ponowną transformacją, a nie drugą ekstrakcją",
        "Węzeł odmawia ponownego serwowania tego samego zakresu bloków",
        "Zdekodowane wiersze nie mają kolumny na hash bloku, z którego pochodzą"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Jaki typ kolumny pasuje do kwoty transferu ERC-20 w tabeli hurtowni danych?",
      options: [
        "64-bitowa liczba całkowita, bo kwoty ogranicza całkowita podaż",
        "Liczba zmiennoprzecinkowa, żeby zachować 18 miejsc po przecinku",
        "32-bitowa liczba całkowita, bo kwoty są zapisane w topics logu",
        "Szeroki typ dziesiętny albo bajty, bo uint256 przepełnia BIGINT"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Pipeline musi odtworzyć wewnętrzne transfery wartości. Jakiego dodatkowego źródła danych potrzebuje?",
      options: [
        "Filtra Blooma logów z nagłówka każdego bloku",
        "Trace'ów wywołań z metod trace_ albo debug_",
        "eth_getBlockReceipts z ustawionymi pełnymi transakcjami",
        "Bloku pending, który wymienia wywołania wewnętrzne"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Jedna tabela przechowuje adresy z checksumą, a druga hex małymi literami. Co się dzieje przy joinie po adresie?",
      options: [
        "Baza zgłasza błąd typu z powodu mieszanej wielkości liter",
        "Join po cichu gubi wiersze, które powinny się dopasować",
        "Dopasowuje się poprawnie, bo hex nie rozróżnia wielkości liter",
        "Checksumy są weryfikowane, a nieprawidłowe wiersze odrzucane"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co w układzie dwuetapowym oddziela warstwę surową od pochodnej?",
      options: [
        "Surowa trzyma tylko bloki sfinalizowane, pochodna obejmuje head",
        "Surowa jest dekodowana według ABI, pochodna trzyma oryginalne logi hex",
        "Surową drogo odtworzyć, a pochodną tanio z niej przebudować",
        "Surową przepisuje każdy reorg, a pochodna nigdy się nie zmienia"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Plan zakłada ekstrakcję 20 milionów bloków po dwa wywołania na blok. Co przede wszystkim decyduje o tym, ile to potrwa?",
      options: [
        "Przepustowość zapisu docelowej bazy danych",
        "Liczba kolumn w zdekodowanym schemacie",
        "Liczba typów eventów zadeklarowanych w ABI",
        "Rate limity endpointu i dobór zakresów"
      ],
      answer: 3
    }
  ],
  "indexing-database": [
    {
      kind: "consequence",
      question: "Każda tabela pochodna odwołuje się do blocks(hash) z ON DELETE CASCADE. Co to daje indekserowi?",
      options: [
        "Nie musi już przechowywać trwałego kursora",
        "Wycofanie reorgu staje się jednym usunięciem w blocks",
        "Agregaty liczone przy head pozostają spójne mimo reorgów",
        "Zduplikowane wiersze logów są odrzucane przy każdym ponowieniu"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Wiersze na poziomie transakcji mają klucz (block_hash, transaction_index), a nie hash transakcji. Dlaczego?",
      options: [
        "eth_getBlockReceipts nie zwraca hashy transakcji",
        "Hashe zmieniają się, gdy transakcja trafia ponownie do bloku po reorgu",
        "transaction_index jest globalnie unikalny w całym łańcuchu",
        "Jeden hash transakcji może pojawić się w dwóch konkurujących gałęziach"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Po jakim zegarze należy indeksować wiersze pochodne do zapytań o szeregi czasowe?",
      options: [
        "Po rzeczywistym czasie pobrania wiersza",
        "Po timestampie bloku z nagłówka",
        "Po czasie odebrania odpowiedzi RPC",
        "Po czasie commita transakcji bazodanowej"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Który typ kolumny w Postgresie dokładnie pomieści każdą wartość uint256?",
      options: ["BIGINT", "DOUBLE PRECISION", "NUMERIC(78, 0)", "NUMERIC(38, 18)"],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co zmienia się w obsłudze reorgów, gdy indekser przechodzi z Postgresa na ClickHouse?",
      options: [
        "Silnik merge w ClickHouse sam wycofuje osierocone bloki",
        "Nic, bo każdy z tych silników obsługuje kaskady kluczy obcych",
        "Bez kaskadowego usuwania logika rollbacku przechodzi do kodu zapisu",
        "Reorgi przestają mieć znaczenie, bo wiersze ClickHouse są niezmienne"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Sumy na dashboardzie chwieją się przy każdym reorgu o jeden blok. Która decyzja projektowa to powoduje?",
      options: [
        "Logi z kluczem (block_hash, log_index)",
        "Upserty zapisywane z klauzulą ON CONFLICT DO NOTHING",
        "Timestampy pobierane z nagłówka bloku",
        "Agregaty liczone z nieustalonych bloków przy head"
      ],
      answer: 3
    }
  ],
  "the-graph": [
    {
      kind: "detail",
      question: "Co decyduje o tym, które logi dostaje handler eventu w subgraphie?",
      options: [
        "Nazwy encji zadeklarowane w pliku schema.graphql subgraphu",
        "Adres kontraktu z manifestu i hash sygnatury eventu",
        "Zapytania GraphQL, które konsumenci wysyłają do subgraphu",
        "Kolejność, w jakiej handlery występują w pliku mappingów"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego handlery wywołań potrzebują innej klasy endpointu RPC niż handlery eventów?",
      options: [
        "Potrzebują subskrypcji WebSocket zamiast zwykłego HTTP",
        "Czytają transakcje pending prosto z mempoola",
        "Opierają się na API tracingu, bo zwykłe wywołanie nie emituje logu",
        "Wymagają, by endpoint udostępniał eth_getProof do odczytu stanu"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Handler subgraphu musi znać decimals tokena. Co wolno mu zrobić?",
      options: [
        "Pobrać publiczną listę tokenów przez HTTPS",
        "Wykonać eth_call do kontraktu tokena",
        "Odczytać zmienną środowiskową ustawioną przez operatora",
        "Odpytać API GraphQL innego subgraphu"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Manifest zostawia startBlock na 0 dla kontraktu wdrożonego wiele lat po genesis. Co się dzieje?",
      options: [
        "graph-node odrzuca manifest jako nieprawidłowy",
        "Subgraph startuje od bieżącego head i pomija historię",
        "graph-node sam znajduje blok wdrożenia i od niego zaczyna",
        "Subgraph najpierw odtwarza lata nieistotnych bloków"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Portfel musi sprawdzić, czy transakcja właśnie trafiła do bloku, i pokazać historię transferów użytkownika. Które źródło pasuje do którego zadania?",
      options: [
        "Subgraph do pierwszego, eth_getTransactionReceipt do drugiego",
        "eth_getTransactionReceipt do pierwszego, subgraph do drugiego",
        "Subgraph do jednego i drugiego, bo indeksuje każdy receipt przy head",
        "eth_getLogs do pierwszego, a eksplorator bloków do drugiego"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Ciąg event w manifeście zachowuje znaczniki indexed. Co robi z nimi graph-node?",
      options: [
        "Hashuje je do topic0 razem z typem każdego parametru",
        "Na ich podstawie ustala, które encje musi zapisać każdy handler",
        "Usuwa je przed hashowaniem topic0, a potem czyta te argumenty z topics",
        "Przekazuje je do GraphQL, żeby te pola dało się później filtrować"
      ],
      answer: 2
    }
  ],
  "block-explorer": [
    {
      kind: "detail",
      question: "Skąd eksplorator bierze transakcje wewnętrzne, które pokazuje dla danej transakcji?",
      options: [
        "Z tablicy logs w receipcie każdej transakcji",
        "Z transactionsRoot zapisanego w nagłówku bloku",
        "Z trace'ów wywołań zebranych metodami trace_ albo debug_",
        "Z mempoola, przechwycone, zanim blok trafi do łańcucha"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co spośród trzech najczęściej spotykanych eksploratorów odróżnia Otterscan od Etherscanu i Blockscouta?",
      options: [
        "Czyta przestrzeń nazw ots_ węzła Erigon, bez osobnego indeksu",
        "Jako jedyny eksplorator weryfikuje kod źródłowy kontraktów",
        "To hostowana, zamknięta usługa, która wymaga klucza API",
        "Indeksuje wyłącznie bloki sfinalizowane, więc transakcje po reorgu się nie pojawiają"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Eksplorator pokazuje wysłaną transakcję, a minutę później strona twierdzi, że taka transakcja nie istnieje. Co najpewniej się stało?",
      options: [
        "W międzyczasie wygasł klucz API eksploratora dla tej strony",
        "Została usunięta, bo była starsza niż okres przechowywania",
        "Jej blok wypadł w reorgu, a eksplorator przepisał swoją historię",
        "Nadawca zastąpił ją inną z wyższą opłatą już po włączeniu do bloku"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Eksplorator pokazuje zweryfikowane źródło dla adresu proxy. Gdzie naprawdę znajduje się zachowanie, które ma znaczenie?",
      options: [
        "W zweryfikowanym źródle proxy pokazanym na tej stronie",
        "Pod adresem implementacji, do której proxy deleguje wywołania",
        "W ABI, które eksplorator opublikował dla proxy",
        "W argumentach konstruktora zapisanych przy wdrożeniu"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Deweloper przesyła eksploratorowi źródła i ustawienia kompilatora do weryfikacji. Co eksplorator z nimi robi?",
      options: [
        "Podpisuje źródło własnym kluczem i zapisuje je obok adresu",
        "Uruchamia zestaw testów kontraktu na forku łańcucha",
        "Hashuje źródło i porównuje wynik z wartością w storage",
        "Kompiluje je ponownie i porównuje wynik z wdrożonym bytecode'em"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Eksplorator buduje salda tokenów z zaindeksowanych logów Transfer. Co z tego wynika dla pokazywanych sald?",
      options: [
        "Są dokładne, bo każda zmiana salda zawsze emituje event Transfer",
        "Obejmują wyłącznie tokeny, których kod źródłowy zweryfikowano",
        "Mogą się opóźniać albo gubić niestandardowe zachowania tokenów",
        "Aktualizują się, zanim blok z transferem w ogóle trafi do łańcucha"
      ],
      answer: 2
    }
  ],
  "internal-transaction": [
    {
      kind: "scenario",
      question: "Giełda księguje depozyty, szukając transakcji, których pole to wskazuje adres depozytowy. Użytkownik wysyła ether na ten adres z multisiga. Co się stanie?",
      options: [
        "Depozyt zostanie zaksięgowany normalnie, bo transakcja multisiga wskazuje ten adres",
        "Depozyt zostanie przegapiony, bo ether dociera przez wywołanie wewnętrzne",
        "Depozyt zostanie zaksięgowany po zindeksowaniu logu Transfer z multisiga",
        "Depozyt zostanie odrzucony, bo multisig nie może wysłać zwykłego etheru"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego transakcja wewnętrzna nie ma własnego receiptu?",
      options: [
        "Receipty wydaje się tylko dla transakcji, które emitują logi",
        "Jej receipt jest usuwany, gdy transakcja nadrzędna zostanie sfinalizowana",
        "Receipty wywołań wewnętrznych trzymają węzły archiwalne, a nie pełne",
        "To ramka wewnątrz podpisanej transakcji, do której należy receipt"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym w uzgadnianiu sald zbudowanym z transakcji i trace'ów wypłata walidatora różni się od transakcji wewnętrznej?",
      options: [
        "Jest księgowana poza EVM, więc nie zawiera jej żaden trace",
        "Pojawia się jako ramka CALL wysłana z kontraktu depozytowego",
        "Pojawia się jako wpis reward w każdym wyniku callTracer",
        "Widać ją w trace jako SELFDESTRUCT z kontraktu systemowego"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Indekser sumuje pole value każdej ramki z callTracer, żeby zmierzyć ether przesunięty przez transakcję. Co idzie nie tak?",
      options: [
        "Pomija ramki CREATE, bo utworzenie kontraktu nie niesie wartości",
        "Zaniża wynik, bo callTracer pomija każdą ramkę o zerowej wartości",
        "Liczy ramki DELEGATECALL, które dziedziczą wartość po rodzicu",
        "Zawyża wynik, bo ramki STATICCALL powtarzają wartość rodzica"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Wewnętrzne CALL routera wysyła 0,5 etheru i nie ma pola error, ale jego ramka nadrzędna zrobiła revert, choć transakcja jako całość się powiodła. Czy odbiorca dostał ether?",
      options: [
        "Tak, bo sama ramka wewnętrzna zakończyła się bez błędu",
        "Nie, bo revert rodzica cofnął wszystko, co było pod nim",
        "Tak, bo transfery wartości przetrwają revert ramki nadrzędnej",
        "To zależy od tego, czy konto odbiorcy ma jakiś kod"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Jakie ramki zwraca ots_getInternalOperations w Erigon i Reth?",
      options: [
        "Każdą ramkę wywołania, także o zerowej wartości i z najwyższego poziomu",
        "Tylko transfery wartości, których nie cofnął później revert ramki nadrzędnej",
        "Tylko wywołania precompile'ów i kontraktów utworzonych w tym bloku",
        "Niezerowe CALL, utworzenia kontraktów i self-destructy poniżej najwyższej ramki"
      ],
      answer: 3
    }
  ],
  "graph-node": [
    {
      kind: "scenario",
      question: "Mappingi subgrapha używają eth_call podczas synchronizacji od startBlock z 2021 roku, a jedynym providerem jest pełny węzeł z pruningiem zadeklarowany jako archive. Co się stanie?",
      options: [
        "graph-node odrzuci wdrożenie, bo węzeł nie jest archiwalny",
        "graph-node obsłuży wywołania z wartości z cache w Postgresie",
        "Wywołania zaczną zawodzić w trakcie synchronizacji, gdy zabraknie starego stanu",
        "Wywołania się udadzą, bo eth_call przypięte hashem nie potrzebuje starego stanu"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Która metoda RPC zasila call handlery w graph-node?",
      options: [
        "trace_filter dla zakresu bloków i obserwowanych kontraktów",
        "eth_getLogs z selektorem funkcji handlera jako topic0",
        "eth_getBlockReceipts filtrowane po polu input każdej transakcji",
        "eth_subscribe ze strumieniem newPendingTransactions"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego graph-node przypina eth_call z mappingu do hasha bloku, a nie do numeru bloku?",
      options: [
        "W większości klientów wyszukiwanie po hashu jest szybsze niż po numerze",
        "Bo eth_call odrzuca numery bloków starszych niż 128 bloków",
        "Żeby wynik wywołania dało się sprawdzić względem state root z nagłówka",
        "Żeby reorg na tej wysokości nie sprawił, że wywołanie odczyta inny blok"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym obsługa reorgów w graph-node różni się od obsługi w ręcznie napisanym indekserze RPC?",
      options: [
        "Przed zapisem czeka na finalność, więc nigdy niczego nie cofa",
        "Sam cofa wersje encji, więc mappingi nie zawierają kodu rollbacku",
        "Wymaga, żeby każdy mapping miał handler cofania dla każdej encji",
        "Ignoruje reorgi płytsze niż próg i przechowuje każdą z gałęzi"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co pozwala graph-node odpowiedzieć na zapytanie GraphQL o dane z wcześniejszego bloku?",
      options: [
        "Na żądanie ponownie uruchamia mappingi subgrapha aż do tego bloku",
        "Wysyła zapytanie do węzła archiwalnego przypiętego do tego bloku",
        "Każdy wiersz z wersją encji zapisuje bloki, w których jest aktualny",
        "Trzyma pełny snapshot Postgresa dla każdego zaindeksowanego bloku"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Operator zostawia dla łańcucha tylko providera Firehose i usuwa wszystkich providerów JSON-RPC. Które subgraphy przestaną działać?",
      options: [
        "Te, których mappingi wywołują eth_call, bo to nadal wymaga JSON-RPC",
        "Te z event handlerami, bo Firehose nie dostarcza logów",
        "Te z call handlerami, bo w blokach Firehose nie ma trace'ów wywołań",
        "Żadne, bo endpoint Firehose odpowiada też na wywołania kontraktów"
      ],
      answer: 0
    }
  ],
  firehose: [
    {
      kind: "detail",
      question: "Co poza samym blokiem zawiera każda odpowiedź strumienia Firehose?",
      options: [
        "Dowód Merkle, że blok należy do kanonicznego łańcucha",
        "Filtr eth_getLogs, który wybrał ten blok do dostarczenia",
        "Pozycję bloku w budżecie rate limitu u providera",
        "Krok, taki jak STEP_NEW albo STEP_UNDO, i nieprzezroczysty kursor"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego standardowa binarka Geth nie może zasilać readera Firehose?",
      options: [
        "Geth usunął swoje hooki live tracingu po wydaniu v1.14",
        "Firehose czyta pliki bazy danych Geth, których układ ciągle się zmienia",
        "Tracer Firehose jest w buildach StreamingFast, a nie w upstreamie",
        "Standardowy Geth wypisuje linie FIRE BLOCK tylko w trybie archiwalnym"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym wznowienie strumienia Firehose różni się od ponownej subskrypcji przez eth_subscribe po zerwanym połączeniu?",
      options: [
        "Firehose wznawia po ostatniej wiadomości, a nowa subskrypcja gubi lukę",
        "Firehose zaczyna od bieżącego head, a nowa subskrypcja odtwarza pominięte bloki",
        "Jedno i drugie odtwarza pominięte bloki, ale Firehose daje też ich receipty",
        "Jedno i drugie gubi lukę, ale Firehose podaje, ile bloków pominięto"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Konsument zapisuje wiersze każdego bloku, a kursor zapisuje potem osobno. Co może się stać, gdy proces padnie między tymi dwoma zapisami?",
      options: [
        "Serwer odrzuci nieaktualny kursor i zacznie od bloku genesis",
        "Wiadomość STEP_UNDO automatycznie wycofa te wiersze",
        "Nic, bo Firehose deduplikuje bloki dla każdego konsumenta",
        "Po wznowieniu strumienia blok może zostać zastosowany drugi raz"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Co blok Firehose na poziomie extended dodaje w porównaniu z blokiem na poziomie base?",
      options: [
        "Receipty i logi eventów, których bloki base nie zawierają",
        "Ramki wywołań i zmiany salda, storage i nonce w każdym wywołaniu",
        "Blok beacon i podpis, który złożył pod nim proposer",
        "Kompresję, dzięki której te same dane zajmują mniej miejsca"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Konsument rozłącza się na bloku, który zostaje osierocony, zanim konsument połączy się ponownie z zapisanym kursorem. Co dostanie?",
      options: [
        "Błąd, bo kursor wskazuje blok, którego nie ma już w łańcuchu",
        "Undo dla osieroconego bloku, a potem kanoniczny blok zastępczy",
        "Następny kanoniczny blok, a osierocony zostanie po cichu pominięty",
        "Cały strumień od nowa, począwszy od ostatniego nieodwracalnego bloku"
      ],
      answer: 1
    }
  ],
  substreams: [
    {
      kind: "detail",
      question: "O czym decyduje polityka aktualizacji modułu store?",
      options: [
        "Jak w kolejnych blokach łączą się wartości pod tym samym kluczem",
        "Jak często store jest zrzucany do tabel w bazie danych sinka",
        "Które bloki moduł store może czytać jako swoje wejście",
        "Czy cache store'a przetrwa zmianę kodu tego modułu"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego Substreams może podzielić długą historię na segmenty przetwarzane jednocześnie?",
      options: [
        "Każdy segment czyta inny węzeł archiwalny, więc nic nie jest współdzielone",
        "Segmenty pomijają bloki bez logów, więc ich praca rzadko się pokrywa",
        "Wynik zależy tylko od wejść, a częściowe store'y są potem scalane",
        "Segmenty działają w trybie deweloperskim, który łagodzi reguły kolejności"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Programista zmienia jedną linię w kodzie Rust modułu map i ponownie uruchamia pakiet. Co dzieje się z wynikami w cache?",
      options: [
        "Od nowa liczy się tylko edytowany moduł, a moduły niżej czytają jego stary cache",
        "Edytowany moduł i każdy moduł poniżej niego liczą się od nowa",
        "Nic nie liczy się od nowa, bo moduł zachował nazwę i wersję",
        "Wszystko liczy się od nowa od genesis, łącznie z niepowiązanymi modułami"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Sink SQL zapisuje do tabel Postgresa, które nie mają kluczy głównych. Co przestaje działać?",
      options: [
        "Równoległy backfill, który dzieli zakresy według klucza każdej tabeli",
        "Przechowywanie kursora, indeksowane kluczem głównym każdej tabeli",
        "Cofanie wierszy z osieroconych bloków, gdy zdarzy się reorg",
        "Nic, bo sink dodaje do każdej tabeli własny klucz zastępczy"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co konsumuje graph-node w subgraphie opartym na Substreams?",
      options: [
        "Zmiany encji z modułu, zamiast uruchamiać event handlery",
        "Surowe bloki Firehose, które potem dekodują mappingi w AssemblyScript",
        "Wiersze SQL wyeksportowane przez sink z bazy ClickHouse",
        "Wyniki eth_getLogs, które Substreams zapisał w cache dla subgrapha"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym backfill w Substreams różni się od backfillu przez eth_getLogs?",
      options: [
        "Czyta te same logi, ale przez warstwę GraphQL zamiast JSON-RPC",
        "Widzi tylko logi, ale omija limity zakresu bloków na endpoincie",
        "Wymaga endpointu archiwalnego, a eth_getLogs nigdy go nie wymaga",
        "Widzi też wywołania i zmiany stanu, a skaluje się przez dodawanie workerów"
      ],
      answer: 3
    }
  ],
  "log-index": [
    {
      kind: "scenario",
      question: "Backfill skierowano na węzeł Geth, który godzinę temu skończył synchronizację, a szerokie wywołania eth_getLogs kończą się timeoutem. Jaka jest prawdopodobna przyczyna?",
      options: [
        "Geth odrzuca zakresy szersze niż 10 000 bloków, dopóki nie zostaną sfinalizowane",
        "Indeks logów wciąż się buduje, więc Geth szuka bez indeksu",
        "Bloomy nagłówków są zapisywane dopiero po zbudowaniu indeksu logów",
        "Węzeł usunął receipty podczas synchronizacji i pobiera je ponownie"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co ustawia flaga Getha --history.logs?",
      options: [
        "Ile ostatnich bloków trzyma receipty na dysku",
        "Ile logów może zwrócić jedna odpowiedź eth_getLogs",
        "Ile ostatnich bloków ma indeks hashy transakcji",
        "Ile ostatnich bloków obejmuje indeks wyszukiwania logów"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego przy szerokim zapytaniu indeks logów jest szybszy od bloomów nagłówków, skoro każda z tych dróg daje poprawne odpowiedzi?",
      options: [
        "Mapuje każdą wartość na bloki, które ją zawierają, bez skanowania nagłówków",
        "Usuwa przeoczenia, które bloomy powodują w zatłoczonych blokach",
        "Pozwala węzłowi nie sprawdzać kandydatów w receiptach",
        "Nagłówek ma do niego commitment, więc węzeł ufa mu bez sprawdzania"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Jak Reth odpowiada na eth_getLogs o szerokim zakresie, w porównaniu z Gethem?",
      options: [
        "Z filter maps jak Geth, ale domyślnie zaindeksowanych od genesis",
        "Z indeksów odwróconych w stylu Erigona, pobieranych ze snapshotami",
        "Skanując bloomy nagłówków w limicie na żądanie, bez żadnego indeksu",
        "Odrzucając zakres, dopóki nie włączy się opcjonalnego indeksu logów"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Operator uruchamia węzeł archiwalny Geth z domyślnymi flagami i robi backfill logów od 2019 roku. Czego powinien się spodziewać?",
      options: [
        "Szybkich odpowiedzi, bo tryb archiwalny indeksuje logi aż do genesis",
        "Błędów, bo tryb archiwalny całkowicie wyłącza indeks logów",
        "Pustych wyników, bo tak stare receipty nie są już przechowywane",
        "Wolnego wyszukiwania bez indeksu dla bloków starszych niż około rok"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Węzeł Nethermind bez indeksu logów dostaje eth_getLogs obejmujące więcej bloków, niż pozwala Receipt.MaxBlockDepth. Co zobaczy wywołujący?",
      options: [
        "Przycięty wynik obejmujący tylko pierwsze 1000 bloków",
        "Błąd invalid params (kod -32602) zamiast wyników",
        "Wolną odpowiedź, bo Nethermind buduje indeks na żądanie",
        "Pustą tablicę, bo bloki bez indeksu są pomijane"
      ],
      answer: 1
    }
  ],
  "block-by-timestamp": [
    {
      kind: "scenario",
      question: "Snapshot w governance musi odzwierciedlać salda z chwili T, w której startuje propozycja. Który blok powinno zwrócić wyszukiwanie?",
      options: [
        "Pierwszy blok z timestampem równym T lub późniejszym",
        "Blok najbliższy T, niezależnie od tego, po której stronie leży",
        "Ostatni blok z timestampem równym T lub wcześniejszym",
        "Blok o numerze równym T minus genesis podzielone przez 12"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jak zamienić slot po Merge na numer bloku warstwy wykonawczej?",
      options: [
        "Wywołać eth_getBlockByNumber z numerem slotu jako numerem bloku",
        "Podzielić czas startu slotu przez 12 i dodać numer bloku Merge",
        "Wywołać eth_getBlockByHash z rootem bloku beacon z tego slotu",
        "Pobrać blok beacon ze slotu i odczytać jego execution block_number"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Beacon API zwraca 404 dla slotu, w którym wypada czas T. Co z tego wynika dla ostatniego bloku w chwili T lub przed nią?",
      options: [
        "Jeszcze nie istnieje, bo ten slot nadal jest pending",
        "Leży we wcześniejszym slocie, bo ten slot nie ma bloku",
        "To następny blok, który dziedziczy czas pustego slotu",
        "Trzeba go pobrać z archiwalnego beacon node"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym szukanie bloku dla czasu T na Arbitrum różni się od szukania go na mainnecie?",
      options: [
        "Kolejne bloki mogą mieć ten sam timestamp, więc T może pasować do zakresu",
        "Bloki mają tam numery slotów, więc arytmetyka znajduje je dokładnie",
        "Timestampy powtarzają te z L1, więc rosną skokami po 12 sekund",
        "Jest tam standardowa metoda eth_, która zwraca blok bezpośrednio"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co zwraca erigon_getBlockByTimestamp dla czasu, który wypada między dwoma blokami?",
      options: [
        "Ostatni blok z timestampem równym temu czasowi lub wcześniejszym",
        "Ten z dwóch bloków, który leży bliżej tego czasu",
        "Pierwszy blok z timestampem równym temu czasowi lub późniejszym",
        "Błąd, bo czas nie odpowiada dokładnie żadnemu blokowi"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego przeliczanie upływu czasu na numer bloku po 12 sekund na blok zawodzi na mainnecie?",
      options: [
        "Pominięte sloty przesuwają czas, nie tworząc bloku",
        "Proposerzy mogą ustawiać timestampy w dowolnym miejscu okna tolerancji",
        "Długość slotu zmieniała się przy każdej aktualizacji sieci od Merge",
        "Przy Merge timestampy przeszły na milisekundy"
      ],
      answer: 0
    }
  ],
  otterscan: [
    {
      kind: "scenario",
      question: "Otterscan jest hostowany na firmowym serwerze WWW i skonfigurowany z URL-em węzła http://127.0.0.1:8545. Co się dzieje, gdy otwierają go zdalni współpracownicy?",
      options: [
        "Serwer WWW przekazuje ich wywołania do węzła na własnym loopbacku",
        "Otterscan przełącza zdalnych użytkowników na publiczny endpoint",
        "Strony ładują się z wbudowanej w Otterscan kopii łańcucha",
        "Każda przeglądarka woła port 8545 u siebie i nie znajduje węzła"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Deweloper podpina Otterscan pod archiwalny węzeł Reth z włączonym ots. Która część eksploratora nie działa?",
      options: [
        "Strony bloków, bo Reth nie implementuje ots_getBlockDetails",
        "Historia adresów, bo metody wyszukiwania nie są zaimplementowane",
        "Strony transakcji, bo Reth nie umie zwrócić danych revertu",
        "Wszystko, bo Reth zgłasza nieobsługiwany poziom API"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego Otterscan nie potrzebuje osobnego indeksera ani bazy danych?",
      options: [
        "Przy pierwszym załadowaniu buduje indeks w local storage przeglądarki",
        "Wszystko, na co węzeł nie odpowie, czyta z API Etherscanu",
        "Węzeł sam odpowiada na pytania o historię adresów z własnych indeksów",
        "Pokazuje tylko bloki i transakcje, nigdy historię adresów"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym Otterscan różni się od Blockscouta pod względem tego, gdzie znajdują się dane łańcucha?",
      options: [
        "Blockscout trzyma własną kopię łańcucha; Otterscan pyta węzeł",
        "Otterscan kopiuje łańcuch do Postgresa; Blockscout pyta węzeł na żywo",
        "Każdy kopiuje łańcuch, ale Otterscan trzyma tylko ostatnie 128 bloków",
        "Każdy pyta węzeł na żywo, ale Blockscout dodaje bazę sygnatur"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co wynika z tego, że węzeł odpowiada 8 na ots_getApiLevel?",
      options: [
        "Że każda metoda ots_ do poziomu 8 jest zaimplementowana",
        "Że węzeł to Erigon, jedyny klient, który odpowiada na to wywołanie",
        "Że węzeł trzyma pełny stan archiwalny do tracingu",
        "Że węzeł deklaruje poziom 8, a nie że każda metoda działa"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Węzeł odpowiada na żądania z curla, ale Otterscan w przeglądarce pokazuje, że każde wywołanie RPC się nie udaje. Którego ustawienia najpewniej brakuje?",
      options: [
        "Przestrzeni nazw trace, od której zależy każda strona Otterscana",
        "CORS, bo przeglądarka blokuje wywołania, na które węzeł nie zezwala",
        "Klucza API, który Otterscan wysyła z każdym żądaniem JSON-RPC",
        "Obsługi WebSocket, bo Otterscan nigdy nie wywołuje przez HTTP"
      ],
      answer: 1
    }
  ],
  "signature-directory": [
    {
      kind: "scenario",
      question: "Narzędzie dekoduje calldata zaczynające się od 0xa9059cbb według najnowszego wpisu w 4byte.directory i pokazuje workMyDirefulOwner. Co poszło nie tak?",
      options: [
        "Kilka sygnatur ma ten sam selektor, a najnowsza nie jest najbardziej prawdopodobna",
        "Narzędzie zahashowało calldata, zamiast przeczytać jego pierwsze cztery bajty",
        "Katalog źle opisuje transfer, który ma inny selektor",
        "Kontrakt to proxy, więc jego selektory zmieniają się przy każdym upgradzie"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym dekodowanie zweryfikowanym ABI kontraktu różni się od dekodowania katalogiem sygnatur?",
      options: [
        "ABI obejmuje tylko eventy; katalog obejmuje też funkcje",
        "ABI to własny interfejs kontraktu; katalog podsuwa domysły",
        "ABI wywnioskowano z bytecode'u; katalog trzyma zweryfikowane źródła",
        "Jedno i drugie jest dokładne, ale katalog odpowiada bez klucza API"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co wpis katalogu dla eventu zostawia dekoderowi do ustalenia?",
      options: [
        "Typy parametrów w kanonicznej formie eventu",
        "Nazwę eventu w postaci zadeklarowanej w źródle",
        "32-bajtowy hash topic0, który daje ta sygnatura",
        "Które parametry są indeksowane, a które są w data"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Eksplorator dekoduje wywołania proxy za pomocą zweryfikowanego ABI samego proxy. Co pokazuje?",
      options: [
        "Poprawne nazwy, bo ABI proxy zawiera ABI implementacji",
        "Poprawne nazwy, ale dopiero po następnym upgradzie implementacji",
        "Brakujące albo błędne nazwy; funkcje są w implementacji",
        "Nic, bo proxy w ogóle nie da się zweryfikować w eksploratorach"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Skąd baza sygnatur Sourcify bierze nowe sygnatury, choć nikt ich nie zgłasza?",
      options: [
        "Z ABI kontraktów zweryfikowanych w Sourcify",
        "Z brute force każdego selektora widzianego na mainnecie",
        "Z kopiowania co noc wpisów z 4byte.directory",
        "Z wyjścia 4byteTracer każdego publicznego węzła"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego kolizje selektorów funkcji są częste, a kolizje topic0 praktycznie nie występują?",
      options: [
        "Eventy są hashowane SHA-256, a funkcje keccak-256",
        "Katalogi odrzucają sygnatury eventów, które kolidują z innymi",
        "Selektor zachowuje cztery bajty hasha, a topic0 wszystkie trzydzieści dwa",
        "Topic0 zawiera adres emitującego kontraktu, co czyni go unikalnym"
      ],
      answer: 2
    }
  ],
  "exchange-deposits": [
    {
      kind: "scenario",
      question: "Klient wypłaca 0,75 ETH z multisiga Safe na swój adres depozytowy na giełdzie, a skaner giełdy czyta tylko transakcje najwyższego poziomu i logi Transfer. Co dzieje się z depozytem?",
      options: [
        "Zostaje zaksięgowany od razu, bo Safe emituje log Transfer",
        "Zostaje przeoczony, bo wewnętrzne wywołanie widać tylko w trace'ach",
        "Zostaje zaksięgowany później, gdy batch samego Safe'a się sfinalizuje",
        "Zostaje odrzucony, bo kontrakty nie mogą wysyłać etheru do kont EOA"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego pipeline, który obserwuje saldo etheru wdrożonego forwardera CREATE2, nie widzi żadnych depozytów?",
      options: [
        "Jego funkcja receive przekazuje ether dalej w tym samym wywołaniu",
        "Salda forwarderów są trzymane w kontrakcie factory, a nie w forwarderze",
        "eth_getBalance zwraca zero dla każdego adresu, który ma kod",
        "Ether wysłany do forwardera czeka w EntryPoint jako środki do odebrania"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co w pipeline giełdy odróżnia wykrycie depozytu od jego zaksięgowania?",
      options: [
        "Wykrywanie czyta trace'y, a księgowanie tylko logi Transfer",
        "Wykrywanie działa na węźle hot walleta, a księgowanie na węźle offline",
        "Wykrywanie wymaga węzła archiwalnego, a księgowanie pełnego węzła",
        "Wykrycie jest przy headzie, księgowanie czeka na głębokość lub finalność"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Jaki dowód powinien rozstrzygać, że depozyt ERC-20 naprawdę dotarł?",
      options: [
        "Zdekodowane calldata transferu razem ze statusem receiptu 0x1",
        "Log Transfer, w którym symbol tokenu zgadza się z symbolem aktywa z listy",
        "Log Transfer z kontraktu, który jest na liście obsługiwanych tokenów",
        "Wzrost salda widoczny na stronie tokenu w eksploratorze bloków"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Wypłata z hot walleta z nonce 812 wciąż nie trafiła do bloku, a jej maxFeePerGas jest niższy niż base fee. Za nią czeka 40 kolejnych wypłat. Co odblokuje kolejkę?",
      options: [
        "Ponowne rozgłoszenie 40 czekających wypłat przez innego providera",
        "Ponowne wysłanie wypłaty 813 z dołączonym wyższym priority fee",
        "Czekanie, aż węzeł po jakimś czasie usunie nonce 812 z mempoolu",
        "Zastąpienie nonce 812 tą samą wypłatą z wyższym max fee"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Giełda udostępnia depozyty do wydania po jednym potwierdzeniu, a reorg o jeden blok na dobre usuwa transakcję depozytu. Co z tego wynika?",
      options: [
        "Zaksięgowanie zostaje, choć etheru nie ma, a brak staje się długiem",
        "Węzeł przywraca depozyt, bo logi nigdy nie są wycofywane",
        "Zaksięgowanie znika automatycznie razem z wierszem pending wykrycia",
        "Transakcja zamienia się we wpis wypłaty w następnym bloku"
      ],
      answer: 0
    }
  ],
  "stablecoin-payments": [
    {
      kind: "scenario",
      question: "Operator płatności daje wszystkim klientom ten sam adres depozytowy USDC i prosi płacących o podanie numeru konta klienta. Co pójdzie nie tak?",
      options: [
        "Portfele odmawiają wysyłki na adres, który ma już USDC",
        "USDC usuwa notatkę płacącego, zanim wyemituje log Transfer",
        "Przelew nie ma pola referencji, więc nie da się odróżnić płacących",
        "Notatka trafia do receiptu, który providerzy usuwają po kilku dniach"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Czym na Ethereum czarna lista USDT różni się od czarnej listy USDC?",
      options: [
        "USDT blokuje tylko odbieranie, a USDC tylko wysyłanie",
        "Zamrożenie w USDT emituje Blacklisted, a w USDC AddedBlackList",
        "USDT emituje event indeksowany, a USDC nie emituje żadnego eventu",
        "USDT blokuje tylko wysyłanie, a USDC wysyłanie i odbieranie"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego operator przypisuje płatność USDC przez EIP-3009 na podstawie logu Transfer, a nie pola from transakcji?",
      options: [
        "Pole from jest ukryte w transakcjach, które niosą podpisy",
        "Pole from wskazuje tego, kto wysłał transakcję i zapłacił za gas",
        "Pole from zawiera kontrakt tokenu, gdy używa się permitów",
        "Pole from jest zerowe, bo płacący nie podpisał żadnej transakcji"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Faktura opiewa na 10,008422 USDT, a log z prawdziwego kontraktu USDT pokazuje 9,008422 przelane na adres faktury. Jakie jest zwykle wyjaśnienie?",
      options: [
        "Pobrano opłatę za transfer USDT i trafiła ona do właściciela kontraktu",
        "Giełda, z której zapłacono, potrąciła własną opłatę z wysłanej kwoty",
        "Proces śledzący wyłapał podrobiony token z symbolem USDT",
        "Reszta jest jeszcze pending i dotrze w późniejszym receipcie"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Kontrakt wypłat wywołuje transfer z USDT przez standardowy interfejs, który oczekuje zwracanej wartości bool. Co się dzieje?",
      options: [
        "Wywołanie się udaje, a kontrakt odczytuje wynik jako false",
        "Tokeny się przemieszczają, ale dla wypłaty nie powstaje log Transfer",
        "Wywołanie robi revert przy dekodowaniu pustych danych zwrotnych",
        "Wywołanie udaje się tylko wtedy, gdy odbiorca jest na czarnej liście"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Circle Mint księguje depozyty na Ethereum po 12 potwierdzeniach, a CCTP przed poświadczeniem spalenia czeka na finalność. Co wyjaśnia tę różnicę?",
      options: [
        "Spalenie cofnięte reorgiem po mincie zostawiłoby tokeny na dwóch łańcuchach",
        "CCTP działa głównie na rollupach, gdzie 12 bloków mija w kilka sekund",
        "Circle może cofać depozyty w Mint, więc ich głębokość mało się liczy",
        "Tag finalized jest niedostępny dla usług, które śledzą depozyty"
      ],
      answer: 0
    }
  ],
  "accounting-reconciliation": [
    {
      kind: "cause",
      question: "Dlaczego obie strony sprawdzenia salda na koniec okresu trzeba odczytać przy ustalonym numerze bloku, a nie przy latest?",
      options: [
        "latest przesuwa się między odczytami, więc opisują one dwie różne chwile",
        "latest jest serwowany z mempoolu, więc liczy wydatki w stanie pending",
        "latest wskazuje blok finalized, który jest o kilka minut za końcem okresu",
        "eth_getBalance odrzuca latest, gdy endpoint jest węzłem archiwalnym"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Adres, który dostaje wypłaty ze stakingu, jest uzgadniany na podstawie swoich transakcji i trace'ów, a mimo to rejestr kończy się poniżej eth_getBalance. Co najpewniej pominięto?",
      options: [
        "Base fee zwracane mu za każdym razem, gdy bloki nie były pełne",
        "Transfery wewnętrzne ukryte pod ramkami DELEGATECALL",
        "Zwroty gasu po jego własnych transakcjach zakończonych revertem",
        "Uznania w gwei wymienione w tablicy withdrawals każdego bloku"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym zalecane przez Lido księgowanie stETH różni się od sumowania eventów Transfer stETH?",
      options: [
        "Sumuje eventy Transfer, ale do każdego dodaje z powrotem 1 lub 2 wei",
        "Śledzi salda wstETH, które codziennie przechodzą rebase przy raporcie oracle",
        "Śledzi udziały, których codzienny rebase nie zmienia",
        "Śledzi codzienne raporty oracle, które emitują eventy Transfer"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Audytor pyta pełny węzeł o saldo ETH adresu w bloku zamknięcia poprzedniego kwartału. Co się dzieje?",
      options: [
        "Węzeł odpowiada 0x0, bo konta nie ma w tym starym stanie",
        "Węzeł odpowiada dzisiejszym saldem jako najbliższym stanem, jaki ma",
        "Węzeł odpowiada poprawnie, bo salda każdego bloku są zachowane",
        "Węzeł zwraca błąd, bo ten stan został już usunięty przez pruning"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Rejestr zgadza się z eth_getBalance na początku roku, a na jego końcu już nie. Jak sprawnie znaleźć pierwszy blok z rozbieżnością?",
      options: [
        "Zrobić trace każdego bloku z roku i porównać każdą zmianę salda",
        "Odczytać historię adresu jeszcze raz z API innego eksploratora",
        "Zrobić bisekcję zakresu, porównując rejestr i węzeł w każdym środku",
        "Zsumować logi Transfer z całego roku i porównać sumę z różnicą"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jaką opłatę płaci nadawca na OP Stack, której nie obejmuje mainnetowy wzór gasUsed razy effectiveGasPrice?",
      options: [
        "Opłatę za bloby, którą OP Stack nalicza każdej porządkowanej transakcji",
        "l1Fee z receiptu, za publikację danych transakcji",
        "Base fee, którego effectiveGasPrice na rollupach nie obejmuje",
        "Opłatę za wypłatę, pobieraną, gdy batch z blokiem rozlicza się na L1"
      ],
      answer: 1
    }
  ],
  "chain-analytics": [
    {
      kind: "scenario",
      question: "Pipeline dostaje blok i jego receipty z jednego backendu, a trace_block z innego za tym samym load balancerem, i hashe bloku się różnią. Co powinien zrobić?",
      options: [
        "Zatrzymać receipty i dołożyć trace'y w późniejszym przebiegu",
        "Odrzucić batch i pobierać go ponownie, aż hashe się zgodzą",
        "Zapisać dwie wersje i pozwolić, by następny parentHash wybrał jedną",
        "Przyjąć trace'y, bo trace_block czyta kanoniczny head"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co odróżnia to, co węzeł mówi o adresie, od oceny ryzyka, którą produkt compliance nadaje temu adresowi?",
      options: [
        "Węzeł podaje fakty, a ocena jest modelem zbudowanym na nich",
        "Węzeł podpisuje odpowiedź, a ocena nie ma żadnego podpisu",
        "Węzeł zwraca klastry, a ocena dotyczy jednego adresu",
        "Węzeł aktualizuje się codziennie, a ocena śledzi każdy blok"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co zwraca onchainowa wyrocznia sankcyjna Chainalysis dla adresu wpisanego na listę po jej ostatniej aktualizacji?",
      options: [
        "Robi revert, bo kontrakt został usunięty z łańcucha",
        "Zwraca true, bo nieznane adresy są domyślnie oznaczane",
        "Zwraca false, bo jej lista nie jest już utrzymywana",
        "Przekazuje zapytanie dalej do API Chainalysis do screeningu adresów"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Pipeline liczy jako transfer każdą ramkę trace'u, która przenosi value i sama nie ma błędu. Co to robi z grafem ekspozycji?",
      options: [
        "Usuwa każdy transfer wykonany przez kontrakty utworzone w tym bloku",
        "Scala klastry, gdy tylko dwie ramki mają wspólny hash transakcji",
        "Ukrywa każdy transfer, którego value odziedziczył DELEGATECALL",
        "Dodaje hopy za ramki, których rodzic zrobił revert i nic nie przeniósł"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Zespół potrzebuje receiptów sprzed Merge do pełnego backfillu i chce uniknąć milionów wywołań RPC. Które źródło dostarcza je w weryfikowalnych paczkach?",
      options: [
        "Pliki era warstwy konsensusu, które zawierają execution payloady po Merge",
        "Pliki era1 z blokami i receiptami, po 8192 bloki w każdym",
        "Bloki Firehose w trybie base-detail streamowane ze zwykłego Getha",
        "Eksport surowej tabeli ethereum.traces z hurtowni Dune"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego pipeline analityczny sprawdza dla każdego bloku, czy receiptów jest tyle co transakcji, nawet gdy już wie, że blok istnieje?",
      options: [
        "Receipty są generowane od nowa przy każdym żądaniu, więc ich liczba się zmienia",
        "Bloki poniżej finalized wciąż mogą zmienić liczbę transakcji",
        "Providerzy celowo zwracają tylko próbkę receiptów, żeby zmieścić się w limitach",
        "Logi albo trace'y mogą przyjść obcięte, nawet gdy sam blok istnieje"
      ],
      answer: 3
    }
  ],
  "address-history": [
    {
      kind: "detail",
      question: "Gdzie widać aktywność smart konta ERC-4337, gdy zapytanie txlist o to konto wraca puste?",
      options: [
        "W puli bundlera, którą węzły archiwalne przechowują na stałe",
        "W tablicy withdrawals każdego bloku, który zawierał jego bundle",
        "W eth_getTransactionCount, które liczy każdą jego operację",
        "W logach UserOperationEvent kontraktu EntryPoint, jako sender"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Indekser pyta eth_getLogs o eventy Transfer z adresem w topics[1] i nazywa wynik historią tokenów tego adresu. Czego brakuje?",
      options: [
        "Każdego transferu, który adres otrzymał, bo ten jest w topics[2]",
        "Każdego transferu od kontraktów, bo ten jest w polu data",
        "Każdego transferu sprzed dodania logs bloom do nagłówków bloków",
        "Każdego transferu powyżej 10 000 tokenów, bo providerzy je wycinają"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego żadna standardowa metoda JSON-RPC nie zwraca wszystkich transakcji adresu?",
      options: [
        "Pełne węzły usuwają historię adresów starszą niż ostatnie 128 bloków",
        "Logs bloom zapisuje nadawców, ale tylko dla najnowszych bloków",
        "Węzły wyszukują bloki i transakcje wyłącznie po numerze i hashu",
        "Historia adresów jest tylko w bazie danych klienta konsensusu"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym trace_filter w Erigonie różni się od tego w Reth i Besu?",
      options: [
        "Erigon wykonuje każdy blok ponownie, a Reth i Besu szukają trafień w indeksach",
        "Erigon szuka trafień w indeksach, a Reth i Besu wykonują każdy blok ponownie",
        "Erigon nie ma limitu zakresu, a Reth i Besu odrzucają zakresy ponad domyślny",
        "Erigon zwraca zagnieżdżone drzewa wywołań, a Reth i Besu płaskie listy"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Konto podpisuje autoryzację EIP-7702, którą w jego imieniu wysyła sponsor. Co to zmienia w sprawdzaniu kompletności opartym na nonce?",
      options: [
        "Nonce rośnie, choć konto nie wysłało żadnej transakcji",
        "Nonce przestaje rosnąć, bo konto ma już teraz kod",
        "Nonce spada o jeden, gdy delegacja zostanie później usunięta",
        "Nonce zostaje skopiowany do sponsora, który wysłał transakcję"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Portfel pokazuje historię zbudowaną z logów, w której jest transfer USDC o zerowej wartości na adres zgodny w pierwszych i ostatnich znakach z adresem, na który użytkownik zwykle płaci. Co to jest?",
      options: [
        "Nieudana płatność, którą portfel ponowi z wyższą opłatą",
        "Sprawdzenie allowance, które każdy transferFrom w USDC emituje najpierw",
        "Spam typu address poisoning, z którego nie wolno kopiować adresu",
        "Płatność usunięta przez reorg, której log nie ma jeszcze flagi removed"
      ],
      answer: 2
    }
  ],
  "portfolio-tracker": [
    {
      kind: "scenario",
      question: "Portfel ustala salda, wywołując balanceOf dla każdego kontraktu z wyselekcjonowanej listy tokenów. Użytkownik dostaje token, którego nie ma na liście. Co portfel pokaże dla tego tokena?",
      options: [
        "Nowe saldo, bo balanceOf trafia do każdego kontraktu tokena",
        "Nic, bo wykrywanie nigdy nie dodało tego kontraktu do listy",
        "Nowe saldo, gdy tylko jego log Transfer osiągnie finalność",
        "Błąd, bo token spoza listy nie ma wartości decimals"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym odczyt 300 sald przez aggregate3 z Multicall3 różni się od wysłania ich jako batch JSON-RPC?",
      options: [
        "Zwraca zdekodowane kwoty tokenów zamiast surowych 32-bajtowych słów",
        "Uruchamia wszystkie odczyty w jednym wykonaniu, na jednym bloku",
        "Omija limit gasu węzła, bo każdy odczyt to funkcja view",
        "Pozwala każdemu odczytowi wybrać własny numer bloku w wywołaniu"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego żadne pojedyncze standardowe wywołanie JSON-RPC nie zwróci wszystkich tokenów, które ma adres?",
      options: [
        "Providerzy wyłączają taką metodę, bo jej odpowiedzi są zbyt duże",
        "Salda tokenów leżą w receiptach, które węzły po czasie usuwają",
        "Trie stanu hashuje każdy klucz, co blokuje wyszukiwanie po posiadaczu",
        "Każde saldo leży w storage kontraktu swojego tokena, pod posiadaczem"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Tracker pakuje wszystkie 2000 kandydujących tokenów dużego posiadacza w jedno wywołanie aggregate3. Jaki będzie najpewniej wynik?",
      options: [
        "Wywołanie przekroczy limit gasu węzła dla eth_call i padnie w całości",
        "Węzeł podzieli wywołanie na mniejsze batche i zwróci je po kolei",
        "Multicall3 po cichu pominie odczyty, które przekroczyłyby limit",
        "Provider policzy to jako jedno żądanie i zwróci wszystkie salda"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co kontrakt BalanceChecker zwraca dla adresu tokena, pod którym nie ma kodu?",
      options: [
        "Revert, który przerywa całe wywołanie balances dla wszystkich tokenów",
        "Saldo etheru posiadacza w miejsce salda brakującego tokena",
        "Zero, czyli to samo słowo, które daje naprawdę puste saldo",
        "Największą wartość uint256, używaną jako jawny znacznik błędu"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Zespół planuje 90-dniowe wykresy wartości netto zbudowane wyłącznie na alchemy_getTokenBalances. Co pójdzie nie tak?",
      options: [
        "Metoda trzyma 30 dni historii, więc starsze punkty wracają puste",
        "Metoda odpowiada w dolarach, więc ceny zostają policzone dwa razy",
        "Metoda nie przyjmuje parametru bloku, więc zwraca tylko stan bieżący",
        "Metoda czyta bloki finalized, więc ostatnie dni zawsze są w tyle"
      ],
      answer: 2
    }
  ],
  "airdrop-rewards": [
    {
      kind: "scenario",
      question: "Backfill airdropu dostaje pusty wynik eth_getLogs dla zakresu bloków z 2021 roku. Co pipeline powinien potwierdzić, zanim zapisze brak aktywności?",
      options: [
        "Że zakres był sfinalizowany, zanim zażądano logów",
        "Że endpoint nadal ma receipty dla tego zakresu bloków",
        "Że token emitował eventy Approval w tym samym zakresie",
        "Że hashe bloków nie zmieniły się od czasu snapshotu"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Dlaczego StandardMerkleTree od OpenZeppelin hashuje każdy liść dwa razy?",
      options: [
        "Żeby root mieścił się w jednym slocie storage na każdym łańcuchu",
        "Żeby node wewnętrzny nigdy nie mógł zostać podany jako liść",
        "Żeby dowody działały przy dowolnej kolejności dwóch sąsiadów",
        "Żeby jeden adres mógł wystąpić w kilku osobnych liściach"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Kampania nagradza płynność w zakresie. Pozycja obejmuje ticki od -60 do 60, a tick puli przez dwa dni stoi na 90. Co pozycja zarabia w te dni?",
      options: [
        "Swój zwykły udział, bo cała wpłacona płynność liczy się tak samo",
        "Połowę udziału, bo jeden z jej dwóch tokenów nadal jest wpłacony",
        "Nic, bo jej płynność jest nieaktywna, gdy jest poza zakresem",
        "Podwójny udział, bo w te dni o nagrody walczy mniej pozycji"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Użytkownik odbiera nagrody z Merkla z dowodem z drzewa opublikowanego 30 minut temu. Co się stanie?",
      options: [
        "Claim się uda, bo opublikowany root obowiązuje od tego samego bloku",
        "Wypłaci połowę, bo okres sporu dzieli nowe nagrody",
        "Trafi do kolejki, a kontrakt wypłaci po końcu okresu sporu",
        "Zrobi revert, bo getMerkleRoot nadal zwraca stary root"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym liść w Distributorze Merkla różni się od liścia w MerkleDistributor od Uniswapa?",
      options: [
        "Zawiera indeks, a claim ustawia jeden bit w bitmapie",
        "Zawiera kwotę za jedną epokę, a claim ją zeruje",
        "Zawiera podpis, a claim odzyskuje z niego adres użytkownika",
        "Zawiera sumę narastającą, a claim wypłaca różnicę"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego Merkl porównuje sumy wyliczone z eventów z odczytami on-chain, takimi jak totalDebt?",
      options: [
        "Stan może się zmienić bez logu, więc same eventy mogą się rozjechać",
        "Eventy są usuwane wcześniej niż stan, więc odczyty wypełniają luki",
        "Odczyty kosztują mniej niż logi, więc zastępują większość skanów",
        "Eventów nie da się filtrować po użytkowniku, więc odczyty przypisują kwoty"
      ],
      answer: 0
    }
  ]
};
