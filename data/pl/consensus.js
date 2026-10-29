// Polish text for the Consensus lessons, keyed by topic id. Only the words: ids, link
// targets, code, related topics, and sources come from data/consensus.js.
export const topics = {
  "proof-of-stake": {
    title: "Proof of stake",
    aliases: ["pos", "dowód stawki", "konsensus proof of stake", "staking", "konsensus oparty na stake"],
    summary: "Proof of stake to mechanizm konsensusu Ethereum, w którym walidatorzy blokują stake, atestują swój widok łańcucha i są wybierani do obowiązków, które przesuwają fork choice i finalność.",
    sections: [
      {
        heading: "Rola konsensusu",
        paragraphs: [
          "Warstwę proof of stake w Ethereum prowadzi [[consensus-client|klient konsensusu]], który śledzi bloki beacon, atestacje, komitety i checkpointy. Walidatorzy deponują stake i dostają przydziały: atestowanie, proponowanie bloków albo obowiązki w sync committee. Ich podpisane wiadomości dostarczają głosów, z których korzysta [[fork-choice|fork choice]], i spełniają warunki superwiększości, z których wynika [[finality|finalność]].",
          "Warstwa konsensusu sama nie wykonuje transakcji aplikacji. Każdy blok beacon może zawierać execution payload, a sparowany z nim [[execution-client|klient wykonawczy]] waliduje ten payload i oblicza wynikowy [[state-root|state root]]. Klient konsensusu i klient wykonawczy wymieniają przez [[engine-api|Engine API]] status payloadu i informacje fork choice, co daje węzłowi modularną granicę między konsensusem a wykonaniem."
        ]
      },
      {
        heading: "Dlaczego stake ma znaczenie",
        paragraphs: [
          "Waga głosu walidatora wynika z jego efektywnego salda (effective balance), zgodnie z regułami protokołu. Uczciwy udział daje nagrody; pominięte obowiązki to stracone okazje i mogą skutkować karami; podpisanie sprzecznych albo nieprawidłowych wiadomości może skończyć się slashingiem. Te zachęty nie sprawiają, że każdy walidator jest uczciwy, ale przy założeniach protokołu sprawiają, że sprzeczna sfinalizowana historia jest ekonomicznie i kryptograficznie trudna do uzyskania.",
          "Liczy się głos walidatora, a nie żądanie RPC. Wywołanie endpointu Beacon API nie ma udziału w konsensusie, a wysłanie transakcji do warstwy wykonawczej nie jest głosem na head łańcucha. Aplikacje RPC konsumują wyniki konsensusu i wykonania; samo połączenie z węzłem nie czyni ich walidatorami."
        ]
      },
      {
        heading: "Co widzi operator",
        paragraphs: [
          "Zdrowa konfiguracja ma zsynchronizowanego klienta konsensusu, klienta wykonawczego, który potrafi zwalidować przychodzący payload, wystarczającą liczbę peerów oraz klienta walidatora, jeśli operator ma obowiązki. Monitorować trzeba łącznie: czasy slotów, włączanie atestacji do bloków, checkpointy head i finalized, statusy Engine API i synchronizację warstwy wykonawczej. Publiczny [[rpc-provider|dostawca RPC]] może dostarczać aplikacji dane, ale nie zastąpi procesu konsensusu protokołu, gdy aplikacja potrzebuje zaufanego, sfinalizowanego widoku.",
          "Proof of stake ma też problem z zaufaniem na starcie: nowy obserwator potrzebuje checkpointu weak subjectivity albo innego zaufanego punktu odniesienia, zanim zacznie śledzić długą historię konsensusu. Dlatego [[light-client|lekki klient]] i pełny węzeł mają różne założenia startowe, nawet jeśli oba weryfikują późniejsze aktualizacje."
        ]
      }
    ],
    pitfalls: [
      "Nazywanie ruchu JSON-RPC głosem w konsensusie albo traktowanie dostawcy RPC jak walidatora.",
      "Przypisywanie walidacji execution payloadu do obowiązków klienta konsensusu.",
      "Monitorowanie tylko sald walidatorów z pominięciem kondycji Engine API, peerów i sfinalizowanych checkpointów.",
      "Pomijanie weak subjectivity albo sprawdzenia pochodzenia checkpointu przy nowo uruchamianym obserwatorze."
    ]
  },
  "slot-epoch": {
    title: "Sloty i epoki",
    aliases: ["slot", "epoka", "slot 12 sekund", "epoka 32 sloty", "zegar beacon chain", "czas w konsensusie", "pominięty slot"],
    summary: "Slot to zaplanowana okazja na blok beacon, a epoka to stała grupa slotów, używana do komitetów, checkpointów i rozliczeń konsensusu.",
    sections: [
      {
        heading: "Zegar",
        paragraphs: [
          "Czas w Beacon Chain płynie w slotach, których docelową długość określa specyfikacja konsensusu. Slot może zawierać zaproponowany blok albo zostać pominięty; łańcuch nie wymyśla bloku tylko dlatego, że zegar poszedł do przodu. Epoki grupują sloty i wyznaczają granice dla przydziałów do komitetów, przetwarzania checkpointów, nagród i obliczeń finalności. Na mainnecie slot trwa 12 sekund (`SLOT_DURATION_MS` o wartości 12000), a epoka to 32 sloty (`SLOTS_PER_EPOCH`), czyli 6,4 minuty, ale dokładne stałe należą do konfiguracji aktywnej sieci, a nie do ogólnych założeń aplikacji.",
          "Metoda RPC warstwy wykonawczej, taka jak `eth_blockNumber`, zwraca wysokość bloku warstwy wykonawczej, a nie slot ani epokę. W danym slocie bloku może nie być, a timestamp bloku warstwy wykonawczej nie zastępuje w pełni zegara Beacon Chain. Gdy aplikacja potrzebuje danych o slotach albo epokach, powinna sięgnąć do [[beacon-api|Beacon API]]."
        ]
      },
      {
        heading: "Jak RPC widzi czas",
        paragraphs: [
          "Aplikacje często odpytują najnowszy blok i na tej podstawie oceniają świeżość danych, ale taki widok może zostawać w tyle za zegarem konsensusu albo zmieniać się wraz z [[fork-choice|fork choice]]. Usługa health check powinna porównywać head warstwy wykonawczej, head beacon, checkpointy safe i finalized oraz wiek bloku według zegara systemowego. Przy indeksowaniu warto zapisywać numer bloku, hash, slot (jeśli jest dostępny) i hash rodzica, żeby pominięty slot nie został wzięty za pusty blok warstwy wykonawczej.",
          "Pominięty slot nie oznacza automatycznie [[reorg|reorganizacji łańcucha]] ani awarii węzła. Może znaczyć, że żaden proposer nie opublikował bloku albo że węzeł jeszcze go nie dostał. Powtarzające się pominięte sloty, spóźnione atestacje i rosnące opóźnienie heada to sygnały operacyjne; pojedynczy pusty slot jest na tyle normalny, że warto go jawnie uwzględnić w modelu danych."
        ]
      },
      {
        heading: "Granice epok",
        paragraphs: [
          "Przejście do nowej epoki może zmienić przydziały do komitetów i dane checkpointów, więc systemy, które planują pracę walidatora albo konsensusu, powinny korzystać z widoku klienta konsensusu, a nie tylko z lokalnego timera. [[validator-client|Klient walidatora]] pobiera obowiązki i podpisuje dokładnie te obiekty, które przydzielono mu na dany slot i epokę. Konsument RPC, który tylko wyświetla salda, może nie potrzebować takiej precyzji, ale systemy monitoringu i produkcji bloków jej potrzebują.",
          "Przy łączeniu danych z [[consensus-client|klienta konsensusu]] i [[execution-client|klienta wykonawczego]] trzeba zapisywać identyfikatory z obu warstw. Blok beacon wskazuje execution payload, a payload ma własny hash bloku i commitment stanu. Łączenie wyłącznie po timestampie może skleić rekordy z różnych widoków albo przeoczyć pominięty slot."
        ]
      }
    ],
    pitfalls: [
      "Zakładanie, że każdy slot zawiera blok warstwy wykonawczej.",
      "Używanie numeru bloku warstwy wykonawczej tak, jakby był slotem albo epoką Beacon Chain.",
      "Nazywanie jednego pominiętego slotu reorganizacją bez sprawdzenia przodków bloku i stanu konsensusu.",
      "Planowanie obowiązków walidatora według zegara systemowego bez pobrania obowiązku przydzielonego przez klienta konsensusu."
    ]
  },
  "fork-choice": {
    title: "Fork choice",
    aliases: ["fork choice", "LMD-GHOST", "wybór head", "kanoniczny head", "reguła wyboru forka"],
    summary: "Fork choice wybiera spośród konkurujących bloków aktualnie preferowany, prawidłowy head Beacon Chain na podstawie najnowszych głosów walidatorów i reguł konsensusu.",
    sections: [
      {
        heading: "Head to nie finalność",
        paragraphs: [
          "[[consensus-client|Klient konsensusu]] może znać kilka prawidłowych gałęzi na tej samej wysokości. Reguła fork choice waży najnowsze dostępne atestacje i wybiera head, który powinien być dalej rozbudowywany. Ten head może się zmienić, gdy dotrze konkurencyjny blok albo opóźniony głos. [[finality|Sfinalizowane checkpointy]] to silniejsza i osobna właściwość: najnowszy head może zmienić się w reorgu, nawet gdy sfinalizowana historia pozostaje stabilna.",
          "Wybrany head konsensusu trafia do klienta wykonawczego przez [[engine-api|Engine API]] razem ze wskazaniem bloków safe i finalized. Klient wykonawczy waliduje powiązany [[execution-payload|execution payload]] i raportuje, czy może go wykonać. Head konsensusu z payloadem INVALID nie może być traktowany jak zwykła alternatywna gałąź."
        ]
      },
      {
        heading: "Czego powinny używać aplikacje",
        paragraphs: [
          "Szybkie aktualizacje UI często korzystają z najnowszego head bez żadnych gwarancji, a księgowość, indeksowanie i rozliczenia wybierają głębokość potwierdzeń albo sfinalizowany checkpoint. Sam numer bloku nie wystarcza, żeby w czasie [[reorg|reorgu]] wskazać jedną gałąź; trzeba zapisać hash bloku i hash jego rodzica. Przy odczytach stanu, które muszą być ze sobą zgodne, należy użyć jawnego hasha lub numeru bloku, zamiast pytać kilka endpointów niezależnie o `latest`.",
          "[[rpc-provider|Provider]] może udostępniać tagi bloków latest, safe i finalized, ale opisują one widok węzła providera. Jeśli decyzja wymaga niezależnej pewności, trzeba zweryfikować nagłówek albo commitment stanu przez zaufaną ścieżkę konsensusu i, tam gdzie to potrzebne, [[state-proof|dowód stanu]]. Fork choice daje widok protokołu; nie sprawia, że odpowiedź providera sama się uwierzytelnia."
        ]
      },
      {
        heading: "Diagnozowanie rozbieżności",
        paragraphs: [
          "Warto porównać hash head po stronie wykonawczej, root head beacon, rooty safe i finalized, status peerów i statusy payloadów w Engine API. Jeśli dwa węzły różnią się przez chwilę, wyjaśnieniem może być [[network-telemetry|opóźnienie propagacji]]. Jeśli jeden zostaje na starym head, może się jeszcze synchronizować, być odcięty od części sieci, mieć za mało zasobów albo podążać za inną siecią. System [[observability|obserwowalności]] powinien zapisywać takie przejście, zamiast traktować każdą zmianę head jak awarię.",
          "Indeksery powinny obsługiwać reorgi w sposób jawny. Rekordy trzeba trzymać jako tymczasowe, dopóki nie zostanie spełniona polityka [[confirmations|potwierdzeń]] aplikacji, a gdy zmienia się preferowana gałąź, uzgadniać usunięte logi i bloki potomne. Połączenie sticky z węzłem RPC może ograniczyć niespójne odczyty, ale nie zapobiegnie zmianom head na poziomie protokołu."
        ]
      }
    ],
    pitfalls: [
      "Nazywanie najnowszego head finalnym, zanim stanie za tym sfinalizowany checkpoint.",
      "Porównywanie numerów bloków bez hashy bloków, gdy konkurują ze sobą gałęzie.",
      "Zakładanie, że wybór head przez Engine API zastępuje walidację execution payloadu.",
      "Uznawanie bloku w indekserze za nieodwracalny już przy pierwszym jego zauważeniu."
    ]
  },
  finality: {
    title: "Finalność",
    aliases: ["finality", "finalizacja", "sfinalizowany checkpoint", "finalized checkpoint", "justification", "finalność FFG"],
    summary: "Finalność to gwarancja konsensusu, że checkpoint otrzymał wymagane poparcie walidatorów i w normalnych warunkach działania sieci nie powinien zostać cofnięty.",
    sections: [
      {
        heading: "Checkpointy justified i finalized",
        paragraphs: [
          "Reguły konsensusu Beacon Chain śledzą checkpointy na granicach epok. Atestacje walidatorów składają się na warunki kwalifikowanej większości (supermajority), najpierw do oznaczenia checkpointu jako justified, a potem do jego finalizacji. [[consensus-client|Klient konsensusu]] udostępnia te checkpointy przez swoje API i używa ich, gdy raportuje, które bloki są dla bieżącego head safe i finalized. Finalizacja nie oznacza, że wynik każdego zapytania RPC jest od razu dostępny na każdym węźle; propagacja i wykonanie nadal wymagają czasu.",
          "Finalność jest silniejsza niż wybrany najnowszy blok, ale nie jest magicznym dowodem każdej odpowiedzi aplikacji. Sfinalizowany [[block-header|nagłówek]] może być kotwicą dla [[state-proof|dowodu stanu]], ale ścieżkę dowodu i tak trzeba sprawdzić. Provider, który oznacza odpowiedź jako „finalized”, raportuje swój tag bloku; to weryfikator musi zdecydować, czy nagłówek i wartość są autentyczne w jego modelu zagrożeń."
        ]
      },
      {
        heading: "Jak korzysta z niej RPC",
        paragraphs: [
          "JSON-RPC warstwy wykonawczej obsługuje tagi bloków takie jak `safe` i `finalized`, o ile klient je implementuje. Przydają się przy odczytach, w których świeżość ustępuje stabilności: saldach, wywołaniach kontraktów i checkpointach indeksera. Nie zamieniają jednak zapytania w snapshot obejmujący wiele żądań, chyba że każde powiązane wywołanie używa tego samego, wcześniej ustalonego identyfikatora lub hasha bloku.",
          "[[full-node|Pełny węzeł]] może nadążać za najnowszym head, a mimo to czekać na sfinalizowany checkpoint, a jeden węzeł może udostępnić dane finalized później niż inny. Health checki powinny śledzić sfinalizowaną epokę i hash bloku wykonawczego osobno od tego, czy proces żyje. W procesach rozliczeniowych trzeba stosować politykę dopasowaną do wartości, która jest zagrożona, zamiast kopiować uniwersalną liczbę potwierdzeń."
        ]
      },
      {
        heading: "Gdy finalność staje",
        paragraphs: [
          "Brak sfinalizowanego checkpointu dłużej niż zwykle może oznaczać pominięte atestacje, błędy klientów, spadek uczestnictwa w sieci albo poważne zdarzenie w konsensusie. Trzeba sprawdzić uczestnictwo walidatorów, łączność z peerami, przetwarzanie slotów, logi klienta konsensusu i statusy payloadów w Engine API. Nie należy wnioskować o przyczynie z samego niezmieniającego się `eth_blockNumber` po stronie wykonawczej; pominięte sloty i zatrzymany klient wykonawczy dają różne objawy.",
          "Aplikacje powinny odróżniać dane tymczasowe od sfinalizowanych. [[indexer|Indekser]] może przyjmować najnowsze bloki do widoków o małym opóźnieniu, a rekordy oznaczać jako trwałe dopiero po spełnieniu swojej polityki potwierdzeń lub finalności. [[light-client|Lekki klient]] może śledzić sfinalizowane nagłówki konsensusu, a dowody wykonawcze pobierać z innego źródła, dlatego warto udokumentować, jak składają się te kroki zaufania."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie tagu finalized u providera jako kryptograficznej weryfikacji zwróconej wartości.",
      "Używanie stałej liczby potwierdzeń tak, jakby była gwarancją finalności dla całej sieci.",
      "Zakładanie, że dane finalized pojawiają się w tym samym momencie na każdym endpoincie RPC.",
      "Ignorowanie uczestnictwa w konsensusie i kondycji Engine API, gdy finalność przestaje się przesuwać."
    ]
  },
  "execution-payload": {
    title: "Execution payload",
    aliases: ["execution payload", "blok wykonawczy", "payload", "payload EL", "payload wykonawczy"],
    summary: "Execution payload to dane transakcji, opłat, wypłat i kontekstu bloku, które warstwa konsensusu przekazuje klientowi wykonawczemu do walidacji i wykonania.",
    sections: [
      {
        heading: "Payload jako granica warstw",
        paragraphs: [
          "Od Merge blok beacon niesie execution payload, zamiast żeby klient konsensusu sam wykonywał transakcje. Payload zawiera pola bloku wykonawczego, transakcje, wypłaty (tam, gdzie występują) oraz commitmenty, takie jak [[state-root|state root]]. Sparowany z klientem konsensusu [[execution-client|klient wykonawczy]] stosuje reguły EVM, sprawdza payload i zwraca status przez [[engine-api|Engine API]].",
          "Klient konsensusu korzysta z tego statusu, gdy waliduje [[beacon-block|blok beacon]] i stosuje [[fork-choice|fork choice]]. Status INVALID znaczy coś zupełnie innego niż SYNCING: pierwszy mówi, że payload łamie reguły wykonania, a drugi, że klient wykonawczy nie ma jeszcze kontekstu, żeby to rozstrzygnąć. Operatorzy powinni zachowywać w diagnostyce identyfikator payloadu i jego status."
        ]
      },
      {
        heading: "Przepływ między builderem a proposerem",
        paragraphs: [
          "Proposer może użyć payloadu zbudowanego lokalnie albo otrzymać go z rynku budowania bloków, takiego jak [[mev-boost|MEV-Boost]]. Walidator podpisuje blok beacon, który zawiera commitment do nagłówka wybranego execution payloadu. Proposer podpisuje ten nagłówek, zanim dostanie sam payload, więc w chwili podpisu polega na [[relay|relayu]]. Potem klienci konsensusu i klienci wykonawczy każdego węzła walidują opublikowany payload według reguł protokołu, więc builder nie może uczynić nieprawidłowego bloku kanonicznym; może jedynie sprawić, że proposer straci swój slot.",
          "Kod wywołujący RPC zwykle widzi wynikowy blok wykonawczy przez `eth_getBlockByHash` albo subskrypcję, a nie przez Engine API. Jeśli aplikacja musi powiązać blok beacon z danymi wykonawczymi, powinna używać jawnych identyfikatorów payloadu i bloku, uwzględniać reorgi i unikać łączenia rekordów wyłącznie po timestampie."
        ]
      },
      {
        heading: "Co monitorować",
        paragraphs: [
          "Warto śledzić opóźnienie walidacji payloadu, błędy żądań Engine API, brakujące dane wykonawcze i różnice między head warstwy wykonawczej a head beacon. Wolna baza danych albo niewystarczający [[node-hardware|sprzęt]] mogą sprawić, że klient konsensusu nie zdąży z propozycją bloku, nawet gdy warstwa P2P działa prawidłowo. Lokalny sekret JWT trzeba chronić, a Engine API udostępniać wyłącznie zamierzonej parze procesów.",
          "W infrastrukturze RPC to pipeline payloadu decyduje, kiedy nowy blok staje się widoczny i czy węzeł można bezpiecznie dołączyć do puli węzłów. [[health-check|Health check]] powinien porównywać hashe bloków i informacje o finalności w obu klientach, a [[indexer|indekser]] powinien poczekać na spełnienie własnej polityki potwierdzeń, zanim uzna logi pochodzące z payloadu za trwałe."
        ]
      }
    ],
    pitfalls: [
      "Nazywanie execution payloadu blokiem beacon, bez otaczającego go obiektu konsensusu i podpisów.",
      "Traktowanie statusów SYNCING i INVALID z Engine API jako tej samej awarii.",
      "Zakładanie, że builder albo relay pozwala ominąć lokalną walidację wykonania.",
      "Łączenie rekordów beacon i wykonawczych wyłącznie po timestampie."
    ]
  },
  "block-proposal": {
    title: "Proponowanie bloku",
    aliases: ["block proposal", "propozycja bloku", "obowiązek proposera", "proposer duty", "zaproponowany blok"],
    summary: "Proponowanie bloku to obowiązek walidatora, który dla przydzielonego slotu składa i podpisuje blok beacon, razem z execution payloadem, jeśli jest dostępny.",
    sections: [
      {
        heading: "Przydział obowiązku",
        paragraphs: [
          "[[validator-client|Klient walidatora]] dowiaduje się o przydziale do roli proposera od [[consensus-client|klienta konsensusu]] i musi zadziałać w oknie czasowym slotu. Beacon node dostarcza kontekst łańcucha, a klient wykonawczy dostarcza prawidłowy payload albo współpracuje z builderem. Przy payloadzie zbudowanym lokalnie własny klient wykonawczy węzła już go wykonał. Przy payloadzie od buildera walidator podpisuje blinded block, czyli blok z samym nagłówkiem payloadu, i polega na tym, że relay sprawdził payload i go opublikuje. W obu przypadkach podpisany blok trafia potem do sieci konsensusu.",
          "Proponowanie bloku to coś innego niż atestacja. Walidator atestujący głosuje na blok i checkpoint, a proposer tworzy blok, na który inni mogą potem głosować. Oba obowiązki wymagają trzymania się czasu slotów i zsynchronizowanego węzła, i na oba wpływają propagacja między peerami oraz gotowość execution payloadu."
        ]
      },
      {
        heading: "Ścieżka lokalna i ścieżka przez buildera",
        paragraphs: [
          "Proposer może zbudować payload lokalnie z mempoolu klienta wykonawczego albo skorzystać ze ścieżki buildera koordynowanej przez [[mev-boost|MEV-Boost]]. Ścieżka buildera zmienia to, kto ustala kolejność transakcji i jak payload jest dostarczany; nie usuwa kontroli poprawności po stronie klienta konsensusu ani klienta wykonawczego. Podpisany blok beacon zawiera commitment do nagłówka wybranego payloadu.",
          "Klient wykonawczy nadal odpowiada za ocenę payloadu, sprawdzenie reguł gasu i przejścia stanu oraz zwrócenie statusu przez [[engine-api|Engine API]]. Jeśli payload jest niedostępny lub nieprawidłowy, proposer musi postąpić tak, jak przewiduje klient konsensusu, zamiast na ślepo podpisywać dowolne bajty. Ta granica odpowiedzialności jest kluczowa przy diagnozowaniu przegapionych propozycji bloków (missed proposals)."
        ]
      },
      {
        heading: "Jak monitorować propozycje",
        paragraphs: [
          "Warto zapisywać przydzielony slot, źródło przydziału, ścieżkę payloadu, root bloku, status execution payloadu, czas propagacji i to, czy [[network-telemetry|inne węzły zobaczyły blok]]. Przegapiona propozycja może wynikać z problemów z dostępnością klucza, konfiguracją klienta walidatora, synchronizacją konsensusu, opóźnieniem po stronie wykonawczej, dostępnością buildera lub relaya albo siecią peerów. Trzeba sięgnąć do logów wszystkich trzech procesów, których to dotyczy, zamiast obwiniać endpoint RPC, z którego odczytano status.",
          "Publiczna usługa RPC nie powinna współdzielić kluczy podpisujących walidatora ani dawać aplikacjom kontroli nad propozycjami bloków. Może udostępniać wynikowe bloki i receipty po walidacji, a [[health-check|health check]] sprawdza widok węzła po stronie wykonawczej i po stronie konsensusu. [[indexer|Indekser]] powinien traktować zaproponowany blok jako tymczasowy, dopóki nie zaakceptują go [[fork-choice|fork choice]] i polityka potwierdzeń."
        ]
      }
    ],
    pitfalls: [
      "Mylenie obowiązku proposera z obowiązkiem atestowania: jeden walidator buduje i podpisuje blok dla slotu, a komitet tylko na niego głosuje.",
      "Zakładanie, że z MEV-Boost lokalny klient wykonawczy jest zbędny.",
      "Podpisywanie payloadu, zanim zakończą się kontrole w Engine API i po stronie konsensusu.",
      "Diagnozowanie przegapionej propozycji wyłącznie na podstawie odpowiedzi RPC, którą dostała aplikacja."
    ]
  },
  "beacon-block": {
    title: "Blok beacon",
    aliases: ["beacon block", "blok beacon", "body bloku beacon", "nagłówek beacon", "blok konsensusu"],
    summary: "Blok beacon to obiekt warstwy konsensusu, który zawiera dane slotu i proposera, atestacje i inne operacje konsensusu oraz execution payload albo jego nagłówek.",
    sections: [
      {
        heading: "Co obejmuje blok",
        paragraphs: [
          "Blok beacon jest podpisywany i rozgłaszany w sieci konsensusu. Jego nagłówek i body zawierają commitment do informacji o proposerze, parent root, state root, atestacji, operacji związanych z depozytami lub wypłatami (tam, gdzie występują) oraz pól execution payloadu. Dokładny schemat zmienia się wraz z forkami sieci, dlatego aplikacje korzystające z tych danych powinny trzymać się wersjonowanych specyfikacji konsensusu i schematów [[beacon-api|Beacon API]], zamiast hardkodować stary kształt body.",
          "Execution payload łączy konsensus z [[block-header|nagłówkiem]] bloku wykonawczego, listą transakcji, receiptami i wynikowym [[state-root|state root]]. Weryfikator musi uwierzytelnić zarówno kontekst Beacon Chain, jak i commitment po stronie wykonawczej, zanim użyje bloku jako kotwicy zaufania (trusted anchor) dla [[state-proof|dowodu stanu]]."
        ]
      },
      {
        heading: "Cykl życia bloku",
        paragraphs: [
          "Wybrany proposer składa i podpisuje blok dla [[slot-epoch|slotu]], peery go walidują, a walidatorzy atestują blok i checkpoint. [[consensus-client|Klient konsensusu]] stosuje fork choice w miarę napływu bloków i głosów; w kolejnych epokach checkpointy mogą zostać oznaczone jako justified, a potem sfinalizowane. Najnowszy blok beacon może więc być widoczny, zanim stanie się finalny, i może zostać zastąpiony podczas [[reorg|reorgu]] (reorganizacji łańcucha).",
          "Klient wykonawczy waliduje osadzony w bloku payload przez [[engine-api|Engine API]]. Blok beacon z nieprawidłowym payloadem nie staje się prawidłowy dlatego, że podpisał go proposer albo że zwraca go provider RPC. To rooty bloków, hashe payloadów, parent rooty i commitmenty wykonawcze są identyfikatorami, które trzeba zachować w indeksie lub śladzie audytowym."
        ]
      },
      {
        heading: "Odczyt przez RPC",
        paragraphs: [
          "Bloki beacon pobiera się z endpointu konsensusu, a bloki wykonawcze przez [[json-rpc|JSON-RPC]] warstwy wykonawczej. Aplikacja, która łączy jedne i drugie, powinna zapisywać slot, root bloku beacon, hash bloku wykonawczego i informację, czy blok jest kanoniczny. Łączenie wyłącznie po numerze lub timestampie grozi zestawieniem bloku wykonawczego z niewłaściwym obiektem konsensusu, zwłaszcza w okolicy pominiętych slotów (missed slots) albo reorgów.",
          "W lekkim kliencie albo w procesie opartym na dowodach nagłówek beacon i nagłówek execution payloadu weryfikuje się w dwóch osobnych krokach, które łączy schemat protokołu. Dla zwykłych danych w UI może wystarczyć poczekanie na [[finality|finalność]] albo na potwierdzenia. Przy operacji o dużej wartości warto zachować źródłowe nagłówki i materiał z weryfikacji, zamiast ufać odpowiedzi z cache."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie schematu bloku beacon jako niezmiennego między aktualizacjami sieci.",
      "Używanie numeru bloku wykonawczego jako roota bloku beacon.",
      "Uznawanie podpisu proposera za dowód, że execution payload jest prawidłowy.",
      "Nieodwracalne indeksowanie najnowszego bloku beacon, zanim pozwolą na to fork choice i przyjęta polityka finalności."
    ]
  },
  "mev-boost": {
    title: "MEV-Boost",
    aliases: ["middleware PBS", "PBS middleware", "proposer-builder separation", "separacja proposera i buildera"],
    summary: "MEV-Boost to middleware, które pozwala proposerowi w sieci proof of stake pobierać od builderów, za pośrednictwem relayów, oferty execution payloadów, a przy tym zachować lokalną walidację konsensusu i kontrolę nad podpisywaniem.",
    sections: [
      {
        heading: "Po co istnieje",
        paragraphs: [
          "Maximal extractable value, czyli MEV, potrafi sprawić, że budowanie bloków staje się skomplikowane i konkurencyjne. MEV-Boost pozwala [[validator-node|węzłowi walidatora]] dostawać od zewnętrznych builderów oferty payloadów do wyboru, zamiast samodzielnie składać każdą transakcję. [[consensus-client|Klient konsensusu]] proposera prosi middleware o ofertę, a middleware komunikuje się ze skonfigurowanymi [[relay|relayami]] i builderami przez [[builder-api|Builder API]]. Powstały blok beacon nadal przechodzi przez zwykły proces konsensusu.",
          "Builder tworzy payload i ofertę; relay pośredniczy w dostarczeniu i może stosować własną politykę; proposer decyduje, czy przyjąć ofertę. Klient wykonawczy pozostaje podłączony przez [[engine-api|Engine API]] i buduje lokalny payload zapasowy, ale na ścieżce buildera proposer podpisuje blinded block, czyli sam nagłówek payloadu, nie widząc samego payloadu. To relay sprawdził blok buildera i publikuje go po podpisie, a klient wykonawczy każdego węzła, także proposera, waliduje go dopiero przy imporcie. MEV-Boost zmienia topologię budowania bloków, a nie definicję poprawnego przejścia stanu po stronie wykonawczej."
        ]
      },
      {
        heading: "Granice zaufania i awarii",
        paragraphs: [
          "Relaye i builderzy to dodatkowe zależności. Walidator może stracić okazję do propozycji bloku, jeśli middleware, relay, sieć albo builder są niedostępne, ale nie powinien podpisać niepoprawnego payloadu. Operatorzy wybierają listy relayów, polityki timeoutów i zachowanie fallbacku; te wybory wpływają na odporność na cenzurę, dostępność i oczekiwaną wartość. Klucz podpisujący klienta walidatora musi pozostać poza ścieżką buildera i relaya.",
          "O lokalnej akceptacji nadal rozstrzygają status payloadu zwrócony przez klienta wykonawczego i kontrole klienta konsensusu. Endpoint [[rpc-provider|providera]] może udostępniać bloki wyprodukowane tą ścieżką, ale nie dowodzi, że relay był uczciwy ani że najnowszy blok jest sfinalizowany. Gdy aplikacja potrzebuje mocniejszych dowodów, trzeba sięgnąć po nagłówki konsensusu, commitmenty payloadów i [[finality|finalność]]."
        ]
      },
      {
        heading: "Utrzymanie ścieżki buildera",
        paragraphs: [
          "Warto monitorować dostępność ofert, czas odpowiedzi relayów, błędy builderów, odsetek fallbacków, skuteczność propozycji, walidację payloadów i propagację między peerami. Przegapioną propozycję trzeba zestawić z logami klienta walidatora i MEV-Boost, odpowiedziami relayów, slotem konsensusu i statusem Engine API po stronie wykonawczej. Sam health check RPC nie powie, czy proposer miał na czas użyteczną ofertę.",
          "Konfigurację MEV-Boost i relayów warto trzymać w systemie kontroli wersji, ograniczać zaufanie do zewnętrznych endpointów i ćwiczyć powrót do lokalnego budowania bloków. Publiczny ruch aplikacji nie powinien współdzielić chronionych interfejsów walidatora. Wdrożenie z [[client-diversity|różnymi klientami]] może ograniczyć skorelowane awarie oprogramowania, ale nie usuwa operacyjnej zależności od builderów i relayów."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie MEV-Boost jako zamiennika klienta wykonawczego albo klienta konsensusu.",
      "Dawanie builderom albo relayom dostępu do kluczy podpisujących walidatora.",
      "Zakładanie, że udana oferta oznacza, że payload ominął lokalną walidację.",
      "Mierzenie tylko dostępności RPC przy ignorowaniu timeoutów relayów i przegapionych obowiązków proposera."
    ]
  },
  validator: {
    title: "Walidator",
    aliases: ["walidator", "staker", "efektywne saldo", "indeks walidatora", "maksymalne efektywne saldo", "obowiązki walidatora"],
    summary: "Walidator to wpis w stanie Beacon Chain, identyfikowany kluczem publicznym BLS i indeksem, zasilony depozytem co najmniej 32 ETH. Ma przydział do atestowania w każdej epoce, a gdy zostanie wybrany, proponuje blok.",
    sections: [
      {
        heading: "Rekord, a nie maszyna",
        paragraphs: [
          "Walidator istnieje w stanie konsensusu: to indeks, klucz publiczny, withdrawal credentials (dane określające, dokąd trafiają wypłaty), rzeczywiste saldo i efektywne saldo, które jest zaokrąglane w dół i używane do wyznaczania wszystkich wag. Jeden fizyczny serwer może obsługiwać tysiące walidatorów, a [[validator-client|klienta walidatora]] można przenieść na nowy sprzęt bez wiedzy łańcucha, bo tożsamością jest klucz i indeks, a nigdy host.",
          "Minimum to 32 ETH. Od Pectra [[eip|EIP-7251]] podnosi maksymalne efektywne saldo do 2048 ETH dla walidatorów, których withdrawal credentials mają prefiks `0x02` (compounding). Jeden rekord może więc trzymać skonsolidowany stake i zarabiać na całości, zamiast dzielić go na dziesiątki wpisów po 32 ETH. Efektywne saldo wyznacza zarówno wagę [[attestation|atestacji]], jak i szansę na wybór na proposera."
        ]
      },
      {
        heading: "Obowiązki",
        paragraphs: [
          "Każdy aktywny walidator atestuje dokładnie raz na epokę, w jednym przydzielonym komitecie i w jednym z 32 slotów. Proponowanie bloków zdarza się rzadziej i jest losowe: w każdym 12-sekundowym slocie [[randao|RANDAO]] wybiera jednego proposera z prawdopodobieństwem proporcjonalnym do efektywnego salda. Mały, rotujący podzbiór walidatorów zasiada też w [[sync-committee|sync committee]]. Obowiązki pobiera się z [[beacon-node|beacon node'a]] przez [[beacon-api|Beacon API]] z wyprzedzeniem co najmniej jednej epoki.",
          "[[validator-rewards|Nagrody]] są wypłacane za terminowe i poprawne głosy; pominięty obowiązek oznacza utratę tej nagrody i karę w tej samej wysokości, dlatego walidator offline traci powoli, a nie katastrofalnie. Jeśli łańcuch przestaje finalizować, inactivity leak (kara za nieaktywność) drenuje salda walidatorów, którzy nie biorą udziału w głosowaniu, dopóki aktywny zbiór nie skurczy się na tyle, żeby znów można było finalizować. Equivocation, czyli podpisanie sprzecznych wiadomości, to problem innego rodzaju i zajmuje się nim [[slashing|slashing]]."
        ]
      },
      {
        heading: "Cykl życia i gdzie widać go w RPC",
        paragraphs: [
          "Depozyt wpłacony do kontraktu depozytowego w [[execution-layer|warstwie wykonawczej]] trafia do kolejki aktywacji, której przepustowość ogranicza limit churn (ile stake może w jednej epoce wejść do aktywnego zbioru albo z niego wyjść). Wyjścia, dobrowolne albo wywołane z warstwy wykonawczej przez [[eip|EIP-7002]], przechodzą przez analogiczną kolejkę, a potem przez okres oczekiwania na wypłatę. Od [[eip|EIP-6110]] depozyty są odczytywane bezpośrednio z bloku, a nie przez osobny mechanizm głosowania, co skraca czas do aktywacji.",
          "Żadna metoda `eth_` nie zwraca listy walidatorów. Odczytuje się je z Beacon API pod `/eth/v1/beacon/states/{state_id}/validators/{id}`, co zwraca indeks, saldo w gwei i `status`, na przykład `active_ongoing` albo `exited_unslashed`. W [[json-rpc|JSON-RPC]] warstwy wykonawczej widać za to same wypłacane środki: [[withdrawals|wypłaty (withdrawals)]] pojawiają się w tablicy `withdrawals` bloku jako zwykłe zwiększenia salda, bez transakcji, bez receiptu i bez logu, który dałoby się zaindeksować."
        ]
      }
    ],
    example: {
      title: "Jeden walidator odczytany z Beacon API",
      note: "Liczby w Beacon API to dziesiętne ciągi w gwei, a nie `0x` [[hex-encoding|QUANTITY]]; `18446744073709551615` to epoka z dalekiej przyszłości, która oznacza, że wyjście tego walidatora nie zostało zaplanowane."
    },
    pitfalls: [
      "Odczytywanie `balance` tam, gdzie chodziło o `effective_balance`; wagę atestacji i szansę na wybór na proposera wyznacza tylko zaokrąglone efektywne saldo.",
      "Zakładanie, że każdy walidator ma dokładnie 32 ETH, co przestało być prawdą, gdy Pectra dopuściła withdrawal credentials typu compounding z saldem do 2048 ETH.",
      "Mylenie bycia offline ze slashingiem; przestój kosztuje mniej więcej tyle, ile były warte pominięte nagrody, a equivocation kosztuje dużo więcej.",
      "Indeksowanie ruchów ETH wyłącznie na podstawie transakcji i pomijanie wypłat (withdrawals), które zasilają adres bez transakcji i bez receiptu."
    ]
  },
  attestation: {
    title: "Atestacja",
    aliases: ["attestation", "głos walidatora", "attestation data", "głos komitetu", "agregat", "zagregowana atestacja", "głos LMD"],
    summary: "Atestacja to podpisany głos walidatora, który zawiera naraz trzy twierdzenia: blok head, który walidator w tej chwili widzi, checkpoint źródłowy (source), od którego głosuje, i checkpoint docelowy (target), który chce oznaczyć jako justified.",
    sections: [
      {
        heading: "Trzy głosy w jednym podpisie",
        paragraphs: [
          "Podpisywany obiekt jest mały. `slot` mówi kiedy; od Electra (EIP-7549) `index` ma zawsze wartość `0`, a komitet jest wskazywany poza podpisanymi danymi: jako `committee_index` w pojedynczej atestacji i jako pole `committee_bits` w agregacie. `beacon_block_root` to głos na head, który zasila [[fork-choice|LMD-GHOST]], a pary checkpointów `source` i `target` to głos Casper FFG, który zasila [[finality|finalność]]. Jedna wiadomość obsługuje więc dwie reguły. Dlatego ten sam głos może być błędny na dwa różne sposoby i dlatego warunki [[slashing|slashingu]] są zapisane względem source i target, a nie względem head.",
          "O czasie decyduje slot. Członek komitetu atestuje, gdy tylko dotrze [[beacon-block|blok beacon]] jego slotu, a jeśli nie dotrze, po upływie jednej trzeciej 12-sekundowego slotu; wyznaczeni agregatorzy publikują po dwóch trzecich. Głos, który dotrze późno, nadal liczy się dla [[fork-choice|fork choice]], ale daje mniejszą nagrodę, przez co rozjechany zegar okazuje się kosztownym błędem konfiguracji."
        ]
      },
      {
        heading: "Komitety i agregacja",
        paragraphs: [
          "Każdy aktywny [[validator|walidator]] trafia w każdej epoce do dokładnie jednego komitetu, więc cały zbiór walidatorów głosuje raz w ciągu 32 slotów. [[bls-signature|Podpisy BLS]] członków z identycznymi danymi atestacji są agregowane w jeden podpis z polem bitowym `aggregation_bits`, które zaznacza, kto podpisał. Pojedyncze atestacje krążą w 64 [[libp2p-gossip|podsieciach gossip]] przeznaczonych dla atestacji, agregaty komitetów w jednym globalnym topiku, a następny proposer łączy agregaty z identycznymi danymi z różnych komitetów w co najwyżej osiem atestacji on-chain na blok. Każda z nich ma pole `committee_bits`, które zaznacza objęte nią komitety.",
          "To agregacja sprawia, że liczby się spinają. Głosy ponad miliona walidatorów zapisane osobno nigdy nie zmieściłyby się w bloku; zapisane jako pola bitowe komitetów się mieszczą. Ceną jest to, że aplikacja czytająca atestacje widzi obiekty na poziomie komitetów, a żeby przypisać bit do indeksu walidatora, potrzebuje z [[beacon-api|Beacon API]] przydziałów dla tego slotu każdego komitetu wymienionego w `committee_bits`."
        ]
      },
      {
        heading: "Od wiadomości gossip do tagu bloku",
        paragraphs: [
          "Atestacje są mechanizmem, który stoi za dwoma tagami bloku, używanymi codziennie przez zwykły kod wywołujący RPC. Wystarczająco dużo głosów na target w epoce sprawia, że checkpoint staje się justified, a [[consensus-client|klient konsensusu]], który nie stosuje nowszego [[fast-confirmation-rule|Fast Confirmation Rule]], raportuje go jako `safe`. Gdy dwa kolejne checkpointy zostaną oznaczone jako justified, wcześniejszy z nich zostaje sfinalizowany i staje się `finalized`. Te rooty trafiają do [[execution-client|klienta wykonawczego]] przy każdym `engine_forkchoiceUpdated` przez [[engine-api|Engine API]].",
          "Ten sam łańcuch zależności wyznacza też sposób awarii. Gdy spada uczestnictwo walidatorów (participation), `latest` przesuwa się normalnie, a `finalized` stoi w miejscu. Aplikacja, która rozlicza operacje na `finalized`, zatrzymuje się bez żadnego błędu w odpowiedziach [[json-rpc|JSON-RPC]]. Monitorowanie uczestnictwa w atestacjach i odległości włączenia do bloku (inclusion distance) wykrywa to wcześniej niż obserwowanie numerów bloków."
        ]
      }
    ],
    example: {
      title: "Jedna zagregowana atestacja z body bloku beacon",
      note: "Każdy wyzerowany bit to członek komitetu, który nie zaatestował na czas; dashboardy uczestnictwa liczą właśnie zera, a nie podpis. Od Electra `data.index` ma zawsze wartość `0`, a pole `committee_bits` tego agregatu wskazuje wszystkie 64 komitety slotu."
    },
    pitfalls: [
      "Odczytywanie atestacji jako głosu tylko na jeden blok; zawiera ona też commitment do checkpointów source i target.",
      "Próba ustalenia, kto podpisał, na podstawie `aggregation_bits` bez pobrania przydziałów dla dokładnie tego slotu każdego komitetu zaznaczonego w `committee_bits`.",
      "Uruchamianie węzła z dryfującym zegarem, co daje spóźnione atestacje: zarabiają mniej i obniżają scoring węzła u peerów gossip.",
      "Ocenianie kondycji łańcucha tylko po wysokości bloku, podczas gdy spadek uczestnictwa najpierw widać po tagu `finalized`, który przestaje się przesuwać."
    ]
  },
  "sync-committee": {
    title: "Sync committee",
    aliases: ["sync committee", "Altair", "sync aggregate", "512 walidatorów", "komitet dla lekkich klientów"],
    summary: "Sync committee to zbiór 512 walidatorów, losowany od nowa co 256 epok (około 27 godzin), których członkowie podpisują każdy nowy nagłówek bloku, dzięki czemu [[light-client|lekki klient]] może śledzić łańcuch, sprawdzając jeden zagregowany podpis na slot.",
    sections: [
      {
        heading: "Po co mały komitet",
        paragraphs: [
          "Uczciwe podążanie za [[fork-choice|fork choice]] wymaga śledzenia całego zbioru aktywnych walidatorów i [[attestation|atestacji]], które ten zbiór produkuje, a to daleko wykracza poza możliwości rozszerzenia przeglądarki czy urządzenia wbudowanego. Aktualizacja Altair dodała celowo mały, wolno rotujący komitet, żeby weryfikator musiał znać naraz tylko 512 kluczy publicznych BLS, by rozstrzygnąć, czy nagłówek jest prawdziwy.",
          "Wolna rotacja to druga połowa tego projektu. Skład na następny okres da się wyliczyć cały okres wcześniej, więc klient, który ufa komitetowi okresu N, może udowodnić komitet okresu N+1 ze stanu, który już zweryfikował, i w ten sposób przeskakiwać do przodu bez końca od jednego zaufanego punktu startowego. To ten sam rodzaj kotwicy [[weak-subjectivity|weak subjectivity]], jakiej potrzebuje pełny węzeł."
        ]
      },
      {
        heading: "Jak przenoszony jest podpis",
        paragraphs: [
          "Członkowie są losowani z wagą efektywnego salda [[validator|walidatora]] na okres 256 epok, czyli 8192 slotów, mniej więcej 27 godzin. Każdy członek podpisuje root bloku bieżącego slotu, a następny [[beacon-block|blok beacon]] zawiera `sync_aggregate` z 512-bitowym polem `sync_committee_bits` i jednym zagregowanym podpisem. Za udział w komitecie przysługuje dodatkowa nagroda, a za pominięcie obowiązku kara.",
          "Lekcy klienci korzystają z tego przez dedykowane ścieżki [[beacon-api|Beacon API]]: najpierw [[light-client-update|bootstrap od zaufanego roota bloku]], potem aktualizacje `light_client`, aktualizacje finalności i aktualizacje optymistyczne. Każda aktualizacja dowodzi następnego komitetu gałęzią Merkle (Merkle branch) względem stanu beacon zakodowanego w [[ssz|SSZ]], więc klient nigdy nie musi ufać serwerowi, który przekazał mu bajty."
        ]
      },
      {
        heading: "Czego dowodzi, a czego nie",
        paragraphs: [
          "Na tym mechanizmie opierają się proxy [[verified-rpc|weryfikowanego RPC]], takie jak [[helios|Helios]] i verified proxy klienta [[nimbus|Nimbus]]. Śledzą aktualizacje sync committee, żeby uzyskać zaufany [[block-header|nagłówek]] bloku wykonawczego, a potem odpowiadają na wywołania `eth_` lokalnie: pobierają [[eth-get-proof|eth_getProof]] od niezaufanego [[rpc-provider|providera]] i sprawdzają go względem [[state-root|state root]] z tego nagłówka.",
          "Ta gwarancja jest słabsza niż [[finality|finalność]], a próg zależy od tego, do czego aktualizacja służy. Protokół synchronizacji lekkiego klienta z Altair uznaje aktualizację za ważną już wtedy, gdy podpisze ją jeden członek, przesuwa swój optymistyczny head, gdy podpisało ją więcej członków niż połowa ostatniego szczytowego uczestnictwa, a co najmniej dwóch trzecich z 512 bitów wymaga tylko po to, żeby zastosować sfinalizowany nagłówek albo następny komitet. Po pełnym okresie bez takiej aktualizacji może wymusić zastosowanie najlepszej, jaką widział. Wiadomości sync committee nie podlegają slashingowi, więc nieuczciwy komitet ryzykuje znacznie mniej niż walidator, który podpisuje sprzeczne atestacje (equivocation). Warto używać tego jako taniego sprawdzenia kanoniczności, a i tak czekać na sfinalizowany checkpoint, gdy od odpowiedzi zależą prawdziwe pieniądze."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie podpisu sync committee jak finalności; członkowie komitetu dostają karę za nieobecność, ale nie podlegają slashingowi za podpisanie złego nagłówka.",
      "Bootstrap lekkiego klienta od dowolnego roota bloku bez jego sprawdzenia, co przywraca problem weak subjectivity, który ten mechanizm miał rozwiązać.",
      "Zakładanie, że komitet zmienia się co epokę; jest losowany raz na okres 256 epok, czyli mniej więcej 27 godzin.",
      "Oczekiwanie, że sync aggregate bezpośrednio dowodzi stanu wykonawczego, podczas gdy uwierzytelnia on tylko nagłówek, względem którego trzeba sprawdzić osobny dowód."
    ]
  },
  slashing: {
    title: "Slashing",
    aliases: [
      "slashing",
      "proposer slashing",
      "attester slashing",
      "surround vote",
      "double vote",
      "podwójny podpis",
      "kara za sprzeczne podpisy",
      "EIP-3076"
    ],
    summary: "Slashing to kara protokołu dla walidatora, który podpisze dwie sprzeczne wiadomości: drugi blok w tym samym slocie albo dwie atestacje, które są podwójnym głosem (double vote) albo z których jedna otacza drugą (surround vote).",
    sections: [
      {
        heading: "Dwa przewinienia, w obu sprzeczne podpisy",
        paragraphs: [
          "Proposer slashing to dwa różne podpisane [[beacon-block|bloki beacon]] dla tego samego slotu od tego samego [[validator|walidatora]]. Attester slashing to dwie różne [[attestation|atestacje]], które albo mają tę samą epokę target, niezależnie od tego, które z ich pól się różni, albo w których przedział od source do target jednego głosu ściśle otacza przedział drugiego. Oba przypadki da się udowodnić samymi dwoma podpisami, bez odwoływania się do warunków w sieci.",
          "Ponieważ dowód jest samowystarczalny, może go zgłosić każdy: zgłaszający (whistleblower) dostaje nagrodę, a część trafia do proposera, który umieści dowód w bloku. Dlatego bycie offline to zupełnie inna kategoria. Przestój oznacza utratę nagród i karę mniej więcej tej samej wielkości, a equivocation, czyli podpisanie sprzecznych wiadomości, wymusza wyjście walidatora i niszczy stake."
        ]
      },
      {
        heading: "Ile to kosztuje",
        paragraphs: [
          "Walidator ukarany slashingiem jest natychmiast oznaczany, dostaje karę początkową, przestaje zarabiać i trafia do kolejki wymuszonego wyjścia z opóźnieniem wypłaty liczonym w tygodniach. W trakcie tego okresu nakładana jest kara korelacyjna (correlation penalty), która rośnie z tym, jak duży łączny stake został ukarany slashingiem w tym samym oknie czasu. Odosobniony błąd da się więc przetrwać, a skorelowana awaria u dużego operatora albo w jednej implementacji klienta jest rujnująca.",
          "Tak to celowo zaprojektowano. Ten mechanizm wycenia różnicę między jedną źle skonfigurowaną maszyną a skoordynowaną próbą sfinalizowania dwóch łańcuchów i to z jego powodu [[client-diversity|różnorodność klientów]] jest dla stakerów argumentem finansowym, a nie tylko idealistycznym."
        ]
      },
      {
        heading: "Jak mu zapobiegać i jak go zobaczyć przez RPC",
        paragraphs: [
          "[[validator-client|Klient walidatora]] prowadzi [[slashing-protection|bazę ochrony przed slashingiem]], w której zapisuje, co podpisał każdy klucz. Bazę można wyeksportować w formacie wymiany [[eip|EIP-3076]]. [[lighthouse|Lighthouse]] przechowuje każdy podpisany blok i każdą atestację, a minimalny wariant, na który EIP też pozwala, zapisuje tylko najwyższy podpisany slot bloku oraz najwyższe epoki source i target. Klasyczny incydent to nie atak, tylko operator, który uruchomił jeden klucz w dwóch miejscach: failover, który nigdy nie odciął starego hosta, albo przywrócenie z kopii katalogu danych bez aktualnego pliku ochrony.",
          "Nic w [[json-rpc|JSON-RPC]] warstwy wykonawczej nie zgłasza slashingu. Dowody pojawiają się w body bloku jako `proposer_slashings` i `attester_slashings`, a `status` walidatora w [[beacon-api|Beacon API]] zmienia się na wariant slashed. Dużo później pozostałe saldo pojawia się jako zwykły wpis [[withdrawals|wypłaty]] w bloku wykonawczym, bez transakcji i bez receiptu."
        ]
      }
    ],
    example: {
      title: "Zapis ochrony przed slashingiem, który zapobiega podwójnemu podpisowi",
      note: "Zaimportuj go przed uruchomieniem klucza na nowym sprzęcie; bez niego nowy klient nie wie, co stary już podpisał."
    },
    pitfalls: [
      "Przekonanie, że za bycie offline grozi slashing; przestój to niewielka kara, a slashingiem karane jest podpisanie dwóch sprzecznych wiadomości.",
      "Przywracanie walidatora z kopii katalogu danych bez aktualnej bazy ochrony przed slashingiem, a potem podpisanie slotu, który już był podpisany.",
      "Budowanie failoveru active-active dla tych samych kluczy; to najczęstszy sposób, w jaki operatorzy sami doprowadzają do swojego slashingu.",
      "Szukanie eventów slashingu w JSON-RPC warstwy wykonawczej, podczas gdy dowody pojawiają się tylko w body bloku beacon i w statusie z Beacon API."
    ]
  },
  mev: {
    title: "MEV",
    aliases: ["maximal extractable value", "maksymalna wartość do wydobycia", "sandwich", "atak sandwich", "frontrunning", "bundle"],
    summary: "MEV (maximal extractable value, maksymalna wartość możliwa do wydobycia) to zysk dostępny dla tego, kto decyduje o kolejności transakcji w bloku i o tym, które w ogóle do niego trafią. Zdobywa się go przez arbitraż, likwidacje i ataki sandwich na cudze transakcje pending.",
    sections: [
      {
        heading: "Wartość tkwi w kolejności",
        paragraphs: [
          "EVM jest deterministyczna, ale wynik [[transaction|transakcji]] zależy od tego, co wykonało się przed nią. Swap, który przesuwa cenę, można otoczyć zakupem przed nim i sprzedażą za nim, [[liquidation-bot|pożyczka, która właśnie przestała być wystarczająco zabezpieczona, płaci temu, kto zlikwiduje ją pierwszy]], a różnica cen między dwiema giełdami to okazja do atomowego arbitrażu. Nic z tego nie wymaga błędu; wynika to z publicznego [[mempool|mempoolu]] i z tego, że kolejność wybiera jedna strona.",
          "[[searcher|Searcherzy]] polują na takie okazje i wyrażają je jako [[mev-bundle|bundle]]: uporządkowane listy transakcji, które trafiają do bloku wszystkie razem albo wcale. Bundle może opakować cudzą transakcję pending, dlatego transakcja czekająca w publicznym mempoolu jest wejściem do cudzej strategii, zanim stanie się wpisem w bloku."
        ]
      },
      {
        heading: "Kto naprawdę buduje blok",
        paragraphs: [
          "Od [[the-merge|Merge]] większość proposerów nie składa własnych bloków. Builderzy konkurują o zbudowanie najlepiej płacącego [[execution-payload|execution payloadu]], [[relay|relaye]] dostarczają oferty, a [[validator-client|klient walidatora]] podpisuje przez [[mev-boost|MEV-Boost]] zaślepiony nagłówek (blinded header) i nie widzi zawartości, dopóki się nie zobowiąże. Proposer bierze zapłatę, a decyzja o kolejności należy do buildera.",
          "Dla wywołującego RPC praktyczna konsekwencja jest taka, że blok, do którego trafi transakcja, najpewniej nie został złożony przez węzeł, do którego ją wysłano. [[block-tag|Tag bloku]] `pending` i `txpool_content` opisują lokalny mempool jednego węzła, a nie kolejność, z jaką jakiś builder zaraz wygra slot."
        ]
      },
      {
        heading: "Co może zrobić wywołujący",
        paragraphs: [
          "Wywołanie [[eth-send-raw-transaction|eth_sendRawTransaction]] na publicznym endpoincie publikuje podpisaną transakcję przez [[devp2p|devp2p]] do każdego peera, także do searcherów, i to przez cały czas, gdy czeka ona na blok. Symulacja przez [[eth-call|eth_call]] mówi, co by się stało na bieżącym stanie, a nie na stanie, który transakcja naprawdę zastanie, gdy wokół niej zostaną wstawione inne transakcje.",
          "Typowe zabezpieczenia to ciasny limit slippage (dopuszczalnego poślizgu ceny) i deadline, żeby niekorzystny sandwich skończył się revertem, a nie wykonaniem, oraz [[private-rpc|prywatny endpoint dla transakcji]], który przekazuje je builderom zamiast do publicznego mempoolu. Prywatne kierowanie ma własne kompromisy: builder, który dostaje transakcję, nadal ją widzi, a dotarcie do mniejszej liczby builderów może oznaczać dłuższe czekanie na włączenie do bloku."
        ]
      }
    ],
    pitfalls: [
      "Traktowanie MEV jak exploita do załatania, choć to konsekwencja publicznego ustalania kolejności, którą może zmienić tylko sam mechanizm ustalania kolejności.",
      "Ustawianie hojnej tolerancji slippage dla niezawodności; to dokładnie ten parametr, którego sandwich potrzebuje, żeby się opłacał.",
      "Czytanie `pending` albo wyników metod txpool_ jako obrazu całej sieci, choć to lokalny mempool jednego węzła, który nie wiąże żadnego buildera.",
      "Zakładanie, że prywatny endpoint RPC ukrywa transakcję przed wszystkimi, choć builder, który ją dostaje, siłą rzeczy ją widzi."
    ]
  },
  randao: {
    title: "RANDAO",
    aliases: [
      "prevRandao",
      "PREVRANDAO",
      "randao_reveal",
      "mix randao",
      "EIP-4399",
      "block.prevrandao",
      "losowość on-chain",
      "losowość w kontrakcie"
    ],
    summary: "RANDAO to skumulowana losowość Beacon Chain: każdy proposer dorzuca do bieżącej wartości hash podpisu [[bls-signature|BLS]] nad numerem epoki, a ta wartość służy jako seed do wyboru proposerów i komitetów i trafia do [[evm|EVM]] jako `PREVRANDAO`.",
    sections: [
      {
        heading: "Jak narasta mix",
        paragraphs: [
          "Każdy [[beacon-block|blok beacon]] zawiera `randao_reveal`, czyli podpis BLS proposera nad numerem bieżącej epoki w domenie `DOMAIN_RANDAO`. Łańcuch weryfikuje go kluczem publicznym proposera, hashuje SHA-256 i XOR-uje wynik z mixem (skumulowaną wartością losową) bieżącej epoki. Podpis BLS jest deterministyczny, więc proposer nie może szukać korzystniejszego revealu metodą wielu prób (grinding); jedyny wybór, jaki ma, to czy reveal w ogóle się pojawi. Stan beacon przechowuje jeden mix na epokę w `randao_mixes`, buforze cyklicznym o 65 536 pozycjach, więc z dowolnego stanu można odczytać wartości z około 290 dni.",
          "Mix jest wykorzystywany z wyprzedzeniem. Seed dla epoki N pochodzi z mixu w takiej postaci, jaką miał na końcu epoki N−2, więc komitety następnej [[slot-epoch|epoki]] są ustalone, zanim ona się zacznie. Od Fulu stan beacon przechowuje też `proposer_lookahead` (EIP-7917), który z góry wyznacza wszystkich proposerów bieżącej i następnej epoki. Dzięki temu [[validator-client|klient walidatora]] może pobrać swoje obowiązki z wyprzedzeniem, a projekty [[preconfirmation|preconfirmations]] typu based wiedzą, kto zaproponuje następny blok."
        ]
      },
      {
        heading: "PREVRANDAO i mixHash",
        paragraphs: [
          "[[eip|EIP-4399]] udostępnił mix kontraktom przy [[the-merge|Merge]]. Opcode `0x44`, wcześniej `DIFFICULTY`, zwraca `PREVRANDAO`, a [[block-header|nagłówek]] bloku wykonawczego przechowuje te same 32 bajty w polu, które JSON-RPC nadal nazywa `mixHash`. Wartość w bloku N to mix po revealu poprzedniego bloku: warstwa konsensusu sprawdza `payload.prev_randao` względem bieżącego mixu, zanim zastosuje reveal samego bloku N. Stąd „prev” w nazwie.",
          "Wartość jest więc publiczna od chwili, gdy publiczny jest blok rodzica. [[eth-call|eth_call]] na danym bloku działa z wartością tego bloku, [[eth-get-block-by-number|eth_getBlockByNumber]] zwraca ją jako `mixHash`, a [[eth-simulate|eth_simulateV1]] przyjmuje nadpisanie bloku (block override) `prevRandao`. Po stronie konsensusu `GET /eth/v1/beacon/states/{state_id}/randao` w [[beacon-api|Beacon API]] zwraca mix dla opcjonalnego parametru zapytania `epoch`, a gdy epoka wykracza poza okno 65 536 pozycji zapisanych w stanie, odpowiada HTTP 400."
        ]
      },
      {
        heading: "Na ile proposer może wpłynąć na wynik",
        paragraphs: [
          "Mix trudno przewidzieć, ale nie jest odporny na manipulację. Proposer, któremu nie odpowiada wartość, jaką dałby jego reveal, może pominąć swój slot, rezygnując z dochodu z bloku, i zostawić mix bez zmian: ma do wyboru dwa wyniki, czyli jeden bit wpływu. Najcenniejszy bit ma ostatni proposer epoki, bo jego wybór ustala seed dla komitetów i proposerów dwie epoki później. Kto kontroluje k kolejnych slotów na końcu epoki, wybiera spośród `2^k` wyników. Jeden uczciwy reveal później przywraca nieprzewidywalność.",
          "Aplikacje są narażone na tańszą manipulację. Proposer bloku N zna wartość, którą udostępnia blok N, a ponieważ zna własny reveal, wie też, co udostępni blok N+1. Może więc dołączyć transakcję z rzutem kością albo przesunąć ją do następnego bloku, zależnie od tego, co mu się bardziej opłaca. Dlatego EIP-4399 zaleca, żeby najpierw zamknąć wybory, a losować później: przestać przyjmować zakłady, a potem odczytać losowość bloku o kilka epok późniejszego. Jako rozsądne wyprzedzenie podaje cztery epoki."
        ]
      },
      {
        heading: "Kiedy RANDAO nie wystarcza",
        paragraphs: [
          "Tam, gdzie jeden bit sterowania jest wart więcej niż dochód z bloku, na przykład przy głównej wygranej w loterii albo odkrywaniu rzadkiego przedmiotu, sam `PREVRANDAO` to zły prymityw. Wyrocznia VRF (VRF oracle) zwraca wartość razem z dowodem, że obliczono ją z wcześniej zadeklarowanego klucza i seeda żądania, więc dostawca nie może wybierać spośród wyników, choć nadal może nie odpowiedzieć. Schematy commit-reveal dają tę samą własność kosztem dodatkowej rundy i uczestnika, który może odmówić ujawnienia swojej wartości.",
          "Rollupy nie dziedziczą mixu z Beacon Chain, chyba że przewidują to ich własne reguły. Na Arbitrum `block.prevrandao` to stała 1, a na każdym łańcuchu prowadzonym przez jeden [[sequencer|sekwencer]] to, co zwraca ten opcode, jako pierwszy zna operator tego łańcucha. Kod używający `PREVRANDAO` trzeba przeglądać osobno dla każdego łańcucha, a nie dla każdej wersji kompilatora."
        ]
      }
    ],
    pitfalls: [
      "Używanie `block.prevrandao` bieżącego bloku jako seeda loterii; proposer tego bloku już tę wartość zna i może sterować wynikiem, dołączając losowanie albo je opóźniając.",
      "Traktowanie wartości w bloku N jako revealu samego bloku N; to mix sprzed tego revealu, ustalony, gdy tylko istnieje blok rodzica.",
      "Przenoszenie kodu losującego bez zmian na L2, gdzie opcode może zwracać stałą albo wartość, którą operator zobaczył pierwszy.",
      "Szukanie pola `prevRandao` w wyniku `eth_getBlockByNumber`; wartość jest tam pod starą nazwą `mixHash`."
    ]
  },
  "builder-api": {
    title: "Builder API",
    aliases: [
      "builder-specs",
      "API builderów",
      "getHeader",
      "submitBlindedBlock",
      "registerValidator",
      "blinded block",
      "SignedBuilderBid",
      "builder_boost_factor"
    ],
    summary: "Builder API, zdefiniowane w repozytorium builder-specs, to interfejs REST, przez który [[beacon-node|beacon node]] proposera rejestruje swoje preferencje u zewnętrznych builderów bloków, prosi o podpisaną ofertę (bid) na swój slot i wymienia podpisany blinded block na publikację pełnego payloadu.",
    sections: [
      {
        heading: "Trzy wywołania wokół propozycji bloku",
        paragraphs: [
          "Najpierw jest rejestracja, i to powtarzana. [[validator-client|Klient walidatora]] podpisuje `ValidatorRegistrationV1` z polami `fee_recipient`, `gas_limit`, `timestamp` i `pubkey`, przekazuje go swojemu beacon node przez `POST /eth/v1/validator/register_validator`, a beacon node przesyła go builderom przez `POST /eth/v1/builder/validators`; specyfikacja zaleca wysyłanie rejestracji ponownie w każdej epoce. Podpis używa osobnej domeny `DOMAIN_APPLICATION_BUILDER`, więc rejestracji nigdy nie da się podać za wiadomość konsensusu, a timestamp porządkuje rejestracje, żeby nieaktualna nie zastąpiła nowszej.",
          "W slocie proposera beacon node wywołuje `GET /eth/v1/builder/header/{slot}/{parent_hash}/{pubkey}`. Strona buildera, która ma blok, odpowiada obiektem `SignedBuilderBid` z nagłówkiem [[execution-payload|execution payloadu]], kwotą `value` w wei i kluczem publicznym podpisującego; jeśli nie ma nic, odpowiada `204`. Proposer składa blinded block, czyli [[beacon-block|blok beacon]], którego body zawiera `execution_payload_header` zamiast payloadu, podpisuje go i odsyła na `/eth/v1/builder/blinded_blocks` albo do jego następcy w wersji v2. Dopiero wtedy transakcje zostają ujawnione."
        ]
      },
      {
        heading: "Co daje blinding i ile kosztuje",
        paragraphs: [
          "Blinding to mechanizm, który uniemożliwia proposerowi kradzież bloku buildera. Nagłówek zawiera commitment do każdej transakcji przez `transactionsRoot`, więc gdy proposer podpisze blok z tym nagłówkiem, każdy inny blok dla tego slotu byłby drugą podpisaną propozycją, czyli equivocation, za którą grozi [[slashing|slashing]]. Payload można więc bezpiecznie ujawnić po podpisie, a proposer jest związany jego zawartością, choć sam jej nie wykonał.",
          "Ceną jest zaufanie w drugą stronę. Proposer nie może sprawdzić, czy payload jest poprawny, czy kwota `value` z oferty zostanie naprawdę wypłacona ani czy blok zostanie opublikowany; wszystkie trzy gwarancje bierze na siebie [[relay|relay]]. Proposer, który podpisał blinded block, nie może też wrócić do bloku lokalnego, jeśli payload nigdy nie zostanie ujawniony, bo taki lokalny blok jest właśnie tym sprzecznym podpisem, przed którym ostrzega specyfikacja. Slot po prostu przepada."
        ]
      },
      {
        heading: "Lokalny fallback i circuit breakery",
        paragraphs: [
          "Specyfikacja wymaga, żeby uczciwy proposer równolegle budował blok lokalnie przez [[engine-api|Engine API]] i porzucał ścieżkę buildera, jeśli w ciągu `BUILDER_PROPOSAL_DELAY_TOLERANCE`, czyli jednej sekundy, nie przyjdzie żadna oferta. Klient walidatora steruje wyborem parametrem `builder_boost_factor` w `GET /eth/v3/validator/blocks/{slot}`: `0` preferuje lokalny payload, `100` bierze to, co płaci więcej, a `2**64 - 1` preferuje buildera; nagłówek odpowiedzi `Eth-Execution-Payload-Blinded` mówi, co wróciło. Klient wykonawczy też może poprosić o użycie własnego payloadu, ustawiając `shouldOverrideBuilder` w odpowiedzi [[engine-payload|engine_getPayload]].",
          "Beacon node'y przestają też odpytywać builderów, gdy łańcuch wygląda na niezdrowy. To zabezpieczenie liveness, które specyfikacja nazywa [[circuit-breaker|circuit breakerem]] i którego implementację zostawia każdemu klientowi. [[lighthouse|Lighthouse]] dokumentuje je jako `--builder-fallback-skips` (domyślnie 3 pominięte sloty z rzędu), `--builder-fallback-skips-per-epoch` (domyślnie 8) i `--builder-fallback-epochs-since-finalization` (domyślnie 3); inni klienci używają własnych nazw i progów."
        ]
      },
      {
        heading: "Wersje po Fulu",
        paragraphs: [
          "Endpointy dostają nowe wersje pojedynczo. Po Fulu `submitBlindedBlock` w wersji v1, który zwracał wywołującemu payload i bloby, jest przestarzały (deprecated) na rzecz `POST /eth/v2/builder/blinded_blocks`, który odpowiada `202 Accepted` bez body i zobowiązuje stronę buildera do samodzielnego opublikowania bloku i blobów. [[mev-boost|MEV-Boost]] najpierw próbuje v2, a do v1 wraca, gdy relay odpowie statusem błędu. Glamsterdam planuje [[enshrined-pbs|wbudowaną w protokół separację proposera i buildera]] (enshrined PBS, EIP-7732), której część konsensusowa, Gloas, zamienia oferty w obiekty protokołu i wycofuje rejestracje, ale Gloas nie ma jeszcze epoki aktywacji na mainnecie."
        ]
      }
    ],
    pitfalls: [
      "Powrót do lokalnie zbudowanego bloku, gdy blinded block jest już podpisany: w sieci pojawiają się wtedy dwie podpisane propozycje dla tego slotu, a walidatora spotyka slashing.",
      "Oczekiwanie, że wywołanie v2 dla blinded block zwróci payload; odpowiada ono 202 z pustym body, a blok trafia do łańcucha tylko wtedy, gdy opublikuje go strona buildera.",
      "Traktowanie `value` z oferty jako kwoty gwarantowanej przez protokół; po stronie proposera nic tego nie sprawdza, robi to tylko symulacja relaya.",
      "Zmiana fee recipient w kliencie walidatora w przekonaniu, że builderzy od razu się dostosują, choć budują według ostatniej rejestracji, jaką dostali."
    ]
  },
  relay: {
    title: "Relay",
    aliases: [
      "relay MEV-Boost",
      "MEV-Boost relay",
      "mev-boost-relay",
      "flashbots_validateBuilderSubmissionV5",
      "walidacja zgłoszeń bloków",
      "bid trace",
      "proposer_payload_delivered",
      "relay optymistyczny",
      "optimistic relay"
    ],
    summary: "Relay to zaufany pośrednik między builderami a proposerami: przyjmuje od builderów kompletne bloki, symuluje każdy z nich na własnym [[execution-client|kliencie wykonawczym]], najlepszy przedstawia proposerowi jako ofertę blinded i publikuje payload dopiero po podpisie proposera.",
    sections: [
      {
        heading: "Co relay robi w jednym slocie",
        paragraphs: [
          "Builderzy wysyłają kompletne bloki na `POST /relay/v1/builder/blocks`, każdy opakowany w bid trace, który wskazuje slot, hash rodzica, klucze buildera i proposera, fee recipient proposera i obiecaną kwotę `value`. Relay sprawdza podpis buildera i zgodność bloku z rejestracją proposera z [[builder-api|Builder API]], a potem zachowuje najlepszą poprawną ofertę. Gdy [[mev-boost|MEV-Boost]] proposera wywołuje `getHeader`, relay zwraca tylko nagłówek i wartość tego bloku, podpisane własnym kluczem BLS relaya. Dlatego URL relaya w MEV-Boost zawiera klucz publiczny: `https://0xpubkey@host`.",
          "Relay potrzebuje własnego kontekstu łańcucha. Po pierwsze potrzebuje [[beacon-node|beacon node'ów]], które strumieniują eventy `head` i `payload_attributes`, żeby wiedział, kto będzie następnym proposerem oraz jakie `prevRandao` i wypłaty (withdrawals) musi zawierać ten blok. Po drugie potrzebuje węzła wykonawczego, na którym symuluje bloki. Przy `submitBlindedBlock` sprawdza podpis proposera, publikuje pełny blok przez swoje beacon node'y i dopiero potem, w wywołaniu v1, zwraca proposerowi payload."
        ]
      },
      {
        heading: "Walidacja bloku na węźle wykonawczym relaya",
        paragraphs: [
          "Symulacja to zadanie dla klienta wykonawczego, które nie ma miejsca w standardowym API JSON-RPC. mev-boost-relay wysyła ją do węzła pod adresem `BLOCKSIM_URI`, w przestrzeni nazw `flashbots`: `flashbots_validateBuilderSubmissionV5` dla bloków Fulu, V4 dla Electra, V3 dla Deneb. Żądanie zawiera bid trace, pełny payload, blobs bundle, execution requests, podpis buildera, `registered_gas_limit` proposera i `parent_beacon_block_root`. Węzeł wykonuje blok na stanie rodzica i zwraca błąd, jeśli cokolwiek różni się od tego, co zadeklarował builder.",
          "Kontrole wykraczają poza zwykły import bloku. Moduł `flashbots` w [[reth|Reth]], który obsługuje wersje od V3 do V6, porównuje nagłówek z wynikiem wykonania, egzekwuje zarejestrowany limit gasu i weryfikuje płatność, czyli jedyną rzecz obiecaną w ofercie, której proposer nie może sprawdzić przed podpisem: albo saldo fee recipienta wzrosło co najmniej o `value`, nie licząc wypłat, albo ostatnia transakcja to zwykły przelew dokładnie `value` na jego adres. Może też odrzucać bloki, które dotykają adresów ze skonfigurowanej czarnej listy (disallow list). Moduł Flashbots w [[nethermind|Nethermind]] deklaruje tylko V3, oficjalny [[geth|Geth]] nie ma takiej metody, a fork Geth od Flashbots, który kiedyś ją obsługiwał, jest zarchiwizowany."
        ]
      },
      {
        heading: "Kto komu ufa",
        paragraphs: [
          "Proposer ufa relayowi podwójnie: że blok, który podpisuje w ciemno, jest poprawny, i że relay opublikuje go na czas. Jeśli zawiedzie jedno albo drugie, slot przepada, a proposer nie uratuje go lokalnym blokiem bez equivocation, czyli podpisania drugiego, sprzecznego bloku. Builder ufa, że relay nie przejmie strategii z jego bloku, bo relay widzi każdą transakcję. Żadna ze stron nie może tego sprawdzić w czasie rzeczywistym; relaye konkurują reputacją, a niektóre działają w trybie optymistycznym, w którym przyjmują bloki builderów z wpłaconym zabezpieczeniem (collateral), zanim symulacja się zakończy.",
          "Incydent z kwietnia 2023 pokazuje, co chroni ta kolejność. Proposer podpisał nagłówek z wyzerowanymi polami parent root i state root, relay ultra sound ujawnił payload, choć beacon node'y odrzuciły blok, a proposer wykorzystał ujawnione transakcje botów sandwich we własnym bloku i zgarnął około 20 milionów dolarów. Dziś relaye publikują blok przez swoje beacon node'y, zanim cokolwiek zwrócą, a wywołanie v2 nie zwraca nic."
        ]
      },
      {
        heading: "Dane relayów jako źródło wiedzy o MEV",
        paragraphs: [
          "Relaye publikują API danych, na którym opiera się większość dashboardów [[mev|MEV]]. `GET /relay/v1/data/bidtraces/proposer_payload_delivered` wypisuje dostarczone payloady, z filtrami `slot`, `block_number`, `block_hash`, `proposer_pubkey` albo `builder_pubkey` i z `value` w wei, a `builder_blocks_received` wypisuje każde zgłoszenie. To dane, które relaye raportują same o sobie. Builderzy wysyłają jeden blok do wielu relayów, a MEV-Boost wysyła podpisany nagłówek do każdego skonfigurowanego relaya, więc ten sam slot może się pojawić jako dostarczony w kilku z nich, a `value` to deklaracja, którą trzeba porównać z płatnością w samym bloku."
        ]
      }
    ],
    example: {
      title: "Jeden dostarczony payload z API danych relaya",
      note: "`value` to zapis oferty prowadzony przez relay, w wei; dowodem płatności jest ostatnia transakcja bloku 23380000 albo zmiana salda fee recipienta, odczytana zwykłym [[json-rpc|JSON-RPC]]."
    },
    pitfalls: [
      "Mylenie `relay.flashbots.net`, który przyjmuje bundle i prywatne transakcje, z relayem MEV-Boost pod `boost-relay.flashbots.net`.",
      "Sumowanie `proposer_payload_delivered` z wielu relayów bez deduplikacji po `block_hash`, przez co jeden blok liczy się kilka razy.",
      "Traktowanie `value` z relaya jako przychodu proposera bez sprawdzenia przelewu zamykającego blok albo zmiany salda.",
      "Kierowanie symulacji relaya na węzeł, którego moduł Flashbots nie ma wersji potrzebnej dla bieżącego forka, przez co każde zgłoszenie kończy się błędem.",
      "Przekonanie, że to symulacja relaya czyni blok poprawnym; każdy węzeł wykonuje go ponownie przy imporcie, a błędna symulacja kosztuje proposera tylko slot."
    ]
  },
  searcher: {
    title: "Searcher",
    aliases: [
      "MEV searcher",
      "searcher MEV",
      "MEV bot",
      "bot MEV",
      "arbitrage bot",
      "bot arbitrażowy",
      "backrun",
      "liquidation bot",
      "eth_callBundle",
      "MEV-Share"
    ],
    summary: "Searcher to operator działający poza łańcuchem (a nie rola w protokole), który znajduje okazje [[mev|MEV]], takie jak arbitraż, likwidacje i backruny, i wysyła je do builderów bloków jako bundle, których wartość zależy od trafienia dokładnie we właściwą pozycję.",
    sections: [
      {
        heading: "Co robi searcher",
        paragraphs: [
          "Searcher obserwuje stan i napływ transakcji pending, oblicza opłacalną sekwencję transakcji i wysyła ją jako [[mev-bundle|bundle]] do jednego albo kilku builderów: atomowy arbitraż między dwiema [[dex-pool-reads|pulami]] po dużym swapie, likwidację pożyczki, której zabezpieczenie właśnie spadło poniżej progu, albo backrun, czyli transakcję handlującą tuż za cudzą transakcją. Bundle płaci za swoją pozycję przez priority fee albo bezpośredni przelew na `coinbase` bloku, a konkurencja między searcherami podbija tę zapłatę tak, że pochłania ona zwykle większość wartości okazji.",
          "Protokół nie wie o istnieniu searcherów. To zwykłe konta wysyłające zwykłe podpisane transakcje, a ich ruch wyróżnia kanał: [[private-rpc|prywatne wysyłanie]] do builderów zamiast przez publiczny [[mempool|mempool]] i semantyka bundli, dzięki której nieudana próba po prostu znika, zamiast skończyć się revertem on-chain. Builderzy, a za nimi [[relay|relaye]], są dalej w tym potoku; to, co produkuje searcher, jest wejściem do bloku, którym builder licytuje."
        ]
      },
      {
        heading: "Czego searcher potrzebuje od RPC",
        paragraphs: [
          "Po pierwsze niskich opóźnień (latency). Searcher [[fastest-head|reaguje na nowy head]] albo [[mempool-streaming|transakcję pending]] i musi zasymulować i wysłać bundle w ułamku 12-sekundowego slotu, dlatego poważni searcherzy uruchamiają własne węzły, czytają przez [[ipc-transport|IPC]] albo lokalny [[websocket-transport|WebSocket]] i używają [[eth-subscribe|eth_subscribe]] dla `newHeads` i `newPendingTransactions` zamiast odpytywania (pollingu). Współdzielony endpoint providera dokłada przeskoki sieciowe i [[rate-limits|rate limity]], a mempool każdego węzła to tylko jego własny obraz ruchu.",
          "Po drugie symulacji przypiętej do znanego bloku nadrzędnego. [[eth-call|eth_call]] na jawnie podanym hashu bloku, [[state-override|state override]] dla hipotetycznych sald albo kodu i [[eth-simulate|eth_simulateV1]] dla sekwencji wielu transakcji odpowiadają na pytanie, co się stanie, jeśli moje transakcje wykonają się na tym stanie. Builderzy oferują wersję dopasowaną do bundli: `eth_callBundle` od Flashbots przyjmuje `txs`, docelowy `blockNumber` i `stateBlockNumber`, na którym bundle ma się wykonać, a to jest dokładnie pytanie o to, na jaki blok nadrzędny trafi bundle."
        ]
      },
      {
        heading: "Ukryty ruch i historia",
        paragraphs: [
          "Duża część opłacalnego ruchu nigdy nie trafia do publicznego mempoolu. Aukcje przepływu zleceń (order-flow auctions), takie jak [[mev-share|MEV-Share od Flashbots]], publikują częściowe wskazówki (hinty) przez strumień server-sent events pod `https://mev-share.flashbots.net`: podwójnie zahashowany hash transakcji, a jeśli nadawca na to pozwala, także logi, adres docelowy, calldata albo selektor funkcji. Searcher może wtedy zrobić backrun transakcji, której nie widzi w całości, wysyłając bundle przez `mev_sendBundle` i dzieląc się zyskiem z pierwotnym nadawcą.",
          "Praca nad strategiami opiera się na historii. Backtesting odtwarza dawne bloki, co wymaga [[archive-node|węzła archiwalnego]] dla stanu na dowolnej wysokości, metod [[debug-api|debug_]] albo [[trace-api|trace_]], żeby widzieć wywołania wewnętrzne, oraz receiptów każdego bloku z zakresu. To obciążenie jest duże i skokowe, i często właśnie przez nie searcherzy wyrastają z planów providerów rozliczanych za użycie i stawiają własną infrastrukturę."
        ]
      }
    ],
    pitfalls: [
      "Symulowanie na `latest` i zakładanie, że bundle zastanie ten stan, choć builder może umieścić przed nim inne transakcje w docelowym bloku.",
      "Traktowanie strumienia `newPendingTransactions` jednego węzła jak całego rynku, choć wiele konkurencyjnego ruchu trafia do builderów prywatnie i nigdy się tam nie pojawia.",
      "Wysyłanie strategii przez publiczny mempool, gdzie inni searcherzy mogą ją skopiować albo zrobić przed nią front-run, zanim trafi do bloku.",
      "Backtesting na węźle z pruningiem, któremu brakuje starego stanu potrzebnego do odtworzenia, przez co w połowie zakresu pojawia się błąd `missing trie node`."
    ]
  },
  "distributed-validator": {
    title: "Rozproszony walidator (DVT)",
    aliases: [
      "rozproszony walidator",
      "DVT",
      "distributed validator",
      "distributed validator technology",
      "Obol Charon",
      "SSV",
      "podpis progowy",
      "threshold signing",
      "DKG",
      "key shares",
      "części klucza"
    ],
    summary: "Rozproszony walidator to jeden klucz [[validator|walidatora]] obsługiwany przez kilka niezależnych węzłów. Każdy z nich trzyma część progowego klucza [[bls-signature|BLS]], a węzły uzgadniają, co podpisać, zanim wymagana progiem liczba podpisów częściowych zostanie połączona w jeden zwykły podpis.",
    sections: [
      {
        heading: "Jeden klucz, kilku operatorów",
        paragraphs: [
          "Klucze BLS można podzielić progowo: na n części takich, że dowolne t podpisów częściowych pod tą samą wiadomością łączy się dokładnie w podpis, który złożyłby cały klucz, więc łańcuch nie widzi różnicy. Części powstają zwykle w ceremonii rozproszonego generowania klucza (distributed key generation, DKG), co oznacza, że pełny klucz prywatny nigdy nie istnieje na żadnej maszynie. Efektem jest redundancja active-active dla pojedynczego walidatora: przy czterech operatorach i progu trzech jeden węzeł może być offline, a nawet działać złośliwie, i obowiązki są dalej wykonywane.",
          "Uzgodnienie musi nastąpić przed podpisaniem. Gdyby każdy operator podpisywał to, co podsunął mu jego własny beacon node, podpisy częściowe obejmowałyby różne dane atestacji i nigdy by się nie połączyły. Dlatego każdy obowiązek zaczyna się od rundy konsensusu odpornej na błędy bizantyjskie (BFT) między operatorami; obie główne implementacje używają do tego QBFT. Runda ustala dokładny obiekt i dopiero wtedy każdy węzeł podpisuje go swoją częścią klucza. Zajmuje ona czas wewnątrz slotu, co ma największe znaczenie przy [[block-proposal|propozycji bloku]]."
        ]
      },
      {
        heading: "Middleware albo zamiennik",
        paragraphs: [
          "Charon od Obol to middleware. Stoi między niezmodyfikowanym [[validator-client|klientem walidatora]] a jego [[beacon-node|beacon node'em]], wystawia klientowi walidatora [[beacon-api|Beacon API]] na `--validator-api-address` (domyślnie `127.0.0.1:3600`) i przekazuje żądania do prawdziwych beacon node'ów podanych w `--beacon-node-endpoints`. Klient walidatora trzyma swoją część klucza i prowadzi własną ochronę przed slashingiem; Charon prowadzi konsensus ze swoimi peerami przez libp2p i agreguje ich podpisy częściowe. Klaster czterech węzłów toleruje jeden węzeł złośliwy, a klaster trzech tylko jeden węzeł offline.",
          "SSV zastępuje klienta walidatora. Węzeł SSV trzyma część klucza swojego operatora i sam wykonuje obowiązki, w komitetach liczących 4, 7, 10 lub 13 operatorów. Potrzebuje endpointu beacon przez HTTP (`BEACON_NODE_ADDR`) i [[execution-client|klienta wykonawczego]] przez WebSocket (`ETH_1_ADDR`), bo walidatorzy, części kluczy, operatorzy i adresy fee recipient są rejestrowani w kontrakcie sieci SSV, a węzeł poznaje je z jego [[event-log|eventów]]. Czyta je z opóźnieniem 8 bloków względem head, żeby płytki [[reorg|reorg]] nie podsunął mu nieaktualnego składu."
        ]
      },
      {
        heading: "Slashing i RANDAO przy podpisie progowym",
        paragraphs: [
          "Podpisywanie progowe przesuwa ryzyko [[slashing|slashingu]]. Pojedyncza część klucza, która podpisze dwa razy, jest niegroźna, bo do powstania podpisu potrzeba t części, więc wiadomość podlegająca slashingowi wymaga, żeby t operatorów podpisało sprzeczne obiekty. Charon się na tym opiera: przejęty Charon, który proponuje double vote, trafia na własną bazę ochrony każdego klienta walidatora i zostaje odrzucony. Niebezpieczne stają się za to operacje powielania. Uruchomienie jednego węzła klastra w dwóch miejscach liczy się jako węzeł złośliwy, a ponowne złożenie części w zwykły klucz, gdy klaster nadal działa, gwarantuje podwójny podpis.",
          "Każdy podpisywany obiekt wymaga progu, także [[randao|RANDAO reveal]] proposera. Propozycja bloku zaczyna się więc od rundy, która łączy częściowe reveale, zanim beacon node w ogóle może zostać poproszony o blok, a potem następuje runda konsensusu nad samym blokiem. Bloki od builderów pasują tu niezgrabnie, bo każdy operator musi zgodzić się na jeden blinded header; włączony w Charonie tryb `--builder-api` produkuje wyłącznie bloki od builderów."
        ]
      },
      {
        heading: "Diagnozowanie pominiętego obowiązku",
        paragraphs: [
          "Awaria przechodzi teraz przez cztery procesy u każdego operatora (klient wykonawczy, beacon node, węzeł DV i, w przypadku Charona, klient walidatora), a do tego przez kilku operatorów. Pominięta atestacja może oznaczać, że do konsensusu osiągalnych jest za mało peerów, że beacon node jednego z operatorów ma inny head, więc runda nie może dojść do zgody, że zegary się rozjechały albo że endpoint wykonawczy został w tyle. Pierwsze pytania brzmią: czy runda konsensusu się zakończyła i ile podpisów częściowych dotarło. Odpowiedź dają tylko własne logi i metryki węzła DV."
        ]
      }
    ],
    pitfalls: [
      "Uruchamianie zapasowej kopii węzła klastra na wszelki wypadek; klaster liczy ją jako złośliwego peera, a klaster trzech węzłów takiego peera nie toleruje.",
      "Łączenie części kluczy w samodzielny klucz, gdy klaster nadal działa, co gwarantuje podwójny podpis.",
      "Podawanie węzłowi SSV adresu URL wykonawczego przez HTTP; oczekuje endpointu WebSocket i czyta przez niego eventy kontraktu sieci.",
      "Obwinianie beacon node'a za pominięty obowiązek przed sprawdzeniem, czy operatorzy osiągnęli konsensus; tego kroku nie widzi żaden endpoint beacon ani wykonawczy."
    ]
  },
  preconfirmation: {
    title: "Preconfirmation (preconf)",
    aliases: [
      "preconf",
      "preconfirmation",
      "preconfy",
      "based preconfirmation",
      "soft confirmation",
      "proposer commitment",
      "Commit-Boost",
      "Bolt",
      "Flashblocks"
    ],
    summary: "Preconfirmation (w skrócie preconf) to podpisane zapewnienie proposera L1 albo [[sequencer|sekwencera]] L2, że transakcja zostanie włączona do bloku, a czasem także z jakim wynikiem, wydane, zanim powstanie blok, który ją zawiera.",
    sections: [
      {
        heading: "Drabina gwarancji",
        paragraphs: [
          "Preconf to najniższy szczebel drabiny, której szczeble wywołujący powinien jawnie rozróżniać. Wyżej jest włączenie do bloku: blok z transakcją został opublikowany i istnieje dla niej [[transaction-receipt|receipt]], choć [[reorg|reorg]] wciąż może ją usunąć. Jeszcze wyżej jest [[block-tag|tag]] `safe`, gdy checkpoint bloku jest justified albo, na kliencie stosującym [[fast-confirmation-rule|Fast Confirmation Rule]], gdy ta reguła uzna blok za potwierdzony. Na szczycie jest `finalized`, którego nie da się cofnąć bez slashingu co najmniej jednej trzeciej ETH w stakingu. Preconf to zapewnienie dotyczące bloku, który jeszcze nie istnieje, i jest dokładnie tak mocny, jak to, co skłania wystawcę do dotrzymania słowa.",
          "To, co wymusza dotrzymanie preconfu, zależy od projektu. Projekty based (w których kolejność ustalają proposerzy Ethereum) stawiają na szali zabezpieczenie (collateral) wystawcy: proposer się rejestruje, podpisuje commitmenty swoim kluczem walidatora albo kluczem delegowanym i może dostać slashing przez kontrakt, jeśli zaproponowany przez niego blok złamie któryś z nich, a to wymaga, żeby commitment dało się sprawdzić on-chain. Scentralizowany sekwencer L2 nie wnosi żadnego zabezpieczenia; za jego słowem stoją reputacja i to, że i tak kontroluje kolejność."
        ]
      },
      {
        heading: "Na L1: commitmenty proposerów",
        paragraphs: [
          "Proposer L1 może składać zapewnienia tylko dla własnego slotu, więc based preconfy zależą od tego, czy wiadomo, kto zaproponuje następny blok. Od Fulu beacon state zawiera deterministyczne `proposer_lookahead` na bieżącą i następną epokę, dodane w EIP-7917 między innymi po to, żeby kontrakty mogły udowodnić harmonogram względem roota bloku beacon. Użytkownik wysyła żądanie do endpointu nadchodzącego proposera albo do gatewaya działającego w jego imieniu, proposer podpisuje commitment, a tuż przed slotem przekazuje transakcje objęte commitmentami builderom jako ograniczenia (constraints), które blok musi spełnić.",
          "Większość z tego wciąż się kształtuje. Bolt od Chainbound zaimplementował cały ten przepływ jako fork stosu [[mev-boost|MEV-Boost]], a jego repozytorium jest teraz zarchiwizowane. Commit-Boost to sidecar walidatora, który implementuje [[builder-api|Builder API]] tak jak MEV-Boost i dodaje moduł podpisujący, dzięki czemu protokoły commitmentów mogą uzyskiwać podpisy kluczami walidatora albo delegowanymi kluczami proxy, nie przechowując tych kluczy. Taiko, rollup based, prowadzi preconfy na mainnecie, ale wystawiają je preconferzy z zamkniętej listy partnerów startowych, a nie walidatorzy L1."
        ]
      },
      {
        heading: "Na L2 unsafe head to właśnie preconf",
        paragraphs: [
          "Każdy rollup z sekwencerem już wydaje preconfy, tylko pod inną nazwą. Gdy [[l2-rpc|endpoint L2]] zwraca receipt sekundę po wysłaniu, blok za nim to unsafe head: wyprodukowany i rozgłoszony przez sekwencer, ale jeszcze niemożliwy do odtworzenia z danych na L1. Flashblocks od Base idą dalej i co około 200 milisekund strumieniują częściowe bloki, udostępniane przez tag `pending` w metodach takich jak `eth_getBlockByNumber`, `eth_call` i `eth_getBalance`. Aktualizacja Denim w Base, działająca na Base Sepolia od 21 października 2026 i planowana na mainnecie Base na listopad 2026, zastępuje Flashblocks pełnymi blokami co 200 milisekund i znosi ten stan `pending`.",
          "Żadna standardowa metoda `eth_` nie pozwala poprosić o preconf ani go nie zwraca. Każdy projekt ma własny endpoint i format odpowiedzi, a commitment nie jest częścią żadnego bloku, więc indekser nie odtworzy go później z danych łańcucha. Symulacja zostaje z niewygodnym problemem: commitmenty złożone dla następnego bloku nie są widoczne w `latest`, więc [[eth-call|eth_call]] albo [[eth-simulate|eth_simulateV1]] na `latest` ignoruje transakcje, które wykonają się wcześniej, a sekwencję, na której trzeba budować, zna tylko endpoint samego wystawcy."
        ]
      }
    ],
    pitfalls: [
      "Zaliczanie wpłaty użytkownikowi albo wydawanie towaru na podstawie preconfu tak, jakby był włączeniem do bloku, gdy jedynym zabezpieczeniem może być reputacja wystawcy.",
      "Traktowanie receiptu L2 z unsafe head jako rozliczonego; to preconf sekwencera, dopóki batch nie dotrze na L1.",
      "Symulowanie na `latest`, gdy wcześniej wykonają się transakcje objęte commitmentami, przez co wynik opisuje stan, na który transakcja nigdy nie trafi.",
      "Zakładanie, że protokół based preconf działa i grozi slashingiem, bo ma specyfikację; trzeba sprawdzić, czy jego kontrakty są wdrożone i czy proposerzy do niego przystąpili."
    ]
  },
  "validator-rewards": {
    title: "Nagrody walidatora",
    aliases: [
      "nagrody walidatora",
      "nagrody za staking",
      "staking rewards",
      "consensus rewards",
      "nagrody za atestacje",
      "attestation rewards",
      "execution-layer rewards",
      "fee recipient income",
      "rewards API",
      "staking APR"
    ],
    summary: "Walidator zarabia w dwóch miejscach. Nagrody i kary konsensusu są zapisywane w gwei na jego saldzie w Beacon Chain i później wypłacane przez sweep jako [[withdrawals|wypłaty]], a dochód z warstwy wykonawczej, czyli priority fees i płatności MEV, trafia na [[address|adres]] fee recipient w blokach, które walidator proponuje.",
    sections: [
      {
        heading: "Nagrody w warstwie konsensusu",
        paragraphs: [
          "Większość dochodu z konsensusu to zapłata za głosowanie. W każdej epoce [[validator|walidator]] zarabia za terminowe i poprawne głosy source, target i head w swojej [[attestation|atestacji]], z wagami 14, 26 i 14 na 64 w rozliczeniu Altair, i jest karany za brakujący albo błędny głos source lub target; pominięty głos head kosztuje tylko utraconą nagrodę. Te kwoty są rozliczane na końcu następnej epoki i skalują się z ogólnym poziomem udziału walidatorów. Członkowie [[sync-committee|sync committee]] zarabiają w każdym slocie z wagą 2, a proposer dostaje wagę 8 za umieszczenie w bloku atestacji, podpisów sync committee i dowodów slashingu.",
          "Nic z tego nie jest transakcją. Saldo zmienia się wewnątrz stanu beacon, a ETH dociera do warstwy wykonawczej dopiero wtedy, gdy sweep wypłat dojdzie do walidatora i przeleje nadwyżkę ponad jego pułap, 32 ETH dla credentials `0x01` i 2048 ETH dla `0x02`, jako wpis wypłaty z kwotą w gwei, bez hasha transakcji, receiptu i logu. Walidatorów, którzy wciąż mają credentials `0x00`, sweep w ogóle nie obejmuje, dopóki swoim kluczem wypłat [[bls-signature|BLS]] nie podpiszą zmiany credentials na adres w warstwie wykonawczej."
        ]
      },
      {
        heading: "Dochód z warstwy wykonawczej",
        paragraphs: [
          "Gdy walidator proponuje blok, priority fees z tego bloku idą na adres fee recipient z payloadu, a base fee i opłaty za bloby są spalane i nie trafiają do nikogo; zobacz [[eip-1559|EIP-1559]]. Przy bloku zbudowanym lokalnie tym odbiorcą jest sugerowany fee recipient samego walidatora. Przy bloku kupionym przez [[mev-boost|MEV-Boost]] pole `miner` w nagłówku to zwykle adres buildera, a proposer dostaje zapłatę ostatnią transakcją buildera w bloku, zwykłym przelewem wartości oferty na zarejestrowany adres fee recipient. [[relay|Relaye]] sprawdzają, czy jest dokładnie taki przelew albo równoważny wzrost salda, zanim przekażą ofertę dalej.",
          "Dochodem proposera z warstwy wykonawczej przy bloku od buildera jest więc ten przelew, a nie priority fees z bloku, które trafiły do buildera. Te dwie kwoty łączy tylko marża buildera, a raport, który sumuje priority fees z własnych bloków, może się mylić w obie strony."
        ]
      },
      {
        heading: "Odczytywanie nagród przez Beacon API",
        paragraphs: [
          "[[beacon-api|Beacon API]] ma trzy ścieżki do nagród, wszystkie w gwei. `GET /eth/v1/beacon/rewards/blocks/{block_id}` zwraca nagrodę konsensusu proposera za jeden blok, rozbitą na `attestations`, `sync_aggregate`, `proposer_slashings` i `attester_slashings`. `POST /eth/v1/beacon/rewards/attestations/{epoch}` zwraca dla każdego walidatora wartości `head`, `target`, `source` i `inactivity` obok idealnych kwot dla każdego efektywnego salda, a `POST /eth/v1/beacon/rewards/sync_committee/{block_id}` zwraca nagrodę każdego członka. Kary pojawiają się jako liczby ujemne i żadna ścieżka nie obejmuje dochodu z warstwy wykonawczej.",
          "Każda ścieżka przelicza nagrody od nowa na podstawie stanów beacon z okolic żądanego bloku lub epoki, więc raportowanie starych okresów wymaga [[beacon-node|beacon node'a]], który trzyma stany historyczne. Węzeł po pruningu albo świeżo zsynchronizowany przez [[checkpoint-sync|checkpoint sync]] odpowiada HTTP 404, czyli kodem, którego specyfikacja używa, gdy potrzebny stan lub dane są niedostępne. Klienci nazywają ten tryb różnie: [[lighthouse|Lighthouse]] `--archive`, [[teku|Teku]] `--data-storage-mode=archive`, [[nimbus|Nimbus]] `--history=archive`, a węzeł po checkpoint sync i tak musi najpierw zrobić backfill (dociągnąć historię wstecz), zanim stare stany w ogóle się w nim pojawią."
        ]
      }
    ],
    example: {
      title: "Nagroda konsensusu za jeden blok i nagroda jednego walidatora za atestację",
      note: "`total` to suma czterech składników, w gwei, i obejmuje tylko dochód z konsensusu; płatność MEV za ten sam blok to transakcja w bloku wykonawczym, którą znajdzie [[eth-get-block-by-number|eth_getBlockByNumber]]."
    },
    pitfalls: [
      "Liczenie priority fees z bloku od buildera jako dochodu proposera, choć proposer dostał końcowy przelew od buildera, a opłaty trafiły do buildera.",
      "Szukanie nagród konsensusu w transakcjach albo receiptach; do warstwy wykonawczej docierają tylko jako wypłaty, które nie mają hasha transakcji.",
      "Traktowanie nagrody za blok z Beacon API jako całkowitej wartości bloku; obejmuje tylko nagrody konsensusu, bez priority fees i MEV.",
      "Odpytywanie ścieżek nagród o epoki sprzed miesięcy na beacon node po pruningu i odczytywanie 404 jako braku nagród, a nie braku stanów.",
      "Raportowanie opłat brutto z samodzielnie zbudowanego bloku razem z base fee, która została spalona i nigdy nie dotarła do fee recipient."
    ]
  },
  "bls-signature": {
    title: "Podpisy BLS",
    aliases: [
      "podpis bls",
      "agregacja podpisów",
      "podpis zagregowany",
      "domena podpisu",
      "dowód posiadania klucza",
      "klucz publiczny bls"
    ],
    summary: "Podpisy BLS na krzywej BLS12-381 to sposób, w jaki [[consensus-layer|warstwa konsensusu]] podpisuje wszystko: 48-bajtowy klucz publiczny, 96-bajtowy podpis i właściwość, dzięki której wiele podpisów pod jedną wiadomością łączy się w jeden podpis, weryfikowany względem połączonych kluczy.",
    sections: [
      {
        heading: "Rozmiary i agregacja",
        paragraphs: [
          "Ethereum używa zestawu kryptograficznego (ciphersuite) `BLS_SIG_BLS12381G2_XMD:SHA-256_SSWU_RO_POP_`, który umieszcza klucze publiczne w mniejszej grupie G1, a podpisy w G2, więc skompresowany klucz ma 48 bajtów, a podpis 96 bajtów. [[validator|Walidator]] jest identyfikowany tym kluczem i indeksem, nigdy [[address|adresem]]. Kluczową właściwością jest agregacja: podpisy różnych kluczy pod tą samą wiadomością sumują się do jednego 96-bajtowego podpisu, a `FastAggregateVerify` sprawdza go względem sumy kluczy jedną weryfikacją zamiast osobnej dla każdego podpisującego.",
          "Właśnie dzięki temu konsensus mieści się w blokach. Podpisy członków komitetu pod identycznymi danymi składają się w jeden podpis i pole bitowe (bitfield), więc [[attestation|atestacja]] niesie jeden podpis bez względu na to, czy podpisało 30 członków, czy 400. `sync_aggregate` [[sync-committee|sync committee]] robi to samo dla 512 członków naraz: 512-bitowe pole i jeden podpis pod rootem bloku z poprzedniego slotu, i tylko to [[light-client|lekki klient]] sprawdza dla każdego nagłówka. Weryfikacja nadal wymaga klucza każdego podpisującego, więc weryfikujący musi wiedzieć, których walidatorów dotyczą bity."
        ]
      },
      {
        heading: "Domeny wiążą podpis z łańcuchem i celem",
        paragraphs: [
          "Nic nie jest podpisywane bezpośrednio. Signing root to hash [[ssz|SSZ]] obiektu razem z 32-bajtową domeną: 4-bajtowym typem domeny, na przykład `0x01000000` dla atestacji albo `0x02000000` dla ujawnień RANDAO, po którym następuje 28 bajtów hasha z wersji forka i `genesis_validators_root` łańcucha. Atestacja z mainnetu nie zweryfikuje się więc na testnecie (w sieci testowej), podpisu bloku nie da się ponownie użyć jako głosu, a większość wiadomości jest związana z wersją forka, pod którą je podpisano.",
          "Kilka domen celowo nie zależy od forka. Depozyty używają wersji forka z genesis i zerowego rootu, więc jeden podpis depozytu pozostaje ważny we wszystkich forkach, a kontrakt depozytowy w ogóle go nie sprawdza. Od Deneb dobrowolne wyjścia (voluntary exits) są zawsze podpisywane wersją forka Capella, więc wcześniej podpisane wyjście nigdy nie traci ważności. [[builder-api|Builder API]] używa własnej domeny `DOMAIN_APPLICATION_BUILDER` bez rootu genesis, co trzyma rejestracje i oferty (bids) poza przestrzenią podpisów konsensusu."
        ]
      },
      {
        heading: "Atak rogue key i dowód posiadania klucza",
        paragraphs: [
          "Naiwna agregacja kluczy jest niebezpieczna. Atakujący, który opublikuje klucz obliczony jako jego własny klucz minus klucz ofiary, może wyprodukować agregat, który wygląda, jakby zawierał ofiarę, i weryfikuje się z podpisem złożonym wyłącznie przez atakującego. Obroną jest dowód posiadania (proof of possession): każdy klucz musi najpierw podpisać coś, co pokazuje, że właściciel zna klucz prywatny. W Ethereum tym dowodem jest podpis depozytu, weryfikowany przez warstwę konsensusu przy dodawaniu nowego klucza; depozyt ze złym podpisem po prostu nie tworzy walidatora, a jego ETH nie jest zwracane.",
          "Weryfikacja jest kosztowna, bo każde sprawdzenie obejmuje parowania (pairings), dużo wolniejsze niż odzyskiwanie podpisującego w [[ecdsa-signature|secp256k1]], dlatego [[beacon-node|beacon node'y]] weryfikują wiadomości z gossipu w batchach. Kilku klientów korzysta też z jednej biblioteki BLS, blst, co [[client-diversity|różnorodność klientów]] traktuje jako skorelowane ryzyko, którego osobne bazy kodu nie usuwają."
        ]
      },
      {
        heading: "Porównanie z ECDSA i weryfikacja on-chain",
        paragraphs: [
          "Podpisy ECDSA w warstwie wykonawczej mają 65 bajtów, nie da się ich agregować i pozwalają węzłowi odzyskać adres podpisującego z samego podpisu, dlatego transakcja nie ma pola `from`. Podpis BLS nic nie odzyskuje: weryfikacja przyjmuje klucz publiczny jako dane wejściowe. Jeden staker występuje więc pod dwiema tożsamościami, jako klucz BLS w Beacon Chain i jako adresy w warstwie wykonawczej, powiązanymi tylko przez withdrawal credentials.",
          "Od Pectra [[eip|EIP-2537]] dodaje [[precompiles|precompile'y]] pod adresami od `0x0b` do `0x11` do arytmetyki BLS12-381: dodawanie i mnożenie wieloskalarne (multi-scalar multiplication) w G1 i G2, mapowanie elementów ciała na punkty krzywej oraz sprawdzenie parowania pod `0x0f`, kosztujące `32600*k + 37700` gasu dla k par. Przyjmują punkty nieskompresowane, 128 bajtów dla G1 i 256 dla G2, więc formy 48- i 96-bajtowe trzeba rozwinąć off-chain, a hashowanie wiadomości do G2 spada na kontrakt, który składa je z SHA-256 i mapowania `0x11`."
        ]
      }
    ],
    pitfalls: [
      "Weryfikowanie podpisu konsensusu ze złą wersją forka albo złym genesis validators root, przez co odrzucane są podpisy całkowicie poprawne.",
      "Oczekiwanie, że klucz BLS walidatora da się zmapować na adres w warstwie wykonawczej, choć te dwie tożsamości łączą tylko withdrawal credentials.",
      "Przekazywanie skompresowanych 48- albo 96-bajtowych kodowań do precompile'ów EIP-2537, które oczekują nieskompresowanych punktów o długości 128 i 256 bajtów i zwracają błąd.",
      "Traktowanie agregatu jako dowodu, kto podpisał, bez przydziału do komitetu, który mapuje jego bity na klucze publiczne."
    ]
  },
  "liquidation-bot": {
    title: "Boty likwidacyjne",
    aliases: [
      "liquidator",
      "likwidator",
      "liquidation bot",
      "health factor",
      "liquidationCall",
      "getUserAccountData",
      "oracle backrun",
      "backrun oracle",
      "flash loan liquidation",
      "likwidacja z flash loanem"
    ],
    summary: "Bot likwidacyjny obserwuje pozycje w protokole pożyczkowym i gdy zabezpieczenie pożyczkobiorcy przestaje pokrywać jego dług z marginesem wymaganym przez protokół, spłaca część tego długu przez funkcję likwidacji protokołu w zamian za zabezpieczenie po obniżonej cenie, ścigając się z innymi botami o tę samą pozycję.",
    sections: [
      {
        heading: "Interes, który oferuje protokół pożyczkowy",
        paragraphs: [
          "Protokół pożyczkowy pozwala pożyczkobiorcy wpłacić zabezpieczenie (collateral), na przykład wrapped ether (WETH), i pożyczyć pod nie inne aktywo, na przykład stablecoin USDC. Jeśli cena zabezpieczenia spadnie wystarczająco, pożyczka staje się zagrożona, a protokół płaci osobom z zewnątrz za jej zamknięcie: każdy może spłacić część długu i zabrać zabezpieczenie o tej samej wartości plus bonus. Bot likwidacyjny istnieje po to, żeby być pierwszym. W tym temacie przykładem jest Aave v3, który wciąż działa obok nowszego V4. Jego kontrakt Pool pod `0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2` odpowiada na `getUserAccountData(address)`, selektor `0xbf92857c`, podając między innymi łączne zabezpieczenie i dług w dolarach amerykańskich (8 miejsc po przecinku) oraz `healthFactor` (18 miejsc po przecinku). Każde zabezpieczenie liczy się tylko do swojego progu likwidacji (liquidation threshold), powiedzmy 83 procent wartości, a health factor to tak ważone zabezpieczenie podzielone przez dług.",
          "Gdy health factor spada poniżej `1e18`, czyli 1,0, pozycję można zlikwidować przez `liquidationCall(collateralAsset, debtAsset, user, debtToCover, receiveAToken)`: wywołujący spłaca dług i dostaje zabezpieczenie o tej wartości plus bonus likwidacyjny danego aktywa, na przykład 5 procent, pomniejszony o opłatę protokołu pobieraną z bonusu. Ile można spłacić, wynika z kodu: cały dług w tym aktywie, chyba że zarówno zabezpieczenie, jak i dług w dwóch zaangażowanych aktywach są warte co najmniej 2000 dolarów, a health factor jest powyżej 0,95; wtedy limitem jest połowa całego długu. Likwidacja, która nie zeruje ani długu, ani zabezpieczenia, musi zostawić co najmniej 1000 dolarów jednego i drugiego, inaczej kończy się revertem z `MustNotLeaveDust`. Inne protokoły działają inaczej: w Compound v3 `absorb` przenosi dług i zabezpieczenie zagrożonego konta na protokół, który później sprzedaje to zabezpieczenie z dyskontem przez `buyCollateral`."
        ]
      },
      {
        heading: "Szukanie pozycji i śledzenie cen",
        paragraphs: [
          "Znajdowanie pozycji to indeksowanie: bot buduje listę pożyczkobiorców przez [[eth-get-logs|eth_getLogs]] po eventach `Borrow` i `Supply` kontraktu Pool od jego wdrożenia, a potem śledzi nowe logi. Każdy nowy head uruchamia ponowne przeliczenie pozycji każdego pożyczkobiorcy blisko progu: tysiące wywołań `getUserAccountData` zebranych w batche przez [[multicall|Multicall3]] i wysłanych jako [[eth-call|eth_call]] przypięte do hasha heada, tak żeby każda odpowiedź opisywała jeden blok. To duże obciążenie odczytami najnowszego stanu jest powodem, dla którego likwidatorom zależy na [[fastest-head|jak najszybszym poznaniu heada]].",
          "Pozycje przekraczają granicę zwykle wtedy, gdy [[price-oracle|oracle]] publikuje nową cenę. Protokoły czytają cenę Chainlink przez kontrakt proxy, który wskazuje na agregator, i to agregator, a nie proxy, emituje `AnswerUpdated(int256,uint256,uint256)`, gdy pojawia się nowa cena. O wyścigu decyduje moment: przed aktualizacją pozycja jest jeszcze zdrowa i likwidacja kończy się revertem, a po niej wygrywa pierwsza likwidacja. Dlatego bot robi backrun aktualizacji, czyli umieszcza swoją likwidację bezpośrednio za nią w tym samym bloku. Żeby sprawdzić z góry, czy to się opłaca, symuluje stan po aktualizacji: przez [[eth-simulate|eth_simulateV1]], które wykonuje obie transakcje po kolei, albo przez [[state-override|state override]], który pod adresem agregatora podstawia kod zaślepki (stub) zwracający nową cenę."
        ]
      },
      {
        heading: "Jak doprowadzić likwidację do bloku",
        paragraphs: [
          "W Aave aktualizacja, która ma znaczenie, nigdy nie trafia do publicznego [[mempool|mempoolu]]. Aave v3 na Ethereum czyta ETH/USD i kilka innych cen przez feedy Smart Value Recapture (SVR) od Chainlink, które wysyłają każdy raport dwa razy: publicznie do standardowego feedu, który Aave ignoruje, i prywatnie przez [[mev-share|MEV-Share]] do agregatora SVR, z którego czyta Aave. MEV-Share trzyma transakcję w ukryciu, pokazuje [[searcher|searcherom]] tylko hint, czyli jej częściowy opis, i wystawia na aukcję prawo do zrobienia na niej backrunu; odzyskaną wartość dzielą między siebie Aave i Chainlink. Jeśli prywatna kopia nie trafi do bloku w konfigurowalnym czasie, feed SVR wraca do standardowej ceny.",
          "Likwidacja to jedna transakcja z własnego kontraktu bota, który rzadko trzyma aktywo długu. Kontrakt bierze flash loan, czyli pożyczkę zaciągniętą i spłaconą w tej samej transakcji, na przykład `flashLoanSimple` z Aave albo bezpłatny `flashLoan` z Morpho, wywołuje likwidację, wymienia przejęte zabezpieczenie z powrotem na aktywo długu, spłaca pożyczkę i zatrzymuje różnicę. Bot wysyła to przez [[private-rpc|prywatny endpoint]] jako [[mev-bundle|bundle]], czyli zestaw transakcji, które builder, strona składająca blok, włącza razem i w podanej kolejności albo wcale: w przypadku SVR jest to `mev_sendBundle` z hashem z hinta aktualizacji na pierwszym miejscu i likwidacją na drugim. Likwidacja płaci builderowi przez priority fee albo przelew na `block.coinbase`, a konkurencja między botami podbija tę ofertę tak, że zbliża się ona do większości zysku.",
          "Porażka jest tania tylko wtedy, gdy jest prywatna: bundle, który przegra wyścig, po prostu nie trafia do bloku, a ta sama transakcja wysłana publicznie kończy się revertem i i tak płaci za gas. Geth obniża gas żądany w każdym `eth_call` do swojego limitu, domyślnie 50 000 000, więc za duży batch Multicall wyczerpuje gas i zawodzi w całości, a endpoint, który ignoruje state overrides, odpowiada według starej ceny. [[keeper|Keepery]] i [[dex-aggregator|agregatory]] obciążają węzeł w ten sam sposób."
        ]
      }
    ],
    example: {
      title: "Jedna aktualizacja oracle i jedna likwidacja w Aave v3",
      note: "Po co każdy krok: przeliczenie znajduje pozycje blisko granicy, hint to jedyny wczesny wgląd w następną cenę Aave, override pokazuje pozycję po tej zmianie, flash loan daje kapitał, którego bot nie ma, a bundle stawia likwidację bezpośrednio za aktualizacją, gdzie albo trafia do bloku, albo zostaje odrzucona bez kosztów. Obserwowanie publicznego mempoolu pokazałoby tylko kopię ze standardowego feedu, która nie zmienia ceny WETH w Aave."
    },
    pitfalls: [
      "Filtrowanie `AnswerUpdated` po adresie proxy Chainlink, choć emituje go agregator stojący za proxy, więc filtr nigdy niczego nie znajduje.",
      "Wypatrywanie w publicznym mempoolu aktualizacji feedu, który Aave czyta przez SVR, choć cena tego feedu dla Aave zmienia się przez MEV-Share.",
      "Przeliczanie pożyczkobiorców na providerze, który jest o blok w tyle, przez co pozycje wyglądają na zdrowe, aż okazuje się, że szybszy bot już je zlikwidował."
    ]
  },
  "intent-solver": {
    title: "Intenty i solverzy",
    aliases: [
      "solver",
      "intent",
      "intencja",
      "CoW Protocol",
      "batch auction",
      "aukcja zbiorcza",
      "UniswapX filler",
      "1inch Fusion resolver",
      "Dutch order",
      "zlecenie holenderskie"
    ],
    summary: "Intent to podpisane zlecenie, które określa wynik, na przykład sprzedaż 10 WETH za co najmniej 24 000 USDC przed upływem terminu, a wybór trasy zostawia solverom, fillerom albo resolverom. Konkurują oni off-chain i rozliczają zlecenie on-chain, więc potrzebują świeżego stanu i symulacji, zawsze pod presją terminu.",
    sections: [
      {
        heading: "Zlecenia, które określają wynik",
        paragraphs: [
          "Transakcja swapu mówi jak: przez które pule, w jakiej kolejności i z jakim slippage. Intent mówi co: użytkownik podpisuje off-chain zlecenie [[eip-712|EIP-712]] z kwotą sprzedaży, minimalną kwotą zakupu i terminem ważności, a strona trzecia, nazywana zależnie od protokołu solverem, fillerem albo resolverem, wybiera trasę, płaci za gas i wysyła transakcję. Kontrakt rozliczeniowy (settlement) sprawdza podpis i limit, zanim przesunie tokeny, więc samo zlecenie chroni użytkownika. CoW Protocol zbiera otwarte zlecenia w aukcję zbiorczą (batch auction), w której solverzy rywalizują o rozliczenie wielu zleceń w jednej transakcji przez `GPv2Settlement` pod `0x9008D19f58AAbD9eD0D60971565AA8510560ab41`. Fillerzy UniswapX i resolverzy 1inch Fusion przyjmują natomiast zlecenia holenderskie (Dutch orders), których kurs startuje wysoko, korzystnie dla użytkownika, i z czasem spada, aż ktoś zlecenie zrealizuje.",
          "Solver CoW składa się z dwóch części: drivera, czyli komponentu open source od CoW, który pobiera płynność, koduje, symuluje i wysyła, oraz silnika solvera (solver engine), czyli algorytmu dopasowującego, który zespół pisze sam. W regularnych odstępach usługa o nazwie autopilot buduje aukcję z otwartych zleceń i wysyła ją do endpointu `/solve` każdego drivera ze znacznikiem czasu `deadline`. Każdy driver odpowiada wynikiem (score) dla każdego rozwiązania, czyli mniej więcej nadwyżką (surplus), jaką daje ono użytkownikom ponad ich ceny limitu. Autopilot wybiera zwycięzców, którzy dostają nagrodę, i wysyła każdemu z nich `/settle` z `submissionDeadlineLatestBlock`, czyli ostatnim dozwolonym blokiem, na mainnecie trzy bloki do przodu. Zwycięskie rozwiązanie, które nie zmieści się w tym terminie, liczy się na niekorzyść solvera we wzorze nagrody, co może sprawić, że nagroda będzie ujemna."
        ]
      },
      {
        heading: "Obciążenie symulacjami",
        paragraphs: [
          "Każda aukcja to nagła seria odczytów i symulacji na najnowszym stanie. Solver odświeża rezerwy setek pul przez [[dex-pool-reads|odczyty pul]], wycenia trasy przez [[eth-call|eth_call]] do [[quoter-contract|kontraktów quoter]] i symuluje każde kandydujące rozliczenie, zanim wystawi mu wynik. Referencyjny driver CoW szacuje gas każdego z nich przez [[eth-estimate-gas|eth_estimateGas]] na bloku `pending` albo na przypiętym bloku, gdy podaje [[state-override|state overrides]], i obcina limit gasu do skonfigurowanego limitu na transakcję, żeby wadliwe rozwiązanie nie zmusiło węzła do szukania aż po limit gasu bloku, a przy wypłatach w natywnym ETH wywołuje [[eth-create-access-list|eth_createAccessList]], bo portfele będące smart kontraktami mogą potrzebować access listy, żeby je odebrać. Przewodnik CoW po lokalnym testowaniu ostrzega, że jego usługi mogą bardzo mocno zużywać zasoby RPC.",
          "Czas jest częścią stanu. Zlecenie holenderskie UniswapX V2 żąda kwoty wyjściowej, która spada liniowo między `decayStartTime` a `decayEndTime`: zlecenie, które na starcie żąda 24 000 USDC, a sześćdziesiąt sekund później 23 900, po dwunastu sekundach żąda około 23 980. Te czasy oraz okno, w którym jeden `exclusiveFiller` dostaje zlecenie jako pierwszy, podpisuje cosigner, czyli drugi klucz, którego podpis sprawdza reactor, kontrakt rozliczeniowy UniswapX. `eth_call` na `latest` wykonuje się ze znacznikiem czasu najnowszego bloku, czyli co najmniej jeden 12-sekundowy slot przed każdym blokiem, w którym może się znaleźć realizacja zlecenia, więc filler symuluje ze znacznikiem czasu, przy którym spodziewa się trafić do bloku, używając `blockOverrides` w [[eth-simulate|eth_simulateV1]] albo czwartego parametru `eth_call` w Geth. Każdy nowy head sprawia, że poprzednia runda symulacji jest nieaktualna, a porzucona symulacja i tak kosztuje węzeł pełne wykonanie; zobacz [[request-cancellation|anulowanie żądań]]."
        ]
      },
      {
        heading: "Rozliczenie na łańcuchu",
        paragraphs: [
          "Ścieżka wysyłania drivera to jawna konfiguracja: dokładnie jedna z opcji, czyli adresy URL publicznego mempoolu, prywatny relay, taki jak MEV Blocker pod `https://rpc.mevblocker.io`, albo builderzy, którzy dostają rozliczenie jako bundle [[mev-bundle|eth_sendBundle]] na każdy blok aż do terminu. W czasie oczekiwania driver stale powtarza symulację i anuluje transakcję, gdy tylko ta zakończyłaby się revertem. Fillerzy UniswapX odpytują `https://api.uniswap.org/v2/orders?orderStatus=open&chainId=1` z limitem czterech żądań na sekundę, a odpowiedź zawiera najwyżej 50 ostatnich zleceń; realizują zlecenia przez `execute` albo `executeWithCallback` reactora i według zaleceń mają je wysyłać przez [[private-rpc|prywatny relay]], bo realizacje konkurują w aukcji gasu.",
          "Awarie RPC mają swoją cenę. Head nieaktualny o jeden blok daje rozliczenie, które przechodzi symulację, a potem kończy się revertem na rezerwach, które już się zmieniły; timeout providera dłuższy niż `deadline` oznacza, że poprawne rozwiązanie nigdy nie dotrze; HTTP 429 w chwili, gdy przychodzi blok z gwałtownymi zmianami cen, uderza naraz we wszystkich solverów korzystających z tego samego planu; endpoint, który po cichu pomija overrides, ocenia rozwiązanie na niewłaściwym stanie. [[dex-aggregator|Agregatory]] i [[liquidation-bot|boty likwidacyjne]] mają ten sam profil: nagłe serie symulacji na najnowszym stanie pod twardym terminem."
        ]
      }
    ],
    example: {
      title: "Jedna aukcja CoW Protocol z perspektywy drivera jednego solvera",
      note: "Termin `/solve` to czas zegarowy, a termin rozliczenia to numer bloku, więc solver planuje opóźnienia RPC względem pierwszego, a szanse włączenia do bloku względem drugiego."
    },
    pitfalls: [
      "Symulowanie zlecenia holenderskiego ze znacznikiem czasu najnowszego bloku, co wycenia realizację tak, jak wyglądała ona slot wcześniej, niż może trafić do bloku.",
      "Dopuszczenie, żeby timeout providera trwał dłużej niż `deadline` aukcji, przez co poprawne rozwiązanie nigdy nie dociera do autopilota.",
      "Wysyłanie rozliczenia przez publiczny mempool, gdzie konkurencyjny filler może przejąć zlecenie pierwszy, a przegrana transakcja i tak płaci za gas.",
      "Współdzielenie jednego endpointu z rate limitem między wyceny i rozliczenia, przez co fala wycen przy każdym nowym bloku odcina wysyłanie rozliczeń.",
      "Zakładanie, że każdy endpoint obsługuje state overrides i `eth_simulateV1`, choć niektóre usuwają ten parametr i odpowiadają na niezmienionym stanie."
    ]
  },
  "mev-share": {
    title: "MEV-Share",
    aliases: [
      "mev_sendBundle",
      "mev_simBundle",
      "orderflow auction",
      "aukcja przepływu transakcji",
      "MEV refund",
      "zwrot MEV",
      "MEV-Share Node",
      "MEV-Share hints",
      "hinty MEV-Share"
    ],
    summary: "MEV-Share to aukcja przepływu transakcji (orderflow auction) od Flashbots: użytkownicy wysyłają transakcje prywatnie do węzła MEV-Share (MEV-Share Node), który przez [[server-sent-events|server-sent events]] przesyła [[searcher|searcherom]] częściowe wskazówki (hinty) o tych transakcjach, przyjmuje bundle z backrunem odwołujące się do ukrytej transakcji po hashu i przekazuje je builderom pod warunkiem, że większość wartości wróci do użytkownika.",
    sections: [
      {
        heading: "Od prywatnej transakcji do hinta",
        paragraphs: [
          "Duży swap odsuwa cenę w puli od cen na innych rynkach, więc ten, kto handluje tuż po nim, czyli robi backrun, może z zyskiem zamknąć tę różnicę. W publicznym [[mempool|mempoolu]] ten zysk trafia do najszybszego [[searcher|searchera]], który może też zagrać przed użytkownikiem. Aukcja przepływu transakcji zamiast tego sprzedaje tę okazję: transakcja pozostaje prywatna, searcherzy licytują prawo do zrobienia na niej backrunu, a większość tego, co płaci zwycięzca, wraca do użytkownika jako zwrot (refund). Po stronie użytkownika jest [[private-rpc|prywatne RPC]], czyli Flashbots Protect pod `https://rpc.flashbots.net`, albo bezpośrednie wywołanie `eth_sendPrivateTransaction`.",
          "Domyślnie Protect przekazuje transakcję tylko do buildera Flashbots, jednej ze stron składających bloki, ponawia próby przez 25 bloków, udostępnia hinty `hash` i `default_logs` i wysyła 90 procent każdego zwrotu do `tx.origin`, czyli nadawcy transakcji, a resztę do walidatora. Parametry URL to zmieniają: sam `?hint=hash` daje pełną prywatność, dodanie hintów takich jak `calldata` czy `logs` daje searcherom więcej podstaw do licytacji, `builder=` dodaje builderów, a `refund=address:percent` kieruje płatność gdzie indziej. Ścieżka `/fast` udostępnia transakcję wszystkim builderom z rejestru Flashbots, których w październiku 2026 było 19, daje walidatorowi większy udział i pokazuje całą niepodpisaną transakcję searcherom działającym wewnątrz zaufanych środowisk wykonawczych (TEE).",
          "Searcherzy czytają hinty zwykłym żądaniem GET pod `https://mev-share.flashbots.net`; to strumień server-sent events, który po 15 sekundach ciszy wysyła komentarz `:ping`. Każdy event ma `hash`, który jest hashem [[keccak-256|keccak-256]] z hasha transakcji albo bundla, a nie samym tym hashem, opcjonalne `logs` oraz wpisy `txs` z polami, które udostępnił nadawca, takimi jak `to`, `functionSelector` i `callData`; brak pola oznacza, że nadawca go nie ujawnił. `default_logs` ujawnia tylko pulę i sam fakt swapu, dla pul Curve, Balancer i pul w stylu Uniswap. Strumień nie ma powtórki (replay), ale `GET /api/v1/history` z `blockStart` i `blockEnd` zwraca dawne hinty do uzupełnienia luk (backfill)."
        ]
      },
      {
        heading: "Backrun przez mev_sendBundle",
        paragraphs: [
          "Searcher odpowiada przez `mev_sendBundle`, wysyłane do `relay.flashbots.net` i podpisane nagłówkiem `X-Flashbots-Signature` jak każdy [[mev-bundle|bundle Flashbots]]. Jego `version` to `v0.1`; `inclusion.block` i opcjonalny `maxBlock` wyznaczają zakres bloków włącznie z obiema granicami; `body` wymienia `{hash}` dla transakcji użytkownika, znanej tylko z hasha z hinta, a potem `{tx, canRevert}` dla własnej podpisanej transakcji searchera; `validity` zawiera opcjonalne warunki zwrotu; `privacy` ustawia hinty i builderów, ale przewodnik Flashbots po bundlach mówi, że bundle zawierający wpis `{hash}` nie może używać `privacy`, więc backrun nie może ujawnić transakcji użytkownika dalej. MEV-Share przyjmuje tylko backruny, a od 20 października 2025 bundle może zawierać najwyżej jedną transakcję backrunu.",
          "Węzeł podmienia hash na oryginalną transakcję i przekazuje bundle builderom z warunkiem zwrotu. Tak jak wymaga specyfikacja bundli, builder symuluje bundle bez transakcji użytkownika, żeby oddzielić płatność searchera od płatności użytkownika, i przekazuje udział searchera na adresy zwrotu. Searcher nie zasymuluje tego, czego nie widzi: `mev_simBundle` odrzuca bundle, który wciąż zawiera wpis `{hash}`, więc strategie wnioskują z hintów, wysyłają kilka kandydackich bundli albo sprawdzają opłacalność on-chain i pozwalają złemu bundlowi przepaść."
        ]
      },
      {
        heading: "Czym różni się od sąsiednich kanałów",
        paragraphs: [
          "Zwykłe `eth_sendBundle` wymaga, żeby każda transakcja była podpisana i w ręku searchera, więc backrun oznacza tam skopiowanie transakcji ofiary z publicznego mempoolu, a bundle celuje w jeden blok i nie ma warunków zwrotu poza rozszerzeniami konkretnych builderów; `mev_sendBundle` odwołuje się do transakcji, której searcher nigdy nie widział, i niesie zwrot. Prywatne RPC bez aukcji ukrywa transakcję równie dobrze, ale nic na niej nie sprzedaje, więc nic nie wraca. MEV Blocker różni się zakresem ujawnienia: jego searcherzy subskrybują `mevblocker_partialPendingTransactions` pod `wss://searchers.mevblocker.io` i dostają całą transakcję bez `v`, `r` i `s`, podczas gdy MEV-Share pokazuje zwykłym searcherom tylko to, na co pozwalają hinty użytkownika.",
          "Nic z tego nie jest standardowym [[json-rpc|JSON-RPC]] węzła: strumień, format bundla i zasady zwrotów to konwencje Flashbots, z limitami na adres IP wynoszącymi 1800 żądań `mev_sendBundle` i 300 żądań `mev_simBundle` na minutę. Na Ethereum feedy SVR od Chainlink dla Aave dostarczają raporty cenowe prywatnie przez MEV-Share, więc [[liquidation-bot|boty likwidacyjne]] robią backrun tych aktualizacji oracle tutaj, a nie w publicznym mempoolu: przewodnik Chainlink dla searcherów każe wypatrywać selektora `forward` `0x6fadcf72` w `txs` hinta i wysyłać body z dokładnie dwoma wpisami: najpierw hashem aktualizacji, a po nim backrunem."
        ]
      }
    ],
    example: {
      title: "Hint i bundle, który robi na nim backrun",
      note: "Hint wskazuje pulę Uniswap v3 i topic eventu `Swap`, nic więcej; body kopiuje `hash` z hinta w otrzymanej postaci, `validity` zostaje puste, bo zwrot dla użytkownika uzupełnia węzeł, a jedno wysłanie obejmuje bloki od `0x18cc839` do `0x18cc83b`."
    },
    pitfalls: [
      "Porównywanie `hash` z hinta bezpośrednio z hashami transakcji on-chain, choć jest to ich keccak-256 i zgadza się dopiero po ponownym zahashowaniu.",
      "Oczekiwanie, że `mev_simBundle` wyceni backrun, zanim trafi on do bloku, choć odrzuca każdy bundle, który wciąż zawiera wpis `{hash}`.",
      "Umieszczanie dwóch transakcji backrunu w jednym bundlu, czego MEV-Share nie przyjmuje od 20 października 2025.",
      "Zakładanie, że ponownie połączony strumień hintów niczego nie przegapił, choć nie ma on powtórki (replay), a luki trzeba uzupełnić z `/api/v1/history`.",
      "Zakładanie, że przy domyślnych ustawieniach Protect transakcja dociera do każdego buildera, choć Protect przekazuje ją tylko builderowi Flashbots, chyba że URL dodaje builderów albo włącza tryb fast."
    ]
  },
  "enshrined-pbs": {
    title: "Enshrined proposer-builder separation (ePBS)",
    aliases: [
      "ePBS",
      "EIP-7732",
      "Gloas",
      "enshrined PBS",
      "rozdzielenie proposera i buildera",
      "payload timeliness committee",
      "PTC",
      "komitet terminowości payloadu",
      "execution payload bid",
      "oferta buildera",
      "execution payload envelope",
      "builder withholding",
      "wstrzymanie payloadu"
    ],
    summary: "Enshrined proposer-builder separation (ePBS, rozdzielenie proposera i buildera wbudowane w protokół), czyli EIP-7732 w forku konsensusu Gloas, części Glamsterdam, przenosi do samego protokołu przekazywanie budowania bloków zewnętrznym builderom: [[beacon-block|blok beacon]] zawiera tylko podpisaną ofertę (bid) buildera, builder ujawnia [[execution-payload|execution payload]] później w tym samym slocie, a komitet walidatorów głosuje, czy payload dotarł na czas.",
    sections: [
      {
        heading: "Oferta w bloku, payload po nim",
        paragraphs: [
          "Każdy 12-sekundowy [[slot-epoch|slot]] ma proposera, czyli [[validator|walidatora]] wybranego do dodania bloku, a ten może sprzedać zadanie wypełnienia bloku wyspecjalizowanemu builderowi. Dziś ta sprzedaż odbywa się przez [[mev-boost|MEV-Boost]] i [[relay|relay]]: proposer podpisuje nagłówek bloku, nie widząc transakcji, i ufa, że relay opublikuje pełny blok i że wcześniej sprawdził, czy builder zapłaci. EIP-7732 zamienia oba te zadania w reguły protokołu. Builderzy tworzą własny rejestr ze stakiem, oddzielny od walidatorów, z depozytami od 1 ETH wpłacanymi przez kontrakt w warstwie wykonawczej (EIP-8282). Oferta jest prawidłowa tylko wtedy, gdy pokrywa ją saldo buildera w Beacon Chain, dzięki czemu protokół może zapłacić proposerowi z tego salda.",
          "Builder podpisuje `ExecutionPayloadBid`, w którym podaje `parent_block_hash`, na którym buduje, `block_hash`, który dostarczy, `fee_recipient` proposera oraz `value`, czyli kwotę w gwei, którą zapłaci, i rozgłasza go w topiku `execution_payload_bid`. Proposer umieszcza zwycięską ofertę w swoim bloku jako `signed_execution_payload_bid`, w miejscu dawnego pola `execution_payload`; proposer, który buduje dla siebie, używa `BUILDER_INDEX_SELF_BUILD` i wartości 0. Builder ujawnia payload dopiero wtedy, gdy blok już wiążąco zawiera jego ofertę, więc proposer nigdy nie widzi transakcji, zanim podpisze swój wybór. Payload przychodzi w podpisanym opakowaniu (envelope, `SignedExecutionPayloadEnvelope`) w topiku `execution_payload`, a jego termin to połowa slotu. Węzły sprawdzają go względem `block_hash` z oferty i przekazują payload swojemu [[execution-client|klientowi wykonawczemu]] przez `engine_newPayload`."
        ]
      },
      {
        heading: "Komitet PTC i wstrzymanie payloadu",
        paragraphs: [
          "Rozdzielenie bloku i payloadu stawia w każdym slocie nowe pytanie: czy payload dotarł na czas? Odpowiada na nie payload timeliness committee (PTC, komitet terminowości payloadu) złożony z 512 walidatorów wybranych z komitetów [[attestation|atestacyjnych]] danego slotu. Po 75% slotu, czyli dziewięć sekund od jego początku, każdy członek rozgłasza `PayloadAttestationMessage` z dwiema wartościami logicznymi, `payload_present` i `blob_data_available`, a ponad 256 zgodnych głosów rozstrzyga, co [[fork-choice|fork choice]] uznaje za terminowe i dostępne. Fork choice widzi teraz każdy blok beacon jako dwie możliwe gałęzie, pełną (full) z payloadem i pustą (empty) bez niego, a następny blok wybiera jedną z nich przez hash rodzica podany w swojej ofercie.",
          "Jeśli builder wstrzyma payload, slot kończy się pusty: blok beacon zostaje w łańcuchu, ale dla tego slotu nie istnieje żaden blok wykonawczy. Przetworzenie bloku beacon zapisuje `value` z oferty jako oczekującą płatność (pending payment), która staje się [[withdrawals|wypłatą (withdrawal)]] na `fee_recipient`, gdy późniejszy blok zbuduje na dostarczonym payloadzie. Bez payloadu płatność i tak następuje na końcu następnej epoki, jeśli blok beacon zebrał atestacje z tego samego slotu warte co najmniej 60% stake przypadającego na jeden slot, czyli jeśli dotarł na czas i był szeroko widziany. EIP-7732 nazywa pozostałe ryzyko problemem darmowej opcji (free option problem): racjonalny builder może wstrzymać payload zawsze, gdy opłaca mu się to bardziej niż ujawnienie, i zostawić slot bez transakcji."
        ]
      },
      {
        heading: "Co widzą wywołujący RPC",
        paragraphs: [
          "EIP-7732 zmienia [[engine-api|Engine API]] tylko po to, żeby obsłużyć nowe typy [[execution-requests|żądań warstwy wykonawczej]]. Payload dociera jednak teraz do klienta wykonawczego nawet pół slotu, czyli sześć sekund, później niż blok beacon, więc `latest` i [[eth-block-number|eth_blockNumber]] zostają o tyle w tyle za head beacon. Pusty slot wygląda jak pominięty: nie zużywa żadnego numeru bloku. A payload już zaimportowany jako head zostaje odrzucony, jeśli następny proposer zbuduje na pustej gałęzi: to [[reorg|reorg]] łańcucha wykonawczego o jeden blok pod blokiem beacon, który pozostaje kanoniczny.",
          "`safe` i `finalized` są o jeden blok dalej w tyle, bo blok beacon przesądza tylko o payloadzie, na którym buduje jego oferta; o tym, czy liczy się jego własny payload, decyduje następny blok. Fork choice w Gloas wysyła więc jako `finalizedBlockHash` wartość `parent_block_hash` z oferty sfinalizowanego bloku beacon, a [[fast-confirmation-rule|Fast Confirmation Rule]] uznaje za safe tylko payload rodzica potwierdzonego bloku beacon. [[light-client-update|Nagłówki lekkiego klienta]] zawierają tylko `execution_block_hash`, czyli rodzica wskazanego w ofercie, więc [[light-client|lekki klient]] musi pobrać nagłówek wykonawczy o tym hashu, żeby poznać `stateRoot`. W [[beacon-api|Beacon API]] event `head_v2` podaje `payload_status` o wartości `empty` albo `full`, a `/eth/v1/beacon/execution_payload_envelopes/{block_id}` zwraca envelope.",
          "Gloas aktywowano w sieci testowej Sepolia 6 października 2026 roku, w epoce 353024; dla mainnetu nie ma jeszcze daty, a EIP-7732 jest w statusie Last Call do 1 listopada 2026 roku. Umowy poza protokołem nadal są możliwe: [[builder-api|Builder API]] dostaje endpointy dla Gloas, takie jak `getExecutionPayloadBid`, a oferta może podawać niezerowe `execution_payment`, płacone poza protokołem na zaufanie, choć takie oferty nie trafiają do publicznego gossipu."
        ]
      }
    ],
    example: {
      title: "Jeden slot w Gloas: payload dostarczony i wstrzymany",
      note: "Blok beacon jest kanoniczny w obu gałęziach; różni się tylko łańcuch wykonawczy, o jeden blok, a w drugiej gałęzi proposer dostaje zapłatę za payload, którego nikt nie widział."
    },
    pitfalls: [
      "Przypisywanie slotów do bloków wykonawczych przez liczenie bloków beacon, podczas gdy pusty slot ma blok beacon, ale nie ma payloadu.",
      "Uznawanie najnowszego bloku `latest` za przesądzony, bo jego blok beacon jest kanoniczny, podczas gdy następny proposer nadal może zbudować na pustej gałęzi.",
      "Zakładanie, że każda oferta umieszczona w bloku płaci proposerowi; spóźniony blok, który nie osiągnie progu 60% atestacji, może skończyć się bez payloadu i bez zapłaty."
    ]
  },
  "fast-confirmation-rule": {
    title: "Fast Confirmation Rule",
    aliases: [
      "FCR",
      "fast confirmation",
      "szybkie potwierdzanie bloków",
      "safe block",
      "blok safe",
      "safe head",
      "confirmed block",
      "potwierdzony blok",
      "CONFIRMATION_BYZANTINE_THRESHOLD",
      "fast_confirmation event",
      "event fast_confirmation"
    ],
    summary: "Fast Confirmation Rule (FCR) to algorytm ze specyfikacji konsensusu (consensus-specs), który [[consensus-client|klient konsensusu]] uruchamia w każdym slocie, żeby w ciągu jednego lub dwóch slotów potwierdzić blok z gwarancją, że pozostanie on kanoniczny, dopóki głosy docierają na czas, a wrogo nastawiona jest co najwyżej jedna czwarta stake. Według specyfikacji jego wynik trafia do [[execution-client|klienta wykonawczego]] jako blok `safe`.",
    sections: [
      {
        heading: "Co obiecuje i przy jakich założeniach",
        paragraphs: [
          "W każdym 12-sekundowym [[slot-epoch|slocie]] może przybyć blok. [[fork-choice|Fork choice]] wybiera head na podstawie najnowszych głosów walidatorów, ale head wciąż może zostać zastąpiony, a [[finality|finalność]] czyni blok nieodwracalnym dopiero mniej więcej dwie epoki (64 sloty) później, po 13 minutach lub dłużej. W międzyczasie blok jest prawdopodobnie bezpieczny, ale nic nie mówi, jak bardzo. FCR, dodana do consensus-specs w kwietniu 2026 roku, to mierzy. Dla każdego bloku od ostatniego potwierdzonego zadaje pytanie: czy tak duża część stake, który od tego bloku miał głosować, poparła ten blok albo jego potomków, że żadna inna gałąź nie mogłaby go wyprzedzić, nawet gdyby jedna czwarta wszystkich walidatorów zwróciła się przeciwko niemu? Zwykle odpowiedź brzmi „tak” po jednym lub dwóch slotach, czyli po 12 do 24 sekundach.",
          "Gwarancja opiera się na dwóch założeniach. Pierwsze to synchroniczność (synchrony): atestacje uczciwych walidatorów docierają do każdego uczciwego węzła przed końcem slotu, w którym je oddano. Drugie to `CONFIRMATION_BYZANTINE_THRESHOLD` równe 25, czyli założenie, że co najwyżej 25% walidatorów to walidatorzy bizantyjscy, którzy mogą głosować dowolnie. Jak ostrzega specyfikacja, gdy synchroniczność zawodzi, potwierdzone bloki mogą wypaść w [[reorg|reorgu]] bez żadnego ataku i bez niczyjego [[slashing|slashingu]]. Finalność obiecuje więcej: cofnięcie sfinalizowanego bloku wymaga slashingu co najmniej jednej trzeciej całego stake, niezależnie od tego, co działo się w sieci."
        ]
      },
      {
        heading: "Jak blok zostaje potwierdzony",
        paragraphs: [
          "Sprawdzenie polega na ważeniu. Każdy walidator [[attestation|atestuje]] raz na epokę, więc w każdym slocie głosuje jedna z 32 części stake, podzielona na maksymalnie 64 komitety; tak jak w specyfikacji, waga jednego komitetu oznacza tu łączną wagę wszystkich komitetów danego slotu. Na jednej szali jest waga stojąca za blokiem i jego potomkami. Na drugiej wszystko, co mogłaby zebrać konkurencyjna gałąź: głosy, które poszły gdzie indziej albo nie zostały oddane, proposer boost równy 40% wagi jednego komitetu, który fork choice daje nowemu blokowi opublikowanemu na czas, oraz 25% przeciwnika, liczone podwójnie, bo te głosy mogą odejść z jednej strony i dołączyć do drugiej. Blok potrzebuje więc więcej niż (maksimum + boost + 2 × przeciwnik) / 2, gdzie maksimum to cała waga, jaką mogły oddać komitety od rodzica bloku.",
          "Dla bloku z głosami z jednego slotu daje to (100% + 40% + 50%) / 2, czyli ponad 95% komitetu jego slotu. Przy głosach z dwóch slotów to (200% + 40% + 100%) / 2, czyli 170% jednego komitetu, albo 85% możliwych głosów. Blok, za którym stoi 97% jego komitetu, zostaje więc potwierdzony na początku następnego slotu; przy 93% czeka jeszcze jeden slot. Ten warunek musi spełnić też każdy przodek aż do ostatniego potwierdzonego bloku, a w przypadku bloku z bieżącej epoki checkpoint tej epoki, czyli jej blok graniczny, musi zmierzać do uzyskania statusu justified, pierwszego z dwóch kroków do finalności.",
          "Klient uruchamia regułę na początku każdego slotu, po uwzględnieniu głosów z poprzedniego slotu, a przed terminem atestacji bieżącego slotu, i wysyła hash wykonawczy potwierdzonego bloku jako `safeBlockHash` w `engine_forkchoiceUpdated` przez [[engine-api|Engine API]]. Jeśli potwierdzony blok pochodzi sprzed poprzedniej epoki, wypada z łańcucha kanonicznego albo nie przechodzi ponownego sprawdzenia na granicy każdej epoki, reguła wraca (fallback) do sfinalizowanego bloku, a później zaczyna od nowa od checkpointu justified. Restart klienta działa tak samo, chyba że klient implementuje opcjonalny krok przywracania (restore) ze specyfikacji, jak robi to Lighthouse."
        ]
      },
      {
        heading: "Co zmienia w tagu safe",
        paragraphs: [
          "Przed FCR `safe` był blokiem z najnowszego checkpointu justified, zwykle o jedną do dwóch epok, czyli 6 do 13 minut, za head. Klient stosujący regułę wysyła blok o jeden lub dwa bloki za `latest`, więc wynik `eth_getBlockByNumber` z `safe` przesuwa się o kilka minut bliżej head. Może się też cofnąć: gdy reguła wraca do sfinalizowanego bloku, `safe` spada właśnie do niego, o kilkadziesiąt bloków niżej. Przy [[enshrined-pbs|ePBS]] hash safe to payload rodzica potwierdzonego bloku beacon, czyli jeszcze jeden blok dalej w tyle.",
          "Klienci się różnią, a żaden endpoint nie mówi, która reguła wyznaczyła jego `safe`. [[nimbus|Nimbus]] stosuje regułę domyślnie. [[lighthouse|Lighthouse]] (v8.3.0) i [[prysm|Prysm]] (v7.2.0) mają ją za flagą `--enable-fast-confirmation`, a [[lodestar|Lodestar]] za `--chain.fastConfirmation`, wszędzie domyślnie wyłączoną; [[teku|Teku]] chowa ją za eksperymentalną flagą `--Xfast-confirmation-enabled`, a w [[grandine|Grandine]] to na razie otwarty pull request. Wydania [[nethermind|Nethermind]] sprzed 1.38.0 odrzucały hashe safe bliskie head z błędem `-38002`, przez co Nimbus na krótko przestał wysyłać swój wynik jako hash safe. Klienci, którzy stosują regułę, emitują też event `fast_confirmation` na `/eth/v1/events`. [[exchange-deposits|Giełda księgująca depozyty]] albo [[cross-chain-relayer|relayer bridge'a]], który czeka na `safe`, czeka więc 12 sekund na jednym endpoincie i 12 minut na innym."
        ]
      }
    ],
    example: {
      title: "Slot po slocie na węźle Lighthouse uruchomionym z włączoną FCR",
      note: "Event `fast_confirmation` podaje root bloku beacon i slot; klient wykonawczy widzi zawsze tylko wynikowy `safeBlockHash`, a nic w jego odpowiedzi JSON-RPC nie mówi, która reguła go wybrała."
    },
    pitfalls: [
      "Traktowanie bloku `safe` z FCR jako ostatecznego, podczas gdy trzyma się on tylko tak długo, jak obowiązują założenia synchroniczności i 25%, a jego cofnięcie nie kończy się niczyim slashingiem.",
      "Zakładanie, że `safe` przesuwa się tylko do przodu, podczas gdy fallback cofa go do sfinalizowanego bloku w jednej aktualizacji.",
      "Alertowanie o opóźnieniu `safe` tuż po restarcie klienta konsensusu, podczas gdy reguła zgodnie z założeniami raportuje sfinalizowany blok, dopóki nie może znów ruszyć do przodu."
    ]
  }
};
