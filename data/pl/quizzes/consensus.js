// Polish checkpoint questions for the Consensus lessons, keyed by topic id. Each topic's
// six questions match data/quizzes/consensus.js in order, kind, and answer position.
export const quizzes = {
  "proof-of-stake": [
    {
      kind: "contrast",
      question: "Blok beacon zawiera execution payload. Jak klient konsensusu i klient wykonawczy dzielą się pracą przy jego obsłudze?",
      options: [
        "Klient wykonawczy go wykonuje i oblicza state root",
        "Klient konsensusu go wykonuje, a klient wykonawczy przechowuje",
        "Klient konsensusu oblicza state root ze zwróconych receiptów",
        "Klient walidatora go wykonuje, zanim klient konsensusu podpisze"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co w proof of stake decyduje o tym, jaką wagę ma głos walidatora?",
      options: [
        "Liczba epok, przez które walidator jest aktywny",
        "Wolumen ruchu RPC, który obsługuje jego beacon node",
        "Jego efektywne saldo, zgodnie z regułami protokołu",
        "Łączny gas zużyty przez bloki, które dotąd zaproponował"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Aplikacja wysyła transakcję i w każdym slocie odpytuje endpoint Beacon API. Co to wnosi do konsensusu?",
      options: [
        "Słaby głos na head, na którym zbudowano transakcję",
        "Pasywny status atestującego dla odpytującego adresu",
        "Dodatkową wagę w fork choice dla węzła, który ją obsługuje",
        "Nic; żadne z tych żądań nie jest głosem walidatora"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Serwer walidatora nie działa przez kilka godzin i walidator pomija swoje obowiązki. Co robi z tym proof of stake?",
      options: [
        "Nakłada na walidatora slashing za spóźnione atestacje",
        "Walidator traci te nagrody i może dostać kary",
        "Od razu usuwa walidatora z aktywnego zbioru",
        "Zamraża stake, dopóki operator nie podpisze ponownego wejścia"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Czego proof of stake wymaga od zupełnie nowego obserwatora, zanim ten zacznie śledzić długą historię konsensusu?",
      options: [
        "Pełnego logu eventów kontraktu depozytowego od genesis",
        "Podpisanej atestacji od proposera bieżącego slotu",
        "Archiwalnego węzła wykonawczego, by odtworzyć każdy blok od genesis",
        "Checkpointu weak subjectivity albo innego zaufanego punktu odniesienia"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Jedyny alert w konfiguracji walidatora obserwuje jego saldo. Które sygnały pokazałyby, że konsensus i wykonanie się rozjeżdżają?",
      options: [
        "Base fee, rozmiar mempoolu i liczba transakcji pending",
        "Statusy Engine API, peery i sfinalizowane checkpointy",
        "Opóźnienie żądań, trafienia w cache i odsetek błędów HTTP",
        "Zużyty gas w bloku, liczba transakcji i odsetek bloków ommer"
      ],
      answer: 1
    }
  ],
  "slot-epoch": [
    {
      kind: "scenario",
      question: "Mija slot, a twój węzeł nie widzi w nim bloku. Co to oznacza?",
      options: [
        "Łańcuch wstawił pusty blok wykonawczy, żeby numeracja była ciągła",
        "Reorganizacja usunęła blok, który był w tym slocie",
        "Węzeł stracił peery konsensusu i trzeba go zrestartować",
        "Żaden proposer go nie opublikował albo węzeł jeszcze go nie dostał"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego numer bloku warstwy wykonawczej nie może zastąpić numeru slotu Beacon Chain?",
      options: [
        "Numery bloków to wartości hex, a sloty to ciągi dziesiętne",
        "Slot mija także bez bloku, więc liczniki się rozjeżdżają",
        "Numery bloków zaczynają się od zera na każdej granicy epoki",
        "Sloty liczą tylko bloki, które osiągnęły już finalność"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Łączysz rekordy beacon z rekordami warstwy wykonawczej wyłącznie po timestampie. Co może pójść źle?",
      options: [
        "Nic, bo konsensus i wykonanie znakują bloki tym samym zegarem",
        "Timestampy zapisuje tylko strona konsensusu, więc żadne złączenie się nie uda",
        "Pominięty slot albo konkurencyjna gałąź sparują niewłaściwe rekordy",
        "Timestampy ustawiają builderzy, więc każde złączenie jest spóźnione o slot"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co indekser powinien zapisywać dla każdego bloku, żeby odróżnić pominięty slot od pustego bloku warstwy wykonawczej?",
      options: [
        "Numer, hash, hash rodzica i slot, jeśli jest dostępny",
        "Numer, timestamp, zużyty gas i base fee na jednostkę gasu",
        "Hash, liczbę transakcji i receipts root",
        "Numer, timestamp i adres odbiorcy opłat proposera"
      ],
      answer: 0
    },
    {
      kind: "scenario",
      question: "Reguła monitoringu oznacza pojedynczy pusty slot jako reorg. Co powinna sprawdzić, zanim wyciągnie taki wniosek?",
      options: [
        "Czy eth_blockNumber wzrósł dokładnie o jeden",
        "Liczbę transakcji pending w kliencie wykonawczym",
        "Przodków bloku i stan konsensusu",
        "Status health checku upstreamu w load balancerze"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co klient walidatora dostaje z przydziału obowiązków od klienta konsensusu, czego nie da mu lokalny timer slotów?",
      options: [
        "Dokładniejszy zegar, zsynchronizowany z granicą slotu",
        "Klucz do podpisywania, który zmienia się na każdej granicy epoki",
        "Zgodę sieci na podpisywanie w tym konkretnym slocie",
        "Przydziały do komitetów, które mogą się zmienić przy przejściu epoki"
      ],
      answer: 3
    }
  ],
  "fork-choice": [
    {
      kind: "detail",
      question: "Co waży reguła fork choice, gdy wybiera head spośród konkurujących bloków?",
      options: [
        "Łączny zużyty gas na każdej z konkurujących gałęzi",
        "Najnowsze dostępne atestacje walidatorów",
        "Liczbę transakcji w każdym bloku kandydującym",
        "Skumulowaną trudność (difficulty) każdej gałęzi"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Dwa endpointy zwracają dla latest ten sam numer bloku. Czy to ten sam blok?",
      options: [
        "Tak; na danej wysokości może istnieć tylko jeden prawidłowy blok",
        "Tak, o ile endpointy zgłaszają ten sam chain ID",
        "Niekoniecznie; trzeba porównać hashe, bo gałęzie mogą konkurować",
        "Niekoniecznie, ale tylko dopóki jeden z nich się synchronizuje"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co sprawia, że sfinalizowany checkpoint to inny rodzaj stwierdzenia niż bieżący head?",
      options: [
        "Head wybiera proposer, a o finalności decyduje relay",
        "Finalność wylicza klient wykonawczy, a head klient konsensusu",
        "Head pozostaje tylko wskazówką, dopóki nie przyjmie go indekser",
        "Późny głos może przesunąć head; sfinalizowana historia ma zostać"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dwa sprawne węzły przez kilka sekund podają różne hashe head, a potem się zgadzają. Jakie jest zwykłe wyjaśnienie?",
      options: [
        "Przez opóźnienie propagacji jeden zobaczył nowy blok pierwszy",
        "Jeden z nich przez chwilę podążał za łańcuchem innej sieci",
        "Ich klienci wykonawczy nie zgadzali się co do state root",
        "Sfinalizowany checkpoint cofnął się, a potem wrócił"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Zespół przypina każdego użytkownika do jednego węzła RPC przez sticky sessions. Co to zmienia, gdy head protokołu się przesuwa?",
      options: [
        "Reorgi nie docierają do tego użytkownika, dopóki sesja nie wygaśnie",
        "Odczyty są zgodne z jednym węzłem, ale head nadal może się zmienić",
        "latest zachowuje się jak tag safe przez całą sesję",
        "Head przypiętego węzła jest zamrożony na czas trwania sesji"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Trzeba wykonać trzy odczyty stanu, które muszą być ze sobą zgodne. Jak je zaadresować?",
      options: [
        "Wysłać każdy do innego endpointu, wszystkie z tagiem latest",
        "Użyć tagu pending, żeby żaden z nich nie był opóźniony",
        "Umieścić je w jednym batchu JSON-RPC, każdy z latest",
        "Przypiąć każdy do tego samego jawnego hasha lub numeru bloku"
      ],
      answer: 3
    }
  ],
  finality: [
    {
      kind: "detail",
      question: "Co według reguł konsensusu musi się stać z checkpointem, zanim zostanie sfinalizowany?",
      options: [
        "Najpierw musi stać się justified głosami kwalifikowanej większości",
        "Musi zostać wskazany hashem w nagłówku następnego bloku wykonawczego",
        "Musi zostać kontrasygnowany przez proposera następnego slotu",
        "Musi zebrać skonfigurowaną liczbę potwierdzeń bloku"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dwa endpointy obsługują tag finalized. Dlaczego przez chwilę mogą zwracać dla niego różne bloki?",
      options: [
        "Jeden z nich podąża za innym chain ID",
        "Każdy klient definiuje finalized względem innej epoki",
        "Węzły odbierają i przetwarzają finalność w różnym czasie",
        "Tag odświeża się tylko wtedy, gdy wywołujący wprost o to poprosi"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Finalność przestaje się przesuwać, a eth_blockNumber dalej rośnie. Co należy sprawdzić?",
      options: [
        "Tylko klienta wykonawczego, bo to on produkuje bloki",
        "Uczestnictwo walidatorów, peery i statusy Engine API",
        "Konfigurację sticky sessions w load balancerze",
        "Mempool, bo przeterminowane transakcje blokują finalność"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Provider zwraca saldo oznaczone jako finalized, a kontrakt rozlicza na jego podstawie duże kwoty. Co sama ta etykieta ustala?",
      options: [
        "Że ktoś już kryptograficznie zweryfikował to saldo",
        "Że każdy endpoint zwraca teraz dla niego tę samą wartość",
        "Który blok węzeł providera uważa obecnie za finalized",
        "Że wartość udowodniono względem zaufanego nagłówka"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Usługa odczytuje dwa powiązane salda w osobnych żądaniach, każde z tagiem finalized. Co może się stać, jeśli finalność przesunie się między nimi?",
      options: [
        "Drugie żądanie zawiedzie, dopóki nie odświeży się cache węzła",
        "Węzeł przypnie te dwa odczyty do pierwszego sfinalizowanego bloku",
        "Drugi odczyt skończy się revertem, bo jego blok jest już nieaktualny",
        "Odczyty trafią na różne bloki i mogą się nie zgadzać"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym sfinalizowany checkpoint różni się od bloku, nad którym narosła stała liczba potwierdzeń?",
      options: [
        "Finalność wynika z głosów walidatorów; liczba potwierdzeń to lokalna polityka",
        "Potwierdzenia liczą walidatorzy, a finalność providerzy",
        "Każde z nich to gwarancja protokołu, ale finalność przychodzi kilka slotów szybciej",
        "Liczbę potwierdzeń egzekwuje fork choice klienta wykonawczego"
      ],
      answer: 0
    }
  ],
  "execution-payload": [
    {
      kind: "contrast",
      question: "Klient wykonawczy odpowiada na payload statusem SYNCING, a nie INVALID. Na czym polega różnica?",
      options: [
        "To ten sam status, tylko różni klienci zapisują go inaczej",
        "SYNCING łamie regułę; INVALID oznacza, że payload przyszedł za późno",
        "INVALID łamie reguły wykonania; SYNCING jeszcze nie rozstrzyga",
        "SYNCING dotyczy bloków konsensusu, a INVALID bloków wykonawczych"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Proposer użył payloadu od buildera. Do czego odnosi się commitment w podpisanym przez niego bloku beacon?",
      options: [
        "Do kwoty oferty (bid) relaya, zapisanej jako pole konsensusu",
        "Do nagłówka wybranego execution payloadu",
        "Do pełnej listy transakcji, przejrzanej przed podpisem",
        "Do podpisu buildera nad listą transakcji"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Węzeł ma wolną bazę danych. Jak może się to objawić po stronie konsensusu?",
      options: [
        "Peery odrzucają jego atestacje z powodu nieprawidłowych podpisów",
        "Sekret JWT dla Engine API wygasa i trzeba go wymienić",
        "Body bloków beacon przychodzą od peerów gossip obcięte",
        "Wolna walidacja payloadu sprawia, że nie zdąży z propozycją bloku"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Aplikacja chce odczytać blok wykonawczy, który przyniósł nowy blok beacon. Jak zwykle to robi?",
      options: [
        "Przez eth_getBlockByHash albo subskrypcję w JSON-RPC",
        "Przez engine_getPayload, wywołane bezpośrednio na kliencie wykonawczym",
        "Przez engine_newPayload, z rootem bloku beacon w parametrach",
        "Przez ścieżkę validators w Beacon API dla tego slotu"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Blok beacon zawiera execution payload. Co jest w tym payloadzie?",
      options: [
        "Atestacje, sync aggregate i indeks proposera",
        "Transakcje, wypłaty i commitment w postaci state root",
        "Przydziały do komitetów, mixy RANDAO i obowiązki walidatorów",
        "Podpisy depozytów, slashingi i JWT do Engine API"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Po co klientowi konsensusu w ogóle status payloadu od klienta wykonawczego?",
      options: [
        "Potrzebuje go do obliczenia własnego revealu RANDAO",
        "Status zawiera atestacje, które klient musi zagregować",
        "Bez niego nie da się odblokować klucza walidatora do podpisu",
        "Sam nie wykonuje transakcji, więc nie może ich ocenić"
      ],
      answer: 3
    }
  ],
  "block-proposal": [
    {
      kind: "contrast",
      question: "Czym w obrębie jednego slotu obowiązek proposera różni się od obowiązku atestowania?",
      options: [
        "Każdy z nich składa blok, ale rozgłaszany jest tylko blok proposera",
        "Proposer tworzy blok, a atestujący na niego głosują",
        "Atestujący buduje payload, a proposer go opakowuje",
        "Atestujący działają co slot, a proposerzy raz na epokę"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Walidator przegapił propozycję bloku. Gdzie szukać przyczyny?",
      options: [
        "W odpowiedzi JSON-RPC, którą aplikacja dostała dla tego slotu",
        "Na publicznym dashboardzie relaya, uznanym za wiarygodne źródło",
        "W logach wszystkich trzech procesów i na ścieżce buildera",
        "W mempoolu klienta wykonawczego, wśród transakcji pending"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Operator korzystający z MEV-Boost chce wyłączyć klienta wykonawczego, żeby oszczędzić zasoby. Co przestanie działać?",
      options: [
        "Nic nie oceni payloadów ani nie zwróci statusu przez Engine API",
        "Relaye odmówią ofert proposerom bez zsynchronizowanego mempoolu",
        "Klucz walidatora, przechowywany przez klienta wykonawczego, przepadnie",
        "MEV-Boost nie będzie mógł przekazywać atestacji węzła"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Skąd klient walidatora dowiaduje się, że ma przydział proposera w danym slocie?",
      options: [
        "Od relaya, w którym się zarejestrował",
        "Od klienta wykonawczego przez Engine API",
        "Od klienta konsensusu, z którym jest sparowany",
        "Z logów eventów emitowanych przez kontrakt depozytowy"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co się zmienia, gdy proposer przechodzi z budowania lokalnego na ścieżkę buildera?",
      options: [
        "Reguły poprawności, które musi spełniać execution payload",
        "Walidator, którego protokół wyznacza do zaproponowania bloku w slocie",
        "To, czy blok nadal potrzebuje atestacji, żeby zostać head",
        "Kto ustala kolejność transakcji i jak dociera payload"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Indekser widzi blok w chwili, gdy zostaje on zaproponowany. Jak powinien go traktować?",
      options: [
        "Jako finalny, bo przydzielony proposer już go podpisał",
        "Jako tymczasowy, dopóki nie zaakceptuje go polityka potwierdzeń",
        "Jako kanoniczny, gdy tylko status payloadu wróci jako VALID",
        "Jako nieprawidłowy, dopóki nie zatwierdzi go granica następnej epoki"
      ],
      answer: 1
    }
  ],
  "beacon-block": [
    {
      kind: "consequence",
      question: "Blok beacon jest poprawnie podpisany przez przydzielonego mu proposera, ale jego execution payload jest nieprawidłowy. Jaki jest ten blok?",
      options: [
        "Prawidłowy w warstwie konsensusu, problem dotyczy tylko RPC wykonawczego",
        "Nieprawidłowy; podpis proposera nie uczyni payloadu poprawnym",
        "Prawidłowy, bo atestacje bloku przeważają nad błędami payloadu",
        "Tymczasowy, dopóki granica następnej epoki nie rozstrzygnie jego statusu"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego aplikacja nie powinna hardkodować kształtu body bloku beacon?",
      options: [
        "Każda implementacja klienta układa pola w innej kolejności",
        "Endpoint konsensusu zwraca body jako nieprzejrzyste bajty",
        "Schemat jest wersjonowany i zmienia się z aktualizacjami sieci",
        "Body jest niedostępne w API, dopóki blok nie zostanie sfinalizowany"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Które identyfikatory warto zachować, łącząc blok beacon z jego blokiem wykonawczym?",
      options: [
        "Timestamp i numer bloku, wspólne dla każdej z warstw",
        "Indeks proposera, epokę i zużyty gas",
        "Chain ID, numer epoki i parent root",
        "Slot, root bloku beacon i hash bloku wykonawczego"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Aplikacja łączy dane beacon z danymi wykonawczymi. Skąd pobiera każdy rodzaj bloku?",
      options: [
        "Jedne i drugie przez JSON-RPC wykonawcze, w przestrzeniach nazw eth_ i beacon_",
        "Bloki beacon z endpointu konsensusu, wykonawcze przez JSON-RPC",
        "Bloki beacon przez Engine API, wykonawcze z Beacon API",
        "Jedne i drugie z Beacon API, które ma osobny endpoint dla każdej warstwy"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co oprócz execution payloadu zawiera body bloku beacon?",
      options: [
        "Receipty transakcji i filtr Blooma logów",
        "Przydziały do komitetów na następną epokę",
        "Atestacje i inne operacje konsensusu",
        "Saldo każdego walidatora w tym slocie"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Lekki klient ma uwierzytelniony nagłówek beacon. Co jeszcze musi sprawdzić, zanim zaufa wartości ze stanu wykonawczego?",
      options: [
        "Drugi podpis proposera nad tym samym nagłówkiem beacon",
        "Czy numer bloku tej wartości zgadza się ze slotem beacon",
        "Nic więcej; nagłówek beacon zawiera commitment do każdego salda",
        "Powiązany nagłówek execution payloadu, a potem dowód stanu"
      ],
      answer: 3
    }
  ],
  "mev-boost": [
    {
      kind: "contrast",
      question: "Co MEV-Boost zmienia w tym, jak powstaje blok?",
      options: [
        "Zastępuje reguły przejścia klienta wykonawczego regułami buildera",
        "Pozwala klientowi konsensusu sfinalizować blok bez atestacji",
        "Przenosi składanie payloadu do builderów; reguły poprawności zostają",
        "Pozwala relayom podpisywać bloki w imieniu proposera"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "W slocie proposera każdy skonfigurowany relay przekracza timeout. Jakie opcje zostają proposerowi?",
      options: [
        "Powrót do lokalnie zbudowanego payloadu albo utrata slotu",
        "Podpisanie najnowszej oferty, jaką któryś relay wysłał wcześniej",
        "Przekazanie obowiązku następnemu walidatorowi z komitetu",
        "Przedłużenie poprzedniego bloku przez klienta konsensusu"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Która część setupu walidatora musi pozostać poza ścieżką buildera i relaya?",
      options: [
        "Beacon API klienta konsensusu, dostępne tylko do odczytu",
        "Mempool klienta wykonawczego",
        "Klucz podpisujący klienta walidatora",
        "Ustawienia wykrywania peerów węzła"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Który komponent prosi middleware o ofertę podczas propozycji z włączonym MEV-Boost?",
      options: [
        "Klient wykonawczy, przez Engine API",
        "Relay, w imieniu swoich builderów",
        "Klient walidatora, bezpośrednio u builderów",
        "Klient konsensusu proposera"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Co odróżnia rolę buildera od roli relaya na ścieżce MEV-Boost?",
      options: [
        "Relay tworzy payload; builder podpisuje go za proposera",
        "Builder tworzy payload i ofertę; relay pośredniczy w dostarczeniu",
        "Builder sprawdza klucz proposera; relay ustala kolejność transakcji",
        "Relay płaci proposerowi; builder płaci relayowi prowizję"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Operator ogranicza listę relayów do jednego. Na jakie właściwości wpływa ten wybór?",
      options: [
        "Wagę atestacji, szanse na sync committee i finalność",
        "Ryzyko slashingu, kolejkę wyjść i opóźnienie wypłat",
        "Limit gasu, base fee i liczbę blobów",
        "Odporność na cenzurę, dostępność i oczekiwaną wartość"
      ],
      answer: 3
    }
  ],
  validator: [
    {
      kind: "detail",
      question: "Jakie największe efektywne saldo może mieć od Pectra walidator z credentials typu compounding 0x02?",
      options: ["32 ETH", "1024 ETH", "2048 ETH", "4096 ETH"],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Indekser uzgadnia salda ETH na podstawie transakcji i receiptów, a mimo to adres stakera wciąż zyskuje ETH, którego indekser nie potrafi wyjaśnić. Dlaczego?",
      options: [
        "Nagrody przychodzą jako wewnętrzne wywołania ukryte przed receiptami",
        "Wypłaty zasilają ten adres bez transakcji i bez receiptu",
        "Kontrakt depozytowy emituje zwroty jako anonimowe logi",
        "Nagrody beacon są wypłacane systemową transakcją"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Odpowiedź Beacon API pokazuje balance 32041938475 i effective_balance 32000000000. Która interpretacja jest poprawna?",
      options: [
        "Każda wartość jest w wei, a wagę głosu w slocie ustala balance",
        "Każda wartość jest w gwei, a wagę głosu w slocie ustala balance",
        "Wartość balance jest w wei, a effective_balance w gwei",
        "Każda wartość jest w gwei, a wagę głosu ustala effective_balance"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Łańcuch przez długi czas nie finalizuje. Co dzieje się z walidatorami, którzy przestali uczestniczyć?",
      options: [
        "Dostają slashing po czterech epokach bez głosu",
        "Inactivity leak drenuje ich salda, aż reszta znów może finalizować",
        "Ich efektywne salda zamarzają do powrotu finalności",
        "Zostają wyrzuceni przy następnej rotacji sync committee"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym różni się koszt bycia offline od kosztu slashingu?",
      options: [
        "Przestój po dobie wywołuje slashing; equivocation daje ostrzeżenie",
        "Jedno i drugie kosztuje tyle samo stake, ale slashing przychodzi szybciej",
        "Przestój wymusza wyjście; equivocation kosztuje mniej więcej jedną nagrodę",
        "Przestój kosztuje pominięte nagrody; equivocation niszczy stake"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego walidator może przenieść się na nowy sprzęt bez wiedzy łańcucha?",
      options: [
        "Kontrakt depozytowy co epokę na nowo wiąże jego adres IP",
        "Jego withdrawal credentials przechodzą z nim między maszynami",
        "Jego tożsamość to klucz i indeks, a nie host",
        "Sync committee co okres ponownie rejestruje jego adres"
      ],
      answer: 2
    }
  ],
  attestation: [
    {
      kind: "detail",
      question: "Jedna atestacja zawiera naraz trzy twierdzenia. Jakie?",
      options: [
        "Root bloku head, state root warstwy wykonawczej i indeks proposera",
        "Root bloku head, checkpoint source i checkpoint target",
        "Slot, saldo walidatora i okres sync committee",
        "Blok rodzica, transactions root i numer epoki"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Uczestnictwo walidatorów gwałtownie spada, ale bloki wciąż powstają. Co najpierw zauważy aplikacja czytająca JSON-RPC?",
      options: [
        "eth_getBlockByNumber zwraca null dla latest",
        "Każde eth_call kończy się błędem execution reverted",
        "latest dalej się przesuwa, a finalized stoi w miejscu",
        "eth_chainId przełącza się na chain ID forka"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego pojedyncze atestacje są agregowane, zanim trafią do bloku?",
      options: [
        "Reguła fork choice czyta tylko jeden podpis na komitet w każdym slocie",
        "Agregacja ukrywa, którzy walidatorzy głosowali, dla prywatności",
        "Protokół ogranicza body bloku do 512 pojedynczych podpisów",
        "Milion głosów by się nie zmieścił; pola bitowe i jeden podpis tak"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Aplikacja chce ustalić, któremu walidatorowi odpowiada ustawiony bit w aggregation_bits. Czego potrzebuje?",
      options: [
        "Komitetów tego slotu wskazanych w jego committee_bits",
        "Klucza publicznego walidatora, odzyskanego z podpisu",
        "Indeksu proposera bloku w tym samym slocie",
        "Składu sync committee w danym okresie"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym w atestacji beacon_block_root różni się od pary source i target?",
      options: [
        "Root zasila Casper FFG; source i target zasilają LMD-GHOST",
        "Root wskazuje proposera; source i target wskazują slot",
        "Root jest opcjonalny, a source i target są obowiązkowe",
        "Root zasila LMD-GHOST; source i target zasilają Casper FFG"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Zegar węzła dryfuje, więc jego atestacje stale docierają za późno. Jaki jest skutek?",
      options: [
        "Są odrzucane i liczą się jako pominięte obowiązki",
        "Liczą się dla fork choice, ale zarabiają mniej",
        "Są traktowane jako podwójny głos i karane slashingiem",
        "Liczą się w pełni, gdy tylko zacznie się następny slot"
      ],
      answer: 1
    }
  ],
  "sync-committee": [
    {
      kind: "detail",
      question: "Ilu walidatorów zasiada w sync committee i jak długo służy jeden komitet?",
      options: [
        "128 walidatorów przez jedną epokę, około 6,4 minuty",
        "512 walidatorów przez 4096 epok, około 18 dni",
        "512 walidatorów przez 256 epok, około 27 godzin",
        "Jeden walidator na slot, zmiana co 12 sekund"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego lekki klient może śledzić łańcuch długo po swoim pierwotnym zaufanym punkcie startowym?",
      options: [
        "Klucze komitetu nigdy się nie zmieniają, gdy już je pobierze",
        "Każdy zweryfikowany okres pozwala mu udowodnić następny komitet",
        "Co epokę pobiera od nowa cały zbiór walidatorów",
        "Proposer podpisuje certyfikat, który przedłuża jego zaufanie"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Proxy weryfikowanego RPC ma nagłówek, któremu ufa dzięki aktualizacjom sync committee. Czego jeszcze potrzebuje, żeby odpowiedzieć na eth_getBalance bez zaufania?",
      options: [
        "Niczego więcej; sam nagłówek zawiera salda kont",
        "Drugiego podpisu sync committee nad tym kontem",
        "Węzła archiwalnego, żeby lokalnie wykonać blok ponownie",
        "Dowodu stanu z dowolnego źródła, sprawdzonego z tym nagłówkiem"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Dlaczego podpis sync committee jest słabszym dowodem niż finalność?",
      options: [
        "Członkowie nie podlegają slashingowi za podpis złego nagłówka",
        "Podpisy komitetu nie są agregowane, więc łatwo je podrobić",
        "Obejmuje bloki jednej epoki, a nie cały łańcuch",
        "Tworzy go sam proposer danego slotu"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Członkowie komitetu podpisują root bloku bieżącego slotu. Gdzie trafia ten podpis?",
      options: [
        "Do aggregation_bits tego bloku, po jednym bicie na członka",
        "Do sync_aggregate następnego bloku, jako bity i jeden podpis",
        "Na listę atestacji następnego bloku, po jednej na członka",
        "Do pola extra data w execution payloadzie"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Lekki klient robi bootstrap od roota bloku, którego nigdy nie sprawdził. Co przez to traci?",
      options: [
        "Nic; każda kolejna aktualizacja dowodzi się sama od zera",
        "Może śledzić aktualizacje optymistyczne, ale już nie finalności",
        "Musi co okres pobierać od nowa cały zbiór walidatorów",
        "Każdy komitet, któremu potem ufa, stoi na niesprawdzonym starcie"
      ],
      answer: 3
    }
  ],
  slashing: [
    {
      kind: "scenario",
      question: "Operator przegląda cztery incydenty u swoich walidatorów. Który z nich prowadzi do slashingu?",
      options: [
        "Cały dzień offline i pominięcie każdej atestacji",
        "Podpisanie dwóch atestacji, z których przedział jednej otacza drugi",
        "Zaproponowanie bloku, który sieć później usuwa reorgiem",
        "Klient wykonawczy, który przez kilka godzin zostaje w tyle za headem"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego kara korelacyjna rośnie z tym, ile innego stake'u ukarano slashingiem mniej więcej w tym samym czasie?",
      options: [
        "Żeby wynagrodzić zgłaszającego, który przesłał dowód",
        "Bo protokół nie potrafi zmierzyć salda walidatora przy wyjściu",
        "Żeby błąd jednego operatora był dużo tańszy niż skoordynowany atak",
        "Żeby utrzymać stałą łączną podaż ETH w kolejnych epokach"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Co baza ochrony przed slashingiem klienta walidatora zapisuje dla każdego klucza?",
      options: [
        "Zaszyfrowaną kopię klucza podpisującego i hasło do keystore'a",
        "Bloki i atestacje, które ten klucz już podpisał",
        "Podpisy każdego peera, który rozgłaszał jego bloki",
        "Listę relayów, z których walidator może korzystać"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Operator uruchamia te same klucze walidatora na hoście zapasowym, gdy główny może nadal działać. Na czym polega ryzyko?",
      options: [
        "Łańcuch widzi dwóch peerów i zmniejsza wagę walidatora o połowę",
        "Głosy hosta zapasowego są ignorowane, dopóki główny nie wyjdzie",
        "Każdy host atestuje, więc walidator zarabia podwójne nagrody",
        "Hosty podpisują sprzeczne wiadomości i walidator dostaje slashing"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Usługa obserwuje JSON-RPC warstwy wykonawczej pod kątem slashingów i jeszcze żadnego nie zauważyła. Gdzie pojawiają się dowody?",
      options: [
        "W body bloków beacon i w statusie z Beacon API",
        "W logu w receipcie, emitowanym przez kontrakt depozytowy",
        "W wyniku eth_getLogs dla systemowego kontraktu slashingu",
        "W tablicy withdrawals najbliższego następnego bloku"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Co dzieje się z walidatorem tuż po slashingu?",
      options: [
        "Atestuje dalej ze zmniejszoną wagą, dopóki sam nie zdecyduje się wyjść",
        "Całe jego saldo zostaje spalone w bloku z dowodem",
        "Dostaje karę początkową i trafia do kolejki wymuszonego wyjścia",
        "Zostaje zawieszony na jedną epokę, a potem wraca do obowiązków"
      ],
      answer: 2
    }
  ],
  mev: [
    {
      kind: "scenario",
      question: "Zaraz wysyłasz duży swap przez publiczny endpoint. Który ustawiany przez ciebie parametr najbardziej bezpośrednio ogranicza to, co może wyciągnąć sandwich?",
      options: [
        "Limit gasu, bo sandwich potrzebuje dodatkowego gasu, żeby cię otoczyć",
        "Limit slippage, bo przy większym ruchu ceny swap skończy się revertem",
        "maxFeePerGas, bo wyższy limit kupuje pierwszą pozycję",
        "Nonce, bo ustala twoją pozycję w bloku"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Kto dziś zwykle decyduje o kolejności transakcji w bloku, do którego trafia transakcja na mainnecie?",
      options: [
        "Węzeł, do którego ją wysłano, bo składa blok z własnego mempoolu",
        "Protokół, który sortuje transakcje według efektywnej ceny gasu",
        "Zewnętrzny builder, którego payload proposer podpisuje w ciemno",
        "Relay, który przestawia kolejność po podpisaniu przez proposera"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co naprawdę mówi o transakcji udana symulacja eth_call na latest?",
      options: [
        "Wynik na bieżącym stanie, zanim inni zaczną handlować wokół niej",
        "Dokładny wynik, jaki transakcja będzie miała po włączeniu do bloku",
        "Że żaden searcher nie celuje teraz w adres nadawcy",
        "Że transakcja trafi do najbliższego bloku"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Searcher wyraża okazję jako bundle. Jaka cecha definiuje bundle?",
      options: [
        "Jego transakcje mają jeden wspólny nonce i jeden podpis",
        "To szablon bloku, który relay wysyła prosto do proposerów",
        "To batch JSON-RPC, który węzeł wykonuje w jednym żądaniu",
        "Jego transakcje wchodzą razem, w kolejności, albo wcale"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Kierujesz swap przez prywatny endpoint dla transakcji zamiast przez publiczny mempool. Jaki kompromis pozostaje?",
      options: [
        "Nie da się go już zastąpić późniejszą transakcją z tym nonce",
        "Traci ochronę przed powtórzeniem, więc może wykonać się na innym łańcuchu",
        "Builder, który go dostaje, nadal go widzi, a wejście może potrwać dłużej",
        "Płaci relayowi stałą opłatę ponad priority fee"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Bot czyta txpool_content, żeby przewidzieć kolejność w następnym bloku. Dlaczego to zawodne?",
      options: [
        "Zawiera tylko transakcje, które już trafiły do bloków",
        "Jest posortowany według czasu przybycia, który builderzy potem odwracają",
        "To lokalny mempool jednego węzła, który nie wiąże żadnego buildera",
        "Ukrywa transakcje z opłatami poniżej base fee"
      ],
      answer: 2
    }
  ],
  randao: [
    {
      kind: "scenario",
      question: "Kontrakt loterii wybiera zwycięzcę na podstawie block.prevrandao bloku, który zawiera transakcję losowania. Kto najtaniej wpłynie na wynik?",
      options: [
        "Proposer tego bloku, dołączając losowanie albo je opóźniając",
        "Dowolny searcher, wstawiając w bundlu transakcję tuż przed losowaniem",
        "Nikt, bo wartość jest nieznana, dopóki blok nie zostanie zamknięty",
        "Członkowie sync committee, którzy podpisują nagłówek tego bloku"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego proposer nie może wielokrotnie generować randao_reveal, szukając korzystniejszej wartości?",
      options: [
        "Reveal wybiera komitet atestujący, a nie proposer",
        "Reveal musi pasować do commitmentu złożonego przy depozycie",
        "Reveal to deterministyczny podpis BLS nad numerem epoki",
        "Reveal jest najpierw hashowany razem ze state root rodzica"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Pod jaką nazwą pola wartość PREVRANDAO bloku występuje w odpowiedziach JSON-RPC warstwy wykonawczej?",
      options: [
        "difficulty, przedefiniowane w miejscu przez EIP-4399",
        "mixHash, pole nagłówka, które przejęło tę wartość",
        "prevRandao, dodane do nagłówka jako nowe pole",
        "nonce, które przy Merge straciło znaczenie z czasów kopania"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym losowość z wyroczni VRF różni się od PREVRANDAO?",
      options: [
        "Jest darmowa, bo każdy węzeł oblicza ją lokalnie",
        "Zawsze jest dostarczana, bo dostawcy nie mogą odmówić",
        "Jest odporna na manipulację tylko z wyprzedzeniem czterech epok",
        "Ma dowód, więc dostawca nie może wybierać wyników"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Podmiot kontroluje ostatnie k slotów epoki i dla każdego decyduje, czy opublikować blok. Co zyskuje?",
      options: [
        "Kontrolę nad mixem aż do następnej finalizacji łańcucha",
        "Możliwość ustawienia swojego revealu na dowolną wartość",
        "Wybór spośród 2 do potęgi k seedów dla późniejszej epoki",
        "Trwały wpływ, którego późniejsze uczciwe reveale nie cofną"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Dapp wdrożony bez zmian na Arbitrum czyta block.prevrandao jako źródło losowości. Co otrzymuje?",
      options: [
        "Mix z L1 z odpowiadającego bloku Ethereum",
        "Stałą 1, identyczną w każdym bloku",
        "Nową wartość, którą sekwencer wylicza dla każdego bloku",
        "Błąd, bo ten opcode jest tam wyłączony"
      ],
      answer: 1
    }
  ],
  "builder-api": [
    {
      kind: "scenario",
      question: "Walidator podpisał blinded block, ale payload nigdy nie został opublikowany, a slot jeszcze trwa. Co powinien zrobić jego klient?",
      options: [
        "Podpisać lokalnie zbudowany blok i opublikować go przed końcem slotu",
        "Pogodzić się z utratą slotu i nie podpisywać dla niego niczego nowego",
        "Podpisać nowy blinded block z następnej najlepszej otrzymanej oferty",
        "Poprosić klienta wykonawczego o odtworzenie payloadu buildera"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego strona buildera może bezpiecznie ujawnić transakcje, gdy proposer podpisał już blinded block?",
      options: [
        "Klient proposera usuwa nagłówek zaraz po podpisaniu",
        "Payload pozostaje zaszyfrowany kluczem buildera aż do włączenia",
        "Relaye ujawniają payloady tylko proposerom, którzy wpłacili kaucję",
        "Każdy inny blok dla tego slotu byłby propozycją grożącą slashingiem"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Co po Fulu zwraca proposerowi wywołanie submitBlindedBlock w wersji v2?",
      options: [
        "202 Accepted bez body; publikuje strona buildera",
        "Pełny execution payload razem z jego blobami",
        "Podpisany receipt dowodzący, że blok rozgłoszono",
        "Ten sam nagłówek, dodatkowo podpisany kluczem relaya"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym na ścieżce produkcji bloku v3 builder_boost_factor=100 różni się od builder_boost_factor=0?",
      options: [
        "100 zawsze bierze ofertę; 0 całkowicie wyłącza buildera",
        "100 podwaja wartość lokalnego bloku; 0 jej nie zmienia",
        "100 bierze to, co płaci więcej; 0 preferuje lokalny payload",
        "100 czeka na oferty pełną sekundę; 0 w ogóle nie czeka"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Lighthouse z ustawieniami domyślnymi widzi trzy pominięte sloty z rzędu tuż przed slotem, w którym ma zaproponować blok. Co robi?",
      options: [
        "Pomija builderów i buduje blok lokalnie",
        "Pyta tylko relay z najlepszą ostatnią historią",
        "Wydłuża czekanie na oferty builderów o sekundę",
        "Wstrzymuje propozycję do finalizacji łańcucha"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Do czego służy timestamp w ValidatorRegistrationV1?",
      options: [
        "Ustala slot, od którego obowiązuje fee recipient",
        "Unieważnia rejestrację po dokładnie jednej epoce",
        "Dowodzi, że walidator był online w chwili podpisu",
        "Porządkuje rejestracje, żeby starsza nie wygrała"
      ],
      answer: 3
    }
  ],
  relay: [
    {
      kind: "scenario",
      question: "Analityk sumuje value z proposer_payload_delivered w pięciu relayach za miesiąc i dostaje więcej, niż proposerzy faktycznie otrzymali. Jaka jest najbardziej prawdopodobna przyczyna?",
      options: [
        "Relaye podają value w gwei, a nie w wei",
        "API danych wypisuje też oferty, które przegrały aukcję",
        "Ten sam blok występuje jako dostarczony w kilku relayach",
        "Podane wartości obejmują base fee, które zostało spalone"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Którą metodę JSON-RPC mev-boost-relay wywołuje na swoim węźle wykonawczym, żeby sprawdzić zgłoszony blok z Fulu?",
      options: [
        "flashbots_validateBuilderSubmissionV5",
        "engine_newPayloadV4 z dołączoną ofertą",
        "eth_callBundle względem rodzica bloku",
        "debug_traceBlock z payloadem jako wejściem"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego symulacja relaya sprawdza, czy ostatnia transakcja płaci proposerowi albo czy saldo fee recipienta wzrosło?",
      options: [
        "Reguły konsensusu odrzucają każdy blok, który za mało płaci proposerowi",
        "Engine API przyjmuje payloady tylko wtedy, gdy płatność jest na końcu",
        "Fee recipient samego buildera musi zakończyć blok z pustym saldem",
        "Proposer podpisuje w ciemno i sam nie może sprawdzić płatności"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Na czym proposer polega w relayu, a na czym builder?",
      options: [
        "Na tym, że nie ukradnie treści bloku, a builder na poprawności i publikacji",
        "Na poprawności i publikacji, a builder na tym, że nie ukradnie treści bloku",
        "Na wypłacie obiecanej oferty, a builder na zwrocie za nieudane bundle",
        "Na finalności bloku, a builder na włączeniu każdego wysłanego bundla"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Węzeł symulacyjny relaya błędnie akceptuje niepoprawny blok, a proposer podpisuje jego nagłówek. Co dalej?",
      options: [
        "Blok staje się kanoniczny, bo relay za niego poręczył",
        "Sieć odrzuca blok, a proposer traci slot",
        "Proposer dostaje slashing za podpisanie niepoprawnego nagłówka",
        "Zabezpieczenie buildera po fakcie czyni blok poprawnym"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Programista wysyła żądania eth_sendBundle do boost-relay.flashbots.net, bo to przecież relay. Co jest nie tak?",
      options: [
        "To relay MEV-Boost; bundle wysyła się do relay.flashbots.net",
        "Bundle trzeba wysyłać przez WebSocket, a nie przez zwykłe HTTP",
        "Do relaya mogą cokolwiek wysyłać tylko zarejestrowani walidatorzy",
        "Żądania bundli muszą mieć w URL klucz publiczny BLS relaya"
      ],
      answer: 0
    }
  ],
  searcher: [
    {
      kind: "contrast",
      question: "Czym rola searchera różni się od roli buildera bloków?",
      options: [
        "Podpisuje bloki dla slotu; builder tylko je symuluje",
        "To rola w protokole; builder to usługa poza łańcuchem",
        "Prowadzi relay; builder prowadzi sidecar proposera",
        "Proponuje sekwencje transakcji; builder składa bloki"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Searcher symuluje backrun przez eth_call na latest, wysyła go na następny blok, a mimo to backrun się nie udaje. Jaki jest najbardziej prawdopodobny powód?",
      options: [
        "eth_call nie potrafi symulować transakcji przenoszących wartość",
        "Builder umieścił w bloku inne transakcje przed nim",
        "Tag latest wskazywał już na blok, do którego celowano",
        "Builderzy wykonują bundle na stanie finalized, a nie latest"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co określa parametr stateBlockNumber w eth_callBundle?",
      options: [
        "Blok, do którego bundle ma trafić",
        "Ostatni blok, w którym bundle jest jeszcze ważny",
        "Blok, na którego stanie bundle jest wykonywany",
        "Blok, w którym ostatnio użyto nonce nadawcy"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego poważni searcherzy uruchamiają własne węzły zamiast korzystać ze współdzielonego endpointu providera?",
      options: [
        "W ramach slotu nie ma miejsca na dodatkowe przeskoki i limity",
        "Providerom nie wolno serwować eth_call botom handlowym",
        "Tylko lokalny węzeł jest w stanie wysyłać bundle do builderów bloków",
        "Współdzielone endpointy w żadnej formie nie obsługują eth_subscribe"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Searcher robi backtest strategii z całego roku na pełnym węźle z pruningiem. Co się stanie?",
      options: [
        "Odtworzenia się udają, ale pomijają wszystkie wywołania wewnętrzne",
        "Węzeł po cichu podstawia bieżący stan w miejsce starych bloków",
        "Wyniki są poprawne, ale dziesięć razy wolniejsze niż na archiwum",
        "Odtworzenia kończą się błędem missing trie node poza oknem stanu"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Co niesie hint MEV-Share nawet wtedy, gdy nadawca nie zgodzi się udostępnić niczego więcej?",
      options: [
        "Pełne, podpisane bajty całej transakcji",
        "Adres nadawcy i jego aktualny nonce",
        "Podwójnie zahashowany hash transakcji",
        "Calldata i adres docelowy"
      ],
      answer: 2
    }
  ],
  "distributed-validator": [
    {
      kind: "scenario",
      question: "Klaster Charona z czterema operatorami działa z progiem trzech, a maszyna jednego operatora pada. Co dzieje się z obowiązkami?",
      options: [
        "Są wykonywane dalej, bo trzy części wciąż spełniają próg",
        "Zatrzymują się do czasu odtworzenia czwartej części z kopii",
        "Są wykonywane dalej, ale klaster nie może już proponować bloków",
        "Wstrzymują się, dopóki klaster nie powtórzy generowania klucza"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego operatorzy rozproszonego walidatora przeprowadzają rundę konsensusu przed podpisaniem każdego obowiązku?",
      options: [
        "Beacon chain wymaga certyfikatu kworum przy każdym głosie",
        "Każda część klucza podpisuje inny fragment danych atestacji",
        "Klient walidatora nie podpisze niczego bez numeru rundy",
        "Podpisy częściowe łączą się, tylko gdy dotyczą jednego obiektu"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym miejsce węzła SSV w stosie różni się od miejsca Charona?",
      options: [
        "Trzyma cały klucz na jednym węźle i kopiuje podpisy na zewnątrz",
        "Sam wykonuje obowiązki zamiast klienta walidatora",
        "Nie potrzebuje beacon node'a, bo czyta tylko kontrakt",
        "Pośredniczy w Beacon API dla niezmodyfikowanego klienta walidatora"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Po co węzłowi SSV połączenie WebSocket z klientem wykonawczym?",
      options: [
        "Wysyła każdy podpis częściowy jako transakcję",
        "Buduje execution payloady dla swoich propozycji",
        "Czyta z kontraktu eventy walidatorów i operatorów",
        "Sprawdza saldo ETH każdego operatora przed podpisem"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Operator składa progową liczbę części w zwykły klucz i uruchamia go, gdy klaster nadal działa. Co z tego wynika?",
      options: [
        "Podwójny podpis, a z nim slashing, jest niemal pewny",
        "Klaster to zauważa i przekazuje obowiązki nowemu kluczowi",
        "Nic, bo łańcuch nie odróżni od siebie podpisujących",
        "Części zostają unieważnione i klaster przestaje podpisywać"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co musi wytworzyć klaster rozproszonego walidatora, zanim jego beacon node może zostać poproszony o blok do zaproponowania?",
      options: [
        "Świeżą ceremonię generowania klucza dla tego slotu",
        "Progowo połączony RANDAO reveal dla tej epoki",
        "Podpisaną rejestrację u buildera dla każdego relaya",
        "Zagregowaną atestację z poprzedniego slotu"
      ],
      answer: 1
    }
  ],
  preconfirmation: [
    {
      kind: "detail",
      question: "Która kolejność idzie od najsłabszej gwarancji do najmocniejszej?",
      options: [
        "Włączenie do bloku, preconf, safe, finalized",
        "Preconf, safe, włączenie do bloku, finalized",
        "Preconf, włączenie do bloku, safe, finalized",
        "Safe, preconf, włączenie do bloku, finalized"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Co zabezpiecza based preconf, a czego nie ma soft confirmation od scentralizowanego sekwencera L2?",
      options: [
        "Zabezpieczenie, które przepada w slashingu za złamany commitment",
        "Dowód zero-knowledge dotyczący zawartości przyszłego bloku",
        "Podpis sync committee z bieżącego okresu",
        "Zapis transakcji on-chain jeszcze przed jej włączeniem"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego EIP-7917, wprowadzony w Fulu, był ważny dla projektów based preconf?",
      options: [
        "Pozwala proposerom podpisywać commitmenty kluczami BLS",
        "Dodaje metodę eth_ do zamawiania commitmentu",
        "Czyni złamanie commitmentu przewinieniem grożącym slashingiem",
        "Ustala w beacon state proposerów następnej epoki"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Aplikacja oznacza swap użytkownika na L2 jako zakończony, bo sekwencer zwrócił receipt sekundę po wysłaniu. Co użytkownik faktycznie ma?",
      options: [
        "Sfinalizowany wynik, bo receipt wskazuje hash bloku",
        "Preconf z unsafe head, jeszcze nie na L1",
        "Włączenie na L1, bo receipty istnieją dopiero po zbatchowaniu",
        "Blok safe, bo sekwencery podpisują tylko bloki justified"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Portfel symuluje transakcję przez eth_call na latest, a w następnym bloku mają się przed nią wykonać transakcje objęte preconfami. Na czym polega ryzyko?",
      options: [
        "Wywołanie się nie powiedzie, bo latest odrzuca oczekujące commitmenty",
        "Węzeł odrzuci wywołanie, dopóki commitmenty nie trafią do bloku",
        "Wynik opisuje stan, na który transakcja nigdy nie trafi",
        "Symulacja liczy transakcje objęte commitmentami podwójnie"
      ],
      answer: 2
    },
    {
      kind: "detail",
      question: "Jak Base udostępnia stan z Flashblocks wywołującym RPC?",
      options: [
        "Przez nową metodę eth_getPreconfirmation na każdym węźle",
        "Przez tag safe, aktualizowany co 200 milisekund",
        "Przez calldata na L1, czytelne po opublikowaniu batcha",
        "Przez tag pending w standardowych metodach, takich jak eth_call"
      ],
      answer: 3
    }
  ],
  "validator-rewards": [
    {
      kind: "scenario",
      question: "Dashboard stakingowy sumuje priority fees z każdego bloku, który jego walidatorzy zaproponowali przez MEV-Boost, i podaje to jako dochód z warstwy wykonawczej. Co jest nie tak?",
      options: [
        "Priority fees są spalane, więc prawdziwa suma zawsze wynosi zero",
        "Te opłaty poszły do buildera; proposer dostał jego przelew",
        "Priority fees są wypłacane później, przez sweep wypłat",
        "Suma jest dobra, ale trzeba ją przeliczyć z gwei na wei"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Który głos w atestacji, gdy zostanie pominięty, nie kosztuje walidatora nic poza utraconą nagrodą?",
      options: ["Głos target", "Głos source", "Głos head", "Podpis sync committee"],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego ścieżka nagród za atestacje zawodzi dla epoki sprzed miesięcy na beacon node po pruningu?",
      options: [
        "Przelicza nagrody ze stanów, których węzeł już nie trzyma",
        "Nagrody starsze niż jeden sweep wypłat są usuwane z łańcucha",
        "Ścieżka przyjmuje tylko epoki, które nie są jeszcze sfinalizowane",
        "Stare nagrody serwuje w zamian sparowany klient wykonawczy"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Jak dochód z konsensusu trafia na adres w warstwie wykonawczej w porównaniu z priority fees?",
      options: [
        "Transakcją z kontraktu depozytowego, a opłaty przez sweep",
        "Na fee recipient co epokę, a opłaty wymagają wypłaty",
        "Jako log w receipcie, a opłaty są tylko w stanie beacon",
        "Przez sweep wypłat, a opłaty są zapisywane w samym bloku"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Walidator wciąż ma withdrawal credentials 0x00. Co dzieje się z nagrodami konsensusu, które zarabia?",
      options: [
        "Sweep przelewa je w zamian na adres fee recipient walidatora",
        "Zostają w Beacon Chain, dopóki credentials się nie zmienią",
        "Są spalane na granicy każdej epoki, dopóki nikt ich nie odbierze",
        "Są wypłacane jako zwykła transakcja przy każdym sweepie"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Co obejmuje pole total w ścieżce nagród za blok w Beacon API?",
      options: [
        "Tylko nagrody konsensusu, bez priority fees i MEV",
        "Nagrody konsensusu plus priority fees z bloku",
        "Priority fees i MEV, bez nagród konsensusu",
        "Wszystko, co zarobił proposer, wyrażone w wei"
      ],
      answer: 0
    }
  ],
  "bls-signature": [
    {
      kind: "detail",
      question: "Jakie rozmiary mają skompresowany klucz publiczny BLS i podpis w warstwie konsensusu Ethereum?",
      options: [
        "96-bajtowy klucz publiczny, 48-bajtowy podpis",
        "33-bajtowy klucz publiczny, 65-bajtowy podpis",
        "64-bajtowy klucz publiczny, 64-bajtowy podpis",
        "48-bajtowy klucz publiczny, 96-bajtowy podpis"
      ],
      answer: 3
    },
    {
      kind: "cause",
      question: "Dlaczego atestacja dużego komitetu nadal niesie tylko jeden podpis?",
      options: [
        "Podpisuje tylko agregator, a pozostali członkowie są wymienieni",
        "Podpisy pod identycznymi danymi agregują się w jeden",
        "Członkowie podpisują łańcuch hashy i zostaje tylko ostatnie ogniwo",
        "Proposer podpisuje ją ponownie w imieniu komitetu"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Narzędzie sprawdza podpis atestacji z mainnetu, ale liczy domenę z genesis validators root testnetu. Co się dzieje?",
      options: [
        "Weryfikacja przechodzi, bo typ domeny jest ten sam",
        "Weryfikacja przechodzi, ale tylko dla wiadomości sprzed forka",
        "Weryfikacja nie przechodzi, choć sam podpis jest poprawny",
        "Weryfikacja nie przechodzi tylko przy różnych wersjach forka"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym weryfikacja podpisu BLS różni się od sprawdzania podpisu ECDSA w warstwie wykonawczej?",
      options: [
        "BLS wymaga klucza publicznego na wejściu; ECDSA odzyskuje podpisującego",
        "BLS odzyskuje podpisującego; ECDSA wymaga klucza publicznego na wejściu",
        "BLS wymaga adresu podpisującego; ECDSA wymaga chain ID",
        "BLS wymaga klucza prywatnego; ECDSA wymaga tylko wiadomości"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Ktoś wpłaca depozyt dla nowego klucza walidatora, ale podpis depozytu się nie weryfikuje. Co się dzieje?",
      options: [
        "Kontrakt depozytowy robi revert i zwraca ETH",
        "Walidator się aktywuje, ale nie może podpisywać atestacji",
        "Depozyt czeka, aż ktoś dostarczy poprawny podpis",
        "Walidator nie powstaje, a ETH nie jest zwracane"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Kontrakt przekazuje 48-bajtowy klucz publiczny walidatora prosto do precompile'u parowania z EIP-2537. Co się dzieje?",
      options: [
        "Wywołanie się udaje, bo precompile dekompresuje klucze",
        "Wywołanie się udaje, ale kosztuje dodatkowy gas na dekompresję",
        "Wywołanie zwraca błąd, bo precompile chce punktów 128-bajtowych",
        "Wywołanie zwraca false, jakby podpis był nieprawidłowy"
      ],
      answer: 2
    }
  ],
  "liquidation-bot": [
    {
      kind: "scenario",
      question: "Pożyczkobiorca w Aave v3 ma health factor 0,9856, a zarówno jego zabezpieczenie, jak i dług w dwóch zaangażowanych aktywach przekraczają 2000 dolarów. Ile może spłacić jedna likwidacja?",
      options: [
        "Cały dług, bo health factor jest poniżej 1",
        "Tylko tyle, żeby health factor wrócił do 1",
        "Najwyżej połowę całego długu pożyczkobiorcy",
        "Stałą jedną dziesiątą długu w każdym bloku"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego filtr eth_getLogs na AnswerUpdated po adresie proxy feedu cen Chainlink nigdy niczego nie znajduje?",
      options: [
        "Ten event emituje agregator, który stoi za proxy",
        "Proxy emituje go tylko po upływie okna heartbeat feedu",
        "Event jest anonimowy, więc nie ma topicu do filtrowania",
        "Proxy zbiera swoje eventy i emituje je raz na epokę"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Bot robi backrun publicznej transakcji transmit feedu Chainlink, który Aave czyta przez SVR. Co dzieje się z ceną, której używa Aave?",
      options: [
        "Zmienia się w tym samym bloku co publiczny transmit",
        "Jest uśredniana z ceną ze standardowego feedu",
        "Zostaje odrzucona, bo raport przychodzi dwa razy",
        "Stoi w miejscu; ta cena zmienia się przez MEV-Share"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Co dzieje się z likwidacją w Aave v3, która zostawiłaby po 600 dolarów długu i zabezpieczenia?",
      options: [
        "Udaje się, a resztę umarza się jako dust",
        "Kończy się revertem z błędem MustNotLeaveDust",
        "Udaje się, ale likwidator traci swój bonus",
        "Zostaje zamieniona we flash loan na pozostałą kwotę"
      ],
      answer: 1
    },
    {
      kind: "contrast",
      question: "Czym likwidacja w Compound v3 różni się od wywołania liquidationCall w Aave v3?",
      options: [
        "absorb od razu płaci wywołującemu stały bonus 5 procent w zabezpieczeniu",
        "absorb może wywołać tylko governance podczas awaryjnej pauzy",
        "absorb przenosi dług na protokół, który później sprzedaje zabezpieczenie",
        "absorb wymaga, żeby wywołujący najpierw wpłacił aktywo długu jako zabezpieczenie"
      ],
      answer: 2
    },
    {
      kind: "scenario",
      question: "Likwidacja wysłana przez publiczny mempool przegrywa wyścig z szybszym botem. Jaki jest koszt przegranej próby?",
      options: [
        "Gas za transakcję, która kończy się revertem on-chain",
        "Żaden, bo mempool odrzuca przegrane próby",
        "Bonus likwidacyjny, który przechodzi na zwycięzcę",
        "Kara, którą potrąca protokół pożyczkowy"
      ],
      answer: 0
    }
  ],
  "intent-solver": [
    {
      kind: "scenario",
      question: "Filler symuluje zlecenie holenderskie UniswapX przez eth_call na latest i wychodzi mu, że realizacja jest minimalnie nieopłacalna. Co przeoczył?",
      options: [
        "Zleceń holenderskich nie da się symulować bez klucza prywatnego cosignera",
        "eth_call pomija sprawdzenie wyłączności w reactorze, więc wynik jest nieważny",
        "Żądana kwota rośnie z każdym blokiem, więc później jest zawsze gorzej",
        "Zlecenie jest wycenione na czas o slot wcześniejszy, niż może trafić do bloku"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Co w CoW Protocol przekazuje driverowi zwycięskiego solvera żądanie /settle?",
      options: [
        "Calldata obliczone przez autopilota dla tego rozwiązania",
        "Id aukcji i ostatni blok, w którym może trafić rozliczenie",
        "Listę builderów, przez których rozliczenie musi przejść",
        "Cenę gasu, jaką driver ma zaoferować w publicznym mempoolu"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego referencyjny driver CoW obcina limit gasu, zanim wywoła eth_estimateGas dla rozwiązania?",
      options: [
        "Żeby wadliwe rozwiązanie nie zmusiło węzła do szukania aż po limit gasu bloku",
        "Żeby rozliczenie zmieściło się w jednym bundlu, który MEV Blocker przyjmie na blok",
        "Bo autopilot zwraca tylko gas zużyty poniżej tego limitu",
        "Bo eth_estimateGas odrzuca każde żądanie powyżej 30 milionów gasu"
      ],
      answer: 0
    },
    {
      kind: "consequence",
      question: "Rozliczenie zwycięskiego solvera CoW nadal nie trafiło do bloku, gdy minął blok będący terminem. Co z tego wynika?",
      options: [
        "Autopilot wysyła to samo rozwiązanie ponownie w imieniu solvera",
        "Zlecenia użytkowników są anulowane i trzeba je podpisać od nowa",
        "Wynik liczy się na niekorzyść solvera, a nagroda może być ujemna",
        "Solver zostaje od razu i na stałe wykluczony z rywalizacji"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym intent różni się od zwykłej transakcji swapu?",
      options: [
        "Przechodzi przez publiczny mempool bez żadnego podpisu",
        "Rozliczają go walidatorzy, a nie kontrakt",
        "Wskazuje pule, ale zwalnia użytkownika z płacenia za gas",
        "Określa wynik, a wybór trasy zostawia solverowi"
      ],
      answer: 3
    },
    {
      kind: "scenario",
      question: "Solver wysyła zarówno ruch wycen, jak i rozliczenia przez jeden endpoint z rate limitem. Co się psuje, gdy przychodzi blok z gwałtownymi zmianami cen?",
      options: [
        "Endpoint przesuwa rozliczenia za wyceny czekające w kolejce",
        "Fale wycen wyczerpują limit i odcinają wysyłanie rozliczeń",
        "Rozliczenia są odrzucane za przekroczenie limitu gasu węzła",
        "Wyceny zaczynają dostawać odpowiedzi z bloku pending"
      ],
      answer: 1
    }
  ],
  "mev-share": [
    {
      kind: "scenario",
      question: "Searcher porównuje pole hash z hintów MEV-Share z hashami transakcji w następnym bloku i nigdy nie znajduje zgodności. Dlaczego?",
      options: [
        "To keccak-256 z hasha transakcji",
        "Hinty opisują tylko bundle, nigdy pojedyncze transakcje",
        "Hashe w hintach są kodowane w base64, a nie w hex",
        "Hinty są publikowane dopiero po sfinalizowaniu bloku"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Co umożliwia obiekt inclusion w mev_sendBundle, czego nie umożliwia pole blockNumber w eth_sendBundle?",
      options: [
        "Listę builderów, którzy muszą go włączyć do bloku",
        "Minimalny zwrot, który użytkownik musi najpierw dostać",
        "Zakres bloków włącznie z granicami, od block do maxBlock",
        "Okno ważności mierzone w milisekundach czasu"
      ],
      answer: 2
    },
    {
      kind: "cause",
      question: "Dlaczego mev_simBundle odrzuca bundle z backrunem searchera, zanim transakcja użytkownika trafi do bloku?",
      options: [
        "Symulacja jest zarezerwowana dla użytkownika, który wysłał transakcję",
        "Bundle z backrunem można symulować tylko na testnecie Sepolia",
        "Węzeł symuluje tylko bundle z uzupełnionymi zwrotami",
        "Body bundla wciąż zawiera niedopasowany wpis hash"
      ],
      answer: 3
    },
    {
      kind: "contrast",
      question: "Czym feed dla searcherów w MEV Blocker różni się od strumienia hintów MEV-Share?",
      options: [
        "Wysyła tylko hashe, bez żadnych innych pól",
        "Wysyła całe transakcje bez ich podpisów",
        "Wymaga, żeby każdy bundle niósł podpis użytkownika",
        "Działa przez server-sent events bez keep-alive"
      ],
      answer: 1
    },
    {
      kind: "consequence",
      question: "Portfel kieruje swoich użytkowników do Flashbots Protect bez parametrów w URL. Którzy builderzy mogą włączyć ich transakcje do bloku?",
      options: [
        "Tylko builder Flashbots",
        "Każdy builder z rejestru",
        "Dowolny builder wskazany przez searchera",
        "Builderzy wybrani przez walidatora"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jak przy domyślnych ustawieniach Flashbots Protect dzielony jest zwrot MEV?",
      options: [
        "50 procent dla tx.origin i 50 procent dla zwycięskiego searchera",
        "100 procent dla buildera, który włączył bundle",
        "90 procent dla tx.origin i 10 procent dla walidatora",
        "90 procent dla searchera i 10 procent dla tx.origin"
      ],
      answer: 2
    }
  ],
  "enshrined-pbs": [
    {
      kind: "scenario",
      question: "Oferta buildera trafia do opublikowanego na czas bloku beacon w Gloas, który zbiera 80% atestacji z tego samego slotu, a builder nigdy nie ujawnia payloadu. Co się dzieje?",
      options: [
        "Blok beacon zostaje osierocony, a proposer nic nie zarabia",
        "Builder dostaje slashing, a jego stake trafia do proposera",
        "Następny proposer musi umieścić payload tego buildera",
        "Slot kończy się pusty, a proposer i tak dostaje kwotę z oferty"
      ],
      answer: 3
    },
    {
      kind: "detail",
      question: "Co zawiera body bloku beacon w Gloas w miejscu, gdzie wcześniej był execution payload?",
      options: [
        "Nagłówek payloadu kontrasygnowany przez relay",
        "Podpisaną ofertę buildera z commitmentem do hasha bloku",
        "Envelope payloadu razem z jego żądaniami wykonawczymi",
        "Atestacje payloadu oddane w tym samym slocie"
      ],
      answer: 1
    },
    {
      kind: "cause",
      question: "Dlaczego w Gloas eth_blockNumber węzła wykonawczego może zostawać za head beacon o część slotu?",
      options: [
        "Payload przychodzi we własnym envelope po bloku",
        "Klient wykonawczy czeka z importem na głosowanie PTC",
        "Blok beacon musi zostać sfinalizowany, zanim payload się wykona",
        "Bloki wykonawcze powstają teraz co drugi slot"
      ],
      answer: 0
    },
    {
      kind: "contrast",
      question: "Czym payload timeliness committee różni się od zwykłego komitetu atestacyjnego?",
      options: [
        "Głosuje na checkpointy source i target na potrzeby finalności",
        "Podpisuje execution payload w imieniu buildera",
        "Głosuje, czy dotarły payload i dane blobów",
        "Wybiera ofertę buildera, którą proposer musi przyjąć"
      ],
      answer: 2
    },
    {
      kind: "consequence",
      question: "Klient wykonawczy zaimportował payload jako swój head, a następny proposer buduje na tym bloku beacon jako pustym. Co widzi wywołujący RPC?",
      options: [
        "Nic, bo blok beacon nadal jest kanoniczny",
        "Reorg o jeden blok, który usuwa blok z tego payloadu",
        "Zatrzymanie finalności, dopóki builder nie opublikuje go ponownie",
        "Ten sam numer bloku w dwóch różnych slotach"
      ],
      answer: 1
    },
    {
      kind: "detail",
      question: "Do którego bloku wykonawczego ma commitment nagłówek lekkiego klienta w Gloas?",
      options: [
        "Do bloku ujawnionego w envelope payloadu z tego slotu",
        "Do najnowszego sfinalizowanego bloku wykonawczego epoki",
        "Do bloku, który PTC w tym slocie uznał za obecny",
        "Do rodzica wskazanego przez parent_block_hash oferty"
      ],
      answer: 3
    }
  ],
  "fast-confirmation-rule": [
    {
      kind: "scenario",
      question: "Dwóch dostawców RPC odpowiada na eth_getBlockByNumber z safe: jeden zwraca blok o dwa za latest, drugi o mniej więcej pięćdziesiąt. Co wyjaśnia tę różnicę?",
      options: [
        "Jeden klient konsensusu stosuje FCR, a drugi nie",
        "Jeden dostawca cache'uje odpowiedzi przez kilka minut",
        "Jeden klient wykonawczy usunął pruningiem ostatnie bloki safe",
        "Jeden endpoint działa na łańcuchu z niższym uczestnictwem"
      ],
      answer: 0
    },
    {
      kind: "cause",
      question: "Dlaczego FCR potrzebuje ponad 95% komitetu jednego slotu, żeby potwierdzić blok po jednym slocie?",
      options: [
        "Próg to superwiększość dwóch trzecich, której używa finalność",
        "Próg wymaga, żeby każdy członek komitetu zagłosował na czas",
        "Próg uwzględnia proposer boost i przeciwnika z 25% stake",
        "Próg podwaja wagę, żeby pokryć możliwy pominięty slot"
      ],
      answer: 2
    },
    {
      kind: "contrast",
      question: "Czym gwarancja stojąca za blokiem potwierdzonym przez FCR różni się od gwarancji za sfinalizowanym blokiem?",
      options: [
        "Wymaga slashingu jednej trzeciej stake, tak jak finalność",
        "Jest słabsza tylko dlatego, że ufa jednemu proposerowi",
        "Obowiązuje bezwarunkowo, ale obejmuje mniej nowych bloków",
        "Zakłada głosy na czas, a cofnięcie nie grozi nikomu slashingiem"
      ],
      answer: 3
    },
    {
      kind: "consequence",
      question: "Blok potwierdzony przez klienta z FCR wypada z łańcucha kanonicznego. Co zwróci potem eth_getBlockByNumber z safe?",
      options: [
        "Sfinalizowany blok, wiele bloków niżej niż wcześniej",
        "Ten sam blok, bo safe nigdy się nie cofa",
        "Błąd, dopóki nie zostanie potwierdzony kolejny blok",
        "Najnowszy blok, aż do następnej granicy epoki"
      ],
      answer: 0
    },
    {
      kind: "detail",
      question: "Jak wynik FCR trafia do klienta wykonawczego, gdy klient konsensusu stosuje tę regułę?",
      options: [
        "Jako nowa wartość tagu safe wysłana metodą eth_",
        "Jako safeBlockHash w engine_forkchoiceUpdated",
        "Jako root bloku beacon wewnątrz payloadAttributes",
        "Jako event fast_confirmation w Engine API"
      ],
      answer: 1
    },
    {
      kind: "scenario",
      question: "Blok dostaje 93% komitetu swojego slotu, a uczestnictwo potem się nie zmienia. Kiedy FCR go potwierdzi?",
      options: [
        "Na początku następnego slotu, po jednym slocie głosów",
        "Dopiero na następnej granicy epoki, przy ponownym sprawdzeniu",
        "Slot później, gdy głosy z dwóch slotów przekroczą 85%",
        "Nigdy, bo 93% nie sięga progu 95% dla jednego slotu"
      ],
      answer: 2
    }
  ]
};
