// Polish checkpoint questions for the Wallets & tooling lessons, keyed by topic id. Each topic's
// six questions match data/quizzes/tooling.js in order, kind, and answer position.
export const quizzes = {
  "eip-1193": [
    {
      kind: "scenario",
      question: "Użytkownik klika „połącz”, a potem zamyka okno portfela. Co provider robi z oczekującym żądaniem?",
      options: [
        "Odrzuca promise z ProviderRpcError o kodzie 4001",
        "Rozwiązuje promise pustą tablicą, bo nie zatwierdzono żadnego konta",
        "Mimo to zwraca konta, oznaczone jako nieautoryzowane",
        "Odrzuca promise standardowym błędem JSON-RPC -32601, method not found"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Strona wywołuje eth_getBalance przez window.ethereum. Który węzeł na to odpowiada?",
      options: [
        "Ten pod adresem RPC, który strona skonfigurowała, tworząc klienta do odczytów",
        "Lekki węzeł wbudowany w rozszerzenie przeglądarki, synchronizowany od peerów",
        "Endpoint ustawiony w portfelu, a nie wybrany przez stronę",
        "Endpoint podany w params żądania, jeśli strona go poda"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Jaki problem rozwiązuje wykrywanie providerów z EIP-6963?",
      options: [
        "Portfele przekazują metody wallet_ do węzłów, które nie umieją ich obsłużyć",
        "Providery zwracają liczby dziesiętne tam, gdzie wymagane są ciągi hex",
        "Kilka portfeli nadpisuje window.ethereum, przez co użytkownik nie ma wyboru",
        "Subskrypcje po cichu przestają działać przy każdym ponownym połączeniu WebSocket"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym różni się eth_requestAccounts od eth_accounts wywołanych przez wstrzyknięty provider?",
      options: [
        "Pierwsza zwraca jeden adres, druga wszystkie posiadane adresy",
        "Pierwsza prosi o zgodę, druga nigdy i do jej udzielenia zwraca pustą listę",
        "Na pierwszą odpowiada węzeł, a na drugą sam portfel",
        "Pierwsza działa tylko przez HTTP, druga tylko przez wstrzyknięty provider"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Dapp odczytuje chain ID raz przy starcie i nigdy nie nasłuchuje chainChanged. Co się dzieje, gdy użytkownik zmieni sieć w portfelu?",
      options: [
        "Portfel odmawia zmiany, dopóki strona nie zasubskrybuje tego zdarzenia",
        "Dapp dalej pokazuje dane z łańcucha, który użytkownik już opuścił",
        "Provider sam przeładowuje stronę, więc nic się nie dezaktualizuje",
        "Każde żądanie kończy się błędem 4901, dopóki strona znów nie odczyta eth_chainId"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Żądanie ze strony zostaje odrzucone z kodem błędu 4200 z EIP-1193. Co oznacza ten kod?",
      options: [
        "Użytkownik zamknął prośbę o zgodę na to żądanie",
        "Strona nie ma autoryzacji, której wymaga ta metoda",
        "Portfel nie obsługuje żądanej metody",
        "Provider jest odłączony od żądanego łańcucha"
      ],
      answer: 2
    }
  ],
  "wallet-rpc": [
    {
      kind: "cause",
      question: "Dlaczego wysłanie wallet_switchEthereumChain do endpointu RPC przez https się nie udaje?",
      options: [
        "Endpoint wymaga klucza API, zanim obsłuży metody wallet_",
        "Parametr chainId trzeba przez HTTP wysłać jako liczbę dziesiętną",
        "Implementują ją portfele, nie węzły, więc węzeł odpowiada -32601",
        "Węzły przyjmują metody wallet_ tylko przez połączenie WebSocket"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co oznacza kod błędu 4902 z wallet_switchEthereumChain?",
      options: [
        "Użytkownik zobaczył prośbę o zmianę sieci i od razu ją odrzucił",
        "Portfel nie ma definicji tego łańcucha, więc warto zaproponować dodanie",
        "Chain ID miał zły format, na przykład wysłano go jako dziesiętny string",
        "Portfel jest odłączony od wszystkich łańcuchów i nie może się przełączyć"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Strona chce wysłać kilka wywołań jako jedną akcję w portfelu, a potem śledzić jej postęp. Która para metod to robi?",
      options: [
        "wallet_requestPermissions i wallet_getPermissions z EIP-2255",
        "wallet_sendCalls i wallet_getCallsStatus z EIP-5792",
        "eth_sendRawTransaction i eth_getTransactionReceipt",
        "wallet_watchAsset i wallet_showCallsStatus"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Strona potrzebuje, żeby użytkownik był na OP Mainnet, zanim przejdzie dalej. Jaka kolejność wywołań jest zalecana?",
      options: [
        "Najpierw dodać łańcuch, potem przełączyć, żeby przełączenie nigdy nie zawiodło",
        "Najpierw przełączyć i uznać rozwiązany promise za dowód sukcesu",
        "Najpierw przełączyć, dodać tylko przy 4902, potem znów odczytać eth_chainId",
        "Dodać łańcuch z własnym URL-em RPC, co od razu na niego przełącza"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Strona z własnej inicjatywy wywołuje wallet_addEthereumChain, podając własny URL RPC. Na co prosi użytkownika o zgodę?",
      options: [
        "Na stałe uprawnienie strony do podpisywania w jego imieniu na tym łańcuchu",
        "Na rejestrację tego URL-a RPC jako węzła w zbiorze walidatorów łańcucha",
        "Na jednorazową opłatę za wpisanie łańcucha do rejestru portfela",
        "Na puszczanie całego jego ruchu dla tego łańcucha przez endpoint strony"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym identyfikator zwracany przez wallet_sendCalls różni się od tego, co zwraca eth_sendTransaction?",
      options: [
        "To hash pierwszej transakcji w wysłanym batchu",
        "To userOpHash, który można znaleźć przez eth_getTransactionReceipt",
        "To uchwyt portfela do odpytywania, a nie hash transakcji",
        "To numer bloku, w którym zostanie włączony cały batch"
      ],
      answer: 2
    }
  ],
  "signing-methods": [
    {
      kind: "cause",
      question: "Dlaczego eth_sign uważa się za niebezpieczną w porównaniu z personal_sign?",
      options: [
        "Zwraca klucz prywatny konta razem z gotowym podpisem",
        "Podpisuje z deterministycznym nonce, który ujawnia klucz po dwóch użyciach",
        "Podpisuje 32 surowe bajty bez prefiksu, które mogą być hashem transakcji",
        "Przekazuje wiadomość do węzła, zamiast zostawić ją w portfelu"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Publiczny endpoint RPC odpowiada na personal_sign błędem method not found. Co to oznacza?",
      options: [
        "Węzeł nie jest jeszcze zsynchronizowany i nie podpisze, dopóki nie nadrobi zaległości",
        "To poprawna konfiguracja: węzeł nie trzyma kluczy użytkowników i ukrywa personal_",
        "Żądanie wymaga klucza API, zanim metody podpisywania zostaną odblokowane",
        "Metodę przemianowano na eth_personalSign w niedawnym forku"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Twój proces logowania weryfikuje podpisy przez ecrecover i nie działa dla użytkownika, którego adres jest smart kontem. Jak to naprawić?",
      options: [
        "Poprosić użytkownika o podpisanie wiadomości logowania przez eth_sign",
        "Odzyskać adres ponownie z v równym 0 lub 1 zamiast 27 lub 28",
        "Wywołać jego isValidSignature z ERC-1271 i sprawdzić, czy zwraca 0x1626ba7e",
        "Zahashować wiadomość drugi raz przed uruchomieniem ecrecover"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "W jakiej kolejności personal_sign i przestarzała eth_sign przyjmują swoje dwa parametry?",
      options: [
        "personal_sign przyjmuje [address, message], a eth_sign [hash, address]",
        "personal_sign przyjmuje [message, address], a eth_sign [address, hash]",
        "Każda przyjmuje [address, message], w tej samej kolejności co eth_signTypedData_v4",
        "Każda przyjmuje [message, address], a portfel sam rozpoznaje, co jest czym"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co prefiks EIP-191 daje podpisowi personal_sign, czego brakuje podpisowi eth_sign nad surowymi bajtami?",
      options: [
        "Digest zawiera chain ID, więc podpisu nie da się użyć ponownie na innych łańcuchach",
        "Wiadomość jest zaszyfrowana, więc może ją odczytać tylko strona, która o nią poprosiła",
        "Digest nigdy nie zrówna się z transakcją, więc podpisu nie da się użyć jako transakcji",
        "Podpis rośnie do 96 bajtów, co oznacza go jako podpis wiadomości"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Proces logowania akceptuje każdy poprawny podpis nad stałym tekstem Sign in to example.app, bez nonce i czasu wygaśnięcia. Jakie jest ryzyko?",
      options: [
        "Portfel odmówi podpisania tej samej wiadomości drugi raz",
        "Podpis ujawnia o kluczu prywatnym dość, by dało się go wyliczyć",
        "Przechwycony podpis można w dowolnym późniejszym momencie użyć do zalogowania",
        "Każdy użytkownik dostaje ten sam podpis, więc kont nie da się odróżnić"
      ],
      answer: 2
    }
  ],
  "eip-712": [
    {
      kind: "cause",
      question: "Co uniemożliwia ponowne użycie podpisu EIP-712 wobec tego samego kontraktu wdrożonego na innym łańcuchu?",
      options: [
        "Portfel odmawia podpisania identycznej wiadomości typed data dla drugiego łańcucha",
        "Pole nonce, którego standard wymaga w każdym typie wiadomości",
        "Podpisany domain separator zawiera chainId i verifyingContract",
        "Prefiks 0x1901, którego bajty różnią się w każdej sieci"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Kontrakt odzyskuje z podpisu, który portfel złożył poprawnie, inny adres niż oczekiwany. Która przyczyna pasuje?",
      options: [
        "Deadline permitu już minął, gdy kontrakt go sprawdzał",
        "Portfel podpisał przez eth_signTypedData_v4 zamiast personal_sign",
        "Wartości wiadomości wysłano jako stringi JSON, a nie liczby",
        "String typu we frontendzie różni się od tego, który hashuje kontrakt"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Co permit z ERC-2612 daje w porównaniu ze zwykłą transakcją approve?",
      options: [
        "Usuwa model allowance, więc żadna zgoda nie jest zapisywana on-chain",
        "Użytkownik podpisuje off-chain, a ktoś inny go wysyła i płaci za gas",
        "Pozwala kontraktowi tokena pominąć sprawdzenie ecrecover przy każdym transferze",
        "Sprawia, że jedna zgoda jest ważna na każdym łańcuchu, na którym istnieje token"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Jak powstaje końcowy digest, który obejmuje podpis EIP-712?",
      options: [
        "keccak256 z prefiksu wiadomości EIP-191 i surowego dokumentu JSON",
        "keccak256 z 0x1901, domain separatora i hashStruct(message)",
        "keccak256 z samego type hasha, podpisany razem z chain ID",
        "sha256 z domain separatora, a po nim kodowanie ABI wiadomości"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Portfel oczekuje typed data dla eth_signTypedData_v4 jako stringa JSON, a aplikacja przekazuje obiekt. Co się dzieje?",
      options: [
        "Portfel sam zamienia go na string i podpisuje ten sam digest",
        "Żądanie kończy się mało pomocnym błędem parametru",
        "Portfel przechodzi na personal_sign nad tym obiektem",
        "Podpis powstaje, ale nie jest związany z żadnym chain ID"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Którą regułę najczęściej stosuje się źle, licząc ręcznie type hash struktury, która odwołuje się do innych struktur?",
      options: [
        "Typy struktur, do których są odwołania, dopisuje się w kolejności pierwszego użycia",
        "Nazwy pól sortuje się alfabetycznie wewnątrz każdego stringa typu",
        "Typy struktur, do których są odwołania, dopisuje się alfabetycznie",
        "Typy, do których są odwołania, się pomija i hashuje tylko typ główny"
      ],
      answer: 2
    }
  ],
  "client-libraries": [
    {
      kind: "cause",
      question: "Dwa salda odczytane w tej samej funkcji pochodzą z nieco różnych stanów. Jaka jest zwykle przyczyna?",
      options: [
        "Biblioteka zapisała pierwszy wynik w cache i użyła go ponownie dla drugiego",
        "Konwersja hex na BigInt straciła precyzję przy większej z dwóch wartości",
        "Każdy odczyt domyślnie poszedł do latest, a head przesunął się między nimi",
        "Dekoder ABI odczytał drugi wynik z użyciem złego typu wyjściowego"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co biblioteka kliencka, taka jak viem albo ethers, dodaje ponad surowe JSON-RPC?",
      options: [
        "Gwarancję, że endpoint obsługuje każdą metodę, którą opakowuje",
        "Kodowanie calldata w ABI i dekodowanie zwróconych słów",
        "Dowód, że każda odpowiedź zgadza się z kanonicznym stanem łańcucha",
        "Spójne snapshoty, bo każdy jej odczyt dotyczy tego samego bloku"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Wysyłka kończy się timeoutem, więc transakcja zostaje ponownie podpisana z nowym nonce i wysłana jeszcze raz. Co może pójść nie tak?",
      options: [
        "Nic, bo timeout oznacza, że pierwsza w ogóle nie została rozgłoszona",
        "Pierwsza mogła już wyjść, więc w bloku mogą wylądować dwie transakcje",
        "Węzeł odrzuci nonce, bo musi on wzrosnąć dokładnie o dwa",
        "Biblioteka odmówi drugiego podpisu tym samym kluczem w jednej sesji"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym różni się organizacja viem od organizacji ethers.js?",
      options: [
        "viem opiera się na Provider i Signer; ethers rozdziela public i wallet client",
        "viem rozdziela public i wallet client; ethers opiera się na Provider i Signer",
        "viem to najstarsza biblioteka; ethers to nowsza, z tree-shakingiem",
        "viem działa tylko w przeglądarkach; ethers tylko w Node.js na serwerach"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Projekt w Ruście potrzebuje typów kontraktów generowanych prosto z sygnatury Solidity. Co pasuje?",
      options: [
        "Nethereum z jego generatorem kodu",
        "alloy z makrem sol!",
        "web3.py z fabryką kontraktów",
        "ethclient z bindingami abigen"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego ethclient z go-ethereum to często najczytelniejszy sposób, żeby zobaczyć, co metoda naprawdę zwraca?",
      options: [
        "Wypisuje każde surowe żądanie i odpowiedź na standardowe wyjście",
        "Omija JSON-RPC i czyta bezpośrednio bazę danych węzła",
        "Weryfikuje każdą odpowiedź dowodem Merkle, który sam pobiera",
        "To cienki wrapper, który używa własnych typów klienta"
      ],
      answer: 3
    }
  ],
  multicall: [
    {
      kind: "contrast",
      question: "Co daje multicall w porównaniu z batchem JSON-RPC z tymi samymi żądaniami eth_call?",
      options: [
        "Mniejsze opóźnienie, bo batch JSON-RPC wysyła wywołania po kolei",
        "Spójny snapshot: wszystkie odczyty w jednym wywołaniu EVM i bloku",
        "Izolację błędów per wywołanie, której batch JSON-RPC nie zapewnia",
        "Dostęp do historycznego stanu, którego pruned node by odmówił"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego Multicall3 ma ten sam adres na Ethereum, Base i Arbitrum?",
      options: [
        "Genesis każdego łańcucha zawiera go jako predeploy pod zarezerwowanym adresem",
        "Adres rezerwuje dla niego EIP, które przyjął każdy łańcuch",
        "Został wdrożony deterministycznie, więc wszędzie trafia pod jeden adres",
        "Kanoniczne bridge'e automatycznie replikują kontrakt z L1 na każde L2"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Funkcja view, która sprawdza msg.sender, zwraca złą odpowiedź, gdy jest wywoływana wewnątrz multicalla. Dlaczego?",
      options: [
        "aggregate3 usuwa pole from z obiektu wywołania, który przekazuje dalej",
        "eth_call ustawia msg.sender na adres zerowy, jeśli nie podano from",
        "Każde wywołanie wykonuje kontrakt agregujący, więc msg.sender to jego adres",
        "Każde podwywołanie działa jako delegatecall, który czyści nadawcę"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co aggregate3 dodaje w porównaniu ze starszymi metodami aggregate i tryAggregate?",
      options: [
        "Wartość ETH dla każdego wywołania, więc batch może nieść płatne zapisy",
        "Jedną flagę allowFailure, która dotyczy wszystkich wywołań naraz",
        "Flagę allowFailure per wywołanie, więc jeden revert nie psuje reszty",
        "Limit gasu per wywołanie, więc ciężki odczyt nie wyczerpie całego limitu"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Multicall ciężkich funkcji view rośnie, aż przekracza limit gasu węzła dla eth_call. Jak to się objawia?",
      options: [
        "Błędem limitu -32005, który podaje, o ile wywołań było za dużo",
        "Częściowym wynikiem, w którym wywołania ponad limit są oznaczone jako nieudane",
        "Nieczytelnym błędem out of gas, a nie błędem rozmiaru",
        "Kodem HTTP 413 od węzła, bo body żądania jest za duże"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Jedno podwywołanie w wyniku aggregate3 ma puste returnData. Co to zwykle oznacza?",
      options: [
        "Odczytana wartość to zero, zakodowane zwięźle jako puste słowo",
        "Limit gasu węzła przerwał podwywołanie, zanim cokolwiek zwróciło",
        "Adres docelowy nie ma kodu albo zrobił revert bez podania powodu",
        "Wynik był w cache, więc węzeł znowu pominął bajty"
      ],
      answer: 2
    }
  ],
  ens: [
    {
      kind: "detail",
      question: "Gdzie są przechowywane rekordy adresów nazwy ENS?",
      options: [
        "W kontrakcie rejestru, obok właściciela i TTL",
        "We własnym kontrakcie nazwy, wdrażanym przy rejestracji",
        "W kontrakcie resolvera, na który rejestr tylko wskazuje",
        "Zawsze off-chain, pobierane przez gateway CCIP-Read"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego wynik rozwiązania odwrotnego ENS trzeba sprawdzić rozwiązaniem prostym, zanim się mu zaufa?",
      options: [
        "Rekordy odwrotne są na innym łańcuchu niż rekordy proste",
        "Namehash nazwy odwrotnej nie jest unikalny dla jednego adresu",
        "Każdy może ustawić rekord odwrotny z dowolną nazwą",
        "Resolvery odwrotne nie implementują rekordu addr(bytes32)"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "eth_call do resolvera ENS kończy się revertem OffchainLookup. Co powinien zrobić klient?",
      options: [
        "Ponowić to samo wywołanie z tagiem finalized, gdy blok się ustabilizuje",
        "Pobrać dane z URL gatewaya z revertu i wywołać wskazany callback",
        "Awaryjnie odczytać rekord adresu bezpośrednio z rejestru",
        "Uznać nazwę za niezarejestrowaną, skoro jej resolver zrobił revert"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Jak według EIP-137 oblicza się namehash identyfikujący nazwę ENS?",
      options: [
        "keccak256 całej nazwy, zapisanej małymi literami i znormalizowanej",
        "Od 32 zerowych bajtów, dokładając hash każdej etykiety od lewej",
        "Od 32 zerowych bajtów, dokładając hash każdej etykiety od prawej",
        "sha256 każdej etykiety po kolei, łączone od lewej do prawej"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Dapp działający na Base chce wyświetlać nazwy ENS swoich użytkowników. Na jakim endpoincie powinien je rozwiązywać?",
      options: [
        "Na endpoincie Base, bo każde L2 trzyma kopię rejestru",
        "Na dowolnym, bo gatewaye CCIP-Read rozwiązują nazwy na każdym łańcuchu",
        "Na endpoincie mainnetu Ethereum, gdzie działa rejestr ENS",
        "Na endpoincie Base, przez predeploy ENS w OP Stacku"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Strona hashuje nazwę dokładnie tak, jak wpisał ją użytkownik, bez normalizacji ENSIP-15. Co może pójść nie tak?",
      options: [
        "Rejestr odrzuca hash i wywołanie od razu kończy się revertem",
        "Resolver normalizuje ją on-chain, więc nic się nie zmienia",
        "Dwie identycznie wyglądające nazwy dają różne node'y",
        "Nazwa rozwiązuje się na endpointach L2, ale nie na mainnecie"
      ],
      answer: 2
    }
  ],
  "erc-4337": [
    {
      kind: "scenario",
      question: "eth_sendUserOperation zwrócił userOpHash. Które wywołanie powie, czy operacja trafiła do łańcucha?",
      options: [
        "eth_getTransactionReceipt na dowolnym endpoincie RPC",
        "eth_getUserOperationReceipt na bundlerze",
        "eth_getTransactionByHash na bundlerze",
        "eth_supportedEntryPoints na kontrakcie EntryPoint"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Transakcja bundla, w której jest twoja UserOperation, ma w receipcie status 0x1. Czego to dowodzi?",
      options: [
        "Że wewnętrzne wywołanie operacji wykonało się i w pełni powiodło",
        "Że paymaster przyjął sponsorowanie i został obciążony",
        "Tylko tego, że handleOps się wykonało; wewnętrzne wywołanie mogło zrobić revert",
        "Że walidacja przeszła, a wewnętrzne wywołanie pominięto jako dry run"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Jak EIP-7702 ma się do abstrakcji kont z ERC-4337?",
      options: [
        "Zastępuje bundlery mempoolem dla UserOperation na poziomie protokołu",
        "Całkowicie usuwa singleton EntryPoint z projektu ERC-4337",
        "Definiuje typ transakcji, którego bundlery muszą używać do wywołania handleOps",
        "Konto EOA deleguje do kodu kontraktu i zyskuje funkcje smart walleta"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Klient odpytuje eth_getTransactionReceipt z userOpHash zwróconym przez bundler. Co dostaje?",
      options: [
        "Receipt bundla, gdy tylko operacja zostanie włączona do bloku",
        "Null w nieskończoność, bo ta wartość nie jest hashem transakcji",
        "Błąd -32601, bo receipty UserOperation wymagają bundlera",
        "Receipt, którego pole status odzwierciedla wewnętrzne wywołanie operacji"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego klient ERC-4337 pyta bundler przez eth_supportedEntryPoints, zamiast hardkodować jeden adres EntryPoint?",
      options: [
        "Każdy łańcuch wdraża EntryPoint pod losowym adresem w genesis",
        "EntryPoint ma wersje, a jego adres zmienia się z każdą wersją",
        "Adres EntryPoint zmienia się co epokę, żeby utrudnić cenzurę",
        "Każdy bundler wdraża prywatny EntryPoint, który tylko on może wywołać"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Skąd pochodzi kolejny nonce dla konta smart account ERC-4337?",
      options: [
        "Z eth_getTransactionCount na adresie kontraktu konta",
        "Od bundlera, który przydziela go, gdy operacja trafia do jego puli",
        "Od paymastera, który śledzi nonce kont, które finansuje",
        "Z EntryPoint, jako dwuczęściowa wartość: klucz i sekwencja"
      ],
      answer: 3
    }
  ],
  "local-devnet": [
    {
      kind: "cause",
      question: "Dlaczego sforkowana instancja Anvil przez cały czas działania potrzebuje swojego endpointu upstream?",
      options: [
        "Odtwarza każdy blok od genesis względem upstreamu w trakcie działania",
        "Nie trzyma stanu i pobiera konta, kod i sloty przy pierwszym użyciu",
        "Przekazuje każdą otrzymaną transakcję dalej do łańcucha upstream",
        "Polega na węźle upstream przy podpisywaniu wysyłanych transakcji"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Które zadanie wymaga ethereum-package dla Kurtosis, a nie Anvil ani symulowanej sieci Hardhat?",
      options: [
        "Podszycie się pod konto, do którego nie ma się klucza prywatnego",
        "Sforkowanie stanu mainnetu w jednym konkretnym historycznym bloku",
        "Testowanie Engine API i finalności na prawdziwych parach klientów",
        "Kopanie bloków na żądanie i przesuwanie zegara między testami"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Testy przechodzą lokalnie, ale ten sam kod na produkcji ma wyścigi. Która cecha devnetu najpewniej ukryła błąd?",
      options: [
        "Chain ID 31337, który zmienia sposób sprawdzania podpisów",
        "Zasilone konta z saldami na tyle dużymi, że nigdy się nie kończą",
        "Natychmiastowe kopanie, które od razu wrzuca transakcję do bloku",
        "Instrukcje console.log w Solidity zmieniające kolejność wykonania"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co daje Anvil uruchomiony bez żadnych flag?",
      options: [
        "Port 8545, chain ID 1, jedno zasilone konto, bloki co 12 sekund",
        "Port 8551, chain ID 31337, brak zasilonych kont, ręczne kopanie",
        "Port 8545, chain ID 31337, dziesięć zasilonych kont, natychmiastowe kopanie",
        "Port 8546, chain ID 1337, dwadzieścia zasilonych kont, bloki co 2 sekundy"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Zestaw testów forkuje mainnet w Anvil, ale nigdy nie podaje --fork-block-number. Co z tego wynika?",
      options: [
        "Anvil nie wystartuje, dopóki nie dostanie numeru bloku forka",
        "Anvil forkuje od genesis, więc musi pobrać cały łańcuch",
        "Wyniki dryfują razem z headem upstreamu, a cache missy się mnożą",
        "Anvil forkuje od finalized, więc stan jest dwie epoki za headem"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Kod aplikacji wysyła transakcje przez eth_sendTransaction, bo devnet zawsze na to pozwalał. Co się stanie z hostowanym providerem?",
      options: [
        "Zadziała, bo providerzy podpisują kluczem powiązanym z kluczem API",
        "Zadziała, ale tylko na testnetach, które odwzorowują konfigurację devnetu",
        "Trafi do kolejki, dopóki provider nie zacznie impersonować konta",
        "Zostanie odrzucone, bo provider nie ma kluczy do twoich kont"
      ],
      answer: 3
    }
  ],
  "cli-tools": [
    {
      kind: "detail",
      question: "Która podkomenda cast wysyła dowolną metodę, która nie ma własnego, dedykowanego wrappera?",
      options: ["cast call", "cast rpc", "cast send", "cast run"],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Żądanie curl zwraca HTTP 200, skrypt uznaje to za sukces, a później się wysypuje. Co przeoczono?",
      options: [
        "Węzeł zwrócił status 200 z całkowicie pustym body odpowiedzi",
        "Odpowiedź była skompresowana gzipem, a skrypt jej nie zdekodował",
        "Body zawierało obiekt błędu JSON-RPC, czyli normalną formę błędu",
        "Pole id w odpowiedzi nie zgadzało się z tym w żądaniu"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Po co odtwarzać podejrzewany błąd biblioteki za pomocą curl, na tym samym endpoincie i tym samym bloku?",
      options: [
        "curl automatycznie ponawia żądania po błędach, a biblioteki nie",
        "Biblioteki nie potrafią przypiąć numeru bloku, więc ich odczyty się rozjeżdżają",
        "Oddziela to, co wysłał węzeł, od tego, co zrobiła z tym biblioteka",
        "Węzeł odpowiada na surowe żądania z innego stanu niż na żądania bibliotek"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym na własnym węźle różni się geth attach przez socket IPC od wywoływania interfejsu HTTP?",
      options: [
        "IPC przyjmuje tylko odczyty eth_, a HTTP obsługuje też admin_ i txpool_",
        "IPC wymaga JWT z Engine API, a HTTP tylko klucza API",
        "IPC działa z każdej maszyny, a HTTP jest przypięte tylko do loopbacka",
        "IPC zwykle udostępnia admin_ i txpool_, nawet gdy HTTP je ukrywa"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Trzeba z wiersza poleceń obserwować napływające powiadomienia newHeads. Które narzędzie się do tego nadaje?",
      options: [
        "curl, wysyłający eth_subscribe przez HTTP i odpytujący co sekundę",
        "cast run, który na bieżąco strumieniuje trace każdego nowego bloku",
        "websocat, który trzyma otwarty WebSocket dla ramki eth_subscribe",
        "geth attach przez HTTP, który w trybie push wysyła nowe heady do konsoli"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Ręcznie napisane żądanie curl nie ma nagłówka content-type application/json. Co może się stać?",
      options: [
        "Węzeł parsuje body jako formularz i odpowiada polami null",
        "Węzeł traktuje je jako batch i odpowiada pustą tablicą",
        "Proxy albo endpoint może je odrzucić, zanim węzeł je zobaczy",
        "Nic, bo węzły całkowicie ignorują nagłówek content-type"
      ],
      answer: 2
    }
  ],
  "token-standards": [
    {
      kind: "contrast",
      question: "Logi Transfer z ERC-20 i ERC-721 mają ten sam topic0. Jak je rozróżnić?",
      options: [
        "Mają różne wartości topic0, choć event nazywa się tak samo",
        "Logi ERC-721 pochodzą tylko z kontraktów, które odpowiadają na ERC-165",
        "Logi ERC-721 mają cztery topics i puste data, a ERC-20 trzy",
        "Logi ERC-20 niosą decimals tokena w dodatkowym, czwartym topicu"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Jak, używając tylko standardowego JSON-RPC, pobrać pełną listę tokenów, które ma dany adres?",
      options: [
        "Wywołać eth_getTokenBalances z adresem jako jedynym parametrem",
        "Wywołać eth_getLogs z adresem posiadacza jako jedynym polem filtra",
        "Przeskanować logi Transfer z tym adresem albo mieć indekser, który to robi",
        "Wywołać eth_getBalance z adresem każdego tokena jako tagiem bloku"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dashboard odtwarza salda, sumując eventy Transfer, i dla jednego tokena wynik z czasem się rozjeżdża. Jaka jest prawdopodobna przyczyna?",
      options: [
        "eth_getLogs po cichu pominął logi, których flaga removed miała wartość false",
        "topic0 eventu Transfer tego tokena zmienił się po upgradzie kontraktu",
        "Token robi rebasing albo rozdziela opłaty na posiadaczy, więc logi pomijają zmiany",
        "Sumy zostały podzielone przez decimals tokena dwa razy z rzędu"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co trafia do pola data wywołania eth_call, które odczytuje balanceOf z ERC-20?",
      options: [
        "0x313ce567 i adres posiadacza dopełniony z lewej do 32 bajtów",
        "0x70a08231 i 20-bajtowy adres posiadacza bez dopełnienia",
        "0x70a08231 i adres posiadacza dopełniony z lewej do 32 bajtów",
        "0xddf252ad i adres posiadacza dopełniony z prawej do 32 bajtów"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Portfel zakłada 18 miejsc dziesiętnych dla każdego tokena i odczytuje saldo USDC równe 1000000 surowych jednostek. Co wyświetli?",
      options: [
        "1,00 USDC, bo węzeł przelicza jednostki według pola decimals",
        "1000000 USDC, bo surowe jednostki liczą tu już całe tokeny",
        "0,000000000001 USDC, o dwanaście rzędów wielkości za mało",
        "Błąd, bo balanceOf odrzuca wywołania zakładające 18 miejsc dziesiętnych"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Potrzebne jest saldo tokena u posiadacza z bloku sprzed miesiąca. Co wywołać?",
      options: [
        "eth_getBalance z adresem tokena i tym numerem bloku",
        "eth_getLogs dla eventów Transfer, zsumowanych do tego bloku",
        "balanceOf przez eth_call w tym bloku, na węźle, który ma ten stan",
        "balanceOf przez eth_call w latest, minus transfery od tamtej pory"
      ],
      answer: 2
    }
  ],
  "dapp-architecture": [
    {
      kind: "cause",
      question: "Dlaczego zaraz po tym, jak portfel zgłosi wysłanie transakcji, odczyt receiptu może zwrócić null?",
      options: [
        "Receipty powstają dopiero wtedy, gdy transakcja zostanie sfinalizowana",
        "Portfel rozgłosił ją przez własny endpoint, a twój jest w tyle",
        "Portfel zwrócił userOpHash zamiast hasha transakcji",
        "eth_getTransactionReceipt patrzy tylko na bloki do finalized włącznie"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Odczyty dappa idą do hostowanego providera RPC, który wymaga klucza API. Gdzie powinien być ten klucz?",
      options: [
        "W bundlu frontendu, ukryty dzięki minifikacji JavaScriptu",
        "W ustawieniach sieci portfela, dodany przez wallet_addEthereumChain",
        "Za małym proxy w backendzie, które przepuszcza tylko używane metody",
        "W parametrze query URL, którego przeglądarki nie zapisują w logach"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Które żądanie powinno trafić do indeksera, a nie na bezpośrednią ścieżkę odczytu RPC dappa?",
      options: [
        "Odczyt pojedynczej wartości z kontraktu w najnowszym bloku",
        "Wszystkie transfery użytkownika od zawsze, we wszystkich tokenach",
        "Sprawdzenie salda ETH jednego konta w przypiętym bloku",
        "Pobranie receiptu jednej transakcji po hashu po jej wysłaniu"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co dapp powinien zrobić z zakodowanym wywołaniem, zanim portfel poprosi użytkownika o zatwierdzenie zapisu?",
      options: [
        "Wysłać je przez eth_sendRawTransaction, żeby zarezerwować nonce konta",
        "Prześledzić je przez debug_traceCall, żeby dokładniej wycenić gas",
        "Zasymulować je przez eth_call, żeby revert wyszedł przed pytaniem",
        "Wysłać je do prywatnego RPC, żeby portfel nie widział jego treści"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Użytkownik zmienia łańcuch w połowie procesu, a dapp nigdy nie odczytuje chain ID na nowo. Co się psuje?",
      options: [
        "Portfel automatycznie anuluje każde oczekujące żądanie podpisu",
        "Endpoint do odczytów podąża za portfelem i też zmienia łańcuch",
        "Adresy kontraktów wskazują teraz kontrakty na złym łańcuchu",
        "Indekser indeksuje nowy łańcuch od ostatniego bloku dappa"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego na pytania typu wykres aktywności z sześciu miesięcy powinien odpowiadać indekser, a nie przeglądarka?",
      options: [
        "Przeglądarki nie umieją dekodować logów, bo dekodowanie ABI wymaga serwera",
        "Endpointy RPC trzymają logi tylko z ostatnich 128 bloków",
        "To szerokie skany logów, które większość endpointów ograniczy albo odrzuci",
        "Portfele blokują wywołania eth_getLogs wysyłane przez injected provider"
      ],
      answer: 2
    }
  ],
  "erc-165": [
    {
      kind: "detail",
      question: "Jak oblicza się identyfikator interfejsu ERC-165?",
      options: [
        "keccak256 nazwy interfejsu, obcięty do czterech bajtów",
        "XOR wszystkich selektorów funkcji w interfejsie",
        "Suma selektorów funkcji modulo dwa do potęgi 32",
        "Selektor pierwszej funkcji zadeklarowanej w interfejsie"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Indekser wywołuje supportsInterface(0x80ac58cd) na nieznanym kontrakcie, dostaje true i pomija pozostałe sondy. Co może wywnioskować?",
      options: [
        "Że kontrakt to kolekcja ERC-721 z metadanymi",
        "Że kontrakt implementuje ERC-165, ale nie ERC-721",
        "Że kontrakt musi obsługiwać też identyfikator ERC-1155",
        "Na razie nic, bo fallback typu catch-all też zwraca true"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego procedura wykrywania pyta też o 0xffffffff i oczekuje false?",
      options: [
        "Żeby odrzucić kontrakty, których fallback odpowiada true na każde wejście",
        "Żeby potwierdzić, że mapping w storage kontraktu został zainicjowany",
        "Bo 0xffffffff to identyfikator zarezerwowany dla standardu ERC-721",
        "Bo drugie wywołanie rozgrzewa storage i obniża gas kolejnych"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "eth_call ustawia gas na 0x7530, żeby naśladować limit 30 000 z ERC, a implementacja potrzebuje 12 000 gasu. Co się dzieje?",
      options: [
        "Przechodzi, bo eth_call nie ma intrinsic gasu transakcji",
        "Przechodzi, bo węzeł po cichu podnosi limit do swojego gas capu",
        "Kończy się out of gas, bo intrinsic gas zostawia mniej niż 9000",
        "Kończy się błędem, bo ERC zabrania implementacji ponad 10 000"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym sondowanie kontraktu przez wywołanie oczekiwanej funkcji różni się od zapytania supportsInterface?",
      options: [
        "Sondowanie sprawdza sam węzeł; odpowiedzi ERC-165 nikt nie sprawdza",
        "Sondowanie wymaga węzła archiwalnego; ERC-165 działa na pruned node",
        "Sondowanie czyta storage bezpośrednio; ERC-165 wykonuje kod w EVM",
        "Sondowanie pokazuje, że jedno wywołanie się dekoduje; ERC-165 to deklaracja"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Pierwsza sonda wysłana do WETH zwraca udany wynik eth_call równy 0x. Jak go odczytać?",
      options: [
        "Jako false: sukces bez danych zwrotnych oznacza brak ERC-165",
        "Jako true: każde wywołanie bez revertu oznacza obsługę",
        "Jako błąd węzła: wywołanie view nie może zwrócić pustych danych",
        "Jako nieznany: trzeba ponowić na węźle archiwalnym, żeby go zdekodować"
      ],
      answer: 0
    }
  ],
  "erc-1271": [
    {
      kind: "scenario",
      question: "Serwer logowania weryfikuje podpisy samym ecrecover, a użytkownik loguje się z Safe. Co się dzieje?",
      options: [
        "Logowanie się udaje, bo Safe przekazuje klucz właściciela do ecrecover",
        "Logowanie się udaje, gdy podpisze wymagana progiem liczba właścicieli Safe",
        "Logowanie zostaje odrzucone, bo z żadnego podpisu nie da się odzyskać adresu Safe",
        "Logowanie się udaje, bo ecrecover zwraca adres Safe dla podpisów właścicieli"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jak wygląda poprawna odpowiedź isValidSignature w wyniku eth_call?",
      options: [
        "0x1626ba7e i 28 bajtów zerowych w jednym 32-bajtowym słowie",
        "32-bajtowe słowo zakończone na 01, czyli true zakodowane w ABI",
        "Odzyskany adres właściciela, dopełniony z lewej do 32 bajtów",
        "0xffffffff i 28 bajtów zerowych, co znaczy, że wszystkie sprawdzenia przeszły"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym ERC-6492 różni się od zwykłej weryfikacji ERC-1271?",
      options: [
        "Zastępuje magiczną wartość booleanem, żeby uprościć dekodowanie",
        "Obsługuje niewdrożone konta przez opakowanie podpisu",
        "Przenosi weryfikację do węzła przez nową metodę RPC",
        "Pozwala kontom EOA zwracać magiczną wartość bez kodu kontraktu"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Konto EOA z delegacją 7702 podpisuje wiadomość własnym kluczem, a weryfikator używa SignatureChecker z OpenZeppelin. Kiedy poprawny podpis zostanie odrzucony?",
      options: [
        "Gdy nonce konta zmienił się od złożenia podpisu",
        "Gdy wartość v podpisu to 27, a nie nowsze 0 lub 1",
        "Gdy znacznik delegacji jest krótszy niż 23 bajty kodu",
        "Gdy delegat nie implementuje ERC-1271 dla klucza konta"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "eth_call do isValidSignature zwraca 0x bez błędu. Co to oznacza?",
      options: [
        "Podpis jest ważny, bo wywołanie nie zrobiło revertu",
        "Adres nie ma kodu, więc trzeba sięgnąć po ecrecover",
        "Węzeł usunął stan przez pruning, więc trzeba ponowić na węźle archiwalnym",
        "Konto przyjęło podpis, ale zwróciło starą wartość"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego weryfikator, który przechowuje podpisy jako dowody, powinien przy każdym wyniku zapisywać numer bloku?",
      options: [
        "Bo według ERC podpisy kontraktów wygasają po 256 blokach",
        "Bo providerzy cache'ują wyniki eth_call osobno dla każdego bloku",
        "Bo odpowiedź zależy od stanu konta, który zmienia się w czasie",
        "Bo wynik ecrecover różni się między hard forkami"
      ],
      answer: 2
    }
  ],
  "ccip-read": [
    {
      kind: "scenario",
      question: "curl z eth_call do resolvera ENS off-chain zwraca błąd o kodzie 3 z data zaczynającym się od 0x556f1830. Co się dzieje?",
      options: [
        "Resolver jest zepsuty, a jego gateway nie jest skonfigurowany",
        "Węzeł odrzucił wywołanie, bo przekroczyło limit gasu (gas cap)",
        "Nazwa wygasła, a rejestr zablokował wyszukiwanie",
        "Resolver prosi klienta, żeby pobrał dane i wywołał callback"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Proxy providera przepisuje każdy revert na -32000 bez pola data. Co dzieje się z nazwami ENS off-chain u jego użytkowników?",
      options: [
        "Rozwiązują się normalnie, bo biblioteki ponawiają na drugim węźle",
        "Nie działają, bo klient nigdy nie widzi bajtów OffchainLookup",
        "Rozwiązują się, ale tylko do ostatniego adresu z cache gatewaya",
        "Nie działają, bo gateway odrzuca żądania od tego providera"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego klient CCIP-Read musi odrzucić lookup, którego sender różni się od wywołanego kontraktu?",
      options: [
        "Gateway podpisuje odpowiedzi tylko dla adresu, który go wywołał",
        "Węzeł przepisuje sender, gdy wywołanie przechodzi przez proxy",
        "Lookup wypłynął z zagnieżdżonego wywołania i nie dałby się dokończyć",
        "Callback działałby ze złym msg.sender i zrobiłby revert"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym zaufanie w resolverze z podpisującym gatewayem różni się od zaufania w resolverze L2, który sprawdza dowody storage?",
      options: [
        "Pierwszy ufa zapisanemu kluczowi podpisu; drugi opublikowanemu state rootowi",
        "Pierwszy ufa samemu węzłowi RPC; drugi właścicielowi rejestru ENS",
        "Pierwszy wymaga węzła archiwalnego; drugi działa na każdym pełnym węźle",
        "Pierwszy weryfikuje klient; drugi weryfikuje sam gateway"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Audytor rozwiązuje nazwę off-chain przez eth_call przypięte do bloku sprzed roku. Co odzwierciedla odpowiedź?",
      options: [
        "Bieżący rekord gatewaya, bo żaden numer bloku do niego nie dociera",
        "Rekord z przypiętego bloku, odczytany ze stanu archiwalnego",
        "Rekord z tego bloku, bo callback sprawdza jego timestamp",
        "Rekord ze sfinalizowanego bloku najbliższego przypiętemu"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co klient wysyła do gatewaya w żądaniu CCIP-Read?",
      options: [
        "Cały obiekt eth_call, razem z from, gas i tagiem bloku",
        "Podpisaną transakcję, żeby gateway mógł ją zasymulować",
        "Adres wywołującego i podpis dowodzący kontroli nad kluczem",
        "Adres sender i callData, które kontrakt umieścił w błędzie"
      ],
      answer: 3
    }
  ],
  "eip-6963": [
    {
      kind: "scenario",
      question: "Użytkownik ma zainstalowane dwa rozszerzenia portfeli, a twój dapp czyta window.ethereum. Który portfel odpowiada?",
      options: [
        "Zwykle to rozszerzenie, które akurat załadowało się ostatnie",
        "Zazwyczaj portfel, który użytkownik ostatnio odblokował",
        "Portfel, który jako pierwszy zainstalowano w przeglądarce",
        "Ten portfel, który przeglądarka oznacza jako domyślny"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Które pole info dapp powinien zapisać, żeby pamiętać wybór portfela między wizytami?",
      options: [
        "uuid, bo to UUIDv4 unikalny dla tego portfela",
        "name, bo ta etykieta jest pokazywana użytkownikom",
        "rdns, stały identyfikator w formacie reverse DNS",
        "icon, bo jej data URI identyfikuje portfel"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego każdy portfel ogłasza się ponownie, gdy tylko zobaczy eip6963:requestProvider?",
      options: [
        "Żeby dapp mógł wykryć, któremu portfelowi użytkownik ufa najbardziej",
        "Żeby portfel mógł odświeżać swój uuid przy każdym żądaniu strony",
        "Żeby przeglądarka mogła uszeregować portfele według szybkości odpowiedzi",
        "Żeby wykrywanie działało bez względu na kolejność ładowania dappa i portfela"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Jak EIP-6963 ma się do EIP-1193?",
      options: [
        "Zastępuje request() zdarzeniami, które niosą wywołania JSON-RPC",
        "Wyszukuje providery; każdy znaleziony provider nadal mówi EIP-1193",
        "Dodaje metody wallet_, których providerom EIP-1193 wcześniej brakowało",
        "Zamienia błędy providera z kodami 4001 na wyjątki DOM"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Portfel ogłasza jako ikonę data URI z SVG. W jakiej postaci EIP każe dappowi ją wyświetlić?",
      options: [
        "Jako kod wstawiony wprost w stronę, żeby przejęła motyw",
        "Jako PNG po wcześniejszej konwersji, żeby ustalić rozdzielczość",
        "Jako obrazek, bo SVG może zawierać skrypt",
        "Jako plik pobrany ponownie ze strony portfela"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Dapp wysyła żądania przez wykryty provider, ale nasłuchuje chainChanged na window.ethereum. Co idzie nie tak?",
      options: [
        "Każde zdarzenie chainChanged dostaje dwa razy od jednego portfela",
        "Może reagować na zmiany łańcucha wykonane w innym portfelu",
        "Traci zdarzenia, bo wykryte providery żadnych nie emitują",
        "Wywołuje nowe ogłoszenie każdego zainstalowanego portfela"
      ],
      answer: 1
    }
  ],
  "eip-3009": [
    {
      kind: "scenario",
      question: "Dział finansów dopasowuje przychodzące USDC do klientów po adresie from transakcji, a płatności przychodzą przez facilitatora x402. Co zobaczy ten dział?",
      options: [
        "Każdą płatność przypisaną płatnikowi, jak przy zwykłym transferze",
        "Każdą płatność przypisaną facilitatorowi, który ją wysłał",
        "Żadnych płatności, bo autoryzacje nie emitują eventu Transfer",
        "Płatności przypisane kontraktowi odbiorcy zamiast płatnikowi"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Dla jakiego nonce authorizationState(authorizer, nonce) zwraca true?",
      options: [
        "Nonce, którego validBefore leży w przyszłości",
        "Nonce równy kolejnemu nonce autoryzującego",
        "Nonce zarezerwowany przez transakcję pending",
        "Nonce, który został już użyty albo anulowany"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego EIP-3009 używa losowych 32-bajtowych nonce zamiast sekwencyjnego licznika, jak ERC-2612?",
      options: [
        "Żeby równoległe autoryzacje rozliczały się bez konfliktów w dowolnej kolejności",
        "Żeby nonce służył przy okazji jako ukryty commitment kwoty płatności",
        "Żeby token nie musiał przechowywać dla płatnika żadnego stanu per konto",
        "Żeby podpisy pozostawały ważne na łańcuchach, które dzielą jeden adres"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Funkcja depozytu w vaulcie wywołuje transferWithAuthorization z podpisem użytkownika, a obserwator kopiuje podpis z mempoolu i wysyła go pierwszy. Co się stanie?",
      options: [
        "Tokeny trafią do obserwatora, który jest teraz nadawcą transakcji",
        "Każda z transakcji się powiedzie, a użytkownik zapłaci dwa razy",
        "Tokeny trafią do vaulta, ale ten nie odnotuje depozytu",
        "Nic się nie przeniesie, bo tylko vault może wysłać autoryzację"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Klient x402 ustawia validBefore na Date.now() plus 60 000. Co jest nie tak z tą autoryzacją?",
      options: [
        "Okno jest za krótkie, więc facilitator nie zdąży jej rozliczyć",
        "Wartość jest w sekundach, a kontrakt porównuje ją z numerami bloków",
        "Jest poprawna, bo kontrakt sam przelicza milisekundy na sekundy",
        "Wartość jest w milisekundach, więc autoryzacja żyje dużo dłużej, niż miała"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym permit z ERC-2612 różni się od transferWithAuthorization?",
      options: [
        "Permit ustawia allowance, które nadal wymaga wywołania transferFrom",
        "Permit przenosi tokeny bezpośrednio, a 3009 ustawia tylko allowance",
        "Permit podpisuje się przez personal_sign, a nie jako dane EIP-712",
        "Permit wymaga, żeby płatnik sam wysłał transakcję i zapłacił za gas"
      ],
      answer: 0
    }
  ],
  paymaster: [
    {
      kind: "scenario",
      question: "Portfel dostaje paymasterData z pm_getPaymasterData, a potem, zanim użytkownik podpisze, ponownie estymuje gas i podnosi callGasLimit. Co da wysłanie operacji?",
      options: [
        "AA32 paymaster expired or not due, bo ponowna estymacja resetuje validUntil",
        "AA21 didn't pay prefund, bo teraz to konto jest winne gas",
        "AA34 signature error, bo sponsor podpisał stare pola gasu",
        "Żaden błąd, bo podpis sponsora nie obejmuje wartości gasu"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Skąd pochodzi ether, który paymaster wydaje na sponsorowany gas?",
      options: [
        "Z jego stake'u, zablokowanego w EntryPoint na czas unstake delay",
        "Z jego depozytu w EntryPoint, obciążanego za każdą operację",
        "Z salda jego kontraktu, wysyłanego potem do bundlera",
        "Od beneficjenta bundlera, z rozliczeniem później off-chain"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego paymaster tokenowy, który czyta oracle i rozlicza się w postOp, musi mieć stake, zanim przyjmą go publiczne bundlery?",
      options: [
        "Stake daje EntryPoint uprawnienie do wywołania jego postOp",
        "Stake podlega slashingowi, gdy cena tokena zmieni się w trakcie wykonania",
        "Bundlery pobierają swoją opłatę ze stake'u, a nie z depozytu",
        "Paymastery bez stake'u nie mogą czytać tego storage ani zwracać kontekstu"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Jak verifying paymaster decyduje, czy zapłacić, w porównaniu z paymasterem ERC-20?",
      options: [
        "Sprawdza podpis z usługi polityk sponsora działającej off-chain",
        "Pobiera od użytkownika tokeny i zwraca nadwyżkę w postOp",
        "Czyta podpisującego ze storage, więc zawsze musi mieć stake",
        "Płaci z depozytu konta, a nie z własnego"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "W EntryPoint v0.7 postOp paymastera robi revert, mimo że wywołanie konta się powiodło. Jaki jest wynik?",
      options: [
        "Wywołanie konta zostaje, a koszt gasu pokrywa bundler",
        "Cały bundle robi revert i żadna z jego operacji nie trafia do bloku",
        "Wywołanie konta zostaje cofnięte, a paymaster i tak płaci",
        "Wywołanie konta zostaje, a płaci konto z własnego depozytu"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Usługa sponsora nadal zatwierdza operacje, ale bundlery odrzucają teraz każdą, która wskazuje jej paymastera, z błędem -32508. Co się stało?",
      options: [
        "Bundlery zbanowały paymastera za zwracanie zbyt dużego kontekstu",
        "Sponsor zmienił klucz podpisu bez ponownego wdrożenia",
        "Saldo samego bundlera spadło poniżej kosztu gasu bundla",
        "Depozyt nie pokrywa już oczekujących operacji paymastera"
      ],
      answer: 3
    }
  ],
  "erc-7562": [
    {
      kind: "cause",
      question: "Dlaczego ERC-7562 ogranicza to, co może czytać kod walidacji UserOperation?",
      options: [
        "Żeby walidacja kosztowała mniej gasu niż faza wykonania konta",
        "Żeby jedna tania zmiana stanu nie unieważniła wielu operacji w puli",
        "Żeby EntryPoint mógł pominąć walidację przy wykonywaniu bundla",
        "Żeby kod wykonania nie mógł czytać storage innych kont"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Smart account czyta block.timestamp wewnątrz validateUserOp, żeby wygaszać klucze sesyjne. Co się dzieje po wysłaniu operacji do publicznego bundlera?",
      options: [
        "Zostaje przyjęta, bo TIMESTAMP jest dozwolony dla kont ze stake'iem",
        "Zostaje przyjęta, ale trafia tylko do bloków z pasującym czasem",
        "Zostaje odrzucona, chyba że bundler używa natywnego tracera Geth",
        "Zostaje odrzucona; konto powinno zamiast tego zwracać validUntil"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Walidacja już wdrożonego konta czyta kontrakt tokena. Do których slotów tego kontraktu ma dostęp bez żadnego stake'u?",
      options: [
        "Do dowolnego slotu, o ile każdy odczyt nastąpi przed pierwszym zapisem",
        "Do slotów, których klucz to keccak256 jego adresu plus offset",
        "Tylko do slotów, które kontrakt tokena udostępnia przez getter",
        "Do żadnego, bo inne kontrakty są w walidacji niedostępne"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym bundler w trybie unsafe różni się od bundlera działającego normalnie?",
      options: [
        "Wysyła bundle bez wcześniejszej symulacji handleOps",
        "Przyjmuje tylko paymastery, factory i agregatory ze stake'iem",
        "Śledzi każdą operację wolniejszym tracerem JavaScript",
        "Pomija trace walidacji, więc nie sprawdza żadnej reguły ERC-7562"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Zespół podłącza bundler do hostowanego endpointu, który przyjmuje tylko nazwane wbudowane tracery, takie jak callTracer. Co z tego wynika?",
      options: [
        "Tracing walidacji nie działa, więc zostaje tryb unsafe albo własny węzeł",
        "Tracing działa, ale każdy trace jest rozliczany jak pojedyncze eth_call",
        "Operacje są przyjmowane, ale nigdy nie trafiają do innych bundlerów",
        "Bundler przechodzi na trace_call i dostaje identyczne wyniki"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co daje stake paymastera według ERC-7562?",
      options: [
        "Podlega slashingowi, ilekroć operacje paymastera zawiodą on-chain",
        "Pokrywa gas operacji, które paymaster sponsoruje",
        "Podraża nowe tożsamości i odblokowuje szerszy dostęp do storage",
        "Zwraca koszty użytkownikom, których operacje paymaster potem odrzuca"
      ],
      answer: 2
    }
  ],
  faucet: [
    {
      kind: "cause",
      question: "Dlaczego na długo żyjącym testnecie testowy ether jest rzadki, choć nie ma wartości?",
      options: [
        "Nowy ether dostają tylko konta z genesis i walidatorzy, a popyt rośnie",
        "Testnet na stałe ogranicza całkowitą podaż do samej alokacji z genesis",
        "Klienci spalają testowy ether szybciej, niż walidatorzy go zarabiają",
        "Faucety muszą kupować go od walidatorów po stałym kursie"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co daje hashowanie w faucecie proof-of-work?",
      options: [
        "Wydobywa testowy ether, który faucet potem wypłaca",
        "Pomaga zabezpieczać konsensus testnetu obok walidatorów",
        "Wycenia każdy claim w czasie i prądzie, żeby odstraszyć boty",
        "Dowodzi, że proszący kontroluje klucz adresu odbiorcy"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Pipeline CI na początku każdego przebiegu pobiera ether Sepolii z publicznego faucetu, a przebiegi co jakiś czas się wywracają. Jakie rozwiązanie jest lepsze?",
      options: [
        "Rotować kilka faucetów, żeby żaden nie nałożył rate limitu",
        "Prosić o większą wypłatę, żeby pipeline rzadziej musiał pobierać",
        "Ponawiać prośbę do faucetu z exponential backoff, aż w końcu zapłaci",
        "Uruchamiać testy na devnecie, którego genesis zasila znane klucze"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Faucet wysyła wypłaty równolegle z jednego klucza, a jeden przelew utknął poniżej base fee. Co dzieje się z późniejszymi wypłatami?",
      options: [
        "Trafiają normalnie do bloków, a utknięty przelew wypada po jednym bloku",
        "Czekają za nim, bo każda potrzebuje kolejnego nonce w sekwencji",
        "Zastępują utknięty przelew, bo płacą wyższą opłatę",
        "Od razu kończą się błędem nonce too low z węzła"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Jak Ephemery, w odróżnieniu od długo żyjącego testnetu, utrzymuje zasilenie faucetów?",
      options: [
        "Jej faucety wybijają ether na żądanie przez publiczny kontrakt",
        "Usuwa wszystkie rate limity, żeby boty nie drenowały jednego adresu",
        "Każdy nowy genesis od nowa zasila portfele faucetów",
        "Jej walidatorzy w każdej epoce oddają nagrody faucetom"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Użytkownik prosi faucet o wypłatę na smart account, którego funkcja receive uruchamia kod, i wypłata się nie udaje. Jaki jest prawdopodobny powód?",
      options: [
        "Faucet wysyła zwykłe przelewy z limitem gasu 21 000",
        "Faucety mogą płacić tylko adresom, które wysłały już transakcję",
        "Konta kontraktów w ogóle nie mogą trzymać testowego etheru",
        "Faucet podpisuje dla innego chain ID niż to, którego używa konto"
      ],
      answer: 0
    }
  ],
  kurtosis: [
    {
      kind: "contrast",
      question: "Co może sprawdzić sieć z ethereum-package dla Kurtosis, czego nie sprawdzi Anvil?",
      options: [
        "Forkowanie stanu mainnetu w wybranym numerze bloku",
        "Podszywanie się pod konto, do którego nie ma się klucza",
        "Finalność i zachowanie różnych prawdziwych klientów",
        "Wykopanie bloku na żądanie między dwoma krokami testu"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co łączy w parę jeden wpis uczestnika w pliku argumentów ethereum-package?",
      options: [
        "Typ klienta wykonawczego i typ klienta konsensusu",
        "Chain ID i epokę hard forka, który się na nim aktywuje",
        "Relay i buildera bloków, który do niego wysyła",
        "Plik klucza walidatora i jego adres wypłat"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Potrzebny jest URL JSON-RPC pierwszego węzła Nethermind w enclave fork-test. Skąd go wziąć?",
      options: [
        "Port 8545 na localhost, wspólny dla wszystkich usług w enclave",
        "Pole rpc_url, które plik argumentów ustawia dla każdego uczestnika",
        "kurtosis port print z nazwą usługi EL i identyfikatorem portu rpc",
        "Drugie uruchomienie kurtosis run z tym samym plikiem i flagą print"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Plik argumentów zostawia każdy obraz klienta na latest. Co z czasem pójdzie źle?",
      options: [
        "Ten sam plik z tygodnia na tydzień testuje inne wersje klientów",
        "Pakiet w ogóle nie wystartuje, dopóki każdy tag obrazu nie zostanie przypięty",
        "Genesis jest przy każdym uruchomieniu generowany z innym chain ID",
        "Obrazy latest ignorują epoki forków ustawione w network_params"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co robi ustawienie gloas_fork_epoch na maksymalną wartość uint64?",
      options: [
        "Aktywuje Gloas w genesis razem ze wszystkimi wcześniejszymi forkami",
        "Pozwala każdemu klientowi wybrać własną epokę aktywacji Gloas",
        "Aktywuje Gloas, gdy tylko sfinalizuje się pierwsza epoka",
        "Planuje Gloas tak daleko, że nigdy się nie aktywuje"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego zasilone klucze z genesis tego pakietu nigdy nie mogą trzymać wartości w sieci publicznej?",
      options: [
        "Są losowo generowane dla każdego enclave, a potem przepadają",
        "Są opublikowane w źródłach pakietu, więc każdy może je przeczytać",
        "Podpisują z chain ID devnetu, który mainnet odrzuca",
        "Należą do walidatorów i dostaną slashing, jeśli zostaną użyte ponownie"
      ],
      answer: 1
    }
  ],
  chainlist: [
    {
      kind: "detail",
      question: "Skąd chainlist.org bierze podstawowe dane o łańcuchach?",
      options: [
        "Z własnego węzła każdego zespołu, odpytywanego przy każdym załadowaniu strony",
        "Z listy zatwierdzonych sieci EVM prowadzonej przez Ethereum Foundation",
        "Z ethereum-lists/chains, agregowanego w chainid.network",
        "Z portfeli zgłaszających sieci, które dodali ich użytkownicy"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Dapp wywołuje wallet_addEthereumChain, a żądanie kończy się wynikiem null. Co można z tego wywnioskować?",
      options: [
        "Portfel przełączył się na nową sieć i będzie dla niej podpisywał",
        "Portfel zweryfikował, że przekazany adres RPC jest uczciwy",
        "Użytkownik odmówił, bo null oznacza, że żądanie się nie udało",
        "Łańcuch dodano; nie wiadomo, czy jest teraz wybrany"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego EIP-3085 każe portfelom podpisywać z chain ID z żądania, a nie z tym, które zgłasza endpoint?",
      options: [
        "Wadliwy albo wrogi endpoint może zgłosić ID innego łańcucha",
        "eth_chainId endpointu dezaktualizuje się po każdej aktualizacji sieci",
        "Endpointy zwracają net_version, które nie jest wartością z EIP-155",
        "Odczyt żądania jest tańszy niż kolejne wywołanie RPC"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Co etykieta tracking none w chainlist mówi o endpoincie?",
      options: [
        "Że chainlist audytował praktyki logowania danych u operatora",
        "Że endpoint kieruje każde żądanie przez własny prywatny relay",
        "Że operator deklaruje brak śledzenia i nikt tego nie sprawdził",
        "Że endpoint odrzuca adresy IP już na poziomie warstwy sieciowej"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Dwie sieci prywatne wybierają ten sam chain ID, a jedna rejestruje go w ethereum-lists. Co ustala ten wpis w rejestrze?",
      options: [
        "Że transakcje drugiej sieci są teraz wszędzie nieważne",
        "Że jeden zespół zgłosił ten numer w rejestrze pierwszy",
        "Że zarejestrowany operator kontroluje to ID w każdym portfelu",
        "Że portfele odmówią dodania niezarejestrowanej sieci"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Zanim kod zaproponuje publiczny adres RPC wzięty z rejestru, wysyła do niego eth_chainId. Dlaczego warto to sprawdzać?",
      options: [
        "Wpisy w rejestrze mogą być martwe albo serwować niewłaściwą sieć",
        "Rozgrzewa to cache endpointu, zanim portfel się z nim połączy",
        "Portfele odrzucają każdy URL, który nigdy nie odpowiedział na żądanie",
        "Rejestruje to origin dappa u operatora endpointu"
      ],
      answer: 0
    }
  ],
  "dex-pool-reads": [
    {
      kind: "scenario",
      question: "Bot wycenia duży swap w Uniswap v3 wyłącznie na podstawie slot0 i liquidity, a wynik mocno odbiega od tego, co zwraca swap. Co pominął?",
      options: [
        "Rezerwy puli, które zwróciłoby wywołanie getReserves",
        "Zmiany płynności na zainicjalizowanych tickach, które swap przekracza",
        "Event Sync wyemitowany przez pulę na końcu ostatniego bloku",
        "Poziom opłaty, który slot0 podaje tylko dla ostatniego swapu"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Skąd klient off-chain odczytuje slot0 puli Uniswap v4?",
      options: [
        "Z adresu własnego kontraktu puli, przez getter slot0",
        "Z kontraktu hooka wskazanego w kluczu puli",
        "Ze storage PoolManager, przez extsload albo StateView",
        "Z ostatniego eventu Initialize dla tego id puli"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym różni się koszt utrzymywania aktualnego stanu pul przez mirroring eventów od odpytywania każdej puli przy każdym nowym headzie?",
      options: [
        "Koszt mirroringu rośnie z aktywnością handlową, odpytywania z liczbą pul",
        "Mirroring wymaga węzła archiwalnego, a odpytywanie działa na każdym pełnym węźle",
        "Mirroring czyta surowe sloty storage, a odpytywanie odtwarza logi Sync",
        "Mirroring nie musi obsługiwać reorgów, a odpytywanie musi wycofywać stare bloki"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego wycena w puli Curve StableSwap może się zmienić między dwoma blokami, w których nikt nie handlował z tą pulą?",
      options: [
        "Jej salda naliczają odsetki w każdym nowym bloku",
        "Jej opłata jest przeliczana z base fee w każdym bloku",
        "Jej odpowiedź get_dy jest cache'owana tylko na jeden blok",
        "Jej współczynnik A zmienia się stopniowo z timestampem bloku"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Mirror nakłada logi z subskrypcji, ale ignoruje wpisy, w których flaga removed ma wartość true. Co się dzieje po reorgu?",
      options: [
        "Podwójnie liczy następny event Sync wyemitowany przez pulę",
        "Trzyma stan puli z bloku, który nie jest już kanoniczny",
        "Traci adresy tokenów puli aż do ponownego uruchomienia",
        "Przestaje dostawać logi, dopóki subskrypcja nie zostanie odnowiona"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Aplikacja czyta dwadzieścia pul dwudziestoma osobnymi wywołaniami z latest przez load balancer i składa z nich cenę jednej trasy. Na czym polega ryzyko?",
      options: [
        "Każde wywołanie jest obciążane gas capem całego multicalla",
        "Load balancer łączy wywołania i odrzuca wszystkie poza jednym",
        "Tag latest za load balancerem wskazuje blok finalized",
        "Odczyty mogą pochodzić z węzłów na różnych wysokościach"
      ],
      answer: 3
    }
  ],
  "quoter-contract": [
    {
      kind: "scenario",
      question: "Programista widzi, że funkcje QuoterV2 są oznaczone jako nonpayable, i wysyła quoteExactInputSingle jako prawdziwą transakcję. Jaki jest wynik?",
      options: [
        "Wycena zostaje zapisana, więc późniejsze odczyty pobiorą ją tanio",
        "Transakcja zużywa gas i nie zostawia ani wyceny, ani żadnego stanu",
        "Swap zostaje wykonany, a tokeny trafiają do nadawcy",
        "Zostaje odrzucona, bo quotery przyjmują wyłącznie eth_call"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co oddaje wywołującemu udane eth_call do funkcji quoteExactInputSingle w QuoterV2?",
      options: [
        "Zwykłe dane zwrotne z kwotą, ceną, tickami i gasem",
        "Błąd JSON-RPC, którego pole data zawiera bajty wyceny",
        "Pusty wynik 0x, a samą wycenę wyemitowaną jako event",
        "Komunikat revertu, który trzeba sparsować na liczby"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym różnią się V4Quoter i QuoterV2, gdy pula nie może zrealizować całej kwoty exact input?",
      options: [
        "V4Quoter zwraca częściową realizację; QuoterV2 kończy się revertem z komunikatem",
        "Każdy kończy się revertem, ale tylko V4Quoter podaje w błędzie id puli",
        "V4Quoter kończy się revertem z NotEnoughLiquidity; QuoterV2 zwraca częściową realizację",
        "Każdy zwraca zerową kwotę wyjściową i zerowy szacunek gasu dla tej puli"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego zapytanie Balancera v3 kończy się revertem NotStaticCall, gdy eth_call ustawia from na adres użytkownika?",
      options: [
        "Router odrzuca wywołania pochodzące z kont EOA",
        "Zapytanie wymaga podpisu konta wskazanego w from",
        "Vault odrzuca każdego wywołującego, który nie dał zgody na jego tokeny",
        "Vault przed wyceną sprawdza, czy tx.origin to adres zerowy"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Portfel używa gasEstimate z quotera jako limitu gasu transakcji swapu użytkownika. Czego powinien się spodziewać?",
      options: [
        "Błędów out of gas, bo brakuje kosztu intrinsic i kosztów routera",
        "Przepłacania, bo quoter dodaje margines bezpieczeństwa do każdego szacunku",
        "Odrzucenia przez węzeł, bo szacunki quotera nie są poprawnymi limitami",
        "Żadnej zmiany, bo szacunek obejmuje już cały swap"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego smart-order-router Uniswapa wycenia trasy v3 przez QuoterV2, a nie na podstawie stanu pul, który już odczytał?",
      options: [
        "Obliczenia off-chain nie odtworzą zaokrągleń opłat w v3",
        "Wywołania quotera nic nie kosztują, gdy są wysłane w multicallu",
        "Wycena off-chain wymagałaby pełnych danych o tickach każdej puli",
        "Dostawcy RPC odrzucają eth_getStorageAt na kontraktach pul Uniswapa"
      ],
      answer: 2
    }
  ],
  "dex-aggregator": [
    {
      kind: "scenario",
      question: "Agregator symuluje wywołanie routera dla użytkownika, który nie dał routerowi zgody, a zwykłe eth_call kończy się revertem STF. Co silnik dodaje, zanim uzna trasę za wiarygodną?",
      options: [
        "Wyższy limit gasu, żeby transfer tokena zdążył się zakończyć",
        "Tag bloku pending, żeby uwzględnić approve użytkownika",
        "State overrides dla slotów salda i allowance takera",
        "Podpisane approve rozgłoszone tuż przed uruchomieniem symulacji"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego silniki wycen trzymają w cache graf stanu pul, zamiast czytać każdą pulę, gdy przychodzi żądanie?",
      options: [
        "Kontrakty pul odrzucają eth_call z adresów bez salda",
        "Szukanie trasy dotyka zbyt wielu pul, by zdążyć z round tripami",
        "Stan z cache jest dokładniejszy niż stan odczytany na headzie",
        "Dostawcy RPC nie pozwalają czytać pul DEX w najnowszym bloku"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co zgłasza 0x Swap API, gdy taker ma za mało sprzedawanego tokena?",
      options: [
        "Błąd HTTP 402 bez żadnej wyceny w odpowiedzi",
        "Wycenę, której cena zawiera dopłatę za niedobór",
        "Komunikat revertu skopiowany z kontraktu routera",
        "Wpis balance w zwracanym przez nie obiekcie issues"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Dostawca RPC po cichu usuwa trzeci parametr eth_call. Co raportuje weryfikacja agregatora dla użytkownika, który nie ma jeszcze środków?",
      options: [
        "Revert, którego by nie było po zasileniu konta",
        "Błąd JSON-RPC, że nadpisania nie są obsługiwane",
        "Sukces, bo węzeł domyślnie ustawia salda na maksimum",
        "Szacunek gasu równy całemu gas capowi węzła"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym wycena RFQ różni się od trasy przez AMM w odpowiedzi agregatora?",
      options: [
        "Jest odczytana ze storage puli i obowiązuje do następnego swapu w niej",
        "To podpisana cena market makera, którą zrealizować może tylko taker",
        "Jest obliczana on-chain przez quoter w żądanym bloku",
        "To ścieżka przez kilka pul wyceniona w jednym multicallu"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Silnik przypina odczyty do numeru najnowszego bloku na endpoincie za load balancerem i od czasu do czasu dostaje header not found. Co się dzieje?",
      options: [
        "Najnowszy blok wypadł w reorgu, a jego nagłówek został usunięty",
        "Provider przycina nagłówki starsze niż okno jego gas capu",
        "Numer bloku wysłano w zapisie dziesiętnym zamiast w hex",
        "Backend jeden blok z tyłu nie ma jeszcze tego bloku"
      ],
      answer: 3
    }
  ],
  "price-oracle": [
    {
      kind: "scenario",
      question: "Kontrakt pożyczkowy przyjmuje odpowiedź Chainlink ETH/USD z mainnetu zawsze, gdy updatedAt jest młodsze niż cztery godziny. Na co pozwala ten limit?",
      options: [
        "Odrzuca dobre ceny, które przychodzą między heartbeatami",
        "Przyjmuje ceny nieaktualne nawet od około trzech godzin",
        "Robi revert, gdy sequencer uptime feed odpowiada 1",
        "Ufa answeredInRound zamiast numerowi rundy"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Usługa chce dostawać event przy każdej aktualizacji feedu ETH/USD. Na jaki adres powinna być ustawiona jej subskrypcja logów?",
      options: [
        "Adres proxy, bo to jego wywołują konsumenci",
        "Adres Multicall3 używany do grupowania odczytów feedu",
        "Adres agregatora, na który obecnie wskazuje proxy",
        "Adres sequencer uptime feedu w tym samym łańcuchu"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym oracle typu pull, taki jak Pyth, różni się od feedu push, takiego jak Chainlink Data Feeds?",
      options: [
        "Transakcja użytkownika niesie pobraną wcześniej podpisaną aktualizację",
        "Węzły zapisują aktualizację za każdym razem, gdy zadziała próg odchylenia",
        "Cena jest uśredniana on-chain z historii ticków puli",
        "Twierdzenie z kaucją obowiązuje, jeśli nikt go nie zakwestionuje w oknie"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego przykładowy konsument Chainlinka na L2 przez okres karencji (grace period) po powrocie sekwencera odrzuca ceny?",
      options: [
        "Flaga dostępności potrzebuje godziny, żeby przejść przez bridge z L1",
        "Węzły oracle potrzebują godziny, żeby wznowić rundy OCR",
        "Proxy trzeba przestawić na nowy agregator",
        "Użytkownicy potrzebują czasu na poprawę pozycji przed likwidacjami"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Dashboard wywołuje observe([86400, 0]) na puli Uniswap v3, której bufor obserwacji obejmuje około sześciu godzin. Co się stanie?",
      options: [
        "Po cichu zwróci zamiast tego średnią z sześciu godzin",
        "Zrobi revert, bo okno sięga przed początek bufora",
        "Zwróci zerowe ticki dla brakujących osiemnastu godzin",
        "Powiększy bufor i obciąży wywołującego kosztem gasu"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Analityk musi sprawdzić, czy likwidacja sprzed dwóch lat użyła uczciwej ceny z Chainlinka. Czego to wymaga po stronie RPC?",
      options: [
        "Wywołania latestRoundData z tagiem pending na dowolnym pełnym węźle",
        "Subskrypcji logów na proxy feedu od teraz",
        "Odczytu feedu z węzła archiwalnego w bloku likwidacji",
        "Świeżej podpisanej aktualizacji z Hermes dla tamtego dnia"
      ],
      answer: 2
    }
  ],
  keeper: [
    {
      kind: "detail",
      question: "Co sprawdza modyfikator cannotExecute od Chainlinka, żeby checkUpkeep mogło działać tylko jako symulacja?",
      options: [
        "Że msg.value symulowanego wywołania wynosi zero",
        "Że cena gasu odpowiada base fee bieżącego bloku",
        "Że msg.sender to zarejestrowany forwarder Automation",
        "Że tx.origin to adres zerowy, jak w eth_call"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Endpoint keepera jest trzy bloki w tyle. checkUpkeep zgłasza do obsługi vault, w którym inny keeper zrobił harvest dwa bloki temu. Co dzieje się z transakcją perform?",
      options: [
        "Robi revert albo nic nie robi, a keeper i tak płaci za gas",
        "Węzeł odmawia jej rozgłoszenia jako duplikatu zadania",
        "Drugi raz robi harvest vaulta na podstawie starego performData",
        "Czeka w mempoolu, aż endpoint znów nadgoni"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego performUpkeep musi ponownie zweryfikować performData, zamiast mu ufać?",
      options: [
        "performData jest zaszyfrowane i trzeba je zdekodować ze storage",
        "Rejestr przycina performData powyżej ustalonego rozmiaru",
        "Każdy może ją wywołać, a stan może się zmienić w międzyczasie",
        "Węzły liczą performData wyłącznie w bloku finalized"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Pięćdziesiąt zadań jest sprawdzanych jednym eth_call na blok w łańcuchu OP Stack z 2-sekundowymi blokami. Ile to mniej więcej wywołań dziennie?",
      options: [
        "Około 360 000, tyle samo co na mainnecie",
        "Około 2 160 000, sześć razy więcej niż na mainnecie",
        "Około 43 200, jedno wywołanie na blok w sumie",
        "Około 7200, bo sprawdzenia wykonuje się raz na każdy slot"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Wywołanie claimPrizes wysłane przez claimera PoolTogether kończy się revertem VrgdaClaimFeeBelowMin. Co najpewniej się stało?",
      options: [
        "Okno odbioru dla tego losowania zamknęło się na dobre",
        "Tablica zwycięzców nie pasowała do tablicy indeksów nagród",
        "Pula nagród nie rozstrzygnęła jeszcze ostatniego losowania",
        "Inne claimery były pierwsze i opłata za odbiór spadła"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Jak po przeniesieniu użytkowników Automation na CRE przez Chainlinka obsługiwany jest istniejący kontrakt z checkUpkeep?",
      options: [
        "Workflow powtarza sprawdzenie off-chain i wysyła podpisany raport",
        "Sprawdzenie trafia do kontraktu i działa on-chain w każdym bloku",
        "Sprawdzenie staje się twierdzeniem z kaucją i oknem na spór",
        "Sprawdzenie wymaga teraz węzła archiwalnego i odtwarzania historii"
      ],
      answer: 0
    }
  ],
  "transaction-simulation": [
    {
      kind: "scenario",
      question: "Na mainnecie podgląd zbudowany z eth_simulateV1 nie pokazuje żadnego ruchu dla wywołania, które wypłaca ether użytkownikowi. Czego najpewniej zabrakło?",
      options: [
        "Flagi traceTransfers w żądaniu",
        "State override dla salda użytkownika",
        "Flagi validation w żądaniu",
        "Bloku pending jako bloku bazowego"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego kontrakt może poznać, że działa w zwykłej symulacji eth_call wysłanej bez pól opłat?",
      options: [
        "Węzeł ustawia block.number na zero w każdym wywołaniu eth_call",
        "EVM udostępnia flagę symulacji przez osobny opcode",
        "eth_call usuwa value z każdego wywołania, które je ma",
        "tx.gasprice to zero, niemożliwe dla transakcji na mainnecie"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Co prestateTracer w trybie diff daje symulatorowi, czego nie dają dane zwracane przez eth_call?",
      options: [
        "Zdekodowaną z ABI wartość zwracaną przez najbardziej zewnętrzne wywołanie",
        "Wartości przed i po dla każdego pola, które się zmieniło",
        "Gwarancję, że włączenie do bloku da wynik zgodny z symulacją",
        "Ostateczną cenę gasu, jaką transakcja w końcu zapłaci"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Portfel pokazuje w podglądzie swap dający 1256 USDC, a prawdziwa transakcja wykonuje się blisko minimum użytkownika. Co to wyjaśnia, jeśli nigdzie nie ma błędu?",
      options: [
        "Podgląd wykonano na węźle archiwalnym w starym bloku",
        "traceTransfers zawyżyło kwotę w podglądzie",
        "Inne transakcje przesunęły pulę, zanim swap się wykonał",
        "Węzeł zastosował state override z innego portfela"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Użytkownik ma podpisać permit z ERC-2612 przez eth_signTypedData_v4. Dlaczego symulacja tego żądania jako transakcji nic nie pokazuje?",
      options: [
        "Podpis niczego nie przenosi; spender wyśle go później",
        "Typed data działa tylko na stanie bloku pending",
        "Permity wykonują się w portfelu, poza EVM",
        "Kontrakty tokenów ukrywają efekty permit przed tracerami"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jak opcja Added protection w MetaMasku utrzymuje wynik zgodny z podglądem?",
      options: [
        "Wysyła transakcję przez prywatny endpoint RPC",
        "Tuż przed wysłaniem symuluje ponownie w pending",
        "Utrzymuje cenę w puli stałą przez jeden blok",
        "Sprawdza on-chain i robi revert przy niezgodności"
      ],
      answer: 3
    }
  ],
  "nft-marketplace": [
    {
      kind: "cause",
      question: "Dlaczego w bazach danych marketplace'ów gromadzą się listingi, których nie da się już zrealizować?",
      options: [
        "Seaport usuwa zrealizowane zlecenia dopiero po końcu okresu sporu",
        "Listingi to podpisy, a stan zmienia się, nie dotykając ich",
        "Węzły usuwają dane zleceń ze storage po ustalonej liczbie bloków",
        "Anulowane zlecenia są ważne, dopóki marketplace ich nie przeindeksuje"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Listing Seaport używa conduit key od OpenSea. Sprawdzenie wywołuje isApprovedForAll(seller, Seaport) i dostaje false. Jaki z tego wniosek?",
      options: [
        "Listing jest nieważny i trzeba go od razu ukryć na stronie",
        "Sprzedający anulował wszystkie zlecenia, zwiększając counter",
        "Sprawdzenie pytało o złego operatora dla tego rodzaju zlecenia",
        "Podpis jest nieaktualny, bo approvale wygasają z każdym blokiem"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co zwraca getOrderStatus z Seaport dla hasha zlecenia?",
      options: [
        "isValidated, isCancelled, totalFilled i totalSize",
        "Wystawcę zlecenia, jego counter, czas początku i czas końca",
        "Conduit key, zone, salt i podpis",
        "Właściciela przedmiotu, jego flagę approval i żądaną cenę"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Marketplace wywołuje royaltyInfo na kolekcji, która nigdy nie zaimplementowała ERC-2981, i zapisuje śmieci jako royalties. Co powinien był zrobić najpierw?",
      options: [
        "Odczytać royalties z pliku metadanych spod tokenURI",
        "Wywołać ownerOf, żeby potwierdzić, że twórca nadal ma token",
        "Zapytać Seaport o royalties zapisane w hashu zlecenia",
        "Wysondować supportsInterface z identyfikatorem ERC-2981"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Indekser buduje tabele posiadaczy wyłącznie z logów Transfer z ERC-721, a kolekcja wymintowała całą podaż przez ERC-2309. Co się stanie?",
      options: [
        "Tokeny pojawią się dwa razy, raz z Transfer i raz z batcha",
        "Tokenów zabraknie, bo mint wyemitował ConsecutiveTransfer",
        "Tokeny pojawią się z adresem zerowym zapisanym jako obecny właściciel",
        "Tokeny pojawią się normalnie, bo ERC-2309 emituje też Transfer"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Indekser potrzebuje ceny, za jaką sprzedano token, a nie tylko zmiany właściciela. Gdzie ją znajdzie?",
      options: [
        "W polu data eventu Transfer, które niesie płatność",
        "W metadanych tokenURI, które zapisują ostatnią cenę transakcji",
        "W odpowiedzi royaltyInfo, która powtarza widzianą cenę sprzedaży",
        "W logu OrderFulfilled z Seaport z tej samej transakcji"
      ],
      answer: 3
    }
  ],
  "governance-voting-power": [
    {
      kind: "consequence",
      question: "Dapp przekazuje numer bloku 26 000 000 do getPastVotes tokena, którego zegar liczy sekundy. Co dostaje?",
      options: [
        "Revert, bo ten punkt w czasie jest późniejszy niż bieżący zegar",
        "Wagi z bloku 26 000 000, przeliczone przez sam token",
        "Wagi z końca 1970 roku, sprzed checkpointów, więc wszędzie zero",
        "Wagi z najnowszego checkpointu, bo wejście jest przycinane do zakresu"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Frontend pokazuje wagę wyborcy w propozycji ERC20Votes jako balanceOf w bloku snapshotu. Wyborca nigdy nie delegował. Co jest nie tak?",
      options: [
        "Nic, bo saldo w snapshocie równa się liczbie głosów w snapshocie",
        "Waga jest podwojona, bo saldo i głosy są sumowane",
        "Niezdelegowane tokeny nie niosą głosów, więc prawdziwa waga to zero",
        "Waga jest bieżąca, bo balanceOf ignoruje tagi bloków"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym dane wejściowe typowej strategii Snapshota różnią się od tego, co czyta Governor on-chain?",
      options: [
        "Czyta checkpointy z tokena, więc nie potrzebuje starego stanu",
        "Czyta głosy w latest i odejmuje transfery od początku głosowania",
        "Czyta dowody storage, więc każdy głos jest weryfikowany on-chain",
        "Czyta zwykłe salda w bloku snapshotu, ze starego stanu"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Posiadacz Aave oddaje głos w sieci głosowania innej niż Ethereum. Co ktoś musiał pobrać z węzła Ethereum, żeby ten głos się liczył?",
      options: [
        "eth_getProof slotów wyborcy w bloku snapshotu",
        "eth_call do getPastVotes w bieżącym headzie Ethereum",
        "Trace ostatniego transferu wyborcy przed snapshotem",
        "Podpisane oświadczenie o saldzie od providera RPC wyborcy"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego getPastVotes odpowiada dla punktu w czasie sprzed miesięcy na węźle, który nie jest archiwalny?",
      options: [
        "Token trzyma checkpointy w bieżącym stanie i je przeszukuje",
        "Węzeł odtwarza transfery tokena, żeby odbudować saldo",
        "Governor cache'uje wagę wyborcy, gdy otwiera się propozycja",
        "Wywołanie view sprawia, że węzeł sam pobiera stan archiwalny"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co zwraca CLOCK_MODE dla tokena, którego checkpointy są indeksowane timestampem?",
      options: ["mode=blocknumber&from=default", "mode=timestamp", "mode=blocknumber&from=eip155:1", "mode=seconds&from=default"],
      answer: 1
    }
  ],
  "erc-4626": [
    {
      kind: "detail",
      question: "Jak oblicza się APY vaulta z dwóch odczytów convertToAssets?",
      options: [
        "Dzieli się nowszy przez starszy i przelicza na rok według timestampów",
        "Odejmuje się starszy od nowszego i dzieli przez liczbę bloków",
        "Dzieli się totalAssets przez totalSupply w samym nowszym bloku",
        "Uśrednia się dwa odczyty i porównuje wynik z ceną aktywa"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego ERC-4626 każe vaultowi zaokrąglać w dół liczbę udziałów wydawanych za depozyt?",
      options: [
        "Żeby liczby udziałów zawsze mieściły się w 128-bitowym slocie storage",
        "Żeby depozyty i umorzenia zwracały identyczne kwoty",
        "Żeby zaokrąglenie sprzyjało vaultowi i nikt nie mógł go drenować",
        "Żeby wyniki preview dokładnie zgadzały się z funkcjami konwersji"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Atakujący wpłaca 1 jednostkę do pustego vaulta USDC, a potem przelewa do niego bezpośrednio 10 000 USDC. Co się dzieje z depozytem ofiary wynoszącym 9999 USDC?",
      options: [
        "Mintuje 9999 udziałów po pierwotnym kursie jeden do jednego",
        "Kończy się revertem, bo vault najpierw wykrywa bezpośredni przelew",
        "Mintuje połowę udziałów, a vault zatrzymuje donację",
        "Mintuje zero udziałów, a jedyny udział atakującego go przejmuje"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Dashboard wycenia udziały vaulta USDC na Morpho Vault V2 jako convertToAssets(10^6). Co wyświetli?",
      options: [
        "Poprawną cenę, bo udziały mają tyle miejsc dziesiętnych co aktywo",
        "Cenę o wiele za niską, bo udziały mają 18 miejsc dziesiętnych",
        "Revert, bo convertToAssets odrzuca wejścia mniejsze niż 1e18",
        "Cenę po opłatach, bo małe wejście uruchamia ścieżkę preview"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Co odróżnia previewRedeem od convertToAssets?",
      options: [
        "previewRedeem ignoruje opłaty i podaje wyidealizowany kurs",
        "previewRedeem zależy od wywołującego, convertToAssets nigdy",
        "previewRedeem zaokrągla w górę, a convertToAssets w dół",
        "previewRedeem uwzględnia opłaty i bieżące warunki"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Integrator widzi, że maxDeposit zwraca zero w vaulcie, który przyjmuje depozyty od każdego adresu. Jakie jest najbardziej prawdopodobne wyjaśnienie?",
      options: [
        "Vault celowo zwraca zero, co jest dozwolonym zaniżeniem",
        "Vault jest wstrzymany, a depozyty będą robić revert do wznowienia",
        "Odbiorca jest zablokowany, a inne adresy mogą wpłacać",
        "Węzeł to pruned node, więc funkcja view czyta pusty slot storage"
      ],
      answer: 0
    }
  ],
  "fork-testing": [
    {
      kind: "scenario",
      question: "Test na forku przypięty do bloku z zeszłego miesiąca pada na pierwszym odczycie stanu. Jaka jest najbardziej prawdopodobna przyczyna?",
      options: [
        "Lokalne EVM nie uruchomi kontraktów wdrożonych przed hard forkiem",
        "Upstream to pruned node, który nie ma już tego stanu",
        "Cache forka wygasł, a Foundry odmawia ponownego pobrania",
        "Runner testów potrzebuje przestrzeni nazw debug, żeby czytać storage"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Zespół odtwarza exploit, forkując w numerze bloku samej transakcji exploita. Od jakiego stanu startuje?",
      options: [
        "Od stanu sprzed exploita, bo forki startują od rodzica",
        "Od stanu po exploicie, bo cały ten blok już się wykonał",
        "Kończy się błędem, bo fork nie może startować w bloku z exploitem",
        "Od stanu w połowie bloku, przy indeksie samego exploita"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego Foundry wskazuje blok forka po hashu w odczytach stanu wysyłanych do upstreamu?",
      options: [
        "Żeby żądania przechodziły przez rate limiter providera bez sprawdzania",
        "Żeby fork mógł czytać stary stan z upstreamu z pruningiem",
        "Żeby jedno żądanie zwracało saldo, nonce i kod",
        "Żeby reorg na upstreamie nie zmienił stanu pod testem"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Test zasila konto przez tenderly_setErc20Balance, a indekser aplikacji nigdy nie pokazuje wpłaty. Dlaczego?",
      options: [
        "Metoda potrzebuje wykopanego bloku, zanim saldo będzie widoczne",
        "Metoda zapisuje slot salda i nie emituje eventu Transfer",
        "Indekser ignoruje hostowane forki, dopóki nie skończą synchronizacji",
        "Metoda zasila tylko ether, więc salda tokenów zostają zerowe"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co robi cast run, zanim wykona docelową transakcję?",
      options: [
        "Forkuje w bloku docelowym i jeszcze raz uruchamia tę samą transakcję",
        "Pobiera receipt i odbudowuje trace z jego logów",
        "Forkuje w bloku rodzica i odtwarza wcześniejsze transakcje bloku",
        "Wysyła transakcję do prywatnej puli i czeka na wynik"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Kiedy fork jest lepszym narzędziem niż jedno eth_call ze state overrides?",
      options: [
        "Gdy musi się wykonać sekwencja transakcji albo impersonacja",
        "Gdy pojedynczy odczyt musi dostać odpowiedź w jednym żądaniu",
        "Gdy endpoint nie może się dowiedzieć, który kontrakt jest wywoływany",
        "Gdy odpowiedź musi odzwierciedlać najnowszy blok sieci"
      ],
      answer: 0
    }
  ],
  "erc-6492": [
    {
      kind: "scenario",
      question: "Backend logowania wywołuje isValidSignature na adresie użytkownika i dostaje 0x, a ostatnie 32 bajty podpisu to powtórzone 0x6492. Jaki wniosek powinien wyciągnąć?",
      options: [
        "Konto nie jest jeszcze wdrożone; trzeba zasymulować wywołanie factory",
        "Podpisujący to zwykłe konto EOA, więc powinno rozstrzygać samo ecrecover",
        "Podpis złożono dla innego łańcucha i nie da się go zweryfikować na tym",
        "Portfel odrzucił wiadomość, bo 0x to sposób, w jaki kontrakt zwraca false"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego magiczny sufiks ERC-6492 kończy się bajtem 0x92?",
      options: [
        "Koduje numer ERC, żeby narzędzia mogły odnaleźć standard",
        "To niepoprawna wartość v, więc nie może kolidować z podpisem ECDSA",
        "Oznacza koniec krotki zakodowanej w ABI, żeby dekodery wiedziały, gdzie skończyć",
        "Mówi weryfikującemu, w jaki interfejs factory celuje calldata"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co referencyjny kontrakt ValidateSigOffchain zwraca do eth_call, które go uruchamia?",
      options: [
        "Runtime bytecode wdrożonego konta, gdy sprawdzenie przejdzie",
        "Magiczną wartość ERC-1271 0x1626ba7e dopełnioną bajtami zerowymi",
        "Jeden bajt: 0x01 dla ważnego podpisu i 0x00 dla nieważnego",
        "Odzyskany adres podpisującego, dopełniony z lewej do 32-bajtowego słowa"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym weryfikacja podpisu ERC-6492 różni się od zwykłego sprawdzenia ERC-1271?",
      options: [
        "Wymaga wywołania factory, które zmienia stan, więc działa jako init code w wywołaniu",
        "Zastępuje isValidSignature przez ecrecover na adresie samego factory",
        "Wymaga klucza prywatnego konta, więc może ją wykonać tylko sam portfel",
        "Pomija eth_call i czyta klucz właściciela wprost przez eth_getStorageAt"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Konto podpisało opakowaną wiadomość przed wdrożeniem, potem zostało wdrożone, a później zmieniło właścicieli. Co się dzieje, gdy stary opakowany podpis jest weryfikowany dziś?",
      options: [
        "Nadal przechodzi, bo opakowanie utrwala właścicieli z chwili podpisu",
        "Nie przechodzi, bo decyduje teraz działający kontrakt i jego właściciele",
        "Nadal przechodzi, bo opakowane podpisy sprawdza się względem factory",
        "Nie przechodzi, bo wdrożone konto odrzuca każdy opakowany podpis"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Weryfikator oparty na referencyjnym walidatorze ERC-6492 dostaje zwykły 65-bajtowy podpis ECDSA z konta z delegacją EIP-7702, którego delegat nie ma isValidSignature. Jaki jest wynik?",
      options: [
        "Przechodzi, bo dla 65-bajtowych danych walidator najpierw próbuje ecrecover",
        "Przechodzi, bo 23-bajtowy znacznik delegacji liczy się jako brak kodu",
        "Nie przechodzi z ERC6492DeployFailed, bo walidator najpierw uruchamia factory",
        "Nie przechodzi przez revert, bo kod pod adresem nie dopuszcza do ecrecover"
      ],
      answer: 3
    }
  ],
  x402: [
    {
      kind: "scenario",
      question: "Klient dostaje wymaganie x402 z amount 10000 i USDC jako asset na Base. Ile ma zapłacić?",
      options: [
        "10 000 USDC, bo kwoty podaje się w całych tokenach",
        "0,01 USDC, bo kwoty są w najmniejszej jednostce tokena",
        "10 000 wei ETH, bo kwota pokrywa gas rozliczenia",
        "0,0001 USDC, bo kwoty podaje się w setnych częściach centa"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Gdzie w x402 w wersji 2 przez HTTP klient umieszcza swoją podpisaną płatność?",
      options: [
        "W body żądania, jako pole JSON o nazwie x402Payment",
        "W nagłówku Authorization, jako bearer token sesji",
        "W nagłówku PAYMENT-SIGNATURE, jako JSON zakodowany w base64",
        "W nagłówku PAYMENT-REQUIRED, jako podpis EIP-712 zapisany w hex"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego referencyjny facilitator odrzuca płatność, której adres asset nie ma kodu?",
      options: [
        "Wywołanie pustego adresu kończy się sukcesem i nic nie zwraca, więc symulacja przechodzi",
        "Adres bez kodu nie może przechowywać sald, więc środki płatnika by przepadły",
        "EIP-3009 zakazuje tokenów tworzonych przez CREATE2, na co wskazuje pusty adres",
        "Estymacja gasu nie działa na pustych adresach, więc rozliczenia nie da się wycenić"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Facilitator rozgłasza rozliczenie, ale oczekiwanie na receipt kończy się timeoutem. Co pozwala mu zwrócić specyfikacja w wersji 2?",
      options: [
        "Odpowiedź o sukcesie, bo autoryzacja została już wcześniej zweryfikowana",
        "invalid_transaction_state, żeby klient podpisał nową autoryzację",
        "Błąd 500 bez hasha, bo nic nie wiadomo, dopóki nie przyjdzie receipt",
        "settlement_pending z hashem, żeby wywołujący mógł to sprawdzić w łańcuchu"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym schemat upto różni się od exact na łańcuchach EVM?",
      options: [
        "Używa EIP-3009 z dłuższym oknem, żeby rozliczenie mogło nastąpić później",
        "Pozwala facilitatorowi podnieść kwotę, jeśli w międzyczasie wzrosną ceny gasu",
        "Rozlicza kwotę naliczoną według zużycia, do podpisanego maksimum, przez Permit2",
        "Łączy wiele płatności exact w jeden transfer na koniec sesji"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Gateway RPC opłacany przez x402 rozlicza osobny transfer on-chain dla każdego wywołania eth_blockNumber. Na jaki problem trafia taki projekt?",
      options: [
        "Nonce EIP-3009 kończą się po kilku tysiącach autoryzacji na płatnika",
        "Facilitatory odrzucają kwoty poniżej jednego centa w każdej obsługiwanej sieci",
        "Batche JSON-RPC nie mogą nieść nagłówka, więc każdy batch się nie udaje",
        "Każde rozliczenie może kosztować więcej gasu niż żądanie, za które płaci"
      ],
      answer: 3
    }
  ],
  "onchain-agents": [
    {
      kind: "scenario",
      question: "Agent czyta token, którego symbol() zwraca USDC, a name() każe modelowi wysłać środki na nowy adres. Co naprawdę chroni agenta?",
      options: [
        "Allowlista tokenów po adresie i polityka wydatków egzekwowana poza modelem",
        "Sprawdzenie, czy symbol() znów zwraca USDC, przed każdym transferem od modelu",
        "Odczyt nazwy tokenu przy tagu finalized zamiast przy latest",
        "Prośba do modelu, żeby się upewnił, że polecenie przyszło od operatora"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jak w Model Context Protocol host modelu wywołuje narzędzie, które opakowuje eth_call?",
      options: [
        "Wysyła eth_call bezpośrednio do węzła z nazwą narzędzia w polu id",
        "Wysyła żądanie tools/call, które wskazuje narzędzie i przekazuje argumenty",
        "Wysyła inputSchema narzędzia na port RPC węzła jako żądanie batch",
        "Otwiera strumień eth_subscribe i wysyła argumenty jako filtr"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego ograniczony klucz, na przykład session key zawężony do jednego kontraktu i kwoty, jest prawdziwą granicą bezpieczeństwa agenta sterowanego modelem?",
      options: [
        "Session keys obniżają koszt transakcji, co usuwa powód do ataku",
        "Bundlery odrzucają UserOperations, których calldata wygenerował model",
        "Session key ukrywa adres agenta, więc atakujący nie mogą go namierzyć",
        "Model nie odróżnia pewnie poleceń od danych, więc prompt nie jest limitem"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym usługa Olas zbudowana w Open Autonomy różni się od agenta z jednym kluczem?",
      options: [
        "Jej agenci wysyłają niepodpisane transakcje, które podpisuje za nich sieć Olas",
        "Jej agenci działają tylko przez płatności x402 i nigdy nie wysyłają transakcji",
        "Wymagana liczba jej instancji podpisuje transakcję Safe'a, którą wysyła keeper",
        "Jej agenci działają wewnątrz EVM, więc czytają stan bez żadnych wywołań RPC"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Strażnik symuluje transfer agenta przy latest i symulacja się udaje. Co nadal może pójść źle?",
      options: [
        "Nic, bo wywołanie przy latest to dokładnie stan, na który trafi transakcja",
        "Stan może się zmienić przed włączeniem, więc transakcja zachowa się inaczej",
        "Symulacja zużywa gas agenta, więc prawdziwej transakcji zabraknie środków",
        "Węzeł zapisuje symulację, więc prawdziwa zostanie odrzucona jako powtórka"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Dwa procesy jednego agenta podpisują tym samym kluczem i każdy w tej samej chwili odczytuje swój następny nonce z eth_getTransactionCount. Co się dzieje?",
      options: [
        "Każdy wybiera ten sam nonce, więc jedna transakcja zastępuje albo blokuje drugą",
        "Węzeł sam nadaje różne nonce, bo żądania przyszły od jednego klucza",
        "Transakcje trafiają do bloków po kolei, bo nonce liczy się osobno dla każdego procesu",
        "Druga zostaje odrzucona, bo klucz może mieć tylko jedną transakcję pending"
      ],
      answer: 0
    }
  ]
};
