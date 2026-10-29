// Polish checkpoint questions for the Foundations lessons, keyed by topic id. Each topic's
// six questions match data/quizzes/foundations.js in order, kind, and answer position.
export const quizzes = {
  "ethereum-rpc": [
    {
      kind: "detail",
      question: "Klient konsensusu musi wskazać swojemu klientowi wykonawczemu nowy head łańcucha. Przez który interfejs to robi?",
      options: [
        "Engine API, na własnym uwierzytelnionym porcie",
        "JSON-RPC eth_, przez metodę eth_blockNumber",
        "Beacon API, przez jego ścieżki REST",
        "Provider EIP-1193, przez wywołania request"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Frontend dappa pokazuje salda tokenów, a panel stakingowy pokazuje statusy walidatorów. Z którego endpointu powinien czytać każdy z nich?",
      options: [
        "Dapp: JSON-RPC wykonawcze. Panel: Beacon API",
        "Dapp: Beacon API. Panel: JSON-RPC wykonawcze",
        "Dapp: JSON-RPC wykonawcze. Panel: Engine API",
        "Dapp: Engine API. Panel: Beacon API"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dwa sprawne endpointy mainnetu zwracają różne wyniki dla tego samego eth_getBalance na latest, wysłanego w tej samej chwili. Dlaczego każdy z nich może mieć rację?",
      options: [
        "Każdy odpowiedział według tego, jaki head widział w tej chwili jego węzeł",
        "Każdy dostawca trzyma salda w cache i odświeża je według własnego zegara",
        "Jeden odpowiedział z pending, bo latest nie ma uzgodnionego znaczenia",
        "JSON-RPC pozwala zwrócić przy odczycie dowolny stan z ostatniej sfinalizowanej epoki"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co weryfikacja dowodu stanu dodaje do zwykłej odpowiedzi JSON-RPC?",
      options: [
        "Sprawdzenie względem nagłówka, któremu wywołujący już ufa",
        "Podpis operatora węzła złożony pod odpowiedzią",
        "Gwarancję, że wartość pochodzi ze sfinalizowanego bloku",
        "To, że drugi dostawca zwraca tę samą wartość"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator wystawia port 8551 do internetu, bo wygląda jak zwykłe JSON-RPC. Co jest przez to zagrożone?",
      options: [
        "Kontrola nad tym, na którym bloku węzeł buduje",
        "Klucze podpisujące walidatora, które obsługuje ten port",
        "Nic poza obciążeniem, bo port służy tylko do odczytu",
        "Lista peerów węzła, którą przez ten port można edytować"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Dapp wywołuje window.ethereum.request, żeby odczytać saldo. Kto decyduje, który węzeł faktycznie odpowie?",
      options: [
        "Portfel w przeglądarce, który wstrzyknął providera",
        "Dapp, przez URL RPC przekazany do request",
        "Klient konsensusu sparowany z odpowiadającym węzłem",
        "Przeglądarka, która wybiera najszybszy publiczny endpoint"
      ],
      answer: 0
    }
  ],
  rpc: [
    {
      kind: "cause",
      question: "Dlaczego gateway RPC musi sparsować body JSON każdego żądania, zanim będzie mógł je routować, cache'ować lub zliczać?",
      options: [
        "Każde wywołanie to POST na jeden URL, więc metodę podaje tylko body",
        "JSON-RPC podpisuje każde body, a gateway musi sprawdzić ten podpis",
        "Numer bloku jest w nagłówku, który większość proxy usuwa",
        "Cache HTTP indeksuje wpisy po hashu body, a nie po ścieżce"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Wywołanie eth_sendRawTransaction kończy się timeoutem, zanim nadejdzie jakakolwiek odpowiedź. Co mogło już się stać po stronie serwera?",
      options: [
        "Węzeł już rozgłosił transakcję do swoich peerów",
        "Węzeł wycofał transakcję, gdy wywołanie skończyło się timeoutem",
        "Węzeł wstrzymuje transakcję, dopóki klient nie odeśle ACK",
        "Węzeł ją odrzucił, bo zatwierdza ją dopiero dostarczona odpowiedź"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Load balancer kieruje zapytanie o receipt do węzła, który jest o jeden blok za resztą. Transakcja trafiła do najnowszego bloku. Co wraca?",
      options: [
        "null, choć receipt istnieje już na innych węzłach",
        "Błąd z informacją, że transakcja wciąż jest w mempoolu",
        "Receipt pobrany na żądanie od zsynchronizowanego peera",
        "Receipt ze statusem 0x0, dopóki węzeł nie nadgoni"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co odróżnia interfejs węzła Ethereum oparty na czasownikach od projektu w stylu REST?",
      options: [
        "Jego jednostką jest nazwana metoda z argumentami, a nie zasób pod URL-em",
        "Używa GET do odczytów i POST do zapisów, a nie jednego czasownika",
        "Zwraca liczby jako ciągi hex, a REST jako liczby dziesiętne",
        "Pamięta sesję po stronie serwera, a REST nie pamięta żadnej"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego interfejs oparty na czasownikach lepiej pasuje do eth_estimateGas niż zasób REST?",
      options: [
        "Metoda wielokrotnie wykonuje kod, szukając wyniku; nie ma dokumentu do pobrania",
        "Jej wynik jest za duży, by zwrócić go w odpowiedzi na zwykłe żądanie GET",
        "Czasowniki REST nie przeniosą argumentów zakodowanych w hex, których wymaga ta metoda",
        "Odpowiedzi REST trafiają do cache, a szacunków gasu nigdy nie wolno cache'ować"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Każdy system RPC potrzebuje kanału błędów. Gdzie umieszcza go JSON-RPC w Ethereum?",
      options: [
        "W obiekcie błędu wewnątrz udanej odpowiedzi HTTP",
        "W kodzie statusu HTTP, z komunikatem w nagłówku",
        "W osobnym strumieniu błędów otwieranym obok każdego połączenia",
        "W polu result, jako ciąg znaków z prefiksem błędu"
      ],
      answer: 0
    }
  ],
  "json-rpc": [
    {
      kind: "detail",
      question: "Przenośna biblioteka ma wywoływać tylko metody zdefiniowane w specyfikacji execution-apis. Która z tych metod do nich należy?",
      options: ["eth_getLogs", "debug_traceTransaction", "trace_replayBlockTransactions", "txpool_content"],
      answer: 0
    },
    {
      kind: "scenario",
      question: "eth_getTransactionReceipt zwraca HTTP 200 z wynikiem null. Co to oznacza dla wywołującego?",
      options: [
        "Ten węzeł nie ma jeszcze receiptu tego hasha w żadnym bloku",
        "Transakcja zakończyła się revertem, więc nie zapisano receiptu",
        "Węzeł odrzucił żądanie, bo uznał parametry za źle sformatowane",
        "Węzeł wciąż się synchronizuje i odmawia odpowiedzi na odczyty"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dwa poprawnie zaimplementowane endpointy różnie obsługują to samo szerokie zapytanie eth_getLogs. Dlaczego jest to dozwolone?",
      options: [
        "Limity zakresu i rozmiaru odpowiedzi to decyzje operatora spoza specyfikacji",
        "Każdy klient koduje topics po swojemu, a specyfikacja na to pozwala",
        "Specyfikacja zostawia klientom decyzję, jak dopasowywać wildcardy w topics",
        "Logi indeksują wyłącznie węzły, które same wytworzyły dany blok"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jak żądanie przekazuje argumenty metody w JSON-RPC Ethereum?",
      options: [
        "Jako tablicę pozycyjną, zwykle z identyfikatorem bloku na końcu",
        "Jako obiekt z kluczami odpowiadającymi parametrom ze schematu",
        "Jako parametry query w URL, dopisane do ścieżki endpointu",
        "Jako tablicę pozycyjną, zwykle z identyfikatorem bloku na początku"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Zanim kod zacznie polegać na zachowaniu specyficznym dla klienta, trzeba ustalić, jakie oprogramowanie działa za endpointem. Która metoda to podaje?",
      options: ["web3_clientVersion", "eth_protocolVersion", "net_version", "eth_chainId"],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Kod napisany pod jednego dostawcę wywołuje eth_simulateV1 na innym endpoincie, który tej metody nie ma. Co wraca?",
      options: [
        "Błąd method not found z tego endpointu",
        "Wynik null wewnątrz udanej odpowiedzi",
        "Odpowiedź eth_call, którą węzeł podstawia w zamian",
        "HTTP 404, bo ścieżka tej metody nie istnieje"
      ],
      answer: 0
    }
  ],
  "request-response": [
    {
      kind: "detail",
      question: "Obiekt odpowiedzi zawiera pole result. Co z tego wynika dla pola error?",
      options: [
        "Nie ma go, bo odpowiedź zawiera jedno albo drugie",
        "Może też być obecne i nieść ostrzeżenia o wywołaniu",
        "Jest obecne z wartością null, co oznacza sukces wywołania",
        "Może przyjść w późniejszej ramce, jeśli wykonanie się nie powiedzie"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego klient JSON-RPC działający przez WebSocket trzyma mapę z id żądania na oczekujące wywołanie?",
      options: [
        "Węzeł odpowiada w kolejności kończenia pracy, a nie wysyłania",
        "Ramki w sockecie gubią nazwę metody i zostaje w nich tylko id",
        "Każdego id można użyć tylko raz w danym sockecie, więc trzeba je śledzić",
        "Węzeł odrzuca nowe żądanie, dopóki poprzednie nie dostanie ACK"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Która ramka na połączeniu WebSocket z węzłem Ethereum przychodzi w ogóle bez pola id?",
      options: [
        "Push z subskrypcji, z metodą eth_subscription",
        "Odpowiedź eth_subscribe, która zwraca identyfikator subskrypcji",
        "Każda pojedyncza odpowiedź w odpowiedzi na batch",
        "Odpowiedź na żądanie, w którym pominięto pole params"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Klient wysyła przez jeden WebSocket każde żądanie z id 1, po kilka naraz. Co się psuje?",
      options: [
        "Dwóch oczekujących odpowiedzi nie da się już odróżnić",
        "Węzeł odrzuca każde powtórzone id jako nieprawidłowe żądanie",
        "Węzeł kolejkuje każde żądanie, aż poprzednie się zakończy",
        "Subskrypcje przestają działać, bo dzielą identyfikator żądania"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Trzeba przekazać obiekt state override do eth_call. Gdzie w żądaniu ma się znaleźć?",
      options: [
        "Jako trzeci element params, po identyfikatorze bloku",
        "Jako nazwany klucz overrides w obiekcie params",
        "Jako drugi element params, przed identyfikatorem bloku",
        "Jako pole najwyższego poziomu żądania, obok params"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym różni się odpowiedź z result równym null od odpowiedzi z obiektem błędu?",
      options: [
        "null to udana odpowiedź: ten węzeł nie ma takiego obiektu",
        "null oznacza, że węzeł nie zdążył dokończyć wywołania przed timeoutem",
        "null oznacza, że węzeł odrzucił wywołanie bez podania powodu",
        "null oznacza, że metoda istnieje, ale operator ją wyłączył"
      ],
      answer: 0
    }
  ],
  "batch-request": [
    {
      kind: "detail",
      question: "Jak klient powinien powiązać każdy element odpowiedzi na batch z żądaniem, na które ten element odpowiada?",
      options: [
        "Po polu id, które zawiera każdy element",
        "Po pozycji w tablicy, którą serwer zachowuje",
        "Po nazwie metody odesłanej w każdym elemencie",
        "Po posortowaniu żądań i odpowiedzi według metody"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Klient wysyła w jednym batchu eth_getBalance i eth_getTransactionCount dla tego samego konta, oba z tagiem latest. Dlaczego odpowiedzi mogą sobie przeczyć?",
      options: [
        "Każdy element działa osobno, a między nimi może pojawić się nowy blok",
        "Saldo czyta się ze stanu, a nonce pochodzi z mempoola",
        "Większość klientów wykonuje elementy batcha w odwrotnej kolejności",
        "Węzeł trzyma salda w cache o jeden blok dłużej niż nonce"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co naprawdę oszczędza jeden batch z 500 elementami w porównaniu z 500 osobnymi zapytaniami o receipty?",
      options: [
        "Round tripy i handshake; węzeł i tak wykonuje każdy odczyt",
        "Pracę węzła, bo receipty są czytane w jednym przebiegu",
        "Limit zapytań, bo cały batch liczy się jako jedno żądanie",
        "Czas wykonania, bo elementy działają równolegle na jednym snapshocie"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Batch z 20 elementami wraca z błędem -32602 w jednym elemencie i z wynikami w dziewiętnastu pozostałych. Jaki wniosek powinien wyciągnąć klient?",
      options: [
        "Jeden element miał złe parametry; pozostałe wyniki są ważne",
        "Cały batch się nie powiódł i trzeba go wysłać ponownie w całości",
        "Dziewiętnaście wyników jest tymczasowych, dopóki błąd nie zniknie",
        "Serwer przerwał batch na elemencie, który się nie powiódł"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Klient wysyła batch tak duży, że body przekracza limit rozmiaru na serwerze. Co dostaje w odpowiedzi?",
      options: [
        "Błąd na poziomie HTTP bez obiektu błędu JSON-RPC",
        "Tablicę z błędem -32600 w każdym elemencie",
        "Wyniki dla elementów, które się zmieściły, a dla reszty błędy",
        "Tablicę z jednym błędem dla każdego obciętego elementu"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co Multicall3 daje zestawowi odczytów z kontraktów, czego batch JSON-RPC nie może zagwarantować?",
      options: [
        "Wykonanie dokładnie w jednym bloku, jako atomowy snapshot",
        "Osobne kody błędów dla każdego odczytu zamiast jednego wspólnego",
        "Równoległe wykonanie rozłożone na kilka węzłów upstream",
        "Zwolnienie z limitu gasu, który ogranicza pojedyncze eth_call"
      ],
      answer: 0
    }
  ],
  "rpc-errors": [
    {
      kind: "scenario",
      question: "eth_call wraca z kodem błędu 3 i polem data. Co się stało?",
      options: [
        "EVM wykonała wywołanie i nastąpił revert; data zawiera powód",
        "Parametry były błędne, więc w ogóle niczego nie wykonano",
        "Węzeł nie ma stanu z tego bloku, więc nie mógł go wykonać",
        "Dostawca nałożył rate limit; data zawiera czas do ponowienia"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Logika failoveru może wysłać nieudane wywołanie ponownie do innego upstreamu. Przy którym błędzie to faktycznie pomaga?",
      options: [
        "missing trie node przy odczycie stanu starego bloku",
        "invalid params z powodu źle sformatowanego adresu",
        "execution reverted z symulacji transferu tokena",
        "nonce too low zwrócone dla wysłanej podpisanej transakcji"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego kod aplikacji powinien opierać decyzje na kodzie błędu, a nie na jego komunikacie?",
      options: [
        "Treść komunikatów różni się między klientami i wydaniami",
        "Pole message jest opcjonalne i zwykle zostaje puste",
        "Komunikaty przychodzą tylko przez WebSocket, nigdy przez HTTP",
        "Kod jest podpisany przez węzeł, a komunikat nie jest"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "eth_getBalance dostaje liczbę JSON tam, gdzie oczekuje ciągu znaków z adresem. Jaki kod błędu zwraca węzeł?",
      options: ["-32602", "-32601", "-32600", "-32700"],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Procedura fallbacku wysyła eth_call zakończone revertem, przypięte do tego samego numeru bloku, do drugiego dostawcy. Co się dzieje?",
      options: [
        "Tam też kończy się revertem, bo wynik jest deterministyczny",
        "Udaje się, bo revert zależy od mempoolu jednego węzła",
        "Zwraca null, bo revert został już wcześniej zgłoszony",
        "Kończy się błędem -32005, bo wywołanie jest duplikatem"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co odróżnia błąd missing trie node od HTTP 429, gdy trzeba zdecydować, jak ponawiać?",
      options: [
        "Pierwszy wymaga węzła z większą ilością danych; drugi backoffu",
        "Pierwszy to błąd wywołującego; drugi to błąd braku danych na węźle",
        "Pierwszy można ponowić na tym samym węźle; drugiego nie wolno ponawiać",
        "Pierwszy oznacza zły numer bloku; drugi oznacza zły klucz API"
      ],
      answer: 0
    }
  ],
  "execution-apis": [
    {
      kind: "detail",
      question: "Gdzie znajduje się specyfikacja przestrzeni nazw trace_?",
      options: [
        "U każdego klienta, który ją implementuje, w jego dokumentacji",
        "W execution-apis, jako schemat obok eth_ i net_",
        "W EIP-1474, który wymienia ją jako opcjonalną przestrzeń nazw",
        "W repozytorium consensus-specs, obok Beacon API"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego Engine API jest podzielone na dokumenty dla poszczególnych forków, a metody eth_ kompilują się do jednego openrpc.json?",
      options: [
        "Niemal przy każdej aktualizacji sieci dostaje nową wersję metody",
        "Każdy fork zastępuje całe Engine API nowym protokołem",
        "Metody eth_ są zamrożone przez EIP-1474 i nie mogą się zmieniać",
        "Utrzymują je zespoły klientów konsensusu, a nie wykonawczych"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "W pełni zgodny endpoint odrzuca zapytanie eth_getLogs obejmujące 100 000 bloków. Czy to narusza specyfikację?",
      options: [
        "Nie; limity zakresu to decyzja wdrożeniowa, której specyfikacja nie obejmuje",
        "Tak; schemat ustala minimalny zakres, który musi obsłużyć każdy węzeł",
        "Tak; zgodność oznacza odpowiedź na każdy poprawnie zbudowany filtr",
        "Nie; eth_getLogs w ogóle leży poza specyfikacją"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jaką drogą nowa metoda, taka jak eth_simulateV1, zwykle staje się standardem?",
      options: [
        "Przez pull request, zwykle gdy zaimplementuje ją dwóch klientów",
        "Przez Interface EIP, który musi najpierw osiągnąć status Final",
        "Przez głosowanie zespołów klientów przy następnej aktualizacji sieci",
        "Przez przyjęcie jej jako rozszerzenia u największych dostawców RPC"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Metoda występuje w schemacie execution-apis. Co to mówi o endpoincie, z którego korzystasz?",
      options: [
        "Jej struktura jest zdefiniowana; o włączeniu decyduje operator",
        "Jest włączona, bo zgodne węzły muszą obsługiwać każdą metodę",
        "Jest obsługiwana, ale tylko przez listenery IPC i WebSocket",
        "Jest włączona, gdy węzeł skończy synchronizować swoją historię"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Programista pisze klienta dla ery Prague, korzystając wyłącznie z dokumentu Engine API dla Cancun. Co pójdzie nie tak?",
      options: [
        "Zaimplementuje starą strukturę payloadu, której fork już nie używa",
        "Pominie metody eth_, które przeniesiono do Engine API",
        "Użyje algorytmu podpisu JWT, który zmienił się w Prague",
        "Użyje złego portu, bo każdy fork przenosi port 8551"
      ],
      answer: 0
    }
  ],
  namespaces: [
    {
      kind: "detail",
      question: "Które przestrzenie nazw obejmuje specyfikacja Execution APIs?",
      options: [
        "eth_ i net_ oraz część debug_ i txpool_",
        "eth_, net_ i web3_, ale nic poza nimi",
        "eth_, debug_ i trace_, ale nie txpool_",
        "Każdą przestrzeń nazw klienta, łącznie z admin_"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Wywołanie trace_block na endpoincie Nethermind zwraca -32601. Jaka jest zwykle przyczyna?",
      options: [
        "Operator nie włączył na nim modułu trace",
        "Blok jest starszy niż okno tracingu węzła",
        "Żądanie przekroczyło rate limit endpointu",
        "Nethermind obsługuje tracing tylko w debug_"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego wystawienie txpool_ na publicznym listenerze jest ryzykowne?",
      options: [
        "Ujawnia transakcje, które nie trafiły jeszcze do bloku, czyli order flow",
        "Pozwala dowolnemu wywołującemu usuwać transakcje z mempoola",
        "Omija rate limity nałożone na metody z przestrzeni nazw eth_",
        "Zwraca klucze prywatne transakcji podpisanych lokalnie przez węzeł"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Dapp wywołuje eth_sendTransaction przez window.ethereum. Kto odpowiada na to wywołanie?",
      options: [
        "Portfel w przeglądarce, który ma klucze",
        "Publiczny węzeł, który podpisuje własnym kluczem",
        "Publiczny węzeł, który przekazuje je do portfela",
        "Nikt; publiczne węzły zwracają method not found"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym przestrzeń nazw debug_ różni się od przestrzeni nazw trace_?",
      options: [
        "debug_ ma format Getha, a trace_ format Parity",
        "debug_ tylko czyta, a trace_ może zmieniać stan węzła",
        "debug_ ma własny port, a trace_ używa wspólnego portu 8545",
        "debug_ jest tania w obsłudze, a trace_ jest kosztowna"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator włącza debug_ na publicznym listenerze na czas jednego dochodzenia i o tym zapomina. Na czym polega ryzyko?",
      options: [
        "Każdy może wyczerpać CPU węzła, wywołując tracing",
        "Każdy może dodawać i usuwać peery węzła",
        "Każdy może podpisywać kluczami trzymanymi przez węzeł",
        "Każdy widzi transakcje, zanim trafią do bloku"
      ],
      answer: 0
    }
  ],
  "http-transport": [
    {
      kind: "scenario",
      question: "Endpoint odpowiada kodem HTTP 429 z body w HTML-u. Gdzie jest obiekt błędu JSON-RPC?",
      options: [
        "Nie ma go; żądanie nie dotarło do warstwy JSON-RPC",
        "W nagłówku odpowiedzi, bo body jest zarezerwowane dla HTML-a",
        "W późniejszej ramce na tym samym połączeniu keep-alive",
        "Wewnątrz HTML-a, który klient powinien sparsować"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego transport HTTP nigdy nie dostarczy powiadomień eth_subscribe?",
      options: [
        "Każde żądanie dostaje jedną odpowiedź, a serwer nie odzywa się pierwszy",
        "JSON-RPC 2.0 zabrania powiadomień przez jakiekolwiek połączenie HTTP",
        "Payload powiadomień przekracza maksymalny rozmiar body HTTP",
        "HTTP nie przenosi ramek binarnych, których używają powiadomienia"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Która właściwość HTTP sprawia, że load balancing RPC jest trywialny, i która funkcja ją psuje?",
      options: [
        "Bezstanowość; psują ją filtry, bo istnieją tylko na jednym węźle",
        "Keep-alive; psuje ją gzip, bo kontekst kompresji należy do połączenia",
        "CORS; psuje ją TLS, bo każdy certyfikat wskazuje jeden host",
        "Batching; psuje ją eth_call, bo wymaga stanu archiwalnego"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Klient otwiera nowe połączenie HTTPS dla każdego drobnego odczytu. Co dominuje w koszcie każdego wywołania?",
      options: [
        "Handshake TLS powtarzany przy każdym żądaniu",
        "Parsowanie JSON-a w każdej odpowiedzi po stronie klienta",
        "Wykonanie każdego odczytu przez węzeł na jego stanie",
        "Dekompresja gzip w body każdej odpowiedzi"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Która flaga Getha ustawia originy, z których strona w przeglądarce może wywoływać listener HTTP?",
      options: ["--http.corsdomain", "--http.vhosts", "--ws.origins", "--authrpc.jwtsecret"],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Dapp, który rozmawia ze swoim węzłem przez HTTP, musi reagować na nowe bloki. Co musi zrobić?",
      options: [
        "Odpytywać eth_blockNumber co pewien czas i pobierać zmiany",
        "Otworzyć eth_subscribe przez HTTP z długim timeoutem żądania",
        "Wysłać jedno żądanie i czytać bloki w miarę napływania odpowiedzi",
        "Zarejestrować callback URL, na który węzeł wyśle bloki POST-em"
      ],
      answer: 0
    }
  ],
  "websocket-transport": [
    {
      kind: "consequence",
      question: "Połączenie WebSocket zrywa się na 40 sekund, a potem wraca. Co się stało z subskrypcją logów?",
      options: [
        "Zniknęła, a eventy z luki nigdy nie zostaną odtworzone",
        "Węzeł zbuforował jej eventy i odtworzy je po ponownym połączeniu",
        "Jej id pozostaje ważne, a strumień wznawia się tam, gdzie stanął",
        "Węzeł wysyła do socketu logi z ostatnich 128 bloków"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jak w strumieniu subskrypcji newHeads widać reorg?",
      options: [
        "parentHash bloku różni się od hasha poprzedniego bloku",
        "Przychodzi powiadomienie z flagą removed ustawioną na true",
        "Węzeł zamyka subskrypcję i wysyła nowe id",
        "Przychodzi powiadomienie z ujemnym numerem bloku"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego reverse proxy przed endpointem WebSocket często powoduje tajemnicze rozłączenia?",
      options: [
        "Jego idle timeout zamyka sockety, które milczą między eventami",
        "Nie potrafi przekazać ramek większych niż jeden megabajt JSON-a",
        "Terminacja TLS na proxy unieważnia identyfikatory subskrypcji",
        "Zmienia kolejność ramek w locie, co psuje klientowi dopasowanie po id"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Konsument logów łączy się ponownie po awarii. Co powinien zrobić, zanim zaufa nowemu strumieniowi na żywo?",
      options: [
        "Uzupełnić dane przez eth_getLogs od ostatniego przetworzonego bloku",
        "Użyć starego id subskrypcji, żeby węzeł wznowił dostarczanie",
        "Poprosić węzeł o odtworzenie pominiętych eventów przez eth_subscribe",
        "Poczekać na następny event newHeads, który niesie pominięte logi"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Po co wysyłać ramki ping i pong na poziomie protokołu na długo otwartym sockecie z subskrypcjami?",
      options: [
        "Sam TCP potrafi przez wiele minut pokazywać martwy socket jako otwarty",
        "Ramki pong niosą numer bloku head na potrzeby health checków",
        "Ramki ping odnawiają identyfikatory subskrypcji, zanim wygasną",
        "Ramki ping mówią węzłowi, które subskrypcje ma zachować"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Operator uruchamia Geth z --http.api eth,net,web3. Co to daje klientom WebSocket?",
      options: [
        "Nic; WebSocket to osobny listener z własną listą",
        "WebSocket na tym samym porcie, z tą samą listą przestrzeni nazw",
        "WebSocket tylko z przestrzenią nazw eth_, dopóki się go nie skonfiguruje",
        "WebSocket, gdy tylko ustawi się także --ws.origins"
      ],
      answer: 0
    }
  ],
  "ipc-transport": [
    {
      kind: "detail",
      question: "Co uwierzytelnia wywołującego, który łączy się przez transport IPC?",
      options: [
        "Uprawnienia systemu plików do pliku socketu",
        "Wspólny sekret JWT, tak jak w Engine API",
        "Klucz API wysłany w pierwszym wywołaniu JSON-RPC",
        "Identyfikator procesu wywołującego, sprawdzany z allowlistą"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego klienci włączają na IPC wszystkie przestrzenie nazw, a na HTTP tylko minimalny zestaw?",
      options: [
        "Samo otwarcie socketu oznacza już lokalny dostęp operatora",
        "IPC nie ma jak wyrazić filtra przestrzeni nazw przy starcie",
        "HTTP jest szybszy, więc jego metody potrzebują ostrzejszych limitów",
        "Engine API wymaga wszystkich przestrzeni nazw przez IPC"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Które obciążenie dobrze pasuje do transportu IPC?",
      options: [
        "Indekser skanujący logi na tym samym hoście co węzeł",
        "Dapp w przeglądarce, który czyta salda tokenów użytkowników",
        "Publiczny endpoint rozłożony na pulę węzłów za load balancerem",
        "Portfel mobilny wysyłający transakcje z telefonu"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Żeby zdalne narzędzie mogło dostać się do węzła, ktoś przekierowuje geth.ipc na port TCP narzędziem do przekazywania ruchu. Co w ten sposób powstało?",
      options: [
        "Zdalny, nieuwierzytelniony i w pełni uprzywilejowany interfejs",
        "Zdalny interfejs, który obsługuje tylko przestrzeń nazw eth_",
        "Zdalny endpoint nadal chroniony uprawnieniami socketu",
        "Zdalny endpoint, który wymaga tokenu JWT z Engine API"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Narzędzie w kontenerze nie może znaleźć geth.ipc, choć węzeł działa na tym samym hoście. Jaka jest prawdopodobna przyczyna?",
      options: [
        "Katalogu danych węzła nigdy nie podpięto do kontenera przez bind mount",
        "IPC przyjmuje tylko wywołujących, którzy działają jako root",
        "Geth domyślnie wyłącza IPC, dopóki nie ustawi się --ipcpath",
        "Socket przeniósł się na port TCP, gdy kontener wystartował"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co IPC ma wspólnego z WebSocketem, czego brakuje zwykłemu HTTP?",
      options: [
        "Długotrwałe, dwukierunkowe połączenie, więc działa eth_subscribe",
        "Sprawdzanie originu, które przeglądarki wymuszają przy każdym połączeniu",
        "Szyfrowanie TLS negocjowane podczas handshake'u otwierającego połączenie",
        "Osiągalność z innych hostów w tej samej sieci"
      ],
      answer: 0
    }
  ],
  "hex-encoding": [
    {
      kind: "detail",
      question: "Żądanie musi przekazać liczbę zero jako QUANTITY. Który zapis jest poprawny?",
      options: ["0x0", "0x00", "0x", "0"],
      answer: 0
    },
    {
      kind: "scenario",
      question: "eth_getBalance zwraca 0x21e19e0c9bab2400000. Jak bezpiecznie przechować tę wartość w JavaScript?",
      options: [
        "Sparsować przez BigInt, a ciąg dziesiętny tworzyć tylko do wyświetlenia",
        "Sparsować przez parseInt z podstawą 16 i zapisać jako zwykłą liczbę",
        "Zamienić przez Number() i zaokrąglić wynik do 18 miejsc po przecinku",
        "Zostawić ciąg hex i porównywać go jako tekst z innymi saldami"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "eth_getStorageAt zwraca wartość o długości 66 znaków, a eth_getBalance zwraca 0x1, choć obie oznaczają jedynkę. Skąd ta różnica?",
      options: [
        "Storage to 32-bajtowe DATA o stałej długości; saldo to QUANTITY bez dopełnienia",
        "Storage wraca w kolejności big-endian, a salda w kolejności little-endian",
        "Słowo storage niesie przed samą wartością dodatkowy bajt prefiksu typu",
        "Saldo zostało skrócone, bo mieści się w małej liczbie całkowitej"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego 0x01 to błędny numer bloku w żądaniu?",
      options: [
        "Wartości QUANTITY nie mogą mieć zer wiodących",
        "Numery bloków trzeba wysyłać jako ciągi dziesiętne",
        "Numery bloków to DATA i wymagają pełnych 32 bajtów",
        "Cyfry hex w QUANTITY muszą być wielkimi literami"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Dwie poprawne kopie tego samego adresu nie przechodzą zwykłego porównania ciągów znaków. Jaka jest prawdopodobna przyczyna?",
      options: [
        "Jedna ma mieszaną wielkość liter z EIP-55, druga małe litery",
        "Jedna ma po swoich 20 bajtach dodatkowy bajt checksumy",
        "Jedna jest zapisana w big-endian, a druga w little-endian",
        "Jedna zachowuje wiodące bajty zerowe, a druga je pomija"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Dekoder traktuje każdą wartość w obiekcie logu jak ciąg hex. Gdzie się myli?",
      options: [
        "Przy polu removed, które jest booleanem JSON",
        "Przy logIndex, które jest DATA dopełnionym do 32 bajtów",
        "Przy topics, które są przesyłane jako ciągi dziesiętne",
        "Przy address, który jest wartością QUANTITY bez zer"
      ],
      answer: 0
    }
  ],
  "block-tag": [
    {
      kind: "cause",
      question: "Który tag bloku może się cofnąć i dlaczego?",
      options: [
        "latest, bo fork choice może podmienić head podczas reorgu",
        "finalized, bo klient konsensusu przelicza go w każdej epoce",
        "earliest, bo history expiry usuwa najstarsze bloki",
        "safe, bo synchronizujący się węzeł resetuje go do genesis"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Klient wykonawczy dalej obsługuje RPC po zatrzymaniu swojego klienta konsensusu. Co dzieje się z odczytami z tagiem finalized?",
      options: [
        "Odpowiadają ze sfinalizowanego bloku, który przestał się przesuwać",
        "Kończą się błędem, który wskazuje brak klienta konsensusu",
        "Po cichu przechodzą na odpowiedzi z bloku latest",
        "Zwracają null, dopóki klient konsensusu się nie połączy"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Saldo tokena i całkowita podaż tego tokena muszą być ze sobą zgodne. Co powinno przekazać każde z tych wywołań?",
      options: [
        "Ten sam jawny numer albo hash bloku",
        "latest w każdym, wysłane razem w jednym batchu",
        "pending w każdym, żeby uwzględnić świeże transakcje",
        "finalized dla salda i latest dla podaży"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co zmienia dodanie requireCanonical: true do obiektu EIP-1898 z hashem bloku?",
      options: [
        "Węzeł zwraca błąd, jeśli ten hash nie jest już kanoniczny",
        "Węzeł czeka, aż wskazany blok zostanie sfinalizowany",
        "Węzeł odpowiada z kanonicznego bloku na tej wysokości",
        "Węzeł najpierw sprawdza ten hash u drugiego peera"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym tag pending różni się od tagu latest?",
      options: [
        "To zgadywany przez jeden węzeł następny blok, złożony z jego mempoolu",
        "To następny blok, już uzgodniony przez proposera",
        "To blok head przed wykonaniem jego transakcji",
        "To blok head w takiej postaci, w jakiej widzi go większość peerów"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Giełda księguje wpłaty i nie może cofnąć raz zaksięgowanej kwoty. Jakiego tagu powinna używać przy odczytach, którymi sprawdza wpłaty?",
      options: [
        "finalized, utrwalony przez Casper FFG",
        "safe, uznany za mało podatny na reorg",
        "latest, head wybrany przez ten węzeł",
        "pending, blok, którego węzeł spodziewa się jako następnego"
      ],
      answer: 0
    }
  ],
  "chain-id": [
    {
      kind: "cause",
      question: "Co uniemożliwia powtórzenie na mainnecie transakcji podpisanej dla Sepolii?",
      options: [
        "Chain ID jest objęty podpisem, więc w innym łańcuchu odzyskanie nadawcy zawodzi",
        "Węzły sprawdzają każdy hash na wspólnej, międzyłańcuchowej czarnej liście",
        "Nonce w tych dwóch sieciach pochodzą z zakresów, które nigdy się nie pokrywają",
        "Mainnet odrzuca każdą cenę gasu podaną przez testnet"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "eth_chainId zwraca 0x1, a net_version zwraca 1. Której wartości powinien użyć podpisujący i dlaczego?",
      options: [
        "eth_chainId, bo według EIP-155 podpis obejmuje chain ID",
        "net_version, bo string dziesiętny łatwiej porównać",
        "Dowolnej, bo specyfikacja wymaga, by były identyczne",
        "net_version, bo to network ID sprawdzają peery"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Failover przełącza ruch na upstream bez ponownego sprawdzenia eth_chainId. Jaki jest najgorszy możliwy skutek?",
      options: [
        "Odczyty i zapisy po cichu trafiają do innej sieci",
        "Podpisane transakcje są odrzucane, bo nonce się zresetował",
        "Nowy upstream odrzuca wywołania, dopóki nie pozna ID",
        "Salda są w złej jednostce, dopóki cache się nie odświeży"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Endpoint zwraca dokładnie taki chain ID, jakiego oczekuje aplikacja. Czego to dowodzi?",
      options: [
        "Że podaje się za właściwą sieć, a nie że jest autentyczny",
        "Że to w pełni zsynchronizowany węzeł w łańcuchu kanonicznym",
        "Że jego operator figuruje w rejestrze łańcuchów",
        "Że jego odpowiedzi są podpisane dla tej sieci"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Kod porównuje wynik eth_chainId ze stringiem 0x01 i na mainnecie zgłasza niezgodność. Dlaczego?",
      options: [
        "0x1 i 0x01 to ta sama liczba, ale inny tekst",
        "Mainnet zwraca swój chain ID jako string dziesiętny 1",
        "Chain ID mainnetu jest dopełniony do czterech bajtów, 0x00000001",
        "Endpoint obsługuje testnet, którego ID też zaczyna się od 0x0"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Użytkownik przełącza sieć w portfelu, a dapp dostaje chainChanged. Co powinien zrobić dapp?",
      options: [
        "Odczytać wszystko od nowa, bo adresy i dane w cache są inne",
        "Nic, bo portfel sam przepisuje oczekujące odczyty",
        "Ponownie podpisać transakcje pending z nowym nonce dla tego łańcucha",
        "Najpierw wywołać net_version, bo chainChanged można podrobić"
      ],
      answer: 0
    }
  ],
  "execution-layer": [
    {
      kind: "contrast",
      question: "O czym warstwa wykonawcza nadal decyduje sama od czasu Merge?",
      options: [
        "Czy podpis, nonce i gas transakcji są poprawne",
        "Który z dwóch konkurujących bloków wybrać na head łańcucha",
        "Kiedy checkpoint zebrał dość głosów, by go sfinalizować",
        "Który walidator ma zaproponować blok w następnym slocie"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "W pełni zsynchronizowany klient wykonawczy ma 50 peerów, ale jego najnowszy blok jest sprzed godziny. Jaka jest prawdopodobna przyczyna?",
      options: [
        "Jego klient konsensusu nie steruje nim przez Engine API",
        "Jego mempool jest pełny i blokuje import nowych bloków",
        "Jego listener JSON-RPC nakłada rate limit na aktualizacje własnego heada",
        "Brakuje mu stanu historycznego, więc odmawia importu bloków"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Przez którą sieć warstwa wykonawcza rozgłasza transakcje ze swojego mempoolu?",
      options: [
        "devp2p, między klientami wykonawczymi",
        "gossip libp2p, między węzłami Beacon Chain",
        "Engine API, do własnego klienta konsensusu",
        "Strumień SSE (server-sent events) z Beacon API"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Potrzebne są saldo walidatora i najnowsze checkpointy finalności. Gdzie o nie zapytać?",
      options: [
        "Beacon API klienta konsensusu",
        "eth_getBalance w JSON-RPC wykonawczym",
        "eth_getBlockByNumber z tagiem finalized",
        "engine_forkchoiceUpdated w Engine API"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Kod odczytuje pole difficulty bloku, żeby ustalić, czy łańcuch używa proof of work. Co widzi na współczesnych blokach?",
      options: [
        "Stałe zero, bo pola z czasów kopania są szczątkowe",
        "Ostatnią trudność z proof of work, zamrożoną w chwili Merge",
        "Rosnącą wartość, która odzwierciedla udział walidatorów",
        "Łączny stake zabezpieczający Beacon Chain, w gwei"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego tagi safe i finalized są faktami konsensusu, nawet w JSON-RPC warstwy wykonawczej?",
      options: [
        "Klient konsensusu wskazuje te bloki przez Engine API",
        "Klient wykonawczy wylicza je z głosów własnych peerów",
        "Klienci wykonawczy co slot odczytują je z Beacon API",
        "Wylicza się je z głębokości bloku, licząc 64 potwierdzenia"
      ],
      answer: 0
    }
  ],
  "consensus-layer": [
    {
      kind: "detail",
      question: "Jaki interfejs klient konsensusu udostępnia aplikacjom i operatorom?",
      options: [
        "REST-owe Beacon API, zwykle na porcie 5052",
        "To samo JSON-RPC eth_, które obsługują klienci wykonawczy",
        "Tylko Engine API, na uwierzytelnionym porcie 8551",
        "Endpoint GraphQL na domyślnym porcie 8545"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego numery bloków wykonawczych i numery slotów konsensusu z czasem coraz bardziej się rozjeżdżają?",
      options: [
        "Pominięty slot jest liczony, ale nie daje bloku wykonawczego",
        "Numery slotów zaczynają się od zera na początku każdej epoki",
        "Bloki wykonawcze są numerowane od Merge, a nie od bloku genesis",
        "Każdy blok wykonawczy zajmuje w łańcuchu dwa kolejne sloty"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Klient konsensusu importuje nowy blok otrzymany przez gossip. Jakie wywołania Engine API wykonuje i w jakiej kolejności?",
      options: [
        "engine_newPayload, potem engine_forkchoiceUpdated",
        "engine_getPayload, potem engine_newPayload",
        "engine_forkchoiceUpdated, potem engine_getPayload",
        "engine_exchangeCapabilities, potem engine_newPayload"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Ile trwa slot i ile slotów składa się na epokę?",
      options: [
        "12 sekund, 32 sloty na epokę",
        "12 sekund, 64 sloty na epokę",
        "6,4 minuty, 32 sloty na epokę",
        "15 sekund, 32 sloty na epokę"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Aplikacja prosi węzeł konsensusu o blob opublikowany dwa miesiące temu. Co dostaje?",
      options: [
        "Nic; dane blobów są przechowywane przez około 18 dni",
        "Blob, bo węzły konsensusu trzymają każdy sidecar",
        "Blob pobrany na żądanie od klienta wykonawczego",
        "Sam dowód KZG, bo dane blobów są trzymane przez 4096 slotów"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym różnią się zadania LMD-GHOST i Casper FFG?",
      options: [
        "LMD-GHOST wybiera head; Casper FFG finalizuje checkpointy",
        "LMD-GHOST finalizuje checkpointy; Casper FFG wybiera head",
        "LMD-GHOST wybiera proposerów; Casper FFG wybiera atestujących",
        "LMD-GHOST działa w warstwie wykonawczej; Casper FFG w warstwie konsensusu"
      ],
      answer: 0
    }
  ],
  "engine-api": [
    {
      kind: "scenario",
      question: "Walidator klienta konsensusu ma zaproponować blok w następnym slocie. Które wywołanie każe klientowi wykonawczemu zacząć budować blok?",
      options: [
        "engine_forkchoiceUpdated z payloadAttributes",
        "engine_getPayload z numerem docelowego slotu",
        "engine_newPayload z pustą listą transakcji",
        "engine_exchangeCapabilities z indeksem proposera"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "engine_newPayload odpowiada statusem SYNCING. Co mówi klient wykonawczy?",
      options: [
        "Brakuje mu przodków payloadu, więc nie może go jeszcze ocenić",
        "Payload jest nieprawidłowy, ale walidacja zostanie ponowiona później",
        "Payload został przyjęty i zostanie wykonany w następnym slocie",
        "Jego JWT wygasł, więc żądanie odrzucono przed wykonaniem"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego różnica zegarów między dwoma hostami sprawia, że Engine API odrzuca każde wywołanie?",
      options: [
        "Claim iat każdego JWT musi być w granicach około 60 sekund od czasu serwera",
        "Timestampy payloadów muszą zgadzać się ze slotem co do sekundy",
        "Plik z sekretem JWT jest rotowany według harmonogramu opartego na zegarze",
        "Klient konsensusu odrzuca odpowiedzi, które przychodzą po zakończeniu slotu"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym status payloadu ACCEPTED różni się od INVALID?",
      options: [
        "ACCEPTED: poprawny format, boczna gałąź. INVALID: łamie reguły",
        "ACCEPTED został wykonany i jest poprawny; INVALID nie przeszedł weryfikacji podpisu",
        "ACCEPTED czeka na sprawdzenie JWT; INVALID tego sprawdzenia nie przeszedł",
        "ACCEPTED jest w kolejce na następny slot; INVALID zostaje odrzucony"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator aktualizuje klienta wykonawczego przed forkiem, ale klienta konsensusu zostawia bez zmian. Co dzieje się przy forku?",
      options: [
        "Węzeł staje, bo para nie zgadza się co do wersji metod",
        "Węzeł działa dalej, wracając do starszych wersji metod",
        "Psują się tylko transakcje z blobami, bo starszy klient je ignoruje",
        "Węzeł ostrzega o niezgodności, ale dalej podąża za head"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jak każde żądanie Engine API dowodzi, że pochodzi od sparowanego klienta konsensusu?",
      options: [
        "JWT HS256 podpisany wspólnym sekretem, w nagłówku Bearer",
        "Certyfikat klienta sprawdzany podczas handshake'u TLS na 8551",
        "Klucz walidatora podpisuje każde body żądania przed wysłaniem",
        "Klucz API w ścieżce URL, skopiowany z pliku jwt.hex"
      ],
      answer: 0
    }
  ],
  "beacon-api": [
    {
      kind: "detail",
      question: "Jak wywołujący wskazuje, dla którego stanu albo bloku beacon ma odpowiedzieć ścieżka Beacon API?",
      options: [
        "Identyfikatorem typu head, finalized, numer slotu albo root",
        "Tagiem bloku JSON-RPC umieszczonym w body żądania",
        "Wyłącznie 32-bajtowym rootem, bo sloty mogą być puste",
        "Numerem bloku wykonawczego, który klient sam mapuje"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Potrzebne są dane, które istnieją wyłącznie po stronie konsensusu. Które żądanie musi trafić do Beacon API?",
      options: [
        "Status walidatora i bieżący checkpoint justified",
        "gasUsed i effectiveGasPrice z receiptu transakcji",
        "Slot storage kontraktu w stanie z bloku finalized",
        "Base fee i zużyty gas ostatniego bloku"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co jest po stronie konsensusu odpowiednikiem eth_subscribe, jeśli chodzi o informacje o reorgach?",
      options: [
        "Strumień eventów /eth/v1/events, topic chain_reorg",
        "WebSocket na porcie 5052 z formatem komunikatu eth_subscribe",
        "Odpytywanie /eth/v1/node/syncing i porównywanie odpowiedzi",
        "Callback zarejestrowany przez engine_forkchoiceUpdated"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Narzędzie napisane dla JSON-RPC wywołuje ścieżkę Beacon API i szuka pól result i error. Co znajduje?",
      options: [
        "Pole data, a błędy sygnalizowane statusem HTTP",
        "result i error, zagnieżdżone poziom niżej w polu data",
        "result i error, bo te API mają wspólny format komunikatu",
        "Pole id, które musi dopasować do swojego żądania"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Narzędzie ma poznać stałe specyfikacji sieci i harmonogram forków, zamiast wpisywać je na sztywno. Która grupa ścieżek to udostępnia?",
      options: ["/eth/v1/config", "/eth/v1/node", "/eth/v1/debug", "/eth/v1/validator"],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego wystawienie Beacon API pod publicznym adresem to prawdziwa decyzja, a nie formalność?",
      options: [
        "Brak w nim uwierzytelniania, a część ścieżek jest droga lub wrażliwa",
        "Dzieli port 5052 z gossipem, który wtedy przestaje działać",
        "Jego odpowiedzi zawierają klucze do podpisywania klienta walidatora",
        "Domyślnie udostępnia też Engine API, na tym samym porcie"
      ],
      answer: 0
    }
  ],
  "the-merge": [
    {
      kind: "detail",
      question: "Które pole nagłówka bloku wykonawczego po Merge niesie losowość warstwy konsensusu?",
      options: [
        "mixHash, które teraz zawiera prevRandao",
        "difficulty, które teraz zawiera RANDAO reveal",
        "nonce, które teraz zawiera indeks proposera",
        "extraData, które teraz zawiera root bloku beacon"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Który dodatek do JSON-RPC warstwy wykonawczej przyszedł razem z samym Merge?",
      options: [
        "Tagi bloków safe i finalized",
        "Tag bloku pending",
        "Pole baseFeePerGas z EIP-1559",
        "Pole withdrawals w obiektach bloków"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Po Merge operator nadal uruchamia tylko klienta wykonawczego, jak wcześniej. Co robi węzeł?",
      options: [
        "Przestaje podążać za łańcuchem, bo nic nie wskazuje mu head",
        "Dalej kopie bloki, aż osiągnie swój cel trudności",
        "Sam śledzi head, nasłuchując gossipu z Beacon Chain",
        "Podąża za łańcuchem, ale nie obsługuje już eth_call"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Merge zmienił to, kto produkuje bloki. Czego nie ruszył?",
      options: [
        "Limitów gasu, opłat i przepustowości",
        "Pól difficulty i nonce w nagłówku",
        "Nagrody za blok w każdym bloku wykonawczym",
        "Czasu bloków, który pozostał procesem Poissona"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Dekoder zakłada, że każdy blok po Merge ma pole withdrawals. Na czym się wyłoży?",
      options: [
        "Na blokach sprzed Shapella, czyli sprzed kwietnia 2023",
        "Na blokach po Dencun, który zmienił nazwę tego pola",
        "Na pustych blokach, które pomijają to pole",
        "Na blokach z pominiętych slotów, które nie mają payloadu"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego po Merge odpytywanie o nowe bloki stało się bardziej przewidywalne?",
      options: [
        "Bloki idą według 12-sekundowego harmonogramu slotów, a nie procesu Poissona",
        "Klienci zaczęli wysyłać każdy nowy blok w trybie push do wszystkich wywołujących przez HTTP",
        "Engine API skróciło czas bloku do stałych sześciu sekund",
        "Usunięto bombę trudności, co ustabilizowało czas bloków"
      ],
      answer: 0
    }
  ],
  eip: [
    {
      kind: "contrast",
      question: "EIP ma status Final. Co mówi ten status?",
      options: [
        "Że jego tekst jest zamrożony, a nie że gdzieś działa",
        "Że trafił na mainnet w dniu podanym w nagłówku",
        "Że każdy klient wykonawczy już go wdrożył",
        "Że żaden późniejszy EIP nie może go zastąpić ani poprawić"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Który EIP dodał możliwość przekazania metodom odczytu obiektu z hashem bloku zamiast numeru?",
      options: ["EIP-1898", "EIP-1474", "EIP-1186", "EIP-155"],
      answer: 0
    },
    {
      kind: "detail",
      question: "Gdy implementacja musi rozstrzygnąć, czego wymaga EIP, która sekcja jest normatywna?",
      options: ["Specification", "Motivation", "Rationale", "Security Considerations"],
      answer: 0
    },
    {
      kind: "cause",
      question: "Standard tokenów, wciąż w statusie Draft, działa już w tysiącach wdrożonych kontraktów. Jak to możliwe?",
      options: [
        "ERC nie wymaga aktualizacji sieci; status dotyczy tylko tekstu",
        "Zespoły klientów aktywują ERC w statusie Draft na mainnecie wcześniej, do testów",
        "ERC w statusie Draft można wdrażać, gdy wejdą w etap Last Call",
        "Te kontrakty działają na testnetach, gdzie ERC w statusie Draft są aktywne"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Po aktualizacji Pectra eth_getCode dla konta EOA zwraca niepuste bajty. Który EIP to wyjaśnia?",
      options: [
        "EIP-7702, transakcje ustawiające kod",
        "EIP-2718, format transakcji typowanych",
        "EIP-1186, dowody konta i storage",
        "EIP-4895, wypłaty walidatorów"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "EIP-1559 zmienił to, co zwraca RPC, bez dodawania metody. Co dodał do odpowiedzi?",
      options: [
        "baseFeePerGas w blokach i effectiveGasPrice w receiptach",
        "blobGasUsed w receiptach i blob base fee w blokach",
        "Listę withdrawals w blokach i withdrawals root",
        "Bajt typu w każdej transakcji, receipcie i envelope"
      ],
      answer: 0
    }
  ],
  hardfork: [
    {
      kind: "detail",
      question: "Jak od Merge aktywuje się fork warstwy wykonawczej?",
      options: [
        "W timestampie uniksowym z konfiguracji łańcucha klienta",
        "Gdy kwalifikowana większość walidatorów zgłosi gotowość on-chain",
        "Na numerze bloku, nad którym walidatorzy głosują przed forkiem",
        "Gdy klient konsensusu wyśle forkchoiceUpdated z flagą forka"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Która aktualizacja sieci jako pierwsza wprowadziła transakcje blobowe na mainnecie?",
      options: ["Dencun, w marcu 2024", "Shapella, w kwietniu 2023", "Pectra, w maju 2025", "Fusaka, w grudniu 2025"],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego ścisły dekoder JSON, który odrzuca nieznane klucze, jest ryzykowny przy aktualizacjach?",
      options: [
        "Aktualizacje dodają pola, więc padnie na pierwszym bloku po forku",
        "Aktualizacje zmieniają reguły kodowania hex w już istniejących polach",
        "Aktualizacje zmieniają nazwy istniejących pól, zamiast dodawać nowe",
        "Aktualizacje przełączają odpowiedzi z blokami z formatu JSON na SSZ"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Pectra to nazwa sklejona z dwóch. Które dwa forki łączy, po jednym na warstwę?",
      options: [
        "Prague w warstwie wykonawczej i Electra w warstwie konsensusu",
        "Electra w warstwie wykonawczej i Prague w warstwie konsensusu",
        "Paris w warstwie wykonawczej i Electra w warstwie konsensusu",
        "Prague w warstwie wykonawczej i Deneb w warstwie konsensusu"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Kod robi switch po polu type transakcji i rzuca wyjątek przy nieznanej wartości. Co się stanie przy aktualizacji, która dodaje nowy typ?",
      options: [
        "Zepsuje się na pierwszej transakcji nowego typu",
        "Będzie działał dalej, bo węzły ukrywają nowe typy przed starszym kodem",
        "Zepsuje się, gdy węzeł zrestartuje się z nową listą typów",
        "Odrzuci pierwszy blok po forku, bez względu na jego zawartość"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Gdzie najlepiej najpierw wyłapać dekoder, który psuje się na nowych polach nadchodzącej aktualizacji?",
      options: [
        "Na publicznym testnecie, który forkuje tygodnie przed mainnetem",
        "Na pierwszym bloku mainnetu po forku, a potem wycofać wdrożenie",
        "Na węźle archiwalnym, który dostaje nowe pola jako pierwszy",
        "W sekcji Rationale danego EIP, która wymienia każde nowe pole"
      ],
      answer: 0
    }
  ],
  testnets: [
    {
      kind: "scenario",
      question: "Trzeba przećwiczyć oprogramowanie walidatora i stakingu na publicznym testnecie. Która sieć pasuje?",
      options: [
        "Hoodi, chain ID 560048",
        "Sepolia, chain ID 11155111",
        "Holesky, chain ID 17000",
        "Ephemery, resetowana w stałym cyklu"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego ten sam kod może działać na Sepolii, a potem zawieść na mainnecie?",
      options: [
        "Testnety forkują wcześniej, więc pola może jeszcze nie być na mainnecie",
        "Testnety używają innego kodowania hex dla wartości QUANTITY",
        "Klienci na testnetach domyślnie włączają dodatkowe przestrzenie nazw JSON-RPC",
        "Obiekty bloków na testnetach pomijają kilka pól, które ma mainnet"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Jakie sprawdzenie wyłapie wdrożenie przypadkiem skierowane do niewłaściwej sieci?",
      options: [
        "Porównanie eth_chainId z oczekiwaną wartością przy połączeniu",
        "Porównanie web3_clientVersion z oczekiwanym klientem",
        "Sprawdzenie przed startem, czy eth_syncing zwraca wartość false",
        "Sprawdzenie, czy timestamp najnowszego bloku jest świeży"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym zbiór walidatorów Sepolii różni się od zbioru walidatorów Hoodi?",
      options: [
        "Na Sepolii jest zamknięty (permissioned), na Hoodi otwarty (permissionless)",
        "Na Sepolii jest otwarty (permissionless), na Hoodi zamknięty (permissioned)",
        "Na Sepolii resetuje się w stałym cyklu, na Hoodi nigdy",
        "Na Sepolii jest wspólny z mainnetem, na Hoodi osobny"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Zespół stroi strategię opłat na Sepolii i bez zmian wdraża ją na mainnecie. Co prawdopodobnie pójdzie źle?",
      options: [
        "Strategia nie zetknęła się z realną presją opłat ani konkurencją",
        "Sepolia wycenia gas w innej jednostce niż mainnet",
        "Mainnet odrzuca pola opłat, które obliczono na testnecie",
        "Reguła base fee jest inna, bo EIP-1559 działa tylko na mainnecie"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co wyróżnia Ephemery i czyni ją przydatną do testów automatycznych?",
      options: [
        "Resetuje się w stałym cyklu, więc nigdy nie gromadzi stanu",
        "Działa na jednym kliencie, więc wyniki nie różnią się między przebiegami",
        "Nie ma limitów faucetów, więc testy mogą wybić dowolnie dużo etheru",
        "Forkuje kilka tygodni przed Sepolią, więc testy pierwsze widzą aktualizacje"
      ],
      answer: 0
    }
  ],
  ephemery: [
    {
      kind: "detail",
      question: "Jak powstaje chain ID iteracji Ephemery?",
      options: [
        "Nowe losowe ID wybierane przy każdym nowym genesis",
        "39438000 plus numer iteracji",
        "11155111 plus numer iteracji",
        "Jedno stałe ID, 39438000, zachowane między resetami"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego Ephemery zmienia chain ID przy każdym resecie?",
      options: [
        "Żeby publiczne endpointy RPC mogły w każdym okresie zmieniać adresy URL",
        "Żeby walidatorzy musieli generować nowe klucze dla każdej iteracji",
        "Żeby transakcje podpisane dla jednej iteracji nie przeszły w następnej",
        "Żeby rejestr ethereum-lists mógł przydzielić sieci nowy wpis"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Indekser na Ephemery wznawia pracę po resecie i znajduje niższy head z innymi hashami na każdej wysokości. Co powinien zrobić?",
      options: [
        "Wykryć nowy chain ID albo hash genesis i przebudować indeks od zera",
        "Cofać się blok po bloku, jak przy każdym reorgu łańcucha",
        "Poczekać na finalność, bo nowe bloki mogą jeszcze zostać zastąpione",
        "Zachować dane i indeksować tylko bloki powyżej starego kursora"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Operator uruchamia Geth i Lighthouse z pobranych plików genesis Ephemery i po resecie restartuje je bez czyszczenia danych. Co się stanie?",
      options: [
        "Węzły wznowią pracę i automatycznie podążą za nową iteracją",
        "Węzły dołączą, ale ich walidatorzy zaczną z zerowym saldem",
        "Węzły zsynchronizują nowy łańcuch, zachowując stan z poprzedniego okresu",
        "Węzły nie dołączą do nowej iteracji na starych bazach danych"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym Ephemery różni się od Sepolii jako miejsce do testowania oprogramowania stakingowego?",
      options: [
        "Zachowuje stan na zawsze, co lepiej pasuje do długotrwałych testów",
        "W każdym okresie startuje od nowa z uzupełnionymi faucetami",
        "Nie ma walidatorów, więc nie da się na niej testować stakingu",
        "Aktualizuje się później niż Sepolia, więc nowe funkcje przychodzą późno"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Co wyznacza górną granicę długości okresu resetu Ephemery?",
      options: [
        "Miejsce na dysku, którego klient potrzebuje, gdy stan rośnie w trakcie okresu",
        "Wygaśnięcie ochrony przed powtórzeniem z EIP-155 po miesiącu",
        "Salda faucetów, które kończą się w połowie miesiąca",
        "Utrzymanie walidatorów genesis powyżej dwóch trzecich do resetu"
      ],
      answer: 3
    }
  ],
  "gnosis-chain": [
    {
      kind: "scenario",
      question: "Giełda księguje wypłaty ze stakingu na Gnosis, obserwując natywne saldo każdego adresu wypłat. Co przeoczyła?",
      options: [
        "Przychodzą jako GNO do odebrania w kontrakcie depozytowym, nie jako xDAI",
        "Przychodzą jako xDAI, ale dopiero po sfinalizowaniu każdej epoki",
        "Przychodzą zamiast tego jako logi emitowane przez kontrakt nagród za bloki",
        "Przychodzą jako natywne GNO, którego eth_getBalance w ogóle nie raportuje"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego saldo xDAI adresu na Gnosis może rosnąć bez żadnej transakcji i logu?",
      options: [
        "Priority fee trafia na adres każdego walidatora jako natywne dopisanie",
        "Wywołanie systemowe kontraktu nagród dopisuje xDAI wybite przez bridge",
        "Wypłaty dopisują xDAI na adresy walidatorów przy każdym sweepie w bloku",
        "Zwroty gasu są dopisywane na koniec każdego bloku jako natywne płatności"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Jak długość slotu i epoki w Gnosis Chain wypada na tle mainnetu Ethereum?",
      options: [
        "Sloty 12-sekundowe i epoki po 16 slotów, wobec 12 sekund i 32 slotów",
        "Sloty 5-sekundowe i epoki po 32 sloty, wobec 12 sekund i 32 slotów",
        "Sloty 2-sekundowe i epoki po 64 sloty, wobec 12 sekund i 32 slotów",
        "Sloty 5-sekundowe i epoki po 16 slotów, wobec 12 sekund i 32 slotów"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Co dzieje się z opłatą base fee z EIP-1559 na Gnosis Chain?",
      options: [
        "Jest spalana, dokładnie jak na mainnecie Ethereum od London",
        "Trafia na adres fee collectora, zamiast zostać spalona",
        "Wraca do nadawcy, gdy blok zostanie sfinalizowany",
        "Trafia do proposera bloku razem z priority fee"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Backend eksploratora pomija każdy wpis trace_block typu reward przy indeksowaniu historii Gnosis. Co traci?",
      options: [
        "Nic, bo Gnosis nigdy nie wytworzył wpisów reward w żadnym bloku",
        "Rozliczenie gasu, bo wpisy reward niosą opłatę każdej transakcji",
        "Wypłaty kontraktu nagród z czasów AuRa, raportowane z typem external",
        "Śledzenie wypłat, bo claimy GNO są raportowane jako wpisy reward"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Indekser odtwarza kod kontraktów na Gnosis z transakcji tworzących i po grudniu 2025 nie zgadza się z eth_getCode dla jednego adresu. Dlaczego?",
      options: [
        "Konto wdrożyło kod przez delegację EIP-7702",
        "Kontrakt nagród za bloki zastąpił kod wywołaniem systemowym",
        "Hard fork przepisał kod tego konta bez żadnej transakcji",
        "Reorg poza finalnością przywrócił starszą wersję kontraktu"
      ],
      answer: 2
    }
  ],
  "permissioned-network": [
    {
      kind: "scenario",
      question: "Aplikacja domyślnie czyta wszystko z tagiem finalized i zostaje podłączona do sieci QBFT w Besu bez pluginów. Co zobaczy?",
      options: [
        "Bloki dwie epoki za latest, jak na mainnecie w proof of stake",
        "Błąd Unknown block, bo nic nie ustawia znacznika finalized",
        "Blok genesis, bo sieci BFT nigdy nie przesuwają finalności",
        "Najnowszy blok, bo w QBFT Besu mapuje finalized na head"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego węzeł Besu z uprawnieniami kont nadal importuje bloki z transakcjami od nadawców spoza allowlisty?",
      options: [
        "Allowlista obejmuje tylko transakcje wysłane w ostatniej epoce",
        "Walidatorzy QBFT nadpisują allowlisty węzłów, które nie walidują",
        "Zaimportowane bloki są sprawdzane ponownie po wywołaniu metod perm_",
        "Uprawnienia kont to lokalna polityka węzła, a nie reguła konsensusu"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym finalność w QBFT różni się od finalności w Clique?",
      options: [
        "Bloki QBFT są finalne po zatwierdzeniu; Clique miewa krótkie forki",
        "Bloki Clique są finalne po podpisaniu; QBFT miewa krótkie forki",
        "W każdym z nich finalność przychodzi po dwóch epokach atestacji",
        "QBFT potrzebuje Beacon Chain do finalności; Clique finalizuje w genesis"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co stało się z prywatnymi transakcjami Tessera i metodami priv_ w Besu?",
      options: [
        "Przeniesiono je do pluginu włączanego grupą API PRIV",
        "Oznaczono je jako przestarzałe, ale są dostępne za flagą funkcji",
        "Usunięto je razem z grupami API PRIV i EEA",
        "Włączono je do przestrzeni nazw perm_ dla kont z allowlisty"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Ponad jedna trzecia walidatorów sieci QBFT przechodzi w tryb offline. Co widzi wywołujący RPC?",
      options: [
        "Łańcuch się rozwidla, a każda część dalej produkuje własne bloki",
        "Bloki powstają dalej, ale tag finalized przestaje się przesuwać",
        "Pozostali walidatorzy obniżają kworum i dalej produkują bloki",
        "eth_blockNumber stoi, bo żadnego bloku nie da się zatwierdzić"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Zespół chce dziś uruchomić zupełnie nową sieć Clique. Który klient nadal potrafi produkować bloki Clique?",
      options: [
        "Geth, z silnikiem clique ustawionym w konfiguracji genesis",
        "Besu, z sekcją clique ustawioną w konfiguracji genesis",
        "Nethermind, z silnikiem Clique ustawionym w chainspecu",
        "Reth, z silnikiem clique włączonym przy starcie"
      ],
      answer: 2
    }
  ],
  "server-sent-events": [
    {
      kind: "scenario",
      question: "Połączenie indeksera ze strumieniem eventów beacon node'a zrywa się na dwie minuty, a potem zostaje odnowione. Co stało się z eventami z tego czasu?",
      options: [
        "Zostaną odtworzone, bo klient wysłał Last-Event-ID",
        "Węzeł je przetrzymał i wyśle jako pierwsze po ponownym połączeniu",
        "Przepadły; strumień nie ma identyfikatorów i nic nie odtwarza",
        "Zostaną odtworzone, ale tylko dla head i chain_reorg"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego eventy przechodzące przez nginx z domyślną konfiguracją przychodzą seriami, a nie pojedynczo?",
      options: [
        "nginx buforuje odpowiedzi z proxy, dopóki się tego nie wyłączy",
        "nginx zamienia strumień na JSON w chunkach i wysyła go paczkami",
        "Beacon node'y grupują eventy, gdy wykryją po drodze proxy",
        "Strumień wymaga HTTP/2, a nginx obniża go do wersji 1.1"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym strumień eventów Beacon API różni się od eth_subscribe w warstwie wykonawczej?",
      options: [
        "Odtwarza przegapione eventy, a eth_subscribe tego nie robi",
        "Opakowuje każdy event w komunikat JSON-RPC z polem id",
        "Dostarcza tylko sfinalizowane dane, a eth_subscribe dane na żywo",
        "To jednokierunkowa odpowiedź HTTP, nie wiadomości po WebSockecie"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Co robi pusta linia w formacie strumienia eventów?",
      options: [
        "Oznacza komentarz keep-alive, który klient ma zignorować",
        "Przekazuje dalej event zbudowany z poprzedzających ją linii",
        "Przywraca domyślną wartość opóźnienia ponownego połączenia",
        "Zamyka strumień i każe klientowi od razu połączyć się ponownie"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Dashboard subskrybuje wyłącznie finalized_checkpoint przez proxy z 60-sekundowym read timeoutem. Co się dzieje?",
      options: [
        "Eventy finalności przychodzą w każdym slocie, więc strumień trwa",
        "Proxy przetrzymuje aktualizacje i dostarcza je jedną serią",
        "Proxy ucina bezczynny strumień między aktualizacjami co epokę",
        "Przeglądarka odnawia timeout, wysyłając Last-Event-ID"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Jak konsument po ponownym połączeniu powinien odzyskać bloki i reorgi, które mógł przegapić?",
      options: [
        "Zasubskrybować ponownie z parametrem from_slot, żeby węzeł odtworzył lukę",
        "Wysłać Last-Event-ID z ostatnim slotem, żeby węzeł wysłał lukę jeszcze raz",
        "Zasubskrybować block_gossip, który ponownie wysyła ostatnie bloki",
        "Odczytać head i finalność przez REST i cofać się od ostatniego rootu"
      ],
      answer: 3
    }
  ],
  openrpc: [
    {
      kind: "detail",
      question: "Co tworzy make build w repozytorium execution-apis?",
      options: [
        "Bibliotekę kliencką wygenerowaną dla każdego języka",
        "Jeden openrpc.json z rozwiązanymi wszystkimi $ref",
        "Skompilowany łańcuch testowy dla symulatora hive",
        "Osobny plik YAML na każdą metodę, wydzielony ze specyfikacji"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym rpc_modules w Geth lub Reth różni się od rpc.discover z OpenRPC?",
      options: [
        "Zwraca dokument OpenRPC, ale tylko dla przestrzeni nazw eth_",
        "To ta sama metoda, przemianowana zgodnie ze stylem przestrzeni nazw Ethereum",
        "Wymienia każdą metodę z parametrami, ale pomija przykłady",
        "Podaje włączone przestrzenie nazw, a nie dokument opisujący metody"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Odpowiedź przechodzi walidację względem openrpc.json, ale zawiera błędne saldo. Dlaczego walidacja tego nie wychwyciła?",
      options: [
        "Schemat sprawdza strukturę i kodowanie, a nie prawdziwość wartości",
        "Salda są pominięte w schemacie, bo nie mają górnej granicy",
        "Walidacja dotyczy tylko żądań, a odpowiedzi nie są sprawdzane",
        "Schemat sprawdza wartości tylko dla sfinalizowanych bloków"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego w pełni zgodny węzeł może odrzucić zakres eth_getLogs, na który inny węzeł odpowiada?",
      options: [
        "Zgodność obejmuje eth_getLogs tylko dla już sfinalizowanych bloków",
        "Schemat pozwala każdemu klientowi zdefiniować własne pola filtra",
        "Limity zakresu to wybór operatora, o którym schemat milczy",
        "Zgodne węzły muszą odrzucać każdy zakres szerszy niż jedna epoka"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co zawiera plik .io w katalogu tests repozytorium execution-apis?",
      options: [
        "Schemat YAML metody skompilowany do JSON-a dla symulatora",
        "Żądanie i oczekiwaną odpowiedź na stałym łańcuchu testowym",
        "Listę klientów implementujących metodę, według wersji",
        "Benchmark opóźnienia metody na referencyjnym sprzęcie"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Kod polega na katalogu błędów execution-apis, żeby rozpoznawać kod 3 z dowolnej metody. Co jest nie tak z tym założeniem?",
      options: [
        "Odwołują się do niego dwie metody wysyłania transakcji, eth_call jeszcze nie",
        "Kod 3 mieści się w zakresie, który katalog rezerwuje dla błędów gasu",
        "Katalog dotyczy metod Engine API, a nie metod eth_",
        "Kody błędów są usuwane z openrpc.json podczas budowania"
      ],
      answer: 0
    }
  ]
};
