// Polish checkpoint questions for the Proofs & verification lessons, keyed by topic id. Each topic's
// six questions match data/quizzes/proofs.js in order, kind, and answer position.
export const quizzes = {
  "state-proof": [
    {
      kind: "detail",
      question: "Weryfikacja odpowiedzi eth_getProof się powiodła. Co w ten sposób ustalono?",
      options: [
        "Że blok należy dziś do kanonicznego łańcucha",
        "Że wartość jest nadal aktualna w tej chwili",
        "Że konto miało te pola w bloku z zaufanego nagłówka",
        "Że węzeł poprawnie wykonał transakcje tego bloku"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Które pole łączy część weryfikacji dotyczącą konta z częścią dotyczącą storage?",
      options: [
        "codeHash, który jest commitmentem do slotów kontraktu",
        "storageHash, czyli storage root z liścia konta",
        "stateRoot, użyty ponownie jako korzeń każdego trie storage",
        "Pole key w każdym wpisie tablicy storageProof"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego eth_getProof to złe narzędzie do udowodnienia, że kontrakt wyemitował log?",
      options: [
        "Logów nie obejmuje żaden korzeń, więc nic ich nie udowodni",
        "eth_getProof pomija logi kontraktów, ale nie logi kont",
        "Logi można udowodnić dopiero po sfinalizowaniu bloku",
        "Logi są w receiptach pod receiptsRoot, a nie w trie stanu"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Twój weryfikator bierze stateRoot z nagłówka zwróconego przez tego samego providera, który przysłał dowód. Co pokazuje udane sprawdzenie?",
      options: [
        "Że saldo było poprawne na tej wysokości bloku",
        "Tylko to, że odpowiadający jest wewnętrznie spójny",
        "Że węzeł providera był wtedy w pełni zsynchronizowany",
        "Że nagłówek jest kanoniczny, a do tego aktualny"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Dowód stanu weryfikuje się bez zarzutu. Co zostaje do ustalenia dla dowodu konsensusu albo własnego węzła?",
      options: [
        "Że liść konta prowadzi hashami w górę do stateRoot",
        "Że storageHash pasuje do udowodnionego liścia konta",
        "Że nagłówek należy do kanonicznego łańcucha",
        "Że wartość slotu dekoduje się z jego liścia"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Aplikacja dowodzi salda względem latest i trzyma zweryfikowany wynik w cache przez dobę. Co pójdzie nie tak?",
      options: [
        "Dowód wygaśnie, gdy następna epoka zostanie sfinalizowana",
        "Dowód z cache przestanie prowadzić hashami do swojego stateRoot",
        "Węzeł unieważni dowód w następnym bloku",
        "Dowód nadal jest poprawny, a saldo już się zmieniło"
      ],
      answer: 3
    }
  ],
  "merkle-patricia-trie": [
    {
      kind: "detail",
      question: "Co zawiera branch node w Merkle-Patricia Trie?",
      options: [
        "Dwa hashe dzieci i wartość, jak w binarnym drzewie Merkle",
        "Pełną pozostałą część klucza i jej wartość, bez dzieci",
        "Szesnaście referencji do dzieci, po jednej na nibble, plus pole wartości",
        "Wspólny fragment ścieżki i jedną referencję do jedynego dziecka"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego klucze w trie stanu i trie storage są hashowane przed użyciem?",
      options: [
        "Skraca to klucz, bo hash jest krótszy niż sam adres",
        "Chroni równowagę drzewa przed celowo głębokimi gałęziami",
        "Ukrywa każdy adres przed każdym, kto zobaczy dowód",
        "Bez tego RLP w ogóle nie potrafi zakodować klucza"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Przejście dowodu dochodzi do branch node'a, w którym pole dziecka dla następnego nibble'a jest puste. Czego to dowodzi?",
      options: [
        "Dowód jest wadliwy i trzeba go pobrać jeszcze raz",
        "Węzeł usunął to poddrzewo przez pruning i nie odpowie",
        "Klucz istnieje, ale jego wartość wynosi zero",
        "Klucza nie ma w trie pod tym korzeniem"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Kodowanie RLP node'a-dziecka ma 20 bajtów. Jak wskazuje na niego rodzic?",
      options: [
        "Przez jego hash keccak-256, jak w przypadku każdego innego dziecka",
        "Przez osadzenie tego node'a dosłownie, bez hasha",
        "Przez jego hash SHA-256, bo krótkie node'y używają SSZ",
        "Przez jego pozycję w tablicy node'ów dowodu"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co odróżnia trie transakcji i trie receiptów od trie stanu?",
      options: [
        "Są budowane od nowa w każdym bloku, a kluczem jest RLP indeksu",
        "Kluczem jest keccak hasha, a same trie przetrwają między blokami",
        "Używają SSZ i SHA-256, tak jak dane konsensusu",
        "Mają w nagłówku jeden wspólny korzeń z trie stanu"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Kierujesz swój weryfikator dowodów Merkle-Patricia na dowód stanu z Beacon Chain. Co się stanie?",
      options: [
        "Zadziała, bo każda z warstw używa RLP i keccak-256",
        "Zadziała, jeśli najpierw zdekoduje z RLP każdy sąsiedni node",
        "Zawiedzie tylko dla pól dodanych po Merge",
        "Zawiedzie: dane konsensusu to SSZ hashowane przez SHA-256"
      ],
      answer: 3
    }
  ],
  "account-proof": [
    {
      kind: "detail",
      question: "Co dokładnie jest kluczem, którego ścieżką prowadzą node'y accountProof?",
      options: [
        "20-bajtowy adres dopełniony z lewej do 32 bajtów",
        "keccak256 z tekstu adresu z sumą kontrolną",
        "keccak256 z 20 surowych bajtów adresu",
        "Nonce konta sklejony z jego adresem"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "eth_getProof zwraca dla adresu hash pustego kodu jako codeHash i korzeń pustego trie jako storageHash. Co mówią te dwie wartości?",
      options: [
        "Konto nie istnieje, bo to stałe oznaczające pustkę",
        "Węzłowi zabrakło trie node'ów i zwrócił wartości zastępcze",
        "Nic o istnieniu; konto EOA ze środkami zwraca dokładnie to samo",
        "Konto istnieje, ale jego kod i storage usunął pruning"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego weryfikator musi porównać pozostałą ścieżkę liścia z niezużytymi nibble'ami klucza?",
      options: [
        "Bez tego dekodowanie RLP liścia jest niejednoznaczne",
        "Liść przechowuje pozostałą ścieżkę w odwrotnej kolejności",
        "Bez tego przeszedłby dowód dla sąsiedniego konta",
        "Branch node'y nie zużywają nibble'i, więc liść trzyma je wszystkie"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "eth_getProof zwraca balance i nonce na najwyższym poziomie odpowiedzi i drugi raz w udowodnionym liściu. Co odróżnia te dwie kopie?",
      options: [
        "Kopie w liściu są zaokrąglone, a kopie poza liściem są dokładne",
        "Kopie poza liściem pochodzą z nowszego bloku niż liść",
        "Kopie w liściu są zahashowane, a kopie poza liściem są jawne",
        "Kopie poza liściem są niezweryfikowane, póki nie zgodzą się z liściem"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Przejście weryfikatora dla nietkniętego adresu kończy się branch node'em, w którym pole dla następnego nibble'a jest puste. Jak traktować ten wynik?",
      options: [
        "Jako zweryfikowany dowód, że konto nie istnieje",
        "Jako nieudane żądanie, które trzeba ponowić na innym endpoincie",
        "Jako dowód, że konto istnieje i ma zerowe saldo",
        "Jako wadliwy dowód, bo przejście musi kończyć się liściem"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Weryfikator hashuje tekst adresu z sumą kontrolną, żeby zbudować klucz trie. Co się stanie?",
      options: [
        "Zadziała, bo keccak-256 ignoruje wielkość liter",
        "Pójdzie ścieżką, która w trie donikąd nie prowadzi",
        "Zamiast tego udowodni sąsiednie konto",
        "Węzeł odrzuci żądanie dowodu jako wadliwe"
      ],
      answer: 1
    }
  ],
  "storage-proof": [
    {
      kind: "detail",
      question: "Ile hashy keccak-256 dzieli klucz mappingu od ścieżki w trie w przypadku wpisu mappingu?",
      options: [
        "Jeden: obliczony numer slotu jest od razu ścieżką w trie",
        "Trzy: osobno hashowane są klucz mappingu, slot i wartość",
        "Dwa: jeden daje numer slotu, drugi zamienia go w ścieżkę",
        "Żaden: wpisy mappingu leżą w trie pod surowym kluczem"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "eth_getProof zwraca dla slotu value 0x0 z dowodem. Czego dowodzi udana weryfikacja?",
      options: [
        "Slotu nigdy nie zapisano, bo wyzerowany slot zachowuje liść",
        "Slot jest pusty: nigdy niezapisany albo wyzerowany",
        "Pod tym adresem nie wdrożono kodu kontraktu",
        "Niczego, bo pustego slotu nie da się udowodnić"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Od którego storageHash powinno zaczynać się przejście dowodu storage?",
      options: [
        "Od pola storageHash z odpowiedzi eth_getProof",
        "Od stateRoot wziętego z zaufanego nagłówka",
        "Od keccak256 z 20-bajtowego adresu kontraktu",
        "Od tego zdekodowanego z udowodnionego liścia konta"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Żeby udowodnić saldo tokenów posiadacza, przekazujesz jego adres jako klucz storage. Co pójdzie nie tak?",
      options: [
        "Nic, bo węzeł dopełni adres i i tak znajdzie wpis",
        "Dowód się nie uda, bo klucze muszą mieć 20 bajtów",
        "Pytasz o jakiś inny slot, a nie o wpis mappingu",
        "Węzeł odrzuci każdy klucz, który nie jest zadeklarowanym slotem"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego porównanie dopełnionego 32-bajtowego słowa ze zdekodowanym liściem zawodzi prawie przy każdym niezerowym slocie?",
      options: [
        "Liść zawiera RLP wartości bez zer wiodących",
        "Liść przechowuje hash keccak-256 wartości, a nie samą wartość",
        "Liść przechowuje wartość w little-endian, a nie w big-endian",
        "Liść dopełnia wartość do 64 bajtów zamiast do 32"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym odczyt wartości ze storageProof bez przejścia dowodu różni się od zwykłego wywołania eth_getStorageAt?",
      options: [
        "Pole value jest podpisane przez węzeł, a wynik eth_getStorageAt nie",
        "Pole value zostaje za ciebie sprawdzone względem storageHash",
        "eth_getStorageAt czyta z cache, a pole value z trie",
        "Pod względem zaufania niczym; w każdym przypadku ufa się węzłowi"
      ],
      answer: 3
    }
  ],
  "inclusion-proof": [
    {
      kind: "detail",
      question: "Co generalized index wnosi do dowodu SSZ?",
      options: [
        "To hash liścia, od którego zaczyna się weryfikacja",
        "Wskazuje pozycję liścia, więc znana jest strona każdego sąsiada",
        "Wybiera funkcję hashującą dla każdego poziomu drzewa",
        "To głębokość drzewa, która wyznacza rozmiar tablicy gałęzi"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego dowód Merkle-Patricia jest większy niż binarny dowód Merkle dla tej samej liczby elementów?",
      options: [
        "Jego klucze są dłuższe, bo najpierw się je hashuje",
        "Powtarza korzeń na każdym poziomie do sprawdzenia",
        "Każdy branch node niesie wszystkie szesnaście referencji",
        "Kodowanie RLP podwaja rozmiar każdego hasha w środku"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Weryfikujesz, że transakcja jest włączona pod transactionsRoot bloku. Co nadal pozostaje nieudowodnione?",
      options: [
        "Że bajty transakcji zgadzają się z tym, co obejmuje korzeń",
        "Że transakcja leży pod indeksem, po którym prowadzi ścieżka",
        "Że element hashuje się do korzenia przyjętego na starcie",
        "Że blok jest w łańcuchu kanonicznym"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Co odróżnia dowód SSZ warstwy konsensusu od dowodu trie warstwy wykonawczej?",
      options: [
        "keccak na samych sąsiadach kontra SHA-256 na całych node'ach RLP",
        "SHA-256 na samych sąsiadach kontra keccak na całych node'ach RLP",
        "Szesnaście dzieci na gałąź w SSZ kontra dwoje w trie",
        "Hashowane klucze w SSZ kontra niehashowane klucze pozycyjne w trie"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Chcesz pokazać, że pole w stanie beacon jest puste. Co może ustalić dowód SSZ?",
      options: [
        "Że pola nie ma, dzięki pustej pozycji w gałęzi",
        "Że pole ma konkretną wartość, na przykład zero",
        "Że zapisana ścieżka pola rozchodzi się z jego kluczem",
        "Nic, bo drzewa SSZ nie potrafią dowodzić pojedynczych pól"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Na czym opiera się bezpieczeństwo dowodu włączenia?",
      options: [
        "Na podpisie endpointu, który go dostarczył",
        "Na finalności bloku, z którego pochodzi korzeń",
        "Na odporności funkcji hashującej na kolizje",
        "Na liczbie hashy sąsiadów, które zawiera"
      ],
      answer: 2
    }
  ],
  "receipt-proof": [
    {
      kind: "detail",
      question: "Co jest kluczem w trie transakcji i w trie receiptów?",
      options: [
        "keccak256 z hasha transakcji",
        "Kodowanie RLP indeksu wpisu w bloku",
        "Sam hash transakcji, bez hashowania",
        "keccak256 z numeru bloku sklejonego z indeksem"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego odbudowa trie receiptów z danych z niezaufanego endpointu jest bezpieczna?",
      options: [
        "Receipty podpisuje proposer, więc nie da się ich zmienić",
        "Biblioteka po stronie klienta ponownie wykonuje blok, żeby sprawdzić każdy receipt",
        "Nie jest bezpieczna; receipty muszą pochodzić z zaufanego węzła",
        "Każda zmiana zmienia odbudowany korzeń i nie przejdzie sprawdzenia z nagłówkiem"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Trzeba udowodnić kontraktowi w innym łańcuchu, że konkretny log został wyemitowany. Jaki dowód należy zbudować?",
      options: [
        "Dowód storage względem storageHash kontraktu, który go wyemitował",
        "Dowód konta kontraktu emitującego względem stateRoot",
        "Dowód receiptu względem receiptsRoot, a potem odczyt logu",
        "Dowód logsBloom względem filtra Blooma w nagłówku"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Odbudowujesz trie receiptów bloku, ale każdy receipt kodujesz jako zwykłe RLP. Co się stanie?",
      options: [
        "Korzeń się zgadza, bo trie ignoruje bajt typu",
        "Korzeń się nie zgadza w każdym bloku z transakcją typowaną",
        "Korzeń się nie zgadza tylko w blokach z transakcjami typu blob",
        "Trie odrzuca wpisy, bo klucze są błędne"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym logsBloom różni się od dowodu receiptu, gdy trzeba wykazać, że log istnieje?",
      options: [
        "Bloom jest podpisany przez proposera, a dowód nie",
        "Bloom obejmuje sfinalizowane bloki, a dowód tylko head",
        "Bloom jest dokładny, ale zapisuje tylko adresy logów",
        "Bloom może dawać fałszywe trafienia i sam nic nie dowodzi"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Potrzebny jest dowód receiptu, a endpoint oferuje eth_getProof. Co faktycznie trzeba zrobić?",
      options: [
        "Pobrać wszystkie receipty bloku i odbudować trie",
        "Wywołać eth_getProof z indeksem receiptu jako kluczem",
        "Wywołać eth_getTransactionReceipt z ustawioną flagą proof",
        "Poprosić Beacon API o gałąź SSZ dla tego receiptu"
      ],
      answer: 0
    }
  ],
  "trusted-header": [
    {
      kind: "cause",
      question: "Dlaczego wzięcie state root z odpowiedzi z dowodem przekreśla sens weryfikacji?",
      options: [
        "Każdy może sfabrykować nagłówek z pasującym trie",
        "State root w odpowiedzi z dowodem przychodzi obcięty",
        "Dodaje round trip, przez który sprawdzenie traci sens",
        "Dowód wtedy nie przechodzi, więc błąd sam się koryguje"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co daje kryptograficzny argument za kanonicznością nagłówka, a nie tylko heurystykę?",
      options: [
        "Trzech niezależnych providerów zwracających ten sam hash bloku",
        "Podpisy sync committee sprawdzone przez lekkiego klienta",
        "Węzeł odpowiadający z requireCanonical ustawionym na true",
        "Nagłówek połączony przez parentHash z checkpointem"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Weryfikujesz dowód względem kanonicznego nagłówka sprzed dwóch lat. Co jest złego w działaniu na jego podstawie dzisiaj?",
      options: [
        "Dowody kryptograficznie wygasają po okresie finalności",
        "Tak stare nagłówki nie mają pola stateRoot do sprawdzenia",
        "Nic; kanoniczny nagłówek pozostaje kanoniczny na zawsze",
        "Dowodzi tego, co było prawdą wtedy; wartość mogła się zmienić"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Jakie jest minimalne sprawdzenie każdego otrzymanego nagłówka?",
      options: [
        "Jego parentHash jest równy hashowi najnowszego bloku",
        "Jego stateRoot zgadza się z tym z odpowiedzi z dowodem",
        "keccak256 z jego RLP równa się deklarowanemu hashowi bloku",
        "Jego timestamp różni się od obecnego czasu o mniej niż dwanaście sekund"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Porównujesz hashe bloków z dwóch URL-i RPC, za którymi stoi ten sam provider upstream. Co to daje?",
      options: [
        "Dowód, że blok jest w łańcuchu kanonicznym",
        "Heurystykę na tyle mocną, żeby złapać jednego kłamcę",
        "Dowód równoważny podpisowi sync committee",
        "Zgodność, za którą nie stoi żadna niezależność"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego przypięty checkpoint musi być świeży, a nie sprzed lat?",
      options: [
        "Checkpointy wygasają, gdy ich epoka wypada z Beacon API",
        "Stare klucze mogą zbudować od niego długi, spójny łańcuch",
        "Stare hashe bloków usuwa pruning, więc nie da się ich sprawdzić",
        "Powiązania parentHash zrywają się przy każdym hard forku po checkpoincie"
      ],
      answer: 1
    }
  ],
  "consensus-proof": [
    {
      kind: "cause",
      question: "Jak lekki klient poznaje następny sync committee, nie ufając serwerowi?",
      options: [
        "Pyta Beacon API o zbiór walidatorów i bierze pierwszych 512",
        "Każda aktualizacja niesie go z gałęzią SSZ do poświadczonego stanu",
        "Wyprowadza komitet deterministycznie z numeru bloku",
        "Nie może; operator musi go co okres konfigurować ręcznie"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Dlaczego dowód konsensusu nie zastępuje dowodu stanu?",
      options: [
        "Obejmuje tylko sfinalizowane bloki, a dowody stanu także head",
        "Używa SHA-256, które nie może być commitmentem do sald kont",
        "Pokazuje, który nagłówek jest kanoniczny, a nie co jest na koncie",
        "Dowodzi stanu kont, ale nie receiptów ani logów"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co umożliwia EIP-4788 w warstwie wykonawczej?",
      options: [
        "Kontrakty mogą wywoływać Beacon API przez precompile",
        "Klienci wykonawczy mogą finalizować bloki bez beacon node",
        "Lekcy klienci mogą przestać śledzić sync committee",
        "Kontrakty mogą sprawdzać dowody SSZ o stanie konsensusu"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Lekki klient ma kanoniczny nagłówek beacon i chce sprawdzić odpowiedź eth_getProof. Czego jeszcze potrzebuje?",
      options: [
        "Gałęzi SSZ do state_root w nagłówku execution payload",
        "Niczego; state_root nagłówka beacon to ten wykonawczy",
        "Drugiego podpisu sync committee nad samym kontem",
        "JWT klienta wykonawczego, żeby odpytać Engine API"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jaki jest argument bezpieczeństwa za przyjęciem nagłówka na podstawie podpisu sync committee?",
      options: [
        "Slashing co najmniej jednej trzeciej całego stakowanego ETH",
        "Uczciwa większość w próbie 512 walidatorów",
        "Własny podpis proposera nad nagłówkiem",
        "Zgodność peerów lekkiego klienta w sieci"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Lekki klient robi bootstrap z korzenia podanego przez ten sam serwer, który serwuje mu aktualizacje. Co z tego wynika?",
      options: [
        "Niezweryfikowany jest tylko pierwszy okres, kolejne są w porządku",
        "Klient odrzuca bootstrap jako zapętlony i się zatrzymuje",
        "Nic, bo każda aktualizacja dowodzi się od zera",
        "Cały łańcuch zaufania sprowadza się do tego jednego serwera"
      ],
      answer: 3
    }
  ],
  "execution-trace": [
    {
      kind: "cause",
      question: "Dlaczego trace wykonania nie jest dowodem tego, co się stało?",
      options: [
        "Brakuje w nim gasUsed, którego weryfikator potrzebuje, żeby go przeliczyć",
        "Istnieje tylko dla transakcji pending, a nie dla tych już w bloku",
        "Nic w nagłówku nie zawiera do niego commitmentu, więc żaden root go nie sprawdzi",
        "Węzeł podpisuje go kluczem, którego wywołujący nie może zweryfikować"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Czego brakuje w wyniku prestateTracer, a co musi zawierać witness dla weryfikatora stateless?",
      options: [
        "Wartości kont i slotów, które transakcja odczytała",
        "Węzłów trie, które dowodzą każdej wartości względem state root",
        "Drzewa wywołań, które pokazuje, która ramka odczytała dane konto lub slot",
        "Gasu zużytego przez każdą ramkę, żeby weryfikator mógł go przeliczyć"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Indekser potrzebuje wewnętrznych transferów ETH dla adresu. Dlaczego nie może ich wziąć z logów?",
      options: [
        "Logi z wywołań wewnętrznych są trzymane pod osobnym rootem",
        "Filtry eth_getLogs nie potrafią dopasować adresu zerowego",
        "Transfery wewnętrzne trafiają do logów tylko przy revercie wywołania",
        "Zwykłe wywołanie przenoszące wartość nie emituje żadnego logu"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "debug_traceTransaction z domyślnym struct loggerem zostaje uruchomione na dużej transakcji. Czego się spodziewać?",
      options: [
        "Zwartego drzewa wywołań, bo domyślny jest callTracer",
        "Setek megabajtów wyniku i często timeoutu",
        "Listy kont i slotów, które transakcja odczytała",
        "Błędu, bo struct logger wymaga węzła archiwalnego"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym wynik trace w stylu Parity różni się od wyniku callTracer z Geth?",
      options: [
        "trace zwraca drzewo; callTracer zwraca płaską listę akcji",
        "trace jest podpisany przez węzeł; wynik callTracer nie jest podpisany",
        "trace to płaska lista akcji; callTracer zwraca drzewo",
        "trace obejmuje tylko wywołania z revertem; callTracer obejmuje wszystkie"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Dwa węzły zwracają różne trace'y dla tej samej transakcji. Jak ustalić, który jest prawidłowy?",
      options: [
        "Samodzielnie wykonać ją ponownie na tym samym stanie wyjściowym",
        "Zahashować każdy trace i porównać wynik z receiptsRoot",
        "Zaufać węzłowi, którego łańcuch ma późniejszy blok finalized",
        "Sprawdzić podpis, który każdy węzeł dołączył do swojego trace"
      ],
      answer: 0
    }
  ],
  "stateless-ethereum": [
    {
      kind: "cause",
      question: "Dlaczego przy obecnym trie stanu witnessy są niepraktycznie duże?",
      options: [
        "Wartości kont są zapisywane bez kompresji jako 32-bajtowe słowa",
        "Każdy branch node na ścieżce niesie szesnaście 32-bajtowych referencji",
        "Trie trzyma każdą historyczną wartość obok bieżącej",
        "Hashowanie kluczy podwaja głębokość każdej ścieżki"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Jaki jest obecny status drzew Verkle w Ethereum?",
      options: [
        "Aktywowane na mainnecie w ramach aktualizacji Pectra",
        "Zaplanowane na następną aktualizację sieci, z opublikowaną datą",
        "Prototypowane, a w 2025 roku odłożone na rzecz binarnych drzew stanu",
        "Porzucone, zanim powstała jakakolwiek specyfikacja"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Którą metodę RPC wymiana drzewa stanu zakłóciłaby najbardziej?",
      options: [
        "eth_getBalance, której wartość zależy od kształtu drzewa",
        "eth_getProof, której wynik to tablice trie node'ów w RLP",
        "eth_call, która przechodzi po trie podczas wykonania",
        "eth_blockNumber, która wynika ze state root"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co odróżnia walidatora stateless od lekkiego klienta?",
      options: [
        "Śledzi nagłówki sync committee; lekki klient wykonuje bloki",
        "Przechowuje cały stan; lekki klient tylko niedawny stan",
        "Wykonuje bloki z witnessa; lekki klient nie wykonuje żadnych",
        "Potrzebuje węzła archiwalnego; lekkiemu klientowi wystarcza pełny węzeł"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Weryfikator twojego bridge'a sam liczy ścieżki w drzewie zamiast pytać węzeł. Co poza formatem dowodu psuje się przy nowym drzewie stanu?",
      options: [
        "Nazwy pól JSON, które zwraca eth_getBalance",
        "Chain ID, który przypina dla ochrony przed replay",
        "Numery bloków, które czyta z każdego nagłówka",
        "Mapowanie numeru slotu na pozycję w drzewie"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Zespół oczekuje, że wykonanie stateless pozwoli mu wyłączyć węzeł archiwalny. Dlaczego to oczekiwanie jest błędne?",
      options: [
        "Witnessy obejmują stan, którego dotyka blok, a nie historię",
        "Klienci stateless nadal muszą przechowywać każdy dawny state root",
        "Witnessy są ważne tylko dla sfinalizowanych bloków",
        "To węzły archiwalne generują witness każdego bloku"
      ],
      answer: 0
    }
  ],
  "verified-rpc": [
    {
      kind: "detail",
      question: "Jakie jest jedyne zaufane wejście, którego potrzebuje proxy weryfikujące oparte na lekkim kliencie?",
      options: [
        "Klucz API do providera wykonawczego, którego odpytuje",
        "Świeży sfinalizowany block root, od którego zaczyna bootstrap",
        "Chain ID sieci, którą śledzi",
        "Klucze publiczne zbioru walidatorów, podane ręcznie"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego eth_getLogs po zakresie bloków nie da się zweryfikować tak jak eth_getBalance?",
      options: [
        "Logów nie obejmuje commitmentem żaden korzeń",
        "Zapytania o zakresy bloków są poza specyfikacją JSON-RPC",
        "Wymagałoby to odbudowy trie receiptów dla każdego bloku",
        "Lekki klient może pobierać tylko jeden nagłówek naraz"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Dwóch niezależnych providerów zwraca ten sam hash bloku dla danej wysokości. Co to ustaliło?",
      options: [
        "Że blok jest kanoniczny, bo wynika to ze zgodności",
        "Że blok osiągnął sfinalizowany checkpoint",
        "Że każdemu z providerów można teraz ufać przy dowodach",
        "Heurystykę przeciw pojedynczemu kłamcy i nic więcej"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Proxy weryfikujące przekazuje nieobsługiwaną metodę bez zmian, a aplikacja traktuje odpowiedź jako zweryfikowaną. Jaki jest skutek?",
      options: [
        "Proxy zweryfikuje ją później, gdy przyjdzie następny nagłówek",
        "Provider ją odrzuca, bo proxy usunęło jego klucz",
        "Dane bez weryfikacji udające zweryfikowane, gorsze niż brak proxy",
        "Odpowiedź weryfikują zamiast tego peery lekkiego klienta"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym w proxy weryfikującym różni się sprawdzanie eth_getBalance od sprawdzania hasha bloku?",
      options: [
        "Saldo to porównanie; hash wymaga eth_getProof i przejścia ścieżki",
        "Saldo wymaga eth_getProof i przejścia ścieżki; hash to porównanie",
        "Saldo wymaga podpisu sync committee; hash nie wymaga żadnego",
        "Saldo jest przekazywane dalej; hash jest wykonywany ponownie lokalnie"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Proxy chce zweryfikować wynik eth_call, zamiast go przepuścić. Czego by to wymagało?",
      options: [
        "Samego eth_getProof dla kodu wywoływanego kontraktu",
        "Podpisu sync committee nad zwróconymi danymi",
        "Ponownego wykonania wywołania lokalnie na udowodnionym stanie",
        "Dowodu receiptu dla wyniku wywołania względem receiptsRoot"
      ],
      answer: 2
    }
  ],
  witness: [
    {
      kind: "scenario",
      question: "Prover dostaje wynik prestateTracer dla bloku i na jego podstawie ponownie wykonuje blok. Co udane wykonanie mówi mu o tych wartościach wejściowych?",
      options: [
        "Że zgadzają się ze state root bloku nadrzędnego, z którego czytał tracer",
        "Że są kompletne, bo tracer dołącza każdy nagłówek",
        "Nic ponad słowo węzła, który uruchomił tracer",
        "Że są ostateczne, bo tracery działają tylko na sfinalizowanych blokach"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co oprócz trie node'ów i kodu kontraktów zawiera odpowiedź debug_executionWitness, żeby weryfikator mógł sprawdzić wyniki BLOCKHASH?",
      options: [
        "Nagłówki przodków połączone przez parentHash",
        "Listę hashy bloków podpisaną przez serwujący węzeł",
        "Korzenie bloków beacon z ostatnich 256 slotów",
        "Receipty każdego bloku, do którego sięga BLOCKHASH"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego witness Merkle-Patricia jest dużo większy niż wartości, które niesie?",
      options: [
        "Każda wartość powtarza się raz dla każdej transakcji, która ją czyta",
        "Każdy node jest wysyłany dwa razy, raz jako RLP i raz jako JSON",
        "Każdy dowód konta musi zawierać całe trie storage tego konta",
        "Każdy poziom ścieżki niesie branch node z maksymalnie szesnastoma hashami"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Wywołujesz debug_executionWitness dla bloku sprzed dwóch lat na pruned node. Czego się spodziewać?",
      options: [
        "Witnessa odbudowanego z receiptów, które pruned node trzyma dla każdego bloku",
        "Mniejszego witnessa, bo starsze bloki dotykały mniej kont",
        "Błędu, bo węzeł nie ma już stanu bloku nadrzędnego tego bloku",
        "Witnessa z samymi nagłówkami, bo dla starych bloków stan jest pomijany"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym eth_getProof różni się od debug_executionWitness jako źródło danych do ponownego wykonania bloku?",
      options: [
        "Zwraca niezweryfikowane wartości, a metoda witness zwraca do nich dowody",
        "Jest weryfikowalny dla każdego klucza, ale nie wie, których potrzebuje blok",
        "Obejmuje cały blok naraz, a witness tylko jedno konto",
        "Zawiera kod kontraktów, a metoda witness zwraca tylko hashe"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Weryfikator poprawnie hashuje każdy node witnessa, ale nagłówek bloku nadrzędnego bierze z tej samej odpowiedzi. Komu tak naprawdę ufa?",
      options: [
        "Serwerowi, który ją wysłał, bo zmyślony korzeń też się weryfikuje",
        "Nikomu, bo hashowanie każdego node'a już dowodzi kanoniczności",
        "Sync committee, który podpisuje każdy execution witness",
        "Builderowi bloku, który zapisuje commitment do witnessa w nagłówku"
      ],
      answer: 0
    }
  ],
  "verkle-tree": [
    {
      kind: "detail",
      question: "Czym według EIP-6800 rodzic w drzewie Verkle tworzy commitment do swoich 256 dzieci?",
      options: [
        "Hashem keccak-256 ze sklejonych referencji do dzieci",
        "Vector commitmentem Pedersena na krzywej Bandersnatch",
        "Korzeniem Merkle po SHA-256 z dzieci, tak jak w SSZ",
        "Commitmentem KZG, który używa trusted setupu blobów"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego dowody Verkle dają mniejsze witnessy niż dowody w trie hexary?",
      options: [
        "Wartości są kompresowane przez RLP przed utworzeniem commitmentu",
        "Dowody obejmują tylko konta, a storage zostaje poza witnessem",
        "Drzewo używa szybszego hasha, więc dołącza się mniej elementów",
        "Otwarcie dowodzi pozycji bez dołączania danych sąsiednich gałęzi"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Slajd z roadmapą przedstawia drzewa Verkle jako następną aktualizację drzewa stanu Ethereum. Jaki jest faktyczny status w 2026 roku?",
      options: [
        "Odłożone: EIP mają status Stagnant, a kierunkiem jest drzewo binarne",
        "Zaplanowane na Glamsterdam, z aktywacją na Sepolii w październiku",
        "Działają na mainnecie od Pectra, a dowody zwraca eth_getProof",
        "Zaplanowane na Hegotá, w oczekiwaniu na ostateczny wybór krzywej"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym drzewo binarne z EIP-7864 różni się od projektu Verkle, na którym bazuje?",
      options: [
        "Zachowuje osobne trie storage dla każdego kontraktu, w przeciwieństwie do Verkle",
        "Zachowuje kodowanie RLP elementów drzewa, żeby eth_getProof się nie zmienił",
        "Używa hashy zamiast vector commitmentów na krzywych eliptycznych",
        "Zachowuje szerokość 256, ale zamienia Pedersena na commitmenty KZG"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Co się dzieje w nakładce z EIP-7612, gdy blok odczytuje konto, którego nikt nie zapisywał od forka?",
      options: [
        "Odczyt kończy się błędem, dopóki konwersja nie przeniesie tego konta",
        "Odczyt nie znajduje konta w drzewie Verkle i sięga do zamrożonego trie",
        "Odczyt zwraca pustą wartość, bo stare trie usunięto w momencie forka",
        "Odczyt kopiuje cały storage tego konta do nowego drzewa"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co projekt Verkle potrafi odróżnić, a obecne Merkle-Patricia Trie nie?",
      options: [
        "Konto kontraktu od konta EOA",
        "Wartość sfinalizowaną od zapisanej w bloku pending",
        "Slot storage od fragmentu kodu o tym samym kluczu",
        "Zapisane zero od pozycji nigdy niezapisanej"
      ],
      answer: 3
    }
  ],
  "exclusion-proof": [
    {
      kind: "detail",
      question: "Które z tych zakończeń przejścia po trie dowodzi, że klucza nie ma?",
      options: [
        "Branch node, którego siedemnaste pole wartości jest na tej głębokości puste",
        "Liść, którego wartość dekoduje się do pustego ciągu RLP 0x80",
        "Extension node, którego fragment nie jest prefiksem reszty klucza",
        "Ostatni node, którego kodowanie jest krótsze niż 32 bajty"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Przejście weryfikatora dla slotu dochodzi do branch node'a, w którym dziecko dla następnego nibble'a jest hashem, a w dowodzie nie ma już node'ów. Jak sklasyfikować wynik?",
      options: [
        "Jako niekompletny dowód, bo wskazane jest prawdziwe dziecko",
        "Jako dowód braku, bo ścieżka skończyła się branch node'em",
        "Jako dowód, że slot zawiera zero, bo nie podano liścia",
        "Jako poprawny dowód wartości przechowywanej przez sam branch node"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Aplikacja uznaje, że adres istnieje, gdy eth_getProof zwraca niezerowe codeHash i storageHash. Co pójdzie nie tak?",
      options: [
        "Geth zwraca zerowe hashe dla każdego konta bez kodu kontraktu",
        "Besu i Reth zwracają puste stałe także dla kont nieistniejących",
        "Te hashe zmieniają się co blok, więc istnienie przeskakuje między wywołaniami",
        "Niezerowe hashe mają tylko kontrakty, więc każde konto EOA wygląda na nieistniejące"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Dla klucza storage istniejącego konta Geth odpowiada value 0x0 z pustą tablicą proof. Kiedy to poprawny dowód, że slot nie jest ustawiony?",
      options: [
        "Gdy numer slotu jest mniejszy niż 64 i slot leży w nagłówku konta",
        "Gdy blok jest sfinalizowany, a jego stare trie node'y usunął pruning",
        "Gdy storage root z udowodnionego liścia konta to korzeń pustego trie",
        "Gdy codeHash konta jest równy hashowi pustego kodu"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego dowód storage nie odróżni slotu, do którego nigdy nic nie zapisano, od slotu wyzerowanego?",
      options: [
        "Wartości zerowe są przechowywane, ale ich node'y dowodu pruning usuwa wcześnie",
        "eth_getProof pomija dowód dla każdego slotu o wartości zero",
        "Te liście mają ten sam hash, bo RLP koduje zero jako bajt 0x80",
        "Zapis zera usuwa liść slotu, więc tak czy inaczej liścia nie ma"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym weryfikacja dowodu nieistnienia różni się od weryfikacji dowodu włączenia w tym samym trie?",
      options: [
        "Różni się tylko ostatnie sprawdzenie: ostatni node musi pokazać lukę",
        "Dla pustych pozycji używa innej funkcji hashującej",
        "Zaczyna od liścia i hashuje w górę, w stronę korzenia",
        "Nie potrzebuje zaufanego korzenia, bo braku nie da się sfałszować"
      ],
      answer: 0
    }
  ],
  "hex-prefix-encoding": [
    {
      kind: "detail",
      question: "Element ścieżki dwuelementowego trie node'a zaczyna się od bajtu 0x3a. Co to mówi weryfikatorowi?",
      options: [
        "Extension node, nieparzysta długość, „a” to pierwszy nibble ścieżki",
        "Liść, nieparzysta długość, „a” to pierwszy nibble ścieżki",
        "Liść, parzysta długość, a nibble „a” jest tylko paddingiem",
        "Extension node, parzysta długość, ścieżka zaczyna się od 3"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Po co liściom i extension node'om w ogóle flaga?",
      options: [
        "Bez niej RLP nie zakoduje ciągów dłuższych niż 55 bajtów",
        "Hash keccak-256 node'a musi zaczynać się od znacznika typu",
        "Branch node'y znajdują dzięki niej swoje siedemnaste pole wartości",
        "To dwuelementowe listy, więc nic innego nie odróżni wartości od dziecka"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Jak kodowanie hex-prefix ma się do ciągów hex z prefiksem 0x w JSON-RPC?",
      options: [
        "To ten sam format, stosowany do kluczy trie zamiast do wartości",
        "To hex z JSON-RPC, z którego usunięto wiodące zerowe nibble'e",
        "Nie ma z nimi związku: to binarna flaga w trie node'ach, nie tekst",
        "To hex z JSON-RPC z dodatkowym 0x, które oznacza nieparzystą długość"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Element ścieżki liścia ma 29 bajtów. Co to mówi o liczbie nibble'i?",
      options: [
        "To 58 nibble'i, po dwa na bajt, bez flagi",
        "To 56 albo 57, i tylko flaga mówi, ile dokładnie",
        "To 57 nibble'i, bo ścieżki liści są nieparzyste",
        "To 56 nibble'i, bo pierwszy bajt jest paddingiem"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Weryfikator odrzuca młodszy nibble pierwszego bajtu każdej ścieżki. Które dowody odczyta źle?",
      options: [
        "Te ze ścieżką liścia albo extension node'a o nieparzystej długości",
        "Tylko dowody storage, bo w nich klucze slotów nie są hashowane",
        "Tylko dowody, których node'y są krótsze niż 32 bajty",
        "Żadne, bo ten nibble to zawsze zero paddingu"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Po siedmiu branch node'ach liść w dowodzie konta dekoduje się do ścieżki z 57 nibble'i. Co weryfikator musi teraz sprawdzić?",
      options: [
        "Czy hash keccak-256 ścieżki jest równy adresowi konta",
        "Czy ścieżka jest krótsza niż przebyta już głębokość",
        "Czy nibble flagi pasuje do pola wartości branch node'a",
        "Czy te 57 nibble'i to dokładnie niezużyta końcówka klucza"
      ],
      answer: 3
    }
  ],
  "generalized-index": [
    {
      kind: "detail",
      question: "Które node'y są w numeracji generalized index w SSZ dziećmi node'a 26?",
      options: ["Node'y 27 i 28", "Node'y 13 i 14", "Node'y 52 i 53", "Node'y 51 i 52"],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Lekki klient ma na sztywno FINALIZED_ROOT_GINDEX równe 105 i działa dalej po forku Electra. Co się dzieje?",
      options: [
        "Gałęzie finalności przestają się weryfikować, bo korzeń leży teraz pod 169",
        "Nic, bo generalized index jest ustalony od bloku genesis",
        "Weryfikuje aktualizacje, ale tylko te podpisane przez stary komitet",
        "Przyjmuje aktualizacje, ale z finalnością opóźnioną o jeden okres"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego fork Electra zmienił generalized index pola finalized_checkpoint.root?",
      options: [
        "Kontener Checkpoint dostał dodatkowe pole slot",
        "Stan beacon przekroczył 32 pola, co dodało poziom drzewa",
        "SSZ przełączyło stan beacon na inną funkcję hashującą",
        "Pola zmieniły kolejność, tak że nowe trafiły na początek"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Weryfikator łączy zagnieżdżone indeksy 52 i 3, mnożąc je. Co idzie nie tak?",
      options: [
        "Nic, bo mnożenie i konkatenacja dają tu ten sam wynik",
        "Trafia we właściwy node, ale hashuje go po złej stronie",
        "Jego gałąź wychodzi o jeden hash za długa, żeby się zweryfikować",
        "Celuje w node 156 zamiast 105, czyli w inny node"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym z punktu widzenia weryfikatora dowodów ProgressiveContainer z EIP-7688 różni się od dzisiejszego Container w SSZ?",
      options: [
        "Nowe pola nie zmieniają generalized index pól już istniejących",
        "Hashuje keccak-256, żeby narzędzia warstwy wykonawczej mogły go weryfikować",
        "Rezygnuje z merkleizacji, więc pola dowodzi się offsetem bajtowym",
        "Dopełnia każdy kontener do 64 liści, niezależnie od zawartości"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego weryfikator powinien brać głębokość gałęzi z generalized index, a nie z liczby dostarczonych hashy?",
      options: [
        "Długości gałęzi zmieniają się z liczbą walidatorów w każdej epoce",
        "Provery dopełniają każdą gałąź do 64 hashy dla wyrównania",
        "Node wewnętrzny ma 32 bajty jak liść, więc odróżnia go głębokość",
        "Gałęzie SSZ przychodzą posortowane po hashu, więc ich długość jest niewiarygodna"
      ],
      answer: 2
    }
  ],
  "light-client-update": [
    {
      kind: "scenario",
      question: "Lekki klient robi bootstrap z block root zwróconego przez ten sam beacon node, który serwuje mu aktualizacje. Co w ten sposób zweryfikował?",
      options: [
        "Że łańcuch jest kanoniczny od tego korzenia w przód",
        "Że korzeń jest sfinalizowany, bo bootstrap tego wymaga",
        "Że bieżący komitet został wybrany uczciwie",
        "Że odpowiedzi węzła są zgodne między sobą"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Które pole LightClientHeader od forka Capella zawiera korzeń, do którego musi się zhashować odpowiedź eth_getProof?",
      options: [
        "beacon.state_root, czyli korzeń stanu beacon",
        "execution.state_root, udowodniony względem body root",
        "beacon.body_root, który jest commitmentem do stanu kont",
        "Ostatni hash z finality_branch, czyli state root"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego LightClientUpdate zawiera next_sync_committee razem z gałęzią Merkle?",
      options: [
        "Żeby klient poznał następnych podpisujących bez ufania serwerowi",
        "Żeby serwer mógł dowieść, że członkowie komitetu podlegają slashingowi",
        "Żeby agregat komitetu dało się zweryfikować bez kluczy BLS",
        "Żeby klient mógł pominąć weryfikację podpisu poświadczonego nagłówka"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym LightClientOptimisticUpdate różni się od LightClientFinalityUpdate?",
      options: [
        "Podpisuje go następny komitet zamiast bieżącego",
        "Zawiera następny komitet, którego aktualizacje finalności nie mają",
        "Nie ma sfinalizowanego nagłówka ani gałęzi, tylko poświadczony head",
        "Dowodzi stanu wykonawczego, a aktualizacje finalności dowodzą stanu beacon"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Lekki klient, który był offline przez osiem miesięcy, próbuje wznowić pracę od ostatniego zapisanego komitetu. Dlaczego może nie znaleźć niczego do pobrania?",
      options: [
        "Sync committee starszego niż jeden okres nie da się zweryfikować",
        "Aktualizacje znikają z API, gdy ich slot zostanie sfinalizowany",
        "Korzenie bootstrapu są usuwane przy każdej rotacji komitetu",
        "Serwery mają przechowywać aktualizacje z około pięciu miesięcy"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Przychodzi aktualizacja, w której ustawionych jest 300 z 512 bitów sync committee. Co może zmienić w kliencie zgodnym ze specyfikacją?",
      options: [
        "Sfinalizowany nagłówek, ale nie optymistyczny head",
        "Optymistyczny head, ale nie sfinalizowany nagłówek",
        "Nic, bo aktualizacje poniżej 342 bitów są nieważne",
        "Jedno i drugie, bo wystarczy uczestnictwo powyżej połowy"
      ],
      answer: 1
    }
  ],
  "binary-state-tree": [
    {
      kind: "detail",
      question: "Co według wersji EIP-7864 z czerwca 2026 leży pod subindeksem 0 w stemie nagłówka konta?",
      options: [
        "Hash kodu, czyli bytecode'u kontraktu wdrożonego na tym koncie",
        "Slot storage 0 z własnego storage kontraktu tego konta",
        "Pierwszy 31-bajtowy fragment kodu wdrożonego na tym koncie",
        "Wersja, rozmiar kodu, nonce i saldo upakowane razem"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego w EIP-7864 każdy node ma dwoje dzieci, a nie szesnaścioro?",
      options: [
        "Dwoje dzieci pozwala każdemu node'owi zachować obecne kodowanie RLP",
        "Dowód niesie k minus 1 sąsiadów na poziom, a ten koszt jest najmniejszy przy 2",
        "Binarne node'y mogą używać commitmentów na krzywych eliptycznych bez setupu",
        "Przy szesnaściorgu dzieciach stan był za głęboki, by trzymać go na dysku"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Projekt Verkle ustąpił miejsca EIP-7864. Czym przede wszystkim różni się od niego kryptograficznie EIP-7864?",
      options: [
        "Tworzy commitmenty samymi hashami, więc nie opiera się na krzywych eliptycznych",
        "Tworzy commitmenty wektorami Pedersena, więc dowody otwierają wiele dzieci",
        "Tworzy commitmenty samym Keccakiem, więc obecne weryfikatory dalej działają",
        "Tworzy commitmenty wielomianami KZG, więc dowody wymagają trusted setupu"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Zespół bridge'a planuje weryfikować dowody stanu z drzewa binarnego w kontrakcie Solidity, gdy EIP-7864 wejdzie w życie. Na jaką przeszkodę trafi?",
      options: [
        "EVM nie odczyta żadnego storage zapisanego przed zmianą drzewa",
        "Dowody binarne są większe od dowodów hexary dla każdego konta",
        "EVM nie ma precompile'a do hashowania BLAKE3 ani Poseidon2",
        "Nowe drzewo usuwa pole stateRoot z nagłówków bloków"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Gdzie najpierw szuka odczyt stanu w okresie przejściowym z nakładką, na której opiera się EIP-7864?",
      options: [
        "W zamrożonym trie hexary, a potem w nowym drzewie binarnym",
        "W tym drzewie, do którego ostatnio zapisano dane konta",
        "W dwóch drzewach jednocześnie, porównując ich wartości",
        "W nowym drzewie binarnym, a potem w zamrożonym trie hexary"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Klient trzyma płaski stan wyłącznie pod kluczami keccak256 z każdego adresu i slotu. Czego wymaga od niego konwersja z EIP-7748?",
      options: [
        "Pełnej ponownej synchronizacji od genesis według schematu kluczy nowego drzewa",
        "Hasha Pedersena z każdego klucza, zanim trafi on do nowego drzewa",
        "Bazy preimage'ów, która mapuje te hashe z powrotem na surowe klucze",
        "Zaufanego nagłówka dla każdego bloku od aktywacji forka"
      ],
      answer: 2
    }
  ],
  "real-time-proving": [
    {
      kind: "detail",
      question: "Jakie opóźnienie ustala robocza definicja real-time proving według Ethereum Foundation?",
      options: [
        "Najwyżej 12 sekund dla każdego bloku mainnetu, bez wyjątków",
        "Najwyżej 10 sekund dla 99 procent bloków mainnetu",
        "Najwyżej 4 sekundy, żeby dowody przychodziły przed atestacjami",
        "Najwyżej jedna epoka, żeby dowody przychodziły przed finalnością"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Węzeł weryfikujący dostaje dowód, który przechodzi weryfikację kryptograficzną, ale w jego public input successful_validation ma wartość false. Jaki wniosek powinien wyciągnąć?",
      options: [
        "Payload jest poprawny, bo sam dowód zweryfikował się poprawnie",
        "Dowód liczy się jako pozytywny, gdy zgodzi się z nim dowód z drugiego zkVM",
        "Dowód jest źle sformułowany, a nadawcę trzeba odciąć od gossipu",
        "Nie może uznać tego dowodu za świadectwo, że payload jest poprawny"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Skąd program guest w zkVM bierze stan, który czyta, w porównaniu z klientem wykonawczym walidującym blok w zwykły sposób?",
      options: [
        "Dostaje z góry w witnessie każdy trie node, kod i nagłówek",
        "Odpytuje węzeł provera przez JSON-RPC, gdy wykonanie tego potrzebuje",
        "Czyta snapshot pełnego stanu zamontowany w maszynie dowodzącej",
        "Odbudowuje stan, wykonując ponownie cały łańcuch wewnątrz zkVM"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego prover działający w czasie rzeczywistym zwykle uruchamia własnego klienta wykonawczego, zamiast korzystać z hostowanego endpointu RPC?",
      options: [
        "Hostowane endpointy zwracają witnessy, których guest nie zhashuje do korzenia",
        "Hostowane endpointy rzadko udostępniają debug_, a round tripy zjadają budżet",
        "Dowody trzeba podpisać kluczem węzła tego klienta wykonawczego",
        "Hostowane endpointy serwują tylko bloki sfinalizowane, a te są za późno"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co według obecnego tekstu EIP-8025 węzły weryfikujące dowody robią z blokiem?",
      options: [
        "Przestają go wykonywać, gdy zgodzą się trzy dowody z różnych zkVM",
        "Pomijają ponowne wykonanie, gdy tylko wcześniej dotrze poprawny dowód",
        "Nadal wykonują go ponownie, a poprawny dowód to dla nich dodatkowy sygnał",
        "Wykonują go ponownie tylko wtedy, gdy dwa dowody z gossipu są sprzeczne"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Załóżmy, że późniejszy EIP pozwoli walidatorom weryfikować dowody i przestać ponownie wykonywać bloki. Które zadanie nadal wymaga węzłów z pełnym stanem?",
      options: [
        "Sprawdzanie public input każdego dowodu względem otrzymanego payloadu",
        "Podążanie za fork choice i atestowanie head łańcucha",
        "Odpowiadanie na eth_call i inne odczyty dla aplikacji i użytkowników",
        "Weryfikowanie podpisu BLS każdego dowodu wykonania z gossipu"
      ],
      answer: 2
    }
  ]
};
