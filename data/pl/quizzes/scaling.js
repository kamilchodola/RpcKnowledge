// Polish checkpoint questions for the Layer 2 & scaling lessons, keyed by topic id. Each topic's
// six questions match data/quizzes/scaling.js in order, kind, and answer position.
export const quizzes = {
  rollup: [
    {
      kind: "contrast",
      question: "Co odróżnia rollup od sidechaina, który też działa na EVM i od czasu do czasu publikuje checkpointy na Ethereum?",
      options: [
        "Publikuje dane na Ethereum, a błędny commitment stanu można odrzucić na L1",
        "Ma własny zbiór walidatorów, który musi podpisać każdy checkpoint, zanim L1 go przyjmie",
        "Trzyma dane batchy u komitetu, którego członkowie poświadczają ich dostępność na Ethereum",
        "Produkuje bloki według 12-sekundowych slotów Ethereum i używa chain ID z L1"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego opłaty za transakcje na L2 spadły mniej więcej o rząd wielkości po aktualizacji Dencun w marcu 2024 roku?",
      options: [
        "Rollupy przestały publikować dane batchy na L1 i publikują już tylko state rooty",
        "Batche przeniesiono z calldata do blobów, które mają własny, tańszy rynek opłat",
        "Na L1 obniżono koszt calldata wysyłanego z zarejestrowanych adresów batcherów",
        "Validity proofy zastąpiły fraud proofy, więc odpadł koszt rozgrywania sporów"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Który proces w łańcuchu na OP Stack pełni rolę, jaką na L1 pełni klient konsensusu?",
      options: [
        "op-geth, który wyprowadza łańcuch z batchy z L1 i wykonuje też jego bloki",
        "Batcher, który kompresuje bloki L2, publikuje je na L1 i podpisuje każdy nowy head",
        "op-node, który wyprowadza łańcuch L2 z danych L1 i steruje klientem wykonawczym",
        "Proposer, który zgłasza output rooty na L1 i finalizuje każdy blok L2"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Skrypt łączy się z nieznanym adresem RPC i każda metoda eth_, którą wywołuje, odpowiada normalnie. Jak sprawdzić, że trafił do OP Mainnet, a nie do Ethereum L1?",
      options: [
        "Sprawdzić, czy eth_getBlockByNumber zwraca bloki z polem l1Fee",
        "Porównać eth_blockNumber ze znaną wysokością L1, żeby zobaczyć, który łańcuch śledzi",
        "Poszukać metod z prefiksem optimism_ na tym samym endpoincie",
        "Wywołać eth_chainId i sprawdzić, czy wynik to 0xa, czyli 10"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Serwis płatności dopisuje środki użytkownikom w chwili, gdy sekwencer L2 zwróci receipt. Na jakie ryzyko się przez to wystawia?",
      options: [
        "Polega na słowie jednego operatora, bo blok nie ma jeszcze batcha ani commitmentu na L1",
        "Jest narażony tylko wtedy, gdy samo L1 zrobi reorg bloku, na który powołał się sekwencer",
        "Polega na validity proofie, który sekwencer dołącza do każdego rozgłaszanego bloku",
        "Jest narażony tylko na walidatorów L2, którzy mogą odrzucić blok w ciągu jednej epoki"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "W Arbitrum kontrakt odczytuje block.number, a skrypt w tej samej chwili wywołuje eth_blockNumber; wartości różnią się o miliony. Dlaczego?",
      options: [
        "block.number zostaje w tyle, bo odczytuje rodzica bloku, który jest jeszcze budowany",
        "eth_blockNumber liczy tylko batche opublikowane na L1, a block.number bloki L2",
        "block.number zwraca przybliżony numer bloku L1, a eth_blockNumber numer L2",
        "Replika odpowiadająca na eth_blockNumber jest o tyle bloków za sekwencerem"
      ],
      answer: 2
    }
  ],
  "optimistic-rollup": [
    {
      kind: "detail",
      question: "Ile fraud proofów optimistic rollup uruchamia na L1 w normalnym działaniu, gdy nikt niczego nie kwestionuje?",
      options: [
        "Jeden na każdy blok L2, sprawdzany przed przyjęciem outputu tego bloku",
        "Jeden na każdy batch publikowany przez batchera, weryfikowany razem z danymi",
        "Żadnego; dowód rozgrywa się tylko wtedy, gdy ktoś zakwestionuje commitment",
        "Jeden na epokę L1, uruchamiany przez proposera według stałego harmonogramu"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Do czego odnosi się tag bloku safe w łańcuchu na OP Stack?",
      options: [
        "Do najnowszego bloku L2, który sekwencer wyprodukował i rozgłosił",
        "Do headu L2 wyprowadzonego z danych batchy już opublikowanych na L1",
        "Do bloku L2, którego numer odpowiada numerowi bloku safe na L1",
        "Do ostatniego bloku L2, którego challenge window już się zamknęło"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym architektura węzła w łańcuchu na OP Stack różni się od architektury Arbitrum Nitro?",
      options: [
        "Każdy z nich używa op-node do wyprowadzania łańcucha, z innym klientem wykonawczym",
        "Nitro weryfikuje validity proof dla każdego batcha, a OP Stack czeka na koniec okna",
        "OP Stack tworzy bloki tylko przy nowych transakcjach, a Nitro co 2 sekundy",
        "OP Stack oddziela wyprowadzanie od wykonania, a Nitro łączy je w jednym procesie"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Użytkownik przenosi ETH z L1 do łańcucha na OP Stack przez kanoniczny bridge, a ktoś z zespołu ostrzega, że potrwa to tydzień. Czego należy się spodziewać?",
      options: [
        "Środki dotrą w ciągu minut; na challenge window czekają tylko wypłaty",
        "Potrwa to pełne siedem dni, tak samo jak wypłata przez bridge",
        "Środki dotrą, gdy proposer opublikuje obejmujący je output root, po około godzinie",
        "Środki dotrą dopiero po weryfikacji na L1 kolejnego validity proofa dla batcha"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego challenge window w OP Stack trwa około siedmiu dni, a nie kilka godzin?",
      options: [
        "Proposer potrzebuje mniej więcej tyle czasu, żeby wygenerować dowód dla każdego output rootu",
        "Uczciwy challenger musi zdążyć zareagować, nawet gdy L1 przez pewien czas go cenzuruje",
        "L1 potrzebuje siedmiu dni, żeby sfinalizować bloki z danymi batchy",
        "Dane blobów dla batcha można pobrać z L1 dokładnie przez tyle czasu"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Co optymistyczne założenie, że commitmenty są przyjmowane bez dowodu, zmienia w odczytach takich jak eth_call na L2?",
      options: [
        "Odczyty zwracają wartości tymczasowe, które stają się ostateczne dopiero po oknie",
        "Odczyty są odrzucane dla bloków nowszych niż ostatni opublikowany output root",
        "Odczyty obsługują kontrakty na L1, które ponownie wykonują opublikowane batche",
        "Nic: własne węzły L2 wykonują transakcje normalnie i odpowiadają z prawdziwego stanu"
      ],
      answer: 3
    }
  ],
  "zk-rollup": [
    {
      kind: "detail",
      question: "Co sprawdza kontrakt weryfikujący na L1, gdy ZK rollup przesyła batch?",
      options: [
        "Że żaden challenger nie zakwestionował batcha w siedmiodniowym oknie",
        "Zwięzły dowód, że batch przeprowadza stary state root w nowy",
        "Że podpis sekwencera pod batchem pasuje do zarejestrowanego klucza",
        "Że każda transakcja z batcha daje ten sam receipt po ponownym wykonaniu na L1"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego transakcja w ZK rollupie może wyglądać dla użytkownika na przyjętą długo przed tym, zanim jej ostateczność da się udowodnić?",
      options: [
        "Dowód jest najpierw sprawdzany off-chain, a na L1 tylko archiwizowany",
        "Finalność L1 trwa siedem dni w łańcuchach rozliczanych validity proofami",
        "Receipt jest wydawany, zanim sekwencer faktycznie wykona transakcję",
        "Sekwencer przyjmuje ją od razu; commit, dowód i weryfikacja L1 są później"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Zespół kieruje bibliotekę klienta Ethereum na endpoint Starknet i każde wywołanie kończy się błędem. Co to wyjaśnia?",
      options: [
        "Starknet nie jest łańcuchem EVM i udostępnia metody starknet_, a nie eth_",
        "Starknet wymaga prefiksu zks_ przed nazwą każdej obsługiwanej metody eth_",
        "Starknet przyjmuje wywołania eth_ tylko przez WebSocket, nigdy przez HTTP",
        "Starknet obsługuje metody eth_ tylko dla batchy ze zweryfikowanym dowodem"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Klient RPC w łańcuchu ZK czyta tag finalized i oczekuje, że będzie on mniej więcej dwie epoki L1 za latest. Co może zobaczyć zamiast tego?",
      options: [
        "Jest równy latest, bo po validity proofie nie ma już czego finalizować",
        "Jest opóźniony dokładnie o siedem dni, czyli długość challenge window",
        "Może być opóźniony dużo bardziej, bo śledzi ostatni batch udowodniony na L1",
        "Zwraca błąd, bo łańcuchy ZK nie definiują tagu finalized"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "W zkSync Era potrzebne są transakcje commit i prove na L1 dla danego batcha. Która metoda je zwraca?",
      options: ["zks_L1BatchNumber", "zks_getL1BatchDetails", "optimism_outputAtBlock", "eth_getTransactionReceipt"],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego model zaufania większości ZK rollupów uczciwie opisuje się jako dowód plus governance?",
      options: [
        "Ich dowody są sprawdzane w głosowaniu governance, zanim nowy stan zostanie przyjęty",
        "Ich sekwencera wybierają posiadacze tokenów, którzy mogą go w każdej chwili wymienić",
        "Ich kontrakt weryfikujący na L1 może zaktualizować multisig albo security council",
        "Ich batche wymagają do rozliczenia podpisów komitetu dostępności danych"
      ],
      answer: 2
    }
  ],
  "fraud-proof": [
    {
      kind: "cause",
      question: "Dlaczego fraud proof dzieli sporny zakres przez bisekcję, zamiast ponownie wykonać cały batch na L1?",
      options: [
        "Żeby każdą połowę zakresu opublikować w osobnym blobie do odczytu na L1",
        "Żeby L1 wykonało tylko jedną instrukcję, tę, w której twierdzenia się rozchodzą",
        "Bo bisekcja to sposób, w jaki wylicza się state root batcha",
        "Bo challenger ma w danej chwili tylko część danych batcha"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co ustala udany fraud proof przeciwko opublikowanemu commitmentowi?",
      options: [
        "Że sekwencer ocenzurował konkretną transakcję w tym zakresie",
        "Że dane batcha stojące za commitmentem nigdy nie trafiły na L1",
        "Że state root zaproponowany przez challengera jest poprawny w każdym polu",
        "Że zgłoszony state root nie wynika z uzgodnionych danych wejściowych"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego przed sfinalizowaniem kanonicznej wypłaty z optimistic rollupu musi minąć challenge window?",
      options: [
        "Commitment, względem którego dowodzi się wypłaty, do tego czasu jest tymczasowy",
        "Bridge na L1 potrzebuje tyle czasu, żeby zebrać dość atestacji od walidatorów",
        "Prover potrzebuje tyle czasu, żeby wygenerować validity proof dla batcha",
        "Każdy węzeł L2 musi ponownie wykonać wypłatę, zanim L1 ją zwolni"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator publikuje błędny state root i zataja stojące za nim dane batcha. Co dzieje się z potencjalnym challengerem?",
      options: [
        "Wygrywa automatycznie, bo brak danych liczy się jako dowód oszustwa",
        "Musi czekać, aż dane się pojawią, a okno jest do tego czasu wstrzymane",
        "Nie wyliczy poprawnego twierdzenia, więc nie ma z czym wejść w spór",
        "Kwestionuje root za pomocą trace wykonania z debug_traceBlock"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Gdy spór w OP Stack zawęzi się do jednej instrukcji, co wykonuje tę instrukcję na L1?",
      options: [
        "BoLD, on-chainowy interpreter WASM",
        "Cannon, on-chainowy interpreter MIPS",
        "Samo EVM, które bezpośrednio uruchamia bytecode L2",
        "op-node, który odtwarza batch przez preimage oracle"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Narzędzie monitorujące ma ustalić, czy ktoś otworzył spór przeciwko niedawnemu output rootowi w OP Stack. Gdzie powinno sprawdzić?",
      options: [
        "W optimism_syncStatus na op-node, który podaje każdy otwarty spór",
        "W debug_traceTransaction na bloku L2, który obejmuje ten root",
        "W eth_getLogs na kontraktach dispute game na L1",
        "W eth_getProof na L2 przy numerze spornego bloku"
      ],
      answer: 2
    }
  ],
  "validity-proof": [
    {
      kind: "detail",
      question: "Jak zmienia się koszt gasu na L1 za weryfikację validity proofa, gdy rośnie batch, który ten dowód obejmuje?",
      options: [
        "Rośnie liniowo wraz z liczbą transakcji",
        "Pozostaje prawie stały bez względu na liczbę transakcji",
        "Rośnie z pierwiastkiem kwadratowym z liczby transakcji",
        "Spada do zera, bo weryfikacja odbywa się off-chain"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Każdy dowód wysłany przez łańcuch ZK przechodzi weryfikację na L1, a mimo to użytkownicy nie mogą zbudować własnych dowodów wypłaty. Czego dowody nie objęły?",
      options: [
        "Tego, czy każda transakcja była zgodna z funkcją przejścia stanu",
        "Tego, czy nowy state root wynika z poprzedniego state root",
        "Tego, czy dane stojące za każdym batchem zostały naprawdę opublikowane",
        "Tego, czy publiczne dane wejściowe zgadzają się z tymi, które dostał weryfikator"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego rollup z validity proofami może sfinalizować kanoniczną wypłatę w ciągu godzin, a nie tygodnia?",
      options: [
        "Jego sekwencer wpłaca kaucję, którą L1 może natychmiast odebrać, jeśli skłamie",
        "Jego wypłaty omijają kanoniczne kontrakty bridge na L1 i ich opóźnienia",
        "Stan jest udowodniony, zanim L1 go przyjmie, więc nie ma żadnego okna",
        "L1 finalizuje bloki z validity proofami w mniejszej liczbie epok"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co odróżnia systemy dowodowe oparte na STARK-ach od rodzin SNARK?",
      options: [
        "Mniejsze dowody o stałym rozmiarze, za cenę setupu specyficznego dla obwodu",
        "Brak trusted setupu i tylko założenia o hashach, za cenę większych dowodów",
        "Dowody sprawdzane off-chain przez komitet, więc weryfikacja na L1 odpada",
        "Interaktywna bisekcja na L1, więc dowód powstaje tylko przy challenge'u"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego tabela kosztów gasu w zkEVM, a czasem też zachowanie opcode'ów, może odbiegać od Ethereum L1?",
      options: [
        "zkEVM-y kompilują kontrakty do Cairo, które inaczej wycenia każdy opcode",
        "Validity proofy wymagają, by każdy opcode kosztował tyle samo gasu",
        "Keccak-256, arytmetyka 256-bitowa i trie stanu są drogie w dowodzeniu",
        "Kontrakt weryfikujący pobiera gas na L1 za każdy opcode w batchu"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Użytkownik przenosi się na ZK rollup, licząc, że zero knowledge zapewni prywatność jego transakcji. Co zastanie?",
      options: [
        "Kwoty są ukryte, ale adresy nadawcy i odbiorcy są publiczne",
        "Dane są publikowane w całości; dowód służy zwięzłości",
        "Transakcje pozostają prywatne, dopóki dowód batcha nie zostanie zweryfikowany na L1",
        "Treść transakcji widzą tylko sekwencer i prover"
      ],
      answer: 1
    }
  ],
  sequencer: [
    {
      kind: "scenario",
      question: "Wysyłasz transakcję do sekwencera L2, dostajesz hash, a potem odpytujesz publiczną replikę o receipt i dostajesz null. Jaka jest prawdopodobna przyczyna?",
      options: [
        "Sekwencer odrzucił transakcję, więc zwrócony hash jest nieważny",
        "Receipty L2 są udostępniane dopiero, gdy batch z nimi trafi na L1",
        "Replika nie dostała jeszcze od sekwencera bloku z tą transakcją",
        "Replika zwraca receipty tylko dla bloków objętych tagiem finalized"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Sekwencer L2 uparcie odrzuca transakcję użytkownika. Jak użytkownik może mimo to doprowadzić do jej włączenia?",
      options: [
        "Rozgłosić ją w sieci peer-to-peer L2, żeby włączyły ją repliki",
        "Wysłać ją przez portal lub delayed inbox na L1, co wymusza włączenie",
        "Wysyłać ją ponownie z wyższym priority fee, aż sekwencer ją przyjmie",
        "Otworzyć spór w kontrakcie fault proof o pominiętą transakcję"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego subskrypcje newPendingTransactions na większości rollupów nie zwracają prawie nic?",
      options: [
        "Klienci wykonawczy L2 nie implementują eth_subscribe przez WebSocket",
        "Transakcje pending czekają w inboksie na L1 do publikacji następnego batcha",
        "Bloki L2 pojawiają się zbyt szybko, by jakakolwiek transakcja była widoczna jako pending",
        "Sekwencer trzyma kolejkę prywatnie, zamiast rozgłaszać mempool"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Jedyny sekwencer produkcyjnego rollupa staje i przez godzinę się nie uruchamia. Co dzieje się w tym czasie?",
      options: [
        "Repliki w ciągu epoki wybierają spośród siebie nowy sekwencer",
        "Nowe bloki nie powstają, ale odczyty działają, a salda są nietknięte",
        "Łańcuch działa dalej, a jego bloki budują proposerzy L1",
        "Salda cofają się do ostatniego commitmentu stanu opublikowanego na L1"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Jak często sekwencer OP Stack produkuje blok L2?",
      options: [
        "Co 2 sekundy, nawet gdy nie ma czego włączyć",
        "Tylko gdy przyjdzie transakcja, nawet co 250 ms",
        "Co 12 sekund, zgodnie z harmonogramem slotów L1",
        "Raz na batch, za każdym razem, gdy batcher publikuje na L1"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym na publicznym endpoincie L2 różni się obsługa eth_sendRawTransaction od obsługi eth_call?",
      options: [
        "Transakcję włącza sam, a wywołanie przekazuje do sekwencera",
        "Transakcję przekazuje do sekwencera, a na wywołanie odpowiada sam",
        "Jedno i drugie wysyła do sekwencera, bo repliki nie mają stanu do wykonania",
        "Transakcję publikuje bezpośrednio na L1, a wywołanie obsługuje ze stanu L1"
      ],
      answer: 1
    }
  ],
  "l2-rpc": [
    {
      kind: "detail",
      question: "Co w łańcuchu OP Stack wyznacza blok, na który wskazuje tag finalized?",
      options: [
        "Najnowszy blok L2, który sekwencer podpisał i rozgłosił",
        "Blok L2, który sekwencer oznacza jako finalized po upływie 64 bloków",
        "Head L2 odtworzony z danych L1, które samo L1 sfinalizowało",
        "Ostatni blok L2, którego okno fraud proof już się zamknęło"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym różni się eth_estimateGas w łańcuchu OP Stack od tego samego wywołania na Arbitrum?",
      options: [
        "W OP Stack wlicza opłatę za dane L1, a na Arbitrum obejmuje tylko wykonanie na L2",
        "W OP Stack obejmuje tylko wykonanie na L2, a na Arbitrum wlicza część L1",
        "W OP Stack zwraca kwotę w wei, a na Arbitrum liczbę jednostek gasu",
        "W każdej z tych sieci obejmuje tylko wykonanie na L2; część L1 pobiera później bridge"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Twój dekoder rzuca wyjątkiem na transakcji OP Stack typu 0x7e, która nie ma podpisu, a ma pola sourceHash i mint. Co to za transakcja?",
      options: [
        "Transakcja z blobem, której sidecar usunięto przed zwróceniem",
        "Depozyt, wstawiony przez derivation pipeline na podstawie eventu na L1",
        "Błędnie zbudowana transakcja, której sekwencer nie powinien był włączyć",
        "Transakcja set code z EIP-7702, najnowszy typ na mainnecie"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Przed wysłaniem transakcji w łańcuchu OP Stack portfel chce poznać opłatę za dane L1, żeby dodać ją do oszacowania. Co wywołuje przez eth_call?",
      options: [
        "Pseudokontrakt NodeInterface pod 0xC8, przekazując niepodpisaną transakcję",
        "Predeploy L2ToL1MessagePasser, przekazując podpisane bajty transakcji",
        "Kontrakt OptimismPortal na L1, przekazując calldata transakcji",
        "getL1Fee predeploya GasPriceOracle, przekazując serializowaną transakcję"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Health check alarmuje, gdy blok finalized nie przesunie się przez dwie minuty. Co się stanie po skierowaniu go na łańcuch OP Stack?",
      options: [
        "Nigdy nie zaalarmuje, bo finalized przesuwa się z każdym 2-sekundowym blokiem L2",
        "Będzie alarmował regularnie, bo finalized przesuwa się skokowo, zależnie od L1 i batchy",
        "Zaalarmuje tylko podczas reorgów L1, bo tylko one go zatrzymują",
        "Zaalarmuje tylko wtedy, gdy sekwencer stanie, bo finalized podąża za head"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego indekser, który przenosi na Arbitrum zakresy bloków i interwał odpytywania z L1, zostaje w tyle i trafia na limity providera?",
      options: [
        "Logi L2 są indeksowane dopiero, gdy batch z nimi trafi na L1",
        "Węzły L2 obsługują eth_getLogs tylko dla sfinalizowanej części łańcucha",
        "Bloki L2 są dużo częstsze, więc każda godzina obejmuje znacznie więcej bloków",
        "Receipty L2 pomijają logi, chyba że wywołujący poprosi też o dane l1Fee"
      ],
      answer: 2
    }
  ],
  bridge: [
    {
      kind: "cause",
      question: "Dlaczego depozyt z L1 może dotrzeć na L2, nawet jeśli sekwencer chce go ocenzurować?",
      options: [
        "Depozyt jest rozgłaszany przez sieć peer-to-peer L2 do każdego węzła",
        "Derivation pipeline każdego węzła czyta event z L1 i musi go uwzględnić",
        "Kontrakt bridge na L1 wywołuje endpoint RPC sekwencera i przesyła depozyt",
        "Depozyty mają wyższe priority fee niż każda zwykła transakcja na L2"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Użytkownik potrzebuje danych, którymi udowodni na L1 wypłatę z OP Stack. Które wywołanie RPC je zwraca?",
      options: [
        "eth_getTransactionReceipt na L2, dla logu wyemitowanego przez wypłatę",
        "debug_traceTransaction na L2, dla wewnętrznych wywołań wypłaty",
        "eth_getProof na L2, dla slotu wiadomości w L2ToL1MessagePasser",
        "eth_getLogs na L1, dla eventu portalu, który zapisał wypłatę"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Dlaczego kanoniczna wypłata trwa około tygodnia w optimistic rollupie, a w ZK rollupie kilka godzin?",
      options: [
        "ZK rollupy pomijają kontrakty bridge na L1 i wypłacają środki bezpośrednio",
        "Optimistic rollupy czekają na koniec okna challenge, a ZK rollupy na dowód",
        "Optimistic rollupy publikują dane wypłat na L1 w batchu tylko raz w tygodniu",
        "Bloki L1 z dowodami łańcuchów ZK są szybciej finalizowane"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Ile transakcji na L1 potrzeba jeszcze po tym, jak użytkownik zainicjuje na L2 kanoniczną wypłatę z OP Stack?",
      options: [
        "Jedna: portal wypłaca, gdy tylko output root zostanie opublikowany",
        "Dwie: jedna, by ją udowodnić, i jedna, by ją sfinalizować po oknie",
        "Żadna: proposer sam przekazuje wypłatę, gdy okno się skończy",
        "Trzy: dowód, challenge i finalizacja, w odstępach tygodniowych"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Użytkownik wysyła tokeny zwykłym transferem na adres kontraktu bridge, zamiast wywołać jego funkcję depozytu. Co się dzieje?",
      options: [
        "Derivation pipeline widzi transfer i mintuje tokeny na L2",
        "Bridge po upływie okna automatycznie zwraca tokeny nadawcy",
        "Sekwencer dopisuje tokeny na L2, gdy transfer zostanie sfinalizowany",
        "Bridge nic nie przenosi; zwykły transfer to nie wiadomość i zwykle przepada"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Użytkownik próbuje udowodnić na L1 wypłatę z OP Stack kilka minut po jej zainicjowaniu na L2 i dowód zostaje odrzucony. Dlaczego?",
      options: [
        "Przed złożeniem dowodu musi minąć siedmiodniowe okno",
        "Wypłatę trzeba najpierw sfinalizować, zanim da się ją udowodnić",
        "Na L1 nie opublikowano jeszcze output roota obejmującego ten blok L2",
        "Dowód trzeba zbudować dla bloku L1, a nie dla bloku L2"
      ],
      answer: 2
    }
  ],
  "data-availability": [
    {
      kind: "consequence",
      question: "Operator publikuje poprawny state root, ale nigdy nie publikuje transakcji, które za nim stoją. Co przestaje działać?",
      options: [
        "L1 odrzuca state root jako nieprawidłowy, bo brakuje danych wejściowych",
        "Dotyczy to tylko eksploratorów; użytkownicy wciąż mogą wyjść przez bridge",
        "Każdy węzeł automatycznie zatrzymuje łańcuch, gdy wykryje lukę",
        "Nikt inny nie wyliczy stanu ani nie zbuduje dowodów potrzebnych do wypłaty"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Co PeerDAS, wprowadzony w aktualizacji Fusaka, zmienia w tym, jak węzły obchodzą się z danymi blobów?",
      options: [
        "Dane blobów przechodzą z warstwy konsensusu do warstwy wykonawczej",
        "Każdy węzeł pobiera i przechowuje tylko część zakodowanych kolumn",
        "Czas przechowywania blobów rośnie z około 18 dni do bezterminowego",
        "Commitmenty KZG zostają zastąpione dowodami Merkle nad treścią każdego bloba"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Potrzebne są faktyczne bajty bloba, który rollup opublikował w zeszłym tygodniu. Skąd je pobrać?",
      options: [
        "Z eth_getTransactionByHash na kliencie wykonawczym, z pola input",
        "Z eth_getStorageAt na adresie batch inbox, na który publikuje rollup",
        "Z Beacon API klienta konsensusu, w okresie przechowywania",
        "Z samego versioned hasha, który zwięźle koduje bajty bloba"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co odróżnia łańcuch nazywany validium od łańcucha, który uchodzi za rollup?",
      options: [
        "Jego dane trzyma zewnętrzny komitet albo sieć, a nie Ethereum",
        "Publikuje dane na Ethereum, ale nie publikuje tam commitmentów stanu",
        "Rozlicza się validity proofami tam, gdzie rollup używa fraud proofów",
        "Trzyma dane batchy w calldata tam, gdzie rollup używa przestrzeni blobów"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego przestrzeń blobów wystarcza do zapewnienia dostępności danych rollupu, choć węzły usuwają bloby po około 18 dniach?",
      options: [
        "Kontrakty na L1 kopiują każdy blob do calldata, zanim zostanie usunięty",
        "Dane muszą przetrwać tylko tyle, by każdy mógł wyprowadzić łańcuch",
        "Versioned hash pozwala każdemu później odtworzyć treść bloba",
        "Po weryfikacji validity proofów dane przestają być potrzebne"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Węzeł, który wyprowadza łańcuch L2 z danych L1, wymaga oprócz endpointu wykonawczego także endpointu warstwy konsensusu. Dlaczego potrzebuje obu?",
      options: [
        "Endpoint konsensusu podpisuje każdy wyprowadzony blok L2 przed importem",
        "Eventy depozytów z L1 są widoczne tylko przez warstwę konsensusu",
        "Treść blobów pochodzi tylko z Beacon API, nie z żadnej metody eth_",
        "Endpoint wykonawczy nie potrafi podać, które bloki L1 są sfinalizowane"
      ],
      answer: 2
    }
  ],
  blob: [
    {
      kind: "detail",
      question: "Do czego z bloba dołączonego do wykonywanej transakcji EVM ma faktycznie dostęp?",
      options: [
        "Do całych 128 KiB zawartości, czytanych tak samo jak calldata",
        "Do korzenia Merkle jego 4096 elementów ciała, podanego w polu nagłówka",
        "Do versioned hasha przez BLOBHASH i dowodów punktów w precompile 0x0a",
        "Do niczego; kontrakty nie mogą w żaden sposób odwołać się do bloba"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Które dwa pola nagłówka bloku sterują rynkiem opłat za bloby?",
      options: [
        "baseFeePerGas i gasUsed",
        "blobGasUsed i excessBlobGas",
        "blobGasPrice i maxFeePerBlobGas",
        "blobVersionedHashes i requestsHash"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Serwis musi ponownie wyprowadzić historię rollupu sprzed dwóch lat. Dlaczego nie może po prostu pobrać blobów z węzła?",
      options: [
        "Węzły przekodowują bloby starsze niż rok do calldata",
        "Versioned hashe są usuwane z łańcucha wykonawczego po roku",
        "Beacon API nie udostępnia blobów należących do sfinalizowanych bloków",
        "Sidecary blobów są trzymane przez około 4096 epok, czyli mniej więcej 18 dni"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Batcher podpisuje transakcję typu 0x3 i wysyła jej zwykłe podpisane kodowanie przez eth_sendRawTransaction. Dlaczego zostaje odrzucona?",
      options: [
        "Transakcje blobowe wysyła się do Beacon API, a nie przez eth_sendRawTransaction",
        "Węzeł oczekuje formy sieciowej z blobami, commitmentami i dowodami",
        "Transakcję typu 0x3 trzeba zamiast tego wysłać przez eth_sendTransaction",
        "Węzeł wymaga, by maxFeePerBlobGas było równe bieżącej base fee blobów"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Kontrakt ma zostać wdrożony transakcją typu 0x3 z dołączonymi blobami. Co się stanie?",
      options: [
        "Kontrakt zostanie wdrożony, a jego kod trafi do dołączonych blobów",
        "Transakcja jest nieprawidłowa, bo transakcja blobowa musi mieć adres to",
        "Kontrakt zostanie wdrożony, ale nie będzie mógł czytać wysłanych z nim blobów",
        "Transakcja jest nieprawidłowa, bo bloby mogą wysyłać tylko batchery rollupów"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym los commitmentu bloba różni się od losu jego danych?",
      options: [
        "Jedno i drugie zostaje na zawsze, ale dane przechodzą z beacon node'ów do archiwum",
        "Dane zostają na zawsze w bloku wykonawczym, a commitment jest usuwany",
        "Jedno i drugie jest usuwane po około 18 dniach, razem z samą transakcją",
        "Commitment zostaje w łańcuchu na zawsze, a dane znikają po około 18 dniach"
      ],
      answer: 3
    }
  ],
  predeploys: [
    {
      kind: "scenario",
      question: "Portfel w łańcuchu OP Stack pokazuje użytkownikom limit z eth_estimateGas pomnożony przez cenę gasu, a użytkownicy płacą więcej, niż pokazano. Które wywołanie predeploya dostarcza brakującą część?",
      options: [
        "getL1Fee na GasPriceOracle przez eth_call z serializowaną transakcją",
        "arbBlockNumber na ArbSys, które podaje blok L1, od którego liczy się opłatę",
        "sentMessages na L2ToL1MessagePasser, które zapisuje opłatę należną L1",
        "number na L1Block, którego blok origin ustala stałą opłatę za transakcję"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego wywołanie getL1FeeUpperBound na GasPriceOracle może skończyć się revertem w starym bloku, a w latest się udać?",
      options: [
        "Na większości węzłów OP Stack storage tego oracle'a dla starych bloków znika przez pruning",
        "Predeploy to proxy, a implementacja sprzed Fjord nie miała tej funkcji",
        "Według reguł protokołu predeploye przyjmują wywołania tylko w bloku latest",
        "W tym starszym bloku L1Block nie zapisał jeszcze żadnego blob base fee"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym NodeInterface w Arbitrum różni się od precompile'a ArbSys?",
      options: [
        "NodeInterface to bytecode EVM umieszczony w genesis, a ArbSys to natywny kod ArbOS",
        "NodeInterface obsługuje kontrakty na L1, a ArbSys kontrakty na L2",
        "NodeInterface istnieje tylko w warstwie RPC, a ArbSys można wywołać on-chain",
        "NodeInterface to predeploy OP Stack, a ArbSys to jego port na Arbitrum"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co robi pierwsza transakcja każdego bloku L2 w OP Stack?",
      options: [
        "Wykonuje wszystkie depozyty użytkowników z L1 jako jedną zbiorczą transakcję",
        "Publikuje output root poprzedniego bloku w L2ToL1MessagePasser",
        "Aktualizuje każde proxy predeploya do najnowszej dostępnej implementacji",
        "Zapisuje numer, hash i opłaty bloku L1 origin w kontrakcie L1Block"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Dashboard skarbca odtwarza salda kontraktów fee vault w OP Stack, sumując przychodzące transfery znalezione w trace'ach i logach. Co idzie nie tak?",
      options: [
        "Zawyża wynik, bo kontrakt vaulta loguje każdą wpłatę opłaty dwukrotnie",
        "Wynik jest poprawny, bo każda wpłata opłaty to transfer wewnętrzny widoczny w trace",
        "Liczy podwójnie, bo vault opłat L1 odzwierciedla vault base fee",
        "Zaniża wynik, bo protokół dopisuje opłaty każdego bloku bez żadnego transferu"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Interfejs bridge'a musi udowodnić na L1 wypłatę użytkownika z OP Stack. Które wywołanie do L2 dostarcza dowód?",
      options: [
        "eth_getProof dla slotu w L2ToL1MessagePasser w udowadnianym bloku",
        "eth_getTransactionReceipt dla wypłaty, sprawdzany potem przez portal",
        "optimism_syncStatus, którego safe head dowodzi, że wypłata przeszła derywację",
        "eth_call do GasPriceOracle, który zwraca podpisany rekord wypłaty"
      ],
      answer: 0
    }
  ],
  "derivation-pipeline": [
    {
      kind: "scenario",
      question: "Operator ponownie synchronizuje węzeł OP Stack od genesis ze zwykłym endpointem beacon, a derywacja staje na batchach z zeszłego roku. Dlaczego?",
      options: [
        "Klient wykonawczy nie może pobrać tak starych bloków od peerów przez snap sync",
        "Bloby z tymi batchami wygasły, a nie ustawiono archiwum jako fallbacku",
        "Stare batche publikowano w calldata, którego op-node już nie dekoduje",
        "Okno sekwencjonowania dla tych epok się zamknęło, więc nie da się ich odtworzyć"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego tagi safe i finalized w kliencie wykonawczym OP Stack odzwierciedlają L1, a nie lokalny konsensus?",
      options: [
        "op-node ustawia je w każdej aktualizacji fork choice według tego, co odtworzył z L1",
        "Klient wykonawczy wylicza je, czytając bezpośrednio Beacon Chain na L1",
        "Sekwencer wpisuje podpisane znaczniki safe i finalized do każdego rozgłaszanego bloku",
        "Są kopiowane z tagów bloków L1 ze stałym przesunięciem o dwie epoki"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym blok L2 unsafe różni się od bloku safe?",
      options: [
        "Bloki unsafe nie mają state root, dopóki nie uzupełni go batch na L1",
        "Bloki unsafe są odtwarzane z danych L1, które wciąż są przedmiotem sporu",
        "Bloki unsafe pochodzą z gossipu sekwencera i nie mają jeszcze batcha na L1",
        "Bloki unsafe zawierają tylko depozyty, a bloki safe dodają transakcje użytkowników"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co się dzieje, gdy w oknie sekwencjonowania na L1 nie pojawi się żaden batch dla danej epoki?",
      options: [
        "Łańcuch staje, dopóki sekwencer nie opublikuje brakujących danych batcha",
        "Derywacja buduje dla tego zakresu bloki zawierające wyłącznie depozyty",
        "Ostatni zaproponowany output root zostaje zakwestionowany i wycofany na L1",
        "Repliki zachowują rozgłoszone bloki i po 12 godzinach oznaczają je jako safe"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Reorg na L1 podmienia blok L1, który zawierał niedawny batch. Co może się stać z headami L2?",
      options: [
        "Finalized head na L2 się cofa, a safe head zostaje tam, gdzie był",
        "Nic się nie zmienia, bo bloki L2 są ostateczne, gdy tylko sekwencer je podpisze",
        "Unsafe head zostaje zamrożony, dopóki łańcuch L1 znów nie osiągnie finalności",
        "Safe head na L2 może się cofnąć, a finalized head nie może"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Jak optimism_syncStatus koduje numery bloków w odpowiedzi?",
      options: [
        "Jako wartości hex z prefiksem 0x, jak odpowiedzi klienta wykonawczego",
        "Jako dziesiętne stringi, tak jak Beacon API koduje numery slotów",
        "Jako dziesiętne liczby JSON w każdym obiekcie referencji bloku",
        "Jako referencje bloków zakodowane w RLP, które trzeba najpierw zdekodować"
      ],
      answer: 2
    }
  ],
  validium: [
    {
      kind: "scenario",
      question: "Komitet danych validium przestaje udostępniać dane, a kontrakt weryfikujący nadal działa. Co dzieje się ze środkami użytkowników?",
      options: [
        "Nadal można je wypłacić, bo validity proofy obejmują też każde wyjście",
        "Są zamrożone, bo dowody wyjścia wymagają danych, które ma tylko komitet",
        "Są stracone, bo operator może teraz opublikować sfałszowany state root",
        "Przechodzą w tryb rollupu, bo kontrakt wymusza publikację danych na L1"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego model zaufania optimium jest słabszy niż validium, gdy dane są zatajone?",
      options: [
        "Bez danych nie da się zbudować fraud proofa, więc błędny root może przejść",
        "Optimium w ogóle nie publikuje na L1 commitmentów stanu, tylko certyfikaty",
        "Validium trzyma dane na Ethereum, a optimium gdzie indziej",
        "Komitet optimium może też podpisywać nieprawidłowe przejścia stanu"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym volition różni się od zwykłego validium?",
      options: [
        "Zastępuje komitet danych zewnętrzną siecią, taką jak Celestia",
        "Publikuje fraud proofy zamiast validity proofów dla batchy off-chain",
        "Pozwala wybrać dane on-chain albo off-chain dla aktywa lub transakcji",
        "Trzyma dane na Ethereum, ale dowody publikuje w innej warstwie rozliczeniowej"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co sekwencer Arbitrum AnyTrust publikuje na L1 zamiast danych batcha?",
      options: [
        "Dowód zero-knowledge, że komitet otrzymał cały batch",
        "Certyfikat z hashem danych, czasem wygaśnięcia i podpisami komitetu",
        "Blob ze skompresowanym batchem, podpisany przez każdego członka komitetu",
        "State root batcha, podpisany własnym kluczem batchera sekwencera"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Indekser planuje uzupełnić historię łańcucha OP z Alt-DA, korzystając tylko z węzła archiwalnego L1 i archiwum blobów. Co znajdzie?",
      options: [
        "Pełne dane batchy, bo Alt-DA zmienia tylko model opłat",
        "Zupełnie nic, bo łańcuchy Alt-DA nie publikują na L1 żadnych transakcji",
        "Same depozyty, bo Alt-DA przenosi transakcje użytkowników do calldata",
        "Commitmenty na L1 w miejscu, gdzie powinny być same dane batchy"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Operator łańcucha Alt-DA wybiera commitmenty usługi DA. Jaką ochronę daje mu kontrakt challenge działający on-chain?",
      options: [
        "Pełną, bo każdy commitment można wymusić na L1",
        "Częściową, bo challenge działa tylko w oknie finalności",
        "Pełną, ale dopiero gdy zewnętrzna warstwa DA poświadczy dane",
        "Żadnej, bo kontrakt rozstrzyga tylko commitmenty keccak"
      ],
      answer: 3
    }
  ],
  "op-challenger": [
    {
      kind: "scenario",
      question: "Operator kieruje --l2-eth-rpc op-challengera na hostowany endpoint L2 bez metod debug. Co pójdzie nie tak?",
      options: [
        "Host programu nie pobierze witnessów i trie node'ów potrzebnych do trace",
        "Challenger awaryjnie pobierze trie node'y i kod z węzła rollupu",
        "Challenger gra normalnie, ale za każdy ruch płaci wyższą kaucję",
        "Challenger publikuje output rooty z tego endpointu bez sprawdzania"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego op-challenger wywołuje optimism_safeHeadAtL1Block, zanim zacznie bronić zgłoszonego bloku?",
      options: [
        "Żeby ustalić, które bloki L2 sekwencer rozgłosił, ale jeszcze nie ujął w batchach",
        "Żeby ograniczyć twierdzenie do tego, co wynika z danych L1 do headu L1 gry",
        "Żeby znaleźć output root, którego proposer użył jako root claim",
        "Żeby sprawdzić, czy blok L1 z tą grą został już sfinalizowany"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym rola op-challengera różni się od działającej on-chain fault dispute game, którą rozgrywa?",
      options: [
        "Zastępuje on-chainową maszynę wirtualną, wykonując sporny krok off-chain",
        "Jest proposerem, który tworzy gry i publikuje ich root claimy",
        "Jest kontraktem na L1, który trzyma kaucje i rozstrzyga zakończone gry",
        "Jest agentem off-chain, który wylicza uczciwe twierdzenia i publikuje ruchy"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Gdzie trzymane są kaucje wpłacane przy każdym ruchu, zanim zostaną odebrane?",
      options: [
        "W DelayedWETH, dopóki gra się nie rozstrzygnie i nie minie opóźnienie wypłaty",
        "W DisputeGameFactory, dopóki proposer nie wycofa swojego twierdzenia",
        "W PreimageOracle, dopóki sporny krok nie zostanie wykonany na L1",
        "W OptimismPortal, dopóki powiązana wypłata nie zostanie sfinalizowana"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator odtwarza bazę safe head op-node ze snapshotu zrobionego na innej maszynie. Jakie ryzyko z tego wynika?",
      options: [
        "Węzeł rollupu nie wystartuje, dopóki baza nie zostanie odbudowana",
        "Challenger traci kaucje, bo fabryka odrzuca wszystkie jego ruchy",
        "Challenger działa na złym safe head i może zaatakować prawidłowe outputy",
        "Węzeł rollupu przy następnym batchu odłącza się od łańcucha sekwencera"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Które metody host programu wywołuje na endpoincie wykonawczym L1 op-challengera, żeby załadować dane L1?",
      options: [
        "debug_getRawHeader i debug_getRawReceipts",
        "eth_getProof i debug_executionWitness",
        "optimism_outputAtBlock i eth_getLogs",
        "engine_newPayloadV4 i engine_getPayloadV4"
      ],
      answer: 0
    }
  ],
  "blob-archive": [
    {
      kind: "scenario",
      question: "Zespół uruchamia dziś archiwizujący beacon node i chce mieć bloby opublikowane pół roku temu. Czego powinien się spodziewać?",
      options: [
        "Węzeł uzupełni je od peerów podczas pierwszej synchronizacji",
        "Węzeł odtworzy je z kolumn, które teraz przechowuje",
        "Peery nie mają obowiązku ich udostępniać, więc muszą pochodzić z archiwum",
        "Klient wykonawczy dostarczy je z zapisanych transakcji blobowych"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego węzeł rollupu może bezpiecznie pobierać bloby z archiwum, któremu nie ufa?",
      options: [
        "Archiwa podpisują każdy blob kluczem walidatora, który był proposerem",
        "Archiwa muszą udostępniać bloby wyłącznie ze sfinalizowanych slotów",
        "Sekwencer publikuje każdy sporny blob ponownie na L1 jako zwykłe calldata",
        "Przelicza commitment każdego bloba i sprawdza versioned hash"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym po Fusaka przechowywanie blobów przez zwykły beacon node różni się od przechowywania przez supernode?",
      options: [
        "Trzyma wszystkie kolumny przez 18 dni, a supernode trzyma je na zawsze",
        "Trzyma same commitmenty KZG, a supernode przechowuje bajty blobów",
        "Przechowuje podzbiór kolumn, a supernode przechowuje wszystkie",
        "Usuwa dane po 4096 epokach, a supernode nigdy niczego nie usuwa"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Którą ścieżkę Beacon API odpytuje aktualny op-node, gdy pobiera bloby z fallbacku?",
      options: [
        "/eth/v1/beacon/blob_sidecars/{block_id} z indeksami blobów",
        "/eth/v1/beacon/blobs/{block_id} z versioned_hashes",
        "/eth/v1/debug/beacon/data_column_sidecars/{block_id}",
        "/eth/v2/beacon/blocks/{block_id} z treścią blobów"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Operator planuje dysk archiwum na podstawie tegorocznego tempa przyrostu blobów i zamierza trzymać wszystko. Co pójdzie nie tak?",
      options: [
        "Limity blobów rosną z każdym forkiem parametrów blobów, więc przyrost przerośnie plan",
        "Bloby są ponownie kompresowane po 4096 epokach, więc większość dysku stoi pusta",
        "Zarchiwizowane bloby i tak wygasają po roku, więc szacunek jest mocno zawyżony",
        "PeerDAS zmniejsza o połowę rozmiar każdego zapisanego bloba, więc dysk jest za duży"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Skąd powinien pochodzić versioned hash używany do sprawdzenia bloba z archiwum?",
      options: [
        "Z odpowiedzi samego archiwum, które przesyła hash razem z blobem",
        "Z dowodu KZG bloba, który koduje hash w swoich pierwszych bajtach",
        "Z kopii transakcji blobowej w bloku wykonawczym na własnym węźle",
        "Z Blobscan, który indeksuje versioned hash każdego opublikowanego bloba"
      ],
      answer: 2
    }
  ],
  peerdas: [
    {
      kind: "scenario",
      question: "Węzeł rollupu prosi beacon node bez podłączonych walidatorów o bloby bloku sprzed dwóch dni i dostaje błąd. Jakie jest prawdopodobne wyjaśnienie?",
      options: [
        "Węzeł trzyma swoje kolumny custody, a nie całe bloby",
        "Od Fusaka beacon node'y usuwają dane blobów raz na dobę",
        "Endpoint blobów odpowiada tylko wtedy, gdy żąda się SSZ",
        "Klient wykonawczy jeszcze nie sfinalizował tego bloku"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Ile dowodów komórek na każdy blob zawiera od Osaka opakowanie sieciowe transakcji blobowej?",
      options: [
        "Jeden, ten sam pojedynczy dowód na blob co w Cancun",
        "128, po jednym na każdą komórkę rozszerzonego bloba",
        "64, po jednym na każdą komórkę nierozszerzonego bloba",
        "Osiem, po jednym na każdą kolumnę próbkowaną przez węzeł"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego węzeł, który ma 64 ze 128 kolumn bloku, może odtworzyć każdy jego blob?",
      options: [
        "Każda kolumna powtarza cały blob w skompresowanej postaci",
        "Jego klient wykonawczy dostarcza brakujące mu kolumny",
        "Peery muszą odesłać każdą kolumnę, którą zgłosi jako brakującą",
        "Rozszerzenie to kod, w którym wystarcza dowolna połowa"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym supernode różni się od semi-supernode'a?",
      options: [
        "Potrafi odtwarzać bloby, a semi-supernode tego nie potrafi",
        "Próbkuje osiem kolumn na slot, a semi-supernode tylko cztery",
        "Przechowuje wszystkie 128 grup, a semi-supernode dokładnie 64",
        "Trzyma kolumny dłużej niż 4096 epok, a semi-supernode nie"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Do beacon node'a podłączony jest jeden skonsolidowany walidator z 2048 ETH. Co z tego wynika dla jego custody?",
      options: [
        "Przechowuje cztery grupy, to samo minimum co każdy węzeł",
        "Przechowuje osiem grup, stałą liczbę dla walidatorów",
        "Przechowuje 64 grupy, dość, by odtworzyć bloby",
        "Przechowuje wszystkie 128 grup, jak musi każdy węzeł ze stakiem"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Portfel zbudowany przed Osaka podpisuje transakcję blobową z jednym dowodem na blob i wysyła ją dzisiaj. Czego może się spodziewać?",
      options: [
        "Przyjęcia wszędzie, bo dowody komórek obliczą peery",
        "Odrzucenia przez część endpointów, a Geth przekonwertuje dowody",
        "Włączenia do bloku, ale jego bloby mogą nie zostać spróbkowane",
        "Przyjęcia, przy czym węzeł po cichu usunie bloby"
      ],
      answer: 1
    }
  ],
  "cross-chain-relayer": [
    {
      kind: "scenario",
      question: "Relayer dostarcza wiadomość na Arbitrum, a transakcja na Base, która ją wysłała, znika potem w reorgu. Co się stało?",
      options: [
        "Nic groźnego, bo Mailbox cofa dostarczenia, których źródło zniknęło",
        "Łańcuch docelowy wykonał wiadomość, której nie było: to podwójne wydanie",
        "Wiadomość zostaje powtórzona na nowej gałęzi, więc odbiorca dostaje zapłatę dwa razy",
        "Podpisy walidatorów wygasają, więc dostarczenie robi revert blok później"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego relayer Hyperlane domyślnie indeksuje łańcuchy źródłowe w oknach po 1999 bloków?",
      options: [
        "Bo walidatorzy Hyperlane podpisują jeden checkpoint na każde 1999 bloków",
        "Bo drzewo Merkle Mailboxa mieści najwyżej 1999 wiadomości w poddrzewie",
        "Żeby reorg nigdy nie sięgnął głębiej niż jedno okno zindeksowanych bloków",
        "Żeby każdy zakres eth_getLogs mieścił się w limitach 2000 bloków na endpointach"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym relayer Across różni się od relayera Hyperlane?",
      options: [
        "Zanosi podpisy walidatorów na łańcuch docelowy i płaci tylko za gas",
        "Podpisuje checkpointy drzewa Merkle SpokePool, które dostarczają inni",
        "Płaci odbiorcy z własnego kapitału i dostaje zwrot po okresie na sprzeciw",
        "Musi być na whiteliście protokołu, a relayer Hyperlane nie musi"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Na co czeka wiadomość Wormhole opublikowana z poziomem spójności 201, zanim podpiszą ją guardianie?",
      options: [
        "Na blok safe łańcucha źródłowego, tak jak ten tag podaje jego węzeł",
        "Na dokładnie 201 potwierdzeń nad blokiem, który ją zawiera",
        "Na nic, bo 201 to poziom dla wiadomości natychmiastowych",
        "Na blok finalized i kolejne 201 bloków zbudowanych na nim"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Relayer używa trybu quorum z Hyperlane z trzema endpointami dla jednego łańcucha. Co ten tryb chroni?",
      options: [
        "Wysyłki transakcji, które idą do trzech endpointów i liczą się, gdy dwa je przyjmą",
        "Każde żądanie, bo odczyty i zapisy są tak samo porównywane między endpointami",
        "Nic na łańcuchach EVM, bo quorum dotyczy tylko łańcuchów z jednym URL-em",
        "Odczyty, które wymagają zgody większości; wysyłki nadal idą na jeden URL"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Po tygodniu przerwy relayer wznawia pracę z endpointem, który serwuje logi tylko dla niedawnych bloków. Jakie ryzyko wiąże się z nadrabianiem?",
      options: [
        "Musi ponownie podpisać każdy pominięty checkpoint, zanim wznowi indeksowanie",
        "Mailbox odrzuca dostarczenia starsze niż tydzień, więc przepadają",
        "Puste odpowiedzi eth_getLogs wyglądają jak brak wiadomości, więc część zostaje pominięta",
        "Nonce na łańcuchu docelowym się zerują, więc stare wiadomości wymagają nowej opłaty za gas"
      ],
      answer: 2
    }
  ]
};
