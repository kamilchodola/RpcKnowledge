// Polish checkpoint questions for the Protocol data lessons, keyed by topic id. Each topic's
// six questions match data/quizzes/protocol.js in order, kind, and answer position.
export const quizzes = {
  block: [
    {
      kind: "detail",
      question: "Co zawiera pole uncles w bloku wykonawczym z czasów po Merge, zwróconym przez RPC?",
      options: [
        "Do dwóch nagłówków uncle, jak w czasach proof of work",
        "Pustą tablicę, bo ommery skończyły się wraz z Merge",
        "Hashe konkurujących bloków beacon z tego samego slotu",
        "Wypłaty, którymi warstwa konsensusu zasiliła konta"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Timestamp bloku jest o 24 sekundy późniejszy niż timestamp rodzica, ale numer jest wyższy dokładnie o jeden. Co się stało?",
      options: [
        "Blok miał dwa razy więcej gasu niż zwykle, więc jego slot wydłużono",
        "Proposer ustawił późniejszy timestamp, żeby zebrać więcej priority fee",
        "Slot między nimi został pominięty, więc nie powstał dla niego blok",
        "Reorg scalił dwa bloki pod jednym wspólnym numerem"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Która wartość w wyniku eth_getBlockByNumber jest wyliczana przez węzeł, a nie odczytywana z pola nagłówka?",
      options: [
        "gasUsed, gas zużyty przez transakcje bloku",
        "parentHash, hash poprzedniego bloku",
        "timestamp, sekunda uniksowa jego slotu",
        "size, długość jego kodowania RLP w bajtach"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Indekser skanuje bloki przez eth_getBlockByNumber i jako drugi parametr przekazuje true, choć potrzebuje tylko hashy transakcji. Co go to kosztuje?",
      options: [
        "Dużo większe odpowiedzi: kilkaset kilobajtów zamiast kilku",
        "Każde wywołanie zwraca też wszystkie receipty, co podwaja obciążenie u providera",
        "Węzeł musi odtworzyć każdy blok, więc wywołanie wymaga stanu archiwalnego",
        "Nagłówki uncle są zwracane w całości, co mniej więcej podwaja rozmiar"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego program, który czyta saldo, slot storage i nonce, które muszą być ze sobą zgodne, powinien przypiąć wszystkie trzy odczyty do jednego numeru bloku zamiast używać latest?",
      options: [
        "Tag latest jest obsługiwany z mempoolu, a nie z wykonanego stanu",
        "Osobne wywołania na latest mogą dostać odpowiedź z różnych bloków",
        "Węzły cache'ują latest osobno dla każdej metody, więc każda wartość ma inne opóźnienie",
        "Numer sprawia, że węzeł weryfikuje każdą odpowiedź względem stateRoot"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co mówi blockHash receiptu, czego nie powie jego blockNumber?",
      options: [
        "Czy blok jest sfinalizowany, bo hashe nadaje się przy finalizacji",
        "W którym slocie zaproponowano blok, bo numeracja pomija puste sloty",
        "Który węzeł go obsłużył, bo każdy węzeł hashuje bloki niezależnie",
        "Który dokładnie blok go wytworzył, bo po reorgu numer może się powtórzyć"
      ],
      answer: 3
    }
  ],
  "block-header": [
    {
      kind: "contrast",
      question: "Czym stateRoot i receiptsRoot różnią się od transactionsRoot i withdrawalsRoot?",
      options: [
        "Są korzeniami SSZ hash tree, a nie korzeniami trie Merkle-Patricia",
        "Są commitmentem do wyniku wykonania bloku, a nie do jego danych wejściowych",
        "Wylicza je warstwa konsensusu, a nie klient wykonawczy",
        "Są opcjonalne i występują tylko w blokach wyprodukowanych po Merge"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Gdzie rynek opłat za bloby przechowuje dane, które przenosi z bloku na blok?",
      options: [
        "W storage kontraktu systemowego, który odczytuje EVM",
        "W extraData, gdzie zapisuje je builder bloku",
        "Tylko w warstwie konsensusu, obok sidecarów blobów",
        "W nagłówku, jako blobGasUsed i excessBlobGas"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Blok z 2020 roku przychodzi bez pola baseFeePerGas. Jaki wniosek powinien wyciągnąć dekoder?",
      options: [
        "Blok pochodzi sprzed London, aktualizacji, która dodała to pole",
        "Węzeł usunął to pole ze starych nagłówków, żeby oszczędzić dysk",
        "Blok był pusty, więc base fee go nie dotyczyło",
        "Pole pojawia się tylko wtedy, gdy żąda się pełnych transakcji"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co niesie w nagłówku po Merge pole, które klienci nadal pokazują jako mixHash?",
      options: [
        "Podpis buildera nad payloadem, pozostałość po kopaniu",
        "Root nadrzędnego bloku beacon, który opakował ten payload",
        "prevRandao, czyli losowość warstwy konsensusu dla tego slotu",
        "Seed proof of work, wyzerowany, odkąd zniknęło difficulty"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego pole miner w bloku kupionym przez MEV-Boost zwykle wskazuje buildera, a nie walidatora, który był proposerem?",
      options: [
        "Builderzy podpisują nagłówek, a miner zapisuje adres podpisującego",
        "Wskazuje relay, który dostarczył blok proposerowi",
        "To adres z withdrawal credentials walidatora",
        "To fee recipient, którego builder ustawia na własny adres"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym w nagłówku warstwy wykonawczej parentBeaconBlockRoot różni się od parentHash?",
      options: [
        "To ten sam hash, przekodowany przez SHA-256 na potrzeby klientów beacon",
        "To commitment do stanu rodzica, a parentHash do jego nagłówka",
        "Wskazuje blok rodzica w warstwie konsensusu, a nie w wykonawczej",
        "To korzeń wypłat walidatorów przekazanych przez warstwę konsensusu"
      ],
      answer: 2
    }
  ],
  "block-hash": [
    {
      kind: "cause",
      question: "Hash bloku liczy się tylko z nagłówka. Dlaczego zmiana jednego bajtu jednej transakcji i tak go zmienia?",
      options: [
        "Klienci doklejają RLP body bloku do nagłówka przed hashowaniem",
        "transactionsRoot w nagłówku to commitment do każdej transakcji",
        "Po sfinalizowaniu hash liczy się z całego bloku",
        "Hash każdej transakcji jest wmieszany w extraData nagłówka"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co zwraca opcode BLOCKHASH zapytany o blok starszy niż 256 najnowszych?",
      options: ["Hash bloku genesis", "Najstarszy hash, jaki ma węzeł", "Wartość zero", "Revert z błędem zakresu"],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Dlaczego hash bloku jest bezpieczniejszym kluczem cache niż numer bloku?",
      options: [
        "Reorg może przypisać numer innej zawartości, ale hasha nigdy",
        "Hashe są nadawane dopiero po sfinalizowaniu bloku w łańcuchu",
        "Numery pomijają opuszczone sloty, więc dwa bloki mogą mieć ten sam",
        "Numery są lokalne dla węzła, a hashe uzgadnia cała sieć"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Indekser zapisał hash bloku 100. Potem przychodzi blok 101 z parentHash, który nie jest mu równy. Co to oznacza?",
      options: [
        "Blok 101 jest nieprawidłowy i indekser powinien poczekać na poprawny zamiennik",
        "Węzeł pominął opuszczony slot, więc parentHash wskazuje dwa bloki wstecz",
        "Blok 100 wypadł w reorgu, więc dane z niego wyprowadzone trzeba wycofać",
        "Blok zbudowano przez MEV-Boost, który inaczej hashuje nagłówki"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Metoda odczytu dostaje blockHash z requireCanonical ustawionym na true, a ten blok nie jest już kanoniczny. Co robi węzeł?",
      options: [
        "Odpowiada z kanonicznego bloku na tej samej wysokości",
        "Zwraca jednoznaczny błąd, zamiast odpowiadać z innego bloku",
        "I tak odpowiada z tego bloku, dodając pole z ostrzeżeniem",
        "Czeka, aż blok znów stanie się kanoniczny, i wtedy odpowiada"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Programista przekazuje hash bloku wykonawczego do endpointu Beacon API /eth/v2/beacon/blocks/{block_id}. Co dostaje w odpowiedzi?",
      options: [
        "Blok beacon, który go opakowuje, bo każdy z tych hashy wskazuje ten sam blok",
        "Błąd typu, bo hash wykonawczy ma 20 bajtów, a root 32",
        "Sam execution payload, bez otaczających go pól konsensusu",
        "Odpowiedź not found, bo endpoint oczekuje rootu bloku beacon"
      ],
      answer: 3
    }
  ],
  transaction: [
    {
      kind: "detail",
      question: "Które pole w obiekcie transakcji z eth_getTransactionByHash nigdy nie zostało podpisane przez nadawcę?",
      options: [
        "nonce, które węzeł uzupełnia na podstawie konta",
        "from, które węzeł odzyskuje z podpisu",
        "chainId, które węzeł dodaje z własnej konfiguracji",
        "input, które węzeł dekoduje z calldata"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Obiekt transakcji ma pole to ustawione na null. Jaka to transakcja?",
      options: [
        "Transakcja pending, której odbiorca nie jest jeszcze ustalony",
        "Wypłata wprowadzona przez warstwę konsensusu",
        "Spalenie, które wysyła wartość na adres zerowy",
        "Wdrożenie kontraktu, z init code w polu input"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "W trakcie transakcji jeden kontrakt wywołuje inny. Gdzie można potem zobaczyć to wewnętrzne wywołanie?",
      options: [
        "W trace wykonania tej transakcji",
        "Jako drugą transakcję w tym samym bloku",
        "W body bloku, zaraz po transakcji zewnętrznej",
        "W eth_getTransactionByHash, w osobnym polu internal"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Żeby przyspieszyć płatność pending, portfel podpisuje nową kopię z wyższą opłatą, ale z kolejnym nonce zamiast tego samego. Co się dzieje?",
      options: [
        "Nowa kopia zastępuje starą, bo ma wyższą opłatę",
        "Każda może trafić do bloku, więc płatność może wyjść dwa razy",
        "Węzeł odrzuca nową kopię jako duplikat pierwszej",
        "Stara kopia znika, gdy tylko nowa zostanie rozgłoszona"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Transakcja przenosi 1000 USDC do innego posiadacza, ale jej pole value to 0x0. Dlaczego?",
      options: [
        "value jest uzupełniane dopiero po zapisaniu receiptu",
        "Węzeł ukrywa value dla kontraktów tokenów ze względu na prywatność",
        "value jest w gwei, więc małe kwoty zaokrąglają się do zera",
        "Transfer to wywołanie kontraktu zakodowane w input, a nie ether"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Wywołanie eth_sendRawTransaction właśnie zwróciło hash transakcji. Co ten hash przesądza?",
      options: [
        "Transakcja została włączona do bloku i ma już receipt",
        "Proposer zadeklarował, że włączy ją do następnego bloku",
        "Tylko to, że ten węzeł ją przyjął; włączenie przyjdzie później",
        "Sieć zweryfikowała podpis i pobrała opłatę"
      ],
      answer: 2
    }
  ],
  "transaction-types": [
    {
      kind: "detail",
      question: "Jak są ułożone bajty transakcji typu 0x2 przekazywane do eth_sendRawTransaction?",
      options: [
        "Lista RLP, której pierwszym elementem jest numer typu 2",
        "Kontener SSZ, tak jak obiekty warstwy konsensusu",
        "Bajt 0x02, a po nim lista RLP z polami transakcji",
        "Obiekt JSON z polem type, podpisany jako tekst"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego transakcja przenosząca bloby nigdy nie może wdrożyć kontraktu?",
      options: [
        "Blob gas nie pokryje dodatkowych 32 000 gasu, które kosztuje wdrożenie",
        "Typ 0x3 musi mieć odbiorcę w polu to, a wdrożenie go nie ma",
        "Init code jechałby w sidecarze, którego EVM nigdy nie widzi",
        "Wdrożenie wymaga pola gasPrice, którego typ 0x3 nie ma"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Narzędzie obserwujące mempool czyta surową transakcję, której pierwszy bajt to 0xf8. Co to jest?",
      options: [
        "Transakcja typu 0xf8 z przyszłej aktualizacji sieci",
        "Sidecar bloba, który przyszedł bez swojej transakcji",
        "Uszkodzony payload, bo poprawne bajty typu kończą się na 0x7f",
        "Transakcja legacy, bo od tego bajtu zaczyna się lista RLP"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Tuż po aktualizacji sieci węzeł odrzuca transakcję w nowym formacie z błędem transaction type not supported. Jaka jest zwykle przyczyna?",
      options: [
        "Klient węzła to starsze wydanie, które nie zna nowego typu",
        "Nadawca ustawił gasPrice razem z maxFeePerGas",
        "Bajt typu transakcji nie był objęty jej podpisem",
        "Mempool jest pełny i odrzuca typy, których nie umie wycenić"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Transakcja typu 0x3 została pobrana przez eth_getTransactionByHash. Co obiekt zawiera, jeśli chodzi o jej bloby?",
      options: [
        "Pełne bajty blobów, w polu sidecar obiektu",
        "Dowody KZG, umieszczone tam, gdzie zwykle jest calldata",
        "Tylko ich versioned hashe, w blobVersionedHashes",
        "Nic, bo transakcje blobowe obsługuje Beacon API"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co typ 0x1 dodaje do formatu legacy, czyli typu 0x0?",
      options: [
        "maxFeePerGas i maxPriorityFeePerGas zamiast gasPrice",
        "blobVersionedHashes i maxFeePerBlobGas dla danych blobów",
        "authorizationList, który kieruje nadawcę na kod kontraktu",
        "Jawne chainId, accessList oraz yParity w miejsce pola v"
      ],
      answer: 3
    }
  ],
  "transaction-receipt": [
    {
      kind: "scenario",
      question: "Dwa kolejne receipty w jednym bloku pokazują cumulativeGasUsed równe 21000, a potem 42000. Ile gasu zużyła druga transakcja?",
      options: [
        "42000, czyli późniejsza z dwóch wartości narastających",
        "21000, czyli różnica między tymi wartościami",
        "63000, czyli suma dwóch wartości narastających",
        "Bez trace'a tej transakcji nie da się tego ustalić"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Które pole receiptu klient odtwarza sam, zamiast przechowywać je w receipcie konsensusowym objętym przez receiptsRoot?",
      options: ["status", "logs", "cumulativeGasUsed", "effectiveGasPrice"],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Transakcja zrobiła revert w najbardziej zewnętrznym wywołaniu. Co pokazuje jej receipt?",
      options: [
        "status 0x1 i pole error z powodem revertu",
        "status 0x0 i gasUsed 0x0, bo nic nie zostało zastosowane",
        "Receipt nie powstaje, bo transakcja z revertem go nie zapisuje",
        "status 0x0, niezerowe gasUsed i pustą tablicę logs"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Pobrano receipt transakcji w bloku N, a potem łańcuch przeszedł reorg obejmujący blok N. Co może się stać z tym receiptem?",
      options: [
        "Nic, bo raz zwrócony receipt jest ostateczny",
        "Może zniknąć, a potem wrócić z innym blockHash",
        "Jego status zmienia się na 0x0, by oznaczyć osierocone wykonanie",
        "Pozostaje ważny, ale jego logi znikają z indeksu"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego receipt może pokazywać status 0x1 dla operacji zbiorczej, w której jedno z wewnętrznych wywołań się nie powiodło?",
      options: [
        "status odzwierciedla tylko opłacenie gasu, a nie wykonane wywołania",
        "Wewnętrzne reverty trafiają do logsBloom, a nie do status",
        "Węzeł przepisuje status po sfinalizowaniu bloku",
        "Kontrakt przechwycił wewnętrzny revert i zakończył się normalnie"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Jak obliczyć w wei opłatę za wykonanie, którą transakcja faktycznie zapłaciła?",
      options: [
        "gasUsed razy effectiveGasPrice",
        "gas razy effectiveGasPrice",
        "cumulativeGasUsed razy effectiveGasPrice",
        "gasUsed razy maxFeePerGas"
      ],
      answer: 0
    }
  ],
  nonce: [
    {
      kind: "scenario",
      question: "eth_getTransactionCount na latest zwraca 0x5 dla adresu bez transakcji pending. Jakiego nonce powinna użyć jego następna transakcja?",
      options: [
        "0x6, bo ta liczba to ostatnio użyty nonce",
        "0x5, bo liczba włączonych transakcji to następny nonce",
        "0x4, bo liczba jest liczona od jedynki, a nonce nie",
        "Dowolnego od 0x5 w górę, bo wyższe nonce są akceptowane"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Twoja transakcja z nonce 12 utknęła w mempoolu, a wysyłasz kolejną z nonce 13. Co dzieje się z drugą?",
      options: [
        "Zastępuje nonce 12, bo wyższy nonce wygrywa",
        "Zostaje od razu odrzucona z błędem nonce too low",
        "Czeka za nonce 12 i nie może trafić do bloku pierwsza",
        "Trafia do bloku pierwsza, a nonce 12 staje się trwale nieważny"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co sprawia, że nonce konta kontraktu rośnie o jeden?",
      options: [
        "Każda transakcja, która go wywołuje",
        "Każdy kontrakt, który wdraża przez CREATE",
        "Każdy przychodzący przelew etheru",
        "Każdy zapis, który robi we własnym storage"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Ponownie wysyłasz zablokowaną transakcję z tym samym nonce i podnosisz tylko maxFeePerGas o 20 procent. Dlaczego typowy mempool odpowiada replacement transaction underpriced?",
      options: [
        "Chce, żeby maxPriorityFeePerGas też wzrosło o ten sam procent",
        "Chce, żeby maxFeePerGas wzrosło o co najmniej 50 procent, a nie 20",
        "Chce, żeby zastępcza transakcja miała nowy, wyższy nonce",
        "Chce, żeby zastępczą transakcję wysłać do węzła, który przyjął oryginał"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Dwa workery korzystają z jednego adresu nadawcy. Każdy w tej samej chwili odczytuje następny nonce i podpisuje transakcję. Co zwykle się dzieje?",
      options: [
        "Każda trafia do bloku, bo mempool sam nadaje im kolejne nonce",
        "Węzeł łączy je w jedną transakcję z dwoma payloadami",
        "Jedna trafia do bloku, druga zostaje odrzucona, często jako nonce too low",
        "Każda czeka w części queued, aż inna transakcja wypełni lukę"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co eth_getTransactionCount z tagiem pending liczy ponad to, co liczy tag latest?",
      options: [
        "Transakcje, które trafiły do bloku, ale potem skończyły się revertem",
        "Transakcje w blokach, które nie są jeszcze sfinalizowane",
        "Wdrożenia, które jego kontrakty wykonały przez CREATE",
        "Transakcje czekające we własnym mempoolu tego konkretnego węzła"
      ],
      answer: 3
    }
  ],
  gas: [
    {
      kind: "consequence",
      question: "Transakcji kończy się gas w trakcie wykonania. Co zostaje pobrane, a co zachowane?",
      options: [
        "Pobierany jest tylko gas zużyty do momentu błędu; zmiany są cofane",
        "Nic nie jest pobierane, bo transakcja zawiodła przed końcem",
        "Pobierany jest zużyty gas, a zmiany sprzed błędu zostają",
        "Pobierany jest cały limit gasu, a każda zmiana stanu jest cofana"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Jaką część pozostałego gasu kontrakt może przekazać do wywołania podrzędnego?",
      options: [
        "Całość, o ile wywołujący przekaże pełną kwotę",
        "Najwyżej 63/64; jedna 64. część zostaje u wywołującego",
        "Połowę, podzieloną równo między wywołującego i wywoływanego",
        "Do 21000 gasu intrinsic tej transakcji"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego każdy klient wykonawczy musi naliczać dokładnie taki sam gas za każdy opcode?",
      options: [
        "Inaczej policzyłby inne gasUsed i state root i odłączył się od sieci",
        "Builderzy nadpisują ceny gasu poszczególnych węzłów przy składaniu bloku",
        "Warstwa konsensusu ponownie nalicza gas każdego opcode'u i karze odstających klientów slashingiem",
        "Ceny opcode'ów są czytane z kontraktu systemowego ustawionego w genesis"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "eth_call z ciężkimi obliczeniami kończy się błędem na publicznym endpoincie, choć ta sama praca łatwo zmieściłaby się w bloku. Jaki jest prawdopodobny powód?",
      options: [
        "eth_call nalicza podwójnie za każdy opcode, żeby zniechęcić do ciężkich odczytów",
        "Operator endpointu ustawił gas cap poniżej tego, czego potrzebuje wywołanie",
        "21000 gasu intrinsic nie jest zwracane na endpoincie",
        "eth_call nie może czytać slotów storage, których blok nie dotknął"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Ile intrinsic gas płaci transakcja, zanim uruchomi się jakikolwiek kod, jeśli niczego nie wdraża i nie ma calldata?",
      options: ["2100 gasu", "21000 gasu", "53000 gasu", "32000 gasu"],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Nadawca ustawia limit gasu dziesięć razy wyższy, niż transakcja będzie potrzebować, wciąż poniżej limitu na transakcję. Co to daje?",
      options: [
        "Pobierany jest cały limit, tak jak przy błędzie out of gas",
        "Węzeł ją odrzuca, bo limit musi się mieścić w 10 procentach zużycia",
        "Niewykorzystany gas wraca, ale limit zajmuje miejsce w bloku",
        "Base fee jest pobierana od całego limitu, a napiwek tylko od zużycia"
      ],
      answer: 2
    }
  ],
  "eip-1559": [
    {
      kind: "detail",
      question: "O ile może się zmienić base fee między kolejnymi blokami?",
      options: [
        "O dowolną wartość, którą wybierze builder bloku",
        "O najwyżej 100 procent, podwajając się po pełnym bloku",
        "O najwyżej 12,5 procent, w górę lub w dół",
        "Nie zmienia się w obrębie epoki liczącej 32 bloki"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Base fee bloku wynosi 25 gwei. Transakcję w tym bloku podpisano z maxFeePerGas 30 gwei i maxPriorityFeePerGas 2 gwei. Ile wynosi jej effectiveGasPrice?",
      options: ["30 gwei", "27 gwei", "25 gwei", "2 gwei"],
      answer: 1
    },
    {
      kind: "detail",
      question: "Gdzie trafia część opłaty transakcji odpowiadająca base fee?",
      options: [
        "Do proposera, razem z napiwkiem",
        "Do buildera, który złożył blok",
        "Do kontraktu skarbca protokołu",
        "Jest spalana i znika z obiegu"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego ustawienie maxFeePerGas wyraźnie powyżej bieżącej base fee to tanie ubezpieczenie, a nie przepłacanie?",
      options: [
        "Nadwyżka wraca do nadawcy po zakończeniu bloku",
        "Wyższy pułap obniża base fee, którą pobierze blok",
        "Pobierana jest tylko base fee i napiwek, zapas nie",
        "Pułap wiąże tylko transakcje legacy, nie typu 0x2"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Base fee rośnie do 29 gwei, a transakcja ma maxFeePerGas 30 gwei i maxPriorityFeePerGas 2 gwei. Ile dostaje odbiorca opłat za jednostkę gasu?",
      options: ["2 gwei", "1 gwei", "30 gwei", "0 gwei"],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Po serii pełnych bloków maxFeePerGas transakcji jest teraz niższe od base fee. Co się z nią dzieje?",
      options: [
        "Staje się trwale nieważna, jak transakcja ze zbyt niskim nonce",
        "Trafia do bloku, a brakującą kwotę pokrywa się z napiwku",
        "Czeka poza blokami, aż base fee spadnie do jej pułapu",
        "Trafia do bloku po cenie pułapu, a różnicę pokrywa proposer"
      ],
      answer: 2
    }
  ],
  "access-list": [
    {
      kind: "detail",
      question: "Ile gasu w najlepszym razie oszczędza wpisanie klucza storage do access listy przy jego pierwszym odczycie?",
      options: [
        "2100 gasu, bo odczyt z listy staje się darmowy",
        "100 gasu: 1900 plus 100 za ciepły odczyt wobec 2100",
        "1900 gasu, które wracają po odczytaniu slotu",
        "Nic; lista pomaga tylko klientowi planować odczyty"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Transakcja wymienia adres w accessList, ale nigdy się do niego nie odwołuje. Jaki jest skutek?",
      options: [
        "Wpis jest ignorowany i nie kosztuje gasu",
        "Transakcja zostaje odrzucona jako nieważna",
        "2400 gasu wraca na koniec transakcji",
        "I tak płaci 2400 gasu za nieużyty wpis"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Transakcja odczytuje slot storage, którego nie ma w jej access liście. Co się dzieje?",
      options: [
        "Odczyt następuje po zimnej cenie 2100 gasu",
        "EVM zatrzymuje ramkę z błędem out-of-access",
        "Odczyt zwraca zero, bo sloty spoza listy są ukryte",
        "Transakcja się revertuje, bo lista działa jak allowlista"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Po co w ogóle istnieje typ transakcji 0x1, skoro typ 0x2 też może mieć access listę?",
      options: [
        "Tylko w typie 0x1 nieużyta lista jest zwracana",
        "Listy weszły przed dynamicznymi opłatami, więc pierwsze dostały typ",
        "W typie 0x2 listy są tylko doradcze, a typ 0x1 je egzekwuje",
        "Typ 0x1 trzyma listy poza podpisem, w przeciwieństwie do 0x2"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "eth_createAccessList pomija nadawcę i odbiorcę, choć wywołanie odwołało się i do jednego, i do drugiego. Dlaczego?",
      options: [
        "Wynikają z podpisu i nie da się ich wpisać na listę",
        "Są ciepłe z definicji, więc ich wpisanie tylko kosztuje gas",
        "Węzeł je ukrywa, by nie ujawniać, kto zawiera transakcję",
        "Na liście są tylko klucze storage, nigdy adresy"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Dwie transakcje w jednym bloku mają na liście ten sam slot storage. Jak to wpływa na ich wykonanie?",
      options: [
        "Druga się revertuje, bo pierwsza trzyma blokadę slotu",
        "Wykonują się równolegle, bo każda z góry zadeklarowała swój stan",
        "Żadnego; i tak idą w kolejności z bloku, jedna po drugiej",
        "Tylko pierwsza dostaje ciepłą cenę, a druga płaci zimną"
      ],
      answer: 2
    }
  ],
  account: [
    {
      kind: "detail",
      question: "Która pojedyncza metoda RPC zwraca w jednej odpowiedzi saldo, nonce, codeHash i storage root konta?",
      options: ["eth_getBalance", "eth_getProof", "eth_getCode", "eth_getStorageAt"],
      answer: 1
    },
    {
      kind: "detail",
      question: "Rekord konta w trie stanu ma dokładnie cztery pola. Która lista je wymienia?",
      options: [
        "address, balance, storageRoot, codeHash",
        "nonce, balance, owner, createdAtBlock",
        "nonce, balance, storageRoot, codeHash",
        "nonce, balance, code, tokenBalances"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Potrzebne jest saldo tokena ERC-20 dla pewnego adresu. Gdzie ta wartość jest faktycznie zapisana?",
      options: [
        "Na koncie posiadacza, obok jego etheru",
        "W storage kontraktu tokena",
        "W polu codeHash kontraktu tokena",
        "W receiptach transferów, które go przeniosły"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Co zwraca eth_getBalance dla adresu, który nigdy nie dostał środków i pod którym niczego nie wdrożono?",
      options: [
        "null, bo dla tego adresu nie ma wpisu w stanie",
        "Błąd z informacją, że konto nie istnieje w stanie",
        "0x0, tak jak dla każdego konta bez salda",
        "0x0 z flagą oznaczającą konto jako nieistniejące"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego jedno wywołanie eth_getProof jest lepsze od osobnych wywołań eth_getBalance, eth_getTransactionCount i eth_getCode na latest, gdy potrzebny jest spójny snapshot?",
      options: [
        "eth_getBalance na latest czyta stan pending z mempoolu",
        "Osobne wywołania na latest mogą trafić po dwóch stronach nowego bloku",
        "Tylko eth_getProof czyta stan; pozostałe czytają historię",
        "eth_getCode zwraca hash kodu, którego nie da się zweryfikować"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "eth_getCode zwraca 0x dla pewnego adresu na latest. Co to przesądza?",
      options: [
        "Że adres to konto EOA ze znanym kluczem",
        "Że teraz nie ma tam kodu; kontrakt może zostać wdrożony później",
        "Że adres nigdy nie dostał środków ani nie był używany w tym łańcuchu",
        "Że adres to konto z delegacją, którego kod został wyczyszczony"
      ],
      answer: 1
    }
  ],
  address: [
    {
      kind: "contrast",
      question: "Co sprawia, że adres CREATE2, w przeciwieństwie do adresu CREATE, nie zależy od kolejności transakcji konta wdrażającego?",
      options: [
        "Hashuje nonce konta wdrażającego, ustalony z góry",
        "Hashuje salt i init code zamiast nonce",
        "Węzeł rezerwuje adres, gdy salt zostanie zarejestrowany",
        "Jest wyliczany wyłącznie z klucza publicznego wdrażającego"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Jak wygląda 20-bajtowy adres, gdy jest indeksowanym argumentem eventu w topicu logu?",
      options: [
        "Dopełniony z prawej dwunastoma bajtami zerowymi do 32 bajtów",
        "Zahashowany przez Keccak-256, jak argument dynamiczny",
        "Dopełniony z lewej dwunastoma bajtami zerowymi do 32 bajtów",
        "Bez zmian, w pierwszych 20 bajtach 32-bajtowego topicu"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Dwa stringi z adresami różnią się tylko wielkością niektórych liter. Co z tego wynika?",
      options: [
        "Wskazują różne konta, bo adresy rozróżniają wielkość liter",
        "Nic co do tożsamości; wielkość liter to suma kontrolna EIP-55",
        "Jeden to kontrakt, a drugi to konto sterowane kluczem",
        "Wersja z mieszaną wielkością liter należy do innego łańcucha"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Ktoś wysyła tokeny na adres zerowy, żeby je spalić, ale kontrakt tokena nie traktuje tego adresu w żaden szczególny sposób. Co dzieje się z tokenami?",
      options: [
        "Protokół je niszczy, bo adres zerowy spala wartość",
        "Transfer kończy się revertem, bo adres zerowy nie może nic dostać",
        "Utykają pod adresem, do którego nikt nie zna klucza",
        "Wracają do twórcy kontraktu po upływie timeoutu"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Biblioteka ma wysłać ether na vitalik.eth. Co węzeł, z którym rozmawia, dostaje jako odbiorcę?",
      options: [
        "Samą nazwę, którą węzeł rozwiązuje przez swoją konfigurację ENS",
        "Hash Keccak nazwy, który węzeł mapuje z powrotem na adres",
        "20-bajtowy adres, który biblioteka ustaliła przez eth_call",
        "Specjalny typ transakcji ENS, który węzeł kieruje do rejestru"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jak adres konta EOA jest wyliczany z jego klucza?",
      options: [
        "Pierwsze 20 bajtów hasha SHA-256 jego klucza prywatnego",
        "Hash Keccak-256 nadawcy i nonce, obcięty do 20 bajtów",
        "Ostatnie 20 bajtów hasha Keccak-256 jego klucza publicznego",
        "Wartość, którą sieć przydziela, gdy klucz wyśle pierwszą transakcję"
      ],
      answer: 2
    }
  ],
  evm: [
    {
      kind: "contrast",
      question: "Co DELEGATECALL robi inaczej niż zwykły CALL?",
      options: [
        "Uruchamia kod wywołującego w kontekście storage wywoływanego",
        "Uruchamia kod wywoływanego na storage wywołującego",
        "Zabrania wszelkich zmian stanu przez cały czas wywołania",
        "Przekazuje cały pozostały gas zamiast 63/64"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Które sprawdzenie pomija eth_call, choć prawdziwa transakcja musi je przejść?",
      options: [
        "Naliczanie gasu za każdy wykonany opcode",
        "Sprawdzenie podpisu nadawcy i jego nonce",
        "Cofanie stanu, gdy warunek require nie jest spełniony",
        "Odczyt storage wywoływanego kontraktu"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co dzieje się z wartością zapisaną przez TSTORE, gdy transakcja się kończy?",
      options: [
        "Trafia do trie storage kontraktu, tak jak przy SSTORE",
        "Jest kasowana i nigdy nie trafia do eth_getStorageAt",
        "Jest kopiowana do receiptu, obok logów",
        "Zostaje w pamięci na następne wywołanie w tym samym bloku"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego tysiące węzłów mogą odtworzyć blok i zgodzić się co do jego state root, choć kontrakty wykonują dowolny kod?",
      options: [
        "Proposer każdego bloku podpisuje state root, a inni go kopiują",
        "Kontrakty są sprawdzane przy wdrożeniu, żeby odrzucić niedeterministyczny kod",
        "EVM nie ma zegara, plików ani sieci; jej jedyne wejścia są ustalone",
        "Klienci umownie zaokrąglają wyniki zmiennoprzecinkowe tak samo"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Dapp wykonuje eth_call z adresu zerowego, który nie ma etheru i do którego nikt nie ma klucza. Co się dzieje?",
      options: [
        "Kończy się błędem, bo adres zerowy nie może zainicjować żadnego wywołania",
        "Kończy się błędem insufficient funds for gas * price + value",
        "Działa normalnie, bo eth_call nie wymaga podpisu ani salda",
        "Działa, ale odczyty storage zwracają zero dla tego nadawcy"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Kontrakt loterii używa PREVRANDAO jako źródła losowości. Na czym polega słabość?",
      options: [
        "Wartość powtarza się co 256 bloków, więc da się ją przewidzieć",
        "Od Merge zawsze wynosi zero, bo zniknęła trudność kopania",
        "Proposer zna tę wartość, zanim zbuduje blok",
        "Odczytują ją tylko węzły archiwalne, więc wyników nie da się sprawdzić"
      ],
      answer: 2
    }
  ],
  "smart-contract": [
    {
      kind: "detail",
      question: "Co zwraca eth_getCode pod adresem nowego kontraktu po udanym wdrożeniu?",
      options: [
        "Dokładnie te bajty, które wysłano w polu input wdrożenia",
        "Kod źródłowy, skompilowany przez węzeł przy wdrożeniu",
        "Runtime bytecode, który zwrócił init code",
        "ABI, a po nim runtime bytecode"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Kontrakt proxy przy każdym wywołaniu robi DELEGATECALL do implementacji. Gdy kod implementacji zapisuje zmienną, czyje storage się zmienia?",
      options: [
        "Implementacji, bo to jej kod wykonuje zapis",
        "Proxy, bo zachowany zostaje kontekst storage wywołującego",
        "Każdego z kontraktów, bo zapis jest w nich lustrzanie powielany",
        "Niczyje, bo kod delegowany może storage tylko czytać"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego aplikacja musi mieć ABI kontraktu u siebie, zamiast pytać o nie węzeł?",
      options: [
        "Węzły zwracają ABI tylko kontu, które wdrożyło kontrakt",
        "Łańcuch przechowuje tylko bytecode, bez listy funkcji i nazw",
        "ABI jest zapisane w łańcuchu, ale odczyt wymaga węzła archiwalnego",
        "eth_getAbi istnieje, ale publiczni providerzy zwykle tę metodę wyłączają"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Co od Dencun robi SELFDESTRUCT w kontrakcie wdrożonym we wcześniejszej transakcji?",
      options: [
        "Usuwa kod i storage, tak jak przed Dencun",
        "Kończy się revertem, bo w Dencun usunięto ten opcode",
        "Tylko przekazuje dalej saldo; kod i storage zostają",
        "Czyści storage, ale zostawia kod na miejscu"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym różni się wywołanie funkcji view przez eth_call od wywołania jej z innego kontraktu w łańcuchu?",
      options: [
        "Tylko w wersji z eth_call gas jest naliczany",
        "Tylko za wywołanie w łańcuchu płaci się gasem",
        "Tylko wywołanie w łańcuchu może czytać storage",
        "Tylko wersja z eth_call może zwracać dane"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Deweloper chce, żeby kontrakt odszukał event, który wyemitował w zeszłym tygodniu, i na tej podstawie zdecydował o wypłacie. Na czym polega problem?",
      options: [
        "Logi starsze niż 256 bloków znikają z widoku kontraktu",
        "Kontrakty nie czytają logów; potrzebne dane muszą być w storage",
        "Odczyt logu kosztuje 2100 gasu za topic, co jest zaporowe",
        "Tylko twórca kontraktu może czytać jego logi z poziomu EVM"
      ],
      answer: 1
    }
  ],
  "contract-storage": [
    {
      kind: "detail",
      question: "Kontrakt w Solidity deklaruje mapping(address => uint256) balances w slocie 2. Gdzie jest zapisana wartość dla posiadacza H?",
      options: [
        "Pod keccak256 z 2 jako 32 bajty, a po nim H jako 32 bajty",
        "W slocie 2 plus liczbowa wartość adresu H",
        "Pod keccak256 z H jako 32 bajty, a po nim 2 jako 32 bajty",
        "Pod keccak256 z samego H, z pominięciem numeru slotu"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Dwie zmienne uint128 są zadeklarowane jedna po drugiej na początku kontraktu. Ile slotów storage zajmują?",
      options: [
        "Dwa, bo każda zmienna dostaje własny slot",
        "Jeden, bo razem wypełniają dokładnie jeden 32-bajtowy slot",
        "Dwa, bo pakowanie działa tylko wewnątrz struktur",
        "Cztery, bo każdy uint128 jest zapisany jako dwie połówki"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Kontrakt trzyma flagę reentrancy w transient storage przez TSTORE. Co z niej pokazuje eth_getStorageAt po transakcji?",
      options: [
        "Ostatnią wartość flagi, bo dzieli sloty z trwałym storage",
        "Nie ma po niej śladu, bo transient storage nie jest utrwalany",
        "Jej wartość, jeśli zapytać o blok, który zawierał to wywołanie",
        "Błąd, bo metoda odrzuca sloty transient storage"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego każdy może odczytać zmienną kontraktu zadeklarowaną jako private?",
      options: [
        "Zmienne prywatne są trzymane jawnym tekstem tylko na węzłach archiwalnych",
        "Widoczność blokuje tylko inne kontrakty; RPC czyta dowolny slot",
        "Kompilatory ignorują słowo private od Solidity 0.8",
        "Każdy, kto ma ABI wdrażającego, może odszyfrować prywatny storage"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Skrypt, który szuka wpisu w mappingu Solidity, hashuje numer slotu przed kluczem, a eth_getStorageAt zwraca zero. Co poszło nie tak?",
      options: [
        "Mapping jest pusty, bo zero oznacza, że nie ma w nim wpisów",
        "Kolejność to klucz, potem slot; odczytano nieużywany slot",
        "eth_getStorageAt w ogóle nie czyta wpisów mappingu",
        "Dla mappingów adresów slot trzeba hashować dwa razy"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Upgrade wstawia nową zmienną w środek deklaracji kontraktu. Co dzieje się ze zmiennymi zadeklarowanymi po niej?",
      options: [
        "Zachowują swoje sloty, bo sloty są przypisywane po nazwie",
        "Przenoszą się do hashowanych slotów wyliczanych z ich nazw",
        "Przesuwają się do dalszych slotów, więc stare dane nie pasują",
        "Nic, bo kompilator dopisuje nowe zmienne na końcu"
      ],
      answer: 2
    }
  ],
  state: [
    {
      kind: "contrast",
      question: "Węzeł przechowuje historię i stan osobno. Na które pytanie odpowiada na podstawie stanu?",
      options: [
        "Jakie logi wyemitował dany kontrakt w ostatnim tygodniu",
        "Jaki receipt wytworzyła dana transakcja",
        "Jakie saldo miał adres w bloku 19 000 000",
        "Jakie transakcje zawierał blok 19 000 000"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Węzeł odpowiada na eth_getBlockByNumber dla bloku sprzed sześciu miesięcy, ale eth_call w tym bloku kończy się błędem missing trie node. Dlaczego?",
      options: [
        "Blok wypadł w reorgu i przetrwał tylko jego nagłówek",
        "Specyfikacja wyłącza eth_call dla bloków starszych niż miesiąc",
        "Węzeł zachował historię tego bloku, ale jego stan usunął pruning",
        "Blok jest starszy niż wersja EVM, którą węzeł teraz uruchamia"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co zmienia salda kont bez wykonywania jakiejkolwiek transakcji?",
      options: [
        "Spalanie base fee, które trochę uszczupla każde saldo",
        "eth_sendTransaction, gdy węzeł ma klucz danego konta",
        "Wypłaty walidatorów dodawane przez warstwę konsensusu",
        "State overrides przekazane przez wywołującego do eth_call"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Aplikacja czyta receipt z jednego węzła za load balancerem, a saldo z drugiego. Na czym polega ryzyko?",
      options: [
        "Drugi węzeł odrzuca odczyty bloków, których nie zaimportował",
        "Te dwie odpowiedzi mogą pochodzić z różnych headów łańcucha",
        "Salda z drugiego węzła są serwowane z jego mempoolu",
        "logsBloom z receiptu nie zgodzi się z tym na drugim węźle"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego nie ma metody RPC, która zapisuje wartość bezpośrednio w stanie?",
      options: [
        "Bezpośredni zapis jest dozwolony tylko na węzłach archiwalnych",
        "Zapisy są zbierane i nakładane w następnej epoce",
        "Stan może zmienić tylko wykonanie bloku",
        "Taka metoda istnieje, ale wymaga przestrzeni nazw admin"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co odzwierciedla odczyt stanu z tagiem pending?",
      options: [
        "Uzgodniony przez sieć obraz stanu następnego bloku",
        "Stan z bloku latest, opóźniony o jeden slot",
        "Domysł jednego węzła o następnym bloku, z jego mempoolu",
        "Stan, na który następny proposer już się zdecydował"
      ],
      answer: 2
    }
  ],
  "state-root": [
    {
      kind: "detail",
      question: "Z którego momentu pochodzi stan opisany przez stateRoot w nagłówku bloku N?",
      options: [
        "Sprzed wykonania bloku N, więc to stan po bloku rodzica",
        "Po transakcjach bloku N, ale przed jego wypłatami walidatorów",
        "Z chwili, gdy proposer zaczął budować payload bloku N",
        "Po zastosowaniu transakcji i wypłat walidatorów bloku N"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Dwóch klientów wykonawczych wylicza dla tego samego bloku inny state root. Co się dzieje?",
      options: [
        "Każdy z nich go akceptuje, a następna epoka uzgadnia ich stany",
        "Warstwa konsensusu wybiera korzeń większości i przepisuje nagłówek",
        "Klient, którego korzeń nie zgadza się z nagłówkiem, odrzuca blok",
        "Nic, bo state root to tylko informacyjne metadane"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Czego poza odpowiedzią eth_getProof potrzeba, żeby samodzielnie zweryfikować saldo?",
      options: [
        "Pełnego trie stanu tego bloku z innego węzła",
        "Nagłówka tego samego bloku, któremu już się ufa",
        "Drugiego providera zwracającego to samo saldo",
        "Transakcji, która ostatnio zmieniła to saldo"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego dwóch klientów o zupełnie różnym sposobie przechowywania danych na dysku i tak wylicza ten sam state root?",
      options: [
        "Klienci w każdym bloku konwertują bazy do jednego wspólnego formatu",
        "Warstwa konsensusu wylicza korzeń i przekazuje go każdemu z nich",
        "Korzeń wynika z danych stanu, a nie ze sposobu ich przechowywania",
        "Protokół narzuca każdemu klientowi układ danych na dysku"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Bridge chce udowodnić, że log został wyemitowany. Dlaczego dowód względem stateRoot nie wystarczy?",
      options: [
        "stateRoot obejmuje tylko konta, które wysłały transakcje",
        "Logi są pod receiptsRoot, a nie pod state root",
        "Logi są usuwane z trie stanu po 256 blokach",
        "stateRoot używa SHA-256, którego dowody logów nie mogą użyć"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Endpoint archiwalny obsługuje eth_call na bloku sprzed dwóch lat, ale odmawia obsługi eth_getProof na tym samym bloku. Jak to wyjaśnić?",
      options: [
        "Według specyfikacji eth_getProof działa tylko dla ostatnich 128 bloków",
        "Dowody dla starych bloków wymagają zaufanego nagłówka, którego mu brak",
        "Odtwarza stare wartości, ale nie odbudowuje starego trie",
        "Endpoint usunął blok, ale zachował jego receipty"
      ],
      answer: 2
    }
  ],
  "logs-bloom": [
    {
      kind: "consequence",
      question: "logsBloom bloku nie zawiera szukanego adresu. Jaki z tego wniosek?",
      options: [
        "Pewnie żaden log nie pasuje, ale receipty i tak trzeba sprawdzić",
        "Żaden log w tym bloku nie został wyemitowany przez ten adres",
        "Blok nie zawiera żadnych logów",
        "Żadnego wniosku, bo bloom obejmuje tylko topics, a nie adresy"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Bloom bloku pasuje do filtra. Co poprawny klient powinien zrobić dalej?",
      options: [
        "Zwrócić dopasowanie, bo bloom jest rozstrzygający",
        "Przeliczyć bloom z nagłówka, żeby go sprawdzić",
        "Sprawdzić następny blok, bo trafienie znaczy, że log jest blisko",
        "Wczytać receipty i porównać, bo trafienia blooma bywają fałszywe"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Ile z 2048 bitów ustawia jeden adres lub topic?",
      options: ["Jeden", "Trzy", "Jedenaście", "Trzydzieści dwa"],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego eth_getLogs nie potrafi filtrować po polu data logu?",
      options: [
        "Pole data jest szyfrowane, dopóki blok nie zostanie sfinalizowany",
        "Do blooma trafiają tylko adres i topics",
        "Pole data leży w trie stanu, a nie w receiptach",
        "Pole data jest usuwane z receiptów po zbudowaniu bloku"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Jak zmienia się przydatność blooma, gdy bloki są coraz bardziej zapełnione?",
      options: [
        "Bloom rośnie ponad 2048 bitów, żeby ograniczyć fałszywe trafienia",
        "Większość bitów jest ustawiona, więc pasuje niemal do wszystkiego",
        "Bloom przechodzi na nowe funkcje hashujące, żeby zostać selektywnym",
        "Bloom staje się dokładny, bo więcej logów wyostrza każdy bit"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym logsBloom receiptu różni się od logsBloom w nagłówku jego bloku?",
      options: [
        "Bloom receiptu obejmuje tylko topics, a bloom nagłówka dodaje adresy",
        "Bloom receiptu obejmuje jego logi, a bloom nagłówka to OR wszystkich",
        "Bloom receiptu jest dokładny, a bloom nagłówka daje fałszywe trafienia",
        "Bloom receiptu ma 256 bitów, a bloom nagłówka pełne 2048"
      ],
      answer: 1
    }
  ],
  "keccak-256": [
    {
      kind: "scenario",
      question: "web3_sha3 dla pustego wejścia zwraca hash zaczynający się od 0xc5d24601. Co z tego wynika?",
      options: [
        "Węzeł używa przestarzałej implementacji SHA3-256",
        "Wejście zostało odrzucone i zwrócono wartość zastępczą",
        "Metoda liczy Keccak-256, a nie NIST SHA3-256",
        "Metoda liczy NIST SHA3-256, zgodnie ze swoją nazwą"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jeden z tych commitmentów jest liczony przez SHA-256, a nie Keccak-256. Który?",
      options: [
        "Czterobajtowy selektor funkcji",
        "Klucz w trie storage",
        "Hash bloku warstwy wykonawczej",
        "Versioned hash bloba"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Skrypt przekazuje do keccak256 string hex 0x1234 jako tekst, a nie jako dwa bajty, które on reprezentuje. Co z tego wychodzi?",
      options: [
        "Ten sam hash, bo biblioteki wykrywają wejście hex",
        "Błąd, bo hashowanie tekstu jest niedozwolone",
        "Poprawnie wyglądający hash zupełnie złego wejścia",
        "Hash SHA3-256 zamiast hasha Keccak-256"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego Keccak-256 i NIST SHA3-256 dają dla tego samego wejścia zupełnie różne hashe?",
      options: [
        "SHA3-256 hashuje dwa razy, a Keccak-256 tylko raz",
        "NIST zmienił regułę paddingu po tym, jak Ethereum przyjęło Keccak",
        "Keccak-256 przed hashowaniem dokleja na początek chain ID",
        "SHA3-256 liczy wewnętrznie na 512 bitach, a Keccak-256 na 256"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Trafiasz na 32-bajtowy commitment policzony przez SHA-256. Do której strony Ethereum najpewniej należy?",
      options: [
        "Do warstwy konsensusu, jak korzenie SSZ",
        "Do warstwy wykonawczej, jak klucze trie",
        "Do warstwy JSON-RPC, jak web3_sha3",
        "Do warstwy devp2p, jak wiadomości RLP"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Pod jakim kluczem konto jest zapisane w trie stanu?",
      options: [
        "Pod swoim 20-bajtowym adresem, bez hashowania",
        "Pod hashem Keccak-256 swojego adresu",
        "Pod hashem SHA-256 swojego adresu",
        "Pod hashem swojego adresu i nonce"
      ],
      answer: 1
    }
  ],
  rlp: [
    {
      kind: "detail",
      question: "Jak RLP koduje w bajtach liczbę całkowitą zero?",
      options: [
        "Jako pojedynczy bajt 0x00",
        "Jako 0x80, czyli pusty ciąg bajtów",
        "Jako 0x8100, jednobajtowy ciąg z zerem",
        "Jako 0xc0, czyli pustą listę"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego dekoder RLP bez wiedzy z zewnątrz nie odróżni 20-bajtowego adresu od 20-bajtowej liczby?",
      options: [
        "Adres i liczba mają ten sam znacznik typu w prefiksie długości",
        "Dekoder usuwa znaczniki typów, żeby kodowanie było kanoniczne",
        "RLP zapisuje tylko długości i zagnieżdżenie, nigdy typy",
        "Typy są w końcowym bajcie, który dekodery pomijają"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Surowa transakcja zaczyna się od bajtu 0x02. Która jej część jest w RLP?",
      options: [
        "Cały payload, łącznie z pierwszym bajtem",
        "Wszystko po tym pierwszym bajcie",
        "Żadna, bo transakcje typowane używają SSZ",
        "Tylko pola podpisu na samym końcu"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego RLP wymaga, żeby liczby całkowite nie miały zer wiodących?",
      options: [
        "Zera wiodące zostałyby odczytane jako prefiks zagnieżdżonej listy",
        "EVM nie potrafi wczytać słów, które mają zera wiodące",
        "Żeby każda wartość miała jedno poprawne kodowanie i ten sam hash",
        "Zera wiodące przekraczają limit 55 bajtów dla krótkich ciągów"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Ręcznie napisany enkoder zapisuje nonce jako stałą ośmiobajtową wartość z zerami wiodącymi. Co się stanie po wysłaniu transakcji?",
      options: [
        "Węzeł usunie zera i przyjmie ją bez zmian",
        "Zostanie przyjęta, bo RLP ignoruje zera wiodące",
        "Zostanie odrzucona jako kodowanie nieminimalne",
        "Nonce zostanie odczytany jako osiem osobnych elementów listy"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Piszesz dekodery dla kilku źródeł bajtów. Które z nich jest zakodowane w RLP?",
      options: [
        "Calldata w polu input transakcji",
        "Blok beacon pobrany jako octet-stream",
        "Trie node'y zwracane przez eth_getProof",
        "Body odpowiedzi JSON-RPC"
      ],
      answer: 2
    }
  ],
  ssz: [
    {
      kind: "detail",
      question: "Jakiej funkcji hashującej używa merkleizacja SSZ do zbudowania hash tree root?",
      options: ["Keccak-256", "SHA-256", "SHA3-256", "BLAKE2b"],
      answer: 1
    },
    {
      kind: "detail",
      question: "Czym dokładnie jest hash tree root obiektu SSZ?",
      options: [
        "Jednym hashem zserializowanych bajtów obiektu, liczonym w jednym przebiegu",
        "Rootem binarnego drzewa Merkle nad 32-bajtowymi fragmentami obiektu",
        "Rootem Merkle-Patricia Trie, w którym przechowywany jest stan beacon",
        "Sumą kontrolną offsetów zapisanych w zmiennej części obiektu"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Chcesz, żeby endpoint Beacon API zwrócił stan beacon jako SSZ, a nie JSON. Co wysyłasz?",
      options: [
        "Parametr zapytania format=ssz w tej ścieżce",
        "To samo żądanie, ale na osobny port tylko binarny",
        "Nagłówek Accept z wartością application/octet-stream",
        "Body żądania POST z prośbą o kodowanie ssz"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co można zrobić z bajtami SSZ, czego nie da się zrobić z bajtami RLP?",
      options: [
        "Zdekodować typy wartości bez wcześniejszej znajomości schematu",
        "Skoczyć do pola dzięki schematowi, bez przechodzenia po długościach",
        "Odzyskać hash tree root obiektu bez żadnego hashowania",
        "Pominąć nieznane pola, które późniejszy fork dopisał do obiektu"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Narzędzie dekoduje nowy blok beacon typem SSZ z wcześniejszego forka. Co się dzieje?",
      options: [
        "Dekoduje wspólne pola i bez problemu pomija nowe",
        "Nie przechodzi sprawdzenia SHA-256 i zgłasza uszkodzone pobranie",
        "Odczytuje nowy obiekt jako śmieci, bo schemat się zmienił",
        "Działa, bo typy SSZ są zamrożone od chwili wydania"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego lekki klient może zweryfikować jedno pole dużego stanu beacon bez pobierania całości?",
      options: [
        "Stany beacon są na tyle małe, że mieszczą się w jednym chunku SSZ",
        "Każde pole ma stałą pozycję w drzewie Merkle zbudowanym nad stanem",
        "Beacon node'y podpisują każde pole osobno swoimi kluczami",
        "Beacon API zwraca każde pole razem z dowodem trie RLP"
      ],
      answer: 1
    }
  ],
  "ecdsa-signature": [
    {
      kind: "detail",
      question: "Skąd węzeł wie, które konto wysłało transakcję?",
      options: [
        "Czyta pole from w podpisanym payloadzie",
        "Szuka hasha w swoim indeksie nadawców",
        "Odzyskuje adres z podpisu",
        "Portfel podaje nadawcę przy wysyłaniu"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Po co EIP-155 wplata chain ID w pole v transakcji legacy?",
      options: [
        "Żeby węzły mogły pomijać odzyskiwanie nadawcy w znanych łańcuchach",
        "Żeby podpis z jednego łańcucha był bezużyteczny w innym",
        "Żeby zrobić w v miejsce na drugi bit odzyskiwania",
        "Żeby jeden podpis mógł autoryzować płatność w kilku łańcuchach"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Ktoś po drodze zmienia jeden bajt w polu value podpisanej transakcji. Co widzi węzeł?",
      options: [
        "Oryginalną transakcję, naprawioną na podstawie podpisu",
        "Podpis, z którego wychodzi teraz inny, niezwiązany adres",
        "Poprawną transakcję od tego samego nadawcy z nową wartością",
        "Transakcję oznaczoną jako zmodyfikowana w jej późniejszym receipcie"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Transakcja legacy ma v równe 0x26, czyli 38. Co to koduje według EIP-155?",
      options: [
        "Chain ID 1 z parzystością odzyskiwania 0",
        "Chain ID 19, bo v to dwukrotność chain ID",
        "Chain ID 1 z parzystością odzyskiwania 1",
        "Parzystość odzyskiwania 11, licząc od 27"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego publiczne endpointy wyłączają eth_sendTransaction, ale przyjmują eth_sendRawTransaction?",
      options: [
        "Pierwsza metoda pomija sprawdzanie nonce i opłat w mempoolu",
        "Pierwsza metoda każe węzłowi podpisać kluczem, który przechowuje",
        "Pierwsza metoda obsługuje tylko transakcje legacy typu 0x0",
        "Pierwsza metoda zwraca wynik przed walidacją transakcji"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Biblioteka generuje podpis, którego wartość s leży w górnej połowie rzędu krzywej. Co się dzieje, gdy transakcja go użyje?",
      options: [
        "Jest akceptowany, bo każda postać s daje tego samego nadawcę",
        "Węzły go odrzucają, bo EIP-2 wymaga niskiej wartości s",
        "Węzeł zamienia go na niską postać i akceptuje",
        "Wychodzi z niego inny nadawca i transakcja nie przechodzi sprawdzenia salda"
      ],
      answer: 1
    }
  ],
  wei: [
    {
      kind: "detail",
      question: "eth_getBalance zwraca dla adresu 0xde0b6b3a7640000. Ile to etheru?",
      options: ["0,1 etheru", "1 ether", "10 etherów", "1 gwei"],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego JSON-RPC zwraca salda jako stringi hex, a nie liczby JSON?",
      options: [
        "Hex zajmuje w przesyle mniej miejsca niż cyfry dziesiętne",
        "Salda są tablicami bajtów, a nie liczbami",
        "Kwoty w wei przekraczają to, co double mieści dokładnie",
        "JSON-RPC 2.0 zabrania liczb w każdym wyniku"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Kontrakt tokena podaje decimals równe 6, a balanceOf zwraca dla posiadacza 1000000. Ile posiadacz ma tokenów?",
      options: ["1000000 tokenów", "1 token", "0,000000000001 tokena", "0,000001 etheru"],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Dashboard zamienia salda w wei na liczby JavaScript przez Number, zanim je zsumuje. Co idzie nie tak?",
      options: [
        "Number rzuca wyjątek dla stringów z prefiksem 0x, więc każde saldo daje błąd",
        "Kwoty powyżej około 0,009 etheru mogą po cichu stracić precyzję",
        "Salda powyżej 1000 etherów przepełniają się i stają się Infinity",
        "Zerowe salda zawodzą, bo Number odrzuca string 0x0"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Zwykły przelew zużywa 21000 gasu przy effectiveGasPrice równym 25 gwei. Ile wynosi opłata?",
      options: ["0,00525 etheru", "0,000525 etheru", "0,0000525 etheru", "525000 wei"],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym kwota tokena ERC-20 różni się od kwoty etheru liczonej w wei?",
      options: [
        "Kwoty tokenów mają tę samą skalę 10 do potęgi 18, wymuszaną przez EVM",
        "Kwoty tokenów mają przecinek tam, gdzie wskazuje dany kontrakt",
        "Kwoty tokenów są zapisywane w gwei, a nie w wei",
        "Kwoty tokenów to liczby zmiennoprzecinkowe, bo tokeny są podzielne"
      ],
      answer: 1
    }
  ],
  abi: [
    {
      kind: "detail",
      question: "Jak powstaje czterobajtowy selektor funkcji?",
      options: [
        "Pierwsze cztery bajty adresu kontraktu plus indeks",
        "Indeks nadawany przez kompilator w kolejności deklaracji",
        "Keccak-256 kanonicznej sygnatury, pierwsze cztery bajty",
        "Keccak-256 samej nazwy funkcji, bez typów argumentów"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Funkcja przyjmuje argument typu string. Jak ten argument wygląda w calldata?",
      options: [
        "Jako surowe bajty UTF-8 na miejscu, dopełnione do wielokrotności 32",
        "Jako hash Keccak-256 tego tekstu, w jednym słowie",
        "Jako 32-bajtowy offset, a długość i bajty za częścią główną",
        "Jako wskaźnik do pamięci kontraktu wywołującego"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "eth_call zwraca 0x bez błędu dla funkcji, która powinna zwrócić uint256. Jaka jest prawdopodobna przyczyna?",
      options: [
        "Wywołanie skończyło się revertem, a węzeł ukrył błąd",
        "Limit gasu węzła wyczerpał się, zanim funkcja zwróciła wynik",
        "Pod tym adresem w odpytywanym bloku nie ma żadnego kodu",
        "Zwrócona wartość to zero, które koduje się jako 0x"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Do wyliczenia selektora zahashowano tekst transfer(address to, uint256 amount). Co się stanie, gdy wywołanie użyje tego selektora?",
      options: [
        "Pasuje, bo hashowanie ignoruje nazwy argumentów",
        "Pasuje, gdy węzeł znormalizuje sygnaturę",
        "Nie trafi w żadną funkcję, bo nazwy zmieniają hash",
        "Wywołanie skończy się revertem z kodem Panic za złe dane"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Dane revertu zaczynają się od selektora 0x08c379a0. Co zawierają?",
      options: [
        "Kod liczbowy zakodowany jako Panic(uint256)",
        "Tekst powodu zakodowany jako Error(string)",
        "Argumenty custom errora, do których trzeba ABI",
        "Raport o braku gasu dodany przez węzeł"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego dekodowanie wyniku wywołania złym ABI jest niebezpieczne, a nie po prostu kończy się błędem?",
      options: [
        "Węzeł odrzuca wywołanie i blokuje klucz wywołującego",
        "Dekoder psuje storage kontraktu przy zapisie zwrotnym",
        "Bajty dekodują się w wiarygodne wartości zamiast błędu",
        "Zmienia selektor, więc następne wywołanie trafia w inną funkcję"
      ],
      answer: 2
    }
  ],
  revert: [
    {
      kind: "scenario",
      question: "Transakcja trafiła do bloku ze statusem 0x0. Gdzie można znaleźć powód revertu?",
      options: [
        "W receipcie, w osobnym polu error obok pola status",
        "W logach receiptu, jako specjalny event z opisem błędu",
        "Nigdzie; trzeba ją odtworzyć przez eth_call albo zrobić trace",
        "W polu input transakcji, dopisany tam przez węzeł"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Dane revertu to 0x4e487b71, a po nim słowo z wartością 0x11. Co się nie udało?",
      options: [
        "require nie przeszedł, a powód to tekst 0x11",
        "Zgłoszono custom error z selektorem 0x4e487b71",
        "Przepełnienie arytmetyczne, Panic z kodem 0x11",
        "Wywołaniu zabrakło gasu po 0x11 ramkach"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jak eth_call zgłasza wywołanie, którego wykonanie kończy się revertem?",
      options: [
        "Jako udany wynik 0x, który wywołujący musi sam wychwycić",
        "Jako błąd JSON-RPC, którego data zawiera bajty revertu",
        "Jako wynik null wysłany ze statusem HTTP 400",
        "Jako obiekt wyniku z polem status równym 0x0"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co odróżnia REVERT od wyczerpania gasu w ramce, która się nie powiodła?",
      options: [
        "REVERT zachowuje zmiany ramki; brak gasu je cofa",
        "REVERT oddaje resztę gasu i dane; brak gasu nie oddaje nic",
        "REVERT unieważnia całą transakcję; brak gasu tylko jedną ramkę",
        "REVERT jest darmowy; brak gasu obciąża za zużyty gas"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego przy eth_call z revertem biblioteka kliencka powinna szukać pola data, a nie sprawdzać kodu błędu 3?",
      options: [
        "Kod 3 jest zarezerwowany dla braku gasu, nie dla revertów",
        "Kod 3 pojawia się tylko wtedy, gdy dane revertu są puste",
        "Providerzy używają różnych kodów; to data zawiera bajty revertu",
        "Kod jest losowy dla każdego żądania, by utrudnić fingerprinting"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Najbardziej zewnętrzne wywołanie transakcji kończy się revertem. Co mimo to dzieje się z transakcją i jej nadawcą?",
      options: [
        "Trafia do bloku, płaci za gas, a jej nonce zostaje zużyty",
        "Nic; transakcja przepada, jakby jej nigdy nie wysłano",
        "Gas jest w całości zwracany, choć nonce i tak zostaje zużyty",
        "Trafia do bloku, ale nonce zostaje wolny do ponowienia"
      ],
      answer: 0
    }
  ],
  mempool: [
    {
      kind: "detail",
      question: "eth_getTransactionByHash zwraca transakcję z blockNumber równym null. Co to oznacza?",
      options: [
        "Węzeł ją odrzucił, ale zachował zapis tej próby",
        "Trafiła do bloku, a pruning usunął dane tego bloku",
        "Węzeł trzyma ją w mempoolu, jeszcze poza blokiem",
        "Węzeł nigdy nie widział tego hasha"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Następny nonce konta to 7, a przychodzi z niego transakcja z nonce 9. Gdzie mempool ją umieszcza?",
      options: [
        "W zbiorze pending, bo jej nonce jest wyższy niż 7",
        "W zbiorze queued, dopóki nie przyjdą nonce 7 i 8",
        "Od razu w następnym bloku, poza kolejnością",
        "Nigdzie; jest odrzucana jako nonce too high"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego dwa dobrze połączone węzły mogą się nie zgadzać co do tego, które transakcje są pending?",
      options: [
        "Protokół przydziela każdemu węzłowi własny shard mempoola",
        "Tylko następny proposer ma pełny, kanoniczny mempool",
        "Mempoole są lokalne: inny gossip, wyrzucanie i prywatny ruch",
        "Transakcje pending stają się danymi konsensusu o slot później"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Aplikacja wysyła transakcję przez endpoint A, a o receipt odpytuje endpoint B. Co może pójść źle?",
      options: [
        "B odrzuca zapytanie, bo nigdy nie widział tej transakcji",
        "B może zwracać null długo po włączeniu transakcji do bloku",
        "B zwraca receipt pending z A ze statusem 0x0",
        "B liczy transakcję podwójnie, gdy dotrze kopia z A"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Jaki jest największy rozmiar zakodowanej transakcji, który mempool Geth domyślnie przyjmuje?",
      options: ["32 KB", "128 KB", "1024 KB", "24 KB"],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Searcherzy wysyłają transakcje prosto do builderów przez prywatne endpointy. Co z nich widzi obserwator transakcji pending?",
      options: [
        "Nic, dopóki nie pojawią się po raz pierwszy w bloku",
        "Wszystko, bo builderzy rozgłaszają prywatny ruch publicznie",
        "Tylko ich hashe, bo prywatne endpointy ukrywają resztę",
        "Tylko blobowe, bo ich sidecary krążą publicznie"
      ],
      answer: 0
    }
  ],
  withdrawals: [
    {
      kind: "detail",
      question: "W jakiej jednostce jest wyrażone pole amount wypłaty?",
      options: [
        "W wei, jak inne wartości w RPC",
        "W etherach, jako wartość hex",
        "W gwei, a gwei to miliard wei",
        "W udziałach walidatora po 32 ethery"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Wypłata zasila adres. Co indekser może z niej zaobserwować?",
      options: [
        "Transakcję wysłaną z adresu zerowego do odbiorcy",
        "Log z kontraktu systemowego pod stałym adresem",
        "Zmianę salda i wpis na liście w body bloku",
        "Receipt ze statusem 0x1 i pustą tablicą logów"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Ile wypłat może najwyżej zawierać jeden blok wykonawczy?",
      options: [
        "Tyle, na ile pozwala limit gasu bloku",
        "Po jednej na walidatora, który wyszedł w danym slocie",
        "Najwyżej 16, co ustala protokół",
        "Bez limitu, bo nie zużywają gasu"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Giełda odtwarza salda, sumując każdą transakcję dotykającą jej adresów. Co dzieje się z adresem, który dostaje wypłaty?",
      options: [
        "Nic, bo wypłaty przychodzą jako transakcje",
        "Jego saldo jest zawyżone o opłaty za wypłaty",
        "Wyliczone saldo jest coraz bardziej zaniżone",
        "Każde zasilenie liczy się podwójnie, raz na receipt"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego wypłata nie ma nadawcy, gasu ani receiptu?",
      options: [
        "Jej opłaty są płacone w warstwie konsensusu, która trzyma receipt",
        "To zasilenie dopisywane przez warstwę konsensusu, a nie transakcja",
        "Walidatorzy podpisują je w batchach, więc jeden receipt obejmuje blok",
        "Odbiorca płaci za gas później, z otrzymanej kwoty"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym wypłata częściowa różni się od pełnej?",
      options: [
        "Częściowa jest w gwei, a pełna w wei",
        "Częściowa wypłaca nadwyżkę, pełna całość po wyjściu",
        "Częściowa idzie na credentials 0x00, a pełna na 0x01",
        "Częściowa liczy się do limitu 16 na blok, a pełna nie"
      ],
      answer: 1
    }
  ],
  genesis: [
    {
      kind: "scenario",
      question: "Dodajesz nowego providera RPC i chcesz się upewnić, że naprawdę serwuje mainnet. Które sprawdzenie jest najmocniejsze?",
      options: [
        "Sprawdzenie, że eth_chainId zwraca 0x1",
        "Sprawdzenie, że net_version zwraca 1",
        "Porównanie hasha bloku 0 ze znaną wartością",
        "Odczytanie nazwy sieci z web3_clientVersion"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jak w konfiguracji łańcucha klienta wykonawczego planuje się aktualizacje po Merge?",
      options: [
        "Według numeru bloku, tak jak wcześniejsze aktualizacje",
        "Według timestampu, w polach takich jak cancunTime",
        "Według epoki warstwy konsensusu, w polach takich jak cancunEpoch",
        "Według progu łącznej trudności dla każdej aktualizacji"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Skąd bierze się stan w bloku 0?",
      options: [
        "Z transakcji zawartych w bloku 0",
        "Z sald kontraktu depozytowego w chwili startu",
        "Z alokacji zapisanej w pliku genesis",
        "Znikąd; stan zaczyna się pusty w bloku 1"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Dwa węzły działają z harmonogramami forków, które różnią się tylko pragueTime. Kiedy ujawni się problem?",
      options: [
        "Przy starcie, gdy peery porównają konfiguracje i odmówią połączenia",
        "Nigdy, bo warstwa konsensusu nadpisuje harmonogram",
        "Gdy pierwszy z nich aktywuje Prague i łańcuch się rozdzieli",
        "Przy następnym restarcie, gdy nie uda się otworzyć bazy danych"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego hash genesis trudniej przypadkiem sfałszować niż odpowiedź eth_chainId?",
      options: [
        "Ethereum Foundation podpisuje go przy każdym wydaniu",
        "Jest obliczany z łańcucha, a nie wpisywany do konfiguracji",
        "Warstwa konsensusu sprawdza go przy każdym żądaniu",
        "Zmienia się przy każdej aktualizacji, więc stare wartości się wyróżniają"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Kontrakt działa na lokalnym devnecie, ale na publicznym testnecie kończy się błędem invalid opcode. Jaka jest prawdopodobna przyczyna?",
      options: [
        "Alokacja genesis testnetu nie obejmowała środków deployera",
        "Fork z tym opcode'em działa na devnecie, ale tam jeszcze nie",
        "Chain ID devnetu całkowicie wyłączył sprawdzanie opcode'ów",
        "Węzeł testnetu usunął przez pruning stan potrzebny opcode'owi"
      ],
      answer: 1
    }
  ],
  "eip-7702": [
    {
      kind: "detail",
      question: "eth_getCode dla konta zwraca 0xef0100, a po nim dwadzieścia bajtów. Co to jest?",
      options: [
        "Kontrakt, którego bytecode runtime jest nietypowo krótki",
        "Znacznik delegacji, który wskazuje kod uruchamiany przez konto",
        "Błąd kodowania z klienta bez obsługi typu 0x4",
        "Wskaźnik z konta na jego własny storage root"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Konto z delegacją uruchamia kod delegata, który zapisuje slot storage. Czyj storage się zmienia?",
      options: [
        "Storage kontraktu delegata",
        "Storage konta i delegata, bo zapis jest kopiowany",
        "Własny storage konta z delegacją",
        "Niczyj, bo kod delegowany tylko czyta"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Transakcja typu 0x4 ustawia kod na koncie. Kto za nią płaci?",
      options: [
        "Konto autoryzujące, niezależnie od tego, kto wysyła transakcję",
        "Jej nadawca, którym może być sponsor, a nie konto autoryzujące",
        "Kontrakt delegata, ze swojego salda",
        "Proposer, któremu protokół zwraca koszt"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Transakcja typu 0x4 zawiera autoryzację, której nonce nie zgadza się już z nonce konta autoryzującego. Co się dzieje?",
      options: [
        "Cała transakcja robi revert, a gas zostaje zwrócony",
        "Węzeł od razu odrzuca transakcję i nie wpuszcza jej do mempoolu",
        "Autoryzacja jest pomijana, a transakcja i tak się wykonuje",
        "Nonce konta autoryzującego zostaje ustawiony tak, żeby pasował"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego indekser powinien odczytywać delegację konta w każdym interesującym go bloku, zamiast trzymać ją w cache?",
      options: [
        "Delegacje wygasają automatycznie po 8191 blokach",
        "Późniejsza autoryzacja może ją przekierować albo usunąć",
        "Znacznik jest zapisywany w nowym formacie przy każdym forku",
        "Delegacje są ważne tylko w transakcji, która je podpisała"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co odróżnia EIP-7702 od ERC-4337 jako drogę do zachowania smart konta?",
      options: [
        "7702 wymaga bundlera i kontraktu EntryPoint, a 4337 obywa się bez nich",
        "7702 zmienia istniejące konta w protokole, a 4337 używa nowych kont",
        "7702 działa tylko na nowych kontach, a 4337 na istniejących",
        "7702 działa tylko w mempoolu, a 4337 zmienia konsensus"
      ],
      answer: 1
    }
  ],
  precompiles: [
    {
      kind: "detail",
      question: "Access lista transakcji zawiera precompile sha256 pod adresem 0x02. Jak ten wpis wpływa na gas transakcji?",
      options: [
        "Oszczędza 100 gasu przy pierwszym wywołaniu precompile'a",
        "Obniża cenę za słowo, którą nalicza sha256",
        "Kosztuje 2400 gasu za adres, który i tak jest już warm",
        "Mempool odrzuca transakcję z powodu nieprawidłowego wpisu"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Backend oznacza każdy adres, dla którego eth_getCode zwraca 0x, jako konto EOA. Jak oznaczy adres ecrecover, czyli 0x01?",
      options: [
        "Jako kontrakt, bo węzeł zwraca tam zastępczy bytecode",
        "Jako puste konto, bo precompile'y nie mają kodu",
        "Jako błąd, bo węzły odmawiają zwracania kodu pod tym adresem",
        "Jako konto z delegacją, bo widać tam znacznik delegacji"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co odróżnia predeploy OP Stack od precompile'a, gdy wywoła się na każdym z nich eth_getCode?",
      options: [
        "Zawsze wychodzi 0x, bo jeden i drugi rodzaj kontraktu działa natywnie",
        "Precompile zwraca zastępczy kod, a predeploy zwraca 0x",
        "Każdy z nich zwraca pojedynczy bajt 0xfe, który oznacza kod natywny",
        "Predeploy zwraca bytecode, a precompile zwraca 0x"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego sprawdzenie w Solidity, czy wynik ecrecover równa się zapisanemu właścicielowi, może przyjąć sfałszowany podpis, gdy właściciela nigdy nie ustawiono?",
      options: [
        "Zły podpis daje pusty wynik, odczytywany jako address(0)",
        "Zły podpis sprawia, że ecrecover robi revert bez powodu",
        "Precompile pomija weryfikację, gdy właściciel jest zerem",
        "Solidity trzyma w cache adres z ostatniego udanego wywołania"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "W eth_simulateV1 adres 0x01 zostaje nadpisany kodem, który zwraca stały adres podpisującego, a movePrecompileToAddress wskazuje 0x…1234. Co odpowiada pod 0x…1234?",
      options: [
        "Kod z nadpisania, który zostaje skopiowany pod nowy adres",
        "Nic, bo nowy adres jest pustym kontem bez kodu",
        "Prawdziwy ecrecover, przeniesiony przed nałożeniem kodu",
        "Błąd, bo precompile'ów nie da się w ogóle nadpisać"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Portfel z passkeys weryfikuje podpisy przez wywołanie 0x100 i zostaje wdrożony bez zmian na łańcuchu bez P256VERIFY. Co dzieje się z poprawnym podpisem?",
      options: [
        "Wywołanie robi revert, więc każda transakcja z nim zawodzi",
        "Wywołanie się udaje i zwraca 1 dla dowolnych danych",
        "Węzeł odrzuca transakcję przed jej wykonaniem",
        "Wywołanie się udaje, ale pusty wynik oznacza nieważny podpis"
      ],
      answer: 3
    }
  ],
  "transient-storage": [
    {
      kind: "cause",
      question: "Dlaczego wywołanie w bloku eth_simulateV1 nie widzi flagi transient ustawionej przez poprzednie wywołanie w tym samym bloku?",
      options: [
        "Każde wywołanie jest osobną transakcją, co zeruje flagę",
        "Symulator wyłącza TSTORE, chyba że włączono walidację",
        "Zapisy transient są odrzucane, gdy każda ramka zwraca wynik",
        "State overrides bloku czyszczą każdy slot transient"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Kontrakt deklaruje uint256 total w slocie storage 0 i bool transient locked w slocie transient 0. Co zwraca eth_getStorageAt dla slotu 0?",
      options: [
        "Wartość locked, bo sloty transient przesłaniają storage",
        "Zero, bo węzeł zeruje sloty zajęte w dwóch mapach naraz",
        "Wartość, jaką locked miało na końcu najnowszego bloku",
        "Wartość total, bo slotów transient nie ma w stanie"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym zapis transient różni się od zapisu do storage, gdy ramka, która go wykonała, robi revert?",
      options: [
        "Cofany jest tylko zapis do storage, a zapis transient zostaje",
        "Cofany jest jeden i drugi, bo transient też podlega revertom",
        "Cofany jest tylko zapis transient, a storage zachowuje wartość",
        "Żaden nie jest cofany przed końcem całej transakcji"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Ile kosztuje TSTORE i czy zapisanie z powrotem zera daje refund?",
      options: [
        "2100 gasu przy cold albo 100 przy warm, z refundem 4800 za czyszczenie",
        "20000 gasu za pierwszy zapis, z refundem 19900 przy resecie",
        "100 gasu, bez refundu za ustawienie wartości na zero",
        "100 gasu, z refundem 4800 przy czyszczeniu slotu"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Kontrakt ustawia flagę transient i nigdy jej nie czyści, a w jednym bundlu ERC-4337 zostaje wywołany dwa razy. Co widzi drugie wywołanie?",
      options: [
        "Wyczyszczoną flagę, bo każda UserOperation dostaje świeże sloty",
        "Błąd, bo TSTORE jest zabroniony wewnątrz bundli",
        "Nadal ustawioną flagę, bo bundle to jedna transakcja",
        "Wartość zostawioną przez ostatnią transakcję poprzedniego bloku"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Do debugowania nieudanej transakcji potrzebna jest wartość blokady transient. Gdzie pojawia się ona w wynikach tracingu Getha?",
      options: [
        "W trace opcode'ów, na stosie kroków TLOAD i TSTORE",
        "W diffie prestateTracer, w storage kontraktu",
        "W callTracer, w polu storage każdej ramki wywołania",
        "W eth_getProof dla tego bloku, ze slotem jako kluczem"
      ],
      answer: 0
    }
  ],
  "gas-refunds": [
    {
      kind: "consequence",
      question: "Jak calldata floor z hard forka Pectra traktuje transakcję, która niesie duży payload, ale niewiele wykonuje?",
      options: [
        "Jej calldata zostaje potem zwrócone do 4 gasu za token",
        "Jej limit refundu rośnie do połowy zużytego gasu, by to wyrównać",
        "Jej gasUsed przekracza zużycie EVM i płaci ona za tę różnicę",
        "Jest wyceniana jak dane blobów i przenoszona na rynek blobów"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co od hard forka London ogranicza refund, jaki może dostać transakcja?",
      options: [
        "Połowa gasu zużytego przed naliczeniem refundu",
        "Stałe 4800 gasu na transakcję, bez względu na liczbę slotów",
        "Jedna piąta gasu zużytego przed naliczeniem refundu",
        "Sam licznik, który od tego forka nie ma żadnego pułapu"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Zadanie keepera, które czyści storage, ma w ostatnim receipcie gasUsed 96 000. Następny przebieg wysyłasz z limitem 96 000 gasu. Co się stanie?",
      options: [
        "Zabraknie gasu, zanim powstanie jakikolwiek refund",
        "Uda się, bo receipt pokazuje, ile potrzebuje przebieg",
        "Uda się i dostanie zwrot kolejnej piątej części z 96 000",
        "Mempool odrzuci je jako poniżej kosztu intrinsic gas"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego eth_estimateGas szuka w kilku przebiegach, zamiast zwrócić gas zużyty w jednym?",
      options: [
        "Jeden przebieg zużywa różnie, zależnie od zawartości cache",
        "Providerzy potrzebują kilku przebiegów, by wycenić ją w compute units",
        "Przez refundy pierwszy przebieg zużywa więcej niż każde powtórzenie",
        "Zapas, jak 64. część zatrzymywana przy wywołaniu, nie jest zużywany"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Jak gasUsed z receiptu ma się do gasu, który transakcja musiała mieć do dyspozycji podczas wykonania?",
      options: [
        "To szczytowe zapotrzebowanie, bo klienci zapisują maksimum",
        "To wartość po refundzie i może być wyraźnie poniżej potrzeb",
        "Zawsze równa się limitowi gasu minus zwrócony stipend",
        "Jest wyższe, bo refundy są doliczane po wykonaniu"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Kontrakt przekazuje cały pozostały gas do kontraktu, który potrzebuje 100 000. Ile mniej więcej musi mieć wywołujący w momencie tego wywołania?",
      options: [
        "Około 125 000, bo piąta część jest zatrzymywana na refundy",
        "Dokładnie 100 000, bo przekazanie oddaje wszystko",
        "Około 102 300, bo dochodzi do tego stipend 2300",
        "Około 101 600, bo zatrzymywana jest 64. część reszty"
      ],
      answer: 3
    }
  ],
  "execution-requests": [
    {
      kind: "contrast",
      question: "Czym różnią się żądania depozytu od żądań wypłaty pod względem tego, skąd warstwa wykonawcza je bierze?",
      options: [
        "Depozyty z wywołania systemowego, wypłaty z logów kontraktu",
        "Jedne i drugie z logów wspólnego systemowego kontraktu żądań",
        "Jedne i drugie dostarcza klient konsensusu w payload attributes",
        "Depozyty z logów kontraktu, wypłaty z wywołania systemowego"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Indekser chce znać każde żądanie konsolidacji przetworzone w danym bloku. Gdzie znajdzie miarodajną listę?",
      options: [
        "W polu requests wyniku eth_getBlockByNumber",
        "W polu execution_requests w body bloku beacon",
        "W receipcie końcowej transakcji systemowej bloku",
        "W logach, które kontrakt konsolidacji emituje w tym bloku"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co zawiera requestsHash bloku, który nie niesie żadnych żądań?",
      options: [
        "SHA-256 pustego ciągu, 0xe3b0c442…b855",
        "Zerowy hash 0x000…000 oznaczający nieużywane pole",
        "Keccak-256 pustej listy RLP, jak dla uncles",
        "Hash żądań bloku rodzica, przeniesiony dalej"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Transakcja stakera do kontraktu żądań wypłaty kończy się statusem 0x1, ale adres źródłowy nie pasuje do credentials walidatora. Co z tego wynika?",
      options: [
        "Wywołanie systemowe na końcu bloku ją wycofuje i zwraca opłatę",
        "Warstwa konsensusu i tak przeprowadza wyjście, tylko z opóźnieniem",
        "Warstwa konsensusu ją ignoruje, a opłata nie wraca",
        "Opłata wraca do nadawcy w następnym sweepie wypłat"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego żądanie wypłaty złożone w bloku N może dotrzeć do warstwy konsensusu dopiero w późniejszym bloku?",
      options: [
        "Żądania czekają na finalność, zanim odczyta je wywołanie systemowe",
        "Kontrakt systemowy zwalnia najwyżej 16 żądań na blok",
        "Kontrakt depozytowy musi przetworzyć własne logi w bloku N",
        "Klienci konsensusu czytają kontrakt żądań raz na epokę"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Przed złożeniem żądania wypłaty potrzebna jest opłata, którą kontrakt pobiera w tej chwili. Które wywołanie ją zwraca?",
      options: [
        "eth_estimateGas dla żądania z wartością ustawioną na zero",
        "eth_feeHistory z adresem kontraktu jako filtrem",
        "eth_getStorageAt na slocie opłaty kontraktu przy pending",
        "eth_call do kontraktu żądań z pustymi danymi wejściowymi"
      ],
      answer: 3
    }
  ],
  "proxy-contract": [
    {
      kind: "scenario",
      question: "Funkcja balanceOf proxy zostaje wywołana przez eth_call w bloku sprzed dwóch lat. Czyj kod się wykonuje?",
      options: [
        "Kod implementacji, na którą proxy wskazuje w bieżącym head",
        "Kod implementacji zapisanej w slocie proxy w tamtym bloku",
        "Tylko kod przekazujący proxy, bez wykonania żadnej logiki",
        "Kod implementacji, którą wdrożono dla tego proxy jako pierwszą"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym klon EIP-1167 różni się od proxy EIP-1967 z możliwością aktualizacji?",
      options: [
        "Jego cel jest wbudowany w kod i nigdy nie może się zmienić",
        "Używa CALL zamiast DELEGATECALL, więc nie trzyma stanu",
        "Trzyma swój cel w slocie beacona, a nie w kodzie",
        "Może go zaktualizować tylko konto, które go wdrożyło"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co zwraca eth_getStorageAt dla slotu implementacji EIP-1967 w FiatTokenProxy od USDC?",
      options: [
        "Adres obecnie używanej implementacji FiatToken",
        "Adres admina, bo proxy powstało przed rozdzieleniem slotów",
        "Zero, bo to proxy używa starszego slotu ZeppelinOS",
        "Błąd, bo protokół rezerwuje ten numer slotu"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Indekser dekoduje eventy proxy za pomocą ABI pobranego dzisiaj. Co idzie źle dla bloków sprzed aktualizacji, która zmieniła nazwę eventu?",
      options: [
        "Węzeł przepisuje stare logi, żeby pasowały do nowej sygnatury eventu",
        "eth_getLogs odrzuca każde zapytanie obejmujące blok aktualizacji",
        "Nic, bo topics są ustalone przez adres proxy",
        "Stare logi nie pasują albo nie dekodują się według nowego ABI"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Trace jednego zwykłego wywołania proxy z możliwością aktualizacji pokazuje dwie ramki. Czym jest druga ramka?",
      options: [
        "STATICCALL z proxy, który odczytuje slot admina",
        "CALL z implementacji z powrotem do proxy",
        "DELEGATECALL z proxy do implementacji",
        "CREATE, który na żądanie wdraża implementację"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego aktualizacja proxy UUPS do implementacji, która nie ma funkcji aktualizacji, zamraża to proxy?",
      options: [
        "W UUPS kod aktualizacji znajduje się w samej implementacji",
        "Proxy kasuje swój slot admina przy każdej aktualizacji",
        "Slot EIP-1967 staje się tylko do odczytu po pierwszym zapisie",
        "Beacony, które na nie wskazują, przestają odpowiadać na implementation()"
      ],
      answer: 0
    }
  ],
  "transaction-lifecycle": [
    {
      kind: "detail",
      question: "Co oznacza udana odpowiedź na eth_sendRawTransaction?",
      options: [
        "Że transakcja dotarła do każdego publicznego mempoola",
        "Że mempool jednego węzła przyjął podpisane bajty",
        "Że transakcja wykona się bez revertu",
        "Że builder ustawił ją w kolejce do następnego bloku"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Serwis płatności identyfikuje każdą płatność hashem transakcji i podnosi opłatę transakcjom, które utknęły. Co idzie nie tak?",
      options: [
        "Podwyżka zachowuje hash, więc mempool odrzuca ją jako znaną",
        "Węzeł odmawia zastąpienia transakcji, której sam nie podpisał",
        "Podwyżka zmienia hash, więc rekord traci transakcję z oczu",
        "Receipt podwyżki trafia pod pierwotny hash transakcji"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Na tym samym węźle transakcja z nonce 12 nie ma receiptu, a eth_getTransactionCount przy latest zwraca dla nadawcy 13. Jaki z tego wniosek?",
      options: [
        "Jest włączona, a jej receipt jest jeszcze indeksowany",
        "Wciąż jest pending i trafi do bloku jako następna z nonce 13",
        "Węzeł ją wyrzucił, więc ponowne rozgłoszenie bajtów zadziała",
        "Inna transakcja użyła nonce 12, więc ta nigdy nie trafi do bloku"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Zarówno po zastąpieniu, jak i po wyrzuceniu transakcji eth_getTransactionByHash zwraca null. Co odróżnia te przypadki?",
      options: [
        "Przy zastąpieniu nonce zajął inny hash; wyrzucenie zostawia go wolnym",
        "Zastąpienie zwraca kod błędu, a wyrzucenie zwykłe null",
        "Przy wyrzuceniu nonce zajął inny hash; zastąpienie zostawia go wolnym",
        "Tylko zastąpiona transakcja pojawia się w newPendingTransactions"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Receipt zapisany w bloku N zwraca teraz null, a N jest powyżej bloku finalized. Co najprawdopodobniej się stało?",
      options: [
        "Węzeł usunął receipt pruningiem, bo nie jest jeszcze ostateczny",
        "Reorg usunął blok, a transakcja może wrócić",
        "Transakcję zastąpiono po tym, jak trafiła do bloku",
        "Receipt przeniósł się do indeksu transakcji bloku N+1"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego transakcja wyrzucona przez węzeł to nie to samo co anulowana?",
      options: [
        "Wyrzucone transakcje czekają przez dobę w osobnym mempoolu",
        "Węzły po restarcie ponownie rozgłaszają każdą wyrzuconą transakcję",
        "Jej opłata wraca dopiero, gdy anulowanie trafi do bloku",
        "Jest ważna do użycia nonce, więc jej kopia może jeszcze wejść"
      ],
      answer: 3
    }
  ],
  "system-contracts": [
    {
      kind: "scenario",
      question: "Indekser, który odtwarza storage z diffów stanu poszczególnych transakcji, widzi, że sloty kontraktu historii z EIP-2935 zmieniają się w każdym bloku, choć nie dotyka ich żadna transakcja. Co to wyjaśnia?",
      options: [
        "Ukryta transakcja depozytowa typu 0x7e aktualizuje kontrakt pod indeksem zero",
        "Klient po każdym bloku zapisuje wyniki opcode'u BLOCKHASH w storage",
        "Wywołanie systemowe zapisuje tam hash rodzica przed transakcjami",
        "Walidatorzy wysyłają podpisaną aktualizację, której trace bloków nie pokazują"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jakie wejście przyjmuje udany odczyt z kontraktu beacon roots z EIP-4788?",
      options: [
        "32-bajtowy timestamp bloku wykonawczego, który niósł ten root",
        "32-bajtowy numer slotu bloku beacon, którego root jest potrzebny",
        "32-bajtowy numer bloku wykonawczego, którego root rodzica jest potrzebny",
        "32-bajtowy root bloku beacon, którego obecność trzeba sprawdzić"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym zapis do L1Block w łańcuchu OP Stack, wykonywany w każdym bloku, różni się od takiego samego zapisu do kontraktu beacon roots na L1?",
      options: [
        "Wykonuje się po ostatniej transakcji, a nie przed pierwszą",
        "To wywołanie precompile'a, które nie zostawia nic w storage",
        "Jest pomijany w blokach, które nie mają żadnych transakcji użytkowników",
        "To transakcja depozytowa z własnym hashem i receiptem"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Programista symuluje odczyt kontraktu beacon roots przez eth_call i ustawia from na adres systemowy. Co wraca?",
      options: [
        "Revert, bo wywołanie systemowe potrzebuje limitu 30 milionów gasu",
        "Puste dane, bo kontrakt zamiast tego idzie ścieżką zapisu",
        "Błąd, bo węzły odrzucają wywołania od tego nadawcy",
        "Root, razem z zapisami do storage, które wykonałoby to wywołanie"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego kontrakt z EIP-2935 zwraca hashe sprzed 8191 bloków, a opcode BLOCKHASH kończy na 256?",
      options: [
        "Opcode czyta bufor beacon roots, który jest szybciej czyszczony",
        "Kontrakt dowodzi starych hashy z nagłówków wysłanych w calldata",
        "Okno opcode'u zmalało, gdy EIP-2935 przeniosło hashe do stanu",
        "Kontrakt trzyma hashe w stanie, a opcode się nie zmienił"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Co pozwala eth_getProof udowodnić wartości przechowywane przez kontrakt systemowy, czego nie potrafi zrobić dla precompile'a?",
      options: [
        "Wyniki kontraktu systemowego są kopiowane do trie receiptów",
        "Kontrakt systemowy to bytecode, którego storage jest w stanie",
        "Adres systemowy w każdym bloku podpisuje kontrakt na nowo",
        "Kontrakt systemowy odpowiada tylko na wywołania z transakcji"
      ],
      answer: 1
    }
  ]
};
