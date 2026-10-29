// Polish text for the Layer 2 & scaling lessons, keyed by topic id. Only the words: ids, link
// targets, code, related topics, and sources come from data/scaling.js.
export const topics = {
  rollup: {
    title: "Rollup",
    aliases: ["l2", "layer 2", "warstwa 2", "rollups", "rollupy", "optimism", "base", "arbitrum", "zksync", "scroll"],
    summary: "Rollup to łańcuch, który wykonuje transakcje na własnych węzłach, ale publikuje dane transakcji i commitment stanu w [[smart-contract|smart kontraktach]] na Ethereum. Dzięki temu o jego stanie ostatecznie decyduje L1, a nie osobny zbiór walidatorów.",
    sections: [
      {
        heading: "Co sprawia, że łańcuch jest rollupem",
        paragraphs: [
          "Rollup prowadzi własny łańcuch zgodny z [[evm|EVM]], z własnymi [[block|blokami]], [[chain-id|chain ID]], [[mempool|mempoolem]] i [[execution-client|klientem wykonawczym]], który obsługuje zwykłe [[json-rpc|JSON-RPC]]. Od niezależnego łańcucha odróżnia go to, że nie ma własnego zbioru walidatorów, który rozstrzyga, co jest prawdą. Każdą wykonaną transakcję publikuje na Ethereum jako [[data-availability|dostępne dane]], a commitmenty do wynikowego stanu publikuje w zestawie kontraktów na L1. Każdy może odczytać L1, ponownie wykonać zapisane tam transakcje i dojść do tego samego stanu, o nic nie prosząc operatorów rollupu.",
          "Kontrakty na L1 nie przyjmą dowolnego commitmentu stanu. W jednej rodzinie rollupów błędny commitment można obalić [[fraud-proof|fraud proofem]] w trakcie challenge window (okna na zakwestionowanie); w drugiej [[validity-proof|validity proof]] jest sprawdzany, zanim commitment w ogóle zacznie się liczyć. Tak czy inaczej kanoniczny stan rollupu jest funkcją danych, które leżą na Ethereum, i właśnie dla tej własności zarezerwowane jest słowo „rollup”. Łańcuch, który trzyma dane u zewnętrznego komitetu, jest [[validium|validium]] albo łańcuchem alt-DA, a jego użytkownicy ufają, że ten komitet pozostanie uczciwy i dostępny."
        ]
      },
      {
        heading: "Skąd biorą się oszczędności",
        paragraphs: [
          "Wykonanie jest tanie, bo uruchamiają je tylko własne węzły rollupu i bo [[gas|gas]] na L1 płaci się raz za batch tysięcy transakcji, a nie osobno za każdą transakcję. Odkąd w marcu 2024 roku wraz z Dencun pojawiły się [[blob|bloby]], batche trafiają do przestrzeni blobów (blob space) zamiast do calldata. Tę przestrzeń wycenia osobny rynek, a węzły usuwają jej zawartość po około 18 dniach. Ta jedna zmiana obniżyła opłaty na L2 mniej więcej o rząd wielkości.",
          "Koszt danych na L1 nadal jest dominującym składnikiem opłaty na L2, dlatego rollupy obciążają nim użytkowników jako osobną opłatą za dane, doliczaną do zwykłego gasu za wykonanie. To najważniejszy powód, dla którego estymacja opłaty na L2 nie działa tak jak na L1; zobacz [[l2-rpc|różnice w RPC na L2]]."
        ]
      },
      {
        heading: "Z czego składa się rollup",
        paragraphs: [
          "W każdym rollupie występują cztery role. [[sequencer|Sekwencer]] ustala kolejność przychodzących transakcji i w ciągu sekundy lub dwóch produkuje bloki L2; właśnie to użytkownicy odbierają jako zatwierdzenie transakcji. Batcher kompresuje te bloki i publikuje je na L1. Proposer zgłasza commitmenty stanu. Prover albo [[op-challenger|challenger]] podpiera te commitmenty dowodem. Kontrakty kanonicznego [[bridge|bridge'a]] przenoszą ETH i tokeny w obie strony i to z ich powodu wypłata trwa dłużej niż depozyt.",
          "W łańcuchu na OP Stack węzeł składa się z dwóch procesów, podobnie jak na L1: `op-node` wyprowadza łańcuch L2 z danych L1 i pełni rolę warstwy konsensusu, sterując klientem wykonawczym (`op-geth`, `op-reth` albo [[nethermind|Nethermind]]) przez to samo [[engine-api|Engine API]], którego na mainnecie używa [[consensus-client|klient konsensusu]]. Arbitrum Nitro łączy odpowiadające temu role w jednym procesie Nitro, zbudowanym wokół zmodyfikowanego rdzenia go-ethereum."
        ]
      },
      {
        heading: "Dlaczego nadal używa metod eth_",
        paragraphs: [
          "Rollupy celowo udostępniają ten sam zestaw metod co L1, więc [[client-libraries|biblioteki klienckie]], portfele i [[indexer|indeksery]] działają bez zmian: [[eth-call|eth_call]], [[eth-get-logs|eth_getLogs]] i [[eth-send-raw-transaction|eth_sendRawTransaction]] zachowują się zgodnie z oczekiwaniami. Zmienia się natomiast semantyka pod spodem. Bloki pojawiają się co sekundę czy dwie, a nie co 12 sekund, [[block-tag|tagi bloków]] `safe` i `finalized` są wyprowadzane z L1, a nie z lokalnej [[finality|finalności]], estymacja opłat ma dodatkowy składnik z L1, a receipty mają dodatkowe pola. Większość błędów integracji zaczyna się od traktowania endpointu L2 jak „Ethereum, tylko szybszego”."
        ]
      }
    ],
    example: {
      title: "To samo wywołanie na L1 i na L2",
      note: "Zawsze sprawdzaj chain ID, zanim cokolwiek wyślesz; po zestawie metod nie widać, z którym łańcuchem nawiązano połączenie."
    },
    pitfalls: [
      "Zakładanie, że numer bloku L2 ma związek z numerem bloku L1; to niezależne liczniki, a w Arbitrum `block.number` w EVM zwraca przybliżony numer bloku L1, podczas gdy [[eth-block-number|eth_blockNumber]] zwraca numer bloku L2.",
      "Traktowanie zatwierdzenia przez sekwencer jako ostatecznego rozliczenia (settlement); dopóki batch nie trafi na L1, a commitment nie zostanie przyjęty, jedyną stroną, która twierdzi, że ten blok istnieje, jest sekwencer.",
      "Używanie estymacji gasu z L1 na L2; opłata za dane, tabela kosztów gasu (gas schedule) i parametry opłat są inne."
    ]
  },
  "optimistic-rollup": {
    title: "Optimistic rollupy",
    aliases: ["optimistic rollup", "rollupy optymistyczne", "optimism", "op stack", "base", "arbitrum", "nitro", "challenge window", "bedrock"],
    summary: "Optimistic rollup publikuje commitmenty stanu na L1, nie dowodząc ich z góry, i pozwala każdemu obalić błędny commitment [[fraud-proof|fraud proofem]] w trakcie challenge window (okna na zakwestionowanie, zwykle siedmiodniowego), zanim commitment będzie można wykorzystać do uwolnienia środków.",
    sections: [
      {
        heading: "Optymistyczne założenie",
        paragraphs: [
          "Łańcuch publikuje dane transakcji na L1, a proposer publikuje output root, czyli commitment do stanu L2 po danym bloku. Kontrakty na L1 przyjmują ten root warunkowo. Jeśli jest błędny, każdy, kto odtworzył łańcuch z opublikowanych danych, może otworzyć spór i na końcu interaktywnej gry udowodnić na L1, że proposer skłamał. W happy path, gdy nikt niczego nie kwestionuje, niczego się nie dowodzi, i dlatego ta rodzina rollupów jest tania.",
          "Założenie bezpieczeństwa to jeden uczciwy challenger, który ma środki i oprogramowanie gotowe do działania w trakcie okna. To ono uzasadnia siedem dni: krótsze okno zostawia mniej czasu na reakcję na cenzurę na L1, a dłuższe jeszcze bardziej spowalnia [[bridge|wypłaty]]. Nic z tego nie wpływa na odczyty, bo własne węzły łańcucha wykonują transakcje normalnie i odpowiadają na [[json-rpc|JSON-RPC]] z prawdziwego stanu."
        ]
      },
      {
        heading: "Dwa główne stacki",
        paragraphs: [
          "OP Stack napędza Optimism, Base i wiele innych łańcuchów ze wspólnej bazy kodu. Węzeł dzieli się tu tak jak na L1: `op-node` uruchamia [[derivation-pipeline|derivation pipeline]], który odtwarza łańcuch L2 z batchy i depozytów na L1, i steruje [[execution-client|klientem wykonawczym]] (`op-geth`, `op-reth` albo [[nethermind|Nethermind]]) przez [[engine-api|Engine API]]. Bloki powstają co 2 sekundy, niezależnie od tego, czy są transakcje. System fault proof sprowadza sporne twierdzenie przez bisekcję do jednej instrukcji i wykonuje ten krok na L1 w działającym on-chain interpreterze MIPS o nazwie Cannon.",
          "Arbitrum One i Nova działają na Nitro, pojedynczym procesie zbudowanym wokół zmodyfikowanego rdzenia go-ethereum. Ta sama funkcja przejścia stanu jest kompilowana do WASM, żeby dało się ją wykonać ponownie w ramach dispute game, a BoLD (Bounded Liquidity Delay) sprawia, że walidacja jest otwarta dla każdego (permissionless) i ma ograniczony czas rozliczenia, zamiast opierać się na zamkniętej liście walidatorów. Bloki Nitro powstają na żądanie, nawet co 250 milisekund."
        ]
      },
      {
        heading: "Co to oznacza przy wywołaniach RPC",
        paragraphs: [
          "Oba stacki przyjmują standardowy zestaw metod i w obu zmienia się znaczenie [[block-tag|tagów bloków]]. `latest` na endpoincie sekwencera to [[preconfirmation|unsafe head]]: blok, który [[sequencer|sekwencer]] wyprodukował i rozgłosił, ale którego nie obejmuje jeszcze żaden batch na L1. `safe` to head wyprowadzony z danych batchy, które już są na L1, a `finalized` to head wyprowadzony z danych na L1, które samo L1 już sfinalizowało, więc jest opóźniony o czas [[finality|finalności]] L1 plus odstęp między publikacjami batchy. Blok unsafe może zostać zastąpiony bez żadnego [[reorg|reorgu]] na L1, jeśli łańcuch sekwencera i łańcuch wyprowadzony się nie zgadzają.",
          "Opłaty składają się z dwóch części. Gas za wykonanie [[evm|EVM]] nalicza jak zwykle i jest on prawie darmowy; koszt danych na L1 nalicza się osobno i zwykle stanowi większą część. OP Stack podaje go jako `l1Fee` w [[transaction-receipt|receipcie]]; Arbitrum wlicza go do liczby gasu jako `gasUsedForL1`. Szczegóły: [[l2-rpc|różnice w RPC na L2]]."
        ]
      }
    ],
    pitfalls: [
      "Zakładanie, że challenge window opóźnia depozyty; depozyty z L1 docierają w ciągu minut, a na okno czekają tylko wypłaty.",
      "Odpytywanie optimistic rollupu o `finalized` w oczekiwaniu, że będzie się zmieniać co kilka sekund; przesuwa się skokowo, w rytmie finalności L1 i publikacji batchy.",
      "Porównywanie numerów bloków L2 między łańcuchami, żeby ocenić upływ czasu; 2-sekundowe bloki OP Stack i bloki Arbitrum krótsze niż sekunda odpowiadają zupełnie innym odstępom czasu."
    ]
  },
  "zk-rollup": {
    title: "ZK rollupy",
    aliases: ["zk rollup", "zksync", "scroll", "linea", "polygon zkevm", "starknet", "zkevm", "validity rollup"],
    summary: "ZK rollup publikuje każdy batch razem z [[validity-proof|validity proofem]], który kontrakt weryfikujący na L1 sprawdza przed przyjęciem nowego stanu. Błędne przejście stanu jest więc od razu odrzucane, a nie kwestionowane później.",
    sections: [
      {
        heading: "Jak batch staje się kanoniczny",
        paragraphs: [
          "[[sequencer|Sekwencer]] wykonuje transakcje i produkuje bloki L2 jak w każdym łańcuchu. Bloki są grupowane w batch, dane batcha są publikowane, żeby każdy mógł odtworzyć stan, a prover generuje zwięzły dowód (succinct proof), że wykonanie batcha na poprzednim [[state-root|state root]] daje nowy. Kontrakt na L1 weryfikuje dowód w jednej transakcji, której koszt prawie nie zależy od tego, ile pracy zawierał batch. Gdy ta transakcja trafi do bloku i obejmie ją [[finality|finalność]] L1, stan L2 jest równie ostateczny jak samo Ethereum.",
          "Dlatego ZK rollupy mają kilka widocznych etapów zamiast jednego: wykonanie przez sekwencer, commit razem z danymi na L1, dowód i finalizację. Eksploratory i rozszerzenia RPC pokazują je osobno, bo transakcja jest w praktyce nieodwracalna na długo przed tym, zanim jej ostateczność da się udowodnić. Tę różnicę wyznaczają czas generowania dowodu i częstotliwość wysyłania dowodów; wynosi ona od minut do godzin."
        ]
      },
      {
        heading: "Przegląd łańcuchów",
        paragraphs: [
          "zkSync Era, Scroll, Linea i Polygon zkEVM to zkEVM-y: mają wykonywać ten sam bytecode co Ethereum i udostępniać ten sam zestaw metod, a różnią się tym, jak dokładnie odwzorowują koszty [[gas|gasu]] na L1 i zachowanie opcode'ów. Starknet nie jest łańcuchem EVM: uruchamia kontrakty w Cairo i udostępnia własne [[json-rpc|JSON-RPC]] z metodami `starknet_` zamiast `eth_`, więc [[client-libraries|biblioteki Ethereum]] nie działają z nim bez dodatkowych narzędzi.",
          "Systemy dowodowe też się różnią, głównie kosztem i opóźnieniem: rodziny SNARK wymagają kontraktu weryfikującego ze stałym obwodem (circuit), systemy oparte na STARK-ach płacą większymi dowodami za brak trusted setupu, a większość łańcuchów agreguje wiele dowodów w jeden, zanim cokolwiek trafi na L1. Prawie wszystkie mają nadal kontrakt weryfikujący z możliwością aktualizacji (upgradeable), kontrolowany przez multisig albo security council, więc uczciwy opis modelu zaufania to „dowód plus governance”."
        ]
      },
      {
        heading: "Różnice w RPC",
        paragraphs: [
          "Metody `eth_` są te same, z dodatkami specyficznymi dla łańcucha. zkSync Era dodaje przestrzeń nazw `zks_`: `zks_L1BatchNumber` dla ostatniego udowodnionego batcha, `zks_getL1BatchDetails` dla jego transakcji commit i prove, `zks_estimateFee` dla jego modelu opłat. Jego [[transaction-receipt|receipty]] zawierają `l1BatchNumber` i `l1BatchTxIndex`, dzięki czemu można przypisać transakcję do batcha, którego dowód ją obejmie. Scroll i Linea mają własne, podobne metody wyszukiwania batchy.",
          "Najbardziej zaskakują [[block-tag|tagi bloków]]. W kilku łańcuchach ZK `finalized` wskazuje ostatni batch, którego dowód zweryfikowano na L1, więc może być za `latest` znacznie dalej niż o dwie epoki, których spodziewa się ktoś przyzwyczajony do L1; w innych łańcuchach tagi są tylko przybliżone. Przy wszystkim, czego nie wolno odwrócić, trzeba czekać na transakcję z dowodem batcha na L1, a nie na określoną liczbę bloków; zobacz [[l2-rpc|różnice w RPC na L2]]."
        ]
      }
    ],
    pitfalls: [
      "Odczytywanie `finalized` w łańcuchu ZK z założeniem opóźnienia takiego jak na L1; jest powiązane z wysyłaniem dowodów, które może być opóźnione o godzinę lub więcej.",
      "Zakładanie, że każdy ZK rollup wykonuje bytecode identycznie jak Ethereum; koszty gasu, niektóre opcode'y i natywna [[erc-4337|abstrakcja kont]] działają różnie w zależności od łańcucha, a Starknet to zupełnie inna maszyna wirtualna.",
      "Traktowanie validity proofa jako gwarancji [[data-availability|dostępności danych]]; dowód pokazuje, że przejście było poprawne, a nie że ktokolwiek może jeszcze zdobyć dane potrzebne do odtworzenia stanu."
    ]
  },
  "fraud-proof": {
    title: "Fraud proof",
    aliases: ["fraud proof", "fault proof", "dispute game", "cannon", "bold", "bisection", "bisekcja", "challenge", "dowód oszustwa"],
    summary: "Fraud proof to procedura on-chain, która obala nieprawidłowy commitment stanu z [[optimistic-rollup|optimistic rollupu]], zawężając spór do jednego kroku wykonania, który kontrakt na L1 może sam uruchomić i rozstrzygnąć.",
    sections: [
      {
        heading: "Dlaczego jest interaktywny",
        paragraphs: [
          "L1 nie może ponownie wykonać całego batcha L2, bo to przekreśliłoby sens rollupu. Zamiast tego [[op-challenger|challenger]] i obrońca rozgrywają grę bisekcyjną (bisection game). Każdy z nich twierdzi, że po danym zakresie wykonania stan jest inny. Raz po raz dzielą zakres na pół i podają wyniki pośrednie, aż spór dotyczy jednej instrukcji. Tylko ta instrukcja jest wykonywana na L1, na pamięci i rejestrach, co do których obie strony się zgadzają, a kontrakt porównuje wynik z tym, co twierdziła każda ze stron. Kaucja (bond) przegranego przepada.",
          "Wykonanie jednej instrukcji na L1 wymaga interpretera dla maszyny, do której skompilowano funkcję przejścia stanu L2. OP Stack kompiluje ją do MIPS i uruchamia sporny krok w on-chainowym interpreterze Cannon; Arbitrum kompiluje funkcję przejścia stanu Nitro do WASM i uruchamia ją w interpreterze WASM. Oba rozwiązania potrzebują też na żądanie spornych danych wejściowych, które dostarcza kontrakt preimage oracle, a ten może wypełnić każdy na podstawie opublikowanych danych."
        ]
      },
      {
        heading: "Kto może kwestionować",
        paragraphs: [
          "Cała konstrukcja opiera się na co najmniej jednej uczciwej stronie, która ma opublikowane [[data-availability|dane]], sama wyprowadziła łańcuch, zauważyła błędny commitment i ma kapitał na kaucję. Wczesne wdrożenia używały zamkniętej listy walidatorów (permissioned). Dispute game w OP Stack i BoLD w Arbitrum otwierają ten proces dla każdego (permissionless), przy czym BoLD dodaje ograniczony czas rozliczenia, żeby atakujący nie mógł w nieskończoność opóźniać rozstrzygnięcia, otwierając kolejne spory.",
          "Dla użytkowników konsekwencją jest challenge window (okno na zakwestionowanie): siedem dni w łańcuchach na OP Stack i podobnie w Arbitrum. Commitment stanu starszy niż to okno jest traktowany jako rozliczony i można go użyć do uwolnienia środków przez [[bridge|bridge]]; nowszego nie można. To jedyny powód, dla którego kanoniczna wypłata z L2 trwa tydzień, a depozyt kilka minut."
        ]
      },
      {
        heading: "Czego dowodzi, a czego nie",
        paragraphs: [
          "Udany fraud proof dowodzi, że konkretny zgłoszony [[state-root|state root]] nie wynika z uzgodnionych danych wejściowych. Nie mówi nic o tym, czy dana transakcja trafiła do łańcucha, czy [[sequencer|sekwencer]] ją ocenzurował ani czy dane w ogóle zostały opublikowane. Łańcucha, który zataja dane, nie da się zakwestionować, bo nikt nie może wyliczyć poprawnej odpowiedzi, z którą mógłby wejść w spór. Dostępność to osobna własność z własnym mechanizmem; zobacz [[data-availability|dostępność danych]].",
          "Nie jest to też coś, co aplikacja wywołuje przez [[json-rpc|JSON-RPC]]. Spory toczą się przez transakcje do kontraktów na L1, a obserwuje się je przez [[eth-get-logs|eth_getLogs]] na kontraktach dispute game. Zwykły klient RPC widzi tylko skutki w czasie: wypłatę, której nie da się jeszcze sfinalizować, i [[block-tag|tag bloku]], którego znaczenie wyznacza L1, a nie węzeł L2 odpowiadający na wywołanie."
        ]
      }
    ],
    pitfalls: [
      "Zakładanie, że fraud proof uratuje środki po zatajeniu danych; bez danych nikt nie zbuduje poprawnego twierdzenia, z którym mógłby wejść w spór.",
      "Przekonanie, że challenge window dotyczy pojedynczej transakcji; dotyczy commitmentu stanu, względem którego dowodzi się wypłaty.",
      "Szukanie metody RPC, która podaje status sporu; czyta się kontrakty dispute game na L1 i ich logi, a nie węzeł L2.",
      "Mylenie [[execution-trace|trace wykonania]] z `debug_` z fraud proofem; trace to relacja jednego węzła z wykonania, a nie coś, co L1 może rozstrzygnąć."
    ]
  },
  "validity-proof": {
    title: "Validity proof",
    aliases: [
      "validity proof",
      "dowód poprawności",
      "zk proof",
      "dowód zk",
      "snark",
      "stark",
      "zkevm proof",
      "prover",
      "verifier contract",
      "kontrakt weryfikujący"
    ],
    summary: "Validity proof to zwięzły dowód kryptograficzny, że batch transakcji L2 został wykonany poprawnie. Jest na tyle mały i tani, że weryfikujący [[smart-contract|smart kontrakt]] na L1 może go sprawdzić, zanim przyjmie wynikowy state root.",
    sections: [
      {
        heading: "Czego się dowodzi",
        paragraphs: [
          "Twierdzenie jest wąskie i precyzyjne: dla danego początkowego [[state-root|state root]], tej listy transakcji i tych publicznych danych wejściowych (public inputs) wykonanie funkcji przejścia stanu daje ten końcowy state root. Prover zamienia wykonanie w obwód arytmetyczny (circuit) albo trace, tworzy do niego commitment i generuje dowód. Kontrakt weryfikujący na L1 sprawdza dowód względem publicznych danych wejściowych w jednej transakcji, której koszt w [[gas|gasie]] jest prawie stały, niezależnie od tego, czy batch zawierał sto transakcji, czy sto tysięcy.",
          "Dowodzenie to praca asymetryczna. Wygenerowanie dowodu może zająć od minut do godzin na wyspecjalizowanym sprzęcie, dlatego [[zk-rollup|ZK rollupy]] agresywnie łączą transakcje w duże batche i często agregują wiele dowodów w jeden dowód rekurencyjny, zanim go wyślą. Weryfikacja to tania strona, a ta asymetria jest całym ekonomicznym uzasadnieniem tej konstrukcji."
        ]
      },
      {
        heading: "Systemy dowodowe w praktyce",
        paragraphs: [
          "Rodziny SNARK dają małe dowody o stałym rozmiarze i szybką weryfikację, za cenę setupu specyficznego dla obwodu; systemy oparte na STARK-ach obywają się bez trusted setupu i opierają się tylko na funkcjach hashujących, za cenę większych dowodów. Kilka łańcuchów dowodzi za pomocą STARK-ów, a wynik opakowuje w SNARK, żeby końcowa weryfikacja on-chain była tania. Kto tylko wywołuje RPC, nie widzi nic z tego: widzi tylko, ile trwa, zanim batch osiągnie etap udowodnienia, i ile łańcuch za to pobiera.",
          "Dowodzenie EVM jest trudne, bo EVM nie projektowano z myślą o dowodzeniu: arytmetyka 256-bitowa, [[keccak-256|Keccak-256]] na każdym kroku i Merkle-Patricia Trie stanu są w obwodach drogie. Łańcuchy rozwiązują to na różne sposoby i dlatego tabela kosztów [[gas|gasu]] w zkEVM, a czasem też zachowanie opcode'ów, może odbiegać od L1."
        ]
      },
      {
        heading: "Co zmienia, a czego nie",
        paragraphs: [
          "Ponieważ poprawność jest ustalona z góry, nie ma challenge window (okna na zakwestionowanie), więc kanoniczna wypłata przez [[bridge|bridge]] może zostać sfinalizowana, gdy tylko dowód zostanie zweryfikowany, a ta transakcja na L1 bezpiecznie trafi do łańcucha: w ciągu godzin, a nie tygodnia. Nie ma też założenia o uczciwym challengerze: nikt nie musi czuwać w gotowości z [[fraud-proof|fraud proofem]], żeby łańcuch pozostał uczciwy.",
          "Ograniczenia warto nazwać wprost. Validity proof nie dowodzi, że dane stojące za batchem są dostępne, więc łańcuch z udowodnionymi przejściami nadal może pozostawić użytkowników bez możliwości zbudowania własnych dowodów wypłaty; zobacz [[data-availability|dostępność danych]]. Nie dowodzi, że [[sequencer|sekwencer]] uwzględnił daną transakcję ani że uczciwie ustalił kolejność. Jest też tylko tak mocny jak kontrakt weryfikujący wdrożony na L1, który w większości łańcuchów nadal może zaktualizować niewielka grupa, i jak sam obwód, w którym błąd soundness pozostałby niezauważony."
        ]
      }
    ],
    pitfalls: [
      "Rozumienie „zero knowledge” jako prywatności; tych dowodów używa się dla zwięzłości, a dane transakcji są publikowane w całości.",
      "Zakładanie, że koszt weryfikacji dowodu rośnie z rozmiarem batcha; jest prawie stały i właśnie dlatego batche są duże.",
      "Traktowanie udowodnionego stanu jako wolnego od ryzyka związanego z governance; aktualizowalny kontrakt weryfikujący albo błąd w obwodzie to realna część modelu zaufania.",
      "Oczekiwanie, że validity proof uczyni [[sequencer|sekwencer]] wiarygodnym w kwestii uwzględniania i kolejności transakcji; dowód ogranicza tylko wykonanie."
    ]
  },
  sequencer: {
    title: "Sekwencer",
    aliases: ["sequencer", "sequencing", "sekwencjonowanie", "unsafe head", "forced inclusion", "wymuszone włączenie", "based rollup"],
    summary: "Sekwencer to podmiot, który przyjmuje transakcje L2, ustala ich kolejność i od razu produkuje bloki, dając użytkownikom [[preconfirmation|soft confirmation]] (wstępne zapewnienie o włączeniu transakcji) na długo przed tym, jak batch z tymi transakcjami trafi na L1.",
    sections: [
      {
        heading: "Co właściwie robi sekwencer",
        paragraphs: [
          "Sekwencer działa jako węzeł o uprzywilejowanej roli. Przyjmuje transakcje przez własny endpoint [[eth-send-raw-transaction|eth_sendRawTransaction]], ustala ich kolejność (dziś zarówno w OP Stack, jak i w Arbitrum według kolejności nadejścia), wykonuje je i produkuje podpisany [[block|blok]] L2. OP Stack produkuje blok co 2 sekundy, niezależnie od tego, czy jest co do niego włączyć; Arbitrum Nitro produkuje bloki na żądanie, nawet co około 250 milisekund. Te bloki są rozgłaszane (gossip) do węzłów replik i dlatego publiczny [[rpc-provider|endpoint RPC]] może pokazać transakcję chwilę po jej wysłaniu.",
          "To tylko zapewnienie, a nie rozliczenie (settlement). Na L1 nie ma jeszcze niczego z tego bloku i nie obejmuje go żaden [[fraud-proof|fraud proof]] ani [[validity-proof|validity proof]]. Dopiero gdy batcher opublikuje [[data-availability|dane batcha]], a po nich pojawi się commitment stanu, blok staje się czymś, co L1 uznaje. Do tego czasu sekwencer mógłby w zasadzie go podmienić i właśnie dlatego [[block-tag|tagi bloków]] `safe` i `finalized` na L2 znaczą co innego niż `latest`."
        ]
      },
      {
        heading: "Endpoint sekwencera a replika",
        paragraphs: [
          "Odczyty i zapisy idą różnymi ścieżkami. Każdy węzeł, który podąża za łańcuchem, może obsłużyć [[eth-call|eth_call]] czy [[eth-get-logs|eth_getLogs]], ale tylko sekwencer może włączyć transakcję do bloku, więc publiczne endpointy przekazują mu `eth_sendRawTransaction`, a odczyty obsługują lokalnie. Bezpośredni skutek to [[head-lag|head lag]] (replika jest chwilę za sekwencerem): [[transaction-receipt|receipt]] może już istnieć u sekwencera, a na replice odpytywanej kilkaset milisekund później nadal być `null`. Warto odpytywać ten sam URL, na który poszła transakcja, i tolerować kilka odpowiedzi `null`.",
          "Większość rollupów nie ma też publicznego [[mempool|mempoola]]. [[eth-subscribe|eth_subscribe]] z `newPendingTransactions` i metody `txpool_` zwracają niewiele albo nic, a tag bloku `pending` prawie nic nie znaczy. To eliminuje zwykłe ataki sandwich, bo nikt inny nie widzi transakcji przed jej wykonaniem, ale tę samą swobodę decyzji skupia w rękach jednego operatora."
        ]
      },
      {
        heading: "Centralizacja, escape hatch i przestoje",
        paragraphs: [
          "Niemal każdy produkcyjny rollup ma jeden sekwencer, więc odporność na cenzurę zapewnia osobna ścieżka: wysłanie transakcji przez L1. W OP Stack wywołanie kontraktu `OptimismPortal` tworzy depozyt, który [[derivation-pipeline|derivation pipeline]] musi uwzględnić, i pojawia się on na L2 jako transakcja typu `0x7e` w ramach okna sekwencjonowania (sequencing window) danego łańcucha, liczonego w godzinach. Arbitrum ma odpowiednik w postaci delayed inbox (skrzynki opóźnionych wiadomości). Ta ścieżka jest wolna i kosztuje [[gas|gas]] na L1, ale nie wymaga współpracy sekwencera.",
          "Gdy sekwencer stanie, łańcuch przestaje produkować bloki. Odczyty z replik dalej działają, salda się nie zmieniają i nic nie ginie, ale żadna nowa transakcja nie trafi do bloku, dopóki sekwencer nie wróci albo ktoś nie użyje ścieżki forced inclusion (wymuszonego włączenia). Istnieją rozwiązania, które usuwają ten pojedynczy punkt awarii: współdzielone sieci sekwencerów (shared sequencers) i based rollupy, w których sekwencjonowaniem zajmują się proposerzy L1, ale duże łańcuchy jeszcze tak nie działają."
        ]
      }
    ],
    example: {
      title: "Zapisy idą do sekwencera, odczyty mogą iść gdziekolwiek",
      note: "Wysyłanie do jednego hosta i odpytywanie innego to najczęstsza przyczyna sytuacji, w której receipt na L2 wydaje się nie istnieć."
    },
    pitfalls: [
      "Traktowanie odpowiedzi sekwencera jako ostatecznej; dopóki batch i jego commitment stanu nie trafią na L1, to tylko twierdzenie jednego operatora.",
      "Oczekiwanie, że na L2 będzie pełna pula transakcji pending; większość rollupów trzyma kolejkę prywatnie, więc subskrypcje transakcji pending pozostają puste.",
      "Zakładanie, że zatrzymane L2 oznacza utratę środków; łańcuch po prostu przestaje się przesuwać, a forced inclusion przez L1 nadal jest dostępne."
    ]
  },
  "l2-rpc": {
    title: "Różnice RPC na L2",
    aliases: [
      "l2 rpc",
      "rpc na l2",
      "l1Fee",
      "l1GasUsed",
      "l1BlockNumber",
      "0x7e",
      "deposit transaction",
      "transakcja depozytowa",
      "arb_",
      "zks_",
      "optimism_"
    ],
    summary: "Endpoint L2 odpowiada na te same metody `eth_` co L1, ale z innym rytmem bloków, dodatkowymi polami w [[transaction-receipt|receiptach]] dla kosztu danych na L1, przestrzeniami nazw specyficznymi dla łańcucha oraz `safe` i `finalized` wyznaczanymi z L1, a nie z lokalnej [[finality|finalności]].",
    sections: [
      {
        heading: "Te same metody, inny rytm bloków",
        paragraphs: [
          "Łańcuchy OP Stack produkują [[block|blok]] co 2 sekundy, a Arbitrum Nitro mniej więcej co 250 milisekund, więc numer bloku L2 obejmuje znacznie krótszy wycinek czasu niż numer bloku L1. Zakres [[eth-get-logs|eth_getLogs]] na 10 000 bloków to na OP Stack mniej niż sześć godzin, a na Arbitrum znacznie mniej niż godzina, dlatego providerzy agresywnie ograniczają zakresy, a [[indexer|indekser]] dostrojony do L1 będzie zostawał w tyle. `latest` ciągle się zmienia, więc gdy kilka odczytów musi być spójnych, trzeba przypiąć jawny numer bloku.",
          "[[block-tag|Tagi bloków]] są wyliczane z L1. W OP Stack `op-node` oznacza jako `safe` head odtworzony z danych batchy, które już są na L1, a jako `finalized` head odtworzony z danych L1, które L1 już sfinalizowało; bloki wyprodukowane przez [[sequencer|sekwencer]], których nie obejmuje jeszcze żaden batch, tworzą unsafe head, na który wskazuje `latest`. `finalized` jest więc w tyle o czas finalności L1, około 13 minut, plus tyle, ile batcher czeka przed publikacją. Potrafi też stać w miejscu przez kilka minut, co psuje health checki oczekujące, że będzie się przesuwał z każdym blokiem."
        ]
      },
      {
        heading: "Dodatkowe pola",
        paragraphs: [
          "Receipty OP Stack obok zwykłych pól zawierają opłatę za dane na L1: `l1Fee` to kwota w wei pobrana za opublikowanie transakcji, `l1GasUsed` to szacowany gas na L1 dla jej skompresowanych bajtów, a `l1BaseFee`, `l1BaseFeeScalar`, `l1BlobBaseFee` i `l1BlobBaseFeeScalar` to dane wejściowe użyte do jej wyliczenia. Arbitrum zamiast tego udostępnia `l1BlockNumber` w blokach i transakcjach oraz `gasUsedForL1` w receiptach. zkSync Era dodaje `l1BatchNumber` i `l1BatchTxIndex`, które przypisują transakcję do batcha, którego dowód ją rozliczy.",
          "Depozyty z L1 pojawiają się jako typ transakcji, którego nie ma na mainnecie: `0x7e` w OP Stack. Taka transakcja nie ma podpisu, zawiera pola `sourceHash` i `mint`, a jej `from` to [[address|adres]] nadawcy z L1 albo, gdy nadawcą jest kontrakt, alias tego adresu. Restrykcyjne dekodery w [[client-libraries|bibliotekach klienckich]] i [[indexer|indekserach]], które rozgałęziają się po [[transaction-types|typie transakcji]], rzucą na niej wyjątkiem, chyba że napisano je z myślą o OP Stack."
        ]
      },
      {
        heading: "Opłaty szacuje się inaczej",
        paragraphs: [
          "W OP Stack [[eth-estimate-gas|eth_estimateGas]] zwraca tylko gas wykonania na L2; opłata za dane na L1 jest naliczana dodatkowo i zwykle stanowi większą część. Żeby pokazać użytkownikowi prawdziwą sumę, trzeba odpytać [[predeploys|predeploy]] `GasPriceOracle` pod `0x420000000000000000000000000000000000000F` przez [[eth-call|eth_call]], przekazując serializowaną transakcję do `getL1Fee`. Arbitrum robi odwrotnie i wlicza składnik L1 do samej liczby gasu, więc jego oszacowanie już go zawiera, a pole `gasUsedForL1` mówi, jaka część sumy na niego przypadła."
        ]
      },
      {
        heading: "Przestrzenie nazw specyficzne dla łańcucha",
        paragraphs: [
          "`op-node` udostępnia na własnym porcie [[namespaces|przestrzeń nazw]] `optimism_` z `optimism_syncStatus`, `optimism_outputAtBlock` i `optimism_rollupConfig`; stamtąd pochodzą heady unsafe, safe i finalized oraz output rooty używane przez [[bridge|bridge]]. Arbitrum Nitro dodaje przestrzeń nazw `arb_` oraz `arbtrace_` dla trace'ów w stylu Parity, a na pytania o gas i potwierdzenia odpowiada przez pseudokontrakt `NodeInterface` pod `0x00000000000000000000000000000000000000C8`, wywoływany przez `eth_call`. zkSync Era dodaje `zks_`, w tym `zks_L1BatchNumber` i `zks_getL1BatchDetails`. Żadnej z nich nie ma w [[execution-apis|specyfikacji execution APIs]], więc zanim zacznie się na nich polegać, trzeba sprawdzić, czy są dostępne."
        ]
      }
    ],
    example: {
      title: "Receipt w OP Stack (skrócony)",
      note: "Użytkownik zapłacił `gasUsed` razy `effectiveGasPrice` plus `l1Fee`; `eth_estimateGas` podał tylko pierwszy składnik."
    },
    pitfalls: [
      "Podawanie użytkownikowi w łańcuchu OP Stack samego oszacowania gasu na L2 bez `l1Fee`, które często jest większą częścią rachunku.",
      "Alertowanie, gdy `finalized` na L2 przestaje się przesuwać; przesuwa się skokowo, zależnie od finalności L1 i publikacji batchy, a nie z każdym blokiem.",
      "Przenoszenie zakresów bloków albo interwału odpytywania z L1 na L2; bloki co 2 sekundy i częstsze niż co sekundę oznaczają dużo więcej bloków na godzinę i znacznie ostrzejsze limity providerów.",
      "Zakładanie, że `block.number` w EVM zgadza się z [[eth-block-number|eth_blockNumber]]; na Arbitrum opcode zwraca przybliżony numer bloku L1, a metoda RPC numer bloku L2."
    ]
  },
  bridge: {
    title: "Bridge",
    aliases: [
      "bridge",
      "bridge'e",
      "most",
      "mosty",
      "deposit",
      "depozyt",
      "withdrawal",
      "wypłata",
      "canonical bridge",
      "kanoniczny bridge",
      "l1 to l2 messaging",
      "portal",
      "message passing"
    ],
    summary: "Kanoniczny bridge to para [[smart-contract|smart kontraktów]] na L1 i L2, która przenosi wartość i wiadomości między [[rollup|rollupem]] a Ethereum: derivation pipeline wymusza włączenie depozytów do bloków L2, a wypłaty (withdrawals) udowadnia się na L1 względem opublikowanego commitmentu stanu.",
    sections: [
      {
        heading: "Depozyty są tanie i odporne na cenzurę",
        paragraphs: [
          "Depozyt zaczyna się jako zwykła transakcja na L1 do kontraktu bridge: w OP Stack bezpośrednio do `OptimismPortal` albo, dla tokenów, do `L1StandardBridge`. Emituje ona [[event-log|event]]. [[derivation-pipeline|Derivation pipeline]] każdego węzła L2 czyta bloki L1, znajduje te eventy i wstawia odpowiadającą im transakcję do bloku L2; w OP Stack pojawia się ona jako transakcja depozytowa typu `0x7e`, której `from` to nadawca z L1, a gdy nadawcą jest kontrakt, jego alias: adres plus `0x1111000000000000000000000000000000001111`. [[sequencer|Sekwencer]] nie ma nic do powiedzenia w kwestii jej włączenia i dlatego ta ścieżka służy też jako escape hatch do wymuszonego włączenia (forced inclusion).",
          "Pipeline jest deterministyczny, więc depozyt zwykle pojawia się na L2 w ciągu kilku minut, po tylu [[confirmations|potwierdzeniach]] na L1, ile wymagają reguły derywacji danego łańcucha. Gas za wykonanie na L2 został opłacony na L1 przy składaniu depozytu, więc do wykonania depozyt nie potrzebuje środków na L2."
        ]
      },
      {
        heading: "Wypłaty czekają na rozliczenie",
        paragraphs: [
          "W drugą stronę jest wolniej, bo L1 widzi z L2 tylko to, co zostało już rozliczone. W OP Stack wypłata to wiadomość zapisana przez [[predeploys|predeploy]] `L2ToL1MessagePasser` pod adresem `0x4200000000000000000000000000000000000016`. Gdy proposer opublikuje output root obejmujący ten blok L2, użytkownik udowadnia wiadomość na L1 [[storage-proof|dowodem storage]] pobranym przez [[eth-get-proof|eth_getProof]] z L2 dla tego bloku, czeka, aż minie okno na challenge w systemie [[fraud-proof|fault proof]] (około siedmiu dni), a potem wysyła drugą transakcję, żeby sfinalizować wypłatę i odebrać środki.",
          "W [[zk-rollup|ZK rollupie]] sprawdzany jest ten sam dowód włączenia, ale zamiast stałego okna czeka się, aż [[validity-proof|validity proof]] batcha zostanie zweryfikowany na L1, więc opóźnienie liczy się w godzinach. Tak czy inaczej wypłata to dwie lub trzy transakcje na L1, a przy małych kwotach [[gas|gas]] na L1 za udowodnienie i finalizację może przekroczyć wypłacaną kwotę."
        ]
      },
      {
        heading: "Zewnętrzne bridge'e i na co patrzeć",
        paragraphs: [
          "Większość użytkowników nigdy nie korzysta ze ścieżki kanonicznej. Bridge'e płynnościowe (liquidity bridges) od razu wykładają środki na łańcuchu docelowym, a wolną drogą idą same, pobierając opłatę za kapitał i ryzyko. [[cross-chain-relayer|Bridge'e wiadomości]] (messaging bridges), z własnymi zestawami walidatorów albo wyroczni (oracle), przenoszą dowolne dane między łańcuchami, które nie mają żadnej wspólnej warstwy rozliczeniowej. Jedne i drugie zastępują model bezpieczeństwa rollupa własnym modelem bridge'a, a kontrakty bridge'ów były największą pojedynczą kategorią strat w ekosystemie.",
          "Z perspektywy RPC śledzenie aktywności bridge'a oznacza obserwowanie dwóch łańcuchów naraz: [[eth-get-logs|eth_getLogs]] na kontraktach L1 dla depozytów i dowodów, `eth_getLogs` na L2 dla eventów przekazania wiadomości (message-passed) oraz `optimism_outputAtBlock` w `op-node`, żeby ustalić, pod który output root podpada dany blok L2. [[indexer|Indekser]], który łączy obie strony, musi obsługiwać [[reorg|reorgi]] każdego łańcucha niezależnie."
        ]
      }
    ],
    pitfalls: [
      "Zakładanie, że wypłata to jedna transakcja; w OP Stack to inicjacja na L2, dowód na L1, a po upływie okna finalizacja na L1.",
      "Udowadnianie wypłaty względem bloku, którego proposer jeszcze nie objął; dowód zadziała dopiero wtedy, gdy na L1 będzie output root obejmujący ten blok.",
      "Wysyłanie tokenów bezpośrednio na adres bridge'a zamiast wywołania funkcji depozytu; zwykły transfer nie jest wiadomością bridge'a i zwykle nie da się go odzyskać."
    ]
  },
  "data-availability": {
    title: "Dostępność danych",
    aliases: ["DA", "data availability", "calldata", "celestia", "eigenda", "peerdas", "das", "data availability sampling"],
    summary: "Dostępność danych (data availability, DA) to gwarancja, że dane stojące za batchem [[rollup|rollupu]] zostały naprawdę opublikowane, więc każdy może odtworzyć stan L2 i wycofać środki bez pomocy operatora, niezależnie od tego, czy poprawność przejścia stanu została udowodniona.",
    sections: [
      {
        heading: "Dlaczego dostępność to osobny problem",
        paragraphs: [
          "[[validity-proof|Validity proof]] pokazuje, że przejście stanu wykonano poprawnie; [[fraud-proof|fraud proof]] pozwala obalić błędne przejście. Żaden z nich nie pomoże, jeśli brakuje danych. Jeśli operator opublikuje prawidłowy [[state-root|state root]], ale nie ujawni transakcji, które za nim stoją, nikt inny nie wyliczy aktualnego stanu, nikt nie zbuduje [[storage-proof|dowodu storage]], którego wymaga [[bridge|wypłata]], i nikt niczego nie zakwestionuje, bo nie da się skonstruować poprawnego twierdzenia. Łańcuch jest jednocześnie poprawny i bezużyteczny.",
          "Dlatego o tym, czy łańcuch jest rollupem, decyduje to, gdzie trafiają jego dane. Publikacja na Ethereum oznacza, że dane dziedziczą dostępność samego Ethereum. Sprawdza je każdy [[full-node|pełny węzeł]] w sieci: calldata pobiera w całości, a kolumny blobów od wprowadzenia PeerDAS próbkuje. Calldata przechowuje potem [[archive-node|węzeł archiwalny]] albo [[portal-network|Portal Network]]."
        ]
      },
      {
        heading: "Trzy miejsca na dane",
        paragraphs: [
          "Pierwszą opcją było calldata: trwałe, możliwe do weryfikacji przez kontrakty i drogie, bo konkuruje z całym pozostałym [[gas|gasem]] za wykonanie, a EIP-7623 w Pectra dodatkowo podniosło jego koszt. Obecnie domyślną opcją są [[blob|bloby]]: osobny rynek, przy typowych cenach mniej więcej o dwa rzędy wielkości tańszy za bajt, nieczytelny dla [[evm|EVM]] i usuwany przez węzły po około 18 dniach. To wystarczająco długo, żeby każdy mógł wyprowadzić łańcuch, ale za krótko, żeby służyć jako archiwum.",
          "Trzecią opcją są zewnętrzne warstwy DA, takie jak Celestia, EigenDA i Avail, albo stały komitet dostępności danych (data availability committee). Łańcuchy, które z nich korzystają, nazywa się zwykle [[validium|validium]] albo łańcuchami alt-DA. Są jeszcze tańsze, ale zmieniają model zaufania: dostępność zależy wtedy od tej sieci albo komitetu, a nie od Ethereum, a rollupu, który utracił dane, nie naprawi już L1."
        ]
      },
      {
        heading: "Próbkowanie zamiast pobierania",
        paragraphs: [
          "Przepustowość blobów ogranicza to, że każdy węzeł musi pobrać każdy blob. [[peerdas|PeerDAS]], wprowadzony przez EIP-7594 w aktualizacji Fusaka w grudniu 2025 roku, to zmienia: dane blobów są kodowane z nadmiarem (erasure coding) i dzielone na kolumny, każdy węzeł przechowuje i rozgłasza tylko część z nich, a w każdym slocie próbkuje (sampling) stały zestaw co najmniej 8 kolumn, wyznaczony z identyfikatora węzła (node id), żeby nabrać pewności, że reszta istnieje. Ponieważ żaden węzeł nie potrzebuje całości, liczba blobów może rosnąć bez zwiększania pasma potrzebnego jednemu węzłowi, i to właśnie robią kolejne forki po Fusaka, które zmieniają tylko parametry blobów (blob-parameter-only)."
        ]
      },
      {
        heading: "Odczyt danych przez RPC",
        paragraphs: [
          "[[execution-layer|Warstwa wykonawcza]] nigdy nie zwraca zawartości blobów. [[eth-get-transaction-by-hash|eth_getTransactionByHash]] dla transakcji publikującej batch zwraca `blobVersionedHashes`, czyli commitmenty, a nie dane. Treść blobów jest w [[consensus-layer|warstwie konsensusu]] i w okresie przechowywania (retention window) pobiera się ją z [[beacon-api|Beacon API]] pod `/eth/v1/beacon/blobs/{block_id}`, który od Fulu zastępuje przestarzały `/eth/v1/beacon/blob_sidecars/{block_id}`. Od PeerDAS całe bloby muszą zwracać tylko supernode'y, które przechowują (custody) każdą kolumnę. Po upływie tego okresu mają je już tylko [[blob-archive|serwis archiwizujący bloby]] albo własny węzeł rollupu. Wyprowadzenie łańcucha L2 od zera wymaga więc endpointu wykonawczego i endpointu konsensusu, i dlatego konfiguracje węzłów [[rollup|rollupu]] wymagają podania obu."
        ]
      }
    ],
    pitfalls: [
      "Zakładanie, że validity proof oznacza dostępność danych; te dwie własności są niezależne, a łańcuch z udowodnionymi przejściami nadal może zostawić użytkowników bez wyjścia.",
      "Planowanie odczytu starych danych batchy z blobów; sidecary są usuwane po około 18 dniach, więc wyprowadzanie łańcucha z dawnego zakresu wymaga ich archiwum.",
      "Nazywanie validium rollupem; jego dostępność danych opiera się na zewnętrznym komitecie albo sieci, a nie na Ethereum.",
      "Oczekiwanie zawartości blobów od endpointu wykonawczego; metody `eth_` zwracają tylko versioned hashe, a treść pochodzi z Beacon API."
    ]
  },
  blob: {
    title: "Bloby (EIP-4844)",
    aliases: ["4844", "proto-danksharding", "blob transaction", "transakcja blobowa", "type 0x3", "typ 0x3", "kzg", "versioned hash", "blobGasUsed"],
    summary: "Blob to fragment danych o rozmiarze 128 KiB dołączony do transakcji typu `0x3`. W łańcuchu zostaje po nim tylko commitment w postaci versioned hasha opartego na KZG. Bloby mają własny rynek gasu, a węzły usuwają je po mniej więcej 18 dniach.",
    sections: [
      {
        heading: "Czym jest blob",
        paragraphs: [
          "Każdy blob to 4096 elementów ciała (field elements) po 32 bajty, czyli dokładnie 131072 bajty, 128 KiB. Blob podróżuje obok transakcji, a nie w niej: body transakcji zawiera tylko `blobVersionedHashes`, gdzie każdy versioned hash to `0x01`, po którym następuje 31 ostatnich bajtów `sha256` z commitmentu KZG bloba. [[evm|EVM]] nie może czytać zawartości blobów. Może odczytać versioned hash opcode'em `BLOBHASH` (`0x49`) i udowodnić pojedynczy punkt bloba precompile'em (prekompilowanym kontraktem) do ewaluacji punktu pod `0x0a`. Dokładnie tyle potrzebuje [[rollup|rollup]] i nic więcej.",
          "Transakcja typu `0x3` dodaje do pól z [[eip-1559|EIP-1559]] pola `maxFeePerBlobGas` i `blobVersionedHashes` i musi mieć [[address|adres]] `to`, więc transakcja blobowa nie może wdrożyć [[smart-contract|smart kontraktu]]. Przy wysyłaniu przez [[eth-send-raw-transaction|eth_sendRawTransaction]] trzeba użyć formy sieciowej (network form), która opakowuje transakcję razem z blobami, ich commitmentami i dowodami; węzeł sprawdza commitmenty, zanim przyjmie transakcję do [[mempool|mempoola]]."
        ]
      },
      {
        heading: "Osobny rynek opłat",
        paragraphs: [
          "Blob gas jest liczony osobno od [[gas|gasu]] za wykonanie i w całości spalany. Każdy blob kosztuje 131072 blob gas, a [[block-header|nagłówek]] zawiera `blobGasUsed` dla całego bloku oraz `excessBlobGas`, narastający licznik tego, o ile ostatnie bloki przekraczały target. Base fee blobów jest wykładniczą funkcją `excessBlobGas`, więc seria pełnych bloków szybko ją podnosi, a okres bez ruchu sprowadza ją z powrotem w dół. Przed Fusaka mogła spaść do 1 wei; od Fusaka EIP-7918 nie pozwala jej zejść poniżej ceny minimalnej (reserve price) powiązanej z base fee za wykonanie. [[eth-gas-price|eth_blobBaseFee]] zwraca bieżącą wartość, a [[eth-fee-history|eth_feeHistory]] zwraca tablice `baseFeePerBlobGas` i `blobGasUsedRatio`, z których można zbudować estymację.",
          "Target i maksimum na blok rosły z każdą aktualizacją: 3 i 6 w Dencun w marcu 2024 roku, 6 i 9 w Pectra w maju 2025 roku na mocy EIP-7691, a potem jeszcze więcej w kolejnych forkach po Fusaka, które zmieniają tylko parametry blobów (blob-parameter-only). Ponieważ oba rynki są wyceniane osobno, przestrzeń blobów może być tania, gdy gas za wykonanie jest drogi, albo odwrotnie, choć od EIP-7918 cena blobów nie spada już dowolnie nisko poniżej kosztu wykonania. [[transaction-receipt|Receipty]] transakcji blobowej podają `blobGasUsed` i `blobGasPrice`, żeby nadawca widział, ile faktycznie zapłacił."
        ]
      },
      {
        heading: "Gdzie są dane",
        paragraphs: [
          "Bloby nigdy nie trafiają do bloku wykonawczego. Rozchodzą się w [[consensus-layer|warstwie konsensusu]] jako sidecary rozgłaszane razem z [[beacon-block|blokiem beacon]] i są przechowywane przez 4096 epok, czyli około 18 dni, po czym węzły je usuwają. Commitment zostaje w łańcuchu na zawsze, dane nie. Pobiera się je przez [[beacon-api|Beacon API]] pod `/eth/v1/beacon/blobs/{block_id}`, który w Fulu zastąpił przestarzały `/eth/v1/beacon/blob_sidecars/{block_id}`, i nigdy przez metody `eth_`, które zwracają wyłącznie versioned hashe.",
          "Okres przechowywania jest celowy: [[data-availability|dostępność]] musi trwać tylko tak długo, żeby każdy zdążył pobrać dane i wyprowadzić łańcuch L2, a kto chce je mieć na stałe, [[blob-archive|archiwizuje je sam]]. Od Fusaka [[peerdas|PeerDAS]] pozwala węzłowi próbkować kolumny zamiast trzymać każdy blob. Dzięki temu limity mogą dalej rosnąć i z tego samego powodu Beacon API wymaga zwracania całych blobów tylko od supernode'ów, które przechowują (custody) każdą kolumnę."
        ]
      }
    ],
    example: {
      title: "Batch rollupu opublikowany jako transakcja typu 0x3 (skrót)",
      note: "To batch inbox Base, w którego adresie widać jego [[chain-id|chain ID]] 8453 (domyślny format udokumentowany w OP Stack to `0x00`, a po nim pierwsze 19 bajtów `keccak256` z 32-bajtowego chain ID); payload jest pusty, a 128 KiB danych za każdym versioned hashem trzeba pobrać z [[consensus-client|klienta konsensusu]]."
    },
    pitfalls: [
      "Szukanie zawartości blobów w obiekcie transakcji; `blobVersionedHashes` to commitmenty, a treść pochodzi z Beacon API, i to tylko przez około 18 dni.",
      "Wysyłanie transakcji typu `0x3` w zwykłym podpisanym kodowaniu; `eth_sendRawTransaction` oczekuje formy sieciowej z blobami, commitmentami i dowodami.",
      "Szacowanie kosztu blobów na podstawie base fee za wykonanie; od EIP-7918 wyznacza ona tylko cenę minimalną, do której podbijana jest base fee blobów, a przy popycie na bloby base fee blobów rośnie daleko ponad nią."
    ]
  },
  predeploys: {
    title: "Predeploye",
    aliases: [
      "predeploy",
      "predeploys",
      "predeploye",
      "0x4200 namespace",
      "przestrzeń 0x4200",
      "GasPriceOracle",
      "L1Block",
      "L2ToL1MessagePasser",
      "ArbSys",
      "NodeInterface",
      "system contract",
      "kontrakt systemowy"
    ],
    summary: "Predeploy to kontrakt, który istnieje pod ustalonym przez protokół [[address|adresem]] od [[genesis|genesis]] L2 albo od aktualizacji sieci, a nie dzięki wdrożeniu przez użytkownika. Dzięki temu oracle opłat, kontekst L1, rejestr wypłat i bridge'e są tam, gdzie każdy węzeł, portfel i biblioteka już wie, że trzeba szukać.",
    sections: [
      {
        heading: "Kontrakty istniejące od bloku 0",
        paragraphs: [
          "W łańcuchu [[optimistic-rollup|OP Stack]] predeploye zajmują przestrzeń adresów zaczynającą się od `0x4200000000000000000000000000000000000000`. Te, na które trafiają wywołujący, to `WETH9` pod `…0006`, `L2CrossDomainMessenger` pod `…0007`, `L2StandardBridge` pod `…0010`, `SequencerFeeVault` pod `…0011`, `GasPriceOracle` pod `…000F`, `L1Block` pod `…0015`, `L2ToL1MessagePasser` pod `…0016` oraz `BaseFeeVault` i `L1FeeVault` pod `…0019` i `…001a`. Razem tworzą [[bridge|bridge]] łańcucha, jego model opłat i jego widok na L1.",
          "Większość z nich to [[proxy-contract|proxy]]. Genesis umieszcza bytecode proxy pod pierwszymi 2048 adresami tej przestrzeni, a właścicielem tych proxy jest predeploy `ProxyAdmin` pod `…0018`; bez proxy są tylko `WETH9` i token governance pod `…0042`. Na tym opierają się aktualizacje sieci: blok aktywacji Ecotone, Fjord czy Isthmus zawiera transakcje aktualizacyjne typu depozytowego, które wdrażają nowe implementacje i przepinają proxy. Dlatego [[eth-get-code|eth_getCode]] dla predeploya zwraca mały kontrakt proxy, logika siedzi pod adresem zapisanym w slocie implementacji EIP-1967, który można odczytać przez [[eth-get-storage-at|eth_getStorageAt]], a funkcja dodana przez aktualizację nie istnieje we wcześniejszych blokach. Genesis zawiera też kontrakty preinstalowane (preinstalls), czyli kontrakty firm trzecich, takie jak Multicall3 pod `0xcA11bde05977b3631167028862bE2a173976CA11`, umieszczone pod swoimi zwykłymi adresami z L1; to zwykły bytecode, a nie mechanizm protokołu."
        ]
      },
      {
        heading: "Do czego używa ich wywołujący RPC",
        paragraphs: [
          "`L1Block` przechowuje kontekst L1. Pierwsza transakcja każdego bloku L2 to depozyt typu `0x7e` z `0xdeaddeaddeaddeaddeaddeaddeaddeaddead0001` do `L1Block`, zapisujący numer, timestamp, base fee, blob base fee i hash bloku L1 origin, dzięki czemu kontrakty mogą czytać fakty z L1, a transakcja o indeksie 0 w każdym bloku jest tym wywołaniem systemowym, a nie transakcją użytkownika. `GasPriceOracle` wycenia na tej podstawie opłatę za dane na L1: [[eth-call|eth_call]] do `getL1Fee(bytes)` z serializowaną transakcją zwraca kwotę, którą transakcja zostałaby obciążona ponad gas wykonania, a `getL1FeeUpperBound(uint256)`, dodane w Fjord, ogranicza tę opłatę od góry na podstawie samej długości w bajtach. To właśnie ta część, której [[eth-estimate-gas|eth_estimateGas]] nie uwzględnia; zobacz [[l2-rpc|różnice RPC na L2]].",
          "`L2ToL1MessagePasser` zapisuje wypłaty: `initiateWithdrawal` umieszcza hash każdej wypłaty w mappingu `sentMessages`. Output root, który proposer publikuje na L1, to wspólny hash wersji, [[state-root|state root]] L2, storage root tego kontraktu i hasha bloku, więc udowodnienie wypłaty na L1 oznacza dostarczenie [[storage-proof|dowodu storage]] dla tego slotu mappingu, pobranego przez [[eth-get-proof|eth_getProof]] w udowadnianym bloku, względem storage root zawartego w output root. Kontrakty fee vault zbierają z każdego bloku priority fee, base fee i opłaty L1, a potem wypłacają je na adres na L1, dlatego ich salda rosną bez żadnych przychodzących transferów."
        ]
      },
      {
        heading: "Precompile'y Arbitrum i NodeInterface",
        paragraphs: [
          "Arbitrum Nitro umieszcza ten sam mechanizm w [[precompiles|precompile'ach]], czyli pod adresami, których zachowanie ArbOS implementuje natywnie, a nie jako bytecode [[evm|EVM]]. `ArbSys` pod `0x0000000000000000000000000000000000000064` udostępnia `arbBlockNumber()`, którego kontrakty potrzebują, bo `block.number` na Arbitrum zwraca przybliżony numer bloku L1, bliski numerowi bloku łańcucha nadrzędnego (parent chain), ale nie zawsze mu równy, a także `withdrawEth` i `sendTxToL1` do wysyłania wiadomości na L1. `ArbGasInfo` pod `0x…6c` odpowiada na `getPricesInWei()` i `getL1BaseFeeEstimate()`, a `ArbRetryableTx` pod `0x…6e` zarządza retryable tickets (wiadomościami, które można ponawiać). Dostęp do nich mają zarówno kontrakty, jak i `eth_call`.",
          "`NodeInterface` pod `0x00000000000000000000000000000000000000C8` w ogóle nie istnieje on-chain. Węzeł przechwytuje kierowane do niego wywołania `eth_call` i `eth_estimateGas`, więc [[smart-contract|kontrakt]] wywołujący `0xc8` nie dostaje nic, a wywołujący RPC dostaje `gasEstimateComponents` i `gasEstimateL1Component` do rozbicia opłat, `findBatchContainingBlock` i `getL1Confirmations` do sprawdzania statusu rozliczenia oraz `l2BlockRangeForL1` do mapowania numerów bloków. To odpowiednik przestrzeni nazw `optimism_` w Arbitrum, dostarczony w formie pseudokontraktu."
        ]
      },
      {
        heading: "Odpowiednik na L1: kontrakty systemowe",
        paragraphs: [
          "Mainnet Ethereum nie ma predeployów w genesis, ale od Cancun ma [[system-contracts|kontrakty pod ustalonymi przez protokół adresami, które protokół sam wywołuje]]. Kontrakt beacon roots z EIP-4788 pod `0x000F3df6D732807Ef1319fB7B8bB8522d0Beac02` i historia hashy bloków z EIP-2935 pod `0x0000F90827F1C53a10cb7A02335B175320002935` są zapisywane przez wywołanie systemowe z `0xfffffffffffffffffffffffffffffffffffffffe`, zanim wykonają się transakcje bloku, a EIP-7002 i EIP-7251 wprost nazywają adresy swoich kontraktów żądań, `0x00000961Ef480Eb55e80D19ad83579A64c007002` i `0x0000BBdDc7CE488642fb579F8B00f3a590007251`, adresami predeployów. Każdy z nich zainstalowano jednorazową transakcją wdrożeniową bez klucza (keyless) przed jego [[hardfork|forkiem]]. OP Stack używa tych samych adresów: jego lista predeployów zawiera kontrakt beacon roots od Ecotone, a Isthmus wdrożył kontrakt z EIP-2935 transakcją aktualizacyjną."
        ]
      }
    ],
    example: {
      title: "Wycena opłaty za L1 i znalezienie implementacji GasPriceOracle",
      note: "Pierwszy wynik, w wei, to kwota, którą portfel dodaje do iloczynu gasu wykonania i ceny gasu; drugi wskazuje implementację, która odpowiedziała na to wywołanie, a ta zmienia się przy aktualizacjach sieci."
    },
    pitfalls: [
      "Wywoływanie funkcji dodanej przez aktualizację, takiej jak `getL1FeeUpperBound`, w bloku sprzed tej aktualizacji; proxy wskazuje tam jeszcze implementację bez tej funkcji i wywołanie kończy się revertem.",
      "Audytowanie bytecode'u, który `eth_getCode` zwraca dla predeploya; to tylko proxy, a logika jest pod adresem z jego slotu implementacji.",
      "Liczenie depozytu do `L1Block` o indeksie 0 w każdym bloku OP Stack jako aktywności użytkowników albo dekodowanie go parserem, który odrzuca typ `0x7e`.",
      "Wywoływanie `NodeInterface` Arbitrum z kontraktu; odpowiada on tylko na wywołania RPC, więc kod on-chain dostaje pusty wynik.",
      "Zakładanie, że adresy `0x4200…` coś znaczą na Arbitrum, zkSync czy Scroll; każda rodzina rollupów ma własny układ."
    ]
  },
  "derivation-pipeline": {
    title: "Derivation pipeline",
    aliases: [
      "derivation pipeline",
      "derywacja",
      "op-node derivation",
      "batch inbox",
      "channel",
      "kanał",
      "frame",
      "ramka",
      "span batch",
      "safe head",
      "unsafe head",
      "optimism_syncStatus"
    ],
    summary: "Derivation pipeline to deterministyczna procedura, w której węzeł rollupa OP Stack, taki jak `op-node`, odtwarza każdy blok L2 z danych na L1 (transakcji batchera i eventów depozytów) i przekazuje każdy blok swojemu [[execution-client|klientowi wykonawczemu]] przez [[engine-api|Engine API]]. Dzięki temu każdy może sprawdzić łańcuch bez ufania [[sequencer|sekwencerowi]].",
    sections: [
      {
        heading: "Dwa źródła danych na L1",
        paragraphs: [
          "`op-node` przechodzi po kolei przez bloki L1 i zbiera dwa rodzaje danych wejściowych. Pierwszy to transakcje batchera: transakcje wysłane na adres batch inbox łańcucha i podpisane przez adres batchera wskazany w kontrakcie `SystemConfig` na L1, niosące dane w calldata albo, od Ecotone, w [[blob|blobach]]. Te dane to ciąg ramek (frames). Ramki składają się w kanały (channels), czyli skompresowane strumienie, które mogą obejmować kilka transakcji L1 i muszą się zakończyć przed upływem limitu czasu kanału (channel timeout), od Granite wynoszącego 50 bloków L1. Kanał po dekompresji daje batche, z których każdy opisuje bloki L2 przez timestamp, L1 origin (blok, od którego się wywodzą) i listę transakcji; span batche, dodane w Delta, obejmują wiele bloków naraz.",
          "Drugi to depozyty: [[event-log|eventy]] `TransactionDeposited` emitowane przez kontrakt `OptimismPortal`, które stają się transakcjami typu `0x7e` na początku pierwszego bloku L2 przyjmującego dany blok L1 jako swój origin; zobacz [[bridge|bridge'e]]. Każdy blok L2 zaczyna się też od depozytu z atrybutami L1, który zapisuje numer, hash i opłaty bloku origin w [[predeploys|predeployu L1Block]]. Dla każdego bloku pipeline tworzy payload attributes: timestamp, `prevRandao`, fee recipient, dokładną listę transakcji i `noTxPool: true`. `op-node` przekazuje je swojemu klientowi wykonawczemu przez `engine_forkchoiceUpdated`, dokładnie tak jak zrobiłby to [[consensus-client|klient konsensusu]] L1, a potem importuje zbudowany blok przez `engine_newPayload`."
        ]
      },
      {
        heading: "Unsafe, safe i finalized",
        paragraphs: [
          "Sekwencer buduje bloki na długo przed tym, jak ich batch trafi na L1, i rozgłasza je, a pozostałe węzły wstawiają je jako unsafe head, czyli to, co zwraca `latest`. Gdy derywacja (derivation) odtworzy blok z danych batcha na L1, blok staje się safe; gdy blok L1 z tymi danymi zostanie sfinalizowany, staje się finalized. `op-node` podaje wszystkie trzy w każdej aktualizacji fork choice, dlatego [[block-tag|tagi bloków]] `safe` i `finalized` na L2 oznaczają „odtworzony z L1”, a nie cokolwiek lokalnego. Jeśli odtworzony blok różni się od rozgłoszonego, wygrywa derywacja, a bloki unsafe zostają zastąpione: to [[reorg|reorg]] na L2, za którym nie stoi żaden reorg na L1.",
          "Dwie reguły wyznaczają granice dla sekwencera i safe head. Batche dla danej epoki muszą się pojawić w oknie sekwencjonowania (sequencing window), które w standardowej konfiguracji wynosi 3600 bloków L1, czyli 12 godzin; jeśli żaden nie dotrze, derywacja sama generuje bloki zawierające tylko depozyty i właśnie dzięki temu działa forced inclusion przez L1. Poza tym safe oznacza bezpieczny względem łańcucha L1 w jego obecnym kształcie: reorg na L1 resetuje pipeline i może cofnąć safe head na L2, natomiast finalized cofnąć się nie może. `--verifier.l1-confs` trzyma węzeł o ustaloną liczbę bloków L1 za head, żeby uniknąć tych przetasowań, kosztem późniejszego safe head."
        ]
      },
      {
        heading: "Czego węzeł potrzebuje do derywacji",
        paragraphs: [
          "`op-node` przyjmuje `--l1`, czyli endpoint wykonawczy L1, z którego czyta bloki i receipty metodą wybraną przez `--l1.rpckind` (`eth_getBlockReceipts` dla `standard`) i sprawdza je względem nagłówków bloków, chyba że ustawiono `--l1.trustrpc`; `--l1.beacon`, czyli endpoint [[beacon-api|Beacon API]] do pobierania zawartości blobów; oraz `--l2` z `--l2.jwt-secret` dla Engine API klienta wykonawczego. Węzły beacon trzymają bloby przez około 18 dni, więc ponowna derywacja starszych bloków wymaga `--l1.beacon-fallbacks` wskazującego na [[blob-archive|archiwum blobów]]. Domyślny tryb `--syncmode=consensus-layer` odtwarza każdy blok z L1; `execution-layer` pozwala klientowi wykonawczemu wykonać [[snap-sync|snap sync]] od peerów i dopiero od tego miejsca prowadzi derywację.",
          "`op-node` udostępnia własną [[namespaces|przestrzeń nazw]] `optimism_`, domyślnie na porcie 9545. `optimism_syncStatus` zwraca jego widok L1 (`current_l1`, `head_l1`, `safe_l1`, `finalized_l1`) obok trzech headów L2, `optimism_outputAtBlock` zwraca output root dla bloku L2, a przy ustawionym `--safedb.path` metoda `optimism_safeHeadAtL1Block` zwraca safe head osiągnięty przy danym bloku L1, z czego korzysta [[op-challenger|op-challenger]]. I właśnie o to w tej architekturze chodzi: każdy, kto ma węzeł L1, endpoint beacon i to oprogramowanie, może przeliczyć łańcuch od nowa, więc słowo sekwencera liczy się tylko dla bloków, których L1 jeszcze nie widziało; zobacz [[optimistic-rollup|optimistic rollupy]]."
        ]
      }
    ],
    example: {
      title: "optimism_syncStatus w op-node (skrócone)",
      note: "Liczby są tu zwykłymi liczbami dziesiętnymi JSON, a nie hex; `unsafe_l2` to blok, który zwraca `latest` w kliencie wykonawczym, a `finalized_l2` jest za nim o czas finalności L1 plus odstęp między batchami."
    },
    pitfalls: [
      "Czytanie wysokości z `optimism_syncStatus` jako ciągów hex; referencje bloków zawierają dziesiętne liczby JSON.",
      "Ponowna synchronizacja starego łańcucha z L1 przy samym zwykłym endpoincie beacon; zatrzyma się na pierwszym batchu, którego bloby już wygasły.",
      "Ustawienie `--l1.trustrpc` przy zewnętrznym providerze L1; wyłącza to sprawdzanie pobranych receiptów względem nagłówka bloku.",
      "Traktowanie `latest` repliki jako bloku już odtworzonego; dopóki jego batch nie trafi na L1, to tylko blok rozgłoszony przez sekwencer i może zostać zastąpiony."
    ]
  },
  validium: {
    title: "Validium",
    aliases: [
      "validium",
      "optimium",
      "volition",
      "data availability committee",
      "DAC",
      "komitet dostępności danych",
      "AnyTrust",
      "Alt-DA",
      "off-chain data availability"
    ],
    summary: "Validium to L2, które rozlicza się na Ethereum [[validity-proof|validity proofami]], ale trzyma dane transakcji poza Ethereum, u komitetu albo w zewnętrznej sieci DA. Użytkownicy mogą odtworzyć stan i wyjść z łańcucha tylko tak długo, jak ta strona udostępnia dane.",
    sections: [
      {
        heading: "Dowody na Ethereum, dane gdzie indziej",
        paragraphs: [
          "[[zk-rollup|ZK rollup]] publikuje na Ethereum dwie rzeczy: validity proof dla każdego batcha i dane, które za nim stoją. Validium publikuje tylko pierwszą z nich, razem z commitmentem stanu i, jeśli korzysta z komitetu, podpisanym przez komitet poświadczeniem, że ma dane. Kontrakt weryfikujący nadal odrzuca każde przejście, które nie wynika z poprzedniego stanu, więc operator nie może przenieść środków, które do niego nie należą. Może za to zatrzymać dane. Bez nich nikt inny nie wyliczy aktualnych sald ani nie zbuduje dowodu Merkle, którego kontrakt na L1 wymaga przed wydaniem środków przy wyjściu z łańcucha (exit), więc środki zostają zamrożone, a nie skradzione; zobacz [[data-availability|dostępność danych]].",
          "Dane leżą u komitetu dostępności danych (data availability committee), czyli znanego zbioru członków, z których każdy podpisuje, że je przechowuje; w zewnętrznej sieci DA, takiej jak Celestia, EigenDA albo Avail, która wnosi własne założenia bezpieczeństwa; albo u dostawców z kaucją, których za zatajanie danych można ukarać slashingiem. StarkEx przyjmuje aktualizację stanu validium tylko wtedy, gdy podpisało ją kworum komitetu. Volition pozwala użytkownikom wybierać, osobno dla każdego aktywa albo każdej transakcji, między danymi on-chain a off-chain w tym samym systemie; taki tryb volition oferuje StarkEx. L2BEAT, który klasyfikuje [[rollup|L2]] według tych właściwości, rezerwuje słowo „rollup” dla łańcuchów, których dane są na Ethereum."
        ]
      },
      {
        heading: "Optimium: fraud proofy bez danych",
        paragraphs: [
          "Wersja optymistyczna jest jeszcze słabsza, bo bez danych nie da się nawet zbudować [[fraud-proof|fraud proofa]]: jeśli dane są zatajone, błędny state root przechodzi przez challenge window bez sprzeciwu. L2BEAT nazywa takie łańcuchy optimium. Najbardziej znanym projektem jest Arbitrum AnyTrust, na którym działa Arbitrum Nova. Komitet z N członków, któremu ufa się przy założeniu, że co najmniej dwóch członków jest uczciwych, podpisuje Data Availability Certificate, czyli hash danych, czas wygaśnięcia i podpisy BLS od N−1 członków, a sekwencer publikuje ten certyfikat na L1 zamiast batcha. Jeśli w ciągu kilku minut nie zbierze wystarczającej liczby podpisów, wraca do publikowania pełnych danych na L1.",
          "Tryb Alt-DA w OP Stack idzie na ten sam kompromis. Batcher publikuje na L1 tylko input commitment, czyli albo `keccak256` z danych, albo commitment usługi DA zdefiniowany przez zewnętrzną warstwę, a same dane trzyma za serwerem DA ze ścieżkami `/put` i `/get/<commitment>`; `op-node` działa z `--altda.enabled` i `--altda.da-server` i podczas [[derivation-pipeline|wyprowadzania łańcucha]] rozwiązuje każdy commitment przez ten serwer. Kontrakt `DataAvailabilityChallenge` pozwala każdemu zakwestionować commitment keccak, co wymusza opublikowanie danych na L1 w ramach okna na rozstrzygnięcie (resolve window) albo sprawia, że wyprowadzanie łańcucha pomija ten input, a finalność czeka na koniec challenge window. Commitmentów usług DA nie da się rozstrzygnąć przez ten kontrakt."
        ]
      },
      {
        heading: "Co się zmienia dla węzłów i klientów RPC",
        paragraphs: [
          "Interfejs [[json-rpc|JSON-RPC]] jest nie do odróżnienia od interfejsu rollupu: te same metody `eth_`, te same receipty, często to samo oprogramowanie klienta. Różnica leży w tym, czego potrzeba do odtworzenia łańcucha. Węzeł rollupu synchronizuje się od nowa z węzła L1, endpointu beacon i, dla starych bloków, [[blob-archive|archiwum blobów]]. Węzeł validium albo optimium potrzebuje dodatkowo serwerów komitetu, sieci DA albo serwera Alt-DA, a jeśli te przestaną odpowiadać, wyprowadzanie łańcucha staje, choć L1 działa bez zarzutu. [[indexer|Indeksery]] i [[block-explorer|eksploratory bloków]], które planowały uzupełnić historię wyłącznie z L1, w miejscu transakcji znajdują commitmenty i certyfikaty.",
          "Kto ocenia ryzyko, czy to [[bridge|bridge]], custodian, czy dashboard, nie dowie się z endpointów łańcucha, jakiego jest on rodzaju: [[chain-id|eth_chainId]] i zestaw metod wyglądają tak samo w każdym przypadku. Odpowiedź jest w kontraktach łańcucha na L1 i w formacie batchy albo w klasyfikatorze takim jak L2BEAT. Dopóki węzły operatora odpowiadają, dowód wypłaty zbudowany przez [[eth-get-proof|eth_getProof]] działa dokładnie tak samo jak w rollupie; założenie o komitecie ma znaczenie dopiero w dniu, w którym te węzły przestaną odpowiadać."
        ]
      }
    ],
    pitfalls: [
      "Nazywanie łańcucha rollupem, bo publikuje validity proofy na Ethereum; dowód obejmuje poprawność, a dane nadal mogą zostać zatajone.",
      "Planowanie ponownej synchronizacji validium albo łańcucha Alt-DA wyłącznie z archiwum L1; wyprowadzanie łańcucha potrzebuje też źródła danych off-chain.",
      "Traktowanie opublikowanego Data Availability Certificate jak samych danych; to podpisane zapewnienie, że członkowie komitetu je mają.",
      "Zakładanie, że kontrakt challenge w Alt-DA chroni każdy typ commitmentu; rozstrzyga on tylko commitmenty keccak."
    ]
  },
  "op-challenger": {
    title: "op-challenger",
    aliases: [
      "op-challenger",
      "fault dispute game",
      "DisputeGameFactory",
      "cannon-kona",
      "kona-host",
      "op-dispute-mon",
      "safedb",
      "dispute bond",
      "kaucja w sporze"
    ],
    summary: "op-challenger to agent OP Stack, który obserwuje fabrykę dispute game na L1, porównuje każdy zgłoszony output root z tym, co wyprowadza jego własny węzeł rollupu, i rozgrywa [[fraud-proof|fault dispute game]] przeciwko błędnym twierdzeniom. Potrzebuje do tego czterech endpointów RPC, maszyny wirtualnej do fault proofów i węzła L2, który udostępnia historyczny stan.",
    sections: [
      {
        heading: "Propozycje to gry",
        paragraphs: [
          "W łańcuchu OP Stack z fault proofami każde twierdzenie o stanie jest grą. Proposer tworzy ją przez kontrakt `DisputeGameFactory` na L1, wpłacając kaucję (bond) i root claim: output root, który według niego odpowiada danemu numerowi bloku L2. op-challenger to usługa, dzięki której założenie o uczciwym challengerze z [[optimistic-rollup|optimistic rollupów]] działa w praktyce. Śledzi w fabryce gry mieszczące się w `--game-window`, dla każdego zgłoszonego bloku wylicza poprawny output root przez `optimism_outputAtBlock` na własnym węźle rollupu i działa: atakuje twierdzenia, które się nie zgadzają, broni tych, które się zgadzają, rozstrzyga zakończone gry i odbiera swoje kaucje. Każdy ruch to transakcja na L1, więc challenger działa z kluczem, na którym są środki.",
          "Gra przeprowadza bisekcję dwukrotnie. Powyżej split depth (głębokości podziału) gracze spierają się o output rooty dla zakresów bloków, a poniżej o trace wykonania programu fault proof, który wyprowadza i wykonuje jeden blok. Na maksymalnej głębokości jedna instrukcja jest wykonywana na L1 przez Cannon, kontrakt emulatora MIPS, z danymi wejściowymi z `PreimageOracle`. Żeby w ogóle tworzyć commitmenty do trace, op-challenger sam uruchamia ten program: klienta Kona skompilowanego do MIPS w binarce `cannon`, a preimage'e udostępnia mu `kona-host`. To typ gry `cannon-kona`, wybierany przez `--game-types` (dawniej `--trace-type`) obok `cannon` i `permissioned`, a challenger odrzuca gry, których absolute prestate nie zgadza się z `--cannon-kona-prestate`. Kaucje rosną z głębokością i są trzymane w `DelayedWETH`, dopóki nie zostaną odebrane po rozstrzygnięciu gry i upływie opóźnienia wypłaty."
        ]
      },
      {
        heading: "Cztery endpointy, każdy z wymaganiami",
        paragraphs: [
          "`--l1-eth-rpc` to endpoint wykonawczy L1, który przyjmuje wiele odczytów i wszystkie transakcje challengera; host programu ładuje też przez niego nagłówki i receipty L1 metodami `debug_getRawHeader` i `debug_getRawReceipts`, więc [[debug-api|przestrzeń nazw debug_]] musi być dostępna. `--l1-beacon` to endpoint [[beacon-api|Beacon API]] dla blobów z danymi batchy, a gry o bloki starsze niż około 18 dni wymagają endpointu, za którym stoi [[blob-archive|archiwum blobów]]. `--rollup-rpc` to `op-node`, który musi udostępniać output rooty dla bloków tak starych jak rozgrywane gry, więc jego klient wykonawczy musi nadal mieć ten stan.",
          "`--l2-eth-rpc` jest najbardziej wymagający: to endpoint wykonawczy L2 z włączonymi `eth` i `debug`. Host pobiera z niego [[witness|execution witness]] każdego bloku przez `debug_executePayload` z op-reth, w razie potrzeby sięga przez `debug_dbGet` po pojedyncze trie node'y i bytecode według hasha, a [[eth-get-proof|eth_getProof]] wywołuje w uzgodnionym bloku początkowym, także po storage root `L2ToL1MessagePasser`, którego potrzebuje do odtworzenia output rootu. Dokumentacja OP zaleca więc [[archive-node|węzeł archiwalny]] op-reth z włączonym magazynem historycznych dowodów (`--proofs-history`), o rozmiarze wystarczającym na okno sporu co najmniej 28 dni. Pruned node albo endpoint [[rpc-provider|providera]] bez `debug_` nie może brać udziału w grze."
        ]
      },
      {
        heading: "Baza safe head",
        paragraphs: [
          "Każda gra zapisuje head L1 z chwili utworzenia, a uczciwa odpowiedź dla bloku N to tylko to, co dało się wyprowadzić z danych L1 do tego bloku L1; bloku, którego batch pojawił się później, nie da się jeszcze bronić. op-challenger pilnuje tego, wywołując `optimism_safeHeadAtL1Block` na swoim węźle rollupu i ograniczając blok, o który się spiera, do zwróconego safe head. Metodę obsługuje baza safe head w op-node, włączana przez `--safedb.path`, która w miarę postępu [[derivation-pipeline|derivation pipeline]] zapisuje safe head L2 osiągnięty przy każdym bloku L1. Bez tej flagi nic nie jest zapisywane, a baza nie odpowie dla bloków L1 sprzed swojego uruchomienia.",
          "Ponieważ baza zapisuje historię wyprowadzania łańcucha na tym konkretnym węźle, nie są to zwykłe dane łańcucha. Dokumentacja mówi, żeby nigdy nie odtwarzać jej ze [[database-snapshot|snapshotu]]: baza niezgodna z L1 sprawi, że challenger będzie działał na podstawie złego safe head i może zaatakować prawidłowe outputy. Monitoring to osobna usługa, `op-dispute-mon`, która przyjmuje endpoint L1, endpoint rollupu i adres fabryki i raportuje status gier z ostatnich 28 dni, żeby operator dowiedział się o grze idącej w złą stronę, póki na zegarze gry zostało jeszcze dość czasu na odpowiedź."
        ]
      }
    ],
    example: {
      title: "Challenger i węzeł rollupu, od którego zależy",
      note: "Parametr to numer bloku L1 w hex, ale wynik zawiera liczby dziesiętne; jeśli `--safedb.path` nigdy nie zostało ustawione, wywołanie kończy się błędem, a challenger nie może ograniczyć swoich twierdzeń."
    },
    pitfalls: [
      "Kierowanie `--l2-eth-rpc` na pruned albo hostowany endpoint L2; host programu potrzebuje metod debug i historycznych dowodów, których takie endpointy rzadko udostępniają.",
      "Odtwarzanie bazy safe head węzła rollupu ze snapshotu, przez co challenger traci zgodność z tym, co L1 faktycznie uczyniło już safe.",
      "Aktualizacja obejmująca zmianę prestate bez zmiany `--cannon-kona-prestate`, przez co challenger odrzuca każdą grę z nowym prestate.",
      "Używanie providera L1, który blokuje `debug_getRawHeader` i `debug_getRawReceipts`, choć host programu wywołuje je, żeby ładować nagłówki i receipty L1.",
      "Zakładanie, że kaucje wracają same; leżą w `DelayedWETH`, dopóki ktoś ich nie odbierze, a op-challenger robi to tylko dla własnego adresu nadawcy i adresów z `--additional-bond-claimants`."
    ]
  },
  "blob-archive": {
    title: "Archiwum blobów",
    aliases: [
      "blob archive",
      "blob archiver",
      "historical blobs",
      "historyczne bloby",
      "blob retention",
      "przechowywanie blobów",
      "supernode",
      "Blobscan",
      "prune-blobs",
      "l1.beacon-fallbacks",
      "/eth/v1/beacon/blobs"
    ],
    summary: "Archiwum blobów przechowuje dane [[blob|blobów]] dłużej niż okres przechowywania w warstwie konsensusu, który wynosi 4096 epok, czyli około 18 dni, i udostępnia je przez endpointy [[beacon-api|Beacon API]]. Dzięki temu węzły rollupów, provery i eksploratory mogą pobrać dane batchy, które zwykłe beacon node'y już usunęły.",
    sections: [
      {
        heading: "Po co archiwizować bloby",
        paragraphs: [
          "Od Deneb reguły konsensusu zobowiązują beacon node'y do udostępniania danych blobów przez 4096 epok i pozwalają im potem je usunąć, a blok [[execution-layer|wykonawczy]] na zawsze przechowuje tylko versioned hashe. Wiele zadań potrzebuje jednak treści później: węzeł rollupu, który ponownie przechodzi [[derivation-pipeline|derivation pipeline]] od genesis, [[op-challenger|op-challenger]] kwestionujący stary blok, węzeł Arbitrum synchronizujący się od zera, eksplorator albo zadanie analityczne. Okres przechowywania jest parametrem sieci, a nie prawem natury: Gnosis Chain trzyma 16 384 swoich 80-sekundowych epok, czyli mniej więcej 15 dni.",
          "PeerDAS, działający od Fusaka, zmienił to, co trzyma beacon node. Bloby każdego bloku są rozszerzane do 128 kolumn, a węzeł zamiast każdego bloba przechowuje (custody) co najmniej 4 grupy custody, więcej, jeśli obsługuje walidatorów. Kolumny są udostępniane przez ten sam okres 4096 epok, a stare żądanie blobów po zakresie (by-range) jest przestarzałe. Węzeł, który ma co najmniej połowę kolumn, może odtworzyć resztę, a Beacon API mówi, że po Fulu zwracać bloby muszą tylko supernode'y, które przechowują wszystkie kolumny. Archiwum musi więc teraz trzymać pełne dane i ich nie usuwać. Musi też wystartować na czas: kiedy sieć usunie dany zakres, żaden peer nie ma obowiązku go udostępniać, więc archiwum uruchomione za późno nie uzupełni go wstecz (backfill) z sieci p2p."
        ]
      },
      {
        heading: "Sposoby przechowywania",
        paragraphs: [
          "Pierwszy to [[beacon-node|beacon node]], któremu zabroniono usuwania danych, z zakresem custody na tyle szerokim, żeby mógł odtwarzać bloby. [[lighthouse|Lighthouse]] ma `--prune-blobs false` i `--blob-prune-margin-epochs` oraz `--supernode` albo `--semi-supernode`; [[prysm|Prysm]] ma `--blob-retention-epochs`, którego nie pozwala ustawić poniżej 4096, oraz `--supernode` albo `--semi-supernode`; [[lodestar|Lodestar]] ma `--chain.archiveDataEpochs` z `--supernode` albo `--semiSupernode`. Inni klienci mają własne opcje. Zajętość dysku rośnie wtedy z każdym kiedykolwiek opublikowanym blobem, a limity blobów rosną z każdym forkiem zmieniającym parametry blobów.",
          "Drugi to samodzielny archiver. `blob-archiver` od Base uruchamia proces archivera, który śledzi beacon node i zapisuje bloby na dysk albo do S3, oraz proces API, który obsługuje `/eth/v1/beacon/blob_sidecars/{id}` i `/eth/v1/beacon/blobs/{id}`, więc można go wstawić wszędzie tam, gdzie oczekiwany jest URL beacon node'a; jego README zaznacza, że nie weryfikuje tego, co dostał od beacon node'a. Blobscan indeksuje transakcje blobowe do przeglądania i udostępnia API, a kilku dostawców usług beacon sprzedaje endpointy z historycznymi blobami. Wszystko to są serwisy [[historical-data|danych historycznych]] z tym samym pytaniem w tle: czy odpowiedź da się sprawdzić?"
        ]
      },
      {
        heading: "Podłączenie węzła do archiwum i dlaczego nie trzeba mu ufać",
        paragraphs: [
          "`op-node` przyjmuje archiwum jako `--l1.beacon-fallbacks` (starsza nazwa: `--l1.beacon-archiver`) i odpytuje je, gdy pod `--l1.beacon` brakuje bloba. Nitro ma `--parent-chain.blob-client.secondary-beacon-url` oraz `--parent-chain.blob-client.blob-directory`, żeby trzymać każdy pobrany blob na lokalnym dysku. Aktualne wydania op-node pobierają `/eth/v1/beacon/blobs/{block_id}` z parametrem zapytania `versioned_hashes`: to ścieżka, którą [[beacon-endpoints|Beacon API]] v4.0.0 dodało dla Fulu, oznaczając jednocześnie jako przestarzały `/eth/v1/beacon/blob_sidecars/{block_id}`, którego w wersjach roboczych kolejnego wydania głównego (major) już nie ma. Archiwum, które obsługuje tylko starą ścieżkę, przestaje działać jako fallback.",
          "Archiwum nie może podrobić danych. Blob jednoznacznie wyznacza swój commitment KZG, a versioned hash w transakcji typu `0x3` to `0x01`, po którym następuje 31 ostatnich bajtów `sha256` z tego commitmentu. Klient przelicza commitment z otrzymanych bajtów i porównuje hash z tym z bloku wykonawczego, któremu ufa; op-node robi dokładnie to i odrzuca każdą niezgodność. Archiwum może więc dane zgubić albo odmówić ich wydania, ale nie może ich podmienić, pod warunkiem że versioned hash pochodzi z kopii transakcji na własnym węźle, pobranej przez [[eth-get-transaction-by-hash|eth_getTransactionByHash]], a nie z odpowiedzi archiwum."
        ]
      }
    ],
    example: {
      title: "Pobieranie wygasłego bloba z archiwum po versioned hashu",
      note: "Zanim użyje się tych 131072 bajtów, trzeba przeliczyć ich commitment KZG i sprawdzić, czy jego hash to versioned hash z własnego węzła; właśnie ta weryfikacja sprawia, że archiwum nie musi być zaufane."
    },
    pitfalls: [
      "Stawianie archiwum dopiero wtedy, gdy jest potrzebne; zakresów, które sieć już usunęła, nie da się uzupełnić wstecz od peerów.",
      "Uruchamianie po Fusaka archiwizującego beacon node'a bez custody na poziomie supernode albo semi-supernode; zachowa on na zawsze swoje kolumny, ale nie zwróci całych blobów.",
      "Kierowanie aktualnego op-node na archiwum, które obsługuje tylko przestarzałą ścieżkę `blob_sidecars`, przez co fallback zawodzi przy każdym żądaniu.",
      "Używanie bloba z archiwum bez przeliczenia jego commitmentu i porównania z versioned hashem z własnego węzła.",
      "Planowanie dysku archiwum na podstawie dzisiejszego tempa przyrostu blobów; każdy fork zmieniający parametry blobów zwiększa ilość danych, którą może nieść blok."
    ]
  },
  peerdas: {
    title: "PeerDAS",
    aliases: [
      "PeerDAS",
      "EIP-7594",
      "data availability sampling",
      "próbkowanie dostępności danych",
      "data column sidecar",
      "kolumny danych",
      "custody groups",
      "grupy custody",
      "supernode",
      "semi-supernode",
      "cell KZG proofs",
      "dowody komórek",
      "Fulu"
    ],
    summary: "PeerDAS (peer data availability sampling, czyli próbkowanie dostępności danych przez peery), wprowadzony przez EIP-7594 w aktualizacji Fusaka, sprawia, że każdy [[beacon-node|beacon node]] pobiera i przechowuje tylko część kolumn danych [[blob|blobów]] zakodowanych z nadmiarem (erasure coding), a nie każdy blob. Sieć jako całość nadal sprawdza w ten sposób [[data-availability|dostępność danych]], choć żaden zwykły węzeł nie trzyma całych blobów.",
    sections: [
      {
        heading: "Od blobów do kolumn",
        paragraphs: [
          "Przed Fusaka, [[hardfork|aktualizacją sieci]] z grudnia 2025 roku złożoną z forka konsensusu Fulu i forka wykonawczego Osaka, każdy beacon node pobierał każdy blob, więc każdy dodatkowy blob w bloku kosztował każdy węzeł więcej pasma. PeerDAS dzieli tę pracę. Najpierw każdy blob, czyli 4096 elementów ciała (field elements) po 32 bajty, jest podwajany do 8192 elementów ciała kodowaniem nadmiarowym Reeda-Solomona (erasure coding). Podobnie jak macierz RAID przetrwa utratę dysku, dowolna połowa rozszerzonych danych wystarcza, żeby odtworzyć całość. Rozszerzony blob jest następnie cięty na 128 komórek (cells) po 64 elementy ciała, każda o rozmiarze 2048 bajtów. Gdy bloby bloku ułoży się jako wiersze, komórki tworzą 128 kolumn: kolumna 37 to komórka 37 każdego bloba w bloku.",
          "Każda kolumna krąży we własnej [[libp2p-gossip|podsieci gossip]] jako `DataColumnSidecar`. Zawiera komórki kolumny, dla każdej komórki 48-bajtowy dowód KZG na to, że należy ona do swojego bloba, oraz to, względem czego te dowody się sprawdza: commitment KZG każdego bloba, czyli 48-bajtowy odcisk jego danych wymieniony w bloku, a do tego podpisany nagłówek bloku i dowód Merkle, który wiąże jedno z drugim. Dzięki temu węzeł może sprawdzić jedną kolumnę, nie widząc żadnej innej. Od stycznia 2026 roku mainnet dopuszcza do 21 blobów w bloku; w takim bloku jedna kolumna zawiera 43 008 bajtów komórek, czyli jedną sześćdziesiątą czwartą z 2 752 512 bajtów blobów."
        ]
      },
      {
        heading: "Custody, próbkowanie i supernode'y",
        paragraphs: [
          "Custody (przechowywanie, za które węzeł odpowiada) oznacza pobranie kolumny, trzymanie jej przez 4096 [[slot-epoch|epok]] po 6,4 minuty, czyli około 18 dni, i udostępnianie jej peerom. Specyfikacja liczy custody w grupach (custody groups), a na mainnecie każda grupa to jedna kolumna. Każdy węzeł przechowuje co najmniej 4 grupy, wybrane przez `get_custody_groups` na podstawie jego node id, więc każdy peer może wyliczyć, które kolumny powinien mieć inny węzeł. Gdy do węzła są podłączeni [[validator|walidatorzy]], przechowuje on jedną grupę na każde 32 ETH ich efektywnego salda, od 8 do 128: jeden walidator z 32 ETH oznacza 8 grup, jeden walidator z 2048 ETH (największe efektywne saldo od Pectra) oznacza 64, a 4096 ETH lub więcej czyni z węzła supernode, który przechowuje wszystkie 128. Węzeł ogłasza tę liczbę jako `cgc` w swoim [[discovery|ENR]], czyli podpisanym rekordzie, po którym znajdują go peery, oraz jako `custody_group_count` w metadanych zwracanych przez `/eth/v1/node/identity`.",
          "Próbkowanie (sampling) to sposób, w jaki węzeł ustala, że dane bloku zostały opublikowane. W każdym slocie pobiera co najmniej 8 grup albo, jeśli przechowuje ich więcej, wszystkie swoje grupy custody, i uznaje blok za dostępny dopiero wtedy, gdy dotrze każda z tych kolumn. To wystarcza, bo publikujący, który ukrywa dane, musi zataić ponad połowę kolumn, skoro dowolne 64 pozwalają odtworzyć resztę, a wtedy osiem kolumn węzła prawie na pewno obejmie którąś z brakujących. Węzeł, który ma 64 kolumny lub więcej, może odtworzyć całą macierz i powinien wtedy rozgłaszać brakujące kolumny dalej. Tryb `--semi-supernode` w [[lighthouse|Lighthouse]] i [[prysm|Prysm]], a w [[lodestar|Lodestar]] `--semiSupernode`, trzyma dokładnie te 64."
        ]
      },
      {
        heading: "Co zmieniło się dla wywołujących RPC",
        paragraphs: [
          "Najpierw zmieniło się wysyłanie blobów. [[eth-send-raw-transaction|eth_sendRawTransaction]] przyjmuje transakcję blobową (typu `0x3`) w jej opakowaniu sieciowym (network wrapper), które niesie bloby i ich dowody obok podpisanej transakcji; od Osaka ma ono postać `rlp([tx_payload_body, wrapper_version, blobs, commitments, cell_proofs])` z `wrapper_version` równym 1. Zamiast jednego dowodu na blob zawiera 128 dowodów komórek (cell proofs) na każdy blob, czyli 768 dla transakcji z największą dozwoloną liczbą 6 blobów. Oblicza je nadawca, bo ich obliczenie jest kosztowne, a sprawdzenie tanie. [[geth|Geth]] nadal konwertuje opakowanie w starym stylu, sam obliczając dowody komórek, ale to rozwiązanie tymczasowe, które jego kod źródłowy oznacza do usunięcia; inne węzły i dostawcy RPC mogą takie opakowanie po prostu odrzucić.",
          "Potem zmienił się odczyt blobów. Opis endpointu `/eth/v1/beacon/blobs/{block_id}` w [[beacon-endpoints|Beacon API]] mówi teraz, że bloby muszą zwracać tylko supernode'y, a pozostałe węzły mogą je odtworzyć. Węzeł, który ma mniej niż 64 kolumny, może więc nie obsłużyć tego żądania nawet w 18-dniowym okresie przechowywania: Lighthouse odpowiada wtedy kodem 400 z komunikatem `Insufficient data columns to reconstruct blobs`, a inni klienci formułują to inaczej. `/eth/v1/debug/beacon/data_column_sidecars/{block_id}` zwraca tylko kolumny, które węzeł przechowuje.",
          "Wewnątrz węzła, w [[engine-payload|Engine API]], `engine_getPayloadV5` zwraca 128 dowodów komórek na każdy blob, a `engine_getBlobsV2` i `engine_getBlobsV3` pozwalają klientowi konsensusu zbudować kolumny z blobów, które jego klient wykonawczy ma już w [[mempool|mempoolu]], zamiast czekać na gossip. V2 zwraca albo wszystkie żądane bloby, albo `null`; V3 dopuszcza odpowiedzi częściowe."
        ]
      }
    ],
    example: {
      title: "Jeden blok z 21 blobami widziany przez węzeł Lighthouse z jednym walidatorem 32 ETH",
      note: "Każda liczba wynika ze stałych Fulu: 128 kolumn, minimum custody 4 grupy albo 8 z walidatorami, 8 próbek na slot i odtwarzanie z połowy kolumn. Odpowiedź 400 z tym komunikatem to wersja Lighthouse; inni klienci zgłaszają błąd inaczej."
    },
    pitfalls: [
      "Kierowanie pobierania blobów przez węzeł rollupu do zwykłego beacon node'a i odczytywanie jego błędów jako braku danych, podczas gdy do zwracania całych blobów przygotowane są tylko supernode, semi-supernode albo [[blob-archive|archiwum blobów]].",
      "Planowanie zasobów hosta walidatora pod minimum 4 grup, podczas gdy węzeł z walidatorami przechowuje co najmniej 8 grup, a 64 już wtedy, gdy podłączony jest jeden walidator z 2048 ETH.",
      "Podpisywanie transakcji blobowych biblioteką sprzed Osaka, która dołącza jeden dowód na blob; niektóre endpointy takie transakcje odrzucają, a konwertuje je tylko część."
    ]
  },
  "cross-chain-relayer": {
    title: "Relayery wiadomości cross-chain",
    aliases: [
      "relayer",
      "relayer Hyperlane",
      "DVN LayerZero",
      "executor LayerZero",
      "guardian Wormhole",
      "VAA",
      "relayer Across",
      "Chainlink CCIP"
    ],
    summary: "Relayer wiadomości cross-chain to program off-chain, który przenosi wiadomość między łańcuchami, które się nawzajem nie widzą: obserwuje łańcuch źródłowy, czeka, aż usunięcie wiadomości przez [[reorg|reorg]] stanie się mało prawdopodobne, zdobywa dowód, którego wymaga kontrakt docelowy, i dostarcza go tam, płacąc za gas na łańcuchu docelowym. Według tego wzorca działają [[bridge|bridge'e]] przesyłające wiadomości.",
    sections: [
      {
        heading: "Jeden wzorzec w protokołach przesyłania wiadomości",
        paragraphs: [
          "Kontrakt może czytać tylko własny łańcuch. Nic na Arbitrum nie dowie się, że tokeny zostały zablokowane na Base, chyba że ktoś wyśle na Arbitrum transakcję, która to mówi, z dowodem, który tamtejszy kontrakt może sprawdzić. Protokoły przesyłania wiadomości między łańcuchami robią to programami off-chain w pięciu krokach. Obserwacja (watch): indeksowanie eventów z wiadomościami na łańcuchu źródłowym przez [[eth-get-logs|eth_getLogs]]. Czekanie (wait): wstrzymanie się, aż usunięcie bloku źródłowego przez reorg stanie się mało prawdopodobne. Dowód (prove): zebranie dowodów, które akceptuje łańcuch docelowy, zwykle podpisów od attesterów, czyli stron, z których każda obserwuje łańcuch źródłowy i poręcza za to, co widziała. Dostarczenie (deliver): wysłanie na łańcuchu docelowym transakcji, która wykonuje wiadomość, gdy dowody są już gotowe. Płatność (pay): dostarczający wydaje gas na łańcuchu docelowym, a w Hyperlane, LayerZero i CCIP nadawca płaci za niego z góry na łańcuchu źródłowym.",
          "Nazwy się różnią. Attesterami są walidatorzy w Hyperlane; DVN-y (decentralised verifier networks) w LayerZero, które same zapisują swoją weryfikację na łańcuchu docelowym; 19 guardianów w Wormhole, z których podpisy 13 tworzą VAA (verified action approval); oraz komitet operatorów węzłów w Chainlink CCIP. Dostarczającymi są relayery w Hyperlane i executory w pozostałych trzech protokołach. Wszystkie cztery pozwalają każdemu dostarczyć udowodnioną wiadomość, więc bezpieczeństwo tkwi w dowodzie: dostarczający może co najwyżej opóźnić wiadomość, ale nigdy jej nie sfałszuje. CCIP nie ma nic wspólnego z [[ccip-read|CCIP-Read]]."
        ]
      },
      {
        heading: "Obserwacja i czekanie na łańcuchu źródłowym",
        paragraphs: [
          "Obserwacja to indeksowanie eventów. W Hyperlane relayer indeksuje na każdym łańcuchu źródłowym eventy `Dispatch` z Mailboxa, czyli kontraktu, który wysyła i odbiera wiadomości, eventy `GasPayment` z gas paymastera, czyli kontraktu, który pobiera opłaty za dostarczenie, oraz wstawienia do MerkleTreeHook, który dodaje każdą wiadomość do [[inclusion-proof|drzewa Merkle]], czyli drzewa hashy, którego root jest commitmentem do każdego wpisu. Relayer wywołuje eth_getLogs w oknach po `index.chunk` bloków, domyślnie 1999, co mieści się w typowych limitach zakresu 2000 bloków. Przestój zamienia się w nadrabianie każdego pominiętego bloku, a to wymaga endpointu, który wciąż ma te receipty; zobacz [[cursor-pagination|paginację zakresem]].",
          "Czekanie zapobiega podwójnemu wydaniu (double spend): jeśli wiadomość zostanie dostarczona, a jej transakcja źródłowa potem zniknie w reorgu, na łańcuchu docelowym pojawią się tokeny za zablokowanie albo spalenie, które nigdy nie nastąpiło. Dlatego walidatorzy Hyperlane podpisują drzewo tylko w takiej postaci, jaką miało `reorgPeriod` bloków poniżej heada, a tę wartość ustawia się osobno dla każdego łańcucha: 15 bloków na Ethereum, 10 na Base, 5 na Arbitrum i `finalized` na Polygonie. CCIP domyślnie czeka na pełną [[finality|finalność]] łańcucha źródłowego. W Wormhole kontrakt wysyłający wybiera poziom spójności (consistency level): `200` oznacza tryb natychmiastowy, `201` [[block-tag|blok]] `safe`, a każda inna wartość blok finalized. Po odczekaniu watcher guardianów ponownie odczytuje receipt i porzuca wiadomość jako osieroconą (orphaned), jeśli receiptu już nie ma."
        ]
      },
      {
        heading: "Dowód, dostarczenie, płatność",
        paragraphs: [
          "Po stronie łańcucha docelowego relayer Hyperlane sprawdza, czy transakcja źródłowa zapłaciła gas paymasterowi wystarczająco dużo według własnej polityki opłat. Następnie zbiera dowód, nazywany metadanymi (metadata), którego żąda moduł bezpieczeństwa (security module) odbiorcy, czyli kontrakt docelowy, który ocenia dowody: dla modułu multisig są to podpisy wymaganej liczby walidatorów pod checkpointem drzewa. Symuluje `process(metadata, message)` na docelowym Mailboxie, a potem to wywołanie wysyła. Nieudana próba wraca do kolejki z backoffem, który rośnie od 5 sekund do godzin, a w końcu do dni. Wyścigi są normalne: gdy dwa relayery dostarczają tę samą wiadomość, symulacja albo transakcja przegranego kończy się revertem z `Mailbox: already delivered`.",
          "Jeden relayer obsługuje wiele łańcuchów, często dziesiątki, więc jakość endpointów to właściwie cały produkt. Agenci Hyperlane przyjmują kilka URL-i na łańcuch przez `customRpcUrls`, z `rpcConsensusType` ustawionym na `fallback`, domyślny tryb, który przechodzi do następnego URL-a, gdy provider zawiedzie, albo na `quorum`, tryb, który przy odczytach wymaga zgody większości, ale przy wysyłaniu transakcji już nie; zobacz [[failover|failover]]."
        ]
      },
      {
        heading: "Across: najpierw dostarczenie, potem dowód",
        paragraphs: [
          "Across wykonuje te same kroki w innej kolejności. Użytkownik wywołuje `deposit` na kontrakcie SpokePool łańcucha źródłowego, który blokuje tokeny i emituje `FundsDeposited`. Relayer, który wypatruje tego eventu, wywołuje `fillRelay` na docelowym SpokePool i od razu płaci odbiorcy z własnego kapitału. Dowód przychodzi później: dataworker, czyli agent off-chain z whitelisty protokołu, łączy wypełnienia (fills) w paczkę i proponuje je kontraktowi HubPool na Ethereum, wnosząc kaucję (bond), a po okresie na zgłoszenie sprzeciwu (challenge period) relayer dostaje zwrot środków. Każde wypełnienie jest dopasowywane do swojego depozytu, więc ryzyko reorgu ponosi relayer i sam wybiera, jak długo czekać: za wypełnienie depozytu, który później zniknął w reorgu, relayer nigdy nie dostanie zwrotu. To samo ryzyko wypełnienia ponosi [[intent-solver|solver intencji]]."
        ]
      }
    ],
    example: {
      title: "Jedna wiadomość Hyperlane z Base do Arbitrum",
      note: "Kroki od 2 do 5 to wzorzec obserwacji, czekania, dowodu, dostarczenia i płatności, a każdy z nich działa na zwykłym RPC jednego z dwóch łańcuchów. Czekanie na 10 bloków w kroku 3 to właśnie to, co stoi między reorgiem na Base a podwójnym wydaniem, a krok 6 wymaga osobnego czekania na Arbitrum."
    },
    pitfalls: [
      "Używanie jednej głębokości potwierdzeń na każdym łańcuchu; 15 bloków to trzy minuty na Ethereum, ale około czterech sekund na Arbitrum, a niektóre łańcuchy sygnalizują bezpieczeństwo tylko przez `finalized`; zobacz [[confirmations|potwierdzenia]].",
      "Przesuwanie kursora indeksowania za zakres, dla którego eth_getLogs wróciło puste z węzła, który nie ma już tych receiptów, co po cichu pomija wiadomości.",
      "Uznawanie dostarczenia za zakończone zaraz po wysłaniu; na łańcuchu docelowym może skończyć się revertem albo zniknąć w reorgu, a liczy się tylko receipt, który ma już wymagane potwierdzenia.",
      "Przełączanie endpointów w trakcie skanowania bez ponownego sprawdzenia heada, przez co [[head-lag|opóźniony węzeł]] sprawia, że niedawne wiadomości wyglądają na brakujące albo reorg wygląda na prawdziwy."
    ]
  }
};
