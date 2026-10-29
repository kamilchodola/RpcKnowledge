// Polish checkpoint questions for the Nodes & networking lessons, keyed by topic id. Each topic's
// six questions match data/quizzes/nodes.js in order, kind, and answer position.
export const quizzes = {
  "full-node": [
    {
      kind: "contrast",
      question: "Co właściwie opisuje słowo „pełny” w nazwie „pełny węzeł”?",
      options: [
        "Że węzeł sam waliduje łańcuch; retencja to osobne ustawienie",
        "Że każdy historyczny snapshot stanu od genesis zostaje na dysku",
        "Że odpowie na eth_call na dowolnej wysokości, bo odtworzył wszystko od genesis",
        "Że wystawia każdą przestrzeń nazw JSON-RPC, w tym trace i debug"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Port HTTP pełnego węzła normalnie odpowiada na żądania. Co nadal może być nie tak?",
      options: [
        "Węzeł może się synchronizować albo jedna połowa pary może stać",
        "Co najwyżej lista modułów; listener otwiera się dopiero po synchronizacji",
        "Co najwyżej chain ID, które sprawdzenie portu i tak by wykazało",
        "Nic; odpowiadający listener znaczy, że każda połowa pary jest na headzie"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego indekser powinien przechowywać hash bloku obok każdego przetworzonego numeru bloku?",
      options: [
        "Reorg może postawić inny blok na tej wysokości",
        "Numery bloków są używane ponownie po każdej aktualizacji sieci",
        "eth_getBlockByNumber jest niedostępne na pruned node'ach",
        "Numer jest nadawany dopiero, gdy blok zostanie sfinalizowany"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Operator uruchamia tylko klienta wykonawczego i nazywa to kompletnym pełnym węzłem po Merge. Czego brakuje?",
      options: [
        "Klienta konsensusu śledzącego bloki beacon, fork choice i finalność",
        "Niczego; klient wykonawczy śledzi head od peerów devp2p",
        "Klienta walidatora, którego każdy pełny węzeł potrzebuje do śledzenia łańcucha",
        "Bazy archiwalnej, bez której węzeł nie potrafi walidować bloków"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Pełny węzeł odpowiada na eth_call na bieżącym headzie, ale to samo wywołanie dla bardzo starego bloku kończy się błędem. Dlaczego?",
      options: [
        "Usuwa stary stan (pruning), a łańcuch nadal waliduje",
        "Przestał walidować bloki starsze niż sfinalizowany checkpoint",
        "Stare bloki obsługuje tylko klient konsensusu",
        "Gas cap wywołania maleje dla bloków bardziej odległych w czasie"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Usługa treasury musi mieć pewność co do salda, zanim wypłaci środki. Co powinna dodać do odpowiedzi lokalnego pełnego węzła?",
      options: [
        "Dowód stanu albo nagłówek zaufany z niezależnego źródła",
        "Drugie wywołanie do tego samego węzła kilka bloków później",
        "Odpowiedź hostowanego dostawcy jako głos rozstrzygający",
        "Ciąg web3_clientVersion węzła jako sanity check"
      ],
      answer: 0
    }
  ],
  "archive-node": [
    {
      kind: "detail",
      question: "Archiwalny endpoint dostawcy już poprawnie zwraca stare salda. Czego sama etykieta „archive” nie rozstrzyga?",
      options: [
        "Czy działa tam konkretna przestrzeń nazw trace albo ścieżka dowodów",
        "Czy waliduje przychodzące bloki tak jak pełny węzeł",
        "Czy trzyma więcej historii stanu niż pruned node",
        "Czy klient konsensusu nadal śledzi dla niego proof-of-stake"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym węzeł archiwalny różni się od zwykłego pełnego węzła na poziomie protokołu?",
      options: [
        "Niczym; archiwum to tylko polityka przechowywania danych",
        "Przejmuje dodatkową rolę w konsensusie, z własnymi obowiązkami",
        "Stosuje surowszy zestaw reguł przy walidacji payloadów",
        "Zastępuje klienta konsensusu zaufanym źródłem checkpointów"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Po co puszczać ruch zapytań archiwalnych przez osobny gateway albo replikę do odczytu?",
      options: [
        "Długie skany historii konkurują o dysk i CPU potrzebne do importu bloków",
        "Węzły archiwalne udostępniają najnowszy blok tylko przez replikę",
        "Engine API odrzuca połączenia, gdy trwa zapytanie historyczne",
        "Batchowanie żądań jest wyłączone, gdy klient działa w trybie archiwalnym"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Endpoint zwraca receipty i logi dla bloków z 2019 roku. Co to mówi o jego historycznym stanie kont?",
      options: [
        "Nic; historię transakcji i stary stan przechowuje się osobno",
        "Że to archiwum, bo receipty wyprowadza się ze starego stanu",
        "Że stary stan też jest trzymany, bo logi czyta się z trie stanu",
        "Że stary stan jest trzymany dokładnie dla bloków objętych indeksem transakcji"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Co trzeba sprawdzić, zanim zagwarantuje się eth_getProof dla starych bloków z węzła archiwalnego?",
      options: [
        "Czy jego dane historyczne pozwalają zbudować ścieżkę konta albo storage",
        "Czy body bloków sięgają wstecz do żądanej wysokości",
        "Czy indeks transakcji jest ustawiony na cały łańcuch",
        "Czy przestrzeń nazw proof występuje w ciągu web3_clientVersion"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator odtwarza węzeł archiwalny z dowolnego snapshotu bazy danych. Co może nie przetrwać odtworzenia?",
      options: [
        "Ta sama obsługa dowodów co wcześniej",
        "Chain ID, który węzeł zgłasza przez eth_chainId",
        "Zdolność węzła do walidowania nowych bloków",
        "Salda na bieżącym headzie"
      ],
      answer: 0
    }
  ],
  "pruned-node": [
    {
      kind: "contrast",
      question: "Co pruning odbiera węzłowi, a co zostawia nienaruszone?",
      options: [
        "Szybkie odpowiedzi na część zapytań o stare bloki; walidacja bez zmian",
        "Niezależną walidację; zamiast niej węzeł ufa otrzymanemu snapshotowi",
        "Bieżący state root, który potem pobiera od peerów na żądanie",
        "Mempool, który przenosi się do klienta konsensusu"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "eth_call dla bloku z zeszłego roku kończy się na pruned node błędem missing trie node. Co to mówi o tym bloku?",
      options: [
        "Nic; ten węzeł po prostu nie ma już stanu z tej wysokości",
        "Wypadł w reorgu i nie jest już w kanonicznym łańcuchu",
        "Nigdy nie istniał w tej sieci na tej wysokości",
        "Wywołany kontrakt został na tej wysokości zniszczony"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego pruned node może zwrócić starą wartość konta, a jednocześnie odmówić wygenerowania dla niej dowodu?",
      options: [
        "Dowód wymaga całej ścieżki w trie, czyli więcej niż odczyt wartości",
        "Generowanie dowodów jest wyłączone zawsze, gdy włączony jest pruning",
        "Dowody można generować tylko dla tagu bloku finalized",
        "Węzeł musi ponownie wykonać blok, zanim podpisze dowód"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator zmienia ustawienie retencji pruned node'a, żeby trzymał więcej stanu. Co dzieje się ze stanem, który został już usunięty?",
      options: [
        "Może nie wrócić; jego odtworzenie może wymagać przebudowy",
        "Zostanie ponownie pobrany od peerów przy następnym zapytaniu",
        "Od razu wraca z plików freezera węzła",
        "Pojawia się ponownie po następnym pełnym cyklu pruningu"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Aplikację testowano na pruned node tylko z tagiem latest, a potem wypuszczono funkcję, która ponownie wykonuje stare wywołania. Co powinno było się wydarzyć?",
      options: [
        "Skierowanie zadania do puli archiwalnej, po sprawdzeniu starych bloków",
        "Podniesienie gas capu węzła, żeby stare wywołania się zmieściły",
        "Przełączenie wywołań na tag finalized, który pruned node'y zachowują",
        "Połączenie wywołań w batch, żeby węzeł odtworzył stary stan tylko raz"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co pruned node może zwrócić na żądanie dotyczące stanu starego bloku?",
      options: [
        "Błąd missing trie node, block not found albo błąd specyficzny dla klienta",
        "Pusty wynik 0x, którym klienci oznaczają stan usunięty przez pruning",
        "Przekierowanie do archiwalnego peera, który nadal ma ten stan",
        "Kod błędu JSON-RPC, który specyfikacja rezerwuje dla usuniętego stanu"
      ],
      answer: 0
    }
  ],
  "light-client": [
    {
      kind: "contrast",
      question: "Co odróżnia lekkiego klienta od aplikacji, która po prostu wywołuje hostowanego providera?",
      options: [
        "Ma dość danych, by sprawdzić odpowiedź względem zaufanego commitmentu",
        "Pobiera te same pełne bazy danych, tylko podzielone na mniejsze części",
        "Łączy się przez WebSocket zamiast zwykłego HTTP",
        "Podpisuje każde żądanie kluczem walidatora znanym providerowi"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Zespół portfela chce, żeby lekki klient odtwarzał historyczne trace'y i indeksował logi z zakresu bloków. Czego powinien się spodziewać?",
      options: [
        "Obok lekkiego klienta będzie potrzebny pełny węzeł albo indekser",
        "Trace'y weryfikuje się względem nagłówków, więc lekki klient je obsłuży",
        "Lekki klient to potrafi, gdy pobierze historię sync committee",
        "Odtworzyć i zindeksować da się tylko bloki po zaufanym checkpoincie"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Lekki klient uruchamia się pierwszy raz. Czego potrzebuje poza regułami protokołu?",
      options: [
        "Kotwicy zaufania, takiej jak checkpoint weak subjectivity",
        "Konta ze środkami, żeby płacić peerom, którzy serwują dowody",
        "Pełnej kopii najnowszego snapshotu stanu wykonawczego",
        "Najnowszego bloku, który ogłasza dobrze połączony serwer"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Lekki klient dostaje odpowiedź, która nie zgadza się z jego zaufanym nagłówkiem. Co się dzieje?",
      options: [
        "Może odrzucić odpowiedź jako niespójną",
        "Przyjmuje ją, bo provider podpisał ją przez TLS",
        "Synchronizuje się od nowa od bloku genesis",
        "Zgłasza serwer do sieci w celu slashingu"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym weryfikacja w lekkim kliencie konsensusu różni się od weryfikacji w lekkim kliencie wykonawczym?",
      options: [
        "Klient konsensusu śledzi podpisy sync committee; wykonawczy potrzebuje dowodów stanu",
        "Klient konsensusu potrzebuje dowodów stanu; wykonawczy śledzi podpisy sync committee",
        "Klient konsensusu ponownie wykonuje bloki; wykonawczy sprawdza atestacje bezpośrednio",
        "Każdy z nich uwierzytelnia dane certyfikatem TLS providera"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Na jaki kompromis idzie lekki klient w porównaniu z pełnym węzłem?",
      options: [
        "Mniej miejsca i przepustowości za większą złożoność protokołu i opóźnienia",
        "Mniej walidacji, bo ufa serwerowi, który odpowie pierwszy",
        "Więcej miejsca, bo cache'uje każdy zweryfikowany dowód",
        "Niższe opóźnienia, bo pomija sprawdzanie nagłówków najnowszych bloków"
      ],
      answer: 0
    }
  ],
  "snap-sync": [
    {
      kind: "detail",
      question: "Względem czego klient w trakcie snap sync sprawdza pobrane porcje stanu?",
      options: [
        "Uwierzytelnionego state rootu z danych łańcucha",
        "Podpisu peera, który dostarczył daną porcję",
        "Sumy kontrolnej opublikowanej razem z wydaniem klienta",
        "Rootu sfinalizowanego checkpointu z klienta konsensusu"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Snap sync się zakończył. Na jakie zapytania historyczne węzeł może teraz odpowiadać?",
      options: [
        "Na te, na które pozwala jego retencja; snap sync o tym nie decyduje",
        "Na wszystkie, bo snapshot pochodził z węzła, który miał historię",
        "Tylko na te o blokach wyprodukowanych po wykonaniu snapshotu",
        "Na żadne, dopóki nie przeprowadzi się osobnej synchronizacji od genesis"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego błędem jest opisywanie snap sync jako pomijania walidacji?",
      options: [
        "Zmienia tylko drogę do headu; nowe bloki przechodzą pełną walidację",
        "I tak odtwarza każdą transakcję od genesis, tylko równolegle",
        "Klient konsensusu ponownie waliduje za niego każdą pobraną porcję",
        "Peery podpisują każdą dostarczaną porcję, co liczy się jako walidacja"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Gateway dodaje do puli węzeł w trakcie snap sync, bo port 8545 odpowiada HTTP 200. Co powinien sprawdzić zamiast tego?",
      options: [
        "eth_syncing, wartości head i finalized oraz testy metod",
        "Czy net_peerCount przekracza domyślny cel klienta",
        "Czy web3_clientVersion wskazuje wersję obsługiwaną przez pulę",
        "Czy port 8546 też odpowiada, co oznacza koniec synchronizacji"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego po dojściu snap sync do headu eth_getProof dla starszego bloku nadal może się nie udać?",
      options: [
        "Baza po synchronizacji może nie mieć historycznych trie node'ów",
        "Protokół snap usuwa dowody z każdej dostarczanej porcji",
        "eth_getProof jest wyłączone na węzłach zbootstrapowanych przez snap",
        "Po synchronizacji dowody dostarcza klient konsensusu"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Kiedy bootstrap pełny albo nastawiony na archiwum ma więcej sensu niż snap sync?",
      options: [
        "Gdy głębszą historię trzeba lokalnie zwalidować albo zachować",
        "Gdy węzeł musi dojść do headu tak szybko, jak to tylko możliwe",
        "Gdy peerów jest mało, bo tylko snap sync potrzebuje peerów",
        "Gdy węzeł będzie obsługiwał tylko odczyty bieżącego stanu"
      ],
      answer: 0
    }
  ],
  "peer-to-peer": [
    {
      kind: "consequence",
      question: "Aplikacja wysyła poprawną transakcję przez JSON-RPC. Co jej to daje w sieci peerów?",
      options: [
        "Nic w gossipie ani w fork choice, choć węzeł może przekazać ją dalej",
        "Tymczasowe miejsce peera w sieci wykonawczej, dopóki pozostaje połączona",
        "Głos w fork choice ważony ceną gasu tej transakcji",
        "Prawo do pobierania bloków bezpośrednio od peerów węzła"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego dobra liczba peerów to słaby dowód, że węzeł ma świeże dane?",
      options: [
        "Peery mogą być nieaktualne, w innej sieci albo nie umieć dostarczyć danych",
        "Liczba peerów jest przeliczana tylko raz na epokę, więc się opóźnia",
        "Większość klientów liczy w tej metryce każde połączenie wychodzące dwa razy",
        "Odzwierciedla tylko klienta konsensusu, a nie klienta wykonawczego"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Którą część sieci węzła obejmuje devp2p?",
      options: [
        "Discovery i subprotokoły po stronie wykonawczej",
        "Warstwę wykonawczą i konsensusu, połączone w jeden stos przez Engine API",
        "Topics gossipu i podsieci atestacji w warstwie konsensusu",
        "Tylko discovery, a przesyłanie danych odbywa się przez JSON-RPC"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator publicznie wystawia administracyjne metody RPC, żeby obejść problem z discovery peerów. Co jest nie tak z tą poprawką?",
      options: [
        "Zwiększa ryzyko, a peerami steruje konfiguracja sieci",
        "Nic złego, dopóki Engine API pozostaje schowane za swoim JWT",
        "admin_ działa tylko przez IPC, więc zmiana nic nie da",
        "Działa, ale tylko do następnego restartu klienta"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Własny węzeł za restrykcyjnym NAT-em nie ma przydatnych peerów. Czego potrzebuje?",
      options: [
        "Bootnode'ów, statycznych peerów albo starannie skonfigurowanego discovery",
        "Otwartego portu Engine API, żeby peery mogły się do niego dostać",
        "Hostowanego providera RPC ustawionego jako jego upstream peer",
        "Wyższego rate limitu RPC, żeby peery mogły szybciej się z niego synchronizować"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co odróżnia interfejs RPC węzła od jego warstwy peer-to-peer?",
      options: [
        "RPC daje aplikacjom widoki i polecenia; peery dostarczają dane łańcucha",
        "RPC przenosi bloki między węzłami; peery odpowiadają na zapytania aplikacji",
        "RPC jest dla klientów wykonawczych; peer-to-peer tylko dla konsensusu",
        "RPC działa na szyfrowaniu RLPx; peer-to-peer na zwykłym HTTP"
      ],
      answer: 0
    }
  ],
  devp2p: [
    {
      kind: "detail",
      question: "Co w rodzinie protokołów devp2p zapewnia RLPx?",
      options: [
        "Szyfrowaną, uwierzytelnioną sesję, na której działają subprotokoły",
        "Pobieranie zakresów stanu, które pozwala szybciej skończyć snap sync",
        "Tablicę routingu, po której węzeł szuka kandydatów na peerów",
        "Serializację bajtów używaną w body żądań JSON-RPC"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Peer wysyła blok sprzeczny z bieżącym fork choice węzła. Co się dzieje?",
      options: [
        "Może go odrzucić; peer dostarcza kandydata, a nie jest autorytetem",
        "Węzeł go przyjmuje, bo to peery decydują o łańcuchu kanonicznym",
        "Węzeł przekazuje go wywołującym RPC jako blok pending",
        "Sesja zostaje zerwana, a węzeł zaczyna całą synchronizację od zera"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym zajmuje się każdy z subprotokołów eth i snap?",
      options: [
        "eth: wymianą łańcucha i bloków; snap: zakresami stanu",
        "eth: peerami z mainnetu; snap: peerami z sieci testowych, takich jak Hoodi",
        "eth: discovery peerów; snap: szyfrowanym handshakiem RLPx",
        "eth: stroną wykonawczą; snap: jej odpowiednikiem po stronie konsensusu"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Health check tylko wysyła curl na port 8545. Którą awarię devp2p przeoczy?",
      options: [
        "Węzeł, który stracił przydatnych peerów i serwuje nieaktualny head",
        "Węzeł, którego listener RPC przestał przyjmować jakiekolwiek nowe połączenia",
        "Węzeł, który na każde wywołanie metody eth_ zwraca HTTP 500",
        "Węzeł, którego port JSON-RPC przeniesiono z 8545 na inny"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Własny węzeł musi być publicznie osiągalny dla peerów. Co to oznacza dla jego metod JSON-RPC?",
      options: [
        "Nic; ruch peerów i RPC mają osobne polityki sieciowe",
        "Też muszą być publiczne, bo peery odpytują je przez HTTP",
        "Muszą współdzielić port peerów, który RLPx dla nich multipleksuje",
        "Muszą wymagać JWT, tak jak Engine API"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "W jakiej kolejności sprawdza się elementy przy diagnozowaniu węzła od dołu?",
      options: [
        "Łańcuch i sieć, sesje peerów, faza synchronizacji, head, na końcu RPC",
        "Najpierw metody RPC, potem faza synchronizacji, sesje peerów i łańcuch",
        "Liczba peerów, potem miejsce na dysku, potem RPC, a tożsamość łańcucha na końcu",
        "Wartości head, potem RPC, potem peery, a potem ustawienia sieci"
      ],
      answer: 0
    }
  ],
  "history-expiry": [
    {
      kind: "detail",
      question: "Wygasanie historii łatwo pomylić z pruningiem stanu. Których danych dotyczy?",
      options: [
        "Bardzo starych body i receiptów bloków wykonawczych",
        "Niedawnego stanu kont, który klienci mogą odbudować na żądanie",
        "Blob sidecarów warstwy konsensusu po upływie okna retencji",
        "Wpisów w mempoolu, które nigdy nie trafiły do bloku"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Węzeł usunął stare body bloków. Co się dzieje, gdy ktoś pyta go o bieżące saldo konta?",
      options: [
        "Odpowiada normalnie; bieżący stan i walidacja nie są naruszone",
        "Zwraca błąd, bo salda wynikają ze starych body",
        "Przekazuje żądanie do zewnętrznej sieci służącej do pobierania danych",
        "Odpowiada dopiero po uzupełnieniu wygasłego zakresu"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Zadanie analityczne potrzebuje receiptów z 2017 roku, które węzły jego providera już usunęły. Skąd nadal może je wziąć?",
      options: [
        "Z osobnych archiwów, sieci peerów, portali albo z własnej bazy",
        "Z beacon state, który klienci konsensusu trzymają bezterminowo",
        "Znikąd; wygasanie ma na zawsze wymazać tę historię",
        "Z indeksu transakcji, który wygasanie z założenia zostawia na miejscu"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego wygasanie historii jest przydatne dla zwykłych węzłów walidujących?",
      options: [
        "Stare dane bloków rosną bez końca, a potrzebuje ich tylko część aplikacji",
        "Stare bloki spowalniają walidację, bo każdy nowy blok je ponownie sprawdza",
        "Pozwala węzłom pominąć Engine API przy imporcie starych payloadów",
        "Usunięcie starych body zmniejsza pracę przy liczeniu state root"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Indekser przechowuje zdekodowane rekordy z bardzo starych bloków, które węzły już usunęły. Co musi zawierać każdy rekord?",
      options: [
        "Hash bloku, z którego pochodzi",
        "Sam numer bloku",
        "URL providera, który dowodzi, że dane są kanoniczne",
        "Tryb pruningu węzła w chwili zbierania danych"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Zespół obiecuje, że jedno ustawienie historii w jego węźle steruje każdą metodą historyczną. Co jest nie tak?",
      options: [
        "Logi, trace'y, stare wywołania i dowody zależą od różnych danych",
        "Klient konsensusu nadpisuje to ustawienie dla starych bloków",
        "Ustawienie wraca do wartości domyślnej przy każdym restarcie węzła",
        "Klienci i tak ograniczają historię do jednego stałego okna"
      ],
      answer: 0
    }
  ],
  "sync-modes": [
    {
      kind: "detail",
      question: "Co decyduje o tym, ile historii węzeł ostatecznie potrafi udostępniać?",
      options: [
        "Skonfigurowana retencja, a nie sposób bootstrapu",
        "Tryb synchronizacji użyty przy bootstrapie od peerów",
        "Checkpoint, od którego wystartował klient konsensusu",
        "To, czy odtworzono go ze snapshotu bazy danych"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego otwarty port RPC to słabe kryterium dopuszczenia świeżo uruchomionego węzła do ruchu?",
      options: [
        "Może odpowiadać, gdy head jest jeszcze niski, a część metod nie działa",
        "Port otwiera się dopiero po synchronizacji, więc spóźnia się względem gotowości",
        "Moduły RPC ładują się po stosie peerów, więc odpowiedzi przychodzą w złej kolejności",
        "Klienci losują numer portu RPC podczas początkowej synchronizacji"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Węzeł pod koniec synchronizacji jest w fazie healingu stanu, a postęp jest powolny. Która zmiana najprawdopodobniej pomoże?",
      options: [
        "Niższe opóźnienia bazy danych, które tu znaczą więcej niż przepustowość",
        "Większa przepustowość sieci, bo healing jest ograniczony przepustowością",
        "Wyższy limit połączeń JSON-RPC dla jego peerów",
        "Inny dostawca checkpointu dla klienta konsensusu"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Operator odtwarza węzeł ze snapshotu bazy danych i od razu wpina go z powrotem do load balancera. Co powinno było nastąpić wcześniej?",
      options: [
        "Sprawdzenie chain ID, hasha heada, sfinalizowanego checkpointu i metod",
        "Pełna ponowna synchronizacja od genesis, żeby najpierw sprawdzić zawartość snapshotu",
        "Restart klienta konsensusu od stanu genesis",
        "Podniesienie rate limitu RPC, żeby przyjąć spodziewany ruch przy nadrabianiu"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego aplikacja powinna opisywać potrzebny wynik synchronizacji, a nie cytować flagę synchronizacji jednego klienta?",
      options: [
        "Nazwy i flagi różnią się między klientami",
        "Flagi synchronizacji zmieniają się w każdym wydaniu, więc każda szybko się dezaktualizuje",
        "Flagi ustawia klient konsensusu, a nie wykonawczy",
        "Specyfikacja JSON-RPC już definiuje tryby, więc flagi są zbędne"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co zmienia szybszy bootstrap, a czego nie rusza?",
      options: [
        "Moment, w którym węzeł staje się użyteczny; walidacja nadal jest wymagana",
        "Zakres walidacji; szybsze tryby ufają pobranemu snapshotowi",
        "Retencję; szybsze tryby trzymają tylko niedawny stan",
        "Łańcuch; po szybszym bootstrapie węzeł może trafić do innej sieci"
      ],
      answer: 0
    }
  ],
  "node-hardware": [
    {
      kind: "scenario",
      question: "Węzeł ma mnóstwo rdzeni CPU, ale ciągle zostaje w tyle za headem. Jaka jest zwykle przyczyna?",
      options: [
        "Dysk za wolny na losowe odczyty i kompakcję",
        "Za mało peerów konsensusu, by na czas dowiedzieć się o nowych blokach",
        "Pula workerów JSON-RPC za mała jak na ten ruch",
        "Łącze nasycone gossipem atestacji, które węzeł przekazuje dalej"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego test obciążeniowy złożony tylko z wywołań eth_chainId wprowadza w błąd?",
      options: [
        "Prawie nie angażuje dysku ani EVM, inaczej niż realny ruch",
        "Całkowicie omija parser JSON-RPC wewnątrz klienta",
        "Jego odpowiedzi cache'uje stos sieciowy systemu operacyjnego",
        "Obciąża tylko klienta konsensusu, a nie klienta wykonawczego"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Co może się stać z klientem, gdy jego dysk całkowicie się zapełni?",
      options: [
        "Nieudane zapisy mogą zatrzymać import bloków i utrudnić odtwarzanie",
        "RPC zaczyna odrzucać żądania, gdy wolnego miejsca jest mniej niż dziesięć procent",
        "Kopie zapasowe zaczynają nadpisywać najstarsze dane łańcucha",
        "Klient konsensusu przestaje atestować, żeby oszczędzić miejsce"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym różnią się klienci wykonawczy i klienci konsensusu pod względem zasobów, na których najbardziej polegają?",
      options: [
        "Wykonawczy na CPU i losowym I/O; konsensusu na sieci i pamięci",
        "Wykonawczy na sieci i pamięci; konsensusu na CPU i losowym I/O",
        "Każdy polega głównie na CPU, więc tempo całości wyznacza liczba rdzeni",
        "Wykonawczy na obliczeniach GPU; konsensusu na sekwencyjnych zapisach na dysk"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Aplikacje oczekują dużej współbieżności RPC na jednym węźle. Co pomoże bardziej niż jeden większy dysk?",
      options: [
        "Repliki do odczytu albo gateway przed węzłem",
        "Większa liczba peerów, która rozłoży obciążenie RPC",
        "Szybszy tryb synchronizacji, który szybciej odpowiada na żądania",
        "Przełączenie węzła na retencję archiwalną"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Który zestaw sygnałów ostrzega, zanim dysk albo pamięć węzła staną się wąskim gardłem?",
      options: [
        "Wolny dysk, IOPS, opóźnienie fsync, presja pamięci i opóźnienie headu",
        "Liczba żądań, odsetek błędów i czas nieprzerwanego działania listenera RPC",
        "Liczba peerów, wersja klienta i chain ID zgłaszany przez węzeł",
        "Temperatura CPU, obroty wentylatorów i pobór mocy"
      ],
      answer: 0
    }
  ],
  "checkpoint-sync": [
    {
      kind: "consequence",
      question: "Checkpoint sync klienta konsensusu właśnie się zakończył. Co zwykle raportuje sparowany klient wykonawczy?",
      options: [
        "eth_syncing nadal zwraca obiekt postępu, bo klient nadrabia zaległości",
        "eth_syncing zwraca false, bo checkpoint objął też klienta wykonawczego",
        "eth_blockNumber zwraca null do nadejścia pierwszej atestacji",
        "Odrzuca każde żądanie eth_ do sfinalizowania następnej epoki"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co gwarantuje, że beacon state serwowany przez endpoint checkpointu należy do łańcucha kanonicznego?",
      options: [
        "Nic w protokole; operator musi porównać root z innym źródłem",
        "Hash tree root stanu, który klient sprawdza przy wczytaniu",
        "Podpis sync committee dołączony do pliku ze stanem",
        "Certyfikat TLS providera, który klienci domyślnie przypinają"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego świeżo zsynchronizowany od checkpointu beacon node może zwrócić 404 dla bloku ze slotu sprzed roku?",
      options: [
        "Nie zrobił jeszcze backfillu historii poniżej swojej kotwicy",
        "Każdy klient usuwa bloki beacon starsze niż 4096 epok",
        "Slot został pominięty, więc nikt w sieci nie ma dla niego bloku",
        "Beacon API serwuje bloki tylko z bieżącej epoki"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Beacon node zsynchronizowano od checkpointu z publicznego endpointu. Jak potwierdzić, że podąża za łańcuchem kanonicznym?",
      options: [
        "Porównać jego root sfinalizowanego bloku z drugim, niezależnym źródłem",
        "Zrestartować go raz, żeby ponownie zweryfikował hash tree root stanu",
        "Odczekać jedną epokę, po której fork choice dowodzi checkpointu",
        "Sprawdzić, czy tag finalized nadal przesuwa się po stronie wykonawczej"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Węzeł był offline dłużej niż okres weak subjectivity. Co powinien zrobić operator?",
      options: [
        "Zsynchronizować go od nowa ze świeżego checkpointu zamiast restartu",
        "Zrestartować go i pozwolić, by fork choice nadgonił z jego bazy danych",
        "Zsynchronizować od nowa tylko klienta wykonawczego; beacon state jest nadal ważny",
        "Zwiększyć liczbę peerów, żeby szybciej usłyszał łańcuch kanoniczny"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "O co beacon node prosi providera, gdy startuje z checkpoint sync?",
      options: [
        "O stan dla identyfikatora finalized i odpowiadający mu blok",
        "O blok head i każdą atestację od genesis",
        "O podpisaną listę wszystkich walidatorów z ich saldami na headzie",
        "O snapshot stanu wykonawczego w najnowszym bloku"
      ],
      answer: 0
    }
  ],
  "weak-subjectivity": [
    {
      kind: "cause",
      question: "Dlaczego long-range attack jest tani dla walidatorów, którzy już wyszli z sieci i wypłacili stake?",
      options: [
        "Mają stare klucze podpisujące, ale nie mają już stake'u do slashingu",
        "Ich transakcja wypłaty pozwala im ponownie podpisać stare epoki",
        "Po wyjściu zachowują wagę głosu przez jeden okres weak subjectivity",
        "Slashing obejmuje tylko atestacje z ostatnich dwóch epok"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co ogranicza długość okresu weak subjectivity?",
      options: [
        "Tempo wycofywania stake'u: kolejka wyjścia i churn limit",
        "Stała 4096 epok zapisana w specyfikacji",
        "12-sekundowy slot pomnożony przez liczbę aktywnych walidatorów",
        "Okno przechowywania blob sidecarów w sieci konsensusu"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Węzeł został zbootstrapowany ze złośliwego checkpointu. Co zauważy zwykły użytkownik RPC?",
      options: [
        "Nic, patrząc na jeden endpoint; odpowiedzi wyglądają na spójne",
        "eth_call kończy się błędem, bo jego state rooty nie przejdą weryfikacji",
        "eth_syncing na kliencie wykonawczym bez końca zwraca true",
        "eth_chainId zwraca inną wartość niż skonfigurowana sieć"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co w proof of work, w odróżnieniu od proof of stake, sprawiało, że najcięższy łańcuch był dla nowego węzła oczywisty?",
      options: [
        "Przedłużenie starego forka wymaga nowej energii, zużytej teraz",
        "Bloki zawierały podpisy walidatorów, które z czasem wygasają",
        "Łączną trudność podpisywał zaufany komitet",
        "Węzły miały wbudowaną listę wszystkich kanonicznych hashy bloków"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Operator synchronizuje beacon node od genesis, żeby nikomu nie ufać. Co mówi o tym weak subjectivity?",
      options: [
        "Sama synchronizacja nie rozróżni dwóch pozornie prawidłowych łańcuchów",
        "To jedyna opcja bez zaufania, bo sprawdzana jest każda reguła",
        "Jest bezpieczna, o ile synchronizacja skończy się w ramach okresu",
        "Działa tylko wtedy, gdy klient wykonawczy też synchronizuje się od genesis"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego okres weak subjectivity lepiej traktować jako liczbę raportowaną przez klienta niż jako stałą?",
      options: [
        "Zależy od liczby walidatorów i churnu, które Pectra przebudowała",
        "Protokół losuje go od nowa w każdej epoce, żeby zniechęcić atakujących",
        "Każdy klient stosuje własny wzór, więc wartości się różnią",
        "Kurczy się o stałą wartość przy każdej aktualizacji sieci"
      ],
      answer: 0
    }
  ],
  discovery: [
    {
      kind: "contrast",
      question: "Co Ethereum Node Record dodaje w porównaniu ze zwykłym URL-em enode?",
      options: [
        "Podpisany, wersjonowany rekord, który może nieść fork id i podsieci",
        "Szyfrowany transport dla sesji z peerem, która następuje po discovery",
        "Wysokość bloku i hash headu, które peer obecnie serwuje",
        "Dowód, że peer podąża za łańcuchem kanonicznym"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Węzeł wykonawczy stoi za NAT-em i ogłasza swój prywatny adres. Co najprawdopodobniej widzi wywołujący RPC?",
      options: [
        "Zwykłe odpowiedzi z blokiem latest, który powoli zostaje w tyle",
        "Odmowę połączenia na porcie 8545 zaraz po starcie",
        "eth_chainId zwracający chain ID innej sieci",
        "Błędy method not found, kod -32601, dla każdej obsługiwanej metody eth_"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator otwiera w firewallu węzła wykonawczego tylko TCP 30303. Co przestaje działać?",
      options: [
        "Znajdowanie węzła, bo discovery używa UDP na tym porcie",
        "Sesje RLPx, które działają przez UDP na tym samym porcie 30303",
        "Engine API, które dzieli port 30303 z devp2p",
        "Nic; discovery działa przez TCP obok RLPx"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Świeży klient nie ma żadnych peerów. Od czego zaczyna discovery?",
      options: [
        "Od wpisanych na sztywno bootnode'ów albo listy DNS enrtree://",
        "Od peerów z admin_peers jego providera RPC",
        "Od losowego skanowania przestrzeni IPv4 w poszukiwaniu portu 30303",
        "Od listy peerów klienta konsensusu, udostępnianej przez Engine API"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego admin_nodeInfo, admin_peers i admin_addPeer nie powinny być na publicznym endpoincie?",
      options: [
        "Ujawniają topologię i pozwalają przypinać peerów",
        "Zdradzają klucze walidatora i sekret JWT węzła",
        "Wstrzymują import bloków przy każdym ich wywołaniu",
        "Resetują tablicę discovery przy każdym wywołaniu"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Na co fork id w ENR węzła wykonawczego pozwala innym węzłom?",
      options: [
        "Wcześnie odrzucić peera po złej stronie aktualizacji sieci",
        "Wybrać, którymi podsieciami atestacji dzielić się z tym peerem",
        "Zdecydować, o które zakresy stanu snap prosić go najpierw",
        "Sprawdzić, czy jego najnowszy state root zgadza się z ich headem"
      ],
      answer: 0
    }
  ],
  "libp2p-gossip": [
    {
      kind: "consequence",
      question: "Klient konsensusu traci peery, a klient wykonawczy nadal działa. Co widzi użytkownik RPC?",
      options: [
        "Odpowiedzi nadal przychodzą, ale tag finalized po cichu staje",
        "eth_blockNumber od razu zaczyna zwracać błąd przy każdym wywołaniu",
        "eth_getLogs oznacza wszystkie niedawne logi jako removed",
        "eth_syncing od razu przełącza się na obiekt z postępem"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego pojedyncze atestacje są rozłożone na 64 podsieci, a nie na jeden globalny topik?",
      options: [
        "Żeby węzeł przenosił tylko ruch komitetów, którym służy",
        "Gossipsub dostarcza najwyżej jedną wiadomość na topik w slocie",
        "Każdy z 64 członków sync committee dostaje prywatny kanał",
        "Każdą podsieć waliduje inna implementacja klienta"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Gdzie jest treść bloba, gdy jego transakcja ma już kilka tygodni?",
      options: [
        "Tylko w archiwach blobów; węzły usuwają ją po 4096 epokach",
        "W body bloku wykonawczego, do pobrania z węzłów archiwalnych",
        "W stanie beacon, który archiwalne węzły konsensusu trzymają zawsze",
        "W receipcie transakcji, zakodowana pod blobGasUsed"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym gossipsub różni się od protokołu request-response w sieci konsensusu?",
      options: [
        "Gossip rozsyła bieżące wiadomości slotu; req/resp pobiera brakującą historię",
        "Gossip pobiera historię; req/resp rozsyła bloki w obrębie slotu",
        "Gossip przenosi execution payloady; req/resp przenosi atestacje",
        "Gossip jest tylko dla walidatorów; req/resp obsługuje każdy beacon node"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Zegar beacon node dryfuje. Węzeł powoli traci peery i zostaje w tyle, bez żadnego pojedynczego błędu w logach. Co się dzieje?",
      options: [
        "Spóźnione wiadomości obniżają jego scoring, więc peery go odcinają",
        "Jego ENR wygasa, więc discovery usuwa go z tablic routingu",
        "Jego subskrypcje podsieci wygasają na każdej granicy epoki",
        "Wywołania Engine API przekraczają timeout, więc strona wykonawcza staje"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Beacon node przegapił aktualizację sieci. Dlaczego przestaje słyszeć sąsiadów w gossip?",
      options: [
        "Nazwy topików zawierają fork digest, więc jego topiki przestają pasować",
        "Peery odrzucają jego kodowanie SSZ, które zmienia się przy każdym forku",
        "Numer sekwencyjny jego ENR się zeruje, więc peery ignorują jego rekord",
        "Gossipsub banuje go na pełną epokę po slocie aktualizacji"
      ],
      answer: 0
    }
  ],
  "portal-network": [
    {
      kind: "detail",
      question: "Co węzeł Portal robi z wyszukiwaniem treści spoza swojego promienia?",
      options: [
        "Kieruje je do peerów bliższych docelowemu identyfikatorowi",
        "Pobiera tę treść z węzła archiwalnego i ją zapisuje",
        "Zwraca błąd, bo ta treść go nie dotyczy",
        "Odrzuca je, a pytający musi ponowić żądanie przez discv4"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Aplikacja kieruje eth_call dla starego bloku do klienta historii Portal. Co się dzieje?",
      options: [
        "Wywołanie się nie udaje; bez sieci stanu nie ma eth_call",
        "Działa, bo historia obejmuje stan w każdym bloku",
        "Klient odtwarza receipty bloku, żeby wyprowadzić stan",
        "Trafia do peera archiwalnego w DHT sieci Portal"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Jaki problem rozwiązuje Portal Network?",
      options: [
        "Utrzymuje dostęp do wygasłych body i receiptów bez archiwum",
        "Zmniejsza opóźnienie eth_getLogs na niedawnych blokach dla dappów",
        "Zastępuje sieć gossip konsensusu dla atestacji tablicą DHT",
        "Pozwala lekkim portfelom rozgłaszać transakcje bez pełnego węzła"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co odróżnia węzeł Portal od pełnego węzła albo węzła archiwalnego?",
      options: [
        "Trzyma wybrany przez siebie wycinek historii, a nie część wszystkiego",
        "Trzyma wszystko co archiwum, ale rozłożone na kilka dysków",
        "Waliduje nowe bloki według lżejszego zestawu reguł konsensusu",
        "Trzyma niedawny stan jak pełny węzeł, ale usuwa wszystkie receipty"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Portfel wysyła eth_sendRawTransaction do klienta Portal. Co się dzieje?",
      options: [
        "Zostaje odrzucona; węzły Portal nie mają mempoolu",
        "Trafia przez discv5 do pobliskich peerów wykonawczych",
        "Czeka w kolejce, aż podsieć stanu zostanie uruchomiona",
        "Leży w DHT, dopóki nie obejmie jej któryś późniejszy blok"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego węzeł Portal może użyć treści od peera, z którym nigdy wcześniej nie miał kontaktu?",
      options: [
        "Najpierw sprawdza ją względem kanonicznych nagłówków",
        "Peery muszą zastakować ETH, zanim zaczną serwować treści",
        "Handshake discv5 dowodzi, że peer jest uczciwy",
        "Każdą treść podpisuje Ethereum Foundation"
      ],
      answer: 0
    }
  ],
  "receipt-retention": [
    {
      kind: "scenario",
      question: "Indekser prosi węzeł Geth o receipt transakcji z 2019 roku po hashu i dostaje null, choć węzeł wciąż ma ten blok. Jakie jest najbardziej prawdopodobne wyjaśnienie?",
      options: [
        "Receipt został usunięty, a specyfikacja odpowiada null na usunięte receipty",
        "Indeks transakcji nie sięga już tego bloku, więc hasha nie da się znaleźć",
        "Receipty sprzed Merge serwuje eth_getBlockReceipts, a nie zapytanie po hashu",
        "Transakcja się zrevertowała, a zrevertowana transakcja nigdy nie dostaje receiptu"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego węzeł, który przycina zarówno receipty, jak i stan, nie odtworzy starego receiptu zmianą ustawienia?",
      options: [
        "Receipty podpisuje proposer, więc odbudowana kopia nie przeszłaby weryfikacji",
        "receiptsRoot jest usuwany razem z receiptami, więc nie ma z czym porównać",
        "Klienci odmawiają ponownego wykonania bloków starszych niż sfinalizowany checkpoint",
        "Odbudowa wymaga ponownego wykonania bloku na stanie rodzica, którego już nie ma"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym filtr logów receiptów w Reth różni się od ustawienia prune.receipts.distance?",
      options: [
        "Zachowuje receipty z logami z podanych adresów, a resztę usuwa",
        "Zachowuje logi podanych adresów, ale usuwa z ich receiptów status i gas",
        "Filtruje to, co zwraca eth_getLogs, a receipty zostają na dysku",
        "Dotyczy historii stanu, a ustawienie distance dotyczy receiptów"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jaki błąd specyfikacja execution-apis definiuje dla żądania o receipt albo logi poniżej granicy retencji węzła?",
      options: [
        "Kod -32601, Method not found",
        "Kod -32000, missing trie node w tym bloku",
        "Kod 4444, Pruned history unavailable",
        "Kod -32005, query returned too many results"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Świeży węzeł mainnetu Nethermind 2.0, zsynchronizowany z domyślnymi ustawieniami, ma posłużyć do backfillu indeksera od bloku 20 000 000. Co się dzieje?",
      options: [
        "Węzeł przy pierwszym żądaniu pobiera brakujące receipty od peerów",
        "Zapytania się udają, bo bariera ancient ogranicza body bloków, a nie receipty",
        "Węzeł odtwarza je ze stanu, bo receipty zawsze da się odbudować",
        "Receipty poniżej bloku 24 600 000 nie zostały pobrane, więc odczyty zawodzą"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Operator dodaje prune.include-receipts do datadir Erigona 3.6, który utworzono bez tej opcji. Co się dzieje?",
      options: [
        "Erigon trzyma się ustawienia z utworzenia datadir, więc nic się nie zmienia",
        "Erigon uzupełnia cache receiptów w całym oknie historii stanu",
        "Erigon zaczyna cache'ować receipty od następnego bloku, zostawiając za sobą lukę",
        "Erigon nie wystartuje, dopóki datadir nie zostanie zmigrowany na miejscu"
      ],
      answer: 0
    }
  ],
  "partial-archive": [
    {
      kind: "scenario",
      question: "Archiwum path-based Getha działało przez rok z history.state ustawionym na 100 000 bloków, a teraz operator ustawia tę wartość na 0. Co staje się dostępne?",
      options: [
        "Historia aż do genesis, odbudowana z odwrotnych diffów we freezerze",
        "Historia aż do genesis, gdy indeks stanu skończy się przebudowywać",
        "Historia od teraz jest zachowywana, a bloki już usunięte nie wracają",
        "Historia aż do pierwszej synchronizacji, odzyskana z ancient store"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego historyczne eth_call do kontraktu z wycinka może się nie udać, mimo że historia samego kontraktu jest zachowana?",
      options: [
        "Wykonanie sięga do stanu innych kontraktów, którego wycinek nie trzyma",
        "Wycinki trzymają sloty storage, ale nie kod, więc wywołanie nie ma czego uruchomić",
        "Wycinek trzyma tylko logi i receipty, nigdy stanu samego kontraktu",
        "Historyczne wywołania wymagają dowodu dla każdego slotu, a wycinki nie trzymają trie node'ów"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym archiwum od bloku różni się od przesuwnego okna?",
      options: [
        "Trzyma stałą liczbę bloków, a starsze odbudowuje na żądanie",
        "Trzyma to samo okno, ale dodatkowo receipty aż do genesis",
        "Zaczyna od genesis i przestaje zapisywać po wybranym bloku",
        "Trzyma wszystko od ustalonego bloku wzwyż i nigdy tego nie usuwa"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Węzeł ma robić trace transakcji od bloku 20 000 000 wzwyż. Gdzie ustawić dolną granicę archiwum od bloku?",
      options: [
        "Na bloku 20 000 000, bo trace potrzebuje tylko stanu tego bloku",
        "Na bloku 19 999 999, bo ponowne wykonanie zaczyna się od stanu rodzica",
        "Na bloku 19 999 872, bo ponowne wykonanie wymaga 128 bloków wcześniejszego stanu",
        "Gdziekolwiek, bo tracing czyta body i receipty, a nie stan"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Gateway raz sprawdza najniższy blok, na który odpowiada węzeł z przesuwnym oknem, i wpisuje go na sztywno. Co z tego wynika?",
      options: [
        "Nic, bo dolną granicę przesuwnego okna ustala się przy synchronizacji węzła",
        "Żądania blisko tej wysokości zaczynają padać, bo dolna granica okna rośnie",
        "Żądania poniżej niej dostają wolne odpowiedzi ze stanu odbudowanego na żądanie",
        "Węzeł na prośbę poszerza okno tak, żeby objęło wpisaną wysokość"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Aplikacja potrzebuje historycznego eth_getProof i korzysta z węzła Nethermind z płaską historią w przesuwnym oknie (Rolling). Co się okaże?",
      options: [
        "Dowody działają w całym oknie, bo jego stan jest w pełni zachowany",
        "Dowody działają tylko dla adresów wymienionych w konfiguracji wycinka",
        "Historyczne dowody wymagają historii bez okna, więc ten węzeł ich nie poda",
        "Dowody działają, ale w oknie są budowane z bieżącego stanu"
      ],
      answer: 2
    }
  ],
  "database-snapshot": [
    {
      kind: "scenario",
      question: "Operator przywraca snapshot pełnego węzła, a potem włącza ustawienia archiwalne, żeby obsługiwać eth_call na starych blokach. Co się dzieje?",
      options: [
        "Węzeł przez noc odbuduje stary stan z body zawartych w snapshocie",
        "Zapytania o stare bloki zadziałają, gdy węzeł przeindeksuje zbiory zmian ze snapshotu",
        "Klient nie wystartuje, bo układów bazy archiwalnej i pełnej nie da się mieszać",
        "Zapytania o stare bloki nadal zawodzą, bo snapshot nigdy nie zawierał tego stanu"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym snap sync różni się od startu węzła ze snapshotu bazy danych?",
      options: [
        "Snap sync ponownie wykonuje cały łańcuch od genesis, zanim obsłuży odczyty",
        "Snap sync sprawdza dowód każdego zakresu względem poświadczonego state root",
        "Snap sync ufa jednemu peerowi co do całego stanu, a snapshot wielu",
        "Snap sync pobiera te same pliki, ale najpierw weryfikuje ich sumy kontrolne"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego błędna wartość konta przywrócona ze snapshotu może przetrwać, choć nowe bloki dają zgodne state rooty?",
      options: [
        "State rooty obejmują tylko konta zmienione w ostatnich 128 blokach",
        "Klienci porównują rooty na sfinalizowanych checkpointach, a nie w każdym bloku",
        "Liczenie rootu bierze zapisane hashe dla wszystkiego, czego blok nie rusza",
        "Bazy flat nie liczą state root, więc nic nie jest porównywane z nagłówkami"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co reth download sprawdza dla każdego rozpakowanego pliku?",
      options: [
        "Jego rozmiar i hash BLAKE3 względem manifestu samego snapshotu",
        "Jego hash SHA-256 względem listy wkompilowanej w plik binarny klienta",
        "Podpis publikującego względem klucza przypiętego w reth.toml",
        "Jego zakres bloków względem nagłówków z klienta konsensusu"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Suma kontrolna snapshotu została pobrana z tego samego serwera co snapshot i się zgadza. Czego to dowodzi?",
      options: [
        "Tylko tego, że bajty są takie, jak opublikował je ten serwer",
        "Tego, że baza należy do łańcucha kanonicznego na swoim headzie",
        "Tego, że publikujący wykonał bloki, które się w niej znajdują",
        "Tego, że snapshot powstał w oficjalnym wydaniu klienta"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co odróżnia pliki snapshotów Erigona od snapshotu bazy danych?",
      options: [
        "To kopie całego datadir innego węzła, serwowane przez BitTorrent",
        "Zawierają tylko bieżący stan, a snapshoty bazy danych mają historię",
        "To identyczne segmenty własnego układu Erigona, pobierane po hashu",
        "To pliki era1, które Erigon przy starcie konwertuje do swojej bazy"
      ],
      answer: 2
    }
  ],
  "era-files": [
    {
      kind: "scenario",
      question: "Zespół pobiera pliki era1 z endpointu historii. Które sprawdzenie wiąże plik z kanonicznym łańcuchem sprzed Merge?",
      options: [
        "Odbudowanie rootu akumulatora i porównanie z zamrożoną listą historyczną",
        "Porównanie SHA-256 z checksums.txt z tego samego endpointu",
        "Ponowne wykonanie bloków i porównanie każdego state root z jego nagłówkiem",
        "Sprawdzenie pieczęci proof of work każdego nagłówka w pliku"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Ile najwyżej bloków mieści jeden plik era1?",
      options: ["4096", "32768", "8192", "2048"],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym pliki era warstwy konsensusu różnią się od plików era1 pod względem zawartości?",
      options: [
        "Mają receipty wykonawcze i różnice stanu, ale nie mają bloków beacon",
        "Mają bloki beacon z payloadami i stan, ale nie mają receiptów",
        "Te same nagłówki, body i receipty, tylko w SSZ zamiast RLP",
        "Tylko beacon state, po jednym na epokę, bez żadnych bloków"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego import era1 do Nethermind bez Era.TrustedAccumulatorFile osłabia weryfikację?",
      options: [
        "Klient pomija wtedy sprawdzanie body względem transactionsRoot",
        "Klient importuje wtedy bloki bez sprawdzania, czy hashe rodziców się łączą",
        "Klient przyjmuje wtedy bez sprzeciwu pliki z innych sieci",
        "Klient ufa wtedy akumulatorom znalezionym w samym katalogu importu"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Operator uruchamia geth download-era dla zakresu bloków po Merge. Co się dzieje?",
      options: [
        "Pobiera pliki ere dla tego zakresu i weryfikuje je sumami kontrolnymi",
        "Pobiera pliki era warstwy konsensusu i wyciąga z nich execution payloady",
        "Nie pobiera nic przydatnego, bo pliki era1 kończą się na Merge",
        "Pobiera bloki od peerów, bo endpointy ich nie mają"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego plik ere zapisany z profilem noproofs trzeba sprawdzić względem nagłówków z innego źródła?",
      options: [
        "Nie ma receiptów, więc nie da się z niego przeliczyć receiptsRoot",
        "Nie ma dowodów nagłówków, które kotwiczą go w kanonicznych rootach",
        "Przechowuje nagłówki bez hashy, więc trzeba je pobrać osobno z sieci",
        "Używa kompresji, która ukrywa nagłówki przed zwykłymi czytnikami"
      ],
      answer: 1
    }
  ]
};
