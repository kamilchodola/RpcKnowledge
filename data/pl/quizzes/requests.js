// Polish checkpoint questions for the Requests lessons, keyed by topic id. Each topic's
// six questions match data/quizzes/requests.js in order, kind, and answer position.
export const quizzes = {
  "eth-block-number": [
    {
      kind: "scenario",
      question: "Węzeł odpowiada na eth_blockNumber wartością bliską heada sieci, a mimo to eth_getBalance na tym samym bloku kończy się błędem. Co się dzieje?",
      options: [
        "Konto nigdy nie było używane, więc nie ma dla niego salda w żadnym bloku",
        "Trwa snap sync: węzeł ma już nagłówki, ale jeszcze nie stan tego bloku",
        "eth_getBalance wymaga węzła archiwalnego, nawet gdy pyta się o head",
        "Węzeł ma źle ustawiony chain ID, więc działają tylko metody bez parametrów"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego dwa kolejne wywołania eth_blockNumber do tego samego węzła mogą za drugim razem zwrócić niższy numer?",
      options: [
        "Węzeł usunął swój najnowszy blok, gdy zapisał już dla niego stan",
        "Finalność cofnęła się, bo walidatorom nie udała się runda atestacji",
        "Reorg zastąpił head konkurencyjną, krótszą gałęzią",
        "Metoda zwraca slot konsensusu, który zaczyna się od nowa w każdej epoce"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym liczba zwracana przez eth_blockNumber różni się od bieżącego slotu warstwy konsensusu?",
      options: [
        "Sloty rosną co 12 sekund, nawet gdy nie powstaje blok, więc wartości się rozjeżdżają",
        "To jeden licznik, przesunięty o stałą ustaloną przy przejściu na Merge",
        "Numer bloku rośnie raz na epokę, a slot raz na każdy nowy blok",
        "Slot liczy każdy blok, a numer bloku tylko bloki sfinalizowane"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Potrzebna jest wysokość najnowszego sfinalizowanego bloku. Jakie żądanie ją zwróci?",
      options: [
        "eth_blockNumber ze stringiem finalized jako jedynym parametrem",
        "eth_blockNumber, a potem odjęcie 64 bloków, czyli dwóch pełnych epok",
        "eth_syncing i odczyt pola highestBlock z obiektu wyniku",
        "eth_getBlockByNumber z tagiem finalized i odczyt pola number"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Jeden backend za load balancerem godzinę temu stracił wszystkich peerów. Co teraz zwraca na nim eth_blockNumber?",
      options: [
        "Ostatnią zaimportowaną wysokość, bez żadnego błędu",
        "Błąd o kodzie -32000 z informacją, że nie ma peerów",
        "null, dopóki węzeł znów się nie połączy i nie wznowi importu",
        "Najwyższą wysokość, jaką peery ogłosiły przed odejściem"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co trafia do pola params żądania eth_blockNumber?",
      options: [
        "Tag bloku latest, który jest też domyślny",
        "Pusta tablica",
        "Boolean wybierający pełne obiekty transakcji",
        "Chain ID zakodowany jako QUANTITY w hex"
      ],
      answer: 1
    }
  ],
  "eth-get-block-by-number": [
    {
      kind: "scenario",
      question: "Tracker heada pobiera latest raz na blok i za każdym razem zapisuje hash. Które sprawdzenie pokazuje, że od poprzedniego odpytania nastąpił reorg?",
      options: [
        "stateRoot nowego bloku jest równy stateRoot jego bloku rodzica",
        "parentHash nowego bloku różni się od hasha zapisanego poprzednio",
        "timestamp nowego bloku wypada ponad 12 sekund po poprzednim",
        "totalDifficulty nowego bloku jest niższe niż wartość zapisana poprzednio"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co zmienia się w odpowiedzi, gdy drugi parametr eth_getBlockByNumber, boolean, zostanie przełączony na true?",
      options: [
        "Każdy wpis transakcji zawiera też jej receipt ze statusem i logami",
        "input każdej transakcji jest dekodowany na nazwane argumenty według ABI",
        "Każdy hash transakcji zostaje zastąpiony pełnym obiektem transakcji",
        "Do bloku dopisywane są transakcje wciąż czekające w mempoolu"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Usługa cache'uje obiekty bloków pod kluczem, którym jest wyłącznie numer bloku. Co reorg robi z tym cache?",
      options: [
        "Wpisy na wysokościach objętych reorgiem opisują teraz bloki niekanoniczne",
        "Węzeł odmawia późniejszych zapytań o te numery, dopóki finalność ich nie dogoni",
        "Nowe kanoniczne bloki dostają nowe numery, więc stare wpisy pozostają aktualne",
        "Wpisy tracą aktualność tylko wtedy, gdy węzeł, który je podał, zdążył je usunąć"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Pełny węzeł zwraca null dla eth_getBlockByNumber na bloku 1 000 000, ale przy headzie odpowiada normalnie. Jak to wyjaśnić?",
      options: [
        "Stare bloki wymagają węzła archiwalnego, bo ich odczyt potrzebuje stanu historycznego",
        "Bloki sprzed Merge można pobrać po hashu, ale nie po numerze",
        "Węzeł zastosował history expiry i nie przechowuje już tego bloku sprzed Merge",
        "Provider dławi zapytania o stare bloki i po przekroczeniu limitu zwraca null"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co niesie pole mixHash w obiekcie bloku po Merge?",
      options: [
        "Skrót mieszania z proof of work, wyzerowany od Merge",
        "Korzeń listy wypłat walidatorów przetworzonych w tym bloku",
        "Root bloku beacon będącego rodzicem, zapisany dla tego slotu",
        "prevRandao, czyli losowość warstwy konsensusu dla slotu"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Po reorgu eth_getBlockByHash nadal zwraca blok dla hasha zapisanego przed reorgiem. Co mówi ten wynik?",
      options: [
        "Blok jest kanoniczny, bo metoda zwraca tylko bloki z głównego łańcucha",
        "Reorg został odwrócony, bo osierocone hashe od razu dają null",
        "Węzeł musi być archiwalny, bo tylko takie przechowują osierocone bloki",
        "Nic o kanoniczności; klienci przechowują też niedawne bloki z bocznych gałęzi"
      ],
      answer: 3
    }
  ],
  "eth-get-block-receipts": [
    {
      kind: "cause",
      question: "Dlaczego dla węzła jedno wywołanie eth_getBlockReceipts jest tańsze niż osobne eth_getTransactionReceipt dla każdej transakcji z tego samego bloku?",
      options: [
        "Pomija ponowne wyliczanie effectiveGasPrice i contractAddress dla każdego receiptu",
        "Receipty są zapisane razem dla bloku, więc jeden odczyt obsłuży każdą transakcję",
        "Czyta receipty z trie stanu, które klient trzyma w cache w pamięci",
        "Zwraca tylko receipty, które wyemitowały logi, co zmniejsza pracę na blok"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Indekser potrzebuje status i gasUsed każdej transakcji w bloku, także tych, które nie wyemitowały logów. Które wywołanie pasuje?",
      options: [
        "eth_getLogs dla tego jednego bloku",
        "eth_getBlockReceipts dla tego bloku",
        "eth_getBlockByNumber z fullTransactions ustawionym na true",
        "eth_getTransactionByHash dla każdego hasha z bloku"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "eth_getBlockReceipts zwraca [] dla jednego bloku i null dla innego. Czym różnią się te dwie odpowiedzi?",
      options: [
        "Pierwszy blok jest pusty; drugiego bloku węzeł w ogóle nigdy nie miał",
        "Pierwszy blok nie jest jeszcze sfinalizowany; drugi wypadł z łańcucha przez reorg",
        "Pierwszy blok ma tylko nieudane transakcje; drugi nie ma żadnych transakcji",
        "Receipty pierwszego bloku usunięto przez pruning; drugi blok jest wciąż pending"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jak szybko sprawdzić, czy tablica z eth_getBlockReceipts obejmuje cały blok?",
      options: [
        "logIndex ostatniego wpisu równa się liczbie transakcji w bloku",
        "Długość tablicy równa się liczbie ustawionych bitów w logsBloom",
        "cumulativeGasUsed ostatniego wpisu równa się gasUsed bloku",
        "Suma wszystkich effectiveGasPrice równa się baseFeePerGas bloku"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Endpoint normalnie odpowiada na eth_getTransactionReceipt, ale na eth_getBlockReceipts zwraca method not found. Jak powinien zareagować kod?",
      options: [
        "Ponowić wywołanie z hashem bloku, jedyną formą identyfikatora, jaką przyjmuje",
        "Uznać backend za pruned node, bo pruned node nie poda receiptów żadnego bloku",
        "Wysłać je ponownie w batchu, bo metoda działa tylko w tej formie",
        "Przejść na receipty pobierane pojedynczo; gateway może jej nie obsługiwać"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Skaner, który idzie blok po bloku, w każdej iteracji wywołuje eth_getBlockReceipts z tagiem latest. Co może pójść nie tak?",
      options: [
        "Kolejne wywołania mogą zwrócić ten sam blok albo pominąć jakiś, zostawiając luki",
        "Receipty dla latest wracają nieposortowane i trzeba je najpierw sortować po hashu",
        "Węzeł odpowiada z bloku pending, którego receipty później się zmieniają",
        "Metoda odrzuca tagi i na każde wywołanie odpowiada błędem invalid params"
      ],
      answer: 0
    }
  ],
  "eth-get-transaction-by-hash": [
    {
      kind: "scenario",
      question: "eth_getTransactionByHash zwraca pełny obiekt, w którym blockHash, blockNumber i transactionIndex mają wartość null. Co to oznacza?",
      options: [
        "Trafiła do bloku, ale węzeł potem usunął ciało bloku przez pruning",
        "Wykonanie skończyło się revertem, więc blok jej nie zapisał",
        "Węzeł ma ją w mempoolu, ale żaden blok jej jeszcze nie zawiera",
        "Hash pasował tylko częściowo, więc węzeł zwrócił zaślepkę"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co eth_getTransactionReceipt mówi o transakcji, która jest już w bloku, a czego nie powie eth_getTransactionByHash?",
      options: [
        "Nonce, którego nadawca dla niej użył",
        "Najwyższą opłatę za jednostkę gasu, jaką oferował nadawca",
        "Czy się powiodła, czy skończyła się revertem",
        "Calldata wysłane do docelowego kontraktu"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Pełny węzeł Geth zwraca null dla hasha transakcji, którą eksplorator bloków pokazuje w bloku sprzed trzech lat. Dlaczego?",
      options: [
        "Reguły konsensusu usuwają transakcje z łańcucha po roku",
        "Stare transakcje można wyszukać tylko po hashu bloku i indeksie",
        "Klient trzyma indeks hashy transakcji tylko dla niedawnych bloków",
        "Wyszukanie hasha transakcji wymaga pełnego stanu węzła archiwalnego"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co zawiera pole gas w obiekcie, który zwraca eth_getTransactionByHash?",
      options: [
        "Limit gasu ustawiony przez nadawcę przy podpisywaniu",
        "Gas zużyty przez transakcję podczas wykonania",
        "Cenę za jednostkę gasu, którą nadawca faktycznie zapłacił",
        "Opłatę w wei, którą nadawca zapłacił za włączenie do bloku"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Zaraz po eth_sendRawTransaction przez providera, który rotuje backendy, eth_getTransactionByHash zwraca null. Co to pokazuje?",
      options: [
        "Transakcję odrzucono, bo jej opłata była niższa niż base fee",
        "Tylko tyle, że backend, który odpowiedział, jej nie widział",
        "Transakcja jest już w bloku, więc opuściła mempool",
        "Węzeł wyrzucił ją jako duplikat nonce czekającego w kolejce"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Transakcja typu 0x3 została pobrana przez eth_getTransactionByHash. Gdzie są jej bloby?",
      options: [
        "W polu input, zakodowane za 4-bajtowym selektorem funkcji",
        "W blobVersionedHashes, które zawiera pełną zawartość blobów",
        "W logach receiptu, które węzeł dołącza po wykonaniu",
        "W warstwie konsensusu; Beacon API udostępnia je około 18 dni"
      ],
      answer: 3
    }
  ],
  "eth-get-transaction-receipt": [
    {
      kind: "scenario",
      question: "Transakcja trafiła do bloku, ale skończyła się revertem. Co zwraca dla niej eth_getTransactionReceipt?",
      options: [
        "null, bo transakcja z revertem jest pomijana w bloku",
        "Błąd JSON-RPC z kodem 3 i powodem revertu",
        "Receipt ze statusem 0x0, zużytym gasem i bez logów",
        "Receipt ze statusem 0x1 i pustą tablicą logów"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Przychodzi receipt transakcji, a kilka sekund później to samo wywołanie zwraca null. Co się stało?",
      options: [
        "Węzeł usunął receipt ze swojego cache w pamięci",
        "Zamiennik z wyższą opłatą przejął ten sam hash transakcji",
        "Blok został sfinalizowany, a jego receipt trafił do cold storage",
        "Reorg usunął z łańcucha blok, który zawierał tę transakcję"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Które pole mówi, ile nadawca faktycznie zapłacił za jednostkę gasu, a nie ile był gotów zapłacić?",
      options: [
        "maxFeePerGas w transakcji",
        "effectiveGasPrice w receipcie",
        "gasUsed w receipcie",
        "baseFeePerGas w nagłówku bloku"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym wynik null różni się od receiptu ze statusem 0x0?",
      options: [
        "null znaczy, że węzeł nie ma jej jeszcze w bloku; 0x0, że wykonała się z revertem",
        "null znaczy, że zrobiła revert przed wykonaniem; 0x0, że zabrakło jej gasu",
        "null znaczy, że mempool ją porzucił; 0x0, że wciąż czeka na włączenie do bloku",
        "null znaczy, że węzeł odrzucił ją przy wysyłaniu; 0x0, że została zastąpiona"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Transakcja została wysłana przez load balancer i przez ten sam load balancer odpytywane jest eth_getTransactionReceipt. Eksplorator już pokazuje ją w bloku, a odpowiedzią jest null. Dlaczego?",
      options: [
        "Receipty są widoczne dopiero wtedy, gdy zawierający je blok jest sfinalizowany",
        "Eksplorator pokazuje transakcje pending jako będące w bloku, dopóki nie przepadną",
        "Backend, który odpowiedział, nie zaimportował jeszcze tego bloku",
        "Receipty są indeksowane po bloku, więc wywołanie wymaga też parametru bloku"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego portfele po pojawieniu się receiptu nadal czekają na potwierdzenia albo na tag finalized?",
      options: [
        "Pola receiptu, takie jak gasUsed, są szacunkami aż do finalizacji bloku",
        "Węzeł ustawia status dopiero, gdy atestujący uznają blok za justified",
        "Reorg wciąż może usunąć blok albo umieścić transakcję w innym bloku",
        "Receipty są najpierw serwowane z mempoolu, a później z magazynu bloków"
      ],
      answer: 2
    }
  ],
  "eth-get-transaction-count": [
    {
      kind: "detail",
      question: "Potrzebny jest nonce, który nie zderzy się z transakcjami czekającymi już w mempoolu tego węzła. Jaki tag bloku trzeba przekazać?",
      options: ["latest", "safe", "pending", "finalized"],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Dwa workery współdzielą jeden klucz do podpisywania, w tej samej chwili odczytują nonce pending i każdy podpisuje transakcję. Co dalej?",
      options: [
        "Transakcje trafiają do bloków w kolejności przybycia, bo mempool przenumerowuje duplikaty",
        "Transakcje mają ten sam nonce, więc do bloku może trafić najwyżej jedna z nich",
        "Transakcje na zawsze zostają w kolejce, bo zdublowany nonce tworzy lukę",
        "Węzeł odmawia drugiego odczytu pending, dopóki pierwsza transakcja nie zostanie wysłana"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Kontrakt został wdrożony w bloku N i sam niczego nie wdrożył. Co zwraca dla niego eth_getTransactionCount na bloku N?",
      options: [
        "0x0, bo kontrakt nigdy nie podpisuje transakcji",
        "null, bo nonce mają tylko konta EOA",
        "Nonce wdrażającego, skopiowany w chwili utworzenia",
        "0x1, bo od EIP-161 nonce kontraktu zaczyna się od jedynki"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Dla tego samego adresu jeden węzeł zwraca 0x1f4 z latest i 0x1f7 z pending. Co oznacza ta różnica?",
      options: [
        "Trzy transakcje nadawcy są już w blokach, ale nie są jeszcze sfinalizowane",
        "Trzy ostatnie transakcje nadawcy zakończyły się revertem i nie zostały policzone",
        "Mempool tego węzła trzyma w kolejce trzy transakcje od tego nadawcy",
        "Od ostatniej transakcji nadawcy włączonej do bloku minęły trzy bloki"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego backend wysyłający serię transakcji powinien prowadzić lokalny licznik nonce, zamiast przed każdą z nich ponownie odczytywać pending?",
      options: [
        "Każdy odczyt pending wymaga zapytania archiwalnego, a providerzy je limitują",
        "Tag pending liczy tylko transakcje w blokach, więc spóźnia się o jeden blok",
        "Mempool mógł jeszcze nie zarejestrować poprzedniej transakcji",
        "Węzły trzymają odpowiedzi pending w cache przez cały slot, więc wartość jest nieaktualna"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Nadawca, podpisując serię transakcji, pomija jedną wartość nonce. Co dzieje się z późniejszymi transakcjami z tego konta?",
      options: [
        "Trafiają do bloków po kolei, a pominięty nonce po prostu nigdy nie zostaje użyty",
        "Węzeł przenumerowuje je, żeby zamknąć lukę, zanim roześle je dalej",
        "Czekają w kolejce, dopóki brakujący nonce nie zostanie uzupełniony albo nie zostaną usunięte",
        "Trafiają do bloków, ale każda kończy się revertem, dopóki luka nie zostanie uzupełniona"
      ],
      answer: 2
    }
  ],
  "eth-get-balance": [
    {
      kind: "scenario",
      question: "eth_getBalance na bloku z zeszłego roku zwraca błąd o brakującym węźle trie (missing trie node). Co to oznacza?",
      options: [
        "W tym bloku konto jeszcze nie istniało, więc nie miało liścia z saldem",
        "Ten węzeł nie ma już stanu tego bloku; węzeł archiwalny odpowie",
        "Blok wypadł później w reorgu, więc jego state root jest nieznany",
        "Adres nie przeszedł walidacji sumy kontrolnej przed wyszukiwaniem"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Saldo konta wzrosło między dwoma blokami, choć żadna transakcja w żadnym z nich go nie dotknęła. Co mogło je zasilić?",
      options: [
        "Transfer ERC-20, który wyemitował do niego event Transfer",
        "eth_call, które inny klient wykonał na tym koncie",
        "Wypłata walidatora przekazana z warstwy konsensusu",
        "Transakcja do niego wciąż czekająca w mempoolu"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co zwraca eth_getBalance dla adresu, który nigdy nie pojawił się w łańcuchu?",
      options: ["null", "0x0", "Błąd mówiący, że konto nie istnieje", "0x, czyli pusta wartość DATA"],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym liczba zwracana przez eth_getBalance różni się od salda USDC w portfelu?",
      options: [
        "USDC jest zapisane w liściu konta obok etheru, w polu tokena",
        "eth_getBalance zwraca też USDC, jeśli dodatkowo poda się adres tokena",
        "USDC jest w storage kontraktu i odczytuje się je przez eth_call do balanceOf",
        "Salda USDC są w logach receiptów, które węzeł sumuje dla każdego konta"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Aplikacja w JavaScripcie dekoduje każdy wynik eth_getBalance przez parseInt do zwykłego typu number. Co idzie nie tak?",
      options: [
        "Zwykłe salda przekraczają 2 do potęgi 53, więc cyfry po cichu przepadają",
        "parseInt odrzuca prefiks 0x, więc każde saldo dekoduje się jako zero",
        "Wynik jest w gwei, więc wartości wychodzą miliard razy za małe",
        "Salda są liczbami ze znakiem, więc duże dekodują się jako ujemne"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego żadna metoda RPC nie zwraca historii salda konta jako listy zmian?",
      options: [
        "Historia sald jest przechowywana tylko w beacon state warstwy konsensusu",
        "Łańcuch przechowuje salda dla każdego bloku, a nie dziennik zmian",
        "Salda zmieniają się tylko przez logi, które obsługuje już eth_getLogs",
        "Historia jest usuwana po 128 blokach, więc żadna metoda nie mogłaby jej zwrócić"
      ],
      answer: 1
    }
  ],
  "eth-get-code": [
    {
      kind: "scenario",
      question: "eth_getCode dla konta zwraca 0xef0100, a po nim dwadzieścia kolejnych bajtów. Co to jest?",
      options: [
        "Proxy, którego adres implementacji jest wpisany wprost w bytecode",
        "Obcięta odpowiedź z węzła, który osiągnął limit rozmiaru odpowiedzi",
        "Delegation designator EIP-7702, który wskazuje kod do wykonania",
        "Pierwsze 23 bajty kontraktu, którego wdrożenie jest wciąż pending"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego pruned node może nie obsłużyć eth_getCode dla starego bloku, chociaż sam bytecode wciąż ma na dysku?",
      options: [
        "Do znalezienia codeHash potrzebny jest liść konta z tego bloku, a tego już nie ma",
        "Bytecode jest usuwany razem z historycznymi receiptami tego bloku",
        "Stary bytecode używa opcode'ów, których obecny klient nie umie już dekodować",
        "Parametr bloku jest dla kodu ignorowany, więc każde stare zapytanie jest odrzucane"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co eth_getCode zwraca dla adresu, który nigdy nie był używany?",
      options: [
        "0x0",
        "null",
        "0x",
        "Błąd informujący, że konto jest nieznane"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Allowlista traktuje jako kontrakt każdy adres, dla którego eth_getCode zwraca niepusty wynik. Co robi źle od Pectra?",
      options: [
        "Kontrakty wdrożone przez CREATE2 zwracają teraz pusty kod",
        "Proxy zwracają teraz kod swojej implementacji, a nie własny",
        "Konta EOA z delegacją EIP-7702 wyglądają teraz jak kontrakty",
        "Kontrakty w trakcie konstrukcji zwracają teraz swój initcode"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym bajty, które zwraca eth_getCode, różnią się od bajtów wysłanych w transakcji wdrażającej kontrakt?",
      options: [
        "Niczym, bo węzeł przechowuje dokładnie to, co wysłał wdrażający",
        "To tylko kod runtime, bez initcode i argumentów konstruktora",
        "Dochodzą do nich argumenty konstruktora, dopisane za kodem runtime",
        "To skompresowana forma, którą przed deasemblacją trzeba rozpakować"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "eth_getCode na upgradowalnym proxy zwraca tylko jego własną logikę przekierowania. Jak znaleźć kontrakt z logiką, do którego proxy teraz przekierowuje?",
      options: [
        "Wywołać eth_getCode ponownie z tagiem bloku pending",
        "Odczytać jego slot implementacji przez eth_getStorageAt",
        "Odczytać codeHash z liścia konta przez eth_getProof",
        "Sprawdzić nonce wdrażającego przez eth_getTransactionCount"
      ],
      answer: 1
    }
  ],
  "eth-get-storage-at": [
    {
      kind: "scenario",
      question: "Kontrakt w Solidity trzyma sekret w zmiennej private. Co powstrzymuje wywołującego RPC przed odczytaniem go przez eth_getStorageAt?",
      options: [
        "Węzeł odmawia odczytu slotów należących do zmiennych prywatnych",
        "Kompilator szyfruje prywatne wartości kluczem wdrażającego",
        "Zmienne prywatne leżą poza trie storage, więc w ogóle nie mają slotu",
        "Nic; private ogranicza inne kontrakty, nie bezpośredni odczyt slotu"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Gdzie w Solidity jest zapisana wartość dla klucza k w mappingu zadeklarowanym w slocie p?",
      options: [
        "W slocie p plus liczbowa wartość k",
        "Pod keccak256(pad32(p) sklejone z pad32(k))",
        "Pod keccak256(pad32(k) sklejone z pad32(p))",
        "W osobnym trie mappingu, z samym k jako kluczem"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Dlaczego getter wywołany przez eth_call jest zwykle lepszym wyborem niż odczyt surowego slotu?",
      options: [
        "To jedyny sposób na odczyt wartości z historycznego bloku",
        "Zwraca zdekodowaną wartość i przetrwa zmiany układu storage",
        "Nie wymaga, żeby węzeł miał stan z tego bloku",
        "Omija wymóg węzła archiwalnego, który dotyczy odczytu slotów"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego eth_getStorageAt daje tę samą odpowiedź dla slotu nigdy niezapisanego i slotu jawnie ustawionego na zero?",
      options: [
        "Węzeł dopełnia każdą odpowiedź do 32 bajtów, zanim ją zahashuje",
        "Pełne węzły usuwają takie sloty z trie po 128 blokach",
        "Zapis zera usuwa wpis, więc stan nie przechowuje żadnego z nich",
        "Enkoder ABI zamienia na wyjściu brak wartości na zero"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Slot zawiera cztery spakowane pola uint64, a kod dekoduje całe zwrócone słowo jako jeden uint256. Co dostaje?",
      options: [
        "Tylko pierwsze pole, bo węzeł zwraca jedynie najniższe 8 bajtów",
        "Błąd, bo spakowane sloty trzeba czytać pole po polu",
        "Sumę czterech pól, którą EVM trzyma w tym słowie",
        "Dużą liczbę, która miesza ze sobą wszystkie cztery pola"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Potrzebny jest adres, na który proxy EIP-1967 aktualnie wskazuje. Co odczytać przez eth_getStorageAt?",
      options: [
        "Slot 0, w którym każde proxy trzyma adres implementacji",
        "Slot keccak256('eip1967.proxy.implementation') - 1",
        "Slot keccak256('eip1967.proxy.admin'), który wskazuje logikę",
        "Slot pod keccak256 adresu samego proxy, dopełnionego do 32 bajtów"
      ],
      answer: 1
    }
  ],
  "eth-get-proof": [
    {
      kind: "scenario",
      question: "Pytasz eth_getProof o klucz storage, do którego kontrakt nigdy nic nie zapisał. Co poprawny węzeł odsyła dla tego klucza?",
      options: [
        "Błąd, bo nie da się zbudować ścieżki do liścia, który nie istnieje",
        "Dowód nieistnienia: poprawną ścieżkę, która kończy się przed kluczem, i zero",
        "Pustą tablicę storageProof, bez wpisu i bez node'ów dowodu dla tego klucza",
        "Dowód najbliższego zapisanego klucza, który trzeba porównać ręcznie"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego niektóre węzły archiwalne mimo to odmawiają eth_getProof dla historycznych bloków?",
      options: [
        "Trzymają płaskie historyczne wartości, ale nie trie node'y potrzebne do ścieżki",
        "Specyfikacja pozwala tej metodzie przyjmować tylko tag bloku latest",
        "Historyczne dowody przekroczyłyby limit rozmiaru odpowiedzi JSON-RPC",
        "Dowody wymagają trie receiptów, które węzły archiwalne z czasem usuwają"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Którą ścieżką przechodzi się przez trie storage konta przy weryfikacji wpisu storageProof?",
      options: [
        "Samym kluczem, bez hashowania",
        "keccak256 z 32-bajtowego klucza",
        "keccak256 z adresu sklejonego z kluczem",
        "Pozycją klucza w tablicy żądania"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co eth_getProof dodaje ponad wartości, które zwracają eth_getBalance i eth_getStorageAt?",
      options: [
        "Wartości z historycznych bloków, których węzły z pruningiem już nie mają",
        "Wartości z bloku pending, zanim zostanie zamknięty następny blok",
        "Trie node'y, które pozwalają sprawdzić wartości względem state root",
        "Zdekodowane wartości, bo dowód zawiera układ storage kontraktu"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Bridge weryfikuje każdy dowód, ale stateRoot, względem którego sprawdza, bierze z tego samego niezaufanego endpointu. Co może zrobić nieuczciwy endpoint?",
      options: [
        "Tylko opóźniać odpowiedzi, bo zmieniony dowód przerwie łańcuch hashy",
        "Zwrócić poprawny dowód względem wymyślonego przez siebie state root",
        "Tylko pomijać klucze storage, bo zwrócone wartości muszą być prawdziwe",
        "Kłamać tylko co do sald, bo wartości storage są hashowane dwukrotnie"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego zwykła aplikacja powinna unikać eth_getProof przy rutynowych odczytach, których nigdy nie weryfikuje?",
      options: [
        "Odpowiedzi z dowodami są w cache, więc ich wartości spóźniają się o slot",
        "Dowody kosztują kilobajty i dużo pracy węzła, na darmo, jeśli nikt ich nie sprawdzi",
        "Metoda podaje salda w gwei zamiast w wei, przez co traci precyzję",
        "Wartości w dowodach podpisuje provider, a podpis wygasa po jednej epoce"
      ],
      answer: 1
    }
  ],
  "eth-call": [
    {
      kind: "scenario",
      question: "eth_call trafia w funkcję kontraktu, która robi revert z własnym błędem (custom error). Co dostaje wywołujący?",
      options: [
        "Udany wynik 0x, bo wywołanie z revertem niczego nie zwraca",
        "Błąd JSON-RPC, którego data zawiera zakodowany custom error",
        "Udany wynik, w którym danymi jest selektor custom errora",
        "Odpowiedź HTTP 400 z pustym body i bez formatu komunikatu JSON-RPC"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego eth_call zwykle się udaje z adresem from, który nie ma etheru?",
      options: [
        "Węzeł na czas wywołania dopisuje nadawcy ether",
        "Sprawdzanie salda dotyczy tylko transakcji typu 0x2 i wyższych",
        "EVM podczas message call całkowicie ignoruje pole from",
        "Klienci łagodzą sprawdzanie opłat i salda, gdy brak pól opłat"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Co gwarantuje jedno eth_call do Multicall3 w porównaniu z batchem JSON-RPC żądań eth_call, z których każde używa latest?",
      options: [
        "Wszystkie odczyty wykonują się na stanie jednego bloku",
        "Odczyty kosztują mniej gasu, bo dzielą jeden intrinsic gas",
        "Węzeł cache'uje wyniki dla późniejszych identycznych żądań",
        "Odczyty omijają rate limit providera dla eth_call"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Kod używa obiektu transakcji, razem z maxFeePerGas, jako obiektu eth_call do odczytu z adresu bez środków. Co się dzieje?",
      options: [
        "Pola opłat są ignorowane, bo eth_call nie wydaje gasu",
        "Węzeł podpisuje i rozgłasza go jako prawdziwą transakcję",
        "Sprawdzanie salda wraca i wywołanie kończy się błędem",
        "Wywołanie się udaje, a opłatę płaci kontrakt docelowy"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co na węźle Geth ogranicza gas, którego może użyć pojedyncze eth_call?",
      options: [
        "Pole gas podane przez wywołującego, bez górnego limitu",
        "--rpc.gascap, domyślnie 50 000 000, a do tego timeout",
        "Saldo etheru nadawcy podzielone przez cenę gasu",
        "30 000 000, stały limit na wywołanie ustalony w protokole"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "eth_call trafia w adres, pod którym w ogóle nie ma kodu. Co wraca?",
      options: [
        "Błąd JSON-RPC z kodem 3 informujący, że cel nie ma kodu",
        "Wynik z 32 zerowych bajtów, domyślne słowo zwracane przez EVM",
        "null, bo pod tym adresem nie ma kontraktu do wykonania",
        "Udany wynik 0x, jak dla funkcji, która niczego nie zwraca"
      ],
      answer: 3
    }
  ],
  "eth-estimate-gas": [
    {
      kind: "cause",
      question: "Dlaczego eth_estimateGas może zwrócić więcej gasu, niż pokazuje gasUsed w receipcie po włączeniu transakcji do bloku?",
      options: [
        "Węzeł przed zwróceniem estymacji dodaje stały margines bezpieczeństwa",
        "Reguła 63/64 i refundy sprawiają, że potrzebny limit przewyższa pobrany gas",
        "gasUsed pomija 21 000 gasu intrinsic, które estymacja uwzględnia",
        "Estymacja jest podana w wei, a gasUsed liczy się w jednostkach gasu"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Estymacja się udaje i transakcja zostaje wysłana z dokładnie takim limitem, ale po włączeniu do bloku kończy się jej gas. Jaka jest prawdopodobna przyczyna?",
      options: [
        "Przy włączaniu do bloku ponownie zastosowano gas cap węzła",
        "Base fee wzrosła między estymacją a blokiem, który ją zawarł",
        "Stan zmienił się przed włączeniem i wywołanie poszło droższą ścieżką",
        "Estymacja wróciła w zapisie dziesiętnym, a portfel odczytał ją jako hex"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "eth_estimateGas zwraca 0xb3d9 dla transferu tokena. Co oznacza ta liczba?",
      options: [
        "Opłatę 46 041 gwei przy bieżącej base fee",
        "46 041 jednostek gasu, najniższy limit, który działa",
        "46 041 gasu faktycznie zużytego, po odjęciu refundów",
        "Cenę gasu 46 041 wei za jednostkę dla szybkiego włączenia"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Portfel ponawia eth_estimateGas w pętli za każdym razem, gdy estymacja kończy się revertem. Co daje każde ponowienie?",
      options: [
        "Udaje się, gdy wygaśnie wynik tego wywołania w cache węzła",
        "Węzeł z każdym ponowieniem podnosi gas cap, aż wywołanie się zmieści",
        "Każda próba powtarza ten sam revert i kosztuje kilka wykonań",
        "Każde ponowienie trafia do mempoola i potem do bloku jako transakcja"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Estymujesz swap, a transakcja approve, od której on zależy, nie jest jeszcze w bloku. Estymacja kończy się revertem. Co da sensowną liczbę?",
      options: [
        "Kilka ponowień z latest, aż odświeży się cache węzła",
        "Dodanie 30 procent zapasu do limitu i wysłanie swapu mimo to",
        "Podanie hasha approve jako parametru bloku w estymacji",
        "Estymacja na pending albo state override dla allowance"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego providerzy w cenniku opartym na compute units wyceniają eth_estimateGas znacznie wyżej niż eth_call?",
      options: [
        "Musi podpisać próbną transakcję i zasymulować jej propagację",
        "Zawsze działa na historycznym stanie węzła archiwalnego",
        "Wyszukiwanie binarne kilka razy uruchamia EVM dla jednej estymacji",
        "Przed wywołaniem odtwarza każdą transakcję pending z mempoola"
      ],
      answer: 2
    }
  ],
  "eth-create-access-list": [
    {
      kind: "consequence",
      question: "Dołączasz do access listy wpis dla slotu storage, którego transakcja nigdy nie odczytuje. Ile kosztuje ten wpis?",
      options: [
        "Nic; EVM ignoruje wpisy, do których się nie odwołuje",
        "Revert, bo zadeklarowany slot nie został użyty",
        "1900 gasu zapłacone z góry, bez żadnej korzyści",
        "100 gasu, czyli cenę jednego ciepłego odczytu"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Ile mniej więcej gasu oszczędza trafne zadeklarowanie z góry jednego zimnego slotu storage?",
      options: ["Około 1900 gasu", "Około 2100 gasu", "Około 100 gasu", "Około 2600 gasu"],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego wygenerowana access list jest ważna tylko dla stanu, na którym ją wygenerowano?",
      options: [
        "Lista zawiera numer bloku i na innej wysokości jest odrzucana",
        "Klucze storage są solone state rootem bloku, z którego pochodzą",
        "Access listy wygasają po stałej liczbie bloków od wygenerowania",
        "Inny stan może poprowadzić wykonanie ścieżką przez inne sloty"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Które adresy eth_createAccessList pomija na liście, bo i tak są ciepłe z definicji?",
      options: [
        "Każdy kontrakt, do którego wywołanie sięga przez DELEGATECALL",
        "Konta, których storage wywołanie tylko odczytuje",
        "Precompile'y i nadawcę",
        "Adresy bez kodu, takie jak zwykłe konta EOA"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Wywołanie kontraktu działa blisko swojego limitu gasu, a jego koszt zmienia się zależnie od tego, do czego odwołały się wcześniejsze transakcje w bloku. Co daje mu dołączenie access listy?",
      options: [
        "Pierwszeństwo, bo builderzy najpierw włączają transakcje z listą",
        "Zużycie gasu niezależne od tego, co inni wcześniej rozgrzali",
        "Ochronę przed revertem, bo zapisywać można tylko zadeklarowane sloty",
        "Tańsze calldata, bo zadeklarowane sloty znikają z danych wejściowych"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym gasUsed zwracane przez eth_createAccessList różni się od wyniku eth_estimateGas dla tego samego wywołania?",
      options: [
        "Pomija 21 000 gasu intrinsic, które liczy tylko estymacja",
        "To górna granica z wyszukiwania binarnego, a nie zużyty gas",
        "Uwzględnia koszt samej listy, bo wywołanie jest powtarzane z listą",
        "Liczy tylko zimne dostępy, które lista zamieniła na ciepłe"
      ],
      answer: 2
    }
  ],
  "eth-gas-price": [
    {
      kind: "cause",
      question: "Dlaczego dwa uczciwe węzły w tym samym łańcuchu zwracają w tej samej chwili różne wartości eth_gasPrice?",
      options: [
        "Każdy węzeł widzi inną base fee dla następnego budowanego bloku",
        "To najniższa cena transakcji w mempoolu danego węzła",
        "To percentyl ostatnich napiwków, zależny od flag operatora",
        "Węzły zaokrąglają wartość do gwei, każdy w inną stronę"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Transakcja typu 0x2 ma maxFeePerGas ustawione dużo powyżej base fee. Ile nadawca faktycznie płaci za jednostkę gasu?",
      options: [
        "Pełne maxFeePerGas, bo na taką cenę się zgodził",
        "baseFee plus min(tip, maxFeePerGas minus baseFee); reszta wraca",
        "Tylko base fee, bo napiwki dotyczą wyłącznie transakcji blobowych",
        "Wartość eth_gasPrice sugerowaną w chwili włączenia do bloku"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Chcesz zbudować estymator opłat, którego zachowanie kontrolujesz, zamiast dziedziczyć flagi operatora węzła. Która metoda dostarcza do tego surowych danych?",
      options: ["eth_gasPrice", "eth_feeHistory", "eth_blobBaseFee", "eth_maxPriorityFeePerGas"],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Portfel ustawia maxFeePerGas dokładnie na wartość zwróconą przez eth_gasPrice. Co się stanie, jeśli base fee wzrośnie w ciągu kilku następnych bloków?",
      options: [
        "Węzeł dopłaci z napiwku, więc włączenie do bloku nie jest zagrożone",
        "Transakcja utknie bez zapasu, gdy base fee przekroczy pułap",
        "Trafi do bloku po starej base fee, ustalonej przy podpisie",
        "Mempool zamieni ją na transakcję legacy z ceną gasPrice"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym liczba zwracana przez eth_blobBaseFee różni się od tej, którą zwraca eth_gasPrice?",
      options: [
        "To część eth_gasPrice przypadająca na bloby, do odjęcia od niej",
        "To napiwek dla transakcji blobowych, doliczany do eth_gasPrice",
        "Wycenia blob gas, osobny rynek, za który płaci też transakcja blobowa",
        "To ta sama wartość, tylko w jednostkach blob gas zamiast wei"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Używasz eth_gasPrice na L2, żeby oszacować całkowity koszt transakcji. Czego to nie uwzględnia?",
      options: [
        "Napiwku, który sekwencery L2 ignorują",
        "Base fee, której sieci L2 nie pobierają",
        "Opłaty za dane na L1, zwykle większej części",
        "Base fee blobów we własnych blokach L2"
      ],
      answer: 2
    }
  ],
  "eth-fee-history": [
    {
      kind: "detail",
      question: "Wywołujesz eth_feeHistory z blockCount 0x4. Ile elementów zawiera baseFeePerGas?",
      options: [
        "Cztery, po jednym dla każdego bloku z żądanego okna",
        "Pięć, a pierwszy powtarza najstarszy blok dla wyrównania",
        "Pięć: ostatni to base fee następnego bloku",
        "To zależy od tego, ile z tych bloków było pustych"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego zapytanie eth_feeHistory o wiele bloków z kilkoma percentylami napiwków, gdy nic nie ma jeszcze w cache, jest dla węzła kosztowne?",
      options: [
        "Każdą base fee trzeba wyliczyć od nowa, przechodząc łańcuch nagłówków",
        "Każdy blok trzeba ponownie wykonać w EVM, by ustalić jego gasUsedRatio",
        "Transakcje każdego bloku trzeba wczytać i posortować po efektywnym napiwku",
        "Każdy współczynnik blobów trzeba pobrać z sidecarów warstwy konsensusu"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Od dziesięciu bloków gasUsedRatio jest bliskie 1,0. Co estymator powinien zrobić z maxFeePerGas?",
      options: [
        "Obniżyć je, bo pełne bloki znaczą, że popyt został już obsłużony",
        "Zignorować współczynnik, bo opisuje tylko rynek blobów",
        "Podnieść je, bo base fee wciąż rośnie z każdym blokiem",
        "Przejść na eth_gasPrice, które samo uwzględnia przeciążenie"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Węzeł nie przechowuje już receiptów tak daleko wstecz, jak sięga blockCount. Jak odpowiada?",
      options: [
        "Błędem z numerem najwcześniejszego bloku, który jeszcze ma",
        "Późniejszym oldestBlock i krótszymi tablicami, niż żądano",
        "Zerowymi base fee i pustymi tablicami reward dla brakujących bloków",
        "Przesuniętym wstecz newestBlock, by liczba bloków się zgadzała"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Jak trzeba zakodować parametr rewardPercentiles w żądaniu?",
      options: [
        "Jako ciągi hex QUANTITY, jak każdy inny parametr liczbowy",
        "Jako ułamki od 0 do 1, jak wartości gasUsedRatio",
        "Jako jeden percentyl, bo metoda przyjmuje tylko jedną wartość",
        "Jako rosnące, zwykłe liczby JSON od 0 do 100"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Co odróżnia ostatni element baseFeePerGas od wszystkich innych wartości opłat, które oferuje API?",
      options: [
        "Jako jedyny uwzględnia już zapłacony napiwek",
        "Jest uśredniony z całego okna, co wygładza skoki",
        "Ustala go już nagłówek; to fakt, a nie szacunek",
        "Jako jedyny jest podany w gwei zamiast w wei"
      ],
      answer: 2
    }
  ],
  "eth-send-raw-transaction": [
    {
      kind: "scenario",
      question: "Odpowiedź HTTP na twoje eth_sendRawTransaction ginie po drodze. Jak bezpiecznie z tego wyjść?",
      options: [
        "Podpisać nową transakcję z następnym nonce i wysłać ją zamiast tamtej",
        "Poczekać, aż mempool ją wyrzuci, i podpisać ponownie z wyższą opłatą",
        "Wysłać identyczne bajty; wróci ten sam hash albo already known",
        "Odczytać nonce z latest i zacząć od nowa od zwróconej wartości"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Poprawnie podpisana transakcja z pełnym pokryciem w środkach, która na pewno skończy się revertem, zostaje wysłana przez eth_sendRawTransaction. Co robi węzeł?",
      options: [
        "Odrzuca ją, bo walidacja w mempoolu najpierw ją wykonuje",
        "Trzyma ją w kolejce, aż stan kontraktu pozwoli jej przejść",
        "Przyjmuje ją; trafia do bloku i płaci za gas jak każda inna",
        "Przyjmuje ją, a po zapisaniu revertu zwraca cały gas"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Wysyłasz transakcję do publicznego endpointu, a searcher przeprowadza atak sandwich na twój swap. Która zmiana bezpośrednio temu zaradzi?",
      options: [
        "Podniesienie maxFeePerGas, by trafiła wcześniej w tym samym bloku",
        "Wysłanie do kilku publicznych endpointów naraz, by szybciej się rozeszła",
        "Wysłanie przez prywatny endpoint, który kieruje ją do builderów",
        "Użycie niższego nonce, by transakcja ustawiła się przed ich transakcjami"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Węzeł bez peerów dostaje twoją transakcję przez eth_sendRawTransaction. Co się dzieje?",
      options: [
        "Odrzuca ją z błędem, że nie ma peerów, którym mógłby ją rozgłosić",
        "Trzyma wywołanie otwarte, aż połączy się peer i przejmie transakcję",
        "Przyjmuje ją i zwraca hash, ale nikt inny nigdy jej nie zobaczy",
        "Przekazuje ją klientowi konsensusu, który rozgłasza ją za niego"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Wysłanie transakcji kończy się błędem replacement transaction underpriced. Co zrobił nadawca?",
      options: [
        "Wysłał dokładnie te same bajty, które mempool już przechowuje",
        "Użył nonce niższego niż bieżący nonce konta",
        "Zaoferował opłatę poniżej minimum ustawionego w mempoolu",
        "Powtórzył nonce transakcji z mempoolu bez dość dużej podwyżki"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego hash transakcji można znać, zanim w ogóle wywoła się eth_sendRawTransaction?",
      options: [
        "Węzeł wylicza go z wybranego adresu nadawcy i nonce",
        "Wyznaczają go chain ID i nonce, znane z wyprzedzeniem",
        "To hash Keccak-256 podpisanej transakcji, którą już masz",
        "To hash pól sprzed podpisu, przygotowanych przez nadawcę"
      ],
      answer: 2
    }
  ],
  "eth-send-transaction": [
    {
      kind: "cause",
      question: "Hostowany endpoint RPC odpowiada na eth_sendTransaction błędem -32601. Dlaczego?",
      options: [
        "W obiekcie transakcji zabrakło wymaganego pola gas",
        "Przyjmuje transakcje tylko wtedy, gdy przychodzą przez WebSocket",
        "Na koncie brakuje środków, co zgłasza jako method not found",
        "Nie ma klucza dla twojego adresu i nie podpisuje za wywołujących"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Strona wywołuje eth_sendTransaction przez provider wstrzyknięty przez MetaMask. Kto podpisuje transakcję?",
      options: [
        "Węzeł pod adresem RPC portfela, odblokowanym kontem",
        "Portfel, własnym kluczem, zanim przekaże dalej surowe bajty",
        "Strona, kluczem, który portfel wstrzykuje do jej JavaScriptu",
        "Backend providera, który podpisuje każdy obiekt od portfela"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Operator odblokowuje konto na węźle, którego port RPC jest osiągalny z internetu. Co z tego wynika?",
      options: [
        "Port udostępnia wywołującym plik keystore otwartym tekstem",
        "Węzeł zaczyna rozgłaszać peerom klucz prywatny konta",
        "Każdy, kto dotrze do portu, może wydać środki z konta",
        "Ujawniony jest tylko nonce konta, a nie możliwość podpisu"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Żądanie eth_sendTransaction pomija nonce, gas i pola opłat. Co robi węzeł, który obsługuje tę metodę?",
      options: [
        "Odrzuca je, bo każde pominięte pole jest wymaganym parametrem",
        "Podpisuje w ich miejscu zera, tak jak zostawiło je żądanie",
        "Wstawia nonce pending, estymację gasu i wybraną przez siebie opłatę",
        "Kopiuje je z ostatniej transakcji nadawcy, która trafiła do bloku"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Węzeł obsługuje eth_sendTransaction i eth_sendRawTransaction. Co odróżnia pierwszą metodę od drugiej?",
      options: [
        "Czeka na włączenie do bloku i zwraca receipt, a nie hash",
        "Pomija walidację mempoola, bo węzeł ufa własnym lokalnym kontom",
        "Węzeł podpisuje kluczem, który ma, zamiast przyjąć podpisane bajty",
        "To nowsza metoda, dodana dla transakcji typowanych po EIP-1559"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Skrypt wdrożeniowy działa z Anvil, ale na produkcyjnym endpoincie kończy się błędem -32601. Jak to naprawić?",
      options: [
        "Dodać chain ID sieci produkcyjnej do każdej transakcji",
        "Przełączyć skrypt na połączenie WebSocket z endpointem",
        "Podpisywać lokalnie i wysyłać bajty przez eth_sendRawTransaction",
        "Ustawić jawny limit gasu, by endpoint pominął estymację"
      ],
      answer: 2
    }
  ],
  "eth-get-logs": [
    {
      kind: "scenario",
      question: "Filtr eth_getLogs ma topics [A, null, [B, C]]. Jakie logi do niego pasują?",
      options: [
        "Logi z A, B lub C na dowolnej pozycji w topics",
        "Logi z topic0 równym A, które zawierają zarówno B, jak i C",
        "Logi z topic0 równym A i topic2 równym B lub C, topic1 dowolny",
        "Logi z topic0 równym A i topic1 równym B lub C, topic2 dowolny"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego pole removed każdego logu w odpowiedzi eth_getLogs ma wartość false?",
      options: [
        "Usunięte logi są kasowane z receiptów, gdy węzeł robi pruning",
        "To pole jest zarezerwowane dla logów pending, których nie ma w bloku",
        "Metoda raportuje tylko łańcuch kanoniczny, więc wycofanych logów nie ma",
        "Klienci wpisują tam na sztywno false dla zgodności ze starymi narzędziami"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co logs bloom każdego nagłówka bloku pozwala zrobić węzłowi, który odpowiada na eth_getLogs?",
      options: [
        "Zwrócić pasujące logi wprost, bez czytania jakichkolwiek receiptów",
        "Wyznaczyć dokładny zbiór pasujących logów, bo bloom nie daje fałszywych trafień",
        "Pominąć bloki, które już obsłużył z cache odpowiedzi",
        "Pominąć bloki, które nie mogą pasować, kosztem fałszywych trafień"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "eth_getLogs dla zakresu sprzed Merge zwraca [] z węzła, który stosuje history expiry. Co pokazuje ta pusta tablica?",
      options: [
        "Że żaden kontrakt nie wyemitował pasującego eventu w całym zakresie",
        "Że zakres przekroczył limit rozpiętości i został po cichu przycięty",
        "Nic o eventach; węzeł może już nie mieć tych receiptów",
        "Że logi wypadły przez reorg i węzeł oznaczył je jako removed"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Okno skanowania kończy się błędem query returned more than 10000 results. Co powinien zrobić odporny skaner?",
      options: [
        "Ponawiać to samo okno, aż cache dostawcy RPC się rozgrzeje",
        "Usunąć filtr adresu, żeby węzeł mógł użyć indeksu topics",
        "Zmniejszyć okno o połowę i ponowić, potem znów je poszerzać",
        "Przesunąć kursor do latest i wznowić skanowanie od head"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Indekser po każdym skanie przesuwa swój trwały kursor aż do latest. Co może pójść źle?",
      options: [
        "Węzeł odrzuca latest jako toBlock, gdy filtr ma adres",
        "Logi z latest nie mają blockHash, dopóki blok nie jest sfinalizowany",
        "Reorg może wycofać logi, które indekser już zapisał na stałe",
        "Bloom dla latest nie jest jeszcze gotowy, więc jego logi są pomijane"
      ],
      answer: 2
    }
  ],
  "eth-filters": [
    {
      kind: "scenario",
      question: "Odpytania eth_getFilterChanges zaczynają zwracać filter not found, choć poza tym endpoint działa poprawnie. Jaka jest prawdopodobna przyczyna?",
      options: [
        "Filtr pasował do zbyt wielu logów, więc węzeł usunął go jako za duży",
        "Reorg unieważnił listę topics, z którą zainstalowano filtr",
        "Odpytanie trafiło do innego backendu albo filtr wygasł bez odpytań",
        "Węzeł sam przekształcił filtr w subskrypcję"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym, dla tego samego id filtra logów, eth_getFilterLogs różni się od eth_getFilterChanges?",
      options: [
        "Pierwsza działa też na filtrach bloków, druga tylko na filtrach logów",
        "Pierwsza zwraca wszystkie trafienia, ignorując kursor, druga tylko nowe",
        "Pierwsza przestawia kursor na head, druga zostawia go tam, gdzie był",
        "Pierwsza zwraca też logi pending, druga tylko te, które są już w blokach"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Po błędzie filter not found konsument instaluje nowy filtr i dalej odpytuje. Co stracił?",
      options: [
        "Nic, bo nowy filtr odtwarza dane od ostatniej pozycji starego",
        "Tylko wpisy removed, bo nowy filtr nigdy nie raportuje wycofań",
        "Wszystko, co wydarzyło się między starym kursorem a bieżącym head",
        "Swoje miejsce w limicie filtrów węzła, który resetuje się dopiero po restarcie"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jak długo Geth domyślnie trzyma filtr, którego nikt nie odpytuje?",
      options: [
        "Około 12 sekund, jeden slot",
        "Około pięciu minut",
        "Do następnej sfinalizowanej epoki",
        "Do wywołania eth_uninstallFilter"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Po co istnieją filtry z odpytywaniem, skoro eth_getLogs może odpowiedzieć na to samo zapytanie o logi?",
      options: [
        "eth_getLogs nie filtruje po topics, a filtr dopasowuje dowolną pozycję",
        "Filtry czytają z mempoolu, więc widzą logi, zanim powstaną bloki",
        "HTTP nie ma trybu push, więc węzeł pamięta kursor i wysyła tylko różnicę",
        "Filtry są współdzielone między backendami, więc działają za load balancerem"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "eth_getFilterChanges dostarcza log, którego pole removed ma wartość true. Co powinien z nim zrobić konsument?",
      options: [
        "Zignorować go, bo oznacza log usunięty z receiptów przy pruningu",
        "Zapisać go, bo to log pending, którego jeszcze nie ma w bloku",
        "Wycofać ten log, bo reorg przepisał blok, z którego pochodził",
        "Zainstalować filtr ponownie, bo removed oznacza reset kursora"
      ],
      answer: 2
    }
  ],
  "eth-subscribe": [
    {
      kind: "consequence",
      question: "Połączenie WebSocket zrywa się na 40 sekund, potem wraca, a subskrypcja logs zostaje odnowiona. Co stało się z pasującymi eventami z tej przerwy?",
      options: [
        "Przychodzą serią zaraz po starcie nowej subskrypcji",
        "Przychodzą z następnym pasującym blokiem, oznaczone removed: true",
        "Przepadły, bo nic ich nie przechowuje; trzeba użyć eth_getLogs",
        "Węzeł je odtwarza, bo id subskrypcji przetrwa ponowne połączenie"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Czym powiadomienie subskrypcji różni się strukturą od zwykłej odpowiedzi JSON-RPC?",
      options: [
        "Używa tego samego id co wywołanie eth_subscribe, które utworzyło strumień",
        "Ma method eth_subscription i nie ma id; dane są w params",
        "Przychodzi jako tablica batch z jednym elementem na każdy event",
        "Pomija pole jsonrpc, żeby klient poznał, że to push"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego dwa endpointy tego samego łańcucha dostarczają różne strumienie newPendingTransactions?",
      options: [
        "Jeden z endpointów serwuje nieaktualną kopię łańcucha",
        "Strumienie pending są próbkowane, więc każdy klient dostaje losowy podzbiór",
        "Id subskrypcji kodują inne filtry topics dla każdego klienta",
        "Każdy strumień pokazuje mempool danego węzła, zależny od peerów i reguł"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Handler newHeads musi zauważać reorgi. Co powinien sprawdzać w każdym otrzymanym nagłówku?",
      options: [
        "Czy jego parentHash jest równy hashowi poprzedniego nagłówka",
        "Flagę removed, którą newHeads ustawia na zastąpionym nagłówku",
        "Czy jego timestamp jest dokładnie 12 sekund po poprzednim",
        "Komunikat o reorgu, który węzeł wysyła w strumieniu przed nowym head"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Dlaczego produkcyjne indeksery traktują subskrypcję logs jako sygnał, a skanowanie eth_getLogs jako źródło prawdy?",
      options: [
        "Subskrypcje dostarczają tylko logi z bloku pending, a nie z łańcucha",
        "eth_getLogs raportuje wpisy removed, a subskrypcje nigdy",
        "Zerwane połączenie po cichu gubi eventy, które odzyska zapytanie o zakres",
        "Subskrypcje są rozliczane za event, a skanowanie za wywołanie"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Skrypt ma dostęp do węzła tylko przez HTTP i chce dostawać nowe logi na bieżąco. Czego powinien użyć?",
      options: [
        "eth_subscribe przez HTTP, z przejściem na long polling",
        "eth_subscribe z typem logs w żądaniu batch",
        "Filtrów z odpytywaniem: eth_newFilter i eth_getFilterChanges",
        "Samego eth_getFilterLogs, który sam wysyła nowe wpisy, gdy się pojawią"
      ],
      answer: 2
    }
  ],
  "eth-syncing": [
    {
      kind: "cause",
      question: "eth_syncing zwraca false, ale blok head węzła jest sprzed dwóch godzin. Jakie jest prawdopodobne wyjaśnienie?",
      options: [
        "Klient wykonawczy skończył synchronizację i celowo przestał importować bloki",
        "To węzeł archiwalny, który podaje najstarszy blok, jaki jeszcze ma",
        "Jego klient konsensusu nie działa, więc nic nie przesuwa head",
        "Reorg cofnął head o bloki z ostatnich dwóch godzin"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Jaki zestaw sygnałów daje rzetelne sprawdzenie gotowości backendu RPC?",
      options: [
        "Samo eth_syncing równe false, bo klient najlepiej wie, czy jest gotowy",
        "Połączenie TCP plus odpowiedź HTTP 200 na dowolne żądanie JSON-RPC",
        "syncing false, świeży timestamp head, właściwy chain ID, peery powyżej zera",
        "Odpowiedź eth_blockNumber większa od zera, zwrócona w mniej niż sekundę"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co zwraca eth_syncing, gdy węzeł jest w trakcie synchronizacji?",
      options: [
        "Wartość logiczną true",
        "Tekst z nazwą trybu synchronizacji",
        "Obiekt z polami opisującymi postęp",
        "null, dopóki synchronizacja się nie skończy"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Health check uznaje każdy truthy wynik eth_syncing za znak, że węzeł jest zsynchronizowany. Co idzie nie tak?",
      options: [
        "Nic, bo metoda zwraca true tylko wtedy, gdy węzeł jest zsynchronizowany",
        "Nie działa na Geth, który zamiast false zwraca tekst synced",
        "Działa odwrotnie: obiekt węzła w synchronizacji przechodzi, a false nie",
        "Działa tylko przy snap sync, gdzie metoda zwraca wartość logiczną"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Węzeł właśnie skończył snap sync i eth_syncing zwraca teraz false. Co nadal na nim nie działa?",
      options: [
        "eth_blockNumber, aż do pierwszej sfinalizowanej epoki po synchronizacji",
        "eth_call na starszych blokach, bo nie ma jeszcze historycznego stanu",
        "eth_sendRawTransaction, dopóki mempool nie zostanie odbudowany",
        "eth_getBlockByNumber na head, dopóki nie zostaną uzupełnione ciała bloków"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co w wyniku odróżnia startingBlock, currentBlock i highestBlock od pól takich jak syncedAccounts?",
      options: [
        "To pola standardowe; reszta to dodatki specyficzne dla klienta",
        "Są tylko w Geth, a syncedAccounts to przenośne pole standardowe",
        "To ciągi dziesiętne, a dodatki to QUANTITY w hex",
        "Opisują snap sync, a dodatki opisują full sync"
      ],
      answer: 0
    }
  ],
  "eth-simulate": [
    {
      kind: "contrast",
      question: "Co eth_simulateV1 potrafi zamodelować, czego nie da łańcuch osobnych żądań eth_call?",
      options: [
        "Odczyt danych zwracanych przez kontrakt bez wysyłania transakcji",
        "Wykonanie wywołań na stanie starszego, historycznego bloku",
        "Zapis jednego wywołania widoczny w kolejnym, także między blokami",
        "Zwrócenie zdekodowanego powodu revertu dla nieudanego wywołania"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego na mainnecie symulacja wywołania, które wypłaca ether z kontraktu, nie pokazuje przepływu wartości, jeśli nie ustawiono traceTransfers?",
      options: [
        "Transfery etheru są domyślnie ukryte wewnątrz wywołań DELEGATECALL",
        "Zwykłe transfery etheru nie emitują logów, które symulacja mogłaby pokazać",
        "Symulator domyślnie przelicza kwoty etheru na jednostki gasu",
        "Wypłaty księguje warstwa konsensusu, dopiero po bloku"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Symulacja z validation ustawionym na false kończy się sukcesem. Co pozostało niesprawdzone?",
      options: [
        "Czy logika kontraktu dochodzi do zamierzonej gałęzi",
        "Nonce, saldo i opłaty, które sprawdza się w prawdziwej transakcji",
        "Czy wywołania emitują eventy, których oczekuje frontend",
        "Czy każde wywołanie zwraca dane, które zdekoduje kod aplikacji"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Trzeba sprawdzić, jak kontrakt vestingowy zachowa się po cliffie, który nastąpi za dwa miesiące. Co daje do tego eth_simulateV1?",
      options: [
        "Wpis w stateOverrides ustawiający slot ze znacznikiem czasu bloku",
        "Wpis w blockOverrides ustawiający time na późniejszą datę",
        "Flagę traceTransfers, która przewija oczekujące eventy do przodu",
        "Identyfikator bloku bazowego ustawiony na przyszły numer bloku"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Gdzie w wyniku eth_simulateV1 są status, returnData, gasUsed i logs każdego wywołania?",
      options: [
        "W osobnym receipcie dla każdego wywołania, pobieranym przez eth_getTransactionReceipt",
        "W płaskiej tablicy wyników, po jednym na wywołanie, bez obiektów bloków",
        "W logach syntetycznego bloku dołączonego po ostatnim bloku",
        "W tablicy calls każdego symulowanego obiektu bloku"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Żądanie układa wiele bloków z ciężkimi wywołaniami, aż przekroczy łączny limit gasu klienta. Co się dzieje?",
      options: [
        "Pada tylko ostatnie wywołanie, a wcześniejsze wyniki nadal wracają",
        "Pada cała symulacja, a nie tylko wywołanie, które przekroczyło limit",
        "Węzeł sam dzieli pracę na kilka osobnych odpowiedzi",
        "Limit zostaje podniesiony dla tego żądania, po wyższej cenie za jednostkę"
      ],
      answer: 1
    }
  ],
  "state-override": [
    {
      kind: "contrast",
      question: "Czym różni się state od stateDiff we wpisie nadpisania konta?",
      options: [
        "state dotyczy tylko sald, a stateDiff dotyczy slotów storage",
        "state czyści storage i wstawia sloty, stateDiff zmienia tylko podane",
        "state utrzymuje się po wywołaniu, a stateDiff jest potem odrzucane",
        "state jest dla kontraktów, a stateDiff dla kont EOA"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego wartość gasu zmierzona przy state override może zaniżać koszt prawdziwej transakcji?",
      options: [
        "Nadpisania wyłączają intrinsic gas 21 000 naliczany za każde wywołanie",
        "Węzeł stosuje niższy limit gasu zawsze, gdy w żądaniu są nadpisania",
        "Refundy są liczone dwa razy, gdy storage konta jest nadpisany",
        "Ustawiony z góry slot zmienia pierwszy zapis za 20 000 gasu w tanią aktualizację"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Dostawca zwraca wiarygodny wynik eth_call, ale nadpisanie wydaje się nie działać. Co należy podejrzewać?",
      options: [
        "Klucz z adresem w nadpisaniu wymagał zapisu z checksumą",
        "Nadpisania działają tylko z tagiem bloku pending",
        "Endpoint pominął trzeci parametr i użył prawdziwego stanu",
        "Węzeł zastosował nadpisanie do następnego bloku, nie do tego"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Miał zostać podmieniony jeden slot salda tokena, ale trafił do state zamiast do stateDiff. Co widzi wywołanie?",
      options: [
        "Zmieniony jest tylko podmieniony slot, reszta zostaje bez zmian",
        "Błąd, bo state przyjmuje salda, ale nie sloty storage",
        "Każdy inny slot tego kontraktu odczytuje się jako zero",
        "Prawdziwy storage, bo eth_call ignoruje pole state"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Kandydującą implementację trzeba sprawdzić na bieżącym stanie, zanim aktualizacja trafi na produkcję. Jak pomagają w tym nadpisania?",
      options: [
        "Wdrożyć ją naprawdę, a potem cofnąć wdrożenie przez stateDiff",
        "Ustawić nonce proxy tak, żeby następny CREATE trafił na nowy kod",
        "Wstawić jej kod pod adres prawdziwego kontraktu i odtworzyć calldata",
        "Przekazać nowy bytecode w polu data zwykłego eth_call"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jak długo obowiązuje state override przekazany do eth_call i kto go widzi?",
      options: [
        "Do następnego bloku, dla każdego wywołującego ten węzeł",
        "Przez to jedno żądanie, niewidoczny dla innych wywołujących",
        "Dopóki nie wyczyści go eth_uninstallFilter albo restart węzła",
        "Dopóki nie zostanie rozgłoszony i zatwierdzony przez peery"
      ],
      answer: 1
    }
  ],
  "debug-api": [
    {
      kind: "cause",
      question: "Dlaczego trace transakcji nr 40 w bloku kosztuje dużo więcej niż odczyt jej receiptu?",
      options: [
        "Trace'y są przechowywane w skompresowanej postaci i trzeba je rozpakować przy każdym żądaniu",
        "Receipty są w lokalnym cache, a trace'y pobiera się od peerów",
        "Węzeł wykonuje ponownie wcześniejsze transakcje, żeby odbudować stan",
        "Tracer najpierw ponownie weryfikuje każdy podpis w bloku"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Potrzebne jest każde konto i slot odczytane przez transakcję oraz ich wartości przed jej wykonaniem i po nim. Jaka konfiguracja tracera to daje?",
      options: [
        "callTracer z wyłączonym onlyTopCall",
        "prestateTracer z włączonym diffMode",
        "4byteTracer z domyślną konfiguracją",
        "Struct logger z ustawionym disableStorage"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co pokazuje trace z callTracer, czego nie pokaże receipt transakcji?",
      options: [
        "Efektywną cenę za jednostkę gasu, którą transakcja faktycznie zapłaciła",
        "Hash bloku, w którym znalazła się transakcja",
        "Wewnętrzne transfery etheru i to, która zagnieżdżona ramka zrobiła revert",
        "Łączny gas zużyty przez transakcję, z uwzględnieniem zwrotów"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "debug_traceTransaction zostaje wywołane dla złożonej transakcji bez żadnej opcji tracera. Co wraca?",
      options: [
        "Zagnieżdżone drzewo wywołań, bo callTracer jest domyślnym tracerem",
        "Log opcode po opcode, który może mieć setki megabajtów",
        "Błąd, bo pole tracer jest parametrem wymaganym",
        "Tylko ramka wywołania najwyższego poziomu, jak przy ustawionym onlyTopCall"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Trace transakcji sprzed roku kończy się błędem required historical state unavailable. Co oznacza ten błąd?",
      options: [
        "Hash transakcji jest nieznany, więc węzeł nie znalazł nic do prześledzenia",
        "Tracer przekroczył czas, a podniesienie opcji timeout to naprawi",
        "Węzeł usunął stan potrzebny do odtworzenia; to limit retencji",
        "Przestrzeń nazw jest wyłączona i tak węzły to zgłaszają"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego operatorzy trzymają przestrzeń nazw debug_ z dala od publicznych listenerów?",
      options: [
        "Przez metody takie jak debug_getRawTransaction wyciekają klucze prywatne",
        "Jej odpowiedzi nie są podpisane, więc każdy może podrobić trace dla innych",
        "Kilka trace'ów potrafi zatkać węzeł, a niektóre metody przesuwają jego head",
        "Omija rate limity, które obowiązują metody eth_ na tym samym porcie"
      ],
      answer: 2
    }
  ],
  "trace-api": [
    {
      kind: "contrast",
      question: "Co daje trace_filter, czego nie zapewnia żaden z tracerów debug_?",
      options: [
        "Tracing wywołania, które nigdy nie zostało wysłane do łańcucha",
        "Wyszukiwanie ramek wywołań po adresie from lub to w zakresie bloków",
        "Szczegóły wykonania na poziomie opcode'ów dla każdego kroku",
        "Nałożenie state overrides na konta przed odtworzeniem transakcji"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co opisuje pole traceAddress w płaskim wpisie trace_?",
      options: [
        "Adres kontraktu, który wywołała ta ramka",
        "Adres, który zapłacił za gas zużyty przez tę ramkę",
        "Pozycję ramki w drzewie jako ścieżkę indeksów dzieci",
        "Adres slotu storage, do którego ramka coś zapisała"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Potrzebny jest widok przed i po każdego salda i slotu storage, które zmieniła jedna transakcja. O co trzeba poprosić?",
      options: [
        "trace_block dla bloku, który zawiera tę transakcję",
        "trace_replayTransaction z typem trace stateDiff",
        "trace_filter z nadawcą transakcji jako fromAddress",
        "trace_call z typem trace vmTrace"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "trace_filter trafia do endpointu z Geth. Czego się spodziewać?",
      options: [
        "Działa, bo każdy klient implementuje przestrzeń nazw trace z Parity",
        "Zostaje przetłumaczone na debug_traceBlockByNumber dla każdego bloku",
        "Działa po dodaniu trace do listy modułów w --http.api",
        "Kończy się błędem, bo ten klient w ogóle nie implementuje trace_"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Kod czyta traceAddress jako głębokość wywołania. Co źle rozumie w przypadku wpisów [0,1] i [1,0]?",
      options: [
        "To różne ramki, które po prostu leżą na tej samej głębokości",
        "To ta sama ramka, wymieniona raz dla każdego rodzica, który ją wywołał",
        "To wywołanie najwyższego poziomu i jego pierwsze dziecko w odwrotnej kolejności",
        "To ramki na głębokości jeden i zero, uporządkowane według zużytego gasu"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Klient dołącza wpis reward przy tracingu bloku mainnetu Ethereum po Merge. Dlaczego ma on wartość zero?",
      options: [
        "Przy Merge nagrody przeniesiono do typu trace stateDiff",
        "Nagrody po Merge wypłaca wywołanie systemowe, którego klient nie śledzi",
        "Od Merge nie ma nagrody za blok w warstwie wykonawczej",
        "Wartości nagród są usuwane z pełnych węzłów po Merge"
      ],
      answer: 2
    }
  ],
  "txpool-api": [
    {
      kind: "scenario",
      question: "Transakcja pojawia się w txpool_contentFrom pod queued, a nie pod pending. Co to zwykle oznacza?",
      options: [
        "Jej maxFeePerGas jest poniżej base fee bieżącego bloku",
        "Lukę w nonce: brakuje wcześniejszego nonce tego nadawcy",
        "Trafiła do bloku i czeka na swoje potwierdzenia",
        "Węzeł nie skończył jeszcze weryfikować jej podpisu"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego hostowani providerzy prawie nigdy nie udostępniają txpool_content?",
      options: [
        "Każdy klient implementuje ją tylko przez transport IPC",
        "Potrzebuje stanu archiwalnego, by odtworzyć każdy wpis",
        "Zrzut jest ogromny i zdradza, co użytkownicy zaraz zrobią",
        "Zdradzałaby, jakiego klienta i jaką wersję uruchamia provider"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Dashboard odczytuje txpool_status z jednego endpointu i opisuje wynik jako zaległe transakcje pending całej sieci. Co jest z tym nie tak?",
      options: [
        "Licznik obejmuje transakcje z bloków, które czekają na potwierdzenia",
        "Licznik jest próbkowany, więc jest dokładny tylko z dokładnością do epoki",
        "Licznik opisuje mempool jednego węzła, ukształtowany przez peery i limity",
        "Licznik pomija transakcje blobowe, które żyją w warstwie konsensusu"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Transakcje użytkownika utknęły. Co na twoim własnym węźle pokaże, które jego nonce są wstrzymane i z jaką opłatą?",
      options: [
        "txpool_status, które wypisuje wstrzymane nonce dla każdego nadawcy",
        "txpool_contentFrom z adresem nadawcy",
        "eth_getTransactionByHash dla każdego z jego hashy",
        "eth_getTransactionCount z tagiem pending"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co txpool_contentFrom ujawnia o utkniętej transakcji, czego nie pokaże eth_getTransactionByHash?",
      options: [
        "Czy skończy się revertem, gdy w końcu zostanie wykonana",
        "Który z peerów węzła pierwszy rozgłosił ją przez devp2p",
        "Czy jest w pending, czy w queued za luką w nonce",
        "Numer bloku, w którym mempool spodziewa się jej włączenia"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co zwraca txpool_status wywołane na własnym węźle?",
      options: [
        "Każdą transakcję z mempoola, z kluczami nadawca i nonce",
        "Ciąg z podsumowaniem dla każdej transakcji w mempoolu",
        "Dwa liczniki w hex: pending i queued",
        "Minimalną opłatę mempoola i jego limity rozmiaru"
      ],
      answer: 2
    }
  ],
  "net-web3-api": [
    {
      kind: "detail",
      question: "web3_sha3 zwraca 32-bajtowy skrót. Jaki algorytm go wyliczył?",
      options: [
        "NIST SHA3-256, jak wskazuje nazwa metody",
        "SHA-256, dla zgodności z narzędziami Bitcoina",
        "Keccak-256, wbrew temu, co sugeruje nazwa metody",
        "Blake2b-256, hash stojący za jednym z precompile'ów"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego net_peerCount od hostowanego providera to słaby sygnał dla health checku?",
      options: [
        "Providerzy podają peery na klucz API, a nie na węzeł",
        "Liczba obejmuje peery warstwy konsensusu, co ją zawyża",
        "Pochodzi z gatewaya, a nie z węzła, który obsługuje żądania",
        "Specyfikacja ogranicza tę wartość do 25 peerów"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Trzeba sprawdzić, czy endpoint obsługuje sieć, dla której są przeznaczone podpisane transakcje. Co wywołać?",
      options: [
        "net_version, bo identyfikuje sieć na potrzeby peeringu",
        "eth_chainId, bo to chain ID jest objęty podpisem transakcji",
        "web3_clientVersion, bo jego tekst zawiera nazwę sieci",
        "net_listening, bo tylko dobrze skonfigurowany węzeł przyjmuje peery"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Na mainnecie kod porównuje wynik net_version z wynikiem eth_chainId jako zwykłe teksty. Co się dzieje?",
      options: [
        "Są równe, bo każda z metod zwraca QUANTITY 0x1",
        "Są równe, bo każda z metod zwraca ciąg dziesiętny 1",
        "Nigdy nie są równe: jeden to ciąg 1, drugi 0x1",
        "Kończy się błędem, bo net_version zwraca liczbę JSON"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym network id różni się od chain ID?",
      options: [
        "Network id jest tylko dla testnetów; chain ID dotyczy mainnetu",
        "Network id zmienia się przy każdym hard forku; chain ID nigdy",
        "Network id jest kodowany w hex; chain ID idzie jako ciąg dziesiętny",
        "Network id służy do peeringu; chain ID do ochrony przed replay"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Do sprawdzenia jest nieznany endpoint i trzeba ocenić, czy zadziała na nim trace_ albo debug_. Co wywołać najpierw?",
      options: [
        "net_version, żeby ustalić, jaką sieć obsługuje endpoint",
        "net_peerCount, żeby ustalić, jak dobrze węzeł jest połączony",
        "web3_clientVersion, żeby ustalić, która implementacja odpowiada",
        "eth_syncing, żeby ustalić, czy węzeł skończył już synchronizację"
      ],
      answer: 2
    }
  ],
  "admin-api": [
    {
      kind: "cause",
      question: "Dlaczego wystawienie admin_ przez HTTP jest jeszcze groźniejsze niż wystawienie debug_?",
      options: [
        "Metody admin_ omijają JWT, który chroni port Engine API",
        "Metody admin_ podpisują transakcje odblokowanymi kluczami węzła",
        "admin_startHTTP otwiera nowy listener z dowolną przestrzenią nazw",
        "admin_peers ujawnia klucz prywatny każdego połączenia z peerem"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Węzeł się nie synchronizuje, a admin_peers pokazuje dwanaście peerów, których ogłaszane heady pochodzą sprzed kilku godzin. Co to sugeruje?",
      options: [
        "Węzeł jest archiwalny i podaje historyczne heady swoich peerów",
        "Peery są nieaktualne albo przejęte; ich liczba niewiele dowodzi",
        "To peery warstwy konsensusu, które nie potrafią serwować bloków",
        "Na liście modułów RPC węzła brakuje przestrzeni nazw eth"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co w dobrze prowadzonym węźle stanowi granicę dostępu do przestrzeni nazw admin_?",
      options: [
        "Klucz API, który listener HTTP węzła sprawdza przy każdym wywołaniu",
        "Sekret JWT współdzielony z klientem konsensusu na porcie 8551",
        "Allowlista CORS, która ogranicza, z jakich originów można wywoływać",
        "Lokalny socket IPC chroniony uprawnieniami systemu plików"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Podejrzewasz, że wykrywanie peerów w węźle nie działa. Co pokaże, czy połączenia wychodzące w ogóle działają?",
      options: [
        "admin_nodeInfo i odczyt portów nasłuchu",
        "net_listening, które zgłasza osiągalność na zewnątrz",
        "admin_addPeer ze sprawdzonym URL-em enode",
        "admin_startHTTP na nowym porcie dla peerów"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Operator utrzymuje połączenia węzła wyłącznie przez admin_addPeer, zamiast naprawić zepsute discovery. Jakie jest ryzyko?",
      options: [
        "Węzeł przestaje rozgłaszać transakcje do innych peerów",
        "Wyłącza to snap sync, który wymaga wyłącznie wykrytych peerów",
        "Ukrywa to prawdziwą usterkę łączności i grozi atakiem eclipse",
        "Każdy dodany peer trafia na listę zaufanych, zarezerwowanych miejsc"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym odpowiedź admin_nodeInfo różni się od odpowiedzi admin_peers?",
      options: [
        "Pierwsza wymienia peery przychodzące, druga wychodzące",
        "Pierwsza opisuje ten węzeł, druga każdego połączonego peera",
        "Pierwsza idzie przez IPC, druga tylko przez listenery HTTP",
        "Pierwsza zwraca klucz prywatny węzła, druga enode peerów"
      ],
      answer: 1
    }
  ],
  "engine-payload": [
    {
      kind: "contrast",
      question: "Co engine_forkchoiceUpdated robi inaczej, gdy dostaje payloadAttributes?",
      options: [
        "Od razu oznacza wskazany blok head jako sfinalizowany",
        "Zaczyna też budować blok i zwraca payloadId",
        "Waliduje payload head, zamiast tylko go ustawić",
        "Przełącza klienta wykonawczego w tryb archiwalny dla tego bloku"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "engine_newPayload zwraca status SYNCING. Co klient wykonawczy mówi klientowi konsensusu?",
      options: [
        "Payload nie przeszedł walidacji i należy go odrzucić",
        "Payload jest poprawny, ale należy do bocznego łańcucha",
        "Wersja Engine API nie pasuje do aktywnego forka",
        "Brakuje mu rodzica payloadu i zaczął go pobierać"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Obaj klienci węzła działają, a mimo to head warstwy wykonawczej przestał się przesuwać. Jaka usterka po stronie Engine API do tego pasuje?",
      options: [
        "Mempool się zapełnił i zablokował import nowych bloków",
        "eth_syncing zwrócił false, więc klient konsensusu się wstrzymał",
        "Rozjazd zegarów wypchnął claim iat w JWT poza jego okno",
        "Token JWT wygasł po stałym, 24-godzinnym czasie życia"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Operator aktualizuje klienta konsensusu przed forkiem, ale klienta wykonawczego zostawia na starym wydaniu. Co dzieje się przy forku?",
      options: [
        "Klient wykonawczy po cichu stosuje fork, używając starej wersji",
        "Para pada na niezgodnościach wersji, np. -38005 unsupported fork",
        "Klient konsensusu wraca do metod V1 i działa dalej",
        "Psują się tylko transakcje z blobami, bo inne payloady się nie zmieniły"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Jak uwierzytelniane są wywołania Engine API i na jakim porcie domyślnie nasłuchują?",
      options: [
        "Kluczem API w ścieżce URL, na tym samym porcie 8545 co eth_",
        "Wzajemnym TLS z certyfikatem każdego klienta, na porcie 5052",
        "Tokenem JWT podpisanym HS256 wspólnym sekretem, na porcie 8551",
        "Bez uwierzytelniania, na sockecie dostępnym tylko z localhost"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "engine_newPayload odpowiada INVALID i podaje latestValidHash. Co klient konsensusu robi z tym hashem?",
      options: [
        "Ponawia payload, gdy klient wykonawczy skończy synchronizację",
        "Traktuje ten hash jako nowy sfinalizowany blok łańcucha",
        "Cofa się do tego ostatniego poprawnego przodka odrzuconego payloadu",
        "Pobiera z sieci brakującego rodzica, którego wskazuje ten hash"
      ],
      answer: 2
    }
  ],
  "beacon-endpoints": [
    {
      kind: "detail",
      question: "Które pole w /eth/v1/node/syncing sygnalizuje, że beacon node stracił kontakt ze swoim klientem wykonawczym?",
      options: ["sync_distance", "el_offline", "is_syncing", "head_slot"],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Jak zakodowane są wartości liczbowe w odpowiedziach JSON z Beacon API?",
      options: [
        "Jako ciągi hex z prefiksem 0x, tak jak w API wykonawczym",
        "Jako liczby JSON, a duże wartości jako liczby zmiennoprzecinkowe",
        "Jako ciągi dziesiętne, inaczej niż hex w API wykonawczym",
        "Jako fragmenty SSZ zakodowane w base64 w polu data"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Potrzebny jest jawny sygnał przy każdym reorgu w warstwie konsensusu. Skąd go wziąć?",
      options: [
        "Ze ścieżki finality_checkpoints, porównując epoki między odpytaniami",
        "Ze strumienia /eth/v1/events, subskrybując chain_reorg",
        "Ze ścieżki blobów, która pomija bloki usunięte w reorgu",
        "Ze ścieżki headers, sprawdzając flagę canonical w każdym slocie"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Pobierasz z Beacon API supernode'a bloby bloku sprzed dwóch miesięcy. Co dostajesz?",
      options: [
        "Bloby, bo supernode'y trzymają je na zawsze",
        "Bloby, ale tylko w formie SSZ, nigdy jako JSON",
        "Nic: są przechowywane tylko przez około 18 dni",
        "Wersjonowane hashe, bez samej treści blobów"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego numery slotów i numery bloków warstwy wykonawczej z czasem coraz bardziej się rozjeżdżają?",
      options: [
        "Każda epoka pomija jeden numer bloku na swojej granicy",
        "Numery bloków zaczynają się od nowa przy hard forku, sloty nie",
        "Pominięty slot nie daje bloku, więc różnica tylko rośnie",
        "W okresach sync committee sloty rosną dwa razy na jeden blok"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Potrzebny jest numer bloku warstwy wykonawczej, który należy do danego slotu. Która ścieżka Beacon API go podaje?",
      options: [
        "/eth/v1/beacon/headers/{block_id}, przez jego pole body_root",
        "/eth/v1/node/syncing, przez zgłaszany head_slot",
        "/eth/v2/beacon/blocks/{block_id}, przez payload w body bloku",
        "/eth/v1/beacon/states/{state_id}/finality_checkpoints"
      ],
      answer: 2
    }
  ],
  "client-namespaces": [
    {
      kind: "scenario",
      question: "Eksplorator oparty na ots_searchTransactionsBefore przełącza się w ramach failovera z Erigona na węzeł Reth z włączonym ots. Co dostaje?",
      options: [
        "Te same wyniki, bo Erigon i Reth zgłaszają poziom API ots 8",
        "Błąd -32601, bo Reth nie ma przestrzeni nazw ots",
        "Wyniki tylko z bloków, które Reth zdążył zaindeksować",
        "Błąd -32603 unimplemented z metody wyszukiwania"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego ten sam klient może odpowiedzieć na wywołanie erigon_ na jednym endpoincie, a na innym zwrócić -32601?",
      options: [
        "Przestrzeń nazw działa dopiero wtedy, gdy węzeł jest sfinalizowany",
        "Operator włącza przestrzenie nazw osobno na każdym listenerze",
        "Klient dobiera przestrzenie nazw według klucza API wywołującego",
        "Odpowiedź zależy od wersji silnika bazy danych węzła"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym przestrzeń nazw optimism_ różni się od przestrzeni erigon_ z Erigona?",
      options: [
        "Obsługuje ją węzeł rollupu, a nie klient wykonawczy",
        "Jest ustandaryzowana w execution-apis, w odróżnieniu od erigon_",
        "Działa tylko na porcie Engine API, za uwierzytelnieniem JWT",
        "To zbiór aliasów mapowanych na standardowe metody eth_"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co proof_getTransactionReceipt z Nethermind dodaje do zwykłego receiptu?",
      options: [
        "Dowód stanu konta nadawcy w bloku rodzica",
        "Podpis węzła, który poręcza za treść receiptu",
        "Dowody trie transakcji i receiptu względem rootów bloku",
        "Trace wykonania wewnętrznych wywołań transakcji"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Indekser napisano pod erigon_getBlockByTimestamp, a potem dodano zapasowy węzeł Geth. Co się dzieje przy failoverze?",
      options: [
        "Geth po cichu tłumaczy wywołanie na eth_getBlockByNumber",
        "Wywołania się udają, ale zwracają bloki w innej strefie czasowej",
        "Geth odpowie, gdy tylko włączy się w nim moduł erigon",
        "Wywołania kończą się błędem method not found aż do zmiany kodu"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Co rpc_modules mówi wywołującemu o listenerze Geth, Nethermind albo Reth?",
      options: [
        "Jakie metody istnieją, każda z pełnym schematem parametrów",
        "Jakie przestrzenie nazw są włączone, każda z ciągiem wersji",
        "Do jakich klientów listener przekazuje ruch, według wersji",
        "Które przestrzenie nazw są standardowe według specyfikacji"
      ],
      answer: 1
    }
  ],
  "mev-bundle": [
    {
      kind: "scenario",
      question: "eth_callBundle wysłane przez searchera kończy się sukcesem, ale jeden wpis zawiera pole revert. Co to oznacza dla prawdziwego zgłoszenia?",
      options: [
        "Bundle odpada, chyba że hash tej transakcji jest w revertingTxHashes",
        "Relay już odrzucił bundle dla tego docelowego bloku",
        "Revert zostaje zignorowany, bo symulacja jako całość się powiodła",
        "Builder zmienia kolejność w bundlu, żeby revert zniknął"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego strategia nastawiona na trzy najbliższe bloki wysyła swój bundle trzy razy?",
      options: [
        "Builderzy odrzucają bundle po pierwszym nieudanym slocie",
        "Nagłówek z podpisem wygasa po dwunastu sekundach",
        "Każde eth_sendBundle wskazuje jeden docelowy blockNumber",
        "Relaye przyjmują jeden bundle na klucz searchera na slot"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym pole inclusion w mev_sendBundle różni się od blockNumber w eth_sendBundle?",
      options: [
        "Wskazuje slot beacon, a nie blok warstwy wykonawczej",
        "Jest oknem czasowym, a nie numerem bloku",
        "Wskazuje jedynego buildera, który musi włączyć bundle",
        "Może wskazać zakres bloków, od block do maxBlock"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Co mierzy ethSentToCoinbase w odpowiedzi eth_callBundle?",
      options: [
        "Łączne opłaty za gas płacone przez bundle, razem z base fee",
        "Zysk coinbase ponad priority fee, na przykład bezpośrednie płatności",
        "Priority fee za jednostkę gasu ustawione w każdej transakcji",
        "Pole value ostatniej transakcji w bundlu"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Searcher formatuje body JSON (pretty-print) już po obliczeniu X-Flashbots-Signature. Co z tego wynika?",
      options: [
        "Relay je przyjmuje, bo hashuje sparsowany obiekt JSON",
        "Relay je przyjmuje, ale przestaje śledzić reputację klucza",
        "Podpis nie pasuje już do bajtów, które dostaje relay",
        "Bundle jest symulowany, ale nie trafia do żadnego buildera"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Searcher wywołuje eth_cancelBundle z replacementUuid swojego bundla. Co nadal może się stać?",
      options: [
        "Oferta już wysłana do relaya wciąż zawiera ten bundle",
        "Nic, bo anulowanie usuwa go u wszystkich builderów",
        "Bundle zostanie ponownie zgłoszony na następny blok",
        "Relay zwraca opłaty, które bundle by zapłacił"
      ],
      answer: 0
    }
  ],
  "deployless-call": [
    {
      kind: "scenario",
      question: "Odczyt deployless funkcji zwracającej hash bytes32 kończy się błędem invalid code: must not begin with 0xef, a ten sam odczyt przez nadpisanie code działa. Dlaczego?",
      options: [
        "Hash był dłuższy niż 32 bajty, które może zwrócić eth_call",
        "Ścieżka przez nadpisanie pomija gas cap, który stosuje ścieżka tworzenia",
        "Wynik tworzenia jest sprawdzany jak kod, a ten hash zaczynał się od 0xEF",
        "Węzeł odrzuca creation code, który wywołuje funkcję view"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co zwraca jako wynik eth_call, które nie ma pola to?",
      options: [
        "Adres, pod którym kontrakt zostałby wdrożony",
        "Bajty, które initcode przekazał do RETURN",
        "Runtime code zapisany pod adresem zerowym",
        "Pusty wynik, bo nic nie zostaje wdrożone"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Która technika deployless nadal działa na endpoincie, który usuwa state overrides z eth_call?",
      options: [
        "Creation code wysłany bez to, bo nie potrzebuje trzeciego parametru",
        "Runtime code wstawiony nadpisaniem, bo omija zasady tworzenia kontraktów",
        "Żadna, bo każda z tych technik opiera się na parametrze nadpisań",
        "Dowolna, bo biblioteka klienta przywraca usunięte nadpisania"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Zespół dodaje kolejne odczyty do multicalla deployless, aż jego dane zwrotne osiągną 30 KB. Co się dzieje?",
      options: [
        "Węzeł przycina wynik do 24 576 bajtów",
        "Błąd zgłaszają tylko wywołania ponad limitem",
        "Wywołanie się udaje, ale kosztuje dwa razy więcej gasu",
        "Całe wywołanie kończy się błędem rozmiaru kodu"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego podmiana kodu wdrożonego kontraktu przez nadpisanie, które dodaje getter, ujawnia zmienne wewnętrzne tego kontraktu?",
      options: [
        "Nadpisanie kopiuje stary storage do zmiennych publicznych",
        "Własny storage kontraktu zostaje na miejscu pod nowym kodem",
        "Nadpisania wyłączają słowo kluczowe private na czas żądania",
        "Getter czyta pamięć starego kodu z ostatniego bloku"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Jak viem grupuje odczyty na łańcuchu bez wdrożonego Multicall3, gdy multicall wywołano z deployless ustawionym na true?",
      options: [
        "Wdraża Multicall3 transakcją przed pierwszym odczytem",
        "Wraca do jednego eth_call na odczyt w batchu JSON-RPC",
        "Instaluje Multicall3 pod jego zwykłym adresem przez nadpisanie",
        "Wysyła creation code Multicall3 i calldata bez pola to"
      ],
      answer: 3
    }
  ],
  "storage-slot-discovery": [
    {
      kind: "scenario",
      question: "Symulator nadpisuje keccak256(pad32(holder) . pad32(p)) w tokenie napisanym w Vyperze, a balanceOf nadal zwraca starą wartość. Dlaczego?",
      options: [
        "Vyper trzyma salda tokenów w transient storage",
        "Tokeny w Vyperze odrzucają nadpisania slotów sald",
        "Vyper hashuje najpierw slot, a potem klucz",
        "Vyper dopełnia klucz z prawej zamiast z lewej"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Gdzie w logu struct loggera z debug_traceCall dla balanceOf jest klucz storage, który czyta SLOAD?",
      options: [
        "Na szczycie stosu w kroku tego SLOAD",
        "W polu memory zaraz po kroku SLOAD",
        "W polu storage następnego kroku CALL",
        "W danych zwrotnych najbardziej zewnętrznej ramki"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Symulator wpisuje maksymalne uint256 do slotu salda posiadacza USDC, a potem symuluje transfer od tego posiadacza. Co się dzieje?",
      options: [
        "Transfer się udaje i przenosi całą wpisaną kwotę",
        "Wywołanie balanceOf kończy się revertem z przepełnieniem",
        "Węzeł odrzuca nadpisanie jako wartość spoza zakresu",
        "Transfer kończy się revertem, bo najwyższy bit oznacza czarną listę"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym różni się slot dopasowany do wzoru mappingu z Solidity od slotu, który nie pasuje do żadnego wzoru?",
      options: [
        "Wzór działa dla każdego posiadacza, surowy slot dla jednego",
        "Wzór wymaga trace'a, a surowy slot nie wymaga",
        "Surowy slot przetrwa aktualizacje, a wzór się zepsuje",
        "Wzór służy do proxy, a surowy slot do tokenów"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego wpisanie wartości 1000 tokenów do wpisu udziałów stETH nie daje salda równego dokładnie 1000 stETH?",
      options: [
        "stETH trzyma salda w kontrakcie oracle Lido",
        "Slot udziałów pakuje timestamp w swoich górnych bitach",
        "balanceOf przelicza udziały na ether po bieżącym kursie",
        "stETH zaokrągla każde saldo w dół do pełnych etherów"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Nadpisanie stateDiff na adresie implementacji tokena za proxy nie zmienia wyniku balanceOf. Co powinien zmienić symulator?",
      options: [
        "Nadpisać slot admina, żeby proxy przeładowało swój kod",
        "Nadpisać adres proxy, do którego należy storage",
        "Zmienić nadpisanie implementacji ze stateDiff na state",
        "Przypiąć wywołanie do bloku sprzed ostatniej aktualizacji"
      ],
      answer: 1
    }
  ],
  "mempool-streaming": [
    {
      kind: "detail",
      question: "Jaką postać opcji pełnych transakcji przyjmuje Besu w subskrypcji newPendingTransactions?",
      options: [
        "Gołe true przekazane jako drugi parametr",
        "Obiekt z includeTransactions ustawionym na true",
        "Trzeci parametr o nazwie fullTx, równy true albo false",
        "Subskrypcję o nazwie fullPendingTransactions"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego subskrybowanie hashy, a potem wywoływanie eth_getTransactionByHash dla każdego z nich gubi transakcje?",
      options: [
        "Powiadomienia z hashem są przycinane do pierwszych 20 bajtów",
        "Wyszukiwanie po hashu przegląda bloki, ale nigdy mempool",
        "Powiadomienia używają innego hasha niż wyszukiwanie",
        "Część opuszcza mempool, zanim dotrze zapytanie"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym strumień newPendingTransactions z pełnymi obiektami z własnego węzła różni się od Mempool Dumpster od Flashbots?",
      options: [
        "Strumień to bieżący obraz jednego węzła; archiwum łączy źródła po fakcie",
        "Strumień obejmuje prywatny order flow; archiwum tylko publiczne mempoole",
        "Strumień przychodzi w kolejności bloku; archiwum jest posortowane po pierwszym zobaczeniu",
        "Strumień jest publikowany jako codzienny Parquet; archiwum to WebSocket na żywo"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Odbiorca czyta strumień transakcji pending z Geth wolniej, niż napływają powiadomienia. Co w końcu się stanie?",
      options: [
        "Geth po cichu odrzuca najstarsze powiadomienia i działa dalej",
        "Geth przełącza subskrypcję na same hashe, żeby oszczędzić pamięć",
        "Połączenie się zrywa, a każda subskrypcja na nim się kończy",
        "Geth wstrzymuje mempool, aż odbiorca nadrobi zaległości"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego transakcje z blobami docierają do mempoolu węzła później i mniej równomiernie niż inne typy transakcji?",
      options: [
        "Krążą tylko po topicach gossip warstwy konsensusu",
        "Są ogłaszane po hashu i pobierane na żądanie",
        "Peery wstrzymują je do początku następnego slotu",
        "Trafiają tylko do węzłów, na których działa walidator"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Monitor, który wyprzedza exploity na podstawie strumienia transakcji pending ze swojego węzła, nigdy nie zobaczył ataku, który później trafił do bloku. Które wyjaśnienie pasuje?",
      options: [
        "Jego węzeł wciąż się synchronizował i ignorował nowe transakcje",
        "Exploit użył transakcji z blobem, która omija mempoole",
        "Strumienie pending pomijają wywołania z dużym calldata",
        "Atak trafił prywatnie do builderów, nigdy do mempoolu"
      ],
      answer: 3
    }
  ],
  "eth-capabilities": [
    {
      kind: "scenario",
      question: "Router odczytuje state.oldestBlock w południe i używa tej liczby przez cały dzień, dla zasobu z oknem 128 bloków. Co się dzieje?",
      options: [
        "Węzeł serwuje dane od tej granicy, dopóki router nie zapyta ponownie",
        "Żądania blisko tej granicy zawodzą, bo prawdziwa granica wciąż rośnie",
        "Węzeł odrzuca wywołania routerów, które nie odświeżają danych co godzinę",
        "Żądania poniżej granicy węzeł przekazuje dalej do archiwum"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co znaczy brak deleteStrategy przy zasobie w wyniku eth_capabilities?",
      options: [
        "Jego dolna granica rośnie o blok z każdym blokiem, jak w każdym oknie",
        "Jego dane są wyłączone, a jego oldestBlock trzeba zignorować",
        "Jego dolna granica jest nieznana, więc węzeł trzeba sondować",
        "Jego dolna granica jest stała albo w ogóle jej nie ma"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym na archiwum Getha w schemacie path-based zasób stateproofs różni się od zasobu state?",
      options: [
        "Zależy od ustawienia historii trie node'ów, a nie od okna stanu",
        "Zawsze ma tę samą granicę co state, bo dowody czytają te same dane",
        "Jest raportowany tylko przy włączonej przestrzeni nazw trace",
        "Obejmuje też dowody receiptów i logów, nie tylko dowody kont"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Router parsuje retentionBlocks ściśle jako ciąg hex, tak jak wymaga schemat. Co zamiast tego mogą wysłać niektóre wersje Reth i Nethermind?",
      options: [
        "Dziesiętny string w cudzysłowie, na przykład 10064, zamiast cyfr hex",
        "Liczbę sekund, na przykład 120960, zamiast liczby bloków",
        "Zwykłą liczbę JSON, na przykład 10064, zamiast ciągu hex",
        "Parę numerów bloków, najstarszego i najnowszego, zamiast liczby"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Węzeł Besu po snap sync raportuje zasób state z disabled ustawionym na true. Co zrobi router, który weźmie to dosłownie?",
      options: [
        "Przestanie wysyłać mu odczyty stanu latest, na które wciąż by odpowiedział",
        "Wyśle mu odczyty archiwalne, na które odpowie ze snapshotu w cache",
        "Wyśle mu każde eth_getProof, bo dowody korzystają z innej bazy",
        "Usunie węzeł z routingu nagłówków i bloków, a nie tylko stanu"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego test zgodności eth_capabilities w execution-apis jest oznaczony jako speconly?",
      options: [
        "Metoda jest opcjonalna, więc hive nie może oblać klientów bez niej",
        "Wynik używa liczb całkowitych, których diff rpc-compat nie odczyta",
        "Retencja zależy od węzła i konfiguracji, więc wartości nie mogą się zgadzać",
        "Łańcuch testowy nie ma historii, więc każdy zasób wychodzi jako disabled"
      ],
      answer: 2
    }
  ]
};
