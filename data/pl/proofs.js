// Polish text for the Proofs & verification lessons, keyed by topic id. Only the words: ids, link
// targets, code, related topics, and sources come from data/proofs.js.
export const topics = {
  "state-proof": {
    title: "Dowód stanu",
    aliases: ["state proof", "dowód Merkle", "merkle proof", "eth_getProof", "EIP-1186", "dowód salda", "weryfikacja odpowiedzi RPC"],
    summary: "Dowód stanu to zestaw [[merkle-patricia-trie|trie node'ów]], który pozwala wywołującemu odtworzyć [[state-root|state root]] z wartości konta albo storage. Dzięki temu odpowiedź RPC można sprawdzić względem [[block-header|nagłówka]], któremu wywołujący już ufa, zamiast po prostu w nią wierzyć.",
    sections: [
      {
        heading: "Jaki problem rozwiązuje",
        paragraphs: [
          "[[eth-get-balance|eth_getBalance]] zwraca liczbę i nic więcej. Jeśli operator węzła kłamie, uruchamia zmodyfikowane oprogramowanie albo po prostu serwuje nieaktualną gałąź, odpowiedź wygląda dokładnie tak samo jak poprawna. Dowód stanu zmienia to, czemu trzeba ufać: zamiast operatorowi ufa się jednemu nagłówkowi i odporności [[keccak-256|keccak-256]] na kolizje, a resztę weryfikuje się samodzielnie.",
          "Warto to robić zawsze, gdy odpowiedź uruchamia coś nieodwracalnego, a węzeł jest cudzy: bridge wypłacający środki, [[light-client|lekki klient]] w przeglądarce, aplikacja czytająca dane przez [[rpc-provider|providera]], z którym nic jej nie łączy. Nie warto tego robić dla salda wyświetlanego obok przycisku odświeżania."
        ]
      },
      {
        heading: "Co zwraca eth_getProof",
        paragraphs: [
          "[[eth-get-proof|eth_getProof]], zdefiniowane w [[eip|EIP-1186]], przyjmuje [[address|adres]], tablicę 32-bajtowych kluczy storage i [[block-tag|identyfikator bloku]]. Wynik zawiera cztery pola konta – `balance`, `nonce`, `codeHash`, `storageHash` – oraz `accountProof`, czyli tablicę trie node'ów zakodowanych w [[rlp|RLP]] od state root w dół do liścia tego konta, i `storageProof` z jednym wpisem na każdy żądany klucz, w którym są `key`, `value` i własny `proof`.",
          "Cztery wartości pól podano dla wygody: zweryfikowany dowód i tak wymusza, jakie muszą być. `storageHash` to korzeń własnego trie storage tego konta i punkt, w którym łączą się obie połowy weryfikacji. Pusta tablica kluczy jest dozwolona i wtedy dowód dotyczy samego konta."
        ]
      },
      {
        heading: "Weryfikacja krok po kroku",
        paragraphs: [
          "Najpierw trzeba zdobyć [[trusted-header|zaufany nagłówek]] bloku, o który pytano, i wziąć z niego `stateRoot`. Jeśli ta wartość przyszła w tej samej odpowiedzi co dowód, żaden z dalszych kroków nic nie daje. Po drugie, trzeba zahashować adres: kluczem trie jest `keccak256(address)` z 20 surowych bajtów, a jego 64 nibble'e (połówki bajtu) tworzą ścieżkę. Po trzecie, przechodzi się `accountProof` od korzenia: hash każdego node'a musi być równy referencji, którą trzymał jego rodzic, przy czym pierwszą referencją jest `stateRoot`, a każdy krok zużywa nibble'e. Ostatni liść dekoduje się do `RLP([nonce, balance, storageRoot, codeHash])`, a `storageRoot` musi być równy otrzymanemu `storageHash`; zobacz [[account-proof|dowód konta]].",
          "Po czwarte, dla każdego wpisu storage hashuje się w ten sam sposób 32-bajtowy klucz slotu i przechodzi `storageProof[i].proof` od zweryfikowanego `storageHash` do liścia, którego wartość po zdekodowaniu z RLP musi być równa `value`; zobacz [[storage-proof|dowód storage]]. Dopiero gdy oba przejścia się powiodą, czegoś się dowiadujemy, i jest to dokładnie to: w bloku opisanym tym nagłówkiem to konto miało te pola, a ten slot zawierał tę wartość."
        ]
      },
      {
        heading: "Czego dowód nie potwierdza",
        paragraphs: [
          "Nie dowodzi kanoniczności. Spójny nagłówek ze spójnym dowodem można wytworzyć dla gałęzi, która przegrała, albo dla łańcucha, który nigdy nie istniał; ustalenie, że nagłówek należy do kanonicznego łańcucha, to osobne zadanie dla [[consensus-proof|dowodu konsensusu]] albo własnego węzła. Nie dowodzi też aktualności: całkowicie poprawny dowód względem nagłówka sprzed dwóch lat mówi tylko o tym, co było prawdą wtedy.",
          "Nie obejmuje też wszystkiego. Logi, receipty i transakcje nie są w trie stanu i potrzebują [[receipt-proof|dowodu receiptu]]. `codeHash` jest commitmentem do bytecode'u, ale nie jest bytecode'em, więc weryfikacja [[eth-get-code|eth_getCode]] polega na zahashowaniu tego, co przyszło, i porównaniu wyniku. I nic w dowodzie stanu nie mówi, że przejście stanu było poprawne; do tego trzeba wykonać blok albo zaufać tym, którzy to zrobili."
        ]
      }
    ],
    example: {
      title: "eth_getProof dla jednego konta i jednego slotu",
      note: "`accountProof` musi prowadzić hashami z powrotem do `stateRoot` zaufanego nagłówka, a `storageProof[0].proof` do `storageHash` zapisanego w samym liściu konta."
    },
    pitfalls: [
      "Weryfikowanie dowodu względem `stateRoot` odczytanego z tej samej niezaufanej odpowiedzi; takie sprawdzenie dowodzi tylko, że odpowiadający jest wewnętrznie spójny.",
      "Dowodzenie względem `latest` i cache'owanie wyniku; dowód pozostaje matematycznie poprawny, a opisana przez niego wartość już się zmieniła.",
      "Używanie adresu albo numeru slotu jako klucza trie zamiast jego hasha keccak-256, przez co przechodzi się ścieżką, która nie istnieje.",
      "Zakładanie, że każdy endpoint udowodni stare bloki; historyczne `eth_getProof` wymaga zachowanych trie node'ów, których wiele [[archive-node|węzłów archiwalnych]] nie trzyma."
    ]
  },
  "merkle-patricia-trie": {
    title: "Merkle-Patricia Trie",
    aliases: ["MPT", "patricia trie", "hexary trie", "branch node", "extension node", "leaf node", "liść", "secure trie"],
    summary: "Merkle-Patricia Trie to drzewo radix Ethereum, w którym node'y rozgałęziają się na szesnaście: branch node'y, extension node'y i liście zakodowane w [[rlp|RLP]] wskazują na siebie przez hashe [[keccak-256|keccak-256]], więc jeden 32-bajtowy korzeń jest commitmentem do każdego klucza i każdej wartości zapisanych pod nim.",
    sections: [
      {
        heading: "Trzy rodzaje node'ów",
        paragraphs: [
          "Branch node to lista RLP z 17 elementów: szesnaście referencji, po jednej na każdy możliwy nibble (połówkę bajtu, czyli jedną cyfrę hex), plus pole wartości, używane wtedy, gdy klucz kończy się dokładnie w tym miejscu. Extension node to dwuelementowa lista ze wspólnym fragmentem ścieżki i jedną referencją; zwija długi odcinek bez rozgałęzień do jednego node'a. Leaf node (liść) też ma dwa elementy: pozostałą część ścieżki i wartość. Zwięzłe [[hex-prefix-encoding|kodowanie hex-prefix]] zapisuje w pierwszym nibble'u ścieżki znacznik, dzięki któremu weryfikator odróżnia liść od extension node'a i wie, czy liczba nibble'i jest nieparzysta.",
          "Referencja to hash keccak-256 kodowania RLP dziecka – chyba że to kodowanie jest krótsze niż 32 bajty; wtedy node jest wstawiany dosłownie (inline) do rodzica. Weryfikator, który traktuje każdą referencję jako hash, zawodzi na małych trie i płytkich poddrzewach, więc kod sprawdzający dowody musi obsługiwać obie formy."
        ]
      },
      {
        heading: "Cztery trie",
        paragraphs: [
          "Trie stanu mapuje `keccak256(address)` na `RLP([nonce, balance, storageRoot, codeHash])`, a jego korzeń to `stateRoot` w [[block-header|nagłówku]]. Każdy kontrakt ma własny trie storage, który mapuje `keccak256(slotKey)` na RLP wartości slotu bez wiodących zerowych bajtów; jego korzeń to `storageRoot` w liściu konta. Hashowanie kluczy – czyli konstrukcja „secure trie” – utrzymuje drzewo w równowadze i nie pozwala atakującemu tak dobrać [[address|adresów]], żeby jedna gałąź stała się patologicznie głęboka.",
          "Trie transakcji i trie receiptów to coś innego. Buduje się je od nowa dla każdego [[block|bloku]], ich kluczem jest kodowanie RLP indeksu, a nie hash, a ich korzenie to `transactionsRoot` i `receiptsRoot`. Ponieważ klucze to małe, kolejne liczby całkowite, drzewa są płytkie; zobacz [[receipt-proof|dowody receiptów]]. [[consensus-layer|Warstwa konsensusu]] w ogóle nie używa tej struktury – merkleizuje dane przez [[ssz|SSZ]] i SHA-256."
        ]
      },
      {
        heading: "Dlaczego dowody wynikają z tej struktury",
        paragraphs: [
          "Dowód to sekwencja node'ów wzdłuż jednej ścieżki, zaczynając od korzenia. Weryfikator startuje od korzenia, któremu ufa, i dla każdego node'a sprawdza, czy jego hash keccak-256 jest równy referencji, którą trzymał poprzedni node, dekoduje go i zużywa nibble'e, które ten node obejmuje. Jeśli cała ścieżka została zużyta i liść pasuje, wartość jest udowodniona i nic więcej nie trzeba. Sfałszowanie dowodu wymagałoby kolizji keccak-256.",
          "To samo przejście dowodzi braku. Gdy ścieżka prowadzi do branch node'a, w którym pole dziecka dla następnego nibble'a jest puste, albo do node'a, którego zapisana ścieżka rozchodzi się z kluczem, można udowodnić, że klucza nie ma w trie pod tym korzeniem. Tak [[eth-get-proof|eth_getProof]] odpowiada dla konta, którego nikt nigdy nie dotknął, i dlatego „pusty” wynik to prawdziwa odpowiedź, a nie brak odpowiedzi."
        ]
      },
      {
        heading: "Koszt tego kształtu",
        paragraphs: [
          "Rozgałęzienie na szesnaście utrzymuje drzewo płytkim – od siedmiu do dziewięciu poziomów dla losowego konta – ale każdy branch node niesie szesnaście 32-bajtowych referencji, więc każdy dowód ciągnie za sobą dużo danych o sąsiednich gałęziach. Każdy poziom to losowy odczyt po hashu, dlatego [[client-storage|silniki przechowywania danych w klientach]] przeszły na układy płaskie i oparte na ścieżkach (path-based), które zwracają wartość bez dotykania trie, i dlatego niektóre węzły obsłużą [[eth-get-balance|eth_getBalance]] dla starego bloku, ale już nie `eth_getProof`. Z tego samego powodu [[witness|witnessy]] dla [[stateless-ethereum|wykonania stateless]] są w tej strukturze za duże."
        ]
      }
    ],
    example: {
      title: "Przejście ścieżki jednego konta od state root",
      note: "Dowód to dokładnie ta lista node'ów; weryfikator nie potrzebuje z łańcucha niczego poza korzeniem, od którego zaczął."
    },
    pitfalls: [
      "Używanie surowego 20-bajtowego adresu jako klucza trie; kluczem w trie stanu i trie storage jest hash keccak-256 adresu albo slotu.",
      "Zakładanie, że każda referencja do dziecka to 32-bajtowy hash; node'y, których kodowanie RLP ma mniej niż 32 bajty, są osadzane w rodzicu.",
      "Stosowanie tej struktury do danych konsensusu, które są merkleizowane przez SSZ i SHA-256, a nie przez RLP i keccak-256.",
      "Oczekiwanie, że trie transakcji i receiptów da się później odpytać; są budowane od nowa dla każdego bloku i żadna standardowa metoda RPC nie zwraca ich node'ów."
    ]
  },
  "account-proof": {
    title: "Dowód konta",
    aliases: ["accountProof", "account proof", "udowodnienie konta", "liść konta", "puste konto"],
    summary: "Dowód konta to tablica `accountProof` z [[eth-get-proof|eth_getProof]]: zakodowane w [[rlp|RLP]] [[merkle-patricia-trie|trie node'y]] od [[state-root|state root]] do liścia konta, którego wartość dekoduje się do `RLP([nonce, balance, storageRoot, codeHash])`.",
    sections: [
      {
        heading: "Ścieżka i liść",
        paragraphs: [
          "Kluczem jest `keccak256(address)` z 20 surowych bajtów [[address|adresu]] – a nie hash tekstu adresu z sumą kontrolną (checksum) ani sam adres. Ten 32-bajtowy hash to 64 nibble'e hex (połówki bajtu), a node'y w `accountProof` są uporządkowane od korzenia i każdy zużywa część z nich. Liść na końcu przechowuje cztery pola konta w stałej kolejności: `nonce`, `balance`, `storageRoot`, `codeHash`.",
          "[[eth-get-proof|eth_getProof]] zwraca te cztery pola także na najwyższym poziomie odpowiedzi jako `nonce`, `balance`, `storageHash` i `codeHash`, co jest wygodne, ale niezweryfikowane. Dowód ma je wymusić: po udanym przejściu `storageRoot` z liścia musi być równy zwróconemu `storageHash`, a `codeHash` z liścia zwróconemu `codeHash`. W przeciwnym razie odpowiedź jest niespójna i odrzuca się ją w całości."
        ]
      },
      {
        heading: "Przejście",
        paragraphs: [
          "Zaczyna się od `stateRoot` wziętego z [[trusted-header|zaufanego nagłówka]]. Dla każdego kolejnego node'a sprawdza się, czy jego hash [[keccak-256|keccak-256]] jest równy oczekiwanej referencji, dekoduje się go i idzie dalej: branch node z 17 elementami daje dziecko dla następnego nibble'a, a node dwuelementowy daje swoją jedyną referencję po zużyciu zapisanego w nim fragmentu ścieżki. Gdy nibble'e skończą się na liściu, którego zapisana reszta ścieżki pasuje, wartość liścia to konto.",
          "Na dwóch szczegółach wykładają się pierwsze implementacje. Node'y, których kodowanie RLP jest krótsze niż 32 bajty, są osadzone w rodzicu, a nie wskazywane przez hash, więc dla nich trzeba pominąć sprawdzenie hasha. Ponadto pozostałą ścieżkę liścia trzeba porównać z niezużytymi nibble'ami klucza; weryfikator, który zatrzymuje się, gdy tylko zobaczy liść, zaakceptuje dowód dla sąsiedniego konta."
        ]
      },
      {
        heading: "Dowodzenie, że konto nie istnieje",
        paragraphs: [
          "Większości [[address|adresów]] nikt nigdy nie dotknął i takie adresy w ogóle nie mają liścia w trie stanu. Dowód dla takiego adresu i tak się weryfikuje: przejście kończy się branch node'em z pustym polem albo node'em, którego ścieżka rozchodzi się z kluczem, co dowodzi, że pod tym korzeniem klucza nie ma. [[eth-get-proof|eth_getProof]] zgłasza wtedy `nonce` i `balance` jako `0x0`, ale klienci różnią się co do hashy: [[geth|Geth]], [[nethermind|Nethermind]] i [[erigon|Erigon]] zwracają zerowe hashe, a [[besu|Besu]] i [[reth|Reth]] zwracają `0xc5d24601…a470`, czyli keccak pustych bajtów, i `0x56e81f17…b421`, czyli korzeń pustego trie – dokładnie to, co zwraca każde istniejące konto bez kodu i storage. Brak pokazuje tylko dowód.",
          "[[exclusion-proof|Dowody nieistnienia]] pozwalają bridge'owi albo [[light-client|lekkiemu klientowi]] powiedzieć „ta wiadomość nigdy nie została zarejestrowana”, a nie „węzeł nie odpowiedział”. Dlatego też przejście `accountProof`, które nie znajduje konta, trzeba traktować jako udany wynik, a nie jako ścieżkę błędu."
        ]
      }
    ],
    example: {
      title: "Weryfikacja accountProof względem zaufanego stateRoot",
      note: "Wersja uproszczona: produkcyjny weryfikator odróżnia też liście od extension node'ów po ich [[hex-prefix-encoding|fladze hex-prefix]] i obsługuje ścieżkę, która kończy się w polu wartości branch node'a."
    },
    pitfalls: [
      "Hashowanie tekstu adresu z sumą kontrolną zamiast 20 surowych bajtów, co daje ścieżkę, która w trie donikąd nie prowadzi.",
      "Ufanie `balance` i `nonce` z najwyższego poziomu odpowiedzi bez porównania ich z wartościami zdekodowanymi z udowodnionego liścia.",
      "Traktowanie dowodu nieistnienia jak nieudanego żądania; konto, którego nikt nie dotknął, po prostu nie ma liścia, a przejście i tak się weryfikuje.",
      "Pomijanie porównania pozostałej ścieżki liścia z kluczem, przez co przechodzi dowód dla innego konta."
    ]
  },
  "storage-proof": {
    title: "Dowód storage",
    aliases: ["storageProof", "storage proof", "dowód slotu", "slot proof", "dowód mappingu", "storageHash"],
    summary: "Dowód storage to jeden wpis tablicy `storageProof` z [[eth-get-proof|eth_getProof]]: `key` slotu, jego `value` i [[merkle-patricia-trie|trie node'y]] prowadzące od `storageHash` danego konta w dół do liścia slotu.",
    sections: [
      {
        heading: "Dwa hashe, nie jeden",
        paragraphs: [
          "Każdy kontrakt ma własny trie storage, którego korzeniem jest `storageHash` w liściu jego konta. O slot pyta się po jego 32-bajtowym numerze, ale ścieżka w trie to hash [[keccak-256|keccak-256]] tych 32 bajtów. To drugi hash i łatwo go przeoczyć, bo zarówno żądanie, jak i odpowiedź pokazują w `key` niezahashowany numer slotu.",
          "Pierwszy hash pojawia się wcześniej, gdy trzeba obliczyć sam numer slotu. Wpis mappingu w Solidity leży pod `keccak256(paddedKey . paddedSlot)`, element tablicy pod `keccak256(slot) + index`, a zwykła zmienna pod indeksem swojej deklaracji; zobacz [[contract-storage|układ storage kontraktu]]. Udowodnienie salda jednego tokena wymaga więc jednego hasha, żeby znaleźć slot, i drugiego, żeby znaleźć jego ścieżkę. Pomylenie ich daje żądanie dowodu, który poprawnie się weryfikuje, ale dotyczy czegoś innego."
        ]
      },
      {
        heading: "Wartości i puste sloty",
        paragraphs: [
          "Wartość w liściu to kodowanie [[rlp|RLP]] zawartości slotu jako liczby big-endian bez wiodących zerowych bajtów, więc slot zawierający jedynkę jest zapisany jako `0x01`, a nie jako 32 bajty. Weryfikator, który porównuje surowe 32-bajtowe słowa ze zdekodowanym liściem, wykaże niezgodność prawie przy każdym niezerowym slocie.",
          "Slot, do którego nigdy nic nie zapisano, nie ma liścia; nie ma go też slot, który zapisano, a potem wyzerowano – [[evm|EVM]] usuwa wtedy wpis i dlatego wyzerowanie slotu daje zwrot [[gas|gasu]]. `eth_getProof` zwraca w obu przypadkach `value` `0x0` z dowodem nieistnienia, a z punktu widzenia trie tych dwóch przypadków naprawdę nie da się odróżnić. Jeśli aplikacja musi odróżniać „nigdy nie ustawiony” od „ustawiony na zero”, to rozróżnienie trzeba zapisać w osobnej fladze w kontrakcie."
        ]
      },
      {
        heading: "Weryfikacja i zastosowania",
        paragraphs: [
          "Kolejność ma znaczenie: najpierw weryfikuje się [[account-proof|dowód konta]] względem [[state-root|state root]] z [[trusted-header|zaufanego nagłówka]], potem bierze się `storageHash` z udowodnionego liścia i dopiero wtedy przechodzi się node'y storage. Zaczynanie od pola `storageHash` z odpowiedzi pomija jedyny krok, który wiązał trie storage z łańcuchem.",
          "To podstawowe narzędzie systemów cross-chain. Kanoniczny [[bridge|bridge]] udowadnia, że wiadomość o wypłacie została zapisana w storage kontraktu bridge'a w drugim łańcuchu; oracle udowadnia opublikowaną przez siebie cenę; [[governance-voting-power|system governance]] udowadnia saldo tokenów w minionym bloku. W każdym z tych przypadków slot storage jest publicznym commitmentem kontraktu, a dowód pozwala weryfikatorowi działać na jego podstawie bez uruchamiania węzła łańcucha źródłowego."
        ]
      }
    ],
    example: {
      title: "Dowód jednego slotu salda ERC-20",
      note: "`key` to numer slotu, o który pytano; ścieżka faktycznie przechodzona przez node'y to `keccak256(key)`, a przejście musi zaczynać się od `storageHash`, który udowodniono, a nie od takiego, który po prostu podano."
    },
    pitfalls: [
      "Przekazywanie klucza mappingu, na przykład adresu posiadacza, jako klucza storage zamiast obliczonego numeru slotu `keccak256(paddedKey . paddedSlot)`.",
      "Oczekiwanie, że ścieżką w trie jest sam numer slotu; ścieżka to hash keccak-256 tej 32-bajtowej liczby.",
      "Porównywanie dopełnionego 32-bajtowego słowa z liściem, którego wartość to RLP bez wiodących zerowych bajtów.",
      "Odczytywanie `value` z odpowiedzi bez przejścia przez `proof`, co oznacza ufanie węzłowi dokładnie w takim stopniu jak przy [[eth-get-storage-at|eth_getStorageAt]]."
    ]
  },
  "inclusion-proof": {
    title: "Dowód włączenia (inclusion proof)",
    aliases: [
      "inclusion proof",
      "dowód Merkle",
      "merkle proof",
      "membership proof",
      "dowód przynależności",
      "gałąź Merkle",
      "merkle branch"
    ],
    summary: "Dowód włączenia to krótki zestaw hashy, który pozwala weryfikatorowi odtworzyć korzeń commitmentu z jednego elementu i w ten sposób udowodnić przynależność do zbioru bez posiadania całego zbioru. Ethereum po stronie wykonawczej używa ścieżek trie node'ów z [[merkle-patricia-trie|Merkle-Patricia Trie]], a po stronie konsensusu gałęzi Merkle [[ssz|SSZ]].",
    sections: [
      {
        heading: "Ogólny kształt",
        paragraphs: [
          "Każdy dowód włączenia ma te same trzy części: korzeń, któremu weryfikator już ufa, element zbioru i dokładnie tyle danych o sąsiednich node'ach (siblings), ile trzeba, żeby z tego elementu odtworzyć korzeń. Weryfikator powtarza, poziom po poziomie, hashowanie, które według provera zostało wykonane, i porównuje wynik z korzeniem. Rozmiar dowodu rośnie logarytmicznie z wielkością zbioru i właśnie o to chodzi: weryfikator, który ma 32 bajty, może sprawdzić przynależność do zbioru liczącego miliony elementów.",
          "Założeniem bezpieczeństwa jest odporność funkcji hashującej na kolizje i nic więcej. To założenie wyznacza też granice tego, co dowód stwierdza: mówi, że element leży pod tym korzeniem, i nie mówi nic o tym, czy to właściwy korzeń, kiedy powstał ani czy dane objęte tym commitmentem mają jakikolwiek sens."
        ]
      },
      {
        heading: "Dwie rodziny w Ethereum",
        paragraphs: [
          "Dowody warstwy wykonawczej to ścieżki trie node'ów [[merkle-patricia-trie|Merkle-Patricia]]: całe node'y zakodowane w [[rlp|RLP]] i hashowane funkcją [[keccak-256|keccak-256]], przy czym klucze są hashowane przed użyciem. Branch node ma szesnaście referencji, więc dowód niesie znacznie więcej danych o sąsiadach, niż niósłby w drzewie binarnym; [[account-proof|dowód konta]] z siedmioma poziomami ma kilka kilobajtów. To właśnie zwraca [[eth-get-proof|eth_getProof]].",
          "Dowody warstwy konsensusu to gałęzie Merkle SSZ: stałe drzewo binarne nad stałym układem danych, hashowane funkcją SHA-256. Dowód to płaska lista 32-bajtowych sąsiadów plus [[generalized-index|generalized index]], który wskazuje pozycję liścia. To indeks mówi weryfikatorowi, po której stronie stoi każdy sąsiad, i jest stały tylko w obrębie jednego forka, bo specyfikacja ustala układ osobno dla każdego forka: w forku Electra korzeń sfinalizowanego checkpointu w stanie beacon przesunął się z indeksu 105 na 169, a Gloas z Glamsterdam ma go przesunąć ponownie, na 735. Tej formy używają aktualizacje [[light-client|lekkiego klienta]] i dowody z [[beacon-api|Beacon API]]; opisuje to temat [[consensus-proof|dowód konsensusu]]."
        ]
      },
      {
        heading: "Obecność, nieobecność i ograniczenia",
        paragraphs: [
          "Ta sama ścieżka node'ów dowodzi też nieobecności. Przejście przez trie, które trafia na pustą pozycję branch node'a albo na node o rozbieżnej ścieżce, jest [[exclusion-proof|dowodem nieistnienia]] (exclusion proof) i weryfikuje się je dokładnie tak jak dowód włączenia. W drzewie SSZ o stałym układzie nie ma nieobecności do udowodnienia: każde pole istnieje, więc odpowiednikiem jest stwierdzenie, że pole ma konkretną wartość, na przykład zero.",
          "Żaden dowód włączenia nie daje kontekstu. Przynależność do trie [[block|bloku]] nie czyni bloku kanonicznym, nie mówi, jak jest stary, i nie porządkuje dwóch elementów względem niczego spoza drzewa. Do tego potrzebny jest [[trusted-header|zaufany nagłówek]], a za nim dowody z warstwy konsensusu."
        ]
      }
    ],
    example: {
      title: "Weryfikacja gałęzi Merkle SSZ według generalized index",
      note: "Dowód z warstwy wykonawczej wygląda inaczej: całe node'y RLP zamiast samych sąsiadów, keccak-256 zamiast SHA-256 i klucz, który zahashowano, zanim zaczęło się przejście."
    },
    pitfalls: [
      "Sprawdzanie dowodu względem korzenia podanego w tej samej odpowiedzi, co dowodzi tylko tego, że odpowiadający był wewnętrznie spójny.",
      "Używanie keccak-256 w dowodach SSZ; merkleizacja w konsensusie używa SHA-256, a pomylenie ich kończy się po cichu niezgodnością hashy.",
      "Traktowanie dowodu Merkle-Patricia jak listy hashy sąsiadów; to lista kompletnych node'ów zakodowanych w RLP, a każdy z nich trzeba zdekodować.",
      "Wniosek, że udowodniona transakcja albo udowodniony receipt są sfinalizowane; włączenie pod korzeniem nic nie mówi o tym, czy ten blok jest kanoniczny."
    ]
  },
  "receipt-proof": {
    title: "Dowody transakcji i receiptów",
    aliases: ["receiptsRoot", "transactionsRoot", "receipt proof", "dowód receiptu", "dowód logu", "udowodnić log", "dowód dla bridge'a"],
    summary: "Dowód transakcji albo receiptu pokazuje, że konkretna [[transaction|transakcja]] albo konkretny [[transaction-receipt|receipt]] leży pod danym indeksem w bloku. Robi to przez przejście ścieżki w [[merkle-patricia-trie|trie]] budowanym osobno dla każdego bloku: jego korzeniem jest `transactionsRoot` albo `receiptsRoot` z [[block-header|nagłówka]], a kluczem kodowanie [[rlp|RLP]] tego indeksu.",
    sections: [
      {
        heading: "Dwa trie, które działają inaczej",
        paragraphs: [
          "W odróżnieniu od trie stanu te dwa buduje się od zera dla każdego [[block|bloku]], a potem wyrzuca. Kluczami są kodowania RLP indeksu pozycji: indeks 0 to pojedynczy bajt `0x80`, indeks 1 to `0x01`, więc klucze są krótkie, kolejne i niehashowane. Wartościami są w trie transakcji surowe bajty transakcji, a w trie receiptów zakodowany receipt. Dla wszystkiego poza transakcjami legacy, czyli dla [[transaction-types|transakcji typowanych]], wartością jest bajt typu, a po nim RLP obiektu, zgodnie z EIP-2718.",
          "Wpisów jest tylko kilkaset, a klucze nie są hashowane, więc te dowody są małe: do dowolnego indeksu prowadzi kilka trie node'ów. To, czego dowodzą, jest wąskie, ale przydatne: że pod tą pozycją nagłówek zawiera commitment do dokładnie tej transakcji albo dokładnie tego receiptu, z dokładnie tymi logami."
        ]
      },
      {
        heading: "Jedyna kryptograficzna droga od logu do nagłówka",
        paragraphs: [
          "[[event-log|Log eventu]] istnieje tylko wewnątrz receiptu i nigdzie indziej. Nie ma go w trie [[state|stanu]], więc [[eth-get-proof|eth_getProof]] go nie obejmie, a `logsBloom` to probabilistyczny filtr, który daje fałszywe trafienia (false positives), a nie dowód. Jedyny sposób, żeby kryptograficznie udowodnić log, to udowodnić jego receipt względem `receiptsRoot`, a potem odczytać log z udowodnionego receiptu.",
          "Dokładnie tak działają kanoniczne [[bridge|bridge'e]] i protokoły przesyłania wiadomości między łańcuchami. Kontrakt w łańcuchu źródłowym emituje wiadomość jako event, a strona docelowa weryfikuje dowód receiptu względem nagłówka, którego kanoniczność już ustaliła, i dopiero wtedy działa na podstawie treści logu. Dowód to połowa zadania, a drugą połową jest [[trusted-header|zaufany nagłówek]]."
        ]
      },
      {
        heading: "Żadna metoda RPC go nie zwraca",
        paragraphs: [
          "[[json-rpc|JSON-RPC warstwy wykonawczej]] nie ma na to żadnej metody. `eth_getProof` obejmuje tylko stan, a żadna standardowa metoda nie zwraca trie node'ów z trie transakcji ani receiptów. Obejście polega na samodzielnej odbudowie trie: trzeba pobrać wszystkie receipty bloku przez [[eth-get-block-receipts|eth_getBlockReceipts]] albo wszystkie transakcje przez [[eth-get-block-by-number|eth_getBlockByNumber]] z `fullTransactions` ustawionym na true, wstawić je pod kluczami będącymi kodowaniem RLP ich indeksów i wyciągnąć gałąź dla potrzebnego indeksu.",
          "Dobra strona jest taka, że dane mogą pochodzić z endpointu, któremu zupełnie się nie ufa. Jeśli jakikolwiek receipt został zmieniony albo pominięty, odbudowany korzeń nie będzie równy `receiptsRoot` z zaufanego nagłówka i cała próba kończy się jawnym błędem. Zła strona to nakład pracy: jeden pełny blok receiptów na każdy dowód i enkoder, który bajt w bajt odtwarza serializację receiptu używaną przez klienta, razem z prefiksem typu."
        ]
      }
    ],
    example: {
      title: "Odbudowa trie receiptów, żeby wyciągnąć dowód",
      note: "Receipty mogą pochodzić z dowolnego endpointu: albo odbudowany korzeń zgadza się z zaufanym nagłówkiem, albo dane były błędne, i trzeciej możliwości nie ma."
    },
    pitfalls: [
      "Pominięcie prefiksu typu z EIP-2718 przy ponownym kodowaniu receiptu; korzeń różni się wtedy od `receiptsRoot` w każdym bloku, który zawiera transakcję typowaną.",
      "Oczekiwanie, że `eth_getProof` obejmie receipty albo transakcje; ta metoda dowodzi tylko stanu, a żadna standardowa metoda nie zwraca tych ścieżek trie node'ów.",
      "Traktowanie `logsBloom` jako dowodu, że log istnieje; filtr Blooma daje fałszywe trafienia i sam niczego nie dowodzi.",
      "Dowodzenie receiptu względem nagłówka, którego kanoniczności nigdy nie ustalono; dowód jest wtedy prawdziwy, a wniosek błędny."
    ]
  },
  "trusted-header": {
    title: "Zaufany nagłówek",
    aliases: [
      "trusted header",
      "anchor header",
      "kanoniczny nagłówek",
      "canonical header",
      "łańcuch nagłówków",
      "header chain",
      "przypięty checkpoint",
      "źródło zaufania",
      "root of trust"
    ],
    summary: "Zaufany nagłówek to [[block-header|nagłówek]], w który weryfikator już wierzy, i każdy dowód ostatecznie się na nim opiera: dowód pokazuje, że wartość jest objęta commitmentem w `stateRoot` albo `receiptsRoot`, ale nie mówi nic o tym, czy ten nagłówek należy do łańcucha kanonicznego.",
    sections: [
      {
        heading: "Dlaczego bez niego dowód jest bezwartościowy",
        paragraphs: [
          "[[state-proof|Dowód stanu]] przyjmuje z zewnątrz dokładnie jedno wejście: korzeń. Jeśli ten korzeń pochodzi z tej samej odpowiedzi, która dostarczyła dowód, nie zweryfikowano niczego poza tym, że odpowiadający potrafi wygenerować wewnętrznie spójne dane, a to potrafi każdy, bo zbudowanie fałszywego nagłówka z fałszywym trie stanu pod spodem nic nie kosztuje. Zaufanie naprawdę siedzi w nagłówku, a dowód tylko rozciąga je na konkretną wartość.",
          "Minimalne sprawdzenie każdego otrzymanego nagłówka polega na tym, czy hashuje się on do [[block-hash|hasha bloku]], który deklaruje: `keccak256(RLP(header))` musi być równe temu hashowi. To wyłapuje manipulację pojedynczymi polami, ale niczego nie mówi o kanoniczności, bo wewnętrznie spójny nagłówek łańcucha, którego nikt nie śledzi, też hashuje się poprawnie."
        ]
      },
      {
        heading: "Cztery sposoby, żeby go zdobyć",
        paragraphs: [
          "Najmocniejszy jest własny [[full-node|pełny węzeł]]: sam zwalidował każdy blok, a jego head to jego własny wniosek. Dalej jest [[light-client|lekki klient]], który śledzi podpisy [[sync-committee|sync committee]] i przyjmuje nagłówki na podstawie argumentu kryptograficznego, a nie słowa operatora; opisuje to temat [[consensus-proof|dowód konsensusu]]. Trzeci sposób to przypięty checkpoint, czyli sfinalizowany [[block-hash|hash bloku]] zdobyty innym kanałem (out of band), dokładnie tak, jak wymagają tego już [[checkpoint-sync|checkpoint sync]] i [[weak-subjectivity|weak subjectivity]], plus łańcuch nagłówków weryfikowany od niego do przodu przez sprawdzenie każdego `parentHash` i każdego hasha.",
          "Czwarty i najsłabszy sposób to sprawdzanie krzyżowe: zapytanie kilku niezależnych [[rpc-provider|providerów]] o ten sam numer bloku i porównanie hashy. To wyłapuje pojedynczego kłamcę albo mocno opóźniony węzeł i jest tanie, ale zgodność providerów to heurystyka, a nie dowód. Do tej samej kategorii należy flaga `requireCanonical` z [[eip|EIP-1898]]: sprawia, że węzeł zwraca błąd, zamiast odpowiadać z bocznej gałęzi, co jest przydatne, ale to wciąż tylko zapewnienie samego węzła o własnej kanoniczności."
        ]
      },
      {
        heading: "Aktualność to osobna kwestia",
        paragraphs: [
          "Nagłówek naprawdę kanoniczny, ale naprawdę stary, dowodzi tylko starych faktów. Do nagłówka trzeba dołożyć ograniczenie jego wieku: sprawdzić `timestamp` i `number` względem oczekiwań albo wymagać, żeby nagłówek osiągnął już poziom [[block-tag|tagu bloku]] `finalized`, bo tylko na tym poziomie [[finality|finalność]] sprawia, że odwrócenie kosztuje jedną trzecią stake'u.",
          "Łączenie nagłówków od checkpointu do przodu przez `parentHash` daje ciągłość, a nie kanoniczność: atakujący z wystarczającą liczbą starych kluczy może zbudować od starego checkpointu długi, spójny łańcuch. To właśnie atak dalekiego zasięgu (long-range attack), który ma ograniczać weak subjectivity, i dlatego checkpoint musi być świeży, a konfiguracje [[verified-rpc|weryfikowanego RPC]] odświeżają swój checkpoint."
        ]
      }
    ],
    example: {
      title: "Przypięcie nagłówka i sprawdzenie tego, co z niego wynika",
      note: "Krok 3 zmusza węzeł do złożenia deklaracji, zamiast po cichu odpowiadać z przegrywającej gałęzi; to wciąż deklaracja tego węzła i właśnie dlatego istnieją kroki 1 i 2."
    },
    pitfalls: [
      "Branie `stateRoot` z tej samej odpowiedzi co dowód, przez co weryfikacja sprowadza się do sprawdzenia, czy odpowiadający jest spójny sam ze sobą.",
      "Brak sprawdzenia, czy `keccak256(RLP(header))` równa się deklarowanemu hashowi bloku, przez co nagłówek z jednym zmienionym polem przechodzi bez przeszkód.",
      "Sprawdzanie krzyżowe dwóch endpointów, które po cichu są tym samym upstreamem albo tym samym providerem; daje to zgodność, za którą nie stoi żadna niezależność.",
      "Traktowanie `requireCanonical` jak zabezpieczenia kryptograficznego; to deklaracja odpowiadającego węzła, a nie dowód, który weryfikator może sprawdzić."
    ]
  },
  "consensus-proof": {
    title: "Dowód konsensusu",
    aliases: [
      "consensus proof",
      "podpis sync committee",
      "sync committee signature",
      "lekki klient Altair",
      "dowód kanoniczności",
      "agregat BLS",
      "BLS aggregate"
    ],
    summary: "Dowód konsensusu pokazuje, że [[beacon-block|nagłówek beacon]] jest kanoniczny. Jest nim zagregowany podpis [[sync-committee|sync committee]] nad tym nagłówkiem, opakowany w [[light-client-update|aktualizację lekkiego klienta]], a od niego gałąź [[ssz|SSZ]] prowadzi do [[block-header|nagłówka]] wykonawczego i jego `stateRoot`.",
    sections: [
      {
        heading: "Co daje sync committee",
        paragraphs: [
          "Pełne śledzenie [[proof-of-stake|proof of stake]] oznacza śledzenie setek tysięcy walidatorów. Sync committee z forka Altair istnieje po to, żeby [[light-client|lekki klient]] nie musiał tego robić: 512 walidatorów jest wybieranych na okres 256 [[slot-epoch|epok]], czyli około 27 godzin, i podpisuje widziane nagłówki podpisem BLS, który da się agregować. Weryfikator, który zna klucze publiczne bieżącego komitetu, może sprawdzić jeden zagregowany podpis i przyjąć nagłówek. Specyfikacja lekkiego klienta ustawia próg zależnie od celu: aktualizacja jest ważna z jednym uczestnikiem, optymistyczny head przesuwa się, gdy uczestnictwo przekroczy połowę niedawnego szczytu, a tylko sfinalizowany nagłówek i przekazanie komitetu wymagają co najmniej dwóch trzecich, czyli 342 z 512. Wyjątek: gdy od sfinalizowanego nagłówka minie cały okres, klient może wymusić zastosowanie najlepszej aktualizacji, jaką widział.",
          "Rotacja komitetu też jest udowodniona. Każda aktualizacja niesie komitet na następny okres razem z gałęzią SSZ, która pokazuje, że obejmuje go commitment w stanie poświadczanego nagłówka. Klient, który raz zrobił bootstrap, może więc iść do przodu okres po okresie i już nigdy nie ufać serwerowi."
        ]
      },
      {
        heading: "Aktualizacje lekkiego klienta",
        paragraphs: [
          "Obiekty definiują specyfikacje konsensusu, a serwuje je [[beacon-api|Beacon API]]. Bootstrap pobrany dla zaufanego block root daje nagłówek i bieżący komitet. Następnie obiekty `LightClientUpdate` niosą poświadczony nagłówek, agregat sync committee, który go podpisał, następny komitet z jego gałęzią i gałąź finalności prowadzącą do sfinalizowanego checkpointu. Między nimi aktualizacje optymistyczne i aktualizacje finalności śledzą head i najnowszy sfinalizowany nagłówek.",
          "Założenia zaufania są słabsze niż pełna [[finality|finalność]] i warto powiedzieć je wprost. Członek sync committee nie podlega slashingowi za podpisanie nagłówka, który nigdy nie stanie się kanoniczny, więc argumentem bezpieczeństwa jest uczciwa większość w próbie 512 walidatorów, a nie jedna trzecia całego stake'u. Do tego korzeń bootstrapu musi pochodzić spoza protokołu, dokładnie tak, jak wymaga [[weak-subjectivity|weak subjectivity]]."
        ]
      },
      {
        heading: "Od nagłówka beacon do nagłówka wykonawczego",
        paragraphs: [
          "Sam kanoniczny nagłówek beacon nie daje `stateRoot`, względem którego można zweryfikować [[state-proof|dowód stanu]]. Nagłówek [[execution-payload|execution payload]] jest polem w body bloku beacon, więc łącznikiem jest gałąź Merkle SSZ od block root bloku beacon w dół do tego pola, a stamtąd do jego `state_root` i `block_hash`. Ta gałąź zamienia nagłówek zweryfikowany przez konsensus w [[trusted-header|zaufany nagłówek]], którego potrzebuje dowód wykonawczy. Gloas, konsensusowa połowa [[hardfork|aktualizacji sieci Glamsterdam]] (na Sepolii od 2026-10-06, na mainnecie jeszcze bez terminu), wyjmuje payload z bloku beacon: nagłówek lekkiego klienta niesie wtedy tylko `execution_block_hash`, którego dowodzi się z `parent_block_hash` w ofercie payloadu (payload bid) tego bloku, a `stateRoot` musi pochodzić z nagłówka wykonawczego, którego hash sprawdza się względem tej wartości.",
          "To samo połączenie istnieje wewnątrz [[evm|EVM]]. Od Dencun EIP-4788 umieszcza korzeń poprzedniego bloku beacon w [[block-header|nagłówku]] wykonawczym jako `parentBeaconBlockRoot` i udostępnia go kontraktom, więc kontrakt może weryfikować dowody SSZ o stanie konsensusu, na przykład salda walidatorów albo withdrawal credentials (dane określające, dokąd trafiają wypłaty), bez wyroczni (oracle)."
        ]
      }
    ],
    example: {
      title: "Pobieranie aktualizacji lekkiego klienta z beacon node",
      note: "Zaufanym wejściem jest tylko korzeń bootstrapu; każdy późniejszy nagłówek jest przyjmowany, bo podpisał go komitet udowodniony przez poprzednią aktualizację."
    },
    pitfalls: [
      "Traktowanie podpisu sync committee jak finalności; członkowie komitetu nie podlegają slashingowi za podpisanie nagłówka, który przegrywa, więc gwarancja jest słabsza.",
      "Bootstrap z block root podanego przez ten sam serwer, który serwuje aktualizacje; cały łańcuch zaufania sprowadza się wtedy do tego serwera.",
      "Zatrzymanie się na kanonicznym nagłówku beacon; bez gałęzi SSZ do nagłówka execution payload nie ma `stateRoot`, względem którego można cokolwiek zweryfikować.",
      "Używanie [[keccak-256|keccak-256]] do sprawdzania tych dowodów; merkleizacja w konsensusie to wszędzie SSZ z SHA-256."
    ]
  },
  "execution-trace": {
    title: "Trace wykonania",
    aliases: [
      "execution trace",
      "trace",
      "callTracer",
      "prestateTracer",
      "struct logger",
      "stateDiff",
      "vmTrace",
      "wywołania wewnętrzne",
      "internal calls"
    ],
    summary: "Trace wykonania to zapis tego, jak węzeł wykonał transakcję, krok po kroku albo wywołanie po wywołaniu, zwracany przez [[debug-api|debug_traceTransaction]] albo [[trace-api|trace_transaction]]. Wyjaśnia, co zrobiła [[evm|EVM]], i jest relacją tego węzła, a nie dowodem kryptograficznym.",
    sections: [
      {
        heading: "Dwie rodziny, kilka formatów",
        paragraphs: [
          "Metody `debug_` w stylu [[geth|Geth]] przyjmują argument z tracerem. `callTracer` zwraca drzewo wywołań — każdy wpis ma `type`, `from`, `to`, `value`, `input`, `output`, `gas`, `gasUsed`, a gdy wywołanie się nie powiodło, `error` z powodem revertu — i tego kształtu chce większość narzędzi. `prestateTracer` zwraca każde konto i slot storage odczytane przez transakcję, czyli to, co zawiera [[witness|witness]] do ponownego wykonania, tylko bez dowodów. Domyślny struct logger emituje jeden wpis na opcode z licznikiem programu, opcode'em, gasem i opcjonalnie stosem, pamięcią i storage, a dla dużej transakcji jego wynik sięga setek megabajtów.",
          "Przestrzeń nazw `trace_` w stylu Parity, implementowana przez [[nethermind|Nethermind]], [[erigon|Erigon]] i Reth, dzieli to inaczej. `trace` to płaska lista akcji i wyników zamiast drzewa, `vmTrace` to widok na poziomie pojedynczych kroków, a `stateDiff` podaje stan przed i po dla każdego konta, którego dotknęła transakcja. `trace_filter` przeszukuje wiele bloków naraz i dlatego oparte na nim [[block-explorer|eksploratory bloków]] mogą listować transfery wewnętrzne dla danego adresu."
        ]
      },
      {
        heading: "Relacja, nie dowód",
        paragraphs: [
          "Żadna część trace nie jest objęta commitmentem w [[block-header|nagłówku]]. Nagłówek zawiera commitment do [[transaction-receipt|receiptów]] przez `receiptsRoot` i do wynikowego [[state|stanu]] przez `stateRoot`, ale droga, którą wykonanie do nich doszło, nie jest nigdzie zapisana w łańcuchu. Dwa węzły mogłyby zwrócić różne trace'y tej samej transakcji i żadne porównanie hashy nie powie, który jest prawidłowy.",
          "Trace da się sprawdzić tylko przez ponowne wykonanie, a nie przez weryfikację. Trzeba samemu wykonać transakcję na tym samym stanie wyjściowym i porównać wynik albo porównać dwie niezależne [[client-diversity|implementacje klienta]]. To prawdziwe sprawdzenie, ale istotnie inne zadanie niż walidacja [[state-proof|dowodu stanu]], do której wystarczy jedna funkcja hashująca i jeden [[trusted-header|zaufany nagłówek]]."
        ]
      },
      {
        heading: "Kiedy się przydaje",
        paragraphs: [
          "Trace'y odpowiadają na pytania, na które nic innego nie odpowie. Pokazują, dlaczego wywołanie zrobiło [[revert|revert]] i na jakiej głębokości. Odtwarzają wewnętrzne transfery wartości, które nie emitują [[event-log|logu]], więc są niewidoczne dla [[indexer|indeksera]] opartego tylko na logach. Pomagają budować [[access-list|access listy]]. Wynik `prestateTracer` pokazuje też dokładnie, które wartości musiałby udowodnić [[witness|witness]] przy [[stateless-ethereum|wykonaniu stateless]], choć, jak zaznacza dokumentacja Geth, zwraca tylko same wartości, bez trie node'ów, które ich dowodzą.",
          "Koszt jest realny. Trace starej transakcji wymaga stanu sprzed niej, więc wszystko starsze niż kilkaset ostatnich bloków wymaga [[archive-node|węzła archiwalnego]]. Dostawcy wyceniają te metody dużo wyżej niż wywołania `eth_` albo całkiem wyłączają te przestrzenie nazw, a węzeł, który publicznie wystawia `debug_`, daje każdemu tani sposób na zużycie swojego CPU; zobacz [[security|bezpieczeństwo RPC]]."
        ]
      }
    ],
    example: {
      title: "Drzewo wywołań z debug_traceTransaction",
      note: "Żadne z tych wewnętrznych wywołań nie ma hasha transakcji, receiptu ani logu. Trace to jedyne miejsce, gdzie się pojawiają, a istnieje tylko dlatego, że ten węzeł wykonał transakcję ponownie na prośbę wywołującego."
    },
    pitfalls: [
      "Powoływanie się na trace jako na dowód tego, co się stało; to relacja jednego węzła z wykonania i nic w nagłówku nie zawiera do niej commitmentu.",
      "Uruchamianie domyślnego struct loggera na dużej transakcji, co może zwrócić setki megabajtów i skończyć się timeoutem żądania.",
      "Zakładanie, że wynik `debug_` i `trace_` da się parsować tym samym kodem; obie rodziny różnią się strukturą i nazwami pól.",
      "Planowanie pracy wokół trace'ów bez sprawdzenia endpointu; wielu dostawców mocno je wycenia albo w ogóle nie udostępnia tych przestrzeni nazw."
    ]
  },
  "stateless-ethereum": {
    title: "Stateless Ethereum i drzewa stanu",
    aliases: [
      "stateless ethereum",
      "Ethereum bez stanu",
      "statelessness",
      "binary tree",
      "drzewo binarne",
      "zmiana drzewa stanu",
      "state tree change"
    ],
    summary: "Stateless Ethereum (Ethereum bez stanu) to cel, w którym blok waliduje się na podstawie [[witness|witnessa]], czyli [[state|stanu]], którego blok dotyka, plus dowodów, zamiast trzymać cały stan. Witnessy dla [[merkle-patricia-trie|MPT]] są zdecydowanie za duże, a struktura commitmentów, która ma zastąpić to trie, wciąż nie jest przesądzona.",
    sections: [
      {
        heading: "Problem witnessa",
        paragraphs: [
          "Walidator, który nie przechowuje stanu, nie wykona bloku, dopóki ktoś nie dostarczy razem z nim dotkniętych kont i slotów, każdego z dowodem względem `stateRoot`. W obecnym hexary trie jest to rujnująco drogie: blok dotyka tysięcy różnych kluczy, każda ścieżka ma od siedmiu do dziewięciu node'ów głębokości, a każdy branch node po drodze niesie szesnaście 32-bajtowych referencji, czy są potrzebne, czy nie. Witnessy mają wtedy megabajty, a to nie mieści się w 12-sekundowym slocie obok wszystkiego innego.",
          "Stateless nie jest więc tak naprawdę zmianą wykonania, tylko zmianą struktury commitmentów, która leży pod nim. Dlatego punkt roadmapy, który ludzie nazywają „stateless”, zawsze był omawiany jako wymiana drzewa stanu."
        ]
      },
      {
        heading: "Najpierw Verkle, potem drzewa binarne",
        paragraphs: [
          "[[verkle-tree|Drzewa Verkle]] były planem mniej więcej od 2021 do 2024 roku. Zastępują hashe commitmentami wektorowymi (vector commitments), więc commitment node'a obejmuje wszystkie jego dzieci i ma stały rozmiar, a dowód otwiera pozycję bez przesyłania danych o sąsiadach, co zmniejsza witnessy mniej więcej o rząd wielkości. EIP-6800 opisywał zunifikowany układ stanu Verkle i uruchamiano testnety.",
          "W 2025 roku ten kierunek zszedł na dalszy plan na rzecz [[binary-state-tree|binarnych drzew stanu]], głównie z powodu tego, jak trudno dowodzić Verkle wewnątrz SNARK-a, i z chęci posiadania prostszej, bardziej konserwatywnej struktury. Ani jedno, ani drugie nie jest wdrożone: mainnet nadal używa hexary Merkle-Patricia trie z [[keccak-256|keccak-256]], opisanego w Yellow Paper, i żadna [[hardfork|aktualizacja sieci]] nie wdrożyła zamiennika. Verkle trzeba traktować jako zaproponowane i odłożone, drzewa binarne jako obecny kierunek, a jedno i drugie jako bez daty."
        ]
      },
      {
        heading: "Co zmieniłoby się w RPC",
        paragraphs: [
          "Najbardziej bolesnym miejscem jest [[eth-get-proof|eth_getProof]]. EIP-1186 definiuje wynik tej metody przez node'y MPT: `accountProof` i `storageProof[].proof` to tablice trie node'ów zakodowanych w [[rlp|RLP]], a inne drzewo sprawia, że te tablice tracą sens, a nie tylko wyglądają inaczej. Każdy weryfikator, czyli kontrakty bridge'ów, [[light-client|lekcy klienci]] i [[verified-rpc|proxy weryfikujące]], ma na sztywno zakodowane przejście opisane w tematach [[account-proof|dowód konta]] i [[storage-proof|dowód storage]], więc zmiana drzewa oznacza skoordynowane przepisanie ich wszystkich plus okres przejściowy, w którym trzeba serwować obie struktury.",
          "Zmienia się też schemat kluczy. Obie propozycje spłaszczają konta i storage do jednej przestrzeni kluczy z innym mapowaniem [[contract-storage|numeru slotu]] na pozycję w drzewie, więc kod, który sam liczy ścieżki zamiast pytać węzeł, psuje się niezależnie od formatu dowodu. Nic z tego nie dotyczy [[eth-call|eth_call]] ani [[eth-get-balance|eth_getBalance]], których wyniki to zwykłe wartości."
        ]
      }
    ],
    example: {
      title: "Jedno wyszukanie konta w trzech schematach commitmentów",
      note: "Nic z tego nie jest zaplanowane; jedyną strukturą, na której weryfikator może dziś polegać, jest hexary trie."
    },
    pitfalls: [
      "Opisywanie drzew Verkle jako nadchodzących albo zaplanowanych; w 2025 roku zeszły na dalszy plan na rzecz drzew binarnych, a ani jedne, ani drugie nie zostały wdrożone.",
      "Pisanie kodu weryfikującego dowody, który zakłada, że kształt node'ów MPT jest trwały, bez znacznika wersji przy zapisanych dowodach.",
      "Mylenie walidatora stateless z [[light-client|lekkim klientem]]; pierwszy wykonuje bloki na podstawie witnessa, drugi śledzi nagłówki i niczego nie wykonuje.",
      "Oczekiwanie, że stateless usunie potrzebę danych archiwalnych; witnessy obejmują stan, którego dotyka blok, a nie historię łańcucha."
    ]
  },
  "verified-rpc": {
    title: "Weryfikowane RPC",
    aliases: [
      "verified rpc",
      "nimbus verified proxy",
      "trust-minimized rpc",
      "proxy weryfikujące",
      "verifying proxy",
      "RPC przez lekkiego klienta",
      "light client rpc",
      "zweryfikowany eth_call"
    ],
    summary: "Weryfikowane RPC to korzystanie z endpointu bez ufania mu: [[light-client|lekki klient]] ustala [[trusted-header|zaufany nagłówek]], dowody sprawdzają te odpowiedzi, które da się udowodnić, a wszystko inne jest sprawdzane krzyżowo albo przyjmowane świadomie.",
    sections: [
      {
        heading: "Kształt wzorca",
        paragraphs: [
          "Proxy weryfikujące działa obok aplikacji i rozmawia z nią zwykłym [[json-rpc|JSON-RPC]], więc nic wyżej w stosie aplikacji się nie zmienia. Po drugiej stronie proxy śledzi łańcuch przez aktualizacje [[sync-committee|sync committee]], żeby uzyskać kanoniczne nagłówki, czyli [[consensus-proof|dowód konsensusu]], a potem odpowiada na każde obsługiwane żądanie, wywołując niezaufanego [[rpc-provider|providera]] warstwy wykonawczej i weryfikując wynik względem nagłówka, który już ma. Saldo staje się wywołaniem [[eth-get-proof|eth_getProof]] plus przejściem ścieżki [[state-proof|dowodu stanu]]; [[block-hash|hash bloku]] staje się porównaniem.",
          "Bootstrap to jedyne zaufane wejście: świeży sfinalizowany block root, zdobyty tak samo, jak zdobywa go [[checkpoint-sync|checkpoint sync]], i ograniczony tym samym rozumowaniem co [[weak-subjectivity|weak subjectivity]]. Potem proxy przyjmuje nagłówki dlatego, że mówią tak podpisy, a nie dlatego, że powiedział tak serwer."
        ]
      },
      {
        heading: "Implementacje",
        paragraphs: [
          "Najbardziej znany jest [[helios|Helios]]: lekki klient w Ruście, który synchronizuje się od checkpointu weak subjectivity, rozmawia z niezaufanym endpointem wykonawczym i wystawia aplikacjom lokalny serwer JSON-RPC. [[nimbus|Nimbus]] verified proxy robi to samo od strony Nimbusa: siedzi między aplikacją a niezaufanym endpointem i weryfikuje to, co przekazuje dalej. [[lodestar|Lodestar]] dostarcza biblioteki lekkiego klienta i provera przeznaczone dla przeglądarek i aplikacji JavaScript.",
          "Pokrycie metod jest we wszystkich częściowe i zmienia się między wydaniami, więc zamiast zakładać, trzeba sprawdzić aktualną listę projektu. Dobrze pokryty rdzeń to odczyty, które sprowadzają się do dowodu stanu. Cała reszta jest albo przekazywana dalej bez weryfikacji (pass-through), albo nieobsługiwana, i to, która z tych dwóch opcji zachodzi, ma ogromne znaczenie: przekazanie bez weryfikacji, które wygląda jak zweryfikowana odpowiedź, jest gorsze niż brak proxy."
        ]
      },
      {
        heading: "Czego nie da się udowodnić i co robić zamiast tego",
        paragraphs: [
          "Kilka popularnych wywołań nie ma dowodu dostępnego rozsądnym kosztem. Wywołanie [[eth-get-logs|eth_getLogs]] po zakresie wymagałoby odbudowy trie receiptów dla każdego bloku w tym zakresie. Zawartość [[mempool|mempoola]] i sugerowane ceny gasu to opinie, a nie fakty objęte commitmentem. Trace'y to [[execution-trace|trace wykonania]], którego nie obejmuje żaden commitment. [[eth-call|eth_call]] leży pośrodku: da się go zweryfikować tylko przez ponowne wykonanie lokalnie na udowodnionym stanie. [[helios|Helios]] robi to dla dowolnych wywołań: bierze wynik [[eth-create-access-list|eth_createAccessList]] jako podpowiedź, dowodzi przez `eth_getProof` każdego konta i slotu, które ona wymienia, uruchamia wywołanie w lokalnym revm, a potem pobiera i dowodzi wszystkiego, co podpowiedź pominęła. Kosztuje to jedno żądanie o dowód na każde konto, którego dotyka wywołanie.",
          "W takich przypadkach warto użyć tanich zabezpieczeń: przypiąć [[chain-id|chain ID]], porównywać [[block-hash|hashe bloków]] od dwóch naprawdę niezależnych providerów na tej samej wysokości, przy wszystkim, czego nie da się odwrócić, wybierać [[block-tag|tag bloku]] `finalized` i pamiętać, że zgodność providerów to heurystyka. Koszty też są realne: dodatkowy proces, dodatkowe opóźnienie każdego wywołania, checkpoint do odświeżania i [[beacon-api|endpoint beacon]] do śledzenia."
        ]
      }
    ],
    example: {
      title: "Proxy weryfikujące przed niezaufanym endpointem",
      note: "Pierwsze wywołanie jest weryfikowane względem nagłówka, którego proxy samo dowiodło; drugie to sprawdzenie spójności między dwiema stronami, czyli znacznie słabsze stwierdzenie."
    },
    pitfalls: [
      "Zakładanie, że proxy weryfikujące weryfikuje każdą metodę; pokrycie jest częściowe, a nieobsługiwane wywołania mogą być przekazywane bez zmian.",
      "Bootstrap lekkiego klienta z checkpointu od tej samej strony, która serwuje dane; cała konfiguracja wraca wtedy do ufania jednemu serwerowi.",
      "Sprawdzanie krzyżowe dwóch endpointów, które prowadzą do tego samego upstreamu albo tego samego providera; daje to zgodność bez niezależności.",
      "Przedstawianie użytkownikom zgodności providerów jako weryfikacji; wykrywa ona pojedynczego kłamcę, ale niczego nie dowodzi o łańcuchu."
    ]
  },
  witness: {
    title: "Witness",
    aliases: [
      "execution witness",
      "stateless witness",
      "debug_executionWitness",
      "block witness",
      "witness bloku",
      "pre-state",
      "stan wejściowy",
      "prover input",
      "dane wejściowe provera"
    ],
    summary: "Witness to wszystko, czego potrzeba, żeby ponownie wykonać blok bez posiadania [[state|stanu]] łańcucha: konta, sloty storage i kod, których blok dotyka, [[merkle-patricia-trie|trie]] node'y, które dowodzą ich względem [[state-root|state root]] bloku nadrzędnego, oraz nagłówki przodków, które może odczytać `BLOCKHASH`.",
    sections: [
      {
        heading: "Czego blok potrzebuje z zewnątrz",
        paragraphs: [
          "Wykonanie bloku odczytuje stan, którego blok ze sobą nie niesie: saldo i nonce każdego nadawcy, bytecode każdego wywoływanego kontraktu, każdy slot, którego dotyka `SLOAD`, a dla `BLOCKHASH` hashe maksymalnie 256 przodków. Weryfikator, który nie ma tego stanu, musi te dane dostać i musi wiedzieć, że są prawdziwe. Witness zapewnia jedno i drugie: wartości, trie node'y na ścieżce od `stateRoot` bloku nadrzędnego do każdej z nich oraz [[block-header|nagłówek]] bloku nadrzędnego, który przypina ten korzeń, ze starszymi nagłówkami połączonymi z nim przez `parentHash`.",
          "Trie node'y mają też drugie zadanie. Po wykonaniu weryfikator przelicza korzeń stanu po bloku i porównuje go z `stateRoot` samego bloku, a aktualizacja trie wymaga node'ów na każdej zmienionej ścieżce oraz, tam gdzie usunięcie zwija gałąź, node'ów sąsiednich, których nie dotknął żaden odczyt. Kod przesyła się w całości i uwierzytelnia, hashując go funkcją [[keccak-256|keccak-256]] i porównując wynik z `codeHash` w udowodnionym liściu konta."
        ]
      },
      {
        heading: "Trzy formy, z którymi styka się wywołujący RPC",
        paragraphs: [
          "`prestateTracer`, uruchomiony przez [[debug-api|debug_traceTransaction]] albo trace całego bloku, zwraca saldo, nonce, kod i storage wszystkiego, co odczytała transakcja. To same wartości: dokumentacja Getha porównuje go do stateless witness, z tą różnicą, że nie zwraca dowodu kryptograficznego, więc jego wynik jest dokładnie tak wiarygodny jak węzeł, który go wygenerował; opisuje to temat [[execution-trace|trace wykonania]]. [[eth-get-proof|eth_getProof]] to przypadek odwrotny, weryfikowalny, ale ślepy: jeden [[account-proof|dowód konta]] i jego [[storage-proof|dowody storage]] na wywołanie, bez wiedzy o tym, których kluczy potrzebuje blok.",
          "`debug_executionWitness` wykonuje całe zadanie w jednym wywołaniu. Węzeł ponownie wykonuje blok na stanie bloku nadrzędnego i zwraca `state` (każdy dotknięty trie node, zakodowany w [[rlp|RLP]]), `codes`, `keys` (niehashowane adresy i sloty) oraz `headers`. [[geth|Geth]], [[reth|Reth]], [[erigon|Erigon]], [[nethermind|Nethermind]] i [[besu|Besu]] mają metodę o tej nazwie, ale nie ma jej w specyfikacji execution-apis, a kształty odpowiedzi się różnią: Geth zwraca nagłówki jako obiekty JSON i zostawia `keys` puste, pozostali klienci zwracają bajty nagłówków w RLP, a Besu zwraca tylko `state`, `codes` i `headers`, czyli trzy pola referencyjnego witnessa, na którym opiera się EIP-8025. Ponieważ metoda potrzebuje stanu bloku nadrzędnego, [[pruned-node|pruned node]] zbuduje witness tylko dla niedawnych bloków."
        ]
      },
      {
        heading: "Kto korzysta z witnessów",
        paragraphs: [
          "[[stateless-ethereum|Walidacja stateless]] to konsument na poziomie protokołu: walidator, który sprawdza każdy blok na podstawie witnessa zamiast bazy danych. Dziś intensywniej korzystają z nich provery zero-knowledge. Prover dla [[zk-rollup|zkEVM]] albo [[real-time-proving|dla bloków L1]] uruchamia blok wewnątrz systemu dowodowego bez dysku i bez sieci, więc jego program hosta zbiera wszystkie dane wejściowe zawczasu: albo jednym wywołaniem `debug_executionWitness`, albo przez trace bloku, który pokazuje dotknięte klucze, a potem wywołanie `eth_getProof` na bloku nadrzędnym dla każdego z nich. Zeth dokumentuje swoją zależność od tej niestandardowej metody i dostarcza proxy, które buduje witnessy z węzła archiwalnego.",
          "Programy [[fraud-proof|fault proof]] dla [[optimistic-rollup|optimistic rollupów]] używają leniwej odmiany. Program OP Stack prosi hosta o każdy trie node L2 i każdy fragment kodu kontraktu po hashu, przez preimage oracle (usługę, która zwraca dane dla podanego hasha), w chwili, gdy wykonanie do nich dotrze. Wynikiem jest ten sam witness, pobierany na żądanie i uwierzytelniany przez hashowanie."
        ]
      },
      {
        heading: "Rozmiar i to, co czyni witness wiarygodnym",
        paragraphs: [
          "W [[merkle-patricia-trie|Merkle-Patricia trie]] o rozgałęzieniu szesnastkowym (hexary) każdy poziom ścieżki kosztuje cały branch node z maksymalnie szesnastoma 32-bajtowymi referencjami. EIP-6800 szacuje witness dla przeciętnego dostępu do konta na blisko 3 kB, EIP-7864 szacuje jedną gałąź w drzewie z 2 do potęgi 32 wpisów na 3840 bajtów, a ponieważ kod nie jest dzielony na chunki, dotknięcie jednego bajtu kontraktu oznacza przesłanie całego kodu. To argument za drzewami [[verkle-tree|Verkle]] i drzewami binarnymi.",
          "Witness sam w sobie niczego nie dowodzi. Każdy node jest uwierzytelniany tylko przez hashowanie w górę do korzenia, więc wszystko opiera się na nagłówku bloku nadrzędnego, którego hash musi być równy `parentHash` bloku, któremu już się ufa; opisuje to temat [[trusted-header|zaufany nagłówek]]. Przy zaufanym korzeniu nieuczciwy witness może pominąć dane, przez co wykonanie się nie powiedzie, ale nie może zmienić wartości bez złamania hasha. Przy korzeniu wziętym z tej samej odpowiedzi może twierdzić cokolwiek."
        ]
      }
    ],
    example: {
      title: "debug_executionWitness dla jednego bloku",
      note: "Każdy wpis `state` jest uwierzytelniany tylko przez hashowanie w górę do `stateRoot` nagłówka bloku nadrzędnego. Geth obsługuje tę samą metodę z nagłówkami jako obiektami JSON i pustym `keys`, więc dekoder musi wiedzieć, który klient odpowiedział."
    },
    pitfalls: [
      "Ponowne wykonywanie bloku na podstawie wyniku `prestateTracer` tak, jakby był witnessem; bez trie node'ów nic nie wiąże tych wartości ze state root.",
      "Parsowanie odpowiedzi `debug_executionWitness` od różnych klientów jednym dekoderem; kodowanie nagłówków i pole `keys` się różnią, a żadna specyfikacja tego nie rozstrzyga.",
      "Składanie witnessa z `eth_getProof` na bloku nadrzędnym, a potem niepowodzenie przy liczeniu korzenia stanu po bloku, bo usunięcie, które zwija gałąź, wymaga node'a sąsiedniego, którego nie zawierał żaden dowód.",
      "Branie nagłówka bloku nadrzędnego z tej samej odpowiedzi co witness, co dowodzi tylko tego, że witness jest zgodny sam ze sobą."
    ]
  },
  "verkle-tree": {
    title: "Drzewo Verkle",
    aliases: [
      "verkle",
      "verkle tree",
      "drzewo Verkle",
      "drzewa Verkle",
      "EIP-6800",
      "vector commitment",
      "Pedersen commitment",
      "EIP-7612",
      "EIP-4762",
      "Bandersnatch",
      "IPA multiproof"
    ],
    summary: "Drzewo Verkle to drzewo stanu, w którym każdy rodzic ma 256 dzieci i zawiera do nich commitment w postaci vector commitmentu, a nie hashy. Zaproponowano je w EIP-6800, żeby [[witness|witnessy]] były na tyle małe, by umożliwić [[stateless-ethereum|walidację w trybie stateless]]. Później odłożono je na rzecz binarnego drzewa opartego na hashach.",
    sections: [
      {
        heading: "Commitmenty zamiast hashy",
        paragraphs: [
          "W [[merkle-patricia-trie|Merkle-Patricia Trie]] rodzic zawiera commitment do swoich dzieci w postaci hasha z nich wszystkich, więc żeby udowodnić jedno dziecko, trzeba dostarczyć pozostałe. W drzewie Verkle rodzic przechowuje zamiast tego vector commitment do swoich 256 dzieci (w EIP-6800 jest to Pedersen commitment na krzywej eliptycznej Bandersnatch), a dowód otwiera tylko te pozycje, których potrzebuje. Otwarcia (openings) wzdłuż wszystkich ścieżek, których dotyka blok, są agregowane w jeden multiproof oparty na inner product argument (IPA), który nie wymaga trusted setupu.",
          "Zyskiem jest rozmiar. Według EIP-6800 [[witness|witness]] dla przeciętnego dostępu do konta to blisko 3 kB w dzisiejszym trie i około 200 bajtów w drzewie Verkle. Dla bloku na 15 milionów gasu EIP szacuje najgorszy przypadek w trie hexary na około 18 MB, czyli za dużo, żeby bezpiecznie rozgłosić go w ciągu 12-sekundowego slotu. Dowód Verkle sprawdza się arytmetyką na krzywych eliptycznych, a nie [[keccak-256|keccak-256]], więc nie ma nic wspólnego z przechodzeniem po trie, które opisuje [[account-proof|dowód konta]]."
        ]
      },
      {
        heading: "Jedno drzewo, 31-bajtowe stemy",
        paragraphs: [
          "EIP-6800 spłaszcza też układ danych. Zamiast trie stanu, którego liście wskazują na osobne trie storage każdego kontraktu, powstaje jedno drzewo klucz-wartość z 32-bajtowymi kluczami. Pierwsze 31 bajtów, czyli stem (wspólny początek klucza), pochodzi z hasha Pedersena z [[address|adresu]] i indeksu w drzewie; ostatni bajt wybiera jedną z 256 wartości pod tym stemem. Wersja, nonce, saldo i rozmiar kodu konta są upakowane w jedną wartość, hash kodu leży tuż obok, a pierwsze 64 [[contract-storage|sloty storage]] i pierwsze 128 fragmentów kodu dzielą ten sam stem. Typowe wywołanie otwiera więc jeden stem zamiast kilku ścieżek.",
          "Kod trafia do drzewa podzielony na 31-bajtowe fragmenty (chunks). Każdy fragment zaczyna się od bajtu, który mówi, ile jego początkowych bajtów to dane PUSH, dzięki czemu cele skoków (jump destinations) pozostają jednoznaczne. Drzewo odróżnia też zapisane zero od pustej pozycji, czego obecne trie nie potrafi: zanim istniejąca wartość trafi do commitmentu, do jej dolnej połowy dodaje się 2 do potęgi 128, więc zero i brak wartości dają różne commitmenty. EIP-4762 dodaje, że klucz, który raz otrzymał wartość, nigdy nie staje się z powrotem pusty. Dlaczego to ważne, wyjaśnia [[exclusion-proof|dowód nieistnienia]]."
        ]
      },
      {
        heading: "Przejście i gas",
        paragraphs: [
          "Stanu nie da się przepisać w jednym bloku. EIP-7612 proponuje nakładkę (overlay): w momencie forka Merkle-Patricia Trie zostaje zamrożone, każdy zapis trafia do nowego drzewa Verkle, a odczyt najpierw sprawdza drzewo Verkle, a jeśli nic tam nie ma, sięga do zamrożonego trie. Późniejszy krok, EIP-7748, przenosi w każdym bloku stałą liczbę starych wpisów. Przez cały ten czas wartość może się znajdować w jednej albo w drugiej strukturze, dlatego proponowany precompile (prekompilowany kontrakt) do weryfikacji, EIP-7545, przyjmował bajt wersji wskazujący typ dowodu.",
          "Razem z drzewem zmienia się [[gas|gas]], zgodnie z EIP-4762. Transakcja płaci 1900 gasu, gdy pierwszy raz dotyka danego stemu, i 200 za każdą nową wartość odczytaną pod nim; pierwszy zapis do stemu kosztuje 3000, pierwszy zapis do wartości 500, a wypełnienie wartości, która wcześniej była pusta, 6200. Wykonanie kodu jest rozliczane za każdy 31-bajtowy fragment, co według szacunków EIP podnosi średnie zużycie gasu o 6 do 12 procent. Znika za to opłata za każdy bajt przy wdrażaniu kodu."
        ]
      },
      {
        heading: "Status w 2026 roku",
        paragraphs: [
          "Verkle był planem mniej więcej od 2021 do 2024 roku i działał na testnetach (sieciach testowych) Kaustinen, ale nie trafił do mainnetu i nie jest zaplanowany. EIP-6800, EIP-7612 i EIP-7545 mają status Stagnant, a w marcu 2026 roku ze specyfikacji konsensusu usunięto feature specs dla EIP-6800, uzasadniając to tym, że EIP raczej nie trafi w najbliższym czasie do żadnej aktualizacji sieci. Ani Glamsterdam, ani Hegotá nie przewiduje zmiany drzewa stanu, a mainnet nadal działa na trie hexary.",
          "Kierunek zmienił się na [[binary-state-tree|drzewo binarne z EIP-7864]], nadal w statusie Draft: każdy rodzic ma dwoje dzieci, a commitmentem jest zwykły hash, bo commitmenty na krzywych eliptycznych nie są odporne na komputery kwantowe, a drzewa binarne oparte na hashach taniej się dowodzi w SNARK-ach, które mają w przyszłości weryfikować bloki. Funkcja hashująca nie jest jeszcze wybrana; tymczasowo jest nią BLAKE3. Projekt zachowuje stemy z 256 wartościami, nakładkę z EIP-7612 i access events z EIP-4762, a priorytety Ethereum Foundation na 2026 rok wymieniają drzewa binarne i model stateless jako cele długoterminowe. Każda z tych zmian zastępuje to, co zwraca [[eth-get-proof|eth_getProof]]; zobacz [[stateless-ethereum|stateless Ethereum]]."
        ]
      }
    ],
    example: {
      title: "Gdzie leżą dane jednego konta w drzewie z EIP-6800",
      note: "Sloty od 64 w górę dzielą stem w wyrównanych seriach po 256, więc sąsiednie sloty otwiera jeden commitment; sloty wyliczane przez keccak-256, na przykład wpisy mappingów w Solidity, trafiają na niepowiązane ze sobą stemy."
    },
    pitfalls: [
      "Przedstawianie drzew Verkle jako następnej zaplanowanej aktualizacji sieci; EIP mają status Stagnant, a żadna nazwana aktualizacja nie zawiera zmiany drzewa stanu.",
      "Oczekiwanie, że dowód Verkle to lista hashy sąsiednich gałęzi (sibling hashes); to zbiór commitmentów i jedno zagregowane otwarcie, sprawdzane arytmetyką na krzywych eliptycznych.",
      "Traktowanie kosztów gasu z EIP-4762 jako przesądzonych; EIP ma status Draft, a propozycja drzewa binarnego przejmuje jego access events, nie ustalając cen.",
      "Zakładanie jednego formatu dowodu w okresie przejściowym; w nakładce wartość może wymagać dowodu z zamrożonego trie albo z nowego drzewa."
    ]
  },
  "exclusion-proof": {
    title: "Dowód nieistnienia (exclusion proof)",
    aliases: [
      "exclusion proof",
      "proof of absence",
      "dowód braku",
      "non-membership proof",
      "non-inclusion proof",
      "nieistniejące konto",
      "nieustawiony slot storage"
    ],
    summary: "Dowód nieistnienia pokazuje, że klucz nie ma wpisu pod danym [[state-root|korzeniem]]: ścieżka [[merkle-patricia-trie|trie]] dla tego klucza, przechodzona od korzenia w dół, kończy się pustym polem branch node'a albo node'em, którego zapisana ścieżka rozchodzi się z kluczem, więc żadna wartość nie może tam istnieć.",
    sections: [
      {
        heading: "Gdzie kończy się ścieżka",
        paragraphs: [
          "Nibble'e klucza (połówki bajtu) wyznaczają jego ścieżkę, więc nieobecny klucz i tak ma miejsce, które by zajmował. Dowód nieistnienia to lista node'ów od korzenia w dół aż do miejsca, które okazuje się puste, a w trie stanu i trie storage może się on skończyć na trzy sposoby. Pole dziecka branch node'a dla następnego nibble'a to pusty ciąg `0x80`. Zapisana w liściu pozostała ścieżka różni się od pozostałych nibble'i klucza, więc w tym miejscu jest inny klucz. Albo zapisany fragment extension node'a nie jest prefiksem pozostałych nibble'i, więc klucz odgałęziłby się powyżej niego.",
          "Przejście weryfikuje się dokładnie tak jak w przypadku [[inclusion-proof|dowodu włączenia (inclusion proof)]] – hash każdego node'a musi być równy referencji, którą trzymał jego rodzic – a różni się tylko końcowe sprawdzenie. Odczyt zapisanych ścieżek opiera się na [[hex-prefix-encoding|kodowaniu hex-prefix]], które mówi też weryfikatorowi, czy dwuelementowy node jest liściem, czy extension node'em. EIP-1186 opisuje zakończenia przy branch node'ach i liściach, ale nie wspomina o zakończeniu przy extension node'ach, choć weryfikatory i tak muszą je obsłużyć. Puste trie, którego korzeń to `0x56e81f17…b421`, dowodzi braku każdego klucza pustym dowodem."
        ]
      },
      {
        heading: "Co eth_getProof zwraca, gdy klucza nie ma",
        paragraphs: [
          "Dla adresu bez liścia [[eth-get-proof|eth_getProof]] zwraca `balance` `0x0`, `nonce` `0x0` i `accountProof`, który kończy się na jeden z tych trzech sposobów. Dwa pola z hashami zależą od klienta. Geth od v1.13.4, Nethermind i Erigon zwracają `0x000…000` zarówno jako `codeHash`, jak i jako `storageHash`; Besu i Reth domyślnie zwracają hash pustego kodu `0xc5d24601…a470` i korzeń pustego trie `0x56e81f17…b421`, a EIP-1186 tego nie rozstrzyga. Każde istniejące [[account|konto]] bez kodu i storage ma te same stałe, więc tylko dowód odróżnia konto nieistniejące od pustego.",
          "Dla klucza storage bez liścia wpis `storageProof` ma `value` `0x0` i dowód kończący się w miejscu rozbieżności; gdy nie ma trie storage do przejścia, bo konto nie istnieje albo jego storage root to korzeń pustego trie, Geth zwraca pustą tablicę `proof`. Slot nigdy niezapisany i slot wyzerowany dają tę samą odpowiedź, bo [[evm|EVM]] usuwa slot ustawiony na zero, zamiast przechowywać zero, co wyjaśnia [[storage-proof|dowód storage]]. Kontrakt, który potrzebuje tego rozróżnienia, musi trzymać własną flagę. Projekt [[verkle-tree|drzew Verkle]] by to zmienił: tam zero ma inny commitment niż brak wartości."
        ]
      },
      {
        heading: "Weryfikacja",
        paragraphs: [
          "Zaczyna się od korzenia, któremu się ufa: dla konta jest to `stateRoot` z [[trusted-header|zaufanego nagłówka]], a dla storage – `storageRoot` z już udowodnionego liścia konta, nigdy pole `storageHash` z odpowiedzi. Adres albo slot hashuje się [[keccak-256|keccak-256]], co daje 64 nibble'e. Potem przechodzi się node'y: sprawdza się każdy hash, pamięta, że node'y krótsze niż 32 bajty są wstawione inline do rodzica, i po drodze zużywa nibble'e. Na koniec trzeba wymagać, żeby ostatni node pokazywał brak na jeden z trzech sposobów i żeby dowód się na nim kończył.",
          "Na tym ostatnim wymaganiu weryfikatory się mylą. Dowód, który urywa się, bo pominięto następny node, wygląda jak ścieżka, która się skończyła, ale rodzic nadal trzyma referencję do prawdziwego dziecka: dowód jest niekompletny, a klucz może jak najbardziej istnieć. Brak można przyjąć tylko wtedy, gdy sam ostatni node pokazuje puste pole albo rozbieżną ścieżkę. Wtedy konto traktuje się jako nieistniejące albo slot jako zerowy, a `codeHash` i `storageHash` z odpowiedzi się ignoruje."
        ]
      },
      {
        heading: "Do czego służy dowód braku",
        paragraphs: [
          "[[bridge|Bridge]] albo kontrakt do przesyłania wiadomości, zanim cokolwiek wypłaci, udowadnia, że slot z flagą „claimed” albo z nullifierem nadal jest zerowy. [[light-client|Lekki klient]] albo [[verified-rpc|weryfikujące proxy]] odpowiada na `eth_getBalance` dla świeżego adresu zweryfikowanym zerem, a nie zerem, którego nie da się sprawdzić, a nieistniejące konto przesądza, że [[eth-get-code|eth_getCode]] zwróci pusty kod, równie pewnie jak udowodniony liść.",
          "Po stronie [[ssz|SSZ]] nie ma odpowiednika. Obiekty konsensusu mają stały układ, w którym każde pole istnieje, więc weryfikator konsensusu dowodzi, że pole ma jakąś wartość, na przykład zerowy hash, pod znanym [[generalized-index|generalized index]], a nie że brakuje klucza."
        ]
      }
    ],
    example: {
      title: "eth_getProof dla adresu, którego nigdy nie użyto",
      note: "Dowodem jest ostatni node z `accountProof`, a nie zerowe `balance`: jego hash musi być równy referencji, którą trzymał rodzic, a jego pole dla następnego nibble'a klucza musi być puste."
    },
    pitfalls: [
      "Traktowanie dowodu, w którym skończyły się node'y, jako dowodu braku; brakujący node-dziecko oznacza niekompletny dowód, a brak klucza pokazuje tylko puste pole albo rozbieżna ścieżka.",
      "Uznawanie, że konto istnieje, bo `codeHash` i `storageHash` są niezerowe; Besu i Reth zwracają puste stałe także dla kont, których w ogóle nie ma w trie.",
      "Oczekiwanie, że dowód storage odróżni slot, do którego nigdy nic nie zapisano, od slotu wyzerowanego; żaden z nich nie ma liścia.",
      "Obsługiwanie tylko zakończeń przy branch node'ach i liściach, co odrzuca poprawny dowód, w którym klucz rozchodzi się wewnątrz extension node'a."
    ]
  },
  "hex-prefix-encoding": {
    title: "Kodowanie hex-prefix",
    aliases: [
      "HP encoding",
      "kodowanie compact",
      "compact encoding",
      "hex prefix",
      "nibble path",
      "ścieżka nibble'i",
      "flaga liścia",
      "compact_encode"
    ],
    summary: "Kodowanie hex-prefix to zwięzła forma, w której liście i extension node'y [[merkle-patricia-trie|Merkle-Patricia]] przechowują swoją ścieżkę: nibble'e (połówki bajtu, czyli pojedyncze cyfry hex) są upakowane po dwa w bajcie za nibble'em flagi, który mówi, czy node jest liściem i czy ścieżka ma nieparzystą liczbę nibble'i.",
    sections: [
      {
        heading: "Po co nibble flagi",
        paragraphs: [
          "Trie przechodzi po kluczach nibble po nibble'u, ale node'y przechowują bajty, więc ścieżki o nieparzystej liczbie nibble'i nie da się upakować bez zaznaczenia tego. Liście i extension node'y dokładają drugą niejednoznaczność: jedne i drugie to dwuelementowe listy [[rlp|RLP]], `[path, x]`, i nic innego w liście nie mówi, czy `x` to zapisana wartość, czy referencja do dziecka. Kodowanie hex-prefix rozstrzyga obie kwestie jednym początkowym nibble'em. Definiuje je Yellow Paper; w kodzie Geth nazywa się ono kodowaniem compact, a Geth trzyma też osobną formę w pamięci, w której liść oznacza końcowy nibble o wartości 16.",
          "Branch node'y nie mają ścieżki, bo ich siedemnaście pól jest indeksowanych samym nibble'em, więc to kodowanie występuje tylko w pierwszym elemencie dwuelementowego node'a. [[eth-get-proof|eth_getProof]] zwraca node'y w surowej postaci, więc każdy, kto ręcznie sprawdza [[account-proof|dowód konta]] albo [[storage-proof|dowód storage]], dekoduje je dla każdego liścia i każdego extension node'a. Używają go też trie budowane dla każdego bloku, na których opiera się [[receipt-proof|dowód receiptu]]."
        ]
      },
      {
        heading: "Cztery flagi",
        paragraphs: [
          "Flagą jest starszy nibble pierwszego bajtu: 0 dla extension node'a o parzystej liczbie nibble'i, 1 dla extension node'a o nieparzystej, 2 dla liścia o parzystej, 3 dla liścia o nieparzystej. Bit 1 oznacza liść, a bit 0 nieparzystą długość. Przy nieparzystej długości młodszy nibble pierwszego bajtu jest pierwszym nibble'em ścieżki; przy parzystej jest zerem wypełniającym (padding), a ścieżka zaczyna się w drugim bajcie. Pozostałe nibble'e idą dalej po dwa w bajcie.",
          "Ścieżka extension node'a f 3 b koduje się więc jako `0x1f3b`, a f 3 jako `0x00f3`, natomiast ścieżki liści 0 f 1 c b 8 oraz f 1 c b 8 kodują się jako `0x200f1cb8` i `0x3f1cb8`; to przykłady z ethereum.org. Jedna konsekwencja zaskakuje: ścieżka liścia z 56 nibble'i i ścieżka z 57 nibble'i zajmują po 29 bajtów, więc długość w bajtach nie mówi, ile jest nibble'i. Mówi to tylko flaga."
        ]
      },
      {
        heading: "Ręczne dekodowanie jednego liścia",
        paragraphs: [
          "Weźmy klucz konta `keccak256(0xd8dA…6045)`, którego nibble'e zaczynają się od 0 6 e 1 2 0 c 2, i załóżmy, że siedem branch node'ów zużyło 0 6 e 1 2 0 c. Pierwszy element liścia jest wtedy ciągiem RLP o długości 29 bajtów, z prefiksem `0x9d`, zaczynającym się od `0x32`: flaga 3, czyli liść o nieparzystej ścieżce, więc młodszy nibble 2 jest pierwszym nibble'em ścieżki, a kolejne 28 bajtów daje pozostałe 56 nibble'i. Siedem zużytych plus 57 zdekodowanych to 64, a te 57 nibble'i musi dokładnie odpowiadać końcówce klucza, bo inaczej liść należy do innego konta.",
          "Gdyby zużyto osiem nibble'i, ten sam liść zaczynałby się od `0x20`: liść, parzysta ścieżka, zero paddingu, a potem identyczne 28 bajtów. W przypadku extension node'a arytmetyka jest taka sama, ale wynikiem jest fragment do zużycia, zanim pójdzie się za referencją tego node'a. Weryfikator, który źle odczyta flagę, nie zgłasza głośnego błędu; przesuwa się o jeden nibble i odrzuca poprawne dowody. Gdy zdekodowana ścieżka ma się różnić od klucza, node jest dowodem braku; zobacz [[exclusion-proof|dowód nieistnienia]]."
        ]
      }
    ],
    example: {
      title: "Dekodowanie ścieżki jednego liścia konta",
      note: "Nakładają się tu trzy warstwy: usunięcie `0x` i zdekodowanie hex daje bajty, zdekodowanie RLP daje elementy node'a, a zdekodowanie hex-prefix daje nibble'e. Tylko ostatnia z nich to kodowanie opisane w tym temacie."
    },
    pitfalls: [
      "Odróżnianie liścia od extension node'a po czymkolwiek innym niż flaga, na przykład po głębokości node'a albo długości jego drugiego elementu, co kieruje przejście w złą stronę.",
      "Odrzucanie młodszego nibble'a każdego pierwszego bajtu; przy ścieżce o nieparzystej długości to pierwszy nibble ścieżki.",
      "Liczenie nibble'a flagi albo zera paddingu jako części ścieżki, co przesuwa całe przejście o jeden nibble.",
      "Wyznaczanie liczby nibble'i z długości w bajtach, która nie odróżni ścieżki z 56 nibble'i od ścieżki z 57.",
      "Mylenie go z [[hex-encoding|kodowaniem hex]] z prefiksem `0x` w polach JSON-RPC; hex-prefix działa wewnątrz trie node'ów zakodowanych w RLP, warstwę niżej niż tekst JSON."
    ]
  },
  "generalized-index": {
    title: "Generalized index",
    aliases: [
      "gindex",
      "generalised index",
      "uogólniony indeks",
      "dowód Merkle SSZ",
      "SSZ Merkle proof",
      "FINALIZED_ROOT_GINDEX",
      "get_generalized_index",
      "subtree index",
      "EIP-7688"
    ],
    summary: "Generalized index to liczba, która wskazuje jeden node w drzewie Merkle [[ssz|SSZ]]: korzeń ma numer 1, a dzieci node'a i mają numery 2i oraz 2i + 1. Dzięki temu jedna liczba całkowita mówi weryfikatorowi, jak głęboko leży udowadniane pole i po której stronie stoi każdy hash sąsiada.",
    sections: [
      {
        heading: "Numerowanie drzewa binarnego",
        paragraphs: [
          "Merkleizacja SSZ zamienia każdy obiekt w drzewo binarne 32-bajtowych chunków, a generalized index numeruje jego node'y od góry: korzeń to 1, jego dzieci to 2 i 3, ich dzieci to node'y od 4 do 7, a ogólnie dziećmi i są 2i po lewej i 2i + 1 po prawej. Zapisany binarnie indeks sam jest mapą. Wiodący bit 1 to korzeń, liczba bitów po nim to głębokość, a te bity czytane od góry to kolejne skręty: 0 w lewo, 1 w prawo. 105 to `0b1101001`: sześć poziomów w dół, skręty w prawo, w lewo, w prawo, w lewo, w lewo, w prawo.",
          "To wszystko, czego weryfikator potrzebuje poza samymi danymi. Gałąź dla indeksu g zawiera dokładnie floor(log2 g) hashy sąsiadów. Przy przejściu w górę każdy krok hashuje bieżący node z jego sąsiadem, przy czym bieżący node jest po lewej, gdy g jest parzyste, a po prawej, gdy nieparzyste, a potem g dzieli się na pół. Tę pętlę w kodzie pokazuje temat o [[inclusion-proof|dowodzie włączenia]], a [[consensus-proof|dowód konsensusu]] to łańcuch takich gałęzi. Pozycję w obrębie najgłębszego poziomu specyfikacje konsensusu nazywają subtree index: to g minus 2 do potęgi jego głębokości."
        ]
      },
      {
        heading: "Od nazwy pola do liczby",
        paragraphs: [
          "Kontener z n polami dopełnia się do następnej potęgi dwójki, czyli P liści, więc pole i ma indeks P + i. Zagnieżdżanie to konkatenacja: żeby dojść do pola wewnątrz pola, przesuwa się zewnętrzny indeks w lewo o głębokość wewnętrznego i dodaje wewnętrzną ścieżkę. Listy dołączają do korzenia swoją długość (length mix-in), więc ich zawartość leży pod lewym dzieckiem node'a listy. Stan beacon z forka Altair ma 24 pola, dopełniane do 32, a `finalized_checkpoint`, pole 20, ma w nim indeks 52; w dwupolowym `Checkpoint` pole `root` ma indeks 3; razem 52 razy 2 plus 1 daje 105, czyli `FINALIZED_ROOT_GINDEX` ze specyfikacji. Dwa pola sync committee, 22 i 23, mają indeksy 54 i 55.",
          "Ta sama arytmetyka sięga warstwy wykonawczej. W body [[beacon-block|bloku beacon]] z Deneb pole `execution_payload` ma indeks 25, a w payloadzie `state_root` to pole 2 z 17 pól dopełnionych do 32, czyli indeks 34, co daje 802, licząc od korzenia body. W ten sposób [[light-client-update|aktualizacje lekkiego klienta]] i kontrakty korzystające z EIP-4788 dowodzą [[finality|finalności]], przynależności do [[sync-committee|sync committee]], rekordów walidatorów i nagłówka [[execution-payload|execution payload]] względem korzenia, któremu już ufają."
        ]
      },
      {
        heading: "Kiedy fork przesuwa numery",
        paragraphs: [
          "P zależy od liczby pól, więc [[hardfork|fork]], po którym kontener przekracza potęgę dwójki, pogłębia jego drzewo i przenumerowuje każde pole w środku. Fork Electra zwiększył liczbę pól stanu beacon z 28 do 37, więc `finalized_checkpoint.root` przeniósł się ze 105 na 169, pola sync committee z 54 i 55 na 86 i 87, a każda gałąź przechodząca przez stan wydłużyła się o jeden hash. Fork Deneb zrobił to samo z nagłówkiem execution payload, z 15 pól do 17, przez co `block_hash` w body przesunął się z 412 na 812. Specyfikacja lekkiego klienta wybiera teraz indeks według slotu, a weryfikatory on-chain mają oba warianty: `BeaconChainProofs` z EigenLayer trzyma osobną wysokość stanu beacon dla Deneb i dla Pectra.",
          "Wszystko, co ma na sztywno wpisany indeks, długość gałęzi albo wysokość drzewa, psuje się przy forku, zwykle w postaci dowodów, które nagle przestają przechodzić, a kontrakt, którego nie da się zaktualizować, psuje się na dobre. Rozwiązaniem jest EIP-7688, ze statusem Scheduled for Inclusion w Glamsterdam: przenosi główne kontenery konsensusu na `ProgressiveContainer` (EIP-7495) i `ProgressiveList` (EIP-7916), których kształt pozwala dopisywać nowe pola bez przesuwania istniejących. Ceną jest ostatnie przenumerowanie, 735 dla `finalized_checkpoint.root` oraz 2945 i 2946 dla sync committee w specyfikacji Gloas, po którym pozycje mają się już nie zmieniać. Gloas aktywowano na Sepolii 6 października 2026, w epoce 353024, a termin dla mainnetu nie został jeszcze ustalony."
        ]
      }
    ],
    example: {
      title: "Obliczanie indeksów dla lekkiego klienta",
      note: "Wpisanie na sztywno wyników tych linii to dokładnie to, co zepsuło się przy forku Electra; specyfikacja lekkiego klienta wybiera teraz każdy indeks na podstawie slotu udowadnianego nagłówka."
    },
    pitfalls: [
      "Wpisanie na sztywno `FINALIZED_ROOT_GINDEX` jako 105 w [[light-client|lekkim kliencie]] albo kontrakcie; od forka Electra sfinalizowany korzeń leży pod indeksem 169.",
      "Mnożenie zagnieżdżonych indeksów zamiast ich konkatenacji; 52 i 3 dają razem 105, a nie 156.",
      "Pominięcie mix-inu długości listy, przez co dowód jest o jeden poziom za płytki i trafia na złą stronę.",
      "Branie głębokości z długości dostarczonej gałęzi zamiast z indeksu, co pozwala proverowi przedstawić node wewnętrzny, też 32-bajtowy, jako liść."
    ]
  },
  "light-client-update": {
    title: "Aktualizacja lekkiego klienta",
    aliases: [
      "LightClientUpdate",
      "LightClientBootstrap",
      "light client update",
      "finality update",
      "optimistic update",
      "light_client/updates",
      "okres sync committee",
      "sync committee period",
      "lekki klient Altair"
    ],
    summary: "Aktualizacja lekkiego klienta to obiekt [[ssz|SSZ]] z forka Altair, który beacon node udostępnia, żeby [[light-client|lekki klient]] mógł iść do przodu: nagłówek poświadczony zagregowanym podpisem [[sync-committee|sync committee]] oraz gałęzie Merkle, które ze stanu tego nagłówka dowodzą sfinalizowanego nagłówka i następnego komitetu.",
    sections: [
      {
        heading: "Co zawiera obiekt",
        paragraphs: [
          "`LightClientUpdate` ma siedem pól. `attested_header` to poświadczony nagłówek, czyli ten, który podpisał komitet, a `sync_aggregate` zawiera 512-bitowe pole uczestnictwa i jeden zagregowany [[bls-signature|podpis BLS]], wzięte z późniejszego bloku w slocie `signature_slot`. `finalized_header` z `finality_branch` dowodzi sfinalizowanego checkpointu zapisanego w stanie poświadczonego nagłówka, a `next_sync_committee` ze swoją gałęzią w ten sam sposób dowodzi komitetu na następny okres. Obie gałęzie sprawdza się względem `attested_header.beacon.state_root` pod stałym [[generalized-index|generalized index]]: 105 i 55 przed forkiem Electra, 169 i 87 od niego.",
          "Są też dwa lżejsze warianty. `LightClientFinalityUpdate` pomija następny komitet, a `LightClientOptimisticUpdate` zostawia tylko poświadczony nagłówek, agregat i slot, co pozwala klientowi śledzić head między sfinalizowanymi checkpointami. Punktem startowym jest `LightClientBootstrap`, pobierany dla block root, czyli korzenia bloku, któremu klient już ufa: zawiera nagłówek odpowiadający temu korzeniowi, bieżący komitet i jego gałąź. Klient sprawdza, czy hash tree root nagłówka jest równy korzeniowi, o który prosił, dlatego ten korzeń musi pochodzić spoza serwera, jak wymaga [[weak-subjectivity|weak subjectivity]]."
        ]
      },
      {
        heading: "Weryfikacja i zastosowanie aktualizacji",
        paragraphs: [
          "Komitet zmienia się co 256 [[slot-epoch|epok]], czyli 8192 sloty, mniej więcej co 27 godzin, a podpis musi pochodzić od komitetu okresu, w którym leży `signature_slot`: bieżącego albo następnego, jeśli klient już go zna. Walidacja sprawdza, czy `signature_slot` jest późniejszy niż slot poświadczonego nagłówka, który z kolei nie jest wcześniejszy niż slot sfinalizowany; weryfikuje obie gałęzie; i weryfikuje agregat nad poświadczonym nagłówkiem z użyciem wersji forka ze slotu `signature_slot` minus jeden oraz genesis validators root danej sieci. Aktualizacja z jednym uczestnikiem nadal przechodzi walidację.",
          "To, co aktualizacja może zmienić, zależy od uczestnictwa. Sfinalizowany nagłówek i rotacja komitetu są stosowane tylko wtedy, gdy ustawione są co najmniej dwie trzecie z 512 bitów, czyli 342 członków. Optymistyczny head przesuwa się przy mniejszym udziale: większym niż połowa najwyższego uczestnictwa widzianego w bieżącym i poprzednim okresie. Jeśli przez cały okres nic się nie sfinalizuje, specyfikacja pozwala wymusić aktualizację z najlepszej dotąd widzianej, w której poświadczony nagłówek zastępuje sfinalizowany. Dzięki temu klient posuwa się naprzód przez długi brak finalności, ale z gwarancją słabszą niż [[finality|finalność]]."
        ]
      },
      {
        heading: "Od nagłówka beacon do eth_getProof",
        paragraphs: [
          "Od forka Capella `LightClientHeader` zawiera więcej niż nagłówek beacon: `execution`, czyli nagłówek [[execution-payload|execution payload]] tego bloku, oraz `execution_branch`, cztery hashe, które dowodzą go pod indeksem 25 w body bloku względem `beacon.body_root`. To jest krok, który zamienia zweryfikowany nagłówek beacon w [[trusted-header|zaufany nagłówek]] dla warstwy wykonawczej. `execution.state_root` to korzeń, do którego musi się zhashować odpowiedź [[eth-get-proof|eth_getProof]], a `execution.block_hash` to hash, do którego należy przypiąć żądanie. Na dokładnie tym kroku opierają się [[verified-rpc|proxy weryfikujące]], takie jak [[helios|Helios]].",
          "Specyfikacja Gloas, czyli konsensusowa połowa Glamsterdam, znów zmienia ten kształt. Przy [[enshrined-pbs|enshrined proposer-builder separation]] (ePBS, rozdzielenie proposera i buildera wbudowane w protokół) payload przestaje być częścią bloku beacon, więc `LightClientHeader` zachowuje tylko `execution_block_hash`, którego dowodzi się z `parent_block_hash` w ofercie payloadu (payload bid), a każde wyszukanie state root zyskuje dodatkowy krok: pobrać nagłówek wykonawczy, zhashować go i porównać. Gloas aktywowano na Sepolii 6 października 2026, w epoce 353024, a termin dla mainnetu nie został jeszcze ustalony."
        ]
      },
      {
        heading: "Udostępnianie aktualizacji",
        paragraphs: [
          "[[beacon-api|Beacon API]] ma cztery endpointy pod `/eth/v1/beacon/light_client/`: `bootstrap/{block_root}`, `updates?start_period=…&count=…`, który zwraca najlepszą aktualizację dla każdego okresu i najwyżej 128 na żądanie, `finality_update` oraz `optimistic_update`, a do tego eventy `light_client_finality_update` i `light_client_optimistic_update` w [[server-sent-events|strumieniu eventów]]. Każdy odpowiada JSON-em z polem `version` albo, na życzenie, bajtami SSZ, a kształt obiektu zależy od forka jego poświadczonego nagłówka.",
          "Udostępnianie jest opcjonalne, a specyfikacja prosi pełne węzły o przechowywanie tych danych tylko przez okno serwowania bloków, czyli około pięciu miesięcy. Lighthouse je serwuje, chyba że zostanie uruchomiony z `--disable-light-client-server`, a Prysm serwuje je tylko z `--enable-light-client`. Klient, który był offline dłużej niż to okno albo robi bootstrap ze starszego korzenia, może nie znaleźć niczego do pobrania."
        ]
      }
    ],
    example: {
      title: "Od aktualizacji finalności do przypiętego eth_getProof",
      note: "Beacon node dostarcza bajty, ale nie zaufanie: aktualizację przyjmuje się dopiero wtedy, gdy agregat sync committee zgadza się z komitetem, który klient już zna, a obie gałęzie hashują się do `attested_header.beacon.state_root`."
    },
    pitfalls: [
      "Bootstrap z block root podanego przez ten sam beacon node, który serwuje aktualizacje; cały łańcuch dowodów sprowadza się wtedy do słowa tego węzła.",
      "Traktowanie aktualizacji optymistycznej jak ostatecznej; nie ma ona gałęzi finalności, a optymistyczny head przesuwa się przy mniejszym udziale komitetu.",
      "Zostawienie w lekkim kliencie długości gałęzi albo indeksów sprzed forka Electra; klient odrzuca wtedy każdą aktualizację poświadczoną po forku.",
      "Sprawdzanie odpowiedzi `eth_getProof` względem `beacon.state_root`, czyli korzenia stanu konsensusu, zamiast względem `execution.state_root`."
    ]
  },
  "binary-state-tree": {
    title: "Binarne drzewo stanu",
    aliases: [
      "EIP-7864",
      "binary state tree",
      "drzewo binarne",
      "unified binary tree",
      "binary trie",
      "stem node",
      "binary Merkle tree",
      "konwersja drzewa stanu"
    ],
    summary: "Binarne drzewo stanu to zaproponowany w EIP-7864 (wciąż w statusie Draft) zamiennik hexary [[merkle-patricia-trie|Merkle-Patricia trie]], z którego wylicza się [[state-root|state root]] Ethereum. To jedno drzewo klucz-wartość dla kont, kodu i storage, w którym każdy node ma dwoje dzieci, a commitmenty powstają wyłącznie przez hashowanie. Daje mniejsze dowody niż dzisiejsze trie i, w przeciwieństwie do [[verkle-tree|drzewa Verkle]], nie opiera się na krzywych eliptycznych.",
    sections: [
      {
        heading: "Problem z dzisiejszym trie",
        paragraphs: [
          "Każdy nagłówek bloku zawiera `stateRoot`, 32-bajtowy hash, który jest commitmentem do wszystkich kont, kodu i storage. Żeby sprawdzić względem niego jedną wartość bez trzymania [[state|stanu]], co musi robić [[light-client|lekki klient]], [[bridge|bridge]] albo walidator [[stateless-ethereum|stateless]], potrzebny jest dowód: hashe sąsiednich gałęzi (sibling hashes) na ścieżce aż do korzenia. W dzisiejszym trie każdy node ma szesnaścioro dzieci, więc na każdym poziomie dowód zawiera piętnaście hashy sąsiadów; według EIP-7864 jedna ścieżka w drzewie z 2 do potęgi 32 wpisów to 3840 bajtów. Kod leży poza trie, więc dotknięcie jednego bajtu kontraktu oznacza przesłanie całego kodu.",
          "Trie wolno się też dowodzi wewnątrz [[validity-proof|validity proofa]], a to właśnie validity proof jest drogą do sprawdzania bloków bez ich ponownego wykonywania, opisaną w temacie [[real-time-proving|dowodzenie bloków w czasie rzeczywistym]]. Jako przyczyny EIP wskazuje RLP, wolne w dowodzeniu hashowanie Keccak, osobne trie storage dla każdego kontraktu i kod trzymany poza drzewem. Dla wywołujących RPC nowe drzewo zmieniłoby to, co zwraca [[eth-get-proof|eth_getProof]], i sposób, w jaki każdy weryfikator sprawdza stan."
        ]
      },
      {
        heading: "Stemy, wartości i dwoje dzieci",
        paragraphs: [
          "Drzewo binarne to jedno mapowanie kluczy na 32-bajtowe wartości. Ostatni bajt klucza to jego subindeks, a reszta to stem (wspólny początek klucza); 256 wartości o tym samym stemie wisi pod jednym stem node'em, więc dane czytane razem są też razem dowodzone. Powyżej stemów każdy node wewnętrzny ma dwoje dzieci, a drzewo jest tylko tak głębokie, jak trzeba, żeby odróżnić od siebie stemy: nie ma extension node'ów ani [[rlp|RLP]].",
          "Commitmentem node'a wewnętrznego jest `hash(left || right)`, czyli hash połączonych hashy jego dwojga dzieci; stem node hashuje swoje 256 wartości parami w górę ośmiopoziomowego drzewa binarnego, a potem hashuje stem razem z korzeniem tego drzewa. Jeśli node ma k dzieci, dowód potrzebuje k − 1 sąsiadów na każdym poziomie, a dwoje dzieci daje najmniejszą sumę: dla 2 do potęgi 24 wpisów to 768 bajtów na ścieżkę wobec 2880 w drzewie hexary. Funkcja hashująca nie jest przesądzona: kod referencyjny używa BLAKE3, który według EIP nie jest ostateczny, a Keccak i Poseidon2, przechodzące przegląd bezpieczeństwa w Ethereum Foundation, pozostają kandydatami."
        ]
      },
      {
        heading: "Gdzie trafiają dane konta: co ustalone, a co otwarte",
        paragraphs: [
          "Część układu przetrwała wszystkie rewizje. Każde konto ma stem nagłówka (header stem) wyprowadzony z jego [[address|adresu]]: subindeks 0 pakuje w jedną wartość bajt wersji, 3-bajtowy rozmiar kodu, 8-bajtowy nonce i 16-bajtowe saldo, a subindeks 1 zawiera hash kodu. Kod jest cięty na 31-bajtowe fragmenty (chunks), a każdy fragment zapisuje się z bajtem na początku, który podaje, ile jest w nim danych PUSH. Pierwsze fragmenty kodu i pierwsze sloty storage dzielą stem nagłówka; reszta trafia w grupach po 256 pod inne stemy wyprowadzone z adresu, więc [[contract-storage|sloty mappingów]], wyliczane przez keccak, rozpraszają się szeroko po drzewie.",
          "Dokładne pozycje nie są ustalone. Rewizja z czerwca 2026 roku dodała na początku klucza bajt typu: 0 dla nagłówków kont, 1 dla kodu i 255 dla storage, i zmniejszyła udział stemu nagłówka ze 128 fragmentów kodu i 64 slotów do 16 i 4. Reszta tekstu za tym nie nadąża: proza nadal mówi o 128 i 64, funkcje wyliczające klucze używają niezdefiniowanych nazw i hashują dane o długościach, których reguła hashowania zabrania, a wektorów testowych nie ma. Pola konta można już spokojnie zapamiętać; dokładnych kluczy jeszcze nie."
        ]
      },
      {
        heading: "Nie Verkle, bez terminu i co to zmienia dla dowodów",
        paragraphs: [
          "W porównaniu z [[verkle-tree|Verkle]] EIP nie argumentuje rozmiarem dowodów, bo tu Verkle wygrywa, tylko kryptografią i dowodzeniem. Verkle opiera się na krzywych eliptycznych, które złamałby duży komputer kwantowy; EIP przywołuje zalecenie NIST, by odejść od nich do 2030 roku, zakłada, że drzewo oparte na hashach będzie ostatnim drzewem stanu Ethereum, i argumentuje, że przy szybkich proverach małe dowody mają mniejsze znaczenie. EIP-7864 ma status Draft i nie ma go na liście żadnej z dwóch najbliższych aktualizacji sieci, Glamsterdam i Hegotá, więc mainnet zostaje przy trie hexary.",
          "Migracja zamroziłaby stare trie, a nowe drzewo zaczynałoby jako puste. Zapisy trafiają do nowego drzewa; w nakładce (overlay) z EIP-7612, napisanej dla Verkle i mającej dziś status Stagnant, odczyt najpierw sprawdza nowe drzewo, a jeśli nic tam nie ma, sięga do zamrożonego trie. Następnie EIP-7748 kopiowałby w każdym bloku stałą liczbę starych wpisów. To wymaga oryginalnych kluczy, bo dzisiejsze trie przechowuje `keccak256(address)` i `keccak256(slot)`, więc każdy klient musi trzymać surowe klucze w płaskiej bazie danych (flat database), mieć pełną bazę preimage'ów, która mapuje hash z powrotem na klucz, albo pobrać gotową.",
          "[[eth-get-proof|eth_getProof]] w postaci zdefiniowanej w EIP-1186 zwraca trie node'y zakodowane w RLP, których nowe drzewo nie ma, a żaden zamiennik nie został wyspecyfikowany. Najgorzej mają kontrakty weryfikujące dowody on-chain: [[evm|EVM]] ma precompile'y dla SHA-256 i funkcji kompresji BLAKE2, ale nie ma żadnego dla BLAKE3 ani Poseidon2, a EIP zaznacza, że przestają działać dowody historycznego stanu sprawdzane wewnątrz EVM."
        ]
      }
    ],
    example: {
      title: "Klucze jednego konta według stałych z czerwca 2026",
      note: "Upakowanie basic data jest takie samo jak w układzie Verkle i nie budzi sporów; subindeksy 0x07 i 0x16 pochodzą z tabeli stałych, której przeczy proza samego EIP, a dwa ostatnie klucze podają do `H` dane, na które reguła hashowania nie pozwala. Każdy klucz w tym przykładzie trzeba więc traktować jako poglądowy, dopóki nie pojawią się wektory testowe."
    },
    pitfalls: [
      "Wpisywanie BLAKE3 na sztywno w weryfikator, choć EIP mówi, że funkcja hashująca nie jest ostateczna.",
      "Wdrażanie wyliczania kluczy według obecnego tekstu, którego stałe, proza i funkcje są ze sobą sprzeczne.",
      "Oczekiwanie jednego formatu dowodu w czasie migracji, choć w nakładce wartość leży albo w nowym drzewie, albo w zamrożonym trie."
    ]
  },
  "real-time-proving": {
    title: "Dowodzenie bloków w czasie rzeczywistym",
    aliases: [
      "real-time proving",
      "realtime proving",
      "dowodzenie w czasie rzeczywistym",
      "L1 zkEVM",
      "Ethproofs",
      "zkVM guest",
      "EIP-8025",
      "optional execution proofs"
    ],
    summary: "Dowodzenie bloków w czasie rzeczywistym (real-time proving) to wygenerowanie dowodu zero-knowledge, że [[block|blok]] L1 jest poprawny, zanim skończy się jego 12-sekundowy [[slot-epoch|slot]], tak żeby walidator mógł sprawdzić mały dowód zamiast ponownie wykonywać blok. Robocza definicja Ethereum Foundation to najwyżej 10 sekund dla 99 procent bloków mainnetu na sprzęcie, który może mieć pojedyncza osoba.",
    sections: [
      {
        heading: "Po co dowody bloków i jak szybkie",
        paragraphs: [
          "Dziś każdy [[validator|walidator]], zanim wyśle [[attestation|atestację]], ponownie wykonuje każdy blok na pełnym [[state|stanie]], więc walidacja kosztuje tym więcej, im bardziej rosną limit gasu i stan. Dowód zero-knowledge zrywa tę zależność. W tym kontekście to zwięzły certyfikat, że obliczenie przebiegło poprawnie, sprawdzany w milisekundach niezależnie od tego, jak długo trwało samo obliczenie; to ta sama asymetria, którą [[validity-proof|validity proofy]] dają [[zk-rollup|ZK rollupom]]. Jeśli jedna maszyna, prover, dowodzi każdego bloku, wszyscy pozostali mogą sprawdzać zamiast wykonywać, pod warunkiem że dowód jest gotowy w ramach slotu. Z punktu widzenia RPC provery intensywnie korzystają z metod zwracających witnessy, a walidator, który opiera się tylko na dowodach, nie miałby stanu, żeby obsługiwać wywołania.",
          "Wpis Ethereum Foundation z lipca 2025 roku ustawił poprzeczkę: najwyżej 10 sekund dla 99. percentyla bloków mainnetu; własny sprzęt (on-premises) kosztujący najwyżej 100 000 USD i pobierający najwyżej 10 kW, żeby dowodzenie wciąż było możliwe w domu; co najmniej 128 bitów bezpieczeństwa; oraz dowody o rozmiarze najwyżej 300 KiB, tworzone przez kod open source, bez trusted setupu, czyli jednorazowej ceremonii, której potrzebują niektóre systemy dowodowe i której pozostały sekret pozwoliłby fałszować dowody."
        ]
      },
      {
        heading: "Guest i tablica wyników",
        paragraphs: [
          "zkVM to system dowodowy dla zwykłych programów: uruchamia program skompilowany na mały zestaw instrukcji, zwykle RISC-V, i zwraca dowód tego, co dało to wykonanie. Ten program to guest, a tutaj jest nim walidacja stateless z klienta wykonawczego: mając blok i [[witness|witness]], czyli dane stanu, których blok dotyka, wykonuje blok ponownie i sprawdza wynikowy state root, receipts root i execution requests. [[geth|Geth]] dostarcza `cmd/keeper` z buildem dla zkVM Ziren opartego na MIPS, a [[nethermind|Nethermind]] publikuje guesty `stateless-validator` dla ZisK, SP1 i OpenVM.",
          "Ethproofs, pod adresem `ethproofs.org`, to publiczna tablica wyników: zespoły przesyłają dowody bloków mainnetu, a strona zapisuje dla każdego dowodu opóźnienie względem granicy 10 sekund, sprzęt, na przykład 16 konsumenckich GPU, i koszt. Wpis Foundation z grudnia 2025 roku podał, że na docelowym sprzęcie 99 procent bloków udowodniono w mniej niż 10 sekund. To, że jest wiele guestów na wielu zkVM, jest celowe: jeśli walidatorzy weryfikują, powiedzmy, trzy dowody z różnych zkVM, pojedynczy błąd soundness, czyli luka, która pozwala udowodnić fałszywe twierdzenie, nie wystarczy, żeby nieprawidłowy blok został przyjęty. To [[client-diversity|różnorodność klientów]] przeniesiona na provery."
        ]
      },
      {
        heading: "Dane wejściowe dla provera",
        paragraphs: [
          "Guest nie ma dysku ani sieci, więc program hosta zbiera dla niego dane wejściowe z góry. EIP-8025 ustala je jako `StatelessInput`: `NewPayloadRequest` z [[engine-api|Engine API]], czyli blok plus pola, które wysyła z nim klient konsensusu, [[chain-id|chain ID]] oraz `ExecutionWitness` złożony z trzech list. `state` zawiera trie node'y zakodowane w RLP, których potrzebuje wykonanie i wyliczenie state root po bloku, `codes` bytecode odczytany ze stanu sprzed bloku, a `headers` łańcuch nagłówków, najwyżej 256, od rodzica wstecz do najstarszego przodka, którego hash odczytał `BLOCKHASH`.",
          "Przez RPC witness można zdobyć jednym wywołaniem `debug_executionWitness` do węzła, który ma stan rodzica, albo przez [[eth-get-proof|eth_getProof]] na bloku rodzica dla każdego dotkniętego klucza, ale ta druga droga pomija node'y potrzebne do przeliczenia korzenia po usunięciu wpisu. Host działający w czasie rzeczywistym uruchamia własnego klienta wykonawczego obok provera: hostowane endpointy rzadko udostępniają [[debug-api|debug_]], a każdy round trip zjada część 10-sekundowego budżetu. Otwarty pull request do execution-apis dodałby `POST /engine/v1/payloads/witness`, który zwraca wynik walidacji i witness w jednym wywołaniu Engine API."
        ]
      },
      {
        heading: "Weryfikacja zamiast ponownego wykonania",
        paragraphs: [
          "EIP-8025, Optional Execution Proofs, to obecna propozycja dla L1. Walidatorzy, którzy się na to zdecydują (opt-in), działają jako provery i rozgłaszają `SignedExecutionProof` w nowym topicu `execution_proof` [[libp2p-gossip|sieci gossip]] warstwy konsensusu: do 400 KiB dowodu (to limit z EIP dla danych przesyłanych w sieci; 300 KiB z wpisu Foundation to cel dla systemów dowodowych), typ dowodu wskazujący zkVM i guesta oraz publiczne dane wejściowe (public input) z hash tree root [[ssz|SSZ]] całego `NewPayloadRequest`, flagą `successful_validation`, chain ID i identyfikatorem schematu. Weryfikator przyjmuje taki dowód tylko wtedy, gdy dowód przechodzi weryfikację, `successful_validation` ma wartość true, a root zgadza się z jego własnym żądaniem. EIP ma status Draft, a na liście planowania aktualizacji Hegotá figuruje jako odrzucony.",
          "W obecnym brzmieniu EIP węzły weryfikujące dowody nadal ponownie wykonują bloki, a poprawny dowód traktują jako dodatkowy sygnał; rezygnacja z ponownego wykonania wymagałaby późniejszego EIP. Nawet wtedy praca by się przeniosła, a nie zniknęła. Prover potrzebuje pełnego stanu wykonania i do tego swoich GPU, walidator, który tylko weryfikuje, nie miałby stanu i nie odpowiedziałby na żadne [[eth-call|eth_call]], a [[rpc-provider|dostawcy RPC]] nadal utrzymywaliby [[full-node|pełne węzły]] ze stanem. EIP ostrzega, że jeśli weryfikujących będzie przybywać szybciej niż proverów, stan będzie trzymać coraz mniej podmiotów."
        ]
      }
    ],
    example: {
      title: "Jeden slot według EIP-8025, krok po kroku",
      note: "Sprawdzenia z kroku 7 wymagają tylko dowodu i payloadu, który węzeł już ma, natomiast krok 3 wymaga pełnego stanu rodzica, a krok 5 sprzętu do dowodzenia; weryfikator trzyma stan tylko dlatego, że obecny tekst zachowuje ponowne wykonanie."
    },
    pitfalls: [
      "Wnioskowanie ze zweryfikowanego dowodu, że blok jest kanoniczny; dowód jest związany z jednym `NewPayloadRequest`, a gałąź nadal wybiera [[fork-choice|fork choice]].",
      "Przyjmowanie dowodu tylko dlatego, że się weryfikuje, bez sprawdzenia `successful_validation` i bez porównania zapisanego w dowodzie hash tree root żądania z własnym `NewPayloadRequest`.",
      "Przedstawianie EIP-8025 jako zaplanowanego albo jako końca ponownego wykonywania; to Draft, odrzucony dla Hegotá, w którym weryfikatory nadal ponownie wykonują bloki."
    ]
  }
};
