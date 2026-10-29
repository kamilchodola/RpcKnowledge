// Polish text for the Nodes & networking lessons, keyed by topic id. Only the words: ids, link
// targets, code, related topics, and sources come from data/nodes.js.
export const topics = {
  "full-node": {
    title: "Pełny węzeł",
    aliases: ["full node", "pełny klient", "węzeł walidujący", "węzeł samodzielnie weryfikujący łańcuch"],
    summary: "Pełny węzeł uruchamia [[execution-client|klienta wykonawczego]] i [[consensus-client|klienta konsensusu]], żeby walidować dane łańcucha i obsługiwać RPC na podstawie stanu utrzymywanego lokalnie.",
    sections: [
      {
        heading: "Co znaczy „pełny”",
        paragraphs: [
          "Pełny węzeł to system dwóch współpracujących klientów, a nie jedna konkretna binarka. Klient wykonawczy waliduje transakcje, wykonuje bloki i utrzymuje bieżący [[state|stan]] kont i kontraktów. Klient konsensusu śledzi bloki beacon, atestacje, [[fork-choice|fork choice]] i [[finality|finalność]]. Klienci wymieniają payloady przez uwierzytelniane [[engine-api|Engine API]], a każdy z nich uczestniczy we własnej sieci peer-to-peer.",
          "Węzeł może odpowiadać na wywołania [[json-rpc|JSON-RPC]] aplikacji na podstawie danych, które sam zweryfikował albo odtworzył lokalnie. Może odczytać bieżący head, symulować wywołania, sprawdzać receipty i przyjmować podpisane transakcje, nie prosząc hostowanego dostawcy, żeby poręczył za odpowiedź. Ta niezależność jest głównym powodem, żeby uruchomić własny węzeł, obok prywatności i odporności sieci."
        ]
      },
      {
        heading: "Walidacja i retencja",
        paragraphs: [
          "„Pełny” nie znaczy, że każdy bajt od bloku genesis zostaje na dysku. Większość konfiguracji pełnego węzła usuwa stary stan albo trzyma tylko niedawne okno danych do obsługi zapytań, zachowując dość informacji o blokach i stanie, żeby śledzić łańcuch. Węzeł może więc walidować łańcuch i odpowiadać na bieżące [[eth-call|eth_call]], a jednocześnie nie odpowiedzieć na wywołanie dla bardzo starego bloku. Retencja to osobny wymiar, niezależny od walidacji.",
          "[[archive-node|Węzeł archiwalny]] zachowuje znacznie więcej historycznego stanu, a [[pruned-node|pruned node]] celowo usuwa wybrane dane. Pełny węzeł może odbudować część stanu przez ponowne wykonanie bloków, ale bywa to kosztowne i nie musi przywrócić każdej specyficznej dla klienta możliwości tracingu czy generowania [[eth-get-proof|dowodów]]. Przy każdej gwarancji, którą daje usługa, warto zapisać klienta, tryb synchronizacji, tryb pruningu i przetestowany zakres bloków."
        ]
      },
      {
        heading: "Wdrożenie w praktyce",
        paragraphs: [
          "Klienta wykonawczego i klienta konsensusu warto uruchamiać na dyskach i CPU dobranych do ich obciążenia, Engine API trzymać w sieci prywatnej i wystawiać tylko te publiczne przestrzenie nazw, których potrzebują aplikacje. Head wykonawczy, head konsensusu, sfinalizowany checkpoint, liczbę peerów, obciążenie bazy danych i status payloadów trzeba monitorować razem. Listener HTTP może odpowiadać, kiedy węzeł się synchronizuje albo kiedy jedna połowa pary stoi.",
          "Dla [[indexer|indeksera]] pełny węzeł jest źródłem zwalidowanych danych łańcucha, a nie zamiennikiem bazy danych aplikacji. Trzeba przechowywać hashe bloków i kursory, obsługiwać [[reorg|reorgi]] i używać jawnych identyfikatorów bloków, gdy kilka odczytów musi opisywać ten sam snapshot. Przy odpowiedziach o dużej wartości warto połączyć lokalną walidację z [[state-proof|dowodem stanu]] albo z nagłówkiem zaufanym z niezależnego źródła."
        ]
      }
    ],
    pitfalls: [
      "Zakładanie, że każdy pełny węzeł odpowie na dowolne zapytanie o historyczny stan albo dowód.",
      "Uruchamianie samego klienta wykonawczego i nazywanie tego procesu kompletnym węzłem po Merge.",
      "Health check, który sprawdza tylko port HTTP, a pomija synchronizację, sfinalizowany checkpoint i status Engine API.",
      "Używanie numeru bloku z węzła jako kursora w bazie aplikacji bez zapisywania hasha bloku."
    ]
  },
  "archive-node": {
    title: "Węzeł archiwalny",
    aliases: ["archive node", "tryb archiwalny", "węzeł z historycznym stanem", "węzeł z pełną historią"],
    summary: "Węzeł archiwalny jest skonfigurowany tak, żeby zachowywać historyczny stan warstwy wykonawczej. Dzięki temu odpowiada na zapytania o stare bloki bez odbudowywania każdego snapshotu na żądanie.",
    sections: [
      {
        heading: "Co dodaje",
        paragraphs: [
          "Zwykły [[full-node|pełny węzeł]] jest zoptymalizowany pod śledzenie bieżącego łańcucha. Węzeł archiwalny przechowuje dodatkowe wersje stanu, indeksy albo dane trie potrzebne do odpowiedzi na pytania o saldo konta, slot storage kontraktu czy [[eth-call|eth_call]] na starym bloku. Przydaje się to [[rpc-workloads|eksploratorom, audytorom, badaczom]] i [[indexer|indekserom]], którzy potrzebują historycznego stanu, a nie tylko historii transakcji.",
          "Tryb archiwalny to polityka przechowywania danych, a nie osobna rola w konsensusie. Ten sam [[execution-client|klient wykonawczy]] nadal waliduje wykonanie, a ten sam [[consensus-client|klient konsensusu]] nadal śledzi proof-of-stake. Dodatkowe dane mogą mieć różne formaty: jedni klienci zachowują trie node'y, inni używają płaskich tabel historycznych albo niezmiennych plików, a koszt zapytania zależy od tej implementacji."
        ]
      },
      {
        heading: "Archiwum nie oznacza obsługi każdego zapytania",
        paragraphs: [
          "Słowo „archiwalny” nie jest uniwersalną gwarancją zgodności. Body starych bloków, stary stan, indeksy transakcji, trace, logi i ścieżki [[eth-get-proof|dowodów]] to osobne możliwości. Klient może mieć historyczne salda, a nie mieć konkretnej przestrzeni nazw do trace. Może zachowywać wartości stanu, a do generowania dowodów potrzebować dodatkowych historycznych trie node'ów. Dostawca może reklamować odczyty archiwalne, ale nakładać limity zakresu albo metod.",
          "Zanim zagwarantuje się dostępność, trzeba przetestować dokładnie te metody i ten zakres bloków, o które chodzi. Przy dowodach trzeba zachować [[block-header|nagłówek]] bloku, którego dotyczy żądanie, i sprawdzić, czy skonfigurowane dane historyczne klienta pozwalają zbudować ścieżkę konta albo storage. Przy trace trzeba przetestować wybrany tracer i kontekst stanu. Przy logach i receiptach indeksy historii transakcji sprawdza się osobno od retencji stanu."
        ]
      },
      {
        heading: "Koszty i utrzymanie",
        paragraphs: [
          "Archiwum zużywa znacznie więcej miejsca na dysku i operacji I/O niż pruned node, a kompakcja albo odtwarzanie mogą trwać bardzo długo. Gdy kosztowne zapytania historyczne konkurowałyby z przetwarzaniem bloków, ruch RPC warto puścić przez osobny [[rpc-gateway|gateway]] albo replikę do odczytu. Trzeba mieć kopie zapasowe i dokumentować wydanie klienta, schemat stanu, flagi pruningu i układ katalogu danych. Odtworzenie bieżącego archiwum z dowolnego snapshotu może nie zachować tej samej obsługi dowodów.",
          "Zarządzany [[rpc-provider|dostawca]] może być praktycznym źródłem danych archiwalnych, ale przesuwa granicę zaufania i dostępności. Warto porównać chain ID, hash bloku, okno retencji, rate limity i obsługę dowodów z własnym węzłem albo z innym dostawcą. Dostęp do archiwum pomaga pobierać dane, ale sam w sobie nie ustala [[finality|finalności]] ani nie sprawia, że odpowiedź RPC jest niezależnie zweryfikowana."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie etykiety „archive” jako gwarancji każdej historycznej metody trace albo dowodu.",
      "Mylenie zachowanych transakcji i receiptów z zachowanym historycznym stanem kont.",
      "Puszczanie nieograniczonych skanów archiwum na tych samych zasobach, które importują i walidują head.",
      "Zmiana ustawień pruningu albo przechowywania stanu bez udokumentowanego planu migracji albo ponownej synchronizacji."
    ]
  },
  "pruned-node": {
    title: "Pruned node",
    aliases: ["węzeł z pruningiem", "pruning stanu", "pruning historii", "węzeł z niedawnym stanem"],
    summary: "Pruned node (węzeł z pruningiem, czyli usuwaniem starych danych) kasuje wybrane dane historyczne, gdy nie są już potrzebne do walidacji i obsługi zapytań w zakresie, na jaki węzeł jest skonfigurowany.",
    sections: [
      {
        heading: "Po co pruning",
        paragraphs: [
          "Łańcuch stale rośnie, ale wiele aplikacji czyta tylko niedawny stan. [[full-node|Pełny węzeł]] może usuwać starsze snapshoty stanu, trie node'y, indeksy albo inne dane pochodne, a przy tym nadal walidować nowe bloki i obsługiwać bieżące [[json-rpc|JSON-RPC]]. Taki węzeł zajmuje mniej miejsca na dysku i często ma prostsze wymagania operacyjne niż [[archive-node|węzeł archiwalny]].",
          "Pruning to nie to samo co zaufanie do snapshotu. Klient wykonawczy nadal waliduje importowane dane zgodnie ze swoją strategią synchronizacji i utrzymuje bieżący [[state-root|state root]]. Znika tylko możliwość natychmiastowej odpowiedzi na część pytań o stary stan. Dokładne okno i sposób odtwarzania danych zależą od implementacji, więc typowego okna nie należy traktować jak gwarancji API."
        ]
      },
      {
        heading: "Co zmienia się w RPC",
        paragraphs: [
          "Metody bieżącego stanu, takie jak odczyt salda, kodu, storage i [[eth-call|eth_call]], zwykle działają, gdy tag bloku wskazuje niedawny blok. Żądanie dla starego bloku może skończyć się błędem missing trie node (brak trie node'a), odpowiedzią block not found albo błędem specyficznym dla klienta; inny klient może odtworzyć stan i odpowiedzieć. Stare receipty i logi transakcji mogą mieć [[receipt-retention|inne zasady retencji]] niż stary stan kont, więc trzeba je testować osobno.",
          "Nie należy zakładać, że pruned node wygeneruje stare [[eth-get-proof|dowody]]. Zbudowanie dowodu wymaga odpowiedniej ścieżki konta i storage, a sam odczyt wartości może wymagać mniej informacji. Jeśli aplikacja musi weryfikować wartość offline, powinna zapisać [[block-header|nagłówek]], odpowiedź z dowodem i wynik weryfikacji, póki potrzebne dane są dostępne."
        ]
      },
      {
        heading: "Wybór polityki pruningu",
        paragraphs: [
          "Retencję dobiera się do [[rpc-workloads|faktycznych obciążeń]]: niedawnych odczytów dappów, wysyłania transakcji, skanowania logów, trace, [[chain-analytics|analityki historycznej]] albo generowania dowodów. Do zdekodowanej historii aplikacji trzeba mieć osobny [[indexer|indekser]], zamiast oczekiwać, że baza węzła posłuży jako magazyn danych do raportów. Jeśli indekser będzie później musiał ponownie wykonać stare wywołanie, to zadanie należy kierować do puli węzłów z danymi archiwalnymi, a tę zależność jawnie opisać.",
          "Trzeba dokumentować wersję klienta, tryb synchronizacji, tryb pruningu i sposób odtworzenia węzła. Przełącznik, który działa tylko na przyszłe zapisy, może nie przywrócić już usuniętego stanu; niektóre zmiany wymagają przebudowy bazy. Wolne miejsce i postęp pruningu warto monitorować razem z synchronizacją warstwy wykonawczej i konsensusu, żeby udany health check RPC nie ukrył węzła, który nie nadąża."
        ]
      }
    ],
    pitfalls: [
      "Twierdzenie, że każdy pełny węzeł trzyma dokładnie tę samą liczbę bloków historycznego stanu.",
      "Traktowanie braku odpowiedzi o stary stan jako dowodu, że blok albo transakcja nigdy nie istniały.",
      "Zakładanie, że klient na żądanie odtworzy każdy usunięty trie node.",
      "Testowanie tylko z `latest` i odkrycie po wdrożeniu, że obciążenia zależne od archiwum nie działają."
    ]
  },
  "light-client": {
    title: "Lekki klient",
    aliases: ["light client", "light node", "lekki węzeł", "klient nagłówków", "header client", "klient mobilny"],
    summary: "Lekki klient weryfikuje wybrane dane Ethereum na podstawie zwięzłych nagłówków i dowodów, zamiast lokalnie przechowywać i wykonywać cały łańcuch.",
    sections: [
      {
        heading: "Mało danych lokalnie, jawna weryfikacja",
        paragraphs: [
          "Lekki klient nie pobiera pełnych baz danych warstwy wykonawczej i konsensusu. Śledzi tyle uwierzytelnionych informacji o nagłówkach albo konsensusie, żeby móc zażądać wartości od zdalnego źródła i sprawdzić ją względem korzenia objętego commitmentem. To różni się od zwykłego wywołania [[rpc-provider|providera]]: provider zwraca odpowiedź JSON, a protokół lekkiego klienta zawiera informacje potrzebne do odrzucenia odpowiedzi, która nie zgadza się z jego zaufanym obrazem łańcucha.",
          "Lekcy klienci wykonawczy i lekcy klienci konsensusu składają się z innych elementów. Lekcy klienci konsensusu śledzą nagłówki bloków beacon i podpisy sync committee; dane wykonawcze mogą wymagać [[state-proof|dowodu stanu]] i zaufanego commitmentu wykonawczego. Tak właśnie [[helios|Helios]] łączy jedno z drugim, żeby weryfikować odpowiedzi `eth_` od niezaufanego providera. Klient potrzebuje więc kotwicy zaufania (trust anchor), takiej jak checkpoint weak subjectivity albo uwierzytelniony łańcuch nagłówków, zamiast ślepo przyjmować najnowszy blok, który ogłasza serwer."
        ]
      },
      {
        heading: "Co potrafi, a czego nie",
        paragraphs: [
          "Lekki klient może obsługiwać ukierunkowane odczyty w portfelach albo urządzeniach wbudowanych, weryfikować wartości kont albo storage i zmniejszać wymagania sprzętowe potrzebne do uzyskania wiarygodnych informacji o łańcuchu. Nie zapewnia automatycznie każdej metody [[json-rpc|JSON-RPC]], nie odtwarza dowolnych historycznych trace'ów, nie indeksuje logów i nie działa jako walidator. Dane, których nie obejmuje commitment na ścieżce dowodu, nadal wymagają innego źródła i osobnej decyzji o zaufaniu.",
          "Zdalny pełny węzeł nadal wykonuje dużą część pracy: dostarcza nagłówki, dowody gałęzi albo dane wykonawcze. Lekki klient weryfikuje to, co dostaje, i może odrzucić brakujące albo niespójne odpowiedzi. Dlatego ważne jest wsparcie po stronie sieci i protokołu; lekki klient to nie po prostu przeglądarkowa nakładka na nieuwierzytelniony endpoint HTTP."
        ]
      },
      {
        heading: "Kompromisy operacyjne",
        paragraphs: [
          "Lekcy klienci wymieniają lokalne miejsce na dysku i przepustowość na złożoność protokołu, opóźnienie aktualizacji i zależność od peerów albo relayów, które serwują potrzebne dowody. Checkpoint konsensusu, wersja klienta i polityka weryfikacji powinny być obserwowalne. Portfel może zaakceptować sfinalizowany widok przy wyświetlaniu salda, ale wymagać mocniejszej gwarancji przed podpisaniem transakcji albo wypuszczeniem środków.",
          "Gdy aplikacja potrzebuje szerokich zapytań, niskich opóźnień albo skanowania historii, zweryfikowaną ścieżkę lekkiego klienta można uzupełnić [[full-node|pełnym węzłem]] albo [[indexer|indekserem]]. Te dwie ścieżki powinny pozostać rozróżnialne: dane RPC z cache to optymalizacja, a sprawdzanie nagłówków i dowodów przez lekkiego klienta to decyzja o bezpieczeństwie. Nie przedstawiaj całego zdalnego RPC jako zabezpieczonego przez lekkiego klienta."
        ]
      }
    ],
    pitfalls: [
      "Nazywanie lekkim klientem portfela, który korzysta z providera bez lokalnej weryfikacji nagłówków albo dowodów.",
      "Zakładanie, że lekcy klienci udostępniają pełny zestaw metod JSON-RPC warstwy wykonawczej.",
      "Pomijanie zarządzania weak subjectivity albo checkpointami, bo nagłówki są podpisane kryptograficznie.",
      "Używanie lekkiego klienta jako walidatora albo indeksu archiwalnego bez wymaganych danych i obowiązków."
    ]
  },
  "snap-sync": {
    title: "Snap sync",
    aliases: ["snap sync", "synchronizacja snap", "snapshot sync", "synchronizacja ze snapshotu stanu", "tryb snap"],
    summary: "Snap sync to szybka strategia synchronizacji klienta wykonawczego: klient pobiera niedawny snapshot stanu i weryfikuje go względem danych łańcucha, zanim zacznie podążać za headem.",
    sections: [
      {
        heading: "Synchronizacja na skróty",
        paragraphs: [
          "Klient wykonawczy uruchamiany od zera nie musi ponownie wykonywać każdej transakcji od bloku genesis, zanim zacznie obsługiwać odczyty bieżącego stanu. W snap sync peery dostarczają niedawny stan kont i storage w porcjach, a klient pobiera nagłówki i body bloków, weryfikuje snapshot względem uwierzytelnionego [[state-root|state rootu]] i dopiero potem sam przetwarza nowsze bloki. Dokładne fazy, protokół wymiany z peerami i ustawienia domyślne zależą od implementacji klienta.",
          "Snap sync jest więc sposobem na bootstrap węzła, a nie słabszym trybem konsensusu. Po synchronizacji klient wykonawczy waliduje nowe bloki i wykonuje dokładnie te same przejścia stanu co węzeł, który odtworzył łańcuch od genesis. Nadal można go skonfigurować jako [[pruned-node|pruned node]] albo [[archive-node|węzeł archiwalny]], zależnie od tego, jaką historię operator zachowuje po synchronizacji."
        ]
      },
      {
        heading: "RPC w trakcie synchronizacji i po niej",
        paragraphs: [
          "W trakcie synchronizacji endpoint może przyjmować żądania, choć jego head jest w tyle albo historyczny stan jest niedostępny. `eth_syncing`, numery headu, sfinalizowane checkpointy i testowe wywołania konkretnych metod mówią więcej niż HTTP 200. [[rpc-provider|Provider RPC]] ani [[rpc-gateway|gateway]] nie powinien kierować produkcyjnych odczytów do węzła tylko dlatego, że proces otworzył port 8545.",
          "Gdy snap sync dojdzie do headu, bieżące [[eth-call|eth_call]], salda, kod, storage i wysyłanie transakcji powinny działać zgodnie ze zwykłą polityką klienta. Historyczny stan zależy od trybu retencji, a nie od tego, że użyto snap sync. Żądanie [[eth-get-proof|eth_getProof]] może potrzebować historycznych trie node'ów, których baza danych po synchronizacji nie zachowała."
        ]
      },
      {
        heading: "Wybór sposobu bootstrapu",
        paragraphs: [
          "Snap sync warto wybrać, gdy liczy się szybkie dojście do headu, a obciążenie to zwykłe odczyty bieżącego stanu. Pełną synchronizację albo ścieżkę nastawioną na archiwum warto wybrać, gdy operator musi lokalnie zwalidować albo zachować głębszą historię, w granicach trybów obsługiwanych przez klienta. Zaufany checkpoint albo dystrybucja snapshotu mogą zmniejszyć początkową pracę, ale zanim uzna się wynik za własny, lokalny węzeł, trzeba sprawdzić źródło, chain ID i wynikowe commitmenty.",
          "Warto mierzyć pobieranie snapshotu, state healing (uzupełnianie brakujących fragmentów stanu), dostępność peerów, przepustowość dysku i czas do finalności. Jeśli węzeł raz po raz staje, trzeba porównać jego fazę synchronizacji z kondycją [[peer-to-peer|peerów]] i możliwościami [[node-hardware|sprzętu]]. [[database-snapshot|Przywrócenie snapshotu bazy danych]] może być szybsze niż ponowna synchronizacja, ale powinno być częścią przetestowanego planu odtwarzania, a nie niesprawdzonym skrótem."
        ]
      }
    ],
    pitfalls: [
      "Przedstawianie snap sync jako pominięcia walidacji, a nie jako innej drogi bootstrapu.",
      "Wystawianie synchronizującego się węzła jako zdrowego, bo odpowiada jego listener HTTP.",
      "Zakładanie, że snap sync decyduje o tym, czy po synchronizacji będą dostępne dane archiwalne albo dowody.",
      "Branie snapshotu stanu z niezweryfikowanego źródła bez sprawdzenia tożsamości łańcucha i commitmentów."
    ]
  },
  "peer-to-peer": {
    title: "Sieć peer-to-peer",
    aliases: ["P2P", "sieć P2P", "gossip węzłów", "peery sieci", "sieć gossip"],
    summary: "Sieć peer-to-peer pozwala węzłom wykonawczym i węzłom konsensusu wymieniać bloki, transakcje, atestacje i dane synchronizacji bez przesyłania tych wiadomości przez RPC aplikacji.",
    sections: [
      {
        heading: "RPC to nie jest sieć węzłów",
        paragraphs: [
          "Klient RPC rozmawia z jednym endpointem przez HTTP, WebSocket, IPC albo inny skonfigurowany transport. Warstwa peer-to-peer węzła rozmawia z innymi węzłami przez właściwe dla protokołu discovery (wyszukiwanie peerów), handshake'i, gossip i wiadomości w modelu żądanie i odpowiedź. Te dwa interfejsy służą różnym celom: RPC daje aplikacjom wybrane widoki i polecenia, a peery dostarczają dane, których węzeł potrzebuje, żeby walidować łańcuch i za nim podążać.",
          "Klienci wykonawczy wymieniają transakcje i bloki warstwy wykonawczej; klienci konsensusu wymieniają bloki beacon, atestacje i dane sync committee. Oba procesy koordynują się potem lokalnie przez [[engine-api|Engine API]]. Udane wywołanie RPC nie czyni wywołującego peerem, nie daje mu miejsca w [[fork-choice|fork choice]] i nie pozwala mu wstrzykiwać dowolnych wiadomości konsensusu."
        ]
      },
      {
        heading: "Discovery i gossip",
        paragraphs: [
          "Sieć warstwy wykonawczej zwykle korzysta z discovery i subprotokołów devp2p, a sieć konsensusu z discovery i gossipu opartych na libp2p. Dokładne protokoły transmisji i domyślne porty zależą od klienta i konfiguracji, ale idee operacyjne są stałe: znaleźć przydatnych peerów, uwierzytelnić się albo wynegocjować obsługiwane możliwości protokołu, poprosić o brakujące dane i rozgłosić innym peerom nowo zaobserwowane dane. [[devp2p|devp2p]] jest więc pojęciem po stronie wykonawczej, a nie synonimem całej sieci Ethereum.",
          "Sama liczba peerów to słaby sygnał zdrowia węzła. Węzeł może mieć peerów, którzy są nieaktualni, działają w innej sieci, nie potrafią dostarczyć potrzebnego mu stanu albo są odcięci od najlepszego headu. Decydując, czy wpuścić węzeł do puli RPC, trzeba łączyć metryki peerów z fazą synchronizacji, opóźnieniem headu, sfinalizowanym checkpointem i statusem payloadu."
        ]
      },
      {
        heading: "Sieć od strony operatora",
        paragraphs: [
          "Reguły firewalla powinny przepuszczać ruch peerów, którego węzeł potrzebuje, a granice publicznego RPC, Beacon API i Engine API powinny być ustawione świadomie. [[self-hosting|Własny węzeł (self-hosted)]] za restrykcyjnym NAT-em może potrzebować bootnode'ów, statycznych peerów albo starannie skonfigurowanego discovery; węzeł bez przydatnych peerów nigdy nie stanie się wiarygodnym źródłem RPC. Przy diagnozowaniu rozbieżnego widoku łańcucha trzeba zapisać sieć, chain ID, wersję klienta i różnorodność peerów.",
          "Problemu z peerami nie „naprawia” się przez wystawienie administracyjnych metod RPC. Przez RPC można podejrzeć wybrany status, ale zachowaniem peerów sterują konfiguracja sieciowa węzła i implementacja protokołu. [[health-check|Health check]] powinien zgłaszać sytuację, w której węzeł jest osiągalny, ale nie potrafi pobrać ani zwalidować świeżych danych, żeby [[load-balancer|load balancer]] mógł go wyłączyć z ruchu, zanim aplikacje zobaczą nieaktualne wyniki."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie połączenia RPC jak połączenia peer-to-peer z uprawnieniami w konsensusie.",
      "Używanie liczby peerów jako jedynego sygnału synchronizacji albo świeżości danych.",
      "Otwieranie portów Engine API albo administracyjnego RPC, żeby rozwiązać problem z discovery peerów.",
      "Mieszanie peerów z mainnetu, testnetu i sieci prywatnych przez luźne reguły firewalla i discovery."
    ]
  },
  devp2p: {
    title: "devp2p",
    aliases: ["Ethereum devp2p", "RLPx", "protokół eth", "protokół snap"],
    summary: "devp2p to rodzina protokołów sieci wykonawczej, z której klienci wykonawczy korzystają do discovery, sesji z peerami, gossipu transakcji, wymiany bloków i synchronizacji stanu.",
    sections: [
      {
        heading: "Gdzie się mieści",
        paragraphs: [
          "Klienci wykonawczy używają devp2p, żeby znajdować innych klientów wykonawczych i się z nimi komunikować. RLPx zapewnia szyfrowaną, uwierzytelnioną sesję, discovery wskazuje potencjalnych peerów, a subprotokoły, takie jak `eth` i `snap`, określają, jakie dane wykonawcze można wymieniać. Wszystko to działa poniżej [[json-rpc|JSON-RPC]]: aplikacja, która prosi o blok, nie posługuje się devp2p, a endpoint RPC nie zastąpi zdrowej sesji z peerem.",
          "Sieć wykonawcza przenosi transakcje i bloki warstwy wykonawczej, a klient konsensusu używa własnej sieci peerów do bloków beacon i atestacji. Sparowane procesy spotykają się w [[engine-api|Engine API]]. Rozdzielanie tych warstw chroni operatora przed założeniem, że liczba peerów po stronie wykonawczej dowodzi synchronizacji strony konsensusu."
        ]
      },
      {
        heading: "Synchronizacja i gossip",
        paragraphs: [
          "Protokół `eth` obsługuje wymianę łańcucha i bloków; protokół `snap` obsługuje pobieranie zakresów stanu, które może przyspieszyć [[snap-sync|snap sync]]. Peery proszą o dane, weryfikują je względem nagłówków i rootów oraz rozgłaszają nowo zaobserwowane transakcje i bloki. Węzeł nadal może odrzucić dane od peera, jeśli są sprzeczne z regułami protokołu albo z bieżącym [[fork-choice|fork choice]]. Sieć podsuwa dane do sprawdzenia; nie jest autorytetem, który stoi ponad lokalną walidacją.",
          "Discovery i obsługa protokołów są wersjonowane i zależą od klienta. Operator powinien obserwować błędy sesji z peerami, opóźnienie dostarczania żądanych danych, przepustowość i to, czy peery dostarczają zakresy stanu, których wymaga bieżąca faza synchronizacji. Jeśli węzeł nie ma odpowiednich peerów, RPC może pozostać dostępne z nieaktualnym headem, podczas gdy proces czeka na dane."
        ]
      },
      {
        heading: "Granice w praktyce",
        paragraphs: [
          "Ruch peerów trzeba świadomie przepuścić w regułach firewalla i kontenerów, a gdy discovery jest ograniczone, użyć bootnode'ów albo statycznych peerów. RPC, Engine API i administracyjne przestrzenie nazw powinny mieć osobne polityki sieciowe. [[self-hosting|Własny węzeł (self-hosted)]] może do stabilnej pracy potrzebować publicznej osiągalności dla peerów, ale to nie oznacza publicznego dostępu do odczytu ani zapisu przez jego metody JSON-RPC.",
          "Problemy diagnozuje się od dołu: sprawdzić łańcuch i sieć, przejrzeć sesje z peerami, sprawdzić fazę synchronizacji, porównać wartości head i finalized, a na końcu przetestować metody RPC. Jeśli [[health-check|health check]] tylko wysyła curl na port 8545, przeoczy węzeł, który stracił wszystkich przydatnych peerów devp2p. Ten bogatszy sygnał trzeba umieścić w [[observability|metrykach]], z których korzysta pula RPC."
        ]
      }
    ],
    pitfalls: [
      "Nazywanie devp2p interfejsem RPC dla aplikacji.",
      "Zakładanie, że każdy peer wykonawczy obsługuje te same opcjonalne subprotokoły albo tak samo udostępnia stan.",
      "Wystawianie administracyjnego JSON-RPC, żeby zrekompensować zablokowany ruch peerów.",
      "Uznawanie węzła za zdrowy na podstawie sprawdzenia portu, gdy jego faza synchronizacji stoi w miejscu."
    ]
  },
  "history-expiry": {
    title: "Wygasanie historii (history expiry)",
    aliases: ["history expiry", "EIP-4444", "ograniczona historia", "bounded history", "wygasanie danych historycznych"],
    summary: "Wygasanie historii to kierunek, który obierają protokół i klienci: zwykłe węzły mogą usuwać starą historię bloków, a dostęp do niej zachowują alternatywne systemy pobierania danych.",
    sections: [
      {
        heading: "Historia a stan",
        paragraphs: [
          "Dane Ethereum mają kilka historii. Nagłówki, body i receipty bloków wykonawczych opisują przeszłą aktywność; stan kont i kontraktów to snapshoty z określonych momentów; klienci konsensusu przechowują informacje z Beacon Chain; a [[indexer|indeksery]] aplikacji wyprowadzają z tego rekordy, które da się przeszukiwać. [[eip|EIP-4444]] skupia się na tym, żeby bardzo stara historia bloków była dla klientów wykonawczych opcjonalna, a pruning stanu i polityki archiwalne dotyczą innych danych. Węzeł, który usunął stare body, nadal może serwować bieżący stan i walidować nowe bloki.",
          "To rozróżnienie ma znaczenie dla RPC. `eth_getBlockByNumber`, wyszukiwanie transakcji, logi, trace'y, stare [[eth-call|eth_call]] i generowanie [[eth-get-proof|dowodów]] mogą zależeć od różnych przechowywanych struktur. Nie należy obiecywać, że jedno ustawienie „historii” steruje każdą metodą. Trzeba zapytać, które źródło danych obsłuży żądanie i czy węzeł potrafi te dane odtworzyć."
        ]
      },
      {
        heading: "Po co wygasanie historii",
        paragraphs: [
          "Historyczne dane bloków rosną bez końca i często są powielane przez wielu providerów, nawet jeśli potrzebuje ich tylko część aplikacji. Wygasanie może zmniejszyć obciążenie dysku zwykłych węzłów walidujących i przenieść serwowanie starych danych do dedykowanych archiwów, protokołów peer-to-peer, portali albo baz danych aplikacji. Celem nie jest wymazanie historii Ethereum; chodzi o to, żeby nie wymagać od każdego węzła przechowywania każdego historycznego bajtu.",
          "Węzeł, który nie przechowuje starych bloków, nadal może walidować bieżący łańcuch od dostępnego punktu synchronizacji i utrzymywać niedawny stan. [[light-client|Lekki klient]] może pozyskiwać wybrane fakty historyczne przez dowody albo wyspecjalizowane protokoły. Bezpieczeństwo i dostępność tych alternatywnych źródeł trzeba nazwać wprost, zamiast chować je za znajomym URL-em RPC."
        ]
      },
      {
        heading: "Planowanie po stronie aplikacji",
        paragraphs: [
          "Jeśli usługa potrzebuje bardzo starych bloków, receiptów albo trace'ów, powinna trzymać je w dedykowanym archiwum albo zaindeksowanym magazynie i zapisywać hash bloku przy każdym wyprowadzonym rekordzie. Jeśli potrzebuje historycznych dowodów stanu, powinna w chwili zbierania danych zachować dowody stanu i zaufany [[block-header|nagłówek]]; same stare wartości stanu mogą nie wystarczyć do odtworzenia potrzebnej ścieżki. Jeśli potrzebuje danych pokazywanych użytkownikom, powinna jawnie pokazać, do jakiej granicy da się pobrać dane i jak wygląda odpowiedź, gdy się nie da, zamiast zwracać niewyjaśniony błąd providera.",
          "Operatorzy powinni dokumentować, jaką historię przechowują, kiedy działa pruning, jak przebiega przywracanie i z jakiego zewnętrznego źródła pochodzą wygasłe dane. Synchronizację archiwum i [[endpoint-capabilities|możliwości endpointu]] trzeba monitorować oddzielnie od zdrowia RPC na bieżącym stanie. Wygasanie staje się bezpieczne, gdy aplikacje są projektowane z myślą o jawnym pochodzeniu danych, a nie o tym, że dane przypadkiem są dostępne lokalnie."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie wygasania historii jako tego samego co pruning stanu albo tryb archiwalny.",
      "Zakładanie, że zwykły endpoint RPC warstwy wykonawczej zawsze obsłuży stary numer bloku.",
      "Usuwanie hashy bloków z wyprowadzonych rekordów i zostawianie samych wysokości.",
      "Chowanie zapasowych źródeł dla wygasłych danych za URL-em providera bez udokumentowania pochodzenia i sposobu weryfikacji."
    ]
  },
  "sync-modes": {
    title: "Tryby synchronizacji",
    aliases: ["strategia synchronizacji", "full sync", "checkpoint sync", "snap sync", "synchronizacja węzła"],
    summary: "Tryby synchronizacji określają, jak klient pobiera nagłówki, body bloków, stan i dane konsensusu, zanim stanie się niezawodnym węzłem dla obciążeń RPC.",
    sections: [
      {
        heading: "Strategie bootstrapu",
        paragraphs: [
          "Klient wykonawczy może ponownie wykonać długą historię bloków, pobrać i zweryfikować snapshot stanu przez [[snap-sync|snap sync]] albo [[database-snapshot|odtworzyć udokumentowany checkpoint bazy danych]], a potem nadrobić zaległości. Klienci konsensusu mają własne strategie: checkpoint sync albo synchronizację zakresami bloków (range sync). Nazwy i flagi różnią się między [[geth|Gethem]], [[nethermind|Nethermind]], [[erigon|Erigonem]], [[reth|Rethem]] i [[besu|Besu]], więc aplikacja powinna opisywać oczekiwany wynik i politykę retencji, zamiast polegać na jednym uniwersalnym słowniku flag wiersza poleceń.",
          "Każda strategia nadal wymaga walidacji. Nagłówki, bloki, commitmenty stanu i checkpointy konsensusu trzeba sprawdzić względem reguł protokołu i właściwego łańcucha. Szybszy bootstrap zmienia moment, w którym węzeł staje się użyteczny; nie zamienia niezweryfikowanej bazy w kanoniczną prawdę. Pochodzenie zaufanego checkpointu albo snapshotu warto zapisać w runbooku odtwarzania."
        ]
      },
      {
        heading: "Kiedy RPC jest gotowe",
        paragraphs: [
          "Proces może otworzyć RPC, zanim się zsynchronizuje. Podczas startu może zwracać niski head, brakujące bloki, niekompletny stan albo błędy dla metod, które zadziałają później. Ruch warto dopuszczać dopiero po synchronizacji warstwy wykonawczej i konsensusu, przy świeżym headzie i sfinalizowanym checkpoincie oraz po udanych próbach dla faktycznych obciążeń: bieżących wywołań, logów, trace, odczytów archiwalnych albo generowania dowodów.",
          "Docelowa retencja węzła nie zależy od początkowego trybu synchronizacji. Węzeł po snap sync może działać z historią po pruningu, węzeł odtworzony ze snapshotu archiwum może zachować stary stan, a checkpoint konsensusu nie gwarantuje archiwalnych danych wykonawczych. Każde wymaganie trzeba kierować do przetestowanej puli węzłów o danej [[endpoint-capabilities|możliwości]]."
        ]
      },
      {
        heading: "Wydajność i odtwarzanie",
        paragraphs: [
          "Synchronizacja to obciążenie z wieloma zależnościami: jakość peerów, losowe I/O dysku, przepustowość zapisu sekwencyjnego, wykonywanie na CPU, pamięć i przepustowość sieci. Warto mierzyć czas spędzany w każdej fazie i zostawiać dość wolnego miejsca na kompakcję. Gdy węzeł jest w fazie healingu stanu, ulepszenie [[node-hardware|sprzętu]], które zmniejsza opóźnienia bazy danych, może znaczyć więcej niż dodatkowa przepustowość sieci.",
          "Do odtwarzania warto używać przetestowanej kopii zapasowej albo snapshotu, ale przed powrotem za load balancer trzeba sprawdzić w odtworzonym węźle chain ID, hash heada, sfinalizowany checkpoint i metody RPC. Jeśli węzeł jest wielokrotnie resetowany, trzeba zdiagnozować peery, dyski i logi klienta, zamiast na ślepo zmieniać tryby. Węzeł [[self-hosting|utrzymywany samodzielnie]] to system, który trzeba stale obsługiwać, a nie jednorazowe pobranie danych."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie flagi synchronizacji jednego klienta jako przenośnej na innego klienta.",
      "Wpuszczenie węzła na produkcję, bo port RPC otworzył się, zanim head i sfinalizowany checkpoint nadrobiły zaległości.",
      "Zakładanie, że szybka początkowa synchronizacja daje historię archiwalną.",
      "Odtwarzanie snapshotu bez sprawdzenia tożsamości łańcucha, commitmentów i obsługi metod potrzebnych w danym obciążeniu."
    ]
  },
  "node-hardware": {
    title: "Sprzęt węzła",
    aliases: [
      "sprzęt dla węzła",
      "wymagania sprzętowe",
      "disk I/O",
      "wymiarowanie węzła",
      "node sizing",
      "węzeł na SSD",
      "RAM i przepustowość"
    ],
    summary: "Sprzęt węzła to moc procesora, pamięć, dysk i łącze sieciowe, od których zależą czas synchronizacji, opóźnienia RPC, przepustowość zapytań historycznych i przebieg odtwarzania po awarii.",
    sections: [
      {
        heading: "Wąskie gardła rozkładają się nierówno",
        paragraphs: [
          "Klienci wykonawczy i klienci konsensusu korzystają z różnych zasobów. Synchronizacja po stronie wykonawczej i przetwarzanie w EVM zużywają CPU; odczyty z trie i bazy danych zależą głównie od losowego I/O i jego opóźnień; stan i dane archiwalne zajmują dysk; gossip konsensusu i checkpoint sync zużywają sieć i pamięć. Maszyna z wieloma rdzeniami i tak może zostawać w tyle, jeśli jej dysk nie nadąża z kompakcją (compaction) bazy albo odczytami stanu. Sprzęt trzeba dobierać na podstawie pomiaru obciążenia klienta, a nie według jednej liczby z karty produktu.",
          "RPC na bieżącym stanie i RPC archiwalne mają różne profile. `eth_blockNumber` to tanie wywołanie, a szerokie [[eth-get-logs|eth_getLogs]], trace'y, stare [[eth-call|eth_call]] i generowanie [[eth-get-proof|dowodów]] mogą czytać duże struktury albo wykonywać kod na historycznym stanie. Gdy liczą się opóźnienia i świeżość danych, kosztowną pracę warto trzymać z dala od węzła, który odpowiada za import bloków."
        ]
      },
      {
        heading: "Wymiarowanie węzła pod RPC",
        paragraphs: [
          "Punktem wyjścia są wymagania dotyczące retencji i zapytań. [[full-node|Pełny węzeł]] z pruningiem potrzebuje mniej dysku niż [[archive-node|węzeł archiwalny]], ale oba potrzebują zapasu na wzrost danych, kompakcję, tymczasowe pliki synchronizacji, logi i kopie zapasowe. Obciążenie [[indexer|indeksera]] albo trace'ów często wymaga własnego dysku i własnej bazy danych. Jeśli aplikacje oczekują dużej współbieżności, lepiej dodać repliki do odczytu albo [[rpc-gateway|gateway]], niż zakładać, że jeden większy dysk rozładuje każdą kolejkę.",
          "Pamięć wpływa na cache'owanie, dostęp do trie, kompakcję bazy i współbieżne wywołania. Przepustowość sieci musi jednocześnie wystarczyć na synchronizację z peerami i na odpowiedzi RPC. W [[rpc-benchmarking|testach obciążeniowych]] trzeba używać realistycznej mieszanki żądań i zakresów bloków; benchmark, który wysyła tylko `eth_chainId`, niewiele mówi o produkcyjnym skanerze logów albo o symulacjach na historycznym stanie."
        ]
      },
      {
        heading: "Eksploatacja i awarie",
        paragraphs: [
          "Warto monitorować wolne miejsce na dysku, IOPS, opóźnienie fsync, rozmiar bazy, nasycenie CPU, presję na pamięć, przepustowość do peerów i opóźnienie headu po stronie wykonawczej i konsensusu. Alert powinien przyjść, zanim system plików się zapełni, bo gdy zapisy się nie udają, klienci mogą przestać importować bloki albo naruszyć założenia, na których opiera się odtwarzanie. Snapshotów i kopii zapasowych warto używać tylko wtedy, gdy klient bezpiecznie je obsługuje, a czas przywracania trzeba przetestować względem docelowego poziomu usługi.",
          "Profil sprzętowy warto przechowywać razem z wersją klienta, trybem przechowywania danych, trybem synchronizacji i deklarowanym zakresem archiwum. Węzeł, który wystarczał przy uruchomieniu, może z czasem stać się wąskim gardłem w trybie pruned albo archiwalnym, gdy rosną stan i ruch RPC. Na czas ponownej synchronizacji trzeba go wyjąć z [[load-balancer|load balancera]] i przywrócić dopiero wtedy, gdy przejdzie [[health-check|health checki]] dopasowane do jego obciążenia."
        ]
      }
    ],
    pitfalls: [
      "Dobieranie sprzętu według liczby rdzeni CPU bez uwzględnienia opóźnień losowego dostępu do dysku i kompakcji.",
      "Mierzenie tylko tanich metod RPC zamiast historycznych logów, trace'ów, wywołań albo żądań dowodów.",
      "Zapełnienie dysku do tego stopnia, że synchronizacja i odtwarzanie nie mogą się zakończyć.",
      "Trzymanie ponownie synchronizującego się węzła w produkcyjnej puli RPC tylko dlatego, że jego proces nadal działa."
    ]
  },
  "checkpoint-sync": {
    title: "Checkpoint sync",
    aliases: [
      "checkpoint sync",
      "trusted node sync",
      "checkpoint-sync-url",
      "synchronizacja od checkpointu",
      "synchronizacja beacon state",
      "checkpointz"
    ],
    summary: "Checkpoint sync uruchamia [[consensus-client|klienta konsensusu]] od niedawnego, sfinalizowanego beacon state, pobranego przez [[beacon-api|Beacon API]] z zaufanego endpointu, zamiast odtwarzać każdy slot od [[genesis|bloku genesis]].",
    sections: [
      {
        heading: "Start od sfinalizowanego stanu",
        paragraphs: [
          "Odtworzenie Beacon Chain od genesis oznacza przetworzenie milionów 12-sekundowych slotów i każdej [[attestation|atestacji]] w nich, co zajmuje dni. Checkpoint sync pomija tę pracę: klient prosi providera o stan dla identyfikatora stanu `finalized` i odpowiadający mu blok, przyjmuje go jako swoją kotwicę (anchor) i od tego miejsca prowadzi [[fork-choice|fork choice]] do przodu. [[beacon-node|Beacon node]] dochodzi do headu w kilka minut.",
          "Pobrany stan nie weryfikuje się sam. Klient sprawdza jego wewnętrzną spójność i hash tree root stanu, ale nic w pliku nie dowodzi, że należy on do łańcucha kanonicznego; ta luka to założenie [[weak-subjectivity|weak subjectivity]]. Brakujące zaufanie zapewnia operator: wybiera endpoint i zanim węzeł zacznie cokolwiek obsługiwać, porównuje wynikowy root bloku z drugim źródłem."
        ]
      },
      {
        heading: "Na co węzeł może potem odpowiadać",
        paragraphs: [
          "Checkpoint sync obejmuje tylko stronę konsensusu. Sparowany [[execution-client|klient wykonawczy]] nadal musi sam pobrać stan i historię, zwykle przez [[snap-sync|snap sync]], więc [[eth-syncing|eth_syncing]] zwraca obiekt postępu jeszcze długo po tym, jak beacon node uznał się za zsynchronizowany. Do tego czasu `engine_newPayload` odpowiada `SYNCING`, a węzeł nie obsłuży [[eth-call|eth_call]] ani odczytów sald na headzie.",
          "Beacon node nie ma też żadnych bloków poniżej swojej kotwicy, dopóki nie skończy się backfill (uzupełnianie starszych bloków), więc żądania Beacon API o wcześniejsze sloty zwracają `404` na węźle, który poza tym jest zdrowy. Danych blobów spoza okna retencji 4096 epok (około 18 dni) nie da się już odzyskać od peerów. Gdy obaj klienci dogonią sieć, [[block-tag|tagi bloków]] `safe` i `finalized` zachowują się normalnie, bo klient konsensusu ma wreszcie prawdziwe checkpointy, które może przekazywać przez [[engine-api|Engine API]]."
        ]
      },
      {
        heading: "Uruchamianie",
        paragraphs: [
          "[[lighthouse|Lighthouse]], [[prysm|Prysm]] i [[teku|Teku]] przyjmują `--checkpoint-sync-url`; Prysm przyjmuje też `--genesis-beacon-api-url`, żeby pobrać stan genesis, co ma znaczenie w sieciach, których genesis nie jest wbudowany w binarkę. [[lodestar|Lodestar]] zapisuje tę flagę jako `--checkpointSyncUrl`, a [[nimbus|Nimbus]] przed startem węzła uruchamia osobne polecenie `trustedNodeSync`. Publiczne endpointy checkpointów istnieją dla każdej sieci, a wiele zespołów kieruje nowe węzły na beacon node, który już utrzymują.",
          "Kotwicę trzeba traktować jak zapisany artefakt: zalogować root bloku i slot, od których wystartował węzeł, i przechowywać je razem z wdrożeniem. Jeśli węzeł był offline dłużej niż okres weak subjectivity, trzeba go zsynchronizować od nowa ze świeżego checkpointu, a nie po prostu zrestartować. Odtwarzanie historycznych stanów konsensusu dla [[archive-node|węzła archiwalnego]] to osobne i znacznie dłuższe zadanie."
        ]
      }
    ],
    example: {
      title: "Start beacon node od checkpointu i sprawdzenie kotwicy",
      note: "Oba rooty muszą się zgadzać; jeśli porównanie nigdy nie zostanie wykonane, to provider checkpointu decyduje, za którym łańcuchem podąża węzeł."
    },
    pitfalls: [
      "Ogłaszanie, że węzeł jest zsynchronizowany, gdy zsynchronizowany jest tylko beacon node; klient wykonawczy zwykle nadal jest w trakcie snap sync, a odczyty na headzie się nie udają.",
      "Branie URL-a checkpointu z przypadkowej listy bez porównania wynikowego rootu bloku z drugim, niezależnym źródłem.",
      "Oczekiwanie, że zapytania Beacon API o sloty poniżej kotwicy zadziałają przed końcem backfillu, i traktowanie `404` jako awarii węzła.",
      "Restartowanie węzła, który był offline dłużej niż okres weak subjectivity, zamiast ponownej synchronizacji ze świeżego checkpointu."
    ]
  },
  "weak-subjectivity": {
    title: "Weak subjectivity",
    aliases: [
      "weak subjectivity",
      "okres weak subjectivity",
      "long-range attack",
      "atak dalekiego zasięgu",
      "kotwica zaufania",
      "trusted anchor",
      "checkpoint WS"
    ],
    summary: "Weak subjectivity to właściwość [[proof-of-stake|proof of stake]], z powodu której węzeł dołączający do sieci albo wracający po długiej przerwie nie może wybrać właściwego łańcucha na podstawie samych reguł protokołu i musi dostać z zewnątrz (out of band) niedawny, zaufany root bloku.",
    sections: [
      {
        heading: "Dlaczego same reguły nie wystarczą",
        paragraphs: [
          "W proof of work przedłużanie starego forka kosztuje energię zużywaną teraz, więc dla nowego obserwatora najcięższy łańcuch jest oczywisty. W proof of stake tak nie jest. Walidatorzy, którzy wyszli z sieci i wypłacili stake, zachowują stare klucze podpisujące i nie mają już nic do stracenia, więc mogą tanio podpisać alternatywną historię, która odgałęzia się od punktu w przeszłości. To jest long-range attack (atak dalekiego zasięgu).",
          "Klient synchronizujący się od [[genesis|bloku genesis]] może dostać dwa łańcuchy, z których każdy spełnia wszystkie reguły przejścia stanu i dla naiwnego weryfikatora wygląda na sfinalizowany. [[fork-choice|Fork choice]] nie rozstrzygnie remisu, bo waży [[attestation|atestacje]] zbioru walidatorów, który na fałszywej gałęzi także kontroluje atakujący. Remis rozstrzyga informacja, której węzeł nie wyprowadził sam."
        ]
      },
      {
        heading: "Okres weak subjectivity",
        paragraphs: [
          "Okno bezpieczeństwa jest skończone, bo wycofanie stake'u wymaga czasu. Walidator musi przejść przez kolejkę wyjścia (exit queue), a potem odczekać opóźnienie wypłaty, zanim jego 32 ETH będzie wolne, a churn limit (limit rotacji walidatorów) ogranicza tempo, w jakim może się wymienić aktywny zbiór. Specyfikacje konsensusu wyliczają okres weak subjectivity z liczby aktywnych walidatorów i tego churn limitu; na mainnecie mierzy się go w tygodniach, a klienci zapisują wyliczoną wartość w logach.",
          "W tym oknie węzeł z kotwicą zaufania (trusted anchor) jest bezpieczny, bo zbyt mała część stakowanego salda, które podpisywało w pobliżu kotwicy, zdążyła zostać wypłacona. Poza oknem ta gwarancja znika. Podniesienie maksymalnego efektywnego salda do 2048 ETH w Pectra zmieniło zachowanie konsolidacji i churnu, dlatego okres należy traktować jako liczbę raportowaną przez klienta, a nie stałą do zapamiętania."
        ]
      },
      {
        heading: "Co to oznacza w praktyce",
        paragraphs: [
          "Każdy świeży węzeł konsensusu potrzebuje kotwicy i właśnie to zapewnia [[checkpoint-sync|checkpoint sync]]; niektórzy klienci przyjmują też samą flagę `--weak-subjectivity-checkpoint` w postaci `root:epoch`. [[light-client|Lekki klient]] ma ten sam wymóg i zamiast pełnego stanu przypina zaufany okres [[sync-committee|sync committee]]. W obu przypadkach ufa się ludzkiej decyzji podjętej przy konfiguracji, a nie dowodowi protokołu.",
          "Skutek dla RPC jest cichy, a nie głośny. Węzeł zbootstrapowany na fałszywej gałęzi pewnie odpowiada na [[eth-block-number|eth_blockNumber]] i [[eth-call|eth_call]] oraz raportuje [[block-tag|tag bloku]] `finalized`, który nigdy nie będzie zgodny z prawdziwą siecią. Nic w odpowiedzi JSON-RPC tego nie zdradza, dlatego zanim zaufa się nowo postawionemu węzłowi, trzeba porównać [[chain-id|chain ID]], sfinalizowany [[block-hash|hash bloku]] i head z niezależnym endpointem."
        ]
      }
    ],
    pitfalls: [
      "Zakładanie, że synchronizacja od genesis to paranoiczna opcja bez zaufania; to dokładnie ten przypadek, którego według weak subjectivity nie da się rozstrzygnąć samymi regułami.",
      "Restartowanie węzła, który długo był offline, i pozwalanie mu na synchronizację do przodu zamiast ponownej synchronizacji od checkpointu nowszego niż okres weak subjectivity.",
      "Podawanie stałej liczby dni dla tego okresu zamiast odczytania wartości, którą klient wylicza dla bieżącego zbioru walidatorów.",
      "Przekonanie, że węzeł jest na właściwym łańcuchu, bo jego odpowiedzi są wewnętrznie spójne, a tag finalized się przesuwa."
    ]
  },
  discovery: {
    title: "Wykrywanie węzłów (discovery)",
    aliases: ["node discovery", "discovery", "discv4", "discv5", "ENR", "enode", "bootnodes", "bootnode'y", "EIP-778", "EIP-1459"],
    summary: "Discovery to rodzina protokołów UDP: discv4 dla warstwy wykonawczej, który część klientów wykonawczych uzupełnia o discv5, oraz discv5 dla konsensusu. Za ich pomocą klient znajduje peerów, przechodząc po tablicy w stylu Kademlii z podpisanymi rekordami Ethereum Node Record.",
    sections: [
      {
        heading: "Szukanie peerów bez żadnych peerów",
        paragraphs: [
          "Klient startuje z wpisaną na sztywno listą bootnode'ów dla swojej sieci i opcjonalnie z listą DNS opublikowaną jako URL `enrtree://` zgodnie z [[eip|EIP-1459]]. Od tych punktów startowych wykonuje przez UDP wyszukiwania w stylu Kademlii: prosi znane węzły o rekordy bliskie losowym identyfikatorom docelowym i wypełnia tablicę routingu podzieloną na kubełki według odległości XOR. Discovery wymienia tylko rekordy; właściwa sesja jest nawiązywana później.",
          "Obie warstwy mają osobne sieci discovery na osobnych portach. [[devp2p|devp2p]] używa discv4 na UDP 30303, obok portu TCP RLPx o tym samym numerze, a [[beacon-node|beacon node]] używa discv5 na własnym porcie UDP, 9000 u większości klientów i 12000 w Prysm, obok swojego portu TCP [[libp2p-gossip|libp2p]]. [[portal-network|Portal Network]] wykorzystuje warstwę discv5 do własnej sieci nakładkowej (overlay)."
        ]
      },
      {
        heading: "ENR i enode",
        paragraphs: [
          "URL enode to starszy, płaski identyfikator: `enode://<128 hex chars of public key>@<ip>:<port>`. Ethereum Node Record, zdefiniowany w [[eip|EIP-778]], zastępuje go podpisaną mapą klucz-wartość z numerem sekwencyjnym, schematem tożsamości, `secp256k1`, `ip`, `tcp` i `udp`, zapisaną w base64 z prefiksem `enr:-`. Ponieważ rekord jest podpisany i wersjonowany, węzeł może zaktualizować swój adres, a peery przyjmą nowszy rekord.",
          "Rekordy ogłaszają też możliwości węzła. Węzły wykonawcze umieszczają fork id ([[eip|EIP-2124]]) we wpisie `eth`, żeby peer po niewłaściwej stronie [[hardfork|aktualizacji sieci]] został odrzucony jeszcze przed handshakiem; węzły konsensusu ogłaszają `eth2` i podsieci atestacji, które subskrybują, i właśnie tak walidator znajduje peerów w potrzebnej mu podsieci."
        ]
      },
      {
        heading: "Gdzie spotyka się z tym operator RPC",
        paragraphs: [
          "[[admin-api|Przestrzeń nazw admin_]] udostępnia informacje z discovery: `admin_nodeInfo` zwraca własny enode i ENR węzła, `admin_peers` wypisuje sesje, a `admin_addPeer` przypina statycznego peera. Te metody ujawniają topologię i przyjmują zmiany konfiguracji, więc należą do prywatnego interfejsu, nigdy do publicznego endpointu obok `eth_`. Publiczne odpowiedniki to znacznie uboższe [[net-web3-api|net_peerCount]] i `net_listening`.",
          "Większość awarii discovery wygląda na problem sieciowy, a nie na problem RPC. Węzeł za NAT-em, który ogłasza nieosiągalny adres, ma tylko połączenia wychodzące, jego head staje, a potem węzeł bez żadnego błędu serwuje nieaktualne odpowiedzi dla [[block-tag|latest]]. Trzeba jawnie ustawić adres zewnętrzny, otworzyć port UDP, a nie tylko TCP, i włączyć liczbę peerów oraz opóźnienie headu do [[health-check|health checku]]."
        ]
      }
    ],
    example: {
      title: "Własny rekord węzła z admin_nodeInfo",
      note: "`discovery` to port UDP, a `listener` to port TCP; jeśli w firewallu otworzy się tylko port TCP, węzła nie da się znaleźć."
    },
    pitfalls: [
      "Otwarcie tylko portu TCP do połączeń z peerami i pozostawienie zamkniętego portu UDP dla discovery, przez co nikt nigdy nie znajdzie węzła.",
      "Zostawienie wewnętrznego adresu spod NAT-u jako adresu, który węzeł ogłasza, przez co węzeł ma tylko połączenia wychodzące, a jego head powoli zostaje w tyle.",
      "Wystawianie metod `admin_` na publicznym endpoincie RPC, żeby podglądać peerów, co przy okazji daje wywołującym `admin_addPeer`.",
      "Traktowanie URL-a enode i ENR jako wymiennych; tylko rekord jest podpisany, wersjonowany i może przenosić dane o forku i podsieciach."
    ]
  },
  "libp2p-gossip": {
    title: "Sieć konsensusu (libp2p)",
    aliases: ["gossipsub", "libp2p", "p2p beacon", "podsieci atestacji", "attestation subnets", "req/resp", "port 9000"],
    summary: "[[consensus-client|Klienci konsensusu]] komunikują się przez libp2p: topiki gossipsub rozsyłają w trybie push w obrębie slotu [[beacon-block|bloki beacon]], [[attestation|atestacje]] i dane blobów (od Fulu jako sidecary kolumn danych), a protokół request-response pobiera historyczne bloki. Domyślnie jedno i drugie działa na porcie 9000.",
    sections: [
      {
        heading: "Push w obrębie slotu, pull dla historii",
        paragraphs: [
          "Gossipsub obsługuje wszystko, co musi przejść przez sieć w ciągu 12-sekundowego slotu. [[beacon-node|Beacon node]] subskrybuje zestaw topików, waliduje każdą wiadomość przed przekazaniem dalej i propaguje ją do peerów w swoim meshu (sieci bezpośrednich połączeń). Wiadomości są kodowane w [[ssz|SSZ]] i kompresowane snappy, a nazwy topików zawierają bieżący fork digest, więc węzeł po złej stronie [[hardfork|aktualizacji sieci]] po cichu przestaje słyszeć sąsiadów.",
          "Synchronizacja historii korzysta z osobnego protokołu request-response (req/resp), a nie z gossip: `Status` przy nawiązaniu połączenia, potem `BeaconBlocksByRange`, `BeaconBlocksByRoot` i od Fulu `DataColumnSidecarsByRange` zamiast `BlobSidecarsByRange`, żeby uzupełnić luki. Tą ścieżką węzeł uzupełnia historię wstecz (backfill) po [[checkpoint-sync|checkpoint sync]] i tej samej używa, żeby nadrobić zaległości po przestoju."
        ]
      },
      {
        heading: "Topiki, podsieci i scoring",
        paragraphs: [
          "Globalne topiki przenoszą bloki beacon, zagregowane atestacje, wkłady (contributions) [[sync-committee|sync committee]], dobrowolne wyjścia walidatorów i slashingi. Pojedyncze atestacje krążą w 64 podsieciach `beacon_attestation_{subnet_id}`, a od Fulu sidecary kolumn danych mają własne 128 podsieci `data_column_sidecar_{subnet_id}`, więc węzeł przenosi tylko ruch istotny dla komitetów, którym służy, i kolumn, za których przechowywanie odpowiada (custody). Beacon node [[validator-client|klienta walidatora]] musi dołączyć do właściwej podsieci przed slotem swojego komitetu, dlatego ENR ogłasza subskrypcje.",
          "Gossipsub ocenia peery (scoring) za poprawność wiadomości, punktualność i duplikaty, a peery z niskim wynikiem usuwa z mesha. Węzeł ze złym zegarem przekazuje atestacje, które docierają poza oknem akceptacji, traci punkty, traci peery i zostaje w tyle, a w jego logach nie pojawia się żaden pojedynczy błąd."
        ]
      },
      {
        heading: "Dlaczego to ważne dla kodu wywołującego RPC",
        paragraphs: [
          "To w tej sieci powstają `safe` i `finalized`. Atestacje rozgłaszane tutaj składają się na checkpointy justified i finalized, które klient konsensusu przekazuje do [[execution-client|klienta wykonawczego]] przy każdym `engine_forkchoiceUpdated` przez [[engine-api|Engine API]]. Jeśli strona konsensusu straci peery, klient wykonawczy też przestaje dostawać bloki, bo o nowych dowiaduje się wyłącznie od klienta konsensusu: [[eth-block-number|eth_blockNumber]] dalej odpowiada, ale head już się nie przesuwa, a razem z nim zatrzymuje się [[block-tag|tag bloku]] `finalized`.",
          "Dane blobów też są tutaj i nigdzie indziej. [[blob|Transakcja z blobami]] pojawia się w RPC warstwy wykonawczej ze swoimi wersjonowanymi hashami (versioned hashes), ale treść blobów krąży w tej sieci, od Fulu jako kolumny danych, i jest udostępniana przez [[beacon-api|Beacon API]] przez 4096 epok, czyli około 18 dni. Potem nie przywróci jej nawet [[archive-node|węzeł archiwalny]] po stronie wykonawczej; zrobi to tylko [[blob-archive|archiwum blobów]]."
        ]
      }
    ],
    pitfalls: [
      "Monitorowanie tylko liczby peerów klienta wykonawczego, gdy to klient konsensusu jest tą połową węzła, która straciła swój mesh.",
      "Uruchamianie węzła z niezsynchronizowanym zegarem, co obniża scoring w gossip, bo wiadomości docierają poza oknem akceptacji.",
      "Otwarcie TCP 9000 bez UDP 9000, przez co discv5 nie znajduje peerów dla hosta libp2p.",
      "Oczekiwanie, że treść blobów da się pobrać z archiwalnego węzła wykonawczego po upływie 4096-epokowego okna przechowywania w warstwie konsensusu."
    ]
  },
  "portal-network": {
    title: "Portal Network",
    aliases: ["Portal Network", "sieć Portal", "Trin", "Fluffy", "Shisui", "history network", "sieć historii", "portal DHT"],
    summary: "Portal Network to osobna sieć peer-to-peer, w której każdy węzeł przechowuje mały, samodzielnie wybrany wycinek historii Ethereum w rozproszonej tablicy hashy (DHT), dzięki czemu dane usunięte przez [[history-expiry|wygasanie historii]] nadal da się pobrać bez [[archive-node|węzła archiwalnego]].",
    sections: [
      {
        heading: "Każdy węzeł ma wycinek, a nie kopię",
        paragraphs: [
          "[[full-node|Pełny węzeł]] i [[archive-node|węzeł archiwalny]] różnią się tym, jaką część wszystkich danych trzymają; węzeł Portal różni się od nich samym charakterem. Każdy taki węzeł wybiera promień wokół własnego identyfikatora i przechowuje tylko treści, których identyfikator mieści się w tym promieniu, a wyszukiwania wszystkiego innego kieruje do peerów bliższych celowi. Przydatną część może przechowywać telefon albo router i właśnie o to chodzi.",
          "Routing działa na tej samej warstwie discv5 co [[discovery|discovery węzłów]] w warstwie konsensusu, ale jako osobna sieć nakładkowa (overlay) z własnymi podsieciami: siecią historii dla nagłówków, body i receiptów, siecią beacon dla danych lekkich klientów i siecią stanu, która wciąż jest w fazie rozwoju. Pobrane treści są przed użyciem weryfikowane względem kanonicznych nagłówków, więc węzeł Portal nie musi ufać peerowi, który je dostarczył."
        ]
      },
      {
        heading: "Klienci i na co odpowiadają",
        paragraphs: [
          "Implementacje to między innymi Trin (Rust, Ethereum Foundation), Fluffy (Nim, od zespołu [[nimbus|Nimbus]]), Shisui (Go), Ultralight (TypeScript) i Samba (Java). Każda udostępnia lokalny endpoint [[json-rpc|JSON-RPC]], który obsługuje wąski, nastawiony na historię wycinek metod `eth_`, takich jak [[eth-get-block-by-number|eth_getBlockByNumber]] i wyszukiwanie bloków po hashu, oraz metody `portal_` do podglądu samego DHT i zarządzania nim.",
          "Równie ważne jest to, czego te implementacje nie oferują. Bez sieci stanu nie ma [[eth-call|eth_call]], [[eth-get-balance|eth_getBalance]] ani [[eth-get-proof|eth_getProof]]; nie ma też [[mempool|mempoolu]], więc nic nie przyjmie surowej transakcji. Zestaw obsługiwanych metod wciąż się zmienia, dlatego trzeba sprawdzać [[endpoint-capabilities|możliwości]] konkretnego wydania, zamiast zakładać, że obsługuje to samo co klient wykonawczy."
        ]
      },
      {
        heading: "Miejsce w aplikacji",
        paragraphs: [
          "Portal jest odpowiedzią na pytanie, które stawia [[eip|EIP-4444]]: jeśli zwykli [[execution-client|klienci wykonawczy]] przestaną serwować body i receipty sprzed Merge, stary zakres [[eth-get-logs|eth_getLogs]] albo blok sprzed dekady trzeba będzie skądś wziąć. Alternatywy to [[era-files|pliki archiwalne era1]], [[indexer|indekser]] z własną kopią albo provider, który zachował dane, a każda z nich wiąże się z innym modelem zaufania i dostępności.",
          "Trzeba go traktować jako jedno z kilku źródeł danych, a nie jako zamiennik węzła. Gdy trzeba też zweryfikować widok konsensusu, warto połączyć go z [[light-client|lekkim klientem]]. Obok pobranych danych trzeba zapisywać ich pochodzenie, a przy każdym wyprowadzonym rekordzie trzymać [[block-hash|hash bloku]], żeby późniejszy czytelnik mógł ustalić, z którego łańcucha pochodzi dany wiersz."
        ]
      }
    ],
    pitfalls: [
      "Oczekiwanie, że węzeł Portal odpowie na zapytania o stan, takie jak eth_call czy eth_getBalance, dopóki podsieć stanu nie jest gotowa.",
      "Traktowanie go jako lżejszego pełnego węzła, a nie sieci tylko do odczytu, służącej do pobierania danych, w ogóle bez mempoolu.",
      "Zakładanie stałego zestawu obsługiwanych metod zamiast sprawdzenia konkretnego wydania klienta, które zostało wdrożone.",
      "Zapisywanie danych pobranych z klienta Portal bez zapisania ich pochodzenia i hasha bloku, do którego należą."
    ]
  },
  "receipt-retention": {
    title: "Retencja receiptów",
    aliases: [
      "receipt retention",
      "pruning receiptów",
      "receipts log filter",
      "filtr logów receiptów",
      "--prune.receipts",
      "Receipt.StoreReceipts",
      "przechowywanie receiptów",
      "pruned history unavailable",
      "błąd 4444"
    ],
    summary: "Retencja receiptów to to, ile historii [[transaction-receipt|receiptów]] łańcucha trzyma węzeł: każdy blok, niedawne okno, wybrane kontrakty albo nic, z ponownym wykonaniem bloków, żeby odbudować resztę. Decyduje się o niej niezależnie od tego, ile [[state|stanu]] węzeł trzyma.",
    sections: [
      {
        heading: "Decyzja niezależna od stanu",
        paragraphs: [
          "Receipt to wynik wykonania jednej transakcji i tylko jego część jest danymi konsensusu: typ, status, `cumulativeGasUsed`, logsBloom i logi, które nagłówek obejmuje commitmentem przez `receiptsRoot`. Klienci przechowują listę receiptów każdego bloku obok body, w historii, do której dane się tylko dopisuje (append-only), takiej jak freezer w [[geth|Geth]] i static files w [[reth|Reth]], i stanowi ona dużą część tej historii: inspekcja mainnetu w dokumentacji Geth o archiwach pokazuje około 255 GiB receiptów obok 658 GiB body.",
          "Ponieważ receipty są wyprowadzane z wykonania, węzeł może je trzymać dla każdego bloku, dla niedawnego okna, dla wybranych kontraktów albo wcale, a ten wybór jest niezależny od pruningu stanu. [[full-node|Pełny węzeł]], który trzyma stan z 128 ostatnich bloków, może mieć receipty aż do genesis, a [[archive-node|węzeł archiwalny]] może nie mieć żadnych. [[eth-get-logs|eth_getLogs]], [[eth-get-transaction-receipt|eth_getTransactionReceipt]] i [[eth-get-block-receipts|eth_getBlockReceipts]] czytają receipty; [[eth-call|eth_call]] nigdy tego nie robi. Indeks transakcji, który mapuje hash na blok, to trzecie ustawienie retencji: `--history.transactions` w Geth i `Receipt.TxLookupLimit` w Nethermind mają domyślnie 2 350 000 bloków."
        ]
      },
      {
        heading: "Co pozwala wybrać każdy klient",
        paragraphs: [
          "Reth traktuje receipty jako segment pruningu: `--prune.receipts.distance`, `--prune.receipts.before`, `--prune.receipts.pre-merge` albo `--prune.receipts.full`. Jego profil `--full` trzyma ostatnie 10 064 bloki, a `--minimal` trzyma 64. Filtr logów receiptów, `--prune.receiptslogfilter` albo `[prune.segments.receipts_log_filter]` w `reth.toml`, zachowuje tylko receipty zawierające logi z podanych adresów, każdy z własnym `distance` albo `before`, a każdy inny receipt starszy niż 10 064 bloki usuwa.",
          "[[nethermind|Nethermind]] zapisuje receipty, dopóki włączone jest `Receipt.StoreReceipts`, co jest ustawieniem domyślnym, ale świeża synchronizacja pobiera je wstecz tylko do `Sync.AncientReceiptsBarrier`, który w 2.0 ustawiono na mainnecie na blok 24 600 000; `0` pobiera wszystko. `History.Pruning` ustawione na `Rolling` albo `UseAncientBarriers` usuwa już zapisane receipty. Geth trzyma receipty razem z body, a węzeł zsynchronizowany z `--history.chain postmerge` albo przycięty offline przez `geth prune-history` nie ma body ani receiptów sprzed Merge; zobacz [[history-expiry|wygasanie historii]].",
          "[[erigon|Erigon]] 3 idzie najdalej: od v3.6 świeży datadir nie zapisuje żadnych receiptów i odtwarza je na żądanie z historii stanu. `--prune.include-receipts` dodaje cache receiptów, który podąża za oknem historii stanu, chyba że ustawiono `--prune.receipts.distance=keep-all`, a wybór jest ustalany przy tworzeniu datadir."
        ]
      },
      {
        heading: "Odbudowa receiptu oznacza ponowne wykonanie bloku",
        paragraphs: [
          "Usunięty receipt da się odtworzyć tylko przez ponowne wykonanie jego bloku, a wykonanie wymaga stanu z bloku rodzica. Odtwarzanie jest więc dostępne dokładnie tam, gdzie jest historia stanu: w Erigonie działa w jego oknie historii stanu, czyli 262 144 bloki w domyślnym trybie full, a `Receipt.DeriveFromState` w Nethermind, przeznaczone dla węzłów archiwalnych, pomija zapisywanie receiptów i wykonuje blok ponownie na stanie rodzica, gdy zapytanie nie trafi w cache. Węzeł, który usunął receipty i dodatkowo przycina stan, nie odzyska ich zmianą flagi; muszą pochodzić z ponownej synchronizacji, z [[era-files|plików era]] albo z innego węzła.",
          "Odbudowane receipty da się sprawdzić i właśnie dlatego ten kompromis jest bezpieczny. Nethermind serwuje wyprowadzony receipt tylko wtedy, gdy odbudowana lista odtwarza `receiptsRoot` z nagłówka, a ten sam test pozwala węzłowi przyjmować receipty z niezaufanego źródła. Kosztem jest wykonanie: każde chybienie cache to cały blok pracy EVM, więc endpoint, który wyprowadza receipty, potrzebuje [[rate-limits|rate limitów]] na metodach receiptów i logów."
        ]
      },
      {
        heading: "Co widzi wywołujący, gdy receiptów już nie ma",
        paragraphs: [
          "[[execution-apis|Specyfikacja execution-apis]] definiuje błąd `4444`, „Pruned history unavailable”, dla metod bloków, receiptów i logów, a Geth, Reth i Nethermind zwracają go dla bloków poniżej swojej granicy retencji; komunikat Reth podaje najwcześniejszy blok, jaki węzeł wciąż ma. [[eth-get-transaction-receipt|eth_getTransactionReceipt]] to niewygodny przypadek: na przykład Geth najpierw szuka hasha w indeksie transakcji, a dla hasha, którego indeks już nie obejmuje, zwraca `null`, czyli tę samą odpowiedź co dla transakcji, która nigdy nie trafiła do bloku.",
          "Na węźle Reth z filtrem logów receiptów logi z zachowanych kontraktów nadal da się odpytywać, ale `eth_getBlockReceipts` nie ma dla starszych bloków kompletnej listy do zwrócenia. Dla zakresu logów, który przecina granicę retencji, Nethermind dokumentuje błąd, a nie mniejszą liczbę logów; nie każdy klient to gwarantuje. Zanim skieruje się [[indexer|indekser]] na węzeł, trzeba znaleźć najniższy blok, który zwraca receipty, tak jak opisuje temat [[endpoint-capabilities|możliwości endpointu]]."
        ]
      }
    ],
    example: {
      title: "Retencja receiptów w poszczególnych klientach",
      note: "Żadne z tych ustawień nie przywróci receiptów, które węzeł już usunął; decydują one o tym, co węzeł zachowa od teraz albo co pobierze świeża synchronizacja."
    },
    pitfalls: [
      "Odczytywanie `null` z `eth_getTransactionReceipt` dla starego hasha jako „nigdy nie trafiła do bloku”, gdy indeks transakcji albo receipty węzła już nie sięgają tego bloku.",
      "Zachowanie receiptów jednego kontraktu filtrem logów, a potem skierowanie na ten sam węzeł indeksera innego kontraktu; tamtych receiptów już nie ma.",
      "Oczekiwanie odtworzonych receiptów poza oknem historii stanu, gdzie stan rodzica potrzebny do ponownego wykonania bloku już nie istnieje.",
      "Synchronizowanie świeżego węzła mainnetu Nethermind 2.0 pod indekser bez zauważenia, że jego domyślna bariera ancient pomija receipty poniżej bloku 24 600 000."
    ]
  },
  "partial-archive": {
    title: "Częściowe archiwum",
    aliases: [
      "partial archive",
      "archiwum z oknem",
      "przesuwne okno historii stanu",
      "archiwum od wybranego bloku",
      "archiwum dla wybranych adresów",
      "history.state",
      "FlatDb.HistoryRetention",
      "prune.account-history"
    ],
    summary: "Częściowe archiwum przechowuje historyczny [[state|stan]] tylko dla części łańcucha: dla przesuwnego okna ostatnich bloków, dla wszystkiego od wybranego bloku albo dla wybranego zestawu kontraktów. Dzięki temu [[eth-call|eth_call]] na starym bloku działa w tym wycinku, a poza nim kończy się błędem.",
    sections: [
      {
        heading: "Trzy warianty między pruned node a archiwum",
        paragraphs: [
          "Między [[pruned-node|pruned node]], który w [[geth|Gethu]] trzyma stan z około 128 bloków, a pełnym [[archive-node|węzłem archiwalnym]] mieści się cała gama polityk. Przesuwne okno (rolling window) trzyma historię stanu dla ostatnich N bloków i zwalnia starszą historię w miarę, jak head idzie do przodu. Archiwum od bloku (since-block) trzyma wszystko od bloku B wzwyż i nigdy tego nie usuwa. Wycinek kontraktów (contract slice) trzyma głęboką historię dla wymienionych adresów, a do tego małe ogólne okno. Wszystkie trzy to reguły retencji nałożone na change sety albo odwrotne diffy (reverse diffs), które [[client-storage|silnik bazy danych]] i tak zapisuje, a nie inny rodzaj węzła.",
          "Ustawienia różnią się między klientami. Archiwum path-based w Gethu, dostępne od v1.16, indeksuje historię stanu przy `--gcmode archive` i trzyma jej tyle bloków, ile podano w `--history.state`, przy czym `0` oznacza cały łańcuch. Na mainnecie budowa indeksu trwa około 30 godzin i do jej końca węzeł nie udostępnia żadnych danych historycznych. [[reth|Reth]] usuwa historię kont i storage osobno, flagami `--prune.account-history.distance` albo `.before` oraz odpowiadającymi im flagami `--prune.storage-history`. [[erigon|Erigon]] 3 wybiera preset przez `--prune.mode` i przesuwa okno stanu przez `--prune.distance`. [[nethermind|Nethermind]] 2.0 oferuje wszystkie trzy warianty na swojej płaskiej bazie: `FlatDb.HistoryRetention` ustawione na `Rolling` z `HistoryRetentionBlocks` albo na `SinceBlock` z `HistoryRetentionSinceBlock`, a do tego `FlatDb.HistorySliceAddresses`. Spośród tych czterech klientów tylko Nethermind dokumentuje wycinek stanu dla poszczególnych kontraktów, a ustawienie Retha dla poszczególnych adresów obejmuje wyłącznie receipty."
        ]
      },
      {
        heading: "Historii, której węzeł nie zapisał, nie da się odzyskać",
        paragraphs: [
          "Wycinek to polityka tego, co węzeł zapisuje podczas wykonywania bloków; nie sięga wstecz. Poszerzenie okna albo obniżenie dolnej granicy nie przywraca bloków, które już usunięto albo których nigdy nie wykonano. Dokumentacja Getha mówi, że usuniętej historii stanu nie da się odzyskać, Reth nazywa pruning destrukcyjnym, a płaska historia Nethermind działa tylko do przodu, bez uzupełniania wstecz poniżej punktu, w którym ją włączono. Węzeł zsynchronizowany przez [[snap-sync|snap sync]] ma historię stanu dopiero od bloku pivot, od którego zaczął synchronizację. Starsza historia musi pochodzić z ponownej synchronizacji od genesis z nową polityką, ze [[database-snapshot|snapshotu bazy danych]] węzła, który ją zachował, albo z innego endpointu.",
          "Zmiana wariantu często oznacza też nową bazę danych. Nethermind odmawia przełączenia płaskiej historii bez okna na `Rolling` albo `SinceBlock` na istniejącej bazie, a Erigon każe usunąć `chaindata` przed zmianą trybu pruningu. Dolną granicę trzeba ustawiać z myślą o ponownym wykonaniu bloków. Tracing bloku wykonuje go ponownie na stanie rodzica, więc węzeł, który ma robić trace od bloku B, potrzebuje historii od B minus jeden. Dokumentacja archiwum Nethermind mówi o tym wprost."
        ]
      },
      {
        heading: "Wycinek kontraktów musi obejmować wszystko, czego dotyka kontrakt",
        paragraphs: [
          "Historyczne eth_call uruchamia kod, a kod czyta wszystko, do czego dotrze: implementację za [[proxy-contract|proxy]] w wersji z tamtego bloku, tokeny, na których wywołuje `balanceOf`, oracle, z którego bierze ceny, pulę albo fabrykę (factory), przez które przechodzi routing. Każdy z tych kontraktów ma własny storage. Na węźle z wycinkiem odczyt spoza wycinka kończy się błędem (fail closed): Nethermind zwraca błąd o usuniętej historii, zamiast odpowiadać z bieżącego stanu. Wywołanie pada więc w połowie wykonania, a to, czy padnie, zależy od ścieżki w kodzie i od danych wejściowych, a nie tylko od wywołanego adresu.",
          "Użyteczny wycinek musi więc objąć pełny zbiór tego, czego mogą dotknąć zapytania, łącznie z każdą implementacją, na którą proxy wskazywało w zachowanym zakresie, bo aktualizacje zmieniają to, który kod się wykonuje. Nethermind trzyma też body i receipty każdego bloku, w którym pojawia się adres z wycinka, więc logi i transakcje też są dostępne. Historyczne [[eth-get-proof|eth_getProof]] to osobna gwarancja: Geth 1.17 potrzebuje do tego `--history.trienode`, a Nethermind udostępnia historyczne dowody tylko z historii bez okna, więc nie zapewnia ich ani okno, ani wycinek."
        ]
      },
      {
        heading: "Szukanie granic",
        paragraphs: [
          "Węzeł, który obsługuje [[eth-capabilities|eth_capabilities]], metodę dodaną do specyfikacji [[json-rpc|JSON-RPC]] w czerwcu 2026, podaje najstarszy blok, który obejmuje jego stan, a dla przesuwnego okna także długość tego okna, choć metoda nie ma pola na wycinek obejmujący tylko wybrane kontrakty. Błąd dla stanu spoza zakresu różni się między klientami, a według issue trackera samego Nethermind nawet między metodami tego klienta. Tam, gdzie tej metody nie ma, dolną granicę znajduje się wyszukiwaniem binarnym na [[eth-get-balance|eth_getBalance]]; tak czy inaczej każdy kontrakt z wycinka sprawdza się reprezentatywnym wywołaniem, a wynik zapisuje tak, jak opisano w [[endpoint-capabilities|możliwościach endpointu]]. Dolna granica przesuwnego okna rośnie z każdym blokiem, więc granica sprawdzona wczoraj jest już nieaktualna. Trzeba zostawić margines, a [[rpc-gateway|gateway]] powinien kierować żądania według wysokości bloku do węzła, którego wycinek je obejmuje."
        ]
      }
    ],
    example: {
      title: "Ta sama idea w trzech klientach",
      note: "Każde z tych ustawień zaczyna zapisywać historię od miejsca, w którym węzeł zaczyna wykonywać bloki; żadne nie uzupełnia historii poniżej tego punktu."
    },
    pitfalls: [
      "Podniesienie `--history.state` albo przesuwnego okna na działającym węźle w oczekiwaniu, że wrócą bloki, które węzeł już usunął.",
      "Objęcie wycinkiem tylko kontraktu, który wywołuje aplikacja, z pominięciem implementacji za jego proxy, tokenów, które czyta, i oracle, z którego korzysta.",
      "Ustawienie dolnej granicy archiwum od bloku na pierwszym bloku, dla którego potrzebny jest trace, choć ponowne wykonanie tego bloku wymaga stanu jego rodzica.",
      "Traktowanie zmierzonej granicy okna jako stałej; dolna granica przesuwnego okna rośnie z każdym blokiem.",
      "Oczekiwanie historycznego `eth_getProof` na węźle z oknem tylko dlatego, że działa tam historyczne `eth_call`."
    ]
  },
  "database-snapshot": {
    title: "Snapshot bazy danych",
    aliases: [
      "snapshot bazy danych",
      "snapshot węzła",
      "snapshot datadir",
      "snapshot chaindata",
      "reth download",
      "Snapshot.DownloadUrl",
      "przywracanie ze snapshotu"
    ],
    summary: "Snapshot bazy danych to opublikowana kopia katalogu danych innego węzła, od której nowy węzeł startuje zamiast się synchronizować. Dziedziczy przy tym układ danych, wersję klienta i retencję publikującego, a każdy blok, którego sam nie wykonał, przyjmuje na słowo publikującego.",
    sections: [
      {
        heading: "Start z cudzego dysku",
        paragraphs: [
          "Synchronizacja [[archive-node|węzła archiwalnego]] trwa tygodnie, a nawet [[snap-sync|snap sync]] zajmuje godziny; snapshot zastępuje jedno i drugie pobraniem danych. Klient startuje z bazą danych na bloku N i od tego miejsca podąża za łańcuchem. Takie kopie publikują [[rpc-provider|providerzy]] i zespoły klientów: `reth download` domyślnie pobiera je ze snapshots.reth.rs, pozwala operatorowi wybrać komponenty, takie jak `--with-receipts`, `--with-state-history`, `--full` albo `--archive`, i zapisuje `reth.toml` z ustawieniami pruningu dopasowanymi do tego, co przyszło. Plugin Snapshot w Nethermind (`Snapshot.Enabled`, `Snapshot.DownloadUrl`, `Snapshot.Checksum`) pobiera i rozpakowuje archiwum, zanim baza danych zostanie otwarta, i nic nie robi, jeśli baza już istnieje. Kopiowanie katalogu danych między własnymi węzłami to ta sama operacja, tylko bez publikującego.",
          "To, co przychodzi, to sama baza danych, więc to ona wyznacza, na co węzeł może odpowiadać. Razem z nią przychodzi retencja: snapshot pełnego węzła nie zawiera historycznego stanu i żadna flaga nie zrobi z niego później [[partial-archive|częściowego archiwum]]. Podobnie z układem danych: [[nethermind|Nethermind]] 2.0 zostawia istniejącą bazę patricia jako patricia, zamiast przenieść ją na backend flat, a rozmiar strony MDBX w Reth można ustawić tylko przy tworzeniu bazy. Liczy się też wersja: bazy zapisanej przez nowsze wydanie może się nie dać otworzyć w starszym, a [[erigon|Erigon]] ma polecenia do podnoszenia i obniżania wersji formatów swoich plików. Brakujące receipty albo brakujący indeks transakcji pozostaną brakujące; zobacz [[receipt-retention|retencję receiptów]]."
        ]
      },
      {
        heading: "Co jest sprawdzane, a co przyjmowane na wiarę",
        paragraphs: [
          "Snap sync pobiera stan od niezaufanych peerów, ale każdy zakres przychodzi z dowodem względem [[state-root|state rootu]] nagłówka pivot, za który poręczyła strona konsensusu, a faza healing uzupełnia trie, więc węzeł kończy ze stanem, który sam udowodnił. Przywrócony snapshot nie dostaje przy starcie niczego porównywalnego: klient ufa własnym metadanym. Dwa sprawdzenia następują później. Nagłówki są połączone hashami, więc gdy fork choice pokaże, że head snapshotu jest przodkiem kanonicznego headu, cały łańcuch nagłówków jest autentyczny. A każdy nowy blok, który węzeł wykona, musi odtworzyć state root ze swojego [[block-header|nagłówka]].",
          "Żadne z tych sprawdzeń nie sięga daleko. Wykonanie bloku dotyka tylko kont i slotów, których blok używa, a dla całej reszty korzysta z zapisanych hashy pośrednich, więc błędna wartość, której nie dotknie żaden blok, leży pod rootem, który nadal się zgadza. Body i receipty są objęte commitmentami `transactionsRoot` i `receiptsRoot`, ale przy otwieraniu bazy nikt ich ponownie nie sprawdza. Historyczny stan, indeks transakcji i indeksy logów nie są objęte żadnym commitmentem, który można sprawdzić na podstawie nagłówka. Przywrócone archiwum odpowiada na stare [[eth-call|eth_call]] ze stanu, którego nigdy nie wykonało, chyba że ktoś go zweryfikuje: `geth snapshot verify-state` przelicza bieżący root ze stanu flat, a `FlatDb.HistoryVerifyEveryBlock` w Nethermind odbudowuje root w każdym objętym historycznym bloku i porównuje go z nagłówkami węzła."
        ]
      },
      {
        heading: "Sumy kontrolne i pochodzenie",
        paragraphs: [
          "Suma kontrolna dowodzi, że bajty dotarły nienaruszone; tego, skąd pochodzą, dowodzi tylko wtedy, gdy uzyskano ją w innym miejscu niż serwer z plikiem. `reth download` sprawdza hash BLAKE3 i rozmiar każdego rozpakowanego pliku względem manifestu pobranego z tego samego źródła, a Nethermind sprawdza sumę SHA-256 z `Snapshot.Checksum`, którą może przypiąć konfiguracja dostarczana z klientem; tak robi jego konfiguracja archiwum OP Mainnet dla bazy, od której startują te węzły. Podpis publikującego wiąże plik z kluczem, ale nadal nic nie mówi o łańcuchu. Zanim przywrócony węzeł dołączy do puli, trzeba porównać jego head i hash sfinalizowanego bloku z niezależnym węzłem, jak opisuje temat [[trusted-header|zaufany nagłówek]], i sprawdzić metody, które ma obsługiwać."
        ]
      },
      {
        heading: "To nie są pliki snapshotów Erigona",
        paragraphs: [
          "Erigon używa tego słowa w innym znaczeniu: nazywa tak niezmienne pliki segmentów `.seg` i indeksy w katalogu `snapshots/`, które przechowują jego nagłówki, body, transakcje i historię stanu jako część zwykłego [[client-storage|układu danych]]. Sfinalizowany segment jest identyczny co do bajtu na każdym węźle Erigona, więc zwykła synchronizacja pobiera go przez BitTorrent po hashu, z listy preverified (hashy zweryfikowanych z góry), którą Erigon domyślnie pobiera z własnego CDN. Kwestia zaufania jest podobna, bo domyślnie węzeł pobiera pliki historii stanu, których sam nie wykonał, chyba że wystartuje z `--snap.skip-state-snapshot-download`. Hashe przypina jednak projekt Erigon, a nie ten, kto hostuje tarball, a pliki są jednym z komponentów datadir, a nie jego kopią."
        ]
      }
    ],
    example: {
      title: "Przywracanie i sprawdzanie tego, co przywrócono",
      note: "Suma kontrolna dowodzi tylko poprawności transferu; o tym, że dane należą do łańcucha kanonicznego, mówią przebieg weryfikacji i porównanie hashy z niezależnym węzłem."
    },
    pitfalls: [
      "Przywrócenie snapshotu pełnego węzła, a potem włączenie ustawień archiwalnych w oczekiwaniu, że historyczne `eth_call` zacznie odpowiadać.",
      "Uznawanie sumy kontrolnej pobranej z tego samego hosta co snapshot za dowód pochodzenia snapshotu.",
      "Przywracanie bazy danych do starszego wydania klienta niż to, które ją zapisało.",
      "Wpuszczanie przywróconego węzła do puli bez porównania jego hashy headu i sfinalizowanego bloku z niezależnym węzłem.",
      "Aktualizacja przywróconej bazy patricia Nethermind do 2.0 w oczekiwaniu na opcje archiwum z historią flat, które działają tylko z bazą flat."
    ]
  },
  "era-files": {
    title: "Pliki era",
    aliases: ["era files", "era1", "e2store", "ere", "EraE", "archiwum era", "import-history", "historical hashes accumulator", "EIP-7643"],
    summary: "Pliki era to archiwa e2store z historią łańcucha w paczkach po 8192 bloki albo sloty: era1 dla bloków wykonawczych i receiptów sprzed Merge, era dla bloków beacon i beacon state, ere dla historii wykonawczej po obu stronach Merge. Służą do przenoszenia wygasłej historii poza siecią peer-to-peer i do jej weryfikacji po dotarciu.",
    sections: [
      {
        heading: "Jeden kontener, kilka formatów",
        paragraphs: [
          "e2store to płaski plik w układzie type-length-value: każdy wpis ma 8-bajtowy nagłówek z 2-bajtowym typem, 4-bajtową długością i 2 zarezerwowanymi bajtami, a po nim dane, zwykle w ramkach snappy, więc każdy wpis da się rozpakować osobno; na końcu jest indeks do swobodnego dostępu. era1 przechowuje historię wykonawczą sprzed Merge jako `Version | (CompressedHeader, CompressedBody, CompressedReceipts, TotalDifficulty)* | Accumulator | BlockIndex`, najwyżej 8192 bloki na plik, co daje 1897 plików dla łańcucha mainnetu sprzed Merge. To z takich plików węzły stosujące [[history-expiry|wygasanie historii]] przywracają to, co usunęły, i właśnie takie pliki serwują przez HTTP społecznościowe endpointy historii.",
          "Pliki era to odpowiednik z warstwy konsensusu: każda grupa zawiera [[beacon-block|bloki beacon]] z jednego okresu 8192 slotów, czyli około 27 godzin, oraz beacon state na jego końcu, w plikach o nazwach takich jak `mainnet-00001-40cf2f3c.era`. Od [[the-merge|Merge]] bloki beacon niosą swoje [[execution-payload|execution payloady]], więc pliki era zawierają też bloki wykonawcze po Merge, ale nie receipty ani stan wykonawczy. ere, nowszy format wykonawczy, obejmuje obie strony Merge: nagłówki, body, odchudzone receipty bez blooma, opcjonalne dowody dla każdego bloku i profile, takie jak `noproofs`, oznaczane w nazwie pliku. Repozytorium formatu e2store oznacza teraz format era1 jako przestarzały, a Nethermind nazywa ere EraE."
        ]
      },
      {
        heading: "Sprawdzanie pliku względem łańcucha kanonicznego",
        paragraphs: [
          "Plik `checksums.txt` obok plików dowodzi tylko tego, że zgadzają się z tym, co opublikował dany serwer. Kotwicą dla era1 jest jego wpis Accumulator: SSZ `hash_tree_root` z maksymalnie 8192 rekordów zawierających hash bloku i total difficulty. Rooty wszystkich epok sprzed Merge tworzą historical hashes accumulator, zamrożony w chwili Merge, którego root EIP-7643 podaje jako `0xec8e040fd6c557b41ca8ddd38f7e9d58a9281918dc92bdb72342a38fb085e701`. Program czytający plik hashuje każdy [[block-header|nagłówek]] w pliku, odbudowuje akumulator pliku, porównuje go z zamrożonym wpisem dla tej epoki, a potem sprawdza body względem `transactionsRoot`, a [[transaction-receipt|receipty]] względem `receiptsRoot` nagłówków, którym już ufa. Nic nie jest wykonywane i nie jest sprawdzany żaden proof of work.",
          "Pliki era warstwy konsensusu kotwiczą się w niedawnym beacon state, któremu czytający już ufa, na przykład uzyskanym przez [[checkpoint-sync|checkpoint sync]]: jego `historical_roots` i, od Capella, `historical_summaries` obejmują commitmentem każdy miniony okres, każdy root bloku w pliku musi się zgadzać z `block_roots` stanu z danego okresu, a podpisy bloków weryfikuje się kluczami walidatorów z tego stanu. Pliki ere mogą zawierać dowody dla każdego nagłówka względem akumulatora sprzed Merge albo tych rootów beacon, czyli te same typy dowodów, których używa [[portal-network|Portal Network]]. Plik zapisany z profilem `noproofs`, a tak zapisują je dziś Geth i Nethermind, trzeba sprawdzić względem nagłówków z innego źródła."
        ]
      },
      {
        heading: "Import i eksport",
        paragraphs: [
          "[[geth|Geth]] ma `geth export-history <dir> <first> <last>` i `geth import-history <dir>`, a każde z nich przyjmuje `--era.format era1` albo `ere`; import działa tylko na węźle, który wciąż jest na genesis, i sprawdza SHA-256 każdego pliku względem `checksums.txt` w tym samym katalogu. `geth download-era --server <url>` pobiera pliki era1 i weryfikuje je względem sum kontrolnych wbudowanych w binarkę dla mainnetu i Sepolii. [[nethermind|Nethermind]] importuje przez `Era.ImportDirectory`, `Era.From` i `Era.To`, eksportuje przez `Era.ExportDirectory` i udostępnia `admin_importHistory` oraz `admin_exportHistory`; bez `Era.TrustedAccumulatorFile` ufa akumulatorom z katalogu importu. Jego opcje EraE są analogiczne i potrafią pobrać brakujące pliki z `EraE.RemoteBaseUrl`, sprawdzając je względem `checksums_sha256.txt` z serwera.",
          "[[reth|Reth]] ma `reth import-era` z `--path` albo `--url`, `reth export-era` oraz `--era.enable`, które pozwala podczas synchronizacji brać historię sprzed Merge z plików era1; Reth czyta nagłówki i body, a następnie je wykonuje, więc jego receipty są jego własne. Zastosowania to przywracanie historii, którą węzeł przyciął, zasilanie [[indexer|indeksera]] albo węzła Portal bez pobierania przez sieć peer-to-peer oraz cold storage dla [[historical-data|danych historycznych]], których zwykłe węzły już nie trzymają."
        ]
      }
    ],
    example: {
      title: "Nazwy plików i przenoszenie historii do węzła i z węzła",
      note: "Plik era1 dla epoki N obejmuje bloki od N×8192 do N×8192+8191; blok 15 537 393, ostatni blok sprzed Merge, leży w epoce 1896, czyli w pliku numer 1897."
    },
    pitfalls: [
      "Traktowanie `checksums.txt` serwowanego obok plików jako weryfikacji; pokazuje on tylko, że pliki zgadzają się z tym, co opublikował dany serwer.",
      "Import era1 do Nethermind bez `Era.TrustedAccumulatorFile`, przez co katalog importu staje się sam dla siebie źródłem zaufania.",
      "Oczekiwanie, że pliki era warstwy konsensusu dostarczą receipty; zawierają bloki beacon z execution payloadami, ale nie receipty ani stan wykonawczy.",
      "Uruchamianie `geth download-era` dla zakresów po Merge; to polecenie pobiera tylko pliki era1.",
      "Zakładanie, że plik ere z profilem `noproofs` da się zweryfikować samodzielnie; jego nagłówki potrzebują innego źródła, które je zakotwiczy."
    ]
  }
};
