// Polish checkpoint questions for the Operations lessons, keyed by topic id. Each topic's
// six questions match data/quizzes/operations.js in order, kind, and answer position.
export const quizzes = {
  "rpc-provider": [
    {
      kind: "detail",
      question: "Provider zwraca saldo konta dla twojego adresu. Co właściwie dostajesz?",
      options: [
        "Dowód, że wartość jest poprawna w bloku podanym w odpowiedzi",
        "Twierdzenie bez dowodu, do sprawdzenia, gdy zależą od niego pieniądze",
        "Sfinalizowaną wartość, bo providerzy odpowiadają tylko z bloków finalized",
        "Zgodną odpowiedź wszystkich węzłów floty providera dla tego bloku"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "W benchmarku provider jest szybszy od twojego węzła przy tym samym odczycie. Co może kryć ta szybkość?",
      options: [
        "Provider po cichu przepisał parametry żądania na tańsze",
        "CPU twojego węzła jest wolniejszy, choć dysk ma szybszy",
        "Odpowiedział edge cache, a jego wartość może być blok w tyle",
        "Żądanie rozliczono w tańszym progu compute units"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Planujesz przejście z hostowanego providera na własny węzeł. Którą część integracji trzeba będzie przepisać?",
      options: [
        "Wywołania podstawowych metod, takich jak eth_getBalance i eth_call",
        "Odczyty przypięte do tagów safe i finalized zamiast latest",
        "Żądania batch, które jako tablice JSON przyjmują tylko hostowane endpointy",
        "Wywołania jego endpointów sald tokenów, NFT i zdekodowanej historii"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego naiwna pętla ponowień na jednej drogiej metodzie może w godzinę wyczerpać miesięczny limit u providera?",
      options: [
        "Każde ponowienie otwiera nowe połączenie, a połączenia są rozliczane godzinowo",
        "Ceny są w compute units, a trace kosztuje dużo więcej niż odczyt heada",
        "Providerzy liczą nieudane żądania podwójnie w porównaniu z udanymi",
        "Ponowienia trafiają do poziomu archiwalnego, który liczy każdą odpowiedź od bajtu"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Portfel kieruje ruch wszystkich użytkowników do jednego domyślnego endpointu providera. Co ten provider widzi?",
      options: [
        "Tylko wysyłane transakcje, bo providerzy nie logują odczytów",
        "Tylko zbiorczą liczbę żądań na klucz API, bez adresów",
        "IP użytkowników, każdy pytany adres i transakcje przed rozgłoszeniem",
        "Nic identyfikującego, bo żądania JSON-RPC są szyfrowane end-to-end"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym dRPC i Ankr różnią się od providera, który prowadzi jedną własną flotę węzłów?",
      options: [
        "Kierują ruch do niezależnie prowadzonych węzłów, a nie do jednej floty",
        "Obsługują tylko węzły archiwalne, a providerzy z flotą pełne węzły",
        "Nie wymagają klucza API, więc każde żądanie jest anonimowe i bez limitów",
        "Zwracają dowody z każdą odpowiedzią, więc nie trzeba im ufać"
      ],
      answer: 0
    }
  ],
  "self-hosting": [
    {
      kind: "scenario",
      question: "Własny węzeł przegapia termin aktualizacji sieci. Co po forku widzi aplikacja, która go wywołuje?",
      options: [
        "Każde żądanie od razu kończy się błędem -32603, dopóki węzeł nie zostanie zaktualizowany",
        "Węzeł dalej pewnie odpowiada z łańcucha, który sieć porzuciła przy forku",
        "Zgłaszany chain ID zmienia się, żeby wywołujący mogli wykryć niezgodność",
        "Klient konsensusu nie uruchomi się, dopóki binarka nie zostanie zaktualizowana"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co daje własny węzeł, czego nie da żaden plan providera?",
      options: [
        "Wysoką dostępność z jednej maszyny, bez potrzeby fallbacku",
        "Niższe opóźnienie dla wywołujących z całego świata niż dowolny edge cache",
        "Nikt z zewnątrz nie widzi, o jakie adresy pytasz i co podpisujesz",
        "Aktualizacje klienta, które instalują się same przed każdą aktualizacją sieci"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Dodajesz hostowany endpoint jako fallback za własnym węzłem. Co trzeba sprawdzić, zanim dostanie ruch?",
      options: [
        "Czy odpowiada na żądanie HTTP statusem 200 w ramach timeoutu",
        "Chain ID, status synchronizacji, dystans do heada i potrzebne przestrzenie nazw",
        "Czy jego miesięczny limit compute units ma jeszcze zapas na skok ruchu",
        "Czy jego opóźnienie p95 mieści się w kilku milisekundach od głównego"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co w parze na własnym węźle współdzielą klient wykonawczy i beacon node i gdzie działa Engine API?",
      options: [
        "Certyfikat TLS i klucz, a Engine API na porcie 8545",
        "Plik z 32-bajtowym sekretem JWT w hex, a Engine API na porcie 8551",
        "Klucz API wysyłany w nagłówku, a Engine API na porcie 5052",
        "Wspólny keystore walidatora, a Engine API na porcie 30303"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Zespół ma własny węzeł z domyślnym pruningiem i uruchamia eth_call na bloku sprzed roku. Co się dzieje?",
      options: [
        "Działa, bo każdy zsynchronizowany pełny węzeł przechowuje cały stan",
        "Działa, ale powoli, bo węzeł wykonuje wszystko od genesis",
        "Zwraca bieżący stan, po cichu ignorując podany blok",
        "Kończy się błędem, bo pruned node trzyma tylko niedawny stan"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego ciężkie indeksowanie i symulacje są zwykle tańsze na własnym sprzęcie niż u providera?",
      options: [
        "Własne węzły wykonują wywołania równolegle, czego providerom nie wolno",
        "Brak compute units i poziomów planów, a limity zakresu można podnieść samemu",
        "Własne węzły pomijają walidację bloków przy odczytach, więc każde wywołanie jest tańsze",
        "Własne węzły domyślnie serwują stan archiwalny bez dodatkowego miejsca na dysku"
      ],
      answer: 1
    }
  ],
  "load-balancer": [
    {
      kind: "cause",
      question: "Dlaczego za load balancerem round robin eth_getFilterChanges kończy się błędem filter not found?",
      options: [
        "Filtr wygasł, bo load balancer dodał opóźnienie do żądania",
        "Id filtrów są przypisane do klucza API, a load balancer usuwa klucz",
        "Id istnieje tylko w pamięci węzła, który utworzył filtr",
        "Load balancer zmienił id, gdy ponownie kodował body żądania"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Wywołujący za twoim load balancerem widzą, że head skacze do tyłu między kolejnymi żądaniami. Jaka jest najtańsza poprawka?",
      options: [
        "Odpytywanie health checku każdego upstreamu w dużo krótszych odstępach",
        "Dodanie upstreamów, żeby średni head w puli był świeższy",
        "Sticky session, żeby żądania wywołującego trafiały do jednego upstreamu",
        "Wyłączenie keep-alive, żeby każde żądanie otwierało nowe połączenie"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co gateway RPC odczytuje z każdego wywołania, czego nie widzi zwykły round robin HTTP przed tymi samymi węzłami?",
      options: [
        "Kod statusu HTTP, który każdy upstream zwraca dla żądania",
        "Nazwę metody w body każdego żądania JSON-RPC",
        "Czy każdy upstream nadal przyjmuje połączenia TCP",
        "Adres IP klienta, z którego przychodzi każde żądanie"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "WebSocket z aktywnym eth_subscribe zrywa się i łączy ponownie przez load balancer z innym węzłem. Co się dzieje?",
      options: [
        "Nowy węzeł wznawia subskrypcję od ostatniego wysłanego bloku",
        "Load balancer odtwarza pominięte powiadomienia ze swojego bufora",
        "Subskrypcja znika, a bloki z luki zostają pominięte",
        "Subskrypcja przechodzi nietknięta, bo id są wspólne dla całej puli"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Backend portfela odczytuje eth_getTransactionCount z pending z węzła A, a potem wysyła transakcję przez węzeł B. Co może pójść nie tak?",
      options: [
        "Luka w nonce albo duplikat, bo pending odzwierciedla mempool jednego węzła",
        "Nic, bo każdy zdrowy węzeł widzi ten sam zbiór transakcji pending",
        "Węzeł B ją odrzuci, bo transakcja musi trafić do węzła, który ustalił nonce",
        "Transakcja zostanie wysłana dwa razy, po razie przez każdy węzeł w puli"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Load balancer waży upstreamy według zmierzonego zdrowia. Kiedy powinien wyjąć upstream z rotacji?",
      options: [
        "Gdy nie odpowie na jedno sprawdzenie TCP w danym odstępie",
        "Gdy jego head jest więcej niż jeden lub dwa bloki za najlepszym znanym",
        "Gdy eth_syncing zwróci false, choć wcześniej zwracało obiekt",
        "Gdy jego head jest więcej niż 64 bloki, czyli dwie epoki, za finalized"
      ],
      answer: 1
    }
  ],
  "rpc-gateway": [
    {
      kind: "contrast",
      question: "Co pozwala zrobić gatewayowi dekodowanie komunikatu JSON-RPC, czego nie potrafi zwykłe proxy TCP?",
      options: [
        "Terminować TLS dla wywołujących i samodzielnie odnawiać certyfikat",
        "Trzymać otwarte połączenia klientów, ponawiając na tym samym węźle",
        "Routować po metodzie, cache'ować po bloku i odrzucać przestrzenie nazw",
        "Kompresować odpowiedzi w drodze powrotnej i limitować rozmiar body"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Gateway dzieli batch między upstreamy i składa odpowiedzi z powrotem. Czego nigdy nie może pomylić?",
      options: [
        "Kolejności tablicy, bo wywołujący dopasowują wyniki po pozycji",
        "Kodu statusu HTTP łącznej odpowiedzi, którą zwraca wywołującym",
        "Dopasowania po id, bo wynik pod złym id psuje wywołujących",
        "Nagłówka Content-Length, który liczy dla scalonego body odpowiedzi"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego allowlista metod w gatewayu ma większe znaczenie przed własnymi upstreamami niż przed hostowanymi?",
      options: [
        "Własne węzły nie potrafią same egzekwować rate limitów per klucz API",
        "Providerzy doliczają opłatę za każde wywołanie zablokowanej przestrzeni nazw",
        "We własnym węźle Engine API dzieli port z publicznym RPC",
        "Providerzy zwykle już blokują ryzykowne przestrzenie nazw, własne węzły nie"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Chcesz, żeby każde wywołanie trafiało do kilku niezależnych upstreamów, a ich odpowiedzi były porównywane przed zwróceniem jednej. Który gateway się na tym skupia?",
      options: ["Blutgang", "Proxyd", "dshackle", "eRPC"],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Gateway robi failover na drugi upstream za każdym razem, gdy wywołanie wraca z execution reverted. Jaki jest skutek?",
      options: [
        "Drugi upstream zwykle odpowiada poprawnie, bo reverty zależą od węzła",
        "Każdy upstream robi revert tak samo, więc koszt mnoży się na darmo",
        "Gateway w końcu trafia na węzeł archiwalny, który wykona wywołanie",
        "Wywołujący dostaje kilka odpowiedzi z tym samym id żądania"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co śledzi Proxyd, proxy używane w OP Stack, żeby nigdy nie kierować wywołującego do opóźnionego backendu?",
      options: [
        "Kworum identycznych odpowiedzi na każde wywołanie przed zwróceniem jednej",
        "Wspólny cache odpowiedzi w Redisie z kluczem z surowego body żądania",
        "Uzgodniony obraz headów latest, safe i finalized",
        "Saldo compute units per klucz, które dolicza każdemu wywołującemu"
      ],
      answer: 2
    }
  ],
  "head-lag": [
    {
      kind: "scenario",
      question: "Odczytujesz receipt z jednego endpointu i saldo na latest z drugiego, a wyniki sobie przeczą. Co to wyjaśnia?",
      options: [
        "Jeden z węzłów podąża za zupełnie innym forkiem łańcucha",
        "Receipt pochodzi z cache, a saldo odczytano na świeżo na latest",
        "Węzły są na różnych wysokościach, więc opisują różne punkty łańcucha",
        "Salda zmieniają się dopiero po sfinalizowaniu bloku z transferem"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego w zestawie powiązanych odczytów jawny numer bloku jest lepszy niż wysyłanie latest w każdym wywołaniu?",
      options: [
        "Jawne numery bloków kosztują mniej compute units niż tag latest",
        "Węzeł bez tego bloku głośno zgłasza błąd, zamiast użyć starszego",
        "Tag latest jest w obecnych klientach przestarzały na rzecz safe",
        "Jawne numery omijają cache gatewaya i zawsze trafiają do węzła"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Indekser odczytuje head z jednego węzła, skanuje eth_getLogs do latest na drugim, który jest blok z tyłu, a potem ustawia kursor na head pierwszego węzła. Jaki jest skutek?",
      options: [
        "Drugi węzeł zwraca błąd, bo zakres wykracza poza jego head",
        "Logi z tego bloku przychodzą później z polem removed ustawionym na true",
        "Blok, którego drugi węzeł nie miał, zostaje pominięty na zawsze",
        "Drugi węzeł czeka, aż zaimportuje blok, i dopiero wtedy odpowiada"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co odróżnia zwykły head lag między dwoma zdrowymi węzłami od reorga?",
      options: [
        "Węzły nie zgadzają się, który blok na tej samej wysokości jest kanoniczny",
        "Węzły zgadzają się co do łańcucha, ale są w różnych jego punktach",
        "Opóźnione węzły usunęły w pruningu bloki, które ma węzeł prowadzący",
        "Lag dotyczy tylko bloków sfinalizowanych, a reorgi tylko najnowszych"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Wysyłasz transakcję przez endpoint A, trafia ona do bloku, a eth_getTransactionReceipt na endpoincie B zwraca null. Co powinien zrobić wywołujący?",
      options: [
        "Wysłać ją ponownie z tym samym nonce i wyższą opłatą, żeby ją zastąpić",
        "Rozgłosić ją ponownie z nowym nonce, bo B nigdy jej nie widział",
        "Dalej odpytywać; B najpewniej jeszcze nie zaimportował bloku",
        "Uznać ją za revert, bo receipt null oznacza status 0x0"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Klient prowadzi high-water mark podczas odczytów przez pulę węzłów. Do czego on służy?",
      options: [
        "Do ograniczania, jak daleko zakres eth_getLogs może sięgać poza finalized",
        "Do zapisywania, o ile bloków każdy upstream jest za punktem odniesienia",
        "Do odrzucania odpowiedzi policzonych poniżej najwyższego widzianego bloku",
        "Do ograniczania, ile żądań jeden wywołujący może mieć jednocześnie w toku"
      ],
      answer: 2
    }
  ],
  failover: [
    {
      kind: "scenario",
      question: "Decydujesz, czy zrobić failover żądania na inny upstream. Która odpowiedź to uzasadnia?",
      options: [
        "Kod 3 execution reverted z danymi revertu z eth_call",
        "-32602 invalid params dla błędnego obiektu filtra eth_getLogs",
        "-32000 missing trie node, który głębszy upstream może obsłużyć",
        "already known przy ponownym wysłaniu podpisanej transakcji"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego failover na niezweryfikowany upstream, który jest za headem, jest gorszy niż pozostanie przy tym, który zwraca błędy?",
      options: [
        "Opóźniony upstream nalicza więcej compute units za każdy nieaktualny odczyt",
        "Wywołujący dostają nieaktualne odpowiedzi, którym ufają, zamiast błędów",
        "Opóźniony węzeł odrzuca zapisy, więc wysłane transakcje przepadają",
        "Główny upstream blokuje klucz API wywołującego, gdy ruch od niego odejdzie"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Który krok wysyłania transakcji musi podczas failoveru zostać na jednym upstreamie?",
      options: [
        "Rozgłaszanie podpisanych bajtów, bo druga kopia tworzy drugą transakcję",
        "Estymacja gasu, bo dwie estymacje kolidowałyby przy włączeniu do bloku",
        "Ustalanie następnego nonce, bo widok pending każdego upstreamu jest inny",
        "Odpytywanie o receipt, bo receipty są zapisywane tylko tam, gdzie wysłano"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co w polityce failoveru odróżnia -32601, błąd nieznanej metody, od -32602 invalid params?",
      options: [
        "-32601 to bug wywołującego; -32602 może obsłużyć inny upstream",
        "-32601 może obsłużyć inny upstream; -32602 to bug wywołującego",
        "To dwa błędy limitu, więc każdy wymaga backoffu, a potem failoveru",
        "To dwa błędy deterministyczne, więc żaden nie powinien wyzwalać failoveru"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Upstream WebSocket pada, a twój klient łączy się ponownie z innym węzłem. Co musi zrobić, żeby nie zgubić eventów?",
      options: [
        "Nic; nowy węzeł sam odtworzy powiadomienia ze starej subskrypcji",
        "Użyć starego id subskrypcji, które rozpoznaje każdy węzeł w puli",
        "Odnowić subskrypcję i uzupełnić lukę przez eth_getLogs od ostatniego pełnego bloku",
        "Wywołać eth_getFilterChanges ze starym id filtra, żeby pobrać brakujące bloki"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Gdy główny upstream po awarii wraca do zdrowia, jak ruch powinien do niego wrócić?",
      options: [
        "Natychmiast, w chwili gdy przejdzie jeden health check",
        "Dopiero po pełnej resynchronizacji głównego węzła ze świeżego snapshotu",
        "Po cooldownie i próbie w trybie półotwartym, nie po pierwszym udanym sprawdzeniu",
        "Dopiero w następnej sfinalizowanej epoce, żeby upstreamy zgadzały się co do heada"
      ],
      answer: 2
    }
  ],
  retries: [
    {
      kind: "scenario",
      question: "Twoje wywołanie eth_sendRawTransaction kończy się timeoutem bez body odpowiedzi. Jaki jest najbezpieczniejszy następny krok?",
      options: [
        "Podpisać transakcję ponownie z następnym nonce i wysłać ją zamiast tamtej",
        "Sprawdzić lokalnie policzony hash przez eth_getTransactionByHash",
        "Założyć, że węzeł ją odrzucił, i zgłosić porażkę użytkownikowi",
        "Sprawdzić eth_getTransactionCount na pending i brak zmiany uznać za odrzucenie"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego ponowne wysłanie dokładnie tych samych podpisanych bajtów transakcji jest bezpieczne?",
      options: [
        "Mempool usuwa duplikaty po adresie nadawcy i odrzuca późniejszą kopię",
        "eth_sendRawTransaction ignoruje każde żądanie powtórzone w obrębie bloku",
        "Hash wynika z podpisu, więc to wciąż ta sama transakcja",
        "Węzeł przyjmuje najwyżej jedną transakcję od każdego konta w bloku"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Który błąd jest merytoryczną odpowiedzią, którą powtórzyłby każdy inny upstream, więc ponawianie go gdziekolwiek nie ma sensu?",
      options: [
        "504 gateway timeout zwrócony przez reverse proxy przed węzłem",
        "eth_call z odpowiedzią execution reverted i danymi revertu",
        "Zerwane połączenie w trakcie odczytu body odpowiedzi",
        "HTTP 429 z nagłówkiem Retry-After ustawionym na dwie sekundy"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego exponential backoff potrzebuje pełnego jittera, gdy wielu wywołujących korzysta z jednego upstreamu?",
      options: [
        "Bez niego klienci, którzy razem dostali błąd, ponawiają w tej samej chwili",
        "Bez niego odstęp backoffu nigdy nie przekracza limitu z pierwszej próby",
        "Jitter pozwala węzłowi zmienić kolejność ponowień i najpierw obsłużyć zapisy",
        "Providerzy odrzucają ponowienia przychodzące dokładnie w potęgach dwójki sekund"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Ponowiony batch dwudziestu wywołań wraca po częściowym throttlingu z tylko siedemnastoma elementami. Co pójdzie nie tak, jeśli klient dopasowuje wyniki po pozycji?",
      options: [
        "Klient dostaje błąd parsowania, bo tablica jest niepoprawna",
        "Odpowiedzi trafiają do innych żądań niż te, na które odpowiadają",
        "Nic, bo odpowiedź zachowuje kolejność wysłanego batcha",
        "Węzeł sam ponawia trzy zablokowane elementy przed odpowiedzią"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym ponowione eth_getBalance na latest różni się od ponowionego na jawnym numerze bloku?",
      options: [
        "Wersja z latest idzie z cache, a przypięta zawsze trafia do węzła",
        "Przypięta kosztuje więcej limitu, a latest ma stałą stawkę",
        "Latest może dostać odpowiedź z nowszego bloku, a przypięta się powtarza",
        "Przypięta może zrobić revert przy ponowieniu, a latest zwraca tę samą wartość"
      ],
      answer: 2
    }
  ],
  caching: [
    {
      kind: "detail",
      question: "Przez cache przechodzą cztery rodzaje odpowiedzi. Którą może przechowywać bez końca?",
      options: [
        "eth_getBalance dla adresu, wyliczone przy tagu latest",
        "eth_getLogs po zakresie kończącym się na finalized lub niżej",
        "eth_getTransactionReceipt dla hasha, który zwrócił null",
        "eth_getTransactionCount dla adresu przy tagu pending"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Cache buduje klucze z surowego body żądania JSON. Co pójdzie nie tak?",
      options: [
        "Nic, bo body jednoznacznie identyfikuje odpowiedź",
        "Odpowiedzi z błędem nie da się zapisać, bo ich body jest puste",
        "Wywołania z latest mają stały klucz, choć odpowiedź zmienia się co blok",
        "Adresy muszą mieć checksum, zanim dwa poza tym identyczne żądania trafią w jeden klucz"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego zapisanie w cache null zamiast receiptu jest gorsze niż brak cache'owania?",
      options: [
        "Odpowiedzi null zajmują więcej miejsca niż receipty i marnują pamięć cache",
        "null zwykle oznacza opóźnienie head, a zapisanie go utrwala lukę",
        "null pojawia się tylko wtedy, gdy endpoint nakłada rate limit na wywołującego",
        "null zapisany w cache wstrzymuje dalszy gossip transakcji"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co dla cache odróżnia odpowiedź adresowaną hashem bloku od odpowiedzi wyliczonej dla sfinalizowanego numeru bloku?",
      options: [
        "Hash może zostać użyty ponownie przez późniejszy blok, a sfinalizowany numer nie",
        "Sfinalizowany blok może zostać usunięty reorgiem, a blok adresowany hashem nie",
        "Hash wyznacza treść, ale ten blok wciąż może wypaść z kanonicznego łańcucha",
        "Hash wyznacza tylko nagłówek, a finalized także receipty i logi"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Przed endpointem JSON-RPC postawiono CDN, który prawie nic nie cache'uje. Dlaczego?",
      options: [
        "CDN nie cache'uje żadnej odpowiedzi o typie treści application/json",
        "Każda odpowiedź JSON-RPC ma nagłówek no-store ustawiany przez węzeł",
        "Żądania to POST-y z wywołaniem w body, a CDN buduje klucz z URL-a",
        "CDN cache'uje poprawnie, ale każdy nowy blok unieważnia całą jego zawartość"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Którą z tych odpowiedzi z błędem cache może przechować jako prawdziwą odpowiedź o łańcuchu?",
      options: [
        "429 z edge proxy stojącego przed węzłem",
        "Revert z eth_call na ustalonym numerze bloku",
        "Błąd -32005 limit exceeded od providera",
        "Timeout podczas czekania na zakończenie eth_getLogs"
      ],
      answer: 1
    }
  ],
  "rate-limits": [
    {
      kind: "detail",
      question: "Endpoint zwraca HTTP 200 z błędem JSON-RPC o kodzie -32005. Co się stało?",
      options: [
        "Żądanie było źle sformułowane i trzeba je poprawić przed ponownym wysłaniem",
        "Blok, o który pytano, wypadł z kanonicznego łańcucha przez reorg",
        "Przekroczono tu limit; trzeba zwolnić albo przejść gdzie indziej",
        "Węzeł wciąż się synchronizuje i nie ma jeszcze odpowiedzi dla tego bloku"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Skanowanie eth_getLogs kończy się błędem query returned more than 10000 results. Jaka reakcja jest poprawna?",
      options: [
        "Ponowić identyczny zakres po krótkiej przerwie, z backoffem z jitterem",
        "Przejść na eth_newFilter, który nie ma limitu liczby zwracanych wyników",
        "Zmniejszyć zakres bloków o połowę i kontynuować od tego samego kursora",
        "Pominąć ten zakres i skanować dalej od następnego bloku"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego żądania na sekundę to słaba jednostka do budżetowania w planie providera?",
      options: [
        "Providerzy mierzą tylko transfer, nigdy liczbę przychodzących żądań",
        "Liczniki żądań zerują się co blok, a nie raz na miesiąc rozliczeniowy",
        "Plany liczą compute units, a kilka trace'ów przeważa wiele odczytów heada",
        "Powyżej pewnego poziomu planu limity współbieżności zastępują rate limity"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego klient, który parsuje każdą odpowiedź jako format komunikatu JSON-RPC, źle raportuje 429 z edge proxy?",
      options: [
        "Edge proxy opakowuje body 429 w błąd -32005, którego klient nie umie odczytać",
        "Body 429 zawiera result równy null, który klient odczytuje jako brak danych",
        "Body 429 z warstwy edge często nie jest JSON-RPC, więc parsowanie się wywala",
        "Edge odpowiada 429 na usunięte bloki, co wygląda jak reorg"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Indekser dostaje 429 dla jednego zakresu eth_getLogs, zapisuje go jako pusty i przesuwa kursor. Jaki jest skutek?",
      options: [
        "Nic nie ginie, bo 429 oznacza, że zakres nie miał pasujących logów",
        "Węzeł kolejkuje zakres i wysyła jego logi w trybie push po odnowieniu limitu",
        "Trwała dziura, bo tego zakresu bloków nigdy faktycznie nie odczytano",
        "Provider zwraca compute units i później sam odtwarza ten zakres"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co odróżnia limit zgłoszony przez edge proxy od limitu zgłoszonego przez węzeł albo warstwę providera za nim?",
      options: [
        "Edge wysyła 200 z -32005; węzeł zamyka połączenie",
        "Każda z warstw wysyła HTTP 429, ale tylko węzeł dodaje nagłówek Retry-After",
        "Edge wysyła HTTP 503; węzeł wysyła 429 z body JSON-RPC",
        "Edge wysyła HTTP 429; węzeł wysyła 200 z błędem JSON-RPC"
      ],
      answer: 3
    }
  ],
  authentication: [
    {
      kind: "detail",
      question: "Czego właściwie dowodzi JWT w Engine API?",
      options: [
        "Że wywołujący kontroluje klucz walidatora zarejestrowany on-chain",
        "Że klienci współdzielą sekret i są zamierzoną parą",
        "Że execution payload przesłany w żądaniu jest poprawny",
        "Że połączenie między dwoma procesami idzie przez TLS"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Klient konsensusu na jednym hoście nagle nie może sterować klientem wykonawczym na innym, który loguje invalid token, choć konfiguracja się nie zmieniła. Jaka jest najbardziej prawdopodobna przyczyna?",
      options: [
        "Sekret JWT osiągnął datę ważności i trzeba go wydać ponownie",
        "Zegar jednego hosta rozjechał się z drugim o ponad 60 sekund",
        "Engine API przeniosło się na inny port przy ostatniej aktualizacji",
        "Klient wykonawczy nie ma peerów i odrzuca wywołania z uwierzytelnieniem"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Dapp w przeglądarce musi wywoływać hostowany endpoint RPC. Gdzie powinien być klucz API providera?",
      options: [
        "W bundlu frontendu, zaciemniony, żeby trudno go było odczytać",
        "W localStorage, zapisany tam raz przy pierwszym załadowaniu strony",
        "W nagłówku subprotokołu WebSocket, który przeglądarki trzymają w tajemnicy",
        "W backendzie wywoływanym przez frontend albo za allowlistą domen"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego klucz hostowanego endpointu powinien iść w nagłówku, a nie w ścieżce URL, jeśli klient na to pozwala?",
      options: [
        "Klucze w ścieżce mają limit 32 znaków, za mało dla bezpieczeństwa",
        "Klucz w nagłówku szyfruje TLS, a ścieżka URL idzie otwartym tekstem",
        "Klucz w ścieżce wycieka do logów proxy, historii przeglądarki i referrerów",
        "Providerzy liczą żądania z kluczem w ścieżce po wyższej stawce compute units"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co sprawia, że w połączeniach maszyna–maszyna we własnej sieci mutual TLS jest mocniejszy niż klucz bearer?",
      options: [
        "Eliminuje potrzebę allowlisty metod w warstwie gatewaya",
        "Pozwala bezpiecznie przenieść Engine API z loopbacku na publiczny port",
        "Nic tajnego nie podróżuje w URL, gdzie mogłoby trafić do logów albo wyciec",
        "Zastępuje JWT między klientem konsensusu a klientem wykonawczym"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Jeden klucz API dzielą staging i produkcja, a klucz wycieka ze stagingu. Ile kosztuje jego unieważnienie?",
      options: [
        "Produkcja działa dalej, bo unieważnienie dotyczy tylko originu, z którego wyciekł",
        "Dostęp traci tylko staging, bo klucze są przypisane do sieci",
        "Wszystkie klucze konta zostają zrotowane, ale ruch płynie dalej",
        "Produkcja też traci dostęp, bo korzysta z tego samego klucza"
      ],
      answer: 3
    }
  ],
  "reverse-proxy": [
    {
      kind: "scenario",
      question: "Subskrypcje przez nowy front nginx łączą się bez problemu, a po mniej więcej minucie się zrywają. Jaka jest najbardziej prawdopodobna przyczyna?",
      options: [
        "Port WebSocket węzła nigdy nie został włączony flagą ws",
        "eth_subscribe wymaga TLS 1.3, którego proxy nie wynegocjowało",
        "proxy_read_timeout domyślnie wynosi 60 sekund i zamyka bezczynne łącza",
        "Węzeł zrywa wszystkie otwarte subskrypcje na granicy każdej epoki"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Które zadanie należy do gatewaya RPC za proxy, a nie do samego reverse proxy?",
      options: [
        "Terminacja TLS i odnawianie certyfikatu przed jego wygaśnięciem",
        "Limit rozmiaru body, żeby zbyt duży batch nie dotarł do węzła",
        "Cache'owanie wyników eth_call pod blokiem, na którym je policzono",
        "Limit żądań na sekundę i połączeń dla każdego adresu IP klienta"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Po postawieniu Getha za proxy pod rpc.example każde żądanie kończy się błędem invalid host specified. Co to naprawi?",
      options: [
        "Ustawienie --http.corsdomain na publiczną nazwę hosta",
        "Dodanie publicznej nazwy hosta do --http.vhosts",
        "Wystawienie przez proxy także portu 8551",
        "Restart węzła z opcją --http.addr 0.0.0.0"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego klient wykonawczy taki jak Geth w ogóle potrzebuje reverse proxy, żeby oferować HTTPS?",
      options: [
        "Jego obsługa TLS obejmuje tylko port WebSocket, a nie żądania HTTP",
        "Jego wbudowany TLS przyjmuje tylko samopodpisane certyfikaty, które sam generuje",
        "Jego listener --http nie ma opcji TLS i obsługuje tylko zwykłe HTTP",
        "Serwuje TLS tylko na porcie 8551, zarezerwowanym dla klienta konsensusu"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Proxy nie przekazuje ani X-Forwarded-For, ani protokołu PROXY. Co dzieje się z rate limitami per IP za nim?",
      options: [
        "Przestają działać, więc każdy wywołujący ma nieograniczoną przepustowość",
        "Działają wtedy per sesja TLS, co jest mniej więcej równoważne",
        "Przechodzą na limity per klucz przekazywany w nagłówku klucza API",
        "Widzą jeden adres dla wszystkich i ograniczają ich jak jednego klienta"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Szeroki skan eth_getLogs trwa dłużej niż timeout odczytu proxy. Co widzi każda ze stron?",
      options: [
        "Proxy anuluje zapytanie na węźle i zwraca częściowe wyniki",
        "Węzeł zauważa timeout proxy i od razu przerywa skan",
        "Wywołujący dostaje 504, a węzeł dalej wykonuje zapytanie",
        "Wywołujący dostaje błąd -32005, a węzeł cache'uje wynik"
      ],
      answer: 2
    }
  ],
  security: [
    {
      kind: "detail",
      question: "Przed czym tak naprawdę chroni węzeł allowlista --http.vhosts?",
      options: [
        "Przed cross-site scriptingiem w eksploratorach bloków, które osadzają endpoint",
        "Przed powtórzeniem podpisanej transakcji na drugim łańcuchu z tym samym kluczem",
        "Przed DNS rebindingiem, gdy domena strony rozwiązuje się na 127.0.0.1",
        "Przed wywołującymi, którzy zmieniają adresy IP, żeby obejść rate limit per IP"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Ustalasz wartość --http.api dla publicznego endpointu. Która przestrzeń nazw powinna się w niej znaleźć obok eth i web3?",
      options: ["admin", "debug", "net", "txpool"],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Ktoś ustawia --http.corsdomain na * na węźle, który już jest osiągalny z internetu. Co się zmienia?",
      options: [
        "Wywołujący z przeglądarek są teraz uwierzytelniani nagłówkiem Origin",
        "Sprawdzanie nagłówka Host przez --http.vhosts zostaje wyłączone",
        "Skrypty dowolnej strony mogą teraz odczytywać jego odpowiedzi w przeglądarce",
        "Klienci spoza przeglądarki, tacy jak curl, nie mogą się już połączyć"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego przestrzeń nazw txpool_ powinna pozostać zamknięta na węźle, przez który twoi użytkownicy wysyłają transakcje?",
      options: [
        "Pozwala każdemu wywołującemu usuwać transakcje z mempoola węzła",
        "Odblokowuje konta węzła do podpisywania transakcji pending",
        "Uruchamia tracery, które zajmują rdzeń na minuty przy jednym wywołaniu",
        "Publikuje ich transakcje pending każdemu, kto o nie zapyta"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Węzeł działa z odblokowanymi kontami, a eth_sendTransaction jest osiągalne przez jego port RPC. Co to oznacza?",
      options: [
        "Niegroźną konfigurację, bo podpisywanie i tak wymaga sekretu JWT",
        "Bezpośredni dostęp do środków dla każdego, kto dosięgnie portu",
        "Ryzyko tylko dla przeglądarek, bo CORS blokuje wszystkich innych",
        "Wolny węzeł, bo podpisywanie zajmuje rdzeń przy każdym wywołaniu"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co odróżnia --http.vhosts od --http.corsdomain jako zabezpieczenia węzła?",
      options: [
        "corsdomain to zabezpieczenie, a vhosts dotyczy tylko odczytów w przeglądarce",
        "Każda z flag sprawdza nagłówek Origin, ale vhosts działa też dla WebSocket",
        "vhosts to zabezpieczenie oparte na Host, a corsdomain dotyczy tylko przeglądarek",
        "vhosts ogranicza źródłowe adresy IP, a corsdomain metody wywoływane z przeglądarek"
      ],
      answer: 2
    }
  ],
  observability: [
    {
      kind: "cause",
      question: "Dlaczego eth_syncing słabo sprawdza się jako liveness check endpointu RPC?",
      options: [
        "Nie implementuje jej każdy klient wykonawczy, który serwuje RPC",
        "Większość providerów nalicza za nią wyjątkowo dużo compute units",
        "Zwraca false na węźle, który po synchronizacji przestał importować",
        "Odpowiada tylko przez połączenie WebSocket, nigdy przez HTTP"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Wszystkie dashboardy HTTP są zielone, ale wywołujący zgłaszają błędy. Którego sygnału zabrakło?",
      options: [
        "Liczby retransmisji TCP na interfejsie sieciowym węzła",
        "Latencji rozwiązywania DNS mierzonej po stronie wywołującego",
        "Kodów błędów JSON-RPC w odpowiedziach z HTTP 200",
        "Latencji IO dysku NVMe węzła w trakcie kompaktowania"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Na monitorowanym węźle latest stale idzie do przodu, ale finalized nie zmienił się od pół godziny. Co to oznacza?",
      options: [
        "Reorg głęboki na trzydzieści minut przepisuje bloki za head",
        "Węzeł usunął pruningiem stan historyczny sprzed bloku finalized",
        "Finalność stanęła albo klient konsensusu przestał ją zgłaszać",
        "Cache odpowiedzi serwuje nieaktualną wartość dla tagu finalized"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Geth uruchomiono z --metrics --metrics.addr 127.0.0.1 --metrics.port 6060. Pod jaką ścieżką i na jakim porcie serwuje metryki?",
      options: [
        "/metrics na porcie 8545, obok JSON-RPC",
        "/debug/metrics/prometheus na porcie 6060",
        "/eth/v1/node/metrics na porcie 5052",
        "/metrics na porcie 8551, za JWT"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Dashboard uśrednia latencję ze wszystkich metod naraz. Co dzieje się z regresją w tracingu debug_?",
      options: [
        "Od razu wywołuje alert, bo trace'y dominują w średniej",
        "Ginie w średniej wśród milionów tanich zapytań o head",
        "Pojawia się jako skok odsetka błędów, a nie jako wyższa latencja",
        "Widać ją tylko na dashboardach klienta konsensusu, a nie EL"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Dlaczego latencja engine_newPayload jest lepszym wczesnym ostrzeżeniem niż alert o opóźnieniu head?",
      options: [
        "Mierzy, jak bardzo rozjechały się head poszczególnych węzłów floty",
        "Rośnie w stronę 12 sekund, zanim węzeł faktycznie zgubi jakikolwiek blok",
        "Pokazuje liczbę peerów dla każdej warstwy, której alert head nie widzi",
        "Raportuje postęp finalności, który alerty o opóźnieniu head z założenia ignorują"
      ],
      answer: 1
    }
  ],
  "health-check": [
    {
      kind: "scenario",
      question: "Sprawdzenie weryfikuje tylko, czy port odpowiada i czy eth_syncing zwraca false. Węzeł przechodzi, a wywołujący dostają dane sprzed kilku godzin. Co się stało?",
      options: [
        "Nadal się synchronizuje, a eth_syncing zwraca false podczas state heal",
        "Serwuje testnet, którego bloki mają znaczniki czasu o godziny wcześniejsze",
        "Skończył synchronizację, a potem przestał importować nowe bloki",
        "Usunął najnowsze bloki w pruningu, więc latest wskazuje starszy blok"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego sprawdzenie świeżości powinno porównywać timestamp najnowszego bloku z bieżącym czasem, zamiast odczytywać eth_blockNumber?",
      options: [
        "Numery bloków mogą maleć podczas reorga, a timestampy nie mogą",
        "eth_blockNumber jest rozliczane drożej niż eth_getBlockByNumber",
        "Sam numer bloku nie mówi, jak dawno ten blok przyszedł",
        "Timestampy ustawia warstwa konsensusu, poza zasięgiem proposera"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jaki próg świeżości heada jest rozsądny dla endpointu mainnetu Ethereum?",
      options: [
        "12 sekund, dokładnie jeden slot, żeby wyłapać każde opóźnienie",
        "Około 40 sekund, co toleruje kilka pominiętych slotów",
        "6,4 minuty, czyli długość jednej pełnej epoki z 32 slotów",
        "Około 13 minut, czyli typowy czas do sfinalizowania bloku"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Health check wyrzuca i przywraca upstream za każdym razem na podstawie jednej próbki. Co dzieje się z węzłem na granicy sprawności?",
      options: [
        "Pozostaje wyrzucony, dopóki operator go nie zrestartuje i nie wyczyści flagi",
        "Zostaje awansowany na główny, bo odpowiedział na ostatnie sprawdzenie",
        "Zostaje oznaczony jako tylko archiwalny i dostaje same zapytania historyczne",
        "Na przemian wypada z puli i do niej wraca, za każdym razem zabierając żądania"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Sprawdzenie idzie tą samą ścieżką co wywołujący, łącznie z cache odpowiedzi, i ciągle zgłasza martwy upstream jako zdrowy. Co powinno się zmienić?",
      options: [
        "Sprawdzać port węzła bezpośrednio, samym połączeniem TCP",
        "Zostawić TLS i proxy na ścieżce, ale ominąć cache",
        "Wydłużyć interwał, żeby wpisy w cache zdążyły wygasnąć",
        "Przejść na eth_syncing, którego cache nigdy nie przechowuje"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego zdrowie trzeba śledzić osobno dla każdej możliwości, a nie jako jedną flagę na upstream?",
      options: [
        "Każda możliwość działa w osobnym procesie, który może paść niezależnie",
        "Providerzy rozliczają każdą możliwość osobno, więc jedna flaga zaniża koszt",
        "Jeden węzeł może dobrze obsługiwać odczyty latest i zawodzić przy trace_",
        "Load balancer potrzebuje jednej wagi na metodę, żeby równo dzielić ruch"
      ],
      answer: 2
    }
  ],
  "endpoint-capabilities": [
    {
      kind: "scenario",
      question: "Endpoint odpowiada -32601 na trace_block i -32000 missing trie node na stare eth_getBalance. Co razem mówią te dwie odpowiedzi?",
      options: [
        "Węzeł wciąż się synchronizuje i po zakończeniu obsłuży te wywołania",
        "Klucz API wyczerpał limit dla tych dwóch metod w tym planie",
        "trace_ nie jest włączone, a ten stary stan wypadł poza retencję",
        "Wskazany blok wypadł z kanonicznego łańcucha przez reorg"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Które wywołanie podaje nazwę i wersję oprogramowania klienta działającego za endpointem?",
      options: ["eth_protocolVersion", "web3_clientVersion", "net_version", "net_listening"],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego sondowanie możliwości trzeba powtarzać po każdej aktualizacji sieci?",
      options: [
        "Przy każdym zaplanowanym hard forku sieci dostają nowe chain ID",
        "Retencja archiwum zeruje się w pierwszym bloku po forku",
        "Zmieniają się wersje klientów, a z nimi tracery, metody i błędy",
        "Provider musi wydać nowe klucze API, żeby działały po forku"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Endpoint archiwalny odpowiada na eth_getBalance w starych blokach. Co to mówi o historycznym eth_getProof na nim?",
      options: [
        "Też działa, bo te metody czytają ten sam historyczny stan z dysku",
        "Nie działa, bo węzły archiwalne nie implementują eth_getProof",
        "Nic pewnego; płaskie archiwum może nie mieć trie node'ów do dowodów",
        "Działa, ale tylko dla bloków do tagu finalized włącznie"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Aplikacja przy starcie sprawdza wymagane możliwości i odmawia startu z upstreamem bez trace_. Co to daje?",
      options: [
        "Automatyczną instalację przestrzeni nazw trace_ na tym upstreamie",
        "Niższą stawkę compute units, bo sondowane endpointy liczą mniej",
        "Nic, bo możliwości upstreamu są stałe przez cały czas jego życia",
        "Błąd konfiguracji przy starcie zamiast incydentu na produkcji"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Jedno szerokie skanowanie eth_getLogs udaje się na endpoincie. Dlaczego ten sam zakres może jutro zawieść?",
      options: [
        "Limity zakresu obowiązują tylko na połączeniach WebSocket, nie HTTP",
        "Pierwsze żądanie w każdej sesji jest zwolnione z limitu zakresu",
        "Niektóre limity dotyczą rozmiaru odpowiedzi, a ten zależy od ruchu w blokach",
        "Limity zakresu dotyczą tylko niesfinalizowanych bloków blisko heada"
      ],
      answer: 2
    }
  ],
  "private-rpc": [
    {
      kind: "scenario",
      question: "Transakcja poszła przez prywatne RPC, a eth_getTransactionByHash na własnym węźle zwraca null. Co to oznacza?",
      options: [
        "Endpoint odrzucił transakcję, zanim przekazał ją builderom",
        "Nonce został już użyty przez wcześniejszą transakcję z tego konta",
        "Nic złego; nie weszła do publicznego mempoolu, który widzi węzeł",
        "Podpis nie przeszedł weryfikacji po dotarciu do prywatnego endpointu"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Jaką gwarancję daje eth_sendBundle ponad zwykłe eth_sendRawTransaction?",
      options: [
        "Transakcja trafia do pierwszego bloku po wysłaniu",
        "Trafiają razem, w podanej kolejności, do jednego bloku albo wcale",
        "Gas wraca on-chain, jeśli któraś transakcja z listy zakończy się revertem",
        "Transakcje są rozgłaszane naraz do wszystkich węzłów w sieci"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego prywatnie wysłana transakcja może czekać na włączenie dłużej niż publiczna?",
      options: [
        "Prywatne transakcje płacą niższy priority fee z mocy protokołu",
        "Endpoint czeka z przekazaniem, aż poprzedni blok zostanie sfinalizowany",
        "Może ją włączyć tylko blok zbudowany przez uczestniczącego buildera",
        "Prywatne transakcje są przetwarzane tylko na granicach epok"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co przyjmuje jako parametr eth_sendPrivateTransaction?",
      options: [
        "Goły ciąg hex z podpisanymi bajtami, dokładnie jak eth_sendRawTransaction",
        "Obiekt z tx, opcjonalnym maxBlockNumber i preferences",
        "Listę surowych transakcji z docelowym blockNumber i timestampami",
        "Niepodpisany obiekt transakcji, który endpoint podpisuje za nadawcę"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Bot wysyła raz bundle na blok N i czeka, ale blok N powstaje bez niego. Co dzieje się dalej?",
      options: [
        "Endpoint przenosi go dalej, aż włączy go któryś późniejszy blok",
        "Po minięciu tego bloku trafia awaryjnie do publicznego mempoolu",
        "Przepada; bundle trzeba wysyłać ponownie na każdy kolejny blok",
        "Czeka jako pending, aż minie wartość z jego pola maxBlockNumber"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Kto widzi transakcję wysłaną przez Flashbots Protect albo MEV Blocker, zanim trafi do bloku?",
      options: [
        "Nikt nie widzi jej treści przed włączeniem, nawet builderzy",
        "Jej calldata jest zaszyfrowane on-chain, więc odczyta je tylko nadawca",
        "Tylko builderzy, do których trafiła, a nie cała sieć",
        "Jest ukryta przed builderami, ale z wyprzedzeniem trafia do walidatorów"
      ],
      answer: 2
    }
  ],
  cors: [
    {
      kind: "scenario",
      question: "Dapp dostaje błąd CORS, gdy wywołuje węzeł z przeglądarki, a identyczne żądanie z curl działa. Co wyjaśnia tę różnicę?",
      options: [
        "curl podpisuje żądania, a węzły akceptują to zamiast CORS",
        "Węzły przepuszczają narzędzia wiersza poleceń po User-Agent",
        "curl nie wysyła preflightu i ignoruje nagłówki CORS",
        "curl używa połączenia keep-alive, które pomija sprawdzanie CORS"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego nasłuch RPC węzła tylko na 127.0.0.1 nie chroni go przed złośliwą stroną otwartą na tej samej maszynie?",
      options: [
        "Strona może przepiąć DNS swojej domeny na 127.0.0.1 i wywołać węzeł",
        "Przeglądarki traktują adresy loopback jako ten sam origin co każdą stronę",
        "Listenery na loopbacku przyjmują też wywołania z segmentu sieci lokalnej",
        "Żądania preflight są zwolnione ze sprawdzania adresu nasłuchu węzła"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym --http.vhosts w Geth różni się od --http.corsdomain?",
      options: [
        "vhosts filtruje originy WebSocket, a corsdomain originy HTTP",
        "vhosts ogranicza adresy IP, które mogą się łączyć, a corsdomain porty",
        "vhosts ustawia nagłówki odpowiedzi, a corsdomain odrzuca żądania kodem 403",
        "Węzeł sprawdza Host według vhosts, a corsdomain egzekwują przeglądarki"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Jaka jest domyślna wartość JsonRpc.CorsOrigins w Nethermind?",
      options: [
        "Pusta lista, która nie dopuszcza żadnego originu",
        "Wildcard, który dopuszcza każdy origin",
        "Tylko localhost i 127.0.0.1 jako originy",
        "Ta sama nazwa hosta, którą ustawiono w JsonRpc.Host"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Operator ustawia --http.vhosts na wildcard na węźle na stacji roboczej, który nasłuchuje na loopbacku. Co z tego wynika?",
      options: [
        "Hosty z internetu mogą teraz łączyć się z listenerem na loopbacku",
        "Przeglądarki przestają wysyłać preflighty, więc wywołania JSON-RPC przyspieszają",
        "Strona z rebindingiem może dotrzeć do węzła przez przeglądarkę użytkownika",
        "Każda odpowiedź zawiera teraz liberalny nagłówek Access-Control"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Wywołania HTTP dappa do Getha działają, ale handshake WebSocket z tej samej strony jest odrzucany. Jaka jest prawdopodobna poprawka?",
      options: [
        "Dodać origin strony do --ws.origins",
        "Dodać origin strony do --http.vhosts",
        "Ustawić --http.corsdomain na wildcard",
        "Wysłać preflight przed upgrade'em"
      ],
      answer: 0
    }
  ],
  "circuit-breaker": [
    {
      kind: "scenario",
      question: "Pojedynczy breaker per upstream w gatewayu ciągle wyrzuca węzeł archiwalny, którego workery trace są nasycone, choć eth_call działa na nim szybko. Co to naprawia?",
      options: [
        "Liczenie timeoutów jako sukcesów, żeby okno nie przekraczało progu",
        "Podział breakera według klas metod, żeby odcinać tylko wywołania trace",
        "Skrócenie cooldownu, żeby węzeł szybciej wracał do rotacji",
        "Zastąpienie breakera sprawdzaniem połączenia TCP co sekundę"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego revert zwrócony jako kod błędu 3 nigdy nie powinien liczyć się do okna błędów breakera?",
      options: [
        "Reverty są zbyt rzadkie, żeby w praktyce zmienić odsetek błędów",
        "Gatewaye nie potrafią parsować kodów błędów powyżej zakresu -32000",
        "Klient ponawia reverty, zanim breaker w ogóle je zobaczy",
        "To poprawna odpowiedź, którą zwróciłby każdy inny upstream"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym circuit breaker różni się od aktywnego health checku?",
      options: [
        "Ocenia upstream po prawdziwym ruchu, a nie po syntetycznych sprawdzeniach",
        "Sprawdza według harmonogramu, a health check reaguje na bieżące błędy",
        "Sprawdza chain ID i synchronizację, zanim wpuści ruch",
        "Działa wewnątrz węzła, a health check działa w gatewayu"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co się dzieje, gdy breaker jest półotwarty?",
      options: [
        "Połowa ruchu trafia do upstreamu, dopóki ten się nie podniesie",
        "Wszystkie żądania przechodzą, ale ich błędy nie są zapisywane",
        "Do upstreamu przepuszczanych jest kilka próbnych żądań",
        "Żądania czekają w kolejce, aż cooldown znowu minie"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Trzy warstwy ponawiają każde wywołanie z timeoutem po trzy razy, a breakera nie ma. Co się dzieje, gdy węzeł zwalnia?",
      options: [
        "Ponowienia są deduplikowane po id, więc węzeł widzi jedno wywołanie",
        "Dostaje wielokrotność normalnego obciążenia, gdy jest najsłabszy",
        "Klient anuluje próby pozostałych warstw przy timeoucie",
        "Obciążenie się nie zmienia, bo każda warstwa czeka na niższą"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym limiter token bucket różni się od leaky bucket?",
      options: [
        "Opróżnia kolejkę żądań w idealnie stałym tempie",
        "Ogranicza liczbę równoległych wywołań, a nie tempo żądań",
        "Uzupełnia tokeny dopiero po awarii upstreamu",
        "Po okresie bezczynności dopuszcza burst do swojej pojemności"
      ],
      answer: 3
    }
  ],
  "request-cancellation": [
    {
      kind: "scenario",
      question: "Klient HTTP solvera porzuca wolne debug_traceCall na węźle Geth po dwóch sekundach. Co dzieje się z trace'em?",
      options: [
        "Wykonuje się do końca, a jego własny timeout przestaje obowiązywać",
        "Zatrzymuje się od razu, bo Geth anuluje trace'y po rozłączeniu",
        "Wstrzymuje się i wznawia, gdy klient później połączy się ponownie",
        "Kończy się i trafia do cache na następne żądanie klienta"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego klient WebSocket nie może anulować jednego wolnego wywołania bez skutków ubocznych?",
      options: [
        "Ramki WebSocket nie niosą id JSON-RPC, więc nie da się wskazać wywołania",
        "Węzeł wykonuje wywołania z WebSocketu po kolei i nie może pominąć żadnego",
        "Jedynym sygnałem jest zamknięcie socketu, a to kończy wszystko na nim",
        "eth_unsubscribe anuluje wywołania, ale tylko strumienie transakcji pending"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co zwraca węzeł Geth, gdy eth_call przekroczy --rpc.evmtimeout?",
      options: [
        "Wynik 0x, bo wywołaniu w połowie skończył się czas",
        "HTTP 504 bez żadnego body JSON-RPC w odpowiedzi",
        "Kod błędu 3 z częściowymi danymi zwrotnymi w polu data",
        "Błąd mówiący, że wykonanie przerwano, z wartością timeoutu"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym --rpc.txfeecap w Geth różni się od --rpc.gascap?",
      options: [
        "Ogranicza gas eth_call w etherach, a gascap w jednostkach gasu",
        "Odrzuca drogie wysyłane transakcje, a gascap ogranicza wywołania",
        "Ogranicza łączny gas batcha, a gascap każdy element batcha",
        "Ogranicza metody trace, a gascap eth_call i estymacje"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Gateway ponawia eth_simulateV1 z timeoutem trzy razy na tym samym węźle. Ile pracy wykonał węzeł?",
      options: [
        "Do czterech pełnych symulacji na jedną odpowiedź",
        "Jedną symulację, bo ponowienia korzystają z jej wyniku",
        "Jedną symulację, bo powtórzone id są odrzucane",
        "Dwie, bo węzeł anuluje starsze duplikaty"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego limit wykonania węzła powinien być poniżej timeoutu gatewaya, a ten poniżej deadline'u wywołującego?",
      options: [
        "Żeby ponowienia wywołującego docierały do węzła, zanim skończy się pierwsza próba",
        "Żeby gateway mógł zapisać częściowy wynik w cache dla następnego wywołującego",
        "Żeby węzeł poddał się pierwszy i to zgłosił, zamiast pracować dla nikogo",
        "Żeby limit gasu był sprawdzany, zanim zadziała timeout wykonania"
      ],
      answer: 2
    }
  ],
  "network-telemetry": [
    {
      kind: "scenario",
      question: "Dwa raporty o tym samym slocie, z tego samego zbioru danych, podają blok 1,55 s i 1,82 s po początku slotu. Co najpewniej wyjaśnia różnicę?",
      options: [
        "Jeden liczył sloty w hex, a drugi jako ciągi dziesiętne",
        "Jeden ignorował pominięte sloty, co przesuwa każdy kolejny",
        "Jeden czytał dane sfinalizowane, które przychodzą cały slot później",
        "Jeden mierzył dotarcie bloku, a drugi event head"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego czasów liczonych względem slotu z dwóch różnych węzłów nie da się wprost porównać?",
      options: [
        "Każdy węzeł wylicza początki slotów z własnego pliku genesis",
        "Różnią się ich zegary, sprzęt, peery i klienci",
        "Węzły numerują sloty inaczej, dopóki łańcuch nie sfinalizuje",
        "Beacon node'y zaokrąglają czasy eventów do pełnej sekundy"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym dane ze spisu zebrane przez crawler różnią się od danych o czasach z sentry?",
      options: [
        "To jedno spojrzenie na wiele węzłów, nie wiele na jedno zdarzenie",
        "Mierzą udział w stake, a dane o czasach mierzą węzły",
        "Pochodzą ze sfinalizowanych bloków, a nie ze strumienia eventów",
        "Zbierają je klienci wykonawczy, a nie klienci konsensusu"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co zapisuje kolumna event_date_time dla eventu Beacon API w Xatu?",
      options: [
        "Kiedy proposer bloku podpisał i opublikował blok",
        "Kiedy serwer Xatu zapisał event w swojej bazie danych",
        "Kiedy sentry otrzymał event od swojego beacon node'a",
        "Kiedy zaczął się slot, wyliczony z czasu genesis"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Crawler stwierdza, że 40 procent osiągalnych węzłów używa jednego klienta konsensusu. Co to mówi o udziale tego klienta w stake?",
      options: [
        "Około 40 procent stake, w granicach błędu crawlera",
        "Ponad jedna trzecia stake, więc ten klient może zatrzymać finalność",
        "Mniej niż 40 procent, bo crawlery zawsze zawyżają liczbę węzłów",
        "Nic bezpośrednio, bo węzeł liczy się raz bez względu na to, co za nim stoi"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Który moment w życiu bloku jest tym, od którego naprawdę zależy wywołujący RPC?",
      options: [
        "Gdy blok pierwszy raz dociera przez swój topic gossipsub",
        "Gdy klient wykonawczy zaczyna serwować blok przez RPC",
        "Gdy beacon node emituje event block_gossip",
        "Gdy engine_newPayload kończy wykonywanie bloku"
      ],
      answer: 1
    }
  ],
  "fastest-head": [
    {
      kind: "scenario",
      question: "Bot wysyła eth_call na latest w chwili, gdy przychodzi blok z sieci dostarczania bloków, zanim lokalny klient wykonawczy go zaimportował. Jaki stan czyta to wywołanie?",
      options: [
        "Stan po nowym bloku, bo sieć już ten blok zna",
        "Stan bloku nadrzędnego, bo latest na tym węźle jeszcze się nie przesunął",
        "Żaden: latest jest zablokowany i wywołanie zwraca błąd do końca importu",
        "Mieszankę stanu bloku nadrzędnego i kilku pierwszych transakcji nowego bloku"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Który krok w Geth przesuwa latest i wysyła powiadomienie newHeads dla nowego bloku?",
      options: [
        "engine_forkchoiceUpdated wskazujące go jako head",
        "engine_newPayload zwracające VALID dla tego bloku",
        "Beacon node emitujący block_gossip dla tego bloku",
        "Nadejście bloku na topicu gossip beacon_block"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co daje odbiorcy powiadomienie newHeads z warstwy wykonawczej, czego nie daje event head z Beacon API?",
      options: [
        "Root bloku beacon razem z numerem slotu",
        "Dowód, że blok został już sfinalizowany",
        "Nagłówek wykonawczy od węzła, który wykonał blok",
        "Atestacje, które uczyniły ten blok nowym headem"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego odbiorca typu fan-in łączy nadejścia po hashu bloku wykonawczego, a nie po numerze bloku?",
      options: [
        "Hashe docierają do każdego feedu wcześniej niż numery bloków",
        "Providerzy po każdym reorgu numerują bloki od nowa",
        "Feedy zaokrąglają numery bloków przy ich kodowaniu",
        "Dwa konkurencyjne bloki mogą mieć tę samą wysokość"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Zespół porównuje dwa feedy bloków według czasów pierwszego zobaczenia zapisanych na dwóch różnych hostach. Co może zafałszować ten ranking?",
      options: [
        "Rozjazd zegarów między hostami rzędu dziesiątek milisekund",
        "Wzór na początek slotu, który w każdym slocie trochę dryfuje",
        "Feedy wpisujące w każdą wiadomość własny czas wysłania",
        "Ramki WebSocket, które po drodze zmieniają kolejność eventów"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Który z tych sygnałów o nowym bloku pojawia się zwykle pierwszy na jednym węźle?",
      options: [
        "Event head z beacon node'a dla tego bloku",
        "Powiadomienie newHeads z klienta wykonawczego",
        "Event block_gossip z beacon node'a dla tego bloku",
        "Event block z beacon node'a wysłany po imporcie"
      ],
      answer: 2
    }
  ],
  "transaction-relayer": [
    {
      kind: "scenario",
      question: "Relayer ponownie wysyła podpisane bajty dla nonce 1204 i dostaje nonce too low. Co powinien zrobić najpierw?",
      options: [
        "Podpisać to samo wywołanie z następnym wolnym nonce",
        "Podnieść każdą z opłat o 10 procent i wysłać ten nonce ponownie",
        "Sprawdzić receipty każdego hasha wysłanego pod tym nonce",
        "Przełączyć się na inny endpoint i wysłać bajty jeszcze raz"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Czego domyślnie Geth, Nethermind i Reth wymagają od transakcji zastępującej transakcję pending?",
      options: [
        "Co najmniej 10 procent więcej w każdym z dwóch pól opłat",
        "Co najmniej 10 procent więcej, ale tylko w polu maxFeePerGas",
        "Wyższego limitu gasu, a do tego wyższego napiwku",
        "Co najmniej 20 procent więcej po trzech blokach"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego relayery prowadzą własny licznik nonce, zamiast za każdym razem pytać eth_getTransactionCount z pending?",
      options: [
        "Licznik pending pomija transakcje z ostatniego bloku",
        "Licznik pending to widok mempoolu jednego węzła i bywa różny",
        "Licznik pending jest dostępny tylko przez połączenie WebSocket",
        "Licznik pending liczy transakcje z revertem podwójnie"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Transakcja, która utknęła, ma fee cap 28 gwei, a base fee wynosi teraz 35,6 gwei. Relayer podnosi oba pola opłat dokładnie o 10 procent. Co z tego wynika?",
      options: [
        "Mempool odrzuca ją jako replacement transaction underpriced",
        "Trafia do następnego bloku, bo napiwek też wzrósł",
        "Anuluje oryginał i od razu zwalnia nonce",
        "Mempool ją przyjmuje, ale nadal tkwi ona poniżej base fee"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Skąd w meta-transakcji ERC-2771 kontrakt odbiorcy wie, który użytkownik podpisał żądanie?",
      options: [
        "Z msg.sender, który relayer ustawia na użytkownika",
        "Z tx.origin, który forwarder podmienia na adres użytkownika",
        "Z ostatnich 20 bajtów doklejonych przez zaufany forwarder",
        "Z pola nonce własnej transakcji relayera"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Relayer klasyfikuje błędy nonce po kodzie -32000. Dlaczego przeocza odpowiedź Besu na użyty nonce?",
      options: [
        "Besu zgłasza użyty nonce jako Known transaction",
        "Besu wysyła Nonce too low z kodem -32001",
        "Besu przyjmuje transakcję i usuwa ją z mempoolu",
        "Besu zwraca ten błąd tylko przez połączenie WebSocket"
      ],
      answer: 1
    }
  ],
  "security-monitoring": [
    {
      kind: "scenario",
      question: "Monitor czyta saldo protokołu w latest dwoma żądaniami, które load balancer wysyła do węzłów różniących się o jeden blok, i widzi spadek o 40 procent. Jaki jest właściwy pierwszy krok?",
      options: [
        "Zapauzować protokół, bo tak duży spadek to atak",
        "Odczytać ponownie każdą wartość w jednym hashu bloku i porównać",
        "Przejść na tag pending, żeby każdy odczyt widział ten sam mempool",
        "Podnieść próg alertu, aż spadek przestanie go wyzwalać"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego pełny monitor robi trace każdej transakcji, zamiast czytać same logi?",
      options: [
        "Logi są usuwane z receiptów, gdy tylko blok zostanie sfinalizowany",
        "eth_getLogs nie potrafi filtrować po adresie monitorowanego kontraktu",
        "Transfery wewnętrzne etheru i same zapisy storage nie dają logów",
        "Trace kosztuje mniej niż receipty dla całego bloku danych"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Ile czasu na ostrzeżenie przed exploitem dało w przypadku Saddle Finance wdrożenie kontraktu atakującego?",
      options: [
        "Jeden blok, następny blok zaraz po wdrożeniu",
        "Sześćdziesiąt cztery bloki, mniej więcej kwadrans",
        "Około trzech godzin, tyle co wiek transakcji w kolejce mempoolu",
        "Siedem bloków, według ich timestampów niecałe dwie minuty"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym widok łańcucha w OpenZeppelin Monitor różni się od widoku monitora opartego na trace'ach?",
      options: [
        "Czyta bloki, logi i receipty, ale nie trace'y ani mempool",
        "Czyta tylko mempool i nigdy bloków już dodanych do łańcucha",
        "Odtwarza każdy blok z vmTrace na węźle archiwalnym",
        "Do każdej dopasowanej transakcji potrzebuje eth_simulateV1"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Strumień transakcji pending w monitorze nie pokazuje nic niezwykłego, a exploit drenuje protokół. Co to najpewniej oznacza?",
      options: [
        "Węzeł monitora przeszedł pruning poniżej bieżącego heada łańcucha",
        "Exploit działał w całości w wywołaniu funkcji view",
        "Strumień pomija transakcje, które później robią revert",
        "Atakujący wysłał transakcje prywatnie, poza publicznym mempoolem"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Podczas ataku guardian wysyła swoją transakcję pause() przez publiczny mempool. Co może pójść źle?",
      options: [
        "Mempool odrzuca wywołania pause() wysyłane z kluczy guardiana",
        "Węzeł wstrzymuje ją, dopóki blok z atakiem nie zostanie sfinalizowany",
        "Atakujący ją widzi i pierwszy umieszcza w bloku kolejny drenaż",
        "Builder obcina jej priority fee i ją opóźnia"
      ],
      answer: 2
    }
  ],
  "rpc-workloads": [
    {
      kind: "scenario",
      question: "Dashboard governance pokazuje siłę głosu każdego posiadacza w snapshocie propozycji z zeszłego roku, a jego endpoint to pełny węzeł z pruningiem. Co dzieje się z jego wywołaniami?",
      options: [
        "Udają się, bo pełny węzeł trzyma też stare receipty",
        "Udają się, ale po cichu zwracają dzisiejsze salda",
        "Zawodzą, gdy ten blok wypadnie poza okno stanu węzła",
        "Zawodzą tylko wtedy, gdy dashboard wysyła je w batchu"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Bot likwidacyjny protokołu pożyczkowego i jego dział księgowości czytają te same kontrakty. Czym różnią się ich obciążenia?",
      options: [
        "Bot potrzebuje stanu archiwalnego, a księgowość tylko heada",
        "Bot szybko czyta head; księgowość powoli czyta stare bloki",
        "To samo obciążenie, bo wywołują te same kontrakty",
        "Bot potrzebuje trace'ów, a księgowość tylko subskrypcji logów"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Które wywołania są charakterystyczne dla profilu trace, typowego dla eksploratorów bloków i platform compliance?",
      options: [
        "eth_getLogs po całej historii jednego kontraktu",
        "eth_getProof dla każdego konta na węźle archiwalnym",
        "Strumienie eth_subscribe dla newHeads i transakcji pending",
        "trace_block, trace_filter albo debug_traceBlockByNumber"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego profil trace jest najmniej przenośny przy zmianie endpointu?",
      options: [
        "Formaty wyników trace definiuje każdy klient, a nie specyfikacja",
        "Trace'y wymagają receiptów, które dostawcy usuwają po kilku tygodniach",
        "Metody trace mają rate limity zapisane w execution-apis",
        "Trace'y są serwowane przez WebSocket, a nie przez HTTP"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Transaction Service od Safe jest wdrożony dla Safe'ów na łańcuchu L2. Na jakiej metodzie opiera tam indeksowanie?",
      options: [
        "trace_filter, filtrowane po adresie singletonu Safe",
        "eth_getLogs, filtrowane po topics eventów Safe",
        "trace_block, wywoływane dla każdego bloku blisko heada",
        "debug_traceCall, uruchamiane na każdej transakcji pending"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Router Uniswapa pakuje wiele wycen w duże multicalle wysyłane przez eth_call. Co się dzieje na endpoincie z niskim gas capem dla eth_call?",
      options: [
        "Węzeł dzieli każdy multicall na kilka tańszych wywołań",
        "Wyceny się udają, ale są liczone na starszym bloku",
        "Multicalle zawodzą, dopóki router nie użyje mniejszych paczek",
        "Endpoint nalicza więcej jednostek, ale nadal zwraca wyniki"
      ],
      answer: 2
    }
  ],
  "rpc-benchmarking": [
    {
      kind: "scenario",
      question: "Generator obciążenia uruchamia 50 workerów, z których każdy czeka na odpowiedź, zanim wyśle kolejne żądanie, a serwer zacina się na dwie sekundy. Co pokazuje raport?",
      options: [
        "Ostry skok p99, bo każde zaplanowane żądanie nadal jest mierzone",
        "Błąd dla każdego żądania zaplanowanego w czasie przestoju",
        "Niezmienioną przepustowość, bo workery utrzymują stałe tempo",
        "Mało próbek z przestoju, więc p99 wygląda lepiej, niż było"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego flood oferuje tryb deep-check oprócz podsumowań, które liczy vegeta?",
      options: [
        "Błędy JSON-RPC wracają z HTTP 200, które vegeta liczy jako sukces",
        "Vegeta gubi body żądań POST, więc flood musi wysyłać każde ponownie",
        "Vegeta raportuje tylko średnią, więc flood musi przeliczać percentyle",
        "Vegeta odrzuca odpowiedzi powyżej megabajta bez ostrzeżenia w logu"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym generator obciążenia w otwartej pętli różni się od generatora w zamkniętej pętli?",
      options: [
        "Utrzymuje w każdej chwili stałą liczbę żądań w toku",
        "Czeka na każdą odpowiedź, a potem od razu wysyła kolejne żądanie",
        "Wysyła według stałego harmonogramu, czy odpowiedzi przyszły, czy nie",
        "Odtwarza nagrany ruch zamiast generować syntetyczne wywołania"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co mówi przebieg A/A między dwoma identycznymi buildami?",
      options: [
        "Jakie najwyższe tempo węzeł utrzymuje przed kolanem krzywej",
        "Jaką najmniejszą różnicę potrafi rozróżnić zestaw pomiarowy",
        "Czy dwa buildy zwracają identyczne odpowiedzi",
        "Jak długo trwa rozgrzewka po restarcie węzła"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Zespół mierzy pojemność eth_call na devnecie z małym genesis i podaje ten wynik dla węzła mainnetu. Co jest z nim nie tak?",
      options: [
        "Bloki devnetu są większe, więc wynik jest zdecydowanie zbyt pesymistyczny",
        "Węzły devnetu pomijają walidację, więc wykonanie nie zostało zmierzone",
        "Stan devnetu leży zimny na dysku, więc wynik zawyża latencję storage",
        "Każdy odczyt storage szedł z RAM, więc wynik jest zbyt optymistyczny"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Odpowiedzi dwóch zdrowych węzłów na żądania wysłane na latest są porównywane i mniej więcej jedna na sto się różni. Jakie jest prawdopodobne wyjaśnienie?",
      options: [
        "Węzły dzielił jeden blok; przed porównaniem trzeba przypiąć blok",
        "Jeden z klientów ma błąd konsensusu i trzeba go wyłączyć",
        "Narzędzie do porównań zgubiło żądania, więc pary się rozjechały",
        "Różniące się body są uszkodzone, bo zmieniła się kolejność kluczy"
      ],
      answer: 0
    }
  ],
  "rpc-privacy": [
    {
      kind: "scenario",
      question: "Portfel odświeża salda trzech kont użytkownika w jednym batchu JSON-RPC wysłanym przez Tor. Czego dowiaduje się operator endpointu?",
      options: [
        "Niczego, bo Tor ukrywa zarówno źródło, jak i żądanie",
        "Że te trzy konta należą do jednego właściciela",
        "Tylko adresu węzła wyjściowego, który nie łączy żadnych kont",
        "Prawdziwego IP użytkownika, bo batche omijają obwód Tor"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co ukrywa prywatne RPC dla transakcji w porównaniu ze środkiem chroniącym odczyty?",
      options: [
        "IP nadawcy przed builderami, którzy włączają transakcję do bloku",
        "Każde zapytanie, zaszyfrowane tak, że operator nie widzi adresów",
        "Odczyty, puszczone przez mixnet, żeby żaden węzeł nie widział całości",
        "Transakcję przed publicznym mempoolem, ale nie przed swoim operatorem"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego Helios uruchomiony przed providerem nie ukrywa przed nim adresów użytkownika?",
      options: [
        "Helios zapisuje swoje odpowiedzi u providera dla innych użytkowników",
        "Helios przekazuje niezweryfikowane wywołania, które niosą adresy",
        "Helios sprawdza każdą odpowiedź, prosząc providera o dowody",
        "Helios szyfruje zapytania kluczem, który ma też provider"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Użytkownik obsługuje wszystkie odczyty z własnego węzła i z niego rozgłasza transakcję. Co nadal może wskazać, skąd pochodzi transakcja?",
      options: [
        "Węzeł przekazuje każdą transakcję do Infury, żeby trafiła do bloku",
        "Payload transakcji zawiera własny adres IP węzła",
        "Ten węzeł jako pierwszy peer ogłasza ją w sieci",
        "Węzeł zgłasza każdego lokalnego nadawcę do Beacon Chain"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Odbiorca korzystający z adresów stealth skanuje każdy event Announcement z kontraktu announcer ERC-5564. Co te odczyty mówią endpointowi?",
      options: [
        "Które ogłoszenia pasowały, na podstawie żądanych view tagów",
        "Adresy stealth odbiorcy, bo każde skanowanie je podaje",
        "Viewing key odbiorcy, wysyłany razem z filtrem eventów",
        "Nic, co wyróżniałoby własne ogłoszenia odbiorcy"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Co według oświadczenia Consensys z grudnia 2022 Infura zbiera, gdy użytkownik MetaMaska wysyła transakcję?",
      options: [
        "Adresy portfeli i adresy IP, przechowywane osobno",
        "Tylko adresy portfeli, bez zapisywania adresu IP",
        "Tylko adresy IP, bez zapisywania adresu portfela",
        "Adresy portfeli i adresy IP, przechowywane razem przez rok"
      ],
      answer: 0
    }
  ]
};
