// Polish text for the Wallets & tooling lessons, keyed by topic id. Only the words: ids, link
// targets, code, related topics, and sources come from data/tooling.js.
export const topics = {
  "eip-1193": {
    title: "Provider EIP-1193",
    aliases: [
      "eip-1193",
      "window.ethereum",
      "injected provider",
      "wstrzyknięty provider",
      "provider api",
      "accountsChanged",
      "chainChanged"
    ],
    summary: "EIP-1193 to interfejs JavaScript, który portfel przeglądarkowy wstrzykuje do strony. Udostępnia jedną metodę `request({ method, params })`, zwracającą promise, oraz niewielki zestaw zdarzeń, więc aplikacja webowa mówi [[json-rpc|JSON-RPC]], w ogóle nie wybierając węzła.",
    sections: [
      {
        heading: "Interfejs",
        paragraphs: [
          "Zgodny provider udostępnia dokładnie jedno wywołanie: `request({ method, params })`. Zwraca ono promise, który rozwiązuje się wartością `result` z odpowiedzi JSON-RPC albo zostaje odrzucony z `ProviderRpcError` zawierającym `code`, `message` i opcjonalne `data`. Nazwy metod są zwykłe ([[eth-call|eth_call]], [[eth-get-balance|eth_getBalance]], [[eth-send-transaction|eth_sendTransaction]]), a do tego dochodzą [[wallet-rpc|metody wallet_]] dostępne tylko w portfelu. Parametry zachowują to samo [[hex-encoding|kodowanie hex]] co JSON-RPC przesyłany przez sieć, więc strona nadal przekazuje `0x1`, a nie `1`.",
          "EIP-1193 definiuje własne kody błędów, oprócz standardowych [[rpc-errors|kodów JSON-RPC]]: `4001`, gdy użytkownik odrzuci żądanie, `4100`, gdy metoda wymaga autoryzacji, której strona nie ma, `4200`, gdy portfel nie obsługuje metody, oraz `4900` lub `4901`, gdy provider jest odłączony od wszystkich łańcuchów albo od żądanego łańcucha. Kod `4001` musi obsłużyć każdy dapp, bo zamknięcie przez użytkownika okna z prośbą o podpis to normalna sytuacja, a nie awaria."
        ]
      },
      {
        heading: "Zdarzenia",
        paragraphs: [
          "Provider jest event emitterem. `accountsChanged` jest emitowane z nową tablicą dozwolonych adresów, pustą, gdy użytkownik odłączy stronę. `chainChanged` jest emitowane z nowym [[chain-id|chain ID]] jako ciągiem hex, a specyfikacja zaleca po prostu przeładować stronę, zamiast próbować przenosić dane aplikacji na nowy łańcuch. `connect` jest emitowane z obiektem `{ chainId }`, gdy provider po raz pierwszy może obsługiwać żądania, `disconnect` z błędem, gdy traci tę możliwość, a `message` dostarcza powiadomienia z [[eth-subscribe|subskrypcji]], jeśli portfel je obsługuje. Dapp, który nie słucha żadnego z tych zdarzeń, będzie dalej pokazywał salda z łańcucha, który użytkownik opuścił kilka minut temu."
        ]
      },
      {
        heading: "Kto naprawdę odpowiada",
        paragraphs: [
          "Provider nie jest węzłem. Portfel dzieli przychodzące żądania: na wszystko, co dotyka klucza albo zgody użytkownika (podpisywanie, wysyłanie, uprawnienia, przełączanie łańcucha), odpowiada sam, wyświetlając prośbę o zgodę, a całą resztę przekazuje do [[rpc-provider|endpointu RPC]], który ma skonfigurowany. Dapp nie wybiera tego endpointu, nie zna jego [[rate-limits|rate limitów]] i nie może zakładać, że obsługuje on tracing, stan historyczny czy szerokie zakresy [[eth-get-logs|eth_getLogs]].",
          "Dlatego poważne aplikacje używają dwóch ścieżek: wstrzykniętego providera do podpisywania i wysyłania oraz własnego endpointu albo [[indexer|indeksera]] do odczytów. Oznacza to też, że widok head w portfelu i we własnym endpoincie aplikacji może się różnić o blok, więc transakcja, którą portfel właśnie wysłał, może jeszcze nie być widoczna w odczytach aplikacji; zobacz [[head-lag|spójność head]] i [[dapp-architecture|architekturę dappa]]."
        ]
      },
      {
        heading: "Jak znaleźć właściwy provider",
        paragraphs: [
          "Przez lata każdy portfel zapisywał się w `window.ethereum`, więc wygrywało rozszerzenie, które załadowało się ostatnie, a użytkownicy z dwoma portfelami nie mieli wyboru. [[eip-6963|EIP-6963]] naprawia to protokołem ogłoszeń: strona wysyła zdarzenie `eip6963:requestProvider`, każdy portfel odpowiada zdarzeniem `eip6963:announceProvider` ze swoim obiektem providera i rekordem `info` zawierającym `uuid`, `name`, `icon` i identyfikator `rdns` w formacie reverse DNS, a strona wyświetla listę. Nowy kod powinien wykrywać providery w ten sposób, a `window.ethereum` traktować tylko jako fallback."
        ]
      }
    ],
    example: {
      title: "Łączenie i reagowanie na zmiany",
      note: "Wybór providera dopiero wtedy, gdy użytkownik go wskaże, a nie zaraz po wysłaniu żądania, sprawia, że portfel wstrzykujący się z opóźnieniem nie psuje strony. `eth_requestAccounts` wyświetla prośbę o zgodę; `eth_accounts` tego nie robi i zwraca pustą tablicę, dopóki użytkownik nie przyzna dostępu."
    },
    pitfalls: [
      "Traktowanie kodu błędu `4001` jako awarii do ponowienia; użytkownik odmówił, a natychmiastowe ponowne pytanie to prosta droga do zablokowania strony przez portfele.",
      "Czytanie `window.ethereum` w założeniu, że to portfel, którego chce użytkownik; przy dwóch zainstalowanych rozszerzeniach wygrywa to, które załadowało się ostatnie.",
      "Zapisanie chain ID w cache raz przy starcie; użytkownik może w każdej chwili zmienić sieć, a informuje o tym tylko `chainChanged`.",
      "Kierowanie masowych odczytów przez wstrzyknięty provider; dziedziczy się wtedy endpoint portfela, jego limity i nieznany zestaw funkcji."
    ]
  },
  "wallet-rpc": {
    title: "Metody wallet_",
    aliases: [
      "wallet_",
      "metody portfela",
      "eth_requestAccounts",
      "wallet_switchEthereumChain",
      "wallet_addEthereumChain",
      "wallet_watchAsset",
      "wallet_sendCalls",
      "4902"
    ],
    summary: "Na metody `wallet_`, a także na `eth_requestAccounts`, odpowiada sam portfel, a nie węzeł: służą do prośby o dostęp do kont, przełączania lub dodawania łańcucha, śledzenia aktywa, zarządzania uprawnieniami poszczególnych stron i wysyłania wywołań w batchu.",
    sections: [
      {
        heading: "Metody i ich EIP",
        paragraphs: [
          "`eth_requestAccounts` (EIP-1102) pyta użytkownika o zgodę i zwraca adresy, których strona może używać. `wallet_switchEthereumChain` (EIP-3326) przyjmuje `[{ \"chainId\": \"0x1\" }]` i prosi portfel o przełączenie strony na ten łańcuch; jeśli portfel go nie zna, żądanie kończy się błędem o kodzie `4902`. `wallet_addEthereumChain` (EIP-3085) dostarcza brakującą definicję: `chainId`, `chainName`, `rpcUrls`, `nativeCurrency` i `blockExplorerUrls`. `wallet_watchAsset` (EIP-747) prosi użytkownika o wyświetlenie tokena w portfelu, co jest akcją w interfejsie, a nie transakcją.",
          "`wallet_getPermissions` i `wallet_requestPermissions` (EIP-2255) przedstawiają uprawnienia strony jako obiekty, a nie gołą listę kont; tak portfel modeluje regułę „ten origin może widzieć te konta”. EIP-5792 dodaje `wallet_getCapabilities`, `wallet_sendCalls`, `wallet_getCallsStatus` i `wallet_showCallsStatus`: strona przekazuje tablicę wywołań, portfel zwraca identyfikator, a strona odpytuje o status. Na koncie, które to obsługuje, batch wykonuje się atomowo, co eliminuje taniec z dwoma oknami: najpierw approve, potem swap."
        ]
      },
      {
        heading: "Dlaczego węzeł nigdy ich nie widzi",
        paragraphs: [
          "Węzeł nie ma użytkownika, interfejsu ani kont należących do kogokolwiek. Specyfikacja [[execution-apis|execution APIs]] nie definiuje żadnej metody `wallet_`, więc wysłanie takiej metody do endpointu HTTP zwraca [[rpc-errors|błąd]] `-32601`, method not found. Te wywołania istnieją tylko po stronie portfela, za interfejsem [[eip-1193|providera EIP-1193]], gdzie człowiek może je zatwierdzić. To samo dotyczy tej połowy [[signing-methods|podpisywania]], która przyznaje dostęp do kont: klucz trzyma portfel i to on decyduje.",
          "W efekcie „połączony” to uprawnienie, które użytkownik nadaje osobno każdemu originowi i może w każdej chwili cofnąć w portfelu. `eth_accounts` może zacząć zwracać pustą tablicę między dwoma kolejnymi wywołaniami aplikacji, a strona, która traktuje pierwsze udane połączenie jako trwałe, będzie dalej renderować interfejs zalogowanego użytkownika komuś, kto już nie jest połączony."
        ]
      },
      {
        heading: "Wzorce, które działają",
        paragraphs: [
          "Zawsze najpierw trzeba spróbować przełączenia, a dodanie łańcucha traktować jako fallback, bo większość użytkowników ma już popularne łańcuchy. Nigdy nie wywołuj `wallet_addEthereumChain` z własnej inicjatywy, podając własny URL RPC; to prośba do użytkownika, żeby cały ruch dla tego [[chain-id|chain ID]] puścił przez endpoint, który kontrolujesz. Po każdym przełączeniu trzeba ponownie odczytać `eth_chainId`, zamiast ufać, że wywołanie się powiodło, bo użytkownik mógł w oknie zatwierdzić inną sieć.",
          "Przy batchowaniu trzeba sprawdzić `wallet_getCapabilities`, zanim zaoferuje się tę funkcję: obsługa zależy od typu konta, a nie tylko od portfela, i zwykle umożliwia ją [[erc-4337|smart konto]] albo [[eip-7702|konto EOA z delegacją EIP-7702]]. Identyfikator z `wallet_sendCalls` należy traktować jako uchwyt na poziomie portfela, a nie hash [[transaction|transakcji]]."
        ]
      }
    ],
    example: {
      title: "Przełączenie łańcucha i dodanie go tylko wtedy, gdy portfel go nie zna",
      note: "Kod `4902` to udokumentowany sygnał, że łańcuch jest nieznany; każdy inny kod powinien zostać przekazany dalej."
    },
    pitfalls: [
      "Wysyłanie metody `wallet_` na URL RPC przez HTTP; węzeł odpowiada `-32601`, bo te metody żyją w portfelu, a nie w łańcuchu.",
      "Zakładanie, że rozwiązany promise `wallet_switchEthereumChain` oznacza, że strona jest na żądanym łańcuchu; potem trzeba ponownie odczytać `eth_chainId`.",
      "Wywoływanie `wallet_addEthereumChain` dla łańcucha, który użytkownik już ma; niczego to nie nadpisuje, ale uczy użytkowników zatwierdzać prośby dotyczące sieci.",
      "Oferowanie wywołań w batchu bez sprawdzenia `wallet_getCapabilities`; obsługa zależy od konta, a nie tylko od portfela."
    ]
  },
  "signing-methods": {
    title: "Metody podpisywania",
    aliases: ["signing methods", "podpisywanie wiadomości", "personal_sign", "eth_sign", "eth_signTypedData_v4", "eth_accounts", "EIP-191"],
    summary: "Metody podpisywania proszą posiadacza klucza, prawie zawsze portfel, o złożenie [[ecdsa-signature|podpisu]] pod wiadomością, a nie o wysłanie [[transaction|transakcji]]: `personal_sign` dla tekstu, `eth_signTypedData_v4` dla danych strukturalnych i przestarzała `eth_sign` dla surowego hasha.",
    sections: [
      {
        heading: "Cztery metody",
        paragraphs: [
          "`eth_accounts` zwraca adresy, których strona ma już prawo używać, i nigdy nie pyta o zgodę; dopóki [[wallet-rpc|eth_requestAccounts]] nie zostanie zatwierdzone, odpowiada pustą tablicą. `personal_sign` przyjmuje `[message, address]` i podpisuje digest (skrót do podpisania) EIP-191, czyli `keccak256` z prefiksu `\\x19Ethereum Signed Message:\\n`, długości wiadomości i samej wiadomości. Cały sens tkwi w tym prefiksie: digest z prefiksem nigdy nie zrówna się z poprawną transakcją, więc podpisu nie da się ponownie użyć (replay) jako transakcji.",
          "`eth_signTypedData_v4` przyjmuje `[address, typedDataJson]` i podpisuje strukturę [[eip-712|EIP-712]], dzięki czemu portfel może pokazać nazwane pola zamiast ciągu hex. `eth_sign` przyjmuje `[address, hash]` i podpisuje 32 dowolne bajty bez żadnego prefiksu. Te bajty mogą być hashem transakcji, więc strona, która zdobędzie taki podpis, może przenieść środki użytkownika. Portfele wyłączyły tę metodę, ukryły ją za ostrzeżeniem albo całkiem usunęły i żaden nowy kod nie powinien jej używać."
        ]
      },
      {
        heading: "Dlaczego węzeł nie powinien wystawiać personal_",
        paragraphs: [
          "[[namespaces|Przestrzeń nazw]] `personal_` istnieje w [[execution-client|klientach wykonawczych]] do lokalnego zarządzania kluczami: import klucza, odblokowanie konta, podpisywanie nim. Węzeł z odblokowanym kontem i wystawionym portem HTTP to portfel bez hasła i w ten sposób okradziono już tysiące węzłów. [[geth|Geth]] oznaczył tę przestrzeń nazw jako przestarzałą na rzecz zewnętrznego signera clef, a później ją usunął; tam, gdzie nadal istnieje, nigdy nie może być osiągalna spoza maszyny. Zobacz [[security|bezpieczeństwo RPC]].",
          "Z tego rozdzielenia wynika, że portfel przeglądarkowy implementuje te metody lokalnie, zamiast przekazywać je dalej. Publiczny endpoint odpowiada na `personal_sign` kodem `-32601` albo [[rpc-errors|błędem]] wyłączonej metody i jest to poprawne zachowanie, a nie zła konfiguracja."
        ]
      },
      {
        heading: "Weryfikacja otrzymanego podpisu",
        paragraphs: [
          "Podpis ma 65 bajtów: `r`, `s` oraz `v` równe 27 albo 28. Odzyskanie adresu podpisującego wymaga odtworzenia dokładnie tego digestu, który podpisał portfel, i uruchomienia `ecrecover`; błąd w prefiksie albo w kodowaniu daje poprawnie wyglądający, ale bezsensowny [[address|adres]]. Konta będące [[smart-contract|smart kontraktami]] w ogóle nie mogą tworzyć podpisów ECDSA, więc ich podpisy weryfikuje się, wywołując przez [[eth-call|eth_call]] funkcję konta `isValidSignature(bytes32,bytes)` z [[erc-1271|ERC-1271]] i sprawdzając, czy zwraca magiczną wartość `0x1626ba7e`. Każdy proces logowania, który ma działać dla [[erc-4337|smart kont]], potrzebuje tej gałęzi.",
          "Podpis należy traktować jako dowód kontroli nad kluczem i nic więcej. Proces logowania wymaga, żeby podpisana wiadomość zawierała nonce wydany przez serwer, origin albo domenę oraz czas wygaśnięcia; inaczej ten sam podpis może ponownie wykorzystać każdy, kto go przechwycił."
        ]
      }
    ],
    example: {
      title: "personal_sign przez provider portfela",
      note: "To nonce i czas wygaśnięcia w wiadomości uniemożliwiają późniejsze ponowne użycie podpisu."
    },
    pitfalls: [
      "Zamiana kolejności parametrów; `personal_sign` przyjmuje `[message, address]`, a przestarzała `eth_sign` `[address, hash]`, i taki błąd albo po cichu nie działa, albo podpisuje nie to, co trzeba.",
      "Weryfikacja samym `ecrecover`, która odrzuca konta będące smart kontraktami; one wymagają zamiast tego wywołania `isValidSignature` z [[erc-1271|ERC-1271]].",
      "Uznawanie podpisu za uwierzytelnienie bez nonce wydanego przez serwer, originu i czasu wygaśnięcia; taki podpis można ponownie wykorzystywać bez końca.",
      "Przekazywanie do `personal_sign` wartości, która jest już hashem; portfel dodaje prefiks i hashuje ją ponownie, więc digest nie jest tym, czego oczekuje kontrakt."
    ]
  },
  "eip-712": {
    title: "EIP-712: typed data",
    aliases: [
      "eip-712",
      "typed data",
      "dane typowane",
      "signTypedData",
      "domain separator",
      "permit",
      "ERC-2612",
      "structured signing",
      "podpis danych strukturalnych"
    ],
    summary: "EIP-712 definiuje, jak hashować i podpisywać obiekt strukturalny, żeby portfel mógł pokazać nazwane pola, a [[smart-contract|smart kontrakt]] mógł przeliczyć ten sam digest. Podpis zostaje w ten sposób związany z jednym łańcuchem, jednym kontraktem i jednym kształtem wiadomości.",
    sections: [
      {
        heading: "Co naprawia",
        paragraphs: [
          "Podpisywanie ciągu hex każe użytkownikowi zatwierdzić coś, czego nie może przeczytać, a podpisywanie zwykłego tekstu nie daje kontraktowi niczego, co mógłby sparsować. EIP-712 to kompromis między nimi: aplikacja przekazuje dokument JSON z definicją typów, a portfel przed prośbą o zatwierdzenie wyświetla każde pole z jego nazwą i wartością. Ten sam dokument hashuje się deterministycznie, więc kontrakt może zweryfikować podpis dokładnie względem wartości, które widział użytkownik."
        ]
      },
      {
        heading: "Jak powstaje digest",
        paragraphs: [
          "Końcowy digest to `keccak256(0x19 0x01 || domainSeparator || hashStruct(message))`. Domain separator to również zahashowana struktura z polami `name`, `version`, `chainId` i `verifyingContract` oraz opcjonalnym `salt`. Ponieważ [[chain-id|chain ID]] i [[address|adres]] kontraktu są częścią digestu, podpisu złożonego dla jednego wdrożenia nie da się ponownie użyć wobec tego samego kontraktu na innym łańcuchu, a podpis dla jednego kontraktu jest bezużyteczny dla innego.",
          "`hashStruct` wartości to `keccak256(typeHash || encodeData(value))`, gdzie type hash to [[keccak-256|keccak256]] z kanonicznego stringa typu, takiego jak `Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)`. Pola o stałym rozmiarze koduje się jako 32 bajty każde; stringi i bajty zastępuje się ich hashami; zagnieżdżone struktury ich własnym `hashStruct`; tablice hashem połączonych kodowań. Typy struktur, do których są odwołania, dopisuje się w kolejności alfabetycznej i właśnie tę regułę najczęściej stosuje się źle, licząc type hash ręcznie."
        ]
      },
      {
        heading: "Przez RPC i on-chain",
        paragraphs: [
          "Metodą portfela jest `eth_signTypedData_v4` z parametrami `[address, typedData]`, przy czym większość portfeli oczekuje typed data jako stringa JSON, a nie obiektu. Dokument zawiera `types` (w tym wpis `EIP712Domain`), `primaryType`, `domain` i `message`. Każda [[client-libraries|biblioteka kliencka]] ma helper, który go buduje i zamienia na string; o tym, jak ma się to do `personal_sign`, mówią [[signing-methods|metody podpisywania]].",
          "Kanonicznym zastosowaniem jest `permit` z ERC-2612: zgoda na wydawanie tokenów (approval) podpisana off-chain i wysłana przez kogoś innego, co oszczędza użytkownikowi jednej [[transaction|transakcji]] i pozwala [[transaction-relayer|relayerowi]] zapłacić za [[gas|gas]]. Ten sam wzorzec stoi za podpisywaniem zleceń na giełdach i [[eip-3009|metatransakcjami]]. On-chain kontrakt przelicza digest i wywołuje `ecrecover`, więc każda niezgodność w domenie, stringu typu albo kolejności pól daje inny [[address|adres]] i nieudane sprawdzenie zamiast pomocnego błędu."
        ]
      }
    ],
    example: {
      title: "Permit jako typed data",
      note: "Cały ten dokument to drugi parametr `eth_signTypedData_v4`, zwykle przekazywany jako string JSON."
    },
    pitfalls: [
      "Budowanie domeny z chain ID zakodowanym na sztywno; gdy użytkownik zmieni sieć, podpis nie przejdzie weryfikacji nigdzie.",
      "Pomijanie wpisu `EIP712Domain` w `types`; część portfeli to toleruje, a inne od razu odrzucają.",
      "Przekazywanie typed data jako obiektu, gdy portfel oczekuje stringa JSON; kończy się to mało pomocnym błędem parametru.",
      "Zmiana kolejności pól między frontendem a stringiem typu w kontrakcie; type hash się zmienia, a odzyskiwanie adresu po cichu zwraca zły adres."
    ]
  },
  "client-libraries": {
    title: "Biblioteki klienckie",
    aliases: ["viem", "ethers.js", "web3.js", "web3.py", "alloy", "Nethereum", "ethclient", "wagmi", "client libraries", "biblioteki web3"],
    summary: "Biblioteka kliencka opakowuje [[json-rpc|JSON-RPC]] w idiomy danego języka: koduje i dekoduje dane [[abi|ABI]], zarządza transportem i ponowieniami (retry), uzupełnia domyślne wartości opłat i [[gas|gasu]], a ciągi hex zamienia na natywne liczby i typowane obiekty.",
    sections: [
      {
        heading: "Co dodają ponad surowe RPC",
        paragraphs: [
          "Głównie cztery rzeczy. Obsługę ABI: zamianę `balanceOf(address)` i argumentu na calldata dla [[eth-call|eth_call]], dekodowanie 32-bajtowej odpowiedzi i parsowanie [[event-log|logów]] do nazwanych pól. Transport: pule połączeń, [[batch-request|batchowanie]], [[retries|ponowienia]] i failover między endpointami. Konwersję typów: [[hex-encoding|hex QUANTITY]] na `BigInt` albo `decimal`, [[address|adresy]] z sumą kontrolną (checksum), funkcje pomocnicze do [[wei|wei i gwei]]. I obsługę całego procesu: zbudowanie [[transaction|transakcji]] z nonce i opłatami [[eip-1559|EIP-1559]], podpisanie jej i czekanie na [[transaction-receipt|receipt]] z określoną liczbą potwierdzeń."
        ]
      },
      {
        heading: "Opcje w JavaScripcie",
        paragraphs: [
          "viem to obecnie domyślny wybór dla nowego kodu w TypeScripcie: jest mały, obsługuje tree-shaking, jasno pokazuje, która akcja woła którą metodę, a typy wyprowadza z ABI, więc literówka w nazwie funkcji to błąd kompilacji. Rozdziela odczyty i podpisywanie na dwa obiekty, public client i wallet client, a wagmi buduje na viem hooki Reacta. ethers.js to sprawdzona od lat alternatywa, zorganizowana wokół obiektów `Provider`, `Signer` i `Contract`, z większym API i łagodniejszą krzywą uczenia się. web3.js jest najstarszą z tych trzech bibliotek i nie jest już zalecanym punktem startu; nowe projekty zwykle wybierają jedną z dwóch pozostałych."
        ]
      },
      {
        heading: "Inne języki",
        paragraphs: [
          "web3.py to standard w Pythonie, ze stosem middleware, w który można wpiąć cache'owanie albo logikę ponowień, i z obiektem kontraktu budowanym z ABI. alloy to obecna biblioteka dla Rusta, wywodząca się z ethers-rs, w której makro `sol!` generuje typy prosto z sygnatury Solidity albo pliku ABI. Nethereum obsługuje .NET i generuje z ABI typowane klasy kontraktów; z niego zwykle korzystają narzędzia z otoczenia [[nethermind|Nethermind]]. go-ethereum udostępnia `ethclient`, cienki wrapper, który obsługuje RPC, używając własnych typów klienta, a do bindingów kontraktów służy mu `abigen`. Jest na tyle cienki, że często najlepiej przez niego widać, co metoda naprawdę zwraca."
        ]
      },
      {
        heading: "Co ukrywają",
        paragraphs: [
          "Niespodzianki kryją się w wartościach domyślnych. Większość bibliotek czyta w `latest`, jeśli nie dostanie innej instrukcji, więc dwa odczyty w jednej funkcji mogą trafić na różne [[block-tag|bloki]]. Wiele z nich automatycznie ponawia żądania, co jest nieszkodliwe dla odczytów, ale oznacza, że „nieudane” [[eth-send-raw-transaction|eth_sendRawTransaction]] mogło mimo to trafić do bloku. Niektóre mnożą wynik [[eth-estimate-gas|eth_estimateGas]] przez współczynnik, niektóre po cichu łączą żądania w batche, a normalizacja błędów potrafi zamienić [[revert|revert]] z użytecznym `data` w ogólny wyjątek.",
          "Nic z tego nie jest błędem, ale oznacza, że zachowanie biblioteki nie świadczy o zachowaniu węzła. Kiedy odpowiedź wygląda na niemożliwą, zanim obwini się węzeł, trzeba ją odtworzyć przez [[cli-tools|curl albo cast]] na tym samym endpoincie i w tym samym bloku; surowa odpowiedź rozstrzyga spór jednym wywołaniem."
        ]
      }
    ],
    example: {
      title: "Ten sam odczyt w trzech bibliotekach",
      note: "Obie biblioteki wysyłają jedno wywołanie `eth_call`; to jawnie podany blok sprawia, że wynik da się odtworzyć."
    },
    pitfalls: [
      "Pozwalanie, by każdy odczyt domyślnie szedł do `latest`, i późniejsze porównywanie wyników; gdy dwie wartości muszą pochodzić z tego samego snapshotu, trzeba przypiąć numer bloku.",
      "Ufanie tekstowi błędu z biblioteki zamiast błędowi JSON-RPC; `data` revertu po drodze w górę często znika albo zmienia kształt.",
      "Zakładanie, że wyjątek przy wysyłce oznacza, że nic nie zostało rozgłoszone; automatyczne ponowienia i zgubione odpowiedzi zostawiają w obiegu ważną transakcję, więc trzeba ją wyszukać po hashu.",
      "Debugowanie zachowania biblioteki przez czytanie jej kodu źródłowego, kiedy jeden surowy `curl` na tym samym endpoincie pokazałby, co zwrócił węzeł."
    ]
  },
  multicall: {
    title: "Multicall",
    aliases: [
      "Multicall3",
      "aggregate3",
      "batch reads",
      "odczyty zbiorcze",
      "0xcA11bde05977b3631167028862bE2a173976CA11"
    ],
    summary: "Multicall to [[smart-contract|smart kontrakt]], który wykonuje tablicę wywołań wewnątrz jednego [[eth-call|eth_call]], więc wiele odczytów wraca jako jeden spójny snapshot z jednego [[block|bloku]], a nie jako wiele osobnych żądań.",
    sections: [
      {
        heading: "Jedno żądanie, wiele odczytów",
        paragraphs: [
          "Wywołujący koduje każde podwywołanie w [[abi|ABI]], pakuje je w tablicę par `(target, callData)` i wysyła jedno `eth_call` do kontraktu multicall. Kontrakt iteruje po tablicy, przekazuje dalej każdy payload, zbiera zwrócone dane i oddaje je jako tablicę, którą wywołujący dekoduje osobno dla każdego podwywołania. Wszystko działa w jednym wykonaniu [[evm|EVM]] na jednym stanie i to jest najważniejsza właściwość: trzydzieści sald tokenów odczytanych w ten sposób należy do tego samego bloku i head nie ma szans przesunąć się między nimi.",
          "Multicall3 to wdrożenie, które stało się standardem de facto: działa pod `0xcA11bde05977b3631167028862bE2a173976CA11` na Ethereum, a dzięki deterministycznemu wdrożeniu pod tym samym [[address|adresem]] na większości L2 i testnetów. Dlatego można go bezpiecznie hardkodować na wielu łańcuchach i dlatego [[client-libraries|biblioteki klienckie]] potrafią zamieniać zwykłe odczyty z kontraktów na wywołania zagregowane bez żadnej konfiguracji z twojej strony."
        ]
      },
      {
        heading: "aggregate3 i pokrewne metody",
        paragraphs: [
          "Właściwa metoda to `aggregate3`, która przyjmuje `(address target, bool allowFailure, bytes callData)[]` i zwraca `(bool success, bytes returnData)[]`. Jej przewagą jest flaga `allowFailure` ustawiana osobno dla każdego wywołania. W starszym `aggregate` jeden [[revert|revert]] niszczy cały batch, a w `tryAggregate` flaga dotyczy wszystkich wywołań naraz. `aggregate3Value` dodaje do każdego wywołania `value` w ETH na rzadki przypadek batchowania zapisów. Kontrakt udostępnia też drobne funkcje pomocnicze, `getBlockNumber`, `getCurrentBlockTimestamp`, `getEthBalance` i `getBasefee`, dzięki którym batch może nieść własny dowód tego, na którym bloku się wykonał."
        ]
      },
      {
        heading: "Porównanie z batchem JSON-RPC",
        paragraphs: [
          "[[batch-request|Batch JSON-RPC]] to N żądań w jednym round tripie HTTP: N osobnych wykonań, z których każde niezależnie ustala, który blok to `latest`, każde liczy się do [[rate-limits|rate limitów]] i każde ma własny błąd. Multicall to jedno żądanie, jedno wykonanie, jeden blok, jeden wspólny budżet [[gas|gasu]] i jedno miejsce, w którym może pojawić się błąd. Batch warto stosować, gdy wywołania dotyczą różnych metod, na przykład bloku i [[transaction-receipt|receiptu]]; multicall, gdy to same odczyty na jednym bloku.",
          "Ograniczenia wynikają z tego wspólnego budżetu. Każde podwywołanie korzysta z limitu gasu, jaki węzeł nakłada na `eth_call` (gas cap), więc kilkaset tanich odczytów przejdzie, a batch ciężkich funkcji view w ten limit uderzy; wtedy trzeba go podzielić i ponowić. Obowiązują też limity rozmiaru odpowiedzi. A ponieważ wywołującym jest kontrakt, `msg.sender` w każdym podwywołaniu to adres multicalla, co po cichu psuje każdą funkcję, która go odczytuje."
        ]
      }
    ],
    example: {
      title: "Dwa salda w jednym eth_call",
      note: "To przypięcie numeru bloku zamiast przekazania `latest` sprawia, że przy ponowieniu da się odtworzyć ten sam snapshot."
    },
    pitfalls: [
      "Zostawienie `allowFailure` na false i utrata całego batcha, bo jeden adres okazał się nie być kontraktem.",
      "Powiększanie batcha, aż przekroczy limit gasu węzła dla `eth_call`, co objawia się nieczytelnym błędem out of gas, a nie błędem rozmiaru.",
      "Batchowanie wywołań, które czytają `msg.sender`; wewnątrz multicalla nadawcą jest kontrakt multicall, a nie twoje konto.",
      "Traktowanie pustego `returnData` jako wartości zero; zwykle oznacza ono, że pod adresem docelowym nie było kodu albo wywołanie zrobiło revert bez podania powodu."
    ]
  },
  ens: {
    title: "Rozwiązywanie nazw ENS",
    aliases: ["ENS", "namehash", "resolver", "reverse record", "rekord odwrotny", "vitalik.eth", "ENS resolution"],
    summary: "Rozwiązywanie nazw ENS zamienia nazwę taką jak `vitalik.eth` na [[address|adres]] albo inny rekord: nazwę się hashuje, pyta [[smart-contract|smart kontrakt]] rejestru, który resolver jest do niej przypisany, i odczytuje rekord z tego resolvera. Wszystko to odbywa się przez zwykłe żądania [[eth-call|eth_call]].",
    sections: [
      {
        heading: "Model danych",
        paragraphs: [
          "Każdą nazwę identyfikuje jej namehash, rekurencyjny [[keccak-256|keccak256]] zdefiniowany w EIP-137: zaczyna się od 32 zerowych bajtów i dla każdej etykiety, idąc od prawej, hashuje poprzedni wynik razem z hashem tej etykiety. Wynikiem jest identyfikator `bytes32`, który ENS nazywa node. Rejestr ENS pod `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e` mapuje każdy node na właściciela, adres resolvera i TTL i nie przechowuje niczego więcej. Rekordy żyją w kontrakcie resolvera i dlatego różne nazwy mogą zachowywać się zupełnie inaczej.",
          "Resolvery implementują dowolnie wybrane typy rekordów: `addr(bytes32)` dla klasycznego adresu, `text(bytes32,string)` dla metadanych klucz–wartość, takich jak awatar albo URL, oraz `contenthash` dla strony. Przed hashowaniem nazwy trzeba znormalizować zgodnie z ENSIP-15, bo inaczej dwa wizualnie identyczne ciągi dadzą dwa różne node'y."
        ]
      },
      {
        heading: "Rozwiązywanie proste i odwrotne przez RPC",
        paragraphs: [
          "Rozwiązywanie proste (forward) to dwa odczyty: `eth_call` do `resolver(node)` w rejestrze, żeby znaleźć resolver, a potem `eth_call` do `addr(node)` w tym resolverze. Kontrakt Universal Resolver łączy oba kroki w jedno wywołanie i obsługuje nowsze rozwiązywanie wildcard oraz [[ccip-read|ścieżki off-chain]], i właśnie z niego korzystają [[client-libraries|biblioteki klienckie]] pod `getEnsAddress` albo `resolveName`. Rozwiązywanie odwrotne (reverse) idzie w drugą stronę: liczy się namehash `<address without 0x>.addr.reverse`, odczytuje `name(node)`, a potem rozwiązuje otrzymaną nazwę w przód i sprawdza, czy wskazuje z powrotem na ten sam adres. Pominięcie tego drugiego kroku pozwala każdemu ustawić rekord odwrotny, w którym podaje się za kogoś innego.",
          "Rejestr ENS działa na mainnecie Ethereum, więc rozwiązanie nazwy z L2 wymaga zapytania do mainnetu, a nie do lokalnego łańcucha; testnety, takie jak Sepolia, mają osobne, własne wdrożenie ENS. Nazwy też się zmieniają: rekordy są modyfikowalne, a rejestracje wygasają, więc wynik rozwiązania warto trzymać w cache przez minuty, a nie na zawsze."
        ]
      },
      {
        heading: "CCIP-Read dla nazw off-chain",
        paragraphs: [
          "Wiele systemów subdomen trzyma rekordy off-chain. [[ccip-read|EIP-3668]] określa, jak to działa: resolver celowo robi revert z błędem `OffchainLookup`, który podaje adresy URL gatewayów i callback, a klient pobiera dane z gatewaya i wywołuje ten callback z odpowiedzią, żeby kontrakt mógł ją zweryfikować. Dlatego zwykłe `eth_call` wysłane curlem wygląda jak nieudane wywołanie: [[revert|revert]] jest tu częścią protokołu, a nie błędem, i nazwę rozwiąże tylko klient, który implementuje ten przepływ."
        ]
      }
    ],
    pitfalls: [
      "Ufanie rekordowi odwrotnemu bez rozwiązania go z powrotem w przód do tego samego adresu; rekord odwrotny każdy deklaruje sam.",
      "Hashowanie surowej nazwy wpisanej przez użytkownika bez normalizacji ENSIP-15, co dla podobnie wyglądających znaków daje inny node.",
      "Rozwiązywanie nazw na łańcuchu, na którym akurat jest użytkownik; rejestr jest na mainnecie, więc dappy na L2 potrzebują do nazw endpointu mainnetu.",
      "Odczytywanie revertu `OffchainLookup` jako zepsutego resolvera; to EIP-3668 prosi klienta, żeby pobrał dane z gatewaya i wywołał callback."
    ]
  },
  "erc-4337": {
    title: "Abstrakcja kont (ERC-4337)",
    aliases: ["UserOperation", "bundler", "EntryPoint", "smart account", "eth_sendUserOperation", "ERC-7769", "account abstraction", "AA"],
    summary: "ERC-4337 dodaje abstrakcję kont (account abstraction) bez zmiany protokołu: użytkownicy podpisują UserOperation (operacje użytkownika) zamiast [[transaction|transakcji]], bundlery zbierają je w jedno wywołanie singletonowego [[smart-contract|smart kontraktu]] EntryPoint, a kontrakt konta decyduje, co jest prawidłowym podpisem.",
    sections: [
      {
        heading: "Elementy",
        paragraphs: [
          "UserOperation to struktura, a nie transakcja: określa kontrakt konta `sender`, nonce, `callData` do wykonania, kilka limitów gasu, pola opłat, opcjonalnego paymastera i `signature`, którego znaczenie zależy wyłącznie od konta. Użytkownicy wysyłają je do bundlera, który trzyma osobną pulę poza [[mempool|mempoolem]] węzła i co jakiś czas wysyła jedną zwykłą transakcję wywołującą `handleOps` na singletonie EntryPoint. EntryPoint iteruje po batchu, prosi każde konto o [[erc-7562|walidację]], potem wykonuje każde wywołanie i zwraca bundlerowi koszty z depozytu konta albo od [[paymaster|paymastera]].",
          "To pośrednictwo daje nowe możliwości: podpisy inne niż secp256k1, [[onchain-agents|klucze sesyjne]] (session keys), social recovery, limity wydatków i gas płacony w tokenach albo w całości sponsorowany przez paymastera. EntryPoint ma wersje, a jego [[address|adres]] zmienia się między wersjami, więc klient pyta bundler przez `eth_supportedEntryPoints`, zamiast hardkodować jeden adres."
        ]
      },
      {
        heading: "RPC bundlera",
        paragraphs: [
          "Bundlery udostępniają pięć metod, które wyglądają jak metody węzła, ale nimi nie są; według ERC-7769, roboczej specyfikacji RPC bundlerów, odpowiadają też na `eth_chainId` i, tylko w trybie testowym, na przestrzeń nazw `debug_bundler_`. `eth_sendUserOperation` przyjmuje operację i adres EntryPoint i zwraca `userOpHash`. `eth_estimateUserOperationGas` zwraca `preVerificationGas`, `verificationGasLimit` i `callGasLimit`, a gdy operacja wskazuje [[paymaster|paymastera]], także `paymasterVerificationGasLimit`; przyjmuje też [[state-override|state override]], tak jak `eth_call`. `eth_getUserOperationByHash` i `eth_getUserOperationReceipt` pobierają operację po włączeniu do bloku, przy czym druga z nich zwraca `success`, `actualGasCost` i [[transaction-receipt|receipt]] transakcji, w której operacja się znalazła. `eth_supportedEntryPoints` zwraca listę wersji obsługiwanych przez bundler.",
          "Żadna z tych metod nie istnieje w [[execution-client|kliencie wykonawczym]], więc wysłanie ich do zwykłego endpointu zwraca `-32601`. URL bundlera i URL RPC to różne endpointy, nawet jeśli [[rpc-provider|provider]] sprzedaje oba pod podobnie wyglądającymi nazwami hostów."
        ]
      },
      {
        heading: "Czym różni się od transakcji",
        paragraphs: [
          "`userOpHash` nie jest hashem transakcji. [[eth-get-transaction-receipt|eth_getTransactionReceipt]] wywołane z nim zawsze zwraca `null`; zamiast tego trzeba odpytywać `eth_getUserOperationReceipt`. Włączenie do bloku też nie oznacza sukcesu: transakcja bundla może się powieść, podczas gdy wewnętrzne wywołanie twojej operacji zrobiło revert, więc trzeba sprawdzać pole `success`, a nie `status` receiptu. Nonce pochodzą z EntryPoint jako dwuwymiarowa para klucza i sekwencji, więc [[eth-get-transaction-count|eth_getTransactionCount]] na koncie nie mówi nic użytecznego.",
          "EIP-7702, aktywne od Pectra, podchodzi do tego samego problemu z drugiej strony: istniejące konto EOA może delegować swój kod do kontraktu, a [[eth-get-code|eth_getCode]] zwraca wtedy 23-bajtowy designator `0xef0100`, po którym następuje adres tego kontraktu. Oba podejścia się uzupełniają, a ERC-4337 w statusie Final wymienia EIP-7702 wśród swoich wymagań: infrastruktura 4337 może obsługiwać EOA z delegacją, a [[eip-7702|transakcje set code]] dają zwykłym kontom batchowanie i sponsorowanie bez wdrażania nowego konta."
        ]
      }
    ],
    example: {
      title: "Wysyłanie UserOperation do bundlera",
      note: "Z tym hashem trzeba odpytywać `eth_getUserOperationReceipt`; `eth_getTransactionReceipt` będzie dla niego zwracać `null` w nieskończoność."
    },
    pitfalls: [
      "Odpytywanie `eth_getTransactionReceipt` z `userOpHash`, które zwraca `null` bez względu na to, jak długo się czeka.",
      "Odczytywanie `status` transakcji, w której znalazła się operacja, jako wyniku tej operacji; bundle może się powieść, nawet gdy wewnętrzne wywołanie zrobiło revert.",
      "Wysyłanie metod bundlera do zwykłego endpointu RPC, który odpowiada `-32601`, bo żaden klient wykonawczy ich nie implementuje.",
      "Wyprowadzanie kolejnego nonce z `eth_getTransactionCount`; nonce w 4337 to wartości złożone z klucza i sekwencji, przechowywane przez EntryPoint."
    ]
  },
  "local-devnet": {
    title: "Lokalne węzły deweloperskie",
    aliases: ["anvil", "hardhat network", "devnet", "forking", "fork mainnetu", "impersonation", "impersonacja", "31337"],
    summary: "Lokalny węzeł deweloperski to jednorazowy łańcuch na twojej maszynie, który udostępnia ten sam interfejs [[json-rpc|JSON-RPC]] co prawdziwy węzeł, a do tego metody do kopania bloków na żądanie, przepisywania [[state|stanu]], podszywania się pod konta (impersonacji) i forkowania mainnetu w wybranym [[block|bloku]].",
    sections: [
      {
        heading: "Anvil",
        paragraphs: [
          "Anvil jest częścią Foundry i startuje w mniej niż sekundę pod `http://127.0.0.1:8545`, z [[chain-id|chain ID]] `31337`, dziesięcioma zasilonymi kontami i natychmiastowym kopaniem bloków. `anvil --fork-url https://rpc.example --fork-block-number 21000000` zamienia go w lokalną kopię mainnetu na tej wysokości: sam nie trzyma stanu, tylko przy pierwszym dostępie pobiera [[account|konta]], kod i sloty storage z węzła upstream i trzyma je w cache. Od Foundry 1.8 czyta je według hasha bloku forka, więc upstream, który serwuje stan tylko według numeru bloku, wymaga flagi `--fork-state-by-number`, dodanej w 1.8.3. Tak [[fork-testing|odtwarza się nieudaną transakcję albo testuje na żywych kontraktach]], niczego nie wdrażając.",
          "Jego dodatkowe metody robią to, na co nie pozwala żaden prawdziwy węzeł. `anvil_impersonateAccount` pozwala wysyłać transakcje z [[address|adresu]], do którego nie ma się klucza, `anvil_setBalance`, `anvil_setCode` i `anvil_setStorageAt` przepisują stan bezpośrednio, `evm_mine` produkuje blok, gdy automining jest wyłączony, `evm_increaseTime` przesuwa zegar, a `evm_snapshot` razem z `evm_revert` dają punkt powrotu między przypadkami testowymi. Większość nazw `hardhat_` jest akceptowana jako aliasy."
        ]
      },
      {
        heading: "Symulowane sieci Hardhat",
        paragraphs: [
          "Hardhat pokrywa ten sam zakres od strony JavaScriptu symulowaną siecią, którą w Hardhat 3 deklaruje się jako `type: \"edr-simulated\"`, a w Hardhat 2 nazywano Hardhat Network. Działa w procesie podczas uruchamiania testów albo jako osobny serwer przez `npx hardhat node`, również z chain ID `31337`. Jej metody sterujące mają prefiks `hardhat_`: `hardhat_impersonateAccount`, `hardhat_setBalance` i `hardhat_mine` do taniego przewinięcia o wiele bloków, natomiast `hardhat_reset`, który robił ponowny fork od innego bloku w trakcie zestawu testów, w Hardhat 3 już nie istnieje. Obsługuje też `console.log` w Solidity, czego nie robi żaden prawdziwy [[execution-client|klient wykonawczy]]."
        ]
      },
      {
        heading: "Kiedy potrzebna jest prawdziwa sieć",
        paragraphs: [
          "Żadne z tych narzędzi nie uruchamia konsensusu, więc żadnym nie da się przetestować niczego, co dotyczy [[engine-api|Engine API]], [[finality|finalności]], [[block-tag|tagów bloków]] `safe` i `finalized` ani współpracy między klientami. Tę lukę wypełnia `ethereum-package` dla [[kurtosis|Kurtosis]]: uruchamia w kontenerach pełny devnet z prawdziwymi [[execution-client|klientami wykonawczymi]] i [[consensus-client|klientami konsensusu]] połączonymi w pary jak na produkcji, czyli [[geth|Geth]], [[nethermind|Nethermind]], [[reth|Reth]], [[besu|Besu]] albo [[erigon|Erigon]] z [[lighthouse|Lighthouse]], [[teku|Teku]], [[prysm|Prysm]], [[nimbus|Nimbus]] albo [[lodestar|Lodestar]], z wygenerowanego genesis i z wybranymi czasami forków. To standardowy sposób na przećwiczenie [[hardfork|aktualizacji sieci]], zanim trafi ona na testnet.",
          "Trzeba pamiętać o różnicy między devnetem a produkcją. Natychmiastowe kopanie ukrywa każdy wyścig, który ujawniłby 12-sekundowy blok, nie ma konkurencyjnego [[mempool|mempoolu]] ani [[reorg|reorgów]], [[gas|gas]] jest praktycznie darmowy, a [[eth-send-transaction|eth_sendTransaction]] działa, bo węzeł trzyma klucze, i właśnie tego odmówi publiczny endpoint."
        ]
      }
    ],
    example: {
      title: "Fork mainnetu, impersonacja wieloryba, wykopanie bloku",
      note: "Każda z tych metod zostałaby odrzucona przez produkcyjny endpoint; na tym polega devnet i właśnie dlatego kod aplikacji nie może od nich zależeć."
    },
    pitfalls: [
      "Forkowanie bez `--fork-block-number`; wyniki dryfują razem z headem upstreamu, a cache missy zasypują żądaniami archiwalny endpoint, z którego robisz fork.",
      "Pisanie kodu aplikacji wokół `eth_sendTransaction` i odblokowanych kont, bo devnet na to pozwala; prawdziwy provider nie pozwoli.",
      "Liczenie na to, że zestaw testów, który zawsze działał tylko z natychmiastowym kopaniem, wyłapie wyścigi nonce i kolejności.",
      "Zakładanie, że `safe` i `finalized` coś znaczą w Anvil albo w symulowanej sieci Hardhat; żadne z tych narzędzi nie uruchamia konsensusu."
    ]
  },
  "cli-tools": {
    title: "Narzędzia RPC z wiersza poleceń",
    aliases: ["curl", "cast", "foundry", "geth attach", "websocat", "jq", "cli", "wiersz poleceń", "terminal"],
    summary: "Narzędzia wiersza poleceń pozwalają wysyłać wywołania [[json-rpc|JSON-RPC]] bezpośrednio i czytać surową odpowiedź. To najszybszy sposób, żeby sprawdzić, co endpoint naprawdę obsługuje i co węzeł faktycznie zwrócił.",
    sections: [
      {
        heading: "curl jako źródło prawdy",
        paragraphs: [
          "Każda metoda to jeden HTTP POST z body w JSON-ie, więc `curl -s -X POST -H 'content-type: application/json' --data '{…}' https://rpc.example` dotrze do każdego endpointu. Przepuszczenie wyniku przez `jq` sprawia, że odpowiedź da się czytać, i pozwala wyciągnąć jedno pole z dużego obiektu [[block|bloku]]. Ponieważ między terminalem a węzłem nic nie stoi, wynik rozstrzyga spory, których nie rozstrzygnie zachowanie biblioteki: czy metoda istnieje, co naprawdę mówił obiekt [[rpc-errors|błędu]] i jaka [[hex-encoding|wartość hex]] przyszła, zanim cokolwiek ją zdekodowało.",
          "Ta sama jednolinijkowa komenda służy do badania [[endpoint-capabilities|możliwości endpointu]]. `web3_clientVersion` mówi, który [[execution-client|klient]] stoi za adresem URL, `eth_chainId` potwierdza [[chain-id|łańcuch]], metoda `debug_` albo `trace_` pokazuje, czy tracing jest włączony, a zapytanie o stan starego bloku pokazuje, jak daleko wstecz sięga endpoint."
        ]
      },
      {
        heading: "cast do operacji z typami",
        paragraphs: [
          "`cast` z Foundry zna struktury danych Ethereum, więc oszczędza ręcznego kodowania. `cast call <address> \"balanceOf(address)(uint256)\" <holder> --rpc-url <url>` buduje calldata zgodne z [[abi|ABI]], wywołuje [[eth-call|eth_call]] i wypisuje wynik dziesiętnie. `cast block latest`, `cast receipt <hash>` i `cast storage <address> <slot>` pokrywają typowe odczyty, `cast send` podpisuje i wysyła transakcję, a `cast run <txhash>` odtwarza transakcję i wypisuje jej [[execution-trace|trace]]. `cast rpc <method> [params…]` to furtka, która przepuszcza wszystko bez zmian; tak wywołuje się metodę specyficzną dla klienta, która nie ma własnej podkomendy."
        ]
      },
      {
        heading: "Konsole i sockety",
        paragraphs: [
          "`geth attach` z [[geth|Geth]] otwiera konsolę JavaScript podłączoną do adresu HTTP albo lokalnego [[ipc-transport|socketu IPC]], co jest wygodne przy wywołaniach `admin_` i `txpool_` na własnym węźle; przez IPC te [[namespaces|przestrzenie nazw]] są zwykle dostępne, nawet gdy interfejs HTTP je ukrywa. Do pracy z [[websocket-transport|WebSocketem]] służy `websocat`, który trzyma otwarte połączenie, więc można wysłać ramkę [[eth-subscribe|eth_subscribe]] i obserwować napływające `newHeads`, czego HTTP nie potrafi.",
          "Warto wyrobić sobie jeden nawyk: gdy coś zachowuje się dziwnie przez [[client-libraries|bibliotekę]], przed zgłoszeniem błędu trzeba to odtworzyć surowym żądaniem do tego samego endpointu i na tym samym bloku. W połowie przypadków odpowiedź węzła jest poprawna, a zawiodły domyślne ustawienia biblioteki, i to właśnie surowe żądanie sprawia, że widać to od razu."
        ]
      }
    ],
    example: {
      title: "Ten sam odczyt na trzy sposoby",
      note: "`cast rpc` wysyła metodę dosłownie, więc tak sprawdza się dostępność `trace_`, `debug_` albo przestrzeni nazw specyficznej dla danego łańcucha."
    },
    pitfalls: [
      "Pomijanie nagłówka HTTP `content-type: application/json`; niektóre endpointy i proxy odrzucają żądanie, zanim węzeł w ogóle je zobaczy.",
      "Traktowanie HTTP `200 OK` jako sukcesu; obiekt błędu JSON-RPC zwykle przychodzi właśnie w udanej odpowiedzi HTTP.",
      "Walka z cudzysłowami w shellu przez zagnieżdżanie podwójnych cudzysłowów w `--data`; lepiej ująć całe body w apostrofy.",
      "Porównywanie wyniku `cast` z wynikiem biblioteki bez pamiętania, że `cast` zastosował własne ustawienia domyślne, na przykład najnowszy blok."
    ]
  },
  "token-standards": {
    title: "Standardy tokenów przez RPC",
    aliases: ["ERC-20", "ERC-721", "ERC-1155", "balanceOf", "0x70a08231", "Transfer event", "event Transfer", "NFT", "tokeny"],
    summary: "Tokeny to zwykłe [[smart-contract|kontrakty]], więc saldo to [[eth-call|eth_call]] do `balanceOf`, a historia transferów to zapytanie [[eth-get-logs|eth_getLogs]] o [[event-log|eventy]] `Transfer`. W API [[json-rpc|JSON-RPC]] nie ma żadnej metody, która rozumie tokeny.",
    sections: [
      {
        heading: "Salda to wywołania kontraktu",
        paragraphs: [
          "Saldo ERC-20 to `eth_call` z `to` ustawionym na token i `data` ustawionym na selektor `0x70a08231`, czyli pierwsze cztery bajty [[keccak-256|keccak256]] z `balanceOf(address)`, a po nim [[address|adres]] posiadacza dopełniony z lewej do 32 bajtów. Wynik to jedno 32-bajtowe słowo, które czyta się jako liczbę całkowitą bez znaku. Odczyty metadanych mają ten sam kształt: `decimals()` to `0x313ce567`, `symbol()` to `0x95d89b41`, a `totalSupply()` to `0x18160ddd`. Ponieważ to zwykłe wywołania, przyjmują parametr bloku, więc na węźle, który wciąż ma ten [[state|stan]], do historycznego salda wystarczy podać [[block-tag|identyfikator bloku]].",
          "ERC-721 zachowuje `balanceOf(address)` jako liczbę tokenów i dodaje `ownerOf(uint256)` oraz `tokenURI(uint256)`; ERC-1155 używa `balanceOf(address,uint256)` dla każdego identyfikatora tokena. Jeśli standard przewiduje [[erc-165|ERC-165]], to, jaki interfejs implementuje kontrakt, można wykryć przez jego `supportsInterface(bytes4)`, selektor `0x01ffc9a7`. ERC-20 nigdy go nie wymagał, a kontrakty bez niego odpowiadają nieprzewidywalnie: robią revert, zwracają `0x` albo zwracają niezerowe słowo z fallbacku typu catch-all, i dlatego ERC-165 każe najpierw sprawdzić `0x01ffc9a7` i `0xffffffff`, zanim zaufa się jakiejkolwiek odpowiedzi."
        ]
      },
      {
        heading: "Historia pochodzi z logów",
        paragraphs: [
          "Każdy standard emituje `Transfer(address,address,uint256)`, którego topic0 to `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`. Filtruje się z `address` ustawionym na token i z `topics[1]` albo `topics[2]` ustawionym na dopełniony adres, odpowiednio dla transferów wysłanych i otrzymanych. Haczyk polega na tym, że ERC-20 i ERC-721 mają ten sam topic0, ale nie ten sam kształt logu: ERC-20 indeksuje tylko dwa adresy, a kwotę umieszcza w `data`, natomiast ERC-721 indeksuje także identyfikator tokena, więc jego logi mają cztery topics i puste `data`. Po liczbie topics można je rozróżnić. ERC-1155 emituje zamiast tego `TransferSingle` i `TransferBatch`."
        ]
      },
      {
        heading: "Dlaczego portfolio jest trudne",
        paragraphs: [
          "Nic w łańcuchu nie przechowuje listy tokenów, które ma [[account|konto]]. Jedyne uczciwe odpowiedzi to przeskanować we wszystkich blokach każdy log `Transfer`, który wspomina adres, co jest kosztowne i ograniczone przez [[rate-limits|limity zakresu]] u providera, albo utrzymywać [[indexer|indekser]], który zrobi to raz, a potem na bieżąco aktualizuje tabelę. Hostowani providerzy sprzedają dokładnie to jako [[portfolio-tracker|rozszerzone API]] (enhanced API), co jest wygodne, ale nie jest częścią żadnego standardu.",
          "Historię można wyprowadzać z logów, ale salda nigdy. Tokeny z rebasingiem zmieniają salda bez żadnego eventu, tokeny typu reflection, takie jak RFI, pobierają opłatę od każdego transferu i rozdzielają ją na salda wszystkich posiadaczy, niczego przy tym nie logując, a niektóre kontrakty mintują albo palą tokeny bez emitowania eventów. Kod z opłatą od transferu (fee-on-transfer), taki jak w USDT, dopisuje odbiorcy mniej, niż wysłał nadawca, ale loguje tę kwotę netto i opłatę jako osobne eventy `Transfer`. Jedyną wiarygodną liczbą jest `balanceOf` w konkretnym bloku, więc warto użyć [[multicall|multicalla]], żeby odczytać wiele takich sald w jednym spójnym snapshocie."
        ]
      }
    ],
    example: {
      title: "Odczyt salda i zapytanie o historię transferów",
      note: "`null` na liście topics oznacza „dowolny nadawca”; liczy się pozycja, więc topic1 to `from`, a topic2 to `to`."
    },
    pitfalls: [
      "Zakładanie 18 miejsc dziesiętnych (decimals); `decimals()` trzeba odczytać dla każdego tokena, bo USDC używa 6, a kilka tokenów jeszcze innych wartości.",
      "Sumowanie kwot z `Transfer`, żeby wyliczyć saldo; tokeny z rebasingiem i tokeny typu reflection psują sumę, więc trzeba wywołać `balanceOf`.",
      "Traktowanie każdego logu `Transfer` z tym topic0 jako ERC-20; cztery topics i puste `data` oznaczają, że to identyfikator tokena ERC-721.",
      "Wywoływanie `symbol()` bez obsługi starych tokenów, które zwracają `bytes32` zamiast stringa, co dekoduje się jako śmieci albo rzuca wyjątek."
    ]
  },
  "dapp-architecture": {
    title: "Architektura dappa",
    aliases: [
      "frontend",
      "read path",
      "ścieżka odczytu",
      "write path",
      "ścieżka zapisu",
      "provider key",
      "klucz API providera",
      "wallet vs rpc",
      "web3 stack"
    ],
    summary: "Dapp ma dwie odrębne ścieżki RPC: odczyty idą z twojej aplikacji do wybranego przez ciebie endpointu, a zapisy przechodzą przez portfel użytkownika do endpointu, który wybiera portfel. Wszystko, na co łańcuch nie odpowie bezpośrednio, obsługuje [[indexer|indekser]].",
    sections: [
      {
        heading: "Dwie ścieżki, dwa endpointy",
        paragraphs: [
          "Odczyty są pod twoją kontrolą. Frontend albo backend rozmawia z [[rpc-provider|providerem RPC]] albo z własnym węzłem, wybiera [[block-tag|tag bloku]] i obsługuje [[retries|ponowienia]] i [[rate-limits|limity]]. Zapisy już nie: [[eip-1193|wstrzyknięty provider]] (injected provider) przekazuje podpisywanie portfelowi, a portfel [[transaction-simulation|symuluje]], estymuje i rozgłasza transakcję przez własny endpoint. Te dwa endpointy rzadko są na tym samym headzie, więc transakcja, którą portfel już przyjął, może być niewidoczna dla twojego następnego odczytu; zobacz [[head-lag|spójność heada]].",
          "Wszystko, co jest zapytaniem, a nie prostym odczytem, należy do trzeciej ścieżki. „Wszystkie transfery tego użytkownika”, „najwięksi posiadacze”, „wykres z sześciu miesięcy” to nie są pytania do RPC, tylko skany [[eth-get-logs|logów]], których żadna przeglądarka nie powinna próbować, a większość endpointów i tak ich odmówi. To praca dla indeksera, [[the-graph|subgraphu]] albo backendu, który prowadzi własną tabelę."
        ]
      },
      {
        heading: "Gdzie leży każdy element",
        paragraphs: [
          "Źródłem prawdy są kontrakty. Frontend trzyma połączenie z portfelem, [[abi|ABI]] i klienta do odczytów. Backend albo indekser trzyma historię, agregaty i wszystko, co wymaga klucza API, bo klucz wysłany w JavaScripcie przeglądarki jest kluczem publicznym: każdy może go odczytać w zakładce Network i zużyć twój limit. Providera warto schować za małym proxy, które przepuszcza tylko używane metody, a ścieżkę zapisu zostawić bezpośrednio między portfelem a łańcuchem, gdzie nie pojawia się żaden twój sekret."
        ]
      },
      {
        heading: "Ścieżka zapisu od początku do końca",
        paragraphs: [
          "Połączenie nawiązuje się przez `eth_requestAccounts`, potem sprawdza `eth_chainId` i w razie potrzeby wywołuje [[wallet-rpc|wallet_switchEthereumChain]]. Wywołanie koduje się według ABI i symuluje przez [[eth-call|eth_call]], żeby [[revert|revert]] wyszedł na jaw razem z powodem, zanim użytkownik zostanie o cokolwiek poproszony, a dopiero potem portfel estymuje gas i prosi o zatwierdzenie. Kiedy zwróci hash, trzeba odpytywać [[eth-get-transaction-receipt|eth_getTransactionReceipt]] na własnym endpoincie, aż wynik przestanie być null, i dopiero wtedy czekać na [[confirmations|potwierdzenia]] albo tag `finalized`, zależnie od tego, czego wymaga twój model ryzyka.",
          "Awarie skupiają się na styku elementów. Użytkownik zmienia łańcuch w trakcie procesu i adresy kontraktów przestają pasować. Twój endpoint jest w tyle za endpointem portfela i receipt przez kilka sekund zwraca `null`. Biblioteka przerabia powód revertu na coś nie do rozpoznania. Indekser jest cztery bloki za headem i nowa pozycja się nie pojawia. Na każdy z tych problemów jest konkretna odpowiedź: po każdym `chainChanged` odczytać [[chain-id|chain ID]] na nowo, odpytywać ten sam endpoint, logować surowy [[rpc-errors|obiekt błędu]] i pokazywać status pending na podstawie receiptu, dopóki indekser nie nadrobi zaległości."
        ]
      }
    ],
    example: {
      title: "Ścieżka zapisu z osobną ścieżką odczytu",
      note: "Węzeł, który rozgłosił transakcję, został wybrany przez portfel, a węzeł, który ją potwierdza, przez twój klient do odczytów; dlatego pierwsze odpytania mogą zwrócić `null`."
    },
    pitfalls: [
      "Umieszczanie klucza API providera w JavaScripcie frontendu; widać go w zakładce Network, więc trzeba go schować za własnym endpointem proxy.",
      "Uruchamianie historycznych skanów `eth_getLogs` z przeglądarki; to praca dla indeksera, a providerzy i tak ograniczają zakresy.",
      "Zakładanie, że portfel i twój endpoint do odczytów są na tym samym bloku, a potem traktowanie receiptu `null` jako nieudanej wysyłki.",
      "Pominięcie symulacji `eth_call` przed prośbą o zatwierdzenie, przez co użytkownik zatwierdza transakcję, która od początku musiała skończyć się revertem."
    ]
  },
  "erc-165": {
    title: "ERC-165: wykrywanie interfejsów",
    aliases: [
      "supportsInterface",
      "EIP-165",
      "0x01ffc9a7",
      "interface id",
      "identyfikator interfejsu",
      "interface detection",
      "ERC165Checker",
      "0xffffffff"
    ],
    summary: "ERC-165 to konwencja, w której [[smart-contract|smart kontrakt]] odpowiada na `supportsInterface(bytes4)` wartością `true` dla każdego interfejsu, który implementuje. Identyfikator interfejsu to XOR [[abi|selektorów]] jego funkcji, więc wywołujący może przez [[eth-call|eth_call]] zapytać, jakie interfejsy kontrakt deklaruje, zanim go wywoła.",
    sections: [
      {
        heading: "Identyfikatory interfejsów to XOR selektorów",
        paragraphs: [
          "Dla ERC-165 interfejs to po prostu zbiór selektorów funkcji, czyli pierwszych czterech bajtów [[keccak-256|keccak256]] z każdej sygnatury kanonicznej, a jego identyfikator to XOR ich wszystkich. Dziewięć funkcji ERC-721 daje `0x80ac58cd`, jego rozszerzenie metadanych z `name`, `symbol` i `tokenURI` daje `0x5b5e139f`, a ERC-1155 daje `0xd9b67a26`. Identyfikator interfejsu z jedną funkcją to po prostu selektor tej funkcji, dlatego `0x01ffc9a7` jest jednocześnie selektorem `supportsInterface(bytes4)` i identyfikatorem samego ERC-165, a interfejs wildcard [[ens|ENS]] `resolve(bytes,bytes)` to `0x9061b923`. Eventy, typy zwracane i funkcje opcjonalne nie wchodzą do identyfikatora.",
          "Zgodny kontrakt zwraca `true` dla `0x01ffc9a7`, `false` dla `0xffffffff`, `true` dla każdego identyfikatora, który implementuje, i `false` dla wszystkiego innego, zużywając przy tym co najwyżej 30 000 gasu. ERC-721 i ERC-1155 wymagają go obowiązkowo, przez niego wykrywa się [[nft-marketplace|royalties z ERC-2981]] (`0x2a55205a`) i aktualizacje metadanych z ERC-4906 (`0x49064906`), a resolvery ENS ogłaszają dzięki niemu obsługiwane typy rekordów. ERC-20 jest od niego starszy i nigdy go nie wymagał, więc milczenie tokena zamiennego (fungible) nic nie znaczy; zobacz [[token-standards|standardy tokenów]]."
        ]
      },
      {
        heading: "Procedura wykrywania",
        paragraphs: [
          "Samo zapytanie `supportsInterface(X)` nie wystarczy, bo odpowiedzieć może też kontrakt, który nigdy nie implementował ERC-165. ERC przewiduje najpierw dwie sondy: `STATICCALL` z 30 000 gasu i wejściem `0x01ffc9a701ffc9a7` z dopełnieniem musi zwrócić true, a to samo wywołanie z `0xffffffff` musi zwrócić false. Dopiero wtedy odpowiedź dla `X` cokolwiek znaczy. Druga sonda wyłapuje kontrakty, których fallback zwraca niezerowe słowo dla dowolnego wejścia, a `ERC165Checker` z OpenZeppelin wymaga ponadto co najmniej 32 bajtów danych zwrotnych, zanim odczyta `true`.",
          "Przez RPC każda sonda to eth_call, którego `data` to `0x01ffc9a7`, a po nim identyfikator wyrównany do lewej w 32-bajtowym słowie. Kontrakty bez ERC-165 odpowiadają na kilka sposobów i każdy z nich oznacza „nie”: USDC na mainnecie robi revert z pustymi danymi, fallback payable w WETH kończy się sukcesem i zwraca `0x`, a [[address|adres]] bez kodu też kończy się sukcesem z `0x`, bo wywołanie pustego konta nic nie robi. [[proxy-contract|Proxy]] odpowiada tym, co powiedziała jego implementacja w danym [[block-tag|bloku]], a konto z delegacją [[eip-7702|EIP-7702]] odpowiada kodem swojego delegata, więc adres, który podpisuje jak EOA, może zgłosić `true`."
        ]
      },
      {
        heading: "Batchowanie, gas i sondowanie przez wywołanie",
        paragraphs: [
          "Sondowanie wielu kontraktów to naturalne zadanie dla [[multicall|Multicall3]]: trzy wpisy `aggregate3` na kontrakt z ustawionym `allowFailure`, jedno eth_call, jeden blok. Dwa szczegóły różnią się od procedury on-chain. Multicall3 przekazuje każdemu podwywołaniu cały dostępny gas, więc limit 30 000 nie jest egzekwowany, a jeden kosztowny fallback może zjeść budżet batcha w ramach limitu gasu węzła. Do tego `gas` wywołania eth_call najwyższego poziomu obejmuje intrinsic gas transakcji, 21 000 plus calldata, więc `gas: 0x7530` zostawia na wykonanie mniej niż 9000, a implementacja, która potrzebuje od 9000 do 30 000, dostaje z [[geth|Geth]] `out of gas` tam, gdzie procedura on-chain by przeszła; żeby odwzorować budżet z ERC, trzeba podać około 51 000.",
          "Alternatywą jest sondowanie przez wywołanie: wywołuje się funkcję, której się oczekuje, na przykład `decimals()` albo `ownerOf(1)`, i sprawdza, czy wynik się dekoduje. To jedyna opcja dla ERC-20, ale dowodzi tylko tego, że jeden selektor trafił do jakiegoś kodu, co fallback albo kolizja selektorów potrafią podrobić. ERC-165 też nie dowodzi zachowania: `supportsInterface` zwraca to, co napisał autor kontraktu, więc mówi wywołującemu, czego spróbować, a jedynym dowodem zachowania pozostają same wywołania."
        ]
      }
    ],
    example: {
      title: "Trzy sondy przez eth_call",
      note: "Dopiero 32-bajtowe true z pierwszej sondy i 32-bajtowe false z drugiej nadają sens trzeciej odpowiedzi; revert, sukces z `0x` albo za krótkie słowo oznaczają, że kontrakt nie implementuje ERC-165."
    },
    pitfalls: [
      "Wywołanie samego `supportsInterface(0x80ac58cd)` i zaufanie wynikowi `true`, który fallback typu catch-all zwraca dla każdego wejścia; najpierw trzeba wykonać sondy `0x01ffc9a7` i `0xffffffff`.",
      "Traktowanie pustego wyniku `0x` jako błędu dekodowania, a nie jako odpowiedzi; sukces bez danych oznacza, że pod adresem nie ma kodu albo nie ma ERC-165.",
      "Używanie ERC-165 do ustalenia, czy kontrakt jest tokenem ERC-20; takie tokeny nigdy nie musiały go implementować, więc `false` albo revert niczego nie dowodzą.",
      "Przekazywanie `gas: 0x7530` do eth_call, żeby naśladować limit z ERC; po odjęciu intrinsic gasu zostaje mniej niż 9000, więc każda implementacja, która potrzebuje więcej, kończy się `out of gas`.",
      "Trzymanie odpowiedzi dla adresu w cache na zawsze; proxy przechodzą upgrade'y, a konta z delegacją zmieniają delegata, więc odpowiedź należy do konkretnego bloku."
    ]
  },
  "erc-1271": {
    title: "Podpisy kontraktów (ERC-1271)",
    aliases: [
      "erc-1271",
      "isValidSignature",
      "0x1626ba7e",
      "EIP-1271",
      "contract signature",
      "podpis kontraktu",
      "ERC-6492",
      "smart account signature",
      "podpis smart konta",
      "counterfactual signature"
    ],
    summary: "ERC-1271 pozwala [[account|kontu]] kontraktowemu poręczyć za podpis: weryfikujący wywołuje na koncie `isValidSignature(bytes32 hash, bytes signature)`, a konto zwraca magiczną wartość `0x1626ba7e`, jeśli podpis jest ważny według jego własnych reguł i bieżącego [[state|stanu]].",
    sections: [
      {
        heading: "Dlaczego ecrecover nie wystarcza",
        paragraphs: [
          "Dla konta EOA podpisujący wynika z samego podpisu: `ecrecover` nad digestem daje [[address|adres]], a zgodność rozstrzyga sprawę raz na zawsze; zobacz [[ecdsa-signature|podpisy]]. Konto będące [[smart-contract|kontraktem]] nie ma klucza prywatnego, więc z żadnego podpisu nie da się odzyskać jego adresu. Safe to kilka kluczy właścicieli i próg, konto [[erc-4337|ERC-4337]] może akceptować passkeye albo klucze sesyjne, a każde z nich może zmienić swoje reguły jedną transakcją. ERC-1271, standard o statusie Final, przenosi decyzję do konta: `isValidSignature` to funkcja `view`, która może czytać właścicieli, progi czy cokolwiek innego w storage, i odpowiada wartością `bytes4`.",
          "Magiczna wartość to selektor samej funkcji, `bytes4(keccak256('isValidSignature(bytes32,bytes)'))`, zwracany wyrównany do lewej w 32-bajtowym słowie, więc poprawna odpowiedź przez RPC to `0x1626ba7e`, a po nim 28 bajtów zerowych. Każdy inny wynik oznacza odrzucenie, a jego postać bywa różna: implementacja referencyjna zwraca `0xffffffff`, Safe robi revert, a adres bez kodu zwraca `0x`, bo wywołanie nic nie robi. Wczesna wersja robocza używała `isValidSignature(bytes,bytes)` z magiczną wartością `0x20c13b0b`, a fallback handler Safe v1.3.0 nadal odpowiada na obie wersje, dlatego stara wartość pojawia się w starszym kodzie."
        ]
      },
      {
        heading: "Weryfikacja przez eth_call",
        paragraphs: [
          "Weryfikacja off-chain to jedno [[eth-call|eth_call]] z `to` ustawionym na konto i `data` zawierającym zakodowane w [[abi|ABI]] hash i podpis. Hash to dowolny digest zdefiniowany przez aplikację, hash wiadomości EIP-191 albo digest [[eip-712|EIP-712]], ale to konto decyduje, co jego właściciele faktycznie podpisali. Safe przed sprawdzeniem właścicieli opakowuje hash w strukturę typed data `SafeMessage` pod własną domeną Safe, więc podpis właściciela nad surowym digestem nie przechodzi; portfele obsługujące Safe tworzą opakowany podpis, a weryfikujący nie musi o tym wiedzieć. To właśnie [[signing-methods|metody podpisywania]] nazywają gałęzią dla kont kontraktowych.",
          "Ponieważ odpowiedź zależy od stanu, jest prawdziwa tylko w danym [[block-tag|bloku]]. Właściciele się zmieniają, progi też, klucze sesyjne wygasają, a te same bajty mogą przejść weryfikację w bloku N i nie przejść w N+1; ostrzega przed tym zarówno kod weryfikatora Circle, jak i OpenZeppelin. Gdy wynik jest dowodem, na przykład wpisem w rejestrze audytowym, trzeba przypiąć numer bloku, a gdy jest autoryzacją, na przykład przy sesji, sprawdzać go ponownie w `latest`. ERC-4361, czyli Sign-In with Ethereum, dodaje, że konto trzeba sprawdzać na [[chain-id|łańcuchu]] wskazanym w wiadomości, bo jeden adres counterfactual (konta jeszcze niewdrożonego) może istnieć na kilku łańcuchach z różnymi właścicielami. ERC nie ustala limitu gasu i ostrzega przed zakodowaniem go na sztywno, więc jedynym ograniczeniem jest limit gasu dla eth_call w węźle."
        ]
      },
      {
        heading: "Konta niewdrożone albo niebędące kontraktami",
        paragraphs: [
          "Konto counterfactual, czyli adres wyliczony z kontraktu factory i soli (salt), ale jeszcze niewdrożony, nie ma kodu, który można by wywołać. [[erc-6492|ERC-6492]], również Final, opakowuje podpis jako `abi.encode(factory, factoryCalldata, innerSignature)`, a po nim 32-bajtowy sufiks `0x6492…6492`. Weryfikujący, który widzi ten sufiks, wykonuje wywołanie factory, a potem `isValidSignature` w ramach jednego eth_call, co jest bezpieczne właśnie dlatego, że eth_call odrzuca zmiany stanu: referencyjny kontrakt `ValidateSigOffchain` wysyła się jako init code (bytecode tworzący kontrakt), bez `to`, a dla poprawnego podpisu zwraca `0x01`. Akcje `verifyMessage` i `verifyHash` w viem robią właśnie to, a awaryjnie używają ecrecover, natomiast samodzielne narzędzie `verifyMessage` z viem obsługuje tylko konta EOA.",
          "Konta EOA z delegacją [[eip-7702|EIP-7702]] są gdzieś pośrodku. Klucz nadal podpisuje, a ecrecover nadal odzyskuje adres, ale konto ma teraz kod, 23-bajtowy znacznik delegacji, a popularne weryfikatory rozgałęziają się według długości kodu: `SignatureChecker` z OpenZeppelin i FiatToken v2.2 od USDC wywołują `isValidSignature` zawsze, gdy podpisujący ma kod. To, czy zwykły podpis ECDSA wtedy przejdzie, zależy od delegata, który może akceptować własny klucz konta albo w ogóle nie implementować ERC-1271. Weryfikator, który najpierw próbuje ecrecover, a awaryjnie sięga po ERC-1271, akceptuje oba rodzaje podpisów, i ta sama logika decyduje o [[eip-3009|podpisanych transferach USDC]] z takich kont."
        ]
      }
    ],
    example: {
      title: "isValidSignature na Safe i różne postacie odmowy",
      note: "Hash to digest aplikacji; Safe przed sprawdzeniem właścicieli opakowuje go w `SafeMessage`, więc 65 bajtów to podpis właściciela nad opakowanym hashem, a nie nad `d9eb…7d68`."
    },
    pitfalls: [
      "Weryfikacja samym `ecrecover`, która odrzuca każdy Safe, każde konto ERC-4337 i część kont EOA z delegacją, choć ich podpisy są w pełni poprawne.",
      "Uznawanie każdej odpowiedzi bez revertu za ważną; liczy się tylko wynik, którego pierwsze cztery bajty to `0x1626ba7e`, a `0xffffffff`, `0x` czy śmieci oznaczają odmowę.",
      "Weryfikacja w `latest` na potrzeby rejestru audytowego, której potem nie da się odtworzyć; właściciele mogli się zmienić, więc razem z wynikiem trzeba zapisać numer bloku.",
      "Odrzucanie podpisu konta, które nie jest jeszcze wdrożone, zamiast sprawdzić sufiks ERC-6492 i zweryfikować podpis przez [[deployless-call|eth_call bez wdrażania (deployless)]].",
      "Kierowanie konta EOA z delegacją od razu do `isValidSignature`, bo ma kod; jeśli delegat nie implementuje ERC-1271, poprawny podpis ECDSA zostanie odrzucony."
    ]
  },
  "ccip-read": {
    title: "CCIP-Read (offchain lookup)",
    aliases: [
      "EIP-3668",
      "OffchainLookup",
      "0x556f1830",
      "offchain resolver",
      "resolver off-chain",
      "CCIP gateway",
      "ccipRead",
      "enableCcipRead"
    ],
    summary: "CCIP-Read, zdefiniowany w EIP-3668, pozwala [[smart-contract|smart kontraktowi]] odpowiedzieć na wywołanie danymi, których sam nie przechowuje: kontrakt robi [[revert|revert]] z błędem `OffchainLookup`, klient pobiera odpowiedź spod adresu URL gatewaya wskazanego przez kontrakt, a potem wywołuje callback kontraktu, który weryfikuje odpowiedź i zwraca właściwy wynik.",
    sections: [
      {
        heading: "Pętla w trzech krokach",
        paragraphs: [
          "Krok pierwszy to zwykłe [[eth-call|eth_call]]. Kontrakt CCIP-Read robi revert z `OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)`, więc `data` błędu zaczyna się od selektora `0x556f1830`. Krok drugi odbywa się off-chain: klient podstawia `{sender}` i `{data}` do szablonu URL i wysyła GET, jeśli szablon zawiera `{data}`, a jeśli nie, POST z JSON-em z polami `data` i `sender`. W odpowiedzi oczekuje obiektu JSON, którego pole `data` zawiera odpowiedź z prefiksem 0x. Krok trzeci to drugie eth_call do tego samego kontraktu z `callbackFunction(response, extraData)`; to, co ono zwróci, trafia do wywołującego tak, jakby zwróciła to pierwotna funkcja. Sam callback może znowu zrobić revert z kolejnym lookupem, więc klienci ograniczają długość takiego łańcucha: EIP wymaga limitu co najmniej czterech, a ethers zatrzymuje się po dziesięciu wywołaniach.",
          "Klient odrzuca lookup, którego `sender` nie jest wywołanym kontraktem, bo oznacza to, że błąd wypłynął z zagnieżdżonego wywołania. Odpowiedź 4xx z gatewaya kończy próbę, a przy 5xx klient przechodzi do następnego URL. `extraData` musi wrócić bez zmian; po nim callback poznaje, że gateway odpowiedział na zadane pytanie, a nie na jakieś inne."
        ]
      },
      {
        heading: "Kto co weryfikuje",
        paragraphs: [
          "Gateway z założenia nie jest zaufany; model zaufania leży w callbacku i zależy od aplikacji. Resolver z podpisującym gatewayem sprawdza, czy odpowiedź niesie niewygasły podpis klucza, który resolver przechowuje: gateway resolvera `base.eth` zwraca wynik, czas wygaśnięcia i 65-bajtowy podpis, a `resolveWithProof(bytes,bytes)` sprawdza wszystkie trzy. Resolver L2 może zamiast tego żądać [[storage-proof|dowodu storage]] dla rekordu względem state rootu L2 opublikowanego na L1, co oznacza zaufanie do rozliczenia (settlement) [[rollup|rollupa]], a nie do operatora gatewaya. Dla wywołującego oba wyglądają tak samo: jak funkcja view, która potrzebowała dwóch wywołań.",
          "Głównym użytkownikiem jest [[ens|ENS]]. Przy rozwiązywaniu wildcard z ENSIP-10 klient idzie od nazwy w górę do najbliższego przodka, który ma resolver, sprawdza przez [[erc-165|ERC-165]], czy ten resolver obsługuje `0x9061b923`, i wywołuje `resolve(bytes name, bytes data)` z nazwą zakodowaną w formacie DNS i wywołaniem rekordu zakodowanym w ABI. Systemy nazw off-chain i na L2 implementują `resolve` przez revert z lookupem i w ten sposób subnazwa bez własnego resolvera rozwiązuje się przez resolver rodzica."
        ]
      },
      {
        heading: "Co widzi wywołujący RPC i endpoint",
        paragraphs: [
          "Dla węzła CCIP-Read jest niewidoczny: węzeł obsługuje co najmniej dwa zwykłe eth_call, z których pierwsze kończy się błędem o kodzie `3` z `data` revertu, a żądania do gatewaya w ogóle nie widzi. Protokół zależy więc od tego, czy bajty revertu przetrwają drogę, i provider albo [[rpc-gateway|gateway RPC]] przed węzłem, który przepisuje reverty na `-32000` bez `data`, sprawia, że żadnej nazwy off-chain nie da się rozwiązać. Pętlę wykonują [[client-libraries|biblioteki]]. viem podąża za lookupami przy każdym wywołaniu, chyba że klienta utworzono z `ccipRead: false`, i przyjmuje własną funkcję `ccipRead.request`. ethers v6 podąża za nimi tylko w wywołaniach, które ustawiają `enableCcipRead`, jak robi to jego kod ENS, nigdy, gdy ustawiono `provider.disableCcipRead`, i tylko w `latest`.",
          "Dwie konsekwencje łatwo przeoczyć. Żądanie do gatewaya niesie `sender` i `callData` i nic więcej, żadnego [[block-tag|numeru bloku]], więc odpowiedź off-chain zawsze odzwierciedla to, co gateway wie w tej chwili, a historycznego rozwiązania nazwy nie da się odtworzyć. Poza tym pobranie wykonuje ten, kto uruchamia klienta: w przeglądarce gateway poznaje adres IP użytkownika i rozwiązywaną nazwę, a na serwerze to autor resolvera wybiera adresy URL, pod które pójdzie żądanie z twojego backendu. EIP zaleca hook do proxowania albo blokowania lookupów, brak `from` w wywołaniach, które mogą uruchamiać niezaufany kod, i domyślnie wyłączony CCIP-Read dla transakcji, także przy ich [[eth-estimate-gas|estymacji gasu]]. Batchowanie przez [[multicall|Multicall3]] też go psuje: `aggregate3` nigdy nie przekazuje w górę revertu podwywołania, więc lookup wraca jako dane zwrotne nieudanego wpisu albo jako własny błąd Multicall3 `call failed`, i klient zgodny z EIP nigdy nie dostaje `OffchainLookup`, na który mógłby zareagować."
        ]
      }
    ],
    example: {
      title: "Ręczne rozwiązanie jesse.base.eth",
      note: "Zarejestrowane we wrześniu 2026 na publicznym endpoincie Geth: dwa zwykłe eth_call, jedno żądanie HTTPS, którego węzeł nigdy nie widział, i podpis gatewaya sprawdzony on-chain przez callback."
    },
    pitfalls: [
      "Zgłaszanie revertu `OffchainLookup` jako nieudanego wywołania; `0x556f1830` na początku `data` błędu to prośba, żeby pobrać dane i wywołać callback.",
      "Obsługa eth_call przez proxy, które usuwa `data` revertu, co po cichu psuje jego użytkownikom każdą nazwę ENS off-chain.",
      "Podążanie za lookupami z backendu bez allowlisty albo proxy, co pozwala dowolnemu resolverowi kazać twoim serwerom wysyłać żądania pod wybrane przez siebie adresy URL.",
      "Rozwiązywanie nazwy off-chain w przypiętym historycznym bloku w oczekiwaniu na historyczną odpowiedź; gateway zawsze dostaje pytanie tylko o stan rzeczy w tej chwili.",
      "Ufanie odpowiedzi gatewaya w kodzie klienta zamiast przekazania jej do callbacku, jedynego kroku, który ją weryfikuje."
    ]
  },
  "eip-6963": {
    title: "Wykrywanie providerów (EIP-6963)",
    aliases: [
      "eip-6963",
      "multi injected provider discovery",
      "eip6963:announceProvider",
      "eip6963:requestProvider",
      "rdns",
      "window.ethereum",
      "mipd",
      "wallet discovery",
      "wykrywanie portfeli"
    ],
    summary: "EIP-6963 pozwala każdemu portfelowi przeglądarkowemu na stronie ogłosić własny [[eip-1193|provider EIP-1193]] przez dwa zdarzenia `window`, dzięki czemu dapp może wyświetlić listę zainstalowanych portfeli i dać użytkownikowi wybór, zamiast brać to rozszerzenie, które jako ostatnie zapisało `window.ethereum`.",
    sections: [
      {
        heading: "Wyścig, który zastępuje",
        paragraphs: [
          "Przed EIP-6963 każde rozszerzenie portfela wstrzykiwało swój provider do `window.ethereum`. Rozszerzenia ładują się w nieprzewidywalnej kolejności, więc przy dwóch zainstalowanych zwykle wygrywało to, które załadowało się ostatnie, niektóre celowo opóźniały wstrzyknięcie, żeby nadpisać konkurenta, a użytkownik nie mógł ani wybrać, z którym portfelem rozmawia strona, ani zobaczyć, który to jest. Dapp wywołujący `window.ethereum.request` nie miał wiarygodnego sposobu, żeby wiedzieć, czyje okno się pojawi, a świeżo zainstalowany portfel mógł po cichu wyprzeć ten, na którym użytkownik polegał.",
          "EIP-6963, standard interfejsu o statusie Final, nie zmienia samego providera, tylko sposób jego wykrywania. Każdy portfel nadal udostępnia obiekt EIP-1193 z `request`, tymi samymi [[rpc-errors|kodami błędów]] i tymi samymi zdarzeniami `accountsChanged` i `chainChanged`; po prostu jest ich kilka, każdy z etykietą. Portfele nadal zapisują `window.ethereum` na potrzeby starszych stron, a EIP zaleca, żeby dappy czytały go tylko jako fallback, gdy wykrywanie niczego nie znajdzie."
        ]
      },
      {
        heading: "Dwa zdarzenia i rekord",
        paragraphs: [
          "Dapp dodaje listener na `eip6963:announceProvider`, a potem wysyła zwykłe zdarzenie `Event` o nazwie `eip6963:requestProvider`. Każdy portfel raz przy załadowaniu i ponownie przy każdym żądaniu wysyła zdarzenie `CustomEvent` o nazwie `eip6963:announceProvider`, którego `detail` to zamrożony obiekt `{ info, provider }`. Ponieważ obie strony ogłaszają i obie nasłuchują, kolejność ładowania przestaje mieć znaczenie: portfel, który załaduje się po żądaniu, ogłasza się sam, a EIP wymaga, żeby dapp trzymał swój listener przez cały czas życia strony. Listenery zdarzeń wykonują się synchronicznie, więc portfele już obecne są znane w chwili, gdy `dispatchEvent` zwraca sterowanie, a spóźnione pojawiają się, kiedy tylko się załadują.",
          "`info` ma cztery pola. `uuid` to UUIDv4, który odróżnia obiekty providerów w czasie życia jednej strony i nie jest przeznaczony do zapisywania. `name` to etykieta do wyświetlenia. `icon` musi być data URI, najlepiej z kwadratowym obrazkiem o boku co najmniej 96 pikseli, a ponieważ SVG może zawierać skrypt, EIP wymaga renderowania ikony jako obrazka, a nie wstawiania jej kodu do strony. `rdns` to identyfikator w formacie reverse DNS, na przykład `com.example.wallet`, stały między sesjami, więc to właśnie jego należy zapisać, żeby zapamiętać wybór użytkownika; portfel deklaruje go sam, dlatego EIP zaleca, by nie używać go do wykrywania funkcji."
        ]
      },
      {
        heading: "Co zmienia się dla RPC",
        paragraphs: [
          "Na poziomie protokołu nic: po wykryciu dapp wysyła do wybranego providera te same wywołania: `eth_requestAccounts`, [[signing-methods|metody podpisywania]] i [[wallet-rpc|metody wallet_]]. Zmienia się to, który portfel, a więc i który węzeł upstream, na nie odpowiada. Każdy portfel przekazuje odczyty do własnego [[rpc-provider|endpointu]] i może być na innym [[chain-id|łańcuchu]], więc dwa wykryte providery na jednej stronie mogą się różnić co do chain ID i head; zobacz [[head-lag|spójność head]]. Dane sesji też należą do jednego providera, więc `chainChanged` trzeba subskrybować na tym obiekcie, przez który idą żądania.",
          "Wykrywanie obejmuje tylko providery wstrzykiwane w przeglądarce. Mobilna przeglądarka wbudowana w portfel ma do zaoferowania tylko własny provider, a WalletConnect łączy się z portfelem przez relay, a nie przez stronę, więc żadna z tych dróg nie korzysta z omawianych zdarzeń, a [[client-libraries|biblioteki]] łączą te ścieżki pod jednym interfejsem: opcja `multiInjectedProviderDiscovery` w wagmi, domyślnie włączona, używa biblioteki `mipd`, żeby z każdego ogłoszenia zrobić connector typu injected. Dapp, który sam prowadzi wykrywanie, powinien deduplikować po `uuid` i traktować dwa ogłoszenia z tym samym `uuid` jako manipulację, bo według EIP to znak, że jedno rozszerzenie podszywa się pod drugie. Miejsce ścieżki portfela w całej aplikacji opisuje [[dapp-architecture|architektura dappa]]."
        ]
      }
    ],
    example: {
      title: "Wykrywanie portfeli i zapamiętanie wyboru",
      note: "Przy następnej wizycie trzeba wybrać ogłoszenie, którego `rdns` pasuje do zapisanej wartości; dopiero gdy nic się nie ogłosi, warto sięgnąć po `window.ethereum` jako fallback."
    },
    pitfalls: [
      "Czytanie najpierw `window.ethereum`, a dopiero potem wykrywanie; to przywraca wyścig, który EIP-6963 ma usunąć.",
      "Uznawanie pierwszego ogłoszenia za portfel użytkownika; ogłoszenia przychodzą w kolejności ładowania, a nie preferencji.",
      "Zapisywanie `uuid`, żeby zapamiętać wybór; odróżnia on providery tylko w czasie życia jednej strony, a stałym identyfikatorem jest `rdns`.",
      "Wstawianie `icon` w formacie SVG do strony jako kodu, co uruchamia każdy zawarty w nim skrypt; trzeba ją renderować jako obrazek.",
      "Subskrybowanie `chainChanged` na `window.ethereum` przy wysyłaniu żądań przez wykryty provider; zdarzenia opisują wtedy inny portfel."
    ]
  },
  "eip-3009": {
    title: "EIP-3009: transfer z autoryzacją",
    aliases: [
      "transferWithAuthorization",
      "receiveWithAuthorization",
      "ERC-3009",
      "AuthorizationUsed",
      "authorizationState",
      "gasless USDC",
      "USDC bez gasu",
      "x402",
      "transfer z autoryzacją"
    ],
    summary: "EIP-3009 pozwala posiadaczowi tokenów ERC-20 podpisać autoryzację [[eip-712|EIP-712]], która bezpośrednio przenosi tokeny. Autoryzację ogranicza okno ważności i losowy 32-bajtowy nonce, a [[transaction|transakcję]] może wysłać i zapłacić za jej [[gas|gas]] ktoś inny: relayer, odbiorca płatności albo pośrednik płatności (facilitator).",
    sections: [
      {
        heading: "Funkcje i podpisywana wiadomość",
        paragraphs: [
          "`transferWithAuthorization(from, to, value, validAfter, validBefore, nonce, v, r, s)`, selektor `0xe3ee160e`, przenosi `value` z `from` do `to`, jeśli adres odzyskany z podpisu nad `TransferWithAuthorization(address from,address to,uint256 value,uint256 validAfter,uint256 validBefore,bytes32 nonce)` w domenie tokena to `from`. `receiveWithAuthorization` przyjmuje te same argumenty pod własnym type hashem i dodaje jeden warunek: wywołującym musi być `to`. `cancelAuthorization` pozwala posiadaczowi zużyć niewykorzystany nonce bez przenoszenia czegokolwiek, a `authorizationState(authorizer, nonce)` to funkcja view, która mówi, czy nonce został już zużyty. Każde użycie emituje `AuthorizationUsed(address indexed authorizer, bytes32 indexed nonce)`; w USDC ten event występuje tuż przed [[event-log|logiem]] `Transfer` w tym samym receipcie.",
          "Granice okna są ostre z obu stron: implementacja referencyjna i USDC wymagają, żeby `block.timestamp` było większe niż `validAfter` i mniejsze niż `validBefore`, obie wartości w sekundach. Nonce jest losowy i przypisany do autoryzującego, a nie jest licznikiem, więc posiadacz może mieć jednocześnie wiele otwartych autoryzacji, rozliczanych w dowolnej kolejności przez różnych wysyłających, a użyty albo anulowany nonce pozostaje zużyty. Revert w USDC brzmi `FiatTokenV2: authorization is used or canceled`. Po stronie portfela to zwykłe wywołanie `eth_signTypedData_v4`; zobacz [[signing-methods|metody podpisywania]]."
        ]
      },
      {
        heading: "Gdzie się go używa",
        paragraphs: [
          "ERC-3009 wciąż ma status Draft w repozytorium ERC, choć kontrakty FiatToken v2 firmy Circle, na których działa USDC, od lat udostępniają go razem z permit z ERC-2612. Domena zależy od wdrożenia: `USD Coin` w wersji `2` na mainnecie Ethereum i na Base, ale `USDC` na Base Sepolia, więc zamiast hardkodować jedną wartość, trzeba odczytać `name()` i `version()` albo porównać `DOMAIN_SEPARATOR()`. FiatToken v2.2 dodaje przeciążenia, które przyjmują pojedynczy `bytes signature`, na przykład `0xcf092995` dla transferu, i sprawdza je przez [[erc-1271|ERC-1271]] zawsze, gdy `from` ma kod, choć sam tekst ERC mówi, że standard nie dotyczy kont kontraktowych. Dekodery, które znają tylko selektory z ERC, nie widzą tych wywołań, a płatnika z delegacją [[eip-7702|EIP-7702]] ocenia się według kodu jego delegata, a nie przez ecrecover.",
          "[[x402|x402]], protokół płatności oparty na kodzie statusu HTTP 402, wybiera EIP-3009 jako preferowaną metodę schematu `exact` na łańcuchach EVM. Klient podpisuje autoryzację z krótkim oknem ważności, w której `to` to adres `payTo` serwera, i wysyła ją w nagłówku `PAYMENT-SIGNATURE`. Facilitator odzyskuje adres podpisującego, sprawdza saldo i okno, symuluje wywołanie przez [[eth-call|eth_call]], a potem wysyła `transferWithAuthorization` i płaci za gas. Dla tokenów bez EIP-3009 pozostaje Permit2."
        ]
      },
      {
        heading: "Porównanie z permit i kto może wysłać autoryzację",
        paragraphs: [
          "`permit(owner, spender, value, deadline, v, r, s)` z ERC-2612 podpisuje zgodę (approval), a nie transfer: zużywa kolejną wartość `nonces(owner)`, emituje `Approval` i nadal wymaga osobnego `transferFrom` wykonanego przez spendera. Sekwencyjne nonce oznaczają, że dwa permity podpisane równolegle kolidują ze sobą, a każde niewykorzystane allowance (kwota, którą spender może pobrać) przeżywa płatność. Autoryzacja EIP-3009 przenosi dokładnie `value` dokładnie do `to` i nie zostawia żadnego allowance, za cenę tego, że posiadacz musi generować losowe nonce i je śledzić.",
          "Autoryzację może wysłać każdy, kto ją ma. Przy `transferWithAuthorization` jest to w większości nieszkodliwe, bo `to` i `value` są ustalone, a kopia wyciągnięta z [[mempool|mempoolu]] zmienia tylko to, kto zapłacił za gas; transakcja pierwotnego wysyłającego kończy się wtedy revertem, bo autoryzacja jest już użyta. Szkodliwe staje się to wtedy, gdy środki ma otrzymać kontrakt, który ma na nich coś wykonać: front-runner może wykonać sam transfer z pominięciem logiki depozytu kontraktu i zostawić tokeny, których nikt nie przetworzył. `receiveWithAuthorization` temu zapobiega, bo wymaga, żeby wywołującym był odbiorca płatności, i dlatego ERC każe kontraktom używać właśnie tej funkcji.",
          "O to samo pośrednictwo potyka się [[stablecoin-payments|uzgadnianie płatności]] (reconciliation). W polu `from` transakcji jest relayer albo facilitator; płatnik niczego nie wysyła, jego [[nonce|nonce konta]] się nie zmienia, a on sam może w ogóle nie mieć ETH. Płatnik pojawia się w `topics[1]` logu `Transfer` i drugi raz w `AuthorizationUsed` razem z nonce, więc płatności trzeba dopasowywać po logach: [[eth-get-logs|eth_getLogs]] na kontrakcie tokena z topic0 `0x98de5035…` oraz płatnikiem i nonce jako topics 1 i 2 znajduje rozliczenie jednej autoryzacji, a `authorizationState` w przypiętym bloku mówi, czy została już rozliczona. [[indexer|Indekser]], który przypisuje płatność nadawcy transakcji, przypisze płatności wszystkich klientów jednemu facilitatorowi."
        ]
      }
    ],
    example: {
      title: "Wyszukiwanie rozliczeń jednego płatnika w USDC na Base",
      note: "Pole `from` receiptu to wysyłający, a oba logi wskazują płatnika `0x4c1b…4261`; nonce w `topics[2]` łączy autoryzację podpisaną off-chain z jej rozliczeniem, a `0x3e8` to 1000 jednostek, czyli 0,001 USDC."
    },
    pitfalls: [
      "Przypisywanie płatności do pola `from` transakcji; przy EIP-3009 to podmiot, który ją wysłał, a płatnik jest w logu `Transfer`.",
      "Generowanie nonce z licznika, co kończy się kolizją, gdy tylko dwie sesje podpisują jednocześnie; trzeba użyć 32 losowych bajtów i sprawdzić `authorizationState`.",
      "Podawanie `validBefore` w milisekundach; kontrakt porównuje je z `block.timestamp` w sekundach, więc autoryzacja praktycznie nigdy nie wygasa.",
      "Hardkodowanie nazwy domeny `USD Coin` na każdym łańcuchu; wdrożenia na testnetach się różnią i transfer kończy się wtedy revertem z powodu nieprawidłowego podpisu.",
      "Używanie `transferWithAuthorization` do wpłat do kontraktu, który musi przetworzyć depozyt; front-runner może wtedy przenieść tokeny z pominięciem tego przetwarzania."
    ]
  },
  paymaster: {
    title: "Paymaster",
    aliases: [
      "validatePaymasterUserOp",
      "postOp",
      "gas sponsorship",
      "sponsorowanie gasu",
      "verifying paymaster",
      "ERC-20 paymaster",
      "ERC-7677",
      "pm_getPaymasterData",
      "paymasterAndData"
    ],
    summary: "Paymaster to kontrakt [[erc-4337|ERC-4337]], który zgadza się zapłacić za gas cudzej UserOperation: EntryPoint prosi go o zatwierdzenie operacji podczas walidacji, obciąża kosztem depozyt, który paymaster trzyma w EntryPoint, i opcjonalnie wywołuje go ponownie po wykonaniu, żeby się rozliczyć.",
    sections: [
      {
        heading: "Dwa wywołania i depozyt",
        paragraphs: [
          "Kiedy UserOperation wskazuje paymastera, EntryPoint zmienia płatnika. `validateUserOp` konta nadal się wykonuje, ale z `missingAccountFunds` równym zero; następnie EntryPoint sprawdza, czy depozyt paymastera, czyli ether złożony w EntryPoint przez `depositTo`, pokrywa maksymalny możliwy koszt operacji, potrąca tę przedpłatę (prefund) i wywołuje `validatePaymasterUserOp(userOp, userOpHash, maxCost)`. Paymaster odmawia, robiąc revert, albo zwraca tablicę bajtów `context` i spakowane słowo `validationData`, które zawiera flagę błędu podpisu oraz okno `validUntil` i `validAfter`.",
          "Po wywołaniu konta niepusty `context` sprawia, że EntryPoint wywołuje `postOp(mode, context, actualGasCost, actualUserOpFeePerGas)`, gdzie `mode` mówi, czy wewnętrzne wywołanie się powiodło, czy zrobiło revert; w obu przypadkach paymaster płaci za [[gas|gas]]. Niewykorzystana przedpłata wraca do depozytu paymastera, a `eth_getUserOperationReceipt` bundlera podaje `paymaster`, który zapłacił. Depozyt to nie stake: `addStake` blokuje ether na czas unstake delay (opóźnienia przed wycofaniem stake'u), a bundlery [[erc-7562|ERC-7562]] wymagają takiego stake'u, zanim złagodzą wobec paymastera swoje reguły. Stake nigdy nie podlega slashingowi i nigdy nie idzie na gas."
        ]
      },
      {
        heading: "Pola spakowane i rozpakowane",
        paragraphs: [
          "Od EntryPoint v0.7 JSON, który portfel wysyła do bundlera, zawiera cztery pola, `paymaster`, `paymasterVerificationGasLimit`, `paymasterPostOpGasLimit` i `paymasterData`, które EntryPoint dostaje on-chain sklejone w jedną wartość `paymasterAndData`: 20-bajtowy adres, dwa 16-bajtowe limity gasu, a po nich dane paymastera. `eth_estimateUserOperationGas`, odpowiednik [[eth-estimate-gas|eth_estimateGas]] po stronie bundlera, zwraca `paymasterVerificationGasLimit`, ale ERC-7769 zaznacza, że limitu dla post-op nie da się wiarygodnie oszacować, więc podaje go paymaster, który za niego płaci.",
          "EntryPoint v0.9 dodaje opcjonalne `paymasterSignature`, dołączane po `paymasterData` za magicznym sufiksem `0x22e325a297439656` i wyłączone z `userOpHash`, dzięki czemu użytkownik i sponsor mogą podpisywać równolegle."
        ]
      },
      {
        heading: "Verifying paymaster i paymaster tokenowy",
        paragraphs: [
          "Verifying paymaster przekazuje decyzję sponsorowi działającemu off-chain: jego usługa stosuje swoją politykę i podpisuje hash obejmujący pola operacji, w tym wszystkie limity gasu i opłaty, [[chain-id|chain ID]], [[address|adres]] paymastera i okno ważności; kontrakt tylko odzyskuje podpisującego przez [[ecdsa-signature|ECDSA]]. ERC-7677 standaryzuje tę usługę: `pm_getPaymasterStubData` zwraca pola zastępcze (stub) do estymacji gasu, `pm_getPaymasterData` ostateczne, podpisane pola, a dapp przekazuje portfelowi URL usługi przez capability `paymasterService` w [[wallet-rpc|wallet_sendCalls]]. Referencyjny verifying paymaster trzyma swojego podpisującego w zmiennej `immutable`, która żyje w kodzie, a nie w [[contract-storage|storage]], i zwraca pusty kontekst, więc nie potrzebuje stake'u.",
          "Paymaster ERC-20 pozwala użytkownikowi płacić [[token-standards|tokenem]]. Potrzebuje ceny, zwykle z [[price-oracle|oracle'a]], i musi faktycznie pobrać płatność; wzorzec opisany w ERC to pobrać z góry maksymalny możliwy koszt i zwrócić nadwyżkę później, w `postOp`. Odczyt oracle'a dotyka storage spoza storage samego nadawcy, a paymastery bez stake'u nie mogą zwracać kontekstu, więc paymaster tokenowy musi mieć stake, zanim publiczne bundlery zaczną przyjmować operacje, które go używają."
        ]
      },
      {
        heading: "Gdzie sponsorowanie zawodzi",
        paragraphs: [
          "Pierwsza przyczyna to pieniądze. Jeśli depozyt nie pokrywa przedpłaty, EntryPoint robi revert z `AA31 paymaster deposit too low`, a bundlery odmawiają wcześniej: sumują maksymalny koszt każdej oczekującej operacji, która wskazuje paymastera, i po przekroczeniu depozytu odrzucają nowe z [[rpc-errors|błędem]] `-32508`. Sponsor, który po tym momencie dalej podpisuje, wydaje zgody, z których nikt nie może skorzystać.",
          "Druga to rozjazd między estymacją a wysłaniem. Dane stub muszą mieć tę samą długość co dane ostateczne, nie mogą zawierać więcej bajtów zerowych i muszą prowadzić tą samą ścieżką kodu, bo inaczej `preVerificationGas` i limity gasu wyjdą za niskie. Ponieważ sponsor podpisał pola gasu, portfel, który ponownie estymuje gas po `pm_getPaymasterData`, dostaje `AA34 signature error`, a portfel, który wysyła operację po `validUntil`, dostaje `AA32 paymaster expired or not due` albo błąd bundlera `-32503`.",
          "Trzecia to revert w `postOp`. W v0.7 EntryPoint cofa wtedy także wykonanie konta, emituje [[event-log|event]] `PostOpRevertReason`, oznacza operację jako nieudaną i mimo to obciąża depozyt paymastera. Dlatego paymaster tokenowy, który pobiera płatność dopiero po wykonaniu, można złośliwie zmusić (griefing) do płacenia za operacje, które ostatecznie nic nie robią."
        ]
      }
    ],
    example: {
      title: "Prośba do sponsora o pola stub i to, co ostatecznie widzi EntryPoint",
      note: "Stub zawiera fikcyjny podpis o prawdziwej długości; ostateczne `paymasterData` podpisuje wartości gasu, więc po zwróceniu wyniku przez `pm_getPaymasterData` nic w gasie nie może się już zmienić."
    },
    pitfalls: [
      "Ponowna estymacja albo podbijanie opłat po `pm_getPaymasterData`, co zmienia pola podpisane przez sponsora i zamienia sponsorowaną operację w `AA34 signature error`.",
      "Zasilenie stake'u paymastera i zapomnienie o jego depozycie; stake jest zablokowany na potrzeby reputacji i nigdy nie płaci za gas.",
      "Zwracanie stubowego `paymasterData`, które jest krótsze od prawdziwych danych albo ma więcej bajtów zerowych, przez co `preVerificationGas` jest niedoszacowany, a podpisana operacja zostaje odrzucona.",
      "Zakładanie, że zapłacił paymaster przekazany w `paymasterService`; ERC-7677 pozwala portfelowi podstawić własnego, więc `paymaster` trzeba odczytać z receiptu.",
      "Umieszczanie w kodzie klienta URL providera paymastera z kluczem API zamiast przepuszczenia go przez backend aplikacji, jak zaleca sekcja bezpieczeństwa ERC-7677."
    ]
  },
  "erc-7562": {
    title: "Reguły zakresu walidacji (ERC-7562)",
    aliases: [
      "ERC-7562",
      "banned opcodes",
      "zakazane opcode'y",
      "associated storage",
      "bundler reputation",
      "reputacja bundlera",
      "entity staking",
      "mass invalidation",
      "erc7562Tracer",
      "unsafe mode"
    ],
    summary: "ERC-7562 to zestaw reguł, które bundlery stosują do fazy walidacji każdej UserOperation z [[erc-4337|ERC-4337]]: zakazane opcode'y, ograniczony dostęp do storage oraz stake i reputacja dla współdzielonych kontraktów. Dzięki temu jedna tania zmiana on-chain nie może unieważnić wielu operacji, które już trafiły do wspólnej puli.",
    sections: [
      {
        heading: "Jaki problem rozwiązuje",
        paragraphs: [
          "Ważność zwykłej [[transaction|transakcji]] opiera się na podpisie, [[nonce|nonce]] i saldzie, a unieważnić ją może tylko inna transakcja od tego samego nadawcy, za którą trzeba zapłacić opłatę. Ważność UserOperation to wynik tego, co obliczą `validateUserOp` konta i `validatePaymasterUserOp` [[paymaster|paymastera]], a ten kod mógłby czytać cokolwiek. Bez ograniczeń atakujący zapełnia pulę operacjami, które sprawdzają ten sam slot storage, zmienia ten slot jednym zapisem za około 5000 gasu i zostawia każdego bundlera z tysiącami operacji, które teraz kończą się niepowodzeniem i za nic nie płacą. To atak masowego unieważnienia (mass invalidation).",
          "Reguły zamykają walidację w sandboksie, tak żeby każda operacja zależała tylko od stanu własnego nadawcy, a globalne kontrakty, czyli fabryki kont (factory), paymastery i agregatory, dało się zidentyfikować i ograniczać (throttling). Dotyczą tylko ramek walidacji; wykonanie konta i `postOp` paymastera nie mają ograniczeń, bo po udanej walidacji płatność jest gwarantowana. Każdy bundler we wspólnej puli P2P, która w ERC-4337 odpowiada [[mempool|mempoolowi]] węzła, musi egzekwować te same reguły, bo bundler, który przekazuje operacje uznane przez peerów za nieprawidłowe, zostaje oznaczony jako spamer i odłączony."
        ]
      },
      {
        heading: "Opcode'y i storage",
        paragraphs: [
          "Reguła OP-011 blokuje opcode'y, które czytają środowisko zamiast stanu: `ORIGIN`, `GASPRICE`, `BLOCKHASH`, `COINBASE`, `TIMESTAMP`, `NUMBER`, `PREVRANDAO`, `GASLIMIT`, `BASEFEE`, `BLOBHASH`, `BLOBBASEFEE`, `INVALID`, `SELFDESTRUCT` oraz `CREATE` poza wąskimi przypadkami wdrażania konta. Ich wartości zmieniają się między symulacją a włączeniem do bloku: `require(block.number == N)` przechodzi w puli i nie przechodzi on-chain. `GAS` jest dozwolony tylko tuż przed `*CALL`, `CALL` z wartością tylko do EntryPoint, `BALANCE` tylko dla podmiotów ze stake'iem, a wywołania tylko do bezstanowych [[precompiles|precompile'ów]] od `0x01` do `0x11` oraz P256VERIFY. Konto, które potrzebuje terminu wygaśnięcia, zwraca `validUntil` w swoim `validationData`, a sprawdza go EntryPoint.",
          "Dostęp do storage jest ograniczony do własnego [[contract-storage|storage]] nadawcy i do jego powiązanego storage (associated storage) w innych kontraktach, czyli slotu, którego wartością jest adres nadawcy, albo którego klucz to `keccak256(sender ‖ x) + n` dla `n` do 128. Tak układa się w Solidity mapping z kluczem typu address, więc istniejące konto może odczytać własne saldo [[token-standards|tokena]]. [[transient-storage|Transient storage]] liczy się jako storage. Factory albo paymaster ze stake'iem może też korzystać z własnego storage i swobodnie czytać inne kontrakty, a hash kodu każdego kontraktu, którego dotknęła walidacja, nie może się zmienić między pierwszą a drugą walidacją."
        ]
      },
      {
        heading: "Stake i reputacja",
        paragraphs: [
          "Każdy bundler śledzi współdzielone podmioty: `opsSeen` liczy otrzymane prawidłowe operacje, które się do danego podmiotu odwołują, a `opsIncluded` te, które trafiły do bloku; obie wartości co godzinę są mnożone przez 23/24. Podmiot dostaje status THROTTLED, gdy `opsSeen / 10` przekracza `opsIncluded + 10`, i BANNED, gdy przekracza `opsIncluded + 50`; operacje zbanowanego paymastera są usuwane, a nowe odrzucane z [[rpc-errors|błędem]] `-32504`.",
          "Stake sprawia, że nowa tożsamość jest droga: trzeba zablokować co najmniej zależne od łańcucha `MIN_STAKE_VALUE`, mniej więcej równowartość 1000 dolarów, na unstake delay wynoszący co najmniej jeden dzień. Stake nigdy nie podlega slashingowi; jedynie uniemożliwia atakującemu tworzenie nowych paymasterów szybciej, niż dogania ich reputacja, i daje opisany wyżej szerszy dostęp do storage. Agregatory zawsze muszą mieć stake, paymaster bez stake'u nie może zwracać `context`, a nadawca bez stake'u może mieć co najwyżej cztery oczekujące operacje."
        ]
      },
      {
        heading: "Czego bundler potrzebuje od węzła",
        paragraphs: [
          "Egzekwowanie reguł oznacza tracing. Bundler symuluje walidację przez [[debug-api|debug_traceCall]] z tracerem, który zapisuje opcode'y, sloty storage i ramki wywołań osobno dla każdego podmiotu, sprawdza [[execution-trace|trace]] pod kątem reguł i przed wysłaniem jeszcze raz robi trace całego bundla. Rundler, Alto i referencyjny bundler eth-infinitism wysyłają w żądaniu tracer JavaScript jako string; [[geth|Geth]] od v1.16.0 ma natywny `erc7562Tracer`. Węzeł Hardhata i Ganache nie potrafią go uruchomić, a wiele [[rpc-provider|hostowanych endpointów]] wyłącza `debug_` albo przyjmuje tylko nazwane wbudowane tracery, więc bundler zwykle potrzebuje własnego węzła; zobacz [[endpoint-capabilities|możliwości endpointów]].",
          "Furtką awaryjną jest tryb unsafe, czyli `--unsafe` w Rundlerze i bundlerze referencyjnym oraz wyłączone `--safe-mode` w Alto. Pomija on trace, a więc i reguły. Nadaje się do prywatnego bundlera obsługującego znane konta na devnecie, ale taki bundler nie może bezpiecznie dołączyć do wspólnej puli. Natywna abstrakcja kont korzysta z tej pracy: RIP-7560 każe builderom bloków stosować te reguły, a robocza transakcja ramkowa (frame transaction) z EIP-8141 definiuje politykę mempoolu inspirowaną ERC-7562, ale bez stake'u i reputacji."
        ]
      }
    ],
    pitfalls: [
      "Odczytywanie `block.timestamp` w `validateUserOp`, żeby wygasić klucz sesyjny, co bundlery odrzucają; zamiast tego trzeba zwrócić `validUntil` w `validationData`.",
      "Podłączenie bundlera do endpointu, który odrzuca niestandardowe tracery, a potem włączenie trybu unsafe na produkcji, żeby uciszyć błędy.",
      "Pozwolenie paymasterowi bez stake'u na czytanie oracle'a albo własnego storage, przez co każdy publiczny bundler odrzuca operacje, które go wskazują.",
      "Sprawdzanie konta wyłącznie na lokalnym bundlerze w trybie unsafe, który akceptuje kod walidacji odrzucany przez publiczne bundlery."
    ]
  },
  faucet: {
    title: "Faucet testnetowy",
    aliases: ["faucet", "kranik", "testnet ETH", "faucet Sepolia", "Sepolia faucet", "PoW faucet", "PoWFaucet", "drip", "darmowy testowy ether"],
    summary: "Faucet to serwis, który wysyła niewielkie ilości [[testnets|testnetowego]] etheru z zasilonego portfela każdemu, kto poprosi. Wydaje go oszczędnie, z rate limitami i zabezpieczeniami przed botami, bo choć ten ether nic nie jest wart, jego pula jest skończona.",
    sections: [
      {
        heading: "Skąd bierze się testowy ether",
        paragraphs: [
          "Nic nie wybija etheru specjalnie dla faucetu. W testnecie [[proof-of-stake|proof of stake]] nowy ether pojawia się tylko przez alokację w [[genesis|genesis]] i emisję dla walidatorów, a jedno i drugie trafia do tego, kto kontroluje te klucze; na Sepolii, której zbiór walidatorów jest zamknięty, to niewielka grupa operatorów. Faucet to portfel zasilony przez jednego z nich plus frontend, który podpisuje przelew na twój [[address|adres]] i wysyła go przez [[eth-send-raw-transaction|eth_sendRawTransaction]]. Gdy saldo się skończy, faucet przestaje działać.",
          "Dlatego na długo żyjących sieciach testowy ether jest rzadki, choć z założenia nic nie jest wart. Popyt rośnie z każdym projektem, farmerzy airdropów generują aktywność, żeby kwalifikować się do nagród, a na Goerli testowy ether dorobił się ceny rynkowej, przez co botom opłacało się drenować faucety tak szybko, jak je uzupełniano. Sieci resetowane i prywatne omijają ten problem: [[ephemery|Ephemery]] w każdym nowym genesis znowu zasila portfele faucetów, a [[local-devnet|lokalny devnet]] albo sieć [[kurtosis|Kurtosis]] startuje z zasilonymi kluczami, więc ani jedna, ani druga nie potrzebuje faucetu w zwykłym sensie."
        ]
      },
      {
        heading: "Jak faucety wydzielają ether",
        paragraphs: [
          "Każdy projekt faucetu próbuje sprawić, żeby jedno pobranie środków (claim) było tanie dla człowieka i drogie dla bota. Faucet proof-of-work, taki jak PoWFaucet autorstwa pk910 z instancjami dla Sepolii, Hoodi i Ephemery, każe przeglądarce liczyć hashe dla wyzwania (challenge) wydanego przez serwer i płaci za każdy zaakceptowany share; to hashowanie niczego nie kopie, tylko wycenia claim w czasie i prądzie. Faucety wymagające konta wiążą claimy z czymś, co trudno tanio podrobić: kontem GitHub o minimalnym wieku, wynikiem Gitcoin Passport, logowaniem u firmy prowadzącej faucet albo saldem na mainnecie. Faucet Sepolii od Alchemy wymaga co najmniej 0,001 ETH na mainnecie.",
          "Pod spodem działają zwykłe [[rate-limits|rate limity]]: limit claimów na adres i na IP na dzień, odmowa dla zakresów adresów hostingowych i VPN, górny limit istniejącego salda odbiorcy, odmowa dla odbiorców będących kontraktami oraz budżet wypływu, który zmniejsza wypłaty, gdy spada saldo samego faucetu. Komunikaty, które widzi użytkownik, takie jak „już odebrano”, „za wysokie saldo”, pętla captchy albo kolejka, to właśnie te zasady, a nie [[rpc-errors|błędy RPC]]."
        ]
      },
      {
        heading: "Prowadzenie faucetu",
        paragraphs: [
          "Prowadzenie faucetu oznacza trzymanie hot walleta i komunikację z węzłem. Konfiguracja PoWFaucet jest typowa: endpoint RPC albo kilka uszeregowanych według priorytetu, klucz prywatny, [[chain-id|chain ID]] albo jego automatyczne wykrywanie, limit gasu 21 000, żeby wypłaty nie mogły uruchamiać kodu kontraktu, limity opłat i limit transakcji w stanie pending, w przykładowej konfiguracji dwanaście. Strumień przelewów z jednego konta to problem zarządzania [[nonce|nonce]]: równoległe claimy dostają kolejne nonce, a jeden przelew, który utknął w [[mempool|mempoolu]] po skoku opłat, blokuje wszystkie późniejsze, dopóki nie zostanie zastąpiony.",
          "Najważniejszy do ochrony jest klucz, bo kto go zdobędzie, opróżni faucet jedną transakcją, a ponieważ klucz podpisuje każdą wypłatę bez nadzoru, nie da się go schować za przyciskiem zatwierdzania w portfelu sprzętowym. Faucet, który polega na publicznym endpoincie [[rpc-provider|providera]], dziedziczy też jego rate limity dokładnie wtedy, gdy popyt jest największy, dlatego PoWFaucet rozgłasza każdą transakcję do więcej niż jednego endpointu i potrafi kolejkować claimy, czekając na uzupełnienie salda."
        ]
      },
      {
        heading: "Faucet to nie pojęcie z mainnetu",
        paragraphs: [
          "Faucety istnieją tylko dlatego, że testowy ether jest darmowy umownie. Mainnet nie ma faucetów w tym sensie, a strona, która prosi o seed phrase albo o drobną opłatę aktywacyjną za wypłatę środków, to oszustwo. Testnety L2 zwykle zasilają użytkowników etherem przeniesionym z Sepolii przez [[bridge|bridge]] albo przez własne faucety, a kod, który ma w końcu działać na mainnecie, można najpierw sprawdzić na lokalnym węźle z forkiem, który ustawi dowolne saldo."
        ]
      }
    ],
    pitfalls: [
      "Pobieranie środków z publicznego faucetu na początku każdego przebiegu CI; rate limity i zabezpieczenia przed botami co jakiś czas go wywrócą, a zasilone klucze devnetu nie.",
      "Proszenie o wypłatę na smart account, którego funkcja receive uruchamia kod; faucet, który wysyła z limitem gasu 21 000 albo odrzuca kontrakty, nie zdoła jej zrealizować.",
      "Równoległe wysyłanie wypłat bez śledzenia nonce, przez co jeden przelew z za niską opłatą blokuje całą kolejkę.",
      "Prowadzenie faucetu z klucza, na którym są też inne środki, przez co jeden wyciek drenuje więcej niż pulę faucetu.",
      "Planowanie intensywnej kampanii testów w oparciu o wypłaty z faucetu długo żyjącego testnetu zamiast sieci, która się resetuje, albo devnetu zasilanego samodzielnie."
    ]
  },
  kurtosis: {
    title: "Kurtosis ethereum-package",
    aliases: [
      "kurtosis",
      "ethereum-package",
      "kurtosis run",
      "network_params.yaml",
      "enclave",
      "devnet z wieloma klientami",
      "multi-client devnet",
      "ethPandaOps"
    ],
    summary: "Kurtosis to orkiestrator kontenerów do powtarzalnych środowisk testowych, a `ethereum-package` od ethPandaOps uruchamia na nim prywatną sieć Ethereum z wieloma klientami: prawdziwymi [[execution-client|klientami wykonawczymi]] i [[consensus-client|klientami konsensusu]], walidatorami i opcjonalnymi narzędziami, wszystko z jednego pliku argumentów YAML.",
    sections: [
      {
        heading: "Co uruchamia jedna komenda",
        paragraphs: [
          "`kurtosis run --enclave my-testnet github.com/ethpandaops/ethereum-package --args-file network_params.yaml` tworzy za pomocą generatora genesis od ethPandaOps zgodne pliki [[genesis|genesis]] dla warstwy wykonawczej i konsensusu, a potem uruchamia każdego uczestnika jako zestaw kontenerów: klienta wykonawczego, [[beacon-node|beacon node]] i [[validator-client|klienta walidatora]], połączonych przez [[engine-api|Engine API]] ze wspólnym sekretem JWT i spiętych jako peery z każdym innym uczestnikiem. Wszystko działa w enclave, czyli odizolowanym środowisku, które istnieje, dopóki nie usunie go `kurtosis enclave rm -f my-testnet`, a ten sam pakiet działa na lokalnym Dockerze albo na Kubernetesie.",
          "To standardowe środowisko do pracy z wieloma klientami: ethPandaOps i zespoły klientów stawiają na nim devnety do testów interoperacyjności i przećwiczają [[hardfork|forki]], skrypty lokalnego testnetu Lighthouse są na nim zbudowane, a repozytorium pakietu ma katalog konfiguracji sprawdzanych w CI przy każdym pull requeście. Po ustawieniu `network_params.network` na sieć publiczną, taką jak `sepolia`, `hoodi` albo `ephemery`, pakiet zamiast tego dołącza do tej sieci; sufiks `-shadowfork` razem z `persistent: true` forkuje stan prawdziwej sieci do prywatnej kopii, żeby przetestować aktualizację na stanie o rozmiarze produkcyjnym."
        ]
      },
      {
        heading: "Plik argumentów",
        paragraphs: [
          "`participants` to lista. Każdy wpis podaje `el_type` i `cl_type`, opcjonalnie `vc_type`, nadpisania obrazów, takie jak `el_image` do testowania własnego builda, dodatkowe flagi oraz `count`, żeby powielić parę. Typy wykonawcze to między innymi `geth`, `nethermind`, `erigon`, `besu`, `reth` i `nimbus-eth1`; typy konsensusu to `lighthouse`, `teku`, `prysm`, `nimbus`, `lodestar` i `grandine`. `network_params` kształtuje łańcuch: `network_id`, który staje się też [[chain-id|chain ID]] i domyślnie wynosi 3151908, `seconds_per_slot`, liczbę kluczy walidatorów na węzeł i po jednej epoce na każdy fork (`electra_fork_epoch`, `fulu_fork_epoch`, `gloas_fork_epoch`), przy czym maksymalna wartość uint64 oznacza, że fork nigdy się nie aktywuje.",
          "`additional_services` dodaje otaczającą infrastrukturę: `dora` jako eksplorator beacon, `blockscout` jako [[block-explorer|eksplorator bloków]] warstwy wykonawczej, `spamoor` i `tx_fuzz` do generowania ruchu transakcji, `blobscan` dla [[blob|blobów]], `prometheus` i `grafana` do metryk oraz `assertoor` do uruchamiania na żywej sieci sprawdzeń takich jak „łańcuch się finalizuje”. `mev_type` stawia [[mev-boost|MEV-Boost]] z [[relay|relayem]] i builderem, a `wait_for_finalization: true` sprawia, że uruchomienie czeka, aż pierwsza epoka się sfinalizuje."
        ]
      },
      {
        heading: "Dostęp do węzłów",
        paragraphs: [
          "Usługi dostają nazwy takie jak `el-1-nethermind-lighthouse` i `cl-1-lighthouse-nethermind`, a ich porty są publikowane na losowych portach hosta: `kurtosis enclave inspect my-testnet` je wypisuje, a `kurtosis port print my-testnet el-1-nethermind-lighthouse rpc` podaje URL JSON-RPC. Klienci startują z szeroko włączonymi [[namespaces|przestrzeniami nazw]] (Geth z `admin`, `debug` i `txpool` przez HTTP, Nethermind dodatkowo z `trace`), więc tracing i podgląd mempoolu działają tam, gdzie publiczny endpoint by ich odmówił. Genesis zasila 21 kluczy testowych opublikowanych w źródłach pakietu, dlatego nigdzie indziej nie mogą one trzymać żadnej wartości.",
          "Najważniejszy jest tu kontrast z symulowanym węzłem. [[local-devnet|Anvil albo symulowana sieć Hardhat]] to jeden proces, który kopie bloki na żądanie, fałszuje zegar i nie uruchamia konsensusu, więc nie pojawią się tam [[finality|finalność]], tagi `safe` i `finalized`, [[reorg|reorgi]], zachowanie proposera ani [[client-diversity|rozbieżności między klientami]]. Sieć Kurtosis ma prawdziwe sloty, prawdziwe atestacje i prawdziwe błędy klientów, kosztem kilku minut startu, kilku kontenerów na uczestnika i gigabajtów pamięci nawet przy małym zestawie."
        ]
      }
    ],
    example: {
      title: "Devnet z czterema węzłami, trzema klientami i zaplanowanym forkiem",
      note: "Każdy uczestnik musi razem z resztą przejść w epoce 10 na nowy fork; obraz, który go nie implementuje, staje albo się odłącza, i właśnie to ma wyłapać ten przebieg."
    },
    pitfalls: [
      "Zostawianie obrazów na `latest`, przez co ten sam plik argumentów z tygodnia na tydzień testuje inne wersje klientów; przypinaj tagi w `el_image` i `cl_image`.",
      "Uruchamianie pakietu w CI z domyślnej gałęzi zamiast przypięcia wydania przez `github.com/ethpandaops/ethereum-package@<tag>`.",
      "Hardkodowanie portów hosta skopiowanych z jednego przebiegu; są przydzielane od nowa za każdym razem, chyba że ustali je `port_publisher`.",
      "Oczekiwanie, że `finalized` przesunie się kilka sekund po genesis; jak w każdym beacon chainie, devnet potrzebuje najpierw kilku epok atestacji.",
      "Używanie zasilonych kluczy z genesis w sieci publicznej, gdzie każdy, kto przeczytał źródła pakietu, może z nich wydawać środki."
    ]
  },
  chainlist: {
    title: "Chainlist i rejestry łańcuchów",
    aliases: [
      "chainlist.org",
      "ethereum-lists/chains",
      "chainid.network",
      "wallet_addEthereumChain",
      "EIP-3085",
      "dodaj sieć",
      "add network",
      "lista publicznych RPC",
      "public RPC list"
    ],
    summary: "Chainlist to katalog sieci EVM uporządkowany według [[chain-id|chain ID]], zbudowany ze społecznościowego rejestru ethereum-lists/chains i własnej listy publicznych adresów RPC. Pozwala dodać sieć do portfela jednym kliknięciem przez `wallet_addEthereumChain`.",
    sections: [
      {
        heading: "Skąd pochodzą dane",
        paragraphs: [
          "Rejestrem pod spodem jest repozytorium `ethereum-lists/chains` na GitHubie: jeden plik JSON na łańcuch, nazwany według identyfikatora CAIP-2, na przykład `eip155-1.json`, z polami `name`, `chain`, `chainId`, `networkId`, `nativeCurrency`, `rpc`, `faucets`, `explorers` oraz opcjonalnymi `parent` i `status`. Dane są agregowane w pliku `https://chainid.network/chains.json`, który chainlist.org pobiera i łączy z dwiema własnymi listami: dodatkowymi wpisami łańcuchów i `extraRpcs.js` z dodatkowymi publicznymi endpointami. Każdy może je rozszerzyć pull requestem, a połączony wynik jest serwowany pod `https://chainlist.org/rpcs.json`.",
          "Rejestr działa na zasadzie „kto pierwszy, ten lepszy”. Pull request, który zgłasza zajęte już ID, jest zamykany, łańcucha nigdy się nie usuwa, tylko oznacza jako `deprecated`, a ID przydzielone ponownie po wycofaniu dostaje czerwoną flagę `reusedChainId`, którą aplikacje korzystające z rejestru powinny pokazywać. Nic nie powstrzymuje niezwiązanych ze sobą sieci prywatnych przed używaniem tego samego numeru poza rejestrem, więc wpis dowodzi tylko tego, że jeden zespół zarejestrował go pierwszy. Wpisy też się starzeją: w chwili pisania pierwsze dwa adresy URL Sepolii w rejestrze, `rpc.sepolia.org` i `rpc2.sepolia.org`, w ogóle nie odpowiadały na JSON-RPC."
        ]
      },
      {
        heading: "Dodawanie sieci do portfela",
        paragraphs: [
          "Przycisk dodania do portfela wysyła [[wallet-rpc|wallet_addEthereumChain]] (EIP-3085) przez [[eip-1193|provider EIP-1193]] strony, z `chainId` jako ciągiem hex, `chainName`, `nativeCurrency` w postaci nazwy, symbolu i liczby miejsc dziesiętnych, `rpcUrls` oraz opcjonalnie `blockExplorerUrls` i `iconUrls`. EIP wymaga, żeby portfel odrzucił żądanie, jeśli `rpcUrls` jest puste, jeśli któryś URL używa `http:` albo `file:` albo jeśli `chainId` nie zgadza się z tym, co zwraca `eth_chainId` z podanych adresów RPC, oraz żeby odmówił dodania tego samego chain ID drugi raz. Każe też portfelowi podpisywać wyłącznie z przesłanym chain ID, nigdy z tym, które zgłasza endpoint, bo wadliwy albo złośliwy endpoint mógłby inaczej nakłonić użytkownika do podpisania czegoś dla innego łańcucha.",
          "Po sukcesie wywołanie zwraca `null`, a EIP mówi, że nie wolno zakładać, że nowy łańcuch został wybrany; dapp, który go potrzebuje, wywołuje następnie `wallet_switchEthereumChain` i ponownie odczytuje `eth_chainId`. Samo EIP-3085 ma status Stagnant, a mimo to portfele powszechnie je implementują. Zaleca ono też, żeby portfele porównywały żądania z listą znanych łańcuchów, dlatego portfel może ostrzec, gdy nazwa albo symbol waluty nie zgadza się z jego danymi."
        ]
      },
      {
        heading: "Wybór endpointu z listy",
        paragraphs: [
          "Wpis w chainlist to wskaźnik na czyjś serwer, a jego operator widzi każde żądanie: twój adres IP, konta, o które pytasz, i twoje transakcje, zanim staną się publiczne. Chainlist opisuje każdy endpoint deklaracją samego operatora, czyli wartością `tracking` równą `none`, `limited` albo `yes`, oraz tekstem jego polityki prywatności; etykiety przychodzą razem z każdym pull requestem i nikt ich nie audytuje. Publiczny endpoint zwykle ma też [[rate-limits|rate limit]], może być opóźniony względem heada, może działać z pruningiem albo nie mieć `debug_` i `trace_`, więc nadaje się do obsługi portfela, ale nie jako backend [[indexer|indeksera]] ani produkcyjnej puli za [[load-balancer|load balancerem]].",
          "Lepiej weryfikować, niż ufać. Przed użyciem adresu URL trzeba wysłać do niego `eth_chainId` i porównać wynik z oczekiwanym ID, sprawdzić `web3_clientVersion` i numer [[block|bloku]] heada z drugim źródłem, a adres RPC, który przyszedł w okienku `wallet_addEthereumChain` od jakiejś strony, traktować jako wybór tej strony, a nie sieci. Nieuczciwy endpoint nie podrobi podpisów, ale może podawać złe salda, ukrywać transakcje albo serwować nieaktualny head; [[state-proof|dowody stanu]] i [[verified-rpc|weryfikowane RPC]] istnieją dla przypadków, w których to ma znaczenie."
        ]
      }
    ],
    example: {
      title: "Żądanie dodania sieci zbudowane z rejestru, tylko z adresami URL, które zwracają właściwe chain ID",
      note: "Placeholdery `${INFURA_API_KEY}` w rejestrze oznaczają adresy URL wymagające klucza; pętla z `eth_chainId` to to samo sprawdzenie, którego EIP-3085 wymaga od portfela, tylko zrobione przed wyświetleniem okienka, a nie po nim."
    },
    pitfalls: [
      "Traktowanie zarejestrowanego chain ID jako globalnie unikalnego; sieci prywatne i porzucone używają tych samych ID poza rejestrem.",
      "Odczytywanie etykiety tracking `none` jako [[rpc-privacy|gwarancji prywatności]]; to opis samego operatora, a nie audyt.",
      "Hardkodowanie w kodzie produkcyjnym pierwszego adresu URL z chainlist dla danego łańcucha, co uzależnia aplikację od dostępności i rate limitów nieznanego operatora.",
      "Zakładanie, że `wallet_addEthereumChain` przełączył też sieć; trzeba po nim wysłać żądanie przełączenia i ponownie odczytać `eth_chainId`."
    ]
  },
  "dex-pool-reads": {
    title: "Odczyt stanu pul DEX",
    aliases: ["stan puli AMM", "getReserves", "slot0", "extsload", "StateView", "rezerwy puli", "tick bitmap", "płynność puli", "pool reserves"],
    summary: "Odczyt stanu pul DEX to pobieranie przez RPC sald tokenów, cen i płynności pul zdecentralizowanej giełdy za pomocą getterów, [[event-log|eventów]] i [[contract-storage|układu storage]] właściwych dla danej konstrukcji, tak żeby interfejs, router albo bot mógł wycenić swap względem jednego spójnego bloku.",
    sections: [
      {
        heading: "Pule i rezerwy: Uniswap v2 i v3",
        paragraphs: [
          "Zdecentralizowana giełda (DEX) pozwala każdemu wymienić jeden [[token-standards|token]] na inny w puli, czyli [[smart-contract|smart kontrakcie]] z dwoma tokenami, które wpłacili dostawcy płynności w zamian za opłaty od swapów. Większość pul działa jako AMM (automated market maker): wycenia swapy na podstawie tego, co sama trzyma, czyli rezerw, zamiast kojarzyć kupujących ze sprzedającymi. Pokazanie, ile zwróci swap, wybór między pulami i wychwycenie różnicy cen zaczynają się tak samo: od odczytu stanu puli przez RPC i zastosowania reguły wyceny tej puli.",
          "Para Uniswap v2 potrzebuje dwóch liczb: `getReserves()` zwraca `reserve0` i `reserve1`, a każda zmiana emituje `Sync`. Sprzedaż `x` tokenów zwraca `x·997·Rout / (Rin·1000 + x·997)`, gdzie `Rin` i `Rout` to rezerwy tokena sprzedawanego i tokena kupowanego, a czynnik 997/1000 odlicza opłatę 0,3%. W bloku 26 297 957 para USDC/WETH miała 9 747 161,55 USDC i 4199,24 WETH (ether opakowany jako token), czyli kurs 2321,17 USDC za WETH, więc jedno [[eth-call|eth_call]] wystarczyło, żeby wycenić 1 WETH na 2313,66 USDC; różnicę tworzą opłata i to, jak sam swap przesuwa proporcję rezerw.",
          "Uniswap v3 pozwala każdemu dostawcy umieścić płynność w wybranym przedziale cen, więc płynność, na którą trafia swap, zmienia się wraz z ceną, a wycena przechodzi od przedziału do przedziału. `slot0()` zwraca `sqrtPriceX96`, czyli pierwiastek kwadratowy ceny pomnożony przez 2 do potęgi 96, oraz bieżący `tick`: tick `i` oznacza cenę 1,0001 do potęgi i, więc sąsiednie ticki dzieli krok 0,01%. `liquidity()` to płynność aktywna przy bieżącej cenie; im jest jej więcej, tym mniej swap przesuwa cenę. Zmienia się ona na zainicjalizowanych tickach, czyli tam, gdzie zaczyna się albo kończy jakiś przedział: oznacza je `tickBitmap(int16)`, a `ticks(int24)` zwraca dla każdego z nich `liquidityNet`, czyli płynność dodawaną albo odejmowaną, gdy cena go przekracza. Sprzedaż 10 000 WETH do puli 0,05% przekroczyła 136 zainicjalizowanych ticków, a każdy z nich oznaczał kolejny odczyt."
        ]
      },
      {
        heading: "Uniswap v4: jeden kontrakt, odczyt po slotach",
        paragraphs: [
          "Uniswap v4 trzyma wszystkie pule w jednym kontrakcie, `PoolManager` pod adresem `0x000000000004444c5dc75cB358380D2e3dE08A90`. Pulę identyfikuje jej `PoolId`, czyli hash [[keccak-256|keccak256]] jej klucza: `currency0`, `currency1` (natywny ether to `address(0)`), `fee`, `tickSpacing` i `hooks`. Nie ma getterów dla poszczególnych pul. `PoolManager.extsload(bytes32)` zwraca dowolne surowe słowo storage, a `StateLibrary` z v4-core mówi, gdzie szukać: pule to mapping (tablica klucz-wartość) w slocie 6, więc stan puli zaczyna się pod `keccak256(poolId . 6)`, czyli pod hashem identyfikatora z dopisaną liczbą 6. To słowo zawiera `slot0`, a `liquidity` leży trzy sloty dalej. Kontrakt `StateView` opakowuje te same odczyty w gettery.",
          "Wszystkie pule v4 emitują logi z adresu `PoolManager`, a id puli jest w `topics[1]` każdego [[event-signature|eventu]], więc jeden filtr [[eth-get-logs|eth_getLogs]] śledzi jedną pulę. Hook to kontrakt podpięty do puli, który uruchamia własny kod wokół swapów: hook z uprawnieniem `beforeSwapReturnDelta` może w trakcie swapu zabrać albo dodać tokeny, a pula, której `fee` wynosi `0x800000`, pozwala hookowi ustalać opłatę osobno dla każdego swapu. Dla takich pul samo `slot0` i mapa ticków nie wystarczą do wyceny swapu, więc w ich przypadku sięga się po [[quoter-contract|quoter]], czyli kontrakt, który sam wykonuje swap, razem z hookiem."
        ]
      },
      {
        heading: "Curve: cena, która zmienia się bez swapów",
        paragraphs: [
          "Pule StableSwap w Curve, przeznaczone dla aktywów, których kurs ma być bliski 1:1, takich jak DAI, USDC i USDT w 3pool, to kontrakty w Vyperze, które przechowują `balances(i)`, `fee()` i współczynnik wzmocnienia (amplification) `A()`; im jest on wyższy, tym bardziej płaska pozostaje cena w pobliżu równowagi. Równanie wyceny rozwiązuje się w pętli, więc zwykle wywołuje się własną funkcję view puli, `get_dy(i, j, dx)`, która zwraca, ile dostaje się za sprzedaż `dx` tokena `i` w zamian za token `j`. `A()` zmienia się liniowo wraz z `block.timestamp` między dwiema zaplanowanymi wartościami, więc wycena może się zmienić między blokami bez żadnego swapu i bez żadnego eventu."
        ]
      },
      {
        heading: "Odpytywanie, mirroring i jeden spójny blok",
        paragraphs: [
          "Odpytywanie (polling) przy każdym nowym headzie, czyli najnowszym bloku, ponownie czyta każdą obserwowaną pulę w jednym batchu [[multicall|Multicall3]], więc jego koszt rośnie z liczbą pul. Mirroring, czyli utrzymywanie lokalnej kopii stanu (mirrora), odczytuje każdą pulę raz, w bloku N, a potem nakłada na nią jej eventy: `Sync` z v2 zastępuje obie rezerwy, `Swap` z v3 niesie nowe `sqrtPriceX96`, `liquidity` i `tick`, a `Mint` i `Burn` korygują `liquidityNet`. Jego koszt rośnie natomiast z aktywnością handlową, dlatego [[searcher|searcherzy]] i [[dex-aggregator|agregatory]], które śledzą tysiące pul, budują mirror z logów z [[eth-subscribe|eth_subscribe]], a rozbieżności korygują okazjonalnym odpytywaniem.",
          "Wszystkie odczyty składające się na jedną wycenę muszą pochodzić z jednego bloku, inaczej wycena łączy ceny, które nigdy nie istniały jednocześnie. Osobne wywołania z `latest` przez [[load-balancer|load balancer]] mogą trafić na węzły na różnych wysokościach, podobnie jak wpisy jednego batcha JSON-RPC, więc trzeba przypiąć [[block-tag|numer albo hash bloku]] albo użyć jednego multicalla; przypięcie najnowszego bloku może trafić na [[head-lag|opóźniony backend]], który odpowie `header not found`. [[reorg|Reorg]] dociera do mirrora jako logi z `removed: true`, a ich wycofanie wymaga wcześniejszego stanu puli, więc mirrory trzymają snapshoty z kilku ostatnich bloków. Niektóre zmiany nie zostawiają żadnego logu: saldo tokena typu rebasing zmienia się bez transferów, więc para v2, która go trzyma, rozjeżdża się ze swoimi rezerwami, dopóki ktoś nie wywoła `sync`."
        ]
      }
    ],
    example: {
      title: "Para v2 i pula v4 odczytane w tym samym bloku",
      note: "Oba odczyty wskazują blok `0x1914665`, więc dwie ceny, 2321,17 w v2 i 2325,14 w v4 przed opłatami, opisują ten sam moment; słowo z v4 pakuje cztery pola, a `liquidity` leży trzy sloty dalej, pod `…bdff`, i odczytuje się je tym samym wywołaniem `extsload`."
    },
    pitfalls: [
      "Wycenianie swapu w v3 tylko na podstawie `slot0` i `liquidity`, co działa poprawnie tylko do chwili, gdy cena dojdzie do następnego zainicjalizowanego ticka.",
      "Szukanie osobnego kontraktu puli v4; pule istnieją wyłącznie jako storage wewnątrz `PoolManager`.",
      "Nakładanie logów w mirrorze bez obsługi `removed: true`, co zostawia rezerwy z bloku, który nie jest już kanoniczny."
    ]
  },
  "quoter-contract": {
    title: "Kontrakty quoter",
    aliases: [
      "quoter",
      "QuoterV2",
      "V4Quoter",
      "quoteExactInputSingle",
      "revert-with-data",
      "kontrakt lens",
      "lens contract",
      "queryBatchSwap",
      "TickLens"
    ],
    summary: "Kontrakt quoter to kontrakt pomocniczy wdrażany tylko po to, żeby wywoływać go przez [[eth-call|eth_call]]: wykonuje prawdziwy swap na aktualnym stanie puli, przechwytuje wynik wewnątrz [[revert|revertu]], więc nic nie zostaje utrwalone, i zwraca dokładną ilość wyjściową oraz szacunek gasu.",
    sections: [
      {
        heading: "Swap, który celowo kończy się revertem",
        paragraphs: [
          "Interfejs, który pokazuje „otrzymasz 2324,58 USDC”, potrzebuje dokładnego wyniku swapu, zanim użytkownik cokolwiek podpisze. Dla puli v3 oznacza to powtórzenie [[dex-pool-reads|przejścia po tickach]] tej puli; quoter sprawia, że pula wykonuje to przejście sama. QuoterV2 od Uniswapa, pod adresem `0x61fFE014bA17989E743c5F6cB21bF9697530B21e` na Ethereum, ma funkcję `quoteExactInputSingle`, która przyjmuje `tokenIn`, `tokenOut`, `amountIn`, `fee` (która pula) i `sqrtPriceLimitX96` (cena, przy której trzeba się zatrzymać, 0 oznacza brak limitu). Wywołuje ona prawdziwą funkcję `swap` puli, wskazując siebie jako odbiorcę. Pula przesuwa cenę, wysyła tokeny wyjściowe i wywołuje `uniswapV3SwapCallback` quotera, żeby pobrać zapłatę. Zamiast zapłacić, callback kończy się revertem z 96 bajtami: ilość wyjściowa, nowa cena, nowy tick. Revert cofa wszystko, co zmienił swap; quoter go przechwytuje, dekoduje bajty i zwraca `amountOut`, `sqrtPriceX96After`, `initializedTicksCrossed` i `gasEstimate` jako zwykłe dane zwrotne, a nie jako błąd.",
          "Ponieważ te funkcje wywołują `swap`, nie mogą być oznaczone jako `view`, czyli etykietą [[abi|ABI]] dla funkcji, które niczego nie zmieniają, a komentarz w interfejsie quotera Uniswapa ostrzega, że „nie są efektywne pod względem gasu i nie powinny być wywoływane on-chain”. Biblioteki czytają tę etykietę i traktują te funkcje jak transakcje, więc żeby wysłać eth_call, w ethers trzeba użyć `staticCall`, a w viem `simulateContract`; wycena wysłana jako prawdziwa transakcja zużywa gas i nic po sobie nie zostawia. `gasEstimate` to różnica `gasleft()` przed wywołaniem puli i po nim, więc obejmuje swap i wychodzący transfer, ale nie obejmuje 21 000 bazowego [[gas|gasu]] transakcji, calldata, routera ani pobrania tokenów wejściowych."
        ]
      },
      {
        heading: "Ta sama sztuczka w v4 i w Balancerze",
        paragraphs: [
          "`V4Quoter` przyjmuje `PoolKey`, czyli pięć pól identyfikujących pulę v4, a do tego `zeroForOne` (true przy sprzedaży `currency0`), `exactAmount` i `hookData`. Swap w v4 działa tylko wewnątrz `PoolManager.unlock`, które robi callback do kontraktu wywołującego, a na końcu wymaga, żeby każdy należny token został zapłacony. Quoter wykonuje swap w tym callbacku, razem z hookami, a potem zamiast zapłacić kończy się revertem z własnym błędem (custom error) `QuoteSwap(uint256)` o selektorze `0xecbd9804` i zwraca `amountOut` oraz `gasEstimate`. Każdy inny revert, w tym `NotEnoughLiquidity(poolId)` z puli, która nie może zrealizować całej kwoty, wraca opakowany w `UnexpectedRevertBytes`. QuoterV2 nie ma takiego sprawdzenia dla exact input: pula, której kończy się płynność, zwraca wynik częściowej realizacji (partial fill).",
          "Vault w Balancerze v2 udostępnia `queryBatchSwap`, który według kodu źródłowego wykonuje swapy, łącznie z hookami pul i aktualizacjami sald, a potem „bezwarunkowo kończy się revertem” z deltami aktywów. Balancer v3 kieruje zapytania przez funkcję `quote` kontraktu Vault, która najpierw sprawdza, czy `tx.origin`, czyli podpisujący transakcję (w eth_call jest to `from`), to adres zerowy, żeby działała tylko wewnątrz wywołania. Geth, Nethermind i Reth używają adresu zerowego, gdy `from` jest pominięte, więc zapytanie działa; jeśli ustawi się `from` na adres użytkownika, kończy się ono revertem `NotStaticCall()`."
        ]
      },
      {
        heading: "Ile kosztuje wycena",
        paragraphs: [
          "Wycena to pełne wykonanie swapu: odczyty storage, jedna iteracja pętli na każdy przekroczony tick, transfery tokenów. W bloku 26 297 957 swap 1 WETH w puli USDC/WETH 0,05% zwrócił 2324,584010 USDC przy jednym przekroczonym ticku i `gasEstimate` równym 92 809; 10 000 WETH przekroczyło 136 ticków i zużyło 3 459 595 gasu. Ten sam swap 1 WETH przez router SwapRouter02 potrzebował według [[eth-estimate-gas|eth_estimateGas]] 144 011 gasu, więc `gasEstimate` pozwala porównywać trasy, ale nie jest limitem gasu. Obliczenia off-chain na lokalnej kopii mapy ticków nie wymagają żadnego wywołania RPC na wycenę, więc [[searcher|searcherzy]] [[dex-pool-reads|mirrorują stan pul]], a quotery zostawiają do kontroli i do pul, których nie potrafią zamodelować.",
          "Smart-order-router Uniswapa używa quoterów zamiast własnej matematyki pul: jego kod źródłowy mówi, że wycena off-chain „wymagałaby pobrania wszystkich danych o tickach dla każdej puli”. Wywołania quoterów grupuje przez `UniswapInterfaceMulticall`, który daje każdemu podwywołaniu własny `gasLimit` i raportuje `gasUsed`. Węzeł ogranicza ilość gasu, jaką może spalić jedno eth_call, czyli swój [[request-cancellation|gas cap]], więc komentarze w kodzie routera każą pilnować, żeby liczba wycen w batchu razy gas na wycenę mieściła się poniżej tego limitu; domyślne wartości w klasie to 150 wycen po najwyżej 1 000 000 gasu, a po błędzie out of gas router ponawia próbę ze 100 wycenami po najwyżej 1 500 000. Bez limitu na każde podwywołanie jedna wycena, która przekracza setki ticków, wyczerpałaby budżet całego batcha."
        ]
      },
      {
        heading: "Kontrakty lens",
        paragraphs: [
          "Quoter to jeden z rodzajów kontraktu lens, czyli kontraktu wdrożonego wyłącznie do odczytu, który pakuje wiele odczytów albo obliczenie w jedno wywołanie i nie przechowuje stanu, więc każdy może wdrożyć lepszy. `getPopulatedTicksInWord(pool, index)` z TickLens zwraca każdy zainicjalizowany tick z jednego słowa bitmapy razem z jego `liquidityNet`; `StateView` dekoduje storage `PoolManager`; `UiPoolDataProviderV3` od Aave zwraca wszystkie rynki pożyczkowe w jednym wywołaniu. `FeeOnTransferDetector` od Uniswapa pożycza token z pary v2 na czas wywołania, mierzy, ile dotarło, próbuje transferu i sprzedaży, a potem kończy się revertem ze 160-bajtową strukturą `TokenFees` z opłatami za kupno i za sprzedaż. Kontrakt lens, którego nikt nie wdrożył, i tak może działać jako [[deployless-call|wywołanie deployless]]."
        ]
      }
    ],
    example: {
      title: "QuoterV2: 1 WETH na USDC przez pulę 0,05%",
      note: "Wywołanie się powiodło i zwróciło zwykłe dane, choć swap w jego wnętrzu zakończył się revertem; zapytanie o 10 000 WETH zwróciło w tym samym bloku 136 przekroczonych ticków i `gasEstimate` równe 3 459 595."
    },
    pitfalls: [
      "Używanie `gasEstimate` jako limitu gasu transakcji; nie obejmuje on intrinsic gas, calldata, logiki routera ani pobrania tokenów wejściowych.",
      "Ufanie wycenie exact input z QuoterV2 dla puli z małą płynnością, bo może ona opisywać częściową realizację i nic o tym nie mówić.",
      "Przekazywanie adresu użytkownika jako `from` do zapytania Balancera v3, które wtedy kończy się revertem `NotStaticCall()`."
    ]
  },
  "dex-aggregator": {
    title: "Agregatory DEX i silniki wycen",
    aliases: [
      "agregator DEX",
      "DEX aggregator",
      "swap aggregator",
      "quote engine",
      "silnik wycen",
      "smart order router",
      "RFQ",
      "wyszukiwanie trasy",
      "route search"
    ],
    summary: "Agregator DEX to silnik wycen (quote engine), który przeszukuje wiele pul i innych źródeł płynności w poszukiwaniu najlepszego sposobu realizacji swapu, sprawdza zwycięską trasę, symulując transakcję samego użytkownika na bieżącym stanie, i zwraca gotową do podpisania transakcję ważną przez krótki czas. Przez to jest jednym z tych użytkowników [[eth-call|eth_call]] ze [[state-override|state overrides]], dla których opóźnienie liczy się najbardziej.",
    sections: [
      {
        heading: "Wyszukiwanie trasy na grafie w cache",
        paragraphs: [
          "Użytkownik, który sprzedaje 1 WETH za USDC, dostaje z każdej [[dex-pool-reads|puli]] inną kwotę, a duże zlecenie dostaje więcej, jeśli się je podzieli, bo cena w puli przesuwa się na niekorzyść swapu tym bardziej, im swap jest większy. Agregator znajduje najlepsze połączenie i zwraca transakcję, która je wykonuje; publiczne przykłady to 1inch, 0x, Velora (dawniej ParaSwap), Odos, KyberSwap, smart-order-router Uniswapa i endpoint wycen CoW Swap. Żądanie wskazuje token sprzedawany, token kupowany, kwotę i zwykle takera, czyli adres, który będzie handlował. Silnik trzyma w pamięci graf: tokeny są w nim wierzchołkami, a pule krawędziami, na których zapisany jest stan puli z cache. Trasa to ścieżka przez ten graf, bezpośrednia (WETH na USDC) albo z przeskokami (WETH na DAI na USDC), a podział (split) wysyła części kwoty kilkoma ścieżkami. Wyszukiwanie działa off-chain, bo odczyt każdej kandydującej puli przy każdym żądaniu wymagałby tysięcy round tripów; RPC utrzymuje graf aktualnym, a potem sprawdza zwycięzcę.",
          "Market maker RFQ (request for quote), czyli firma tradingowa wyceniająca z własnego zapasu tokenów, odpowiada podpisaną, krótko ważną ceną zamiast puli. 0x porównuje takie wyceny z trasami przez pule, a jego zlecenia RFQ muszą zawierać `taker` z żądania, bo podpisane zlecenie może zrealizować tylko adres w nim wskazany. Każda odpowiedź ma termin ważności: wycena z CoW Protocol ma pole `expiration`, a trasa wyceniona w bloku N jest błędna, gdy tylko blok N+1 zmieni jej pule, więc silniki ponownie czytają stan przy każdym nowym bloku."
        ]
      },
      {
        heading: "Weryfikacja zwycięzcy przez symulację",
        paragraphs: [
          "Zanim silnik odpowie, sprawdza, czy trasa działa: uruchamia transakcję routera, którą podpisze użytkownik, jako eth_call z adresu takera, w bloku, na podstawie którego powstała wycena. Router pobiera od takera sprzedawany token przez `transferFrom`, na co token ERC-20 pozwala tylko wtedy, gdy taker ma tę kwotę i wcześniej dał routerowi zgodę (approve), którą token zapisuje jako `allowance[taker][router]`. Nowy użytkownik zwykle nie zrobił ani jednego, ani drugiego, więc zwykłe wywołanie kończy się revertem. Dlatego silnik dodaje [[state-override|state override]], opcjonalny trzeci parametr eth_call, który na to jedno wywołanie podmienia saldo, kod albo słowa storage konta: jego `stateDiff` wpisuje saldo i allowance takera do storage tokena, w sloty znalezione przez [[storage-slot-discovery|wyszukiwanie slotów storage]]. W przykładzie zwykłe wywołanie kończy się revertem z `STF`, czyli komunikatem routera o nieudanym transferze, a wywołanie z nadpisaniem zwraca dokładnie tę kwotę, którą podał [[quoter-contract|quoter]].",
          "Symulacja wyłapuje to, czego nie widzi matematyka pul. Token z opłatą od transferu (fee-on-transfer) zatrzymuje część każdego transferu, więc dostarcza mniej, niż wynika z wyceny, honeypot przepuszcza zakup, ale sprzedaż blokuje revertem, a tokeny wstrzymane (paused) albo z czarną listą adresów kończą się revertem od razu; kod routingu Uniswapa sprawdza tokeny swoim kontraktem lens `FeeOnTransferDetector`. API agregatorów pokazują wynik: 0x zwraca obiekt `issues` z polami `allowance`, `balance` i `simulationIncomplete`, `ignoreChecks` w Velorze wyłącza sprawdzanie salda, allowance i błędów, a `priceQuality` o wartości `verified` w CoW preferuje wyceny, które przeszły symulację, i oznacza je `verified: true`. Sekwencja approve, a potem swap wymaga [[eth-simulate|eth_simulateV1]], a do wyjaśnienia revertu służy `debug_traceCall`."
        ]
      },
      {
        heading: "Obciążenie RPC i to, co je psuje",
        paragraphs: [
          "Obciążenie rośnie razem z liczbą użytkowników i zmiennością rynku: każdy nowy blok unieważnia wyceny w cache, a żądania przychodzą falami. Jedno żądanie użytkownika zwykle zamienia się w kilka batchy [[multicall|multicall]] z wywołaniami quoterów dla pul, których silnik nie potrafi zamodelować, jedno eth_call routera z nadpisaniami i jedno [[eth-estimate-gas|eth_estimateGas]] z tymi samymi nadpisaniami, wszystko na `latest` albo na właśnie wyprodukowanym bloku, a do tego dochodzi strumień logów, który utrzymuje graf aktualnym. Historia ma znaczenie tylko przy backtestach, a budżetem jest opóźnienie: wycena na mainnecie musi wrócić wyraźnie przed upływem 12 sekund między blokami, a rollup z blokami krótszymi niż sekunda zostawia znacznie mniej czasu. Dokumentacja solverów CoW ostrzega, że ich usługi „mogą bardzo mocno obciążać zasoby RPC”. Dlatego silniki trzymają węzły jak najbliżej heada (zobacz [[fastest-head|najszybszy head]]) i mają ten sam profil obciążenia co [[intent-solver|solvery]], [[searcher|searcherzy]] i [[transaction-simulation|symulacja w portfelach]].",
          "To obciążenie psują cztery rzeczy. Gas cap, czyli najwięcej gasu, ile węzeł pozwala spalić jednemu wywołaniu: jedna wycena 10 000 WETH zużyła 3,46 miliona gasu, a domyślna wartość `--rpc.gascap` w Geth to 50 000 000, więc batch piętnastu takich wycen kończy się błędem out of gas. Timeouty: klient, który przestaje czekać, nie przerywa obliczeń w węźle (zobacz [[request-cancellation|anulowanie żądań]]). Dostawcy, którzy usuwają trzeci parametr: nadpisanie jest ignorowane, a symulacja zgłasza revert, którego nie byłoby, gdyby konto zostało zasilone. I rozjechany head: przypięcie najnowszego bloku na endpoincie za [[load-balancer|load balancerem]] zwraca `header not found` z backendu, który jest jeden blok z tyłu."
        ]
      }
    ],
    example: {
      title: "Wycena i weryfikacja 1 WETH na USDC w bloku 26 297 957",
      note: "Cały trik to trzeci parametr: na to jedno wywołanie daje takerowi 1 WETH, a routerowi allowance na 1 WETH, więc prawdziwy kod routera wykonuje się do końca i zgadza się z quoterem. Bez któregokolwiek z kluczy wywołanie znowu kończy się revertem z `STF`; po ustawieniu `amountOutMinimum` o jedną jednostkę powyżej 2324,584010 kończy się revertem `Too little received`, i właśnie tak minimum chroni użytkownika."
    },
    pitfalls: [
      "Weryfikowanie tras wyłącznie na prawdziwym stanie, przez co każda wycena dla użytkownika, który jeszcze nie dał routerowi zgody (approve), kończy się niepowodzeniem.",
      "Nadpisanie salda takera bez allowance albo odwrotnie; `transferFrom` potrzebuje obu i w każdym z tych przypadków kończy się revertem z `STF`.",
      "Zakładanie, że dostawca zastosował nadpisanie, bez jednorazowego sprawdzenia, na przykład przez nadpisanie salda i odczytanie go z powrotem.",
      "Traktowanie gasu zmierzonego przy nadpisaniach jako dokładnego: przy nieograniczonym allowance na WETH, którego `transferFrom` w WETH nigdy nie zmniejsza, ten sam swap oszacowano na 140 432 gasu zamiast 144 011."
    ]
  },
  "price-oracle": {
    title: "Oracle cenowy",
    aliases: [
      "oracle",
      "price oracle",
      "wyrocznia cenowa",
      "Chainlink Data Feeds",
      "latestRoundData",
      "Pyth",
      "oracle TWAP",
      "optimistic oracle",
      "UMA",
      "sequencer uptime feed"
    ],
    summary: "Oracle cenowy (wyrocznia cenowa) to kontrakt, który podaje innym kontraktom fakt, jakiego same nie mogą sprawdzić, zwykle cenę aktywa. Wartość trafia do niego na jeden z trzech sposobów: aktualizacje zapisuje w nim sieć oracle, podpisaną aktualizację wnosi własna [[transaction|transakcja]] użytkownika albo sam oracle uśrednia ceny z handlu on-chain.",
    sections: [
      {
        heading: "Feedy push: proxy, agregator, runda",
        paragraphs: [
          "Kontrakt pożyczkowy potrzebuje dolarowej ceny ETH, żeby ocenić, czy pożyczka jest nadal pokryta zabezpieczeniem, ale [[smart-contract|smart kontrakt]] może czytać tylko stan łańcucha, więc cenę musi tam umieścić oracle. W Chainlink Data Feeds, popularnym modelu push, sieć węzłów zapisuje w łańcuchu każdą aktualizację, a każda para, na przykład ETH/USD, ma osobny feed. Konsumenci czytają z proxy, którego adres nigdy się nie zmienia (dla ETH/USD na mainnecie to `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419`), a proxy przekazuje wywołanie do agregatora, czyli wymienialnego kontraktu, który przechowuje ceny.",
          "Odczyt ceny to jedno [[eth-call|eth_call]] do `latestRoundData()`, które zwraca `roundId`, `answer`, `startedAt`, `updatedAt` i przestarzałe (deprecated) `answeredInRound`. `answer` to liczba całkowita przeskalowana przez `decimals()`, które dla ETH/USD wynosi 8, więc `231608000000` oznacza 2316,08 dolara. Każda aktualizacja to runda o numerze `roundId`.",
          "Agregator jest aktualizowany tylko wtedy, gdy zadziała wyzwalacz (trigger): odchylenie (deviation), dla tego feedu zmiana o 0,5 procent względem zapisanej odpowiedzi, albo heartbeat, dla tego feedu 3600 sekund od ostatniej aktualizacji. W międzyczasie odpowiedź po prostu się starzeje: jeśli ETH zmieni się o 0,4 procent i tak zostanie, feed pokazuje starą cenę nawet przez godzinę. Węzły uzgadniają każdy raport off-chain, a jeden z nich wysyła go jako pojedynczą transakcję. Agregator emituje [[event-log|event]] `AnswerUpdated`, a proxy nie, więc konsumenci logów obserwują agregator."
        ]
      },
      {
        heading: "Feedy pull, TWAP i optimistic oracle",
        paragraphs: [
          "W modelu pull nikt nie zapisuje ceny, dopóki ktoś jej nie potrzebuje. W przypadku Pyth aplikacja pobiera podpisaną cenę przez HTTP z usługi Hermes należącej do Pyth i przekazuje ją we własnej transakcji. Ta transakcja płaci opłatę wyliczoną przez `getUpdateFee(updateData)`, zapisuje cenę przez `updatePriceFeeds` i odczytuje ją przez `getPriceNoOlderThan(feedId, 60)`. Ta funkcja zwraca `price`, `conf` (przedział ufności), `expo` (wykładnik dziesiętny) i `publishTime`, a jeśli cena ma więcej niż 60 sekund, robi revert z błędem `StalePrice`.",
          "Pula giełdy może sama być oracle'em. Pula Uniswap v3 przechowuje cenę jako tick, czyli liczbę całkowitą: tick równy i oznacza cenę 1,0001 do potęgi i. Pula prowadzi też bieżącą sumę ticka pomnożonego przez upływające sekundy. `observe([1800, 0])` zwraca tę sumę sprzed 30 minut i obecną; różnica podzielona przez 1800 to średni tick, czyli cena średnia ważona czasem, TWAP (time-weighted average price). Uśrednianie jest tu obroną: cena zniekształcona na czas jednego 12-sekundowego bloku przesuwa 30-minutowy średni tick tylko o ułamek tego zniekształcenia, 150 razy mniejszy. W bloku 26 281 440 średni tick puli USDC/WETH 0,05 procent wynosił 198 860; ponieważ 1,0001 do tej potęgi to liczba wei WETH przypadająca na jedną milionową USDC, ETH kosztował `1e12 / 1.0001^198860`, czyli około 2312 dolarów wobec 2316,08 z Chainlinka.",
          "Optimistic Oracle V3 od UMA odpowiada na pytania, których nie obejmuje żaden feed. `assertTruth` publikuje twierdzenie (assertion) razem z kaucją (bond), czyli pieniędzmi, które przepadają, jeśli twierdzenie okaże się fałszywe. Twierdzenie zostaje przyjęte, chyba że w wyznaczonym oknie ktoś wywoła `disputeAssertion` z równą kaucją; spór trafia wtedy pod głosowanie stakerów UMA: 24 godziny na fazę commit i 24 na fazę reveal."
        ]
      },
      {
        heading: "Co musi sprawdzić konsument",
        paragraphs: [
          "Oracle tylko przechowuje wartość; to kontrakt, który ją czyta, decyduje, czy jej ufać. Porównuje różnicę między `updatedAt` a `block.timestamp` z heartbeatem danego feedu powiększonym o margines: czterogodzinny limit przy tym feedzie z godzinnym heartbeatem przyjąłby cenę, która przekroczyła heartbeat o trzy godziny. Odrzuca `answer` równe zero lub mniejsze i odczytuje `decimals()`, zamiast zakładać 8.",
          "Na L2 dochodzi jeszcze jedna awaria: gdy [[sequencer|sekwencer]], jedyny operator ustalający kolejność transakcji rollupu, się zatrzyma, nic nie trafia do łańcucha, a ceny przestają się zmieniać. Sequencer uptime feed od Chainlinka odpowiada 0, gdy sekwencer działa, i 1, gdy nie działa, a `startedAt` zapisuje czas ostatniej zmiany. Flaga jest przekazywana z Ethereum przez bridge rollupu, który dostarcza ją przed każdą transakcją wysłaną później. Przykładowy konsument Chainlinka robi revert z `SequencerDown`, a potem przez 3600 sekund po `startedAt` z `GracePeriodNotOver`, żeby pożyczkobiorcy zdążyli uzupełnić zabezpieczenie pożyczek, zanim wznowione zostaną [[liquidation-bot|likwidacje]], czyli przymusowe sprzedaże ich zabezpieczenia. Nowszy łańcuch L2 może nie mieć uptime feedu, bo Chainlink przestał je dodawać; zobacz [[l2-rpc|różnice RPC na L2]]."
        ]
      },
      {
        heading: "Obciążenie RPC po obu stronach",
        paragraphs: [
          "Główny ciężar spada na operatorów węzłów oracle. Węzeł Chainlink śledzi nowe heady i logi przez [[eth-subscribe|subskrypcje]], więc jego główne endpointy potrzebują adresu [[websocket-transport|WebSocket]] `WSURL` obok `HTTPURL`. Węzeł Chainlink oznacza jeden ze swoich endpointów jako niezsynchronizowany, gdy head tego endpointu zostanie o więcej niż pięć bloków w tyle za najlepszym z nich (domyślny `SyncThreshold`), i w tym czasie wysyła odczyty i transakcje przez pozostałe, żeby działać na najświeższym obrazie łańcucha, jaki ma; zobacz [[failover|failover]].",
          "Konsumenci wysyłają głównie odczyty `eth_call` w `latest`, zgrupowane w jedno wywołanie przez [[multicall|Multicall3]]. Wyjątkiem jest historia: żeby sprawdzić, czy dawna likwidacja użyła uczciwej ceny, trzeba znaleźć blok dla danego timestampu z przeszłości, wyszukując [[block-by-timestamp|blok według timestampu]], a potem wywołać w nim `latestRoundData` albo `observe` na [[archive-node|węźle archiwalnym]]."
        ]
      }
    ],
    example: {
      title: "Odczyt ETH/USD z Chainlinka i sprawdzenie wieku ceny",
      note: "`roundId` z proxy łączy dwie liczby: własną rundę agregatora, 35 044, w dolnych 64 bitach, a nad nimi fazę, 7, która rośnie za każdym razem, gdy Chainlink wymienia agregator. `AnswerUpdated` niesie tylko 35 044 i loguje go tylko agregator, więc subskrypcję dla tego feedu kieruje się na adres `0x7d4e…6fb5`. Ta runda była aktualizacją z heartbeatu: trafiła do łańcucha 3636 sekund po poprzedniej i różniła się od niej tylko o 0,15 procent."
    },
    pitfalls: [
      "Odczyt ceny z Pyth przez `getPriceUnsafe` albo ceny z Chainlinka bez sprawdzenia `updatedAt` i traktowanie zamrożonej wartości jak bieżącej.",
      "Pytanie puli Uniswap v3 o TWAP z oknem dłuższym, niż obejmują zapisane w niej obserwacje, co kończy się revertem `OLD`.",
      "Pominięcie sprawdzenia sequencer uptime feedu na L2, przez co likwidacje ruszają po nieaktualnych cenach w chwili, gdy sekwencer wraca."
    ]
  },
  keeper: {
    title: "Keepery i automatyzacja",
    aliases: [
      "keeper",
      "bot keeper",
      "Chainlink Automation",
      "checkUpkeep",
      "performUpkeep",
      "upkeep",
      "Gelato Web3 Functions",
      "bot odbierający nagrody",
      "automatyzacja"
    ],
    summary: "Keeper to usługa off-chain, która obserwuje kontrakty i szuka pracy, jaką może uruchomić tylko ktoś z zewnątrz, na przykład zebrania zysków vaulta (harvest), rozliczenia aukcji, odebrania nagrody albo likwidacji pożyczki, a gdy nadchodzi pora tej pracy, wysyła [[transaction|transakcję]]. Jest potrzebny, bo kontrakt działa tylko wtedy, gdy wywoła go transakcja.",
    sections: [
      {
        heading: "Sprawdzenie off-chain, wykonanie on-chain",
        paragraphs: [
          "W łańcuchu nic nie uruchamia się samo o określonej porze. Vault, który powinien codziennie robić harvest, czyli zbierać i reinwestować zyski, albo aukcja, która powinna się rozliczyć w chwili zakończenia, czeka, aż ktoś wyśle wywołanie. Keeper dzieli każde takie zadanie na dwie części: darmowy odczyt, który rozstrzyga, czy jest coś do zrobienia, i płatny zapis, który to robi. Chainlink Automation zamienił ten podział w interfejs dla każdego zarejestrowanego zadania, które nazywa upkeep: kontrakt implementuje `checkUpkeep(bytes checkData)`, zwracające `(bool upkeepNeeded, bytes performData)`, oraz `performUpkeep(bytes performData)`. Węzły Automation wykonują sprawdzenie przez [[eth-call|eth_call]], które działa bez transakcji i nie kosztuje gasu, więc może przejść w pętli po setkach pozycji; dopiero gdy zwróci `true`, węzły wysyłają `performUpkeep` on-chain.",
          "Modyfikator `cannotExecute` pilnuje, żeby sprawdzenie zostało off-chain: robi revert, chyba że `tx.origin`, czyli konto, które podpisało transakcję, to adres zerowy albo `0x1111…1111`. Nikt nie ma klucza do żadnego z nich, więc żadna prawdziwa transakcja nie przejdzie, a `eth_call` bez `from` działa z `tx.origin` ustawionym na zero. Interfejs ostrzega też, że `performData` nie wolno ufać: `performUpkeep` może wywołać każdy, a stan mógł się zmienić od czasu sprawdzenia. Jeśli dwa keepery uznają, że vault 3 wymaga działania, drugie wykonanie musi stwierdzić, że nie ma już nic do zrobienia, dlatego funkcja sprawdza warunek jeszcze raz."
        ]
      },
      {
        heading: "Gdzie dziś działają keepery",
        paragraphs: [
          "Automation v1.x Chainlink uznał za przestarzałe (deprecated) 30 czerwca 2026, a wersję v2.1 – 31 lipca 2026, i przeniósł użytkowników na workflowy w swoim Chainlink Runtime Environment (CRE). Workflow powtarza dawne sprawdzenie off-chain przez `evmClient.callContract()`, gdy zadziała trigger cron albo trigger logu, a samą pracę wykonuje, wysyłając podpisany raport: kontrakt `KeystoneForwarder` przekazuje go do kontraktu odbiorcy, a ten wywołuje dawne `performUpkeep`. Roboty keeperów Aave w sieciach Gnosis, Linea i innych przeszły na CRE z Gelato, którego usługę automatyzacji Aave nazywa przestarzałą.",
          "PoolTogether V5 to protokół oszczędności z nagrodami (prize savings): zysk z depozytów jest wypłacany jako losowe nagrody, a boty open source odbierają je w imieniu zwycięzców. Bot odbierający nagrody (claimer) wywołuje `isWinner(vault, user, tier, prizeIndex)` puli nagród dla każdego deponenta i każdej nagrody, co daje tysiące odczytów zgrupowanych przez [[multicall|Multicall3]] w jednym bloku, a potem wysyła do kontraktu Claimer jedno wywołanie `claimPrizes` z listą zwycięzców i wartością `minFeePerClaim`. Opłata jest potrącana z każdej nagrody i zmienia się jak w stopniowej aukcji holenderskiej: rośnie z czasem od losowania i spada w miarę odbierania nagród, więc claimery ścigają się, gdy tylko opłata pokryje ich koszt gasu. Wywołanie robi revert z `VrgdaClaimFeeBelowMin`, gdy inni odebrali nagrody wcześniej i opłata spadła poniżej tego minimum; nagroda już odebrana albo po upływie okresu odbioru dodaje tylko event `ClaimError`.",
          "OpenZeppelin wyznaczył 1 lipca 2026 jako datę wyłączenia swojej hostowanej usługi Defender, na której działało wiele keeperów. Jej następcy open source dzielą tę pracę: OpenZeppelin Monitor obserwuje bloki i wywołuje webhook, gdy pasuje wywołanie albo event, a OpenZeppelin Relayer wysyła wynikową transakcję; zobacz [[transaction-relayer|relayery transakcji]]."
        ]
      },
      {
        heading: "Obciążenie RPC",
        paragraphs: [
          "Podstawowe obciążenie to jedno sprawdzenie na zadanie na blok, a prawie każde sprawdzenie odpowiada „nie”. Pięćdziesiąt zadań na mainnecie, po jednym wywołaniu na każdy 12-sekundowy blok, to 360 000 wywołań dziennie; na [[rollup|rollupie]] OP Stack z 2-sekundowymi blokami to 2 160 000. [[eth-subscribe|Subskrypcja]] `newHeads` lepiej napędza pętlę niż odpytywanie (polling) [[eth-block-number|eth_blockNumber]], a jedno wywołanie Multicall3 w przypiętym bloku zamienia pięćdziesiąt żądań w jeden spójny snapshot. Zadania sterowane eventami używają zamiast tego subskrypcji `logs` albo kursora [[eth-get-logs|eth_getLogs]], z backfillem po każdym ponownym połączeniu.",
          "Strona zapisu to mały relayer. Keeper szacuje gas wywołania perform przez [[eth-estimate-gas|eth_estimateGas]], co przy okazji pokazuje, że w tej chwili nie zrobiłoby ono revertu, podpisuje transakcję z [[nonce|nonce]], który sam śledzi, i podnosi opłatę, jeśli transakcja utknie. Płatne zadania przyciągają [[searcher|searcherów]], czyli boty, które konkurują o zyskowne transakcje i mogą przejąć zadanie jako pierwsze, gdy tylko zobaczą transakcję keepera w publicznym mempoolu. Dlatego keepery, które chcą wygrywać, wysyłają przez [[private-rpc|prywatne RPC]] albo w [[mev-bundle|bundlach]]; skrajnym przypadkiem są [[liquidation-bot|boty likwidacyjne]]."
        ]
      },
      {
        heading: "Co nieaktualny endpoint robi z keeperem",
        paragraphs: [
          "Opóźniony węzeł pokazuje keeperowi pracę, która jest już wykonana. Gdy węzeł jest trzy bloki w tyle, `checkUpkeep` wciąż zgłasza vault, w którym inny keeper zrobił harvest dwa bloki temu, a transakcja perform robi revert albo nic nie robi, choć keeper płaci za [[gas|gas]]. Węzły Chainlink przestają używać endpointu, który jest pięć bloków za najlepszym; keeper pisany samodzielnie potrzebuje takiego samego porównania z drugim źródłem, bo [[eth-syncing|eth_syncing]] odpowiada `false` na węźle, który po prostu przestał importować bloki. Zobacz [[head-lag|spójność heada]].",
          "Za [[load-balancer|load balancerem]] sprawdzenie i wykonanie mogą trafić do różnych węzłów, więc ostrożny keeper przypina sprawdzenie do numeru bloku, szacuje gas na tym samym węźle, a perform zakończony revertem zapisuje w logach jako przegrany wyścig, a nie incydent."
        ]
      }
    ],
    example: {
      title: "Jeden cykl keepera na kontrakcie w stylu Automation",
      note: "Krok 2 wyłapuje pracę, która zniknęła przed podpisaniem, ale nic nie wyłapie wyścigu rozstrzygniętego w następnym bloku; dlatego krok 4b to normalny koszt działania, a nie błąd."
    },
    pitfalls: [
      "Ufanie `performData` w `performUpkeep` bez ponownego sprawdzenia stanu, przez co konkurujący keeper albo [[reorg|reorg]] sprawia, że kontrakt działa na podstawie nieaktualnego warunku.",
      "Praca na jednym endpoincie bez porównywania heada, przez co zawieszony węzeł po cichu zatrzymuje wszystkie zadania.",
      "Zostawienie adresu wykonawcy (executor) wyłączonej usługi na allowliście kontraktu, przez co transakcje nowego keepera kończą się revertem."
    ]
  },
  "transaction-simulation": {
    title: "Usługi symulacji transakcji",
    aliases: [
      "symulacja przed podpisem",
      "podgląd transakcji",
      "transaction preview",
      "zmiany aktywów",
      "asset changes",
      "szacowane zmiany sald",
      "Tenderly simulation",
      "Blockaid",
      "red-pill contract",
      "tenderly_simulateTransaction"
    ],
    summary: "Usługa symulacji transakcji wykonuje transakcję, którą portfel ma zaraz podpisać, na bieżącym stanie łańcucha i raportuje, co by ona zrobiła: jakie aktywa wpłyną i wypłyną, jakie zgody (approvals) przyzna, jakie kontrakty wywoła i czy zrobi revert. Dzięki temu człowiek albo silnik bezpieczeństwa może ją ocenić, zanim powstanie jakikolwiek podpis.",
    sections: [
      {
        heading: "Kto symuluje i dla kogo",
        paragraphs: [
          "Portfel chce pokazać człowiekowi, co transakcja zrobi, zanim ten ją podpisze, na przykład „płacisz 0,5 ETH i dostajesz około 1256 USDC”, oraz wyłapać transakcję zbudowaną przez drainera, czyli atakującego, którego kontrakt albo żądanie ma opróżnić portfel podpisującego. MetaMask liczy podgląd zmian sald [[token-standards|tokenów]] na serwerze MetaMask, a jego alerty bezpieczeństwa, domyślnie włączone, wysyłają każde żądanie razem z URL-em dappa i [[chain-id|chain ID]] do serwera MetaMask, gdzie ryzyko oceniają dostawcy, w tym Blockaid. Tenderly udostępnia `tenderly_simulateTransaction` i `tenderly_simulateBundle` w RPC swoich węzłów.",
          "Obciążenie to jedna symulacja na każdy ekran zatwierdzenia transakcji, na headzie, podczas gdy człowiek czeka, żeby kliknąć. Potrzebne są metody tracingu i symulacji, [[state-override|state overrides]] i endpoint, który nie jest opóźniony, bo podgląd z węzła o dwa bloki w tyle opisuje ceny w pulach, których już nie ma. Głęboka historia nie jest potrzebna: [[pruned-node|pruned node]] na headzie odpowie na każdy podgląd. Takie same wymagania mają [[security-monitoring|systemy monitoringu bezpieczeństwa]] i [[dex-aggregator|agregatory DEX]]."
        ]
      },
      {
        heading: "Od wykonania do zmian aktywów",
        paragraphs: [
          "[[eth-simulate|eth_simulateV1]] z `traceTransfers: true` daje większość odpowiedzi w jednym wywołaniu. Jego logi obejmują każdy `Transfer` tokena (którego [[event-signature|topic]] to `0xddf252ad…`; ERC-721 dodaje id tokena jako czwarty topic), `TransferSingle` i `TransferBatch` z ERC-1155 oraz syntetyczne logi `Transfer` z adresu `0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee` dla etheru przeniesionego przez dowolne wywołanie, czego mainnet dziś nie loguje. Zsumowanie logów, w których występuje użytkownik, daje zmiany sald. `Approval` i `ApprovalForAll` zapisują zgodę na to, żeby inny adres przeniósł później tokeny użytkownika, i dla drainera to one są prawdziwym payloadem. EIP-7708, część [[hardfork|aktualizacji sieci]] Amsterdam, działającej na Sepolii od 6 października 2026, a na mainnecie jeszcze niezaplanowanej, sprawia, że każdy transfer etheru emituje prawdziwy log `Transfer` z adresu `0xfffffffffffffffffffffffffffffffffffffffe`, a flaga przestaje wtedy cokolwiek wnosić.",
          "Ścieżka oparta na tracingu to [[debug-api|debug_traceCall]], które ponownie wykonuje wywołanie i raportuje, co działo się w jego wnętrzu. `callTracer` z `withLog: true` zwraca drzewo wywołań z logami każdego z nich na właściwym miejscu, więc wyłapuje [[internal-transaction|transfer wewnętrzny]] trzy wywołania w głąb. `prestateTracer` z `diffMode: true` zwraca obiekty `pre` i `post`, przy czym `post` zawiera tylko pola, które się zmieniły: to diff sald, który bezpośrednio obejmuje ether. Dzięki state overrides można podejrzeć to, czego łańcuch jeszcze nie widział: swap, który najpierw wymaga zgody (approve), można zasymulować, podmieniając slot allowance albo umieszczając oba wywołania w jednym bloku `eth_simulateV1`."
        ]
      },
      {
        heading: "Gdzie podgląd kłamie",
        paragraphs: [
          "Symulacja przewiduje wynik na jednym stanie, a prawdziwa transakcja wykona się po tym wszystkim, co trafi do bloku przed nią. W ataku sandwich bot handluje tuż przed swapem użytkownika i drugi raz tuż po nim, przez co podgląd 1256 USDC zamienia się w wykonanie blisko minimum ustawionego przez użytkownika; stratę ogranicza tylko argument minimalnej kwoty wyjściowej w calldata. Symulacja w `pending` nie pomaga, bo blok pending węzła to zgadywanie na podstawie jego własnego mempoolu, a prywatnego order flow nie ma w żadnym mempoolu; zobacz [[mev|MEV]].",
          "Gorsze są kontrakty, które wykrywają samą symulację: podczas symulacji zachowują się poprawnie, a kradną przy prawdziwym wykonaniu. Badacze z ZenGo nazwali to atakiem red pill. [[eth-call|eth_call]] bez pól opłat działa z `tx.gasprice` równym 0, a [[geth|Geth]] ustawia wtedy również base fee na 0; na mainnecie żadna z tych wartości nie jest możliwa. Bez `from` wartością `tx.origin` jest adres zerowy. Gdy nie podano `gas`, `gasleft()` zaczyna tuż poniżej limitu węzła (w przypadku Getha 50 000 000), daleko ponad 16 777 216, na które EIP-7825 pozwala prawdziwej transakcji.",
          "Kontekst bloku też się nie zgadza. `eth_call` działa na stanie bloku bazowego z jego własnymi `number` i `timestamp`, a `eth_simulateV1` buduje blok potomny, któremu Geth, Nethermind i Reth nadają czas o jeden slot późniejszy, na mainnecie o 12 sekund; prawdziwy blok nie pasuje do żadnego z nich. Opcja Added protection w MetaMasku zamiast tego wymusza symulowany wynik on-chain i robi revert przy niezgodności, kosztem dodatkowego gasu."
        ]
      },
      {
        heading: "Koszt i luka w podpisach",
        paragraphs: [
          "Pełny podgląd to kilka ponownych wykonań: trace, symulacja z transferami i często przebieg ze state overrides, więc [[rpc-provider|providera RPC]] kosztuje kilka razy więcej niż jedno `eth_call`, a wiele endpointów nie obsługuje ani `debug_traceCall`, ani `eth_simulateV1`. Usługi sprawdzają, czy dostępne jest `eth_simulateV1`, a jeśli nie, wracają do `debug_traceCall` i własnego dekodowania; zobacz [[endpoint-capabilities|możliwości endpointu]].",
          "Wiele kradzieży w ogóle omija transakcję: użytkownik tylko podpisuje wiadomość. `permit` z ERC-2612 albo podpis Permit2, o który prosi się przez `eth_signTypedData_v4`, autoryzuje wydawanie środków, ale w chwili podpisu niczego nie przenosi; transfer następuje, gdy spender później wyśle ten podpis. Skanery dekodują więc payload [[eip-712|EIP-712]], odczytując spendera, kwotę i deadline, i mogą zasymulować późniejsze `transferFrom` spendera ze state override, który ustawia allowance, jakie przyznałby podpis; zobacz [[signing-methods|metody podpisywania]]."
        ]
      }
    ],
    example: {
      title: "Zmiany aktywów dla swapu 0,5 ETH z jednego wywołania eth_simulateV1",
      note: "Użytkownika dotyczą tylko pierwszy i ostatni log, więc to z nich powstaje podgląd. Dwa logi z `0xeeee…eeee` istnieją tylko dlatego, że `traceTransfers` jest włączone: na dzisiejszym mainnecie prawdziwy blok pokazuje ruchy etheru routera wyłącznie w trace."
    },
    pitfalls: [
      "Budowanie podglądu z danych zwracanych przez `eth_call`, które nie zawierają logów; zmiany aktywów pochodzą z logów, trace'ów albo diffów stanu.",
      "Pominięcie `traceTransfers` w łańcuchu bez EIP-7708, przez co transakcja, której jedynym efektem jest transfer etheru, w podglądzie wygląda, jakby nic nie robiła.",
      "Pomijanie zgód (approvals) w podsumowaniu, bo żadne saldo się nie zmieniło, choć to nieograniczone `approve` albo `setApprovalForAll` jest właśnie tym, co opróżnia portfel."
    ]
  },
  "nft-marketplace": {
    title: "Marketplace'y NFT",
    aliases: [
      "marketplace NFT",
      "rynek NFT",
      "Seaport",
      "OpenSea",
      "walidacja zleceń",
      "order validation",
      "ownerOf",
      "isApprovedForAll",
      "ERC-2981",
      "TransferSingle"
    ],
    summary: "Marketplace NFT trzyma listingi i oferty jako podpisane zlecenia off-chain i używa węzła, żeby przed pokazaniem albo realizacją zlecenia sprawdzić, czy sprzedający nadal ma dany przedmiot, nadal pozwala kontraktowi marketplace'u go przenosić i nie anulował zlecenia; obrazy i metadane pochodzą z magazynów off-chain, a historia z logów eventów.",
    sections: [
      {
        heading: "Zlecenia to podpisy, rozliczenie to transakcja",
        paragraphs: [
          "NFT to ponumerowany przedmiot w kontrakcie tokena, który stanowi kolekcję: w ERC-721 każdy identyfikator tokena ma jednego właściciela, którego zwraca `ownerOf(tokenId)`; zobacz [[token-standards|standardy tokenów]]. Marketplace pokazuje dla każdego przedmiotu obraz, listingi, oferty i wcześniejsze sprzedaże. W OpenSea i innych marketplace'ach zbudowanych na Seaport, otwartoźródłowym kontrakcie giełdowym, listing jest podpisem, a nie transakcją. Sprzedający podpisuje typowaną wiadomość [[eip-712|EIP-712]], `OrderComponents`, powiązaną z adresem Seaport i z łańcuchem. Wiadomość zawiera offer (czyli NFT), consideration (czyli każdą płatność, łącznie z opłatami i wypłatami dla twórców), okno czasowe, opcjonalny `conduitKey` i bieżący `counter` sprzedającego. Marketplace trzyma ją we własnej bazie danych. Portfel będący smart kontraktem podpisuje zamiast tego przez [[erc-1271|ERC-1271]], co Seaport sprawdza wywołaniem `isValidSignature`.",
          "Nic nie trafia do łańcucha, dopóki kupujący nie wywoła funkcji realizacji (fulfilment), na przykład `fulfillBasicOrder` w Seaport 1.6 pod `0x0000000000000068F116a894984e2DB1123eB395`; ta jeszcze raz sprawdza zlecenie i w jednej transakcji przenosi przedmiot i płatność. Umożliwia to approval, czyli zapis w kontrakcie tokena, że operator może przenosić tokeny właściciela. Sprzedający wywołuje `setApprovalForAll` raz na kolekcję i wskazuje w nim Seaport albo, gdy zlecenia mają conduit key, conduit, czyli kontrakt, któremu Seaport zleca przenoszenie tokenów, na przykład conduit OpenSea pod `0x1E0049783F008A0085193E00003D00cd54003c71`. Od tej chwili nowy listing nie kosztuje [[gas|gasu]], a baza danych zapełnia się zleceniami, których nie da się już wykonać: przedmiot sprzedano gdzie indziej, approval cofnięto, sprzedający wywołał `incrementCounter`, żeby anulować naraz wszystkie otwarte zlecenia, albo minął czas zakończenia."
        ]
      },
      {
        heading: "Sprawdzanie zlecenia przez eth_call",
        paragraphs: [
          "Dlatego marketplace sprawdza każde zlecenie względem bieżącego stanu, zanim je pokaże, i jeszcze raz, zanim kupujący zapłaci za gas. Wystarczą do tego cztery odczyty. `ownerOf(tokenId)` musi zwrócić sprzedającego; w ERC-1155, gdzie adres ma pewną liczbę sztuk każdego identyfikatora, `balanceOf(seller, id)` musi pokrywać ilość ze zlecenia. `isApprovedForAll(seller, operator)` musi zwrócić true dla operatora, którego zlecenie faktycznie używa. `getCounter(seller)` w Seaport musi być równy counterowi zapisanemu w zleceniu. `getOrderStatus(orderHash)` zwraca `isValidated`, `isCancelled`, `totalFilled` i `totalSize`, z których musi wynikać, że zlecenie nie jest anulowane ani w pełni zrealizowane. Okno czasowe musi obejmować timestamp następnego bloku. Strona kolekcji łączy te odczyty dla wszystkich swoich zleceń w jeden [[multicall|multicall]] w jednym bloku.",
          "Autorzy Seaport publikują `SeaportValidator` pod `0x00e5F120f500006757E984F1DED400fc00370000`, który wykonuje te sprawdzenia w jednym eth_call i zwraca ponumerowane kody, na przykład 303 dla „ERC721 not owner of token” i 800 dla anulowanego zlecenia. Najmocniejszym sprawdzeniem jest [[transaction-simulation|symulacja]] zakupu: [[eth-call|eth_call]] funkcji realizacji z adresu kupującego, czyli wykonanie jej bez wysyłania transakcji, w razie potrzeby ze [[state-override|state override]] salda kupującego. Revert ujawnia to, czego nie wychwycą sprawdzenia statyczne, na przykład token, którego hook transferu blokuje tego operatora. Każda odpowiedź jest ważna tylko dla jednego bloku: jeśli sprzedający przeniesie przedmiot w następnym bloku, transakcja kupującego zrobi revert."
        ]
      },
      {
        heading: "Metadane, royalties i historia",
        paragraphs: [
          "`tokenURI(tokenId)`, a w ERC-1155 `uri(id)`, w którym `{id}` zastępuje się identyfikatorem zapisanym jako 64 małe cyfry hex, zwraca tylko wskaźnik: zwykle URI `ipfs://` albo `https://`, czasem URI `data:` z JSON-em wpisanym bezpośrednio; przykład pokazuje ten dla Bored Ape #1. Nazwa, obraz i cechy (traits) leżą pod tym wskaźnikiem, więc marketplace utrzymuje usługę pobierającą metadane i cache obrazów oraz odświeża je, gdy kontrakt wyemituje event `MetadataUpdate` z ERC-4906. Royalties to również odczyt: najpierw wywołuje się `supportsInterface` z [[erc-165|ERC-165]], podając identyfikator interfejsu EIP-2981, `0x2a55205a`, a potem `royaltyInfo(tokenId, salePrice)`, które zwraca odbiorcę i kwotę w jednostkach, w których rozlicza się sama sprzedaż. EIP-2981 pozostawia płatność dobrowolną, a starsze kolekcje nie mają tej funkcji: kontrakt Bored Ape odpowiada na tę sondę `false`.",
          "Historia, czyli minty, sprzedaże i posiadacze w czasie, pochodzi z [[event-log|logów]]. ERC-721 emituje `Transfer` z identyfikatorem tokena jako trzecim indeksowanym parametrem w topics; ERC-1155 emituje `TransferSingle` i `TransferBatch` z identyfikatorami i ilościami w `data`; a batch minty z ERC-2309 emitują jeden `ConsecutiveTransfer` dla całego zakresu identyfikatorów zamiast `Transfer` dla każdego tokena. Sam ERC-721 pozwala kontraktowi przydzielić tokeny podczas jego własnego tworzenia bez żadnego eventu. Cen sprzedaży nie ma w eventach transferu; pochodzą z logu `OrderFulfilled` z Seaport w tej samej transakcji, którego elementy consideration wymieniają każdą płatność. Obciążenie to więc backfill logów od bloku wdrożenia każdej kolekcji plus intensywne odczyty w `latest` do walidacji, jak przy [[address-history|historii adresu]] i w [[block-explorer|eksploratorach bloków]]."
        ]
      }
    ],
    example: {
      title: "Sprawdzenie jednego listingu Seaport w jednym bloku",
      note: "Każdy wiersz to podwywołanie tego samego eth_call, więc własność, approval i status zlecenia opisują blok 26 290 000; symulacja realizacji to sprawdzenie, które wyłapuje to, czego wiersze nie widzą."
    },
    pitfalls: [
      "Pokazywanie listingu, bo jego podpis się weryfikuje, bez sprawdzenia, czy sprzedający nadal ma przedmiot i nadal daje approval operatorowi.",
      "Sprawdzanie `isApprovedForAll(seller, Seaport)` dla zlecenia, które wskazuje conduit key, co daje false dla listingu, który jest w pełni ważny.",
      "Budowanie tabeli właścicieli wyłącznie z logów `Transfer` i pominięcie batch mintów z ERC-2309 oraz przydziałów w trakcie tworzenia kontraktu, które nie emitują `Transfer`.",
      "Wywoływanie `royaltyInfo` bez sondy ERC-165, a potem traktowanie revertu albo śmieci z fallbacku jako royalties twórcy."
    ]
  },
  "governance-voting-power": {
    title: "Siła głosu w przeszłym bloku",
    aliases: [
      "voting power",
      "siła głosu",
      "getPastVotes",
      "ERC20Votes",
      "ERC-5805",
      "ERC-6372",
      "strategie Snapshot",
      "delegacja głosów",
      "snapshot propozycji"
    ],
    summary: "Governance oparte na tokenach waży każdy głos siłą głosu wyborcy w jednym ustalonym punkcie w przeszłości, czyli w snapshocie propozycji. Tę siłę odczytuje się albo z checkpointów, które kontrakt tokena sam przechowuje (`getPastVotes`), albo z sald w tym starym bloku przez [[eth-call|eth_call]] na węźle [[archive-node|archiwalnym]], dzięki czemu każdy, kto przeliczy wynik później, dostanie tę samą liczbę.",
    sections: [
      {
        heading: "Dlaczego głosy liczy się w przeszłości",
        paragraphs: [
          "Aplikacja do governance pokazuje każdą propozycję, siłę głosu każdego adresu w tej propozycji i bieżący wynik. Gdyby siłą głosu było saldo w chwili głosowania, jeden token mógłby zagłosować, przejść do drugiego portfela i zagłosować ponownie, a flash loan, pożyczony i spłacony w ramach jednej transakcji, mógłby na chwilę mieć większość. Dlatego każdy system ustala snapshot. Governor od OpenZeppelin, szeroko używany kontrakt do głosowania on-chain, ustawia go przy tworzeniu propozycji na `clock() + votingDelay()`, udostępnia jako `proposalSnapshot(proposalId)` i waży każdy głos przez `getPastVotes(account, snapshot)` tokena. Aave Governance v3 bierze hash bloku Ethereum tuż sprzed wywołania `activateVoting`. Snapshot, usługa do głosowania off-chain, zapisuje w każdej nowej propozycji numer bloku `snapshot`.",
          "Wynik musi też być powtarzalny: wyborcy, frontendy, audytorzy i sam Governor on-chain muszą nawet po miesiącach dostać tę samą wagę dla tego samego adresu w tym samym snapshocie. To wyklucza odczyt w `latest` i każde wejście, które zależy od tego, który węzeł odpowiedział. Wytyczne Snapshota dla autorów strategii wymagają tego samego: siła głosu ma pochodzić ze snapshotu i nie zmieniać się, dopóki propozycja jest otwarta."
        ]
      },
      {
        heading: "Checkpointy w kontrakcie tokena",
        paragraphs: [
          "W tokenie do głosowania saldo nie jest siłą głosu. Tokeny liczą się dopiero wtedy, gdy posiadacz je zdeleguje, innemu adresowi albo sobie, a delegat głosuje wszystkim, co mu zdelegowano: w przykładzie delegat, który ma około 2066 ENS, dysponuje głosami o wadze około 151 782 ENS. `delegates(account)` zwraca bieżący wybór, a [[event-log|eventy]] `DelegateChanged` i `DelegateVotesChanged` zapisują jego historię. ERC20Votes od OpenZeppelin, implementacja interfejsu ERC-5805, przechowuje też własną przeszłość: za każdym razem, gdy zmienia się waga delegata, dopisuje checkpoint, czyli parę złożoną z punktu w czasie (timepoint) i liczby głosów, do listy w [[contract-storage|storage]]. `getPastVotes(account, timepoint)` przeszukuje tę listę binarnie, a `getPastTotalSupply(timepoint)` robi to samo na potrzeby kworum; tokeny w stylu Compound, takie jak COMP i UNI, oferują `getPriorVotes`.",
          "Dlatego to wywołanie wysyła się z tagiem `latest` i nie potrzeba do niego węzła archiwalnego, bo historia jest w bieżącym stanie. Punkt w czasie, który jeszcze nie minął, kończy się revertem: OpenZeppelin 5 zgłasza `ERC5805FutureLookup`, a przykład pokazuje starszy komunikat z ENS. Punkt w czasie to numer bloku albo czas w sekundach; które z nich, mówią `clock()` i `CLOCK_MODE()` z ERC-6372: `mode=blocknumber&from=default` albo `mode=timestamp`, a ERC-5805 mówi, że token bez tych funkcji, taki jak ENS, liczy bloki. Na Arbitrum `block.number` wewnątrz EVM zwraca przybliżony numer bloku Ethereum, więc przekazanie tam własnego numeru bloku Arbitrum do zegara opartego na numerach bloków odczyta niewłaściwy checkpoint; zobacz [[l2-rpc|różnice RPC na L2]]."
        ]
      },
      {
        heading: "Strategie Snapshota czytają stary stan",
        paragraphs: [
          "Space w Snapshocie, czyli strona do głosowania danego projektu, definiuje siłę głosu jako listę strategii: małych funkcji w score API Snapshota, które dostają adresy wyborców i blok propozycji. Najprostsza, `erc20-balance-of`, wywołuje `balanceOf` przez [[multicall|Multicall]] z `blockTag` ustawionym na ten blok. Większość strategii czyta zwykłe salda, pozycje w stakingu i udziały w pulach płynności, a nie checkpointy, więc każda z nich to eth_call w starym [[block-tag|bloku]], który wymaga endpointu archiwalnego, gdy tylko snapshot jest starszy niż okno niedawnego stanu węzła. Snapshot oczekuje, że strategia wykona najwyżej pięć żądań, skończy w ciągu dziesięciu sekund i obsłuży 500 adresów.",
          "Strategia wielołańcuchowa nie może użyć tego samego numeru bloku, bo blok 26 000 000 na Ethereum nic nie znaczy na Base. Strategia `multichain` w Snapshocie bierze timestamp bloku snapshotu, pyta swoją usługę blockfinder o blok każdej innej sieci z tego czasu i tam czyta każdy łańcuch; [[block-by-timestamp|blok według timestampu]] wyjaśnia, dlaczego konwencja „przed czy po” zmienia wyniki. Głosowania trwają całymi dniami, więc krótkie okno stanu może zacząć zawodzić w trakcie głosowania."
        ]
      },
      {
        heading: "Głosowanie między łańcuchami z dowodami storage",
        paragraphs: [
          "Aave Governance v3 pozwala posiadaczom głosować w tańszych sieciach siłą głosu trzymaną na Ethereum, bez ufania jakiemukolwiek węzłowi. Hash bloku snapshotu dociera do każdej sieci głosowania przez międzyłańcuchowy system wiadomości Aave. Tam ktoś przesyła [[block-header|nagłówek]] tego bloku i [[account-proof|dowód konta]] do kontraktu `DataWarehouse`, który sprawdza nagłówek względem hasha i zapisuje storage root tokena do głosowania, czyli hash będący commitmentem do całego jego storage w tym bloku. Następnie każdy wyborca przesyła [[storage-proof|dowody storage]] slotów swojego salda i delegacji, wygenerowane przez [[eth-get-proof|eth_getProof]] w bloku snapshotu i sprawdzane względem tego roota. Węzeł musi więc serwować dowody dla bloku, który może mieć kilka dni, a to wymaga historycznych trie node'ów."
        ]
      }
    ],
    example: {
      title: "Przeszłe głosy z checkpointów i błędy wokół nich",
      note: "Pierwsze wywołanie jest wysłane z tagiem `latest`, a mimo to odpowiada dla bloku 26 000 000, bo checkpointy są w bieżącym storage; `balanceOf` obok niego wymagał stanu archiwalnego i pokazuje, o ile zdelegowana waga może przewyższać to, co ktoś faktycznie ma."
    },
    pitfalls: [
      "Odczytanie `balanceOf` w bloku snapshotu i nazwanie tego siłą głosu w tokenie ERC20Votes, w którym niezdelegowane tokeny nie niosą żadnych głosów, a delegaci niosą salda innych osób.",
      "Przekazanie numeru bloku do tokena, którego `CLOCK_MODE` to `mode=timestamp`; 26 000 000 sekund to październik 1970, czas sprzed jakiegokolwiek checkpointu, więc każde konto ma zero.",
      "Przetestowanie strategii Snapshota w `latest` i wypuszczenie jej na produkcję, przez co wagi dryfują przez cały czas, gdy propozycja jest otwarta.",
      "Zapisanie błędu z endpointu, który robi pruning, albo cichego przejścia na nowszy stan jako siły głosu konta."
    ]
  },
  "erc-4626": {
    title: "Tokenizowane vaulty (ERC-4626)",
    aliases: [
      "ERC-4626",
      "tokenized vault",
      "tokenizowany vault",
      "udziały w vaulcie",
      "convertToAssets",
      "cena udziału",
      "share price",
      "APY vaulta",
      "atak inflacyjny",
      "inflation attack",
      "previewRedeem"
    ],
    summary: "ERC-4626 to standardowy interfejs vaulta, który przyjmuje jedno aktywo ERC-20 i wydaje za nie udziały (shares), więc każdy może odczytać zasoby vaulta i kurs wymiany udziału na aktywo zwykłymi odczytami [[eth-call|eth_call]], a jego rentowność (yield) zmierzyć, porównując ten kurs w dwóch blokach.",
    sections: [
      {
        heading: "Jeden interfejs dla każdego vaulta",
        paragraphs: [
          "Vault to kontrakt, który zbiera depozyty jednego tokena, na przykład DAI albo USDC, i zarabia nimi, na przykład pożyczając je dalej. Deponujący dostają udziały, czyli własny token ERC-20 vaulta, a w miarę jak pula zarabia, każdy udział można wymienić na coraz więcej tokena bazowego. Aplikacje do vaultów, [[portfolio-tracker|trackery portfolio]] i rynki pożyczkowe, które przyjmują udziały jako zabezpieczenie, muszą wiedzieć, ile udział jest wart i ile zarabia. ERC-4626 ustala funkcje, z których biorą się te liczby. `asset()` wskazuje token bazowy, `totalAssets()` podaje, czym vault zarządza, `convertToShares(assets)` i `convertToAssets(shares)` dają kurs wymiany, a `deposit`, `mint`, `withdraw` i `redeem` przesuwają środki; obok każdej z nich są funkcje view `preview` i `max`. [[event-log|Eventy]] `Deposit` i `Withdraw` zapisują każdy ruch razem z aktywami i udziałami. Vaulty Yearn V3, Vault V2 od Morpho i Savings Dai (sDAI) implementują ten standard, więc jeden kod czytający działa dla wszystkich trzech; zobacz [[token-standards|standardy tokenów]].",
          "Te funkcje view gwarantują co innego. `convertTo*` to wyidealizowany kurs: bez opłat, taki sam dla każdego wywołującego, bez poślizgu (slippage) i zaokrąglony w dół, a jego odczyt nigdy nie kończy się [[revert|revertem]], chyba że przy przepełnieniu. `preview*` symuluje daną akcję teraz, z opłatami. `max*` zwraca maksymalną kwotę, jaką jeden adres może przesunąć, może ją zaniżać i musi zwracać 0, gdy dana akcja jest wyłączona. Dashboardy czytają `convertToAssets` jako cenę, a `previewRedeem` jako to, co posiadacz faktycznie by dostał. EIP każe vaultowi zaokrąglać na swoją korzyść: udziały wydane za depozyt i aktywa wypłacone przy umorzeniu zaokrągla się w dół, a udziały spalone przy wypłacie i aktywa pobrane za mint w górę, więc żaden użytkownik nie może wyciągać wartości przez zaokrąglenia, po jednej najmniejszej jednostce."
        ]
      },
      {
        heading: "Cena udziału i rentowność przez RPC",
        paragraphs: [
          "Cena udziału to tyle, na ile wymienia się jeden cały udział. Kwoty to liczby całkowite w najmniejszej jednostce, więc jeden cały udział to `10 ** decimals()` jednostek, przy czym chodzi o `decimals()` samego vaulta; EIP zaleca, ale nie wymaga, żeby ta wartość była taka sama jak w tokenie bazowym. sDAI ma 18, więc jego cena to `convertToAssets(1e18)`. Rentowność to zmiana tej ceny w czasie: odczytuje się ją w dwóch blokach, dzieli jeden odczyt przez drugi i przelicza na rok według liczby sekund między ich timestampami. Przykład robi to dla sDAI w okresie 30 dni i dokładnie odtwarza 1,25% Dai Savings Rate. Każdy przeszły odczyt to stan w starym bloku, więc wymaga endpointu [[archive-node|archiwalnego]] albo [[partial-archive|częściowego archiwum]] obejmującego to okno, a dashboard, który rysuje rok dziennych punktów dla 200 vaultów, wysyła 73 000 historycznych wywołań, łączonych przez [[multicall|Multicall]].",
          "Stan archiwalny da się obejść na dwa sposoby. Kolektor może od teraz zapisywać cenę udziału w każdym bloku, który śledzi, co nie wymaga niczego historycznego, ale nie daje przeszłości sprzed jego startu. Można też wyprowadzić kurs z eventów: każdy `Deposit` i `Withdraw` niesie aktywa i udziały, więc ich stosunek jest obserwacją ceny, ale tylko wtedy, gdy ktoś coś zrobi, i z domieszką opłat."
        ]
      },
      {
        heading: "Donacje, zaokrąglenia i nietypowe vaulty",
        paragraphs: [
          "Zaokrąglanie w dół otwiera też drogę do ataku inflacyjnego, nazywanego też atakiem przez donację. W pustym vaulcie USDC atakujący wpłaca 1 jednostkę, czyli 0,000001 USDC, za 1 udział, a potem przelewa 10 000 USDC bezpośrednio do vaulta, co podnosi `totalAssets` do 10 000 000 001 jednostek bez mintowania żadnego udziału. Ofiara, która wpłaca 9999 USDC, dostaje 9 999 000 000 × 1 / 10 000 000 001 udziałów, co zaokrągla się do 0, a za jedyny udział atakującego można teraz wypłacić oba depozyty. Implementacja OpenZeppelin przeciwdziała temu wirtualnymi udziałami i aktywami o rozmiarze ustalanym przez `_decimalsOffset()`: kurs liczy się tak, jakby vault zawsze miał dodatkowe udziały i aktywa, których nikt nie posiada, a one przechwytują część każdej donacji, więc atak przestaje się opłacać. Vault V2 od Morpho używa jako wirtualnych udziałów 10 do potęgi 18 minus liczba miejsc dziesiętnych aktywa, więc jego vaulty USDC wydają udziały z 18 miejscami dziesiętnymi. Dla [[security-monitoring|monitoringu bezpieczeństwa]] skok ceny udziału, którego nie wyjaśnia żaden event depozytu ani naliczenia odsetek, wygląda na donację.",
          "Niektóre vaulty naginają interfejs. Vault V2 od Morpho celowo zwraca zero z każdej funkcji `max*`, co naiwny kod czytający bierze za zamknięte depozyty. W Yearn V3 `withdraw` i `redeem` przyjmują `maxLoss` w punktach bazowych (1 punkt to 0,01%), a Yearn opisuje `pricePerShare()` w dokumentacji wyłącznie jako funkcję pomocniczą do użytku off-chain. Sam EIP ostrzega, że `preview*` można zmanipulować, zmieniając warunki on-chain, więc nie jest to bezpieczna [[price-oracle|wyrocznia cenowa]] (oracle)."
        ]
      }
    ],
    example: {
      title: "APY z dwóch odczytów ceny udziału",
      note: "Oba wywołania zadają to samo pytanie, ile jest wart jeden udział, w dwóch przypiętych blokach; timestampy pochodzą z samych bloków, a nigdy z zegara osoby, która uruchomiła zapytanie."
    },
    pitfalls: [
      "Wycena udziału jako `convertToAssets(10 ** asset.decimals())`, gdy udziały mają więcej miejsc dziesiętnych, co w vaulcie USDC z udziałami o 18 miejscach dziesiętnych myli się o czynnik 10 do potęgi 12.",
      "Używanie funkcji `preview` jako on-chainowego źródła ceny, gdy jedna transakcja może ją zarówno przesunąć, jak i odczytać.",
      "Traktowanie zera z `maxDeposit` jako dowodu, że vault jest zamknięty, gdy niektóre vaulty celowo zwracają zero.",
      "Przeliczanie na rok dwóch odczytów w `latest` według czasu z zegara zamiast odczytu w dwóch przypiętych blokach i według ich timestampów."
    ]
  },
  "fork-testing": {
    title: "Fork testing: testy na żywym stanie",
    aliases: [
      "fork testing",
      "testy na forku",
      "fork mainnetu",
      "mainnet fork",
      "--fork-url",
      "--fork-block-number",
      "vm.createSelectFork",
      "cast run",
      "anvil_impersonateAccount",
      "Tenderly Virtual TestNets"
    ],
    summary: "Fork testing uruchamia kod na lokalnym łańcuchu, który startuje ze [[state|stanu]] prawdziwej sieci w wybranym bloku, czyli w bloku forka, i pobiera każde konto i każdy slot storage z endpointu RPC upstream w chwili, gdy wykonanie pierwszy raz po nie sięga. Dzięki temu testy, skrypty i odtworzenia incydentów działają na prawdziwych kontraktach bez wdrażania czegokolwiek.",
    sections: [
      {
        heading: "Skąd fork bierze stan",
        paragraphs: [
          "Test na forku uruchamia kod na prawdziwej sieci w jej obecnym stanie, na przykład swap przez żywe pule albo propozycję wykonaną na prawdziwym skarbcu (treasury). Lokalny łańcuch startuje pusty i zna dwie rzeczy: blok forka i upstream, czyli endpoint RPC prawdziwej sieci. Nagłówek bloku forka odczytuje przez [[eth-get-block-by-number|eth_getBlockByNumber]]. Gdy wykonanie dotyka konta, lokalny łańcuch pyta upstream o saldo, nonce i kod przez [[eth-get-balance|eth_getBalance]], [[eth-get-transaction-count|eth_getTransactionCount]] i [[eth-get-code|eth_getCode]], a dla każdego czytanego slotu storage wywołuje [[eth-get-storage-at|eth_getStorageAt]]. To, co pobrał, zostaje zachowane; zapisy pozostają lokalne. Tak działają `--fork-url` w Anvil razem z `--fork-block-number`, `forge test --fork-url`, cheatcode `vm.createSelectFork(url, blockNumber)` z Foundry, ustawienie `forking` w Hardhat i hostowane Virtual TestNets od Tenderly; zobacz [[local-devnet|lokalne węzły deweloperskie]].",
          "Test kosztuje jedną rundę żądań na każde odrębne konto i jedno żądanie na każdy slot, a swap przez agregator dotyka dziesiątek kontraktów i setek slotów. W logach upstreamu widać dwa zachowania Foundry. Każdy odczyt stanu wskazuje blok forka po hashu, jako [[block-tag|obiekt bloku z EIP-1898]] `{\"blockHash\": …}`, żeby [[reorg|reorg]] na upstreamie nie mógł podmienić stanu pod działającym testem; endpoint, który nie umie serwować stanu po hashu, odrzuca każdy odczyt, a `--fork-state-by-number` przełącza z powrotem na numery. Poza tym przy pierwszym koncie Foundry próbuje też metody `eth_getAccountInfo` z Reth, która zwraca wszystkie trzy pola naraz; upstream na Geth odpowiada `-32601`, czyli method not found, co jest nieszkodliwe."
        ]
      },
      {
        heading: "Stare bloki wymagają archiwum, a determinizm przypięcia bloku",
        paragraphs: [
          "Blok forka decyduje o tym, co musi mieć upstream. W oknie niedawnego stanu [[full-node|pełnego węzła]], w Geth około 128 bloków, odpowie każdy węzeł. Blok z zeszłego miesiąca wymaga stanu historycznego, więc upstream, który jest [[pruned-node|pruned node]], odrzuca pierwszy odczyt błędem `missing trie node`, a test pada w tej linii, która pierwsza dotknęła konta spoza cache. Providerzy często osobno ograniczają odczyty [[archive-node|archiwalne]], z własnym komunikatem błędu. Forkowanie `latest` bez numeru omija kwestię archiwum, ale każde uruchomienie startuje z innego stanu, więc test, który wczoraj przechodził, dziś może nie przejść bez żadnej zmiany w kodzie.",
          "Przypięcie bloku sprawia też, że cache się przydaje. Foundry zapisuje to, co pobrał ze zdalnego endpointu, pod `~/.foundry/cache/rpc/<chain>/<block>` i używa tego ponownie przy następnym uruchomieniu w tym samym bloku (`--no-storage-caching` to wyłącza); Hardhat też cache'uje tylko przypięte forki. W CI zimny cache oznacza tysiące żądań z każdego równoległego joba, więc pipeline'y cache'ują ten katalog z kluczem złożonym z łańcucha i bloku. Gdy provider odpowiada HTTP 429, czyli too many requests, Foundry czeka i ponawia (`--fork-retry-backoff` ustawia pierwsze oczekiwanie), więc [[rate-limits|rate limit]] objawia się wolnymi albo niestabilnymi (flaky) testami, a nie czytelnym błędem."
        ]
      },
      {
        heading: "Przepisywanie stanu",
        paragraphs: [
          "Fork może zrobić to, czego prawdziwy łańcuch odmówi. Impersonacja, przez `anvil_impersonateAccount` albo `hardhat_impersonateAccount`, wysyła transakcje jako dowolny adres bez jego klucza prywatnego, na przykład jako timelock governance, czyli kontrakt, który wykonuje przegłosowane propozycje. `anvil_setBalance` i `anvil_setStorageAt` łatają stan bezpośrednio; wewnątrz testu Foundry to samo robią `vm.prank` i `vm.deal`. `tenderly_setErc20Balance` od Tenderly zapisuje slot salda tokena i nie emituje `Transfer`, a `tenderly_addErc20Balance` emituje syntetyczny event na potrzeby narzędzi, które obserwują eventy. Te metody istnieją tylko na węzłach deweloperskich, więc kod, który od nich zależy, przestaje działać na prawdziwym endpoincie."
        ]
      },
      {
        heading: "Odtwarzanie incydentu",
        paragraphs: [
          "Transakcja o indeksie 5 w bloku wykonała się na stanie pozostawionym przez blok rodzica, uzupełnionym o skutki transakcji od 0 do 4. `cast run <txhash>` odtwarza dokładnie to: forkuje w bloku rodzica, lokalnie odtwarza wcześniejsze transakcje, potem wykonuje docelową i wypisuje pełny [[execution-trace|trace]]. `--quick` pomija wcześniejsze transakcje i ostrzega, że wyniki mogą się różnić od wykonania na żywym łańcuchu. `--debug-trace-transaction` zamiast tego renderuje trace wywołań z `debug_traceTransaction` samego węzła, niczego nie wykonując ponownie, a to wymaga [[debug-api|przestrzeni nazw debug_]]. W teście `vm.createSelectFork(url, txHash)` forkuje w bloku tej transakcji i odtwarza transakcje przed nią, więc exploit można uruchomić ponownie na poprawionym kodzie.",
          "Odtworzenie wymaga więc pełnego bloku, stanu archiwalnego w bloku rodzica, a w przypadku `--debug-trace-transaction` także przestrzeni nazw debug; zespoły reagujące na incydenty i systemy [[security-monitoring|monitoringu bezpieczeństwa]] utrzymują taki endpoint. Dla pojedynczego wywołania tańsza jest [[transaction-simulation|symulacja]] przez eth_call ze [[state-override|state overrides]]: jedno żądanie i żadnego lokalnego EVM. Fork jest właściwym narzędziem, gdy na żywym stanie musi się wykonać sekwencja transakcji, impersonacja albo nowy kod."
        ]
      }
    ],
    example: {
      title: "Jedno wywołanie cast call na forku i to, co zobaczył upstream",
      note: "Jeden `balanceOf` dotknął dwóch kont kontraktów i trzech slotów, bo USDC to proxy: sloty admina i implementacji są czytane przed slotem salda, który leży w mappingu w slocie 9, a każde żądanie o stan wskazuje blok 26 290 000 po jego hashu."
    },
    pitfalls: [
      "Kierowanie CI na endpoint z pruningiem albo z rate limitem i branie `missing trie node` albo HTTP 429 za błąd w testowanym kodzie.",
      "Forkowanie w samym bloku incydentu zamiast w jego rodzicu, co startuje ze stanu, w którym exploit już się wykonał.",
      "Traktowanie odtworzenia z `--quick` jako dowodu, gdy pominięcie wcześniejszych transakcji z bloku może zmienić ceny i salda, które widziała docelowa transakcja."
    ]
  },
  "erc-6492": {
    title: "ERC-6492",
    aliases: [
      "podpis counterfactual",
      "podpis przed wdrożeniem",
      "counterfactual signature",
      "UniversalSigValidator",
      "ValidateSigOffchain",
      "isValidSig",
      "sufiks 0x6492",
      "ERC-8010"
    ],
    summary: "ERC-6492 pozwala portfelowi kontraktowemu, który nie jest jeszcze wdrożony, tworzyć podpisy, które inni mogą zweryfikować: podpis [[erc-1271|ERC-1271]] jest opakowany razem z wywołaniem factory, które wdrożyłoby portfel, i 32-bajtowym magicznym sufiksem, a weryfikujący wykonuje to wdrożenie i sprawdzenie podpisu razem w jednym [[eth-call|eth_call]], którego zmiany są odrzucane.",
    sections: [
      {
        heading: "Problem: portfel, który nie ma jeszcze kodu",
        paragraphs: [
          "Smart konto (smart account) to portfel, który jest [[smart-contract|smart kontraktem]]: o tym, które podpisy się liczą, decyduje jego kod, a nie jeden klucz prywatny, więc strona sprawdzająca jego podpis wywołuje `isValidSignature`, jak definiuje [[erc-1271|ERC-1271]], zamiast `ecrecover`, czyli sprawdzenia opartego na kluczu. Nowe portfele to psują. Ich [[address|adres]] jest counterfactual, czyli wyliczony z góry przez `CREATE2` z adresu kontraktu factory, soli (salt) i init code portfela, więc może przyjmować środki, zanim cokolwiek zostanie tam wdrożone, a portfele [[erc-4337|ERC-4337]] wdrażają kod dopiero razem ze swoją pierwszą UserOperation, czyli odpowiednikiem transakcji w 4337. Użytkownik, który tworzy portfel i od razu się loguje, podpisuje w imieniu adresu bez kodu, a tam `isValidSignature` zwraca `0x`, co odczytuje się jako nieważny podpis. Dokumentacja portfela Coinbase mówi, że na taki przypadek jego podpisy zawierają opakowanie ERC-6492.",
          "Rozwiązanie polega na tym, żeby razem z podpisem wysłać to, co potrzebne do wdrożenia portfela: trzy pola zakodowane w [[abi|ABI]], czyli adres factory, calldata, które wdraża portfel, i podpis, który sprawdzi wdrożony portfel, a po nich 32-bajtowy magiczny sufiks, `0x6492` powtórzone szesnaście razy. Druga postać, dla portfela, który jest już wdrożony, ale musi najpierw wykonać wywołanie takie jak `migrate`, umieszcza cel i calldata tego wywołania w pierwszych dwóch polach jako `prepareTo` i `prepareData`. Sufiks kończy się na `0x92`, a to nie jest poprawna wartość `v`, ostatniego bajtu 65-bajtowego [[ecdsa-signature|podpisu ECDSA]], więc opakowany podpis nie może uchodzić za zwykły."
        ]
      },
      {
        heading: "Kolejność sprawdzeń w jednym wywołaniu deployless",
        paragraphs: [
          "ERC ustala kolejność. Gdy jest sufiks, weryfikujący rozpakowuje podpis, wykonuje wywołanie factory, chyba że adres ma już kod, i wywołuje `isValidSignature` z wewnętrznym podpisem; jeśli to się nie powiedzie, a wywołanie factory zostało pominięte, wykonuje je mimo wszystko jako wywołanie przygotowujące i pyta ponownie. Bez sufiksu adres z kodem przechodzi zwykłe sprawdzenie ERC-1271, a do `ecrecover` trafia tylko adres bez kodu. Sufiks sprawdza się najpierw po to, żeby podpis złożony przed wdrożeniem nadal przechodził weryfikację po nim.",
          "Portfel musi przez chwilę istnieć, nie będąc naprawdę wdrożonym, więc wywołanie factory i sprawdzenie działają w jednym eth_call, które odrzuca wynikowy stan. Walidator też nie musi być wdrożony: w [[deployless-call|wywołaniu deployless]] (bez wdrażania kontraktu) referencyjny kontrakt `ValidateSigOffchain` trafia do pola `data` w eth_call, bez `to`, jako init code, a po nim zakodowane w ABI adres podpisującego, hash i podpis. Jego konstruktor tworzy `UniversalSigValidator`, wykonuje sprawdzenia i zwraca `0x01` dla ważnego podpisu albo `0x00` dla nieważnego. `verifyHash` z viem, na którym opierają się `verifyMessage` i `verifySiweMessage`, wysyła to wywołanie, chyba że dla łańcucha skonfigurowano wdrożony walidator; wtedy wywołuje zamiast tego jego `isValidSig`."
        ]
      },
      {
        heading: "Od czego zależy odpowiedź",
        paragraphs: [
          "Odpowiedź obowiązuje w konkretnym [[block-tag|bloku]], bo sprawdzenie czyta stan portfela. Gdy portfel już istnieje, weryfikujący pyta działający kontrakt, więc opakowany podpis złożony przed wdrożeniem przestaje przechodzić weryfikację, jeśli od tego czasu zmienili się właściciele. ERC ostrzega też przed atakiem replay (ponownym użyciem podpisu): jeśli właściciel wdroży portfel na Base i wymieni klucz, który wyciekł, podpisy starym kluczem nie przejdą na Base, ale nadal przejdą na każdym łańcuchu, gdzie to samo wywołanie factory wdrożyłoby ten sam adres ze starym właścicielem. Zapobiega temu powiązanie podpisanej wiadomości z [[chain-id|chain ID]].",
          "Płatności wykonują to samo sprawdzenie. Referencyjny facilitator [[x402|x402]], który rozlicza płatności HTTP 402 w imieniu sprzedawców, weryfikuje podpisany transfer USDC [[eip-3009|EIP-3009]] z niewdrożonego portfela w jednym eth_call przez [[multicall|Multicall3]], które wykonuje wywołanie factory, a potem `transferWithAuthorization`. Przy rozliczeniu wdraża portfel prawdziwą transakcją, ale tylko dla factory z listy `eip6492AllowedFactories`, domyślnie pustej; inaczej każdy płatnik mógłby kazać mu płacić za gas dowolnego calldata. Potem pomija drugą symulację, bo endpoint za [[load-balancer|load balancerem]] może odpowiedzieć z repliki, która jeszcze nie widziała wdrożenia."
        ]
      },
      {
        heading: "Konta EIP-7702",
        paragraphs: [
          "[[eip-7702|EIP-7702]] pozwala kontu kontrolowanemu kluczem delegować do kontraktu: jego kod staje się 23-bajtowym znacznikiem delegacji (designator) wskazującym na ten kontrakt, więc referencyjny walidator przekazuje nawet zwykły 65-bajtowy podpis do `isValidSignature`, które uruchamia kod delegata. Jeśli delegat nie implementuje ERC-1271, sprawdzenie robi revert z `ERC1271Revert` i nigdy nie dochodzi do `ecrecover`. `verifyHash` z viem w domyślnym trybie `auto` awaryjnie sięga po `ecrecover`. Facilitator x402 celowo tego nie robi, bo FiatToken v2.2 od USDC również kieruje podpisujących z kodem do ERC-1271 i odrzuciłby on-chain płatność, którą zaakceptowała ścieżka awaryjna. ERC-8010, otwarta propozycja, to odpowiednik ERC-6492 dla delegacji podpisanej, ale jeszcze nieobecnej w łańcuchu: eth_call niesie ją jako `authorizationList`, którą endpoint musi zastosować."
        ]
      }
    ],
    example: {
      title: "Opakowany podpis, część po części, i jego weryfikacja",
      note: "Wewnętrzne 65 bajtów to właśnie to, co sprawdzi `isValidSignature` wdrożonego konta; przed wdrożeniem bezpośrednie wywołanie zwraca `0x`, a `0x01` zwraca tylko wywołanie deployless, które najpierw uruchamia factory."
    },
    pitfalls: [
      "Odrzucenie podpisu, bo [[eth-get-code|eth_getCode]] zwraca `0x`, choć podpis kończy się sufiksem `0x6492`, a konto po prostu nie jest jeszcze wdrożone.",
      "Wykonanie sprawdzenia ERC-1271 przed szukaniem sufiksu, przez co po wdrożeniu do `isValidSignature` trafia całe opakowanie i weryfikacja się nie udaje.",
      "Wykonywanie wywołania factory z opakowania jako prawdziwej transakcji dla dowolnego factory, co pozwala podpisującemu wybrać calldata, za którego wykonanie płaci weryfikujący."
    ]
  },
  x402: {
    title: "x402",
    aliases: [
      "HTTP 402",
      "402 Payment Required",
      "PAYMENT-SIGNATURE",
      "PAYMENT-REQUIRED",
      "facilitator x402",
      "X-PAYMENT",
      "płatność za żądanie",
      "pay per request"
    ],
    summary: "x402 to otwarty protokół płatności oparty na statusie HTTP `402 Payment Required`: serwer odpowiada na nieopłacone żądanie swoją ceną, klient ponawia żądanie z podpisaną autoryzacją tokena, zwykle transferem USDC [[eip-3009|EIP-3009]], a usługa zwana facilitatorem weryfikuje tę autoryzację i rozlicza ją on-chain, płacąc za gas.",
    sections: [
      {
        heading: "Wymiana przez HTTP",
        paragraphs: [
          "x402 pozwala serwerowi pobrać opłatę za pojedyncze żądanie HTTP, w tokenie takim jak USDC, w ramach samego HTTP; agenci AI płacący samodzielnie to jedno z zastosowań wymienionych w specyfikacji. Biorą w tym udział trzy strony: klient, który płaci, serwer zasobów (resource server), który sprzedaje, oraz facilitator, czyli usługa, która w imieniu serwera weryfikuje i rozlicza płatności on-chain, żeby żadna ze stron nie musiała myśleć o gasie ani RPC. Ta lekcja opisuje wersję 2, wyspecyfikowaną w repozytorium `x402-foundation/x402`. Serwer, który chce zapłaty, odpowiada `402` z nagłówkiem `PAYMENT-REQUIRED`: to JSON zakodowany w base64 z polami `x402Version`, `resource` i tablicą `accepts`.",
          "Każdy wpis w `accepts` to jeden sposób zapłaty. `scheme` określa metodę, na przykład `exact` dla stałej ceny. `network` wskazuje łańcuch jako identyfikator CAIP-2, czyli niezależną od łańcucha parę `namespace:reference`, więc Base, [[chain-id|chain ID]] 8453, to `eip155:8453`. `amount` jest podawane w najmniejszej jednostce tokena, `asset` to kontrakt tokena, `payTo` to odbiorca, `maxTimeoutSeconds` to czas na dokończenie płatności, a `extra` zawiera `name` i `version` z domeny [[eip-712|EIP-712]] tokena, potrzebne do podpisu.",
          "Klient wybiera wpis i podpisuje `TransferWithAuthorization` z EIP-3009, czyli wiadomość „przenieś tyle tego tokena ode mnie na ten adres w tym oknie czasowym”, którą potem może wysłać każdy. Jej `to` to `payTo`, `value` równa się `amount`, a klient referencyjny ustawia jej wygaśnięcie na `maxTimeoutSeconds` od teraz. Klient ponawia żądanie z nagłówkiem `PAYMENT-SIGNATURE`, który zawiera `accepted`, czyli wybrany wpis, oraz `payload`, czyli podpis i sześć pól autoryzacji. Gdy płatność się powiedzie, serwer zwraca zasób z nagłówkiem `PAYMENT-RESPONSE`, który podaje hash transakcji rozliczenia, `transaction`, oraz `payer`. Wersja 1, wciąż obecna w starszym kodzie, używała nagłówków `X-PAYMENT` i pola `maxAmountRequired`, a wymagania umieszczała w body odpowiedzi 402."
        ]
      },
      {
        heading: "Najpierw weryfikacja, potem rozliczenie",
        paragraphs: [
          "Facilitator to usługa HTTP z `POST /verify`, `POST /settle` i `GET /supported`. Dla `exact` z EIP-3009 weryfikacja sprawdza, czy z podpisu odzyskuje się adres `from`, czy płatnik ma dość tokenów oraz czy `to`, `value` i okno ważności pasują do wybranego wpisu, a potem symuluje `transferWithAuthorization` przez [[eth-call|eth_call]]. Referencyjny facilitator dodaje trzy sprawdzenia. Jedno wywołanie [[eth-get-code|eth_getCode]] odróżnia zwykłe konto z kluczem od kontraktu albo konta z delegacją; [[erc-6492|niewdrożony portfel]] też nie ma kodu, więc rozpoznaje się go po sufiksie ERC-6492 w jego podpisie. `validBefore` wypadające za mniej niż sześć sekund jest odrzucane, podobnie jak `asset` bez kodu, bo eth_call na pusty adres kończy się sukcesem i nic nie zwraca, więc symulacja by przeszła.",
          "Rozliczenie wysyła `transferWithAuthorization` z własnego konta facilitatora, czeka na [[transaction-receipt|receipt]] i sprawdza, czy log `Transfer` wskazuje właściwego płatnika, odbiorcę i kwotę. Domyślna kolejność to weryfikacja, obsłużenie żądania, a potem rozliczenie, więc środki przechodzą dopiero po wytworzeniu zasobu. Jeśli transakcja została rozgłoszona, ale receipt nie dotarł na czas, facilitator może odpowiedzieć `settlement_pending` z hashem, żeby wywołujący sprawdził go w łańcuchu.",
          "Za tokeny bez EIP-3009 płaci się przez Permit2, kontrakt Uniswapa do zgód opartych na podpisach, oraz przez `x402ExactPermit2Proxy` pod adresem `0x402085c248EeA27D92E8b30b2C58ed07f9E20001`, który pozwala wysłać środki wyłącznie do odbiorcy. Schemat `upto` rozlicza kwotę naliczaną według zużycia, na przykład za generowanie tokenów przez LLM, do podpisanego maksimum; używa wyłącznie Permit2, bo autoryzacja EIP-3009 ustala kwotę na sztywno. `batch-settlement` używa escrow i voucherów off-chain, więc sprzedawca realizuje wiele drobnych opłat w jednym batchu."
        ]
      },
      {
        heading: "Obciążenie RPC w tle",
        paragraphs: [
          "Każda płatność kosztuje facilitatora kilka wywołań w łańcuchu płatności: eth_getCode, jedną albo dwie symulacje eth_call, [[eth-send-raw-transaction|eth_sendRawTransaction]] i odpytywanie o receipt. Za gas płaci z hot walleta, czyli klucza trzymanego online, i zarządza jego [[nonce|nonce]] tak jak każdy [[transaction-relayer|relayer transakcji]]. W domyślnym przepływie odpowiedź HTTP dla kupującego czeka na ten receipt, więc czas bloku i [[head-lag|opóźnienie heada]] znajdują się na ścieżce żądania: na Base, gdzie w październiku 2026 bloki pojawiają się co 2 sekundy, rozliczenie dodaje sekundy do każdego płatnego żądania.",
          "W ten sposób sprzedaje się też samo RPC. Quicknode opisuje w dokumentacji gateway w wersji alfa, w którym nieopłacony POST JSON-RPC na `https://x402.quicknode.com/base-mainnet` dostaje 402, a Goldsky opisuje płatności x402 za swoje Edge RPC. Jedna transakcja rozliczenia może kosztować więcej gasu, niż jest warte jedno żądanie, więc obie firmy sprzedają też hurtowo: płatność zasila przedpłacone saldo albo kupuje pakiet kredytów powiązany z tokenem sesji, a kolejne wywołania go zużywają. To ten sam kompromis między rozliczaniem każdej płatności osobno a łączeniem ich w batche, który podejmują systemy [[stablecoin-payments|płatności stablecoinami]]."
        ]
      }
    ],
    example: {
      title: "Płatność za jedno wywołanie JSON-RPC na Base",
      note: "`1000` to 0,001 USDC w jednostkach z sześcioma miejscami po przecinku. Krok verify u facilitatora porównuje autoryzację z wybranym wpisem: `to` musi być równe `payTo`, `value` musi być równe `amount`, a `validBefore`, które klient ustawił na teraz plus `maxTimeoutSeconds`, musi wciąż być co najmniej 6 sekund w przyszłości. Dokumentacja x402 od Quicknode pokazuje ten sam kształt: POST z `eth_blockNumber` na jej endpoint `base-mainnet`."
    },
    pitfalls: [
      "Odczytywanie `amount` jako liczby całych tokenów; to wartość w najmniejszej jednostce tokena, więc `10000` to 0,01 USDC.",
      "Hardkodowanie domeny EIP-712 zamiast użycia `extra.name` i `extra.version`; USDC to `USD Coin` na Base, ale `USDC` na Base Sepolia, a zła nazwa kończy się błędem `invalid_exact_evm_payload_signature`.",
      "Reagowanie na `settlement_pending` prośbą do kupującego o nową autoryzację, co pobiera opłatę dwa razy, jeśli pierwsza transakcja trafi do bloku; najpierw trzeba sprawdzić hash w łańcuchu.",
      "Udostępnianie płatnej ścieżki przeglądarkom bez wpisania `PAYMENT-REQUIRED` do `Access-Control-Expose-Headers`, przez co klient widzi 402, ale nie może odczytać ceny; zobacz [[cors|CORS]]."
    ]
  },
  "onchain-agents": {
    title: "Autonomiczni agenci onchain",
    aliases: ["agent AI z portfelem", "portfel agenta AI", "agent LLM", "agent wallet", "AgentKit", "Olas", "serwer MCP", "płatności agentów"],
    summary: "Agent onchain to program, często sterowany przez duży model językowy (LLM), który odczytuje stan łańcucha przez RPC, decyduje, co zrobić, a potem podpisuje i wysyła [[transaction|transakcje]] bez zatwierdzania każdej z nich przez człowieka. Jego bezpieczeństwo zależy więc od narzędzi, które dostaje, od uprawnień, jakie daje jego klucz, i od sprawdzeń, które nie zależą od modelu.",
    sections: [
      {
        heading: "Odczyt, decyzja, działanie",
        paragraphs: [
          "Pętla jest taka sama jak w bocie tradingowym: odczyt sald, cen albo eventów przez [[eth-call|eth_call]], [[eth-get-balance|eth_getBalance]] i [[eth-get-logs|eth_getLogs]], decyzja, podpisanie i wysłanie transakcji. Nowy jest ten, kto podejmuje decyzję. Duży model językowy nigdy sam nie wywołuje węzła. Program, który go hostuje, oferuje mu narzędzia (tools), czyli nazwane funkcje, o których uruchomienie z argumentami model może poprosić, i uruchamia to, które model wybierze. Popularnym sposobem ich udostępniania jest Model Context Protocol (MCP): serwer wymienia narzędzia przez `tools/list`, każde z polami `name`, `description` i `inputSchema`, czyli JSON Schema argumentów, a host wywołuje wybrane przez `tools/call`. Komunikaty MCP to też [[json-rpc|JSON-RPC 2.0]], ale warstwę wyżej: żądanie wskazuje narzędzie, a serwer MCP zamienia je na żądanie Ethereum do węzła.",
          "Coinbase AgentKit to jeden z zestawów narzędzi zbudowanych w ten sposób. Narzędziami są w nim action providers: transfery ERC-20, swapy, płatności [[x402|x402]]. Klucz trzymają wallet providers: CDP od Coinbase, Privy, ZeroDev albo zwykły klient viem. Rozszerzenia (extensions) podłączają narzędzia do MCP, LangChain albo Vercel AI SDK. Provider viem szacuje gas przez [[eth-estimate-gas|eth_estimateGas]] i domyślnie mnoży oszacowanie przez 1,2.",
          "Usługi Olas, zbudowane we frameworku Open Autonomy, rozkładają jednego agenta na kilka instancji, które mogą uruchamiać niezależni operatorzy, więc żadna pojedyncza instancja nie może działać sama. Instancje uzgadniają każdy krok przez warstwę konsensusu zbudowaną na Tendermincie, silniku replikacji, który nadal osiąga zgodę, nawet gdy część uczestników zawodzi albo kłamie. Wymagana liczba (threshold) instancji podpisuje transakcję z Safe'a. Safe to multisig, czyli kontrakt portfela, który wykonuje transakcję tylko przy wystarczającej liczbie podpisów właścicieli. Transakcję wysyła keeper wskazany przez instancje, a pozostałe instancje sprawdzają, czy została wykonana. Każda instancja łączy się z łańcuchem przez własny endpoint RPC: URL zapisany pod `address` we wpisie `ledger_apis` jej połączenia `valory/ledger`, obok `chain_id`."
        ]
      },
      {
        heading: "Ograniczanie tego, co może klucz",
        paragraphs: [
          "Model nie odróżnia niezawodnie instrukcji od danych: tekst, który czyta, może nim sterować tak samo jak prompt operatora. Granicą bezpieczeństwa jest więc klucz, a nie prompt. Dokumentacja AgentKit sama mówi, że nie uzależnia transferów od zgody człowieka, nie wymusza limitów wydatków ani allowlisty adresów docelowych i zostawia to deweloperowi. Typową odpowiedzią są ograniczone uprawnienia. Hot wallet, czyli klucz trzymany online, ma na saldzie tylko tyle, ile agent może stracić. Smart konto z [[erc-4337|ERC-4337]] może przyjąć session key (klucz sesyjny), czyli drugi klucz, który konto honoruje tylko dla wskazanych kontraktów, funkcji i kwot, do czasu wygaśnięcia. Istniejące konto kontrolowane kluczem może dostać te same zasady przez [[eip-7702|delegację]] do takiej implementacji konta.",
          "Dwa standardy, wciąż w statusie Draft, dają takim uprawnieniom interfejs portfela. ERC-7715 dodaje `wallet_requestExecutionPermissions`, dzięki czemu aplikacja może poprosić portfel użytkownika o uprawnienie o ograniczonym zakresie, na przykład `erc20-token-allowance` z regułą `expiry`. ERC-7710 określa, jak posiadacz z niego korzysta, przez `redeemDelegations` w delegation managerze, a schemat `exact` z x402 przyjmuje taką delegację jako sposób płatności. Limity mogą też siedzieć w środowisku uruchomieniowym agenta: provider x402 w AgentKit płaci tylko na zarejestrowane URL-e usług, tylko w USDC i najwyżej `maxPaymentUsdc` za żądanie, domyślnie 1 USDC."
        ]
      },
      {
        heading: "Symuluj przed wysłaniem, sprawdzaj, zanim uwierzysz",
        paragraphs: [
          "Przed podpisaniem strażnik (guard), który nie jest modelem, symuluje dokładnie tę transakcję w przypiętym bloku przez eth_call albo [[eth-simulate|eth_simulateV1]] i porównuje wynik z intencją: prośba o wysłanie 25 USDC powinna dać jeden [[event-log|log]] `Transfer` na `25000000` jednostek z adresu agenta i nic więcej. To [[transaction-simulation|symulacja transakcji]] użyta jako hamulec. Jest sprawdzeniem, a nie gwarancją: stan może się zmienić, zanim transakcja trafi do bloku, a kontrakt może się wtedy zachować inaczej.",
          "Wszystko, w co agent wierzy, pochodzi z odpowiedzi RPC, a te mogą go wprowadzić w błąd na dwa sposoby. Nieaktualny albo nieuczciwy endpoint daje modelowi fałszywy obraz; odczyt przy `finalized` albo porównanie z drugim endpointem, jak w [[verified-rpc|weryfikowanym RPC]], ogranicza to ryzyko. Poza tym dane z łańcucha to niezaufany tekst: `name()` tokenu albo metadane NFT mogą zawierać instrukcje, a każdy kontrakt może zwracać `USDC` z `symbol()`. Prompt injection, czyli tekst podrzucony tak, żeby model odczytał go jako polecenie, zamienia takie dane w transakcję, więc tożsamość tokenu musi pochodzić z allowlisty adresów, nigdy z nazw."
        ]
      }
    ],
    example: {
      title: "Jeden chroniony transfer krok po kroku",
      note: "Kroki 4 i 5 działają poza modelem; model może zaproponować cokolwiek, ale podpisany zostaje tylko transfer, który przejdzie allowlistę, limit i symulację, a session key ogranicza szkody, jeśli wszystkie trzy zawiodą."
    },
    pitfalls: [
      "Danie agentowi klucza do skarbca (treasury) i poleganie na tym, że prompt utrzyma go w granicach; wstrzyknięty tekst może sięgnąć do każdego narzędzia, którego może użyć ten klucz.",
      "Wybieranie tokenów albo kontrahentów po symbolu lub nazwie odczytanej z łańcucha, co pozwala dowolnemu kontraktowi udawać USDC.",
      "Traktowanie udanej symulacji przy `latest` jak gwarancji; stan może się zmienić przed włączeniem do bloku, więc limity muszą obowiązywać także na łańcuchu.",
      "Pozwalanie kilku procesom agenta podpisywać jednym kluczem bez wspólnego źródła [[nonce|nonce]], przez co ich transakcje nawzajem się zastępują albo blokują.",
      "Dopuszczanie płatności x402 do każdej usługi, którą agent znajdzie, bez allowlisty i bez limitu na żądanie."
    ]
  }
};
